import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

let openaiClient: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Generate an embedding vector for the given text using OpenAI's text-embedding-3-small model.
 * Returns a 1536-dimensional vector.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const openai = getOpenAI();
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}

/**
 * Create searchable content from a blog post by combining relevant text fields.
 * This is the content that will be embedded for semantic search.
 */
export function createSearchableContent(post: {
  title: string;
  excerpt?: string | null;
  content: string;
  ai_summary?: string | null;
  key_takeaways?: string[] | null;
  questions_answered?: string[] | null;
  primary_keyword?: string | null;
  secondary_keywords?: string[] | null;
}): string {
  const parts = [
    post.title,
    post.excerpt,
    post.ai_summary,
    post.primary_keyword,
    post.secondary_keywords?.join(", "),
    post.key_takeaways?.join(" "),
    post.questions_answered?.join(" "),
    // Strip HTML/markdown from content, take first ~3000 chars for embedding
    stripHtmlAndMarkdown(post.content).substring(0, 3000),
  ].filter(Boolean);

  return parts.join("\n\n");
}

/**
 * Create a hash of the searchable content to detect when re-embedding is needed.
 */
export function createContentHash(content: string): string {
  return crypto.createHash("sha256").update(content).digest("hex").substring(0, 16);
}

/**
 * Strip HTML tags and common markdown syntax from text.
 */
function stripHtmlAndMarkdown(text: string): string {
  return text
    // Remove HTML tags
    .replace(/<[^>]*>/g, " ")
    // Remove markdown links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    // Remove markdown images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    // Remove markdown bold/italic
    .replace(/[*_]{1,3}([^*_]+)[*_]{1,3}/g, "$1")
    // Remove markdown headers
    .replace(/^#{1,6}\s+/gm, "")
    // Remove markdown code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Remove inline code
    .replace(/`([^`]+)`/g, "$1")
    // Normalize whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generate and store an embedding for a blog post.
 * Returns true if embedding was created/updated, false if already up-to-date.
 */
export async function embedBlogPost(postId: string): Promise<{
  success: boolean;
  updated: boolean;
  error?: string;
}> {
  const supabase = await createClient();

  // Fetch the post
  const { data: post, error: postError } = await supabase
    .from("sws2026_blog_posts")
    .select("id, title, excerpt, content, ai_summary, key_takeaways, questions_answered, primary_keyword, secondary_keywords")
    .eq("id", postId)
    .single();

  if (postError || !post) {
    return { success: false, updated: false, error: postError?.message || "Post not found" };
  }

  // Create searchable content and hash
  const searchableContent = createSearchableContent(post);
  const contentHash = createContentHash(searchableContent);

  // Check if embedding exists and is up-to-date
  const { data: existingEmbedding } = await supabase
    .from("sws2026_blog_post_embeddings")
    .select("content_hash")
    .eq("post_id", postId)
    .single();

  if (existingEmbedding?.content_hash === contentHash) {
    return { success: true, updated: false };
  }

  // Generate embedding
  const embedding = await generateEmbedding(searchableContent);

  // Upsert embedding
  const { error: upsertError } = await supabase
    .from("sws2026_blog_post_embeddings")
    .upsert({
      post_id: postId,
      embedding: embedding,
      content_hash: contentHash,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "post_id",
    });

  if (upsertError) {
    return { success: false, updated: false, error: upsertError.message };
  }

  return { success: true, updated: true };
}

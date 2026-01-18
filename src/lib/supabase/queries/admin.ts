import { createClient } from "../server";
import type { BlogPostWithRelations, BlogCategory, BlogTag } from "@/types";

export interface PostCounts {
  total: number;
  draft: number;
  published: number;
  scheduled: number;
  archived: number;
}

export async function getPostCounts(): Promise<PostCounts> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("sws2026_blog_posts")
    .select("status");

  const counts: PostCounts = {
    total: 0,
    draft: 0,
    published: 0,
    scheduled: 0,
    archived: 0,
  };

  if (posts) {
    counts.total = posts.length;
    posts.forEach((post) => {
      const status = post.status as keyof Omit<PostCounts, "total">;
      if (status in counts) {
        counts[status]++;
      }
    });
  }

  return counts;
}

export async function getRecentPosts(
  limit: number = 5
): Promise<BlogPostWithRelations[]> {
  const supabase = await createClient();

  const { data: posts } = await supabase
    .from("sws2026_blog_posts")
    .select(
      `
      *,
      author:sws2026_blog_authors(*),
      category:sws2026_blog_categories(*),
      tags:sws2026_blog_post_tags(
        tag:sws2026_blog_tags(*)
      ),
      faqs:sws2026_blog_faqs(*)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!posts) return [];

  return posts.map((post) => ({
    ...post,
    tags: post.tags?.map((t: { tag: BlogTag }) => t.tag) || [],
  })) as BlogPostWithRelations[];
}

export async function getAllPosts(options?: {
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ posts: BlogPostWithRelations[]; total: number }> {
  const supabase = await createClient();
  const { status, limit = 20, offset = 0 } = options || {};

  let query = supabase
    .from("sws2026_blog_posts")
    .select(
      `
      *,
      author:sws2026_blog_authors(*),
      category:sws2026_blog_categories(*),
      tags:sws2026_blog_post_tags(
        tag:sws2026_blog_tags(*)
      ),
      faqs:sws2026_blog_faqs(*)
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data: posts, count } = await query;

  if (!posts) return { posts: [], total: 0 };

  const formattedPosts = posts.map((post) => ({
    ...post,
    tags: post.tags?.map((t: { tag: BlogTag }) => t.tag) || [],
  })) as BlogPostWithRelations[];

  return { posts: formattedPosts, total: count || 0 };
}

export async function getPostById(
  id: string
): Promise<BlogPostWithRelations | null> {
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("sws2026_blog_posts")
    .select(
      `
      *,
      author:sws2026_blog_authors(*),
      category:sws2026_blog_categories(*),
      tags:sws2026_blog_post_tags(
        tag:sws2026_blog_tags(*)
      ),
      faqs:sws2026_blog_faqs(*)
    `
    )
    .eq("id", id)
    .single();

  if (!post) return null;

  return {
    ...post,
    tags: post.tags?.map((t: { tag: BlogTag }) => t.tag) || [],
  } as BlogPostWithRelations;
}

export async function getAllCategories(): Promise<BlogCategory[]> {
  const supabase = await createClient();

  const { data: categories } = await supabase
    .from("sws2026_blog_categories")
    .select("*")
    .order("display_order", { ascending: true });

  return (categories || []) as BlogCategory[];
}

export async function getCategoryById(
  id: string
): Promise<BlogCategory | null> {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("sws2026_blog_categories")
    .select("*")
    .eq("id", id)
    .single();

  return category as BlogCategory | null;
}

export async function getAllTags(): Promise<BlogTag[]> {
  const supabase = await createClient();

  const { data: tags } = await supabase
    .from("sws2026_blog_tags")
    .select("*")
    .order("name", { ascending: true });

  return (tags || []) as BlogTag[];
}

export async function getTagById(id: string): Promise<BlogTag | null> {
  const supabase = await createClient();

  const { data: tag } = await supabase
    .from("sws2026_blog_tags")
    .select("*")
    .eq("id", id)
    .single();

  return tag as BlogTag | null;
}

import OpenAI from "openai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { GenerateImageRequest } from "./types";

const STORAGE_BUCKET = "og-images";

let openaiClient: OpenAI | null = null;
let supabaseAdminClient: SupabaseClient | null = null;

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

function getSupabaseAdmin(): SupabaseClient {
  if (!supabaseAdminClient) {
    supabaseAdminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }
  return supabaseAdminClient;
}

async function generateImagePrompt(title: string, excerpt: string): Promise<string> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You create DALL-E image prompts for blog post OG images.
Create illustration-style prompts that are:
- Professional and modern
- Abstract/conceptual representations of the topic
- Suitable for a tech/software blog
- Clean with good negative space for text overlay
- No text in the image itself

Respond with ONLY the prompt, no explanation.`,
      },
      {
        role: "user",
        content: `Create an illustration-style OG image prompt for this blog post:

Title: ${title}
Summary: ${excerpt}

The image should visually represent the core concept without being too literal.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 200,
  });

  return response.choices[0]?.message?.content || "Modern abstract illustration with soft gradients";
}

export async function generateOgImage(
  request: GenerateImageRequest
): Promise<{ url: string; prompt: string }> {
  const openai = getOpenAI();
  const supabaseAdmin = getSupabaseAdmin();

  // Generate a contextual prompt for the image
  const imagePrompt = await generateImagePrompt(request.title, request.excerpt);

  // Generate image with DALL-E 3
  const imageResponse = await openai.images.generate({
    model: "dall-e-3",
    prompt: `${imagePrompt}. Style: Modern digital illustration, clean lines, professional look, suitable for a tech blog header. Aspect ratio optimized for social sharing.`,
    n: 1,
    size: "1792x1024", // Closest to 1200x630 OG ratio
    quality: "standard",
  });

  const imageUrl = imageResponse.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Failed to generate image");
  }

  // Fetch the image
  const imageData = await fetch(imageUrl);
  const imageBuffer = await imageData.arrayBuffer();

  // Generate unique filename
  const timestamp = Date.now();
  const slug = request.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 50);
  const filename = `${slug}-${timestamp}.png`;

  // Upload to Supabase Storage
  const { data, error } = await supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .upload(filename, imageBuffer, {
      contentType: "image/png",
      upsert: false,
    });

  if (error) {
    throw new Error(`Failed to upload image: ${error.message}`);
  }

  // Get public URL
  const { data: publicUrlData } = supabaseAdmin.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return {
    url: publicUrlData.publicUrl,
    prompt: imagePrompt,
  };
}

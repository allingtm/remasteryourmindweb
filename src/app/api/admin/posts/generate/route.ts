import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePostMetadata } from "@/lib/ai/generate-post-metadata";
import { generateOgImage } from "@/lib/ai/generate-og-image";
import { z } from "zod";

const requestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(100, "Content must be at least 100 characters"),
  availableTags: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    })
  ),
  generateImage: z.boolean().optional().default(false),
  existingExcerpt: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request
    const body = await request.json();
    const parseResult = requestSchema.safeParse(body);

    if (!parseResult.success) {
      const firstIssue = parseResult.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const { title, content, availableTags, generateImage, existingExcerpt } = parseResult.data;

    // Generate metadata using OpenAI
    const metadata = await generatePostMetadata({
      title,
      content,
      availableTags,
    });

    // Optionally generate OG image
    if (generateImage) {
      try {
        const excerpt = existingExcerpt || metadata.content.excerpt;
        const imageResult = await generateOgImage({ title, excerpt });
        metadata.og_image = imageResult;
      } catch (imageError) {
        console.error("OG image generation failed:", imageError);
        // Continue without image - don't fail the whole request
      }
    }

    return NextResponse.json({ data: metadata });
  } catch (error) {
    console.error("Error generating post metadata:", error);

    if (error instanceof Error) {
      // Check for rate limit errors from OpenAI
      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again in a few minutes." },
          { status: 429 }
        );
      }

      // Check for API key issues
      if (error.message.includes("API key")) {
        return NextResponse.json(
          { error: "AI service configuration error. Please contact support." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate content. Please try again." },
      { status: 500 }
    );
  }
}

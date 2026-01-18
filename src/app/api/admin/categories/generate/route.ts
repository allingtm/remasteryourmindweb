import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateCategoryMetadata } from "@/lib/ai/generate-category-metadata";
import { z } from "zod";

const requestSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  prompt: z.string().optional(),
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

    const { name, prompt } = parseResult.data;

    // Generate metadata using OpenAI
    const metadata = await generateCategoryMetadata({ name, prompt });

    return NextResponse.json({ data: metadata });
  } catch (error) {
    console.error("Error generating category metadata:", error);

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

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedBlogPost } from "@/lib/ai/embeddings";

/**
 * POST /api/admin/posts/embed
 * Generate embedding for a single blog post.
 * Body: { postId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { postId } = await request.json();

    if (!postId || typeof postId !== "string") {
      return NextResponse.json(
        { error: "postId is required" },
        { status: 400 }
      );
    }

    const result = await embedBlogPost(postId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to generate embedding" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: result.updated,
      message: result.updated
        ? "Embedding generated successfully"
        : "Embedding already up-to-date",
    });
  } catch (error) {
    console.error("Embed API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

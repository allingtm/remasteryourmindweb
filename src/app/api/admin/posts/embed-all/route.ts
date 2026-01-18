import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { embedBlogPost } from "@/lib/ai/embeddings";

/**
 * POST /api/admin/posts/embed-all
 * Generate embeddings for all published blog posts that don't have embeddings yet.
 * This is a bulk operation for initial setup or backfilling.
 */
export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all published posts
    const { data: posts, error: postsError } = await supabase
      .from("sws2026_blog_posts")
      .select("id")
      .eq("status", "published");

    if (postsError) {
      return NextResponse.json(
        { error: "Failed to fetch posts" },
        { status: 500 }
      );
    }

    if (!posts || posts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No published posts to embed",
        stats: { total: 0, embedded: 0, skipped: 0, failed: 0 },
      });
    }

    // Process each post
    const results = {
      total: posts.length,
      embedded: 0,
      skipped: 0,
      failed: 0,
      errors: [] as { postId: string; error: string }[],
    };

    for (const post of posts) {
      try {
        const result = await embedBlogPost(post.id);
        if (result.success) {
          if (result.updated) {
            results.embedded++;
          } else {
            results.skipped++;
          }
        } else {
          results.failed++;
          results.errors.push({ postId: post.id, error: result.error || "Unknown error" });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          postId: post.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.total} posts: ${results.embedded} embedded, ${results.skipped} skipped (up-to-date), ${results.failed} failed`,
      stats: {
        total: results.total,
        embedded: results.embedded,
        skipped: results.skipped,
        failed: results.failed,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
    });
  } catch (error) {
    console.error("Embed-all API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

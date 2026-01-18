import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPostById } from "@/lib/supabase/queries/admin";
import { updatePost, deletePost, updatePostTags, updatePostFaqs } from "@/lib/supabase/mutations/posts";
import { embedBlogPost } from "@/lib/ai/embeddings";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostById(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { tags, faqs, ...postData } = body;

    // Update the post (pass authenticated client to preserve RLS context)
    const { post, error } = await updatePost({ id, ...postData }, supabase);

    if (error || !post) {
      return NextResponse.json(
        { error: error || "Failed to update post" },
        { status: 500 }
      );
    }

    // Update tags if provided
    if (tags && Array.isArray(tags)) {
      const { error: tagError } = await updatePostTags(id, tags);
      if (tagError) {
        console.error("Error updating tags:", tagError);
      }
    }

    // Update FAQs if provided
    if (faqs && Array.isArray(faqs)) {
      const { error: faqError } = await updatePostFaqs(id, faqs);
      if (faqError) {
        console.error("Error updating FAQs:", faqError);
      }
    }

    // Auto-generate embedding when post is published
    if (post.status === "published") {
      embedBlogPost(id).catch((err) => {
        console.error("Error generating embedding:", err);
      });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Failed to update post" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    // Pass authenticated client to preserve RLS context
    const { success, error } = await deletePost(id, supabase);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete post" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

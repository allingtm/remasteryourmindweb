import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllPosts } from "@/lib/supabase/queries/admin";
import { createPost, updatePostTags, updatePostFaqs } from "@/lib/supabase/mutations/posts";
import { embedBlogPost } from "@/lib/ai/embeddings";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const { posts, total } = await getAllPosts({ status, limit, offset });

    return NextResponse.json({ posts, total });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { tags, faqs, ...postData } = body;

    // Validate required fields
    if (!postData.title || !postData.slug || !postData.content || !postData.category_id) {
      return NextResponse.json(
        { error: "Missing required fields: title, slug, content, category_id" },
        { status: 400 }
      );
    }

    // Create the post (pass authenticated client to preserve RLS context)
    const { post, error } = await createPost(postData, supabase);

    if (error || !post) {
      return NextResponse.json(
        { error: error || "Failed to create post" },
        { status: 500 }
      );
    }

    // Update tags if provided
    if (tags && Array.isArray(tags) && tags.length > 0) {
      const { error: tagError } = await updatePostTags(post.id, tags);
      if (tagError) {
        console.error("Error updating tags:", tagError);
      }
    }

    // Update FAQs if provided
    if (faqs && Array.isArray(faqs) && faqs.length > 0) {
      const { error: faqError } = await updatePostFaqs(post.id, faqs);
      if (faqError) {
        console.error("Error updating FAQs:", faqError);
      }
    }

    // Auto-generate embedding when post is created as published
    if (post.status === "published") {
      embedBlogPost(post.id).catch((err) => {
        console.error("Error generating embedding:", err);
      });
    }

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    const message = error instanceof Error ? error.message : "Failed to create post";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

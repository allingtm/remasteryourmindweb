import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateEmbedding } from "@/lib/ai/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (query.length < 3) {
      return NextResponse.json(
        { error: "Query must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (query.length > 500) {
      return NextResponse.json(
        { error: "Query must be less than 500 characters" },
        { status: 400 }
      );
    }

    // Generate embedding for the search query
    const embedding = await generateEmbedding(query);

    // Search for similar blog posts
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("search_blog_posts", {
      query_embedding: embedding,
      match_threshold: 0.3,
      match_count: 6,
    });

    if (error) {
      console.error("Search error:", error);
      return NextResponse.json(
        { error: "Search failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

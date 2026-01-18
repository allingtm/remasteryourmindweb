import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllHelpOptions, getAllPublishedPosts } from "@/lib/supabase/queries/help-options";
import { createHelpOption } from "@/lib/supabase/mutations/help-options";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const includePosts = searchParams.get("includePosts") === "true";

    const helpOptions = await getAllHelpOptions();

    if (includePosts) {
      const posts = await getAllPublishedPosts();
      return NextResponse.json({ helpOptions, posts });
    }

    return NextResponse.json({ helpOptions });
  } catch (error) {
    console.error("Error fetching help options:", error);
    return NextResponse.json(
      { error: "Failed to fetch help options" },
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

    // Validate required fields
    if (!body.text) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    if (!body.post_id) {
      return NextResponse.json(
        { error: "Missing required field: post_id" },
        { status: 400 }
      );
    }

    const { helpOption, error } = await createHelpOption({
      text: body.text,
      description: body.description,
      post_id: body.post_id,
      display_order: body.display_order,
      is_active: body.is_active,
      icon: body.icon,
      color: body.color,
    });

    if (error || !helpOption) {
      return NextResponse.json(
        { error: error || "Failed to create help option" },
        { status: 500 }
      );
    }

    return NextResponse.json({ helpOption }, { status: 201 });
  } catch (error) {
    console.error("Error creating help option:", error);
    return NextResponse.json(
      { error: "Failed to create help option" },
      { status: 500 }
    );
  }
}

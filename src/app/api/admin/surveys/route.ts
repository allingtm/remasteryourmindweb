import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllSurveys } from "@/lib/supabase/queries/surveys";
import { createSurvey } from "@/lib/supabase/mutations/surveys";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as 'active' | 'inactive' | null;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    const { surveys, total } = await getAllSurveys({
      status: status || undefined,
      limit,
      offset,
    });

    return NextResponse.json({ surveys, total });
  } catch (error) {
    console.error("Error fetching surveys:", error);
    return NextResponse.json(
      { error: "Failed to fetch surveys" },
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
    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug" },
        { status: 400 }
      );
    }

    if (!body.json_definition || typeof body.json_definition !== 'object') {
      return NextResponse.json(
        { error: "Invalid json_definition: must be a valid object" },
        { status: 400 }
      );
    }

    const { survey, error } = await createSurvey(body);

    if (error || !survey) {
      return NextResponse.json(
        { error: error || "Failed to create survey" },
        { status: 500 }
      );
    }

    return NextResponse.json({ survey }, { status: 201 });
  } catch (error) {
    console.error("Error creating survey:", error);
    return NextResponse.json(
      { error: "Failed to create survey" },
      { status: 500 }
    );
  }
}

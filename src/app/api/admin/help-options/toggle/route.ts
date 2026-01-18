import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleHelpOptionActive } from "@/lib/supabase/mutations/help-options";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    if (typeof body.is_active !== "boolean") {
      return NextResponse.json(
        { error: "Missing required field: is_active (boolean)" },
        { status: 400 }
      );
    }

    const { success, error } = await toggleHelpOptionActive(body.id, body.is_active);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to toggle help option status" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error toggling help option status:", error);
    return NextResponse.json(
      { error: "Failed to toggle help option status" },
      { status: 500 }
    );
  }
}

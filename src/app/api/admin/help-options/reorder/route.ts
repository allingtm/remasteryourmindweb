import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reorderHelpOptions } from "@/lib/supabase/mutations/help-options";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.orderedIds || !Array.isArray(body.orderedIds)) {
      return NextResponse.json(
        { error: "Missing required field: orderedIds (array of help option IDs)" },
        { status: 400 }
      );
    }

    const { success, error } = await reorderHelpOptions(body.orderedIds);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to reorder help options" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering help options:", error);
    return NextResponse.json(
      { error: "Failed to reorder help options" },
      { status: 500 }
    );
  }
}

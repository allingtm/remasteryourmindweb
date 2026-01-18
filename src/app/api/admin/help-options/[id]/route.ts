import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getHelpOptionById } from "@/lib/supabase/queries/help-options";
import { updateHelpOption, deleteHelpOption } from "@/lib/supabase/mutations/help-options";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const helpOption = await getHelpOptionById(id);

    if (!helpOption) {
      return NextResponse.json({ error: "Help option not found" }, { status: 404 });
    }

    return NextResponse.json({ helpOption });
  } catch (error) {
    console.error("Error fetching help option:", error);
    return NextResponse.json(
      { error: "Failed to fetch help option" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const { helpOption, error } = await updateHelpOption(id, {
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
        { error: error || "Failed to update help option" },
        { status: 500 }
      );
    }

    return NextResponse.json({ helpOption });
  } catch (error) {
    console.error("Error updating help option:", error);
    return NextResponse.json(
      { error: "Failed to update help option" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { success, error } = await deleteHelpOption(id);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete help option" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting help option:", error);
    return NextResponse.json(
      { error: "Failed to delete help option" },
      { status: 500 }
    );
  }
}

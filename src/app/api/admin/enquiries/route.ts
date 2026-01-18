import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllEnquiries, getEnquiryCounts } from "@/lib/supabase/queries/enquiries";
import { bulkUpdateEnquiryStatus, bulkDeleteEnquiries } from "@/lib/supabase/mutations/enquiries";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const surveyId = searchParams.get("surveyId") || undefined;
    const postId = searchParams.get("postId") || undefined;
    const status = searchParams.get("status") as 'new' | 'read' | 'archived' | null;
    const dateFrom = searchParams.get("dateFrom") || undefined;
    const dateTo = searchParams.get("dateTo") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!) : undefined;

    const [enquiriesResult, counts] = await Promise.all([
      getAllEnquiries({
        surveyId,
        postId,
        status: status || undefined,
        dateFrom,
        dateTo,
        limit,
        offset,
      }),
      getEnquiryCounts(),
    ]);

    return NextResponse.json({
      enquiries: enquiriesResult.enquiries,
      total: enquiriesResult.total,
      counts,
    });
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    return NextResponse.json(
      { error: "Failed to fetch enquiries" },
      { status: 500 }
    );
  }
}

// Bulk actions
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids, status } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid ids array" },
        { status: 400 }
      );
    }

    if (!status || !['new', 'read', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { success, error } = await bulkUpdateEnquiryStatus(ids, status);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to update enquiries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating enquiries:", error);
    return NextResponse.json(
      { error: "Failed to update enquiries" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid ids array" },
        { status: 400 }
      );
    }

    const { success, error } = await bulkDeleteEnquiries(ids);

    if (!success) {
      return NextResponse.json(
        { error: error || "Failed to delete enquiries" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting enquiries:", error);
    return NextResponse.json(
      { error: "Failed to delete enquiries" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAllEnquiries } from "@/lib/supabase/queries/enquiries";

// Changed from GET to POST for CSRF protection
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has export permission
    const { data: author } = await supabase
      .from("sws2026_blog_authors")
      .select("can_export")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .single();

    if (!author?.can_export) {
      return NextResponse.json(
        { error: "Export permission denied" },
        { status: 403 }
      );
    }

    // Get filters from request body (POST) instead of query params
    const body = await request.json().catch(() => ({}));
    const surveyId = body.surveyId || undefined;
    const postId = body.postId || undefined;
    const status = body.status as 'new' | 'read' | 'archived' | null;
    const dateFrom = body.dateFrom || undefined;
    const dateTo = body.dateTo || undefined;

    const { enquiries } = await getAllEnquiries({
      surveyId,
      postId,
      status: status || undefined,
      dateFrom,
      dateTo,
    });

    // Build CSV
    const headers = [
      "ID",
      "Survey",
      "Post",
      "Respondent Name",
      "Respondent Email",
      "Status",
      "Created At",
      "Response Data",
    ];

    const rows = enquiries.map((enquiry) => [
      enquiry.id,
      enquiry.survey?.name || "",
      enquiry.post?.title || "",
      enquiry.respondent_name || "",
      enquiry.respondent_email || "",
      enquiry.status,
      new Date(enquiry.created_at).toISOString(),
      JSON.stringify(enquiry.response_data),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            // Escape quotes and wrap in quotes if contains comma or quote
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(",")
      ),
    ].join("\n");

    const filename = `enquiries-export-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting enquiries:", error);
    return NextResponse.json(
      { error: "Failed to export enquiries" },
      { status: 500 }
    );
  }
}

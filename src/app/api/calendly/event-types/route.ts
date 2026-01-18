import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCalendlyClient, isCalendlyConfigured } from "@/lib/calendly";

export async function GET() {
  try {
    // Check if Calendly is configured
    if (!isCalendlyConfigured()) {
      return NextResponse.json(
        { error: "Calendly is not configured" },
        { status: 503 }
      );
    }

    // Auth check for admin routes
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = getCalendlyClient();
    const eventTypes = await client.getEventTypes();

    return NextResponse.json({ eventTypes });
  } catch (error) {
    console.error("Error fetching event types:", error);
    return NextResponse.json(
      { error: "Failed to fetch event types" },
      { status: 500 }
    );
  }
}

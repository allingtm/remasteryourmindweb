import { NextRequest, NextResponse } from "next/server";
import { getCalendlyClient, isCalendlyConfigured } from "@/lib/calendly";

export async function GET(request: NextRequest) {
  try {
    if (!isCalendlyConfigured()) {
      return NextResponse.json(
        { error: "Calendly is not configured" },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const eventTypeUri = searchParams.get("event_type_uri");
    const startTime = searchParams.get("start_time");
    const endTime = searchParams.get("end_time");

    if (!eventTypeUri || !startTime || !endTime) {
      return NextResponse.json(
        {
          error:
            "Missing required parameters: event_type_uri, start_time, end_time",
        },
        { status: 400 }
      );
    }

    const client = getCalendlyClient();
    const availableTimes = await client.getAvailableTimes(
      eventTypeUri,
      startTime,
      endTime
    );

    return NextResponse.json({ availableTimes });
  } catch (error) {
    console.error("Error fetching available times:", error);
    return NextResponse.json(
      { error: "Failed to fetch available times" },
      { status: 500 }
    );
  }
}

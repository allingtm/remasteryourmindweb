import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { eventUri, inviteeUri, postId } = await request.json();

    if (!eventUri) {
      return NextResponse.json(
        { error: "Event URI is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Save the confirmed booking
    const { error } = await supabase
      .from("sws2026_calendly_bookings")
      .insert({
        calendly_event_uri: eventUri,
        post_id: postId || null,
        status: "confirmed",
        // We don't have all the details from the embed event
        // The full details would come from a Calendly webhook
        event_type_uri: eventUri.split("/scheduled_events/")[0] || eventUri,
        event_start_time: new Date().toISOString(), // Placeholder - would get from webhook
        invitee_name: "Pending", // Will be updated by webhook if configured
        invitee_email: "pending@calendly.com", // Will be updated by webhook if configured
      });

    if (error) {
      console.error("Failed to save booking:", error);
      return NextResponse.json(
        { error: "Failed to save booking" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking confirmation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

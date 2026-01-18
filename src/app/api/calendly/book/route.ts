import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCalendlyClient, isCalendlyConfigured } from "@/lib/calendly";

interface BookingRequest {
  post_id?: string;
  event_type_uri: string;
  start_time: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  timezone: string;
}

export async function POST(request: NextRequest) {
  try {
    if (!isCalendlyConfigured()) {
      return NextResponse.json(
        { error: "Calendly is not configured" },
        { status: 503 }
      );
    }

    const body: BookingRequest = await request.json();

    // Validate required fields
    if (
      !body.event_type_uri ||
      !body.start_time ||
      !body.name ||
      !body.email ||
      !body.timezone
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const client = getCalendlyClient();

    // Get event type details for duration and scheduling URL
    const eventType = await client.getEventType(body.event_type_uri);

    // Build scheduling URL with pre-filled data
    const schedulingUrl = client.buildSchedulingUrl(eventType.scheduling_url, {
      name: body.name,
      email: body.email,
      date: body.start_time.substring(0, 7), // YYYY-MM format
    });

    // Store booking record for tracking
    const supabase = await createClient();
    const { data: booking, error: dbError } = await supabase
      .from("sws2026_calendly_bookings")
      .insert({
        post_id: body.post_id || null,
        calendly_event_uri: null, // Will be updated via webhook after booking
        event_type_uri: body.event_type_uri,
        event_start_time: body.start_time,
        invitee_name: body.name,
        invitee_email: body.email,
        invitee_phone: body.phone || null,
        invitee_company: body.company || null,
        invitee_message: body.message || null,
        status: "pending",
        source_url: request.headers.get("referer"),
      })
      .select()
      .single();

    if (dbError) {
      console.error("Error creating booking record:", dbError);
    }

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "website@remasteryourmind.co.uk",
          to:
            process.env.CALENDLY_NOTIFICATION_EMAIL ||
            process.env.CONTACT_EMAIL ||
            "hello@remasteryourmind.co.uk",
          subject: `New Calendly Booking Request: ${body.name}`,
          html: generateBookingNotificationEmail(body, eventType.name),
        });
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      booking_id: booking?.id,
      scheduling_url: schedulingUrl,
      event_type_name: eventType.name,
      duration: eventType.duration,
      message:
        "Booking request received. Please complete scheduling via Calendly.",
    });
  } catch (error) {
    console.error("Booking error:", error);
    return NextResponse.json(
      { error: "Failed to process booking" },
      { status: 500 }
    );
  }
}

function generateBookingNotificationEmail(
  data: BookingRequest,
  eventTypeName: string
): string {
  const escapeHtml = (str: string) =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #006bff 0%, #0052cc 100%); padding: 24px;">
          <h1 style="color: white; margin: 0; font-size: 24px;">New Calendly Booking Request</h1>
        </div>
        <div style="padding: 24px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666; width: 140px;">Event Type</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500;">${escapeHtml(eventTypeName)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Requested Time</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500;">${new Date(data.start_time).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Name</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: 500;">${escapeHtml(data.name)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Email</td>
              <td style="padding: 12px 0; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(data.email)}" style="color: #006bff;">${escapeHtml(data.email)}</a></td>
            </tr>
            ${data.phone ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Phone</td><td style="padding: 12px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.phone)}</td></tr>` : ""}
            ${data.company ? `<tr><td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #666;">Company</td><td style="padding: 12px 0; border-bottom: 1px solid #eee;">${escapeHtml(data.company)}</td></tr>` : ""}
            ${data.message ? `<tr><td style="padding: 12px 0; color: #666; vertical-align: top;">Message</td><td style="padding: 12px 0;">${escapeHtml(data.message)}</td></tr>` : ""}
          </table>
        </div>
        <div style="background: #f9fafb; padding: 16px 24px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #666; font-size: 14px;">This booking request was submitted from Remaster Your Mind website.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

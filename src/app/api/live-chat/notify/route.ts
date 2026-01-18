import { NextResponse } from "next/server";
import twilio from "twilio";

interface NotifyRequestBody {
  conversationId: string;
  visitorId: string;
  postTitle?: string;
  sourceUrl?: string;
  isReopen?: boolean;
}

export async function POST(request: Request) {
  try {
    const body: NotifyRequestBody = await request.json();
    const { conversationId, visitorId, postTitle, isReopen } = body;

    console.log("Live chat notify called:", { conversationId, visitorId, postTitle, isReopen });

    // Validate required fields
    if (!conversationId || !visitorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Skip SMS for reopened conversations
    if (isReopen) {
      console.log("Skipping SMS for reopened conversation");
      return NextResponse.json({ success: true, skipped: "reopen" });
    }

    // Check Twilio configuration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    const toNumber = process.env.TWILIO_NOTIFY_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber || !toNumber) {
      console.warn("Twilio not configured, skipping SMS notification");
      return NextResponse.json({ success: true, skipped: "not_configured" });
    }

    // Build admin URL
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://remasteryourmind.co.uk";
    const adminChatUrl = `${siteUrl}/admin/live-chat?conversation=${conversationId}`;

    // Build SMS message (keep under 160 chars when possible)
    let message = `New Live Chat!\n`;
    message += `Visitor: ${visitorId.substring(0, 8)}...\n`;
    if (postTitle) {
      // Truncate long titles
      const truncatedTitle = postTitle.length > 30
        ? postTitle.substring(0, 27) + "..."
        : postTitle;
      message += `From: ${truncatedTitle}\n`;
    }
    message += `\n${adminChatUrl}`;

    // Send SMS via Twilio
    const client = twilio(accountSid, authToken);

    await client.messages.create({
      body: message,
      from: fromNumber,
      to: toNumber,
    });

    console.log("SMS notification sent successfully");
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("SMS notification error:", error);
    // Don't fail the request if SMS fails (fire-and-forget pattern)
    return NextResponse.json({ success: true, warning: "SMS failed" });
  }
}

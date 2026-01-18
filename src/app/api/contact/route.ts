import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length
    if (body.message.trim().length < 10) {
      return NextResponse.json(
        { error: "Message must be at least 10 characters" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Insert contact submission into database
    const { error: dbError } = await supabase.from("sws2026_contact_submissions").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      company: body.company?.trim() || null,
      message: body.message.trim(),
      source_url: request.headers.get("referer") || "/contact",
      user_agent: request.headers.get("user-agent") || null,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      // Don't fail the request if DB insert fails - we can still send email
    }

    // Send email notification (if Resend is configured)
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        await resend.emails.send({
          from: "website@remasteryourmind.co.uk",
          to: process.env.CONTACT_EMAIL || "hello@remasteryourmind.co.uk",
          subject: `New Contact: ${body.name}${body.company ? ` from ${body.company}` : ""}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${body.name}</p>
            <p><strong>Email:</strong> ${body.email}</p>
            ${body.company ? `<p><strong>Company:</strong> ${body.company}</p>` : ""}
            <h3>Message</h3>
            <p>${body.message.replace(/\n/g, "<br>")}</p>
          `,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

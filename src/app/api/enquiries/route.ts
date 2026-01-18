import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSurveyById } from "@/lib/supabase/queries/surveys";
import {
  checkRateLimit,
  getClientIP,
  rateLimitResponse,
  RATE_LIMITS,
} from "@/lib/rate-limit";

interface EnquirySubmission {
  survey_id: string;
  post_id?: string;
  response_data: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const clientIP = getClientIP(request);
    const rateLimit = await checkRateLimit(clientIP, "enquiry", RATE_LIMITS.enquiry);
    if (!rateLimit.success) {
      return rateLimitResponse(rateLimit);
    }

    const body: EnquirySubmission = await request.json();

    // Validate required fields
    if (!body.survey_id) {
      return NextResponse.json(
        { error: "Missing required field: survey_id" },
        { status: 400 }
      );
    }

    if (!body.response_data || typeof body.response_data !== "object") {
      return NextResponse.json(
        { error: "Invalid response_data" },
        { status: 400 }
      );
    }

    // Verify survey exists and is active
    const survey = await getSurveyById(body.survey_id);
    if (!survey) {
      return NextResponse.json(
        { error: "Survey not found" },
        { status: 404 }
      );
    }

    if (survey.status !== "active") {
      return NextResponse.json(
        { error: "Survey is not active" },
        { status: 400 }
      );
    }

    // Extract common fields from response data
    const responseData = body.response_data;
    const respondentEmail = extractEmail(responseData);
    const respondentName = extractName(responseData);

    const supabase = await createClient();

    // Get post title if post_id is provided
    let postTitle: string | null = null;
    if (body.post_id) {
      const { data: post } = await supabase
        .from("sws2026_blog_posts")
        .select("title")
        .eq("id", body.post_id)
        .single();
      postTitle = post?.title || null;
    }

    // Insert enquiry into database
    const { data: enquiry, error: dbError } = await supabase
      .from("sws2026_enquiries")
      .insert({
        survey_id: body.survey_id,
        post_id: body.post_id || null,
        response_data: responseData,
        respondent_email: respondentEmail,
        respondent_name: respondentName,
        status: "new",
        source_url: request.headers.get("referer") || null,
        user_agent: request.headers.get("user-agent") || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: "Failed to save enquiry" },
        { status: 500 }
      );
    }

    // Send email notification
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailHtml = generateEnquiryEmailHtml({
          surveyName: survey.name,
          postTitle,
          responseData,
          respondentEmail,
          respondentName,
          submittedAt: enquiry.created_at,
        });

        await resend.emails.send({
          from: "website@remasteryourmind.co.uk",
          to: process.env.ENQUIRY_EMAIL || process.env.CONTACT_EMAIL || "hello@remasteryourmind.co.uk",
          subject: `New Enquiry: ${survey.name}${postTitle ? ` - ${postTitle}` : ""}`,
          html: emailHtml,
        });
      } catch (emailError) {
        console.error("Email error:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ success: true, id: enquiry.id });
  } catch (error) {
    console.error("Enquiry submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// Helper to extract email from response data
function extractEmail(data: Record<string, unknown>): string | null {
  const emailKeys = ["email", "Email", "EMAIL", "e-mail", "emailAddress", "email_address"];
  for (const key of emailKeys) {
    if (data[key] && typeof data[key] === "string") {
      const email = data[key] as string;
      // Validate email format before returning
      if (isValidEmail(email)) {
        return email;
      }
    }
  }
  // Search nested objects with proper validation
  for (const value of Object.values(data)) {
    if (typeof value === "string" && isValidEmail(value)) {
      return value;
    }
  }
  return null;
}

// Helper to extract name from response data
function extractName(data: Record<string, unknown>): string | null {
  const nameKeys = ["name", "Name", "NAME", "fullName", "full_name", "firstName", "first_name"];
  for (const key of nameKeys) {
    if (data[key] && typeof data[key] === "string") {
      return data[key] as string;
    }
  }
  return null;
}

// HTML escape function to prevent XSS
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Generate HTML email for enquiry notification
function generateEnquiryEmailHtml(data: {
  surveyName: string;
  postTitle: string | null;
  responseData: Record<string, unknown>;
  respondentEmail: string | null;
  respondentName: string | null;
  submittedAt: string;
}): string {
  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (Array.isArray(value)) return escapeHtml(value.join(", "));
    if (typeof value === "object") return escapeHtml(JSON.stringify(value));
    return escapeHtml(String(value));
  };

  const responseRows = Object.entries(data.responseData)
    .map(
      ([key, value]) => `
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 500; color: #374151;">${escapeHtml(key)}</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; color: #6b7280;">${formatValue(value)}</td>
        </tr>
      `
    )
    .join("");

  // Escape user-provided data for safe HTML rendering
  const safeSurveyName = escapeHtml(data.surveyName);
  const safePostTitle = data.postTitle ? escapeHtml(data.postTitle) : null;
  const safeRespondentName = data.respondentName ? escapeHtml(data.respondentName) : null;
  const safeRespondentEmail = data.respondentEmail ? escapeHtml(data.respondentEmail) : null;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 8px 8px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Enquiry Received</h1>
      </div>

      <div style="background: #f9fafb; padding: 24px; border: 1px solid #e5e7eb; border-top: none;">
        <div style="margin-bottom: 20px;">
          <p style="margin: 4px 0;"><strong>Survey:</strong> ${safeSurveyName}</p>
          ${safePostTitle ? `<p style="margin: 4px 0;"><strong>Post:</strong> ${safePostTitle}</p>` : ""}
          ${safeRespondentName ? `<p style="margin: 4px 0;"><strong>Name:</strong> ${safeRespondentName}</p>` : ""}
          ${safeRespondentEmail ? `<p style="margin: 4px 0;"><strong>Email:</strong> <a href="mailto:${safeRespondentEmail}">${safeRespondentEmail}</a></p>` : ""}
          <p style="margin: 4px 0;"><strong>Submitted:</strong> ${new Date(data.submittedAt).toLocaleString()}</p>
        </div>

        <h2 style="font-size: 18px; margin: 20px 0 12px; color: #374151;">Response Details</h2>
        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tbody>
            ${responseRows}
          </tbody>
        </table>
      </div>

      <div style="text-align: center; padding: 16px; color: #6b7280; font-size: 14px;">
        <p style="margin: 0;">View all enquiries in the <a href="${process.env.NEXT_PUBLIC_SITE_URL || ""}/admin/enquiries" style="color: #667eea;">Admin Panel</a></p>
      </div>
    </body>
    </html>
  `;
}

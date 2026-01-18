import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this is a password recovery flow
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // If user came from password recovery, redirect to reset password page
      if (session) {
        // The session exists, redirect to reset password page
        return NextResponse.redirect(
          new URL("/reset-password", requestUrl.origin)
        );
      }
    }
  }

  // If something went wrong or no code, redirect to home
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Old URLs that should return 410 Gone
const gonePatterns = [
  // Location-based mobile app development pages
  /^\/mobile-app-development(\/.*)?$/,
  // Old blog posts
  /^\/blog\/why-your-business-needs-to-switch-from-wordpress-to-svelteKit-for-a-competitive-edge$/,
  /^\/blog\/passion-and-experience-versus-price-when-hiring-a-software-developer$/,
  // Old article categories
  /^\/articles\/(business-efficiency|customer-engagement|user-engagement|seo)$/,
  // Old service/topic pages
  /^\/app-development-costs\/.*/,
  /^\/website-optimisation\/.*/,
  /^\/bespoke-mobile-apps\/.*/,
  /^\/legal-tech\/.*/,
  /^\/services\/mobile-application-development$/,
];

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check if the URL matches any of the gone patterns - return 410
  for (const pattern of gonePatterns) {
    if (pattern.test(pathname)) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Removed - Solve With Software</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f9fafb;
      color: #374151;
    }
    .container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      font-size: 4rem;
      margin: 0;
      color: #9ca3af;
    }
    p {
      font-size: 1.125rem;
      margin: 1rem 0;
    }
    a {
      color: #2563eb;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>410</h1>
    <p>This page has been permanently removed.</p>
    <p><a href="/">Visit our homepage</a> to explore our latest content.</p>
  </div>
</body>
</html>`,
        {
          status: 410,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }
  }

  // Handle Supabase auth code exchange
  // If we have a 'code' parameter on the root path, redirect to auth callback
  if (pathname === "/" && searchParams.has("code")) {
    const code = searchParams.get("code");
    const url = request.nextUrl.clone();
    url.pathname = "/auth/callback";
    url.searchParams.set("code", code!);
    return NextResponse.redirect(url);
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from login page
  if (request.nextUrl.pathname === "/login" && user) {
    const redirectTo =
      request.nextUrl.searchParams.get("redirect") || "/admin";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/login",
    // Old URLs that return 410
    "/mobile-app-development/:path*",
    "/blog/:path*",
    "/articles/:path*",
    "/app-development-costs/:path*",
    "/website-optimisation/:path*",
    "/bespoke-mobile-apps/:path*",
    "/legal-tech/:path*",
    "/services/:path*",
  ],
};

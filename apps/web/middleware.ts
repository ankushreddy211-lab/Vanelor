import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // 1. Maintain Correlation ID Lifecycle Architecture
  const correlationId = request.headers.get("x-correlation-id") ?? crypto.randomUUID();
  
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Instantiate the Supabase Server Client Engine
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 3. Optimistic UX Redirection for Administrative Subroutes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Check if a valid Supabase session token exists in the cookie jar
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("from", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 4. Return complete response payload decorated with the correlation ID signature
  response.headers.set("x-correlation-id", correlationId);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
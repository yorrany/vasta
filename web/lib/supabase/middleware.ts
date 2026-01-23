
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
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
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              // Use a wide domain to cover both non-www and www if possible
              // but for now let's stick to standard next.js behavior
            })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 1. Protected Routes (Dashboard & Onboarding)
  // If no user, everything under /dashboard or /onboarding goes to /login
  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/onboarding")) && !user) {
    const url = new URL("/login", request.url);
    // Preservar a URL original para redirecionar de volta após login
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 2. Auth Routes (Login)
  // We'll let the client-side or callback handle the redirect for a better UX
  // and to avoid circular loops during onboarding.
  
  return response;
}

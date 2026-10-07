import { createServerClient } from "@supabase/ssr";
import { requirePublicEnv } from "@/lib/env";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const { supabaseUrl, supabasePublishableKey } = requirePublicEnv();

  // If Supabase credentials are missing or invalid, bypass network calls immediately
  if (!supabaseUrl || !supabasePublishableKey || !supabaseUrl.startsWith("http")) {
    return response;
  }

  try {
    const supabase = createServerClient(
      supabaseUrl,
      supabasePublishableKey,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      },
    );

    // Timeout protection: enforce 1500ms max so middleware never triggers Vercel 504
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null }; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null }, error: new Error("Auth timeout") }), 1500)
    );

    const { data } = await Promise.race([authPromise, timeoutPromise]);
    const user = data?.user;
    const pathname = request.nextUrl.pathname;

    const isProtected =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/ai-studio") ||
      pathname.startsWith("/image-studio") ||
      pathname.startsWith("/posts") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/campaigns") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/media-library") ||
      pathname.startsWith("/publishing") ||
      pathname.startsWith("/settings");

    if (isProtected && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if ((pathname === "/login" || pathname === "/signup") && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      url.search = "";
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.warn("updateSession non-fatal error:", err);
  }

  return response;
}

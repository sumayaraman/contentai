import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function middleware(request: NextRequest) {
  try {
    // Hard 2-second timeout: guarantees the middleware NEVER triggers Vercel's 504 MIDDLEWARE_INVOCATION_TIMEOUT
    const timeout = new Promise<NextResponse>((resolve) => {
      setTimeout(() => resolve(NextResponse.next()), 2000);
    });

    return await Promise.race([updateSession(request), timeout]);
  } catch (err) {
    console.error("Middleware non-fatal error:", err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/ai-assistant|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

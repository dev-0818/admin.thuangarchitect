import { NextRequest, NextResponse } from "next/server";

import { hasSupabaseBrowserEnv } from "@/lib/supabase/config";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/login", "/auth/callback"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/trigger-build") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const response = await updateSession(request);

  if (!hasSupabaseBrowserEnv()) {
    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const sessionCookie = request.cookies
    .getAll()
    .find((cookie) => cookie.name.includes("auth-token"));

  if (!sessionCookie && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

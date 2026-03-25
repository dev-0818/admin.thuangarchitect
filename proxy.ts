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

  const { response, user } = await updateSession(request);

  if (!hasSupabaseBrowserEnv()) {
    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isAuthorizedAdmin = !process.env.ADMIN_EMAIL || user?.email === process.env.ADMIN_EMAIL;

  if ((!user || !isAuthorizedAdmin) && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && isAuthorizedAdmin && isPublicRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};

import { NextRequest, NextResponse } from "next/server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (process.env.ADMIN_EMAIL && user?.email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/login?error=unauthorized", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}

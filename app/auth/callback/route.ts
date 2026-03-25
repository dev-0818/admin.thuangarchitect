import { NextRequest, NextResponse } from "next/server";

import { buildPublicUrl } from "@/lib/site-url";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(buildPublicUrl(request, "/login?error=missing_code"));
  }

  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.redirect(buildPublicUrl(request, "/dashboard"));
  }

  await supabase.auth.exchangeCodeForSession(code);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (process.env.ADMIN_EMAIL && user?.email !== process.env.ADMIN_EMAIL) {
    await supabase.auth.signOut();
    return NextResponse.redirect(buildPublicUrl(request, "/login?error=unauthorized"));
  }

  return NextResponse.redirect(buildPublicUrl(request, "/dashboard"));
}

import { NextResponse } from "next/server";

import { removeUnreferencedPortfolioImages } from "@/lib/data";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type CleanupPayload = {
  storagePaths?: string[];
};

export async function POST(request: Request) {
  const adminClient = getSupabaseAdminClient();
  const authHeader = request.headers.get("authorization");
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const supabase = accessToken ? null : await getSupabaseServerClient();

  if (!adminClient) {
    return NextResponse.json({ error: "Supabase belum terkonfigurasi." }, { status: 503 });
  }

  const {
    data: { user },
    error: userError
  } = accessToken
    ? await adminClient.auth.getUser(accessToken)
    : await supabase!.auth.getUser();

  if (userError || !user?.email) {
    return NextResponse.json({ error: "Session login tidak ditemukan." }, { status: 401 });
  }

  if (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Akses cleanup ditolak." }, { status: 403 });
  }

  const payload = (await request.json().catch(() => null)) as CleanupPayload | null;
  const storagePaths = Array.isArray(payload?.storagePaths)
    ? payload.storagePaths.filter((path): path is string => typeof path === "string" && path.length > 0)
    : [];

  if (storagePaths.length === 0) {
    return NextResponse.json({ removedPaths: [] });
  }

  const removedPaths = await removeUnreferencedPortfolioImages(storagePaths);

  return NextResponse.json({ removedPaths });
}

import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
    return NextResponse.json({ error: "Akses upload ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const rawProjectId = formData.get("projectId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File upload tidak valid." }, { status: 400 });
  }

  const safeProjectId =
    typeof rawProjectId === "string" && rawProjectId.trim().length > 0
      ? rawProjectId.trim()
      : crypto.randomUUID();
  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const storagePath = `projects/${safeProjectId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await adminClient.storage.from("portfolio-images").upload(storagePath, file, {
    cacheControl: "3600",
    contentType: file.type || "image/webp",
    upsert: false
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data } = adminClient.storage.from("portfolio-images").getPublicUrl(storagePath);

  return NextResponse.json({
    imageUrl: data.publicUrl,
    storagePath
  });
}

import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

export async function POST(request: Request) {
  const supabase = await getSupabaseServerClient();
  const adminClient = getSupabaseAdminClient();

  if (!supabase || !adminClient) {
    return NextResponse.json({ error: "Supabase belum terkonfigurasi." }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return NextResponse.json({ error: "Session login tidak ditemukan." }, { status: 401 });
  }

  if (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "Akses upload ditolak." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const rawSlug = formData.get("slug");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File upload tidak valid." }, { status: 400 });
  }

  const safeSlug = slugify(typeof rawSlug === "string" ? rawSlug : "") || `project-${Date.now()}`;
  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const storagePath = `projects/${safeSlug}/${crypto.randomUUID()}.${extension}`;

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

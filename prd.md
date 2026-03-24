# Product Requirements Document

## Admin Panel & Supabase Setup — thuangarchitect.com

|             |                                                           |
| ----------- | --------------------------------------------------------- |
| **Versi**   | 1.0                                                       |
| **Tanggal** | Maret 2026                                                |
| **Status**  | Draft                                                     |
| **Stack**   | Next.js (Static Export) + Supabase + Netlify              |
| **Scope**   | Admin Panel + Supabase schema + Storage + Netlify Webhook |

---

## 1. Overview & Tujuan

Dokumen ini mendefinisikan kebutuhan teknis dan fungsional untuk membangun admin panel portofolio thuangarchitect.com. Admin panel berdiri terpisah dari website portofolio publik sehingga ketika admin panel down, website publik tidak terpengaruh sama sekali.

### 1.1 Prinsip Utama Arsitektur

- Website portofolio (thuangarchitect.com) di-deploy sebagai static site di Netlify CDN.
- Supabase berfungsi sebagai database dan storage — sumber kebenaran data.
- Admin panel adalah Next.js app terpisah, hanya digunakan oleh pemilik (1 user).
- Setiap kali admin simpan perubahan, Netlify webhook dipanggil untuk rebuild otomatis (~1-2 menit).
- Setelah rebuild selesai, visitor website tidak pernah menyentuh Supabase atau admin panel.

### 1.2 Alur Kerja Tingkat Tinggi

1. Admin login ke admin panel via magic link (email).
2. Admin upload foto proyek, isi judul, deskripsi, kategori, dan urutan tampil.
3. Admin panel kirim data ke Supabase (PostgreSQL + Storage bucket).
4. Admin panel trigger Netlify build webhook.
5. Netlify pull semua data dari Supabase, generate static HTML + gambar ke CDN.
6. Website publik langsung terupdate dalam ~1-2 menit.

---

## 2. Supabase Setup

### 2.1 Schema Database

Buat project baru di Supabase, lalu jalankan SQL berikut di SQL Editor.

#### Tabel: `projects`

Menyimpan semua data proyek portofolio.

| Kolom             | Tipe        | Default           | Keterangan                                                               |
| ----------------- | ----------- | ----------------- | ------------------------------------------------------------------------ |
| `id`              | uuid        | gen_random_uuid() | Primary key                                                              |
| `title`           | text        | NOT NULL          | Judul proyek — tampil di card & halaman detail (huruf kapital semua)     |
| `slug`            | text        | UNIQUE NOT NULL   | URL identifier: `/portfolio/{kategori}/{slug}/`                          |
| `category`        | text        | NOT NULL          | Nilai fixed: `'komersial'` atau `'residential'` (lowercase, sesuai URL)  |
| `description`     | text        | NULL              | Satu paragraf deskripsi — tampil di halaman detail proyek                |
| `cover_image_url` | text        | NULL              | URL gambar thumbnail untuk card di halaman /portfolio/                   |
| `sort_order`      | integer     | 0                 | Urutan dalam kategori (ascending). Menentukan urutan prev/next navigasi. |
| `is_published`    | boolean     | false             | `true` = tampil di website. `false` = draft, hanya di admin.             |
| `created_at`      | timestamptz | now()             | Waktu dibuat                                                             |
| `updated_at`      | timestamptz | now()             | Waktu terakhir diubah — auto-update via trigger                          |

#### Tabel: `project_images`

Menyimpan semua gambar per proyek (bisa banyak per proyek).

| Kolom          | Tipe        | Default           | Keterangan                                    |
| -------------- | ----------- | ----------------- | --------------------------------------------- |
| `id`           | uuid        | gen_random_uuid() | Primary key                                   |
| `project_id`   | uuid        | NOT NULL          | Foreign key ke `projects.id` (cascade delete) |
| `image_url`    | text        | NOT NULL          | URL gambar di Supabase Storage                |
| `storage_path` | text        | NOT NULL          | Path di bucket untuk keperluan hapus file     |
| `alt_text`     | text        | NULL              | Alt text gambar untuk aksesibilitas / SEO     |
| `sort_order`   | integer     | 0                 | Urutan gambar dalam galeri proyek             |
| `created_at`   | timestamptz | now()             | Waktu upload                                  |

#### Tabel: `site_settings`

Menyimpan konfigurasi global website (tagline, bio, kontak, dll).

| Kolom             | Tipe        | Default   | Keterangan                        |
| ----------------- | ----------- | --------- | --------------------------------- |
| `id`              | integer     | 1 (fixed) | Selalu row id=1, hanya satu baris |
| `site_title`      | text        | NULL      | Nama studio / brand               |
| `tagline`         | text        | NULL      | Tagline di halaman utama          |
| `bio`             | text        | NULL      | Deskripsi singkat arsitek         |
| `email`           | text        | NULL      | Email kontak publik               |
| `phone`           | text        | NULL      | Nomor telepon publik              |
| `instagram_url`   | text        | NULL      | Link Instagram                    |
| `whatsapp_url`    | text        | NULL      | Link WhatsApp / wa.me             |
| `google_maps_url` | text        | NULL      | Link Google Maps kantor           |
| `updated_at`      | timestamptz | now()     | Waktu terakhir diubah             |

---

### 2.2 SQL Setup Lengkap

Jalankan script berikut di Supabase SQL Editor (Dashboard > SQL Editor > New query):

```sql
-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Projects table
CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  category text NOT NULL,  -- 'komersial' atau 'residential'
  description text,
  cover_image_url text,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Project images table
CREATE TABLE project_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  alt_text text,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- 4. Site settings table
CREATE TABLE site_settings (
  id integer PRIMARY KEY DEFAULT 1,
  site_title text,
  tagline text,
  bio text,
  email text,
  phone text,
  instagram_url text,
  whatsapp_url text,
  google_maps_url text,
  updated_at timestamptz DEFAULT now()
);

-- 5. Seed default site_settings row
INSERT INTO site_settings (id) VALUES (1);

-- 6. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_settings
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

### 2.3 Row Level Security (RLS)

Aktifkan RLS supaya data tidak bisa diakses sembarangan dari client. Karena website porto fetch data saat build time menggunakan `service_role` key (server-side), konfigurasi berikut aman:

- Enable RLS di semua tabel: Dashboard > Table Editor > pilih tabel > Enable RLS.
- Buat policy untuk SELECT publik khusus tabel `projects` dan `project_images`:

```sql
-- Visitor (dan build time) bisa baca proyek yang published
CREATE POLICY "Public read published projects"
ON projects FOR SELECT USING (is_published = true);

-- Visitor bisa baca gambar dari proyek yang published
CREATE POLICY "Public read project images"
ON project_images FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM projects
    WHERE projects.id = project_images.project_id
    AND projects.is_published = true
  )
);
```

- Admin panel menggunakan `service_role` key sehingga bypass RLS — bisa baca/tulis semua data termasuk yang belum published.
- **JANGAN** expose `service_role` key di frontend. Hanya gunakan di server-side (Next.js API routes / server actions).

---

### 2.4 Storage Bucket

Setup bucket untuk menyimpan gambar proyek:

1. Buka Supabase Dashboard > Storage > New Bucket.
2. Nama bucket: `portfolio-images`.
3. Atur sebagai **Public bucket** (URL gambar bisa diakses langsung tanpa auth).
4. Set allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
5. Set max file size: 10MB per file.
6. Struktur folder di bucket: `projects/{project-slug}/{filename}.webp`

Storage policy:

```sql
-- Hanya authenticated user yang bisa upload
CREATE POLICY "Authenticated upload"
ON storage.objects FOR INSERT
TO authenticated WITH CHECK (bucket_id = 'portfolio-images');

-- Siapapun bisa baca gambar (public)
CREATE POLICY "Public read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Hanya authenticated user yang bisa hapus
CREATE POLICY "Authenticated delete"
ON storage.objects FOR DELETE
TO authenticated USING (bucket_id = 'portfolio-images');
```

---

### 2.5 Authentication Setup

Gunakan Supabase Auth dengan magic link (passwordless):

1. Supabase Dashboard > Authentication > Providers > aktifkan **Email**.
2. Matikan "Confirm email" — gunakan magic link only.
3. Tambahkan email admin di Authentication > Users.
4. Di Authentication > URL Configuration, set **Site URL** ke URL admin panel (misal `https://admin.thuangarchitect.com`).
5. Set **Redirect URLs**: `https://admin.thuangarchitect.com/auth/callback`

---

## 3. Admin Panel — Spesifikasi Fitur

### 3.1 Stack & Setup

|                       |                                                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**         | Next.js 14+ (App Router)                                                                                                          |
| **Styling**           | Tailwind CSS                                                                                                                      |
| **Supabase client**   | `@supabase/supabase-js` + `@supabase/ssr`                                                                                         |
| **Image handling**    | `browser-image-compression` (client-side compress sebelum upload)                                                                 |
| **Drag & drop order** | `dnd-kit`                                                                                                                         |
| **Form validation**   | `zod`                                                                                                                             |
| **Deploy**            | Netlify atau Vercel (project terpisah dari website porto)                                                                         |
| **Env variables**     | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NETLIFY_BUILD_HOOK_URL`, `ADMIN_EMAIL` |

---

### 3.2 Halaman & Routing

| Route                 | Halaman       | Deskripsi                                                             |
| --------------------- | ------------- | --------------------------------------------------------------------- |
| `/login`              | Login         | Form magic link — masukkan email, klik "Send Magic Link"              |
| `/auth/callback`      | Auth callback | Handler redirect setelah klik magic link di email                     |
| `/dashboard`          | Dashboard     | Overview stats: total proyek, published, draft, last updated          |
| `/projects`           | Daftar proyek | List semua proyek per kategori + drag & drop reorder + toggle publish |
| `/projects/new`       | Tambah proyek | Form buat proyek baru + upload gambar                                 |
| `/projects/[id]/edit` | Edit proyek   | Form edit semua field + kelola galeri gambar                          |
| `/settings`           | Site settings | Edit tagline, bio, kontak, social links                               |

---

### 3.3 Fitur: Manajemen Proyek

Berdasarkan struktur website thuangarchitect.com yang sudah ada, berikut spesifikasi yang disesuaikan dengan konten dan layout aktual.

#### Inventaris proyek saat ini

Website saat ini memiliki 18 proyek aktif dalam 2 kategori:

| Kategori    | Proyek                                                                                                                                                     | Jumlah    |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- |
| Komersial   | Brastagi, Cakalang, CBD Polonia, Gudang MMTC, Kalimantan Sampit, Mangkubumi Manado, Multatuli, Shemade                                                     | 8 proyek  |
| Residential | Cemara Hijau, De Cassa Villa, GG Rukun, Lexington, Maldives Citraland, Metal Raya, Rochester Citraland, Royal Sumatra, Sari Mas, Setia Jadi, Tembakau Deli | 10 proyek |

Jumlah gambar per proyek bervariasi — Royal Sumatra memiliki 17 gambar, Brastagi 4 gambar. Admin panel harus mampu menangani hingga 20+ gambar per proyek.

#### Struktur URL & kategori

URL proyek mengikuti pola: `/portfolio/{kategori}/{slug}/`

- Kategori saat ini: `komersial` dan `residential` (huruf kecil, sesuai URL).
- Kategori bersifat **fixed 2 pilihan** — tidak perlu input bebas. Gunakan radio button atau select dengan 2 opsi saja.
- Slug diturunkan dari judul proyek (lowercase, spasi jadi tanda hubung). Contoh: `CBD Polonia` → `cbd-polonia`.
- **Slug mempengaruhi URL publik** — jika slug diubah setelah publish, URL lama akan broken. Beri peringatan di UI jika slug proyek published diubah.

#### Form tambah / edit proyek

Field disesuaikan dengan konten yang benar-benar tampil di website saat ini:

| Field                 | Tipe Input     | Required | Keterangan                                                                                                                                                                                        |
| --------------------- | -------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Judul proyek          | Text input     | Ya       | Tampil sebagai heading di halaman detail & card portfolio. Huruf kapital semua (sesuai style website).                                                                                            |
| Slug                  | Text input     | Ya       | Auto-generate dari judul, editable. Menentukan URL: `/portfolio/{kategori}/{slug}/`                                                                                                               |
| Kategori              | Radio / Select | Ya       | 2 pilihan fixed: `Komersial` atau `Residential`. Menentukan segmen URL dan pengelompokan di halaman portfolio.                                                                                    |
| Deskripsi proyek      | Textarea       | Ya       | Satu paragraf singkat yang muncul di halaman detail proyek. Contoh aktual: _"Brastagi is a commercial architecture project focused on clean structure, material precision, and spatial clarity."_ |
| Cover image           | Image picker   | Ya       | Gambar yang tampil sebagai thumbnail di halaman `/portfolio/`. Dipilih dari galeri gambar proyek yang sudah diupload.                                                                             |
| Urutan dalam kategori | Number input   | Ya       | Angka urutan tampil di dalam kategorinya. Semakin kecil angka, semakin atas posisinya.                                                                                                            |
| Status publish        | Toggle         | Ya       | Draft = tidak tampil di website. Published = tampil. Default: Draft.                                                                                                                              |
| Navigasi prev/next    | Auto           | —        | Otomatis dihitung dari urutan proyek dalam kategori yang sama. Tidak perlu diisi manual.                                                                                                          |

> **Field yang TIDAK diperlukan** (tidak ada di website saat ini): tahun proyek, lokasi, featured/hero, deskripsi panjang/rich text, tag.

#### Galeri gambar per proyek

Ini adalah fitur utama dan terberat dari admin panel. Setiap proyek memiliki galeri gambar yang tampil berurutan di halaman detail.

- Admin bisa upload multiple gambar sekaligus (drag files atau klik untuk browse).
- **Compress otomatis di client** sebelum upload menggunakan `browser-image-compression`: resize ke max lebar 1920px (sesuai konvensi nama file existing: `-1920.webp`), quality 85%, output format WebP.
- Progress bar per file saat proses compress + upload berlangsung.
- Setelah upload, semua gambar tampil sebagai grid thumbnail yang bisa di-scroll.
- Admin drag & drop thumbnail untuk **reorder urutan gambar** dalam galeri — urutan ini adalah urutan tampil di website.
- Gambar pertama dalam urutan otomatis menjadi kandidat cover image (bisa diganti manual).
- Admin bisa hapus gambar individual — menghapus file dari Supabase Storage sekaligus record dari database `project_images`.
- Tidak ada batas jumlah gambar per proyek — sistem harus mampu handle 20+ gambar (Royal Sumatra: 17 gambar).

#### Reorder proyek antar kategori

Halaman `/projects` menampilkan proyek dikelompokkan per kategori (Komersial dan Residential), masing-masing sebagai daftar sortable:

- Dua section terpisah: section Komersial di atas, section Residential di bawah.
- Admin drag & drop card proyek untuk mengatur urutan dalam kategorinya masing-masing.
- Proyek tidak bisa dipindah antar kategori lewat drag — ganti kategori harus lewat form edit proyek.
- Tombol "Simpan urutan" untuk commit semua perubahan ke database.
- Perubahan urutan otomatis trigger Netlify rebuild webhook.

#### Navigasi prev / next proyek

Di halaman detail proyek, ada navigasi "Previous" dan "Next" ke proyek lain dalam kategori yang sama (contoh: di Brastagi ada tombol `Next: CAKALANG`). Logika ini dihasilkan otomatis saat build time berdasarkan `sort_order` dalam kategori — tidak ada field manual di admin panel.

#### Migrasi proyek existing

18 proyek yang sudah ada harus dimigrasikan dari file statis ke Supabase sebelum admin panel digunakan. Pendekatan:

1. Buat migration script (Node.js) yang fetch gambar dari URL existing di thuangarchitect.com.
2. Upload setiap gambar ke Supabase Storage bucket `portfolio-images`.
3. Insert record ke tabel `projects` dan `project_images` sesuai data yang sudah ada.
4. Set `sort_order` sesuai urutan tampil saat ini di halaman `/portfolio/`.
5. Set `is_published = true` untuk semua proyek existing.

> Migration script ini perlu dibuat terpisah sebagai one-time script — bukan bagian dari admin panel UI.

---

### 3.4 Fitur: Trigger Rebuild

Setiap aksi yang mengubah konten publik harus trigger rebuild Netlify:

- Buat Next.js API route: `POST /api/trigger-build`
- Route ini memanggil Netlify Build Hook URL (env variable `NETLIFY_BUILD_HOOK_URL`).
- Trigger otomatis dipanggil setelah: simpan proyek, hapus proyek, toggle publish, reorder, simpan site settings.
- Di UI, tampilkan status: `"Memicu rebuild..."` lalu `"Rebuild berhasil dipicu. Website akan terupdate ~1-2 menit."`
- Tambahkan cooldown 30 detik untuk mencegah trigger berulang terlalu cepat.

```ts
// /api/trigger-build/route.ts
export async function POST() {
  await fetch(process.env.NETLIFY_BUILD_HOOK_URL!, { method: 'POST' });
  return Response.json({ ok: true });
}
```

---

### 3.5 Fitur: Authentication

Flow login menggunakan Supabase magic link:

```ts
// Kirim magic link
const { error } = await supabase.auth.signInWithOtp({
  email: inputEmail,
  options: {
    emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
  },
});

// /auth/callback/route.ts — tukar code jadi session
const code = searchParams.get('code');
await supabase.auth.exchangeCodeForSession(code);
// redirect ke /dashboard
```

Whitelist email di middleware untuk keamanan tambahan:

```ts
// middleware.ts
const {
  data: { session },
} = await supabase.auth.getSession();
if (!session) return redirect('/login');
if (session.user.email !== process.env.ADMIN_EMAIL) {
  await supabase.auth.signOut();
  return redirect('/login?error=unauthorized');
}
```

---

### 3.6 Fitur: Site Settings

Halaman `/settings` berisi satu form untuk mengedit konten global website:

- Nama studio / brand
- Tagline
- Bio singkat arsitek
- Email kontak publik
- Nomor telepon / WhatsApp
- Link Instagram
- Link Google Maps

Simpan settings otomatis trigger rebuild Netlify.

---

### 3.7 Keamanan

| Aspek              | Implementasi                                                                             |
| ------------------ | ---------------------------------------------------------------------------------------- |
| Autentikasi        | Supabase Auth magic link. Session disimpan di cookie HttpOnly via `@supabase/ssr`.       |
| Route protection   | Middleware Next.js cek session + whitelist email. Redirect ke `/login` jika tidak valid. |
| Service role key   | Hanya digunakan di server-side (API routes / server actions). TIDAK di-expose ke client. |
| Build hook URL     | Env variable server-side saja. Tidak di-expose ke browser.                               |
| Input sanitization | Validasi input di server sebelum masuk database menggunakan `zod`.                       |
| CORS               | Admin panel hanya diakses oleh 1 user. Tidak perlu CORS khusus.                          |

---

## 4. Netlify Setup — Website Porto

### 4.1 Build Hook

1. Netlify Dashboard > Site > Build & deploy > **Build hooks**.
2. Klik **Add build hook**.
3. Nama: `admin-trigger`, branch: `main`.
4. Copy URL yang digenerate.
5. Paste URL ke env variable `NETLIFY_BUILD_HOOK_URL` di admin panel.

### 4.2 Environment Variables Website Porto

Di Netlify Dashboard > Site > Environment variables, tambahkan:

| Variable                    | Nilai                               |
| --------------------------- | ----------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`  | `https://[project-ref].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Key dari Supabase > Settings > API  |

> Website porto hanya memerlukan `service_role` key saat **BUILD TIME** untuk fetch semua data proyek. Setelah build selesai, key ini tidak digunakan sama sekali oleh visitor.

### 4.3 `next.config.js` Website Porto

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // static export untuk Netlify
  images: { unoptimized: true }, // pakai Netlify Image CDN
  trailingSlash: true,
};

module.exports = nextConfig;
```

---

## 5. Checklist Implementasi

### 5.1 Supabase

- [ ] Buat project Supabase baru (gunakan project dev terpisah, bukan production)
- [ ] Jalankan SQL: buat tabel `projects`, `project_images`, `site_settings`
- [ ] Jalankan SQL: buat trigger `updated_at`
- [ ] Enable RLS di semua tabel
- [ ] Buat policy SELECT publik untuk `projects` dan `project_images`
- [ ] Buat bucket `portfolio-images` (public)
- [ ] Set storage policy: INSERT & DELETE authenticated only, SELECT public
- [ ] Enable Email auth (magic link), matikan confirm email
- [ ] Tambahkan email admin di Authentication > Users
- [ ] Set Site URL dan Redirect URL di Auth config
- [ ] Catat: Project URL, anon key, service_role key

### 5.2 Migration Script (one-time)

- [ ] Buat script Node.js terpisah untuk migrasi 18 proyek existing
- [ ] Script fetch gambar dari URL thuangarchitect.com (18 proyek, total ~100+ gambar)
- [ ] Upload semua gambar ke Supabase Storage bucket `portfolio-images`
- [ ] Insert data proyek ke tabel `projects` (title, slug, category, description, sort_order, cover_image_url)
- [ ] Insert semua gambar ke tabel `project_images` dengan sort_order sesuai urutan filename existing
- [ ] Set `is_published = true` untuk semua 18 proyek
- [ ] Verifikasi: cek total record di database, cek sample URL gambar bisa diakses
- [ ] **Jalankan migration SEBELUM deploy admin panel dan SEBELUM update website porto ke static export**

### 5.3 Admin Panel

- [ ] Init Next.js project baru: `npx create-next-app@latest admin-thuang`
- [ ] Install dependencies: `@supabase/supabase-js @supabase/ssr dnd-kit browser-image-compression zod`
- [ ] Setup env variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NETLIFY_BUILD_HOOK_URL`, `ADMIN_EMAIL`
- [ ] Buat Supabase client (server + client helper)
- [ ] Buat `middleware.ts` untuk route protection + email whitelist
- [ ] Buat halaman `/login` dengan form magic link
- [ ] Buat halaman `/auth/callback`
- [ ] Buat `/dashboard` dengan overview stats
- [ ] Buat `/projects` dengan list per kategori + drag & drop reorder
- [ ] Buat `/projects/new` dan `/projects/[id]/edit` dengan form lengkap
- [ ] Buat upload gambar: multi-file, compress, progress bar, grid reorder
- [ ] Buat `/settings` dengan form site settings
- [ ] Buat API route `/api/trigger-build`
- [ ] Test semua flow: login, CRUD proyek, upload gambar, reorder, trigger rebuild
- [ ] Deploy admin panel ke Netlify / Vercel dev (project terpisah)

### 5.4 Website Porto (Dev Environment)

- [ ] Update `next.config.js`: `output: 'export'`, `images: { unoptimized: true }`
- [ ] Update data fetching: fetch dari Supabase saat build time (`generateStaticParams`)
- [ ] Tambahkan env variable `SUPABASE_SERVICE_ROLE_KEY` di Netlify website porto dev
- [ ] Buat Netlify Build Hook, copy URL ke admin panel env
- [ ] Test full flow: upload di admin → trigger rebuild → cek website porto terupdate
- [ ] **Setelah semua OK di dev → replikasi ke production**

---

## 6. Catatan & Batasan

|                        |                                                                                                                                                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Waktu update**       | Setelah admin simpan, website terupdate dalam ~1-2 menit (waktu Netlify build). Bukan real-time — sesuai untuk update bulanan.                                                                                     |
| **Environment dev**    | Gunakan Netlify akun/project terpisah untuk dev & testing. Jangan langsung di production sampai semua flow sudah diverifikasi.                                                                                     |
| **Kategori fixed**     | Hanya 2 kategori: `komersial` dan `residential`. Sesuai struktur website saat ini. Jika perlu kategori baru di masa depan, perlu perubahan di kode Next.js juga, bukan hanya database.                             |
| **Migrasi 18 proyek**  | Sebelum admin panel aktif, 18 proyek existing harus dimigrasikan ke Supabase via one-time migration script. Gambar di-fetch dari URL lama lalu diupload ke bucket. Estimasi waktu: 30–60 menit tergantung koneksi. |
| **Jumlah gambar**      | Royal Sumatra memiliki 17 gambar — proyek dengan gambar terbanyak saat ini. Sistem harus diuji mampu handle minimal 25 gambar per proyek untuk headroom ke depan.                                                  |
| **Slug immutable**     | Slug proyek published sebaiknya tidak diubah karena mempengaruhi URL publik. Admin panel harus memberi peringatan jelas jika slug proyek published akan diubah.                                                    |
| **Free tier Supabase** | Free tier: 500MB database, 1GB storage, project pause setelah 1 minggu tidak aktif. Untuk ~18 proyek, storage 1GB cukup untuk ratusan gambar WebP 1920px. Upgrade ke Pro ($25/bln) jika tidak ingin project pause. |
| **Backup**             | Export data berkala dari Supabase Dashboard > Database > Backups. Gambar bisa di-download dari Storage bucket.                                                                                                     |
| **Admin 1 user**       | Sistem dirancang untuk 1 admin saja. Tidak ada fitur multi-user / role.                                                                                                                                            |

---

_Dokumen ini dibuat berdasarkan diskusi arsitektur untuk thuangarchitect.com dengan stack Next.js Static Export + Supabase + Netlify._

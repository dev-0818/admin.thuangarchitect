# Admin Panel thuangarchitect.com

Admin panel ini dibangun mengikuti PRD di [prd.md](./prd.md) dan arah visual dari referensi `stitch` dengan tema "Digital Monolith".

## Stack

- Next.js App Router
- Tailwind CSS
- Supabase Auth + Database + Storage
- DnD Kit untuk reorder project/gallery
- Zod untuk validasi
- Netlify build hook trigger

## Halaman

- `/login`
- `/auth/callback`
- `/dashboard`
- `/projects`
- `/projects/new`
- `/projects/[id]/edit`
- `/settings`

## Setup

1. Copy `.env.example` ke `.env.local`
2. Isi env Supabase dan Netlify
3. Jalankan `npm install`
4. Jalankan `npm run dev`

## Catatan Implementasi

- Jika env Supabase belum diisi, panel tetap bisa dirender memakai mock data untuk preview UI.
- Whitelist admin dicek saat auth callback terhadap `ADMIN_EMAIL`.
- Rebuild Netlify dipicu setelah save project, reorder, toggle publish, dan save settings.
- Upload gallery mengompres image ke WebP di client sebelum upload ke bucket `portfolio-images`.

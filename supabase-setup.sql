-- 1. Enable UUID extension
create extension if not exists "pgcrypto";

-- 2. Projects table
create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  category text not null,
  description text,
  cover_image_url text,
  sort_order integer default 0,
  is_published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Project images table
create table if not exists project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  alt_text text,
  sort_order integer default 0,
  created_at timestamptz default now()
);

-- 4. Site settings table
create table if not exists site_settings (
  id integer primary key default 1,
  site_title text,
  tagline text,
  bio text,
  email text,
  phone text,
  instagram_url text,
  whatsapp_url text,
  google_maps_url text,
  updated_at timestamptz default now()
);

-- 5. Seed default row
insert into site_settings (id)
values (1)
on conflict (id) do nothing;

-- 6. Auto-update updated_at trigger function
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 7. Triggers
drop trigger if exists set_updated_at on projects;
create trigger set_updated_at
before update on projects
for each row execute function update_updated_at();

drop trigger if exists set_updated_at_settings on site_settings;
create trigger set_updated_at_settings
before update on site_settings
for each row execute function update_updated_at();

-- 8. Enable RLS
alter table projects enable row level security;
alter table project_images enable row level security;
alter table site_settings enable row level security;

-- 9. Public read policies
drop policy if exists "Public read published projects" on projects;
create policy "Public read published projects"
on projects for select
using (is_published = true);

drop policy if exists "Public read project images" on project_images;
create policy "Public read project images"
on project_images for select
using (
  exists (
    select 1
    from projects
    where projects.id = project_images.project_id
      and projects.is_published = true
  )
);

-- 10. Storage policies for bucket: portfolio-images
drop policy if exists "Authenticated upload" on storage.objects;
create policy "Authenticated upload"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-images');

drop policy if exists "Public read images" on storage.objects;
create policy "Public read images"
on storage.objects for select
using (bucket_id = 'portfolio-images');

drop policy if exists "Authenticated delete" on storage.objects;
create policy "Authenticated delete"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-images');

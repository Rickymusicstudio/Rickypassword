-- =====================================================================
-- rickypassword.com — content database (songs, news, gallery) + uploads
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to re-run.
-- Then change the email at the bottom to the one you sign in with.
-- =====================================================================

-- ---------- Admins: only these emails can edit content ----------
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- (no policies: the table is only readable through is_admin() below)

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Songs ----------
create table if not exists public.songs (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  released_at  date,
  cover_url    text,
  audio_url    text,
  youtube_url  text,
  youtube_only boolean not null default false,
  can_download boolean not null default true,
  published    boolean not null default true,
  legacy_sku   text unique,          -- set by the one-time import of the old songs.js
  created_at   timestamptz not null default now()
);

-- ---------- News ----------
create table if not exists public.news (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title       text not null,
  date        date not null default current_date,
  excerpt     text,
  content     text,                  -- paragraphs separated by a blank line
  cover_url   text,
  images      text[] not null default '{}',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- Gallery ----------
create table if not exists public.gallery (
  id          uuid primary key default gen_random_uuid(),
  image_url   text not null,
  caption     text,
  taken_on    date default current_date,
  legacy_file text unique,           -- set by the one-time import of the old gallery.js
  created_at  timestamptz not null default now()
);

-- ---------- Row level security: everyone reads published, admins write ----------
alter table public.songs   enable row level security;
alter table public.news    enable row level security;
alter table public.gallery enable row level security;

drop policy if exists "read published songs" on public.songs;
create policy "read published songs" on public.songs for select using (published or public.is_admin());
drop policy if exists "admins write songs" on public.songs;
create policy "admins write songs" on public.songs for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read published news" on public.news;
create policy "read published news" on public.news for select using (published or public.is_admin());
drop policy if exists "admins write news" on public.news;
create policy "admins write news" on public.news for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "read gallery" on public.gallery;
create policy "read gallery" on public.gallery for select using (true);
drop policy if exists "admins write gallery" on public.gallery;
create policy "admins write gallery" on public.gallery for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------- Storage: one public "media" bucket for covers, MP3s and photos ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/gif','audio/mpeg','audio/mp3','audio/mp4','audio/x-m4a','audio/wav'])
on conflict (id) do update set public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "admins upload media" on storage.objects;
create policy "admins upload media" on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins update media" on storage.objects;
create policy "admins update media" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
drop policy if exists "admins delete media" on storage.objects;
create policy "admins delete media" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------- YOUR admin email (change this, then run again) ----------
insert into public.admins (email) values ('CHANGE-ME@example.com') on conflict do nothing;

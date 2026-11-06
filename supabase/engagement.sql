-- =====================================================================
-- rickypassword.com — likes and comments on songs
-- Paste into Supabase → SQL Editor → Run (after schema.sql). Safe to re-run.
-- =====================================================================

-- ---------- Likes: one per song per browser ----------
-- visitor_id is a random id kept in the fan's browser (no account, no personal data).
create table if not exists public.song_likes (
  song_id    uuid not null references public.songs (id) on delete cascade,
  visitor_id text not null check (visitor_id ~ '^[0-9a-f-]{36}$'),
  created_at timestamptz not null default now(),
  primary key (song_id, visitor_id)
);
alter table public.song_likes enable row level security;

drop policy if exists "read likes" on public.song_likes;
create policy "read likes" on public.song_likes for select using (true);
-- no insert/delete policies: fans go through the two functions below

create or replace function public.like_song(p_song uuid, p_visitor text, p_like boolean)
returns integer
language plpgsql security definer
set search_path = public
as $$
begin
  if p_visitor !~ '^[0-9a-f-]{36}$' then
    raise exception 'bad visitor id';
  end if;
  if p_like then
    insert into song_likes (song_id, visitor_id) values (p_song, p_visitor) on conflict do nothing;
  else
    delete from song_likes where song_id = p_song and visitor_id = p_visitor;
  end if;
  return (select count(*) from song_likes where song_id = p_song);
end;
$$;
grant execute on function public.like_song(uuid, text, boolean) to anon, authenticated;

-- ---------- Comments ----------
create table if not exists public.song_comments (
  id         uuid primary key default gen_random_uuid(),
  song_id    uuid not null references public.songs (id) on delete cascade,
  name       text not null check (char_length(btrim(name)) between 1 and 40),
  body       text not null check (char_length(btrim(body)) between 1 and 500),
  created_at timestamptz not null default now()
);
create index if not exists song_comments_song_idx on public.song_comments (song_id, created_at desc);
alter table public.song_comments enable row level security;

drop policy if exists "read comments" on public.song_comments;
create policy "read comments" on public.song_comments for select using (true);

-- anyone can post (name + message only), at most 5 comments per minute site-wide per song
drop policy if exists "post comments" on public.song_comments;
create policy "post comments" on public.song_comments for insert to anon, authenticated
  with check (
    (select count(*) from public.song_comments c
      where c.song_id = song_comments.song_id and c.created_at > now() - interval '1 minute') < 5
  );

-- visitors may only fill in these three fields (so they can't fake created_at to dodge the limit)
revoke insert on public.song_comments from anon, authenticated;
grant insert (song_id, name, body) on public.song_comments to anon, authenticated;

-- only admins can delete (moderation in /admin → Comments)
drop policy if exists "admins delete comments" on public.song_comments;
create policy "admins delete comments" on public.song_comments for delete to authenticated
  using (public.is_admin());

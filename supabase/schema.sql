-- =============================================================================
-- SUPABASE SCHEMA FOR `wall-react` (2008 Facebook-Style Wall Reimagined)
-- =============================================================================
-- Run this entire script inside the Supabase SQL Editor for your `wall-react`
-- database project. It is idempotent (safe to run multiple times).
-- =============================================================================

-- 1. Enable UUID extension if not already enabled
create extension if not exists "pgcrypto";

-- 2. Create the `posts` table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Alex Rivera',
  content text not null default '' check (char_length(content) <= 280),
  image_url text,
  created_at timestamptz not null default now(),
  constraint posts_content_or_image_check check (
    char_length(trim(content)) > 0 or image_url is not null
  )
);

-- Create index for newest-first feed queries
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- 3. Enable Row Level Security (RLS) - No login required (Public read & insert)
alter table public.posts enable row level security;

drop policy if exists "Anyone can view wall posts" on public.posts;
create policy "Anyone can view wall posts"
  on public.posts
  for select
  to anon, authenticated
  using (true);

drop policy if exists "Anyone can share a wall post" on public.posts;
create policy "Anyone can share a wall post"
  on public.posts
  for insert
  to anon, authenticated
  with check (
    char_length(content) <= 280
    and (char_length(trim(content)) > 0 or image_url is not null)
  );

-- 4. Enable Supabase Realtime for live feed updates without refresh
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'posts'
  ) then
    alter publication supabase_realtime add table public.posts;
  end if;
end $$;

-- 5. Create Storage Bucket `wall-photos` for photo uploads (up to 5MB, JPG/PNG/GIF/WEBP)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wall-photos',
  'wall-photos',
  true,
  5242880, -- 5MB in bytes
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Storage RLS Policies for `wall-photos`
drop policy if exists "Public Access to Wall Photos" on storage.objects;
create policy "Public Access to Wall Photos"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'wall-photos');

drop policy if exists "Anyone can upload a Wall Photo" on storage.objects;
create policy "Anyone can upload a Wall Photo"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'wall-photos');

-- 6. Seed initial posts (or refresh default author name if needed)
update public.posts
set author_name = 'Alex Rivera'
where author_name = 'Greg Wientjes';

insert into public.posts (author_name, content, image_url, created_at)
select * from (
  values
    (
      'Alex Rivera',
      'Late-night ship session — Supabase Realtime + Next.js is officially live on the Wall. Drop a message or photo below!',
      '/images/late-night-ship.jpg',
      now() - interval '1 minute'
    ),
    (
      'Maya Lin',
      'Golden hour walk up the foothills trail to clear my head after shipping the new design system.',
      '/images/palo-alto-trail.jpg',
      now() - interval '12 minutes'
    ),
    (
      'Marcus Vance',
      'There was something special about the 2008 web—no algorithms, just a chronological wall where friends left notes.',
      null,
      now() - interval '38 minutes'
    ),
    (
      'Elena Rostova',
      'Tested the live sync across two browser windows—the spring entrance animation on new posts feels super snappy.',
      null,
      now() - interval '2 hours'
    ),
    (
      'Devon Brooks',
      'Just pulled an all-nighter debugging WebSockets. Turns out a good espresso and clean SQL schemas solve 90% of problems.',
      null,
      now() - interval '5 hours'
    )
) as seed(author_name, content, image_url, created_at)
where not exists (select 1 from public.posts limit 1);

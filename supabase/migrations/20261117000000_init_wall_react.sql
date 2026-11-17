-- =============================================================================
-- SUPABASE MIGRATION: 20261117000000_init_wall_react.sql
-- Project: wall-react
-- =============================================================================

create extension if not exists "pgcrypto";

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_name text not null default 'Greg Wientjes',
  content text not null default '' check (char_length(content) <= 280),
  image_url text,
  created_at timestamptz not null default now(),
  constraint posts_content_or_image_check check (
    char_length(trim(content)) > 0 or image_url is not null
  )
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'wall-photos',
  'wall-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

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


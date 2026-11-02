-- Videos for the "Watch & learn" section on the home page, managed in /admin/videos.
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  youtube_url text not null,
  title text,
  product_id uuid references public.products(id) on delete set null,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.videos enable row level security;
drop policy if exists "anyone can view videos" on public.videos;
create policy "anyone can view videos" on public.videos for select using (true);
drop policy if exists "admins manage videos" on public.videos;
create policy "admins manage videos" on public.videos for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Start with the videos already on the home page (one per product video), so nothing disappears.
insert into public.videos (youtube_url, title, product_id, sort)
select youtube_url, name, id, row_number() over (order by created_at desc)
from (
  select distinct on (youtube_url) youtube_url, name, id, created_at
  from public.products
  where youtube_url is not null and youtube_url <> ''
  order by youtube_url, created_at desc
) p
where not exists (select 1 from public.videos);

select sort, title, youtube_url from public.videos order by sort;

-- YouTube video link for each product
alter table public.products add column if not exists youtube_url text;

-- Test videos (real reef videos) on the sample products. Replace them from the admin panel later.
update public.products set youtube_url = 'https://www.youtube.com/watch?v=4_KLx3308j8' where category = 'Lighting' and youtube_url is null;
update public.products set youtube_url = 'https://www.youtube.com/watch?v=7KG9N_r638Y' where category in ('Salt & Supplements', 'Additives') and youtube_url is null;
update public.products set youtube_url = 'https://www.youtube.com/watch?v=5Z9ozwMSfxQ' where youtube_url is null;

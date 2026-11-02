-- Logos for the "Shop by brand" strip, managed in /admin/brands.
-- Brands themselves still come from each product's Brand field; this table only
-- holds the logo (and an optional display name) for a brand.
create table if not exists public.brands (
  key text primary key,               -- the brand name in lowercase, e.g. "teco"
  name text,                          -- display name, if different from the product's Brand
  logo_url text,
  created_at timestamptz not null default now()
);

alter table public.brands enable row level security;
drop policy if exists "anyone can view brands" on public.brands;
create policy "anyone can view brands" on public.brands for select using (true);
drop policy if exists "admins manage brands" on public.brands;
create policy "admins manage brands" on public.brands for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- A row for every brand already used by a product, ready for its logo
insert into public.brands (key, name)
select distinct lower(btrim(brand)), btrim(brand)
from public.products
where brand is not null and btrim(brand) <> ''
on conflict (key) do nothing;

select key, name, logo_url from public.brands order by key;

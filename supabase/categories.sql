-- Marjan: categories managed from the admin dashboard.
-- Run once. Safe to run again.

-- 1) Tables
create table if not exists public.categories (
  name text primary key check (length(trim(name)) > 0),
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.subcategories (
  category text not null references public.categories(name) on update cascade on delete cascade,
  name text not null check (length(trim(name)) > 0),
  sort integer not null default 0,
  primary key (category, name)
);

-- 2) Start with the store's current categories
insert into public.categories (name, sort) values
  ('Heating & Cooling', 1), ('Salt & Additives', 2), ('Filtration', 3), ('Pumps & Powerheads', 4), ('Used', 5)
on conflict (name) do nothing;

insert into public.subcategories (category, name, sort) values
  ('Heating & Cooling', 'Chillers', 1),
  ('Salt & Additives', 'Salt Mix', 1),
  ('Filtration', 'Solid Filters', 1),
  ('Pumps & Powerheads', 'Return Pumps', 1),
  ('Used', 'Pumps', 1), ('Used', 'Chillers', 2), ('Used', 'Filtration', 3), ('Used', 'Other', 4)
on conflict (category, name) do nothing;

-- Any category already used by a product but missing above gets added, so nothing breaks
insert into public.categories (name, sort)
select distinct p.category, 100 from public.products p
where p.category is not null and not exists (select 1 from public.categories c where c.name = p.category)
on conflict do nothing;

-- 3) Link products to categories:
--    renaming a category renames it on all its products; a category with products cannot be deleted.
alter table public.products drop constraint if exists products_category_fk;
alter table public.products add constraint products_category_fk
  foreign key (category) references public.categories(name) on update cascade on delete restrict;

-- 4) Who can do what: everyone can read, only admins can change
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;

drop policy if exists "anyone can view categories" on public.categories;
create policy "anyone can view categories" on public.categories for select using (true);
drop policy if exists "admins manage categories" on public.categories;
create policy "admins manage categories" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "anyone can view subcategories" on public.subcategories;
create policy "anyone can view subcategories" on public.subcategories for select using (true);
drop policy if exists "admins manage subcategories" on public.subcategories;
create policy "admins manage subcategories" on public.subcategories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- 5) Renaming a subcategory also renames it on its products (admins only)
create or replace function public.rename_subcategory(p_category text, p_old text, p_new text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.subcategories set name = trim(p_new) where category = p_category and name = p_old;
  update public.products set subcategory = trim(p_new) where category = p_category and subcategory = p_old;
end $$;

-- Check: should list the categories with their subcategories
select c.sort, c.name as category, string_agg(s.name, ', ' order by s.sort) as subcategories
from public.categories c left join public.subcategories s on s.category = c.name
group by c.sort, c.name order by c.sort;

-- Delivery fees: store-wide settings, plus a fee saved on each order.

-- 1) Settings the owner edits in /admin/delivery
create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;
drop policy if exists "anyone can view settings" on public.settings;
create policy "anyone can view settings" on public.settings for select using (true);
drop policy if exists "admins manage settings" on public.settings;
create policy "admins manage settings" on public.settings for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Starting rules: 100 EGP delivery, free inside Cairo, free for orders over 10,000 EGP
insert into public.settings (key, value) values (
  'delivery',
  '{"fee": 100, "freeOver": 10000, "freeCities": ["Cairo"], "perCity": {}}'::jsonb
) on conflict (key) do nothing;

-- 2) Each order keeps the delivery fee and total it was placed with
alter table public.orders add column if not exists delivery_fee numeric;
alter table public.orders add column if not exists total numeric;

-- Older orders: no delivery fee was recorded, so the total is the subtotal
update public.orders set total = subtotal where total is null;

select value from public.settings where key = 'delivery';

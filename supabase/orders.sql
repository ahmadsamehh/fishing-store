-- Order history for signed-in customers
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  user_id uuid not null references auth.users(id) on delete cascade,
  items jsonb not null,
  subtotal numeric not null,
  full_name text,
  phone text,
  city text,
  address text,
  location text,
  notes text,
  message text,
  status text not null default 'sent',
  created_at timestamptz not null default now()
);

alter table public.orders enable row level security;

create policy "customers can view their own orders"
  on public.orders for select to authenticated
  using (auth.uid() = user_id or public.is_admin());
create policy "customers can create their own orders"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id);
create policy "admins can update orders"
  on public.orders for update to authenticated
  using (public.is_admin());

-- One saved cart per customer account
create table if not exists public.carts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  items jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.carts enable row level security;

create policy "customers can view their own cart"
  on public.carts for select to authenticated using (auth.uid() = user_id);
create policy "customers can create their own cart"
  on public.carts for insert to authenticated with check (auth.uid() = user_id);
create policy "customers can update their own cart"
  on public.carts for update to authenticated using (auth.uid() = user_id);

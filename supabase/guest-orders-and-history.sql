-- 1) Save guest orders too (no account needed)
alter table public.orders alter column user_id drop not null;

drop policy if exists "guests can create orders" on public.orders;
create policy "guests can create orders"
  on public.orders for insert to anon
  with check (user_id is null and status = 'sent');

drop policy if exists "customers can create their own orders" on public.orders;
create policy "customers can create their own orders"
  on public.orders for insert to authenticated
  with check (auth.uid() = user_id and status = 'sent');

-- 2) Remember who changed an order's status
alter table public.orders add column if not exists status_updated_by uuid references auth.users(id) on delete set null;
alter table public.orders add column if not exists status_updated_by_name text;

create table if not exists public.order_status_history (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  status text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_by_name text,
  changed_at timestamptz not null default now()
);
alter table public.order_status_history enable row level security;
drop policy if exists "admins can view status history" on public.order_status_history;
create policy "admins can view status history"
  on public.order_status_history for select to authenticated
  using (public.is_admin());

-- The database fills these in itself, so they cannot be faked from the browser.
create or replace function public.order_status_changed()
returns trigger language plpgsql security definer set search_path = public as $$
declare who text;
begin
  if new.status is distinct from old.status then
    select coalesce(a.name, u.email) into who
      from auth.users u left join public.admins a on a.user_id = u.id
      where u.id = auth.uid();
    new.status_updated_at := now();
    new.status_updated_by := auth.uid();
    new.status_updated_by_name := coalesce(who, 'Admin');
    insert into public.order_status_history (order_id, status, changed_by, changed_by_name)
      values (new.id, new.status, auth.uid(), new.status_updated_by_name);
  end if;
  return new;
end $$;

create or replace function public.order_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.order_status_history (order_id, status, changed_by, changed_by_name, changed_at)
    values (new.id, new.status, new.user_id, case when new.user_id is null then 'Guest' else 'Customer' end, new.created_at);
  return new;
end $$;

drop trigger if exists orders_status_changed on public.orders;
create trigger orders_status_changed before update of status on public.orders
  for each row execute function public.order_status_changed();

drop trigger if exists orders_created on public.orders;
create trigger orders_created after insert on public.orders
  for each row execute function public.order_created();

-- Start the history for orders that already exist
insert into public.order_status_history (order_id, status, changed_by, changed_by_name, changed_at)
select o.id, 'sent', o.user_id, 'Customer', o.created_at
from public.orders o
where not exists (select 1 from public.order_status_history h where h.order_id = o.id);

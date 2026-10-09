-- Order status tracking
alter table public.orders add column if not exists status_updated_at timestamptz;

alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('sent', 'confirmed', 'out_for_delivery', 'delivered', 'cancelled'));

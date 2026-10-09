-- Display names for admins (shown in the admin panel sidebar)
alter table public.admins add column if not exists name text;

drop policy if exists "admins can read their own row" on public.admins;
create policy "admins can read their own row"
  on public.admins for select to authenticated
  using (user_id = auth.uid());

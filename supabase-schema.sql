-- Brain Playground cloud admin schema
-- Run through Supabase migrations.

create table if not exists public.app_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

drop policy if exists "public read app config" on public.app_config;
create policy "public read app config"
on public.app_config for select
to anon, authenticated
using (id = 'main');

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read"
on public.admin_users
for select
to authenticated
using (user_id = (select auth.uid()));

drop policy if exists "authenticated update app config" on public.app_config;
drop policy if exists "admin update app config" on public.app_config;
create policy "admin update app config"
on public.app_config for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

insert into public.app_config (id, data)
values ('main', jsonb_build_object(
  'announcement', '',
  'games', '{}'::jsonb,
  'ads', jsonb_build_object('enabled', true, 'list', jsonb_build_array())
))
on conflict (id) do nothing;

alter table public.app_config replica identity full;
alter publication supabase_realtime add table public.app_config;
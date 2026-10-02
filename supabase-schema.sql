-- Brain Playground cloud admin schema
-- Run this once in the Supabase SQL Editor.

create table if not exists public.app_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Public app clients may read the published configuration.
create policy "public read app config"
on public.app_config for select
to anon, authenticated
using (id = 'main');

-- Only authenticated users may update configuration.
-- After creating your admin account, restrict this policy to that account
-- by replacing the USING/WITH CHECK expressions with an auth.uid() check.
create policy "authenticated update app config"
on public.app_config for update
to authenticated
using (true)
with check (true);

insert into public.app_config (id, data)
values ('main', jsonb_build_object(
  'announcement', '',
  'games', '{}'::jsonb
))
on conflict (id) do nothing;

alter table public.app_config replica identity full;

-- Enable Realtime for instant content updates.
alter publication supabase_realtime add table public.app_config;

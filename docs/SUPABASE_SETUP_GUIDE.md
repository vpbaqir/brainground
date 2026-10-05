# ⚡ Supabase Setup & Production Deployment Guide

This guide walks you through connecting Brain Playground to Supabase in 3 simple steps.

---

## Step 1: Run SQL in Supabase Dashboard

1. Open your Supabase project dashboard at [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab on the left menu.
3. Click **New query**, paste the SQL block below, and click **Run**:

```sql
-- 1. Configuration Table
create table if not exists public.app_config (
  id text primary key,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.app_config enable row level security;

-- Public read for mobile and web apps
drop policy if exists "public read app config" on public.app_config;
create policy "public read app config"
on public.app_config for select
to anon, authenticated
using (id = 'main');

-- 2. Admin Users Table
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin self read" on public.admin_users;
create policy "admin self read"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Admin write policies for app_config
drop policy if exists "admin update app config" on public.app_config;
create policy "admin update app config"
on public.app_config for update
to authenticated
using (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

drop policy if exists "admin insert app config" on public.app_config;
create policy "admin insert app config"
on public.app_config for insert
to authenticated
with check (exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

-- Seed initial row
insert into public.app_config (id, data)
values ('main', jsonb_build_object(
  'rev', 1,
  'announcement', 'Welcome to Brain Playground!',
  'games', '{}'::jsonb,
  'ads', jsonb_build_object('enabled', true, 'list', jsonb_build_array())
))
on conflict (id) do nothing;

-- Enable Realtime
alter table public.app_config replica identity full;
alter publication supabase_realtime add table public.app_config;

-- 3. Storage Bucket for Sponsor Logos
insert into storage.buckets (id, name, public) 
values ('sponsor-logos', 'sponsor-logos', true) 
on conflict (id) do nothing;

drop policy if exists "logos public read" on storage.objects;
create policy "logos public read" on storage.objects for select 
using (bucket_id = 'sponsor-logos');

drop policy if exists "logos admin insert" on storage.objects;
create policy "logos admin insert" on storage.objects for insert to authenticated
with check (bucket_id = 'sponsor-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));

drop policy if exists "logos admin delete" on storage.objects;
create policy "logos admin delete" on storage.objects for delete to authenticated
using (bucket_id = 'sponsor-logos' and exists (select 1 from public.admin_users a where a.user_id=(select auth.uid())));
```

---

## Step 2: Create Admin User & Grant Permissions

1. Go to **Authentication > Users** in Supabase and click **Add User** (Create user with your email and a strong password).
2. Go back to the **SQL Editor**, replace `YOUR_EMAIL@EXAMPLE.COM` with your email, and run:

```sql
insert into public.admin_users (user_id)
select id from auth.users where email = 'YOUR_EMAIL@EXAMPLE.COM'
on conflict do nothing;
```

---

## Step 3: Configure GitHub Secrets (For Automated Builds)

Go to your GitHub repository: **Settings > Secrets and variables > Actions**, and add:

| Secret Name | Value | Where to find |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Supabase Dashboard > Project Settings > API > Project URL |
| `SUPABASE_ANON_KEY` | `eyJhbGciOi...` | Supabase Dashboard > Project Settings > API > Project API keys (`anon` / `public`) |

---

## Step 4: Login to Cloud Admin Panel

1. Open your admin panel (e.g. `http://localhost:3001/admin` or `https://vpbaqir.github.io/brainground/docs/`).
2. Go to **More > Supabase Cloud Credentials**.
3. Paste your **Project URL** and **Anon Key**, then click **Save Credentials**.
4. Sign in with your admin email and password.
5. You can now publish updates live to devices worldwide!

# Vercel + Supabase setup for Brain Playground

The website reads its public Supabase client settings from the Vercel runtime-config function. This lets the web app and admin panel use the same project without storing credentials manually in each browser.

## Configure Vercel

1. Open the **brainground** project in Vercel.
2. Open **Settings → Environment Variables**.
3. Add these variables for **Production** (and Preview if you use preview deployments):
   - `SUPABASE_URL`: your Supabase Project URL, such as `https://xxxx.supabase.co`.
   - `SUPABASE_ANON_KEY`: your Supabase publishable/anon client key.
4. Redeploy the latest branch/deployment after saving the variables.

These two values are browser-visible public client configuration. Never put a Supabase service-role key or other secret in these variables or the runtime-config endpoint.

## Configure Supabase

1. Run the repository's root `supabase-schema.sql` in the Supabase SQL Editor.
2. Run `supabase/migration-002-admin-v2.sql` after the base schema.
3. Create the admin user in Supabase Authentication, then add that user's UUID to `public.admin_users` using the instructions in `docs/SUPABASE_SETUP_GUIDE.md`.
4. Verify Row Level Security is enabled and only users listed in `admin_users` can publish configuration.

## Verify

- Open `/api/runtime-config`. It should return a JavaScript assignment with the configured project URL and key. If values are empty, check Vercel environment variables and redeploy.
- Open the website and admin panel in a fresh/private browser window. The Cloud Sync status should no longer say credentials are missing once the values are configured.
- Sign in with the authorized admin user, publish a small test change, and verify it appears on another device.

This change only supplies configuration. It does not create a Supabase project, populate secrets, grant admin permissions, or guarantee that cloud sync is working until the steps above are completed.

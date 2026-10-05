# Brain Playground (kids)

Kids brain-games Android app (WebView) with a cloud admin panel.

- `app/` Android app. Game code is `app/src/main/assets/index.html`.
- `docs/index.html` Admin panel (GitHub Pages, branch `main`, folder `/docs`).
- `docs/privacy.html` Privacy policy page for Play Store.
- `supabase/` SQL: run `supabase-schema.sql` first (root), then `supabase/migration-002-admin-v2.sql`.
- `store/LISTING_AND_RELEASE.md` Play Store text and release checklist.
- `.github/workflows/` APK and AAB builds.

## Setup
1. Supabase: run both SQL files, create an admin user, add it: `insert into admin_users select id from auth.users where email='YOU' on conflict do nothing;`
2. GitHub secrets: SUPABASE_URL, SUPABASE_ANON_KEY (and for AAB: SIGNING_KEYSTORE_BASE64, SIGNING_STORE_PASSWORD, SIGNING_KEY_ALIAS, SIGNING_KEY_PASSWORD).
3. Edit `docs/index.html`: replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY (anon key is public by design).
4. Replace YOUR_EMAIL in `docs/privacy.html` and `store/LISTING_AND_RELEASE.md`.
5. Settings > Pages > main / docs.

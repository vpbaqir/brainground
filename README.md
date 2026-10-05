# Brain Playground (kids)

Kids brain-games Android app (WebView) with a cloud admin panel.

- `app/` Android app. Game code is `app/src/main/assets/index.html`.
- `docs/index.html` Admin panel (GitHub Pages, branch `main`, folder `/docs`).
- `docs/privacy.html` Privacy policy page for Play Store.
- `supabase/` SQL: run `supabase-schema.sql` first (root), then `supabase/migration-002-admin-v2.sql`.
- `store/LISTING_AND_RELEASE.md` Play Store text and release checklist.
- `.github/workflows/` APK and AAB builds.

## Documentation & Quick Guides

- **Supabase Setup**: Follow [docs/SUPABASE_SETUP_GUIDE.md](file:///d:/baqworl/kids-repo/docs/SUPABASE_SETUP_GUIDE.md) for 3-step project setup and copy-paste SQL.
- **Play Store Release & Listing**: Follow [store/LISTING_AND_RELEASE.md](file:///d:/baqworl/kids-repo/store/LISTING_AND_RELEASE.md).
- **Keystore Generation**: Run the GitHub Action `.github/workflows/generate-keystore.yml` via `workflow_dispatch` to generate your production release keystore in 1 click.
- **Docker Deployment**: Build and run locally with `docker build -t brainplayground . && docker run -p 3001:3001 brainplayground`.

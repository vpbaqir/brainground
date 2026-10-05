# Brain Playground — Play Store listing and release checklist

## Listing text
**App name (30 max):** Brain Playground: Kids Games
**Short description (80 max):** Fun 5-minute brain games for kids: logic, memory, maths and words.
**Full description (4000 max):**
Brain Playground turns a few spare minutes into brain training that kids actually want to repeat.

20 short games, 5 quick rounds each, covering six skills:
• Reasoning: pattern detective, logic clues, shape sequence, balance scale, odd word out
• Memory: echo, backwards echo, memory match, digit flash, what is missing
• Maths: number chef, speed sums, make the target, greater or less
• Focus: sharp eye, colour clash, count flash
• Language: word builder and missing letter in English, Malayalam and Arabic
• Spatial: mirror match

Why parents like it
• Difficulty adapts to your child, so it stays challenging but fair
• Progress by skill in a PIN-protected Parent corner
• No accounts, no chat, no in-app purchases, no ads from ad networks
• Works with your child's nickname only; progress stays on the device

Why kids like it
• Daily challenge with double stars
• Streaks, stars and badges to collect
• Bright, friendly design and playful sounds

Short sessions, steady growth. Download and play today.

## Store settings
- Category: Education (or Educational > Brain games). Tags: Brain games, Puzzle, Educational.
- Contact email: YOUR_EMAIL. Website: your GitHub Pages URL. Privacy policy: <GitHub Pages URL>/privacy.html
- Target audience: you decide the age band (suggest 6-12; do NOT include under-5 unless you test for it). Choosing children makes the app subject to the Families Policy, so keep it free of ad networks and personal-data collection (current design is).
- Ads: choose "No, my app does not contain ads". Sponsor cards are first-party content, not an ad network. Keep them clearly labelled "Sponsored".
- Content rating (IARC questionnaire): no violence, no sexual content, no user-generated content, no chat, no purchases, no location. Expect an "Everyone" style rating.
- News app / government / health / financial features: all No.

## Data safety form (answer honestly, re-check against Play Console wording)
- Personal info collected: none sent off device (child name stays on device).
- Data shared with third parties: none.
- Data collected: the content download request exposes IP address to Supabase, Google Fonts and jsDelivr. If Play Console asks about IP addresses, declare "collected, not shared, used for app functionality, not optional". Safest: self-host the font and library (see To do) and then declare nothing.
- Encryption in transit: yes (HTTPS). Deletion request: nothing stored on our side; user can uninstall or Reset progress.

## Assets to prepare
- Icon 512x512 PNG, feature graphic 1024x500, at least 4 phone screenshots (use funda-end style: Home, a game, results, Rewards). Say "make store graphics" and I will build them.
- App signing: keep the upload keystore backed up outside GitHub. Enrol in Play App Signing.

## Release steps
1. GitHub secrets set: SUPABASE_URL, SUPABASE_ANON_KEY, SIGNING_KEYSTORE_BASE64, SIGNING_STORE_PASSWORD, SIGNING_KEY_ALIAS, SIGNING_KEY_PASSWORD. (ADMOB_* no longer needed.)
2. Run workflow "Build Brain Playground Play Store AAB", download the .aab artifact.
3. Play Console: create app, upload AAB to Internal testing, add yourself, install on a real phone, run the test list below.
4. New personal developer accounts must run a closed test with at least 12 testers for 14 days before applying for production. Check the current rule in Play Console; it changes.
5. Complete: App content (privacy, ads, audience, data safety, rating), store listing, then apply for production.
6. Bump versionCode in app/build.gradle for every upload.

## Test list on a real phone
- First open: name entry, home loads, Back from a game returns Home
- All 20 games complete a round; Malayalam and Arabic word games render correctly
- Parent corner: set PIN, wrong PIN lock, recovery, Change name, Reset progress dialogs appear
- Airplane mode: app still opens with cached content
- Admin: edit a game name and publish; phone updates within ~10 s; maintenance mode on/off works
- Sponsor card: tap asks for PIN, then opens the browser

## To do before production
- Self-host Plus Jakarta Sans and supabase-js inside app assets (removes outside requests, works offline, simplest Data safety answer).
- Replace YOUR_EMAIL in privacy.html and here.
- Apple App Store later: needs a Mac or cloud build service, a developer account, and Capacitor wrapper; Kids Category rules are stricter.

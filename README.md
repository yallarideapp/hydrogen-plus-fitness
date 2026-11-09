# Hydrogen Plus Fitness & Spa

Bilingual English/Arabic gym website built with React 19, TypeScript, Vinext and Cloudflare D1 on OpenAI Sites.

## Included

- Responsive gym website using the real logo and public facility photographs.
- 35 classes transcribed from the published 7–12 November 2026 women's timetable; filters, instructor names and class enquiries. Past classes cannot be requested.
- Club tour, membership, training and contact enquiries stored in D1 with a reference and initial pending status. No payment or automatic SMS/email notification is sent.
- ChatGPT sign-in, private member requests, workout logs, optional weight records/chart, individual deletion and account-data deletion.
- Session stopwatch, rest countdown and session-local exercise checklist.
- Staff inbox at `/staff`, protected on the server by an explicit email allowlist. Search/filter and update enquiries to pending, contacted, confirmed or cancelled. Staff cannot see workouts or weight records.
- Server-rendered English/Arabic privacy and terms pages, sitemap, unchecked consent controls and server validation.

## Local development

Use Node 22.13+.

```sh
npm run dev -- --port 5173
```

Portable development has a local mock sign-in at `/signin-with-chatgpt?return_to=/%23member`. Production identity is supplied by the hosting platform; the application does not manage passwords.

Generate schema changes with `npm run db:generate`. The initial migration is `drizzle/0000_skinny_cerise.sql`. After a build creates `dist/server/wrangler.json`, apply pending local migrations using the command documented in `backend-notes.md` / the Sites starter documentation. Sites applies hosted migrations when deploying. Local and hosted databases are separate.

```sh
npx tsc --noEmit
npm run build
```

## Staff setup

Set the production runtime environment variable `GYM_ADMIN_EMAILS` to comma-separated approved staff email addresses using Sites environment-variable tools. Never commit credentials. The server denies staff access when the list is absent or the signed-in email is not listed. This variable has deliberately not been guessed or configured.

## Content and launch details

- Official pages: https://www.instagram.com/hydrogenplusfitness/ and https://www.facebook.com/hydrogenplusfitness . Facility imagery also comes from the public JoMaps business listing.
- Confirmed contact: +962 7 9215 1000. Al-Husn Street, opposite Granada College, Irbid, Jordan.
- Instagram hours: men 6AM–midnight; women 8AM–11PM. Holiday hours must be confirmed.
- `lib/schedule.ts` contains a dated timetable, not a live Instagram feed. Update the timetable and its displayed date together when the gym publishes a new one.
- Membership pricing, exact spa inclusions, commercial/refund policies and operational retention schedules still require the gym's confirmation. No invented prices or testimonials are displayed.
- Legal copy lives in `lib/legal.ts`. The operator should review the text and confirm retention practices before general public launch. This is not legal advice; I'm not a lawyer.
- New Sites start owner-private. Publishing this version preserves that audience.

See `backend-notes.md` for API contracts, privacy inventory and integration-test evidence.

## November 2026 update — service pages and full Instagram import

**Full Instagram history.** All **225 posts** on the profile on 8 November 2026 (plus one collaborative reel) are now in `lib/instagram-posts.json` — 226 entries, up from 94. The post list and dates came from a signed-in browser session (read-only); captions and media came from each post's official public embed. 162 new photos/posters went into `public/images/archive/`, 35 new reels into `public/videos/` (re-encoded to 720p H.264 for the web; untouched originals are in `social-originals/instagram-videos/`, outside the deployed folder). Raw embed data is in `social-originals/instagram-data/`. Facebook's 65 reels mirror the Instagram reels, and the Facebook page still has no reviews, so no further Facebook content was added. Story highlights (Courses, Pilates, Feedback, Opening, Contact Us) were read for facts — for example the second phone line and the kids' swimming course — but are not stored as media.

**One page per service** (`lib/services.ts`, template `components/gym/ServicePage.tsx`): `/services` plus
`/services/gym`, `/ladies`, `/group-classes`, `/pilates`, `/martial-arts`, `/pool-spa`, `/swimming-academy`, `/kids`, `/personal-training`, `/hydro-rest`, `/lounge`, `/events`. Each page has a bilingual overview, a "As published by the club" panel (every price and time shows its publication date and source post, and older offers are flagged "Past post"), videos (local MP4s play inline; others link to Instagram), a photo gallery with lightbox, the related Instagram posts, FAQs and related services. Posts are assigned to services in `lib/service-posts.json` (edit the JSON to move a post between pages).

**New features**
- `/offers` — News & offers: a filterable timeline of every hours change, holiday closure, launch and membership offer published (Feb 2025 – Nov 2026).
- `/contact` — map (loads Google Maps only on click), both phone lines, e-mail (`hydrogenplusfitness@gmail.com`, from the 2025 pool poster), WhatsApp, live open/closed status per area, first-visit steps.
- `/calculators` — BMI, daily calories (Mifflin–St Jeor, with a safe minimum), macros, one-rep max, heart-rate zones, water and tape-measure body fat; bilingual, metric.
- `/coaches` — coaches named on the timetable and in posts, their classes this week, "ask to train with" enquiries, guest coaches listed separately.
- `/careers` — the last published vacancy (female trainers, Aug 2025) with the CV WhatsApp number from that post.
- Site-wide: Services mega-menu, Offers in the main nav, live "Open now" bar (Asia/Amman time), floating contact button (call / WhatsApp / e-mail / directions), larger minimum font sizes in the shell, a services section on the home page, links from each Club space to its service page, schema.org `ExerciseGym` data in `app/layout.tsx`, and every new route in `sitemap.xml`.
- Performance: 640-px WebP thumbnails for every archive image in `public/images/thumbs/`; the home page now receives its three social posts from the server instead of bundling the whole archive.

**Still needs the gym's confirmation:** current membership prices (the latest published offer is Dec 2025), whether 079 215 1000 answers WhatsApp (no post confirms it), this winter's pool hours, and gym personal-training prices (never published).

## Social archive and original photography

`/community` now contains a dated snapshot of94verified Instagram posts and108Facebook entries.151entries contain locally retained media;51Facebook photo entries link to originals that require source access. This is not a claim that the whole account history has been imported: Instagram reports224posts and Facebook reports242photos, and public scrolling hit login walls. See `ig-ingestion-report.md` and `facebook-ingestion-report.md` for retrieval methods and exact limitations. A Meta account export or authorized signed-in access is needed for the remaining history.

The archive preserves full captions, all41slides from10Instagram carousels,125original Instagram image/poster files and11native video files, plus57Facebook assets. Historical offers remain dated archive content and are not current price quotes. Caption integrity was checked against all94official embeds;25appended Instagram comment-interface tails were removed.

Main photography uses the actual2048×1365gym and pool carousel originals; the class poster is3277×4096. Display WebPs retain the same pixel dimensions. No images were upscaled or generated. `lib/site-media.ts` records the selected sources. `lib/social-posts.ts` combines/normalizes the imported metadata; no live Meta feed or scheduled synchronization is implied.

## Admin panel (preview mode) — November 2026

Open `/admin` (GitHub Pages: https://yallarideapp.github.io/hydrogen-plus-fitness/admin/).

- **Edits everything:** website texts (every bilingual string, home banner first), service pages (headings, highlights, prices & details, FAQ, News & offers timeline, Hydro Rest menu), all prices in one tab, the class timetable, phones/WhatsApp/e-mail/address/social links/opening hours, site photos, brand colour and an announcement bar.
- **Preview mode:** GitHub Pages has no server, so edits are stored in the browser (`localStorage` key `hp-admin-preview`, photos in IndexedDB `hp-admin`) and applied to the site in that browser only. Backup & settings → Export/Import JSON moves them between browsers. Live mode (Cloudflare Worker + D1, password, publish to every visitor) is the next step («الربط»); the overrides shape in `lib/admin/overrides.ts` is what the Worker will store.
- **How it works:** `lib/admin/overrides.ts` holds the sparse overrides, validation (`sanitize`) and hooks (`useOverrides`, `useSiteInfo`, `useSchedule`, `useService`). `SiteShell`'s `t(en, ar)` and `useWords()` route every text through the overrides; `PhotoSwapper` swaps replaced photos.
- **After changing site texts or photos in the code**, regenerate the admin catalogs: `node scripts/admin-catalog.mjs` (writes `lib/admin/text-catalog.json` and `photo-catalog.json`).

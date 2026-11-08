# Instagram archive ingestion — 8 November 2026

The site includes **94 verified Instagram posts** with their **full original captions, canonical post links, publication dates and all media exposed by their official public embeds**. These include collaborative posts actually visible on the gym’s Posts/Reels grids. This is an accessible archive, **not a claim to contain all 224 posts reported by the profile**.

## Coverage and access

- Source profile: https://www.instagram.com/hydrogenplusfitness/ .
- Native browser enumeration attempted 15 scrolls, 69 browser steps, 268 seconds. Instagram redirected unauthenticated profile/post visits to its login/signup wall; terminal history was not reached. No configured authenticated browser profile was available.
- Public `fetch_content` exposed the first Posts and Reels tiles. Search pagination (all supported pages 0–10), topic queries and month queries then identified additional historical permalinks.
- **213 distinct candidate post/reel IDs were examined**. **94** were accepted after verifying the actual official embed owner, or confirming the collaborative post was on the gym’s own initial grid. Other candidates were unrelated suggested-account results or unavailable embeds, and were excluded rather than mislabeled.
- Imported dated history spans **5 January 2025–6 November 2026**. No complete chronology before that date is asserted.
- Full 224-post completeness cannot be established without an authenticated export or authorized account/API access. Removed posts, private posts, expired stories, highlights, comments, and media hidden behind login are not represented as recovered.

## Original media and quality

- **125 original JPEG photos/posters** downloaded locally, plus **11 original MP4 videos**.
- **125 archive media entries**: 114 image entries (including source posters for video-only links) and 11 locally playable videos.
- **10 carousel posts, 41 total original carousel slides**. Slides came from each post’s actual `edge_sidecar_to_children` data, never from the unrelated suggested-post grid.
- **35 video posts**: 11 locally playable MP4s; the other 24 retain their exact local source poster, complete caption and canonical Instagram link. Video downloads were capped at 50 MiB to keep the site package manageable.
- Image width range in archive entries: **640–3277 pixels**. **103 media entries are at least 1080 pixels wide**. Older video posters can have lower source resolution; their dimensions are recorded honestly.
- Original JPEG bytes: **43,647,023**. Original MP4 bytes: **52,227,264**. No AI generation, AI upscaling, enlargement, recompression, cropping or color edits were applied to these archive originals.
- Image dimensions were read from the downloaded files via `sips`. Video dimensions were read from downloaded MP4 track headers. Every listed local source/poster path was checked to exist.

## Best actual photographs for the main site

All paths below are under `public/`.

- **Hero:** `/images/archive/ig-DMnZ4_JqiH2-03.jpg` — 2048×1365, wide equipment floor, long HYDROGEN turf track, red machines and ceiling lights.
- **Cardio:** `/images/archive/ig-DMnZ4_JqiH2-01.jpg` — 2048×1365, cardio equipment, actual gym.
- **Strength:** `/images/archive/ig-DMnZ4_JqiH2-05.jpg` — 2048×1365, red strength machines.
- **Free weights:** `/images/archive/ig-DMnZ4_JqiH2-07.jpg` — 2048×1365, actual dumbbell/weight area.
- **Rooftop pool:** `/images/archive/ig-DM2gP2wRIst-01.jpg` — 2048×1365, sunset pool, lounge and Jordan flag. Five original pool photos are available under that post ID.
- **Latest class schedule:** `/images/archive/ig-DfZrJukouow-01.jpg` — 3277×4096, week 7–12 November 2026.
- **Pilates:** `/images/archive/ig-DNbCr-etD9t-01.jpg` — 1080×1350, gym’s actual historical Pilates offer poster. Historical prices must not be described as a current quote.
- **Pilates studio video:** `/videos/ig-DOFDqSvAIq4-01.mp4` — original 720×1280, with `/images/archive/ig-DOFDqSvAIq4-01.jpg` poster.
- **Children’s boxing:** `/videos/ig-DfVAy3ctiXa-01.mp4` — original 720×1280, with `/images/archive/ig-DfVAy3ctiXa-01.jpg` poster. Collaborative reel visible on the gym’s Reels tab.

Gym equipment carousel source: https://www.instagram.com/p/DMnZ4_JqiH2/ . Pool carousel source: https://www.instagram.com/p/DM2gP2wRIst/ .

## Data and provenance

- `lib/instagram-posts.json` is the application’s unified JSON array: `{ id, source, url, publishedAt, caption, kind, media }` plus owner/source/provenance fields.
- `public/images/archive/manifest.json` contains the same posts plus examined IDs and retrieval date.
- Media objects include durable local `src`, intrinsic `width` and `height`, original source URL and byte count. Video objects include local `poster` where available. Canonical post links remain the durable external source when signed CDN URLs expire.
- Captions preserve original Arabic/English spelling, emojis, hashtags and line breaks. They are not summaries. All 94 posts have a nonempty original caption, publication date and local media.
- Publication timestamps come from public page metadata when available; day-only dates come from the official Instagram page’s displayed publication date and do not invent a time.
- Old offers, timetables and opening-hour announcements are historical posts. Current prices/availability should be confirmed with the gym.

## Verification

- JSON parsed successfully.
- 94 distinct post IDs; no empty captions, dates or media.
- All 125 archive media paths and every local video poster path exist.
- All 41 carousel media items are preserved.
- No literal escaped newline/unicode sequences remain in captions.
- Instagram did not expose an authenticated terminal archive, so complete 224-post coverage remains unverified.


## Final caption integrity audit

Re-fetched all 94 official public embeds. Preferred exact embed JSON captions; for image-only HTML captions, excluded the structural `CaptionUsername` and `CaptionComments` subtrees. Removed only proven trailing Instagram UI text from 25 captions. Original business wording, emojis, hashtags, line breaks and directional controls were preserved.

- `ig-DfUx69noyO7`: removed trailing `View all 8 comments`.
- `ig-DNQsXJkozGu`: removed trailing `View all 9 comments`.
- `ig-DMFtCWLqPGa`: removed trailing `View all 20 comments`.
- `ig-DdYRaVDIeMj`: removed trailing `View all 5 comments`.
- `ig-DbYWJMxFVaA`: removed trailing `View all 7 comments`.
- `ig-DbGGLMEFW7M`: removed trailing `View all 5 comments`.
- `ig-DaiJG_2FeyK`: removed trailing `View all 8 comments`.
- `ig-DaVOb2yDzqM`: removed trailing `View all comments`.
- `ig-DXxHK9OiO8k`: removed trailing `View all 12 comments`.
- `ig-DXbm2lNCCy-`: removed trailing `View all 36 comments`.
- `ig-DV_7hW4iD8o`: removed trailing `View all comments`.
- `ig-DUS1pVJiGPl`: removed trailing `View all 8 comments`.
- `ig-DT-jAGZCK3C`: removed trailing `View all 5 comments`.
- `ig-DTalm1CjMlO`: removed trailing `View all comments`.
- `ig-DSiOd0ej8q3`: removed trailing `View all 17 comments`.
- `ig-DRzaDFIgOFX`: removed trailing `View all comments`.
- `ig-DPOwmObDD_m`: removed trailing `View all comments`.
- `ig-DOEibRvDN3a`: removed trailing `View all 8 comments`.
- `ig-DLzgFD6xGJA`: removed trailing `View all comments`.
- `ig-DLh1EwQxlEq`: removed trailing `View all comments`.
- `ig-DKzcyOdREim`: removed trailing `View all 6 comments`.
- `ig-DKKR7eKi0i-`: removed trailing `View all 7 comments`.
- `ig-DGY05anoW6E`: removed trailing `View all 7 comments`.
- `ig-DFksC9UMX82`: removed trailing `View all comments`.
- `ig-DEzwKt5M9EM`: removed trailing `View all comments`.

Unresolved source differences/access errors: 0.

Also corrected one caption-derived image alt value (`ig-DGY05anoW6E`) whose 180-character truncation had captured part of the same proven comments UI suffix.

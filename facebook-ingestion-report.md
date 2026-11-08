# Facebook public archive ingestion

Fetched 2026-11-08 from the gym's own public Facebook page, videos, reels, photo grid and four listed albums. Main deliverable: `lib/facebook-posts.json` (a plain array). Assets are stored under `public/images/facebook/`.

## Actual delivered counts

- **108 distinct Facebook records:** 29 reels/videos and 79 photo records.
- **57 local image assets:** all 29 reel covers, the latest class schedule, and 27 accessible album/grid thumbnails.
- **21 reel covers are at least 1080 pixels wide**, with original dimensions up to 1290 × 2294. The remaining reel covers are native 640/720-pixel-wide source images; they were not artificially enlarged.
- **51 photo records are source-only:** exact observed Facebook URLs with an empty caption and media array, explicitly marked `availability: "source-only"`.
- Every available asset has dimensions measured from the downloaded file. Facebook's `mx…` URL metadata and the browser agent's claimed maximum sizes were not substituted for actual file dimensions.
- All accessible published captions are retained. Photo captions hidden behind login are empty, rather than replaced with Facebook's automated "May be an image…" descriptions. Publication dates are included only when visible; missing dates were not inferred from an image filename or a historical promotion mentioned in its caption.

## Coverage and limitations

The public album index lists **Photos: 242 items**, **Mobile uploads: 17**, **Profile pictures: 4**, and **Cover photos: 4**. Those are platform album counts and must not be added together as a verified count of unique posts.

A read-only browser run made two successful public scrolls and inspected the album structure before the login modal blocked photo detail, captions, dates and original image views. Its summary claimed 69 documented photo links, but its returned array contained **66 distinct photo records**; this report uses the actual returned array. Additional public album links increased the delivered photo count to 79. Some browser-returned photo/media associations conflicted with directly fetched album ordering; directly observed album mappings took precedence. Unsigned/truncated URLs were not treated as downloadable original images. Nine signed thumbnail downloads returned HTTP 403 and were retained as source-only records; no access-control bypass was attempted.

The public videos and related-reel links exposed 29 verified reels published by Hydrogen Plus Fitness & Spa. Traversal of that exposed graph reached no additional distinct IDs. Downloadable original cover images were available, but the public extraction did not expose playable MP4 URLs. Therefore video records contain a local image cover and a canonical Facebook watch link; they do not claim that a local video file exists. Users can watch the originals on Facebook.

This is a **partial public archive**, not the complete historical Facebook account. Hidden photos, unavailable carousel slides, stories, comments, and login-only posts are not represented as recovered content. A signed-in export or original files would be required to guarantee a complete archive. No account login, credential entry, private content access or automated posting occurred.

## New verified facilities

These statements come from the gym's own published captions; historical offers remain historical content, not current price promises:

- Boxing, MMA and Jujitsu: https://www.facebook.com/reel/25176030555314516/ and https://www.facebook.com/reel/1475121240230393/
- Dedicated Pilates room: https://www.facebook.com/reel/622573390695999/
- Cycling/Pilates/Boxing & MMA rooms: https://www.facebook.com/reel/1459968188657867/
- Swimming pool and spa: https://www.facebook.com/reel/794506652957080/
- Hydro Rest healthy food, proteins and nutrition consultations: https://www.facebook.com/reel/811318521468613/
- Children's swimming with North Sharks Academy: https://www.facebook.com/reel/1929615304246565/ and https://www.facebook.com/reel/4547227362267381/ — the caption includes a historical course start date; current sessions require confirmation.
- Hosting Al-Hussein club training: https://www.facebook.com/reel/2113690009528331/ — describes a published event, not an invented permanent sponsorship.
- Hydrogen Lounge: https://www.facebook.com/reel/1353706342989583/ — historical summer hours and admission wording should stay within its dated/archive context, not be advertised as verified current hours.

## Recommended real imagery

- `/images/facebook/29208208885512448.jpg`: 1206 × 2144, upright actual strength floor/training track; native cover includes title text.
- `/images/facebook/1504673063897066.jpg`: 1080 × 1920, actual strength floor with athlete; content is sideways in the original cover. A counter-clockwise display rotation yields a 1920 × 1080 landscape view without inventing scene detail.
- `/images/facebook/622573390695999.jpg`: 1080 × 1920, upright Pilates reformer room.
- `/images/facebook/25176030555314516.jpg`: 1080 × 1920, upright MMA training scene.
- `/images/facebook/1021575590089067.jpg`: 1080 × 1920, upright real outdoor pool scene.
- `/images/facebook/1459968188657867.jpg`: 1080 × 1920, real cycling room; source image is sideways and includes a rotation prompt.
- `/images/facebook/811318521468613.jpg`: 1080 × 1920, real protein shop; source image is sideways.
- `/images/facebook/794506652957080.jpg`: 1080 × 1920, **parking lot cover frame**, despite its pool/spa caption. Do not label this image as a pool photograph.
- `/images/facebook/1730028531395205.jpg`: 1206 × 2144, intentionally blurred interview cover; inappropriate as the main clear facility photograph.

## Data shape

Each entry has `id`, `source: "facebook"`, `url`, optional `publishedAt`, original available `caption`, `kind`, `media`, and a content `category`. `media` entries contain local `src`, measured `width`/`height`, and `kind: "image"`. Video post covers are images; playback is via the post's canonical Facebook URL. Photo thumbnail records have `availability: "thumbnail"`; unrecovered records have `availability: "source-only"`.

Raw fetch evidence, browser output, download results and exact count summaries are saved in ignored `outputs/facebook/` for inspection. No backend or API files were changed by this ingestion task.

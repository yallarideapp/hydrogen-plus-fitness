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

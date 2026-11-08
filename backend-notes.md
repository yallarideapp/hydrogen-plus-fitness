# Gym data API

The application stores records in Cloudflare D1 using the `DB` binding. Drizzle's `0000_skinny_cerise.sql` migration creates three tables and their indexes. The migration contains only schema changes and must be applied locally for preview; Sites applies hosted migrations on publication.

## Data inventory

- `gym_requests`: name, normalized phone, optional email, request kind, optional interest/date/message, optional authenticated user ID, optional client-generated idempotency UUID, reference, pending status, consent time, creation time.
- `gym_workouts`: authenticated user ID, workout name, duration in minutes, date, optional notes, consent time and creation time.
- `gym_measurements`: authenticated user ID, weight in kilograms, date, consent time and creation time.

Identity comes from dispatch-owned Sign in with ChatGPT. Only stable user IDs identify ownership. Staff access requires the signed-in email address to match the comma-separated `GYM_ADMIN_EMAILS` runtime allowlist, ignoring case and surrounding whitespace. An absent or empty allowlist denies access; it never makes the first signed-in visitor an administrator. The application does not store passwords, payment cards, IP addresses, tracking identifiers, or auth cookies. Platform authentication and operational logs are handled outside these routes.

All personal-data POST forms must require an unchecked consent checkbox and send `consent: true`. No automated expiry job is implemented: records remain until user deletion or operator action. Anonymous requests are not automatically linked to a later sign-in; visitors can contact the gym with their reference and phone to request correction/deletion. The operator's retention policy and operational process remain to be confirmed.

## Routes

- `POST /api/requests`: `{kind: 'tour'|'membership'|'class'|'training'|'contact', name, phone, email?, interest?, preferredDate?, message?, consent:true, clientRequestId?:UUID}`. Returns `{reference,status:'pending',request:{id,reference,status,kind,createdAt}}` and HTTP 201. Retry with the same client UUID returns the existing reference and its current status, provided phone, kind and signed-in user match. New requests are inquiries only; no payment, reservation, membership activation or automatic staff notification is implied. Staff can review and change an inquiry's status in the protected inbox. At most eight requests per normalized phone per hour.
- `GET /api/member`: authenticated only; returns `{user:{displayName,email},requests,workouts,measurements}`. Requests are newest first, capped at 100. Workouts/measurements are newest date first, capped at 500 each. The UI should not describe the capped lists as an unlimited lifetime total.
- `POST /api/workouts`: `{name,duration:number,date:'YYYY-MM-DD',notes?,consent:true}` returns `{workout}`. Duration must be an integer between 1 and 600 minutes.
- `POST /api/measurements`: `{weight:number,date:'YYYY-MM-DD',consent:true}` returns `{measurement}`. Weight range is 20–400 kg.
- `DELETE /api/workouts?id=UUID` and `DELETE /api/measurements?id=UUID`: delete one record belonging to the signed-in user; other users' IDs return 404.
- `DELETE /api/member?scope=data`: deletes the signed-in user's requests, workouts and measurements in one D1 batch. It does not delete the visitor's ChatGPT account.
- `GET /api/staff`: requires authenticated allowlisted staff before any database access. Returns the latest 200 requests with contact and inquiry fields and `{stats:{pending,total}}` across all requests. Account identifiers and client retry tokens are omitted.
- `PATCH /api/staff`: requires authenticated allowlisted staff. JSON `{id:UUID,status:'pending'|'contacted'|'confirmed'|'cancelled'}` updates an inquiry and returns `{request}`. It does not charge a payment or activate a membership. Missing allowlist returns HTTP 403 with `error:'setup-required'`; configured but unauthorized users receive a generic 403.

All dates must be genuine calendar dates. History dates are limited to today in Asia/Amman or the previous five years; preferred request dates are limited to today or the next 365 days. Request JSON is capped at 16,384 characters and declared content length is checked. Invalid inputs return 400, unauthenticated member operations return 401, cross-origin browser writes return 403, and database errors return a generic 503 without SQL or personal data. Responses use `Cache-Control: private, no-store`.

## Verification

- `npm run db:generate` succeeded and generated migration was inspected.
- `npx tsc --noEmit --pretty false` passed after the initial API implementation.
- Fifteen focused runtime checks passed for Asia/Amman date boundaries, impossible and future history dates, consent enforcement, cross-origin writes, JSON/body size checks, and generic server error responses.
- Local D1 migration applied successfully using the built Wrangler configuration.
- Forty-five live API integration checks passed on `http://127.0.0.1:5173`: consent/auth enforcement, invalid dates, duplicate request handling, actual persistence, signed-in request association, workout/measurement validation, private no-store responses, cross-user record isolation, own-record deletion and bulk deletion. A separate fake user's records survived the bulk deletion. All temporary local records were cleaned; no production records were touched.
- Five staff denial checks passed: anonymous GET/PATCH return 401; signed-in GET/PATCH with missing allowlist return 403 `setup-required`; cross-origin staff PATCH returns 403. `npx tsc --noEmit --pretty false` passed after adding the staff API.
- Twenty-eight additional staff integration checks passed against the final built Worker on a separate local preview with a temporary CLI allowlist. These covered case-insensitive staff authorization, anonymous/ordinary-member denial, request/stat retrieval, omitted account/retry identifiers, unsupported statuses, unknown requests, cross-origin writes, all four status transitions, and visibility of status changes in the request owner's member area. The temporary request was deleted and the alternate preview stopped; no runtime allowlist was committed or configured in production.

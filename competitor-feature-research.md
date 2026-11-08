# Gym website feature research

Reviewed 8 November 2026 using public, official websites only. This is a product/UX comparison, not permission to copy competitor photography, text, workout videos, brand names, commercial terms or services into Hydrogen.

## Recommendation

Hydrogen already has a strong photographic storefront, a dated women’s timetable, enquiries, a member account, workout/weight logs, request status, and an extensive social archive. The biggest gap is the journey between **discovering an experience** and **taking a useful next step**. Add a real club explorer, better class discovery, a goal-led membership/coach finder, a first-visit planner and a member support centre. These can work with verified Hydrogen data and its existing enquiry/member backend.

## Six official sites reviewed

| Site | Specific public patterns observed | Evidence | Hydrogen application |
| --- | --- | --- | --- |
| Third Space London | A date-led timetable shows class name, instructor, club, start/end time and duration; a clear note distinguishes website information from the latest in-app schedule. Its separate trainer finder filters by location, expertise and training tier and links to individual trainers. | [Timetable](https://www.thirdspace.london/timetable/), [Trainer finder](https://www.thirdspace.london/find-a-trainer/) | Improve the current timetable’s discovery and data freshness. Offer instructor filtering and a coach-matching enquiry. Use Hydrogen’s verified first names and published classes; do not invent credentials, tiers, biographies or class durations. |
| Equinox | Persistent “Visit a club” and “Join Today” actions sit alongside distinct classes, personal training, Pilates and spa navigation. Its class page separates disciplines and connects those disciplines to actual spaces, instructors and digital workouts. | [Homepage](https://www.equinox.com/), [Group fitness](https://www.equinox.com/groupfitness) | Make visiting, exploring and joining separate visible actions. Connect verified Hydrogen experiences to real room photographs and a relevant enquiry. Equinox’s dynamic membership destination exposed only a loading state, so its full joining transaction was not reviewed. |
| Life Time | Public schedule help explains clickable class descriptions, instructor/other-session details, favorites, reservations, confirmations, reminders, cancellations and waitlists. Guest access is a separate member workflow rather than an ambiguous generic contact action. | [Schedule FAQ](https://www.lifetime.life/faq/schedule.html), [General FAQ](https://www.lifetime.life/faq.html) | Add class details, favorites, calendar export and a clear “My requests” agenda. Keep Hydrogen enquiries pending until staff confirms them; actual capacity, automatic reservations, waitlists and notifications need real operational data/configuration. |
| PureGym | Day access has its own entry point and explanation of access, timing and purchase steps. Help navigation separates pre-join questions, gym information, membership information, freezing/ending and other support. Club pages use a comparison table to explain access/benefit differences between memberships. | [Day pass](https://www.puregym.com/membership-options/day-pass/), [Help centre](https://www.puregym.com/help-centre/), [Freezing/ending](https://www.puregym.com/help-centre/freezing-or-ending/), [Example club comparison](https://www.puregym.com/gyms/london-moorgate/) | Add “Ask about day access” and categorized membership support. Compare only Hydrogen information actually known; request current pricing/eligibility instead of inventing offers. Do not transfer PureGym’s access PINs, fees, cancellation terms or freeze entitlement. |
| Fitness First | The timetable exposes goal, duration and class filters, plus morning/afternoon/evening groupings. Its visit page distinguishes a guided tour from day access and lets visitors explore clubs by facilities and classes. | [Timetable](https://www.fitnessfirst.co.uk/fitness-classes/timetable), [Visit / tour](https://www.fitnessfirst.co.uk/visit-us) | Add name/instructor/time-of-day filters to Hydrogen now, and duration only once confirmed. Turn the flat gallery into a facility explorer and make a tour request a guided, purpose-specific flow. |
| Les Mills | Workout discovery groups formats by movement discipline. A class page explains the experience, equipment and first-time questions. Its digital offering organizes workouts by format, equipment needs, level and multi-week plans, with clear in-club versus digital paths. | [Workout catalogue](https://www.lesmills.com/us/workouts/all), [Example class detail](https://www.lesmills.com/us/workouts/bodypump), [Digital workouts](https://www.lesmills.com/us/ondemand) | Add a useful program guide and first-class guidance. A Hydrogen movement library can use its own verified clips and original written guidance. Do not label Hydrogen as a Les Mills partner or copy licensed programs/videos. |

## Current Hydrogen gaps checked in the code

These findings are based on the current source, not assumptions about a future design.

| Current surface | Existing behavior | Missing capability |
| --- | --- | --- |
| `app/page.tsx` / classes | Six day tabs, three focus buckets, class name, instructor, time and a request-place action. Published timetable is 7–12 November 2026. | No free-text search, instructor filter, time-of-day filter, detail view, favorites, calendar export or explicit stale-week state. Durations/capacities are absent from the source data. |
| Club / amenities | Photo gallery, verified room/experience cards and generic access enquiries. | No room-by-room explorer, visit checklist, facility overview or selection of what to see during a visit. |
| Membership cards | Gym membership, coaching and getting-started enquiries; prices confirmed by the team. | No guided discovery, choice summary or explicit day-access enquiry. There are no verified current paid tiers to sell directly. |
| Personal training | Generic training enquiry and verified instructor names in the timetable. | No goal/availability coach-matching flow or a way to explore each known instructor’s published classes. |
| `MemberArea.tsx` | Overview, workout records, weight chart, pending/confirmed request display and personal-data deletion. | No saved-class agenda, membership support shortcuts, renew/freeze/cancel request categories, or integrated route back into class discovery. Website account creation correctly does not imply gym membership activation. |
| `RequestForm` | Name/phone, optional email/date, interest/message, consent, persistent request reference and staff follow-up. | Same basic form for every task; no progressive visit/membership questions or visit-time preference fields. |
| Workout tools | Stopwatch, rest timer and a small workout checklist. | No structured discovery of the gym’s own instructional media or saved routines. |

## Prioritized feature backlog

### P0 — Implement now using existing data and request storage

| Feature | Concrete interaction | Why it matters | Required truth boundary |
| --- | --- | --- | --- |
| Club explorer | Select Strength, Cardio, Studios, Pool or Lounge; see the actual high-resolution room images, known experience details and a relevant CTA. Add next/previous room navigation and a photo lightbox. | Visitors can inspect the club in the context of their goals, not scan unrelated images. Inspired by Equinox and Fitness First’s facility-led discovery. | A guided photo tour is not a 360° virtual tour. Pool, spa, audience access and seasonal availability still need club confirmation. |
| Class discovery upgrade | Search names, select instructor, choose morning/afternoon/evening, switch day, clear all filters. Open details and save a class. | Reduces the effort of finding a suitable session; preserves the value of the verified 35-class source. Inspired by Fitness First, Third Space and Life Time. | Never fill unknown duration, intensity, capacity, suitability or availability with invented values. Show the source week/date. |
| Goal-led program finder | Ask preferred focus, experience preference, audience and days/time; return matching verified experiences/classes plus “Ask the team to help me choose.” Keep the selected answers in the resulting enquiry. | Makes the large feature set navigable and gives staff a useful enquiry. Inspired by Les Mills format discovery and Third Space trainer matching. | Matching is a navigation aid, not a medical assessment or promise of results. No invented paid plan, discount or entitlement. |
| First-visit planner | Choose what to explore, a preferred date/time window and tour versus day-access enquiry; show address, actual map link, verified opening hours and simple arrival information; save one clear visit request. | Supports the visitor who is interested but not ready to join. Inspired by Fitness First and Equinox. | Do not call a request a confirmed booking, promise a free trial/day pass, or claim parking/lockers/showers not verified by Hydrogen. |
| Member help centre | Search/categorize Joining, Classes, Membership, Visits and Account; shortcuts for renewal, freezing enquiry, cancellation enquiry, payment question, facility feedback and general support. Save request references and show status in the member area. | Makes the site useful after the first sale. Inspired by PureGym and Life Time. | “Request a freeze” does not freeze a contract. Fees, eligibility and cancellation/refund rules must come from the gym. |

### P1 — Complete the member journey

1. **Saved classes and tentative calendar export.** Save favorites with date/instructor details, show them in a “My week” agenda and generate a calendar entry that clearly says attendance is subject to confirmation. This adapts Life Time’s favorites/details pattern. Do not invent an end time when no duration is known.
2. **Coach enquiry matching.** Filter the seven verified instructor first names by the classes in which they actually appear, then send preferred focus/time to the gym. A future staff editor can add approved biographies/photos. This adapts Third Space’s trainer discovery without fabricating qualifications.
3. **Clear request management.** Make pending/contacted/confirmed/cancelled states readable; let users ask to change or withdraw a request. Distinguish a website request from actual gym attendance/paid membership. Inspired by Life Time’s explicit reservation lifecycle.
4. **First-class guide.** Add format explanations and “ask before attending” prompts to each class type. Use original explanatory wording and only verified Hydrogen facts; questions about equipment or suitability can go directly to the team. Inspired by Les Mills’ detail pages.
5. **Movement library.** Separate real Hydrogen instructional clips from venue/food/event reels; add topic filters, bookmarks and links to log a completed workout. Keep ordinary facility clips out of an instructional-video category. Inspired by Les Mills’ catalogue and Equinox’s club/digital continuity.
6. **Membership selection summary.** Show selected interests, preferred access and term enquiry with a single staff-confirmed quote request. A polished comparison experience is possible without showing invented prices or claiming every feature is included.

### P2 — Enable only after operational facts/integrations exist

- Live class capacity, automatic booking and waitlists require gym-managed inventory and cancellation/no-show rules.
- Online checkout requires approved current packages/prices, payment provider configuration, receipts and actual commercial policies.
- Digital access QR/PINs require integration with the gym’s real access system; decorative codes must not imply entry rights.
- Email/SMS/push reminders require configured delivery services and explicit communication preferences.
- Contract freezing, cancellation and renewal automation require membership records, staff authority and verified policy rules.
- Trainer appointments require approved availability, services and profiles. Health assessments, rehabilitation, pregnancy or clinical advice need an appropriately authorized service, not copied competitor labels.
- No multi-club finder is necessary for a single verified Hydrogen location. No native-app download badge should appear unless a real Hydrogen app exists.

## Recommended product structure

Use clear destinations: **Explore the club · Find your training · Classes · Membership · Plan a visit · Member support**. The existing member account and social archive remain useful destinations, but they should support these tasks rather than dominate the joining journey.

The main improvement is functional depth: a selected room should produce a relevant visit enquiry; a selected class should have useful details and a saved/tentative state; a support topic should produce a traceable request. Avoid adding many static cards whose buttons all open the same uncontextualized contact form.

## Research limits

Public pages and publicly documented app workflows were reviewed. No membership was purchased, no class was booked and no private competitor account was accessed. Some dynamic pages exposed incomplete content: Equinox’s membership destination rendered a loading state; Fitness First’s timetable requires a selected club before actual sessions appear; PureGym help content uses a dynamic body, although its support taxonomy and linked destinations are public. Functional behavior behind sign-in is described only when the official public help page explicitly documents it.

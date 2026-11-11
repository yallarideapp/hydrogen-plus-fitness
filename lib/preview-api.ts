// Browser-only stand-in for the site's /api routes on the GitHub Pages preview, which has no server.
// Members are signed in as a demo member automatically; everything is kept in this browser's
// localStorage, so My training, the class planner, goals, the workout studio, enquiry forms and the
// staff inbox can all be tried. On the live server (Cloudflare / ChatGPT Sites) this never runs.
const KEY = 'hp-preview-data';
type Rec = Record<string, unknown> & { id: string };
type Data = { requests: Rec[]; workouts: Rec[]; measurements: Rec[]; sessions: Rec[]; goal: Record<string, unknown> | null; subscriptions: Rec[] };
const empty = (): Data => ({ requests: [], workouts: [], measurements: [], sessions: [], goal: null, subscriptions: [] });

export function isPreviewHost() {
  if (typeof window === 'undefined') return false;
  try { if (localStorage.getItem('hp-preview-api') === '1') return true; } catch { /* ignore */ }
  return location.hostname.endsWith('.github.io');
}
export const PREVIEW_USER = { displayName: 'Preview member', email: 'preview@hydrogen.local' };

function read(): Data { try { return { ...empty(), ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }; } catch { return empty(); } }
function write(d: Data) { localStorage.setItem(KEY, JSON.stringify(d)); }
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
const fail = (error: string, status = 400) => json({ error }, status);
const uuid = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const ammanToday = () => { const p = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date()); const g = (n: string) => p.find((x) => x.type === n)?.value; return `${g('year')}-${g('month')}-${g('day')}`; };
const validDate = (v: unknown): v is string => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && new Date(`${v}T12:00:00Z`).toISOString().slice(0, 10) === v;
const CONSENT = 'Please agree to the Privacy Policy and Terms to continue.';
const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '');
const opt = (v: unknown, max: number) => { const s = str(v); return s ? s.slice(0, max) : null; };

function historyDateError(v: unknown) {
  if (!validDate(v)) return 'Please choose a valid date.';
  const t = ammanToday(); const min = `${Number(t.slice(0, 4)) - 5}${t.slice(4)}`;
  return v <= t && v >= min ? '' : 'Choose today or a date within the last five years.';
}
function futureDateError(v: unknown) {
  if (!validDate(v)) return 'Please choose a valid date.';
  const t = ammanToday(); const upper = new Date(`${t}T12:00:00Z`); upper.setUTCDate(upper.getUTCDate() + 365);
  return v >= t && v <= upper.toISOString().slice(0, 10) ? '' : 'Choose a date within the next year.';
}
const sessionView = ({ consentedAt: _c, ...s }: Rec) => s;
const addDays = (date: string, n: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const addMonths = (date: string, months: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCMonth(d.getUTCMonth() + months); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };
function activate(sub: Rec) {
  const today = ammanToday();
  const start = typeof sub.startDate === 'string' && sub.startDate > today ? sub.startDate : today;
  sub.status = 'active'; sub.startDate = start; sub.activatedAt = now();
  sub.endDate = typeof sub.months === 'number' && sub.months > 0 ? addMonths(start, sub.months) : typeof sub.days === 'number' && sub.days > 0 ? addDays(start, sub.days - 1) : null;
}
const currentSub = (d: Data) => [...d.subscriptions].reverse().find((x) => x.status === 'pending' || (x.status === 'active' && (!x.endDate || String(x.endDate) >= ammanToday()))) ?? null;

async function handle(method: string, url: URL, body: Record<string, unknown>): Promise<Response> {
  const d = read();
  const route = url.pathname.replace(/^.*\/api\//, '');
  const id = url.searchParams.get('id') ?? '';
  switch (route) {
    case 'member':
      if (method === 'GET') return json({ user: PREVIEW_USER, requests: [...d.requests].reverse(), workouts: [...d.workouts].sort((a, b) => String(b.date).localeCompare(String(a.date))), measurements: [...d.measurements].sort((a, b) => String(b.date).localeCompare(String(a.date))), plannedSessions: d.sessions.map(sessionView), goal: d.goal });
      if (method === 'DELETE') { if (url.searchParams.get('scope') !== 'data') return fail('Specify scope=data to delete your saved data.'); const keep = d.requests.filter((r) => !r.userId); write({ ...empty(), requests: keep }); return json({ deleted: true }); }
      break;
    case 'planner': {
      if (method === 'GET') return json({ sessions: [...d.sessions].sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`)).map(sessionView) });
      if (method === 'POST') {
        if (body.consent !== true) return fail(CONSENT);
        const time = str(body.scheduledTime ?? body.scheduledTime24h);
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return fail('Choose a valid time in HH:mm format.');
        const e = futureDateError(body.scheduledDate); if (e) return fail(e);
        if (!str(body.classKey) || !str(body.className)) return fail('Choose a class to add to your plan.');
        const existing = d.sessions.find((s) => s.classKey === body.classKey && s.scheduledDate === body.scheduledDate && s.scheduledTime === time);
        if (existing) return json({ session: sessionView(existing) });
        const s: Rec = { id: uuid(), classKey: str(body.classKey), className: str(body.className), coach: str(body.coach) || '—', category: str(body.category) || 'class', scheduledDate: body.scheduledDate, scheduledTime: time, notes: opt(body.notes, 1000), status: 'planned', consentedAt: now(), createdAt: now() };
        d.sessions.push(s); write(d); return json({ session: sessionView(s) }, 201);
      }
      if (method === 'PATCH') { const s = d.sessions.find((x) => x.id === body.id); if (!s) return fail('Planned class not found.', 404); s.status = body.status === 'completed' ? 'completed' : 'planned'; write(d); return json({ session: sessionView(s) }); }
      if (method === 'DELETE') { const n = d.sessions.length; d.sessions = d.sessions.filter((x) => x.id !== id); if (n === d.sessions.length) return fail('Planned class not found.', 404); write(d); return json({ deleted: true }); }
      break;
    }
    case 'goals':
      if (method === 'GET') return json({ goal: d.goal });
      if (method === 'PUT') {
        if (body.consent !== true) return fail(CONSENT);
        if (str(body.focus).length < 2) return fail('Choose your training focus.');
        const wt = Number(body.weeklyTarget); if (!Number.isInteger(wt) || wt < 1 || wt > 7) return fail('Choose between one and seven sessions per week.');
        d.goal = { focus: str(body.focus).slice(0, 100), weeklyTarget: wt, experience: ['beginner', 'intermediate', 'advanced'].includes(String(body.experience)) ? body.experience : 'beginner', preferredTraining: ['solo', 'group', 'coached'].includes(String(body.preferredTraining)) ? body.preferredTraining : 'solo', notes: opt(body.notes, 1000) };
        write(d); return json({ goal: d.goal });
      }
      break;
    case 'measurements':
      if (method === 'POST') {
        if (body.consent !== true) return fail(CONSENT);
        const w = Number(body.weight); if (!(w >= 20 && w <= 400)) return fail('Weight must be between 20 and 400 kg.');
        const e = historyDateError(body.date); if (e) return fail(e);
        const m: Rec = { id: uuid(), weight: w, date: body.date, consentedAt: now(), createdAt: now() }; d.measurements.push(m); write(d); return json({ measurement: m }, 201);
      }
      if (method === 'DELETE') { const n = d.measurements.length; d.measurements = d.measurements.filter((x) => x.id !== id); if (n === d.measurements.length) return fail('Measurement not found.', 404); write(d); return json({ deleted: true }); }
      break;
    case 'workouts':
      if (method === 'POST') {
        if (body.consent !== true) return fail(CONSENT);
        if (str(body.name).length < 2) return fail('Give your workout a name.');
        const dur = Number(body.duration); if (!Number.isInteger(dur) || dur < 1 || dur > 600) return fail('Duration must be between 1 and 600 minutes.');
        const e = historyDateError(body.date); if (e) return fail(e);
        const w: Rec = { id: uuid(), name: str(body.name).slice(0, 100), duration: dur, date: body.date, notes: opt(body.notes, 1000), consentedAt: now(), createdAt: now() }; d.workouts.push(w); write(d); return json({ workout: w }, 201);
      }
      if (method === 'DELETE') { const n = d.workouts.length; d.workouts = d.workouts.filter((x) => x.id !== id); if (n === d.workouts.length) return fail('Workout not found.', 404); write(d); return json({ deleted: true }); }
      break;
    case 'requests':
      if (method === 'POST') {
        if (body.consent !== true) return fail(CONSENT);
        if (!['tour', 'membership', 'class', 'training', 'contact'].includes(String(body.kind))) return fail('Please choose what you would like to ask about.');
        if (str(body.name).length < 2) return fail('Please enter your full name.');
        const phone = str(body.phone); if (!/^[+()\d\s-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7) return fail('Please enter a valid phone number.');
        const email = str(body.email); if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail('Please enter a valid email address.');
        if (body.preferredDate) { const e = futureDateError(body.preferredDate); if (e) return fail(e); }
        if (body.clientRequestId) { const ex = d.requests.find((r) => r.clientRequestId === body.clientRequestId); if (ex) return json({ reference: ex.reference, status: ex.status, request: { id: ex.id, reference: ex.reference, status: ex.status, kind: ex.kind, createdAt: ex.createdAt } }); }
        const rid = uuid(); const reference = `HP-${rid.slice(0, 8).toUpperCase()}${rid.slice(-4).toUpperCase()}`; const at = now();
        d.requests.push({ id: rid, reference, userId: 'preview', clientRequestId: str(body.clientRequestId) || null, kind: body.kind, name: str(body.name).slice(0, 100), phone: phone.replace(/[^\d+]/g, ''), email: email || null, interest: opt(body.interest, 160), preferredDate: body.preferredDate || null, message: opt(body.message, 2000), status: 'pending', consentedAt: at, createdAt: at });
        write(d); return json({ reference, status: 'pending', request: { id: rid, reference, status: 'pending', kind: body.kind, createdAt: at } }, 201);
      }
      break;
    case 'subscription':
      if (method === 'GET') return json({ subscription: currentSub(d), history: [...d.subscriptions].reverse() });
      if (method === 'POST') {
        if (body.consent !== true) return fail(CONSENT);
        if (!str(body.planId) || !str(body.planName)) return fail('Choose a plan first.');
        const price = Number(body.price); if (!Number.isFinite(price) || price < 0) return fail('This plan has no valid price.');
        if (str(body.name).length < 2) return fail('Please enter your full name.');
        const phone = str(body.phone); if (!/^[+()\d\s-]+$/.test(phone) || phone.replace(/\D/g, '').length < 7) return fail('Please enter a valid phone number.');
        const e = futureDateError(body.startDate); if (e) return fail(e);
        const open = d.subscriptions.find((x) => x.status === 'pending'); if (open) open.status = 'replaced';
        const rid = uuid(); const reference = `HP-${rid.slice(0, 8).toUpperCase()}${rid.slice(-4).toUpperCase()}`; const at = now();
        const months = Number(body.months); const days = Number(body.days);
        const sub: Rec = { id: uuid(), reference, planId: str(body.planId), planName: str(body.planName).slice(0, 160), categoryName: str(body.categoryName).slice(0, 120), price, months: Number.isInteger(months) && months > 0 ? months : null, days: Number.isInteger(days) && days > 0 ? days : null, payment: body.payment === 'cliq' ? 'cliq' : 'cash', startDate: body.startDate, endDate: null, status: 'pending', example: !!body.example, createdAt: at };
        d.subscriptions.push(sub);
        d.requests.push({ id: rid, reference, userId: 'preview', subscriptionId: sub.id, kind: 'membership', name: str(body.name).slice(0, 100), phone: phone.replace(/[^\d+]/g, ''), email: null, interest: `${sub.planName} · ${price} JD`.slice(0, 160), preferredDate: body.startDate, message: `Payment: ${sub.payment === 'cliq' ? 'CliQ' : 'cash at the club'}`, status: 'pending', consentedAt: at, createdAt: at });
        write(d); return json({ subscription: sub, reference }, 201);
      }
      if (method === 'PATCH') { const sub = d.subscriptions.find((x) => x.id === body.id); if (!sub) return fail('Subscription not found.', 404); if (body.action === 'activate-demo' && sub.status === 'pending') { activate(sub); const r = d.requests.find((x) => x.subscriptionId === sub.id); if (r) r.status = 'confirmed'; } write(d); return json({ subscription: sub }); }
      if (method === 'DELETE') { const sub = d.subscriptions.find((x) => x.id === id); if (!sub) return fail('Subscription not found.', 404); if (sub.status !== 'pending') return fail('Only a request that is still waiting can be cancelled.'); sub.status = 'cancelled'; const r = d.requests.find((x) => x.subscriptionId === sub.id); if (r) r.status = 'cancelled'; write(d); return json({ cancelled: true }); }
      break;
    case 'staff':
      if (method === 'GET') { const list = [...d.requests].reverse().map(({ userId: _u, clientRequestId: _c, consentedAt: _k, subscriptionId: _s, ...r }) => r); return json({ requests: list, stats: { pending: list.filter((r) => r.status === 'pending').length, total: list.length } }); }
      if (method === 'PATCH') { const r = d.requests.find((x) => x.id === body.id); if (!r) return fail('Request not found.', 404); if (!['pending', 'contacted', 'confirmed', 'cancelled'].includes(String(body.status))) return fail('Choose a valid status.'); r.status = body.status; const sub = r.subscriptionId ? d.subscriptions.find((x) => x.id === r.subscriptionId) : undefined; if (sub && body.status === 'confirmed' && sub.status === 'pending') activate(sub); if (sub && body.status === 'cancelled' && sub.status === 'pending') sub.status = 'cancelled'; write(d); return json({ request: r }); }
      break;
  }
  return fail('This action is not available in the preview.', 404);
}

let installed = false;
export function installPreviewApi() {
  if (installed || !isPreviewHost()) return;
  installed = true;
  // Sign-in/out pages belong to the live server; in the preview they just return to the home page.
  document.addEventListener('click', (e) => {
    const a = (e.target as Element | null)?.closest?.('a[href*="signout-with-chatgpt"],a[href*="signin-with-chatgpt"]');
    if (!a) return;
    e.preventDefault();
    location.href = (location.pathname.startsWith('/hydrogen-plus-fitness') ? '/hydrogen-plus-fitness' : '') + '/';
  }, true);
  const real = window.fetch.bind(window);
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const url = new URL(raw, location.href);
    if (url.origin !== location.origin || !/\/api\/(member|planner|goals|measurements|workouts|requests|staff|subscription)$/.test(url.pathname)) return real(input, init);
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    let body: Record<string, unknown> = {};
    try { const text = typeof init?.body === 'string' ? init.body : input instanceof Request ? await input.clone().text() : ''; body = text ? JSON.parse(text) : {}; } catch { return fail('Please send valid JSON.'); }
    await new Promise((r) => setTimeout(r, 120));
    try { return await handle(method, url, body); } catch { return fail('We could not save your information right now. Please try again.', 503); }
  };
}
installPreviewApi();

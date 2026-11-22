// Members in the site admin: each member, their plan and their visits (check-ins at the face-recognition gate).
//
// Today this list lives in the admin's browser (localStorage), filled by hand, by importing a sheet exported from
// the club's membership system, or from subscriptions made on the website. When the site gets its server and the
// club's system is linked, this file is the one place to change: load/save talk to the server instead, and visits
// arrive from the gate on their own. The website never receives face images or face data, only who came in and when.

import { useSyncExternalStore } from 'react';

export type Section = 'men' | 'women' | 'kids';
export type MemberStatus = 'active' | 'pending' | 'frozen' | 'cancelled';
export type VisitSource = 'face' | 'manual' | 'import';
export type Visit = { at: string; source: VisitSource }; // at: YYYY-MM-DDTHH:mm, Amman time
export type Member = {
  id: string;
  number: string; // member number in the club's system, if known
  name: string;
  phone: string;
  section: Section;
  plan: string;
  planId?: string; // a plan from Prices & offers, when picked from the list
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD, '' when open-ended
  status: MemberStatus;
  frozenAt?: string; // day the plan was frozen; unfreezing moves the end date on by the frozen days
  paid: string; // free text, e.g. "30" (JD)
  notes: string;
  visits: Visit[];
  source: 'manual' | 'import' | 'site' | 'demo';
  siteRef?: string; // reference of the website subscription it came from
  updatedAt: number;
};
type Store = { members: Member[] };

const KEY = 'hp-admin-members';
const EMPTY: Store = { members: [] };
const listeners = new Set<() => void>();
let cache: { raw: string | null; store: Store } = { raw: null, store: EMPTY };

function read(): Store {
  let raw: string | null = null;
  try { raw = localStorage.getItem(KEY); } catch { /* storage blocked */ }
  if (raw === cache.raw) return cache.store;
  let store = EMPTY;
  try { const d = raw ? JSON.parse(raw) : null; if (d && Array.isArray(d.members)) store = { members: d.members.map(clean).filter(Boolean) as Member[] }; } catch { /* ignore a broken copy */ }
  cache = { raw, store };
  return store;
}
function write(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch { /* full or blocked */ }
  listeners.forEach((f) => f());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
};
export const useMembers = () => useSyncExternalStore(subscribe, () => read().members, () => EMPTY.members);

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.trim().slice(0, max) : typeof v === 'number' ? String(v) : '');
function clean(m: unknown): Member | null {
  if (!m || typeof m !== 'object') return null;
  const x = m as Record<string, unknown>;
  const name = str(x.name, 120);
  if (!name) return null;
  const visits = Array.isArray(x.visits) ? (x.visits as Visit[]).filter((v) => v && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(String(v.at))).slice(-2000) : [];
  return {
    id: str(x.id, 60) || uid(), number: str(x.number, 40), name, phone: str(x.phone, 30),
    section: (['men', 'women', 'kids'] as const).includes(x.section as Section) ? (x.section as Section) : 'men',
    plan: str(x.plan, 120), planId: str(x.planId, 60) || undefined, start: isDate(str(x.start)) ? str(x.start) : '', end: isDate(str(x.end)) ? str(x.end) : '',
    status: (['active', 'pending', 'frozen', 'cancelled'] as const).includes(x.status as MemberStatus) ? (x.status as MemberStatus) : 'active',
    frozenAt: isDate(str(x.frozenAt)) ? str(x.frozenAt) : undefined, paid: str(x.paid, 20), notes: str(x.notes, 1000), visits,
    source: (['manual', 'import', 'site', 'demo'] as const).includes(x.source as Member['source']) ? (x.source as Member['source']) : 'manual',
    siteRef: str(x.siteRef, 40) || undefined, updatedAt: Number(x.updatedAt) || Date.now(),
  };
}

export const uid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
export const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));

// ---- changes ----
const put = (fn: (members: Member[]) => Member[]) => write({ members: fn(read().members) });
export const saveMember = (m: Member) => put((all) => (all.some((x) => x.id === m.id) ? all.map((x) => (x.id === m.id ? { ...m, updatedAt: Date.now() } : x)) : [{ ...m, updatedAt: Date.now() }, ...all]));
export const removeMember = (id: string) => put((all) => all.filter((x) => x.id !== id));
export const removeDemo = () => put((all) => all.filter((x) => x.source !== 'demo'));
export const addVisit = (id: string, at: string, source: VisitSource) => put((all) => all.map((x) => (x.id === id && !x.visits.some((v) => v.at === at) ? { ...x, visits: [...x.visits, { at, source }].sort((a, b) => a.at.localeCompare(b.at)), updatedAt: Date.now() } : x)));
export const removeVisit = (id: string, at: string) => put((all) => all.map((x) => (x.id === id ? { ...x, visits: x.visits.filter((v) => v.at !== at), updatedAt: Date.now() } : x)));
export const blankMember = (today: string): Member => ({ id: uid(), number: '', name: '', phone: '', section: 'men', plan: '', start: today, end: '', status: 'active', paid: '', notes: '', visits: [], source: 'manual', updatedAt: Date.now() });

// ---- dates (Amman) ----
export function ammanNow() {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const g = (t: string) => p.find((x) => x.type === t)?.value ?? '00';
  return { date: `${g('year')}-${g('month')}-${g('day')}`, time: `${g('hour')}:${g('minute')}` };
}
export const days = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 864e5);
// Same rule as the website's subscriptions: a plan of n months starting on the 5th ends on the 4th.
export const addMonths = (date: string, n: number) => { const d = new Date(`${date}T12:00:00Z`); const day = d.getUTCDate(); d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n); const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); d.setUTCDate(Math.min(day, last)); d.setUTCDate(d.getUTCDate() - 1); return d.toISOString().slice(0, 10); };

// Where a member stands today (the status the admin set, then the dates).
export type Standing = 'active' | 'ending' | 'expired' | 'pending' | 'frozen' | 'cancelled';
export function standing(m: Member, today: string): Standing {
  if (m.status !== 'active') return m.status;
  if (m.end && m.end < today) return 'expired';
  if (m.end && days(today, m.end) < 7) return 'ending';
  return 'active';
}

// ---- import from a sheet (CSV file, or cells copied from Excel / Google Sheets) ----
export type Field = 'skip' | 'number' | 'name' | 'phone' | 'section' | 'plan' | 'start' | 'end' | 'status' | 'paid' | 'visit' | 'time';
const HEADS: [Field, RegExp][] = [
  ['number', /^(id|no\.?|#|number|ac-?no\.?|user ?(id|no\.?)|emp(loyee)? ?(id|no\.?)|person ?id|pin|card ?no\.?|member ?(id|no\.?|number)|code|رقم( ال)?(عضوية|مشترك|اشتراك|موظف|بطاقة)?|الرقم|كود|الكود)$/i],
  ['plan', /(plan|package|باقة|الباقة)/i],
  ['phone', /(phone|mobile|tel|هاتف|الهاتف|جوال|الجوال|موبايل|الموبايل|تلفون|التلفون)/i],
  ['section', /(section|gender|branch|department|dept|قسم|القسم|الجنس|النوع|الفرع)/i],
  ['end', /(end|expir|until|valid|نهاية|النهاية|انتهاء|الانتهاء|ينتهي|حتى|إلى تاريخ|الى تاريخ)/i],
  ['start', /(start|begin|join|بداية|البداية|البدء|تاريخ التسجيل|من تاريخ)/i],
  ['status', /(status|state|حالة|الحالة)/i],
  ['paid', /(paid|amount|price|fee|مبلغ|المبلغ|مدفوع|المدفوع|السعر|الرسوم)/i],
  ['visit', /(date ?time|check.?in|punch|attendance|clock ?in|access|دخول|الدخول|حضور|الحضور|البصمة|بصمة)/i],
  ['name', /(name|اسم|الاسم|المشترك|العضو)/i],
  ['plan', /(subscription|membership|type|اشتراك|الاشتراك)/i],
];
// In a gate log a bare "Date" is the check-in day and "Time" its time; in a member list they mean nothing alone.
export const guessField = (head: string, gate = false): Field => {
  const h = head.trim();
  if (gate && /^(date|التاريخ|تاريخ|اليوم|day)$/i.test(h)) return 'visit';
  if (gate && /^(time|الوقت|وقت|الساعة|ساعة)$/i.test(h)) return 'time';
  const f = HEADS.find(([, re]) => re.test(h))?.[0] ?? 'skip';
  if (gate) return ['number', 'name', 'phone', 'visit', 'time'].includes(f) ? f : 'skip';
  return f === 'visit' || f === 'time' ? 'skip' : f;
};
// A gate log's "Time" column often holds the date too (2026-11-22 07:15). Look at the cells to decide.
export function refineGate(fields: Field[], body: string[][]): Field[] {
  const out = [...fields];
  const datey = (i: number) => { const vals = body.slice(0, 20).map((r) => r[i] ?? '').filter(Boolean); return vals.length > 0 && vals.filter((v) => toDate(v)).length >= vals.length * 0.8; };
  if (!out.includes('visit')) {
    const i = out.findIndex((f, k) => f === 'time' && datey(k));
    const j = i >= 0 ? i : out.findIndex((f, k) => f === 'skip' && datey(k));
    if (j >= 0) out[j] = 'visit';
  }
  return out;
}

const latin = (s: string) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d))).replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)));
export function parseSheet(text: string): string[][] {
  const src = latin(text.replace(/^﻿/, '')).replace(/\r\n?/g, '\n').trim();
  if (!src) return [];
  const first = src.split('\n')[0];
  const sep = first.includes('\t') ? '\t' : (first.split(';').length > first.split(',').length ? ';' : ',');
  const rows: string[][] = []; let row: string[] = []; let cell = ''; let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) { if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; continue; }
    if (c === '"' && cell === '') { quoted = true; continue; }
    if (c === sep) { row.push(cell.trim()); cell = ''; continue; }
    if (c === '\n') { row.push(cell.trim()); rows.push(row); row = []; cell = ''; continue; }
    cell += c;
  }
  row.push(cell.trim()); rows.push(row);
  return rows.filter((r) => r.some((c) => c !== '')).slice(0, 5001);
}
// 2026-11-22, 22/11/2026, 22-11-2026, 22.11.2026, 2026/11/22 (+ optional time) → YYYY-MM-DD
export function toDate(v: string): string {
  const s = latin(v).trim();
  if (/^\d{5}(\.\d+)?$/.test(s) && Number(s) > 20000 && Number(s) < 80000) return new Date(Date.UTC(1899, 11, 30) + Math.floor(Number(s)) * 864e5).toISOString().slice(0, 10); // Excel date number
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/.exec(s);
  if (m) { const d = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`; return isDate(d) ? d : ''; }
  m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/.exec(s);
  if (m) { const y = m[3].length === 2 ? `20${m[3]}` : m[3]; const d = `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`; return isDate(d) ? d : ''; }
  return '';
}
export function toTime(v: string): string {
  const n = latin(v).trim();
  if (/^\d*\.\d+$/.test(n) || /^\d{5}\.\d+$/.test(n)) { const mins = Math.round((Number(n) % 1) * 1440) % 1440; return `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`; } // Excel time fraction
  const m = /(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm|ص|م)?/i.exec(latin(v));
  if (!m) return '';
  let h = Number(m[1]); const ap = (m[3] ?? '').toLowerCase();
  if ((ap === 'pm' || ap === 'م') && h < 12) h += 12;
  if ((ap === 'am' || ap === 'ص') && h === 12) h = 0;
  return h < 24 ? `${String(h).padStart(2, '0')}:${m[2]}` : '';
}
const toSection = (v: string): Section => (/(women|female|ladies|سيدات|نساء|أنثى|انثى|بنات)/i.test(v) ? 'women' : /(kid|child|أطفال|اطفال|ناشئ)/i.test(v) ? 'kids' : 'men');
const toStatus = (v: string): MemberStatus => (/(freez|hold|مجمد|تجميد|موقوف)/i.test(v) ? 'frozen' : /(cancel|ملغ|ملغى|ملغي)/i.test(v) ? 'cancelled' : /(pend|wait|انتظار)/i.test(v) ? 'pending' : 'active');
export const cleanPhone = (p: string) => { const d = latin(p).replace(/[^\d+]/g, ''); return /^7\d{8}$/.test(d) ? `0${d}` : d; };
// For matching names typed in different ways: no diacritics, one form of alif/taa marbuta/yaa, single spaces.
export const nameKey = (s: string) => latin(s).toLowerCase().replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/\s+/g, ' ').trim();
const phoneKey = (p: string) => latin(p).replace(/\D/g, '').replace(/^(00962|962)/, '0').replace(/^7/, '07');

// Apply a sheet: members are matched by member number, then by phone, then created. A "visit" column adds a
// check-in (the gate's export), so the same sheet format works for members and for the gate's log.
export function importRows(rows: string[][], fields: Field[], gate = false) {
  const visitSource: VisitSource = gate ? 'face' : 'import';
  const all = read().members.map((x) => ({ ...x })); let added = 0; let updated = 0; let visits = 0; let skipped = 0;
  const byName = (name: string) => { const k = nameKey(name); const hits = k ? all.filter((x) => nameKey(x.name) === k) : []; return hits.length === 1 ? hits[0] : undefined; };
  for (const r of rows) {
    const get = (f: Field) => { const i = fields.indexOf(f); return i >= 0 ? (r[i] ?? '').trim() : ''; };
    const number = get('number'); const phone = get('phone'); const name = get('name');
    let m = (number && all.find((x) => x.number && x.number === number)) || (phone && all.find((x) => x.phone && phoneKey(x.phone) === phoneKey(phone))) || undefined;
    let viaName = false;
    if (!m && name) { m = byName(name); viaName = !!m; }
    if (!m && (!name || gate)) { skipped++; continue; } // a gate log only adds visits to members already on the list
    const isNew = !m;
    if (!m) { m = { ...blankMember(''), source: 'import' }; all.unshift(m); }
    const patch: Partial<Member> = {};
    if (gate) { if (viaName && number && !m.number) patch.number = number; } // learn the gate's member number
    else {
      if (number) patch.number = number;
      if (name) patch.name = name.slice(0, 120);
      if (phone) patch.phone = cleanPhone(phone).slice(0, 30);
      if (get('section')) patch.section = toSection(get('section'));
      if (get('plan')) { patch.plan = get('plan').slice(0, 120); if (m.plan !== patch.plan) patch.planId = undefined; }
      if (toDate(get('start'))) patch.start = toDate(get('start'));
      if (toDate(get('end'))) patch.end = toDate(get('end'));
      if (get('status')) patch.status = toStatus(get('status'));
      if (get('paid')) patch.paid = get('paid').slice(0, 20);
    }
    const target = m as unknown as Record<string, unknown>;
    const changed = Object.entries(patch).some(([k, v]) => target[k] !== v);
    Object.assign(m, patch);
    const v = get('visit');
    const clock = toTime(get('time')) || toTime(v.replace(/^[^\sT]+[\sT]*/, '')) || (/^\d{5}\.\d+$/.test(v) ? toTime(v) : '');
    let visited = false;
    if (v && toDate(v)) { const at = `${toDate(v)}T${clock || '00:00'}`; if (!m.visits.some((x) => x.at === at)) { m.visits = [...m.visits, { at, source: visitSource }].sort((a, b) => a.at.localeCompare(b.at)).slice(-2000); visits++; visited = true; } }
    if (changed || visited) m.updatedAt = Date.now();
    if (isNew) added++; else if (changed) updated++;
  }
  write({ members: all });
  return { added, updated, visits, skipped };
}

// A copy of the list as a CSV that opens in Excel (with the Arabic intact).
export function exportCsv(members: Member[]) {
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const head = ['Member number', 'Name', 'Phone', 'Section', 'Plan', 'Start', 'End', 'Status', 'Paid', 'Visits', 'Last visit', 'Notes'];
  const lines = members.map((m) => [m.number, m.name, m.phone, m.section, m.plan, m.start, m.end, m.status, m.paid, String(m.visits.length), m.visits.at(-1)?.at.replace('T', ' ') ?? '', m.notes].map(q).join(','));
  return '﻿' + [head.map(q).join(','), ...lines].join('\r\n');
}

// A few made-up members to see how the section looks; marked "demo" and removable in one click.
export function addDemo(today: string) {
  const names: [string, Section, string][] = [['أحمد الخطيب', 'men', 'جيم الرجال · شهر'], ['ليان العمري', 'women', 'جيم السيدات · 3 أشهر'], ['محمد بني هاني', 'men', 'جيم الرجال · سنة'], ['سارة القضاة', 'women', 'الحصص الجماعية · شهر'], ['يزن الشرع', 'men', 'جيم الرجال · 3 أشهر'], ['رهف عبيدات', 'women', 'بيلاتس · شهر'], ['عمر الزعبي', 'kids', 'ملاكمة الناشئين · شهر'], ['خالد الرشدان', 'men', 'جيم الرجال · شهر']];
  const shift = (n: number) => { const d = new Date(`${today}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const ends = [20, 4, 210, -6, 45, 1, 12, 27]; const lens = [30, 90, 365, 30, 90, 30, 30, 30];
  const demo: Member[] = names.map(([name, section, plan], i) => {
    const end = shift(ends[i]); const start = shift(ends[i] - lens[i] + 1);
    const visits: Visit[] = [];
    for (let k = 1; k <= 24; k++) { if ((k * (i + 3)) % 5 < 3) { const d = shift(-k + (i === 1 ? 1 : 0)); if (d >= start && d <= today && d <= end) visits.push({ at: `${d}T${String(6 + ((k + i * 2) % 15)).padStart(2, '0')}:${k % 2 ? '15' : '40'}`, source: 'face' }); } }
    if (i % 3 === 0) visits.push({ at: `${today}T0${7 + (i % 3)}:05`, source: 'face' });
    return { id: uid(), number: String(1040 + i * 7), name, phone: `079${String(5000000 + i * 131071).slice(0, 7)}`, section, plan, start, end, status: i === 6 ? 'frozen' : 'active', paid: '', notes: '', visits: visits.sort((a, b) => a.at.localeCompare(b.at)), source: 'demo', updatedAt: Date.now() };
  });
  write({ members: [...demo, ...read().members.filter((m) => m.source !== 'demo')] });
}

// ---- subscriptions made on the website (preview: stored in this browser by lib/preview-api.ts) ----
type Rec = Record<string, unknown>;
export type SiteSub = { id: string; reference: string; planId: string; planName: string; startDate: string; endDate: string | null; months: number | null; days: number | null; status: string; payment: string; price: number; name: string; phone: string; example: boolean };
const previewData = () => { try { return JSON.parse(localStorage.getItem('hp-preview-data') ?? 'null') as { subscriptions?: Rec[]; requests?: Rec[] } | null; } catch { return null; } };
export function siteSubscriptions(known: Member[]): SiteSub[] {
  const d = previewData();
  if (!d?.subscriptions) return [];
  const added = new Set(known.map((m) => m.siteRef).filter(Boolean));
  return d.subscriptions.filter((s) => (s.status === 'pending' || s.status === 'active') && !added.has(str(s.reference, 40))).map((s) => {
    const req = d.requests?.find((r) => r.subscriptionId === s.id || r.reference === s.reference);
    return { id: str(s.id, 60), reference: str(s.reference, 40), planId: str(s.planId, 60), planName: str(s.planName), startDate: str(s.startDate), endDate: (s.endDate as string) || null, months: Number(s.months) || null, days: Number(s.days) || null, status: str(s.status), payment: str(s.payment), price: Number(s.price) || 0, name: str(req?.name, 120), phone: str(req?.phone, 30), example: !!s.example };
  }).reverse();
}
const plusDays = (date: string, n: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const nextDay = (date: string) => plusDays(date, 1);
export function acceptSiteSubscription(s: SiteSub, section: Section) {
  const today = ammanNow().date;
  const start = s.status === 'active' ? s.startDate || today : s.startDate > today ? s.startDate : today;
  const end = s.status === 'active' ? s.endDate ?? '' : s.months ? addMonths(start, s.months) : s.days ? plusDays(start, s.days - 1) : '';
  const d = previewData();
  const sub = d?.subscriptions?.find((x) => x.id === s.id);
  if (d && sub && sub.status === 'pending') {
    Object.assign(sub, { status: 'active', startDate: start, endDate: end || null, activatedAt: new Date().toISOString() });
    const req = d.requests?.find((r) => r.subscriptionId === s.id); if (req) req.status = 'confirmed';
    try { localStorage.setItem('hp-preview-data', JSON.stringify(d)); } catch { /* the member is still added below */ }
  }
  saveMember({ ...blankMember(start), name: s.name || s.reference, phone: cleanPhone(s.phone), section, plan: s.planName, planId: s.planId || undefined, start, end, status: 'active', paid: s.price ? String(s.price) : '', notes: s.payment === 'cliq' ? 'CliQ' : '', source: 'site', siteRef: s.reference });
}

// A chosen file → rows. Excel's plain "CSV" on an Arabic Windows is saved in Windows-1256, not UTF-8.
export async function readSheetFile(file: File): Promise<string[][]> {
  const buf = await file.arrayBuffer();
  const head = new Uint8Array(buf.slice(0, 4));
  if (head[0] === 0x50 && head[1] === 0x4b) { const { readXlsx } = await import('./xlsx'); return readXlsx(buf); }
  if (head[0] === 0xd0 && head[1] === 0xcf) throw new Error('old-xls');
  let text: string;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { text = new TextDecoder('windows-1256').decode(buf); }
  return parseSheet(text);
}

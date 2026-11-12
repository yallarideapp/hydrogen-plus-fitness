// Admin edits for the site, kept as sparse overrides on top of the published defaults.
// Preview mode (GitHub Pages): saved in this browser's localStorage, photos in IndexedDB.
// Live mode later (Cloudflare): the same shape is loaded from /api/content instead.
import { useMemo, useSyncExternalStore } from 'react';
import { contact as baseContact, hours as baseHours, type HoursRow } from '@/lib/site-info';
import { schedule as baseClasses, scheduleDays as baseDays, ammanToday, rollDays, type ScheduledClass, type ScheduleDay } from '@/lib/schedule';
import type { Bi, MenuSection, Service, ServiceFact, ServiceFaq, TimelineItem } from '@/lib/services';
import { planCategories, type Plan, type PlanCategory } from '@/lib/plans';

export type Contact = typeof baseContact;
export type ServicePatch = Partial<{
  name: Bi; kicker: Bi; headline: Bi; intro: Bi; body: Bi[]; highlights: Bi[];
  facts: ServiceFact[]; faqs: ServiceFaq[]; timeline: TimelineItem[];
  phone: NonNullable<Service['phone']>; menu: NonNullable<Service['menu']>;
}>;
export type Announcement = { on: boolean; text: Bi; href: string };
export type Overrides = {
  texts?: Record<string, Bi>;
  contact?: Partial<Contact>;
  hours?: HoursRow[];
  schedule?: { days: ScheduleDay[]; classes: ScheduledClass[] };
  services?: Record<string, ServicePatch>;
  photos?: Record<string, string>;
  accent?: string;
  announcement?: Announcement;
  plans?: PlanCategory[];
  savedAt?: string;
};

export const STORE_KEY = 'hp-admin-preview';
export const EMPTY: Overrides = Object.freeze({}) as Overrides;
const SEP = '␟';
export const textKey = (en: string, ar: string) => en + SEP + ar;

// ---------- validation (used on every read and on JSON import) ----------
const isStr = (v: unknown, max = 4000): v is string => typeof v === 'string' && v.length <= max;
const bi = (v: unknown, max = 4000): Bi | undefined => (Array.isArray(v) && v.length === 2 && isStr(v[0], max) && isStr(v[1], max) ? [v[0], v[1]] : undefined);
const biList = (v: unknown, max = 60) => (Array.isArray(v) ? v.slice(0, max).map((x) => bi(x)).filter((x): x is Bi => !!x) : undefined);
const date = (v: unknown) => (isStr(v, 10) && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '');
const hhmm = (v: unknown) => (isStr(v, 5) && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : undefined);
const url = (v: unknown) => (isStr(v, 600) && (/^https?:\/\//.test(v) || v.startsWith('/') || v === '') ? v : undefined);
const TAGS = ['offer', 'hours', 'news', 'event', 'closure', 'opening'];
const CATS = ['cardio', 'strength', 'balance'];

function cleanFacts(v: unknown): ServiceFact[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, 60).flatMap((f) => { const label = bi(f?.label), value = bi(f?.value); return label && value ? [{ label, value, date: date(f.date), source: url(f.source) ?? '', ...(f.past ? { past: true } : {}) }] : []; });
}
function cleanFaqs(v: unknown): ServiceFaq[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, 40).flatMap((f) => { const q = bi(f?.q), a = bi(f?.a); return q && a ? [{ q, a }] : []; });
}
function cleanTimeline(v: unknown): TimelineItem[] | undefined {
  if (!Array.isArray(v)) return undefined;
  return v.slice(0, 120).flatMap((x) => { const title = bi(x?.title); if (!title || !TAGS.includes(x.tag)) return []; const text = bi(x.text); return [{ date: date(x.date), tag: x.tag, title, ...(text && (text[0] || text[1]) ? { text } : {}), source: url(x.source) ?? '' , ...(isStr(x.image, 300) && x.image ? { image: x.image } : {}) }]; });
}
function cleanMenu(v: unknown): Service['menu'] | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const m = v as Record<string, unknown>;
  const note = bi(m.note); if (!note || !Array.isArray(m.sections)) return undefined;
  const sections: MenuSection[] = m.sections.slice(0, 30).flatMap((s) => {
    const title = bi(s?.title); if (!title || !Array.isArray(s.items)) return [];
    const items = s.items.slice(0, 80).flatMap((it: Record<string, unknown>) => {
      const name = bi(it?.name); if (!name) return [];
      const desc = bi(it.desc);
      const prices = Array.isArray(it.prices) ? it.prices.slice(0, 8).flatMap((p: Record<string, unknown>) => (isStr(p?.jd, 20) ? [{ ...(bi(p.label) ? { label: bi(p.label) } : {}), jd: p.jd as string }] : [])) : [];
      return [{ name, ...(desc && (desc[0] || desc[1]) ? { desc } : {}), prices }];
    });
    return [{ title, items }];
  });
  return { note, source: url(m.source) ?? '', sections, pages: Array.isArray(m.pages) ? m.pages.filter((p) => isStr(p, 300)).slice(0, 10) as string[] : [] };
}
function cleanService(v: unknown): ServicePatch | undefined {
  if (!v || typeof v !== 'object') return undefined;
  const s = v as Record<string, unknown>; const out: ServicePatch = {};
  for (const k of ['name', 'kicker', 'headline', 'intro'] as const) { const b = bi(s[k]); if (b) out[k] = b; }
  for (const k of ['body', 'highlights'] as const) { const l = biList(s[k]); if (l) out[k] = l; }
  const facts = cleanFacts(s.facts); if (facts) out.facts = facts;
  const faqs = cleanFaqs(s.faqs); if (faqs) out.faqs = faqs;
  const tl = cleanTimeline(s.timeline); if (tl) out.timeline = tl;
  const menu = cleanMenu(s.menu); if (menu) out.menu = menu;
  const ph = s.phone as Record<string, unknown> | undefined;
  if (ph && isStr(ph.display, 40) && isStr(ph.tel, 20)) out.phone = { display: ph.display, tel: ph.tel, label: bi(ph.label) ?? ['Call', 'اتصل'] };
  return Object.keys(out).length ? out : undefined;
}

function cleanPlans(v: unknown): PlanCategory[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cats = v.slice(0, 30).flatMap((c: Record<string, unknown>) => {
    const name = bi(c?.name, 120), audience = bi(c?.audience, 200);
    if (!name || !audience || !isStr(c.id, 40) || !/^[a-z0-9-]{1,40}$/.test(c.id)) return [];
    const plans: Plan[] = Array.isArray(c.plans) ? c.plans.slice(0, 20).flatMap((p: Record<string, unknown>) => {
      const label = bi(p?.label, 120); const price = Number(p?.price);
      if (!label || !isStr(p.id, 40) || !/^[a-z0-9-]{1,40}$/.test(p.id) || !Number.isFinite(price) || price < 0 || price > 100000) return [];
      const months = Number(p.months); const days = Number(p.days);
      const unit = bi(p.unit, 60), note = bi(p.note, 200);
      return [{ id: p.id, label, price: Math.round(price * 100) / 100, ...(unit && (unit[0] || unit[1]) ? { unit } : {}), ...(Number.isInteger(months) && months >= 1 && months <= 24 ? { months } : {}), ...(Number.isInteger(days) && days >= 1 && days <= 60 ? { days } : {}), ...(note && (note[0] || note[1]) ? { note } : {}), ...(p.example ? { example: true } : {}), ...(p.popular ? { popular: true } : {}) }];
    }) : [];
    return [{ id: c.id, name, audience, ...(isStr(c.service, 40) && c.service ? { service: c.service } : {}), ...(c.for === 'men' || c.for === 'women' ? { for: c.for as 'men' | 'women' } : {}), includes: biList(c.includes, 12) ?? [], plans }];
  });
  return cats.length ? cats : undefined;
}

export function sanitize(input: unknown): Overrides {
  if (!input || typeof input !== 'object') return EMPTY;
  const o = input as Record<string, unknown>; const out: Overrides = {};
  if (o.texts && typeof o.texts === 'object') {
    const texts: Record<string, Bi> = {};
    for (const [k, v] of Object.entries(o.texts as object).slice(0, 5000)) { const b = bi(v, 6000); if (isStr(k, 12000) && k.includes(SEP) && b) texts[k] = b; }
    if (Object.keys(texts).length) out.texts = texts;
  }
  if (o.contact && typeof o.contact === 'object') {
    const c = o.contact as Record<string, unknown>; const oc: Partial<Contact> = {};
    const phone = (p: unknown) => { const x = p as Record<string, unknown>; return x && isStr(x.display, 40) && isStr(x.tel, 20) ? { display: x.display, tel: x.tel } : undefined; };
    if (Array.isArray(c.phones)) { const ps = c.phones.map(phone).filter((x): x is { display: string; tel: string } => !!x).slice(0, 4); if (ps.length) oc.phones = ps; }
    if (isStr(c.whatsapp, 20) && /^\d{8,15}$/.test(c.whatsapp)) oc.whatsapp = c.whatsapp;
    const lp = phone(c.loungePhone); if (lp) oc.loungePhone = lp;
    if (isStr(c.email, 120)) oc.email = c.email;
    const cq = c.cliq as Record<string, unknown> | undefined;
    if (cq && isStr(cq.alias, 60) && isStr(cq.name, 120)) oc.cliq = { alias: cq.alias.trim(), name: cq.name.trim(), example: !!cq.example };
    const cw = c.careersWhatsapp as Record<string, unknown> | undefined;
    if (cw && isStr(cw.display, 40) && isStr(cw.number, 20)) oc.careersWhatsapp = { display: cw.display, number: cw.number };
    const ad = c.address as Record<string, unknown> | undefined;
    if (ad && isStr(ad.en, 300) && isStr(ad.ar, 300)) oc.address = { en: ad.en, ar: ad.ar };
    for (const k of ['mapsUrl', 'directionsUrl', 'mapEmbed', 'instagram', 'facebook'] as const) { const u = url(c[k]); if (u) oc[k] = u; }
    if (Object.keys(oc).length) out.contact = oc;
  }
  if (Array.isArray(o.hours)) {
    const rows = o.hours.slice(0, 12).flatMap((r) => { const open = hhmm(r?.open), close = hhmm(r?.close); return isStr(r?.en, 80) && isStr(r?.ar, 80) && open && close ? [{ id: isStr(r.id, 40) ? r.id : 'row', en: r.en, ar: r.ar, open, close, ...(isStr(r.noteEn, 200) && r.noteEn ? { noteEn: r.noteEn } : {}), ...(isStr(r.noteAr, 200) && r.noteAr ? { noteAr: r.noteAr } : {}), source: url(r.source) ?? '', published: date(r.published) }] : []; });
    if (rows.length) out.hours = rows;
  }
  if (o.schedule && typeof o.schedule === 'object') {
    const s = o.schedule as Record<string, unknown>;
    const days = Array.isArray(s.days) ? s.days.slice(0, 7).flatMap((d) => (isStr(d?.en, 20) && isStr(d?.ar, 20) && date(d.date) ? [{ en: d.en, ar: d.ar, date: date(d.date) }] : [])) : [];
    const classes = Array.isArray(s.classes) ? s.classes.slice(0, 200).flatMap((c) => (isStr(c?.day, 20) && isStr(c.time, 5) && /^\d{1,2}:\d{2}$/.test(c.time) && (c.period === 'AM' || c.period === 'PM') && isStr(c.name, 60) && isStr(c.ar, 60) && isStr(c.coach, 40) && CATS.includes(c.category) ? [{ day: c.day, time: c.time, period: c.period, name: c.name, ar: c.ar, coach: c.coach, category: c.category }] : [])) : [];
    if (days.length) out.schedule = { days, classes };
  }
  if (o.services && typeof o.services === 'object') {
    const svc: Record<string, ServicePatch> = {};
    for (const [k, v] of Object.entries(o.services as object)) { const p = cleanService(v); if (/^[a-z-]{2,30}$/.test(k) && p) svc[k] = p; }
    if (Object.keys(svc).length) out.services = svc;
  }
  if (o.photos && typeof o.photos === 'object') {
    const ph: Record<string, string> = {};
    for (const [k, v] of Object.entries(o.photos as object)) if (isStr(k, 200) && k.startsWith('/images/') && isStr(v, 40) && /^p[a-z0-9]{6,30}$/.test(v)) ph[k] = v;
    if (Object.keys(ph).length) out.photos = ph;
  }
  if (isStr(o.accent, 7) && /^#[0-9a-fA-F]{6}$/.test(o.accent)) out.accent = o.accent;
  const an = o.announcement as Record<string, unknown> | undefined;
  if (an && typeof an === 'object') { const text = bi(an.text, 200); if (text) out.announcement = { on: !!an.on, text, href: url(an.href) ?? '' }; }
  const plans = cleanPlans(o.plans); if (plans) out.plans = plans;
  if (isStr(o.savedAt, 40)) out.savedAt = o.savedAt;
  return out;
}

// ---------- browser store ----------
let raw: string | null | undefined;
let cache: Overrides = EMPTY;
const listeners = new Set<() => void>();
export function readOverrides(): Overrides {
  let r: string | null = null;
  try { r = localStorage.getItem(STORE_KEY); } catch { /* storage blocked */ }
  if (r !== raw) { raw = r; try { cache = r ? sanitize(JSON.parse(r)) : EMPTY; } catch { cache = EMPTY; } }
  return cache;
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === STORE_KEY) cb(); };
  window.addEventListener('storage', onStorage);
  return () => { listeners.delete(cb); window.removeEventListener('storage', onStorage); };
}
export function writeOverrides(next: Overrides) {
  const clean = sanitize(next);
  const empty = !Object.keys(clean).filter((k) => k !== 'savedAt').length;
  if (empty) localStorage.removeItem(STORE_KEY);
  else localStorage.setItem(STORE_KEY, JSON.stringify({ ...clean, savedAt: new Date().toISOString() }));
  listeners.forEach((l) => l());
}
export const useOverrides = () => useSyncExternalStore(subscribe, readOverrides, () => EMPTY);

// ---------- applying overrides ----------
export function pickText(o: Overrides, lang: 'en' | 'ar', en: string, ar: string) {
  const x = o.texts?.[textKey(en, ar)];
  return lang === 'ar' ? (x?.[1] || ar) : (x?.[0] || en);
}
export function siteInfoOf(o: Overrides) {
  return { contact: { ...baseContact, ...o.contact } as Contact, hours: o.hours ?? baseHours };
}
export function scheduleOf(o: Overrides) {
  return o.schedule ? { days: o.schedule.days, classes: o.schedule.classes } : { days: baseDays, classes: baseClasses };
}
export function applyService<T extends Service>(s: T, o: Overrides): T {
  const p = o.services?.[s.slug];
  return p ? { ...s, ...p } : s;
}
export const useSiteInfo = () => { const o = useOverrides(); return useMemo(() => siteInfoOf(o), [o]); };
// Day stamp in Amman; empty on the server so the first render matches the static HTML.
const subDay = (cb: () => void) => { const id = setInterval(cb, 60_000); return () => clearInterval(id); };
export const useSchedule = () => {
  const o = useOverrides();
  const today = useSyncExternalStore(subDay, () => ammanToday(), () => '');
  return useMemo(() => { const s = scheduleOf(o); return today ? { ...s, days: rollDays(s.days, today) } : s; }, [o, today]);
};
export const useService = <T extends Service>(s: T) => { const o = useOverrides(); return useMemo(() => applyService(s, o), [s, o]); };

export const plansOf = (o: Overrides): PlanCategory[] => o.plans ?? planCategories;
export const usePlans = () => { const o = useOverrides(); return useMemo(() => plansOf(o), [o]); };

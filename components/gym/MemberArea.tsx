"use client";

// The pieces of My training that read and write the member's own records: the workout log (month view, form and
// list), the weight log, the list of requests sent to the club, and the privacy controls. MemberExperience.tsx loads
// the data once and arranges these under its three tabs; each piece only saves or deletes, then announces the change
// (memberChanged) so the page reloads its numbers.

import { useMemo, useState, type FormEvent } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import { legalConsent, legalError } from "@/lib/legal";
import { memberChanged } from "@/lib/member-events";

export type Lang = "en" | "ar";
export type Workout = { id: string | number; name: string; duration: number; date: string; notes?: string | null };
export type Measurement = { id: string | number; weight: number; date: string };
export type GymRequest = { id: string | number; kind: string; interest?: string | null; preferredDate?: string | null; createdAt?: string | number; reference?: string; status: string };
export type MemberData = { user: { displayName: string; email: string } | null; workouts: Workout[]; measurements: Measurement[]; requests: GymRequest[] };

const copy = {
  en: {
    addWorkout: "Log a workout", quick: "Quick picks", workoutName: "What did you train?", workoutPlaceholder: "e.g. Chest and triceps", duration: "Duration (minutes)", date: "Date", notes: "Notes (optional)", notesPlaceholder: "What went well today?", saveWorkout: "Save workout", saving: "Saving…", workoutSaved: "Workout saved. Keep showing up.", weightSaved: "Weight saved.", deleted: "Entry deleted.", allDeleted: "Your saved records have been deleted.", saveError: "We couldn't save that. Please try again.", deleteError: "We couldn't delete that. Please try again.", privacy: "Privacy Policy", terms: "Terms & Conditions", deleteEntry: "Delete entry",
    prevMonth: "Previous month", nextMonth: "Next month", statSessions: "Workouts", statTime: "Time", statDays: "Training days", statAvg: "Average", calLabel: "Days of the month. Choose a day to log its workout.", monthWorkouts: "This month's workouts", emptyMonth: "No workouts logged this month.", showAllRows: "Show all", showLess: "Show fewer", moreThanLast: "more than last month", fewerThanLast: "fewer than last month", sameAsLast: "Same as last month", workoutsOn: "workouts",
    weightTitle: "My weight", weightIntro: "Record your weight every so often and see how it changes. These are personal records, not a health assessment.", weightLabel: "Today's weight (kg)", saveWeight: "Add weight", emptyWeights: "Add a weight to start your chart.", allEntries: "All entries", chartLabel: "Weight history in kilograms", kg: "kg", since: "since",
    requests: "My requests", requestIntro: "Tour, membership and class requests you send appear here. The club confirms availability and prices with you directly.", emptyRequests: "No requests yet.", pending: "Awaiting confirmation", contacted: "Contacted by the team", confirmed: "Confirmed", cancelled: "Cancelled", rejected: "Not available", preferred: "Preferred date", tour: "Club tour", membership: "Membership request", class: "Class enquiry", training: "Personal training", contact: "Contact enquiry",
    privacyText: "Your records are private to your account.", signedInAs: "Signed in as", help: "Help centre", signOut: "Sign out", deleteData: "Delete my saved data", deleteConfirm: "Delete all saved records? This cannot be undone.", confirmDelete: "Yes, delete my data", cancel: "Cancel", deleteBusy: "Deleting…",
  },
  ar: {
    addWorkout: "سجّل تمريناً", quick: "اختيارات سريعة", workoutName: "ماذا تمرّنت؟", workoutPlaceholder: "مثال: صدر وترايسبس", duration: "المدة (بالدقائق)", date: "التاريخ", notes: "ملاحظات (اختياري)", notesPlaceholder: "كيف كان تمرينك اليوم؟", saveWorkout: "حفظ التمرين", saving: "جارٍ الحفظ…", workoutSaved: "تم حفظ التمرين. واصل التقدم.", weightSaved: "تم حفظ الوزن.", deleted: "تم حذف الإدخال.", allDeleted: "تم حذف سجلاتك المحفوظة.", saveError: "تعذّر الحفظ. يُرجى المحاولة مرة أخرى.", deleteError: "تعذّر الحذف. يُرجى المحاولة مرة أخرى.", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", deleteEntry: "حذف الإدخال",
    prevMonth: "الشهر السابق", nextMonth: "الشهر التالي", statSessions: "التمارين", statTime: "الوقت", statDays: "أيام التمرين", statAvg: "معدل التمرين", calLabel: "أيام الشهر. اختر يوماً لتسجيل تمرينه.", monthWorkouts: "تمارين الشهر", emptyMonth: "لا توجد تمارين مسجّلة في هذا الشهر.", showAllRows: "عرض الكل", showLess: "عرض أقل", moreThanLast: "أكثر من الشهر الماضي", fewerThanLast: "أقل من الشهر الماضي", sameAsLast: "مثل الشهر الماضي", workoutsOn: "تمارين",
    weightTitle: "وزني", weightIntro: "سجّل وزنك بين فترة وأخرى وتابع تغيّره. هذه سجلات شخصية وليست تقييماً صحياً.", weightLabel: "وزن اليوم (كغ)", saveWeight: "أضف الوزن", emptyWeights: "أضف وزناً لبدء مخططك.", allEntries: "كل القياسات", chartLabel: "سجل الوزن بالكيلوغرام", kg: "كغ", since: "منذ",
    requests: "طلباتي", requestIntro: "تظهر هنا طلبات الزيارة والاشتراك والحصص التي ترسلها. يؤكد النادي التوفر والأسعار معك مباشرة.", emptyRequests: "لا توجد طلبات بعد.", pending: "بانتظار التأكيد", contacted: "تم التواصل", confirmed: "مؤكد", cancelled: "ملغى", rejected: "غير متاح", preferred: "التاريخ المفضّل", tour: "زيارة النادي", membership: "طلب اشتراك", class: "استفسار عن حصة", training: "تدريب شخصي", contact: "طلب تواصل",
    privacyText: "سجلاتك خاصة بحسابك.", signedInAs: "الحساب:", help: "مركز المساعدة", signOut: "تسجيل الخروج", deleteData: "حذف بياناتي المحفوظة", deleteConfirm: "هل تريد حذف جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.", confirmDelete: "نعم، احذف بياناتي", cancel: "إلغاء", deleteBusy: "جارٍ الحذف…",
  },
} as const;

const QUICK: Record<Lang, string[]> = {
  en: ["Chest", "Back", "Legs", "Shoulders", "Arms", "Cardio", "Full body"],
  ar: ["صدر", "ظهر", "أرجل", "أكتاف", "ذراعان", "كارديو", "الجسم كاملاً"],
};

// ---- dates and numbers (dates are plain YYYY-MM-DD strings in Amman time; formatting always in UTC) ----
export function ammanToday() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
export const locale = (lang: Lang) => (lang === "ar" ? "ar-JO-u-nu-arab" : "en-GB");
const utc = (date: string) => new Date(`${date}T12:00:00Z`);
export const fmtNum = (n: number, lang: Lang, digits = 0) => n.toLocaleString(locale(lang), { maximumFractionDigits: digits });
export const fmtDate = (date: string, lang: Lang, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) => {
  const d = utc(date);
  return Number.isNaN(d.getTime()) ? date : new Intl.DateTimeFormat(locale(lang), { ...opts, timeZone: "UTC" }).format(d);
};
export function fmtDuration(minutes: number, lang: Lang) {
  const m = Math.round(minutes);
  if (m < 60) return `${fmtNum(m, lang)} ${lang === "ar" ? "د" : "min"}`;
  const h = Math.floor(m / 60); const rest = m % 60;
  return lang === "ar" ? `${fmtNum(h, lang)} س${rest ? ` ${fmtNum(rest, lang)} د` : ""}` : `${h} h${rest ? ` ${rest} m` : ""}`;
}
// The week runs Saturday to Friday, as on the club's schedule.
export function weekStartOf(date: string) {
  const d = utc(date);
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 1) % 7));
  return d.toISOString().slice(0, 10);
}
const shiftMonth = (month: string, by: number) => {
  const d = new Date(`${month}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + by);
  return d.toISOString().slice(0, 7);
};
// Arabic counted nouns: 1 and 2 have their own forms, 3-10 take the plural, 11+ the singular accusative.
export const arCount = (n: number, one: string, two: string, few: string, many: string) => (n === 1 ? one : n === 2 ? two : n >= 3 && n <= 10 ? `${fmtNum(n, "ar")} ${few}` : `${fmtNum(n, "ar")} ${many}`);

function Consent({ lang }: { lang: Lang }) {
  const t = copy[lang];
  return <label className="hp3-consent"><input type="checkbox" name="consent" required /><span>{legalConsent(lang)} <a href={lang === "ar" ? "/ar/privacy" : "/privacy"} target="_blank" rel="noopener noreferrer">{t.privacy}</a> · <a href={lang === "ar" ? "/ar/terms" : "/terms"} target="_blank" rel="noopener noreferrer">{t.terms}</a></span></label>;
}

type Feedback = { error: string; notice: string };
const quiet: Feedback = { error: "", notice: "" };
function Status({ error, notice }: Feedback) {
  return <>{error && <p className="hp3-error" role="alert">{error}</p>}{notice && <p className="ac-saved" role="status">{notice}</p>}</>;
}

async function send(path: string, init: RequestInit) {
  try { const r = await fetch(path, init); return r.status === 401 ? "signedOut" : r.ok ? "ok" : "failed"; } catch { return "failed"; }
}
const json = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

// ===== Workout log: the month at a glance, the form, and that month's list =====
export function WorkoutLog({ lang, workouts, onSignedOut }: { lang: Lang; workouts: Workout[]; onSignedOut: () => void }) {
  const t = copy[lang];
  const today = ammanToday();
  const thisMonth = today.slice(0, 7);
  const [month, setMonth] = useState(thisMonth);
  const [date, setDate] = useState(today);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState("");
  const [fb, setFb] = useState<Feedback>(quiet);
  const [all, setAll] = useState(false);

  const inMonth = useMemo(() => workouts.filter((w) => w.date.slice(0, 7) === month).sort((a, b) => b.date.localeCompare(a.date)), [workouts, month]);
  const before = useMemo(() => workouts.filter((w) => w.date.slice(0, 7) === shiftMonth(month, -1)).length, [workouts, month]);
  const perDay = useMemo(() => { const m = new Map<string, number>(); inMonth.forEach((w) => m.set(w.date, (m.get(w.date) ?? 0) + 1)); return m; }, [inMonth]);
  const total = inMonth.reduce((sum, w) => sum + Number(w.duration), 0);
  const diff = inMonth.length - before;
  const gap = Math.abs(diff);
  const compare = before === 0 ? "" : diff === 0 ? t.sameAsLast : `${lang === "ar" ? arCount(gap, "تمرين واحد", "تمرينان", "تمارين", "تمريناً") : gap} ${diff > 0 ? t.moreThanLast : t.fewerThanLast}`;

  const first = new Date(`${month}-01T12:00:00Z`);
  const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 1) % 7; // empty cells before day 1, week starting Saturday
  const heads = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(locale(lang), { weekday: "narrow", timeZone: "UTC" }).format(new Date(Date.UTC(2023, 0, 7 + i)))); // 7 Jan 2023 was a Saturday

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("consent") !== "on") { setFb({ error: legalError(lang), notice: "" }); return; }
    setBusy("save"); setFb(quiet);
    const result = await send("/api/workouts", json({ name: name.trim(), duration: Number(values.get("duration")), date, notes: String(values.get("notes") ?? "").trim(), consent: true }));
    setBusy("");
    if (result === "signedOut") { onSignedOut(); return; }
    if (result !== "ok") { setFb({ error: t.saveError, notice: "" }); return; }
    form.reset(); setName(""); setMonth(date.slice(0, 7)); setFb({ error: "", notice: t.workoutSaved }); memberChanged();
  }
  async function remove(w: Workout) {
    setBusy(`del-${w.id}`); setFb(quiet);
    const result = await send(`/api/workouts?id=${encodeURIComponent(String(w.id))}`, { method: "DELETE" });
    setBusy("");
    if (result !== "ok") { setFb({ error: t.deleteError, notice: "" }); return; }
    setFb({ error: "", notice: t.deleted }); memberChanged();
  }

  const rows = all ? inMonth : inMonth.slice(0, 6);
  return <div className="ac-log">
    <div className="ac-log-layout">
      <section className="ac-card ac-month">
        <div className="ac-month-nav">
          <button type="button" className="ac-icon" aria-label={t.prevMonth} onClick={() => { setMonth(shiftMonth(month, -1)); setAll(false); }}><ChevronLeft size={18} /></button>
          <h3 aria-live="polite">{fmtDate(`${month}-01`, lang, { month: "long", year: "numeric" })}</h3>
          <button type="button" className="ac-icon" aria-label={t.nextMonth} disabled={month >= thisMonth} onClick={() => { setMonth(shiftMonth(month, 1)); setAll(false); }}><ChevronRight size={18} /></button>
        </div>
        <dl className="ac-stats">
          <div className="is-main"><dd>{fmtNum(inMonth.length, lang)}</dd><dt>{t.statSessions}</dt></div>
          <div><dd>{inMonth.length ? fmtDuration(total, lang) : "—"}</dd><dt>{t.statTime}</dt></div>
          <div><dd>{inMonth.length ? fmtNum(perDay.size, lang) : "—"}</dd><dt>{t.statDays}</dt></div>
          <div><dd>{inMonth.length ? fmtDuration(total / inMonth.length, lang) : "—"}</dd><dt>{t.statAvg}</dt></div>
        </dl>
        {compare && <p className="ac-compare">{compare}</p>}
        <div className="ac-cal" role="group" aria-label={t.calLabel}>
          {heads.map((h, i) => <span key={`h${i}`} className="ac-cal-head" aria-hidden="true">{h}</span>)}
          {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = `${month}-${String(i + 1).padStart(2, "0")}`;
            const count = perDay.get(day) ?? 0;
            return <button type="button" key={day} disabled={day > today} aria-pressed={day === date} aria-label={`${fmtDate(day, lang, { weekday: "long", day: "numeric", month: "long" })}${count ? ` · ${fmtNum(count, lang)} ${t.workoutsOn}` : ""}`} className={`${count ? "has-log" : ""}${day === today ? " is-today" : ""}`} onClick={() => setDate(day)}>{fmtNum(i + 1, lang)}</button>;
          })}
        </div>
      </section>
      <form className="ac-card ac-form" onSubmit={(event) => void save(event)}>
        <h3>{t.addWorkout}</h3>
        <div className="ac-quick" role="group" aria-label={t.quick}>{QUICK[lang].map((q) => <button type="button" key={q} className={name === q ? "is-on" : ""} onClick={() => setName(q)}>{q}</button>)}</div>
        <label className="hp3-field">{t.workoutName}<input className="hp3-input" name="name" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={100} placeholder={t.workoutPlaceholder} enterKeyHint="done" /></label>
        <div className="ac-form-row">
          <label className="hp3-field">{t.duration}<input className="hp3-input" name="duration" type="number" inputMode="numeric" min="1" max="600" step="1" defaultValue="60" required /></label>
          <label className="hp3-field">{t.date}<input className="hp3-input" name="date" type="date" value={date} max={today} onChange={(e) => { if (e.target.value) setDate(e.target.value); }} required /></label>
        </div>
        <label className="hp3-field">{t.notes}<textarea className="hp3-input" name="notes" maxLength={1000} rows={2} placeholder={t.notesPlaceholder} /></label>
        <Consent lang={lang} />
        <Status {...fb} />
        <button className="hp3-button hp3-red" type="submit" disabled={busy !== ""}>{busy === "save" ? <LoaderCircle size={16} className="ac-spin" /> : <Plus size={16} />}{busy === "save" ? t.saving : t.saveWorkout}</button>
      </form>
    </div>
    <section className="ac-sessions">
      <h3>{t.monthWorkouts}</h3>
      {inMonth.length ? <ul className="ac-list">{rows.map((w) => <li className="ac-row" key={w.id}>
        <span className="ac-row-day"><b>{fmtDate(w.date, lang, { day: "numeric" })}</b><small>{fmtDate(w.date, lang, { weekday: "short" })}</small></span>
        <div><strong>{w.name}</strong>{w.notes && <span>{w.notes}</span>}</div>
        <b className="ac-row-min">{fmtDuration(Number(w.duration), lang)}</b>
        <button type="button" className="ac-remove" disabled={busy !== ""} aria-label={`${t.deleteEntry}: ${w.name}`} onClick={() => void remove(w)}><X size={17} /></button>
      </li>)}</ul> : <p className="ac-empty">{t.emptyMonth}</p>}
      {inMonth.length > 6 && <button type="button" className="ac-link ac-more-rows" onClick={() => setAll(!all)}>{all ? t.showLess : `${t.showAllRows} (${fmtNum(inMonth.length, lang)})`}</button>}
    </section>
  </div>;
}

// ===== Weight: latest value, chart, a form to add one, and every entry =====
export function WeightLog({ lang, measurements, onSignedOut }: { lang: Lang; measurements: Measurement[]; onSignedOut: () => void }) {
  const t = copy[lang];
  const today = ammanToday();
  const [busy, setBusy] = useState("");
  const [fb, setFb] = useState<Feedback>(quiet);
  const weights = useMemo(() => [...measurements].sort((a, b) => a.date.localeCompare(b.date)), [measurements]);
  const latest = weights[weights.length - 1];
  const change = weights.length > 1 ? Number(latest.weight) - Number(weights[0].weight) : null;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("consent") !== "on") { setFb({ error: legalError(lang), notice: "" }); return; }
    setBusy("save"); setFb(quiet);
    const result = await send("/api/measurements", json({ weight: Number(values.get("weight")), date: values.get("date"), consent: true }));
    setBusy("");
    if (result === "signedOut") { onSignedOut(); return; }
    if (result !== "ok") { setFb({ error: t.saveError, notice: "" }); return; }
    form.reset(); setFb({ error: "", notice: t.weightSaved }); memberChanged();
  }
  async function remove(m: Measurement) {
    setBusy(`del-${m.id}`); setFb(quiet);
    const result = await send(`/api/measurements?id=${encodeURIComponent(String(m.id))}`, { method: "DELETE" });
    setBusy("");
    if (result !== "ok") { setFb({ error: t.deleteError, notice: "" }); return; }
    setFb({ error: "", notice: t.deleted }); memberChanged();
  }

  return <section className="ac-card ac-weight">
    <div className="ac-weight-head">
      <div><h3>{t.weightTitle}</h3><p className="ac-muted">{t.weightIntro}</p></div>
      {latest && <p className="ac-weight-latest"><b>{fmtNum(Number(latest.weight), lang, 1)}</b> <span>{t.kg}</span></p>}
    </div>
    {weights.length ? <WeightChart weights={weights} lang={lang} label={t.chartLabel} /> : <p className="ac-empty">{t.emptyWeights}</p>}
    {change !== null && <p className="ac-compare"><bdi dir="ltr">{change > 0 ? "+" : change < 0 ? "−" : ""}{fmtNum(Math.abs(change), lang, 1)}</bdi> {t.kg} {t.since} {fmtDate(weights[0].date, lang)}</p>}
    <form className="ac-weight-form" onSubmit={(event) => void save(event)}>
      <label className="hp3-field">{t.weightLabel}<input className="hp3-input" name="weight" type="number" inputMode="decimal" min="20" max="400" step="0.1" placeholder="75.0" required /></label>
      <label className="hp3-field">{t.date}<input className="hp3-input" name="date" type="date" defaultValue={today} max={today} required /></label>
      <button className="hp3-button" type="submit" disabled={busy !== ""}>{busy === "save" ? <LoaderCircle size={16} className="ac-spin" /> : <Plus size={16} />}{busy === "save" ? t.saving : t.saveWeight}</button>
      <Consent lang={lang} />
    </form>
    <Status {...fb} />
    {weights.length > 0 && <details className="ac-all"><summary>{t.allEntries} ({fmtNum(weights.length, lang)})</summary><ul className="ac-list">{[...weights].reverse().map((m) => <li className="ac-row is-weight" key={m.id}>
      <div><strong>{fmtNum(Number(m.weight), lang, 1)} {t.kg}</strong><span>{fmtDate(m.date, lang)}</span></div>
      <button type="button" className="ac-remove" disabled={busy !== ""} aria-label={`${t.deleteEntry}: ${fmtDate(m.date, lang)}`} onClick={() => void remove(m)}><Trash2 size={16} /></button>
    </li>)}</ul></details>}
  </section>;
}

function WeightChart({ weights, lang, label }: { weights: Measurement[]; lang: Lang; label: string }) {
  const shown = weights.slice(-20);
  const values = shown.map((w) => Number(w.weight));
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const width = 600; const height = 160; const inset = 26;
  const points = shown.map((w, i) => ({ x: shown.length === 1 ? width / 2 : inset + i / (shown.length - 1) * (width - inset * 2), y: inset + (1 - (Number(w.weight) - min) / (max - min)) * (height - inset * 2), w }));
  return <figure className="ac-chart">
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${label}: ${shown.map((w) => `${fmtDate(w.date, lang)} ${fmtNum(Number(w.weight), lang, 1)}`).join(", ")}`}>
      {[0, 1, 2].map((i) => <line key={i} x1={inset} x2={width - inset} y1={inset + i * (height - inset * 2) / 2} y2={inset + i * (height - inset * 2) / 2} strokeDasharray="4 5" />)}
      {shown.length > 1 && <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" strokeWidth="3" strokeLinejoin="round" />}
      {points.map((p, i) => <g key={p.w.id}><circle cx={p.x} cy={p.y} r="5" strokeWidth="2" />{(i === 0 || i === points.length - 1) && <text x={p.x} y={p.y - 12} textAnchor="middle">{fmtNum(Number(p.w.weight), lang, 1)}</text>}</g>)}
    </svg>
    <figcaption><span>{fmtDate(shown[0].date, lang)}</span><span>{shown.length > 1 ? fmtDate(shown[shown.length - 1].date, lang) : ""}</span></figcaption>
  </figure>;
}

// ===== Requests sent to the club =====
export function RequestList({ lang, requests }: { lang: Lang; requests: GymRequest[] }) {
  const t = copy[lang];
  const [all, setAll] = useState(false);
  const label = (key: string) => (t as Record<string, string>)[key] ?? key;
  const rows = all ? requests : requests.slice(0, 3);
  return <section className="ac-card ac-requests">
    <h3>{t.requests}</h3>
    {requests.length ? <ul className="ac-list">{rows.map((r) => <li className="ac-request" key={r.id}>
      <div><strong>{label(r.kind)}</strong>{r.interest && <span>{r.interest}</span>}{r.preferredDate && <span>{t.preferred}: {fmtDate(r.preferredDate, lang)}</span>}<small dir="ltr">{r.reference || `#${r.id}`}</small></div>
      <span className={`ac-status is-${r.status}`}>{label(r.status)}</span>
    </li>)}</ul> : <p className="ac-empty">{t.emptyRequests}</p>}
    {requests.length > 3 && <button type="button" className="ac-link ac-more-rows" onClick={() => setAll(!all)}>{all ? t.showLess : `${t.showAllRows} (${fmtNum(requests.length, lang)})`}</button>}
    <p className="ac-foot">{t.requestIntro}</p>
  </section>;
}

// ===== Privacy: who is signed in, help, sign out, delete everything =====
export function DataControls({ lang, user }: { lang: Lang; user: MemberData["user"] }) {
  const t = copy[lang];
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [fb, setFb] = useState<Feedback>(quiet);
  async function clear() {
    setBusy(true); setFb(quiet);
    const result = await send("/api/member?scope=data", { method: "DELETE" });
    setBusy(false);
    if (result !== "ok") { setFb({ error: t.deleteError, notice: "" }); return; }
    setConfirm(false); setFb({ error: "", notice: t.allDeleted }); memberChanged();
  }
  return <section className="ac-data">
    <p>{t.privacyText}{user && <> {t.signedInAs} <b>{user.displayName || user.email}</b></>}</p>
    <div className="ac-data-actions">
      <a className="ac-link" href="/support">{t.help}</a>
      {user && <a className="ac-link" href="/signout-with-chatgpt?return_to=%2F" target="_top">{t.signOut}</a>}
      {user && <button type="button" className="ac-link is-danger" aria-expanded={confirm} onClick={() => setConfirm(!confirm)}>{t.deleteData}</button>}
    </div>
    {confirm && <div className="ac-confirm" role="group" aria-label={t.deleteData}><p>{t.deleteConfirm}</p><button type="button" className="hp3-button hp3-red" disabled={busy} onClick={() => void clear()}>{busy ? t.deleteBusy : t.confirmDelete}</button><button type="button" className="hp3-button" onClick={() => setConfirm(false)}>{t.cancel}</button></div>}
    <Status {...fb} />
  </section>;
}

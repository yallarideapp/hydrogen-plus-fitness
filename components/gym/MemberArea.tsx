"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { Activity, ArrowUpRight, CalendarDays, Check, Clock3, Dumbbell, LoaderCircle, Plus, Scale, Trash2, UserRound, X } from "lucide-react";
import { legalConsent, legalError } from "@/lib/legal";
import "./member.css";

type Lang = "en" | "ar";
type Workout = { id: string | number; name: string; duration: number; date: string; notes?: string | null };
type Measurement = { id: string | number; weight: number; date: string };
type GymRequest = { id: string | number; kind: string; interest?: string | null; preferredDate?: string | null; createdAt?: string | number; reference?: string; status: string };
type MemberData = { user: { displayName: string; email: string } | null; workouts: Workout[]; measurements: Measurement[]; requests: GymRequest[] };
type Tab = "overview" | "workouts" | "progress" | "requests";

const copy = {
  en: {
    eyebrow: "YOUR MEMBER SPACE", heading: "Your fitness, in focus.", intro: "Build your routine. Keep your progress. Make every session count.", close: "Close member area", overview: "Overview", workouts: "Workout log", progress: "Progress", requests: "My requests", signHeading: "Your next chapter starts here.", signText: "Sign in to save your workouts, track your weight over time, and keep your gym requests together. A website account does not activate a gym membership.", signIn: "Continue with ChatGPT", privacyText: "Your records are private to your account.", loading: "Getting your space ready…", loadError: "We couldn't load your member space. Please try again.", retry: "Try again", welcome: "Welcome back", thisWeek: "Workouts · last 7 days", minutes: "Training minutes · last 7 days", latestWeight: "Latest weight", sessions: "sessions", min: "min", kg: "kg", noWeight: "Not recorded", activity: "Recent activity", noActivity: "A fresh start.", noActivityText: "Log your first workout and start building a routine you can see.", logWorkout: "Log a workout", recordWeight: "Record weight", yourJourney: "Small steps. Real progress.", journeyText: "Your workout history and weight entries live here. Add an entry after your next session.", account: "Account & privacy", accountText: "You control your saved records. Deleting your data removes the requests, workouts and measurements attached to this account.", deleteData: "Delete my saved data", deleteConfirm: "Delete all saved records? This cannot be undone.", confirmDelete: "Yes, delete my data", cancel: "Cancel", addWorkout: "Add a workout", workoutName: "Workout name", workoutPlaceholder: "e.g. Upper-body strength", duration: "Duration (minutes)", date: "Date", notes: "Notes (optional)", notesPlaceholder: "What went well today?", saveWorkout: "Save workout", saving: "Saving…", workoutSaved: "Workout saved. Keep showing up.", weightSaved: "Weight entry saved.", deleted: "Entry deleted.", allDeleted: "Your saved records have been deleted.", saveError: "We couldn't save that. Please try again.", deleteError: "We couldn't delete that. Please try again.", requiredConsent: "Please accept the privacy policy and terms before saving.", privacy: "Privacy Policy", terms: "Terms & Conditions", and: "and", deleteEntry: "Delete entry", emptyWorkouts: "Your first session is waiting.", emptyWorkoutsText: "Record your training above. Your history will appear here.", weightHeading: "Your progress, over time.", weightIntro: "Record your weight when it is useful to you. Entries are personal records, not a health assessment.", weightLabel: "Weight (kg)", saveWeight: "Save weight", emptyWeights: "Progress starts with a first entry.", emptyWeightsText: "Add a weight entry to begin your personal chart.", history: "Your entries", chartLabel: "Weight history in kilograms", requestHeading: "All your next steps, together.", requestIntro: "Tour, membership and session requests submitted while signed in appear here. The gym must confirm availability and pricing directly.", emptyRequests: "No requests yet.", emptyRequestsText: "Explore the club and send a tour or membership enquiry to get started.", explore: "Explore the club", pending: "Awaiting confirmation", contacted: "Contacted by the team", confirmed: "Confirmed", cancelled: "Cancelled", rejected: "Not available", preferred: "Preferred date", tour: "Club tour", membership: "Membership enquiry", class: "Class enquiry", training: "Personal training", contact: "Contact enquiry", deleteBusy: "Deleting…", signOut: "Sign out", latest: "Latest session", showAll: "See all workouts", removed: "Saved data cleared", noRequestsGuest: "Requests sent before signing in are not linked to this account. Contact the gym using your request reference.",
  },
  ar: {
    eyebrow: "مساحتك الشخصية", heading: "لياقتك، بكل وضوح.", intro: "ابنِ روتينك. تابع تقدمك. واجعل كل حصة تستحق.", close: "إغلاق مساحة العضو", overview: "نظرة عامة", workouts: "سجل التمارين", progress: "التقدم", requests: "طلباتي", signHeading: "خطوتك القادمة تبدأ هنا.", signText: "سجّل الدخول لحفظ تمارينك ومتابعة وزنك وجمع طلباتك في مكان واحد. إنشاء حساب في الموقع لا يفعّل اشتراك النادي.", signIn: "المتابعة باستخدام ChatGPT", privacyText: "سجلاتك خاصة بحسابك.", loading: "نجهّز مساحتك…", loadError: "تعذّر تحميل مساحتك. يُرجى المحاولة مرة أخرى.", retry: "إعادة المحاولة", welcome: "مرحباً بعودتك", thisWeek: "التمارين · آخر ٧ أيام", minutes: "دقائق التدريب · آخر ٧ أيام", latestWeight: "آخر وزن مسجّل", sessions: "حصص", min: "دقيقة", kg: "كغ", noWeight: "لم يُسجّل", activity: "آخر الأنشطة", noActivity: "بداية جديدة.", noActivityText: "سجّل تمرينك الأول وابدأ بناء روتين يمكنك متابعة تطوره.", logWorkout: "تسجيل تمرين", recordWeight: "تسجيل الوزن", yourJourney: "خطوات صغيرة. تقدم حقيقي.", journeyText: "هنا تجد سجل تمارينك ووزنك. أضف إدخالاً بعد حصتك القادمة.", account: "الحساب والخصوصية", accountText: "أنت تتحكم في سجلاتك. يؤدي حذف بياناتك إلى إزالة الطلبات والتمارين وقياسات الوزن المرتبطة بهذا الحساب.", deleteData: "حذف بياناتي المحفوظة", deleteConfirm: "هل تريد حذف جميع السجلات؟ لا يمكن التراجع عن هذا الإجراء.", confirmDelete: "نعم، احذف بياناتي", cancel: "إلغاء", addWorkout: "إضافة تمرين", workoutName: "اسم التمرين", workoutPlaceholder: "مثال: تمارين الجزء العلوي", duration: "المدة (بالدقائق)", date: "التاريخ", notes: "ملاحظات (اختياري)", notesPlaceholder: "كيف كان تمرينك اليوم؟", saveWorkout: "حفظ التمرين", saving: "جارٍ الحفظ…", workoutSaved: "تم حفظ التمرين. واصل التقدم.", weightSaved: "تم حفظ الوزن.", deleted: "تم حذف الإدخال.", allDeleted: "تم حذف سجلاتك المحفوظة.", saveError: "تعذّر الحفظ. يُرجى المحاولة مرة أخرى.", deleteError: "تعذّر الحذف. يُرجى المحاولة مرة أخرى.", requiredConsent: "يُرجى الموافقة على سياسة الخصوصية والشروط قبل الحفظ.", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", and: "و", deleteEntry: "حذف الإدخال", emptyWorkouts: "حصتك الأولى تنتظرك.", emptyWorkoutsText: "سجّل تمرينك أعلاه ليظهر سجلك هنا.", weightHeading: "تقدمك، مع مرور الوقت.", weightIntro: "سجّل وزنك عندما يفيدك ذلك. هذه سجلات شخصية وليست تقييماً صحياً.", weightLabel: "الوزن (كغ)", saveWeight: "حفظ الوزن", emptyWeights: "التقدم يبدأ بإدخال أول.", emptyWeightsText: "أضف وزناً لبدء مخططك الشخصي.", history: "سجلاتك", chartLabel: "سجل الوزن بالكيلوغرام", requestHeading: "كل خطواتك القادمة، معاً.", requestIntro: "تظهر هنا طلبات الزيارة والاشتراك والحصص المرسلة أثناء تسجيل الدخول. يؤكد النادي التوفر والأسعار معك مباشرة.", emptyRequests: "لا توجد طلبات بعد.", emptyRequestsText: "استكشف النادي وأرسل طلب زيارة أو استفساراً عن الاشتراك لتبدأ.", explore: "استكشاف النادي", pending: "بانتظار التأكيد", contacted: "تم التواصل", confirmed: "مؤكد", cancelled: "ملغى", rejected: "غير متاح", preferred: "التاريخ المفضّل", tour: "زيارة النادي", membership: "استفسار عن الاشتراك", class: "استفسار عن حصة", training: "تدريب شخصي", contact: "طلب تواصل", deleteBusy: "جارٍ الحذف…", signOut: "تسجيل الخروج", latest: "آخر حصة", showAll: "جميع التمارين", removed: "تم مسح البيانات المحفوظة", noRequestsGuest: "الطلبات المرسلة قبل تسجيل الدخول غير مرتبطة بهذا الحساب. تواصل مع النادي باستخدام الرقم المرجعي لطلبك.",
  },
};

function today() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export default function MemberArea({ lang, onClose }: { lang: Lang; onClose: () => void }) {
  const t = copy[lang];
  const [tab, setTab] = useState<Tab>("overview");
  const [data, setData] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [signedOut, setSignedOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const dateLabel = useCallback((date: string | number) => {
    const parsed = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T12:00:00`) : new Date(date);
    return Number.isNaN(parsed.getTime()) ? String(date) : new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", { day: "numeric", month: "short", year: "numeric" }).format(parsed);
  }, [lang]);

  const load = useCallback(async (initial = true) => {
    if (initial) setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/member", { cache: "no-store" });
      if (response.status === 401) { setSignedOut(true); setData(null); return; }
      if (!response.ok) throw new Error("load-failed");
      const payload = await response.json() as MemberData;
      setData({ user: payload.user, requests: payload.requests ?? [], workouts: payload.workouts ?? [], measurements: payload.measurements ?? [] });
      setSignedOut(!payload.user);
    } catch { setError(copy[lang].loadError); } finally { setLoading(false); }
  }, [lang]);
  useEffect(() => { void load(); }, [load]);

  const workouts = useMemo(() => [...(data?.workouts ?? [])].sort((a, b) => b.date.localeCompare(a.date)), [data]);
  const weights = useMemo(() => [...(data?.measurements ?? [])].sort((a, b) => a.date.localeCompare(b.date)), [data]);
  const week = workouts.filter((w) => { const days = (new Date(`${today()}T12:00:00`).getTime() - new Date(`${w.date}T12:00:00`).getTime()) / 86400000; return days >= 0 && days < 7; });

  async function save(event: FormEvent<HTMLFormElement>, kind: "workouts" | "measurements") {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    if (values.get("consent") !== "on") { setError(legalError(lang)); return; }
    setBusy(kind); setError(""); setNotice("");
    const payload = kind === "workouts"
      ? { name: String(values.get("name") ?? "").trim(), duration: Number(values.get("duration")), date: values.get("date"), notes: String(values.get("notes") ?? "").trim(), consent: true }
      : { weight: Number(values.get("weight")), date: values.get("date"), consent: true };
    try {
      const response = await fetch(`/api/${kind}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (response.status === 401) { setSignedOut(true); setData(null); return; }
      if (!response.ok) throw new Error("save-failed");
      form.reset(); await load(false); setNotice(kind === "workouts" ? t.workoutSaved : t.weightSaved);
    } catch { setError(t.saveError); } finally { setBusy(null); }
  }

  async function remove(kind: "workouts" | "measurements" | "member", id?: string | number) {
    setBusy(`${kind}-${id ?? "all"}`); setError(""); setNotice("");
    try {
      const response = await fetch(kind === "member" ? "/api/member?scope=data" : `/api/${kind}?id=${encodeURIComponent(String(id))}`, { method: "DELETE" });
      if (!response.ok) throw new Error("delete-failed");
      await load(false); setConfirmClear(false); setNotice(kind === "member" ? t.allDeleted : t.deleted);
    } catch { setError(t.deleteError); } finally { setBusy(null); }
  }

  function Consent() {
    return <label className="member-consent"><input type="checkbox" name="consent" required /><span>{legalConsent(lang)} <a href={lang === "ar" ? "/ar/privacy" : "/privacy"} target="_blank" rel="noopener noreferrer">{t.privacy}</a> · <a href={lang === "ar" ? "/ar/terms" : "/terms"} target="_blank" rel="noopener noreferrer">{t.terms}</a></span></label>;
  }

  function Empty({ icon, title, text, children }: { icon: React.ReactNode; title: string; text: string; children?: React.ReactNode }) {
    return <div className="member-empty"><span className="member-empty-icon">{icon}</span><h3>{title}</h3><p>{text}</p>{children}</div>;
  }

  return <section className="member-area" dir={lang === "ar" ? "rtl" : "ltr"}>
    <header className="member-heading"><div><span className="member-eyebrow">{t.eyebrow}</span><h2>{t.heading}</h2><p>{t.intro}</p></div><button type="button" className="member-icon-button" aria-label={t.close} onClick={onClose}><X size={22} /></button></header>
    {loading ? <div className="member-loading"><LoaderCircle className="member-spin" size={24} /><p>{t.loading}</p></div> : signedOut ? <Empty icon={<UserRound size={30} />} title={t.signHeading} text={t.signText}><a className="member-button" href="/signin-with-chatgpt?return_to=%2F%23member" target="_top">{t.signIn}<ArrowUpRight size={17} /></a><small>{t.privacyText}</small></Empty> : !data ? <div className="member-load-error"><p role="alert">{error}</p><button type="button" className="member-button" onClick={() => void load()}>{t.retry}</button></div> : <>
      <div className="member-greeting"><span>{t.welcome}, <strong>{data.user?.displayName || data.user?.email}</strong></span><a href="/signout-with-chatgpt?return_to=%2F" target="_top">{t.signOut}</a></div>
      <nav className="member-tabs" aria-label={lang === "ar" ? "مساحة العضو" : "Member area"}>{(["overview", "workouts", "progress", "requests"] as Tab[]).map((item) => <button type="button" key={item} onClick={() => { setTab(item); setError(""); setNotice(""); }} aria-current={tab === item ? "page" : undefined} className={tab === item ? "is-active" : ""}>{t[item]}{item === "requests" && data.requests.length > 0 && <span>{data.requests.length}</span>}</button>)}</nav>
      {error && <p className="member-feedback member-feedback-error" role="alert">{error}</p>}{notice && <p className="member-feedback" role="status"><Check size={17} />{notice}</p>}
      <div className="member-content">
        {tab === "overview" && <>
          <div className="member-stats"><article><Dumbbell size={21} /><span>{t.thisWeek}</span><strong>{week.length}<small>{t.sessions}</small></strong></article><article><Clock3 size={21} /><span>{t.minutes}</span><strong>{week.reduce((sum, w) => sum + Number(w.duration), 0)}<small>{t.min}</small></strong></article><article><Scale size={21} /><span>{t.latestWeight}</span><strong>{weights.length ? weights[weights.length - 1].weight : "—"}<small>{weights.length ? t.kg : t.noWeight}</small></strong></article></div>
          <div className="member-section-heading"><h3>{t.activity}</h3>{workouts.length > 0 && <button type="button" className="member-text-button" onClick={() => setTab("workouts")}>{t.showAll}<ArrowUpRight size={15} /></button>}</div>
          {workouts.length ? <div className="member-list">{workouts.slice(0, 3).map((w) => <article key={w.id} className="member-log-row"><span className="member-row-icon"><Dumbbell size={19} /></span><div><strong>{w.name}</strong><span>{dateLabel(w.date)}</span></div><b>{w.duration} <small>{t.min}</small></b></article>)}</div> : <Empty icon={<Activity size={28} />} title={t.noActivity} text={t.noActivityText}><button className="member-button" type="button" onClick={() => setTab("workouts")}><Plus size={16} />{t.logWorkout}</button></Empty>}
          <div className="member-privacy"><div><h3>{t.account}</h3><p>{t.accountText}</p></div>{confirmClear ? <div className="member-delete-confirm"><p>{t.deleteConfirm}</p><button type="button" className="member-button member-danger" disabled={busy !== null} onClick={() => void remove("member")}>{busy ? t.deleteBusy : t.confirmDelete}</button><button type="button" className="member-text-button" disabled={busy !== null} onClick={() => setConfirmClear(false)}>{t.cancel}</button></div> : <button type="button" className="member-text-button member-danger-text" onClick={() => setConfirmClear(true)}><Trash2 size={15} />{t.deleteData}</button>}</div>
        </>}
        {tab === "workouts" && <>
          <h3 className="member-content-title">{t.addWorkout}</h3>
          <form className="member-form" onSubmit={(event) => void save(event, "workouts")}><div className="member-form-grid"><label className="member-field member-field-wide"><span>{t.workoutName}</span><input name="name" required maxLength={120} placeholder={t.workoutPlaceholder} /></label><label className="member-field"><span>{t.duration}</span><input name="duration" type="number" min="1" max="600" step="1" defaultValue="45" required /></label><label className="member-field"><span>{t.date}</span><input name="date" type="date" defaultValue={today()} max={today()} required /></label><label className="member-field member-field-wide"><span>{t.notes}</span><textarea name="notes" maxLength={1000} rows={2} placeholder={t.notesPlaceholder} /></label></div><Consent /><button className="member-button" disabled={busy !== null} type="submit">{busy === "workouts" ? <LoaderCircle size={16} className="member-spin" /> : <Plus size={16} />}{busy === "workouts" ? t.saving : t.saveWorkout}</button></form>
          <h3 className="member-content-title">{t.workouts}</h3>{workouts.length ? <div className="member-list">{workouts.map((w) => <article className="member-log-row" key={w.id}><span className="member-row-icon"><Dumbbell size={19} /></span><div><strong>{w.name}</strong><span>{dateLabel(w.date)}</span>{w.notes && <p>{w.notes}</p>}</div><b>{w.duration} <small>{t.min}</small></b><button type="button" className="member-icon-button member-delete-entry" disabled={busy !== null} aria-label={`${t.deleteEntry}: ${w.name}`} onClick={() => void remove("workouts", w.id)}><Trash2 size={17} /></button></article>)}</div> : <Empty icon={<Dumbbell size={26} />} title={t.emptyWorkouts} text={t.emptyWorkoutsText} />}
        </>}
        {tab === "progress" && <>
          <h3 className="member-content-title">{t.weightHeading}</h3><p className="member-description">{t.weightIntro}</p>
          <form className="member-form" onSubmit={(event) => void save(event, "measurements")}><div className="member-form-grid"><label className="member-field"><span>{t.weightLabel}</span><input name="weight" type="number" min="20" max="400" step="0.1" placeholder="75.0" required /></label><label className="member-field"><span>{t.date}</span><input name="date" type="date" defaultValue={today()} max={today()} required /></label></div><Consent /><button className="member-button" type="submit" disabled={busy !== null}>{busy === "measurements" ? <LoaderCircle size={16} className="member-spin" /> : <Plus size={16} />}{busy === "measurements" ? t.saving : t.saveWeight}</button></form>
          {weights.length ? <><WeightChart weights={weights} lang={lang} label={t.chartLabel} dateLabel={dateLabel} /><h3 className="member-content-title">{t.history}</h3><div className="member-list">{[...weights].reverse().map((w) => <article className="member-log-row" key={w.id}><span className="member-row-icon"><Scale size={19} /></span><div><strong>{w.weight} {t.kg}</strong><span>{dateLabel(w.date)}</span></div><button className="member-icon-button member-delete-entry" type="button" disabled={busy !== null} aria-label={`${t.deleteEntry}: ${dateLabel(w.date)}`} onClick={() => void remove("measurements", w.id)}><Trash2 size={17} /></button></article>)}</div></> : <Empty icon={<Scale size={28} />} title={t.emptyWeights} text={t.emptyWeightsText} />}
        </>}
        {tab === "requests" && <><h3 className="member-content-title">{t.requestHeading}</h3><p className="member-description">{t.requestIntro}</p>{data.requests.length ? <div className="member-requests">{data.requests.map((r) => <article className="member-request" key={r.id}><div className="member-request-top"><span className="member-row-icon"><CalendarDays size={20} /></span><span className={`member-status member-status-${r.status}`}>{t[r.status as keyof typeof t] || r.status}</span></div><h4>{t[r.kind as keyof typeof t] || r.kind}</h4>{r.interest && <p>{r.interest}</p>}{r.preferredDate && <span className="member-request-date">{t.preferred}: {dateLabel(r.preferredDate)}</span>}<small>{r.reference || `#${r.id}`}</small></article>)}</div> : <Empty icon={<CalendarDays size={28} />} title={t.emptyRequests} text={t.emptyRequestsText}><button className="member-button" type="button" onClick={onClose}>{t.explore}<ArrowUpRight size={16} /></button></Empty>}<p className="member-footnote">{t.noRequestsGuest}</p></>}
      </div>
    </>}
  </section>;
}

function WeightChart({ weights, lang, label, dateLabel }: { weights: Measurement[]; lang: Lang; label: string; dateLabel: (date: string | number) => string }) {
  const shown = weights.slice(-20);
  const values = shown.map((w) => Number(w.weight));
  const min = Math.min(...values) - 1;
  const max = Math.max(...values) + 1;
  const width = 600; const height = 160; const inset = 26;
  const points = shown.map((w, i) => ({ x: shown.length === 1 ? width / 2 : inset + i / (shown.length - 1) * (width - inset * 2), y: inset + (1 - (Number(w.weight) - min) / (max - min)) * (height - inset * 2), w }));
  return <figure className="member-chart"><figcaption>{label}</figcaption><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={shown.map((w) => `${dateLabel(w.date)}: ${w.weight} ${lang === "ar" ? "كغ" : "kg"}`).join(", ")}>{[0, 1, 2].map((i) => <line key={i} x1={inset} x2={width - inset} y1={inset + i * (height - inset * 2) / 2} y2={inset + i * (height - inset * 2) / 2} stroke="#e6e4e0" strokeDasharray="4 5" />)}{shown.length > 1 && <polyline points={points.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke="#e63131" strokeWidth="3" strokeLinejoin="round" />}{points.map((p, i) => <g key={p.w.id}><circle cx={p.x} cy={p.y} r="5" fill="#e63131" stroke="white" strokeWidth="2" />{(i === 0 || i === points.length - 1) && <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="12" fill="#333">{p.w.weight}</text>}</g>)}</svg><div><span>{dateLabel(shown[0].date)}</span><span>{shown.length > 1 ? dateLabel(shown[shown.length - 1].date) : ""}</span></div></figure>;
}

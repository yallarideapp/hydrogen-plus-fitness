"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Clock3, Download, Dumbbell, LoaderCircle, Pause, Play, Plus, Printer, RotateCcw, Search, Timer, Trash2 } from "lucide-react";
import { legalConsent, legalError } from "@/lib/legal";
import { useGymLanguage, useWords } from "./SiteShell";
import "./workout-studio.css";

type Group = "all" | "upper" | "lower" | "core" | "full" | "cardio";
type Exercise = { id: string; en: string; ar: string; group: Exclude<Group, "all">; equipment: "bodyweight" | "dumbbell" | "barbell" | "machine" | "kettlebell" | "cardio"; unit?: "minutes" | "seconds" };
type PlannedExercise = { key: string; exerciseId: string; sets: number; reps: number; rest: number };

const exercises: Exercise[] = [
  { id: "squat", en: "Bodyweight squat", ar: "القرفصاء بوزن الجسم", group: "lower", equipment: "bodyweight" },
  { id: "goblet", en: "Goblet squat", ar: "قرفصاء الغوبلت", group: "lower", equipment: "dumbbell" },
  { id: "legpress", en: "Leg press", ar: "دفع الأرجل", group: "lower", equipment: "machine" },
  { id: "rdl", en: "Romanian deadlift", ar: "الرفعة الرومانية", group: "lower", equipment: "barbell" },
  { id: "lunge", en: "Reverse lunge", ar: "الاندفاع الخلفي", group: "lower", equipment: "bodyweight" },
  { id: "glutebridge", en: "Glute bridge", ar: "جسر الورك", group: "lower", equipment: "bodyweight" },
  { id: "calfraise", en: "Standing calf raise", ar: "رفع الساق واقفاً", group: "lower", equipment: "bodyweight" },
  { id: "pushup", en: "Push-up", ar: "تمرين الضغط", group: "upper", equipment: "bodyweight" },
  { id: "chestpress", en: "Dumbbell chest press", ar: "ضغط الصدر بالدمبل", group: "upper", equipment: "dumbbell" },
  { id: "latpull", en: "Lat pulldown", ar: "السحب العلوي", group: "upper", equipment: "machine" },
  { id: "row", en: "Seated cable row", ar: "التجديف بالكابل جلوساً", group: "upper", equipment: "machine" },
  { id: "shoulderpress", en: "Dumbbell shoulder press", ar: "ضغط الكتف بالدمبل", group: "upper", equipment: "dumbbell" },
  { id: "lateralraise", en: "Lateral raise", ar: "الرفع الجانبي", group: "upper", equipment: "dumbbell" },
  { id: "curl", en: "Biceps curl", ar: "ثني العضلة ذات الرأسين", group: "upper", equipment: "dumbbell" },
  { id: "triceps", en: "Triceps pushdown", ar: "دفع العضلة ثلاثية الرؤوس", group: "upper", equipment: "machine" },
  { id: "plank", en: "Forearm plank", ar: "البلانك على الساعدين", group: "core", equipment: "bodyweight", unit: "seconds" },
  { id: "deadbug", en: "Dead bug", ar: "تمرين الحشرة الميتة", group: "core", equipment: "bodyweight" },
  { id: "birddog", en: "Bird dog", ar: "تمرين الطائر والكلب", group: "core", equipment: "bodyweight" },
  { id: "carry", en: "Farmer's carry", ar: "حمل الأوزان مع المشي", group: "full", equipment: "kettlebell", unit: "seconds" },
  { id: "treadmill", en: "Treadmill walk", ar: "المشي على جهاز السير", group: "cardio", equipment: "cardio", unit: "minutes" },
  { id: "bike", en: "Stationary cycling", ar: "الدراجة الثابتة", group: "cardio", equipment: "cardio", unit: "minutes" },
  { id: "rowing", en: "Rowing machine", ar: "جهاز التجديف", group: "cardio", equipment: "cardio", unit: "minutes" },
];

const copy = {
  en: {
    eyebrow: "THE WORKOUT STUDIO", title: "MAKE IT\nYOUR SESSION.", intro: "Build a session that fits your day. Set your pace, keep your time, and save the work you put in.", tag: "PLAN. MOVE. REPEAT.", library: "Exercise library", libraryText: "22 movements. Your choices.", search: "Find an exercise…", all: "All", upper: "Upper body", lower: "Lower body", core: "Core", full: "Full body", cardio: "Cardio", bodyweight: "Bodyweight", dumbbell: "Dumbbells", barbell: "Barbell", machine: "Machine / cable", kettlebell: "Kettlebells", add: "Add", noResults: "No exercises match. Try another search.", session: "Your session", sessionText: "Arrange the movements. Make the numbers your own.", empty: "A blank page. A fresh session.", emptyText: "Choose a movement from the library to start planning.", exercises: "Exercises", sets: "Sets", reps: "Reps", rest: "Rest · sec", seconds: "seconds", minutes: "minutes", restButton: "Start rest", remove: "Remove exercise", moveUp: "Move up", moveDown: "Move down", timer: "SESSION CLOCK", start: "Start", pause: "Pause", resume: "Resume", reset: "Reset", restTimer: "REST TIMER", startRest: "Start rest", stop: "Stop", restDone: "Rest timer finished.", restHelp: "Choose a break or use the rest button on any movement.", saveTitle: "DONE FOR TODAY?", saveHeading: "Put it in your journal.", saveIntro: "Save a completed session to your private workout history. Planning a session does not book gym space or a coach.", name: "Session name", placeholder: "e.g. Monday strength", duration: "Completed minutes", log: "Log completed session", saving: "Saving…", saved: "Session saved to your workout journal.", failed: "We couldn't save your session. Please try again.", noPlan: "Add at least one exercise before saving.", signIn: "Sign in to save", signInfo: "Sign in in the new tab, then return here to save your session. Keep this tab open to retain your draft.", privacy: "Privacy Policy", terms: "Terms", print: "Print session", download: "Download plan", exportJson: "Export JSON", printTitle: "My workout plan", draftNote: "Your draft stays on this page. Download it to keep a copy before leaving.", planningNote: "The starting numbers are editable planning suggestions. Choose movements, loads and rest with your coach to suit your ability.", maxExercises: "Your plan can hold up to 20 exercises.", moveCount: "movements", maxTime: "Enter a completed duration between 1 and 600 minutes.", controls: "Session controls", exportEmpty: "Add an exercise to export your session.", logDate: "Logged for today in Jordan", signInNewTab: "Sign in (opens a new tab)",
  },
  ar: {
    eyebrow: "استوديو التمرين", title: "صمّم حصتك\nعلى طريقتك.", intro: "خطّط لحصة تناسب يومك. اختر إيقاعك، وتابع وقتك، واحفظ ما أنجزته.", tag: "خطّط. تحرّك. كرّر.", library: "مكتبة التمارين", libraryText: "٢٢ حركة. والاختيار لك.", search: "ابحث عن تمرين…", all: "الكل", upper: "الجزء العلوي", lower: "الجزء السفلي", core: "الجذع", full: "الجسم كاملاً", cardio: "الكارديو", bodyweight: "وزن الجسم", dumbbell: "الدمبل", barbell: "البار", machine: "جهاز / كابل", kettlebell: "الكيتلبيل", add: "إضافة", noResults: "لا توجد تمارين مطابقة. جرّب بحثاً آخر.", session: "حصتك التدريبية", sessionText: "رتّب الحركات وعدّل الأرقام بما يناسبك.", empty: "صفحة جديدة. وحصة جديدة.", emptyText: "اختر حركة من المكتبة لتبدأ التخطيط.", exercises: "التمارين", sets: "المجموعات", reps: "التكرارات", rest: "الراحة · ث", seconds: "ثوانٍ", minutes: "دقائق", restButton: "بدء الراحة", remove: "حذف التمرين", moveUp: "نقل للأعلى", moveDown: "نقل للأسفل", timer: "وقت الحصة", start: "بدء", pause: "إيقاف مؤقت", resume: "متابعة", reset: "إعادة الضبط", restTimer: "مؤقّت الراحة", startRest: "بدء الراحة", stop: "إيقاف", restDone: "انتهى وقت الراحة.", restHelp: "اختر مدة الراحة أو استخدم زر الراحة بجانب أي تمرين.", saveTitle: "أنهيت حصة اليوم؟", saveHeading: "أضفها إلى سجلك.", saveIntro: "احفظ الحصة المكتملة في سجل تمارينك الخاص. لا يحجز تخطيط الحصة مساحة في النادي أو موعداً مع مدرب.", name: "اسم الحصة", placeholder: "مثال: تمارين القوة يوم الإثنين", duration: "الدقائق المكتملة", log: "تسجيل الحصة المكتملة", saving: "جارٍ الحفظ…", saved: "حُفظت الحصة في سجل تمارينك.", failed: "تعذّر حفظ الحصة. يرجى المحاولة مرة أخرى.", noPlan: "أضف تمريناً واحداً على الأقل قبل الحفظ.", signIn: "سجّل الدخول للحفظ", signInfo: "سجّل الدخول في علامة التبويب الجديدة ثم عد إلى هنا لحفظ حصتك. أبقِ هذه الصفحة مفتوحة للاحتفاظ بالمسودة.", privacy: "سياسة الخصوصية", terms: "الشروط", print: "طباعة الحصة", download: "تنزيل الخطة", exportJson: "تصدير JSON", printTitle: "خطة تمريني", draftNote: "تبقى المسودة في هذه الصفحة فقط. نزّل نسخة منها للاحتفاظ بها قبل المغادرة.", planningNote: "الأرقام الأولية مقترحات قابلة للتعديل للتخطيط. اختر الحركات والأوزان والراحة مع مدربك بما يناسب قدرتك.", maxExercises: "تتسع الخطة لعشرين تمريناً كحد أقصى.", moveCount: "حركات", maxTime: "أدخل مدة مكتملة بين دقيقة واحدة و٦٠٠ دقيقة.", controls: "أدوات الحصة", exportEmpty: "أضف تمريناً لتصدير حصتك.", logDate: "يُحفظ بتاريخ اليوم في الأردن", signInNewTab: "تسجيل الدخول (يفتح علامة تبويب جديدة)",
  },
};

function ammanDate() {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Amman", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function formatClock(total: number) {
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return [hours > 0 ? String(hours).padStart(2, "0") : null, String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")].filter(Boolean).join(":");
}

export default function WorkoutStudio({ embedded = false }: { embedded?: boolean } = {}) {
  const { lang, t: tr } = useGymLanguage();
  const t = useWords(copy);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [plan, setPlan] = useState<PlannedExercise[]>([]);
  const [name, setName] = useState("");
  const [completedMinutes, setCompletedMinutes] = useState("");
  const [consent, setConsent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logged, setLogged] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [elapsedBase, setElapsedBase] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [restSeconds, setRestSeconds] = useState(60);
  const [restEndsAt, setRestEndsAt] = useState<number | null>(null);
  const [restMessage, setRestMessage] = useState("");
  const running = startedAt !== null;
  const elapsed = elapsedBase + (startedAt !== null ? Math.max(0, Math.floor((now - startedAt) / 1000)) : 0);
  const remainingRest = restEndsAt !== null ? Math.max(0, Math.ceil((restEndsAt - now) / 1000)) : 0;
  const totalSets = plan.reduce((sum, item) => sum + item.sets, 0);
  const filtered = useMemo(() => exercises.filter((exercise) => (group === "all" || exercise.group === group) && `${exercise.en} ${exercise.ar} ${t[exercise.equipment]}`.toLowerCase().includes(search.trim().toLowerCase())), [group, search, t]);

  useEffect(() => { setLogged(false); }, [plan, name, completedMinutes]);

  useEffect(() => {
    if (!running && restEndsAt === null) return;
    const interval = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(interval);
  }, [running, restEndsAt]);

  useEffect(() => {
    if (restEndsAt !== null && now >= restEndsAt) {
      setRestEndsAt(null);
      setRestMessage(t.restDone);
    }
  }, [now, restEndsAt, t.restDone]);

  function addExercise(exercise: Exercise) {
    if (plan.length >= 20) return;
    setPlan((current) => [...current, { key: crypto.randomUUID(), exerciseId: exercise.id, sets: exercise.group === "cardio" ? 1 : 3, reps: exercise.unit === "seconds" ? 30 : exercise.unit === "minutes" ? 10 : 8, rest: 60 }]);
    setFeedback("");
  }

  function updateExercise(key: string, field: "sets" | "reps" | "rest", value: string) {
    const max = field === "sets" ? 12 : field === "rest" ? 600 : 120;
    const min = field === "rest" ? 0 : 1;
    const number = Number(value);
    if (!Number.isFinite(number)) return;
    setPlan((current) => current.map((item) => item.key === key ? { ...item, [field]: Math.max(min, Math.min(max, Math.round(number))) } : item));
  }

  function moveExercise(index: number, direction: number) {
    setPlan((current) => {
      const next = [...current];
      const other = index + direction;
      if (other < 0 || other >= next.length) return current;
      [next[index], next[other]] = [next[other], next[index]];
      return next;
    });
  }

  function toggleClock() {
    if (running) {
      setElapsedBase(elapsed);
      setStartedAt(null);
    } else {
      const timestamp = Date.now();
      setNow(timestamp);
      setStartedAt(timestamp);
    }
  }

  function startRest(seconds: number) {
    if (seconds <= 0) return;
    const timestamp = Date.now();
    setNow(timestamp);
    setRestEndsAt(timestamp + seconds * 1000);
    setRestMessage("");
  }

  function exerciseLines() {
    return plan.map((item, index) => {
      const exercise = exercises.find((entry) => entry.id === item.exerciseId)!;
      const unit = exercise.unit ? t[exercise.unit] : t.reps;
      return `${index + 1}. ${tr(exercise.en, exercise.ar)} — ${item.sets} ${t.sets} × ${item.reps} ${unit}; ${t.rest}: ${item.rest}`;
    });
  }

  function download(format: "txt" | "json") {
    if (!plan.length) { setFeedback(t.exportEmpty); return; }
    const draft = { title: name || t.printTitle, date: ammanDate(), exercises: plan.map((item) => {
      const exercise = exercises.find((entry) => entry.id === item.exerciseId)!;
      return { name: tr(exercise.en, exercise.ar), equipment: t[exercise.equipment], sets: item.sets, quantity: item.reps, unit: exercise.unit ?? "reps", restSeconds: item.rest };
    }) };
    const content = format === "json" ? JSON.stringify(draft, null, 2) : [draft.title, draft.date, "", ...exerciseLines(), "", t.planningNote].join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: format === "json" ? "application/json;charset=utf-8" : "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = `hydrogen-workout-${draft.date}.${format}`; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function logWorkout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setFeedback("");
    if (!plan.length) { setFeedback(t.noPlan); return; }
    if (!consent) { setFeedback(legalError(lang)); return; }
    const duration = Number(completedMinutes || Math.max(1, Math.ceil(elapsed / 60)));
    if (!Number.isInteger(duration) || duration < 1 || duration > 600) { setFeedback(t.maxTime); return; }
    setSaving(true); setNeedsSignIn(false);
    try {
      const response = await fetch("/api/workouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), duration, date: ammanDate(), notes: exerciseLines().join("\n").slice(0, 1000), consent: true }) });
      if (response.status === 401) { setNeedsSignIn(true); setFeedback(t.signInfo); return; }
      if (!response.ok) { setFeedback(t.failed); return; }
      setFeedback(t.saved); setConsent(false); setLogged(true);
    } catch { setFeedback(t.failed); } finally { setSaving(false); }
  }

  return <div className="hp3-studio" dir={lang === "ar" ? "rtl" : "ltr"}>
    {!embedded && <header className="hp3-studio-hero"><div><span className="hp3-studio-eyebrow"><Dumbbell size={15} />{t.eyebrow}</span><h1>{t.title.split("\n").map((line, index) => <span key={line}>{line}{index === 0 && <br />}</span>)}</h1><p>{t.intro}</p></div><div className="hp3-studio-emblem" aria-hidden="true"><span>H<sup>+</sup></span><small>{t.tag}</small></div></header>}

    <div className="hp3-studio-summary"><div><span>{t.exercises}</span><strong>{String(plan.length).padStart(2, "0")}</strong></div><div><span>{t.sets}</span><strong>{String(totalSets).padStart(2, "0")}</strong></div><div><span>{t.timer}</span><strong dir="ltr">{formatClock(elapsed)}</strong></div><p>{t.planningNote}</p></div>

    <div className="hp3-studio-grid">
      <section className="hp3-studio-library" aria-labelledby="studio-library"><div className="hp3-studio-panel-title"><span>01</span><div><h2 id="studio-library">{t.library}</h2><p>{t.libraryText}</p></div></div>
        <label className="hp3-studio-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} aria-label={t.search} /></label>
        <div className="hp3-studio-filters" aria-label={t.library}>{(["all", "upper", "lower", "core", "full", "cardio"] as Group[]).map((value) => <button key={value} type="button" aria-pressed={group === value} onClick={() => setGroup(value)}>{t[value]}</button>)}</div>
        <div className="hp3-studio-exercise-list">{filtered.length ? filtered.map((exercise) => <article key={exercise.id}><div><h3>{tr(exercise.en, exercise.ar)}</h3><span>{t[exercise.equipment]}</span></div><button type="button" onClick={() => addExercise(exercise)} disabled={plan.length >= 20} aria-label={`${t.add} ${tr(exercise.en, exercise.ar)}`}><Plus size={18} /></button></article>) : <p className="hp3-studio-empty-search">{t.noResults}</p>}</div>
        {plan.length >= 20 && <p className="hp3-studio-limit" role="status">{t.maxExercises}</p>}
      </section>

      <div className="hp3-studio-workspace"><section className="hp3-studio-session" aria-labelledby="studio-session"><div className="hp3-studio-panel-title"><span>02</span><div><h2 id="studio-session">{t.session}</h2><p>{t.sessionText}</p></div><Dumbbell className="hp3-studio-title-icon" size={24} /></div>
        {!plan.length ? <div className="hp3-studio-blank"><div><Plus size={30} /></div><h3>{t.empty}</h3><p>{t.emptyText}</p></div> : <ol className="hp3-studio-plan">{plan.map((item, index) => {
          const exercise = exercises.find((entry) => entry.id === item.exerciseId)!;
          return <li key={item.key}><div className="hp3-studio-movement-head"><b>{String(index + 1).padStart(2, "0")}</b><div><h3>{tr(exercise.en, exercise.ar)}</h3><span>{t[exercise.equipment]}</span></div><div className="hp3-studio-row-controls"><button type="button" onClick={() => moveExercise(index, -1)} disabled={index === 0} aria-label={`${t.moveUp}: ${tr(exercise.en, exercise.ar)}`}><ArrowUp size={15} /></button><button type="button" onClick={() => moveExercise(index, 1)} disabled={index === plan.length - 1} aria-label={`${t.moveDown}: ${tr(exercise.en, exercise.ar)}`}><ArrowDown size={15} /></button><button type="button" onClick={() => setPlan((current) => current.filter((entry) => entry.key !== item.key))} aria-label={`${t.remove}: ${tr(exercise.en, exercise.ar)}`}><Trash2 size={15} /></button></div></div>
            <div className="hp3-studio-movement-inputs"><label>{t.sets}<input type="number" min={1} max={12} value={item.sets} onChange={(event) => updateExercise(item.key, "sets", event.target.value)} aria-label={`${tr(exercise.en, exercise.ar)} ${t.sets}`} /></label><label>{exercise.unit ? t[exercise.unit] : t.reps}<input type="number" min={1} max={120} value={item.reps} onChange={(event) => updateExercise(item.key, "reps", event.target.value)} aria-label={`${tr(exercise.en, exercise.ar)} ${exercise.unit ? t[exercise.unit] : t.reps}`} /></label><label>{t.rest}<input type="number" min={0} max={600} step={5} value={item.rest} onChange={(event) => updateExercise(item.key, "rest", event.target.value)} aria-label={`${tr(exercise.en, exercise.ar)} ${t.rest}`} /></label><button type="button" className="hp3-studio-rest-row" onClick={() => startRest(item.rest)} disabled={item.rest === 0}><Timer size={15} />{t.restButton}</button></div>
          </li>;
        })}</ol>}
        <div className="hp3-studio-exports"><button type="button" onClick={() => window.print()} disabled={!plan.length}><Printer size={15} />{t.print}</button><button type="button" onClick={() => download("txt")} disabled={!plan.length}><Download size={15} />{t.download}</button><button type="button" onClick={() => download("json")} disabled={!plan.length}>{t.exportJson}<ArrowUpRight size={14} /></button></div>
        <p className="hp3-studio-draft-note">{t.draftNote}</p>
      </section>

      <section className="hp3-studio-timers" aria-label={t.controls}><div className="hp3-studio-clock"><span><Clock3 size={15} />{t.timer}</span><strong dir="ltr" aria-label={t.timer}>{formatClock(elapsed)}</strong><div><button type="button" onClick={toggleClock}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? t.pause : elapsed > 0 ? t.resume : t.start}</button><button type="button" className="hp3-studio-icon-btn" onClick={() => { setStartedAt(null); setElapsedBase(0); }} aria-label={`${t.reset}: ${t.timer}`}><RotateCcw size={16} /></button></div></div>
        <div className="hp3-studio-rest-clock"><span><Timer size={15} />{t.restTimer}</span><strong dir="ltr">{formatClock(remainingRest)}</strong><div className="hp3-studio-rest-choices">{[60, 90, 120].map((value) => <button type="button" key={value} aria-pressed={restSeconds === value} onClick={() => setRestSeconds(value)} dir="ltr">{value}s</button>)}<input type="number" aria-label={`${t.restTimer}: ${t.seconds}`} min={1} max={600} value={restSeconds} onChange={(event) => setRestSeconds(Math.max(1, Math.min(600, Number(event.target.value) || 1)))} /></div><button type="button" className="hp3-studio-rest-start" onClick={() => restEndsAt !== null ? setRestEndsAt(null) : startRest(restSeconds)}>{restEndsAt !== null ? t.stop : t.startRest}</button><p>{t.restHelp}</p><span className="hp3-studio-rest-message" role="status">{restMessage}</span></div>
      </section>

      <section className="hp3-studio-save" aria-labelledby="studio-save"><div><span>{t.saveTitle}</span><h2 id="studio-save">{t.saveHeading}</h2><p>{t.saveIntro}</p></div><form onSubmit={logWorkout}><div className="hp3-studio-save-fields"><label>{t.name}<input required minLength={2} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} placeholder={t.placeholder} /></label><label>{t.duration}<input required type="number" min={1} max={600} step={1} value={completedMinutes || Math.max(1, Math.ceil(elapsed / 60))} onChange={(event) => setCompletedMinutes(event.target.value)} /></label></div><small>{t.logDate}</small><label className="hp3-studio-consent"><input type="checkbox" required checked={consent} onChange={(event) => setConsent(event.target.checked)} /><span>{legalConsent(lang)} <a href={lang === "ar" ? "/ar/privacy" : "/privacy"} target="_blank" rel="noopener noreferrer">{t.privacy}</a> · <a href={lang === "ar" ? "/ar/terms" : "/terms"} target="_blank" rel="noopener noreferrer">{t.terms}</a></span></label><button type="submit" className="hp3-studio-log" disabled={saving || !plan.length || logged}>{saving ? <LoaderCircle size={17} className="hp3-studio-spinner" /> : <Check size={17} />}{saving ? t.saving : logged ? t.saved : t.log}<ArrowUpRight size={17} /></button><p className="hp3-studio-feedback" role="status">{feedback}</p>{needsSignIn && <a className="hp3-studio-signin" href="/signin-with-chatgpt?return_to=/tools" target="_blank" rel="noopener noreferrer" aria-label={t.signInNewTab}>{t.signIn}<ArrowUpRight size={16} /></a>}</form></section>
      </div>
    </div>
  </div>;
}

"use client";

// My training → Workouts → Build your next workout. Kept simple for use on the gym floor:
//   - Type any exercise name (or tap a suggestion) and add it.
//   - Each exercise has sets × reps (− / +), and a row of set buttons: tap one when you finish that set and the rest
//     timer starts by itself.
//   - A bar stays at the bottom of the screen while you are in the builder: the session clock, and the rest countdown
//     in large numbers when resting (+15 s, skip). A beep and a vibration when rest is over.
//   - "Add to my workout log" fills the Log a workout form with this session (see lib/member-events.ts).
// The draft is kept in this browser (localStorage), so a reload or a locked phone does not lose it.

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Check, Clock3, Minus, Pause, Play, Plus, Timer, Trash2, X } from "lucide-react";
import { prefillLog } from "@/lib/member-events";
import { useGymLanguage } from "./SiteShell";

type Unit = "seconds" | "minutes";
type LibraryItem = { id: string; en: string; ar: string; unit?: Unit };
type Item = { key: string; id?: string; name: string; sets: number; reps: number; unit?: Unit; done: number };
type Draft = { items: Item[]; rest: number; base: number; startedAt: number | null };

const LIBRARY: LibraryItem[] = [
  { id: "chestpress", en: "Dumbbell chest press", ar: "ضغط الصدر بالدمبل" },
  { id: "bench", en: "Bench press", ar: "ضغط البنش" },
  { id: "latpull", en: "Lat pulldown", ar: "السحب العلوي" },
  { id: "row", en: "Seated cable row", ar: "التجديف بالكابل جلوساً" },
  { id: "legpress", en: "Leg press", ar: "دفع الأرجل" },
  { id: "squat", en: "Squat", ar: "القرفصاء" },
  { id: "goblet", en: "Goblet squat", ar: "قرفصاء الغوبلت" },
  { id: "rdl", en: "Romanian deadlift", ar: "الرفعة الرومانية" },
  { id: "lunge", en: "Lunge", ar: "الاندفاع" },
  { id: "shoulderpress", en: "Shoulder press", ar: "ضغط الكتف" },
  { id: "lateralraise", en: "Lateral raise", ar: "الرفع الجانبي" },
  { id: "curl", en: "Biceps curl", ar: "تمرين البايسبس" },
  { id: "triceps", en: "Triceps pushdown", ar: "دفع الترايسبس بالكابل" },
  { id: "pushup", en: "Push-up", ar: "تمرين الضغط" },
  { id: "pullup", en: "Pull-up", ar: "العقلة" },
  { id: "legcurl", en: "Leg curl", ar: "ثني الساق" },
  { id: "calfraise", en: "Calf raise", ar: "رفع السمانة" },
  { id: "glutebridge", en: "Glute bridge", ar: "جسر الورك" },
  { id: "plank", en: "Plank", ar: "البلانك", unit: "seconds" },
  { id: "crunch", en: "Crunch", ar: "تمرين البطن" },
  { id: "treadmill", en: "Treadmill", ar: "جهاز المشي", unit: "minutes" },
  { id: "bike", en: "Stationary bike", ar: "الدراجة الثابتة", unit: "minutes" },
];
const RESTS = [60, 90, 120];
const KEY = "hp-workout-draft";
const empty: Draft = { items: [], rest: 60, base: 0, startedAt: null };

const read = (): Draft => { try { const d = JSON.parse(localStorage.getItem(KEY) ?? "null"); return d && Array.isArray(d.items) ? { ...empty, ...d } : empty; } catch { return empty; } };
const write = (d: Draft) => { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* private mode: the draft just isn't kept */ } };
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now() + Math.random()));

// A short double beep, and a buzz where the phone supports it. The audio context is opened on a tap (browsers only
// allow sound after one), then reused.
let audio: AudioContext | null = null;
function unlockSound() {
  try { const A = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext; if (!audio && A) audio = new A(); if (audio?.state === "suspended") void audio.resume(); } catch { /* no sound */ }
}
function beep() {
  try {
    navigator.vibrate?.([180, 90, 180]);
    if (!audio) return;
    [0, 0.25].forEach((at) => { const o = audio!.createOscillator(); const g = audio!.createGain(); o.frequency.value = 880; g.gain.setValueAtTime(0.0001, audio!.currentTime + at); g.gain.exponentialRampToValueAtTime(0.3, audio!.currentTime + at + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, audio!.currentTime + at + 0.18); o.connect(g).connect(audio!.destination); o.start(audio!.currentTime + at); o.stop(audio!.currentTime + at + 0.2); });
  } catch { /* silent */ }
}

export default function WorkoutStudio(_props: { embedded?: boolean } = {}) {
  const { lang, t } = useGymLanguage();
  const ar = lang === "ar";
  const n = (v: number) => (ar ? v.toLocaleString("ar-u-nu-latn") : String(v));
  const nameOf = (i: Item) => { const l = i.id && LIBRARY.find((x) => x.id === i.id); return l ? (ar ? l.ar : l.en) : i.name; };
  const unitShort = (u?: Unit) => (u === "seconds" ? t("s", "ث") : u === "minutes" ? t("min", "د") : "");

  const [draft, setDraft] = useState<Draft>(empty);
  const [ready, setReady] = useState(false);
  const [text, setText] = useState("");
  const [now, setNow] = useState(0);
  const [restEnds, setRestEnds] = useState<number | null>(null);
  const [restTotal, setRestTotal] = useState(0);
  const [restOver, setRestOver] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [sureClear, setSureClear] = useState(false);
  const [dock, setDock] = useState(0);
  const lock = useRef<{ release: () => Promise<void> } | null>(null);

  useEffect(() => { setDraft(read()); setReady(true); setNow(Date.now()); }, []);
  useEffect(() => { if (ready) write(draft); }, [draft, ready]);
  const update = (fn: (d: Draft) => Draft) => setDraft((d) => fn(d));

  const running = draft.startedAt !== null;
  const elapsed = draft.base + (running && now ? Math.max(0, Math.floor((now - draft.startedAt!) / 1000)) : 0);
  const left = restEnds !== null ? Math.max(0, Math.ceil((restEnds - now) / 1000)) : 0;
  const resting = restEnds !== null;

  // Tick while the clock runs or a rest counts down; end the rest with a beep.
  useEffect(() => {
    if (!running && !resting) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [running, resting]);
  useEffect(() => {
    if (restEnds !== null && now >= restEnds) { setRestEnds(null); setRestOver(true); beep(); }
  }, [now, restEnds]);
  useEffect(() => { if (!restOver) return; const id = window.setTimeout(() => setRestOver(false), 5000); return () => window.clearTimeout(id); }, [restOver]);

  // Keep the screen on while the session clock runs (where the browser allows it).
  useEffect(() => {
    let cancelled = false;
    const nav = navigator as Navigator & { wakeLock?: { request: (k: "screen") => Promise<{ release: () => Promise<void> }> } };
    const want = () => { if (!running || !nav.wakeLock || document.visibilityState !== "visible") return; nav.wakeLock.request("screen").then((l) => { if (cancelled) void l.release(); else lock.current = l; }).catch(() => {}); };
    want();
    document.addEventListener("visibilitychange", want);
    return () => { cancelled = true; document.removeEventListener("visibilitychange", want); void lock.current?.release().catch(() => {}); lock.current = null; };
  }, [running]);

  // The bar sits just above the phone's bottom menu when that menu is showing.
  useEffect(() => {
    const measure = () => { const d = document.querySelector<HTMLElement>(".hp3-mobile-dock"); setDock(d && getComputedStyle(d).display !== "none" ? d.offsetHeight : 0); };
    measure(); window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const q = text.trim().toLowerCase();
  const suggestions = useMemo(() => (q ? LIBRARY.filter((l) => `${l.en} ${l.ar}`.toLowerCase().includes(q)) : LIBRARY).slice(0, 8 + (q ? 0 : LIBRARY.length)), [q]);

  function add(item: { id?: string; name: string; unit?: Unit }) {
    if (draft.items.length >= 20) { setFeedback(t("A workout can hold up to 20 exercises.", "يتسع التمرين لعشرين تمريناً كحد أقصى.")); return; }
    const reps = item.unit === "seconds" ? 30 : item.unit === "minutes" ? 10 : 10;
    update((d) => ({ ...d, items: [...d.items, { key: uid(), id: item.id, name: item.name, sets: item.unit === "minutes" ? 1 : 3, reps, unit: item.unit, done: 0 }] }));
    setText(""); setFeedback("");
  }
  function submit(e: FormEvent) {
    e.preventDefault();
    const name = text.trim().replace(/\s+/g, " ").slice(0, 60);
    if (name.length < 2) { setFeedback(t("Type the exercise name first.", "اكتب اسم التمرين أولاً.")); return; }
    const same = LIBRARY.find((l) => l.en.toLowerCase() === name.toLowerCase() || l.ar === name);
    add(same ? { id: same.id, name: same.en, unit: same.unit } : { name });
  }
  const set = (key: string, patch: Partial<Item>) => update((d) => ({ ...d, items: d.items.map((i) => (i.key === key ? { ...i, ...patch, done: Math.min(patch.sets ?? i.sets, patch.done ?? i.done) } : i)) }));
  // − / + work from the current value (two quick taps give two steps)
  const bump = (key: string, field: "sets" | "reps", by: number, min: number, max: number) => update((d) => ({ ...d, items: d.items.map((i) => { if (i.key !== key) return i; const v = Math.max(min, Math.min(max, i[field] + by)); return { ...i, [field]: v, done: Math.min(field === "sets" ? v : i.sets, i.done) }; }) }));
  const remove = (key: string) => update((d) => ({ ...d, items: d.items.filter((i) => i.key !== key) }));

  function startClock() { const at = Date.now(); setNow(at); update((d) => (d.startedAt === null ? { ...d, startedAt: at } : d)); }
  function toggleClock() {
    unlockSound();
    if (running) update((d) => ({ ...d, base: elapsed, startedAt: null }));
    else startClock();
  }
  function startRest(seconds = draft.rest) {
    unlockSound();
    const at = Date.now(); setNow(at); setRestEnds(at + seconds * 1000); setRestTotal(seconds); setRestOver(false);
  }
  function tapSet(item: Item, k: number) {
    unlockSound();
    if (k < item.done) { set(item.key, { done: k }); return; } // tap a finished set to undo it
    set(item.key, { done: k + 1 });
    if (!running) startClock();
    const remaining = draft.items.reduce((sum, i) => sum + (i.key === item.key ? item.sets - (k + 1) : i.sets - i.done), 0);
    if (remaining > 0) startRest();
  }
  function toLog() {
    setFeedback("");
    if (!draft.items.length) return;
    const names = draft.items.map(nameOf);
    const more = names.length > 2 ? ` +${n(names.length - 2)}` : "";
    const lines = draft.items.map((i, k) => `${k + 1}. ${nameOf(i)} — ${i.sets} × ${i.reps}${unitShort(i.unit)}${i.done ? ` (${i.done}/${i.sets} ✓)` : ""}`);
    const taken = prefillLog({ name: `${names.slice(0, 2).join(" · ")}${more}`.slice(0, 100), duration: elapsed >= 60 ? Math.min(600, Math.ceil(elapsed / 60)) : null, notes: lines.join("\n").slice(0, 1000) });
    if (!taken) setFeedback(t("Sign in to keep a workout log, then add this session to it.", "سجّل الدخول لتحتفظ بسجل تمارينك، ثم أضف هذه الحصة إليه."));
  }
  function clearAll() {
    if (!sureClear) { setSureClear(true); window.setTimeout(() => setSureClear(false), 3500); return; }
    setDraft(empty); setRestEnds(null); setRestOver(false); setSureClear(false); setFeedback("");
  }

  const totalSets = draft.items.reduce((s, i) => s + i.sets, 0);
  const doneSets = draft.items.reduce((s, i) => s + i.done, 0);

  return <div className="wb" style={{ ["--wb-dock" as string]: `${dock}px` }}>
    <form className="wb-add" onSubmit={submit}>
      <label className="hp3-field" htmlFor="wb-name">{t("Add an exercise", "أضف تمريناً")}</label>
      <div className="wb-add-row">
        <input id="wb-name" className="hp3-input" value={text} onChange={(e) => { setText(e.target.value); setFeedback(""); }} maxLength={60} autoComplete="off" enterKeyHint="done" placeholder={t("Type any name, e.g. Bench press", "اكتب أي اسم، مثال: ضغط البنش")} />
        <button type="submit" className="hp3-button hp3-red"><Plus size={16} />{t("Add", "أضف")}</button>
      </div>
      {suggestions.length > 0 && <div className="wb-suggest" role="group" aria-label={t("Suggestions", "اقتراحات")}>{suggestions.map((l) => <button type="button" key={l.id} onClick={() => add({ id: l.id, name: l.en, unit: l.unit })}><Plus size={13} />{ar ? l.ar : l.en}</button>)}</div>}
    </form>

    {draft.items.length > 0 ? <>
      <p className="wb-hint"><Check size={15} />{t("Tap a set when you finish it. The rest timer starts by itself.", "اضغط على رقم المجموعة عند إنهائها، فيبدأ مؤقّت الراحة تلقائياً.")}</p>
      <ol className="wb-list">{draft.items.map((i, k) => {
        const max = i.unit === "seconds" ? 600 : i.unit === "minutes" ? 120 : 100;
        const step = i.unit === "seconds" ? 5 : 1;
        return <li key={i.key} className={`wb-item${i.done >= i.sets ? " is-done" : ""}`}>
          <div className="wb-item-head"><b className="wb-num">{n(k + 1)}</b><strong>{nameOf(i)}</strong><button type="button" className="ac-remove" aria-label={`${t("Remove", "حذف")}: ${nameOf(i)}`} onClick={() => remove(i.key)}><Trash2 size={16} /></button></div>
          <div className="wb-steps">
            <Stepper label={t("Sets", "المجموعات")} value={i.sets} min={1} max={12} onChange={(v) => set(i.key, { sets: v })} onStep={(d) => bump(i.key, "sets", d, 1, 12)} />
            <Stepper label={i.unit === "seconds" ? t("Seconds", "ثوانٍ") : i.unit === "minutes" ? t("Minutes", "دقائق") : t("Reps", "التكرارات")} value={i.reps} min={1} max={max} onChange={(v) => set(i.key, { reps: v })} onStep={(d) => bump(i.key, "reps", d * step, 1, max)} />
          </div>
          <div className="wb-sets" role="group" aria-label={`${t("Sets done", "المجموعات المنجزة")}: ${nameOf(i)}`}>
            {Array.from({ length: i.sets }, (_, s) => <button type="button" key={s} aria-pressed={s < i.done} aria-label={`${t("Set", "المجموعة")} ${n(s + 1)}`} onClick={() => tapSet(i, s)}>{s < i.done ? <Check size={17} strokeWidth={2.6} /> : n(s + 1)}</button>)}
          </div>
        </li>;
      })}</ol>

      <div className={`wb-bar${resting ? " is-resting" : ""}${restOver ? " is-over" : ""}`} role="region" aria-label={t("Session timer", "مؤقّت الحصة")}>
        <div className="wb-clock">
          <button type="button" className="wb-play" onClick={toggleClock} aria-label={running ? t("Pause the session clock", "إيقاف وقت الحصة مؤقتاً") : t("Start the session clock", "تشغيل وقت الحصة")}>{running ? <Pause size={18} /> : <Play size={18} />}</button>
          <span><small><Clock3 size={13} />{t("Session", "الحصة")}</small><b dir="ltr">{clock(elapsed)}</b></span>
          <span className="wb-progress"><small>{t("Sets", "المجموعات")}</small><b>{n(doneSets)}/{n(totalSets)}</b></span>
        </div>
        {resting ? <div className="wb-rest is-on" aria-live="polite">
          <i style={{ transform: `scaleX(${restTotal ? left / restTotal : 0})` }} aria-hidden="true" />
          <span className="wb-rest-label">{t("Rest", "راحة")}</span><b dir="ltr">{clock(left)}</b>
          <button type="button" onClick={() => setRestEnds((e) => (e ? e + 15000 : e))}>{ar ? "+15ث" : "+15s"}</button>
          <button type="button" onClick={() => setRestEnds(null)} aria-label={t("Skip the rest", "تخطَّ الراحة")}><X size={16} /></button>
        </div> : <div className="wb-rest">
          {restOver ? <span className="wb-rest-over" role="status"><Check size={15} />{t("Rest over. Next set!", "انتهت الراحة. المجموعة التالية!")}</span>
            : <><span className="wb-rest-label">{t("Rest", "الراحة")}</span>{RESTS.map((s) => <button type="button" key={s} aria-pressed={draft.rest === s} onClick={() => update((d) => ({ ...d, rest: s }))}>{ar ? `${n(s)}ث` : `${s}s`}</button>)}</>}
          <button type="button" className="wb-rest-go" onClick={() => startRest()}><Timer size={16} />{t("Rest now", "ابدأ الراحة")}</button>
        </div>}
      </div>

      <div className="wb-finish">
        <button type="button" className="hp3-button hp3-red" onClick={toLog}><Check size={16} />{t("Add to my workout log", "أضفها إلى سجل تماريني")}</button>
        <button type="button" className="ac-link is-danger" onClick={clearAll}>{sureClear ? t("Tap again to clear", "اضغط مرة أخرى للمسح") : t("Start over", "ابدأ من جديد")}</button>
      </div>
    </> : <p className="ac-empty">{t("Type the name of your first exercise, or tap a suggestion above.", "اكتب اسم أول تمرين، أو اضغط على أحد الاقتراحات أعلاه.")}</p>}
    {feedback && <p className="hp3-error" role="alert">{feedback}</p>}
    <p className="wb-note">{t("Your plan is kept on this phone until you clear it. Suggested numbers are a starting point; agree weights and rest with your coach.", "تبقى خطتك على هذا الجهاز حتى تمسحها. الأرقام المقترحة نقطة بداية؛ اتفق على الأوزان والراحة مع مدربك.")}</p>
  </div>;
}

function Stepper({ label, value, min, max, onChange, onStep }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; onStep: (by: number) => void }) {
  const clamp = (v: number) => Math.max(min, Math.min(max, Math.round(v)));
  return <div className="wb-step">
    <span>{label}</span>
    <div>
      <button type="button" aria-label={`${label} −`} disabled={value <= min} onClick={() => onStep(-1)}><Minus size={16} /></button>
      <input type="number" inputMode="numeric" min={min} max={max} value={value} aria-label={label} onChange={(e) => { const v = Number(e.target.value); if (Number.isFinite(v) && e.target.value !== "") onChange(clamp(v)); }} />
      <button type="button" aria-label={`${label} +`} disabled={value >= max} onClick={() => onStep(1)}><Plus size={16} /></button>
    </div>
  </div>;
}

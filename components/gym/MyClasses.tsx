'use client';

// My training → Workouts → My classes: the group classes the member saved for later or has attended.
// Classes come from the club timetable (useSchedule), the same list as the classes page, so a class recorded here and
// one saved from the classes page are the same entry (same key). "I attended it" takes a date today or before;
// "I'll go" takes today or after. A saved class can be marked attended once its day has come.

import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ArrowUpRight, Check, LoaderCircle, Plus, X } from 'lucide-react';
import { useSchedule } from '@/lib/admin/overrides';
import type { ScheduledClass } from '@/lib/schedule';
import { legalConsent, legalError } from '@/lib/legal';
import { memberChanged } from '@/lib/member-events';
import { arCount, fmtDate, fmtNum, type Lang } from './MemberArea';

export type Session = { id: string; classKey: string; className: string; coach: string; category?: string; scheduledDate: string; scheduledTime: string; status: string };
type Mode = 'done' | 'plan';

const WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const time24 = (c: Pick<ScheduledClass, 'time' | 'period'>) => { const [h, m] = c.time.split(':').map(Number); return `${String((h % 12) + (c.period === 'PM' ? 12 : 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
export const classKey = (c: ScheduledClass) => `${c.day}-${time24(c)}-${c.name}`; // same key as the classes page
const weekdayOf = (date: string) => WEEK[new Date(`${date}T12:00:00Z`).getUTCDay()];
const shift = (date: string, days: number) => { const d = new Date(`${date}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + days); return d.toISOString().slice(0, 10); };
// "18:30" → "6:30 م" / "6:30 PM"
export function clock(t24: string, lang: Lang) {
  const [h, m] = t24.split(':').map(Number);
  const text = `${h % 12 || 12}:${String(m).padStart(2, '0')}`;
  return lang === 'ar' ? `${text.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)])} ${h < 12 ? 'ص' : 'م'}` : `${text} ${h < 12 ? 'AM' : 'PM'}`;
}

const copy = {
  en: {
    add: 'Add a class', attended: 'I attended it', willGo: 'I’ll go', date: 'Date', classes: 'Classes that day', noClasses: 'No classes on this day in the timetable.', pick: 'Choose the class first.', save: 'Save the class', saving: 'Saving…', cancel: 'Cancel',
    savedDone: 'Class recorded. Well done!', savedPlan: 'Class saved to your plan.', saveError: 'We couldn’t save the class. Please try again.', updateError: 'We couldn’t update your classes. Try again.',
    upcoming: 'Coming up', done: 'Attended', unconfirmed: 'Did you go?', markDone: 'Mark attended', remove: 'Remove', empty: 'No classes yet. Record a class you attended, or find one on the timetable and save it.',
    showAll: 'Show all', showLess: 'Show fewer', find: 'Find classes', note: 'Saving a class does not reserve a place. The club confirms class places directly.', signIn: 'Sign in to keep your classes.', signInLink: 'Sign in', loadError: 'We couldn’t load your classes. Try again.', retry: 'Try again',
    privacy: 'Privacy', terms: 'Terms',
  },
  ar: {
    add: 'سجّل حصة', attended: 'حضرتها', willGo: 'سأحضرها', date: 'التاريخ', classes: 'حصص هذا اليوم', noClasses: 'لا توجد حصص في هذا اليوم حسب الجدول.', pick: 'اختر الحصة أولاً.', save: 'احفظ الحصة', saving: 'جارٍ الحفظ…', cancel: 'إلغاء',
    savedDone: 'سُجّلت الحصة. أحسنت!', savedPlan: 'حُفظت الحصة في خطتك.', saveError: 'تعذّر حفظ الحصة. يُرجى المحاولة مرة أخرى.', updateError: 'تعذّر تحديث حصصك. حاول مجدداً.',
    upcoming: 'قادمة', done: 'حضرتها', unconfirmed: 'هل حضرتها؟', markDone: 'سجّل الحضور', remove: 'حذف', empty: 'لا توجد حصص بعد. سجّل حصة حضرتها، أو اختر حصة من الجدول واحفظها.',
    showAll: 'عرض الكل', showLess: 'عرض أقل', find: 'اكتشف الحصص', note: 'حفظ الحصة لا يحجز مكاناً؛ يؤكد النادي أماكن الحصص مباشرة.', signIn: 'سجّل الدخول لحفظ حصصك.', signInLink: 'تسجيل الدخول', loadError: 'تعذّر تحميل حصصك. حاول مجدداً.', retry: 'إعادة المحاولة',
    privacy: 'الخصوصية', terms: 'الشروط',
  },
} as const;

// The line shown in the details summary: what is coming up and what was attended this month.
export function classesSummary(sessions: Session[], today: string, lang: Lang) {
  if (!today) return '';
  const up = sessions.filter((s) => s.status !== 'completed' && s.scheduledDate >= today).length;
  const month = sessions.filter((s) => s.status === 'completed' && s.scheduledDate.slice(0, 7) === today.slice(0, 7)).length;
  const parts: string[] = [];
  if (up) parts.push(lang === 'ar' ? arCount(up, 'حصة واحدة قادمة', 'حصتان قادمتان', 'حصص قادمة', 'حصة قادمة') : `${up} coming up`);
  if (month) parts.push(lang === 'ar' ? `حضرت ${arCount(month, 'حصة واحدة', 'حصتين', 'حصص', 'حصة')} هذا الشهر` : `${month} attended this month`);
  return parts.join(' · ') || (lang === 'ar' ? 'لا حصص بعد' : 'None yet');
}

export default function MyClasses({ lang, today, sessions, state, onRetry }: { lang: Lang; today: string; sessions: Session[]; state: 'loading' | 'ready' | 'guest' | 'error'; onRetry: () => void }) {
  const t = copy[lang];
  const { classes } = useSchedule();
  const byKey = useMemo(() => new Map(classes.map((c) => [classKey(c), c])), [classes]);
  const name = (s: Session) => { const c = byKey.get(s.classKey); return c ? (lang === 'ar' ? c.ar : c.name) : s.className; };

  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<Mode>('done');
  const [date, setDate] = useState('');
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [all, setAll] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // The nearest day with classes: on or before today when recording, on or after when planning.
  const nearest = (m: Mode) => { for (let i = 0; i < 7; i++) { const d = shift(today, m === 'done' ? -i : i); if (classes.some((c) => c.day === weekdayOf(d))) return d; } return today; };
  const dayClasses = useMemo(() => (date ? classes.filter((c) => c.day === weekdayOf(date)).sort((a, b) => time24(a).localeCompare(time24(b))) : []), [classes, date]);
  const open = () => { setAdding(true); setMode('done'); setDate(nearest('done')); setKey(''); setError(''); setNotice(''); };
  const switchMode = (m: Mode) => { setMode(m); setDate(nearest(m)); setKey(''); setError(''); };

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const c = dayClasses.find((x) => classKey(x) === key);
    if (!c) { setError(t.pick); return; }
    if (new FormData(event.currentTarget).get('consent') !== 'on') { setError(legalError(lang)); return; }
    setBusy('save'); setError(''); setNotice('');
    try {
      const r = await fetch('/api/planner', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ classKey: classKey(c), className: c.name, coach: c.coach, category: c.category, scheduledDate: date, scheduledTime: time24(c), status: mode === 'done' ? 'completed' : 'planned', consent: true }) });
      if (!r.ok) throw new Error('save');
      setNotice(mode === 'done' ? t.savedDone : t.savedPlan); setAdding(false); memberChanged();
      requestAnimationFrame(() => box.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }));
    } catch { setError(t.saveError); } finally { setBusy(''); }
  }
  async function act(s: Session, remove = false) {
    setBusy(s.id); setError(''); setNotice('');
    try {
      const r = await fetch(remove ? `/api/planner?id=${encodeURIComponent(s.id)}` : '/api/planner', remove ? { method: 'DELETE' } : { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, status: 'completed' }) });
      if (!r.ok) throw new Error('update');
      memberChanged();
    } catch { setError(t.updateError); } finally { setBusy(''); }
  }

  if (state === 'guest') return <div className="ac-classes"><p className="ac-empty">{t.signIn} <a href="/signin-with-chatgpt?return_to=%2Fmember%3Ftab%3Dplan" target="_top">{t.signInLink}</a></p></div>;
  if (state === 'error' && !sessions.length) return <div className="ac-classes"><p className="hp3-error" role="alert">{t.loadError}</p><button type="button" className="ac-link" onClick={onRetry}>{t.retry}</button></div>;

  // Coming up first (soonest first), then the rest (newest first).
  const ahead = sessions.filter((s) => s.status !== 'completed' && s.scheduledDate >= today).sort((a, b) => `${a.scheduledDate}${a.scheduledTime}`.localeCompare(`${b.scheduledDate}${b.scheduledTime}`));
  const past = sessions.filter((s) => !ahead.includes(s)).sort((a, b) => `${b.scheduledDate}${b.scheduledTime}`.localeCompare(`${a.scheduledDate}${a.scheduledTime}`));
  const list = [...ahead, ...past];
  const rows = all ? list : list.slice(0, 6);

  return <div className="ac-classes" ref={box}>
    {!adding && <button type="button" className="hp3-button hp3-red ac-add" onClick={open}><Plus size={16} />{t.add}</button>}
    {adding && <form className="ac-class-form" onSubmit={(e) => void save(e)}>
      <div className="ac-seg" role="radiogroup" aria-label={t.add}>
        {(['done', 'plan'] as Mode[]).map((m) => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => switchMode(m)}>{m === 'done' ? <Check size={15} /> : <Plus size={15} />}{m === 'done' ? t.attended : t.willGo}</button>)}
      </div>
      <label className="hp3-field">{t.date}<input className="hp3-input" type="date" value={date} required {...(mode === 'done' ? { max: today, min: shift(today, -365) } : { min: today, max: shift(today, 365) })} onChange={(e) => { if (e.target.value) { setDate(e.target.value); setKey(''); } }} /></label>
      <fieldset className="ac-class-pick">
        <legend>{t.classes} · {fmtDate(date, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</legend>
        {dayClasses.length ? dayClasses.map((c) => { const k = classKey(c); return <label key={k} className={key === k ? 'is-on' : ''}>
          <input type="radio" name="class" value={k} checked={key === k} onChange={() => { setKey(k); setError(''); }} />
          <b>{clock(time24(c), lang)}</b><span>{lang === 'ar' ? c.ar : c.name}</span><small>{c.coach}</small>
        </label>; }) : <p className="ac-empty">{t.noClasses}</p>}
      </fieldset>
      <label className="hp3-consent"><input type="checkbox" name="consent" required /><span>{legalConsent(lang)} <a href={lang === 'ar' ? '/ar/privacy' : '/privacy'} target="_blank" rel="noopener noreferrer">{t.privacy}</a> · <a href={lang === 'ar' ? '/ar/terms' : '/terms'} target="_blank" rel="noopener noreferrer">{t.terms}</a></span></label>
      {error && <p className="hp3-error" role="alert">{error}</p>}
      <div className="ac-class-actions">
        <button type="submit" className="hp3-button hp3-red" disabled={busy !== '' || !dayClasses.length}>{busy === 'save' ? <LoaderCircle size={16} className="ac-spin" /> : <Check size={16} />}{busy === 'save' ? t.saving : t.save}</button>
        <button type="button" className="hp3-button" onClick={() => { setAdding(false); setError(''); }}>{t.cancel}</button>
      </div>
    </form>}
    {!adding && error && <p className="hp3-error" role="alert">{error}</p>}
    {notice && <p className="ac-saved" role="status">{notice}</p>}

    {state === 'loading' && !sessions.length ? <p className="ac-loading"><LoaderCircle size={18} className="ac-spin" /></p>
      : list.length ? <ul className="ac-list">{rows.map((s) => {
        const done = s.status === 'completed';
        const due = !done && s.scheduledDate <= today; // its day has come: ask whether they went
        return <li key={s.id} className={`ac-row is-class${done ? ' is-done' : ''}`}>
          <span className="ac-row-day"><b>{fmtDate(s.scheduledDate, lang, { day: 'numeric' })}</b><small>{fmtDate(s.scheduledDate, lang, { weekday: 'short' })}</small></span>
          <div><strong>{name(s)}</strong><span>{fmtDate(s.scheduledDate, lang, { month: 'long' })} · {clock(s.scheduledTime, lang)}{s.coach && s.coach !== '—' ? ` · ${s.coach}` : ''}</span></div>
          {done ? <span className="ac-status is-confirmed"><Check size={13} />{t.done}</span>
            : due ? <button type="button" className="ac-mark" disabled={busy !== ''} aria-label={`${t.unconfirmed} ${name(s)}`} onClick={() => void act(s)}><Check size={14} />{t.markDone}</button>
            : <span className="ac-status is-upcoming">{t.upcoming}</span>}
          <button type="button" className="ac-remove" disabled={busy !== ''} aria-label={`${t.remove}: ${name(s)}`} onClick={() => void act(s, true)}><X size={17} /></button>
        </li>;
      })}</ul> : !adding && <p className="ac-empty">{t.empty}</p>}
    {list.length > 6 && <button type="button" className="ac-link ac-more-rows" onClick={() => setAll(!all)}>{all ? t.showLess : `${t.showAll} (${fmtNum(list.length, lang)})`}</button>}

    <div className="ac-plan-foot"><a href="/classes" className="hp3-text-link">{t.find}<ArrowUpRight size={16} /></a><small>{t.note}</small></div>
  </div>;
}

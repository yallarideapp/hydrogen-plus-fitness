'use client';
// Admin → Members: every member, their plan and their check-ins at the gate. Ready to be fed by the club's
// membership system and face-recognition gate later (see lib/admin/members.ts); for now by hand or from a file.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  CalendarPlus, ChevronDown, CircleAlert, CircleCheck, Download, FileSpreadsheet, Globe, Hand, LogIn, Pause, Play, Plus,
  ScanFace, Search, ShieldCheck, Trash2, Unplug, Upload, UserPlus, Users, X,
} from 'lucide-react';
import {
  acceptSiteSubscription, addDemo, addMonths, addVisit, ammanNow, blankMember, days, exportCsv, guessField, isDate, importRows,
  nameKey, nextDay, parseSheet, readSheetFile, refineGate, removeDemo, removeMember, removeVisit, saveMember, siteSubscriptions, standing,
  useMembers, type Field, type Member, type MemberStatus, type Section, type SiteSub, type Standing, type Visit,
} from '@/lib/admin/members';
import { usePlans } from '@/lib/admin/overrides';
import { fmtDate } from '@/lib/fmt-date';
import './members.css';

type Lang = 'en' | 'ar';
type Tr = (en: string, ar: string) => string;
type Flash = (kind: 'ok' | 'warn', text: string) => void;
type Filter = 'all' | 'active' | 'ending' | 'expired' | 'pending' | 'frozen' | 'cancelled' | 'today';

const SECTIONS: [Section, string, string][] = [['men', 'Men', 'الرجال'], ['women', 'Ladies', 'السيدات'], ['kids', 'Kids', 'الأطفال']];
const STATUSES: [MemberStatus, string, string][] = [['active', 'Active', 'فعّال'], ['pending', 'Awaiting payment', 'بانتظار الدفع'], ['frozen', 'Frozen', 'مجمّد'], ['cancelled', 'Cancelled', 'ملغى']];
const STANDING: Record<Standing, [string, string]> = { active: ['Active', 'فعّال'], ending: ['Ending soon', 'ينتهي قريباً'], expired: ['Expired', 'منتهٍ'], pending: ['Awaiting payment', 'بانتظار الدفع'], frozen: ['Frozen', 'مجمّد'], cancelled: ['Cancelled', 'ملغى'] };
const FIELDS: [Field, string, string][] = [
  ['skip', '— not used —', '— لا يُستخدم —'], ['number', 'Member number', 'رقم العضوية'], ['name', 'Name', 'الاسم'], ['phone', 'Phone', 'الهاتف'],
  ['section', 'Section (men / ladies)', 'القسم (رجال / سيدات)'], ['plan', 'Plan', 'الباقة'], ['start', 'Start date', 'تاريخ البدء'], ['end', 'End date', 'تاريخ الانتهاء'],
  ['status', 'Status', 'الحالة'], ['paid', 'Amount paid', 'المبلغ المدفوع'], ['visit', 'Check-in date (and time)', 'تاريخ الدخول (ووقته)'], ['time', 'Check-in time', 'وقت الدخول'],
];
const PAGE = 60;

const clock = (hm: string, lang: Lang) => { const [h, m] = hm.split(':').map(Number); if (Number.isNaN(h)) return hm; return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${lang === 'ar' ? (h < 12 ? 'ص' : 'م') : h < 12 ? 'AM' : 'PM'}`; };
const arDays = (n: number) => (n === 1 ? 'يوم واحد' : n === 2 ? 'يومان' : n <= 10 ? `${n} أيام` : `${n} يوماً`);
const arDaysAgo = (n: number) => (n === 1 ? 'يوم' : n === 2 ? 'يومين' : n <= 10 ? `${n} أيام` : `${n} يوماً`);
// Arabic letters join into a word (ل + ا = «لا»), so Arabic names get one letter.
const initials = (name: string) => { const w = name.trim().split(/\s+/); return /[\u0600-\u06FF]/.test(w[0] ?? '') ? w[0][0] : w.slice(0, 2).map((x) => x[0]).join('').toUpperCase(); };
const monthKey = (d: string) => d.slice(0, 7);
const visitDays = (m: Member, month: string) => new Set(m.visits.filter((v) => monthKey(v.at) === month).map((v) => v.at.slice(0, 10))).size;
const lastVisit = (m: Member) => m.visits.at(-1)?.at ?? '';

function useSiteSubs(members: Member[]) {
  const [subs, setSubs] = useState<SiteSub[]>([]);
  useEffect(() => {
    const load = () => setSubs(siteSubscriptions(members));
    load();
    const onStorage = (e: StorageEvent) => { if (e.key === 'hp-preview-data') load(); };
    window.addEventListener('storage', onStorage); window.addEventListener('focus', load);
    return () => { window.removeEventListener('storage', onStorage); window.removeEventListener('focus', load); };
  }, [members]);
  return subs;
}
/** Website subscriptions still to confirm, for the count next to «المشتركون» in the menu. */
export function useMembersBadge() { return useSiteSubs(useMembers()).length; }

export default function MembersTab({ lang, A, flash }: { lang: Lang; A: Tr; flash: Flash }) {
  const members = useMembers();
  const { date: today, time: now } = ammanNow();
  const month = monthKey(today);
  const plans = usePlans();
  const siteSubs = useSiteSubs(members);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [section, setSection] = useState<Section | 'all'>('all');
  const [sort, setSort] = useState<'recent' | 'end' | 'name'>('recent');
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [importing, setImporting] = useState<null | 'members' | 'gate'>(null);
  const [showLink, setShowLink] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const [wipe, setWipe] = useState(false);
  const importRef = useRef<HTMLDivElement>(null);

  const planLabel = useMemo(() => {
    const map = new Map<string, string>(); const li = lang === 'ar' ? 1 : 0;
    for (const c of plans) for (const p of c.plans) map.set(p.id, `${c.name[li]} · ${p.label[li]}`);
    return map;
  }, [plans, lang]);
  const planOf = (m: Member) => (m.planId && planLabel.get(m.planId)) || m.plan;

  const rows = useMemo(() => members.map((m) => ({ m, st: standing(m, today), last: lastVisit(m), inToday: lastVisit(m).startsWith(today) })), [members, today]);
  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: rows.length, active: 0, ending: 0, expired: 0, pending: 0, frozen: 0, cancelled: 0, today: 0 };
    for (const r of rows) { c[r.st]++; if (r.st === 'ending') c.active++; if (r.inToday) c.today++; }
    return c;
  }, [rows]);
  const shown = useMemo(() => {
    const k = nameKey(q); const digits = q.replace(/\D/g, '');
    const list = rows.filter((r) => {
      if (section !== 'all' && r.m.section !== section) return false;
      if (filter === 'today' ? !r.inToday : filter === 'active' ? !(r.st === 'active' || r.st === 'ending') : filter !== 'all' && r.st !== filter) return false;
      if (!k) return true;
      return nameKey(r.m.name).includes(k) || (!!digits && (r.m.phone.replace(/\D/g, '').includes(digits) || r.m.number.includes(digits))) || r.m.number.toLowerCase() === q.trim().toLowerCase();
    });
    const byEnd = (r: (typeof rows)[number]) => r.m.end || '9999';
    list.sort(sort === 'name' ? (a, b) => a.m.name.localeCompare(b.m.name, lang) : sort === 'end' ? (a, b) => byEnd(a).localeCompare(byEnd(b)) : (a, b) => b.last.localeCompare(a.last) || b.m.updatedAt - a.m.updatedAt);
    return list;
  }, [rows, q, filter, section, sort, lang]);
  useEffect(() => { setLimit(PAGE); }, [q, filter, section, sort]);
  const todayList = useMemo(() => rows.filter((r) => r.inToday).sort((a, b) => b.last.localeCompare(a.last)), [rows]);
  const hasDemo = members.some((m) => m.source === 'demo');

  const openImport = (kind: 'members' | 'gate') => { setImporting(kind); setAdding(false); window.setTimeout(() => importRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30); };
  const download = () => {
    const blob = new Blob([exportCsv(shown.map((r) => r.m))], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hydrogen-members-${today}.csv`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  const checkIn = (m: Member) => {
    const { date: day, time: now } = ammanNow();
    addVisit(m.id, `${day}T${now}`, 'manual');
    const st = standing(m, today);
    flash(st === 'active' || st === 'ending' ? 'ok' : 'warn', st === 'active' || st === 'ending' ? A(`${m.name} checked in at ${clock(now, 'en')}.`, `سُجّل دخول ${m.name} الساعة ${clock(now, 'ar')}.`) : A(`${m.name} checked in, but the plan is ${STANDING[st][0].toLowerCase()}.`, `سُجّل دخول ${m.name}، لكن الاشتراك ${STANDING[st][1]}.`));
  };

  const stat = (f: Filter, n: number, en: string, ar: string, tone = '') => (
    <button type="button" className={`${filter === f ? 'is-on' : ''} ${tone}`} aria-pressed={filter === f} onClick={() => setFilter(filter === f ? 'all' : f)}><b>{n}</b><span>{A(en, ar)}</span></button>
  );

  return (
    <>
      <div className="adm-hello"><h1>{A('Members', 'المشتركون')}</h1><p>{A('Every member, their plan and when they came in. Changes here are saved straight away, in this browser.', 'كل مشترك وباقته ومتى دخل إلى النادي. التغييرات هنا تُحفظ فوراً على هذا المتصفح.')}</p></div>

      <LinkCard A={A} open={showLink} toggle={() => setShowLink((v) => !v)} onImport={openImport} />

      <div className="adm-stats mb-stats">
        {stat('all', counts.all, 'members', 'كل المشتركين')}
        {stat('active', counts.active, 'active plans', 'اشتراك فعّال', 'is-green')}
        {stat('ending', counts.ending, 'end within 7 days', 'ينتهي خلال 7 أيام', 'is-amber')}
        {stat('expired', counts.expired, 'expired', 'اشتراك منتهٍ', 'is-red')}
        {stat('today', counts.today, 'came in today', 'دخلوا اليوم', 'is-blue')}
      </div>

      {siteSubs.length > 0 && <SitePending subs={siteSubs} plans={plans} A={A} flash={flash} />}

      {adding && (
        <section className="adm-section mb-new">
          <div className="adm-section-head"><h2><UserPlus size={18} />{A('New member', 'مشترك جديد')}</h2><button type="button" className="adm-btn" onClick={() => setAdding(false)}><X size={16} />{A('Close', 'إغلاق')}</button></div>
          <MemberForm initial={blankMember(today)} isNew members={members} plans={plans} lang={lang} A={A} today={today} onDone={(m) => { setAdding(false); if (m) { setOpen(m.id); flash('ok', A(`${m.name} added.`, `أُضيف ${m.name}.`)); } }} />
        </section>
      )}

      {importing && <div ref={importRef}><ImportPanel kind={importing} setKind={setImporting} A={A} flash={flash} onClose={() => setImporting(null)} /></div>}

      {todayList.length > 0 && (
        <section className="adm-section mb-today">
          <div className="adm-section-head"><h2><ScanFace size={18} />{A('In today', 'دخلوا اليوم')}</h2><span className="mb-muted">{fmtDate(today, lang)}</span></div>
          <div className="mb-today-row">{todayList.slice(0, 30).map(({ m, last }) => <button type="button" key={m.id} onClick={() => { setOpen(m.id); setFilter('all'); setQ(''); window.setTimeout(() => document.getElementById(`mb-${m.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40); }}><b>{clock(last.slice(11), lang)}</b>{m.name}</button>)}</div>
        </section>
      )}

      <section className="adm-section mb-list-wrap">
        <div className="adm-section-head">
          <h2><Users size={18} />{A('Member list', 'قائمة المشتركين')}</h2>
          <div className="adm-inline">
            <button type="button" className="adm-btn adm-primary" onClick={() => { setAdding(true); setImporting(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><UserPlus size={16} />{A('Add member', 'إضافة مشترك')}</button>
            <button type="button" className="adm-btn" onClick={() => openImport('members')}><Upload size={16} />{A('Import', 'استيراد')}</button>
            <button type="button" className="adm-btn" disabled={!shown.length} onClick={download}><Download size={16} />{A('Export', 'تصدير')}</button>
          </div>
        </div>

        {members.length === 0 ? (
          <div className="mb-empty">
            <Users size={30} />
            <p><b>{A('No members yet.', 'لا يوجد مشتركون بعد.')}</b> {A('Add them one by one, or import the list exported from the club’s membership system (Excel or CSV). Once the site is linked to that system, members will appear here on their own.', 'أضفهم واحداً واحداً، أو استورد القائمة المصدّرة من برنامج اشتراكات النادي (Excel أو CSV). بعد ربط الموقع بذلك البرنامج سيظهر المشتركون هنا تلقائياً.')}</p>
            <div className="adm-inline">
              <button type="button" className="adm-btn adm-primary" onClick={() => openImport('members')}><FileSpreadsheet size={16} />{A('Import from a file', 'استيراد من ملف')}</button>
              <button type="button" className="adm-btn" onClick={() => setAdding(true)}><UserPlus size={16} />{A('Add a member', 'إضافة مشترك')}</button>
              <button type="button" className="adm-link" onClick={() => { addDemo(today); flash('ok', A('Sample members added. Remove them any time with “Remove samples”.', 'أُضيفت أمثلة للتجربة. احذفها متى شئت بزر «حذف الأمثلة».')); }}>{A('Add sample members to try it', 'أضف أمثلة للتجربة')}</button>
            </div>
          </div>
        ) : (
          <>
            <div className="adm-filters mb-filters">
              <label className="adm-search"><Search size={17} /><input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={A('Search by name, phone or member number', 'ابحث بالاسم أو الهاتف أو رقم العضوية')} aria-label={A('Search members', 'ابحث في المشتركين')} /></label>
              <select value={section} onChange={(e) => setSection(e.target.value as Section | 'all')} aria-label={A('Section', 'القسم')}><option value="all">{A('All sections', 'كل الأقسام')}</option>{SECTIONS.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select>
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label={A('Sort', 'الترتيب')}><option value="recent">{A('Last check-in first', 'آخر دخول أولاً')}</option><option value="end">{A('Ending first', 'الأقرب انتهاءً')}</option><option value="name">{A('Name', 'الاسم')}</option></select>
            </div>
            <div className="mb-chips" role="group" aria-label={A('Status', 'الحالة')}>
              {(['all', 'active', 'ending', 'expired', 'pending', 'frozen', 'cancelled', 'today'] as Filter[]).filter((f) => f === 'all' || counts[f] > 0 || filter === f).map((f) => (
                <button type="button" key={f} className={filter === f ? 'is-on' : ''} aria-pressed={filter === f} onClick={() => setFilter(f)}>
                  {f === 'all' ? A('All', 'الكل') : f === 'today' ? A('In today', 'دخلوا اليوم') : A(...STANDING[f])}<em>{counts[f]}</em>
                </button>
              ))}
            </div>
            <p className="adm-count">{A(`${shown.length} of ${members.length}`, `${shown.length} من ${members.length}`)}</p>
            {shown.length === 0 ? <p className="adm-empty">{A('No member matches.', 'لا يوجد مشترك مطابق.')}</p> : (
              <ul className="mb-list">
                {shown.slice(0, limit).map(({ m, st, last }) => (
                  <li key={m.id} id={`mb-${m.id}`} className={`mb-item${open === m.id ? ' is-open' : ''}`}>
                    <div className="mb-row">
                      <button type="button" className="mb-main" aria-expanded={open === m.id} onClick={() => setOpen(open === m.id ? null : m.id)}>
                        <span className={`mb-avatar is-${m.section}`} aria-hidden="true">{initials(m.name)}</span>
                        <span className="mb-who">
                          <b>{m.name}</b>
                          <small>{[m.number && `#${m.number}`, m.phone && <bdi key="p">{m.phone}</bdi>, A(...(SECTIONS.find((s) => s[0] === m.section)!.slice(1) as [string, string]))].filter(Boolean).map((x, i) => <span key={i}>{x}</span>)}</small>
                        </span>
                        <span className="mb-plan"><span>{planOf(m) || A('No plan', 'بدون باقة')}</span><small>{endLine(m, st, today, lang, A)}</small></span>
                        <span className="mb-last"><small>{A('Last check-in', 'آخر دخول')}</small><span>{last ? whenLine(last, today, lang, A) : '—'}</span></span>
                        <span className={`mb-status is-${st}`}>{A(...STANDING[st])}</span>
                        <ChevronDown size={18} className="mb-caret" aria-hidden="true" />
                      </button>
                      <button type="button" className="adm-btn mb-checkin" onClick={() => checkIn(m)} title={A('Record a check-in now', 'سجّل دخوله الآن')} aria-label={A(`Check in ${m.name} now`, `سجّل دخول ${m.name} الآن`)}><LogIn size={16} /><span>{A('Check in', 'دخول')}</span></button>
                    </div>
                    {open === m.id && <MemberDetail m={m} st={st} today={today} now={now} month={month} members={members} plans={plans} lang={lang} A={A} flash={flash} onRemoved={() => setOpen(null)} />}
                  </li>
                ))}
              </ul>
            )}
            {shown.length > limit && <button type="button" className="adm-add mb-more" onClick={() => setLimit((n) => n + PAGE)}>{A(`Show more (${shown.length - limit})`, `عرض المزيد (${shown.length - limit})`)}</button>}
            <div className="mb-foot">
              {hasDemo && <button type="button" className="adm-link" onClick={() => { removeDemo(); flash('ok', A('Sample members removed.', 'حُذفت الأمثلة.')); }}><Trash2 size={14} />{A('Remove samples', 'حذف الأمثلة')}</button>}
              {!hasDemo && <button type="button" className="adm-link" onClick={() => { addDemo(today); flash('ok', A('Sample members added.', 'أُضيفت أمثلة للتجربة.')); }}><Plus size={14} />{A('Add sample members', 'أضف أمثلة للتجربة')}</button>}
              <button type="button" className={`adm-link is-danger${wipe ? ' is-armed' : ''}`} onClick={() => { if (!wipe) { setWipe(true); window.setTimeout(() => setWipe(false), 4000); return; } members.forEach((m) => removeMember(m.id)); setWipe(false); flash('ok', A('All members removed from this browser.', 'حُذف كل المشتركين من هذا المتصفح.')); }}><Trash2 size={14} />{wipe ? A('Tap again to remove everyone', 'اضغط مرة أخرى لحذف الجميع') : A('Remove all', 'حذف الكل')}</button>
            </div>
          </>
        )}
      </section>
    </>
  );
}

function endLine(m: Member, st: Standing, today: string, lang: Lang, A: Tr) {
  if (!m.end) return m.start ? A(`Since ${fmtDate(m.start, 'en')}`, `منذ ${fmtDate(m.start, 'ar')}`) : A('No dates', 'بدون تواريخ');
  const left = days(today, m.end);
  const end = fmtDate(m.end, lang);
  if (st === 'frozen') return A(`Frozen · ends ${end}`, `مجمّد · ينتهي ${end}`);
  if (left < 0) return A(`Ended ${end} (${-left} day${left === -1 ? '' : 's'} ago)`, `انتهى ${end} (منذ ${arDaysAgo(-left)})`);
  if (left === 0) return A(`Ends today`, `ينتهي اليوم`);
  return A(`Until ${end} · ${left} day${left === 1 ? '' : 's'} left`, `حتى ${end} · باقٍ ${arDays(left)}`);
}
function whenLine(at: string, today: string, lang: Lang, A: Tr) {
  const d = at.slice(0, 10); const t = clock(at.slice(11), lang); const ago = days(d, today);
  return ago === 0 ? A(`Today ${t}`, `اليوم ${t}`) : ago === 1 ? A(`Yesterday ${t}`, `أمس ${t}`) : `${fmtDate(d, lang)}`;
}

// ---------- the link with the club's system ----------
function LinkCard({ A, open, toggle, onImport }: { A: Tr; open: boolean; toggle: () => void; onImport: (k: 'members' | 'gate') => void }) {
  return (
    <section className={`mb-link${open ? ' is-open' : ''}`}>
      <button type="button" className="mb-link-head" aria-expanded={open} onClick={toggle}>
        <Unplug size={19} />
        <span><b>{A('Link with the club’s system', 'الربط مع نظام النادي')}</b><small>{A('Not linked yet · members are added by hand or from a file', 'لم يُربط بعد · يُضاف المشتركون يدوياً أو من ملف')}</small></span>
        <span className="mb-link-state">{A('Not linked', 'غير مربوط')}</span>
        <ChevronDown size={18} className="mb-caret" aria-hidden="true" />
      </button>
      {open && (
        <div className="mb-link-body">
          <p>{A('Once the site has its server, it can take its members from the club in one of three ways:', 'بعد أن يصبح للموقع خادم، يمكنه أخذ المشتركين من النادي بإحدى ثلاث طرق:')}</p>
          <ol className="mb-ways">
            <li><span className="mb-way-icon"><Globe size={18} /></span><div><b>{A('Direct link with the membership software', 'ربط مباشر مع برنامج الاشتراكات')}</b><p>{A('If the club’s software offers a link (an API), members and their plans stay in step on their own. Needed: the software’s name and the company that installed it.', 'إذا كان لبرنامج النادي واجهة ربط (API)، يتزامن المشتركون وباقاتهم تلقائياً. نحتاج اسم البرنامج والشركة التي ركّبته.')}</p><span className="adm-chip">{A('After the server', 'بعد الخادم')}</span></div></li>
            <li><span className="mb-way-icon"><FileSpreadsheet size={18} /></span><div><b>{A('A file from the software', 'ملف من البرنامج')}</b><p>{A('Works now: export the member list from the software (Excel or CSV) and import it here. A member already on the list is updated by member number or phone, not added twice.', 'متاح الآن: صدّر قائمة المشتركين من البرنامج (Excel أو CSV) واستوردها هنا. المشترك الموجود يُحدَّث برقم عضويته أو هاتفه ولا يتكرر.')}</p><button type="button" className="adm-btn" onClick={() => onImport('members')}><Upload size={16} />{A('Import a member list', 'استيراد قائمة المشتركين')}</button></div></li>
            <li><span className="mb-way-icon"><ScanFace size={18} /></span><div><b>{A('The face-recognition gate', 'جهاز بصمة الوجه')}</b><p>{A('Works now from a file: export the entry log from the gate’s software and import it here. Once linked, every entry arrives by itself. Needed: the device make and model (for example ZKTeco or Hikvision).', 'متاح الآن من ملف: صدّر سجل الدخول من برنامج الجهاز واستورده هنا. بعد الربط يصل كل دخول تلقائياً. نحتاج نوع الجهاز وموديله (مثل ZKTeco أو Hikvision).')}</p><button type="button" className="adm-btn" onClick={() => onImport('gate')}><Upload size={16} />{A('Import an entry log', 'استيراد سجل الدخول')}</button></div></li>
          </ol>
          <p className="mb-privacy"><ShieldCheck size={17} /><span>{A('The face scan stays on the club’s device. The website never receives face photos or face data, only the member number and the time they came in.', 'بصمة الوجه تبقى على جهاز النادي. الموقع لا يستقبل صور الوجوه ولا بياناتها، بل رقم المشترك ووقت دخوله فقط.')}</span></p>
          <p className="mb-muted">{A('Until then the list is kept in this browser only. Use Export for a copy.', 'حتى ذلك الحين تُحفظ القائمة على هذا المتصفح فقط. استخدم «تصدير» لأخذ نسخة.')}</p>
        </div>
      )}
    </section>
  );
}

// ---------- subscriptions made on the website ----------
function SitePending({ subs, plans, A, flash }: { subs: SiteSub[]; plans: ReturnType<typeof usePlans>; A: Tr; flash: Flash }) {
  const guess = (s: SiteSub): Section => { const c = plans.find((x) => x.plans.some((p) => p.id === s.planId)); return c?.for === 'women' ? 'women' : c?.id === 'kids' ? 'kids' : 'men'; };
  const [sec, setSec] = useState<Record<string, Section>>({});
  return (
    <section className="adm-section mb-site">
      <div className="adm-section-head"><h2><Globe size={18} />{A('Subscriptions from the website', 'اشتراكات من الموقع')}</h2></div>
      <p className="adm-intro">{A('People who chose a plan on the website. Confirm once they have paid, and they join the member list.', 'أشخاص اختاروا باقة من الموقع. أكّد بعد الدفع لينضموا إلى قائمة المشتركين.')}</p>
      <ul className="mb-site-list">
        {subs.map((s) => {
          const section = sec[s.id] ?? guess(s);
          return (
            <li key={s.id}>
              <div className="mb-who"><b>{s.name || s.reference}</b><small>{s.phone && <span><bdi>{s.phone}</bdi></span>}<span>{s.reference}</span></small></div>
              <div className="mb-plan"><span>{s.planName}</span><small>{A(`From ${fmtDate(s.startDate, 'en')}`, `من ${fmtDate(s.startDate, 'ar')}`)} · {s.price} {A('JD', 'د.أ')} · {s.payment === 'cliq' ? 'CliQ' : A('cash at the club', 'نقداً في النادي')}</small></div>
              <span className={`mb-status is-${s.status === 'active' ? 'active' : 'pending'}`}>{s.status === 'active' ? A('Active on the site', 'فعّال على الموقع') : A('Awaiting payment', 'بانتظار الدفع')}</span>
              <div className="adm-inline">
                <select value={section} onChange={(e) => setSec({ ...sec, [s.id]: e.target.value as Section })} aria-label={A('Section', 'القسم')}>{SECTIONS.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select>
                <button type="button" className="adm-btn adm-primary" onClick={() => { acceptSiteSubscription(s, section); flash('ok', A(`${s.name || s.reference} is now a member with an active plan.`, `أصبح ${s.name || s.reference} مشتركاً وباقته فعّالة.`)); }}><CircleCheck size={16} />{s.status === 'active' ? A('Add to members', 'أضف إلى المشتركين') : A('Paid · confirm', 'دفع · تأكيد')}</button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

// ---------- one member ----------
function MemberDetail({ m, st, today, now, month, members, plans, lang, A, flash, onRemoved }: { m: Member; st: Standing; today: string; now: string; month: string; members: Member[]; plans: ReturnType<typeof usePlans>; lang: Lang; A: Tr; flash: Flash; onRemoved: () => void }) {
  const [sure, setSure] = useState(false);
  const [all, setAll] = useState(false);
  const [past, setPast] = useState({ date: today, time: now });
  const renew = (months: number) => {
    const running = !!m.end && m.end >= today;
    const from = running ? nextDay(m.end) : today;
    const end = addMonths(from, months);
    saveMember({ ...m, start: running ? m.start || today : from, end, status: 'active', frozenAt: undefined });
    flash('ok', A(`Renewed until ${fmtDate(end, 'en')}.`, `جُدّد الاشتراك حتى ${fmtDate(end, 'ar')}.`));
  };
  const freeze = () => {
    if (m.status !== 'frozen') { saveMember({ ...m, status: 'frozen', frozenAt: today }); flash('ok', A('Plan frozen. Unfreezing moves the end date on by the frozen days.', 'جُمّد الاشتراك. عند إلغاء التجميد يُمدّد بعدد أيام التجميد.')); return; }
    const held = m.frozenAt ? Math.max(0, days(m.frozenAt, today)) : 0;
    let end = m.end;
    if (end && held) { const d = new Date(`${end}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + held); end = d.toISOString().slice(0, 10); }
    saveMember({ ...m, status: 'active', frozenAt: undefined, end });
    flash('ok', held && m.end ? A(`Unfrozen. The plan now ends ${fmtDate(end, 'en')} (${held} days added).`, `أُلغي التجميد. ينتهي الاشتراك الآن ${fmtDate(end, 'ar')} (أُضيف ${arDays(held)}).`) : A('Unfrozen.', 'أُلغي التجميد.'));
  };
  const visits = [...m.visits].reverse();
  const SRC: Record<Visit['source'], [ReactNode, string, string]> = { face: [<ScanFace key="f" size={15} />, 'Face gate', 'بصمة الوجه'], manual: [<Hand key="m" size={15} />, 'By hand', 'يدوياً'], import: [<FileSpreadsheet key="i" size={15} />, 'From a file', 'من ملف'] };
  return (
    <div className="mb-detail">
      <div className="mb-actions">
        <span className="mb-muted">{A('Plan', 'الاشتراك')}:</span>
        {[1, 3, 6, 12].map((n) => <button type="button" key={n} className="adm-btn" onClick={() => renew(n)}><CalendarPlus size={15} />{A(`+${n === 12 ? '1 year' : n === 1 ? '1 month' : `${n} months`}`, `+ ${n === 12 ? 'سنة' : n === 1 ? 'شهر' : `${n} أشهر`}`)}</button>)}
        <button type="button" className="adm-btn" onClick={freeze}>{m.status === 'frozen' ? <><Play size={15} />{A('Unfreeze', 'إلغاء التجميد')}</> : <><Pause size={15} />{A('Freeze', 'تجميد')}</>}</button>
        {st === 'pending' && <button type="button" className="adm-btn adm-primary" onClick={() => { saveMember({ ...m, status: 'active' }); flash('ok', A('Marked as paid.', 'سُجّل الدفع وأصبح الاشتراك فعّالاً.')); }}><CircleCheck size={15} />{A('Paid', 'تم الدفع')}</button>}
      </div>
      <div className="mb-detail-grid">
        <div>
          <h3>{A('Details', 'البيانات')}</h3>
          <MemberForm key={JSON.stringify({ ...m, visits: 0, updatedAt: 0 })} initial={m} members={members} plans={plans} lang={lang} A={A} today={today} onDone={(saved) => { if (saved) flash('ok', A('Saved.', 'حُفظ.')); }} />
        </div>
        <div>
          <h3>{A('Check-ins', 'الدخول إلى النادي')}</h3>
          <div className="mb-visit-stats">
            <span><b>{visitDays(m, month)}</b>{A('days this month', 'أيام الحضور هذا الشهر')}</span>
            <span><b>{visitDays(m, prevMonth(month))}</b>{A('days last month', 'أيام الحضور الشهر الماضي')}</span>
            <span><b>{m.visits.length}</b>{A('check-ins in all', 'مجموع مرات الدخول')}</span>
          </div>
          {visits.length === 0 ? <p className="mb-muted">{A('No check-ins yet. They arrive from the face gate once it is linked, or use Check in.', 'لا يوجد دخول بعد. سيصل من جهاز بصمة الوجه بعد ربطه، أو استخدم زر «دخول».')}</p> : (
            <ul className="mb-visits">
              {(all ? visits : visits.slice(0, 8)).map((v) => (
                <li key={v.at}>
                  <span>{fmtDate(v.at.slice(0, 10), lang)}</span><b>{clock(v.at.slice(11), lang)}</b>
                  <span className="mb-src" title={A(SRC[v.source][1], SRC[v.source][2])}>{SRC[v.source][0]}<small>{A(SRC[v.source][1], SRC[v.source][2])}</small></span>
                  <button type="button" aria-label={A('Delete this check-in', 'احذف هذا الدخول')} onClick={() => removeVisit(m.id, v.at)}><X size={14} /></button>
                </li>
              ))}
            </ul>
          )}
          {visits.length > 8 && <button type="button" className="adm-link" onClick={() => setAll((x) => !x)}>{all ? A('Show fewer', 'عرض أقل') : A(`Show all ${visits.length}`, `عرض الكل (${visits.length})`)}</button>}
          <form className="mb-past" onSubmit={(e) => { e.preventDefault(); if (!isDate(past.date) || !/^\d{2}:\d{2}$/.test(past.time) || past.date > today) return; addVisit(m.id, `${past.date}T${past.time}`, 'manual'); flash('ok', A('Check-in added.', 'أُضيف الدخول.')); }}>
            <span className="adm-label">{A('Add an earlier check-in', 'إضافة دخول سابق')}</span>
            <div className="adm-inline">
              <input type="date" value={past.date} max={today} onChange={(e) => setPast({ ...past, date: e.target.value })} aria-label={A('Date', 'التاريخ')} />
              <input type="time" value={past.time} onChange={(e) => setPast({ ...past, time: e.target.value })} aria-label={A('Time', 'الوقت')} />
              <button type="submit" className="adm-btn"><Plus size={15} />{A('Add', 'إضافة')}</button>
            </div>
          </form>
          <button type="button" className={`adm-link is-danger mb-delete${sure ? ' is-armed' : ''}`} onClick={() => { if (!sure) { setSure(true); window.setTimeout(() => setSure(false), 4000); return; } removeMember(m.id); onRemoved(); flash('ok', A(`${m.name} removed.`, `حُذف ${m.name}.`)); }}><Trash2 size={14} />{sure ? A('Tap again to remove', 'اضغط مرة أخرى للحذف') : A('Remove this member', 'حذف هذا المشترك')}</button>
        </div>
      </div>
    </div>
  );
}
const prevMonth = (month: string) => { const [y, mo] = month.split('-').map(Number); return mo === 1 ? `${y - 1}-12` : `${y}-${String(mo - 1).padStart(2, '0')}`; };

function MemberForm({ initial, isNew, members, plans, lang, A, today, onDone }: { initial: Member; isNew?: boolean; members: Member[]; plans: ReturnType<typeof usePlans>; lang: Lang; A: Tr; today: string; onDone: (saved: Member | null) => void }) {
  const [f, setF] = useState<Member>(initial);
  const [tried, setTried] = useState(false);
  const set = <K extends keyof Member>(k: K, v: Member[K]) => setF((x) => ({ ...x, [k]: v }));
  const li = lang === 'ar' ? 1 : 0;
  const dirty = isNew || JSON.stringify({ ...f, updatedAt: 0 }) !== JSON.stringify({ ...initial, updatedAt: 0 });
  const twin = members.find((x) => x.id !== f.id && ((f.number && x.number === f.number) || (f.phone.replace(/\D/g, '').length >= 7 && x.phone.replace(/\D/g, '') === f.phone.replace(/\D/g, ''))));
  const bad = { name: f.name.trim().length < 2, dates: !!f.start && !!f.end && f.end < f.start };
  const pick = (id: string) => {
    for (const c of plans) {
      const p = c.plans.find((x) => x.id === id);
      if (!p) continue;
      const start = f.start || today;
      const end = p.months ? addMonths(start, p.months) : p.days ? (() => { const d = new Date(`${start}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + p.days! - 1); return d.toISOString().slice(0, 10); })() : f.end;
      setF((x) => ({ ...x, planId: p.id, plan: `${c.name[li]} · ${p.label[li]}`, start, end, paid: String(p.price), section: c.for === 'women' ? 'women' : c.id === 'kids' ? 'kids' : x.section }));
      return;
    }
    setF((x) => ({ ...x, planId: undefined }));
  };
  const submit = () => {
    setTried(true);
    if (bad.name || bad.dates) return;
    const m = { ...f, name: f.name.trim(), phone: f.phone.trim(), number: f.number.trim() };
    saveMember(m);
    onDone(m);
  };
  return (
    <form className="mb-form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <div className="adm-grid2">
        <label className={`adm-field${tried && bad.name ? ' is-invalid' : ''}`}><span className="adm-label">{A('Full name', 'الاسم الكامل')}</span><input value={f.name} onChange={(e) => set('name', e.target.value)} autoComplete="off" /></label>
        <label className="adm-field"><span className="adm-label">{A('Phone', 'الهاتف')}</span><input type="tel" dir="ltr" value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="07X XXX XXXX" autoComplete="off" /></label>
        <label className="adm-field"><span className="adm-label">{A('Member number (in the club’s system)', 'رقم العضوية (في نظام النادي)')}</span><input dir="ltr" value={f.number} onChange={(e) => set('number', e.target.value)} autoComplete="off" /></label>
        <label className="adm-field"><span className="adm-label">{A('Section', 'القسم')}</span><select value={f.section} onChange={(e) => set('section', e.target.value as Section)}>{SECTIONS.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select></label>
      </div>
      {twin && <p className="adm-warn"><CircleAlert size={16} />{A(`${twin.name} already has this number or phone.`, `${twin.name} لديه الرقم نفسه أو الهاتف نفسه.`)}</p>}
      <label className="adm-field"><span className="adm-label">{A('Plan', 'الباقة')}</span>
        <select value={f.planId ?? ''} onChange={(e) => pick(e.target.value)}>
          <option value="">{f.plan && !f.planId ? f.plan : A('Choose from the price list…', 'اختر من قائمة الأسعار…')}</option>
          {plans.map((c) => <optgroup key={c.id} label={c.name[li]}>{c.plans.map((p) => <option key={p.id} value={p.id}>{`${c.name[li]} · ${p.label[li]} · ${p.price} ${A('JD', 'د.أ')}`}</option>)}</optgroup>)}
        </select>
        <small>{A('Picking a plan fills in the end date and the price. You can still change them.', 'اختيار الباقة يملأ تاريخ الانتهاء والمبلغ، ويمكنك تعديلهما.')}</small>
      </label>
      <div className="adm-grid3">
        <label className="adm-field"><span className="adm-label">{A('Start', 'تاريخ البدء')}</span><input type="date" value={f.start} onChange={(e) => set('start', e.target.value)} /></label>
        <label className={`adm-field${bad.dates ? ' is-invalid' : ''}`}><span className="adm-label">{A('End', 'تاريخ الانتهاء')}</span><input type="date" value={f.end} min={f.start || undefined} onChange={(e) => set('end', e.target.value)} /></label>
        <label className="adm-field"><span className="adm-label">{A('Amount paid (JD)', 'المبلغ المدفوع (د.أ)')}</span><input inputMode="decimal" dir="ltr" value={f.paid} onChange={(e) => set('paid', e.target.value)} /></label>
      </div>
      {bad.dates && <p className="adm-warn"><CircleAlert size={16} />{A('The end date is before the start date.', 'تاريخ الانتهاء قبل تاريخ البدء.')}</p>}
      <div className="adm-grid2">
        <label className="adm-field"><span className="adm-label">{A('Status', 'الحالة')}</span><select value={f.status} onChange={(e) => set('status', e.target.value as MemberStatus)}>{STATUSES.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select></label>
        <label className="adm-field"><span className="adm-label">{A('Notes', 'ملاحظات')}</span><input value={f.notes} onChange={(e) => set('notes', e.target.value)} placeholder={A('e.g. paid by CliQ, injury, coach', 'مثل: دفع عبر CliQ، إصابة، المدرب')} /></label>
      </div>
      {tried && bad.name && <p className="adm-warn"><CircleAlert size={16} />{A('Write the member’s name.', 'اكتب اسم المشترك.')}</p>}
      <div className="adm-inline mb-form-actions">
        <button type="submit" className="adm-btn adm-primary" disabled={!dirty}><CircleCheck size={16} />{isNew ? A('Add member', 'إضافة المشترك') : A('Save changes', 'حفظ التعديلات')}</button>
        {!isNew && dirty && <button type="button" className="adm-btn" onClick={() => setF(initial)}>{A('Undo', 'تراجع')}</button>}
        {f.source === 'site' && <span className="mb-muted">{A('Joined from the website', 'انضم من الموقع')}</span>}
        {f.source === 'demo' && <span className="adm-chip">{A('Sample', 'مثال')}</span>}
      </div>
    </form>
  );
}

// ---------- import a member list or a gate log ----------
function ImportPanel({ kind, setKind, A, flash, onClose }: { kind: 'members' | 'gate'; setKind: (k: 'members' | 'gate') => void; A: Tr; flash: Flash; onClose: () => void }) {
  const gate = kind === 'gate';
  const [rows, setRows] = useState<string[][] | null>(null);
  const [fields, setFields] = useState<Field[]>([]);
  const [hasHead, setHasHead] = useState(true);
  const [paste, setPaste] = useState('');
  const [err, setErr] = useState('');
  const [fileName, setFileName] = useState('');
  const load = (r: string[][], name = '') => {
    setErr(''); setFileName(name);
    if (r.length === 0) { setRows(null); setErr(A('No rows found in it.', 'لم نجد فيه أي صفوف.')); return; }
    const head = r[0]; const guessed = head.map((h) => guessField(h, gate));
    const headish = guessed.some((g) => g !== 'skip');
    setHasHead(headish); setRows(r);
    const f = headish ? guessed : head.map((): Field => 'skip');
    setFields(gate ? refineGate(f, headish ? r.slice(1) : r) : f);
  };
  useEffect(() => { if (rows && hasHead) { const f = rows[0].map((h) => guessField(h, gate)); setFields(gate ? refineGate(f, rows.slice(1)) : f); } }, [gate]); // eslint-disable-line react-hooks/exhaustive-deps
  const onFile = async (file?: File) => {
    if (!file) return;
    try { load(await readSheetFile(file), file.name); }
    catch (e) { setRows(null); setErr((e as Error).message === 'old-xls' ? A('This is an old Excel file (.xls). Open it in Excel and save it as .xlsx or CSV, then choose it again.', 'هذا ملف Excel قديم (.xls). افتحه في Excel واحفظه بصيغة xlsx أو CSV ثم اختره مرة أخرى.') : A('This file could not be read. Save it as .xlsx or CSV and try again.', 'تعذّرت قراءة الملف. احفظه بصيغة xlsx أو CSV وحاول مرة أخرى.')); }
  };
  const body = rows ? (hasHead ? rows.slice(1) : rows) : [];
  const cols = rows ? Math.max(...rows.slice(0, 50).map((r) => r.length)) : 0;
  const has = (f: Field) => fields.includes(f);
  const ready = rows && body.length > 0 && (gate ? (has('number') || has('phone') || has('name')) && has('visit') : has('name') || has('number') || has('phone'));
  const run = () => {
    if (!ready) return;
    const r = importRows(body, fields, gate);
    const parts = gate
      ? A(`Check-ins added: ${r.visits}${r.skipped ? ` · rows skipped (not on the member list): ${r.skipped}` : ''}`, `سجلات الدخول المضافة: ${r.visits}${r.skipped ? ` · صفوف متروكة (ليست في قائمة المشتركين): ${r.skipped}` : ''}`)
      : A(`New members: ${r.added} · updated: ${r.updated}${r.visits ? ` · check-ins: ${r.visits}` : ''}${r.skipped ? ` · rows skipped (no name): ${r.skipped}` : ''}`, `مشتركون جدد: ${r.added} · محدَّثون: ${r.updated}${r.visits ? ` · سجلات دخول: ${r.visits}` : ''}${r.skipped ? ` · صفوف متروكة (بلا اسم): ${r.skipped}` : ''}`);
    flash(gate && r.visits === 0 ? 'warn' : 'ok', parts);
    onClose();
  };
  return (
    <section className="adm-section mb-import">
      <div className="adm-section-head"><h2><Upload size={18} />{A('Import', 'استيراد')}</h2><button type="button" className="adm-btn" onClick={onClose}><X size={16} />{A('Close', 'إغلاق')}</button></div>
      <div className="mb-kind" role="radiogroup" aria-label={A('What is in the file', 'ماذا في الملف')}>
        <button type="button" role="radio" aria-checked={!gate} className={!gate ? 'is-on' : ''} onClick={() => setKind('members')}><Users size={18} /><span><b>{A('Member list', 'قائمة المشتركين')}</b><small>{A('From the membership software', 'من برنامج الاشتراكات')}</small></span></button>
        <button type="button" role="radio" aria-checked={gate} className={gate ? 'is-on' : ''} onClick={() => setKind('gate')}><ScanFace size={18} /><span><b>{A('Entry log', 'سجل الدخول')}</b><small>{A('From the face-recognition gate', 'من جهاز بصمة الوجه')}</small></span></button>
      </div>
      <p className="adm-intro">{gate
        ? A('Export the attendance or entry log from the gate’s software (Excel or CSV). Each row is matched to a member by member number, then phone, then name. Rows for people not on the list are skipped, so import the member list first.', 'صدّر سجل الحضور أو الدخول من برنامج الجهاز (Excel أو CSV). يُطابق كل صف مع مشترك برقم العضوية، ثم الهاتف، ثم الاسم. الصفوف لأشخاص ليسوا في القائمة تُترك، لذا استورد قائمة المشتركين أولاً.')
        : A('Export the member list from the club’s software (Excel or CSV), with one member per row. Members already here are updated by member number or phone instead of being added twice.', 'صدّر قائمة المشتركين من برنامج النادي (Excel أو CSV)، مشترك في كل صف. المشترك الموجود هنا يُحدَّث برقم عضويته أو هاتفه بدل أن يُضاف مرتين.')}</p>
      <div className="mb-drop">
        <label className="adm-btn adm-primary mb-file"><FileSpreadsheet size={16} />{A('Choose a file', 'اختر ملفاً')}<input type="file" accept=".xlsx,.csv,.tsv,.txt,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(e) => { void onFile(e.target.files?.[0]); e.target.value = ''; }} /></label>
        <span className="mb-muted">{fileName || A('.xlsx or .csv', 'xlsx أو csv')}</span>
      </div>
      <details className="mb-paste">
        <summary>{A('Or paste cells copied from Excel or Google Sheets', 'أو الصق خلايا منسوخة من Excel أو Google Sheets')}</summary>
        <textarea rows={4} dir="auto" value={paste} onChange={(e) => setPaste(e.target.value)} placeholder={gate ? 'No.\tName\tDate Time\n1040\tأحمد الخطيب\t2026-11-22 07:05' : 'رقم العضوية\tالاسم\tالهاتف\tالباقة\tتاريخ الانتهاء\n1040\tأحمد الخطيب\t0791234567\tشهر\t2026-12-21'} />
        <button type="button" className="adm-btn" disabled={!paste.trim()} onClick={() => load(parseSheet(paste), A('Pasted cells', 'خلايا ملصقة'))}>{A('Read the cells', 'اقرأ الخلايا')}</button>
      </details>
      {err && <p className="adm-warn"><CircleAlert size={16} />{err}</p>}
      {rows && (
        <div className="mb-map">
          <div className="mb-map-head">
            <b>{A(`Rows: ${body.length}`, `عدد الصفوف: ${body.length}`)}</b>
            <label className="adm-check"><input type="checkbox" checked={hasHead} onChange={(e) => setHasHead(e.target.checked)} />{A('The first row is column titles', 'الصف الأول عناوين الأعمدة')}</label>
          </div>
          <p className="mb-muted">{A('Check what each column holds:', 'تأكد مما يحويه كل عمود:')}</p>
          <div className="mb-cols">
            {Array.from({ length: cols }, (_, i) => (
              <div key={i} className={`mb-col${fields[i] && fields[i] !== 'skip' ? ' is-used' : ''}`}>
                <span className="mb-col-head">{hasHead ? rows[0][i] || A(`Column ${i + 1}`, `العمود ${i + 1}`) : A(`Column ${i + 1}`, `العمود ${i + 1}`)}</span>
                <select value={fields[i] ?? 'skip'} onChange={(e) => { const n = [...fields]; while (n.length < cols) n.push('skip'); n[i] = e.target.value as Field; setFields(n); }} aria-label={A(`Column ${i + 1}`, `العمود ${i + 1}`)}>
                  {FIELDS.filter(([v]) => gate ? ['skip', 'number', 'name', 'phone', 'visit', 'time'].includes(v) : v !== 'time').map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}
                </select>
                <ul>{body.slice(0, 3).map((r, j) => <li key={j} dir="auto">{r[i] || '—'}</li>)}</ul>
              </div>
            ))}
          </div>
          {!ready && <p className="adm-warn"><CircleAlert size={16} />{gate ? A('Choose the column with the member number (or name), and the one with the check-in date.', 'اختر عمود رقم العضوية (أو الاسم)، وعمود تاريخ الدخول.') : A('Choose at least the column with the name.', 'اختر على الأقل عمود الاسم.')}</p>}
          <div className="adm-inline"><button type="button" className="adm-btn adm-primary" disabled={!ready} onClick={run}><Upload size={16} />{gate ? A('Add the check-ins', 'أضف سجل الدخول') : A(`Import members (${body.length})`, `استورد المشتركين (${body.length})`)}</button></div>
        </div>
      )}
    </section>
  );
}

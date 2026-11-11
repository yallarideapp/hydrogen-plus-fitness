'use client';
// Site admin. Preview mode: every edit is saved in this browser (localStorage + IndexedDB photos)
// and shown on the site in this browser only. Export/Import moves the edits between browsers.
import { createContext, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import {
  ArrowDown, ArrowUp, CalendarDays, CircleAlert, CircleCheck, Clock3, Download, ExternalLink, FileText, ImageIcon,
  LayoutGrid, ListChecks, Megaphone, Palette, Phone, Plus, RotateCcw, Save, Search, Settings, Tag, Trash2, Undo2, Upload, X,
} from 'lucide-react';
import { EMPTY, readOverrides, sanitize, textKey, useOverrides, writeOverrides, type Contact, type Overrides, type ServicePatch } from '@/lib/admin/overrides';
import { blobToDataUrl, dataUrlToBlob, deletePhoto, getPhoto, newPhotoId, photoIds, putPhoto, toWebp } from '@/lib/admin/photos';
import { services as baseServices, newsPage, type Bi, type MenuSection, type Service, type ServiceFact, type ServiceFaq, type TimelineItem, type TimelineTag } from '@/lib/services';
import { contact as baseContact, hours as baseHours, type HoursRow } from '@/lib/site-info';
import { schedule as baseClasses, scheduleDays as baseDays, type ClassCategory, type ScheduledClass, type ScheduleDay } from '@/lib/schedule';
import { planCategories, type Plan, type PlanCategory } from '@/lib/plans';
import textCatalog from '@/lib/admin/text-catalog.json';
import photoCatalog from '@/lib/admin/photo-catalog.json';
import './admin.css';

type Lang = 'en' | 'ar';
type Entry = { en: string; ar: string; area: string; top?: boolean };
type PhotoEntry = { path: string; group: string; label: [string, string] };
type TabId = 'overview' | 'texts' | 'services' | 'prices' | 'schedule' | 'contact' | 'photos' | 'appearance' | 'settings';

const catalog = textCatalog as Entry[];
const photos = photoCatalog as PhotoEntry[];
const allServices: Service[] = [...baseServices, newsPage];
const svcBySlug = (slug: string) => allServices.find((s) => s.slug === slug)!;
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const PRICE = /JD|دينار|دنانير/;
const DEFAULT_ACCENT = '#e73434';
const AREA_AR: Record<string, string> = {
  Home: 'الرئيسية', 'Header, menu & footer': 'الترويسة والقائمة والتذييل', 'The club': 'النادي', Classes: 'الحصص', Memberships: 'الاشتراكات',
  Training: 'التدريب', Coaches: 'المدربون', Contact: 'التواصل', Careers: 'الوظائف', 'Help centre': 'مركز المساعدة', 'Tools & calculators': 'الأدوات والحاسبات',
  'Visit & join form': 'نموذج الزيارة والاشتراك', 'Service pages (shared)': 'صفحات الخدمات (مشترك)', 'All services': 'كل الخدمات', 'Member area': 'منطقة الأعضاء',
  'Workout studio': 'استوديو التمارين', Community: 'المجتمع', 'Plans & prices': 'الأسعار والاشتراكات',
};
const GROUP_AR: Record<string, string> = { 'Service banners': 'صور واجهات الخدمات', 'Site photos': 'صور الموقع', 'Hydro Rest menu': 'منيو هايدرو ريست', Logo: 'الشعار' };
const TAGS: [TimelineTag, string, string][] = [['offer', 'Offer', 'عرض'], ['news', 'News', 'خبر'], ['hours', 'Hours', 'دوام'], ['event', 'Event', 'فعالية'], ['closure', 'Closure', 'إغلاق'], ['opening', 'Opening', 'افتتاح']];
const CATS: [ClassCategory, string, string][] = [['cardio', 'Cardio', 'كارديو'], ['strength', 'Strength', 'قوة'], ['balance', 'Balance', 'توازن']];

// ---------- language ----------
const LANG_KEY = 'hp-admin-lang';
const langListeners = new Set<() => void>();
const readLang = (): Lang => { try { const v = localStorage.getItem(LANG_KEY) ?? localStorage.getItem('hp-language'); return v === 'en' ? 'en' : 'ar'; } catch { return 'ar'; } };
const subLang = (cb: () => void) => { langListeners.add(cb); return () => { langListeners.delete(cb); }; };
const setLangStored = (l: Lang) => { try { localStorage.setItem(LANG_KEY, l); } catch { /* ignore */ } langListeners.forEach((f) => f()); };
const basePath = () => (location.pathname.startsWith('/hydrogen-plus-fitness') ? '/hydrogen-plus-fitness' : '');
const noop = () => () => {};

const Ctx = createContext<{ lang: Lang; A: (en: string, ar: string) => string }>({ lang: 'en', A: (en) => en });
const useA = () => useContext(Ctx);

// ---------- small building blocks ----------
function BiInput({ label, value, onChange, def, multi, placeholder }: { label?: ReactNode; value: Bi; onChange: (v: Bi) => void; def?: Bi; multi?: boolean; placeholder?: Bi }) {
  const { A } = useA();
  const edited = !!def && !same(value, def);
  const rows = (s: string) => Math.min(9, Math.max(2, Math.ceil(s.length / 55)));
  return (
    <div className={`adm-bi${edited ? ' is-edited' : ''}`}>
      {(label || edited) && <div className="adm-bi-head">{label && <span className="adm-label">{label}</span>}{edited && <><span className="adm-chip">{A('Edited', 'معدّل')}</span><button type="button" className="adm-link" onClick={() => onChange(def!)}><RotateCcw size={13} />{A('Restore', 'استرجاع')}</button></>}</div>}
      <div className="adm-bi-row">
        <label><small>English</small>{multi ? <textarea dir="ltr" rows={rows(value[0])} value={value[0]} placeholder={placeholder?.[0]} onChange={(e) => onChange([e.target.value, value[1]])} /> : <input dir="ltr" value={value[0]} placeholder={placeholder?.[0]} onChange={(e) => onChange([e.target.value, value[1]])} />}</label>
        <label><small>العربية</small>{multi ? <textarea dir="rtl" rows={rows(value[1])} value={value[1]} placeholder={placeholder?.[1]} onChange={(e) => onChange([value[0], e.target.value])} /> : <input dir="rtl" value={value[1]} placeholder={placeholder?.[1]} onChange={(e) => onChange([value[0], e.target.value])} />}</label>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', dir, hint, invalid }: { label: ReactNode; value: string; onChange: (v: string) => void; type?: string; dir?: 'ltr' | 'rtl'; hint?: ReactNode; invalid?: boolean }) {
  return <label className={`adm-field${invalid ? ' is-invalid' : ''}`}><span className="adm-label">{label}</span><input type={type} dir={dir} value={value} onChange={(e) => onChange(e.target.value)} />{hint && <small>{hint}</small>}</label>;
}

function Rows<T>({ items, onChange, make, render, addLabel, title }: { items: T[]; onChange: (x: T[]) => void; make: () => T; render: (item: T, set: (v: T) => void, i: number) => ReactNode; addLabel: string; title?: (item: T, i: number) => ReactNode }) {
  const { A } = useA();
  const move = (i: number, d: number) => { const n = [...items]; const [x] = n.splice(i, 1); n.splice(i + d, 0, x); onChange(n); };
  return (
    <div className="adm-rows">
      {items.map((item, i) => (
        <div className="adm-row-card" key={i}>
          <div className="adm-row-tools">
            <span className="adm-row-title">{title ? title(item, i) : `#${i + 1}`}</span>
            <button type="button" aria-label={A('Move up', 'تحريك لأعلى')} disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={15} /></button>
            <button type="button" aria-label={A('Move down', 'تحريك لأسفل')} disabled={i === items.length - 1} onClick={() => move(i, 1)}><ArrowDown size={15} /></button>
            <button type="button" className="is-danger" aria-label={A('Delete', 'حذف')} onClick={() => onChange(items.filter((_, j) => j !== i))}><Trash2 size={15} /></button>
          </div>
          {render(item, (v) => onChange(items.map((x, j) => (j === i ? v : x))), i)}
        </div>
      ))}
      <button type="button" className="adm-add" onClick={() => onChange([...items, make()])}><Plus size={15} />{addLabel}</button>
    </div>
  );
}

function Section({ title, icon, children, actions, intro }: { title: ReactNode; icon?: ReactNode; children?: ReactNode; actions?: ReactNode; intro?: ReactNode }) {
  return <section className="adm-section"><div className="adm-section-head"><h2>{icon}{title}</h2>{actions}</div>{intro && <p className="adm-intro">{intro}</p>}{children}</section>;
}

function usePhotoUrls(map?: Record<string, string>) {
  const [urls, setUrls] = useState<Record<string, string>>({});
  useEffect(() => {
    let alive = true; const made: string[] = [];
    (async () => {
      const next: Record<string, string> = {};
      for (const id of new Set(Object.values(map ?? {}))) {
        const b = await getPhoto(id).catch(() => undefined);
        if (b) { const u = URL.createObjectURL(b); made.push(u); next[id] = u; }
      }
      if (alive) setUrls(next);
    })();
    return () => { alive = false; made.forEach((u) => URL.revokeObjectURL(u)); };
  }, [map]);
  return urls;
}

const to24 = (c: ScheduledClass) => { const [h, m] = c.time.split(':').map(Number); return `${String((h % 12) + (c.period === 'PM' ? 12 : 0)).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
const from24 = (v: string): Pick<ScheduledClass, 'time' | 'period'> => { const [h, m] = v.split(':').map(Number); return { time: `${h % 12 || 12}:${String(m || 0).padStart(2, '0')}`, period: h >= 12 ? 'PM' : 'AM' }; };
const urlOk = (v: string) => v === '' || /^https?:\/\//.test(v) || v.startsWith('/');

// ====================================================================
export default function AdminPanel() {
  const lang = useSyncExternalStore(subLang, readLang, () => 'en' as Lang);
  const A = (en: string, ar: string) => (lang === 'ar' ? ar : en);
  const base = useSyncExternalStore(noop, basePath, () => '');
  const saved = useOverrides();
  const [draft, setDraft] = useState<Overrides | null>(null);
  const d = draft ?? saved;
  const dirty = draft !== null && !same({ ...draft, savedAt: 0 }, { ...saved, savedAt: 0 });
  const [tab, setTab] = useState<TabId>('overview');
  const [toast, setToast] = useState<{ kind: 'ok' | 'warn'; text: string } | null>(null);
  const flash = (kind: 'ok' | 'warn', text: string) => { setToast({ kind, text }); window.setTimeout(() => setToast(null), 4200); };
  const update = (fn: (o: Overrides) => Overrides) => setDraft((prev) => fn(prev ?? readOverrides()));

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  // ----- setters -----
  const setText = (en: string, ar: string, v: Bi) => update((o) => {
    const texts = { ...o.texts }; const k = textKey(en, ar);
    if (same(v, [en, ar]) || (!v[0].trim() && !v[1].trim())) delete texts[k]; else texts[k] = v;
    return { ...o, texts: Object.keys(texts).length ? texts : undefined };
  });
  const setSvc = <K extends keyof ServicePatch>(slug: string, key: K, value: ServicePatch[K]) => update((o) => {
    const baseSvc = svcBySlug(slug) as unknown as Record<string, unknown>;
    const p: ServicePatch = { ...o.services?.[slug] };
    if (same(value, baseSvc[key])) delete p[key]; else p[key] = value;
    const all = { ...o.services };
    if (Object.keys(p).length) all[slug] = p; else delete all[slug];
    return { ...o, services: Object.keys(all).length ? all : undefined };
  });
  const svcOf = (slug: string): Service => ({ ...svcBySlug(slug), ...d.services?.[slug] });
  const contact: Contact = { ...baseContact, ...d.contact };
  const setContact = <K extends keyof Contact>(key: K, value: Contact[K]) => update((o) => {
    const c: Partial<Contact> = { ...o.contact };
    if (same(value, baseContact[key])) delete c[key]; else c[key] = value;
    return { ...o, contact: Object.keys(c).length ? c : undefined };
  });
  const hours = d.hours ?? baseHours;
  const setHours = (rows: HoursRow[]) => update((o) => ({ ...o, hours: same(rows, baseHours) ? undefined : rows }));
  const sched = d.schedule ?? { days: baseDays, classes: baseClasses };
  const setSched = (s: { days: ScheduleDay[]; classes: ScheduledClass[] }) => update((o) => ({ ...o, schedule: same(s.days, baseDays) && same(s.classes, baseClasses) ? undefined : s }));
  const setPhoto = (path: string, id?: string) => update((o) => {
    const p = { ...o.photos }; if (id) p[path] = id; else delete p[path];
    return { ...o, photos: Object.keys(p).length ? p : undefined };
  });

  const save = async () => {
    writeOverrides(d);
    setDraft(null);
    const keep = new Set(Object.values(readOverrides().photos ?? {}));
    try { for (const id of await photoIds()) if (!keep.has(id)) await deletePhoto(id); } catch { /* bank unavailable */ }
    flash('ok', A('Saved. Open the site in this browser to see your changes.', 'تم الحفظ. افتح الموقع على هذا المتصفح لترى التعديلات.'));
  };
  const discard = () => { setDraft(null); flash('ok', A('Unsaved changes discarded.', 'تم تجاهل التعديلات غير المحفوظة.')); };

  const editedTexts = Object.keys(d.texts ?? {}).length;
  const editedPages = Object.keys(d.services ?? {}).length;
  const replacedPhotos = Object.keys(d.photos ?? {}).length;

  const nav: [TabId, ReactNode, string, string, number?][] = [
    ['overview', <LayoutGrid key="i" size={17} />, 'Overview', 'نظرة عامة'],
    ['texts', <FileText key="i" size={17} />, 'Website texts', 'نصوص الموقع', editedTexts],
    ['services', <ListChecks key="i" size={17} />, 'Service pages', 'صفحات الخدمات', editedPages],
    ['prices', <Tag key="i" size={17} />, 'Prices & offers', 'الأسعار والعروض'],
    ['schedule', <CalendarDays key="i" size={17} />, 'Class timetable', 'جدول الحصص', d.schedule ? 1 : 0],
    ['contact', <Phone key="i" size={17} />, 'Contact & hours', 'التواصل والدوام', (d.contact ? 1 : 0) + (d.hours ? 1 : 0)],
    ['photos', <ImageIcon key="i" size={17} />, 'Photos', 'الصور', replacedPhotos],
    ['appearance', <Palette key="i" size={17} />, 'Colours & banner', 'الألوان والشريط'],
    ['settings', <Settings key="i" size={17} />, 'Backup & settings', 'النسخ والإعدادات'],
  ];

  return (
    <Ctx.Provider value={{ lang, A }}>
      <div className="adm" dir={lang === 'ar' ? 'rtl' : 'ltr'} lang={lang} style={{ ['--adm-accent' as string]: d.accent ?? DEFAULT_ACCENT }}>
        <header className="adm-top">
          <a className="adm-brand" href={`${base}/`}><img src="/images/logo-large.jpg" alt="" width={34} height={34} /><span><b>HYDROGEN<i>+</i></b><small>{A('Site admin', 'لوحة التحكم')}</small></span></a>
          <span className="adm-mode" title={A('Edits are saved in this browser only', 'التعديلات محفوظة في هذا المتصفح فقط')}>{A('Browser-only preview', 'معاينة على هذا المتصفح')}</span>
          <span className={`adm-state${dirty ? ' is-dirty' : ''}`}>{dirty ? A('Unsaved changes', 'تعديلات غير محفوظة') : saved.savedAt ? A('All changes saved', 'كل التعديلات محفوظة') : A('No edits yet', 'لا توجد تعديلات بعد')}</span>
          <div className="adm-top-actions">
            {dirty && <button type="button" className="adm-btn" onClick={discard}><Undo2 size={16} />{A('Discard', 'تجاهل')}</button>}
            <button type="button" className="adm-btn adm-primary" disabled={!dirty} onClick={save}><Save size={16} />{A('Save', 'حفظ')}</button>
            <a className="adm-btn" href={`${base}/`} target="_blank" rel="noopener"><ExternalLink size={16} />{A('View site', 'عرض الموقع')}</a>
            <button type="button" className="adm-btn adm-lang" onClick={() => setLangStored(lang === 'ar' ? 'en' : 'ar')}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
          </div>
        </header>
        <div className="adm-body">
          <nav className="adm-nav" aria-label={A('Admin sections', 'أقسام لوحة التحكم')}>
            {nav.map(([id, icon, en, ar, count]) => <button type="button" key={id} className={tab === id ? 'is-active' : ''} aria-current={tab === id ? 'page' : undefined} onClick={() => { setTab(id); window.scrollTo({ top: 0 }); }}>{icon}<span>{A(en, ar)}</span>{!!count && <em>{count}</em>}</button>)}
          </nav>
          <main className="adm-main">
            {tab === 'overview' && <Overview d={d} go={setTab} counts={{ editedTexts, editedPages, replacedPhotos }} />}
            {tab === 'texts' && <TextsTab d={d} setText={setText} />}
            {tab === 'services' && <ServicesTab svcOf={svcOf} setSvc={setSvc} d={d} setPhoto={setPhoto} base={base} />}
            {tab === 'prices' && <><PlansEditor plans={d.plans ?? planCategories} setPlans={(v) => update((o) => ({ ...o, plans: same(v, planCategories) ? undefined : v }))} /><PricesTab svcOf={svcOf} setSvc={setSvc} /></>}
            {tab === 'schedule' && <ScheduleTab sched={sched} setSched={setSched} />}
            {tab === 'contact' && <ContactTab contact={contact} setContact={setContact} hours={hours} setHours={setHours} />}
            {tab === 'photos' && <PhotosTab d={d} setPhoto={setPhoto} flash={flash} />}
            {tab === 'appearance' && <AppearanceTab d={d} update={update} />}
            {tab === 'settings' && <SettingsTab saved={saved} dirty={dirty} onReplaced={() => setDraft(null)} flash={flash} />}
          </main>
        </div>
        {toast && <div className={`adm-toast is-${toast.kind}`} role="status">{toast.kind === 'ok' ? <CircleCheck size={18} /> : <CircleAlert size={18} />}{toast.text}<button type="button" aria-label="Close" onClick={() => setToast(null)}><X size={15} /></button></div>}
      </div>
    </Ctx.Provider>
  );
}

// ---------- Overview ----------
function Overview({ d, go, counts }: { d: Overrides; go: (t: TabId) => void; counts: { editedTexts: number; editedPages: number; replacedPhotos: number } }) {
  const { A } = useA();
  const classes = (d.schedule?.classes ?? baseClasses).length;
  const checks: [boolean, string, string, TabId][] = [
    [!!d.contact, 'Confirm the phone numbers and WhatsApp (WhatsApp on 079 215 1000 was never confirmed).', 'تأكد من أرقام الهاتف والواتساب (رقم الواتساب ٠٧٩ ٢١٥ ١٠٠٠ غير مؤكد).', 'contact'],
    [!!(d.services?.offers || d.services?.gym), 'Update the current membership offer (the latest published one is from December 2025).', 'حدّث عرض الاشتراك الحالي (آخر عرض منشور من ديسمبر ٢٠٢٥).', 'prices'],
    [!!d.schedule, 'Update the class timetable (it shows the week of 7–12 November 2026).', 'حدّث جدول الحصص (يعرض أسبوع ٧–١٢ نوفمبر ٢٠٢٦).', 'schedule'],
    [!!d.services?.['hydro-rest']?.menu, 'Check the Hydro Rest menu prices (menu from August 2025).', 'راجع أسعار منيو هايدرو ريست (منيو أغسطس ٢٠٢٥).', 'prices'],
    [!!d.hours, 'Check the opening hours.', 'راجع أوقات الدوام.', 'contact'],
  ];
  const cards: [number, string, string, TabId][] = [
    [counts.editedTexts, 'texts edited', 'نص معدّل', 'texts'],
    [counts.editedPages, 'service pages edited', 'صفحة خدمة معدّلة', 'services'],
    [counts.replacedPhotos, 'photos replaced', 'صورة مستبدلة', 'photos'],
    [classes, 'classes on the timetable', 'حصة في الجدول', 'schedule'],
  ];
  return (
    <>
      <div className="adm-hello"><h1>{A('Edit the Hydrogen Plus website', 'تعديل موقع هايدروجين بلس')}</h1><p>{A('Every text, price, photo, timetable and contact detail on the site can be changed here. Press Save, then open the site to check it.', 'كل نص وسعر وصورة وجدول ومعلومة تواصل في الموقع يمكن تعديلها من هنا. اضغط حفظ ثم افتح الموقع لتتأكد.')}</p></div>
      <div className="adm-notice"><CircleAlert size={18} /><p><b>{A('Preview mode.', 'وضع المعاينة.')}</b> {A('The site is hosted on GitHub Pages, which has no server, so your edits are saved in this browser only and visitors still see the published site. Use Backup & settings → Export to move them to another browser. Connecting the site to the free Cloudflare server («الربط») publishes edits to every visitor.', 'الموقع مستضاف على GitHub Pages بدون سيرفر، لذلك تُحفظ التعديلات على هذا المتصفح فقط ويرى الزوار الموقع المنشور. استخدم «النسخ والإعدادات ← تصدير» لنقلها لمتصفح آخر. ربط الموقع بسيرفر Cloudflare المجاني («الربط») ينشر التعديلات لكل الزوار.')}</p></div>
      <div className="adm-stats">{cards.map(([n, en, ar, t]) => <button type="button" key={en} onClick={() => go(t)}><b>{n}</b><span>{A(en, ar)}</span></button>)}</div>
      <Section title={A('Before sharing the site', 'قبل مشاركة الموقع')} icon={<ListChecks size={18} />}>
        <ul className="adm-checks">{checks.map(([done, en, ar, t]) => <li key={en} className={done ? 'is-done' : ''}>{done ? <CircleCheck size={18} /> : <CircleAlert size={18} />}<span>{A(en, ar)}</span><button type="button" className="adm-link" onClick={() => go(t)}>{A('Open', 'فتح')}</button></li>)}</ul>
      </Section>
    </>
  );
}

// ---------- Website texts ----------
function TextsTab({ d, setText }: { d: Overrides; setText: (en: string, ar: string, v: Bi) => void }) {
  const { A } = useA();
  const areas = useMemo(() => Array.from(new Set(catalog.map((e) => e.area))), []);
  const [area, setArea] = useState('top');
  const [q, setQ] = useState('');
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [limit, setLimit] = useState(40);
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return catalog.filter((e) => {
      const ov = d.texts?.[textKey(e.en, e.ar)];
      if (onlyEdited && !ov) return false;
      if (!s && area === 'top' && !e.top) return false;
      if (area !== 'top' && area !== 'all' && e.area !== area) return false;
      return !s || `${e.en} ${e.ar} ${ov?.[0] ?? ''} ${ov?.[1] ?? ''}`.toLowerCase().includes(s);
    });
  }, [area, q, onlyEdited, d.texts]);
  const restoreAll = () => { for (const k of Object.keys(d.texts ?? {})) { const [en, ar] = k.split('␟'); setText(en, ar, [en, ar]); } };
  return (
    <Section title={A('Website texts', 'نصوص الموقع')} icon={<FileText size={18} />} intro={A('Headlines, buttons, menus and paragraphs across the site. Change the English and Arabic side by side. Leave a field empty to go back to the original.', 'العناوين والأزرار والقوائم والفقرات في كل الموقع. عدّل الإنجليزي والعربي جنباً إلى جنب. اترك الحقل فارغاً للرجوع للنص الأصلي.')}
      actions={Object.keys(d.texts ?? {}).length > 0 && <button type="button" className="adm-btn" onClick={restoreAll}><RotateCcw size={15} />{A('Restore all texts', 'استرجاع كل النصوص')}</button>}>
      <div className="adm-filters">
        <label className="adm-search"><Search size={16} /><input value={q} onChange={(e) => { setQ(e.target.value); setLimit(40); }} placeholder={A('Search any text…', 'ابحث عن أي نص…')} aria-label={A('Search texts', 'ابحث في النصوص')} /></label>
        <select value={area} onChange={(e) => { setArea(e.target.value); setLimit(40); }} aria-label={A('Page or area', 'الصفحة أو القسم')}>
          <option value="top">{A('Most important (home banner)', 'الأهم (واجهة الرئيسية)')}</option>
          <option value="all">{A('All pages', 'كل الصفحات')}</option>
          {areas.map((a) => <option key={a} value={a}>{A(a, AREA_AR[a] ?? a)}</option>)}
        </select>
        <label className="adm-check"><input type="checkbox" checked={onlyEdited} onChange={(e) => setOnlyEdited(e.target.checked)} />{A('Edited only', 'المعدّل فقط')}</label>
      </div>
      <p className="adm-count">{list.length} {A('texts', 'نص')}</p>
      <div className="adm-text-list">
        {list.slice(0, limit).map((e) => {
          const k = textKey(e.en, e.ar);
          return <div className="adm-text" key={k}><small className="adm-area">{A(e.area, AREA_AR[e.area] ?? e.area)}</small><BiInput value={d.texts?.[k] ?? [e.en, e.ar]} def={[e.en, e.ar]} multi={e.en.length > 70} onChange={(v) => setText(e.en, e.ar, v)} /></div>;
        })}
      </div>
      {list.length > limit && <button type="button" className="adm-add" onClick={() => setLimit(limit + 60)}>{A('Show more', 'عرض المزيد')} ({list.length - limit})</button>}
      {!list.length && <p className="adm-empty">{A('No texts match.', 'لا توجد نصوص مطابقة.')}</p>}
    </Section>
  );
}

// ---------- Service pages ----------
function ServicesTab({ svcOf, setSvc, d, setPhoto, base }: { svcOf: (s: string) => Service; setSvc: <K extends keyof ServicePatch>(slug: string, key: K, value: ServicePatch[K]) => void; d: Overrides; setPhoto: (p: string, id?: string) => void; base: string }) {
  const { A } = useA();
  const [slug, setSlug] = useState(allServices[0].slug);
  const s = svcOf(slug); const b = svcBySlug(slug);
  const set = <K extends keyof ServicePatch>(k: K) => (v: ServicePatch[K]) => setSvc(slug, k, v);
  const edited = !!d.services?.[slug];
  const restore = () => (Object.keys(d.services?.[slug] ?? {}) as (keyof ServicePatch)[]).forEach((k) => setSvc(slug, k, b[k as keyof Service] as never));
  return (
    <>
      <div className="adm-svc-pick">
        {allServices.map((x) => <button type="button" key={x.slug} className={`${x.slug === slug ? 'is-active' : ''}${d.services?.[x.slug] ? ' is-edited' : ''}`} onClick={() => setSlug(x.slug)}>{A(svcOf(x.slug).name[0], svcOf(x.slug).name[1])}</button>)}
      </div>
      <Section title={A(s.name[0], s.name[1])} icon={<ListChecks size={18} />} actions={<div className="adm-inline">{edited && <button type="button" className="adm-btn" onClick={restore}><RotateCcw size={15} />{A('Restore this page', 'استرجاع هذه الصفحة')}</button>}<a className="adm-btn" href={`${base}${s.path}`} target="_blank" rel="noopener"><ExternalLink size={15} />{A('Open page', 'فتح الصفحة')}</a></div>}>
        <BannerPhoto path={b.hero.src} d={d} setPhoto={setPhoto} />
        <BiInput label={A('Page name', 'اسم الصفحة')} value={s.name} def={b.name} onChange={set('name')} />
        <BiInput label={A('Small label above the title', 'العنوان الصغير فوق العنوان')} value={s.kicker} def={b.kicker} onChange={set('kicker')} />
        <BiInput label={A('Headline', 'العنوان الرئيسي')} value={s.headline} def={b.headline} onChange={set('headline')} multi />
        <BiInput label={A('Introduction', 'المقدمة')} value={s.intro} def={b.intro} onChange={set('intro')} multi />
      </Section>
      {(s.body?.length || b.body) && <Section title={A('More paragraphs', 'فقرات إضافية')}><Rows items={s.body ?? []} onChange={set('body')} make={(): Bi => ['', '']} addLabel={A('Add paragraph', 'إضافة فقرة')} render={(it, put) => <BiInput value={it} onChange={put} multi />} /></Section>}
      <Section title={A('Highlights', 'أبرز النقاط')}><Rows items={s.highlights} onChange={set('highlights')} make={(): Bi => ['', '']} addLabel={A('Add highlight', 'إضافة نقطة')} render={(it, put) => <BiInput value={it} onChange={put} />} /></Section>
      <Section title={A('Prices & details', 'الأسعار والتفاصيل')} intro={A('Each row shows a label and a value, with the date it was published. Tick "Past" for an offer that has ended.', 'كل سطر فيه عنوان وقيمة وتاريخ النشر. اختر «سابق» للعرض المنتهي.')}>
        <Rows items={s.facts} onChange={set('facts')} make={(): ServiceFact => ({ label: ['', ''], value: ['', ''], date: new Date().toISOString().slice(0, 10), source: '' })} addLabel={A('Add row', 'إضافة سطر')} title={(f) => A(f.label[0] || 'New row', f.label[1] || 'سطر جديد')}
          render={(f, put) => <><BiInput label={A('Label', 'العنوان')} value={f.label} onChange={(v) => put({ ...f, label: v })} /><BiInput label={A('Value', 'القيمة')} value={f.value} onChange={(v) => put({ ...f, value: v })} multi /><div className="adm-grid3"><Field type="date" label={A('Published', 'تاريخ النشر')} value={f.date} onChange={(v) => put({ ...f, date: v })} /><Field label={A('Source link (optional)', 'رابط المصدر (اختياري)')} dir="ltr" value={f.source} invalid={!urlOk(f.source)} onChange={(v) => put({ ...f, source: v })} /><label className="adm-check adm-check-field"><input type="checkbox" checked={!!f.past} onChange={(e) => put({ ...f, past: e.target.checked || undefined })} />{A('Past (ended)', 'سابق (منتهي)')}</label></div></>} />
      </Section>
      {s.menu && <MenuEditor menu={s.menu} onChange={set('menu')} />}
      {(s.timeline || slug === 'offers') && <Section title={A('News & offers timeline', 'سجل الأخبار والعروض')} intro={A('Newest first. Add a row to announce a new offer, holiday hours or an event.', 'الأحدث أولاً. أضف سطراً لإعلان عرض جديد أو دوام عطلة أو فعالية.')}>
        <Rows items={s.timeline ?? []} onChange={set('timeline')} make={(): TimelineItem => ({ date: new Date().toISOString().slice(0, 10), tag: 'offer', title: ['', ''], source: '' })} addLabel={A('Add news or offer', 'إضافة خبر أو عرض')} title={(t) => `${t.date} · ${A(t.title[0] || 'New', t.title[1] || 'جديد')}`}
          render={(t, put) => <><div className="adm-grid3"><Field type="date" label={A('Date', 'التاريخ')} value={t.date} onChange={(v) => put({ ...t, date: v })} /><label className="adm-field"><span className="adm-label">{A('Type', 'النوع')}</span><select value={t.tag} onChange={(e) => put({ ...t, tag: e.target.value as TimelineTag })}>{TAGS.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select></label><Field label={A('Link (optional)', 'رابط (اختياري)')} dir="ltr" value={t.source} invalid={!urlOk(t.source)} onChange={(v) => put({ ...t, source: v })} /></div><BiInput label={A('Title', 'العنوان')} value={t.title} onChange={(v) => put({ ...t, title: v })} /><BiInput label={A('Details', 'التفاصيل')} value={t.text ?? ['', '']} onChange={(v) => put({ ...t, text: v })} multi /></>} />
      </Section>}
      <Section title={A('Questions & answers', 'أسئلة وأجوبة')}><Rows items={s.faqs} onChange={set('faqs')} make={(): ServiceFaq => ({ q: ['', ''], a: ['', ''] })} addLabel={A('Add question', 'إضافة سؤال')} title={(f) => A(f.q[0] || 'New question', f.q[1] || 'سؤال جديد')} render={(f, put) => <><BiInput label={A('Question', 'السؤال')} value={f.q} onChange={(v) => put({ ...f, q: v })} /><BiInput label={A('Answer', 'الجواب')} value={f.a} onChange={(v) => put({ ...f, a: v })} multi /></>} /></Section>
      {s.phone && <Section title={A('Phone on this page', 'الهاتف في هذه الصفحة')}><div className="adm-grid3"><Field label={A('Number as shown', 'الرقم كما يظهر')} dir="ltr" value={s.phone.display} onChange={(v) => set('phone')({ ...s.phone!, display: v })} /><Field label={A('Number to dial', 'الرقم للاتصال')} dir="ltr" value={s.phone.tel} hint="+9627…" onChange={(v) => set('phone')({ ...s.phone!, tel: v.replace(/[^\d+]/g, '') })} /></div><BiInput label={A('Button text', 'نص الزر')} value={s.phone.label} onChange={(v) => set('phone')({ ...s.phone!, label: v })} /></Section>}
    </>
  );
}

function MenuEditor({ menu, onChange }: { menu: NonNullable<Service['menu']>; onChange: (m: NonNullable<Service['menu']>) => void }) {
  const { A } = useA();
  return (
    <Section title={A('Menu', 'المنيو')} icon={<Tag size={18} />} intro={A('Sections, dishes and prices in JD.', 'الأقسام والأطباق والأسعار بالدينار.')}>
      <BiInput label={A('Note under the menu', 'ملاحظة تحت المنيو')} value={menu.note} onChange={(v) => onChange({ ...menu, note: v })} multi />
      <Rows items={menu.sections} onChange={(sections) => onChange({ ...menu, sections })} make={(): MenuSection => ({ title: ['', ''], items: [] })} addLabel={A('Add menu section', 'إضافة قسم')} title={(s) => A(s.title[0] || 'New section', s.title[1] || 'قسم جديد')}
        render={(sec, putSec) => <>
          <BiInput label={A('Section title', 'اسم القسم')} value={sec.title} onChange={(v) => putSec({ ...sec, title: v })} />
          <Rows items={sec.items} onChange={(items) => putSec({ ...sec, items })} make={(): MenuSection['items'][number] => ({ name: ['', ''], prices: [{ jd: '' }] })} addLabel={A('Add dish', 'إضافة طبق')} title={(it) => A(it.name[0] || 'New dish', it.name[1] || 'طبق جديد')}
            render={(it, putIt) => <>
              <BiInput label={A('Dish', 'الطبق')} value={it.name} onChange={(v) => putIt({ ...it, name: v })} />
              <BiInput label={A('Description (optional)', 'الوصف (اختياري)')} value={it.desc ?? ['', '']} onChange={(v) => putIt({ ...it, desc: v })} />
              <div className="adm-prices">{it.prices.map((p, j) => <div key={j} className="adm-price"><Field label={A('Price JD', 'السعر بالدينار')} dir="ltr" value={p.jd} onChange={(v) => putIt({ ...it, prices: it.prices.map((x, k) => (k === j ? { ...x, jd: v } : x)) })} /><BiInput label={A('Size / option (optional)', 'الحجم / الخيار (اختياري)')} value={p.label ?? ['', '']} onChange={(v) => putIt({ ...it, prices: it.prices.map((x, k) => (k === j ? { ...x, label: v[0] || v[1] ? v : undefined } : x)) })} />{it.prices.length > 1 && <button type="button" className="adm-icon is-danger" aria-label={A('Remove price', 'حذف السعر')} onClick={() => putIt({ ...it, prices: it.prices.filter((_, k) => k !== j) })}><Trash2 size={15} /></button>}</div>)}
                <button type="button" className="adm-link" onClick={() => putIt({ ...it, prices: [...it.prices, { jd: '' }] })}><Plus size={14} />{A('Add another price', 'إضافة سعر آخر')}</button></div>
            </>} />
        </>} />
    </Section>
  );
}

function BannerPhoto({ path, d, setPhoto }: { path: string; d: Overrides; setPhoto: (p: string, id?: string) => void }) {
  const urls = usePhotoUrls(d.photos);
  const id = d.photos?.[path];
  return <div className="adm-banner"><PhotoCard entry={{ path, group: '', label: ['Page banner photo', 'صورة واجهة الصفحة'] }} src={id ? urls[id] : undefined} replaced={!!id} setPhoto={setPhoto} /></div>;
}

// ---------- Plans & prices (the /prices page) ----------
function PlansEditor({ plans, setPlans }: { plans: PlanCategory[]; setPlans: (v: PlanCategory[]) => void }) {
  const { A } = useA();
  const [cid, setCid] = useState(plans[0]?.id ?? '');
  const ci = Math.max(0, plans.findIndex((c) => c.id === cid));
  const cat = plans[ci];
  const setCat = (c: PlanCategory) => setPlans(plans.map((x, i) => (i === ci ? c : x)));
  const examples = plans.reduce((n, c) => n + c.plans.filter((p) => p.example).length, 0);
  const edited = !same(plans, planCategories);
  return (
    <Section title={A('Plans & prices page', 'صفحة الأسعار والاشتراكات')} icon={<Tag size={18} />}
      intro={A('The prices visitors see on Plans & prices, the home page and in My membership. Prices marked Example show a * on the site and a note that the team confirms the price.', 'الأسعار اللي بيشوفها الزوار بصفحة الأسعار والرئيسية و«اشتراكي». الأسعار المعلّمة «تقريبي» بتظهر مع * وملاحظة إن الفريق بيأكد السعر.')}
      actions={<div className="adm-inline">{examples > 0 && <span className="adm-chip">{examples} {A('example prices', 'أسعار تقريبية')}</span>}{edited && <button type="button" className="adm-link" onClick={() => setPlans(planCategories)}><RotateCcw size={13} />{A('Restore all', 'استرجاع الكل')}</button>}</div>}>
      <div className="adm-svc-pick">{plans.map((c) => <button type="button" key={c.id} className={c.id === cat?.id ? 'is-active' : ''} onClick={() => setCid(c.id)}>{A(c.name[0], c.name[1])}{c.plans.some((p) => p.example) ? ' *' : ''}</button>)}</div>
      {cat && <>
        <BiInput label={A('Category name', 'اسم القسم')} value={cat.name} onChange={(v) => setCat({ ...cat, name: v })} />
        <BiInput label={A('Who it is for', 'لمين')} value={cat.audience} onChange={(v) => setCat({ ...cat, audience: v })} />
        <h3 className="adm-sub">{A('What’s included', 'شو بيشمل')}</h3>
        <Rows items={cat.includes} onChange={(v) => setCat({ ...cat, includes: v })} make={(): Bi => ['', '']} addLabel={A('Add line', 'إضافة سطر')} render={(it, put) => <BiInput value={it} onChange={put} />} />
        <h3 className="adm-sub">{A('Plans', 'الاشتراكات')}</h3>
        <Rows items={cat.plans} onChange={(v) => setCat({ ...cat, plans: v })} make={(): Plan => ({ id: `${cat.id}-${Date.now().toString(36)}`, label: ['', ''], price: 0 })} addLabel={A('Add plan', 'إضافة اشتراك')}
          title={(p) => `${A(p.label[0] || 'New plan', p.label[1] || 'اشتراك جديد')} · ${p.price} JD${p.example ? ' *' : ''}`}
          render={(p, put) => <>
            <BiInput label={A('Name', 'الاسم')} value={p.label} placeholder={['3 months', '٣ أشهر']} onChange={(v) => put({ ...p, label: v })} />
            <div className="adm-grid3">
              <Field type="number" label={A('Price (JD)', 'السعر (دينار)')} value={String(p.price)} onChange={(v) => put({ ...p, price: Math.max(0, Number(v) || 0) })} />
              <Field type="number" label={A('Length in months (optional)', 'المدة بالأشهر (اختياري)')} value={p.months ? String(p.months) : ''} hint={A('Used for the end date and “per month”', 'لحساب تاريخ الانتهاء و«بالشهر»')} onChange={(v) => { const n = parseInt(v, 10); put({ ...p, months: n >= 1 && n <= 24 ? n : undefined }); }} />
              <div className="adm-checks-col"><label className="adm-check"><input type="checkbox" checked={!!p.example} onChange={(e) => put({ ...p, example: e.target.checked || undefined })} />{A('Example price (not confirmed)', 'سعر تقريبي (غير مؤكد)')}</label><label className="adm-check"><input type="checkbox" checked={!!p.popular} onChange={(e) => put({ ...p, popular: e.target.checked || undefined })} />{A('Most popular', 'الأكثر طلباً')}</label></div>
            </div>
            <BiInput label={A('Unit (optional)', 'الوحدة (اختياري)')} value={p.unit ?? ['', '']} placeholder={['per session', 'للحصة']} onChange={(v) => put({ ...p, unit: v[0] || v[1] ? v : undefined })} />
            <BiInput label={A('Note (optional)', 'ملاحظة (اختياري)')} value={p.note ?? ['', '']} onChange={(v) => put({ ...p, note: v[0] || v[1] ? v : undefined })} />
          </>} />
      </>}
    </Section>
  );
}

// ---------- Prices ----------
function PricesTab({ svcOf, setSvc }: { svcOf: (s: string) => Service; setSvc: <K extends keyof ServicePatch>(slug: string, key: K, value: ServicePatch[K]) => void }) {
  const { A } = useA();
  const groups = allServices.map((b) => { const s = svcOf(b.slug); return { s, b, rows: s.facts.map((f, i) => ({ f, i })).filter(({ f }) => PRICE.test(f.value[0] + f.value[1] + f.label[0])) }; }).filter((g) => g.rows.length || g.s.menu);
  return (
    <>
      <Section title={A('Prices & offers', 'الأسعار والعروض')} icon={<Tag size={18} />} intro={A('Every price on the site in one place. To add a new price or offer, open the service in Service pages. To announce it on the News & offers page, add it to that page’s timeline.', 'كل الأسعار في الموقع بمكان واحد. لإضافة سعر أو عرض جديد افتح الخدمة من «صفحات الخدمات». ولإعلانه في صفحة الأخبار والعروض أضفه لسجلّها.')} />
      {groups.map(({ s, b, rows }) => (
        <Section key={s.slug} title={A(s.name[0], s.name[1])}>
          {rows.map(({ f, i }) => {
            const def = b.facts[i] && same(b.facts[i].label, f.label) ? b.facts[i].value : undefined;
            return <div className="adm-price-row" key={i}><div className="adm-price-label"><b>{A(f.label[0], f.label[1])}</b><small>{f.date}{f.past && ` · ${A('past', 'سابق')}`}</small></div>
              <BiInput value={f.value} def={def} onChange={(v) => setSvc(s.slug, 'facts', s.facts.map((x, j) => (j === i ? { ...x, value: v } : x)))} />
              <label className="adm-check"><input type="checkbox" checked={!!f.past} onChange={(e) => setSvc(s.slug, 'facts', s.facts.map((x, j) => (j === i ? { ...x, past: e.target.checked || undefined } : x)))} />{A('Ended', 'منتهي')}</label></div>;
          })}
          {s.menu && <div className="adm-menu-prices"><h3>{A('Menu prices (JD)', 'أسعار المنيو (دينار)')}</h3>{s.menu.sections.map((sec, si) => <div key={si} className="adm-menu-sec"><h4>{A(sec.title[0], sec.title[1])}</h4>{sec.items.map((it, ii) => <div key={ii} className="adm-menu-item"><span>{A(it.name[0], it.name[1])}</span><div>{it.prices.map((p, pi) => {
            const baseJd = b.menu?.sections[si]?.items[ii]?.prices[pi]?.jd;
            return <label key={pi} className={baseJd !== undefined && baseJd !== p.jd ? 'is-edited' : ''}>{p.label && <small>{A(p.label[0], p.label[1])}</small>}<input dir="ltr" inputMode="decimal" value={p.jd} aria-label={`${it.name[0]} ${p.label?.[0] ?? ''}`} onChange={(e) => {
              const menu = structuredClone(s.menu!); menu.sections[si].items[ii].prices[pi].jd = e.target.value; setSvc(s.slug, 'menu', menu);
            }} /></label>;
          })}</div></div>)}</div>)}</div>}
        </Section>
      ))}
    </>
  );
}

// ---------- Timetable ----------
function ScheduleTab({ sched, setSched }: { sched: { days: ScheduleDay[]; classes: ScheduledClass[] }; setSched: (s: { days: ScheduleDay[]; classes: ScheduledClass[] }) => void }) {
  const { A } = useA();
  const edited = !same(sched.days, baseDays) || !same(sched.classes, baseClasses);
  const setDay = (i: number, v: ScheduleDay) => {
    const old = sched.days[i];
    setSched({ days: sched.days.map((x, j) => (j === i ? v : x)), classes: old.en !== v.en ? sched.classes.map((c) => (c.day === old.en ? { ...c, day: v.en } : c)) : sched.classes });
  };
  const setClass = (idx: number, v: ScheduledClass | null) => setSched({ ...sched, classes: v ? sched.classes.map((c, j) => (j === idx ? v : c)) : sched.classes.filter((_, j) => j !== idx) });
  const shiftWeek = (days: number) => setSched({ ...sched, days: sched.days.map((x) => { const dt = new Date(`${x.date}T12:00:00Z`); dt.setUTCDate(dt.getUTCDate() + days); return { ...x, date: dt.toISOString().slice(0, 10) }; }) });
  return (
    <Section title={A('Class timetable', 'جدول الحصص')} icon={<CalendarDays size={18} />}
      intro={A('The women’s group timetable on the Classes page, the home page and the service pages. For a new week, move the dates forward, then edit the classes.', 'جدول الحصص الجماعية للسيدات في صفحة الحصص والرئيسية وصفحات الخدمات. لأسبوع جديد قدّم التواريخ ثم عدّل الحصص.')}
      actions={<div className="adm-inline"><button type="button" className="adm-btn" onClick={() => shiftWeek(7)}><CalendarDays size={15} />{A('Move to next week', 'نقل للأسبوع القادم')}</button>{edited && <button type="button" className="adm-btn" onClick={() => setSched({ days: baseDays, classes: baseClasses })}><RotateCcw size={15} />{A('Restore published timetable', 'استرجاع الجدول المنشور')}</button>}</div>}>
      <p className="adm-intro adm-tip">{A('Tip: the week label (e.g. “7–12 NOVEMBER 2026”) is a text — change it in Website texts → Classes.', 'ملاحظة: عنوان الأسبوع (مثل «٧–١٢ نوفمبر ٢٠٢٦») نص يُعدّل من «نصوص الموقع ← الحصص».')}</p>
      <div className="adm-days">
        {sched.days.map((day, i) => {
          const rows = sched.classes.map((c, idx) => ({ c, idx })).filter(({ c }) => c.day === day.en).sort((a, b) => to24(a.c).localeCompare(to24(b.c)));
          return (
            <div className="adm-day" key={i}>
              <div className="adm-day-head">
                <input dir="ltr" value={day.en} aria-label={A('Day (English)', 'اليوم (إنجليزي)')} onChange={(e) => setDay(i, { ...day, en: e.target.value })} />
                <input dir="rtl" value={day.ar} aria-label={A('Day (Arabic)', 'اليوم (عربي)')} onChange={(e) => setDay(i, { ...day, ar: e.target.value })} />
                <input type="date" value={day.date} aria-label={A('Date', 'التاريخ')} onChange={(e) => setDay(i, { ...day, date: e.target.value })} />
                <button type="button" className="adm-icon is-danger" aria-label={A('Remove day', 'حذف اليوم')} onClick={() => setSched({ days: sched.days.filter((_, j) => j !== i), classes: sched.classes.filter((c) => c.day !== day.en) })}><Trash2 size={15} /></button>
              </div>
              <div className="adm-class-list">
                {rows.map(({ c, idx }) => (
                  <div className="adm-class" key={idx}>
                    <input type="time" value={to24(c)} aria-label={A('Start time', 'وقت البدء')} onChange={(e) => e.target.value && setClass(idx, { ...c, ...from24(e.target.value) })} />
                    <input dir="ltr" value={c.name} placeholder="Class" aria-label={A('Class (English)', 'الحصة (إنجليزي)')} onChange={(e) => setClass(idx, { ...c, name: e.target.value })} />
                    <input dir="rtl" value={c.ar} placeholder="الحصة" aria-label={A('Class (Arabic)', 'الحصة (عربي)')} onChange={(e) => setClass(idx, { ...c, ar: e.target.value })} />
                    <input dir="ltr" value={c.coach} placeholder="COACH" aria-label={A('Coach', 'المدربة')} onChange={(e) => setClass(idx, { ...c, coach: e.target.value.toUpperCase() })} />
                    <select value={c.category} aria-label={A('Type', 'النوع')} onChange={(e) => setClass(idx, { ...c, category: e.target.value as ClassCategory })}>{CATS.map(([v, en, ar]) => <option key={v} value={v}>{A(en, ar)}</option>)}</select>
                    <button type="button" className="adm-icon is-danger" aria-label={A('Delete class', 'حذف الحصة')} onClick={() => setClass(idx, null)}><Trash2 size={15} /></button>
                  </div>
                ))}
                <button type="button" className="adm-link" onClick={() => setSched({ ...sched, classes: [...sched.classes, { day: day.en, time: '6:00', period: 'PM', name: '', ar: '', coach: '', category: 'cardio' }] })}><Plus size={14} />{A('Add class', 'إضافة حصة')}</button>
              </div>
            </div>
          );
        })}
      </div>
      {sched.days.length < 7 && <button type="button" className="adm-add" onClick={() => { const last = sched.days[sched.days.length - 1]; const dt = new Date(`${last?.date ?? new Date().toISOString().slice(0, 10)}T12:00:00Z`); dt.setUTCDate(dt.getUTCDate() + 1); setSched({ ...sched, days: [...sched.days, { en: 'Friday', ar: 'الجمعة', date: dt.toISOString().slice(0, 10) }] }); }}><Plus size={15} />{A('Add day', 'إضافة يوم')}</button>}
    </Section>
  );
}

// ---------- Contact & hours ----------
function ContactTab({ contact, setContact, hours, setHours }: { contact: Contact; setContact: <K extends keyof Contact>(k: K, v: Contact[K]) => void; hours: HoursRow[]; setHours: (r: HoursRow[]) => void }) {
  const { A } = useA();
  const dirty = <K extends keyof Contact>(k: K) => !same(contact[k], baseContact[k]);
  const r = <K extends keyof Contact>(k: K) => (dirty(k) ? <button type="button" className="adm-link" onClick={() => setContact(k, baseContact[k])}><RotateCcw size={13} />{A('Restore', 'استرجاع')}</button> : null);
  const ad: Bi = [contact.address.en, contact.address.ar];
  return (
    <>
      <Section title={A('Phones & messages', 'الهواتف والرسائل')} icon={<Phone size={18} />} intro={A('Used in the top bar, the call button, the footer, the contact page and the service pages.', 'تظهر في الشريط العلوي وزر الاتصال والتذييل وصفحة التواصل وصفحات الخدمات.')} actions={r('phones')}>
        <Rows items={contact.phones} onChange={(v) => setContact('phones', v)} make={() => ({ display: '', tel: '+962' })} addLabel={A('Add phone', 'إضافة هاتف')} title={(p) => p.display || A('New phone', 'هاتف جديد')}
          render={(p, put) => <div className="adm-grid3"><Field label={A('Number as shown', 'الرقم كما يظهر')} dir="ltr" value={p.display} hint="079 215 1000" onChange={(v) => put({ ...p, display: v })} /><Field label={A('Number to dial', 'الرقم للاتصال')} dir="ltr" value={p.tel} hint="+962792151000" onChange={(v) => put({ ...p, tel: v.replace(/[^\d+]/g, '') })} /></div>} />
        <div className="adm-grid3">
          <Field label={<>{A('WhatsApp number', 'رقم الواتساب')} {r('whatsapp')}</>} dir="ltr" value={contact.whatsapp} hint={A('Country code, no + or spaces: 9627…', 'مع رمز الدولة بدون + أو مسافات: ‎9627…')} invalid={!/^\d{8,15}$/.test(contact.whatsapp)} onChange={(v) => setContact('whatsapp', v.replace(/\D/g, ''))} />
          <Field label={<>{A('E-mail', 'البريد الإلكتروني')} {r('email')}</>} dir="ltr" type="email" value={contact.email} onChange={(v) => setContact('email', v)} />
        </div>
        <div className="adm-grid3">
          <Field label={<>{A('Lounge phone (shown)', 'هاتف اللاونج (كما يظهر)')} {r('loungePhone')}</>} dir="ltr" value={contact.loungePhone.display} onChange={(v) => setContact('loungePhone', { ...contact.loungePhone, display: v })} />
          <Field label={A('Lounge phone (dial)', 'هاتف اللاونج (للاتصال)')} dir="ltr" value={contact.loungePhone.tel} onChange={(v) => setContact('loungePhone', { ...contact.loungePhone, tel: v.replace(/[^\d+]/g, '') })} />
        </div>
        <div className="adm-grid3">
          <Field label={<>{A('Careers WhatsApp (shown)', 'واتساب الوظائف (كما يظهر)')} {r('careersWhatsapp')}</>} dir="ltr" value={contact.careersWhatsapp.display} onChange={(v) => setContact('careersWhatsapp', { ...contact.careersWhatsapp, display: v })} />
          <Field label={A('Careers WhatsApp (9627…)', 'واتساب الوظائف (9627…)')} dir="ltr" value={contact.careersWhatsapp.number} onChange={(v) => setContact('careersWhatsapp', { ...contact.careersWhatsapp, number: v.replace(/\D/g, '') })} />
        </div>
      </Section>
      <Section title={A('Address, map & social', 'العنوان والخريطة والتواصل الاجتماعي')} actions={r('address')}>
        <BiInput label={A('Address', 'العنوان')} value={ad} onChange={(v) => setContact('address', { en: v[0], ar: v[1] })} />
        <div className="adm-grid2">
          {(['instagram', 'facebook', 'mapsUrl', 'directionsUrl', 'mapEmbed'] as const).map((k) => <Field key={k} dir="ltr" label={<>{({ instagram: 'Instagram', facebook: 'Facebook', mapsUrl: A('Google Maps link', 'رابط خرائط جوجل'), directionsUrl: A('Directions link', 'رابط الاتجاهات'), mapEmbed: A('Map embed link', 'رابط الخريطة المضمّنة') })[k]} {r(k)}</>} value={contact[k]} invalid={!urlOk(contact[k])} hint={!urlOk(contact[k]) ? A('Must start with https://', 'يجب أن يبدأ بـ https://') : undefined} onChange={(v) => setContact(k, v)} />)}
        </div>
      </Section>
      <Section title={A('Opening hours', 'أوقات الدوام')} icon={<Clock3 size={18} />} intro={A('The first two rows (men’s and ladies’ gym) drive the “Open now” status in the top bar. A closing time earlier than the opening time means after midnight.', 'أول سطرين (جيم الرجال والسيدات) يحددان حالة «مفتوح الآن» في الشريط العلوي. وقت إغلاق قبل وقت الفتح يعني بعد منتصف الليل.')}
        actions={!same(hours, baseHours) && <button type="button" className="adm-link" onClick={() => setHours(baseHours)}><RotateCcw size={13} />{A('Restore', 'استرجاع')}</button>}>
        <Rows items={hours} onChange={setHours} make={(): HoursRow => ({ id: 'row' + Date.now().toString(36), en: '', ar: '', open: '09:00', close: '17:00', source: '', published: new Date().toISOString().slice(0, 10) })} addLabel={A('Add hours row', 'إضافة سطر دوام')} title={(h) => A(h.en || 'New row', h.ar || 'سطر جديد')}
          render={(h, put) => <><BiInput label={A('Name', 'الاسم')} value={[h.en, h.ar]} onChange={(v) => put({ ...h, en: v[0], ar: v[1] })} /><div className="adm-grid3"><Field type="time" label={A('Opens', 'يفتح')} value={h.open} onChange={(v) => v && put({ ...h, open: v })} /><Field type="time" label={A('Closes', 'يغلق')} value={h.close} onChange={(v) => v && put({ ...h, close: v })} /></div><BiInput label={A('Note (optional)', 'ملاحظة (اختياري)')} value={[h.noteEn ?? '', h.noteAr ?? '']} onChange={(v) => put({ ...h, noteEn: v[0] || undefined, noteAr: v[1] || undefined })} /></>} />
      </Section>
    </>
  );
}

// ---------- Photos ----------
function PhotoCard({ entry, src, replaced, setPhoto, flash }: { entry: PhotoEntry; src?: string; replaced: boolean; setPhoto: (p: string, id?: string) => void; flash?: (k: 'ok' | 'warn', t: string) => void }) {
  const { A } = useA();
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const pick = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/') || f.size > 25e6) { flash?.('warn', A('Choose a JPG, PNG or WebP photo under 25 MB.', 'اختر صورة JPG أو PNG أو WebP أقل من ٢٥ ميغابايت.')); return; }
    setBusy(true);
    try { const blob = await toWebp(f, entry.path.includes('logo') ? 512 : 1920); const id = newPhotoId(); await putPhoto(id, blob); setPhoto(entry.path, id); }
    catch { flash?.('warn', A('This photo could not be read. Try another file.', 'تعذّرت قراءة الصورة. جرّب ملفاً آخر.')); }
    finally { setBusy(false); if (input.current) input.current.value = ''; }
  };
  return (
    <div className={`adm-photo${replaced ? ' is-edited' : ''}`}>
      <div className="adm-photo-img"><img src={src ?? entry.path} alt="" loading="lazy" />{replaced && <span className="adm-chip">{A('Replaced', 'مستبدلة')}</span>}</div>
      <div className="adm-photo-body">
        <b>{A(entry.label[0], entry.label[1])}</b>
        <div className="adm-inline">
          <label className="adm-btn adm-upload">{busy ? A('Saving…', 'جارٍ الحفظ…') : <><Upload size={15} />{A('Replace', 'استبدال')}</>}<input ref={input} type="file" accept="image/*" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} /></label>
          {replaced && <button type="button" className="adm-btn" onClick={() => setPhoto(entry.path)}><RotateCcw size={15} />{A('Original', 'الأصلية')}</button>}
        </div>
      </div>
    </div>
  );
}

function PhotosTab({ d, setPhoto, flash }: { d: Overrides; setPhoto: (p: string, id?: string) => void; flash: (k: 'ok' | 'warn', t: string) => void }) {
  const { A } = useA();
  const urls = usePhotoUrls(d.photos);
  const groups = Array.from(new Set(photos.map((p) => p.group)));
  return (
    <>
      <Section title={A('Photos', 'الصور')} icon={<ImageIcon size={18} />} intro={A('Replace any photo on the site. Photos are resized to WebP automatically. Instagram post photos stay as they were published.', 'استبدل أي صورة في الموقع. يتم تصغير الصور إلى WebP تلقائياً. صور منشورات إنستغرام تبقى كما نُشرت.')} />
      {groups.map((g) => (
        <Section key={g} title={A(g, GROUP_AR[g] ?? g)}>
          <div className="adm-photos">{photos.filter((p) => p.group === g).map((p) => { const id = d.photos?.[p.path]; return <PhotoCard key={p.path} entry={p} src={id ? urls[id] : undefined} replaced={!!id} setPhoto={setPhoto} flash={flash} />; })}</div>
        </Section>
      ))}
    </>
  );
}

// ---------- Colours & announcement ----------
function AppearanceTab({ d, update }: { d: Overrides; update: (fn: (o: Overrides) => Overrides) => void }) {
  const { A } = useA();
  const accent = d.accent ?? DEFAULT_ACCENT;
  const an = d.announcement ?? { on: false, text: ['', ''] as Bi, href: '' };
  const setAn = (v: typeof an) => update((o) => ({ ...o, announcement: !v.on && !v.text[0] && !v.text[1] && !v.href ? undefined : v }));
  const presets = ['#e73434', '#d97706', '#16a34a', '#0ea5e9', '#7c3aed', '#db2777'];
  return (
    <>
      <Section title={A('Brand colour', 'لون الهوية')} icon={<Palette size={18} />} intro={A('The red used for buttons, highlights and the “+” in the logo.', 'اللون الأحمر المستخدم في الأزرار والإبرازات وعلامة «+».')}
        actions={d.accent && <button type="button" className="adm-link" onClick={() => update((o) => ({ ...o, accent: undefined }))}><RotateCcw size={13} />{A('Restore', 'استرجاع')}</button>}>
        <div className="adm-colors">
          <input type="color" value={accent} aria-label={A('Brand colour', 'لون الهوية')} onChange={(e) => update((o) => ({ ...o, accent: e.target.value.toLowerCase() === DEFAULT_ACCENT ? undefined : e.target.value }))} />
          <code dir="ltr">{accent}</code>
          {presets.map((c) => <button type="button" key={c} className={c === accent ? 'is-active' : ''} style={{ background: c }} aria-label={c} onClick={() => update((o) => ({ ...o, accent: c === DEFAULT_ACCENT ? undefined : c }))} />)}
        </div>
        <div className="adm-color-preview"><span style={{ background: accent }}>{A('Find my membership', 'اختر اشتراكك')}</span><b>BUILT FOR <em style={{ color: accent }}>MORE.</em></b></div>
      </Section>
      <Section title={A('Announcement bar', 'شريط الإعلان')} icon={<Megaphone size={18} />} intro={A('A coloured bar at the very top of every page, for an offer, holiday hours or an event.', 'شريط ملوّن أعلى كل صفحة، لعرض أو دوام عطلة أو فعالية.')}>
        <label className="adm-check adm-switch"><input type="checkbox" checked={an.on} onChange={(e) => setAn({ ...an, on: e.target.checked })} />{A('Show the announcement bar', 'إظهار شريط الإعلان')}</label>
        <BiInput label={A('Message', 'الرسالة')} value={an.text} placeholder={['New Year offer: 3 months for 100 JD', 'عرض السنة الجديدة: ٣ أشهر بـ ١٠٠ دينار']} onChange={(v) => setAn({ ...an, text: v })} />
        <Field label={A('Link when tapped (optional)', 'الرابط عند الضغط (اختياري)')} dir="ltr" value={an.href} hint="/offers · https://wa.me/962…" invalid={!urlOk(an.href)} onChange={(v) => setAn({ ...an, href: v })} />
        {an.on && (an.text[0] || an.text[1]) && <div className="adm-ann-preview" style={{ background: accent }}>{A(an.text[0] || an.text[1], an.text[1] || an.text[0])}</div>}
      </Section>
    </>
  );
}

// ---------- Backup & settings ----------
function SettingsTab({ saved, dirty, onReplaced, flash }: { saved: Overrides; dirty: boolean; onReplaced: () => void; flash: (k: 'ok' | 'warn', t: string) => void }) {
  const { A } = useA();
  const [confirmReset, setConfirmReset] = useState(false);
  const file = useRef<HTMLInputElement>(null);
  const exportJson = async () => {
    const photoData: Record<string, string> = {};
    for (const id of new Set(Object.values(saved.photos ?? {}))) { const b = await getPhoto(id).catch(() => undefined); if (b) photoData[id] = await blobToDataUrl(b); }
    const blob = new Blob([JSON.stringify({ format: 'hydrogen-plus-admin', version: 1, exportedAt: new Date().toISOString(), overrides: saved, photos: photoData })], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `hydrogen-admin-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    window.setTimeout(() => URL.revokeObjectURL(a.href), 1500);
  };
  const importJson = async (f?: File) => {
    if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data?.format !== 'hydrogen-plus-admin') throw new Error('format');
      const o = sanitize(data.overrides);
      const wanted = new Set(Object.values(o.photos ?? {}));
      for (const [id, url] of Object.entries((data.photos ?? {}) as Record<string, unknown>)) {
        if (wanted.has(id) && typeof url === 'string' && /^data:image\/(webp|png|jpeg);base64,/.test(url)) await putPhoto(id, await dataUrlToBlob(url));
      }
      for (const [p, id] of Object.entries(o.photos ?? {})) if (!(await getPhoto(id).catch(() => undefined))) delete o.photos![p];
      writeOverrides(o); onReplaced();
      flash('ok', A('Backup imported and saved.', 'تم استيراد النسخة وحفظها.'));
    } catch { flash('warn', A('This file is not a Hydrogen Plus admin backup.', 'هذا الملف ليس نسخة من لوحة تحكم هايدروجين بلس.')); }
    finally { if (file.current) file.current.value = ''; }
  };
  const reset = async () => {
    writeOverrides(EMPTY); onReplaced(); setConfirmReset(false);
    try { for (const id of await photoIds()) await deletePhoto(id); } catch { /* ignore */ }
    flash('ok', A('All edits removed. The site is back to the published version.', 'تم حذف كل التعديلات. عاد الموقع للنسخة المنشورة.'));
  };
  return (
    <>
      <Section title={A('Backup', 'النسخ الاحتياطي')} icon={<Download size={18} />} intro={A('Export saves all saved edits and replaced photos into one file. Import it in another browser or on another device to continue there. Exporting does not publish anything.', 'التصدير يحفظ كل التعديلات المحفوظة والصور المستبدلة في ملف واحد. استورده في متصفح أو جهاز آخر لتكمل من هناك. التصدير لا ينشر شيئاً.')}>
        {dirty && <p className="adm-warn"><CircleAlert size={16} />{A('You have unsaved changes. Save first to include them in the export.', 'لديك تعديلات غير محفوظة. احفظها أولاً لتدخل في التصدير.')}</p>}
        <div className="adm-inline">
          <button type="button" className="adm-btn adm-primary" onClick={exportJson}><Download size={16} />{A('Export JSON', 'تصدير JSON')}</button>
          <label className="adm-btn adm-upload"><Upload size={16} />{A('Import JSON', 'استيراد JSON')}<input ref={file} type="file" accept="application/json,.json" onChange={(e) => importJson(e.target.files?.[0])} /></label>
        </div>
      </Section>
      <Section title={A('Reset preview', 'إعادة ضبط المعاينة')} icon={<RotateCcw size={18} />} intro={A('Removes every edit and replaced photo from this browser.', 'يحذف كل التعديلات والصور المستبدلة من هذا المتصفح.')}>
        {confirmReset
          ? <div className="adm-inline"><span className="adm-warn"><CircleAlert size={16} />{A('This cannot be undone. Export a backup first if you may need it.', 'لا يمكن التراجع عن هذا. صدّر نسخة أولاً إن احتجتها.')}</span><button type="button" className="adm-btn adm-danger" onClick={reset}><Trash2 size={15} />{A('Yes, remove all edits', 'نعم، احذف كل التعديلات')}</button><button type="button" className="adm-btn" onClick={() => setConfirmReset(false)}>{A('Cancel', 'إلغاء')}</button></div>
          : <button type="button" className="adm-btn adm-danger" onClick={() => setConfirmReset(true)}><Trash2 size={15} />{A('Reset preview', 'إعادة ضبط المعاينة')}</button>}
      </Section>
      <Section title={A('Going live', 'النشر لكل الزوار')} icon={<ExternalLink size={18} />}>
        <p className="adm-intro">{A('Right now this admin works in preview mode on GitHub Pages. When the site is connected to the free Cloudflare server («الربط»), the same screens get a password sign-in and Save publishes to every visitor instantly. Your exported backup can be imported there.', 'حالياً تعمل لوحة التحكم بوضع المعاينة على GitHub Pages. عند ربط الموقع بسيرفر Cloudflare المجاني («الربط») تصبح نفس الشاشات بكلمة مرور ويُنشر الحفظ لكل الزوار فوراً. ويمكن استيراد النسخة المصدّرة هناك.')}</p>
      </Section>
    </>
  );
}

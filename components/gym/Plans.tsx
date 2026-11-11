'use client';
// Plans & prices page, the "choose a plan" dialog and the member's "My membership" panel.
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, BadgeCheck, CalendarDays, Check, CircleAlert, Clock3, MessageCircle, Phone, Sparkles, Tag, X } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { usePlans, useSiteInfo } from '@/lib/admin/overrides';
import { isPreviewHost } from '@/lib/preview-api';
import type { Plan, PlanCategory } from '@/lib/plans';
import type { Bi } from '@/lib/services';
import './plans.css';

const noSub = () => () => {};
const fmtJD = (n: number, lang: 'en' | 'ar') => (lang === 'ar' ? `${n.toLocaleString('ar-JO')} د.أ` : `${n.toLocaleString('en-US')} JD`);
const todayAmman = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman' }).format(new Date());

function perMonth(cat: PlanCategory, p: Plan) {
  if (!p.months || p.months < 2) return null;
  const base = cat.plans.find((x) => x.months === 1 && !x.unit);
  const each = Math.round(p.price / p.months);
  const save = base ? base.price * p.months - p.price : 0;
  return { each, save: save > 0 ? save : 0 };
}

// ---------------------------------------------------------------- choose dialog
type Choice = { cat: PlanCategory; plan: Plan };
function ChooseDialog({ choice, onClose }: { choice: Choice | null; onClose: () => void }) {
  const { t, lang } = useGymLanguage();
  const { contact } = useSiteInfo();
  const ref = useRef<HTMLDialogElement>(null);
  const [state, setState] = useState<{ busy?: boolean; error?: string; done?: string; offline?: boolean }>({});
  const [form, setForm] = useState({ name: '', phone: '', startDate: '', consent: false });
  const L = (b: Bi) => t(b[0], b[1]);
  useEffect(() => {
    const d = ref.current; if (!d) return;
    if (choice && !d.open) { d.showModal(); }
    if (!choice && d.open) d.close();
  }, [choice]);
  if (!choice) return <dialog ref={ref} className="pl-dialog" onClose={onClose} />;
  const { cat, plan } = choice;
  const start = form.startDate || todayAmman();
  const planName = `${cat.name[0]} · ${plan.label[0]}`;
  const waText = encodeURIComponent(`Hello Hydrogen Plus, I would like the ${planName} plan (${plan.price} JD).${state.done ? ` Reference ${state.done}.` : ''}`);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.consent) { setState({ error: t('Please agree to the Privacy Policy and Terms to continue.', 'يُرجى الموافقة على سياسة الخصوصية والشروط للمتابعة.') }); return; }
    setState({ busy: true });
    try {
      const r = await fetch('/api/subscription', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ planId: plan.id, planName, categoryName: cat.name[0], price: plan.price, months: plan.months ?? null, days: plan.days ?? null, startDate: start, name: form.name, phone: form.phone, example: !!plan.example, consent: true }) });
      if (r.status === 404 || r.status === 405) { setState({ offline: true }); return; }
      const data = (await r.json().catch(() => ({}))) as { error?: string; reference?: string };
      if (!r.ok) { setState({ error: data.error ?? t('We couldn’t send your request. Please try again.', 'تعذّر إرسال طلبك. حاول مجدداً.') }); return; }
      setState({ done: data.reference });
    } catch { setState({ offline: true }); }
  }
  return (
    <dialog ref={ref} className="pl-dialog" onClose={() => { setState({}); onClose(); }} aria-labelledby="pl-dialog-title">
      <div className="pl-dialog-card">
        <button type="button" className="pl-dialog-x" aria-label={t('Close', 'إغلاق')} onClick={() => ref.current?.close()}><X size={18} /></button>
        <span className="pl-kicker">{L(cat.name)}</span>
        <h2 id="pl-dialog-title">{L(plan.label)}</h2>
        <p className="pl-dialog-price"><b>{fmtJD(plan.price, lang)}</b>{plan.unit && <span>{L(plan.unit)}</span>}{plan.example && <em>{t('Example price — the team confirms it with you', 'سعر تقريبي — يؤكده الفريق معك')}</em>}</p>
        {state.done ? (
          <div className="pl-done">
            <BadgeCheck size={34} />
            <h3>{t('Request sent', 'تم إرسال الطلب')}</h3>
            <p>{t('Your reference is', 'رقم طلبك')} <b dir="ltr">{state.done}</b>. {t('Pay at reception to activate your plan. You can follow it any time in My training → My membership.', 'ادفع في الاستقبال لتفعيل اشتراكك. تقدر تتابعه أي وقت من «تدريبي ← اشتراكي».')}</p>
            <div className="pl-actions"><a className="hp3-button hp3-red" href="/member?tab=membership">{t('See my membership', 'شاهد اشتراكي')}<ArrowUpRight size={17} /></a><a className="hp3-button hp3-outline" href={`https://wa.me/${contact.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />WhatsApp</a></div>
          </div>
        ) : state.offline ? (
          <div className="pl-done">
            <Phone size={30} />
            <h3>{t('Book this plan by phone or WhatsApp', 'احجز هذا الاشتراك بالهاتف أو واتساب')}</h3>
            <p>{t('Online requests are not available right now. Send us the plan name and we’ll confirm it with you.', 'الطلبات عبر الموقع غير متاحة حالياً. أرسل لنا اسم الاشتراك وسنؤكده معك.')}</p>
            <div className="pl-actions"><a className="hp3-button hp3-red" href={`https://wa.me/${contact.whatsapp}?text=${waText}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} />WhatsApp</a><a className="hp3-button hp3-outline" href={`tel:${contact.phones[0].tel}`} dir="ltr"><Phone size={16} />{contact.phones[0].display}</a></div>
          </div>
        ) : (
          <form className="pl-form" onSubmit={submit}>
            <ol className="pl-mini-steps"><li>{t('Send this request', 'أرسل الطلب')}</li><li>{t('We call to confirm', 'نتصل بك للتأكيد')}</li><li>{t('Pay at reception — your plan starts', 'ادفع في الاستقبال — يبدأ اشتراكك')}</li></ol>
            <label><span>{t('Full name', 'الاسم الكامل')}</span><input required minLength={2} autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label><span>{t('Phone', 'رقم الهاتف')}</span><input required type="tel" inputMode="tel" autoComplete="tel" dir="ltr" placeholder="07X XXX XXXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            {plan.months ? <label><span>{t('Start date', 'تاريخ البدء')}</span><input type="date" min={todayAmman()} value={start} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></label> : null}
            <label className="pl-consent"><input type="checkbox" checked={form.consent} onChange={(e) => setForm({ ...form, consent: e.target.checked })} /><span>{t('I agree to the', 'أوافق على')} <a href="/privacy" target="_blank">{t('Privacy Policy', 'سياسة الخصوصية')}</a> {t('and', 'و')} <a href="/terms" target="_blank">{t('Terms', 'الشروط')}</a></span></label>
            {state.error && <p className="pl-error" role="alert"><CircleAlert size={16} />{state.error}</p>}
            <button className="hp3-button hp3-red pl-submit" disabled={state.busy}>{state.busy ? t('Sending…', 'جارٍ الإرسال…') : t('Request this plan', 'اطلب هذا الاشتراك')}<ArrowUpRight size={17} /></button>
          </form>
        )}
      </div>
    </dialog>
  );
}

// ---------------------------------------------------------------- plan card
function PlanCard({ cat, plan, onChoose }: { cat: PlanCategory; plan: Plan; onChoose: () => void }) {
  const { t, lang } = useGymLanguage();
  const L = (b: Bi) => t(b[0], b[1]);
  const pm = perMonth(cat, plan);
  return (
    <article className={`pl-card${plan.popular ? ' is-popular' : ''}`}>
      {plan.popular && <span className="pl-badge"><Sparkles size={13} />{t('Most popular', 'الأكثر طلباً')}</span>}
      <h4>{L(plan.label)}</h4>
      <p className="pl-price"><b>{fmtJD(plan.price, lang)}</b>{plan.example && <sup title={t('Example price', 'سعر تقريبي')}>*</sup>}</p>
      <p className="pl-sub">{plan.unit ? L(plan.unit) : pm ? `${t('≈', '≈')} ${fmtJD(pm.each, lang)} ${t('a month', 'بالشهر')}` : plan.months === 1 ? t('one month', 'لمدة شهر') : ' '}</p>
      {pm && pm.save > 0 ? <p className="pl-save">{t('Save', 'وفّر')} {fmtJD(pm.save, lang)}</p> : plan.note ? <p className="pl-note">{L(plan.note)}</p> : <p className="pl-note">&nbsp;</p>}
      <button type="button" className={`pl-choose${plan.popular ? ' is-red' : ''}`} onClick={onChoose}>{t('Choose', 'اختر')}<ArrowUpRight size={16} /></button>
    </article>
  );
}

// ---------------------------------------------------------------- /prices
const subHash = (cb: () => void) => { window.addEventListener('hashchange', cb); return () => window.removeEventListener('hashchange', cb); };
const readHash = () => decodeURIComponent(window.location.hash.slice(1));

export function PricesPage() {
  const { t, lang } = useGymLanguage();
  const cats = usePlans();
  const [choice, setChoice] = useState<Choice | null>(null);
  const hash = useSyncExternalStore(subHash, readHash, () => '');
  const cat = cats.find((c) => c.id === hash) ?? cats[0];
  const tabsRef = useRef<HTMLDivElement>(null);
  const L = (b: Bi) => t(b[0], b[1]);
  const from = (c: PlanCategory) => Math.min(...c.plans.map((p) => p.price));
  const sub = (c: PlanCategory) => { const m = c.plans.find((p) => p.months === 1 && !p.unit); return m ? `${t('1 month', 'شهر')} · ${fmtJD(m.price, lang)}` : `${t('from', 'من')} ${fmtJD(from(c), lang)}`; };
  function pick(id: string) {
    if (id === cat?.id) return;
    history.replaceState(history.state, '', `#${id}`);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
    // Bring the section buttons to the top so the chosen plans show right under them.
    const bar = tabsRef.current?.parentElement;
    if (bar) { const top = bar.getBoundingClientRect().top - 8; if (Math.abs(top) > 24) window.scrollBy({ top, behavior: 'smooth' }); }
  }
  function onKey(e: React.KeyboardEvent, i: number) {
    const dir = (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) * (lang === 'ar' ? -1 : 1);
    if (!dir) return;
    e.preventDefault();
    const next = cats[(i + dir + cats.length) % cats.length];
    pick(next.id);
    tabsRef.current?.querySelector<HTMLElement>(`#tab-${next.id}`)?.focus();
  }
  if (!cat) return null;
  return (
    <div className="pl">
      <header className="hp3-container pl-head">
        <span className="hp3-kicker">{t('PLANS & PRICES', 'الأسعار والاشتراكات')}</span>
        <h1>{t('CLEAR PRICES.', 'أسعار واضحة.')}<br /><em>{t('NO SURPRISES.', 'بدون مفاجآت.')}</em></h1>
        <p>{t('Pick a section to see only its plans. Prices are in Jordanian dinars. Choose a plan, send the request, and pay at reception to start.', 'اختر القسم لتشوف اشتراكاته بس. الأسعار بالدينار الأردني. اختر اشتراكك، أرسل الطلب، وادفع في الاستقبال لتبدأ.')}</p>
        <ol className="pl-steps">
          <li><span>1</span><div><b>{t('Choose a plan', 'اختر اشتراكك')}</b><small>{t('Pick a section below', 'اختر القسم تحت')}</small></div></li>
          <li><span>2</span><div><b>{t('Send the request', 'أرسل الطلب')}</b><small>{t('We call you to confirm', 'نتصل بك للتأكيد')}</small></div></li>
          <li><span>3</span><div><b>{t('Pay at reception', 'ادفع في الاستقبال')}</b><small>{t('Follow it in My training', 'تابعه من «تدريبي»')}</small></div></li>
        </ol>
      </header>
      <nav className="hp3-container pl-chips" aria-label={t('Plan sections', 'أقسام الاشتراكات')}>
        <p className="pl-chips-title">{t('Choose a section', 'اختر القسم')}</p>
        <div ref={tabsRef} role="tablist" className="pl-tabs">
          {cats.map((c, i) => {
            const on = c.id === cat.id;
            return (
              <button key={c.id} id={`tab-${c.id}`} type="button" role="tab" aria-selected={on} aria-controls="pl-panel" tabIndex={on ? 0 : -1} className={on ? 'is-active' : ''} onClick={() => pick(c.id)} onKeyDown={(e) => onKey(e, i)}>
                <span>{L(c.name)}</span><small>{sub(c)}</small>
              </button>
            );
          })}
        </div>
      </nav>
      <div className="hp3-container pl-list">
        <section key={cat.id} id="pl-panel" role="tabpanel" aria-labelledby={`tab-${cat.id}`} className="pl-cat">
          <div className="pl-cat-head">
            <div><h2>{L(cat.name)}</h2><p>{L(cat.audience)}</p></div>
            {cat.service && <a href={cat.service === 'gym' ? '/services/gym' : `/services/${cat.service}`} className="pl-more">{t('About this service', 'عن هذه الخدمة')}<ArrowUpRight size={15} /></a>}
          </div>
          {cat.includes.length > 0 && <ul className="pl-includes">{cat.includes.map((x, i) => <li key={i}><Check size={15} />{L(x)}</li>)}</ul>}
          <div className="pl-grid">{cat.plans.map((p) => <PlanCard key={p.id} cat={cat} plan={p} onChoose={() => setChoice({ cat, plan: p })} />)}</div>
          {cat.plans.some((p) => p.example) && <p className="pl-note"><sup>*</sup> {t('Example price — the team confirms the exact price when they call you.', 'سعر تقريبي — يؤكد الفريق السعر النهائي عند الاتصال بك.')}</p>}
        </section>
        <aside className="pl-foot">
          <div className="pl-foot-links">
            <a href="/memberships"><Tag size={16} />{t('Not sure? Take the 1-minute plan finder', 'محتار؟ جرّب دليل الاشتراك بدقيقة')}<ArrowUpRight size={15} /></a>
            <a href="/offers"><Sparkles size={16} />{t('See the latest offers', 'شاهد آخر العروض')}<ArrowUpRight size={15} /></a>
          </div>
        </aside>
      </div>
      <ChooseDialog choice={choice} onClose={() => setChoice(null)} />
    </div>
  );
}

// ---------------------------------------------------------------- home teaser
export function PricesTeaser() {
  const { t, lang } = useGymLanguage();
  const cats = usePlans();
  const men = cats.find((c) => c.id === 'gym-men') ?? cats[0];
  const [choice, setChoice] = useState<Choice | null>(null);
  if (!men) return null;
  const others = cats.filter((c) => c !== men).slice(0, 6);
  const from = (c: PlanCategory) => Math.min(...c.plans.map((p) => p.price));
  return (
    <section className="hp3-container hp3-section pl-teaser">
      <div className="pl-teaser-head"><div><span className="hp3-kicker">{t('PLANS & PRICES', 'الأسعار والاشتراكات')}</span><h2>{t('Simple plans. Clear prices.', 'اشتراكات بسيطة. أسعار واضحة.')}</h2></div><a href="/prices" className="hp3-button hp3-outline">{t('See all prices', 'كل الأسعار')}<ArrowUpRight size={17} /></a></div>
      <h3 className="pl-teaser-sub">{t(men.name[0], men.name[1])}</h3>
      <div className="pl-grid">{men.plans.slice(0, 3).map((p) => <PlanCard key={p.id} cat={men} plan={p} onChoose={() => setChoice({ cat: men, plan: p })} />)}</div>
      <div className="pl-teaser-others">{others.map((c) => <a key={c.id} href={`/prices#${c.id}`}><span>{t(c.name[0], c.name[1])}</span><b>{t('from', 'من')} {fmtJD(from(c), lang)}</b><ArrowUpRight size={15} /></a>)}</div>
      <ChooseDialog choice={choice} onClose={() => setChoice(null)} />
    </section>
  );
}

// ---------------------------------------------------------------- My membership
type Sub = { id: string; reference: string; planName: string; categoryName: string; price: number; months: number | null; days?: number | null; startDate: string; endDate: string | null; status: string; example?: boolean; createdAt: string };
const daysBetween = (a: string, b: string) => Math.round((Date.parse(`${b}T12:00:00Z`) - Date.parse(`${a}T12:00:00Z`)) / 86400000);

async function fetchSubscription(): Promise<{ kind: 'ok'; data: { subscription: Sub | null; history: Sub[] } } | { kind: 'offline' | 'load' }> {
  try {
    const r = await fetch('/api/subscription', { cache: 'no-store' });
    if (r.status === 404 || r.status === 405) return { kind: 'offline' };
    if (!r.ok) return { kind: 'load' };
    return { kind: 'ok', data: await r.json() };
  } catch { return { kind: 'load' }; }
}

export function MyMembership() {
  const { t, lang } = useGymLanguage();
  const cats = usePlans();
  const preview = useSyncExternalStore(noSub, isPreviewHost, () => false);
  const [data, setData] = useState<{ subscription: Sub | null; history: Sub[] } | null>(null);
  const [error, setError] = useState<'offline' | 'load' | ''>('');
  const [busy, setBusy] = useState(false);
  const apply = (res: Awaited<ReturnType<typeof fetchSubscription>>) => { if (res.kind === 'ok') { setData(res.data); setError(''); } else setError(res.kind); };
  const load = async () => apply(await fetchSubscription());
  useEffect(() => { let alive = true; fetchSubscription().then((res) => { if (alive) apply(res); }); return () => { alive = false; }; }, []);
  const fmtDate = (d: string) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${d}T12:00:00Z`));
  const planLabel = (s: Sub) => { for (const c of cats) for (const p of c.plans) if (`${c.name[0]} · ${p.label[0]}` === s.planName) return `${t(c.name[0], c.name[1])} · ${t(p.label[0], p.label[1])}`; return s.planName; };
  async function act(kind: 'cancel' | 'activate') {
    if (!data?.subscription) return; setBusy(true);
    try { await fetch(kind === 'cancel' ? `/api/subscription?id=${data.subscription.id}` : '/api/subscription', kind === 'cancel' ? { method: 'DELETE' } : { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: data.subscription.id, action: 'activate-demo' }) }); await load(); }
    finally { setBusy(false); }
  }
  const popular = useMemo(() => cats.flatMap((c) => c.plans.filter((p) => p.popular).map((p) => ({ c, p }))).slice(0, 3), [cats]);
  if (error === 'offline') return <section className="pl-me"><div className="pl-me-card"><CircleAlert size={22} /><div><h3>{t('Your membership is managed at reception.', 'اشتراكك يُدار من الاستقبال.')}</h3><p>{t('Ask the team about your plan dates, or see all plans and prices.', 'اسأل الفريق عن مواعيد اشتراكك، أو شاهد كل الأسعار.')}</p></div><a className="hp3-button hp3-red" href="/prices">{t('Plans & prices', 'الأسعار والاشتراكات')}<ArrowUpRight size={17} /></a></div></section>;
  if (error === 'load') return <section className="pl-me"><p className="pl-error"><CircleAlert size={16} />{t('We couldn’t load your membership.', 'تعذّر تحميل اشتراكك.')}</p><button className="hp3-button hp3-outline" onClick={() => void load()}>{t('Try again', 'حاول مجدداً')}</button></section>;
  if (!data) return <section className="pl-me"><p className="pl-loading">{t('Loading your membership…', 'جارٍ تحميل اشتراكك…')}</p></section>;
  const s = data.subscription;
  const today = todayAmman();
  const past = data.history.filter((h) => h.id !== s?.id && h.status !== 'replaced').slice(0, 5);
  return (
    <section className="pl-me">
      {!s && (
        <div className="pl-me-empty">
          <h3>{t('You don’t have a plan yet.', 'ما عندك اشتراك لسا.')}</h3>
          <p>{t('Choose a plan, send the request and pay at reception. It will show here with its start and end dates.', 'اختر اشتراكك وأرسل الطلب وادفع في الاستقبال. رح يظهر هون مع تاريخ البداية والنهاية.')}</p>
          <div className="pl-me-quick">{popular.map(({ c, p }) => <a key={p.id} href={`/prices#${c.id}`}><span>{t(c.name[0], c.name[1])} · {t(p.label[0], p.label[1])}</span><b>{fmtJD(p.price, lang)}</b></a>)}</div>
          <a className="hp3-button hp3-red" href="/prices">{t('See all plans & prices', 'شاهد كل الأسعار')}<ArrowUpRight size={17} /></a>
        </div>
      )}
      {s && s.status === 'pending' && (
        <div className="pl-me-card is-pending">
          <div className="pl-me-top"><span className="pl-status is-pending"><Clock3 size={14} />{t('Waiting for payment', 'بانتظار الدفع')}</span><span className="pl-ref" dir="ltr">{s.reference}</span></div>
          <h3>{planLabel(s)}</h3>
          <p className="pl-me-price">{fmtJD(s.price, lang)}{s.example && <sup>*</sup>}</p>
          <dl><div><dt>{t('Requested start', 'تاريخ البدء المطلوب')}</dt><dd>{fmtDate(s.startDate)}</dd></div>{s.months && <div><dt>{t('Length', 'المدة')}</dt><dd>{s.months} {t(s.months === 1 ? 'month' : 'months', s.months === 1 ? 'شهر' : 'أشهر')}</dd></div>}{!s.months && s.days && <div><dt>{t('Length', 'المدة')}</dt><dd>{s.days === 1 ? t('1 day', 'يوم واحد') : `${s.days} ${t('days', 'أيام')}`}</dd></div>}</dl>
          <p className="pl-me-hint"><BadgeCheck size={16} />{t('Pay at reception to activate it — the countdown starts on your first day.', 'ادفع في الاستقبال لتفعيله — العدّ يبدأ من أول يوم.')}</p>
          <div className="pl-actions">
            {preview && <button type="button" className="hp3-button hp3-red" disabled={busy} onClick={() => act('activate')}>{t('Mark as paid (demo)', 'تأكيد الدفع (تجريبي)')}</button>}
            <button type="button" className="hp3-button hp3-outline" disabled={busy} onClick={() => act('cancel')}>{t('Cancel request', 'إلغاء الطلب')}</button>
          </div>
        </div>
      )}
      {s && s.status === 'active' && (() => {
        const total = s.endDate ? daysBetween(s.startDate, s.endDate) + 1 : 0;
        const left = s.endDate ? Math.max(0, daysBetween(today, s.endDate) + 1) : 0;
        const used = total ? Math.min(100, Math.max(0, Math.round(((total - left) / total) * 100))) : 0;
        const soon = s.endDate && left <= 7 && !(s.days && !s.months);
        const cat = cats.find((c) => c.name[0] === s.categoryName);
        return (
          <div className={`pl-me-card is-active${soon ? ' is-soon' : ''}`}>
            <div className="pl-me-top"><span className="pl-status is-active"><BadgeCheck size={14} />{t('Active', 'فعّال')}</span><span className="pl-ref" dir="ltr">{s.reference}</span></div>
            <h3>{planLabel(s)}</h3>
            {s.endDate ? (
              <>
                <div className="pl-days"><b>{left.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-US')}</b><span>{t(left === 1 ? 'day left' : 'days left', 'يوم متبقي')}</span></div>
                <div className="pl-bar" role="progressbar" aria-valuenow={used} aria-valuemin={0} aria-valuemax={100} aria-label={t('Plan used', 'المستخدم من الاشتراك')}><span style={{ width: `${used}%` }} /></div>
                <dl><div><dt>{t('Started', 'بدأ')}</dt><dd>{fmtDate(s.startDate)}</dd></div><div><dt>{t('Ends', 'ينتهي')}</dt><dd>{fmtDate(s.endDate)}</dd></div><div><dt>{t('Paid', 'المدفوع')}</dt><dd>{fmtJD(s.price, lang)}</dd></div></dl>
                {soon && <p className="pl-me-hint is-warn"><CalendarDays size={16} />{t('Your plan ends soon — renew to keep training without a break.', 'اشتراكك قرب يخلص — جدّده لتكمل تمرينك بدون انقطاع.')}</p>}
              </>
            ) : <dl><div><dt>{t('Started', 'بدأ')}</dt><dd>{fmtDate(s.startDate)}</dd></div><div><dt>{t('Paid', 'المدفوع')}</dt><dd>{fmtJD(s.price, lang)}</dd></div></dl>}
            <div className="pl-actions"><a className="hp3-button hp3-red" href={`/prices${cat ? `#${cat.id}` : ''}`}>{t('Renew or change plan', 'جدّد أو غيّر الاشتراك')}<ArrowUpRight size={17} /></a></div>
          </div>
        );
      })()}
      {past.length > 0 && <div className="pl-me-history"><h4>{t('Previous plans', 'اشتراكات سابقة')}</h4>{past.map((h) => <div key={h.id}><span>{planLabel(h)}</span><small>{h.status === 'cancelled' ? t('Cancelled', 'ملغى') : h.endDate ? `${fmtDate(h.startDate)} → ${fmtDate(h.endDate)}` : fmtDate(h.startDate)}</small></div>)}</div>}
    </section>
  );
}

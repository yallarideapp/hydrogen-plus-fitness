'use client';
// "Visit us" page: one short form to book a free club visit (or, from the contact page, send a message).
// Subscriptions live on /prices, so this page no longer asks what you want.
import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, MapPin, MessageCircle, Phone, ShieldCheck, Tag, X } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { useSiteInfo } from '@/lib/admin/overrides';
import { legalConsent, legalError } from '@/lib/legal';
import './experiences.css';
import './visit.css';

type Kind = 'tour' | 'membership' | 'class' | 'training' | 'contact';
const KINDS: Kind[] = ['tour', 'membership', 'class', 'training', 'contact'];
const noSub = () => () => {};
const readSearch = () => window.location.search;
function ammanDay(offset = 0) {
  const d = new Date(Date.now() + offset * 86400000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Amman', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function clock(hm: string, lang: 'en' | 'ar') {
  const [h, m] = hm.split(':').map(Number);
  const d = new Date(Date.UTC(2000, 0, 1, h, m));
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-US', { hour: 'numeric', minute: m ? '2-digit' : undefined, timeZone: 'UTC' }).format(d);
}

export default function VisitForm({ initialKind = '', initialInterest = '', initialDate = '', initialMessage = '' }: { initialKind?: string; initialInterest?: string; initialDate?: string; initialMessage?: string }) {
  const { lang, t } = useGymLanguage();
  const { contact, hours } = useSiteInfo();
  // Links like /join?kind=training&interest=… also work on the static preview, where the server can't read the query.
  const search = useSyncExternalStore(noSub, readSearch, () => '');
  const q = new URLSearchParams(search);
  const rawKind = initialKind || q.get('kind') || 'tour';
  const kind: Kind = KINDS.includes(rawKind as Kind) ? (rawKind as Kind) : 'tour';
  const isMessage = kind === 'contact';
  const topicFromLink = (initialInterest || q.get('interest') || '').slice(0, 160);
  const [topicHidden, setTopicHidden] = useState(false);
  const topic = topicHidden ? '' : topicFromLink;

  const [dayChoice, setDayChoice] = useState<'today' | 'tomorrow' | 'other' | ''>('');
  const [otherDate, setOtherDate] = useState(initialDate || q.get('date') || '');
  const [period, setPeriod] = useState('');
  const [section, setSection] = useState('');
  const [message, setMessage] = useState((initialMessage || q.get('message') || '').slice(0, 1700));
  const [showNote, setShowNote] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const id = useRef('');

  const date = dayChoice === 'today' ? ammanDay(0) : dayChoice === 'tomorrow' ? ammanDay(1) : dayChoice === 'other' ? otherDate : (otherDate && !dayChoice ? otherDate : '');
  const phoneMain = contact.phones[0];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isMessage && message.trim().length < 3) { setError(t('Please write your message.', 'اكتب رسالتك من فضلك.')); return; }
    if (!consent) { setError(legalError(lang)); return; }
    setBusy(true); setError('');
    if (!id.current) id.current = crypto.randomUUID();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          interest: topic.trim() || (isMessage ? undefined : 'Club visit'),
          preferredDate: isMessage ? undefined : date || undefined,
          name, phone,
          message: [!isMessage && period && `Preferred time: ${period}`, !isMessage && section && `Club section: ${section}`, message.trim()].filter(Boolean).join('\n').slice(0, 2000) || undefined,
          consent: true, clientRequestId: id.current,
        }),
      });
      const result = (await res.json()) as { reference?: string; error?: string };
      if (!res.ok) throw new Error(result.error);
      setReference(result.reference ?? '');
    } catch (err) {
      setError(lang === 'en' && err instanceof Error && err.message ? err.message : t('We couldn’t send your request. Try again or call the club.', 'تعذّر إرسال طلبك. حاول مجدداً أو اتصل بالنادي.'));
    } finally { setBusy(false); }
  };

  if (reference) {
    return (
      <div className="hp3-container hp3-booking-success">
        <CheckCircle2 size={60} />
        <span className="hp3-kicker">{isMessage ? t('MESSAGE SENT', 'وصلت رسالتك') : t('VISIT REQUESTED', 'وصل طلب الزيارة')}</span>
        <h1>{isMessage ? t('WE’LL GET', 'رح نرجع') : t('SEE YOU', 'نشوفك')}<br />{isMessage ? t('BACK TO YOU.', 'نتواصل معك.') : t('SOON.', 'قريباً.')}</h1>
        <p>{isMessage ? t('The team will reply by phone. Keep your reference in case you call us.', 'الفريق رح يرد عليك بالهاتف. احتفظ برقم الطلب إذا اتصلت فينا.') : t('The team will call you to confirm the time. Keep your reference in case you call us.', 'الفريق رح يتصل فيك ليأكد الموعد. احتفظ برقم الطلب إذا اتصلت فينا.')}</p>
        <div className="hp3-booking-reference"><small>{t('REQUEST REFERENCE', 'رقم الطلب')}</small><strong>{reference}</strong><span>{t('Waiting for the team to confirm', 'بانتظار تأكيد الفريق')}</span></div>
        <div className="hp3-button-row">
          <a href={`tel:${phoneMain.tel}`} className="hp3-button hp3-red"><Phone size={17} />{t('Call the club', 'اتصل بالنادي')}</a>
          <a href="/prices" className="hp3-button">{t('Plans & prices', 'الأسعار والاشتراكات')}<ArrowUpRight size={17} /></a>
        </div>
      </div>
    );
  }

  const chip = (on: boolean) => (on ? 'vv-chip is-on' : 'vv-chip');
  return (
    <div className="hp3-container vv">
      <header className="vv-head">
        <span className="hp3-kicker">{isMessage ? t('MESSAGE THE CLUB', 'راسل النادي') : t('FREE CLUB VISIT', 'زيارة مجانية للنادي')}</span>
        <h1>{isMessage ? <>{t('SEND US A', 'أرسل لنا')} <em>{t('MESSAGE.', 'رسالة.')}</em></> : <>{t('BOOK A', 'احجز')} <em>{t('FREE VISIT.', 'زيارة مجانية.')}</em></>}</h1>
        <p>{isMessage
          ? t('Write your question and leave your number. The team calls you back.', 'اكتب سؤالك واترك رقمك، والفريق بيتصل فيك.')
          : t('Come and see the club, the equipment and the pool, and meet the team before you pay anything. Pick a day, leave your number and we call you to confirm.', 'تعال شوف النادي والأجهزة والمسبح وتعرّف على الفريق قبل ما تدفع أي شي. اختر اليوم واترك رقمك ونتصل فيك للتأكيد.')}</p>
        <div className="vv-links">
          <a href="/prices"><Tag size={17} /><span><b>{t('Want to subscribe?', 'بدك تشترك؟')}</b> {t('See plans & prices', 'شوف الأسعار والاشتراكات')}</span><ArrowUpRight size={15} /></a>
          {isMessage
            ? <a href="/join"><MapPin size={17} /><span><b>{t('Want to visit?', 'بدك تزورنا؟')}</b> {t('Book a free visit', 'احجز زيارة مجانية')}</span><ArrowUpRight size={15} /></a>
            : <a href="/contact"><MessageCircle size={17} /><span><b>{t('Already a member?', 'مشترك عنا؟')}</b> {t('Contact us for help', 'تواصل معنا للمساعدة')}</span><ArrowUpRight size={15} /></a>}
        </div>
      </header>

      <div className="vv-layout">
        <form className="vv-form" onSubmit={submit} noValidate={false}>
          {topic && (
            <div className="vv-topic"><span>{t('About', 'بخصوص')}</span><b>{topic}</b>
              <button type="button" onClick={() => setTopicHidden(true)} aria-label={t('Remove', 'إزالة')}><X size={15} /></button>
            </div>
          )}

          {!isMessage && (
            <>
              <fieldset className="vv-group">
                <legend>{t('Which day?', 'أي يوم؟')} <small>{t('optional', 'اختياري')}</small></legend>
                <div className="vv-chips">
                  <button type="button" className={chip(dayChoice === 'today')} aria-pressed={dayChoice === 'today'} onClick={() => setDayChoice(dayChoice === 'today' ? '' : 'today')}>{t('Today', 'اليوم')}</button>
                  <button type="button" className={chip(dayChoice === 'tomorrow')} aria-pressed={dayChoice === 'tomorrow'} onClick={() => setDayChoice(dayChoice === 'tomorrow' ? '' : 'tomorrow')}>{t('Tomorrow', 'بكرا')}</button>
                  <button type="button" className={chip(dayChoice === 'other')} aria-pressed={dayChoice === 'other'} onClick={() => setDayChoice(dayChoice === 'other' ? '' : 'other')}>{t('Another day', 'يوم ثاني')}</button>
                </div>
                {dayChoice === 'other' && <input className="vv-input" type="date" min={ammanDay(0)} value={otherDate} onChange={(e) => setOtherDate(e.target.value)} aria-label={t('Choose a day', 'اختر اليوم')} />}
              </fieldset>

              <fieldset className="vv-group">
                <legend>{t('What time?', 'أي وقت؟')} <small>{t('optional', 'اختياري')}</small></legend>
                <div className="vv-chips">
                  {([['Morning', 'Morning', 'الصبح'], ['Afternoon', 'Afternoon', 'العصر'], ['Evening', 'Evening', 'المسا']] as const).map(([v, en, ar]) => (
                    <button key={v} type="button" className={chip(period === v)} aria-pressed={period === v} onClick={() => setPeriod(period === v ? '' : v)}>{t(en, ar)}</button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="vv-group">
                <legend>{t('Which side of the club?', 'أي قسم؟')} <small>{t('optional', 'اختياري')}</small></legend>
                <div className="vv-chips">
                  {([['Men', 'Men’s gym', 'جيم الرجال'], ['Women', 'Ladies’ club', 'نادي السيدات']] as const).map(([v, en, ar]) => (
                    <button key={v} type="button" className={chip(section === v)} aria-pressed={section === v} onClick={() => setSection(section === v ? '' : v)}>{t(en, ar)}</button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          <div className="vv-row">
            <label className="vv-field">{t('Your name', 'اسمك')}<input className="vv-input" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Full name', 'الاسم الكامل')} /></label>
            <label className="vv-field">{t('Phone', 'رقم الهاتف')}<input className="vv-input" autoComplete="tel" type="tel" inputMode="tel" required minLength={7} maxLength={24} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079 000 0000" /></label>
          </div>

          {isMessage || showNote || message
            ? <label className="vv-field">{isMessage ? t('Your message', 'رسالتك') : t('Note (optional)', 'ملاحظة (اختياري)')}<textarea className="vv-input" rows={isMessage ? 5 : 3} maxLength={1700} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('Please avoid medical details.', 'يرجى تجنب التفاصيل الطبية.')} /></label>
            : <button type="button" className="vv-addnote" onClick={() => setShowNote(true)}>+ {t('Add a note', 'أضف ملاحظة')}</button>}

          <label className="vv-consent"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>{legalConsent(lang)} <a href={lang === 'ar' ? '/ar/privacy' : '/privacy'} target="_blank" rel="noopener noreferrer">{t('Privacy', 'الخصوصية')}</a> · <a href={lang === 'ar' ? '/ar/terms' : '/terms'} target="_blank" rel="noopener noreferrer">{t('Terms', 'الشروط')}</a></span></label>

          {error && <p className="vv-error" role="alert">{error}</p>}
          <button className="hp3-button hp3-red vv-send" disabled={busy} type="submit">
            {busy ? t('Sending…', 'جارٍ الإرسال…') : isMessage ? t('Send message', 'أرسل الرسالة') : t('Book my free visit', 'احجز زيارتي')}<ArrowUpRight size={17} />
          </button>
          <p className="vv-small"><ShieldCheck size={15} />{isMessage ? t('No payment. The team replies by phone.', 'بدون دفع. الفريق بيرد عليك بالهاتف.') : t('Free, no payment. The team calls you to confirm the time.', 'مجانية وبدون دفع. الفريق بيتصل فيك ليأكد الموعد.')}</p>
        </form>

        <aside className="vv-aside">
          <img src="/images/display/gym-03.webp" alt={t('The Hydrogen Plus training floor', 'صالة التدريب في هايدروجين بلس')} />
          <div>
            <p><MapPin size={16} />{t(contact.address.en, contact.address.ar)}</p>
            {hours.filter((h) => h.id === 'men' || h.id === 'women').map((h) => <p key={h.id}><Clock3 size={16} /><span>{t(h.en, h.ar)} · <span dir="ltr">{clock(h.open, lang)} – {clock(h.close, lang)}</span></span></p>)}
            <a href={`tel:${phoneMain.tel}`}><Phone size={16} /><span dir="ltr">{phoneMain.display}</span></a>
            <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} />{t('Directions', 'الاتجاهات')}<ArrowUpRight size={14} /></a>
          </div>
        </aside>
      </div>
    </div>
  );
}

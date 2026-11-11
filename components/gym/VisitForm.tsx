'use client';
// "Send us a message" page. No visit booking: people just come during opening hours (see /contact).
// Links can pass ?kind=training|class|membership&interest=… so the staff inbox shows what it's about.
import { useRef, useState, useSyncExternalStore, type FormEvent } from 'react';
import { ArrowUpRight, CheckCircle2, Clock3, MapPin, Phone, ShieldCheck, Tag, X } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { useSiteInfo } from '@/lib/admin/overrides';
import { legalConsent, legalError } from '@/lib/legal';
import './experiences.css';
import './visit.css';

type Kind = 'tour' | 'membership' | 'class' | 'training' | 'contact';
const KINDS: Kind[] = ['tour', 'membership', 'class', 'training', 'contact'];
const noSub = () => () => {};
const readSearch = () => window.location.search;

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
  const rawKind = initialKind || q.get('kind') || 'contact';
  const kind: Kind = KINDS.includes(rawKind as Kind) && rawKind !== 'tour' ? (rawKind as Kind) : 'contact';
  const topicFromLink = (initialInterest || q.get('interest') || '').slice(0, 160);
  const [topicHidden, setTopicHidden] = useState(false);
  const topic = topicHidden ? '' : topicFromLink;

  const [message, setMessage] = useState((initialMessage || q.get('message') || '').slice(0, 1700));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const id = useRef('');

  const date = initialDate || q.get('date') || '';
  const phoneMain = contact.phones[0];

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 3) { setError(t('Please write your message.', 'اكتب رسالتك من فضلك.')); return; }
    if (!consent) { setError(legalError(lang)); return; }
    setBusy(true); setError('');
    if (!id.current) id.current = crypto.randomUUID();
    try {
      const res = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          interest: topic.trim() || undefined,
          preferredDate: date || undefined,
          name, phone,
          message: message.trim().slice(0, 2000) || undefined,
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
        <span className="hp3-kicker">{t('MESSAGE SENT', 'وصلت رسالتك')}</span>
        <h1>{t('WE’LL GET', 'رح نرجع')}<br />{t('BACK TO YOU.', 'نتواصل معك.')}</h1>
        <p>{t('The team will reply by phone. Keep your reference in case you call us.', 'الفريق رح يرد عليك بالهاتف. احتفظ برقم الطلب إذا اتصلت فينا.')}</p>
        <div className="hp3-booking-reference"><small>{t('REQUEST REFERENCE', 'رقم الطلب')}</small><strong>{reference}</strong><span>{t('Waiting for the team to confirm', 'بانتظار تأكيد الفريق')}</span></div>
        <div className="hp3-button-row">
          <a href={`tel:${phoneMain.tel}`} className="hp3-button hp3-red"><Phone size={17} />{t('Call the club', 'اتصل بالنادي')}</a>
          <a href="/prices" className="hp3-button">{t('Plans & prices', 'الأسعار والاشتراكات')}<ArrowUpRight size={17} /></a>
        </div>
      </div>
    );
  }

    return (
    <div className="hp3-container vv">
      <header className="vv-head">
        <span className="hp3-kicker">{t('MESSAGE THE CLUB', 'راسل النادي')}</span>
        <h1>{t('SEND US A', 'أرسل لنا')} <em>{t('MESSAGE.', 'رسالة.')}</em></h1>
        <p>{t('Write your question and leave your number. The team calls you back.', 'اكتب سؤالك واترك رقمك، والفريق بيتصل فيك.')}</p>
        <div className="vv-links">
          <a href="/prices"><Tag size={17} /><span><b>{t('Want to subscribe?', 'بدك تشترك؟')}</b> {t('See plans & prices', 'شوف الأسعار والاشتراكات')}</span><ArrowUpRight size={15} /></a>
          <a href="/contact"><MapPin size={17} /><span><b>{t('Want to come in?', 'بدك تجي؟')}</b> {t('Location & opening hours', 'الموقع وأوقات الدوام')}</span><ArrowUpRight size={15} /></a>
        </div>
      </header>

      <div className="vv-layout">
        <form className="vv-form" onSubmit={submit} noValidate={false}>
          {topic && (
            <div className="vv-topic"><span>{t('About', 'بخصوص')}</span><b>{topic}</b>
              <button type="button" onClick={() => setTopicHidden(true)} aria-label={t('Remove', 'إزالة')}><X size={15} /></button>
            </div>
          )}

          <div className="vv-row">
            <label className="vv-field">{t('Your name', 'اسمك')}<input className="vv-input" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder={t('Full name', 'الاسم الكامل')} /></label>
            <label className="vv-field">{t('Phone', 'رقم الهاتف')}<input className="vv-input" autoComplete="tel" type="tel" inputMode="tel" required minLength={7} maxLength={24} dir="ltr" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="079 000 0000" /></label>
          </div>

          <label className="vv-field">{t('Your message', 'رسالتك')}<textarea className="vv-input" rows={5} maxLength={1700} value={message} onChange={(e) => setMessage(e.target.value)} placeholder={t('Please avoid medical details.', 'يرجى تجنب التفاصيل الطبية.')} /></label>

          <label className="vv-consent"><input type="checkbox" required checked={consent} onChange={(e) => setConsent(e.target.checked)} /><span>{legalConsent(lang)} <a href={lang === 'ar' ? '/ar/privacy' : '/privacy'} target="_blank" rel="noopener noreferrer">{t('Privacy', 'الخصوصية')}</a> · <a href={lang === 'ar' ? '/ar/terms' : '/terms'} target="_blank" rel="noopener noreferrer">{t('Terms', 'الشروط')}</a></span></label>

          {error && <p className="vv-error" role="alert">{error}</p>}
          <button className="hp3-button hp3-red vv-send" disabled={busy} type="submit">
            {busy ? t('Sending…', 'جارٍ الإرسال…') : t('Send message', 'أرسل الرسالة')}<ArrowUpRight size={17} />
          </button>
          <p className="vv-small"><ShieldCheck size={15} />{t('No payment. The team replies by phone.', 'بدون دفع. الفريق بيرد عليك بالهاتف.')}</p>
        </form>

        <aside className="vv-aside">
          <img src="/images/display/gym-03.webp" alt={t('The Hydrogen Plus training floor', 'صالة التدريب في هايدروجين بلس')} />
          <div>
            <p><MapPin size={16} />{t(contact.address.en, contact.address.ar)}</p>
            {hours.filter((h) => h.id === 'men' || h.id === 'women').map((h) => <p key={h.id}><Clock3 size={16} /><span>{t(h.en, h.ar)} · <span dir={lang === 'ar' ? 'rtl' : 'ltr'}>{clock(h.open, lang)} – {clock(h.close, lang)}</span></span></p>)}
            <a href={`tel:${phoneMain.tel}`}><Phone size={16} /><span dir="ltr">{phoneMain.display}</span></a>
            <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer"><MapPin size={16} />{t('Directions', 'الاتجاهات')}<ArrowUpRight size={14} /></a>
          </div>
        </aside>
      </div>
    </div>
  );
}

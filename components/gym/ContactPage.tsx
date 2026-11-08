'use client';
import { useState } from 'react';
import { useNow } from './SiteExtras';
import { ArrowUpRight, Camera, Clock, Mail, MapPin, MessageCircle, Navigation, Phone, Send } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { contact, hours, sessionState, formatClock } from '@/lib/site-info';
import './service-page.css';
import './feature-pages.css';

export default function ContactPage() {
  const { t, lang } = useGymLanguage();
  const now = useNow();
  const [map, setMap] = useState(false);
  const fmt = (iso: string) => new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso + 'T12:00:00+03:00'));
  return (
    <div className="sp">
      <section className="sp-hero fp-hero">
        <div className="sp-hero-text">
          <span className="sp-kicker"><MapPin size={14} />{t('CONTACT & LOCATION', 'التواصل والموقع')}</span>
          <h1>{t('Find us.', 'تعال إلينا.')}</h1>
          <p className="sp-headline">{t(contact.address.en, contact.address.ar)}</p>
          <p className="sp-intro">{t('Call, message or drop in — the team can answer questions about memberships, classes, the pool, Hydro Rest and the lounge.', 'اتصل أو راسلنا أو زرنا مباشرة — يجيب الفريق عن أسئلتك حول الاشتراكات والحصص والمسبح وهايدرو ريست واللاونج.')}</p>
          <div className="sp-actions">
            <a className="sp-btn sp-btn-red" href={contact.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={16} />{t('Get directions', 'احصل على الاتجاهات')}</a>
            {contact.phones.map((p) => <a key={p.tel} className="sp-btn" href={`tel:${p.tel}`}><Phone size={15} /><span dir="ltr">{p.display}</span></a>)}
          </div>
        </div>
        <div className="fp-map">
          {map
            ? <iframe title={t('Map of Hydrogen Plus Fitness', 'خريطة هايدروجين بلس')} src={contact.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
            : <button onClick={() => setMap(true)} className="fp-map-load"><img src="/images/display/exterior-entrance.webp" alt="" /><span><MapPin size={20} />{t('Show the map', 'اعرض الخريطة')}<small>{t('Loads Google Maps', 'يتم تحميل خرائط Google')}</small></span></button>}
        </div>
      </section>

      <section className="sp-section sp-paper"><div className="sp-container fp-two">
        <div>
          <span className="sp-eyebrow">{t('OPENING HOURS', 'أوقات الدوام')}</span>
          <h2 className="fp-h2">{t('When we’re open', 'متى نكون مفتوحين')}</h2>
          <ul className="fp-hours">{hours.map((h) => {
            const st = now ? sessionState(h, now) : null;
            return (
              <li key={h.id}>
                <div><b>{t(h.en, h.ar)}</b><small>{t('Published', 'منشور')} {fmt(h.published)} · <a href={h.source} target="_blank" rel="noopener noreferrer">{t('source', 'المصدر')}</a></small></div>
                <span className="fp-time" dir="ltr">{formatClock(h.open, lang)} – {formatClock(h.close, lang)}</span>
                {st && <span className={`fp-state ${st.isOpen ? 'is-open' : ''}`}>{st.isOpen ? t('Open now', 'مفتوح الآن') : t('Closed', 'مغلق')}</span>}
              </li>
            );
          })}
            <li><div><b>{t('Pool', 'المسبح')}</b><small>{t('Seasonal · latest post', 'موسمي · آخر منشور')} {fmt('2026-10-01')} · <a href="/services/pool-spa">{t('details', 'التفاصيل')}</a></small></div><span className="fp-time" dir="ltr">{formatClock('09:00', lang)} – {formatClock('17:00', lang)}</span></li>
          </ul>
          <p className="sp-note">{t('Holiday and Ramadan hours are announced on Instagram — see News & offers. Times shown in Irbid (Asia/Amman) time.', 'تُعلن أوقات العطل ورمضان على إنستغرام — راجع الأخبار والعروض. الأوقات حسب توقيت إربد (عمّان).')} <a className="sp-link" href="/offers">{t('News & offers', 'الأخبار والعروض')}</a></p>
        </div>
        <div>
          <span className="sp-eyebrow">{t('GET IN TOUCH', 'تواصل معنا')}</span>
          <h2 className="fp-h2">{t('Every way to reach us', 'كل طرق التواصل')}</h2>
          <div className="fp-channels">
            {contact.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}><Phone size={18} /><span><b dir="ltr">{p.display}</b><small>{t('Call the club', 'اتصل بالنادي')}</small></span><ArrowUpRight size={15} /></a>)}
            <a href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /><span><b>WhatsApp</b><small dir="ltr">079 215 1000</small></span><ArrowUpRight size={15} /></a>
            <a href={`mailto:${contact.email}`}><Mail size={18} /><span><b dir="ltr">{contact.email}</b><small>{t('Email', 'البريد الإلكتروني')}</small></span><ArrowUpRight size={15} /></a>
            <a href="/join?kind=contact"><Send size={18} /><span><b>{t('Send a message', 'أرسل رسالة')}</b><small>{t('Get a reference and track the reply', 'احصل على رقم مرجعي وتابع الرد')}</small></span><ArrowUpRight size={15} /></a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer"><Camera size={18} /><span><b>Instagram</b><small>@hydrogenplusfitness</small></span><ArrowUpRight size={15} /></a>
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer"><Camera size={18} /><span><b>Facebook</b><small>Hydrogen Plus Fitness & Spa</small></span><ArrowUpRight size={15} /></a>
          </div>
          <div className="fp-sub-accounts">{contact.related.map((r) => <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer">{r.name}<ArrowUpRight size={13} /></a>)}</div>
        </div>
      </div></section>

      <section className="sp-section"><div className="sp-container fp-arrive">
        <div><span className="sp-eyebrow">{t('ARRIVING', 'الوصول')}</span><h2 className="fp-h2">{t('Your first visit', 'زيارتك الأولى')}</h2></div>
        <ol>
          <li><Clock size={18} /><span><b>{t('Pick a time', 'اختر الوقت')}</b>{t('Check the men’s or ladies’ hours above.', 'تحقق من دوام الرجال أو السيدات أعلاه.')}</span></li>
          <li><MapPin size={18} /><span><b>{t('Head to Al-Husn Road', 'توجّه إلى طريق الحصن')}</b>{t('The glass building opposite Granada College, Irbid.', 'المبنى الزجاجي مقابل كلية غرناطة في إربد.')}</span></li>
          <li><Phone size={18} /><span><b>{t('Say hello at reception', 'عرّف بنفسك في الاستقبال')}</b>{t('Or send a visit request first so the team expects you.', 'أو أرسل طلب زيارة مسبقاً ليكون الفريق بانتظارك.')}</span></li>
        </ol>
        <a className="sp-btn sp-btn-red" href="/join?kind=tour">{t('Request a visit', 'اطلب زيارة')}<ArrowUpRight size={17} /></a>
      </div></section>
    </div>
  );
}

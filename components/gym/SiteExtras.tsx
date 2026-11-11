'use client';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ArrowUpRight, Baby, CalendarDays, Dumbbell, Flower2, Mail, MapPin, MessageCircle, Moon, Navigation, Phone, Salad, Sparkles, Swords, Tag, UserRound, Users, Waves, X } from 'lucide-react';
import { sessionState, formatClock } from '@/lib/site-info';
import { useSiteInfo } from '@/lib/admin/overrides';
import type { Lang } from '@/lib/legal';

type T = (en: string, ar: string) => string;

// Lightweight nav list (kept separate from lib/services.ts so page content isn't bundled into every page).
export const serviceNav = [
  { href: '/services/gym', en: 'Gym floor', ar: 'صالة الجيم', icon: Dumbbell },
  { href: '/services/ladies', en: 'Ladies’ club', ar: 'نادي السيدات', icon: Sparkles },
  { href: '/services/group-classes', en: 'Group classes', ar: 'الحصص الجماعية', icon: Users },
  { href: '/services/pilates', en: 'Reformer Pilates', ar: 'ريفورمر بيلاتس', icon: Flower2 },
  { href: '/services/martial-arts', en: 'Boxing & martial arts', ar: 'البوكسينج والفنون القتالية', icon: Swords },
  { href: '/services/pool-spa', en: 'Pool & spa', ar: 'المسبح والسبا', icon: Waves },
  { href: '/services/swimming-academy', en: 'Swimming lessons', ar: 'دورات السباحة', icon: Waves },
  { href: '/services/kids', en: 'Kids programmes', ar: 'برامج الأطفال', icon: Baby },
  { href: '/services/personal-training', en: 'Personal training', ar: 'التدريب الشخصي', icon: UserRound },
  { href: '/services/hydro-rest', en: 'Hydro Rest & nutrition', ar: 'هايدرو ريست والتغذية', icon: Salad },
  { href: '/services/lounge', en: 'Hydrogen Lounge', ar: 'هايدروجين لاونج', icon: Moon },
  { href: '/services/events', en: 'Events & community', ar: 'الفعاليات والمجتمع', icon: CalendarDays },
];

export const exploreNav: [string, string, string][] = [
  ['/offers', 'News & offers', 'الأخبار والعروض'],
  ['/coaches', 'Coaches', 'المدربون'],
  ['/calculators', 'Fitness calculators', 'حاسبات اللياقة'],
  ['/tools', 'Workout studio', 'استوديو التمارين'],
  ['/training', 'Plan your training', 'خطط لتدريبك'],
  ['/community', 'Instagram & Facebook archive', 'أرشيف إنستغرام وفيسبوك'],
  ['/contact', 'Contact & location', 'التواصل والموقع'],
  ['/support', 'Help & membership support', 'المساعدة وخدمة الأعضاء'],
  ['/careers', 'Careers', 'الوظائف'],
  ['/prices#gym-men', 'Day pass price', 'سعر الدخول اليومي'],
];

export function ServicesMega({ t, lang, onNavigate }: { t: T; lang: Lang; onNavigate?: () => void }) {
  return (
    <div className="hx-mega">
      <div className="hx-mega-grid">{serviceNav.map(({ href, en, ar, icon: Icon }) => <a key={href} href={href} onClick={onNavigate}><Icon size={16} />{t(en, ar)}</a>)}</div>
      <div className="hx-mega-foot"><a href="/services" onClick={onNavigate}>{t('All services', 'كل الخدمات')}<ArrowUpRight size={14} /></a><a href="/offers" onClick={onNavigate}><Tag size={14} />{t('News & offers', 'الأخبار والعروض')}</a></div>
    </div>
  );
}

const subscribeClock = (cb: () => void) => { const id = setInterval(cb, 30_000); return () => clearInterval(id); };
const minuteStamp = () => Math.floor(Date.now() / 60_000);
/** Current time, refreshed every minute; null during server render and hydration so markup matches. */
export function useNow(): Date | null {
  const stamp = useSyncExternalStore(subscribeClock, minuteStamp, () => -1);
  return stamp < 0 ? null : new Date(stamp * 60_000);
}

/** Live open/closed status in Amman time. */
export function OpenStatus({ t, lang, compact = false }: { t: T; lang: Lang; compact?: boolean }) {
  const now = useNow();
  const { hours } = useSiteInfo();
  if (!now) return <span className="hx-open">{t('MEN 6 AM–MIDNIGHT  /  LADIES 8 AM–11 PM', 'الرجال ٦ ص–منتصف الليل / السيدات ٨ ص–١١ م')}</span>;
  const men = hours[0], women = hours[1];
  const m = sessionState(men, now), w = sessionState(women, now);
  const any = m.isOpen || w.isOpen;
  const part = (label: [string, string], row: typeof men, st: { isOpen: boolean }) => `${t(label[0], label[1])} ${st.isOpen ? t('until', 'حتى') + ' ' + formatClock(row.close, lang) : t('opens', 'يفتح') + ' ' + formatClock(row.open, lang)}`;
  return (
    <span className={`hx-open ${any ? 'is-open' : 'is-closed'}`}>
      <i aria-hidden />{any ? t('OPEN NOW', 'مفتوح الآن') : t('CLOSED NOW', 'مغلق الآن')}
      {!compact && <span className="hx-open-detail"> · {part(['Men', 'الرجال'], men, m)} · {part(['Ladies', 'السيدات'], women, w)}</span>}
    </span>
  );
}

function subscribeScroll(cb: () => void) {
  window.addEventListener('scroll', cb, { passive: true });
  return () => window.removeEventListener('scroll', cb);
}

export function FloatingContact({ t, lang }: { t: T; lang: Lang }) {
  const [open, setOpen] = useState(false);
  const { contact } = useSiteInfo();
  const scrolled = useSyncExternalStore(subscribeScroll, () => window.scrollY > 280, () => false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const toggle = () => setOpen((v) => !v);
    window.addEventListener('hx-contact-toggle', toggle);
    return () => window.removeEventListener('hx-contact-toggle', toggle);
  }, []);
  useEffect(() => { window.dispatchEvent(new CustomEvent('hx-contact-state', { detail: open })); }, [open]);
  useEffect(() => {
    if (!open) return;
    const away = (e: PointerEvent) => { const el = e.target as Element; if (!box.current?.contains(el) && !el.closest('.hp3-mobile-dock')) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);
  const msg = encodeURIComponent(lang === 'ar' ? 'مرحباً، لدي استفسار عن هايدروجين بلس' : 'Hello, I have a question about Hydrogen Plus');
  return (
    <div ref={box} className={`hx-float ${open ? 'is-open' : ''} ${scrolled || open ? '' : 'is-top'}`}>
      {open && (
        <div className="hx-float-panel" role="dialog" aria-label={t('Contact the club', 'تواصل مع النادي')}>
          <b>{t('Talk to the club', 'تواصل مع النادي')}</b>
          {contact.phones.map((p) => <a key={p.tel} href={`tel:${p.tel}`}><Phone size={16} /><span dir="ltr">{p.display}</span></a>)}
          <a href={`https://wa.me/${contact.whatsapp}?text=${msg}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />WhatsApp</a>
          <a href={`mailto:${contact.email}`}><Mail size={16} /><span dir="ltr">{contact.email}</span></a>
          <a href={contact.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={16} />{t('Get directions', 'احصل على الاتجاهات')}</a>
          <a href="/contact"><MapPin size={16} />{t('Hours & location', 'الأوقات والموقع')}</a>
        </div>
      )}
      <button className="hx-float-btn" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? t('Close contact options', 'إغلاق خيارات التواصل') : t('Contact options', 'خيارات التواصل')}>
        {open ? <X size={22} /> : <Phone size={21} />}
      </button>
    </div>
  );
}

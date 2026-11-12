'use client';
// Home page: "Today at the club" (open now, nutritionist, today's classes) and "Find us".
import { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarDays, Clock3, MapPin, MessageCircle, Navigation, Phone, Salad } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { useNow } from './SiteExtras';
import { useSchedule, useSiteInfo } from '@/lib/admin/overrides';
import { ammanToday } from '@/lib/schedule';
import { formatClock, sessionState, type HoursRow } from '@/lib/site-info';
import './site-extras.css';

const toMin = (time: string, period: 'AM' | 'PM') => { const [h, m] = time.split(':').map(Number); return ((h % 12) + (period === 'PM' ? 12 : 0)) * 60 + m; };
const clock = (time: string, period: 'AM' | 'PM', lang: 'en' | 'ar') => { const m = toMin(time, period); return formatClock(`${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`, lang); };
const ammanMinutes = (d: Date) => { const p = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Amman', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(d); const g = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0); return g('hour') * 60 + g('minute'); };

function StatusRow({ row, icon, label }: { row?: HoursRow; icon: React.ReactNode; label: string }) {
  const { t, lang } = useGymLanguage();
  const now = useNow();
  if (!row) return null;
  const st = now ? sessionState(row, now) : null;
  return (
    <li className={`hx-today-row${st?.isOpen ? ' is-open' : ''}`}>
      <span className="hx-today-ic">{icon}</span>
      <div><b>{label}</b><small dir={lang === 'ar' ? 'rtl' : 'ltr'}>{formatClock(row.open, lang)} – {formatClock(row.close, lang)}</small></div>
      {st && <em>{st.isOpen ? `${t('Open', 'مفتوح')} · ${t('until', 'حتى')} ${formatClock(row.close, lang)}` : `${t('Closed', 'مغلق')} · ${t('opens', 'يفتح')} ${formatClock(row.open, lang)}`}</em>}
    </li>
  );
}

export function HomeToday() {
  const { t, lang } = useGymLanguage();
  const { hours } = useSiteInfo();
  const { days, classes } = useSchedule();
  const now = useNow();
  const find = (id: string) => hours.find((h) => h.id === id);
  const nutri = find('nutrition');

  const { today, upcoming, next, dateLabel } = useMemo(() => {
    if (!now) return { today: [], upcoming: [], next: null, dateLabel: '' };
    const d = ammanToday(now); const mins = ammanMinutes(now);
    const todayDay = days.find((x) => x.date === d);
    const list = todayDay ? classes.filter((c) => c.day === todayDay.en).sort((a, b) => toMin(a.time, a.period) - toMin(b.time, b.period)) : [];
    const up = list.filter((c) => toMin(c.time, c.period) > mins);
    let nx: { day: (typeof days)[number]; c: (typeof classes)[number] } | null = null;
    if (!up.length) {
      for (const day of days.filter((x) => x.date > d)) {
        const first = classes.filter((c) => c.day === day.en).sort((a, b) => toMin(a.time, a.period) - toMin(b.time, b.period))[0];
        if (first) { nx = { day, c: first }; break; }
      }
    }
    const label = new Intl.DateTimeFormat(lang === 'ar' ? 'ar-JO' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Asia/Amman' }).format(now);
    return { today: list, upcoming: up, next: nx, dateLabel: label };
  }, [now, days, classes, lang]);

  return (
    <section className="hp3-container hp3-section hx-today" aria-labelledby="hx-today-h">
      <div className="hx-home-head">
        <div><span className="hp3-kicker">{t('TODAY AT THE CLUB', 'اليوم في النادي')}</span><h2 id="hx-today-h">{dateLabel || t('Today', 'اليوم')}</h2></div>
      </div>
      <div className="hx-today-grid">
        <ul className="hx-today-status">
          <StatusRow row={find('men')} icon={<Clock3 size={18} />} label={t('Men’s gym', 'جيم الرجال')} />
          <StatusRow row={find('women')} icon={<Clock3 size={18} />} label={t('Ladies’ gym', 'جيم السيدات')} />
          {nutri && <StatusRow row={nutri} icon={<Salad size={18} />} label={t('Nutritionist', 'أخصائية التغذية')} />}
          <li className="hx-today-more"><a href="/calculators#nutritionist">{t('Book with the nutritionist', 'احجز مع أخصائية التغذية')}<ArrowUpRight size={15} /></a></li>
        </ul>
        <div className="hx-today-classes">
          <p className="hx-today-title"><CalendarDays size={18} />{t('Classes today', 'حصص اليوم')} <small>{t('Ladies', 'للسيدات')}</small></p>
          {upcoming.length > 0 ? (
            <ol>
              {upcoming.slice(0, 4).map((c) => (
                <li key={`${c.time}${c.period}${c.name}`}><time>{clock(c.time, c.period, lang)}</time><b>{lang === 'ar' ? c.ar : c.name}</b><span>{c.coach.charAt(0) + c.coach.slice(1).toLowerCase()}</span></li>
              ))}
              {upcoming.length > 4 && <li className="hx-today-plus">+{upcoming.length - 4} {t('more today', 'حصص أخرى اليوم')}</li>}
            </ol>
          ) : (
            <p className="hx-today-none">
              {today.length ? t('No more classes today.', 'انتهت حصص اليوم.') : t('No classes today.', 'لا توجد حصص اليوم.')}
              {next && <> {t('Next:', 'التالية:')} <b>{lang === 'ar' ? next.day.ar : next.day.en} · <span>{clock(next.c.time, next.c.period, lang)}</span> · {lang === 'ar' ? next.c.ar : next.c.name}</b></>}
            </p>
          )}
          <a className="hp3-button hp3-red" href="/classes">{t('Full timetable', 'الجدول الكامل')}<ArrowUpRight size={17} /></a>
        </div>
      </div>
    </section>
  );
}

export function HomeFindUs() {
  const { t } = useGymLanguage();
  const { contact } = useSiteInfo();
  const [map, setMap] = useState(false);
  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(t('Hello, I have a question about Hydrogen Plus Fitness.', 'مرحباً، لدي استفسار عن نادي هايدروجين بلس.'))}`;
  return (
    <section className="hp3-container hp3-section hx-findus" aria-labelledby="hx-findus-h">
      <div className="hx-findus-copy">
        <span className="hp3-kicker">{t('FIND US', 'موقعنا')}</span>
        <h2 id="hx-findus-h">{t('Come and see us.', 'تفضّل بزيارتنا.')}</h2>
        <p><MapPin size={17} />{t(contact.address.en, contact.address.ar)}</p>
        <div className="hx-findus-actions">
          <a className="hp3-button hp3-red" href={contact.directionsUrl} target="_blank" rel="noopener noreferrer"><Navigation size={16} />{t('Directions', 'الاتجاهات')}</a>
          <a className="hp3-button" href={`tel:${contact.phones[0].tel}`}><Phone size={16} /><span dir="ltr">{contact.phones[0].display}</span></a>
          <a className="hp3-button" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />{t('WhatsApp', 'واتساب')}</a>
        </div>
        <a className="hp3-text-link" href="/contact">{t('All hours & contact details', 'كل الأوقات وتفاصيل التواصل')}<ArrowUpRight size={15} /></a>
      </div>
      <div className="hx-findus-map">
        {map
          ? <iframe title={t('Map of Hydrogen Plus Fitness', 'خريطة هايدروجين بلس')} src={contact.mapEmbed} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          : <button type="button" onClick={() => setMap(true)}><img src="/images/display/exterior-entrance.webp" alt="" loading="lazy" /><span><MapPin size={20} />{t('Show the map', 'اعرض الخريطة')}</span></button>}
      </div>
    </section>
  );
}

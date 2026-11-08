'use client';
import { ArrowUpRight, Briefcase, CalendarDays, MessageCircle, UserRound } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { schedule } from '@/lib/schedule';
import { contact } from '@/lib/site-info';
import './service-page.css';
import './feature-pages.css';

const ig = (c: string) => `https://www.instagram.com/p/${c}/`;
type Coach = { key: string; en: string; ar: string; roleEn: string; roleAr: string; tags: [string, string][]; source: string; guest?: boolean };

const team: Coach[] = [
  ...['FARAH|فرح', 'SARA|سارة', 'KATIE|كاتي', 'LESYA|ليسيا', 'ABEER|عبير', 'MARWA|مروى', 'SVITLANA|سفيتلانا'].map((n) => {
    const [key, ar] = n.split('|');
    const extra: Record<string, [string, string][]> = { MARWA: [['Aqua aerobics', 'أكوا إيروبيك'], ['Pilates', 'بيلاتس']], ABEER: [['Belly dance (outdoor)', 'رقص شرقي (خارجي)']], SVITLANA: [['Yoga (outdoor)', 'يوغا (خارجي)']], FARAH: [['Zumba (outdoor)', 'زومبا (خارجي)']] };
    return { key, en: key.charAt(0) + key.slice(1).toLowerCase(), ar, roleEn: 'Group classes · women’s timetable', roleAr: 'الحصص الجماعية · جدول السيدات', tags: extra[key] ?? [], source: ig('DfZrJukouow') };
  }),
  { key: 'YAZID', en: 'Captain Yazid Abu Laila', ar: 'الكابتن يزيد أبو ليلى', roleEn: 'Joined the coaching team in December 2025', roleAr: 'انضم إلى فريق التدريب في كانون الأول ٢٠٢٥', tags: [], source: ig('DS7NMeoCI0n') },
  { key: 'MAHMOUD', en: 'Captain Mahmoud Al-Kawamleh', ar: 'الكابتن محمود الكواملة', roleEn: 'Joined the coaching team in December 2025', roleAr: 'انضم إلى فريق التدريب في كانون الأول ٢٠٢٥', tags: [], source: ig('DS7NMeoCI0n') },
];
const guests: Coach[] = [
  { key: 'MOHAMMAD', en: 'Coach Mohammad Al-Talawi', ar: 'الكوتش محمد التلاوي', roleEn: 'Jordanian national boxing team — led a kids’ boxing day (Sep 2026)', roleAr: 'لاعب المنتخب الوطني للملاكمة — قاد يوم بوكسينج للأطفال (أيلول ٢٠٢٦)', tags: [['Boxing', 'بوكسينج']], source: ig('Ddt1NIhsgq4'), guest: true },
  { key: 'SANAD', en: 'Coach Sanad Al-Talawi', ar: 'الكوتش سند التلاوي', roleEn: 'Took part in the kids’ boxing day (Sep 2026)', roleAr: 'شارك في يوم البوكسينج للأطفال (أيلول ٢٠٢٦)', tags: [['Boxing', 'بوكسينج']], source: ig('Ddt1NIhsgq4'), guest: true },
];

export default function CoachesPage() {
  const { t, lang } = useGymLanguage();
  const card = (c: Coach) => {
    const classes = schedule.filter((s) => s.coach === c.key);
    const names = Array.from(new Set(classes.map((s) => (lang === 'ar' ? s.ar : s.name))));
    return (
      <li key={c.key} className="fc-coach">
        <span className="sp-avatar">{(lang === 'ar' ? c.ar : c.en).replace(/^(Captain|Coach|الكابتن|الكوتش)\s+/, '').charAt(0)}</span>
        <div>
          <b>{lang === 'ar' ? c.ar : c.en}</b>
          <small>{lang === 'ar' ? c.roleAr : c.roleEn}</small>
          {(names.length > 0 || c.tags.length > 0) && <div className="fc-tags">{names.map((n) => <span key={n}>{n}</span>)}{c.tags.map(([en, ar]) => <span key={en} className="is-alt">{lang === 'ar' ? ar : en}</span>)}</div>}
          {classes.length > 0 && <p className="fc-count"><CalendarDays size={13} />{classes.length} {t('classes this week', 'حصص هذا الأسبوع')}</p>}
          <div className="fc-coach-actions">
            {!c.guest && <a href={`/join?kind=training&interest=${encodeURIComponent('Coach ' + c.en)}`}>{t('Ask to train with', 'اطلب التدريب مع')} {lang === 'ar' ? c.ar.split(' ').slice(-2).join(' ') : c.en.split(' ').slice(-1)[0]}<ArrowUpRight size={13} /></a>}
            <a href={c.source} target="_blank" rel="noopener noreferrer" className="is-muted">{t('Source post', 'المنشور المصدر')}</a>
          </div>
        </div>
      </li>
    );
  };
  return (
    <div className="sp">
      <section className="sv-hero">
        <div><span className="sp-kicker"><UserRound size={14} />{t('THE TEAM', 'الفريق')}</span><h1>{t('Meet the coaches.', 'تعرّف على المدربين.')}</h1></div>
        <div><p>{t('Coaches named on the club’s timetable and posts. Their published classes update with each new weekly timetable.', 'المدربون المذكورون في جدول النادي ومنشوراته. تتحدّث حصصهم مع كل جدول أسبوعي جديد.')}</p>
          <div className="sp-actions"><a className="sp-btn sp-btn-red" href="/join?kind=training">{t('Match me with a coach', 'رشّح لي مدرباً')}<ArrowUpRight size={17} /></a><a className="sp-btn" href="/classes"><CalendarDays size={15} />{t('Class timetable', 'جدول الحصص')}</a></div></div>
      </section>
      <section className="sp-section sp-paper"><div className="sp-container">
        <div className="sp-head"><div><span className="sp-eyebrow">{t('COACHING TEAM', 'فريق التدريب')}</span><h2>{t('Hydrogen coaches', 'مدربو هايدروجين')}</h2></div></div>
        <ul className="fc-coaches">{team.map(card)}</ul>
        <div className="sp-head fc-guests"><div><span className="sp-eyebrow">{t('GUESTS', 'ضيوف')}</span><h2>{t('Guest coaches', 'مدربون ضيوف')}</h2></div></div>
        <ul className="fc-coaches">{guests.map(card)}</ul>
        <p className="sp-note">{t('Only names and roles the club has published are shown. Ask the team about qualifications and availability.', 'نعرض فقط الأسماء والأدوار التي نشرها النادي. اسأل الفريق عن المؤهلات والأوقات المتاحة.')}</p>
      </div></section>
      <section className="sp-section"><div className="sp-container fp-two">
        <div><span className="sp-eyebrow">{t('JOIN THE TEAM', 'انضم إلى الفريق')}</span><h2 className="fp-h2">{t('Are you a coach?', 'هل أنت مدرب؟')}</h2><p className="sp-intro">{t('The club has recruited female fitness trainers and hosts the JO FIT CPT course for new trainers.', 'استقطب النادي مدربات لياقة بدنية، ويستضيف دورة CPT من JO FIT للمدربين الجدد.')}</p></div>
        <div className="sp-actions"><a className="sp-btn sp-btn-red" href="/careers"><Briefcase size={16} />{t('Careers', 'الوظائف')}</a><a className="sp-btn" href={`https://wa.me/${contact.whatsapp}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />WhatsApp</a></div>
      </div></section>
    </div>
  );
}

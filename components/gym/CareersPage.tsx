'use client';
import { ArrowUpRight, Briefcase, GraduationCap, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { useSiteInfo } from '@/lib/admin/overrides';
import './service-page.css';
import './feature-pages.css';

export default function CareersPage() {
  const { contact } = useSiteInfo();
  const { t } = useGymLanguage();
  const cvText = encodeURIComponent('Hello, I would like to apply to work at Hydrogen Plus Fitness. My CV is attached.');
  return (
    <div className="sp">
      <section className="sv-hero">
        <div><span className="sp-kicker"><Briefcase size={14} />{t('CAREERS', 'الوظائف')}</span><h1>{t('Work at Hydrogen.', 'اعمل في هايدروجين.')}</h1></div>
        <div><p>{t('Coaches, front desk, Hydro Rest and lounge — if you love training and people, introduce yourself. Openings are announced on the club’s Instagram.', 'مدربون، استقبال، هايدرو ريست واللاونج — إن كنت تحب الرياضة والتعامل مع الناس، عرّفنا بنفسك. يُعلن عن الشواغر على إنستغرام النادي.')}</p></div>
      </section>
      <section className="sp-section sp-paper"><div className="sp-container fp-two">
        <article className="fc-job">
          <span className="sp-tag is-news">{t('Last published opening · 26 Aug 2025', 'آخر شاغر منشور · ٢٦ آب ٢٠٢٥')}</span>
          <h2 className="fp-h2">{t('Female fitness trainers — ladies’ gym', 'مدربات لياقة بدنية — جيم السيدات')}</h2>
          <ul><li>{t('At least 3 years’ experience', 'خبرة لا تقل عن ٣ سنوات')}</li><li>{t('Send your CV on WhatsApp or apply in person at the gym', 'إرسال السيرة الذاتية عبر واتساب أو التقديم مباشرة داخل الجيم')}</li></ul>
          <div className="sp-actions">
            <a className="sp-btn sp-btn-red" href={`https://wa.me/${contact.careersWhatsapp.number}?text=${cvText}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} />{t('Send CV on WhatsApp', 'أرسل سيرتك عبر واتساب')} <span dir="ltr">{contact.careersWhatsapp.display}</span></a>
            <a className="sp-btn" href="https://www.instagram.com/p/DN1H_qRWBI9/" target="_blank" rel="noopener noreferrer">{t('See the post', 'شاهد المنشور')}<ArrowUpRight size={15} /></a>
          </div>
          <p className="sp-note">{t('This vacancy was published in August 2025 and may be filled. Call the club to ask about current openings.', 'نُشر هذا الشاغر في آب ٢٠٢٥ وقد يكون تم شغله. اتصل بالنادي للسؤال عن الشواغر الحالية.')}</p>
        </article>
        <div className="fc-job-side">
          <div><GraduationCap size={22} /><b>{t('Become a certified trainer', 'كن مدرباً معتمداً')}</b><p>{t('The club has hosted JO FIT’s NCSF-accredited CPT course in Irbid.', 'استضاف النادي دورة CPT من JO FIT باعتماد NCSF في إربد.')}</p><a className="sp-link" href="/services/personal-training">{t('Learn more', 'اعرف المزيد')}<ArrowUpRight size={13} /></a></div>
          <div><MapPin size={22} /><b>{t('Apply in person', 'قدّم شخصياً')}</b><p>{t(contact.address.en, contact.address.ar)}</p></div>
          <div><Phone size={22} /><b>{t('Ask about openings', 'اسأل عن الشواغر')}</b><p dir="ltr">{contact.phones.map((p) => p.display).join(' · ')}</p></div>
        </div>
      </div></section>
    </div>
  );
}

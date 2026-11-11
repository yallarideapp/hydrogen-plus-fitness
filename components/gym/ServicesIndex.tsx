'use client';
import { ArrowUpRight, Tag } from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import { ServiceTile } from './ServicePage';
import type { ServiceCard } from '@/lib/service-data';
import './service-page.css';

export default function ServicesIndex({ cards, total }: { cards: ServiceCard[]; total: number }) {
  const { t } = useGymLanguage();
  return (
    <div className="sp">
      <section className="sv-hero">
        <div><span className="sp-kicker">{t('HYDROGEN PLUS FITNESS & SPA · IRBID', 'هايدروجين بلس فتنس آند سبا · إربد')}</span><h1>{t('Everything under one roof.', 'كل شيء تحت سقف واحد.')}</h1></div>
        <div><p>{t(`From the gym floor and reformer Pilates to the rooftop pool, combat hall, kids’ courses, Hydro Rest and the lounge — each service has its own page with the photos, videos, prices and updates the club has published (${total} Instagram posts).`, `من صالة الجيم والريفورمر بيلاتس إلى مسبح السطح وصالة القتال ودورات الأطفال وهايدرو ريست واللاونج — لكل خدمة صفحتها الخاصة بالصور والفيديوهات والأسعار والمستجدات التي نشرها النادي (${total} منشوراً على إنستغرام).`)}</p>
          <div className="sp-actions"><a className="sp-btn sp-btn-red" href="/contact">{t('Visit the club', 'زر النادي')}<ArrowUpRight size={17} /></a><a className="sp-btn" href="/offers"><Tag size={15} />{t('News & offers', 'الأخبار والعروض')}</a></div></div>
      </section>
      <div className="sv-grid">{cards.map((c, i) => <ServiceTile key={c.slug} card={c} large={i === 0 || i === 5} />)}</div>
    </div>
  );
}

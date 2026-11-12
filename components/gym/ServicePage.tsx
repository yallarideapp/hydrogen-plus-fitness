'use client';
import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { fmtDate } from '@/lib/fmt-date';
import {
  ArrowUpRight, Baby, CalendarDays, Camera, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Dumbbell, ExternalLink, Flower2,
  Images, MessageCircle, Moon, Phone, Play, Salad, Sparkles, Swords, Tag, UserRound, Users, Waves, X,
} from 'lucide-react';
import { useGymLanguage } from './SiteShell';
import type { Bi, Service, ServiceIcon, TimelineTag } from '@/lib/services';
import type { ServiceCard, ServicePost, ServiceMedia } from '@/lib/service-data';
import { usePlans, useOverrides, useSchedule, useService, useSiteInfo } from '@/lib/admin/overrides';
import './service-page.css';

export const serviceIcons: Record<ServiceIcon, ComponentType<{ size?: number; strokeWidth?: number }>> = {
  dumbbell: Dumbbell, sparkles: Sparkles, users: Users, flower: Flower2, swords: Swords, waves: Waves, swim: Waves,
  baby: Baby, user: UserRound, salad: Salad, moon: Moon, calendar: CalendarDays, tag: Tag,
};

const tagLabels: Record<TimelineTag, Bi> = {
  offer: ['Offer', 'عرض'], hours: ['Hours', 'الدوام'], news: ['News', 'خبر'], event: ['Event', 'فعالية'], closure: ['Holiday / closure', 'عطلة'], opening: ['Launch', 'إطلاق'],
};

export function useDate() {
  const { lang } = useGymLanguage();
  return useCallback((iso: string, withDay = true) => {
    if (!iso) return '';
    return fmtDate(iso.slice(0, 10), lang, { day: withDay }) ?? '';
  }, [lang]);
}

type GalleryItem = { post: ServicePost; media: ServiceMedia; index: number };

function Lightbox({ items, start, onClose }: { items: GalleryItem[]; start: number; onClose: () => void }) {
  const { t } = useGymLanguage();
  const fmt = useDate();
  const [i, setI] = useState(start);
  const item = items[i];
  const go = useCallback((d: number) => setI((v) => (v + d + items.length) % items.length), [items.length]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') go(document.dir === 'rtl' ? -1 : 1); if (e.key === 'ArrowLeft') go(document.dir === 'rtl' ? 1 : -1); };
    window.addEventListener('keydown', key); document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', key); document.body.style.overflow = ''; };
  }, [go, onClose]);
  if (!item) return null;
  const { media, post } = item;
  return (
    <div className="sp-lightbox" role="dialog" aria-modal="true" aria-label={t('Photo viewer', 'عارض الصور')} onClick={onClose}>
      <div className="sp-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button className="sp-lightbox-close" onClick={onClose} aria-label={t('Close', 'إغلاق')}><X size={22} /></button>
        <div className="sp-lightbox-media">
          {media.kind === 'video'
            ? <video src={media.src} poster={media.poster} controls autoPlay playsInline />
            : <img src={media.src} alt={post.caption.slice(0, 140)} width={media.width} height={media.height} />}
        </div>
        <aside className="sp-lightbox-side">
          <span className="sp-meta"><Camera size={13} /> Instagram · {fmt(post.date)}</span>
          <p dir="auto">{post.caption}</p>
          <a href={post.url} target="_blank" rel="noopener noreferrer" className="sp-link">{t('View on Instagram', 'عرض على إنستغرام')}<ExternalLink size={14} /></a>
          <span className="sp-count">{i + 1} / {items.length}</span>
        </aside>
        {items.length > 1 && <>
          <button className="sp-lightbox-nav is-prev" onClick={() => go(-1)} aria-label={t('Previous', 'السابق')}><ChevronLeft size={26} /></button>
          <button className="sp-lightbox-nav is-next" onClick={() => go(1)} aria-label={t('Next', 'التالي')}><ChevronRight size={26} /></button>
        </>}
      </div>
    </div>
  );
}

function VideoCard({ post }: { post: ServicePost }) {
  const { t } = useGymLanguage();
  const fmt = useDate();
  const [playing, setPlaying] = useState(false);
  const video = post.media.find((m) => m.kind === 'video');
  const poster = video?.posterThumb || post.media[0]?.thumb;
  const caption = post.caption.split('\n').find((l) => l.trim().length > 2)?.replace(/#\S+/g, '').trim() ?? '';
  return (
    <figure className="sp-video">
      <div className="sp-video-frame">
        {video && playing
          ? <video src={video.src} poster={video.poster} controls autoPlay playsInline preload="metadata" />
          : video
            ? <button className="sp-video-poster" onClick={() => setPlaying(true)} aria-label={t('Play video', 'تشغيل الفيديو')}><img src={poster} alt="" loading="lazy" /><span className="sp-play"><Play size={22} fill="currentColor" /></span></button>
            : <a className="sp-video-poster" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={t('Watch on Instagram', 'شاهد على إنستغرام')}><img src={poster} alt="" loading="lazy" /><span className="sp-play is-external"><Play size={20} fill="currentColor" /></span><span className="sp-video-badge">{t('Watch on Instagram', 'شاهد على إنستغرام')}</span></a>}
      </div>
      <figcaption><span dir="auto">{caption.slice(0, 90)}</span><small>{fmt(post.date)}</small></figcaption>
    </figure>
  );
}

function PostCard({ post }: { post: ServicePost }) {
  const { t } = useGymLanguage();
  const fmt = useDate();
  const [open, setOpen] = useState(false);
  const first = post.media[0];
  const long = post.caption.length > 220;
  return (
    <article className="sp-post">
      <a className="sp-post-media" href={post.url} target="_blank" rel="noopener noreferrer" aria-label={t('Open on Instagram', 'افتح على إنستغرام')}>
        {first && <img src={first.thumb || first.src} alt="" loading="lazy" />}
        {post.media.some((m) => m.kind === 'video') && <span className="sp-post-flag"><Play size={12} fill="currentColor" /></span>}
        {post.media.length > 1 && <span className="sp-post-flag is-count"><Images size={12} />{post.media.length}</span>}
      </a>
      <div className="sp-post-body">
        <span className="sp-meta"><Camera size={12} /> {fmt(post.date)}{post.collab?.length ? ` · @${post.collab.join(' @')}` : ''}</span>
        <p dir="auto" className={open ? 'is-open' : ''}>{post.caption || t('Photo post', 'منشور صورة')}</p>
        <div className="sp-post-actions">
          {long && <button onClick={() => setOpen(!open)}>{open ? t('Show less', 'عرض أقل') : t('Read more', 'اقرأ المزيد')}</button>}
          <a href={post.url} target="_blank" rel="noopener noreferrer">{t('Original post', 'المنشور الأصلي')}<ArrowUpRight size={13} /></a>
        </div>
      </div>
    </article>
  );
}

function WeekSchedule() {
  const { t, lang } = useGymLanguage();
  const fmt = useDate();
  const { days: scheduleDays, classes: schedule } = useSchedule();
  return (
    <div className="sp-week">
      {scheduleDays.map((d) => {
        const rows = schedule.filter((c) => c.day === d.en);
        return (
          <div key={d.en} className="sp-week-day">
            <h4>{t(d.en, d.ar)}<small>{fmt(d.date)}</small></h4>
            <ul>{rows.map((c, k) => <li key={k}><b dir="ltr">{c.time} {c.period}</b><span>{t(c.name, c.ar)}</span><em>{c.coach.charAt(0) + c.coach.slice(1).toLowerCase()}</em></li>)}</ul>
          </div>
        );
      })}
      <p className="sp-note">{t('Times are start times; ask the team about duration and places.', 'الأوقات هي أوقات البدء؛ اسألي الفريق عن المدة والأماكن.')}</p>
    </div>
  );
}

export default function ServicePage({ service: published, posts, related, children }: { service: Service; posts: ServicePost[]; related: ServiceCard[]; children?: React.ReactNode }) {
  const { t, lang } = useGymLanguage();
  const fmt = useDate();
  const service = useService(published);
  const { contact } = useSiteInfo();
  const L = (b: Bi) => t(b[0], b[1]);
  const priceCat = usePlans().find((c) => c.service === published.slug);
  const Icon = serviceIcons[service.icon];
  const [box, setBox] = useState<number | null>(null);
  const [shown, setShown] = useState(6);
  const [photosShown, setPhotosShown] = useState(16);
  const [tag, setTag] = useState<TimelineTag | 'all'>('all');
  const [menuTab, setMenuTab] = useState(0);
  const phone = service.phone ?? { ...contact.phones[0], label: ['Call the club', 'اتصل بالنادي'] as Bi };

  const videos = useMemo(() => posts.filter((p) => p.media.some((m) => m.kind === 'video') || p.kind === 'video'), [posts]);
  const gallery = useMemo<GalleryItem[]>(() => posts.flatMap((post) => post.media.filter((m) => m.kind === 'image').map((media, index) => ({ post, media, index }))), [posts]);
  const timeline = useMemo(() => (service.timeline ?? []).filter((i) => tag === 'all' || i.tag === tag), [service.timeline, tag]);
  const tags = useMemo(() => Array.from(new Set((service.timeline ?? []).map((i) => i.tag))), [service.timeline]);
  const enquire = `/join?kind=${service.cta.kind}&interest=${encodeURIComponent(service.cta.interest)}`;
  const wa = `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(lang === 'ar' ? `مرحباً، أود الاستفسار عن ${service.name[1]}` : `Hello, I'd like to ask about ${service.name[0]}`)}`;

  return (
    <div className="sp">
      <section className="sp-hero">
        <div className="sp-hero-text">
          <nav className="sp-crumbs" aria-label={t('Breadcrumb', 'مسار التنقل')}><a href="/services">{t('Services', 'الخدمات')}</a><span>/</span><span aria-current="page">{L(service.name)}</span></nav>
          <span className="sp-kicker"><Icon size={14} />{L(service.kicker)}</span>
          <h1>{L(service.name)}</h1>
          <p className="sp-headline">{L(service.headline)}</p>
          <p className="sp-intro">{L(service.intro)}</p>
          <div className="sp-actions">
            {priceCat && <a className="sp-btn sp-btn-red" href={`/prices#${priceCat.id}`}>{t('Prices & plans', 'الأسعار والاشتراكات')}<ArrowUpRight size={17} /></a>}
            <a className={priceCat ? 'sp-btn' : 'sp-btn sp-btn-red'} href={enquire}>{L(service.cta.label)}<ArrowUpRight size={17} /></a>
            <a className="sp-btn" href={`tel:${phone.tel}`} title={L(phone.label)}><Phone size={15} /><span dir="ltr">{phone.display}</span></a>
            <a className="sp-btn sp-btn-ghost" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} />WhatsApp</a>
          </div>
          {posts.length > 0 && <p className="sp-stats"><b>{posts.length}</b> {t('posts', 'منشوراً')} · <b>{gallery.length}</b> {t('photos', 'صورة')} · <b>{videos.length}</b> {t('videos', 'فيديو')} <span>{t('from the club’s Instagram', 'من إنستغرام النادي')}</span></p>}
        </div>
        <figure className="sp-hero-img"><img src={service.hero.src} width={service.hero.width} height={service.hero.height} alt={L(service.hero.alt)} fetchPriority="high" /></figure>
      </section>

      {service.highlights.length > 0 && <section className="sp-band"><div className="sp-container"><ul className="sp-highlights">{service.highlights.map((h, k) => <li key={k}><Check size={15} />{L(h)}</li>)}</ul></div></section>}

      {(service.body?.length || service.facts.length > 0) && (
        <section className="sp-section"><div className="sp-container sp-split">
          <div className="sp-prose">
            <span className="sp-eyebrow">{t('ABOUT', 'نبذة')}</span>
            <h2>{L(service.headline)}</h2>
            {service.body?.map((b, k) => <p key={k}>{L(b)}</p>)}
            {service.links && <div className="sp-links">{service.links.map((l) => <a key={l.href} href={l.href} {...(l.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{L(l.label)}<ArrowUpRight size={14} /></a>)}</div>}
          </div>
          {service.facts.length > 0 && (
            <div className="sp-facts">
              <h3><Clock size={16} />{t('As published by the club', 'كما نشرها النادي')}</h3>
              <dl>{service.facts.map((f, k) => (
                <div key={k} className={f.past ? 'is-past' : ''}>
                  <dt>{L(f.label)}</dt>
                  <dd>{L(f.value)}</dd>
                  <small>{f.past ? t('Past post', 'منشور سابق') : t('Published', 'منشور')} · {fmt(f.date)} · <a href={f.source} target="_blank" rel="noopener noreferrer">{t('source', 'المصدر')}</a></small>
                </div>))}</dl>
              <p className="sp-note">{t('Prices and times can change. Past offers are for reference only — call the club to confirm.', 'قد تتغير الأسعار والأوقات. العروض السابقة للاطلاع فقط — اتصل بالنادي للتأكد.')}</p>
            </div>
          )}
        </div></section>
      )}

      {service.menu && (
        <section className="sp-section sp-paper" id="menu"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('MENU', 'المنيو')}</span><h2>{t('The Hydro Rest menu', 'منيو هايدرو ريست')}</h2></div><a className="sp-link" href={service.menu.source} target="_blank" rel="noopener noreferrer">{t('Original menu on Instagram', 'المنيو الأصلي على إنستغرام')}<ArrowUpRight size={14} /></a></div>
          <div className="sp-chips sp-menu-tabs" role="tablist" aria-label={t('Menu sections', 'أقسام المنيو')}>{service.menu.sections.map((sec, k) => <button key={k} role="tab" aria-selected={menuTab === k} className={menuTab === k ? 'is-on' : ''} onClick={() => setMenuTab(k)}>{L(sec.title)}</button>)}</div>
          <ul className="sp-menu" role="tabpanel">{service.menu.sections[menuTab]?.items.map((it, k) => (
            <li key={k}><div><b>{L(it.name)}</b>{it.desc && <p>{L(it.desc)}</p>}</div>
              <span className="sp-menu-prices">{it.prices.length ? it.prices.map((pr, j) => <span key={j}>{pr.label && <small>{L(pr.label)}</small>}<em dir="ltr">{pr.jd} JD</em></span>) : <span><small>{t('Ask at the counter', 'اسأل على الكاونتر')}</small></span>}</span></li>
          ))}</ul>
          <p className="sp-note">{L(service.menu.note)}</p>
          <div className="sp-menu-pages">{service.menu.pages.map((src, k) => <a key={src} href={src} target="_blank" rel="noopener noreferrer" aria-label={`${t('Menu page', 'صفحة المنيو')} ${k + 1}`}><img src={src} alt={`${t('Hydro Rest menu page', 'صفحة منيو هايدرو ريست')} ${k + 1}`} loading="lazy" /></a>)}</div>
        </div></section>
      )}
      {service.timeline && service.timeline.length > 0 && (
        <section className="sp-section sp-paper"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('TIMELINE', 'الخط الزمني')}</span><h2>{service.slug === 'offers' ? t('Announcements & offers', 'الإعلانات والعروض') : t('What’s happened', 'أبرز ما حدث')}</h2></div>
            {tags.length > 1 && <div className="sp-chips" role="group" aria-label={t('Filter', 'تصفية')}><button className={tag === 'all' ? 'is-on' : ''} onClick={() => setTag('all')}>{t('All', 'الكل')}</button>{tags.map((g) => <button key={g} className={tag === g ? 'is-on' : ''} onClick={() => setTag(g)}>{L(tagLabels[g])}</button>)}</div>}
          </div>
          <ol className="sp-timeline">{timeline.map((item, k) => (
            <li key={k}>
              <time dateTime={item.date}>{fmt(item.date)}</time>
              <div className="sp-tl-card">
                {item.image && <a href={item.source} target="_blank" rel="noopener noreferrer" className="sp-tl-img"><img src={`/images/thumbs/${item.image}.webp`} alt="" loading="lazy" /></a>}
                <div><span className={`sp-tag is-${item.tag}`}>{L(tagLabels[item.tag])}</span><h3>{L(item.title)}</h3>{item.text && <p>{L(item.text)}</p>}<a href={item.source} target="_blank" rel="noopener noreferrer" className="sp-link">{t('See the post', 'شاهد المنشور')}<ArrowUpRight size={13} /></a></div>
              </div>
            </li>))}</ol>
        </div></section>
      )}

      {service.schedule && (
        <section className="sp-section"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('THIS WEEK', 'هذا الأسبوع')}</span><h2>{t('Women’s class timetable', 'جدول حصص السيدات')}</h2></div><a className="sp-link" href="/classes">{t('Filter, save and request classes', 'تصفية الحصص وحفظها وطلبها')}<ArrowUpRight size={14} /></a></div>
          <WeekSchedule />
        </div></section>
      )}

      {videos.length > 0 && (
        <section className="sp-section sp-dark2"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('WATCH', 'شاهد')}</span><h2>{t('Videos & reels', 'الفيديوهات والريلز')}</h2></div><span className="sp-sub">{t('Real clips from the club’s Instagram', 'مقاطع حقيقية من إنستغرام النادي')}</span></div>
          <div className="sp-videos">{videos.slice(0, 12).map((p) => <VideoCard key={p.id} post={p} />)}</div>
        </div></section>
      )}

      {gallery.length > 0 && (
        <section className="sp-section"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('GALLERY', 'المعرض')}</span><h2>{t('Photos', 'الصور')}</h2></div><span className="sp-sub">{gallery.length} {t('photos and posters', 'صورة وملصق')}</span></div>
          <div className="sp-gallery">{gallery.slice(0, photosShown).map((g, k) => (
            <button key={g.post.id + g.index} onClick={() => setBox(k)} aria-label={t('Open photo', 'فتح الصورة')} style={{ aspectRatio: `${g.media.width} / ${g.media.height}` }}><img src={g.media.thumb || g.media.src} alt="" loading="lazy" width={g.media.width} height={g.media.height} /></button>
          ))}</div>
          {photosShown < gallery.length && <button className="sp-more" onClick={() => setPhotosShown((n) => n + 16)}>{t('More photos', 'المزيد من الصور')}<ChevronDown size={16} /></button>}
        </div></section>
      )}

      {service.coaches && service.coaches.length > 0 && (
        <section className="sp-section sp-paper"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('THE TEAM', 'الفريق')}</span><h2>{t('Coaches', 'المدربون')}</h2></div><a className="sp-link" href="/coaches">{t('All coaches', 'كل المدربين')}<ArrowUpRight size={14} /></a></div>
          <ul className="sp-coaches">{service.coaches.map((c, k) => <li key={k}><span className="sp-avatar">{L(c.name).replace(/^(Captain|Coach|الكابتن|كوتش)\s+/, '').charAt(0)}</span><div><b>{L(c.name)}</b><small>{L(c.role)}</small></div><a href={c.source} target="_blank" rel="noopener noreferrer" aria-label={t('Source', 'المصدر')}><ArrowUpRight size={14} /></a></li>)}</ul>
          <p className="sp-note">{t('Names as published by the club. Ask the team about each coach’s specialities.', 'الأسماء كما نشرها النادي. اسأل الفريق عن تخصص كل مدرب.')}</p>
        </div></section>
      )}

      {posts.length > 0 && service.slug !== 'offers' && (
        <section className="sp-section"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('FROM INSTAGRAM', 'من إنستغرام')}</span><h2>{t('Posts about', 'منشورات عن')} {L(service.name)}</h2></div><a className="sp-link" href={contact.instagram} target="_blank" rel="noopener noreferrer">@hydrogenplusfitness<ArrowUpRight size={14} /></a></div>
          <div className="sp-posts">{posts.slice(0, shown).map((p) => <PostCard key={p.id} post={p} />)}</div>
          {shown < posts.length && <button className="sp-more" onClick={() => setShown((n) => n + 6)}>{t('More posts', 'المزيد من المنشورات')} ({posts.length - shown})<ChevronDown size={16} /></button>}
        </div></section>
      )}

      {service.faqs.length > 0 && (
        <section className="sp-section sp-paper"><div className="sp-container sp-faq-wrap">
          <div><span className="sp-eyebrow">{t('QUESTIONS', 'أسئلة')}</span><h2>{t('Good to know', 'معلومات مفيدة')}</h2><a className="sp-link" href="/support">{t('More answers in Help', 'المزيد في صفحة المساعدة')}<ArrowUpRight size={14} /></a></div>
          <div className="sp-faq">{service.faqs.map((f, k) => <details key={k}><summary>{L(f.q)}<ChevronDown size={18} /></summary><p>{L(f.a)}</p></details>)}</div>
        </div></section>
      )}

      {children}
      {related.length > 0 && (
        <section className="sp-section"><div className="sp-container">
          <div className="sp-head"><div><span className="sp-eyebrow">{t('KEEP EXPLORING', 'استكشف المزيد')}</span><h2>{t('Related services', 'خدمات ذات صلة')}</h2></div><a className="sp-link" href="/services">{t('All services', 'كل الخدمات')}<ArrowUpRight size={14} /></a></div>
          <div className="sp-related">{related.map((r) => <ServiceTile key={r.slug} card={r} />)}</div>
        </div></section>
      )}

      {box !== null && <Lightbox items={gallery} start={box} onClose={() => setBox(null)} />}
    </div>
  );
}

export function ServiceTile({ card: published, large = false }: { card: ServiceCard; large?: boolean }) {
  const { t } = useGymLanguage();
  const patch = useOverrides().services?.[published.slug];
  const card = patch ? { ...published, ...(patch.name ? { name: patch.name } : {}), ...(patch.kicker ? { kicker: patch.kicker } : {}), ...(patch.intro ? { intro: patch.intro } : {}) } : published;
  const Icon = serviceIcons[card.icon];
  const L = (b: Bi) => t(b[0], b[1]);
  return (
    <a href={card.path} className={`sp-tile${large ? ' is-large' : ''}`}>
      <img src={card.hero.src} alt="" loading="lazy" />
      <span className="sp-tile-shade" />
      <span className="sp-tile-body">
        <span className="sp-kicker"><Icon size={13} />{L(card.kicker)}</span>
        <b>{L(card.name)}</b>
        {large && <span className="sp-tile-intro">{L(card.intro)}</span>}
        <span className="sp-tile-meta">{card.posts > 0 && <>{card.posts} {t('posts', 'منشوراً')}{card.videos > 0 && <> · {card.videos} {t('videos', 'فيديو')}</>}</>}<ArrowUpRight size={16} /></span>
      </span>
    </a>
  );
}

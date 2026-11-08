"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { ArrowLeft, ArrowUpRight, Camera, ChevronLeft, ChevronRight, ExternalLink, Images, Play, Search, X } from "lucide-react";
import { trademarkNotice, type Lang } from "@/lib/legal";
import "./social-archive.css";

export type SocialPost = {
 id: string;
 source: "instagram" | "facebook";
 url: string;
 publishedAt?: string;
 caption: string;
 kind: "image" | "carousel" | "video" | "text";
 media: { src: string; width: number; height: number; kind: "image" | "video"; poster?: string }[];
 category?: string;
};
type Props = { posts: SocialPost[]; lang: Lang; compact?: boolean };
const profiles = { instagram: "https://www.instagram.com/hydrogenplusfitness/", facebook: "https://www.facebook.com/hydrogenplusfitness" };
const text = {
 en: {
  eyebrow: "THE HYDROGEN COMMUNITY", title: "From the club.", intro: "The training. The people. The moments in between. Explore real updates from our Instagram and Facebook pages.", browse: "Explore the social archive", allSources: "All platforms", allTypes: "All content", instagram: "Instagram", facebook: "Facebook", image: "Photos", carousel: "Carousels", video: "Videos & reels", text: "Updates", sourceLabel: "Filter by platform", typeLabel: "Filter by content type", search: "Search captions, classes, or club moments", searchLabel: "Search social posts", imported: "archived entries", showing: "Showing", of: "of", loadMore: "More from the club", clear: "Clear filters", noMatches: "No posts match your search.", noMatchesText: "Try another word or explore all the imported posts.", noPosts: "Meet us on our social pages.", noPostsText: "Visit the club’s official pages for photos, training videos, and the latest news.", readMore: "Read full caption", readLess: "Show less", original: "View original post", watch: "Watch original reel", openMedia: "Open post media", close: "Close media viewer", previous: "Previous image", next: "Next image", caption: "Original caption", gallery: "Post media", unavailable: "View this media on the original post", imageAlt: "Hydrogen Plus Fitness social post", videoLabel: "Video from Hydrogen Plus Fitness", profilesTitle: "Keep up with every update.", profilesText: "This collection brings together the posts available to import. For the latest posts, stories, and anything unavailable here, visit our official pages.", back: "Back to the club", privacy: "Privacy Policy", terms: "Terms & Conditions", mediaCount: "items", picture: "Photo", nativeVideo: "Video", from: "From", openImage: "Open full-size image", archiveNote: "Original posts are preserved as published. Past offers and timetables may no longer apply; confirm current details with the club.", },
 ar: {
  eyebrow: "مجتمع HYDROGEN", title: "من قلب النادي.", intro: "التمارين. الناس. واللحظات التي تجمعنا. اكتشف منشورات حقيقية من صفحاتنا على إنستغرام وفيسبوك.", browse: "استكشف أرشيف المنشورات", allSources: "جميع المنصات", allTypes: "جميع المحتويات", instagram: "إنستغرام", facebook: "فيسبوك", image: "الصور", carousel: "مجموعات الصور", video: "الفيديو والريلز", text: "المستجدات", sourceLabel: "التصفية حسب المنصة", typeLabel: "التصفية حسب المحتوى", search: "ابحث في التعليقات أو الحصص أو لحظات النادي", searchLabel: "البحث في المنشورات", imported: "مادة مؤرشفة", showing: "عرض", of: "من", loadMore: "المزيد من النادي", clear: "مسح عوامل التصفية", noMatches: "لا توجد منشورات مطابقة.", noMatchesText: "جرّب كلمة أخرى أو تصفح جميع المنشورات المستوردة.", noPosts: "تابعنا على صفحاتنا الرسمية.", noPostsText: "زر صفحات النادي الرسمية لمشاهدة الصور ومقاطع التدريب وآخر الأخبار.", readMore: "قراءة التعليق كاملاً", readLess: "عرض أقل", original: "عرض المنشور الأصلي", watch: "مشاهدة الريلز الأصلي", openMedia: "فتح وسائط المنشور", close: "إغلاق عارض الوسائط", previous: "الصورة السابقة", next: "الصورة التالية", caption: "التعليق الأصلي", gallery: "وسائط المنشور", unavailable: "شاهد هذه الوسائط في المنشور الأصلي", imageAlt: "منشور Hydrogen Plus Fitness", videoLabel: "فيديو من Hydrogen Plus Fitness", profilesTitle: "ابقَ على اطلاع بكل جديد.", profilesText: "تجمع هذه الصفحة المنشورات التي أمكن استيرادها. لآخر المنشورات والقصص وأي محتوى غير متاح هنا، زر صفحاتنا الرسمية.", back: "العودة إلى النادي", privacy: "سياسة الخصوصية", terms: "الشروط والأحكام", mediaCount: "عناصر", picture: "صورة", nativeVideo: "فيديو", from: "من", openImage: "فتح الصورة بحجمها الكامل", archiveNote: "تُعرض المنشورات الأصلية كما نُشرت. قد لا تسري العروض والجداول السابقة حالياً؛ يرجى تأكيد التفاصيل الحالية مع النادي.", },
};

function postKey(post: SocialPost) { return `${post.source}-${post.id}`; }
function dateLabel(date: string | undefined, lang: Lang) {
 if (!date) return null;
 const parsed = new Date(/^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T12:00:00+03:00` : date);
 return Number.isNaN(parsed.getTime()) ? null : new Intl.DateTimeFormat(lang === "ar" ? "ar-JO" : "en-GB", { timeZone: "Asia/Amman", day: "numeric", month: "short", year: "numeric" }).format(parsed);
}
function mediaStyle(media: SocialPost["media"][number]): CSSProperties { return media.width > 0 ? { maxWidth: `min(100%, ${media.width}px)` } : {}; }

function PostMedia({ media, post, lang, full = false }: { media: SocialPost["media"][number]; post: SocialPost; lang: Lang; full?: boolean }) {
 const [failed, setFailed] = useState(false);
 useEffect(() => setFailed(false), [media.src]);
 const t = text[lang];
 if (failed) return <div className="hp-social-media-error"><Camera size={25} /><span>{t.unavailable}</span><ArrowUpRight size={16} /></div>;
 return media.kind === "video" ? <video controls preload="metadata" poster={media.poster} playsInline aria-label={t.videoLabel} width={media.width > 0 ? media.width : undefined} height={media.height > 0 ? media.height : undefined} style={mediaStyle(media)} onError={() => setFailed(true)}><source src={media.src} />{t.unavailable}</video> : <img src={media.src} alt={post.caption ? `${t.imageAlt}: ${post.caption.slice(0, 150)}` : t.imageAlt} width={media.width > 0 ? media.width : undefined} height={media.height > 0 ? media.height : undefined} loading={full ? "eager" : "lazy"} decoding="async" style={mediaStyle(media)} onError={() => setFailed(true)} />;
}

export default function SocialArchive({ posts, lang, compact = false }: Props) {
 const t = text[lang];
 const uid = useId();
 const [source, setSource] = useState("all");
 const [kind, setKind] = useState("all");
 const [query, setQuery] = useState("");
 const [count, setCount] = useState(12);
 const [expanded, setExpanded] = useState<Set<string>>(new Set());
 const [selected, setSelected] = useState<{ post: SocialPost; index: number } | null>(null);
 const dialog = useRef<HTMLDialogElement>(null);
 const filtered = useMemo(() => posts.filter((post) => (source === "all" || post.source === source) && (kind === "all" || post.kind === kind) && (!query.trim() || `${post.caption} ${post.category ?? ""}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))), [posts, source, kind, query]);
 const displayed = compact ? posts.filter((post) => post.media.length > 0).slice(0, 6) : filtered.slice(0, count);
 const hasFilters = source !== "all" || kind !== "all" || !!query;
 useEffect(() => { setCount(12); }, [source, kind, query]);
 useEffect(() => {
  if (selected && dialog.current && !dialog.current.open) dialog.current.showModal();
  if (!selected && dialog.current?.open) dialog.current.close();
 }, [selected]);
 useEffect(() => {
  if (!selected) return;
  const before = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => { document.body.style.overflow = before; };
 }, [selected]);
 function close() { dialog.current?.close(); setSelected(null); }
 function advance(direction: number) { setSelected((current) => current ? { ...current, index: (current.index + direction + current.post.media.length) % current.post.media.length } : null); }
 function toggleCaption(key: string) { setExpanded((previous) => { const next = new Set(previous); if (next.has(key)) next.delete(key); else next.add(key); return next; }); }
 function clear() { setSource("all"); setKind("all"); setQuery(""); }
 const activeMedia = selected?.post.media[selected.index];

 return <section className={`hp-social-archive${compact ? " hp-social-compact" : ""}`} lang={lang} dir={lang === "ar" ? "rtl" : "ltr"} aria-labelledby={`${uid}-title`}>
  <header className="hp-social-heading"><div><span className="hp-social-eyebrow"><i />{t.eyebrow}</span><h2 id={`${uid}-title`}>{t.title}</h2><p>{t.intro}</p></div>{compact && <a className="hp-social-link" href="/community">{t.browse}<ArrowUpRight size={18} /></a>}</header>
  {!compact && <div className="hp-social-coverage"><span><strong>{posts.filter(p=>p.media.length).length}</strong> {lang==='ar'?'منشوراً بصور أو فيديو':'posts with photos or video'}</span><span><strong>{posts.filter(p=>!p.media.length).length}</strong> {lang==='ar'?'رابطاً للمصادر الأصلية':'original-source links'}</span></div>}
  {!compact && <><div className="hp-social-filters"><label className="hp-social-search"><Search size={17} /><input type="search" placeholder={t.search} aria-label={t.searchLabel} value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span className="hp-social-sr-only">{t.sourceLabel}</span><select value={source} onChange={(event) => setSource(event.target.value)}><option value="all">{t.allSources}</option><option value="instagram">{t.instagram}</option><option value="facebook">{t.facebook}</option></select></label><label><span className="hp-social-sr-only">{t.typeLabel}</span><select value={kind} onChange={(event) => setKind(event.target.value)}><option value="all">{t.allTypes}</option>{(["image", "carousel", "video", "text"] as const).map((value) => <option key={value} value={value}>{t[value]}</option>)}</select></label></div><p className="hp-social-archive-note">{t.archiveNote}</p><div className="hp-social-results"><span>{t.showing} {Math.min(count, filtered.length)} {t.of} {filtered.length} {t.imported}</span>{hasFilters && <button type="button" onClick={clear}>{t.clear}</button>}</div></>}
  {displayed.length ? <div className="hp-social-grid">{displayed.map((post) => {
   const key = postKey(post); const first = post.media[0]; const date = dateLabel(post.publishedAt, lang); const isExpanded = expanded.has(key); const longCaption = post.caption.length > 180 || post.caption.split(/\r?\n/).length > 4;
   return <article className="hp-social-card" key={key}>
    <div className="hp-social-card-meta"><a href={profiles[post.source]} target="_blank" rel="noopener noreferrer"><span className={`hp-social-source hp-social-source-${post.source}`}>{post.source === "instagram" ? "IG" : "FB"}</span><span>{t[post.source]}</span></a>{date && <time dateTime={post.publishedAt}>{date}</time>}</div>
    {!first && <a className="hp-social-source-only" href={post.url} target="_blank" rel="noopener noreferrer"><Camera size={29}/><strong>{lang==='ar'?'عرض الصورة الأصلية':'View the original photo'}</strong><span>{lang==='ar'?'هذه الصورة متاحة على صفحة فيسبوك الأصلية.':'This photo is available on the original Facebook page.'}</span><ArrowUpRight size={19}/></a>}
    {first && <div className={`hp-social-media${first.kind === "video" ? " hp-social-native-video" : ""}`}>
     {first.kind === "video" ? <><PostMedia media={first} post={post} lang={lang} /><button type="button" className="hp-social-expand-video" aria-label={t.openMedia} onClick={() => setSelected({ post, index: 0 })}><ExternalLink size={16} /></button></> : <button className="hp-social-image-button" type="button" onClick={() => setSelected({ post, index: 0 })} aria-label={`${t.openMedia}: ${post.caption.slice(0, 80)}`}><PostMedia media={first} post={post} lang={lang} />{post.kind === "video" && <span className="hp-social-play"><Play size={24} fill="currentColor" /></span>}</button>}
     {post.media.length > 1 && <button className="hp-social-carousel-badge" type="button" onClick={() => setSelected({ post, index: 0 })} aria-label={`${post.media.length} ${t.mediaCount}`}><Images size={13} /><span>{post.media.length}</span></button>}
    </div>}
    <div className="hp-social-card-body">{post.category && <span className="hp-social-category">{post.category}</span>}{post.caption && <><p className={`hp-social-caption${isExpanded || !longCaption ? " hp-social-caption-expanded" : ""}`} dir="auto">{post.caption}</p>{longCaption && <button type="button" className="hp-social-read-more" onClick={() => toggleCaption(key)} aria-expanded={isExpanded}>{isExpanded ? t.readLess : t.readMore}</button>}</>}<a className="hp-social-original" href={post.url} target="_blank" rel="noopener noreferrer">{post.kind === "video" && !post.media.some((media) => media.kind === "video") ? t.watch : t.original}<ArrowUpRight size={14} /></a></div>
   </article>;
  })}</div> : <div className="hp-social-empty"><Camera size={35} /><h3>{hasFilters ? t.noMatches : t.noPosts}</h3><p>{hasFilters ? t.noMatchesText : t.noPostsText}</p>{hasFilters && <button className="hp-social-link" type="button" onClick={clear}>{t.clear}<ArrowUpRight size={16} /></button>}</div>}
  {!compact && displayed.length < filtered.length && <div className="hp-social-more"><button type="button" onClick={() => setCount((value) => value + 12)}>{t.loadMore}<span>+{Math.min(12, filtered.length - displayed.length)}</span></button></div>}
  {!compact && <aside className="hp-social-profiles"><div><span className="hp-social-eyebrow">@HYDROGENPLUSFITNESS</span><h3>{t.profilesTitle}</h3><p>{t.profilesText}</p></div><div><a href={profiles.instagram} target="_blank" rel="noopener noreferrer">{t.instagram}<ArrowUpRight size={17} /></a><a href={profiles.facebook} target="_blank" rel="noopener noreferrer">{t.facebook}<ArrowUpRight size={17} /></a></div></aside>}
  <dialog className="hp-social-dialog" ref={dialog} aria-label={t.gallery} onCancel={(event) => { event.preventDefault(); close(); }} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => { if ((event.target as HTMLElement).tagName === "VIDEO") return; if (selected && selected.post.media.length > 1 && event.key === "ArrowRight") { event.preventDefault(); advance(1); } if (selected && selected.post.media.length > 1 && event.key === "ArrowLeft") { event.preventDefault(); advance(-1); } }}>
   {selected && activeMedia && <div className="hp-social-viewer"><button type="button" className="hp-social-close" aria-label={t.close} onClick={close}><X size={23} /></button><div className="hp-social-viewer-stage"><PostMedia key={`${postKey(selected.post)}-${selected.index}`} media={activeMedia} post={selected.post} lang={lang} full />{selected.post.media.length > 1 && <><button type="button" className="hp-social-prev" aria-label={t.previous} onClick={() => advance(-1)}><ChevronLeft size={23} /></button><button type="button" className="hp-social-next" aria-label={t.next} onClick={() => advance(1)}><ChevronRight size={23} /></button><span className="hp-social-viewer-count" aria-live="polite">{selected.index + 1} / {selected.post.media.length}</span></>}</div><div className="hp-social-viewer-detail"><div className="hp-social-viewer-source"><span className={`hp-social-source hp-social-source-${selected.post.source}`}>{selected.post.source === "instagram" ? "IG" : "FB"}</span><div><strong>Hydrogen Plus Fitness</strong><span>{t[selected.post.source]}{dateLabel(selected.post.publishedAt, lang) && ` · ${dateLabel(selected.post.publishedAt, lang)}`}</span></div></div>{selected.post.caption && <p dir="auto">{selected.post.caption}</p>}<a className="hp-social-viewer-original" href={selected.post.url} target="_blank" rel="noopener noreferrer">{selected.post.kind === "video" && activeMedia.kind !== "video" ? t.watch : t.original}<ArrowUpRight size={17} /></a>{activeMedia.kind === "image" && <a className="hp-social-download-link" href={activeMedia.src} target="_blank" rel="noopener noreferrer">{t.openImage}<ExternalLink size={12} /></a>}</div></div>}
  </dialog>
 </section>;
}

export function CommunityArchive({ posts }: { posts: SocialPost[] }) {
 const [lang, setLang] = useState<Lang>("en");
 useEffect(() => { try { if (localStorage.getItem("hp-language") === "ar") setLang("ar"); } catch { /* Browser preferences are optional. */ } }, []);
 useEffect(() => { document.title = lang === "ar" ? "من قلب النادي | Hydrogen Plus Fitness" : "From the club | Hydrogen Plus Fitness"; }, [lang]);
 function toggle() { const next = lang === "en" ? "ar" : "en"; setLang(next); try { localStorage.setItem("hp-language", next); } catch { /* Keep this visit usable without storage. */ } }
 const t = text[lang];
 return <main className="hp-community" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}><div className="hp-community-shell"><nav className="hp-community-nav" aria-label={lang === "ar" ? "التنقل" : "Navigation"}><a className="hp-community-brand" href="/"><img src="/images/logo-large.jpg" alt="Hydrogen Plus Fitness" width="44" height="44" /><span>HYDROGEN<span>+</span><small>FITNESS & SPA</small></span></a><div><button type="button" onClick={toggle} lang={lang === "en" ? "ar" : "en"}>{lang === "en" ? "العربية" : "English"}</button><a className="hp-community-back" href="/"><ArrowLeft size={15} />{t.back}</a></div></nav><SocialArchive posts={posts} lang={lang} /><footer className="hp-community-footer"><div><a href={lang === "ar" ? "/ar/privacy" : "/privacy"}>{t.privacy}</a><a href={lang === "ar" ? "/ar/terms" : "/terms"}>{t.terms}</a><a href="tel:+962792151000" dir="ltr">+962 7 9215 1000</a></div><p>{trademarkNotice(lang)}</p></footer></div></main>;
}

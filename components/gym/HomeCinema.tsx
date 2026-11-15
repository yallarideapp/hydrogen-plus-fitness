'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { useGymLanguage } from './SiteShell';

// The home banner as a short film you scroll through. The stage stays on screen while the section scrolls:
//   1. The gym in the dark: its own ceiling lights flicker on (first page of a visit, under the splash), then
//      the camera flies down the track toward the screen at its end.
//   2. A flash, and STRENGTH slams in over the machines (with a hit of camera shake).
//   3. A whip pan to the dumbbell wall: MOVEMENT.
//   4. A slow fade to the rooftop pool at sunset: RECOVERY.
//   5. The way in: the buttons.
// Every frame comes from the club's own photos. The timeline runs on the browser's scroll timeline where it
// exists (Safari 26+, Chrome), so it moves in step with the finger; older browsers get the same keyframes
// driven by a light scroll loop. With reduced motion, or before the script runs, it is a plain banner.

const SHOT1 = { w: 2048, h: 1365, vanish: [0.47, 0.44] }; // gym-03: end of the track
const LIGHTS = ['/images/display/hero-lights-near.webp', '/images/display/hero-lights-far.webp'];
const FLICKER: Keyframe[] = [
  { opacity: 0 }, { opacity: 0.85, offset: 0.1 }, { opacity: 0.08, offset: 0.18 }, { opacity: 1, offset: 0.3 },
  { opacity: 0.35, offset: 0.38 }, { opacity: 1, offset: 0.52 }, { opacity: 1 },
];

/** Keyframes along the scroll (offset 0 = start of the film, 1 = end). */
function timeline(rtl: boolean): [string, Keyframe[]][] {
  const side = rtl ? -1 : 1; // whip pan follows the reading direction
  return [
    ['.hx-cine-hint', [{ opacity: 1 }, { opacity: 0, offset: 0.04 }, { opacity: 0 }]],
    ['.hx-cine-intro', [
      { opacity: 1, transform: 'none' },
      { opacity: 0, transform: 'translate3d(0,-6vh,0) scale(1.18)', offset: 0.1 },
      { opacity: 0, transform: 'translate3d(0,-6vh,0) scale(1.18)' },
    ]],
    ['.hx-shot-1', [
      { opacity: 1, transform: 'scale(1)' },
      { opacity: 1, transform: 'scale(2.7)', offset: 0.29, easing: 'steps(1,end)' },
      { opacity: 0, transform: 'scale(2.7)', offset: 0.3 },
      { opacity: 0, transform: 'scale(2.7)' },
    ]],
    ['.hx-cine-flash', [
      { opacity: 0 }, { opacity: 0, offset: 0.25 }, { opacity: 0.92, offset: 0.295 }, { opacity: 0, offset: 0.37 }, { opacity: 0 },
    ]],
    ['.hx-shot-2', [
      { opacity: 0, transform: 'scale(1.45)' },
      { opacity: 0, transform: 'scale(1.45)', offset: 0.29 },
      { opacity: 1, transform: 'scale(1.3)', offset: 0.3 },
      { opacity: 1, transform: 'scale(1.04)', offset: 0.37 },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1.1)', offset: 0.52 },
      { opacity: 0, transform: `translate3d(${-38 * side}%,0,0) scale(1.1)`, offset: 0.565 },
      { opacity: 0, transform: `translate3d(${-38 * side}%,0,0) scale(1.1)` },
    ]],
    ['.hx-word-2', [
      { opacity: 0, transform: 'scale(2.8)' },
      { opacity: 0, transform: 'scale(2.8)', offset: 0.305 },
      { opacity: 1, transform: 'scale(1)', offset: 0.345, easing: 'ease-out' },
      { opacity: 1, transform: 'scale(.97)', offset: 0.47 },
      { opacity: 0, transform: 'translate3d(0,-7vh,0) scale(.97)', offset: 0.53 },
      { opacity: 0, transform: 'translate3d(0,-7vh,0) scale(.97)' },
    ]],
    ['.hx-cine-stage-inner', [
      { transform: 'none' }, { transform: 'none', offset: 0.343 },
      { transform: 'translate3d(9px,-7px,0) rotate(.35deg)', offset: 0.349 },
      { transform: 'translate3d(-8px,5px,0) rotate(-.3deg)', offset: 0.356 },
      { transform: 'translate3d(5px,3px,0)', offset: 0.363 },
      { transform: 'translate3d(-3px,-2px,0)', offset: 0.37 },
      { transform: 'none', offset: 0.378 }, { transform: 'none' },
    ]],
    ['.hx-shot-3', [
      { opacity: 0, transform: `translate3d(${45 * side}%,0,0) scale(1.06)` },
      { opacity: 0, transform: `translate3d(${45 * side}%,0,0) scale(1.06)`, offset: 0.52 },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1.06)', offset: 0.57 },
      { opacity: 1, transform: 'translate3d(0,0,0) scale(1.16)', offset: 0.74 },
      { opacity: 0, transform: 'translate3d(0,0,0) scale(1.2)', offset: 0.8 },
      { opacity: 0, transform: 'scale(1.2)' },
    ]],
    ['.hx-word-3', [
      { opacity: 0, transform: `translate3d(${60 * side}%,0,0)` },
      { opacity: 0, transform: `translate3d(${60 * side}%,0,0)`, offset: 0.545 },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 0.6, easing: 'ease-out' },
      { opacity: 1, transform: 'translate3d(0,0,0)', offset: 0.7 },
      { opacity: 0, transform: 'translate3d(0,0,0) scale(.88)', offset: 0.76 },
      { opacity: 0, transform: 'scale(.88)' },
    ]],
    ['.hx-shot-4', [
      { opacity: 0, transform: 'scale(1.3)' },
      { opacity: 0, transform: 'scale(1.3)', offset: 0.74 },
      { opacity: 1, transform: 'scale(1.16)', offset: 0.81 },
      { opacity: 1, transform: 'scale(1)' },
    ]],
    ['.hx-word-4', [
      { opacity: 0, transform: 'translate3d(0,5vh,0)' },
      { opacity: 0, transform: 'translate3d(0,5vh,0)', offset: 0.78 },
      { opacity: 1, transform: 'none', offset: 0.85, easing: 'ease-out' },
      { opacity: 1, transform: 'none', offset: 0.9 },
      { opacity: 0, transform: 'translate3d(0,-4vh,0)', offset: 0.94 },
      { opacity: 0, transform: 'translate3d(0,-4vh,0)' },
    ]],
    ['.hx-cine-outro', [
      { opacity: 0, transform: 'translate3d(0,4vh,0)', visibility: 'hidden' },
      { opacity: 0, transform: 'translate3d(0,4vh,0)', visibility: 'visible', offset: 0.92 },
      { opacity: 1, transform: 'none', visibility: 'visible', offset: 0.98 },
      { opacity: 1, transform: 'none', visibility: 'visible' },
    ]],
    ['.hx-cine-bar>i', [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }]],
  ];
}

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Set the first time the film is shown on this device; after that the home page opens on the plain banner. */
const SEEN_KEY = 'hp-film-seen';

export default function HomeCinema() {
  const { t, lang } = useGymLanguage();
  const section = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const [lights, setLights] = useState(false);

  // After hydration: switch the film on (the first time the home page opens on this device), and the lights
  // intro if the splash is still up. Every later visit gets the plain banner. Add ?film to the address to see it again.
  useEffect(() => {
    if (reduced()) return;
    let seen = false;
    try { seen = localStorage.getItem(SEEN_KEY) === '1'; } catch { /* storage blocked: show it */ }
    if (seen && !/[?&]film\b/.test(location.search)) return;
    // Counted as seen as soon as it is shown: the next visit opens on the plain banner, even if they left halfway.
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    const splashing = document.documentElement.classList.contains('hx-splashing');
    const id = requestAnimationFrame(() => { setOn(true); if (splashing) setLights(true); });
    return () => cancelAnimationFrame(id);
  }, []);

  // Sizes: the bottom bar, the space above the banner, and where the track ends in the first photo.
  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    const root = document.documentElement;
    const shot1 = sec.querySelector<HTMLElement>('.hx-shot-1');
    const fit = () => {
      const dock = document.querySelector<HTMLElement>('.hp3-mobile-dock');
      root.style.setProperty('--hx-dock-h', dock && getComputedStyle(dock).display !== 'none' ? `${dock.offsetHeight}px` : '0px');
      // Space above the film (top bar + header), so the first screen still shows the heading and buttons.
      root.style.setProperty('--hx-head-h', `${Math.round(sec.getBoundingClientRect().top + window.scrollY)}px`);
      if (shot1) {
        const w = shot1.clientWidth, h = shot1.clientHeight;
        const s = Math.max(w / SHOT1.w, h / SHOT1.h), dw = SHOT1.w * s, dh = SHOT1.h * s;
        shot1.style.transformOrigin = `${((w - dw) * 0.5 + SHOT1.vanish[0] * dw).toFixed(1)}px ${((h - dh) / 2 + SHOT1.vanish[1] * dh).toFixed(1)}px`;
      }
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(sec);
    return () => ro.disconnect();
  }, []);

  // The film itself.
  useEffect(() => {
    const sec = section.current;
    if (!on || !sec) return;
    const anims: Animation[] = [];
    const scrollDriven = 'ViewTimeline' in window;
    for (const [sel, kf] of timeline(lang === 'ar')) {
      for (const el of sec.querySelectorAll<HTMLElement>(sel)) {
        if (scrollDriven) {
          const VT = (window as unknown as { ViewTimeline: new (o: { subject: Element; axis: string }) => AnimationTimeline }).ViewTimeline;
          anims.push(el.animate(kf, { timeline: new VT({ subject: sec, axis: 'block' }), rangeStart: 'contain 0%', rangeEnd: 'contain 100%', fill: 'both', easing: 'linear' } as KeyframeAnimationOptions));
        } else {
          const a = el.animate(kf, { duration: 1000, fill: 'both', easing: 'linear' });
          a.pause();
          anims.push(a);
        }
      }
    }
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = sec.getBoundingClientRect();
      const run = sec.offsetHeight - sec.querySelector<HTMLElement>('.hx-cine-stage')!.offsetHeight;
      const p = Math.min(Math.max(-r.top / Math.max(run, 1), 0), 1);
      if (!scrollDriven) for (const a of anims) a.currentTime = p * 1000;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    if (!scrollDriven) { tick(); addEventListener('scroll', onScroll, { passive: true }); }
    return () => { anims.forEach((a) => a.cancel()); removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [on, lang]);

  // Lights on, under the splash only.
  useEffect(() => {
    const sec = section.current;
    if (!lights || !sec) return;
    const d = document.documentElement;
    const veil = sec.querySelector<HTMLElement>('.hx-veil');
    const layers = [...sec.querySelectorAll<HTMLImageElement>('.hx-lights')];
    let cancelled = false;
    const anims: Animation[] = [];
    const done = () => { if (!cancelled) setLights(false); };
    (async () => {
      if (!veil || layers.length !== LIGHTS.length) return done();
      try { await Promise.all(layers.map((l) => l.decode())); } catch { return done(); }
      while (!cancelled && d.classList.contains('hx-splashing')) await new Promise((r) => setTimeout(r, 60));
      if (cancelled) return;
      anims.push(layers[0].animate(FLICKER, { duration: 760, delay: 120, fill: 'both' }));
      anims.push(layers[1].animate(FLICKER, { duration: 820, delay: 420, fill: 'both' }));
      anims.push(veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 620, delay: 1000, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' }));
      const fades = layers.map((l) => l.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 1620, fill: 'forwards' }));
      anims.push(...fades);
      try { await Promise.all(fades.map((a) => a.finished)); } catch { return; }
      done();
    })();
    return () => { cancelled = true; anims.forEach((a) => a.cancel()); };
  }, [lights]);

  const words = [
    { cls: 'hx-word-2', big: t('STRENGTH.', 'القوة.'), small: t('Pro machines for every muscle.', 'أجهزة احترافية لكل عضلة.') },
    { cls: 'hx-word-3', big: t('MOVEMENT.', 'الحركة.'), small: t('Cardio, classes and boxing.', 'كارديو، حصص، وملاكمة.') },
    { cls: 'hx-word-4', big: t('RECOVERY.', 'التعافي.'), small: t('A rooftop pool, spa and Hydro Rest.', 'مسبح على السطح، سبا، وهايدرو ريست.') },
  ];

  return (
    <section ref={section} className={`hx-cine${on ? ' is-on' : ''}`} aria-label={t('Hydrogen Plus Fitness & Spa', 'هايدروجين بلس فتنس آند سبا')}>
      <div className="hx-cine-stage">
        <div className="hx-cine-stage-inner">
          <div className="hx-cine-shot hx-shot-1">
            <img src="/images/display/gym-03.webp" width={2048} height={1365} alt={t('Inside the real Hydrogen Plus Fitness gym', 'داخل نادي هايدروجين بلس الحقيقي')} fetchPriority="high" />
            {lights && <>
              <span className="hx-veil" />
              {LIGHTS.map((src) => <img key={src} className="hx-lights" src={src} alt="" width={1600} height={1066} decoding="async" />)}
            </>}
          </div>
          {on && <>
            <div className="hx-cine-shot hx-shot-2"><img src="/images/display/gym-05.webp" width={2048} height={1365} alt="" decoding="async" /></div>
            <div className="hx-cine-shot hx-shot-3"><img src="/images/display/gym-06.webp" width={2048} height={1365} alt="" decoding="async" /></div>
            <div className="hx-cine-shot hx-shot-4"><img src="/images/display/pool-04.webp" width={2048} height={1365} alt="" decoding="async" /></div>
          </>}
          <div className="hx-cine-shade" />
          <div className="hx-cine-flash" />

          <div className="hx-cine-intro">
            <span className="hx-cine-kicker">{t('HYDROGEN PLUS FITNESS & SPA · IRBID', 'هايدروجين بلس فتنس آند سبا · إربد')}</span>
            <h1>{t('BUILT FOR', 'هنا تُصنع')}<br /><em>{t('MORE.', 'القوة.')}</em></h1>
            <p>{t('More strength. More movement. More life. Find your place to train, recharge and become the version of you that keeps moving forward.', 'قوة أكبر، حركة أكثر، وحياة أفضل. هنا تتمرّن وتستعيد طاقتك، وتبدأ رحلتك نحو نسخة أقوى من نفسك.')}</p>
            <div className="hx-cine-buttons">
              <a href="/prices" className="hp3-button hp3-red">{t('Plans & prices', 'الأسعار والاشتراكات')}<ArrowUpRight size={18} /></a>
              <a href="/classes" className="hx-cine-ghost">{t('Find a class', 'اختر حصتك')}<ArrowUpRight size={16} /></a>
            </div>
          </div>

          {on && words.map((w) => (
            <div key={w.cls} className={`hx-cine-word ${w.cls}`} aria-hidden="true"><strong>{w.big}</strong><span>{w.small}</span></div>
          ))}

          {on && (
            <div className="hx-cine-outro">
              <strong>{t('Your club is ready.', 'ناديك جاهز.')}</strong>
              <div className="hx-cine-buttons">
                <a href="/prices" className="hp3-button hp3-red">{t('Plans & prices', 'الأسعار والاشتراكات')}<ArrowUpRight size={18} /></a>
                <a href="/club?tour=1" className="hx-cine-ghost">{t('Explore the club', 'استكشف النادي')}<ArrowUpRight size={16} /></a>
              </div>
            </div>
          )}

          {on && <>
            <div className="hx-cine-hint" aria-hidden="true"><span>{t('Scroll to step inside', 'اسحب لتدخل النادي')}</span><ArrowDown size={16} /></div>
            <div className="hx-cine-bar" aria-hidden="true"><i /></div>
          </>}
        </div>
      </div>
    </section>
  );
}

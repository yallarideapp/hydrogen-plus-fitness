'use client';

import { useEffect, useRef, useState } from 'react';

// Motion for the home banner photo (gym-03 only; the numbers below are measured on it).
//
// 1. Lights on — only when the splash screen is showing (first page of a visit). Under the splash the
//    photo gets a dark veil; when the splash lifts, the gym's own ceiling strips flicker on (near, then
//    far, the screens and the signs) and the veil fades. The light layers are cut from this same photo,
//    and everything is removed afterwards, leaving the photo itself. Nothing is dark before React runs,
//    so a slow or failed script can never leave the photo dark.
// 2. Walk in — while the banner scrolls away, the photo moves toward the end of the track and the two
//    cards slide out to the sides. Where the browser supports scroll-driven animations (Safari 26+,
//    Chrome) the browser runs it from CSS, in step with the scroll; elsewhere a light rAF loop writes
//    the transforms straight to the three elements.
// The heading, text and buttons never move. Both effects are skipped with reduced motion.

const SIZE = [2048, 1365];
const VANISH = [0.47, 0.44]; // end of the track, as a share of the photo
const LIGHTS = ['/images/display/hero-lights-near.webp', '/images/display/hero-lights-far.webp'];
const ZOOM = 0.45; // extra scale at the end of the walk
const FLICKER: Keyframe[] = [
  { opacity: 0 }, { opacity: 0.85, offset: 0.1 }, { opacity: 0.08, offset: 0.18 }, { opacity: 1, offset: 0.3 },
  { opacity: 0.35, offset: 0.38 }, { opacity: 1, offset: 0.52 }, { opacity: 1 },
];

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const cssScroll = () => typeof CSS !== 'undefined' && CSS.supports('animation-timeline: scroll()') && CSS.supports('animation-range: 0px 100px');

export default function HeroMotion() {
  const ref = useRef<HTMLSpanElement>(null);
  const [lights, setLights] = useState(false);

  // Walk in.
  useEffect(() => {
    const frame = ref.current?.parentElement;
    const hero = frame?.closest<HTMLElement>('.hp3-home-hero');
    const stage = frame?.parentElement;
    const img = frame?.querySelector<HTMLImageElement>(':scope > img');
    const tour = stage?.querySelector<HTMLElement>('.hp3-hero-tour');
    const pool = stage?.querySelector<HTMLElement>('.hp3-hero-pool');
    if (!frame || !hero || !stage || !img || reduced()) return;
    const root = document.documentElement;
    let end = 600;
    const measure = () => {
      // Vanishing point inside the frame (object-fit: cover, object-position: 60% center).
      const w = frame.clientWidth, h = frame.clientHeight;
      const s = Math.max(w / SIZE[0], h / SIZE[1]), dw = SIZE[0] * s, dh = SIZE[1] * s;
      frame.style.setProperty('--hx-vp', `${((w - dw) * 0.6 + VANISH[0] * dw).toFixed(1)}px ${((h - dh) / 2 + VANISH[1] * dh).toFixed(1)}px`);
      // The walk finishes when the photo's bottom reaches a third of the way down the screen.
      const r = stage.getBoundingClientRect();
      end = Math.max(240, Math.round(r.bottom + window.scrollY - innerHeight / 3));
      root.style.setProperty('--hx-walk-end', `${end}px`);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(stage);

    if (cssScroll()) {
      hero.classList.add('hx-walk-css');
      return () => { ro.disconnect(); hero.classList.remove('hx-walk-css'); };
    }
    const narrow = matchMedia('(max-width: 600px)');
    let raf = 0, last = -1;
    const tick = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / end, 0), 1);
      if (Math.abs(p - last) < 0.002) return;
      last = p;
      img.style.transform = `scale(${(1 + ZOOM * p).toFixed(4)})`;
      // Phones: the cards slide out to the sides. Wide screens: they sink and fade (sideways would cover the heading).
      if (narrow.matches) {
        if (tour) { tour.style.transform = `translate3d(${(-110 * p).toFixed(2)}%,0,0)`; tour.style.opacity = String(1 - p * 0.9); }
        if (pool) { pool.style.transform = `translate3d(${(110 * p).toFixed(2)}%,0,0)`; pool.style.opacity = String(1 - p * 0.9); }
      } else {
        if (tour) { tour.style.transform = `translate3d(0,${(70 * p).toFixed(1)}px,0)`; tour.style.opacity = String(1 - p); }
        if (pool) { pool.style.transform = `translate3d(0,${(110 * p).toFixed(1)}px,0)`; pool.style.opacity = String(1 - p); }
      }
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    hero.classList.add('hx-walk-js');
    tick();
    addEventListener('scroll', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); hero.classList.remove('hx-walk-js');
      for (const el of [img, tour, pool]) if (el) { el.style.transform = ''; el.style.opacity = ''; }
    };
  }, []);

  // Lights on: only while the splash is up.
  useEffect(() => {
    if (!reduced() && document.documentElement.classList.contains('hx-splashing')) setLights(true);
  }, []);

  useEffect(() => {
    if (!lights) return;
    const d = document.documentElement;
    const frame = ref.current?.parentElement;
    const veil = frame?.querySelector<HTMLElement>('.hx-veil');
    const layers = frame ? [...frame.querySelectorAll<HTMLImageElement>('.hx-lights')] : [];
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
      const room = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 620, delay: 1000, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
      const fades = layers.map((l) => l.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 260, delay: 1620, fill: 'forwards', composite: 'replace' }));
      anims.push(room, ...fades);
      try { await Promise.all(fades.map((a) => a.finished)); } catch { return; }
      done();
    })();
    return () => { cancelled = true; anims.forEach((a) => a.cancel()); };
  }, [lights]);

  return (
    <span ref={ref} className="hx-motion" aria-hidden="true">
      {lights && <>
        <span className="hx-veil" />
        {LIGHTS.map((src) => <img key={src} className="hx-lights" src={src} alt="" width={1600} height={1066} decoding="async" />)}
      </>}
    </span>
  );
}

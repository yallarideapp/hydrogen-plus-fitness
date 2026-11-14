'use client';

import { useEffect, useRef, useState } from 'react';

// Motion for the home banner photo (gym-03 only; the numbers below are measured on it).
//
// 1. Lights on — once per session. The gym starts dark (class set by the inline script in the layout,
//    before the first paint) and its own ceiling lights flicker on, near strips first, then the far ones,
//    the screens and the signs. Then the whole room lights up. The light layers are cut from this same
//    photo, so the last frame is the photo itself; the layers are removed afterwards.
// 2. Walk in — while the banner scrolls away, the photo moves toward the end of the track (its vanishing
//    point) and the pool and tour cards drift at different speeds for depth.
// Nothing else moves: the heading, text and buttons stay put. Both effects are skipped with reduced motion.

const SIZE = [2048, 1365];
const VANISH = [0.47, 0.44]; // end of the track, as a share of the photo
const POS_X = 0.6; // object-position: 60% center in experiences.css
const LIGHTS = ['/images/display/hero-lights-near.webp', '/images/display/hero-lights-far.webp'];
const FLICKER: Keyframe[] = [
  { opacity: 0 }, { opacity: 0.85, offset: 0.08 }, { opacity: 0.08, offset: 0.15 }, { opacity: 1, offset: 0.24 },
  { opacity: 0.3, offset: 0.31 }, { opacity: 1, offset: 0.44 }, { opacity: 1 },
];
/** If the intro has not started by now (slow phone), show the lit photo and skip it. */
const LATEST_START_MS = 8000;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroMotion() {
  const ref = useRef<HTMLSpanElement>(null);
  const [lights, setLights] = useState(false);

  // Walk in.
  useEffect(() => {
    const host = ref.current?.parentElement;
    const hero = host?.closest<HTMLElement>('.hp3-home-hero');
    if (!host || !hero || reduced()) return;
    const fit = () => {
      const w = host.clientWidth, h = host.clientHeight;
      const s = Math.max(w / SIZE[0], h / SIZE[1]), dw = SIZE[0] * s, dh = SIZE[1] * s;
      hero.style.setProperty('--hx-vp', `${((w - dw) * POS_X + VANISH[0] * dw).toFixed(1)}px ${((h - dh) / 2 + VANISH[1] * dh).toFixed(1)}px`);
    };
    let raf = 0;
    const tick = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / (hero.offsetHeight * 0.85), 0), 1);
      hero.style.setProperty('--hx-walk', p.toFixed(4));
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(tick); };
    fit(); tick();
    hero.classList.add('hx-walking');
    const ro = new ResizeObserver(fit);
    ro.observe(host);
    addEventListener('scroll', onScroll, { passive: true });
    return () => { removeEventListener('scroll', onScroll); ro.disconnect(); cancelAnimationFrame(raf); hero.classList.remove('hx-walking'); };
  }, []);

  // Lights on: mount the layers only when the layout script darkened the photo.
  useEffect(() => {
    if (document.documentElement.classList.contains('hx-hero-dark')) setLights(true);
  }, []);

  useEffect(() => {
    if (!lights) return;
    const d = document.documentElement;
    const host = ref.current?.parentElement;
    const img = host?.querySelector<HTMLImageElement>(':scope > img');
    const layers = host ? [...host.querySelectorAll<HTMLImageElement>('.hx-lights')] : [];
    let cancelled = false;
    const anims: Animation[] = [];
    const end = () => { d.classList.remove('hx-hero-dark'); if (!cancelled) setLights(false); };
    (async () => {
      if (!img || layers.length !== LIGHTS.length) return end();
      try { await Promise.all([img.decode(), ...layers.map((l) => l.decode())]); } catch { return end(); }
      while (!cancelled && d.classList.contains('hx-splashing')) await new Promise((r) => setTimeout(r, 80));
      if (cancelled) return;
      if (performance.now() > LATEST_START_MS) return end();
      try { sessionStorage.setItem('hp-hero-lights', '1'); } catch { /* private mode */ }
      anims.push(layers[0].animate(FLICKER, { duration: 900, delay: 250, fill: 'both' }));
      anims.push(layers[1].animate(FLICKER, { duration: 1000, delay: 700, fill: 'both' }));
      const room = img.animate([{ filter: 'brightness(.12)' }, { filter: 'brightness(1)' }], { duration: 950, delay: 1450, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'both' });
      anims.push(room);
      try { await room.finished; } catch { return; }
      if (cancelled) return;
      d.classList.remove('hx-hero-dark');
      room.cancel();
      const fades = layers.map((l) => l.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 250, fill: 'forwards' }));
      anims.push(...fades);
      try { await Promise.all(fades.map((a) => a.finished)); } catch { return; }
      end();
    })();
    return () => { cancelled = true; anims.forEach((a) => a.cancel()); d.classList.remove('hx-hero-dark'); };
  }, [lights]);

  return (
    <span ref={ref} className="hx-motion" aria-hidden="true">
      {lights && LIGHTS.map((src) => <img key={src} className="hx-lights" src={src} alt="" width={1600} height={1066} decoding="async" />)}
    </span>
  );
}

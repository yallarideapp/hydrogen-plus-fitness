'use client';

import { useEffect, useRef, useState } from 'react';

// Home banner intro: "load the bar". Plays once per visit, right as the splash lifts (first page = home).
//   - A steel bar slides in over the banner photos (above the two cards), then three pairs of plates slam on from the sides:
//     the big ones first, like a real lift. Each impact shakes the photo, bumps the KG counter
//     (20 → 70 → 110 → 140) and slams one word of the heading into place.
//   - The red plus pops in the middle: the loaded bar is the Hydrogen+ logo.
//   - The power bar under the heading fills, the overlay clears, and the banner is back to normal.
// The plates and plus use the logo's own geometry (the splash screen draws the same shapes).
// Skipped with reduced motion. Before the script runs nothing is hidden, so a failure leaves the plain banner.

const IMPACTS = [600, 900, 1200]; // ms after start: inner, middle, outer pair lands
const KG = [70, 110, 140];
const SLAM_MS = 250;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function HeroLoad() {
  const ref = useRef<HTMLSpanElement>(null);
  const [run, setRun] = useState(false);
  const [kg, setKg] = useState(20);

  useEffect(() => {
    if (reduced() || !document.documentElement.classList.contains('hx-splashing')) return;
    const id = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const load = ref.current;
    const frame = load?.parentElement;
    const hero = frame?.closest<HTMLElement>('.hp3-home-hero');
    if (!run || !load || !frame || !hero) return;
    const d = document.documentElement;
    const words = [...hero.querySelectorAll<HTMLElement>('.hx-w')];
    const power = hero.querySelector<HTMLElement>('.hx-power>i');
    const q = (s: string) => load.querySelector<SVGGraphicsElement>(s)!;
    const anims: Animation[] = [];
    const timers: number[] = [];
    const add = (el: Element | null | undefined, kf: Keyframe[], o: KeyframeAnimationOptions) => {
      if (!el) return;
      const a = el.animate(kf, { fill: 'both', ...o });
      a.pause();
      anims.push(a);
    };

    // Build every animation now, paused at 0, so the hidden start state is in place under the splash.
    add(load.querySelector('.hx-load-scrim'), [{ opacity: 0 }, { opacity: 1 }], { duration: 260 });
    add(q('.hx-bar'), [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 300, delay: 120, easing: 'cubic-bezier(.2,.8,.2,1)' });
    add(load.querySelector('.hx-kg'), [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 260, delay: 260 });
    ([['.hx-p1', 0], ['.hx-p2', 1], ['.hx-p3', 2]] as const).forEach(([sel, i]) => {
      const land = IMPACTS[i];
      for (const [side, from] of [['l', -260], ['r', 260]] as const) {
        add(q(`${sel}-${side}`), [
          { transform: `translateX(${from}px)`, opacity: 0 },
          { transform: `translateX(${from * 0.6}px)`, opacity: 1, offset: 0.25 },
          { transform: `translateX(${side === 'l' ? 4 : -4}px)`, offset: 0.86, easing: 'ease-out' },
          { transform: 'translateX(0)', opacity: 1 },
        ], { duration: SLAM_MS, delay: land - SLAM_MS, easing: 'cubic-bezier(.55,0,1,.45)' });
      }
      add(frame, [
        { transform: 'none' }, { transform: `translate(${i % 2 ? -5 : 5}px,${2 + i}px)`, offset: 0.25 },
        { transform: `translate(${i % 2 ? 4 : -4}px,-2px)`, offset: 0.55 }, { transform: 'none' },
      ], { duration: 170, delay: land, fill: 'none', composite: 'add' });
      if (words[i]) add(words[i], [
        { opacity: 0, transform: 'translateY(-.4em) scale(1.55)' },
        { opacity: 1, transform: 'translateY(.04em) scale(.97)', offset: 0.7 },
        { opacity: 1, transform: 'none' },
      ], { duration: 260, delay: land - 200, easing: 'cubic-bezier(.5,0,.75,0)' });
    });
    for (const w of words.slice(IMPACTS.length)) add(w, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, delay: IMPACTS[2] });
    add(q('.hx-plus'), [
      { transform: 'scale(0)', opacity: 0 }, { transform: 'scale(1.3)', opacity: 1, offset: 0.6 }, { transform: 'scale(1)', opacity: 1 },
    ], { duration: 340, delay: 1330, easing: 'cubic-bezier(.3,1.4,.5,1)' });
    add(load.querySelector('.hx-load-glow'), [{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 0 }], { duration: 700, delay: 1330 });
    add(power, [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: 650, delay: 1250, easing: 'cubic-bezier(.3,0,.2,1)' });
    const out = load.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 420, delay: 2500, fill: 'forwards' });
    out.pause();
    anims.push(out);

    let cancelled = false;
    (async () => {
      while (!cancelled && d.classList.contains('hx-splashing')) await new Promise((r) => setTimeout(r, 50));
      if (cancelled) return;
      anims.forEach((a) => a.play());
      IMPACTS.forEach((ms, i) => timers.push(window.setTimeout(() => setKg(KG[i]), ms)));
      try { await out.finished; } catch { return; }
      if (cancelled) return;
      anims.forEach((a) => a.cancel());
      setRun(false);
    })();
    return () => { cancelled = true; timers.forEach(clearTimeout); anims.forEach((a) => a.cancel()); };
  }, [run]);

  if (!run) return null;
  return (
    <span ref={ref} className="hx-load" aria-hidden="true">
      <span className="hx-load-scrim" />
      <span className="hx-load-glow" />
      <span className="hx-load-rig">
        <svg viewBox="-70 -6 390 138" className="hx-bell">
          <rect className="hx-bar" x="-62" y="57" width="374" height="12" rx="6" />
          <g className="hx-plates">
            <rect className="hx-p1-l" x="63" y="4" width="26" height="118" rx="13" />
            <rect className="hx-p1-r" x="161" y="4" width="26" height="118" rx="13" />
            <rect className="hx-p2-l" x="32" y="17" width="28" height="92" rx="14" />
            <rect className="hx-p2-r" x="190" y="17" width="28" height="92" rx="14" />
            <rect className="hx-p3-l" x="0" y="34" width="28" height="58" rx="14" />
            <rect className="hx-p3-r" x="222" y="34" width="28" height="58" rx="14" />
          </g>
          <path className="hx-plus" d="M109 28h32v19h20v32h-20v19h-32v-19h-20v-32h20z" />
        </svg>
        <span className="hx-kg"><b>{kg}</b> KG</span>
      </span>
    </span>
  );
}

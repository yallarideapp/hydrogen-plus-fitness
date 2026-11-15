'use client';

import { useEffect, useRef, useState } from 'react';

// Home banner heartbeat: a red ECG line across the whole banner, through the middle of the heading (behind its text).
//   - The first sweep draws the line in: right after the load-the-bar intro ('hx-intro-done'), or straight away
//     when there is no intro (later visits in the same session).
//   - Then a bright pulse keeps sweeping along it at a resting 72 BPM. The heart next to the power bar beats at the
//     same rate and the readout shows the number.
//   - Scrolling is effort: the rate climbs while you scroll (up to 165 BPM) and settles back to 72 a few seconds
//     after you stop, like after a set.
// Only transforms move: a clipped window slides right while the trace inside it slides left by the same amount,
// so the glowing trace is painted once and stays on top of the dim line. Paused while the banner is off screen.
// Reduced motion: the line is drawn, nothing moves.

const REST = 72;
const MAX = 165;

type Geo = { w: number; top: number; h: number; d: string; win: number; period: number };

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

// One beat per period p: flat, small P wave, sharp QRS spike, rounded T wave. y grows downwards; a = spike height.
function ecg(w: number, mid: number, a: number, p: number) {
  const r = (n: number) => Math.round(n * 10) / 10;
  let d = `M${-p} ${mid}`;
  for (let x = -p; x < w + p; x += p) {
    const X = (f: number) => r(x + f * p);
    const Y = (f: number) => r(mid + f * a);
    d += `L${X(0.3)} ${Y(0)}Q${X(0.35)} ${Y(-0.24)} ${X(0.4)} ${Y(0)}L${X(0.46)} ${Y(0)}L${X(0.48)} ${Y(0.12)}`
      + `L${X(0.51)} ${Y(-1)}L${X(0.545)} ${Y(0.42)}L${X(0.57)} ${Y(0)}L${X(0.64)} ${Y(0)}`
      + `Q${X(0.71)} ${Y(-0.42)} ${X(0.78)} ${Y(0)}L${X(1)} ${Y(0)}`;
  }
  return d;
}

export default function HeroPulse() {
  const ref = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const [go, setGo] = useState(false);
  const [still, setStill] = useState(false);
  const drawn = useRef(false);

  // Where the line goes: the middle of the heading, the full width of the banner. Re-measured when either resizes.
  useEffect(() => {
    const box = ref.current;
    const hero = box?.parentElement;
    const h1 = hero?.querySelector<HTMLElement>('.hp3-home-hero-copy h1');
    if (!box || !hero || !h1) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        let y = 0;
        for (let e: HTMLElement | null = h1; e && e !== hero; e = e.offsetParent as HTMLElement | null) y += e.offsetTop;
        const w = hero.clientWidth;
        const hh = h1.offsetHeight;
        if (!w || !hh) return;
        const a = Math.round(Math.min(110, Math.max(34, hh * 0.42)));
        const pad = 16;
        const period = Math.round(Math.min(260, Math.max(150, w * 0.2)));
        const win = Math.round(Math.min(560, Math.max(180, w * 0.45)));
        const top = Math.round(y + hh / 2 - a - pad);
        setGeo((g) => (g && g.w === w && g.h === 2 * a + 2 * pad
          ? (g.top === top ? g : { ...g, top })
          : { w, top, h: 2 * a + 2 * pad, d: ecg(w, a + pad, a, period), win, period }));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(h1);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  // When to start: after the intro if one is about to play (same test HeroLoad uses), otherwise now.
  useEffect(() => {
    const d = document.documentElement;
    const start = () => setGo(true);
    if (reduced()) { const id = requestAnimationFrame(() => { setStill(true); start(); }); return () => cancelAnimationFrame(id); }
    if (!d.classList.contains('hx-splashing')) { const id = requestAnimationFrame(start); return () => cancelAnimationFrame(id); }
    addEventListener('hx-intro-done', start, { once: true });
    const t = window.setTimeout(start, 12000);
    return () => { removeEventListener('hx-intro-done', start); clearTimeout(t); };
  }, []);

  const w = geo?.w;
  const h = geo?.h;
  useEffect(() => {
    const box = ref.current;
    const hero = box?.parentElement;
    if (!go || still || !geo || !box || !hero) return;
    const base = box.querySelector<HTMLElement>('.hx-pulse-base');
    const win = box.querySelector<HTMLElement>('.hx-pulse-win');
    const trace = box.querySelector<HTMLElement>('.hx-pulse-trace');
    if (!base || !win || !trace) return;
    const heart = hero.querySelector<SVGElement>('.hx-bpm svg');
    const num = hero.querySelector<HTMLElement>('.hx-bpm b');

    const beat = 60000 / REST;
    const span = geo.w + geo.win;
    const dur = (span / geo.period) * beat; // one sweep: the head crosses one period per beat
    const opts: KeyframeAnimationOptions = { duration: dur, iterations: Infinity, easing: 'linear' };
    const sweep = win.animate([{ transform: `translateX(${-geo.win}px)` }, { transform: `translateX(${geo.w}px)` }], opts);
    const counter = trace.animate([{ transform: `translateX(${geo.win}px)` }, { transform: `translateX(${-geo.w}px)` }], opts);
    const loops = [sweep, counter];
    if (heart) loops.push(heart.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.1 }, { transform: 'scale(.95)', offset: 0.22 },
      { transform: 'scale(1.15)', offset: 0.32 }, { transform: 'scale(1)', offset: 0.5 }, { transform: 'scale(1)' },
    ], { duration: beat, iterations: Infinity }));
    // First pass: the dim line is uncovered right behind the bright head (the head is the window's right edge).
    let reveal: Animation | null = null;
    if (!drawn.current) {
      reveal = base.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }],
        { duration: (dur * geo.w) / span, easing: 'linear', fill: 'backwards' });
      reveal.finished.then(() => { drawn.current = true; }, () => {});
    }
    const all = () => (reveal && reveal.playState !== 'finished' ? [...loops, reveal] : loops);
    const glue = () => { counter.currentTime = sweep.currentTime; }; // keep the bright trace exactly on the dim line

    let bpm = REST;
    let effort = 0;
    let last = 0;
    let raf = 0;
    let lastY = scrollY;
    let shown = true;
    let rate = 1;
    let label = REST;
    const apply = () => {
      const r = bpm / REST;
      if (Math.abs(r - rate) >= 0.01 || (r === 1 && rate !== 1)) {
        rate = r;
        all().forEach((a) => { a.playbackRate = r; });
        glue();
      }
      const n = Math.round(bpm);
      if (num && n !== label) { label = n; num.textContent = String(n); }
    };
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60;
      last = now;
      effort *= Math.exp(-dt / 3); // recovery
      const target = Math.min(MAX, REST + effort);
      bpm += (target - bpm) * (1 - Math.exp(-dt / 0.4));
      if (effort < 0.4 && bpm - REST < 0.4) { bpm = REST; raf = 0; last = 0; apply(); return; }
      apply();
      raf = requestAnimationFrame(tick);
    };
    const kick = () => { if (!raf && shown) raf = requestAnimationFrame(tick); };
    const onScroll = () => {
      const y = scrollY;
      effort = Math.min(MAX - REST + 25, effort + Math.abs(y - lastY) * 0.32);
      lastY = y;
      kick();
    };
    addEventListener('scroll', onScroll, { passive: true });
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting === shown) return;
      shown = e.isIntersecting;
      if (shown) {
        all().forEach((a) => a.play());
        glue();
        kick();
      } else {
        all().forEach((a) => a.pause());
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    });
    io.observe(hero);

    return () => {
      removeEventListener('scroll', onScroll);
      io.disconnect();
      cancelAnimationFrame(raf);
      if (reveal) drawn.current = true; // a re-layout mid-draw shows the whole line rather than drawing again
      [...loops, ...(reveal ? [reveal] : [])].forEach((a) => a.cancel());
      if (num) num.textContent = String(REST);
    };
    // geo.top only moves the box; the animations depend on the size.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, still, w, h]);

  const ready = go && geo;
  return (
    <div ref={ref} className="hx-pulse" aria-hidden="true" style={geo ? { top: geo.top, height: geo.h } : undefined}>
      {ready && (
        <>
          <div className="hx-pulse-base">
            <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}><path d={geo.d} /></svg>
          </div>
          {!still && (
            <div className="hx-pulse-win" style={{ width: geo.win }}>
              <div className="hx-pulse-trace" style={{ width: geo.w }}>
                <svg width={geo.w} height={geo.h} viewBox={`0 0 ${geo.w} ${geo.h}`}><path d={geo.d} /></svg>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

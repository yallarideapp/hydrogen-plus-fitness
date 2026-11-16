'use client';

import { useEffect, useRef, useState } from 'react';

// Home banner heartbeat: a red ECG line at the height of the heading, in the empty part of the banner beside it.
// It stops (with a soft fade) just short of the words, so it never crosses any text.
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

// s..e is the stretch of banner the line shows in: the widest gap left by the heading (and any other text at that
// height), so the pulse never runs through words.
type Geo = { w: number; top: number; h: number; d: string; win: number; period: number; s: number; e: number };

const GAP = 14; // clear space between the line and the nearest letter
const FADE = 44; // the line fades out over this distance before that gap
const MAX_LEN = 520; // computer layout: the longest the line runs from the heading

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

  // Where the line goes: level with the middle of the heading, in the widest stretch with no text at that height.
  // Measured from layout boxes (offsets), so the intro's moving words don't throw it off. Re-measured on resize.
  useEffect(() => {
    const box = ref.current;
    const hero = box?.parentElement;
    const h1 = hero?.querySelector<HTMLElement>('.hp3-home-hero-copy h1');
    if (!box || !hero || !h1) return;
    const pos = (el: HTMLElement) => {
      let x = 0;
      let y = 0;
      for (let e: HTMLElement | null = el; e && e !== hero; e = e.offsetParent as HTMLElement | null) { x += e.offsetLeft; y += e.offsetTop; }
      return { x, y, w: el.offsetWidth, h: el.offsetHeight };
    };
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = hero.clientWidth;
        const hb = pos(h1);
        if (!w || !hb.h) return;
        let a = Math.round(Math.min(110, Math.max(34, hb.h * 0.42)));
        const pad = 16;
        let mid = hb.y + hb.h / 2;
        // Computer layout (photo beside the heading): level with the heading's last line (MORE. / القوة.), which is
        // the shorter one, so the line starts right beside it; spikes stay within that line's height.
        const last = [...h1.querySelectorAll<HTMLElement>('.hx-w')].pop();
        if (w > 820 && last) {
          const lb = pos(last);
          mid = lb.y + lb.h / 2;
          a = Math.round(Math.min(110, Math.max(26, lb.h / 2 - 8)));
        }
        const band = [mid - a - 6, mid + a * 0.42 + 6]; // spike top to dip bottom, plus glow
        // Text that sits at that height: the heading words, plus anything else that could share the band.
        const blocked = [...hero.querySelectorAll<HTMLElement>('.hx-w, .hp3-home-hero-copy>.hp3-kicker, .hx-power, .hx-bpm, .hp3-image-label, .hp3-hero-mark')]
          .map(pos).filter((o) => o.w && o.y < band[1] && o.y + o.h > band[0])
          .map((o) => [o.x - GAP, o.x + o.w + GAP]);
        blocked.sort((p, q) => p[0] - q[0]);
        let s0 = 0;
        let best: [number, number] = [0, 0];
        for (const [l, r] of [...blocked, [w, w]]) {
          if (l - s0 > best[1] - best[0]) best = [s0, l];
          s0 = Math.max(s0, r);
        }
        let s = Math.max(0, Math.round(best[0]));
        let e = Math.min(w, Math.round(best[1]));
        // Computer layout: a shorter line, running MAX_LEN from the heading (whichever end touches text).
        if (w > 820 && e - s > MAX_LEN) {
          if (s > 0) e = s + MAX_LEN;
          else s = e - MAX_LEN;
        }
        if (e - s < 80) { setGeo(null); return; }
        const period = Math.round(Math.min(260, Math.max(90, (e - s) * 0.45)));
        const win = Math.round(Math.min(520, Math.max(90, (e - s) * 0.55)));
        const top = Math.round(mid - a - pad);
        const h = 2 * a + 2 * pad;
        setGeo((g) => (g && g.w === w && g.h === h && g.s === s && g.e === e
          ? (g.top === top ? g : { ...g, top })
          : { w, top, h, d: ecg(w, a + pad, a, period), win, period, s, e }));
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(hero);
    ro.observe(h1);
    hero.querySelectorAll('.hx-w').forEach((el) => ro.observe(el)); // a word changes width (language, font load)
    document.fonts?.ready.then(measure);
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

  const shape = geo ? `${geo.w}|${geo.h}|${geo.s}|${geo.e}` : '';
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
    // The window's right edge is the bright head: it runs from s to e, then the tail clears.
    const x0 = geo.s - geo.win;
    const x1 = geo.e;
    const span = x1 - x0;
    const dur = (span / geo.period) * beat; // one sweep: the head crosses one period per beat
    const opts: KeyframeAnimationOptions = { duration: dur, iterations: Infinity, easing: 'linear' };
    const sweep = win.animate([{ transform: `translateX(${x0}px)` }, { transform: `translateX(${x1}px)` }], opts);
    const counter = trace.animate([{ transform: `translateX(${-x0}px)` }, { transform: `translateX(${-x1}px)` }], opts);
    const loops = [sweep, counter];
    if (heart) loops.push(heart.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.35)', offset: 0.1 }, { transform: 'scale(.95)', offset: 0.22 },
      { transform: 'scale(1.15)', offset: 0.32 }, { transform: 'scale(1)', offset: 0.5 }, { transform: 'scale(1)' },
    ], { duration: beat, iterations: Infinity }));
    // First pass: the dim line is uncovered right behind the bright head (the head is the window's right edge).
    let reveal: Animation | null = null;
    if (!drawn.current) {
      reveal = base.animate([{ clipPath: `inset(0 ${geo.w - geo.s}px 0 0)` }, { clipPath: `inset(0 ${geo.w - geo.e}px 0 0)` }],
        { duration: (dur * (geo.e - geo.s)) / span, easing: 'linear', fill: 'backwards' });
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
    // geo.top only moves the box; the animations depend on the size and the stretch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [go, still, shape]);

  const ready = go && geo;
  let mask = '';
  if (geo) {
    const from = geo.s <= 0 ? '#000 0' : `transparent ${geo.s}px,#000 ${geo.s + FADE}px`;
    const to = geo.e >= geo.w ? '#000 100%' : `#000 ${geo.e - FADE}px,transparent ${geo.e}px`;
    mask = `linear-gradient(90deg,${from},${to})`;
  }
  return (
    <div ref={ref} className="hx-pulse" aria-hidden="true"
      style={geo ? { top: geo.top, height: geo.h, WebkitMaskImage: mask, maskImage: mask } : undefined}>
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

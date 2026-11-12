// Generates app/light.css: a light theme for the whole site, made from the dark stylesheets.
// Every colour in a colour-related declaration is mapped: greys and dark/very light tones get
// their lightness flipped (so contrast is kept everywhere), saturated mid tones such as the
// brand red stay as they are. Rules are scoped under html.hx-light.
// Run: node scripts/build-light.mjs   (re-run after changing any stylesheet)
import fs from 'node:fs';
import path from 'node:path';
import postcss from 'postcss';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const FILES = [
  'app/globals.css',
  ...fs.readdirSync(path.join(ROOT, 'components/gym')).filter((f) => f.endsWith('.css')).map((f) => `components/gym/${f}`),
  ...fs.readdirSync(path.join(ROOT, 'components/admin')).filter((f) => f.endsWith('.css')).map((f) => `components/admin/${f}`),
];
const COLOR_PROPS = /^(--[a-z0-9-]+|color|background|background-color|background-image|border|border-(top|right|bottom|left|block|inline|block-start|block-end|inline-start|inline-end)(-color)?|border-color|outline|outline-color|box-shadow|text-shadow|fill|stroke|text-decoration-color|caret-color|accent-color|column-rule-color|--hp3-[a-z-]+|--[a-z0-9-]*(bg|color|line|ink|paper|panel|muted|surface|text)[a-z0-9-]*)$/i;
const SKIP_SELECTOR = /hx-splash|hxs-|#hx-splash/;
const NAMED = { white: [255, 255, 255, 1], black: [0, 0, 0, 1] };
const COLOR_RE = /#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b(white|black)\b/gi;

function parse(tok) {
  const t = tok.toLowerCase();
  if (NAMED[t]) return NAMED[t];
  if (t.startsWith('#')) {
    let h = t.slice(1);
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1];
  }
  const m = t.match(/rgba?\(([^)]*)\)/);
  if (!m) return null;
  const parts = m[1].split(/[\s,/]+/).filter(Boolean);
  if (parts.length < 3) return null;
  const v = parts.slice(0, 3).map((p) => (p.endsWith('%') ? (parseFloat(p) * 2.55) : parseFloat(p)));
  let a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
  if (parts[3] && parts[3].endsWith('%')) a = parseFloat(parts[3]) / 100;
  if (v.some(Number.isNaN)) return null;
  return [...v, a];
}
function toHsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b); const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min; const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h / 6, s, l];
}
function fromHsl([h, s, l]) {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s; const p = 2 * l - q;
  const f = (t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((x) => Math.round(x * 255));
}
const hex = (n) => n.toString(16).padStart(2, '0');
function map(tok, prop = '') {
  const c = parse(tok);
  if (!c) return tok;
  const [h, s, l] = toHsl(c);
  // Bright saturated text (light green 'save', pink 'ladies'...) would vanish on light backgrounds: darken it.
  const isText = /^(color|fill|stroke|caret-color|text-decoration-color|-?-.*(text|ink|fg).*)$/i.test(prop);
  if (isText && s > 0.38 && l >= 0.58) { const [r, g, b] = fromHsl([h, Math.min(1, s), Math.max(0.24, 1 - l - 0.06)]); return c[3] >= 1 ? `#${hex(r)}${hex(g)}${hex(b)}` : `rgba(${r},${g},${b},${+c[3].toFixed(3)})`; }
  // Keep saturated mid tones (brand red, status colours, etc.).
  if (s > 0.38 && l > 0.28 && l < 0.72) return tok;
  // Flip lightness; keep the extremes a little soft (no pure black/white).
  let nl = 1 - l;
  nl = Math.min(0.975, Math.max(0.07, nl));
  // Dark, slightly tinted surfaces become warm off-white paper rather than tinted pastel.
  const ns = l < 0.2 ? Math.min(s, 0.12) : s;
  const [r, g, b] = fromHsl([h, ns, nl]);
  const a = c[3];
  return a >= 1 ? `#${hex(r)}${hex(g)}${hex(b)}` : `rgba(${r},${g},${b},${+a.toFixed(3)})`;
}
const isGlobal = (sel) => sel.split(',').every((s) => /^(:root|html|body)\b/.test(s.trim()));
const scopedSel = (sel) => sel.split(',').map((s) => `:scope:is(html.hx-light) ${s.trim()}`).join(',');
const scope = (sel) => sel.split(',').map((s) => {
  s = s.trim();
  if (/^(:root|html)$/.test(s)) return 'html.hx-light';
  if (/^html[.[:]/.test(s)) return s.replace(/^html/, 'html.hx-light');
  if (/^html\s/.test(s)) return s.replace(/^html/, 'html.hx-light');
  if (/^:root\s/.test(s)) return s.replace(/^:root/, 'html.hx-light');
  return `html.hx-light ${s}`;
}).join(',');

// Pass 1: theme variables (dark values) and "light islands" — sections that are already light in
// dark mode (paper cards, the plan dialog...). Islands keep their original colours in light mode,
// otherwise they would turn into dark blocks.
const parsed = FILES.map((f) => [f, postcss.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'), { from: f })]);
const VARS = {};
const VAR_ALL = {};
for (const [, root] of parsed) root.walkDecls(/^--/, (d) => { if (/#[0-9a-f]{3,8}\b|rgba?\(|\b(white|black)\b/i.test(d.value)) (VAR_ALL[d.prop] ??= new Set()).add(d.value.trim()); });
// A variable defined with both light and dark values in different places (e.g. --line) is ambiguous: don't resolve it.
const lightness = (v) => { const t = v.match(/#[0-9a-f]{3,8}\b|rgba?\([^)]*\)|\b(white|black)\b/i); const c = t && parse(t[0]); if (!c) return null; return c[3] < 0.9 ? NaN : toHsl(c)[2]; }; // translucent → unknown
for (const [k, set] of Object.entries(VAR_ALL)) { const ls = [...set].map(lightness).filter((x) => x != null); if (ls.length && !ls.some(Number.isNaN) && (Math.max(...ls) - Math.min(...ls) < 0.35)) VARS[k] = [...set][0]; }
const resolveVars = (v) => v.replace(/var\((--[a-z0-9-]+)(?:,[^)]*)?\)/gi, (m, n) => VARS[n] ?? m);
const isLight = (tok) => { const c = parse(tok); if (!c || c[3] < 0.9) return false; return toHsl(c)[2] > 0.8; };
const compounds = (sel) => sel.split(/\s*[>+~]\s*|\s+/).filter(Boolean).map((c) => (c.match(/\.[a-z0-9_-]+/gi) ?? []).map((x) => x.slice(1)));
const ISLANDS = [];
for (const [, root] of parsed) root.walkRules((rule) => {
  if (rule.parent?.type === 'atrule' && /keyframes/i.test(rule.parent.name)) return;
  rule.each((d) => {
    if (d.type !== 'decl' || !/^background(-color)?$/.test(d.prop)) return;
    const toks = resolveVars(d.value).match(COLOR_RE) ?? [];
    if (!toks.length || !isLight(toks[0])) return;
    for (const part of rule.selector.split(',')) {
      if (/:hover|:focus|:active|::|\[aria-|is-active|is-on|button|\binput\b|select|\ba\b/.test(part)) continue;
      const cs = compounds(part.trim()); const last = cs[cs.length - 1];
      if (last && last.length && !/^hp3$|^sp-btn|^hp3-button|^pl-choose|^hx-/.test(last.join('.'))) ISLANDS.push(last);
    }
  });
});
const inIsland = (sel) => sel.split(',').every((part) => compounds(part.trim()).some((cls) => ISLANDS.some((isl) => isl.every((x) => cls.includes(x)))));
ISLANDS.push(['legal-page']);
ISLANDS.push(['hx-events-archive']);
const islandList = [...new Set(ISLANDS.map((i) => '.' + i.join('.')))];
const ISL = islandList.join(',');

const out = postcss.root();
const COLLECT = [];
const LATE = [];
let rules = 0, decls = 0;
for (const [, root] of parsed) {
  root.walkRules((rule) => {
    if (rule.parent?.type === 'atrule' && /keyframes/i.test(rule.parent.name)) return;
    if (SKIP_SELECTOR.test(rule.selector)) return;
    const keep = [];
    const island = inIsland(rule.selector);
    // Text sitting on a kept saturated background (red buttons, badges) stays as designed (usually white).
    const satBg = rule.nodes.some((d) => d.type === 'decl' && /^background(-color)?$/.test(d.prop) && (() => { const t = resolveVars(d.value).match(COLOR_RE); const c = t && parse(t[0]); if (!c) return false; const [, s, l] = toHsl(c); return c[3] >= 0.9 && s > 0.38 && l > 0.28 && l < 0.72; })());
    const pageRoot = /^(html|body)$/.test(rule.selector.trim());
    rule.each((d) => {
      if (d.type !== 'decl' || !COLOR_PROPS.test(d.prop)) return;
      if (/url\(/i.test(d.value) && !/gradient/i.test(d.value)) return;
      if (island) return;
      // The body background stays as designed: every themed page paints its own background.
      if (pageRoot && /^(background|background-color|color)$/.test(d.prop)) return;
      if (satBg && d.prop === 'color') return; // handled below
      const v = d.value.replace(COLOR_RE, (t) => map(t, d.prop));
      // Copy every colour declaration (changed or not) so state rules (:hover, .is-active...) keep beating base rules.
      keep.push(postcss.decl({ prop: d.prop, value: v, important: d.important }));
    });
    // On a kept saturated background (red buttons, badges), text keeps its designed light colour — even when
    // a general rule makes it inherit — so this rule doubles its last class to win over e.g. '.hp3 a{color:inherit}'.
    if (satBg && !island && !/:hover|:focus|:active/.test(rule.selector)) {
      const own = rule.nodes.find((d) => d.type === 'decl' && d.prop === 'color');
      let txt = own ? resolveVars(own.value) : '#fff';
      const tc = parse((txt.match(COLOR_RE) ?? ['#fff'])[0]);
      if (!tc || /var\(|inherit|currentcolor/i.test(txt) || toHsl(tc)[2] < 0.6) txt = '#fff';
      const dbl = rule.selector.split(',').map((x) => { const m = x.trim().match(/^(.*)(\.[a-z0-9_-]+)([^.\s>+~]*)$/i); return m ? `${m[1]}${m[2]}${m[2]}${m[3]}` : null; });
      if (dbl.every(Boolean)) {
        const r2 = postcss.rule({ selector: scopedSel(dbl.join(',')) }); r2.append(postcss.decl({ prop: 'color', value: txt }));
        const ch = []; let pp = rule.parent; let ok = true;
        while (pp && pp.type === 'atrule') { if (!/^(media|supports|container)$/i.test(pp.name)) { ok = false; break; } ch.unshift(`@${pp.name} ${pp.params}`); pp = pp.parent; }
        if (ok) LATE.push({ chain: ch.join('|'), chainArr: ch, global: false, rule: r2 });
      }
    }
    if (!keep.length) return;
    const chain = []; let p = rule.parent;
    while (p && p.type === 'atrule') { if (!/^(media|supports|container)$/i.test(p.name)) return; chain.unshift(`@${p.name} ${p.params}`); p = p.parent; }
    const global = isGlobal(rule.selector);
    const nr = postcss.rule({ selector: global ? scope(rule.selector) : scopedSel(rule.selector) });
    keep.forEach((d) => nr.append(d));
    COLLECT.push({ chain: chain.join('|'), chainArr: chain, global, rule: nr }); rules++; decls += keep.length;
  });
}
COLLECT.push(...LATE);
// Emit: consecutive rules with the same @media chain share one @scope block, whose lower boundary
// (the light islands) keeps those sections exactly as in dark mode.
let i = 0;
while (i < COLLECT.length) {
  const { chain, chainArr, global } = COLLECT[i];
  const group = [];
  while (i < COLLECT.length && COLLECT[i].chain === chain && COLLECT[i].global === global) group.push(COLLECT[i++].rule);
  let inner;
  if (global) { inner = group; } else { const sc = postcss.atRule({ name: 'scope', params: `(html.hx-light) to (${ISL})` }); group.forEach((r) => sc.append(r)); inner = [sc]; }
  let nodes = inner;
  for (const w of [...chainArr].reverse()) { const [, name, params] = w.match(/^@(\S+) (.*)$/); const a = postcss.atRule({ name, params }); nodes.forEach((n) => a.append(n)); nodes = [a]; }
  nodes.forEach((n) => out.append(n));
}
const islandVars = `html.hx-light :is(${ISL}){${Object.entries(VARS).filter(([, v]) => v.replace(COLOR_RE, map) !== v).map(([k, v]) => `${k}:${v}`).join(';')}}`;
const extra = `
/* Light islands keep their dark-mode variables */
${islandVars}
/* Hand-tuned extras for the light theme */
html.hx-light{color-scheme:light}
/* Pages that paint on the body (privacy, terms) are already light: keep the body as designed */
html.hx-light body{background:#f7f6f2;color:#20201f}
html.hx-light .pl-save{background:#dcf2e3!important;color:#146a34!important}
`;
const banner = '/* GENERATED by scripts/build-light.mjs from the site stylesheets — do not edit by hand. */\n';
fs.writeFileSync(path.join(ROOT, 'app/light.css'), banner + out.toString().replace(/\n{2,}/g, '\n') + extra);
console.log(`light.css: ${rules} rules, ${decls} colour declarations from ${FILES.length} files`);
if (process.argv.includes('--islands')) console.log(islandList.join('\n'));

// Builds the admin's editable-text and photo catalogs from the source.
// Usage: node scripts/admin-catalog.mjs   → lib/admin/text-catalog.json, lib/admin/photo-catalog.json
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const AR = /[؀-ۿ]/;
const LATIN = /[A-Za-z0-9]/;
const AREAS = {
  HomeExperience: 'Home', SiteShell: 'Header, menu & footer', SiteExtras: 'Header, menu & footer',
  ClubExperience: 'The club', ClassesExperience: 'Classes', MembershipAdvisor: 'Memberships',
  TrainingExperience: 'Training', TrainingJourney: 'Training', CoachesPage: 'Coaches', ContactPage: 'Contact',
  CareersPage: 'Careers', HelpCentre: 'Help centre', Calculators: 'Tools & calculators', VisitForm: 'Visit & join form',
  ServicePage: 'Service pages (shared)', ServicesIndex: 'All services', MemberExperience: 'Member area',
  WorkoutStudio: 'Workout studio', SocialArchive: 'Community', Plans: 'Plans & prices',
};
const SKIP_FILES = new Set(['StaffArea', 'MemberArea', 'LegalPage', 'PhotoSwapper']);

const str = (n) => (n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null);
const ok = (en, ar) => en != null && ar != null && en.trim() && ar.trim() && LATIN.test(en) && AR.test(ar) && !AR.test(en) && !/^(https?:|\/|#|mailto:|tel:)/.test(en);

const out = new Map();
function add(en, ar, area, file, kind, order) {
  const key = en + '␟' + ar;
  if (!out.has(key)) out.set(key, { en, ar, area, file, kind, order });
}

for (const f of fs.readdirSync(path.join(ROOT, 'components/gym')).filter((x) => x.endsWith('.tsx'))) {
  const name = f.replace('.tsx', '');
  if (SKIP_FILES.has(name)) continue;
  const area = AREAS[name] ?? name;
  const src = fs.readFileSync(path.join(ROOT, 'components/gym', f), 'utf8');
  const sf = ts.createSourceFile(f, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const visit = (n) => {
    const order = n.getStart(sf);
    if (ts.isCallExpression(n) && n.arguments.length >= 2) {
      const en = str(n.arguments[0]), ar = str(n.arguments[1]);
      if (ok(en, ar)) add(en, ar, area, name, 'call', order);
    }
    if (ts.isArrayLiteralExpression(n)) {
      const els = n.elements.map(str);
      for (let i = 0; i + 1 < els.length; i++) if (ok(els[i], els[i + 1])) { add(els[i], els[i + 1], area, name, 'array', order); i++; }
    }
    if (ts.isObjectLiteralExpression(n)) {
      const props = Object.fromEntries(n.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(sf), p.initializer]));
      if (props.en && props.ar) {
        if (ts.isObjectLiteralExpression(props.en) && ts.isObjectLiteralExpression(props.ar)) {
          const arMap = Object.fromEntries(props.ar.properties.filter(ts.isPropertyAssignment).map((p) => [p.name.getText(sf), str(p.initializer)]));
          for (const p of props.en.properties.filter(ts.isPropertyAssignment)) {
            const en = str(p.initializer), ar = arMap[p.name.getText(sf)];
            if (ok(en, ar)) add(en, ar, area, name, 'words', p.getStart(sf));
          }
        } else if (ok(str(props.en), str(props.ar))) add(str(props.en), str(props.ar), area, name, 'object', order);
      }
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}

// Allow-list produced by scripts/admin-catalog-check (entries proven to render through the override layer).
let verified = null;
const vf = path.join(ROOT, 'lib/admin/text-verified.json');
if (fs.existsSync(vf)) verified = new Set(JSON.parse(fs.readFileSync(vf, 'utf8')));

const PRIORITY = ['Home', 'Header, menu & footer'];
const TOP = ['HYDROGEN PLUS FITNESS & SPA · IRBID', 'BUILT FOR', 'MORE.', 'Find my membership', 'Find a class', 'YOUR SPACE TO BECOME.', 'TRAIN. THEN RECHARGE.', 'STRENGTH', 'MOVEMENT', 'RECOVERY'];
const isTop = (e) => e.area === 'Home' && (TOP.includes(e.en) || e.en.startsWith('More strength. More movement.'));
const rank = (a) => (PRIORITY.includes(a) ? PRIORITY.indexOf(a) : 99);
const entries = [...out.entries()]
  .filter(([k, e]) => e.kind === 'call' || e.kind === 'words' || !verified || verified.has(k))
  .map(([, e]) => e)
  .sort((a, b) => (Number(isTop(b)) - Number(isTop(a))) || (rank(a.area) - rank(b.area)) || a.area.localeCompare(b.area) || a.order - b.order)
  .map((e) => ({ en: e.en, ar: e.ar, area: e.area, ...(isTop(e) ? { top: true } : {}) }));
fs.writeFileSync(path.join(ROOT, 'lib/admin/text-catalog.json'), JSON.stringify(entries));
if (process.env.CATALOG_DEBUG) fs.writeFileSync(process.env.CATALOG_DEBUG, JSON.stringify(Object.fromEntries([...out.entries()].map(([k, e]) => [k, { kind: e.kind, file: e.file }]))));
console.log('texts', entries.length, 'of', out.size, Object.entries(entries.reduce((m, e) => ((m[e.area] = (m[e.area] || 0) + 1), m), {})).map((x) => x.join(':')).join(' '));

// ---------- photos ----------
const img = (p) => fs.existsSync(path.join(ROOT, 'public', p));
const code = ['components/gym', 'lib', 'app'].flatMap(function walk(d) {
  return fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : /\.(tsx?|css)$/.test(e.name) ? [fs.readFileSync(path.join(ROOT, d, e.name), 'utf8')] : []));
}).join('\n');
const referenced = new Set([...code.matchAll(/\/images\/[A-Za-z0-9_./-]+\.(?:webp|jpe?g|png|svg)/g)].map((m) => m[0]).filter((p) => !/\/(archive|thumbs|og|originals|facebook)\//.test(p)));
for (const f of fs.readdirSync(path.join(ROOT, 'public/images/display'))) referenced.add('/images/display/' + f);
for (const f of fs.readdirSync(path.join(ROOT, 'public/images/hydro-rest'))) referenced.add('/images/hydro-rest/' + f);
const servicesSrc = fs.readFileSync(path.join(ROOT, 'lib/services.ts'), 'utf8');
const names = Object.fromEntries([...servicesSrc.matchAll(/slug: '([a-z-]+)'[^\n]*\n?\s*name: \['([^']+)', '([^']+)'\]/g)].map((m) => [m[1], [m[2], m[3]]]));
const photos = [...referenced].filter(img).sort().map((p) => {
  const file = p.split('/').pop().replace(/\.\w+$/, '');
  const pretty = file.replace(/[-_]+/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
  let group = 'Site photos', label = [pretty, pretty];
  const svc = file.match(/^svc-(.+)$/);
  if (svc) { group = 'Service banners'; label = names[svc[1]] ?? [svc[1], svc[1]]; }
  else if (p.includes('/hydro-rest/')) { group = 'Hydro Rest menu'; label = [file.replace('menu-page-', 'Menu page '), file.replace('menu-page-', 'صفحة المنيو ')]; }
  else if (/logo/.test(file)) { group = 'Logo'; label = ['Logo', 'الشعار']; }
  return { path: p, group, label };
});
fs.writeFileSync(path.join(ROOT, 'lib/admin/photo-catalog.json'), JSON.stringify(photos));
console.log('photos', photos.length, Object.entries(photos.reduce((m, e) => ((m[e.group] = (m[e.group] || 0) + 1), m), {})).map((x) => x.join(':')).join(' '));

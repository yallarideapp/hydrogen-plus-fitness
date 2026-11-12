// Deterministic date labels. Intl month names differ between Node and Safari (e.g. "Sept" vs "Sep"),
// which breaks hydration of server-rendered pages on iPhone, so dates shown at first paint use fixed names.
const EN_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EN_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const AR = ['كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'];
const arDigits = (s: string) => s.replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

/** Parts of a date in Amman (UTC+3 all year). Accepts YYYY-MM-DD or any Date-parsable string. */
function parts(input: string): [number, number, number] | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.trim());
  if (m) return [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const t = Date.parse(input);
  if (Number.isNaN(t)) return null;
  const d = new Date(t + 3 * 3600 * 1000);
  return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
}

export function fmtDate(input: string | null | undefined, lang: 'en' | 'ar', opts: { day?: boolean; long?: boolean } = {}): string | null {
  if (!input) return null;
  const p = parts(input);
  if (!p) return null;
  const [y, mo, d] = p;
  const { day = true, long = false } = opts;
  if (lang === 'ar') return arDigits(`${day ? d + ' ' : ''}${AR[mo]} ${y}`);
  return `${day ? d + ' ' : ''}${(long ? EN_LONG : EN_SHORT)[mo]} ${y}`;
}

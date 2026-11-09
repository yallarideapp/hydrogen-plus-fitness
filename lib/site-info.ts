// Contact and opening details published by Hydrogen Plus Fitness & Spa.
// Sources: Instagram bio and posts (checked 8 November 2026), Facebook About page,
// the "Contact Us" story highlight, and the 2025 pool-season poster (e-mail address).

export const contact = {
  phones: [
    { display: '079 215 1000', tel: '+962792151000' },
    { display: '079 214 1000', tel: '+962792141000' },
  ],
  // The posts list both mobile numbers for enquiries. Neither post confirms WhatsApp,
  // so the site labels WhatsApp as "message us" rather than promising a reply channel.
  whatsapp: '962792151000',
  loungePhone: { display: '079 837 0157', tel: '+962798370157' },
  email: 'hydrogenplusfitness@gmail.com',
  careersWhatsapp: { display: '079 535 0650', number: '962795350650' },
  address: {
    en: 'Irbid – Al-Husn Road, opposite Granada College, Irbid, Jordan',
    ar: 'إربد – طريق إربد الحصن، مقابل كلية غرناطة، إربد، الأردن',
  },
  geo: { lat: 32.519894, lng: 35.87114 },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=32.519894,35.871140',
  directionsUrl: 'https://www.google.com/maps/dir/?api=1&destination=32.519894,35.871140',
  mapEmbed: 'https://www.google.com/maps?q=32.519894,35.871140&z=16&output=embed',
  instagram: 'https://www.instagram.com/hydrogenplusfitness/',
  facebook: 'https://www.facebook.com/hydrogenplusfitness',
  related: [
    { name: 'Hydrogen Lounge', url: 'https://www.instagram.com/hydrogen.lounge/' },
    { name: 'Hydro Rest', url: 'https://www.instagram.com/hydrorest/' },
    { name: 'Hydrogen Garden', url: 'https://www.instagram.com/hydrogen_garden/' },
  ],
};

export type HoursRow = { id: string; en: string; ar: string; open: string; close: string; noteEn?: string; noteAr?: string; source: string; published: string };

// open/close are 24h "HH:MM"; a close earlier than open means the session ends after midnight.
export const hours: HoursRow[] = [
  { id: 'men', en: 'Men’s gym', ar: 'جيم الرجال', open: '06:00', close: '00:00', source: 'https://www.instagram.com/hydrogenplusfitness/', published: '2026-11-08' },
  { id: 'women', en: 'Ladies’ gym', ar: 'جيم السيدات', open: '08:00', close: '23:00', source: 'https://www.instagram.com/hydrogenplusfitness/p/DbYWJMxFVaA/', published: '2026-07-29' },
  { id: 'lounge', en: 'Hydrogen Lounge', ar: 'هايدروجين لاونج', open: '18:00', close: '02:00', source: 'https://www.instagram.com/hydrogenplusfitness/reel/DbY_mTJIkc2/', published: '2026-07-29' },
  { id: 'nutrition', en: 'Nutritionist (Hydro Rest)', ar: 'أخصائية التغذية', open: '09:00', close: '17:00', source: 'https://www.instagram.com/hydrogenplusfitness/p/DeTpgyPI2-9/', published: '2026-10-10' },
];

/** Minutes since midnight in Asia/Amman, plus weekday (0 = Sunday). */
export function ammanNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Amman', hour: '2-digit', minute: '2-digit', weekday: 'short', hourCycle: 'h23' }).formatToParts(date);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '0';
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return { minutes: Number(get('hour')) * 60 + Number(get('minute')), weekday: days.indexOf(get('weekday')) };
}

const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };

/** Returns open state and minutes until the next change for a published session. */
export function sessionState(row: HoursRow, date = new Date()) {
  const { minutes } = ammanNow(date);
  const open = toMin(row.open);
  let close = toMin(row.close);
  if (close <= open) close += 24 * 60;
  const now = minutes < open && close > 24 * 60 && minutes + 24 * 60 < close ? minutes + 24 * 60 : minutes;
  const isOpen = now >= open && now < close;
  const until = isOpen ? close - now : (open - now + 24 * 60) % (24 * 60);
  return { isOpen, until };
}

export function formatClock(hhmm: string, lang: 'en' | 'ar') {
  const [h, m] = hhmm.split(':').map(Number);
  if (h === 0 && m === 0) return lang === 'ar' ? 'منتصف الليل' : 'midnight';
  const pm = h >= 12; const h12 = h % 12 || 12;
  const mm = m ? `:${String(m).padStart(2, '0')}` : '';
  return lang === 'ar' ? `${h12}${mm} ${pm ? 'م' : 'ص'}` : `${h12}${mm} ${pm ? 'PM' : 'AM'}`;
}

import widths from './image-widths.json';

// Smaller copies of the big banner/service photos (made once with Pillow: name-480w.webp, name-960w.webp,
// name-1440w.webp next to the original). rs(src, sizes) gives an <img> the srcSet/sizes that let the browser pick
// the smallest one that is sharp enough, so phones stop downloading 2048px photos.
// Keys have no leading slash so the export's /images path prefixing leaves this table alone; the srcSet is built
// from the src as given, so it carries the same prefix as the src on the server and in the browser.
const table = widths as Record<string, number[]>;

export function rs(src: string | undefined, sizes = '(max-width: 820px) 100vw, 50vw') {
  if (!src) return {};
  const i = src.indexOf('images/display/');
  const ws = i < 0 ? undefined : table[src.slice(i).split('?')[0]];
  if (!ws) return {};
  const max = ws[ws.length - 1];
  const srcSet = ws.map((w) => `${w === max ? src : src.replace(/\.webp$/, `-${w}w.webp`)} ${w}w`).join(', ');
  return { srcSet, sizes };
}

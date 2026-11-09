'use client';
// Shows photos replaced in the admin preview: swaps matching <img> sources for the
// browser-stored copies and keeps doing so as React renders new images.
import { useEffect } from 'react';
import { getPhoto, photoKey } from '@/lib/admin/photos';

export default function PhotoSwapper({ photos }: { photos?: Record<string, string> }) {
  useEffect(() => {
    if (!photos || !Object.keys(photos).length) return;
    let alive = true; const urls: Record<string, string> = {}; let mo: MutationObserver | undefined;
    const patch = (img: HTMLImageElement) => {
      const orig = img.dataset.hpOrig ?? img.getAttribute('src');
      const next = urls[photoKey(orig)];
      if (next) {
        if (!img.dataset.hpOrig) img.dataset.hpOrig = orig ?? '';
        if (img.getAttribute('src') !== next) { img.removeAttribute('srcset'); img.setAttribute('src', next); }
      } else if (img.dataset.hpOrig !== undefined && img.getAttribute('src') !== img.dataset.hpOrig) {
        img.setAttribute('src', img.dataset.hpOrig);
      }
    };
    const all = () => document.querySelectorAll('img').forEach((i) => patch(i));
    (async () => {
      for (const [path, id] of Object.entries(photos)) {
        try { const b = await getPhoto(id); if (b) urls[path] = URL.createObjectURL(b); } catch { /* bank unavailable */ }
      }
      if (!alive) return;
      all();
      mo = new MutationObserver((list) => {
        for (const m of list) {
          if (m.type === 'attributes' && m.target instanceof HTMLImageElement) {
            const img = m.target; const cur = img.getAttribute('src');
            if (cur && !cur.startsWith('blob:')) { delete img.dataset.hpOrig; patch(img); }
          } else m.addedNodes.forEach((n) => { if (n instanceof HTMLImageElement) patch(n); else if (n instanceof Element) n.querySelectorAll('img').forEach((i) => patch(i)); });
        }
      });
      mo.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
    })();
    return () => {
      alive = false; mo?.disconnect();
      document.querySelectorAll<HTMLImageElement>('img[data-hp-orig]').forEach((i) => { i.setAttribute('src', i.dataset.hpOrig!); delete i.dataset.hpOrig; });
      Object.values(urls).forEach((u) => URL.revokeObjectURL(u));
    };
  }, [photos]);
  return null;
}

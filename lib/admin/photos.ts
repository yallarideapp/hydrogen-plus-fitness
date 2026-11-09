// Browser photo bank for the preview admin: replaced photos live in IndexedDB as WebP blobs.
const DB = 'hp-admin'; const STORE = 'photos';

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function tx<T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const r = run(db.transaction(STORE, mode).objectStore(STORE));
    r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error);
  });
}
export const getPhoto = (id: string) => tx<Blob | undefined>('readonly', (s) => s.get(id) as IDBRequest<Blob | undefined>);
export const putPhoto = (id: string, blob: Blob) => tx('readwrite', (s) => s.put(blob, id));
export const deletePhoto = (id: string) => tx('readwrite', (s) => s.delete(id));
export const photoIds = () => tx<IDBValidKey[]>('readonly', (s) => s.getAllKeys()).then((k) => k.map(String));
export const newPhotoId = () => 'p' + Math.random().toString(36).slice(2, 12) + Date.now().toString(36);

/** Resize an uploaded image to WebP (longest side ≤ max) so the browser bank stays small. */
export async function toWebp(file: Blob, max = 1920, quality = 0.84): Promise<Blob> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bmp.width * scale); canvas.height = Math.round(bmp.height * scale);
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  bmp.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode'))), 'image/webp', quality));
}
export const blobToDataUrl = (b: Blob) => new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.readAsDataURL(b); });
export const dataUrlToBlob = async (d: string) => (await fetch(d)).blob();

/** "/hydrogen-plus-fitness/images/x.webp?v=1" → "/images/x.webp" */
export function photoKey(src: string | null | undefined) {
  if (!src) return '';
  try { const p = new URL(src, 'http://x').pathname; const i = p.indexOf('/images/'); return i >= 0 ? decodeURI(p.slice(i)) : ''; } catch { return ''; }
}

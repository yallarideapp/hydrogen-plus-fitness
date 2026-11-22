// Reads the first sheet of an Excel .xlsx file in the browser, without a library: an .xlsx file is a ZIP of XML
// files, so this finds the sheet in the ZIP, inflates it with the browser's DecompressionStream and reads the cells.
// Numbers come back as text exactly as stored (dates as Excel serial numbers, which members.ts converts).

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function unzip(buf: ArrayBuffer): Promise<Map<string, () => Promise<string>>> {
  const v = new DataView(buf); const bytes = new Uint8Array(buf);
  let eocd = -1;
  for (let i = buf.byteLength - 22; i >= Math.max(0, buf.byteLength - 66000); i--) if (v.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('not-zip');
  const count = v.getUint16(eocd + 10, true); let p = v.getUint32(eocd + 16, true);
  const files = new Map<string, () => Promise<string>>();
  const dec = new TextDecoder();
  for (let n = 0; n < count && v.getUint32(p, true) === 0x02014b50; n++) {
    const method = v.getUint16(p + 10, true); const size = v.getUint32(p + 20, true);
    const nameLen = v.getUint16(p + 28, true); const extra = v.getUint16(p + 30, true); const comment = v.getUint16(p + 32, true);
    const local = v.getUint32(p + 42, true);
    const name = dec.decode(bytes.subarray(p + 46, p + 46 + nameLen));
    const start = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    const raw = bytes.subarray(start, start + size);
    files.set(name, async () => dec.decode(method === 8 ? await inflate(raw) : raw));
    p += 46 + nameLen + extra + comment;
  }
  return files;
}

const colIndex = (ref: string) => { let n = 0; for (const ch of ref.replace(/\d+$/, '')) n = n * 26 + ch.charCodeAt(0) - 64; return n - 1; };
const text = (el: Element | null | undefined) => (el ? Array.from(el.getElementsByTagName('t')).map((t) => t.textContent ?? '').join('') : '');

export async function readXlsx(buf: ArrayBuffer): Promise<string[][]> {
  const files = await unzip(buf);
  const xml = async (name: string) => { const f = files.get(name); return f ? new DOMParser().parseFromString(await f(), 'application/xml') : null; };
  // the first sheet listed in the workbook (it may not be called sheet1.xml)
  let sheetPath = 'xl/worksheets/sheet1.xml';
  const wb = await xml('xl/workbook.xml'); const rels = await xml('xl/_rels/workbook.xml.rels');
  const first = wb?.getElementsByTagName('sheet')[0];
  const rid = first?.getAttribute('r:id') ?? first?.getAttributeNS('http://schemas.openxmlformats.org/officeDocument/2006/relationships', 'id');
  const target = rid && rels ? Array.from(rels.getElementsByTagName('Relationship')).find((r) => r.getAttribute('Id') === rid)?.getAttribute('Target') : null;
  if (target) sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.\//, '')}`;
  const shared = Array.from((await xml('xl/sharedStrings.xml'))?.getElementsByTagName('si') ?? []).map((si) => text(si));
  const sheet = await xml(sheetPath);
  if (!sheet) throw new Error('no-sheet');
  const rows: string[][] = [];
  for (const row of Array.from(sheet.getElementsByTagName('row'))) {
    const out: string[] = [];
    for (const c of Array.from(row.getElementsByTagName('c'))) {
      const i = colIndex(c.getAttribute('r') ?? String.fromCharCode(65 + out.length));
      const t = c.getAttribute('t'); const val = c.getElementsByTagName('v')[0]?.textContent ?? '';
      out[i] = t === 's' ? shared[Number(val)] ?? '' : t === 'inlineStr' ? text(c.getElementsByTagName('is')[0]) : t === 'b' ? (val === '1' ? 'TRUE' : 'FALSE') : val;
    }
    rows.push(Array.from(out, (x) => (x ?? '').trim()));
    if (rows.length > 5001) break;
  }
  return rows.filter((r) => r.some((c) => c !== ''));
}

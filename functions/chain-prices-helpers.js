'use strict';
// Supermarket price-transparency files (Israel's food price transparency law): parsing helpers for
// the chainPrices trial (index.js). Chains publish, per branch, gzip-compressed XML files — Stores
// (the branch list), PriceFull (every product's price) and PromoFull — on their own portals.
//
// Hatzi Hinam's portal: https://shop.hazi-hinam.co.il/Prices?t=<1 prices | 2 promos | 3 stores>&p=<page>,
// a listing page whose download links point at unsigned blob storage. It answers Israeli addresses
// only, hence the Tel Aviv region. (Portal layout learned from the MIT-licensed israeli-prices
// package's adapter; no code taken from it.)

const zlib = require('zlib');

const HATZI_HINAM = { slug: 'hatzi-hinam', chainId: '7290700100008', base: 'https://shop.hazi-hinam.co.il' };

// Download links on a listing page
function listingLinks(html) {
  const out = [], seen = new Set();
  const re = /href="(https:\/\/[^"]+?\.(?:gz|xml)[^"]*)"/gi;
  let m;
  while ((m = re.exec(String(html || '')))) {
    const url = m[1].replace(/&amp;/g, '&');
    const name = url.split('?')[0].split('/').pop();
    if (!seen.has(name)) { seen.add(name); out.push({ url, name }); }
  }
  return out;
}

// PriceFull7290700100008-001-012-202611270300.gz → { type, storeId, ts }
// The timestamp is YYYYMMDD[-HHMMSS] or YYYYMMDDHHMM; the store id is the numeric segment just
// before it when two segments precede it (sub-chain, store), else the only one.
const TYPES = [['pricefull', 'PriceFull'], ['promofull', 'PromoFull'], ['stores', 'Stores'], ['price', 'Price'], ['promo', 'Promo']];
function parseFilename(name) {
  const base = String(name || '').split('/').pop().replace(/\.(gz|xml|zip)$/i, '');
  const low = base.toLowerCase();
  const t = TYPES.find(([p]) => low.startsWith(p));
  const type = t ? t[1] : null;
  const rest = t ? base.slice(t[0].length) : base;
  const segs = rest.split('-').filter(Boolean);
  const di = segs.findIndex((s, i) => i > 0 && /^\d+$/.test(s) && (s.length === 8 || s.length === 12));
  let storeId = null, ts = null;
  if (di > 0) {
    const pre = segs.slice(1, di); // after the chain id
    storeId = pre.length ? pre[pre.length - 1] : null;
    const d = segs[di], time = d.length === 12 ? d.slice(8) + '00' : (segs[di + 1] && /^\d{4,6}$/.test(segs[di + 1]) ? segs[di + 1].padEnd(6, '0') : '000000');
    ts = Date.UTC(+d.slice(0, 4), +d.slice(4, 6) - 1, +d.slice(6, 8), +time.slice(0, 2), +time.slice(2, 4), +time.slice(4, 6));
  }
  return { type, storeId, ts };
}
const sameStore = (a, b) => a != null && b != null && (/^\d+$/.test(a) && /^\d+$/.test(b) ? Number(a) === Number(b) : String(a) === String(b));

// gzip / zip / utf-16 / utf-8 bytes → text
function toText(buf) {
  let b = Buffer.from(buf);
  if (b[0] === 0x1f && b[1] === 0x8b) b = zlib.gunzipSync(b);
  else if (b[0] === 0x50 && b[1] === 0x4b) b = unzipFirst(b);
  if ((b[0] === 0xff && b[1] === 0xfe)) return b.slice(2).toString('utf16le');
  if ((b[0] === 0xfe && b[1] === 0xff)) { const s = Buffer.from(b.slice(2)); s.swap16(); return s.toString('utf16le'); }
  // The XML declaration may name an older Hebrew encoding (windows-1255 / iso-8859-8)
  const head = b.slice(0, 200).toString('latin1');
  const enc = (/encoding\s*=\s*["']([^"']+)["']/i.exec(head) || [])[1] || '';
  if (/1255|8859-8|hebrew/i.test(enc)) {
    try { return new TextDecoder(enc.toLowerCase().includes('8859') ? 'iso-8859-8' : 'windows-1255').decode(b); } catch (e) {}
  }
  let s = b.toString('utf8');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  // Not valid UTF-8 (replacement characters) and no declaration: most likely windows-1255
  if (!enc && s.includes('\ufffd')) { try { return new TextDecoder('windows-1255').decode(b); } catch (e) {} }
  return s;
}
// Minimal ZIP reader: the first entry (stored or deflated)
function unzipFirst(b) {
  if (b.readUInt32LE(0) !== 0x04034b50) throw new Error('not a zip');
  const method = b.readUInt16LE(8), csize = b.readUInt32LE(18), nlen = b.readUInt16LE(26), xlen = b.readUInt16LE(28);
  const start = 30 + nlen + xlen;
  const data = b.slice(start, csize ? start + csize : undefined);
  return method === 8 ? zlib.inflateRawSync(data) : data;
}

const decodeXml = s => String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, '&').trim();
// The direct child fields of each <tag>…</tag> block, keyed by lowercase tag name
function records(xml, tag) {
  const out = [];
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, 'gi');
  let m;
  while ((m = re.exec(xml))) {
    const f = {};
    const fr = /<([A-Za-z_][\w.-]*)\b[^>]*>([^<]*)<\/\1>/g;
    let g;
    while ((g = fr.exec(m[1]))) f[g[1].toLowerCase()] = decodeXml(g[2]);
    out.push(f);
  }
  return out;
}
const pick = (f, ...keys) => { for (const k of keys) if (f[k] != null && f[k] !== '') return f[k]; return null; };
const num = v => { if (v == null || v === '') return null; const n = Number(String(v).replace(/,/g, '')); return Number.isFinite(n) ? n : null; };

function parseStores(xml) {
  return records(xml, 'Store').map(f => ({
    storeId: pick(f, 'storeid'), subChainId: pick(f, 'subchainid'),
    name: pick(f, 'storename'), city: pick(f, 'city'), address: pick(f, 'address'),
  })).filter(s => s.storeId);
}

function parsePrices(xml) {
  return records(xml, 'Item').map(f => ({
    code: pick(f, 'itemcode'),
    name: pick(f, 'itemname', 'itemnm'),
    maker: pick(f, 'manufacturername', 'manufacturename'),
    price: num(pick(f, 'itemprice')),
    unitPrice: num(pick(f, 'unitofmeasureprice')),
    unit: pick(f, 'unitofmeasure'),
    qty: num(pick(f, 'quantity')),
    unitQty: pick(f, 'unitqty'),
    weighted: pick(f, 'bisweighted', 'isweighted', 'blsweighted') === '1',
  })).filter(i => i.code && i.name && i.price != null);
}

// The branch whose name / address / city contain every word of the query ("אם המושבות פתח תקווה")
const norm = s => String(s || '').replace(/[׳״'"`״׳\-–,.()]/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
function findStore(stores, query) {
  const words = norm(query).split(' ').filter(Boolean);
  const hay = s => norm([s.name, s.address, s.city].join(' '));
  return stores.filter(s => words.every(w => hay(s).includes(w)));
}

// Products whose name contains every word of a list item ("חלב 3%" → "חלב תנובה 3% 1 ליטר")
function searchProducts(items, query, limit = 20) {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  return items.filter(i => { const n = norm(i.name + ' ' + (i.maker || '')); return words.every(w => n.includes(w)); }).slice(0, limit);
}

module.exports = { HATZI_HINAM, listingLinks, parseFilename, sameStore, toText, parseStores, parsePrices, findStore, searchProducts, norm };

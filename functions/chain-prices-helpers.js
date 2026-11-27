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

// The chains the app supports, and where each one lists its files. kind: prices (PriceFull),
// promos (PromoFull) or stores. byStore: the listing can be filtered to one branch.
//   Hatzi Hinam: /Prices?t=<1 prices | 2 promos | 3 stores>&p=<page>
//   Shufersal:   prices.shufersal.co.il/FileObject/UpdateCategory?catID=<2 PricesFull | 4 PromosFull |
//                5 Stores>&storeId=<branch, 0 = all>&page=<page> — download links are signed and expire
//                within minutes, so each file is downloaded right after its listing is read.
const CHAINS = {
  'hatzi-hinam': {
    ...HATZI_HINAM, name: 'חצי חינם', portal: 'listing',
    listUrl: (kind, page) => `${HATZI_HINAM.base}/Prices?t=${{ prices: 1, promos: 2, stores: 3 }[kind]}&p=${page}`,
  },
  shufersal: {
    slug: 'shufersal', chainId: '7290027600007', base: 'https://prices.shufersal.co.il', name: 'שופרסל', portal: 'listing', byStore: true,
    listUrl: (kind, page, storeId) => `https://prices.shufersal.co.il/FileObject/UpdateCategory?catID=${{ prices: 2, promos: 4, stores: 5 }[kind]}&storeId=${storeId || 0}&page=${page}`,
  },
};
// The other supermarket chains, by the shared portal they publish on (logins are public — listed on
// the government's price-transparency page). Pharmacies and convenience stores are left out.
//   cerberus  — url.publishedprices.co.il: a login per chain (CSRF token + session cookie), then
//               POST /file/json/dir lists every file, GET /file/d/<path> downloads
//   laib      — laibcatalog.co.il: GET /webapi/api/getfiles?edi=<chain id> lists, /webapi/<chain id>/<file>
//   bina      — <prefix>.binaprojects.com: POST /MainIO_Hok.aspx (WFileType 1 stores, 4 full prices;
//               WStore = branch) lists, /Download/<file>
//   carrefour — prices.carrefour.co.il: today's files are a JavaScript list in the page
const CERBERUS = 'https://url.publishedprices.co.il';
const cerb = (slug, name, chainId, user, pass = '', folder = '/') => [slug, { slug, name, chainId, portal: 'cerberus', user, pass, folder }];
const laib = (slug, name, chainId) => [slug, { slug, name, chainId, portal: 'laib' }];
const bina = (slug, name, chainId, prefix) => [slug, { slug, name, chainId, portal: 'bina', prefix, byStore: true }];
Object.assign(CHAINS, Object.fromEntries([
  cerb('rami-levy', 'רמי לוי', '7290058140886', 'RamiLevi'),
  cerb('yochananof', 'יוחננוף', '7290803800003', 'yohananof'),
  cerb('osher-ad', 'אושר עד', '7290103152017', 'osherad'),
  cerb('tiv-taam', 'טיב טעם', '7290873255550', 'TivTaam'),
  cerb('keshet-teamim', 'קשת טעמים', '7290785400000', 'Keshet'),
  cerb('stop-market', 'סטופ מרקט', '7290639000004', 'Stop_Market'),
  cerb('fresh-market', 'פרש מרקט', '7290876100000', 'freshmarket'),
  cerb('super-yuda', 'סופר יודה', '7290058177776', 'yuda_ho', 'Yud@147', '/Yuda'),
  cerb('politzer', 'פוליצר', '7291059100008', 'politzer'),
  cerb('salach-dabach', 'סאלח דבאח', '7290526500006', 'SalachD', '12345'),
  laib('victory', 'ויקטורי', '7290696200003'),
  laib('mahsanei-hashuk', 'מחסני השוק', '7290661400001'),
  laib('het-cohen', 'ח. כהן', '7290455000004'),
  ['carrefour', { slug: 'carrefour', name: 'קרפור', chainId: '7290055700007', portal: 'carrefour' }],
  bina('king-store', 'קינג סטור', '7290058108879', 'kingstore'),
  bina('shuk-hayir', 'שוק העיר', '7290058148776', 'shuk-hayir'),
  bina('zol-vebegadol', 'זול ובגדול', '7290058173198', 'zolvebegadol'),
  bina('super-bareket', 'סופר ברקת', '7290875100001', 'superbareket'),
  bina('maayan-2000', 'מעיין 2000', '7290058159628', 'maayan2000'),
  bina('super-sapir', 'סופר ספיר', '7290058156016', 'supersapir'),
  bina('city-market', 'סיטי מרקט', '7290058266241', 'citymarketkiryatgat'),
  bina('meshnat-yosef', 'משנת יוסף', '7290058289400', 'ktshivuk'),
  bina('shefa-birkat-hashem', 'שפע ברכת השם', '7290058134977', 'shefabirkathashem'),
]));
// Carrefour's page: const path = 'YYYYMMDD'; const files = [{ name: … }, …]
function carrefourFiles(html) {
  const day = (/const path = '(\d{8})'/.exec(html) || [])[1];
  const m = /const files = (\[[\s\S]*?\]);/.exec(html) || /const files = (\[[\s\S]*?\])\s*$/m.exec(html);
  if (!day || !m) return [];
  let rows = [];
  try { rows = JSON.parse(m[1]); } catch (e) { return []; }
  return rows.map(r => String(r.name || '').trim()).filter(Boolean)
    .map(name => ({ name, url: `https://prices.carrefour.co.il/${day}/${encodeURIComponent(name)}` }));
}
const cerberusCsrf = html => (/<meta name="csrftoken" content="([^"]+)"/.exec(String(html || '')) || [])[1] || null;

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

// Chains name their records differently: <Store> or <Branch> (Victory wraps <Branch>es in one <Store>),
// <Item> or <Product>. The tag that yields the most usable records wins.
function bestRecords(xml, tags, usable) {
  let best = [];
  for (const t of tags) { const r = records(xml, t).filter(usable); if (r.length > best.length) best = r; }
  return best;
}
function parseStores(xml) {
  return bestRecords(xml, ['Store', 'Branch'], f => pick(f, 'storeid')).map(f => ({
    storeId: pick(f, 'storeid'), subChainId: pick(f, 'subchainid'), subChainName: pick(f, 'subchainname'),
    name: pick(f, 'storename'), city: pick(f, 'city'), address: pick(f, 'address'),
  })).filter(s => s.storeId);
}

function parsePrices(xml) {
  return bestRecords(xml, ['Item', 'Product'], f => pick(f, 'itemcode')).map(f => ({
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


// Israel's official locality codes (as the Stores files give them) → name, for the branch picker
const CITY_NAMES = {
  70: 'אשדוד', 1200: 'מודיעין', 2610: 'בית שמש', 2640: 'ראש העין', 2650: 'רמת השרון', 2660: 'יבנה',
  3000: 'ירושלים', 3797: 'מודיעין עילית', 4000: 'חיפה', 5000: 'תל אביב-יפו', 6100: 'בני ברק', 6200: 'בת ים',
  6300: 'גבעתיים', 6400: 'הרצליה', 6500: 'חדרה', 6600: 'חולון', 6900: 'כפר סבא', 7000: 'לוד', 7100: 'אשקלון',
  7400: 'נתניה', 7900: 'פתח תקווה', 8300: 'ראשון לציון', 8400: 'רחובות', 8500: 'רמלה', 8600: 'רמת גן',
  8700: 'רעננה', 9000: 'באר שבע', 9700: 'הוד השרון',
};
const cityName = c => (c == null ? '' : CITY_NAMES[Number(c)] || (/^\d+$/.test(String(c)) ? '' : String(c)));
// A branch as the app shows it: "פתח תקווה · ראשון לציון 1"
function storeLabel(s) {
  const city = cityName(s.city);
  const addr = String(s.address || '').split(',').map(x => x.trim()).filter(x => x && x !== 'ישראל' && x !== city && !/^פ"?ת$/.test(x)).join(', ');
  if (s.name && city && norm(s.name).includes(norm(city))) return s.name; // "שופרסל דיל פתח תקווה"
  return [city, s.name || addr].filter(Boolean).join(' · ') || ('סניף ' + s.storeId);
}

// Products for a list item, best first: every query word in the name, the name starting with the
// query ("חלב 3%…" before "ריבת חלב"), then shorter names. Free items (price 0) are left out.
// Words that mark a processed or flavoured variant ("עגבניות מרוסקות", "חלב סויה") — listed after
// the plain product unless the query asks for them.
const VARIANT_WORDS = new Set(['מרוכז', 'יבשות', 'יבש', 'מרוסקות', 'מוחמצות', 'מוחמצים', 'כבושות', 'כבושים', 'כבוש', 'מיובשות',
  'במלח', 'בחומץ', 'בטעם', 'בטעמים', 'טעם', 'סויה', 'שוקו', 'כתוש', 'אבקה', 'אבקת', 'גבישי', 'פנים', 'מיסילרי', 'סלט', 'ממרח',
  'ריבת', 'מעדן', 'תבלין', 'רוטב', 'חטיף', 'מסטיק', 'ליקר', 'פחית', 'צ\'יפס', 'קפוא', 'קפואים', 'סנפרוסט', 'מגבונים']);
function rankProducts(items, query, limit = 25) {
  const words = norm(query).split(' ').filter(Boolean);
  if (!words.length) return [];
  const scored = [];
  for (const i of items) {
    if (!i.price) continue;
    const n = norm(i.name), nw = n.split(' '), hay = n + ' ' + norm(i.maker || '');
    if (!words.every(w => hay.includes(w))) continue;
    const starts = nw.slice(0, words.length).join(' ') === words.join(' ') ? 0 : nw[0] === words[0] ? 1 : nw.includes(words[0]) ? 2 : 3;
    const variant = nw.some(w => VARIANT_WORDS.has(w) && !words.includes(w)) ? 1 : 0;
    scored.push([starts, variant, nw.length, i]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  return scored.slice(0, limit).map(x => x[3]);
}

// Is a branch in this city? Its city field, or the city named in its label (also as it's commonly
// abbreviated: פ"ת, ראשל"צ…)
const CITY_ALIASES = {
  'פתח תקווה': ['פתח תקוה', 'פ"ת', 'פת'], 'ראשון לציון': ['ראשל"צ', 'ראשלצ'], 'תל אביב-יפו': ['תל אביב', 'ת"א', 'יפו'],
  'באר שבע': ['ב"ש'], 'ירושלים': ['י-ם'], 'רמת גן': ['ר"ג'], 'כפר סבא': ['כ"ס'], 'הוד השרון': ['הוד-השרון'],
  'בני ברק': ['ב"ב'], 'ראש העין': ['ראש-העין'], 'קריית אונו': ['קרית אונו'], 'קריית גת': ['קרית גת'],
};
function sameCity(store, city) {
  if (!city) return false;
  const c = norm(city), names = [c, ...(CITY_ALIASES[city] || []).map(norm)];
  const sc = norm(cityName(store.city) || '');
  if (sc && names.includes(sc)) return true;
  const hay = ' ' + norm([store.name, store.address, cityName(store.city)].join(' ')) + ' ';
  return names.some(n => n.length > 2 ? hay.includes(n) : hay.includes(' ' + n + ' '));
}
// Online shops, warehouses and pharmacy sub-chains aren't somewhere to shop for groceries
const notAShop = s => /online|אונליין|מחסן אונליין|^be\s|\sbe\s|be פארם|מרלו"ג|משרד/i.test(' ' + [s.name, s.subChainName].join(' ') + ' ');

// A product in another branch for a list item: by its barcode there, else by name — the product's
// name in the family's branch, cut shorter until something matches, then the item's own name. A
// product sold by weight is matched to one sold by weight (and packaged to packaged).
function matchItem(byCode, items, it) {
  if (it.code && byCode.get(String(it.code))) return { p: byCode.get(String(it.code)), how: 'code' };
  const words = n => norm(n).split(' ').filter(x => x && !/^\d/.test(x));
  const pw = words(it.product || ''), tries = [];
  for (let k = Math.min(pw.length, 3); k >= 2; k--) tries.push(pw.slice(0, k).join(' ')); // the product's name, specific first
  if (it.name) tries.push(words(it.name).slice(0, 2).join(' '), words(it.name)[0]);       // the item's own name
  if (pw[0]) tries.push(pw[0]);
  for (const q of [...new Set(tries.filter(Boolean))]) {
    const q0 = q.split(' ')[0], stem = q0.slice(0, Math.max(3, q0.length - 2)); // עגבניה / עגבניות, ביצי / ביצים
    const ok = rankProducts(items, q, 12).filter(p => (it.weighted == null || !!p.weighted === !!it.weighted)
      && (words(p.name)[0] || '').startsWith(stem)).slice(0, 5);
    if (ok.length) { // the plainest (fewest words), then the cheaper
      ok.sort((a, b) => words(a.name).length - words(b.name).length || a.price - b.price);
      return { p: ok[0], how: 'name' };
    }
  }
  return null;
}

module.exports = { sameCity, notAShop, matchItem, CHAINS, CERBERUS, carrefourFiles, cerberusCsrf, CITY_NAMES, cityName, storeLabel, rankProducts, HATZI_HINAM, listingLinks, parseFilename, sameStore, toText, parseStores, parsePrices, findStore, searchProducts, norm };

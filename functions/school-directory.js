'use strict';
// The Ministry of Education's list of schools (data.gov.il, "מוסדות חינוך"): each school's
// Ministry code (סמל מוסד) with its official name and city. Webtop and Mashov know a school by
// this code, so a parent's sync tells us the school's official name and city — no typing, no
// spelling differences, and nothing to approve by hand. Bundled in data/israel-schools.json
// (refresh it from data.gov.il once a year).

let _data = null;
const data = () => (_data ||= require('./data/israel-schools.json'));
const bundled = () => data().schools;

// ── Fresh list from data.gov.il ──
const SOURCE_RESOURCE = '2055063b-93e8-4d6a-b2c5-c253d18c0cf6'; // "מוסדות חינוך" table
const SOURCE_FIELDS = 'SEMEL_MOSAD,SHEM_MOSAD,ISV_SHEM_ISHUV,TEUR_TAT_SUG_MISGERET,TEUR_SHLAV_HINUH';
// Institutions teaching elementary / middle / high school, minus these kinds
const NOT_SCHOOLS = new Set(['אשכול גנים', 'מתי"א', 'מרכז פסגה (מרפ"ד)', 'היל"ה ברשות', 'פנימיה צמודה לבית ספר', 'אולפן עולים', 'מכללה איזורית']);
const squash = v => String(v ?? '').split(/\s+/).filter(Boolean).join(' ');
// data.gov.il records → {semel: [name, city]}
function filterRecords(records) {
  const out = {};
  for (const r of records || []) {
    const stage = String(r.TEUR_SHLAV_HINUH || '');
    if (!/יסודי|חט"ב|עליונה/.test(stage) || NOT_SCHOOLS.has(r.TEUR_TAT_SUG_MISGERET)) continue;
    const semel = String(r.SEMEL_MOSAD ?? '').replace(/\D/g, '').replace(/^0+/, '');
    const name = squash(r.SHEM_MOSAD), city = squash(r.ISV_SHEM_ISHUV);
    if (semel && name && city) out[semel] = [name, city];
  }
  return out;
}
// Downloads the whole table (≈35,000 rows, in pages) → {semel: [name, city]}
async function download(fetchImpl = fetch) {
  const records = [];
  for (let offset = 0; offset < 200000; ) {
    const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=${SOURCE_RESOURCE}&limit=10000&offset=${offset}&fields=${SOURCE_FIELDS}`;
    const res = await fetchImpl(url, { headers: { 'User-Agent': 'FamilyHub school list' } });
    if (!res.ok) throw new Error('data.gov.il answered ' + res.status);
    const j = await res.json();
    if (!j?.success) throw new Error('data.gov.il: unexpected answer');
    const page = j.result?.records || [];
    records.push(...page);
    if (page.length < 10000) break;
    offset += page.length;
  }
  const schools = filterRecords(records);
  // A broken or partial answer must not replace the list: a real one has thousands of schools
  if (Object.keys(schools).length < 3000) throw new Error('data.gov.il: only ' + Object.keys(schools).length + ' schools — not using it');
  return schools;
}

// Same normalisation as normCityId in app.js (schoolIndex/schools__<key>)
const cityKey = city => String(city || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w֐-׿]/g, '');

// {semel, name, city} for a Ministry code, or null. schools: a downloaded list (default: bundled)
function lookup(semel, schools = bundled()) {
  const k = String(semel ?? '').replace(/\D/g, '').replace(/^0+/, '');
  const v = k && schools[k];
  return v ? { semel: k, name: v[0], city: v[1] } : null;
}

// Everything the city / school pickers need: [cities], {cityKey: {city, names: [...]}}
function indexEntries(list = bundled()) {
  const cities = new Set();
  const byCity = {};
  for (const [name, city] of Object.values(list)) {
    cities.add(city);
    const key = cityKey(city);
    (byCity[key] ||= { city, names: new Set() }).names.add(name);
  }
  const schools = {};
  for (const [key, v] of Object.entries(byCity)) schools[key] = { city: v.city, names: [...v.names].sort() };
  return { cities: [...cities].sort(), schools };
}

const meta = () => data().meta;

// Two spellings of the same name: Hebrew and plain quote marks (ע״ש / ע"ש, ג׳ / ג'), spacing
// around dashes and repeated spaces don't count.
const nameKey = s => String(s || '')
  .replace(/[\u05F4\u201C\u201D\u201E"]/g, '"').replace(/[\u05F3\u2018\u2019`']/g, "'")
  .replace(/\s*[-\u2013\u2014\u05BE]\s*/g, '-').replace(/\s+/g, ' ').trim().toLowerCase();

// existing + incoming without a second spelling of a name: the first spelling wins (one already
// in use by families keeps its place, so their class ids — built from the name — stay the same)
function mergeNames(existing, incoming = []) {
  const seen = new Set(), out = [];
  for (const n of [...(existing || []), ...incoming]) {
    const t = String(n || '').trim(), k = nameKey(t);
    if (!k || seen.has(k)) continue;
    seen.add(k); out.push(t);
  }
  return out;
}
// The spelling of `name` already in `list`, if any
const findName = (list, name) => (list || []).find(n => nameKey(n) === nameKey(name)) || null;

module.exports = { lookup, indexEntries, cityKey, meta, nameKey, mergeNames, findName, filterRecords, download, bundled, SOURCE_RESOURCE };

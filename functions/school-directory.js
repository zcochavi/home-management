'use strict';
// The Ministry of Education's list of schools (data.gov.il, "מוסדות חינוך"): each school's
// Ministry code (סמל מוסד) with its official name and city. Webtop and Mashov know a school by
// this code, so a parent's sync tells us the school's official name and city — no typing, no
// spelling differences, and nothing to approve by hand. Bundled in data/israel-schools.json
// (refresh it from data.gov.il once a year).

let _data = null;
const data = () => (_data ||= require('./data/israel-schools.json'));

// Same normalisation as normCityId in app.js (schoolIndex/schools__<key>)
const cityKey = city => String(city || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^\w֐-׿]/g, '');

// {semel, name, city} for a Ministry code, or null
function lookup(semel) {
  const k = String(semel ?? '').replace(/\D/g, '').replace(/^0+/, '');
  const v = k && data().schools[k];
  return v ? { semel: k, name: v[0], city: v[1] } : null;
}

// Everything the city / school pickers need: [cities], {cityKey: {city, names: [...]}}
function indexEntries() {
  const cities = new Set();
  const byCity = {};
  for (const [name, city] of Object.values(data().schools)) {
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

module.exports = { lookup, indexEntries, cityKey, meta, nameKey, mergeNames, findName };

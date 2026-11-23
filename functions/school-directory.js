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

module.exports = { lookup, indexEntries, cityKey, meta };

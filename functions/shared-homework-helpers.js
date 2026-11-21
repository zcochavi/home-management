'use strict';
// Class-wide synced homework. A family's Webtop / Mashov sync stores homework on its own
// family doc; onFamilySyncedHomework copies each item to the kid's class at
// schoolClasses/{classId}/syncedHomework/{syncId}, so every family in that class sees it —
// one parent's import serves the whole class. Checks stay on each family's own doc.
//
// syncId is computed the same way in app.js (_hwSyncId): two parents syncing the same class
// produce the same id, so an item is stored once.

const MASHOV_PREFIX = 'mashov_';
const PUBLISH_DAYS = 120; // only recent homework is shared (older items have expired anyway)

const norm = s => String(s == null ? '' : s).trim().replace(/\s+/g, ' ');
const dayOf = h => String(h?.date || '').slice(0, 10);

// FNV-1a 32-bit, as hex — run twice with different seeds for a 16-char id
function fnv(str, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}
function syncId(h) {
  const key = [norm(h.subject), dayOf(h), norm(h.text)].join('|');
  return fnv(key, 0x811c9dc5) + fnv(key, 0x01234567);
}

// Which kid a synced item belongs to: Mashov items by child guid, Webtop items by class code.
// Only exact mappings — an item whose kid isn't known isn't shared.
function kidFor(h, members) {
  const code = String(h?.classCode || '');
  if (!code) return null;
  if (code.startsWith(MASHOV_PREFIX)) {
    const guid = code.slice(MASHOV_PREFIX.length);
    return members.find(m => m.role === 'kid' && m.mashovChildId === guid) || null;
  }
  return members.find(m => m.role === 'kid' && m.webtopClassCode === code) || null;
}

// { "<classId>/<syncId>": {cid, id, data} } for a family doc's synced homework
function sharedItems(fam, classIdFor, now = Date.now()) {
  const members = Array.isArray(fam?.members) ? fam.members : [];
  const cutoff = new Date(now - PUBLISH_DAYS * 864e5).toISOString().slice(0, 10);
  const out = {};
  const add = (h, source) => {
    const date = dayOf(h);
    if (!date || date < cutoff || !norm(h.text)) return;
    const kid = kidFor(h, members);
    const cid = kid?.school ? classIdFor(kid.school) : null;
    if (!cid) return;
    const id = syncId(h);
    const data = { subject: norm(h.subject), text: norm(h.text), date, source };
    if (norm(h.context)) data.context = norm(h.context);
    if (Number(h.files) > 0) data.files = Number(h.files);
    out[cid + '/' + id] = { cid, id, data };
  };
  (fam?.webtopHomework || []).forEach(h => add(h, 'webtop'));
  (fam?.mashovHomework || []).forEach(h => add(h, 'mashov'));
  return out;
}

// Items to write: new ones, or ones whose content changed since the previous version of the doc
function changedItems(before, after, classIdFor, now = Date.now()) {
  const prev = sharedItems(before || {}, classIdFor, now);
  const next = sharedItems(after || {}, classIdFor, now);
  return Object.entries(next)
    .filter(([k, v]) => !prev[k] || JSON.stringify(prev[k].data) !== JSON.stringify(v.data))
    .map(([, v]) => v);
}

module.exports = { syncId, kidFor, sharedItems, changedItems, PUBLISH_DAYS, MASHOV_PREFIX };

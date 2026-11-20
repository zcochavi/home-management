'use strict';
// Guest edits on shared list links ("allow edits"). A guest never writes the list itself:
// each add / rename / delete is queued as a small request under publicShares/{token}/edits,
// and onShareEdit applies it to the owner's list and to every link of that list. Applying
// one explicit operation (instead of copying a guest's whole item array over the list) means
// an owner change and a guest change made at the same moment can't erase each other.

const MAX_NAME  = 120;
const MAX_QTY   = 20;
const MAX_BY    = 30;
const MAX_ITEMS = 500;

const str = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Validate a raw edit request; returns a clean edit or null.
function cleanEdit(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const op = raw.op;
  if (!['add', 'rename', 'delete'].includes(op)) return null;
  const edit = { op, by: str(raw.by, MAX_BY) };
  if (op !== 'add') {
    if (raw.itemId == null || raw.itemId === '') return null;
    edit.itemId = String(raw.itemId);
  }
  if (op !== 'delete') {
    edit.name = str(raw.name, MAX_NAME);
    if (!edit.name) return null;
    const qty = str(raw.qty, MAX_QTY);
    if (qty) edit.qty = qty;
  }
  return edit;
}

// Apply a clean edit to a list's items. Returns the new array, or null when nothing changes
// (unknown item, list full, rename to the same text).
function applyEdit(items, edit, now = Date.now()) {
  const list = Array.isArray(items) ? items : [];
  if (edit.op === 'add') {
    if (list.length >= MAX_ITEMS) return null;
    // Same numeric ids as items the owner adds (Date.now()), kept unique within the list
    const maxId = list.reduce((m, i) => (typeof i?.id === 'number' && i.id > m ? i.id : m), 0);
    const item = { id: Math.max(now, maxId + 1), name: edit.name, done: false };
    if (edit.qty) item.qty = edit.qty;
    if (edit.by) item.addedBy = edit.by;
    return [...list, item];
  }
  const idx = list.findIndex(i => String(i?.id) === edit.itemId);
  if (idx < 0) return null;
  if (edit.op === 'delete') return list.filter((_, i) => i !== idx);
  const cur = list[idx];
  if (cur.name === edit.name && (edit.qty === undefined || cur.qty === edit.qty)) return null;
  const next = { ...cur, name: edit.name };
  if (edit.qty !== undefined) next.qty = edit.qty;
  return list.map((it, i) => (i === idx ? next : it));
}

// The items a link should hold for the owner's current list — mirrors _syncAllItemsToShares
// in app.js: joint links ('edit' / 'claim') keep their guests' checks, view-only links carry
// no check state, personal-checking links get the list as is.
function shareItemsFor(listItems, mode, shareItems) {
  const clone = o => JSON.parse(JSON.stringify(o));
  const byId = new Map((shareItems || []).map(s => [String(s.id), s]));
  return (listItems || []).map(i => {
    if (mode === 'edit' || mode === 'claim') {
      const ex = byId.get(String(i.id));
      return ex
        ? { ...clone(i), done: !!ex.done, checkedBy: ex.checkedBy || null, checkedById: ex.checkedById || null }
        : clone(i);
    }
    if (mode === 'readonly') {
      const { done, checkedBy, checkedById, ...rest } = clone(i);
      return rest;
    }
    return clone(i);
  });
}

module.exports = { cleanEdit, applyEdit, shareItemsFor, MAX_NAME, MAX_QTY, MAX_BY, MAX_ITEMS };

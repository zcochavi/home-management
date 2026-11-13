// Test doubles for functions/mcp.js: an in-memory Firestore and a plain http server that gives
// the handler the same req/res shape Cloud Functions does.
'use strict';
const http = require('http');

function fakeFirestore() {
  const store = new Map(); // full document path -> data
  let autoId = 0;
  // Like the real thing, a snapshot keeps the data it was read with.
  const snap = (path) => {
    const data = store.has(path) ? structuredClone(store.get(path)) : undefined;
    return { id: path.split('/').pop(), exists: data !== undefined, data: () => structuredClone(data), ref: docRef(path) };
  };
  function docRef(path) {
    return {
      id: path.split('/').pop(),
      path,
      get: async () => snap(path),
      set: async (data) => { store.set(path, structuredClone(data)); },
      update: async (data) => {
        if (!store.has(path)) throw new Error('NOT_FOUND: ' + path);
        store.set(path, { ...store.get(path), ...structuredClone(data) });
      },
      delete: async () => { store.delete(path); },
      collection: (name) => colRef(path + '/' + name),
    };
  }
  function colRef(path, filters = [], max = Infinity) {
    const ops = { '<': (a, b) => a < b, '==': (a, b) => a === b };
    return {
      doc: (id) => docRef(path + '/' + id),
      add: async (data) => { const ref = docRef(path + '/auto' + (++autoId)); await ref.set(data); return ref; },
      where: (field, op, value) => colRef(path, [...filters, [field, op, value]], max),
      limit: (n) => colRef(path, filters, n),
      get: async () => {
        const docs = [...store.keys()]
          .filter(k => k.startsWith(path + '/') && !k.slice(path.length + 1).includes('/'))
          .filter(k => filters.every(([f, op, v]) => ops[op](store.get(k)[f], v)))
          .slice(0, max).map(snap);
        return { docs, size: docs.length };
      },
    };
  }
  return {
    store,
    collection: (name) => colRef(name),
    runTransaction: async (fn) => fn({
      get: (ref) => ref.get(),
      delete: (ref) => { store.delete(ref.path); },
      update: (ref, data) => { store.set(ref.path, { ...store.get(ref.path), ...data }); },
    }),
  };
}

// Serves `handler` on a random local port; resolves to { url, close }.
function serve(handler) {
  const server = http.createServer((nreq, nres) => {
    const chunks = [];
    nreq.on('data', c => chunks.push(c));
    nreq.on('end', async () => {
      const u = new URL(nreq.url, 'http://localhost');
      const raw = Buffer.concat(chunks).toString('utf8');
      const type = String(nreq.headers['content-type'] || '');
      let body = {};
      if (raw && type.includes('application/json')) { try { body = JSON.parse(raw); } catch (_) { body = {}; } }
      else if (raw && type.includes('application/x-www-form-urlencoded')) body = Object.fromEntries(new URLSearchParams(raw));
      const req = { method: nreq.method, path: u.pathname, query: Object.fromEntries(u.searchParams), headers: nreq.headers, body };
      const res = {
        status(code) { nres.statusCode = code; return res; },
        set(k, v) { nres.setHeader(k, v); return res; },
        send(b) { nres.end(b); return res; },
        end() { nres.end(); return res; },
        redirect(code, loc) { nres.statusCode = code; nres.setHeader('Location', loc); nres.end(); },
      };
      await handler(req, res);
    });
  });
  return new Promise(resolve => server.listen(0, '127.0.0.1', () => resolve({
    url: 'http://127.0.0.1:' + server.address().port,
    close: () => new Promise(r => server.close(r)),
  })));
}

module.exports = { fakeFirestore, serve };

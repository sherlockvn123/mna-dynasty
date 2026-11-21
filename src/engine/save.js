// Progress & Save Engine — IndexedDB with localStorage fallback. Local-first; no network.
const DB = 'mna-dynasty', STORE = 'kv', VERSION = 1;
let dbp = null;
let memory = null; // used in tests (in-memory backend)

function openDb() {
  if (dbp) return dbp;
  dbp = new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB, VERSION);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    } catch { resolve(null); }
  });
  return dbp;
}

export function useMemoryBackend() { memory = new Map(); }

export async function get(key) {
  if (memory) return memory.has(key) ? structuredClone(memory.get(key)) : undefined;
  const db = await openDb();
  if (db) {
    const v = await new Promise((res) => {
      try {
        const r = db.transaction(STORE, 'readonly').objectStore(STORE).get(key);
        r.onsuccess = () => res(r.result); r.onerror = () => res(undefined);
      } catch { res(undefined); }
    });
    if (v !== undefined) return v;
  }
  try { const s = localStorage.getItem('mna:' + key); return s ? JSON.parse(s) : undefined; } catch { return undefined; }
}

export async function set(key, value) {
  const plain = JSON.parse(JSON.stringify(value));
  if (memory) { memory.set(key, plain); return true; }
  const db = await openDb();
  let ok = false;
  if (db) {
    ok = await new Promise((res) => {
      try {
        const tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(plain, key);
        tx.oncomplete = () => res(true); tx.onerror = () => res(false); tx.onabort = () => res(false);
      } catch { res(false); }
    });
  }
  // mirror to localStorage as a safety net (small payloads)
  try { localStorage.setItem('mna:' + key, JSON.stringify(plain)); ok = true; } catch { /* quota or private mode */ }
  return ok;
}

export async function del(key) {
  if (memory) { memory.delete(key); return; }
  const db = await openDb();
  if (db) await new Promise((res) => { try { const tx = db.transaction(STORE, 'readwrite'); tx.objectStore(STORE).delete(key); tx.oncomplete = res; tx.onerror = res; } catch { res(); } });
  try { localStorage.removeItem('mna:' + key); } catch { /* ignore */ }
}

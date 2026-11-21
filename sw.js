// Offline-first service worker: precache app shell; network-first for HTML so updates arrive.
const CACHE = 'mna-dynasty-v27';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg', './src/styles.css', './src/main.js',
  './src/engine/finance.js', './src/engine/store.js', './src/engine/save.js', './src/engine/negotiation.js',
  './src/content/quests.js', './src/content/quests_career.js', './src/content/quests_industry.js', './src/content/quests_consulting.js', './src/content/quests_im.js', './src/content/quests_transition.js', './src/content/quests_endgame.js', './src/content/quests_crisis.js', './src/content/quests_succession.js', './src/content/quests_cases.js', './src/content/quests_cases2.js', './src/content/quests_replay.js', './src/content/quests_replay2.js', './src/content/cases_extra.js', './src/engine/fundsim.js', './src/engine/league.js', './src/engine/lenses.js', './src/ui/charts.js', './src/ui/lpReport.js', './src/content/sectors.js', './src/content/characters.js', './src/content/locations.js', './src/content/items.js', './src/content/glossary.js', './src/content/cases.js', './src/content/careers.js', './src/content/models.js',
  './src/ui/app.js', './src/ui/panels.js', './src/ui/mission.js', './src/ui/world.js', './src/ui/art.js', './src/ui/chibi.js', './src/ui/dom.js', './src/ui/fx.js'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});

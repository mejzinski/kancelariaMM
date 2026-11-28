const CACHE = 'kancelaria-v17';
const ASSETS = ['./index.html', './manifest.json'];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  // tylko pliki samej apki — zapytania do Firebase, Google (kalendarz) itp. przechodzą bez zapisu w pamięci podręcznej
  if(new URL(e.request.url).origin !== self.location.origin) return;
  // network-first, żeby aktualizacje docierały od razu; offline z pamięci podręcznej
  e.respondWith(
    fetch(e.request,{cache:'no-store'}).then(res=>{
      const clone = res.clone();
      caches.open(CACHE).then(c=>c.put(e.request, clone));
      return res;
    }).catch(()=>caches.match(e.request))
  );
});

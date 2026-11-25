const CACHE = 'automa-v6';
const ASSETS = [
  './', 'index.html', 'style.css', 'cards.js', 'rules.js', 'app.js', 'manifest.webmanifest',
  'icons/icon-192.png', 'icons/icon-512.png',
  'img/setup-board.jpg', 'img/coin.png', 'img/movement-map.jpg', 'img/rank-track.jpg', 'img/rank-visible.jpg',
  'img/end-of-game.jpg', 'img/wave-placing.jpg',
  ...['pilgrim', 'merchant', 'artist'].flatMap((c) => [1, 2, 3, 4, 5, 6].map((l) => 'img/cards2/' + c + '-' + l + '.jpg')),
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match('index.html')))
  );
});

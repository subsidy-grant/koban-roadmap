// PWAオフラインキャッシュ。制度データ(page_data.js等)は更新頻度が高いため
// network-first（オンライン時は常に最新を取り、失敗時だけキャッシュを返す）。
// それ以外の静的資産はcache-first。
var CACHE_NAME = 'koban-roadmap-v5';
var CORE_ASSETS = [
  './',
  './index.html',
  './program.html',
  './documents.html',
  './applications.html',
  './criteria.html',
  './profile.html',
  './profile_edit.html',
  './profile_status.html',
  './common_docs.js',
  './company_data.js',
  './page_data.js',
  './sim_data.js',
  './app_tabbar.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) { return cache.addAll(CORE_ASSETS); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (names) {
      return Promise.all(names.filter(function (n) { return n !== CACHE_NAME; })
        .map(function (n) { return caches.delete(n); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    fetch(e.request).then(function (res) {
      var copy = res.clone();
      caches.open(CACHE_NAME).then(function (cache) { cache.put(e.request, copy); });
      return res;
    }).catch(function () {
      return caches.match(e.request).then(function (cached) {
        return cached || caches.match('./index.html');
      });
    })
  );
});

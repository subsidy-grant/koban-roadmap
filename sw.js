// PWAオフラインキャッシュ・高速化。
// 2026-08-15、起動・遷移が遅いという指摘を受けて戦略を見直した。
// 以前は全リクエストがfetch()の完了を待ってから応答する実装で、
// キャッシュが「オフライン時の保険」にしかなっておらず、
// キャッシュがあっても毎回ネットワークで待たされていた。
//
//   HTML・静的JS（app_tabbar.js等）・アイコン・フォント
//     → cache-first（stale-while-revalidate）。キャッシュがあれば即返し、
//       裏で最新版を取りに行ってキャッシュを更新する。次回アクセスから反映。
//   page_data.js・sim_data.js（制度の金額・締切など鮮度が重要）
//     → network-first。速いオンライン時は最新を待つが、
//       1.5秒でネットワークが返ってこなければキャッシュ優先で表示を進める。
var CACHE_NAME = 'koban-roadmap-v14';
var CORE_ASSETS = [
  './',
  './index.html',
  './improvement.html',
  './program.html',
  './documents.html',
  './applications.html',
  './criteria.html',
  './profile.html',
  './profile_edit.html',
  './profile_status.html',
  './consult.html',
  './common_docs.js',
  './company_data.js',
  './page_data.js',
  './sim_data.js',
  './experts_data.js',
  './consult.js',
  './app_tabbar.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/apple-touch-icon.png'
];
// 鮮度優先（network-first + タイムアウトでキャッシュへ切替）で扱うファイル名
var FRESH_FIRST = ['page_data.js', 'sim_data.js', 'experts_data.js'];
var NETWORK_TIMEOUT_MS = 1500;

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

function timeoutFetch(request, ms) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error('timeout')); }, ms);
    fetch(request).then(function (res) {
      clearTimeout(timer);
      resolve(res);
    }, function (err) {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function putCache(request, response) {
  if (!response || !response.ok) return;
  var copy = response.clone();
  caches.open(CACHE_NAME).then(function (cache) { cache.put(request, copy); });
}

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === location.origin;
  var isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if (!sameOrigin && !isFont) return;

  var isFreshFirst = sameOrigin && FRESH_FIRST.some(function (name) {
    return url.pathname.indexOf(name) !== -1;
  });

  if (isFreshFirst) {
    // network-first + タイムアウト：遅い回線ではキャッシュへ切り替えて待たせない
    e.respondWith(
      timeoutFetch(e.request, NETWORK_TIMEOUT_MS).then(function (res) {
        putCache(e.request, res);
        return res;
      }).catch(function () {
        return caches.match(e.request).then(function (cached) {
          if (cached) return cached;
          return fetch(e.request);
        });
      })
    );
    return;
  }

  // cache-first（stale-while-revalidate）：あれば即返し、裏で更新
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      var network = fetch(e.request).then(function (res) {
        putCache(e.request, res);
        return res;
      }).catch(function () { return null; });
      if (cached) {
        network.catch(function () {});
        return cached;
      }
      return network.then(function (res) {
        return res || caches.match('./index.html');
      });
    })
  );
});

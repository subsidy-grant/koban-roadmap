// アプリ風の下部タブバー。6ページ共通。
// 各HTMLの</body>直前で <script src="app_tabbar.js"></script> のみ読み込めば動く
// （HTML側にマークアップを書く必要はない。CSSもこのファイル内でinjectする）。
(function () {
  'use strict';
  var TABS = [
    { href: 'index.html', match: /^(|index\.html)$/, icon: '🔍', label: '探す' },
    { href: 'documents.html', match: /^documents\.html$/, icon: '📄', label: '書類準備' },
    { href: 'applications.html', match: /^applications\.html$/, icon: '✅', label: '申請進捗' },
    { href: 'profile.html', match: /^profile(_edit|_status)?\.html$/, icon: '🏢', label: '会社情報' }
  ];

  var style = document.createElement('style');
  style.textContent =
    ':root { --app-tabbar-h: 78px; }' +
    '.app-tabbar { position: fixed; left: 0; right: 0; bottom: 0; z-index: 500;' +
    '  display: flex; background: var(--paper-raised); border-top: 1px solid var(--line);' +
    '  box-shadow: 0 -2px 6px var(--shadow);' +
    '  padding-bottom: env(safe-area-inset-bottom, 0); }' +
    '.app-tab { flex: 1 1 0; display: flex; flex-direction: column; align-items: center;' +
    '  justify-content: center; gap: 0.25rem; padding: 0.6rem 0.2rem; min-height: var(--app-tabbar-h);' +
    '  text-decoration: none; color: var(--ink-faint); font-size: 0.82rem; line-height: 1.3;' +
    '  transition: color 0.08s ease, transform 0.08s ease; }' +
    '.app-tab .icon { font-size: 1.85rem; line-height: 1; }' +
    '.app-tab.is-current { color: var(--accent); font-weight: 700; }' +
    '.app-tab:active { transform: scale(0.93); }' +
    '@media (prefers-reduced-motion: reduce) { .app-tab { transition: none; } }' +
    'body.has-app-tabbar { padding-bottom: calc(var(--app-tabbar-h) + env(safe-area-inset-bottom, 0)); }' +
    '@media print { .app-tabbar { display: none; } body.has-app-tabbar { padding-bottom: 0; } }';
  document.head.appendChild(style);

  var path = location.pathname.split('/').pop() || '';

  var nav = document.createElement('nav');
  nav.className = 'app-tabbar';
  nav.setAttribute('aria-label', 'メインメニュー');
  TABS.forEach(function (t) {
    var a = document.createElement('a');
    a.className = 'app-tab' + (t.match.test(path) ? ' is-current' : '');
    a.href = t.href;
    if (t.match.test(path)) a.setAttribute('aria-current', 'page');
    a.innerHTML = '<span class="icon" aria-hidden="true">' + t.icon + '</span><span>' + t.label + '</span>';
    nav.appendChild(a);
  });

  document.body.classList.add('has-app-tabbar');
  document.body.appendChild(nav);
})();

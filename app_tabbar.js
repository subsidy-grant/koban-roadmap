// アプリ風の下部タブバー。6ページ共通。
// 各HTMLの</body>直前で <script src="app_tabbar.js"></script> のみ読み込めば動く
// （HTML側にマークアップを書く必要はない。CSSもこのファイル内でinjectする）。
(function () {
  'use strict';
  // アイコンは案7（太めアウトライン＋角丸スクエア）。stroke色はCSSのcurrentColorで
  // .app-tab / .app-tab.is-current の color 指定に追従させる。
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><circle cx="10.5" cy="10.5" r="3.3"/><line x1="12.8" y1="12.8" x2="16" y2="16" stroke-linecap="round"/></svg>';
  var ICON_DOCS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><line x1="7.5" y1="9.5" x2="16.5" y2="9.5" stroke-linecap="round"/><line x1="7.5" y1="13" x2="16.5" y2="13" stroke-linecap="round"/><line x1="7.5" y1="16.5" x2="13" y2="16.5" stroke-linecap="round"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><path d="M8 12.3l2.5 2.5 5-5.3" stroke-linecap="round"/></svg>';
  var ICON_BUILDING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><path d="M7.5 16V9.5l4.5-2 4.5 2V16" stroke-linecap="round"/></svg>';

  var TABS = [
    { href: 'index.html', match: /^(|index\.html)$/, icon: ICON_SEARCH, label: '探す' },
    { href: 'documents.html', match: /^documents\.html$/, icon: ICON_DOCS, label: '書類準備' },
    { href: 'applications.html', match: /^applications\.html$/, icon: ICON_CHECK, label: '申請進捗' },
    { href: 'profile.html', match: /^profile(_edit|_status)?\.html$/, icon: ICON_BUILDING, label: '会社情報' }
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
    '.app-tab .icon { display: flex; line-height: 1; }' +
    '.app-tab .icon svg { width: 30px; height: 30px; }' +
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

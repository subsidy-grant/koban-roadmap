// アプリ風の下部タブバー。6ページ共通。
// 各HTMLの</body>直前で <script src="app_tabbar.js"></script> のみ読み込めば動く
// （HTML側にマークアップを書く必要はない。CSSもこのファイル内でinjectする）。
(function () {
  'use strict';
  // アイコンは案7（太めアウトライン＋角丸スクエア）。stroke色はCSSのcurrentColorで
  // .app-tab / .app-tab.is-current の color 指定に追従させる。
  var ICON_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><circle cx="10.5" cy="10.5" r="3.3"/><line x1="12.8" y1="12.8" x2="16" y2="16" stroke-linecap="round"/></svg>';
  var ICON_DOCS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><line x1="7.5" y1="9.5" x2="16.5" y2="9.5" stroke-linecap="round"/><line x1="7.5" y1="13" x2="16.5" y2="13" stroke-linecap="round"/><line x1="7.5" y1="16.5" x2="13" y2="16.5" stroke-linecap="round"/></svg>';
  var ICON_BUILDING = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><path d="M7.5 16V9.5l4.5-2 4.5 2V16" stroke-linecap="round"/></svg>';
  // 電球＝改善のアイデア。他の4つと同じ角丸スクエア＋太めアウトラインのトーンに揃える（2026-08-16）
  var ICON_BULB = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><path d="M12 7.2c-2.2 0-3.8 1.7-3.8 3.7 0 1.3.6 2.2 1.5 3 .4.4.6.9.6 1.4v.4h3.4v-.4c0-.5.2-1 .6-1.4.9-.8 1.5-1.7 1.5-3 0-2-1.6-3.7-3.8-3.7z" stroke-linecap="round"/><line x1="10.5" y1="17.7" x2="13.5" y2="17.7" stroke-linecap="round"/></svg>';
  // 吹き出し＝専門家への相談。既存4アイコンと同じ角丸スクエア＋太めアウトラインのトーン（2026-08-17）
  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="6"/><path d="M7 9.5h10M7 13h6.5" stroke-linecap="round"/><path d="M8.2 16.3H8l-1.6 2v-2.3A2.3 2.3 0 0 1 8.5 13.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // 「使い道の例」（旧ラベル「改善計画」）は本人指示（2026-08-16）で会社情報の左隣に固定。
  // 2026-08-17にラベルを改称：中身は業種別の使い道プラン集（概算金額・補助率つき）なのに、
  // 「改善計画」だと初見の経営者に何のページか伝わらなかったため。
  // ページ本文や improvement/ 配下の「改善計画10選」という呼称は資料名として残している。
  // 「申請進捗」は2026-08-17に固定タブから外した（profile_status.html/documents.htmlから
  // 個別に遷移できるため、5枠目を「相談」に譲った）。「相談」は右から2番目（本人指示、2026-08-17）。
  var TABS = [
    { href: 'index.html', match: /^(|index\.html)$/, icon: ICON_SEARCH, label: '探す' },
    { href: 'documents.html', match: /^documents\.html$/, icon: ICON_DOCS, label: '書類準備' },
    { href: 'improvement.html', match: /^improvement\.html$/, icon: ICON_BULB, label: '使い道の例' },
    { href: 'consult.html', match: /^consult\.html$/, icon: ICON_CHAT, label: '相談' },
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
    '  justify-content: center; gap: 0.22rem; padding: 0.5rem 0.2rem 0.45rem; min-height: var(--app-tabbar-h);' +
    '  text-decoration: none; color: var(--ink-faint); font-size: 0.8rem; line-height: 1.3;' +
    '  position: relative;' +
    '  transition: color 0.12s ease, transform 0.08s ease; }' +
    /* アイコンは丸い器に入れる。非選択は淡い地、選択はベタ塗り＋白抜きにして、
       「色のついた丸がどこにあるか」だけで現在地が分かるようにする（2026-08-16）。 */
    '.app-tab .icon { display: flex; align-items: center; justify-content: center;' +
    '  width: 50px; height: 34px; border-radius: 999px; line-height: 1;' +
    '  background: transparent;' +
    '  transition: background-color 0.12s ease, color 0.12s ease; }' +
    '.app-tab .icon svg { width: 26px; height: 26px; }' +
    '.app-tab.is-current { color: var(--accent); font-weight: 700; }' +
    '.app-tab.is-current .icon { background: var(--accent); color: var(--on-accent, #fff); }' +
    '.app-tab:not(.is-current):hover .icon { background: var(--accent-wash); }' +
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

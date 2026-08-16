// 「専門家に相談する」機能。app_tabbar.js と同じく、マークアップ・CSSともこのJSが注入する
// 自己完結モジュール。使う側は experts_data.js を読み込んでから、
//   window.KOBAN_CONSULT.mount(containerEl, { programKey, programName, kind, topic })
// を呼ぶだけでよい。
//
// kind は 'hojo'（補助金）/ 'josei'（助成金）/ 'other' のいずれか。program.html は
// 既存の pillClass() の戻り値をそのまま渡すこと（判定ロジックをここで複製しない）。
// programKey/programName が無い（criteria.html からの起動など）場合は topic 文字列を使う。
//
// このサイトは何も送信しない。ボタンは LINE アプリ／メールアプリを開くだけで、
// サイト自身が相談内容をどこかへ送ることはない（program.html の「保存も送信もしません」
// という既存の約束と矛盾しないようにするための設計）。
(function () {
  'use strict';

  var style = document.createElement('style');
  style.textContent =
    '.consult-panel { margin-top: 0.8rem; border: 1px solid var(--line); border-radius: var(--radius-md);' +
    '  background: var(--paper-raised); padding: 1rem 1.1rem; }' +
    '.consult-lead { font-size: 0.85rem; color: var(--ink-soft); margin: 0 0 0.7rem; }' +
    '.consult-privacy { font-size: 0.78rem; color: var(--ink-faint); margin: 0 0 0.9rem; }' +
    '.consult-tmpl-wrap { margin-bottom: 1rem; }' +
    '.consult-tmpl-label { font-size: 0.78rem; font-weight: 700; color: var(--ink-faint);' +
    '  letter-spacing: 0.02em; margin-bottom: 0.3rem; }' +
    '.consult-tmpl { width: 100%; box-sizing: border-box; resize: vertical; min-height: 6.5em;' +
    '  font: inherit; font-size: 0.82rem; line-height: 1.6; color: var(--ink);' +
    '  background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius-sm);' +
    '  padding: 0.6rem 0.7rem; }' +
    '.consult-copy-btn { margin-top: 0.5rem; appearance: none; font: inherit; font-size: 0.82rem;' +
    '  cursor: pointer; min-height: 2.75rem; padding: 0 1rem; border-radius: var(--radius-sm);' +
    '  border: 1px solid var(--accent); color: var(--accent); background: var(--paper-raised); }' +
    '.consult-copy-btn:hover, .consult-copy-btn:focus-visible { background: var(--accent-wash); }' +
    '.consult-preparing { background: var(--accent-wash); border-radius: var(--radius-sm);' +
    '  padding: 0.8rem 0.9rem; font-size: 0.85rem; color: var(--ink-soft); }' +
    '.consult-cards { display: grid; gap: 0.7rem; }' +
    '.consult-card { border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.8rem 0.9rem; }' +
    '.consult-card-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 0.15rem; }' +
    '.consult-card-tags { font-size: 0.76rem; color: var(--ink-faint); margin-bottom: 0.5rem; }' +
    '.consult-card-note { font-size: 0.78rem; color: var(--ink-soft); margin-bottom: 0.6rem; }' +
    '.consult-card-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }' +
    '.consult-btn { appearance: none; text-decoration: none; display: inline-flex; align-items: center;' +
    '  justify-content: center; min-height: 2.75rem; padding: 0 1rem; font: inherit; font-size: 0.82rem;' +
    '  border-radius: var(--radius-sm); cursor: pointer; border: 1px solid var(--accent); color: var(--accent);' +
    '  background: var(--paper-raised); }' +
    '.consult-btn:hover, .consult-btn:focus-visible { background: var(--accent-wash); }' +
    '.consult-stopped { font-size: 0.8rem; color: var(--ink-faint); }' +
    '.consult-disclaimer { margin-top: 0.9rem; font-size: 0.76rem; color: var(--ink-faint); }' +
    '@media print { .consult-panel { display: none !important; } }';
  document.head.appendChild(style);

  var QUALIFICATION_LABEL = {
    sharoushi: '社会保険労務士', shindanshi: '中小企業診断士',
    gyoseishoshi: '行政書士', zeirishi: '税理士'
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildTemplateText(opts) {
    var lines = ['はじめまして。「補助金活用 業務改善ロードマップ」を見てご連絡しました。'];
    if (opts.programName) {
      lines.push('検討中の制度：' + opts.programName);
      if (opts.programKey) {
        lines.push(location.origin + location.pathname.replace(/[^/]*$/, '') +
          'program.html?key=' + encodeURIComponent(opts.programKey));
      }
    }
    lines.push('相談したいこと：' + (opts.topic || '（ここにご記入ください）'));
    return lines.join('\n');
  }

  function cardMatches(expert, kind) {
    if (!kind || kind === 'other') return true;
    return (expert.kinds || []).indexOf(kind) !== -1;
  }

  function renderCard(expert, templateText) {
    var wrap = document.createElement('div');
    wrap.className = 'consult-card';

    var title = document.createElement('div');
    title.className = 'consult-card-title';
    title.textContent = (QUALIFICATION_LABEL[expert.qualification] || expert.title || '専門家') +
      (expert.name ? '　' + expert.name : '');
    wrap.appendChild(title);

    var tags = [];
    if (expert.areas && expert.areas.length) tags.push(expert.areas.join('・'));
    if (expert.tags && expert.tags.length) tags.push(expert.tags.join(' / '));
    if (tags.length) {
      var tagsEl = document.createElement('div');
      tagsEl.className = 'consult-card-tags';
      tagsEl.textContent = tags.join('　');
      wrap.appendChild(tagsEl);
    }

    if (expert.note) {
      var noteEl = document.createElement('div');
      noteEl.className = 'consult-card-note';
      noteEl.textContent = expert.note;
      wrap.appendChild(noteEl);
    }

    if (expert.accepting === false) {
      var stopped = document.createElement('div');
      stopped.className = 'consult-stopped';
      stopped.textContent = '現在、新規のご相談受付を停止しています。';
      wrap.appendChild(stopped);
      return wrap;
    }

    var actions = document.createElement('div');
    actions.className = 'consult-card-actions';

    if (expert.line_oa_id) {
      var lineBtn = document.createElement('a');
      lineBtn.className = 'consult-btn';
      lineBtn.target = '_blank';
      lineBtn.rel = 'noopener noreferrer';
      lineBtn.href = 'https://line.me/R/oaMessage/' + encodeURIComponent(expert.line_oa_id) +
        '/?' + encodeURIComponent(templateText);
      lineBtn.textContent = 'LINEで相談する';
      actions.appendChild(lineBtn);
    }
    if (expert.email) {
      var mailBtn = document.createElement('a');
      mailBtn.className = 'consult-btn';
      mailBtn.href = 'mailto:' + encodeURIComponent(expert.email) +
        '?subject=' + encodeURIComponent('補助金活用ロードマップを見てのご相談') +
        '&body=' + encodeURIComponent(templateText);
      mailBtn.textContent = 'メールで相談する';
      actions.appendChild(mailBtn);
    }
    wrap.appendChild(actions);
    return wrap;
  }

  function mount(container, opts) {
    opts = opts || {};
    var data = window.KOBAN_EXPERTS || { status: 'preparing', experts: [], demo: [] };
    var useDemo = /(^|[?&])expertdemo=1(&|$)/.test(location.search);
    var pool = (data.experts && data.experts.length) ? data.experts : (useDemo ? (data.demo || []) : []);

    var panel = document.createElement('div');
    panel.className = 'consult-panel';
    panel.id = 'consultPanel';

    var lead = document.createElement('p');
    lead.className = 'consult-lead';
    lead.textContent = '提携専門家（社会保険労務士・中小企業診断士等）に、この内容で直接ご相談いただけます。';
    panel.appendChild(lead);

    var privacy = document.createElement('p');
    privacy.className = 'consult-privacy';
    privacy.textContent = 'ボタンはLINE・メールのアプリを開くだけです。このサイトから相談内容が送信されることはありません。';
    panel.appendChild(privacy);

    var templateText = buildTemplateText(opts);

    var tmplWrap = document.createElement('div');
    tmplWrap.className = 'consult-tmpl-wrap';
    var tmplLabel = document.createElement('div');
    tmplLabel.className = 'consult-tmpl-label';
    tmplLabel.textContent = '相談メッセージのひな形';
    tmplWrap.appendChild(tmplLabel);
    var tmplBox = document.createElement('textarea');
    tmplBox.className = 'consult-tmpl';
    tmplBox.readOnly = true;
    tmplBox.value = templateText;
    tmplWrap.appendChild(tmplBox);
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'consult-copy-btn';
    copyBtn.textContent = 'ひな形をコピー';
    copyBtn.addEventListener('click', function () {
      var text = tmplBox.value;
      var done = function () {
        var orig = copyBtn.textContent;
        copyBtn.textContent = '✔ コピーしました';
        setTimeout(function () { copyBtn.textContent = orig; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(function () {
          tmplBox.select();
          alert('コピーに失敗しました。テキストを選択済みにしましたので、手動でコピーしてください。');
        });
      } else {
        tmplBox.select();
        alert('お使いの環境では自動コピーができません。テキストを選択済みにしましたので、手動でコピーしてください。');
      }
    });
    tmplWrap.appendChild(copyBtn);
    panel.appendChild(tmplWrap);

    if (!pool.length) {
      var preparing = document.createElement('div');
      preparing.className = 'consult-preparing';
      preparing.textContent = '提携専門家は現在準備中です。上のひな形をコピーして、顧問の専門家や知り合いの窓口にご相談ください。';
      panel.appendChild(preparing);
    } else {
      var matched = pool.filter(function (e) { return cardMatches(e, opts.kind); });
      var toShow = matched.length ? matched : pool;
      var cards = document.createElement('div');
      cards.className = 'consult-cards';
      toShow.forEach(function (expert) {
        cards.appendChild(renderCard(expert, templateText));
      });
      panel.appendChild(cards);
    }

    var disclaimer = document.createElement('p');
    disclaimer.className = 'consult-disclaimer';
    disclaimer.textContent = '相談の受付可否・費用は各専門家に直接ご確認ください。書類の作成・提出の代行は行いません。';
    panel.appendChild(disclaimer);

    container.innerHTML = '';
    container.appendChild(panel);
    container.style.display = '';
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  window.KOBAN_CONSULT = { mount: mount };
})();

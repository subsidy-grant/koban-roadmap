// 「専門家に相談する」機能。app_tabbar.js と同じく、マークアップ・CSSともこのJSが注入する
// 自己完結モジュール。使う側は experts_data.js を読み込んでから、
//   window.KOBAN_CONSULT.mount(containerEl, { programKey, programName, kind, topic })
// を呼ぶだけでよい。
//
// kind は 'hojo'（補助金）/ 'josei'（助成金）/ 'other' のいずれか。program.html は
// 既存の pillClass() の戻り値をそのまま渡すこと（判定ロジックをここで複製しない）。
// programKey/programName が無い（criteria.html からの起動など）場合は topic 文字列を使う。
//
// パネルは2段階。まず3問のアンケート（何を相談したいか・いまの段階・希望の連絡手段）を出し、
// 回答すると (1)ひな形文の具体化 (2)専門家の絞り込み (3)相談前に用意するものの案内
// の3つに反映した結果画面に切り替わる。アンケートは飛ばすこともできる。
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
    /* ---- アンケート（1問ずつ順に出す） ---- */
    '.consult-step { font-size: 0.76rem; color: var(--ink-faint); letter-spacing: 0.04em;' +
    '  margin-bottom: 0.5rem; }' +
    '.consult-q { margin-bottom: 1.2rem; }' +
    '.consult-q-ttl { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; }' +
    '.consult-q-note { font-size: 0.76rem; color: var(--ink-faint); font-weight: 400; }' +
    '.consult-opts { display: grid; gap: 0.45rem; }' +
    '.consult-opt { display: flex; align-items: center; gap: 0.6rem; cursor: pointer;' +
    '  min-height: 2.75rem; padding: 0.4rem 0.7rem; border: 1px solid var(--line);' +
    '  border-radius: var(--radius-sm); background: var(--paper); font-size: 0.85rem; }' +
    '.consult-opt:hover { border-color: var(--accent); background: var(--accent-wash); }' +
    '.consult-opt input { width: 1.15rem; height: 1.15rem; flex: none; accent-color: var(--accent); }' +
    '.consult-opt.is-checked { border-color: var(--accent); background: var(--accent-wash); }' +
    /* 回答済みの問いは、答えだけを小さく畳んで上に残す（何を答えたか見失わないため） */
    '.consult-answered { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem;' +
    '  padding: 0.5rem 0.7rem; margin-bottom: 0.5rem; border-radius: var(--radius-sm);' +
    '  background: var(--paper); border: 1px solid var(--line); font-size: 0.8rem; }' +
    '.consult-answered-q { color: var(--ink-faint); }' +
    '.consult-answered-a { font-weight: 700; color: var(--ink); }' +
    '.consult-answered-edit { appearance: none; background: none; border: none; font: inherit;' +
    '  font-size: 0.78rem; color: var(--accent); text-decoration: underline; cursor: pointer;' +
    '  margin-left: auto; min-height: 2.75rem; padding: 0 0.3rem; }' +
    '.consult-submit { appearance: none; font: inherit; font-size: 0.88rem; cursor: pointer;' +
    '  min-height: 2.75rem; padding: 0 1.3rem; border-radius: var(--radius-sm); border: none;' +
    '  background: var(--accent); color: var(--on-accent, #fff); box-shadow: var(--shadow-btn); }' +
    '.consult-submit:hover, .consult-submit:focus-visible { opacity: 0.88; }' +
    '.consult-submit:disabled { opacity: 0.45; cursor: not-allowed; }' +
    '.consult-skip { appearance: none; background: none; border: none; font: inherit;' +
    '  font-size: 0.8rem; color: var(--ink-faint); text-decoration: underline; cursor: pointer;' +
    '  min-height: 2.75rem; padding: 0 0.5rem; }' +
    '.consult-actions-row { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem; }' +
    /* ---- 結果画面 ---- */
    '.consult-back { appearance: none; background: none; border: none; font: inherit;' +
    '  font-size: 0.82rem; color: var(--accent); cursor: pointer; min-height: 2.75rem;' +
    '  padding: 0 0.2rem; text-decoration: underline; margin-top: 0.6rem; }' +
    '.consult-prepare { background: var(--sage-wash); border-radius: var(--radius-sm);' +
    '  padding: 0.85rem 0.95rem; margin: 1.2rem 0; }' +
    '.consult-prepare-ttl { font-size: 0.82rem; font-weight: 700; color: var(--sage-ink, var(--ink));' +
    '  margin-bottom: 0.35rem; }' +
    '.consult-prepare ul { margin: 0; padding-left: 1.2rem; font-size: 0.82rem; color: var(--ink-soft); }' +
    '.consult-prepare li { margin-bottom: 0.15rem; }' +
    '.consult-tmpl-wrap { margin-bottom: 1rem; }' +
    '.consult-tmpl-label { font-size: 0.78rem; font-weight: 700; color: var(--ink-faint);' +
    '  letter-spacing: 0.02em; margin-bottom: 0.3rem; }' +
    '.consult-profile-note { display: flex; flex-wrap: wrap; align-items: center; gap: 0.3rem 0.7rem;' +
    '  font-size: 0.78rem; color: var(--ink-soft); background: var(--sage-wash);' +
    '  border-radius: var(--radius-sm); padding: 0.5rem 0.7rem; margin-bottom: 0.45rem; }' +
    '.consult-profile-note.is-empty { background: var(--accent-wash); }' +
    '.consult-profile-note a { color: var(--accent); }' +
    /* メッセージ本文は既定では折り返し表示の「読み物」。全文が一目で見えるよう
       高さを制限せず、編集ボタンを押したときだけ textarea に切り替える。 */
    '.consult-tmpl-view { white-space: pre-wrap; word-break: break-word;' +
    '  font-size: 0.82rem; line-height: 1.7; color: var(--ink);' +
    '  background: var(--paper); border: 1px solid var(--line); border-radius: var(--radius-sm);' +
    '  padding: 0.7rem 0.8rem; }' +
    '.consult-tmpl { width: 100%; box-sizing: border-box; resize: vertical;' +
    '  font: inherit; font-size: 0.82rem; line-height: 1.7; color: var(--ink);' +
    '  background: var(--paper-raised); border: 1px solid var(--accent); border-radius: var(--radius-sm);' +
    '  padding: 0.7rem 0.8rem; }' +
    '.consult-tmpl-btns { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem; }' +
    '.consult-edit-hint { font-size: 0.78rem; color: var(--ink-faint); margin: 0.5rem 0 0; }' +
    '.consult-copy-btn { appearance: none; font: inherit; font-size: 0.82rem;' +
    '  cursor: pointer; min-height: 2.75rem; padding: 0 1rem; border-radius: var(--radius-sm);' +
    '  border: 1px solid var(--accent); color: var(--accent); background: var(--paper-raised); }' +
    '.consult-copy-btn:hover, .consult-copy-btn:focus-visible { background: var(--accent-wash); }' +
    /* ---- 送信（宛先を選ぶ→確認する→送る） ---- */
    '.consult-send { margin-top: 1.1rem; border-top: 1px solid var(--line); padding-top: 1rem; }' +
    '.consult-send-ttl { font-size: 0.88rem; font-weight: 700; margin-bottom: 0.2rem; }' +
    '.consult-send-sub { font-size: 0.78rem; color: var(--ink-faint); margin: 0 0 0.7rem; }' +
    '.consult-send-btns { display: flex; flex-wrap: wrap; gap: 0.5rem; }' +
    '.consult-send-btn { appearance: none; font: inherit; font-size: 0.9rem; font-weight: 700;' +
    '  cursor: pointer; min-height: 3rem; padding: 0 1.4rem; border-radius: var(--radius-sm);' +
    '  border: none; background: var(--accent); color: var(--on-accent, #fff);' +
    '  box-shadow: var(--shadow-btn); }' +
    '.consult-send-btn:hover, .consult-send-btn:focus-visible { opacity: 0.88; }' +
    /* 送信機能ができるまでは、押せるが「まだ本物ではない」と分かる見た目にする。
       塗りつぶしのままだと本当に送れると誤解されるため、破線の枠で仮であることを示す。 */
    '.consult-send-btn.is-dummy { background: var(--paper-raised); color: var(--accent);' +
    '  border: 2px dashed var(--accent); box-shadow: none; }' +
    '.consult-send-btn.is-dummy:hover, .consult-send-btn.is-dummy:focus-visible {' +
    '  background: var(--accent-wash); opacity: 1; }' +
    '.consult-pick { margin-top: 0.8rem; border: 1px solid var(--accent); border-radius: var(--radius-sm);' +
    '  background: var(--accent-wash); padding: 0.85rem 0.9rem; }' +
    '.consult-pick-ttl { font-size: 0.85rem; font-weight: 700; margin-bottom: 0.55rem; }' +
    '.consult-pick-list { display: grid; gap: 0.45rem; }' +
    '.consult-pick-item { display: flex; align-items: center; gap: 0.6rem; cursor: pointer;' +
    '  min-height: 2.75rem; padding: 0.45rem 0.7rem; border: 1px solid var(--line);' +
    '  border-radius: var(--radius-sm); background: var(--paper-raised); font-size: 0.85rem; }' +
    '.consult-pick-item:hover { border-color: var(--accent); }' +
    '.consult-pick-item input { width: 1.15rem; height: 1.15rem; flex: none; accent-color: var(--accent); }' +
    '.consult-pick-item.is-checked { border-color: var(--accent); background: var(--accent-wash); }' +
    '.consult-pick-none { font-size: 0.82rem; color: var(--ink-soft); }' +
    '.consult-confirm { margin-top: 0.8rem; border: 1px solid var(--accent); border-radius: var(--radius-sm);' +
    '  background: var(--paper-raised); padding: 0.9rem; box-shadow: var(--shadow-btn); }' +
    '.consult-confirm-ttl { font-size: 0.92rem; font-weight: 700; margin-bottom: 0.4rem; }' +
    '.consult-confirm-to { font-size: 0.85rem; background: var(--accent-wash);' +
    '  border-radius: var(--radius-sm); padding: 0.55rem 0.7rem; margin-bottom: 0.7rem; }' +
    '.consult-sent { margin-top: 0.8rem; background: var(--sage-wash); border-radius: var(--radius-sm);' +
    '  padding: 0.9rem; font-size: 0.85rem; }' +
    '.consult-sent-ttl { font-weight: 700; margin-bottom: 0.3rem; }' +
    '.consult-dummy { display: inline-block; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;' +
    '  color: var(--rust); background: var(--rust-wash); border-radius: 100px;' +
    '  padding: 0.1rem 0.55rem; margin-left: 0.4rem; vertical-align: middle; }' +
    '.consult-preparing { background: var(--accent-wash); border-radius: var(--radius-sm);' +
    '  padding: 0.8rem 0.9rem; font-size: 0.85rem; color: var(--ink-soft);' +
    '  margin: 1rem 0; }' +
    '.consult-cards { display: grid; gap: 0.7rem; margin: 1rem 0; }' +
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
    '.consult-tel-hours { font-size: 0.76rem; color: var(--ink-faint); margin-top: 0.35rem; }' +
    '.consult-stopped { font-size: 0.8rem; color: var(--ink-faint); }' +
    '.consult-disclaimer { margin-top: 0.9rem; font-size: 0.76rem; color: var(--ink-faint); }' +
    '@media print { .consult-panel { display: none !important; } }';
  document.head.appendChild(style);

  var QUALIFICATION_LABEL = {
    sharoushi: '社会保険労務士', shindanshi: '中小企業診断士',
    gyoseishoshi: '行政書士', zeirishi: '税理士'
  };

  var CONTACT_LABEL = { line: 'LINE', email: 'メール', tel: '電話' };
  var CONTACT_OPTIONS = [
    { id: 'line', label: 'LINE' },
    { id: 'email', label: 'メール' },
    { id: 'tel', label: '電話' }
  ];

  // アンケートの選択肢。experts_data.js 側で上書きできるようにしておき、
  // 読み込まれていない場合でもパネルが壊れないよう既定値を持つ。
  function getTopics() {
    return window.KOBAN_CONSULT_TOPICS || [
      { id: 'other', label: 'その他・まだ整理できていない', qualifications: [], prepare: [] }
    ];
  }
  function getStages() {
    return window.KOBAN_CONSULT_STAGES || [];
  }

  function findTopic(id) {
    var list = getTopics();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }
  function findStage(id) {
    var list = getStages();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }

  // 会社情報（profile.html で登録したもの）を読む。company_data.js を読み込んでいない
  // ページや、未登録の端末では null を返す。localStorage の中身をそのまま使うだけで、
  // このサイトから外部へ送ることはない（送るのは利用者自身がボタンを押したときの
  // LINE/メールアプリ経由のみ）。
  //
  // KOBAN_COMPANY.getCurrent() は未登録端末に空の「会社1」を書き込む副作用がある
  // （旧形式からの移行処理を兼ねているため）。相談パネルを開いただけで書き込みたく
  // ないので、ここでは localStorage を直接読むだけにする。キー名は company_data.js
  // と揃えること（あちらを変えたらここも変える）。
  function getCompany() {
    try {
      var raw = localStorage.getItem('koban_companies');
      if (!raw) return null;
      var list = JSON.parse(raw);
      if (!list || !list.length) return null;
      var id = null;
      try { id = JSON.parse(localStorage.getItem('koban_currentCompanyId')); } catch (e) { id = null; }
      var found = null;
      if (id) {
        found = list.filter(function (c) { return c && c.id === id; })[0] || null;
      }
      return found || list[0] || null;
    } catch (e) { return null; }
  }

  function val(company, key) {
    if (!company) return '';
    var v = company[key];
    return (v == null) ? '' : String(v).trim();
  }

  // 会社情報のうち、相談の初回連絡で相手に伝わっていると話が早い項目だけを組み立てる。
  // 1つも埋まっていなければ null を返し、呼び出し側で「登録すると自動で入ります」の
  // 案内に切り替える。
  function buildCompanyBlock(company) {
    if (!company) return null;
    var name = val(company, 'name');
    var person = val(company, 'staff') || val(company, 'rep');
    var tel = val(company, 'staffTel') || val(company, 'tel');
    var mail = val(company, 'mail');
    var addr = val(company, 'addr');
    var industry = val(company, 'industry');
    var employees = val(company, 'employees');

    var contactLines = [];
    if (name) contactLines.push('事業者名：' + name);
    if (person) contactLines.push('ご担当：' + person);
    if (tel) contactLines.push('電話：' + tel);
    if (mail) contactLines.push('メール：' + mail);

    var bizLines = [];
    if (addr) bizLines.push('所在地：' + addr);
    if (industry) bizLines.push('業種：' + industry);
    // 会社情報の従業員数は数字だけで保存されていることがある（入力欄が numeric のため）。
    // 数字だけなら「人」を付けて読める文にする。
    if (employees) {
      bizLines.push('従業員数：' + (/^\d+$/.test(employees) ? employees + '人' : employees));
    }

    if (!contactLines.length && !bizLines.length) return null;
    return { contact: contactLines, biz: bizLines };
  }

  // answers.topics / answers.contacts は配列、answers.stage は単一の文字列。
  //
  // 本文の構成（本人指示 2026-08-17）：
  //   挨拶 → 【検討中の制度】→ アンケート回答（【】見出し付き）→ 【事業の概要】
  //   → 【ご連絡先】（最後）
  // アンケートのどの問いへの答えかが読んで分かるよう、見出しは【】で揃え、
  // ブロックごとに空行を入れる。
  function buildTemplateText(opts, answers) {
    answers = answers || {};
    var topicIds = answers.topics || [];
    var lines = ['はじめまして。「補助金活用 業務改善ロードマップ」を見てご連絡しました。'];

    if (opts.programName) {
      lines.push('');
      lines.push('【検討中の制度】');
      lines.push(opts.programName);
      if (opts.programKey) {
        lines.push(location.origin + location.pathname.replace(/[^/]*$/, '') +
          'program.html?key=' + encodeURIComponent(opts.programKey));
      }
    }

    var labels = topicIds.map(function (id) {
      var t = findTopic(id);
      return t ? t.label : '';
    }).filter(function (s) { return s && s.indexOf('その他') !== 0; });
    lines.push('');
    lines.push('【相談したいこと】');
    if (labels.length) {
      labels.forEach(function (l) { lines.push('・' + l); });
    } else {
      lines.push(opts.topic || '（ここにご記入ください）');
    }

    var stage = answers.stage ? findStage(answers.stage) : null;
    if (stage) {
      lines.push('');
      lines.push('【いまの状況】');
      lines.push(stage.label);
    }

    var contacts = answers.contacts || [];
    if (contacts.length) {
      lines.push('');
      lines.push('【希望の連絡方法】');
      lines.push(contacts.map(function (c) { return CONTACT_LABEL[c] || c; }).join('・'));
    }

    // 会社情報が登録されていれば事業の概要と連絡先を添える。
    // 未登録なら連絡先の書式だけ残し、利用者が手で埋められるようにする。
    // 連絡先は本文のいちばん最後（本人指示 2026-08-17）。
    var block = buildCompanyBlock(getCompany());
    if (block && block.biz.length) {
      lines.push('');
      lines.push('【事業の概要】');
      block.biz.forEach(function (l) { lines.push(l); });
    }
    lines.push('');
    lines.push('【ご連絡先】');
    if (block && block.contact.length) {
      block.contact.forEach(function (l) { lines.push(l); });
    } else {
      lines.push('事業者名：');
      lines.push('ご担当：');
      lines.push('電話：');
      lines.push('メール：');
    }
    // 自由記入の案内は本文に混ぜず、画面側（枠の外）に出す。
    // そのまま送られると相手に「（ご記入ください）」が届いてしまうため
    // （本人指示 2026-08-17）。
    return lines.join('\n');
  }

  // 相談テーマと制度種別の両方で専門家を絞る。
  // topicIds は複数選択。1つでも対応できるテーマがあれば表示する（OR判定）。
  // topics を持つ専門家はその配列で判定し、持たない専門家は資格で判定する。
  function cardMatches(expert, kind, topicIds) {
    if (kind && kind !== 'other') {
      if ((expert.kinds || []).indexOf(kind) === -1) return false;
    }
    var ids = (topicIds || []).filter(function (id) { return id && id !== 'other'; });
    if (!ids.length) return true;
    return ids.some(function (topicId) {
      if (expert.topics && expert.topics.length) {
        return expert.topics.indexOf(topicId) !== -1;
      }
      var topic = findTopic(topicId);
      if (!topic || !topic.qualifications || !topic.qualifications.length) return true;
      return topic.qualifications.indexOf(expert.qualification) !== -1;
    });
  }

  function renderCard(expert, templateText, preferContacts) {
    var wrap = document.createElement('div');
    wrap.className = 'consult-card';

    var title = document.createElement('div');
    title.className = 'consult-card-title';
    title.textContent = expertLabel(expert);
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

    // templateText は関数でも文字列でも受ける。本文が編集されうるので、
    // クリック直前に読み直せるよう関数で渡すのが基本。
    function currentText() {
      return (typeof templateText === 'function') ? templateText() : templateText;
    }
    function makeLineBtn() {
      if (!expert.line_oa_id) return null;
      var b = document.createElement('a');
      b.className = 'consult-btn';
      b.target = '_blank';
      b.rel = 'noopener noreferrer';
      b.href = '#';
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        window.open('https://line.me/R/oaMessage/' + encodeURIComponent(expert.line_oa_id) +
          '/?' + encodeURIComponent(currentText()), '_blank', 'noopener');
      });
      b.textContent = 'LINEで相談する';
      return b;
    }
    function makeMailBtn() {
      if (!expert.email) return null;
      var b = document.createElement('a');
      b.className = 'consult-btn';
      b.href = '#';
      b.addEventListener('click', function (ev) {
        ev.preventDefault();
        location.href = 'mailto:' + encodeURIComponent(expert.email) +
          '?subject=' + encodeURIComponent('補助金活用ロードマップを見てのご相談') +
          '&body=' + encodeURIComponent(currentText());
      });
      b.textContent = 'メールで相談する';
      return b;
    }
    function makeTelBtn() {
      if (!expert.tel) return null;
      var b = document.createElement('a');
      b.className = 'consult-btn';
      // 電話番号のハイフン等はダイヤル時に無視されるが、href では取り除いておく
      b.href = 'tel:' + String(expert.tel).replace(/[^0-9+]/g, '');
      b.textContent = '電話する（' + expert.tel + '）';
      return b;
    }

    // 希望した連絡手段を先に並べる（希望しなかった手段も消さずに後ろに残す）
    var makers = { line: makeLineBtn, email: makeMailBtn, tel: makeTelBtn };
    var order = [];
    (preferContacts || []).forEach(function (c) {
      if (makers[c] && order.indexOf(c) === -1) order.push(c);
    });
    ['line', 'email', 'tel'].forEach(function (c) {
      if (order.indexOf(c) === -1) order.push(c);
    });
    order.forEach(function (c) {
      var b = makers[c]();
      if (b) actions.appendChild(b);
    });
    wrap.appendChild(actions);

    if (expert.tel && expert.tel_hours) {
      var hours = document.createElement('div');
      hours.className = 'consult-tel-hours';
      hours.textContent = '電話受付：' + expert.tel_hours;
      wrap.appendChild(hours);
    }
    return wrap;
  }

  // getText は本文を返す関数。編集されうるので、押した時点の中身を読む。
  function buildCopyButton(getText) {
    var copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'consult-copy-btn';
    copyBtn.textContent = '本文をコピー';
    copyBtn.addEventListener('click', function () {
      var text = getText();
      var done = function () {
        var orig = copyBtn.textContent;
        copyBtn.textContent = '✔ コピーしました';
        setTimeout(function () { copyBtn.textContent = orig; }, 1500);
      };
      var fallback = function () {
        // クリップボードが使えない環境向けに、選択してコピーできる形で見せる
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        document.body.appendChild(ta);
        ta.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        document.body.removeChild(ta);
        if (ok) { done(); }
        else { alert('コピーできませんでした。本文を長押し（または範囲選択）してコピーしてください。'); }
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
    });
    return copyBtn;
  }

  // ---------- アンケート画面（1問ずつ順に出す） ----------
  // 質問の定義。multi:true は複数選択（チェックボックス）、false は単一選択（ラジオ）。
  function getQuestions() {
    var qs = [{
      key: 'topics', multi: true, required: true,
      title: '何について相談したいですか？',
      note: '（あてはまるものをすべて選べます）',
      options: getTopics()
    }];
    var stages = getStages();
    if (stages.length) {
      qs.push({
        key: 'stage', multi: false, required: false,
        title: 'いまどの段階ですか？', note: '（任意）', options: stages
      });
    }
    qs.push({
      key: 'contacts', multi: true, required: false,
      title: '連絡はどの方法がよいですか？',
      note: '（複数選べます・任意）',
      options: CONTACT_OPTIONS
    });
    return qs;
  }

  function labelsOf(question, value) {
    var ids = question.multi ? (value || []) : (value ? [value] : []);
    return ids.map(function (id) {
      for (var i = 0; i < question.options.length; i++) {
        if (question.options[i].id === id) return question.options[i].label;
      }
      return id;
    });
  }

  // answers は { topics: [], stage: '', contacts: [] }。
  // step は「いま何問目を表示しているか」。0始まり。
  function renderSurvey(panel, opts, state, onDone, onStateChange) {
    var questions = getQuestions();
    var answers = state.answers;
    var step = Math.min(state.step, questions.length - 1);

    var lead = document.createElement('p');
    lead.className = 'consult-lead';
    lead.textContent = 'どんなことを相談したいか教えてください。合う専門家と、相談メッセージのひな形をご用意します。';
    panel.appendChild(lead);

    // 回答済みの問いは、答えだけを畳んで上に残す（あとから押して直せる）
    questions.slice(0, step).forEach(function (q, i) {
      var row = document.createElement('div');
      row.className = 'consult-answered';
      var qLabel = document.createElement('span');
      qLabel.className = 'consult-answered-q';
      qLabel.textContent = 'Q' + (i + 1);
      row.appendChild(qLabel);
      var aLabel = document.createElement('span');
      aLabel.className = 'consult-answered-a';
      var labels = labelsOf(q, answers[q.key]);
      aLabel.textContent = labels.length ? labels.join('・') : '（選択なし）';
      row.appendChild(aLabel);
      var edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'consult-answered-edit';
      edit.textContent = '変更';
      edit.addEventListener('click', function () { onStateChange({ step: i, answers: answers }); });
      row.appendChild(edit);
      panel.appendChild(row);
    });

    var current = questions[step];

    var stepInfo = document.createElement('div');
    stepInfo.className = 'consult-step';
    stepInfo.textContent = '質問 ' + (step + 1) + ' / ' + questions.length;
    panel.appendChild(stepInfo);

    var q = document.createElement('div');
    q.className = 'consult-q';
    var ttl = document.createElement('div');
    ttl.className = 'consult-q-ttl';
    ttl.textContent = current.title;
    if (current.note) {
      var note = document.createElement('span');
      note.className = 'consult-q-note';
      note.textContent = '　' + current.note;
      ttl.appendChild(note);
    }
    q.appendChild(ttl);

    var nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.className = 'consult-submit';
    var isLast = step === questions.length - 1;
    nextBtn.textContent = isLast ? '相談先を見る' : '次へ';

    function currentSelection() {
      return current.multi ? (answers[current.key] || []) : (answers[current.key] || '');
    }
    function refreshNextState() {
      if (!current.required) { nextBtn.disabled = false; return; }
      var v = currentSelection();
      nextBtn.disabled = current.multi ? !v.length : !v;
    }

    var wrap = document.createElement('div');
    wrap.className = 'consult-opts';
    current.options.forEach(function (o) {
      var label = document.createElement('label');
      label.className = 'consult-opt';
      var input = document.createElement('input');
      input.type = current.multi ? 'checkbox' : 'radio';
      input.name = 'consult_' + current.key;
      input.value = o.id;
      // 前の回答に戻ってきたときは選択状態を復元する
      if (current.multi) {
        if ((answers[current.key] || []).indexOf(o.id) !== -1) {
          input.checked = true;
          label.classList.add('is-checked');
        }
      } else if (answers[current.key] === o.id) {
        input.checked = true;
        label.classList.add('is-checked');
      }
      input.addEventListener('change', function () {
        if (current.multi) {
          var list = (answers[current.key] || []).slice();
          var idx = list.indexOf(o.id);
          if (input.checked && idx === -1) list.push(o.id);
          if (!input.checked && idx !== -1) list.splice(idx, 1);
          answers[current.key] = list;
          label.classList.toggle('is-checked', input.checked);
        } else {
          Array.prototype.forEach.call(wrap.querySelectorAll('.consult-opt'), function (el) {
            el.classList.remove('is-checked');
          });
          label.classList.add('is-checked');
          answers[current.key] = o.id;
        }
        refreshNextState();
      });
      label.appendChild(input);
      var span = document.createElement('span');
      span.textContent = o.label;
      label.appendChild(span);
      wrap.appendChild(label);
    });
    q.appendChild(wrap);
    panel.appendChild(q);

    var row2 = document.createElement('div');
    row2.className = 'consult-actions-row';
    nextBtn.addEventListener('click', function () {
      if (isLast) { onDone(answers); return; }
      onStateChange({ step: step + 1, answers: answers });
    });
    row2.appendChild(nextBtn);

    // 任意の問いは飛ばせる。必須のQ1でも、アンケート自体を飛ばす道は残す。
    var skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'consult-skip';
    skipBtn.textContent = current.required ? 'アンケートを飛ばす' : (isLast ? '答えずに相談先を見る' : 'この質問を飛ばす');
    skipBtn.addEventListener('click', function () {
      if (current.required) {
        onDone({ topics: [], stage: '', contacts: [] });
        return;
      }
      if (isLast) { onDone(answers); return; }
      onStateChange({ step: step + 1, answers: answers });
    });
    row2.appendChild(skipBtn);

    panel.appendChild(row2);
    refreshNextState();
  }

  // ---------- 送信セクション（LINEで送信 / メールで送信） ----------
  // 送信そのものはまだ作っていない（送信基盤は未導入）。押すと送信先を選び、
  // 確認したうえで「送信しました」までを見せるダミー。実装時はここの
  // doSend() を差し替えるだけでよいようにしてある。
  function buildSendSection(experts, getMessage) {
    var wrap = document.createElement('div');
    wrap.className = 'consult-send';

    var ttl = document.createElement('div');
    ttl.className = 'consult-send-ttl';
    ttl.textContent = 'この内容を送る';
    var dummy = document.createElement('span');
    dummy.className = 'consult-dummy';
    dummy.textContent = '準備中';
    ttl.appendChild(dummy);
    wrap.appendChild(ttl);

    var sub = document.createElement('p');
    sub.className = 'consult-send-sub';
    sub.textContent = '送信機能は現在準備中です。押すと動きだけ確認できます（実際には送信されません）。';
    wrap.appendChild(sub);

    var btns = document.createElement('div');
    btns.className = 'consult-send-btns';
    wrap.appendChild(btns);

    // 選択・確認・完了を出し入れする場所
    var stage = document.createElement('div');
    wrap.appendChild(stage);

    function clearStage() { stage.innerHTML = ''; }

    // 送信先が実際にその手段を持っているかで絞る
    function candidates(via) {
      return (experts || []).filter(function (e) {
        if (e.accepting === false) return false;
        return via === 'line' ? !!e.line_oa_id : !!e.email;
      });
    }

    function doSend(via, expert) {
      clearStage();
      var done = document.createElement('div');
      done.className = 'consult-sent';
      var dttl = document.createElement('div');
      dttl.className = 'consult-sent-ttl';
      dttl.textContent = '送信しました（画面上の動作確認のみ）';
      done.appendChild(dttl);
      var dmsg = document.createElement('div');
      dmsg.textContent = '送信先：' + expertLabel(expert) + '（' + CONTACT_LABEL[via] + '）' +
        ' ／ 実際にはまだ送信されません。送信機能が使えるようになるまでは、' +
        '下の一覧にある「' + (via === 'line' ? 'LINEで相談する' : 'メールで相談する') +
        '」からアプリを開いてお送りください。';
      done.appendChild(dmsg);
      var again = document.createElement('button');
      again.type = 'button';
      again.className = 'consult-copy-btn';
      again.style.marginTop = '0.6rem';
      again.textContent = '送信先を選び直す';
      again.addEventListener('click', function () { pick(via); });
      done.appendChild(again);
      stage.appendChild(done);
      done.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function confirm(via, expert) {
      clearStage();
      var box = document.createElement('div');
      box.className = 'consult-confirm';
      var cttl = document.createElement('div');
      cttl.className = 'consult-confirm-ttl';
      cttl.textContent = 'こちらに送りますか？';
      box.appendChild(cttl);

      var to = document.createElement('div');
      to.className = 'consult-confirm-to';
      to.textContent = expertLabel(expert) + '　（' + CONTACT_LABEL[via] + 'で送信）';
      box.appendChild(to);

      var row = document.createElement('div');
      row.className = 'consult-send-btns';
      var ok = document.createElement('button');
      ok.type = 'button';
      ok.className = 'consult-send-btn is-dummy';
      ok.textContent = 'この宛先に送る';
      ok.addEventListener('click', function () { doSend(via, expert); });
      row.appendChild(ok);

      var cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'consult-copy-btn';
      cancel.textContent = 'やめる';
      cancel.addEventListener('click', function () { pick(via); });
      row.appendChild(cancel);
      box.appendChild(row);

      stage.appendChild(box);
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function pick(via) {
      clearStage();
      var list = candidates(via);
      var box = document.createElement('div');
      box.className = 'consult-pick';
      var pttl = document.createElement('div');
      pttl.className = 'consult-pick-ttl';
      pttl.textContent = 'どちらに送りますか？（' + CONTACT_LABEL[via] + '）';
      box.appendChild(pttl);

      if (!list.length) {
        var none = document.createElement('div');
        none.className = 'consult-pick-none';
        none.textContent = CONTACT_LABEL[via] + 'で受け付けている専門家がまだ登録されていません。' +
          '提携が決まりしだいご利用いただけます。';
        box.appendChild(none);
        stage.appendChild(box);
        return;
      }

      var listEl = document.createElement('div');
      listEl.className = 'consult-pick-list';
      var chosen = null;
      var nextBtn = document.createElement('button');
      nextBtn.type = 'button';
      nextBtn.className = 'consult-send-btn';
      nextBtn.textContent = '確認する';
      nextBtn.disabled = true;

      list.forEach(function (expert, i) {
        var label = document.createElement('label');
        label.className = 'consult-pick-item';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = 'consultSendTo_' + via;
        input.value = expert.id || String(i);
        input.addEventListener('change', function () {
          Array.prototype.forEach.call(listEl.querySelectorAll('.consult-pick-item'), function (el) {
            el.classList.remove('is-checked');
          });
          label.classList.add('is-checked');
          chosen = expert;
          nextBtn.disabled = false;
        });
        label.appendChild(input);
        var span = document.createElement('span');
        span.textContent = expertLabel(expert);
        label.appendChild(span);
        listEl.appendChild(label);
      });
      box.appendChild(listEl);

      // 候補が1人しかいないなら最初から選んでおく（余計な操作を増やさない）
      if (list.length === 1) {
        var only = listEl.querySelector('input');
        if (only) { only.checked = true; only.dispatchEvent(new Event('change')); }
      }

      var row = document.createElement('div');
      row.className = 'consult-send-btns';
      row.style.marginTop = '0.7rem';
      nextBtn.addEventListener('click', function () { if (chosen) confirm(via, chosen); });
      row.appendChild(nextBtn);
      box.appendChild(row);

      stage.appendChild(box);
      box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    ['line', 'email'].forEach(function (via) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'consult-send-btn is-dummy';
      b.textContent = CONTACT_LABEL[via] + 'で送信';
      b.addEventListener('click', function () { pick(via); });
      btns.appendChild(b);
    });

    return wrap;
  }

  function expertLabel(expert) {
    if (!expert) return '';
    return (QUALIFICATION_LABEL[expert.qualification] || expert.title || '専門家') +
      (expert.name ? '　' + expert.name : '');
  }

  // ---------- 結果画面 ----------
  function renderResult(panel, opts, answers, onBack) {
    var data = window.KOBAN_EXPERTS || { status: 'preparing', experts: [], demo: [] };
    var useDemo = /(^|[?&])expertdemo=1(&|$)/.test(location.search);
    var pool = (data.experts && data.experts.length) ? data.experts : (useDemo ? (data.demo || []) : []);

    // (1) ひな形文の具体化。会社情報が登録されていれば連絡先が自動で入る。
    var templateText = buildTemplateText(opts, answers);
    var company = getCompany();
    var companyBlock = buildCompanyBlock(company);

    var profileNote = document.createElement('div');
    profileNote.className = 'consult-profile-note';
    if (companyBlock) {
      // company_data.js の displayLabel と同じ規則（事業者名があればそれ、無ければ label）
      var label = val(company, 'name') || val(company, 'label') || '登録済みの会社';
      var okText = document.createElement('span');
      okText.textContent = '会社情報「' + label + '」の連絡先をひな形に入れました。';
      profileNote.appendChild(okText);
      var editLink = document.createElement('a');
      editLink.href = 'profile.html';
      editLink.textContent = '会社情報を変える';
      profileNote.appendChild(editLink);
    } else {
      profileNote.classList.add('is-empty');
      var msg = document.createElement('span');
      msg.textContent = '会社情報を登録しておくと、連絡先が自動で入ります。';
      profileNote.appendChild(msg);
      var regLink = document.createElement('a');
      regLink.href = 'profile_edit.html';
      regLink.textContent = '会社情報を登録する';
      profileNote.appendChild(regLink);
    }

    var tmplWrap = document.createElement('div');
    tmplWrap.className = 'consult-tmpl-wrap';
    var tmplLabel = document.createElement('div');
    tmplLabel.className = 'consult-tmpl-label';
    tmplLabel.textContent = '相談メッセージ';
    tmplWrap.appendChild(tmplLabel);
    tmplWrap.appendChild(profileNote);

    // 本文は既定では全文がそのまま見える固定表示。「編集する」で textarea に
    // 切り替える。送信ボタンは常に最新の本文（messageText）を読む。
    var messageText = templateText;
    var view = document.createElement('div');
    view.className = 'consult-tmpl-view';
    view.textContent = messageText;
    tmplWrap.appendChild(view);

    var editBox = document.createElement('textarea');
    editBox.className = 'consult-tmpl';
    editBox.value = messageText;
    editBox.style.display = 'none';
    // 中身がすべて見える高さに自動で伸ばす（スクロールで隠れないようにする）
    function fitHeight() {
      editBox.style.height = 'auto';
      editBox.style.height = (editBox.scrollHeight + 4) + 'px';
    }
    editBox.addEventListener('input', function () {
      messageText = editBox.value;
      fitHeight();
    });
    tmplWrap.appendChild(editBox);

    var tmplBtns = document.createElement('div');
    tmplBtns.className = 'consult-tmpl-btns';
    var editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.className = 'consult-copy-btn';
    editBtn.textContent = '内容を編集する';
    var editing = false;
    editBtn.addEventListener('click', function () {
      editing = !editing;
      if (editing) {
        editBox.value = messageText;
        editBox.style.display = '';
        view.style.display = 'none';
        fitHeight();
        editBtn.textContent = '編集を終わる';
        editBox.focus();
      } else {
        messageText = editBox.value;
        view.textContent = messageText;
        editBox.style.display = 'none';
        view.style.display = '';
        editBtn.textContent = '内容を編集する';
      }
    });
    tmplBtns.appendChild(editBtn);
    tmplBtns.appendChild(buildCopyButton(function () { return messageText; }));
    tmplWrap.appendChild(tmplBtns);

    // 自由記入の案内。本文に混ぜるとそのまま相手に届いてしまうので枠の外に出す
    var editHint = document.createElement('p');
    editHint.className = 'consult-edit-hint';
    editHint.textContent = '（ご質問・補足があれば内容を編集ボタンから追記してください）';
    tmplWrap.appendChild(editHint);

    panel.appendChild(tmplWrap);

    // 送信ボタンなどから常に最新の本文を読むための入口
    function getMessage() {
      return editing ? editBox.value : messageText;
    }

    // (2) 送信先になりうる専門家を先に確定させる（送信UIと一覧の両方で使う）
    var toShow = [];
    var widened = false;
    if (pool.length) {
      var matched = pool.filter(function (e) { return cardMatches(e, opts.kind, answers.topics); });
      // 相談テーマに合う人がいないときは、テーマの条件だけ外して制度種別（kind）の
      // 一致は維持したまま広げる。助成金の相談なのに補助金専門の人まで出す、
      // というズレを起こさないため。それでもゼロなら最後に全件を出す。
      toShow = matched;
      if (!toShow.length) {
        toShow = pool.filter(function (e) { return cardMatches(e, opts.kind, []); });
        widened = toShow.length > 0;
      }
      if (!toShow.length) { toShow = pool; widened = true; }
    }

    // (3) 送信（この内容を送る）。本文のすぐ下に置き、
    //     ボタン→送信先を選ぶ→確認→送信、の順で進む。
    panel.appendChild(buildSendSection(toShow, getMessage));

    // (4) 相談先の一覧
    if (!pool.length) {
      var preparing = document.createElement('div');
      preparing.className = 'consult-preparing';
      preparing.textContent = '提携専門家は現在準備中です。上の本文をコピーして、顧問の専門家や知り合いの窓口にご相談ください。';
      panel.appendChild(preparing);
    } else {
      if (widened) {
        var fallbackNote = document.createElement('p');
        fallbackNote.className = 'consult-lead';
        fallbackNote.textContent = 'ご相談の内容にちょうど合う専門家がまだ登録されていないため、対応できる範囲の近い専門家を表示しています。';
        panel.appendChild(fallbackNote);
      }
      var cards = document.createElement('div');
      cards.className = 'consult-cards';
      toShow.forEach(function (expert) {
        cards.appendChild(renderCard(expert, getMessage, answers.contacts));
      });
      panel.appendChild(cards);
    }

    // (5) 相談前に用意するものの案内（本人指示で最下部へ移動）。
    //     複数テーマを選べるので、重複を除いてまとめる。
    var prepareItems = [];
    (answers.topics || []).forEach(function (id) {
      var t = findTopic(id);
      if (!t || !t.prepare) return;
      t.prepare.forEach(function (item) {
        if (prepareItems.indexOf(item) === -1) prepareItems.push(item);
      });
    });
    if (prepareItems.length) {
      var prep = document.createElement('div');
      prep.className = 'consult-prepare';
      var prepTtl = document.createElement('div');
      prepTtl.className = 'consult-prepare-ttl';
      prepTtl.textContent = '相談前に手元にあるとスムーズなもの';
      prep.appendChild(prepTtl);
      var ul = document.createElement('ul');
      prepareItems.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      prep.appendChild(ul);
      panel.appendChild(prep);
    }

    var disclaimer = document.createElement('p');
    disclaimer.className = 'consult-disclaimer';
    disclaimer.textContent = '相談の受付可否・費用は各専門家に直接ご確認ください。';
    panel.appendChild(disclaimer);

    // 相談内容を選び直す導線。画面上部からは外したが、選び直せないと詰むので
    // いちばん下に控えめに置く（本人指示 2026-08-17、上部の文言は削除）。
    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'consult-back';
    backBtn.textContent = '相談内容を選び直す';
    backBtn.addEventListener('click', onBack);
    panel.appendChild(backBtn);
  }

  function mount(container, opts) {
    opts = opts || {};
    // アンケートの進行状態。step は何問目を表示中か、answers は選択内容。
    // 「変更」で前の問いに戻っても選択が消えないよう、mount 単位で持ち回す。
    var surveyState = { step: 0, answers: { topics: [], stage: '', contacts: [] } };

    function draw(stage, answers) {
      var panel = document.createElement('div');
      panel.className = 'consult-panel';
      panel.id = 'consultPanel';
      if (stage === 'survey') {
        renderSurvey(panel, opts, surveyState,
          function (a) { draw('result', a); },
          function (next) { surveyState = next; draw('survey'); });
      } else {
        renderResult(panel, opts, answers || {}, function () { draw('survey'); });
      }
      container.innerHTML = '';
      container.appendChild(panel);
      container.style.display = '';
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    draw('survey');
  }

  window.KOBAN_CONSULT = { mount: mount };
})();

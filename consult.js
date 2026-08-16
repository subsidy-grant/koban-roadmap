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
    '  font-size: 0.8rem; color: var(--accent); cursor: pointer; min-height: 2.75rem;' +
    '  padding: 0 0.2rem; text-decoration: underline; }' +
    '.consult-prepare { background: var(--sage-wash); border-radius: var(--radius-sm);' +
    '  padding: 0.75rem 0.9rem; margin-bottom: 1rem; }' +
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
    '.consult-tmpl { width: 100%; box-sizing: border-box; resize: vertical; min-height: 7.5em;' +
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
  function buildTemplateText(opts, answers) {
    answers = answers || {};
    var topicIds = answers.topics || [];
    var lines = ['はじめまして。「補助金活用 業務改善ロードマップ」を見てご連絡しました。'];
    if (opts.programName) {
      lines.push('検討中の制度：' + opts.programName);
      if (opts.programKey) {
        lines.push(location.origin + location.pathname.replace(/[^/]*$/, '') +
          'program.html?key=' + encodeURIComponent(opts.programKey));
      }
    }
    var labels = topicIds.map(function (id) {
      var t = findTopic(id);
      return t ? t.label : '';
    }).filter(function (s) { return s && s.indexOf('その他') !== 0; });
    if (labels.length) {
      lines.push('相談したいこと：');
      labels.forEach(function (l) { lines.push('・' + l); });
    } else {
      lines.push('相談したいこと：' + (opts.topic || '（ここにご記入ください）'));
    }
    var stage = answers.stage ? findStage(answers.stage) : null;
    if (stage) lines.push('いまの状況：' + stage.label);
    var contacts = answers.contacts || [];
    if (contacts.length) {
      lines.push('希望の連絡方法：' + contacts.map(function (c) {
        return CONTACT_LABEL[c] || c;
      }).join('・'));
    }
    // 会社情報が登録されていれば連絡先と事業の概要を添える。
    // 未登録なら書式だけ残し、利用者が手で埋められるようにする。
    var block = buildCompanyBlock(getCompany());
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
    if (block && block.biz.length) {
      lines.push('');
      lines.push('【事業の概要】');
      block.biz.forEach(function (l) { lines.push(l); });
    }
    // 自由記入欄は本文のいちばん最後に置く（間に定型が挟まると書きにくいため）
    lines.push('');
    lines.push('（ご質問・補足があればこちらにご記入ください）');
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

    function makeLineBtn() {
      if (!expert.line_oa_id) return null;
      var b = document.createElement('a');
      b.className = 'consult-btn';
      b.target = '_blank';
      b.rel = 'noopener noreferrer';
      b.href = 'https://line.me/R/oaMessage/' + encodeURIComponent(expert.line_oa_id) +
        '/?' + encodeURIComponent(templateText);
      b.textContent = 'LINEで相談する';
      return b;
    }
    function makeMailBtn() {
      if (!expert.email) return null;
      var b = document.createElement('a');
      b.className = 'consult-btn';
      b.href = 'mailto:' + encodeURIComponent(expert.email) +
        '?subject=' + encodeURIComponent('補助金活用ロードマップを見てのご相談') +
        '&body=' + encodeURIComponent(templateText);
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

  function buildCopyButton(tmplBox) {
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

  // ---------- 結果画面 ----------
  function renderResult(panel, opts, answers, onBack) {
    var data = window.KOBAN_EXPERTS || { status: 'preparing', experts: [], demo: [] };
    var useDemo = /(^|[?&])expertdemo=1(&|$)/.test(location.search);
    var pool = (data.experts && data.experts.length) ? data.experts : (useDemo ? (data.demo || []) : []);

    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'consult-back';
    backBtn.textContent = '← 相談内容を選び直す';
    backBtn.addEventListener('click', onBack);
    panel.appendChild(backBtn);

    var privacy = document.createElement('p');
    privacy.className = 'consult-privacy';
    privacy.textContent = 'ボタンはLINE・メール・電話のアプリを開くだけです。このサイトから相談内容が送信されることはありません。';
    panel.appendChild(privacy);

    // (3) 相談前に用意するものの案内。複数テーマを選べるので、重複を除いてまとめる。
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
    tmplLabel.textContent = '相談メッセージのひな形';
    tmplWrap.appendChild(tmplLabel);
    tmplWrap.appendChild(profileNote);
    var tmplBox = document.createElement('textarea');
    tmplBox.className = 'consult-tmpl';
    tmplBox.readOnly = true;
    tmplBox.value = templateText;
    tmplWrap.appendChild(tmplBox);
    tmplWrap.appendChild(buildCopyButton(tmplBox));
    panel.appendChild(tmplWrap);

    // (2) 専門家の絞り込み
    if (!pool.length) {
      var preparing = document.createElement('div');
      preparing.className = 'consult-preparing';
      preparing.textContent = '提携専門家は現在準備中です。上のひな形をコピーして、顧問の専門家や知り合いの窓口にご相談ください。';
      panel.appendChild(preparing);
    } else {
      var matched = pool.filter(function (e) { return cardMatches(e, opts.kind, answers.topics); });
      // 相談テーマに合う人がいないときは、テーマの条件だけ外して制度種別（kind）の
      // 一致は維持したまま広げる。助成金の相談なのに補助金専門の人まで出す、
      // というズレを起こさないため。それでもゼロなら最後に全件を出す。
      var toShow = matched;
      var widened = false;
      if (!toShow.length) {
        toShow = pool.filter(function (e) { return cardMatches(e, opts.kind, []); });
        widened = toShow.length > 0;
      }
      if (!toShow.length) {
        toShow = pool;
        widened = true;
      }
      if (widened) {
        var fallbackNote = document.createElement('p');
        fallbackNote.className = 'consult-lead';
        fallbackNote.textContent = 'ご相談の内容にちょうど合う専門家がまだ登録されていないため、対応できる範囲の近い専門家を表示しています。';
        panel.appendChild(fallbackNote);
      }
      var cards = document.createElement('div');
      cards.className = 'consult-cards';
      toShow.forEach(function (expert) {
        cards.appendChild(renderCard(expert, templateText, answers.contacts));
      });
      panel.appendChild(cards);
    }

    var disclaimer = document.createElement('p');
    disclaimer.className = 'consult-disclaimer';
    disclaimer.textContent = '相談の受付可否・費用は各専門家に直接ご確認ください。書類の作成・提出の代行は行いません。';
    panel.appendChild(disclaimer);
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

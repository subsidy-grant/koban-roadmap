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
    /* ---- アンケート ---- */
    '.consult-q { margin-bottom: 1.2rem; }' +
    '.consult-q-ttl { font-size: 0.88rem; font-weight: 700; margin-bottom: 0.5rem; }' +
    '.consult-q-note { font-size: 0.76rem; color: var(--ink-faint); font-weight: 400; }' +
    '.consult-opts { display: grid; gap: 0.45rem; }' +
    '.consult-opt { display: flex; align-items: center; gap: 0.6rem; cursor: pointer;' +
    '  min-height: 2.75rem; padding: 0.4rem 0.7rem; border: 1px solid var(--line);' +
    '  border-radius: var(--radius-sm); background: var(--paper); font-size: 0.85rem; }' +
    '.consult-opt:hover { border-color: var(--accent); background: var(--accent-wash); }' +
    '.consult-opt input { width: 1.1rem; height: 1.1rem; flex: none; accent-color: var(--accent); }' +
    '.consult-opt.is-checked { border-color: var(--accent); background: var(--accent-wash); }' +
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
    '.consult-stopped { font-size: 0.8rem; color: var(--ink-faint); }' +
    '.consult-disclaimer { margin-top: 0.9rem; font-size: 0.76rem; color: var(--ink-faint); }' +
    '@media print { .consult-panel { display: none !important; } }';
  document.head.appendChild(style);

  var QUALIFICATION_LABEL = {
    sharoushi: '社会保険労務士', shindanshi: '中小企業診断士',
    gyoseishoshi: '行政書士', zeirishi: '税理士'
  };

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

  function buildTemplateText(opts, answers) {
    answers = answers || {};
    var lines = ['はじめまして。「補助金活用 業務改善ロードマップ」を見てご連絡しました。'];
    if (opts.programName) {
      lines.push('検討中の制度：' + opts.programName);
      if (opts.programKey) {
        lines.push(location.origin + location.pathname.replace(/[^/]*$/, '') +
          'program.html?key=' + encodeURIComponent(opts.programKey));
      }
    }
    var topic = answers.topic ? findTopic(answers.topic) : null;
    if (topic && topic.id !== 'other') {
      lines.push('相談したいこと：' + topic.label);
    } else {
      lines.push('相談したいこと：' + (opts.topic || '（ここにご記入ください）'));
    }
    var stage = answers.stage ? findStage(answers.stage) : null;
    if (stage) lines.push('いまの状況：' + stage.label);
    lines.push('');
    lines.push('（補足があればこちらにご記入ください）');
    return lines.join('\n');
  }

  // 相談テーマと制度種別の両方で専門家を絞る。
  // topics を持つ専門家はその配列で判定し、持たない専門家は資格で判定する。
  function cardMatches(expert, kind, topicId) {
    if (kind && kind !== 'other') {
      if ((expert.kinds || []).indexOf(kind) === -1) return false;
    }
    if (!topicId || topicId === 'other') return true;
    if (expert.topics && expert.topics.length) {
      return expert.topics.indexOf(topicId) !== -1;
    }
    var topic = findTopic(topicId);
    if (!topic || !topic.qualifications || !topic.qualifications.length) return true;
    return topic.qualifications.indexOf(expert.qualification) !== -1;
  }

  function renderCard(expert, templateText, preferContact) {
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

    // 希望した連絡手段を先に並べる（もう一方も消さずに残す）
    var order = (preferContact === 'email') ? [makeMailBtn(), makeLineBtn()] : [makeLineBtn(), makeMailBtn()];
    order.forEach(function (b) { if (b) actions.appendChild(b); });
    wrap.appendChild(actions);
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

  // ---------- アンケート画面 ----------
  function renderSurvey(panel, opts, onDone) {
    var lead = document.createElement('p');
    lead.className = 'consult-lead';
    lead.textContent = 'どんなことを相談したいか教えてください。合う専門家と、相談メッセージのひな形をご用意します。';
    panel.appendChild(lead);

    var answers = { topic: '', stage: '', contact: '' };

    function makeQuestion(titleText, noteText, name, options, onChange) {
      var q = document.createElement('div');
      q.className = 'consult-q';
      var ttl = document.createElement('div');
      ttl.className = 'consult-q-ttl';
      ttl.textContent = titleText;
      if (noteText) {
        var note = document.createElement('span');
        note.className = 'consult-q-note';
        note.textContent = '　' + noteText;
        ttl.appendChild(note);
      }
      q.appendChild(ttl);
      var wrap = document.createElement('div');
      wrap.className = 'consult-opts';
      options.forEach(function (o) {
        var label = document.createElement('label');
        label.className = 'consult-opt';
        var input = document.createElement('input');
        input.type = 'radio';
        input.name = name;
        input.value = o.id;
        input.addEventListener('change', function () {
          Array.prototype.forEach.call(wrap.querySelectorAll('.consult-opt'), function (el) {
            el.classList.remove('is-checked');
          });
          label.classList.add('is-checked');
          onChange(o.id);
        });
        label.appendChild(input);
        var span = document.createElement('span');
        span.textContent = o.label;
        label.appendChild(span);
        wrap.appendChild(label);
      });
      q.appendChild(wrap);
      return q;
    }

    var submitBtn = document.createElement('button');
    submitBtn.type = 'button';
    submitBtn.className = 'consult-submit';
    submitBtn.textContent = '相談先を見る';
    submitBtn.disabled = true;

    panel.appendChild(makeQuestion(
      'Q1　何について相談したいですか？', '（必須）', 'consultTopic', getTopics(),
      function (v) { answers.topic = v; submitBtn.disabled = false; }
    ));

    var stages = getStages();
    if (stages.length) {
      panel.appendChild(makeQuestion(
        'Q2　いまどの段階ですか？', '（任意）', 'consultStage', stages,
        function (v) { answers.stage = v; }
      ));
    }

    panel.appendChild(makeQuestion(
      'Q3　連絡はどちらがよいですか？', '（任意）', 'consultContact',
      [{ id: 'line', label: 'LINE' }, { id: 'email', label: 'メール' }],
      function (v) { answers.contact = v; }
    ));

    var row = document.createElement('div');
    row.className = 'consult-actions-row';
    submitBtn.addEventListener('click', function () { onDone(answers); });
    row.appendChild(submitBtn);

    var skipBtn = document.createElement('button');
    skipBtn.type = 'button';
    skipBtn.className = 'consult-skip';
    skipBtn.textContent = 'アンケートを飛ばす';
    skipBtn.addEventListener('click', function () { onDone({ topic: '', stage: '', contact: '' }); });
    row.appendChild(skipBtn);

    panel.appendChild(row);
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
    privacy.textContent = 'ボタンはLINE・メールのアプリを開くだけです。このサイトから相談内容が送信されることはありません。';
    panel.appendChild(privacy);

    // (3) 相談前に用意するものの案内
    var topic = answers.topic ? findTopic(answers.topic) : null;
    if (topic && topic.prepare && topic.prepare.length) {
      var prep = document.createElement('div');
      prep.className = 'consult-prepare';
      var prepTtl = document.createElement('div');
      prepTtl.className = 'consult-prepare-ttl';
      prepTtl.textContent = '相談前に手元にあるとスムーズなもの';
      prep.appendChild(prepTtl);
      var ul = document.createElement('ul');
      topic.prepare.forEach(function (item) {
        var li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
      });
      prep.appendChild(ul);
      panel.appendChild(prep);
    }

    // (1) ひな形文の具体化
    var templateText = buildTemplateText(opts, answers);
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
    tmplWrap.appendChild(buildCopyButton(tmplBox));
    panel.appendChild(tmplWrap);

    // (2) 専門家の絞り込み
    if (!pool.length) {
      var preparing = document.createElement('div');
      preparing.className = 'consult-preparing';
      preparing.textContent = '提携専門家は現在準備中です。上のひな形をコピーして、顧問の専門家や知り合いの窓口にご相談ください。';
      panel.appendChild(preparing);
    } else {
      var matched = pool.filter(function (e) { return cardMatches(e, opts.kind, answers.topic); });
      // 相談テーマに合う人がいないときは、テーマの条件だけ外して制度種別（kind）の
      // 一致は維持したまま広げる。助成金の相談なのに補助金専門の人まで出す、
      // というズレを起こさないため。それでもゼロなら最後に全件を出す。
      var toShow = matched;
      var widened = false;
      if (!toShow.length) {
        toShow = pool.filter(function (e) { return cardMatches(e, opts.kind, ''); });
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
        cards.appendChild(renderCard(expert, templateText, answers.contact));
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

    function draw(stage, answers) {
      var panel = document.createElement('div');
      panel.className = 'consult-panel';
      panel.id = 'consultPanel';
      if (stage === 'survey') {
        renderSurvey(panel, opts, function (a) { draw('result', a); });
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

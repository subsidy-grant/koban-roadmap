// 申請の手順とスケジュール（ガントチャート）の描画。
// index.html と documents.html のどちらからでも使えるよう、1つのファイルにまとめている。
// データは gantt_data.js（出典と確認日時つき）。進捗と入力した日付は
// localStorage に 'koban_' の名前空間で保存する（同じオリジンに姉妹サイトが同居しているため）。
//
// 使い方：ページに次の3つを置いてから initGantt() を呼ぶ。
//   <select id="gtScheme">   … 制度を選ぶ
//   <div id="gtAnchors">     … 基準になる日付の入力欄が入る
//   <div id="gtOut">         … ガント本体が入る
(function () {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function load(key, fallback) {
    try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }

  // 制度ごとのタスクは gantt_data.js（出典と確認日時つき）にある。
  // 利用者が入れた基準日から各タスクの日付を計算し、帯で並べる。
  // 日付が決まらない（交付決定日など、まだ通知が来ていない）タスクは
  // 斜線の帯で「日付未定」と出す。ここを普通の帯で描くと
  // 「もう発注してよい」と誤って読まれるため。
  var G = window.KOBAN_GANTT || { anchors: {}, schemes: {}, tasks: [] };
  var K_GANTT = 'koban_ganttDone';
  var K_GANTT_DATES = 'koban_ganttDates';
  var K_GANTT_PHASE = 'koban_ganttPhase';
  var gtDone = load(K_GANTT, {});
  var gtDates = load(K_GANTT_DATES, {});
  var gtPhase = load(K_GANTT_PHASE, {});
  if (!gtDone || typeof gtDone !== 'object') gtDone = {};
  if (!gtDates || typeof gtDates !== 'object') gtDates = {};
  if (!gtPhase || typeof gtPhase !== 'object') gtPhase = {};
  // 段階（準備・交付申請など）の開閉。既定は開いた状態で、
  // 閉じたものだけ憶えておく（初めて見た人に空の表を見せないため）
  function phaseKey(scheme, phase) { return scheme + '||' + phase; }
  function phaseOpen(scheme, phase) { return gtPhase[phaseKey(scheme, phase)] !== 0; }

  function gtParse(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function gtAddDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function gtDayDiff(a, b) { return Math.round((a - b) / 86400000); }
  function gtFmt(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  // 帯に添える札は横幅を食うので短く書く（例 12/2）
  function gtShort(d) { return (d.getMonth() + 1) + '/' + d.getDate(); }
  function gtKey(scheme, key) { return scheme + '.' + key; }

  // 「誰がやるのか」を見出しの次に目立たせる。自分で動く手順と、
  // 頼む手順と、待つだけの手順を取り違えると着手が遅れるため、色でも分ける。
  var OWNER_WAIT = /^(事務局|労働局|中小機構)([・、].+)?$/;
  function ownerChip(owner) {
    var o = String(owner || '').trim();
    if (!o) return { cls: 'wait', text: '担当が未記入' };
    var parts = o.split(/[・、]/);
    var self = parts.filter(function (x) { return x === '事業主'; }).length > 0;
    var rest = parts.filter(function (x) { return x !== '事業主'; });
    if (self) {
      return rest.length
        ? { cls: 'self', text: '自分＋' + rest.join('・') }
        : { cls: 'self', text: '自分でやる' };
    }
    if (OWNER_WAIT.test(o)) return { cls: 'wait', text: '待つ：' + o };
    if (/スタッフ|労働者|対象者/.test(o)) return { cls: 'other', text: o + 'が行う' };
    return { cls: 'other', text: o + 'に頼む' };
  }

  function renderGtSchemes() {
    var sel = document.getElementById('gtScheme');
    if (!sel) return;
    var keys = Object.keys(G.schemes);
    sel.innerHTML = '<option value="">制度を選んでください</option>' + keys.map(function (k) {
      var n = G.tasks.filter(function (t) { return t.scheme === k; }).length;
      return '<option value="' + esc(k) + '">' + esc(G.schemes[k].label) + '（' + n + '手順）</option>';
    }).join('');
    sel.addEventListener('change', function () { renderGtAnchors(); renderGantt(); });
  }
  function renderGtAnchors() {
    var box = document.getElementById('gtAnchors');
    var sel = document.getElementById('gtScheme');
    if (!box || !sel) return;
    var k = sel.value;
    if (!k) { box.innerHTML = ''; return; }
    var list = G.anchors[k] || [];
    var note = G.schemes[k] && G.schemes[k].note;
    box.innerHTML = '<div class="gt-anchors">' +
      (note ? '<div class="warn" style="margin:0 0 0.8rem;">' + esc(note) + '</div>' : '') +
      '<p class="step-ttl">手順2　基準になる日付を入れる</p>' +
      list.map(function (a) {
        var id = 'gtd_' + k + '_' + a.key;
        var v = gtDates[gtKey(k, a.key)] || '';
        return '<div class="arow"><label for="' + id + '">' + esc(a.label) +
          (a.optional ? '（分かってから入れてください）' : '') + '</label>' +
          '<input type="date" id="' + id + '" data-anchor="' + esc(a.key) + '" value="' + esc(v) + '">' +
          (a.note ? '<p class="anote">' + esc(a.note) + '</p>' : '') + '</div>';
      }).join('') + '</div>';
    box.querySelectorAll('input[type="date"]').forEach(function (inp) {
      inp.addEventListener('change', function () {
        gtDates[gtKey(k, inp.getAttribute('data-anchor'))] = inp.value;
        save(K_GANTT_DATES, gtDates);
        renderGantt();
      });
    });
  }

  // 日付の札をどこに置くか。画面幅・文字の大きさで入る場所が変わるので、
  // 決め打ちではなく実際に測って決める（帯の中→右→左の順に試す）。
  function fitLabels(out) {
    var marks = out.querySelectorAll('.gt-mark');
    Array.prototype.forEach.call(marks, function (m) {
      var lab = m.querySelector('.gt-blab');
      var lane = m.parentNode;
      if (!lab || !lane) return;
      m.classList.remove('flip', 'inb');
      var lr = lane.getBoundingClientRect();
      var mr = m.getBoundingClientRect();
      var w = lab.getBoundingClientRect().width;
      if (mr.width >= w + 14) { m.classList.add('inb'); return; }   // 帯が広ければ中に入れる
      if (mr.right + 12 + w <= lr.right) return;                     // 右に出して収まる
      if (mr.left - 12 - w >= lr.left) { m.classList.add('flip'); return; } // 左なら収まる
      m.classList.add('inb');                                        // どちらも無理なら中に重ねる
    });
  }
  var fitTimer = null;
  window.addEventListener('resize', function () {
    var out = document.getElementById('gtOut');
    if (!out || !out.querySelector('.gt-mark')) return;
    clearTimeout(fitTimer);
    fitTimer = setTimeout(function () { fitLabels(out); }, 150);
  });

  function renderGantt() {
    var out = document.getElementById('gtOut');
    var sel = document.getElementById('gtScheme');
    if (!out || !sel) return;
    var k = sel.value;
    if (!k) { out.innerHTML = ''; return; }
    var anchors = G.anchors[k] || [];
    var need = anchors.filter(function (a) { return !a.optional; });
    var have = {};
    anchors.forEach(function (a) {
      var d = gtParse(gtDates[gtKey(k, a.key)]);
      if (d) have[a.key] = d;
    });
    var missing = need.filter(function (a) { return !have[a.key]; });
    if (missing.length) {
      out.innerHTML = '<p class="empty">' + esc(missing.map(function (a) { return '「' + a.label + '」'; }).join('と')) +
        'を入れると、やることの順番と日程を表示します。</p>';
      return;
    }
    var tasks = G.tasks.filter(function (t) { return t.scheme === k; });
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var rows = tasks.map(function (t) {
      var base = have[t.anchor];
      var st = base ? gtAddDays(base, t.offset) : null;
      var en = st ? gtAddDays(st, Math.max(1, t.days) - 1) : null;
      return { t: t, start: st, end: en, done: !!gtDone[t.id] };
    });
    var dated = rows.filter(function (r) { return r.start; });
    if (!dated.length) { out.innerHTML = '<p class="empty">日付を計算できるタスクがありませんでした。</p>'; return; }
    var min = dated[0].start, max = dated[0].end;
    dated.forEach(function (r) { if (r.start < min) min = r.start; if (r.end > max) max = r.end; });
    if (today < min) min = today;
    if (today > max) max = today;
    min = gtAddDays(min, -7); max = gtAddDays(max, 7);
    var span = Math.max(1, gtDayDiff(max, min));
    // 帯の位置は px ではなく % で置く。こうすると画面幅がいくつでも
    // 期間の全体が枠内に収まり、横スクロールしなくても読める。
    // 1日しかない用事が消えないよう、細さの下限は CSS の min-width で守る。
    function pc(days) { return (days / span * 100).toFixed(3) + '%'; }
    function left(d) { return pc(gtDayDiff(d, min)); }

    // 月の目盛り。狭い画面で月名が重なるので、8個までに間引く。
    var months = [];
    var cur = new Date(min.getFullYear(), min.getMonth(), 1);
    while (cur <= max) {
      if (cur >= min) months.push(cur);
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    var step = Math.max(1, Math.ceil(months.length / 8));
    var ticks = months.map(function (d, i) {
      if (i % step) return '';
      return '<span class="gt-tick" style="left:' + left(d) + ';">' +
        (d.getMonth() === 0 ? d.getFullYear() + '年' : '') + (d.getMonth() + 1) + '月</span>';
    }).join('');
    var todayLine = '<span class="gt-today" style="left:' + left(today) + ';" title="今日"></span>';
    // 各行にも月の区切り線を引く。ヘッダーの目盛りが画面外に行っても、
    // 帯がいつごろの話なのかを線で追えるようにするため。
    // 線は見出しに月名を出したところだけ。全月に引くと縞模様になって読みにくい
    var grid = months.map(function (d, i) {
      return i % step ? '' : '<span class="gt-grid" style="left:' + left(d) + ';"></span>';
    }).join('');

    var doneN = rows.filter(function (r) { return r.done; }).length;
    var pct = Math.round(doneN / rows.length * 100);
    var html = '<div class="gt-prog"><span class="num">' + doneN + ' / ' + rows.length + '（' + pct + '%）</span>' +
      '<span class="prog"><i style="width:' + pct + '%;"></i></span></div>';

    html += '<p class="gt-legend"><span class="k"><i class="gt-bar"></i>やる期間（帯の横に日付）</span>' +
      '<span class="k"><i class="gt-bar hard"></i>落とすと対象外</span>' +
      '<span class="k done"><i class="gt-bar doneb"></i>✓ 終わった（行に色が付きます）</span>' +
      '<span class="k"><i class="gt-bar unknown"></i>日付未定</span>' +
      '<span class="k"><i class="lg-today"></i>今日（' + gtFmt(today) + '）</span></p>';

    html += '<div class="gt-wrap"><div class="gt-inner">' +
      '<div class="gt-head"><div class="gt-left">やること（終わったらチェック）</div>' +
      '<div class="gt-right gt-ticks">' + ticks + todayLine + '</div></div>';

    var phase = null, pIdx = 0;
    rows.forEach(function (r) {
      if (r.t.phase !== phase) {
        if (phase !== null) html += '</div>';
        phase = r.t.phase; pIdx++;
        var pid = 'gtp-' + k + '-' + pIdx;
        var pOpen = phaseOpen(k, phase);
        var pRows = rows.filter(function (x) { return x.t.phase === phase; });
        var pDone = pRows.filter(function (x) { return x.done; }).length;
        html += '<div class="gt-row phase' + (pOpen ? ' is-open' : '') + '">' +
          '<button type="button" class="gt-phase" data-ph="' + esc(phase) + '"' +
            ' aria-expanded="' + (pOpen ? 'true' : 'false') + '" aria-controls="' + pid + '">' +
            '<span class="chev" aria-hidden="true">▾</span>' +
            '<span class="nm">' + esc(phase) + '</span>' +
            '<span class="cnt">' + pDone + ' / ' + pRows.length + '</span>' +
          '</button></div>' +
          '<div class="gt-phase-body' + (pOpen ? '' : ' is-closed') + '" id="' + pid + '">';
      }
      var late = r.start && !r.done && r.start < today;
      var badges = (r.t.hard ? '<span class="gt-badge gt-b-hard">落とすと対象外</span>' : '') +
        (r.t.source === 'unverified' ? '<span class="gt-badge gt-b-un">未確認</span>' : '');
      var when = r.start
        ? gtFmt(r.start) + (r.t.days > 1 ? '〜' + gtFmt(r.end) : '') + '　' + r.t.when
        : '日付未定：' + r.t.when;
      // 見出しは1行の要約。もとの文はこの下に補足として残す（意味を削らないため）
      var head = (G.shorts && G.shorts[r.t.id]) || r.t.task;
      var chip = ownerChip(r.t.owner);
      html += '<div class="gt-row' + (r.done ? ' done' : '') + '">' +
        '<div class="gt-left">' +
          '<label class="gt-name"><input type="checkbox" data-gt="' + esc(r.t.id) + '"' + (r.done ? ' checked' : '') + '>' +
          '<span class="t">' + esc(head) + '</span></label>' +
          '<p class="gt-tags"><span class="gt-who ' + chip.cls + '">' + esc(chip.text) + '</span>' + badges + '</p>' +
          '<p class="gt-meta">' +
            '<span' + (late ? ' class="gt-late"' : '') + '>' + esc(when) + (late ? '（もう始めていないと間に合いません）' : '') + '</span></p>' +
          (head === r.t.task ? '' : '<p class="gt-desc">' + esc(r.t.task) + '</p>') +
          (r.t.warn ? '<p class="gt-warn' + (r.t.hard ? ' hard' : '') + '">' + esc(r.t.warn) + '</p>' : '') +
          '<p class="gt-src">' + (r.t.source === 'unverified'
            ? '出典：当サイトで確認できていません'
            : '出典：<a href="' + esc(r.t.source) + '" target="_blank" rel="noopener noreferrer">一次資料 ↗</a>') +
            '（' + esc(r.t.checked) + '確認）</p>' +
        '</div>' +
        '<div class="gt-right">' + grid +
          (r.start
            // 1日だけの用事は帯にすると点にしかならないので、必ず日付の札を添える。
            // 札が枠の外へ出ないよう、右寄りのものは左側に出す。
            ? '<span class="gt-mark' + (r.done ? ' doneb' : (r.t.hard ? ' hard' : '')) +
              '" style="left:' + left(r.start) + ';width:' + pc(Math.max(1, r.t.days)) + ';" title="' + esc(when) + '">' +
              '<i></i><b class="gt-blab">' + (r.done ? '✓ ' : '') + esc(gtShort(r.start)) +
              (r.t.days > 1 ? '〜' + esc(gtShort(r.end)) : '') + '</b></span>'
            : '<span class="gt-bar unknown" style="left:0;width:100%;" title="日付が決まっていません">' +
              '<em>日付未定</em></span>') +
          todayLine +
        '</div></div>';
    });
    if (phase !== null) html += '</div>';   // 最後の段階のまとまりを閉じる
    html += '</div></div>';
    var undated = rows.filter(function (r) { return !r.start; }).length;
    if (undated) {
      html += '<p class="src-note">' + undated + '件は、まだ決まっていない日（交付決定日など）を基準にしているため日付が出せません。' +
        '通知が届いたら上の欄に入れてください。<strong>この期間に発注してはいけない</strong>制度があります。</p>';
    }
    html += '<p class="src-note">日付は入力した基準日からの計算です。実際の期限は必ず各制度の公募要領・支給要領でご確認ください。' +
      '申請書類の作成・提出を代理で頼めるのは、雇用関係助成金は社会保険労務士または弁護士に限られます。</p>';
    out.innerHTML = html;
    fitLabels(out);
    out.querySelectorAll('input[data-gt]').forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-gt');
        if (c.checked) gtDone[id] = 1; else delete gtDone[id];
        save(K_GANTT, gtDone);
        renderGantt();
      });
    });
    // 段階の開閉。描き直すと見ていた場所に戻れないので、ここだけ表示を切り替える
    out.querySelectorAll('button.gt-phase').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var row = btn.parentNode;
        var body = document.getElementById(btn.getAttribute('aria-controls'));
        var open = !row.classList.contains('is-open');
        row.classList.toggle('is-open', open);
        if (body) body.classList.toggle('is-closed', !open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        gtPhase[phaseKey(k, btn.getAttribute('data-ph'))] = open ? 1 : 0;
        save(K_GANTT_PHASE, gtPhase);
        if (open && body) fitLabels(body);   // 閉じている間は幅が測れないので開いた時に測り直す
      });
    });
  }

  window.initGantt = function () {
    if (!document.getElementById('gtScheme')) return;
    renderGtSchemes();
  };
})();

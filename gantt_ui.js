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
  var gtDone = load(K_GANTT, {});
  var gtDates = load(K_GANTT_DATES, {});
  if (!gtDone || typeof gtDone !== 'object') gtDone = {};
  if (!gtDates || typeof gtDates !== 'object') gtDates = {};

  function gtParse(v) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v || '');
    if (!m) return null;
    var d = new Date(+m[1], +m[2] - 1, +m[3]);
    return isNaN(d.getTime()) ? null : d;
  }
  function gtAddDays(d, n) { return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); }
  function gtDayDiff(a, b) { return Math.round((a - b) / 86400000); }
  function gtFmt(d) { return (d.getMonth() + 1) + '月' + d.getDate() + '日'; }
  function gtKey(scheme, key) { return scheme + '.' + key; }

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
    var px = Math.max(1.1, Math.min(9, 1500 / span));
    var width = Math.round(span * px);
    function left(d) { return Math.round(gtDayDiff(d, min) * px); }

    // 月の目盛り
    var ticks = '';
    var cur = new Date(min.getFullYear(), min.getMonth(), 1);
    while (cur <= max) {
      if (cur >= min) {
        ticks += '<span class="gt-tick" style="left:' + left(cur) + 'px;">' +
          (cur.getMonth() === 0 ? cur.getFullYear() + '年' : '') + (cur.getMonth() + 1) + '月</span>';
      }
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    var todayLine = '<span class="gt-today" style="left:' + left(today) + 'px;" title="今日"></span>';

    var doneN = rows.filter(function (r) { return r.done; }).length;
    var pct = Math.round(doneN / rows.length * 100);
    var html = '<div class="gt-prog"><span class="num">' + doneN + ' / ' + rows.length + '（' + pct + '%）</span>' +
      '<span class="prog"><i style="width:' + pct + '%;"></i></span></div>';

    html += '<div class="gt-wrap"><div class="gt-inner" style="width:' + (width + 320) + 'px;">' +
      '<div class="gt-head"><div class="gt-left">やること（終わったらチェック）</div>' +
      '<div class="gt-ticks" style="width:' + width + 'px;">' + ticks + todayLine + '</div></div>';

    var phase = null;
    rows.forEach(function (r) {
      if (r.t.phase !== phase) {
        phase = r.t.phase;
        html += '<div class="gt-row phase">' + esc(phase) + '</div>';
      }
      var late = r.start && !r.done && r.start < today;
      var badges = (r.t.hard ? '<span class="gt-badge gt-b-hard">落とすと対象外</span>' : '') +
        (r.t.source === 'unverified' ? '<span class="gt-badge gt-b-un">未確認</span>' : '');
      var when = r.start
        ? gtFmt(r.start) + (r.t.days > 1 ? '〜' + gtFmt(r.end) : '') + '　' + r.t.when
        : '日付未定：' + r.t.when;
      html += '<div class="gt-row' + (r.done ? ' done' : '') + '">' +
        '<div class="gt-left">' +
          '<label class="gt-name"><input type="checkbox" data-gt="' + esc(r.t.id) + '"' + (r.done ? ' checked' : '') + '>' +
          '<span class="t">' + esc(r.t.task) + badges + '</span></label>' +
          '<p class="gt-meta">' + esc(r.t.owner) + '　' +
            '<span' + (late ? ' class="gt-late"' : '') + '>' + esc(when) + (late ? '（もう始めていないと間に合いません）' : '') + '</span></p>' +
          (r.t.warn ? '<p class="gt-warn' + (r.t.hard ? ' hard' : '') + '">' + esc(r.t.warn) + '</p>' : '') +
          '<p class="gt-src">' + (r.t.source === 'unverified'
            ? '出典：当サイトで確認できていません'
            : '出典：<a href="' + esc(r.t.source) + '" target="_blank" rel="noopener noreferrer">一次資料 ↗</a>') +
            '（' + esc(r.t.checked) + '確認）</p>' +
        '</div>' +
        '<div class="gt-right" style="width:' + width + 'px;">' +
          (r.start
            ? '<span class="gt-bar' + (r.done ? ' doneb' : (r.t.hard ? ' hard' : '')) + '" style="left:' + left(r.start) +
              'px;width:' + Math.max(6, Math.round(Math.max(1, r.t.days) * px)) + 'px;"></span>'
            : '<span class="gt-bar unknown" style="left:0;width:' + Math.min(width, 120) + 'px;"></span>') +
          todayLine +
        '</div></div>';
    });
    html += '</div></div>';
    var undated = rows.filter(function (r) { return !r.start; }).length;
    if (undated) {
      html += '<p class="src-note">' + undated + '件は、まだ決まっていない日（交付決定日など）を基準にしているため日付が出せません。' +
        '通知が届いたら上の欄に入れてください。<strong>この期間に発注してはいけない</strong>制度があります。</p>';
    }
    html += '<p class="src-note">日付は入力した基準日からの計算です。実際の期限は必ず各制度の公募要領・支給要領でご確認ください。' +
      '申請書類の作成・提出を代理で頼めるのは、雇用関係助成金は社会保険労務士または弁護士に限られます。</p>';
    out.innerHTML = html;
    out.querySelectorAll('input[data-gt]').forEach(function (c) {
      c.addEventListener('change', function () {
        var id = c.getAttribute('data-gt');
        if (c.checked) gtDone[id] = 1; else delete gtDone[id];
        save(K_GANTT, gtDone);
        renderGantt();
      });
    });
  }

  window.initGantt = function () {
    if (!document.getElementById('gtScheme')) return;
    renderGtSchemes();
  };
})();

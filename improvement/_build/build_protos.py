# -*- coding: utf-8 -*-
"""data/plans/{industry}.json の proto 設定から試作プロトタイプ proto-NN-<slug>.html を生成する。

自己完結（CSS/JSインライン・CDNなし）のモックアップ。plan["proto"]["archetype"] に応じて
画面の見た目・操作感をツールの実態に合わせて出し分ける（すべてダッシュボード化しない）:
  - dashboard : KPIタイル＋一覧テーブル＋サイドパネル（分析・在庫・経理向け）
  - calendar  : 予約・シフトの時系列アジェンダ表示（予約・勤怠系）
  - pos       : レジ／伝票チケットのスタック表示（会計・注文系）
  - gauge     : 円形ゲージ＋ライブ計測値リスト（IoT・設備監視系）
  - chat      : 受信トレイ／メッセージカード表示（口コミ・問い合わせ対応系）
  - diagnostic: 直近結果のヒーローカード＋履歴（診断・提案系）
実行: python3 build_protos.py [industry ...]
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

INDUSTRY_SCHEME = {
    "beauty": "#8a5a2b", "food": "#a4453c", "lodging": "#3e6b7a",
    "manufacturing": "#4a5a7a", "realestate": "#3e6b4f", "education": "#7a5a8a",
}
INDUSTRY_LABEL = {
    "beauty": "美容業", "food": "飲食業", "lodging": "宿泊業",
    "manufacturing": "製造業", "realestate": "不動産業", "education": "教育・学習支援業",
}

BASE_CSS = """
  :root{--bg:#f7f5f2;--card:#fff;--ink:#26221e;--sub:#6f675e;--line:#e5dfd7;--accent:__SCHEME__;--green:#3e6b4f;--gold:#b98a2f;--red:#a4453c}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI",sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}
  header{background:var(--ink);color:#f5efe6;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
  header .badge{background:var(--accent);color:#fff;font-size:11px;font-weight:700;border-radius:99px;padding:3px 12px}
  header .arch{background:rgba(255,255,255,0.14);color:#f5efe6;font-size:10px;font-weight:700;border-radius:99px;padding:3px 10px;margin-left:6px}
  header a{color:#f5efe6;font-size:12px}
  main{max-width:1150px;margin:0 auto;padding:26px 20px 60px}
  h1{font-size:1.25rem;margin-bottom:4px}
  .sub{color:var(--sub);font-size:0.85rem;margin-bottom:20px}
  .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:18px}
  @media(max-width:860px){.kpis{grid-template-columns:repeat(2,1fr)}}
  .kpi{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
  .kpi .k{font-size:11px;color:var(--sub);font-weight:600}
  .kpi .v{font-size:1.5rem;font-weight:800;margin:2px 0;color:var(--accent);font-variant-numeric:tabular-nums}
  .kpi .d{font-size:11px;color:var(--green);font-weight:600}
  .grid{display:grid;grid-template-columns:2fr 1fr;gap:14px}
  @media(max-width:860px){.grid{grid-template-columns:1fr}}
  .panel{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px 18px}
  .panel h2{font-size:0.95rem;margin-bottom:10px;color:var(--accent)}
  .side ul{list-style:none}
  .side li{padding:7px 0 7px 20px;position:relative;font-size:0.82rem;border-bottom:1px dashed var(--line)}
  .side li:last-child{border-bottom:none}
  .side li::before{content:"●";position:absolute;left:4px;color:var(--accent);font-size:8px;top:12px}
  .actions{margin:18px 0;display:flex;gap:10px;flex-wrap:wrap}
  button.demo{font:inherit;font-weight:700;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:11px 22px;cursor:pointer;font-size:0.9rem}
  button.demo:hover{opacity:0.9}
  .toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(80px);background:var(--ink);color:#f5efe6;padding:12px 22px;border-radius:10px;font-size:0.85rem;transition:transform .3s ease;z-index:99;max-width:90vw}
  .toast.show{transform:translateX(-50%) translateY(0)}
  .disclaimer{margin-top:26px;font-size:0.72rem;color:var(--sub);border-top:1px solid var(--line);padding-top:12px}
  @keyframes flash{from{background:#e9dfc8}to{background:transparent}}
"""

TABLE_CSS = """
  table{width:100%;border-collapse:collapse;font-size:0.83rem}
  th{text-align:left;font-size:0.7rem;color:var(--sub);padding:6px 8px;border-bottom:2px solid var(--line);white-space:nowrap}
  td{padding:7px 8px;border-bottom:1px solid var(--line)}
  tr:last-child td{border-bottom:none}
  tr.new{animation:flash 1.4s ease}
"""

CALENDAR_CSS = """
  .timeline{position:relative;padding-left:26px}
  .timeline::before{content:"";position:absolute;left:6px;top:4px;bottom:4px;width:2px;background:var(--line)}
  .tcard{position:relative;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;margin-bottom:10px}
  .tcard::before{content:"";position:absolute;left:-24px;top:16px;width:11px;height:11px;border-radius:50%;background:var(--accent);border:2px solid var(--bg)}
  .tcard .time{font-weight:800;color:var(--accent);font-size:0.92rem;font-variant-numeric:tabular-nums}
  .tcard .desc{font-size:0.86rem;color:var(--ink);margin-top:2px}
  .tcard .desc span{color:var(--sub)}
  .tcard .pill{float:right;font-size:0.7rem;font-weight:700;padding:2px 10px;border-radius:99px;background:var(--sage-wash,#eef1ea);color:var(--green)}
  .tcard.new{animation:flash 1.4s ease}
"""

POS_CSS = """
  .register{background:var(--ink);color:#f5efe6;border-radius:14px;padding:20px 22px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px}
  .register .label{font-size:0.78rem;color:#cfc7ba}
  .register .amount{font-size:2rem;font-weight:800;font-variant-numeric:tabular-nums;color:#fff}
  .tickets{display:flex;flex-direction:column;gap:10px}
  .ticket{background:var(--card);border:1px dashed var(--line);border-radius:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
  .ticket .main{font-size:0.88rem;font-weight:700}
  .ticket .sub2{font-size:0.76rem;color:var(--sub);margin-top:2px}
  .ticket .status{font-size:0.72rem;font-weight:700;padding:3px 11px;border-radius:99px;background:var(--accent);color:#fff;white-space:nowrap}
  .ticket.new{animation:flash 1.4s ease}
"""

GAUGE_CSS = """
  .gauges{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
  @media(max-width:860px){.gauges{grid-template-columns:repeat(2,1fr)}}
  .gwrap{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;text-align:center}
  .ring{width:82px;height:82px;border-radius:50%;margin:0 auto 8px;display:flex;align-items:center;justify-content:center;background:conic-gradient(var(--accent) calc(var(--pct)*1%), var(--line) 0)}
  .ring .hole{width:60px;height:60px;border-radius:50%;background:var(--card);display:flex;align-items:center;justify-content:center;font-size:0.82rem;font-weight:800;color:var(--ink)}
  .gwrap .k{font-size:11px;color:var(--sub);font-weight:600}
  .readings{display:flex;flex-direction:column;gap:8px}
  .reading{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 14px;display:flex;align-items:center;gap:10px}
  .reading .dot{width:9px;height:9px;border-radius:50%;background:var(--green);flex-shrink:0;box-shadow:0 0 0 3px color-mix(in srgb, var(--green) 25%, transparent)}
  .reading .r1{font-weight:700;font-size:0.85rem;min-width:130px}
  .reading .r2{color:var(--sub);font-size:0.8rem;flex:1}
  .reading.new{animation:flash 1.4s ease}
"""

CHAT_CSS = """
  .thread{display:flex;flex-direction:column;gap:10px}
  .bubble{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px;display:flex;gap:12px}
  .bubble .av{width:34px;height:34px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.78rem;font-weight:800;flex-shrink:0}
  .bubble .body2{flex:1}
  .bubble .meta{font-size:0.72rem;color:var(--sub);display:flex;justify-content:space-between;gap:8px}
  .bubble .txt{font-size:0.87rem;margin-top:3px}
  .bubble .tag{font-size:0.7rem;font-weight:700;padding:2px 9px;border-radius:99px;background:#eef1ea;color:var(--green);white-space:nowrap}
  .bubble.new{animation:flash 1.4s ease}
"""

DIAGNOSTIC_CSS = """
  .hero2{background:linear-gradient(135deg,var(--card),var(--bg));border:1px solid var(--line);border-radius:16px;padding:22px;display:flex;gap:20px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
  .hero2 .photo{width:88px;height:88px;border-radius:16px;background:var(--accent);display:flex;align-items:center;justify-content:center;font-size:2.2rem;flex-shrink:0}
  .hero2 .r1{font-size:0.75rem;color:var(--sub)}
  .hero2 .r2{font-size:1.35rem;font-weight:800;color:var(--accent);margin:2px 0}
  .hero2 .r3{font-size:0.95rem;color:var(--ink)}
  .histrow{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px}
  .hcard{flex:0 0 auto;width:150px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
  .hcard .t1{font-size:0.7rem;color:var(--sub)}
  .hcard .t2{font-size:0.82rem;font-weight:700;margin-top:3px}
  .hcard .t3{font-size:0.76rem;color:var(--sub);margin-top:2px}
  .hero2.new{animation:flash 1.6s ease}
"""

ARCH_CSS = {"dashboard": TABLE_CSS, "calendar": CALENDAR_CSS, "pos": POS_CSS,
            "gauge": GAUGE_CSS, "chat": CHAT_CSS, "diagnostic": DIAGNOSTIC_CSS}
ARCH_LABEL = {"dashboard": "分析ダッシュボード型", "calendar": "予約・シフト台帳型", "pos": "レジ・伝票型",
              "gauge": "IoT監視・計測型", "chat": "受信トレイ型", "diagnostic": "診断・提案型"}


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def kpis_html(p):
    return "".join(
        f'<div class="kpi"><div class="k">{esc(k)}</div><div class="v">{esc(v)}</div><div class="d">{esc(d)}</div></div>'
        for k, v, d in p["kpis"])


# ---------------------------------------------------------------- dashboard
def body_dashboard(pl, p):
    thead = "".join(f"<th>{esc(c)}</th>" for c in p["tableCols"])
    rows = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="kpis">{kpis_html(p)}</div><div class="grid"><div class="panel">'
            f'<h2>{esc(p["tableTitle"])}</h2><table><thead><tr>{thead}</tr></thead>'
            f'<tbody id="mainList">{rows}</tbody></table></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


DASHBOARD_JS = """
  function addDemo(cols, row) {
    var tbody = document.getElementById('mainList');
    var tr = document.createElement('tr');
    tr.className = 'new';
    row.forEach(function (c) { var td = document.createElement('td'); td.textContent = c; tr.appendChild(td); });
    tbody.insertBefore(tr, tbody.firstChild);
  }
"""


# ---------------------------------------------------------------- calendar
def _tcard(cols, row):
    time_v = row[0]
    status = row[-1]
    mid = " ／ ".join(str(c) for c in row[1:-1])
    return (f'<div class="tcard new"><span class="pill">{esc(status)}</span>'
            f'<div class="time">{esc(time_v)}</div><div class="desc">{esc(mid)}</div></div>')


def body_calendar(pl, p):
    thead_note = "・".join(p["tableCols"][1:-1])
    items = "".join(_tcard(p["tableCols"], r).replace(' new"', '"') for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="kpis">{kpis_html(p)}</div><div class="grid"><div class="panel">'
            f'<h2>{esc(p["tableTitle"])}（{esc(thead_note)}）</h2>'
            f'<div class="timeline" id="mainList">{items}</div></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


CALENDAR_JS = """
  function addDemo(cols, row) {
    var list = document.getElementById('mainList');
    var el = document.createElement('div');
    el.className = 'tcard new';
    var status = row[row.length - 1];
    var mid = row.slice(1, row.length - 1).join(' ／ ');
    el.innerHTML = '<span class="pill">' + esc(status) + '</span><div class="time">' + esc(row[0]) + '</div><div class="desc">' + esc(mid) + '</div>';
    list.insertBefore(el, list.firstChild);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
"""


# ---------------------------------------------------------------- pos
def _ticket(row):
    status = row[-1]
    sub2 = " ／ ".join(str(c) for c in row[:-1])
    return f'<div class="ticket new"><div><div class="main">{esc(sub2)}</div></div><span class="status">{esc(status)}</span></div>'


def body_pos(pl, p):
    hero_label, hero_val, hero_delta = p["kpis"][0]
    other_kpis = "".join(
        f'<div class="kpi"><div class="k">{esc(k)}</div><div class="v">{esc(v)}</div><div class="d">{esc(d)}</div></div>'
        for k, v, d in p["kpis"][1:])
    tickets = "".join(_ticket(r).replace(' new"', '"') for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="register"><div><div class="label">{esc(hero_label)}</div>'
            f'<div class="amount">{esc(hero_val)}</div></div>'
            f'<div style="text-align:right"><div class="label">前回比</div>'
            f'<div style="font-weight:700;color:#f5efe6">{esc(hero_delta)}</div></div></div>'
            f'<div class="kpis" style="grid-template-columns:repeat(3,1fr)">{other_kpis}</div>'
            f'<div class="grid"><div class="panel"><h2>{esc(p["tableTitle"])}</h2>'
            f'<div class="tickets" id="mainList">{tickets}</div></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


POS_JS = """
  function addDemo(cols, row) {
    var list = document.getElementById('mainList');
    var el = document.createElement('div');
    el.className = 'ticket new';
    var status = row[row.length - 1];
    var sub2 = row.slice(0, row.length - 1).join(' ／ ');
    el.innerHTML = '<div><div class="main">' + esc(sub2) + '</div></div><span class="status">' + esc(status) + '</span>';
    list.insertBefore(el, list.firstChild);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
"""


# ---------------------------------------------------------------- gauge
GAUGE_FILLS = [78, 62, 91, 45]


def body_gauge(pl, p):
    gauges = []
    for i, (k, v, d) in enumerate(p["kpis"]):
        pct = GAUGE_FILLS[i % len(GAUGE_FILLS)]
        gauges.append(f'<div class="gwrap"><div class="ring" style="--pct:{pct}">'
                       f'<div class="hole">{esc(v)}</div></div><div class="k">{esc(k)}</div>'
                       f'<div style="font-size:11px;color:var(--green);font-weight:600;margin-top:2px">{esc(d)}</div></div>')
    readings = "".join(
        f'<div class="reading"><span class="dot"></span><span class="r1">{esc(r[0])}</span>'
        f'<span class="r2">' + esc(" ／ ".join(str(c) for c in r[1:])) + '</span></div>'
        for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="gauges">{"".join(gauges)}</div><div class="grid"><div class="panel">'
            f'<h2>{esc(p["tableTitle"])}</h2><div class="readings" id="mainList">{readings}</div></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


GAUGE_JS = """
  function addDemo(cols, row) {
    var list = document.getElementById('mainList');
    var el = document.createElement('div');
    el.className = 'reading new';
    el.innerHTML = '<span class="dot"></span><span class="r1">' + esc(row[0]) + '</span><span class="r2">' + esc(row.slice(1).join(' ／ ')) + '</span>';
    list.insertBefore(el, list.firstChild);
    document.querySelectorAll('.ring').forEach(function (r) {
      var cur = parseInt(getComputedStyle(r).getPropertyValue('--pct')) || 60;
      r.style.setProperty('--pct', Math.min(99, cur + 3));
    });
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
"""


# ---------------------------------------------------------------- chat
def _bubble(cols, row):
    date_v, rating = row[0], row[1]
    excerpt = row[2] if len(row) > 3 else ""
    status = row[-1]
    return (f'<div class="bubble new"><div class="av">{esc(rating)}</div><div class="body2">'
            f'<div class="meta"><span>{esc(date_v)}</span><span class="tag">{esc(status)}</span></div>'
            f'<div class="txt">{esc(excerpt)}</div></div></div>')


def body_chat(pl, p):
    bubbles = "".join(_bubble(p["tableCols"], r).replace(' new"', '"') for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="kpis">{kpis_html(p)}</div><div class="grid"><div class="panel">'
            f'<h2>{esc(p["tableTitle"])}</h2><div class="thread" id="mainList">{bubbles}</div></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


CHAT_JS = """
  function addDemo(cols, row) {
    var list = document.getElementById('mainList');
    var el = document.createElement('div');
    el.className = 'bubble new';
    var excerpt = row.length > 3 ? row[2] : '';
    var status = row[row.length - 1];
    el.innerHTML = '<div class="av">' + esc(row[1]) + '</div><div class="body2"><div class="meta"><span>' + esc(row[0]) + '</span><span class="tag">' + esc(status) + '</span></div><div class="txt">' + esc(excerpt) + '</div></div>';
    list.insertBefore(el, list.firstChild);
  }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
"""


# ---------------------------------------------------------------- diagnostic
def body_diagnostic(pl, p):
    rows = p["rows"]
    first = rows[0]
    rest = rows[1:]
    emoji = p.get("heroEmoji", "🎨")
    hist = "".join(
        f'<div class="hcard"><div class="t1">{esc(r[0])}</div><div class="t2">{esc(r[-2] if len(r) > 2 else r[1])}</div><div class="t3">{esc(r[-1])}</div></div>'
        for r in rest)
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    return (f'<div class="kpis">{kpis_html(p)}</div>'
            f'<div class="hero2" id="heroCard"><div class="photo">{emoji}</div><div>'
            f'<div class="r1">最新の{esc(p["tableTitle"])}（{esc(first[0])}）</div>'
            f'<div class="r2">{esc(first[-2] if len(first) > 2 else first[1])}</div>'
            f'<div class="r3">提案：{esc(first[-1])}</div></div></div>'
            f'<div class="grid"><div class="panel"><h2>過去の{esc(p["tableTitle"])}</h2>'
            f'<div class="histrow" id="mainList">{hist}</div></div>'
            f'<div class="panel side"><h2>{esc(p["sideTitle"])}</h2><ul>{side}</ul></div></div>')


DIAGNOSTIC_JS = """
  function addDemo(cols, row) {
    var hero = document.getElementById('heroCard');
    hero.classList.remove('new'); void hero.offsetWidth; hero.classList.add('new');
    hero.querySelector('.r1').textContent = '最新の診断（' + row[0] + '）';
    hero.querySelector('.r2').textContent = row[row.length - 2] || row[1];
    hero.querySelector('.r3').textContent = '提案：' + row[row.length - 1];
  }
"""

ARCH_BODY = {"dashboard": body_dashboard, "calendar": body_calendar, "pos": body_pos,
             "gauge": body_gauge, "chat": body_chat, "diagnostic": body_diagnostic}
ARCH_JS = {"dashboard": DASHBOARD_JS, "calendar": CALENDAR_JS, "pos": POS_JS,
           "gauge": GAUGE_JS, "chat": CHAT_JS, "diagnostic": DIAGNOSTIC_JS}


def build_proto_html(pl, ik):
    p = pl["proto"]
    arch = p.get("archetype", "dashboard")
    scheme = INDUSTRY_SCHEME[ik]
    css = BASE_CSS + ARCH_CSS.get(arch, TABLE_CSS)
    body = ARCH_BODY.get(arch, body_dashboard)(pl, p)
    js_fn = ARCH_JS.get(arch, DASHBOARD_JS)
    demo_row_json = json.dumps(p["demoRow"], ensure_ascii=False)
    demo_cols_json = json.dumps(p["tableCols"], ensure_ascii=False)
    toast = esc(p["demoToast"])
    return f'''<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PROTOTYPE {pl["no"]:02d} {esc(p["screenTitle"])} | {esc(INDUSTRY_LABEL[ik])} 改善計画10選</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>{css.replace("__SCHEME__", scheme)}</style></head>
<body>
<header>
  <span><span class="badge">PROTOTYPE No.{pl["no"]:02d}</span><span class="arch">{esc(ARCH_LABEL.get(arch, ""))}</span>　{esc(INDUSTRY_LABEL[ik])}／{esc(pl["category"]["name"])}</span>
  <span><a href="plan-{pl["no"]:02d}.html">📄 事業計画書を見る</a>　<a href="../index.html">← 10選トップ</a></span>
</header>
<main>
  <h1>{esc(p["screenTitle"])}</h1>
  <p class="sub">{esc(pl["title"])} — 導入イメージを体験できる試作モックアップ（表示データはすべてデモ用の架空データ）</p>
  {body}
  <div class="actions"><button class="demo" onclick="runDemo()">▶ {esc(p["demoLabel"])}</button></div>
  <div class="disclaimer">本画面は導入イメージを共有するための試作プロトタイプであり、実際の製品・サービスではありません。
  表示されている数値・名前はすべて架空のデモデータです。導入時は各ベンダーの実製品をご確認ください。</div>
</main>
<div class="toast" id="toast"></div>
<script>
  var demoRow = {demo_row_json};
  var demoCols = {demo_cols_json};
  var demoUsed = 0;
  {js_fn}
  function runDemo() {{
    addDemo(demoCols, demoRow);
    demoUsed++;
    var toast = document.getElementById('toast');
    toast.textContent = '{toast}' + (demoUsed > 1 ? '（' + demoUsed + '回目）' : '');
    toast.classList.add('show');
    clearTimeout(window.__toastTimer);
    window.__toastTimer = setTimeout(function () {{ toast.classList.remove('show'); }}, 2600);
  }}
</script>
</body></html>'''


def main():
    industries = sys.argv[1:]
    if not industries:
        pdir = os.path.join(DATA, "plans")
        industries = [f[:-5] for f in os.listdir(pdir) if f.endswith(".json")] if os.path.isdir(pdir) else []
    for ik in industries:
        with open(os.path.join(DATA, "plans", ik + ".json"), encoding="utf-8") as f:
            plans = json.load(f)
        outdir = os.path.join(IMPROVEMENT, ik)
        os.makedirs(outdir, exist_ok=True)
        for pl in plans:
            out = os.path.join(outdir, f"proto-{pl['no']:02d}-{pl['slug']}.html")
            with open(out, "w", encoding="utf-8") as f:
                f.write(build_proto_html(pl, ik))
        print(f"OK: {ik} -> {len(plans)} prototypes")


if __name__ == "__main__":
    main()

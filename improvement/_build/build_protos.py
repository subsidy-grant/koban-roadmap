# -*- coding: utf-8 -*-
"""data/plans/{industry}.json の proto 設定から試作プロトタイプ proto-NN-<slug>.html を生成する。

自己完結（CSS/JSインライン・CDNなし）のダッシュボード型モックアップ。
KPIタイル4枚＋メインテーブル＋サイドパネル＋デモボタン（1操作で行追加＋トースト表示）。
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

CSS = """
  :root{--bg:#f7f5f2;--card:#fff;--ink:#26221e;--sub:#6f675e;--line:#e5dfd7;--accent:__SCHEME__;--green:#3e6b4f;--gold:#b98a2f;--red:#a4453c}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI",sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}
  header{background:var(--ink);color:#f5efe6;padding:14px 22px;display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap}
  header .badge{background:var(--accent);color:#fff;font-size:11px;font-weight:700;border-radius:99px;padding:3px 12px}
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
  table{width:100%;border-collapse:collapse;font-size:0.83rem}
  th{text-align:left;font-size:0.7rem;color:var(--sub);padding:6px 8px;border-bottom:2px solid var(--line);white-space:nowrap}
  td{padding:7px 8px;border-bottom:1px solid var(--line)}
  tr:last-child td{border-bottom:none}
  tr.new{background:#f3efe7;animation:flash 1.4s ease}
  @keyframes flash{from{background:#e9dfc8}to{background:#f3efe7}}
  .side ul{list-style:none}
  .side li{padding:7px 0 7px 20px;position:relative;font-size:0.82rem;border-bottom:1px dashed var(--line)}
  .side li:last-child{border-bottom:none}
  .side li::before{content:"●";position:absolute;left:4px;color:var(--accent);font-size:8px;top:12px}
  .actions{margin:18px 0;display:flex;gap:10px;flex-wrap:wrap}
  button.demo{font:inherit;font-weight:700;background:var(--accent);color:#fff;border:none;border-radius:10px;padding:11px 22px;cursor:pointer;font-size:0.9rem}
  button.demo:hover{opacity:0.9}
  .toast{position:fixed;bottom:24px;left:50%%;transform:translateX(-50%) translateY(80px);background:var(--ink);color:#f5efe6;padding:12px 22px;border-radius:10px;font-size:0.85rem;transition:transform .3s ease;z-index:99;max-width:90vw}
  .toast.show{transform:translateX(-50%) translateY(0)}
  .disclaimer{margin-top:26px;font-size:0.72rem;color:var(--sub);border-top:1px solid var(--line);padding-top:12px}
"""


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_proto_html(pl, ik):
    p = pl["proto"]
    scheme = INDUSTRY_SCHEME[ik]
    kpis = "".join(
        f'<div class="kpi"><div class="k">{esc(k)}</div><div class="v">{esc(v)}</div><div class="d">{esc(d)}</div></div>'
        for k, v, d in p["kpis"])
    thead = "".join(f"<th>{esc(c)}</th>" for c in p["tableCols"])
    rows = "".join("<tr>" + "".join(f"<td>{esc(c)}</td>" for c in r) + "</tr>" for r in p["rows"])
    side = "".join(f"<li>{esc(i)}</li>" for i in p["sideItems"])
    demo_row_json = json.dumps(p["demoRow"], ensure_ascii=False)
    toast = esc(p["demoToast"])
    return f'''<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PROTOTYPE {pl["no"]:02d} {esc(p["screenTitle"])} | {esc(INDUSTRY_LABEL[ik])} 改善計画60選</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&display=swap" rel="stylesheet">
<style>{CSS.replace("__SCHEME__", scheme)}</style></head>
<body>
<header>
  <span><span class="badge">PROTOTYPE No.{pl["no"]:02d}</span>　{esc(INDUSTRY_LABEL[ik])}／{esc(pl["category"]["name"])}</span>
  <span><a href="plan-{pl["no"]:02d}.html">📄 事業計画書を見る</a>　<a href="../index.html">← 60選トップ</a></span>
</header>
<main>
  <h1>{esc(p["screenTitle"])}</h1>
  <p class="sub">{esc(pl["title"])} — 導入イメージを体験できる試作モックアップ（表示データはすべてデモ用の架空データ）</p>
  <div class="kpis">{kpis}</div>
  <div class="grid">
    <div class="panel">
      <h2>{esc(p["tableTitle"])}</h2>
      <table><thead><tr>{thead}</tr></thead><tbody id="mainTable">{rows}</tbody></table>
    </div>
    <div class="panel side">
      <h2>{esc(p["sideTitle"])}</h2>
      <ul>{side}</ul>
    </div>
  </div>
  <div class="actions"><button class="demo" onclick="runDemo()">▶ {esc(p["demoLabel"])}</button></div>
  <div class="disclaimer">本画面は導入イメージを共有するための試作プロトタイプであり、実際の製品・サービスではありません。
  表示されている数値・名前はすべて架空のデモデータです。導入時は各ベンダーの実製品をご確認ください。</div>
</main>
<div class="toast" id="toast"></div>
<script>
  var demoRow = {demo_row_json};
  var demoUsed = 0;
  function runDemo() {{
    var tbody = document.getElementById('mainTable');
    var tr = document.createElement('tr');
    tr.className = 'new';
    demoRow.forEach(function (c) {{
      var td = document.createElement('td');
      td.textContent = c;
      tr.appendChild(td);
    }});
    tbody.insertBefore(tr, tbody.firstChild);
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

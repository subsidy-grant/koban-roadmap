# -*- coding: utf-8 -*-
"""improvement/index.html（ハブページ）を生成する。

data/plans/{industry}.json が存在する業種は10プランのカード（事業計画書・プロトタイプへの
リンク付き）を、まだ存在しない業種は「準備中」を表示する。
実行: python3 build_hub.py（冪等）
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

INDUSTRY_ORDER = ["beauty", "food", "lodging", "manufacturing", "realestate", "education"]

CSS = """
  :root { --paper:#eef0ea; --paper-raised:#f8f9f4; --ink:#1b2420; --ink-soft:#4a564d;
    --ink-faint:#7c8880; --accent:#a8752f; --accent-wash:#f2e9d6; --sage:#5f7360;
    --sage-wash:#e2e8de; --rust:#9c5539; --line:#d5cfbf; }
  @media (prefers-color-scheme: dark) { :root { --paper:#12181a; --paper-raised:#182020;
    --ink:#ece8e0; --ink-soft:#b7bdb0; --ink-faint:#838f83; --accent:#dcab5c;
    --accent-wash:#2b2313; --sage:#93a88d; --sage-wash:#202823; --rust:#d1937a; --line:#2c342e; } }
  :root[data-theme="dark"] { --paper:#12181a; --paper-raised:#182020; --ink:#ece8e0;
    --ink-soft:#b7bdb0; --ink-faint:#838f83; --accent:#dcab5c; --accent-wash:#2b2313;
    --sage:#93a88d; --sage-wash:#202823; --rust:#d1937a; --line:#2c342e; }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); line-height:1.8;
    font-family:"Noto Sans JP","Yu Gothic Medium","Hiragino Sans","Meiryo",sans-serif; }
  main { max-width:960px; margin:0 auto; padding:2.5rem 1.5rem 4rem; }
  h1 { font-size:1.6rem; margin:0 0 0.4rem; }
  .sub { color:var(--ink-soft); font-size:0.9rem; }
  .back { font-size:0.85rem; }
  a { color:var(--accent); }
  .tabs { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1.5rem 0 0; }
  .tabs button { font:inherit; font-size:0.86rem; font-weight:600; padding:0.45rem 1rem;
    border:1px solid var(--line); border-radius:100px; background:var(--paper-raised);
    color:var(--ink-soft); cursor:pointer; }
  .tabs button.active { background:var(--accent-wash); border-color:var(--accent); color:var(--accent); }
  .tabs button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  section.ind { display:none; margin-top:1.5rem; }
  section.ind.active { display:block; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:0.9rem; }
  .card { background:var(--paper-raised); border:1px solid var(--line); border-radius:8px;
    padding:1rem 1.2rem; display:flex; flex-direction:column; gap:0.35rem; }
  .card .no { font-size:0.7rem; font-weight:700; color:var(--accent); letter-spacing:0.05em; }
  .card .ttl { font-weight:600; font-size:0.95rem; line-height:1.5; }
  .card .meta { font-size:0.76rem; color:var(--ink-faint); }
  .card .links { margin-top:auto; padding-top:0.6rem; display:flex; gap:1rem; font-size:0.82rem; }
  .pending { background:var(--paper-raised); border:1px dashed var(--line); border-radius:8px;
    padding:2rem; text-align:center; color:var(--ink-faint); font-size:0.9rem; }
  .note { font-size:0.78rem; color:var(--ink-faint); margin-top:2.5rem; }
"""

PROGRAM_LABEL = {
    "ai": "デジタル化・AI導入補助金", "jizoku": "小規模事業者持続化補助金",
    "kaizen": "業務改善助成金", "shoryokuka": "中小企業省力化投資補助金",
    "career": "キャリアアップ助成金", "jinzai": "人材開発支援助成金",
    "food_labor": "飲食業労働生産性向上支援補助金", "kanko_shoryokuka": "観光庁 省力化投資補助事業",
    "monodukuri": "新事業進出・ものづくり商業サービス補助金", "akiya": "空き家対策モデル事業",
}


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def main():
    with open(os.path.join(DATA, "industries.json"), encoding="utf-8") as f:
        data = json.load(f)
    labels = {ik: data["INDUSTRIES"][ik]["label"] for ik in INDUSTRY_ORDER}

    plans = {}
    for ik in INDUSTRY_ORDER:
        p = os.path.join(DATA, "plans", ik + ".json")
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                plans[ik] = json.load(f)

    parts = []
    parts.append('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    parts.append("<title>業種別・改善計画 厳選10選 | 補助金活用 業務改善ロードマップ</title>")
    parts.append('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">')
    parts.append("<style>" + CSS + "</style></head><body><main>")
    parts.append('<p class="back"><a href="../index.html">← ロードマップ本体へ</a> ／ <a href="pdca.html">選定の考え方（スコアリング全記録）</a></p>')
    parts.append("<h1>業種別・改善計画 厳選10選</h1>")
    parts.append('<p class="sub">6業種×100施策（計600施策）を費用対効果・業務改善効率でスコアリングし、各業種10案に厳選。'
                 "各案には <strong>A4×10ページの事業計画書</strong> と、導入するシステムの<strong>試作プロトタイプ</strong>が付属します。"
                 '選定プロセスは<a href="pdca.html">こちら</a>で全公開しています。</p>')

    parts.append('<div class="tabs" role="tablist">')
    for i, ik in enumerate(INDUSTRY_ORDER):
        cls = ' class="active"' if i == 0 else ""
        parts.append(f'<button{cls} data-ind="{ik}" onclick="showInd(\'{ik}\')">{esc(labels[ik])}</button>')
    parts.append("</div>")

    for i, ik in enumerate(INDUSTRY_ORDER):
        cls = "ind active" if i == 0 else "ind"
        parts.append(f'<section class="{cls}" id="ind-{ik}">')
        if ik in plans:
            parts.append('<div class="cards">')
            for pl in plans[ik]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["subsidy"]["key"], pl["subsidy"]["key"])
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="card">')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"]["name"])}｜概算 {pl["investment"]["total"]}{esc(pl["investment"]["unit"])}｜{esc(prog)}</div>')
                parts.append(f'<div class="links"><a href="{ik}/plan-{no:02d}.html">📄 事業計画書（A4×10p）</a>'
                             f'<a href="{ik}/{proto_file}">🖥 プロトタイプ</a></div>')
                parts.append("</div>")
            parts.append("</div>")
        else:
            parts.append('<div class="pending">この業種の10案は準備中です。スコアリング（候補評価）は'
                         '<a href="pdca.html">選定の考え方</a>で先行公開しています。</div>')
        parts.append("</section>")

    parts.append('<p class="note">本コンテンツは公開情報に基づくモデルケースの試算・提案であり、個別事業者への効果や補助金の採択を保証するものではありません。'
                 "申請にあたっては必ず各制度の公式サイト・公募要領をご確認ください。</p>")
    parts.append("""
<script>
  function showInd(key) {
    document.querySelectorAll('section.ind').forEach(function (s) { s.classList.toggle('active', s.id === 'ind-' + key); });
    document.querySelectorAll('.tabs button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-ind') === key); });
  }
  (function () {
    var m = location.search.match(/[?&]industry=(\\w+)/);
    if (m && document.getElementById('ind-' + m[1])) showInd(m[1]);
  })();
</script>
</main></body></html>""")

    out = os.path.join(IMPROVEMENT, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    print(f"OK: hub -> {out} (plans built: {sorted(plans.keys()) or 'none'})")


if __name__ == "__main__":
    main()

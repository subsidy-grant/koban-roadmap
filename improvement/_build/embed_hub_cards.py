# -*- coding: utf-8 -*-
"""本体サイト index.html の「03 業種別・改善計画 厳選10選」セクションに、
improvement/index.html と同じタブ切替＋カード一覧をそのまま埋め込む（リンクのみ表示ではなく全表示）。
data/plans/{industry}.json または data/external/{industry}.json を業種ごとに参照する
（build_hub.py・score.py と同じソース／同じ EXTERNAL_INDUSTRIES 判定）。
マーカーコメントで置換するため冪等。
実行: python3 embed_hub_cards.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MAIN_HTML = os.path.join(ROOT, "index.html")

INDUSTRY_ORDER = ["beauty", "food", "lodging", "manufacturing", "realestate", "education"]
EXTERNAL_INDUSTRIES = {"beauty"}

PROGRAM_LABEL = {
    "ai": "デジタル化・AI導入補助金", "jizoku": "小規模事業者持続化補助金",
    "kaizen": "業務改善助成金", "shoryokuka": "中小企業省力化投資補助金",
    "career": "キャリアアップ助成金", "jinzai": "人材開発支援助成金",
    "food_labor": "飲食業労働生産性向上支援補助金", "kanko_shoryokuka": "観光庁 省力化投資補助事業",
    "monodukuri": "新事業進出・ものづくり商業サービス補助金", "akiya": "空き家対策モデル事業",
}

START = "  <!-- IMPROVEMENT_HUB_EMBED:START (embed_hub_cards.py で自動生成、手編集しないこと) -->"
END = "  <!-- IMPROVEMENT_HUB_EMBED:END -->"

CSS = """
<style>
  #improvement-cta .imp10-tabs { display:flex; flex-wrap:wrap; gap:0.5rem; margin:1.3rem 0 0; }
  #improvement-cta .imp10-tabs button { font:inherit; font-size:0.86rem; font-weight:600; padding:0.45rem 1rem;
    border:1px solid var(--line); border-radius:100px; background:var(--paper-raised);
    color:var(--ink-soft); cursor:pointer; }
  #improvement-cta .imp10-tabs button.active { background:var(--accent-wash); border-color:var(--accent); color:var(--accent); }
  #improvement-cta .imp10-tabs button:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  #improvement-cta .imp10-panel { display:none; margin-top:1rem; }
  #improvement-cta .imp10-panel.active { display:block; }
  #improvement-cta .imp10-note { font-size:0.82rem; color:var(--ink-soft); margin:0 0 0.8rem; }
  #improvement-cta .imp10-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:0.8rem; }
  #improvement-cta .imp10-card { background:var(--paper-raised); border:1px solid var(--line); border-radius:8px;
    padding:0.9rem 1.1rem; display:flex; flex-direction:column; gap:0.35rem; box-shadow:0 1px 2px var(--shadow); }
  #improvement-cta .imp10-card .no { font-size:0.7rem; font-weight:700; color:var(--accent); letter-spacing:0.05em; }
  #improvement-cta .imp10-card .ttl { font-weight:600; font-size:0.92rem; line-height:1.5; }
  #improvement-cta .imp10-card .meta { font-size:0.75rem; color:var(--ink-faint); }
  #improvement-cta .imp10-card .links { margin-top:auto; padding-top:0.55rem; display:flex; gap:0.9rem; font-size:0.8rem; }
  #improvement-cta .imp10-pending { background:var(--paper-raised); border:1px dashed var(--line); border-radius:8px;
    padding:1.6rem; text-align:center; color:var(--ink-faint); font-size:0.88rem; }
</style>
"""


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_fragment():
    with open(os.path.join(DATA, "industries.json"), encoding="utf-8") as f:
        data = json.load(f)
    labels = {ik: data["INDUSTRIES"][ik]["label"] for ik in INDUSTRY_ORDER}

    plans, external = {}, {}
    for ik in INDUSTRY_ORDER:
        ep = os.path.join(DATA, "external", ik + ".json")
        if ik in EXTERNAL_INDUSTRIES and os.path.exists(ep):
            with open(ep, encoding="utf-8") as f:
                external[ik] = json.load(f)
            continue
        p = os.path.join(DATA, "plans", ik + ".json")
        if os.path.exists(p):
            with open(p, encoding="utf-8") as f:
                plans[ik] = json.load(f)

    parts = [CSS]
    parts.append('<div class="imp10-tabs" role="tablist">')
    for i, ik in enumerate(INDUSTRY_ORDER):
        cls = " active" if i == 0 else ""
        parts.append(f'<button class="{cls.strip()}" data-imp10-ind="{ik}" onclick="showImp10Tab(\'{ik}\')">{esc(labels[ik])}</button>')
    parts.append("</div>")

    for i, ik in enumerate(INDUSTRY_ORDER):
        cls = "imp10-panel active" if i == 0 else "imp10-panel"
        parts.append(f'<div class="{cls}" id="imp10-{ik}">')
        if ik in external:
            ext = external[ik]
            parts.append(f'<p class="imp10-note">{esc(ext.get("sourceNote", ""))}</p>')
            parts.append('<div class="imp10-cards">')
            for pl in ext["plans"]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["schemeKey"], pl["schemeKey"])
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="imp10-card">')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"])}｜概算 {esc(pl["investmentTotal"])}（補助率{esc(pl["rate"])}）｜{esc(prog)}</div>')
                parts.append(f'<div class="links"><a class="src-link" href="improvement/{ik}/plan-{no:02d}.html">📄 事業計画書</a>'
                             f'<a class="src-link" href="improvement/{ik}/{proto_file}">🖥 プロトタイプ</a></div>')
                parts.append("</div>")
            parts.append("</div>")
        elif ik in plans:
            parts.append('<div class="imp10-cards">')
            for pl in plans[ik]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["subsidy"]["key"], pl["subsidy"]["key"])
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="imp10-card">')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"]["name"])}｜概算 {pl["investment"]["total"]}{esc(pl["investment"]["unit"])}｜{esc(prog)}</div>')
                parts.append(f'<div class="links"><a class="src-link" href="improvement/{ik}/plan-{no:02d}.html">📄 事業計画書</a>'
                             f'<a class="src-link" href="improvement/{ik}/{proto_file}">🖥 プロトタイプ</a></div>')
                parts.append("</div>")
            parts.append("</div>")
        else:
            parts.append('<div class="imp10-pending">この業種の10案は準備中です。スコアリング（候補評価）は'
                         '<a href="improvement/pdca.html">選定の考え方</a>で先行公開しています。</div>')
        parts.append("</div>")

    parts.append("""
<script>
  function showImp10Tab(key) {
    document.querySelectorAll('#improvement-cta .imp10-panel').forEach(function (s) { s.classList.toggle('active', s.id === 'imp10-' + key); });
    document.querySelectorAll('#improvement-cta .imp10-tabs button').forEach(function (b) { b.classList.toggle('active', b.getAttribute('data-imp10-ind') === key); });
  }
</script>""")
    return "\n".join(parts)


def main():
    fragment = build_fragment()
    block = f"{START}\n{fragment}\n{END}"

    with open(MAIN_HTML, encoding="utf-8") as f:
        html = f.read()

    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if pattern.search(html):
        html = pattern.sub(lambda m: block, html, count=1)
    else:
        marker = '<p style="margin-top:0.8rem;"><a class="src-link" href="improvement/">改善計画10選を見る ↗</a>　<a class="src-link" href="improvement/pdca.html">選定の考え方（スコアリング全記録）↗</a></p>'
        if marker not in html:
            raise SystemExit("insertion marker not found in index.html (#improvement-cta CTA paragraph)")
        html = html.replace(marker, marker + "\n" + block, 1)

    with open(MAIN_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"OK: hub cards embedded -> {MAIN_HTML}")


if __name__ == "__main__":
    main()

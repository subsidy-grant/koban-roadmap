# -*- coding: utf-8 -*-
"""本体サイト index.html の「03 業種別・改善計画 厳選10選」セクションに、
improvement/index.html と同じカード一覧をそのまま埋め込む（リンクのみ表示ではなく全表示）。
業種ごとに1枚ずつパネルを作るが、業種タブ自体は持たない（2026-08-05に廃止。
ページ冒頭の業種選択と二重表示になっていたため）。表示する1枚は本体側の
renderIndustryChrome() が showImp10Tab(key) を呼んで切り替える。
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
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))
MAIN_HTML = os.path.join(ROOT, "index.html")

INDUSTRY_ORDER = ["beauty", "food", "lodging", "manufacturing", "realestate", "education"]
EXTERNAL_INDUSTRIES = {"beauty"}

ICON_RULES = [
    (("予約", "顧客"), "📅"), (("集客", "マーケティング", "MEO", "口コミ"), "📣"),
    (("会計", "キャッシュレス", "バックオフィス"), "💳"), (("カウンセリング", "接客", "カルテ"), "🧑‍🤝‍🧑"),
    (("機器", "設備", "施術"), "🛠️"), (("SNS", "動画"), "🎬"), (("在庫", "発注", "商材"), "📦"),
    (("人材", "教育", "研修", "シフト", "労務"), "🎓"), (("衛生", "清掃"), "🧼"),
    (("経営", "分析", "多店舗"), "📊"), (("物販", "EC"), "🛍️"), (("価格",), "💰"),
    (("インバウンド", "多言語"), "🌐"), (("リピート",), "🔁"),
]


def category_icon(text):
    for keys, icon in ICON_RULES:
        if any(k in text for k in keys):
            return icon
    return "✨"


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
  #improvement-cta .imp10-panel { display:none; margin-top:1rem; }
  #improvement-cta .imp10-panel.active { display:block; }
  #improvement-cta .imp10-note { font-size:0.82rem; color:var(--ink-soft); margin:0 0 0.8rem; }
  #improvement-cta .imp10-cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(270px,1fr)); gap:0.8rem; }
  #improvement-cta .imp10-card { background:var(--paper-raised); border:1px solid var(--line); border-radius:8px;
    padding:0.9rem 1.1rem; display:flex; flex-direction:column; gap:0.35rem; box-shadow:0 1px 2px var(--shadow); }
  #improvement-cta .imp10-card .thumb { height:110px; border-radius:6px; overflow:hidden; margin-bottom:0.2rem; }
  #improvement-cta .imp10-card .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  #improvement-cta .imp10-card .thumb-icon { width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    font-size:2.1rem; background:linear-gradient(135deg, var(--accent-wash), var(--paper)); }
  #improvement-cta .imp10-card .no { font-size:0.7rem; font-weight:700; color:var(--accent); letter-spacing:0.05em; }
  #improvement-cta .imp10-card .ttl { font-weight:600; font-size:0.92rem; line-height:1.5; }
  #improvement-cta .imp10-card .meta { font-size:0.75rem; color:var(--ink-faint); }
  #improvement-cta .imp10-card .links { margin-top:auto; padding-top:0.55rem; display:flex; gap:0.9rem; font-size:0.8rem; }
  #improvement-cta .imp10-pending { background:var(--paper-raised); border:1px dashed var(--line); border-radius:8px;
    padding:1.6rem; text-align:center; color:var(--ink-faint); font-size:0.88rem; }

  /* 可読性・操作性の下限（2026-07-29／本体 index.html と同じ方針） */
  #improvement-cta .imp10-note { font-size:0.9rem; }
  #improvement-cta .imp10-card .no { font-size:0.8rem; }
  #improvement-cta .imp10-card .ttl { font-size:1rem; }
  #improvement-cta .imp10-card .meta { font-size:0.87rem; }
  #improvement-cta .imp10-card .links { font-size:0.9rem; }
  #improvement-cta .imp10-card .links a { display:inline-flex; align-items:center; min-height:2.6rem; }

  /* スマートフォンでは10枚のカードで約3,400px になり、その先の
     シミュレーターまで届かない。最初は4枚だけ見せ、続きは任意で開く。 */
  #improvement-cta .imp10-more { display:none; }
  @media (max-width:700px) {
    #improvement-cta .imp10-cards:not(.is-expanded) .imp10-card:nth-child(n+5) { display:none; }
    #improvement-cta .imp10-more {
      display:inline-flex; align-items:center; justify-content:center; gap:0.4rem;
      width:100%; min-height:2.9rem; margin-top:0.8rem; padding:0.5rem 1rem;
      font:inherit; font-size:0.95rem; font-weight:700; cursor:pointer;
      border:1px solid var(--accent); border-radius:8px;
      background:var(--paper-raised); color:var(--accent);
    }
  }
</style>
"""

# スマートフォンで5件目以降を開くボタン。狭い画面でだけ表示される（CSSで制御）
MORE_BUTTON = ("<button type=\"button\" class=\"imp10-more\""
               " onclick=\"this.previousElementSibling.classList.add('is-expanded'); this.remove();\">"
               "残りの案も見る（全10案）</button>")


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

    # 業種タブは2026-08-05に廃止（本人指示：ページ冒頭の業種選択と二重になっていた）。
    # パネル自体は業種ごとに作り、表示する1枚を showImp10Tab(key) で切り替える方式は残す。
    # 呼び出し元は本体 index.html 側の renderIndustryChrome()（業種を切り替えるたびに
    # 呼ばれる、既存の「業種依存の表示を揃える」関数）で、タブ操作からは呼ばない。
    parts = [CSS]

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
                # プロトタイプは業種によって未整備（事業計画書だけ先に用意した業種がある）。
                # 無いのにリンクを出すと404になるので、実ファイルの有無で出し分ける。
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="imp10-card">')
                # 実写の写真を最優先（2026-08-02、本人指示でアイコン絵文字から差し替え）。
                # 写真が無い案だけ絵文字アイコンで代替する
                if pl.get("image"):
                    parts.append(f'<div class="thumb"><img src="improvement/{ik}/{pl["image"]}" alt="" loading="lazy" width="640" height="360"></div>')
                elif pl.get("icon"):
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{pl["icon"]}</div></div>')
                else:
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{category_icon(pl["category"])}</div></div>')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"])}｜概算 {esc(pl["investmentTotal"])}（補助率{esc(pl["rate"])}）｜{esc(prog)}</div>')
                proto_link = (f'<a class="src-link" href="improvement/{ik}/{proto_file}">🖥 プロトタイプ</a>'
                              if os.path.exists(os.path.join(IMPROVEMENT, ik, proto_file)) else "")
                parts.append(f'<div class="links"><a class="src-link" href="improvement/{ik}/plan-{no:02d}.html">📄 事業計画書</a>'
                             f'{proto_link}</div>')
                parts.append("</div>")
            parts.append("</div>")
            parts.append(MORE_BUTTON)
        elif ik in plans:
            parts.append('<div class="imp10-cards">')
            for pl in plans[ik]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["subsidy"]["key"], pl["subsidy"]["key"])
                # プロトタイプは業種によって未整備（事業計画書だけ先に用意した業種がある）。
                # 無いのにリンクを出すと404になるので、実ファイルの有無で出し分ける。
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="imp10-card">')
                # 実写の写真を最優先（2026-08-02、本人指示で絵文字から差し替え）。
                # plans/*.json は build_plan_data.py の生成物で直接編集できないため、
                # improvement/{ik}/img10/plan-NN.jpg が実在するかで出し分ける
                img_file = os.path.join(IMPROVEMENT, ik, "img10", f"plan-{no:02d}.jpg")
                if os.path.exists(img_file):
                    parts.append(f'<div class="thumb"><img src="improvement/{ik}/img10/plan-{no:02d}.jpg" alt="" loading="lazy" width="640" height="360"></div>')
                else:
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{category_icon(pl["category"]["name"])}</div></div>')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"]["name"])}｜概算 {pl["investment"]["total"]}{esc(pl["investment"]["unit"])}｜{esc(prog)}</div>')
                proto_link = (f'<a class="src-link" href="improvement/{ik}/{proto_file}">🖥 プロトタイプ</a>'
                              if os.path.exists(os.path.join(IMPROVEMENT, ik, proto_file)) else "")
                parts.append(f'<div class="links"><a class="src-link" href="improvement/{ik}/plan-{no:02d}.html">📄 事業計画書</a>'
                             f'{proto_link}</div>')
                parts.append("</div>")
            parts.append("</div>")
            parts.append(MORE_BUTTON)
        else:
            parts.append('<div class="imp10-pending">この業種の「改善計画10選」(事業計画書・プロトタイプ)は準備中です。'
                         '準備段階の評価として、'
                         f'<a href="improvement/{ik}/pdca.html">{esc(labels[ik])}×AI 1000案の評価ボード(採択候補TOP10つき)</a>'
                         'を公開しています。</div>')
        parts.append("</div>")

    parts.append("""
<script>
  function showImp10Tab(key) {
    document.querySelectorAll('#improvement-cta .imp10-panel').forEach(function (s) { s.classList.toggle('active', s.id === 'imp10-' + key); });
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
        marker = ('<p style="margin-top:0.8rem;"><a class="src-link" href="improvement/">改善計画10選を見る ↗</a>　'
                  '<a class="src-link" id="pdcaBoardLink" href="improvement/beauty/pdca.html">'
                  '全1000案のPDCAファネル・一覧を見る（美容業版）↗</a></p>')
        if marker not in html:
            raise SystemExit("insertion marker not found in index.html (#improvement-cta CTA paragraph)")
        html = html.replace(marker, marker + "\n" + block, 1)

    with open(MAIN_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"OK: hub cards embedded -> {MAIN_HTML}")


if __name__ == "__main__":
    main()

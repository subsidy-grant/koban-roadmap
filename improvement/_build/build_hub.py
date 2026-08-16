# -*- coding: utf-8 -*-
"""improvement.html（ハブページ）をサイトのルート直下に生成する。

data/plans/{industry}.json が存在する業種は10プランのカード（事業計画書・プロトタイプへの
リンク付き）を、まだ存在しない業種は「準備中」を表示する。
data/external/{industry}.json が存在する業種は、本サイトの100施策スコアリングではなく
外部プロジェクト（別セッションで作成した事業計画書一式）を優先して表示する
（現状: beauty = beauty-ai-factory との統合）。
実行: python3 build_hub.py（冪等）

出力先について（2026-08-16に変更）:
  以前は improvement/index.html に出していたが、下部タブバー（app_tabbar.js）が
  location.pathname のファイル名だけを見る実装のため、サブディレクトリに置くと
  「探す」タブが自分自身を指して誤点灯する。ルート直下に出すことで他ページと
  同じ階層になり、タブバーをそのまま載せられる。
  これに伴い、カード内のリンクは "improvement/{業種}/..." とルート基準で組み立てる。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
# 生成物はルート直下に置くので、カード内のリンクはこの接頭辞を付ける
LINK_PREFIX = "improvement/"

INDUSTRY_ORDER = ["beauty", "food", "lodging", "manufacturing", "realestate", "education"]

# 100施策スコアリングの代わりに外部プロジェクトの10案を採用する業種
EXTERNAL_INDUSTRIES = {"beauty"}

CSS = """
  /* 配色・書体はサイト共通のデザインシステム（design.md）に合わせる。applications.htmlと同じ値。
     以前は独自の茶系配色(--accent:#845818)だったが、本体サイトが2026-08-15に
     コバルト×オレンジ×ミント配色に統一されたのに合わせ、このページも揃えた（2026-08-16）。 */
  :root {
    --paper: #eaf1fb; --paper-raised: #ffffff; --ink: #0c2036; --ink-soft: #3a5170;
    --ink-faint: #4d6a8a; --accent: #0057c2; --accent-soft: #bcd7f7; --accent-wash: #e2edfb;
    --on-accent: #ffffff; --sage: #0d8a6e; --sage-wash: #dcf5ee; --rust: #d84315;
    --rust-wash: #fde3d6; --line: #a9c2e0; --shadow: rgba(12, 32, 54, 0.12);
    --radius-sm: 6px; --radius-md: 10px; --radius-lg: 16px; --shadow-btn: 0 2px 4px var(--shadow);
  }
  @media (prefers-color-scheme: dark) {
    :root { --paper: #081422; --paper-raised: #16283d; --ink: #eaf1fb; --ink-soft: #b7cbe4;
      --ink-faint: #93abc9; --accent: #5b9df5; --accent-soft: #1c3454; --accent-wash: #142640;
      --on-accent: #0d1218; --sage: #3fd6ac; --sage-wash: #0f2b24; --rust: #ff8a5c;
      --rust-wash: #33200f; --line: #385578; --shadow: rgba(0, 0, 0, 0.5); }
  }
  :root[data-theme="dark"] {
    --paper: #081422; --paper-raised: #16283d; --ink: #eaf1fb; --ink-soft: #b7cbe4;
    --ink-faint: #93abc9; --accent: #5b9df5; --accent-soft: #1c3454; --accent-wash: #142640;
    --on-accent: #0d1218; --sage: #3fd6ac; --sage-wash: #0f2b24; --rust: #ff8a5c;
    --rust-wash: #33200f; --line: #385578; --shadow: rgba(0, 0, 0, 0.5);
  }
  :root[data-theme="light"] {
    --paper: #eaf1fb; --paper-raised: #ffffff; --ink: #0c2036; --ink-soft: #3a5170;
    --ink-faint: #4d6a8a; --accent: #0057c2; --accent-soft: #bcd7f7; --accent-wash: #e2edfb;
    --on-accent: #ffffff; --sage: #0d8a6e; --sage-wash: #dcf5ee; --rust: #d84315;
    --rust-wash: #fde3d6; --line: #a9c2e0; --shadow: rgba(12, 32, 54, 0.12);
  }
  * { box-sizing:border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); line-height:1.8;
    font-family: "BIZ UDPGothic","BIZ UDGothic","Noto Sans JP","Yu Gothic Medium","Hiragino Sans","Meiryo",sans-serif;
    -webkit-font-smoothing: antialiased; }
  main { max-width:960px; margin:0 auto; padding:2.5rem 1.5rem 4rem; }
  h1 { font-size:1.6rem; margin:0 0 0.4rem; }
  .sub { color:var(--ink-soft); font-size:0.9rem; }
  .back { font-size:0.85rem; }
  a { color:var(--accent); }
  /* 業種の選択。以前は横並びのボタン(.tabs)だったが、「探す」ページ(index.html)と
     同じプルダウンに統一した（本人指示、2026-08-16）。見た目も.hero-industryに合わせる。 */
  .ind-picker { background:var(--accent-wash); border:1px solid var(--accent-soft);
    border-radius:var(--radius-md); padding:1rem 1.1rem; margin:1.2rem 0 0;
    display:flex; flex-wrap:wrap; align-items:center; gap:0.7rem 1.1rem; }
  .ind-picker-lead { margin:0; font-size:0.96rem; color:var(--ink); flex:1 1 240px; }
  .ind-picker select {
    font:inherit; font-size:1rem; font-weight:600; min-height:2.9rem;
    padding:0.5rem 2.2rem 0.5rem 0.8rem; border:1px solid var(--line); border-radius:6px;
    background:var(--paper-raised) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M5 7l5 6 5-6" fill="none" stroke="%234d6a8a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>') no-repeat right 0.7rem center;
    background-size:1rem; color:var(--ink); appearance:none; -webkit-appearance:none; cursor:pointer;
    flex:1 1 260px; max-width:360px;
  }
  /* 夜間は地と枠のコントラストが落ちて入力欄に見えにくいので、枠だけ一段強める */
  @media (prefers-color-scheme: dark) { .ind-picker select { border-color:var(--accent-soft); } }
  :root[data-theme="dark"] .ind-picker select { border-color:var(--accent-soft); }
  .ind-picker select:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
  .sr-only { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; }
  @media (max-width:480px) { .ind-picker select { max-width:none; width:100%; } }
  /* ページ末尾に置く但し書き（もとはタイトル直下にあった長文、2026-08-16に移動） */
  .lede-foot { margin-top:2.5rem; padding-top:1.2rem; border-top:1px solid var(--line);
    color:var(--ink-soft); font-size:0.9rem; }
  section.ind { display:none; margin-top:1.5rem; }
  section.ind.active { display:block; }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:0.9rem; }
  .card { background:var(--paper-raised); border:1px solid var(--line); border-radius:var(--radius-md);
    padding:1rem 1.2rem; display:flex; flex-direction:column; gap:0.35rem; box-shadow: var(--shadow-btn); }
  .card .thumb { height:110px; border-radius:6px; overflow:hidden; margin-bottom:0.2rem; }
  .card .thumb img { width:100%; height:100%; object-fit:cover; display:block; }
  .card .thumb-icon { width:100%; height:100%; display:flex; align-items:center; justify-content:center;
    font-size:2.1rem; background:linear-gradient(135deg, var(--accent-wash), var(--paper)); }
  .card .no { font-size:0.7rem; font-weight:700; color:var(--accent); letter-spacing:0.05em; }
  .card .ttl { font-weight:600; font-size:0.95rem; line-height:1.5; }
  .card .meta { font-size:0.76rem; color:var(--ink-faint); }
  /* カード下部のリンク（2026-08-16、絵文字から案9「大きめアイコン」に変更・説明文なし）。
     縦に2本並べ、行全体を押せるようにする。青＝事業計画書、緑＝プロトタイプで役割を色分け。 */
  .card .links { margin-top:auto; padding-top:0.6rem; display:flex; flex-direction:column;
    gap:0.6rem; font-size:0.82rem; }
  .card .links a { gap:0.6rem; width:100%; padding:0.5rem 0.7rem; border-radius:var(--radius-sm);
    background:var(--accent-wash); color:var(--ink); align-items:center; text-decoration:none; }
  .card .links a.proto { background:var(--sage-wash); }
  .card .links a:hover { text-decoration:none; filter:brightness(0.97); }
  .card .links .ic { flex:none; width:34px; height:34px; border-radius:8px;
    display:inline-flex; align-items:center; justify-content:center;
    background:var(--accent); color:var(--on-accent); }
  /* アイコン地は白抜きSVGを載せるので、--sage をそのまま使うとライトで4.31:1しか出ず、
     青側(6.68:1)と比べて弱い。ライトのみ一段暗くして揃える（--sage 自体は他ページ共用なので触らない）。
     ダークの --sage(#3fd6ac) は10.23:1あるので上書きしない。 */
  .card .links a.proto .ic { background:#0b7a61; }
  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) .card .links a.proto .ic { background:var(--sage); }
  }
  :root[data-theme="dark"] .card .links a.proto .ic { background:var(--sage); }
  .card .links svg { width:19px; height:19px; }
  .pending { background:var(--paper-raised); border:1px dashed var(--line); border-radius:var(--radius-md);
    padding:2rem; text-align:center; color:var(--ink-faint); font-size:0.9rem; }
  .note { font-size:0.78rem; color:var(--ink-faint); margin-top:2.5rem; }

  /* 公開版の可読性・操作性の下限（2026-07-29／本体 index.html と同じ方針）
     利用者に50〜80代を想定し、ルート17px・本文まわり14px以上・
     操作要素の当たり判定44px以上・フォーカスの可視化を全体に敷く。 */
  html { font-size:17px; }
  @media (max-width:400px) { html { font-size:16px; } }
  .sub { font-size:1rem; }
  .back, .card .links { font-size:0.92rem; }
  .card .no { font-size:0.8rem; }
  .card .ttl { font-size:1rem; }
  .card .meta, .note { font-size:0.88rem; }
  .tabs button { font-size:0.95rem; min-height:2.6rem; }
  .card .links a { display:inline-flex; align-items:center; min-height:2.6rem; }
  .back { display:flex; flex-wrap:wrap; align-items:center; gap:0 0.4rem; }
  .back a { display:inline-flex; align-items:center; min-height:2.6rem; }
  a:focus-visible, button:focus-visible { outline:3px solid var(--accent); outline-offset:2px; border-radius:3px; }

  /* アプリ風のタップフィードバック（他ページと共通、2026-08-16追加） */
  button, .btn, a.btn-link { transition: transform 0.08s ease, filter 0.08s ease; }
  button:active, .btn:active, a.btn-link:active { transform: scale(0.97); filter: brightness(0.95); }
  @media (prefers-reduced-motion: reduce) { button, .btn, a.btn-link { transition: none; } }
"""

ICON_RULES = [
    (("予約", "顧客"), "📅"), (("集客", "マーケティング", "MEO", "口コミ"), "📣"),
    (("会計", "キャッシュレス", "バックオフィス"), "💳"), (("カウンセリング", "接客", "カルテ"), "🧑‍🤝‍🧑"),
    (("機器", "設備", "施術"), "🛠️"), (("SNS", "動画"), "🎬"), (("在庫", "発注", "商材"), "📦"),
    (("人材", "教育", "研修", "シフト", "労務"), "🎓"), (("衛生", "清掃"), "🧼"),
    (("経営", "分析", "多店舗"), "📊"), (("物販", "EC"), "🛍️"), (("価格"), "💰"),
    (("インバウンド", "多言語"), "🌐"), (("リピート",), "🔁"),
]


# カード下部リンクのアイコン（2026-08-16、絵文字から差し替え）。
# 端末による絵文字の見た目の差をなくすため、インラインSVGで持つ。
SVG_DOC = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
           'stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'
           '<path d="M14 3H7a1.5 1.5 0 0 0-1.5 1.5v15A1.5 1.5 0 0 0 7 21h10a1.5 1.5 0 0 0 1.5-1.5V7.5z"/>'
           '<path d="M14 3v4.5h4.5"/></svg>')
SVG_PROTO = ('<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" '
             'stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">'
             '<rect x="3" y="4.5" width="18" height="12" rx="1.8"/>'
             '<line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="16.5" x2="12" y2="20"/></svg>')


def plan_links_html(href_plan, href_proto):
    """カード下部の2本のリンク。プロトタイプが未整備の業種では第2引数に None が来る。"""
    html = (f'<div class="links"><a href="{href_plan}">'
            f'<span class="ic">{SVG_DOC}</span>事業計画書（A4×10p）</a>')
    if href_proto:
        html += (f'<a class="proto" href="{href_proto}">'
                 f'<span class="ic">{SVG_PROTO}</span>プロトタイプ</a>')
    return html + "</div>"


def category_icon(text):
    for keys, icon in ICON_RULES:
        if isinstance(keys, str):
            keys = (keys,)
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


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def main():
    with open(os.path.join(DATA, "industries.json"), encoding="utf-8") as f:
        data = json.load(f)
    labels = {ik: data["INDUSTRIES"][ik]["label"] for ik in INDUSTRY_ORDER}

    plans = {}
    external = {}
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

    parts = []
    parts.append('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">')
    parts.append('<link rel="manifest" href="manifest.json">')
    parts.append('<meta name="theme-color" content="#0057c2">')
    parts.append('<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">')
    parts.append('<meta name="apple-mobile-web-app-capable" content="yes">')
    parts.append('<meta name="apple-mobile-web-app-title" content="補助金ロードマップ">')
    parts.append("<title>業種別・改善計画 厳選10選 | 補助金活用 業務改善ロードマップ</title>")
    parts.append('<meta name="description" content="美容業・飲食業・宿泊業・製造業・不動産業・教育業の各業種で費用対効果の高い改善計画10案を厳選。事業計画書とプロトタイプ付き。">')
    parts.append('<link rel="canonical" href="https://subsidy-grant.github.io/koban-roadmap/improvement.html">')
    parts.append('<meta name="robots" content="index,follow">')
    parts.append('<link rel="preconnect" href="https://fonts.googleapis.com">')
    parts.append('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
    parts.append('<link href="https://fonts.googleapis.com/css2?family=BIZ+UDPGothic:wght@400;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">')
    parts.append("<style>" + CSS + "</style></head><body><main>")
    # 「← ロードマップ本体へ」は2026-08-16に削除（本人指示）。下部タブバーの
    # 「探す」から戻れるため、ページ上部のリンクは重複していた。
    parts.append("<h1>業種別・改善計画 厳選10選</h1>")

    # 業種の選択。タイトル直下に置き、index.htmlと同じプルダウン形式にする
    # （本人指示、2026-08-16。以前は6個の横並びボタンだった）。
    parts.append('<div class="ind-picker">')
    parts.append('<p class="ind-picker-lead"><strong>業種</strong>を選んでください。</p>')
    parts.append('<label for="indSelect" class="sr-only">業種</label>')
    parts.append('<select id="indSelect" onchange="showInd(this.value)">')
    for ik in INDUSTRY_ORDER:
        parts.append(f'<option value="{ik}">{esc(labels[ik])}</option>')
    parts.append("</select>")
    parts.append("</div>")

    for i, ik in enumerate(INDUSTRY_ORDER):
        cls = "ind active" if i == 0 else "ind"
        parts.append(f'<section class="{cls}" id="ind-{ik}">')
        if ik in external:
            ext = external[ik]
            parts.append(f'<p class="sub" style="margin-top:0;">{esc(ext.get("sourceNote", ""))}</p>')
            parts.append('<div class="cards">')
            for pl in ext["plans"]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["schemeKey"], pl["schemeKey"])
                # プロトタイプは業種によって未整備（事業計画書だけ先に用意した業種がある）。
                # 無いのにリンクを出すと404になるので、実ファイルの有無で出し分ける。
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="card">')
                # 実写の写真を最優先（2026-08-02、本人指示でアイコン絵文字から差し替え）。
                # 写真が無い案だけ絵文字アイコンで代替する。
                # 2026-08-16に修正: iconとimageが両方あるとき、iconを先にチェックして
                # imageが一度も使われない逆順のバグがあった（写真が10件とも設定済みなのに
                # 絵文字しか出ていなかった）。embed_hub_cards.py(旧・index.html埋め込み版)
                # では正しくimage優先だったので、それに合わせた。
                if pl.get("image"):
                    parts.append(f'<div class="thumb"><img src="{LINK_PREFIX}{ik}/{pl["image"]}" alt="" loading="lazy" width="640" height="360"></div>')
                elif pl.get("icon"):
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{pl["icon"]}</div></div>')
                else:
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{category_icon(pl["category"])}</div></div>')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"])}｜概算 {esc(pl["investmentTotal"])}（補助率{esc(pl["rate"])}）｜{esc(prog)}</div>')
                proto_href = (f'{LINK_PREFIX}{ik}/{proto_file}'
                              if os.path.exists(os.path.join(IMPROVEMENT, ik, proto_file)) else None)
                parts.append(plan_links_html(f'{LINK_PREFIX}{ik}/plan-{no:02d}.html', proto_href))
                parts.append("</div>")
            parts.append("</div>")
        elif ik in plans:
            parts.append('<div class="cards">')
            for pl in plans[ik]:
                no = pl["no"]
                prog = PROGRAM_LABEL.get(pl["subsidy"]["key"], pl["subsidy"]["key"])
                # プロトタイプは業種によって未整備（事業計画書だけ先に用意した業種がある）。
                # 無いのにリンクを出すと404になるので、実ファイルの有無で出し分ける。
                proto_file = f'proto-{no:02d}-{pl["slug"]}.html'
                parts.append('<div class="card">')
                # 実写の写真を最優先（2026-08-02、本人指示で絵文字から差し替え）。
                # plans/*.json は build_plan_data.py の生成物で直接編集できないため、
                # improvement/{ik}/img10/plan-NN.jpg が実在するかで出し分ける。
                # 2026-08-16に修正: build_hub.pyにはこの分岐自体が無く、写真が
                # 60枚（5業種×10件）とも一度も使われず絵文字のままだった。
                # embed_hub_cards.py(旧・index.html埋め込み版)の実装に合わせた。
                img_file = os.path.join(IMPROVEMENT, ik, "img10", f"plan-{no:02d}.jpg")
                if os.path.exists(img_file):
                    parts.append(f'<div class="thumb"><img src="{LINK_PREFIX}{ik}/img10/plan-{no:02d}.jpg" alt="" loading="lazy" width="640" height="360"></div>')
                else:
                    parts.append(f'<div class="thumb"><div class="thumb-icon">{category_icon(pl["category"]["name"])}</div></div>')
                parts.append(f'<div class="no">PLAN {no:02d}</div>')
                parts.append(f'<div class="ttl">{esc(pl["title"])}</div>')
                parts.append(f'<div class="meta">{esc(pl["category"]["name"])}｜概算 {pl["investment"]["total"]}{esc(pl["investment"]["unit"])}｜{esc(prog)}</div>')
                proto_href = (f'{LINK_PREFIX}{ik}/{proto_file}'
                              if os.path.exists(os.path.join(IMPROVEMENT, ik, proto_file)) else None)
                parts.append(plan_links_html(f'{LINK_PREFIX}{ik}/plan-{no:02d}.html', proto_href))
                parts.append("</div>")
            parts.append("</div>")
        else:
            parts.append('<div class="pending">この業種の「改善計画10選」(事業計画書・プロトタイプ)は準備中です。'
                         '準備段階の評価として、'
                         f'<a href="{LINK_PREFIX}{ik}/pdca.html">{esc(labels[ik])}×AI 1000案の評価ボード(採択候補TOP10つき)</a>'
                         'を公開しています。</div>')
        parts.append("</section>")

    # このページの選定方法の但し書き。もとはタイトル直下にあったが、先に中身（カード）を
    # 見せたいので末尾へ移した（本人指示、2026-08-16）。
    parts.append('<p class="lede-foot">業種ごとに費用対効果・業務改善効率の高い10案を厳選（美容業・飲食業・宿泊業・製造業・不動産業・教育業は各1000案からのPDCA評価、あわせて6業種×100施策のスコアリングと突き合わせて選定）。'
                 "各案には <strong>A4×10ページの事業計画書</strong>（Excel版つき）が付属します。"
                 "<strong>試作プロトタイプ</strong>は美容業・飲食業で公開中、他の業種は準備中です。</p>")
    parts.append('<p class="note">本コンテンツは公開情報に基づくモデルケースの試算・提案であり、個別事業者への効果や補助金の採択を保証するものではありません。'
                 "申請にあたっては必ず各制度の公式サイト・公募要領をご確認ください。</p>")
    parts.append("""
<script>
  // 業種の選択は index.html と共通の localStorage キーで受け渡す（2026-08-16）。
  // 優先順位: URLの?industry= > 前回このサイトで選んだ業種 > 既定(先頭)。
  // URLで来た場合は、次にどのページへ移動しても同じ業種が続くよう保存もしておく。
  var KOBAN_INDUSTRY_KEY = 'koban_industry';
  function showInd(key) {
    document.querySelectorAll('section.ind').forEach(function (s) { s.classList.toggle('active', s.id === 'ind-' + key); });
    // プルダウンから呼ばれたときは既に選択済みだが、URL・localStorage由来で
    // 呼ばれたときは表示を合わせる必要がある
    var sel = document.getElementById('indSelect');
    if (sel && sel.value !== key) sel.value = key;
    try { localStorage.setItem(KOBAN_INDUSTRY_KEY, key); } catch (e) {}
  }
  (function () {
    var m = location.search.match(/[?&]industry=(\\w+)/);
    var fromUrl = m && document.getElementById('ind-' + m[1]) ? m[1] : null;
    if (fromUrl) { showInd(fromUrl); return; }
    var saved = null;
    try { saved = localStorage.getItem(KOBAN_INDUSTRY_KEY); } catch (e) {}
    if (saved && document.getElementById('ind-' + saved)) showInd(saved);
  })();
</script>
<script src="app_tabbar.js"></script>
</main></body></html>""")

    out = os.path.join(ROOT, "improvement.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(parts))
    print(f"OK: hub -> {out} (plans built: {sorted(plans.keys()) or 'none'})")


if __name__ == "__main__":
    main()

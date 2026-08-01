# -*- coding: utf-8 -*-
"""data/plans/{industry}.json から事業計画書 plan-NN.html (A4×10ページ) を生成する。

補助金額は min(上限額, 投資総額×補助率) をここで計算し、手入力させない。
実行: python3 build_plans.py [industry ...]   省略時は plans/ にある全業種

2026-07-28 全面改修: beauty/plan-*.html (beauty-ai-factory由来のNode生成) と同じ
品質水準に合わせた。移植した設計要素:
  - 左端のカラーレール、ページヘッダのチップ+大見出し
  - スタットタイル(導入前→導入後の数字を主役にする)
  - head-strip(視線誘導の帯見出し)、課題の構造ツリー図
  - .pbody の余白均等配分(ページ下端だけが空くのを防ぐ)。
    美容版は全ページ埋まり率100%、改修前の本スクリプトは57〜90%だった
デザイントークンも美容版に合わせる: 文書構造色 --sc(鉄紺)は業種で変えず、
業種色は --scheme として補助金バッジ等にだけ使う(美容版と同じ役割分担)。
"""
import json
import os
import re
import sys

import svg_helpers as sh

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

# ページごとのチップ(短い分類ラベル)。美容版のphead-chipに対応
PAGE_CHIPS = ["計画概要", "現状分析", "解決策", "施策詳細", "スケジュール",
              "費用計画", "補助金活用", "効果試算", "KPI・運用", "リスク・まとめ"]

CSS_TMPL = """
  @page { size: A4 portrait; margin: 0; }
  :root{
    /* --mute / --gold は 3.6:1・3.66:1 でWCAG AA(4.5:1)に届いていなかったため
       2026-07-29に濃くした（#8a8178→#6b6359 = 5.6:1、#a8790f→#8a6208 = 5.2:1）。
       印刷時の見え方は変わらず、画面で読むときだけ効く。 */
    --ink:#171310;--sub:#5b544c;--mute:#6b6359;--line:#dcd4c8;--soft:#faf8f4;
    --green:#1f6b46;--red:#b3372c;--gold:#8a6208;--scheme:__SCHEME__;--sc:#2b5f8a;
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI","Meiryo",sans-serif;color:var(--ink);background:#dcd8d2;
    line-height:1.62;font-size:11pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"palt"}

  /* ツールバー */
  .toolbar{background:#1a1714;color:#f6f1e8;padding:11px 20px;display:flex;justify-content:space-between;
    align-items:center;font-size:12.5px;position:sticky;top:0;z-index:9;gap:10px;flex-wrap:wrap}
  .toolbar button,.toolbar a{font:inherit;font-weight:700;background:var(--gold);color:#fff;border:none;
    border-radius:8px;padding:8px 16px;cursor:pointer;text-decoration:none}
  .toolbar a.xls{background:#1d6f42}
  .toolbar a.plain{background:transparent;color:#f6f1e8;padding:8px 4px}
  .toolbar .btns{display:flex;gap:8px;align-items:center;flex-wrap:wrap}

  /* ページ */
  .page{width:210mm;min-height:297mm;background:#fff;margin:16px auto;padding:13mm 14mm 10mm 17mm;
    position:relative;display:flex;flex-direction:column;box-shadow:0 3px 16px #00000026;overflow:hidden}
  .rail{position:absolute;left:0;top:0;bottom:0;width:7mm;background:var(--sc)}
  .phead{display:flex;justify-content:space-between;align-items:center;gap:10px;
    border-bottom:3px solid var(--sc);padding-bottom:7px;margin-bottom:10px}
  .phead-l{display:flex;align-items:center;gap:10px;min-width:0}
  .phead-chip{background:var(--sc);color:#fff;font-size:9.5pt;font-weight:800;padding:3px 12px;border-radius:99px;white-space:nowrap}
  .phead-t{font-size:16pt;font-weight:900;color:var(--sc);letter-spacing:.01em}
  .phead-n{font-size:12pt;font-weight:900;color:var(--sc);white-space:nowrap}
  .phead-n small{font-size:9pt;color:var(--mute);font-weight:700}
  .pbody{flex:1;display:flex;flex-direction:column;justify-content:space-between}
  /* 余りスペースをブロック間へ均等配分し、下端だけが空くのを防ぐ */
  .pbody>*{flex:0 0 auto}
  .pf{display:flex;justify-content:space-between;font-size:8.5pt;color:var(--mute);
    border-top:1px solid var(--line);padding-top:6px;margin-top:10px}

  h1{font-size:19pt;line-height:1.34;margin:5px 0;font-weight:900;letter-spacing:-.01em}
  h3{font-size:12.5pt;font-weight:800;color:var(--sc);margin:10px 0 5px;padding-left:9px;border-left:5px solid var(--sc)}
  .lead{font-size:10.8pt;margin:6px 0;text-align:justify}
  .note{font-size:9pt;color:var(--mute);margin-top:5px;text-align:justify}

  /* 見出しストリップ(視線誘導) */
  .head-strip{background:var(--sc);color:#fff;font-size:10.5pt;font-weight:800;padding:6px 14px;
    border-radius:6px;margin:9px 0 7px;letter-spacing:.02em}

  /* ヒーロー */
  .hero{display:flex;gap:12px;align-items:stretch;background:linear-gradient(135deg,#f7f4ee,#efe8dc);
    border:1px solid var(--line);border-left:6px solid var(--sc);border-radius:12px;padding:14px;margin-bottom:4px}
  .hero-main{flex:1.75;min-width:0;display:flex;flex-direction:column;justify-content:center}
  .hero-fig{flex:1;display:flex;align-items:center;justify-content:center;background:#fff;
    border:1px solid var(--line);border-radius:10px;padding:6px}
  .hero-fig svg{max-width:100%;height:auto}
  .hero-badge{display:inline-block;background:var(--scheme);color:#fff;font-size:9.5pt;font-weight:800;
    padding:3px 13px;border-radius:99px;margin-bottom:7px;align-self:flex-start}
  .hero-sub{font-size:10.5pt;color:var(--sub);margin-top:6px}

  /* スタットタイル(数字を主役に) */
  .tiles{display:grid;gap:9px;margin:8px 0 4px}
  .tiles.t4{grid-template-columns:repeat(4,1fr)}
  .tiles.t3{grid-template-columns:repeat(3,1fr)}
  .tile{border:1.5px solid var(--line);border-top:5px solid var(--sc);border-radius:10px;
    padding:9px 10px 8px;background:#fff;text-align:center;position:relative}
  .tile-label{font-size:8.8pt;color:var(--sub);font-weight:700;line-height:1.35;min-height:2.4em}
  .tile-nums{display:flex;align-items:flex-end;justify-content:center;gap:6px;margin-top:2px}
  .tile-pair{display:flex;flex-direction:column;align-items:center;line-height:1}
  .tile-cap{font-size:7.6pt;color:var(--mute);font-weight:700;margin-bottom:2px}
  .tile-before{font-size:15pt;font-weight:800;color:#8f867c}
  .tile-arrow{font-size:12pt;color:var(--mute);font-weight:800;padding-bottom:1px}
  .tile-after{font-size:25pt;font-weight:900;color:var(--sc);letter-spacing:-.02em;line-height:1.05}
  .tile-unit{font-size:8.5pt;color:var(--sub);margin-top:1px}
  .tile-badge{display:inline-block;font-size:9.5pt;font-weight:900;padding:2px 10px;border-radius:99px;margin-top:5px}
  .tile-badge.good{background:#e6f2ea;color:#1f6b46}

  /* レイアウト */
  .split{display:flex;gap:13px;margin:4px 0;align-items:flex-start}
  .half{flex:1;min-width:0}
  .half>h3:first-child{margin-top:0}

  /* コールアウト */
  .callout{background:#f8f5f0;border-left:5px solid var(--sc);border-radius:0 8px 8px 0;
    padding:8px 12px;font-size:10pt;margin:4px 0;text-align:justify}
  .callout.small{font-size:9.5pt;padding:7px 11px}
  .callout.scheme{border-left-color:var(--scheme);background:#fbf5f2}
  .callout.alert{border-left-color:#b3372c;background:#fdf3f1}

  /* 表 */
  table{width:100%;border-collapse:collapse;font-size:10pt;margin:3px 0}
  .kv td{padding:6px 9px;border-bottom:1px solid var(--line)}
  .kv td:first-child{color:var(--sub);width:44%;font-size:9.5pt;background:#faf8f4}
  .data th{background:var(--sc);color:#fff;padding:6px 9px;text-align:left;font-size:9.5pt;border:1px solid var(--sc)}
  .data td{padding:5px 9px;border:1px solid var(--line)}
  .data tr:nth-child(even) td{background:#fbfaf7}
  .data .num{text-align:right;font-variant-numeric:tabular-nums}
  .data tr.sum td{font-weight:900;background:#f2ede4}
  .sc{color:var(--scheme)}

  /* 課題の構造ツリー(美容版p2の図と同型) */
  .tree{margin:8px 0 2px;text-align:center}
  .tree-top{display:inline-block;background:var(--sc);color:#fff;font-size:10.5pt;font-weight:800;
    padding:7px 22px;border-radius:8px}
  .tree-conn{display:block;width:2px;height:10px;background:var(--line);margin:0 auto}
  .tree-row{display:flex;gap:10px;margin:0 6mm}
  .tree-box{flex:1;border:1.5px solid var(--line);border-radius:9px;background:#fbfaf7;
    padding:8px 9px;font-size:9.5pt;font-weight:700;line-height:1.45}
  .tree-down{color:#b3372c;font-size:12pt;font-weight:900;margin:3px 0 2px}
  .tree-concl{display:inline-block;border:2px solid #b3372c;color:#b3372c;font-size:10.5pt;
    font-weight:900;border-radius:9px;padding:6px 20px;background:#fdf3f1}

  /* 図版 */
  .figbox{background:#fcfaf6;border:1px solid var(--line);border-radius:10px;padding:8px;margin:6px 0;text-align:center}
  .figbox svg{max-width:440px;height:auto}
  .half .figbox svg{max-width:330px}
  .ul{list-style:none;font-size:10.2pt}
  .ul li{padding:3px 0 3px 18px;position:relative}
  .ul li::before{content:"▪";position:absolute;left:2px;color:var(--sub)}
  .ul.on li::before{content:"✓";color:var(--green);font-weight:800}
  .ul.cols{column-count:2;column-gap:18px}

  @media print{body{background:#fff}.toolbar{display:none}.mobile-note{display:none}
    .sheets{overflow:visible}
    /* ★ 印刷時だけ高さの固定(min-height:297mm)を外し、中身なりの高さにする。
       297mm固定のままだと用紙(A4=297mm)と寸分たがわぬ高さになり、余裕が
       実測0.9mm(10ページ目)しかなかった。この状態で印刷ダイアログの倍率が
       100%を1%でも超えると全ページが上下2枚に割れ、10ページが22ページになる
       （110%で22ページになることを2026-07-31に実測）。倍率はブラウザ側の設定
       なのでCSSでは強制できないため、こちらが用紙いっぱいを使うのをやめて
       逃げ幅を作る。中身の実高さは243〜296mmなので、切れは発生しない。
       _build_plans_v2.js(美容業)と必ず揃えること。 */
    .page{margin:0;box-shadow:none;page-break-after:always;min-height:0;height:auto}
    .page:last-child{page-break-after:auto}}

  /* 狭い画面向け
     この書類はA4固定レイアウト(210mm=約794px)なのでスマートフォンに収まらない。
     2026-07-29版は .sheets を横スクロールさせていたが、指で横に送らないと
     1行が読み切れず実質読めなかったため、2026-07-30に画面幅へ流し込む方式へ
     変更した（横スクロールを無くすのが目的）。

     ★ screen 限定にしているのが重要。単なる (max-width:900px) だと印刷にも当たる。
       印刷時のビューポート幅はA4の210mm(約794px)で900px未満になるため、
       このブロックが @media print より後ろにある＝後勝ちで
       .page{margin:14px} が @media print の margin:0 を打ち消し、
       1ページが上下2枚に割れて全10ページが22ページになっていた。 */
  .mobile-note{display:none}
  @media screen and (max-width:900px){
    .mobile-note{display:block;background:#fff5e0;border-bottom:1px solid #e6d3a8;
      color:#5b4708;font-size:13.5px;line-height:1.7;padding:12px 16px}
    .mobile-note b{font-weight:700}
    .sheets{overflow:visible;padding-bottom:10px}
    /* A4の固定幅をやめ、画面幅に合わせて流し込む */
    .page{width:auto;max-width:100%;min-height:0;margin:12px 10px;
      padding:15px 13px 16px 24px;box-shadow:0 2px 10px #00000018}
    .rail{width:12px}
    /* 横並びは縦に畳む */
    .tiles.t4,.tiles.t3{grid-template-columns:repeat(2,1fr)}
    .hero,.split,.tree-row{flex-direction:column;align-items:stretch}
    .hero-fig{min-height:110px}
    .ul.cols{column-count:1}
    /* はみ出しうるもの */
    svg,img{max-width:100%;height:auto}
    table{width:100%;table-layout:fixed}
    td,th{word-break:break-word}
    .toolbar{font-size:13px}
    .toolbar{flex-direction:column;align-items:stretch;gap:8px}
    .toolbar .btns{justify-content:flex-start}
    /* 指で押せる大きさを確保する（44px以上）。ここが36pxだと押しにくい */
    .toolbar button,.toolbar a{min-height:44px;display:inline-flex;align-items:center;
      padding:8px 14px;font-size:14px;white-space:nowrap}
    .toolbar a.plain{padding:8px 6px}
  }
"""

# 参考資料ページ(apply_benchmarks.py)を .sheets の内側に入れるための目印。
# </body> の直前には解析タグ(add_analytics.py)も入るため、閉じタグの並びでは位置を特定できない。
SHEETS_END = "<!-- SHEETS:END --></div>"

MOBILE_NOTE = ('<div class="mobile-note">この事業計画書は<b>A4×10ページ</b>の書類です。'
               'スマートフォンでは画面幅に合わせて表示しているため、'
               '印刷したときの体裁とは並びが変わります。'
               '提出用の体裁でご覧になる場合は、上の「印刷 / PDF保存」または「Excel版（編集用）」をご利用ください。</div>')


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def kv_table(rows):
    return '<table class="kv">' + "".join(f"<tr><td>{esc(k)}</td><td>{v}</td></tr>" for k, v in rows) + "</table>"


def data_table(headers, rows, sum_row=None):
    out = ['<table class="data"><thead><tr>']
    out += [f"<th>{esc(h)}</th>" for h in headers]
    out.append("</tr></thead><tbody>")
    for r in rows:
        out.append("<tr>" + "".join(f"<td{' class=num' if isinstance(c, (int, float)) else ''}>{esc(c) if not isinstance(c, str) or not c.startswith('<') else c}</td>" for c in r) + "</tr>")
    if sum_row:
        out.append('<tr class="sum">' + "".join(f"<td{' class=num' if isinstance(c, (int, float)) else ''}>{esc(c)}</td>" for c in sum_row) + "</tr>")
    out.append("</tbody></table>")
    return "".join(out)


def ul(items, check=False, cols=False):
    cls = "ul" + (" on" if check else "") + (" cols" if cols else "")
    return f'<ul class="{cls}">' + "".join(f"<li>{esc(i)}</li>" for i in items) + "</ul>"


def head_strip(text):
    return f'<div class="head-strip">{esc(text)}</div>'


def fig(svg):
    return f'<div class="figbox">{svg}</div>'


def _fmt_num(v):
    if isinstance(v, float) and v == int(v):
        v = int(v)
    return f"{v:,}" if isinstance(v, int) else str(v)


def _tile(label, before, after, unit):
    """導入前→導入後のスタットタイル。改善方向は問わず緑バッジ(いずれも好転の指標のみ渡す)"""
    if isinstance(before, (int, float)) and isinstance(after, (int, float)) and before > 0:
        delta = (after - before) / before * 100
        badge = f"▲{abs(round(delta))}%" if delta < 0 else f"+{round(delta)}%"
    elif isinstance(after, (int, float)) and (not isinstance(before, (int, float)) or before == 0):
        badge = f"+{_fmt_num(after)}{unit}"
    else:
        badge = ""
    badge_html = f'<div class="tile-badge good">{esc(badge)}</div>' if badge else ""
    return (f'<div class="tile"><div class="tile-label">{esc(label)}</div>'
            f'<div class="tile-nums"><span class="tile-pair"><span class="tile-cap">導入前</span>'
            f'<span class="tile-before">{_fmt_num(before)}</span></span><span class="tile-arrow">→</span>'
            f'<span class="tile-pair"><span class="tile-cap">導入後</span><span class="tile-after">{_fmt_num(after)}</span></span></div>'
            f'<div class="tile-unit">{esc(unit)}</div>{badge_html}</div>')


_UNIT_RE = re.compile(r"[（(]([^（()）]{1,12})[)）]\s*$")


def _split_label_unit(label):
    """「注文取り対応(時間/月)」→ ("注文取り対応", "時間/月")。括弧が無ければ単位は空"""
    m = _UNIT_RE.search(label)
    if m:
        return label[:m.start()].strip(), m.group(1)
    return label, ""


def impact_tiles(eff):
    """effect.model + modelExtras からタイル列を作る(最大4枚)。
    2枚以下だと間延びするので、月次の削減効果額(試算)があればタイルに足す"""
    rows = [eff["model"]] + list(eff.get("modelExtras", []))
    tiles = []
    for r in rows[:4]:
        label, unit = _split_label_unit(r["label"])
        tiles.append(_tile(label, r["before"], r["after"], unit))
    monthly = eff.get("monthlySaving", {}).get("amount")
    if len(tiles) < 3 and monthly:
        tiles.append(_tile("削減効果額（試算）", 0, monthly, "万円/月"))
    cls = "t4" if len(tiles) >= 4 else "t3"
    return f'<div class="tiles {cls}">' + "".join(tiles) + "</div>"


def tree_diagram(top, boxes, concl):
    return ('<div class="tree">'
            f'<div class="tree-top">{esc(top)}</div><span class="tree-conn"></span>'
            '<div class="tree-row">' + "".join(f'<div class="tree-box">{esc(b)}</div>' for b in boxes) + "</div>"
            f'<div class="tree-down">▼</div><div class="tree-concl">→ {esc(concl)}</div></div>')


def page(no, title, footer_l, footer_r, body):
    chip = PAGE_CHIPS[no - 1]
    return (f'<section class="page"><div class="rail"></div>'
            f'<div class="phead"><div class="phead-l"><span class="phead-chip">{esc(chip)}</span>'
            f'<span class="phead-t">{no}. {esc(title)}</span></div>'
            f'<span class="phead-n">{no} <small>/ 10</small></span></div>'
            f'<div class="pbody">{body}</div>'
            f'<div class="pf"><span>{esc(footer_l)}</span><span>{esc(footer_r)}</span></div></section>')


DEMO_NOTE = ('<p class="note">※ 本計画の数値は公開情報・業界目安に基づくモデルケースの仮置きです。'
             '実申請時には自社の売上・勤怠・稼働記録等の裏付けデータに差し替えてください。</p>')

# 申請前チェック(制度共通で常に真の一般則のみ。制度固有の要件は各ページの記載に委ねる)
PRECHECK = [
    "GビズIDプライムを取得済みか（取得に2〜3週間かかる）",
    "公募要領の最新版で対象経費・要件を確認したか",
    "交付決定前に発注・契約・支払いをしていないか",
    "相見積など価格の妥当性を示す書類を準備したか",
    "実績報告に使う証憑（請求書・振込記録・写真）の保管ルールを決めたか",
    # 2026-08-02 診断士監修で追加。採択後に効いてくる義務が60本とも書かれていなかった
    "取得財産の処分制限と、採択後の報告義務（事業化状況報告・収益納付）を確認したか",
]


def build_plan_html(pl, scheme, industry_label, has_xlsx=False):
    inv = pl["investment"]
    sub = pl["subsidy"]
    total = inv["total"]
    rate = sub["rate"]
    cap = sub["cap"]
    # 2026-08-02 診断士監修で追加：投資総額の一部しか補助対象にならない制度がある
    # （例：デジタル化・AI導入補助金はハードウェア本体が対象外）。
    # 対象額を eligible に持たせ、補助見込はその額から計算する。
    # これが無いと「タブレット代にも1/2が付く」計算になり、補助見込が過大になる。
    eligible = sub.get("eligible", total)
    applied = round(min(cap, eligible * rate), 1)
    if applied == int(applied):
        applied = int(applied)
    self_pay = round(total - applied, 1)
    if self_pay == int(self_pay):
        self_pay = int(self_pay)
    eff = pl["effect"]
    monthly = eff.get("monthlySaving", {}).get("amount")
    payback_m = round(self_pay / monthly) if monthly else None

    model_name = pl["model"]["name"]
    footer_l = f"{model_name} 事業計画書（モデルケース）"

    pages = []

    # ---- p1 計画概要: ヒーロー(+導入イメージ図) → インパクトタイル → 概要kv×2 → 狙い
    summary_rows = [
        ("投資総額", f"<b>{total}万円</b>（{esc(inv['unit'])}）"),
        ("活用制度", esc(sub["label"])),
        ("補助率", esc(sub["rateText"])),
        ("補助見込", f'<b style="color:var(--gold)">{applied}万円</b>'),
        ("自己負担", f"{self_pay}万円"),
    ]
    if payback_m:
        summary_rows.append(("投資回収（試算）", f"約{payback_m}ヶ月"))
    hero_fig = sh.pictogram_row("導入イメージ", [tuple(p) for p in pl["detail"]["pictograms"][:2]], accent=scheme, w=210)
    body1 = (
        f'<div class="hero"><div class="hero-main"><span class="hero-badge">{esc(sub["label"])} 活用プラン</span>'
        f'<h1>{esc(pl["title"])}</h1><p class="hero-sub">{esc(pl["subtitle"])}</p></div>'
        f'<div class="hero-fig">{hero_fig}</div></div>'
        + head_strip("本計画のインパクト(1分で掴む要点)")
        + impact_tiles(eff)
        + '<div class="split">'
        f'<div class="half"><h3>モデル事業者（想定）</h3>{kv_table([(k, esc(v)) for k, v in pl["model"]["lines"]])}</div>'
        f'<div class="half"><h3>本計画のサマリー</h3>{kv_table(summary_rows)}</div></div>'
        f'<div class="callout"><b>本計画の狙い：</b>{esc(pl["solution"]["aim"])}</div>'
        + DEMO_NOTE
    )
    pages.append(page(1, "計画概要", footer_l, "計画概要", body1))

    # ---- p2 現状と課題分析: リード → 帯 → フロー図+作業時間 → 課題箇条書き+影響 → 構造ツリー
    bullets = pl["problem"]["bullets"]
    body2 = (
        f'<p class="lead">{esc(pl["problem"]["lead"])} {esc(pl["problem"]["detail"])}</p>'
        + head_strip("この業務が「いま」どうなっているか")
        + '<div class="split"><div class="half">'
        + fig(sh.flow_h("現状の業務フロー（手作業中心）", [tuple(s) for s in pl["problem"]["flowSteps"]], accent="#9c8468", w=330))
        + '</div><div class="half">'
        + fig(sh.bar_h("現状の作業時間の内訳（月間・試算）", [tuple(r) for r in pl["problem"]["laborRows"]], accent="#9c8468", unit="時間", w=330))
        + '</div></div>'
        + '<div class="split">'
        f'<div class="half"><h3>現状の課題（定性・定量）</h3>{ul(bullets)}</div>'
        f'<div class="half"><h3>この状態が経営に与えている影響</h3><div class="callout small" style="margin-top:4px">{esc(pl["problem"]["callout"])}</div></div></div>'
        + "<h3>課題の構造（なぜ今、投資が必要か）</h3>"
        + tree_diagram("人手不足・時間不足という構造的制約", bullets[:3], "生産性と収益力の停滞（本計画で解決する課題）")
        + DEMO_NOTE
    )
    pages.append(page(2, "現状と課題分析", footer_l, "現状と課題分析", body2))

    # ---- p3 解決策・システム構成
    body3 = (
        f'<p class="lead">{esc(pl["solution"]["overview"])}</p>'
        + fig(sh.system_diagram("導入後のシステム構成", pl["solution"]["center"],
                                [tuple(n) for n in pl["solution"]["nodes"]], accent=scheme))
        + head_strip("構成要素と役割")
        + data_table(["構成要素", "役割・機能"], [tuple(c) for c in pl["solution"]["components"]])
        + fig(sh.flow_h("導入後の業務フロー", [tuple(s) for s in pl["solution"]["flowSteps"]], accent=scheme))
    )
    pages.append(page(3, "解決策・システム構成", footer_l, "解決策", body3))

    # ---- p4 施策詳細・導入設備
    ba = pl["detail"]["beforeAfter"]
    body4 = (
        head_strip(f"実施内容（{pl['category']['name']}）")
        + ul(pl["detail"]["points"])
        + "<h3>導入する設備・システム</h3>"
        + data_table(["設備・システム", "仕様・用途"], [tuple(r) for r in pl["detail"]["equipment"]])
        + '<div class="split"><div class="half">'
        + fig(sh.pictogram_row("導入設備のイメージ", [tuple(p) for p in pl["detail"]["pictograms"]], accent=scheme, w=340))
        + '</div><div class="half">'
        + fig(sh.bar_before_after("業務の変化（モデルケース試算）", [tuple(r) for r in ba], accent=sh.GREEN))
        + '</div></div>'
        + f'<div class="callout small"><b>この施策で仕事がどう変わるか：</b>{esc(pl["solution"]["aim"])}</div>'
    )
    pages.append(page(4, "施策詳細・導入設備", footer_l, "施策詳細", body4))

    # ---- p5 導入スケジュール
    sched_rows = [(s["label"], s["m"][0], s["m"][1]) for s in pl["schedule"]]
    months_total = max(s["m"][1] for s in pl["schedule"])
    body5 = (
        f'<p class="lead">導入は{months_total}ヶ月間を想定し、{esc(pl["scheduleNote"])}</p>'
        + fig(sh.gantt("導入スケジュール（想定）", sched_rows, accent=scheme, months=max(months_total, 6)))
        + head_strip("マイルストーン")
        + data_table(["フェーズ", "実施内容", "完了目安"],
                     [(f"STEP {i+1}", s["label"], f"{s['m'][1]}ヶ月目") for i, s in enumerate(pl["schedule"])])
        + '<div class="callout alert small"><b>交付決定前の発注は補助対象外：</b>補助金を活用する場合、交付決定前に発注・契約・支払いを行った経費は原則補助対象外となる。'
        "スケジュールは交付決定日を起点に再調整すること。公募時期は変動するため、申請前に必ず公式サイトで最新情報を確認する。</div>"
    )
    pages.append(page(5, "導入スケジュール", footer_l, "スケジュール", body5))

    # ---- p6 費用計画
    basis_label = "タイプA：分類全体の概算を適用" if inv["basis"] == "A" else "タイプB：分類概算のうち該当設備分の参考試算"
    body6 = (
        f'<p class="lead">投資総額は{total}万円（{esc(inv["unit"])}）。'
        f'本サイト掲載の「{esc(pl["category"]["name"])}」分類の概算データに基づく。</p>'
        + head_strip("費用内訳")
        + data_table(["費目", "金額"], [(l, f"{v}万円") for l, v in inv["lines"]],
                     sum_row=("合計", f"{total}万円"))
        + '<div class="split"><div class="half">'
        + fig(sh.cost_stack("費用構成", [tuple(l) for l in inv["lines"]], total, inv["unit"], accent=scheme, w=320))
        + '</div><div class="half"><h3>補助金適用後の実質負担</h3>'
        + kv_table([("投資総額", f"{total}万円"),
                    ("補助見込", f'<b style="color:var(--gold)">▲{applied}万円</b>'),
                    ("実質自己負担", f"<b>{self_pay}万円</b>")])
        + f'<div class="callout small" style="margin-top:8px"><b>費用の根拠（{basis_label}）：</b>{esc(inv["basisNote"])}</div></div></div>'
        + '<p class="note">金額は本サイトの分類別概算（公開情報ベース・税抜）であり、実際の見積額は事業者・製品構成により変動する。</p>'
        # 2026-08-02 税理士監修で追記：税込/税抜・益金算入・消費税の注意が
        # 60本すべてに無かった。テンプレートで一括して入れる
        + '<p class="note">補助金は税務上の収益（益金）として課税対象。消費税の扱いを含む税務上の注意は巻末の参考資料ページに記載。</p>'
    )
    pages.append(page(6, "費用計画", footer_l, "費用計画", body6))

    # ---- p7 補助金活用計画
    sub_rows = [
        ("活用する制度", esc(sub["label"])),
        ("補助率", esc(sub["rateText"])),
        ("上限額", esc(sub["capText"])),
        ("本計画での補助見込", f"<b>min(上限{cap}万円, {eligible}万円×{rate:g}) = {applied}万円</b>"),
        ("自己負担額", f"{self_pay}万円"),
    ]
    if eligible != total:
        sub_rows.insert(3, ("補助対象となる経費",
                            f"<b>{eligible}万円</b>（投資総額{total}万円のうち。"
                            f'{esc(sub.get("eligibleNote", ""))}）'))
    body7 = (
        f'<p class="lead">{esc(sub["why"])}</p>'
        + head_strip("制度の適用条件と本計画での試算")
        + kv_table(sub_rows)
        + fig(sh.waterfall_subsidy(total, applied, self_pay, accent=scheme))
        + fig(sh.flow_h("申請から受給までの流れ（一般的な例）", [tuple(s) for s in sub["flowSteps"]], accent=scheme))
        + '<div class="callout scheme small">'
        + esc(sub.get("note", ""))
        + " 補助率・上限額・公募スケジュールは公募回により変動し、<b>直近の公募が終了している制度もある。"
          "申請前に必ず公式サイトで次回公募の有無と公募要領を確認すること。</b>"
        "同一経費への複数制度の重複受給はできない。</div>"
    )
    pages.append(page(7, "補助金活用計画", footer_l, "補助金活用", body7))

    # ---- p8 効果試算
    m = eff["model"]
    fig_left = fig(sh.bar_before_after(f'{m["label"]}ほか（{m["basis"]}）',
                                       [(m["label"], m["before"], m["after"])] + [(e["label"], e["before"], e["after"]) for e in eff.get("modelExtras", [])[:2]],
                                       accent=sh.GREEN))
    fig_right = (fig(sh.payback_line("自己負担の回収イメージ", monthly, self_pay,
                                     months=max(24, payback_m + 6), accent=scheme))
                 if (monthly and payback_m) else "")
    body8 = (
        head_strip("本サイト掲載の効果データ（出典つき参考値）")
        + ul(eff["sourceBullets"])
        + "<h3>モデルケースでの試算</h3>"
        + f'<p class="lead">{esc(eff["modelNote"])}</p>'
        + f'<div class="split"><div class="half">{fig_left}</div><div class="half">{fig_right}</div></div>'
    )
    if monthly and payback_m:
        body8 += f'<div class="callout small"><b>回収試算の前提：</b>{esc(eff["monthlySaving"]["assumption"])}</div>'
    body8 += '<p class="note">効果の数値は導入事例・業界目安に基づく参考値であり、事業規模・顧客層・運用により変動する。自社での効果測定と併せて判断すること。</p>'
    pages.append(page(8, "効果試算", footer_l, "効果試算", body8))

    # ---- p9 KPI・PDCA運用
    body9 = (
        f'<p class="lead">{esc(pl["kpiLead"])}</p>'
        + head_strip("KPI（重要業績評価指標）")
        + data_table(["KPI", "現状", "目標", "達成時期"],
                     [(k["name"], k["base"], k["target"], k["when"]) for k in pl["kpi"]])
        + '<div class="split">'
        + f'<div class="half">{fig(sh.pdca_cycle(accent=scheme))}</div>'
        + f'<div class="half">{fig(sh.gauge_row("初年度目標の達成イメージ", [tuple(g) for g in pl["gauges"]], accent=scheme, w=300))}'
        + f'<div class="callout small">{esc(pl["pdcaNote"])}</div></div></div>'
    )
    pages.append(page(9, "KPI・PDCA運用", footer_l, "KPI・運用", body9))

    # ---- p10 リスク対応・まとめ
    body10 = (
        head_strip("想定リスクと対応策")
        + data_table(["想定リスク", "対応策"], [(r["risk"], r["counter"]) for r in pl["risks"]])
        + '<div class="split"><div class="half">'
        + fig(sh.risk_matrix([(r["short"], r["impact"], r["likelihood"]) for r in pl["risks"]], accent=scheme))
        + '</div><div class="half"><h3>次のアクション</h3>' + ul(pl["actions"], check=True)
        + '<h3>申請前チェック</h3>' + ul(PRECHECK, check=True) + '</div></div>'
        + '<div class="callout alert small">本計画書は公開情報に基づくモデルケースの試算・提案であり、補助金の採択・支給や効果を保証するものではない。'
        "申請にあたっては各制度の公式サイト・公募要領で最新の要件を確認し、必要に応じて専門家（商工会議所・中小企業診断士・社会保険労務士等）に相談すること。</div>"
    )
    pages.append(page(10, "リスク対応・まとめ", footer_l, "まとめ", body10))

    css = CSS_TMPL.replace("__SCHEME__", scheme)
    xls_link = (f'<a class="xls" href="plan-{pl["no"]:02d}.xlsx" download>📊 Excel版（編集用）</a>' if has_xlsx else "")
    toolbar = (f'<div class="toolbar"><span>📄 事業計画書 PLAN {pl["no"]:02d}（{esc(industry_label)}）'
               f'— {esc(sub["label"])} / A4×10ページ</span>'
               f'<span class="btns"><a class="plain" href="../index.html">← 10選トップ</a>{xls_link}'
               '<button onclick="window.print()">🖨 印刷 / PDF保存</button></span></div>')
    return ('<!DOCTYPE html>\n<html lang="ja"><head><meta charset="UTF-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            f'<title>事業計画書 PLAN {pl["no"]:02d} {esc(pl["title"])}（{esc(industry_label)}・モデルケース）</title>'
            '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800;900&display=swap" rel="stylesheet">'
            f"<style>{css}</style></head><body>{toolbar}{MOBILE_NOTE}"
            '<div class="sheets">' + "\n".join(pages) + SHEETS_END + "</body></html>")


EXTERNAL_INDUSTRIES = {"beauty"}  # 外部プロジェクト連携のため本スクリプトでは生成しない業種


def main():
    industries = sys.argv[1:]
    if not industries:
        pdir = os.path.join(DATA, "plans")
        industries = [f[:-5] for f in os.listdir(pdir) if f.endswith(".json")] if os.path.isdir(pdir) else []
    for ik in industries:
        if ik in EXTERNAL_INDUSTRIES:
            print(f"SKIP: {ik} は外部プロジェクト連携のため build_plans.py では生成しません")
            continue
        with open(os.path.join(DATA, "plans", ik + ".json"), encoding="utf-8") as f:
            plans = json.load(f)
        outdir = os.path.join(IMPROVEMENT, ik)
        os.makedirs(outdir, exist_ok=True)
        for pl in plans:
            # Excel版が既にあればツールバーにリンクを出す(生成は build_plan_excel.py)
            has_xlsx = os.path.exists(os.path.join(outdir, f"plan-{pl['no']:02d}.xlsx"))
            html_text = build_plan_html(pl, INDUSTRY_SCHEME[ik], INDUSTRY_LABEL[ik], has_xlsx=has_xlsx)
            out = os.path.join(outdir, f"plan-{pl['no']:02d}.html")
            with open(out, "w", encoding="utf-8") as f:
                f.write(html_text)
        print(f"OK: {ik} -> {len(plans)} plan docs")


if __name__ == "__main__":
    main()

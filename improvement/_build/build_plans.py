# -*- coding: utf-8 -*-
"""data/plans/{industry}.json から事業計画書 plan-NN.html (A4×10ページ) を生成する。

補助金額は min(上限額, 投資総額×補助率) をここで計算し、手入力させない。
実行: python3 build_plans.py [industry ...]   省略時は plans/ にある全業種
"""
import json
import os
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

CSS_TMPL = """
  @page { size: A4 portrait; margin: 0; }
  :root{--ink:#26221e;--sub:#6f675e;--line:#d9d2c8;--accent:__SCHEME__;--green:#3e6b4f;--gold:#b98a2f;--red:#a4453c;--scheme:__SCHEME__}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI",sans-serif;color:var(--ink);background:#e8e4de;line-height:1.6;font-size:10.2pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .toolbar{background:#26221e;color:#f5efe6;padding:10px 18px;display:flex;justify-content:space-between;align-items:center;font-size:12px;position:sticky;top:0;z-index:9;gap:10px;flex-wrap:wrap}
  .toolbar a{color:#f5efe6}
  .toolbar button{font:inherit;font-weight:700;background:var(--gold);color:#fff;border:none;border-radius:8px;padding:7px 16px;cursor:pointer}
  .page{width:210mm;min-height:297mm;background:#fff;margin:14px auto;padding:16mm 15mm 12mm;position:relative;display:flex;flex-direction:column;box-shadow:0 2px 12px #0002}
  .ph{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid var(--scheme);padding-bottom:6px;margin-bottom:10px}
  .ph-t{font-size:15pt;font-weight:800;color:var(--accent)}
  .ph-n{font-size:9pt;color:var(--sub);font-weight:700}
  .pbody{flex:1}
  .pf{display:flex;justify-content:space-between;font-size:7.5pt;color:var(--sub);border-top:1px solid var(--line);padding-top:5px;margin-top:8px}
  h1{font-size:17pt;line-height:1.35;margin:6px 0;color:var(--ink)}
  h3{font-size:11pt;color:var(--accent);margin:10px 0 6px;padding-left:8px;border-left:4px solid var(--scheme)}
  .hero{background:linear-gradient(135deg,#faf6f0,#f2eadd);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:10px}
  .hero-badge{display:inline-block;color:#fff;font-size:9pt;font-weight:700;padding:3px 12px;border-radius:99px;margin-bottom:8px;background:var(--scheme)}
  .hero-sub{font-size:10pt;color:var(--sub);margin-top:6px}
  .split{display:flex;gap:12px;margin:8px 0}
  .half{flex:1;min-width:0}
  .lead{font-size:10pt;margin:6px 0;text-align:justify}
  .callout{background:#f7f3ec;border-left:4px solid var(--scheme);border-radius:0 8px 8px 0;padding:9px 12px;font-size:9.3pt;margin:8px 0;text-align:justify}
  .callout.small{font-size:8.8pt;padding:8px 10px}
  .figbox{background:#fcfaf6;border:1px solid var(--line);border-radius:10px;padding:10px;margin:8px 0;text-align:center}
  .figbox svg{max-width:440px;height:auto}
  .half .figbox svg{max-width:330px}
  table{width:100%;border-collapse:collapse;font-size:9pt;margin:6px 0}
  .kv td{padding:4px 8px;border-bottom:1px solid var(--line)}
  .kv td:first-child{color:var(--sub);width:42%;font-size:8.6pt}
  .data th{background:#efe9e0;padding:5px 8px;text-align:left;font-size:8.6pt;border:1px solid var(--line)}
  .data td{padding:5px 8px;border:1px solid var(--line)}
  .data .num{text-align:right;font-variant-numeric:tabular-nums}
  .data .sum{font-weight:800;background:#faf7f2}
  .ul{list-style:none;font-size:9.2pt}
  .ul li{padding:4px 0 4px 18px;position:relative}
  .ul li::before{content:"▪";position:absolute;left:2px;color:var(--sub)}
  .ul.on li::before{content:"✓";color:var(--green);font-weight:800}
  .note{font-size:8pt;color:var(--sub);margin-top:6px;text-align:justify}
  @media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;page-break-after:always}.page:last-child{page-break-after:auto}}
"""


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


def ul(items, check=False):
    cls = "ul on" if check else "ul"
    return f'<ul class="{cls}">' + "".join(f"<li>{esc(i)}</li>" for i in items) + "</ul>"


def page(no, title, footer_l, footer_r, body):
    return (f'<section class="page"><div class="ph"><span class="ph-t">{no}. {esc(title)}</span>'
            f'<span class="ph-n">{no} / 10</span></div><div class="pbody">{body}</div>'
            f'<div class="pf"><span>{esc(footer_l)}</span><span>{esc(footer_r)}</span></div></section>')


def fig(svg):
    return f'<div class="figbox">{svg}</div>'


def build_plan_html(pl, scheme, industry_label):
    inv = pl["investment"]
    sub = pl["subsidy"]
    total = inv["total"]
    rate = sub["rate"]
    cap = sub["cap"]
    applied = round(min(cap, total * rate), 1)
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

    # ---- p1 表紙・計画概要
    summary_rows = [
        ("投資総額", f"<b>{total}万円</b>（{esc(inv['unit'])}）"),
        ("活用制度", esc(sub["label"])),
        ("補助率", esc(sub["rateText"])),
        ("補助見込", f'<b style="color:var(--gold)">{applied}万円</b>'),
        ("自己負担", f"{self_pay}万円"),
    ]
    if payback_m:
        summary_rows.append(("投資回収（試算）", f"約{payback_m}ヶ月"))
    kpi_fig_rows = [(eff["model"]["label"], eff["model"]["before"], eff["model"]["after"])]
    for extra in eff.get("modelExtras", [])[:3]:
        kpi_fig_rows.append((extra["label"], extra["before"], extra["after"]))
    body1 = (
        f'<div class="hero"><span class="hero-badge">{esc(sub["label"])} 活用プラン</span>'
        f'<h1>{esc(pl["title"])}</h1><p class="hero-sub">{esc(pl["subtitle"])}</p></div>'
        '<div class="split">'
        f'<div class="half"><h3>モデル事業者（想定）</h3>{kv_table([(k, esc(v)) for k, v in pl["model"]["lines"]])}</div>'
        f'<div class="half"><h3>本計画のサマリー</h3>{kv_table(summary_rows)}</div></div>'
        + fig(sh.bar_before_after(f"主要指標の変化（導入前→導入後・{eff['model']['basis']}）", kpi_fig_rows, accent=sh.GREEN))
        + f'<p class="lead">{esc(pl["problem"]["lead"])}</p>'
        f'<div class="callout"><b>本計画の狙い：</b>{esc(pl["solution"]["aim"])}</div>'
    )
    pages.append(page(1, "計画概要", footer_l, "計画概要", body1))

    # ---- p2 現状と課題分析
    body2 = (
        f'<p class="lead">{esc(pl["problem"]["detail"])}</p>'
        "<h3>現状の課題（定性・定量）</h3>" + ul(pl["problem"]["bullets"])
        + fig(sh.flow_h("現状の業務フロー（手作業中心）", [tuple(s) for s in pl["problem"]["flowSteps"]], accent="#9c8468"))
        + fig(sh.bar_h("現状の作業時間の内訳（月間・モデルケース試算）", [tuple(r) for r in pl["problem"]["laborRows"]], accent="#9c8468", unit="時間"))
        + f'<div class="callout small">{esc(pl["problem"]["callout"])}</div>'
    )
    pages.append(page(2, "現状と課題分析", footer_l, "現状と課題分析", body2))

    # ---- p3 解決策・システム構成
    body3 = (
        f'<p class="lead">{esc(pl["solution"]["overview"])}</p>'
        + fig(sh.system_diagram("導入後のシステム構成", pl["solution"]["center"],
                                [tuple(n) for n in pl["solution"]["nodes"]], accent=scheme))
        + "<h3>構成要素と役割</h3>"
        + data_table(["構成要素", "役割・機能"], [tuple(c) for c in pl["solution"]["components"]])
        + fig(sh.flow_h("導入後の業務フロー", [tuple(s) for s in pl["solution"]["flowSteps"]], accent=scheme))
    )
    pages.append(page(3, "解決策・システム構成", footer_l, "解決策", body3))

    # ---- p4 施策詳細・導入設備
    ba = pl["detail"]["beforeAfter"]
    body4 = (
        f"<h3>実施内容（{esc(pl['category']['name'])}）</h3>"
        + ul(pl["detail"]["points"])
        + "<h3>導入する設備・システム</h3>"
        + data_table(["設備・システム", "仕様・用途"], [tuple(r) for r in pl["detail"]["equipment"]])
        + '<div class="split"><div class="half">'
        + fig(sh.pictogram_row("導入設備のイメージ", [tuple(p) for p in pl["detail"]["pictograms"]], accent=scheme, w=340))
        + '</div><div class="half">'
        + fig(sh.bar_before_after("業務の変化（モデルケース試算）",
                                  [tuple(r) for r in ba], accent=sh.GREEN))
        + '</div></div>' 
    )
    pages.append(page(4, "施策詳細・導入設備", footer_l, "施策詳細", body4))

    # ---- p5 導入スケジュール
    sched_rows = [(s["label"], s["m"][0], s["m"][1]) for s in pl["schedule"]]
    months_total = max(s["m"][1] for s in pl["schedule"])
    body5 = (
        f'<p class="lead">導入は{months_total}ヶ月間を想定し、{esc(pl["scheduleNote"])}</p>'
        + fig(sh.gantt("導入スケジュール（想定）", sched_rows, accent=scheme, months=max(months_total, 6)))
        + "<h3>マイルストーン</h3>"
        + data_table(["フェーズ", "実施内容", "完了目安"],
                     [(f"STEP {i+1}", s["label"], f"{s['m'][1]}ヶ月目") for i, s in enumerate(pl["schedule"])])
        + '<div class="callout small">補助金を活用する場合、交付決定前に発注・契約・支払いを行った経費は原則補助対象外となる。'
        "スケジュールは交付決定日を起点に再調整すること。公募時期は変動するため、申請前に必ず公式サイトで最新情報を確認する。</div>"
    )
    pages.append(page(5, "導入スケジュール", footer_l, "スケジュール", body5))

    # ---- p6 費用計画
    basis_label = "タイプA：分類全体の概算を適用" if inv["basis"] == "A" else "タイプB：分類概算のうち該当設備分の参考試算"
    body6 = (
        f'<p class="lead">投資総額は{total}万円（{esc(inv["unit"])}）。'
        f'本サイト掲載の「{esc(pl["category"]["name"])}」分類の概算データに基づく。</p>'
        + "<h3>費用内訳</h3>"
        + data_table(["費目", "金額"], [(l, f"{v}万円") for l, v in inv["lines"]],
                     sum_row=("合計", f"{total}万円"))
        + fig(sh.cost_stack("費用構成", [tuple(l) for l in inv["lines"]], total, inv["unit"], accent=scheme))
        + f'<div class="callout small"><b>費用の根拠（{basis_label}）：</b>{esc(inv["basisNote"])}</div>'
        + '<p class="note">金額は本サイトの分類別概算（公開情報ベース）であり、実際の見積額は事業者・製品構成により変動する。</p>'
    )
    pages.append(page(6, "費用計画", footer_l, "費用計画", body6))

    # ---- p7 補助金活用計画
    sub_rows = [
        ("活用する制度", esc(sub["label"])),
        ("補助率", esc(sub["rateText"])),
        ("上限額", esc(sub["capText"])),
        ("本計画での補助見込", f"<b>min(上限{cap}万円, {total}万円×{rate:g}) = {applied}万円</b>"),
        ("自己負担額", f"{self_pay}万円"),
    ]
    body7 = (
        f'<p class="lead">{esc(sub["why"])}</p>'
        + "<h3>制度の適用条件と本計画での試算</h3>" + kv_table(sub_rows)
        + fig(sh.waterfall_subsidy(total, applied, self_pay, accent=scheme))
        + fig(sh.flow_h("申請から受給までの流れ（一般的な例）", [tuple(s) for s in sub["flowSteps"]], accent=scheme))
        + '<div class="callout small">'
        + esc(sub.get("note", "")) +
        " 補助率・上限額・公募スケジュールは公募回により変動するため、申請前に必ず公式の公募要領を確認すること。"
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
        '<h3>本サイト掲載の効果データ（出典つき参考値）</h3>' + ul(eff["sourceBullets"])
        + "<h3>モデルケースでの試算</h3>"
        + f'<p class="lead">{esc(eff["modelNote"])}</p>'
        + f'<div class="split"><div class="half">{fig_left}</div><div class="half">{fig_right}</div></div>'
    )
    if monthly and payback_m:
        body8 += f'<div class="callout small"><b>回収試算の前提：</b>{esc(eff["monthlySaving"]["assumption"])}</div>'
    body8 += '<p class="note">効果の数値は導入事例・業界目安に基づく参考値であり、店舗規模・客層・運用により変動する。自店での効果測定と併せて判断すること。</p>'
    pages.append(page(8, "効果試算", footer_l, "効果試算", body8))

    # ---- p9 KPI・PDCA運用
    body9 = (
        f'<p class="lead">{esc(pl["kpiLead"])}</p>'
        + "<h3>KPI（重要業績評価指標）</h3>"
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
        "<h3>想定リスクと対応策</h3>"
        + data_table(["想定リスク", "対応策"], [(r["risk"], r["counter"]) for r in pl["risks"]])
        + '<div class="split"><div class="half">'
        + fig(sh.risk_matrix([(r["short"], r["impact"], r["likelihood"]) for r in pl["risks"]], accent=scheme))
        + '</div><div class="half"><h3>次のアクション</h3>' + ul(pl["actions"], check=True) + '</div></div>' 
        + '<div class="callout small">本計画書は公開情報に基づくモデルケースの試算・提案であり、補助金の採択・支給や効果を保証するものではない。'
        "申請にあたっては各制度の公式サイト・公募要領で最新の要件を確認し、必要に応じて専門家（商工会議所・中小企業診断士・社会保険労務士等）に相談すること。</div>"
    )
    pages.append(page(10, "リスク対応・まとめ", footer_l, "まとめ", body10))

    css = CSS_TMPL.replace("__SCHEME__", scheme)
    toolbar = (f'<div class="toolbar"><span>📄 事業計画書 PLAN {pl["no"]:02d}（{esc(industry_label)}）'
               f'— {esc(sub["label"])} / A4×10ページ</span>'
               f'<span><a href="../index.html">← 60選トップ</a>　'
               '<button onclick="window.print()">🖨 印刷 / PDF保存</button></span></div>')
    return ('<!DOCTYPE html>\n<html lang="ja"><head><meta charset="UTF-8">'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
            f'<title>事業計画書 PLAN {pl["no"]:02d} {esc(pl["title"])}（{esc(industry_label)}・モデルケース）</title>'
            '<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700;800&display=swap" rel="stylesheet">'
            f"<style>{css}</style></head><body>{toolbar}" + "\n".join(pages) + "</body></html>")


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
            html_text = build_plan_html(pl, INDUSTRY_SCHEME[ik], INDUSTRY_LABEL[ik])
            out = os.path.join(outdir, f"plan-{pl['no']:02d}.html")
            with open(out, "w", encoding="utf-8") as f:
                f.write(html_text)
        print(f"OK: {ik} -> {len(plans)} plan docs")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""生成済みの事業計画書 plan-NN.html に、ベンチマーク参考資料ページを差し込む。

2026-07-25ミーティングのネクストアクション（議事録L142、討議L48-49・項目25-27）
「事業計画書に業界平均利益率・採択率傾向・ハードウェア要件注記等を自動反映する」の実装。

■ なぜジェネレーター本体ではなく後処理なのか
  美容業の plan-*.html は beauty-ai-factory 由来の Node スクリプト
  （beauty/_build_plans_v2.js）、飲食業は build_plans.py（Python）で生成されており、
  ジェネレーターが2系統ある。両方に同じ注記ロジックを書くと片方だけ更新される事故が
  起きるため、生成後のHTMLへ冪等にページを差し込む後処理として1本化した。
  → ジェネレーターを再実行したら本スクリプトも再実行すること。

■ 冪等性
  <!-- BENCHMARK_APPENDIX:START --> 〜 :END の間を毎回まるごと置き換える。
  何度実行しても結果は同じ。

実行: python3 apply_benchmarks.py [industry ...]   省略時は data/plans と data/external にある全業種
"""
import json
import os
import re
import sys

import benchmarks as bm

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

START = "<!-- BENCHMARK_APPENDIX:START -->"
END = "<!-- BENCHMARK_APPENDIX:END -->"

INDUSTRY_LABEL = {
    "beauty": "美容業", "food": "飲食業", "lodging": "宿泊業",
    "manufacturing": "製造業", "realestate": "不動産業", "education": "教育・学習支援業",
}
INDUSTRY_ACCENT = {
    "beauty": "#2b5f8a", "food": "#a4453c", "lodging": "#3e6b7a",
    "manufacturing": "#4a5a7a", "realestate": "#3e6b4f", "education": "#7a5a8a",
}


def esc(s):
    return (str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))


# ---------------------------------------------------------------- 計画メタの取り出し
# 業種ごとに計画データの持ち方が違うので、ここで (no -> {schemeKey, investment}) に正規化する。

def load_plan_meta(industry):
    """{plan_no: {"program": 制度キー, "investment": 万円}} を返す。"""
    ext = os.path.join(DATA, "external", industry + ".json")
    if os.path.exists(ext):
        with open(ext, encoding="utf-8") as f:
            d = json.load(f)
        plans = d["plans"] if isinstance(d, dict) else d
        out = {}
        for p in plans:
            # investmentTotal は "180万円" のような表記
            m = re.search(r"[\d,]+", str(p.get("investmentTotal", "")))
            out[p["no"]] = {
                "program": p.get("schemeKey"),
                "investment": int(m.group(0).replace(",", "")) if m else None,
            }
        return out

    internal = os.path.join(DATA, "plans", industry + ".json")
    if os.path.exists(internal):
        with open(internal, encoding="utf-8") as f:
            plans = json.load(f)
        return {p["no"]: {"program": p["subsidy"]["key"],
                          "investment": p["investment"]["total"]} for p in plans}
    return {}


# ---------------------------------------------------------------- 見た目
# 既存2系統のCSSと衝突しないよう .bmk- で名前空間を切り、色も変数に頼らず直書きする。
# .page だけは両系統に存在しA4サイズを与えるため再利用する。

CSS = """
<style>
/* BENCHMARK_APPENDIX: 参考資料ページ専用（既存クラスと衝突しないよう bmk- で名前空間） */
/* A4（297mm）1ページに必ず収める前提。要素を足すときは高さを再測定すること。 */
.bmk-page{font-size:10pt;line-height:1.45}
.bmk-head{display:flex;justify-content:space-between;align-items:center;gap:10px;
  border-bottom:2.5px solid __ACCENT__;padding-bottom:5px;margin-bottom:7px}
.bmk-head-t{font-size:14.5pt;font-weight:900;color:__ACCENT__}
.bmk-head-n{font-size:8.8pt;font-weight:700;color:#6f675e;white-space:nowrap}
.bmk-lead{font-size:9.3pt;color:#6f675e;margin-bottom:7px;text-align:justify}
.bmk-sec{margin:0 0 8px}
.bmk-h{font-size:11pt;font-weight:800;color:__ACCENT__;margin:0 0 4px;padding-left:8px;
  border-left:4px solid __ACCENT__;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.bmk-chip{font-size:8.4pt;font-weight:800;color:#fff;background:__ACCENT__;
  border-radius:99px;padding:1px 9px;letter-spacing:.02em}
.bmk-chip.warn{background:#b3372c}
.bmk-chip.ok{background:#3e6b4f}
.bmk-chip.flat{background:#6f675e}
.bmk-t{width:100%;border-collapse:collapse;font-size:9.4pt;margin:3px 0}
.bmk-t th{background:#efe9e0;border:1px solid #d9d2c8;padding:2.5px 7px;text-align:left;
  font-size:8.9pt;white-space:nowrap}
.bmk-t td{border:1px solid #d9d2c8;padding:2.5px 7px;vertical-align:top}
.bmk-t .num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.bmk-t .fill{color:#7d746c;letter-spacing:.08em}
.bmk-t.center th,.bmk-t.center td{text-align:center}
.bmk-box{background:#f8f5f0;border-left:4px solid __ACCENT__;border-radius:0 7px 7px 0;
  padding:4px 9px;font-size:9.3pt;margin:3px 0;text-align:justify}
.bmk-box.alert{border-left-color:#b3372c;background:#fdf3f1}
.bmk-box b{color:__ACCENT__}
.bmk-box.alert b{color:#b3372c}
.bmk-axes{font-size:9.1pt;margin:3px 0 0}
.bmk-axes div{padding:1px 0 1px 10px;position:relative;text-align:justify}
.bmk-axes div::before{content:"▪";position:absolute;left:0;color:#9c948b}
.bmk-axes b{color:__ACCENT__}
.bmk-note{font-size:8.3pt;color:#7d746b;margin-top:2px;text-align:justify;line-height:1.4}
.bmk-src{font-size:7.9pt;color:#7d746b;line-height:1.42;list-style:none;padding:0;margin:3px 0 0}
.bmk-src li{padding:1px 0 1px 12px;position:relative;word-break:break-all}
.bmk-src li::before{content:"※";position:absolute;left:0}
.bmk-foot{display:flex;justify-content:space-between;font-size:8.3pt;color:#6f675e;
  border-top:1px solid #d9d2c8;padding-top:4px;margin-top:7px}
</style>
"""


def sec(title, chip, chip_cls, inner):
    chip_html = f'<span class="bmk-chip {chip_cls}">{esc(chip)}</span>' if chip else ""
    return (f'<div class="bmk-sec"><div class="bmk-h">{esc(title)}{chip_html}</div>{inner}</div>')


# ---------------------------------------------------------------- 各ブロック

# benchmarks.json の hardwareSoftwareNotes[].requirement を日本語チップに直す。
# キーを増やしたらここも足すこと（未登録キーはチップ非表示になる）。
REQUIREMENT_LABEL = {
    "hardware_required": "ハードと一体で必須",
    "hardware_only": "登録ハードのみ",
    "software_centric": "ソフト中心・ハード原則対象外",
    "equipment_plus_wage_increase": "設備＋賃上げが必須",
    "lease_only": "リース契約に限定",
    "no_equipment": "設備投資は対象外",
}


def block_scale(scale):
    if not scale:
        return ""
    if scale["mode"] == "judged":
        chip, cls = ("目安内", "ok") if scale["ok"] else ("目安超過", "warn")
        cells = [
            ("投資総額", f'{scale["investmentManYen"]:,.0f}万円'),
            ("前提とする年商", f'{scale["annualRevenueManYen"]:,.0f}万円'),
            ("年商に対する比率", f'{scale["ratio"]:.1%}'),
            ("目安（年商の1/3）", f'{scale["limit_man_yen"]:,.0f}万円'),
        ]
        box_cls = "bmk-box" if scale["ok"] else "bmk-box alert"
    else:
        chip, cls = "自店の年商で要確認", "flat"
        cells = [
            ("投資総額", f'{scale["investmentManYen"]:,.0f}万円'),
            ("目安に収まる年商ライン", f'{scale["requiredRevenueManYen"]:,}万円以上'),
            ("自店の直近年商", '<span class="fill">（　　　万円）</span>'),
        ]
        box_cls = "bmk-box"
    # 4項目を縦に並べるとA4に収まらないため横1行の表にする
    body = ('<table class="bmk-t center"><thead><tr>'
            + "".join(f"<th>{esc(k)}</th>" for k, _ in cells)
            + "</tr></thead><tbody><tr>"
            + "".join(f'<td class="num">{v if v.startswith("<") else esc(v)}</td>' for _, v in cells)
            + "</tr></tbody></table>"
            f'<div class="{box_cls}">{esc(scale["message"])}</div>')
    body += f'<div class="bmk-note">{esc(scale["note"])}</div>'
    return sec("申請規模の妥当性", chip, cls, body)


def block_hardware(hw):
    if not hw:
        return ('<div class="bmk-sec"><div class="bmk-h">対象経費のハード・ソフト要件</div>'
                '<div class="bmk-box">本制度はハード／ソフトの組み合わせに関する特記事項を'
                '本データベースに登録していない。公募要領の「補助対象経費」章で確認すること。</div></div>')
    # 未知の requirement で英語キーがそのまま申請書に出ないよう、辞書に無ければチップを出さない
    label = REQUIREMENT_LABEL.get(hw["requirement"], "")
    # 要件そのものは「外すと対象外になる」注意書きなので常に警告スタイルで出す
    body = (f'<div class="bmk-box alert">'
            f'<b>{esc(hw["programLabel"])}：</b>{esc(hw["note"])}</div>'
            f'<div class="bmk-box"><b>計画書での書き方：</b>{esc(hw["planNote"])}</div>')
    return sec("対象経費のハード・ソフト要件", label, "warn", body)


def block_adoption(ad):
    if not ad:
        return ""
    competitive = ad.get("screeningType") == "competitive"
    chip = "競争審査型" if competitive else "要件充足型"
    body = ""
    rates = ad.get("rates") or []
    if rates:
        # rate は 0.693 のような小数で入っているので百分率に直して出す
        body += ('<table class="bmk-t center"><thead><tr><th>公募回</th><th>採択率</th>'
                 "<th>申請件数</th><th>採択件数</th><th>公表日</th></tr></thead><tbody>"
                 + "".join('<tr><td>{r}</td><td class="num">{p}</td><td class="num">{a}</td>'
                           '<td class="num">{d}</td><td>{o}</td></tr>'.format(
                               r=esc(r["round"]),
                               p=f'{r["rate"]:.1%}' if isinstance(r.get("rate"), (int, float)) else esc(r.get("rate", "—")),
                               a=f'{r["applied"]:,}件' if r.get("applied") else "—",
                               d=f'{r["adopted"]:,}件' if r.get("adopted") else "—",
                               o=esc(r.get("publishedOn", "—")))
                           for r in rates)
                 + "</tbody></table>")
    body += f'<div class="bmk-box"><b>計画書での勘所：</b>{esc(ad["planNote"])}</div>'
    axes = ad.get("screeningAxes")
    if axes:
        # 表にすると4行ぶん高さを食うのでインライン列挙にする
        body += ('<div class="bmk-axes">'
                 + "".join(f'<div><b>{esc(a["name"])}</b>／{esc(a["content"])}</div>'
                           for a in axes["axes"])
                 + "</div>")
    return sec("採択率傾向・審査で見られる観点", chip, "warn" if competitive else "ok", body)


def block_industry(ind, industry_label):
    if ind.get("available"):
        om = ind["all"]
        # 採用する統計値のキーは benchmarks.json の _statisticChoice.recommended に従う
        rows = [
            ("黒字かつ自己資本プラス企業の平均", om.get(ind["statistic"]), "目標水準として採用"),
            ("全企業の平均値", om.get("avg"), "赤字企業を含むため目標には使わない"),
            ("中央値", om.get("median"), "参考"),
        ]
        body = ('<table class="bmk-t"><thead><tr><th>統計値の種別</th><th>売上高営業利益率</th>'
                "<th>本計画での扱い</th></tr></thead><tbody>"
                + "".join(f'<tr><th>{esc(k)}</th><td class="num">{v}%</td><td>{esc(u)}</td></tr>'
                          for k, v, u in rows)
                + '<tr><th>自店の直近営業利益率</th><td class="num fill">（　　　％）</td>'
                "<td>記入して上記と比較する</td></tr>"
                "</tbody></table>")
        if ind.get("comparison"):
            body += f'<div class="bmk-box">{esc(ind["comparison"])}</div>'
        body += (f'<div class="bmk-note">標本: {esc(ind.get("population", ""))}'
                 f'{esc(ind.get("sampleCaveat", ""))}</div>')
        chip, cls = f'{industry_label} {ind["benchmarkPct"]}%', "flat"
    elif ind.get("excludedByPolicy"):
        body = (f'<div class="bmk-box"><b>本業種は業界平均を掲載しない。</b>{esc(ind["message"])}</div>'
                f'<div class="bmk-box"><b>代わりに示すもの：</b>{esc(ind.get("planGuidance", ""))}</div>')
        chip, cls = "業界平均は不採録", "flat"
    else:
        body = f'<div class="bmk-box alert">{esc(ind.get("message", "業界平均は未取得。"))}</div>'
        chip, cls = "未取得", "warn"
    return sec("業界平均利益率との比較", chip, cls, body)


# ---------------------------------------------------------------- ページ組み立て

def block_tax():
    """税務上の注意。2026-08-02の税理士監修で、60本すべてに税込/税抜・益金算入の
    記載が無いと指摘を受けて追加した。参考資料ページは1枚に収める制約があるため、
    見出し付きの節ではなく1行の注意書きにしている（節にすると印刷が1ページ増える）。"""
    return ('<div class="bmk-box alert"><b>税務上の注意：</b>金額は税抜。'
            '補助金は益金として課税対象で、固定資産に充てた場合は圧縮記帳（課税の繰延べ）の'
            '余地がある。仕訳は税理士に確認する。</div>')


def build_appendix(industry, plan_no, program_key, investment, footer_left):
    label = INDUSTRY_LABEL.get(industry, industry)
    mbiz = bm.model_business(industry) or {}
    revenue = mbiz.get("annualRevenueManYen")
    notes = bm.plan_notes(industry=industry, program_key=program_key,
                          investment_man_yen=investment,
                          annual_revenue_man_yen=revenue)

    body = (block_scale(notes["scale"]) + block_hardware(notes["hardware"])
            + block_adoption(notes["adoption"]) + block_industry(notes["industry"], label)
            + block_tax())

    foot = notes["footnotes"]
    src = ('<div class="bmk-sec"><div class="bmk-h">出典</div><ul class="bmk-src">'
           + "".join(f"<li>{esc(x)}</li>" for x in foot)
           + "</ul></div>")

    return (
        f"{START}\n"
        + CSS.replace("__ACCENT__", INDUSTRY_ACCENT.get(industry, "#4a5a7a"))
        + '<section class="page bmk-page">'
        '<div class="bmk-head"><span class="bmk-head-t">参考資料：計画の妥当性チェック</span>'
        f'<span class="bmk-head-n">{esc(label)} / PLAN {plan_no:02d} / 自動生成</span></div>'
        '<p class="bmk-lead">審査で問われやすい点を計画書とセットで確認するための参考ページ。'
        '数値は出典つきの公開データのみで、推計値は含まない。</p>'
        + body + src
        + f'<div class="bmk-foot"><span>{esc(footer_left)}</span><span>参考資料</span></div>'
        "</section>\n"
        + END
    )


def apply_to_file(path, industry, plan_no, program_key, investment):
    with open(path, encoding="utf-8") as f:
        html = f.read()
    # 前回のブロックは前後の空白ごと落とす。残すと再実行のたびに空行が1つずつ増える
    html = re.sub(r"\s*" + re.escape(START) + r".*?" + re.escape(END) + r"\s*",
                  "\n", html, flags=re.S)
    m = re.search(r"<title>(.*?)</title>", html, re.S)
    footer_left = re.sub(r"\s+", " ", m.group(1)).strip() if m else INDUSTRY_LABEL.get(industry, "")
    block = build_appendix(industry, plan_no, program_key, investment, footer_left)
    if "</body>" not in html:
        raise RuntimeError(f"{path}: </body> が見つからない")
    # 印刷用レポートのHTMLをJSの文字列で持つページがあり（proto-*.html に実例あり）、
    # 最初の </body> はその文字列の中かもしれない。必ず最後の </body> の直前に入れる。
    #
    # ただし計画書は狭い画面向けに全ページを <div class="sheets"> で包んでいる
    # （横スクロールを書類の領域だけに閉じ込めるため）。参考資料ページもA4なので、
    # sheets の外に置くとそのページだけページ全体を横に押し広げてしまう。
    # sheets がある場合はその内側の末尾に入れる。
    # 生成側が置いた目印の直前に入れる。閉じタグの並びで探すと、後から
    # add_analytics.py が </body> の手前に解析タグを差し込んだ時点で位置がずれ、
    # 参考資料ページだけ sheets の外に出てしまう（実際に一度そうなった）。
    marker = "<!-- SHEETS:END -->"
    if marker in html:
        head, _, tail = html.rpartition(marker)
        html = head.rstrip() + "\n" + block + "\n" + marker + tail
        with open(path, "w", encoding="utf-8") as f:
            f.write(html)
        return
    head, _, tail = html.rpartition("</body>")
    html = head.rstrip() + "\n" + block + "\n</body>" + tail
    with open(path, "w", encoding="utf-8") as f:
        f.write(html)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    # 省略時は計画データのある業種すべて。業種を足すたびに引数を書き換える運用だと、
    # 新業種の計画書にだけ参考資料ページが付かない事故が起きる。
    industries = sys.argv[1:]
    if not industries:
        found = set()
        for sub in ("plans", "external"):
            d = os.path.join(DATA, sub)
            if os.path.isdir(d):
                found |= {f[:-5] for f in os.listdir(d) if f.endswith(".json")}
        industries = sorted(found)
    for ik in industries:
        meta = load_plan_meta(ik)
        if not meta:
            print(f"SKIP: {ik} の計画データが見つからない")
            continue
        outdir = os.path.join(IMPROVEMENT, ik)
        done = 0
        for no, info in sorted(meta.items()):
            path = os.path.join(outdir, f"plan-{no:02d}.html")
            if not os.path.exists(path):
                print(f"  ! {ik} plan-{no:02d}.html が無い（未生成）")
                continue
            if not info["program"]:
                print(f"  ! {ik} plan-{no:02d} に制度キーが無い")
                continue
            apply_to_file(path, ik, no, info["program"], info["investment"])
            done += 1
        print(f"OK: {ik} -> {done} 件に参考資料ページを反映")


if __name__ == "__main__":
    main()

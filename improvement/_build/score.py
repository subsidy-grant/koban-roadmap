# -*- coding: utf-8 -*-
"""600施策(6業種×100)のStage-1機械スコアリングと pdca.html(選定透明性ページ)の生成。

スコア軸(重み):
  E 効果エビデンス   0.30  effectBullets の定量性・確度(effectTitle の確度表記で判定)
  C コスト効率       0.20  カテゴリ概算コストの逆数バケット
  S 補助金カバー率   0.20  min(CAP, cost×RATE_BASE)/cost の最良値
  P 回収見込み       0.15  effectBullets に金額/時間の定量値があるか
  D 導入容易性       0.15  施策文字列のキーワード(SaaS系=易 〜 工事/ロボット=難)

Stage-2(編集評価)の採択結果は data/plans/{industry}.json が存在する業種のみ反映される。
実行: python3 score.py   → data/scores/*.json と ../pdca.html を再生成(冪等)
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

WEIGHTS = {"E": 0.30, "C": 0.20, "S": 0.20, "P": 0.15, "D": 0.15}
INDUSTRY_ORDER = ["beauty", "food", "lodging", "manufacturing", "realestate", "education"]

EASY_RE = re.compile(r"システム|クラウド|アプリ|ソフト|ツール|SaaS|管理|配信|デジタル|オンライン|電子|AI|分析|自動化")
MID_RE = re.compile(r"機器|端末|レジ|タブレット|センサー|カメラ|照明|チェア|プリンタ|検温|ディスペンサー|キオスク")
HARD_RE = re.compile(r"ロボット|工事|改装|改修|太陽光|バリアフリー|設置|増設|空調|オーブン|洗浄機|滅菌")


def score_E(cat):
    title = cat.get("effectTitle", "")
    bullets = " ".join(cat.get("effectBullets", []))
    has_numeric = bool(re.search(r"\d+(\.\d+)?\s*(%|％|倍|時間|分|円|pt|割)", bullets))
    if has_numeric and "要検証" not in title and "業界目安" not in title:
        return 5
    if has_numeric:
        return 3
    return 1


def score_C(cost):
    if cost <= 30:
        return 5
    if cost <= 60:
        return 4
    if cost <= 120:
        return 3
    if cost <= 250:
        return 2
    return 1


def score_S(cat, rate_base, cap):
    cost = cat["cost"]
    best = 0.0
    for p in cat.get("programs", []):
        k = p["key"]
        if k not in rate_base:
            continue  # career/jinzai 等の人件費型は設備費カバーに寄与しないため除外
        coverage = min(cap.get(k, 0), cost * rate_base[k]) / cost if cost else 0
        best = max(best, coverage)
    return round(min(best, 1.0) * 5, 1)


def score_P(cat):
    bullets = " ".join(cat.get("effectBullets", []))
    if re.search(r"\d+(\.\d+)?\s*万?円", bullets):
        return 4
    if re.search(r"\d+(\.\d+)?\s*(時間|分)", bullets):
        return 3.5
    return 3


def score_D(item):
    if HARD_RE.search(item):
        return 2
    if MID_RE.search(item):
        return 3
    if EASY_RE.search(item):
        return 5
    return 3


def build_scores(data):
    rate_base = data["RATE_BASE"]
    cap = data["CAP"]
    all_scores = {}
    for ik in INDUSTRY_ORDER:
        ind = data["INDUSTRIES"][ik]
        rows = []
        for cat in ind["categories"]:
            e = score_E(cat)
            c = score_C(cat["cost"])
            s = score_S(cat, rate_base, cap)
            p = score_P(cat)
            for idx, item in enumerate(cat["items"]):
                d = score_D(item)
                weighted = round(
                    WEIGHTS["E"] * e + WEIGHTS["C"] * c + WEIGHTS["S"] * s
                    + WEIGHTS["P"] * p + WEIGHTS["D"] * d, 3)
                rows.append({
                    "catRank": cat["rank"], "catName": cat["name"], "itemIdx": idx,
                    "item": item, "cost": cat["cost"], "unit": cat["unit"],
                    "programs": [pr["key"] for pr in cat.get("programs", [])],
                    "E": e, "C": c, "S": s, "P": p, "D": d, "weighted": weighted,
                })
        rows.sort(key=lambda r: (-r["weighted"], r["catRank"], r["itemIdx"]))
        for i, r in enumerate(rows):
            r["rank"] = i + 1
        # Stage-2 採択(plans/*.json があれば反映)
        plan_path = os.path.join(DATA, "plans", ik + ".json")
        selected_map = {}
        if os.path.exists(plan_path):
            with open(plan_path, encoding="utf-8") as f:
                plans = json.load(f)
            for pl in plans:
                selected_map[(pl["category"]["rank"], pl["itemIdx"])] = pl
        for r in rows:
            key = (r["catRank"], r["itemIdx"])
            r["selected"] = key in selected_map
            if r["selected"]:
                r["planNo"] = selected_map[key]["no"]
                r["stage2Note"] = selected_map[key].get("stage2Note", "")
        all_scores[ik] = rows
    return all_scores


# ---------------------------------------------------------------- pdca.html

PDCA_CSS = """
  :root { --paper:#eef0ea; --paper-raised:#f8f9f4; --ink:#1b2420; --ink-soft:#4a564d;
    --ink-faint:#7c8880; --accent:#a8752f; --accent-wash:#f2e9d6; --sage:#5f7360;
    --sage-wash:#e2e8de; --rust:#9c5539; --line:#d5cfbf; }
  @media (prefers-color-scheme: dark) { :root { --paper:#12181a; --paper-raised:#182020;
    --ink:#ece8e0; --ink-soft:#b7bdb0; --ink-faint:#838f83; --accent:#dcab5c;
    --accent-wash:#2b2313; --sage:#93a88d; --sage-wash:#202823; --rust:#d1937a; --line:#2c342e; } }
  :root[data-theme="dark"] { --paper:#12181a; --paper-raised:#182020; --ink:#ece8e0;
    --ink-soft:#b7bdb0; --ink-faint:#838f83; --accent:#dcab5c; --accent-wash:#2b2313;
    --sage:#93a88d; --sage-wash:#202823; --rust:#d1937a; --line:#2c342e; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--paper); color:var(--ink); line-height:1.8;
    font-family:"Noto Sans JP","Yu Gothic Medium","Hiragino Sans","Meiryo",sans-serif; }
  main { max-width: 960px; margin: 0 auto; padding: 2.5rem 1.5rem 4rem; }
  h1 { font-size: 1.6rem; margin: 0 0 0.4rem; }
  h2 { font-size: 1.15rem; margin: 2.4rem 0 0.8rem; border-left: 4px solid var(--accent); padding-left: 0.7rem; }
  .sub { color: var(--ink-soft); font-size: 0.9rem; }
  .box { background: var(--paper-raised); border:1px solid var(--line); border-radius:8px; padding:1.1rem 1.3rem; margin-top:1rem; }
  .funnel { display:flex; flex-wrap:wrap; gap:0.6rem; margin-top:1rem; }
  .funnel .step { flex:1; min-width:150px; background:var(--paper-raised); border:1px solid var(--line);
    border-radius:8px; padding:0.8rem 1rem; text-align:center; }
  .funnel .step .n { font-size:1.5rem; font-weight:700; color:var(--accent); }
  .funnel .step .t { font-size:0.78rem; color:var(--ink-soft); }
  table { width:100%; border-collapse:collapse; font-size:0.82rem; min-width:640px; }
  .twrap { overflow-x:auto; border:1px solid var(--line); border-radius:6px; background:var(--paper-raised); margin-top:0.8rem; }
  th { text-align:left; font-size:0.7rem; color:var(--ink-faint); padding:0.6rem 0.7rem; border-bottom:1px solid var(--line); white-space:nowrap; }
  td { padding:0.5rem 0.7rem; border-bottom:1px solid var(--line); vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  tr.sel { background: var(--sage-wash); }
  .num { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
  details { margin-top:0.8rem; }
  summary { cursor:pointer; font-weight:600; padding:0.5rem 0; }
  .badge { display:inline-block; font-size:0.7rem; font-weight:700; border-radius:100px;
    padding:0.1rem 0.6rem; background:var(--sage-wash); color:var(--sage); margin-left:0.5rem; }
  .badge.pending { background:var(--accent-wash); color:var(--accent); }
  .cards { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:0.8rem; margin-top:1rem; }
  .card { background:var(--paper-raised); border:1px solid var(--line); border-radius:8px; padding:0.9rem 1.1rem; }
  .card .no { font-size:0.7rem; font-weight:700; color:var(--accent); }
  .card .ttl { font-weight:600; font-size:0.9rem; margin:0.2rem 0 0.4rem; }
  .card .meta { font-size:0.76rem; color:var(--ink-faint); }
  a { color: var(--accent); }
  .back { font-size:0.85rem; }
"""


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def render_pdca(data, all_scores):
    parts = []
    parts.append('<!DOCTYPE html><html lang="ja"><head><meta charset="UTF-8">')
    parts.append('<meta name="viewport" content="width=device-width, initial-scale=1.0">')
    parts.append('<title>改善プラン選定の考え方（PDCA・スコアリング） | 補助金活用 業務改善ロードマップ</title>')
    parts.append('<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap" rel="stylesheet">')
    parts.append("<style>" + PDCA_CSS + "</style></head><body><main>")
    parts.append('<p class="back"><a href="index.html">← 改善プラン10選 トップへ</a> ／ <a href="../index.html">ロードマップ本体へ</a></p>')
    parts.append("<h1>改善プラン選定の考え方</h1>")
    parts.append('<p class="sub">6業種×100施策（計600施策）から、費用対効果・業務改善効率の高い各10案（計60案）をどう選んだかの全記録。'
                 "スコアは機械的に再計算可能で、編集判断はすべて採択理由として明記しています。</p>")

    total = sum(len(v) for v in all_scores.values())
    n_selected = sum(1 for v in all_scores.values() for r in v if r.get("selected"))
    parts.append('<div class="funnel">')
    parts.append(f'<div class="step"><div class="n">{total}</div><div class="t">P：全施策（6業種×100）</div></div>')
    parts.append('<div class="step"><div class="n">5軸</div><div class="t">D：機械スコアリング</div></div>')
    parts.append('<div class="step"><div class="n">上位25×6</div><div class="t">C：編集評価（具体性・多様性）</div></div>')
    parts.append(f'<div class="step"><div class="n">{n_selected or "60"}</div><div class="t">A：採択（各業種10案）</div></div>')
    parts.append("</div>")

    parts.append("<h2>スコアリング基準（Stage 1・機械評価）</h2>")
    parts.append('<div class="box"><div class="twrap"><table>')
    parts.append("<thead><tr><th>軸</th><th>内容</th><th>重み</th></tr></thead><tbody>")
    rows = [
        ("E 効果エビデンス", "効果の定量値あり＋確度表記が「参考値」=5点／定量値ありだが「業界目安・要検証」=3点／定性のみ=1点", "0.30"),
        ("C コスト効率", "分類の概算コスト 30万円以下=5点 〜 250万円超=1点（5段階）", "0.20"),
        ("S 補助金カバー率", "対応制度のうち最大の min(上限額, コスト×補助率)÷コスト を5点換算（人件費型の制度は除外）", "0.20"),
        ("P 回収見込み", "効果記述に金額の定量値=4点／時間の定量値=3.5点／それ以外=3点", "0.15"),
        ("D 導入容易性", "SaaS・クラウド系=5点／機器設置系=3点／工事・ロボット系=2点（施策文のキーワード判定）", "0.15"),
    ]
    for name, desc, w in rows:
        parts.append(f"<tr><td><strong>{esc(name)}</strong></td><td>{esc(desc)}</td><td class='num'>{w}</td></tr>")
    parts.append("</tbody></table></div>")
    parts.append('<p class="sub" style="margin:0.8rem 0 0;">Stage 2（編集評価）では、機械スコア上位25案を対象に「施策の具体性」「試作システムとして形にできるか」'
                 "「多様性（同一分類から2案まで・6分類以上・対応補助制度3種以上）」を審査し、各業種10案を確定します。採択理由は下の各業種の表・カードに記載。</p></div>")

    parts.append("<h2>費用の帰属ルール（重要）</h2>")
    parts.append('<div class="box"><p style="margin:0;">本サイトの費用データは「分類」単位の概算です。個別施策の事業計画書では次のルールで費用を扱い、'
                 "行項目より細かい金額の創作はしていません。</p><ul style='margin:0.6rem 0 0; padding-left:1.2rem;'>"
                 "<li><strong>タイプA</strong>（施策が分類の中核）：分類全体の概算をそのまま適用し「分類全体の概算」と明記</li>"
                 "<li><strong>タイプB</strong>（施策が分類の一部）：該当する設備・費目のみの参考試算とし「分類概算◯◯万円のうち該当設備分」と明記</li>"
                 "</ul></div>")

    ind_labels = {ik: data["INDUSTRIES"][ik]["label"] for ik in INDUSTRY_ORDER}
    for ik in INDUSTRY_ORDER:
        rows = all_scores[ik]
        selected = [r for r in rows if r.get("selected")]
        status = ('<span class="badge">採択確定</span>' if selected
                  else '<span class="badge pending">候補選定中（スコア確定済み）</span>')
        parts.append(f"<h2>{esc(ind_labels[ik])}{status}</h2>")

        if selected:
            selected.sort(key=lambda r: r["planNo"])
            parts.append('<div class="cards">')
            for r in selected:
                parts.append('<div class="card">')
                parts.append(f'<div class="no">PLAN {r["planNo"]:02d}｜スコア {r["weighted"]:.2f}（{r["rank"]}位/100）</div>')
                parts.append(f'<div class="ttl">{esc(r["item"])}</div>')
                parts.append(f'<div class="meta">{esc(r["catName"])}／概算 {r["cost"]}{esc(r["unit"])}</div>')
                if r.get("stage2Note"):
                    parts.append(f'<div class="meta" style="margin-top:0.4rem;">採択理由：{esc(r["stage2Note"])}</div>')
                parts.append("</div>")
            parts.append("</div>")

        parts.append(f"<details><summary>全100施策のスコア表を開く（{esc(ind_labels[ik])}）</summary>")
        parts.append('<div class="twrap"><table><thead><tr><th>順位</th><th>施策</th><th>分類</th>'
                     '<th class="num">E</th><th class="num">C</th><th class="num">S</th><th class="num">P</th><th class="num">D</th>'
                     '<th class="num">総合</th><th>採択</th></tr></thead><tbody>')
        for r in rows:
            cls = ' class="sel"' if r.get("selected") else ""
            sel = f'✔ PLAN {r["planNo"]:02d}' if r.get("selected") else ""
            parts.append(f"<tr{cls}><td class='num'>{r['rank']}</td><td>{esc(r['item'])}</td><td>{esc(r['catName'])}</td>"
                         f"<td class='num'>{r['E']}</td><td class='num'>{r['C']}</td><td class='num'>{r['S']}</td>"
                         f"<td class='num'>{r['P']}</td><td class='num'>{r['D']}</td>"
                         f"<td class='num'><strong>{r['weighted']:.2f}</strong></td><td>{sel}</td></tr>")
        parts.append("</tbody></table></div></details>")

    parts.append('<p class="sub" style="margin-top:2.5rem;">スコア・採択情報は improvement/_build/ 配下のスクリプトとデータから再現できます。'
                 "本ページの内容は選定プロセスの透明性確保を目的とした参考情報であり、個別事業者への効果を保証するものではありません。</p>")
    parts.append("</main></body></html>")
    return "\n".join(parts)


def main():
    with open(os.path.join(DATA, "industries.json"), encoding="utf-8") as f:
        data = json.load(f)
    all_scores = build_scores(data)
    os.makedirs(os.path.join(DATA, "scores"), exist_ok=True)
    for ik, rows in all_scores.items():
        with open(os.path.join(DATA, "scores", ik + ".json"), "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)
    out = os.path.join(IMPROVEMENT, "pdca.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(render_pdca(data, all_scores))
    n_sel = sum(1 for v in all_scores.values() for r in v if r.get("selected"))
    print(f"OK: scores for {len(all_scores)} industries, {n_sel} selected -> pdca.html")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""600施策(6業種×100)のStage-1機械スコアリング。

2026-08-02まではこの結果を improvement/pdca.html（選定の考え方ページ）として
公開していたが、本人指示でページごと廃止した。スコアの数値自体は
build_plan_data.py の突き合わせ検証が今も使うため、算出は残している。

スコア軸(重み):
  E 効果エビデンス   0.30  effectBullets の定量性・確度(effectTitle の確度表記で判定)
  C コスト効率       0.20  カテゴリ概算コストの逆数バケット
  S 補助金カバー率   0.20  min(CAP, cost×RATE_BASE)/cost の最良値
  P 回収見込み       0.15  effectBullets に金額/時間の定量値があるか
  D 導入容易性       0.15  施策文字列のキーワード(SaaS系=易 〜 工事/ロボット=難)

Stage-2(編集評価)の採択結果は data/plans/{industry}.json が存在する業種のみ反映される。
実行: python3 score.py   → data/scores/*.json を再生成(冪等)
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




def main():
    with open(os.path.join(DATA, "industries.json"), encoding="utf-8") as f:
        data = json.load(f)
    all_scores = build_scores(data)
    os.makedirs(os.path.join(DATA, "scores"), exist_ok=True)
    for ik, rows in all_scores.items():
        with open(os.path.join(DATA, "scores", ik + ".json"), "w", encoding="utf-8") as f:
            json.dump(rows, f, ensure_ascii=False, indent=1)

    n_sel = sum(1 for v in all_scores.values() for r in v if r.get("selected"))
    print(f"OK: scores for {len(all_scores)} industries, {n_sel} selected -> data/scores/")


if __name__ == "__main__":
    main()

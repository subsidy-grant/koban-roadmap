# -*- coding: utf-8 -*-
"""plan_src/{industry}.py の圧縮スペックから data/plans/{industry}.json を生成する。

なぜ中間層を挟むか:
  data/plans/*.json は1案あたり約15KBあり、10案で150KB。手書きすると
  「制度ごとに同じ申請フロー図を10回書く」「補助見込の計算を手入力する」
  といった重複と転記ミスが必ず出る。制度・共通文言はここで一元化し、
  案ごとに書くのは「その案でしか言えないこと」だけにする。

  したがって data/plans/{lodging,manufacturing,realestate,education}.json は
  生成物であり、直接編集しないこと（次回生成で消える）。編集は plan_src/ 側。
  food.json は手書き時代の資産のため対象外（plan_src に無い業種は触らない）。

実行: python3 build_plan_data.py [industry ...]   省略時は plan_src/ にある全業種
"""
import importlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
SRC = os.path.join(HERE, "plan_src")

# ---- 制度マスタ -------------------------------------------------------------
# rate / cap は build_plans.py が min(cap, total*rate) を計算するための数値。
# rateText / capText は表示用（枠や条件の但し書きを含む）。
# 数値は index.html の PROGRAMS と揃えること（ズレると本体サイトと食い違う）。
SCHEMES = {
    "ai": dict(
        label="デジタル化・AI導入補助金2026", rate=0.5, cap=450,
        rateText="1/2以内（要件充足で2/3）", capText="450万円（通常枠）",
        flowSteps=[["準備", "GビズID取得\nIT導入支援事業者選定"], ["申請", "交付申請\n（電子申請）"],
                   ["交付決定", "決定後に\n契約・発注"], ["導入・報告", "事業実施\n実績報告"],
                   ["受給", "補助金の\n入金"]],
        note="申請はIT導入支援事業者（登録ベンダー）と共同で行い、対象ツールは事前登録されたものから選定する。"),
    "jizoku": dict(
        label="小規模事業者持続化補助金", rate=0.667, cap=50,
        rateText="2/3以内", capText="50万円（通常枠）。賃金引上げ特例等の上乗せ額は公募回ごとに異なる",
        flowSteps=[["準備", "商工会議所へ\n相談"], ["計画作成", "経営計画書\n補助事業計画書"],
                   ["申請", "様式提出\n（電子申請）"], ["採択・実施", "交付決定後に\n発注・実施"],
                   ["報告・受給", "実績報告\n→入金"]],
        note="申請には地域の商工会議所・商工会の支援（様式4の発行）が必要。対象は小規模事業者（商業・サービス業は常時使用する従業員5人以下、製造業その他・宿泊業・娯楽業は20人以下）。賃金引上げの特例を使う場合、表明した賃金水準が未達だと補助金が支給されない。"),
    "shoryokuka": dict(
        # cap は「この改善計画のモデル事業者に実際に適用される上限額」。
        # 各業種のモデルは従業員5名前後の小規模事業者を想定しているので、5人以下の区分
        # 200万円を使う（2026年3月19日の改定後。改定前は500万円だった）。
        # 出典 https://shoryokuka.smrj.go.jp/catalog/about/ （2026-08-16確認）
        label="中小企業省力化投資補助金（カタログ注文型）", rate=0.5, cap=200,
        rateText="1/2（小規模事業者は2/3）", capText="5人以下は200万円（賃上げ要件達成で300万円）。6〜20人は500万円（750万円）、21人以上は1,000万円（1,500万円）",
        flowSteps=[["準備", "GビズID取得\nカタログ確認"], ["製品選定", "登録製品・\n販売事業者を選ぶ"],
                   ["申請", "販売事業者と\n共同申請"], ["交付決定", "決定後に\n発注・設置"],
                   ["報告・受給", "実績報告\n→入金"]],
        note="カタログに掲載されたハードウェア製品のみが対象。導入する製品がカタログに登録済みであることを申請前に必ず確認する。"),
    "shoryokuka_ippan": dict(
        key="shoryokuka",  # 制度としては同一。カタログ注文型と一般型で上限額だけが違う
        label="中小企業省力化投資補助金＜一般型＞", rate=0.5, cap=750,
        rateText="1/2（小規模事業者・再生事業者は2/3）", capText="一般型。従業員規模により変動し、小規模な事業者で750万円程度〜最大8,000万円",
        flowSteps=[["準備", "GビズID取得\n事業計画の策定"], ["申請", "電子申請\n（jGrants）"],
                   ["審査・採択", "外部有識者\nによる審査"], ["交付決定", "決定後に\n発注・設置"],
                   ["報告・受給", "実績報告\n→入金"]],
        note="一般型はカタログ外の設備も対象になる代わりに事業計画書の提出と審査がある。労働生産性の年平均成長率+4%以上等の目標設定が必要。"),
    "kaizen": dict(
        label="業務改善助成金", rate=0.75, cap=450,
        rateText="3/4（引上げ前の事業場内最低賃金が1,050円未満は4/5）",
        capText="コース（50円/70円/90円）と引上げ人数で変動。90円コース・7人以上で450万円",
        flowSteps=[["準備", "賃金引上げ計画\n見積取得"], ["交付申請", "労働局へ\n申請"],
                   ["交付決定", "決定後に\n発注・導入"], ["賃上げ実施", "最低賃金\n50円以上引上げ"],
                   ["報告・受給", "事業実績報告\n→入金"]],
        note="事業場内最低賃金の50円以上の引き上げが必須要件。引き上げるコース（50円/70円/90円）と人数により上限額が変動する。"),
    "kanko_shoryokuka": dict(
        label="観光庁 省力化投資補助事業", rate=0.5, cap=1000,
        rateText="1/2", capText="1施設あたり1,000万円",
        flowSteps=[["準備", "地域連携の\n体制づくり"], ["申請", "観光庁へ\n電子申請"],
                   ["審査・採択", "省力化効果\nの審査"], ["交付決定", "決定後に\n発注・設置"],
                   ["報告・受給", "実績報告\n→入金"]],
        note="旅館業法第3条第1項の許可を受けた宿泊事業者が対象（民泊・風俗営業は対象外）。DMO・自治体等と連携した人手不足対策の取組であることが要件。"),
    "monodukuri": dict(
        label="新事業進出・ものづくり商業サービス補助金", rate=0.5, cap=2500,
        rateText="1/2（小規模事業者は2/3）",
        capText="革新的新製品・サービス枠は最大2,500万円（大幅賃上げ特例で3,500万円）。従業員規模により変動",
        flowSteps=[["準備", "GビズID取得\n事業計画の策定"], ["申請", "電子申請\n（jGrants）"],
                   ["審査・採択", "書面・\n事業計画審査"], ["交付決定", "決定後に\n発注・導入"],
                   ["報告・受給", "実績報告\n→入金"]],
        note="給与支給総額の年平均成長率+3.5%以上、事業場内最低賃金が地域別最低賃金+30円以上といった賃上げ要件を満たす事業計画が必須。"),
    "jinzai": dict(
        label="人材開発支援助成金（人材育成支援コース）", rate=0.45, cap=1000,
        rateText="経費助成45%（中小企業）＋賃金助成800円/時（要件充足で1,000円/時）",
        capText="事業所あたり年間1,000万円（賃金助成は最大120万円）",
        flowSteps=[["準備", "訓練計画の\n作成"], ["計画届", "訓練開始1ヶ月前\nまでに労働局へ"],
                   ["訓練実施", "10時間以上の\n訓練を実施"], ["支給申請", "訓練終了後\n2ヶ月以内"],
                   ["受給", "助成金の\n入金"]],
        note="訓練開始日の1ヶ月前までに訓練計画届を提出しないと支給対象外になる。OFF-JTで10時間以上という時間要件がある。"),
}

# 制度ごとの「その他の対象経費への補足」。plan側の why と重複させない一般則。
INDUSTRY_LABEL = {
    "lodging": "宿泊業", "manufacturing": "製造業",
    "realestate": "不動産業", "education": "教育・学習支援業",
}


def _pairs(rows):
    return [list(r) for r in rows]


def expand(spec, industry):
    """圧縮スペック(dict) → build_plans.py が読む完全なプラン辞書"""
    sk = spec["sub"]["key"]
    sc = SCHEMES[sk]
    inv_lines = _pairs(spec["inv"]["lines"])
    total = sum(v for _, v in inv_lines)

    eff = spec["eff"]
    m_label, m_before, m_after, m_basis = eff["model"]
    save_amount, save_assumption = eff.get("save", (None, None))

    plan = {
        "no": spec["no"],
        "slug": spec["slug"],
        "title": spec["title"],
        "subtitle": spec["subtitle"],
        "category": {"rank": spec["cat_rank"], "name": spec["cat"]},
        "itemIdx": spec["item_idx"],
        "item": spec["item"],
        "stage2Note": spec["s2"],
        "model": {"name": spec["model"][0], "lines": _pairs(spec["model"][1])},
        "problem": {
            "lead": spec["prob"]["lead"],
            "detail": spec["prob"]["detail"],
            "bullets": list(spec["prob"]["bullets"]),
            "flowSteps": _pairs(spec["prob"]["flow"]),
            "laborRows": _pairs(spec["prob"]["labor"]),
            "callout": spec["prob"]["callout"],
        },
        "solution": {
            "aim": spec["sol"]["aim"],
            "overview": spec["sol"]["overview"],
            "center": spec["sol"]["center"],
            "nodes": _pairs(spec["sol"]["nodes"]),
            "components": _pairs(spec["sol"]["comps"]),
            "flowSteps": _pairs(spec["sol"]["flow"]),
        },
        "detail": {
            "points": list(spec["det"]["points"]),
            "equipment": _pairs(spec["det"]["equip"]),
            "pictograms": _pairs(spec["det"]["picto"]),
            "beforeAfter": _pairs(spec["det"]["ba"]),
        },
        "schedule": [{"label": l, "m": [a, b]} for l, a, b in spec["sched"]],
        "scheduleNote": spec["sched_note"],
        "investment": {
            "basis": spec["inv"].get("basis", "A"),
            "basisNote": spec["inv"]["note"],
            "lines": inv_lines,
            "total": total,
            "unit": spec["inv"].get("unit", "万円/年間"),
        },
        "subsidy": {
            "key": sc.get("key", sk),
            "label": sc["label"],
            "rate": sc["rate"],
            "cap": spec["sub"].get("cap", sc["cap"]),
            "rateText": spec["sub"].get("rate_text", sc["rateText"]),
            "capText": spec["sub"].get("cap_text", sc["capText"]),
            "why": spec["sub"]["why"],
            "flowSteps": [list(s) for s in sc["flowSteps"]],
            "note": sc["note"],
        },
        "effect": {
            "sourceBullets": list(eff["src"]),
            "model": {"label": m_label, "before": m_before, "after": m_after, "basis": m_basis},
            "modelExtras": [{"label": l, "before": b, "after": a} for l, b, a in eff.get("extras", [])],
            "modelNote": eff["note"],
        },
        "kpiLead": spec["kpi_lead"],
        "kpi": [{"name": n, "base": b, "target": t, "when": w} for n, b, t, w in spec["kpi"]],
        "gauges": _pairs(spec["gauges"]),
        "pdcaNote": spec["pdca"],
        "risks": [{"risk": r, "counter": c, "short": s, "impact": i, "likelihood": lk}
                  for r, c, s, i, lk in spec["risks"]],
        "actions": list(spec["actions"]),
    }
    # 投資総額の一部だけが補助対象になる場合（ハードウェア対象外など）
    if spec["sub"].get("eligible") is not None:
        plan["subsidy"]["eligible"] = spec["sub"]["eligible"]
        plan["subsidy"]["eligibleNote"] = spec["sub"].get("eligible_note", "")
    if save_amount is not None:
        plan["effect"]["monthlySaving"] = {"amount": save_amount, "assumption": save_assumption}
    if spec.get("proto"):
        plan["proto"] = spec["proto"]
    if spec["sub"].get("off_list"):
        # 出力JSONには残さず、検証用にだけ持たせる（HTML側では使わない）
        plan["_offListReason"] = spec["sub"]["off_list"]
    return plan


def validate(plans, industry, scores):
    """生成前に構造とデータ整合をチェックする。ここで落ちるものは公開しない。

    100施策スコアリング(data/scores)との突き合わせを必ず通すのは、
    (category.rank, itemIdx) がズレると score.py の採択マークが別の施策に
    付いてしまい、サイト上の「どれを採択したか」が静かに嘘になるため。
    """
    errs = []
    by_key = {(r["catRank"], r["itemIdx"]): r for r in scores}
    seen_no, seen_slug, seen_key = set(), set(), set()
    for pl in plans:
        tag = f"no={pl['no']}"
        if pl["no"] in seen_no:
            errs.append(f"{tag}: no が重複")
        seen_no.add(pl["no"])
        if pl["slug"] in seen_slug:
            errs.append(f"{tag}: slug '{pl['slug']}' が重複")
        seen_slug.add(pl["slug"])
        key = (pl["category"]["rank"], pl["itemIdx"])
        if key in seen_key:
            errs.append(f"{tag}: (catRank,itemIdx)={key} が他の案と重複")
        seen_key.add(key)
        row = by_key.get(key)
        if row is None:
            errs.append(f"{tag}: 100施策スコアに (catRank,itemIdx)={key} が無い")
            continue
        if row["catName"] != pl["category"]["name"]:
            errs.append(f"{tag}: 分類名がスコア側と不一致 '{pl['category']['name']}' != '{row['catName']}'")
        if row["item"] != pl["item"]:
            errs.append(f"{tag}: 施策名がスコア側と不一致\n    plan : {pl['item']}\n    score: {row['item']}")
        if pl["investment"]["unit"] != row["unit"]:
            errs.append(f"{tag}: 単位がスコア側と不一致 '{pl['investment']['unit']}' != '{row['unit']}'")
        # 費用の妥当性: タイプAは分類概算と一致、タイプBはその範囲内
        cost = row["cost"]
        tot = pl["investment"]["total"]
        if pl["investment"]["basis"] == "A" and tot != cost:
            errs.append(f"{tag}: タイプAなのに合計{tot}が分類概算{cost}と一致しない")
        if pl["investment"]["basis"] == "B" and not (0 < tot <= cost):
            errs.append(f"{tag}: タイプBの合計{tot}が分類概算{cost}の範囲外")
        # 制度が施策の対象制度に含まれるか。
        # programs は100施策側の編集判断であり法令ではないので、含まれない制度を
        # 選ぶこと自体は起こりうる（例: 業務改善助成金は生産性向上に資するソフト
        # ウェアも対象だが、100施策側ではバックオフィス分類に付けていない）。
        # ただし「気づかず食い違った」と「承知のうえで選んだ」は区別が必要なので、
        # 食い違う場合は spec 側に理由(sub.off_list)を書かせ、無ければ落とす。
        if pl["subsidy"]["key"] not in row["programs"] and not pl.get("_offListReason"):
            errs.append(f"{tag}: 制度'{pl['subsidy']['key']}'がスコア側の対象制度{row['programs']}に無い"
                        "（意図的なら spec の sub に off_list='理由' を書く）")
        # 図版が破綻しない件数か
        for path, lo, hi in [("problem.bullets", 3, 5), ("problem.flowSteps", 3, 4),
                             ("problem.laborRows", 2, 4), ("solution.nodes", 4, 6),
                             ("solution.components", 2, 4), ("solution.flowSteps", 3, 4),
                             ("detail.points", 3, 5), ("detail.equipment", 2, 4),
                             ("detail.pictograms", 3, 4), ("detail.beforeAfter", 2, 3),
                             ("schedule", 4, 7), ("kpi", 3, 4), ("gauges", 3, 3),
                             ("risks", 3, 4), ("actions", 4, 5), ("effect.sourceBullets", 2, 4)]:
            node = pl
            for p in path.split("."):
                node = node[p]
            if not lo <= len(node) <= hi:
                errs.append(f"{tag}: {path} の件数 {len(node)} が範囲({lo}〜{hi})外")
        # スタットタイルは「導入前→導入後がどちらも好転」であることが前提
        for e in [pl["effect"]["model"]] + pl["effect"]["modelExtras"]:
            if isinstance(e["before"], (int, float)) and e["before"] == e["after"]:
                errs.append(f"{tag}: 効果 '{e['label']}' の導入前後が同値")
        if len(pl["schedule"]) and max(s["m"][1] for s in pl["schedule"]) > 18:
            errs.append(f"{tag}: スケジュールが18ヶ月を超える")
    if len(plans) != 10:
        errs.append(f"{industry}: プラン数が {len(plans)} 件（10件であること）")
    return errs


def main():
    sys.path.insert(0, HERE)
    industries = sys.argv[1:]
    if not industries:
        industries = sorted(f[:-3] for f in os.listdir(SRC)
                            if f.endswith(".py") and not f.startswith("_"))
    ng = 0
    for ik in industries:
        mod = importlib.import_module(f"plan_src.{ik}")
        with open(os.path.join(DATA, "scores", ik + ".json"), encoding="utf-8") as f:
            scores = json.load(f)
        plans = [expand(s, ik) for s in mod.PLANS]
        errs = validate(plans, ik, scores)
        if errs:
            ng += 1
            print(f"NG: {ik}")
            for e in errs:
                print("  -", e)
            continue
        out = os.path.join(DATA, "plans", ik + ".json")
        for pl in plans:
            pl.pop("_offListReason", None)
        with open(out, "w", encoding="utf-8") as f:
            json.dump(plans, f, ensure_ascii=False, indent=1)
            f.write("\n")
        print(f"OK: {ik} -> {len(plans)} plans ({os.path.getsize(out) // 1024}KB)")
    if ng:
        sys.exit(1)


if __name__ == "__main__":
    main()

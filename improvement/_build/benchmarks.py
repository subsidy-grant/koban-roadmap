# -*- coding: utf-8 -*-
"""事業計画書に業界平均利益率・採択率傾向・ハードウェア要件注記・申請規模妥当性を
自動反映するためのヘルパー。データ源は data/benchmarks.json。

2026-07-25ミーティングのネクストアクション（議事録L142、討議L48-49・項目25-27）に対応。

使い方（build_plans.py 等から）:
    import benchmarks as bm
    notes = bm.plan_notes(industry="food", program_key="shoryokuka",
                          investment_man_yen=320, annual_revenue_man_yen=3000)
    # notes は下記キーを持つ dict:
    #   scale        申請規模の妥当性チェック結果（超過時は警告文つき）
    #   hardware     ハード・ソフト要件の注記（計画書に必ず載せる）
    #   adoption     採択率傾向と審査で見られる観点
    #   industry     業界平均利益率との比較（未取得業種は None）
    #   footnotes    上記の出典を脚注用にまとめたリスト

設計上の約束:
    - 数値は benchmarks.json に出典付きで書かれたものだけを返す。未取得は None を返し、
      呼び出し側で「データ未取得」と明示させる。もっともらしい値を返さない（捏造禁止）。
    - 返す文言には必ず出典と統計値の種別（黒字企業平均／中央値／平均値）を含める。
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(HERE, "data", "benchmarks.json")

_cache = None


def load():
    """benchmarks.json を読み込む（プロセス内キャッシュ）。"""
    global _cache
    if _cache is None:
        with open(DATA_PATH, encoding="utf-8") as f:
            _cache = json.load(f)
    return _cache


# ---------------------------------------------------------------- 申請規模の妥当性

def scale_check(investment_man_yen, annual_revenue_man_yen):
    """投資総額が年商の1/3目安を超えていないか判定する。

    Returns: dict(ok, ratio, limit_man_yen, message, source) または
             annual_revenue が未指定なら None。
    """
    rule = load()["applicationScaleRule"]
    if not annual_revenue_man_yen:
        return None
    ratio = investment_man_yen / annual_revenue_man_yen
    limit = annual_revenue_man_yen * rule["ratioOfAnnualRevenue"]
    ok = investment_man_yen <= limit
    if ok:
        msg = (f"投資総額{investment_man_yen:,.0f}万円は年商{annual_revenue_man_yen:,.0f}万円の"
               f"{ratio:.0%}で、目安である1/3以内に収まっている。")
    else:
        msg = (f"⚠ 投資総額{investment_man_yen:,.0f}万円は年商{annual_revenue_man_yen:,.0f}万円の"
               f"{ratio:.0%}に達し、目安の1/3（{limit:,.0f}万円）を超える。"
               f"自己負担分の資金調達根拠（自己資金・融資枠）を計画書に明示すること。")
    return {
        "ok": ok, "ratio": ratio, "limit_man_yen": limit,
        "message": msg, "source": rule["source"], "sourceType": rule["sourceType"],
        "note": rule["note"],
    }


# ---------------------------------------------------------------- ハード・ソフト要件

def hardware_note(program_key):
    """制度別のハード・ソフト要件注記を返す。該当なしは None。"""
    return load()["hardwareSoftwareNotes"].get(program_key)


# ---------------------------------------------------------------- 採択率傾向

def adoption_note(program_key):
    """制度別の採択率傾向・審査観点を返す。該当なしは None。"""
    trends = load()["adoptionRateTrends"]
    prog = trends["byProgram"].get(program_key)
    if not prog:
        return None
    out = dict(prog)
    # 競争審査型なら共通の4評価軸も添える
    if prog.get("screeningType") == "competitive":
        out["screeningAxes"] = trends["screeningAxes"]
    return out


def latest_adoption_rate(program_key):
    """直近の採択率を (round名, rate) で返す。データが無ければ None。"""
    prog = load()["adoptionRateTrends"]["byProgram"].get(program_key) or {}
    rates = prog.get("rates") or []
    if not rates:
        return None
    r = rates[0]
    return (r["round"], r["rate"])


# ---------------------------------------------------------------- 業界平均利益率

def industry_financials(industry_key):
    """業種の財務ベンチマークを返す。未取得業種は status='未取得' のまま返す。"""
    return load()["industryFinancials"]["byIndustry"].get(industry_key)


def margin_comparison(industry_key, plan_margin_pct=None):
    """業界平均利益率と自社計画値の比較文を作る。

    未取得業種では available=False を返し、呼び出し側で
    「業界平均は未取得」と正直に書かせる。数値の代替は作らない。
    """
    fin = industry_financials(industry_key)
    choice = load()["industryFinancials"]["_statisticChoice"]
    if not fin:
        return {"available": False, "reason": "未知の業種キー"}
    om = fin.get("operatingMarginPct")
    if not om:
        # 「まだ取っていない」と「方針として持たない」を区別する。
        # 後者で e-Stat 等から数値を補うと出典が業種ごとにバラけるため、代替手段を案内する。
        if fin.get("excludedByPolicy"):
            return {
                "available": False,
                "excludedByPolicy": True,
                "reason": fin.get("status"),
                "message": f"{fin['label']}は出典統一の方針により業界平均を持たない。{fin.get('reason','')}",
                "planGuidance": fin.get("planGuidance"),
                "alternativeIfNeeded": fin.get("alternativeIfNeeded"),
            }
        return {
            "available": False,
            "excludedByPolicy": False,
            "reason": fin.get("status", "未取得"),
            "pendingSource": fin.get("pendingSource"),
            "message": f"{fin['label']}の業界平均営業利益率は本データベースに未取得。"
                       f"申請書に業界比較を載せる場合は {fin.get('pendingSource','')} から取得すること。",
        }
    benchmark = om.get(choice["recommended"])
    caveat = load()["industryFinancials"].get("_sampleCaveat", {})
    msg = (f"{fin['label']}の売上高営業利益率は、黒字かつ自己資本プラス企業の平均で{benchmark}%"
           f"（全企業平均{om.get('avg')}%、中央値{om.get('median')}%）。"
           f"出典: {fin.get('surveyName')}／{fin.get('surveyYear')}")
    result = {
        "available": True, "label": fin["label"], "benchmarkPct": benchmark,
        "all": om, "statistic": choice["recommended"], "message": msg,
        "sourceUrl": fin.get("sourceUrl"), "surveyName": fin.get("surveyName"),
        "surveyYear": fin.get("surveyYear"), "warning": fin.get("warning"),
        "sampleSize": fin.get("sampleSize"), "note": fin.get("note"),
        # 標本バイアス（公庫融資先・従業者50人未満）は脚注に必須
        "sampleCaveat": caveat.get("warning"),
        "population": caveat.get("population"),
    }
    if plan_margin_pct is not None:
        diff = plan_margin_pct - benchmark
        result["planMarginPct"] = plan_margin_pct
        result["diffPct"] = diff
        result["comparison"] = (
            f"本計画の想定営業利益率{plan_margin_pct}%は業界ベンチマーク{benchmark}%を"
            f"{abs(diff):.1f}ポイント{'上回る' if diff >= 0 else '下回る'}。")
    return result


# ---------------------------------------------------------------- まとめ

def plan_notes(industry, program_key, investment_man_yen=None,
               annual_revenue_man_yen=None, plan_margin_pct=None):
    """事業計画書に差し込む注記一式をまとめて返す。"""
    out = {
        "scale": (scale_check(investment_man_yen, annual_revenue_man_yen)
                  if investment_man_yen is not None else None),
        "hardware": hardware_note(program_key),
        "adoption": adoption_note(program_key),
        "industry": margin_comparison(industry, plan_margin_pct),
    }
    foot = []
    if out["scale"]:
        foot.append(f"申請規模の目安: {out['scale']['source']}（{out['scale']['sourceType']}）")
    if out["hardware"]:
        foot.append(f"対象経費要件: {out['hardware']['programLabel']} 公式サイト {out['hardware']['sourceUrl']}")
    if out["adoption"] and out["adoption"].get("sourceUrl"):
        foot.append(f"採択率・審査傾向: {out['adoption']['sourceUrl']}")
    if out["industry"].get("available"):
        ind = out["industry"]
        foot.append(f"業界平均: {ind['surveyName']}（{ind['surveyYear']}） {ind['sourceUrl']}")
        # 標本の性質は数値とセットで開示する（公庫融資先・従業者50人未満の選択バイアス）
        if ind.get("population"):
            foot.append(f"業界平均の標本: {ind['population']}")
    elif out["industry"].get("excludedByPolicy"):
        # 業界平均を載せない業種。計画書側で代替の見せ方に切り替える必要がある
        foot.append("業界平均: 出典統一の方針により本業種は掲載しない（自社実績推移で妥当性を示す）")
    out["footnotes"] = foot
    return out


if __name__ == "__main__":
    import sys
    n = plan_notes(industry="food", program_key="shoryokuka",
                   investment_man_yen=320, annual_revenue_man_yen=3000,
                   plan_margin_pct=5.0)
    sys.stdout.buffer.write(
        json.dumps(n, ensure_ascii=False, indent=2).encode("utf-8"))

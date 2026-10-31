"""採択率の調査結果（JSON）から adoption_data.js を作る。

使い方:
    python -X utf8 _tools/build_adoption_data.py 調査結果1.json [調査結果2.json ...]

調査結果の各要素は次の形（_tools/README 相当の説明はこのファイルが唯一の出所）:
    {"key": "jizoku", "status": "published|computed|none", "rate": 47.2,
     "round": "第19回", "adopted": 7819, "applied": 16576,
     "source_url": "https://...", "checked_at": "2026-10-31", "note": "..."}

対象は「補助金タイプ（hojo）と判定されている制度」すべて。判定は program.html の
PROGRAM_TYPE_OVERRIDE と名称マッチから _tools/check_program_type.py と同じ規則で出す。
hojo の制度が調査結果に1件でも欠けていたら止まる（黙って「非公表」扱いにしない）。
逆に、調査結果にあっても hojo でない制度は書き出さない（助成金タイプにランクは付けない）。
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "_tools"))
import check_program_type as cpt  # noqa: E402


def hojo_keys():
    override = cpt.load_override()
    progs = cpt.load_programs()
    items = progs.items() if isinstance(progs, dict) else progs
    out = []
    for key, value in items:
        name = value.get("name", "") if isinstance(value, dict) else str(value)
        kind = override.get(key) or ("hojo" if "補助" in name else "josei" if "助成" in name else "other")
        if kind == "hojo":
            out.append(key)
    return out


def load_results(paths):
    merged = {}
    for p in paths:
        for row in json.loads(Path(p).read_text(encoding="utf-8")):
            key = row["key"]
            if key in merged:
                sys.exit(f"同じ制度が2回出てきた: {key}（{p}）")
            if row["status"] not in ("published", "computed", "none"):
                sys.exit(f"status が不正: {key} = {row['status']}")
            if row["status"] == "none":
                row["rate"] = None
            elif not isinstance(row.get("rate"), (int, float)):
                sys.exit(f"status={row['status']} なのに rate が数値でない: {key}")
            merged[key] = row
    return merged


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    results = load_results(sys.argv[1:])
    keys = hojo_keys()
    missing = [k for k in keys if k not in results]
    if missing:
        sys.exit("補助金タイプなのに調査結果が無い制度: " + ", ".join(missing))

    programs = {}
    for k in keys:
        r = results[k]
        programs[k] = {
            "status": r["status"],
            "rate": r["rate"],
            "round": r.get("round") or "",
            "adopted": r.get("adopted"),
            "applied": r.get("applied"),
            "source": r.get("source_url") or "",
            "checked": r.get("checked_at") or "",
            "note": r.get("note") or "",
        }
    skipped = sorted(set(results) - set(keys))

    body = json.dumps(programs, ensure_ascii=False, indent=2)
    js = f"""// 自動生成ファイル。手で直さないこと。
// 生成元: _tools/build_adoption_data.py（調査結果のJSONから作る）
//
// 補助金タイプ（審査で採択・不採択が決まる制度）の採択率と、そこから決まるランク。
//   A = 75%以上 / B = 50%超〜75%未満 / C = 50%以下（2026-10-31 本人指定）
//   採択率も件数も公表されていない制度はランクを付けず「採択率非公表」と出す。
//   status: published = 事務局が採択率を公表 / computed = 採択件数÷申請件数を当サイトで算出
//           none = 公表なし（または先着・抽選で採択率の考え方が成り立たない）
// 助成金タイプの制度はここに載せない（ランクの対象外）。
window.KOBAN_ADOPTION = {{
  programs: {body},
  // key → {{ rank: 'A'|'B'|'C'|null, label, status, rate }}。対象外（助成金タイプ）は null
  rankOf: function (key) {{
    var p = this.programs[key];
    if (!p) return null;
    if (p.status === 'none' || typeof p.rate !== 'number') {{
      return {{ rank: null, label: '採択率非公表', status: p.status, rate: null }};
    }}
    var rank = p.rate >= 75 ? 'A' : p.rate > 50 ? 'B' : 'C';
    return {{ rank: rank, label: '採択率' + rank, status: p.status, rate: p.rate }};
  }}
}};
"""
    (ROOT / "adoption_data.js").write_text(js, encoding="utf-8", newline="\n")
    ranks = {}
    for k in keys:
        p = programs[k]
        r = "非公表" if p["rate"] is None else ("A" if p["rate"] >= 75 else "B" if p["rate"] > 50 else "C")
        ranks[r] = ranks.get(r, 0) + 1
    print(f"adoption_data.js を書き出した: 補助金タイプ {len(keys)} 件 {ranks}")
    if skipped:
        print("補助金タイプでないので書き出さなかった:", ", ".join(skipped))


if __name__ == "__main__":
    main()

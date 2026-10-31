"""採択率の記載が正本（_tools/adoption/rates.json）と食い違っていないかを調べる。

使い方:
    python -X utf8 _tools/check_adoption_sync.py

見ること（1つでも NG があれば終了コード 1）:
  1. adoption_data.js が rates.json から作り直したものと同じか（再生成のし忘れ）
  2. criteria.html の表で、criteria_label を持つ制度の行の採択率（<span class="rn">）が
     rates.json の rate と同じか。rate が無い制度の行に率が書かれていないか
  3. criteria.html 冒頭の「採択率の幅」「最も通りやすい制度」が、表の数字と合っているか
  4. index.html の PROGRAMS の acceptance に、採択率が分かっている制度なのに
     「非公表」と書かれていないか（率そのものは adoption_data.js から差し込むので書かない）
  5. 各行の checked_at が日付の形か、source_url が https か

週次の自動更新は rates.json を直したあと、build_adoption_data.py → このスクリプトの順に流す。
"""
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RATES = ROOT / "_tools" / "adoption" / "rates.json"


def ng(msgs, text):
    msgs.append(text)
    print("NG:", text)


def check_generated(msgs):
    before = (ROOT / "adoption_data.js").read_bytes()
    r = subprocess.run([sys.executable, "-X", "utf8", str(ROOT / "_tools" / "build_adoption_data.py")],
                       capture_output=True, text=True, encoding="utf-8")
    if r.returncode != 0:
        ng(msgs, "build_adoption_data.py が失敗: " + (r.stderr or r.stdout).strip())
        return
    after = (ROOT / "adoption_data.js").read_bytes()
    if before != after:
        ng(msgs, "adoption_data.js が rates.json と合っていなかった（いま再生成した。差分をコミットすること）")


def criteria_rows(html):
    rows = {}
    for m in re.finditer(r'<tr><td data-label="制度">(.*?)</td>(.*?)</tr>', html, re.S):
        name = re.sub(r"<[^>]+>", "", m.group(1))
        rn = re.search(r'<span class="rn">([\d.]+)%</span>', m.group(2))
        rows[name] = float(rn.group(1)) if rn else None
    return rows


def check_criteria(msgs, rates):
    html = (ROOT / "criteria.html").read_text(encoding="utf-8")
    rows = criteria_rows(html)
    for r in rates:
        label = r.get("criteria_label")
        if not label:
            continue
        hit = [n for n in rows if n.startswith(label)]
        if len(hit) != 1:
            ng(msgs, f"criteria.html に「{label}」の行が {len(hit)} 件（1件のはず）: {r['key']}")
            continue
        shown = rows[hit[0]]
        if r["rate"] is None and shown is not None:
            ng(msgs, f"{r['key']}: rates.json は率なしだが criteria.html は {shown}%")
        elif r["rate"] is not None and (shown is None or abs(shown - r["rate"]) > 0.05):
            ng(msgs, f"{r['key']}: criteria.html は {shown}% / rates.json は {r['rate']}%")

    vals = [v for v in rows.values() if v is not None]
    if vals:
        lo, hi = min(vals), max(vals)
        want_range = f"{lo:.1f}〜{hi:.1f}%"
        want_ratio = f"{hi / lo:.1f}倍"
        want_count = f"{len(vals)}制度"
        stat = re.search(r'採択率の幅</div><div class="n">(.*?)</div><div class="t">(.*?)</div>', html)
        if not stat:
            ng(msgs, "criteria.html の「採択率の幅」が見つからない")
        else:
            if stat.group(1) != want_range:
                ng(msgs, f"「採択率の幅」が {stat.group(1)}（表からは {want_range}）")
            if want_ratio not in stat.group(2) or want_count not in stat.group(2):
                ng(msgs, f"「採択率の幅」の説明が「{stat.group(2)}」（表からは {want_count}・{want_ratio}）")
        best = re.search(r'最も通りやすい制度</div><div class="n">([\d.]+)%</div>', html)
        if not best or abs(float(best.group(1)) - hi) > 0.05:
            ng(msgs, f"「最も通りやすい制度」が {best.group(1) if best else '?'}%（表の最大は {hi:.1f}%）")


def check_index(msgs, rates):
    sys.path.insert(0, str(ROOT / "_tools"))
    import check_program_type as cpt  # page_data.js（index.html の PROGRAMS の写し）を読む
    progs = cpt.load_programs()
    for r in rates:
        if r["rate"] is None:
            continue
        p = progs.get(r["key"]) if isinstance(progs, dict) else None
        acc = (p or {}).get("acceptance", "") if isinstance(p, dict) else ""
        if re.search(r"採択率は非公表|^\s*非公表", acc):
            ng(msgs, f"{r['key']}: 採択率 {r['rate']}% が分かっているのに acceptance が「{acc[:40]}…」")


def check_rows(msgs, rates):
    for r in rates:
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", r.get("checked_at") or ""):
            ng(msgs, f"{r['key']}: checked_at が日付でない: {r.get('checked_at')!r}")
        if r["status"] != "none" and not str(r.get("source_url", "")).startswith("https://"):
            ng(msgs, f"{r['key']}: 率があるのに source_url が https でない")


def main():
    rates = json.loads(RATES.read_text(encoding="utf-8"))
    msgs = []
    check_generated(msgs)
    check_criteria(msgs, rates)
    check_index(msgs, rates)
    check_rows(msgs, rates)
    print(f"採択率の整合: {len(rates)} 制度を確認、NG {len(msgs)} 件")
    sys.exit(1 if msgs else 0)


if __name__ == "__main__":
    main()

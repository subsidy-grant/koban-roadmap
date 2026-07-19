# -*- coding: utf-8 -*-
"""data/plans/*.json から「業種別・改善計画10選」の事業計画書/プロトタイプへのリンク表を作り、
本体サイト index.html の 03 必要機材・システム一覧 に埋め込む(冪等・マーカーコメントで置換)。
実行: python3 sync_main_site_links.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "data")
ROOT = os.path.abspath(os.path.join(HERE, "..", ".."))
MAIN_HTML = os.path.join(ROOT, "index.html")

START = "  /* IMPROVEMENT_PLANS:START (sync_main_site_links.py で自動生成、手編集しないこと) */"
END = "  /* IMPROVEMENT_PLANS:END */"


def build_mapping():
    pdir = os.path.join(DATA, "plans")
    industries = [f[:-5] for f in os.listdir(pdir) if f.endswith(".json")] if os.path.isdir(pdir) else []
    mapping = {}
    for ik in sorted(industries):
        with open(os.path.join(pdir, ik + ".json"), encoding="utf-8") as f:
            plans = json.load(f)
        cat_map = {}
        for pl in plans:
            rank = pl["category"]["rank"]
            cat_map[str(rank)] = {
                "no": pl["no"],
                "planUrl": f"improvement/{ik}/plan-{pl['no']:02d}.html",
                "protoUrl": f"improvement/{ik}/proto-{pl['no']:02d}-{pl['slug']}.html",
                "title": pl["title"],
            }
        mapping[ik] = cat_map
    return mapping


def main():
    mapping = build_mapping()
    js = json.dumps(mapping, ensure_ascii=False, indent=2)
    block = f"{START}\n  var IMPROVEMENT_PLANS = {js};\n{END}"

    with open(MAIN_HTML, encoding="utf-8") as f:
        html = f.read()

    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if pattern.search(html):
        html = pattern.sub(lambda m: block, html, count=1)
    else:
        marker = "  var currentIndustry = 'beauty';"
        if marker not in html:
            raise SystemExit("marker 'var currentIndustry' not found in index.html")
        html = html.replace(marker, block + "\n\n" + marker, 1)

    with open(MAIN_HTML, "w", encoding="utf-8") as f:
        f.write(html)
    n_cats = sum(len(v) for v in mapping.values())
    print(f"OK: IMPROVEMENT_PLANS synced ({len(mapping)} industries, {n_cats} category links) -> {MAIN_HTML}")


if __name__ == "__main__":
    main()

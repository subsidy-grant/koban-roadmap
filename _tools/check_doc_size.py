# -*- coding: utf-8 -*-
"""掲載しているファイルサイズの表記が、実物と合っているかを全数で確かめる。

なぜ要るか：
check_links.py が見ているのは「前回の観測と今回の観測の差」なので、
最初に載せた時点の表記が既に古かった場合、差が出ないため永久に挙がらない。
実際 2026-09-01 に、65歳超雇用推進助成金の手引きが 1.2MB と書いてあるのに
実物は 5.3MB（令和8年度版80ページ）だったのを、この突き合わせで初めて見つけた。

見ているもの：
  掲載値 = program_docs_data.js の size 表記
  実測値 = _tools/link_status.json の content_length（check_links.py が実アクセスで得た値）

終了コード： 0=ズレなし / 1=ズレあり
"""
import io
import json
import os
import re
import sys

TOOLS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(TOOLS)
DOCS = os.path.join(ROOT, "program_docs_data.js")
STATUS = os.path.join(TOOLS, "link_status.json")
OUT = os.path.join(TOOLS, "doc_size_report.md")

UNIT = {"KB": 1024, "MB": 1048576, "GB": 1073741824}


def to_bytes(text):
    m = re.match(r"^([\d.]+)(KB|MB|GB)$", text.strip())
    return float(m.group(1)) * UNIT[m.group(2)] if m else None


def fmt(b):
    return "%.1fMB" % (b / 1048576.0) if b >= 1048576 else "%dKB" % round(b / 1024.0)


def tolerance(shown_text):
    """表記の刻み幅ぶんは許容する。0.1MB刻み／1KB刻みの丸め誤差で赤くしない。"""
    step = 1048576 * 0.1 if "MB" in shown_text else 1024
    return step * 1.5


def main():
    src = io.open(DOCS, encoding="utf-8").read()
    entries = json.load(io.open(STATUS, encoding="utf-8"))["entries"]

    items = re.findall(r"url:\s*'([^']+)'[^}]*?size:\s*'([^']+)'", src)
    gaps, unknown = [], 0
    for url, shown in items:
        e = entries.get(url)
        if not e or not e.get("content_length"):
            unknown += 1
            continue
        want = to_bytes(shown)
        if want is None:
            continue
        real = int(e["content_length"])
        if abs(real - want) > tolerance(shown):
            gaps.append((abs(real - want), url, shown, fmt(real)))

    gaps.sort(reverse=True)
    lines = ["# 掲載サイズと実物の突き合わせ", "",
             "- 対象：**%d件**（size 表記のある書類）" % len(items),
             "- 実測が台帳に無く判定できないもの：**%d件**" % unknown,
             "- ズレ：**%d件**" % len(gaps), ""]
    if gaps:
        lines += ["## 表記が実物と違うもの", ""]
        for _, url, shown, real in gaps:
            lines += ["- 掲載 **%s** → 実物 **%s**" % (shown, real), "  - %s" % url]
        lines += ["",
                  "直しかた：`program_docs_data.js` の size を実物の値にして、",
                  "`python3 _tools/build_page_data.py` で作り直す。", ""]
    else:
        lines += ["ズレはありません。", ""]

    io.open(OUT, "w", encoding="utf-8", newline="\n").write("\n".join(lines) + "\n")
    print("掲載サイズの突き合わせ: 対象 %d件 / 判定不能 %d件 / ズレ %d件"
          % (len(items), unknown, len(gaps)))
    for _, url, shown, real in gaps:
        print("  掲載 %s → 実物 %s  %s" % (shown, real, url))
    return 1 if gaps else 0


if __name__ == "__main__":
    sys.exit(main())

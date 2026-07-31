#!/usr/bin/env python3
"""まだ様式を載せていない制度について、公式ページから『様式らしいファイル』の候補を集める。

これは下書き作りであって、掲載の判断はしない。
理由: 自治体のページには要綱・様式・チラシ・別制度のファイルが混在していて、
      機械には「これがこの制度の申請様式だ」と断定できない。掲載中の
      PROGRAM_DOCS は『公式サイトで実在を確認できたものだけ』という約束で
      作ってあるので、確認者を人から機械に置き換えるとその約束が崩れる。

やること: 候補を _tools/docs_candidates.md に書き出すところまで。
        人が見て採用したものだけ index.html の PROGRAM_DOCS に入れる。

使い方:
  python3 _tools/collect_docs.py                 # 様式未掲載の制度すべて
  python3 _tools/collect_docs.py --only tokyo_   # キーで絞る
  python3 _tools/collect_docs.py --head          # 候補ファイルにHEADも打つ（種別・サイズが要るとき）
"""

import argparse
import os
import re
import sys
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_links import HEADERS, TIMEOUT, PER_HOST_WAIT, HOST_PARALLEL, ROOT, TOOLS, _block  # noqa: E402

OUT_PATH = os.path.join(TOOLS, "docs_candidates.md")
JST = timezone(timedelta(hours=9))

DOC_EXT = re.compile(r"\.(pdf|docx?|xlsx?)(\?|$)", re.I)
# 様式・申請書らしさ。順に強い手がかり
STRONG = re.compile(r"様式|申請書|交付申請|実績報告|請求書|変更承認|計画書|チェックリスト|記入例|記載例")
MEDIUM = re.compile(r"要綱|要領|募集|手引|しおり|Q&A|よくある")
NOISE = re.compile(r"広報|イベント|議会|入札|採用|統計|例規|条例集|会議録")


def load_programs(index_path):
    with open(index_path, encoding="utf-8") as f:
        idx = f.read()
    progs = {}
    for marker in ("var PROGRAMS =", "var ADDED ="):
        blk = _block(idx, marker)
        for m in re.finditer(r'\n    ([A-Za-z0-9_]+): \{(.*?)\n    \}', blk, re.S):
            key, body = m.group(1), m.group(2)
            nm = re.search(r'\n      name: "(.*?)"', body)
            lk = re.search(r'link: "(.*?)"', body)
            if lk:
                progs[key] = {"name": nm.group(1) if nm else key, "link": lk.group(1)}
    have = set(re.findall(r'\n    ([A-Za-z0-9_]+): \{\n      checked:', _block(idx, "var PROGRAM_DOCS =")))
    return progs, have


def score(text, url):
    """様式らしさ。0なら候補から外す。"""
    s = 0
    if STRONG.search(text):
        s += 3
    if MEDIUM.search(text):
        s += 1
    if re.search(r"(youshiki|yoshiki|shinsei|form)", url, re.I):
        s += 2
    if NOISE.search(text):
        s -= 3
    if url.lower().endswith((".docx", ".doc", ".xlsx", ".xls")):
        s += 2      # 編集して出す様式である可能性が高い
    return s


def fetch_candidates(key, prog, do_head):
    url = prog["link"]
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        r.encoding = r.apparent_encoding or r.encoding
    except Exception as e:
        return {"key": key, "name": prog["name"], "link": url,
                "error": type(e).__name__ + ": " + str(e)[:100], "items": []}
    if r.status_code >= 400:
        return {"key": key, "name": prog["name"], "link": url,
                "error": "HTTP %d" % r.status_code, "items": []}

    seen, items = set(), []
    for m in re.finditer(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', r.text, re.S | re.I):
        href = m.group(1)
        if not DOC_EXT.search(href):
            continue
        full = urljoin(r.url, href)
        if full in seen:
            continue
        seen.add(full)
        text = re.sub(r"<[^>]+>", "", m.group(2))
        text = re.sub(r"\s+", " ", text).strip()[:80] or "（リンク文字なし）"
        sc = score(text, full)
        if sc <= 0:
            continue
        items.append({"text": text, "url": full, "score": sc})

    items.sort(key=lambda x: -x["score"])
    items = items[:15]

    if do_head:
        for it in items:
            try:
                h = requests.head(it["url"], headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
                it["status"] = h.status_code
                it["ct"] = (h.headers.get("Content-Type") or "").split(";")[0]
                it["size"] = h.headers.get("Content-Length")
            except Exception:
                it["status"] = None
            time.sleep(PER_HOST_WAIT)

    return {"key": key, "name": prog["name"], "link": url, "error": None, "items": items}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="制度キーにこの文字列を含むものだけ")
    ap.add_argument("--head", action="store_true", help="候補ファイルにHEADを打って種別・サイズを取る")
    ap.add_argument("--limit", type=int)
    args = ap.parse_args()

    progs, have = load_programs(os.path.join(ROOT, "index.html"))
    todo = {k: v for k, v in progs.items() if k not in have}
    if args.only:
        todo = {k: v for k, v in todo.items() if args.only in k}
    keys = list(todo)[:args.limit] if args.limit else list(todo)
    print("様式未掲載 %d件のうち %d件を調べる" % (len(progs) - len(have), len(keys)), flush=True)

    by_host = defaultdict(list)
    for k in keys:
        by_host[urlparse(todo[k]["link"]).netloc].append(k)

    results, done = {}, [0]

    def work(host):
        for k in by_host[host]:
            results[k] = fetch_candidates(k, todo[k], args.head)
            done[0] += 1
            r = results[k]
            print("  [%3d/%3d] %-28s %s" % (done[0], len(keys), k,
                  r["error"] or ("候補 %d件" % len(r["items"]))), flush=True)
            time.sleep(PER_HOST_WAIT)

    with ThreadPoolExecutor(max_workers=HOST_PARALLEL) as ex:
        list(ex.map(work, by_host.keys()))

    stamp = datetime.now(JST).strftime("%Y-%m-%d %H:%M")
    hit = [r for r in results.values() if r["items"]]
    miss = [r for r in results.values() if not r["items"] and not r["error"]]
    err = [r for r in results.values() if r["error"]]

    lines = ["# 様式の候補（機械が拾った下書き）", "",
             "- 取得時刻：**%s**（JST）" % stamp,
             "- 調べた制度：**%d件**（PROGRAM_DOCS に未掲載のもの）" % len(keys),
             "- 候補が出た制度：**%d件**／出なかった：**%d件**／取得できず：**%d件**"
             % (len(hit), len(miss), len(err)), "",
             "> **これは掲載可能なリストではありません。**公式ページ上のPDF・Word・Excelへの",
             "> リンクを機械的に拾って、様式らしい語で並べ替えただけです。別制度の様式や",
             "> 古い年度のファイルが混ざります。人が公式ページを開いて確かめたものだけを",
             "> `index.html` の `PROGRAM_DOCS` に入れてください。", ""]

    for r in sorted(hit, key=lambda x: -len(x["items"])):
        lines += ["## %s" % r["name"], "",
                  "- キー：`%s`" % r["key"], "- 公式ページ：%s" % r["link"], ""]
        for it in r["items"]:
            extra = ""
            if "status" in it:
                sz = it.get("size")
                extra = "（HTTP %s%s）" % (it["status"],
                                          "・%.0fKB" % (int(sz) / 1024) if sz else "")
            lines.append("- [ ] **%s** %s" % (it["text"], extra))
            lines.append("      %s" % it["url"])
        lines.append("")

    if miss:
        lines += ["## 候補が出なかった制度（%d件）" % len(miss), "",
                  "ページ内にPDF・Word・Excelへのリンクが無いか、様式が別ページ・",
                  "電子申請システム側にある可能性があります。", ""]
        for r in sorted(miss, key=lambda x: x["key"]):
            lines.append("- %s — %s" % (r["name"], r["link"]))
        lines.append("")

    if err:
        lines += ["## ページを取得できなかった制度（%d件）" % len(err), ""]
        for r in sorted(err, key=lambda x: x["key"]):
            lines.append("- %s — %s（%s）" % (r["name"], r["link"], r["error"]))
        lines.append("")

    # --only のときは全件版を上書きしない（絞り込み結果で全体像が消えるのを防ぐ）
    out = OUT_PATH if not args.only else OUT_PATH.replace(
        ".md", "_%s.md" % re.sub(r"[^A-Za-z0-9_]", "", args.only))
    with open(out, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")
    print("\n候補あり %d／候補なし %d／取得できず %d" % (len(hit), len(miss), len(err)))
    print("出力: " + OUT_PATH)


if __name__ == "__main__":
    main()

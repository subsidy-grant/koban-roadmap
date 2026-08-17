#!/usr/bin/env python3
"""サイト内の外部リンクを実際に叩いて、リンク切れと『中身の差し替え』を検出する。

なぜ必要か:
  index.html には制度の公式ページと、公式の様式ファイル＋ポータルを載せている。
  役所のページは告知なしに URL が変わり、様式は年度・公募回ごとに差し替わる。
  人手では追いきれないので、毎週これを回して一次情報を取り直す。
  （件数は index.html から自動で拾うので、ここには書かない。実行すると先頭に出る）

  「様式が最新版かどうか」は 200 が返るだけでは分からない。同じ URL のまま中身が
  差し替わることがあるため、Content-Length と Last-Modified を前回値と比べて
  『差し替わった可能性』として報告する。

使い方:
  python3 _tools/check_links.py                  # 全URLを確認し、link_report.md を出す
  python3 _tools/check_links.py --only city.fuchu  # URLに文字列を含むものだけ
  python3 _tools/check_links.py --kind docs-file   # 様式ファイルだけ
  python3 _tools/check_links.py --no-save          # link_status.json を更新しない
  絞り込んだときは link_report_part.md に出す（全件版を潰さないため）

終了コード:
  0 = 対応不要（正常・新規・一時リダイレクトのみ）
  1 = 要対応（リンク切れ・恒久リダイレクト・中身の差し替え・ファイル種別の変化）
  2 = 判定不能のみ（403やタイムアウトで目視が要る）
"""

import argparse
import json
import os
import re
import sys
import time
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta

import requests

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOOLS = os.path.join(ROOT, "_tools")
STATUS_PATH = os.path.join(TOOLS, "link_status.json")
REPORT_PATH = os.path.join(TOOLS, "link_report.md")
BRIEF_PATH = os.path.join(TOOLS, "link_report_brief.md")   # Issue本文用（正常分を省く）

# 実ブラウザ相当のUA＋こちらの素性。理由: chusho.meti.go.jp は WAF があり、
# 素性だけのUA（koban-roadmap-linkcheck/1.0 単体）だと 403 を返す（2026-07-31 実測）。
# 素性を消すと誰が叩いているか分からなくなるので、ブラウザ相当の文字列に
# リポジトリURLを足した形にしている。
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36 "
      "koban-roadmap-linkcheck/1.0 (+https://github.com/subsidy-grant/koban-roadmap)")
# Accept-Encoding: identity を指定するのは、Content-Length を比較可能にするため。
# gzipで返るかどうかがリクエストごとに変わるサーバーがあり（chusho.meti.go.jp で
# 2026-07-31 実測）、そのままだとサイズが毎回違って見える。
HEADERS = {"User-Agent": UA, "Accept-Language": "ja,en;q=0.8",
           "Accept-Encoding": "identity"}

TIMEOUT = 25
PER_HOST_WAIT = 1.2      # 同じホストへの連続アクセスの間隔（秒）
HOST_PARALLEL = 6        # 同時に触るホスト数
RETRY_WAIT = 6

JST = timezone(timedelta(hours=9))

# XMLの名前空間などリンクではないもの
SKIP_PREFIXES = (
    "http://www.w3.org/",
    "https://www.w3.org/",
    "http://schema.org/",
    "https://schema.org/",
    # documents.html がWord/Excelの様式ファイルに直接書き込むためのOOXML名前空間定数
    # （W_NS/S_NS/R_ATTR_NS）。実在のWebページではなくファイル形式の仕様上の識別子。
    # 2026-08-10、週次実行で毎回「接続できない」誤検知になっていたのを見つけて追加
    "http://schemas.openxmlformats.org/",
    "https://schemas.openxmlformats.org/",
    # アクセス解析のビーコン。叩くと自分でページビューを1件作ってしまうので触らない
    "https://koban-roadmap.goatcounter.com/count",
)


def skip_reason(url, kind):
    """リンクとして確認する意味が無いURLを弾く。"""
    if url.startswith(SKIP_PREFIXES):
        return "名前空間・計測用"
    if "${" in url or "{{" in url:
        return "JSのテンプレート文字列（実URLではない）"
    if kind == "other" and re.match(r"^https?://[^/]+$", url):
        # <link rel="preconnect" href="https://fonts.gstatic.com"> のような
        # オリジンだけの指定。取得先ではないので 404 が正常
        return "preconnect等のオリジン指定"
    return None

EXPECTED_CT = {
    "PDF": ("application/pdf", "application/octet-stream"),
    "Word": ("application/vnd.openxmlformats-officedocument.wordprocessingml",
             "application/msword", "application/octet-stream"),
    "Excel": ("application/vnd.openxmlformats-officedocument.spreadsheetml",
              "application/vnd.ms-excel", "application/octet-stream"),
}


# ---------------------------------------------------------------- 収集
def _block(text, start_marker):
    """`var NAME = {` から対応する `}` までを切り出す（波かっこを数える）。"""
    i = text.index(start_marker)
    i = text.index("{", i)
    depth, j = 0, i
    while j < len(text):
        c = text[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                return text[i:j + 1]
        j += 1
    raise ValueError(start_marker + " の終わりが見つかりません")


def collect_targets(index_html_path, extra_html_paths):
    """確認対象を集める。同じURLが複数箇所に出る場合はラベルをまとめる。"""
    with open(index_html_path, encoding="utf-8") as f:
        idx = f.read()

    targets = {}   # url -> dict(label, kind, doctype, where)

    def add(url, label, kind, doctype=None, where="index.html"):
        url = url.strip().rstrip("\\")
        if not url.startswith("http") or skip_reason(url, kind):
            return
        t = targets.setdefault(url, {"labels": [], "kind": kind,
                                     "doctype": doctype, "where": where})
        if label not in t["labels"]:
            t["labels"].append(label)
        # kind は「厳しい方」を残す（様式ファイル > ポータル > 制度リンク > その他）
        order = {"docs-file": 3, "docs-portal": 2, "program": 1, "other": 0}
        if order[kind] > order[t["kind"]]:
            t["kind"], t["doctype"] = kind, doctype

    # 制度名と公式ページ。全国・都県の制度は PROGRAMS に、
    # 市区町村の制度は ADDED に入っていて、後から PROGRAMS へマージされる
    # （index.html: Object.keys(ADDED).forEach(...)）。両方を見ないと
    # 市区町村の71件が漏れる。
    names = {}
    for marker in ("var PROGRAMS =", "var ADDED ="):
        blk = _block(idx, marker)
        for m in re.finditer(r'\n    ([A-Za-z0-9_]+): \{(.*?)\n    \}', blk, re.S):
            key, body = m.group(1), m.group(2)
            nm = re.search(r'\n      name: "(.*?)"', body)
            names[key] = nm.group(1) if nm else key
            for lm in re.finditer(r'link: "(.*?)"', body):
                add(lm.group(1), names[key], "program")

    # PROGRAM_DOCS: 公式ポータルと様式ファイル
    # 2026-08-05（commit 76a9ca1）に index.html から program_docs_data.js へ
    # 分離された。ここが index.html だけを見ていたため 2026-08-17 の実行が
    # ValueError で落ち、「リンク切れ」の通知だけが飛んだ（実際にはリンクは
    # 無事で、様式1017件の確認が丸ごと素通りしていた）。分離先を先に探し、
    # 無ければ従来どおり index.html を見る。
    docs_src = idx
    docs_js = os.path.join(os.path.dirname(index_html_path), "program_docs_data.js")
    if "var PROGRAM_DOCS =" not in idx and os.path.exists(docs_js):
        with open(docs_js, encoding="utf-8") as f:
            docs_src = f.read()
    docs = _block(docs_src, "var PROGRAM_DOCS =")
    for m in re.finditer(r'\n    ([A-Za-z0-9_]+): \{(.*?)\n    \}', docs, re.S):
        key, body = m.group(1), m.group(2)
        pname = names.get(key, key)
        pm = re.search(r"portal: \{ label: '(.*?)', url: '(.*?)' \}", body)
        if pm:
            add(pm.group(2), pname + "／" + pm.group(1), "docs-portal")
        for im in re.finditer(
                r"\{ name: '(.*?)', url: '(.*?)', type: '(.*?)'\s*(?:, size: '(.*?)')?\s*\}", body):
            add(im.group(2), pname + "／" + im.group(1), "docs-file", im.group(3))

    # その他のHTML中の外部リンク（出典・参考資料など）
    for path in [index_html_path] + extra_html_paths:
        rel = os.path.relpath(path, ROOT).replace("\\", "/")
        with open(path, encoding="utf-8") as f:
            txt = f.read()
        for u in set(re.findall(r'https?://[^\s"\'<>)]+', txt)):
            u = u.rstrip('.,)')
            if u not in targets:
                add(u, "（出典・参考リンク）", "other", where=rel)

    # 上の素朴な拾い方は空白でURLを切る。ファイル名に全角スペースを含むURLがあり
    # （港区の「第2号様式　誓約書兼同意書.docx」。2026-07-31に実測）、途中で切れた
    # 断片が「リンク切れ」として毎週上がってしまう。PROGRAMS/PROGRAM_DOCS から
    # 正しく読めているURLの前半分でしかないものは、拾い間違いなので落とす。
    known = [u for u, t in targets.items() if t["kind"] != "other"]
    for u in [u for u, t in targets.items() if t["kind"] == "other"]:
        if any(k != u and k.startswith(u) for k in known):
            del targets[u]

    return targets


# ---------------------------------------------------------------- 確認
def probe(url):
    """1URLを叩いて生の観測値を返す。HEADが通らないときだけGETに落とす。"""
    def once(method):
        r = requests.request(method, url, headers=HEADERS, timeout=TIMEOUT,
                             allow_redirects=True, stream=(method == "GET"))
        try:
            cl = r.headers.get("Content-Length")
            return {
                "status": r.status_code,
                "final_url": r.url,
                "permanent_redirect": any(h.status_code in (301, 308) for h in r.history),
                # HEADにだけ Content-Length: 0 を返すサーバーがある
                # （city.chichibu.lg.jp で 2026-07-31 実測）。0は「不明」として捨てる
                "content_length": cl if (cl and cl != "0") else None,
                "last_modified": r.headers.get("Last-Modified"),
                "content_type": (r.headers.get("Content-Type") or "").split(";")[0].strip(),
                # 比較の前提が揃っているかを見るために、取り方も記録する
                "method": method,
                "encoding": r.headers.get("Content-Encoding") or "identity",
            }
        finally:
            r.close()

    try:
        res = once("HEAD")
        if res["status"] in (403, 405, 501) or res["status"] >= 500:
            time.sleep(1.0)
            res = once("GET")     # HEADを弾くだけのサーバーがあるため
        # 一時的な失敗はもう一度だけ試す（週次の誤報を減らす）
        if res["status"] >= 500 or res["status"] == 429:
            time.sleep(RETRY_WAIT)
            res = once("GET")
        return res
    except Exception:
        time.sleep(RETRY_WAIT)
        try:
            return once("GET")
        except Exception as e2:
            return {"status": None, "error": type(e2).__name__ + ": " + str(e2)[:120],
                    "final_url": url, "permanent_redirect": False,
                    "content_length": None, "last_modified": None, "content_type": None,
                    "method": None, "encoding": None}


def _lm_gap(a, b):
    """Last-Modified 2つの差を秒で返す。読めなければ大きい値（＝差あり扱い）。"""
    fmt = "%a, %d %b %Y %H:%M:%S %Z"
    try:
        return abs((datetime.strptime(a, fmt) - datetime.strptime(b, fmt)).total_seconds())
    except Exception:
        return 0 if a == b else 10 ** 9


def classify(url, t, now, prev):
    """観測値と前回値から判定する。"""
    st = now.get("status")

    # 404を返さないサーバーがある。it-shien.smrj.go.jp は存在しないパスにも403を返す
    # （2026-07-31 実測）。「いつも403のホスト」と「前は開けたのに開けなくなったURL」は
    # 意味が違うので、後者は要対応に格上げする。ただし1回きりの通信エラーで赤くしないよう、
    # 2回続けて失敗してからにする（fail_streak は台帳に持ち越している）。
    def _regressed(reason):
        if prev and prev.get("last_ok") and prev.get("fail_streak", 0) >= 1:
            return "regressed", "%s。%s には開けていた（2回続けて失敗）" % (reason, prev["last_ok"])
        return None

    if st is None:
        return _regressed("接続できない") or ("error", now.get("error", "接続できません"))
    if st in (404, 410):
        return "dead", "HTTP %d（ページが無い）" % st
    if st in (401, 403, 429):
        return _regressed("HTTP %d" % st) or \
            ("blocked", "HTTP %d（自動アクセスを拒否。目視で確認が要る）" % st)
    if st >= 500:
        return _regressed("HTTP %d" % st) or \
            ("server_error", "HTTP %d（サーバー側の障害の可能性）" % st)
    if st >= 400:
        return "dead", "HTTP %d" % st
    if st >= 300:
        return "dead", "HTTP %d（リダイレクトが解決できない）" % st

    # ここから 2xx
    if now.get("permanent_redirect") and now["final_url"] != url:
        return "moved", "恒久リダイレクト → " + now["final_url"]

    if t["kind"] == "docs-file" and t["doctype"] in EXPECTED_CT:
        ct = now.get("content_type") or ""
        if ct and not any(ct.startswith(p) for p in EXPECTED_CT[t["doctype"]]):
            return "type_mismatch", "%s のはずが Content-Type が %s" % (t["doctype"], ct)

    if prev is None:
        return "new", "今回から確認対象"

    # 差し替え検出は様式ファイルだけに限る。
    # HTMLページは中身が動くのが普通で（更新日時に取得時刻をそのまま返すCMSもある。
    # city.chichibu.lg.jp で 2026-07-31 実測）、毎週「変化あり」が並ぶと本物の
    # リンク切れが埋もれる。知りたいのは「様式が差し替わっていないか」なので、
    # 監視対象を PDF・Word・Excel に絞る。
    if t["kind"] == "docs-file":
        same_way = (prev.get("method") == now.get("method")
                    and prev.get("encoding") == now.get("encoding"))
        pl, nl = prev.get("content_length"), now.get("content_length")
        pm, nm = prev.get("last_modified"), now.get("last_modified")
        if same_way and pl and nl and pl != nl:
            return "changed", "サイズが %s → %s に変化（差し替えの可能性）" % (pl, nl)
        # 更新日時だけで判断しない。理由（どちらも 2026-07-31 実測）:
        #   八王子市: 2ファイルの更新日時が互いに入れ替わって返ってきた（7分差）。
        #             負荷分散でmtimeの違うサーバーに当たるため
        #   銚子市: 5ファイルの更新日時が同時刻に一斉に変わった。サイズは同じで、
        #           サイトの入れ替え作業でファイルが触られただけ
        # サイズが取れていて変わっていないなら、中身は変わっていないとみなす。
        # 更新日時を見るのはサイズが取れないときだけ、かつ1日以上ずれたとき
        if same_way and pl and nl and pl == nl:
            return "ok", ""
        if same_way and pm and nm and _lm_gap(pm, nm) > 86400:
            return "changed", "更新日時が %s → %s に変化" % (pm, nm)

    return "ok", ""


def run(targets, limit=None):
    urls = list(targets.keys())
    if limit:
        urls = urls[:limit]
    by_host = defaultdict(list)
    for u in urls:
        by_host[re.sub(r"^https?://([^/]+).*$", r"\1", u)].append(u)

    results = {}
    done = [0]
    total = len(urls)

    def work(host):
        for u in by_host[host]:
            results[u] = probe(u)
            done[0] += 1
            print("  [%3d/%3d] %s %s" % (done[0], total,
                  results[u].get("status") or "ERR", u[:88]), flush=True)
            time.sleep(PER_HOST_WAIT)

    with ThreadPoolExecutor(max_workers=HOST_PARALLEL) as ex:
        list(ex.map(work, by_host.keys()))
    return results


# ---------------------------------------------------------------- 出力
SEVERITY = [
    ("dead",          "🔴 リンク切れ（要修正）"),
    ("regressed",     "🔴 前は開けたのに開けなくなった（要修正）"),
    ("type_mismatch", "🔴 ファイルの種類が変わった（要確認）"),
    ("moved",         "🟠 移転（URLの書き換えを推奨）"),
    ("changed",       "🟠 中身が差し替わった可能性（最新版か確認）"),
    ("server_error",  "🟡 サーバー障害の可能性（次回も出たら対応）"),
    ("blocked",       "🟡 自動確認を拒否（目視が要る）"),
    ("error",         "🟡 接続できない（目視が要る）"),
    ("new",           "🔵 新規（今回から監視）"),
    ("ok",            "✅ 変化なし"),
]
NEEDS_FIX = {"dead", "regressed", "type_mismatch", "moved", "changed"}
NEEDS_EYE = {"server_error", "blocked", "error"}


def build_report(targets, results, verdicts, stamp, brief=False):
    groups = defaultdict(list)
    for u, (v, msg) in verdicts.items():
        groups[v].append((u, msg))

    lines = ["# リンク確認レポート", "",
             "- 確認時刻：**%s**（JST）" % stamp,
             "- 確認したURL：**%d件**" % len(results),
             "- 出所：各URLへの実アクセス（HEAD、拒否された場合のみGET）", ""]
    head = []
    for key, label in SEVERITY:
        if groups[key]:
            head.append("%s **%d件**" % (label, len(groups[key])))
    lines += ["## 集計", "", "／".join(head) if head else "（対象なし）", ""]

    for key, label in SEVERITY:
        if key == "ok" or not groups[key]:
            continue
        if brief and key == "new":
            lines += ["## " + label, "", "%d件（一覧は _tools/link_report.md）" % len(groups[key]), ""]
            continue
        lines += ["## " + label, ""]
        for u, msg in sorted(groups[key]):
            t = targets[u]
            lines.append("- **%s**" % "／".join(t["labels"]))
            lines.append("  - %s" % u)
            if msg:
                lines.append("  - %s" % msg)
        lines.append("")

    if groups["ok"] and not brief:
        lines += ["## ✅ 変化なし（%d件）" % len(groups["ok"]), "",
                  "<details><summary>一覧を開く</summary>", ""]
        for u, _ in sorted(groups["ok"]):
            lines.append("- %s — %s" % ("／".join(targets[u]["labels"]), u))
        lines += ["", "</details>", ""]
    if brief:
        lines += ["---", "",
                  "全件の一覧はリポジトリの `_tools/link_report.md`、",
                  "前回値との比較台帳は `_tools/link_status.json` にあります。",
                  "手元で取り直すには `python3 _tools/check_links.py --only <URLの一部>`。", ""]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--only", help="URLにこの文字列を含むものだけ確認する（直したURLの確認用）")
    ap.add_argument("--kind", choices=["program", "docs-file", "docs-portal", "other"],
                    help="種類で絞る（例: docs-file＝様式ファイルだけ）")
    ap.add_argument("--no-save", action="store_true")
    args = ap.parse_args()

    extra = [os.path.join(ROOT, "criteria.html"),
             os.path.join(ROOT, "documents.html")]
    for dirpath, _dirs, files in os.walk(os.path.join(ROOT, "improvement")):
        for fn in files:
            if fn.endswith(".html"):
                extra.append(os.path.join(dirpath, fn))

    targets = collect_targets(os.path.join(ROOT, "index.html"),
                              [p for p in extra if os.path.exists(p)])
    print("確認対象 %d件（制度リンク・様式ファイル・出典）" % len(targets), flush=True)

    prev = {}
    if os.path.exists(STATUS_PATH):
        with open(STATUS_PATH, encoding="utf-8") as f:
            prev = json.load(f).get("entries", {})

    check = targets
    if args.only:
        check = {u: t for u, t in check.items() if args.only in u}
    if args.kind:
        check = {u: t for u, t in check.items() if t["kind"] == args.kind}
    if args.only or args.kind:
        print("絞り込みにより %d件を確認する" % len(check), flush=True)

    results = run(check, args.limit)
    stamp = datetime.now(JST).strftime("%Y-%m-%d %H:%M")

    verdicts = {}
    for u, now in results.items():
        v, msg = classify(u, targets[u], now, prev.get(u))
        verdicts[u] = (v, msg)

    os.makedirs(TOOLS, exist_ok=True)
    # 絞り込んだときは全件版のレポートを上書きしない（全体像が消えるため）
    suffix = "" if len(check) == len(targets) else "_part"
    report_path = REPORT_PATH.replace(".md", suffix + ".md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write(build_report(targets, results, verdicts, stamp) + "\n")
    with open(BRIEF_PATH.replace(".md", suffix + ".md"), "w", encoding="utf-8") as f:
        f.write(build_report(targets, results, verdicts, stamp, brief=True) + "\n")

    if not args.no_save:
        entries = dict(prev)
        for u, now in results.items():
            e = dict(prev.get(u) or {})
            e.update({k: now.get(k) for k in
                      ("status", "final_url", "content_length", "last_modified",
                       "content_type", "method", "encoding")})
            e["checked"] = stamp
            e.setdefault("first_seen", stamp)
            if now.get("status") and 200 <= now["status"] < 300:
                e["last_ok"] = stamp
                e["fail_streak"] = 0
            else:
                # 何回続けて取れなかったか。1回きりの通信エラーで騒がないために持ち越す
                e["fail_streak"] = (prev.get(u) or {}).get("fail_streak", 0) + 1
            entries[u] = e
        # サイトから消えたURLは台帳からも消す
        entries = {u: e for u, e in entries.items() if u in targets}
        with open(STATUS_PATH, "w", encoding="utf-8") as f:
            json.dump({"generated": stamp, "entries": entries},
                      f, ensure_ascii=False, indent=1, sort_keys=True)

    counts = defaultdict(int)
    for v, _ in verdicts.values():
        counts[v] += 1
    print("\n" + "／".join("%s %d" % (k, counts[k]) for k, _ in SEVERITY if counts[k]))
    print("レポート: " + report_path)

    if any(counts[k] for k in NEEDS_FIX):
        return 1
    if any(counts[k] for k in NEEDS_EYE):
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())

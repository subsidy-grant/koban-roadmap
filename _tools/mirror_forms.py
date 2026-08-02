# -*- coding: utf-8 -*-
"""様式のうち、配布元が二次利用を認めているものだけを当サイトに取り込む。

なぜ必要か：
  ブラウザは他サイトのファイルを直接読めない（CORS）。2026-08-02 に公開URLから
  65ホストへ実際に fetch したところ、通ったのは9ホストだけだった。
  残りは「利用者が公式から落として、当サイトに置く」という手間が必要になる。
  自サイトに同じファイルがあれば同一オリジンになり、その手間が消える。

取り込んでよいホストの決め方：
  配布元の利用規約を実際に開いて、第三者による複製・二次利用が明示的に
  認められているホストだけを ALLOWED に入れる。
  「事前の承諾が必要」「無断で複製・転用できません」と書かれているホストは
  入れない（中小機構・東京都中小企業振興公社・多くの自治体がこれに当たる）。
  規約が変わることがあるので、ALLOWED の各行に確認日とURLを残す。

PDL1.0 の条件：
  出典を明示すること。編集・加工した場合はその旨も書くこと。
  当サイトはファイルを1バイトも変えずに保管し、出典と取得日時を
  forms/manifest.json と画面に必ず出す。

使い方：
    python3 _tools/mirror_forms.py            # 取り込み（変わったものだけ書き換え）
    python3 _tools/mirror_forms.py --check    # 差分があるかだけ見る（書かない）
"""
import argparse
import concurrent.futures as cf
import datetime
import hashlib
import io
import json
import os
import re
import ssl
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGE_DATA = os.path.join(ROOT, "page_data.js")
OUT_DIR = os.path.join(ROOT, "forms")
MANIFEST = os.path.join(OUT_DIR, "manifest.json")
CREDITS = os.path.join(OUT_DIR, "README.md")

# 二次利用が認められていることを実際に規約ページで確認したホストだけを書く。
# 確認日とその根拠URLを必ず残すこと。増やすときは規約を自分で開いて確かめる。
ALLOWED = {
    "www.mhlw.go.jp": {
        "org": "厚生労働省",
        "terms": "https://www.mhlw.go.jp/chosakuken/index.html",
        "license": "公共データ利用規約（第1.0版）PDL1.0",
        "checked": "2026-08-02",
    },
    "www.maff.go.jp": {
        "org": "農林水産省",
        "terms": "https://www.maff.go.jp/j/use/link.html",
        "license": "公共データ利用規約（第1.0版）PDL1.0",
        "checked": "2026-08-02",
    },
}

UA = ("Mozilla/5.0 (compatible; koban-roadmap form mirror; "
      "+https://subsidy-grant.github.io/koban-roadmap/)")
CTX = ssl.create_default_context()


def load_forms():
    """page_data.js から、自動入力の対象になる様式（docx/xlsx）を拾う。"""
    s = io.open(PAGE_DATA, encoding="utf-8").read()
    data = json.loads(s[s.index("{"):s.rindex("};") + 1])
    out = []
    for prog, doc in data["docs"].items():
        for group in doc["groups"]:
            for item in group["items"]:
                url = item["url"]
                if not re.search(r"\.(docx|xlsx)(\?|#|$)", url, re.I):
                    continue
                host = urllib.parse.urlsplit(url).netloc
                if host in ALLOWED:
                    out.append({"url": url, "host": host, "program": prog,
                                "name": item["name"]})
    # 同じURLが複数の制度から参照されることがある
    seen, uniq = set(), []
    for f in out:
        if f["url"] in seen:
            continue
        seen.add(f["url"])
        uniq.append(f)
    return uniq


def fetch(url):
    p = urllib.parse.urlsplit(url)
    safe = urllib.parse.urlunsplit(
        (p.scheme, p.netloc, urllib.parse.quote(p.path),
         urllib.parse.quote(p.query, safe="=&"), ""))
    req = urllib.request.Request(safe, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=60, context=CTX) as r:
        return r.read()


def local_path(url):
    """URLごとに一意で、名前が読めるパスを作る。"""
    p = urllib.parse.urlsplit(url)
    base = urllib.parse.unquote(os.path.basename(p.path)) or "form"
    base = re.sub(r'[\\/:*?"<>|]', "_", base)
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:8]
    return "forms/%s/%s_%s" % (p.netloc, h, base)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="差分を見るだけで書かない")
    args = ap.parse_args()

    forms = load_forms()
    print("対象 %d件（%s）" % (len(forms), "／".join(
        "%s %d件" % (ALLOWED[h]["org"], sum(1 for f in forms if f["host"] == h))
        for h in ALLOWED)))

    old = {}
    if os.path.exists(MANIFEST):
        old = json.load(io.open(MANIFEST, encoding="utf-8")).get("files", {})

    now = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9)))
    stamp = now.strftime("%Y-%m-%d %H:%M JST")

    def one(f):
        try:
            body = fetch(f["url"])
        except Exception as e:
            return (f, None, str(e)[:80])
        if body[:2] != b"PK":
            return (f, None, "Officeファイルとして読めない中身が返ってきた")
        return (f, body, None)

    with cf.ThreadPoolExecutor(4) as ex:
        results = list(ex.map(one, forms))

    files, changed, added, failed = {}, [], [], []
    for f, body, err in results:
        if err:
            failed.append((f["url"], err))
            # 取り直せなかったものは、前回の控えをそのまま残す（消さない）
            if f["url"] in old:
                files[f["url"]] = old[f["url"]]
            continue
        digest = hashlib.sha256(body).hexdigest()
        rel = local_path(f["url"])
        prev = old.get(f["url"])
        rec = {
            "path": rel,
            "sha256": digest,
            "bytes": len(body),
            "name": f["name"],
            "org": ALLOWED[f["host"]]["org"],
            "license": ALLOWED[f["host"]]["license"],
            "terms": ALLOWED[f["host"]]["terms"],
            "fetched": (prev or {}).get("fetched", stamp),
            "checked": stamp,
        }
        if not prev:
            added.append(f["url"])
            rec["fetched"] = stamp
        elif prev.get("sha256") != digest:
            changed.append(f["url"])
            rec["fetched"] = stamp
        files[f["url"]] = rec

        if not args.check:
            dst = os.path.join(ROOT, rel.replace("/", os.sep))
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            with open(dst, "wb") as fh:
                fh.write(body)

    print("新規 %d件／中身が変わった %d件／取得できなかった %d件"
          % (len(added), len(changed), len(failed)))
    for u, e in failed:
        print("  取得できず:", u, e)
    for u in changed:
        print("  更新あり:", u)

    if args.check:
        return 1 if (added or changed) else 0

    os.makedirs(OUT_DIR, exist_ok=True)
    manifest = {
        "note": ("配布元が二次利用を認めている様式だけを、1バイトも変えずに保管した控え。"
                 "出典と取得日時を必ず画面に出すこと。最新版は必ず出典元で確認すること。"),
        "updated": stamp,
        "files": files,
    }
    with io.open(MANIFEST, "w", encoding="utf-8", newline="\n") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=1, sort_keys=True)

    lines = ["# 様式の控えについて", "",
             "このフォルダには、各府省が公開している申請様式の控えを置いています。",
             "**1バイトも変えていません。**ブラウザは他サイトのファイルを直接読めないため、",
             "会社情報の自動入力に使う目的で、同じサイト内に置いています。", "",
             "最終取得: " + stamp, "",
             "## 出典", ""]
    for host, meta in ALLOWED.items():
        n = sum(1 for r in files.values() if r["org"] == meta["org"])
        lines.append("- 出典：%sウェブサイト（https://%s/）　%d件" % (meta["org"], host, n))
        lines.append("  - 利用条件：%s（%s、%s 確認）"
                     % (meta["license"], meta["terms"], meta["checked"]))
    lines += ["", "編集・加工は行っていません。利用者が自分の会社情報を書き込んだファイルは、",
              "利用者の端末の中だけで作られ、当サイトには送信されません。", ""]
    with io.open(CREDITS, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(lines))

    print("書き出し:", MANIFEST)
    return 0


if __name__ == "__main__":
    sys.exit(main())

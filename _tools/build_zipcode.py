#!/usr/bin/env python3
"""日本郵便の郵便番号データから、書類作成ページ用の住所辞書を作る。

なぜ自前で持つのか：
  documents.html には「入力した内容はこの端末の中だけに保存されます」と書いてある。
  郵便番号を外部の検索APIに投げると、その約束が崩れる（郵便番号だけとはいえ外に出る）。
  自サイトから配れば1件も外に出ない。CORSの制約も受けない。

出力：
  zipdata/<上3桁>.json  … 例 zipdata/150.json
      {"1500001": ["東京都", "渋谷区", "神宮前"], ...}
  1回の検索で落ちてくるのは該当する1ファイル（数KB）だけ。

元データ：
  https://www.post.japanpost.jp/zipcode/dl/utf-zip.html の utf_ken_all.zip
  （直リンクはUser-Agentによって404を返すため、実ブラウザで取得する）

使い方：
    python3 _tools/build_zipcode.py            # 取得して作り直す
    python3 _tools/build_zipcode.py --check    # 件数だけ確認する（取得しない）

郵便番号は月1回更新される。毎週のリンク確認ワークフローで作り直して差分をコミットする。
"""
import argparse
import csv
import io
import json
import os
import re
import shutil
import sys
import zipfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTDIR = os.path.join(ROOT, "zipdata")
PAGE = "https://www.post.japanpost.jp/zipcode/dl/utf-zip.html"

# 町域の欄に入る「住所ではない注記」。これが入ったまま住所欄に流し込むと、
# 「〒150-0001 東京都渋谷区以下に掲載がない場合」のような文字が申請書に載る。
NOISE = re.compile(r"以下に掲載がない場合|"
                   r"の次に番地がくる場合|"
                   r"一円$|"
                   r"^その他$")


def fetch_zip(dest):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(accept_downloads=True)
        pg.goto(PAGE, wait_until="load")
        pg.wait_for_timeout(1500)
        with pg.expect_download(timeout=120000) as dl:
            pg.click("a[href*='utf_ken_all.zip']")
        dl.value.save_as(dest)
        b.close()


def clean_town(town):
    """町域から注記を落とす。落としきったら空にする（市区町村までで止める）。"""
    town = town.strip()
    if NOISE.search(town):
        return ""
    # 「銀座（次のビルを除く）」「甲、乙」等のかっこ書きは住所の一部ではない
    town = re.sub(r"[（(][^）)]*[)）]?", "", town)
    # 「○○丁目」を含む注記が閉じかっこ無しで残ることがある
    town = re.sub(r"[（(].*$", "", town)
    return town.strip()


def build(csv_bytes):
    rows = csv.reader(io.StringIO(csv_bytes.decode("utf-8")))
    table = {}
    dup = 0
    for r in rows:
        if len(r) < 9:
            continue
        code = r[2].strip()
        if not re.fullmatch(r"\d{7}", code):
            continue
        pref, city, town = r[6].strip(), r[7].strip(), clean_town(r[8])
        if code in table:
            # 同じ郵便番号に複数の町域がある（大字が分かれている等）。
            # 先に出たほうを残す。どれが正しいかは機械では決められないので、
            # 画面側で「番地から先はご自身で確認してください」と出す前提にしている
            dup += 1
            continue
        table[code] = [pref, city, town]
    return table, dup


def write(table):
    if os.path.isdir(OUTDIR):
        shutil.rmtree(OUTDIR)
    os.makedirs(OUTDIR)
    buckets = {}
    for code, v in table.items():
        buckets.setdefault(code[:3], {})[code] = v
    total = 0
    for pre, obj in buckets.items():
        p = os.path.join(OUTDIR, pre + ".json")
        s = json.dumps(obj, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
        io.open(p, "w", encoding="utf-8", newline="\n").write(s)
        total += len(s.encode("utf-8"))
    return len(buckets), total


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="今ある zipdata/ の件数を数えるだけ")
    args = ap.parse_args()

    if args.check:
        if not os.path.isdir(OUTDIR):
            print("zipdata/ がまだ無い")
            sys.exit(1)
        files = [f for f in os.listdir(OUTDIR) if f.endswith(".json")]
        n = sum(len(json.load(io.open(os.path.join(OUTDIR, f), encoding="utf-8")))
                for f in files)
        print("ファイル %d / 郵便番号 %d件" % (len(files), n))
        return

    tmp = os.path.join(ROOT, "_ken_all.zip")
    print("日本郵便から取得中…（実ブラウザ）")
    fetch_zip(tmp)
    with zipfile.ZipFile(tmp) as z:
        name = [n for n in z.namelist() if n.lower().endswith(".csv")][0]
        data = z.read(name)
    os.remove(tmp)

    table, dup = build(data)
    files, total = write(table)
    print("郵便番号 %d件（同一番号で町域が複数のため落としたもの %d件）" % (len(table), dup))
    print("zipdata/ に %d ファイル・合計 %.1fMB" % (files, total / 1048576.0))
    print("1回の検索で落ちるのは1ファイルだけ（平均 %.1fKB）" % (total / files / 1024.0))


if __name__ == "__main__":
    main()

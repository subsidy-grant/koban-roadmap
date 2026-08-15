# -*- coding: utf-8 -*-
"""index.html + program_docs_data.js から、書類作成ページ（documents.html）が
使うデータを書き出す。

なぜ生成するのか：
  制度データ（PROGRAMS）は index.html の中に、様式データ（PROGRAM_DOCS）は
  program_docs_data.js の中にある。documents.html にコピーすると出所が
  2つ以上になり、必ずどれかが古くなる。そこでこの2ファイルを唯一の出所とし、
  ここから page_data.js を機械的に作る。

  PROGRAM_DOCSは2026-08-15にindex.htmlから分離した（表示に一切使わない
  約240KBを通常訪問者のダウンロードから外すため）。分離後もビルドの都合上
  必要なので、index.html読み込み後にscriptタグとして追加注入する。

なぜ正規表現ではなく実ブラウザなのか：
  PROGRAMS は `var PROGRAMS = {...}` のあとに `var ADDED = {...}` が実行時に
  マージされる作りで（index.html の Object.keys(ADDED).forEach(...)）、
  テキストを読むだけでは最終形にならない。実際に読み込んだあとの値を取る。

使い方：
    python3 _tools/build_page_data.py          # 生成して page_data.js を書く
    python3 _tools/build_page_data.py --check  # 差分があるかだけ見る（書かない）

index.html の制度データ、または program_docs_data.js の様式データを
触ったら、これを流し直すこと。
"""
import io
import json
import os
import sys
import argparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "index.html")
DOCS_SRC = os.path.join(ROOT, "program_docs_data.js")
OUT = os.path.join(ROOT, "page_data.js")

# documents.html と program.html（1ページ1制度の詳細ページ、2026-08-05新設）が
# 使う項目だけを持ち出す。全部入れるとファイルが重くなり、中高年・非IT層が多い
# 読者の回線で初期表示が遅くなる。program.html は renderProgram() と同じ8項目
# （事業規模・対象経費・補助率・上限額・賃金上昇要件・採択率・受付期間・継続性）
# ＋note を pd-grid として組み立てるため、その素材となるフィールドを追加した。
PROGRAM_FIELDS = [
    "name", "prefecture", "municipality", "schedule", "link", "linkLabel",
    "scale", "expense", "rate", "cap", "wage", "acceptance", "note", "continuity"
]

EXTRACT = """() => {
  if (typeof PROGRAMS === 'undefined' || typeof window.KOBAN_PROGRAM_DOCS === 'undefined') return null;
  const fields = %s;
  const programs = {};
  Object.keys(PROGRAMS).forEach(k => {
    const src = PROGRAMS[k], dst = {};
    fields.forEach(f => { if (src[f]) dst[f] = src[f]; });
    programs[k] = dst;
  });
  return { programs: programs, docs: window.KOBAN_PROGRAM_DOCS };
}"""


def extract():
    from playwright.sync_api import sync_playwright
    url = "file:///" + SRC.replace("\\", "/")
    errors = []
    with sync_playwright() as pw:
        # 2026-08-06、この端末で同梱の headless_shell が Windowsのアプリケーション制御
        # ポリシーにブロックされる事象が起きた。失敗したらシステムのChromeへ切り替える。
        try:
            b = pw.chromium.launch()
        except Exception:
            b = pw.chromium.launch(channel="chrome")
        pg = b.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e)))
        pg.goto(url, wait_until="load")
        # PROGRAM_DOCSはindex.html本体から分離済み（2026-08-15）。
        # ビルド時だけ追加で注入し、window.KOBAN_PROGRAM_DOCSとして読む。
        pg.add_script_tag(path=DOCS_SRC)
        pg.wait_for_timeout(1200)
        data = pg.evaluate(EXTRACT % json.dumps(PROGRAM_FIELDS))
        b.close()
    if errors:
        # JSが途中で落ちていると ADDED のマージ前の値を掴んでしまう。黙って進めない。
        raise SystemExit("index.html でJSエラーが出ている。先に直すこと:\n  " +
                         "\n  ".join(errors))
    if not data:
        raise SystemExit("PROGRAMS / PROGRAM_DOCS が読めなかった。"
                         "index.html / program_docs_data.js の構造が変わっていないか確認すること。")
    return data


def render(data):
    head = (
        "// 自動生成。手で編集しない。\n"
        "//   出所      : index.html の PROGRAMS（実行後の値） / program_docs_data.js の PROGRAM_DOCS\n"
        "//   作り直す  : python3 _tools/build_page_data.py\n"
        "//   使うページ: documents.html（申請書類の準備）\n"
        "//   制度 %d 件 / 様式を載せている制度 %d 件\n"
        % (len(data["programs"]), len(data["docs"]))
    )
    body = json.dumps(data, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return head + "window.KOBAN_DATA = " + body + ";\n"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="書かずに差分の有無だけ見る")
    args = ap.parse_args()

    data = extract()
    text = render(data)
    n_files = sum(len(g.get("items", []))
                  for d in data["docs"].values() for g in d.get("groups", []))

    old = io.open(OUT, encoding="utf-8").read() if os.path.exists(OUT) else ""
    same = (old == text)
    print("制度 %d 件 / 様式を載せている制度 %d 件 / 様式ファイル %d 件"
          % (len(data["programs"]), len(data["docs"]), n_files))
    if args.check:
        print("page_data.js は" + ("最新" if same else "古い（作り直しが必要）"))
        sys.exit(0 if same else 1)
    if same:
        print("変化なし。書き換えない。")
        return
    io.open(OUT, "w", encoding="utf-8", newline="\n").write(text)
    print("書き出した: page_data.js（%.0fKB）" % (len(text.encode("utf-8")) / 1024.0))


if __name__ == "__main__":
    main()

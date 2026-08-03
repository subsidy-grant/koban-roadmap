# -*- coding: utf-8 -*-
r"""直す前と直した後で、全様式の「どこに何を入れたか」を突き合わせる。

なぜ要るのか：
  自動入力の直しは、直した様式以外にも影響する。
  2026-08-04 だけで、こちらが直したつもりで別のところを壊した例が3件あった。

    ・表の列見出しに値を書き込んだ（事業所確認票）
    ・住所を2行に分ける処理が効かなくなった（様式第7号ほか）
    ・幅の見積もりを外して住所と氏名が行の途中で割れ、ページ送りまで崩れた
      （物価高騰の申出書。1ページ目の記述枠が2ページ目へ押し出された）

  いずれもこの道具で「消えた／増えた」を見て気づいた。
  **コードを直したら、記入結果の差分を必ず見ること。**

使い方（ローカルサーバー http://127.0.0.1:8935 を立てたうえで）：

    cd D:\Claudecode\koban-roadmap
    git show HEAD:documents.html > _old_documents.html
    python tools\diff_fills.py
    del _old_documents.html

  比べる相手を変えたいときは HEAD~3 などにする。
  「kieta（消えた）」が出たら、意図した変更かどうかを必ず確かめる。
  件数が同じでも入れる場所が変わっていることがあるので、
  件数ではなく「場所と値」で突き合わせている。
"""
import json, os, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
BASE = "http://127.0.0.1:8935"
# sweep_render.py と同じ値を使う（そろえないと差分の意味が変わる）
COMPANY = {
    "entity": "法人", "name": "株式会社サンプル美容", "kana": "カブシキガイシャサンプルビヨウ",
    "houjin": "1234567890123", "zip": "150-0001", "addr": "東京都渋谷区神宮前1-2-3",
    "title": "代表取締役", "rep": "山田 太郎", "repKana": "ヤマダ タロウ",
    "tel": "03-1234-5678", "mail": "info@example.jp", "employees": "8",
    "capital": "3000000", "industry": "美容業", "industryCode": "78",
    "business": "美容室の経営", "staff": "山田 太郎", "staffTel": "03-1234-5678",
    "hokenNo": "1301-123456-7",
}


def targets():
    m = json.load(open(os.path.join(ROOT, "forms", "manifest.json"), encoding="utf-8"))
    out = []
    for _url, f in m["files"].items():
        p = os.path.join(ROOT, f["path"].replace("/", os.sep))
        if os.path.exists(p) and p.lower().endswith((".docx", ".xlsx")):
            out.append(p)
    out.sort(key=os.path.basename)
    return out


def fills_of(page_url, paths, pw):
    b = pw.chromium.launch()
    ctx = b.new_context(viewport={"width": 1280, "height": 900})
    page = ctx.new_page()
    page.add_init_script("localStorage.setItem('koban_company', %s);"
                         % json.dumps(json.dumps(COMPANY, ensure_ascii=False)))
    page.goto(page_url, wait_until="load")
    page.wait_for_timeout(1200)
    page.evaluate("document.querySelectorAll('main > section')"
                  ".forEach(s=>s.classList.add('is-open'))")
    page.evaluate("var d=document.getElementById('afManualBox'); if(d) d.open=true;")
    out = {}
    for p in paths:
        fn = os.path.basename(p)
        page.evaluate("window.KOBAN_FILL_LOG = []")
        try:
            page.set_input_files("#fileInput", p)
            page.wait_for_function("(window.KOBAN_FILL_LOG||[]).length > 0", timeout=30000)
            lg = page.evaluate("window.KOBAN_FILL_LOG[0]") or {}
            out[fn] = sorted("%s=%s" % (f.get("where"), f.get("value"))
                             for f in (lg.get("fills") or []))
        except Exception:
            out[fn] = ["(読めなかった)"]
    b.close()
    return out


def main():
    old_path = os.path.join(ROOT, "_old_documents.html")
    if not os.path.exists(old_path):
        print("比べる相手がありません。先にこれを実行してください：")
        print("    git show HEAD:documents.html > _old_documents.html")
        return
    from playwright.sync_api import sync_playwright
    paths = targets()
    with sync_playwright() as pw:
        new = fills_of(BASE + "/documents.html", paths, pw)
        old = fills_of(BASE + "/_old_documents.html", paths, pw)

    same, moved = 0, 0
    for fn in sorted(new):
        a, b = old.get(fn, []), new[fn]
        if a == b:
            same += 1
            continue
        moved += 1
        print("== %s" % fn)
        for x in a:
            if x not in b:
                print("   消えた : %s" % x[:110])
        for x in b:
            if x not in a:
                print("   増えた : %s" % x[:110])
    print("\n変わらない: %d / %d 　変わった: %d" % (same, len(new), moved))
    if moved:
        print("「消えた」が意図した変更かどうか、必ず確かめること。")


main()

# -*- coding: utf-8 -*-
"""ミラー済みの全様式に自動入力を流し、1件ずつ「どこに何を入れたか」を書き出す。

目的：
  1. いまの精度を数字で押さえる（何件入れて、何件が疑わしいか）
  2. 今後 様式が増えたときに、同じコマンドで回帰を見る

疑わしいと判定するもの（見つけたら人が中身を見る）：
  ・単位だけの欄（人・円・年月日）を上書きした
  ・同じ表の同じ列に2回以上入れた（一覧表の全行を埋めた疑い）
  ・入れた値と欄の名前が食い違う（郵便番号を従業員数の欄に、など）
"""
import io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
FORMS = os.path.join(ROOT, "forms", "www.mhlw.go.jp")
PAGE = "http://127.0.0.1:8935/documents.html#autofill"

COMPANY = {
    "entity": "法人", "kana": "カブシキガイシャサンプルビヨウ", "repKana": "ヤマダ タロウ",
    "industryCode": "78", "regAddr": "東京都千代田区丸の内1-1-1", "regZip": "100-0005",
    "name": "株式会社サンプル美容", "houjin": "1234567890123", "zip": "150-0001",
    "addr": "東京都渋谷区神宮前1-2-3", "title": "代表取締役", "rep": "山田 太郎",
    "tel": "03-1234-5678", "mail": "info@example.jp", "employees": "8",
    "capital": "3000000", "founded": "2019-04-01", "industry": "美容業",
    "business": "美容室の経営", "staff": "山田 太郎", "staffTel": "03-1234-5678",
    "hokenNo": "1301-123456-7",
}

# 「単位だけの欄を上書きした」＝ 元の中身が単位しかない
UNIT_ONLY = re.compile(r"^[人名円万千年月日時分秒％%件個台枚回¥￥\-−ー－~〜・,，、。\s　]+$")
# 値の種類と単位が合っていれば正しい記入（従業員数を「人」の欄に入れるなど）
VALUE_TO_KEY = {v: k for k, v in COMPANY.items()}
# 資本金は3桁区切りで書く（3000000 → 3,000,000）
VALUE_TO_KEY["3,000,000"] = "capital"
# 「万円」「千円」の欄には単位に直した数を書く（3,000,000円 → 300万円 / 3,000千円）
VALUE_TO_KEY["300"] = "capital"
VALUE_TO_KEY["3,000"] = "capital"
VALUE_TO_KEY["代表取締役　山田 太郎"] = "titleRep"
VALUE_TO_KEY["株式会社サンプル美容　代表取締役　山田 太郎"] = "nameRep"
VALUE_TO_KEY["150-0001　東京都渋谷区神宮前1-2-3"] = "addr"
VALUE_TO_KEY["〒150-0001　東京都渋谷区神宮前1-2-3"] = "addr"
UNIT_OK_BY_KEY_EXTRA = {"titleRep": None, "nameRep": None}
UNIT_OK_BY_KEY = {
    "employees": re.compile(r"[人名]"), "capital": re.compile(r"[円万千¥￥]"),
    "founded": re.compile(r"[年月日]"), "tel": re.compile(r"^[\-−ー－()（）\s　]+$"),
    "fax": re.compile(r"^[\-−ー－()（）\s　]+$"), "zip": re.compile(r"^[〒\-−ー－\s　]+$"),
}


def suspicious(fills):
    """怪しい記入を返す。"""
    out = []
    seen = {}
    for f in fills:
        w = f["where"]
        m = re.search(r"元の「(.+?)」を上書き", w)
        if m and UNIT_ONLY.match(m.group(1)):
            # 単位を残して書いた場合（「8人」）は単位を外して照合する
            v = re.sub(r"(人|名|円|万円|千円)$", "", f["value"])
            key = VALUE_TO_KEY.get(f["value"]) or VALUE_TO_KEY.get(v)
            ok = UNIT_OK_BY_KEY.get(key)
            if not (ok and ok.search(m.group(1))):
                out.append(("単位だけの欄を上書き", w, f["value"]))
        # 同じ「どこに」が2回以上出たら一覧表の全行を埋めた疑い
        base = re.sub(r"（元の.*?）", "", w)
        seen[base] = seen.get(base, 0) + 1
    for base, cnt in seen.items():
        if cnt >= 2:
            out.append(("同じ欄に%d回入れた" % cnt, base, ""))
    # 印字されていた文字を消してしまった疑い。単位だけの欄は別に見ているので、
    # ここでは2文字を超える文字を上書きしたものを挙げる
    for f in fills:
        m = re.search(r"元の「(.+?)」を上書き", f["where"])
        if not m:
            continue
        prev = re.sub(r"[\s　]+", "", m.group(1))
        # 郵便番号の枠（〒）は、郵便番号ごと書き直しているので消えていない
        if "〒" in prev and f["value"].startswith("〒"):
            continue
        if len(prev) > 2 and not UNIT_ONLY.match(m.group(1)):
            out.append(("印字されていた文字を上書き", m.group(1), f["value"]))
    return out


def main():
    files = sorted(f for f in os.listdir(FORMS) if f.lower().endswith((".docx", ".xlsx")))
    rows, total_fills, total_susp = [], 0, 0
    with sync_playwright() as pw:
        # 2026-08-06、この端末で同梱の headless_shell が Windowsのアプリケーション制御
        # ポリシーにブロックされる事象が起きた。失敗したらシステムのChromeへ切り替える。
        try:
            b = pw.chromium.launch()
        except Exception:
            b = pw.chromium.launch(channel="chrome")
        page = b.new_context(viewport={"width": 1280, "height": 900}).new_page()
        errs = []
        page.on("pageerror", lambda e: errs.append(str(e)))
        page.add_init_script("localStorage.setItem('koban_company', %s);"
                             % json.dumps(json.dumps(COMPANY, ensure_ascii=False)))
        page.goto(PAGE, wait_until="load")
        page.wait_for_timeout(1200)
        page.evaluate("document.querySelectorAll('main > section').forEach(function(s){s.classList.add('is-open')})")
        page.evaluate("var d=document.getElementById('afManualBox'); if(d) d.open=true;")
        page.wait_for_timeout(300)

        # 2026-08-03に結果カードを廃止したので、画面ではなく
        # window.KOBAN_FILL_LOG（どの欄に何を入れたかの記録）を読む
        for fn in files:
            page.evaluate("window.KOBAN_FILL_LOG = []")
            page.set_input_files("#fileInput", os.path.join(FORMS, fn))
            try:
                page.wait_for_function("(window.KOBAN_FILL_LOG||[]).length > 0", timeout=25000)
            except Exception:
                rows.append({"file": fn, "fills": [], "n": 0, "susp": [], "note": "結果が出ませんでした"})
                continue
            page.wait_for_timeout(200)
            data = page.evaluate("window.KOBAN_FILL_LOG[0]")
            fills = (data or {}).get("fills", [])
            sus = suspicious(fills)
            total_fills += len(fills)
            total_susp += len(sus)
            rows.append({"file": fn, "n": len(fills), "fills": fills, "susp": sus,
                         "skips": (data or {}).get("skips", [])})
        b.close()

    print("=== 自動入力の精度（%d ファイル） ===" % len(files))
    for r in rows:
        mark = "NG" if r["susp"] else "OK"
        print("%s %-22s 記入 %2d件%s" % (mark, r["file"][-20:], r["n"],
              ("  ← " + " / ".join("%s: %s" % (a, b[:48]) for a, b, _ in r["susp"])) if r["susp"] else ""))
    print("\n合計 記入 %d件 / 疑わしい %d件 / ファイル %d" % (total_fills, total_susp, len(files)))
    io.open(os.path.join(HERE, "autofill_audit.json"), "w", encoding="utf-8").write(
        json.dumps(rows, ensure_ascii=False, indent=1))
    print("明細: autofill_audit.json")
    sys.exit(1 if total_susp else 0)


main()

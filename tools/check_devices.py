# -*- coding: utf-8 -*-
"""端末が変わっても記入結果が同じかを実測する。

「別の端末」で起こりうる差を条件として与え、同じ様式・同じ入力を流して
「どの欄に何を入れたか」「どの欄をなぜ入れなかったか」を突き合わせる。
条件：画面の大きさ（iPhone想定/PC/タブレット）・言語・タイムゾーン・画面の細かさ・タッチの有無。
"""
import json
import os
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from playwright.sync_api import sync_playwright

ROOT = r"D:\Claudecode\koban-roadmap"
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

CONDS = [
    ("PC・日本語・東京", dict(viewport={"width": 1280, "height": 900}, locale="ja-JP",
                             timezone_id="Asia/Tokyo", device_scale_factor=1)),
    ("iPhone想定・タッチ", dict(viewport={"width": 390, "height": 844}, locale="ja-JP",
                               timezone_id="Asia/Tokyo", device_scale_factor=3,
                               is_mobile=True, has_touch=True)),
    ("英語ロケール・NY", dict(viewport={"width": 1280, "height": 900}, locale="en-US",
                             timezone_id="America/New_York", device_scale_factor=1)),
    ("タブレット・高DPI", dict(viewport={"width": 768, "height": 1024}, locale="ja-JP",
                              timezone_id="Asia/Tokyo", device_scale_factor=2, has_touch=True)),
]


def run(pw, label, ctxargs, files):
    b = pw.chromium.launch()
    ctx = b.new_context(**ctxargs)
    page = ctx.new_page()
    errs = []
    page.on("pageerror", lambda e: errs.append(str(e)))
    page.add_init_script("localStorage.setItem('koban_company', %s);"
                         % json.dumps(json.dumps(COMPANY, ensure_ascii=False)))
    page.goto(PAGE, wait_until="load")
    page.wait_for_timeout(1200)
    page.evaluate("document.querySelectorAll('main > section').forEach(function(s){s.classList.add('is-open')})")
    page.evaluate("var d=document.getElementById('afManualBox'); if(d) d.open=true;")
    page.wait_for_timeout(300)

    out = {}
    for fn in files:
        page.evaluate("window.KOBAN_FILL_LOG = []")
        page.set_input_files("#fileInput", os.path.join(FORMS, fn))
        try:
            page.wait_for_function("(window.KOBAN_FILL_LOG||[]).length > 0", timeout=25000)
        except Exception:
            out[fn] = {"error": "結果が出ませんでした"}
            continue
        page.wait_for_timeout(150)
        d = page.evaluate("window.KOBAN_FILL_LOG[0]") or {}
        out[fn] = {"fills": d.get("fills", []), "skips": d.get("skips", []),
                   "error": d.get("error", "")}
    b.close()
    n = sum(len(v.get("fills", [])) for v in out.values())
    print("  %-20s 様式%d件 / 記入%d件 / JSエラー%d件" % (label, len(out), n, len(errs)))
    if errs:
        for e in errs[:3]:
            print("      JSエラー:", e[:120])
    return out


def key(v):
    return json.dumps(v, ensure_ascii=False, sort_keys=True)


def main():
    files = sorted(f for f in os.listdir(FORMS) if f.lower().endswith((".docx", ".xlsx")))
    print("対象:", len(files), "様式\n")
    res = {}
    with sync_playwright() as pw:
        for label, args in CONDS:
            res[label] = run(pw, label, args, files)

    base_label = CONDS[0][0]
    base = res[base_label]
    print("\n=== 基準「%s」との突き合わせ ===" % base_label)
    bad = 0
    for label, per in res.items():
        if label == base_label:
            continue
        dfill = [f for f in files if key(per[f].get("fills")) != key(base[f].get("fills"))]
        dskip = [f for f in files if key(per[f].get("skips")) != key(base[f].get("skips"))]
        bad += len(dfill) + len(dskip)
        print("  %-20s 記入が違う %d件 / 見送り理由が違う %d件" % (label, len(dfill), len(dskip)))
        for f in (dfill + dskip)[:4]:
            print("      差:", f)

    print("\n基準での記入総数:", sum(len(v.get("fills", [])) for v in base.values()))
    print("判定:", "端末条件を変えても記入結果は同一" if bad == 0 else "★条件によって結果が変わる★")
    return 0 if bad == 0 else 1


sys.exit(main())

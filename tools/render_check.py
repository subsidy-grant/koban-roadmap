# -*- coding: utf-8 -*-
"""記入したファイルを「実際にExcel／Wordで開いて」PDFにし、見た目を点検する。

なぜ要るのか（2026-08-03の反省）：
  ファイルの中身（XML）だけを見る点検では、次の3つが一度も見つからなかった。
    ・法人番号が細いセルに押し込まれて読めない（結合漏れ＋縮小して全体を表示）
    ・所在地が「〒113」で切れて、住所がどこにも見えない
    ・Wordで値の文字だけ極端に小さい
  どれも「開いて見れば一目」なのに、中身を読むだけでは分からない。
  ここでは本物のExcel／Wordに描かせ、PDFの文字を読み直して
  「入れたはずの値が、ちゃんと読める形で紙に出ているか」を確かめる。

使い方（Excel／Wordが入っている端末で）：
    python tools\render_check.py            … 既定の様式一式
    python tools\render_check.py <ファイル> … 記入済みファイルを指定
出るもの：
    tools\render_out\*.pdf  … 実際に印刷される姿
    tools\render_out\*.png  … 目で見るための画像（1ページ目から数枚）
    画面に「紙に出てこなかった値」の一覧（＝潰れている・切れている疑い）
"""
import glob, json, os, re, sys, warnings
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
warnings.filterwarnings("ignore")

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "render_out")
os.makedirs(OUT, exist_ok=True)
PAGE = "http://127.0.0.1:8935/documents.html"
FORMS = os.path.join(os.path.dirname(HERE), "forms")
SOUI = os.path.join(HERE, "soui")
COMPANY = {
    "entity": "法人", "name": "株式会社サンプル美容", "kana": "カブシキガイシャサンプルビヨウ",
    "houjin": "1234567890123", "zip": "150-0001", "addr": "東京都渋谷区神宮前1-2-3",
    "title": "代表取締役", "rep": "山田 太郎", "repKana": "ヤマダ タロウ",
    "tel": "03-1234-5678", "mail": "info@example.jp", "employees": "8",
    "capital": "3000000", "industry": "美容業", "industryCode": "78",
    "business": "美容室の経営", "staff": "山田 太郎", "staffTel": "03-1234-5678",
    "hokenNo": "1301-123456-7",
}
DEFAULT_TARGETS = [
    os.path.join(SOUI, "申請書.xlsx"),
    os.path.join(SOUI, "同意書（代理申請用）.docx"),
]
for pat in ("6adefe11_001698095.xlsx", "b93f369a_001690646.xlsx", "1d3c9_001691204.docx"):
    hit = glob.glob(os.path.join(FORMS, "**", "*" + pat), recursive=True)
    if hit:
        DEFAULT_TARGETS.append(hit[0])


def fill_with_site(paths):
    """当サイトに記入させて、記入済みファイルと「どこに何を入れたか」を受け取る。"""
    from playwright.sync_api import sync_playwright
    got, logs = [], {}
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(viewport={"width": 1280, "height": 900}, accept_downloads=True)
        page = ctx.new_page()
        page.add_init_script("localStorage.setItem('koban_company', %s);"
                             % json.dumps(json.dumps(COMPANY, ensure_ascii=False)))
        page.goto(PAGE, wait_until="load")
        page.wait_for_timeout(1200)
        page.evaluate("document.querySelectorAll('main > section').forEach(s=>s.classList.add('is-open'))")
        page.evaluate("var d=document.getElementById('afManualBox'); if(d) d.open=true;")
        for p in paths:
            fn = os.path.basename(p)
            page.evaluate("window.KOBAN_FILL_LOG = []")
            page.set_input_files("#fileInput", p)
            try:
                page.wait_for_function("(window.KOBAN_FILL_LOG||[]).length > 0", timeout=30000)
            except Exception:
                print("  記入できず:", fn); continue
            page.wait_for_timeout(300)
            logs[fn] = page.evaluate("window.KOBAN_FILL_LOG[0]")
            try:
                with page.expect_download(timeout=15000) as dl:
                    page.eval_on_selector("#frDone .fr-list > li:last-child a.btn-dl", "e=>e.click()")
                dest = os.path.join(OUT, fn)
                dl.value.save_as(dest)
                got.append(dest)
            except Exception:
                print("  保存できず:", fn)
        b.close()
    return got, logs


def safe(s):
    return re.sub(r'[\\/:*?"<>|\s　]+', "_", str(s))[:40]


def to_pdf(path, sheets=None):
    """本物のExcel／WordでPDFに書き出す（＝人が開いたときの姿）。

    Excelはブックごと書き出すと、印刷範囲のあるシートしか紙にならない。
    記入したシートを1枚ずつ書き出す。印刷範囲の指定は配布元のまま触らない
    （外すと横幅が広がって、実際には切れない欄まで切れて見えるため）。
    """
    import win32com.client as win32
    base = os.path.splitext(path)[0]
    if path.lower().endswith((".xlsx", ".xls")):
        outs = []
        app = win32.DispatchEx("Excel.Application")
        app.Visible = False
        app.DisplayAlerts = False
        try:
            wb = app.Workbooks.Open(os.path.abspath(path), ReadOnly=False, UpdateLinks=0)
            try:
                for i in range(1, wb.Worksheets.Count + 1):
                    ws = wb.Worksheets(i)
                    nm = str(ws.Name).strip()
                    if sheets and nm not in sheets:
                        continue
                    if int(ws.Visible) != -1:      # 非表示のシートは出せない
                        continue
                    p = base + "__" + safe(nm) + ".pdf"
                    try:
                        ws.ExportAsFixedFormat(0, os.path.abspath(p))
                        outs.append(p)
                    except Exception as e:
                        print("   （%s はPDFにできず: %s）" % (nm, str(e)[:60]))
            finally:
                wb.Close(False)
        finally:
            app.Quit()
        return outs
    app = win32.DispatchEx("Word.Application")
    app.Visible = False
    try:
        doc = app.Documents.Open(os.path.abspath(path), ReadOnly=False,
                                 ConfirmConversions=False, AddToRecentFiles=False)
        pdf = base + ".pdf"
        doc.ExportAsFixedFormat(os.path.abspath(pdf), 17)
        doc.Close(False)
    finally:
        app.Quit()
    return [pdf]


def pdf_text_and_png(pdfs, max_png=3):
    import fitz
    txt, pngs = [], []
    for pdf in pdfs:
        d = fitz.open(pdf)
        for i, pg in enumerate(d):
            txt.append(pg.get_text())
            if i < max_png and len(pngs) < 8:
                png = os.path.splitext(pdf)[0] + "_p%d.png" % (i + 1)
                pg.get_pixmap(dpi=130).save(png)
                pngs.append(png)
        d.close()
    return "\n".join(txt), pngs


def norm(s):
    return re.sub(r"[\s　\-−ー–―‐‑－]", "", str(s or ""))


def main():
    fill_flag = "--fill" in sys.argv
    args = [a for a in sys.argv[1:] if os.path.exists(a)]
    if args and fill_flag:
        print("当サイトに記入させています…")
        filled, logs = fill_with_site(args)
    elif args:
        filled, logs = args, {}
    else:
        print("当サイトに記入させています…")
        filled, logs = fill_with_site(DEFAULT_TARGETS)
    ng_total = 0
    for f in filled:
        fn = os.path.basename(f)
        print("\n■", fn)
        # 記入したシートだけを紙にする
        sheets = set()
        for item in (logs.get(fn, {}) or {}).get("fills", []):
            m = re.search(r"シート「(.+?)」", item.get("where", ""))
            if m:
                sheets.add(m.group(1).strip())
        try:
            pdfs = to_pdf(f, sheets or None)
        except Exception as e:
            print("   PDFにできませんでした:", str(e)[:120]); continue
        if not pdfs:
            print("   PDFが1枚もできませんでした"); continue
        text, pngs = pdf_text_and_png(pdfs)
        flat = norm(text)
        # 1) 入れた値が、紙に出てきているか
        miss = []
        for item in (logs.get(fn, {}) or {}).get("fills", []):
            where, raw = item.get("where", ""), str(item.get("value", ""))
            # 複数の欄に分けて入れたものは、間に様式の「－」が挟まって紙に出る。
            # つなげたまま探すと見つからないので、部品ごとに見る
            # 1マスに1桁ずつ入れたものは、紙では1文字ずつ離れて並ぶ。
            # 文字列としての照合は意味をなさないので、目視（画像）にまわす
            if "1マスに1桁" in where:
                continue
            parts = ([p for p in re.split(r"[-−ー–―‐‑－\s　]+", raw) if p]
                     if re.search(r"分割|分けて", where) else [raw])
            gone = [p for p in parts if len(norm(p)) >= 2 and norm(p) not in flat]
            if gone:
                miss.append((where[:46], "／".join(gone)[:30]))
        # 2) 桁あふれの「###」が出ていないか
        sharp = len(re.findall(r"#{3,}", text))
        print("   紙 %d 枚（%s）／ 画像 %d 枚"
              % (len(pdfs), "、".join(sorted(sheets))[:60] or "本文", len(pngs)))
        if miss:
            ng_total += len(miss)
            print("   ⚠ 紙に出てこなかった値 %d件（潰れている・切れている疑い）" % len(miss))
            for w, v in miss[:8]:
                print("      %-46s = %s" % (w, v))
        else:
            print("   入れた値はすべて紙に出ています")
        if sharp:
            ng_total += sharp
            print("   ⚠ 桁あふれの「###」が %d か所" % sharp)
    print("\n%s（要確認 %d 件）" % ("見た目の点検 OK" if ng_total == 0 else "見た目に問題あり", ng_total))
    print("画像:", OUT)
    sys.exit(1 if ng_total else 0)


main()

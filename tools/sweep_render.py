# -*- coding: utf-8 -*-
r"""全様式を「実際に開いた姿」にして、目で見られる形に並べる。

なぜ要るのか：
  render_check.py は数枚を確かめる道具で、全様式を一度に見るには足りない。
  ここでは記入が入る様式ぜんぶを紙にし、空の様式と並べて置く。
  記入後だけを見ても「元からそうなのか、こちらが崩したのか」は判断できない。

出るもの：
  tools\sweep_out\<番号>_<ファイル名>\  記入_*.png と 空_*.png
  tools\sweep_out\index.json            どのフォルダに何が入っているかの一覧

使い方（Excel／Wordの入っている端末で）：
    python tools\sweep_render.py            … 会社情報が入る様式ぜんぶ
    python tools\sweep_render.py 5          … 先頭5件だけ（試すとき）
    python tools\sweep_render.py 270ee ed32 … ファイル名にその字が入るものだけ
                                              （直した1〜2件をすぐ見たいとき。
                                               このときは既存の出力を消さない）
"""
import glob, json, os, re, shutil, sys, time, warnings
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
warnings.filterwarnings("ignore")

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(HERE, "sweep_out")
PAGE = "http://127.0.0.1:8935/documents.html"
COMPANY = {
    "entity": "法人", "name": "株式会社サンプル美容", "kana": "カブシキガイシャサンプルビヨウ",
    "houjin": "1234567890123", "zip": "150-0001", "addr": "東京都渋谷区神宮前1-2-3",
    "title": "代表取締役", "rep": "山田 太郎", "repKana": "ヤマダ タロウ",
    "tel": "03-1234-5678", "mail": "info@example.jp", "employees": "8",
    "capital": "3000000", "industry": "美容業", "industryCode": "78",
    "business": "美容室の経営", "staff": "山田 太郎", "staffTel": "03-1234-5678",
    "hokenNo": "1301-123456-7",
}
MAX_PNG_PER_SHEET = 2      # 1シートにつき先頭2ページまで
DPI = 120


def safe(s):
    return re.sub(r'[\\/:*?"<>|\s　]+', "_", str(s))[:36]


def targets():
    """会社情報が入る様式を、控えの一覧から拾う。"""
    m = json.load(open(os.path.join(ROOT, "forms", "manifest.json"), encoding="utf-8"))
    out = []
    for url, f in m["files"].items():
        p = os.path.join(ROOT, f["path"].replace("/", os.sep))
        if os.path.exists(p) and p.lower().endswith((".docx", ".xlsx")):
            out.append((p, f.get("name", "")))
    out.sort(key=lambda x: os.path.basename(x[0]))
    return out


def fill_all(paths):
    """当サイトに記入させ、記入済みファイルと記入ログを受け取る（ブラウザは1回だけ起動）。"""
    from playwright.sync_api import sync_playwright
    got, logs = {}, {}
    tmp = os.path.join(OUT, "_filled")
    os.makedirs(tmp, exist_ok=True)
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
        for i, p in enumerate(paths, 1):
            fn = os.path.basename(p)
            page.evaluate("window.KOBAN_FILL_LOG = []")
            try:
                page.set_input_files("#fileInput", p)
                page.wait_for_function("(window.KOBAN_FILL_LOG||[]).length > 0", timeout=30000)
            except Exception:
                print("  [%2d/%d] 記入できず %s" % (i, len(paths), fn))
                continue
            page.wait_for_timeout(150)
            lg = page.evaluate("window.KOBAN_FILL_LOG[0]") or {}
            if not (lg.get("fills") or []):
                continue                    # 入る欄が無い様式は見なくてよい
            logs[fn] = lg
            try:
                with page.expect_download(timeout=20000) as dl:
                    page.eval_on_selector("#frDone .fr-list > li:last-child a.btn-dl", "e=>e.click()")
                d = os.path.join(tmp, fn)
                dl.value.save_as(d)
                got[fn] = d
            except Exception:
                print("  [%2d/%d] 保存できず %s" % (i, len(paths), fn))
        b.close()
    return got, logs


class Office(object):
    """ExcelとWordは起動が重いので、1回だけ立ち上げて使い回す。"""

    def __init__(self):
        import win32com.client as win32
        self.win32 = win32
        self.xl = None
        self.wd = None

    def excel(self):
        if self.xl is None:
            self.xl = self.win32.DispatchEx("Excel.Application")
            self.xl.Visible = False
            self.xl.DisplayAlerts = False
        return self.xl

    def word(self):
        if self.wd is None:
            self.wd = self.win32.DispatchEx("Word.Application")
            self.wd.Visible = False
        return self.wd

    def close(self):
        for a in (self.xl, self.wd):
            try:
                if a:
                    a.Quit()
            except Exception:
                pass

    def to_pdf(self, path, sheets, prefix, dest):
        """PDFに書き出す。Excelは記入したシートだけ。印刷範囲は配布元のまま触らない。"""
        outs = []
        if path.lower().endswith((".xlsx", ".xls")):
            wb = self.excel().Workbooks.Open(os.path.abspath(path), ReadOnly=False, UpdateLinks=0)
            try:
                for i in range(1, wb.Worksheets.Count + 1):
                    ws = wb.Worksheets(i)
                    nm = str(ws.Name).strip()
                    if sheets and nm not in sheets:
                        continue
                    if int(ws.Visible) != -1:
                        continue
                    pdf = os.path.join(dest, "%s_%s.pdf" % (prefix, safe(nm)))
                    try:
                        ws.ExportAsFixedFormat(0, os.path.abspath(pdf))
                        outs.append(pdf)
                    except Exception:
                        pass
            finally:
                wb.Close(False)
            return outs
        doc = self.word().Documents.Open(os.path.abspath(path), ReadOnly=False,
                                         ConfirmConversions=False, AddToRecentFiles=False)
        try:
            pdf = os.path.join(dest, "%s_本文.pdf" % prefix)
            doc.ExportAsFixedFormat(os.path.abspath(pdf), 17)
            outs.append(pdf)
        finally:
            doc.Close(False)
        return outs


def to_png(pdfs, keep_pdf=False):
    import fitz
    pngs = []
    for pdf in pdfs:
        try:
            d = fitz.open(pdf)
        except Exception:
            continue
        for i, pg in enumerate(d):
            if i >= MAX_PNG_PER_SHEET:
                break
            png = os.path.splitext(pdf)[0] + "_p%d.png" % (i + 1)
            pg.get_pixmap(dpi=DPI).save(png)
            pngs.append(png)
        d.close()
        if not keep_pdf:
            try:
                os.remove(pdf)
            except Exception:
                pass
    return pngs


def main():
    t0 = time.time()
    limit, only = 0, []
    for a in sys.argv[1:]:
        if a.isdigit():
            limit = int(a)
        else:
            only.append(a)
    # 絞り込んだときに全部消すと、他の様式の前回の姿が見られなくなる
    if os.path.isdir(OUT) and not only:
        shutil.rmtree(OUT, ignore_errors=True)
    os.makedirs(OUT, exist_ok=True)
    tg = targets()
    if only:
        tg = [t for t in tg if any(k in os.path.basename(t[0]) for k in only)]
    if limit:
        tg = tg[:limit]
    if not tg:
        print("あてはまる様式がありません:", only)
        return
    print("様式 %d件 に記入させています…" % len(tg))
    got, logs = fill_all([p for p, _ in tg])
    print("記入できた様式: %d件（%.0f秒）" % (len(got), time.time() - t0))

    name_by_file = {os.path.basename(p): nm for p, nm in tg}
    src_by_file = {os.path.basename(p): p for p, _ in tg}
    off = Office()
    index, n = [], 0
    try:
        for fn in sorted(got):
            n += 1
            sheets = set()
            for it in (logs.get(fn, {}) or {}).get("fills", []):
                m = re.search(r"シート「(.+?)」", str(it.get("where", "")))
                if m:
                    sheets.add(m.group(1).strip())
            dest = os.path.join(OUT, "%02d_%s" % (n, safe(os.path.splitext(fn)[0])))
            os.makedirs(dest, exist_ok=True)
            blank = os.path.join(dest, "_blank" + os.path.splitext(fn)[1])
            shutil.copy2(src_by_file[fn], blank)
            try:
                a = to_png(off.to_pdf(got[fn], sheets or None, "記入", dest))
                b = to_png(off.to_pdf(blank, sheets or None, "空", dest))
            except Exception as e:
                print("  紙にできず %s: %s" % (fn, str(e)[:60]))
                continue
            finally:
                try:
                    os.remove(blank)
                except Exception:
                    pass
            index.append({
                "no": n, "file": fn, "name": name_by_file.get(fn, ""),
                "dir": os.path.relpath(dest, HERE),
                "filled_png": [os.path.relpath(x, HERE) for x in a],
                "blank_png": [os.path.relpath(x, HERE) for x in b],
                "fills": [{"where": it.get("where"), "value": it.get("value")}
                          for it in (logs.get(fn, {}) or {}).get("fills", [])],
            })
            print("  [%2d] %-26s 記入%2d枚 / 空%2d枚  %s"
                  % (n, fn[:26], len(a), len(b), name_by_file.get(fn, "")[:24]))
    finally:
        off.close()
    json.dump(index, open(os.path.join(OUT, "index.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    tot = sum(len(x["filled_png"]) + len(x["blank_png"]) for x in index)
    print("\n様式 %d件 / 画像 %d枚 / %.0f秒" % (len(index), tot, time.time() - t0))
    print("出力:", OUT)


main()

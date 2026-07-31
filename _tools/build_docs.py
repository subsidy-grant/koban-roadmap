#!/usr/bin/env python3
"""制度の公式ページから様式を拾い、PROGRAM_DOCS の中身を組み立てる。

東京都20制度は人が1件ずつ公式ページを開いて掲載した（2026-07-31）。そのとき
自分がやっていた判断を規則にしたのがこのスクリプト。**判断を機械に移しただけで、
基準は緩めていない。**通らなかったものは載せずに目視送りにする。

人がやっていた判断＝ここで実装している規則:
  1. 段（申請の前に読む／交付申請／…）は**ページ自身の見出し**から決める。
     機械のキーワード点数ではなく、その役所が使っている区切りに従う
  2. **別制度のファイルを載せない**。杉並区のページには、デジタル化推進事業助成では
     なく別制度（特例資金融資）と厚労省の熱中症資料のPDFが並んでいた。見出しが
     別の制度名を名乗っていたら、その下のファイルは全部落とす
  3. **事例・過去年度は様式ではない**。「令和3年度」だけの見出しの下や、
     会社名つきの導入事例PDFは落とす
  4. **編集して出す版（Word/Excel）を優先**し、同じ様式のPDF複製は載せない
     （一覧が倍になって読みにくいため）。落としたときは note にその旨を書く
  5. **種別とサイズは書き写さず実測**。拡張子と中身が食い違うものは載せない
  6. 交付申請にあたる様式が1つも見つからない制度は**載せずに目視送り**

使い方:
  python3 _tools/build_docs.py --pref kanagawa          # 下見（何が載るか出すだけ）
  python3 _tools/build_docs.py --pref kanagawa --apply  # index.html に書き込む
  python3 _tools/build_docs.py --all --apply            # 未掲載の全制度

出力:
  _tools/docs_build_report.md  … 採用・除外の理由つき一覧（必ず目を通すこと）
  _tools/docs_generated.js     … 生成した PROGRAM_DOCS の断片
"""

import argparse
import io
import os
import re
import sys
import time
from collections import defaultdict, Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone, timedelta
from urllib.parse import urljoin, urlparse

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from check_links import HEADERS, TIMEOUT, ROOT, TOOLS, _block  # noqa: E402

JST = timezone(timedelta(hours=9))
REPORT = os.path.join(TOOLS, "docs_build_report.md")
GENERATED = os.path.join(TOOLS, "docs_generated.js")
INDEX = os.path.join(ROOT, "index.html")

DOC_EXT = re.compile(r"\.(pdf|docx?|xlsx?)(\?|$)", re.I)
EXT_TYPE = {".pdf": "PDF", ".doc": "Word", ".docx": "Word", ".xls": "Excel", ".xlsx": "Excel"}
CT_TYPE = [
    ("application/pdf", "PDF"),
    ("application/vnd.openxmlformats-officedocument.wordprocessingml", "Word"),
    ("application/msword", "Word"),
    ("application/vnd.openxmlformats-officedocument.spreadsheetml", "Excel"),
    ("application/vnd.ms-excel", "Excel"),
]

# 段の判定。上から順に見て、最初に当たったものを採る（並び順が優先順位）。
# 「読むもの」を先に見るのが要点。「申請の手引き」「交付申請マニュアル」は名前に
# 申請が入るが提出物ではないので、申請の段に入れると窓口に持っていく一覧が濁る。
PHASES = [
    # 「説明」「概要」は入れない。「事業実施内容説明」「事業所概要」という提出様式が
    # あり、読みものの段に落ちてしまう（中野区・江戸川区で実測）
    ("申請の前に読む",               r"要領|要綱|要項|手引|しおり|案内|チラシ|ちらし|パンフ|"
                                     r"Q&A|QA|よくある|FAQ|質問|マニュアル|募集|"
                                     r"チェックシート|チェックリスト|確認シート|提出書類"),
    # 「交付申請書兼請求書」は請求の語を含むが提出は申請時。先に拾う
    ("交付申請",                     r"交付申請書|申請書兼|申込書"),
    # 変更を実績より先に見る。「変更報告書」は報告の語を含むが提出は途中なので
    ("計画を変えるとき",             r"変更|中止|廃止|取下|辞退"),
    ("実績報告（事業が終わったあと）", r"実績|報告|完了|精算|請求|支払|口座振替|受領"),
    ("交付申請",                     r"申請|申込|交付|様式|計画書|誓約|同意書|委任|見積|内訳|明細"),
]
PHASE_ORDER = ["申請の前に読む", "交付申請", "計画を変えるとき", "実績報告（事業が終わったあと）"]

# 見出しが名乗っている「制度の固有名」。これが対象制度と重ならなければ別制度
SUBSIDY_NAME = re.compile(r"[一-龥ぁ-んァ-ヶー・A-Za-z0-9（）()]{3,40}?"
                          r"(補助金|助成金|支援事業|支援金|給付金|奨励金|融資|資金|貸付)")
# 様式ではないもの
NOT_FORM_TEXT = re.compile(r"活用事例|導入事例|事例集|採択|交付決定一覧|広報|議会|入札|統計|"
                           r"例規|条例|会議録|個人情報の保護|"
                           # 相談窓口の案内。提出する書類ではない（神奈川県で実測）。
                           # 「役員等氏名一覧表」を巻き込まないよう語を限定する
                           r"相談機関|支援機関一覧|窓口一覧|各機関の一覧")
COMPANY = re.compile(r"(株式会社|有限会社|合同会社|\(株\)|（株）)")
YEAR_ONLY_HEAD = re.compile(r"^(令和|平成)\s*[0-9０-９元]+\s*年度?\s*$")
# 交付申請の段にこれがあれば「申請の様式がそろっている」とみなす
CORE_FORM = re.compile(r"申請書|申込書|様式|計画書|申請書類")


def human(n):
    n = int(n)
    return "%.1fMB" % (n / 1048576) if n >= 1048576 else "%dKB" % max(1, round(n / 1024))


def lcs_len(a, b):
    """最長共通部分文字列の長さ。制度名どうしが同じ一族かを見るのに使う。"""
    if not a or not b:
        return 0
    prev = [0] * (len(b) + 1)
    best = 0
    for i in range(1, len(a) + 1):
        cur = [0] * (len(b) + 1)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1] + 1
                best = max(best, cur[j])
        prev = cur
    return best


def norm_name(name):
    """制度名から「（◯◯区）」等を落とす。"""
    return re.sub(r"[（(][^（()）]*[)）]", "", name).strip()


def load_index():
    idx = io.open(INDEX, encoding="utf-8").read()
    progs = {}
    for marker in ("var PROGRAMS =", "var ADDED ="):
        for m in re.finditer(r'\n    ([A-Za-z0-9_]+): \{(.*?)\n    \}',
                             _block(idx, marker), re.S):
            k, body = m.group(1), m.group(2)
            nm = re.search(r'\n      name: "(.*?)"', body)
            lk = re.search(r'link: "(.*?)"', body)
            ll = re.search(r'linkLabel: "(.*?)"', body)
            if lk:
                progs[k] = {"name": nm.group(1) if nm else k, "link": lk.group(1),
                            "linkLabel": ll.group(1) if ll else "公式サイト"}
    have = set(re.findall(r'\n    ([A-Za-z0-9_]+): \{\n      checked:',
                          _block(idx, "var PROGRAM_DOCS =")))
    return idx, progs, have


# ---------------------------------------------------------------- 収集
def scrape(key, prog):
    """公式ページから (見出し, リンク文字, URL) を順番どおりに拾う。"""
    try:
        r = requests.get(prog["link"], headers=HEADERS, timeout=TIMEOUT)
        r.encoding = r.apparent_encoding or r.encoding
    except Exception as e:
        return None, "取得できず（%s）" % type(e).__name__
    if r.status_code >= 400:
        return None, "HTTP %d" % r.status_code
    m = re.search(r"<(main|article)\b.*?</\1>", r.text, re.S | re.I)
    body = m.group(0) if m else r.text

    rows, head, seen = [], "", set()
    token = re.compile(r"<h([1-6])[^>]*>(.*?)</h\1>|<a[^>]+href=\"([^\"]+)\"[^>]*>(.*?)</a>",
                       re.S | re.I)
    for t in token.finditer(body):
        if t.group(1):
            head = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", t.group(2))).strip()
        else:
            href = t.group(3)
            if not DOC_EXT.search(href):
                continue
            u = urljoin(r.url, href)
            if u in seen:
                continue
            seen.add(u)
            txt = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", t.group(4))).strip()
            rows.append({"head": head, "text": txt, "url": u,
                         "before": preceding_text(body, t.start())})
    return rows, None


def preceding_text(body, pos):
    """リンクの直前にある文字。リンク文字が「Word:24KB」しかないページがあり
    （神奈川県内の複数の市で実測）、書類名はリンクの手前に置かれている。
    同じ行（li/td/p）の中だけを見る。前の行の名前を持ってこないため。"""
    win = body[max(0, pos - 600):pos]
    cut = max(win.rfind(t) for t in
              ("<li", "</li>", "<td", "</td>", "<tr", "<p", "</p>", "<br",
               "</h2>", "</h3>", "</h4>", "<dt", "<dd", "</a>"))
    near = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", win[cut:] if cut >= 0 else win)).strip()
    if re.search(r"[一-龥ぁ-んァ-ヶ]", near):
        return near[-70:]
    # 同じ行に何も無いときは、表の1つ前のセルを見る。鎌倉市は
    # 「<td>交付申請書</td><td><a>ワード版：63KB</a></td>」の形で、
    # 書類名が別のセルに置かれている（2026-07-31 実測）
    wide = re.sub(r"&nbsp;|\u00a0", " ", re.sub(r"<[^>]+>", " ", win))
    return re.sub(r"\s+", " ", wide).strip()[-90:]


def foreign_heading(head, prog_name):
    """見出しが対象制度とは別の制度を名乗っていないか。"""
    for m in SUBSIDY_NAME.finditer(head):
        cand = m.group(0)
        if lcs_len(cand, prog_name) < 3:
            return cand
    return None


def clean_text(txt, url, before=""):
    """リンク文字が「Word」等で中身が分からない場合、ファイル名→直前の文字 で補う。"""
    # 「(DOCX, 51.38KB)」「（PDF：936KB）」のような形式・サイズの注記を落とす。
    # 残すと同じ様式のWord版とPDF版が別物に見えて、複製を落とせない（川崎市で実測）
    txt = re.sub(r"[（(]\s*(PDF|DOCX?|XLSX?|PPTX?|ワード|エクセル|Word|Excel)"
                 r"\s*[形式版]*\s*[：:,、・]?[^）)]*[)）]", "", txt, flags=re.I).strip()
    txt = re.sub(r"【\s*(PDF|DOCX?|XLSX?|ワード|エクセル|Word|Excel)\s*[形式版様]*\s*】", "",
                 txt, flags=re.I).strip()
    # 「別ウィンドウで開く」等はリンクの挙動の説明であって書類名ではない
    txt = re.sub(r"[（(]?別ウィンドウで開き?ま?す?く?[)）]?|[（(]?新しいウィンドウで開き?ま?す?く?[)）]?",
                 "", txt).strip()
    txt = re.sub(r"^[・･\-—\s]+|[・･\-—\s]+$", "", txt)
    # 日本語が残っていれば、短くても本物の書類名（「記載例」「委任状」「チラシ」）。
    # 文字数で切ると、これらを潰してローマ字のファイル名に置き換えてしまう。
    meaningless = re.fullmatch(r"(Word|Excel|PDF|DOCX?|XLSX?|ワード|エクセル|こちら|"
                               r"ダウンロード|申請書類|こちらから)[版]?[：:]?[0-9\.]*[KMkm]?[Bb]?",
                               txt, re.I)
    # 「【法人用】」のように但し書きだけのリンク文字がある（港区で実測）。
    # かっこ類を外して中身が残らないなら、書類名として使えないのでファイル名に頼る
    core = re.sub(r"【[^】]*】|［[^］]*］|[（(][^）)]*[)）]", "", txt)
    if meaningless or not re.search(r"[一-龥ぁ-んァ-ヶ]", core):
        from urllib.parse import unquote
        fn = unquote(os.path.basename(urlparse(url).path))
        fn = os.path.splitext(fn)[0]
        fn = re.sub(r"[_\-]+", " ", fn).strip()
        if fn and re.search(r"[一-龥ぁ-んァ-ヶ]", fn):
            txt = fn
        elif before and re.search(r"[一-龥ぁ-んァ-ヶ]", before):
            b = pick_doc_name(before)
            if b:
                txt = b
    return tidy(txt)[:70]


DOC_WORD = re.compile(r"書$|書[（(]|表$|表[（(]|届|例$|要領|要綱|要項|シート|証明|誓約|"
                      r"計画|報告|申請|申込|内訳|明細|一覧|調書|決算|予算")


def pick_doc_name(before):
    """リンクの手前の文字から、書類名らしい塊を1つ選ぶ。

    表組みのページでは手前に「ワード版：63KB PDF版：182KB 収支予算書」のように
    別のリンクの文字まで入ってくる（鎌倉市で実測）。塊に割って、書類名らしい語を
    含む最後の塊を採る。見つからなければ何も返さない（推測で名前を付けない）。"""
    parts = [x.strip(" 　:：・.,、") for x in
             re.split(r"[\s　]{1,}|&nbsp;|[。｜|]", before) if x.strip()]
    for chunk in reversed(parts):
        if len(chunk) > 40 or not re.search(r"[一-龥ぁ-んァ-ヶ]", chunk):
            continue
        if re.search(r"です|ます|ください|注釈", chunk):
            continue
        if re.fullmatch(r"(PDF|DOCX?|XLSX?|ワード|エクセル|Word|Excel)[版形式]*[：:]?"
                        r"\s*[0-9\.]*\s*[KMkm]?[Bb]?", chunk, re.I):
            continue
        if DOC_WORD.search(chunk):
            return chunk
    return ""


def tidy(t):
    """仕上げ。角かっこのサイズ表記を落とし、閉じていないかっこの手前で切る。
    切らないと「事業者情報調書（第2号様式：」のような尻切れが画面に出る。"""
    t = re.sub(r"[\[［]\s*(PDF|DOCX?|XLSX?|ワード|エクセル|Word|Excel)[^\]］]*[\]］]", "",
               t, flags=re.I)
    for op, cl in (("（", "）"), ("(", ")"), ("【", "】")):
        while t.count(op) > t.count(cl):     # 閉じていない → 開きかっこ以降を捨てる
            t = t[:t.rfind(op)]
        while t.count(cl) > t.count(op):     # 開いていない → 閉じかっこまでを捨てる
            t = t[t.find(cl) + 1:]
    return t.strip(" 　:：・.,、-—")


def disambiguate(items):
    """同じ名前が並ぶ／名前が短すぎるときは、ページの見出しを頭に付ける。
    平塚市は「事業計画書」という同名の様式を事前確認用・交付申請用・実績報告用の
    3つ載せており、名前だけ出すと利用者が選べない（2026-07-31 実測）。"""
    dup = Counter(it["text"] for it in items)
    for it in items:
        short = len(re.sub(r"[^一-龥ぁ-んァ-ヶA-Za-z0-9]", "", it["text"])) < 4
        head = re.sub(r"^[【\[（(]|[】\]）)]$", "", (it["head"] or "").strip())
        if (dup[it["text"]] > 1 or short) and head and \
                re.search(r"[一-龥ぁ-んァ-ヶ]", head) and it["text"] not in head:
            it["text"] = tidy("%s %s" % (head, it["text"]))[:70]
    return items


def with_context(txt, head):
    """「個人用」「法人用」だけでは何の書類か分からない。ページの見出しを頭に付ける
    （世田谷区の申請チェックリストで実測）。見出しが無ければそのまま。"""
    if re.fullmatch(r"[（(]?(個人|法人|共通|オンライン|郵送)[用版]?[)）]?", txt) and \
            head and re.search(r"[一-龥ぁ-んァ-ヶ]", head) and txt not in head:
        return ("%s（%s）" % (head, txt))[:70]
    return txt


def phase_of(item):
    """段は**まず書類名そのもの**で決め、決まらないときだけ見出しに頼る。

    見出しを先に見ると壊れる。「公募要領・交付要綱・申請書類」（川崎市）や
    「提出書類（交付申請用の各種様式）」（神奈川県）のように、1つの見出しに
    読みものと様式が同居しているページがあり、見出し優先だと配下の交付申請書まで
    「申請の前に読む」に落ちる（2026-07-31 実測。この2件は申請様式が1つも
    見つからない判定になっていた）。"""
    # 「事業実績報告書（第11号要領）」のように様式番号に要領・要綱の字が入ることが
    # ある（川崎市で実測）。番号は段の手がかりではないので、判定の前に外す
    strip_no = lambda s: re.sub(r"[（(]?第\s*[0-9０-９\-‐ー]+\s*号[様式要領要綱]*[)）]?", "", s)
    srcs = [item["text"]]
    # 「公募要領・交付要綱・申請書類」（川崎市）のように、読みものと様式を1つの
    # 見出しにまとめているページがある。こういう見出しは段の手がかりにならないので、
    # 書類名で決まらなければ既定（交付申請）に落とす
    head = item["head"]
    compound = head and re.search(r"要領|要綱|要項|手引|提出書類", head) and         re.search(r"申請書|各種様式|様式|書類", head)
    if head and not compound:
        srcs.append(head)
    for src in srcs:
        if not src:
            continue
        src = strip_no(src)
        for name, pat in PHASES:
            if re.search(pat, src):
                return name
    return "交付申請"


def dedupe_mirrors(items):
    """同じ様式の PDF 複製を落とす。Word/Excel を残す。"""
    def base(it):
        t = it["text"]
        # 【Word版】【手書き作成用】(サイズ：12KB) のような注記は、同じ様式かどうかの
        # 判断には関係ないので全部落としてから比べる
        t = re.sub(r"【[^】]*】|［[^］]*］|[（(][^（()）]*[)）]", "", t)
        t = re.sub(r"(PDF|ワード|エクセル|Word|Excel)版?", "", t, flags=re.I)
        t = re.sub(r"R\d+\.?\d*|令和\d+年?度?|[\s・_\-‐―]+", "", t)
        return t
    by = defaultdict(list)
    for i, it in enumerate(items):
        # 記入例は様式そのものとは別の書類。かっこ書きを外すと同名になってしまうので、
        # まとめの対象から外す（「交付申請書」と「交付申請書（記入例）」は両方要る）
        key = "例%d" % i if re.search(r"記入例|記載例|見本|サンプル", it["text"]) else base(it)
        by[key].append(it)
    out, dropped = [], 0
    for _, group in by.items():
        if len(group) > 1 and any(g["type"] != "PDF" for g in group):
            keep = [g for g in group if g["type"] != "PDF"]
            dropped += len(group) - len(keep)
            out.extend(keep)
        else:
            out.extend(group)
    return out, dropped


# ---------------------------------------------------------------- 実測
def measure(urls):
    meta, by_host = {}, defaultdict(list)
    for u in urls:
        by_host[urlparse(u).netloc].append(u)

    def work(host):
        for u in by_host[host]:
            info = {"status": None}
            for meth in ("HEAD", "GET"):
                try:
                    r = requests.request(meth, u, headers=HEADERS, timeout=TIMEOUT,
                                         allow_redirects=True, stream=(meth == "GET"))
                    info = {"status": r.status_code,
                            "ct": (r.headers.get("Content-Type") or "").split(";")[0].strip().lower(),
                            "len": r.headers.get("Content-Length")}
                    r.close()
                except Exception as e:
                    info = {"status": None, "err": type(e).__name__}
                if info.get("status") == 200 and info.get("len"):
                    break
                time.sleep(0.6)
            meta[u] = info
            time.sleep(1.0)

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(work, by_host.keys()))
    return meta


def typed(url, m):
    """実測から種別を決める。拡張子と食い違ったら None（載せない）。"""
    if m.get("status") != 200:
        return None, "HTTP %s" % m.get("status")
    ext = os.path.splitext(urlparse(url).path)[1].lower()
    t = next((v for p, v in CT_TYPE if m.get("ct", "").startswith(p)), None) or EXT_TYPE.get(ext)
    if t is None:
        return None, "種別不明（%s）" % m.get("ct")
    if EXT_TYPE.get(ext) and t != EXT_TYPE[ext]:
        return None, "拡張子(%s)と中身(%s)が不一致" % (EXT_TYPE[ext], t)
    return t, None


# ---------------------------------------------------------------- 組み立て
def esc(s):
    return s.replace("\\", "\\\\").replace("'", "\\'")


def emit(key, prog, groups, note, checked):
    label = re.sub(r"を見る$|はこちら$", "", prog["linkLabel"]).strip() or "公式サイト"
    lines = ["    %s: {" % key,
             "      checked: '%s'," % checked,
             "      portal: { label: '%s', url: '%s' }," % (esc(label), esc(prog["link"])),
             "      note: '%s'," % esc(note),
             "      groups: ["]
    gl = []
    for phase in PHASE_ORDER:
        items = groups.get(phase)
        if not items:
            continue
        il = ["          { name: '%s', url: '%s', type: '%s'%s }"
              % (esc(it["text"]), esc(it["url"]), it["type"],
                 ", size: '%s'" % it["size"] if it.get("size") else "")
              for it in items]
        gl.append("        { phase: '%s', items: [\n%s\n        ] }" % (esc(phase), ",\n".join(il)))
    lines.append(",\n".join(gl))
    lines += ["      ]", "    }"]
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--pref", help="制度キーの接頭辞で絞る（kanagawa / saitama …）")
    ap.add_argument("--all", action="store_true", help="未掲載の全制度")
    ap.add_argument("--apply", action="store_true", help="index.html に書き込む")
    ap.add_argument("--recheck", action="store_true",
                    help="掲載済みの制度も対象にする（自動の結果を人の掲載と見比べる用）")
    args = ap.parse_args()

    idx, progs, have = load_index()
    todo = {k: v for k, v in progs.items() if args.recheck or k not in have}
    if args.pref:
        todo = {k: v for k, v in todo.items() if k.startswith(args.pref + "_")}
    elif not args.all:
        ap.error("--pref か --all を指定してください")
    print("対象 %d制度" % len(todo), flush=True)

    # 1) ページを読む
    scraped, errors = {}, {}
    by_host = defaultdict(list)
    for k in todo:
        by_host[urlparse(todo[k]["link"]).netloc].append(k)

    def work(host):
        for k in by_host[host]:
            rows, err = scrape(k, todo[k])
            if err:
                errors[k] = err
            else:
                scraped[k] = rows
            print("  読了 %-30s %s" % (k, err or "%d件" % len(rows)), flush=True)
            time.sleep(1.2)

    with ThreadPoolExecutor(max_workers=6) as ex:
        list(ex.map(work, by_host.keys()))

    # 2) 規則でふるいにかける
    kept, excluded = {}, defaultdict(list)
    for k, rows in scraped.items():
        pname = norm_name(todo[k]["name"])
        keep = []
        for row in rows:
            if YEAR_ONLY_HEAD.match(row["head"]):
                excluded[k].append((row, "過去年度の見出しの下（事例等）"))
                continue
            fh = foreign_heading(row["head"], pname)
            if fh:
                excluded[k].append((row, "別制度の見出し「%s」の下" % fh))
                continue
            if NOT_FORM_TEXT.search(row["text"]) or NOT_FORM_TEXT.search(row["head"]):
                excluded[k].append((row, "様式ではない（事例・広報等）"))
                continue
            if COMPANY.search(row["text"]):
                excluded[k].append((row, "会社名つき＝導入事例"))
                continue
            keep.append(row)
        kept[k] = keep

    # 3) 実測
    all_urls = [r["url"] for rows in kept.values() for r in rows]
    print("\n実測する %d件" % len(all_urls), flush=True)
    meta = measure(all_urls) if all_urls else {}

    checked = datetime.now(JST).strftime("%Y-%m-%d")
    publish, review, notes = {}, {}, {}
    for k, rows in kept.items():
        items, bad = [], []
        for row in rows:
            t, why = typed(row["url"], meta.get(row["url"], {}))
            if t is None:
                bad.append((row, why))
                continue
            m = meta[row["url"]]
            nm = with_context(clean_text(row["text"], row["url"], row.get("before", "")),
                              row["head"])
            items.append({"text": nm, "url": row["url"],
                          "type": t, "size": human(m["len"]) if m.get("len") else None,
                          "head": row["head"]})
        excluded[k].extend(bad)
        items, dropped = dedupe_mirrors(items)

        # 名前が読めないものは載せない（押すまで中身が分からない一覧になるため）。
        # 制度ごと止めるのではなく、その1件だけ落として理由を残す
        readable = []
        for it in items:
            if re.search(r"[一-龥ぁ-んァ-ヶ]", it["text"]):
                readable.append(it)
            else:
                excluded[k].append(({"text": it["text"], "head": it["head"]},
                                    "書類名を読み取れない（リンク文字もファイル名もローマ字）"))
        items = disambiguate(readable)

        groups = defaultdict(list)
        for it in items:
            groups[phase_of(it)].append(it)

        core = [it for it in groups.get("交付申請", []) if CORE_FORM.search(it["text"])]
        if not items:
            review[k] = "掲載できるファイルが無い"
            continue
        if not core:
            review[k] = "交付申請にあたる様式が見つからない（%d件は拾えている）" % len(items)
            continue

        note = "公式ページの区分に沿って並べています。"
        if dropped:
            note += "同じ様式のPDF版も公式ページにあります。"
        notes[k] = note
        publish[k] = groups

    # 4) 出力
    js = ",\n".join(emit(k, todo[k], publish[k], notes[k], checked) for k in sorted(publish))
    io.open(GENERATED, "w", encoding="utf-8", newline="\n").write(js + "\n")

    nfile = sum(len(v) for g in publish.values() for v in g.values())
    rep = ["# 様式の自動掲載レポート", "",
           "- 実行時刻：**%s**（JST）" % datetime.now(JST).strftime("%Y-%m-%d %H:%M"),
           "- 対象：**%d制度**（PROGRAM_DOCS 未掲載）" % len(todo),
           "- 掲載する：**%d制度・%dファイル**" % (len(publish), nfile),
           "- 目視送り：**%d制度**／ページを読めず：**%d制度**" % (len(review), len(errors)), ""]
    if review:
        rep += ["## 目視送り（自動では載せない）", ""]
        for k in sorted(review):
            rep.append("- **%s**（`%s`）— %s" % (todo[k]["name"], k, review[k]))
            rep.append("  - %s" % todo[k]["link"])
        rep.append("")
    if errors:
        rep += ["## ページを読めなかった", ""]
        for k in sorted(errors):
            rep.append("- **%s** — %s ／ %s" % (todo[k]["name"], errors[k], todo[k]["link"]))
        rep.append("")
    rep += ["## 掲載する制度", ""]
    for k in sorted(publish):
        rep.append("### %s（`%s`）" % (todo[k]["name"], k))
        for phase in PHASE_ORDER:
            for it in publish[k].get(phase, []):
                rep.append("- [%s] %s（%s%s）" % (phase, it["text"], it["type"],
                                                 "・" + it["size"] if it["size"] else ""))
                rep.append("  - 元の見出し：%s ／ %s" % (it["head"] or "（なし）", it["url"]))
        rep.append("")
    if any(excluded.values()):
        rep += ["## 除外したファイルと理由", ""]
        for k in sorted(excluded):
            if not excluded[k]:
                continue
            rep.append("### %s（`%s`）" % (todo[k]["name"], k))
            for row, why in excluded[k]:
                rep.append("- %s — **%s**" % (row["text"][:60] or "（リンク文字なし）", why))
            rep.append("")
    io.open(REPORT, "w", encoding="utf-8", newline="\n").write("\n".join(rep) + "\n")

    print("\n掲載 %d制度・%dファイル／目視送り %d／読めず %d"
          % (len(publish), nfile, len(review), len(errors)))
    print("除外ファイル:", Counter(w for v in excluded.values() for _, w in v).most_common(6))
    print("レポート:", REPORT)

    if args.apply and publish:
        s = io.open(INDEX, encoding="utf-8").read()
        end = s.index("\n  };", s.index("  var PROGRAM_DOCS = {"))
        marker = "\n    // ---- ここから自動生成（build_docs.py）。基準は _tools/README.md ----\n"
        if marker not in s:
            s = s[:end] + ",\n" + marker + js + s[end:]
        else:
            s = s[:end] + ",\n" + js + s[end:]
        io.open(INDEX, "w", encoding="utf-8", newline="").write(s)
        print("index.html に書き込みました")


if __name__ == "__main__":
    main()

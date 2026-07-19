# -*- coding: utf-8 -*-
"""生成物の検証。業種を引数に取り、次を確認する:
1. 各 plan-NN.html を print-to-pdf してページ数が正確に10であること
2. 各ページ(.page)の高さ・子要素のはみ出しがないこと（харness注入+dump-dom）
3. 各 proto のJSエラー・テンプレート残骸がないこと
4. ハブ→全ファイルのリンク整合

実行: python3 verify.py beauty [food ...]
"""
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

CHROME = None
for c in [r"C:\Program Files\Google\Chrome\Application\chrome.exe",
          r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"]:
    if os.path.exists(c):
        CHROME = c
        break

PAGE_H_PX = 1122.5  # 297mm @96dpi
TOL = 1.02

OVERFLOW_HARNESS = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var report = [];
    document.querySelectorAll('.page').forEach(function (pg, i) {
      var pr = pg.getBoundingClientRect();
      var overH = pr.height > %(maxh)f;
      var spill = [];
      pg.querySelectorAll('*').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.right > pr.right + 2 || r.bottom > pr.bottom + 2) {
          spill.push(el.tagName + '.' + (el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className));
        }
      });
      report.push({ page: i + 1, height: Math.round(pr.height), overHeight: overH, spill: spill.slice(0, 5) });
    });
    document.title = 'VERIFY:' + JSON.stringify(report);
  }, 400);
});
</script>
</body>
"""

PROTO_HARNESS = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var errors = window.__protoErrors || [];
    try { runDemo(); } catch (e) { errors.push('demo: ' + e.message); }
    var text = document.body.innerText;
    var bad = [];
    ['undefined', 'NaN', '__SCHEME__', '{{'].forEach(function (t) {
      if (text.indexOf(t) !== -1) bad.push(t);
    });
    document.title = 'VERIFY:' + JSON.stringify({ errors: errors, badTokens: bad });
  }, 300);
});
</script>
</body>
"""


def run_chrome(args, timeout=90):
    return subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox"] + args,
                          capture_output=True, timeout=timeout)


def dump_title(html_path, harness, tmpdir, tag):
    with open(html_path, encoding="utf-8") as f:
        content = f.read()
    injected = content.replace("</body>", harness, 1)
    if tag == "proto":
        injected = injected.replace("<script>", "<script>window.__protoErrors=[];window.onerror=function(m){__protoErrors.push(m)};</script><script>", 1)
    tmp = os.path.join(tmpdir, tag + "_" + os.path.basename(html_path))
    with open(tmp, "w", encoding="utf-8") as f:
        f.write(injected)
    dump = tmp + ".dump"
    with open(dump, "w", encoding="utf-8") as out:
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--no-sandbox",
                        "--user-data-dir=" + os.path.join(tmpdir, "profile"),
                        "--virtual-time-budget=5000", "--dump-dom",
                        "file:///" + tmp.replace("\\", "/")],
                       stdout=out, stderr=subprocess.DEVNULL, timeout=90)
    with open(dump, encoding="utf-8") as f:
        dom = f.read()
    m = re.search(r"<title>VERIFY:(.*?)</title>", dom, re.S)
    if not m:
        return None
    txt = m.group(1).replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">").replace("&quot;", '"')
    return json.loads(txt)


def main():
    if not CHROME:
        sys.exit("Chrome not found")
    industries = sys.argv[1:] or ["beauty"]
    tmpdir = tempfile.mkdtemp(prefix="verify_")
    failures = []

    try:
        import pypdf
        has_pypdf = True
    except ImportError:
        has_pypdf = False
        print("WARN: pypdf not available; skipping page-count check")

    for ik in industries:
        d = os.path.join(IMPROVEMENT, ik)
        plans = sorted(f for f in os.listdir(d) if f.startswith("plan-"))
        protos = sorted(f for f in os.listdir(d) if f.startswith("proto-"))

        for f in plans:
            path = os.path.join(d, f)
            # 1. pdf page count
            if has_pypdf:
                pdf = os.path.join(tmpdir, f + ".pdf")
                run_chrome(["--user-data-dir=" + os.path.join(tmpdir, "profile"),
                            "--virtual-time-budget=5000", "--no-pdf-header-footer",
                            "--print-to-pdf=" + pdf, "file:///" + path.replace("\\", "/")])
                n = len(pypdf.PdfReader(pdf).pages)
                status = "OK" if n == 10 else "FAIL"
                if n != 10:
                    failures.append(f"{ik}/{f}: pdf pages={n} (expected 10)")
                print(f"[pdf] {ik}/{f}: {n} pages {status}")
            # 2. overflow
            rep = dump_title(path, OVERFLOW_HARNESS % {"maxh": PAGE_H_PX * TOL}, tmpdir, "plan")
            if rep is None:
                failures.append(f"{ik}/{f}: overflow harness produced no output")
                continue
            bad = [r for r in rep if r["overHeight"] or r["spill"]]
            if bad:
                for b in bad:
                    failures.append(f"{ik}/{f} p{b['page']}: height={b['height']} spill={b['spill']}")
                print(f"[layout] {ik}/{f}: {len(bad)} page(s) FAIL")
            else:
                print(f"[layout] {ik}/{f}: all 10 pages OK")

        for f in protos:
            rep = dump_title(os.path.join(d, f), PROTO_HARNESS, tmpdir, "proto")
            if rep is None:
                failures.append(f"{ik}/{f}: proto harness produced no output")
            elif rep["errors"] or rep["badTokens"]:
                failures.append(f"{ik}/{f}: errors={rep['errors']} badTokens={rep['badTokens']}")
                print(f"[proto] {ik}/{f}: FAIL")
            else:
                print(f"[proto] {ik}/{f}: OK")

    # 4. link check (hub + generated pages)
    hub = os.path.join(IMPROVEMENT, "index.html")
    with open(hub, encoding="utf-8") as f:
        hub_html = f.read()
    for href in re.findall(r'href="([^"#]+)"', hub_html):
        if href.startswith("http"):
            continue
        target = os.path.normpath(os.path.join(IMPROVEMENT, href.split("?")[0]))
        if not os.path.exists(target):
            failures.append(f"hub link broken: {href}")
    print(f"[links] hub checked")

    print()
    if failures:
        print(f"FAILURES ({len(failures)}):")
        for fl in failures:
            print("  -", fl)
        sys.exit(1)
    print("ALL CHECKS PASSED")


if __name__ == "__main__":
    main()

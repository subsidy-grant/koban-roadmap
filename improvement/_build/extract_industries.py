# -*- coding: utf-8 -*-
"""index.html の INDUSTRIES / PROGRAMS / RATE_BASE / CAP / PROGRAM_TRACKS を
実ブラウザ(Chrome headless)でパースさせて data/industries.json に書き出す。

正規表現でJSオブジェクトをJSONに変換するのは PROGRAMS のようなキー無引用・
HTML混じり文字列で壊れやすいため、実際のJSエンジンに評価させる方式を採る。

使い方:  python3 extract_industries.py
前提:    Chrome がインストールされていること（パスは CHROME 定数で調整）
"""
import html
import json
import os
import re
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, "..", ".."))
INDEX = os.path.join(REPO, "index.html")
OUT = os.path.join(HERE, "data", "industries.json")

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
]

HARNESS = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var payload = JSON.stringify({
      INDUSTRIES: INDUSTRIES,
      PROGRAMS: PROGRAMS,
      RATE_BASE: RATE_BASE,
      CAP: CAP,
      CAP_TEXT: CAP_TEXT,
      PROGRAM_TRACKS: typeof PROGRAM_TRACKS !== 'undefined' ? PROGRAM_TRACKS : null
    });
    document.body.innerHTML = '<pre id="extract-out">' + payload.replace(/&/g,'&amp;').replace(/</g,'&lt;') + '</pre>';
  }, 200);
});
</script>
</body>
"""


def find_chrome():
    for c in CHROME_CANDIDATES:
        if os.path.exists(c):
            return c
    sys.exit("Chrome not found")


def main():
    with open(INDEX, encoding="utf-8") as f:
        content = f.read()
    content = content.replace("</body>", HARNESS, 1)

    tmpdir = tempfile.mkdtemp(prefix="extract_")
    tmphtml = os.path.join(tmpdir, "extract.html")
    with open(tmphtml, "w", encoding="utf-8") as f:
        f.write(content)

    dump = os.path.join(tmpdir, "dump.html")
    chrome = find_chrome()
    uri = "file:///" + tmphtml.replace("\\", "/")
    with open(dump, "w", encoding="utf-8") as out:
        subprocess.run(
            [chrome, "--headless=new", "--disable-gpu", "--no-sandbox",
             "--user-data-dir=" + os.path.join(tmpdir, "profile"),
             "--virtual-time-budget=4000", "--dump-dom", uri],
            stdout=out, stderr=subprocess.DEVNULL, check=True, timeout=120)

    with open(dump, encoding="utf-8") as f:
        dom = f.read()
    m = re.search(r'<pre id="extract-out">(.*?)</pre>', dom, re.S)
    if not m:
        sys.exit("extraction output not found in DOM dump")
    payload = html.unescape(m.group(1))
    data = json.loads(payload)

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    n_ind = len(data["INDUSTRIES"])
    n_items = sum(len(c["items"]) for ind in data["INDUSTRIES"].values() for c in ind["categories"])
    print(f"OK: {n_ind} industries, {n_items} items -> {OUT}")


if __name__ == "__main__":
    main()

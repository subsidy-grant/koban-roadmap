# -*- coding: utf-8 -*-
"""本番（GitHub Pages）の実物で配色が反映されているかを確認する。

    python _tools/check_live_palette.py

ローカルで通ったことは本番で通ったことの証明にならないので、
live URL を実ブラウザで開いて --paper 等を直接読む。
結果は verify_live.json に確認時刻つきで残る。

キャッシュ回避は URL の ?cb=<epoch> だけで行う。
**Cache-Control ヘッダーを足してはいけない**：Google Fonts への
プリフライトが `Request header field cache-control is not allowed` で
弾かれ、実利用者には出ないCORSエラーが偽陽性として出る（2026-08-17に踏んだ）。
"""
import io, json, os, time

from playwright.sync_api import sync_playwright

BASE = "https://subsidy-grant.github.io/koban-roadmap/"
PAGES = ["index.html", "program.html", "criteria.html", "consult.html",
         "documents.html", "profile.html", "profile_edit.html",
         "applications.html", "improvement.html"]

NEW_LIGHT_PAPER = "#e8e0d2"
OLD = {"#eaf1fb", "#081422", "#16283d", "#0c2036", "#a9c2e0", "#0057c2"}

JS = r"""
() => {
  const rs = getComputedStyle(document.documentElement);
  const g = (n) => rs.getPropertyValue(n).trim().toLowerCase();
  const hex = (h) => { h=h.replace('#',''); return {r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}; };
  const lin = (c) => { c/=255; return c<=0.04045 ? c/12.92 : Math.pow((c+0.055)/1.055,2.4); };
  const L = (c) => 0.2126*lin(c.r)+0.7152*lin(c.g)+0.0722*lin(c.b);
  const cr = (a,b) => { let x=L(a)+0.05, y=L(b)+0.05; return x>y?x/y:y/x; };
  const t = {};
  for (const n of ['--paper','--paper-raised','--paper-sunken','--line-strong','--shadow-card','--accent'])
    t[n] = g(n);
  const p = t['--paper'], r = t['--paper-raised'];
  return { tokens: t,
           cr: (p.startsWith('#') && r.startsWith('#')) ? Math.round(cr(hex(r),hex(p))*1000)/1000 : null };
}
"""


def main():
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    rows = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(color_scheme="light", viewport={"width": 1280, "height": 900})
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        for f in PAGES:
            errs.clear()
            url = BASE + f + "?cb=" + str(int(time.time()))
            resp = pg.goto(url, wait_until="load")
            pg.wait_for_timeout(900)
            d = pg.evaluate(JS)
            rows.append({
                "page": f, "http": resp.status if resp else None,
                "paper": d["tokens"]["--paper"],
                "sunken": d["tokens"]["--paper-sunken"],
                "lineStrong": d["tokens"]["--line-strong"],
                "shadowCard": bool(d["tokens"]["--shadow-card"]),
                "cr": d["cr"],
                "old": sorted({v for v in d["tokens"].values() if v in OLD}),
                "errs": list(errs),
            })
        ctx.close()
        b.close()

    io.open(os.path.join(os.path.dirname(__file__), "verify_live.json"), "w", encoding="utf-8").write(
        json.dumps({"checkedAt": stamp, "base": BASE, "rows": rows}, ensure_ascii=False, indent=1))

    print("本番確認: %s  (%s)" % (BASE, stamp))
    print("%-22s %-5s %-9s %-9s %-6s %-6s %s" % ("page", "http", "paper", "sunken", "cr", "shadow", "NG"))
    print("-" * 88)
    ng = 0
    for r in rows:
        p = []
        if r["http"] != 200:
            p.append("HTTP %s" % r["http"])
        if r["paper"] != NEW_LIGHT_PAPER:
            p.append("paper=%s（旧配色のまま）" % r["paper"])
        if r["old"]:
            p.append("旧配色残存 %s" % r["old"])
        if not r["sunken"] or not r["lineStrong"] or not r["shadowCard"]:
            p.append("新トークン欠落")
        if r["cr"] is None or r["cr"] < 1.30:
            p.append("カード/地 %s < 1.30" % r["cr"])
        if r["errs"]:
            p.append("JSエラー %s" % r["errs"][:2])
        print("%-22s %-5s %-9s %-9s %-6s %-6s %s" % (
            r["page"], r["http"], r["paper"], r["sunken"], r["cr"],
            "OK" if r["shadowCard"] else "無", " / ".join(p)))
        if p:
            ng += 1
    print("-" * 88)
    print("%d ページ中 NG %d件" % (len(rows), ng))


if __name__ == "__main__":
    main()

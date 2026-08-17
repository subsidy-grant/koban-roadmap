# -*- coding: utf-8 -*-
"""本番の criteria.html で、目次まわりが壊れていないかを実物で確認する。

    python _tools/check_live_toc.py

見るもの（すべて本人指摘に対応する箇所）:
  1. 目次を開いている間、背後の本文がスクロールしないこと
     （止まっていないと目次だけ固定され、後ろが流れて重なって見える）
  2. 開いている間、追従バーが目次に食い込まないこと
     （body を fixed にすると sticky の基準が失われ、バーが取り残される）
  3. 閉じたら元の位置に戻ること
  4. 目次の項目を選んだら、その見出しへ正しく飛ぶこと
"""
import sys, time

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from playwright.sync_api import sync_playwright

URL = "https://subsidy-grant.github.io/koban-roadmap/criteria.html"


def main():
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print("本番の目次チェック: %s  (%s)" % (URL, stamp))
    ng = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        ctx = b.new_context(color_scheme="light", viewport={"width": 390, "height": 780},
                            has_touch=True, is_mobile=True)
        pg = ctx.new_page()
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto(URL + "?cb=" + str(int(time.time())), wait_until="load")
        pg.wait_for_timeout(1200)

        # 実際に見えている位置（body固定中は scrollY が 0 になるので top も見る）
        VIS = "()=>{const t=document.body.style.top; return t? -parseInt(t,10) : Math.round(scrollY);}"

        for label, frac in [("ページ冒頭", 0.0), ("中ほど", 0.45)]:
            pg.evaluate("(f)=>window.scrollTo(0, document.documentElement.scrollHeight*f)", frac)
            pg.wait_for_timeout(500)
            base = pg.evaluate(VIS)

            pg.locator("#tocBarBtn").tap()
            pg.wait_for_timeout(650)
            opened = pg.evaluate(VIS)

            pg.mouse.wheel(0, 800)
            pg.wait_for_timeout(700)
            after = pg.evaluate(VIS)

            d = pg.evaluate("""()=>{
              const bar=document.getElementById('tocBar'), nav=document.getElementById('tocNav');
              const br=bar.getBoundingClientRect(), nr=nav.getBoundingClientRect();
              return {barTop:Math.round(br.top), barBottom:Math.round(br.bottom),
                      navTop:Math.round(nr.top),
                      overlap: br.bottom > nr.top+1 && br.top < nr.bottom,
                      locked: document.body.classList.contains('toc-open')};}""")

            scrolled = abs(after - opened) > 3
            problems = []
            if scrolled:
                problems.append("開いたまま背景が動いた（%d→%d）" % (opened, after))
            if d["overlap"]:
                problems.append("バーが目次に重なっている")
            if d["barTop"] != 0:
                problems.append("バーが画面上部にない（top=%d）" % d["barTop"])
            if not d["locked"]:
                problems.append("背景の固定が効いていない")

            pg.locator("#tocBarBtn").tap()
            pg.wait_for_timeout(600)
            closed = pg.evaluate(VIS)
            if abs(closed - base) > 3:
                problems.append("閉じたら位置がずれた（%d→%d）" % (base, closed))

            print("  %-8s %s" % (label, "OK" if not problems else "★ " + " / ".join(problems)))
            if problems:
                ng += 1

        # 項目を選んだら正しく飛ぶか
        pg.evaluate("window.scrollTo(0, document.documentElement.scrollHeight*0.5)")
        pg.wait_for_timeout(500)
        pg.locator("#tocBarBtn").tap()
        pg.wait_for_timeout(600)
        pg.locator('#tocNav a[href="#refund"]').tap()
        pg.wait_for_timeout(1000)
        j = pg.evaluate("""()=>{const h=document.getElementById('refund').getBoundingClientRect();
          return {top:Math.round(h.top),
                  locked:document.body.classList.contains('toc-open'),
                  scrim:!!document.querySelector('.toc-scrim')};}""")
        ok = (not j["locked"]) and (not j["scrim"]) and 30 <= j["top"] <= 130
        print("  項目を選ぶ  %s（見出しtop=%d 固定=%s 覆い=%s）"
              % ("OK" if ok else "★要確認", j["top"], j["locked"], j["scrim"]))
        if not ok:
            ng += 1

        print("  JSエラー   %s" % (errs[:2] if errs else "なし"))
        if errs:
            ng += 1
        ctx.close()
        b.close()
    print("=" * 60)
    print("指摘 %d件" % ng)


if __name__ == "__main__":
    main()

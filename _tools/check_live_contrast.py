# -*- coding: utf-8 -*-
"""本番の実物で「読めない配色」が出ていないかを確認する。

    python _tools/check_live_contrast.py

check_live_palette.py がトークンの値を見るのに対し、こちらは
実際に描画された要素の色を測る。両テーマ（ライト・ダーク）で回す。

見るもの:
  1. アクセント地のボタン文字（--on-accent の抜けを検出）
     ダーク側の --on-accent が未定義だと、明るいコバルト地に白文字が載って
     コントラスト2.10まで落ちる。2026-08-17に program.html と index.html で
     実際に起きた。トークンの存在チェックでは見つからず、描画を測って初めて出る
  2. 地の上に直接置かれた面の分離（1.30未満）
  3. 本文の文字コントラスト（4.5未満、大きい文字は3.0未満）

注意: Cache-Control ヘッダーは付けないこと。Google Fonts のプリフライトが
弾かれ、実利用者には出ないCORSエラーが偽陽性で出る。
"""
import io, json, os, sys, time

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

from playwright.sync_api import sync_playwright

BASE = "https://subsidy-grant.github.io/koban-roadmap/"
PAGES = ["index.html", "program.html?key=career", "criteria.html", "consult.html",
         "documents.html", "profile.html", "profile_edit.html",
         "applications.html", "improvement.html"]

JS = r"""
() => {
  const P=s=>{const m=/rgba?\(([^)]+)\)/.exec(s||'');if(!m)return null;
    const p=m[1].split(',').map(Number);return{r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1};};
  const lin=c=>{c/=255;return c<=0.04045?c/12.92:Math.pow((c+0.055)/1.055,2.4);};
  const L=c=>0.2126*lin(c.r)+0.7152*lin(c.g)+0.0722*lin(c.b);
  const cr=(a,b)=>{let x=L(a)+0.05,y=L(b)+0.05;return x>y?x/y:y/x;};
  const behind=el=>{let p=el.parentElement;
    while(p){const c=P(getComputedStyle(p).backgroundColor);if(c&&c.a>=0.99)return c;p=p.parentElement;}
    return {r:255,g:255,b:255,a:1};};
  const name=el=>el.tagName.toLowerCase()+(typeof el.className==='string'&&el.className?
    '.'+el.className.trim().split(/\s+/).slice(0,2).join('.'):'');

  const rs=getComputedStyle(document.documentElement);
  const accent=(rs.getPropertyValue('--accent')||'').trim();
  const onAccent=(rs.getPropertyValue('--on-accent')||'').trim();

  const lowText=[], sunk=[];
  for (const el of document.querySelectorAll('body *')) {
    const cs=getComputedStyle(el);
    if (cs.display==='none'||cs.visibility==='hidden') continue;
    const r=el.getBoundingClientRect();
    if (r.width<8||r.height<8) continue;
    const own=P(cs.backgroundColor);
    const bg=(own&&own.a>=0.99)?own:behind(el);

    const hasText=[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1);
    if (hasText) {
      const fg=P(cs.color);
      if (fg) {
        const ratio=cr(fg,bg);
        const size=parseFloat(cs.fontSize), bold=(parseInt(cs.fontWeight)||400)>=700;
        const need=(size>=24||(size>=18.66&&bold))?3.0:4.5;
        if (ratio<need) lowText.push({sel:name(el), cr:+ratio.toFixed(2), need,
                                      t:(el.textContent||'').trim().slice(0,24)});
      }
    }
    /* 面が地から分離して見えるか。
       影があれば浮くので分離できているとみなす（2026-08-17に基準を改めた。
       それ以前は「枠があればOK」としていたが、本人が指摘した .editing-note は
       枠があっても「背景と同系色」に見えていたため、枠は根拠にしない）。 */
    if (own && own.a>=0.99 && r.width*r.height>=20000) {
      const bh=behind(el), ratio=cr(own,bh);
      const diff=Math.abs(own.r-bh.r)+Math.abs(own.g-bh.g)+Math.abs(own.b-bh.b);
      const hasShadow = cs.boxShadow && cs.boxShadow!=='none';
      if (ratio<1.30 && diff>6 && !hasShadow) sunk.push({sel:name(el), cr:+ratio.toFixed(3)});
    }
  }
  const dedup=(a,k)=>{const m={};a.forEach(x=>{if(!m[x[k]])m[x[k]]=x;});return Object.values(m);};
  return {accent, onAccent, lowText:dedup(lowText,'sel').slice(0,10),
          sunk:dedup(sunk,'sel').slice(0,10)};
}
"""


def main():
    stamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print("本番の描画チェック: %s  (%s)" % (BASE, stamp))
    rows = []
    ng = 0
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        for scheme in ["light", "dark"]:
            ctx = b.new_context(color_scheme=scheme, viewport={"width": 1180, "height": 900})
            pg = ctx.new_page()
            for f in PAGES:
                pg.goto(BASE + f + ("&" if "?" in f else "?") + "cb=" + str(int(time.time())),
                        wait_until="load")
                pg.wait_for_timeout(900)
                d = pg.evaluate(JS)
                d.update({"page": f, "scheme": scheme})
                rows.append(d)
                bad = d["lowText"] or d["sunk"]
                if bad:
                    ng += 1
                    print("-" * 76)
                    print("%s [%s]  --accent=%s --on-accent=%s" % (f, scheme, d["accent"], d["onAccent"]))
                    for x in d["lowText"]:
                        print("   読みにくい文字 %-26s cr=%.2f (要%.1f) '%s'"
                              % (x["sel"], x["cr"], x["need"], x["t"]))
                    for x in d["sunk"]:
                        print("   沈んだ面       %-26s cr=%.3f" % (x["sel"], x["cr"]))
            ctx.close()
        b.close()
    io.open(os.path.join(os.path.dirname(__file__), "live_contrast.json"), "w",
            encoding="utf-8").write(json.dumps({"checkedAt": stamp, "rows": rows},
                                               ensure_ascii=False, indent=1))
    print("=" * 76)
    print("%d通り（%dページ×2テーマ）中、指摘 %d件" % (len(rows), len(PAGES), ng))


if __name__ == "__main__":
    main()

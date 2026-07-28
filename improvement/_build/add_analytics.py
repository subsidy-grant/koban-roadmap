# -*- coding: utf-8 -*-
"""公開HTMLにアクセス解析(GoatCounter)のスニペットを冪等に差し込む後処理。

■ なぜ GoatCounter か (2026-07-29 一般公開準備で導入)
  - 無料・オープンソースで、GitHub Pages のような静的サイトにタグ1行で入る
  - Cookie を使わず個人を特定しないため、同意バナーなしで運用できる
    (トップページのフッターにプライバシー注記を掲載済み)
  - ダッシュボード https://koban-roadmap.goatcounter.com が解析画面になる
  ※ 計測を有効にするには goatcounter.com でサイトコード「koban-roadmap」の
    アカウント登録が1回だけ必要。未登録の間はビーコンが失敗するだけで
    ページ表示には一切影響しない(async読み込み)。

■ 冪等性
  <!-- ANALYTICS:START --> 〜 :END の間を毎回まるごと置き換える。
  ジェネレーター(build_hub.py / score.py / build_plans.py / build_protos.py)を
  再実行したら、apply_benchmarks.py と同様に本スクリプトも再実行すること。

■ 対象
  ../../index.html と ../ (improvement) 配下の全HTML。
  配布用サイト_1ファイル版.html はオフライン利用が前提のため除外。
  トップページにだけ、業種・地域の切り替えを仮想ページビューとして
  記録するフックを追加する(どの業種・地域が見られているかが分かるように)。

実行: python3 add_analytics.py
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))
ROOT = os.path.abspath(os.path.join(IMPROVEMENT, ".."))

ENDPOINT = "https://koban-roadmap.goatcounter.com/count"
EXCLUDE = {"配布用サイト_1ファイル版.html"}

SNIPPET = (f'<script data-goatcounter="{ENDPOINT}" '
           'async src="//gc.zgo.at/count.js"></script>')

# トップページ専用: 業種・都道府県・市区町村の切り替えを仮想PVとして記録。
# goatcounter未読込・未登録でも本体の動作に影響しないよう全体をtry/catchで包む
MAIN_HOOK = """<script>
(function () {
  function send(path) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: path, event: true });
      }
    } catch (e) { /* 計測は本体機能に影響させない */ }
  }
  function wrap(name, toPath) {
    var f = window[name];
    if (typeof f !== "function") return;
    window[name] = function (arg) {
      try { send(toPath(arg)); } catch (e) {}
      return f.apply(this, arguments);
    };
  }
  wrap("switchIndustry", function (k) { return "industry/" + k; });
  wrap("onPrefectureChange", function (k) { return "pref/" + k; });
  wrap("onMunicipalityChange", function (k) {
    var p = typeof currentPrefecture !== "undefined" ? currentPrefecture : "unknown";
    return "muni/" + p + "/" + k;
  });
})();
</script>"""

# 末尾の改行まで食わないと、差し込み時に足した "\n" が毎回1本ずつ残り、
# 実行のたびにファイルが1行ずつ伸びていく（冪等にならない）
RE_BLOCK = re.compile(r"\n?<!-- ANALYTICS:START -->.*?<!-- ANALYTICS:END -->\n?", re.S)


def inject(path, extra=""):
    s = io.open(path, encoding="utf-8").read()
    block = "\n<!-- ANALYTICS:START -->\n" + SNIPPET + ("\n" + extra if extra else "") + "\n<!-- ANALYTICS:END -->"
    s2 = RE_BLOCK.sub("", s)
    low = s2.lower()
    idx = low.rfind("</body>")
    if idx == -1:
        return False
    s2 = s2[:idx] + block + "\n" + s2[idx:]
    if s2 != s:
        io.open(path, "w", encoding="utf-8", newline="\n").write(s2)
    return True


def main():
    targets = [(os.path.join(ROOT, "index.html"), MAIN_HOOK)]
    for dirpath, _dirnames, filenames in os.walk(IMPROVEMENT):
        if os.path.basename(dirpath) == "_build":
            continue
        for fn in sorted(filenames):
            if fn.endswith(".html") and fn not in EXCLUDE:
                targets.append((os.path.join(dirpath, fn), ""))
    ok = skipped = 0
    for path, extra in targets:
        if inject(path, extra):
            ok += 1
        else:
            skipped += 1
            print(f"  SKIP(</body>なし): {os.path.relpath(path, ROOT)}")
    print(f"OK: {ok}ファイルに解析タグを反映 (skip {skipped})")


if __name__ == "__main__":
    main()

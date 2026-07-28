# -*- coding: utf-8 -*-
"""index.html の制度カード内で「補助率・上限額・受付期間/次回締切」の3項目だけに
色分け用クラスを付ける。カード数が多く手作業だと付け漏れるため機械的に処理する。

冪等: 既に付いている .pd-item-key は一度剥がしてから付け直す。
実行: python3 highlight_key_fields.py
"""
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.abspath(os.path.join(HERE, "..", "..", "index.html"))

# 見出し文字列 -> 付けるクラス
FIELD_CLASS = {
    "補助率": "pd-item-key pd-item-rate",
    "上限額": "pd-item-key pd-item-amount",
    "受付期間・次回締切": "pd-item-key pd-item-due",
}


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    with open(INDEX, encoding="utf-8") as f:
        html = f.read()

    # 1) 既存のクラスを剥がす（冪等性のため）
    # CSS定義側にも同じ文字列が出るので、カード側の出現だけを数える
    pat = r'(<div class="pd-item)(?: pd-item-key pd-item-(?:rate|amount|due))'
    stripped = len(re.findall(pat, html))
    html = re.sub(pat, r"\1", html)

    counts = {}

    def add(m):
        cls = FIELD_CLASS.get(m.group(2))
        if not cls:
            return m.group(0)
        counts[m.group(2)] = counts.get(m.group(2), 0) + 1
        return f'<div class="{m.group(1)} {cls}"><div class="k">{m.group(2)}</div>'

    html = re.sub(r'<div class="(pd-item[^"]*)"><div class="k">([^<]+)</div>', add, html)

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"剥がしたクラス: {stripped}箇所（再実行時のみ非0）")
    for k, v in counts.items():
        print(f"  {k}: {v}件に色分けクラスを付与")
    print(f"  計 {sum(counts.values())}件")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""index.html の制度カードに、色分け用のクラスを機械的に付ける。カード数が多く
手作業だと付け漏れるため。冪等（既存クラスを剥がしてから付け直す）。

1. 詳細グリッドの「補助率・上限額・受付期間/次回締切」の3項目 → .pd-item-key + 種別クラス
2. 制度名のピル → 名称から補助金/助成金/その他を判定して .pill hojo|josei|other

判定は制度名の表記だけで行い、名称に「補助」「助成」のどちらも含まない制度は
憶測で振り分けず other にする（index.html 側の pillClass() と同じルール）。

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

    # ---- 制度名のピルを補助金／助成金で色分け -------------------------------
    pill_counts = {}

    def pill(m):
        name = m.group(2)
        cls = "josei" if "助成" in name else ("hojo" if "補助" in name else "other")
        pill_counts[cls] = pill_counts.get(cls, 0) + 1
        if cls == "other":
            pill_counts.setdefault("_other_names", []).append(name)
        return f'<span class="pill {cls}">{name}</span>'

    # JSのテンプレート文字列（' + p.name + ' 等）は書き換えない＝実行時に pillClass() が付ける
    pill_pat = r'<span class="pill (?:hojo|josei|other|alt|ai|jizoku|kaizen)">([^<\'"+]+)</span>'
    html = re.sub(r'<span class="pill (hojo|josei|other|alt|ai|jizoku|kaizen)">([^<\'"+]+)</span>',
                  pill, html)

    with open(INDEX, "w", encoding="utf-8") as f:
        f.write(html)

    print(f"剥がしたクラス: {stripped}箇所（再実行時のみ非0）")
    for k, v in counts.items():
        print(f"  {k}: {v}件に色分けクラスを付与")
    print(f"  計 {sum(counts.values())}件")
    others = pill_counts.pop("_other_names", [])
    print("制度名ピルの分類:", {k: v for k, v in pill_counts.items()})
    if others:
        print("  ※名称から判別できず other にした制度:")
        for nm in others:
            print(f"    - {nm}")


if __name__ == "__main__":
    main()

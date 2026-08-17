# -*- coding: utf-8 -*-
"""新配色のコントラスト検証。ライト・ダーク両方を一括で見る。

2026-08-17作成。配色を触ったら必ずこれを流して NG 0件を確認する。
    python _tools/check_palette.py

判定基準（非IT層・中高年が使う前提で、WCAG AAより厳しめに置いている）:
  カード/地 >= 1.30  … 面が分離して見える最低ライン（旧配色は1.14で不足）
  本文/カード >= 7.0  … AAA
  薄字/カード >= 4.5  … AA
  対象/締切の色覚差 >= 60 … 赤緑色覚でも区別できる距離
"""
import io, json


def h2r(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))


def lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def L(h):
    r, g, b = map(lin, h2r(h))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def cr(a, b):
    l1, l2 = L(a), L(b)
    l1, l2 = max(l1, l2), min(l1, l2)
    return (l1 + 0.05) / (l2 + 0.05)


def deuter(h):
    r, g, b = h2r(h)
    return (.625 * r + .375 * g, .7 * r + .3 * g, .3 * g + .7 * b)


def dist(a, b):
    x, y = deuter(a), deuter(b)
    return sum((p - q) ** 2 for p, q in zip(x, y)) ** .5 * 100


LIGHT = dict(
    paper="#e8e0d2",         # サンド地
    paperRaised="#ffffff",   # 白カード
    paperSunken="#dcd2c0",   # さらに沈めた面（囲み・注記）
    ink="#1b1a17",
    inkSoft="#4f4a43",
    inkFaint="#5d574f",
    accent="#1544c4",        # 補助金・案内
    accentSoft="#a9c1f3",
    accentWash="#e7eefc",
    sage="#0a6d50",          # 対象・受付中
    sageWash="#d6f0e4",
    sageInk="#075740",
    rust="#c93c07",          # 締切・注意
    rustWash="#fde3d4",
    rustInk="#a02f05",
    line="#cdc0aa",
    lineStrong="#b3a48b",
)

DARK = dict(
    paper="#0e0c0a",
    paperRaised="#2d2720",
    paperSunken="#1a1712",
    ink="#f4eee3",
    inkSoft="#cabfad",
    inkFaint="#ab9f8c",
    accent="#8fb2ff",
    accentSoft="#26385e",
    accentWash="#1c2639",
    sage="#35b985",
    sageWash="#0f3226",
    sageInk="#35b985",
    rust="#ff8438",
    rustWash="#3d1d0e",
    rustInk="#ff8438",
    line="#5a4d3b",
    lineStrong="#6d5e49",
)

CHECKS = [
    ("カード vs 地", "paperRaised", "paper", 1.30),
    ("沈み面 vs 地", "paperSunken", "paper", 1.08),
    ("本文 vs カード", "ink", "paperRaised", 7.0),
    ("本文 vs 地", "ink", "paper", 7.0),
    ("薄字 vs カード", "inkSoft", "paperRaised", 4.5),
    ("薄字 vs 地", "inkSoft", "paper", 4.5),
    ("最薄字 vs カード", "inkFaint", "paperRaised", 4.5),
    ("罫線 vs カード", "line", "paperRaised", 1.6),
    ("強罫線 vs 地", "lineStrong", "paper", 1.5),
    ("リンク vs カード", "accent", "paperRaised", 4.5),
    ("リンク vs 地", "accent", "paper", 4.5),
    ("対象 vs カード", "sage", "paperRaised", 4.5),
    ("締切 vs カード", "rust", "paperRaised", 4.5),
    ("対象文字 vs 対象地", "sageInk", "sageWash", 4.5),
    ("締切文字 vs 締切地", "rustInk", "rustWash", 4.5),
    ("リンク文字 vs リンク地", "accent", "accentWash", 4.5),
]

out = {}
for label, pal in (("LIGHT", LIGHT), ("DARK", DARK)):
    rows, ng = [], 0
    for name, a, b, need in CHECKS:
        v = cr(pal[a], pal[b])
        ok = v >= need
        if not ok:
            ng += 1
        rows.append((name, round(v, 2), need, ok))
    cvd = dist(pal["sage"], pal["rust"])
    rows.append(("対象/締切 色覚差", round(cvd, 1), 60, cvd >= 60))
    if cvd < 60:
        ng += 1
    out[label] = {"rows": rows, "ng": ng}
    print("===== %s =====" % label)
    for n, v, need, ok in rows:
        print("  %-20s %7.2f (要 %5.2f) %s" % (n, v, need, "OK" if ok else "NG"))
    print("  → NG %d件" % ng)
    print()

io.open("final_palette_result.json", "w", encoding="utf-8").write(
    json.dumps({"light": LIGHT, "dark": DARK,
                "ng_light": out["LIGHT"]["ng"], "ng_dark": out["DARK"]["ng"]},
               ensure_ascii=False, indent=1))

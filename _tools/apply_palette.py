# -*- coding: utf-8 -*-
"""新配色（サンド地＋白カード）を全ファイルの全ブロックへ機械的に適用する。

2026-08-17作成。**全10ページへの適用は完了している**（index.html は f1fba31、
残り9ページは 77cbed9）。もう流す必要はない。**再実行しても無害だが**
（旧値がもう無いので置換0件になる）、新しいページを作ったときの参考として残す。

適用したときのコマンド:
    cd /d/Claudecode/koban-roadmap
    python _tools/apply_palette.py program.html criteria.html consult.html \
        documents.html profile.html profile_edit.html applications.html \
        improvement.html

このスクリプトだけでは足りず、実際に手当てが要ったこと（新規ページを
作るときも同じ罠がある）:
 1. --shadow-card / --shadow-card-strong / --paper-sunken / --line-strong は
    「旧値→新値」の対応表に無いので入らない。:root の全ブロックへ手で足す
 2. --accent-wash を「地」に使っている箇所は、サンド地との差が 1.12 しかなく
    面が沈む（実測）。--paper-sunken + --line-strong + 左帯に変える。
    ただし白カードの上に載る --accent-wash（バッジ・ホバー・選択状態）は
    そのままでよい。**推測で全部変えないこと。** 実ブラウザで
    「祖先をたどった実効背景」との比を測り、1.30未満だけを直す
    → 実際に該当したのは3箇所だけだった：
       criteria.html .disclaimer / profile_edit.html .editing-note /
       improvement.html .ind-picker（index.html は .hero-industry）
 3. 影の色 rgba(12,32,54,...) は旧配色の青ベースでサンド地に合わない
    → rgba(60,46,26,0.16) へ（16箇所あった）
 4. **インラインSVGの色は grep に引っかからない。** select の矢印が
    url('data:image/svg+xml...stroke="%234d6a8a"') のように %23 エンコードで
    旧色を直書きしていた。`grep -o "%23[0-9a-fA-F]\{6\}"` で洗い出す
 5. 実ブラウザで JSエラー0・375px横あふれ0・カード/地のコントラスト>=1.30 を確認

:root ブロックの数はページによって違う（4つとは限らない）:
  - 4ブロック … :root / @media dark / [data-theme=dark] / [data-theme=light]
  - 2ブロック … program.html と consult.html。**data-theme 属性に非対応**で、
    OSの prefers-color-scheme にだけ従う（配色刷新以前からの既存挙動）
  - improvement.html の @media ブロックは1行に詰まっていて
    `--shadow: ...; }` が行末で閉じるため、行単位の正規表現では拾えない

ライト値・ダーク値のどちらに置換するかは「元の値」で判定する。
同じトークン名がライト2ブロック・ダーク2ブロックにあり、行の見た目では
区別できないため、旧値→新値の対応表で引く（旧ライト値ならライト新値、
旧ダーク値ならダーク新値）。これなら順序やブロック構造に依存しない。

注意: --ink のダーク値 #eaf1fb は旧ライトの --paper と同じ値なので、
先に "--ink: #eaf1fb" だけを狙って置換してから他を処理している（順序が重要）。
"""
import io, os, re, sys, json

# 旧ライト値 -> 新ライト値
LIGHT = {
    "#eaf1fb": "#e8e0d2",   # paper サンド地へ
    "#ffffff": None,        # paper-raised は白のまま（他用途と衝突するので触らない）
    "#0c2036": "#1b1a17",   # ink
    "#3a5170": "#4f4a43",   # ink-soft
    "#4d6a8a": "#5d574f",   # ink-faint
    "#0057c2": "#1544c4",   # accent / cat-hojo
    "#bcd7f7": "#a9c1f3",   # accent-soft
    "#e2edfb": "#e7eefc",   # accent-wash / cat-hojo-wash
    "#0d8a6e": "#0a6d50",   # sage
    "#dcf5ee": "#d6f0e4",   # sage-wash
    "#096b54": "#075740",   # sage-ink
    "#d84315": "#c93c07",   # rust
    "#fde3d6": "#fde3d4",   # rust-wash
    "#ad3210": "#a02f05",   # rust-ink
    "#b25400": "#9a4a06",   # cat-josei
    "#fdead2": "#f7e6cd",   # cat-josei-wash
    "#e6ecf5": "#ddd3c1",   # cat-other-wash
    "#a9c2e0": "#cdc0aa",   # line
}

# 旧ダーク値 -> 新ダーク値
DARK = {
    "#081422": "#0e0c0a",   # paper
    "#16283d": "#2d2720",   # paper-raised
    "#eaf1fb": None,        # ink(dark) は旧ライトpaperと同値なので個別処理（下記）
    "#b7cbe4": "#cabfad",   # ink-soft
    "#93abc9": "#ab9f8c",   # ink-faint
    "#5b9df5": "#8fb2ff",   # accent
    "#1c3454": "#26385e",   # accent-soft
}


def apply(path):
    s = io.open(path, encoding="utf-8").read()
    orig = s
    n = 0

    # 1) ダーク側の ink: #eaf1fb を先に処理する（旧ライトpaperと同値のため）
    #    "--ink: #eaf1fb" の形だけを狙う
    s, k = re.subn(r"(--ink:\s*)#eaf1fb", r"\1#f4eee3", s)
    n += k

    # 2) ダーク固有値
    for old, new in DARK.items():
        if new is None:
            continue
        cnt = s.count(old)
        if cnt:
            s = s.replace(old, new)
            n += cnt

    # 3) ライト値
    for old, new in LIGHT.items():
        if new is None:
            continue
        cnt = s.count(old)
        if cnt:
            s = s.replace(old, new)
            n += cnt

    if s != orig:
        io.open(path, "w", encoding="utf-8", newline="").write(s)
    return n


if __name__ == "__main__":
    files = sys.argv[1:]
    total = 0
    for f in files:
        if not os.path.exists(f):
            print("skip (無い): %s" % f)
            continue
        c = apply(f)
        total += c
        print("%-24s 置換 %d" % (f, c))
    print("合計 %d" % total)

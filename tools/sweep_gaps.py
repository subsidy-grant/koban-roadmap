# -*- coding: utf-8 -*-
"""「入っていない欄」を理由の型ごとに数える。

audit_autofill.py が「入れすぎ・誤記入」を見るのに対して、こちらは
「入れ足りない」側を見る。2026-08-03の反省：入れた欄しか見ない点検を
続けていたため、「入るはずなのに入っていない」穴が長く残った。

  先に `python tools\audit_autofill.py` を回してから実行する。
"""
import io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(HERE, "autofill_audit.json")
if not os.path.exists(P):
    print("先に python tools\\audit_autofill.py を回してください")
    sys.exit(1)
rows = json.load(io.open(P, encoding="utf-8"))

# 理由の型。上から順に当てはめる。
#   「気にしなくてよい」= 様式の作りからして入れないのが正しいもの
#   「見直す」= 入るはずのものが入っていない可能性があるもの
KINDS = [
    ("気にしなくてよい", "他人の欄（代理人・取引先・対象者など）", r"の欄なので、自社の情報は入れませんでした"),
    ("気にしなくてよい", "様式が自動で入れる欄（計算式）", r"計算式"),
    ("気にしなくてよい", "法人／個人事業主で分かれた欄", r"書く欄が分かれており"),
    ("気にしなくてよい", "代表者と同じ担当者の欄", r"代表者と異なる場合のみ"),
    ("気にしなくてよい", "一覧から選ぶ欄", r"一覧から選ぶ欄"),
    ("気にしなくてよい", "項目名であって記入欄ではない", r"記入欄ではないので入れませんでした|という項目名で"),
    ("気にしなくてよい", "別の項目の欄", r"を書く欄なので、入れませんでした"),
    ("気にしなくてよい", "一覧表なので1行目だけ", r"一覧表のため、1行目だけ|一覧表の見出し行"),
    ("気にしなくてよい", "すでに何か書かれている", r"上書きしませんでした"),
    ("気にしなくてよい", "単位だけが印字された欄", r"単位だけが"),
    ("見直す", "誰の欄か読み取れなかった（氏名・フリガナ）", r"としか書かれておらず|誰のふりがなの欄か読み取れ"),
    ("見直す", "重ねて入れないよう見送った", r"重ねて入れませんでした"),
    ("見直す", "出力前の点検で止めた", r"入れませんでした$"),
    ("見直す", "隣に記入できる行がない", r"記入できる行が見つかりません"),
]

buckets, other = {}, []
total = 0
for r in rows:
    for s in r.get("skips", []):
        total += 1
        why = str(s.get("reason", ""))
        hit = None
        for band, name, pat in KINDS:
            if re.search(pat, why):
                hit = (band, name); break
        if not hit:
            other.append((r["file"], str(s.get("label", ""))[:20], why[:70]))
            continue
        b = buckets.setdefault(hit, [])
        b.append((r["file"], str(s.get("label", ""))[:20], why[:70]))

print("入れなかった欄 合計 %d 件（%d 様式）\n" % (total, len(rows)))
for band in ("見直す", "気にしなくてよい"):
    print("── %s ──" % band)
    got = [(k, v) for k, v in buckets.items() if k[0] == band]
    got.sort(key=lambda x: -len(x[1]))
    if not got:
        print("   なし")
    for (b, name), items in got:
        print("  %4d件  %s" % (len(items), name))
        for f, lb, why in items[:3]:
            print("          例）%s ／ %s ／ %s" % (f[-18:], lb, why[:52]))
    print()

if other:
    print("── 型に当てはまらなかったもの（%d件）──" % len(other))
    for f, lb, why in other[:12]:
        print("   %s ／ %s ／ %s" % (f[-18:], lb, why))

# -*- coding: utf-8 -*-
"""洗い出した欄名のうち、会社情報に関わりそうなものだけに絞る。
（時間・単価・品名などは会社情報ではないので、読めなくて正しい）"""
import io, json, os, re, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(io.open(os.path.join(HERE, "sweep_labels.json"), encoding="utf-8"))

# 当サイトが持っている会社情報に当たりうる言い回し
HIT = re.compile(
    r"(名称|会社|法人|事業者|事業所|事業場|屋号|商号|所在地|住所|代表|フリガナ|ふりがな"
    r"|電話|ＴＥＬ|TEL|Tel|FAX|ファックス|メール|E-?mail|Ｅメール|郵便|〒"
    r"|資本|出資|従業員|常時使用|常時雇用|業種|事業内容|設立|創業|開業|担当者|登記"
    r"|申請者|事業主|届出者|提出者)")
# 会社情報ではないと分かっているもの（対象労働者・相手先・数量など）
DROP = re.compile(
    r"(対象労働者|対象者|対象従業員|労働者氏名|従業員氏名|子の氏名|配偶者|受講者|訓練生"
    r"|被保険者|代替要員|面談|サイン|講師|取引先|契約先|貸主|賃貸人|売主|購入先|見積|支払先"
    r"|振込|口座|金融機関|支店|単価|数量|品名|時間|引上げ|支給|合計|番号$)")

rows = [(n, cnt, where) for n, cnt, where in d["unknown"]
        if HIT.search(n) and not DROP.search(n)]
rows.sort(key=lambda x: -x[1])
print("会社情報に関わりそうで、まだ読めていない欄名:", len(rows), "種類\n")
for n, cnt, where in rows:
    print("  %-3d %-34s %s" % (cnt, n[:34], (where[0] if where else "")[:56]))

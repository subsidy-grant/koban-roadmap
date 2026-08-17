"""制度種別（補助金/助成金）の判定カバレッジを数える。

    python _tools/check_program_type.py

何をするか:
  program.html の PROGRAM_TYPE_OVERRIDE（専門家が一次情報で実質判定して確定させた分）と、
  page_data.js の全制度を突き合わせ、「どこまで確認が済んでいるか」を数える。

なぜ要るか:
  制度の名称は実質と一致しないことがある。2026-08-13 までに確定させた 31 件は、
  31 件すべてが名称と実質の不一致だった（例: 横浜市LED化支援"助成金" は実質 補助金、
  平塚市企業立地促進"補助金" は実質 助成金）。つまり名称マッチは判定根拠にならない。
  override に入っていない制度は「確認して問題なかった」のではなく「まだ見ていない」だけ。
  その母数を、記憶や過去の文書ではなくその場で数え直すためのコマンド。

出力の見方:
  override         … 一次情報で確定済み。信用してよい
  名称マッチのみ   … 未確認。名称に「補助」「助成」が入っているかだけで振り分けている
  判別不能(other)  … 名称からも分からない。画面で無彩色のピルになる
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
# 自治体・公社の制度はキーがこの接頭辞を持つ（国・全国系と分けて数えるため）
PREF = ("tokyo", "kanagawa", "saitama", "chiba", "tochigi", "gunma")


def load_override():
    """program.html から PROGRAM_TYPE_OVERRIDE を読む。"""
    html = (ROOT / "program.html").read_text(encoding="utf-8")
    m = re.search(r"var PROGRAM_TYPE_OVERRIDE = \{(.*?)\n  \};", html, re.S)
    if not m:
        sys.exit("PROGRAM_TYPE_OVERRIDE が program.html に見つからない")
    return dict(re.findall(r"(\w+):\s*'(hojo|josei)'", m.group(1)))


def load_confirmed_as_is():
    """program.html から PROGRAM_TYPE_CONFIRMED_AS_IS を読む。

    一次情報で確認した結果、名称どおりで正しかった制度。override には入らないが
    「確認済み」であり、未確認と混ぜて数えると同じ調査を繰り返すことになる。
    """
    html = (ROOT / "program.html").read_text(encoding="utf-8")
    m = re.search(r"var PROGRAM_TYPE_CONFIRMED_AS_IS = \{(.*?)\n  \};", html, re.S)
    if not m:
        return {}
    return dict(re.findall(r"(\w+):\s*'(hojo|josei)'", m.group(1)))


def load_programs():
    """page_data.js から制度一覧を読む。

    page_data.js は `window.KOBAN_DATA = {...};` の 1 行 JSON。
    行単位の正規表現で拾おうとすると 0 件になるので、必ず JSON としてパースする。
    """
    src = (ROOT / "page_data.js").read_text(encoding="utf-8")
    head = "window.KOBAN_DATA = "
    i = src.index(head)
    body = src[i + len(head):].strip().rstrip(";").strip()
    return json.loads(body).get("programs", {})


def name_class(name):
    if "助成" in name:
        return "josei"
    if "補助" in name:
        return "hojo"
    return "other"


def main():
    ov = load_override()
    as_is = load_confirmed_as_is()
    progs = load_programs()

    confirmed, as_is_hit, by_name, unknown = [], [], {"hojo": [], "josei": []}, []
    for key, val in progs.items():
        name = (val or {}).get("name", "") if isinstance(val, dict) else ""
        if key in ov:
            confirmed.append((key, name, ov[key]))
            continue
        if key in as_is:
            as_is_hit.append((key, name, as_is[key]))
            continue
        cls = name_class(name)
        if cls == "other":
            unknown.append((key, name))
        else:
            by_name[cls].append((key, name))

    unconfirmed = by_name["hojo"] + by_name["josei"] + unknown
    local = [(k, n) for k, n in unconfirmed if any(k.startswith(p + "_") for p in PREF)]
    national = [(k, n) for k, n in unconfirmed if not any(k.startswith(p + "_") for p in PREF)]

    print(f"制度データ: {len(progs)} 件（page_data.js）")
    print(f"override  : {len(ov)} 件（program.html）")
    print(f"名称どおり確認済: {len(as_is)} 件（program.html）\n")
    print("--- 判定の内訳 ---")
    print(f"  一次情報で確定済み       : {len(confirmed) + len(as_is_hit):3d} 件"
          f"（override {len(confirmed)} + 名称どおり {len(as_is_hit)}）")
    print(f"  名称『補助』→ hojo だけ  : {len(by_name['hojo']):3d} 件  ← 未確認")
    print(f"  名称『助成』→ josei だけ : {len(by_name['josei']):3d} 件  ← 未確認")
    print(f"  判別不能(other)          : {len(unknown):3d} 件"
          + ("  ★画面で無彩色ピルになる" if unknown else ""))
    if unconfirmed:
        print(f"\n★ 未確認の合計: {len(unconfirmed)} 件 / 全 {len(progs)} 件")
        print(f"   うち 自治体・公社: {len(local)} 件 / 国・全国系: {len(national)} 件")
    else:
        # 全数監査が完了した状態。ただしこれは「今この瞬間の128件を見た」という意味で、
        # 週次の自動更新（trig_01Vbn8wKa1hdiWyr1DS1ciYo）が page_data.js を書き換えて
        # 制度が増えれば、その分がまた未確認として出てくる。0件は維持するものであって
        # 一度達成したら終わりではない。
        print(f"\n✅ 未確認 0 件。全 {len(progs)} 件すべて一次情報で確認済み")
        print("   ※ 制度が追加されると未確認が復活する。週次更新のあとは再実行すること")

    if local:
        from collections import Counter
        c = Counter(k.split("_")[0] for k, _ in local)
        print("\n--- 未確認（自治体・公社）の都県別 ---")
        for pref, n in c.most_common():
            print(f"    {pref}: {n} 件")

    if unknown:
        print("\n--- 判別不能のまま残っている制度 ---")
        for k, n in unknown:
            print(f"    {k}: {n}")

    ghost = [k for k in ov if k not in progs]
    ghost += [k for k in as_is if k not in progs]
    print("\n--- 記録の腐り（実データに無いキーを指している） ---")
    print("    " + (", ".join(ghost) if ghost else "なし"))

    # 名称どおり確認済のはずが、名称と食い違っている＝記録の付け間違い
    bad = [(k, n, v) for k, n, v in as_is_hit if name_class(n) != v]
    if bad:
        print("\n★ PROGRAM_TYPE_CONFIRMED_AS_IS の記録が名称と食い違う（override へ移すべき）")
        for k, n, v in bad:
            print(f"    {k}: 名称『{n}』に対し記録は {v}")
        ghost = ghost or bad

    # override は「名称マッチでは間違うから上書きする」ためのもの。名称マッチと
    # 同じ結果になるなら、制度名が改称されて一致するようになった可能性がある
    # （＝実質が変わっていないか確認が要る）。放置すると override が形骸化する。
    redundant = [(k, n, v) for k, n, v in confirmed if name_class(n) == v]
    if redundant:
        print("\n★ override が名称マッチと同じ結果になっている（制度名が変わった可能性）")
        for k, n, v in redundant:
            print(f"    {k}: 名称『{n}』は名称マッチでも {v} になる")
        print("    → 実質が変わっていないか確認し、問題なければ")
        print("       PROGRAM_TYPE_CONFIRMED_AS_IS へ移すこと")

    mismatch = [(k, n, v) for k, n, v in confirmed if name_class(n) != v]
    print(f"\n--- override のうち名称と判定が食い違うもの: {len(mismatch)} 件 ---")
    for k, n, v in sorted(mismatch):
        print(f"    {k}\n        名称: {n}\n        判定: {v}")

    if ghost:
        sys.exit(1)


if __name__ == "__main__":
    main()

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
    progs = load_programs()

    confirmed, by_name, unknown = [], {"hojo": [], "josei": []}, []
    for key, val in progs.items():
        name = (val or {}).get("name", "") if isinstance(val, dict) else ""
        if key in ov:
            confirmed.append((key, name, ov[key]))
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
    print(f"override  : {len(ov)} 件（program.html）\n")
    print("--- 判定の内訳 ---")
    print(f"  一次情報で確定済み       : {len(confirmed):3d} 件")
    print(f"  名称『補助』→ hojo だけ  : {len(by_name['hojo']):3d} 件  ← 未確認")
    print(f"  名称『助成』→ josei だけ : {len(by_name['josei']):3d} 件  ← 未確認")
    print(f"  判別不能(other)          : {len(unknown):3d} 件"
          + ("  ★画面で無彩色ピルになる" if unknown else ""))
    print(f"\n★ 未確認の合計: {len(unconfirmed)} 件 / 全 {len(progs)} 件")
    print(f"   うち 自治体・公社: {len(local)} 件 / 国・全国系: {len(national)} 件")

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
    print("\n--- override の腐り（実データに無いキーを指している） ---")
    print("    " + (", ".join(ghost) if ghost else "なし"))

    mismatch = [(k, n, v) for k, n, v in confirmed if name_class(n) != v]
    print(f"\n--- override のうち名称と判定が食い違うもの: {len(mismatch)} 件 ---")
    for k, n, v in sorted(mismatch):
        print(f"    {k}\n        名称: {n}\n        判定: {v}")

    if ghost:
        sys.exit(1)


if __name__ == "__main__":
    main()

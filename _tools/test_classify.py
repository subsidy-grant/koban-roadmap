"""classify() の判定規則が壊れていないかを確かめる。通信はしない。

    python3 _tools/test_classify.py

ここに並んでいる条件は、どれも 2026-07-31 に実際のサーバーで観測した挙動から
決めたもの（それぞれの理由は _tools/README.md に書いてある）。規則をいじるときは、
まずここに1件足してから直すこと。
"""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import check_links as c   # noqa: E402

T_PROG = {"kind": "program", "doctype": None, "labels": ["X"]}
T_FILE = {"kind": "docs-file", "doctype": "Word", "labels": ["Y"]}
U = "https://example.jp/a"

cases = [
    # 403を返すホストがある（it-shien.smrj.go.jp は存在しないパスにも403）。
    # 「いつも403」と「前は開けたのに開けなくなった」を区別する
    ("初回403（前歴なし）", T_PROG, {"status": 403}, None, "blocked"),
    ("いつも403のホスト", T_PROG, {"status": 403},
     {"last_ok": None, "fail_streak": 3}, "blocked"),
    ("前は開けた・1回目の403", T_PROG, {"status": 403},
     {"last_ok": "2026-07-24 09:00", "fail_streak": 0}, "blocked"),
    # 403は「ページが消えた」ではなく「この経路から断られた」。GitHub Actions の
    # IPだけ弾く自治体サイトがあり（練馬産業振興公社で2026-08-31に実測。Actionsからは
    # 403、日本の一般回線からはUAを問わず200）、要対応に上げると生きたページで毎週
    # 赤くなる。前に開けていた事実は文面に残し、判定は目視待ちに留める。
    ("前は開けた・2回続けて403", T_PROG, {"status": 403},
     {"last_ok": "2026-07-24 09:00", "fail_streak": 1}, "blocked"),
    ("前は開けた・2回続けて接続不能", T_PROG, {"status": None, "error": "Timeout"},
     {"last_ok": "2026-07-24 09:00", "fail_streak": 1}, "regressed"),
    ("404はいつでもリンク切れ", T_PROG, {"status": 404},
     {"last_ok": "2026-07-24 09:00", "fail_streak": 0}, "dead"),

    # 差し替え検出は様式ファイルだけ。取り方が揃っているときだけ比べる
    ("様式のサイズ変化", T_FILE,
     {"status": 200, "content_length": "999", "method": "HEAD", "encoding": "identity",
      "content_type": "application/msword"},
     {"content_length": "500", "method": "HEAD", "encoding": "identity"}, "changed"),
    ("様式・取り方が違えば比べない", T_FILE,
     {"status": 200, "content_length": "999", "method": "GET", "encoding": "identity",
      "content_type": "application/msword"},
     {"content_length": "500", "method": "HEAD", "encoding": "identity"}, "ok"),
    ("HTMLのサイズ変化は無視", T_PROG,
     {"status": 200, "content_length": "999", "method": "HEAD", "encoding": "identity"},
     {"content_length": "500", "method": "HEAD", "encoding": "identity"}, "ok"),
    ("更新日時1秒差は無視（負荷分散で起きる）", T_FILE,
     {"status": 200, "last_modified": "Thu, 18 Jun 2026 06:55:14 GMT", "method": "HEAD",
      "encoding": "identity", "content_type": "application/msword"},
     {"last_modified": "Thu, 18 Jun 2026 06:55:13 GMT", "method": "HEAD",
      "encoding": "identity"}, "ok"),
    ("更新日時が日単位で変われば検出", T_FILE,
     {"status": 200, "last_modified": "Fri, 24 Jul 2026 06:55:13 GMT", "method": "HEAD",
      "encoding": "identity", "content_type": "application/msword"},
     {"last_modified": "Thu, 18 Jun 2026 06:55:13 GMT", "method": "HEAD",
      "encoding": "identity"}, "changed"),
    ("サイズが同じなら更新日時が変わっても無視（銚子市の一斉更新）", T_FILE,
     {"status": 200, "content_length": "5000", "last_modified": "Fri, 31 Jul 2026 05:57:46 GMT",
      "method": "HEAD", "encoding": "identity", "content_type": "application/msword"},
     {"content_length": "5000", "last_modified": "Tue, 31 Mar 2026 03:12:39 GMT",
      "method": "HEAD", "encoding": "identity"}, "ok"),
    ("サイズが取れないときは更新日時の1日超の差で検出", T_FILE,
     {"status": 200, "last_modified": "Fri, 31 Jul 2026 05:57:46 GMT",
      "method": "HEAD", "encoding": "identity", "content_type": "application/msword"},
     {"last_modified": "Tue, 31 Mar 2026 03:12:39 GMT",
      "method": "HEAD", "encoding": "identity"}, "changed"),
    ("様式がHTMLに化けた", T_FILE,
     {"status": 200, "content_type": "text/html", "method": "HEAD", "encoding": "identity"},
     {"method": "HEAD", "encoding": "identity"}, "type_mismatch"),
]


def main():
    ng = 0
    for name, t, now, prev, want in cases:
        now = dict({"final_url": U, "permanent_redirect": False}, **now)
        got, msg = c.classify(U, t, now, prev)
        ok = got == want
        ng += not ok
        print(("  OK " if ok else "  NG ") + "%s: %s" % (name, got)
              + ("" if ok else "（期待 %s）" % want) + ("　— " + msg if msg else ""))
    print("\n%d / %d 通過" % (len(cases) - ng, len(cases)))
    return 1 if ng else 0


if __name__ == "__main__":
    sys.exit(main())

# -*- coding: utf-8 -*-
"""sim_data.js（詳細な試算の定義）を機械で点検する。

なぜ要るのか：
  試算の定義は「制度を1つ足すときに触るのは sim_data.js だけ」という約束で作ってある。
  そのぶん、書き間違えても program.html 側は黙って「準備中」に落ちるだけで、
  画面は壊れないので気づけない。区分表のキーを1文字打ち間違えた、質問のidを
  変えたのに calc の参照を直し忘れた、という穴をここで捕まえる。

なぜ実ブラウザなのか：
  sim_data.js は JSON ではなく JS（コメント入り）で、正規表現では読めない。
  program.html を実際に開いて、ページが読み込んだあとの値をそのまま見る。
  こうすると <script src="sim_data.js"> の書き忘れも一緒に検出できる。

使い方：
    python _tools/check_sim_data.py

制度を1つ足したら、Playwright で画面を確かめる前にこれを流すこと。
"""
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROGRAM_HTML = os.path.join(ROOT, "program.html")
INDEX_HTML = os.path.join(ROOT, "index.html")
SIM_DATA = os.path.join(ROOT, "sim_data.js")

# program.html の計算エンジンが解釈できる語。ここにない type は画面に出ない。
KNOWN_TYPES = ["expense_rate", "per_person", "checkbox_sum", "multi_part", "none"]
# そのうち、いま実際に計算まで通る型（残りは「準備中」に落ちる）
IMPLEMENTED_TYPES = ["expense_rate", "none"]
KNOWN_Q_TYPES = ["number", "choice", "checkbox", "number_list"]
# number_list が入力から作れる値の作り方。ここにない how は program.html が無視する
KNOWN_DERIVE = ["min", "countBelow"]

errors = []
warns = []


def err(key, msg):
    errors.append("[%s] %s" % (key, msg))


def warn(key, msg):
    warns.append("[%s] %s" % (key, msg))


def load():
    """program.html を実際に開いて、読み込まれた定義をそのまま取り出す。"""
    from playwright.sync_api import sync_playwright
    page_errors = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page()
        pg.on("pageerror", lambda e: page_errors.append(str(e)))
        pg.goto("file:///" + PROGRAM_HTML.replace("\\", "/"), wait_until="load")
        pg.wait_for_timeout(600)
        got = pg.evaluate("""() => ({
          sim: window.KOBAN_SIM || null,
          programKeys: window.KOBAN_DATA ? Object.keys(window.KOBAN_DATA.programs) : null
        })""")
        pg2 = b.new_page()
        pg2.on("pageerror", lambda e: page_errors.append("index.html: " + str(e)))
        pg2.goto("file:///" + INDEX_HTML.replace("\\", "/"), wait_until="load")
        pg2.wait_for_timeout(1200)
        # index.html にある数値（CAP＝上限額の万円）。二重持ちを見張るために借りる
        caps = pg2.evaluate("() => (typeof CAP !== 'undefined') ? CAP : null")
        b.close()
    if page_errors:
        raise SystemExit("ページでJSエラーが出ている。先に直すこと:\n  " + "\n  ".join(page_errors))
    if not got["sim"]:
        raise SystemExit("window.KOBAN_SIM が読めなかった。"
                         "program.html の <script src=\"sim_data.js\"> を確認すること。")
    if not got["programKeys"]:
        raise SystemExit("window.KOBAN_DATA が読めなかった。page_data.js を確認すること。")
    return got["sim"], got["programKeys"], (caps or {})


def axis_candidates(ax, questions_by_id, key):
    """区分表の軸1つが取りうるキーの一覧。網羅チェックに使う。"""
    if ax.get("brackets"):
        ks = [b.get("k") for b in ax["brackets"]]
        # 条件付きの区分（when）は、条件を満たさないとき else が指す区分に落とす。
        # その落とし先が実在しないと、区分が決まらないまま計算が止まる。
        for b in ax["brackets"]:
            if b.get("when"):
                if not b.get("else"):
                    err(key, "区分 '%s' に when があるのに else（条件を満たさないときの落とし先）が無い"
                        % b.get("k"))
                elif b.get("else") not in ks:
                    err(key, "区分 '%s' の else が指す '%s' は同じ軸に無い" % (b.get("k"), b.get("else")))
                if not b["when"].get("q"):
                    err(key, "区分 '%s' の when に q（見にいく質問id）が無い" % b.get("k"))
                elif b["when"]["q"] not in questions_by_id:
                    err(key, "区分 '%s' の when が参照する id '%s' が questions にも derive にも無い"
                        % (b.get("k"), b["when"]["q"]))
        # max は小さい順に並べ、最後の1つだけが受け皿（max なし）でなければならない
        maxes = [b.get("max") for b in ax["brackets"]]
        if maxes[-1] is not None:
            err(key, "軸 '%s' の brackets の最後に受け皿（max を書かない区分）が無い。"
                     "大きい値のときに区分が決まらない" % ax.get("q"))
        for i in range(len(maxes) - 1):
            if maxes[i] is None:
                err(key, "軸 '%s' の brackets の途中に max の無い区分がある（%d番目）。"
                         "そこから先が永久に選ばれない" % (ax.get("q"), i + 1))
            elif i > 0 and maxes[i - 1] is not None and maxes[i] <= maxes[i - 1]:
                err(key, "軸 '%s' の brackets が max の昇順になっていない（%s のあとに %s）"
                    % (ax.get("q"), maxes[i - 1], maxes[i]))
        return ks
    q = questions_by_id.get(ax.get("q"))
    if not q:
        return []
    return [o.get("v") for o in (q.get("options") or [])]


def check_program(key, d, program_keys, caps):
    # --- 制度キーが実在するか ---
    if key not in program_keys:
        err(key, "この制度キーは page_data.js に無い（制度ページが開けない）")

    # --- 必須フィールド ---
    if d.get("kind") not in ("hojo", "josei"):
        err(key, "kind は 'hojo'（補助金）か 'josei'（助成金）のどちらか。いまは %r"
            % d.get("kind"))
    src = d.get("source") or {}
    if not src.get("url"):
        err(key, "source.url（出典URL）が無い。暗記で数値を書いていないか確認すること")
    if not src.get("checked"):
        err(key, "source.checked（確認日時）が無い")
    rev = d.get("review") or {}
    if not rev.get("reviewer"):
        err(key, "review.reviewer が無い（厚労省系は sharoushi、それ以外は shindanshi）")
    if rev.get("result") == "draft" or not rev.get("date"):
        warn(key, "専門家レビューがまだ終わっていない（review.result=%r date=%r）"
             % (rev.get("result"), rev.get("date")))

    calc = d.get("calc") or {}
    ctype = calc.get("type")
    if ctype not in KNOWN_TYPES:
        err(key, "calc.type %r は program.html が知らない語。使えるのは %s"
            % (ctype, "／".join(KNOWN_TYPES)))
        return
    if ctype not in IMPLEMENTED_TYPES:
        warn(key, "calc.type=%s はまだ計算エンジンが未実装。画面では「準備中」になる" % ctype)
        return
    if ctype == "none":
        if not d.get("reason"):
            warn(key, "type=none なのに reason（試算になじまない理由）が無い")
        return

    # --- 質問 ---
    questions = d.get("questions") or []
    if not questions:
        err(key, "questions が空。質問が無いと試算にならない")
    seen = {}
    for q in questions:
        qid = q.get("id")
        if not qid:
            err(key, "id の無い質問がある")
            continue
        if qid in seen:
            err(key, "質問id '%s' が重複している" % qid)
        seen[qid] = q
        if q.get("type") not in KNOWN_Q_TYPES:
            err(key, "質問 '%s' の type %r は使えない。%s のどれか"
                % (qid, q.get("type"), "／".join(KNOWN_Q_TYPES)))
        if not q.get("label"):
            err(key, "質問 '%s' に label が無い" % qid)
        if q.get("type") == "number":
            if q.get("def") is None:
                warn(key, "質問 '%s' に def（初期値）が無い。空欄から始まる" % qid)
            if q.get("min") is None or q.get("max") is None:
                warn(key, "質問 '%s' に min/max が無い" % qid)
        if q.get("type") == "choice":
            opts = q.get("options") or []
            if not opts:
                err(key, "質問 '%s' に options が無い" % qid)
            if q.get("def") is not None and q.get("def") not in [o.get("v") for o in opts]:
                err(key, "質問 '%s' の初期値 %r が options に無い" % (qid, q.get("def")))

    # --- number_list（人数分の欄を並べて、そこから値を作る型） ---
    # ここで作った値（derive の id）は、質問の答えと同じ名前で cap の軸や when から
    # 参照できる。参照先の実在チェックで質問と同じ扱いにするため seen に足す。
    for q in questions:
        if q.get("type") != "number_list":
            continue
        qid = q.get("id")
        if not q.get("countQ"):
            err(key, "質問 '%s' に countQ（欄の数を決める質問）が無い" % qid)
        elif q["countQ"] not in seen:
            err(key, "質問 '%s' の countQ '%s' が questions に無い" % (qid, q["countQ"]))
        if q.get("maxFields") is None:
            warn(key, "質問 '%s' に maxFields が無い。人数を大きくすると欄が際限なく増える" % qid)
        if q.get("def") is None:
            warn(key, "質問 '%s' に def（各欄の初期値）が無い" % qid)
        for fi, fl in enumerate(q.get("rowFlags") or []):
            if not fl.get("label"):
                err(key, "質問 '%s' の rowFlags[%d] に label が無い" % (qid, fi))
            if not fl.get("excludeFromMin") and not fl.get("excludeFromCount"):
                err(key, "質問 '%s' の rowFlags[%d] は何も除外しない（チェックしても計算が変わらない）"
                    % (qid, fi))
        if q.get("rowFlag"):
            err(key, "質問 '%s' の rowFlag は rowFlags（配列）に変わった。program.html は読まない" % qid)
        if q.get("maxFields") is not None and not q.get("foldedCountLabel"):
            err(key, "質問 '%s' に foldedCountLabel が無い。欄を畳んだとき人数を聞けず、"
                     "入力人数をそのまま使って上限額が過大になる" % qid)
        derive = q.get("derive") or []
        if not derive:
            err(key, "質問 '%s' に derive が無い。number_list は作った値でしか計算に使えない" % qid)
        for d2 in derive:
            did = d2.get("id")
            if not did:
                err(key, "質問 '%s' の derive に id の無い項目がある" % qid)
                continue
            if did in seen:
                err(key, "derive の '%s' が質問idと重なっている（どちらを見るか決まらない）" % did)
            if d2.get("how") not in KNOWN_DERIVE:
                err(key, "derive '%s' の how %r は program.html が知らない語。使えるのは %s"
                    % (did, d2.get("how"), "／".join(KNOWN_DERIVE)))
            if d2.get("how") == "countBelow":
                # しきい値 = base の値 ＋ plusFrom で選ばれた選択肢の add
                if d2.get("base") not in seen:
                    err(key, "derive '%s' の base '%s' が先に作られていない"
                        % (did, d2.get("base")))
                pf = seen.get(d2.get("plusFrom"))
                if not pf:
                    err(key, "derive '%s' の plusFrom '%s' が questions に無い"
                        % (did, d2.get("plusFrom")))
                elif pf.get("type") != "choice":
                    err(key, "derive '%s' の plusFrom '%s' は choice でないと add を持てない"
                        % (did, d2.get("plusFrom")))
                else:
                    for o in (pf.get("options") or []):
                        if o.get("add") is None:
                            err(key, "選択肢 '%s' に add が無い。derive '%s' のしきい値が出せない"
                                % (o.get("v"), did))
            seen[did] = {"id": did, "type": "derived"}

    def need_q(qid, where):
        if qid and qid not in seen:
            err(key, "%s が参照する id '%s' が questions にも derive にも無い" % (where, qid))

    # --- 注意書きの記法 ---
    # [[ ]]＝赤の太字。閉じ忘れると記号がそのまま画面に出る。
    # {…}＝自動で作った値の差し込み。綴りを間違えると「{wage}円」と出てしまう。
    placeholders = set(["rows", "n"])
    for q in questions:
        for d2 in (q.get("derive") or []):
            if d2.get("id"):
                placeholders.add(d2["id"])
                for suf in ("_limit", "_in", "_drop"):
                    placeholders.add(d2["id"] + suf)
        # 上限のある数値（maxQ）は、入力値・上限・戻したあとの値の3つを差し込める
        if q.get("maxQ"):
            need_ids = [q.get("id"), q.get("id") + "_typed", q.get("id") + "_max"]
            placeholders.update(need_ids)
            if q["maxQ"] not in [x.get("id") for x in questions]:
                err(key, "質問 '%s' の maxQ '%s' が questions に無い" % (q.get("id"), q["maxQ"]))
            if not q.get("overNote"):
                warn(key, "質問 '%s' に maxQ があるのに overNote が無い。"
                          "計算に使う値を戻したことが画面に出ない" % q.get("id"))

    def check_text(text, where):
        if not isinstance(text, str):
            return
        if text.count("[[") != text.count("]]"):
            err(key, "%s の [[ ]] の数が合っていない（閉じ忘れ）" % where)
        for name in re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", text):
            if name not in placeholders:
                err(key, "%s の {%s} は作られていない値。画面にそのまま出る" % (where, name))

    for q in questions:
        qid = q.get("id")
        check_text(q.get("help"), "質問 '%s' の help" % qid)
        check_text(q.get("derivedText"), "質問 '%s' の derivedText" % qid)
        check_text(q.get("derivedTextFolded"), "質問 '%s' の derivedTextFolded" % qid)
        check_text(q.get("foldedCountLabel"), "質問 '%s' の foldedCountLabel" % qid)
        check_text(q.get("allExcludedNote"), "質問 '%s' の allExcludedNote" % qid)
        check_text(q.get("overNote"), "質問 '%s' の overNote" % qid)
        for d2 in (q.get("derive") or []):
            check_text(d2.get("dropNote"), "derive '%s' の dropNote" % d2.get("id"))
    for i, t in enumerate(d.get("notes") or []):
        check_text(t, "notes[%d]" % i)
    for i, t in enumerate(d.get("notesMore") or []):
        check_text(t, "notesMore[%d]" % i)
    if len(d.get("notes") or []) > 5:
        warn(key, "notes が %d 件ある。常に見せるのは5件までにして、残りは notesMore へ"
             % len(d["notes"]))

    # --- 計算が参照する質問 ---
    need_q(calc.get("expenseQ"), "calc.expenseQ")
    if not calc.get("expenseQ"):
        err(key, "expense_rate なのに expenseQ（経費を聞く質問）が無い")

    # --- 下限額（これを割ると金額が出せない制度がある） ---
    fl = calc.get("floor")
    if fl:
        need_q(fl.get("q"), "calc.floor.q")
        if fl.get("min") is None:
            err(key, "calc.floor に min が無い")
        if not fl.get("message"):
            err(key, "calc.floor に message（下限を割ったときに画面に出す説明）が無い")

    # --- 受付の状況 ---
    st = d.get("status")
    if st:
        if st.get("state") not in ("before", "open", "closed"):
            err(key, "status.state は before / open / closed のどれか。いまは %r" % st.get("state"))
        if not st.get("text"):
            err(key, "status に text が無い")
        elif "時点" not in st["text"]:
            warn(key, "status.text に「〜時点」が無い。日付が動く情報なので観測時点を書くこと")
    else:
        warn(key, "status（受付中か終了か）が無い。締切済みの制度で金額だけ見せると誤解される")

    rate = calc.get("rate") or {}
    if rate.get("fixed") is None and not rate.get("thresholds"):
        err(key, "calc.rate に fixed も thresholds も無い（補助率が決まらない）")
    if rate.get("thresholds"):
        need_q(rate.get("q"), "calc.rate.q")
        th = rate["thresholds"]
        for i, t in enumerate(th):
            check_text(t.get("note"), "calc.rate.thresholds[%d].note" % i)
        if th and th[-1].get("lt") is not None:
            err(key, "calc.rate.thresholds の最後に受け皿（lt を書かない段）が無い")
        for t in th:
            if t.get("rate") is None:
                err(key, "calc.rate.thresholds に rate の無い段がある")
            elif not (0 < t["rate"] <= 1):
                err(key, "補助率 %r が 0〜1 の範囲外（1/2 なら 0.5 と書く）" % t["rate"])
    if rate.get("fixed") is not None and not (0 < rate["fixed"] <= 1):
        err(key, "補助率 %r が 0〜1 の範囲外" % rate["fixed"])

    # --- 上限額 ---
    cap = calc.get("cap") or {}
    if cap.get("fixedMan") is None and not cap.get("axes"):
        err(key, "calc.cap に fixedMan も axes も無い（上限額が決まらない）")
    cap_values = []
    if cap.get("axes"):
        cands = []
        for ax in cap["axes"]:
            need_q(ax.get("q"), "calc.cap.axes")
            c = axis_candidates(ax, seen, key)
            if not c:
                err(key, "軸 '%s' の候補が取れない（brackets も options も無い）" % ax.get("q"))
            cands.append(c)
        # 全組み合わせが区分表に載っているか（1つでも欠けるとその条件で「準備中」になる）
        combos = [[]]
        for c in cands:
            combos = [x + [y] for x in combos for y in c]
        expect = set("|".join(c) for c in combos)
        actual = set((cap.get("values") or {}).keys())
        for miss in sorted(expect - actual):
            err(key, "区分表に '%s' が無い。この組み合わせを選ぶと試算が出せない" % miss)
        for extra in sorted(actual - expect):
            err(key, "区分表の '%s' はどの組み合わせにも当たらない（キーの打ち間違い？）" % extra)
        cap_values = [v for v in (cap.get("values") or {}).values() if isinstance(v, (int, float))]
        for k2, v in (cap.get("values") or {}).items():
            if not isinstance(v, (int, float)):
                err(key, "区分表 '%s' の値が数値でない（%r）" % (k2, v))
    elif cap.get("fixedMan") is not None:
        cap_values = [cap["fixedMan"]]

    # --- index.html が持っている上限額（CAP）との突合 ---
    # 同じ数字を2か所に置いている以上、片方だけ古くなる。大きくずれたら気づけるようにする。
    # わざと違えている場合は capDiffOk に理由を書く（黙って消さず、理由を残して黙らせる）。
    if cap_values and key in caps:
        top = max(cap_values)
        if abs(top - caps[key]) > 0.01 and not d.get("capDiffOk"):
            warn(key, "上限額の最大が index.html の CAP と違う（sim_data.js=%s万円 / "
                      "index.html=%s万円）。どちらかが古くないか確認すること。"
                      "わざと違えているなら capDiffOk に理由を書くこと"
                 % (top, caps[key]))


def main():
    sim, program_keys, caps = load()
    programs = sim.get("programs") or {}
    print("sim_data.js version=%s / 試算を定義した制度 %d 件（サイト全体は %d 件）"
          % (sim.get("version"), len(programs), len(program_keys)))

    for key in sorted(programs.keys()):
        check_program(key, programs[key], program_keys, caps)

    for w in warns:
        print("  注意 " + w)
    for e in errors:
        print("  誤り " + e)

    print("-" * 60)
    if errors:
        print("誤り %d 件 / 注意 %d 件。直してから出すこと" % (len(errors), len(warns)))
        sys.exit(1)
    print("誤り 0 件 / 注意 %d 件。ALL OK" % len(warns))


if __name__ == "__main__":
    main()

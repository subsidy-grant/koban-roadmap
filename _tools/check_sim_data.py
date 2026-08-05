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
IMPLEMENTED_TYPES = ["expense_rate", "per_person", "none"]
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


def fmt_man(v):
    """index.html の fmtMan と同じ整形。capText にこの文字列が入っているかを見る。"""
    n = round(v * 10) / 10
    s = ("%d" % n) if float(n).is_integer() else ("%.1f" % n)
    if abs(n) >= 1000:
        i = s.split(".")[0]
        frac = s[len(i):]
        i = "{:,}".format(int(i))
        s = i + frac
    return s + "万円"


def cap_of(calc, cap_key):
    # 上限額の区分表（expense_rate の cap）と単価の区分表（per_person の unit）は
    # まったく同じ形。top.capKey はどちらも指せる。
    cap = calc.get("cap") or calc.get("unit") or {}
    if cap_key:
        return (cap.get("values") or {}).get(cap_key)
    return cap.get("fixedMan")


def check_cap_table(key, cap, seen, need_q, where):
    """区分表（axes / values）の点検。上限額でも per_person の単価でも同じ形なので共通。"""
    if not cap.get("axes"):
        return
    cands = []
    for ax in cap["axes"]:
        need_q(ax.get("q"), where + ".axes")
        c = axis_candidates(ax, seen, key)
        if not c:
            err(key, "%s の軸 '%s' の候補が取れない（brackets も options も無い）"
                % (where, ax.get("q")))
        cands.append(c)
    # 全組み合わせが区分表に載っているか（1つでも欠けるとその条件で「準備中」になる）
    combos = [[]]
    for c in cands:
        combos = [x + [y] for x in combos for y in c]
    expect = set("|".join(c) for c in combos)
    actual = set((cap.get("values") or {}).keys())
    for miss in sorted(expect - actual):
        err(key, "%s に '%s' が無い。この組み合わせを選ぶと試算が出せない" % (where, miss))
    for extra in sorted(actual - expect):
        err(key, "%s の '%s' はどの組み合わせにも当たらない（キーの打ち間違い？）" % (where, extra))
    for k2, v in (cap.get("values") or {}).items():
        if not isinstance(v, (int, float)):
            err(key, "%s の '%s' の値が数値でない（%r）" % (where, k2, v))


def check_top(key, d, calc, caps):
    top = d.get("top")
    if not top:
        err(key, "top が無い。トップページに出す上限額・補助率・受付期間の出所が決まらない")
        return
    for f in ("rate", "cap", "schedule"):
        if not top.get(f):
            err(key, "top.%s が無い（index.html 側から移した説明文。空だと画面が欠ける）" % f)
    if top.get("noTopEstimate"):
        if key in caps:
            err(key, "top.noTopEstimate なのに index.html の CAP に残っている")
        return

    man = cap_of(calc, top.get("capKey"))
    if man is None:
        err(key, "top.capKey %r が区分表に無い（fixedMan の制度なら capKey を書かない）"
            % top.get("capKey"))
    else:
        if not top.get("capText"):
            err(key, "top.capText が無い")
        elif fmt_man(man) not in top["capText"]:
            err(key, "top.capText に上限額 %s が入っていない（いまは %r）。"
                     "capKey が指す額と表示がずれている" % (fmt_man(man), top["capText"]))
        # index.html は applySimNumbers() でここから読む。読んだ結果が一致しなければ
        # どこかで上書きされている（＝一本化が崩れている）。
        if key in caps and abs(caps[key] - man) > 0.01:
            err(key, "index.html の CAP が top.capKey の額と違う（index=%s / sim=%s）。"
                     "index.html 側にまだ数字が残っていないか確認すること" % (caps[key], man))
        elif key not in caps:
            err(key, "index.html の CAP に流し込まれていない。"
                     "applySimNumbers() が呼ばれているか、top の書き方を確認すること")

    tracks = top.get("tracks") or {}
    keys = [o.get("key") for o in (tracks.get("options") or [])]
    if tracks and tracks.get("default") not in keys:
        err(key, "top.tracks.default %r が options に無い" % tracks.get("default"))
    for o in (tracks.get("options") or []):
        if not o.get("label"):
            err(key, "top.tracks の '%s' に label が無い" % o.get("key"))
        ways = [o.get("capKey"), o.get("capMan"), o.get("capKeyByTier"), o.get("capManByTier")]
        if sum(1 for w in ways if w is not None) != 1:
            err(key, "top.tracks の '%s' は capKey / capMan / capKeyByTier / capManByTier の"
                     "どれか1つだけを書くこと" % o.get("key"))
        if o.get("capKey") and cap_of(calc, o["capKey"]) is None:
            err(key, "top.tracks の '%s' の capKey %r が区分表に無い" % (o.get("key"), o["capKey"]))
        for tier, ck in (o.get("capKeyByTier") or {}).items():
            if cap_of(calc, ck) is None:
                err(key, "top.tracks の '%s' の capKeyByTier[%s] %r が区分表に無い"
                    % (o.get("key"), tier, ck))
        # 数字を直書きする枠（calc に無い枠）は、なぜ直書きなのかが分かるようにしておく
        if (o.get("capMan") is not None or o.get("capManByTier")) and not o.get("capText") \
                and not o.get("capTextByTier"):
            err(key, "top.tracks の '%s' は額を直書きしているので capText も書くこと" % o.get("key"))


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

    # --- per_person（1人あたりの額 × 人数 ＋ 加算）---
    # 単価の区分表は上限額の区分表とまったく同じ形なので、そのまま check_cap_table に渡す。
    if ctype == "per_person":
        unit = calc.get("unit") or {}
        if unit.get("fixedMan") is None and not unit.get("axes"):
            err(key, "per_person なのに calc.unit に fixedMan も axes も無い（単価が決まらない）")
        check_cap_table(key, unit, seen, need_q, "calc.unit")
        if calc.get("countQ"):
            need_q(calc["countQ"], "calc.countQ")
            cq = seen.get(calc["countQ"]) or {}
            if cq.get("type") != "number":
                err(key, "calc.countQ '%s' は number でないと人数として使えない" % calc["countQ"])
            if calc.get("maxCount") is not None and not calc.get("overNote"):
                err(key, "calc.maxCount があるのに overNote が無い。"
                         "人数を戻したことが画面に出ない")
            # overNote では {typed}（入力された人数）と {used}（実際に使った人数）だけ使える
            if isinstance(calc.get("overNote"), str):
                if calc["overNote"].count("[[") != calc["overNote"].count("]]"):
                    err(key, "calc.overNote の [[ ]] の数が合っていない")
                for nm in re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", calc["overNote"]):
                    if nm not in ("typed", "used"):
                        err(key, "calc.overNote の {%s} は使えない（使えるのは {typed} と {used}）" % nm)
        if calc.get("adds"):
            aq_id = (calc["adds"] or {}).get("q")
            need_q(aq_id, "calc.adds.q")
            aq = seen.get(aq_id) or {}
            if aq.get("type") != "checkbox":
                err(key, "calc.adds.q '%s' は checkbox でないと加算にできない" % aq_id)
            for o in (aq.get("options") or []):
                if o.get("man") is None and not o.get("manBy"):
                    err(key, "加算の選択肢 '%s' に man も manBy も無い" % o.get("v"))
                if o.get("manBy"):
                    need_q(o["manBy"].get("q"), "加算 '%s' の manBy.q" % o.get("v"))
                    mq = seen.get(o["manBy"].get("q")) or {}
                    for opt in (mq.get("options") or []):
                        if opt.get("v") not in (o["manBy"].get("values") or {}):
                            err(key, "加算 '%s' の manBy.values に '%s' が無い。"
                                     "この区分を選ぶと加算が消える" % (o.get("v"), opt.get("v")))
                check_text(o.get("t"), "加算の選択肢 '%s' の文言" % o.get("v"))
        check_top(key, d, calc, caps)
        return

    # --- 計算が参照する質問 ---
    need_q(calc.get("expenseQ"), "calc.expenseQ")
    if not calc.get("expenseQ"):
        err(key, "expense_rate なのに expenseQ（経費を聞く質問）が無い")

    # --- 下限（これを割ると金額が出せない制度がある） ---
    # 2種類ある。q+min＝対象経費そのものの下限／amount・amountBy＝補助金の額の下限。
    fl = calc.get("floor")
    if fl:
        kinds = [fl.get("q") is not None, fl.get("amount") is not None, fl.get("amountBy") is not None]
        if sum(1 for x in kinds if x) != 1:
            err(key, "calc.floor は q+min か amount か amountBy のどれか1つだけを書くこと")
        if fl.get("q") is not None:
            need_q(fl.get("q"), "calc.floor.q")
            if fl.get("min") is None:
                err(key, "calc.floor に q があるのに min が無い")
        if fl.get("amountBy"):
            ab = fl["amountBy"]
            need_q(ab.get("q"), "calc.floor.amountBy.q")
            aq = seen.get(ab.get("q")) or {}
            opts = [o.get("v") for o in (aq.get("options") or [])]
            for v in opts:
                if v not in (ab.get("values") or {}):
                    err(key, "calc.floor.amountBy.values に '%s' が無い。この枠だけ下限が効かない" % v)
        if not fl.get("message"):
            err(key, "calc.floor に message（下限を割ったときに画面に出す説明）が無い")
        else:
            for name in re.findall(r"\{([A-Za-z_][A-Za-z0-9_]*)\}", fl["message"]):
                if name not in ("min", "amount"):
                    err(key, "calc.floor.message の {%s} は使えない（使えるのは {min} と {amount}）" % name)

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
    if rate.get("fixed") is None and not rate.get("thresholds") and not rate.get("optionsOf"):
        err(key, "calc.rate に fixed も thresholds も optionsOf も無い（補助率が決まらない）")
    # 補助率を選択肢そのものに持たせる形（中小1/2・小規模2/3 など）
    if rate.get("optionsOf"):
        need_q(rate["optionsOf"], "calc.rate.optionsOf")
        rq = seen.get(rate["optionsOf"]) or {}
        if rq.get("type") != "choice":
            err(key, "calc.rate.optionsOf '%s' は choice でないと補助率を持てない" % rate["optionsOf"])
        for o in (rq.get("options") or []):
            r = o.get("rate")
            if r is None:
                err(key, "選択肢 '%s' に rate が無い。選ぶと補助率が決まらない" % o.get("v"))
            elif not (0 < r <= 1):
                err(key, "選択肢 '%s' の補助率 %r が 0〜1 の範囲外（1/2 なら 1/2 と書く）" % (o.get("v"), r))
            elif not o.get("rateLabel"):
                warn(key, "選択肢 '%s' に rateLabel が無い。内訳に補助率の名前が出ない" % o.get("v"))
            check_text(o.get("note"), "選択肢 '%s' の note" % o.get("v"))
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
    check_cap_table(key, cap, seen, need_q, "calc.cap")

    # --- top（トップページが読む値）---
    # 2026-08-05に、上限額・補助率・受付期間の出所を sim_data.js に一本化した。
    # index.html は起動時にここから読む。数字を書き写さず区分表のキーで指す約束なので、
    # そのキーが実在するか、表示テキストがその額を含んでいるかを見る。
    check_top(key, d, calc, caps)


def check_no_duplicate_literals(sim_keys):
    """index.html の中に、試算のある制度の数値が直書きで残っていないか。

    一本化しても、あとから「ここだけ直接書いたほうが早い」と戻してしまうと、
    また片方だけ古い状態に戻る。ソースを文字列として見て、それを止める。
    """
    with open(INDEX_HTML, encoding="utf-8") as f:
        src = f.read()
    # applySimNumbers() より前に置かれた var 宣言の中身だけを見る。
    # 中括弧を含まない形（var RATE_BASE = {};）を先に見ること。複数行用の正規表現を
    # 先に当てると、空の宣言のときに次の宣言まで飲み込んで誤検知する。
    for name in ("CAP", "CAP_TEXT", "RATE_BASE", "PROGRAM_TRACKS"):
        m = re.search(r"\n  var %s = \{([^{}]*)\};" % name, src)
        if not m:
            m = re.search(r"\n  var %s = \{(.*?)\n  \};" % name, src, re.S)
        if not m:
            continue
        body = m.group(1)
        for k in sim_keys:
            if re.search(r"(^|[\s{,])%s\s*:" % re.escape(k), body):
                err(k, "index.html の %s に直書きが残っている。"
                       "この値は sim_data.js の top から流し込む決まり" % name)
    # OPTION_LABEL（制度を選ぶプルダウンの表示）にも上限額を書いていたことがあり、
    # applySimNumbers() は「未定義のキーだけ」補う実装なので上書きされず生き残った。
    # 金額らしき文字が入っていたら落とす。
    m = re.search(r"\n  var OPTION_LABEL = \{(.*?)\n  \};", src, re.S)
    if m:
        for line in m.group(1).split("\n"):
            for k in sim_keys:
                if re.search(r"(^|[\s{,])%s\s*:" % re.escape(k), line) and re.search(r"\d[\d,\.]*万円", line):
                    err(k, "index.html の OPTION_LABEL に金額が書いてある。"
                           "ここは applySimNumbers() が上書きしないので古いまま残る")
    # PROGRAMS の中の rate / cap / schedule も sim_data.js が持つ
    for k in sim_keys:
        m = re.search(r"\n    %s: \{(.*?)\n    \},?\n" % re.escape(k), src, re.S)
        if not m:
            continue
        body = m.group(1)
        for f in ("rate", "cap", "schedule"):
            if re.search(r"\n      %s: \"" % f, body):
                err(k, "index.html の PROGRAMS.%s に %s が直書きで残っている。"
                       "この文章は sim_data.js の top.%s が持つ決まり" % (k, f, f))


def main():
    sim, program_keys, caps = load()
    programs = sim.get("programs") or {}
    print("sim_data.js version=%s / 試算を定義した制度 %d 件（サイト全体は %d 件）"
          % (sim.get("version"), len(programs), len(program_keys)))

    for key in sorted(programs.keys()):
        check_program(key, programs[key], program_keys, caps)
    check_no_duplicate_literals(sorted(programs.keys()))

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

"""交付要綱・募集要領のPDFから、制度が「補助金（競争的採択あり）」か
「助成金（要件充足型）」かの証拠を機械的に洗い出す。

    python -X utf8 _tools/check_program_evidence.py <PDFのURL or ローカルパス> [...]

何をするか:
  1. PDFを取得してテキストを抽出する
  2. **抽出が文字化けしていないかを先に検証する**（後述。これが本題）
  3. hojo（補助金）の積極的証拠になる語を数え、該当箇所の前後を出す
  4. 画像しか入っていないページを報告する（様式が画像PDFのことがある）

判定基準（2026-08-17に全面的に改めたもの。過去の基準は使わないこと）:

  使ってはいけない根拠（いずれも判別力ゼロ）:
    × 「予算の範囲内において」… ほぼ全ての交付要綱に入る定型句。競争型にも入っている
    × 「先着順」「予算に達し次第終了」… 受付の締め方であって、受付後の審査の性質を語らない
    × 「審査し、適否を決定」… 要件審査と競争審査の両方を包含する定型句

  正しい向き: hojo の積極的証拠を探し、1つでも見つかれば hojo。無ければ josei。
    ① 審査の観点/審査項目の表があり「妥当性」「総合評価」など程度を測る語がある
    ② 加点項目がある（相対比較の道具なので単独で決定的）
    ③ 不備以外の理由で不採択・不交付がありうると書かれている
    ④ 採択率・採択件数・採択公表への言及がある

なぜ文字化けの検証が要るか:
  文字化けしたテキストへのキーワード検索は**必ず0ヒットになる**。つまり
  「証拠が無いので josei」という結論が、実際には「読めていないだけ」で出てしまう。
  これは判定を誤らせた「判別力ゼロの根拠」と同じ構造の罠で、しかも
  静かに間違うぶんタチが悪い。2026-08-17の洗い直しで、袖ケ浦・平塚のPDFが
  実際にこれを踏みかけた。だから抽出結果は必ず日本語文字の比率で検証してから使う。

  ここで 0.3 未満なら、そのPDFの検索結果は**証拠として使ってはいけない**。
  別ライブラリ（pdfminer.six 等）で取り直すか、ページ画像を目視すること。
"""
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

# hojo の積極的証拠。語ごとに「どの条件に当たるか」を持たせる
EVIDENCE = [
    ("採択", "④ 採択への言及"),
    ("不採択", "③ 不備以外の不交付"),
    ("加点", "② 加点項目（単独で決定的）"),
    ("審査の観点", "① 審査の観点の表"),
    ("審査項目", "① 審査の観点の表"),
    ("審査基準", "① 審査の観点の表"),
    ("総合評価", "① 程度を測る語"),
    ("妥当性", "① 程度を測る語"),
    ("優秀性", "① 程度を測る語"),
    ("審査会", "① 審査体制"),
    ("審査委員", "① 審査体制"),
    ("面接審査", "① 2段階選抜"),
    # 「書類審査」は単独では証拠にならないので入れていない。目黒区の省力化投資補助金、
    # 豊島区の経営安定コース、台東区の経営基盤強化支援はいずれも「書類不備等がある場合」
    # という不備確認の意味で使っており、実際にこのツールが誤検出した（2026-08-17）。
    # 2段階選抜の証拠になるのは「面接審査」と共起するときだけで、それは上の行が拾う。
    ("配点", "① 配点"),
    ("点数", "① 配点"),
    ("抽選", "※ 二分法に収まらない（要件充足でも受給できない）"),
]

# 判別力ゼロの定型句。見つけても根拠にしてはいけないので、警告として出す
USELESS = ["予算の範囲内", "先着順", "予算に達し", "適否を決定"]


def extract(path):
    """PDFからテキストを抜き、ページごとの画像数も返す"""
    import pypdf

    reader = pypdf.PdfReader(str(path))
    pages = []
    for p in reader.pages:
        try:
            text = p.extract_text() or ""
        except Exception as exc:  # 壊れたPDFでも他ページは読みたい
            text = ""
            print("  ページの抽出に失敗: %s" % exc, file=sys.stderr)
        try:
            n_img = len(list(p.images))
        except Exception:
            n_img = 0
        pages.append((text, n_img))
    return pages


def extract_fallback(path):
    """pypdf が文字化けするPDFを、別の実装で取り直す。

    川口市の企業立地補助金パンフレットのように、pypdf・pdfminer・pymupdf が
    そろって化けるのに pdftotext なら正常に読めるPDFが実在する（2026-08-17）。
    フォント埋め込みの都合で、実装ごとに得手不得手があるため順に試す。
    """
    # 1) pdftotext（poppler）。上記の実例で唯一成功した
    try:
        import subprocess

        out = subprocess.run(
            ["pdftotext", "-enc", "UTF-8", str(path), "-"],
            capture_output=True, timeout=120,
        )
        if out.returncode == 0:
            text = out.stdout.decode("utf-8", "replace")
            if japanese_ratio(text) >= 0.3:
                return text, "pdftotext"
    except Exception:
        pass
    # 2) pdfminer.six
    try:
        from pdfminer.high_level import extract_text as _mine

        text = _mine(str(path)) or ""
        if japanese_ratio(text) >= 0.3:
            return text, "pdfminer"
    except Exception:
        pass
    return "", ""


def vertical_ratio(text):
    """1〜2文字しかない行の比率。縦組みPDFの検出に使う。

    縦書きのPDFは1文字ずつ改行されて抽出されるため、キーワード検索が
    必ず0ヒットになる。しかも日本語比率は正常に見えるので、文字化けの
    検査をすり抜けて「証拠が無い＝josei」と誤判定する。
    横須賀市ICT支援のチラシが実例で、実在する「審査会にて承認」を
    検出できず josei と誤判定した（2026-08-17）。
    実測：正常なPDFは 0.02〜0.13、この縦組みチラシは 0.40〜0.67。
    """
    lines = [l for l in text.split("\n") if l.strip()]
    if not lines:
        return 0.0
    short = [l for l in lines if len(l.strip()) <= 2]
    return len(short) / len(lines)


def japanese_ratio(text):
    """日本語文字の比率。文字化けの検出に使う"""
    if not text:
        return 0.0
    ja = len(re.findall(r"[ぁ-んァ-ヶ一-龥]", text))
    return ja / len(text)


def encode_url(url):
    """URLに含まれる日本語などの非ASCII文字をパーセントエンコードする。

    自治体のPDFはファイル名が日本語のことがあり（実例:
    「R08.04.01_ICT活用等生産性向上支援事業要綱.pdf」「デジタル化・データ利活用
    推進助成金交付要綱（令和8年4月1日～）.pdf」）、素のまま urlopen に渡すと
    UnicodeEncodeError: 'ascii' codec can't encode で**取得自体が失敗する**。

    これを放置すると危険なのは、失敗が「証拠が取れなかった」ではなく
    「証拠が無い＝josei」として扱われかねないため。文字化けの偽陰性と同じ構造の
    罠で、2026-08-18の洗い直しで実際に2件（千葉市ICT・板橋区デジタル化）で発生した。

    ホスト名はIDNA、パス・クエリはUTF-8のパーセントエンコードで送る。
    既にエンコード済みの %xx は二重エンコードしない（safe に % を含める）。
    """
    parts = urllib.parse.urlsplit(url)
    try:
        host = parts.hostname.encode("idna").decode("ascii") if parts.hostname else ""
    except UnicodeError:
        host = parts.hostname or ""
    netloc = host
    if parts.port:
        netloc = f"{netloc}:{parts.port}"
    if parts.username:
        cred = parts.username + (f":{parts.password}" if parts.password else "")
        netloc = f"{cred}@{netloc}"
    return urllib.parse.urlunsplit((
        parts.scheme,
        netloc,
        urllib.parse.quote(parts.path, safe="/%"),
        urllib.parse.quote(parts.query, safe="=&%?+"),
        urllib.parse.quote(parts.fragment, safe="%"),
    ))


def fetch(src):
    """URLならダウンロードして一時ファイルに、ローカルパスならそのまま返す"""
    if not src.startswith("http"):
        return Path(src)
    url = encode_url(src)
    if url != src:
        print("  [注] URLに非ASCII文字があるためエンコードして取得します")
        print("       ", url)
    dest = Path("_evidence_tmp.pdf")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=60) as res, dest.open("wb") as fh:
        fh.write(res.read())
    return dest


def report(src):
    print("=" * 72)
    print(src)
    path = fetch(src)
    pages = extract(path)
    full = "".join(t for t, _ in pages)
    flat = re.sub(r"\s+", " ", full)

    ratio = japanese_ratio(full)
    img_only = [i + 1 for i, (t, n) in enumerate(pages) if len(t.strip()) < 20 and n]
    how = "pypdf"

    # pypdf が化けたら別実装で取り直す。ここで諦めると「読めていない」が
    # 「証拠が無い」に化けて、josei と誤判定する
    if ratio < 0.3:
        text, how = extract_fallback(path)
        if text:
            full = text
            flat = re.sub(r"\s+", " ", full)
            ratio = japanese_ratio(full)

    print("  ページ %d / 抽出文字 %d / 日本語比率 %.2f（%s）"
          % (len(pages), len(full), ratio, how or "抽出できず"))

    if ratio < 0.3:
        print("  ★ 文字化けの疑い。**この検索結果は証拠として使えない**")
        print("     0ヒットは『証拠が無い』ではなく『読めていない』可能性が高い。")
        print("     pdftotext・pdfminer でも復元できなかった。ページ画像を目視すること。")
        return False
    if img_only:
        print("  ※ 画像のみのページ: %s" % img_only)
        print("     様式が画像PDFのことがある。埋め込み画像を抽出して目視すること")

    # 文字間に空白を挟む組版（「三 鷹 商 工 会 中 小 企 業」）のPDFが実在し、
    # 素の検索では「審査」「採択」を取りこぼす。三鷹商工会の交付要綱が実例
    # （2026-08-17）。文字化けと同じで、0ヒットが「証拠が無い」に化ける。
    # 空白を全部落とした版でも探し、そちらでだけ当たったら警告する。
    packed = re.sub(r"\s+", "", full)

    hits = []
    for word, why in EVIDENCE:
        n = flat.count(word)
        n_packed = packed.count(word)
        if n:
            hits.append((word, why, n))
        elif n_packed:
            hits.append((word, why + "【空白除去後に検出】", n_packed))

    spaced = [w for w, _, _ in hits if packed.count(w) > flat.count(w)]
    if spaced:
        print("\n  ※ 文字間に空白を挟む組版のPDF。素の検索では取りこぼす")
        print("     （空白除去後にだけ当たった語: %s）" % "／".join(spaced))

    if hits:
        print("\n  ■ hojo（競争的採択）の証拠『候補』が見つかった:")
        for word, why, n in hits:
            print("    %s（%d回） … %s" % (word, n, why))
            for m in list(re.finditer(re.escape(word), flat))[:2]:
                s = flat[max(0, m.start() - 50):m.start() + 60].strip()
                print("        …%s…" % s)
        # ヒットしただけで hojo と決めない。語は同じでも意味が違う実例が続けて2件出た。
        #   世田谷区: 「（他制度の）採択を受けていないこと」＝重複受給の制限であって
        #             この制度自身の選考ではない（2026-08-17）
        #   目黒区等: 「書類審査」が不備確認の意味（→検出語から外した）
        print("\n    ※ 上の前後の文を必ず読むこと。その語が**この制度自身の選考**を")
        print("       指しているか確認する。他制度との重複受給の制限（『〜の採択を")
        print("       受けていないこと』）や、経費名（『審査請求料』）で当たることがある")
    else:
        vr = vertical_ratio(full)
        if vr >= 0.25:
            # 縦組みは日本語比率が正常に見えるので、文字化けの検査をすり抜ける。
            # ここで止めないと「証拠なし＝josei」と誤判定する（横須賀市ICTで実際に誤った）
            print("\n  ★ 縦組みPDFの疑い（1〜2文字だけの行が %d%%）。" % round(vr * 100))
            print("     **この0ヒットは信用できない。** 縦書きは1文字ずつ改行されて")
            print("     抽出されるため、キーワード検索は必ず0ヒットになる。")
            print("     日本語比率が正常でも関係ない。全文を目視すること。")
            print("     実例：横須賀市ICT支援のチラシは、実在する『審査会にて承認』を")
            print("     検出できず josei と誤判定した（2026-08-17）")
            return False
        print("\n  ■ hojo の証拠は見つからなかった → josei と判定してよい")
        print("     （日本語比率 %.2f で抽出は生きているので、0ヒットは信用できる）" % ratio)
        # ただし「読んでいる文書が公募要領ではない」場合も0件になる。中小企業成長
        # 加速化補助金では、サイトの application_guideline.pdf が補助金の公募要領では
        # なく前提制度「100億宣言」の申請要領で、これを読んで josei と誤判定しかけた
        # （2026-08-17）。正しい要領（archive/2nd_kobo.pdf）では採択36回・審査会2回。
        # 分量が少ないのに証拠0件のときは、まず文書の種類を疑う。
        if len(full) < 20000:
            print("\n     ★ 抽出 %d 文字と短い。**そもそも公募要領を読んでいるか**確認すること。" % len(full))
            print("        前提制度の申請要領・チラシ・概要版を掴んでいると0件になる。")
            print("        冒頭のタイトルを目視し、審査の節が含まれているか確かめる")

    # 「先着順ではありません」は否定形。これがあれば競争審査型とほぼ確定するので、
    # 「先着順」の部分一致に埋もれさせず独立して出す
    if "先着順ではありません" in flat or "先着順ではございません" in flat:
        print("\n  ★ 「先着順ではありません」と明記されている → 締切一括の競争審査型")

    useless = [w for w in USELESS if w in flat]
    if useless:
        print("\n  ※ 判別力ゼロの定型句あり: %s" % "／".join(useless))
        print("     これらを判定の根拠にしないこと。競争型の要綱にも入っている")
        if "先着順" in useless:
            # 埼玉県省力化支援【設備更新】の実例（2026-08-17）。「選定方法：先着順」
            # 「先着順で決定します」が3箇所あるが、それは併設の専門家派遣（無料コンサル、
            # 140件枠）の話で、補助金本体は「先着順ではありません」だった。
            print("     ※ その『先着順』が補助金本体の話か確認すること。併設の")
            print("        専門家派遣・セミナー等の枠が先着順なだけ、という制度が実在する")
    return True


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return 1
    for src in sys.argv[1:]:
        try:
            report(src)
        except Exception as exc:
            print("  取得・解析に失敗: %s" % exc)
            print("  ★ 失敗を『証拠なし』と読まないこと")
    return 0


if __name__ == "__main__":
    sys.exit(main())

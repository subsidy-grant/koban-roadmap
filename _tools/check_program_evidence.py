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


def japanese_ratio(text):
    """日本語文字の比率。文字化けの検出に使う"""
    if not text:
        return 0.0
    ja = len(re.findall(r"[ぁ-んァ-ヶ一-龥]", text))
    return ja / len(text)


def fetch(src):
    """URLならダウンロードして一時ファイルに、ローカルパスならそのまま返す"""
    if not src.startswith("http"):
        return Path(src)
    dest = Path("_evidence_tmp.pdf")
    req = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0"})
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

    print("  ページ %d / 抽出文字 %d / 日本語比率 %.2f" % (len(pages), len(full), ratio))

    if ratio < 0.3:
        print("  ★ 文字化けの疑い。**この検索結果は証拠として使えない**")
        print("     0ヒットは『証拠が無い』ではなく『読めていない』可能性が高い。")
        print("     pdfminer.six で取り直すか、ページ画像を目視すること。")
        return False
    if img_only:
        print("  ※ 画像のみのページ: %s" % img_only)
        print("     様式が画像PDFのことがある。埋め込み画像を抽出して目視すること")

    hits = []
    for word, why in EVIDENCE:
        n = flat.count(word)
        if n:
            hits.append((word, why, n))

    if hits:
        print("\n  ■ hojo（競争的採択）の証拠が見つかった:")
        for word, why, n in hits:
            print("    %s（%d回） … %s" % (word, n, why))
            for m in list(re.finditer(re.escape(word), flat))[:2]:
                s = flat[max(0, m.start() - 50):m.start() + 60].strip()
                print("        …%s…" % s)
    else:
        print("\n  ■ hojo の証拠は見つからなかった → josei と判定してよい")
        print("     （日本語比率 %.2f で抽出は生きているので、0ヒットは信用できる）" % ratio)

    useless = [w for w in USELESS if w in flat]
    if useless:
        print("\n  ※ 判別力ゼロの定型句あり: %s" % "／".join(useless))
        print("     これらを判定の根拠にしないこと。競争型の要綱にも入っている")
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

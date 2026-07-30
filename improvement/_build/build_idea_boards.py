# -*- coding: utf-8 -*-
"""宿泊・製造・不動産・教育の「○○業×AI 1000案 PDCA評価ダッシュボード」を生成する。

food/pdca.html(手書き)と同型のページを、業種ごとの設定(色・業態・部門・制度・
採択候補の理由文)から生成する。beauty/food は既存の手書き版を正とし、
本スクリプトの対象外(BOARDS に含めない)。

■ food版との最重要の違い(正直さの設計)
  この4業種には「改善計画10選」(事業計画書・プロトタイプ)がまだ無い。
  そのため TOP10 は「採択済み」ではなく **本ボードの5軸評価による採択候補** と
  表示し、ヘッダー・ファネル・フッターの3箇所で明示する。
  改善計画10選が整備されたら、food版と同じ「採択済みと同一」方式に更新すること
  (ideas.js の star 割当と RATIONALE のリンクも合わせて更新する)。

■ 可読性・操作性の下限(2026-07-29 の公開版方針)
  本文14px以上・操作要素44px以上・コントラストAA。主要な色ペアは
  スクリプト内で比率を計算し、4.5:1 未満があれば生成を中断する。

実行: python3 build_idea_boards.py   (冪等)
実行後は add_analytics.py を再実行して解析タグを注入すること。
"""
import io
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
IMPROVEMENT = os.path.abspath(os.path.join(HERE, ".."))

# ---------------------------------------------------------------- 業種設定
# schemes: (キー=ideas.jsのscheme値, 正式名, 一覧表用の短縮名, バッジ色クラス)
# rationale: TOP10候補の選定理由(5軸の観点からの言い直し。断定ではなく候補である前提の文)
BOARDS = {
"lodging": {
    "label": "宿泊業",
    "segline": "ビジネスホテル/旅館/リゾート/ゲストハウス/民宿・ペンション",
    "stage1_areas": "フロント・チェックイン自動化、客室清掃・リネン管理",
    "accent": "#34606d", "accent2": "#3e6b4f",
    "bg": "#f1f4f5", "ink": "#20292c", "sub": "#5c6b70", "line": "#dbe3e5",
    "hdr_from": "#1c2b30", "hdr_to": "#2e5560",
    "th_bg": "#e4ebec", "th_hover": "#d7e2e4", "hover": "#f6f9f9", "why_bg": "#f2f6f7", "link_hover": "#e8f0f1",
    "depts": ["フロント", "客室・清掃", "料飲・館内", "バックオフィス", "集客・企画"],
    "schemes": [
        ("デジタル",   "デジタル化・AI導入補助金2026",            "デジタル化・AI導入", "b1"),
        ("カタログ",   "中小企業省力化投資補助金",                "省力化投資",         "b2"),
        ("業務改善",   "業務改善助成金",                          "業務改善",           "b3"),
        ("持続化",     "小規模事業者持続化補助金",                "持続化",             "b4"),
        ("観光省力化", "観光庁 省力化投資補助事業",               "観光庁省力化",       "b5"),
    ],
    "act_desc": "デジタル化・AI導入3案/省力化投資2案/観光庁省力化2案/業務改善2案/持続化1案の候補構成。",
    "rationale": {
        1: "チェックイン対応はフロント最大の定型業務。名簿・精算まで一体で置き換えられ、ピーク行列の解消と夜間省人化の両方に効く。省力化と補助金適合がともに最高水準。",
        2: "OTA在庫の手動調整はダブルブッキング事故と隣り合わせ。一元化は全予約業務の土台になり、以降のDX(料金最適化・CRM)の前提インフラにもなる。",
        3: "清掃状況の電話連絡・紙チェック表は毎日発生する反復コスト。リアルタイム共有はアーリーイン販売の原資にもなり、効果が客室数に比例して伸びる。",
        4: "多言語問い合わせは属人対応の限界が早い。24時間AI応対は訪日需要の取りこぼし防止と深夜対応の削減を同時に実現し、差別化スコアも高い。",
        5: "料金設定は収益への影響が最大の意思決定。AIの日次自動調整は繁忙期の取りこぼしと閑散期の安売りを防ぎ、導入効果が売上に直接現れる。",
        6: "共用部清掃は深夜・早朝の負担が重い定常業務。ロボット化は省力化カタログ的な定番投資で、清掃員を客室整備に集中させられる。",
        7: "朝食会場はピークが鋭く増員で解くと採算が合わない。配膳ロボットは実績報告に強い「配膳回数」で効果が残り、補助金適合も高い。",
        8: "変形労働・夜勤を含むシフト作成と勤怠集計は管理職の最大負荷。クラウド化は労基対応の記録も同時に整い、賃上げ原資の生産性向上に直結する。",
        9: "光熱費はコスト構造の中で削減余地が最も確実な費目。高効率設備への更新は業務改善助成金と相性がよく、客室の快適性クレームも減らせる。",
        10: "OTA時代の集客は口コミ返信の質と速度が露出を左右する。AI返信は少人数でも全件返信を維持でき、市場性・差別化の評価が高い。",
    },
},
"manufacturing": {
    "label": "製造業",
    "segline": "金属加工/食品製造/樹脂成形/機械組立/印刷・パッケージ",
    "stage1_areas": "設備稼働のIoT監視、検査工程の自動化",
    "accent": "#46557a", "accent2": "#3e6b4f",
    "bg": "#f2f3f6", "ink": "#232733", "sub": "#616880", "line": "#dde0e8",
    "hdr_from": "#20242e", "hdr_to": "#3a4a63",
    "th_bg": "#e6e8ee", "th_hover": "#dadde7", "hover": "#f7f8fa", "why_bg": "#f3f4f8", "link_hover": "#eaecf3",
    "depts": ["製造現場", "生産管理", "品質・検査", "バックオフィス", "営業・販路"],
    "schemes": [
        ("デジタル",   "デジタル化・AI導入補助金2026",                  "デジタル化・AI導入", "b1"),
        ("省力化",     "中小企業省力化投資補助金",                      "省力化投資",         "b2"),
        ("業務改善",   "業務改善助成金",                                "業務改善",           "b3"),
        ("持続化",     "小規模事業者持続化補助金",                      "持続化",             "b4"),
        ("ものづくり", "新事業進出・ものづくり商業サービス補助金",      "ものづくり",         "b5"),
    ],
    "act_desc": "デジタル化・AI導入5案/省力化投資2案/ものづくり1案/業務改善1案/持続化1案の候補構成。",
    "rationale": {
        1: "「どの設備がなぜ止まったか」を数値で掴めないと他の改善が始まらない。後付けセンサーは既存設備のまま導入でき、投資額に対する情報量が最大。",
        2: "目視検査は人手不足と品質ばらつきの二重苦。AI外観検査は全数化・記録化まで含めて効き、ものづくり補助金の代表的な投資テーマでもある。",
        3: "ワーク着脱は熟練を要さない反復作業の典型。協働ロボットで1人複数台持ちと夜間無人運転が実現し、省力化時間の絶対量が最も大きい。",
        4: "Excel・ホワイトボード・口頭に分散した生産情報の一元化は、納期遅延と進捗確認往復の根本対策。以降の原価・在庫DXの土台になる。",
        5: "見積は受注の入口であり赤字の入口でもある。図面AI読み取り+類似実績参照は回答速度と採算精度を同時に上げ、差別化評価が最も高い。",
        6: "突発故障は納期・修理費・信用の三重損失。振動・電流の予兆検知で計画停止に置き換え、保全の属人化も解消する。",
        7: "工程間搬送は付加価値ゼロの歩行時間。AGV/AMRは省力化投資の定番で、搬送記録が自動で残るため効果測定も容易。",
        8: "熟練者の退職はノウハウの消失事故。動画マニュアル化は退職前に打てる唯一の保険で、新人の独り立ち期間短縮としても効果が測れる。",
        9: "エネルギーコストは売価転嫁しにくい固定負担。高効率設備への更新は削減額が確実に出る投資で、業務改善助成金の生産性要件にも合う。",
        10: "技術力があっても知られなければ引き合いは来ない。事例サイトの整備は営業人員を増やさない販路開拓で、持続化補助金の典型テーマ。",
    },
},
"realestate": {
    "label": "不動産業、物品賃貸業",
    "segline": "賃貸仲介/売買仲介/賃貸管理/ビル管理/物品賃貸",
    "stage1_areas": "電子契約・IT重説、内見・VR案内の効率化",
    "accent": "#3e6b4f", "accent2": "#4a6b8a",
    "bg": "#f2f5f2", "ink": "#222b24", "sub": "#5e6b60", "line": "#dde4dd",
    "hdr_from": "#1e2b22", "hdr_to": "#35573f",
    "th_bg": "#e6ece6", "th_hover": "#dae3da", "hover": "#f7faf7", "why_bg": "#f3f7f3", "link_hover": "#eaf1ea",
    "depts": ["営業・仲介", "管理・入居者対応", "バックオフィス", "店舗・集客", "レンタル業務"],
    "schemes": [
        ("デジタル", "デジタル化・AI導入補助金2026",   "デジタル化・AI導入", "b1"),
        ("省力化",   "中小企業省力化投資補助金",       "省力化投資",         "b2"),
        ("業務改善", "業務改善助成金",                 "業務改善",           "b3"),
        ("持続化",   "小規模事業者持続化補助金",       "持続化",             "b4"),
        ("人材開発", "人材開発支援助成金",             "人材開発",           "b5"),
    ],
    "act_desc": "デジタル化・AI導入6案/省力化投資2案/業務改善1案/人材開発1案の候補構成。",
    "rationale": {
        1: "契約・重説は全取引で必ず発生する最重量の事務。電子化は来店調整・製本・印紙まで一括で削減し、業界の法整備も追い風。市場性・省力化とも最高水準。",
        2: "内見同行は1件ごとに往復時間を食う代表的な拘束業務。スマートロックのセルフ内見は案内工数を減らしながら内見件数を増やす、数少ない攻守両得の投資。",
        3: "反響への一次返信速度は成約率を左右する最大要因。AI自動返信は繁忙期の深夜反響も数分で返し、追客漏れの失注を構造的になくす。",
        4: "現地案内の前にVRで絞り込めれば、客も店も移動時間を失わない。遠方客・法人転勤需要への対応力がつき、掲載物件の訴求力も上がる。",
        5: "入居者対応は夜間・休日に集中する消耗戦。AIの24時間一次対応と緊急度仕分けで、管理担当の呼び出し負担とクレーム化を同時に減らす。",
        6: "査定は媒介獲得の勝負所。AI査定書は訪問前の提案品質を底上げし、経験の浅い担当でも根拠ある価格提示ができるようになる。",
        7: "レンタル在庫の所在不明・二重貸しは直接の売上損失。タグ管理は棚卸しの数え直しをなくし、保有台数の最適化まで踏み込める。",
        8: "オーナーへの報告品質は管理契約の解約率に直結する。ポータル化は報告業務を削減しながら透明性を上げる、守りと攻めを兼ねた投資。",
        9: "宅建士の確保は事業拡大の法的な前提条件。資格取得支援は人材開発支援助成金で費用を抑えられ、採用競争力にもなる。",
        10: "店舗・現場が分散する業態の勤怠集計は毎月の確実な負荷。クラウド化は締め作業を数時間に短縮し、直行直帰の働き方も支える。",
    },
},
"education": {
    "label": "教育、学習支援業",
    "segline": "個別指導塾/集団塾・予備校/英会話・語学/音楽・文化/プログラミング",
    "stage1_areas": "生徒・保護者管理、決済・会計の効率化",
    "accent": "#63396a", "accent2": "#3e6b4f",
    "bg": "#f5f2f6", "ink": "#2a2430", "sub": "#6a5f72", "line": "#e4dde7",
    "hdr_from": "#262031", "hdr_to": "#4a3a5e",
    "th_bg": "#ebe5ee", "th_hover": "#e0d7e4", "hover": "#f9f6fa", "why_bg": "#f6f2f8", "link_hover": "#f0e9f2",
    "depts": ["授業・指導", "教務・生徒管理", "バックオフィス", "集客・広報", "教室環境"],
    "schemes": [
        ("デジタル", "デジタル化・AI導入補助金2026",   "デジタル化・AI導入", "b1"),
        ("省力化",   "中小企業省力化投資補助金",       "省力化投資",         "b2"),
        ("業務改善", "業務改善助成金",                 "業務改善",           "b3"),
        ("持続化",   "小規模事業者持続化補助金",       "持続化",             "b4"),
        ("人材開発", "人材開発支援助成金",             "人材開発",           "b5"),
    ],
    "act_desc": "デジタル化・AI導入5案/省力化投資1案/持続化2案/業務改善1案/人材開発1案の候補構成。",
    "rationale": {
        1: "紙カルテと記憶頼みの生徒管理は、教室長の事務時間と引き継ぎ事故の源泉。一元化は以降の出欠・請求・面談DXすべての土台になる。",
        2: "入退室通知は保護者の安心感という入会動機に直結する数少ない設備投資。安全確認の電話をなくす省力化と、選ばれる理由づくりを兼ねる。",
        3: "授業料の集金・督促は心理的負担が最も重い事務。決済自動化は未収の早期発見と月末集計の圧縮でバックオフィスを数人分軽くする。",
        4: "振替調整は電話とパズルの反復作業で、対応差がクレームにもなる。オンライン化は保護者の利便性と消化管理の正確さを同時に得る。",
        5: "弱点分析と学習計画は講師の経験差が最も出る領域。AI分析は指導品質を平準化し、成果の説明力(面談・継続率)を引き上げる。",
        6: "プリント作成は授業外残業の常連。AI作問は類題の量産で演習量を確保しながら、教材準備の時間をほぼゼロにする。",
        7: "体験申込は入会の唯一の入口。LP改善と申込動線の最適化は、同じ広告費で入会数を増やす最も費用対効果の高い一手。",
        8: "商圏という物理制約を外せるのはオンラインコースだけ。不登校・遠方・海外の需要を受けられ、教室の空き時間も収益化できる。",
        9: "コマ給・事務給が混在する講師給与は毎月の計算事故リスク。クラウド化は締め作業を圧縮し、代講手配の混乱も減らす。",
        10: "授業品質は講師で決まるが、研修は後回しにされがち。体系化は人材開発支援助成金で費用を抑えられ、講師の定着にも効く。",
    },
},
}

# 制度バッジの配色(全業種共通のスロット。テキスト色は wash 背景上でAAを満たす値)
BADGE_STYLES = {
    "b1": ("#4a6b8a", "#edf2f7"),
    "b2": ("#3e6b4f", "#eef5f0"),
    "b3": ("#7a5a17", "#fbf4e3"),
    "b4": ("#a4453c", "#f9edeb"),
    "b5": ("#2f6260", "#eaf4f3"),
}
STAGE_COLORS = {"top": "#a4453c", "c": "#8a6208", "p": "#4a6480"}


# ---------------------------------------------------------------- コントラスト検査
def _lum(hexcolor):
    h = hexcolor.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
    f = lambda v: v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(a, b):
    la, lb = _lum(a), _lum(b)
    return (max(la, lb) + 0.05) / (min(la, lb) + 0.05)


def assert_contrast(cfg, ind):
    checks = [
        ("本文subタイトル/card", cfg["sub"], "#ffffff", 4.5),
        ("ink/bg", cfg["ink"], cfg["bg"], 4.5),
        ("accent白抜き(rankピル)", "#ffffff", cfg["accent"], 4.5),
        ("ヘッダー白文字(暗側)", "#f5f1ea", cfg["hdr_to"], 4.5),
    ]
    for name, hexes in BADGE_STYLES.items():
        checks.append((f"badge {name}", hexes[0], hexes[1], 4.5))
    for key, c in STAGE_COLORS.items():
        checks.append((f"stage {key} 白抜き", "#ffffff", c, 4.5))
    bad = [(n, f, b, ratio(f, b)) for n, f, b, need in checks if ratio(f, b) < need]
    if bad:
        for n, f, b, r in bad:
            print(f"  !! {ind}: コントラスト不足 {n} {f} on {b} = {r:.2f}")
        raise SystemExit(1)


# ---------------------------------------------------------------- ページ生成
def build_page(ind, cfg):
    scheme_options = "\n".join(
        f'      <option value="{k}">{full}</option>' for k, full, _s, _c in cfg["schemes"])
    scheme_badge = ",\n".join(
        f'  "{k}": \'<span class="badge {cls}">{full}</span>\'' for k, full, _s, cls in cfg["schemes"])
    scheme_short = ", ".join(f'"{k}": "{short}"' for k, full, short, _c in cfg["schemes"])
    dept_options = "".join(f"<option>{d}</option>" for d in cfg["depts"])
    badge_css = "\n".join(
        f"  .{cls}{{color:{fg};border-color:{fg};background:{bg}}}"
        for cls, (fg, bg) in BADGE_STYLES.items())
    rationale = "\n".join(f'  {n}:{{why:"{w}"}},' for n, w in sorted(cfg["rationale"].items()))
    label = cfg["label"]

    return f"""<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>PDCA評価ダッシュボード | {label}×AI 1000案</title>
<style>
  /* food/pdca.html と同型。build_idea_boards.py が生成(手編集しないこと) */
  :root{{
    --bg:{cfg["bg"]}; --card:#ffffff; --ink:{cfg["ink"]}; --sub:{cfg["sub"]}; --line:{cfg["line"]};
    --accent:{cfg["accent"]}; --accent2:{cfg["accent2"]}; --gold:#8a6208; --red:#a4453c;
  }}
  *{{margin:0;padding:0;box-sizing:border-box}}
  body{{font-family:"Noto Sans JP","Yu Gothic UI",sans-serif;background:var(--bg);color:var(--ink);line-height:1.6}}
  header{{background:linear-gradient(135deg,{cfg["hdr_from"]},{cfg["hdr_to"]});color:#f5f1ea;padding:28px 24px}}
  header h1{{font-size:22px;font-weight:700}}
  header p{{font-size:14.5px;opacity:.92;margin-top:6px}}
  .wrap{{max-width:1200px;margin:0 auto;padding:20px}}
  /* PDCAファネル */
  .funnel{{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:18px 0}}
  .stage{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;position:relative}}
  .stage .ph{{font-size:12px;font-weight:700;letter-spacing:.12em;color:#fff;display:inline-block;padding:2px 10px;border-radius:99px;margin-bottom:8px}}
  .stage .num{{font-size:30px;font-weight:800}}
  .stage .lbl{{font-size:13.5px;color:var(--sub)}}
  .stage .desc{{font-size:12.5px;color:var(--sub);margin-top:6px;border-top:1px dashed var(--line);padding-top:6px}}
  .s-p .ph{{background:{STAGE_COLORS["p"]}}}.s-d .ph{{background:#3e6b4f}}.s-c .ph{{background:{STAGE_COLORS["c"]}}}.s-a .ph{{background:{STAGE_COLORS["top"]}}}
  /* TOP10候補 */
  h2{{font-size:17px;margin:26px 0 10px;border-left:5px solid var(--accent);padding-left:10px}}
  .topnote{{font-size:13.5px;color:var(--sub);background:var(--card);border:1px dashed var(--line);border-radius:10px;padding:10px 14px;margin:0 0 12px}}
  .topgrid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:12px}}
  .tcard{{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px;display:flex;flex-direction:column;gap:8px}}
  .tcard .rank{{font-size:12px;font-weight:800;color:#fff;background:var(--accent);border-radius:99px;padding:2px 10px;display:inline-block}}
  .tcard h3{{font-size:15px}}
  .tcard .why{{font-size:12px;color:var(--sub);background:{cfg["why_bg"]};border-radius:8px;padding:8px}}
  .badge{{font-size:11px;font-weight:700;padding:2px 8px;border-radius:99px;border:1px solid}}
{badge_css}
  /* 5軸スコアは5角形レーダーチャートで表示する(beauty/food版と同じ描画) */
  .scorewrap{{display:flex;gap:10px;align-items:center;flex-wrap:wrap}}
  .radarbox{{flex:0 0 auto;width:210px;max-width:100%;margin:0 auto}}
  .radar{{width:100%;height:auto;display:block}}
  .radar .rlbl{{font-size:11.5px;fill:var(--sub)}}
  .radar .rval{{font-size:13px;font-weight:800;fill:var(--ink)}}
  .radar .grid{{fill:none;stroke:var(--line)}}
  .radar .shape{{fill:var(--accent);fill-opacity:.17;stroke:var(--accent);stroke-width:2;stroke-linejoin:round}}
  .radar .dot{{fill:var(--accent)}}
  .tot{{text-align:center;font-size:11px;color:var(--sub);margin-top:-2px}}
  .tot b{{font-size:15px;color:var(--ink)}}
  .scorewrap .why{{flex:1 1 190px;margin:0}}
  .links{{display:flex;gap:8px;font-size:12px;flex-wrap:wrap}}
  .links a{{color:var(--accent);font-weight:700;text-decoration:none;border:1px solid var(--line);border-radius:8px;padding:4px 10px;background:#fff}}
  .links a:hover{{background:{cfg["link_hover"]}}}
  /* フィルタ+表 */
  .filters{{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0;align-items:center}}
  select,input[type=search]{{font:inherit;font-size:14.5px;padding:7px 10px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--ink);min-height:2.6rem}}
  input[type=search]{{flex:1;min-width:200px}}
  .count{{font-size:12px;color:var(--sub)}}
  table{{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:12px;overflow:hidden;font-size:14px}}
  th{{background:{cfg["th_bg"]};text-align:left;padding:8px 10px;font-size:12px;cursor:pointer;user-select:none;white-space:nowrap}}
  th:hover{{background:{cfg["th_hover"]}}}
  td{{padding:8px 10px;border-top:1px solid var(--line);vertical-align:top}}
  tr:hover td{{background:{cfg["hover"]}}}
  .stg{{font-size:11.5px;font-weight:700;padding:1px 7px;border-radius:99px;white-space:nowrap}}
  .stg-top{{background:{STAGE_COLORS["top"]};color:#fff}}.stg-c{{background:{STAGE_COLORS["c"]};color:#fff}}
  .stg-p{{background:{STAGE_COLORS["p"]};color:#fff}}.stg-0{{background:var(--line);color:var(--sub)}}
  .pager{{display:flex;gap:8px;justify-content:center;margin:14px 0;align-items:center;font-size:13px}}
  .pager button{{font:inherit;padding:6px 16px;border:1px solid var(--line);border-radius:8px;background:#fff;cursor:pointer;min-height:2.6rem;font-size:14.5px}}
  .pager button:disabled{{opacity:.4;cursor:default}}
  footer{{text-align:center;font-size:11px;color:var(--sub);padding:24px}}
  .rdesc{{color:var(--sub)}}
  a:focus-visible,button:focus-visible,select:focus-visible,input:focus-visible{{
    outline:3px solid var(--accent);outline-offset:2px;border-radius:3px}}
  /* 狭い画面: ページ全体を横スクロールさせず、表だけを .twrap 内でスクロールさせる */
  .twrap{{overflow-x:auto}}
  @media (max-width:760px){{
    .twrap table{{min-width:820px}}
    .rdesc{{display:none}}
    .funnel{{grid-template-columns:repeat(2,1fr)}}
    .topgrid{{grid-template-columns:1fr}}
  }}
  /* リンクの当たり判定を44px以上に */
  .back a,.tcard .links a,.links a{{display:inline-flex;align-items:center;min-height:2.6rem}}
  .back{{display:flex;flex-wrap:wrap;align-items:center;gap:0 .4rem}}
</style>
</head>
<body>
<p class="back" style="max-width:1200px;margin:14px auto 0;padding:0 24px;font-size:14px;"><a href="../index.html" style="color:{cfg["accent"]};font-weight:700;text-decoration:none;">← 改善計画10選へ戻る</a> ／ <a href="../../index.html#improvement-cta" style="color:{cfg["accent"]};font-weight:700;text-decoration:none;">ロードマップ本体へ</a> ／ <a href="../pdca.html" style="color:{cfg["accent"]};font-weight:700;text-decoration:none;">📊 選定の考え方（100施策スコアリング）</a></p>
<header>
  <h1>{label}×AI システム 1000案 — PDCA評価ダッシュボード</h1>
  <p>20カテゴリ × 10コア機能 × 5業態({cfg["segline"]})。5軸スコア(市場性・省力化度・実現性・補助金適合・差別化)でPlan→Do→Check→Actの絞り込みを実施。<b>この業種の「改善計画10選」(事業計画書・プロトタイプ付き)はまだ準備中のため、本ボードのTOP10はその選定に向けた採択候補です</b>。候補は「選定の考え方」に記録した100施策スコアリングの上位領域({cfg["stage1_areas"]})と整合するよう選んでいます。</p>
</header>
<div class="wrap">

  <div class="funnel">
    <div class="stage s-p"><span class="ph">PLAN</span><div class="num">1,000<span style="font-size:13px">案</span></div>
      <div class="lbl">アイデア発散プール</div>
      <div class="desc">業務フロー20領域×5業態を網羅生成。重複・非現実案も許容する発散フェーズ。</div></div>
    <div class="stage s-d"><span class="ph">DO</span><div class="num">100<span style="font-size:13px">案</span></div>
      <div class="lbl">一次選抜(スコア上位)</div>
      <div class="desc">5軸合計スコアで足切り。市場性2点台・実現性2点台の案はここで落選。</div></div>
    <div class="stage s-c"><span class="ph">CHECK</span><div class="num">30<span style="font-size:13px">案</span></div>
      <div class="lbl">導入実現性の評価</div>
      <div class="desc">導入コスト・既製品の有無・{label}の現場適合性を検証し3割まで圧縮。</div></div>
    <div class="stage s-a"><span class="ph">ACT</span><div class="num">10<span style="font-size:13px">案</span></div>
      <div class="lbl">採択候補(計画書は準備中)</div>
      <div class="desc">{cfg["act_desc"]}</div></div>
  </div>

  <h2>TOP10 採択候補</h2>
  <p class="topnote">この10案は本ボードの5軸評価による<b>採択候補</b>です。{label}の事業計画書・プロトタイプは準備中で、美容業・飲食業のような「採択済み10選」はまだありません。整備され次第、このページを採択済みの内容に更新します。機械スコアリングの全記録は<a href="../pdca.html" style="color:var(--accent);font-weight:700;">選定の考え方</a>をご覧ください。</p>
  <div class="topgrid" id="topgrid"></div>

  <h2>全1000案ブラウザ</h2>
  <div class="filters">
    <input type="search" id="q" aria-label="キーワードで絞り込む" placeholder="キーワード検索(タイトル・説明)">
    <select id="fCat" aria-label="カテゴリで絞り込む"><option value="">全カテゴリ</option></select>
    <select id="fSeg" aria-label="業態で絞り込む"><option value="">全業態</option></select>
    <select id="fDept" aria-label="部門で絞り込む"><option value="">全部門</option>{dept_options}</select>
    <select id="fStage" aria-label="選定ステージで絞り込む"><option value="">全ステージ</option>
      <option>TOP10候補</option><option>C通過(30選)</option><option>P通過(100選)</option><option>初期プール</option></select>
    <select id="fScheme" aria-label="活用制度で絞り込む"><option value="">全制度</option>
{scheme_options}</select>
    <span class="count" id="count"></span>
  </div>
  <div class="twrap">
  <table>
    <thead><tr>
      <th data-k="rank">順位</th><th data-k="title">タイトル</th><th data-k="category">カテゴリ</th>
      <th data-k="dept">部門</th><th data-k="segment">業態</th><th data-k="savingHoursPerMonth">省力化 h/月</th>
      <th data-k="total">総合</th><th data-k="stage">ステージ</th><th data-k="scheme">制度</th>
    </tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  </div>
  <div class="pager">
    <button id="prev">前へ</button><span id="pinfo"></span><button id="next">次へ</button>
  </div>
</div>
<footer>koban-roadmap {label}×AI 1000案 / スコアは決定的シードによる机上評価(実データでの再評価を推奨)。TOP10は本ボードの5軸評価による採択候補であり、確定した採択ではありません。100施策の機械スコアリングは<a href="../pdca.html" style="color:var(--accent)">選定の考え方</a>参照。</footer>

<script src="ideas.js"></script>
<script>
// TOP10候補の選定理由(5軸の観点からの評価コメント)。
// ※この業種の改善計画10選は準備中のため、プロトタイプ・計画書リンクは無い。
//   整備後は food/pdca.html と同じ形式(proto/plan/xlsxリンク付き)に更新すること。
const RATIONALE = {{
{rationale}
}};

const SCHEME_BADGE = {{
{scheme_badge}
}};
const SCHEME_SHORT = {{ {scheme_short} }};

const AX = [["market","市場性"],["saving","省力化"],["feasibility","実現性"],["subsidy","補助金"],["unique","差別化"]];
const AX_MAX = 5;

// 5軸スコアの5角形レーダーチャート。頂点は真上から時計回りにAXの順。
function radarChart(score) {{
  const W = 240, H = 184, cx = W / 2, cy = H / 2 - 1, R = 48, LR = R + 14;
  const pt = (i, r) => {{
    const a = -Math.PI / 2 + i * 2 * Math.PI / AX.length;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  }};
  const poly = r => AX.map((_, i) => pt(i, r).map(n => n.toFixed(1)).join(",")).join(" ");
  let grid = "";
  for (let lv = 1; lv <= AX_MAX; lv++) {{
    grid += `<polygon class="grid" points="${{poly(R * lv / AX_MAX)}}"${{lv === AX_MAX ? "" : ' stroke-dasharray="2 3"'}}/>`;
  }}
  grid += AX.map((_, i) => {{
    const [x, y] = pt(i, R);
    return `<line class="grid" x1="${{cx}}" y1="${{cy}}" x2="${{x.toFixed(1)}}" y2="${{y.toFixed(1)}}"/>`;
  }}).join("");
  const vals = AX.map(([k]) => Math.max(0, Math.min(AX_MAX, Number(score[k]) || 0)));
  const shape = vals.map((v, i) => pt(i, R * v / AX_MAX).map(n => n.toFixed(1)).join(",")).join(" ");
  const dots = vals.map((v, i) => {{
    const [x, y] = pt(i, R * v / AX_MAX);
    return `<circle class="dot" cx="${{x.toFixed(1)}}" cy="${{y.toFixed(1)}}" r="2.6"/>`;
  }}).join("");
  const labels = AX.map(([, l], i) => {{
    const [x, y] = pt(i, LR), dx = x - cx;
    const anchor = Math.abs(dx) < 6 ? "middle" : (dx > 0 ? "start" : "end");
    const dy = y < cy - 10 ? -1 : (y > cy + 10 ? 10 : 4);
    return `<text class="rlbl" x="${{x.toFixed(1)}}" y="${{(y + dy).toFixed(1)}}" text-anchor="${{anchor}}">`
         + `${{l}}<tspan class="rval" dx="3">${{vals[i]}}</tspan></text>`;
  }}).join("");
  const alt = AX.map(([, l], i) => `${{l}}${{vals[i]}}点`).join("、");
  return `<svg class="radar" viewBox="0 0 ${{W}} ${{H}}" role="img" aria-label="5軸スコア（各5点満点）：${{alt}}">`
       + `${{grid}}<polygon class="shape" points="${{shape}}"/>${{dots}}${{labels}}</svg>`;
}}

// TOP10候補カード(計画書・プロトタイプは準備中のためリンクは選定記録のみ)
document.getElementById("topgrid").innerHTML = TOP10.map(t => {{
  const r = RATIONALE[t.topRank] || {{}};
  return `<div class="tcard">
    <div><span class="rank">候補 No.${{t.topRank}}</span> ${{SCHEME_BADGE[t.scheme] || ""}}</div>
    <h3>${{t.title}}</h3>
    <div style="font-size:12px">${{t.description}}</div>
    <div class="scorewrap">
      <div class="radarbox">${{radarChart(t.score)}}<div class="tot">総合 <b>${{t.total}}</b>/25</div></div>
      <div class="why"><b>候補理由:</b> ${{r.why||""}}</div>
    </div>
    <div style="font-size:11px;color:var(--sub)">想定省力化: 約${{t.savingHoursPerMonth}}時間/月（${{t.dept}}）</div>
  </div>`;
}}).join("");

// フィルタ初期化
const fCat = document.getElementById("fCat"), fSeg = document.getElementById("fSeg");
CATEGORIES.forEach(c => fCat.insertAdjacentHTML("beforeend", `<option>${{c.name}}</option>`));
SEGMENTS.forEach(s => fSeg.insertAdjacentHTML("beforeend", `<option>${{s.name}}</option>`));

let sortKey = "rank", sortAsc = true, page = 0;
// 狭い画面では1行が高くなるため、1ページの件数を落とす
const PAGE = window.matchMedia('(max-width:760px)').matches ? 25 : 50;
const els = ["q","fCat","fSeg","fDept","fStage","fScheme"].map(id => document.getElementById(id));
els.forEach(el => el.addEventListener("input", () => {{ page = 0; render(); }}));
document.querySelectorAll("th").forEach(th => th.addEventListener("click", () => {{
  const k = th.dataset.k;
  if (sortKey === k) sortAsc = !sortAsc; else {{ sortKey = k; sortAsc = k === "rank" || k === "title"; }}
  render();
}}));
document.getElementById("prev").onclick = () => {{ page--; render(); }};
document.getElementById("next").onclick = () => {{ page++; render(); }};

function stageClass(s){{ return s.startsWith("TOP") ? "stg-top" : s.startsWith("C") ? "stg-c" : s.startsWith("P") ? "stg-p" : "stg-0"; }}

function render() {{
  const [q, cat, seg, dept, stage, scheme] = els.map(e => e.value);
  const ql = q.toLowerCase();
  let rows = IDEAS.filter(i =>
    (!cat || i.category === cat) && (!seg || i.segment === seg) &&
    (!dept || i.dept === dept) &&
    (!stage || i.stage === stage) && (!scheme || i.scheme === scheme) &&
    (!q || (i.title + i.description).toLowerCase().includes(ql)));
  rows.sort((a, b) => {{
    const va = a[sortKey], vb = b[sortKey];
    const c = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb), "ja");
    return sortAsc ? c : -c;
  }});
  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  page = Math.min(Math.max(0, page), pages - 1);
  document.getElementById("count").textContent = `${{rows.length}}件`;
  document.getElementById("pinfo").textContent = `${{page + 1}} / ${{pages}}ページ`;
  document.getElementById("prev").disabled = page === 0;
  document.getElementById("next").disabled = page >= pages - 1;
  document.getElementById("tbody").innerHTML = rows.slice(page * PAGE, (page + 1) * PAGE).map(i => `
    <tr><td>${{i.rank}}</td>
    <td><b>${{i.title}}</b><br><span class="rdesc">${{i.description}}</span></td>
    <td>${{i.category}}</td><td>${{i.dept}}</td><td>${{i.segment}}</td>
    <td style="text-align:center">${{i.savingHoursPerMonth}}</td>
    <td><b>${{i.total}}</b>/25</td>
    <td><span class="stg ${{stageClass(i.stage)}}">${{i.stage}}</span></td>
    <td>${{SCHEME_SHORT[i.scheme] || i.scheme}}</td></tr>`).join("");
}}
render();
</script>
</body>
</html>
"""


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    for ind, cfg in BOARDS.items():
        assert_contrast(cfg, ind)
        out = os.path.join(IMPROVEMENT, ind, "pdca.html")
        html = build_page(ind, cfg)
        io.open(out, "w", encoding="utf-8", newline="\n").write(html)
        print(f"OK: {ind} -> {os.path.relpath(out, IMPROVEMENT)} ({len(html):,} bytes)")
    print("※ 実行後は add_analytics.py を再実行して解析タグを注入すること")


if __name__ == "__main__":
    main()

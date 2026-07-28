# -*- coding: utf-8 -*-
"""index.html に千葉・埼玉・神奈川・栃木・群馬の5県と、その全市区町村を追加する。

■ 調査の原則（東京都のときと同じ）
  数値は各自治体・県の公式サイト（.lg.jp / .jp の自治体ドメイン、または自治体が
  運営を委託する公益財団法人のサイト）のみを出典とする。アフィリエイト系の
  補助金まとめサイトは手がかりにはしても数値の根拠にはしない。

■ 「未調査」と「調査したが無かった」を必ず区別する
  MUNICIPALITY_CHECKED に載っている自治体だけが調査済み。載っていない自治体は
  「未調査」と表示し、「制度が無い」とは書かない。210市区町村すべてを一度に
  調べ切ることはできないため、この区別が無いとサイトが嘘をつくことになる。

実行: python3 add_prefectures.py
冪等: 生成ブロックはマーカーで囲み、毎回まるごと置き換える。
"""
import io
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
INDEX = os.path.abspath(os.path.join(HERE, "..", "..", "index.html"))

# ---------------------------------------------------------------- 市区町村名
# 総務省の市区町村コード順。名称は各県公式サイトの市町村一覧に準拠。
MUNICIPALITIES = {
    "chiba": [
        ("chiba", "千葉市"), ("choshi", "銚子市"), ("ichikawa", "市川市"), ("funabashi", "船橋市"),
        ("tateyama", "館山市"), ("kisarazu", "木更津市"), ("matsudo", "松戸市"), ("noda", "野田市"),
        ("mobara", "茂原市"), ("narita", "成田市"), ("sakura", "佐倉市"), ("togane", "東金市"),
        ("asahi", "旭市"), ("narashino", "習志野市"), ("kashiwa", "柏市"), ("katsuura", "勝浦市"),
        ("ichihara", "市原市"), ("nagareyama", "流山市"), ("yachiyo", "八千代市"), ("abiko", "我孫子市"),
        ("kamogawa", "鴨川市"), ("kamagaya", "鎌ケ谷市"), ("kimitsu", "君津市"), ("futtsu", "富津市"),
        ("urayasu", "浦安市"), ("yotsukaido", "四街道市"), ("sodegaura", "袖ケ浦市"), ("yachimata", "八街市"),
        ("inzai", "印西市"), ("shiroi", "白井市"), ("tomisato", "富里市"), ("minamiboso", "南房総市"),
        ("sosa", "匝瑳市"), ("katori", "香取市"), ("sammu", "山武市"), ("isumi", "いすみ市"),
        ("oamishirasato", "大網白里市"), ("shisui", "酒々井町"), ("sakae", "栄町"), ("kozaki", "神崎町"),
        ("tako", "多古町"), ("tonosho", "東庄町"), ("kujukuri", "九十九里町"), ("shibayama", "芝山町"),
        ("yokoshibahikari", "横芝光町"), ("ichinomiya", "一宮町"), ("mutsuzawa", "睦沢町"), ("shirako", "白子町"),
        ("nagara", "長柄町"), ("chonan", "長南町"), ("otaki", "大多喜町"), ("onjuku", "御宿町"),
        ("kyonan", "鋸南町"), ("chosei", "長生村"),
    ],
    "saitama": [
        ("saitama", "さいたま市"), ("kawagoe", "川越市"), ("kumagaya", "熊谷市"), ("kawaguchi", "川口市"),
        ("gyoda", "行田市"), ("chichibu", "秩父市"), ("tokorozawa", "所沢市"), ("hanno", "飯能市"),
        ("kazo", "加須市"), ("honjo", "本庄市"), ("higashimatsuyama", "東松山市"), ("kasukabe", "春日部市"),
        ("sayama", "狭山市"), ("hanyu", "羽生市"), ("konosu", "鴻巣市"), ("fukaya", "深谷市"),
        ("ageo", "上尾市"), ("soka", "草加市"), ("koshigaya", "越谷市"), ("warabi", "蕨市"),
        ("toda", "戸田市"), ("iruma", "入間市"), ("asaka", "朝霞市"), ("shiki", "志木市"),
        ("wako", "和光市"), ("niiza", "新座市"), ("okegawa", "桶川市"), ("kuki", "久喜市"),
        ("kitamoto", "北本市"), ("yashio", "八潮市"), ("fujimi", "富士見市"), ("misato", "三郷市"),
        ("hasuda", "蓮田市"), ("sakado", "坂戸市"), ("satte", "幸手市"), ("tsurugashima", "鶴ヶ島市"),
        ("hidaka", "日高市"), ("yoshikawa", "吉川市"), ("fujimino", "ふじみ野市"), ("shiraoka", "白岡市"),
        ("ina", "伊奈町"), ("miyoshi", "三芳町"), ("moroyama", "毛呂山町"), ("ogose", "越生町"),
        ("namegawa", "滑川町"), ("ranzan", "嵐山町"), ("ogawa", "小川町"), ("kawajima", "川島町"),
        ("yoshimi", "吉見町"), ("hatoyama", "鳩山町"), ("tokigawa", "ときがわ町"), ("yokoze", "横瀬町"),
        ("minano", "皆野町"), ("nagatoro", "長瀞町"), ("ogano", "小鹿野町"), ("misato_s", "美里町"),
        ("kamikawa", "神川町"), ("kamisato", "上里町"), ("yorii", "寄居町"), ("miyashiro", "宮代町"),
        ("sugito", "杉戸町"), ("matsubushi", "松伏町"), ("higashichichibu", "東秩父村"),
    ],
    "kanagawa": [
        ("yokohama", "横浜市"), ("kawasaki", "川崎市"), ("sagamihara", "相模原市"), ("yokosuka", "横須賀市"),
        ("hiratsuka", "平塚市"), ("kamakura", "鎌倉市"), ("fujisawa", "藤沢市"), ("odawara", "小田原市"),
        ("chigasaki", "茅ヶ崎市"), ("zushi", "逗子市"), ("miura", "三浦市"), ("hadano", "秦野市"),
        ("atsugi", "厚木市"), ("yamato", "大和市"), ("isehara", "伊勢原市"), ("ebina", "海老名市"),
        ("zama", "座間市"), ("minamiashigara", "南足柄市"), ("ayase", "綾瀬市"), ("hayama", "葉山町"),
        ("samukawa", "寒川町"), ("oiso", "大磯町"), ("ninomiya", "二宮町"), ("nakai", "中井町"),
        ("oi", "大井町"), ("matsuda", "松田町"), ("yamakita", "山北町"), ("kaisei", "開成町"),
        ("hakone", "箱根町"), ("manazuru", "真鶴町"), ("yugawara", "湯河原町"), ("aikawa", "愛川町"),
        ("kiyokawa", "清川村"),
    ],
    "tochigi": [
        ("utsunomiya", "宇都宮市"), ("ashikaga", "足利市"), ("tochigi", "栃木市"), ("sano", "佐野市"),
        ("kanuma", "鹿沼市"), ("nikko", "日光市"), ("oyama", "小山市"), ("moka", "真岡市"),
        ("otawara", "大田原市"), ("yaita", "矢板市"), ("nasushiobara", "那須塩原市"), ("sakura", "さくら市"),
        ("nasukarasuyama", "那須烏山市"), ("shimotsuke", "下野市"), ("kaminokawa", "上三川町"),
        ("mashiko", "益子町"), ("motegi", "茂木町"), ("ichikai", "市貝町"), ("haga", "芳賀町"),
        ("mibu", "壬生町"), ("nogi", "野木町"), ("shioya", "塩谷町"), ("takanezawa", "高根沢町"),
        ("nasu", "那須町"), ("nakagawa", "那珂川町"),
    ],
    "gunma": [
        ("maebashi", "前橋市"), ("takasaki", "高崎市"), ("kiryu", "桐生市"), ("isesaki", "伊勢崎市"),
        ("ota", "太田市"), ("numata", "沼田市"), ("tatebayashi", "館林市"), ("shibukawa", "渋川市"),
        ("fujioka", "藤岡市"), ("tomioka", "富岡市"), ("annaka", "安中市"), ("midori", "みどり市"),
        ("shinto", "榛東村"), ("yoshioka", "吉岡町"), ("ueno", "上野村"), ("kanna", "神流町"),
        ("shimonita", "下仁田町"), ("nanmoku", "南牧村"), ("kanra", "甘楽町"), ("nakanojo", "中之条町"),
        ("naganohara", "長野原町"), ("tsumagoi", "嬬恋村"), ("kusatsu", "草津町"), ("takayama", "高山村"),
        ("higashiagatsuma", "東吾妻町"), ("katashina", "片品村"), ("kawaba", "川場村"), ("showa", "昭和村"),
        ("minakami", "みなかみ町"), ("tamamura", "玉村町"), ("itakura", "板倉町"), ("meiwa", "明和町"),
        ("chiyoda", "千代田町"), ("oizumi", "大泉町"), ("ora", "邑楽町"),
    ],
}

PREFECTURE_LABEL = {
    "chiba": "千葉県", "saitama": "埼玉県", "kanagawa": "神奈川県",
    "tochigi": "栃木県", "gunma": "群馬県",
}

# ---------------------------------------------------------------- 制度データ
# すべて公式サイトから取得（2026年7月28日調査）。数値は出典ページの表記どおり。
PROGRAMS = [
    # ===== 千葉県 =====
    dict(key="chiba_seicho4", name="千葉県中小企業成長促進補助金（第4弾）", pref="chiba", muni=None,
         scale="千葉県内に主たる事業所を有する中小企業者等。中小企業者枠と小規模事業者枠がある",
         expense="機械装置等の購入・改良、専用ソフトウェア・情報システム等の購入・構築、導入に必要な運搬・据付費",
         rate="1/2以内", cap="中小企業者枠3,000万円／小規模事業者枠500万円",
         cap_num=3000, cap_text="中小企業者枠3,000万円（下限500万円）／小規模事業者枠500万円（下限100万円）",
         expense_desc="生産性向上のための機械装置・ソフトウェア・情報システム導入費",
         wage="特になし（「積極的な賃上げや投資等を行う意欲の高い事業者」を対象とする趣旨の記載あり）",
         acceptance="非公表", sched="令和8年7月24日17時〜8月21日17時",
         note="下限額が中小企業者枠500万円・小規模事業者枠100万円と高く、小規模な投資には使いにくい。第1〜3弾は受付終了済み。",
         link="https://www.pref.chiba.lg.jp/keisei/zaisei/chiba-seichohojyo4.html",
         link_label="千葉県 公式ページを見る", cont="千葉県が第1弾から継続して実施。次弾の実施は予算措置次第"),
    # ===== 埼玉県 =====
    dict(key="saitama_dx", name="埼玉県中小企業DX導入支援補助金", pref="saitama", muni=None,
         scale="埼玉県内の事業所でDXツールの活用による生産性向上に取り組む中小企業者等。1年後に労働生産性を向上させる計画の策定が必要",
         expense="生産性向上に資するDXツールの購入費、導入に要する経費（対象経費総額の1/2まで）。キャッシュレス決済システム・会計ソフト・グループウェア等",
         rate="3/4以内", cap="300万円", cap_num=300, cap_text="300万円（下限7万5千円）",
         expense_desc="生産性向上に資するDXツール購入費・導入経費",
         wage="特になし", acceptance="非公表",
         sched="第1期：令和8年7月1日〜7月31日16時／第2期：8月3日〜8月31日16時／第3期：9月1日〜9月30日16時",
         note="補助率3/4は都道府県レベルでは高い水準。下限が7万5千円と低く、小規模なツール導入にも使いやすい。",
         link="https://dxdounyushienhozyo.pref.saitama.lg.jp/",
         link_label="埼玉県 特設サイトを見る", cont="埼玉県が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="saitama_shoryokuka", name="埼玉県中小企業省力化支援事業補助金", pref="saitama", muni=None,
         scale="埼玉県内の中小企業者等。1次産業（農業・林業・漁業）は対象外。人手不足要件（残業月30時間超／従業員5%以上減／求人未充足等）のいずれかに該当することが必要",
         expense="省力化製品の購入費（中古品・リース等を含む）、設置・運搬・動作確認等の導入経費（対象経費総額の1/2まで）",
         rate="2/3以内（賃上げ要件達成で4/5以内）", cap="1,000万円（賃上げ要件達成で1,200万円）",
         cap_num=1200, cap_text="1,000万円（賃上げ要件達成で1,200万円）",
         expense_desc="省力化製品の購入費・設置導入経費",
         wage="必須。実績報告時に平均所定内給与支給額を前年同月比3.0%以上増加させること",
         acceptance="非公表", sched="令和8年5月25日〜7月17日16時（受付終了）",
         note="賃上げ3.0%以上が実績報告時の必須要件で、未達だと返還リスクがある。人手不足要件の該当も必要。",
         link="https://www.pref.saitama.lg.jp/a0805/shoryokuka/index.html",
         link_label="埼玉県 公式ページを見る", cont="埼玉県が令和8年度に実施。次年度以降は予算措置次第"),
    # ===== 神奈川県 =====
    dict(key="kanagawa_seisansei", name="神奈川県中小企業生産性向上促進事業費補助金", pref="kanagawa", muni=None,
         scale="神奈川県内の事業所で実態のある事業を営む中小企業者・小規模事業者。県内自社事業所での実施が必須。一般枠・グループ化支援枠・創業者成長支援枠がある",
         expense="生産性向上・業務プロセス改善・人手不足解消に資する設備導入費等（ITサービス導入費は上限50万円、施設工事費は上限100万円）。単なる設備更新は対象外",
         rate="中小企業1/2以内、小規模事業者2/3以内（創業者成長支援枠は2/3以内）",
         cap="一般枠500万円", cap_num=500,
         cap_text="一般枠500万円（下限25万円）／グループ化支援枠1グループ4,000万円／創業者成長支援枠300万円",
         expense_desc="生産性向上・省力化に資する設備導入費",
         wage="必須（給与支給額を増加させること）", acceptance="非公表",
         sched="一般枠・グループ化支援枠【7月公募】令和8年7月31日17時／創業者成長支援枠 8月31日17時",
         note="単なる設備更新は対象外で、生産性向上との因果の説明が必要。ITサービス導入費は上限50万円と別枠制限がある。",
         link="https://r8seisansei.pref.kanagawa.jp/",
         link_label="神奈川県 ポータルサイトを見る", cont="神奈川県が例年実施。次年度以降も継続が見込まれる"),
    dict(key="kanagawa_digital", name="神奈川県小規模事業者デジタル化支援推進事業費補助金", pref="kanagawa", muni=None,
         scale="神奈川県内に事業所を有する小規模事業者（商業・サービス業〈宿泊業・娯楽業以外〉は従業員5人以下、宿泊業・娯楽業および製造業その他は20人以下）",
         expense="ITサービス導入費、ホームページ作成改修費、機械装置等費。パソコン・タブレット・周辺機器・プレインストールソフトも対象（合計上限10万円）",
         rate="2/3以内", cap="50万円", cap_num=50,
         cap_text="50万円（ホームページ作成改修費、パソコン・タブレット等はそれぞれ上限10万円）",
         expense_desc="ITサービス導入費・ホームページ作成改修費・機械装置等費",
         wage="特になし", acceptance="非公表（先着順・予算到達で終了）",
         sched="令和8年4月15日9時〜9月30日17時（先着順・予算到達次第終了）",
         note="国のデジタル化・AI導入補助金では原則対象外のパソコン・タブレット本体が上限10万円まで対象になる点が特徴。小規模事業者限定。",
         link="https://www.pref.kanagawa.jp/docs/m2w/shokibo_digital/r8.html",
         link_label="神奈川県 公式ページを見る", cont="神奈川県が令和7年度から継続実施。次年度以降も継続が見込まれる"),
    # ===== 栃木県 =====
    dict(key="tochigi_chinage", name="とちぎ賃上げ環境整備促進補助金", pref="tochigi", muni=None,
         scale="栃木県内に事業所を有する中小企業者等。令和7年10月1日以降に事業場内最低賃金を50円以上引き上げ、かつ引上げ前の事業場内最低賃金が地域別最低賃金より51円以上高く1,500円以下であることが必要",
         expense="生産性向上に資する設備投資（POSレジシステム、リフト付き特殊車両等）、労働環境改善に資する設備投資（キッズルーム設置、スロープ化等）",
         rate="1/2", cap="200万円", cap_num=200, cap_text="200万円",
         expense_desc="生産性向上・労働環境改善に資する設備投資",
         wage="必須。事業場内最低賃金を50円以上引き上げ、かつ引上げ前の事業場内最低賃金が地域別最低賃金＋51円以上1,500円以下",
         acceptance="非公表（先着順・予算到達で終了）",
         sched="令和8年5月18日〜12月21日（先着順・予算到達次第終了）",
         note="交付決定日以降に納品完了・正式契約・支払いが行われたものが対象。賃金水準の上下両方に条件があるため、自社の事業場内最低賃金の確認が先。",
         link="https://www.pref.tochigi.lg.jp/f06/chinagekannkyouseibihojokin.html",
         link_label="栃木県 公式ページを見る", cont="栃木県が令和8年度に実施。次年度以降は予算措置次第"),
    # ===== 市町村 =====
    dict(key="kanagawa_kawasaki_seicho", name="川崎市中小企業成長環境支援補助金", pref="kanagawa", muni="kawasaki",
         scale="川崎市内に事業所を有して1年以上事業を営む中小事業者等（かながわサイエンスパーク等の特定施設入居者は1年未満でも対象）",
         expense="設備等導入費、システム構築費、導入・サポート費、設計・工事費、専門家指導費、運搬費等",
         rate="1/2以内（賃上げ申請事業者は2/3以内）",
         cap="生産性向上支援100万円（賃上げ200万円）", cap_num=200,
         cap_text="生産性向上支援100万円・賃上げ申請200万円（下限20万円）",
         expense_desc="デジタル技術・生産性向上設備の導入費",
         wage="任意（賃上げ申請で補助率2/3・上限200万円に優遇）", acceptance="非公表",
         sched="エントリーシート：令和8年4月17日〜9月11日必着／申請書：4月22日〜9月30日必着",
         note="エントリーシートの提出が申請の前提。デジタル技術の導入と生産性向上設備等の導入の2区分がある。",
         link="https://www.city.kawasaki.jp/280/page/0000186427.html",
         link_label="川崎市 公式ページを見る", cont="川崎市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_sagamihara_seisansei", name="相模原市中小企業生産性向上支援補助金", pref="kanagawa", muni="sagamihara",
         scale="相模原市内に事業所を有し市内事業所で設備投資を行う中小企業者等（みなし大企業を除く）。労働生産性を3年間で9%以上向上させる事業計画が必要",
         expense="機械装置、測定工具・検査工具、器具備品、建物付属設備、ソフトウェア等の購入費",
         rate="2/3以内（市外事業者からの調達は1/2以内）", cap="1,000万円", cap_num=1000,
         cap_text="1,000万円", expense_desc="機械装置・器具備品・ソフトウェア等の購入費",
         wage="特になし", acceptance="非公表（予算上限到達次第終了）",
         sched="補助事業実施期間：令和8年4月1日〜令和9年1月31日（納品・支払い完了が条件／予算上限到達次第終了）",
         note="市内事業者から調達すると補助率が2/3、市外だと1/2に下がる。産業支援機関による事業計画の事前確認が必要。",
         link="https://www.city.sagamihara.kanagawa.jp/sangyo/sangyo/1026664/1003291/josei/1035055.html",
         link_label="相模原市 公式ページを見る", cont="相模原市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="chiba_chiba_ict", name="千葉市ICT活用等生産性向上支援事業（タイプA：生産性向上小規模型）", pref="chiba", muni="chiba",
         scale="千葉市内に本社または事業所を置き、主たる事業実施場所が市内の中小企業者。事業を開始していない創業者は対象外。財団コーディネーターのフォローアップ支援受講が必要",
         expense="クラウドサービス利用料・ソフトウェア購入費・システム設計費/構築費（必須）、インターネット通信インフラ費、保守委託費、コンサルティング・教育訓練費、機器購入・リース料",
         rate="2/3以内（機器購入・リース料等は1/3以内）", cap="50万円", cap_num=50,
         cap_text="50万円", expense_desc="クラウドサービス利用料・ソフトウェア購入費・システム構築費",
         wage="特になし", acceptance="非公表（予算上限到達次第終了）",
         sched="随時募集（予算上限到達次第終了）",
         note="実施主体は公益財団法人千葉市産業振興財団。より大規模な課題向けに「タイプB：生産性向上大規模型」もある。",
         link="https://www.chibashi-sangyo.or.jp/enterprise/kyoka-sosyutu/keiei/ict-change/type-a/",
         link_label="千葉市産業振興財団 公式ページを見る", cont="千葉市産業振興財団が継続実施。令和8年度も受付中"),
    dict(key="saitama_saitama_dx", name="さいたま市DX推進補助金", pref="saitama", muni="saitama",
         scale="さいたま市内の中小企業者等",
         expense="生産性向上に資するシステム・ソフトウェア購入費および関連経費（対象外経費が16項目詳細に列挙されている）",
         rate="2/3", cap="40万円", cap_num=40, cap_text="40万円",
         expense_desc="生産性向上に資するシステム・ソフトウェア購入費",
         wage="特になし", acceptance="非公表",
         sched="令和8年4月6日〜5月20日（受付終了）",
         note="実施主体は公益財団法人さいたま市産業創造財団。対象外経費が細かく列挙されているため、申請前に要綱の確認が必要。",
         link="https://www.sozo-saitama.or.jp/topic/dx-subsidy/",
         link_label="さいたま市産業創造財団 公式ページを見る", cont="さいたま市産業創造財団が例年実施。次年度以降も継続が見込まれる"),
    dict(key="saitama_kawaguchi_dx", name="川口市DX推進補助金", pref="saitama", muni="kawaguchi",
         scale="川口市内の中小企業・小規模事業者等。国の補助金（ものづくり・デジタル化・持続化・省力化投資等）の交付確定通知を令和8年4月1日以降に受けていることが必須",
         expense="国の補助金で補助対象となっている経費のうち、AI・ロボット等による自動化、バックオフィス業務のデジタル化、電子商取引・キャッシュレス決済等の非接触型商取引に関するシステム・設備の導入費",
         rate="1/2（国の補助金の交付確定額を差し引いた額に対して）", cap="50万円", cap_num=50,
         cap_text="50万円", expense_desc="国の補助金に上乗せするDX・デジタル化のシステム・設備導入費",
         wage="特になし", acceptance="採択予定件数25件程度",
         sched="令和8年5月1日〜令和9年2月26日",
         note="国の補助金への上乗せ制度。単独では使えず、先に国の補助金の交付確定を受けている必要がある。国の補助金と併用できる点で自己負担を実質的に減らせる。",
         link="https://www.city.kawaguchi.lg.jp/soshiki/01110/021/12/38430.html",
         link_label="川口市 公式ページを見る", cont="川口市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_yokosuka_seisansei", name="横須賀市中小企業等省エネ化・生産性向上補助金（B.生産性向上枠）", pref="kanagawa", muni="yokosuka",
         scale="横須賀市内の中小企業者または小規模事業者。業種による除外規定は明示されていない",
         expense="IT業務システム・サービスに関する機器、事業遂行に必要なITサービスシステムの開発・導入費（設備本体価格、既存設備の撤去・廃棄費、運搬・設置費）",
         rate="1/2（小規模事業者は2/3）", cap="25万円", cap_num=25, cap_text="25万円",
         expense_desc="IT業務システム・機器の導入費",
         wage="特になし", acceptance="非公表",
         sched="交付申請：令和8年6月8日〜令和9年2月1日17時／実績報告：認定後〜令和9年3月1日17時",
         note="購入前に申請し市の承認を受けてから購入する必要がある（事後申請は不可）。省エネ設備が対象のA枠と選択制。",
         link="https://www.city.yokosuka.kanagawa.jp/4402/hojokin/seisan.html",
         link_label="横須賀市 公式ページを見る", cont="横須賀市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_yokosuka_ict", name="横須賀市小規模事業者ICT支援補助金", pref="kanagawa", muni="yokosuka",
         scale="横須賀市内で事業を営む小規模事業者。横須賀商工会議所およびICT相談員による伴走型支援を受けることが前提",
         expense="業務効率化のためのICT導入経費（パソコン・タブレット等の汎用性が高い機器の購入は対象外）",
         rate="3/4", cap="30万円", cap_num=30, cap_text="30万円",
         expense_desc="業務効率化のためのICT導入経費",
         wage="特になし", acceptance="非公表",
         sched="令和8年度実施（受付期間は横須賀商工会議所〈046-823-0402〉へ要確認）",
         note="補助率3/4は市区町村レベルでは高い水準。商工会議所の伴走支援を受けることが前提で、汎用パソコン・タブレットは対象外。",
         link="https://www.city.yokosuka.kanagawa.jp/4402/sangyoshinko/shokibojigyosha_ict_shien.html",
         link_label="横須賀市 公式ページを見る", cont="横須賀市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="chiba_matsudo_dx", name="松戸市中小企業デジタル化チャレンジ補助金", pref="chiba", muni="matsudo",
         scale="松戸市内に1年以上継続した営業実態がある中小企業等。市税の滞納がなく、税務申告を1期以上終えていること",
         expense="ソフトウェア利用料・購入費・開発費、ウェブサイト制作費、インフラ整備費、デジタル機器のリース・購入費、従業員教育訓練費",
         rate="2/3（機器購入費は1/2）", cap="50万円", cap_num=50,
         cap_text="50万円（下限5万円／ウェブサイト制作費・機器購入費はそれぞれ25万円、汎用機器は10万円かつ1台2万5千円以下）",
         expense_desc="ソフトウェア・ウェブサイト・デジタル機器の導入費",
         wage="特になし", acceptance="非公表",
         sched="令和8年4月1日〜令和9年2月27日",
         note="事業開始日を含む連続最大3か月（必要な場合は最大6か月）が補助対象期間。従業員教育訓練費まで対象になる点が特徴。",
         link="https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.html",
         link_label="松戸市 公式ページを見る", cont="松戸市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="saitama_koshigaya_setsubi", name="越谷市物価高騰対策中小企業設備導入等支援補助金", pref="saitama", muni="koshigaya",
         scale="越谷市内に事業所を所有または賃借している中小企業者。業種制限なし（暴力団関係者・風俗営業者を除く）",
         expense="機械器具費、システム導入費、外注費・委託費、改修工事費（消費税・保守料等は対象外）。省エネ化・省コスト化・生産性向上のための設備導入や更新、業態転換・新規事業に必要な改修",
         rate="2/3以内（市外事業者への発注は1/2以内）", cap="200万円", cap_num=200,
         cap_text="200万円（市内・市外あわせて200万円以内）",
         expense_desc="省エネ・省コスト・生産性向上のための設備導入費・改修工事費",
         wage="特になし", acceptance="非公表",
         sched="令和8年4月13日〜4月24日（受付終了。予算額に達していない場合は追加受付を検討との記載あり）",
         note="市内事業者に発注すると補助率2/3、市外だと1/2に下がる。改修工事費まで対象になる範囲の広い制度。",
         link="https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/koshigaya_contents_buxtukakoutou.html",
         link_label="越谷市 公式ページを見る", cont="越谷市が物価高騰対策として実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_atsugi_it", name="厚木市IT・IoT導入補助金（ロボット関連産業等促進事業補助金）", pref="kanagawa", muni="atsugi",
         scale="厚木市内の中小企業者（業種制限の明記なし）",
         expense="機械購入費、システム開発費、ソフトウェア導入費、専門家依頼経費等（汎用機器、保守費、クラウド利用費、通信料、バージョンアップ費は対象外）",
         rate="1/2以内", cap="IT導入10万円／ロボット・IoT・AI導入50万円", cap_num=50,
         cap_text="IT導入事業10万円・ロボット/IoT/AI導入事業50万円（大学発ベンチャーはそれぞれ20万円・70万円／下限：対象経費50万円以上）",
         expense_desc="機械購入費・システム開発費・ソフトウェア導入費",
         wage="特になし", acceptance="非公表",
         sched="前年度3月16日から当該年度3月15日までに支払った費用が対象（令和8年度の受付期間は市の公式ページで要確認）",
         note="クラウド利用費が対象外のため、SaaS型サービスの月額利用料には使いにくい。下限が対象経費50万円以上と高め。",
         link="https://www.city.atsugi.kanagawa.jp/soshiki/sangyoshinkoka/9/2/24830.html",
         link_label="厚木市 公式ページを見る", cont="厚木市が継続実施。令和8年度の実施は公式ページで要確認"),
    dict(key="gunma_isesaki_shokibo", name="伊勢崎市小規模事業者サポート補助金", pref="gunma", muni="isesaki",
         scale="伊勢崎市内の小規模事業者（卸売業・小売業・サービス業は常時雇用5人以下、製造業その他は20人以下）。農業・林業・漁業、風俗営業、フランチャイズ事業は対象外",
         expense="生産性向上が見込まれる事業用設備の購入費（単価税抜3万円以上）、IT・IoT化や人材育成・教育訓練による業務効率化経費。パソコン等の事務用品は対象外",
         rate="1/2以内", cap="50万円", cap_num=50, cap_text="50万円",
         expense_desc="事業用設備の購入費・IT/IoT化による業務効率化経費",
         wage="特になし", acceptance="非公表",
         sched="令和8年6月15日〜7月10日（受付終了）",
         note="フランチャイズ事業が対象外。パソコン等の汎用事務用品も対象外のため、業務特化型の設備・システムが対象。",
         link="https://www.city.isesaki.lg.jp/soshiki/keizai/shoko/syoukousinkou/12899.html",
         link_label="伊勢崎市 公式ページを見る", cont="伊勢崎市が例年実施。次年度以降も継続が見込まれる"),
    dict(key="saitama_ageo_dx", name="上尾市SDGs・DX推進補助金（DX部門）", pref="saitama", muni="ageo",
         scale="上尾市内で6か月以上営業している中小企業者または小規模企業者（中小企業基本法第2条第1項・第5項）。業種の限定なし",
         expense="ソフトウェア導入費、システム構築費、デジタル機器購入費、技術指導料、その他市長が必要と認めるもの",
         rate="1/2（補助対象経費は税抜）", cap="25万円", cap_num=25,
         cap_text="DX部門25万円／SDGs部門50万円（下限の記載なし）",
         expense_desc="ソフトウェア導入費・システム構築費・デジタル機器購入費",
         wage="特になし", acceptance="非公表",
         sched="令和8年6月1日〜令和9年1月29日（必着）",
         note="SDGs部門（上限50万円）とDX部門（上限25万円）に分かれている。上限は低いが下限の記載がなく、少額のツール導入にも使いやすい。",
         link="https://www.city.ageo.lg.jp/page/395426.html",
         link_label="上尾市 公式ページを見る", cont="上尾市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="saitama_ageo_setsubi", name="上尾市小規模事業者等設備導入応援補助金", pref="saitama", muni="ageo",
         scale="上尾市内の中小企業者（製造業・建設業・運輸業・卸売業・サービス業・小売業など業種ごとに資本金と従業員数の条件あり）",
         expense="設備購入費、工事費、技術導入費、専門家謝金等（交付決定前の経費、土地・建物、車両購入費、リース費は対象外）",
         rate="2/3以内（千円未満切り捨て）", cap="1,000万円", cap_num=1000,
         cap_text="1,000万円（下限：補助対象経費の総額400万円超）",
         expense_desc="設備購入費・工事費・技術導入費",
         wage="特になし", acceptance="非公表",
         sched="令和8年4月20日〜4月30日（郵送のみ・消印有効／受付終了）",
         note="下限が対象経費総額400万円超と高く、小規模な投資には使えない。受付期間が11日間と非常に短いため、来年度は年度初めに公式ページを確認すること。",
         link="https://www.city.ageo.lg.jp/page/412445.html",
         link_label="上尾市 公式ページを見る", cont="上尾市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="saitama_niiza_itdx", name="新座市中小企業者IT・DX導入費補助金", pref="saitama", muni="niiza",
         scale="新座市内の事務所・店舗等で事業を営む法人または個人事業主（卸売業・小売業〈飲食業含む〉・サービス業・製造業・建設業・運輸業など。資本金額または従業員数の範囲内に該当すること）。にいざビジネスサポート事業の経営相談を利用していることが必須",
         expense="自社ホームページ・SNS・販売システムの構築／リニューアル経費、ビジネスマッチングサイト利用料、オンライン商談ツール、営業・顧客管理システム、キャッシュレス決済、会計・労務管理・クラウド・テレワークシステムの導入経費（人件費・仕入費・光熱費・ハードウェア経費・既存システムの維持管理費は対象外）",
         rate="1/2（千円未満切り捨て）", cap="7万円", cap_num=7, cap_text="7万円",
         expense_desc="ホームページ・販売/会計/労務システム等のIT・DX導入費",
         wage="特になし", acceptance="非公表",
         sched="交付申請の締切：令和9年2月26日",
         note="上限7万円と小さいが、ハードウェアが対象外でソフトウェア・クラウド中心。申請の前に「にいざビジネスサポート」の無料経営相談を受けておく必要がある。",
         link="https://www.city.niiza.lg.jp/site/business-support/itdx.html",
         link_label="新座市 公式ページを見る", cont="新座市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_hiratsuka_dx", name="平塚市中小企業等DX支援補助金", pref="kanagawa", muni="hiratsuka",
         scale="平塚市内に事業所がある中小事業者。業種の限定はなく、医療法人・学校法人・社会福祉法人・一般社団法人・NPO・各種組合も対象",
         expense="システム設計・開発費、ソフトウェア購入費、ハードウェア購入費、実証実験費、コンサルティング費用（既存の生成AIサービスの導入、ハードウェアの単なる買い替えは対象外）",
         rate="1/2", cap="200万円", cap_num=200,
         cap_text="200万円（下限：対象経費の総額100万円〈税抜〉以上）",
         expense_desc="IoT・AIを活用したシステムの設計・開発費、ソフト／ハード購入費",
         wage="特になし", acceptance="非公表",
         sched="令和8年4月1日〜令和9年2月28日（当日消印有効）",
         note="下限が税抜100万円以上のため小規模なツール導入には使えない。既存の生成AIサービスをそのまま導入するだけでは対象外で、ビジネスモデルの変革につながる説明が要る。",
         link="https://www.city.hiratsuka.kanagawa.jp/sangyo/page33_00096.html",
         link_label="平塚市 公式ページを見る", cont="平塚市が令和8年度に実施。次年度以降は予算措置次第"),
    dict(key="kanagawa_ebina_shinko", name="海老名市中小企業振興支援事業", pref="kanagawa", muni="ebina",
         scale="海老名市内で操業している中小企業者（個人事業主を含む）。納税義務を果たし1年以上継続して事業を行っていること。業種の制限なし",
         expense="10のメニューから選択。ホームページ制作（委託費）、生産性向上設備導入、環境施設設置、展示会等出展、人材育成、産業財産権取得、求人広告掲載、ISO等認証取得、依頼試験等実施、リスクマネジメント",
         rate="1/2（生産性向上設備導入は事業費に応じた定額）",
         cap="メニューごとに5万円〜100万円", cap_num=100,
         cap_text="生産性向上設備導入10〜50万円（定額）／ホームページ制作15万円／ISO等認証取得50万円／環境施設設置20〜100万円／展示会等出展30万円ほか",
         expense_desc="生産性向上設備の導入費、ホームページ制作委託費ほか10メニュー",
         wage="特になし", acceptance="先着順（予算の上限に達し次第終了）",
         sched="令和8年4月1日〜（先着順・予算上限到達次第終了）",
         note="1つの制度で10メニューを持つのが特徴。先着順で予算到達次第終了するため、年度初めの申請が有利。生産性向上設備導入は補助率ではなく事業費に応じた定額。",
         link="https://www.city.ebina.kanagawa.jp/guide/shoko/chusho/1003742.html",
         link_label="海老名市 公式ページを見る", cont="海老名市が例年実施。次年度以降も継続が見込まれる"),
    dict(key="kanagawa_yamato_koten", name="大和市魅力ある個店支援事業", pref="kanagawa", muni="yamato",
         scale="大和市内の中小企業基本法第2条に規定するサービス業および小売業に属する事業者（製造業・建設業などは対象外）",
         expense="商品開発費、システム導入費、施設整備費、委託費、その他事務費（広報費・会議費・雑役務費・報償費）",
         rate="1/2以内", cap="50万円", cap_num=50,
         cap_text="50万円（予算の範囲内／下限：最低事業費10万円）",
         expense_desc="システム導入費・施設整備費・商品開発費",
         wage="特になし", acceptance="非公表（予算の範囲内）",
         sched="当該事業年度4月1日〜6月30日（必着）",
         note="対象がサービス業・小売業に限られる。ECサイト構築や顧客管理アプリの開発もシステム導入費として対象になる。受付が4〜6月の3か月のみで、年度後半には申請できない。",
         link="https://www.city.yamato.lg.jp/gyosei/soshik/40/sangyo/shogyo/shien_seibi_todokede/23892.html",
         link_label="大和市 公式ページを見る", cont="大和市が例年実施。次年度以降も継続が見込まれる"),
    dict(key="gunma_maebashi_dx", name="前橋市DX推進補助金", pref="gunma", muni="maebashi",
         scale="前橋市内で1年以上継続して事業を営み市税を完納している事業者。風俗営業、農業・林業、漁業、電気・ガス・熱供給・水道業、情報サービス業、インターネット付随サービス業、電気事務機械器具小売業、学校教育、医療・福祉、各種団体、公務等は対象外",
         expense="システム導入費（ソフトウェア開発・導入）、ハードウェア購入費（システム導入費の1/2以内）、システム使用料、初期設定費",
         rate="1/3以内（小規模企業者は1/2以内）", cap="150万円", cap_num=150,
         cap_text="150万円（下限：補助対象事業費10万円以上）",
         expense_desc="システム導入費・ハードウェア購入費・システム使用料・初期設定費",
         wage="特になし", acceptance="非公表",
         sched="令和8年5月11日〜5月22日（受付終了）",
         note="対象外業種が広く列挙されているため、まず自社の業種が対象か確認すること。交付決定後に着手し令和9年2月26日までに納品・支払いを完了する必要がある。",
         link="https://www.city.maebashi.gunma.jp/soshiki/sangyokeizai/sangyoseisaku/shinseisho/7311.html",
         link_label="前橋市 公式ページを見る", cont="前橋市が令和8年度に実施。次年度以降は予算措置次第"),
]

# 調査したが、業種を問わず使える汎用の設備投資・IT導入系制度が確認できなかった自治体
MUNI_NOT_FOUND = {
    "kanagawa": {
        "yokohama": "「中小企業デジタル化推進支援補助金」を令和7年度に実施していましたが、令和7年12月11日に予算上限に達して受付終了しており、令和8年度の募集は本稿時点で確認できませんでした。市はデジタル人材育成講座や専門家による伴走支援を継続しています。",
        "fujisawa": "「先端設備等導入計画」の認定（固定資産税の特例等）や国の制度の案内はありますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "chigasaki": "市独自の補助金は「販路開拓等事業補助金」（展示会等への出店費用・最大10万円）と商店街向けの街路灯電灯料補助・活性化事業費補助に限られ、設備投資・IT導入を対象とする制度は確認できませんでした。市のサイトでは国のIT導入補助金・省力化投資補助金等が案内されています。",
        "odawara": "市の中小企業等経営支援は融資制度と信用保証料補助が中心で、設備投資・IT導入を直接補助する市独自の制度は確認できませんでした。「デジタル関連企業集積施設整備補助金」はDX推進拠点となる施設の整備が対象、「中小企業等販路開拓事業補助金」は展示会・見本市への出展費が対象です。",
        "hadano": "市の商工業支援は融資制度（脱炭素設備等導入促進資金・ハイテク機器設備資金等）と利子補給が中心で、市独自の設備投資・IT導入補助金は確認できませんでした。企業立地等奨励金は新規立地・施設再整備を行う企業が対象です。",
    },
    "chiba": {
        "funabashi": "「工業振興支援事業補助金」（令和4年度から全業種に拡大）がありますが、対象はISO認証・エコアクション21・産業財産権の取得と試験データ収集に限られ、設備投資・IT導入は対象外です。ほかに再投資企業促進事業補助制度がありますが、これは市内立地企業の再投資・雇用拡大を対象とする制度です。",
        "ichikawa": "「経営力強化支援補助金」は事業計画策定時の専門家相談料等を補助する制度、「中小企業展示会等出展支援事業補助金」は展示会出展費の補助で、いずれも設備投資・IT導入そのものを対象とする制度ではありません。省エネ・創エネ設備設置費等補助金は省エネ・創エネ設備に限定されます。",
        "kashiwa": "市のサイトでは国のデジタル化・AI導入補助金等が案内されていますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。創業支援・企業立地促進の補助金は対象が限定されます。",
        "ichihara": "「中小企業等未来開拓サポート事業補助金」（2/3以内・上限50万円、女性または39歳以下は3/4以内）がありますが、対象は「事業を営んでいない個人であって令和8年1月1日〜令和9年3月12日の間に開業する方」で、既に営業している事業者は使えません。対象経費も店舗等改修費・備品購入費・広報費等で、設備投資・IT導入を主目的とする制度ではありません。",
        "yachiyo": "市独自の制度は中小企業資金融資制度と商店街向けの共同施設設置・商業活性化推進事業補助金に限られ、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。設備関連は千葉県の事業として案内されています。",
        "nagareyama": "市独自の補助金は「多様な人材が活躍できる職場づくり補助金」（職場環境改善）、「グループ提案型売上アップ・プロジェクト応援補助金」（3事業者以上のグループが対象）、「空き店舗有効活用事業補助金」（改装工事費・賃料）で、いずれも業種を問わず単独で使える設備投資・IT導入の制度ではありません。",
        "sakura": "市独自の制度は中小企業資金融資制度と商店街空き店舗等出店促進補助金が中心で、設備投資・IT導入を対象とする補助金は確認できませんでした。「先端設備等導入計画」の認定は固定資産税の特例等を受けるための制度で、補助金ではありません。",
        "narashino": "市のサイトでは制度融資の利子補給、「先端設備等導入計画」の認定、中小企業退職金共済の掛金補助が案内されていますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "urayasu": "市独自の補助金は「産業展示会等支援補助金」「商店街共同施設設置等事業費補助金」「中小企業退職金共済掛金補助金」「受動喫煙防止対策助成金」で、設備投資・IT導入を対象とする制度は確認できませんでした。「商工業振興共同事業補助金」は商工業団体が共同で行う事業が対象で、単独の事業者は使えません。",
    },
    "saitama": {
        "tokorozawa": "「地域資源活用・ものづくり総合支援補助金」は市内事業者が連携して行う新商品・サービス開発や販路開拓が対象、「中小企業設備投資融資利子補給事業」は制度融資の支払利子への補給であり、いずれも設備・IT導入費を直接補助する制度ではありません。",
        "kawagoe": "市のサイトでは埼玉県の制度融資やデジタル人材育成事業、「先端設備等導入計画」の認定が案内されていますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "kasukabe": "市のサイトでは国の業務改善助成金や「先端設備等導入計画」の認定、企業向け太陽光発電・蓄電池設置補助金が案内されていますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "kumagaya": "「産業DXプロジェクト」がありますが、これはふるさと納税型クラウドファンディングで集めた寄附金を原資とする仕組みで、補助率・上限額が公表されておらず、審査会での認定と事前相談が前提です（令和8年12月31日まで随時募集）。ほかは経営革新計画策定奨励金、SDGs経営・ジギョケイ策定支援奨励金、創業者応援補助金、屋外現場作業負荷軽減支援事業補助金など目的が限定された制度で、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "kuki": "市のサイトでは事業承継補助金、受動喫煙防止対策助成金、中小企業向け制度融資、「先端設備等導入計画」の認定が案内されていますが、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "soka": "「経営革新チャレンジ支援事業補助金」がありますが、これは経営革新計画の都道府県知事承認を前提とした定額給付型（経営革新関連20万円、創業関連5万円が基本額）で、対象経費に設備投資・IT導入が含まれるかは公式サイト上で確認できませんでした。",
    },
    "tochigi": {
        "utsunomiya": "「ICT利活用促進助成制度」（ICT導入による業務効率化・売上向上の取組が対象、宇都宮商工会議所またはうつのみや市商工会の支援を受けた経営計画の策定が必要）がありますが、補助率・上限額を公式サイト上で確認できなかったため、推測の数値は掲載していません。金額は市商工振興課へ直接ご確認ください。",
        "oyama": "「中小企業等省エネルギー設備導入支援補助金」は省エネ設備に限定され、そのほかは国の補助金の案内と融資制度が中心で、市独自の、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "ashikaga": "市の補助制度一覧に載っている7制度（ものづくり人材育成支援・競争力強化認証等取得支援・産業財産権取得・地域産業振興奨励・独自ブランド製品販売促進・工業製品展示会等出展支援・先端設備等導入計画）は、いずれも製造業等が対象か目的が限定されています。「ITビジネス支援事業補助金」もICT・情報通信系企業の誘致と定着が目的で、一般の事業者のIT導入には使えません。",
        "tochigi": "市独自の制度は「中小企業者等奨学金返還支援事業費補助金」と「小規模事業者経営改善資金（マル経融資）利子補助金」で、そのほかはオフィス移転等支援・新製品等開発支援・産業財産権取得費といった目的が限定された補助金です。業種を問わず使える設備投資・IT導入補助金は確認できませんでした。",
        "sano": "市独自の補助金は企業立地促進事業、販路拡大チャレンジ補助金、産業財産権取得補助金、中小企業退職金共済・倒産防止共済の加入促進、技術・製品開発で、設備投資・IT導入を対象とする汎用の制度は確認できませんでした。過去にあった「新業態開拓支援補助金」（国・県の補助金の自己負担相当額・上限30万円）は現在ページが削除されており、令和8年度の実施は確認できませんでした。",
    },
    "gunma": {
        "takasaki": "「中小企業等機械設備導入支援助成金」（1事業者あたり年500万円が限度）がありますが、これはリース料に対する助成（助成率2.1%×リース日数÷365）で、対象は生産に直接関わる機械・装置と特定の車両運搬具に限られ、ITシステム・ソフトウェアの記載はありません。「まちなか商店リニューアル助成事業補助金」は受付終了しています。",
        "kiryu": "市独自の11制度（魅力ある職場発信・雇用促進、繊維産地新連携促進、ものづくり拠点開設、新店舗開設促進、地域店舗買物促進、販路拡大支援、産学官共同研究推進、ぐんま技術革新チャレンジ、群馬大学生就労型人材活用推進、中小企業人材養成、小規模企業者省エネルギー設備導入）は、いずれも目的や対象が限定されています。設備投資系は省エネ設備導入補助金のみで、業種を問わず使えるIT導入・生産性向上の補助金は確認できませんでした。",
        "shibukawa": "「ぐんま技術革新チャレンジ補助金」は新技術・新製品の開発が対象、「しぶかわ企業進出促進補助金」と「工場等設置奨励事業」は立地・設置が対象で、業種を問わず使える設備投資・IT導入補助金は確認できませんでした。「先端設備等導入計画」の認定は固定資産税の特例を受けるための制度で、補助金ではありません。",
        "tatebayashi": "市独自の16制度は店舗改装・労働環境改善・展示会出展・人材育成・雇用奨励・事業承継など目的が限定されています。「店舗リニューアル助成金」（改装費用の1/2、小売業・飲食サービス業・生活関連サービス業の来店型店舗が対象）は受付終了しており、「ぐんま技術革新チャレンジ補助金」は新技術・新製品の開発が対象です。",
        "ota": "「太田市DX推進補助金」（1/2以内・上限100万円）がありますが、対象は建設業・製造業・運輸業／郵便業を主たる事業とする者、または市内で製品等の開発・製造を行う者に限られ、業種を問わず使える制度ではありません。該当業種の方は市の公式ページをご確認ください。",
    },
}

# 県レベルで汎用制度が確認できなかった県
PREF_NOT_FOUND = {
    "gunma": "群馬県の県レベルの事業者向け補助金（ぐんまDX技術革新補助金・ぐんま技術革新チャレンジ補助金・ぐんま未来共創トライアル補助金）は、いずれも新技術・新製品の開発や実証プロジェクトが対象で、業種を問わず一般の事業者が設備・ITを導入する用途に使える汎用制度は確認できませんでした。市町村の制度と全国共通の制度をご確認ください。",
}

# 調査済みの市区町村（ここに無い自治体は「未調査」）
CHECKED = {
    "chiba": ["chiba", "funabashi", "matsudo", "ichikawa", "kashiwa",
              "ichihara", "yachiyo", "nagareyama", "sakura", "narashino", "urayasu"],
    "saitama": ["saitama", "kawaguchi", "koshigaya", "tokorozawa", "kawagoe", "soka", "kasukabe",
                "ageo", "niiza", "kumagaya", "kuki"],
    "kanagawa": ["yokohama", "kawasaki", "sagamihara", "yokosuka", "fujisawa", "atsugi",
                 "hiratsuka", "ebina", "yamato", "chigasaki", "odawara", "hadano"],
    "tochigi": ["utsunomiya", "oyama", "ashikaga", "tochigi", "sano"],
    "gunma": ["maebashi", "takasaki", "ota", "isesaki", "kiryu", "shibukawa", "tatebayashi"],
}

START = "// PREFECTURE_EXPANSION:START"
END = "// PREFECTURE_EXPANSION:END"


def js_str(s):
    return '"' + str(s).replace("\\", "\\\\").replace('"', '\\"') + '"'


def build_programs_js():
    out = []
    for p in PROGRAMS:
        muni = f' municipality: {js_str(p["muni"])},' if p["muni"] else ""
        out.append(
            f'    {p["key"]}: {{\n'
            f'      name: {js_str(p["name"])},\n'
            f'      prefecture: {js_str(p["pref"])},{muni}\n'
            f'      scale: {js_str(p["scale"])},\n'
            f'      expense: {js_str(p["expense"])},\n'
            f'      rate: {js_str(p["rate"])}, cap: {js_str(p["cap"])},\n'
            f'      wage: {js_str(p["wage"])}, acceptance: {js_str(p["acceptance"])},\n'
            f'      note: {js_str(p["note"])},\n'
            f'      link: {js_str(p["link"])}, linkLabel: {js_str(p["link_label"])},\n'
            f'      schedule: {js_str(p["sched"])},\n'
            f'      continuity: {js_str(p["cont"])}\n'
            f'    }}'
        )
    return ",\n".join(out)


def build_block():
    L = []
    A = L.append
    A(START)
    A("  // 千葉・埼玉・神奈川・栃木・群馬の5県とその全210市区町村。")
    A("  // 数値は各県・各自治体の公式サイトのみを出典とする（2026年7月28日調査）。")
    A("  // このブロックは improvement/_build/add_prefectures.py が生成する。手で編集しないこと。")
    A("  (function () {")

    # PROGRAMS への追加
    A("    var ADDED = {")
    A(build_programs_js())
    A("    };")
    A("    Object.keys(ADDED).forEach(function (k) { PROGRAMS[k] = ADDED[k]; });")

    # CAP / CAP_TEXT / EXPENSE_DESC
    A("    var ADDED_CAP = {" + ", ".join(f'{p["key"]}: {p["cap_num"]}' for p in PROGRAMS) + "};")
    A("    Object.keys(ADDED_CAP).forEach(function (k) { CAP[k] = ADDED_CAP[k]; });")
    A("    var ADDED_CAP_TEXT = {")
    A(",\n".join(f'      {p["key"]}: {js_str(p["cap_text"])}' for p in PROGRAMS))
    A("    };")
    A("    Object.keys(ADDED_CAP_TEXT).forEach(function (k) { CAP_TEXT[k] = ADDED_CAP_TEXT[k]; });")
    A("    var ADDED_EXPENSE = {")
    A(",\n".join(f'      {p["key"]}: {js_str(p["expense_desc"])}' for p in PROGRAMS))
    A("    };")
    A("    Object.keys(ADDED_EXPENSE).forEach(function (k) { EXPENSE_DESC[k] = ADDED_EXPENSE[k]; });")

    # 県レベル制度キー
    pref_keys = {}
    for p in PROGRAMS:
        if not p["muni"]:
            pref_keys.setdefault(p["pref"], []).append(p["key"])
    A("    var ADDED_PREF = {")
    A(",\n".join(f'      {k}: [' + ", ".join(js_str(x) for x in v) + "]" for k, v in pref_keys.items()))
    A("    };")
    A("    Object.keys(ADDED_PREF).forEach(function (k) { PREFECTURE_PROGRAM_KEYS[k] = ADDED_PREF[k]; });")

    # 市区町村ラベル
    A("    var ADDED_LABEL = {")
    rows = []
    for pref, items in MUNICIPALITIES.items():
        inner = ", ".join(f"{k}: {js_str(v)}" for k, v in items)
        rows.append(f"      {pref}: {{ {inner} }}")
    A(",\n".join(rows))
    A("    };")
    A("    Object.keys(ADDED_LABEL).forEach(function (k) { MUNICIPALITY_LABEL[k] = ADDED_LABEL[k]; });")

    # 市区町村の制度キー
    muni_keys = {}
    for p in PROGRAMS:
        if p["muni"]:
            muni_keys.setdefault(p["pref"], {}).setdefault(p["muni"], []).append(p["key"])
    A("    var ADDED_MUNI = {")
    rows = []
    for pref, d in muni_keys.items():
        inner = ", ".join(f"{m}: [" + ", ".join(js_str(x) for x in ks) + "]" for m, ks in d.items())
        rows.append(f"      {pref}: {{ {inner} }}")
    A(",\n".join(rows))
    A("    };")
    A("    Object.keys(ADDED_MUNI).forEach(function (k) { MUNICIPALITY_PROGRAM_KEYS[k] = ADDED_MUNI[k]; });")

    # 調査したが無かった自治体
    A("    var ADDED_NF = {")
    rows = []
    for pref, d in MUNI_NOT_FOUND.items():
        inner = ",\n".join(f"        {m}: {js_str(t)}" for m, t in d.items())
        rows.append(f"      {pref}: {{\n{inner}\n      }}")
    A(",\n".join(rows))
    A("    };")
    A("    Object.keys(ADDED_NF).forEach(function (k) { MUNICIPALITY_NOT_FOUND[k] = ADDED_NF[k]; });")

    # 調査済みリスト
    A("    // ここに載っている自治体だけが調査済み。載っていない自治体は『未調査』であり、")
    A("    // 『制度が無い』ことを意味しない。210市区町村を一度に調べ切れないための区別。")
    A("    MUNICIPALITY_CHECKED.tokyo = '*';")
    for pref, ks in CHECKED.items():
        A(f"    MUNICIPALITY_CHECKED.{pref} = [" + ", ".join(js_str(k) for k in ks) + "];")

    # 県レベルで見つからなかった県
    A("    var ADDED_PNF = {")
    A(",\n".join(f"      {k}: {js_str(v)}" for k, v in PREF_NOT_FOUND.items()))
    A("    };")
    A("    Object.keys(ADDED_PNF).forEach(function (k) { PREFECTURE_NOT_FOUND[k] = ADDED_PNF[k]; });")

    A("  })();")
    A("  " + END)
    return "\n".join(L)


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    html = io.open(INDEX, encoding="utf-8").read()

    block = "  " + build_block()
    if START in html:
        html = re.sub(re.escape(START) + r".*?" + re.escape(END), block.strip(), html, flags=re.S)
        action = "置換"
    else:
        anchor = "  var PREFECTURE_PROGRAM_KEYS ="
        idx = html.index(anchor)
        # PREFECTURE_PROGRAM_KEYS 以降の各定義より後に差し込む必要があるため、
        # MUNICIPALITY_NOT_FOUND の定義が閉じた直後を探す
        marker = "  var MUNICIPALITY_NOT_FOUND = {"
        j = html.index(marker)
        depth, k = 0, html.index("{", j)
        while True:
            if html[k] == "{":
                depth += 1
            elif html[k] == "}":
                depth -= 1
                if depth == 0:
                    break
            k += 1
        end = html.index("\n", k)
        html = html[:end + 1] + "\n" + block + "\n" + html[end + 1:]
        action = "新規挿入"

    io.open(INDEX, "w", encoding="utf-8").write(html)
    n_muni = sum(len(v) for v in MUNICIPALITIES.values())
    n_checked = sum(len(v) for v in CHECKED.values())
    print(f"{action}: 5県 / {n_muni}市区町村 / 制度{len(PROGRAMS)}件")
    for pref, items in MUNICIPALITIES.items():
        print(f"  {PREFECTURE_LABEL[pref]}: {len(items)}市区町村（調査済み {len(CHECKED[pref])}）")
    print(f"  調査済み計 {n_checked} / {n_muni}（残り {n_muni - n_checked} は未調査と表示）")


if __name__ == "__main__":
    main()

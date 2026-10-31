// 自動生成ファイル。手で直さないこと。
// 生成元: _tools/build_adoption_data.py（調査結果のJSONから作る）
//
// 補助金タイプ（審査で採択・不採択が決まる制度）の採択率と、そこから決まるランク。
//   A = 75%以上 / B = 50%超〜75%未満 / C = 50%以下（2026-10-31 本人指定）
//   採択率も件数も公表されていない制度はランクを付けず「採択率非公表」と出す。
//   status: published = 事務局が採択率を公表 / computed = 採択件数÷申請件数を当サイトで算出
//           none = 公表なし（または先着・抽選で採択率の考え方が成り立たない）
// 助成金タイプの制度はここに載せない（ランクの対象外）。
window.KOBAN_ADOPTION = {
  programs: {
  "ai": {
    "status": "computed",
    "rate": 44.4,
    "round": "4次締切分（通常枠）",
    "adopted": 816,
    "applied": 1836,
    "source": "https://it-shien.smrj.go.jp/download/grantdecision_list/",
    "checked": "2026-10-31",
    "note": "事務局の「申請数および交付決定数」表（2026-10-07更新）の通常枠の行で割り算（816÷1,836）。数字は採択数ではなく交付決定数。採択率そのものは出ていない。旧記載の2次51.5%（2,936/5,699）は全枠合計の数字で、通常枠だけだと2次は819/1,879＝43.6%"
  },
  "akiya": {
    "status": "computed",
    "rate": 30.8,
    "round": "令和8年度",
    "adopted": 36,
    "applied": 117,
    "source": "https://www.mlit.go.jp/report/press/house03_hh_000275.html",
    "checked": "2026-10-31",
    "note": "国交省の報道発表（2026-07-08）「117件の応募に対し36件」で割り算。テーマ別：1＝5/16、2＝11/42、3＝12/30、4＝6/22、5＝2/7。採択率そのものは出ていない"
  },
  "chiba_chiba_ict": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（随時募集）",
    "adopted": null,
    "applied": null,
    "source": "https://www.chibashi-sangyo.or.jp/enterprise/kyoka-sosyutu/keiei/ict-change/type-a/",
    "checked": "2026-10-31",
    "note": "随時募集・『予算上限に達し次第終了』、企業支援会議で可否決定、『審査内容等については公開しません』。件数の公表なし。"
  },
  "chiba_seicho4": {
    "status": "none",
    "rate": null,
    "round": "第4弾（令和8年7/24〜8/21受付）。第1〜3弾も結果未公表",
    "adopted": null,
    "applied": null,
    "source": "https://www.pref.chiba.lg.jp/keisei/zaisei/chiba-seichohojyo4.html",
    "checked": "2026-10-31",
    "note": "申請要領（第1弾）で『総合的な評価が高いものから順に予算の範囲内で採択（先着順ではない）』の競争型と確認。ただし第1〜4弾の制度ページ（第3弾ページも確認）に申請・採択件数の掲載なく、議会・記者会見資料でも見つからず。"
  },
  "food_labor": {
    "status": "none",
    "rate": null,
    "round": "令和7年度補正（公募 2026-04-01〜05-29）",
    "adopted": null,
    "applied": null,
    "source": "https://jmac-foods.com/adopted/",
    "checked": "2026-10-31",
    "note": "事務局JMACの公募・採択情報ページ（最新は2026-04-01の公募案内）にもお知らせ一覧（最新は2026-06-12）にも、採択件数・応募件数が載っていない。補足：この補助金はJMACが事務局になって飲食店そのもの（個人事業主も対象）を公募する形で、「飲食店を支援する団体を募集する」という説明とは合わない（要確認）"
  },
  "gunma_isesaki_shokibo": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（申請 R8.6.15〜7.10、結果通知8月末頃予定）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.isesaki.lg.jp/soshiki/keizai/shoko/syoukousinkou/12899.html",
    "checked": "2026-10-31",
    "note": "採択制（審査項目：必要性・計画の適切性・創意工夫・事業効果・地域課題への適応性）。制度ページ（更新2026-07-10）に採択結果なし。地方創生関連の事業概要PDF（R7gaiyou_matome.pdf）には予算額（ソフト・ハード各2,000千円）のみで件数なし。"
  },
  "gunma_maebashi_setsubi": {
    "status": "none",
    "rate": null,
    "round": "令和8年度 生産性向上設備導入枠 第2期（審査中）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.maebashi.gunma.jp/soshiki/sangyokeizai/sangyoseisaku/shinseisho/7310.html",
    "checked": "2026-10-31",
    "note": "生産性向上枠は審査項目で採点し予算額の範囲内で採択（省エネ枠は受理後30日以内に可否決定・予算上限到達で受付終了）。市ページには『第2期の申請受付は終了、現在審査中』とあるのみで、第1期・過去年度とも申請件数・採択件数の公表は見つからず。"
  },
  "jigyou_shoukei_ma": {
    "status": "computed",
    "rate": 62.2,
    "round": "15次公募（専門家活用枠）",
    "adopted": 194,
    "applied": 312,
    "source": "https://shoukei-mahojokin.go.jp/",
    "checked": "2026-10-31",
    "note": "事務局の2026-09-11のお知らせにある枠別の件数で割り算（専門家活用枠 194÷312）。全体は338/551＝61.3%。16次は公募中で結果はまだ出ていない"
  },
  "jizoku": {
    "status": "computed",
    "rate": 47.2,
    "round": "第19回",
    "adopted": 7819,
    "applied": 16576,
    "source": "https://mirasapo-plus.go.jp/infomation/15578/",
    "checked": "2026-10-31",
    "note": "中小企業庁（ミラサポplus）2026-07-29の発表「申請16,576件、採択7,819件」で割り算（47.17%）。第20回は受付前。指定された中小企業庁URL（260527002.html）は2026-10-31時点で「ページが存在しません」になっていた。事務局（r6.jizokukahojokin.info）は商工会議所地区の事務局"
  },
  "kanagawa_ayase_kyojinka": {
    "status": "none",
    "rate": null,
    "round": "令和8年度第3次公募（受付中・本申請締切11/13、結果通知12月上旬予定）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.ayase.kanagawa.jp/soshiki/shokosinkoka/kogyotanto/4/2905.html",
    "checked": "2026-10-31",
    "note": "制度ページ・第3次公募手引き（daisanjikyoujinkakouboyouryou.pdf）に過去回の申請件数・採択件数の記載なし。手引きは『予算を超える申請があった場合、中小企業診断士による審査に基づき採択企業を決定』（予算内なら審査で落とさない競争性の弱い仕組み）。Web検索でも市の公表資料は見つからず。"
  },
  "kanagawa_ayase_shogyo": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（受付中・先着順、締切12/28）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.ayase.kanagawa.jp/soshiki/shokosinkoka/shogyotanto/sangyoshinko/5/2378.html",
    "checked": "2026-10-31",
    "note": "受付は先着順（予算到達で終了）で、申請内容の審査はあるが競争採択ではない。活用実績ページ（店舗開業2304・店舗改装17985・商品開発2305）は採択店舗の紹介のみで申請件数の公表なし。採択率の概念が成り立ちにくいためnone。"
  },
  "kanagawa_digital": {
    "status": "published",
    "rate": 86.7,
    "round": "令和7年度（前年度・年度合計）",
    "adopted": 387,
    "applied": 446,
    "source": "https://www.pref.kanagawa.jp/docs/m2w/shokibo_digital/r8.html",
    "checked": "2026-10-31",
    "note": "県の令和8年度制度ページ『前年度の採択結果について（令和7年度…補助金）採択件数387/446件 採択率86.7%』と明記。令和8年度は先着順受付（予算到達で終了、公募期間4/15〜9/30）で結果未公表。"
  },
  "kanagawa_seisansei": {
    "status": "computed",
    "rate": 66.8,
    "round": "令和7年度（6月・7月・8月公募＋2次公募の年度合計）",
    "adopted": 1054,
    "applied": 1579,
    "source": "https://r7seisansei.pref.kanagawa.jp/",
    "checked": "2026-10-31",
    "note": "令和7年度ポータル『1,579件の申請がありました。そのうち、1,054件を交付決定』から1054/1579=66.75%。採択でなく交付決定件数ベース（交付決定後の廃止者があるため採択事業者一覧PDFの件数とは一致しない旨の注記あり）。公募回別の内訳は非公表。令和8年度（r8seisansei、6〜8月公募・創業者成長支援枠）は交付審査中で結果未公表。"
  },
  "kanagawa_yamato_koten": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（募集4/1〜6/30、終了）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.yamato.lg.jp/gyosei/soshik/40/sangyo/shogyo/shien_seibi_todokede/23892.html",
    "checked": "2026-10-31",
    "note": "プレゼン・選考委員会による審査あり（競争採択型）だが、制度ページに採択件数・申請件数の公表なし。事務事業評価（令和5年度分以降は組織別公表）もWeb検索の範囲では本事業の件数を確認できず。"
  },
  "kanagawa_yokohama_shingijutsu": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（2026-10-22記者発表）",
    "adopted": 6,
    "applied": null,
    "source": "https://www.city.yokohama.lg.jp/city-info/koho-kocho/press/keizai/2026/1022shingijyutu.html",
    "checked": "2026-10-31",
    "note": "記者発表と支援実績ページ（jisseki/2026kouhukigyo.html、採択番号2026YC01〜06）で採択6件は確認。記者発表PDF本文にも申請件数の記載なし（審査会の審議内容は非公開）。前年度令和7年度も採択7件のみ公表。申請件数がないため算出不可。脱炭素取組宣言の入札加点脚注とは無関係。"
  },
  "kanagawa_yokosuka_ict": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（横須賀商工会議所の『はじめの一歩事業』）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.yokosuka.kanagawa.jp/4402/sangyoshinko/shokibojigyosha_ict_shien.html",
    "checked": "2026-10-31",
    "note": "相談→ICT専門家と伴走で計画作成→審査会で計画承認、の伴走型（チラシhazimmeno.pdfを画像化して目視確認）。申請件数・承認件数の公表は市ページ・チラシとも無し。競争採択というより伴走後の承認制。"
  },
  "kanagawa_yokosuka_senshinteki": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（旧ものづくり技術開発促進事業補助金、募集期間の記載なし）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.yokosuka.kanagawa.jp/4421/g_info/l100050805.html",
    "checked": "2026-10-31",
    "note": "『事業計画の内容を審査した上で補助対象企業を決定』とあるが、採択件数・申請件数の公表なし。中小企業振興プラン（第2期）にH23〜28年度の6年間で12件という累計交付実績のみ（申請件数なし・古い）。"
  },
  "monodukuri": {
    "status": "none",
    "rate": null,
    "round": "第1回",
    "adopted": null,
    "applied": null,
    "source": "https://shinjigyou-monodukuri.smrj.go.jp/",
    "checked": "2026-10-31",
    "note": "第1回は2026-10-30 18:00に受付を締め切ったばかりで、採択結果はまだ出ていない"
  },
  "saitama_dx": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（第1期〜第3期・追加募集）",
    "adopted": null,
    "applied": null,
    "source": "https://dxdounyushienhozyo.pref.saitama.lg.jp/",
    "checked": "2026-10-31",
    "note": "審査型（公募要領『先着順ではありません』『予算額の範囲内で審査の上、交付決定』）。2026-10-31 11:34時点の特設サイト・県ページ(https://www.pref.saitama.lg.jp/a0803/dx_jigyousyashien/dx_index.html)には採択件数・申請件数の掲載なし。第1期の結果通知見込みは9月下旬頃と公募要領にあるが、件数の公表は見当たらず。"
  },
  "saitama_saitama_dx": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（公募 R8.4.6〜5.20）",
    "adopted": null,
    "applied": null,
    "source": "https://www.sozo-saitama.or.jp/topic/dx-subsidy/",
    "checked": "2026-10-31",
    "note": "審査型（先着順ではない）。公募ページに『採択件数：20件程度』（予定枠）はあるが、採択実績件数・応募件数の公表は財団サイトで見つからず。予定枠20件は実績ではないので使っていない。"
  },
  "saitama_saitama_setsubi": {
    "status": "none",
    "rate": null,
    "round": "第1回（R7.9.2〜10.3）／第2回（R8.3.13受付開始）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.saitama.lg.jp/005/001/002/p123535.html",
    "checked": "2026-10-31",
    "note": "採択率の概念が成り立たない制度。消印日等による先着順受付で『予算額に達し次第受付終了、同日に予算残額を上回る申請があった場合は抽選』と市ページに明記。採点による競争採択ではない。"
  },
  "saitama_shoryokuka": {
    "status": "computed",
    "rate": 45.3,
    "round": "令和8年度（公募 R8.5.25〜7.17、交付決定 R8.9.18）",
    "adopted": 254,
    "applied": 561,
    "source": "https://www.pref.saitama.lg.jp/a0805/shoryokuka/index.html",
    "checked": "2026-10-31",
    "note": "県ページに『申請件数561件（新規導入290件、設備更新271件）のうち、審査の結果254件（新規導入133件、設備更新121件）について交付決定』。254/561=45.3%（rateは百分率）。内訳：新規導入45.9%（133/290）、設備更新44.6%（121/271）。"
  },
  "saitama_tokorozawa_monozukuri": {
    "status": "none",
    "rate": null,
    "round": "令和5年度（採択件数のみ判明）",
    "adopted": 14,
    "applied": null,
    "source": "https://www.city.tokorozawa.saitama.jp/shiseijoho/gyouseihyoka/hyokakeka/r6/r6shisakuhyouka.files/r6_5.pdf",
    "checked": "2026-10-31",
    "note": "審査型（募集要領に経済波及性等の審査基準と加点・減点あり）だが、令和8年度は1次・2次募集の後、3次は『随時受付・審査を行い予算額に達した時点で終了』。令和6年度施策評価表に前年度（R5）『採択件数は14件』とあるが申請件数の記載なし→割り算できないため none。制度ページに採択結果の掲載なし。"
  },
  "saitama_tokorozawa_toshigata": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（募集 R8.4.1〜9.30、プレゼン審査 R8.11頃予定）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.html",
    "checked": "2026-10-31",
    "note": "書類＋プレゼン審査で最大5件（R8募集要領）。R8回は審査前。過去回の申請件数・選定件数の公表は見つからず（施策評価表には交付件数の指標名があるが申請件数なし）。"
  },
  "seichou_kasokuka": {
    "status": "computed",
    "rate": 25.7,
    "round": "2次公募（追加採択込み）",
    "adopted": 224,
    "applied": 872,
    "source": "https://growth-100-oku.smrj.go.jp/info/info260819.html",
    "checked": "2026-10-31",
    "note": "有効申請872件（2026-08-04発表）と、追加採択後の採択者 n=224（2026-08-19の各種指標PDF）で割り算。8/4時点の採択は223件（25.6%）。事務局が出しているのは「採択倍率 約3.9倍」だけで、採択率は出ていない。3次公募の結果はまだ"
  },
  "shoene_hikaseki": {
    "status": "published",
    "rate": 92.7,
    "round": "令和7年度補正 2次公募",
    "adopted": 1307,
    "applied": 1410,
    "source": "https://sii.or.jp/setsubi07r/uploads/r7h_st_shouene_saitakukekka_2.pdf",
    "checked": "2026-10-31",
    "note": "SIIの採択結果PDF（2026-09-09交付決定）の「(Ⅲ)設備単位型／(Ⅲ)GX設備単位型」の採択率。従来枠だけの数字はない（トップ性能枠・メーカー強化枠と合算）。3次（9/28締切）の結果はまだ"
  },
  "shoryokuka": {
    "status": "computed",
    "rate": 63.9,
    "round": "第6回",
    "adopted": 1176,
    "applied": 1841,
    "source": "https://mirasapo-plus.go.jp/infomation/32507/",
    "checked": "2026-10-31",
    "note": "中小企業庁（ミラサポplus）2026-08-28の発表「申請数1,841者、採択数1,176者」で割り算（63.88%）。採択率そのものは出ていない。第7回（7/31締切）は11月中旬に採択発表予定"
  },
  "tochigi_ashikaga_shinko": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（申請6/1〜6/30、審査会7月下旬、交付決定8月上旬）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.ashikaga.tochigi.jp/industory/000058/000305/000701/p008322.html",
    "checked": "2026-10-31",
    "note": "プレゼン審査会で交付額を決定する方式。補助事業終了後に事業所名・テーマを公表とあるが、制度ページに申請件数・採択件数の記載なし。Web検索（市ドメイン）でも総合計画実施状況等から件数を特定できず。"
  },
  "tokyo_adachi_kaizen": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（随時受付）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.adachi.tokyo.jp/s-shinko/shigoto/chushokigyo/yushi-monozukuri.html",
    "checked": "2026-10-31",
    "note": "制度ページは申請期間（令和8年5月1日〜令和9年1月29日）と事前相談のみで、採択・申請件数の記載なし。年度内随時受付で回ごとの競争採択ではなく採択率の概念が成り立ちにくい。議会・決算資料の実績も見つからず。"
  },
  "tokyo_edogawa_dx": {
    "status": "none",
    "rate": null,
    "round": "令和8年度第3回募集中（第1・2回は受付終了）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.edogawa.tokyo.jp/e093/shigotosangyo/jigyosha_oen/sangyo_jigyosya/jyosei/seisanseikojo/dounyu.html",
    "checked": "2026-10-31",
    "note": "一次（書類）・二次（プレゼン）審査ありの競争型。過年度の助成事業者一覧は載っているが申請件数の公表なし。事務事業評価等でも見つからず。"
  },
  "tokyo_fuchu_hanro": {
    "status": "none",
    "rate": null,
    "round": "2026年度（第1回4/30締切、以降毎月20日締切、最終9/30・受付終了）",
    "adopted": null,
    "applied": null,
    "source": "https://www.tama5cci.or.jp/chamber/2026/challenge/index.html",
    "checked": "2026-10-31",
    "note": "毎月締切・予算がなくなり次第終了の方式。採択・申請件数の公表なし。"
  },
  "tokyo_hachioji_keizoku": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（随時受付）",
    "adopted": null,
    "applied": null,
    "source": "https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/koboyouryo.pdf",
    "checked": "2026-10-31",
    "note": "公募要領：受付期間 令和8年4月1日〜令和9年1月31日、『予算がなくなり次第、受付は終了』『申請受付後、随時に採択』。審査で不採択もあり得るが回ごとの競争採択ではなく、件数の公表もない。"
  },
  "tokyo_nerima_challenge": {
    "status": "none",
    "rate": null,
    "round": "令和8年度下期（8/1〜8/31受付、通知10月下旬頃）",
    "adopted": null,
    "applied": null,
    "source": "https://nerima-idc.or.jp/bsc/yuushi/hojokin.html#challenge",
    "checked": "2026-10-31",
    "note": "外部審査の競争型、採択予定数は各期15件（予定数であり実績ではない）。申請件数・採択実績の公表は見つからず。"
  },
  "tokyo_shinagawa_digital": {
    "status": "none",
    "rate": null,
    "round": "令和8年度",
    "adopted": null,
    "applied": null,
    "source": "https://shinagawa-dx-digital.com/digital_subsidy/",
    "checked": "2026-10-31",
    "note": "書類審査・現地ヒアリングあり、ただし『予算に達した時点で募集を締め切り』。採択・申請件数の公表なし（区議会資料・産業ニュースも確認したが該当数字なし）。"
  },
  "tokyo_sogyo": {
    "status": "computed",
    "rate": 16.4,
    "round": "令和7年度（第1回＋第2回の年度合計）",
    "adopted": 201,
    "applied": 1225,
    "source": "https://startup-station.jp/m2/services/sogyokassei/sogyojosei-saitaku/",
    "checked": "2026-10-31",
    "note": "公式の採択情報ページは申請者数を年度単位でしか載せていない（R7: 申請1,225・採択201）。回別は採択数のみ（R7第1回93件、R7第2回108件、R8第1回104件=最新回だが申請数未公表）。当サイト記載の『R7第2回 17.1%(108/632)』の632は、2026-10-31時点の公式ページ・採択者PDF・都報道発表のいずれでも確認できず、根拠不明として差し替えを推奨。"
  },
  "tokyo_soui": {
    "status": "none",
    "rate": null,
    "round": "令和8年度（新規事業。第1・2回受付終了、第3回11/2〜11/13）",
    "adopted": null,
    "applied": null,
    "source": "https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/",
    "checked": "2026-10-31",
    "note": "令和8年度新設。先着順ではない審査型だが、採択件数・申請件数の公表は見つからず。"
  }
},
  // key → { rank: 'A'|'B'|'C'|null, label, status, rate }。対象外（助成金タイプ）は null
  rankOf: function (key) {
    var p = this.programs[key];
    if (!p) return null;
    if (p.status === 'none' || typeof p.rate !== 'number') {
      return { rank: null, label: '採択率非公表', status: p.status, rate: null };
    }
    var rank = p.rate >= 75 ? 'A' : p.rate > 50 ? 'B' : 'C';
    return { rank: rank, label: '採択率' + rank, status: p.status, rate: p.rate };
  }
};

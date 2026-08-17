// PROGRAM_DOCS: 各制度の様式・提出書類データ。
// index.htmlの表示では一切使われず、documents.html/program.html用の
// page_data.js（_tools/build_page_data.py が生成）の材料としてのみ使う。
// 通常訪問者に不要な約240KBを初回ダウンロードから外すため、
// 2026-08-15にindex.html本体から分離した。
// 中身を変更したら python3 _tools/build_page_data.py を必ず流し直すこと。
(function (global) {
  'use strict';
  var PROGRAM_DOCS = {
    // 2026-08-06に差し替え。それまでここに並べていた農林水産省 260326_040-1 の資料は、
    // 飲食事業者へ専門家を派遣する「支援側の団体」を選ぶ別の公募のものだった。
    // 飲食店が申請する側の資料は、事務局（日本能率協会コンサルティング）が
    // 公募要領と様式をまとめた1つのZIPで配っている。
    food_labor: {
      checked: '2026-08-06',
      portal: { label: '事務局（日本能率協会コンサルティング）ご案内ページ', url: 'https://jmac-foods.com/news/2722/' },
      // 事務局は「することリスト（業務項目一覧）.xlsx」も配っているが、ここには載せない。
      // 申請様式ではなく業務の洗い出し用の資料なのに、拡張子が .xlsx なので
      // documents.html の自動入力（FILLABLE_RE）が「記入できる様式」と判定してしまう。
      // 会社名や代表者名を書き込む対象ではないため、リンクは note の文章で案内する。
      note: '公募は2026年5月29日17時で受付を終了しています（2026年8月6日に事務局の告知を確認）。まず2ページのパンフレットで全体像をつかんでから、公募要領に進むのが読みやすい順番です。<strong>申請様式は単体では配布されておらず、公募要領と一緒に1つのZIPにまとまっています</strong>。中身は「公募要領（PDF・18ページ）」「別紙様式1、2、5（Word）」「別紙様式3 スケジュール（Excel）」「別紙様式4 経費内訳書（Excel）」の4点です。そのため、このサイトの自動入力（会社情報の書き込み）はこの制度では使えません。なお事務局は、自分のお店の業務を洗い出すための「することリスト（業務項目一覧）」も配っています（申請様式ではありません）。ご案内ページからお取りください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募パンフレット（2ページ・全体像とよくある質問）', url: 'https://jmac-foods.com/app/wp-content/uploads/2026/04/R7%E9%A3%B2%E9%A3%9F%E6%A5%AD%E5%8A%B4%E5%83%8D%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A%E6%94%AF%E6%8F%B4%E8%A3%9C%E5%8A%A9%E9%87%91_%E5%85%AC%E5%8B%9F%E3%83%91%E3%83%B3%E3%83%95%E3%83%AC%E3%83%83%E3%83%88.pdf', type: 'PDF', size: '485KB' },
          { name: 'Q&Aセミナー資料（36ページ・補助額の例や事業の流れが図で分かる）', url: 'https://jmac-foods.com/app/wp-content/uploads/2026/04/R7%E9%A3%B2%E9%A3%9F%E6%A5%AD%E5%8A%B4%E5%83%8D%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A%E6%94%AF%E6%8F%B4%E8%A3%9C%E5%8A%A9%E9%87%91_QA%E3%82%BB%E3%83%9F%E3%83%8A%E3%83%BC%E8%B3%87%E6%96%99.pdf', type: 'PDF', size: '2.3MB' },
          { name: '飲食店の未来を変える 自動化・省力化ガイドブック（補助対象事業はこれに沿った内容であることが必要）', url: 'https://jmac-foods.com/app/wp-content/uploads/2026/03/syoryokuka-3.pdf', type: 'PDF', size: '1.1MB' },
        ] },
        { phase: '応募', items: [
          { name: '公募要領・様式一式（ZIP）', url: 'https://jmac-foods.com/app/wp-content/uploads/2026/04/R7%E8%A3%9C%E6%AD%A3-%E9%A3%B2%E9%A3%9F%E6%A5%AD%E5%8A%B4%E5%83%8D%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A%E6%94%AF%E6%8F%B4%E8%A3%9C%E5%8A%A9%E9%87%91_%E5%85%AC%E5%8B%9F%E8%A6%81%E9%A0%98%E3%80%81%E6%A7%98%E5%BC%8F%E4%B8%80%E5%BC%8F.zip', type: 'ZIP', size: '597KB' }
        ] },
        { phase: '採択されたあと', items: [
          { name: '実施規程・様式・別表（ZIP／交付申請と実施結果報告で使います）', url: 'https://jmac-foods.com/app/wp-content/uploads/2026/04/R7%E8%A3%9C%E6%AD%A3-%E9%A3%B2%E9%A3%9F%E6%A5%AD%E5%8A%B4%E5%83%8D%E7%94%9F%E7%94%A3%E6%80%A7%E5%90%91%E4%B8%8A%E6%8E%A8%E9%80%B2%E7%B7%8A%E6%80%A5%E5%AF%BE%E7%AD%96%E4%BA%8B%E6%A5%AD_%E5%AE%9F%E6%96%BD%E8%A6%8F%E7%A8%8B%E3%80%81%E6%A7%98%E5%BC%8F%E3%80%81%E5%88%A5%E8%A1%A8.zip', type: 'ZIP', size: '381KB' }
        ] },
        { phase: '根拠となる国の事業', items: [
          { name: '農林水産省 令和7年度補正 飲食業労働生産性向上推進緊急対策事業（事務局を選ぶ公募）', url: 'https://www.maff.go.jp/j/supply/hozyo/kanbo/251217_040-1.html', type: 'Web', size: '' },
          { name: '食品産業省力化投資促進緊急対策事業補助金交付等要綱（案）', url: 'https://www.maff.go.jp/j/supply/hozyo/kanbo/attach/pdf/251217_040-1-4.pdf', type: 'PDF', size: '656KB' }
        ] }
      ]
    },
    monodukuri: {
      checked: '2026-07-31',
      portal: { label: '資料ダウンロード（公式）', url: 'https://shinjigyou-monodukuri.smrj.go.jp/document' },
      note: '申請そのものは電子申請システムに入力する方式のため、申請書の単体ファイルは公開されていません。ここにあるのは、申請に添付する参考様式・確認書です。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '第1回 公募要領', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_application_guidelines_01.pdf', type: 'PDF', size: '1.8MB' },
          { name: '新市場・高付加価値事業の考え方', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_new_market_high_value_added_biz_concept.pdf', type: 'PDF', size: '737KB' },
          { name: '＜参考＞再生事業者に係る確認書（再生事業者加点を希望する場合）', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_reference_rehab_biz_confirmation.pdf', type: 'PDF', size: '232KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '参考様式 労働者名簿', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_employee_list.xlsx', type: 'Excel', size: '27KB' },
          { name: '金融機関による確認書（金融機関等から資金提供を受ける場合）', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_financial_institution_confirmation.docx', type: 'Word', size: '64KB' },
          { name: 'リース取引に係る宣誓書（リース会社と共同申請する場合）', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_finance_lease_declaration.docx', type: 'Word', size: '50KB' },
          { name: '【特定調停】誓約書様式（再生事業者加点を希望する場合）', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_specified_conciliation_pledge.docx', type: 'Word', size: '35KB' },
          { name: '【私的整理ガイドライン】再生事業者確認様式', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_private_workout_guide_rehab_biz_confirmation.docx', type: 'Word', size: '37KB' },
          { name: '【中小企業版私的整理ガイドライン】再生事業者確認様式', url: 'https://shinjigyou-monodukuri.smrj.go.jp/assets/documents/shinmono_sme_private_workout_guide_rehab_biz_confirmation.docx', type: 'Word', size: '37KB' }
        ] }
      ]
    },
    kanagawa_ebina_shinko: {
      checked: '2026-07-31',
      portal: { label: '海老名市 公式ページ', url: 'https://www.city.ebina.kanagawa.jp/guide/shoko/chusho/1003742.html' },
      note: '申請の入口は「エントリー用紙」です。エントリーのあとに、市から詳しい書類の案内があります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '補助事業チラシ', url: 'https://www.city.ebina.kanagawa.jp/_res/projects/default_project/_page_/001/003/742/2026chirashi1.pdf', type: 'PDF', size: '418KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'エントリー用紙', url: 'https://www.city.ebina.kanagawa.jp/_res/projects/default_project/_page_/001/003/742/2026entry.doc', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    kanagawa_yokosuka_ict: {
      checked: '2026-07-31',
      portal: { label: '横須賀市 公式ページ', url: 'https://www.city.yokosuka.kanagawa.jp/4402/sangyoshinko/shokibojigyosha_ict_shien.html' },
      note: 'チラシと申込書が1つのPDFになっています。印刷して記入する方式です。',
      groups: [
        { phase: '交付申請', items: [
          { name: '令和8年度小規模事業者ICT支援補助金 チラシ・申込書', url: 'https://www.city.yokosuka.kanagawa.jp/4402/sangyoshinko/documents/hazimmeno.pdf', type: 'PDF', size: '784KB' }
        ] }
      ]
    },
    akiya: {
      // 令和5年度の資料（事業概要001625069・募集要領001625070）が載っていた。
      // 参照元の公式ページURLが3年古いままだったのが原因。2026-08-05に令和8年度へ差し替え。
      checked: '2026-08-05',
      portal: { label: '国土交通省 令和8年度の募集ページ', url: 'https://www.mlit.go.jp/jutakukentiku/house/jutakukentiku_house_fr3_000070.html' },
      note: '令和8年度の応募は2026年5月20日（水）正午で締め切られました。次回の募集は公式ページでご確認ください。下の様式は令和8年度のものです。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要領', url: 'https://www.mlit.go.jp/jutakukentiku/house/content/001997003.pdf', type: 'PDF', size: '733KB' },
          { name: '別添資料 経費の内訳費目について', url: 'https://www.mlit.go.jp/jutakukentiku/house/content/001997004.pdf', type: 'PDF', size: '893KB' }
        ] },
        { phase: '応募', items: [
          { name: '応募様式1-6', url: 'https://www.mlit.go.jp/jutakukentiku/house/content/001997012.xlsx', type: 'Excel', size: '78KB' },
          { name: '応募様式7', url: 'https://www.mlit.go.jp/jutakukentiku/house/content/001997008.pptx', type: 'PowerPoint', size: '59KB' },
          { name: '応募様式8', url: 'https://www.mlit.go.jp/jutakukentiku/house/content/001997009.docx', type: 'Word', size: '27KB' }
        ] }
      ]
    },
    jigyou_shoukei_ma: {
      checked: '2026-08-10',
      portal: { label: '事業承継・M&A補助金 公式サイト', url: 'https://shoukei-mahojokin.go.jp/' },
      note: '専門家活用枠（買い手支援類型・売り手支援類型）15次公募の様式です。15次公募の申請受付は2026年7月24日で終了しており、現在は交付申請段階です。次回公募（16次）の様式は公式サイトでご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '専門家活用枠 公募要領（買い手支援類型・売り手支援類型）', url: 'https://shoukei-mahojokin.go.jp/assets/documents/r7h/15-experts/requirements_experts_15.pdf', type: 'PDF', size: '1.2MB' },
          { name: 'パンフレット（15次公募）', url: 'https://shoukei-mahojokin.go.jp/assets/documents/r7h/15-experts/a4_pamphlet_15-experts.pdf', type: 'PDF', size: '1.3MB' },
          { name: '必要書類チェックリスト（買い手・売り手支援類型）', url: 'https://shoukei-mahojokin.go.jp/assets/documents/r7h/15-experts/check-list_experts.xlsx', type: 'Excel', size: '33KB' }
        ] }
      ]
    },
    trial_koyou: {
      checked: '2026-08-10',
      portal: { label: '厚生労働省 公式ページ（申請様式ダウンロード）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/trial_koyou_dl.html' },
      note: '一般トライアルコースの様式です。トライアル雇用の開始前にハローワーク等の紹介を受けていることが前提条件のため、募集要項で対象かどうかを先にご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '支給要領', url: 'https://www.mhlw.go.jp/content/001688848.pdf', type: 'PDF', size: '224KB' }
        ] },
        { phase: '雇入れ前', items: [
          { name: 'トライアル雇用実施計画書（共通様式第1号）', url: 'https://www.mhlw.go.jp/content/001688684.xlsx', type: 'Excel', size: '30KB' },
          { name: 'トライアル雇用対象者確認票', url: 'https://www.mhlw.go.jp/content/001688687.xlsx', type: 'Excel', size: '18KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/001688701.docx', type: 'Word', size: '55KB' },
          { name: 'トライアル雇用結果報告書兼支給申請書（共通様式第2号）', url: 'https://www.mhlw.go.jp/content/001688704.xlsx', type: 'Excel', size: '49KB' }
        ] }
      ]
    },
    koyou_65sai: {
      checked: '2026-08-10',
      portal: { label: '独立行政法人 高齢・障害・求職者雇用支援機構（JEED）65歳超継続雇用促進コース 様式ダウンロード', url: 'https://www.jeed.go.jp/elderly/subsidy/subsidy_keizoku_yousiki07.html' },
      note: '65歳超継続雇用促進コースの様式です。定年引上げ・廃止・継続雇用制度導入の内容と対象被保険者数により支給額が異なるため、募集要項で該当する内容を先にご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '65歳超継続雇用促進コース 支給申請の手引き', url: 'https://www.jeed.go.jp/elderly/subsidy/q2k4vk000001h38d-att/f41obh0000005nna.pdf', type: 'PDF', size: '1.2MB' }
        ] },
        { phase: '支給申請', items: [
          { name: '継続様式第2号（1）支給申請書', url: 'https://www.jeed.go.jp/elderly/subsidy/v1tt1c0000000ryq-att/v1tt1c0000000s1r.xlsx', type: 'Excel', size: '88KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.jeed.go.jp/elderly/subsidy/v1tt1c0000000ryq-att/v1tt1c0000000s3r.docx', type: 'Word', size: '51KB' },
          { name: '記入例 65歳超継続雇用促進コース申請書類', url: 'https://www.jeed.go.jp/elderly/subsidy/v1tt1c0000000ryq-att/s8vmin00000026wm.pdf', type: 'PDF', size: '1.2MB' }
        ] }
      ]
    },
    tokutei_kyufu: {
      checked: '2026-08-10',
      portal: { label: '厚生労働省 公式ページ（中高年層安定雇用支援コース）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/koyou/kyufukin/chuukou.html' },
      note: '中高年層安定雇用支援コースの様式です。ハローワーク等の紹介を経ずに独自に採用した労働者は対象外のため、募集要項で対象かどうかを先にご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'パンフレット（事業主向け）', url: 'https://www.mhlw.go.jp/content/11600000/001690059.pdf', type: 'PDF', size: '542KB' },
          { name: '支給要領', url: 'https://www.mhlw.go.jp/content/11600000/001684363.pdf', type: 'PDF', size: '423KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 第1期共通申請書', url: 'https://www.mhlw.go.jp/content/11600000/001679117.xlsx', type: 'Excel', size: '72KB' },
          { name: '様式第4号 第2〜6期支給申請書', url: 'https://www.mhlw.go.jp/content/11600000/001679130.xlsx', type: 'Excel', size: '54KB' }
        ] }
      ]
    },
    jinzai_kakuho: {
      checked: '2026-08-10',
      portal: { label: '厚生労働省 公式ページ（雇用管理制度・雇用環境整備助成コース）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000199292_00005.html' },
      note: '雇用管理制度・雇用環境整備助成コースの様式です（令和8年4月8日以降提出分）。雇用管理制度等整備計画の認定を先に受ける必要があるため、募集要項で手続きの流れを先にご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '人材確保等支援助成金のご案内（雇用管理制度・雇用環境整備助成コース）', url: 'https://www.mhlw.go.jp/content/11600000/001688568.pdf', type: 'PDF', size: '718KB' },
          { name: 'チェックリスト（計画届関係）', url: 'https://www.mhlw.go.jp/content/11600000/001678209.xlsx', type: 'Excel', size: '26KB' }
        ] },
        { phase: '計画の認定申請', items: [
          { name: '様式第a-1号 雇用管理制度等整備計画書', url: 'https://www.mhlw.go.jp/content/11600000/001688291.docx', type: 'Word', size: '56KB' },
          { name: '様式第a-2号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11600000/001469245.xlsx', type: 'Excel', size: '16KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第a-6号 支給申請書', url: 'https://www.mhlw.go.jp/content/11600000/001688295.docx', type: 'Word', size: '61KB' }
        ] }
      ]
    },
    tokyo_sogyo: {
      checked: '2026-07-31',
      portal: { label: 'TOKYO創業ステーション 公式ページ', url: 'https://startup-station.jp/m2/services/sogyokassei/' },
      note: '申請書はZIP（圧縮ファイル）でまとめて配布されています。パソコンでダウンロードし、展開してからお使いください。様式集は採択されたあとに使うものです。募集要領は90ページと大きいので、まずチラシで全体像をつかんでから読むのがおすすめです。',
      groups: [
        // 募集要領本体は公式ページに直リンクが無く（チラシと申請書ZIPのみ）、
        // 2026-08-18の制度種別の洗い直しで探し直して見つけた。審査方法（書類審査
        // →面接審査→総合審査会）が書かれているのはこの本体だけなので、チラシでは
        // 制度の性質が判断できない。90ページ・8.6MB（2026-08-18に実測）。
        { phase: '申請の前に読む', items: [
          { name: '募集要領（令和8年度第2回）', url: 'https://startup-station.jp/wp-content/uploads/r8_2_bosyuyoko_sogyojosei_20260616.pdf', type: 'PDF', size: '8.6MB' },
          { name: '募集案内チラシ', url: 'https://startup-station.jp/wp-content/uploads/r8_flyer_sogyojosei.pdf', type: 'PDF', size: '250KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '令和8年度第2回 創業助成事業 申請書一式（ZIP）', url: 'https://startup-station.jp/wp-content/uploads/r8_2_sogyojosei_shinsei_20260616.zip', type: 'ZIP', size: '943KB' }
        ] }
      ]
    },
    kanagawa_sagamihara_shoene: {
      checked: '2026-07-31',
      portal: { label: '相模原市 申請書ダウンロード', url: 'https://www.city.sagamihara.kanagawa.jp/shinseisho_menu/kankyohozen/1011711.html' },
      note: '様式はZIP（圧縮ファイル）に一式でまとまっています。パソコンでダウンロードし、展開してからお使いください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '（令和8年度）補助制度のご案内', url: 'https://www.city.sagamihara.kanagawa.jp/_res/projects/default_project/_page_/001/008/084/r08_annai.pdf', type: 'PDF', size: '1.5MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書類一式（ZIP）', url: 'https://www.city.sagamihara.kanagawa.jp/_res/projects/default_project/_page_/001/011/711/20260511.zip', type: 'ZIP', size: '248KB' }
        ] }
      ]
    },
    ai: {
      checked: '2026-07-31',
      portal: { label: '資料ダウンロード（公式）', url: 'https://it-shien.smrj.go.jp/download/' },
      note: '公式の資料ダウンロードページで確認できたのは下記です。単体の申請様式ファイルは掲載されておらず、手続きはマニュアルに沿って進めます。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領（通常枠）', url: 'https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf', type: 'PDF', size: '1.1MB' },
          { name: '交付規程（通常枠）', url: 'https://it-shien.smrj.go.jp/pdf/it2026_kitei_tsujyo.pdf', type: 'PDF', size: '454KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請マニュアル', url: 'https://it-shien.smrj.go.jp/pdf/it2026_manual_kofu.pdf', type: 'PDF', size: '14.1MB' }
        ] },
        { phase: '事業実績報告（採択後）', items: [
          { name: '事業実績報告マニュアル', url: 'https://it-shien.smrj.go.jp/pdf/it2026_manual_jisseki.pdf', type: 'PDF', size: '10.0MB' },
          { name: '請求・支払内訳シート', url: 'https://it-shien.smrj.go.jp/pdf/it2026_seikyushiharaiuchiwake_jisseki.xlsx', type: 'Excel', size: '35KB' }
        ] }
      ]
    },
    jizoku: {
      checked: '2026-07-31',
      portal: { label: '商工会議所地区の公式サイト', url: 'https://r6.jizokukahojokin.info/' },
      note: '公式サイトで確認できたのは公募要領と交付規程です。申請様式は電子申請システム上で入力する方式のため、単体ファイルとしては公開されていません。商工会地区の方は商工会の公式サイトをご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領（第20回・第8版）', url: 'https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf', type: 'PDF', size: '1.1MB' },
          { name: '交付規程（2026年3月6日改定）', url: 'https://r6.jizokukahojokin.info/doc/r6_kitei_260306_ip.pdf', type: 'PDF', size: '627KB' }
        ] }
      ]
    },
    kaizen: {
      checked: '2026-07-31',
      portal: { label: '厚生労働省 公式ページ', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/roudoukijun/zigyonushi/shienjigyou/03.html' },
      note: '令和8年度の申請分の様式です。交付申請と実績報告で使う様式が分かれています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '様式第1号 交付申請書', url: 'https://www.mhlw.go.jp/content/11200000/001691199.docx', type: 'Word', size: '51KB' },
          { name: '申請書等 簡易作成ツール', url: 'https://www.mhlw.go.jp/content/11200000/001733987.xlsx', type: 'Excel', size: '178KB' },
          { name: '物価高騰等要件に係る申出書（売上高総利益率）', url: 'https://www.mhlw.go.jp/content/11200000/001692000.docx', type: 'Word', size: '44KB' },
          { name: '物価高騰等要件に係る申出書（売上高営業利益率）', url: 'https://www.mhlw.go.jp/content/11200000/001692001.docx', type: 'Word', size: '44KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '様式第9号 事業実績報告書', url: 'https://www.mhlw.go.jp/content/11200000/001691204.docx', type: 'Word', size: '50KB' },
          { name: '様式第10号 支給申請書', url: 'https://www.mhlw.go.jp/content/11200000/001691205.docx', type: 'Word', size: '33KB' },
          { name: '様式第12号 消費税及び地方消費税に係る仕入控除税額報告書', url: 'https://www.mhlw.go.jp/content/11200000/001691206.docx', type: 'Word', size: '33KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '様式第3号 事業計画変更申請書', url: 'https://www.mhlw.go.jp/content/11200000/001691200.docx', type: 'Word', size: '37KB' },
          { name: '様式第7号 事業完了予定期日変更報告書', url: 'https://www.mhlw.go.jp/content/11200000/001691202.docx', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    shoryokuka: {
      checked: '2026-07-31',
      portal: { label: '資料ダウンロード（一般型・公式）', url: 'https://shoryokuka.smrj.go.jp/ippan/download/' },
      note: '第7回公募の資料です。電子申請には GビズIDプライムアカウント の取得が必要で、取得に日数がかかります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領（第7回公募）', url: 'https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf', type: 'PDF', size: '780KB' },
          { name: '交付規程', url: 'https://shoryokuka.smrj.go.jp/assets/pdf/application_rules.pdf', type: 'PDF', size: '707KB' },
          { name: '応募申請の手引き（第7回公募）', url: 'https://shoryokuka.smrj.go.jp/assets/pdf/oubo_manual_ippan_07.pdf', type: 'PDF', size: '5.6MB' },
          { name: '電子申請マニュアル（応募申請・第7回）', url: 'https://shoryokuka.smrj.go.jp/assets/pdf/electronic_application_manual_ippan_07.pdf', type: 'PDF', size: '6.2MB' }
        ] },
        { phase: '応募申請（書く様式）', items: [
          { name: '事業計画書（その1・その2）', url: 'https://shoryokuka.smrj.go.jp/assets/doc/yoshiki_business_plan_part1_part2_ippan.docx', type: 'Word', size: '81KB' },
          { name: '事業計画書（その3）', url: 'https://shoryokuka.smrj.go.jp/assets/xls/yoshiki_business_plan_part3_ippan.xlsx', type: 'Excel', size: '2.0MB' },
          { name: '1人当たり給与支給総額の確認書', url: 'https://shoryokuka.smrj.go.jp/assets/xls/yoshiki_salary_payment_total_confirmation_ippan_05-07.xlsx', type: 'Excel', size: '655KB' },
          { name: '事業場内最低賃金引き上げ要件確認書（第7回）', url: 'https://shoryokuka.smrj.go.jp/assets/xls/yoshiki_on-site_minimum_wage_increase_requirement_ippan_07.xlsx', type: 'Excel', size: '1.1MB' },
          { name: '地域別最低賃金引上げ要件確認書（第7回）', url: 'https://shoryokuka.smrj.go.jp/assets/xls/yoshiki_regional_minimum_wage_increase_requirement_ippan_07.xlsx', type: 'Excel', size: '2.1MB' }
        ] },
        { phase: '交付申請（採択後）', items: [
          { name: '交付申請の手引き', url: 'https://shoryokuka.smrj.go.jp/assets/pdf/application_manual_ippan_05.pdf', type: 'PDF', size: '2.2MB' },
          { name: '賃金引き上げ計画の表明書', url: 'https://shoryokuka.smrj.go.jp/assets/doc/yoshiki_reference_wage_increase_statement_ippan_05.docx', type: 'Word', size: '46KB' }
        ] }
      ]
    },
    hatarakikata: {
      checked: '2026-08-02',
      portal: { label: '厚生労働省 労働時間短縮・年休促進支援コース', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000120692.html' },
      note: '労働時間短縮・年休促進支援コースで使う様式です。勤務間インターバル導入コースは様式の番号は同じですがファイルが別なので、公式ページからお取りください。申請パンフレットは204ページ・約29MBあるので、通信環境にご注意ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度 リーフレット', url: 'https://www.mhlw.go.jp/content/001696150.pdf', type: 'PDF', size: '296KB' },
          { name: '交付要綱', url: 'https://www.mhlw.go.jp/content/001689316.pdf', type: 'PDF', size: '617KB' },
          { name: '支給要領', url: 'https://www.mhlw.go.jp/content/001696656.pdf', type: 'PDF', size: '449KB' },
          { name: '申請パンフレット（全コース共通・204ページ）', url: 'https://www.mhlw.go.jp/content/001696657.pdf', type: 'PDF', size: '29.2MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '様式第1号 交付申請書', url: 'https://www.mhlw.go.jp/content/001687895.docx', type: 'Word', size: '66KB' }
        ] },
        { phase: '事業の実施中', items: [
          { name: '様式第4号 事業実施計画変更申請書', url: 'https://www.mhlw.go.jp/content/001687896.docx', type: 'Word', size: '55KB' },
          { name: '様式第8号 事業実施予定期間変更報告書', url: 'https://www.mhlw.go.jp/content/001689620.docx', type: 'Word', size: '33KB' },
          { name: '様式第7号 事業中止・廃止承認申請書', url: 'https://www.mhlw.go.jp/content/001687897.docx', type: 'Word', size: '37KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第10号 支給申請書', url: 'https://www.mhlw.go.jp/content/001687902.docx', type: 'Word', size: '35KB' },
          { name: '様式第11号 事業実施結果報告書', url: 'https://www.mhlw.go.jp/content/001687903.docx', type: 'Word', size: '60KB' },
          { name: '様式第9号 事業実施状況報告書', url: 'https://www.mhlw.go.jp/content/001687899.docx', type: 'Word', size: '33KB' },
          { name: '様式第9号の2 支払状況報告書', url: 'https://www.mhlw.go.jp/content/001687900.docx', type: 'Word', size: '37KB' },
          { name: '就業規則申立書（働く人が10人未満で届出義務が無い場合）', url: 'https://www.mhlw.go.jp/content/001687906.docx', type: 'Word', size: '47KB' }
        ] },
        { phase: '支給後', items: [
          { name: '様式第13号 消費税額確定報告書', url: 'https://www.mhlw.go.jp/content/001687904.docx', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    career: {
      checked: '2026-07-31',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '取組を始める前にキャリアアップ計画書の提出が必要です。正社員化コースで使う様式だけを載せています。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式1-1 正社員化コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001688075.xlsx', type: 'Excel', size: '48KB' },
          { name: '別添様式1-2 正社員化コース対象労働者詳細', url: 'https://www.mhlw.go.jp/content/11909000/001619196.xlsx', type: 'Excel', size: '79KB' }
        ] }
      ]
    },
    career_shoyo: {
      checked: '2026-08-02',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '掲載しているのは令和8年4月8日以降版のキャリアアップ計画書です。賞与・退職金制度導入コースで使う様式だけを載せています。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' },
          { name: '様式第2号 キャリアアップ計画書（変更届）', url: 'https://www.mhlw.go.jp/content/11909000/001688050.docx', type: 'Word', size: '100KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式5 賞与・退職金制度導入コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001470108.xlsx', type: 'Excel', size: '54KB' },
          { name: '別添様式5 内訳（継紙）', url: 'https://www.mhlw.go.jp/content/11909000/001470110.xlsx', type: 'Excel', size: '17KB' },
          { name: '様式第4号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11650000/001083034.docx', type: 'Word', size: '26KB' },
          { name: '賃金台帳等に関する確認書（ひな形）', url: 'https://www.mhlw.go.jp/content/11909000/001239272.docx', type: 'Word', size: '21KB' },
          { name: '申立書（就業規則の届出義務が無い場合の例示様式）', url: 'https://www.mhlw.go.jp/content/11650000/001083042.docx', type: 'Word', size: '18KB' },
          { name: '常時雇用する労働者数に係る疎明書（例示様式）', url: 'https://www.mhlw.go.jp/content/11909000/001511315.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    career_kaitei: {
      checked: '2026-08-02',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '掲載しているのは令和8年4月8日以降版のキャリアアップ計画書です。賃金規定等改定コースで使う様式だけを載せています。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' },
          { name: '様式第2号 キャリアアップ計画書（変更届）', url: 'https://www.mhlw.go.jp/content/11909000/001688050.docx', type: 'Word', size: '100KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式3 賃金規定等改定コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001683499.xlsx', type: 'Excel', size: '64KB' },
          { name: '別添様式3 内訳（継紙）', url: 'https://www.mhlw.go.jp/content/11909000/001683586.xlsx', type: 'Excel', size: '24KB' },
          { name: '様式第4号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11650000/001083034.docx', type: 'Word', size: '26KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' },
          { name: '賃金台帳等に関する確認書（ひな形）', url: 'https://www.mhlw.go.jp/content/11909000/001239272.docx', type: 'Word', size: '21KB' },
          { name: '申立書（就業規則の届出義務が無い場合の例示様式）', url: 'https://www.mhlw.go.jp/content/11650000/001083042.docx', type: 'Word', size: '18KB' },
          { name: '常時雇用する労働者数に係る疎明書（例示様式）', url: 'https://www.mhlw.go.jp/content/11909000/001511315.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    career_kyotsu: {
      checked: '2026-08-02',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '掲載しているのは令和8年4月8日以降版のキャリアアップ計画書です。賃金規定等共通化コースで使う様式だけを載せています。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' },
          { name: '様式第2号 キャリアアップ計画書（変更届）', url: 'https://www.mhlw.go.jp/content/11909000/001688050.docx', type: 'Word', size: '100KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式4 賃金規定等共通化コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001470106.xlsx', type: 'Excel', size: '60KB' },
          { name: '様式第4号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11650000/001083034.docx', type: 'Word', size: '26KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' },
          { name: '賃金台帳等に関する確認書（ひな形）', url: 'https://www.mhlw.go.jp/content/11909000/001239272.docx', type: 'Word', size: '21KB' },
          { name: '申立書（就業規則の届出義務が無い場合の例示様式）', url: 'https://www.mhlw.go.jp/content/11650000/001083042.docx', type: 'Word', size: '18KB' },
          { name: '常時雇用する労働者数に係る疎明書（例示様式）', url: 'https://www.mhlw.go.jp/content/11909000/001511315.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    career_tanjikan: {
      checked: '2026-08-02',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '掲載しているのは令和8年4月8日以降版のキャリアアップ計画書です。短時間労働者労働時間延長支援コースで使う様式だけを載せています。事業所確認票は、常時雇用する労働者が30人以下であること（50万円の区分）を示すのに使います。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' },
          { name: '様式第2号 キャリアアップ計画書（変更届）', url: 'https://www.mhlw.go.jp/content/11909000/001688050.docx', type: 'Word', size: '100KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式6 短時間労働者労働時間延長支援コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001683507.xlsx', type: 'Excel', size: '121KB' },
          { name: '様式第4号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11650000/001083034.docx', type: 'Word', size: '26KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' },
          { name: '賃金台帳等に関する確認書（ひな形）', url: 'https://www.mhlw.go.jp/content/11909000/001239272.docx', type: 'Word', size: '21KB' },
          { name: '申立書（就業規則の届出義務が無い場合の例示様式）', url: 'https://www.mhlw.go.jp/content/11650000/001083042.docx', type: 'Word', size: '18KB' },
          { name: '常時雇用する労働者数に係る疎明書（例示様式）', url: 'https://www.mhlw.go.jp/content/11909000/001511315.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    career_shogai: {
      checked: '2026-08-02',
      portal: { label: '申請様式（令和8年4月8日以降の取組）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000118801_00022.html' },
      note: '掲載しているのは令和8年4月8日以降版のキャリアアップ計画書です。障害者正社員化コースで使う様式だけを載せています。別添様式2-3は、障害者手帳等の写しに代えて出せるマイナンバーの登録届です。',
      groups: [
        { phase: '取組の前に出す', items: [
          { name: '様式第1号 キャリアアップ計画書', url: 'https://www.mhlw.go.jp/content/11909000/001688046.docx', type: 'Word', size: '101KB' },
          { name: '様式第2号 キャリアアップ計画書（変更届）', url: 'https://www.mhlw.go.jp/content/11909000/001688050.docx', type: 'Word', size: '100KB' }
        ] },
        { phase: '支給申請', items: [
          { name: '様式第3号 支給申請書', url: 'https://www.mhlw.go.jp/content/11909000/001683460.xlsx', type: 'Excel', size: '63KB' },
          { name: '別添様式2-1 障害者正社員化コース内訳', url: 'https://www.mhlw.go.jp/content/11909000/001470098.xlsx', type: 'Excel', size: '36KB' },
          { name: '別添様式2-2 障害者正社員化コース対象労働者詳細', url: 'https://www.mhlw.go.jp/content/11909000/001470100.xlsx', type: 'Excel', size: '29KB' },
          { name: '別添様式2-3 障害者雇用関係助成金個人番号登録届', url: 'https://www.mhlw.go.jp/content/11909000/001683553.xlsx', type: 'Excel', size: '40KB' },
          { name: '様式第4号 事業所確認票', url: 'https://www.mhlw.go.jp/content/11650000/001083034.docx', type: 'Word', size: '26KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' },
          { name: '賃金台帳等に関する確認書（ひな形）', url: 'https://www.mhlw.go.jp/content/11909000/001239272.docx', type: 'Word', size: '21KB' },
          { name: '申立書（就業規則の届出義務が無い場合の例示様式）', url: 'https://www.mhlw.go.jp/content/11650000/001083042.docx', type: 'Word', size: '18KB' },
          { name: '常時雇用する労働者数に係る疎明書（例示様式）', url: 'https://www.mhlw.go.jp/content/11909000/001511315.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    ryouritsu_ikuji: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。育児休業等支援コースで使う様式だけを載せています。面談シートとプランは、育児休業の開始日の前日までに作っておく必要があります。',
      groups: [
        { phase: '支給申請', items: [
          { name: '支給申請書一式【育】様式第1〜5号', url: 'https://www.mhlw.go.jp/content/001722325.xlsx', type: 'Excel', size: '122KB' },
          { name: '育休復帰支援面談シート及び復帰支援プラン', url: 'https://www.mhlw.go.jp/content/001722324.xlsx', type: 'Excel', size: '62KB' },
          { name: '育休復帰支援プラン（参考様式）', url: 'https://www.mhlw.go.jp/content/11909000/001553126.xlsx', type: 'Excel', size: '49KB' },
          { name: '面談シート（参考様式）', url: 'https://www.mhlw.go.jp/content/11909000/001553127.xlsx', type: 'Excel', size: '74KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    ryouritsu_shusseiji: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。出生時両立支援コースで使う様式だけを載せています。',
      groups: [
        { phase: '支給申請', items: [
          { name: '支給申請書一式【出】様式第1〜4号', url: 'https://www.mhlw.go.jp/content/001722329.xlsx', type: 'Excel', size: '120KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    ryouritsu_kaigo: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。介護離職防止支援コースで使う様式だけを載せています。両立支援プランと面談シートは、原則として介護休業の開始日の前日までに作っておく必要があります。',
      groups: [
        { phase: '支給申請', items: [
          { name: '支給申請書一式【介】様式第1〜6号', url: 'https://www.mhlw.go.jp/content/001722328.xlsx', type: 'Excel', size: '183KB' },
          { name: '仕事と介護の両立支援プラン（面談シート兼用）', url: 'https://www.mhlw.go.jp/content/001722327.xlsx', type: 'Excel', size: '73KB' },
          { name: '参考様式（介護：面談・プラン関連）', url: 'https://www.mhlw.go.jp/content/001475101.xlsx', type: 'Excel', size: '105KB' },
          { name: '参考様式（介護休業等の取得・利用方針の周知 書式例）', url: 'https://www.mhlw.go.jp/content/001096371.docx', type: 'Word', size: '60KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    ryouritsu_juunan: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。柔軟な働き方選択制度等支援コースで使う様式だけを載せています。面談シートとプランは、制度利用開始日の前日までに作っておく必要があります。',
      groups: [
        { phase: '支給申請', items: [
          { name: '支給申請書一式【柔】様式第1〜5号', url: 'https://www.mhlw.go.jp/content/001722322.xlsx', type: 'Excel', size: '143KB' },
          { name: '育児に係る柔軟な働き方支援 面談シート及びプラン', url: 'https://www.mhlw.go.jp/content/001722321.xlsx', type: 'Excel', size: '55KB' },
          { name: '支援プラン（単体の様式）', url: 'https://www.mhlw.go.jp/content/11909000/001553217.xlsx', type: 'Excel', size: '18KB' },
          { name: '面談シート（単体の様式）', url: 'https://www.mhlw.go.jp/content/11909000/001553218.xlsx', type: 'Excel', size: '21KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    ryouritsu_daitai: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。育休中等業務代替支援コースで使う様式だけを載せています。様式第1号から第6号までが1つのファイルにまとまっています。',
      groups: [
        { phase: '支給申請', items: [
          { name: '支給申請書一式【代】様式第1〜6号', url: 'https://www.mhlw.go.jp/content/001722323.xlsx', type: 'Excel', size: '223KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    ryouritsu_funin: {
      checked: '2026-08-02',
      portal: { label: '両立支援等助成金の申請様式（令和8年度）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kodomo/shokuba_kosodate/ryouritsu01/index.html' },
      note: '両立支援等助成金に計画届の提出はなく、就業規則整備・周知・面談・プラン作成を取組前に済ませます。不妊治療及び女性の健康課題対応両立支援コースの様式は、旧形式（.xls／.doc）のまま配布されています。区分ごとにファイルが分かれているので、使う区分のものを選んでください。',
      groups: [
        { phase: '支給申請', items: [
          { name: '【不妊治療】様式第1号①② 支給申請書（.xls形式）', url: 'https://www.mhlw.go.jp/content/001470798.xls', type: 'Excel', size: '111KB' },
          { name: '【不妊治療】様式第1号③ 提出を省略する書類（.doc形式）', url: 'https://www.mhlw.go.jp/content/001470800.doc', type: 'Word', size: '69KB' },
          { name: '【月経】様式第1号①② 支給申請書（.xls形式）', url: 'https://www.mhlw.go.jp/content/001470802.xls', type: 'Excel', size: '111KB' },
          { name: '【月経】様式第1号③ 提出を省略する書類（.doc形式）', url: 'https://www.mhlw.go.jp/content/001470804.doc', type: 'Word', size: '69KB' },
          { name: '【更年期】様式第1号①② 支給申請書（.xls形式）', url: 'https://www.mhlw.go.jp/content/001470806.xls', type: 'Excel', size: '111KB' },
          { name: '【更年期】様式第1号③ 提出を省略する書類（.doc形式）', url: 'https://www.mhlw.go.jp/content/001470808.doc', type: 'Word', size: '69KB' },
          { name: '共通要領様式第1号 支給要件確認申立書', url: 'https://www.mhlw.go.jp/content/11600000/001681582.docx', type: 'Word', size: '55KB' }
        ] }
      ]
    },
    jinzai: {
      checked: '2026-07-31',
      portal: { label: '申請書類（令和8年5月14日以降に計画届を提出）', url: 'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/38819_00010.html' },
      note: '訓練を始める前に計画届の提出が必要です。人材育成支援コースで使う様式だけを載せています。',
      groups: [
        { phase: '訓練の前に出す', items: [
          { name: '様式第1-1号 職業訓練実施計画届', url: 'https://www.mhlw.go.jp/content/11800000/001698095.xlsx', type: 'Excel', size: '97KB' },
          { name: '様式第1-1号 記載例', url: 'https://www.mhlw.go.jp/content/11800000/001686629.pdf', type: 'PDF', size: '943KB' },
          { name: '様式第3-1号 対象労働者一覧', url: 'https://www.mhlw.go.jp/content/11800000/001690279.xlsx', type: 'Excel', size: '92KB' }
        ] },
        { phase: '支給申請（訓練が終わったあと）', items: [
          { name: '様式第4-1号 支給申請書', url: 'https://www.mhlw.go.jp/content/11800000/001690646.xlsx', type: 'Excel', size: '53KB' },
          { name: '様式第5号 賃金助成及びOJT実施助成の内訳', url: 'https://www.mhlw.go.jp/content/11800000/001690293.xlsx', type: 'Excel', size: '70KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '様式第2-1号 職業訓練実施計画変更届', url: 'https://www.mhlw.go.jp/content/11800000/001690277.xlsx', type: 'Excel', size: '68KB' }
        ] }
      ]
    },

    // ---- 東京都の制度（2026-07-31 に各公式ページで確認） ----
    tokyo_digital: {
      checked: '2026-07-31',
      portal: { label: '東京都中小企業振興公社 公式ページ', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/digital-tool.html' },
      note: '令和8年度第1回の様式です。申請は電子申請システムから行います。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '【令和8年度第1回版】募集要項', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8boshuuyoukou.pdf', type: 'PDF', size: '6.9MB' },
          { name: '申請マニュアル', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8_digital-tool_sinnsei_manual.pdf', type: 'PDF', size: '2.0MB' },
          { name: '申請時添付書類例', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8shinseisho_sample.pdf', type: 'PDF', size: '3.7MB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'ツール導入にあたってのチェックシート', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/check_sheet_digitaltool.xlsx', type: 'Excel', size: '22KB' },
          { name: '見積限定理由書', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8mitumori_sor.docx', type: 'Word', size: '32KB' },
          { name: '小規模企業者に該当することの確認書', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8shoukibo_cfm.docx', type: 'Word', size: '18KB' },
          { name: '環境負荷軽減計画書', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8kannkyoufuka_plan.xlsx', type: 'Excel', size: '15KB' }
        ] }
      ]
    },
    tokyo_shuekiryoku: {
      checked: '2026-08-07',
      portal: { label: '中小企業収益力強化サポート事業 公式サイト', url: 'https://tokyo-shuekiryoku-kyoka.jp/' },
      note: '今回の募集は無料の専門家派遣（申込フォームは公式サイト内に設置、2026年5月27日公開）。営業利益の減少または損失計上が要件のため、募集要項で対象かどうかを先にご確認ください。助成金（上限300万円）の様式は専門家派遣後に別途案内されるため、現時点では掲載されていません。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '事業案内（簡易版）', url: 'https://tokyo-shuekiryoku-kyoka.jp/leaflet.pdf', type: 'PDF', size: '648KB' },
          { name: '事業案内（詳細版）', url: 'https://tokyo-shuekiryoku-kyoka.jp/leaflet_detailed.pdf', type: 'PDF', size: '2.6MB' },
          { name: '専門家派遣募集要項', url: 'https://tokyo-shuekiryoku-kyoka.jp/assets/pdf/application-requirements.pdf', type: 'PDF', size: '1.2MB' }
        ] }
      ]
    },
    tokyo_soui: {
      checked: '2026-07-31',
      portal: { label: '東京都中小企業振興公社 公式ページ', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/' },
      note: '業務改善コースの様式です。営業利益の減少または損失計上が要件のため、募集要項で対象かどうかを先にご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_ippan_boshuyoukou_02.pdf', type: 'PDF', size: '1.8MB' },
          { name: '電子申請マニュアル', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_kaizen_manual_denshi_02.pdf', type: 'PDF', size: '3.6MB' },
          { name: 'よくある質問（FAQ）', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8gyoumu_kaizen_faq.xlsx', type: 'Excel', size: '28KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_kaizen_shinseisho_01.xlsx', type: 'Excel', size: '192KB' },
          { name: '申請書 記入例', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_kaizen_shinseisho_kinyuurei_01-02.xlsx', type: 'Excel', size: '223KB' },
          { name: '誓約書（助成金申請に関する誓約書）', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_kaizen_seiyakusho_shinsei_01.xlsx', type: 'Excel', size: '14KB' },
          { name: '誓約書（反社会的勢力排除に関する誓約書）', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_kaizen_seiyakusho_hansha_01.xlsx', type: 'Excel', size: '14KB' },
          { name: '同意書（代理申請用）', url: 'https://www.tokyo-kosha.or.jp/support/josei/jigyo/soui-challenge/ippan/h0iqeh0000009ei1-att/R8soui-challenge_douisho.docx', type: 'Word', size: '27KB' }
        ] }
      ]
    },
    tokyo_minato_software: {
      checked: '2026-07-31',
      portal: { label: '港区立産業振興センター 公式ページ', url: 'https://minato-sansin.com/software/' },
      note: '郵送とオンラインで使う様式が一部異なります。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/【要項】R7港区中小企業ソフトウェア導入費等支援事業補助金募集要項.pdf', type: 'PDF', size: '568KB' },
          { name: '提出書類確認シート', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/★1-1-提出書類確認シート.docx', type: 'Word', size: '33KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '第1号様式 交付申請書', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/データ①-1-【郵送】第1号様式-交付申請書（最新）-1.docx', type: 'Word', size: '38KB' },
          { name: '第1号様式 記入例（法人用）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/★【記入例・法人】第1号様式（交付申請書）.pdf', type: 'PDF', size: '323KB' },
          { name: '第1号様式 記入例（個人用）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/★【記入例・個人】第1号様式（交付申請書）.pdf', type: 'PDF', size: '328KB' },
          { name: '第2号様式 誓約書兼同意書', url: 'https://minato-sansin.com/wp-content/uploads/2025/04/データ②-1-【郵送】第2号様式　誓約書兼同意書.docx', type: 'Word', size: '35KB' },
          { name: '第3号様式 収支計画書（記入例つき）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/1-3-第3号様式-収支計画書-※記入例含む.xlsx', type: 'Excel', size: '23KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '第11号様式 実績報告書', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/データ⑤-1-【郵送】第11号様式（実績報告書）.docx', type: 'Word', size: '25KB' },
          { name: '第11号様式 記入例（法人用）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/【記入例・法人】第11号様式（実績報告書）.docx-1.pdf', type: 'PDF', size: '335KB' },
          { name: '第11号様式 記入例（個人用）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/【記入例・個人】第11号様式（実績報告書）.docx-1.pdf', type: 'PDF', size: '293KB' },
          { name: '第12号様式 収支決算書（記入例つき）', url: 'https://minato-sansin.com/wp-content/uploads/2026/04/データ⑥（修正）-【オンライン・郵送共通】収支決算書（第12号様式）※記入例（個人・法人共通）含む-1.xlsx', type: 'Excel', size: '23KB' }
        ] }
      ]
    },
    tokyo_bunkyo_seisansei: {
      checked: '2026-07-31',
      portal: { label: '文京区 公式ページ', url: 'https://www.city.bunkyo.lg.jp/b012/p005132.html' },
      note: '令和8年度の様式です。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度 案内チラシ', url: 'https://www.city.bunkyo.lg.jp/documents/4945/chirashi.pdf', type: 'PDF', size: '652KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書（別記様式第1号）', url: 'https://www.city.bunkyo.lg.jp/documents/4945/01_kohushinsei.doc', type: 'Word', size: '46KB' },
          { name: '事業計画書（別紙1）', url: 'https://www.city.bunkyo.lg.jp/documents/4945/2022221164254_1.doc', type: 'Word', size: '48KB' },
          { name: '事業予算書（別紙2）', url: 'https://www.city.bunkyo.lg.jp/documents/4945/202222116435_1.doc', type: 'Word', size: '49KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書類等', url: 'https://www.city.bunkyo.lg.jp/documents/4945/2022221164514_1.doc', type: 'Word', size: '57KB' },
          { name: '請求書兼口座振替依頼書', url: 'https://www.city.bunkyo.lg.jp/documents/4945/2022221164558_1.doc', type: 'Word', size: '48KB' }
        ] }
      ]
    },
    tokyo_taito_keiei: {
      checked: '2026-07-31',
      portal: { label: '台東区産業振興事業団 公式ページ', url: 'https://taito-sangyo.jp/2026/03/27/keieikiban/' },
      note: '公式ページで様式ファイルとして配布されているのは下記です。交付申請の手続きは公式ページの案内に沿って進めてください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '経営基盤強化支援 チラシ（令和8年度）', url: 'https://taito-sangyo.jp/src/wp-content/uploads/2026/07/R8keieikiban-1.pdf', type: 'PDF', size: '1.6MB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更承認申請書', url: 'https://taito-sangyo.jp/src/wp-content/uploads/2026/03/経営基盤_変更届.doc', type: 'Word', size: '32KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '支払い方法別 必要書類', url: 'https://taito-sangyo.jp/src/wp-content/uploads/2025/04/siharai_kogata.pdf', type: 'PDF', size: '204KB' }
        ] }
      ]
    },
    tokyo_sumida_digital: {
      checked: '2026-07-31',
      portal: { label: '墨田区 公式ページ', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.html' },
      note: '2026年4月版の様式です。経費内訳書は税抜・税込の2種類があり、どちらを使うかは募集要項でご確認ください。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項（2026.04版）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/R804bosyu.pdf', type: 'PDF', size: '617KB' },
          { name: 'よくあるご質問（2026年4月1日時点）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/QA20260401.pdf', type: 'PDF', size: '78KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書（第1号様式）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/01_yohiki.docx', type: 'Word', size: '23KB' },
          { name: '事業計画書（第2号様式）R8.04', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/02_yoshiki_202604.docx', type: 'Word', size: '26KB' },
          { name: '【記載例】事業計画書（第2号様式）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/02_yoshiki_example.pdf', type: 'PDF', size: '354KB' },
          { name: '誓約・同意書（第3号様式）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/03_yoshiki.docx', type: 'Word', size: '22KB' },
          { name: '補助金申請経費内訳書（税抜表示）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/uchiwakesho_zeinuki.xlsx', type: 'Excel', size: '12KB' },
          { name: '補助金申請経費内訳書（税込表示）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/uchiwakesho_zeikomi.xlsx', type: 'Excel', size: '12KB' },
          { name: '値引き額按分計算表（内訳書付属資料）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/nebikianbunkeisanhyo.xlsx', type: 'Excel', size: '12KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更申請書（第6号様式）R8.04', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/06_yoshiki_202604.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書（第8号様式）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/jissekihoukoku8.docx', type: 'Word', size: '21KB' },
          { name: '実施内容報告書（第9号様式）R8.04', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/09_yoshiki_202604_.docx', type: 'Word', size: '24KB' },
          { name: '【記載例】実施内容報告書（第9号様式）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/09_yoshiki_example.pdf', type: 'PDF', size: '91KB' },
          { name: '補助金報告経費内訳書（税抜表示）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/houkokuuchiwakesho_zeinuki.xlsx', type: 'Excel', size: '12KB' },
          { name: '補助金報告経費内訳書（税込表示）', url: 'https://www.city.sumida.lg.jp/sangyo_jigyosya/sangyo/hojokin_joseikin/smddigital.files/houkokuuchiwakesho_zeikomi.xlsx', type: 'Excel', size: '12KB' }
        ] }
      ]
    },
    tokyo_koto_ict: {
      checked: '2026-07-31',
      portal: { label: '江東区 公式ページ', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/itc_shien.html' },
      note: '先に「申込書」を出し、支援決定を受けてから交付申請に進む流れです。順番にご注意ください。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '江東区ICT等導入支援事業実施要綱', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/documents/8ict_yoko2.pdf', type: 'PDF', size: '1.6MB' }
        ] },
        { phase: 'はじめに出す（支援の申込）', items: [
          { name: '江東区ICT等導入支援申込書', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/documents/8ict1_mousikomi07w.docx', type: 'Word', size: '22KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/documents/8ict4_shinsei.docx', type: 'Word', size: '27KB' },
          { name: '事業計画書', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/documents/8ict5_keikakusho.docx', type: 'Word', size: '25KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '対象事業実績報告書', url: 'https://www.city.koto.lg.jp/102020/sangyoshigoto/sangyo/documents/8ict11_houkoku.docx', type: 'Word', size: '27KB' }
        ] }
      ]
    },
    tokyo_shinagawa_digital: {
      checked: '2026-07-31',
      portal: { label: '品川区DX推進事業 公式ページ', url: 'https://shinagawa-dx-digital.com/digital_subsidy/' },
      note: 'ソフトウェア分の様式です。オンライン申請の場合、交付申請書と提出書類チェックシートは不要と案内されています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/05/R8-bosyuyoko_DIGITAL_SUBSIDY_SOFT_0527.pdf', type: 'PDF', size: '445KB' },
          { name: '提出書類チェックシート', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/04/99-提出書類チェックシート-1.docx', type: 'Word', size: '18KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '第1号様式 交付申請書', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/04/第1号様式-交付申請書-1.doc', type: 'Word', size: '34KB' },
          { name: '第1号様式（別紙）実施計画書', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/04/第1号様式（別紙）-実施計画書-1.doc', type: 'Word', size: '48KB' },
          { name: '第1号様式（別紙）資金計画等（ソフトウェア）', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/05/第1号様式（別紙）-資金計画等（ソフトウェア）_0528.xls', type: 'Excel', size: '61KB' },
          { name: '誓約書', url: 'https://shinagawa-dx-digital.com/wp-content/uploads/2026/04/99-誓約書（R8デジタルソフト助成）.docx', type: 'Word', size: '22KB' }
        ] }
      ]
    },
    tokyo_meguro_shoryokuka: {
      checked: '2026-07-31',
      portal: { label: '目黒区 公式ページ', url: 'https://www.city.meguro.tokyo.jp/sangyoukeizai/shigoto/kigyoushien/syouryokuka.html' },
      note: '公式ページで配布されているのは下記です。交付申請書はPDFのみで、Word版は配布されていません。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '申請の手引き', url: 'https://www.city.meguro.tokyo.jp/documents/19335/r8tebiki.pdf', type: 'PDF', size: '270KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'めぐろ中小企業省力化投資補助金 交付申請書', url: 'https://www.city.meguro.tokyo.jp/documents/19335/shinseisho.pdf', type: 'PDF', size: '76KB' }
        ] }
      ]
    },
    tokyo_setagaya_keiei: {
      checked: '2026-07-31',
      portal: { label: '世田谷区 公式ページ', url: 'https://www.city.setagaya.lg.jp/03647/11321.html' },
      note: '令和8年度の様式です。チェックリストは個人用と法人用で分かれています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://www.city.setagaya.lg.jp/documents/11321/r8_youkou.pdf', type: 'PDF', size: '675KB' },
          { name: '申請チェックリスト（個人用）', url: 'https://www.city.setagaya.lg.jp/documents/11321/01-1_checklist-praivate.xlsx', type: 'Excel', size: '16KB' },
          { name: '申請チェックリスト（法人用）', url: 'https://www.city.setagaya.lg.jp/documents/11321/01-2_check-corporation.xlsx', type: 'Excel', size: '78KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/02_shinseisyo.docx', type: 'Word', size: '27KB' },
          { name: '事業計画書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/03_keikakusyo.docx', type: 'Word', size: '26KB' },
          { name: '事業計画書 記載例', url: 'https://www.city.setagaya.lg.jp/documents/11321/03_keikakusyo_rei.pdf', type: 'PDF', size: '80KB' },
          { name: '経費明細書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/04_meisaisyo.xlsx', type: 'Excel', size: '27KB' },
          { name: '誓約書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/05_seiyakusyo.docx', type: 'Word', size: '22KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告チェックリスト（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/10_checklist-jisseki.xlsx', type: 'Excel', size: '15KB' },
          { name: '実績報告書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/10_0_jisseki.docx', type: 'Word', size: '30KB' },
          { name: '実績報告書 記載例', url: 'https://www.city.setagaya.lg.jp/documents/11321/10_0_jisseki_rei.pdf', type: 'PDF', size: '132KB' },
          { name: '支出内訳書（区様式）', url: 'https://www.city.setagaya.lg.jp/documents/11321/10_1_uchiwakesyo.xlsx', type: 'Excel', size: '17KB' }
        ] }
      ]
    },
    tokyo_nakano_keieiryoku: {
      checked: '2026-07-31',
      portal: { label: '中野区 公式ページ', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.html' },
      note: '令和8年度の様式です。生成AIを使う場合は経費計算の方法が別に案内されています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '応募要項（令和8年4月改定）', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8ouboyoukou.pdf', type: 'PDF', size: '714KB' },
          { name: 'よくあるご質問（FAQ）', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8FAQ.pdf', type: 'PDF', size: '272KB' },
          { name: '資料「生成AIの使用に係る経費計算方法」', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/seiseiAIkeihikeisan.pdf', type: 'PDF', size: '176KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書【第1号様式】', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8.1gou.docx', type: 'Word', size: '28KB' },
          { name: '事業実施内容説明（交付申請用）', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/2411_sinseisetumei.docx', type: 'Word', size: '21KB' },
          { name: '経費別明細書', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/keihi.xls', type: 'Excel', size: '32KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更等申請書【第4号様式】', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8.4gou.docx', type: 'Word', size: '28KB' },
          { name: '事業実施内容の変更説明（変更申請用）', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/2411_henkosetumei.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書【第6号様式】', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8.6gou.docx', type: 'Word', size: '28KB' },
          { name: '事業実施内容説明（実績報告用）', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/2411_zissekisetumei.docx', type: 'Word', size: '21KB' },
          { name: '請求書兼口座振替依頼書', url: 'https://www.city.tokyo-nakano.lg.jp/jigyosha/sangyoshinko/josei/chusho_r8keieiryoku.files/R8kouzafurikaeiraisho.xlsx', type: 'Excel', size: '18KB' }
        ] }
      ]
    },
    tokyo_toshima_keiei: {
      checked: '2026-07-31',
      portal: { label: '豊島区 公式ページ', url: 'https://www.city.toshima.lg.jp/584/machizukuri/sangyo/kigyo/019174.html' },
      note: '経営安定コースの様式です。申請書類は1つのExcelにまとまっています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '申請要領', url: 'https://www.city.toshima.lg.jp/documents/3318/20260623075350.pdf', type: 'PDF', size: '824KB' },
          { name: 'チラシ', url: 'https://www.city.toshima.lg.jp/documents/3318/20260415125508.pdf', type: 'PDF', size: '936KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金交付申請書一式', url: 'https://www.city.toshima.lg.jp/documents/3318/20260414144434.xlsx', type: 'Excel', size: '44KB' }
        ] }
      ]
    },
    tokyo_kita_itiot: {
      checked: '2026-07-31',
      portal: { label: '北区 公式ページ', url: 'https://www.city.kita.lg.jp/business/industry/1011356/1011509/1011519.html' },
      note: '令和8年度の様式です。申請様式は1つのWordにまとまっています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://www.city.kita.lg.jp/_res/projects/default_project/_page_/001/011/519/r8_boshuuyoukou_iot.pdf', type: 'PDF', size: '359KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請様式等', url: 'https://www.city.kita.lg.jp/_res/projects/default_project/_page_/001/011/519/r8_youshiki_iot_.docx', type: 'Word', size: '56KB' }
        ] }
      ]
    },
    tokyo_itabashi_digital: {
      checked: '2026-07-31',
      portal: { label: '板橋区産業振興公社 公式ページ', url: 'https://itabashi-kohsha.com/subsidies/hruq3mhmotj1aane.html' },
      note: '令和8年4月1日からの様式です。申請様式は1つのExcelにまとまっています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '実施要領（令和8年度）', url: 'https://itabashi-kohsha.com/cms-data/file/common/令和8年度デジタル化・データ利活用推進助成金_実施要領（令和８年４月１日～）.pdf', type: 'PDF', size: '988KB' },
          { name: '交付要綱（令和8年4月1日～）', url: 'https://itabashi-kohsha.com/cms-data/file/common/デジタル化・データ利活用推進助成金交付要綱（令和8年4月1日～）.pdf', type: 'PDF', size: '261KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請様式一式', url: 'https://itabashi-kohsha.com/cms-data/file/common/デジタル化・データ利活用推進助成金_申請様式一式.xlsx', type: 'Excel', size: '120KB' }
        ] }
      ]
    },
    tokyo_adachi_kaizen: {
      checked: '2026-07-31',
      portal: { label: '足立区 公式ページ', url: 'https://www.city.adachi.tokyo.jp/s-shinko/shigoto/chushokigyo/yushi-monozukuri.html' },
      note: 'コースごとに申請書が分かれています。申請前に相談予約が必要です。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集案内・よくある質問・記入例', url: 'https://www.city.adachi.tokyo.jp/documents/1324/01.pdf', type: 'PDF', size: '1.4MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '機械設備等購入費補助・店舗改修費補助 相談予約票および申請書', url: 'https://www.city.adachi.tokyo.jp/documents/1324/000.docx', type: 'Word', size: '209KB' },
          { name: '操業環境改善費補助 申請書', url: 'https://www.city.adachi.tokyo.jp/documents/1324/001.docx', type: 'Word', size: '76KB' },
          { name: '改修承諾書（賃貸物件で営業・操業している場合）', url: 'https://www.city.adachi.tokyo.jp/documents/1324/kaisyuusyoudakusyo.pdf', type: 'PDF', size: '293KB' },
          { name: '相談内容報告書（店舗デザイン相談費を含める場合）', url: 'https://www.city.adachi.tokyo.jp/documents/1324/soudannaiyou.pdf', type: 'PDF', size: '227KB' },
          { name: '見積書のサンプル', url: 'https://www.city.adachi.tokyo.jp/documents/1324/03-01mitumori-excel.xlsx', type: 'Excel', size: '12KB' },
          { name: '納品書のサンプル', url: 'https://www.city.adachi.tokyo.jp/documents/1324/03-02nohin-excel.xlsx', type: 'Excel', size: '12KB' }
        ] }
      ]
    },
    tokyo_katsushika_digital: {
      checked: '2026-07-31',
      portal: { label: '葛飾区 公式ページ', url: 'https://www.city.katsushika.lg.jp/business/1000011/1034399/1032622/index.html' },
      note: '交付申請書・事業計画書・企業概要は1つのファイルにまとまっています。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'デジタル化支援事業費補助金のご案内', url: 'https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/032/622/080501digitalannnai.pdf', type: 'PDF', size: '987KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書（第1号様式）・事業計画書（第2号様式）・企業概要（第3号様式）', url: 'https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/032/622/080501digitalshinsei.doc', type: 'Word', size: '60KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書（第6号様式）', url: 'https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/032/622/080501digitaljisseki2.doc', type: 'Word', size: '48KB' },
          { name: '補助金請求書（第9号様式）', url: 'https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/032/622/080501digitalseikyuu.doc', type: 'Word', size: '38KB' }
        ] }
      ]
    },
    tokyo_edogawa_dx: {
      checked: '2026-07-31',
      portal: { label: '江戸川区 公式ページ', url: 'https://www.city.edogawa.tokyo.jp/e093/shigotosangyo/jigyosha_oen/sangyo_jigyosya/jyosei/seisanseikojo/dounyu.html' },
      note: '第2回募集の様式です。別紙3・別紙4は中小企業グループで共同申請する場合のみ必要です。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項【第2回】', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/r8_dx_boshuyoko.pdf', type: 'PDF', size: '728KB' },
          { name: '募集パンフレット【第2回】', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/r8_dx_chirashi.pdf', type: 'PDF', size: '668KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '助成金交付申請書兼請求書（様式1）', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/r8_sinseisyo.doc', type: 'Word', size: '49KB' },
          { name: '事業所概要（別紙1）', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/r8_jigyoujyogaiyou.doc', type: 'Word', size: '42KB' },
          { name: '事業計画書（別紙2）', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/zigyoukeikakusyo1.doc', type: 'Word', size: '70KB' },
          { name: '中小企業グループ構成・役割確認表（別紙3）', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/groupekousei-r6.xlsx', type: 'Excel', size: '19KB' },
          { name: '中小企業グループによる共同事業に係る確認書（別紙4）', url: 'https://www.city.edogawa.tokyo.jp/documents/23284/groupekakunin-r6.docx', type: 'Word', size: '36KB' }
        ] }
      ]
    },
    tokyo_hachioji_keizoku: {
      checked: '2026-07-31',
      portal: { label: '八王子市 公式ページ', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku.html' },
      note: '事業継続事業の様式です。令和8年度の交付要綱もあわせてご確認ください。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領（事業継続事業）', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/koboyouryo.pdf', type: 'PDF', size: '577KB' },
          { name: '令和8年度 経営力強化補助金交付要綱', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/R8youkou.pdf', type: 'PDF', size: '467KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '【第1-2号様式】交付申請書（事業継続事業）', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/shinseishoword.docx', type: 'Word', size: '32KB' },
          { name: '【第1-2号様式】交付申請書 記入例', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/shinseishokinyuurei.pdf', type: 'PDF', size: '556KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '【第5-2号様式】実績報告書（事業継続事業）', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/jissekiword.docx', type: 'Word', size: '29KB' },
          { name: '【第5-2号様式】実績報告書 記入例', url: 'https://www.city.hachioji.tokyo.jp/kurashi/sangyo/001/j-keizoku_d/fil/jissekikinyuurei.pdf', type: 'PDF', size: '316KB' }
        ] }
      ]
    },
    tokyo_hamura_kiban: {
      checked: '2026-07-31',
      portal: { label: '羽村市 公式ページ', url: 'https://www.city.hamura.tokyo.jp/0000018519.html' },
      note: '令和8年度の様式です。手書き用のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '中小企業経営基盤強化助成金 チラシ', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/R8.4.27koushinnkeieikibannkyoukaR8.pdf', type: 'PDF', size: '482KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書・事業計画書', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/0613-1.docx', type: 'Word', size: '12KB' },
          { name: '働く環境整備事業（賃上げ・有給取得促進）確認事項', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/R8.4_tinnage.yuukyuu.docx', type: 'Word', size: '9KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更承認申請書', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/hennkou.docx', type: 'Word', size: '10KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/jisseki2.docx', type: 'Word', size: '12KB' },
          { name: '請求書兼振込依頼書', url: 'https://www.city.hamura.tokyo.jp/cmsfiles/contents/0000018/18519/seijyu2.docx', type: 'Word', size: '10KB' }
        ] }
      ]
    },
    tokyo_nishitokyo_dx: {
      checked: '2026-07-31',
      portal: { label: '西東京市 公式ページ', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.html' },
      note: '令和8年度の様式です。交付申請書・事業計画書には記入例があります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'DX化推進事業補助金 チラシ', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8tirashi.pdf', type: 'PDF', size: '636KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8sinseisyo.docx', type: 'Word', size: '18KB' },
          { name: '交付申請書 記入例', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/sinseisyokinyurei.pdf', type: 'PDF', size: '84KB' },
          { name: '補助事業計画書', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8keikakusyo.docx', type: 'Word', size: '32KB' },
          { name: '補助事業計画書 記入例', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8keikakusyokinyurei.pdf', type: 'PDF', size: '350KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更等申請書', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8henkou.docx', type: 'Word', size: '19KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書', url: 'https://www.city.nishitokyo.lg.jp/kurasi/sangyou/kakushujigyou/dxkasuishin.files/r8houkokusyo.docx', type: 'Word', size: '25KB' }
        ] }
      ]
    },

    // ---- ここから自動生成（build_docs.py）。基準は _tools/README.md ----
    chiba_chiba_ict: {
      checked: '2026-07-31',
      portal: { label: '千葉市産業振興財団 公式ページ', url: 'https://www.chibashi-sangyo.or.jp/enterprise/kyoka-sosyutu/keiei/ict-change/type-a/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '実施要綱', url: 'https://www.chibashi-sangyo.or.jp/cszwp/wp-content/uploads/R08.04.01_ICT活用等生産性向上支援事業要綱.pdf', type: 'PDF', size: '1.1MB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'ICT活用生産性向上・事業変革促進支援事業助成金交付申請書（様式第１－１号）', url: 'https://www.chibashi-sangyo.or.jp/cszwp/wp-content/uploads/01-4_タイプA申請書_ICT活用等生産性向上支援事業様式1-1.docx', type: 'Word', size: '51KB' },
          { name: '誓約書（様式第１－４号）', url: 'https://www.chibashi-sangyo.or.jp/cszwp/wp-content/uploads/01-3_誓約書（様式1-3）.docx', type: 'Word', size: '38KB' }
        ] }
      ]
    },
    chiba_choshi_ritchi: {
      checked: '2026-07-31',
      portal: { label: '銚子市 公式ページ', url: 'https://www.city.choshi.chiba.jp/business/page110047.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '銚子市企業立地等促進事業補助制度【概要】', url: 'https://www.city.choshi.chiba.jp/content/000045604.pdf', type: 'PDF', size: '258KB' },
          { name: '銚子市企業立地等促進事業補助金', url: 'https://www.city.choshi.chiba.jp/content/000045606.pdf', type: 'PDF', size: '405KB' },
          { name: '立地等計画認定申請書', url: 'https://www.city.choshi.chiba.jp/content/000045607.pdf', type: 'PDF', size: '99KB' },
          { name: '企業概要書', url: 'https://www.city.choshi.chiba.jp/content/000007612.docx', type: 'Word', size: '14KB' },
          { name: '事業概要書', url: 'https://www.city.choshi.chiba.jp/content/000007613.docx', type: 'Word', size: '17KB' }
        ] }
      ]
    },
    chiba_kimitsu_seisansei: {
      checked: '2026-07-31',
      portal: { label: '君津市 公式ページ', url: 'https://www.city.kimitsu.lg.jp/soshiki/24/87220.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '申請要領（二次募集）', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/60749.pdf', type: 'PDF', size: '623KB' },
          { name: '交付要綱', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59840.pdf', type: 'PDF', size: '431KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '01_令和8年度物価高騰対策君津市中小企業者生産性向上補助金交付申請書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59588.docx', type: 'Word', size: '25KB' },
          { name: '02_事業計画書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59589.docx', type: 'Word', size: '26KB' },
          { name: '03_市税の納付状況調査同意書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/60756.docx', type: 'Word', size: '23KB' },
          { name: '04_誓約書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59591.docx', type: 'Word', size: '24KB' },
          { name: '05_賃上げ計画の表明書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59592.docx', type: 'Word', size: '27KB' },
          { name: '11_令和8年度物価高騰対策君津市中小企業者生産性向上補助金財産処分等承認申請書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59598.docx', type: 'Word', size: '24KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '06_令和8年度物価高騰対策君津市中小企業者生産性向上補助金変更承認申請書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59593.docx', type: 'Word', size: '25KB' },
          { name: '07_令和8年度物価高騰対策君津市中小企業者生産性向上補助金中止（廃止）届', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59594.docx', type: 'Word', size: '24KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '08_令和8年度物価高騰対策君津市中小企業者生産性向上補助金事業遂行状況報告書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59595.docx', type: 'Word', size: '24KB' },
          { name: '09_令和8年度物価高騰対策君津市中小企業者生産性向上補助金実績報告書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59596.docx', type: 'Word', size: '24KB' },
          { name: '10_令和8年度物価高騰対策君津市中小企業者生産性向上補助金交付請求書', url: 'https://www.city.kimitsu.lg.jp/uploaded/attachment/59597.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    chiba_matsudo_dx: {
      checked: '2026-07-31',
      portal: { label: '松戸市 公式ページ', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'R8 デジタル化チャレンジ補助金申請要領', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/r8youryo.pdf', type: 'PDF', size: '536KB' },
          { name: '5号様式_交付請求書（記入要領入り）', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7_5gou.doc', type: 'Word', size: '37KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事前相談書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/DEJIJIZENSOUDANr6.docx', type: 'Word', size: '51KB' },
          { name: '事前相談時に必要な書類 別紙1_経費内訳書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7dejikeihi.xlsx', type: 'Excel', size: '17KB' },
          { name: '1号様式_交付申請書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7_1gou.doc', type: 'Word', size: '39KB' },
          { name: '別紙2_事業計画書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7dejikeikakusho.docx', type: 'Word', size: '50KB' },
          { name: '別紙3_誓約書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R8dejiseiyakusho.docx', type: 'Word', size: '26KB' },
          { name: '債権者登録申出書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/saikennsyatouroku.pdf', type: 'PDF', size: '24KB' },
          { name: '申請時に必要な書類 理由書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/dejiriyuusho.docx', type: 'Word', size: '20KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '報告時に必要な書類 別紙1_経費内訳書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/besshi1R6dejibesshir.xlsx', type: 'Excel', size: '17KB' },
          { name: '3号様式_実績報告書（記入例含む）', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7_3gou.doc', type: 'Word', size: '42KB' },
          { name: '別紙4_事業決算報告書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/R7besshidejihoukoku.docx', type: 'Word', size: '38KB' },
          { name: '別紙5_事業完了後経過報告書', url: 'https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/bessi5.docx', type: 'Word', size: '37KB' }
        ] }
      ]
    },
    chiba_minamiboso_digital: {
      checked: '2026-07-31',
      portal: { label: '南房総市 公式ページ', url: 'https://www.city.minamiboso.chiba.jp/0000020765.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '南房総市市内事業者デジタル化トライアル補助金チラシ', url: 'https://www.city.minamiboso.chiba.jp/cmsfiles/contents/0000020/20765/R8chirashi.pdf', type: 'PDF', size: '313KB' },
          { name: '南房総市市内事業者デジタル化トライアル補助金要領', url: 'https://www.city.minamiboso.chiba.jp/cmsfiles/contents/0000020/20765/R8youryo.pdf', type: 'PDF', size: '796KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書他', url: 'https://www.city.minamiboso.chiba.jp/cmsfiles/contents/0000020/20765/R8sinnseisyo.docx', type: 'Word', size: '19KB' },
          { name: '申請書の記入例', url: 'https://www.city.minamiboso.chiba.jp/cmsfiles/contents/0000020/20765/R8kinyurei.pdf', type: 'PDF', size: '176KB' },
          { name: '申請手続きの流れ', url: 'https://www.city.minamiboso.chiba.jp/cmsfiles/contents/0000020/20765/R8sinseitetsuduki.pdf', type: 'PDF', size: '357KB' }
        ] }
      ]
    },
    chiba_mobara_support: {
      checked: '2026-07-31',
      portal: { label: '茂原市 公式ページ', url: 'https://www.city.mobara.chiba.jp/0000007102.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '茂原市中小事業者サポート補助金交付申請書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/01_shinseisyo.docx', type: 'Word', size: '19KB' },
          { name: '申請者概要書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/02_gaiyosyo.docx', type: 'Word', size: '18KB' },
          { name: '補助事業計画書（ア）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-1_keikakusyo(a).docx', type: 'Word', size: '22KB' },
          { name: '補助事業計画書（イ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-2_keikakusyo(i).docx', type: 'Word', size: '21KB' },
          { name: '補助事業計画書（ウ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-3_keikakusyo(u).docx', type: 'Word', size: '22KB' },
          { name: '補助事業計画書（エ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-4_keikakusyo(e).docx', type: 'Word', size: '17KB' },
          { name: '補助事業計画書（オ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-5_keikakusyo(o).docx', type: 'Word', size: '24KB' },
          { name: '補助事業計画書（カ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-6_keikakusyo(ka).docx', type: 'Word', size: '21KB' },
          { name: '補助事業計画書（キ）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-7_keikakusyo(ki).docx', type: 'Word', size: '22KB' },
          { name: '補助事業計画書（ク）', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/03-8_keikakusyo(ku).docx', type: 'Word', size: '22KB' },
          { name: '収支予算書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/05_yosan.docx', type: 'Word', size: '16KB' },
          { name: '補助事業等着手届', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/11_tyakusyu.docx', type: 'Word', size: '20KB' },
          { name: '収支決算書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/32_kessan.docx', type: 'Word', size: '16KB' },
          { name: '商店会団体への加入確認書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/33_syotenkaikanyukakuninsyo.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助事業等完了届', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/21_kanryo.docx', type: 'Word', size: '20KB' },
          { name: '補助事業等実績報告書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/31_zisseki.docx', type: 'Word', size: '16KB' },
          { name: '茂原市中小事業者サポート補助金交付請求書', url: 'https://www.city.mobara.chiba.jp/cmsfiles/contents/0000007/7102/41_seikyu.docx', type: 'Word', size: '17KB' }
        ] }
      ]
    },
    chiba_sodegaura_shinko: {
      checked: '2026-07-31',
      portal: { label: '袖ケ浦市 公式ページ', url: 'https://www.city.sodegaura.lg.jp/soshiki/shoukou/kigyoushinkoujourei.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '交付申請', items: [
          { name: 'カーボンニュートラル促進奨励金指定基準', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/40670.pdf', type: 'PDF', size: '939KB' },
          { name: 'カーボンニュートラル促進奨励金指定基準【概要版】', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/39900.pdf', type: 'PDF', size: '1.2MB' },
          { name: '別紙1 排出係数及び地球温暖化係数', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/39899.pdf', type: 'PDF', size: '914KB' },
          { name: '成長分野の対象範囲について', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/39901.pdf', type: 'PDF', size: '571KB' },
          { name: '申請書 様式', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/42977.docx', type: 'Word', size: '21KB' },
          { name: '中小企業の定義', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/7322.pdf', type: 'PDF', size: '14KB' },
          { name: '日本標準産業分類（大・中分類）一覧', url: 'https://www.city.sodegaura.lg.jp/uploaded/attachment/19822.pdf', type: 'PDF', size: '173KB' }
        ] }
      ]
    },
    chiba_tateyama_digital: {
      checked: '2026-07-31',
      portal: { label: '館山市 公式ページ', url: 'https://www.city.tateyama.chiba.jp/shoukan/page100561.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '館山市市内事業者デジタル化トライアル補助金交付要綱', url: 'https://www.city.tateyama.chiba.jp/files/300385848.pdf', type: 'PDF', size: '341KB' },
          { name: '館山市市内事業者デジタル化トライアル補助金申請要領', url: 'https://www.city.tateyama.chiba.jp/files/300400786.pdf', type: 'PDF', size: '481KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '第1号様式', url: 'https://www.city.tateyama.chiba.jp/files/300385841.docx', type: 'Word', size: '19KB' },
          { name: '第2号様式', url: 'https://www.city.tateyama.chiba.jp/files/300385842.docx', type: 'Word', size: '18KB' },
          { name: '第3号様式', url: 'https://www.city.tateyama.chiba.jp/files/300385850.docx', type: 'Word', size: '19KB' },
          { name: '第4号様式', url: 'https://www.city.tateyama.chiba.jp/files/300385844.pdf', type: 'PDF', size: '81KB' }
        ] }
      ]
    },
    gunma_isesaki_shokibo: {
      checked: '2026-07-31',
      portal: { label: '伊勢崎市 公式ページ', url: 'https://www.city.isesaki.lg.jp/soshiki/keizai/shoko/syoukousinkou/12899.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '小規模事業者サポート補助金チェックシート', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/R8syousapo_checksheet.pdf', type: 'PDF', size: '495KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '小規模事業者サポート補助金リーフレット', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/R8syousapo_leaflet2.pdf', type: 'PDF', size: '1.6MB' },
          { name: '小規模事業者サポート補助金交付申請書(様式第1号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki1_sinseisyo2.docx', type: 'Word', size: '18KB' },
          { name: '事業計画書(様式第2号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki2_keikakusyo2.docx', type: 'Word', size: '28KB' },
          { name: '記入例1(個人事業主・飲食業)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/R8kinyurei1_kojin2.pdf', type: 'PDF', size: '4.3MB' },
          { name: '記入例2(法人・製造業)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/R8kinyurei2_hojin2.pdf', type: 'PDF', size: '4.3MB' },
          { name: '誓約書(様式第4号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki4_seiyakusyo.docx', type: 'Word', size: '14KB' },
          { name: '財産管理台帳(様式第14号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki14_daityou.docx', type: 'Word', size: '14KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更・中止・廃止承認申請書(様式第7号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki7_henkoutou.docx', type: 'Word', size: '14KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '小規模事業者サポート補助金実績報告書(様式第9号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki9_houkokusyo.docx', type: 'Word', size: '15KB' },
          { name: '小規模事業者サポート補助金交付請求書(様式第11号)', url: 'https://www.city.isesaki.lg.jp/material/files/group/43/yousiki11_seikyuusyo.docx', type: 'Word', size: '16KB' }
        ] }
      ]
    },
    gunma_maebashi_dx: {
      checked: '2026-07-31',
      portal: { label: '前橋市 公式ページ', url: 'https://www.city.maebashi.gunma.jp/soshiki/sangyokeizai/sangyoseisaku/shinseisho/7311.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '提供書式 要項', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8_DXyoukou01.pdf', type: 'PDF', size: '296KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '提供書式 様式', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8_DXyoushiki.xlsx', type: 'Excel', size: '273KB' },
          { name: '情報提供に関する同意書（任意）', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8_douisyo.pdf', type: 'PDF', size: '427KB' },
          { name: '対象業種一覧', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R7_itiran.pdf', type: 'PDF', size: '156KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更申請書', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8_DXhenkou.docx', type: 'Word', size: '20KB' }
        ] }
      ]
    },
    gunma_maebashi_setsubi: {
      checked: '2026-07-31',
      portal: { label: '前橋市 公式ページ', url: 'https://www.city.maebashi.gunma.jp/soshiki/sangyokeizai/sangyoseisaku/shinseisho/7310.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度前橋市設備投資支援補助金交付要項', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8setubitousiyoukoukaiseiban.pdf', type: 'PDF', size: '341KB' },
          { name: '設備投資支援補助金チラシ', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/R8setubitirasinikibosyuukaisi.pdf', type: 'PDF', size: '392KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '生産性向上設備導入枠 申請書式', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/seisannseisinnseisyosiki.xlsx', type: 'Excel', size: '277KB' },
          { name: '生産性向上設備導入枠 申請書式（リース）', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/seisannseikoujousetubisinnseiri-su.xlsx', type: 'Excel', size: '285KB' },
          { name: '省エネ設備導入枠 申請書式', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/syouenesetubidounyuuwakuyousiki.xlsx', type: 'Excel', size: '260KB' },
          { name: '省エネ設備導入枠 申請書式（リース）', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/syouenesetubidounyuuwakusyosikiri-su.xlsx', type: 'Excel', size: '268KB' },
          { name: '情報提供に関する同意書', url: 'https://www.city.maebashi.gunma.jp/material/files/group/55/jouhouteikyounikannsurudouisyohojokinn.pdf', type: 'PDF', size: '427KB' }
        ] }
      ]
    },
    gunma_midori_renewal: {
      checked: '2026-07-31',
      portal: { label: 'みどり市 公式ページ', url: 'https://www.city.midori.gunma.jp/kurashi/1001618/1005077/1005083/1005140.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'みどり市店舗リニューアル補助金チラシ', url: 'https://www.city.midori.gunma.jp/_res/projects/default_project/_page_/001/002/823/r7tirasi.pdf', type: 'PDF', size: '119KB' },
          { name: 'みどり市店舗リニューアル補助金交付要綱', url: 'https://www.city.midori.gunma.jp/_res/projects/default_project/_page_/001/002/823/1002823_002.pdf', type: 'PDF', size: '246KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'みどり市店舗リニューアル補助金（申請様式）', url: 'https://www.city.midori.gunma.jp/_res/projects/default_project/_page_/001/002/823/1002823_003.docx', type: 'Word', size: '14KB' }
        ] }
      ]
    },
    gunma_minakami_tenpo: {
      checked: '2026-07-31',
      portal: { label: 'みなかみ町 公式ページ', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/2019-0417-0952-72.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'みなかみ町店舗等改築等補助金交付要綱', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/files/00_tenpotoukaitikuhozyo_youkou.pdf', type: 'PDF', size: '532KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'みなかみ町店舗等改築等補助金修繕概要書', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/files/20220420_syuuenngaiyousyo.doc', type: 'Word', size: '30KB' },
          { name: 'みなかみ町店舗等改築等補助金交付申請書', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/files/20220420_yousikidai1gou.docx', type: 'Word', size: '14KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: 'みなかみ町店舗等改築等補助金実績報告書', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/files/20220420_yousikidai7gou.docx', type: 'Word', size: '13KB' },
          { name: 'みなかみ町店舗等改築等補助金交付請求書', url: 'https://www.town.minakami.gunma.jp/industry/hojyokin_shienseido/files/20220420_yousikidai9gou.docx', type: 'Word', size: '14KB' }
        ] }
      ]
    },
    gunma_nakanojo_keizoku: {
      checked: '2026-07-31',
      portal: { label: '中之条町 公式ページ', url: 'https://www.town.nakanojo.gunma.jp/soshiki/9/1354.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '中之条町事業継続補助金交付要綱', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3568.pdf', type: 'PDF', size: '158KB' },
          { name: '中之条町事業継続補助金交付要綱別表1', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3569.pdf', type: 'PDF', size: '100KB' },
          { name: '中之条町事業継続補助金交付要綱別表2', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3570.pdf', type: 'PDF', size: '90KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '様式第1号 中之条町事業継続補助金交付申請書', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3573.docx', type: 'Word', size: '19KB' },
          { name: '様式第2号 店舗等改修に係る同意書', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3574.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '様式第6号 中之条町事業継続補助金実績報告書兼請求書', url: 'https://www.town.nakanojo.gunma.jp/uploaded/attachment/3582.docx', type: 'Word', size: '17KB' }
        ] }
      ]
    },
    gunma_ota_dx: {
      checked: '2026-07-31',
      portal: { label: '太田市 公式ページ', url: 'https://www.city.ota.gunma.jp/page/1051763.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'R8DX推進補助金パンフレット', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/40098.pdf', type: 'PDF', size: '286KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '🔼申請書はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38895.docx', type: 'Word', size: '18KB' },
          { name: '申請書 ※記載例はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38941.docx', type: 'Word', size: '25KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '🔼変更等承認申請書はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38896.docx', type: 'Word', size: '13KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '🔼実績報告書はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38897.docx', type: 'Word', size: '16KB' },
          { name: '実績報告書 ※記載例はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38912.docx', type: 'Word', size: '23KB' },
          { name: '🔼請求書はこちら', url: 'https://www.city.ota.gunma.jp/uploaded/attachment/38898.docx', type: 'Word', size: '12KB' }
        ] }
      ]
    },
    gunma_tsumagoi_uriage: {
      checked: '2026-07-31',
      portal: { label: '嬬恋村 公式ページ', url: 'https://www.vill.tsumagoi.gunma.jp/www/contents/1000000000246/index.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '補助対象は、販売促進や業務効率化に伴う広告費や店舗等改修費などで幅広くご利用いただける制度となっております。小規模事業者の方々の持続的発展と', url: 'https://www.vill.tsumagoi.gunma.jp/www/contents/1000000000246/simple/uriageappu.pdf', type: 'PDF', size: '160KB' },
          { name: '補助対象は、販売促進や業務効率化に伴う広告費や店舗等改修費などで幅広くご利用いただける制度となっております。小規模事業者の方々の持続的発展と', url: 'https://www.vill.tsumagoi.gunma.jp/www/contents/1000000000246/simple/tsumagoiuriageappuhojyokinn.pdf.pdf', type: 'PDF', size: '78KB' },
          { name: '嬬恋村売上アップ事業補助金申請様式', url: 'https://www.vill.tsumagoi.gunma.jp/www/contents/1000000000246/simple/tsumagoiuriageappuhojyokinn.word.docx', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    kanagawa_atsugi_it: {
      checked: '2026-07-31',
      portal: { label: '厚木市 公式ページ', url: 'https://www.city.atsugi.kanagawa.jp/soshiki/sangyoshinkoka/9/2/24830.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '厚木市ロボット関連産業等促進事業補助金要領', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/roboyoryo.pdf', type: 'PDF', size: '136KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '関連ファイル 概要書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/gaiyo.doc', type: 'Word', size: '70KB' },
          { name: '関連ファイル 申請書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/robo-shinseisyo.doc', type: 'Word', size: '60KB' },
          { name: '関連ファイル 内訳書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/breakdown_robot.doc', type: 'Word', size: '59KB' },
          { name: '役員等氏名一覧表', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/menber_robot.doc', type: 'Word', size: '61KB' },
          { name: '収支決算書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/balance_robot.doc', type: 'Word', size: '55KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '事業報告書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/report_robot.doc', type: 'Word', size: '53KB' }
        ] }
      ]
    },
    kanagawa_atsugi_setsubi: {
      checked: '2026-07-31',
      portal: { label: '厚木市 公式ページ', url: 'https://www.city.atsugi.kanagawa.jp/soshiki/sangyoshinkoka/9/2/2146.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '厚木市中小企業設備投資促進事業補助金要領（R8.5.1第2版）', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentguidelines20260501.pdf', type: 'PDF', size: '435KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '厚木市設備投資促進事業計画概要書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentoverview2026.docx', type: 'Word', size: '20KB' },
          { name: '厚木市中小企業設備投資促進事業補助金交付申請書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentform2026.docx', type: 'Word', size: '19KB' },
          { name: '厚木市中小企業設備投資促進事業補助金補助対象設備内訳書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentbreakdownbook2026.docx', type: 'Word', size: '17KB' },
          { name: '役員等氏名一覧表', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentListofnamesofofficers2026.docx', type: 'Word', size: '18KB' },
          { name: '収支決算書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentincomeandexpenditurestatement2026.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '事業報告書', url: 'https://www.city.atsugi.kanagawa.jp/material/files/group/44/capitalinvestmentbusinessreport2026.docx', type: 'Word', size: '17KB' }
        ] }
      ]
    },
    kanagawa_ayase_kyojinka: {
      checked: '2026-07-31',
      portal: { label: '綾瀬市 公式ページ', url: 'https://www.city.ayase.kanagawa.jp/soshiki/shokosinkoka/kogyotanto/4/2905.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '【第二次公募】綾瀬市中小企業強靭化推進補助金要領', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/nijikyoujinkanijikouboyouryou.pdf', type: 'PDF', size: '690KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事前相談シート', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/jizensoudan.docx', type: 'Word', size: '15KB' },
          { name: '強靭化推進補助金申請書類（第1号様式から第5号様式まで）', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/kyoujinnkashinnseiyoushiki.doc', type: 'Word', size: '136KB' },
          { name: '事前着手届（第7号様式）', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/jizennchakushutodoke.doc', type: 'Word', size: '36KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '綾瀬市中小企業強靭化推進補助金補助事業変更（中止）承認申請書（第8号様式）', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/kyoujinnkahennkoutodoke.doc', type: 'Word', size: '32KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '綾瀬市中小企業強靭化推進補助金実績報告書（第11号様式）', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/kyoujinnkajissekihoukoku.doc', type: 'Word', size: '42KB' },
          { name: '補助金請求書（記入前に要連絡）', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/28/r5seikyuusyo.docx', type: 'Word', size: '15KB' }
        ] }
      ]
    },
    kanagawa_ayase_shogyo: {
      checked: '2026-07-31',
      portal: { label: '綾瀬市 公式ページ', url: 'https://www.city.ayase.kanagawa.jp/soshiki/shokosinkoka/shogyotanto/sangyoshinko/5/2378.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '綾瀬市商業者支援事業補助金チラシ', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/R8shogochirashi.pdf', type: 'PDF', size: '750KB' },
          { name: '綾瀬市商業者支援事業補助金公募要領', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/R8kouboyoryo1.pdf', type: 'PDF', size: '233KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '店舗開業補助金の流れ', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/R8tenpokaigyonagare.pdf', type: 'PDF', size: '484KB' },
          { name: '申請書等一式', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/R7sinseisyonado.doc', type: 'Word', size: '178KB' },
          { name: '綾瀬市商業者サポートガイド', url: 'https://www.city.ayase.kanagawa.jp/material/files/group/27/R8supportguide.pdf', type: 'PDF', size: '1.1MB' }
        ] }
      ]
    },
    kanagawa_digital: {
      checked: '2026-07-31',
      portal: { label: '神奈川県 公式ページ', url: 'https://www.pref.kanagawa.jp/docs/m2w/shokibo_digital/r8.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領', url: 'https://www.pref.kanagawa.jp/documents/128140/koubooyouryou.pdf', type: 'PDF', size: '842KB' },
          { name: '補助金交付要綱', url: 'https://www.pref.kanagawa.jp/documents/128140/kouhuyoukou.pdf', type: 'PDF', size: '290KB' },
          { name: '財産処分取扱要領', url: 'https://www.pref.kanagawa.jp/documents/128140/zaisansyobunn.pdf', type: 'PDF', size: '257KB' },
          { name: '交付申請チェックリスト', url: 'https://www.pref.kanagawa.jp/documents/128140/sinseityekku.xlsx', type: 'Excel', size: '18KB' },
          { name: '実績報告チェックリスト', url: 'https://www.pref.kanagawa.jp/documents/128140/zissekityekku.xlsx', type: 'Excel', size: '18KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事業計画例1 導入システム セルフオーダーシステム', url: 'https://www.pref.kanagawa.jp/documents/128140/kisairei1.pdf', type: 'PDF', size: '158KB' },
          { name: '事業計画例2 導入システム 会計システム', url: 'https://www.pref.kanagawa.jp/documents/128140/kisairei2.pdf', type: 'PDF', size: '124KB' },
          { name: '事業計画例3 導入システム ホームページ作成', url: 'https://www.pref.kanagawa.jp/documents/128140/kisairei3.pdf', type: 'PDF', size: '157KB' },
          { name: '事業計画例4 導入システム 勤怠管理システム', url: 'https://www.pref.kanagawa.jp/documents/128140/kisairei4.pdf', type: 'PDF', size: '152KB' },
          { name: '事業計画例5 導入システム RPA作成ツール', url: 'https://www.pref.kanagawa.jp/documents/128140/kisairei5.pdf', type: 'PDF', size: '130KB' },
          { name: 'ア.補助金交付申請書（様式1）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1.docx', type: 'Word', size: '19KB' },
          { name: '補助金交付申請書（様式1）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki01.pdf', type: 'PDF', size: '147KB' },
          { name: 'イ.役員等氏名一覧表（様式1-2）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-2.xlsx', type: 'Excel', size: '11KB' },
          { name: '役員等氏名一覧表（様式1-2）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-02kisairei.pdf', type: 'PDF', size: '124KB' },
          { name: 'ウ.補助事業計画書（様式1-3）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-3.docx', type: 'Word', size: '46KB' },
          { name: '補助事業計画書（様式1-3）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-03kisairei.pdf', type: 'PDF', size: '259KB' },
          { name: 'エ.経費予算書（様式1-4）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-04.xlsx', type: 'Excel', size: '16KB' },
          { name: '経費予算書（様式1-4）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-04kisairei.pdf', type: 'PDF', size: '114KB' },
          { name: '相談シート（様式1-5）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousik1-05kisairei.pdf', type: 'PDF', size: '163KB' },
          { name: 'カ.県外調達理由書（様式1-6）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-6.docx', type: 'Word', size: '25KB' },
          { name: '県外調達理由書（様式1-6）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-6kisairei.pdf', type: 'PDF', size: '147KB' },
          { name: 'キ.派遣申込書（様式1-7）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-7.docx', type: 'Word', size: '22KB' },
          { name: '派遣申込書（様式1-7）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki1-7ksairei.pdf', type: 'PDF', size: '90KB' },
          { name: 'ウ.経費決算書（様式5-3）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-03.xlsx', type: 'Excel', size: '15KB' },
          { name: '経費決算書（様式5-3）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-3kisairei.pdf', type: 'PDF', size: '117KB' },
          { name: 'エ.補助金取得財産管理台帳（様式5-4）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-4.docx', type: 'Word', size: '28KB' },
          { name: '補助金取得財産管理台帳（様式5-4）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-4kisairei.pdf', type: 'PDF', size: '79KB' },
          { name: 'カ.取得財産等の処分承認申請書（様式7）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki7.docx', type: 'Word', size: '15KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: 'ア.変更承認申請書（様式2）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki02.docx', type: 'Word', size: '16KB' },
          { name: 'イ.経費変更予算書（様式2-2）', url: 'https://www.pref.kanagawa.jp/documents/128140/r7_y2-2.xlsx', type: 'Excel', size: '14KB' },
          { name: 'ウ.中止（廃止）承認申請書（様式3）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki03.docx', type: 'Word', size: '15KB' },
          { name: 'キ.登録事項変更届', url: 'https://www.pref.kanagawa.jp/documents/128140/henkoutodoke.docx', type: 'Word', size: '18KB' },
          { name: 'ク.交付申請取下書', url: 'https://www.pref.kanagawa.jp/documents/128140/torisagesyo01.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助金実績報告書（様式5）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki05kisairei.pdf', type: 'PDF', size: '131KB' },
          { name: 'イ.補助事業報告書（様式5-2）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-2.docx', type: 'Word', size: '15KB' },
          { name: '補助事業報告書（様式5-2）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki5-2kisairei.pdf', type: 'PDF', size: '106KB' },
          { name: 'オ.支払完了報告書（様式6）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki6.docx', type: 'Word', size: '16KB' },
          { name: '支払完了報告書（様式6）', url: 'https://www.pref.kanagawa.jp/documents/128140/yosiki6kisairei.pdf', type: 'PDF', size: '86KB' },
          { name: 'エ.実施状況報告書（様式4）', url: 'https://www.pref.kanagawa.jp/documents/128140/yousiki04.docx', type: 'Word', size: '15KB' }
        ] }
      ]
    },
    kanagawa_hiratsuka_datsutanso: {
      checked: '2026-07-31',
      portal: { label: '平塚市 公式ページ', url: 'https://www.city.hiratsuka.kanagawa.jp/sangyo/page33_00104.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要領第1版', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199022.pdf', type: 'PDF', size: '1.4MB' },
          { name: 'よくある質問', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200186066.pdf', type: 'PDF', size: '839KB' },
          { name: '【チラシ】送電ケーブル盗難に関する注意喚起', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200161904.pdf', type: 'PDF', size: '419KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '平塚市脱炭素設備投資促進補助金交付申請書（第1号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199023.docx', type: 'Word', size: '21KB' },
          { name: '事業者情報調書（第2号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200107434.docx', type: 'Word', size: '22KB' },
          { name: '補助金交付申請 事業計画書（第3号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199025.docx', type: 'Word', size: '33KB' },
          { name: '平塚市脱炭素設備投資促進補助金誓約書（第4号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200131308.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '事業内容の変更または中止の申請 事業計画書（第3号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199029.docx', type: 'Word', size: '33KB' },
          { name: '平塚市脱炭素設備投資促進補助金申請内容変更承認申請書（第6号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199027.docx', type: 'Word', size: '20KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '平塚市脱炭素設備投資促進補助金実績報告書（第8号様式）', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199031.docx', type: 'Word', size: '33KB' },
          { name: '補助金の請求 請求書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200106134.xlsx', type: 'Excel', size: '15KB' }
        ] }
      ]
    },
    kanagawa_hiratsuka_dx: {
      checked: '2026-07-31',
      portal: { label: '平塚市 公式ページ', url: 'https://www.city.hiratsuka.kanagawa.jp/sangyo/page33_00096.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要領第1版', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199361.pdf', type: 'PDF', size: '1.3MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事前確認 平塚市中小企業等DX支援補助金事業計画事前確認申請書兼報告書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199362.docx', type: 'Word', size: '25KB' },
          { name: '事業内容の変更または中止の申請 平塚市中小企業等DX支援補助金事業計画事前確認申請書兼報告書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199382.docx', type: 'Word', size: '25KB' },
          { name: '事前確認 事業者情報調書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199364.docx', type: 'Word', size: '21KB' },
          { name: '交付申請 事業者情報調書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199370.docx', type: 'Word', size: '21KB' },
          { name: '事前確認 事業計画書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199366.docx', type: 'Word', size: '22KB' },
          { name: '交付申請 事業計画書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199376.docx', type: 'Word', size: '22KB' },
          { name: '平塚市中小企業等DX支援補助金交付申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199368.docx', type: 'Word', size: '22KB' },
          { name: '交付申請 補助対象経費に関する支出（予定・確定）調書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199372.docx', type: 'Word', size: '22KB' },
          { name: '平塚市中小企業等DX支援補助金誓約書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199374.docx', type: 'Word', size: '20KB' },
          { name: '平塚市中小企業等DX支援補助金に係る財産処分承認申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199388.docx', type: 'Word', size: '19KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '事業内容の変更または中止の申請 事業計画書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199384.docx', type: 'Word', size: '22KB' },
          { name: '事業内容の変更または中止の申請 補助対象経費に関する支出（予定・確定）調書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199380.docx', type: 'Word', size: '22KB' },
          { name: '平塚市中小企業等DX支援補助金申請内容変更承認申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199378.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: 'みであることを証明する資料（例）検証報告書、POC報告書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200106000.pdf', type: 'PDF', size: '4KB' },
          { name: '平塚市中小企業等DX支援補助金実績報告書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199386.docx', type: 'Word', size: '23KB' },
          { name: '請求書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200176551.xlsx', type: 'Excel', size: '15KB' }
        ] }
      ]
    },
    kanagawa_hiratsuka_ritchi: {
      checked: '2026-07-31',
      portal: { label: '平塚市 公式ページ', url: 'https://www.city.hiratsuka.kanagawa.jp/kigyo/page-c_01591.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '平塚市企業立地促進補助金&nbsp; 募集要領【令和8年4月版】', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200199021.pdf', type: 'PDF', size: '1.7MB' },
          { name: '制度案内チラシ', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200184728.pdf', type: 'PDF', size: '1.4MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事前届出書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086085.doc', type: 'Word', size: '42KB' },
          { name: '施設整備助成金 適用申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200177082.doc', type: 'Word', size: '50KB' },
          { name: '土地、家屋及び償却資産一覧表', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200177039.xlsx', type: 'Excel', size: '26KB' },
          { name: '施設整備助成金 交付申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086087.doc', type: 'Word', size: '40KB' },
          { name: '環境設備助成金 適用申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086090.doc', type: 'Word', size: '40KB' },
          { name: '環境設備助成金 交付申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086092.doc', type: 'Word', size: '40KB' },
          { name: '持続可能な経営助成 適用申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086093.doc', type: 'Word', size: '42KB' },
          { name: '持続可能な経営助成 交付申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086094.doc', type: 'Word', size: '38KB' },
          { name: '市内雇用創出助成金 適用申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200106596.doc', type: 'Word', size: '60KB' },
          { name: '市内雇用創出助成金 交付申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200106597.doc', type: 'Word', size: '41KB' },
          { name: '助成措置適用承継申請書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086099.doc', type: 'Word', size: '38KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更届出書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200044205.doc', type: 'Word', size: '36KB' },
          { name: '操業廃止・休止届', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086098.doc', type: 'Word', size: '38KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '関連書類のダウンロード 請求書', url: 'https://www.city.hiratsuka.kanagawa.jp/common/200086126.xlsx', type: 'Excel', size: '15KB' }
        ] }
      ]
    },
    kanagawa_isehara_setsubi: {
      checked: '2026-07-31',
      portal: { label: '伊勢原市 公式ページ', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '中小企業設備投資支援補助金チラシ', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/2026tirasifile_20263301103643_1.pdf', type: 'PDF', size: '283KB' },
          { name: '伊勢原市中小企業設備投資支援事業補助金要領', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/setubitousifile_20263301103654_1.pdf', type: 'PDF', size: '208KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '計画概要書（第1号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/jidyoukeikakufile_2026330110373_1.docx', type: 'Word', size: '18KB' },
          { name: '収支予算書（第2号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/2syuusi.docx', type: 'Word', size: '18KB' },
          { name: '交付申請書（第3号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/sinsneifile_20263301103713_1.docx', type: 'Word', size: '18KB' },
          { name: '収支決算書（第5号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/5syuusikesann.docx', type: 'Word', size: '17KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '事業報告書（第4号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/4jgyouhoukoku.docx', type: 'Word', size: '17KB' },
          { name: '請求書（第8号様式）', url: 'https://www.city.isehara.kanagawa.jp/docs/2024032500039/file_contents/8seikyusyo.docx', type: 'Word', size: '18KB' }
        ] }
      ]
    },
    kanagawa_kamakura_digital: {
      checked: '2026-07-31',
      portal: { label: '鎌倉市 公式ページ', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/keieikiban.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '鎌倉市経営基盤強化事業費補助金交付要綱', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keieikiban_yoko_202401.pdf', type: 'PDF', size: '274KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '鎌倉市中小企業経営基盤強化事業費補助金にかかる書類の書き方', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keieikiban_kakikatamihon.pdf', type: 'PDF', size: '3.3MB' },
          { name: '鎌倉市経営基盤強化事業費補助金交付申請書（第１号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keieikibanshinnseisyo1.doc', type: 'Word', size: '63KB' },
          { name: '収支予算書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/k-yosansyo.doc', type: 'Word', size: '35KB' },
          { name: '産業財産権取得事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/sangyouzaisan.doc', type: 'Word', size: '32KB' },
          { name: '展示会出展事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/tenjikai.doc', type: 'Word', size: '32KB' },
          { name: 'ＢＣＰ（事業継続計画）策定事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/bcp.doc', type: 'Word', size: '32KB' },
          { name: '人材育成事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/jinzai.doc', type: 'Word', size: '32KB' },
          { name: 'デジタル化推進事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/degital.doc', type: 'Word', size: '31KB' },
          { name: '広報・マーケティング事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/kouhou.doc', type: 'Word', size: '30KB' },
          { name: '賦課徴収情報の調査承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/fukachosyu_keieikiban.doc', type: 'Word', size: '31KB' },
          { name: '暴力団排除に関する誓約書兼鎌倉市暴力団排除条例に関する照会承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/bouryokudanhaijonikansuruseiyakusyo.doc', type: 'Word', size: '52KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '鎌倉市経営基盤強化事業費補助金変更・中止申請書（第３号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keieikibanhenkou.doc', type: 'Word', size: '35KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '鎌倉市経営基盤強化事業費補助金実績報告書（第５号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keieikibanhoukoku.doc', type: 'Word', size: '34KB' },
          { name: '収支精算書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/seisansyo.doc', type: 'Word', size: '36KB' },
          { name: '消費税仕入控除税額報告書（第７号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/shiirezeikoujo.doc', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    kanagawa_kamakura_kankyo: {
      checked: '2026-07-31',
      portal: { label: '鎌倉市 公式ページ', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/kankyou.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '鎌倉市環境共生施設整備費補助金交付要綱', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/kankyouseibiyoukou.pdf', type: 'PDF', size: '210KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '鎌倉市環境共生施設整備費補助金交付申請書（第1号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/shinsei-kankyou_1.doc', type: 'Word', size: '36KB' },
          { name: '事業計画書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/keikaku_kankyo_1.doc', type: 'Word', size: '32KB' },
          { name: '収支予算書（本補助金を使用する事業についての収支）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/yosan1.doc', type: 'Word', size: '34KB' },
          { name: '賦課徴収情報の調査承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/fukachosyu_kankyo.doc', type: 'Word', size: '31KB' },
          { name: '暴力団排除に関する誓約書兼鎌倉市暴力団排除条例に関する照会承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/bouryokudanhaijonikansuruseiyakusyo.doc', type: 'Word', size: '52KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '鎌倉市環境共生施設整備計画変更・中止申請書（第3号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/henkou-kankyou.doc', type: 'Word', size: '34KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '鎌倉市環境共生施設整備実績報告書（第5号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/houkoku-kankyou_1.doc', type: 'Word', size: '34KB' },
          { name: '収支精算書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/seisan.doc', type: 'Word', size: '42KB' },
          { name: '消費税仕入控除税額報告書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/documents/syouhizei-kankyo.doc', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    kanagawa_kamakura_ritchi: {
      checked: '2026-07-31',
      portal: { label: '鎌倉市 公式ページ', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/office.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '鎌倉市企業立地整備費等補助金交付要綱', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/kigyouricchihojokinyoukou.pdf', type: 'PDF', size: '226KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '鎌倉市企業立地整備費等補助金交付申請書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/shinseisyo.docx', type: 'Word', size: '23KB' },
          { name: '収支予算書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/k-yosansyo.doc', type: 'Word', size: '35KB' },
          { name: '賦課徴収情報の調査承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/fukachosyu_kigyoricchi.doc', type: 'Word', size: '31KB' },
          { name: '暴力団排除に関する誓約書兼暴力団排除条例に関する調査承諾書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/bouryokudanhaijonikansuruseiyakusyo.doc', type: 'Word', size: '52KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '鎌倉市企業立地整備費等補助金変更・中止申請書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/henkouchushishinseisyo.docx', type: 'Word', size: '23KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '鎌倉市企業立地整備費等補助金実績報告書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/jissekihoukoku.docx', type: 'Word', size: '23KB' },
          { name: '収支精算書', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/seisansyo.doc', type: 'Word', size: '36KB' },
          { name: '消費税仕入控除税額報告書（第7号様式）', url: 'https://www.city.kamakura.kanagawa.jp/shoukou/sien/documents/shiirezeikoujo.doc', type: 'Word', size: '34KB' }
        ] }
      ]
    },
    kanagawa_kawasaki_seicho: {
      checked: '2026-07-31',
      portal: { label: '川崎市 公式ページ', url: 'https://www.city.kawasaki.jp/280/page/0000186427.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '川崎市中小企業成長環境支援補助金交付要綱', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/youkou.pdf', type: 'PDF', size: '267KB' },
          { name: '令和8年度中小企業成長環境支援補助金募集要領', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/youryou.pdf', type: 'PDF', size: '1.1MB' },
          { name: 'チェックシート', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/tyekkusi-tot.xlsx', type: 'Excel', size: '25KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'エントリーシート（生産性向上支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/entryseatseisansei.docx', type: 'Word', size: '51KB' },
          { name: 'エントリーシート（リスキリング支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/entryseatriskiling.docx', type: 'Word', size: '52KB' },
          { name: 'エントリーシート（人材確保・定着支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/entraseatzinzaikakuhoteityakusien.docx', type: 'Word', size: '54KB' },
          { name: '記載例 エントリーシート（生産性向上支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireientryseatseisansei.pdf', type: 'PDF', size: '540KB' },
          { name: '記載例 エントリーシート（リスキリング支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireientryseatriskiling.pdf', type: 'PDF', size: '529KB' },
          { name: '記載例 エントリーシート（人材確保・定着支援）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireientryseatzinzaikakuhoteityaku.pdf', type: 'PDF', size: '918KB' },
          { name: '補助金交付申請書（第1号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kouhusinseisyo.docx', type: 'Word', size: '36KB' },
          { name: '補助事業計画書（第2号様式）【生産性向上支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/keikakusyoseisansei.docx', type: 'Word', size: '21KB' },
          { name: '補助事業計画書（第3号様式）【リスキリング支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/keikakusyoriskiring.docx', type: 'Word', size: '21KB' },
          { name: '補助事業計画書（第4号様式）【人材確保・定着支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/keikakusyozinzaisien.docx', type: 'Word', size: '27KB' },
          { name: '記載例 補助事業計画書（第2号様式）【生産性向上支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireikeikakusyoseisansei.pdf', type: 'PDF', size: '210KB' },
          { name: '記載例 補助事業計画書（第3号様式）【リスキリング支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireiriskiling.pdf', type: 'PDF', size: '309KB' },
          { name: '記載例 補助事業計画書（第4号様式）【人材確保・定着支援】', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireizizaisien.pdf', type: 'PDF', size: '588KB' },
          { name: '補助対象経費計算書（補助事業計画書別紙）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/hozyotaisyoukeihi.xlsx', type: 'Excel', size: '22KB' },
          { name: '誓約書（第5号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/bouryokudanseiyakusyo.doc', type: 'Word', size: '38KB' },
          { name: '誓約書（第13号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/seiyakusyo.doc', type: 'Word', size: '37KB' },
          { name: '確認書（第6号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/zigyoukeikakukakuninnsyo.docx', type: 'Word', size: '19KB' },
          { name: '賃上げ方針を表明したことを証する書面（第7号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/tinagesyoumei.docx', type: 'Word', size: '34KB' },
          { name: '記載例 賃上げ方針を表明したことを証する書面（第7号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireitinagehyoumei.pdf', type: 'PDF', size: '206KB' },
          { name: '記載例 誓約書（第13号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireiseiyakusyo.pdf', type: 'PDF', size: '140KB' },
          { name: '処分承認申請書（第17号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/syobunsyouninsinseisyo.doc', type: 'Word', size: '36KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '事業計画変更（中止）承認申請書（第9号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/zigyoukeikakuhennkousyouninnsinnseisyo.doc', type: 'Word', size: '39KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '事業実績報告書（第11号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/zigyouzisseekihoukokusyo.docx', type: 'Word', size: '34KB' },
          { name: '記載例 事業実績報告書（第11号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireizigyouzissekihoukokusyo.pdf', type: 'PDF', size: '359KB' },
          { name: '発注実績報告書（第12号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/hattyuuzissekihoukokusyo.xlsx', type: 'Excel', size: '23KB' },
          { name: '記載例 発注実績報告書（第12号様式）', url: 'https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/kisaireihattyuzissekihoukousyo.pdf', type: 'PDF', size: '169KB' }
        ] }
      ]
    },
    kanagawa_yamato_koten: {
      checked: '2026-07-31',
      portal: { label: '大和市 公式ページ', url: 'https://www.city.yamato.lg.jp/gyosei/soshik/40/sangyo/shogyo/shien_seibi_todokede/23892.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '大和市魅力ある個店支援事業計画詳細書(要綱第1号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/jigyoukeikakushousaisho.doc', type: 'Word', size: '62KB' },
          { name: '誓約書(要綱第2号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/seiyakusho2.docx', type: 'Word', size: '24KB' },
          { name: '大和市魅力ある個店支援事業実績報告詳細書(要綱第4号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/jigyoujissekihoukokushousaisho.doc', type: 'Word', size: '36KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金交付申請書(規則第1号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/hojokinnkouhushinnseisho2.doc', type: 'Word', size: '42KB' },
          { name: '補助事業計画書(規則第2号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/hojyojigyokeikakusho.doc', type: 'Word', size: '31KB' },
          { name: '補助事業収支予算書(規則第3号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/miryokunoshu-shiyosannsho.doc', type: 'Word', size: '40KB' },
          { name: '補助事業収支決算書(規則第8号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/hojojigyoushuushikessannsho.doc', type: 'Word', size: '40KB' },
          { name: '大和市魅力ある個店支援申請ガイドはこちら', url: 'https://www.city.yamato.lg.jp/material/files/group/23/shinnseiguide.pdf', type: 'PDF', size: '2.5MB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助事業実績報告書(規則第7号様式)', url: 'https://www.city.yamato.lg.jp/material/files/group/23/hojojigyoujissekihoukokusho.doc', type: 'Word', size: '36KB' }
        ] }
      ]
    },
    kanagawa_yokohama_led: {
      checked: '2026-07-31',
      portal: { label: '横浜市 公式ページ', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '【募集案内】LED化支援助成金（中小企業LED化型）（延長）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0097_20260522.pdf', type: 'PDF', size: '2.5MB' },
          { name: 'LED化支援助成金チラシ', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0098_20260522.pdf', type: 'PDF', size: '919KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '委任状（第２号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0093_20260422.docx', type: 'Word', size: '46KB' },
          { name: '設備更新前更新後一覧表（第４号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0096_20260422.xlsx', type: 'Excel', size: '40KB' },
          { name: '役員等指名一覧表（第８号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0079_20260418.pdf', type: 'PDF', size: '183KB' },
          { name: '役員等氏名一覧表（第８号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0095_20260422.docx', type: 'Word', size: '17KB' },
          { name: '横浜市内事業者であることの誓約書（第７号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-led-sme.files/0094_20260422.docx', type: 'Word', size: '25KB' }
        ] }
      ]
    },
    kanagawa_yokohama_monozukuri: {
      checked: '2026-07-31',
      portal: { label: '横浜市 公式ページ', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和８年度ものづくり魅力向上助成金募集案内', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0091_20260326.pdf', type: 'PDF', size: '846KB' },
          { name: '助成金交付要綱', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0083_20260319.pdf', type: 'PDF', size: '183KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '横浜市補助金等の交付に関する規則', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0045_20210401.pdf', type: 'PDF', size: '206KB' },
          { name: '交付申請書（第１号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0084_20260319.docx', type: 'Word', size: '41KB' },
          { name: '役員等氏名一覧表（第２号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0085_20260319.docx', type: 'Word', size: '30KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書（第10号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/seizou/kyousei-mono.files/0087_20260319.docx', type: 'Word', size: '33KB' }
        ] }
      ]
    },
    kanagawa_yokohama_shingijutsu: {
      checked: '2026-07-31',
      portal: { label: '横浜市 公式ページ', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和８年度 募集案内', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0122_20260402.pdf', type: 'PDF', size: '3.2MB' },
          { name: '申請書類チェックシート', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0119_20260402.xlsx', type: 'Excel', size: '17KB' },
          { name: '中小企業新技術・新製品開発促進助成金交付要綱', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0114_20260402.pdf', type: 'PDF', size: '285KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0115_20260402.docx', type: 'Word', size: '125KB' },
          { name: '資金計画書/資金計画支出明細書', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0116_20260402.xlsx', type: 'Excel', size: '109KB' },
          { name: 'ヒアリング調査日程調整表', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0117_20260402.xlsx', type: 'Excel', size: '12KB' },
          { name: '就業日誌', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0118_20260402.xlsx', type: 'Excel', size: '21KB' },
          { name: 'アンケート', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/kaihatsu/gijutsu/kaihatsu.files/0120_20260402.docx', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    kanagawa_yokohama_shoene: {
      checked: '2026-07-31',
      portal: { label: '横浜市 公式ページ', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '【募集案内】省エネルギー化支援助成金（簡易申請コース）令和８年度５月募集', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0100_20260422.pdf', type: 'PDF', size: '2.5MB' },
          { name: '【募集案内】省エネルギー化支援助成金（簡易申請コース）令和８年度７月募集', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0102_20260702.pdf', type: 'PDF', size: '2.7MB' },
          { name: '【チラシ】省エネルギー化支援助成金', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0101_20260629.pdf', type: 'PDF', size: '1.4MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '委任状（第４号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0077_20260417.docx', type: 'Word', size: '46KB' },
          { name: '助成対象経費計算書（第８号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0094_20260421.xlsx', type: 'Excel', size: '23KB' },
          { name: '役員等氏名一覧表（第９号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0079_20260417.docx', type: 'Word', size: '17KB' },
          { name: '横浜市内事業者であることの誓約書（第３号様式）', url: 'https://www.city.yokohama.lg.jp/business/kigyoshien/keieishien/capex/carbon-kani.files/0089_20260417.docx', type: 'Word', size: '24KB' }
        ] }
      ]
    },
    kanagawa_yokosuka_seisansei: {
      checked: '2026-07-31',
      portal: { label: '横須賀市 公式ページ', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/seisan.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '横須賀市中小企業等省エネ化・生産性向上補助金交付要綱', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/syoene_seisan_yoko.pdf', type: 'PDF', size: '213KB' },
          { name: '申請の手引き', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/b_tebiki_v1_0.pdf', type: 'PDF', size: '1.7MB' },
          { name: '申請の手引き（PDF：1,692KB）', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/tebiki-b2.pdf', type: 'PDF', size: '1.3MB' },
          { name: '申請の手引き（別紙：申請内容の修正方法）', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/r8_sub_v1.pdf', type: 'PDF', size: '275KB' },
          { name: '両枠に共通すること', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/a_b_kyotu.pdf', type: 'PDF', size: '1.1MB' },
          { name: '生産性向上枠に関すること', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/b_seisan.pdf', type: 'PDF', size: '749KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事業計画書', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/seisansei_keikaku.xlsx', type: 'Excel', size: '21KB' },
          { name: '役員等氏名一覧表', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/yakuinitiran.xlsx', type: 'Excel', size: '20KB' },
          { name: '照会同意書', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/nokadoisyo.xls', type: 'Excel', size: '32KB' },
          { name: 'プライバシーポリシー', url: 'https://www.city.yokosuka.kanagawa.jp/4402/hojokin/documents/r8_pp_subsidy_energy_conservation_productivity_improvement_1.pdf', type: 'PDF', size: '157KB' }
        ] }
      ]
    },
    kanagawa_yugawara_shukuhaku: {
      checked: '2026-07-31',
      portal: { label: '湯河原町 公式ページ', url: 'https://www.town.yugawara.kanagawa.jp/site/shukuhakuzei/28030.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '交付申請', items: [
          { name: '様式第1号関連記載例', url: 'https://www.town.yugawara.kanagawa.jp/uploaded/attachment/16842.pdf', type: 'PDF', size: '265KB' },
          { name: '補助対象経費明細書（様式第7号の2）', url: 'https://www.town.yugawara.kanagawa.jp/uploaded/attachment/17378.docx', type: 'Word', size: '29KB' },
          { name: '様式第7号関係記載例', url: 'https://www.town.yugawara.kanagawa.jp/uploaded/attachment/17417.pdf', type: 'PDF', size: '168KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '湯河原町宿泊税システム整備費等補助金事業実績報告書（様式第7号）', url: 'https://www.town.yugawara.kanagawa.jp/uploaded/attachment/17376.docx', type: 'Word', size: '27KB' }
        ] }
      ]
    },
    kanagawa_zama_renewal: {
      checked: '2026-07-31',
      portal: { label: '座間市 公式ページ', url: 'https://www.city.zama.kanagawa.jp/sangyo/sougyou/shogyo/1003455.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '座間市中小企業産業振興支援事業補助金交付要綱', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/zamasityuusyoukigyouyoukou.pdf', type: 'PDF', size: '766KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'トップランナー基準', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/toprunner2015j.pdf', type: 'PDF', size: '1.9MB' },
          { name: '（1）補助金交付申請書 R7.4～', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/shinseisho.docx', type: 'Word', size: '17KB' },
          { name: '（2）事業計画書（店舗リニューアル事業） R7.4～', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/jigyoukeikakusho.docx', type: 'Word', size: '22KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '（3）事業計画変更（中止）申請書 R7.4～', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/jigyoukeikakuhennkousho.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '（4）実績報告書 R7.4～', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/jissekihoukokusho.docx', type: 'Word', size: '15KB' },
          { name: '（5）請求書 R7.4～', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/seikyusho.docx', type: 'Word', size: '15KB' },
          { name: '（6）補助金状況報告書', url: 'https://www.city.zama.kanagawa.jp/_res/projects/default_project/_page_/001/003/455/joukyouhoukoku.docx', type: 'Word', size: '15KB' }
        ] }
      ]
    },
    saitama_ageo_dx: {
      checked: '2026-07-31',
      portal: { label: '上尾市 公式ページ', url: 'https://www.city.ageo.lg.jp/page/395426.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '上尾市ＳＤＧｓ・ＤＸ推進補助金補助金（ＳＤＧｓ部門）チラシ', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119048.pdf', type: 'PDF', size: '1.1MB' },
          { name: '上尾市ＳＤＧｓ・ＤＸ推進補助金（ＤＸ部門）チラシ', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119049.pdf', type: 'PDF', size: '1.1MB' },
          { name: '上尾市ＳＤＧｓ・ＤＸ推進補助金（ＳＤＧｓ部門）申請の手引き', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119053.pdf', type: 'PDF', size: '368KB' },
          { name: '上尾市ＳＤＧｓ・ＤＸ推進補助金（ＤＸ部門）申請の手引き', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119052.pdf', type: 'PDF', size: '355KB' },
          { name: '上尾市ＳＤＧｓ・ＤＸ推進補助金交付要領', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119071.pdf', type: 'PDF', size: '236KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金等交付申請書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119055.docx', type: 'Word', size: '16KB' },
          { name: '交付申請の様式 ※記入例はこちら Word版&nbsp;', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119069.docx', type: 'Word', size: '69KB' },
          { name: '交付申請の様式 ※記入例はこちら Word版&nbsp;', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119058.docx', type: 'Word', size: '69KB' },
          { name: '交付申請に係る専門家相談等確認書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119061.docx', type: 'Word', size: '24KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助事業等実績報告書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119063.docx', type: 'Word', size: '16KB' },
          { name: '実績報告に係る専門家相談等確認書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119065.docx', type: 'Word', size: '47KB' },
          { name: '補助金等交付請求書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/119067.docx', type: 'Word', size: '16KB' }
        ] }
      ]
    },
    saitama_ageo_setsubi: {
      checked: '2026-07-31',
      portal: { label: '上尾市 公式ページ', url: 'https://www.city.ageo.lg.jp/page/412445.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '小規模事業者等設備導入応援補助金 申請の手引き', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/117923.pdf', type: 'PDF', size: '436KB' },
          { name: '上尾市小規模事業者等設備導入応援補助金 FAQ', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/117905.pdf', type: 'PDF', size: '660KB' },
          { name: '添付書類チェックリスト（法人）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116292.pdf', type: 'PDF', size: '4.2MB' },
          { name: '添付書類チェックリスト（個人）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116293.pdf', type: 'PDF', size: '4.3MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '小規模事業者等設備導入補助金周知用リーフレット&nbsp;', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116253.pdf', type: 'PDF', size: '1.3MB' },
          { name: '上尾市小規模事業者等設備導入応援補助金交付申請書（第1号様式）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116255.docx', type: 'Word', size: '29KB' },
          { name: '上尾市小規模事業者等設備導入応援補助金 補助事業計画書（第1－2号様式）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116257.doc', type: 'Word', size: '76KB' },
          { name: '交付申請に係る上尾中小企業サポートセンター専門家相談等確認書（第1－3号様式）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116258.docx', type: 'Word', size: '22KB' },
          { name: '【記入例】上尾市小規模事業者等設備導入応援補助金交付申請書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116631.pdf', type: 'PDF', size: '3.9MB' },
          { name: '【記入例】上尾市小規模事業者等設備導入応援補助金 補助事業計画書', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116632.pdf', type: 'PDF', size: '353KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '上尾市小規模事業者等設備導入応援補助金変更等承認申請書（第3号様式）', url: 'https://www.city.ageo.lg.jp/uploaded/attachment/116261.docx', type: 'Word', size: '19KB' }
        ] }
      ]
    },
    saitama_chichibu_reform: {
      checked: '2026-07-31',
      portal: { label: '秩父市 公式ページ', url: 'https://www.city.chichibu.lg.jp/3591.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '秩父市住宅・店舗等リフォーム資金助成事業のご案内チラシ.pdf(596KB)', url: 'https://www.city.chichibu.lg.jp/secure/5246/02 リフォームチラシR8版.pdf', type: 'PDF', size: '596KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '秩父市住宅・店舗等リフォーム資金助成金の申請について.pdf(267KB)', url: 'https://www.city.chichibu.lg.jp/secure/5246/01 申請について(注意事項）.pdf', type: 'PDF', size: '275KB' },
          { name: '秩父市住宅・店舗等リフォーム資金助成金交付申請書.doc(18KB)', url: 'https://www.city.chichibu.lg.jp/secure/5246/02 申請書類.doc', type: 'Word', size: '18KB' },
          { name: '工事前の現場写真台紙.doc(14KB)', url: 'https://www.city.chichibu.lg.jp/secure/5246/03 写真台紙.doc', type: 'Word', size: '14KB' },
          { name: '申請委任状.doc(11KB)', url: 'https://www.city.chichibu.lg.jp/secure/5246/04 申請委任状.doc', type: 'Word', size: '10KB' }
        ] }
      ]
    },
    saitama_dx: {
      checked: '2026-07-31',
      portal: { label: '埼玉県 特設サイト', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '電子申請マニュアル (新しいタブで開きます)', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/埼玉県中小企業DX導入支援補助金_電子申請マニュアル20260701.pdf', type: 'PDF', size: '3.3MB' },
          { name: '交付要綱', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/00_埼玉県中小企業ＤＸ導入支援補助金交付要綱.pdf', type: 'PDF', size: '342KB' },
          { name: '交付要領', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/01_埼玉県中小企業ＤＸ導入支援補助金交付要領.pdf', type: 'PDF', size: '623KB' },
          { name: '補助事業の手引き', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/02_埼玉県中小企業ＤＸ導入支援補助金公募要領（7月1日～）.pdf', type: 'PDF', size: '667KB' },
          { name: 'その他のFAQはこちら', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/03_埼玉県中小企業ＤＸ導入支援補助金Ｑ＆Ａ.pdf', type: 'PDF', size: '404KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '実施計画書（事業者名）v2（08/06/08 差替）', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/02-1_【様式9】実施計画書（事業者名）v2.xlsx', type: 'Excel', size: '58KB' },
          { name: '納税状況等確認システムによる納税情報の確認に関する同意書', url: 'https://dxdounyushienhozyo.pref.saitama.lg.jp/assets/doc/02-6_【その他様式】納税状況等確認システムによる納税情報の確認に関する同意書_.xlsx', type: 'Excel', size: '15KB' }
        ] }
      ]
    },
    saitama_fujimi_challenge: {
      checked: '2026-07-31',
      portal: { label: '富士見市 公式ページ', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度中小企業チャレンジ支援事業補助金パンフレット', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R8panfu2.pdf', type: 'PDF', size: '420KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書（様式第1号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/1-sinseisho.docx', type: 'Word', size: '24KB' },
          { name: '申請書【経営革新事業】（様式第1号の2）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-1-2sinseisho.docx', type: 'Word', size: '23KB' },
          { name: '事業計画書【経営改善事業】（様式第2号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-1jigyoukeikakusho.docx', type: 'Word', size: '19KB' },
          { name: '事業計画書【研究開発事業】（様式第2号の2）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-2jigyoukeikakusho.docx', type: 'Word', size: '21KB' },
          { name: '事業計画書【人材育成事業】（様式第2号の3）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-3jigyoukeikakusho.docx', type: 'Word', size: '21KB' },
          { name: '事業計画書【販路開拓事業】（様式第2号の4）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-4jigyoukeikakusho.docx', type: 'Word', size: '21KB' },
          { name: '事業計画書【デジタル・トランスフォーメーション化事業】（様式第2号の5）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-5jigyoukeikakusho.docx', type: 'Word', size: '21KB' },
          { name: '事業計画書【設備導入事業】（様式第2号の6）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-2-6jigyoukeikakusho.docx', type: 'Word', size: '22KB' },
          { name: '収支予算書（様式第3号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-3shuusiyosan.docx', type: 'Word', size: '20KB' },
          { name: '収支決算書（様式第11号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-11syusikeltusan.docx', type: 'Word', size: '20KB' },
          { name: '店舗所有者の同意書', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/14sankouyousiki.docx', type: 'Word', size: '17KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '富士見市中小企業チャレンジ支援事業補助金変更承認申請書（様式第4号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-4henkoushounin.docx', type: 'Word', size: '21KB' },
          { name: '富士見市中小企業チャレンジ支援事業補助金中止（廃止）承認申請書（様式第5号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-5tyuusihaisishouninsinsei.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '富士見市中小企業チャレンジ支援事業補助金実績報告書（様式第9号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-9jiltusekihoukokusyo.docx', type: 'Word', size: '21KB' },
          { name: '事業報告書【経営改善事業】（様式第10号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-1jigyouhoukokusho.docx', type: 'Word', size: '23KB' },
          { name: '事業報告書【研究開発事業】（様式第10号の2）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-2jigyouhoukokusho.docx', type: 'Word', size: '20KB' },
          { name: '事業報告書【人材育成事業】（様式第10号の3）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-3jigyouhoukokusho.docx', type: 'Word', size: '20KB' },
          { name: '事業報告書【販路開拓事業】（様式第10号の4）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-4jigyouhoukokusho.docx', type: 'Word', size: '20KB' },
          { name: '事業報告書【デジタル・トランスフォーメーション化事業】（様式第10号の5）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-5jigyouhoukokusho.docx', type: 'Word', size: '23KB' },
          { name: '事業報告書【設備導入事業】（様式第10号の6）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-10-6jigyouhoukokusho.docx', type: 'Word', size: '23KB' },
          { name: '富士見市中小企業チャレンジ支援事業補助金交付請求書（様式第13号）', url: 'https://www.city.fujimi.saitama.jp/60jigyo/06sangyou/syoukou/jigyousya-sien/tyusyoukigyoutyarenz.files/R7-13seikyusho.docx', type: 'Word', size: '21KB' }
        ] }
      ]
    },
    saitama_iruma_shinko: {
      checked: '2026-07-31',
      portal: { label: '入間市 公式ページ', url: 'https://www.city.iruma.saitama.jp/soshiki/shokokankoka/shokogyo/8923.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '1.（様式第1号）入間市商工業振興助成金交付申請書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/1_s.docx', type: 'Word', size: '14KB' },
          { name: '2.（様式第2号）入間市商工業振興助成金交付決定(却下)通知書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/2_s.docx', type: 'Word', size: '14KB' },
          { name: '6.（様式第6号）入間市商工業振興助成事業業務開始届', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/6.docx', type: 'Word', size: '16KB' },
          { name: '7-2.（様式第7号の2）入間市商工業振興助成金確定通知書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/72.docx', type: 'Word', size: '14KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '3.（様式第3号）(第6条関係) 入間市商工業振興助成事業変更届', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/3_s.docx', type: 'Word', size: '13KB' },
          { name: '4.（様式第4号）入間市商工業振興助成金交付変更決定通知書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/4_s.docx', type: 'Word', size: '14KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '5.（様式第5号）入間市商工業振興助成金実績報告書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/5_s.docx', type: 'Word', size: '14KB' },
          { name: '7.（様式第7号）入間市商工業振興助成金交付請求書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/7.docx', type: 'Word', size: '14KB' },
          { name: '8.（様式第8号）入間市商工業振興助成事業継続状況報告書', url: 'https://www.city.iruma.saitama.jp/material/files/group/23/8.docx', type: 'Word', size: '12KB' }
        ] }
      ]
    },
    saitama_kawaguchi_dx: {
      checked: '2026-07-31',
      portal: { label: '川口市 公式ページ', url: 'https://www.city.kawaguchi.lg.jp/soshiki/01110/021/12/38430.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '申請要領', url: 'https://www.city.kawaguchi.lg.jp/material/files/group/103/R8dxyouryou2.pdf', type: 'PDF', size: '1.2MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '別表1', url: 'https://www.city.kawaguchi.lg.jp/material/files/group/103/gyousyu.pdf', type: 'PDF', size: '85KB' },
          { name: '申請書兼請求書', url: 'https://www.city.kawaguchi.lg.jp/material/files/group/103/R8sinnseisyo.docx', type: 'Word', size: '32KB' },
          { name: '申請書兼請求書（記入例）', url: 'https://www.city.kawaguchi.lg.jp/material/files/group/103/R8sinnseisyokinyuurei.pdf', type: 'PDF', size: '531KB' }
        ] }
      ]
    },
    saitama_kazo_keieikakushin: {
      checked: '2026-07-31',
      portal: { label: '加須市 公式ページ', url: 'https://www.city.kazo.lg.jp/soshiki/sangyoukoyou/hozyokin/35784.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '加須市経営革新支援補助金 チラシ（R8.4.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakushinshienhojokinchirashi_r80401.pdf', type: 'PDF', size: '406KB' },
          { name: '加須市経営革新支援補助金 申請手引（R8.4.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakushinshienhojokintebiki_r80401.pdf', type: 'PDF', size: '425KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '1 経営革新支援補助金交付申請書（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojyokin_sinseisyo_r60901.doc', type: 'Word', size: '40KB' },
          { name: '1 経営革新支援補助金交付申請書（記入例）（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojokin_sinseisyo_kinyuurei_r60901.pdf', type: 'PDF', size: '197KB' },
          { name: '2 経営革新支援補助金収支予算書（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojyokin_syuusiyosansyo_r60901.doc', type: 'Word', size: '46KB' },
          { name: '2 経営革新支援補助金収支予算書（記入例）（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojokin_syuusiyosansyo_kinyuurei_r60901.pdf', type: 'PDF', size: '176KB' },
          { name: '3 市税の納付状況の確認に係る同意書（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojyokin_sizeinonouhujyoukyounokakuninnikakarudouisyo_r60901.doc', type: 'Word', size: '37KB' },
          { name: '経営革新支援補助金交付申請書等様式（R6.9.1更新）', url: 'https://www.city.kazo.lg.jp/material/files/group/20/keieikakusinsienhojyokin_kouhusinseisyotouyousiki_r60901.pdf', type: 'PDF', size: '225KB' }
        ] }
      ]
    },
    saitama_koshigaya_setsubi: {
      checked: '2026-07-31',
      portal: { label: '越谷市 公式ページ', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/koshigaya_contents_buxtukakoutou.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '募集要項', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/00_bosyuuyoukou.pdf', type: 'PDF', size: '454KB' },
          { name: '10.よくあるお問い合わせ', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/qa.pdf', type: 'PDF', size: '341KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '物価高騰対策中小企業設備導入等支援補助金交付申請書（第1号様式）', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/01_sinnseisyo.docx', type: 'Word', size: '23KB' },
          { name: '物価高騰対策中小企業設備導入等支援補助金交付申請書（第1号様式）（記入例）', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/01_sinnseisyorei.pdf', type: 'PDF', size: '233KB' },
          { name: '事業計画書（添付書類①）（記入例）', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/11_zigyoukeikakurei.pdf', type: 'PDF', size: '353KB' },
          { name: '（参考）委任状', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/13_ininnzyou.docx', type: 'Word', size: '21KB' },
          { name: '収支決算内訳書（任意様式）自動計算用', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/kessanuchiwake_jidoukeisan.xlsx', type: 'Excel', size: '15KB' },
          { name: '収支決算内訳書（任意様式）手書記入用', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/kessanuchiwake_tegaki.pdf', type: 'PDF', size: '135KB' },
          { name: '収支決算内訳書（任意様式）記入例', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/kessanuchiwake_rei.pdf', type: 'PDF', size: '520KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '物価高騰対策中小企業設備導入等支援補助金実績報告書（第7号様式）（記入例）', url: 'https://www.city.koshigaya.saitama.jp/kurashi_shisei/jigyosha/shienyushi/hojokin/files/youshiki07_jissekihoukokurei.pdf', type: 'PDF', size: '175KB' }
        ] }
      ]
    },
    saitama_misato_ganbaro: {
      checked: '2026-07-31',
      portal: { label: '三郷市 公式ページ', url: 'https://www.city.misato.lg.jp/soshiki/chiikishinko/shokokanko/1/1422.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '制度概要 制度案内+申請の手引き', url: 'https://www.city.misato.lg.jp/material/files/group/21/ganbarouseidoannai.pdf', type: 'PDF', size: '830KB' },
          { name: '申請様式 制度案内+申請の手引き', url: 'https://www.city.misato.lg.jp/material/files/group/21/ganbarouannai.pdf', type: 'PDF', size: '830KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'がんばろう補助金交付申請書、事業計画書', url: 'https://www.city.misato.lg.jp/material/files/group/21/ganbarou.doc', type: 'Word', size: '74KB' },
          { name: '市税納付状況調査同意書', url: 'https://www.city.misato.lg.jp/material/files/group/21/1422-3.doc', type: 'Word', size: '32KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: 'がんばろう補助金実績報告書', url: 'https://www.city.misato.lg.jp/material/files/group/21/1422-5.doc', type: 'Word', size: '33KB' },
          { name: 'がんばろう補助金事業成果報告書・経費明細書', url: 'https://www.city.misato.lg.jp/material/files/group/21/1422-6.doc', type: 'Word', size: '42KB' }
        ] }
      ]
    },
    saitama_niiza_itdx: {
      checked: '2026-07-31',
      portal: { label: '新座市 公式ページ', url: 'https://www.city.niiza.lg.jp/site/business-support/itdx.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '新座市中小企業者IT・DX導入費補助金チラシ （別ウィンドウ・PDFファイル・388KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71051.pdf', type: 'PDF', size: '388KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請書類チェック表 （別ウィンドウ・PDFファイル・457KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/50392.pdf', type: 'PDF', size: '457KB' },
          { name: '申請書類チェック表 （別ウィンドウ・PDFファイル・444KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49333.pdf', type: 'PDF', size: '443KB' },
          { name: '新座市中小企業者IT・DX導入費補助金交付申請書 （別ウィンドウ・Wordファイル・24KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49309.docx', type: 'Word', size: '23KB' },
          { name: 'こちら （別ウィンドウ・PDFファイル・499KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49311.pdf', type: 'PDF', size: '498KB' },
          { name: 'こちら （別ウィンドウ・PDFファイル・319KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71053.pdf', type: 'PDF', size: '318KB' },
          { name: '経費内訳書 （別ウィンドウ・Wordファイル・33KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71052.docx', type: 'Word', size: '33KB' },
          { name: '個人情報利用目的外利用同意書 （別ウィンドウ・PDFファイル・119KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/66312.pdf', type: 'PDF', size: '119KB' },
          { name: '補助対象要件確認書 （別ウィンドウ・PDFファイル・336KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49685.pdf', type: 'PDF', size: '336KB' },
          { name: '交付申請書 記入例 （別ウィンドウ・PDFファイル・416KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71054.pdf', type: 'PDF', size: '416KB' },
          { name: '経費内訳書 記入例 （別ウィンドウ・PDFファイル・404KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71055.pdf', type: 'PDF', size: '404KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: 'PDFはこちらをクリックしてください。 （別ウィンドウ・PDFファイル・272KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71059.pdf', type: 'PDF', size: '271KB' },
          { name: '新座市中小企業者IT・DX導入費補助金変更申請書 （別ウィンドウ・Wordファイル・22KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71058.docx', type: 'Word', size: '21KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '新座市中小企業者IT・DX導入費補助金実績報告書 （別ウィンドウ・Wordファイル・21KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49687.docx', type: 'Word', size: '21KB' },
          { name: 'PDFはこちらをクリックしてください。 （別ウィンドウ・PDFファイル・416KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49688.pdf', type: 'PDF', size: '416KB' },
          { name: 'PDFはこちら をクリックしてください。（別ウィンドウ・PDFファイル・133KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49338.pdf', type: 'PDF', size: '132KB' },
          { name: '新座市中小企業者IT・DX導入費補助金請求書 （別ウィンドウ・Wordファイル・17KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/49337.docx', type: 'Word', size: '17KB' },
          { name: '実績報告書 記入例 （別ウィンドウ・PDFファイル・366KB）', url: 'https://www.city.niiza.lg.jp/uploaded/attachment/71056.pdf', type: 'PDF', size: '365KB' }
        ] }
      ]
    },
    saitama_saitama_dx: {
      checked: '2026-07-31',
      portal: { label: 'さいたま市産業創造財団 公式ページ', url: 'https://www.sozo-saitama.or.jp/topic/dx-subsidy/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'さいたま市DX補助金 募集概要', url: 'https://www.sozo-saitama.or.jp/sozowp/wp-content/uploads/2026/03/dx-suishinhojyokinflyer.pdf', type: 'PDF', size: '520KB' },
          { name: 'さいたま市DX推進補助金 公募要領', url: 'https://www.sozo-saitama.or.jp/sozowp/wp-content/uploads/2026/03/dx-suishinhojyokinkouboyouryo.pdf', type: 'PDF', size: '1002KB' }
        ] },
        { phase: '交付申請', items: [
          { name: 'さいたま市DX推進補助金交付申請書', url: 'https://www.sozo-saitama.or.jp/sozowp/wp-content/uploads/2026/03/zaidan-dx-Subsidy-shinseisyo.docx', type: 'Word', size: '26KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: 'さいたま市DX補助金 結果報告兼補助金請求書', url: 'https://www.sozo-saitama.or.jp/sozowp/wp-content/uploads/2026/03/結果報告兼補助金請求書.docx', type: 'Word', size: '25KB' }
        ] }
      ]
    },
    saitama_saitama_setsubi: {
      checked: '2026-07-31',
      portal: { label: 'さいたま市 公式ページ', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'さいたま市事業者向け設備導入応援補助金（物価高騰対応）交付要綱', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/hojyokinyouko.pdf', type: 'PDF', size: '311KB' },
          { name: 'さいたま市事業者向け設備導入応援補助金（物価高騰対応）交付のご案内', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/hojyokinntirasi.pdf', type: 'PDF', size: '289KB' },
          { name: 'さいたま市事業者向け設備導入応援補助金（物価高騰対応）FAQ', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/hojyokinFAQ.pdf', type: 'PDF', size: '625KB' },
          { name: '（申請時必要書類4）添付資料チェックシート', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/tennpuvchecksheet.docx', type: 'Word', size: '45KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '（申請時必要書類1）様式1_申請書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/sinnseisyo1.docx', type: 'Word', size: '40KB' },
          { name: '（申請時必要書類2）様式1－2_事業計画書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/jigyokeikaku.doc', type: 'Word', size: '66KB' },
          { name: '（申請時必要書類3）誓約書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/seiyakusyo.docx', type: 'Word', size: '19KB' },
          { name: '（参考）様式1_申請書（記載例）', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/sinseisyokisairei.pdf', type: 'PDF', size: '133KB' },
          { name: '（参考）様式1-2_ 事業計画書（記載例）', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/jigyokeikakukisairei.pdf', type: 'PDF', size: '168KB' },
          { name: '様式11_財産処分承認申請書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/zaisannsyobun.docx', type: 'Word', size: '18KB' },
          { name: '様式13_補助金返還等申出書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/hennkantoumouside.docx', type: 'Word', size: '17KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '様式4_取下書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/torisagesyo.docx', type: 'Word', size: '28KB' },
          { name: '様式5_内容変更等承認申請書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/naiyounennkousinnsei.docx', type: 'Word', size: '32KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '様式7_完了報告書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/kannryouhoukoku.docx', type: 'Word', size: '32KB' },
          { name: '様式9_請求書', url: 'https://www.city.saitama.lg.jp/005/001/002/p123535_d/fil/seikyusyo.docx', type: 'Word', size: '46KB' }
        ] }
      ]
    },
    saitama_toda_dx: {
      checked: '2026-07-31',
      portal: { label: '戸田市 公式ページ', url: 'https://www.city.toda.saitama.jp/soshiki/214/keizai-dxhojyo.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '2026年度（令和8年度）DX推進補助金チラシ', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/78757.pdf', type: 'PDF', size: '149KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金等交付申請書', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/80676.docx', type: 'Word', size: '17KB' },
          { name: '1.交付申請時 記入例', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/80680.pdf', type: 'PDF', size: '91KB' },
          { name: '経営計画書兼補助対象事業計画書', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/79249.doc', type: 'Word', size: '73KB' },
          { name: '&nbsp;経費明細表', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/73668.xlsx', type: 'Excel', size: '24KB' },
          { name: '経営計画書兼補助対象事業計画書、経費明細表', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/73669.pdf', type: 'PDF', size: '143KB' },
          { name: '1.交付申請時 記入例', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/66826.pdf', type: 'PDF', size: '182KB' },
          { name: '1.交付申請時 記入例', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/73666.pdf', type: 'PDF', size: '331KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助事業等実績報告書', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/80678.docx', type: 'Word', size: '16KB' },
          { name: '補助事業等実績報告書内訳調書', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/54854.docx', type: 'Word', size: '14KB' },
          { name: '口座振込払依頼書（法人）', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/79815.docx', type: 'Word', size: '21KB' },
          { name: '口座振込払依頼書（個人）', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/79816.docx', type: 'Word', size: '21KB' },
          { name: '口座振込払依頼書（記入例）（法人・個人事業主）', url: 'https://www.city.toda.saitama.jp/uploaded/attachment/79817.pdf', type: 'PDF', size: '789KB' }
        ] }
      ]
    },
    saitama_tokorozawa_monozukuri: {
      checked: '2026-07-31',
      portal: { label: '所沢市 公式ページ', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度パンフレット', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/R8_flier_00.pdf', type: 'PDF', size: '298KB' },
          { name: '令和8年度募集要領', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/R8_bosyu.pdf', type: 'PDF', size: '351KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '交付申請書（様式第1号）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/yousiki1.doc', type: 'Word', size: '31KB' },
          { name: '記入例 交付申請書（様式第1号）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_yousiki1.doc', type: 'Word', size: '34KB' },
          { name: '連携事業者名簿（様式例イ）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukurii.doc', type: 'Word', size: '38KB' },
          { name: '記入例 連携事業者名簿', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_renkeimeibo.doc', type: 'Word', size: '39KB' },
          { name: '個人情報に関する同意書', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/R4.kojinjyouhoudouisyo.doc', type: 'Word', size: '30KB' },
          { name: '産業財産権取得事業（別表第1）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-1.doc', type: 'Word', size: '48KB' },
          { name: '記入例 産業財産権取得事業', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_1.doc', type: 'Word', size: '56KB' },
          { name: '販路開拓事業（別表第2）宣伝等', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-2-1.doc', type: 'Word', size: '56KB' },
          { name: '記入例 販路開拓事業 宣伝等', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_2-1.doc', type: 'Word', size: '68KB' },
          { name: '販路開拓事業（別表第2）設備改修等', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-2-2.doc', type: 'Word', size: '55KB' },
          { name: '記入例 販路開拓事業 設備改修等', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_2-2.doc', type: 'Word', size: '62KB' },
          { name: '販路開拓事業（別表第2）展示商談会', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-2-3.doc', type: 'Word', size: '54KB' },
          { name: '記入例 販路開拓事業 展示商談会', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_2-3.doc', type: 'Word', size: '64KB' },
          { name: '新たな製品・技術・サービスの開発事業（別表第3）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-3.doc', type: 'Word', size: '54KB' },
          { name: '記入例 新たな製品・技術・サービスの開発事業', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_3.doc', type: 'Word', size: '66KB' },
          { name: '人材育成事業（別表第4）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/monodukuria-4.doc', type: 'Word', size: '56KB' },
          { name: '記入例 人材育成事業', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/rei_a_4.doc', type: 'Word', size: '64KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '口座振替依頼書（記入例つき）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/chiikishigen-monodukuri.files/koufuriiraisyo.xlsx', type: 'Excel', size: '50KB' }
        ] }
      ]
    },
    saitama_tokorozawa_toshigata: {
      checked: '2026-07-31',
      portal: { label: '所沢市 公式ページ', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '周知用チラシ', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/R8chirashi_zenki.pdf', type: 'PDF', size: '147KB' },
          { name: '所沢市都市型産業等育成補助金募集要領', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/R8youryou_zenki.docx', type: 'Word', size: '60KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '所沢市都市型産業等育成補助金交付申請書（様式第1号）', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/sinseisyo.docx', type: 'Word', size: '21KB' },
          { name: '様式第1号の記載例', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/R8kisairei.docx', type: 'Word', size: '24KB' },
          { name: '【様式例】ア 会社概要事業計画書', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/yousikirei-a.docx', type: 'Word', size: '18KB' },
          { name: '【様式例】イ 誓約書', url: 'https://www.city.tokorozawa.saitama.jp/kurashi/shigotojyoho/sangyo/kogyo/toshigatasangyo.files/yousikirei-i.docx', type: 'Word', size: '24KB' }
        ] }
      ]
    },
    tochigi_chinage: {
      checked: '2026-07-31',
      portal: { label: '栃木県 公式ページ', url: 'https://www.pref.tochigi.lg.jp/f06/chinagekannkyouseibihojokin.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'よくある質問', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r80518faq_chinagekankyouseibihojokin.pdf', type: 'PDF', size: '704KB' },
          { name: '令和8年度とちぎ賃上げ環境整備促進補助金チラシ', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r8tochigichinagekankyouseibisokushinhojokin_tirash.pdf', type: 'PDF', size: '1.1MB' },
          { name: 'とちぎ賃上げ環境整備促進補助金交付要領', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r7tochigichinagekannkyouseibihojokin_youryou.pdf', type: 'PDF', size: '204KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '申請から交付までの流れ', url: 'https://www.pref.tochigi.lg.jp/f06/documents/figureflow.pdf', type: 'PDF', size: '137KB' },
          { name: '（別記様式第1）交付申請書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/by1_kouhushinseisyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '36KB' },
          { name: '（様式第1号-2）収支予算（決算）書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y1-2_syushiyosansyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '33KB' },
          { name: '（様式第1号-3）誓約書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y1-3_seiyakusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '32KB' },
          { name: '（様式第6号）財産処分承認申請書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y6_zaisansyobunsyouninshinseisyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '36KB' },
          // 記入例➀（r8kinyuurei1_kouhushinseisyo.pdf）は 2026-08-17 の全数リンク確認で
          // 404 になっており、栃木県の現行ページからも消えている（記入例②③④のみ掲載）。
          // 存在しないファイルへ誘導しないため取り下げた。県が再掲したら戻すこと。
          { name: 'とちぎ賃上げ環境整備促進補助金問合せ／事前相談様式', url: 'https://www.pref.tochigi.lg.jp/f06/documents/20260612133609.xlsx', type: 'Excel', size: '221KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '（様式第3号）変更（注視・廃止）承認申請書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y3_henkousyouninshinseisyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '30KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '（別記様式第2）実績報告書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/by2_jissekihoukokusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '33KB' },
          { name: '（別記様式第4）交付請求書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/by4_kouhuseikyusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '16KB' },
          { name: '（様式第1号-1）事業計画（完了報告）書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y1-1_jigyoukeikakusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '42KB' },
          { name: '（様式第5号）消費税等仕入れ控除税額確定報告書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y5_kakuteihoukokusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '31KB' },
          { name: '（様式第7号）状況報告書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/y7_joukyouhoukokusyo_chinagekankyouseibihojokin.docx', type: 'Word', size: '43KB' },
          { name: '記入例➁（別記様式第2号、1号-1-2）実績報告書等', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r8kinyuurei2_kouhushinseisyo.pdf', type: 'PDF', size: '301KB' },
          { name: '記入例➂（別記様式第4）交付請求書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r8kinyuurei3_kouhushinseisyo.pdf', type: 'PDF', size: '71KB' },
          { name: '記入例④（様式第7号）状況報告書', url: 'https://www.pref.tochigi.lg.jp/f06/documents/r8kinyuurei4_joukyouhoukokusyo.pdf', type: 'PDF', size: '247KB' }
        ] }
      ]
    },
    tochigi_kanuma_digital: {
      checked: '2026-07-31',
      portal: { label: '鹿沼市 公式ページ', url: 'https://www.city.kanuma.tochigi.jp/0655/info-0000009573-0.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: 'デジタル化推進事業補助金交付要領', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/69c36453d3fc4.pdf', type: 'PDF', size: '183KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金等交付申請書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/6625cf806e2f9.docx', type: 'Word', size: '17KB' },
          { name: '補助事業等実施計画書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/66459f206007a.docx', type: 'Word', size: '14KB' },
          { name: '補助事業等収支内訳書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/665032619ae97.docx', type: 'Word', size: '11KB' },
          { name: '同意書兼宣誓書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/674fbe245ddec.docx', type: 'Word', size: '10KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '補助事業変更等承認申請書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/6625d03304a2a.docx', type: 'Word', size: '17KB' },
          { name: '補助事業変更届', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/6625d058ba6d4.docx', type: 'Word', size: '16KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '補助事業等実績報告書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/666a76a9689a2.docx', type: 'Word', size: '11KB' },
          { name: '補助事業実績書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/6625d1b47bb73.pdf', type: 'PDF', size: '405KB' },
          { name: '補助金等交付請求書', url: 'https://www.city.kanuma.tochigi.jp/manage/contents/upload/667ba824642f3.docx', type: 'Word', size: '11KB' }
        ] }
      ]
    },
    tochigi_nikko_digital: {
      checked: '2026-07-31',
      portal: { label: '日光市 公式ページ', url: 'https://www.city.nikko.lg.jp/soshiki/6/1029/5/1/9432.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '日光市中小事業者等デジタル情報発信事業費補助金チラシ', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXchirashi20260401.pdf', type: 'PDF', size: '836KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '日光市中小事業者等デジタル情報発信事業費補助金Q＆A', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXchirashiqa20260401.pdf', type: 'PDF', size: '519KB' },
          { name: '日光市中小事業者等デジタル情報発信事業費補助金交付申請書（様式第1号）', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXkouhusinnsei20260401.docx', type: 'Word', size: '25KB' },
          { name: '（記載例）日光市中小事業者等デジタル情報発信事業費補助金交付申請書（様式第1号）', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXkouhusinnseikisairei.pdf', type: 'PDF', size: '193KB' },
          { name: '誓約書兼同意書（様式第2号）', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXseiyakushokendouisho20260401.docx', type: 'Word', size: '20KB' },
          { name: '着手 着手届', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXchakushu20260401.docx', type: 'Word', size: '17KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '完了・実績報告 完了届', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXkanryou20260401.docx', type: 'Word', size: '17KB' },
          { name: '実績報告書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXjissekihoukokusho20260401.docx', type: 'Word', size: '18KB' },
          { name: '交付請求 請求書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/DXseikyusho20260401.docx', type: 'Word', size: '16KB' }
        ] }
      ]
    },
    tochigi_nikko_lease: {
      checked: '2026-07-31',
      portal: { label: '日光市 公式ページ', url: 'https://www.city.nikko.lg.jp/soshiki/6/1029/5/1/1705.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '日光市中小企業等生産設備導入事業費補助金交付要綱', url: 'https://www.city.nikko.lg.jp/material/files/group/30/ri-suhojoyoukou.pdf', type: 'PDF', size: '60KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '日光市中小企業等生産設備導入事業費補助金交付申請書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/ri-suhojosinseisho.docx', type: 'Word', size: '23KB' },
          { name: '市税及び公共料金の納付状況に関する調査の同意書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/ri-suhojodouisho.docx', type: 'Word', size: '20KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '日光市中小企業等生産設備導入事業実績報告書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/ri--suhojojisseki.docx', type: 'Word', size: '22KB' },
          { name: '補助金等交付請求書', url: 'https://www.city.nikko.lg.jp/material/files/group/30/kouhuseikyuusho.docx', type: 'Word', size: '18KB' }
        ] }
      ]
    },
    tochigi_shimotsuke_reform: {
      checked: '2026-07-31',
      portal: { label: '下野市 公式ページ', url: 'https://www.city.shimotsuke.lg.jp/2003/info-0000000482-3.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '交付申請', items: [
          { name: '（認定申請必要書類）認定申請書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/651fa1616f68b.pdf', type: 'PDF', size: '51KB' },
          { name: '（認定申請必要書類）【店舗を賃借する場合】改装等承認書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/651fa313bc4fc.pdf', type: 'PDF', size: '77KB' },
          { name: '（認定申請必要書類）【空き店舗を利用する場合】閉鎖期間に係る陳述書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/651fa17b723c3.pdf', type: 'PDF', size: '68KB' },
          { name: '（交付申請必要書類）交付申請書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/651fa2c800d1c.pdf', type: 'PDF', size: '41KB' },
          { name: '（交付申請必要書類）市税及び公共料金等納付状況調査同意書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/6a2a539d7cfb0.pdf', type: 'PDF', size: '71KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '（交付請求必要書類）交付請求書', url: 'https://www.city.shimotsuke.lg.jp/manage/contents/upload/651fa3386486f.pdf', type: 'PDF', size: '738KB' }
        ] }
      ]
    },
    kanagawa_seisansei: {
      checked: '2026-07-31',
      portal: { label: '資料ダウンロード（公式）', url: 'https://r8seisansei.pref.kanagawa.jp/download/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '公募要領（一般枠・グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kouboyouryo1.pdf?202606230930', type: 'PDF', size: '1.8MB' },
          { name: '公募要領（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kouboyouryo1_founder.pdf?202606230930', type: 'PDF', size: '1.8MB' },
          { name: '補助金交付要綱', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/koufuyoukou.pdf?202604081143', type: 'PDF', size: '279KB' },
          { name: '財産処分要領', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/syobunyouryou.pdf?202604071951', type: 'PDF', size: '261KB' },
          { name: '補助金概要チラシ', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/leaflet_seisansei.pdf?202604061449', type: 'PDF', size: '1.2MB' },
          { name: '電子申請マニュアル', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/manual_full.pdf?202604302032', type: 'PDF', size: '25.2MB' },
          { name: '交付申請チェックリスト6月公募（一般枠・グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/shinsei_checklist.xlsx?202604071835', type: 'Excel', size: '18KB' },
          { name: '交付申請チェックリスト7月公募以降（一般枠・グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/shinsei_checklist_2nd.xlsx?202606230933', type: 'Excel', size: '17KB' },
          { name: '交付申請チェックリスト（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/shinsei_checklist_founder.xlsx?202604071835', type: 'Excel', size: '18KB' },
          { name: '実績報告チェックリスト（一般枠・グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/jisseki_checklist.xlsx?202606042134', type: 'Excel', size: '18KB' },
          { name: '実績報告チェックリスト（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/jisseki_checklist_founder.xlsx?202606081041', type: 'Excel', size: '18KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '様式1 補助金申請書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1.docx?202604071937', type: 'Word', size: '30KB' },
          { name: '様式1 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1.pdf?202604071953', type: 'PDF', size: '162KB' },
          { name: '様式1-2 役員等氏名一覧表', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-2.xlsx?202604071835', type: 'Excel', size: '11KB' },
          { name: '様式1-2 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-2.pdf?202604071954', type: 'PDF', size: '126KB' },
          { name: '様式1-3 補助事業計画書6月公募（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3.docx?202604071835', type: 'Word', size: '56KB' },
          { name: '様式1-3 補助事業計画書6月公募（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3_group.docx?202604071835', type: 'Word', size: '60KB' },
          { name: '様式1-3 補助事業計画書7月公募以降（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3_2nd.docx?202606230933', type: 'Word', size: '57KB' },
          { name: '様式1-3 補助事業計画書7月公募以降（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3_group_2nd.docx?202606230934', type: 'Word', size: '60KB' },
          { name: '様式1-3 記載例（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-3.pdf?202604072015', type: 'PDF', size: '461KB' },
          { name: '様式1-3 記載例（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-3_group.pdf?202604072017', type: 'PDF', size: '454KB' },
          { name: '様式1-3 補助事業計画書（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3_founder.docx?202604071835', type: 'Word', size: '54KB' },
          { name: '様式1-3 記載例（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-3_founder.pdf?202604072017', type: 'PDF', size: '460KB' },
          { name: '事業収支計算書の入力シート', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/nyuryokushito.xlsx?202604091003', type: 'Excel', size: '48KB' },
          { name: '様式1-4 経費予算書（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-4.xlsx?202604071835', type: 'Excel', size: '17KB' },
          { name: '様式1-4 経費予算書（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-4_group.xlsx?202604071835', type: 'Excel', size: '17KB' },
          { name: '様式1-4 経費予算書（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-4_founder.xlsx?202604071835', type: 'Excel', size: '17KB' },
          { name: '様式1-4 記載例（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-4.pdf?202604072023', type: 'PDF', size: '107KB' },
          { name: '様式1-4 記載例（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-4_group.pdf?202604072024', type: 'PDF', size: '104KB' },
          { name: '様式1-4 記載例（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-4_founder.pdf?202604072024', type: 'PDF', size: '99KB' },
          { name: '様式1-5 県外調達理由書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-5.docx?202604071835', type: 'Word', size: '25KB' },
          { name: '様式1-6 米国関税等影響理由書6月公募', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-6.docx?202604071835', type: 'Word', size: '18KB' },
          { name: '様式1-6 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-6.pdf?202604072028', type: 'PDF', size: '266KB' },
          { name: '様式1-6-2 米国関税・中東情勢等影響理由書7月公募以降', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-6_2nd.docx?202606230936', type: 'Word', size: '18KB' },
          { name: '様式1-7 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei1-7.pdf?202604072031', type: 'PDF', size: '104KB' },
          { name: '様式1-8 事前着手届', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-8.docx?202604071940', type: 'Word', size: '28KB' },
          { name: '様式1-3 補助事業計画書 電子申請用（一般枠・グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3denshi.docx?202604081200', type: 'Word', size: '31KB' },
          { name: '様式1-3 補助事業計画書 電子申請用（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki1-3denshi_founder.docx?202604081215', type: 'Word', size: '32KB' },
          { name: '様式1-3 記載例 電子申請用（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisaireidenshi1-3.pdf?202604072039', type: 'PDF', size: '335KB' },
          { name: '様式1-3 記載例 電子申請用（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisaireidenshi1-3_group.pdf?202604072042', type: 'PDF', size: '324KB' },
          { name: '様式1-3 記載例 電子申請用（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisaireidenshi1-3_founder.pdf?202604072041', type: 'PDF', size: '343KB' },
          { name: '事業計画書の計画例①（一般枠） 三次元測定機の導入', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/seizougyo.pdf?202604151025', type: 'PDF', size: '320KB' },
          { name: '事業計画書の計画例②（一般枠） レーザー溶接機の導入', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/yousethukako.pdf?202604151025', type: 'PDF', size: '293KB' },
          { name: '事業計画書の計画例③（一般枠） 油圧シャベルの導入', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kensethugyo.pdf?202604151025', type: 'PDF', size: '286KB' },
          { name: '事業計画書の計画例④（一般枠） スチームコンベクションオーブンの導入', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/insyoku.pdf?202604151025', type: 'PDF', size: '294KB' },
          { name: '事業計画書の計画例⑤（一般枠） 工業用ミシンの導入', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youfukur.pdf?202604151025', type: 'PDF', size: '297KB' },
          { name: '様式5 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5.pdf?202606052018', type: 'PDF', size: '167KB' },
          { name: '様式5-2 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-2.pdf?202606052018', type: 'PDF', size: '129KB' },
          { name: '様式5-3 経費決算書（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5-3.xlsx?202606042135', type: 'Excel', size: '18KB' },
          { name: '様式5-3 経費決算書（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5-3_group.xlsx?202606042135', type: 'Excel', size: '18KB' },
          { name: '様式5-3 経費決算書（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5-3_founder.xlsx?202606042136', type: 'Excel', size: '17KB' },
          { name: '様式5-3 記載例（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-3.pdf?202606052019', type: 'PDF', size: '114KB' },
          { name: '様式5-3 記載例（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-3_group.pdf?202606052018', type: 'PDF', size: '110KB' },
          { name: '様式5-3 記載例（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-3_founder.pdf?202606052019', type: 'PDF', size: '104KB' },
          { name: '様式5-4 補助金取得財産管理台帳', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5-4.docx?202606042136', type: 'Word', size: '28KB' },
          { name: '様式5-4 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-4.pdf?202606052019', type: 'PDF', size: '141KB' },
          { name: '様式5-5 記載例（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei5-5.pdf?202606052020', type: 'PDF', size: '97KB' },
          { name: '様式6 記載例', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/kisairei6.pdf?202606052019', type: 'PDF', size: '89KB' },
          { name: '様式7 取得財産等の処分承認申請書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki7.docx?202604071939', type: 'Word', size: '20KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '交付申請取下書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/torisage.docx?202604071835', type: 'Word', size: '17KB' },
          { name: '様式2 変更承認申請書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki2.docx?202604071940', type: 'Word', size: '29KB' },
          { name: '様式2-2 変更経費予算書（一般枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki2-2.xlsx?202604071835', type: 'Excel', size: '18KB' },
          { name: '様式2-2 変更経費予算書（グループ化支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki2-2_group.xlsx?202604071835', type: 'Excel', size: '18KB' },
          { name: '様式2-2 変更経費予算書（創業者成長支援枠）', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki2-2_founder.xlsx?202604071835', type: 'Excel', size: '17KB' },
          { name: '様式3 中止（廃止）承認申請書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki3.docx?202604071940', type: 'Word', size: '28KB' },
          { name: '登録事項変更届', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/henkou.docx?202604071835', type: 'Word', size: '18KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '様式5 補助金実績報告書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5.docx?202606101558', type: 'Word', size: '24KB' },
          { name: '様式5-2 補助事業報告書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki5-2.docx?202606042135', type: 'Word', size: '17KB' },
          { name: '様式6 支払完了報告書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki6.docx?202606042136', type: 'Word', size: '16KB' },
          { name: '様式4 実施状況報告書', url: 'https://r8seisansei.pref.kanagawa.jp/assets/data/youshiki4.docx?202604071940', type: 'Word', size: '28KB' }
        ] }
      ]
    },
    kanko_shoryokuka: {
      checked: '2026-07-31',
      portal: { label: '資料ダウンロード（公式）', url: 'https://kanko-jinzai.go.jp/document/' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '令和8年度実施 省力化投資補助事業 公募要領(第三版)', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/04/260430_guidelines.pdf', type: 'PDF', size: '2.1MB' },
          { name: '計画申請の手引き', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_keikaku_tebiki.pdf', type: 'PDF', size: '4.5MB' },
          { name: '計画申請のシステムマニュアル', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260327_keikaku_manual.pdf', type: 'PDF', size: '4.5MB' },
          { name: '「中小企業省力化投資補助金」_補助対象外リスト', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/04/260430_chusho_list.pdf', type: 'PDF', size: '764KB' },
          { name: 'ベンダー向けチェックシート', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/04/260402_benda_check.pdf', type: 'PDF', size: '271KB' },
          { name: '交付申請のシステムマニュアル', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/07/260702_koufu_manual.pdf', type: 'PDF', size: '3.3MB' },
          { name: '事業実施・完了実績報告マニュアル', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/07/260702_jisshi_manual.pdf', type: 'PDF', size: '1.8MB' },
          { name: '変更交付申請のシステムマニュアル', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/07/260702_henkou_manual.pdf', type: 'PDF', size: '3.0MB' },
          { name: 'FAQ(よくあるご質問)', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/04/20260409_faq.pdf', type: 'PDF', size: '848KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '事業計画（下書き用フォーマット）', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260327_keikaku_form.xlsx', type: 'Excel', size: '61KB' },
          { name: '設備等導入前の写真', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_keikaku_pic.xlsx', type: 'Excel', size: '22KB' },
          { name: '省力化投資に係るアンケート（下書き用フォーマット）', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260306_keikaku_ank.xlsx', type: 'Excel', size: '29KB' },
          { name: '業者等選定理由書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_keikaku_sentei.docx', type: 'Word', size: '27KB' },
          { name: '交付規程', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/07/260702_koufu_kitei.pdf', type: 'PDF', size: '672KB' },
          { name: '補助事業者と補助金振込先口座名義が異なる理由書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_koufu_meigi.docx', type: 'Word', size: '34KB' },
          { name: '設備等導入後の写真', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_kanryou_pic.xlsx', type: 'Excel', size: '21KB' },
          { name: '取得財産等管理台帳', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/260624_daichou.xlsx', type: 'Excel', size: '32KB' },
          { name: '財産処分承認申請書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/260624_shobun.docx', type: 'Word', size: '31KB' },
          { name: '特定施設一覧', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/R8_tokutei_shisetsu.pdf', type: 'PDF', size: '1.2MB' },
          { name: 'プライバシーポリシー(個人情報の取り扱いについて)', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_privacy.pdf', type: 'PDF', size: '581KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '交付申請取下げ届出書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_jisshi_torisage.docx', type: 'Word', size: '31KB' },
          { name: '補助金振込先口座の変更届出', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_furikomi_henkou.xlsx', type: 'Excel', size: '19KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '事故報告書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/260624_jisshi_jiko.docx', type: 'Word', size: '44KB' },
          { name: '実施状況報告書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/260624_jisshi_joukyou.docx', type: 'Word', size: '30KB' },
          { name: '消費税及び地方消費税の額の確定に伴う報告書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/260624_zeihoukoku.docx', type: 'Word', size: '31KB' },
          { name: '銀行振込以外の支払いに係る理由書', url: 'https://kanko-jinzai.go.jp/wp-content/uploads/2026/03/260318_shiharai.docx', type: 'Word', size: '30KB' }
        ] }
      ]
    },
    saitama_higashimatsuyama_ganbaru: {
      checked: '2026-07-31',
      portal: { label: '東松山市 公式ページ', url: 'https://www.city.higashimatsuyama.lg.jp/soshiki/18/1571.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '東松山市がんばる中小企業等応援補助金 募集要項', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/14597.pdf', type: 'PDF', size: '193KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '補助金交付申請書(様式第1号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2020.docx', type: 'Word', size: '25KB' },
          { name: '事業計画書【経常利益・付加価値額】(様式第2号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2021.docx', type: 'Word', size: '25KB' },
          { name: '事業計画書【給与支給総額・付加価値額】(様式第2号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2022.docx', type: 'Word', size: '26KB' },
          { name: '経費内訳書(様式第3号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2023.docx', type: 'Word', size: '25KB' },
          { name: '事業者概要書(様式第4号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2024.docx', type: 'Word', size: '25KB' },
          { name: '財産処分承認申請書(任意書式)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2033.docx', type: 'Word', size: '24KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '変更承認申請書(様式第6号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2025.docx', type: 'Word', size: '25KB' },
          { name: '事業中止(廃止)承認申請書(任意書式)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2032.docx', type: 'Word', size: '24KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '実績報告書(様式第8号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2026.docx', type: 'Word', size: '25KB' },
          { name: '事業報告書(様式第9号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2027.docx', type: 'Word', size: '24KB' },
          { name: '経費内訳報告書(様式第10号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2028.docx', type: 'Word', size: '25KB' },
          { name: '請求書(様式第12号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2029.docx', type: 'Word', size: '25KB' },
          { name: '状況報告書【経常利益・付加価値額】(様式第13号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2030.docx', type: 'Word', size: '28KB' },
          { name: '状況報告書【給与支給総額・付加価値額】(様式第13号)', url: 'https://www.city.higashimatsuyama.lg.jp/uploaded/attachment/2031.docx', type: 'Word', size: '29KB' }
        ] }
      ]
    },
    saitama_shoryokuka: {
      checked: '2026-07-31',
      portal: { label: '埼玉県 公式ページ【新規導入】', url: 'https://www.pref.saitama.lg.jp/a0805/shoryokuka/sinnkidounyu_20260525.html' },
      note: '公式ページの区分に沿って並べています。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '案内チラシ', url: 'https://www.pref.saitama.lg.jp/documents/282419/chirashi0612.pdf', type: 'PDF', size: '1.1MB' },
          { name: '補助金交付要綱', url: 'https://www.pref.saitama.lg.jp/documents/282419/01_kouhuyoukou.pdf', type: 'PDF', size: '246KB' },
          { name: '補助金交付要領', url: 'https://www.pref.saitama.lg.jp/documents/282419/02_kouhuyouryou4.pdf', type: 'PDF', size: '1008KB' },
          { name: '補助事業の手引き【新規導入】', url: 'https://www.pref.saitama.lg.jp/documents/282419/99_tebiki_sinkidounyu.pdf', type: 'PDF', size: '1.4MB' },
          { name: 'よくある質問（Q&amp;A）', url: 'https://www.pref.saitama.lg.jp/documents/282419/99_qa_sinki0630.pdf', type: 'PDF', size: '412KB' }
        ] },
        { phase: '交付申請', items: [
          { name: '製品カテゴリリスト', url: 'https://www.pref.saitama.lg.jp/documents/282419/seihinnkategoririsuto080624.pdf', type: 'PDF', size: '1004KB' },
          { name: '交付申請書（様式第1号）及び実施計画書（様式第9号）（電子申請用）', url: 'https://www.pref.saitama.lg.jp/documents/282419/03_jissikeikakusyo_sinnkidounyuu0710.xlsx', type: 'Excel', size: '120KB' },
          { name: '交付申請時に必要な様式 記入例', url: 'https://www.pref.saitama.lg.jp/documents/282419/04_kinyuurei_sinkidounyu0612.xlsx', type: 'Excel', size: '132KB' },
          { name: '時間外労働時間の確認（指定様式1）', url: 'https://www.pref.saitama.lg.jp/documents/282419/05_shiteiyousiki1.xlsx', type: 'Excel', size: '750KB' },
          { name: '従業員減少の確認（指定様式2）', url: 'https://www.pref.saitama.lg.jp/documents/282419/06_shiteiyousiki2.xlsx', type: 'Excel', size: '1.7MB' },
          { name: '総労働時間の確認（指定様式3）', url: 'https://www.pref.saitama.lg.jp/documents/282419/07_shiteiyousiki3.xlsx', type: 'Excel', size: '1.4MB' },
          { name: '賃金引上げの確認（指定様式4）', url: 'https://www.pref.saitama.lg.jp/documents/282419/08_siteiyousiki4_0710.xlsx', type: 'Excel', size: '22KB' },
          { name: '納税状況等確認システムによる納税情報の確認に関する同意書', url: 'https://www.pref.saitama.lg.jp/documents/282419/09_nouzeikakunin2.xlsx', type: 'Excel', size: '15KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '計画変更承認申請書（様式第3号）', url: 'https://www.pref.saitama.lg.jp/documents/282419/10_yousiki3gou.docx', type: 'Word', size: '30KB' },
          { name: '補助事業中止（廃止）承認申請書（様式第5号）', url: 'https://www.pref.saitama.lg.jp/documents/282419/11_yousiki5gou.docx', type: 'Word', size: '23KB' },
          { name: '補助金申請取下書（様式第10号）', url: 'https://www.pref.saitama.lg.jp/documents/282419/12_yousiki10gou.docx', type: 'Word', size: '23KB' }
        ] }
      ]
    },
    tokyo_suginami_digital: {
      checked: '2026-07-31',
      portal: { label: '杉並区 公式ページ', url: 'https://www.city.suginami.tokyo.jp/s121/news/25089.html' },
      note: '公式ページの区分に沿って並べています。同じ様式のPDF版も公式ページにあります。',
      groups: [
        { phase: '申請の前に読む', items: [
          { name: '杉並区中小企業等デジタル化推進事業募集チラシ', url: 'https://www.city.suginami.tokyo.jp/documents/25089/chirashi_degital.pdf', type: 'PDF', size: '1.1MB' }
        ] },
        { phase: '交付申請', items: [
          { name: '【記入例】杉並区中小企業等デジタル化推進事業計画書（第2号様式第6条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/kinyurei_keikakusyo.pdf', type: 'PDF', size: '216KB' },
          { name: '杉並区中小企業等デジタル化推進事業助成申請書（第1号様式第6条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/degital_shinsei.docx', type: 'Word', size: '33KB' },
          { name: '杉並区中小企業等デジタル化推進事業計画書（第2号様式第6条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/degital_keikaku.docx', type: 'Word', size: '19KB' }
        ] },
        { phase: '計画を変えるとき', items: [
          { name: '杉並区中小企業等デジタル化推進事業計画（変更・取下げ）申請書（第6号様式第9条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/digital_henkotorisage_word.docx', type: 'Word', size: '25KB' }
        ] },
        { phase: '実績報告（事業が終わったあと）', items: [
          { name: '杉並区中小企業等デジタル化推進事業助成実績報告書（第8号様式第10条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/digital_zissekihoukoku.docx', type: 'Word', size: '26KB' },
          { name: '杉並区中小企業等デジタル化推進事業助成請求書兼口座振替依頼書（第10号様式第12条関係）', url: 'https://www.city.suginami.tokyo.jp/documents/25089/digital_seikyu.xlsx', type: 'Excel', size: '14KB' }
        ] }
      ]
    }
  };
  global.KOBAN_PROGRAM_DOCS = PROGRAM_DOCS;
})(window);

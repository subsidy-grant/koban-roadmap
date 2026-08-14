// documents.html と applications.html の両方が使う「取り寄せが必要な共通書類」の一次データと判定関数。
// 2つのページで別々に持つと更新漏れが起きるため、ここに1つだけ置く。
// 参照する側は <script src="common_docs.js"></script> をこの後の <script> より前に読み込むこと。
(function (global) {
  'use strict';

  var KOYOU_KEYS = /^(career|jinzai|ryouritsu|hatarakikata)/;
  var LOCAL_KEYS = /^(tokyo|kanagawa|saitama|chiba|tochigi|gunma)_/;
  function progDocType(key) {
    if (!key) return null;
    if (key === 'kaizen') return 'roudou';
    if (KOYOU_KEYS.test(key)) return 'koyou';
    if (LOCAL_KEYS.test(key)) return 'local';
    return 'hojo';
  }
  var DOC_TYPE_LABEL = {
    hojo: '国の補助金', local: '自治体の補助金',
    koyou: '雇用関係助成金（厚労省）', roudou: '業務改善助成金'
  };
  // 各書類の types（どの類型で要るか）と progs（特定の制度だけで要るもの）。
  // 2026-08-03に3つの知識エージェントが一次資料で確認した結果に基づく
  var COMMON_DOCS = [
    // --- 申請のとき ---
    { id: 'toki', types: ['hojo','local'], when: 'apply', who: '法人', days: 7, third: false,
      doc: '登記事項証明書（履歴事項全部証明書／現在事項全部証明書）',
      where: '法務局の窓口・オンライン請求',
      note: '持続化補助金は「提出日から3か月以内・原本」と指定。早く取りすぎても使えない' },
    { id: 'teikan', types: ['hojo','local'], when: 'apply', who: '法人', days: 1, third: false,
      doc: '定款の写し', where: '自社',
      note: '最新の内容か（変更後に改訂しているか）を確認。手元に無いと再作成に日数がかかる' },
    { id: 'inkan', types: ['hojo','local'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '印鑑証明書', where: '法人は法務局／個人は市区町村',
      note: '押印を求める制度で必要。期限指定あり' },
    { id: 'honnin', types: ['hojo','local'], when: 'apply', who: '個人事業主', days: 7, third: false,
      doc: '本人確認書類（運転免許証・運転経歴証明書・住民票のいずれか）',
      where: '手元／住民票は市区町村',
      note: 'デジタル化・AI導入補助金は「有効期限内」「住民票は発行から3か月以内」と指定' },
    { id: 'kaigyo', types: ['hojo','local'], when: 'apply', who: '個人事業主', days: 30, third: false,
      doc: '開業届の写し（開業日の記載があるもの）', where: '手元／税務署',
      note: '決算期を一度も迎えていない場合に必要。持続化補助金は「開業日の記載が無い開業届は無効」' },
    { id: 'kokuzei', types: ['hojo'], when: 'apply', who: '全員', days: 7, third: false,
      doc: '納税証明書（国税。法人税または所得税）', where: '所轄の税務署・e-Tax',
      note: 'デジタル化・AI導入補助金は「その1」または「その2」と種類を指定。制度ごとに違うので要確認' },
    { id: 'chihou', types: ['local'], when: 'apply', who: '全員', days: 7, third: false,
      doc: '納税証明書・完納証明書（都道府県税・市町村税）', where: '市区町村・都道府県税事務所',
      note: '自治体の制度はほぼ必須。「市税の滞納が無いこと」が要件になっていることが多い' },
    { id: 'kessan', types: ['hojo','local','koyou','roudou'], when: 'apply', who: '法人', days: 7, third: false,
      doc: '貸借対照表・損益計算書（直近1〜2期分）', where: '自社・顧問税理士',
      note: '税理士に依頼する場合は日数を見込む。何期分かは制度により違う' },
    { id: 'kakutei', types: ['hojo','local'], when: 'apply', who: '全員', days: 30, third: false,
      doc: '確定申告書の控え（収受印または受信通知つき）', where: '自社',
      note: '2025年（令和7年）1月から、税務署は控えに収受日付印を押さなくなりました。'
            + '控えが手元に無いときは、e-Taxの「申告書等情報取得サービス」でPDFを無料で取れます。'
            + 'それが使えない場合は税務署への開示請求で1か月ほどかかります。マイナンバーは黒塗りに' },
    { id: 'aoiro', types: ['hojo','local'], when: 'apply', who: '個人事業主', days: 7, third: false,
      doc: '青色申告決算書または収支内訳書', where: '自社・顧問税理士',
      note: '確定申告書とは別に添付を求められる。持続化補助金は面数（1〜4面／1・2面）まで指定' },
    { id: 'uriage', types: ['hojo'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '売上台帳など、売上が発生していることが分かる書類', where: '自社',
      note: '決算期を一度も迎えていない場合に、決算書・確定申告書の代わりに求められる' },
    { id: 'chingin', types: ['koyou','roudou'], when: 'apply', who: '全員', days: 3, third: false,
      doc: '賃金台帳・出勤簿（タイムカード）・労働者名簿', where: '自社',
      note: '人を雇っている場合、雇用関係助成金では必ず要ります。ふだん使っている原本かそのコピーを出してください。'
            + '申請用に作り直したものを出すと不支給になります' },
    { id: 'chinsheet', types: ['hojo'], progs: ['ai'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '賃金状況報告シート（補助率引上げ・加点用の指定様式）', where: '制度の公式サイト',
      note: 'デジタル化・AI導入補助金で補助率2/3を使う場合。指定様式のダウンロードが必要' },
    { id: 'hoken', types: ['koyou','roudou'], when: 'apply', who: '該当者のみ', days: 7, third: false,
      doc: '社会保険・労働保険に入っていることが分かる書類',
      where: '雇用保険＝ハローワーク／労働保険＝労働基準監督署・労働局／健康保険・厚生年金＝年金事務所',
      note: '「被保険者一覧をください」では通じないことがあります。手元にあるのは、雇用保険なら'
            + '「雇用保険被保険者資格取得等確認通知書」、労働保険なら「概算・確定保険料申告書」の控え、'
            + '健康保険・厚生年金なら「被保険者標準報酬決定通知書」です' },
    { id: 'kyoka', types: ['hojo','local'], when: 'apply', who: '該当者のみ', days: 7, third: false,
      doc: '許認可証の写し（美容所の確認証・飲食店営業許可証など）', where: '自社・保健所',
      note: '手元にあれば当日。再発行は日数がかかる' },
    { id: 'seiyaku', types: ['hojo','local'], when: 'apply', who: '全員', days: 3, third: false,
      doc: '誓約書・宣誓同意書（暴力団排除など）', where: '制度の公式サイト（様式）',
      note: 'ほぼ全制度にある。代表者印が要るものが多く、押印のために出社が要ることがある' },
    { id: 'tsucho', types: ['hojo','local','koyou','roudou'], when: 'apply', who: '全員', days: 1, third: false,
      doc: '通帳の写し（振込先が分かるもの）', where: '自社',
      note: '銀行名・支店・口座番号・カナ名義が読める面。ネット銀行は画面の印刷で可のことが多い' },
    { id: 'mitsu', types: ['hojo','local','roudou'], when: 'apply', who: '全員', days: 14, third: true,
      doc: '見積書（2社以上の相見積りを求められることが多い）', where: '発注先の業者',
      note: '金額の基準は制度でまったく違います。業務改善助成金は「10万円以上なら2者以上」、'
            + '補助金では「100万円以上」とすることが多いです。ご自分が出す制度の公募要領で必ず確認を。業者の返事待ちが出ます' },
    { id: 'catalog', types: ['hojo','local','roudou'], when: 'apply', who: '該当者のみ', days: 7, third: true,
      doc: 'カタログ・仕様書・図面（工事を伴う場合は配置図・平面図）', where: '発注先の業者',
      note: '設備や工事がある制度でほぼ必須。図面は業者に作ってもらうので日数がかかる' },
    { id: 'lease', types: ['hojo','local'], when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: 'リース契約に関する書類（宣誓書・共同申請の同意など）', where: 'リース会社',
      note: 'リースで導入する場合。リース会社との共同申請になる制度がある' },
    { id: 'kinyu', types: ['hojo'], when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: '金融機関による確認書', where: '取引金融機関',
      note: '借入で資金調達する計画のとき。支店の決裁が要るので早めに相談する' },
    { id: 'shien', types: ['hojo'], progs: ['jizoku'], when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: '事業支援計画書（様式4）', where: '商工会議所・商工会',
      note: '持続化補助金では必須。発行に面談が要ります。日数の目安ではなく、申請の締切とは別に'
            + '「発行の受付締切」という締切日が決まっています。この日を過ぎるといかなる理由でも発行できません' },
    { id: 'nintei', types: ['hojo'], when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: '認定経営革新等支援機関の確認書', where: '認定支援機関（金融機関・税理士等）',
      note: '面談が必要な場合があり、最も日数がかかりやすい' },
    { id: 'kakushin', types: ['local'], when: 'apply', who: '該当者のみ', days: 60, third: true,
      doc: '経営革新計画の承認書・承認申請書の写し', where: '都道府県',
      note: '「経営革新計画の承認」を前提にする自治体制度がある（東松山市など）。承認自体に1〜2か月かかる' },
    { id: 'gbiz', types: ['hojo'], when: 'apply', who: '該当者のみ', days: 30, third: true,
      doc: 'GビズIDプライム', where: 'GビズID 公式サイト',
      note: '国の制度の電子申請で必須。申し込み方法で日数が大きく違います。マイナンバーカードを使うオンライン申請なら'
            + '法人代表者はほぼ待たずに作れますが、書類を郵送する申請は最大1か月かかります。'
            + '書類申請の方は様式を書き始める前に申し込んでください' },
    { id: 'photo_before', types: ['hojo','local','roudou'], when: 'apply', who: '該当者のみ', days: 1, third: false,
      doc: '導入前の写真', where: '自社',
      note: '設備を入れる前に撮っておく。入れてしまうと二度と撮れません。'
            + '撮る時期は「申請の締切」ではなく「交付決定のあと・設置の前」です。左の日数は目安になりません' },

    // ここから下は雇用関係助成金（キャリアアップ・人材開発支援・業務改善）で必須になるもの。
    // 2026-08-01の社労士監修レビューで、これらが1件も入っていないと指摘を受けて追加した。
    // 様式をダウンロードできても、これらが無いと窓口で受理されない。
    { id: 'cap_plan', types: ['koyou'], progs: ['career','career_kaitei','career_kyotsu','career_shoyo','career_tanjikan','career_shogai'], when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: 'キャリアアップ計画書（様式第1号）', where: '都道府県労働局・ハローワーク',
      note: 'キャリアアップ助成金で必須。正社員にする日など取組を始める日の前の日までに提出して、'
            + '受理されている必要があります。あとから出してもさかのぼれません' },
    { id: 'kunren_plan', types: ['koyou'], progs: ['jinzai'], when: 'apply', who: '該当者のみ', days: 30, third: true,
      doc: '職業訓練実施計画届（様式第1-1号）', where: '都道府県労働局',
      note: '人材開発支援助成金で必須。訓練を始める日の6か月前から1か月前までの間に出します。'
            + 'あわせて、この届を出す日までに職業能力開発推進者を選任し、事業内職業能力開発計画を作って'
            + '働く人に周知しておく必要があります' },
    { id: 'shiharai', types: ['koyou'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '支払方法・受取人住所届', where: '厚生労働省の様式（労働局）',
      note: '雇用関係助成金で、振込先をまだ登録していない場合に必要。通帳の写しを付けます。'
            + 'これを出さないと審査が通っても振り込まれません' },
    { id: 'youken_moushitate', types: ['koyou'], when: 'apply', who: '該当者のみ', days: 1, third: false,
      doc: '支給要件確認申立書（共通要領様式第1号）', where: '厚生労働省の様式',
      note: 'キャリアアップ助成金・人材開発支援助成金で必須。受け取れる条件を満たしているかの確認表で、'
            + '1つでも当てはまらない項目があると受け取れません。先に目を通してください' },
    { id: 'keiyaku', types: ['koyou'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '雇用契約書または労働条件通知書の写し', where: '自社',
      note: '雇用関係助成金で必須。キャリアアップ助成金は正社員にする前と後の両方が要ります。'
            + '就業規則と食い違っていると通りません' },
    { id: 'shugyo', types: ['koyou','roudou'], when: 'apply', who: '該当者のみ', days: 7, third: false,
      doc: '就業規則・賃金規程の写し', where: '自社（労働基準監督署の受理印があるもの）',
      note: '雇用関係助成金で必須。働く人が10人未満で届出の義務が無いお店は、代わりに'
            + '「働く人の代表と事業主の氏名を書いた申立書」を付けます' },
    { id: 'inin', types: ['koyou','roudou'], when: 'apply', who: '該当者のみ', days: 3, third: false,
      doc: '委任状（原本）', where: '自社',
      note: '代理の人に出してもらう場合。雇用関係助成金の申請を代理でできるのは、'
            + '社会保険労務士または弁護士に限られます' },
    { id: 'koudou_keikaku', types: ['koyou'],
      progs: ['ryouritsu_ikuji','ryouritsu_shusseiji','ryouritsu_kaigo','ryouritsu_juunan','ryouritsu_daitai','ryouritsu_funin'],
      when: 'apply', who: '全員', days: 14, third: true,
      doc: '一般事業主行動計画の策定届（写し）と、公表・周知したことが分かる書類', where: '都道府県労働局（事前に届出）',
      note: '両立支援等助成金で必須（プラチナくるみん認定の会社は不要）。先に労働局へ届け出て、'
            + '「両立支援のひろば」等で公表し、働く人に周知しておく必要があります' },
    { id: 'kodomo_kakunin', types: ['koyou'],
      progs: ['ryouritsu_ikuji','ryouritsu_shusseiji','ryouritsu_juunan','ryouritsu_daitai'],
      when: 'apply', who: '該当者のみ', days: 7, third: true,
      doc: '子がいることが確認できる書類（母子健康手帳の出生のページ・住民票など）', where: '従業員本人・市区町村',
      note: '本人に持ってきてもらう書類です。住民票にマイナンバーの記載があるときは黒塗りにしてから出します' },
    { id: 'kunren_keiyaku', types: ['koyou'], progs: ['jinzai'],
      when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: '訓練カリキュラム・受講案内・教育訓練機関との契約書（写し）', where: '研修会社（教育訓練機関）',
      note: '外部の研修を使う場合。実施目的・日ごとの内容・時間数・受講料の内訳まで書かれたものが要ります。'
            + '研修会社からの取り寄せに日数がかかります' },
    { id: 'kunren_shodaku', types: ['koyou'], progs: ['jinzai'],
      when: 'apply', who: '該当者のみ', days: 14, third: true,
      doc: '支給申請承諾書（様式第12号。研修会社に書いてもらう）', where: '研修会社（教育訓練機関）',
      note: '外部研修では必ず提出します。研修会社に断られると申請できません。'
            + '申し込む前に「承諾書を書いてもらえるか」を確認してください' },

    // --- 事業が終わったあと（実績報告） ---
    { id: 'ryoshu', types: ['hojo','local','roudou'], when: 'report', who: '全員', days: 7, third: true,
      doc: '請求書・納品書・領収書', where: '発注先の業者',
      note: '宛名が申請者と一致しているか。日付が交付決定より前だと対象外になる' },
    { id: 'furikomi', types: ['hojo','local','roudou'], when: 'report', who: '全員', days: 3, third: false,
      doc: '支払を確認できる書類（銀行振込の控え・通帳の該当ページ）', where: '自社・金融機関',
      note: '現金払いやクレジット払いを認めない制度が多い。銀行振込にしておくのが安全' },
    { id: 'photo_after', types: ['hojo','local','roudou'], when: 'report', who: '該当者のみ', days: 1, third: false,
      doc: '導入後の写真・設置状況が分かる写真', where: '自社',
      note: '型番の写った写真を求められることがある' },
    { id: 'daicho', types: ['hojo','local'], when: 'report', who: '該当者のみ', days: 3, third: false,
      doc: '取得財産等管理台帳', where: '制度の公式サイト（様式）',
      note: '一定額以上の設備を入れた場合。処分するときは事前の承認が要る' },
    { id: 'chingin_kisoku_go', types: ['roudou'], when: 'report', who: '該当者のみ', days: 7, third: false,
      doc: '事業場内最低賃金の規程を入れた就業規則等の写し', where: '自社',
      note: '業務改善助成金の実績報告で必須。引き上げた後の金額を、お店で使う下限の賃金として'
            + '就業規則等に定めておく必要があります' },
    { id: 'joukyou_houkoku', types: ['roudou'], when: 'report', who: '該当者のみ', days: 3, third: false,
      doc: '状況報告（様式第8号）と賃金台帳の写し', where: '厚生労働省の様式',
      note: '業務改善助成金は、助成金を受け取った後にもう一度この報告が要ります' }
  ];

  var COMMON_DOCS_SOURCE =
    '2026年8月1日〜3日に、雇用関係助成金は共通要領（令和8年4月8日版）・キャリアアップ助成金/' +
    '人材開発支援助成金/両立支援等助成金の令和8年度パンフレットと支給要領、業務改善助成金は' +
    '令和8年度の交付要領と申請マニュアル、補助金は小規模事業者持続化補助金（第20回・公募要領第8版）、' +
    'デジタル化・AI導入補助金2026（通常枠）、新事業進出・ものづくり商業サービス補助金（第1回）、' +
    '中小企業省力化投資補助金（第7回）などの公募要領を開いて、提出書類の一覧から拾いました。' +
    '類型ごとの要否（例：雇用関係助成金では登記事項証明書が原則不要）もこの一次資料で確認しています。' +
    '雇用関係助成金の申請書類の作成・提出については、社会保険労務士にご相談ください。';

  // 選択制度に対して、この書類が要るか
  function docApplies(c, key) {
    if (!key) return true;                       // 未選択なら全部見せる
    if (c.progs) return c.progs.indexOf(key) !== -1;
    if (!c.types) return true;
    return c.types.indexOf(progDocType(key)) !== -1;
  }

  function whoBadgeClass(who) {
    return who === '全員' ? 'sage' : (who === '該当者のみ' ? 'rust' : 'accent');
  }

  global.KOBAN_COMMON_DOCS = {
    COMMON_DOCS: COMMON_DOCS,
    COMMON_DOCS_SOURCE: COMMON_DOCS_SOURCE,
    DOC_TYPE_LABEL: DOC_TYPE_LABEL,
    progDocType: progDocType,
    docApplies: docApplies,
    whoBadgeClass: whoBadgeClass
  };
})(window);

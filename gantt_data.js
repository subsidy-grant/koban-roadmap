// 申請の手順をタスクに分解したデータ（documents.html の「手順とスケジュール」で使う）。
//
// 作り方：
//   雇用関係助成金（career / jinzai / kaizen）は 2026-08-02 に社会保険労務士の
//   知識体系で厚生労働省の一次資料（下記）を開いて拾い直したもの。
//   補助金（jizoku / ai / shoryokuka）は中小企業診断士の知識体系で
//   当該公募回の公募要領を開いて拾ったもの。
//   いずれも task ごとに source（出典URL）と checked（確認日時）を持つ。
//
// 直すときの約束：
//   ・金額・期限・要件は暗記で書かない。必ず一次資料を開いて出典と確認日時を入れる
//   ・確認できなかったものは捏造せず source を 'unverified' にする（画面に「未確認」と出る）
//   ・「申請すればもらえる」と読める書き方にしない
//   ・社労士・診断士の独占業務に当たる作業は owner を分けて「依頼する」と書く
//
// 一次資料（雇用関係助成金・2026-08-02 12:50〜13:15 JST に取得）
//   キャリアアップ助成金のご案内（令和8年度版） https://www.mhlw.go.jp/content/11910500/001683860.pdf
//   正社員化コース リーフレット（令和8年4月8日版） https://www.mhlw.go.jp/content/11910500/001683945.pdf
//   人材育成支援コースのご案内（令和8年4月8日版） https://www.mhlw.go.jp/content/11800000/001687559.pdf
//   令和8年度業務改善助成金のご案内 https://www.mhlw.go.jp/content/11200000/001693416.pdf
//   業務改善助成金 交付要綱（令和8年度） https://www.mhlw.go.jp/content/11200000/001693388.pdf
//   業務改善助成金 交付要領（令和8年度） https://www.mhlw.go.jp/content/11200000/001693391.pdf
//   業務改善助成金 申請マニュアル（令和8年度） https://www.mhlw.go.jp/content/11200000/001719498.pdf

window.KOBAN_GANTT = {
  // 利用者に入れてもらう日付。ここから全タスクの日程を逆算・順算する
  anchors: {
    career: [
      { key: 'transfer_date', label: '正社員に転換する予定日', note: '前の工程はすべてこの日から逆算します' },
      { key: 'wage6m_paydate', label: '転換後6か月分の賃金を支払う日', note: '支給申請の期限はここから2か月です' }
    ],
    jinzai: [
      { key: 'training_start', label: '訓練を開始する予定日', note: '計画届を出せる期間（6か月前〜1か月前）がここから決まります' },
      { key: 'training_end', label: '訓練が終了する予定日', note: '支給申請の期限は翌日から2か月です' }
    ],
    kaizen: [
      { key: 'application_date', label: '交付申請書を提出する予定日', note: '令和8年度の受付開始は9月1日です' },
      { key: 'minwage_effective_date', label: 'お店のある都道府県の最低賃金の発効日', note: '申請の締切と賃上げの期限がここで決まります' },
      { key: 'grant_decision_date', label: '交付決定の通知を受けた日', note: '通知が届いてから入れてください。設備の発注はこの日より後でないと対象外です', optional: true }
    ],
    hatarakikata: [
      { key: 'application_date', label: '交付申請書を提出する予定日', note: '令和8年度の締切は2026年11月30日(月)17時必着です。予算がなくなると締切前でも受付が終わります' },
      { key: 'grant_decision_date', label: '交付決定の通知を受けた日', note: '通知が届いてから入れてください。発注・契約はこの日より後でないと対象外です', optional: true },
      { key: 'jigyou_end', label: '改善事業を終える予定日', note: '期限は2027年1月31日(日)。支給申請の締切はここから30日後か2027年2月5日(金)の早い方です', optional: true }
    ],
    jizoku: [
      { key: 'deadline', label: '申請の受付締切日', note: '第20回は2026年12月15日17:00です' },
      { key: 'form4_deadline', label: '事業支援計画書（様式4）の発行受付締切日', note: '申請締切とは別で、必ずこれより前にあります。第20回は2026年12月4日' },
      { key: 'grant_date', label: '交付決定日', note: '通知書に書かれています。採択発表から概ね1〜2か月後', optional: true },
      { key: 'jisshi_limit', label: '補助事業の実施期限', note: '第20回は2028年3月31日', optional: true }
    ],
    ai: [
      { key: 'deadline', label: '交付申請の締切日', note: '回ごとに事務局サイトで公表されます（4次は2026年8月25日17:00）' },
      { key: 'grant_date', label: '交付決定日', note: '回ごとに予定日が公表されます（4次は2026年10月7日予定）' },
      { key: 'report_limit', label: '実績報告の期限', note: '交付決定日から6か月間程度（4次は2027年3月31日予定）', optional: true }
    ],
    shoryokuka: [
      { key: 'deadline', label: '応募の締切日', note: '回ごとに公募要領・事務局サイトで公表されます' },
      { key: 'adoption_date', label: '採択発表日', note: '交付申請の期限はこの日から2か月後です' },
      { key: 'grant_date', label: '交付決定日', note: '事業の実施期間（18か月）の起点です', optional: true }
    ]
  },
  // 制度ごとの見出しと、必ず出す注意
  schemes: {
    career: { label: 'キャリアアップ助成金 正社員化コース', kind: 'josei' },
    jinzai: { label: '人材開発支援助成金 人材育成支援コース', kind: 'josei' },
    kaizen: { label: '業務改善助成金（2026年度）', kind: 'josei' },
    hatarakikata: { label: '働き方改革推進支援助成金 労働時間短縮・年休促進支援コース', kind: 'josei', note: '同じ年度に同じ事業主が交付決定を受けられるのは1回だけです。勤務間インターバル導入コースとの併用はできません。' },
    jizoku: { label: '小規模事業者持続化補助金（第20回）', kind: 'hojo' },
    ai: { label: 'デジタル化・AI導入補助金2026（通常枠）', kind: 'hojo', note: '確定しているのは4次締切分（締切2026年8月25日17:00・交付決定日10月7日予定）までです。5次以降の日程は公表されていません（2026年8月2日13:18時点で未確認）。' },
    shoryokuka: { label: '中小企業省力化投資補助金（一般型）', kind: 'hojo', note: '下の内容は第7回公募要領（受付は終了済み）に基づきます。第8回は公募要領がまだ公開されていないため、上限額・要件・日程が変わる可能性があります（2026年8月2日13:10時点で未確認）。' }
  },
  tasks: [
    { id: 'c01', scheme: 'career', phase: '準備', task: '雇用保険の適用事業所か、労働保険料の未納がないか確認する', owner: '事業主', days: 1, anchor: 'transfer_date', offset: -120, when: '正社員転換日の120日前', dep: [], warn: '支給申請した年度の前年度より前の保険年度の労働保険料を納めていないと受給できません。滞納の通知は来ません', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c02', scheme: 'career', phase: '準備', task: 'キャリアアップ管理者を1人決めて社内に知らせる', owner: '事業主', days: 1, anchor: 'transfer_date', offset: -115, when: '正社員転換日の115日前', dep: ['c01'], warn: '雇用保険適用事業所ごとに置きます。他の事業所との兼任、労働者代表との兼任はできません', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c03', scheme: 'career', phase: '準備', task: '転換したいスタッフの入社日と雇用形態の履歴を洗い出す', owner: '事業主', days: 2, anchor: 'transfer_date', offset: -115, when: '正社員転換日の115日前', dep: ['c01'], warn: '賃金の額または計算方法が正社員と異なる就業規則等の適用を6か月以上受けていることが必要です。新規学卒者で雇入れから1年未満の方は対象外です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c04', scheme: 'career', phase: '準備', task: '就業規則で正社員とパートの賃金の定めが分かれているか点検する', owner: '社労士', days: 3, anchor: 'transfer_date', offset: -110, when: '正社員転換日の110日前', dep: ['c03'], warn: '就業規則等に「個別の雇用契約書で定める」としか書いていないと、規定の差が確認できず対象外になります', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c05', scheme: 'career', phase: '計画届', task: 'キャリアアップ計画書を作り、従業員代表から意見を聴く', owner: '事業主', days: 3, anchor: 'transfer_date', offset: -90, when: '正社員転換日の90日前', dep: ['c02', 'c03'], warn: '計画期間は3年以上5年以内。有期雇用労働者等を含む全ての労働者の代表から意見を聴きます。実施するコースの取組を書いていないと受給できません', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c06', scheme: 'career', phase: '計画届', task: 'キャリアアップ計画書を管轄の労働局へ提出する', owner: '事業主', days: 1, anchor: 'transfer_date', offset: -60, when: '正社員転換日の60日前（最終期限は前日）', dep: ['c05'], hard: true, warn: '正社員転換日の前日までに労働局長に受理されていることが必要です。転換日当日の提出はできません（前日が行政機関の休日ならその翌日まで）', source: 'https://www.mhlw.go.jp/content/11910500/001683945.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'c07', scheme: 'career', phase: '就業規則の整備', task: '就業規則に正社員転換制度（手続・要件・時期）を書き加える', owner: '社労士', days: 7, anchor: 'transfer_date', offset: -45, when: '正社員転換日の45日前', dep: ['c04'], warn: '転換制度が就業規則または労働協約に定められ、その規定に基づいて転換したことが必要です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c08', scheme: 'career', phase: '就業規則の整備', task: '改定した就業規則を労働基準監督署へ届け出る（10人未満は申立書）', owner: '事業主', days: 3, anchor: 'transfer_date', offset: -30, when: '正社員転換日の30日前', dep: ['c07'], warn: '届出義務のある変更で、支給申請日までに監督署へ届け出ていないと原則不支給です。就業規則は周知した日から効力を持つため、発効日と施行日は同じ日にします', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c09', scheme: 'career', phase: '就業規則の整備', task: '転換後の正社員に賞与か退職金と昇給の定めがあるか確認する', owner: '社労士', days: 2, anchor: 'transfer_date', offset: -30, when: '正社員転換日の30日前', dep: ['c07'], warn: '「賞与または退職金の制度」と「昇給」が転換時点で適用されていないと正社員とみなされず対象外です。「業績によっては支給することがある」という書き方も対象外です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c10', scheme: 'career', phase: '取組の実施', task: '対象者と面談し、正社員としての労働条件通知書を交わす', owner: '事業主', days: 2, anchor: 'transfer_date', offset: -7, when: '正社員転換日の7日前', dep: ['c06', 'c08', 'c09'], warn: '転換時に試用期間ありで契約すると、試用期間中は転換完了とみなされず、賃金上昇の判定も申請期限の起算も試用期間終了日の翌日にずれます', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c11', scheme: 'career', phase: '取組の実施', task: '就業規則の転換制度にそって正社員へ転換する', owner: '事業主', days: 1, anchor: 'transfer_date', offset: 0, when: '正社員転換日 当日', dep: ['c10'], warn: '転換日がキャリアアップ計画の期間内であること。事業主または取締役の3親等以内の親族は対象外です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c12', scheme: 'career', phase: '取組の実施', task: '転換後6か月の賃金が転換前6か月より3%以上増える設計にする', owner: '社労士', days: 3, anchor: 'transfer_date', offset: 0, when: '正社員転換日 当日（設計は前倒しで）', dep: ['c11'], hard: true, warn: '転換後6か月の賃金総額が転換前6か月より3%以上増えていないと不支給です。定額の諸手当を算入するには、その決定・計算方法が就業規則または労働協約に書かれている必要があります', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c13', scheme: 'career', phase: '取組の実施', task: '転換後6か月間、出勤簿と賃金台帳を毎月きちんと残す', owner: '事業主', days: 180, anchor: 'transfer_date', offset: 1, when: '正社員転換日の翌日から180日後まで', dep: ['c11'], warn: '勤務した日数が11日以上の月が6か月に達するまでの月分が必要です。申請用に作り直すことはできません', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c14', scheme: 'career', phase: '支給申請', task: '6か月分の賃金を払った後、申請に必要な書類一式をそろえる', owner: '事業主', days: 5, anchor: 'wage6m_paydate', offset: 1, when: '6か月分の賃金支払日の翌日', dep: ['c13'], warn: '支給申請日に対象者が離職しておらず、有期・無期への再転換が予定されていないことが必要です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c15', scheme: 'career', phase: '支給申請', task: '支給申請書の作成と提出を社労士に依頼する', owner: '社労士', days: 7, anchor: 'wage6m_paydate', offset: 10, when: '6か月分の賃金支払日の10日後', dep: ['c14'], warn: '労働社会保険諸法令に基づく申請書類の作成・提出代行は社会保険労務士の独占業務です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c16', scheme: 'career', phase: '支給申請', task: '第1期の支給申請書を管轄の労働局へ提出する', owner: '事業主・社労士', days: 1, anchor: 'wage6m_paydate', offset: 60, when: '6か月分の賃金支払日の翌日から2か月以内', dep: ['c15'], hard: true, warn: '6か月分の賃金を支給した日の翌日から2か月以内です。郵送は到着日で判定されます。1年度1事業所あたりの申請上限は20名です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },
    { id: 'c17', scheme: 'career', phase: '支給決定後', task: '労働局からの問い合わせや追加書類の求めに応じる', owner: '事業主', days: 5, anchor: 'wage6m_paydate', offset: 90, when: '6か月分の賃金支払日の90日後ごろ', dep: ['c16'], warn: '支給決定までにかかる期間は当サイトで確認できていません。管轄の労働局にご確認ください', source: 'unverified', checked: '2026-08-02 13:15 JST' },
    { id: 'c18', scheme: 'career', phase: '支給決定後', task: '重点支援対象者はさらに6か月雇用し、第2期を申請する', owner: '事業主・社労士', days: 5, anchor: 'wage6m_paydate', offset: 180, when: '6か月分の賃金支払日の180日後（第2期の期限は240日後ごろ）', dep: ['c16'], warn: '第2期は転換後12か月以上継続雇用し12か月分の賃金を支給したうえで、次の6か月分の賃金支払日の翌日から2か月以内に申請します。第1期より賃金を合理的な理由なく引き下げていないことが必要です', source: 'https://www.mhlw.go.jp/content/11910500/001683860.pdf', checked: '2026-08-02 13:10 JST' },

    { id: 'j01', scheme: 'jinzai', phase: '準備', task: '職業能力開発推進者を選任する', owner: '事業主', days: 1, anchor: 'training_start', offset: -180, when: '訓練開始日の180日前', dep: [], warn: '選任が支給の前提です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j02', scheme: 'jinzai', phase: '準備', task: '事業内職業能力開発計画を作り、スタッフ全員に知らせる', owner: '事業主・社労士', days: 5, anchor: 'training_start', offset: -170, when: '訓練開始日の170日前', dep: ['j01'], warn: '作るだけでなく、働く人への周知まで必要です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j03', scheme: 'jinzai', phase: '準備', task: '受講させるスタッフが雇用保険に入っているか確認する', owner: '事業主', days: 1, anchor: 'training_start', offset: -170, when: '訓練開始日の170日前', dep: [], warn: '事業主は雇用保険適用事業所、働く人は雇用保険被保険者であることが必要です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j04', scheme: 'jinzai', phase: '準備', task: '受けさせる研修を選び、10時間以上のOFF-JTか確かめる', owner: '事業主', days: 5, anchor: 'training_start', offset: -160, when: '訓練開始日の160日前', dep: ['j02'], warn: '人材育成訓練は10時間以上のOFF-JTです。e-ラーニング・通信制は経費助成のみで賃金助成の対象外です。訓練の細かい要件（1回あたりの最低時間、対象外の訓練など）は当サイトで未確認のため、必ず支給要領でご確認ください', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j05', scheme: 'jinzai', phase: '準備', task: '研修会社からカリキュラムと見積書を取り寄せる', owner: '事業主', days: 7, anchor: 'training_start', offset: -150, when: '訓練開始日の150日前', dep: ['j04'], warn: '計画届の添付書類として、訓練内容が分かるカリキュラムが必要です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j06', scheme: 'jinzai', phase: '計画届', task: '職業訓練実施計画届と対象労働者一覧を書き上げる', owner: '事業主・社労士', days: 5, anchor: 'training_start', offset: -140, when: '訓練開始日の140日前', dep: ['j05'], warn: '様式第1-1号（職業訓練実施計画届）、様式第3-1号（対象労働者一覧）などを使います', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j07', scheme: 'jinzai', phase: '計画届', task: '有期実習型を選ぶ場合、対象者がキャリアコンサルティングを受ける', owner: '対象のスタッフ', days: 2, anchor: 'training_start', offset: -110, when: '訓練開始日の110日前', dep: ['j06'], warn: '受講者がジョブ・カードを作り、キャリアコンサルタント等の面接で訓練の必要性の確認を受けることが必要です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j08', scheme: 'jinzai', phase: '計画届', task: '認定実習併用を選ぶ場合、厚生労働大臣の認定を受ける', owner: '事業主', days: 30, anchor: 'training_start', offset: -60, when: '訓練開始日の60日前（提出期限は30日前）', dep: ['j06'], hard: true, warn: '訓練開始日の30日前までに実践型人材養成システム実施計画を出して認定を受ける必要があります', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j09', scheme: 'jinzai', phase: '計画届', task: '計画届一式の作成・提出を社労士に依頼する', owner: '社労士', days: 5, anchor: 'training_start', offset: -130, when: '訓練開始日の130日前', dep: ['j06'], warn: '労働社会保険諸法令に基づく申請書類の作成・提出代行は社会保険労務士の独占業務です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j10', scheme: 'jinzai', phase: '計画届', task: '職業訓練実施計画届を管轄の労働局へ提出する', owner: '事業主・社労士', days: 1, anchor: 'training_start', offset: -90, when: '訓練開始日の90日前（出せるのは180日前〜30日前の間だけ）', dep: ['j09'], hard: true, warn: '訓練開始日の6か月前から1か月前までの間に出します。1か月前を過ぎると受理されず、6か月前より早くても受理されません', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j11', scheme: 'jinzai', phase: '訓練前の準備', task: '電子申請するならGビズIDを取得する', owner: '事業主', days: 14, anchor: 'training_start', offset: -60, when: '訓練開始日の60日前', dep: [], warn: '発行までに日数がかかります。申請直前に始めると間に合いません', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j12', scheme: 'jinzai', phase: '取組の実施', task: '出した計画届のとおりに訓練を行う', owner: '対象のスタッフ', days: 1, anchor: 'training_start', offset: 0, when: '訓練開始日から訓練終了日まで', dep: ['j10'], warn: '受講回数は1人につき1年度3回まで（有期実習型は同じ事業主から同じ人へ1回まで）です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j13', scheme: 'jinzai', phase: '取組の実施', task: '訓練中の出勤簿・タイムカード・受講記録を毎日残す', owner: '事業主', days: 1, anchor: 'training_start', offset: 0, when: '訓練開始日から訓練終了日まで', dep: ['j12'], warn: '賃金助成の限度は1人1訓練あたり1,200時間（専門実践教育訓練は1,600時間）です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j14', scheme: 'jinzai', phase: '取組の実施', task: '訓練費用の全額を支給申請の日までに振り込む', owner: '事業主', days: 3, anchor: 'training_end', offset: 10, when: '訓練終了日の10日後', dep: ['j12'], hard: true, warn: '支給申請までに経費の全額を支払っていることが必要です。事業主が負担したと分かる振込通知書等が要ります', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j15', scheme: 'jinzai', phase: '取組の実施', task: '上乗せを狙うなら訓練修了後に賃上げか資格手当を実施する', owner: '事業主・社労士', days: 14, anchor: 'training_end', offset: 10, when: '訓練終了日の10日後', dep: ['j12'], warn: '賃金要件は改定の前後で5%以上、資格等手当要件は就業規則等に手当を定めたうえで支払前後で3%以上の上昇が必要です。就業規則への規定が先です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j16', scheme: 'jinzai', phase: '取組の実施', task: '有期実習型の場合、支給申請日までに正社員へ転換する', owner: '事業主', days: 5, anchor: 'training_end', offset: 20, when: '訓練終了日の20日後', dep: ['j12'], warn: '転換できなかった場合でも、推進者の選任・開発計画の策定周知・定期的なキャリアコンサルティングの機会確保を定めていれば人材育成訓練の助成内容で対象となる場合があります', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j17', scheme: 'jinzai', phase: '支給申請', task: 'OFF-JT実施状況報告書と助成額の内訳を作る', owner: '事業主・社労士', days: 7, anchor: 'training_end', offset: 25, when: '訓練終了日の25日後', dep: ['j13', 'j14'], warn: '様式第8-1号（OFF-JT実施状況報告書）と、助成額を算定した書類が必要です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j18', scheme: 'jinzai', phase: '支給申請', task: '支給申請書の作成と提出を社労士に依頼する', owner: '社労士', days: 7, anchor: 'training_end', offset: 35, when: '訓練終了日の35日後', dep: ['j17'], warn: '労働社会保険諸法令に基づく申請書類の作成・提出代行は社会保険労務士の独占業務です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j19', scheme: 'jinzai', phase: '支給申請', task: '支給申請書一式を管轄の労働局へ提出する', owner: '事業主・社労士', days: 1, anchor: 'training_end', offset: 60, when: '訓練終了日の翌日から2か月以内', dep: ['j18'], hard: true, warn: '訓練終了日の翌日から2か月以内に出します。1事業所1年度あたりの助成限度額は1,000万円です', source: 'https://www.mhlw.go.jp/content/11800000/001687559.pdf', checked: '2026-08-02 13:05 JST' },
    { id: 'j20', scheme: 'jinzai', phase: '支給決定後', task: '労働局の照会に答え、訓練記録と領収書を保管する', owner: '事業主', days: 5, anchor: 'training_end', offset: 90, when: '訓練終了日の90日後ごろ', dep: ['j19'], warn: '支給決定までにかかる期間と書類の保存年限は当サイトで確認できていません。支給要領でご確認ください', source: 'unverified', checked: '2026-08-02 13:15 JST' },

    { id: 'k01', scheme: 'kaizen', phase: '準備', task: 'お店で一番時給が低いスタッフが誰かを確かめる', owner: '事業主', days: 1, anchor: 'application_date', offset: -60, when: '交付申請書の提出日の60日前', dep: [], warn: '引き上げる対象は雇入れ後6か月を過ぎた方で、週の所定労働時間が20時間以上の雇用保険被保険者です', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k02', scheme: 'kaizen', phase: '準備', task: 'お店の最低時給が地域別最低賃金を下回っているか確認する', owner: '事業主', days: 1, anchor: 'application_date', offset: -60, when: '交付申請書の提出日の60日前', dep: ['k01'], warn: '事業場内最低賃金が令和8年度の地域別最低賃金未満であることが要件です。すでに上回っていると対象外です', source: 'https://www.mhlw.go.jp/content/11200000/001693416.pdf', checked: '2026-08-02 13:00 JST' },
    { id: 'k03', scheme: 'kaizen', phase: '準備', task: '直近1年に解雇や賃金引下げがなかったか確かめる', owner: '事業主・社労士', days: 2, anchor: 'application_date', offset: -55, when: '交付申請書の提出日の55日前', dep: [], warn: '申請日の1年前から、解雇・退職勧奨・時間当たり賃金の引下げ・所定労働時間短縮による月額賃金の引下げがあると不交付です', source: 'https://www.mhlw.go.jp/content/11200000/001693388.pdf', checked: '2026-08-02 13:12 JST' },
    { id: 'k04', scheme: 'kaizen', phase: '準備', task: '50円・70円・90円のどのコースで申請するか決める', owner: '事業主', days: 3, anchor: 'application_date', offset: -50, when: '交付申請書の提出日の50日前', dep: ['k01', 'k02'], warn: '上限額は引上げ額と人数で決まります（50円コース1人30万円〜90円コース10人以上600万円）。助成率は引上げ前の事業場内最低賃金が1,050円未満なら4/5、1,050円以上なら3/4。同一事業所の申請は年度内1回までです', source: 'https://www.mhlw.go.jp/content/11200000/001693416.pdf', checked: '2026-08-02 13:00 JST' },
    { id: 'k05', scheme: 'kaizen', phase: '準備', task: '入れる設備やシステムを決め、業者を2社以上あたる', owner: '事業主', days: 10, anchor: 'application_date', offset: -45, when: '交付申請書の提出日の45日前', dep: ['k04'], warn: 'パソコン・スマホ・タブレットの新規導入は物価高騰等要件に当たる事業者のみ対象です。自動車（特殊用途を除く）は令和8年度から対象外です', source: 'https://www.mhlw.go.jp/content/11200000/001693416.pdf', checked: '2026-08-02 13:00 JST' },
    { id: 'k06', scheme: 'kaizen', phase: '準備', task: '業者から見積書を2通以上そろえる', owner: '事業主', days: 10, anchor: 'application_date', offset: -30, when: '交付申請書の提出日の30日前', dep: ['k05'], warn: '契約予定額10万円未満を除き、2者以上の見積書が必要です。1つの業者が他社の見積書を用意することは認められません（労働局から見積先へ直接確認が入ることがあります）', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k07', scheme: 'kaizen', phase: '交付申請', task: '事業実施計画書に賃上げ計画と生産性向上の効果を書く', owner: '事業主', days: 5, anchor: 'application_date', offset: -20, when: '交付申請書の提出日の20日前', dep: ['k06'], warn: '様式第1号の記1〜5をすべて記入し、別紙1（国庫補助金所要額調書）と別紙2（事業実施計画書）を添えます。申請コースは別紙2の引上計画と、申請金額は別紙1と一致させます', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k08', scheme: 'kaizen', phase: '交付申請', task: '交付申請書一式の作成・提出を社労士に依頼する', owner: '社労士', days: 7, anchor: 'application_date', offset: -14, when: '交付申請書の提出日の14日前', dep: ['k07'], warn: '申請書類の作成・提出代行は社会保険労務士の独占業務です。指定様式以外での申請は受け付けられません', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k09', scheme: 'kaizen', phase: '交付申請', task: '交付申請書を労働局の雇用環境・均等部（室）へ出す', owner: '事業主・社労士', days: 1, anchor: 'application_date', offset: 0, when: '交付申請書の提出日 当日', dep: ['k08'], hard: true, warn: '申請期間は令和8年9月1日から、都道府県の地域別最低賃金の発効日の前日または11月30日の早い日までです。予算の範囲内で交付するため、期間内でも募集が終わることがあります', source: 'https://www.mhlw.go.jp/content/11200000/001693416.pdf', checked: '2026-08-02 13:00 JST' },
    { id: 'k10', scheme: 'kaizen', phase: '交付申請', task: '労働局の審査に対応し、交付決定の通知を受け取る', owner: '労働局', days: 30, anchor: 'application_date', offset: 30, when: '交付申請書の提出日の30日後ごろ', dep: ['k09'], warn: '交付申請から交付決定までの期間は、交付要綱・交付要領・申請マニュアルのいずれにも書かれていません（当サイトで未確認）。管轄の労働局にご確認ください', source: 'unverified', checked: '2026-08-02 13:12 JST' },
    { id: 'k11', scheme: 'kaizen', phase: '取組の実施', task: '就業規則等に引上げ後の最低時給額を書き込む', owner: '社労士', days: 7, anchor: 'minwage_effective_date', offset: -20, when: '最低賃金の発効日の20日前', dep: ['k09'], warn: '引上げ後の事業場内最低賃金額と同じ額を、働く人の下限の賃金額として就業規則等に定めます', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k12', scheme: 'kaizen', phase: '取組の実施', task: 'お店の最低時給を1回で引き上げる', owner: '事業主', days: 1, anchor: 'minwage_effective_date', offset: -1, when: '最低賃金の発効日の前日まで（引き上げられるのは申請書を出した後から）', dep: ['k11'], hard: true, warn: '賃上げは交付申請書の提出後から、地域別最低賃金の発効日の前日までに行います。申請前の賃上げも発効日以降の賃上げも認められません。複数回に分けることもできません', source: 'https://www.mhlw.go.jp/content/11200000/001719498.pdf', checked: '2026-08-02 13:13 JST' },
    { id: 'k13', scheme: 'kaizen', phase: '取組の実施', task: '交付決定を受けてから設備を発注し、納品を受ける', owner: '事業主', days: 30, anchor: 'grant_decision_date', offset: 1, when: '交付決定日の翌日から', dep: ['k10'], hard: true, warn: '交付決定の前に発注・購入すると助成対象になりません。見積・検討は前もって済ませ、発注は必ず交付決定の後にしてください', source: 'https://www.mhlw.go.jp/content/11200000/001693416.pdf', checked: '2026-08-02 13:00 JST' },
    { id: 'k14', scheme: 'kaizen', phase: '取組の実施', task: '設備代金を銀行振込で支払い、振込記録を残す', owner: '事業主', days: 3, anchor: 'grant_decision_date', offset: 45, when: '交付決定日の45日後ごろ（期限は交付決定年度の1月31日）', dep: ['k13'], warn: '支出は振込のみで、ポイント払い・ギフトカード払いは対象外です。クレジットカード等で交付決定年度の3月31日までに口座から引き落とされていない場合も対象外です', source: 'https://www.mhlw.go.jp/content/11200000/001693391.pdf', checked: '2026-08-02 13:11 JST' },
    { id: 'k15', scheme: 'kaizen', phase: '支給申請', task: '賃金台帳・就業規則・納品書・写真・振込記録をそろえる', owner: '事業主', days: 7, anchor: 'grant_decision_date', offset: 50, when: '事業完了の直後（事業完了の期限は交付決定年度の1月31日）', dep: ['k12', 'k14'], warn: '引き上げた賃金は原則として事業実績報告書の提出日までに支払います。賃上げ日から報告書提出日の前日までの賃金台帳の写しが必要です', source: 'https://www.mhlw.go.jp/content/11200000/001693391.pdf', checked: '2026-08-02 13:11 JST' },
    { id: 'k16', scheme: 'kaizen', phase: '支給申請', task: '事業実績報告書と支給申請書を労働局へ出す', owner: '事業主・社労士', days: 1, anchor: 'grant_decision_date', offset: 75, when: '事業完了日から1か月を経過する日、または翌年度4月10日の早い日まで', dep: ['k15'], hard: true, warn: '期限までに不備のない実績報告等が出されないと、交付決定の取消事由に当たります（様式第9号・様式第10号）', source: 'https://www.mhlw.go.jp/content/11200000/001693388.pdf', checked: '2026-08-02 13:12 JST' },
    { id: 'k17', scheme: 'kaizen', phase: '支給決定後', task: '交付額の確定通知を受け、入金を確認する', owner: '労働局', days: 20, anchor: 'grant_decision_date', offset: 95, when: '実績報告等が労働局に届いた日から原則20日以内', dep: ['k16'], warn: '交付額確定通知は、報告書等および支給申請書が到達した日から原則20日以内に行われます（交付要綱第14条第2項）', source: 'https://www.mhlw.go.jp/content/11200000/001693388.pdf', checked: '2026-08-02 13:12 JST' },
    { id: 'k18', scheme: 'kaizen', phase: '支給決定後', task: '賃上げから6か月後に状況報告書を出す', owner: '事業主', days: 3, anchor: 'minwage_effective_date', offset: 179, when: '賃金引上げ日の6か月後から1か月以内', dep: ['k17'], hard: true, warn: '様式第8号の状況報告書を出す義務があります（交付要綱第12条）。この期間に解雇や賃金引下げがあると不交付事由に当たります', source: 'https://www.mhlw.go.jp/content/11200000/001693388.pdf', checked: '2026-08-02 13:12 JST' },
    { id: 'k19', scheme: 'kaizen', phase: '支給決定後', task: '引き上げた最低時給を保ち、帳簿と証憑を5年間保存する', owner: '事業主', days: 5, anchor: 'grant_decision_date', offset: 120, when: '交付額の確定後（保存は年度終了後5年間）', dep: ['k17'], warn: '過去に交付を受けた事業場で、その後の賃金額が定めた事業場内最低賃金を下回ると不交付事由になります。単価30万円以上の財産は処分完了日まで保管します', source: 'https://www.mhlw.go.jp/content/11200000/001693388.pdf', checked: '2026-08-02 13:12 JST' },

    { id: "jz01", scheme: "jizoku", phase: "事前準備", task: "GビズIDプライムのアカウントを申請して取得する", owner: "事業主", days: 30, anchor: "deadline", offset: -90, when: "締切の90日前までに着手する", dep: [], hard: true, warn: "公募要領「申請にはGビズIDプライムのアカウント取得が必要です」。書類申請は審査に最大1か月かかるため、締切直前に始めると申請そのものができません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:20 JST" },
    { id: "jz02", scheme: "jizoku", phase: "事前準備", task: "小規模事業者の定義に自社が当てはまるか確認する", owner: "事業主", days: 1, anchor: "deadline", offset: -80, when: "締切の80日前", dep: [], hard: true, warn: "当てはまらないことが採択後に分かった場合、採択・交付決定は取り消されます", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz03", scheme: "jizoku", phase: "事前準備", task: "過去の持続化補助金の様式第14を出しているか確認する", owner: "事業主", days: 1, anchor: "deadline", offset: -80, when: "締切の80日前", dep: [], hard: true, warn: "過去に採択されて「事業効果および賃金引上げ等状況報告書」（様式第14）が未提出の事業者は補助対象外です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz04", scheme: "jizoku", phase: "事前準備", task: "地域の商工会議所・商工会に相談の予約を入れる", owner: "事業主・商工会議所", days: 1, anchor: "form4_deadline", offset: -45, when: "様式4の発行受付締切の45日前", dep: ["jz02"], warn: "様式4は窓口の面談・確認を経て発行されます。締切間際の依頼は受け付けられないことがあります", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz05", scheme: "jizoku", phase: "申請書の作成", task: "経営計画・補助事業計画（様式2）を自分で書く", owner: "事業主", days: 21, anchor: "deadline", offset: -55, when: "締切の55日前から着手", dep: ["jz04"], hard: true, warn: "「事業者自らが検討しているような記載が見られない場合や、自らが検討していなかったことが発覚した場合、評価に関わらず不採択・交付決定取消」。第三者の支援を受けた場合は支援者名と金額（着手金・成功報酬を含む）の記載が必須です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz06", scheme: "jizoku", phase: "申請書の作成", task: "売上・粗利の増加見込みを数字で書き込む", owner: "事業主", days: 5, anchor: "deadline", offset: -45, when: "締切の45日前", dep: ["jz05"], warn: "様式第14の提出時点で、売上高・売上総利益が補助事業終了時と比べて増える見込みであることが要件です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz07", scheme: "jizoku", phase: "申請書の作成", task: "設備・工事・広告の見積書を業者から取る", owner: "事業主", days: 14, anchor: "deadline", offset: -45, when: "締切の45日前", dep: ["jz05"], hard: true, warn: "1件あたり発注総額50万円（税込）超の機械装置等は2者以上の相見積が必要です（中古品は金額を問わず2者以上）。理由書による随意契約は認められません。見積を取るだけなら発注ではありませんが、この段階で契約・発注してはいけません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz08", scheme: "jizoku", phase: "申請書の作成", task: "インボイス特例・賃金引上げ特例を使うか決める", owner: "事業主", days: 3, anchor: "deadline", offset: -40, when: "締切の40日前", dep: ["jz05"], hard: true, warn: "インボイス特例は「通常枠およびインボイス特例の要件を1つでも満たさない場合、上乗せ部分だけでなく補助金全体が交付対象外」です。該当の判断は税務・労務にまたがるため、税理士・社労士にご確認ください", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz09", scheme: "jizoku", phase: "申請書の作成", task: "商工会議所・商工会に様式4の発行を依頼する", owner: "事業主・商工会議所", days: 10, anchor: "form4_deadline", offset: -14, when: "様式4の発行受付締切の14日前までに依頼", dep: ["jz05", "jz06"], hard: true, warn: "いちばんの関門です。事業支援計画書（様式4）の発行受付締切は申請締切とは別で、必ず申請締切より前にあります（第20回は申請12月15日に対し様式4は12月4日）。「受付締切以降の発行依頼は、いかなる理由があってもできません」。様式4が無ければ申請そのものが成立しません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz10", scheme: "jizoku", phase: "申請", task: "様式4を受け取る", owner: "商工会議所・商工会", days: 1, anchor: "form4_deadline", offset: 0, when: "様式4の発行受付締切の当日まで", dep: ["jz09"], hard: true, warn: "この日を1日でも過ぎると発行されません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz11", scheme: "jizoku", phase: "申請", task: "電子申請システムに入力して申請を送る", owner: "事業主", days: 3, anchor: "deadline", offset: -3, when: "締切の3日前", dep: ["jz01", "jz10", "jz07", "jz08"], hard: true, warn: "締切当日17:00厳守です。GビズIDのID・パスワードを第三者（支援者を含む）に渡すことはGビズID利用規約違反です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz12", scheme: "jizoku", phase: "交付決定", task: "採択発表を確認する（採択は入金ではありません）", owner: "事務局", days: 1, anchor: "deadline", offset: 90, when: "締切の約90日後（第20回は2027年3月頃の見込み・目安）", dep: ["jz11"], hard: true, warn: "審査があり、不採択になることがあります。採択は「補助金交付候補者」になっただけで、交付決定・入金とは別のできごとです。この時点で発注してはいけません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz13", scheme: "jizoku", phase: "交付決定", task: "採択後に詳しい見積書などを事務局へ出す", owner: "事業主", days: 7, anchor: "deadline", offset: 97, when: "採択発表の直後（速やかに）", dep: ["jz12"], hard: true, warn: "見積書等の最終提出期限までに出さないと採択が取り消されます。遅れるほど交付決定が遅れ、事業を行える期間が短くなります", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz14", scheme: "jizoku", phase: "交付決定", task: "賃金引上げ特例の目標値を従業員に表明する", owner: "事業主", days: 3, anchor: "grant_date", offset: -7, when: "採択後・交付決定までの間", dep: ["jz12"], hard: true, warn: "賃金引上げ特例を使う場合、1人あたり給与支給総額3.0%以上の目標値を「採択後交付決定までに」全従業員または従業員代表者・役員へ表明する必要があります。実績報告時点で未達なら補助金は交付されません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "jz15", scheme: "jizoku", phase: "交付決定", task: "自己資金・つなぎ資金を手当てする", owner: "事業主", days: 30, anchor: "grant_date", offset: -30, when: "交付決定の30日前から", dep: ["jz12"], hard: true, warn: "「補助事業遂行の際には自己負担が必要となり、補助金は後払いです」。経費はいったん全額自分で払い、後から補助分だけ戻ります", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz16", scheme: "jizoku", phase: "交付決定", task: "交付決定通知書を受け取り、交付決定日を確認する", owner: "事務局", days: 1, anchor: "grant_date", offset: 0, when: "採択発表から概ね1〜2か月後", dep: ["jz13"], hard: true, warn: "採択と交付決定は別のできごとです。通知書に書かれた交付決定日から補助事業を始められます。交付決定額が減額されることもあります", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz17", scheme: "jizoku", phase: "事業の実施", task: "交付決定日より後に業者へ発注・契約する", owner: "事業主", days: 7, anchor: "grant_date", offset: 1, when: "交付決定の翌日以降", dep: ["jz16"], hard: true, warn: "いちばん多い事故です。「交付決定前に発注・契約、購入、支払い（前払いを含む）等を実施したもの」は補助対象外です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz18", scheme: "jizoku", phase: "事業の実施", task: "納品を受け、期間内に支払いまで終える", owner: "事業主", days: 120, anchor: "jisshi_limit", offset: -30, when: "事業実施期限（第20回は2028年3月31日）までに完了", dep: ["jz17"], hard: true, warn: "分割払い・クレジット払いは、金融機関からの引き落としが期間内に終わっている必要があります。期間内に支出が終わっていないものは対象外です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz19", scheme: "jizoku", phase: "事業の実施", task: "見積書・契約書・請求書・振込控え・写真を保管する", owner: "事業主", days: 120, anchor: "jisshi_limit", offset: -30, when: "事業の実施期間ずっと", dep: ["jz17"], hard: true, warn: "補助対象物件や帳簿類が確認できない場合、その金額は補助対象外になります。成果物の写真や業務完了報告書も必要です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz20", scheme: "jizoku", phase: "実績報告", task: "実績報告書（様式第8）と経理書類を出す", owner: "事業主", days: 14, anchor: "jisshi_limit", offset: 10, when: "補助事業完了日から30日を経過した日と最終期限（第20回は2028年4月10日）の早い方", dep: ["jz18", "jz19"], hard: true, warn: "出さなければ補助金は支払われません。インボイス特例の方は登録通知書の写し、賃金引上げ特例の方は賃金台帳等をここで出します", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz21", scheme: "jizoku", phase: "実績報告", task: "補助金額の確定通知を受け、請求して入金される", owner: "事務局・事業主", days: 60, anchor: "jisshi_limit", offset: 70, when: "実績報告の約60日後（目安）", dep: ["jz20"], hard: true, warn: "精算払い（後払い）です。確定検査で補助対象外と判断された経費は減額されます。入金額が申請額と一致するとは限りません", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz22", scheme: "jizoku", phase: "採択後の義務", task: "50万円以上で買った設備・サイト・内装を勝手に処分しない", owner: "事業主", days: 1825, anchor: "jisshi_limit", offset: 71, when: "補助金を受け取った後もずっと（ウェブサイト等は通常5年間）", dep: ["jz21"], hard: true, warn: "単価50万円（税抜）以上の機械装置等、50万円以上のウェブサイト・システム、50万円以上の外注工事は処分制限財産です。売却・譲渡・担保提供・廃棄には事務局の事前承認が必要で、無断処分は交付取消・返還命令（加算金つき）になります", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:15 JST" },
    { id: "jz23", scheme: "jizoku", phase: "採択後の義務", task: "収益が出た場合の収益納付に備えて経理を分けておく", owner: "事業主", days: 365, anchor: "jisshi_limit", offset: 71, when: "補助事業の終了後", dep: ["jz21"], warn: "収益納付による減額や、処分制限財産の処分による納付が必要になる場合があります。会計検査院等の実地検査もあります。補助金は原則として受け取った事業年度の収入になり課税対象です（税理士にご確認ください）", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:22 JST" },
    { id: "jz24", scheme: "jizoku", phase: "採択後の義務", task: "事業効果および賃金引上げ等状況報告書（様式第14）を出す", owner: "事業主", days: 14, anchor: "jisshi_limit", offset: 365, when: "補助事業の終了から1年後（事務局が指定する期限まで）", dep: ["jz21"], hard: true, warn: "交付規程第29条の義務です。出さないと次回以降の持続化補助金に申請できません。賃金引上げ特例・賃上げ加点を受けたのに未達だった場合は返還等の対象です", source: "https://r6.jizokukahojokin.info/doc/r6_koubover8_ip20.pdf", checked: "2026-08-02 13:22 JST" },
    { id: "ai01", scheme: "ai", phase: "事前準備", task: "GビズIDプライムのアカウントを申請して取得する", owner: "事業主", days: 30, anchor: "deadline", offset: -60, when: "交付申請締切の60日前までに着手", dep: [], hard: true, warn: "申請要件です。書類申請は審査に最大1か月かかります。締切直前では申請できません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:20 JST" },
    { id: "ai02", scheme: "ai", phase: "事前準備", task: "IT導入支援事業者（登録済みの業者）を選んで相談する", owner: "事業主・IT導入支援事業者", days: 14, anchor: "deadline", offset: -55, when: "締切の55日前", dep: [], hard: true, warn: "この補助金は事業者とIT導入支援事業者が共同事業体として申請する仕組みです。登録されていない業者のツールは対象になりません。この段階では選ぶだけで、契約してはいけません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai03", scheme: "ai", phase: "事前準備", task: "IPAのSECURITY ACTIONで一つ星か二つ星を宣言する", owner: "事業主", days: 7, anchor: "deadline", offset: -45, when: "締切の45日前", dep: [], hard: true, warn: "申請要件です。「★一つ星」または「★★二つ星」の宣言がないと申請できません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai04", scheme: "ai", phase: "申請書の作成", task: "入れるITツールを選び、見積を出してもらう", owner: "事業主・IT導入支援事業者", days: 14, anchor: "deadline", offset: -40, when: "締切の40日前", dep: ["ai02"], hard: true, warn: "補助額150万円以上を狙う場合は4プロセス以上の機能が必要です。リース・レンタル契約のITツール、中古品、交付決定前に購入したITツールは対象外です", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai05", scheme: "ai", phase: "申請書の作成", task: "申請マイページの招待を受けて開設する", owner: "IT導入支援事業者・事業主", days: 3, anchor: "deadline", offset: -30, when: "締切の30日前", dep: ["ai01", "ai02"], warn: "マイページのID・パスワードは、IT導入支援事業者を含む第三者に渡してはいけません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai06", scheme: "ai", phase: "申請書の作成", task: "申請者本人が管理する携帯電話番号を登録する", owner: "事業主", days: 1, anchor: "deadline", offset: -30, when: "締切の30日前", dep: ["ai05"], warn: "1申請者につき、申請者自身が管理する1つの番号です。他の人の番号やIT導入支援事業者の番号は使えません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai07", scheme: "ai", phase: "申請書の作成", task: "登記事項証明書・納税証明書・決算書などをそろえる", owner: "事業主", days: 14, anchor: "deadline", offset: -30, when: "締切の30日前", dep: [], hard: true, warn: "代替書類は一切認められません。法人は履歴事項全部証明書（発行から3か月以内）・法人税の納税証明書・貸借対照表と損益計算書、個人事業主は本人確認書類・所得税の納税証明書・税務署が受領した確定申告書控えなどです。納税証明書の取得には日数がかかります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai08", scheme: "ai", phase: "申請書の作成", task: "労働生産性を伸ばす3年間の数値計画を作る", owner: "事業主・IT導入支援事業者", days: 10, anchor: "deadline", offset: -25, when: "締切の25日前", dep: ["ai04"], hard: true, warn: "1年後に労働生産性3%以上向上、事業計画期間の年平均成長率3%以上（過去にIT導入補助金2023〜2025の交付決定を受けた事業者は4%以上）が要件です", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai09", scheme: "ai", phase: "申請書の作成", task: "賃金引上げ計画を作り、従業員に表明する", owner: "事業主", days: 7, anchor: "deadline", offset: -15, when: "締切の15日前", dep: ["ai08"], hard: true, warn: "補助金申請額150万円以上は賃上げ目標が必須です（150万円未満でも過去にIT導入補助金2022〜2025の交付決定を受けた事業者は必須）。交付申請の時点で従業員に表明済みである必要があり、未達なら返還の対象です", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai10", scheme: "ai", phase: "申請", task: "申請マイページから交付申請を出す", owner: "事業主", days: 3, anchor: "deadline", offset: -3, when: "締切の3日前", dep: ["ai01", "ai03", "ai05", "ai06", "ai07", "ai08"], hard: true, warn: "IT導入支援事業者が事業計画・ITツール情報を入力した後、事業主が内容を確認し宣誓して提出します。1法人・1個人事業主あたり1申請1回のみで、一度出すと結果公表まで取り下げられません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai11", scheme: "ai", phase: "交付決定", task: "自己資金・つなぎ資金を手当てする", owner: "事業主", days: 30, anchor: "grant_date", offset: -30, when: "交付決定の30日前から", dep: ["ai10"], hard: true, warn: "ITツール代金は事業主がいったん全額支払い、実績報告の後に補助分が入金される後払いです", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai12", scheme: "ai", phase: "交付決定", task: "申請マイページで交付決定の通知を確認する", owner: "事務局", days: 1, anchor: "grant_date", offset: 0, when: "交付決定日（事務局が回ごとに予定日を公表）", dep: ["ai10"], hard: true, warn: "審査があり不採択があります。採択・不採択の理由は開示されません。交付決定を受けて初めて事業を始められます", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai13", scheme: "ai", phase: "事業の実施", task: "交付決定日より後にITツールを契約・発注する", owner: "事業主・IT導入支援事業者", days: 7, anchor: "grant_date", offset: 1, when: "交付決定の翌日以降", dep: ["ai12"], hard: true, warn: "いちばん多い事故です。「交付決定前に契約、発注、納品、支払い等を行った場合は補助金を受けることができない」。契約・発注は納品や支払より先である必要があり、順序が逆だと交付決定の取消しになることがあります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai14", scheme: "ai", phase: "事業の実施", task: "ITツールの納品を受け、使い始める", owner: "IT導入支援事業者・事業主", days: 60, anchor: "grant_date", offset: 30, when: "交付決定の約30日後から", dep: ["ai13"], hard: true, warn: "実績報告までに、すべてのITツールの導入が終わり、利用・運用が始まっている必要があります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai15", scheme: "ai", phase: "事業の実施", task: "請求書を受け取ってから、事業主名義の口座で支払う", owner: "事業主", days: 7, anchor: "grant_date", offset: 90, when: "交付決定の約90日後", dep: ["ai14"], hard: true, warn: "支払は原則、銀行振込かクレジットカード1回払いのみです（現金・分割・リボは不可）。支払元は必ず補助事業者名義の口座（個人事業主は代表者本人名義のカード）で、名義が違うと補助金を受けられません", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai16", scheme: "ai", phase: "実績報告", task: "請求書・振込控え・利用画面の写しをそろえて実績報告する", owner: "事業主・IT導入支援事業者", days: 14, anchor: "report_limit", offset: 0, when: "補助事業の実施・実績報告期間は交付決定日から6か月間程度（回ごとの期限は事務局サイトで公表）", dep: ["ai15"], hard: true, warn: "補助事業者側の証憑のみ有効で、IT導入支援事業者の口座明細や領収証は認められません。ITツールを使っていることが分かる画面の写しも必要です", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai17", scheme: "ai", phase: "実績報告", task: "補助金額の確定を受け、補助金が入金される", owner: "事務局", days: 60, anchor: "report_limit", offset: 60, when: "実績報告の約60日後（目安）", dep: ["ai16"], warn: "後払いで、確定検査の結果によって減額されることがあります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai18", scheme: "ai", phase: "採択後の義務", task: "入れたITツールを解約せずに使い続ける", owner: "事業主", days: 1460, anchor: "report_limit", offset: 61, when: "効果報告が終わるまで（最長で3年度目）", dep: ["ai17"], hard: true, warn: "解約・利用停止は辞退扱いになり、複数入れたうちの一部の解約でも辞退の手続きが必要です。辞退すると補助金の全部または一部の返還（加算金つき）になります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai19", scheme: "ai", phase: "採択後の義務", task: "事業実施効果を毎年報告する（計4回）", owner: "事業主・IT導入支援事業者", days: 14, anchor: "report_limit", offset: 180, when: "事業計画期間前と、1年度目・2年度目・3年度目", dep: ["ai17"], hard: true, warn: "営業利益・人件費・減価償却費・総労働時間・1人当たり給与支給総額・事業場内最低賃金と、ITツールを使い続けている証拠を報告します。賃上げ目標が必須の申請で報告がない場合や未達の場合は返還の対象です", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "ai20", scheme: "ai", phase: "採択後の義務", task: "契約書・請求書・振込控えを5年間保管する", owner: "事業主", days: 1825, anchor: "report_limit", offset: 61, when: "補助事業完了日の属する年度の終了後5年間", dep: ["ai17"], warn: "交付決定通知・契約書・注文書・納品書・請求書・振込受領書等を保管し、検査に協力する義務があります", source: "https://it-shien.smrj.go.jp/pdf/it2026_koubo_tsujyo.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh01", scheme: "shoryokuka", phase: "事前準備", task: "GビズIDプライムのアカウントを申請して取得する", owner: "事業主", days: 30, anchor: "deadline", offset: -75, when: "応募締切の75日前までに着手", dep: [], hard: true, warn: "公募要領「GビズIDプライムアカウントの発行には、一定期間を要しますので、お早めにご準備ください」。書類申請は審査に最大1か月かかります", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:20 JST" },
    { id: "sh02", scheme: "shoryokuka", phase: "事前準備", task: "どの作業を機械に置き換えるか（省力化の中身）を洗い出す", owner: "事業主", days: 14, anchor: "deadline", offset: -70, when: "締切の70日前", dep: [], hard: true, warn: "審査は省力化指数・投資回収期間・付加価値額・オーダーメイド設備の4つの観点で行われます。汎用設備を単体で入れるだけの事業は対象外です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh03", scheme: "shoryokuka", phase: "事前準備", task: "販売事業者から仕様書・カタログ・参考見積をもらう", owner: "事業主・販売事業者", days: 21, anchor: "deadline", offset: -60, when: "締切の60日前", dep: ["sh02"], hard: true, warn: "50万円以上の機械装置・システムは仕様と積算根拠が分かる書類が必要です。ただし公募要領は「書類の取得にあたっては事前着手に抵触することのないようご注意ください」と明記しています。見積の依頼までにとどめ、契約・発注はしないでください", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh04", scheme: "shoryokuka", phase: "申請書の作成", task: "事業計画書（その1〜その3）を自分で作る", owner: "事業主", days: 30, anchor: "deadline", offset: -55, when: "締切の55日前から着手", dep: ["sh02", "sh03"], hard: true, warn: "事業計画は申請者自身が作ります。認定経営革新等支援機関や専門家の支援を受けた場合は支援者名・報酬・契約期間の記載が必須で、記載がなければ虚偽として不採択・採択取消・補助金返還・氏名公表の対象です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh05", scheme: "shoryokuka", phase: "申請書の作成", task: "労働生産性と給与の目標値を計算する", owner: "事業主", days: 7, anchor: "deadline", offset: -40, when: "締切の40日前", dep: ["sh04"], hard: true, warn: "基本要件は労働生産性の年平均成長率+4.0%以上、1人当たり給与支給総額の年平均成長率+3.5%以上です。事業計画期間を通じて達成する義務があり、未達だと返還の対象になり得ます", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh06", scheme: "shoryokuka", phase: "申請書の作成", task: "賃金引き上げ計画の表明書と全従業員の賃金台帳を用意する", owner: "事業主", days: 10, anchor: "deadline", offset: -30, when: "締切の30日前", dep: ["sh05"], hard: true, warn: "設定した目標値を交付申請時までに全従業員または従業員代表者・役員へ表明する必要があります。労務の要件なので社労士にご確認ください", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh07", scheme: "shoryokuka", phase: "申請書の作成", task: "借入をするなら金融機関に事業計画を確認してもらう", owner: "事業主・金融機関", days: 21, anchor: "deadline", offset: -35, when: "締切の35日前", dep: ["sh04"], hard: true, warn: "資金を金融機関から調達する予定がある場合は、金融機関による事業計画の確認を受け、指定様式の金融機関確認書を出す必要があります（認定経営革新等支援機関の確認書ではありません）", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:22 JST" },
    { id: "sh08", scheme: "shoryokuka", phase: "申請書の作成", task: "決算書2期分・納税証明書・登記事項証明書などを集める", owner: "事業主", days: 14, anchor: "deadline", offset: -25, when: "締切の25日前", dep: [], warn: "法人は履歴事項全部証明書（発行から3か月以内）・納税証明書（その2）直近3期分など、個人は確定申告書控え・納税証明書（その2）直近1年分などです。取得に日数がかかります", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh09", scheme: "shoryokuka", phase: "申請", task: "電子申請システムから応募申請を出す", owner: "事業主", days: 3, anchor: "deadline", offset: -3, when: "締切の3日前", dep: ["sh01", "sh04", "sh06", "sh08"], hard: true, warn: "申請者自身による申請でないと認められない場合は不採択です。不備があると差戻しになり、指定された訂正期限までに直せなければ不採択です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh10", scheme: "shoryokuka", phase: "交付決定", task: "採択発表を確認する（採択は交付決定ではありません）", owner: "事務局", days: 1, anchor: "adoption_date", offset: 0, when: "応募締切の約3〜4か月後", dep: ["sh09"], hard: true, warn: "採択されたのは「補助金交付候補者」であり、申請内容のすべてが承認されたわけではありません。この時点で発注してはいけません", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh11", scheme: "shoryokuka", phase: "交付決定", task: "事務局の研修動画を見て確認テストを受ける", owner: "事業主", days: 3, anchor: "adoption_date", offset: 7, when: "採択発表の直後", dep: ["sh10"], hard: true, warn: "「採択された事業者は、研修動画の視聴をしなければなりません（確認テストを含む）。視聴しない場合は、採択は無効となります」。修了証は交付申請の提出書類です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh12", scheme: "shoryokuka", phase: "交付決定", task: "50万円以上の設備は同じ条件で相見積を取る", owner: "事業主・販売事業者", days: 21, anchor: "adoption_date", offset: 10, when: "採択発表の約10日後から", dep: ["sh10"], hard: true, warn: "契約先・発注先1者あたりの見積額合計が50万円（税抜）以上の物件は、同一条件による相見積が原則必要です。見積依頼書と見積書は交付申請の必須書類です。ここでも契約・発注はしません", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh13", scheme: "shoryokuka", phase: "交付決定", task: "交付申請を出す（採択発表から2か月以内）", owner: "事業主", days: 14, anchor: "adoption_date", offset: 50, when: "採択発表の50日後（期限は採択発表日から2か月後）", dep: ["sh11", "sh12"], hard: true, warn: "見落としやすい期日です。「交付申請は、原則、採択発表日から2か月後の日を期限とし、それまでに実施していただく必要があります。期限までに交付申請がなかった場合は、採択決定の取消となります」", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh14", scheme: "shoryokuka", phase: "交付決定", task: "自己資金・つなぎ資金を手当てする", owner: "事業主・金融機関", days: 45, anchor: "grant_date", offset: -45, when: "交付決定の45日前から", dep: ["sh10"], hard: true, warn: "「補助金の支払については、原則として補助事業終了後に補助事業実績報告書の提出を受け、補助金額の確定後の精算払となります」。設備代金は全額いったん自社で支払います", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh15", scheme: "shoryokuka", phase: "交付決定", task: "交付決定通知書を受け取り、交付決定日を確認する", owner: "事務局", days: 1, anchor: "grant_date", offset: 0, when: "交付申請の提出後（審査を経て通知）", dep: ["sh13"], hard: true, warn: "「交付決定通知書に記載された交付決定日をもって、補助事業を始めることができます」。交付申請の審査で補助対象経費が減額されることや、交付決定できない場合があります", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh16", scheme: "shoryokuka", phase: "事業の実施", task: "交付決定日より後に設備を発注・契約する", owner: "事業主・販売事業者", days: 14, anchor: "grant_date", offset: 1, when: "交付決定の翌日以降", dep: ["sh15"], hard: true, warn: "いちばん多い事故です。公募要領は補助対象外経費として「交付決定前に発生した経費 ※いかなる理由であっても事前着手は認められません」と明記しています", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh17", scheme: "shoryokuka", phase: "事業の実施", task: "入れる機械装置に保険か共済をかける", owner: "事業主", days: 14, anchor: "grant_date", offset: 30, when: "交付決定の約30日後", dep: ["sh16"], hard: true, warn: "事業計画期間の終了までの間、風水害等の自然災害を含む損害を補償し、付保割合50%以上の保険または共済への加入が原則必須です。実績報告で加入を示す書類が必要です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh18", scheme: "shoryokuka", phase: "事業の実施", task: "システム構築費を使うなら保守・メンテナンス契約を結ぶ", owner: "事業主・販売事業者", days: 14, anchor: "grant_date", offset: 30, when: "交付決定の約30日後", dep: ["sh16"], warn: "システム構築費を計上する場合、発注先と3〜5年の事業計画期間内における保守・メンテナンス契約が必要です（保守費用自体は補助対象外）", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh19", scheme: "shoryokuka", phase: "事業の実施", task: "納品・検収・支払まで期間内に終わらせる", owner: "事業主・販売事業者", days: 300, anchor: "grant_date", offset: 30, when: "補助事業の実施期間は交付決定日から18か月以内（かつ採択発表日から20か月後まで）", dep: ["sh16"], hard: true, warn: "「補助事業実施期間内に、契約（発注）・納品・検収・支払等の全ての事業の手続きを完了し、実績報告書を提出しなければなりません」。交付申請が遅れるほど実施できる期間が短くなります", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh20", scheme: "shoryokuka", phase: "実績報告", task: "実績報告書を事務局に出す", owner: "事業主", days: 21, anchor: "grant_date", offset: 540, when: "補助事業完了日から30日を経過した日と事業完了期限日の早い方まで", dep: ["sh19"], hard: true, warn: "「実績報告が提出されない場合や提出内容に不備がある場合は補助金の支払いができません」。保険・共済の加入書類、保守契約の書類もここで必要です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh21", scheme: "shoryokuka", phase: "実績報告", task: "現地調査を受け、確定後に精算払いで入金される", owner: "事務局・中小機構", days: 90, anchor: "grant_date", offset: 600, when: "実績報告の約60日後（目安）", dep: ["sh20"], hard: true, warn: "補助金額の確定にあたり、中小機構および事務局が設備や帳簿類の現地調査を行います。精算払い（後払い）です。補助金は支払を受けた事業年度の収入になり課税対象です（税理士にご確認ください）", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh22", scheme: "shoryokuka", phase: "採択後の義務", task: "入れた設備を勝手に売却・廃棄・担保にしない", owner: "事業主", days: 1825, anchor: "grant_date", offset: 601, when: "減価償却資産の耐用年数等に関する省令に定める期間", dep: ["sh21"], hard: true, warn: "処分制限期間は耐用年数省令に定める期間です。質権等の担保権設定は原則不可で、事前の事務局承認が必要です。設備を担保に借入をする場合は中小機構への事前申請が要り、担保権が実行されると国庫納付が必要です", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh23", scheme: "shoryokuka", phase: "採択後の義務", task: "事業計画期間中は毎年、効果報告を出す", owner: "事業主", days: 14, anchor: "grant_date", offset: 900, when: "補助事業完了年度の翌年度を1年目として3〜5年、毎年", dep: ["sh21"], hard: true, warn: "労働生産性・1人当たり給与支給総額の実績を毎年報告します。基本要件が未達の場合は返還の対象になり得ます", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" },
    { id: "sh24", scheme: "shoryokuka", phase: "採択後の義務", task: "収益納付は求められないが、返還の要件があることを知っておく", owner: "事業主", days: 1, anchor: "grant_date", offset: 601, when: "補助事業の終了後", dep: ["sh21"], warn: "この補助金の公募要領は「収益納付は求めません」と明記しています。ただし基本要件の未達、善管注意義務違反、無断承継、立入検査での指摘により、交付決定取消や返還になる場合があります。持続化補助金とは扱いが違うので混同しないでください", source: "https://shoryokuka.smrj.go.jp/assets/pdf/application_guidelines_ippan_07.pdf", checked: "2026-08-02 13:18 JST" }
,
    { id: "h01", scheme: "hatarakikata", phase: "準備", task: "労働局や働き方改革推進支援センターに事前相談する", owner: "事業主・社労士", days: 7, anchor: "application_date", offset: -90, when: "交付申請の90日前めやす", dep: [], warn: "無料で相談できます。使えるコースの選び方や書類の揃え方をここで詰めておくと、後の手戻りが減ります", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h02", scheme: "hatarakikata", phase: "準備", task: "自社が中小企業事業主に当たるか確かめる", owner: "事業主", days: 1, anchor: "application_date", offset: -75, when: "交付申請の75日前めやす", dep: ["h01"], warn: "美容業はサービス業の区分なので、資本金5,000万円以下または常時使用する労働者100人以下なら該当します。労働者の数にはふだん使っているパート・アルバイトも入ります", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h03", scheme: "hatarakikata", phase: "準備", task: "年次有給休暇管理簿を全事業場で整える", owner: "事業主・社労士", days: 14, anchor: "application_date", offset: -60, when: "交付申請の60日前までに着手", dep: ["h02"], hard: true, warn: "対象事業主の要件です。年休の付与実績があるかどうかにかかわらず、作成しておく必要があります", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h04", scheme: "hatarakikata", phase: "準備", task: "年5日の時季指定を就業規則に定めて労基署へ届け出る", owner: "事業主・社労士", days: 21, anchor: "application_date", offset: -60, when: "交付申請の日より前に届出を済ませる", dep: ["h03"], hard: true, warn: "常時10人以上の事業場が対象です。パート用の就業規則を別に作っている場合、そちらにも時季指定を定めて届け出ないと要件を満たしません", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h05", scheme: "hatarakikata", phase: "準備", task: "どの成果目標で申請するか決める", owner: "事業主・社労士", days: 3, anchor: "application_date", offset: -50, when: "交付申請の50日前めやす", dep: ["h02"], hard: true, warn: "同じ年度に同じ事業主が交付決定を受けられるのは1回だけです。勤務間インターバル導入コースと両方を受けることはできません", source: "https://www.mhlw.go.jp/content/001689316.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h06", scheme: "hatarakikata", phase: "準備", task: "いまの36協定が要件を満たすか確かめる", owner: "事業主・社労士", days: 14, anchor: "application_date", offset: -45, when: "交付申請の日より前に確認・届出を済ませる", dep: ["h05"], hard: true, warn: "時間外・休日労働時間数の削減を成果目標にする場合、（1）全事業場で2026年4月1日以前の2年間に月45時間（1年単位の変形労働時間制は42時間）を超える時間外労働の実態があること、（2）交付申請日を有効期間に含み、月60時間または80時間を超えて協定した36協定が交付申請より前に届け出てあること、の両方が必要です。要件を満たす目的で36協定の上限時間を引き上げることは制度の想定ではありません。当てはまらない場合は年次有給休暇の制度導入（25万円）を検討してください", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h07", scheme: "hatarakikata", phase: "準備", task: "見積書を2社以上から取る", owner: "事業主", days: 14, anchor: "application_date", offset: -30, when: "交付申請の30日前までに着手", dep: ["h05"], hard: true, warn: "交付申請に2者以上の見積書を付けます。メーカー直販や定価販売のみで2者から取れない場合は、市場価格が分かる資料で代えられます。見積りを交付申請より前に取ることは問題ありません。パソコン・タブレット・スマートフォンの購入費用と、乗車定員7人以上の乗用自動車等の購入費用は対象外です", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h08", scheme: "hatarakikata", phase: "準備", task: "事業実施計画と添付書類をそろえる", owner: "事業主・社労士", days: 10, anchor: "application_date", offset: -14, when: "交付申請の14日前めやす", dep: ["h07"], warn: "様式第1号の別添が事業実施計画です。添付書類が足りないと受付・審査が止まります", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h09", scheme: "hatarakikata", phase: "交付申請", task: "交付申請書を労働局へ出す", owner: "事業主・社労士", days: 1, anchor: "application_date", offset: 0, when: "2026年11月30日(月)まで（郵送は当日消印有効）", dep: ["h08"], hard: true, warn: "提出先は都道府県労働局の雇用環境・均等部（室）です。予算がなくなると11月30日より前に予告なく受付が締め切られます。郵送は当日の消印有効、窓口と電子申請（Jグランツ）は当日17時までにデータが届いていること。申請書類の作成・提出を代理で頼めるのは社会保険労務士または弁護士に限られます", source: "https://www.mhlw.go.jp/content/001696150.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h10", scheme: "hatarakikata", phase: "交付申請", task: "交付決定の通知を待つ", owner: "労働局", days: 30, anchor: "application_date", offset: 30, when: "交付申請から原則1か月以内", dep: ["h09"], hard: true, warn: "交付要綱では、交付申請のあった日から原則として1か月以内に交付決定または不交付決定を行うと定められています。この間に発注・契約をしてはいけません。通知が届く前に契約したものは改善事業に含められません", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h11", scheme: "hatarakikata", phase: "事業の実施", task: "交付決定の後に発注・契約する", owner: "事業主", days: 7, anchor: "grant_decision_date", offset: 0, when: "交付決定日の翌日以降", dep: ["h10"], hard: true, warn: "交付決定日より前の発注・契約は理由を問わず対象外です", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h12", scheme: "hatarakikata", phase: "事業の実施", task: "納品を受け、支払まで終える", owner: "事業主", days: 60, anchor: "grant_decision_date", offset: 14, when: "事業は2027年1月31日(日)まで／支払は支給申請日まで", dep: ["h11"], hard: true, warn: "契約・納品・役務の提供は、交付決定日から2027年1月31日までに終える必要があります。支払は支給申請の日までに済んでいれば認められます（クレジットカード払いは支給申請日までに口座から引き落とされていること）。ただし支給申請には支払を証明する書類を付けるため、前倒しが安全です", source: "https://www.mhlw.go.jp/content/001689316.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h13", scheme: "hatarakikata", phase: "事業の実施", task: "支払は内訳が分かる形で、事業主名義で行う", owner: "事業主", days: 1, anchor: "grant_decision_date", offset: 14, when: "支払をするとき", dep: ["h12"], hard: true, warn: "誰が・誰に・何の取引で・いつ・いくら（内訳を含む）が分かる書面やデータが必要です。ネットバンキングの履歴に品目の内訳が出ず、対象外になった例があります。支払の名義は事業主本人（代表者名）か法人名でなければならず、個人事業主が家族名義の口座・カードで支払うと、支払ったものと認められません", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h14", scheme: "hatarakikata", phase: "事業の実施", task: "成果目標を実行する（36協定・就業規則の変更）", owner: "事業主・社労士", days: 45, anchor: "grant_decision_date", offset: 7, when: "事業実施期間の中で行う", dep: ["h11"], hard: true, warn: "賃上げ加算を使う場合は、賃金計算期間の始期と就業規則を変更した時点の両方が、交付申請日から事業実施予定期間の終わりまでに入っている必要があります", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h15", scheme: "hatarakikata", phase: "事業の実施", task: "労使の話合いの場を設け、記録を残す", owner: "事業主", days: 45, anchor: "grant_decision_date", offset: 7, when: "事業実施期間の中で行う", dep: ["h11"], hard: true, warn: "労働時間等設定改善法と指針に基づく措置（労使の話合いの機会の整備・担当者の配置・計画の周知）の実施が支給の要件です。議事録や写真は支給申請の必須添付で、あとから作ることはできません", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h16", scheme: "hatarakikata", phase: "事業の実施", task: "計画を変えるときは事前に変更申請する", owner: "事業主・社労士", days: 7, anchor: "grant_decision_date", offset: 30, when: "変更が生じたとき（事前に）", dep: ["h11"], hard: true, warn: "様式第4号で申請し、労働局の承認を受けます。事後の承認は受けられません。納品の遅れによる変更申請が多く発生しています", source: "https://www.mhlw.go.jp/content/001689316.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h17", scheme: "hatarakikata", phase: "支給申請", task: "支給申請書と事業実施結果報告書を出す", owner: "事業主・社労士", days: 20, anchor: "jigyou_end", offset: 1, when: "事業終了から30日後か2027年2月5日(金)の早い方", dep: ["h12", "h14", "h15"], hard: true, warn: "様式第10号と様式第11号に、支払を証明する書類・成果目標を達成したことが分かる書類・労使の話合いの記録を添えます。郵送は当日の消印有効、電子申請は締切当日の23時59分まで受け付けます。申請書類の作成・提出を代理で頼めるのは社会保険労務士または弁護士に限られます", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h18", scheme: "hatarakikata", phase: "支給申請", task: "労働局の審査に答える", owner: "労働局", days: 30, anchor: "jigyou_end", offset: 21, when: "支給申請から1か月めやす", dep: ["h17"], warn: "標準的な審査期間は1か月です。審査の中で労働基準関係法令の違反が疑われた場合、所管の部署へ情報提供されます", source: "https://www.mhlw.go.jp/content/001696656.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h19", scheme: "hatarakikata", phase: "支給申請", task: "交付額の確定通知を受け、入金される", owner: "労働局・事業主", days: 1, anchor: "jigyou_end", offset: 51, when: "審査が終わってから", dep: ["h18"], warn: "精算払い（後払い）です。交付申請から確定までは、過去の実績で平均5〜6か月かかっています", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h20", scheme: "hatarakikata", phase: "支給後の義務", task: "賃上げ加算を受けたら状況を報告する", owner: "事業主", days: 30, anchor: "jigyou_end", offset: 180, when: "6箇月後基準日から30日以内", dep: ["h19"], hard: true, warn: "賃上げ加算を選んだ場合のみです。期限内に報告しないと加算分の返還を求められることがあります。また、加算を選んだあとに指定事業場の労働者の時給を引き下げたとき、交付申請日の3か月前以降に解雇・退職勧奨・希望退職の募集による退職があったときは、加算が支給されません", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h21", scheme: "hatarakikata", phase: "支給後の義務", task: "税込で受けた場合は消費税額を報告する", owner: "事業主・税理士", days: 14, anchor: "jigyou_end", offset: 240, when: "消費税の申告後すみやかに（遅くとも翌々年度6月末まで）", dep: ["h19"], warn: "様式第13号です。仕入税額控除の対象になった分は返還します", source: "https://www.mhlw.go.jp/content/001696657.pdf", checked: "2026-08-02 17:19 JST" },
    { id: "h22", scheme: "hatarakikata", phase: "支給後の義務", task: "買ったものを勝手に処分しない", owner: "事業主", days: 1, anchor: "jigyou_end", offset: 240, when: "処分しようとするとき（事前に）", dep: ["h19"], hard: true, warn: "取得した財産を売却・譲渡・廃棄する前に、労働局へ申請して承認を受ける必要があります", source: "https://www.mhlw.go.jp/content/001689316.pdf", checked: "2026-08-02 17:19 JST" }
  ]
};

// 一覧で読むための1行要約（見出しに使う）。本文（task）は消していないので、
// ここに無いタスクは本文がそのまま見出しになる。要約を書き換えても中身は変わらない。
window.KOBAN_GANTT.shorts = {
  h01: "労働局に事前相談する",
  h02: "中小企業か確かめる",
  h03: "年休管理簿を整える",
  h04: "時季指定を定めて届出",
  h05: "成果目標を決める",
  h06: "36協定の要件を確認",
  h07: "見積書を2社から取る",
  h08: "事業実施計画を作る",
  h09: "交付申請書を出す",
  h10: "交付決定の通知を待つ",
  h11: "交付決定の後に発注",
  h12: "納品と支払を終える",
  h13: "事業主名義で内訳を残す",
  h14: "成果目標を実行する",
  h15: "労使の話合いを記録",
  h16: "変更は事前に申請する",
  h17: "支給申請書を出す",
  h18: "労働局の審査に答える",
  h19: "確定通知を受けて入金",
  h20: "賃上げ加算を報告する",
  h21: "消費税額を報告する",
  h22: "処分前に承認をもらう",
  c01: "雇用保険と保険料を確認",
  c02: "管理者を1人決める",
  c03: "対象者の履歴を洗い出す",
  c04: "就業規則の賃金規定を点検",
  c05: "キャリアアップ計画書を作る",
  c06: "計画書を労働局へ提出",
  c07: "就業規則に転換制度を追加",
  c08: "就業規則を監督署へ届出",
  c09: "賞与・退職金・昇給を確認",
  c10: "労働条件通知書を交わす",
  c11: "正社員へ転換する",
  c12: "賃金が3%以上増える設計に",
  c13: "出勤簿と賃金台帳を残す",
  c14: "申請書類一式をそろえる",
  c15: "支給申請を社労士に依頼",
  c16: "第1期の支給申請を出す",
  c17: "労働局の照会に答える",
  c18: "第2期を申請する",
  j01: "能力開発推進者を選ぶ",
  j02: "職業能力開発計画を作る",
  j03: "雇用保険の加入を確認",
  j04: "10時間以上の研修を選ぶ",
  j05: "カリキュラムと見積を取る",
  j06: "計画届と対象者一覧を作る",
  j07: "キャリアコンサルを受ける",
  j08: "厚労大臣の認定を受ける",
  j09: "計画届を社労士に依頼",
  j10: "計画届を労働局へ提出",
  j11: "GビズIDを取る",
  j12: "計画どおりに訓練する",
  j13: "出勤簿と受講記録を残す",
  j14: "訓練費用を振り込む",
  j15: "賃上げか資格手当を実施",
  j16: "正社員へ転換する",
  j17: "実施状況報告書を作る",
  j18: "支給申請を社労士に依頼",
  j19: "支給申請書を労働局へ提出",
  j20: "照会に答え、記録を保管",
  k01: "一番時給が低い人を確かめる",
  k02: "最低賃金との差を確認",
  k03: "解雇・賃下げの有無を確認",
  k04: "申請するコースを決める",
  k05: "設備を決めて業者をあたる",
  k06: "見積書を2通そろえる",
  k07: "事業実施計画書を書く",
  k08: "交付申請を社労士に依頼",
  k09: "交付申請書を労働局へ出す",
  k10: "交付決定の通知を受け取る",
  k11: "就業規則に新しい時給を書く",
  k12: "最低時給を引き上げる",
  k13: "設備を発注し納品を受ける",
  k14: "代金を振込で支払う",
  k15: "証拠になる書類をそろえる",
  k16: "実績報告と支給申請を出す",
  k17: "確定通知と入金を確認",
  k18: "6か月後に状況報告を出す",
  k19: "時給を保ち5年間保存",
  jz01: "GビズIDを取る",
  jz02: "小規模事業者か確認",
  jz03: "様式14を出したか確認",
  jz04: "商工会議所に相談を予約",
  jz05: "経営計画（様式2）を書く",
  jz06: "売上・粗利の見込みを書く",
  jz07: "見積書を業者から取る",
  jz08: "特例を使うか決める",
  jz09: "様式4の発行を依頼する",
  jz10: "様式4を受け取る",
  jz11: "電子申請で申請を送る",
  jz12: "採択発表を確認する",
  jz13: "詳しい見積書を提出する",
  jz14: "賃上げ目標を表明する",
  jz15: "つなぎ資金を手当てする",
  jz16: "交付決定通知を受け取る",
  jz17: "交付決定の後に発注する",
  jz18: "納品と支払いを終える",
  jz19: "契約書・振込控えを保管",
  jz20: "実績報告（様式8）を出す",
  jz21: "確定通知を受けて入金",
  jz22: "買った設備を処分しない",
  jz23: "収益納付に備える",
  jz24: "様式14の報告を出す",
  ai01: "GビズIDを取る",
  ai02: "IT導入支援事業者を選ぶ",
  ai03: "セキュリティ宣言をする",
  ai04: "ITツールと見積を決める",
  ai05: "申請マイページを開設",
  ai06: "携帯電話番号を登録する",
  ai07: "証明書・決算書をそろえる",
  ai08: "3年間の数値計画を作る",
  ai09: "賃上げ計画を表明する",
  ai10: "交付申請を出す",
  ai11: "つなぎ資金を手当てする",
  ai12: "交付決定を確認する",
  ai13: "交付決定の後に契約する",
  ai14: "納品を受けて使い始める",
  ai15: "請求書を受けて支払う",
  ai16: "実績報告を出す",
  ai17: "補助金が入金される",
  ai18: "解約せずに使い続ける",
  ai19: "毎年、効果を報告する",
  ai20: "書類を5年間保管する",
  sh01: "GビズIDを取る",
  sh02: "省力化する作業を洗い出す",
  sh03: "仕様書と参考見積をもらう",
  sh04: "事業計画書を作る",
  sh05: "生産性と給与の目標を計算",
  sh06: "賃上げ表明書を用意する",
  sh07: "金融機関に計画を確認",
  sh08: "決算書・証明書を集める",
  sh09: "応募申請を出す",
  sh10: "採択発表を確認する",
  sh11: "研修動画と確認テスト",
  sh12: "相見積を取る",
  sh13: "交付申請を出す",
  sh14: "つなぎ資金を手当てする",
  sh15: "交付決定通知を受け取る",
  sh16: "交付決定の後に発注する",
  sh17: "設備に保険をかける",
  sh18: "保守・メンテ契約を結ぶ",
  sh19: "納品・検収・支払を終える",
  sh20: "実績報告書を出す",
  sh21: "現地調査を受けて入金",
  sh22: "設備を勝手に処分しない",
  sh23: "毎年、効果報告を出す",
  sh24: "返還の要件を知っておく"
};


// ---------- キャリアアップ助成金のコースを増やすためのひな型 ----------
// 令和8年度のキャリアアップ助成金は6コース。どのコースも
//   準備 → 計画届 → 就業規則の整備 → 取組の実施 → 支給申請 → 支給決定後
// という骨格が同じで、違うのは「取組の実施」の中身と基準日の呼び名だけ。
// 共通の10手順をここで作り、コースごとに違う分だけを渡す。
//
// 使い方：
//   KOBAN_GANTT.addCareerCourse({
//     key: 'career_shoyo',                    // scheme のキー（制度のキーと同じにする）
//     label: 'キャリアアップ助成金 賞与・退職金制度導入コース',
//     prefix: 'cs',                            // タスクIDの頭（cs01, cs02 …）
//     actionLabel: '制度を始める日',            // 基準日の呼び名
//     actionNote: '前の工程はすべてこの日から逆算します',
//     ruleTask: '就業規則に賞与または退職金の定めを書き加える',
//     ruleWarn: '…',
//     actions: [ { short, task, owner, days, offset, when, warn, hard } ],
//     source: 'https://…', checked: '2026-08-02 18:30 JST',
//     note: '…'                                // 制度全体の注意（任意）
//   });
(function () {
  var G = window.KOBAN_GANTT;

  G.addCareerCourse = function (o) {
    var P = o.prefix, src = o.source, ck = o.checked;
    var A = 'action_date', W = 'wage6m_paydate';
    var num = 0;
    function id() { num += 1; return P + (num < 10 ? '0' : '') + num; }

    G.schemes[o.key] = { label: o.label, group: o.group || 'キャリアアップ助成金', kind: 'josei' };
    if (o.note) G.schemes[o.key].note = o.note;
    G.anchors[o.key] = [
      { key: A, label: o.actionLabel, note: o.actionNote || '前の工程はすべてこの日から逆算します' },
      { key: W, label: '取組の後、6か月分の賃金を支払う日', note: '支給申請の期限はここから2か月です' }
    ];

    var rows = [];
    function add(phase, short, task, owner, days, anchor, offset, when, dep, extra) {
      var t = { id: id(), scheme: o.key, phase: phase, task: task, owner: owner, days: days,
                anchor: anchor, offset: offset, when: when, dep: dep || [],
                source: src, checked: ck };
      for (var k in (extra || {})) t[k] = extra[k];
      G.shorts[t.id] = short;
      rows.push(t);
      return t.id;
    }

    // ここから10手順は全コース共通
    var a1 = add('準備', '雇用保険と保険料を確認', '雇用保険の適用事業所か、労働保険料の未納がないか確認する',
      '事業主', 1, A, -120, o.actionLabel + 'の120日前', [],
      { warn: '支給申請した年度の前年度より前の保険年度の労働保険料を納めていないと受給できません。滞納の通知は来ません' });
    var a2 = add('準備', '管理者を1人決める', 'キャリアアップ管理者を1人決めて社内に知らせる',
      '事業主', 1, A, -115, o.actionLabel + 'の115日前', [a1],
      { warn: '雇用保険適用事業所ごとに置きます。他の事業所との兼任、労働者代表との兼任はできません' });
    var a3 = add('計画届', '計画書を作って意見を聴く', 'キャリアアップ計画書を作り、従業員代表から意見を聴く',
      '事業主', 3, A, -90, o.actionLabel + 'の90日前', [a2],
      { warn: '計画期間は3年以上5年以内。有期雇用労働者等を含む全ての労働者の代表から意見を聴きます。実施するコースの取組を書いていないと受給できません' });
    var a4 = add('計画届', '計画書を労働局へ出す', 'キャリアアップ計画書を管轄の労働局へ提出する',
      '事業主', 1, A, -60, o.actionLabel + 'の60日前（最終期限は前日）', [a3],
      { hard: true, warn: o.actionLabel + 'の前日までに労働局長に受理されていることが必要です。当日の提出はできません（前日が行政機関の休日ならその翌日まで）' });
    var a5 = add('就業規則の整備', '就業規則に書き加える', o.ruleTask,
      '社労士', 7, A, -45, o.actionLabel + 'の45日前', [a3],
      { warn: o.ruleWarn || '就業規則または労働協約に定め、その規定に基づいて実施したことが必要です' });
    var a6 = add('就業規則の整備', '労基署へ届け出る', '改定した就業規則を労働基準監督署へ届け出る（10人未満は申立書）',
      '事業主', 3, A, -30, o.actionLabel + 'の30日前', [a5],
      { warn: '届出義務のある変更で、支給申請日までに監督署へ届け出ていないと原則不支給です。就業規則は周知した日から効力を持つため、発効日と施行日は同じ日にします' });

    // ここがコースごとに違う分
    var lastAction = a6;
    (o.actions || []).forEach(function (t) {
      lastAction = add('取組の実施', t.short, t.task, t.owner, t.days, A, t.offset,
        t.when, t.dep ? t.dep : [lastAction],
        { warn: t.warn, hard: !!t.hard });
    });

    // ここから4手順も全コース共通
    var b1 = add('支給申請', '申請書類をそろえる', '6か月分の賃金を払った後、申請に必要な書類一式をそろえる',
      '事業主', 5, W, 1, '6か月分の賃金支払日の翌日', [lastAction],
      { warn: '支給申請日に対象者が離職しておらず、支給要件を満たし続けていることが必要です' });
    var b2 = add('支給申請', '社労士に依頼する', '支給申請書の作成と提出を社労士に依頼する',
      '社労士', 7, W, 10, '6か月分の賃金支払日の10日後', [b1],
      { warn: '労働社会保険諸法令に基づく申請書類の作成・提出代行は社会保険労務士の独占業務です。代理人が出す場合は委任状の原本が要ります' });
    var b3 = add('支給申請', '労働局へ申請する', '支給申請書を管轄の労働局へ提出する',
      '事業主・社労士', 1, W, 60, '6か月分の賃金支払日の翌日から2か月以内', [b2],
      { hard: true, warn: '6か月分の賃金を支給した日の翌日から2か月以内です。郵送は到着日で判定されます' });
    add('支給決定後', '問い合わせに答える', '労働局からの問い合わせや追加書類の求めに応じる',
      '事業主', 5, W, 90, '6か月分の賃金支払日の90日後ごろ', [b3],
      { warn: '支給決定までにかかる期間は当サイトで確認できていません。管轄の労働局にご確認ください' });

    G.tasks = G.tasks.concat(rows);
    return rows.length;
  };
})();

// キャリアアップ助成金 賞与・退職金制度導入コース（令和8年度）
// 共通の10手順はひな型が作る。ここに書いているのはこのコース固有の取組だけ。
KOBAN_GANTT.addCareerCourse({
  key: 'career_shoyo',
  label: 'キャリアアップ助成金 賞与・退職金制度導入コース',
  prefix: 'cs',
  actionLabel: '制度を始める日',
  actionNote: '就業規則に賞与か退職金を定めて全員に知らせ、効力が生じる日です。前の工程はここから逆算します',
  ruleTask: '就業規則に賞与か退職金（またはその両方）の定めを書き加える',
  ruleWarn: '雇っているすべての有期雇用労働者等が対象になるように定めます。すでに就業規則に賞与の定めがあって一部の人にだけ支給していた場合、対象を広げただけでは「新たに設けた」ことにならず対象外です。退職金は積立・拠出費用を事業主が全額負担すると明記します',
  actions: [
    { short: '全員に知らせて始める', task: '就業規則を全従業員に周知して施行する（発効日と施行日は同じ日）',
      owner: '事業主', days: 1, offset: 0, when: '制度を始める日 当日',
      warn: '就業規則は周知した日から効力を持ちます。発効日と施行日がずれると、計画書の受理日との前後関係が崩れて受け取れなくなることがあります' },
    { short: '賞与を払う・積み立てる', task: '初回の賞与を支給する、または退職金の積立てを始める',
      owner: '事業主', days: 3, offset: 1, when: '制度を始める日の翌日以降（キャリアアップ計画の期間内）', hard: true,
      warn: '賞与は対象者1人につき6か月分相当で5万円以上、退職金は月3,000円以上を6か月分（または6か月分相当18,000円以上）を事業主が全額負担して積み立てます。賞与と退職金を同時に導入した場合、支給申請の起点は初回の賞与支給日と初回の積立日の遅いほうです' },
    { short: '6か月分の記録を残す', task: '初回支給の前3か月と後6か月の賃金台帳・出勤簿を毎月きちんと残す',
      owner: '事業主', days: 180, offset: 2, when: '制度を始める日の翌々日から180日後まで',
      warn: '勤務した日数が11日未満の月は6か月に数えません。申請用に作り直すことはできません' },
    { short: '手当を下げない', task: '基本給と定額で支給している諸手当を減らさない運用を続ける',
      owner: '事業主', days: 180, offset: 2, when: '制度を始める日から支給申請の日まで',
      warn: '手当の名前を変えて実質的に減額するのも認められません。実費弁償的な手当や毎月変動が見込まれる手当も「定額で支給されている諸手当」に含まれます' }
  ],
  source: 'https://www.mhlw.go.jp/content/11910500/001687992.pdf',
  checked: '2026-08-02 18:30 JST',
  note: '1事業所につき通算1回だけです。過去に旧・諸手当制度共通化コースの支給を受けた事業主は対象外です（健康診断制度のみの助成を受けた場合を除く）。'
});

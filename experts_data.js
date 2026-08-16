// 専門家相談機能のデータ。提携が決まったらこのファイルだけを書き換える。
// sw.js の FRESH_FIRST に登録済みのため、push すれば次回アクセスから反映される
// （page_data.js/sim_data.js と同じ扱い。sw.js のキャッシュ名バンプは不要）。
//
// 【提携決定時にやること】
// 1. experts に実データを1件追加（id/name/title/qualification/kinds/areas/tags/
//    line_oa_id/email/accepting/note）。line_oa_id か email の少なくとも一方を入れる
// 2. status を "open" に、updated を作業日に変更
// 3. LINE実機テスト: スマホで「LINEで相談する」ボタン→トーク画面に本文が入ることを確認
//    （友だち追加前・追加後の両方で確認する。挙動が変わることがある）
// 4. メール実機テスト: 件名・本文が文字化けしないことを確認
// 5. push のみでよい（sw.js のキャッシュ名バンプは不要）
// 6. 専門家本人に掲載内容（名前・タグ・地域・費用注記）の承認を取る
//
// 【データを書くときの注意（LEGAL_NOTES.md 参照）】
// - 提携が決まっていない資格種別は experts に追加しない（空のまま「準備中」表示にする）
// - 実在しない人物・事務所名を仮のデータとして書かない
// - 想定採択率・成功率などを note に書かない（景品表示法）
// - 「書類の作成・提出を代行します」という書き方をしない（行政書士法・社会保険労務士法）
//
// 【topics について】
// 相談前アンケートQ1（何について相談したいか）の選択肢。各専門家の topics 配列に
// ここの id を入れると、その相談テーマを選んだ利用者にその専門家が表示される。
// topics 未設定の専門家は kinds（hojo/josei）だけで従来どおり判定される。
window.KOBAN_CONSULT_TOPICS = [
  {
    id: 'which',
    label: '自社で使える制度を知りたい',
    // この相談テーマに向く資格。experts の topics 指定が無い場合のフォールバック判定に使う
    qualifications: ['shindanshi', 'sharoushi'],
    prepare: ['直近の決算書（または確定申告書）', '従業員数がわかるもの', 'やりたい取り組みのメモ']
  },
  {
    id: 'plan',
    label: '採択される事業計画の作り方',
    qualifications: ['shindanshi'],
    prepare: ['導入したい設備・サービスの見積書', '直近2期分の決算書', '現在の課題を書き出したメモ']
  },
  {
    id: 'docs',
    label: '申請書類の書き方・進め方',
    qualifications: ['shindanshi', 'gyoseishoshi'],
    prepare: ['申請予定の制度の公募要領', '書きかけの申請書類', '締切日がわかるもの']
  },
  {
    id: 'wage',
    label: '賃金・就業規則のこと',
    qualifications: ['sharoushi'],
    prepare: ['現在の就業規則・賃金規程', '賃金台帳（直近数か月分）', '雇用契約書のひな形']
  },
  {
    id: 'after',
    label: '採択後の手続き・実績報告',
    qualifications: ['shindanshi', 'sharoushi'],
    prepare: ['交付決定通知書', '補助事業に使った経費の領収書・契約書', '実績報告の様式']
  },
  {
    id: 'other',
    label: 'その他・まだ整理できていない',
    qualifications: [],
    prepare: ['相談したいことのメモ（箇条書きで可）']
  }
];

// 相談前アンケートQ2（検討段階）の選択肢
window.KOBAN_CONSULT_STAGES = [
  { id: 'research', label: 'まず情報を集めている' },
  { id: 'preparing', label: '申請に向けて準備している' },
  { id: 'deadline', label: '締切が近く急いでいる' },
  { id: 'applied', label: '申請済み・採択後の相談' }
];
window.KOBAN_EXPERTS = {
  updated: '2026-08-17',
  status: 'preparing', // 'preparing'（提携準備中）| 'open'（受付中）
  // ⚠️ いま入っている2件は動作確認用のサンプルで、実在の専門家ではない。
    //    提携が決まったら、この2件を実データで置き換えること
    //    （name を実名に、連絡先を本物に、note の但し書きを消す）。
    //    連絡先は届かないダミーのアドレス・番号にしてあり、押しても誰にも繋がらない。
  experts: [
    {
      id: 'sample-sharoushi',
      name: '（サンプル・実在しません）',
      title: '社会保険労務士',
      qualification: 'sharoushi', // sharoushi | shindanshi | gyoseishoshi | zeirishi
      kinds: ['josei'],           // 対応する制度種別: 'josei'(雇用系助成金) / 'hojo'(補助金)
      topics: ['wage', 'which', 'after'], // 対応できる相談テーマ（KOBAN_CONSULT_TOPICS の id）
      areas: ['全国対応'],         // 空配列=全国対応。表示のみで絞り込みには使わない
      tags: ['雇用関係助成金', '就業規則', '賃金設計'],
      line_oa_id: '@sample-sr',   // 空ならLINEボタンを出さない
      email: 'sample-sr@example.com', // 空ならメールボタンを出さない
      tel: '03-0000-0000',        // 空なら電話ボタンを出さない
      tel_hours: '平日9:00〜18:00',
      accepting: true,            // false で「現在受付を停止しています」表示
      note: '動作確認用のサンプルです。提携先が決まりしだい実際の専門家に差し替えます'
    },
    {
      id: 'sample-shindanshi',
      name: '（サンプル・実在しません）',
      title: '中小企業診断士',
      qualification: 'shindanshi',
      kinds: ['hojo'],
      topics: ['plan', 'docs', 'which', 'after'],
      areas: ['全国対応'],
      tags: ['補助金申請支援', '事業計画', '採択後の手続き'],
      line_oa_id: '@sample-sd',
      email: 'sample-sd@example.com',
      tel: '03-0000-1111',
      tel_hours: '平日10:00〜19:00',
      accepting: true,
      note: '動作確認用のサンプルです。提携先が決まりしだい実際の専門家に差し替えます'
    }
  ],
  // レイアウト検証専用のダミーデータ。URLに ?expertdemo=1 を付けたときだけ表示される。
  // 実在しない旨を name に明記すること。
  demo: [
    {
      id: 'demo-sharoushi',
      name: '（サンプル表示・実在しません）',
      title: '社会保険労務士',
      qualification: 'sharoushi',
      kinds: ['josei'],
      topics: ['wage', 'which', 'after'],
      areas: ['全国対応（例）'],
      tags: ['雇用関係助成金', '就業規則', '賃金設計'],
      line_oa_id: '@demo',
      email: 'demo@example.com',
      tel: '03-0000-0000',
      tel_hours: '平日9:00〜18:00（例）',
      accepting: true,
      note: 'これはレイアウト確認用の表示です'
    },
    {
      id: 'demo-shindanshi',
      name: '（サンプル表示・実在しません）',
      title: '中小企業診断士',
      qualification: 'shindanshi',
      kinds: ['hojo'],
      topics: ['plan', 'docs', 'which', 'after'],
      areas: ['全国対応（例）'],
      tags: ['補助金申請支援', '事業計画'],
      line_oa_id: '',
      email: 'demo2@example.com',
      accepting: true,
      note: 'これはレイアウト確認用の表示です'
    }
  ]
};

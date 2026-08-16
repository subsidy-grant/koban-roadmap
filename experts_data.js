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
window.KOBAN_EXPERTS = {
  updated: '2026-08-17',
  status: 'preparing', // 'preparing'（提携準備中）| 'open'（受付中）
  experts: [
    // 提携が決まるまで空。上のコメントの手順に従って追加する。
    // {
    //   id: 'sr-001',
    //   name: '○○ ○○',
    //   title: '社会保険労務士',
    //   qualification: 'sharoushi', // sharoushi | shindanshi | gyoseishoshi | zeirishi
    //   kinds: ['josei'],           // 対応する制度種別: 'josei'(雇用系助成金) / 'hojo'(補助金)
    //   areas: ['東京都', '神奈川県'], // 空配列=全国対応。表示のみで絞り込みには使わない
    //   tags: ['雇用関係助成金', '就業規則'],
    //   line_oa_id: '',             // 例 '@xxxxx'。空ならLINEボタンを出さない
    //   email: '',                  // 空ならメールボタンを出さない
    //   accepting: true,            // false で「現在受付を停止しています」表示
    //   note: '初回相談30分無料'     // 任意
    // }
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
      areas: ['全国対応（例）'],
      tags: ['雇用関係助成金', '就業規則', '賃金設計'],
      line_oa_id: '@demo',
      email: 'demo@example.com',
      accepting: true,
      note: 'これはレイアウト確認用の表示です'
    },
    {
      id: 'demo-shindanshi',
      name: '（サンプル表示・実在しません）',
      title: '中小企業診断士',
      qualification: 'shindanshi',
      kinds: ['hojo'],
      areas: ['全国対応（例）'],
      tags: ['補助金申請支援', '事業計画'],
      line_oa_id: '',
      email: 'demo2@example.com',
      accepting: true,
      note: 'これはレイアウト確認用の表示です'
    }
  ]
};

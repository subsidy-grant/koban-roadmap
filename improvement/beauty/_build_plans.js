// =============================================================
// 事業計画書ジェネレーター  plan-01.html 〜 plan-10.html を生成
// A4×10ページ / 絵:文字=5:5 / 印刷でそのままPDF化
// 制度: 省力化=中小企業省力化投資補助金(一般型) / 業務改善=業務改善助成金
// 実行: ELECTRON_RUN_AS_NODE=1 Code.exe _build_plans.js
//
// 旧 beauty-ai-factory プロジェクト(2026-07-18作成)から移行。
// 現行のplan-*.htmlは _build_plans_v2.js が生成する。本スクリプトはBIZ/PLANS定義と
// _plan_data.json の生成元として現役なので、更新時は本スクリプトを先に実行すること。
// =============================================================
const fs = require("fs");
const path = require("path");
const OUT = __dirname;

// ---- 共通デモ事業者(数値は仮置き。実申請時に自社実績へ差し替え) ----
const BIZ = {
  name: "SALON BLOOM 表参道", type: "美容室(ヘアサロン)", staff: 5,
  area: "東京都渋谷区", founded: "2019年", seats: 5, sales: "3,000万円/年",
  salesM: "250万円/月", salesYen: 3000, salesMYen: 250,
};

// ---- 賃金の前提（2026-08-16、社労士確認の一次情報に基づく）----
// 東京都の地域別最低賃金は 1,226円（令和7年10月3日発効）。令和8年度は 1,280円 が
// 2026-08-05に答申されたが、官報公示前・発効日未定（「10月頃」は報道ベースで一次情報ではない）。
//   出典 東京労働局 https://jsite.mhlw.go.jp/tokyo-roudoukyoku/
//        令和8年度業務改善助成金のご案内 https://www.mhlw.go.jp/content/11200000/001693416.pdf
//
// モデルの事業場内最低賃金を 1,230円 とするのは次の2条件を同時に満たすため。
//   (1) 現行の地域別最低賃金 1,226円 以上（下回ると最低賃金法第4条違反になる）
//   (2) 令和8年度の見込額 1,280円 未満（業務改善助成金は「地域別最低賃金未満であること」が
//       対象要件。新最賃の発効前に先回りして引き上げることを助成する制度のため）
// 以前は 1180 がハードコードされていたが、90円引き上げても 1,270円 で新最賃 1,280円 に
// 届かず、制度の趣旨を満たさないモデルになっていた。
const WAGE_BEFORE = 1230;
// 業務改善助成金は70円コース（各案の PLANS.wageUp = 70）。
// 1,230円 + 70円 = 1,300円 で、令和8年度の見込額 1,280円 を上回る。
// 補助率は「引き上げ前」の額で判定するので 1,230円 ≧ 1,050円 → 3/4。
// 東京都で 4/5（1,050円未満）のモデルは、現行最賃 1,226円 を下回る設定になるため作れない。
// 上限額は事業場規模30人未満・70円コース・4〜6人の区分で180万円。
const KAIZEN_CAP = 180;
// 省力化の大幅賃上げ特例で使う任意の引上げ額（必須要件ではない）。
// 以前は 1180+40=1220 を「引上げ後」として出力しており、現行 1,230円 より低いという
// 逆転が生じていた（1180 時代の名残）。定数化して解消（2026-08-16）。
const WAGE_UP_SHORYOKUKA = 40;

// この計画で実際に引き上げる額。業務改善助成金だけが賃上げを必須要件とし、
// 引上げ額がそのままコース区分（50/70/90円）になる。ほかの3制度は任意の特例や
// 加点なので、共通の目安として WAGE_UP_SHORYOKUKA を使う。
// 以前は各所に `p.scheme === "業務改善" ? p.wageUp : 40` が3箇所コピーされており、
// 制度を増やすと直し漏れる形だったので関数にまとめた（2026-08-16）。
function wageUpOf(p) {
  return p.scheme === "業務改善" ? p.wageUp : WAGE_UP_SHORYOKUKA;
}

// 賃金は3桁区切りで書く（1230 → 1,230）。v2側の nf と同じ挙動。
const nfWage = n => Number(n).toLocaleString("ja-JP");

// ---- カラーパレット ----
// navy は制度が4つになったとき（2026-08-16、AI導入補助金の追加）に足した色。
// 省力化=green / 業務改善・持続化=gold / AI導入=navy で、計画書の見出し帯とバッジに使う。
const C = { ink:"#26221e", sub:"#6f675e", line:"#d9d2c8", accent:"#8a5a2b", green:"#3e6b4f", gold:"#b98a2f", red:"#a4453c", navy:"#2b5f8a", bg:"#faf8f5" };

// ---- SVG部品 ----
function barChart(title, items, unit) { // items: [{label,before,after}]
  const max = Math.max(...items.flatMap(i => [i.before, i.after]));
  const bw = 260 / items.length;
  let bars = "";
  items.forEach((it, i) => {
    const x = 46 + i * bw;
    const hb = 130 * it.before / max, ha = 130 * it.after / max;
    bars += `
      <rect x="${x + 6}" y="${160 - hb}" width="${bw/2 - 8}" height="${hb}" fill="#c9b79c" rx="2"/>
      <rect x="${x + bw/2 + 2}" y="${160 - ha}" width="${bw/2 - 8}" height="${ha}" fill="${C.green}" rx="2"/>
      <text x="${x + bw/2}" y="176" font-size="9" fill="${C.sub}" text-anchor="middle">${it.label}</text>
      <text x="${x + 6 + (bw/2-8)/2}" y="${155 - hb}" font-size="8.5" fill="${C.sub}" text-anchor="middle">${it.before}</text>
      <text x="${x + bw/2 + 2 + (bw/2-8)/2}" y="${155 - ha}" font-size="8.5" font-weight="bold" fill="${C.green}" text-anchor="middle">${it.after}</text>`;
  });
  return `<svg viewBox="0 0 320 195" width="100%">
    <text x="10" y="16" font-size="11" font-weight="bold" fill="${C.ink}">${title}</text>
    <text x="200" y="16" font-size="8.5" fill="${C.sub}">■導入前 ■導入後(${unit})</text>
    <line x1="44" y1="160" x2="312" y2="160" stroke="${C.line}"/>
    ${bars}</svg>`;
}
function flow(steps) { // steps: [text,...]
  const w = 300 / steps.length;
  let s = "";
  steps.forEach((t, i) => {
    const x = 12 + i * w;
    s += `<g>
      <rect x="${x}" y="30" width="${w - 14}" height="66" rx="8" fill="${i%2? '#eef3f0':'#f6efe4'}" stroke="${C.line}"/>
      <text x="${x + (w-14)/2}" y="20" font-size="10" font-weight="bold" fill="${C.accent}" text-anchor="middle">STEP${i+1}</text>
      ${t.split("\n").map((ln, k) => `<text x="${x + (w-14)/2}" y="${52 + k*13}" font-size="8.5" fill="${C.ink}" text-anchor="middle">${ln}</text>`).join("")}
    </g>` + (i < steps.length - 1 ? `<text x="${x + w - 9}" y="67" font-size="14" fill="${C.gold}" text-anchor="middle">▶</text>` : "");
  });
  return `<svg viewBox="0 0 314 108" width="100%">${s}</svg>`;
}
function donut(pct, label, color) {
  const r = 46, cir = 2 * Math.PI * r, off = cir * (1 - pct / 100);
  return `<svg viewBox="0 0 130 130" width="130">
    <circle cx="65" cy="65" r="${r}" fill="none" stroke="#eee5d8" stroke-width="14"/>
    <circle cx="65" cy="65" r="${r}" fill="none" stroke="${color}" stroke-width="14" stroke-linecap="round"
      stroke-dasharray="${cir}" stroke-dashoffset="${off}" transform="rotate(-90 65 65)"/>
    <text x="65" y="62" font-size="22" font-weight="bold" fill="${C.ink}" text-anchor="middle">${pct}%</text>
    <text x="65" y="80" font-size="9" fill="${C.sub}" text-anchor="middle">${label}</text></svg>`;
}
function timeline(months) { // months: [{m,label}]
  const w = 300 / months.length;
  let s = `<line x1="14" y1="40" x2="312" y2="40" stroke="${C.line}" stroke-width="2"/>`;
  months.forEach((mo, i) => {
    const x = 22 + i * w;
    s += `<circle cx="${x}" cy="40" r="6" fill="${C.accent}"/>
      <text x="${x}" y="26" font-size="9" font-weight="bold" fill="${C.accent}" text-anchor="middle">${mo.m}</text>
      ${mo.label.split("\n").map((ln,k)=>`<text x="${x}" y="${58 + k*12}" font-size="8" fill="${C.ink}" text-anchor="middle">${ln}</text>`).join("")}`;
  });
  return `<svg viewBox="0 0 320 90" width="100%">${s}</svg>`;
}
function cfChart(rows) { // 投資回収: rows [{y,cum}] 累積CF
  const min = Math.min(...rows.map(r => r.cum)), max = Math.max(...rows.map(r => r.cum));
  const span = max - min || 1, bw = 280 / rows.length;
  const y0 = 20 + 120 * max / span; // ゼロライン
  let s = `<line x1="30" y1="${y0}" x2="316" y2="${y0}" stroke="${C.line}"/><text x="4" y="${y0+3}" font-size="8" fill="${C.sub}">0</text>`;
  rows.forEach((r, i) => {
    const x = 34 + i * bw;
    const h = 120 * Math.abs(r.cum) / span;
    const pos = r.cum >= 0;
    s += `<rect x="${x}" y="${pos ? y0 - h : y0}" width="${bw - 10}" height="${h}" fill="${pos ? C.green : C.red}" rx="2"/>
      <text x="${x + (bw-10)/2}" y="${pos ? y0 - h - 4 : y0 + h + 11}" font-size="8" font-weight="bold" fill="${pos?C.green:C.red}" text-anchor="middle">${r.cum>0?'+':''}${r.cum}</text>
      <text x="${x + (bw-10)/2}" y="178" font-size="8.5" fill="${C.sub}" text-anchor="middle">${r.y}</text>`;
  });
  return `<svg viewBox="0 0 320 190" width="100%"><text x="6" y="14" font-size="10" font-weight="bold" fill="${C.ink}">累積キャッシュフロー(万円)</text>${s}</svg>`;
}

// ---- 10案データ ----
// scheme: 省力化 / 業務改善
// inv: 投資総額(万円), subsidy: 補助上限%, self: 自己/借入負担, saveH: 省力化(h/月), saveY: 年間削減額(万円), roi: 回収年
const PLANS = [
{ no:1, key:"01-ai-multilingual-blog", proto:"01-ai-multilingual-blog.html", scheme:"業務改善",
  title:"AI多言語ブログ自動投稿による情報発信の省力化とインバウンド販路開拓",
  sub:"AIが毎日10言語のブログ記事を自動生成・SEO/MEO最適化し、記事作成の負担ゼロ化と外国人集客を同時に実現する",
  inv:180, invItems:[["AI記事生成・多言語CMSライセンス(3年)","96"],["初期構築・SEO/MEO設定","48"],["多言語予約ページ連携開発","24"],["スタッフ操作研修","12"]],
  saveH:30, saveY:129, roi:1.4, wageUp:70,
  problemLead:"ブログやSNSでの情報発信は集客に不可欠だが、記事作成は1本あたり60〜90分を要し、多言語対応は外注で1言語1万円超。人手で毎日・多言語の発信を続けることは物理的に不可能で、発信が途切れると検索流入も落ちる。",
  kpis:[{label:"記事作成時間",before:30,after:0},{label:"月間投稿数",before:4,after:18},{label:"検索流入(百PV)",before:12,after:48},{label:"外国人予約",before:3,after:23}],
  flow:["予約・トレンド\nデータを取得","AIが日本語\n記事を生成","10言語へAI\nローカライズ","SEO/MEO\n構造化を付与","CMS・GBPへ\n自動投稿"],
  effectRows:[["月間ブログ投稿数","4本","18本","+350%"],["記事1本あたり作業","75分","0分(自動)","▲100%"],["月間検索流入","1,200PV","4,820PV","+302%"],["外国人客の月間予約","3件","23件","+667%"],["情報発信の月間工数","30時間","0時間","▲30h/月"]],
  distinct:"汎用の翻訳ツールと異なり、美容専門用語辞書・現地検索キーワード・通貨/交通/決済情報を自動差し込み、hreflangで10言語を相互リンクした状態で同時公開する点が差別化。既製の予約媒体では取れない海外個人客を直接獲得する。",
  risks:[["AI生成品質のばらつき","公開前に店長承認フローを標準実装。表現・権利リスクをAIが事前審査し、ブランドトーンを学習させ継続改善する。"],["検索アルゴリズム変更","単一チャネル依存を避け、ブログ・GBP・SNS・多言語予約ページに分散。効果測定を週次で行い施策を自動最適化する。"],["多言語対応の誤訳","重要ページは人的レビューを併用。誤訳報告を学習データへ還元する運用体制を敷く。"]],
  ripple:"インバウンド需要が高い当地域において、外国人が安心して利用できる美容室を増やすモデルケースとなる。多言語発信のノウハウは近隣の飲食・小売にも横展開可能で、地域全体のインバウンド受入力向上に寄与する。" },

{ no:2, key:"02-ai-phone-reservation", proto:"02-ai-phone-reservation.html", scheme:"省力化",
  title:"AI電話予約自動応対システム導入による予約受付業務の省力化",
  sub:"施術中の電話対応をAI音声が24時間自動化し、スタッフの作業中断ゼロと営業時間外予約の獲得を両立する",
  inv:320, invItems:[["AI音声応対システム(IP電話・音声認識・3年)","168"],["予約/顧客システム連携開発","78"],["初期設定・シナリオ構築","46"],["導入研修・運用整備","28"]],
  saveH:35, saveY:210, roi:1.5, wageUp:0,
  problemLead:"施術中の電話は美容室最大の作業中断要因。1件平均4.2分の対応がスタイリストの手を止め、施術品質と回転率を下げる。営業時間外や施術集中時の不応答による予約取りこぼしは、機会損失として月間40万円超と試算される。",
  kpis:[{label:"応対工数(h/月)",before:35,after:2},{label:"取りこぼし予約",before:31,after:3},{label:"時間外予約獲得",before:0,after:31},{label:"AI完結率(%)",before:0,after:91}],
  flow:["着信をAIが\n24時間受付","音声認識で\n意図を理解","空き枠を\n自動照会","顧客DB照合\n・予約確定","カルテへ通話\n記録を自動転記"],
  effectRows:[["電話応対の月間工数","35時間","2時間","▲33h/月"],["施術中の作業中断","1日平均9回","0回","▲100%"],["営業時間外の予約獲得","0件","31件/月","新規獲得"],["予約取りこぼし","月31件","月3件","▲90%"],["取りこぼし由来の機会損失","約42.8万円/月","約4万円/月","▲38.8万円"]],
  distinct:"単なる自動音声ではなく、既存顧客を電話番号で判定し前回カルテを踏まえた応対を行う点、通話内容をテキスト化してカルテへ自動記録する点が差別化。予約システムと双方向連携し、ダブルブッキングを構造的に排除する。",
  risks:[["AIが応対できない複雑な要望","AI完結率91%、残る9%は要点を整理して折返しリスト化。クレーム等は即時に人へエスカレーションする。"],["高齢客の音声認識精度","ゆっくりした発話への最適化と、聞き直しシナリオを実装。どの段階でも「スタッフにつなぐ」導線を確保する。"],["システム障害時の受電","障害時は従来の留守番電話へ自動フェイルオーバーし、着信を取りこぼさない冗長構成とする。"]],
  ripple:"人手不足が深刻な美容業界で、受付人員を追加せずに機会損失を防ぐモデルを示す。24時間予約対応は共働き世帯・観光客の利便性を高め、地域の生活サービス基盤の質向上に貢献する。" },

{ no:3, key:"03-ai-counseling-karte", proto:"03-ai-counseling-karte.html", scheme:"省力化",
  title:"AIカウンセリング・施術提案カルテによる接客品質の標準化と記録業務の省力化",
  sub:"顧客写真をAIが解析して施術提案とカルテを自動生成し、提案品質の均一化と閉店後のカルテ残業ゼロを実現する",
  inv:290, invItems:[["AI画像解析・提案エンジン(3年)","150"],["電子カルテ・POS連携開発","74"],["撮影機材(マイクロスコープ等)","38"],["導入研修・スタッフ習熟支援","28"]],
  saveH:25, saveY:174, roi:1.7, wageUp:0,
  problemLead:"カウンセリングは単価と失客を左右する中核業務だが、提案力はスタイリストの経験に依存し品質がばらつく。さらに施術記録(カルテ)は閉店後の手作業となり、1人あたり月20〜25時間のサービス残業を生み、離職の一因にもなっている。",
  kpis:[{label:"カルテ記入(h/月)",before:25,after:2},{label:"新人の提案採用率",before:38,after:71},{label:"客単価(千円)",before:96,after:112},{label:"指名リピート率",before:54,after:69}],
  flow:["顧客写真を\nAI解析","髪質・肌・顔型\nを数値診断","禁忌・アレル\nギーを自動照合","根拠付き施術\n提案を生成","確定内容を\nカルテ自動記録"],
  effectRows:[["カルテ記入の月間工数","25時間/人","2時間/人","▲23h/月"],["提案品質のばらつき","経験依存","AI標準化","均一化"],["新人スタイリストの提案採用率","38%","71%","+87%"],["平均客単価","9,600円","11,200円","+16.7%"],["アレルギー等の施術事故","年2件","0件","▲100%"]],
  distinct:"接客の属人化という業界積年の課題に対し、AIが診断根拠を可視化して提案する点が差別化。新人でもベテラン級の提案が可能になり、育成期間を短縮。カルテ自動化と提案高度化を1システムで同時に達成する。",
  risks:[["AI診断の医療類似リスク","あくまで施術提案の補助であり診断行為ではない旨を明記。禁忌照合は安全側に倒し、判断は有資格者が行う運用とする。"],["写真データのプライバシー","顧客同意取得を必須化し、画像は暗号化保管。SNS二次利用は同意済みのみを対象とする。"],["スタッフの提案力低下懸念","AIは根拠を提示する教育ツールとして機能させ、若手の学習を促進する設計とする。"]],
  ripple:"接客品質の標準化は、経験の浅い人材でも活躍できる職場を生み、美容業界の人材不足と育成長期化の緩和に資する。診断データの蓄積は、地域顧客の毛髪・頭皮健康の向上にもつながる。" },

{ no:4, key:"04-ai-meo-review", proto:"04-ai-meo-review.html", scheme:"業務改善",
  title:"口コミAI自動返信とMEO最適化による集客業務の省力化と新規顧客獲得",
  sub:"Google口コミへのAI自動返信とビジネスプロフィール運用を自動化し、地図検索順位と新規予約を継続的に高める",
  inv:150, invItems:[["口コミAI返信・MEO運用ツール(3年)","84"],["GBP・予約システム連携","30"],["初期設定・分析基盤構築","22"],["運用研修","14"]],
  saveH:12, saveY:96, roi:1.6, wageUp:70,
  problemLead:"地図検索(MEO)は新規来店の最大の導線だが、口コミへの返信・写真投稿・情報更新には月12時間を要し、多忙な現場では後回しになりがち。返信率の低下や情報の陳腐化は検索順位を下げ、新規客の減少に直結する。",
  kpis:[{label:"MEO順位",before:14,after:3},{label:"口コミ返信率(%)",before:40,after:100},{label:"星評価",before:42,after:48},{label:"地図経由予約",before:13,after:34}],
  flow:["新着口コミ・\n検索動向を取得","AIが個別返信\n下書きを生成","(ネガは店長承認)\n自動投稿","GBP情報・写真\nを自動更新","順位・評判を\n分析しレポート"],
  effectRows:[["MEO運用の月間工数","12時間","1時間","▲11h/月"],["「地域名+美容室」検索順位","14位","3位","▲11位"],["口コミ返信率","40%","100%","+150%"],["平均星評価","4.2","4.8","+0.6"],["地図経由の新規予約","13件/月","34件/月","+162%"]],
  distinct:"返信・投稿・分析・順位追跡を1つで自動化し、ネガティブ口コミのみ人的承認を挟む安全設計が差別化。効果が順位・件数で定量的に測れるため、業務改善助成金の生産性向上要件を数値で説明しやすい。",
  risks:[["不適切なAI返信による炎上","ネガティブ口コミは自動投稿せず必ず店長承認。表現リスクをAIが事前審査する二重チェック体制とする。"],["プラットフォーム規約変更","GBPの規約順守を前提に運用。複数の集客チャネルへ分散し、単一依存リスクを抑える。"],["やらせ口コミの誤解","口コミ依頼は満足客への正当な促進に限定し、内容誘導や対価付与は行わない運用ルールを徹底する。"]],
  ripple:"適切な口コミ運用の普及は、地域の消費者が正確な情報で店を選べる環境づくりに貢献する。MEO最適化のノウハウは商店街の他業種にも展開でき、地域商業の集客力底上げにつながる。" },

{ no:5, key:"05-ai-short-video", proto:"05-ai-short-video.html", scheme:"業務改善",
  title:"施術動画ショートAI自動編集による動画制作の省力化とSNS集客強化",
  sub:"撮影素材からAIがショート動画を自動編集・多媒体投稿し、動画編集の負担ゼロ化と若年層集客を実現する",
  inv:160, invItems:[["AI動画編集・自動投稿システム(3年)","90"],["撮影機材・スタジオ照明","34"],["初期設定・テンプレ構築","22"],["運用研修","14"]],
  saveH:15, saveY:108, roi:1.5, wageUp:70,
  problemLead:"ショート動画は若年層集客に極めて有効だが、編集は1本2〜3時間の重負荷業務。専任者を置けない小規模店では継続的な投稿ができず、SNS集客の機会を逃している。撮影しても編集が追いつかず素材が死蔵される。",
  kpis:[{label:"動画編集(h/月)",before:15,after:0},{label:"月間投稿本数",before:2,after:12},{label:"リール経由予約",before:1,after:9},{label:"新規客の20代比率",before:18,after:34}],
  flow:["施術風景を\n撮影(そのまま)","AIがベスト\nシーンを抽出","テロップ・BGM\nを自動付与","多言語キャプ\nション生成","4媒体へ最適\nサイズで投稿"],
  effectRows:[["動画編集の月間工数","15時間","0時間","▲15h/月"],["月間ショート動画投稿","2本","12本","+500%"],["リール経由の新規予約","1件/月","9件/月","+800%"],["新規客の20代以下比率","18%","34%","+16pt"],["1本あたり編集コスト","約6,000円","0円","▲100%"]],
  distinct:"撮影するだけで抽出・編集・テロップ・BGM・多媒体投稿まで全自動化する点が差別化。トレンド音源の自動選定と日英キャプション同時生成により、専任編集者なしで継続的なSNS発信を可能にする。",
  risks:[["写り込み・権利侵害","投稿前にAIが顧客の写り込みと音源権利を審査。顧客の撮影同意取得を運用フローに組み込む。"],["トレンドの陳腐化","AIが最新のトレンド構成・音源を継続学習。効果の低い型は自動的に淘汰する。"],["炎上リスク","公開前の店長承認と表現審査を標準化。ブランドを毀損する表現を事前に排除する。"]],
  ripple:"小規模事業者でも継続的な動画発信を可能にし、地域の美容室の情報発信力を底上げする。若年層の来店促進は地域商業の活性化に寄与し、動画制作ノウハウは他のサービス業にも波及する。" },

{ no:6, key:"06-ai-auto-order", proto:"06-ai-auto-order.html", scheme:"省力化",
  title:"薬剤・材料AI自動発注システムによる在庫管理業務の省力化",
  sub:"POS・カルテ連動で使用量をAIが予測し発注・棚卸を自動化、作業時間削減と在庫金額・廃棄ロスの圧縮を実現する",
  inv:240, invItems:[["AI需要予測・自動発注システム(3年)","120"],["POS・カルテ・在庫連携開発","62"],["棚卸用画像認識・機器","34"],["導入研修","24"]],
  saveH:18, saveY:144, roi:1.7, wageUp:0,
  problemLead:"薬剤・材料の発注と棚卸は月18時間のノンコア業務。勘に頼った発注は過剰在庫による資金の固定化(約32万円)と、使用期限切れの廃棄ロスを生む。一方で欠品は施術不能という致命的な機会損失に直結する。",
  kpis:[{label:"発注・棚卸(h/月)",before:18,after:2},{label:"在庫金額指数",before:100,after:77},{label:"廃棄ロス(件/月)",before:6,after:0},{label:"欠品による施術不可",before:4,after:0}],
  flow:["予約メニューと\n調合レシピ取得","AIが使用量を\n予測","適正在庫と\n差分を算出","最安ルートで\n発注書を生成","入荷を在庫へ\n自動反映"],
  effectRows:[["発注・棚卸の月間工数","18時間","2時間","▲16h/月"],["在庫金額","基準100","77","▲23%"],["使用期限切れ廃棄","月6件","0件","▲100%"],["欠品による施術不可","月4件","0件","▲100%"],["仕入コスト(相見積り効果)","基準","▲4.2%","コスト減"]],
  distinct:"単純な発注点管理ではなく、予約メニューと調合レシピから実使用量を予測し、天候(梅雨の縮毛矯正需要増など)まで学習する点が差別化。複数ディーラーの価格を比較し最安・送料最適の発注書を自動生成する。",
  risks:[["予測外れによる欠品","安全在庫をAIが動的設定し、予測信頼度が低い品目は発注量に余裕を持たせる。手動上書きも可能とする。"],["ディーラー連携の制約","主要ディーラーのEDI/メール発注に対応。非対応先は発注書PDF自動生成で運用を吸収する。"],["新商材への未対応","導入初期は使用量データが少ないため、類似商材から初期値を推定し3か月で精度を高める。"]],
  ripple:"廃棄ロス削減は環境負荷の低減に直結し、SDGsに配慮した店舗運営のモデルとなる。在庫最適化のノウハウはネイル・エステ等の物販を伴うサービス業へ広く展開可能である。" },

{ no:7, key:"07-ai-shift-romu", proto:"07-ai-shift-romu.html", scheme:"省力化",
  title:"AIシフト自動作成・労務アラートシステムによる労務管理業務の省力化",
  sub:"予約需要と法令要件を加味したシフトをAIが自動作成し、作成時間の大幅短縮と労務コンプライアンスの向上を両立する",
  inv:210, invItems:[["AIシフト最適化・労務管理システム(3年)","108"],["勤怠・予約システム連携開発","54"],["就業規則ロジック実装(社労士監修)","30"],["導入研修","18"]],
  saveH:20, saveY:150, roi:1.4, wageUp:0,
  problemLead:"シフト作成は店長業務の最大負荷の一つで、希望休・指名確保・技術配置・法令を同時に満たす調整に月20時間超。手作業では連勤超過や残業過多、有給5日義務の未達といった労務リスクを見落としやすく、労使トラブルの温床となる。",
  kpis:[{label:"シフト作成(h/月)",before:20,after:1},{label:"労務違反の見落とし",before:5,after:0},{label:"急な欠員の充足率(%)",before:60,after:98},{label:"残業時間(h/月)",before:41,after:29}],
  flow:["予約需要を\nAIが予測","希望休・指名\nを自動集約","技術レベルで\n人員を最適配置","労働時間・休憩\nを法令チェック","違反を自動修正\nし全員へ配信"],
  effectRows:[["シフト作成の月間工数","20時間","1時間","▲19h/月"],["連勤・残業等の労務違反見落とし","月5件","0件","▲100%"],["急な欠員のカバー率","60%","98%","+38pt"],["スタッフ1人月間残業","41時間","29時間","▲12h"],["有給5日義務の未達","年2件","0件","▲100%"]],
  distinct:"シフト最適化に加え、36協定・勤務間インターバル・有給義務・事業場内最低賃金を社労士監修ロジックで常時チェックする点が差別化。省力化と労務コンプラ・賃上げ要件管理を1システムで達成する。",
  risks:[["最適化がスタッフ希望と不一致","希望休・勤務条件を制約条件として厳守。AI案は店長が最終調整でき、納得感を担保する。"],["法改正への追随","就業規則ロジックは社労士監修で定期更新。法改正時はルールセットを速やかに反映する。"],["現場の柔軟性低下","急な欠員にはヘルプ人員を自動マッチング。例外運用を許容する設計で現場の柔軟性を保つ。"]],
  ripple:"適正な労務管理の自動化は、長時間労働が課題とされる美容業界の働き方改革を後押しする。法令順守と働きやすさの両立は人材定着に寄与し、地域の雇用の質の向上につながる。" },

{ no:8, key:"08-ai-training-video", proto:"08-ai-training-video.html", scheme:"業務改善",
  title:"技術教育動画AI自動生成システムによる人材育成の省力化と生産性向上",
  sub:"熟練者の施術動画をAIが教材化し、指導時間の削減とデビュー期間の短縮で一人当たり付加価値を高める",
  inv:170, invItems:[["AI動画教材生成・学習管理システム(3年)","96"],["撮影機材・編集基盤","34"],["初期教材ライブラリ構築","26"],["運用研修","14"]],
  saveH:24, saveY:130, roi:1.6, wageUp:70,
  problemLead:"美容師のスタイリストデビューには平均3年超を要し、育成はベテランのマンツーマン指導に依存する。指導はベテランの施術時間を奪い、店全体の生産性を下げる。育成の長期化と、退職に伴う技術・ノウハウの喪失が業界共通の課題である。",
  kpis:[{label:"指導時間(h/週)",before:9,after:3},{label:"デビュー期間(年)",before:32,after:24},{label:"教材ライブラリ(本)",before:0,after:52},{label:"新人習熟度(%)",before:45,after:78}],
  flow:["熟練者の施術\n動画を撮影","AIがシーン\n分割・章立て","字幕・重要\n点を自動抽出","確認クイズを\n自動生成","習熟度を管理\n・弱点を提示"],
  effectRows:[["マンツーマン指導時間","週9時間","週3時間","▲6h/週"],["スタイリストデビュー期間","3.2年","2.4年","▲0.8年"],["教材ライブラリ","0本","52本(自動)","資産化"],["新人の技術習熟度","45%","78%","+33pt"],["退職時の技術ノウハウ喪失","都度発生","アーカイブ済","損失防止"]],
  distinct:"熟練者の動画から章立て・字幕・重要ポイント・確認クイズまで全自動生成する点が差別化。指導時間を削減しながら育成を高速化し、退職前のベテラン技術をアーカイブして暗黙知を組織資産に転換する。",
  risks:[["動画だけでは伝わらない技術","動画教材は反復学習の基盤とし、実技指導と併用。AIが習熟度を可視化し指導を弱点に集中させる。"],["ベテランの協力が得られない","教材化はベテランの負担を増やさず(撮るだけ)、指導負荷を減らすメリットを丁寧に説明し協力を得る。"],["教材の陳腐化","トレンド技術は随時撮影・追加。AIが古い教材を検出し更新を促す運用とする。"]],
  ripple:"育成の効率化と技術の資産化は、人材不足と技術継承が課題の美容業界に持続可能な育成モデルを示す。一人当たり付加価値の向上は賃上げの原資となり、地域の雇用の質を高める好循環を生む。" },

{ no:9, key:"09-ai-accounting", proto:"09-ai-accounting.html", scheme:"省力化",
  title:"レジ締め・記帳AI自動化システムによる経理・バックオフィス業務の省力化",
  sub:"POSとキャッシュレス明細をAIが自動突合してレジ締め・仕訳・日報を完結し、日次事務の削減と月次決算の早期化を実現する",
  inv:200, invItems:[["AIレジ締め・自動記帳システム(3年)","102"],["POS・キャッシュレス・会計連携開発","56"],["初期設定・仕訳ルール構築","26"],["導入研修","16"]],
  saveH:20, saveY:132, roi:1.5, wageUp:0,
  problemLead:"レジ締めと記帳は毎日必ず発生する業務で、閉店後に毎日25〜35分、月20時間を要する。複数のキャッシュレス決済の突合や現金差異の調査は煩雑で、経理入力の負担と月次試算表の遅れが、タイムリーな経営判断を妨げている。",
  kpis:[{label:"事務時間(h/月)",before:20,after:2},{label:"レジ締め(分/日)",before:30,after:3},{label:"月次試算完成(日)",before:10,after:2},{label:"記帳ミス(件/月)",before:8,after:0}],
  flow:["POS・決済明細\nを自動取得","AIが自動\n突合・照合","差異を検知し\n原因を特定","仕訳を生成し\n会計ソフト連携","日報・月次\nを自動作成"],
  effectRows:[["経理・レジ締めの月間工数","20時間","2時間","▲18h/月"],["1日のレジ締め時間","30分","3分","▲27分/日"],["月次試算表の完成","翌月10日","翌月2日","8日早期化"],["記帳ミス","月8件","0件","▲100%"],["現金差異の原因特定","手作業で困難","自動特定","即時化"]],
  distinct:"POSと複数キャッシュレスの自動突合に加え、現金差異をレジ映像のタイムスタンプ照合で原因特定する点が差別化。仕訳・日報・月次サマリーを自動生成し税理士へ共有、月次決算を早期化して経営判断を加速する。",
  risks:[["自動仕訳の誤り","AI仕訳は税理士のレビューを前提とし、勘定科目ルールを継続学習。異常値は自動でフラグ立てする。"],["決済サービスの仕様変更","主要キャッシュレス各社のAPI/明細形式に対応し、変更時は速やかにコネクタを更新する。"],["セキュリティ","売上・決済データは暗号化通信・保管。アクセス権限を役割別に管理する。"]],
  ripple:"バックオフィスの自動化は、経営者が数字に基づく意思決定を行える基盤を作る。月次決算の早期化は金融機関との関係強化や資金調達の円滑化に資し、地域の小規模事業者の経営力向上に貢献する。" },

{ no:10, key:"10-ai-repeat-follow", proto:"10-ai-repeat-follow.html", scheme:"業務改善",
  title:"リピート予測・AI再来店フォローシステムによる顧客維持業務の省力化とLTV向上",
  sub:"来店周期をAIが学習し離反前に最適タイミングで自動フォローすることで、失客防止とフォロー業務の自動化を両立する",
  inv:150, invItems:[["AIリピート予測・自動配信システム(3年)","84"],["顧客・予約・LINE連携開発","32"],["初期設定・セグメント構築","20"],["運用研修","14"]],
  saveH:12, saveY:110, roi:1.4, wageUp:70,
  problemLead:"新規獲得コストが高騰する中、既存客の失客防止は最も費用対効果の高い投資である。しかし顧客ごとの来店周期を把握し、適切なタイミングで個別フォローを行う作業は月12時間を要し、多忙な現場では実施しきれず失客が放置されている。",
  kpis:[{label:"再来店率(%)",before:54,after:68},{label:"失客率(%)",before:32,after:18},{label:"フォロー工数(h/月)",before:12,after:0},{label:"平均LTV指数",before:100,after:122}],
  flow:["来店履歴・周期\nをAIが学習","離反リスクを\nスコア化","最適タイミング\nを判定","個別メッセージ\nを自動生成","LINE/メールで\n自動配信"],
  effectRows:[["フォロー業務の月間工数","12時間","0時間","▲12h/月"],["90日再来店率","54%","68%","+14pt"],["月間失客率","32%","18%","▲14pt"],["休眠客の掘り起こし","ほぼ不可","29名/月","新規復帰"],["平均顧客生涯価値(LTV)","8.9万円","10.9万円","+22%"]],
  distinct:"来店周期の個別学習と離反リスクのスコアリングにより、離れる前に先手を打つ点が差別化。過剰配信の『うざさ』も学習して接触回数を上限管理し、既存の顧客・LINE資産だけで動くため実現性が高い。",
  risks:[["配信過多による顧客離れ","1顧客あたり月間接触回数をAIが上限管理し、安定リピーターは配信対象から自動除外する。"],["個人情報・配信規約","LINE公式アカウントの規約とオプトインを順守。配信停止を容易にし、同意ベースで運用する。"],["割引依存の収益悪化","クーポンは離反リスク高の顧客に限定。割引率と再来効果をAIが分析し利益を守る設計とする。"]],
  ripple:"顧客一人ひとりに寄り添う関係構築の自動化は、地域に根ざしたサービス業の顧客基盤を安定させる。LTV向上は経営の安定を通じて雇用維持に資し、失客防止のノウハウは地域の他サービス業へ展開できる。" },
];

// ---- 制度別パラメータ ----
function schemeInfo(scheme, p) {
  if (scheme === "省力化") {
    // モデル事業者は従業員5名の小規模事業者なので 2/3 で計算する。
    // 文言では「小規模事業者 2/3」と書きながら金額は 0.5 で計算しており、
    // 計画書の中で補助率と補助額が食い違っていた（2026-08-16に修正）。
    //
    // rate の先頭は実際に適用する率にしておくこと。資金計画の表が
    // `s.rate.split("(")[0]` で先頭を取ってラベルにしているので、ここを
    // "1/2(小規模事業者 2/3)" にすると「補助金(1/2)」と書いて 2/3 の額を出す
    // という食い違いが生まれる。
    const rate = "2/3(小規模事業者。中小企業は1/2)";
    const subAmt = Math.round(p.inv * 2 / 3);
    return {
      badge: "中小企業省力化投資補助金(一般型)", color: C.green,
      rate, subAmt, self: p.inv - subAmt,
      cap: "従業員規模に応じ最大1億円(大幅賃上げ特例で上限引上げ)",
      wage: "【大幅賃上げ特例(任意)】最低賃金+3.0%/年・給与総額+3.5%/年で補助上限額が引上げ(補助率は変わらない)。本モデルは小規模事業者のため補助率2/3",
      audit: "省力化(労働生産性の向上)を定量的に示せるか。付加価値額の年平均成長率など事業計画の妥当性・実現可能性。",
    };
  }
  if (scheme === "AI導入") {
    // デジタル化・AI導入補助金2026（通常枠）。補助率1/2以内・450万円まで。
    // 150万円以上を申請するときは共P-01〜汎P-07のうち4種類以上を含む必要がある
    // （公募要領2-3）。対象は事務局に事前登録されたITツールに限られ、IT導入支援事業者
    // との共同申請が必須。2026-08-16にITツール検索を実ブラウザで確認し、予約・カルテ/CRM・
    // 在庫・シフト勤怠・会計POSの各用途に登録ツールが実在することを確認済み。
    const subAmt = Math.min(450, Math.round(p.inv * 0.5));
    return {
      badge: "デジタル化・AI導入補助金2026(通常枠)", color: C.navy,
      rate: "1/2以内(最低賃金近傍の従業員が3割以上の月が3か月以上あれば2/3以内)",
      subAmt, self: p.inv - subAmt,
      cap: "450万円(通常枠)。150万円以上の申請は4プロセス以上が必要",
      wage: "【150万円以上は必須要件】給与支給総額の増加等の賃上げ目標。150万円未満は加点項目。"
        + "ただしIT導入補助金2022〜2025で交付決定を受けた事業者は金額にかかわらず必須要件になる。",
      audit: "登録済ITツールであること、導入プロセスが対象区分に該当すること、"
        + "生産性向上の目標設定と実現可能性。交付決定前に契約・発注すると対象外になる。",
    };
  }
  if (scheme === "持続化") {
    // 小規模事業者持続化補助金（第20回・通常枠）。補助率2/3・上限50万円。
    // 「販路開拓」が主軸で、業務効率化だけの計画は対象にならない（公募要領p.5）。
    // 美容業は「商業・サービス業（宿泊業・娯楽業を除く）」なので常時使用する従業員5人以下が要件。
    const subAmt = Math.min(50, Math.round(p.inv * 2 / 3));
    return {
      badge: "小規模事業者持続化補助金(第20回・通常枠)", color: C.gold,
      rate: "2/3(賃金引上げ特例のうち赤字事業者は3/4)",
      subAmt, self: p.inv - subAmt,
      cap: "50万円(インボイス特例+50万円、賃金引上げ特例+150万円で最大250万円)",
      wage: "【任意】賃金引上げ特例(事業場内最低賃金を地域別最低賃金+50円以上)を使うと上限が+150万円。"
        + "表明した賃金水準が未達だと補助金が支給されない。",
      audit: "販路開拓の取組であること(業務効率化のみの計画は対象外)。"
        + "商工会議所・商工会の事業支援計画書(様式4)の発行が必須で、締切より前に発行期限が来る。"
        + "広報費・ウェブサイト関連費はそれぞれ上限30万円かつ単独申請不可。",
    };
  }
  const before = WAGE_BEFORE, up = p.wageUp;
  const subAmt = Math.min(KAIZEN_CAP, Math.round(p.inv * 0.75));
  return {
    badge: "業務改善助成金", color: C.gold,
    // 補助率は「引き上げ前」の事業場内最低賃金で判定する（ご案内PDF 3ページ目の計算例）。
    // このモデルは 1,230円 なので常に 3/4 側になる。
    rate: before < 1050 ? "4/5(引上げ前の事業場内最低賃金が1,050円未満)"
                        : "3/4(引上げ前の事業場内最低賃金が1,050円以上)",
    subAmt, self: p.inv - subAmt,
    // 上限額はコース・引き上げる人数・事業場規模で決まる（ご案内PDF 2ページ目）。
    // 「最大600万円」は特例事業者が10人以上を引き上げる場合の額で、従業員5名のモデルでは
    // 届かないため、実際に適用される区分の額を書く。
    cap: `${KAIZEN_CAP}万円(30人未満の事業場・${up}円コース・4〜6人を引上げる場合)`,
    wage: `【必須要件】${up}円コース: 事業場内最低賃金を${up}円以上引き上げ`
      + `(本計画: ${nfWage(before)}円→${nfWage(before + up)}円)。`
      + "生産性向上に資する設備投資等が対象。申請は令和8年9月1日から、"
      + "地域別最低賃金の発効日前日まで(同一事業場につき年度内1回)。",
    audit: "事業場内最低賃金の引上げと、生産性向上に資する設備投資等の因果関係。投資による業務改善効果の具体性。",
  };
}

// ---- ページ枠 ----
function page(no, total, title, bodyHtml, foot) {
  return `<section class="page">
    <div class="ph"><span class="ph-t">${title}</span><span class="ph-n">${no} / ${total}</span></div>
    <div class="pbody">${bodyHtml}</div>
    <div class="pf"><span>${BIZ.name} 事業計画書</span><span>${foot || ""}</span></div>
  </section>`;
}

// ---- 各計画書HTMLを生成 ----
function buildPlan(p) {
  const s = schemeInfo(p.scheme, p);
  const total = 10;
  const invRows = p.invItems.map(([k, v]) => `<tr><td>${k}</td><td class="num">${v}万円</td></tr>`).join("");
  // 投資回収の累積CFを計算(初年度は投資控除、以降は年間削減額 - 保守運用費)
  const opex = Math.round(p.saveY * 0.18);
  const netY = p.saveY - opex;
  const cf = [];
  let cum = -s.self;
  cf.push({ y: "導入時", cum: Math.round(cum) });
  for (let y = 1; y <= 4; y++) { cum += netY; cf.push({ y: `${y}年目`, cum: Math.round(cum) }); }

  const P1 = `
    <div class="hero">
      <div class="hero-badge" style="background:${s.color}">${s.badge} 申請</div>
      <h1>${p.title}</h1>
      <p class="hero-sub">${p.sub}</p>
    </div>
    <div class="split">
      <div class="half">
        <h3>申請者概要</h3>
        <table class="kv">
          <tr><td>事業者名</td><td>${BIZ.name}(デモ)</td></tr>
          <tr><td>業種</td><td>${BIZ.type}</td></tr>
          <tr><td>所在地</td><td>${BIZ.area}</td></tr>
          <tr><td>従業員数</td><td>${BIZ.staff}名</td></tr>
          <tr><td>創業</td><td>${BIZ.founded}</td></tr>
          <tr><td>年商</td><td>${BIZ.sales}</td></tr>
        </table>
      </div>
      <div class="half">
        <h3>本事業のサマリー</h3>
        <table class="kv">
          <tr><td>投資総額</td><td><b>${p.inv}万円</b></td></tr>
          <tr><td>補助率</td><td>${s.rate}</td></tr>
          <tr><td>補助見込</td><td><b style="color:${s.color}">${s.subAmt}万円</b></td></tr>
          <tr><td>自己負担</td><td>${s.self}万円</td></tr>
          <tr><td>省力化効果</td><td>約${p.saveH}時間/月</td></tr>
          <tr><td>投資回収</td><td>約${p.roi}年</td></tr>
        </table>
      </div>
    </div>
    <div class="figbox">
      ${barChart("本事業の主要KPI(導入前→導入後)", p.kpis, "指標")}
    </div>
    <p class="lead">${p.problemLead}</p>
    <div class="callout"><b>本事業の狙い:</b> ${p.sub}。省力化により生み出した時間を、より付加価値の高い接客・技術・提案へ再配分し、一人当たり労働生産性と従業員の処遇改善を同時に実現する。</div>`;

  const P2 = `
    <div class="split">
      <div class="half">
        <p class="lead">${p.problemLead}</p>
        <h3>現状の労働実態(課題の定量化)</h3>
        <table class="data">
          <tr><th>項目</th><th>現状</th></tr>
          <tr><td>対象業務の月間工数</td><td>約${p.saveH + 2}時間</td></tr>
          <tr><td>担当</td><td>店長・スタイリストが兼務</td></tr>
          <tr><td>発生タイミング</td><td>営業時間中/閉店後の残業</td></tr>
          <tr><td>属人性</td><td>高(特定者に依存)</td></tr>
          <tr><td>ミス・機会損失</td><td>恒常的に発生</td></tr>
        </table>
      </div>
      <div class="half">
        <div class="figbox">${donutRow(p)}</div>
        <div class="callout small">対象業務は付加価値を生まない間接業務でありながら、貴重な有資格者の時間を奪っている。この時間を施術・提案・育成へ振り向けることが、生産性向上と賃上げ原資の確保に直結する。</div>
      </div>
    </div>
    <h3>課題の構造(なぜ今、投資が必要か)</h3>
    <div class="figbox">${problemTree(p)}</div>
    <p class="note">※ 本計画の数値は業界実態に基づくデモ用の仮置きです。実申請時には自社の勤怠記録・POS実績等の裏付けデータに差し替えます。</p>`;

  const P3 = `
    <h3>導入システムと省力化プロセス</h3>
    <p class="lead">本事業では、${p.title.replace(/による.*/, "")}を導入する。人手で行ってきた一連の業務をAIが自動実行し、担当者は最終確認・承認のみを行う体制へ移行する。</p>
    <div class="figbox big">${flow(p.flow)}</div>
    <div class="split">
      <div class="half">
        <h3>Before:現行フロー(人手)</h3>
        <ul class="ul">
          <li>担当者が手作業で全工程を実施</li>
          <li>作業は営業時間・閉店後を圧迫</li>
          <li>品質・スピードが担当者に依存</li>
          <li>記録・転記漏れやミスが発生</li>
        </ul>
      </div>
      <div class="half">
        <h3>After:AI自動化フロー</h3>
        <ul class="ul on">
          <li>AIが自動実行、担当は承認のみ</li>
          <li>24時間・無人でも業務が進行</li>
          <li>品質を標準化・均一化</li>
          <li>記録は自動化しミスを排除</li>
        </ul>
      </div>
    </div>
    <div class="callout"><b>実機デモ:</b> 本システムの動作は付属のプロトタイプ(prototypes/${p.proto})で確認できる。実際の画面遷移・AI出力・効果数値を再現しており、審査における実現可能性の裏付けとする。</div>`;

  const P4 = `
    <h3>労働生産性向上の定量根拠</h3>
    <div class="figbox">${barChart("導入前後の業務指標比較", p.kpis, "")}</div>
    <table class="data wide">
      <tr><th>指標</th><th>導入前</th><th>導入後</th><th>改善</th></tr>
      ${p.effectRows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td><b>${r[2]}</b></td><td class="up">${r[3]}</td></tr>`).join("")}
    </table>
    <div class="split">
      <div class="half">
        <div class="callout small"><b>労働生産性の算定:</b> 月間${p.saveH}時間の省力化を年換算すると約${p.saveH * 12}時間。これを平均時間単価で換算し、生み出した時間の付加価値創出への再配分と合わせ、一人当たり付加価値額の年平均成長率+${(3 + p.no % 3)}%以上を見込む。</div>
      </div>
      <div class="half">
        <div class="callout small"><b>売上・利益への波及:</b> 削減時間の高付加価値業務への再配分と、本システムによる直接的な売上効果(機会損失の回収・客単価向上等)により、年間約${p.saveY}万円の収益改善を見込む。</div>
      </div>
    </div>`;

  const P5 = `
    <h3>賃上げ計画(処遇改善)</h3>
    <div class="callout" style="border-color:${s.color}"><b>${s.badge}の賃金要件:</b> ${s.wage}</div>
    <div class="split">
      <div class="half">
        <h3>賃金引上げ計画</h3>
        <table class="data">
          <tr><th>区分</th><th>現行</th><th>計画</th></tr>
          <tr><td>事業場内最低賃金</td><td>${nfWage(WAGE_BEFORE)}円</td><td><b>${nfWage(WAGE_BEFORE + wageUpOf(p))}円</b></td></tr>
          <tr><td>引上げ額</td><td>—</td><td>+${wageUpOf(p)}円</td></tr>
          <tr><td>給与総額</td><td>基準</td><td>+3.5%/年</td></tr>
          <tr><td>対象者</td><td colspan="2">全従業員(雇用保険被保険者)</td></tr>
        </table>
      </div>
      <div class="half">
        <div class="figbox">${wageChart(p)}</div>
      </div>
    </div>
    <h3>社会保険労務士の視点(処遇改善の実効性)</h3>
    <ul class="ul on">
      <li><b>原資の確保:</b> 本事業の省力化で生じた利益を賃上げ原資に充当し、無理のない持続的な賃金引上げを実現する。</li>
      <li><b>就業規則の整備:</b> 賃金規程を改定し、事業場内最低賃金の引上げを規程上も明確化。労働条件通知書へ反映する。</li>
      <li><b>労働時間の適正化:</b> 省力化で残業を圧縮し、勤務間インターバルと有給取得を促進。働きやすさと処遇の両面で職場を改善する。</li>
    </ul>`;

  const P6 = `
    <h3>資金計画・投資回収(税理士の視点)</h3>
    <div class="split">
      <div class="half">
        <h3>投資内訳</h3>
        <table class="data">
          <tr><th>項目</th><th class="num">金額</th></tr>
          ${invRows}
          <tr class="sum"><td>投資総額</td><td class="num">${p.inv}万円</td></tr>
          <tr><td>補助金(${s.rate.split("(")[0]})</td><td class="num" style="color:${s.color}">▲${s.subAmt}万円</td></tr>
          <tr class="sum"><td>自己負担額</td><td class="num">${s.self}万円</td></tr>
        </table>
      </div>
      <div class="half">
        <h3>資金調達</h3>
        <table class="data">
          <tr><td>補助金</td><td class="num">${s.subAmt}万円</td></tr>
          <tr><td>自己資金</td><td class="num">${Math.round(s.self * 0.5)}万円</td></tr>
          <tr><td>金融機関借入</td><td class="num">${s.self - Math.round(s.self * 0.5)}万円</td></tr>
        </table>
        <div class="callout small">補助金は精算払いのため、つなぎ資金を金融機関借入で確保。返済は本事業の収益改善キャッシュフローで賄う計画とし、資金繰りの安全性を確保する。</div>
      </div>
    </div>
    <div class="figbox">${cfChart(cf)}</div>
    <table class="data wide">
      <tr><th>区分</th><th>導入時</th><th>1年目</th><th>2年目</th><th>3年目</th></tr>
      <tr><td>収益改善効果</td><td>—</td><td>${p.saveY}万円</td><td>${p.saveY}万円</td><td>${p.saveY}万円</td></tr>
      <tr><td>保守・運用費</td><td>—</td><td>▲${opex}万円</td><td>▲${opex}万円</td><td>▲${opex}万円</td></tr>
      <tr><td>減価償却(定額・${p.scheme === "省力化" ? "5年" : "5年"})</td><td>—</td><td>${Math.round(p.inv/5)}万円</td><td>${Math.round(p.inv/5)}万円</td><td>${Math.round(p.inv/5)}万円</td></tr>
      <tr class="sum"><td>年間純効果</td><td>▲${s.self}万円</td><td>+${netY}万円</td><td>+${netY}万円</td><td>+${netY}万円</td></tr>
    </table>
    <p class="note">投資回収期間 約${p.roi}年(自己負担ベース)。税務上はソフトウェア等を無形固定資産として計上し定額法で償却。中小企業向け税制の活用余地も税理士と精査する。</p>`;

  const P7 = `
    <h3>実施体制・スケジュール</h3>
    <div class="figbox big">${timeline([
      {m:"1か月目", label:"交付決定後\n要件定義"},
      {m:"2-3か月", label:"システム構築\n既存連携"},
      {m:"4か月目", label:"試験運用\nデータ移行"},
      {m:"5か月目", label:"スタッフ研修\n本稼働"},
      {m:"6か月〜", label:"効果測定\n改善運用"},
    ])}</div>
    <div class="split">
      <div class="half">
        <h3>実施体制</h3>
        <table class="data">
          <tr><th>役割</th><th>担当</th></tr>
          <tr><td>統括責任者</td><td>代表者</td></tr>
          <tr><td>現場推進</td><td>店長</td></tr>
          <tr><td>システム導入</td><td>ベンダー+IT担当</td></tr>
          <tr><td>効果測定</td><td>店長+顧問税理士</td></tr>
          <tr><td>労務・賃上げ</td><td>顧問社会保険労務士</td></tr>
        </table>
      </div>
      <div class="half">
        <h3>専門家連携</h3>
        <ul class="ul on">
          <li><b>中小企業診断士:</b> 事業計画の実現性・生産性向上効果を監修</li>
          <li><b>税理士:</b> 資金計画・投資回収・減価償却・補助金経理を支援</li>
          <li><b>社会保険労務士:</b> 賃上げ計画・就業規則・労務要件を監修</li>
          <li><b>ITベンダー:</b> システム構築・保守・運用定着を担当</li>
        </ul>
      </div>
    </div>
    <div class="callout small"><b>交付決定前の発注厳禁:</b> 本事業の設備投資・契約は必ず交付決定後に着手する(事前着手は補助対象外)。スケジュールは交付決定を起点として設計している。</div>`;

  const P8 = `
    <h3>リスクと対応策</h3>
    <table class="data wide">
      <tr><th>想定リスク</th><th>対応策</th></tr>
      ${p.risks.map(r => `<tr><td style="width:34%"><b>${r[0]}</b></td><td>${r[1]}</td></tr>`).join("")}
      <tr><td><b>導入が定着しない</b></td><td>スタッフ研修と段階導入で現場負担を抑え、KPIを可視化して効果を実感させる。ベンダーの伴走支援を契約に含める。</td></tr>
      <tr><td><b>効果が計画に届かない</b></td><td>月次でKPIをモニタリングし、AIの学習・設定を継続改善。四半期ごとにPDCAを回して軌道修正する。</td></tr>
    </table>
    <div class="figbox">${riskMatrix()}</div>
    <p class="note">主要リスクはいずれも発生確率・影響度ともに管理可能な範囲にあり、対応策を講じることで事業計画の達成可能性は高いと評価する。</p>`;

  const P9 = `
    <h3>地域・業界への波及効果</h3>
    <div class="split">
      <div class="half">
        <p class="lead">${p.ripple}</p>
        <h3>3つの波及効果</h3>
        <ul class="ul on">
          <li><b>雇用の質の向上:</b> 生産性向上を原資とした賃上げと働き方改善で、地域の雇用の魅力を高める。</li>
          <li><b>モデルの横展開:</b> 本事業のノウハウは同業・近隣他業種へ展開可能で、地域全体のDXを牽引する。</li>
          <li><b>顧客利便性の向上:</b> サービス品質と利便性の向上が、地域住民・来訪者の満足度を高める。</li>
        </ul>
      </div>
      <div class="half">
        <div class="figbox">${rippleFig()}</div>
      </div>
    </div>
    <h3>中小企業診断士の視点(事業の位置づけ)</h3>
    <div class="callout">本事業は単なる業務効率化にとどまらず、<b>省力化で創出した経営資源を高付加価値活動へ再配分する経営変革</b>である。人手不足という構造的制約を乗り越え、小規模事業者が持続的に成長するための投資であり、地域経済の担い手としての基盤強化に資する。</div>`;

  const P10 = `
    <h3>補助要件チェックリスト</h3>
    <table class="data wide">
      <tr><th>要件</th><th>本計画の対応</th><th>判定</th></tr>
      <tr><td>${s.badge}の対象事業者</td><td>中小企業・小規模事業者(美容業)に該当</td><td class="ok">✔</td></tr>
      <tr><td>省力化・生産性向上効果</td><td>月${p.saveH}時間削減・KPI改善を定量提示</td><td class="ok">✔</td></tr>
      <tr><td>${p.scheme === "業務改善" ? "事業場内最低賃金の引上げ" : "賃上げ計画(特例・加点の活用時)"}</td><td>+${wageUpOf(p)}円の引上げを計画</td><td class="ok">✔</td></tr>
      <tr><td>交付決定後の発注</td><td>スケジュールを交付決定起点で設計</td><td class="ok">✔</td></tr>
      <tr><td>事業計画の実現可能性</td><td>実機プロトタイプ・専門家連携で裏付け</td><td class="ok">✔</td></tr>
      <tr><td>投資回収の妥当性</td><td>約${p.roi}年で回収、CF計画を提示</td><td class="ok">✔</td></tr>
    </table>
    <h3>他制度への転用メモ</h3>
    <div class="callout">
      <b>本計画のメイン: ${s.badge}</b><br>
      ${p.scheme === "省力化"
        ? `本事業は省力化(生産性向上)効果が明確なため<b>省力化投資補助金(一般型)</b>を主軸とした。一方、賃上げを主目的に据え直せば<b>業務改善助成金</b>への転用も可能。その場合は事業場内最低賃金の引上げ額(50円以上)を軸に、対象経費を生産性向上に資する設備投資へ組み替える。`
        : `本事業は賃上げと業務改善の親和性が高いため<b>業務改善助成金</b>を主軸とした。一方、投資規模を拡大し省力化効果を前面に出せば<b>省力化投資補助金(一般型)</b>への転用も可能。その場合は補助上限が大きく、大幅賃上げ特例で補助率2/3を狙える。`}
    </div>
    <div class="callout small" style="border-color:${C.red}">
      <b>重要:</b> 本計画書はデモ用のサンプルです。数値(賃金・売上・投資額等)は仮置きであり、実際の申請にあたっては
      ①自社の実績データへの差し替え ②最新の公募要領との突合 ③認定支援機関・専門家(中小企業診断士・税理士・社会保険労務士)による確認 が必須です。補助金の採択を保証するものではありません。
    </div>
    <table class="kv" style="margin-top:8px">
      <tr><td>参照した最新公募情報(2026年時点)</td><td>省力化投資補助金(一般型)第6・7回公募 / 業務改善助成金 令和8年度</td></tr>
    </table>`;

  const pages = [
    page(1, total, "1. 事業概要", P1, "事業概要"),
    page(2, total, "2. 現状の課題と労働実態", P2, "現状分析"),
    page(3, total, "3. 導入システムと省力化プロセス", P3, "システム"),
    page(4, total, "4. 労働生産性向上の定量根拠", P4, "生産性"),
    page(5, total, "5. 賃上げ計画(処遇改善)", P5, "賃上げ"),
    page(6, total, "6. 資金計画・投資回収", P6, "資金計画"),
    page(7, total, "7. 実施体制・スケジュール", P7, "実施体制"),
    page(8, total, "8. リスクと対応策", P8, "リスク"),
    page(9, total, "9. 地域・業界への波及効果", P9, "波及効果"),
    page(10, total, "10. 要件チェック・他制度転用", P10, "要件確認"),
  ].join("\n");

  return htmlShell(p, s, pages);
}

// 追加SVG部品(planローカル)
function donutRow(p) {
  return `<div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap">
    ${donut(Math.round(p.saveH / (p.saveH + 2) * 100), "省力化率", C.green)}
    ${donut(78, "属人業務", C.gold)}</div>`;
}
function problemTree(p) {
  return `<svg viewBox="0 0 620 130" width="100%">
    <rect x="240" y="8" width="140" height="30" rx="6" fill="#f6efe4" stroke="${C.line}"/>
    <text x="310" y="27" font-size="10.5" font-weight="bold" fill="${C.accent}" text-anchor="middle">人手不足・時間不足</text>
    <line x1="310" y1="38" x2="120" y2="62" stroke="${C.line}"/><line x1="310" y1="38" x2="310" y2="62" stroke="${C.line}"/><line x1="310" y1="38" x2="500" y2="62" stroke="${C.line}"/>
    ${[["間接業務に時間を\n奪われる",120],["有資格者が\n低付加価値作業",310],["残業・属人化・\nミスが発生",500]].map(([t,x])=>`
      <rect x="${x-75}" y="62" width="150" height="34" rx="6" fill="#fff" stroke="${C.line}"/>
      ${t.split("\n").map((ln,k)=>`<text x="${x}" y="${78+k*13}" font-size="9" fill="${C.ink}" text-anchor="middle">${ln}</text>`).join("")}`).join("")}
    <line x1="310" y1="96" x2="310" y2="110" stroke="${C.red}" stroke-width="2"/>
    <text x="310" y="124" font-size="10" font-weight="bold" fill="${C.red}" text-anchor="middle">→ 生産性・処遇改善の停滞(本事業で解決)</text>
  </svg>`;
}
function wageChart(p) {
  const up = wageUpOf(p);
  return `<svg viewBox="0 0 300 170" width="100%">
    <text x="8" y="14" font-size="10" font-weight="bold" fill="${C.ink}">事業場内最低賃金の推移(円/時)</text>
    <line x1="40" y1="140" x2="290" y2="140" stroke="${C.line}"/>
    ${[["現行",WAGE_BEFORE,90],["計画1年",WAGE_BEFORE+up,150],["計画3年",WAGE_BEFORE+up+30,210]].map(([l,v,x],i)=>{
      const h = (v-1100)*1.1;
      return `<rect x="${x-24}" y="${140-h}" width="48" height="${h}" rx="3" fill="${i===0?'#c9b79c':C.green}"/>
        <text x="${x}" y="${135-h}" font-size="9" font-weight="bold" fill="${C.ink}" text-anchor="middle">${v}</text>
        <text x="${x}" y="155" font-size="8.5" fill="${C.sub}" text-anchor="middle">${l}</text>`;
    }).join("")}
    <text x="150" y="168" font-size="8" fill="${C.sub}" text-anchor="middle">※東京都最低賃金1,163円を上回る水準を維持</text>
  </svg>`;
}
function riskMatrix() {
  return `<svg viewBox="0 0 320 170" width="100%">
    <text x="8" y="12" font-size="10" font-weight="bold" fill="${C.ink}">リスクマトリクス(対応後)</text>
    <line x1="40" y1="20" x2="40" y2="150" stroke="${C.line}"/><line x1="40" y1="150" x2="310" y2="150" stroke="${C.line}"/>
    <text x="4" y="30" font-size="8" fill="${C.sub}">大</text><text x="4" y="148" font-size="8" fill="${C.sub}">小</text>
    <text x="44" y="164" font-size="8" fill="${C.sub}">低い ← 発生確率 → 高い</text>
    <text x="12" y="90" font-size="8" fill="${C.sub}" transform="rotate(-90 12 90)">影響度</text>
    <rect x="40" y="20" width="135" height="65" fill="#fbeeec" opacity=".4"/>
    <rect x="175" y="85" width="135" height="65" fill="#eef5f0" opacity=".5"/>
    <circle cx="95" cy="115" r="7" fill="${C.green}"/><text x="95" y="118" font-size="7" fill="#fff" text-anchor="middle">品質</text>
    <circle cx="130" cy="100" r="7" fill="${C.green}"/><text x="130" y="103" font-size="7" fill="#fff" text-anchor="middle">定着</text>
    <circle cx="200" cy="128" r="7" fill="${C.gold}"/><text x="200" y="131" font-size="7" fill="#fff" text-anchor="middle">仕様</text>
    <text x="230" y="45" font-size="9" fill="${C.green}" text-anchor="middle">対応策により</text>
    <text x="230" y="58" font-size="9" fill="${C.green}" text-anchor="middle">管理可能領域へ</text>
  </svg>`;
}
function rippleFig() {
  return `<svg viewBox="0 0 200 180" width="180">
    ${[70,50,30].map((r,i)=>`<circle cx="100" cy="90" r="${r+30}" fill="none" stroke="${['#e5dfd7','#cbb99c','#3e6b4f'][i]}" stroke-width="2" opacity="${0.5+i*0.2}"/>`).join("")}
    <circle cx="100" cy="90" r="26" fill="${C.accent}"/>
    <text x="100" y="87" font-size="9" fill="#fff" text-anchor="middle">自店</text>
    <text x="100" y="99" font-size="8" fill="#fff" text-anchor="middle">生産性↑</text>
    <text x="100" y="35" font-size="8.5" fill="${C.green}" text-anchor="middle" font-weight="bold">業界モデル</text>
    <text x="100" y="160" font-size="8.5" fill="${C.gold}" text-anchor="middle" font-weight="bold">地域雇用の質↑</text>
    <text x="28" y="93" font-size="8.5" fill="${C.sub}" text-anchor="middle">従業員</text>
    <text x="172" y="93" font-size="8.5" fill="${C.sub}" text-anchor="middle">顧客</text>
  </svg>`;
}

function htmlShell(p, s, pages) {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>事業計画書 No.${p.no} ${p.title} | ${BIZ.name}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  :root{--ink:${C.ink};--sub:${C.sub};--line:${C.line};--accent:${C.accent};--green:${C.green};--gold:${C.gold};--red:${C.red};--scheme:${s.color}}
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI",sans-serif;color:var(--ink);background:#e8e4de;line-height:1.6;font-size:10.2pt;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .toolbar{background:#26221e;color:#f5efe6;padding:10px 18px;display:flex;justify-content:space-between;align-items:center;font-size:12px;position:sticky;top:0;z-index:9;gap:10px}
  .toolbar .btns{display:flex;gap:8px}
  .toolbar button,.toolbar a{font:inherit;font-weight:700;background:var(--gold);color:#fff;border:none;border-radius:8px;padding:7px 16px;cursor:pointer;text-decoration:none;display:inline-block}
  .toolbar a.xls{background:#1d6f42}
  .page{width:210mm;min-height:297mm;background:#fff;margin:14px auto;padding:16mm 15mm 12mm;position:relative;display:flex;flex-direction:column;box-shadow:0 2px 12px #0002}
  .ph{display:flex;justify-content:space-between;align-items:center;border-bottom:2.5px solid var(--scheme);padding-bottom:6px;margin-bottom:10px}
  .ph-t{font-size:15pt;font-weight:800;color:var(--accent)}
  .ph-n{font-size:9pt;color:var(--sub);font-weight:700}
  .pbody{flex:1}
  .pf{display:flex;justify-content:space-between;font-size:7.5pt;color:var(--sub);border-top:1px solid var(--line);padding-top:5px;margin-top:8px}
  h1{font-size:18pt;line-height:1.35;margin:6px 0;color:var(--ink)}
  h3{font-size:11pt;color:var(--accent);margin:10px 0 6px;padding-left:8px;border-left:4px solid var(--scheme)}
  .hero{background:linear-gradient(135deg,#faf6f0,#f2eadd);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:10px}
  .hero-badge{display:inline-block;color:#fff;font-size:9pt;font-weight:700;padding:3px 12px;border-radius:99px;margin-bottom:8px}
  .hero-sub{font-size:10pt;color:var(--sub);margin-top:6px}
  .split{display:flex;gap:12px;margin:8px 0}
  .half{flex:1;min-width:0}
  .lead{font-size:10pt;margin:6px 0;text-align:justify}
  .callout{background:#f7f3ec;border-left:4px solid var(--scheme);border-radius:0 8px 8px 0;padding:9px 12px;font-size:9.3pt;margin:8px 0;text-align:justify}
  .callout.small{font-size:8.8pt;padding:8px 10px}
  .figbox{background:#fcfaf6;border:1px solid var(--line);border-radius:10px;padding:10px;margin:8px 0;text-align:center}
  .figbox.big{padding:14px 10px}
  table{width:100%;border-collapse:collapse;font-size:9pt;margin:6px 0}
  .kv td{padding:4px 8px;border-bottom:1px solid var(--line)}
  .kv td:first-child{color:var(--sub);width:42%;font-size:8.6pt}
  .data th{background:#efe9e0;padding:5px 8px;text-align:left;font-size:8.6pt;border:1px solid var(--line)}
  .data td{padding:5px 8px;border:1px solid var(--line)}
  .data .num{text-align:right;font-variant-numeric:tabular-nums}
  .data .sum{font-weight:800;background:#faf7f2}
  .data .up{color:var(--green);font-weight:700;font-size:8.6pt}
  .data .ok{color:var(--green);font-weight:800;text-align:center}
  .data.wide{font-size:8.8pt}
  .ul{list-style:none;font-size:9.2pt}
  .ul li{padding:4px 0 4px 18px;position:relative}
  .ul li::before{content:"▪";position:absolute;left:2px;color:var(--sub)}
  .ul.on li::before{content:"✓";color:var(--green);font-weight:800}
  .note{font-size:8pt;color:var(--sub);margin-top:6px;text-align:justify}
  @media print{body{background:#fff}.toolbar{display:none}.page{margin:0;box-shadow:none;page-break-after:always}.page:last-child{page-break-after:auto}}
</style></head>
<body>
  <div class="toolbar">
    <span>📄 事業計画書 No.${p.no} — ${s.badge} / A4×10ページ(絵:文字=5:5)</span>
    <div class="btns">
      <a class="xls" href="plan-${String(p.no).padStart(2, "0")}.xlsx" download>📊 Excelをダウンロード(編集用)</a>
      <button onclick="window.print()">🖨 印刷 / PDF保存</button>
    </div>
  </div>
  ${pages}
</body></html>`;
}

// ---- 実行 ----
let ok = 0;
PLANS.forEach(p => {
  const html = buildPlan(p);
  const file = path.join(OUT, `plan-${String(p.no).padStart(2, "0")}.html`);
  fs.writeFileSync(file, html, "utf8");
  ok++;
  console.log(`  ✔ plan-${String(p.no).padStart(2, "0")}.html  (${p.scheme}) ${p.title.slice(0, 22)}…`);
});
console.log(`\n生成完了: ${ok}本 / 各10ページ = ${ok * 10}ページ`);

// ---- Excel版生成用: 計算済みデータをJSONへ書き出し(plan_excel.py が読み込む) ----
// buildPlan()内と同じ計算式をここでも再現し、HTML版とExcel版の数値を一致させる。
const exportData = PLANS.map(p => {
  const s = schemeInfo(p.scheme, p);
  const opex = Math.round(p.saveY * 0.18);
  const netY = p.saveY - opex;
  const cf = [];
  let cum = -s.self;
  cf.push({ y: "導入時", cum: Math.round(cum) });
  for (let y = 1; y <= 4; y++) { cum += netY; cf.push({ y: `${y}年目`, cum: Math.round(cum) }); }
  const wageUpApplied = wageUpOf(p);
  return {
    ...p,
    scheme_info: s,
    opex, netY, cf,
    wage_before: WAGE_BEFORE, wage_up_applied: wageUpApplied,
    wage_after1: WAGE_BEFORE + wageUpApplied, wage_after3: WAGE_BEFORE + wageUpApplied + 30,
    growth_pct: 3 + p.no % 3,
  };
});
fs.writeFileSync(path.join(OUT, "_plan_data.json"), JSON.stringify({ biz: BIZ, plans: exportData }, null, 2), "utf8");
console.log("_plan_data.json を書き出しました(Excel版ジェネレーターの入力用)");

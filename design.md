# Design — 補助金活用 業務改善ロードマップ

このサイト全体（index.html / program.html / criteria.html / documents.html / schedule.html）の
ロックされたデザインシステム。各ページのCSSを書き換えるときは、このファイルを先に読むこと。
色・書体・強調表現の値を変えるときは、このファイル → 各ページの `:root` の順に直す
（このファイルが唯一の出所。各ページの値と食い違ったらこのファイルが正しい）。

## 背景（2026-08-13、本人指示）

旧配色「窓口の案内サイン」（青=案内・橙=注意・緑=状態）は、実機のスマホで見ると
青とグレーの同系統色に埋もれて視認しにくいという指摘があった。強調表現も太字＋色変化のみで、
フォント・サイズ・斜体による差別化が無かった。5パターンの配色案を作成し、本人が
「案B：藍×橙×花青（和の三色）」を選択。

## ジャンル

業務システム・帳票系（利用者は美容室スタッフ・中高年を含む非IT層）。
`artdirection`スキルの規定により、hallmarkの美学判断より可読性を優先する。

## 配色 — 案B「藍×橙×花青」

3つの役割を、はっきり別の色相に分離する（現行の「青系統に寄る」問題を解消）：

- **藍（案内）** — 補助率・上限額・章番号・リンク・補助金カテゴリタグ
- **橙（注意）** — 締切・残日数・必須要件の警告
- **花青（状態）** — 対象バッジ・受付中・助成金カテゴリタグとは別の「状態」専用色

3色以外は増やさない。彩度を上げて役割ごとの距離をはっきりさせているのが現行との違い。

### ライトモード（既定）

```css
--paper:        #b7c1cd;  /* 2026-08-13(2)改訂: #c5cdd6からさらに暗化（依然「濃淡が弱い」指摘のため） */
--paper-raised: #ffffff;
--ink:          #191d22;
--ink-soft:     #3d475c;  /* 2026-08-13(2)改訂: #48536aから暗化 */
--ink-faint:    #3d4658;  /* 2026-08-13(2)改訂: #525c70から暗化。paper再暗化に伴い4.5:1割れを再度解消 */
--accent:       #1e4d78;  /* 藍 = 案内（据え置き。paper上でも4.83:1を維持） */
--accent-soft:  #b9cfe3;
--accent-wash:  #e3edf5;
--on-accent:    #ffffff;
--sage:         #094758;  /* 2026-08-13(2)改訂: #0e7490から明度を下げて彩度を保持（HSL明度-12pt）。paper直置きで4.5:1未達だったため */
--sage-wash:    #dcf1f5;
--rust:         #882e08;  /* 2026-08-13(2)改訂: #c2410cから明度を下げて彩度を保持（HSL明度-12pt）。paper直置きで4.5:1未達だったため */
--rust-wash:    #f8e4d8;
--cat-hojo:       #1e4d78;  /* 補助金タグ = 藍 */
--cat-hojo-wash:  #e3edf5;
--cat-josei:      #6d4110;  /* 2026-08-13(2)改訂: #7a4a12から暗化。paper上4.09:1→4.77:1 */
--cat-josei-wash: #f6ead6;
--cat-other-wash: #e2e5ea;  /* 2026-08-13(3)新設: .pill.other用の無彩色wash。透明背景+点線枠だけでは目立たないという指摘のため */
--line:  #4f5b6d;  /* 2026-08-13(2)改訂: #a3adbaから大幅濃化（点線がpaperと同系色で見えない指摘） */
--shadow: rgba(25, 29, 34, 0.10);
```

### ダークモード（`prefers-color-scheme: dark` / `data-theme="dark"`）

```css
--paper:        #0a0d12;  /* 2026-08-13(2)改訂: #10141aからさらに暗化 */
--paper-raised: #2c384b;  /* 2026-08-13(2)改訂: #273346からさらに明化（カード浮き上がりと点線の両立点） */
--ink:          #e6e9ee;
--ink-soft:     #b6c0cf;
--ink-faint:    #96a2b5;
--accent:       #7fa8d9;
--accent-soft:  #24344f;
--accent-wash:  #1a2740;
--on-accent:    #0d1218;
--sage:         #5fc3d9;
--sage-wash:    #15262c;
--rust:         #e88a5a;
--rust-wash:    #2c1c10;
--cat-hojo:       #7fa8d9;
--cat-hojo-wash:  #1a2740;
--cat-josei:      #dba86a;
--cat-josei-wash: #2a2011;
--cat-other-wash: #2a3444;  /* 2026-08-13(3)新設: .pill.other用の無彩色wash */
--line:  #8290ac;  /* 2026-08-13(2)改訂: #3a4454から大幅明化（暗地の点線は明るくする方が視認性が上がる） */
--shadow: rgba(0, 0, 0, 0.45);
```

### 明示ライトモード（`data-theme="light"`、ダーク端末で強制ライト用）

ライトモードの値と同じ値を使う（criteria.html / documents.html / schedule.html の
`:root[data-theme="light"]` ブロックに複製する）。

### `.pill.other`の背景（2026-08-13(3)追加、本人指摘対応）

「名称から種別を判別できない制度」ピル（`.pill.other`）は透明背景+点線枠のみで、
塗りつぶし背景を持つ`.pill.hojo`/`.pill.josei`と並ぶと相対的に目立たず「見づらい」
という指摘を受けた。実データ確認（PROGRAMS 57件中6件、約10.5%が該当。空き家対策
モデル事業や東京都・台東区・江東区・北区の独自制度など）で機能自体は使われている
と確認したうえで、削除ではなく視覚的統一を選択：無彩色の`--cat-other-wash`を新設し、
`hojo`/`josei`と同じ「塗りつぶし+枠なし」構造に統一した。

### 制度種別（補助金／助成金）の判定方式を名称マッチから実質判定に変更（2026-08-13(4)）

上記6件について本人から「そもそも補助金と助成金の区別はつかないの？専門家のレビュー
も入れて調査してるのだからそこは明確にしてください」と指摘を受けた。従来の
`pillClass()`は制度名に「補助」「助成」の文字が含まれるかだけで判定していたが、
これは設計として誤り——行政の制度は**名称の用語と実質運用が一致しないことが珍しく
ない**（例：江東区ICT等導入支援事業は「補助金」の名称だが要件充足型の運用で助成金的、
東京都・創意工夫チャレンジ促進事業は「助成金」の名称だが定性審査があり補助金的）。

shindanshiが公式サイト・募集要領原文（空き家対策モデル事業は国交省PDF原文を画像化
して目視確認）で6件を実質判定し、`PROGRAM_TYPE_OVERRIDE`（index.html、`pillClass()`
直前）にキー単位の判定結果を記録した：

| キー | 判定 | 根拠 |
|---|---|---|
| akiya | 補助金 | 募集要領原文で「補助金」用語のみ・評価委員会による競争的審査を確認 |
| tokyo_koto_ict | 補助金 | 公式サイトで「補助金」用語を一貫使用 |
| tokyo_kita_itiot | 補助金 | 公式サイトで「補助金」用語、先着10件程度で締切 |
| tokyo_soui | 助成金 | 公式サイトで「助成率」「助成限度額」の用語、件数上限の明記なし |
| tokyo_shuekiryoku | 助成金 | セットの「収益力強化サポート助成金」（定員500社上限あり） |
| tokyo_taito_keiei | 助成金 | 公式サイトで「助成金」用語、要件確認型 |

`pillClass(text, key)`は`PROGRAM_TYPE_OVERRIDE[key]`があればそれを優先し、無い制度は
従来通り名称の文字列マッチにフォールバックする。**この6件以外の制度も同様の名実
不一致が潜んでいる可能性はあり、全制度の実質監査はまだ行っていない**（次回以降の
課題）。新しい自治体制度を追加する際は、名称だけで判定せず`PROGRAM_TYPE_OVERRIDE`
への追加要否を検討すること。

**実装の所在を調査した結果、index.html側にはデッドコードがあると判明**（本人の
「全制度確認した？」という指摘を受けて調査）。index.htmlの`.cat-legend`（「制度名は
種別で色分けしています」の凡例）は表示されていたが、その直後の実際の制度一覧
（`renderProgramSummary()`が描画する`#programSummary`）はピルを一切生成しておらず、
凡例が説明する実体が画面上どこにも無かった。さらに`renderRankingHTML()`（ピル生成
コードを含む）は2026-08-01の「改善計画10選との重複解消」で呼び出し先のDOM要素
（`#rankList`）ごと廃止されており、`html`変数を組み立てた末に`rl.innerHTML = ''`で
毎回捨てるだけの完全なデッドコードだった（`INDUSTRIES`データ自体は概算シミュレーター
が使うため関数は残っている）。

対応として、index.html側の`.cat-legend`（HTML・CSS）と、そこにのみ必要だった
`PROGRAM_TYPE_OVERRIDE`/`pillClass()`（index.html側の実装）を削除した。**実際に
ユーザーの目に触れる補助金／助成金ピルはprogram.html（`#ptPill`、制度詳細ページ
上部）の1箇所のみ**であり、`PROGRAM_TYPE_OVERRIDE`と`pillClass(text, key)`は
program.html側にのみ存在する。`--cat-other-wash`もprogram.htmlの`:root`に追加し、
`.pill.other`をindex.htmlと同じ塗りつぶし構造に統一した（program.html側は
それまで旧デザインの透明背景+点線枠のままだった）。

### コントラスト実測（2026-08-13、WCAG 2.1相当の輝度比計算で検証。同日中に2回改訂）

**1回目の改訂（背景面のみの調整）では「まだ弱い」という指摘を受け、2回目の改訂（本項、
以下「(2)」と表記）で `paper` のさらなる暗化・`line` の大幅濃化・rust/sage/cat-joseiの
明度調整（彩度は維持したままpaper地上での可読性を確保）まで踏み込んだ。**

文字色 vs 背景色（本文基準4.5:1）：

| 組み合わせ | 比率(2) |
|---|---|
| paper vs ink（ライト） | 9.29:1 |
| paper vs ink-soft（ライト） | 5.11:1 |
| paper vs ink-faint（ライト） | 5.20:1 |
| paper vs accent 藍（ライト） | 4.83:1 |
| paper vs rust 橙（ライト） | 4.72:1 |
| paper vs sage 花青（ライト） | 5.61:1 |
| paper vs cat-josei 橙茶（ライト） | 4.77:1 |
| paper-raised vs accent 藍（ライト） | 8.79:1 |
| paper-raised vs rust 橙（ライト） | 8.60:1 |
| paper-raised vs sage 花青（ライト） | 10.22:1 |
| paper-raised vs cat-josei 橙茶（ライト） | 7.46:1 |
| paper-raised vs ink-faint（ダーク） | 4.58:1 |
| paper-raised vs accent 藍（ダーク） | 4.79:1 |
| paper-raised vs rust 橙（ダーク） | 4.63:1 |
| paper-raised vs sage 花青（ダーク） | 6.42:1 |
| paper-raised vs cat-josei 橙茶（ダーク） | 6.13:1 |

**重要な変更点**：rust/sageは`.wage-flag.req`, `.req-strong`, `.gt-late`等で背景指定なしに
`paper`地へ直接文字色として乗る箇所が複数あると判明したため（例: index.html:330, 419,
1264）、`paper`地の上でも4.5:1を満たす必要がある。旧rust/sage（#c2410c/#0e7490）は
paper直置きで2.84:1/2.94:1しかなく、1回目の改訂でpaperを暗化したことでさらに悪化していた。
HSL明度を-12ptして彩度を保持したまま暗化し解消した（色相・彩度は変えていないため
「橙」「花青」の判別性は維持）。

全組み合わせが本文基準4.5:1を上回る。

**背景面同士のコントラスト（非文字要素の目安3:1を基準に、1回目・2回目の推移を記録）**：

| 組み合わせ | 当初 | 1回目改訂 | 2回目改訂 |
|---|---|---|---|
| paper vs paper-raised（ライト） | 1.13:1 | 1.61:1 | 1.82:1 |
| paper vs line（ライト） | 1.24:1 | 1.41:1 | 3.78:1 |
| paper-raised vs line（ライト） | 1.40:1 | 2.27:1 | 6.89:1 |
| paper vs paper-raised（ダーク） | 1.08:1 | 1.45:1 | 1.64:1 |
| paper vs line（ダーク） | 1.43:1 | 1.88:1 | 6.05:1 |
| paper-raised vs line（ダーク） | — | 1.30:1 | 3.68:1 |

点線・罫線（`--line`）は1回目の改訂後も1.3〜2.3:1にとどまり、「点線が背景と同系色」という
指摘の主因だった。2回目の改訂で非文字要素の目安3:1を全組み合わせで上回る水準まで濃化
（ライト）・明化（ダーク、暗地では明るい線の方が視認性が上がる）した。
`.pd-item`等の主要カードの`box-shadow`（次項）は維持し、明度差・線・陰影の三重で境界を強める。

## 書体

既存のBIZ UD書体構成を維持する（`artdirection`スキルの規定により、業務システム・帳票系は
可読性最優先のユニバーサルデザイン書体を使う。案Bの「見た目を変える」は色と強調表現で行い、
書体そのものは変えない）。

```css
--font-body:    "BIZ UDPGothic", "BIZ UDGothic", "Noto Sans JP", "Yu Gothic Medium", "Yu Gothic",
                "Hiragino Sans", "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif;
--font-display: "BIZ UDPMincho", "BIZ UDMincho", "Yu Mincho", "YuMincho",
                "Hiragino Mincho ProN", serif;
```

**criteria.htmlのみ現在Noto Sans JP単体**（BIZ UD未読込）。他ページと統一するため、
`<link>`タグとfont-familyを他ページと同じ構成に変更する。

## 強調表現 — 「太字＋色」だけでなく複数軸を組み合わせる（今回の主目的）

現行は`font-weight:700`＋色変化のみで強調していた。案Bでは以下を状況ごとに使い分ける：

| 強調の種類 | 適用 | 実装 |
|---|---|---|
| **最重要の数値**（補助率・上限額） | `.num-strong`, `.pd-item-key .v` | `font-family: var(--font-display)`（明朝化）+ `font-weight:700` + `font-size`を通常より25〜40%大きく + `color: var(--accent)` |
| **締切・残日数** | `.tt-lim`, 締切表示全般 | 明朝化 + 太字 + `color: var(--rust)`。日数の数字部分は`font-size`を本文の1.4倍程度に |
| **必須要件・警告文言** | `.req-strong`, `.wage-flag.req` | ゴシック太字 + `color: var(--rust)`（サイズは本文のまま、文中強調のため） |
| **補足・注記**（〜の場合、〜を除く 等） | `.sub`, `.note`, カード内の条件注記 | `font-style: italic` + `font-size`を本文より一段小さく + `color: var(--ink-faint)`。斜体は本文中の補足にのみ使い、見出し（h1-h3）には使わない |
| **カテゴリタグ**（補助金/助成金/対象） | `.pill.hojo`, `.pill.josei`, `.pill.state相当` | 背景色＋文字色のペア（既存踏襲）。案Bでは3色の彩度差を強めて距離を作る |

**斜体の適用範囲を明確に限定する**：見出し（h1, h2, h3, .section-head, .pd-name等）には
斜体を使わない（hallmarkのタイポグラフィ規則: 見出しは常にroman体）。斜体は本文中の
注記・補足・「〜の場合」といった条件文にのみ使う。

## カード構造 — side-stripeを廃止

現行の`.pd-item-key`（左4pxの太い色付きボーダー）はhallmarkのanti-pattern「side-stripe card」
に該当する。案Bでは全カードをヘアライン枠（`border: 1px solid var(--line)`）に統一し、
重要度は「背景色を薄く敷く」「明朝化+サイズアップ」で表現する（ボーダーの太さでは表現しない）。

```css
.pd-item-key {
  border: 1px solid var(--line);       /* 太いleft-borderをやめ、通常の枠に */
  background: var(--accent-wash);      /* 薄い背景色で重要度を示す */
}
.pd-item-key .k { color: var(--accent); font-weight: 700; }
.pd-item-key .v { font-family: var(--font-display); font-weight: 700; }

.pd-item-due {
  border: 1px solid var(--line);
  background: var(--rust-wash);
}
.pd-item-due .k { color: var(--rust); font-weight: 700; }
.pd-item-due .v { font-family: var(--font-display); font-weight: 700; color: var(--rust); }
```

## カードの陰影（2026-08-13追加、本人指摘対応）

スマホ実機で「配色の濃淡が無い」という指摘があり、背景面同士（ページ地・カード・
アクセントウォッシュ）のコントラスト比を実測したところ1.05〜1.4:1しかなく、
ほぼ同じ明るさだった（前掲の実測表）。`--paper` / `--paper-raised` / `--line`の
明度差を広げたが、それだけでは劇的な変化にならないため、白背景の主要カード
（`.pd-item`, `.card`相当、ヘアライン枠を持つ全要素）に`box-shadow`を追加し、
明度差と陰影の両輪で境界を強める。

```css
.pd-item,
.pd-item-key,
.pd-item-due,
.card {
  box-shadow: 0 1px 3px var(--shadow), 0 1px 2px var(--shadow);
}
```

`--shadow`は既存トークン（ライト`rgba(25,29,34,0.10)`、ダーク`rgba(0,0,0,0.45)`）を
そのまま使う。新しい影専用トークンは増やさない。

## 適用範囲

全5ページ（index.html, program.html, criteria.html, documents.html, schedule.html）に
同一の配色・書体・強調規則を適用する。ページごとの差異は許可しない
（マルチページの多様化ルールは今回は逆転適用＝一貫性を優先、hallmark redesign.md §4）。

## 触ってはいけない領域（引き継ぎ済みの既存ルール）

- `page_data.js`は自動生成ファイル（`_tools/build_page_data.py`で再生成）、直接編集禁止
- `forms/`配下のバイナリファイルは`github-actions[bot]`の自動生成、手動編集・削除禁止
- `improvement/_build/`配下のHTML自動生成部分（`IMPROVEMENT_HUB_EMBED:START`〜`END`）は
  `embed_hub_cards.py`経由でのみ変更する

## `.pd-peek`のCSS二重切り詰めを解消（2026-08-13(3)、本人指摘対応）

`.pd-peek`のCSSに`max-width: 11rem; text-overflow: ellipsis; white-space: nowrap;`が
残っており、`peekText()`やSCALE_SUMMARY等の静的要約表で既に句読点優先の短い文字列に
人手調整していても、さらにCSS側で機械的に切り詰めて「…」が付いていた（例：
「売上高10億〜100億円未満」が「売上高10億〜100億円…」と表示され、開いた先の全文と
文言が繋がらず意味不明になる）。`summary`が`flex-wrap: wrap`のレイアウトであることを
確認したうえで、`max-width: 100%`のみに変更し、nowrap/ellipsisを廃止して自然折り返しに
任せる形にした（program.html内`.pd-peek`）。

## 開閉式カードの1行見出し（program.html）— 締切・採択率（2026-08-13、本人指示）

開閉式カード（`.pd-item`）のsummary側プレビュー（`.pd-peek`）は、文の途中で
切れないよう句読点優先で要約する（`peekText()`関数）。ただし**締切・採択率の
2項目は機械的な切り詰めでは誤読を招く**ため、125制度全件を人手で確認した
静的な要約表（`SCHEDULE_SUMMARY` / `ACCEPTANCE_SUMMARY`、program.html内）を使う。

**なぜ機械的処理では不十分だったか**：`schedule`の生データは「4月1日〜」のような
「受付開始日」を、最初に出現する日付というだけで「次回締切」と誤抽出するリスクが
高い（実例：19件が「4月1日」始まりで、そのほとんどは開始日であり締切ではなかった）。
そのため以下の分類ルールで人手判定した：

- `schedule`が無い、または「通年」で始まる → 「通年受付」
- 「受付終了」を含み、かつ次回日程が明記されていない → 「受付終了（次回未定）」
- 締切日はあるが予算上限等で早期終了もありうる、確定日が無い → 「先着順（予算上限で終了）」
- それ以外で確定した次回締切日がある → 「次回締切：M月D日」（半角数字）

`acceptance`は先頭が数値（%）で始まるものだけ数値を抽出し、それ以外は
「非公表」「審査制（非競争）」「抽選制」等の短い定型語に要約した（詳細は
開いたカード本文＝`p.acceptance`の全文に引き続き表示される）。

**保守上の注意**：`SCHEDULE_SUMMARY` / `ACCEPTANCE_SUMMARY`は index.html の
`PROGRAMS[key].schedule` / `.acceptance`（またはsim_data.jsのtop.schedule）の
**要約であり、唯一の出所ではない**。元データを変更したら、この2つのマップも
見直す必要がある（自動同期の仕組みは無い）。新しい制度キーを追加した場合、
このマップにエントリが無いと`peekText()`へフォールバックする（機械的切り詰めに
戻るだけで、動作は壊れない）。

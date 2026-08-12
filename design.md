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
--paper:        #eef1f3;
--paper-raised: #ffffff;
--ink:          #191d22;
--ink-soft:     #48536a;
--ink-faint:    #6c7689;
--accent:       #1e4d78;  /* 藍 = 案内 */
--accent-soft:  #b9cfe3;
--accent-wash:  #e3edf5;
--on-accent:    #ffffff;
--sage:         #0e7490;  /* 花青 = 状態（対象・受付中） */
--sage-wash:    #dcf1f5;
--rust:         #c2410c;  /* 橙 = 注意（締切・必須） */
--rust-wash:    #f8e4d8;
--cat-hojo:       #1e4d78;  /* 補助金タグ = 藍 */
--cat-hojo-wash:  #e3edf5;
--cat-josei:      #7a4a12;  /* 助成金タグ = 橙寄りの茶（rustとは別トーンで区別） */
--cat-josei-wash: #f6ead6;
--line:  #d6dae1;
--shadow: rgba(25, 29, 34, 0.10);
```

### ダークモード（`prefers-color-scheme: dark` / `data-theme="dark"`）

```css
--paper:        #10141a;
--paper-raised: #161c24;
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
--line:  #2a323d;
--shadow: rgba(0, 0, 0, 0.45);
```

### 明示ライトモード（`data-theme="light"`、ダーク端末で強制ライト用）

ライトモードの値と同じ値を使う（criteria.html / documents.html / schedule.html の
`:root[data-theme="light"]` ブロックに複製する）。

### コントラスト実測（2026-08-13、WCAG 2.1相当の輝度比計算で検証）

| 組み合わせ | 比率 |
|---|---|
| paper vs ink（ライト） | 14.93:1 |
| paper vs ink-soft（ライト） | 6.80:1 |
| paper-raised vs accent 藍（ライト） | 8.79:1 |
| paper-raised vs cat-josei 橙茶（ライト） | 7.46:1 |
| paper-raised vs sage 花青（ライト） | 5.36:1 |
| paper-raised vs rust 橙（ライト） | 5.18:1 |
| paper vs ink（ダーク） | 15.18:1 |
| paper-raised vs accent 藍（ダーク） | 6.94:1 |
| paper-raised vs cat-josei 橙茶（ダーク） | 8.01:1 |
| paper-raised vs sage 花青（ダーク） | 8.40:1 |
| paper-raised vs rust 橙（ダーク） | 6.70:1 |

全組み合わせが本文基準4.5:1を上回る（実際の計算値、hallmark color.mdの基準に整合）。

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

## 適用範囲

全5ページ（index.html, program.html, criteria.html, documents.html, schedule.html）に
同一の配色・書体・強調規則を適用する。ページごとの差異は許可しない
（マルチページの多様化ルールは今回は逆転適用＝一貫性を優先、hallmark redesign.md §4）。

## 触ってはいけない領域（引き継ぎ済みの既存ルール）

- `page_data.js`は自動生成ファイル（`_tools/build_page_data.py`で再生成）、直接編集禁止
- `forms/`配下のバイナリファイルは`github-actions[bot]`の自動生成、手動編集・削除禁止
- `improvement/_build/`配下のHTML自動生成部分（`IMPROVEMENT_HUB_EMBED:START`〜`END`）は
  `embed_hub_cards.py`経由でのみ変更する

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

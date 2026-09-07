# リンク確認レポート

- 確認時刻：**2026-09-07 11:14**（JST）
- 確認したURL：**1164件**
- 出所：各URLへの実アクセス（HEAD、拒否された場合のみGET）

## 集計

🔴 リンク切れ（要修正） **2件**／🔴 ファイルの種類が変わった（要確認） **1件**／🟡 自動確認を拒否（目視が要る） **1件**／🟡 接続できない（目視が要る） **1件**／✅ 変化なし **1159件**

## 🔴 リンク切れ（要修正）

- **戸田市DX推進補助金／&nbsp;経費明細表**
  - https://www.city.toda.saitama.jp/uploaded/attachment/73668.xlsx
  - HTTP 404（ページが無い）
- **業務改善助成金（2026年度／50・70・90円コース）／申請書等 簡易作成ツール**
  - https://www.mhlw.go.jp/content/11200000/001733987.xlsx
  - HTTP 404（ページが無い）

## 🔴 ファイルの種類が変わった（要確認）

- **観光地・観光産業における省力化投資補助事業（観光庁）／特定施設一覧**
  - https://kanko-jinzai.go.jp/wp-content/uploads/2026/06/R8_tokutei_shisetsu.pdf
  - PDF のはずが Content-Type が text/html

## 🟡 自動確認を拒否（目視が要る）

- **新規ビジネスチャレンジ補助事業（練馬区）**
  - https://nerima-idc.or.jp/bsc/yuushi/hojokin.html#challenge
  - HTTP 403（自動アクセスを拒否）。2026-08-31 19:08 には開けていた。経路の問題かページの消滅か、目視で確認が要る

## 🟡 接続できない（目視が要る）

- **（出典・参考リンク）**
  - https://www.sme-support.co.jp/column/p1352/
  - ConnectTimeout: HTTPSConnectionPool(host='www.sme-support.co.jp', port=443): Max retries exceeded with url: /column/p1352/ (Caused by Co

---

全件の一覧はリポジトリの `_tools/link_report.md`、
前回値との比較台帳は `_tools/link_status.json` にあります。
手元で取り直すには `python3 _tools/check_links.py --only <URLの一部>`。


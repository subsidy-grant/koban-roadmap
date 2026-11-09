# リンク確認レポート

- 確認時刻：**2026-11-09 12:58**（JST）
- 確認したURL：**1166件**
- 出所：各URLへの実アクセス（HEAD、拒否された場合のみGET）

## 集計

🔴 リンク切れ（要修正） **3件**／🔴 ファイルの種類が変わった（要確認） **1件**／🟡 自動確認を拒否（目視が要る） **1件**／🟡 接続できない（目視が要る） **4件**／✅ 変化なし **1157件**

## 🔴 リンク切れ（要修正）

- **豊島区中小企業支援事業補助金・経営安定コース（豊島区）／申請要領**
  - https://www.city.toshima.lg.jp/documents/3318/20260623075350.pdf
  - HTTP 404（ページが無い）
- **中小企業デジタル導入促進補助事業（東京都・東京都中小企業振興公社）／申請時添付書類例**
  - https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/R8shinseisho_sample.pdf
  - HTTP 404（ページが無い）
- **中小企業デジタル導入促進補助事業（東京都・東京都中小企業振興公社）／ツール導入にあたってのチェックシート**
  - https://www.tokyo-kosha.or.jp/support/josei/jigyo/rmepal000002z8qy-att/check_sheet_digital.xlsx
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

- **中小企業収益力強化サポート事業（東京都中小企業振興公社）／中小企業収益力強化サポート事業（東京都中小企業振興公社）／中小企業収益力強化サポート事業 公式サイト**
  - https://tokyo-shuekiryoku-kyoka.jp/
  - SSLError: HTTPSConnectionPool(host='tokyo-shuekiryoku-kyoka.jp', port=443): Max retries exceeded with url: / (Caused by SSLError(S
- **中小企業収益力強化サポート事業（東京都中小企業振興公社）／専門家派遣募集要項**
  - https://tokyo-shuekiryoku-kyoka.jp/assets/pdf/application-requirements.pdf
  - SSLError: HTTPSConnectionPool(host='tokyo-shuekiryoku-kyoka.jp', port=443): Max retries exceeded with url: /assets/pdf/application
- **中小企業収益力強化サポート事業（東京都中小企業振興公社）／事業案内（簡易版）**
  - https://tokyo-shuekiryoku-kyoka.jp/leaflet.pdf
  - SSLError: HTTPSConnectionPool(host='tokyo-shuekiryoku-kyoka.jp', port=443): Max retries exceeded with url: /leaflet.pdf (Caused by
- **中小企業収益力強化サポート事業（東京都中小企業振興公社）／事業案内（詳細版）**
  - https://tokyo-shuekiryoku-kyoka.jp/leaflet_detailed.pdf
  - SSLError: HTTPSConnectionPool(host='tokyo-shuekiryoku-kyoka.jp', port=443): Max retries exceeded with url: /leaflet_detailed.pdf (

---

全件の一覧はリポジトリの `_tools/link_report.md`、
前回値との比較台帳は `_tools/link_status.json` にあります。
手元で取り直すには `python3 _tools/check_links.py --only <URLの一部>`。


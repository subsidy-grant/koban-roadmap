# 掲載サイズと実物の突き合わせ

- 対象：**1016件**（size 表記のある書類）
- 実測が台帳に無く判定できないもの：**1件**
- ズレ：**6件**

## 表記が実物と違うもの

- 掲載 **11.5MB** → 実物 **13.2MB**
  - https://it-shien.smrj.go.jp/pdf/it2026_manual_kofu.pdf
- 掲載 **10.0MB** → 実物 **10.7MB**
  - https://it-shien.smrj.go.jp/pdf/it2026_manual_jisseki.pdf
- 掲載 **668KB** → 実物 **105KB**
  - https://www.city.edogawa.tokyo.jp/documents/23284/r8_dx_chirashi.pdf
- 掲載 **728KB** → 実物 **265KB**
  - https://www.city.edogawa.tokyo.jp/documents/23284/r8_dx_boshuyoko.pdf
- 掲載 **1.1MB** → 実物 **888KB**
  - https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/youryou.pdf
- 掲載 **707KB** → 実物 **584KB**
  - https://shoryokuka.smrj.go.jp/assets/pdf/application_rules.pdf

直しかた：`program_docs_data.js` の size を実物の値にして、
`python3 _tools/build_page_data.py` で作り直す。


# 掲載サイズと実物の突き合わせ

- 対象：**1016件**（size 表記のある書類）
- 実測が台帳に無く判定できないもの：**7件**
- ズレ：**1件**

## 表記が実物と違うもの

- 掲載 **44KB** → 実物 **13KB**
  - https://www.city.toshima.lg.jp/documents/3318/20260414144434.xlsx

直しかた：`program_docs_data.js` の size を実物の値にして、
`python3 _tools/build_page_data.py` で作り直す。


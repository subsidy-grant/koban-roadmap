# 掲載サイズと実物の突き合わせ

- 対象：**1016件**（size 表記のある書類）
- 実測が台帳に無く判定できないもの：**2件**
- ズレ：**1件**

## 表記が実物と違うもの

- 掲載 **24KB** → 実物 **16KB**
  - https://www.city.toda.saitama.jp/uploaded/attachment/73668.xlsx

直しかた：`program_docs_data.js` の size を実物の値にして、
`python3 _tools/build_page_data.py` で作り直す。


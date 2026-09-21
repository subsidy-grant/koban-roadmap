# 掲載サイズと実物の突き合わせ

- 対象：**1016件**（size 表記のある書類）
- 実測が台帳に無く判定できないもの：**3件**
- ズレ：**5件**

## 表記が実物と違うもの

- 掲載 **987KB** → 実物 **4KB**
  - https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/032/622/080501digitalannnai.pdf
- 掲載 **1.1MB** → 実物 **888KB**
  - https://www.city.kawasaki.jp/280/cmsfiles/contents/0000186/186427/youryou.pdf
- 掲載 **221KB** → 実物 **12KB**
  - https://www.pref.tochigi.lg.jp/f06/documents/20260612133609.xlsx
- 掲載 **51KB** → 実物 **11KB**
  - https://www.city.matsudo.chiba.jp/jigyosya/syoukougyou/dx-charenji.files/DEJIJIZENSOUDANr6.docx
- 掲載 **24KB** → 実物 **16KB**
  - https://www.city.toda.saitama.jp/uploaded/attachment/73668.xlsx

直しかた：`program_docs_data.js` の size を実物の値にして、
`python3 _tools/build_page_data.py` で作り直す。


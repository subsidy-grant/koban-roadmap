// documents.html（02の自動入力）と profile.html（会社情報の入力・保存）の両方が使う
// 「複数会社」データの一次データと読み書き関数。
// 2ページで別々に持つと更新漏れが起きるため、ここに1つだけ置く。
// 参照する側は <script src="company_data.js"></script> をこの後の <script> より前に読み込むこと。
//
// 2026-08-15、旧仕様（会社情報は1社分のみ、キー koban_company）から複数会社対応へ拡張。
// 複数会社を持つ経営者（例：美容室を法人と個人事業主で分けている等）を想定し、
// 「会社1」「会社2」のように何社分でも登録・切替できるようにした。
// 旧データ（koban_company）が残っている端末では、初回アクセス時に自動で「会社1」として
// 新形式（koban_companies配列）に移行する。
(function (global) {
  'use strict';

  var K_COMPANY_OLD = 'koban_company';        // 旧形式（1社のみ）。移行元としてのみ読む
  var K_COMPANIES = 'koban_companies';        // 新形式：[{ id, label, ...FIELDS値 }, ...]
  var K_CURRENT_ID = 'koban_currentCompanyId'; // いま選ばれている会社のid

  function load(key, fallback) {
    try { var r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function newId() {
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  // 補助金の様式に繰り返し出てくる項目。ここに無いものは各様式で個別に書く。
  var FIELDS = [
    // 様式には「法人」と「個人事業主」で書く欄が分かれているものがある。
    // 名前や法人番号から推し量ることもできるが、法人番号の入れ忘れなどで
    // 取り違えると別の欄を埋めてしまうので、ここで決めてもらう
    { id: 'entity',    label: '事業形態', opts: [
      { v: '', t: '（選んでください）' }, { v: '法人', t: '法人' }, { v: '個人事業主', t: '個人事業主' }
    ] },
    { id: 'name',      label: '事業者名（商号・屋号）', ph: '例）株式会社○○／○○美容室' },
    { id: 'kana',      label: '事業者名（法人名）フリガナ', ph: '例）カブシキガイシャマルマル' },
    { id: 'houjin',    label: '法人番号（13桁）',       ph: '個人事業主の方は空欄で構いません', mode: 'numeric' },
    { id: 'hokenNo',   label: '雇用保険適用事業所番号',  ph: '例）1301-123456-7' },
    { id: 'officeName', label: '事業所の名称（適用事業所名）', ph: '法人名と同じなら空欄で構いません（例）株式会社○○　△△店' },
    { id: 'zip',       label: '郵便番号',               ph: '例）1500001', mode: 'numeric' },
    { id: 'addr',      label: '所在地',                 ph: '例）東京都渋谷区神宮前1-2-3 ○○ビル4階', big: true },
    { id: 'regZip',    label: '登記上の所在地の郵便番号', ph: '登記上の所在地を書いたときだけ（例）1000005', mode: 'numeric' },
    { id: 'regAddr',   label: '登記上の所在地',         ph: '上の所在地と同じなら空欄で構いません（登記簿の住所が違うときだけ）', big: true },
    { id: 'title',     label: '代表者の役職',           ph: '例）代表取締役／代表' },
    { id: 'rep',       label: '代表者氏名',             ph: '例）山田 太郎' },
    { id: 'repKana',   label: '代表者フリガナ',         ph: '例）ヤマダ タロウ' },
    { id: 'tel',       label: '電話番号',               ph: '例）0312345678', mode: 'tel' },
    { id: 'fax',       label: 'FAX番号',                ph: '無ければ空欄で構いません', mode: 'tel' },
    { id: 'mail',      label: 'メールアドレス',         ph: '例）info@example.jp', mode: 'email' },
    { id: 'founded',   label: '設立年月日・開業日',     ph: '例）平成30年4月1日', inputStyle: 'choice' },
    { id: 'capital',   label: '資本金',                 ph: '例）3,000,000円（個人事業主は空欄）' },
    { id: 'employees', label: '従業員数',               ph: '例）8人（常時使用する従業員）', mode: 'numeric', inputStyle: 'choice' },
    { id: 'industry',  label: '業種',                   ph: '例）美容業', inputStyle: 'choice' },
    { id: 'industryCode', label: '日本標準産業分類の番号', ph: '中分類の2桁（例）78（洗濯・理容・美容・浴場業）', mode: 'numeric' },
    { id: 'business',  label: '事業内容',               ph: '例）美容室の運営。カット・カラー・トリートメント等', big: true },
    { id: 'staff',     label: '担当者氏名',             ph: '代表者と同じなら空欄で構いません' },
    { id: 'staffTel',  label: '担当者の連絡先',         ph: '例）090-1234-5678', mode: 'tel' }
  ];

  // 旧形式（1社のみ）が残っていれば「会社1」として新形式へ1回だけ移行する
  function migrateIfNeeded() {
    var list = load(K_COMPANIES, null);
    if (list) return list; // 既に新形式へ移行済み
    var old = load(K_COMPANY_OLD, null);
    var first = old && Object.keys(old).length
      ? Object.assign({ id: newId(), label: '会社1' }, old)
      : { id: newId(), label: '会社1' };
    list = [first];
    save(K_COMPANIES, list);
    save(K_CURRENT_ID, first.id);
    return list;
  }

  function listCompanies() {
    return migrateIfNeeded();
  }
  function currentId() {
    var list = listCompanies();
    var id = load(K_CURRENT_ID, null);
    if (id && list.some(function (c) { return c.id === id; })) return id;
    return list.length ? list[0].id : null;
  }
  function setCurrentId(id) {
    save(K_CURRENT_ID, id);
  }
  function getCompany(id) {
    var list = listCompanies();
    return list.filter(function (c) { return c.id === id; })[0] || null;
  }
  function getCurrentCompany() {
    var id = currentId();
    return id ? getCompany(id) : null;
  }
  function saveCompany(company) {
    var list = listCompanies();
    var idx = list.findIndex(function (c) { return c.id === company.id; });
    if (idx === -1) list.push(company);
    else list[idx] = company;
    save(K_COMPANIES, list);
    return list;
  }
  function addCompany(label) {
    var list = listCompanies();
    var n = list.length + 1;
    var c = { id: newId(), label: label || ('会社' + n) };
    list.push(c);
    save(K_COMPANIES, list);
    setCurrentId(c.id);
    return c;
  }
  function removeCompany(id) {
    var list = listCompanies().filter(function (c) { return c.id !== id; });
    save(K_COMPANIES, list);
    if (currentId() === id) setCurrentId(list.length ? list[0].id : null);
    return list;
  }
  // 書き出したファイルからの読み込みなど、一覧をまるごと置き換えるとき用
  function replaceAll(list) {
    save(K_COMPANIES, list);
    var stillValid = list.some(function (c) { return c.id === currentId(); });
    if (!stillValid) setCurrentId(list.length ? list[0].id : null);
    return list;
  }

  global.KOBAN_COMPANY = {
    FIELDS: FIELDS,
    list: listCompanies,
    currentId: currentId,
    setCurrentId: setCurrentId,
    get: getCompany,
    getCurrent: getCurrentCompany,
    save: saveCompany,
    add: addCompany,
    remove: removeCompany,
    replaceAll: replaceAll
  };
})(window);

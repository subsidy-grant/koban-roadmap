// =============================================================
// 事業計画書ジェネレーター v2 (審査官視点リデザイン版)
//   設計方針: 1日40件の事業計画書を審査する中小企業診断士が
//   「飽きずに」「一目で」要点を掴めることを最優先とする。
//     ・セクション別カラーコード + 左端カラーレール(紙の書類でも指で引ける)
//     ・数字を主役にした大型スタットタイル
//     ・グラフは1軸1単位。単位が違う指標は必ずグラフを分ける
//     ・相関する指標のみ複合グラフ(折れ線+棒/二軸明示)
//     ・フォント拡大(本文11pt / 表10pt / 図中14px相当)
//     ・余白には実写イメージを配置
//   データ源: _plan_data.json (_build_plans.js が生成)
//   実行: ELECTRON_RUN_AS_NODE=1 Code.exe _build_plans_v2.js [--only 1] [--suffix -sample]
//
//   旧 beauty-ai-factory プロジェクト(2026-07-18作成)から移行。
//   plan-01〜10.html を更新する場合は _build_plans.js → 本スクリプト →
//   _build_plan_excel.py の順に実行し、HTML版とExcel版の数値を一致させること。
// =============================================================
const fs = require("fs");
const path = require("path");
const OUT = __dirname;

const argv = process.argv.slice(2);
const getArg = (k, d) => { const i = argv.indexOf(k); return i >= 0 ? argv[i + 1] : d; };
const ONLY = getArg("--only", null);
const SUFFIX = getArg("--suffix", "");

const DATA = JSON.parse(fs.readFileSync(path.join(OUT, "_plan_data.json"), "utf8"));
const BIZ = DATA.biz;

// ---------- カラー ----------
const C = {
  // mute / gold は 3.6:1・3.66:1 でWCAG AA(4.5:1)未達だったため2026-07-29に濃くした
  // (#8a8178→#6b6359 = 5.6:1、#a8790f→#8a6208 = 5.2:1)。飲食業版と同じ値に揃えている
  ink: "#171310", sub: "#5b544c", mute: "#6b6359", line: "#dcd4c8", soft: "#faf8f4",
  green: "#1f6b46", red: "#b3372c", gold: "#8a6208", navy: "#1f3d63",
  teal: "#0d6e6e", plum: "#63396a", orange: "#bf5a12", brown: "#8a5a2b", blue: "#2b5f8a",
};
// セクション別アクセント(ページを色で識別できるようにする)
const SECT = [
  { t: "1. 事業概要",              f: "事業概要" },
  { t: "2. 現状の課題と労働実態",  f: "現状分析" },
  { t: "3. 導入システムと省力化",  f: "システム" },
  { t: "4. 労働生産性向上の根拠",  f: "生産性" },
  { t: "5. 賃上げ計画(処遇改善)",  f: "賃上げ" },
  { t: "6. 資金計画・投資回収",    f: "資金計画" },
  { t: "7. 実施体制・スケジュール",f: "実施体制" },
  { t: "8. リスクと対応策",        f: "リスク" },
  { t: "9. 地域・業界への波及効果",f: "波及効果" },
  { t: "10. 要件チェック・他制度", f: "要件確認" },
].map(x => ({ ...x, c: C.blue }));  // p6(資金計画)の配色を全ページ共通ベースとする

// ---------- 指標メタ(単位を明示し、グラフを単位別に分割するための定義) ----------
// work : 工数(時間/月) …… 全案共通で「時間」1単位
// out  : アウトプット量 …… 案ごとに単位が異なる(本/件/名 等)
// trend: 相関する2指標 …… 折れ線(累積・流入系)+ 棒(件数系) の複合1グラフ
const KPI = {
  1: { work: { label: "情報発信の月間工数", unit: "時間/月", before: 30, after: 0 },
       out:  { title: "月間ブログ投稿数", unit: "本/月", before: 4, after: 18 },
       trend:{ title: "検索流入と外国人予約の推移(計画値)", line: { label: "検索流入", unit: "PV/月", before: 1200, after: 4820 },
               bar: { label: "外国人客の予約", unit: "件/月", before: 3, after: 23 } } },
  2: { work: { label: "電話応対の月間工数", unit: "時間/月", before: 35, after: 2 },
       out:  { title: "予約の取りこぼし件数", unit: "件/月", before: 31, after: 3, betterDown: true },
       trend:{ title: "時間外予約の獲得とAI完結率の推移(計画値)", line: { label: "AI完結率", unit: "%", before: 0, after: 91 },
               bar: { label: "時間外予約の獲得", unit: "件/月", before: 0, after: 31 } } },
  3: { work: { label: "カルテ記入の月間工数(1人)", unit: "時間/月", before: 25, after: 2 },
       out:  { title: "新人スタイリストの提案採用率", unit: "%", before: 38, after: 71 },
       trend:{ title: "客単価と指名リピート率の推移(計画値)", line: { label: "指名リピート率", unit: "%", before: 54, after: 69 },
               bar: { label: "平均客単価", unit: "百円", before: 96, after: 112 } } },
  4: { work: { label: "MEO運用の月間工数", unit: "時間/月", before: 12, after: 1 },
       out:  { title: "「地域名+美容室」検索順位", unit: "位", before: 14, after: 3, betterDown: true },
       trend:{ title: "口コミ評価と地図経由予約の推移(計画値)", line: { label: "口コミ返信率", unit: "%", before: 40, after: 100 },
               bar: { label: "地図経由の新規予約", unit: "件/月", before: 13, after: 34 } } },
  5: { work: { label: "動画編集の月間工数", unit: "時間/月", before: 15, after: 0 },
       out:  { title: "月間ショート動画 投稿本数", unit: "本/月", before: 2, after: 12 },
       trend:{ title: "若年層比率とリール経由予約の推移(計画値)", line: { label: "新規客の20代以下比率", unit: "%", before: 18, after: 34 },
               bar: { label: "リール経由の新規予約", unit: "件/月", before: 1, after: 9 } } },
  6: { work: { label: "発注・棚卸の月間工数", unit: "時間/月", before: 18, after: 2 },
       out:  { title: "在庫金額指数(導入前=100)", unit: "指数", before: 100, after: 77, betterDown: true },
       trend:{ title: "廃棄ロスと欠品の推移(計画値)", line: { label: "在庫金額指数", unit: "指数", before: 100, after: 77 },
               bar: { label: "廃棄・欠品の発生", unit: "件/月", before: 10, after: 0, betterDown: true } } },
  7: { work: { label: "シフト作成の月間工数", unit: "時間/月", before: 20, after: 1 },
       out:  { title: "急な欠員のカバー率", unit: "%", before: 60, after: 98 },
       trend:{ title: "残業時間と労務違反の推移(計画値)", line: { label: "1人あたり残業", unit: "時間/月", before: 41, after: 29 },
               bar: { label: "労務違反の見落とし", unit: "件/月", before: 5, after: 0, betterDown: true } } },
  8: { work: { label: "マンツーマン指導時間(月換算)", unit: "時間/月", before: 36, after: 12 },
       out:  { title: "教材ライブラリ本数", unit: "本", before: 0, after: 52 },
       trend:{ title: "習熟度とデビュー期間の推移(計画値)", line: { label: "新人の技術習熟度", unit: "%", before: 45, after: 78 },
               bar: { label: "デビュー期間", unit: "か月", before: 38, after: 29, betterDown: true } } },
  9: { work: { label: "経理・レジ締めの月間工数", unit: "時間/月", before: 20, after: 2 },
       out:  { title: "月次試算表の完成(締後日数)", unit: "日", before: 10, after: 2, betterDown: true },
       trend:{ title: "記帳精度とレジ締め時間の推移(計画値)", line: { label: "1日のレジ締め時間", unit: "分/日", before: 30, after: 3 },
               bar: { label: "記帳ミス", unit: "件/月", before: 8, after: 0, betterDown: true } } },
  10:{ work: { label: "フォロー業務の月間工数", unit: "時間/月", before: 12, after: 0 },
       out:  { title: "90日再来店率", unit: "%", before: 54, after: 68 },
       trend:{ title: "LTVと失客率の推移(計画値)", line: { label: "平均LTV指数", unit: "指数", before: 100, after: 122 },
               bar: { label: "月間失客率", unit: "%", before: 32, after: 18, betterDown: true } } },
};

// ---------- 汎用ヘルパ ----------
const nf = n => Number(n).toLocaleString("ja-JP");
// 賃上げ所要額(万円/年) = 引上げ額(円/時) × 年間1,800時間 × 従業員数
const wageWorkCost = up => Math.round(up * 1800 * BIZ.staff / 10000);
function pctChange(before, after) {
  if (before === 0) return { txt: "新規創出", cls: "up" };
  const d = Math.round((after - before) / before * 100);
  if (d >= 0) return { txt: `+${d}%`, cls: "up" };
  return { txt: `${Math.abs(d)}%減`, cls: "down" };
}

// ---------- 図: 大型スタットタイル ----------
function statTile(label, before, after, unit, color, betterDown, opts = {}) {
  const single = before === null || before === undefined;
  let badge, improved = true;
  if (single) {
    badge = opts.badge || "計画値";
  } else {
    improved = betterDown ? after < before : after > before;
    badge = betterDown
      ? (before === 0 ? "—" : `▲${Math.round((before - after) / before * 100)}%`)
      : pctChange(before, after).txt;
  }
  const nums = single
    ? `<span class="tile-after">${nf(after)}</span>`
    : `<span class="tile-pair"><span class="tile-cap">導入前</span><span class="tile-before">${nf(before)}</span></span>`
      + `<span class="tile-arrow">→</span>`
      + `<span class="tile-pair"><span class="tile-cap">導入後</span><span class="tile-after">${nf(after)}</span></span>`;
  return `<div class="tile" style="--tc:${color}">
    <div class="tile-label">${label}</div>
    <div class="tile-nums">${nums}</div>
    <div class="tile-unit">${unit}</div>
    <div class="tile-badge ${improved ? "good" : "bad"}">${badge}</div>
  </div>`;
}

// ---------- 図: 横棒(1軸1単位) ----------
function hbar(title, unit, rows, color, W = 620) {
  const max = Math.max(...rows.map(r => r.v), 1);
  const X0 = Math.round(W * 0.28), X1 = W - Math.round(W * 0.12), rowH = 40;
  const h = 52 + rows.length * rowH + 10;
  const fs = W < 400 ? 13 : 15, fv = W < 400 ? 15 : 17;
  let body = "";
  rows.forEach((r, i) => {
    const y = 52 + i * rowH;
    const w = Math.max(2, (X1 - X0) * r.v / max);
    body += `
      <text x="${X0 - 10}" y="${y + 20}" font-size="${fs}" fill="${C.ink}" text-anchor="end">${r.k}</text>
      <rect x="${X0}" y="${y + 3}" width="${w}" height="24" rx="4" fill="${r.hl ? color : "#c6bcab"}"/>
      <text x="${X0 + w + 8}" y="${y + 22}" font-size="${fv}" font-weight="800" fill="${r.hl ? color : C.sub}">${nf(r.v)}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${h}" width="100%" role="img">
    <text x="0" y="18" font-size="16" font-weight="800" fill="${C.ink}">${title}</text>
    <text x="0" y="38" font-size="13" fill="${C.sub}">単位: ${unit}</text>
    <line x1="${X0}" y1="46" x2="${X0}" y2="${h - 8}" stroke="${C.line}" stroke-width="1.5"/>
    ${body}</svg>`;
}

// ---------- 図: 縦棒(1軸1単位) ----------
function vbar(title, unit, rows, color) {
  const max = Math.max(...rows.map(r => r.v), 1);
  const W = 300, H = 190, base = 140, top = 44;
  const bw = 62, gap = (W - 60 - rows.length * bw) / (rows.length + 1);
  let body = "";
  rows.forEach((r, i) => {
    const x = 40 + gap + i * (bw + gap);
    const bh = Math.max(3, (base - top) * r.v / max);
    body += `
      <rect x="${x}" y="${base - bh}" width="${bw}" height="${bh}" rx="4" fill="${r.hl ? color : "#c6bcab"}"/>
      <text x="${x + bw / 2}" y="${base - bh - 9}" font-size="18" font-weight="800" fill="${r.hl ? color : C.sub}" text-anchor="middle">${nf(r.v)}</text>
      <text x="${x + bw / 2}" y="${base + 22}" font-size="14" fill="${C.ink}" text-anchor="middle">${r.k}</text>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">
    <text x="0" y="18" font-size="16" font-weight="800" fill="${C.ink}">${title}</text>
    <text x="0" y="38" font-size="13" fill="${C.sub}">単位: ${unit}</text>
    <line x1="34" y1="${base}" x2="${W - 6}" y2="${base}" stroke="${C.line}" stroke-width="1.5"/>
    ${body}</svg>`;
}

// ---------- 図: 折れ線 + 棒 の複合(相関する2指標のみ・二軸を明示) ----------
function trendChart(spec, color) {
  const N = 12, IDX = 6; // 前半6か月=導入前 / 後半6か月=導入後
  const ramp = [0.35, 0.62, 0.80, 0.91, 0.97, 1.0];
  const jitter = [1.00, 0.96, 1.02, 0.98, 1.01, 0.97];
  const series = (b, a) => {
    const arr = [];
    for (let i = 0; i < IDX; i++) arr.push(Math.round(b * jitter[i]));
    for (let i = 0; i < N - IDX; i++) arr.push(Math.round(b + (a - b) * ramp[i]));
    return arr;
  };
  const L = series(spec.line.before, spec.line.after);
  const B = series(spec.bar.before, spec.bar.after);
  const lMax = Math.max(...L, 1), bMax = Math.max(...B, 1);
  const X0 = 66, X1 = 562, TOP = 74, BASE = 168, W = 620, H = 230;
  const step = (X1 - X0) / (N - 1);
  const xAt = i => X0 + i * step;
  const yL = v => BASE - (BASE - TOP) * v / lMax;
  const yB = v => BASE - (BASE - TOP) * v / bMax;

  // 棒(右軸)
  let bars = "";
  B.forEach((v, i) => {
    const bh = Math.max(1, BASE - yB(v));
    bars += `<rect x="${xAt(i) - 13}" y="${BASE - bh}" width="26" height="${bh}" rx="3" fill="${i < IDX ? "#d8cfbf" : "#a9c6b4"}"/>`;
  });
  // 折れ線(左軸)
  const pts = L.map((v, i) => `${xAt(i)},${yL(v)}`).join(" ");
  const dots = L.map((v, i) => `<circle cx="${xAt(i)}" cy="${yL(v)}" r="4.5" fill="${i < IDX ? C.mute : color}"/>`).join("");
  // 目盛
  const gy = [0, 0.5, 1].map(f => {
    const y = BASE - (BASE - TOP) * f;
    return `<line x1="${X0 - 8}" y1="${y}" x2="${X1 + 8}" y2="${y}" stroke="${C.line}" stroke-dasharray="3 4"/>
      <text x="${X0 - 14}" y="${y + 5}" font-size="12" fill="${C.sub}" text-anchor="end">${nf(Math.round(lMax * f))}</text>
      <text x="${X1 + 14}" y="${y + 5}" font-size="12" fill="${C.sub}">${nf(Math.round(bMax * f))}</text>`;
  }).join("");
  // 月ラベル
  const xl = L.map((_, i) => {
    const m = i < IDX ? `▲${IDX - i}` : `+${i - IDX + 1}`;
    return `<text x="${xAt(i)}" y="${BASE + 22}" font-size="11.5" fill="${C.sub}" text-anchor="middle">${m}</text>`;
  }).join("")
  + `<text x="${(X0 + X1) / 2}" y="${BASE + 42}" font-size="12.5" fill="${C.ink}" text-anchor="middle">`
  + `横軸:システム導入からの経過月数(単位:か月 / ▲=導入前、+=導入後)</text>`;
  const divX = (xAt(IDX - 1) + xAt(IDX)) / 2;

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img">
    <text x="0" y="18" font-size="16" font-weight="800" fill="${C.ink}">${spec.title}</text>
    <line x1="0" y1="36" x2="26" y2="36" stroke="${color}" stroke-width="3.2"/>
    <circle cx="13" cy="36" r="4.5" fill="${color}"/>
    <text x="34" y="41" font-size="13" fill="${C.sub}">左軸:${spec.line.label}(${spec.line.unit})</text>
    <rect x="330" y="28" width="16" height="16" rx="3" fill="#a9c6b4"/>
    <text x="354" y="41" font-size="13" fill="${C.sub}">右軸:${spec.bar.label}(${spec.bar.unit})</text>
    <line x1="${X0 - 8}" y1="${TOP - 6}" x2="${X0 - 8}" y2="${BASE}" stroke="${C.line}" stroke-width="1.5"/>
    <line x1="${X1 + 8}" y1="${TOP - 6}" x2="${X1 + 8}" y2="${BASE}" stroke="${C.line}" stroke-width="1.5"/>
    ${gy}
    <line x1="${X0 - 8}" y1="${BASE}" x2="${X1 + 8}" y2="${BASE}" stroke="${C.sub}" stroke-width="1.5"/>
    ${bars}
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linejoin="round"/>
    ${dots}
    <line x1="${divX}" y1="${TOP - 12}" x2="${divX}" y2="${BASE}" stroke="${C.red}" stroke-width="2" stroke-dasharray="6 4"/>
    <rect x="${divX - 44}" y="${TOP - 30}" width="88" height="20" rx="10" fill="${C.red}"/>
    <text x="${divX}" y="${TOP - 16}" font-size="12.5" font-weight="800" fill="#fff" text-anchor="middle">システム導入</text>
    ${xl}
    <text x="0" y="${H - 4}" font-size="11.5" fill="${C.mute}">※ 導入前は直近実績、導入後は本計画に基づく見込値。相関する2指標を左右2軸で1図に集約。</text>
  </svg>`;
}

// ---------- 図: 累積キャッシュフロー(万円・単一単位) ----------
function cfChart(rows, color) {
  const vals = rows.map(r => r.cum);
  const min = Math.min(...vals, 0), max = Math.max(...vals, 0);
  const span = (max - min) || 1;
  const X0 = 60, X1 = 600, TOP = 46, BOT = 196;
  const bw = (X1 - X0) / rows.length;
  const y0 = TOP + (BOT - TOP) * max / span;
  // 負の棒は0線より下へ伸びる。ラベル行が重ならないよう、最深部の下に軸ラベル行を置く。
  const negH = (BOT - TOP) * Math.abs(Math.min(min, 0)) / span;
  const labelY = Math.max(BOT + 26, y0 + negH + 40);
  const svgH = labelY + 48;
  let body = "", beIdx = rows.findIndex(r => r.cum >= 0);
  rows.forEach((r, i) => {
    const x = X0 + i * bw + 10;
    const w = bw - 20;
    const h = (BOT - TOP) * Math.abs(r.cum) / span;
    const pos = r.cum >= 0;
    body += `<rect x="${x}" y="${pos ? y0 - h : y0}" width="${w}" height="${h}" rx="4" fill="${pos ? color : C.red}"/>
      <text x="${x + w / 2}" y="${pos ? y0 - h - 9 : y0 + h + 20}" font-size="16" font-weight="800" fill="${pos ? color : C.red}" text-anchor="middle">${r.cum > 0 ? "+" : ""}${nf(r.cum)}</text>
      <text x="${x + w / 2}" y="${labelY}" font-size="14" fill="${C.ink}" text-anchor="middle">${r.y}</text>`;
  });
  let marker = "";
  if (beIdx > 0) {
    // 棒の「間」に引くことで、棒の上に置く数値ラベルと点線が重ならないようにする
    const x = X0 + beIdx * bw;
    marker = `<line x1="${x}" y1="${TOP - 2}" x2="${x}" y2="${labelY + 6}" stroke="${C.green}" stroke-width="2" stroke-dasharray="6 4"/>
      <rect x="${x - 56}" y="${labelY + 12}" width="112" height="22" rx="11" fill="${C.green}"/>
      <text x="${x}" y="${labelY + 27}" font-size="12.5" font-weight="800" fill="#fff" text-anchor="middle">ここで投資回収</text>`;
  }
  return `<svg viewBox="0 0 620 ${svgH}" width="100%" role="img">
    <text x="0" y="18" font-size="16" font-weight="800" fill="${C.ink}">累積キャッシュフロー(自己負担ベース)</text>
    <text x="620" y="18" font-size="14" fill="${C.sub}" text-anchor="end">単位: 万円</text>
    <line x1="${X0 - 10}" y1="${y0}" x2="${X1 + 6}" y2="${y0}" stroke="${C.sub}" stroke-width="1.5"/>
    <text x="${X0 - 16}" y="${y0 + 5}" font-size="13" fill="${C.sub}" text-anchor="end">0</text>
    ${marker}${body}</svg>`;
}

// ---------- 図: 賃金推移(文字重なりを解消) ----------
function wageChart(d, color) {
  const rows = [
    { k: "現行", v: d.wage_before, hl: false },
    { k: "計画1年目", v: d.wage_after1, hl: true },
    { k: "計画3年目", v: d.wage_after3, hl: true },
  ];
  const BASEV = 1100; // 目盛の下限(差を見やすくする)
  const max = Math.max(...rows.map(r => r.v));
  const X0 = 78, TOP = 50, BASE = 166, W = 300;
  const bw = 46, gap = (W - X0 - 14 - rows.length * bw) / (rows.length + 1);
  let body = "";
  rows.forEach((r, i) => {
    const x = X0 + gap + i * (bw + gap);
    const h = (BASE - TOP) * (r.v - BASEV) / (max - BASEV);
    body += `<rect x="${x}" y="${BASE - h}" width="${bw}" height="${h}" rx="4" fill="${r.hl ? color : "#c6bcab"}"/>
      <text x="${x + bw / 2}" y="${BASE - h - 10}" font-size="16" font-weight="800" fill="${r.hl ? color : C.sub}" text-anchor="middle">${nf(r.v)}</text>
      <text x="${x + bw / 2}" y="${BASE + 20}" font-size="12.5" fill="${C.ink}" text-anchor="middle">${r.k}</text>`;
  });
  const yMin = BASE - (BASE - TOP) * (1163 - BASEV) / (max - BASEV);
  return `<svg viewBox="0 0 ${W} 210" width="100%" role="img">
    <text x="0" y="16" font-size="14" font-weight="800" fill="${C.ink}">事業場内最低賃金の推移</text>
    <text x="0" y="34" font-size="12" fill="${C.sub}">単位: 円/時 (縦軸は${nf(BASEV)}円起点)</text>
    <line x1="${X0 - 6}" y1="${TOP - 8}" x2="${X0 - 6}" y2="${BASE}" stroke="${C.line}" stroke-width="1.5"/>
    <line x1="${X0 - 6}" y1="${BASE}" x2="${W - 6}" y2="${BASE}" stroke="${C.sub}" stroke-width="1.5"/>
    <line x1="${X0 - 6}" y1="${yMin}" x2="${W - 6}" y2="${yMin}" stroke="${C.red}" stroke-dasharray="5 4" stroke-width="1.5"/>
    <text x="${X0 - 10}" y="${yMin + 4}" font-size="11" fill="${C.red}" text-anchor="end">東京都</text>
    <text x="${X0 - 10}" y="${yMin + 16}" font-size="11" fill="${C.red}" text-anchor="end">最低賃金</text>
    <text x="${X0 - 10}" y="${yMin + 28}" font-size="11" fill="${C.red}" text-anchor="end">1,163円</text>
    ${body}
    <text x="${W / 2}" y="202" font-size="11.5" fill="${C.mute}" text-anchor="middle">法定最低賃金を全期間で上回る水準を維持する</text>
  </svg>`;
}

// ---------- 図: リスクマトリクス(対応前→対応後の移動を矢印で明示) ----------
function riskMatrix(risks, color) {
  const X0 = 112, X1 = 566, TOP = 42, BOT = 198;
  const gx = i => X0 + (X1 - X0) * i / 3;
  const gy = i => TOP + (BOT - TOP) * i / 3;
  // 3x3 ゾーン: 左下(低確率・低影響)=許容可能 / 右上(高確率・高影響)=重大
  // zc[r][c] の r=0 は最上段(=影響度 高)
  let zones = "";
  const zc = [["#fdf3e3", "#fbe6e2", "#f7d3cc"],
              ["#eaf3ec", "#fdf3e3", "#fbe6e2"],
              ["#eaf3ec", "#eaf3ec", "#fdf3e3"]];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++)
    zones += `<rect x="${gx(c)}" y="${gy(r)}" width="${(X1 - X0) / 3}" height="${(BOT - TOP) / 3}" fill="${zc[r][c]}" stroke="#fff" stroke-width="2"/>`;
  // 座標(0..3スケール, [発生確率, 影響度]) 対応前(右上) → 対応後(左下寄り)
  // 対応策は主に発生確率を下げる。影響度は完全には消えないため小幅の低下に留める。
  const pts = [
    { n: "①", b: [2.5, 2.4], a: [0.8, 1.7], t: risks[0] },
    { n: "②", b: [2.1, 1.7], a: [0.6, 1.1], t: risks[1] },
    { n: "③", b: [2.7, 1.2], a: [1.2, 0.6], t: risks[2] },
  ];
  const px = v => X0 + (X1 - X0) * v / 3;
  const py = v => BOT - (BOT - TOP) * v / 3;
  let marks = `<defs><marker id="ah" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L6,3 L0,6 z" fill="${C.ink}"/></marker></defs>`;
  pts.forEach(p => {
    // 終点を円の手前で止める(円が矢印の頭を覆い隠すのを防ぐ)
    const x1 = px(p.b[0]), y1 = py(p.b[1]), x2 = px(p.a[0]), y2 = py(p.a[1]);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const ex = x2 - dx / len * 24, ey = y2 - dy / len * 24;
    const sx = x1 + dx / len * 17, sy = y1 + dy / len * 17;
    marks += `
      <line x1="${sx}" y1="${sy}" x2="${ex}" y2="${ey}" stroke="${C.ink}" stroke-width="2.4" stroke-dasharray="5 4" marker-end="url(#ah)"/>
      <circle cx="${px(p.b[0])}" cy="${py(p.b[1])}" r="15" fill="#fff" stroke="${C.red}" stroke-width="2.5"/>
      <text x="${px(p.b[0])}" y="${py(p.b[1]) + 5}" font-size="14" font-weight="800" fill="${C.red}" text-anchor="middle">${p.n}</text>
      <circle cx="${px(p.a[0])}" cy="${py(p.a[1])}" r="15" fill="${C.green}" stroke="#fff" stroke-width="2"/>
      <text x="${px(p.a[0])}" y="${py(p.a[1]) + 5}" font-size="14" font-weight="800" fill="#fff" text-anchor="middle">${p.n}</text>`;
  });
  const axLabel = ["低", "中", "高"];
  let ticks = "";
  axLabel.forEach((t, i) => {
    ticks += `<text x="${gx(i) + (X1 - X0) / 6}" y="${BOT + 22}" font-size="13.5" fill="${C.sub}" text-anchor="middle">${t}</text>
      <text x="${X0 - 14}" y="${gy(2 - i) + (BOT - TOP) / 6 + 5}" font-size="13.5" fill="${C.sub}" text-anchor="end">${t}</text>`;
  });
  return `<svg viewBox="0 0 620 300" width="100%" role="img">
    <text x="0" y="18" font-size="16" font-weight="800" fill="${C.ink}">リスクマトリクス:対応策による移動</text>
    <circle cx="300" cy="13" r="8" fill="#fff" stroke="${C.red}" stroke-width="2.5"/>
    <text x="313" y="18" font-size="13" fill="${C.sub}">対応前</text>
    <text x="356" y="18" font-size="14" fill="${C.ink}">→</text>
    <circle cx="382" cy="13" r="8" fill="${C.green}"/>
    <text x="395" y="18" font-size="13" fill="${C.sub}">対応後</text>
    <text x="620" y="18" font-size="13" fill="${C.sub}" text-anchor="end">縦=影響度 / 横=発生確率</text>
    ${zones}${marks}${ticks}
    <text x="${(X0 + X1) / 2}" y="${BOT + 44}" font-size="14" fill="${C.ink}" text-anchor="middle">発生確率 が高い →</text>
    <text x="${X0 - 62}" y="${(TOP + BOT) / 2}" font-size="14" fill="${C.ink}" text-anchor="middle" transform="rotate(-90 ${X0 - 62} ${(TOP + BOT) / 2})">影響度 が大きい →</text>
    <rect x="${X0}" y="${BOT + 56}" width="16" height="16" rx="3" fill="#f7d3cc"/>
    <text x="${X0 + 22}" y="${BOT + 69}" font-size="13" fill="${C.sub}">重大(要経営判断)</text>
    <rect x="${X0 + 160}" y="${BOT + 56}" width="16" height="16" rx="3" fill="#fdf3e3"/>
    <text x="${X0 + 182}" y="${BOT + 69}" font-size="13" fill="${C.sub}">要監視</text>
    <rect x="${X0 + 268}" y="${BOT + 56}" width="16" height="16" rx="3" fill="#eaf3ec"/>
    <text x="${X0 + 290}" y="${BOT + 69}" font-size="13" fill="${C.sub}">許容可能(対応後の到達域)</text>
  </svg>`;
}

// ---------- HTML部品 ----------
function stepFlow(steps) {
  const items = steps.map((t, i) => {
    const txt = String(t).replace(/\n/g, "");
    return `<div class="step"><div class="step-no">STEP ${i + 1}</div><div class="step-t">${txt}</div></div>`
      + (i < steps.length - 1 ? `<div class="step-ar">▶</div>` : "");
  }).join("");
  return `<div class="stepflow">${items}</div>`;
}
function timelineHtml(months) {
  return `<div class="tl">
    <div class="tl-rail"><span class="tl-head"></span></div>
    <div class="tl-items">
      ${months.map(m => `<div class="tl-item">
        <div class="tl-m">${m.m}</div><div class="tl-dot"></div>
        <div class="tl-l">${m.label.replace(/\n/g, "<br>")}</div></div>`).join("")}
    </div>
    <div class="tl-cap">時間の流れ(交付決定を起点とする) →</div>
  </div>`;
}
function problemTree(items, concl) {
  return `<div class="tree">
    <div class="tree-top">人手不足・時間不足という構造的制約</div>
    <div class="tree-conn"><span class="tc-v"></span><span class="tc-b"></span></div>
    <div class="tree-row">${items.map(t => `<div class="tree-box">${t}</div>`).join("")}</div>
    <div class="tree-down">▼</div>
    <div class="tree-concl">${concl}</div>
  </div>`;
}
function rippleFig() {
  // 「どこまで波及するか」を段階の広がりで示す(内→外)
  const stages = [
    { w: 62, cls: "s1", n: "STEP 1", h: "自店", d: "省力化で創出した時間を高付加価値業務へ再配分し、賃上げを実現" },
    { w: 80, cls: "s2", n: "STEP 2", h: "美容業界(同業)", d: "同業へ横展開できる省力化モデルを提示し、業界の人手不足を緩和" },
    { w: 100, cls: "s3", n: "STEP 3", h: "地域経済", d: "雇用の質の向上と来訪者満足度の底上げで、地域全体の競争力に貢献" },
  ];
  return `<div class="ripple">
    <div class="rp-axis">波及の広がり</div>
    ${stages.map((x, i) => `
      <div class="rp-stage ${x.cls}" style="width:${x.w}%">
        <div class="rp-n">${x.n}</div>
        <div class="rp-h">${x.h}</div>
        <div class="rp-d">${x.d}</div>
      </div>${i < stages.length - 1 ? '<div class="rp-ar">▼</div>' : ""}`).join("")}
  </div>`;
}

function photo(src, caption, size = "") {
  return `<figure class="ph-fig ${size}"><img src="img/${src}" alt=""><figcaption>${caption}</figcaption></figure>`;
}

// ---------- ページ枠 ----------
function page(n, total, sect, body, opts = {}) {
  return `<section class="page" style="--sc:${sect.c}">
    <div class="rail"></div>
    <div class="phead">
      <div class="phead-l"><span class="phead-chip">${sect.f}</span><span class="phead-t">${sect.t}</span></div>
      <span class="phead-n">${n} <small>/ ${total}</small></span>
    </div>
    <div class="pbody">${body}</div>
    <div class="pfoot"><span>${BIZ.name} 事業計画書</span><span>${opts.foot || sect.f}</span></div>
  </section>`;
}

// ---------- 本体 ----------
function buildPlan(d) {
  const s = d.scheme_info;
  const k = KPI[d.no];
  const total = 10;
  const isKaizen = d.scheme === "業務改善";
  const wageUp = d.wage_up_applied;
  const monthlyValue = Math.round(d.saveY / 12 * 10) / 10;

  // ===== P1 事業概要 =====
  const P1 = `
    <div class="hero">
      <div class="hero-main">
        <span class="hero-badge">${s.badge} 申請</span>
        <h1>${d.title}</h1>
        <p class="hero-sub">${d.sub}</p>
      </div>
      ${photo("salon.jpg", "申請者イメージ:表参道の小規模ヘアサロン(5席・従業員5名)")}
    </div>

    <div class="block">
    <div class="head-strip">本事業のインパクト(1分で掴む要点)</div>
    <div class="tiles t4">
      ${statTile("対象業務の月間工数", k.work.before, k.work.after, k.work.unit, C.navy, true)}
      ${statTile(k.out.title, k.out.before, k.out.after, k.out.unit, C.blue, !!k.out.betterDown)}
      ${statTile("年間の収益改善効果", null, d.saveY, "万円/年", C.green, false, { badge: `年商比 +${(d.saveY / BIZ.salesYen * 100).toFixed(1)}%` })}
      ${statTile("投資回収期間", null, d.roi, "年", C.gold, false, { badge: "自己負担ベース" })}
    </div></div>

    <div class="split">
      <div class="half">
        <h3>申請者概要</h3>
        <table class="kv pair">
          <tr><td>事業者名</td><td>${BIZ.name}</td></tr>
          <tr><td>業種 / 所在地</td><td>${BIZ.type} / ${BIZ.area}</td></tr>
          <tr><td>創業 / 規模</td><td>${BIZ.founded} / ${BIZ.staff}名・${BIZ.seats}席</td></tr>
          <tr><td>年商 / 月商</td><td><b>${BIZ.salesYen}万円</b> / ${BIZ.salesMYen}万円</td></tr>
          <tr><td>一人当たり年商</td><td>${Math.round(BIZ.salesYen / BIZ.staff)}万円</td></tr>
        </table>
      </div>
      <div class="half">
        <h3>本事業のサマリー</h3>
        <table class="kv pair">
          <tr><td>投資総額</td><td><b>${d.inv}万円</b></td></tr>
          <tr><td>補助率</td><td>${s.rate.split("(")[0]}</td></tr>
          <tr><td>補助見込</td><td><b class="sc">${s.subAmt}万円</b></td></tr>
          <tr><td>自己負担</td><td>${s.self}万円</td></tr>
          <tr><td>年商に対する収益改善率</td><td><b>+${(d.saveY / BIZ.salesYen * 100).toFixed(1)}%</b>(年${d.saveY}万円)</td></tr>
        </table>
      </div>
    </div>
    <div class="callout"><b>本事業の狙い:</b> ${d.sub}。省力化により創出した月${d.saveH}時間を、より付加価値の高い接客・技術・提案へ再配分し、一人当たり労働生産性の向上と従業員の処遇改善を同時に実現する。</div>`;

  // ===== P2 現状の課題 =====
  const P2 = `
    <p class="lead big">${d.problemLead}</p>

    <div class="block">
    <div class="head-strip">この業務が「いま」どうなっているか — 導入により何がどう変わるか</div>
    <div class="tiles t3">
      ${statTile(k.work.label, k.work.before, k.work.after, k.work.unit, C.blue, true)}
      ${statTile(k.out.title, k.out.before, k.out.after, k.out.unit, C.navy, !!k.out.betterDown)}
      ${statTile(k.trend.bar.label, k.trend.bar.before, k.trend.bar.after, k.trend.bar.unit, C.teal, !!k.trend.bar.betterDown)}
    </div></div>

    <div class="split">
      <div class="half">
        <h3>現状の労働実態(課題の定量化)</h3>
        <table class="data">
          <tr><th>項目</th><th>現状</th></tr>
          <tr><td>対象業務の月間工数</td><td><b>約${d.saveH + 2}時間</b></td></tr>
          <tr><td>担当</td><td>店長・スタイリストが兼務</td></tr>
          <tr><td>発生タイミング</td><td>営業時間中/閉店後の残業</td></tr>
          <tr><td>属人性</td><td>高(特定者に依存)</td></tr>
          <tr><td>ミス・機会損失</td><td>恒常的に発生</td></tr>
        </table>
      </div>
      <div class="half">
        <h3>この工数が経営に与えている影響</h3>
        <div class="callout tall"><b>なぜ看過できないか:</b> 対象業務は付加価値を生まない間接業務でありながら、貴重な有資格者(美容師)の時間を月${d.saveH + 2}時間奪っている。年商${BIZ.salesYen}万円・従業員${BIZ.staff}名の小規模事業者にとって、この時間を施術・提案・育成へ振り向けられるか否かが、生産性向上と賃上げ原資の確保を左右する。</div>
      </div>
    </div>

    <div class="block"><h3 style="margin-top:0">課題の構造(なぜ今、投資が必要か)</h3>
    ${problemTree(
      ["間接業務に時間を奪われ、<br>本業に集中できない",
       "有資格者が<br>低付加価値作業に従事",
       "残業・属人化・<br>ミスが常態化する"],
      "→ 労働生産性と処遇改善の停滞(本事業で解決する課題)")}</div>
    <p class="note">※ 本計画の数値は業界実態に基づくデモ用の仮置きです。実申請時には自社の勤怠記録・POS実績等の裏付けデータに差し替えます。</p>`;

  // ===== P3 導入システム =====
  const P3 = `
    <p class="lead big">本事業では、${d.title.replace(/による.*/, "")}を導入する。人手で行ってきた一連の業務をAIが自動実行し、担当者は最終確認・承認のみを行う体制へ移行する。</p>

    <h3>省力化プロセス(5ステップの自動化)</h3>
    ${stepFlow(d.flow)}

    <div class="split ba">
      <div class="half">
        <div class="ba-h before">Before:現行フロー(人手)</div>
        <ul class="ul">
          <li>担当者が手作業で全工程を実施</li>
          <li>作業が営業時間・閉店後を圧迫</li>
          <li>品質・スピードが担当者に依存</li>
          <li>記録・転記漏れやミスが発生</li>
        </ul>
      </div>
      <div class="half">
        <div class="ba-h after">After:AI自動化フロー</div>
        <ul class="ul on">
          <li>AIが自動実行、担当は承認のみ</li>
          <li>24時間・無人でも業務が進行</li>
          <li>品質を標準化・均一化</li>
          <li>記録は自動化しミスを排除</li>
        </ul>
      </div>
    </div>

    <div class="split">
      <div class="half-2">
        <h3>本システムの差別化要因</h3>
        <p class="lead">${d.distinct}</p>
        <div class="callout"><b>実機デモによる裏付け:</b> 本システムの動作は付属のプロトタイプ(prototypes/${d.proto})で実際に操作・確認できる。画面遷移・AI出力・効果数値を再現しており、審査における実現可能性の裏付けとする。</div>
      </div>
      <div class="half-1">${photo("office.jpg", "担当者は端末上で最終確認・承認を行うのみ")}</div>
    </div>

    <h3>自動化のスコープ(責任範囲の明確化)</h3>
    <div class="split">
      <div class="half">
        <div class="ba-h after">AIが自動実行する範囲</div>
        <ul class="ul on">${d.flow.map(t => `<li>${String(t).replace(/\n/g, "")}</li>`).join("")}</ul>
      </div>
      <div class="half">
        <div class="ba-h before">人が担う範囲(最終責任)</div>
        <ul class="ul">
          <li>AI出力の内容確認と公開承認</li>
          <li>例外事象・顧客対応の判断</li>
          <li>月次KPIレビューと改善指示</li>
          <li>アカウント・権限・データの管理</li>
          <li>最終的な事業判断と責任の所在</li>
        </ul>
      </div>
    </div>
    <p class="note">※ AIは判断の補助と定型作業の代行に限定し、対外的な責任を伴う判断は必ず人が行う。責任範囲を明文化することで、導入後の運用リスクとガバナンス上の懸念を回避する。</p>`;

  // ===== P4 生産性の定量根拠 =====
  const P4 = `
    <div class="head-strip">単位の異なる指標は、グラフを分けて表示しています</div>
    <div class="split">
      <div class="half">
        <div class="figbox">${hbar("① 対象業務の月間工数", k.work.unit,
          [{ k: "導入前", v: k.work.before }, { k: "導入後", v: k.work.after, hl: true }], C.blue, 300)}</div>
      </div>
      <div class="half">
        <div class="figbox">${vbar("② " + k.out.title, k.out.unit,
          [{ k: "導入前", v: k.out.before }, { k: "導入後", v: k.out.after, hl: true }], C.blue)}</div>
      </div>
    </div>
    <div class="figbox">${trendChart(k.trend, C.blue)}</div>

    <h3>導入前後の業務指標(一覧)</h3>
    <table class="data wide">
      <tr><th>指標</th><th>導入前</th><th>導入後</th><th>改善</th></tr>
      ${d.effectRows.map(r => `<tr><td>${r[0]}</td><td class="bef">${r[1]}</td><td><b>${r[2]}</b></td><td class="up">${r[3]}</td></tr>`).join("")}
    </table>
    <div class="split">
      <div class="half">
        <div class="callout small"><b>労働生産性の算定:</b> 月間${d.saveH}時間の省力化は年換算で約${d.saveH * 12}時間。これを平均時間単価で換算し、創出時間の高付加価値業務への再配分と合わせ、一人当たり付加価値額の年平均成長率<b>+${d.growth_pct}%以上</b>を見込む。</div>
      </div>
      <div class="half">
        <div class="callout small"><b>売上・利益への波及:</b> 年商${BIZ.salesYen}万円(月商${BIZ.salesMYen}万円)に対し、削減時間の再配分と本システムによる直接的な売上効果により、<b>年間約${d.saveY}万円(月あたり約${monthlyValue}万円)</b>の収益改善を見込む。</div>
      </div>
    </div>`;

  // ===== P5 賃上げ計画 =====
  const P5 = `
    <div class="callout scheme"><b>${s.badge}の賃金要件:</b> ${s.wage}</div>
    <div class="split">
      <div class="half">
        <h3>賃金引上げ計画</h3>
        <table class="data">
          <tr><th>区分</th><th>現行</th><th>計画</th></tr>
          <tr><td>事業場内最低賃金</td><td>${nf(d.wage_before)}円</td><td><b class="sc">${nf(d.wage_after1)}円</b></td></tr>
          <tr><td>引上げ額</td><td>—</td><td><b>+${wageUp}円</b></td></tr>
          <tr><td>給与総額</td><td>基準</td><td>+3.5%/年</td></tr>
          <tr><td>対象者</td><td colspan="2">全従業員${BIZ.staff}名(雇用保険被保険者)</td></tr>
        </table>
      </div>
      <div class="half">
        <div class="figbox">${wageChart(d, C.blue)}</div>
        ${photo("salonwork.jpg", "処遇改善は、技術者の定着とサービス品質の維持に直結する", "sm")}
      </div>
    </div>

    <h3>賃上げ原資の試算(年額) — 補助金に依存しない持続性の検証</h3>
    <table class="data wide">
      <tr><th>区分</th><th class="num">金額・数量</th><th>算定根拠</th></tr>
      <tr><td>① 省力化による創出時間</td><td class="num">${d.saveH * 12}時間/年</td><td>月${d.saveH}時間 × 12か月</td></tr>
      <tr><td>② 本事業による収益改善効果</td><td class="num">${d.saveY}万円/年</td><td>省力化＋売上効果の合計(P4に定量根拠)</td></tr>
      <tr><td>③ 保守・運用費</td><td class="num">▲${d.opex}万円/年</td><td>②の18%を継続コストとして計上</td></tr>
      <tr><td>④ 賃上げ所要額</td><td class="num">▲${wageWorkCost(wageUp)}万円/年</td><td>+${wageUp}円/時 × 年間1,800時間 × ${BIZ.staff}名</td></tr>
      <tr class="sum"><td>差引 余剰(賃上げの持続可能性)</td><td class="num">+${d.netY - wageWorkCost(wageUp)}万円/年</td><td>② − ③ − ④ がプラスであることを確認</td></tr>
    </table>
    <p class="note">※ 差引がプラスであるため、本賃上げは補助金に依存せず事業収益で継続的に負担可能であり、借入返済(P6)を考慮しても資金繰り上の無理は生じない。</p>

    <h3>社会保険労務士の視点(処遇改善の実効性)</h3>
    <ul class="ul on big">
      <li><b>原資の確保:</b> 上表のとおり本事業の収益改善が賃上げ所要額を上回り、無理のない持続的な引上げを実現する。</li>
      <li><b>就業規則の整備:</b> 賃金規程を改定し、事業場内最低賃金の引上げを規程上も明確化。労働条件通知書へ反映する。</li>
      <li><b>労働時間の適正化:</b> 省力化で残業を圧縮し、有給取得を促進。働きやすさと処遇の両面で職場を改善する。</li>
    </ul>`;

  // ===== P6 資金計画 =====
  const P6 = `
    <div class="split">
      <div class="half">
        <h3>投資内訳</h3>
        <table class="data">
          <tr><th>項目</th><th class="num">金額</th></tr>
          ${d.invItems.map(([a, b]) => `<tr><td>${a}</td><td class="num">${b}万円</td></tr>`).join("")}
          <tr class="sum"><td>投資総額</td><td class="num">${d.inv}万円</td></tr>
          <tr><td>補助金(${s.rate.split("(")[0]})</td><td class="num sc">▲${s.subAmt}万円</td></tr>
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
        <div class="callout small">補助金は精算払いのため、つなぎ資金を金融機関借入で確保。返済は本事業の収益改善キャッシュフロー(年${d.netY}万円)で賄う計画とし、資金繰りの安全性を確保する。</div>
      </div>
    </div>
    <div class="figbox">${cfChart(d.cf, C.blue)}</div>
    <table class="data wide">
      <tr><th>区分</th><th>導入時</th><th>1年目</th><th>2年目</th><th>3年目</th></tr>
      <tr><td>収益改善効果</td><td>—</td><td>${d.saveY}万円</td><td>${d.saveY}万円</td><td>${d.saveY}万円</td></tr>
      <tr><td>保守・運用費</td><td>—</td><td>▲${d.opex}万円</td><td>▲${d.opex}万円</td><td>▲${d.opex}万円</td></tr>
      <tr><td>減価償却(定額・5年)</td><td>—</td><td>${Math.round(d.inv / 5)}万円</td><td>${Math.round(d.inv / 5)}万円</td><td>${Math.round(d.inv / 5)}万円</td></tr>
      <tr class="sum"><td>年間純効果</td><td class="neg">▲${s.self}万円</td><td>+${d.netY}万円</td><td>+${d.netY}万円</td><td>+${d.netY}万円</td></tr>
    </table>
    <p class="note">投資回収期間 約${d.roi}年(自己負担ベース)。税務上はソフトウェア等を無形固定資産として計上し定額法で償却。中小企業向け税制の活用余地も税理士と精査する。</p>`;

  // ===== P7 実施体制 =====
  const P7 = `
    <h3>実施スケジュール(交付決定を起点とする6か月計画)</h3>
    ${timelineHtml([
      { m: "1か月目", label: "交付決定後\n要件定義" },
      { m: "2-3か月", label: "システム構築\n既存連携" },
      { m: "4か月目", label: "試験運用\nデータ移行" },
      { m: "5か月目", label: "スタッフ研修\n本稼働" },
      { m: "6か月〜", label: "効果測定\n改善運用" },
    ])}
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
        ${photo("meeting.jpg", "月次で専門家と効果測定・改善検討を行う体制を敷く")}
      </div>
      <div class="half">
        <h3>専門家連携</h3>
        <ul class="ul on big">
          <li><b>中小企業診断士:</b> 事業計画の実現性・生産性向上効果を監修</li>
          <li><b>税理士:</b> 資金計画・投資回収・減価償却・補助金経理を支援</li>
          <li><b>社会保険労務士:</b> 賃上げ計画・就業規則・労務要件を監修</li>
          <li><b>ITベンダー:</b> システム構築・保守・運用定着を担当</li>
        </ul>
        <div class="callout alert"><b>交付決定前の発注厳禁:</b> 本事業の設備投資・契約は必ず交付決定後に着手する(事前着手は補助対象外)。上記スケジュールは交付決定を起点として設計している。</div>
      </div>
    </div>

    <h3>効果測定の方法(月次モニタリング指標)</h3>
    <table class="data wide">
      <tr><th>管理指標</th><th>目標値</th><th>測定方法・データ源</th><th>頻度</th><th>責任者</th></tr>
      <tr><td>${k.work.label}</td><td><b>${nf(k.work.after)}${k.work.unit}</b></td><td>勤怠記録・作業ログ</td><td>月次</td><td>店長</td></tr>
      <tr><td>${k.out.title}</td><td><b>${nf(k.out.after)}${k.out.unit}</b></td><td>システム管理画面の実績値</td><td>月次</td><td>店長</td></tr>
      <tr><td>${k.trend.line.label}</td><td><b>${nf(k.trend.line.after)}${k.trend.line.unit}</b></td><td>解析ツール・予約システム</td><td>月次</td><td>店長</td></tr>
      <tr><td>${k.trend.bar.label}</td><td><b>${nf(k.trend.bar.after)}${k.trend.bar.unit}</b></td><td>予約・顧客データベース</td><td>月次</td><td>店長</td></tr>
      <tr><td>一人当たり付加価値額</td><td><b>年+${d.growth_pct}%</b></td><td>試算表・POS売上データ</td><td>四半期</td><td>顧問税理士</td></tr>
      <tr><td>事業場内最低賃金</td><td><b>${nf(d.wage_after1)}円</b></td><td>賃金台帳・労働条件通知書</td><td>年次</td><td>顧問社労士</td></tr>
    </table>
    <p class="note">※ 計画未達の場合は、四半期レビューで原因を分析し、AIの設定・運用フロー・人員配置を見直すPDCAを回す。指標・目標値・責任者を事前に定めることで、効果検証の客観性を担保する。</p>`;

  // ===== P8 リスク =====
  const P8 = `
    <table class="data wide risk">
      <tr><th style="width:30%">想定リスク</th><th>対応策</th></tr>
      ${d.risks.map((r, i) => `<tr><td><b><span class="rnum">${["①", "②", "③"][i]}</span>${r[0]}</b></td><td>${r[1]}</td></tr>`).join("")}
      <tr><td><b>導入が定着しない</b></td><td>スタッフ研修と段階導入で現場負担を抑え、KPIを可視化して効果を実感させる。ベンダーの伴走支援を契約に含める。</td></tr>
      <tr><td><b>効果が計画に届かない</b></td><td>月次でKPIをモニタリングし、AIの学習・設定を継続改善。四半期ごとにPDCAを回して軌道修正する。</td></tr>
    </table>
    <div class="figbox">${riskMatrix(d.risks.map(r => r[0]), C.blue)}</div>
    <h3>リスク顕在化時の対応ルール(発動条件と責任者)</h3>
    <table class="data wide risk">
      <tr><th style="width:25%">リスク</th><th>発動条件(このとき対応を開始する)</th><th style="width:20%">責任者</th></tr>
      <tr><td><b><span class="rnum">①</span>${d.risks[0][0]}</b></td><td>品質起因の差戻し・指摘が月3件以上発生した時点</td><td>店長</td></tr>
      <tr><td><b><span class="rnum">②</span>${d.risks[1][0]}</b></td><td>主要KPIが計画値の80%を2か月連続で下回った時点</td><td>代表者+ベンダー</td></tr>
      <tr><td><b><span class="rnum">③</span>${d.risks[2][0]}</b></td><td>顧客からの申告・是正要請が発生した時点(即時)</td><td>代表者</td></tr>
      <tr class="sum"><td>共通</td><td>四半期レビューで計画未達が確認された場合、投資計画・運用体制を再検討する</td><td>代表者+診断士</td></tr>
    </table>`;

  // ===== P9 波及効果 =====
  const P9 = `
    <div class="split">
      <div class="half">
        <p class="lead big">${d.ripple}</p>
        <h3>3つの波及効果</h3>
        <ul class="ul on big">
          <li><b>雇用の質の向上:</b> 生産性向上を原資とした賃上げと働き方改善で、地域の雇用の魅力を高める。</li>
          <li><b>モデルの横展開:</b> 本事業のノウハウは同業・近隣他業種へ展開可能で、地域全体のDXを牽引する。</li>
          <li><b>顧客利便性の向上:</b> サービス品質と利便性の向上が、地域住民・来訪者の満足度を高める。</li>
        </ul>
      </div>
      <div class="half">
        ${rippleFig()}
      </div>
    </div>
    ${photo("town.jpg", "インバウンド需要の高い都心商業地域における波及モデルとして位置づける")}
    <h3>波及効果の定量目標(3年後)</h3>
    <table class="data wide">
      <tr><th>波及の対象</th><th>指標</th><th>現状</th><th>3年後の目標</th></tr>
      <tr><td rowspan="2">自店(従業員)</td><td>事業場内最低賃金</td><td class="bef">${nf(d.wage_before)}円</td><td><b>${nf(d.wage_after3)}円</b></td></tr>
      <tr><td>一人当たり付加価値額</td><td class="bef">基準</td><td><b>年+${d.growth_pct}%成長</b></td></tr>
      <tr><td>美容業界(同業)</td><td>ノウハウ提供・視察受入</td><td class="bef">0件</td><td><b>年6件以上</b></td></tr>
      <tr><td rowspan="2">地域経済</td><td>地域の外国人来訪者の受入対応</td><td class="bef">日本語のみ</td><td><b>多言語対応のモデル店化</b></td></tr>
      <tr><td>雇用(正社員)</td><td class="bef">${BIZ.staff}名</td><td><b>${BIZ.staff + 2}名(処遇改善により採用力向上)</b></td></tr>
    </table>

    <h3>中小企業診断士の視点(事業の位置づけ)</h3>
    <div class="callout">本事業は単なる業務効率化にとどまらず、<b>省力化で創出した経営資源を高付加価値活動へ再配分する経営変革</b>である。人手不足という構造的制約を乗り越え、年商${BIZ.salesYen}万円規模の小規模事業者が持続的に成長するための投資であり、地域経済の担い手としての基盤強化に資する。</div>`;

  // ===== P10 要件チェック =====
  const P10 = `
    <h3>補助要件チェックリスト</h3>
    <table class="data wide check">
      <tr><th>要件</th><th>本計画の対応</th><th>判定</th></tr>
      <tr><td>${s.badge}の対象事業者</td><td>中小企業・小規模事業者(美容業)に該当</td><td class="ok">✔</td></tr>
      <tr><td>省力化・生産性向上効果</td><td>月${d.saveH}時間削減・KPI改善を定量提示</td><td class="ok">✔</td></tr>
      <tr><td>${isKaizen ? "事業場内最低賃金の引上げ" : "賃上げ計画(特例活用時)"}</td><td>+${wageUp}円の引上げを計画(${nf(d.wage_before)}円→${nf(d.wage_after1)}円)</td><td class="ok">✔</td></tr>
      <tr><td>交付決定後の発注</td><td>スケジュールを交付決定起点で設計</td><td class="ok">✔</td></tr>
      <tr><td>事業計画の実現可能性</td><td>実機プロトタイプ・専門家連携で裏付け</td><td class="ok">✔</td></tr>
      <tr><td>投資回収の妥当性</td><td>約${d.roi}年で回収、累積CF計画を提示</td><td class="ok">✔</td></tr>
    </table>
    <div class="split">
      <div class="half-2">
        <h3>他制度への転用メモ</h3>
        <div class="callout">
          <b>本計画のメイン: ${s.badge}</b><br>
          ${d.scheme === "省力化"
            ? `本事業は省力化(生産性向上)効果が明確なため<b>省力化投資補助金(一般型)</b>を主軸とした。賃上げを主目的に据え直せば<b>業務改善助成金</b>への転用も可能。その場合は事業場内最低賃金の引上げ額(50円以上)を軸に、対象経費を生産性向上に資する設備投資へ組み替える。`
            : `本事業は賃上げと業務改善の親和性が高いため<b>業務改善助成金</b>を主軸とした。投資規模を拡大し省力化効果を前面に出せば<b>省力化投資補助金(一般型)</b>への転用も可能。その場合は補助上限が大きく、大幅賃上げ特例で補助率2/3を狙える。`}
        </div>
      </div>
      <div class="half-1">${photo("desk.jpg", "実申請時は専門家の確認を経て提出する")}</div>
    </div>
    <div class="callout alert">
      <b>重要:</b> 本計画書はデモ用のサンプルです。数値(賃金・売上・投資額等)は仮置きであり、実際の申請にあたっては
      ①自社の実績データへの差し替え ②最新の公募要領との突合 ③認定支援機関・専門家(中小企業診断士・税理士・社会保険労務士)による確認 が必須です。補助金の採択を保証するものではありません。
    </div>
    <h3>提出書類チェックリスト(申請準備)</h3>
    <table class="data wide check">
      <tr><th>提出書類</th><th>入手先・作成者</th><th>状況</th></tr>
      <tr><td>事業計画書(本書)</td><td>申請者+中小企業診断士</td><td class="ok">✔</td></tr>
      <tr><td>見積書(相見積り含む)</td><td>ITベンダー</td><td class="ok">✔</td></tr>
      <tr><td>直近2期分の決算書・試算表</td><td>顧問税理士</td><td class="ok">✔</td></tr>
      <tr><td>賃金台帳・労働者名簿・就業規則</td><td>顧問社会保険労務士</td><td class="ok">✔</td></tr>
      <tr><td>賃金引上げ計画書・労働条件通知書</td><td>顧問社会保険労務士</td><td class="ok">✔</td></tr>
      <tr><td>実機デモ(プロトタイプ)による実現性の裏付け</td><td>ITベンダー</td><td class="ok">✔</td></tr>
    </table>
    <p class="note">参照した最新公募情報(2026年時点): 省力化投資補助金(一般型)第6・7回公募 / 業務改善助成金 令和8年度</p>`;

  const pages = [
    page(1, total, SECT[0], P1), page(2, total, SECT[1], P2), page(3, total, SECT[2], P3),
    page(4, total, SECT[3], P4), page(5, total, SECT[4], P5), page(6, total, SECT[5], P6),
    page(7, total, SECT[6], P7), page(8, total, SECT[7], P8), page(9, total, SECT[8], P9),
    page(10, total, SECT[9], P10),
  ].join("\n");

  return shell(d, s, pages);
}

// ---------- HTMLシェル(CSS) ----------
function shell(d, s, pages) {
  return `<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8">
<title>事業計画書 No.${d.no} ${d.title} | ${BIZ.name}</title>
<style>
  @page { size: A4 portrait; margin: 0; }
  :root{
    --ink:${C.ink};--sub:${C.sub};--mute:${C.mute};--line:${C.line};--soft:${C.soft};
    --green:${C.green};--red:${C.red};--gold:${C.gold};--scheme:${s.color};--sc:${C.navy};
  }
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:"Noto Sans JP","Yu Gothic UI","Meiryo",sans-serif;color:var(--ink);background:#dcd8d2;
    line-height:1.62;font-size:11pt;-webkit-print-color-adjust:exact;print-color-adjust:exact;font-feature-settings:"palt"}

  /* ツールバー */
  .toolbar{background:#1a1714;color:#f6f1e8;padding:11px 20px;display:flex;justify-content:space-between;
    align-items:center;font-size:12.5px;position:sticky;top:0;z-index:9;gap:10px}
  .toolbar button,.toolbar a{font:inherit;font-weight:700;background:${C.gold};color:#fff;border:none;
    border-radius:8px;padding:8px 16px;cursor:pointer;text-decoration:none}
  .toolbar a.xls{background:#1d6f42}
  .toolbar .btns{display:flex;gap:8px}

  /* ページ */
  .page{width:210mm;min-height:297mm;background:#fff;margin:16px auto;padding:13mm 14mm 10mm 17mm;
    position:relative;display:flex;flex-direction:column;box-shadow:0 3px 16px #00000026;overflow:hidden}
  .rail{position:absolute;left:0;top:0;bottom:0;width:7mm;background:var(--sc)}
  .phead{display:flex;justify-content:space-between;align-items:center;gap:10px;
    border-bottom:3px solid var(--sc);padding-bottom:7px;margin-bottom:10px}
  .phead-l{display:flex;align-items:center;gap:10px;min-width:0}
  .phead-chip{background:var(--sc);color:#fff;font-size:9.5pt;font-weight:800;padding:3px 12px;border-radius:99px;white-space:nowrap}
  .phead-t{font-size:16pt;font-weight:900;color:var(--sc);letter-spacing:.01em}
  .phead-n{font-size:12pt;font-weight:900;color:var(--sc);white-space:nowrap}
  .phead-n small{font-size:9pt;color:var(--mute);font-weight:700}
  .pbody{flex:1;display:flex;flex-direction:column;justify-content:space-between}
  /* 余りスペースをブロック間へ均等配分し、下端だけが空くのを防ぐ(密なページでは無効) */
  .pbody>*{flex:0 0 auto}
  .block>*:first-child{margin-top:0}
  .block>*:last-child{margin-bottom:0}
  .pbody>h3:first-child,.pbody>.hero+*{margin-top:2px}
  .pbody>.split,.pbody>.figbox,.pbody>table,.pbody>.callout{margin-top:7px}
  .pbody>p.lead:first-child{margin-top:0}
  .half>h3:first-child{margin-top:0}
  .kv.pair td{height:10.6mm;vertical-align:middle}
  .pfoot{display:flex;justify-content:space-between;font-size:8.5pt;color:var(--mute);
    border-top:1px solid var(--line);padding-top:6px;margin-top:10px}

  h1{font-size:19pt;line-height:1.34;margin:5px 0;font-weight:900;letter-spacing:-.01em}
  h3{font-size:12.5pt;font-weight:800;color:var(--sc);margin:10px 0 5px;padding-left:9px;border-left:5px solid var(--sc)}
  .lead{font-size:10.8pt;margin:6px 0;text-align:justify}
  .lead.big{font-size:11.2pt;line-height:1.72}
  .note{font-size:9pt;color:var(--mute);margin-top:5px;text-align:justify}

  /* 見出しストリップ(視線誘導) */
  .head-strip{background:var(--sc);color:#fff;font-size:10.5pt;font-weight:800;padding:6px 14px;
    border-radius:6px;margin:9px 0 7px;letter-spacing:.02em}
  .head-strip.alert{background:${C.red}}

  /* ヒーロー */
  .hero{display:flex;gap:12px;align-items:stretch;background:linear-gradient(135deg,#f7f4ee,#efe8dc);
    border:1px solid var(--line);border-left:6px solid var(--sc);border-radius:12px;padding:14px;margin-bottom:4px}
  .hero-main{flex:1.75;min-width:0;display:flex;flex-direction:column;justify-content:center}
  .hero .ph-fig{flex:1;margin:0}
  .hero .ph-fig img{height:100%;min-height:34mm}
  .hero-badge{display:inline-block;background:var(--scheme);color:#fff;font-size:9.5pt;font-weight:800;
    padding:3px 13px;border-radius:99px;margin-bottom:7px;align-self:flex-start}
  .hero-sub{font-size:10.5pt;color:var(--sub);margin-top:6px}

  /* スタットタイル(数字を主役に) */
  .tiles{display:grid;gap:9px;margin:8px 0 4px}
  .tiles.t4{grid-template-columns:repeat(4,1fr)}
  .tiles.t3{grid-template-columns:repeat(3,1fr)}
  .tile{border:1.5px solid var(--line);border-top:5px solid var(--tc);border-radius:10px;
    padding:9px 10px 8px;background:#fff;text-align:center;position:relative}
  .tile-label{font-size:8.8pt;color:var(--sub);font-weight:700;line-height:1.35;min-height:2.4em}
  .tile-nums{display:flex;align-items:flex-end;justify-content:center;gap:6px;margin-top:2px}
  .tile-pair{display:flex;flex-direction:column;align-items:center;line-height:1}
  .tile-cap{font-size:7.6pt;color:var(--mute);font-weight:700;margin-bottom:2px}
  .tile-before{font-size:15pt;font-weight:800;color:#8f867c}
  .tile-arrow{font-size:12pt;color:var(--mute);font-weight:800;padding-bottom:1px}
  .tile-after{font-size:25pt;font-weight:900;color:var(--tc);letter-spacing:-.02em;line-height:1.05}
  .tile-unit{font-size:8.5pt;color:var(--sub);margin-top:1px}
  .tile-badge{display:inline-block;font-size:9.5pt;font-weight:900;padding:2px 10px;border-radius:99px;margin-top:5px}
  .tile-badge.good{background:#e6f2ea;color:${C.green}}
  .tile-badge.bad{background:#fbe9e6;color:${C.red}}

  /* レイアウト */
  .split{display:flex;gap:13px;margin:4px 0;align-items:flex-start}
  .half{flex:1;min-width:0}
  .half-2{flex:2;min-width:0}
  .half-1{flex:1;min-width:0}

  /* コールアウト */
  .callout{background:#f8f5f0;border-left:5px solid var(--sc);border-radius:0 8px 8px 0;
    padding:8px 12px;font-size:10pt;margin:4px 0;text-align:justify}
  .callout.small{font-size:9.5pt;padding:7px 11px}
  .callout.tall{min-height:41mm}
  .callout.scheme{border-left-color:var(--scheme);background:#fbf7ef}
  .callout.alert{border-left-color:${C.red};background:#fdf3f1}

  /* 表 */
  table{width:100%;border-collapse:collapse;font-size:10pt;margin:3px 0}
  .kv td{padding:6px 9px;border-bottom:1px solid var(--line)}
  .kv td:first-child{color:var(--sub);width:44%;font-size:9.5pt;background:#faf8f4}
  .data th{background:var(--sc);color:#fff;padding:6px 9px;text-align:left;font-size:9.5pt;border:1px solid var(--sc)}
  .data td{padding:5px 9px;border:1px solid var(--line)}
  .data tr:nth-child(even) td{background:#fbfaf7}
  .data .num{text-align:right;font-variant-numeric:tabular-nums}
  .data .sum{font-weight:900}
  .data .sum td{background:#f2ede4}
  .data .up{color:var(--green);font-weight:800;font-size:9.5pt;white-space:nowrap}
  .data .bef{color:var(--mute)}
  .data .neg{color:${C.red};font-weight:800}
  .data .ok{color:var(--green);font-weight:900;text-align:center;font-size:13pt}
  .data.wide{font-size:9.8pt}
  .data.risk{font-size:9.2pt}
  .data.risk td{padding:4px 8px}
  .data.check td:last-child{width:12%}
  .sc{color:var(--scheme)}
  .rnum{display:inline-block;background:${C.red};color:#fff;width:17px;height:17px;line-height:17px;
    border-radius:50%;text-align:center;font-size:9pt;margin-right:5px}

  /* リスト */
  .ul{list-style:none;font-size:10pt}
  .ul li{padding:4px 0 4px 21px;position:relative}
  .ul li::before{content:"▪";position:absolute;left:3px;color:var(--mute);font-weight:800}
  .ul.on li::before{content:"✓";color:var(--green);font-weight:900}
  .ul.big{font-size:10.4pt}
  .ul.big li{padding:5px 0 5px 22px}

  /* 図枠 */
  .figbox{background:#fdfcfa;border:1.5px solid var(--line);border-radius:10px;padding:9px 11px;margin:4px 0}

  /* Before/After */
  .ba-h{font-size:10.5pt;font-weight:800;color:#fff;padding:5px 12px;border-radius:6px;margin-bottom:4px}
  .ba-h.before{background:${C.mute}}
  .ba-h.after{background:var(--green)}

  /* ステップフロー(HTML実装:はみ出し不可) */
  .stepflow{display:flex;align-items:stretch;gap:0;margin:8px 0}
  .step{flex:1;min-width:0;background:#f6f2ea;border:1.5px solid var(--line);border-top:4px solid var(--sc);
    border-radius:9px;padding:8px 7px 10px;text-align:center;display:flex;flex-direction:column;gap:5px}
  .step-no{font-size:9pt;font-weight:900;color:var(--sc);letter-spacing:.04em}
  .step-t{font-size:9.6pt;line-height:1.42;font-weight:700}
  .step-ar{flex:0 0 17px;display:flex;align-items:center;justify-content:center;color:${C.gold};font-size:13pt;font-weight:900}

  /* 課題ツリー */
  .tree{margin:6px 0 2px}
  .tree-top{background:var(--sc);color:#fff;font-size:11.5pt;font-weight:800;text-align:center;
    padding:9px;border-radius:8px;width:64%;margin:0 auto}
  .tree-conn{height:20px;position:relative}
  .tree-conn .tc-v{position:absolute;left:50%;top:0;width:2.5px;height:9px;background:var(--line);transform:translateX(-50%)}
  .tree-conn .tc-b{position:absolute;left:16%;right:16%;top:9px;height:11px;
    border-top:2.5px solid var(--line);border-left:2.5px solid var(--line);border-right:2.5px solid var(--line)}
  .tree-row{display:flex;gap:12px}
  .tree-box{flex:1;background:#fff;border:2px solid var(--line);border-radius:9px;padding:11px 9px;
    text-align:center;font-size:10.2pt;font-weight:700;line-height:1.5;min-height:20mm;
    display:flex;align-items:center;justify-content:center}
  .tree-down{text-align:center;color:${C.red};font-size:15pt;font-weight:900;line-height:1.1;margin-top:4px}
  .tree-concl{background:#fdf3f1;border:2px solid ${C.red};color:${C.red};font-size:11.5pt;font-weight:800;
    text-align:center;padding:10px;border-radius:8px;margin-top:2px}

  /* タイムライン(矢印で時間の流れを表現) */
  .tl{position:relative;padding:6px 0 4px}
  .tl-rail{position:absolute;left:2%;right:2%;top:47px;height:4px;background:linear-gradient(90deg,#e2dacd,var(--sc))}
  .tl-rail .tl-head{position:absolute;right:-1px;top:50%;transform:translateY(-50%);
    border-left:15px solid var(--sc);border-top:9px solid transparent;border-bottom:9px solid transparent}
  .tl-items{display:flex;position:relative;z-index:1}
  .tl-item{flex:1;text-align:center}
  .tl-m{font-size:10.5pt;font-weight:900;color:var(--sc);margin-bottom:6px}
  .tl-dot{width:17px;height:17px;border-radius:50%;background:var(--sc);border:3.5px solid #fff;
    box-shadow:0 0 0 2px var(--sc);margin:0 auto 9px}
  .tl-l{font-size:9.8pt;line-height:1.45;font-weight:700}
  .tl-cap{text-align:right;font-size:9pt;color:var(--mute);margin-top:7px;font-weight:700}

  /* 波及効果(段階が外へ広がる構造で表現) */
  .ripple{display:flex;flex-direction:column;align-items:center;gap:0;margin:6px 0}
  .rp-axis{font-size:9pt;font-weight:800;color:var(--mute);align-self:flex-start;margin-bottom:4px}
  .rp-stage{border-radius:10px;padding:8px 12px;text-align:center;border:2px solid}
  .rp-n{font-size:8.4pt;font-weight:900;letter-spacing:.06em;opacity:.85}
  .rp-h{font-size:11.5pt;font-weight:900;line-height:1.25;margin:1px 0 3px}
  .rp-d{font-size:9pt;line-height:1.45;color:var(--ink)}
  .rp-stage.s1{background:#eef3f8;border-color:${C.blue};color:${C.blue}}
  .rp-stage.s2{background:#ecf3ee;border-color:${C.green};color:${C.green}}
  .rp-stage.s3{background:#fbf4e4;border-color:${C.gold};color:${C.gold}}
  .rp-ar{color:var(--mute);font-size:11pt;font-weight:900;line-height:1.5}

  /* 写真 */
  .ph-fig{margin:8px 0;border-radius:10px;overflow:hidden;border:1.5px solid var(--line)}
  .ph-fig img{width:100%;height:32mm;object-fit:cover;display:block;filter:saturate(.6) sepia(.16) contrast(1.04)}
  .ph-fig.sm img{height:22mm}
  .ph-fig figcaption{font-size:8.6pt;color:var(--sub);background:#f8f5f0;padding:5px 9px;line-height:1.4}

  @media print{
    body{background:#fff}
    .toolbar{display:none}
    .mobile-note{display:none}
    .sheets{overflow:visible}
    .page{margin:0;box-shadow:none;page-break-after:always}
    .page:last-child{page-break-after:auto}
  }

  /* 狭い画面向け(2026-07-29 追加、飲食業版 build_plans.py と同じ方針)
     A4固定レイアウト(210mm=約794px)はスマートフォンに収まらない。ページ全体が
     横にずれるとツールバーや注記まで隠れるため、横スクロールは書類領域(.sheets)
     だけに閉じ込め、読みやすい形(印刷/PDF・Excel)への案内を先に出す。 */
  .mobile-note{display:none}
  @media (max-width:900px){
    .mobile-note{display:block;background:#fff5e0;border-bottom:1px solid #e6d3a8;
      color:#5b4708;font-size:13.5px;line-height:1.7;padding:12px 16px}
    .mobile-note b{font-weight:700}
    .sheets{overflow-x:auto;-webkit-overflow-scrolling:touch;padding-bottom:10px}
    .page{margin:14px}
    .toolbar{font-size:13px}
    .toolbar{flex-direction:column;align-items:stretch;gap:8px}
    .toolbar .btns{justify-content:flex-start}
    .toolbar button,.toolbar a{padding:8px 12px;font-size:13px;white-space:nowrap}
  }
</style></head>
<body>
  <div class="toolbar">
    <span>📄 事業計画書 No.${d.no} — ${s.badge} / A4×10ページ(審査官視点リデザイン版)</span>
    <div class="btns">
      <a class="xls" href="plan-${String(d.no).padStart(2, "0")}.xlsx" download>📊 Excelをダウンロード(編集用)</a>
      <button onclick="window.print()">🖨 印刷 / PDF保存</button>
    </div>
  </div>
  <div class="mobile-note">この事業計画書は<b>A4印刷用のレイアウト</b>です。スマートフォンでは横にスクロールしてご覧ください。読みやすい形でご覧になる場合は、上の「印刷 / PDF保存」または「Excelをダウンロード」をご利用ください。</div>
  <div class="sheets">${pages}<!-- SHEETS:END --></div>
</body></html>`;
}

// ---------- 実行 ----------
let n = 0;
DATA.plans.forEach(d => {
  if (ONLY && String(d.no) !== String(ONLY)) return;
  const file = path.join(OUT, `plan-${String(d.no).padStart(2, "0")}${SUFFIX}.html`);
  fs.writeFileSync(file, buildPlan(d), "utf8");
  n++;
  console.log(`  OK  ${path.basename(file)}  (${d.scheme})`);
});
console.log(`\n生成完了: ${n}本`);

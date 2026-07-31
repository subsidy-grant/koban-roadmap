# -*- coding: utf-8 -*-
"""事業計画書・pdca用のインラインSVG部品。全てviewBoxベースの文字列を返す純関数。"""

INK = "#26221e"
SUB = "#6f675e"
LINE = "#d9d2c8"
GREEN = "#3e6b4f"
BEIGE = "#c9b79c"
RED = "#a4453c"


def esc(s):
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def _text_w(s, fs):
    """SVG内のラベルの描画幅の目安（px）。
    SVGは要素をviewBoxで切り落とすので、幅を見積もらずに置くと文字が黙って
    消える。全角は約1em、半角英数・記号は約0.55emとして数える。"""
    total = 0.0
    for ch in str(s):
        total += 0.55 if ord(ch) < 0x2E80 else 1.0
    return total * fs


def _fit_lines(s, max_w, fs, max_lines=2):
    """max_w(px)に収まるよう折り返す。max_lines を超える分は末尾を…で締める。
    戻り値は行のリスト（必ず1行以上）。"""
    s = str(s)
    if not s:
        return [""]
    lines, cur = [], ""
    for ch in s:
        if not cur or _text_w(cur + ch, fs) <= max_w:
            cur += ch
        else:
            lines.append(cur)
            cur = ch
            if len(lines) >= max_lines:
                break
    if len(lines) < max_lines and cur:
        lines.append(cur)
    if sum(len(x) for x in lines) < len(s):
        last = lines[-1]
        while last and _text_w(last + "…", fs) > max_w:
            last = last[:-1]
        lines[-1] = last + "…"
    return lines or [""]


def _wrap_label(label, max_chars, max_lines=2):
    """軸ラベルを最大2行に折る。「注文取り対応(時間/月)」のように末尾が単位の
    括弧なら、そこで折ると意味の切れ目と一致して読みやすい。"""
    if len(label) <= max_chars:
        return [label]
    for br in ("(", "（"):
        i = label.rfind(br)
        if 0 < i <= max_chars + 3 and len(label) - i <= max_chars + 3:
            return [label[:i], label[i:]]
    lines = [label[i:i + max_chars] for i in range(0, len(label), max_chars)][:max_lines]
    if len("".join(lines)) < len(label):
        lines[-1] = lines[-1][:-1] + "…"
    return lines


def bar_before_after(title, rows, accent=GREEN, w=320, h=195):
    """rows: [(label, before, after)] 最大4組の縦棒before/after比較。
    色の凡例はバー色と連動した数値ラベル（薄色=導入前／濃色太字=導入後）で示すため、
    タイトルの長さに関わらず衝突しないようテキスト凡例は置かない。"""
    n = len(rows)
    maxv = max(max(r[1], r[2]) for r in rows) or 1
    plot_h, base_y = 113.0, 160
    group_w = (w - 60) / n
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    out.append(f'<line x1="44" y1="{base_y}" x2="{w-8}" y2="{base_y}" stroke="{LINE}"/>')
    bw = min(24.5, group_w / 3)
    for i, (label, before, after) in enumerate(rows):
        gx = 52 + i * group_w
        hb = plot_h * before / maxv
        ha = plot_h * after / maxv
        out.append(f'<rect x="{gx:.1f}" y="{base_y-hb:.1f}" width="{bw}" height="{hb:.1f}" fill="{BEIGE}" rx="2"/>')
        out.append(f'<rect x="{gx+bw+4:.1f}" y="{base_y-ha:.1f}" width="{bw}" height="{ha:.1f}" fill="{accent}" rx="2"/>')
        cx = gx + bw + 2
        # ラベルは1本の<text>だと、棒が3組以上のとき隣の組と重なって読めなくなる
        # （2組までは収まるため長らく露見していなかった）。組の幅から入る文字数を
        # 出し、単位の括弧を優先して2行に折る。
        fs = 9 if n <= 2 else 8
        lines = _wrap_label(label, max(4, int(group_w / (fs * 0.96))))
        for li, ln in enumerate(lines):
            out.append(f'<text x="{cx:.1f}" y="{176 + li * (fs + 1.5):.1f}" font-size="{fs}" '
                       f'fill="{SUB}" text-anchor="middle">{esc(ln)}</text>')
        out.append(f'<text x="{gx+bw/2:.1f}" y="{base_y-hb-5:.1f}" font-size="8.5" fill="{SUB}" text-anchor="middle">{before:g}</text>')
        out.append(f'<text x="{gx+bw*1.5+4:.1f}" y="{base_y-ha-5:.1f}" font-size="8.5" font-weight="bold" fill="{accent}" text-anchor="middle">{after:g}</text>')
    out.append("</svg>")
    return "".join(out)


def bar_h(title, rows, accent="#8a5a2b", w=320, unit=""):
    """rows: [(label, value)] 横棒グラフ"""
    n = len(rows)
    maxv = max(r[1] for r in rows) or 1
    row_h, top = 24, 30
    h = top + n * row_h + 12
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    plot_w = w - 150
    for i, (label, v) in enumerate(rows):
        y = top + i * row_h
        bw_ = plot_w * v / maxv
        # 右寄せなので、長い項目名は左端がviewBoxの外へ出て消える。2行に折る。
        lls = _fit_lines(label, 106, 8.6, max_lines=2)
        ly = y + 13 - (len(lls) - 1) * 4.6
        for li, ln in enumerate(lls):
            out.append(f'<text x="112" y="{ly+li*9.2:.1f}" font-size="8.6" '
                       f'fill="{SUB}" text-anchor="end">{esc(ln)}</text>')
        out.append(f'<rect x="118" y="{y+3}" width="{bw_:.1f}" height="13" fill="{accent}" rx="2" opacity="{0.55+0.45*(v/maxv):.2f}"/>')
        out.append(f'<text x="{118+bw_+5:.1f}" y="{y+13}" font-size="8.6" font-weight="bold" fill="{INK}">{v:g}{esc(unit)}</text>')
    out.append("</svg>")
    return "".join(out)


def cost_stack(title, lines, total, unit, accent="#8a5a2b", w=320):
    """lines: [(label, 万円)] 100%積み上げ横棒+凡例"""
    h = 84 + len(lines) * 16
    palette = [accent, GREEN, "#b98a2f", "#7c8880", RED, "#5a7a96"]
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    x = 12.0
    bw_total = w - 24
    for i, (label, v) in enumerate(lines):
        seg = bw_total * v / total if total else 0
        c = palette[i % len(palette)]
        out.append(f'<rect x="{x:.1f}" y="28" width="{max(seg,1):.1f}" height="22" fill="{c}" rx="2"/>')
        if seg > 34:
            out.append(f'<text x="{x+seg/2:.1f}" y="43" font-size="8.5" fill="#fff" text-anchor="middle">{v:g}万</text>')
        x += seg
        ly = 66 + i * 16
        out.append(f'<rect x="14" y="{ly-9}" width="10" height="10" fill="{c}" rx="2"/>')
        out.append(f'<text x="30" y="{ly}" font-size="8.6" fill="{SUB}">{esc(label)}：{v:g}万円</text>')
    out.append(f'<text x="{w-12}" y="{66+len(lines)*16}" font-size="9.5" font-weight="bold" fill="{INK}" text-anchor="end">合計 {total:g}{esc(unit)}</text>')
    out.append("</svg>")
    return "".join(out)


def waterfall_subsidy(total, applied, self_pay, accent="#8a5a2b", w=320, h=170):
    """投資総額 → 自己負担 → 補助金（見込） のウォーターフォール。
    自己負担はベースラインから積み上げ、補助金（見込）は投資総額の上端に揃えて
    「総額の上澄みが補助金でまかなわれる」イメージを示す。ラベルは各バーの実際の
    描画位置（天面）に合わせて配置し、バー色との重なりを避ける。"""
    maxv = total or 1
    plot_h, base_y = 92.0, 138
    bw_, xs = 62, [40, 135, 230]
    ht = plot_h * total / maxv
    ha = plot_h * applied / maxv
    hs = plot_h * self_pay / maxv
    top_total = base_y - ht
    top_self = base_y - hs
    top_applied = top_total  # 投資総額の天面に揃えて「上澄み」を表現
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="自己負担の圧縮">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">投資総額から自己負担への圧縮イメージ</text>')
    out.append(f'<line x1="20" y1="{base_y}" x2="{w-10}" y2="{base_y}" stroke="{LINE}"/>')
    out.append(f'<rect x="{xs[0]}" y="{top_total:.1f}" width="{bw_}" height="{ht:.1f}" fill="{BEIGE}" rx="3"/>')
    out.append(f'<rect x="{xs[1]}" y="{top_self:.1f}" width="{bw_}" height="{hs:.1f}" fill="{accent}" rx="3"/>')
    out.append(f'<rect x="{xs[2]}" y="{top_applied:.1f}" width="{bw_}" height="{ha:.1f}" fill="{GREEN}" rx="3"/>')
    out.append(f'<line x1="{xs[1]+bw_}" y1="{top_self:.1f}" x2="{xs[2]}" y2="{top_self:.1f}" stroke="{SUB}" stroke-dasharray="3 3"/>')
    labels = [("投資総額", total, xs[0], top_total), ("自己負担", self_pay, xs[1], top_self), ("補助金（見込）", applied, xs[2], top_applied)]
    for label, v, x, top in labels:
        out.append(f'<text x="{x+bw_/2}" y="{base_y+15}" font-size="9" fill="{SUB}" text-anchor="middle">{esc(label)}</text>')
        out.append(f'<text x="{x+bw_/2}" y="{top-6:.1f}" font-size="9.5" font-weight="bold" fill="{INK}" text-anchor="middle">{v:g}万円</text>')
    out.append("</svg>")
    return "".join(out)


def gantt(title, rows, accent="#8a5a2b", months=12, w=440):
    """rows: [(label, start, end)] 1始まりの月番号"""
    top, row_h = 42, 22
    h = top + len(rows) * row_h + 14
    # 工程名は「入退室管理システムの比較選定・カタログ登録状況の確認」のように
    # 長いものがあり、128pxでは右寄せの左側がviewBoxの外に出て消えていた。
    # 列を広げたうえで2行まで折り返す。
    label_w = 150
    lab_fs = 8.6
    lab_max = label_w - 10
    cell = (w - label_w - 14) / months
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    for m in range(months):
        x = label_w + m * cell
        out.append(f'<line x1="{x:.1f}" y1="{top-14}" x2="{x:.1f}" y2="{h-12}" stroke="{LINE}" stroke-width="0.5"/>')
        out.append(f'<text x="{x+cell/2:.1f}" y="{top-18}" font-size="7.5" fill="{SUB}" text-anchor="middle">{m+1}月目</text>')
    for i, (label, s, e) in enumerate(rows):
        y = top + i * row_h
        lls = _fit_lines(label, lab_max, lab_fs, max_lines=2)
        ly = y + 12 - (len(lls) - 1) * 4.6
        for li, ln in enumerate(lls):
            out.append(f'<text x="{label_w-6}" y="{ly+li*9.2:.1f}" font-size="{lab_fs}" '
                       f'fill="{SUB}" text-anchor="end">{esc(ln)}</text>')
        x = label_w + (s - 1) * cell
        bw_ = (e - s + 1) * cell
        out.append(f'<rect x="{x:.1f}" y="{y+2}" width="{bw_:.1f}" height="14" fill="{accent}" rx="7" opacity="{1-0.07*i:.2f}"/>')
    out.append("</svg>")
    return "".join(out)


def _wrap_cjk(text, max_chars, max_lines=3):
    """改行(\n)は語の区切りとしてのみ扱い、実際の折返しは文字数で再計算する
    （枠幅に対して指定\n位置の行が長すぎてはみ出るのを防ぐため）。"""
    s = str(text).replace("\n", "")
    max_chars = max(3, int(max_chars))
    lines = []
    while s and len(lines) < max_lines:
        lines.append(s[:max_chars])
        s = s[max_chars:]
    if s and lines:
        lines[-1] = lines[-1][:max(1, max_chars - 1)] + "…"
    return lines


def flow_h(title, steps, accent="#8a5a2b", w=440):
    """steps: [(head, body)] 横並びの矢印フロー(最大5)。箱幅に応じて本文を自動折返しする。"""
    n = len(steps)
    gap = 14 if n >= 5 else 22
    box_w = (w - 20 - (n - 1) * gap) / n
    fsize = 8.6 if box_w >= 90 else (7.6 if box_w >= 72 else 6.9)
    max_chars = max(3, box_w / (fsize * 1.02))
    box_h = 76
    h = 28 + box_h + 8
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    for i, (head, body) in enumerate(steps):
        x = 10 + i * (box_w + gap)
        out.append(f'<rect x="{x:.1f}" y="28" width="{box_w:.1f}" height="{box_h}" fill="#fcfaf6" stroke="{accent}" rx="8"/>')
        out.append(f'<rect x="{x:.1f}" y="28" width="{box_w:.1f}" height="20" fill="{accent}" rx="8"/>')
        out.append(f'<rect x="{x:.1f}" y="40" width="{box_w:.1f}" height="8" fill="{accent}"/>')
        head_lines = _wrap_cjk(head, max(3, box_w / (8.6 * 1.02)), max_lines=1)
        out.append(f'<text x="{x+box_w/2:.1f}" y="42" font-size="8.6" font-weight="bold" fill="#fff" text-anchor="middle">{esc("".join(head_lines))}</text>')
        body_lines = _wrap_cjk(body, max_chars, max_lines=3)
        line_h = fsize + 4.6
        body_top = 28 + 20 + 8 + fsize
        for j, ln in enumerate(body_lines):
            out.append(f'<text x="{x+box_w/2:.1f}" y="{body_top+j*line_h:.1f}" font-size="{fsize}" fill="{SUB}" text-anchor="middle">{esc(ln)}</text>')
        if i < n - 1:
            alen = min(11, gap * 0.55)
            ax = x + box_w + (gap - alen) / 2
            out.append(f'<path d="M {ax:.1f} {28+box_h/2:.1f} l {alen:.1f} 0 l -4 -5 m 4 5 l -4 5" stroke="{SUB}" stroke-width="1.6" fill="none"/>')
    out.append("</svg>")
    return "".join(out)


def system_diagram(title, center, nodes, accent="#8a5a2b", w=440, h=210):
    """center: 中核システム名 / nodes: [(label, sub)] 周辺要素(最大6)を放射配置"""
    cx, cy = w / 2, h / 2 + 10
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    positions = [(cx - 165, cy - 62), (cx + 165, cy - 62), (cx - 165, cy + 62),
                 (cx + 165, cy + 62), (cx, cy - 82), (cx, cy + 82)][:len(nodes)]
    for (nx, ny) in positions:
        out.append(f'<line x1="{cx}" y1="{cy}" x2="{nx}" y2="{ny}" stroke="{LINE}" stroke-width="1.4"/>')
    out.append(f'<rect x="{cx-78}" y="{cy-26}" width="156" height="52" fill="{accent}" rx="10"/>')
    for j, ln in enumerate(str(center).split("\n")[:2]):
        out.append(f'<text x="{cx}" y="{cy-4+j*15 if chr(10) in str(center) else cy+4}" font-size="10" font-weight="bold" fill="#fff" text-anchor="middle">{esc(ln)}</text>')
    for (label, sub), (nx, ny) in zip(nodes, positions):
        out.append(f'<rect x="{nx-62}" y="{ny-20}" width="124" height="40" fill="#fcfaf6" stroke="{accent}" rx="8"/>')
        out.append(f'<text x="{nx}" y="{ny-3}" font-size="8.4" font-weight="bold" fill="{INK}" text-anchor="middle">{esc(label)}</text>')
        out.append(f'<text x="{nx}" y="{ny+11}" font-size="7.4" fill="{SUB}" text-anchor="middle">{esc(sub)}</text>')
    out.append("</svg>")
    return "".join(out)


def pictogram_row(title, items, accent="#8a5a2b", w=440):
    """items: [(emoji, label, sub)] 最大5つのアイコンタイル"""
    n = len(items)
    box_w = (w - 20 - (n - 1) * 10) / n
    out = [f'<svg viewBox="0 0 {w} 118" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    for i, (emoji, label, sub) in enumerate(items):
        x = 10 + i * (box_w + 10)
        out.append(f'<rect x="{x:.1f}" y="26" width="{box_w:.1f}" height="82" fill="#fcfaf6" stroke="{LINE}" rx="10"/>')
        out.append(f'<text x="{x+box_w/2:.1f}" y="58" font-size="22" text-anchor="middle">{emoji}</text>')
        out.append(f'<text x="{x+box_w/2:.1f}" y="80" font-size="8.2" font-weight="bold" fill="{INK}" text-anchor="middle">{esc(label)}</text>')
        out.append(f'<text x="{x+box_w/2:.1f}" y="95" font-size="7.4" fill="{SUB}" text-anchor="middle">{esc(sub)}</text>')
    out.append("</svg>")
    return "".join(out)


def payback_line(title, monthly_saving, self_pay, months=24, accent="#8a5a2b", w=320, h=180):
    """累積削減額と自己負担の交点=回収時期を示す折れ線"""
    plot_w, plot_h = w - 60, 120
    x0, base_y = 44, 150
    maxv = max(monthly_saving * months, self_pay) * 1.1 or 1
    pts = []
    for m in range(months + 1):
        x = x0 + plot_w * m / months
        y = base_y - plot_h * (monthly_saving * m) / maxv
        pts.append(f"{x:.1f},{y:.1f}")
    y_self = base_y - plot_h * self_pay / maxv
    cross_m = self_pay / monthly_saving if monthly_saving else 0
    cross_x = x0 + plot_w * min(cross_m, months) / months
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    out.append(f'<line x1="{x0}" y1="{base_y}" x2="{w-8}" y2="{base_y}" stroke="{LINE}"/>')
    out.append(f'<line x1="{x0}" y1="{base_y}" x2="{x0}" y2="24" stroke="{LINE}"/>')
    out.append(f'<line x1="{x0}" y1="{y_self:.1f}" x2="{w-8}" y2="{y_self:.1f}" stroke="{RED}" stroke-dasharray="4 3"/>')
    out.append(f'<text x="{w-10}" y="{y_self-8:.1f}" font-size="8" fill="{RED}" text-anchor="end">自己負担 {self_pay:g}万円</text>')
    out.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{accent}" stroke-width="2.2"/>')
    if cross_m <= months:
        out.append(f'<circle cx="{cross_x:.1f}" cy="{y_self:.1f}" r="4" fill="{accent}"/>')
        # 回収時期が右寄りだと「自己負担 ○万円」と同じ高さで重なるため、
        # ぶつかる場合だけ破線の下側に逃がす（回収が遅い計画ほど起きやすい）。
        cross_label = f"約{cross_m:.0f}ヶ月で回収"
        self_label_left = (w - 10) - len(f"自己負担 {self_pay:g}万円") * 8
        cross_y = y_self - 9
        if cross_x + len(cross_label) * 4.3 > self_label_left:
            cross_y = y_self + 14
        out.append(f'<text x="{cross_x:.1f}" y="{cross_y:.1f}" font-size="8.6" font-weight="bold" fill="{INK}" text-anchor="middle">{cross_label}</text>')
    out.append(f'<text x="{x0}" y="{base_y+14}" font-size="7.5" fill="{SUB}">0</text>')
    out.append(f'<text x="{w-8}" y="{base_y+14}" font-size="7.5" fill="{SUB}" text-anchor="end">{months}ヶ月</text>')
    out.append(f'<text x="{x0+8}" y="30" font-size="7.5" fill="{SUB}">累積削減額(万円)</text>')
    out.append("</svg>")
    return "".join(out)


def pdca_cycle(accent="#8a5a2b", w=420, h=210):
    """円の左右に注記を置くため、円の直径ぶんだけでは幅が足りない。
    w=300 だった頃は左右の注記（「KPI・実施計画の設定」など）が
    viewBoxの外にはみ出して切れていたので、420に広げてある。"""
    cx, cy, r = w / 2, h / 2 + 8, 68
    quads = [("P", "計画", "KPI・実施計画の設定", -1, -1), ("D", "実行", "導入・運用の実施", 1, -1),
             ("C", "評価", "KPI実績の測定", 1, 1), ("A", "改善", "運用ルール見直し", -1, 1)]
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="PDCAサイクル">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">PDCAサイクルによる運用</text>')
    out.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{LINE}" stroke-width="14"/>')
    out.append(f'<path d="M {cx} {cy-r} A {r} {r} 0 0 1 {cx+r} {cy}" fill="none" stroke="{accent}" stroke-width="14" stroke-linecap="round"/>')
    out.append(f'<path d="M {cx+r-3} {cy-12} l 8 14 l -14 2 z" fill="{accent}"/>')
    for q, name, desc, sx, sy in quads:
        qx, qy = cx + sx * (r + 44), cy + sy * (r - 22)
        out.append(f'<circle cx="{cx+sx*r*0.71:.1f}" cy="{cy+sy*r*0.71:.1f}" r="15" fill="{accent if q=="P" else "#fcfaf6"}" stroke="{accent}"/>')
        out.append(f'<text x="{cx+sx*r*0.71:.1f}" y="{cy+sy*r*0.71+4:.1f}" font-size="11" font-weight="bold" fill="{"#fff" if q=="P" else accent}" text-anchor="middle">{q}</text>')
        anchor = "end" if sx < 0 else "start"
        tx = qx + sx * 8
        avail = (tx - 4) if sx < 0 else (w - tx - 4)   # viewBox端までの余地
        out.append(f'<text x="{tx:.1f}" y="{qy:.1f}" font-size="8.6" font-weight="bold" fill="{INK}" text-anchor="{anchor}">{name}</text>')
        for li, ln in enumerate(_fit_lines(desc, avail, 7.4, max_lines=2)):
            out.append(f'<text x="{tx:.1f}" y="{qy+12+li*9:.1f}" font-size="7.4" '
                       f'fill="{SUB}" text-anchor="{anchor}">{esc(ln)}</text>')
    out.append("</svg>")
    return "".join(out)


def gauge_row(title, gauges, accent="#8a5a2b", w=440):
    """gauges: [(label, pct 0-100, text)] 半円ゲージ最大4つ"""
    n = len(gauges)
    box_w = (w - 20) / n
    out = [f'<svg viewBox="0 0 {w} 120" width="100%" role="img" aria-label="{esc(title)}">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">{esc(title)}</text>')
    import math
    for i, (label, pct, text) in enumerate(gauges):
        cx = 10 + i * box_w + box_w / 2
        cy, r = 78, 30
        out.append(f'<path d="M {cx-r} {cy} A {r} {r} 0 0 1 {cx+r} {cy}" fill="none" stroke="{LINE}" stroke-width="9"/>')
        ang = 3.14159 * (1 - min(max(pct, 0), 100) / 100)
        ex, ey = cx + r * math.cos(ang), cy - r * math.sin(ang)
        large = 0 if pct <= 50 else 0
        out.append(f'<path d="M {cx-r} {cy} A {r} {r} 0 {large} 1 {ex:.1f} {ey:.1f}" fill="none" stroke="{accent}" stroke-width="9" stroke-linecap="round"/>')
        out.append(f'<text x="{cx}" y="{cy-4}" font-size="10.5" font-weight="bold" fill="{INK}" text-anchor="middle">{esc(text)}</text>')
        out.append(f'<text x="{cx}" y="{cy+22}" font-size="8" fill="{SUB}" text-anchor="middle">{esc(label)}</text>')
    out.append("</svg>")
    return "".join(out)


RISK_STEPS = ("低", "中", "高")


def risk_matrix(items, accent="#8a5a2b", w=440, h=286):
    """items: [(short_label, impact 1-3, likelihood 1-3)] 3x3マトリクス。

    仕様(plan_src)側は影響度・発生可能性とも1〜3の3段階で書かれているのに、
    ここが2x2で描いていたため、3が指定されたリスクはマス目の外＝viewBoxの外に
    置かれ、SVGに切り落とされて1件も見えていなかった（全200件中120件）。
    3x3に直し、範囲外の値が来ても枠外に出ないよう1〜3に丸める。"""
    x0, y0, cw, ch = 62, 34, 124, 74
    out = [f'<svg viewBox="0 0 {w} {h}" width="100%" role="img" aria-label="リスクマトリクス">']
    out.append(f'<text x="10" y="16" font-size="11" font-weight="bold" fill="{INK}">'
               f'リスクマトリクス（影響度×発生可能性）</text>')
    # 影響度＋発生可能性の合計が大きいマスほど濃くする
    tone = {2: "#eef0e8", 3: "#f2f1e4", 4: "#f7ede0", 5: "#f6e2d8", 6: "#f3ded9"}
    for ix in (1, 2, 3):
        for iy in (1, 2, 3):
            x = x0 + (ix - 1) * cw
            y = y0 + (3 - iy) * ch
            out.append(f'<rect x="{x}" y="{y}" width="{cw-5}" height="{ch-5}" '
                       f'fill="{tone[ix+iy]}" rx="7"/>')
    for ix in (1, 2, 3):
        out.append(f'<text x="{x0+(ix-1)*cw+(cw-5)/2:.1f}" y="{y0+3*ch+14}" font-size="9" '
                   f'fill="{SUB}" text-anchor="middle">発生可能性：{RISK_STEPS[ix-1]}</text>')
        out.append(f'<text x="{x0-8}" y="{y0+(3-ix)*ch+ch/2:.1f}" font-size="9" '
                   f'fill="{SUB}" text-anchor="end">影響：{RISK_STEPS[ix-1]}</text>')
    slots = {}
    for label, impact, likelihood in items:
        imp = min(3, max(1, int(impact or 1)))
        lik = min(3, max(1, int(likelihood or 1)))
        slots.setdefault((lik, imp), []).append(label)
    lb_fs = 8.4
    for (lx, ly), labels in slots.items():
        x = x0 + (lx - 1) * cw + 8
        y = y0 + (3 - ly) * ch + 17
        avail = (x0 + (lx - 1) * cw + cw - 5) - (x + 13) - 4
        for j, lb in enumerate(labels[:3]):
            out.append(f'<circle cx="{x+4}" cy="{y+j*21-3}" r="3.4" fill="{accent}"/>')
            for li, ln in enumerate(_fit_lines(lb, avail, lb_fs, max_lines=2)):
                out.append(f'<text x="{x+13}" y="{y+j*21+li*9.4:.1f}" font-size="{lb_fs}" '
                           f'fill="{INK}">{esc(ln)}</text>')
    out.append("</svg>")
    return "".join(out)

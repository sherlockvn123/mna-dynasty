// Small, dependency-free SVG charts. One axis only; identity never by colour alone (legend + dash + table view).
import { h, nf } from './dom.js';

const NS = 'http://www.w3.org/2000/svg';
const s = (tag, attrs = {}, ...kids) => { const el = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v); for (const c of kids) if (c != null) el.append(c); return el; };
const fmt = (x) => (x == null ? '—' : (x < 0 ? '−' : '') + nf(Math.abs(x), 1));

/**
 * J-curve chart for a fund simulation.
 * jc = FS.jCurve(sim). Bars = annual net LP cash flow (calls below zero, distributions above);
 * solid line = cumulative net cash (the J); dashed line = cumulative net cash + NAV (paper value included).
 */
export function jCurveChart(jc, { years = 10, title = 'J-curve — dòng tiền ròng của LP (triệu USD)' } = {}) {
  const W = 340, H = 196, L = 40, R = 10, T = 12, B = 26;
  const pts = jc.years;
  const vals = pts.flatMap((p) => [p.cum, p.net, p.total, -p.call, p.dist].filter((v) => v != null));
  let lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
  if (hi - lo < 1) hi = lo + 1;
  const span = hi - lo; lo -= span * 0.2; hi += span * 0.08; // extra room below for the trough label
  const x = (y) => L + ((y - 0.5) / years) * (W - L - R);
  const yv = (v) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const bw = Math.max(4, ((W - L - R) / years) * 0.42);

  // ticks: 4 round steps
  const step = (() => { const raw = (hi - lo) / 4, p = 10 ** Math.floor(Math.log10(raw)), m = raw / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; })();
  const ticks = []; for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);

  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'jc-svg', role: 'img', 'aria-label': title });
  // grid + axis labels (recessive)
  for (const v of ticks) {
    svg.append(s('line', { x1: L, x2: W - R, y1: yv(v), y2: yv(v), class: v === 0 ? 'jc-zero' : 'jc-grid' }));
    svg.append(s('text', { x: L - 5, y: yv(v) + 3, class: 'jc-tick', 'text-anchor': 'end' }, (v < 0 ? '−' : '') + nf(Math.abs(v), 0)));
  }
  for (let y = 1; y <= years; y++) svg.append(s('text', { x: x(y), y: H - 9, class: 'jc-tick', 'text-anchor': 'middle' }, String(y)));
  svg.append(s('text', { x: W - R, y: H - 0.5, class: 'jc-tick', 'text-anchor': 'end' }, 'năm'));

  // bars: calls (down) and distributions (up), side by side with a 2px gap, rounded ends away from the baseline
  const bar = (cx, v, cls) => {
    if (!v) return null;
    const y0 = yv(0), y1 = yv(v), top = Math.min(y0, y1), hgt = Math.max(1, Math.abs(y1 - y0));
    return s('rect', { x: cx, y: top, width: bw / 2 - 1, height: hgt, rx: Math.min(2, hgt / 2), class: cls });
  };
  for (const p of pts) {
    svg.append(bar(x(p.y) - bw / 2, -p.call, 'jc-call'));
    svg.append(bar(x(p.y) + 1, p.dist, 'jc-dist'));
  }
  // lines
  const path = (key) => { const q = pts.filter((p) => p[key] != null); return q.length ? q.map((p, i) => `${i ? 'L' : 'M'}${x(p.y).toFixed(1)},${yv(p[key]).toFixed(1)}`).join('') : null; };
  const dTot = path('total'), dCum = path('cum');
  if (dTot) svg.append(s('path', { d: dTot, class: 'jc-total' }));
  if (dCum) svg.append(s('path', { d: dCum, class: 'jc-cum' }));
  for (const p of pts) svg.append(s('circle', { cx: x(p.y), cy: yv(p.cum), r: 3, class: 'jc-dot' }));
  // trough marker + direct label on the J line
  if (jc.trough) {
    const tp = pts.find((p) => p.y === jc.trough.y);
    svg.append(s('circle', { cx: x(tp.y), cy: yv(tp.cum), r: 5, class: 'jc-trough' }));
    const lx = Math.min(W - R - 2, Math.max(L + 2, x(tp.y)));
    svg.append(s('text', { x: lx, y: Math.min(H - B - 4, yv(tp.cum) + 15), class: 'jc-label', 'text-anchor': tp.y > years / 2 ? 'end' : 'start' }, `Đáy ${fmt(tp.cum)} (năm ${tp.y})`));
  }

  // hover / tap layer: crosshair + tooltip
  const wrap = h('div', { class: 'jc' });
  const tip = h('div', { class: 'jc-tip', hidden: true });
  const cross = s('line', { y1: T, y2: H - B, class: 'jc-cross', visibility: 'hidden' });
  svg.append(cross);
  const show = (p) => {
    cross.setAttribute('x1', x(p.y)); cross.setAttribute('x2', x(p.y)); cross.setAttribute('visibility', 'visible');
    tip.hidden = false;
    tip.innerHTML = '';
    tip.append(h('b', {}, `Năm ${p.y}`), h('div', {}, `Gọi vốn: −${fmt(p.call)}`), h('div', {}, `Phân phối: ${fmt(p.dist)}`), h('div', {}, `Luỹ kế: ${fmt(p.cum)}`), p.total != null && h('div', {}, `Luỹ kế + NAV: ${fmt(p.total)}`));
    const pct = (x(p.y) / W) * 100;
    tip.style.left = pct > 60 ? '' : `calc(${pct}% + 8px)`; tip.style.right = pct > 60 ? `calc(${100 - pct}% + 8px)` : '';
  };
  const hide = () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); };
  for (const p of pts) {
    const hit = s('rect', { x: x(p.y) - (W - L - R) / years / 2, y: T, width: (W - L - R) / years, height: H - T - B, class: 'jc-hit' });
    hit.addEventListener('pointerenter', () => show(p)); hit.addEventListener('pointerdown', () => show(p)); hit.addEventListener('pointerleave', hide);
    svg.append(hit);
  }

  const legend = h('div', { class: 'jc-legend' },
    h('span', {}, h('i', { class: 'sw jc-call-sw' }), 'Gọi vốn'), h('span', {}, h('i', { class: 'sw jc-dist-sw' }), 'Phân phối'),
    h('span', {}, h('i', { class: 'ln jc-cum-sw' }), 'Luỹ kế (J-curve)'), h('span', {}, h('i', { class: 'ln dash jc-total-sw' }), 'Luỹ kế + NAV'));
  const table = h('details', { class: 'jc-table' }, h('summary', {}, 'Bảng số liệu'),
    h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Năm', 'Gọi vốn', 'Phân phối', 'Luỹ kế', '+ NAV'].map((t) => h('th', {}, t)))),
      h('tbody', {}, pts.map((p) => h('tr', {}, h('td', {}, p.y), h('td', {}, fmt(p.call)), h('td', {}, fmt(p.dist)), h('td', {}, fmt(p.cum)), h('td', {}, fmt(p.total)))))));
  wrap.append(h('div', { class: 'jc-title' }, title), legend, h('div', { class: 'jc-plot' }, svg, tip), table);
  return wrap;
}

/**
 * Compare J-curves normalised by commitment (× vốn cam kết): up to 3 of the player's funds (validated categorical
 * slots, fixed order) against a peer band (Q1–Q3 envelope) and the peer median (dashed). One axis; legend + table.
 */
const SERIES_CLS = ['jcx-s1', 'jcx-s2', 'jcx-s3'];
export function jCurveCompareChart({ series, band }, { years = 10, title = 'J-curve so với quỹ cùng vintage (× vốn cam kết)' } = {}) {
  const W = 340, H = 190, L = 40, R = 10, T = 10, B = 24;
  const shown = series.slice(0, 3);
  const all = [...shown.flatMap((s) => s.values), ...band.q1, ...band.q3, ...band.med, 0];
  let lo = Math.min(...all), hi = Math.max(...all); const span = hi - lo || 1; lo -= span * 0.08; hi += span * 0.08;
  const x = (y) => L + ((y - 1) / (years - 1)) * (W - L - R);
  const yv = (v) => T + ((hi - v) / (hi - lo)) * (H - T - B);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, class: 'jc-svg', role: 'img', 'aria-label': title });
  const step = (hi - lo) > 1.5 ? 0.5 : 0.25;
  for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) {
    svg.append(s('line', { x1: L, x2: W - R, y1: yv(v), y2: yv(v), class: Math.abs(v) < 1e-9 ? 'jc-zero' : 'jc-grid' }));
    svg.append(s('text', { x: L - 5, y: yv(v) + 3, class: 'jc-tick', 'text-anchor': 'end' }, (v < 0 ? '−' : '') + nf(Math.abs(v), 2) + '×'));
  }
  for (let y = 1; y <= years; y++) svg.append(s('text', { x: x(y), y: H - 8, class: 'jc-tick', 'text-anchor': 'middle' }, String(y)));
  // peer band (Q1–Q3 envelope) + median
  const top = band.q1.map((v, i) => Math.max(v, band.q3[i])), bot = band.q1.map((v, i) => Math.min(v, band.q3[i]));
  const env = top.map((v, i) => `${i ? 'L' : 'M'}${x(i + 1).toFixed(1)},${yv(v).toFixed(1)}`).join('') + bot.map((v, i) => i).reverse().map((i) => `L${x(i + 1).toFixed(1)},${yv(bot[i]).toFixed(1)}`).join('') + 'Z';
  svg.append(s('path', { d: env, class: 'jcx-band' }));
  const line = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i + 1).toFixed(1)},${yv(v).toFixed(1)}`).join('');
  svg.append(s('path', { d: line(band.med), class: 'jcx-med' }));
  shown.forEach((sr, k) => { svg.append(s('path', { d: line(sr.values), class: 'jcx-line ' + SERIES_CLS[k] })); sr.values.forEach((v, i) => svg.append(s('circle', { cx: x(i + 1), cy: yv(v), r: 2.5, class: 'jcx-dot ' + SERIES_CLS[k] }))); });
  // hover layer
  const wrap = h('div', { class: 'jc' }), tip = h('div', { class: 'jc-tip', hidden: true }), cross = s('line', { y1: T, y2: H - B, class: 'jc-cross', visibility: 'hidden' });
  svg.append(cross);
  const f = (v) => (v == null ? '—' : (v < 0 ? '−' : '') + nf(Math.abs(v), 2) + '×');
  for (let y = 1; y <= years; y++) {
    const hit = s('rect', { x: x(y) - (W - L - R) / (years - 1) / 2, y: T, width: (W - L - R) / (years - 1), height: H - T - B, class: 'jc-hit' });
    const show = () => {
      cross.setAttribute('x1', x(y)); cross.setAttribute('x2', x(y)); cross.setAttribute('visibility', 'visible'); tip.hidden = false; tip.innerHTML = '';
      tip.append(h('b', {}, `Năm ${y}`), ...shown.map((sr) => h('div', {}, `${sr.name}: ${f(sr.values[y - 1])}`)), h('div', {}, `Trung vị: ${f(band.med[y - 1])}`), h('div', { class: 'muted' }, `Q1–Q3: ${f(Math.min(band.q1[y - 1], band.q3[y - 1]))} … ${f(Math.max(band.q1[y - 1], band.q3[y - 1]))}`));
      const pct = (x(y) / W) * 100; tip.style.left = pct > 60 ? '' : `calc(${pct}% + 8px)`; tip.style.right = pct > 60 ? `calc(${100 - pct}% + 8px)` : '';
    };
    hit.addEventListener('pointerenter', show); hit.addEventListener('pointerdown', show); hit.addEventListener('pointerleave', () => { tip.hidden = true; cross.setAttribute('visibility', 'hidden'); });
    svg.append(hit);
  }
  const legend = h('div', { class: 'jc-legend' }, ...shown.map((sr, k) => h('span', {}, h('i', { class: 'ln ' + SERIES_CLS[k] + '-sw' }), sr.name)),
    h('span', {}, h('i', { class: 'ln dash jcx-med-sw' }), 'Trung vị quỹ đối chiếu'), h('span', {}, h('i', { class: 'sw jcx-band-sw' }), 'Dải Q1–Q3'));
  const table = h('details', { class: 'jc-table' }, h('summary', {}, 'Bảng số liệu'),
    h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Năm', ...shown.map((sr) => sr.name), 'Trung vị'].map((t) => h('th', {}, t)))),
      h('tbody', {}, Array.from({ length: years }, (_, i) => h('tr', {}, h('td', {}, i + 1), ...shown.map((sr) => h('td', {}, f(sr.values[i]))), h('td', {}, f(band.med[i])))))));
  wrap.append(h('div', { class: 'jc-title' }, title), legend, h('div', { class: 'jc-plot' }, svg, tip), table);
  return wrap;
}

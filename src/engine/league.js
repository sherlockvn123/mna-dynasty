// Fund league table: the player's funds across every timeline, ranked against a fictional peer universe.
// Peer funds are invented (Simulation Assumption) and only meant to show how quartiles, vintages,
// TVPI vs IRR vs DPI rankings and the public market equivalent (KS-PME) work. Pure functions — no state.
import { quartile } from './fundsim.js';

export const FUND_KEYS = ['f1', 'f2', 'f3'];
export const FUND_LABEL = { f1: 'Fund I · chu kỳ cổ điển', f2: 'Fund II · bùng nổ → khủng hoảng tín dụng', f3: 'Fund III · lãi suất cao, lạm phát đình trệ & AI', pooled: 'Thành tích gộp (theo vốn)' };
export const METRICS = { tvpi: 'net TVPI', irr: 'net IRR', dpi7: 'DPI năm 7', pme: 'KS-PME' };

// [family, name, size (triệu USD), net TVPI, net IRR %, DPI at year 7, KS-PME]
const P = (fam, name, size, tvpi, irr, dpi7, pme) => ({ fam, name, size, tvpi, irr, dpi7, pme });
export const PEERS = {
  f1: [P('may', 'Mây Trắng Capital I', 250, 2.45, 17.8, 0.9, 1.74), P('dieu', 'Cánh Diều Partners III', 400, 2.12, 13.1, 0.55, 1.48), P('bacdau', 'Bắc Đẩu Equity II', 180, 1.95, 15.2, 0.95, 1.45), P('phusa', 'Phù Sa Growth I', 150, 1.82, 9.4, 0.3, 1.27), P('doithong', 'Đồi Thông PE IV', 300, 1.71, 11.6, 0.8, 1.28),
    P('haidang', 'Ngọn Hải Đăng Partners II', 220, 1.55, 8.1, 0.45, 1.1), P('gionam', 'Gió Nam Partners I', 160, 1.42, 7.9, 0.4, 1.0), P('nganha', 'Ngân Hà Buyout I', 350, 1.28, 4.6, 0.2, 0.87), P('cauvong', 'Cầu Vồng Opportunity I', 120, 1.05, 0.9, 0.35, 0.73), P('dinhmay', 'Đỉnh Mây Capital I', 200, 0.82, -3.1, 0.25, 0.56)],
  f2: [P('may', 'Mây Trắng Capital II', 450, 2.21, 12.4, 0.4, 1.31), P('dieu', 'Cánh Diều Partners IV', 800, 1.48, 6.2, 0.25, 0.84), P('bacdau', 'Bắc Đẩu Equity III', 300, 1.89, 13.5, 0.6, 1.17), P('phusa', 'Phù Sa Growth II', 260, 1.66, 10.8, 0.35, 0.99), P('doithong', 'Đồi Thông PE V', 600, 1.32, 5.1, 0.2, 0.76),
    P('haidang', 'Ngọn Hải Đăng Partners III', 350, 2.02, 9.9, 0.3, 1.14), P('gionam', 'Gió Nam Partners II', 250, 1.18, 2.7, 0.3, 0.69), P('nganha', 'Ngân Hà Buyout II', 1000, 0.94, -1.0, 0.1, 0.53), P('dinhmay', 'Đỉnh Mây Capital II', 300, 1.61, 7.4, 0.45, 0.96), P('cauvong', 'Cầu Vồng Opportunity II', 150, 2.6, 15.8, 0.7, 1.59)],
  f3: [P('may', 'Mây Trắng Capital III', 600, 1.98, 10.6, 0.35, 1.22), P('dieu', 'Cánh Diều Partners V', 1200, 1.36, 5.2, 0.15, 0.82), P('bacdau', 'Bắc Đẩu Equity IV', 450, 2.15, 11.2, 0.5, 1.34), P('phusa', 'Phù Sa Growth III', 350, 1.74, 9.8, 0.4, 1.08), P('doithong', 'Đồi Thông PE VI', 800, 1.52, 7.0, 0.3, 0.92),
    P('haidang', 'Ngọn Hải Đăng Partners IV', 500, 1.64, 10.1, 0.55, 1.03), P('gionam', 'Gió Nam Partners III', 300, 1.25, 3.9, 0.25, 0.77), P('nganha', 'Ngân Hà Buyout III', 1500, 1.08, 1.2, 0.05, 0.65), P('dinhmay', 'Đỉnh Mây Capital III', 400, 1.88, 8.3, 0.3, 1.13), P('hatngoc', 'Hạt Ngọc Growth I', 200, 2.3, 16.4, 0.6, 1.46)],
};
export const PEER_FAMILY = { may: 'Mây Trắng Capital', dieu: 'Cánh Diều Partners', bacdau: 'Bắc Đẩu Equity', phusa: 'Phù Sa Growth', doithong: 'Đồi Thông PE', haidang: 'Ngọn Hải Đăng Partners', gionam: 'Gió Nam Partners', nganha: 'Ngân Hà Buyout', cauvong: 'Cầu Vồng Opportunity', dinhmay: 'Đỉnh Mây Capital', hatngoc: 'Hạt Ngọc Growth' };

/** Read a timeline's completed funds from its flags. Only funds with a final net TVPI are included; older saves may lack DPI/PME. */
export function fundsOf(flags = {}) {
  const out = {};
  const pick = (k, p, defSize) => {
    if (flags[p + 'tvpi'] == null) return;
    out[k] = { size: flags[p + 'size'] ?? defSize, tvpi: flags[p + 'tvpi'], irr: flags[p + 'irr'] ?? null, q: flags[p + 'quartile'] ?? quartile(flags[p + 'tvpi']), dpi7: flags[p + 'dpi7'] ?? null, pme: flags[p + 'pme'] ?? null, cum: Array.isArray(flags[p + 'cum']) ? flags[p + 'cum'] : null };
  };
  pick('f1', 'fund_', 200); pick('f2', 'fund2_', 350); pick('f3', 'fund3_', 500);
  return out;
}

/** Capital-weighted pooled TVPI (and PME where every fund has one) across a set of funds. */
export function pooled(funds) {
  const xs = Object.values(funds).filter((f) => f && f.tvpi != null && f.size > 0);
  const cap = xs.reduce((s, f) => s + f.size, 0);
  if (!cap) return null;
  const w = (k) => (xs.every((f) => f[k] != null) ? xs.reduce((s, f) => s + f.size * f[k], 0) / cap : null);
  return { size: cap, tvpi: w('tvpi'), pme: w('pme'), n: xs.length, q1: xs.filter((f) => quartile(f.tvpi) === 1).length };
}

function peerPooled() {
  const by = {};
  for (const k of FUND_KEYS) for (const p of PEERS[k]) (by[p.fam] ||= {})[k] = p;
  return Object.entries(by).map(([fam, fs]) => ({ fam, name: PEER_FAMILY[fam], ...pooled(fs) }));
}

/**
 * Build ranked rows for one view.
 * mine: [{ id, name, track, funds }] (one entry per timeline). view: 'f1' | 'f2' | 'f3' | 'pooled'. metric: key of METRICS.
 * Missing values (older saves) sort last.
 */
export function leagueRows(mine, view = 'f1', metric = 'tvpi') {
  let rows;
  if (view === 'pooled') {
    rows = [...peerPooled().map((p) => ({ name: p.name, size: p.size, tvpi: p.tvpi, pme: p.pme, irr: null, dpi7: null, n: p.n, q1: p.q1, mine: false })),
      ...mine.map((m) => ({ m, p: pooled(m.funds) })).filter((x) => x.p).map(({ m, p }) => ({ name: m.name, tlId: m.id, track: m.track, size: p.size, tvpi: p.tvpi, pme: p.pme, irr: null, dpi7: null, n: p.n, q1: p.q1, mine: true }))];
    if (metric !== 'pme') metric = 'tvpi';
  } else {
    rows = [...PEERS[view].map((p) => ({ ...p, mine: false })),
      ...mine.filter((m) => m.funds[view]).map((m) => ({ name: m.name, tlId: m.id, track: m.track, ...m.funds[view], mine: true }))];
  }
  const val = (r) => r[metric] ?? -Infinity;
  rows.sort((a, b) => val(b) - val(a) || (b.mine ? 1 : 0) - (a.mine ? 1 : 0));
  rows.forEach((r, i) => { r.rank = i + 1; r.q = quartile(r.tvpi); });
  return rows;
}

/** Rank of each of the player's funds under every metric, to show that "best fund" depends on the question asked. */
export function rankGap(mine, view) {
  const by = Object.fromEntries(Object.keys(METRICS).map((k) => [k, leagueRows(mine, view, k)]));
  return by.tvpi.filter((r) => r.mine).map((r) => {
    const rank = (k) => (r[k] == null ? null : by[k].find((x) => x.mine && x.tlId === r.tlId).rank);
    return { name: r.name, tvpiRank: rank('tvpi'), irrRank: rank('irr'), dpiRank: rank('dpi7'), pmeRank: rank('pme'), of: by.tvpi.length };
  });
}

// ---------- J-curve comparison ----------
// Peer universe J-curves (Simulation Assumption): LP cumulative net cash as a multiple of commitments, years 1–10.
// q1 = top-quartile path, med = median, q3 = third-quartile path. Shape follows each vintage's macro path.
export const PEER_JCURVE = {
  f1: { q1: [-0.12, -0.32, -0.55, -0.7, -0.72, -0.5, -0.1, 0.4, 0.85, 1.2], med: [-0.12, -0.3, -0.5, -0.62, -0.68, -0.6, -0.35, 0, 0.4, 0.75], q3: [-0.12, -0.28, -0.45, -0.58, -0.66, -0.66, -0.55, -0.35, -0.05, 0.35] },
  f2: { q1: [-0.1, -0.25, -0.45, -0.65, -0.82, -0.75, -0.4, 0.15, 0.7, 1.15], med: [-0.1, -0.25, -0.42, -0.6, -0.75, -0.78, -0.6, -0.25, 0.2, 0.65], q3: [-0.1, -0.24, -0.4, -0.56, -0.7, -0.76, -0.72, -0.55, -0.25, 0.2] },
  f3: { q1: [-0.08, -0.22, -0.42, -0.6, -0.76, -0.68, -0.35, 0.1, 0.6, 1.05], med: [-0.08, -0.2, -0.38, -0.55, -0.7, -0.72, -0.55, -0.25, 0.15, 0.6], q3: [-0.08, -0.2, -0.36, -0.52, -0.66, -0.72, -0.68, -0.5, -0.2, 0.25] },
};

/** Normalise a fund's cumulative cash curve by its commitment (× commitments), so funds of different sizes compare. */
export const normCurve = (fund) => (fund?.cum && fund.size ? fund.cum.map((v) => v / fund.size) : null);

/** Trough depth, trough year and first year back to ≥ 0 for a normalised curve. */
export function curveStats(c) {
  if (!c?.length) return null;
  let ty = 1; c.forEach((v, i) => { if (v < c[ty - 1]) ty = i + 1; });
  const be = c.findIndex((v, i) => i + 1 > ty && v >= 0);
  return { trough: c[ty - 1], troughYear: ty, breakeven: be < 0 ? null : be + 1, end: c[c.length - 1] };
}

/** Series for the comparison chart: the player's funds in a vintage (with a stored curve) plus the peer band. */
export function jCurveCompare(mine, view) {
  const series = mine.filter((m) => m.funds[view]?.cum).map((m) => ({ name: m.name, tlId: m.id, values: normCurve(m.funds[view]), stats: curveStats(normCurve(m.funds[view])) }));
  const missing = mine.filter((m) => m.funds[view] && !m.funds[view].cum).map((m) => m.name);
  return { series, band: PEER_JCURVE[view], peerStats: curveStats(PEER_JCURVE[view].med), missing };
}

// Multi-year fund simulation (10 years). Pure & deterministic: no randomness — outcomes follow a scripted,
// explainable macro cycle, each company's growth/cyclicality/leverage, the player's timing and specialization.
// Scenarios: Fund I (classic cycle) and Fund II (boom → credit crisis, bigger fund, style-drift temptation).
// Units: triệu USD. State is a plain JSON object so it can be persisted mid-simulation.
import { irr } from './finance.js';

export const YEARS = 10, INVEST_YEARS = 4, DISTRESS_LEV = 6, CURE_LEV = 5;
const vn = (x, d = 1) => Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });

export const REGIMES = {
  expansion: { name: 'Mở rộng', icon: '☀️', g: 0.03, mult: 0, paydown: 0.08, why: 'Nhu cầu tăng, tín dụng dễ dàng, bội số định giá ổn định.' },
  rates: { name: 'Lãi suất tăng', icon: '📈', g: 0, mult: -1, paydown: 0.04, why: 'Chi phí vốn tăng làm bội số định giá giảm khoảng 1x; dòng tiền dành trả nợ ít hơn.' },
  recession: { name: 'Suy thoái', icon: '🌧️', g: -0.15, mult: -2, paydown: 0, why: 'Doanh nghiệp chu kỳ giảm mạnh EBITDA; bội số giảm ~2x; công ty vay nhiều có thể vi phạm covenant.' },
  recovery: { name: 'Phục hồi', icon: '🌱', g: 0.05, mult: 0.5, paydown: 0.08, why: 'Nhu cầu quay lại, người mua trở lại thị trường, bội số hồi phục.' },
  boom: { name: 'Bùng nổ định giá', icon: '🎈', g: 0.04, mult: 1.5, paydown: 0.08, why: 'Tiền rẻ và FOMO đẩy bội số lên cao hơn trung bình ngành. Giá trị trên giấy tăng — nhưng giá mua cũng vậy.' },
  crisis: { name: 'Khủng hoảng tín dụng', icon: '⛈️', g: -0.12, mult: -2.5, paydown: 0, why: 'Ngân hàng ngừng cho vay, bội số sụp mạnh, công ty vay nhiều vi phạm covenant. Người bán cần thanh khoản — giá mua rẻ hiếm có.' },
  stagflation: { name: 'Lạm phát đình trệ', icon: '🌫️', g: -0.04, mult: -1.5, paydown: 0.02, why: 'Chi phí đầu vào tăng, nhu cầu yếu, lãi suất vẫn cao. Bội số không thể "cứu" lợi nhuận — giá trị phải đến từ cải thiện vận hành.' },
};
const DISTRESS_REGIMES = ['recession', 'crisis'];

// ---------- Fund I deck (classic cycle) ----------
// cyc = sensitivity to the cycle (0 = defensive, 1.5+ = very cyclical). fair = sector median multiple valuations revert to (defaults to entry).
export const MACRO_PATH = ['expansion', 'expansion', 'rates', 'rates', 'recession', 'recovery', 'expansion', 'expansion', 'rates', 'expansion'];
export const DEALS = [
  { id: 'd1', year: 1, name: 'Chuỗi phòng khám Bình An', sector: 'healthcare', ebitda: 8, mult: 10, lev: 5, g: 0.06, cyc: 0.4 },
  { id: 'd2', year: 1, name: 'Phần mềm kế toán SME "SổXanh"', sector: 'saas', ebitda: 5, mult: 14, lev: 4, g: 0.12, cyc: 0.6 },
  { id: 'd3', year: 1, name: 'Nhà máy bao bì Sao Mai', sector: 'industrial', ebitda: 10, mult: 8, lev: 6.5, g: 0.03, cyc: 1.8 },
  { id: 'd4', year: 2, name: 'Chuỗi trường mầm non Mầm Xanh', sector: 'education', ebitda: 4, mult: 9, lev: 4, g: 0.08, cyc: 0.3 },
  { id: 'd5', year: 2, name: 'Hãng tư vấn EPM Bluepeak', sector: 'consulting', ebitda: 3, mult: 11, lev: 3, g: 0.10, cyc: 1.0, redflag: 'EBITDA đã cộng "synergy kỳ vọng" vào add-back' },
  { id: 'd6', year: 2, name: 'Chuỗi thời trang Lụa Hồng', sector: 'consumer', ebitda: 6, mult: 12, lev: 6, g: 0.04, cyc: 1.6 },
  { id: 'd7', year: 3, name: 'Trang trại điện mặt trời Nắng Vàng', sector: 'energy', ebitda: 6, mult: 9, lev: 6, g: 0.02, cyc: 0.1 },
  { id: 'd8', year: 3, name: 'Logistics lạnh Băng Tuyết', sector: 'logistics', ebitda: 5, mult: 7, lev: 4, g: 0.07, cyc: 0.9 },
  { id: 'd9', year: 3, name: 'AI dự báo nhu cầu "Mầm AI"', sector: 'ai', ebitda: 2, mult: 25, lev: 0, g: 0.25, cyc: 1.2 },
  { id: 'd10', year: 4, name: 'Chuỗi nha khoa Nụ Cười (add-on)', sector: 'healthcare', ebitda: 3, mult: 7, lev: 3, g: 0.06, cyc: 0.3 },
  { id: 'd11', year: 4, name: 'Chuỗi nhà hàng Bếp Mẹ', sector: 'consumer', ebitda: 4, mult: 8, lev: 5.5, g: 0.03, cyc: 1.5 },
  { id: 'd12', year: 4, name: 'Toà văn phòng Hoa Lan', sector: 'realestate', ebitda: 6, mult: 12, lev: 7.5, g: 0.02, cyc: 1.0 },
];

// ---------- Fund II deck (boom → credit crisis; mid-market vs large-cap) ----------
export const MACRO_PATH_2 = ['recovery', 'expansion', 'boom', 'boom', 'crisis', 'recovery', 'expansion', 'rates', 'expansion', 'expansion'];
export const DEALS_2 = [
  { id: 'g1', year: 1, name: 'Nền tảng nha khoa toàn quốc', sector: 'healthcare', ebitda: 12, mult: 9, lev: 4.5, g: 0.05, cyc: 0.3 },
  { id: 'g2', year: 1, name: 'Phần mềm quản lý trường học "LớpXanh"', sector: 'education', ebitda: 6, mult: 12, lev: 3, g: 0.09, cyc: 0.4 },
  { id: 'g3', year: 1, name: 'Chuỗi phòng gym Năng Lượng', sector: 'consumer', ebitda: 8, mult: 9, lev: 5, g: 0.04, cyc: 1.3 },
  { id: 'g4', year: 2, name: 'Logistics thương mại điện tử', sector: 'logistics', ebitda: 10, mult: 10, lev: 5, g: 0.06, cyc: 1.0 },
  { id: 'g5', year: 2, name: 'Nền tảng tư vấn EPM khu vực', sector: 'consulting', ebitda: 5, mult: 10, lev: 3, g: 0.07, cyc: 0.8 },
  { id: 'g6', year: 2, name: 'Large-cap: tư nhân hoá tập đoàn bán lẻ niêm yết', sector: 'consumer', ebitda: 40, mult: 11, lev: 6.5, g: 0.02, cyc: 1.2, large: true },
  { id: 'g7', year: 3, name: 'AI SaaS "đang hot" — vòng gọi vốn cạnh tranh', sector: 'ai', ebitda: 4, mult: 30, fair: 15, lev: 0, g: 0.15, cyc: 1.5 },
  { id: 'g8', year: 3, name: 'Bệnh viện tư Hoà Bình', sector: 'healthcare', ebitda: 15, mult: 13, fair: 9, lev: 6, g: 0.04, cyc: 0.3 },
  { id: 'g9', year: 3, name: 'Large-cap: hãng hàng không giá rẻ', sector: 'industrial', ebitda: 50, mult: 10, fair: 6, lev: 7, g: 0.02, cyc: 2.0, large: true },
  { id: 'g10', year: 4, name: 'Large-cap: chuỗi trung tâm dữ liệu', sector: 'realestate', ebitda: 20, mult: 18, fair: 12, lev: 9, g: 0.06, cyc: 0.5, large: true },
  { id: 'g11', year: 4, name: 'Chuỗi cà phê Mây Trắng', sector: 'consumer', ebitda: 6, mult: 16, fair: 10, lev: 6, g: 0.05, cyc: 1.4 },
  { id: 'g12', year: 4, name: 'Phần mềm quản lý phòng khám', sector: 'healthcare', ebitda: 5, mult: 20, fair: 13, lev: 4, g: 0.08, cyc: 0.4 },
  { id: 'g13', year: 5, name: 'Nhà máy dược generic (chủ cần bán gấp)', sector: 'healthcare', ebitda: 10, mult: 6, fair: 8, lev: 3, g: 0.05, cyc: 0.3 },
  { id: 'g14', year: 5, name: 'Phần mềm kế toán (quỹ cũ cần thanh khoản)', sector: 'saas', ebitda: 6, mult: 8, fair: 12, lev: 2, g: 0.09, cyc: 0.5 },
  { id: 'g15', year: 5, name: 'Chuỗi khách sạn (đang tái cấu trúc nợ)', sector: 'hospitality', ebitda: 12, mult: 5, fair: 7, lev: 4, g: 0.03, cyc: 1.8 },
];

// ---------- Fund III deck (higher-for-longer rates, stagflation, AI disruption) ----------
// ai: −1 = business model exposed to AI substitution (growth −6%/yr from year 4 unless transformed); +1 = AI beneficiary (+3%/yr).
export const MACRO_PATH_3 = ['rates', 'rates', 'stagflation', 'stagflation', 'recovery', 'expansion', 'expansion', 'rates', 'expansion', 'expansion'];
export const DEALS_3 = [
  { id: 'h1', year: 1, name: 'Chuỗi phòng khám thú y', sector: 'healthcare', ebitda: 8, mult: 10, lev: 4, g: 0.04, cyc: 0.3 },
  { id: 'h2', year: 1, name: 'Trung tâm BPO / chăm sóc khách hàng (giá rẻ)', sector: 'consulting', ebitda: 10, mult: 7, lev: 4, g: 0.03, cyc: 0.6, ai: -1 },
  { id: 'h3', year: 1, name: 'Phần mềm quản lý chuỗi lạnh', sector: 'saas', ebitda: 5, mult: 12, lev: 3, g: 0.08, cyc: 0.5, ai: 1 },
  { id: 'h4', year: 2, name: 'Nhà máy linh kiện điện mặt trời', sector: 'energy', ebitda: 12, mult: 8, lev: 4, g: 0.05, cyc: 1.0 },
  { id: 'h5', year: 2, name: 'Chuỗi trung tâm Anh ngữ', sector: 'education', ebitda: 6, mult: 9, lev: 3.5, g: 0.05, cyc: 0.5, ai: -1 },
  { id: 'h6', year: 2, name: 'Large-cap: tập đoàn viễn thông', sector: 'industrial', ebitda: 60, mult: 8, lev: 6, g: 0.01, cyc: 0.6, large: true },
  { id: 'h7', year: 3, name: 'Dịch vụ bảo trì lưới điện', sector: 'industrial', ebitda: 9, mult: 7, fair: 8.5, lev: 3.5, g: 0.04, cyc: 0.4 },
  { id: 'h8', year: 3, name: 'Agency sản xuất nội dung marketing', sector: 'consulting', ebitda: 7, mult: 8, lev: 4, g: 0.02, cyc: 1.0, ai: -1 },
  { id: 'h9', year: 3, name: 'Trung tâm dữ liệu biên (edge)', sector: 'realestate', ebitda: 10, mult: 14, fair: 12, lev: 6, g: 0.1, cyc: 0.3, ai: 1 },
  { id: 'h10', year: 4, name: 'Nền tảng dịch vụ kế toán SME (roll-up)', sector: 'consulting', ebitda: 6, mult: 7, fair: 9, lev: 3, g: 0.04, cyc: 0.4 },
  { id: 'h11', year: 4, name: 'Chuỗi thực phẩm chế biến', sector: 'consumer', ebitda: 10, mult: 8, lev: 5, g: 0.03, cyc: 0.7 },
  { id: 'h12', year: 4, name: 'Startup AI cho bệnh viện (vòng gọi vốn "nóng")', sector: 'ai', ebitda: 3, mult: 25, fair: 14, lev: 0, g: 0.12, cyc: 0.8, ai: 1 },
  { id: 'h13', year: 5, name: 'Logistics chuỗi lạnh', sector: 'logistics', ebitda: 8, mult: 8, fair: 9, lev: 4, g: 0.04, cyc: 0.7 },
  { id: 'h14', year: 5, name: 'Phần mềm an ninh mạng', sector: 'saas', ebitda: 5, mult: 13, fair: 15, lev: 2, g: 0.1, cyc: 0.3, ai: 1 },
  { id: 'h15', year: 5, name: 'Nhà máy bao bì', sector: 'industrial', ebitda: 9, mult: 6.5, lev: 4.5, g: 0.02, cyc: 1.1 },
];

export const SCENARIOS = {
  fund1: { name: 'Fund I', path: MACRO_PATH, deals: DEALS, investYears: 4 },
  fund2: { name: 'Fund II', path: MACRO_PATH_2, deals: DEALS_2, investYears: 5, events: ['lp_squeeze', 'rescue', 'continuation'] },
  fund3: { name: 'Fund III', path: MACRO_PATH_3, deals: DEALS_3, investYears: 5, events: ['refi_wall', 'ai_disruption'], aiYear: 4, vcp: true },
};
export const ALL_DEALS = Object.fromEntries([...DEALS, ...DEALS_2, ...DEALS_3].map((d) => [d.id, d]));
export const DEAL_BY_ID = ALL_DEALS; // backward-compatible alias
const scen = (sim) => SCENARIOS[sim?.scenario || 'fund1'];
const pathOf = (sim) => sim?.path || MACRO_PATH;
export const investYears = (sim) => sim?.investYears ?? INVEST_YEARS;

export const equityCheck = (d) => d.ebitda * (d.mult - d.lev);
export const CONCENTRATION = 0.2; // LPA limit: max 20% of commitments in a single company
/** Fund's cheque: full equity or capped at the concentration limit (co-investors take the rest). */
export const fundCheque = (sim, d) => Math.min(equityCheck(d), CONCENTRATION * sim.committed);

/** Management fee for a year: full rate on commitments in years 1–5, half rate afterwards (step-down). */
export const feeFor = (sim, year) => sim.committed * sim.feeRate * (year <= 5 ? 1 : 0.5);

export function createSim({ committed = 200, feeBps = 200, spec = null, scenario = 'fund1', crises = false, opTeam = false } = {}) {
  const S = SCENARIOS[scenario];
  const sim = { v: 2, scenario, path: S.path, investYears: S.investYears, committed, feeRate: feeBps / 10000, spec, year: 1, paidIn: 0, flows: Array(YEARS + 1).fill(0), calls: Array(YEARS + 1).fill(0), dists: Array(YEARS + 1).fill(0), holdings: [], log: [], done: false, result: null, crises: crises ? [...(S.events || [])] : [], events: [], pending: null, vcp: !!S.vcp, vcpCost: opTeam ? VCP_COST_OPTEAM : VCP_COST, aiYear: S.aiYear || null, navLoan: 0, navYear: null };
  chargeFee(sim);
  return sim;
}
function chargeFee(sim) {
  const fee = Math.min(feeFor(sim, sim.year), sim.committed - sim.paidIn);
  call(sim, fee);
}
function call(sim, amt) { sim.paidIn += amt; sim.calls[sim.year] += amt; sim.flows[sim.year] -= amt; }
function distribute(sim, amt) { sim.dists[sim.year] += amt; sim.flows[sim.year] += amt; }

export const regimeKey = (year, sim) => pathOf(sim)[Math.min(YEARS, Math.max(1, year)) - 1];
export const regimeOf = (year, sim) => REGIMES[regimeKey(year, sim)];
export const dryPowder = (sim) => sim.committed - sim.paidIn;
/** Valuation multiple: the sector's fair multiple adjusted by the current regime (boom premia fade; bargains re-rate). */
export const curMultiple = (h, year, sim) => { const d = ALL_DEALS[h.id]; return Math.max(4, (d.fair ?? d.mult) + regimeOf(year, sim).mult); };
export const equityValue = (h, year, sim) => Math.max(0, h.ebitda * curMultiple(h, year, sim) - h.debt) * (h.share ?? 1);
export const nav = (sim) => sim.holdings.filter((h) => h.status === 'held').reduce((s, h) => s + equityValue(h, sim.year, sim), 0);
export const offers = (sim) => (sim.year <= investYears(sim) ? scen(sim).deals.filter((d) => d.year === sim.year && !sim.holdings.some((h) => h.id === d.id)) : []);

export function canInvest(sim, id) {
  const d = ALL_DEALS[id];
  if (!d || sim.done || !scen(sim).deals.includes(d)) return 'Không hợp lệ';
  if (sim.year > investYears(sim)) return `Đã hết giai đoạn đầu tư (năm 1–${investYears(sim)})`;
  if (d.year !== sim.year) return 'Cơ hội này không có trong năm nay';
  if (sim.holdings.some((h) => h.id === id)) return 'Đã đầu tư';
  if (fundCheque(sim, d) > dryPowder(sim) - reserveForFees(sim) + 1e-9) return 'Không đủ vốn (cần giữ lại phí quản lý cho các năm sau)';
  return null;
}
/** Remaining management fees that must stay uncalled for future years. */
export function reserveForFees(sim) { let r = 0; for (let y = sim.year + 1; y <= YEARS; y++) r += feeFor(sim, y); return r; }

export function invest(sim, id) {
  const err = canInvest(sim, id); if (err) return err;
  const d = ALL_DEALS[id];
  const eq = fundCheque(sim, d), share = eq / equityCheck(d);
  call(sim, eq);
  sim.holdings.push({ id, entryYear: sim.year, ebitda: d.ebitda, debt: d.ebitda * d.lev, debt0: d.ebitda * d.lev, cost: eq, share, status: 'held', proceeds: 0, distressed: false, revealed: false });
  sim.log.push(`Năm ${sim.year}: đầu tư ${d.name} — ${vn(eq, 1)} triệu USD${share < 1 ? ` (${Math.round(share * 100)}% cổ phần; giới hạn tập trung 20% quỹ, phần còn lại cho co-investors)` : ''}.`);
  return null;
}

export function canExit(sim, i) { const h = sim.holdings[i]; if (!h || h.status !== 'held') return 'Không hợp lệ'; if (sim.year - h.entryYear < 2) return 'Cần nắm giữ ít nhất 2 năm'; if (h.distressed) return 'Phải xử lý vi phạm covenant trước'; return null; }
export function exit(sim, i) {
  const err = canExit(sim, i); if (err) return err;
  const h = sim.holdings[i];
  h.proceeds = equityValue(h, sim.year, sim); h.status = 'exited'; h.exitYear = sim.year;
  distribute(sim, h.proceeds);
  sim.log.push(`Năm ${sim.year}: thoái vốn ${ALL_DEALS[h.id].name} — nhận ${vn(h.proceeds, 1)} (MOIC ${vn((h.proceeds / h.cost), 2)}x).`);
  return null;
}
export const cureCost = (h) => Math.max(0, h.debt - CURE_LEV * h.ebitda) * (h.share ?? 1);
export function cure(sim, i) {
  const h = sim.holdings[i]; if (!h?.distressed) return 'Không cần';
  const c = cureCost(h); if (c > dryPowder(sim) - reserveForFees(sim) + 1e-9) return 'Không đủ vốn để bơm thêm';
  call(sim, c); h.debt = CURE_LEV * h.ebitda; h.cost += c; h.distressed = false;
  sim.log.push(`Năm ${sim.year}: bơm ${vn(c, 1)} vào ${ALL_DEALS[h.id].name} để đưa nợ về ${CURE_LEV}x EBITDA (equity cure).`);
  return null;
}
export function writeOff(sim, i) {
  const h = sim.holdings[i]; if (!h || h.status !== 'held') return 'Không hợp lệ';
  h.status = 'written_off'; h.distressed = false; h.exitYear = sim.year;
  sim.log.push(`Năm ${sim.year}: ${ALL_DEALS[h.id].name} được giao lại cho chủ nợ — mất toàn bộ vốn chủ.`);
  return null;
}

/** Close the current year and evolve the portfolio into the next one. Unresolved distress is written off. */
export function advance(sim) {
  if (sim.done) return 'Đã kết thúc';
  if (sim.pending) return 'Hãy xử lý sự kiện khủng hoảng trước khi sang năm mới';
  sim.holdings.forEach((h, i) => { if (h.status === 'held' && h.distressed) writeOff(sim, i); });
  (sim.navHist ||= [])[sim.year] = nav(sim); // end-of-year NAV for the J-curve
  if (sim.year === YEARS) return finish(sim);
  if (sim.year >= investYears(sim) && !sim.holdings.some((h) => h.status === 'held')) { sim.log.push(`Năm ${sim.year}: mọi khoản đầu tư đã thoái — quỹ giải thể sớm, ngừng thu phí.`); return finish(sim); }
  sim.year += 1;
  const R = regimeOf(sim.year, sim), key = regimeKey(sim.year, sim);
  for (const h of sim.holdings) {
    if (h.status !== 'held') continue;
    const d = ALL_DEALS[h.id];
    if (d.redflag && !h.revealed) { h.ebitda *= 0.7; h.revealed = true; sim.log.push(`Năm ${sim.year}: Quality of Earnings của ${d.name} lộ vấn đề — EBITDA thực thấp hơn 30%.`); }
    let g = d.g + d.cyc * R.g + (sim.spec && sim.spec === d.sector ? 0.02 : 0);
    if (h.vcpYears > 0) { g += VCP_UPLIFT; h.vcpYears -= 1; }
    if (sim.aiYear && sim.year >= sim.aiYear && d.ai) g += d.ai < 0 ? (h.transformed ? AI_TRANSFORMED : -AI_PENALTY) : AI_TAILWIND;
    h.ebitda *= 1 + g;
    h.debt = h.refiHigh ? h.debt * (1 + REFI_DRAG) : Math.max(0, h.debt - R.paydown * h.debt0);
    h.distressed = DISTRESS_REGIMES.includes(key) && h.ebitda > 0 && h.debt / h.ebitda > DISTRESS_LEV;
    if (h.distressed) sim.log.push(`Năm ${sim.year}: ⚠ ${d.name} vi phạm covenant (Nợ/EBITDA ${vn((h.debt / h.ebitda), 1)}x > ${DISTRESS_LEV}x).`);
  }
  chargeFee(sim);
  triggerEvents(sim);
  return null;
}

/** Year-10 liquidation, carry (20% with 8% hurdle, full catch-up) and LP net metrics. */
export function finish(sim) {
  sim.holdings.forEach((h) => { if (h.status === 'held') { h.proceeds = equityValue(h, sim.year, sim); h.status = 'exited'; h.exitYear = sim.year; distribute(sim, h.proceeds); } });
  if (sim.navLoan > 0) { const due = navLoanDue(sim); distribute(sim, -due); sim.log.push(`Năm ${sim.year}: hoàn trả NAV loan ${vn(sim.navLoan)} cộng lãi — tổng ${vn(due)} trừ vào phân phối cho LP.`); }
  const gross = sim.flows.slice(1);
  const totalDist = sim.dists.reduce((a, b) => a + b, 0);
  const profit = totalDist - sim.paidIn;
  const fin = (x) => (Number.isFinite(x) ? x : -1); // no distributions at all → total loss
  const grossIrr = fin(irr(gross));
  const carry = profit > 0 && grossIrr >= 0.08 ? 0.2 * profit : 0;
  const lastDist = sim.dists.reduce((last, v, i) => (v > 0 ? i : last), YEARS);
  const net = [...gross]; net[lastDist - 1] -= carry;
  const lpD = sim.dists.map((d, i) => (i === lastDist ? d - carry : d));
  const idx = publicIndex(sim), T = sim.year;
  const dpiAt = (y) => { const c = sim.calls.slice(0, y + 1).reduce((a, b) => a + b, 0); return c ? lpD.slice(0, y + 1).reduce((a, b) => a + b, 0) / c : 0; };
  const lpDist = totalDist - carry;
  const invested = sim.holdings.reduce((s, h) => s + h.cost, 0);
  const grossProceeds = sim.holdings.reduce((s, h) => s + h.proceeds, 0);
  sim.result = {
    scenario: sim.scenario || 'fund1', committed: sim.committed,
    paidIn: sim.paidIn, totalDist, carry, lpDist, netTvpi: lpDist / sim.paidIn, dpi: lpDist / sim.paidIn, netIrr: fin(irr(net)), grossIrr,
    grossMoic: invested ? grossProceeds / invested : 0, invested, fees: sim.calls.reduce((a, b) => a + b, 0) - invested,
    deployed: invested / sim.committed, largeCaps: sim.holdings.filter((h) => ALL_DEALS[h.id].large).length,
    writeOffs: sim.holdings.filter((h) => h.status === 'written_off').length, deals: sim.holdings.length,
    quartile: quartile(lpDist / sim.paidIn),
    dpi5: dpiAt(5), dpi7: dpiAt(7), pme: ksPme(sim.calls, lpD, idx, T), publicTr: idx[T] / idx[0],
    cum: (() => { let c = 0; return Array.from({ length: T }, (_, i) => { c += lpD[i + 1] - (sim.calls[i + 1] || 0); return Math.round(c * 10) / 10; }); })(), // LP cumulative net cash by year (J-curve)
    events: (sim.events || []).map((e) => ({ ...e })),
    vcps: sim.holdings.filter((h) => h.vcpDone && !h.cv).length, navLoan: sim.navLoan || 0, aiTransformed: sim.holdings.filter((h) => h.transformed).length,
  };
  sim.done = true;
  sim.log.push(`Kết thúc quỹ: net TVPI ${vn(sim.result.netTvpi, 2)}x, net IRR ${vn((sim.result.netIrr * 100), 1)}%.`);
  return null;
}

/** Simulation benchmark (illustrative, not market data). */
export function quartile(netTvpi) { return netTvpi >= 2.0 ? 1 : netTvpi >= 1.6 ? 2 : netTvpi >= 1.3 ? 3 : 4; }

/** Interim metrics at any point. */
export function metrics(sim) {
  const d = sim.dists.reduce((a, b) => a + b, 0), n = nav(sim);
  return { paidIn: sim.paidIn, dists: d, nav: n, dpi: sim.paidIn ? d / sim.paidIn : 0, rvpi: sim.paidIn ? n / sim.paidIn : 0, tvpi: sim.paidIn ? (d + n) / sim.paidIn : 0, dry: dryPowder(sim) };
}

// ---------- Fund II crisis events (deterministic, triggered by year + portfolio state) ----------
// Each event pauses the simulation until the GP chooses a response. Options change the fund mechanically
// (commitments, dilution, cash calls, exits) and carry a judgement score used in the LP debrief.
// All numbers are Simulation Assumptions.
const freeCash = (sim) => Math.max(0, dryPowder(sim) - reserveForFees(sim));
const LP_SHARE = 0.1, RESCUE_CASH = 0.3, RESCUE_DILUTION = 0.2, CV_DISCOUNT = 0.85, CV_SELL = 0.5;
export const EVENT_PARAMS = { LP_SHARE, RESCUE_CASH, RESCUE_DILUTION, CV_DISCOUNT, CV_SELL };
/** Denominator effect: PE weight after public assets fall, with PE marked flat. */
export const denominatorWeight = (target = 0.1, publicDrop = 0.3) => target / (target + (1 - target) * (1 - publicDrop));
export const rescueCost = (h) => RESCUE_CASH * cureCost(h);
export function starIndex(sim) {
  let best = -1, v = 0;
  sim.holdings.forEach((h, i) => { if (h.status === 'held' && !h.distressed && sim.year - h.entryYear >= 2) { const x = equityValue(h, sim.year, sim); if (x > v) { v = x; best = i; } } });
  return best;
}
function lpExcuse(sim) { const cut = LP_SHARE * dryPowder(sim); sim.committed -= cut; sim.log.push(`Năm ${sim.year}: vốn cam kết giảm ${vn(cut)} — LP không tham gia các lần gọi vốn còn lại.`); }
const distressedIdx = (sim) => [...sim.holdings.keys()].filter((i) => sim.holdings[i].status === 'held' && sim.holdings[i].distressed);
function rescueOne(sim, i) {
  const h = sim.holdings[i], c = rescueCost(h);
  if (c > freeCash(sim) + 1e-9) { writeOff(sim, i); return; }
  call(sim, c); h.cost += c; h.share = (h.share ?? 1) * (1 - RESCUE_DILUTION); h.distressed = false; h.rescued = true;
  sim.log.push(`Năm ${sim.year}: rescue financing cho ${ALL_DEALS[h.id].name} — quỹ góp ${vn(c)}, chủ nợ nhận ${RESCUE_DILUTION * 100}% vốn chủ, vi phạm covenant được miễn.`);
}
/** Partial GP-led secondary: sell `frac` of a position at fair value, the rest rolls over (keeps upside). */
function sellPart(sim, i, frac) {
  if (i < 0) return;
  const h = sim.holdings[i], v = equityValue(h, sim.year, sim) * frac;
  sim.holdings.push({ ...h, cost: h.cost * frac, share: (h.share ?? 1) * frac, proceeds: v, status: 'exited', exitYear: sim.year, cv: true });
  h.cost *= 1 - frac; h.share = (h.share ?? 1) * (1 - frac); h.rolled = true;
  distribute(sim, v);
  sim.log.push(`Năm ${sim.year}: continuation vehicle cho ${ALL_DEALS[h.id].name} — bán ${frac * 100}% ở giá cạnh tranh, nhận ${vn(v)}; phần còn lại chuyển tiếp.`);
}
function sellAt(sim, i, f, label) {
  if (i < 0) return;
  const h = sim.holdings[i]; h.proceeds = equityValue(h, sim.year, sim) * f; h.status = 'exited'; h.exitYear = sim.year;
  distribute(sim, h.proceeds);
  sim.log.push(`Năm ${sim.year}: ${label} ${ALL_DEALS[h.id].name} — nhận ${vn(h.proceeds)} (MOIC ${vn(h.proceeds / h.cost, 2)}x).`);
}

export const FUND_EVENTS = {
  lp_squeeze: {
    year: 5, icon: '🏦', title: 'LP gặp "denominator effect"', who: 'tung',
    when: (sim) => dryPowder(sim) > 1,
    story: (sim) => `Cổ phiếu niêm yết giảm mạnh. Một quỹ hưu trí (${LP_SHARE * 100}% vốn cam kết) có tỷ trọng mục tiêu 10% cho PE. Danh mục niêm yết giảm 30% đẩy tỷ trọng PE lên ~${vn(denominatorWeight() * 100)}% dù họ không mua thêm. Họ báo không muốn đáp ứng các lần gọi vốn tiếp theo (còn ${vn(LP_SHARE * dryPowder(sim))} triệu USD chưa gọi).`,
    lesson: 'Denominator effect: khi tài sản niêm yết giảm, tỷ trọng tài sản tư nhân (định giá chậm) tự tăng, buộc LP cắt cam kết mới đúng lúc giá mua rẻ nhất. Thị trường secondaries cung cấp lối ra.',
    options: [
      { t: 'Kết nối LP với một quỹ secondaries mua lại phần góp vốn; cam kết chưa gọi chuyển sang LP mới', score: 1, out: 'LP có thanh khoản, quỹ giữ nguyên vốn cam kết đúng lúc thị trường rẻ. Chú Tùng: "Đó là cách một GP đối xử với đối tác."', apply: () => {} },
      { t: 'Miễn cho LP các lần gọi vốn còn lại — thu nhỏ quỹ', score: 0.5, out: 'Quan hệ được giữ, nhưng quỹ mất vốn khả dụng đúng lúc có cơ hội mua rẻ.', apply: lpExcuse },
      { t: 'Tuyên bố LP vi phạm và công khai đe doạ kiện', score: 0, out: 'Theo LPA bạn có quyền, nhưng cả cộng đồng LP lo ngại cho Fund III — và tiền vẫn không về.', apply: lpExcuse },
    ],
  },
  rescue: {
    year: 5, icon: '🛟', title: 'Quỹ tín dụng đề nghị rescue financing', who: 'an',
    when: (sim) => sim.holdings.some((h) => h.status === 'held' && h.distressed),
    story: (sim) => {
      const ds = sim.holdings.filter((h) => h.status === 'held' && h.distressed);
      return `${ds.length} công ty vi phạm covenant: ${ds.map((h) => `${ALL_DEALS[h.id].name} (equity cure ${vn(cureCost(h))})`).join('; ')}. Một quỹ tín dụng đề nghị: chủ nợ miễn vi phạm nếu quỹ góp ${RESCUE_CASH * 100}% số tiền equity cure và nhường ${RESCUE_DILUTION * 100}% vốn chủ. Equity cure toàn bộ cần ${vn(ds.reduce((s, h) => s + cureCost(h), 0))}; vốn khả dụng còn ${vn(freeCash(sim))}.`;
    },
    lesson: 'Trong khủng hoảng tín dụng, tiền mặt là tài sản quý nhất. Rescue capital tốn ít tiền mặt nhưng đắt về pha loãng; equity cure giữ nguyên cổ phần nhưng "khoá" vốn khả dụng đúng lúc có thương vụ giá rẻ; giao công ty cho chủ nợ ở đáy chu kỳ là chốt lỗ vĩnh viễn.',
    options: [
      { t: 'Nhận rescue financing cho các công ty còn khả năng phục hồi; giữ vốn khả dụng cho cơ hội mua rẻ năm khủng hoảng', score: 1, out: 'Các công ty sống sót qua đáy chu kỳ với chi phí tiền mặt thấp; bạn vẫn còn "đạn" cho thương vụ giá rẻ.', apply: (sim) => distressedIdx(sim).forEach((i) => rescueOne(sim, i)) },
      { t: 'Tự bơm equity cure cho tất cả — không chấp nhận pha loãng', score: 0.7, out: 'Bạn giữ nguyên cổ phần nhưng dùng nhiều vốn khả dụng; công ty nào không đủ tiền cứu sẽ phải giao cho chủ nợ.', apply: (sim) => distressedIdx(sim).forEach((i) => { if (cure(sim, i)) writeOff(sim, i); }) },
      { t: 'Giao tất cả cho chủ nợ để "cắt lỗ"', score: 0.2, out: 'Bạn chốt lỗ ở đúng đáy chu kỳ — mất toàn bộ quyền hưởng phục hồi.', apply: (sim) => distressedIdx(sim).forEach((i) => writeOff(sim, i)) },
    ],
  },
  continuation: {
    year: 7, icon: '🔄', title: 'GP-led continuation vehicle', who: 'tung',
    when: (sim) => starIndex(sim) >= 0,
    story: (sim) => {
      const i = starIndex(sim), h = sim.holdings[i], m = metrics(sim);
      return `LP cần thanh khoản sau khủng hoảng (DPI hiện ${vn(m.dpi, 2)}x). ${ALL_DEALS[h.id].name} là tài sản tốt nhất (giá trị ${vn(equityValue(h, sim.year, sim))}). Đội ngũ muốn nắm giữ thêm vài năm qua một continuation vehicle do chính GP quản lý — GP vừa là người bán (đại diện LP cũ) vừa là người mua.`;
    },
    lesson: 'Continuation vehicle tạo thanh khoản cho LP và thêm thời gian cho tài sản tốt, nhưng có xung đột lợi ích. Chuẩn mực: quy trình cạnh tranh, fairness opinion độc lập, LP được chọn bán hay chuyển tiếp, LPAC phê duyệt.',
    options: [
      { t: 'Quy trình cạnh tranh: nhiều quỹ secondaries trả giá, fairness opinion độc lập, LPAC phê duyệt, LP chọn bán hoặc chuyển tiếp', score: 1, out: `${CV_SELL * 100}% vị thế được bán ở giá cạnh tranh (LP muốn thanh khoản nhận tiền ngay); phần còn lại chuyển tiếp và tiếp tục hưởng tăng trưởng.`, apply: (sim) => sellPart(sim, starIndex(sim), CV_SELL) },
      { t: 'Giữ đến năm 10 — không làm gì', score: 0.6, out: 'Không có xung đột lợi ích, nhưng LP chờ thanh khoản lâu hơn và tài sản phải chịu rủi ro chu kỳ.', apply: () => {} },
      { t: `GP tự định giá thấp hơn ~${Math.round((1 - CV_DISCOUNT) * 100)}% và chuyển công ty sang quỹ mới của mình`, score: 0, out: 'LP cũ bán rẻ cho chính GP. Khi bị phát hiện, uy tín và đạo đức nghề nghiệp bị tổn hại nghiêm trọng.', apply: (sim) => sellAt(sim, starIndex(sim), CV_DISCOUNT, 'chuyển nội bộ (GP tự định giá)') },
    ],
  },
};

function triggerEvents(sim) {
  if (!sim.crises?.length || sim.pending) return;
  const id = sim.crises.find((e) => FUND_EVENTS[e].year === sim.year && !sim.events.some((x) => x.id === e) && FUND_EVENTS[e].when(sim));
  if (id) { sim.pending = id; sim.pendingStory = FUND_EVENTS[id].story(sim); sim.log.push(`Năm ${sim.year}: ${FUND_EVENTS[id].icon} ${FUND_EVENTS[id].title}.`); }
}
/** Apply the GP's response to the pending crisis; another same-year event may follow. */
export function resolveEvent(sim, k) {
  const id = sim.pending; if (!id) return 'Không có sự kiện';
  const E = FUND_EVENTS[id], o = E.options[k]; if (!o) return 'Lựa chọn không hợp lệ';
  o.apply(sim);
  sim.events.push({ id, year: sim.year, choice: k, score: o.score, title: E.title, out: o.out });
  sim.log.push(`Năm ${sim.year}: quyết định — ${o.t}.`);
  sim.pending = null; sim.pendingStory = null;
  triggerEvents(sim);
  return null;
}

// ---------- Fund III mechanics: value creation plans, AI disruption, refinancing wall, NAV loans ----------
// All parameters are Simulation Assumptions chosen to make the trade-offs visible, not market data.
export const VCP_COST = 0.45, VCP_COST_OPTEAM = 0.3, VCP_UPLIFT = 0.05, VCP_YEARS = 3, VCP_LAST_YEAR = 8;
export const AI_PENALTY = 0.1, AI_TAILWIND = 0.03, AI_TRANSFORMED = 0.01, AI_TRANSFORM_COST = 0.6, AI_FIRE_SALE = 0.95;
export const REFI_LEV = 4.5, REFI_TARGET = 4, REFI_PENALTY = 0.12, REFI_DRAG = 0.03, NAV_RATE = 0.15;

/** One-off operating investment (pricing, procurement, digital, talent): costs vcpCost × EBITDA × stake, adds +4% growth for 3 years. */
export const vcpCost = (sim, h) => (sim.vcpCost ?? VCP_COST) * h.ebitda * (h.share ?? 1);
export function canVcp(sim, i) {
  const h = sim.holdings[i];
  if (!sim.vcp) return 'Không áp dụng cho quỹ này';
  if (!h || h.status !== 'held') return 'Không hợp lệ';
  if (h.vcpDone) return 'Đã triển khai kế hoạch tạo giá trị';
  if (sim.year > VCP_LAST_YEAR) return 'Quá muộn để kế hoạch kịp tạo kết quả trước khi thoái vốn';
  if (vcpCost(sim, h) > freeCash(sim) + 1e-9) return 'Không đủ vốn khả dụng';
  return null;
}
export function valueCreation(sim, i) {
  const err = canVcp(sim, i); if (err) return err;
  const h = sim.holdings[i], c = vcpCost(sim, h);
  call(sim, c); h.cost += c; h.vcpDone = true; h.vcpYears = VCP_YEARS;
  sim.log.push(`Năm ${sim.year}: kế hoạch tạo giá trị cho ${ALL_DEALS[h.id].name} — đầu tư ${vn(c)}; tăng trưởng +${VCP_UPLIFT * 100}%/năm trong ${VCP_YEARS} năm.`);
  return null;
}
export const navLoanDue = (sim) => sim.navLoan * (1 + NAV_RATE) ** Math.max(0, sim.year - sim.navYear);
const refiIdx = (sim) => [...sim.holdings.keys()].filter((i) => { const h = sim.holdings[i]; return h.status === 'held' && h.ebitda > 0 && h.debt / h.ebitda > REFI_LEV; });
export const refiPaydown = (h) => Math.max(0, h.debt - REFI_TARGET * h.ebitda) * (h.share ?? 1);
const aiIdx = (sim) => [...sim.holdings.keys()].filter((i) => sim.holdings[i].status === 'held' && ALL_DEALS[sim.holdings[i].id].ai < 0);
export const aiTransformCost = (h) => AI_TRANSFORM_COST * h.ebitda * (h.share ?? 1);

function payDown(sim, i, viaNav) {
  const h = sim.holdings[i], c = refiPaydown(h);
  if (!viaNav && c > freeCash(sim) + 1e-9) { refiExpensive(sim, i); return; }
  if (viaNav) { sim.navLoan += c; sim.navYear = sim.navYear ?? sim.year; } else { call(sim, c); h.cost += c; }
  h.debt = REFI_TARGET * h.ebitda + (h.debt - REFI_TARGET * h.ebitda) * (1 - (h.share ?? 1)); // co-investors' part of the excess stays
  sim.log.push(`Năm ${sim.year}: ${ALL_DEALS[h.id].name} trả bớt nợ ${vn(c)} ${viaNav ? 'bằng NAV loan cấp quỹ' : 'bằng vốn gọi từ LP'}; ngân hàng gia hạn khoản vay (amend & extend).`);
}
function refiExpensive(sim, i) {
  const h = sim.holdings[i]; h.debt *= 1 + REFI_PENALTY; h.refiHigh = true;
  sim.log.push(`Năm ${sim.year}: ${ALL_DEALS[h.id].name} tái cấp vốn ở lãi suất cao — phí làm nợ tăng ${REFI_PENALTY * 100}% và lãi cao nuốt dòng tiền trả nợ (nợ tiếp tục tăng ${REFI_DRAG * 100}%/năm).`);
}

Object.assign(FUND_EVENTS, {
  refi_wall: {
    year: 3, icon: '🧱', title: 'Bức tường tái cấp vốn (refinancing wall)', who: 'an',
    when: (sim) => refiIdx(sim).length > 0,
    story: (sim) => `Các khoản vay ký khi lãi suất thấp sắp đáo hạn trong môi trường lãi suất cao. Ngân hàng chỉ gia hạn nếu nợ giảm về ${REFI_TARGET}x EBITDA: ${refiIdx(sim).map((i) => `${ALL_DEALS[sim.holdings[i].id].name} (Nợ/EBITDA ${vn(sim.holdings[i].debt / sim.holdings[i].ebitda)}x, cần trả ${vn(refiPaydown(sim.holdings[i]))})`).join('; ')}. Vốn khả dụng: ${vn(freeCash(sim))}.`,
    lesson: 'Khi lãi suất "cao lâu hơn", cấu trúc vốn quan trọng ngang chiến lược. Gọi vốn LP để giảm nợ làm tăng mẫu số TVPI nhưng không tốn lãi; NAV loan cấp quỹ làm đẹp IRR tạm thời nhưng chi phí 15%/năm cộng dồn ăn vào lợi nhuận của LP.',
    options: [
      { t: `Amend & extend: gọi vốn LP để trả nợ về ${REFI_TARGET}x EBITDA, ngân hàng gia hạn`, score: 1, out: 'Cấu trúc vốn an toàn; lãi tiết kiệm được chảy về vốn chủ.', apply: (sim) => refiIdx(sim).forEach((i) => payDown(sim, i, false)) },
      { t: 'Chấp nhận tái cấp vốn ở lãi suất cao, không bơm thêm vốn', score: 0.4, out: 'Giữ vốn khả dụng, nhưng chi phí lãi cao làm nợ phình ra.', apply: (sim) => refiIdx(sim).forEach((i) => refiExpensive(sim, i)) },
      { t: `Vay NAV loan cấp quỹ (${NAV_RATE * 100}%/năm, thế chấp danh mục) để trả nợ thay vì gọi vốn LP`, score: 0.3, out: 'IRR tạm thời trông đẹp hơn vì LP chưa phải góp tiền — nhưng khoản vay đắt cộng dồn và được trả trước LP khi thoái vốn. Nhiều LP coi đây là rủi ro minh bạch.', apply: (sim) => refiIdx(sim).forEach((i) => payDown(sim, i, true)) },
    ],
  },
  ai_disruption: {
    year: 4, icon: '🤖', title: 'AI thay đổi mô hình kinh doanh', who: 'minhanh',
    when: (sim) => aiIdx(sim).length > 0,
    story: (sim) => `Các công cụ AI tạo sinh đang thay thế một phần dịch vụ của: ${aiIdx(sim).map((i) => `${ALL_DEALS[sim.holdings[i].id].name} (chi phí chuyển đổi ${vn(aiTransformCost(sim.holdings[i]))})`).join('; ')}. Nếu không thay đổi, tăng trưởng giảm khoảng ${AI_PENALTY * 100}%/năm. Vốn khả dụng: ${vn(freeCash(sim))}.`,
    lesson: 'Công nghệ đột phá vừa là rủi ro vừa là đòn bẩy tạo giá trị. Người sở hữu chủ động chuyển đổi mô hình (dùng AI để tăng năng suất, đổi sản phẩm) thường giữ được giá trị; bán cho người mua có năng lực chuyển đổi thu tiền sớm nhưng nhường phần tăng trưởng; người phớt lờ chịu xói mòn dần.',
    options: [
      { t: 'Đầu tư chương trình chuyển đổi AI cho từng công ty bị ảnh hưởng (sản phẩm mới, năng suất, đào tạo lại nhân sự)', score: 1, out: 'Các công ty biến AI thành công cụ năng suất thay vì mối đe doạ.', apply: (sim) => aiIdx(sim).forEach((i) => { const h = sim.holdings[i], c = aiTransformCost(h); if (c <= freeCash(sim) + 1e-9) { call(sim, c); h.cost += c; h.transformed = true; sim.log.push(`Năm ${sim.year}: chuyển đổi AI cho ${ALL_DEALS[h.id].name} — đầu tư ${vn(c)}.`); } }) },
      { t: `Bán cho người mua chiến lược có năng lực AI (giá hợp lý trừ ~${Math.round((1 - AI_FIRE_SALE) * 100)}% vì rủi ro chuyển đổi)`, score: 0.7, out: 'Bạn cắt rủi ro và nhường phần chuyển đổi cho người làm được tốt hơn — nhưng từ bỏ phần tăng trưởng sau này.', apply: (sim) => aiIdx(sim).forEach((i) => sellToStrategic(sim, i)) },
      { t: 'Không làm gì — "AI chỉ là trào lưu"', score: 0.2, out: 'Doanh thu xói mòn từng năm khi khách hàng chuyển sang giải pháp AI.', apply: () => {} },
    ],
  },
});
/** Sale to a strategic buyer who can run the AI transformation: values the business at its sector multiple, minus a transition discount. */
function sellToStrategic(sim, i) {
  const h = sim.holdings[i], d = ALL_DEALS[h.id];
  h.proceeds = Math.max(0, h.ebitda * (d.fair ?? d.mult) - h.debt) * (h.share ?? 1) * AI_FIRE_SALE; h.status = 'exited'; h.exitYear = sim.year;
  distribute(sim, h.proceeds);
  sim.log.push(`Năm ${sim.year}: bán ${d.name} cho người mua chiến lược — nhận ${vn(h.proceeds)} (MOIC ${vn(h.proceeds / h.cost, 2)}x).`);
}

// ---------- Public market equivalent (Kaplan–Schoar PME) ----------
// A scripted public equity index that follows the same macro path (Simulation Assumption): total return per regime.
export const PUBLIC_RETURN = { expansion: 0.14, rates: -0.06, recession: -0.18, recovery: 0.25, boom: 0.18, crisis: -0.3, stagflation: -0.08 };
/** Index level at the end of each year (index[0] = 100 at fund start). */
export function publicIndex(sim) {
  const I = [100];
  for (let y = 1; y <= YEARS; y++) I[y] = I[y - 1] * (1 + PUBLIC_RETURN[regimeKey(y, sim)]);
  return I;
}
/** KS-PME = Σ distributions × I_T/I_t ÷ Σ contributions × I_T/I_t. > 1 means the fund beat the public index with the same cash-flow timing. */
export function ksPme(calls, dists, I, T = YEARS) {
  let c = 0, d = 0;
  for (let t = 1; t <= T; t++) { const g = I[T] / I[t]; c += (calls[t] || 0) * g; d += (dists[t] || 0) * g; }
  return c ? d / c : 0;
}

// ---------- J-curve (LP view) ----------
/**
 * Year-by-year LP cash flows: calls (fees + investments) are negative, distributions positive (carry deducted
 * in the final distribution year once the fund is finished). cum = cumulative net cash; total = cum + NAV.
 * Covers years 1..current (or the final year when done). trough = deepest cumulative point; breakeven = first year cum ≥ 0.
 */
export function jCurve(sim) {
  const last = sim.done ? (sim.result?.carry ? sim.dists.reduce((l, v, i) => (v > 0 ? i : l), YEARS) : -1) : -1;
  const carry = sim.done ? sim.result?.carry || 0 : 0;
  const yrs = [];
  let cum = 0;
  for (let y = 1; y <= sim.year; y++) {
    const call = sim.calls[y] || 0, dist = (sim.dists[y] || 0) - (y === last ? carry : 0), net = dist - call;
    cum += net;
    const navY = sim.done && y === sim.year ? 0 : y === sim.year ? nav(sim) : sim.navHist?.[y] ?? null;
    yrs.push({ y, call, dist, net, cum, nav: navY, total: navY == null ? null : cum + navY });
  }
  const trough = yrs.reduce((m, p) => (p.cum < m.cum ? p : m), { y: 0, cum: 0 });
  const be = yrs.find((p) => p.y > trough.y && p.cum >= 0);
  return { years: yrs, trough: trough.y ? { y: trough.y, value: trough.cum } : null, breakeven: be ? be.y : null };
}

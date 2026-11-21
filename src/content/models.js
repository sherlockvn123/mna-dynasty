// Interactive model definitions used by "model" mission steps and the Workbench.
// compute(values) → { rows: [[label, value, format]], warn?: string, table?: {...} }
import * as F from '../engine/finance.js';

export const fmt = {
  n0: (x) => Number.isFinite(x) ? x.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) : '—',
  n1: (x) => Number.isFinite(x) ? x.toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) : '—',
  n2: (x) => Number.isFinite(x) ? x.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '—',
  pct: (x) => Number.isFinite(x) ? (x * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + '%' : '—',
  x: (x) => Number.isFinite(x) ? x.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + 'x' : '—',
};

export const MODELS = {
  lemonade: {
    title: 'Quầy nước chanh — Cung & Cầu',
    note: 'Cầu: số ly bán/ngày = 120 − 8 × giá. Chi phí: 3 nghìn đồng/ly + 40 nghìn đồng thuê quầy/ngày. Đơn vị: nghìn đồng.',
    inputs: [{ k: 'price', label: 'Giá mỗi ly (nghìn đồng)', min: 1, max: 14, step: 1, val: 5, f: 'n0' }],
    compute: (v) => {
      const r = F.lemonade({ price: v.price, unitCost: 3, fixedCost: 40, a: 120, b: 8 });
      return { rows: [['Số ly bán được', r.q, 'n0'], ['Doanh thu', r.revenue, 'n0'], ['Chi phí', r.revenue - r.profit, 'n0'], ['Lợi nhuận/ngày', r.profit, 'n0']], out: r };
    },
  },
  compound: {
    title: 'Ống heo — Lãi kép',
    note: 'Số tiền ban đầu 500 nghìn đồng. Lãi được cộng dồn mỗi năm.',
    inputs: [{ k: 'r', label: 'Lãi suất/năm (%)', min: 0, max: 12, step: 1, val: 8, f: 'n0' }, { k: 'n', label: 'Số năm', min: 1, max: 30, step: 1, val: 10, f: 'n0' }],
    compute: (v) => { const x = F.fv(500, v.r / 100, v.n); return { rows: [['Giá trị tương lai (nghìn đồng)', x, 'n0'], ['Tiền lãi tích luỹ', x - 500, 'n0']], out: { fv: x } }; },
  },
  dcf: {
    title: 'DCF — Chuỗi Bánh Mây Hồng',
    note: 'FCFF dự phóng 5 năm (tỷ đồng): 50, 55, 60, 64, 68. Net Debt = 200 tỷ. 50 triệu cổ phiếu. Quy ước cuối năm.',
    inputs: [{ k: 'wacc', label: 'WACC (%)', min: 7, max: 13, step: 0.5, val: 10, f: 'n1' }, { k: 'g', label: 'Terminal growth g (%)', min: 0, max: 4, step: 0.5, val: 2.5, f: 'n1' }],
    compute: (v) => {
      const r = F.dcf({ fcff: [50, 55, 60, 64, 68], wacc: v.wacc / 100, g: v.g / 100, netDebt: 200, shares: 50 });
      return { rows: [['PV dòng tiền 5 năm', r.sumPv, 'n1'], ['Terminal Value (năm 5)', r.tv, 'n1'], ['PV of Terminal Value', r.pvTv, 'n1'], ['Enterprise Value', r.ev, 'n1'], ['Equity Value', r.equity, 'n1'], ['Giá trị/cổ phiếu (nghìn đồng)', r.perShare, 'n2'], ['Tỷ trọng TV trong EV', r.tvShare, 'pct']], out: r };
    },
  },
  lbo: {
    title: 'LBO — GreenLeaf Packaging',
    note: 'EBITDA năm 0 = 50 triệu USD, tăng 6%/năm. D&A 15% EBITDA, Capex 20% EBITDA, thuế 25%, lãi vay 8%, phí 2% EV, 5 năm, 100% cash sweep.',
    inputs: [
      { k: 'entry', label: 'Entry multiple (EV/EBITDA)', min: 6, max: 11, step: 0.5, val: 8, f: 'n1' },
      { k: 'debt', label: 'Debt / EBITDA', min: 3, max: 6.5, step: 0.5, val: 5, f: 'n1' },
      { k: 'exit', label: 'Exit multiple', min: 6, max: 10, step: 0.5, val: 8, f: 'n1' },
      { k: 'rate', label: 'Lãi suất nợ (%)', min: 5, max: 12, step: 0.5, val: 8, f: 'n1' },
    ],
    compute: (v) => {
      const r = F.lbo(lboParams(v));
      const y1 = r.rows[0];
      return {
        rows: [['Entry EV', r.entryEv, 'n1'], ['Nợ vay (Sources)', r.debt0, 'n1'], ['Sponsor Equity', r.equity0, 'n1'], ['Nợ năm 5', r.rows[4].close, 'n1'], ['Exit EV', r.exitEv, 'n1'], ['Exit Equity', r.exitEquity, 'n1'], ['MOIC', r.moic, 'x'], ['IRR', r.irr, 'pct'], ['Interest coverage năm 1', y1.coverage, 'x']],
        warn: y1.coverage < 2 ? '⚠️ Interest coverage năm 1 dưới 2,0x — rủi ro tín dụng cao, ngân hàng khó cho vay.' : (r.irr < 0.2 ? 'IRR thấp hơn hurdle 20% của quỹ.' : ''),
        table: { head: ['Năm', 'EBITDA', 'Lãi vay', 'FCF', 'Trả nợ', 'Dư nợ'], rows: r.rows.map((x) => [x.year, x.ebitda, x.interest, x.fcf, x.repay, x.close]) },
        out: r,
      };
    },
  },
  round: {
    title: 'Cap Table — Series A của Mầm AI',
    note: 'Founders sở hữu 8.000.000 cổ phiếu trước vòng. Quỹ option pool được bổ sung trong pre-money.',
    inputs: [
      { k: 'pre', label: 'Pre-money (triệu USD)', min: 20, max: 48, step: 1, val: 32, f: 'n0' },
      { k: 'inv', label: 'Vốn đầu tư (triệu USD)', min: 4, max: 12, step: 1, val: 8, f: 'n0' },
      { k: 'pool', label: 'Option pool sau vòng (%)', min: 0, max: 15, step: 1, val: 10, f: 'n0' },
      { k: 'exit', label: 'Giá trị exit giả định (triệu USD)', min: 10, max: 300, step: 10, val: 30, f: 'n0' },
    ],
    compute: (v) => {
      const r = F.pricedRound({ preMoney: v.pre, investment: v.inv, sharesPre: 8_000_000, poolPostPct: v.pool / 100 });
      const w = F.waterfall(v.exit, [{ name: 'Series A', invested: v.inv, shares: r.newInvShares }], 8_000_000 + r.newPool);
      const founderPct = 8_000_000 / r.totalShares;
      return {
        rows: [['Post-money', r.postMoney, 'n1'], ['Sở hữu nhà đầu tư', r.invPct, 'pct'], ['Sở hữu founders', founderPct, 'pct'], ['Pre-money hiệu dụng (sau pool shuffle)', r.effectivePreMoney, 'n1'], ['Giá/cổ phiếu (USD)', r.price * 1e6, 'n2'], ['Series A nhận khi exit', w.perSeries[0], 'n2'], ['Series A chuyển đổi?', w.converted[0] ? 1 : 0, 'bool'], ['Common (founders + pool) nhận', w.common, 'n2']],
        out: { ...r, w, founderPct },
      };
    },
  },
  ad: {
    title: 'Accretion / Dilution — Pastel Retail × Hoa Mai Cosmetics',
    note: 'Bên mua: LN ròng 120 tỷ, 100 triệu cp, giá 24 nghìn đ/cp. Mục tiêu: LN ròng 15 tỷ. Lãi vay 6%, thuế 20%.',
    inputs: [
      { k: 'price', label: 'Giá mua vốn chủ (tỷ đồng)', min: 240, max: 450, step: 10, val: 360, f: 'n0' },
      { k: 'stock', label: 'Tỷ lệ trả bằng cổ phiếu (%)', min: 0, max: 100, step: 10, val: 50, f: 'n0' },
      { k: 'syn', label: 'Synergies trước thuế (tỷ đồng)', min: 0, max: 30, step: 1, val: 0, f: 'n0' },
    ],
    compute: (v) => {
      const r = F.accretionDilution({ acqNI: 120, acqShares: 100, acqPrice: 24, tgtNI: 15, purchasePrice: v.price, pctStock: v.stock / 100, kd: 0.06, tax: 0.2, synergies: v.syn });
      return { rows: [['Cổ phiếu phát hành mới (triệu)', r.newShares, 'n2'], ['Nợ vay mới', r.newDebt, 'n1'], ['Lãi vay sau thuế', r.afterTaxInterest, 'n2'], ['EPS độc lập (nghìn đ)', r.baseEps, 'n2'], ['EPS pro forma', r.proEps, 'n2'], ['Accretion / (Dilution)', r.accretion, 'pct'], ['Synergies hoà vốn (trước thuế)', r.breakevenSyn, 'n2']], out: r };
    },
  },
  consult: {
    title: 'Consulting Firm Model — EPM Practice (dữ liệu hư cấu)',
    note: 'Simulation Assumption: 1.800 giờ/người/năm, chi phí 120.000 USD/người, SG&A 15% doanh thu, chi phí thay thế 30.000 USD/người nghỉ việc.',
    inputs: [
      { k: 'n', label: 'Số consultants', min: 10, max: 40, step: 1, val: 20, f: 'n0' },
      { k: 'u', label: 'Utilization (%)', min: 50, max: 90, step: 1, val: 72, f: 'n0' },
      { k: 'rate', label: 'Bill rate (USD/giờ)', min: 100, max: 250, step: 5, val: 160, f: 'n0' },
      { k: 'real', label: 'Realization (%)', min: 70, max: 100, step: 1, val: 92, f: 'n0' },
      { k: 'attr', label: 'Attrition (%)', min: 5, max: 40, step: 1, val: 18, f: 'n0' },
    ],
    compute: (v) => {
      const r = F.consultingFirm({ consultants: v.n, utilization: v.u / 100, hours: 1800, billRate: v.rate, realization: v.real / 100, costPerConsultant: 120000, sgaPct: 0.15, attrition: v.attr / 100, replaceCost: 30000 });
      return { rows: [['Giờ tính phí', r.billableHours, 'n0'], ['Doanh thu (USD)', r.revenue, 'n0'], ['Gross margin', r.grossMargin, 'pct'], ['Chi phí attrition', r.attritionCost, 'n0'], ['EBITDA (USD)', r.ebitda, 'n0'], ['EBITDA margin', r.ebitdaMargin, 'pct'], ['Doanh thu/consultant', r.revPerConsultant, 'n0']], out: r };
    },
  },
};

// ---------------- Sector models (Industry Workbench) ----------------
// Optional return fields: sens = { title, rowLabel, colLabel, rows, cols, cells, f, base:[ri,ci] }, checks = [[label, ok]].
const near = (arr, v) => arr.reduce((b, x, i) => (Math.abs(x - v) < Math.abs(arr[b] - v) ? i : b), 0);

export const clinicParams = (v) => ({ clinics: v.clinics, visitsPerClinic: v.visits * 1000, capacityPerClinic: 25000, revPerVisit: v.price / 1000, insurancePct: v.ins / 100, reimbursementCut: v.cut / 100, varCostPerVisit: 0.15, fixedPerClinic: 5.2, doctorLossPct: v.loss / 100 });
export const solarParams = (v) => ({ mw: 50, cf: v.cf / 100, degradation: 0.005, ppa: v.ppa, ppaEscalation: 0, opex: 1.0, opexInflation: 0.02, capex: 45, years: 20, debtPct: v.debt / 100, rate: v.rate / 100, tenor: 15 });
export const reParams = (v) => ({ price: 120, grossRent: 12, vacancy: v.vac / 100, opex: 3, growth: v.growth / 100, ltv: v.ltv / 100, rate: v.rate / 100, years: 5, exitCap: v.exitCap / 100, costPct: 0.02 });
export const saasParams = (v) => ({ startArr: 50, nrr: v.nrr / 100, newArr: v.newArr, grossMargin: 0.8, magicNumber: v.magic, rndPct: 0.2, gaPct: 0.12, years: 5 });
export const aiParams = (v) => ({ users: v.users * 1000, pricePerUser: v.price, queriesPerUser: v.queries, costPerQuery: v.cost / 100, otherCogsPct: 0.1 });

Object.assign(MODELS, {
  healthcare: {
    title: 'Healthcare Operating Model — Chuỗi phòng khám', sector: 'healthcare',
    note: 'Simulation: sức chứa 25.000 lượt/phòng khám/năm, chi phí biến đổi 150 nghìn đồng/lượt, chi phí cố định 5,2 tỷ/phòng khám. Đơn vị: tỷ đồng.',
    inputs: [
      { k: 'clinics', label: 'Số phòng khám', min: 3, max: 12, step: 1, val: 6, f: 'n0' },
      { k: 'visits', label: 'Lượt khám/phòng khám/năm (nghìn)', min: 12, max: 25, step: 1, val: 20, f: 'n0' },
      { k: 'price', label: 'Doanh thu/lượt (nghìn đồng)', min: 300, max: 800, step: 25, val: 500, f: 'n0' },
      { k: 'ins', label: 'Tỷ trọng bảo hiểm chi trả (%)', min: 0, max: 100, step: 5, val: 60, f: 'n0' },
      { k: 'cut', label: 'Bảo hiểm cắt giá hoàn trả (%)', min: 0, max: 20, step: 1, val: 0, f: 'n0' },
      { k: 'loss', label: 'Lượt khám mất do bác sĩ nghỉ (%)', min: 0, max: 30, step: 1, val: 0, f: 'n0' },
    ],
    compute: (v) => {
      const r = F.clinicModel(clinicParams(v));
      const rows = [14, 16, 18, 20, 22, 24], cols = [0, 5, 10, 15];
      const cells = F.sensitivity(rows, cols, (vis, cut) => F.clinicModel(clinicParams({ ...v, visits: vis, cut })).ebitda);
      return {
        rows: [['Tổng lượt khám', r.visits, 'n0'], ['Công suất sử dụng', r.utilization, 'pct'], ['Doanh thu', r.revenue, 'n1'], ['Chi phí biến đổi', r.variable, 'n1'], ['Chi phí cố định', r.fixed, 'n1'], ['EBITDA', r.ebitda, 'n1'], ['Biên EBITDA', r.margin, 'pct'], ['Lượt khám hoà vốn', r.breakevenVisits, 'n0']],
        warn: r.ebitda < 0 ? '⚠️ EBITDA âm — chi phí cố định không được bù đắp.' : r.utilization > 0.95 ? '⚠️ Gần hết công suất — cần thêm bác sĩ/phòng khám để tăng trưởng.' : '',
        sens: { title: 'EBITDA (tỷ) theo lượt khám/phòng khám × mức cắt giá bảo hiểm', rowLabel: 'Lượt (nghìn)', colLabel: 'Cắt giá', rows, cols: cols.map((c) => c + '%'), cells, f: 'n1', base: [near(rows, v.visits), near(cols, v.cut)] },
        checks: [['Doanh thu − chi phí = EBITDA', Math.abs(r.revenue - r.variable - r.fixed - r.ebitda) < 1e-9], ['Lượt khám ≤ công suất', r.utilization <= 1 + 1e-9]],
        out: r,
      };
    },
  },
  energy: {
    title: 'Renewable Project Finance — Solar 50 MW', sector: 'energy',
    note: 'Simulation: capex 45 triệu USD, opex 1 triệu (+2%/năm), suy giảm tấm pin 0,5%/năm, PPA 20 năm, nợ trả dần đều 15 năm. Đơn vị: triệu USD.',
    inputs: [
      { k: 'cf', label: 'Capacity factor (%)', min: 14, max: 24, step: 0.5, val: 18, f: 'n1' },
      { k: 'ppa', label: 'Giá PPA (USD/MWh)', min: 50, max: 90, step: 1, val: 70, f: 'n0' },
      { k: 'debt', label: 'Tỷ lệ nợ (%)', min: 0, max: 85, step: 5, val: 70, f: 'n0' },
      { k: 'rate', label: 'Lãi suất nợ (%)', min: 3, max: 10, step: 0.25, val: 6, f: 'n2' },
    ],
    compute: (v) => {
      const r = F.solarProject(solarParams(v));
      const rows = [60, 65, 70, 75, 80], cols = [16, 17, 18, 19, 20];
      const cells = F.sensitivity(rows, cols, (ppa, cf) => F.solarProject(solarParams({ ...v, ppa, cf })).equityIrr);
      return {
        rows: [['Sản lượng năm 1 (MWh)', r.rows[0].mwh, 'n0'], ['Doanh thu năm 1', r.rows[0].revenue, 'n2'], ['CFADS năm 1', r.rows[0].cfads, 'n2'], ['Nợ vay', r.debt, 'n1'], ['Trả nợ hằng năm', r.ds, 'n2'], ['DSCR tối thiểu', r.minDscr, 'x'], ['DSCR trung bình', r.avgDscr, 'x'], ['Project IRR', r.projectIrr, 'pct'], ['Equity IRR', r.equityIrr, 'pct']],
        warn: r.minDscr < 1.2 ? '⚠️ DSCR tối thiểu dưới 1,2x — ngân hàng sẽ yêu cầu giảm nợ.' : r.minDscr < 1.3 ? 'DSCR dưới 1,3x — sát ngưỡng covenant thông thường cho dự án có PPA.' : '',
        table: { head: ['Năm', 'Doanh thu', 'CFADS', 'Trả nợ', 'DSCR', 'Dư nợ'], rows: r.rows.filter((x) => [1, 5, 10, 15, 16, 20].includes(x.year)).map((x) => [x.year, x.revenue, x.cfads, x.service, Number.isFinite(x.dscr) ? x.dscr : 0, x.balance]) },
        sens: { title: 'Equity IRR theo giá PPA × capacity factor', rowLabel: 'PPA', colLabel: 'CF', rows, cols: cols.map((c) => c + '%'), cells, f: 'pct', base: [near(rows, v.ppa), near(cols, v.cf)] },
        checks: [['Nợ được trả hết trong kỳ hạn', r.checkDebtRepaid], ['Nợ + vốn chủ = capex', Math.abs(r.debt + r.equity - 45) < 1e-9]],
        out: r,
      };
    },
  },
  realestate: {
    title: 'Real Estate Investment Model — Toà nhà Lavender', sector: 'realestate',
    note: 'Simulation: giá mua 120 tỷ (+2% chi phí giao dịch), tiền thuê tối đa 12 tỷ, opex 3 tỷ, vay chỉ trả lãi, nắm giữ 5 năm. Đơn vị: tỷ đồng.',
    inputs: [
      { k: 'vac', label: 'Tỷ lệ trống (%)', min: 0, max: 30, step: 1, val: 10, f: 'n0' },
      { k: 'growth', label: 'Tăng trưởng NOI/năm (%)', min: -3, max: 6, step: 0.5, val: 3, f: 'n1' },
      { k: 'ltv', label: 'LTV (%)', min: 0, max: 75, step: 5, val: 60, f: 'n0' },
      { k: 'rate', label: 'Lãi suất vay (%)', min: 3, max: 10, step: 0.25, val: 6, f: 'n2' },
      { k: 'exitCap', label: 'Exit cap rate (%)', min: 5, max: 9, step: 0.25, val: 6.5, f: 'n2' },
    ],
    compute: (v) => {
      const r = F.realEstateInvestment(reParams(v));
      const rows = [5.5, 6, 6.5, 7, 7.5, 8], cols = [0, 1.5, 3, 4.5];
      const cells = F.sensitivity(rows, cols, (exitCap, growth) => F.realEstateInvestment(reParams({ ...v, exitCap, growth })).irr);
      return {
        rows: [['NOI năm 1', r.rows[0].noi, 'n2'], ['Going-in cap rate', r.goingInCap, 'pct'], ['Khoản vay', r.loan, 'n1'], ['Vốn chủ', r.equity, 'n1'], ['DSCR năm 1', r.rows[0].dscr, 'x'], ['Cash-on-cash năm 1', r.cashOnCash, 'pct'], ['Giá trị exit', r.exitValue, 'n1'], ['Equity IRR', r.irr, 'pct'], ['Equity MOIC', r.moic, 'x']],
        warn: r.rows[0].dscr < 1.25 ? '⚠️ DSCR dưới 1,25x — rủi ro vi phạm điều kiện vay.' : r.exitValue < r.loan ? '⚠️ Giá trị exit thấp hơn khoản vay — vốn chủ bị xoá sạch.' : '',
        table: { head: ['Năm', 'NOI', 'Lãi vay', 'Dòng tiền VCSH', 'DSCR'], rows: r.rows.map((x) => [x.year, x.noi, x.interest, x.cf, Number.isFinite(x.dscr) ? x.dscr : 0]) },
        sens: { title: 'Equity IRR theo exit cap rate × tăng trưởng NOI', rowLabel: 'Exit cap', colLabel: 'Tăng trưởng', rows: rows, cols: cols.map((c) => c + '%'), cells, f: 'pct', base: [near(rows, v.exitCap), near(cols, v.growth)] },
        checks: [['Nợ + vốn chủ = giá mua + chi phí', r.checkSources]],
        out: r,
      };
    },
  },
  saas: {
    title: 'SaaS Operating Model — CloudSổ', sector: 'saas',
    note: 'Simulation: ARR đầu kỳ 50 triệu USD, gross margin 80%, R&D 20% và G&A 12% doanh thu. Doanh thu = ARR bình quân. Đơn vị: triệu USD.',
    inputs: [
      { k: 'nrr', label: 'Net Revenue Retention (%)', min: 85, max: 135, step: 1, val: 110, f: 'n0' },
      { k: 'newArr', label: 'ARR mới từ khách mới/năm', min: 0, max: 30, step: 1, val: 10, f: 'n0' },
      { k: 'magic', label: 'Magic number (ARR mới / chi S&M)', min: 0.3, max: 1.5, step: 0.05, val: 0.5, f: 'n2' },
    ],
    compute: (v) => {
      const r = F.saasModel(saasParams(v));
      const y1 = r.rows[0], y5 = r.rows[4];
      const rows = [95, 100, 105, 110, 115, 120], cols = [0.3, 0.5, 0.75, 1.0];
      const cells = F.sensitivity(rows, cols, (nrr, magic) => F.saasModel(saasParams({ ...v, nrr, magic })).rows[0].r40);
      return {
        rows: [['ARR năm 1', y1.arr, 'n1'], ['Tăng trưởng ARR năm 1', y1.growth, 'pct'], ['FCF margin năm 1', y1.fcfMargin, 'pct'], ['Rule of 40 năm 1 (điểm)', y1.r40, 'n1'], ['ARR năm 5', y5.arr, 'n1'], ['CAGR ARR 5 năm', r.cagr, 'pct'], ['FCF margin năm 5', y5.fcfMargin, 'pct']],
        warn: y1.r40 < 40 ? 'Rule of 40 dưới 40 — cần tăng NRR hoặc cải thiện hiệu quả S&M.' : '',
        table: { head: ['Năm', 'ARR đầu', 'Mở rộng ròng', 'ARR mới', 'ARR cuối', 'FCF'], rows: r.rows.map((x) => [x.year, x.open, x.expansionNet, x.newArr, x.arr, x.fcf]) },
        sens: { title: 'Rule of 40 (năm 1) theo NRR × magic number', rowLabel: 'NRR', colLabel: 'Magic #', rows: rows.map((x) => x + '%'), cols, cells, f: 'n1', base: [near(rows, v.nrr), near(cols, v.magic)] },
        checks: [['ARR roll-forward khớp mọi năm', r.rows.every((x) => x.check)]],
        out: r,
      };
    },
  },
  ai: {
    title: 'AI Unit Economics — Trợ Lý Xanh', sector: 'ai',
    note: 'Simulation: chi phí khác (hosting, hỗ trợ) 10% doanh thu. Đơn vị: USD.',
    inputs: [
      { k: 'users', label: 'Người dùng trả phí (nghìn)', min: 2, max: 50, step: 1, val: 10, f: 'n0' },
      { k: 'price', label: 'Giá/người dùng/năm (USD)', min: 300, max: 2000, step: 50, val: 1000, f: 'n0' },
      { k: 'queries', label: 'Truy vấn/người dùng/năm', min: 500, max: 6000, step: 100, val: 2000, f: 'n0' },
      { k: 'cost', label: 'Chi phí inference/truy vấn (US cent)', min: 2, max: 40, step: 1, val: 20, f: 'n0' },
    ],
    compute: (v) => {
      const r = F.aiEconomics(aiParams(v));
      const rows = [5, 10, 20, 30, 40], cols = [1000, 2000, 3000, 4000];
      const cells = F.sensitivity(rows, cols, (cost, queries) => F.aiEconomics(aiParams({ ...v, cost, queries })).gm);
      return {
        rows: [['Doanh thu', r.revenue, 'n0'], ['Chi phí inference', r.inference, 'n0'], ['Chi phí khác', r.other, 'n0'], ['Lợi nhuận gộp', r.gp, 'n0'], ['Gross margin', r.gm, 'pct'], ['Chi phí inference/người dùng', r.costPerUser, 'n2'], ['Số truy vấn hoà vốn/người dùng', r.breakevenQueries, 'n0']],
        warn: r.gm < 0 ? '⚠️ Lỗ trên mỗi người dùng — người dùng nhiệt tình nhất đang làm công ty mất tiền.' : r.gm < 0.6 ? 'Gross margin dưới 60% — bội số định giá nên thấp hơn SaaS truyền thống.' : '',
        sens: { title: 'Gross margin theo chi phí/truy vấn × số truy vấn/người dùng', rowLabel: 'Cent/truy vấn', colLabel: 'Truy vấn', rows, cols, cells, f: 'pct', base: [near(rows, v.cost), near(cols, v.queries)] },
        checks: [['Doanh thu − COGS = lợi nhuận gộp', Math.abs(r.revenue - r.inference - r.other - r.gp) < 1e-6]],
        out: r,
      };
    },
  },
});

export const engagementParams = (v) => {
  const h = v.weeks * 50;
  return { realization: v.realization / 100, team: [
    { role: 'Partner', hours: h * v.partnerPct / 100, rate: 600, cost: 250, partner: true },
    { role: 'Manager', hours: h, rate: 300, cost: 110 },
    { role: 'Consultants', hours: h * v.consultants, rate: 200, cost: 70 },
  ] };
};
MODELS.engagement = {
  title: 'Engagement Economics — Dự án tư vấn',
  note: 'Simulation: 50 giờ/tuần. Bill rate / cost rate (USD/giờ): Partner 600/250, Manager 300/110, Consultant 200/70.',
  inputs: [
    { k: 'consultants', label: 'Số consultants', min: 1, max: 6, step: 1, val: 3, f: 'n0' },
    { k: 'weeks', label: 'Số tuần', min: 4, max: 20, step: 1, val: 10, f: 'n0' },
    { k: 'realization', label: 'Realization (%)', min: 60, max: 100, step: 1, val: 90, f: 'n0' },
    { k: 'partnerPct', label: 'Thời gian Partner (%)', min: 5, max: 30, step: 5, val: 10, f: 'n0' },
  ],
  compute: (v) => {
    const r = F.engagementEconomics(engagementParams(v));
    const rows = [70, 75, 80, 85, 90, 95, 100], cols = [2, 3, 4, 5];
    const cells = F.sensitivity(rows, cols, (re, c) => F.engagementEconomics(engagementParams({ ...v, realization: re, consultants: c })).margin);
    return {
      rows: [['Phí tiêu chuẩn', r.standard, 'n0'], ['Phí thực thu', r.fees, 'n0'], ['Chi phí delivery', r.cost, 'n0'], ['Contribution margin', r.margin, 'pct'], ['Leverage (giờ staff / giờ partner)', r.leverage, 'n1'], ['Bill rate hiệu dụng (USD/h)', r.effectiveRate, 'n0']],
      warn: r.margin < 0.5 ? '⚠️ Margin dưới 50% — dự án khó bù chi phí chung của hãng.' : '',
      sens: { title: 'Margin theo realization × số consultants', rowLabel: 'Realization', colLabel: 'Consultants', rows: rows.map((x) => x + '%'), cols, cells, f: 'pct', base: [near(rows, v.realization), near(cols, v.consultants)] },
      checks: [['Phí thực thu = phí tiêu chuẩn × realization', Math.abs(r.fees - r.standard * v.realization / 100) < 1e-6]],
      out: r,
    };
  },
};

export const PORT_BASE = { r1: 0.1, r2: 0.04, s2: 0.06, rf: 0.03 };
export const portParams = (v) => ({ ...PORT_BASE, w: v.w / 100, s1: v.eqVol / 100, rho: v.rho });
MODELS.portfolio = {
  title: 'Portfolio Construction — Cổ phiếu & Trái phiếu',
  note: 'Simulation: cổ phiếu kỳ vọng 10%/năm; trái phiếu 4%/năm, biến động 6%; lãi suất phi rủi ro 3%.',
  inputs: [
    { k: 'w', label: 'Tỷ trọng cổ phiếu (%)', min: 0, max: 100, step: 5, val: 60, f: 'n0' },
    { k: 'rho', label: 'Tương quan cổ phiếu–trái phiếu (ρ)', min: -0.5, max: 1, step: 0.1, val: 0.2, f: 'n1' },
    { k: 'eqVol', label: 'Biến động cổ phiếu (%)', min: 10, max: 30, step: 1, val: 18, f: 'n0' },
  ],
  compute: (v) => {
    const p = F.portfolio2(portParams(v));
    const rows = [20, 40, 60, 80, 100], cols = [-0.3, 0, 0.2, 0.5, 1];
    const cells = F.sensitivity(rows, cols, (w, rho) => F.portfolio2(portParams({ ...v, w, rho })).vol);
    return {
      rows: [['Lợi nhuận kỳ vọng', p.ret, 'pct'], ['Biến động (volatility)', p.vol, 'pct'], ['Sharpe ratio', p.sharpe, 'n2'], ['Lợi nhuận vượt phi rủi ro', p.ret - PORT_BASE.rf, 'pct']],
      warn: p.vol > 0.1 ? '⚠️ Biến động vượt giới hạn rủi ro 10% của quỹ hưu trí khách hàng.' : '',
      sens: { title: 'Biến động danh mục theo tỷ trọng cổ phiếu × tương quan', rowLabel: 'Cổ phiếu', colLabel: 'ρ', rows: rows.map((x) => x + '%'), cols, cells, f: 'pct', base: [near(rows, v.w), near(cols, v.rho)] },
      checks: [['Biến động ≤ trung bình có trọng số (lợi ích đa dạng hoá)', p.vol <= (v.w / 100) * (v.eqVol / 100) + (1 - v.w / 100) * PORT_BASE.s2 + 1e-12]],
      out: p,
    };
  },
};

export const SECTOR_MODELS = ['healthcare', 'energy', 'realestate', 'saas', 'ai'];
export const CORE_MODELS = ['dcf', 'lbo', 'round', 'ad', 'consult', 'engagement', 'portfolio', 'lemonade', 'compound'];

export function lboParams(v) {
  return { ebitda: 50, entryMultiple: v.entry, debtMultiple: v.debt, interestRate: v.rate / 100, ebitdaGrowth: 0.06, daPct: 0.15, capexPct: 0.2, taxRate: 0.25, years: 5, exitMultiple: v.exit, feesPct: 0.02 };
}

export const WORKBENCH_BY_LOCATION = { ibank: ['dcf', 'lbo', 'ad'], office_pe: ['lbo', 'dcf'], office_vc: ['round', 'dcf'], office_cd: ['ad', 'dcf', 'consult'], office_cs: ['engagement', 'consult', 'dcf'], office_im: ['portfolio', 'dcf'], academy: ['healthcare', 'energy', 'realestate', 'saas', 'ai', 'consult'] };

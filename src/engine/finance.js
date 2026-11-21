// @ts-check
/**
 * Financial Calculation Engine — M&A Dynasty
 * Pure functions, no side effects. All rates are decimals (0.10 = 10%).
 * Timing convention: cash flow index t is received at END of year t (t = 0 is today),
 * unless a function says otherwise. Units are whatever the caller passes (consistent units required).
 */

export const round = (x, d = 2) => Math.round(x * 10 ** d) / 10 ** d;
export const sum = (a) => a.reduce((s, x) => s + x, 0);

/** Net present value; cfs[t] occurs at end of year t (cfs[0] undiscounted). */
export function npv(rate, cfs) {
  return cfs.reduce((s, cf, t) => s + cf / Math.pow(1 + rate, t), 0);
}

/** IRR by bisection. Returns NaN when no sign change exists in the search range. */
export function irr(cfs, lo = -0.99, hi = 10) {
  // If the endpoints do not bracket a root (e.g. small negative flows late in a fund), scan a grid for the first sign change.
  if (npv(lo, cfs) * npv(hi, cfs) > 0) {
    let prev = -0.9, fp = npv(prev, cfs), found = false;
    for (let r = -0.89; r <= hi; r += 0.01) { const fr = npv(r, cfs); if (fp * fr <= 0) { lo = prev; hi = r; found = true; break; } prev = r; fp = fr; }
    if (!found) return NaN;
  }
  let flo = npv(lo, cfs);
  const fhi = npv(hi, cfs);
  if (flo * fhi > 0) return NaN;
  for (let i = 0; i < 300; i++) {
    const mid = (lo + hi) / 2;
    const f = npv(mid, cfs);
    if (Math.abs(f) < 1e-12) return mid;
    if (flo * f < 0) hi = mid; else { lo = mid; flo = f; }
  }
  return (lo + hi) / 2;
}

export const fv = (pv0, r, n) => pv0 * Math.pow(1 + r, n);
export const pv = (fv0, r, n) => fv0 / Math.pow(1 + r, n);

/** CAPM cost of equity. */
export const capm = ({ rf, beta, erp }) => rf + beta * erp;

/** WACC with after-tax cost of debt. equity/debt are MARKET values. */
export function wacc({ equity, debt, ke, kd, tax }) {
  const v = equity + debt;
  return (equity / v) * ke + (debt / v) * kd * (1 - tax);
}

/** Gordon growth terminal value at end of final year, based on next year's cash flow. */
export function gordonTV(lastCf, r, g) {
  if (r <= g) throw new Error('Discount rate must exceed terminal growth');
  return (lastCf * (1 + g)) / (r - g);
}

/**
 * Unlevered DCF (FCFF discounted at WACC → Enterprise Value).
 * fcff[i] is the cash flow of forecast year i+1 (end-year convention).
 * Equity Value = EV − Net Debt.
 */
export function dcf({ fcff, wacc: r, g, netDebt = 0, shares = 1 }) {
  const pvs = fcff.map((cf, i) => cf / Math.pow(1 + r, i + 1));
  const sumPv = sum(pvs);
  const tv = gordonTV(fcff[fcff.length - 1], r, g);
  const pvTv = tv / Math.pow(1 + r, fcff.length);
  const ev = sumPv + pvTv;
  const equity = ev - netDebt;
  return { pvs, sumPv, tv, pvTv, ev, equity, perShare: equity / shares, tvShare: pvTv / ev };
}

/** Simple income statement waterfall. */
export function incomeStatement({ revenue, cogs, opex, da, interest, taxRate }) {
  const grossProfit = revenue - cogs;
  const ebitda = grossProfit - opex;
  const ebit = ebitda - da;
  const ebt = ebit - interest;
  const tax = Math.max(0, ebt) * taxRate;
  const netIncome = ebt - tax;
  return { revenue, grossProfit, ebitda, ebit, ebt, tax, netIncome, grossMargin: grossProfit / revenue, ebitdaMargin: ebitda / revenue };
}

/** Free Cash Flow to Firm. */
export const fcffFrom = ({ ebit, tax, da, capex, dNwc }) => ebit * (1 - tax) + da - capex - dNwc;

export function median(a) {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}
export const mean = (a) => sum(a) / a.length;

/** Trading comparables: EV / metric multiples and implied valuation. */
export function comps(peers, targetMetric, netDebt = 0, key = 'ebitda') {
  const multiples = peers.map((p) => p.ev / p[key]);
  const med = median(multiples);
  const avg = mean(multiples);
  const impliedEv = med * targetMetric;
  return { multiples, median: med, mean: avg, low: Math.min(...multiples), high: Math.max(...multiples), impliedEv, impliedEquity: impliedEv - netDebt };
}

/**
 * Leveraged Buyout model (annual, 100% cash sweep on a single term loan).
 * Sources = Debt + Sponsor Equity; Uses = Purchase EV + Fees.
 * Interest on OPENING debt balance (avoids circularity — standard simplification).
 * Tax = taxRate × max(0, EBITDA − D&A − Interest).
 * FCF available for debt = EBITDA − Interest − Tax − Capex − ΔNWC.
 * Exit Equity = Exit EV − Debt + Cash. No interim dividends, so IRR uses [−equity, 0, …, exitEquity].
 */
export function lbo(p) {
  const { ebitda, entryMultiple, debtMultiple, interestRate, ebitdaGrowth, daPct, capexPct, nwcPct = 0, taxRate, years, exitMultiple, feesPct = 0 } = p;
  const entryEv = ebitda * entryMultiple;
  const fees = entryEv * feesPct;
  const debt0 = ebitda * debtMultiple;
  const equity0 = entryEv + fees - debt0;
  const rows = [];
  let e = ebitda, debt = debt0, cash = 0;
  for (let y = 1; y <= years; y++) {
    const prevE = e;
    e = prevE * (1 + ebitdaGrowth);
    const da = e * daPct;
    const interest = debt * interestRate;
    const ebt = e - da - interest;
    const tax = Math.max(0, ebt) * taxRate;
    const capex = e * capexPct;
    const dNwc = (e - prevE) * nwcPct;
    const fcf = e - interest - tax - capex - dNwc;
    const repay = Math.min(debt, Math.max(0, fcf));
    const open = debt;
    debt = debt - repay;
    cash += fcf - repay;
    rows.push({ year: y, ebitda: e, da, interest, tax, capex, dNwc, fcf, open, repay, close: debt, cash, leverage: debt / e, coverage: e / interest || Infinity });
  }
  const exitEv = e * exitMultiple;
  const exitEquity = exitEv - debt + cash;
  const moic = exitEquity / equity0;
  const cfs = [-equity0, ...Array(years - 1).fill(0), exitEquity];
  return {
    entryEv, fees, debt0, equity0, rows, exitEv, exitEquity, moic, irr: irr(cfs),
    sources: { debt: debt0, equity: equity0, total: debt0 + equity0 },
    uses: { purchase: entryEv, fees, total: entryEv + fees },
  };
}

/**
 * Priced equity round with optional option-pool top-up included in the PRE-money ("pool shuffle").
 * poolPostPct = target unallocated pool as % of post-money fully diluted shares.
 */
export function pricedRound({ preMoney, investment, sharesPre, poolPostPct = 0, existingPool = 0 }) {
  const postMoney = preMoney + investment;
  const invPct = investment / postMoney;
  // existing pool counts toward target; we top up so that total pool = poolPostPct of post.
  // total shares T: (existingPool + newPool) = poolPostPct*T, newInv = invPct*T, sharesPre + newPool + newInv = T
  const T = (sharesPre - existingPool) / (1 - poolPostPct - invPct);
  const newPool = Math.max(0, poolPostPct * T - existingPool);
  const totalShares = sharesPre + newPool + invPct * T;
  const newInvShares = invPct * totalShares;
  const price = investment / newInvShares;
  return { postMoney, invPct, newPool, newInvShares, totalShares, price, effectivePreMoney: price * sharesPre };
}

/**
 * Liquidation waterfall — non-participating preferred, seniority stacked (higher seniority paid first,
 * pari passu within same seniority). Each series converts to common if that pays more (best-response iteration).
 * series: [{ name, invested, shares, multiple=1, seniority=0 }]
 */
export function waterfall(exit, series, commonShares) {
  const conv = series.map(() => false);
  const pay = (convSet) => {
    let left = exit;
    const out = series.map(() => 0);
    const levels = [...new Set(series.map((s) => s.seniority || 0))].sort((a, b) => b - a);
    for (const lv of levels) {
      const idx = series.map((s, i) => i).filter((i) => (series[i].seniority || 0) === lv && !convSet[i]);
      const claim = sum(idx.map((i) => series[i].invested * (series[i].multiple ?? 1)));
      const paid = Math.min(left, claim);
      idx.forEach((i) => { out[i] = claim ? paid * (series[i].invested * (series[i].multiple ?? 1)) / claim : 0; });
      left -= paid;
    }
    const convShares = sum(series.map((s, i) => (convSet[i] ? s.shares : 0)));
    const pool = commonShares + convShares;
    series.forEach((s, i) => { if (convSet[i]) out[i] = (left * s.shares) / pool; });
    return { out, common: (left * commonShares) / pool };
  };
  for (let it = 0; it < 50; it++) {
    let changed = false;
    for (let i = 0; i < series.length; i++) {
      const a = [...conv]; a[i] = false;
      const b = [...conv]; b[i] = true;
      const want = pay(b).out[i] > pay(a).out[i] + 1e-9;
      if (want !== conv[i]) { conv[i] = want; changed = true; }
    }
    if (!changed) break;
  }
  const r = pay(conv);
  return { perSeries: r.out, common: r.common, converted: conv };
}

/** Accretion / dilution of acquirer EPS. */
export function accretionDilution({ acqNI, acqShares, acqPrice, tgtNI, purchasePrice, pctStock, kd, tax, synergies = 0 }) {
  const newShares = (purchasePrice * pctStock) / acqPrice;
  const newDebt = purchasePrice * (1 - pctStock);
  const afterTaxInterest = newDebt * kd * (1 - tax);
  const proNI = acqNI + tgtNI + synergies * (1 - tax) - afterTaxInterest;
  const baseEps = acqNI / acqShares;
  const proEps = proNI / (acqShares + newShares);
  const accretion = proEps / baseEps - 1;
  // pre-tax synergies needed so that proEps = baseEps
  const breakevenSyn = Math.max(0, (baseEps * (acqShares + newShares) - (acqNI + tgtNI - afterTaxInterest)) / (1 - tax));
  return { newShares, newDebt, afterTaxInterest, proNI, baseEps, proEps, accretion, breakevenSyn };
}

/** Consulting firm capacity-driven operating model (annual). */
export function consultingFirm({ consultants, utilization, hours = 1800, billRate, realization, costPerConsultant, sgaPct, attrition, replaceCost }) {
  const billableHours = consultants * hours * utilization;
  const revenue = billableHours * billRate * realization;
  const deliveryCost = consultants * costPerConsultant;
  const grossProfit = revenue - deliveryCost;
  const attritionCost = consultants * attrition * replaceCost;
  const sga = revenue * sgaPct;
  const ebitda = grossProfit - sga - attritionCost;
  return { billableHours, revenue, deliveryCost, grossProfit, grossMargin: grossProfit / revenue, attritionCost, sga, ebitda, ebitdaMargin: ebitda / revenue, revPerConsultant: revenue / consultants };
}

/** Linear demand lemonade stand: q = max(0, a − b·p). */
export function lemonade({ price, unitCost, fixedCost, a, b }) {
  const q = Math.max(0, a - b * price);
  const revenue = price * q;
  const profit = (price - unitCost) * q - fixedCost;
  return { q, revenue, profit, margin: revenue ? profit / revenue : 0 };
}

/** Small business valuation helpers. */
export const payback = (price, annualProfit) => price / annualProfit;
export const valueAtMultiple = (annualProfit, multiple) => annualProfit * multiple;

/** Credit statistics. */
export const leverage = (debt, ebitda) => debt / ebitda;
export const coverage = (ebitda, interest) => ebitda / interest;

/** SaaS / venture metrics. */
export const nrr = ({ start, expansion, contraction, churn }) => (start + expansion - contraction - churn) / start;
export const grossRetention = ({ start, contraction, churn }) => (start - contraction - churn) / start;
/** Months to recover CAC from gross profit: CAC / (annual revenue per customer × GM / 12). */
export const cacPayback = ({ cac, arrPerCustomer, grossMargin }) => cac / ((arrPerCustomer * grossMargin) / 12);
export const burnMultiple = (netBurn, netNewArr) => netBurn / netNewArr;
/** Pro rata participation in a new round and dilution if the investor does not participate. */
export function proRata({ ownership, preMoney, raise }) {
  const post = preMoney + raise;
  return { post, amount: ownership * raise, dilutedOwnership: (ownership * preMoney) / post };
}

/** Weighted scoring (weights should sum to 1). */
export const weightedScore = (scores, weights) => scores.reduce((s, x, i) => s + x * weights[i], 0);

/** Divestiture: net cash proceeds after capital-gains tax. */
export const afterTaxProceeds = ({ price, taxBasis, taxRate }) => price - Math.max(0, price - taxBasis) * taxRate;

/** Sector KPIs. */
export const energyMWh = (mw, capacityFactor) => mw * 8760 * capacityFactor;          // annual generation
export const dscr = (cfads, debtService) => cfads / debtService;                      // debt service coverage
export const noi = ({ grossRent, vacancy, opex }) => grossRent * (1 - vacancy) - opex; // net operating income
export const capValue = (noi0, capRate) => noi0 / capRate;                            // direct capitalization
export const ruleOf40 = (growthPct, fcfMarginPct) => growthPct + fcfMarginPct;
export const customerLtv = ({ arpa, grossMargin, churn }) => (arpa * grossMargin) / churn; // simple steady-state LTV
/** Level annuity project: IRR of −capex followed by n equal annual cash flows. */
export const annuityIrr = (capex, cf, n) => irr([-capex, ...Array(n).fill(cf)]);

/** Level payment on an amortizing loan (annuity). */
export function pmt(principal, rate, n) {
  if (n <= 0) return 0;
  if (rate === 0) return principal / n;
  return (principal * rate) / (1 - Math.pow(1 + rate, -n));
}

/**
 * Renewable project finance (annual). Generation degrades yearly; PPA price escalates; opex inflates.
 * Debt = debtPct × capex, amortizing annuity over `tenor` years (≤ project life). CFADS ≈ revenue − opex (pre-tax simplification).
 */
export function solarProject(p) {
  const { mw, cf, degradation = 0, ppa, ppaEscalation = 0, opex, opexInflation = 0, capex, years, debtPct = 0, rate = 0, tenor = years } = p;
  const debt = capex * debtPct, equity = capex - debt;
  const ds = pmt(debt, rate, tenor);
  const rows = [];
  let bal = debt, principalPaid = 0;
  for (let y = 1; y <= years; y++) {
    const mwh = energyMWh(mw, cf) * Math.pow(1 - degradation, y - 1);
    const price = ppa * Math.pow(1 + ppaEscalation, y - 1);
    const revenue = (mwh * price) / 1e6;
    const op = opex * Math.pow(1 + opexInflation, y - 1);
    const cfads = revenue - op;
    const service = y <= tenor ? ds : 0;
    const interest = bal * rate, principal = service - interest;
    bal -= principal; principalPaid += principal;
    rows.push({ year: y, mwh, revenue, opex: op, cfads, service, dscr: service ? cfads / service : Infinity, equityCf: cfads - service, balance: bal });
  }
  const serviced = rows.filter((r) => r.service > 0);
  return {
    debt, equity, ds, rows,
    projectIrr: irr([-capex, ...rows.map((r) => r.cfads)]),
    equityIrr: irr([-equity, ...rows.map((r) => r.equityCf)]),
    minDscr: serviced.length ? Math.min(...serviced.map((r) => r.dscr)) : Infinity,
    avgDscr: serviced.length ? sum(serviced.map((r) => r.dscr)) / serviced.length : Infinity,
    checkDebtRepaid: Math.abs(principalPaid - debt) < 1e-6,
  };
}

/**
 * Real-estate investment (annual, interest-only loan). NOI grows with `growth` (rent and opex both).
 * Exit value = forward NOI (year n+1) / exit cap rate. Equity = price × (1 + costPct) − loan.
 */
export function realEstateInvestment(p) {
  const { price, grossRent, vacancy, opex, growth = 0, ltv = 0, rate = 0, years, exitCap, costPct = 0 } = p;
  const loan = price * ltv, equity = price * (1 + costPct) - loan;
  const interest = loan * rate;
  const noiAt = (y) => noi({ grossRent: grossRent * Math.pow(1 + growth, y - 1), vacancy, opex: opex * Math.pow(1 + growth, y - 1) });
  const rows = [];
  for (let y = 1; y <= years; y++) { const n = noiAt(y); rows.push({ year: y, noi: n, interest, cf: n - interest, dscr: interest ? n / interest : Infinity }); }
  const exitValue = noiAt(years + 1) / exitCap;
  const exitEquity = exitValue - loan;
  const cfs = [-equity, ...rows.map((r, i) => r.cf + (i === years - 1 ? exitEquity : 0))];
  const totalBack = sum(rows.map((r) => r.cf)) + exitEquity;
  return { loan, equity, rows, exitValue, exitEquity, irr: irr(cfs), moic: totalBack / equity, cashOnCash: rows[0].cf / equity, goingInCap: rows[0].noi / price, checkSources: Math.abs(loan + equity - price * (1 + costPct)) < 1e-9 };
}

/**
 * SaaS operating model: ARR roll-forward ARR_t = ARR_{t−1} × NRR + new ARR.
 * Revenue = average ARR; S&M = new ARR / magic number; R&D and G&A as % of revenue. FCF ≈ GP − opex (simplified).
 */
export function saasModel(p) {
  const { startArr, nrr: n, newArr, grossMargin, magicNumber, rndPct, gaPct, years } = p;
  const rows = [];
  let prev = startArr;
  for (let y = 1; y <= years; y++) {
    const expansionNet = prev * (n - 1);
    const arr = prev + expansionNet + newArr;
    const revenue = (prev + arr) / 2;
    const gp = revenue * grossMargin, sm = newArr / magicNumber, rnd = revenue * rndPct, ga = revenue * gaPct;
    const fcf = gp - sm - rnd - ga;
    const growth = arr / prev - 1;
    rows.push({ year: y, open: prev, expansionNet, newArr, arr, revenue, fcf, fcfMargin: fcf / revenue, growth, r40: (growth + fcf / revenue) * 100, check: Math.abs(prev + expansionNet + newArr - arr) < 1e-9 });
    prev = arr;
  }
  return { rows, endArr: prev, cagr: Math.pow(prev / startArr, 1 / years) - 1 };
}

/** Clinic-chain operating model with fixed costs per clinic and variable cost per visit. Revenue in tỷ đồng when revPerVisit is in triệu. */
export function clinicModel(p) {
  const { clinics, visitsPerClinic, capacityPerClinic, revPerVisit, insurancePct, reimbursementCut = 0, varCostPerVisit, fixedPerClinic, doctorLossPct = 0 } = p;
  const visits = clinics * visitsPerClinic * (1 - doctorLossPct);
  const price = revPerVisit * (1 - insurancePct * reimbursementCut);
  const revenue = (visits * price) / 1000;
  const variable = (visits * varCostPerVisit) / 1000;
  const fixed = clinics * fixedPerClinic;
  const ebitda = revenue - variable - fixed;
  return { visits, revenue, variable, fixed, ebitda, margin: ebitda / revenue, utilization: visits / (clinics * capacityPerClinic), breakevenVisits: (fixed * 1000) / (price - varCostPerVisit) };
}

/** AI application unit economics (annual, USD). */
export function aiEconomics(p) {
  const { users, pricePerUser, queriesPerUser, costPerQuery, otherCogsPct } = p;
  const revenue = users * pricePerUser;
  const inference = users * queriesPerUser * costPerQuery;
  const other = revenue * otherCogsPct;
  const gp = revenue - inference - other;
  return { revenue, inference, other, gp, gm: gp / revenue, costPerUser: queriesPerUser * costPerQuery, breakevenQueries: (pricePerUser * (1 - otherCogsPct)) / costPerQuery };
}

/**
 * Consulting engagement economics. team = [{ role, hours, rate (bill rate), cost (cost rate per hour), partner? }].
 * Fees = standard fees × realization. Contribution margin = (fees − delivery cost) / fees. Leverage = non-partner FTEs per partner FTE.
 */
export function engagementEconomics({ team, realization = 1 }) {
  const standard = sum(team.map((m) => m.hours * m.rate));
  const fees = standard * realization;
  const cost = sum(team.map((m) => m.hours * m.cost));
  const partnerHours = sum(team.filter((m) => m.partner).map((m) => m.hours));
  const otherHours = sum(team.filter((m) => !m.partner).map((m) => m.hours));
  return { standard, fees, cost, margin: (fees - cost) / fees, leverage: partnerHours ? otherHours / partnerHours : Infinity, effectiveRate: fees / sum(team.map((m) => m.hours)) };
}

/** Top-down market sizing: population × penetration × frequency × price. */
export const marketSize = ({ population, penetration, unitsPerYear, price }) => population * penetration * unitsPerYear * price;

/** Two-asset portfolio: expected return, volatility (with correlation) and Sharpe ratio. */
export function portfolio2({ w, r1, r2, s1, s2, rho, rf = 0 }) {
  const ret = w * r1 + (1 - w) * r2;
  const variance = w * w * s1 * s1 + (1 - w) * (1 - w) * s2 * s2 + 2 * w * (1 - w) * rho * s1 * s2;
  const vol = Math.sqrt(variance);
  return { ret, vol, sharpe: vol ? (ret - rf) / vol : Infinity };
}

/** Bond price change approximation: −Duration × Δy + ½ × Convexity × Δy². */
export const bondPriceChange = ({ duration, convexity = 0, dy }) => -duration * dy + 0.5 * convexity * dy * dy;

/**
 * Brinson-Fachler style attribution vs benchmark (single period).
 * segs = [{ wp, wb, rp, rb }]. Allocation = Σ(wp−wb)(rb−Rb); Selection = Σ wb(rp−rb); Interaction = Σ(wp−wb)(rp−rb).
 */
export function brinson(segs) {
  const Rp = sum(segs.map((s) => s.wp * s.rp)), Rb = sum(segs.map((s) => s.wb * s.rb));
  const allocation = sum(segs.map((s) => (s.wp - s.wb) * (s.rb - Rb)));
  const selection = sum(segs.map((s) => s.wb * (s.rp - s.rb)));
  const interaction = sum(segs.map((s) => (s.wp - s.wb) * (s.rp - s.rb)));
  return { Rp, Rb, active: Rp - Rb, allocation, selection, interaction };
}

/**
 * Closed-end fund economics (simplified, whole-life). Fees reduce investable capital; carry = carryPct × profit over
 * committed capital when the fund returns more than committed capital (hurdle assumed met, full catch-up).
 */
export function fundEconomics({ committed, feeTotal, grossMoic, carryPct = 0.2 }) {
  const invested = committed - feeTotal;
  const proceeds = invested * grossMoic;
  const profit = proceeds - committed;
  const carry = Math.max(0, profit) * carryPct;
  const lpProceeds = proceeds - carry;
  return { invested, proceeds, profit, carry, lpProceeds, netTvpi: lpProceeds / committed, grossNetGap: grossMoic - lpProceeds / committed };
}

/** Buy-and-build: blended entry multiple and value from multiple arbitrage at a single exit multiple. */
export function buyAndBuild({ platformEbitda, platformMultiple, addOns, exitMultiple }) {
  const cost = platformEbitda * platformMultiple + sum(addOns.map((a) => a.ebitda * a.multiple));
  const ebitda = platformEbitda + sum(addOns.map((a) => a.ebitda));
  const exitEv = ebitda * exitMultiple;
  return { cost, ebitda, blended: cost / ebitda, exitEv, arbitrage: exitEv - cost };
}

/** 2-D sensitivity grid helper: f(rowVal, colVal) → number. */
export const sensitivity = (rowVals, colVals, f) => rowVals.map((r) => colVals.map((c) => f(r, c)));

/** Probability-weighted (certainty-adjusted) bid value. */
export const expectedValue = (value, prob, fallback = 0) => value * prob + fallback * (1 - prob);

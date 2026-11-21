import { describe, test, approx, eq, ok } from './runner.js';
import * as F from '../src/engine/finance.js';

describe('Time value of money', () => {
  test('NPV of fairly priced 1-year investment is zero', () => approx(F.npv(0.1, [-100, 110]), 0, 1e-9));
  test('IRR of -100 → +121 in year 2 is 10%', () => approx(F.irr([-100, 0, 121]), 0.1, 1e-7));
  test('IRR returns NaN when no sign change', () => ok(Number.isNaN(F.irr([100, 100]))));
  test('FV 500 at 8% for 10 years = 1079.46', () => approx(F.fv(500, 0.08, 10), 1079.4625, 1e-3));
  test('PV is inverse of FV', () => approx(F.pv(F.fv(123, 0.07, 6), 0.07, 6), 123, 1e-9));
});

describe('Cost of capital', () => {
  test('CAPM 3% + 1.2×6% = 10.2%', () => approx(F.capm({ rf: 0.03, beta: 1.2, erp: 0.06 }), 0.102, 1e-12));
  test('WACC 70/30, ke 10.2%, kd 6%, tax 20% = 8.58%', () => approx(F.wacc({ equity: 70, debt: 30, ke: 0.102, kd: 0.06, tax: 0.2 }), 0.0858, 1e-12));
  test('WACC after +200bp shock = 10.46%', () => approx(F.wacc({ equity: 70, debt: 30, ke: 0.122, kd: 0.08, tax: 0.2 }), 0.1046, 1e-12));
});

describe('DCF', () => {
  test('Zero-growth perpetuity of 100 at 10% = 1000', () => approx(F.dcf({ fcff: [100], wacc: 0.1, g: 0 }).ev, 1000, 1e-9));
  test('Two-stage equals growing perpetuity 100/(10%-2%) = 1250', () => approx(F.dcf({ fcff: [100, 102], wacc: 0.1, g: 0.02 }).ev, 1250, 1e-9));
  test('Equity = EV − net debt; per share', () => {
    const r = F.dcf({ fcff: [100], wacc: 0.1, g: 0, netDebt: 200, shares: 40 });
    approx(r.equity, 800, 1e-9); approx(r.perShare, 20, 1e-9);
  });
  test('Throws when WACC ≤ g', () => { let threw = false; try { F.dcf({ fcff: [1], wacc: 0.02, g: 0.03 }); } catch { threw = true; } ok(threw); });
});

describe('Financial statements', () => {
  test('Income statement waterfall', () => {
    const r = F.incomeStatement({ revenue: 1200, cogs: 720, opex: 240, da: 60, interest: 30, taxRate: 0.2 });
    eq([r.grossProfit, r.ebitda, r.ebit, r.ebt, r.tax, r.netIncome], [480, 240, 180, 150, 30, 120]);
  });
  test('FCFF = EBIT(1−t) + D&A − Capex − ΔNWC', () => approx(F.fcffFrom({ ebit: 100, tax: 0.25, da: 20, capex: 30, dNwc: 5 }), 60, 1e-9));
});

describe('Comparables', () => {
  test('Median odd / even', () => { approx(F.median([12, 8, 10]), 10); approx(F.median([8, 14, 10, 12]), 11); });
  test('Implied EV and equity', () => {
    const r = F.comps([{ ev: 800, ebitda: 100 }, { ev: 1000, ebitda: 100 }, { ev: 1200, ebitda: 100 }], 50, 100);
    approx(r.median, 10); approx(r.impliedEv, 500); approx(r.impliedEquity, 400);
  });
});

describe('LBO', () => {
  const base = { ebitda: 100, entryMultiple: 10, debtMultiple: 5, interestRate: 0.1, ebitdaGrowth: 0, daPct: 0, capexPct: 0, taxRate: 0, exitMultiple: 10 };
  test('1-year hand case: MOIC 1.10x, IRR 10%', () => {
    const r = F.lbo({ ...base, years: 1 });
    approx(r.equity0, 500); approx(r.rows[0].repay, 50); approx(r.exitEquity, 550); approx(r.moic, 1.1); approx(r.irr, 0.1, 1e-7);
  });
  test('2-year hand case: debt 500→450→395, MOIC 1.21x, IRR 10%', () => {
    const r = F.lbo({ ...base, years: 2 });
    approx(r.rows[1].interest, 45); approx(r.rows[1].close, 395); approx(r.moic, 1.21); approx(r.irr, 0.1, 1e-7);
  });
  test('Sources equal uses', () => {
    const r = F.lbo({ ...base, years: 5, feesPct: 0.02, ebitdaGrowth: 0.05, daPct: 0.1, capexPct: 0.1, taxRate: 0.25 });
    approx(r.sources.total, r.uses.total, 1e-9);
  });
  test('Taxes use EBT after interest and D&A', () => {
    const r = F.lbo({ ...base, years: 1, daPct: 0.2, taxRate: 0.25 });
    approx(r.rows[0].tax, (100 - 20 - 50) * 0.25);
  });
});

describe('Venture: rounds & waterfall', () => {
  test('Priced round without pool', () => {
    const r = F.pricedRound({ preMoney: 32, investment: 8, sharesPre: 8_000_000 });
    approx(r.postMoney, 40); approx(r.invPct, 0.2); approx(r.newInvShares, 2_000_000, 1e-3); approx(r.price * 1e6, 4, 1e-9); // $8M / 2M shares = $4.00
  });
  test('Option pool shuffle: 10% post pool cuts effective pre-money 32 → 28', () => {
    const r = F.pricedRound({ preMoney: 32, investment: 8, sharesPre: 8_000_000, poolPostPct: 0.1 });
    approx(r.effectivePreMoney, 28, 1e-9); approx(r.newPool / r.totalShares, 0.1, 1e-12); approx(r.newInvShares / r.totalShares, 0.2, 1e-12);
  });
  test('1x non-participating: low exit takes preference', () => {
    const r = F.waterfall(30, [{ name: 'A', invested: 8, shares: 20 }], 80);
    approx(r.perSeries[0], 8); approx(r.common, 22); ok(!r.converted[0]);
  });
  test('1x non-participating: high exit converts', () => {
    const r = F.waterfall(100, [{ name: 'A', invested: 8, shares: 20 }], 80);
    approx(r.perSeries[0], 20); ok(r.converted[0]);
  });
  test('Seniority stack: senior B paid first', () => {
    const s = [{ name: 'A', invested: 5, shares: 25, seniority: 0 }, { name: 'B', invested: 10, shares: 25, seniority: 1 }];
    const r = F.waterfall(12, s, 50);
    approx(r.perSeries[1], 10); approx(r.perSeries[0], 2); approx(r.common, 0);
    const hi = F.waterfall(200, s, 50);
    approx(hi.perSeries[0], 50); approx(hi.perSeries[1], 50); approx(hi.common, 100);
  });
});

describe('M&A accretion / dilution', () => {
  test('All-stock deal accretion 4.35%', () => {
    const r = F.accretionDilution({ acqNI: 100, acqShares: 100, acqPrice: 20, tgtNI: 20, purchasePrice: 300, pctStock: 1, kd: 0.05, tax: 0.2 });
    approx(r.newShares, 15); approx(r.accretion, 120 / 115 - 1, 1e-12); approx(r.breakevenSyn, 0);
  });
  test('All-debt deal accretion 8%', () => {
    const r = F.accretionDilution({ acqNI: 100, acqShares: 100, acqPrice: 20, tgtNI: 20, purchasePrice: 300, pctStock: 0, kd: 0.05, tax: 0.2 });
    approx(r.afterTaxInterest, 12); approx(r.accretion, 0.08, 1e-12);
  });
  test('Breakeven synergies make EPS neutral', () => {
    const p = { acqNI: 100, acqShares: 100, acqPrice: 10, tgtNI: 5, purchasePrice: 400, pctStock: 1, kd: 0.05, tax: 0.2 };
    const r = F.accretionDilution(p);
    ok(r.accretion < 0, 'should be dilutive');
    const r2 = F.accretionDilution({ ...p, synergies: r.breakevenSyn });
    approx(r2.accretion, 0, 1e-12);
  });
});

describe('Consulting firm model', () => {
  test('Synthetic EPM practice', () => {
    const r = F.consultingFirm({ consultants: 20, utilization: 0.72, hours: 1800, billRate: 160, realization: 0.92, costPerConsultant: 120000, sgaPct: 0.15, attrition: 0.18, replaceCost: 30000 });
    approx(r.billableHours, 25920); approx(r.revenue, 3815424, 1e-6); approx(r.ebitda, 735110.4, 1e-6);
  });
});

describe('Venture metrics & corporate helpers', () => {
  test('NRR 122%, gross retention 87%', () => { approx(F.nrr({ start: 1, expansion: 0.35, contraction: 0.05, churn: 0.08 }), 1.22, 1e-12); approx(F.grossRetention({ start: 1, contraction: 0.05, churn: 0.08 }), 0.87, 1e-12); });
  test('CAC payback: 12k / (10k×55%/12) = 26.18 months', () => approx(F.cacPayback({ cac: 12000, arrPerCustomer: 10000, grossMargin: 0.55 }), 12000 / 458.3333333, 1e-6));
  test('Burn multiple 4.8 / 1.6 = 3.0x', () => approx(F.burnMultiple(4.8, 1.6), 3, 1e-12));
  test('Pro rata: 18% of $30M = 5.4; skip → 14.4%', () => { const r = F.proRata({ ownership: 0.18, preMoney: 120, raise: 30 }); approx(r.amount, 5.4, 1e-12); approx(r.dilutedOwnership, 0.144, 1e-12); });
  test('Weighted score 0.4×8 + 0.3×6 + 0.3×7 = 7.1', () => approx(F.weightedScore([8, 6, 7], [0.4, 0.3, 0.3]), 7.1, 1e-12));
  test('After-tax divestiture proceeds 120 − 20%×(120−70) = 110', () => { approx(F.afterTaxProceeds({ price: 120, taxBasis: 70, taxRate: 0.2 }), 110); approx(F.afterTaxProceeds({ price: 50, taxBasis: 70, taxRate: 0.2 }), 50); });
});

describe('Sector KPIs', () => {
  test('Solar 50 MW × 18% CF = 78,840 MWh', () => approx(F.energyMWh(50, 0.18), 78840, 1e-9));
  test('DSCR 4.5188 / 3.2 = 1.412', () => approx(F.dscr(4.5188, 3.2), 1.412125, 1e-9));
  test('NOI 12×90% − 3 = 7.8; value at 6.5% = 120', () => { const n = F.noi({ grossRent: 12, vacancy: 0.1, opex: 3 }); approx(n, 7.8, 1e-12); approx(F.capValue(n, 0.065), 120, 1e-9); });
  test('Rule of 40: 30 + 5 = 35', () => approx(F.ruleOf40(30, 5), 35));
  test('LTV 20k × 80% / 10% = 160k', () => approx(F.customerLtv({ arpa: 20000, grossMargin: 0.8, churn: 0.1 }), 160000, 1e-6));
  test('Annuity IRR: −100 then 2 × 57.619 ≈ 10%', () => approx(F.annuityIrr(100, 57.6190476, 2), 0.1, 1e-6));
});

describe('Sector operating models', () => {
  test('PMT: 100 at 10% over 2 years = 57.619', () => { approx(F.pmt(100, 0.1, 2), 57.6190476, 1e-6); approx(F.pmt(90, 0, 3), 30); });
  const solarBase = { mw: 50, cf: 0.18, ppa: 70, opex: 1, capex: 45, years: 20 };
  test('Solar, all-equity & flat: project IRR equals annuity IRR', () => { const r = F.solarProject(solarBase); approx(r.projectIrr, F.annuityIrr(45, 5.5188 - 1, 20), 1e-9); approx(r.rows[0].revenue, 5.5188, 1e-9); approx(r.equityIrr, r.projectIrr, 1e-9); });
  test('Solar with debt: DS = PMT, debt fully repaid, DSCR = CFADS/DS, leverage lifts equity IRR', () => {
    const r = F.solarProject({ ...solarBase, debtPct: 0.7, rate: 0.06, tenor: 15 });
    approx(r.ds, F.pmt(31.5, 0.06, 15), 1e-12); ok(r.checkDebtRepaid); approx(r.rows[14].balance, 0, 1e-6);
    approx(r.rows[0].dscr, 4.5188 / r.ds, 1e-9); eq(r.rows[15].service, 0); ok(r.equityIrr > r.projectIrr);
  });
  test('Solar degradation reduces later generation', () => { const r = F.solarProject({ ...solarBase, degradation: 0.005 }); approx(r.rows[1].mwh, 78840 * 0.995, 1e-6); });
  test('Real estate, unlevered, no growth, exit at entry cap: IRR = cap rate 6.5%', () => {
    const r = F.realEstateInvestment({ price: 120, grossRent: 12, vacancy: 0.1, opex: 3, years: 5, exitCap: 0.065 });
    approx(r.irr, 0.065, 1e-9); approx(r.exitValue, 120, 1e-9); approx(r.goingInCap, 0.065, 1e-12); ok(r.checkSources);
  });
  test('Real estate levered: equity = price×(1+cost) − loan; cash-on-cash', () => {
    const r = F.realEstateInvestment({ price: 120, grossRent: 12, vacancy: 0.1, opex: 3, ltv: 0.6, rate: 0.06, years: 5, exitCap: 0.065, costPct: 0.02 });
    approx(r.equity, 50.4, 1e-9); approx(r.rows[0].cf, 7.8 - 4.32, 1e-9); approx(r.cashOnCash, 3.48 / 50.4, 1e-12); approx(r.rows[0].dscr, 7.8 / 4.32, 1e-12);
  });
  test('SaaS roll-forward: 50 × 110% + 10 = 65; revenue = average ARR', () => {
    const r = F.saasModel({ startArr: 50, nrr: 1.1, newArr: 10, grossMargin: 0.8, magicNumber: 0.5, rndPct: 0.2, gaPct: 0.12, years: 3 });
    approx(r.rows[0].arr, 65, 1e-9); approx(r.rows[0].revenue, 57.5, 1e-9); approx(r.rows[0].fcf, 46 - 20 - 11.5 - 6.9, 1e-9); approx(r.rows[1].arr, 65 * 1.1 + 10, 1e-9); ok(r.rows.every((x) => x.check));
  });
  test('Clinic model reproduces academy case: revenue 60, EBITDA 10.8 → 7.2 after 10% cut on 60% insured', () => {
    const base = { clinics: 6, visitsPerClinic: 20000, capacityPerClinic: 25000, revPerVisit: 0.5, insurancePct: 0.6, varCostPerVisit: 0.15, fixedPerClinic: 5.2 };
    const a = F.clinicModel(base); approx(a.revenue, 60, 1e-9); approx(a.ebitda, 10.8, 1e-9); approx(a.utilization, 0.8, 1e-12);
    approx(F.clinicModel({ ...base, reimbursementCut: 0.1 }).ebitda, 7.2, 1e-9);
  });
  test('AI economics reproduces academy case: GM 50%', () => { const r = F.aiEconomics({ users: 10000, pricePerUser: 1000, queriesPerUser: 2000, costPerQuery: 0.2, otherCogsPct: 0.1 }); approx(r.revenue, 1e7); approx(r.inference, 4e6, 1e-6); approx(r.gm, 0.5, 1e-12); approx(r.breakevenQueries, 4500, 1e-9); });
  test('Sensitivity grid shape and values', () => { const g = F.sensitivity([1, 2], [10, 20, 30], (a, b) => a * b); eq(g, [[10, 20, 30], [20, 40, 60]]); });
});

describe('Consulting economics', () => {
  const team = [{ role: 'Partner', hours: 50, rate: 600, cost: 250, partner: true }, { role: 'Manager', hours: 500, rate: 300, cost: 110 }, { role: 'Consultants', hours: 1500, rate: 200, cost: 70 }];
  test('Fees 480k standard → 432k at 90% realization; cost 172.5k; margin 60.07%', () => {
    const r = F.engagementEconomics({ team, realization: 0.9 });
    approx(r.standard, 480000); approx(r.fees, 432000); approx(r.cost, 172500); approx(r.margin, 259500 / 432000, 1e-12); approx(r.leverage, 40); approx(r.effectiveRate, 432000 / 2050, 1e-9);
  });
  test('Market size: 20M × 35% × 104 × 35k = 25,480 bn VND', () => approx(F.marketSize({ population: 20e6, penetration: 0.35, unitsPerYear: 104, price: 35000 }) / 1e9, 25480, 1e-6));
  test('Transformation business case NPV: −24 + 18 × annuity(10%, 5) = 44.23', () => approx(F.npv(0.1, [-24, 18, 18, 18, 18, 18]), -24 + 18 * (1 - 1.1 ** -5) / 0.1, 1e-9));
});

describe('Investment management', () => {
  const base = { r1: 0.1, r2: 0.04, s1: 0.18, s2: 0.06, rho: 0.2, rf: 0.03 };
  test('60/40: return 7.6%, vol 11.52%, Sharpe 0.399', () => { const p = F.portfolio2({ ...base, w: 0.6 }); approx(p.ret, 0.076, 1e-12); approx(p.vol, Math.sqrt(0.0132768), 1e-12); approx(p.sharpe, 0.046 / Math.sqrt(0.0132768), 1e-12); });
  test('Perfect correlation → vol is weighted average; diversification lowers vol when ρ < 1', () => { approx(F.portfolio2({ ...base, rho: 1, w: 0.5 }).vol, 0.12, 1e-12); ok(F.portfolio2({ ...base, rho: 0.2, w: 0.5 }).vol < 0.12); });
  test('Bond: duration 7, +100bp → −7%; with convexity 60 → −6.7%', () => { approx(F.bondPriceChange({ duration: 7, dy: 0.01 }), -0.07, 1e-12); approx(F.bondPriceChange({ duration: 7, convexity: 60, dy: 0.01 }), -0.067, 1e-12); });
  test('Brinson: allocation 1.6% + selection 0.5% + interaction 0.6% = active 2.7%', () => {
    const b = F.brinson([{ wp: 0.7, wb: 0.5, rp: 0.12, rb: 0.1 }, { wp: 0.3, wb: 0.5, rp: 0.01, rb: 0.02 }]);
    approx(b.active, 0.027, 1e-12); approx(b.allocation, 0.016, 1e-12); approx(b.selection, 0.005, 1e-12); approx(b.interaction, 0.006, 1e-12); approx(b.allocation + b.selection + b.interaction, b.active, 1e-12);
  });
});

describe('Endgame: fund economics & buy-and-build', () => {
  test('Fund I: 200 committed, 20 fees, 2.5x gross → carry 50, LP 400, net TVPI 2.0x', () => {
    const f = F.fundEconomics({ committed: 200, feeTotal: 20, grossMoic: 2.5 });
    approx(f.invested, 180); approx(f.proceeds, 450); approx(f.carry, 50); approx(f.lpProceeds, 400); approx(f.netTvpi, 2); approx(f.grossNetGap, 0.5);
  });
  test('No carry when fund loses money', () => { const f = F.fundEconomics({ committed: 100, feeTotal: 10, grossMoic: 1 }); approx(f.carry, 0); approx(f.netTvpi, 0.9); });
  test('Buy-and-build: 20×10x + 10×6x = 260 for 30 EBITDA (8.67x); exit 10x → +40 arbitrage', () => {
    const b = F.buyAndBuild({ platformEbitda: 20, platformMultiple: 10, addOns: [{ ebitda: 6, multiple: 6 }, { ebitda: 4, multiple: 6 }], exitMultiple: 10 });
    approx(b.cost, 260); approx(b.blended, 260 / 30, 1e-12); approx(b.arbitrage, 40);
  });
});

describe('Small business', () => {
  test('Lemonade: optimum at p=9 → q=48, profit 248', () => {
    const best = [...Array(15).keys()].map((p) => F.lemonade({ price: p, unitCost: 3, fixedCost: 40, a: 120, b: 8 })).reduce((m, x) => (x.profit > m.profit ? x : m));
    approx(best.q, 48); approx(best.profit, 248);
  });
  test('Payback & multiples', () => { approx(F.payback(500, 108), 4.6296, 1e-4); approx(F.valueAtMultiple(108, 3.5), 378); });
  test('Leverage & expected value', () => { approx(F.leverage(450, 70.4), 6.392, 1e-3); approx(F.expectedValue(520, 0.6, 450), 492); });
});

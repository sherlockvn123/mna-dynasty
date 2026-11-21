import { describe, test, approx, eq, ok } from './runner.js';
import * as E from '../src/engine/fundsim.js';

function run(picks, exits = {}, opts = {}) {
  const s = E.createSim({ committed: 200, feeBps: 200, spec: opts.spec || null });
  for (let y = 1; y <= 10 && !s.done; y++) {
    for (const id of picks[y] || []) E.invest(s, id);
    s.holdings.forEach((h, i) => { if (h.distressed && opts.cure) E.cure(s, i); });
    for (const [id, yy] of Object.entries(exits)) if (yy === y) { const i = s.holdings.findIndex((h) => h.id === id); if (i >= 0) E.exit(s, i); }
    E.advance(s);
  }
  return s;
}
const GOOD = { 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] };

describe('Fund simulation engine', () => {
  test('Fees: 2% on commitments for years 1–5, 1% after → 30 over 10 years; year-1 fee called at start', () => {
    const s = E.createSim({ committed: 200, feeBps: 200 }); approx(s.paidIn, 4);
    let total = 0; for (let y = 1; y <= 10; y++) total += E.feeFor(s, y); approx(total, 30);
  });
  test('Investment rules: right year only, investment period 1–4, concentration cap 20% with partial stake', () => {
    const s = E.createSim();
    ok(E.canInvest(s, 'd4'), 'year-2 deal not available in year 1');
    eq(E.invest(s, 'd2'), null); approx(s.holdings[0].cost, 40); approx(s.holdings[0].share, 0.8, 1e-12);
    ok(E.invest(s, 'd2'), 'cannot invest twice');
    for (let y = 1; y < 5; y++) E.advance(s);
    ok(/giai đoạn đầu tư/.test(E.canInvest(s, 'd10') || ''), 'no new deals after year 4');
  });
  test('Fee reserve prevents over-committing', () => {
    const s = E.createSim(); E.invest(s, 'd1'); E.invest(s, 'd2'); E.invest(s, 'd3');
    approx(s.paidIn, 4 + 40 + 40 + 15); ok(s.paidIn + E.reserveForFees(s) <= 200 + 1e-9);
  });
  test('Exit requires two years of holding; proceeds = equity value × stake', () => {
    const s = E.createSim(); E.invest(s, 'd1'); E.advance(s); ok(E.canExit(s, 0)); E.advance(s);
    const v = E.equityValue(s.holdings[0], s.year); eq(E.exit(s, 0), null); approx(s.holdings[0].proceeds, v); approx(s.dists[3], v);
  });
  test('Recession: highly levered cyclicals breach covenants; unresolved distress is written off', () => {
    const s = run({ 1: ['d3'], 4: ['d11'] }, {}, {});
    ok(s.log.some((l) => /Sao Mai.*vi phạm covenant/.test(l)) && s.log.some((l) => /Bếp Mẹ.*vi phạm covenant/.test(l)));
    eq(s.result.writeOffs, 2);
  });
  test('Equity cure restores leverage to 5x and keeps the company', () => {
    const s = E.createSim(); E.invest(s, 'd1'); E.advance(s); E.advance(s); E.advance(s); E.invest(s, 'd11');
    E.advance(s); const i = 1; const h = s.holdings[i]; ok(h.distressed);
    const c = E.cureCost(h); approx(c, h.debt - 5 * h.ebitda, 1e-9); eq(E.cure(s, i), null); approx(h.debt / h.ebitda, 5, 1e-9); ok(!h.distressed);
  });
  test('Quality-of-earnings red flag cuts EBITDA 30% the year after purchase', () => {
    const s = E.createSim(); E.advance(s); E.invest(s, 'd5'); E.advance(s);
    const d = E.DEAL_BY_ID.d5; approx(s.holdings[0].ebitda, 3 * 0.7 * (1 + d.g + d.cyc * E.REGIMES.rates.g), 1e-9);
  });
  test('Accounting identities: paid-in = fees + invested ≤ commitments; LP proceeds = distributions − carry', () => {
    const s = run(GOOD); const r = s.result;
    approx(r.paidIn, r.fees + r.invested, 1e-9); ok(r.paidIn <= 200 + 1e-9); approx(r.lpDist, r.totalDist - r.carry, 1e-9); approx(r.netTvpi, r.lpDist / r.paidIn, 1e-12);
    ok(Number.isFinite(r.netIrr));
  });
  test('Carry only when hurdle (8% gross IRR) is met', () => { const s = run({ 1: ['d3'], 4: ['d11'] }); ok(s.result.grossIrr < 0.08); eq(s.result.carry, 0); });
  test('Lessons hold: disciplined buy-and-hold is top quartile; panic selling in the recession is bottom quartile', () => {
    eq(run(GOOD).result.quartile, 1);
    eq(run(GOOD, { d1: 5, d2: 5, d4: 5, d7: 5, d8: 5 }).result.quartile, 4);
  });
  test('Early wind-down when everything is sold stops fees', () => {
    const s = run({ 1: ['d1'] }, { d1: 6 }); ok(s.done && s.log.some((l) => /giải thể sớm/.test(l))); ok(s.result.fees < 30);
  });
  test('Specialization adds growth in the specialist sector', () => {
    const a = run({ 1: ['d1'] }), b = run({ 1: ['d1'] }, {}, { spec: 'healthcare' }); ok(b.result.netTvpi > a.result.netTvpi);
  });
  test('Deterministic: same decisions → same result', () => { eq(JSON.stringify(run(GOOD).result), JSON.stringify(run(GOOD).result)); });
});

function run2(size, picks, exits = {}, opts = {}) {
  const s = E.createSim({ committed: size, feeBps: 200, spec: opts.spec || null, scenario: 'fund2' });
  for (let y = 1; y <= 10 && !s.done; y++) {
    for (const id of picks[y] || []) E.invest(s, id);
    s.holdings.forEach((h, i) => { if (h.distressed && opts.cure) E.cure(s, i); });
    for (const [id, yy] of Object.entries(exits)) if (yy === y) { const i = s.holdings.findIndex((h) => h.id === id); if (i >= 0) E.exit(s, i); }
    E.advance(s);
  }
  return s;
}
const MID = { 1: ['g1', 'g2'], 2: ['g4', 'g5'] };
const MID_CRISIS = { ...MID, 5: ['g13', 'g14', 'g15'] };

describe('Fund II scenario: boom, credit crisis, fund size & style drift', () => {
  test('Scenario setup: 5-year investment period, boom years 3–4, credit crisis in year 5', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350 });
    eq(s.investYears, 5); eq(E.regimeKey(3, s), 'boom'); eq(E.regimeKey(5, s), 'crisis'); eq(E.offers(s).map((d) => d.id), ['g1', 'g2', 'g3']);
    ok(E.canInvest(s, 'd1'), 'Fund I deals are not available in Fund II');
  });
  test('Boom-priced deals are valued at the sector median, not the price paid', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350 }); E.advance(s); E.advance(s); E.invest(s, 'g8');
    const h = s.holdings[0]; approx(E.curMultiple(h, 3, s), 9 + 1.5); ok(E.equityValue(h, 3, s) < h.cost, 'paper loss on day one when paying 13x for a 9x business');
  });
  test('Crisis bargains re-rate toward fair value', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350 }); for (let y = 1; y < 5; y++) E.advance(s); E.invest(s, 'g14');
    E.advance(s); E.advance(s); ok(E.equityValue(s.holdings[0], s.year, s) > s.holdings[0].cost * 1.4);
  });
  test('Highly levered large-caps breach covenants in the credit crisis', () => {
    const s = run2(700, { 3: ['g9'], 4: ['g10'] }); eq(s.result.writeOffs, 2); eq(s.result.quartile, 4);
  });
  test('Lessons hold: buying in the crisis beats waiting; boom buying and oversized funds underperform; panic selling is worst', () => {
    const base = run2(350, MID_CRISIS).result, noCrisis = run2(350, MID).result, boom = run2(350, { ...MID, 3: ['g7', 'g8'], 4: ['g11', 'g12'] }).result;
    const big = run2(700, MID_CRISIS).result, panic = run2(350, MID, { g1: 5, g2: 5, g4: 5, g5: 5 }).result;
    eq(base.quartile, 1); ok(base.netTvpi > noCrisis.netTvpi && base.netTvpi > boom.netTvpi);
    ok(big.netTvpi < base.netTvpi, 'same strategy, bigger fund → fee drag'); ok(big.deployed < 0.5);
    eq(panic.quartile, 4);
  });
  test('Crisis events are opt-in: plain sims (and Fund I) never pause', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350 }); for (let y = 1; y <= 10 && !s.done; y++) E.advance(s); ok(s.done); eq(s.result.events.length, 0);
    eq(E.createSim({ crises: true }).crises.length, 0);
  });
  test('Fund I behaviour is unchanged by the scenario refactor', () => {
    const s = E.createSim(); eq(s.investYears, 4); eq(E.regimeKey(5, s), 'recession'); eq(E.regimeKey(5), 'recession');
  });
});

function runC(size, picks, choices = {}) {
  const s = E.createSim({ committed: size, scenario: 'fund2', crises: true });
  for (let y = 1; y <= 10 && !s.done; y++) {
    for (const id of picks[y] || []) E.invest(s, id);
    E.advance(s);
    for (let g = 0; s.pending && g < 5; g++) E.resolveEvent(s, choices[s.pending] ?? 0);
  }
  return s;
}
const P_MIXED = { 1: ['g1', 'g2'], 3: ['g9'], 5: ['g13', 'g14', 'g15'] };

describe('Fund II crisis events (LP squeeze, rescue financing, continuation vehicle)', () => {
  test('Denominator effect: 10% target, publics −30% → PE weight ≈ 13.7%', () => { approx(E.denominatorWeight(0.1, 0.3), 0.1 / (0.1 + 0.9 * 0.7), 1e-12); approx(E.denominatorWeight(), 0.137, 0.001); });
  test('An event pauses the year: advance is refused until the GP decides', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350, crises: true }); E.invest(s, 'g1');
    for (let y = 1; y < 5; y++) E.advance(s);
    eq(s.year, 5); eq(s.pending, 'lp_squeeze'); ok(s.pendingStory.includes('13,7%'));
    ok(E.advance(s), 'blocked'); eq(s.year, 5);
    eq(E.resolveEvent(s, 9), 'Lựa chọn không hợp lệ'); eq(E.resolveEvent(s, 0), null); eq(s.pending, null); eq(s.events[0].score, 1);
  });
  test('Disciplined Fund II with best responses stays top quartile; events are recorded in the result', () => {
    const r = runC(350, MID_CRISIS).result; eq(r.quartile, 1); eq(r.events.map((e) => e.id), ['lp_squeeze', 'continuation']); ok(r.events.every((e) => e.score === 1));
  });
  test('Excusing the LP shrinks commitments by 10% of the uncalled capital', () => {
    const a = runC(350, MID_CRISIS), b = runC(350, MID_CRISIS, { lp_squeeze: 1 });
    eq(a.committed, 350); ok(b.committed < 350 && b.committed > 330); eq(b.result.events[0].score, 0.5);
  });
  test('Rescue financing: costs 30% of the cure in cash plus 20% dilution, and clears the breach', () => {
    const s = E.createSim({ scenario: 'fund2', committed: 350, crises: true });
    for (let y = 1; y <= 5; y++) { if (y === 3) E.invest(s, 'g9'); E.advance(s); if (s.pending === 'lp_squeeze') E.resolveEvent(s, 0); }
    eq(s.pending, 'rescue'); const h = s.holdings[0]; ok(h.distressed); const c = E.rescueCost(h), share0 = h.share, paid0 = s.paidIn;
    approx(c, 0.3 * E.cureCost(h), 1e-9);
    E.resolveEvent(s, 0); ok(!h.distressed && h.rescued); approx(h.share, share0 * 0.8, 1e-12); approx(s.paidIn - paid0, c, 1e-9);
  });
  test('Cash is king in the crisis: rescue > hand to creditors > equity cure that crowds out bargains (mixed portfolio)', () => {
    const [res, cure, give] = [0, 1, 2].map((k) => runC(350, P_MIXED, { rescue: k }));
    ok(res.result.netTvpi > give.result.netTvpi && give.result.netTvpi > cure.result.netTvpi, [res, cure, give].map((x) => x.result.netTvpi.toFixed(3)).join(' / '));
    eq(res.holdings.filter((h) => ['g13', 'g14', 'g15'].includes(h.id)).length, 3);
    ok(cure.holdings.filter((h) => ['g13', 'g14', 'g15'].includes(h.id)).length < 3, 'equity cure used the dry powder needed for crisis bargains');
    eq(give.result.writeOffs, 1);
  });
  test('Continuation vehicle: fair partial sale lifts early DPI and IRR; GP self-dealing at a discount loses value', () => {
    const fair = runC(350, MID_CRISIS), hold = runC(350, MID_CRISIS, { continuation: 1 }), self = runC(350, MID_CRISIS, { continuation: 2 });
    const dpi7 = (s) => s.dists.slice(0, 8).reduce((a, b) => a + b, 0);
    ok(dpi7(fair) > 0 && dpi7(hold) === 0, 'liquidity for LPs in year 7');
    ok(fair.result.netIrr > hold.result.netIrr, 'earlier cash → higher IRR');
    ok(fair.result.netTvpi > self.result.netTvpi && fair.result.netIrr > self.result.netIrr, 'self-dealing transfers value away from LPs');
    ok(fair.holdings.some((h) => h.cv) && fair.holdings.some((h) => h.rolled && h.status === 'exited'), 'half sold now, half rolled to the end');
  });
});

function run3(size, picks, { vcp = true, choices = {}, opTeam = false } = {}) {
  const s = E.createSim({ committed: size, scenario: 'fund3', crises: true, opTeam });
  for (let y = 1; y <= 10 && !s.done; y++) {
    for (const id of picks[y] || []) E.invest(s, id);
    if (vcp) s.holdings.forEach((h, i) => { if (h.status === 'held' && !h.vcpDone) E.valueCreation(s, i); });
    E.advance(s);
    for (let g = 0; s.pending && g < 5; g++) E.resolveEvent(s, choices[s.pending] ?? 0);
  }
  return s;
}
const CORE3 = { 1: ['h1', 'h3'], 2: ['h4'], 3: ['h7'], 4: ['h10'], 5: ['h13', 'h14'] };
const AI3 = { 1: ['h1', 'h2'], 2: ['h5'], 3: ['h8'], 4: ['h10'], 5: ['h13'] };
const LEV3 = { 2: ['h6'], 3: ['h9'], 4: ['h12', 'h11'], 5: ['h15'] };

describe('Fund III scenario: higher-for-longer, stagflation, AI disruption, value creation', () => {
  test('Setup: 5-year investment period, stagflation years 3–4, 15-deal deck, both Fund III events', () => {
    const s = E.createSim({ scenario: 'fund3', committed: 500 }); eq(s.investYears, 5); eq(E.regimeKey(3, s), 'stagflation'); eq(E.regimeKey(4, s), 'stagflation');
    eq(E.DEALS_3.length, 15); eq(E.SCENARIOS.fund3.events, ['refi_wall', 'ai_disruption']); ok(s.vcp); ok(!E.createSim({ scenario: 'fund2' }).vcp, 'value creation plans are a Fund III mechanic');
  });
  test('Value creation plan: costs 45% of EBITDA × stake (30% with operating partners), adds +5%/yr for 3 years, once per company', () => {
    const s = E.createSim({ scenario: 'fund3', committed: 500 }); E.invest(s, 'h1'); const h = s.holdings[0];
    approx(E.vcpCost(s, h), 0.45 * 8); const o = E.createSim({ scenario: 'fund3', committed: 500, opTeam: true }); E.invest(o, 'h1'); approx(E.vcpCost(o, o.holdings[0]), 0.3 * 8);
    eq(E.valueCreation(s, 0), null); ok(E.canVcp(s, 0), 'only once'); eq(h.vcpYears, 3);
    const e0 = h.ebitda; E.advance(s); approx(h.ebitda / e0, 1 + 0.04 + 0.4 * 0 + 0.05, 1e-9); eq(h.vcpYears, 2);
  });
  test('Lesson: with flat multiples, value creation lifts a disciplined fund from Q2 to Q1; operating partners help further; 1bn fund drags', () => {
    const plain = run3(500, CORE3, { vcp: false }).result, vcp = run3(500, CORE3).result, ops = run3(500, CORE3, { opTeam: true }).result, big = run3(1000, CORE3).result;
    eq(plain.quartile, 2); eq(vcp.quartile, 1); ok(ops.netTvpi > vcp.netTvpi && vcp.netTvpi > plain.netTvpi); ok(big.netTvpi < vcp.netTvpi); eq(vcp.vcps, 7);
  });
  test('AI disruption: transformation beats both selling and ignoring; selling beats ignoring on IRR', () => {
    const [tr, sell, ign] = [0, 1, 2].map((k) => run3(500, AI3, { choices: { ai_disruption: k } }).result);
    ok(tr.netTvpi > sell.netTvpi && tr.netTvpi > ign.netTvpi && tr.netIrr > sell.netIrr); ok(sell.netIrr > ign.netIrr); ok(tr.aiTransformed >= 3);
  });
  test('Refinancing wall: paying down with LP capital beats a NAV loan, which beats expensive refinancing; NAV loan repaid with 15%/yr', () => {
    const [pay, exp, nav] = [0, 1, 2].map((k) => run3(500, LEV3, { choices: { refi_wall: k } }));
    ok(pay.result.netTvpi > nav.result.netTvpi && nav.result.netTvpi > exp.result.netTvpi, [pay, nav, exp].map((x) => x.result.netTvpi.toFixed(3)).join(' > '));
    ok(nav.navLoan > 0 && nav.result.navLoan === nav.navLoan); approx(E.navLoanDue(nav), nav.navLoan * 1.15 ** (nav.year - nav.navYear), 1e-9);
    ok(exp.holdings.some((h) => h.refiHigh));
  });
});

describe('DPI and public market equivalent (KS-PME)', () => {
  test('KS-PME textbook case: contribute 100 at index 100, receive 250 at index 200 → 1.25', () => {
    approx(E.ksPme([0, 100, 0], [0, 0, 250], [100, 100, 200], 2), 1.25, 1e-12);
    approx(E.ksPme([0, 100], [0, 100], [100, 120], 1), 1, 1e-12, 'same-day round trip = 1');
  });
  test('The scripted public index follows each scenario’s macro path', () => {
    const I1 = E.publicIndex(E.createSim()), I2 = E.publicIndex(E.createSim({ scenario: 'fund2' }));
    eq(I1.length, 11); approx(I1[1], 114, 1e-9); ok(I2[4] > I2[5], 'credit crisis year falls'); approx(I2[5] / I2[4], 0.7, 1e-12);
  });
  test('Results carry DPI at years 5/7, PME and the index return; early exits raise DPI₇', () => {
    const base = run({ 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] }).result, early = run({ 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] }, { d1: 4, d2: 4 }).result;
    for (const k of ['dpi5', 'dpi7', 'pme', 'publicTr']) ok(Number.isFinite(base[k]), k);
    eq(base.dpi7, 0); ok(early.dpi7 > 0.5); ok(base.pme > 1, 'disciplined Fund I beats the public index');
  });
  test('Vintage lesson: Fund II can show a higher TVPI than Fund I yet a lower PME, because its public index rose more', () => {
    const f1 = run({ 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] }).result, f2 = runC(350, MID_CRISIS).result;
    ok(f2.netTvpi > f1.netTvpi && f2.pme < f1.pme, `${f1.netTvpi.toFixed(2)}/${f1.pme.toFixed(2)} vs ${f2.netTvpi.toFixed(2)}/${f2.pme.toFixed(2)}`); ok(f2.publicTr > f1.publicTr);
  });
  test('PME rewards discipline within a vintage: boom-priced buying sits near the public market, crisis buying clears it', () => {
    const good = runC(350, MID_CRISIS).result, boom = runC(350, { ...MID, 3: ['g7', 'g8'], 4: ['g11', 'g12'] }).result;
    ok(good.pme > boom.pme + 0.1 && boom.pme < 1.15, `${good.pme.toFixed(2)} vs ${boom.pme.toFixed(2)}`);
    const panic = run(GOOD, { d1: 5, d2: 5, d4: 5, d7: 5, d8: 5 }).result; ok(panic.netTvpi < 1 && panic.pme > panic.netTvpi, 'KS-PME treats distributions as reinvested in the index — selling at the bottom gets credited with the rebound');
  });
});

describe('J-curve', () => {
  test('Cumulative LP cash flow dips first (fees + calls), then turns up; final cumulative equals net profit after carry', () => {
    const s = run(GOOD), jc = E.jCurve(s), y = jc.years;
    eq(y.length, 10); ok(y[0].cum < 0 && y[0].call > 0);
    ok(jc.trough && jc.trough.value < 0 && jc.trough.y >= 3, JSON.stringify(jc.trough));
    approx(y[9].cum, s.result.lpDist - s.paidIn, 1e-6); eq(y[9].nav, 0, 'fully liquidated');
    ok(jc.breakeven === 10 || jc.breakeven == null || jc.breakeven > jc.trough.y);
  });
  test('Mid-fund: NAV is recorded each year, so "cumulative + NAV" sits above the cash-only J', () => {
    const s = E.createSim(); E.invest(s, 'd1'); E.invest(s, 'd2'); E.advance(s); E.advance(s); E.advance(s);
    const jc = E.jCurve(s); eq(jc.years.length, 4); ok(jc.years.every((p) => p.nav != null)); ok(jc.years[3].total > jc.years[3].cum);
    approx(jc.years[2].nav, s.navHist[3], 1e-12);
  });
  test('Selling early makes the J shallower and breaks even sooner than buy-and-hold', () => {
    const hold = E.jCurve(run(GOOD)), early = E.jCurve(run(GOOD, { d1: 4, d2: 4, d4: 4 }));
    ok(early.years[4].cum > hold.years[4].cum); ok((early.breakeven ?? 99) <= (hold.breakeven ?? 99));
  });
});

describe('J-curve saved with fund results', () => {
  test('result.cum matches the live J-curve and ends at LP net profit', () => {
    const s = run(GOOD), r = s.result, jc = E.jCurve(s);
    eq(r.cum.length, 10); jc.years.forEach((p, i) => approx(r.cum[i], Math.round(p.cum * 10) / 10, 1e-9));
    approx(r.cum[9], r.lpDist - r.paidIn, 0.051);
  });
});

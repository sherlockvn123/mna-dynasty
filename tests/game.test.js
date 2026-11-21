import { describe, test, testAsync, approx, eq, ok } from './runner.js';
import { QUESTS, QUEST_BY_ID, ANSWERS as A, DIAGNOSTIC } from '../src/content/quests.js';
import { NPCS } from '../src/content/characters.js';
import { LOCATIONS } from '../src/content/locations.js';
import { ITEMS, ACHIEVEMENTS } from '../src/content/items.js';
import { MODELS } from '../src/content/models.js';
import { GLOSSARY } from '../src/content/glossary.js';
import { CASES, LABELS } from '../src/content/cases.js';
import { CAREERS } from '../src/content/careers.js';
import * as Save from '../src/engine/save.js';
import * as St from '../src/engine/store.js';
import { initNegotiation, negotiateRound } from '../src/engine/negotiation.js';
import { parseNum } from '../src/ui/mission.js';
import { CAREER_ANSWERS as C } from '../src/content/quests_career.js';
import { INDUSTRY_ANSWERS as I } from '../src/content/quests_industry.js';
import { SECTORS, credibility } from '../src/content/sectors.js';
import { solarParams, engagementParams, portParams } from '../src/content/models.js';
import { IM_ANSWERS as IM } from '../src/content/quests_im.js';
import { PATHS, TRANSITION_ANSWERS as TA } from '../src/content/quests_transition.js';
import { ENDGAME_ANSWERS as EG, recruits } from '../src/content/quests_endgame.js';
import * as FS from '../src/engine/fundsim.js';
import { CRISIS_ANSWERS as CR } from '../src/content/quests_crisis.js';
import { SUCCESSION_ANSWERS as SU, epilogue, readiness } from '../src/content/quests_succession.js';
import { CASE_ANSWERS as CA } from '../src/content/quests_cases.js';
import { CASE2_ANSWERS as C2, CASE2_IDS } from '../src/content/quests_cases2.js';
import { REPLAY_ANSWERS as RP, REPLAYS, LENSES, LENS_ORDER, REPLAY_IDS } from '../src/content/quests_replay.js';
import { CONSULTING_ANSWERS as CS } from '../src/content/quests_consulting.js';
import * as F from '../src/engine/finance.js';
import * as LG from '../src/engine/league.js';
import * as LZ from '../src/engine/lenses.js';

const TYPES = ['say', 'quiz', 'num', 'sort', 'model', 'choice', 'investigate', 'negotiate', 'debug', 'doc', 'outcome', 'fundsim'];

describe('Content integrity (data-driven schemas)', () => {
  test('quest ids unique', () => eq(new Set(QUESTS.map((q) => q.id)).size, QUESTS.length));
  test('at least 15 substantive missions', () => ok(QUESTS.filter((q) => q.steps.some((s) => ['quiz', 'num', 'sort', 'model', 'negotiate', 'debug', 'choice'].includes(s.type))).length >= 15));
  test('at least 8 NPCs and 3 environments', () => { ok(Object.keys(NPCS).length >= 8); ok(Object.keys(LOCATIONS).length >= 3); });
  for (const q of QUESTS) test(`quest ${q.id} is well-formed`, () => {
    for (const r of [...(q.req || []), ...(q.reqAny || [])]) ok(QUEST_BY_ID[r], `missing req ${r}`);
    if (q.giver && !q.giver.startsWith('@')) ok(NPCS[q.giver], `missing giver ${q.giver}`);
    if (!q.loc.startsWith('@')) ok(LOCATIONS[q.loc], `missing loc ${q.loc}`);
    if (q.obj) ok(LOCATIONS[q.loc].objects.some((o) => o.id === q.obj), `missing object ${q.obj}`);
    if (q.career) ok(CAREERS[q.career]);
    if (q.case) ok(CASES[q.case]);
    const ids = new Set();
    for (const s of q.steps) {
      ok(TYPES.includes(s.type), `bad step type ${s.type}`);
      if (s.id) { ok(!ids.has(s.id), `dup step id ${s.id}`); ids.add(s.id); }
      if (s.type === 'quiz') { ok(s.a >= 0 && s.a < s.opts.length, `answer index ${s.id}`); ok(s.fb && s.fb.vi && s.fb.en, `feedback ${s.id}`); }
      if (s.type === 'num') { ok(Number.isFinite(s.a), `numeric answer ${s.id}`); ok(s.fb && s.fb.vi && s.fb.en, `feedback ${s.id}`); }
      if (s.type === 'model') ok(MODELS[s.model], `model ${s.model}`);
      if (s.type === 'negotiate') ok(NPCS[s.who] && s.reservation > 0, `negotiate ${s.id}`);
      if (s.type === 'say') for (const [who] of s.lines) ok(who === 'nar' || who === 'me' || NPCS[who], `speaker ${who}`);
      for (const t of s.terms || []) ok(GLOSSARY[t], `glossary term ${t}`);
    }
    for (const it of q.rewards?.items || []) ok(ITEMS[it], `item ${it}`);
    for (const a of q.rewards?.ach || []) ok(ACHIEVEMENTS[a], `ach ${a}`);
  });
  test('step ids are globally unique (review queue keys)', () => { const all = QUESTS.flatMap((q) => q.steps.filter((s) => s.id).map((s) => s.id)); eq(new Set(all).size, all.length); });
  test('every case statement carries a valid source label', () => { for (const c of Object.values(CASES)) for (const s of c.sections) for (const [lb] of s.items) ok(LABELS[lb], lb); });
  test('every case has at least one source link', () => { for (const c of Object.values(CASES)) ok(c.sources.length >= 1); });
  test('Keyrus case does not state an undisclosed price as fact', () => { const facts = CASES.keyrus_vuealta.sections.flatMap((s) => s.items).filter(([l]) => l === 'fact').map(([, t]) => t); ok(facts.some((t) => /không công bố/.test(t))); ok(!facts.some((t) => /\d+\s*triệu USD/.test(t))); });
  test('diagnostic has 6 valid questions', () => { eq(DIAGNOSTIC.length, 6); DIAGNOSTIC.forEach((d) => ok(d.a < d.opts.length)); });
  test('each career has a mentor, office and preview mission', () => { for (const c of Object.values(CAREERS)) { ok(NPCS[c.mentor]); ok(LOCATIONS[c.office]); ok(QUEST_BY_ID[c.mission]); } });
});

describe('Mission answers — independent hand checks', () => {
  test('Bakery: 9/month, 108/year, fair 378, adjusted 338', () => { eq([A.BAKERY.monthly, A.BAKERY.annual, A.BAKERY.fair, A.BAKERY.adj], [9, 108, 378, 338]); });
  test('Lemonade optimum profit 248', () => approx(A.LEMON_BEST.profit, 248));
  test('DCF EV ≈ 798.97', () => approx(A.DCF.ev, 50 / 1.1 + 55 / 1.21 + 60 / 1.331 + 64 / 1.4641 + 68 / 1.61051 + (68 * 1.025 / 0.075) / 1.61051, 1e-6));
  test('Comps: median 11x, EV 880, equity 750', () => { approx(A.COMPS.median, 11); approx(A.COMPS.impliedEv, 880); approx(A.COMPS.impliedEquity, 750); });
  test('Bid B has highest risk-adjusted value', () => { approx(A.BIDS.B, 492.75); ok(A.BIDS.B > A.BIDS.A && A.BIDS.B > A.BIDS.C); approx(A.BIDS.A, 488.5); });
  test('LBO: 8x clears 20% hurdle, 9x does not', () => { ok(A.LBO8.irr > 0.2); ok(A.LBO9.irr < 0.2); ok(A.LBO8x7.irr < A.LBO8.irr); approx(A.LBO8.equity0, 158, 1e-9); });
  test('VC: effective pre 28, Series A takes 8 at 30 exit', () => { approx(A.ROUND.effectivePreMoney, 28, 1e-9); approx(A.WF30.perSeries[0], 8, 1e-9); });
  test('Accretion −2.05%, breakeven synergies 3.3', () => { approx(A.AD.accretion, 126.36 / 107.5 / 1.2 - 1, 1e-12); approx(A.AD.breakevenSyn, 3.3, 1e-9); });
  test('Macro: ke 12.2%, WACC 8.58% → 10.46%', () => { approx(A.KE_NEW, 0.122, 1e-12); approx(A.W_OLD, 0.0858, 1e-12); approx(A.W_NEW, 0.1046, 1e-12); ok(A.EV_NEW < A.EV_OLD); });
  test('Recession: EBITDA 70.4, leverage 6.39x, cure 62.8', () => { approx(A.REC.ebitda, 70.4, 1e-9); approx(A.REC.lev, 450 / 70.4, 1e-12); approx(A.REC.cure, 62.8, 1e-9); });
  test('RJR synthetic bids: 105 vs 108.05', () => { approx(A.RJR.M, 105); approx(A.RJR.K, 108.05, 1e-9); });
  test('IB: adjusted EBITDA 68.5, comps cap 1,320, fee 15.6', () => { approx(C.QOE.adjusted, 68.5); approx(C.FF.compsRange[1], 1320); approx(C.FF.feeAmt, 15.6, 1e-9); });
  test('PE: value bridge 17 → 136; exit equity 515, MOIC 3.26, recap 165; IPO worse than strategic', () => { approx(C.VCB.total, 17, 1e-9); approx(C.VCB.value, 136, 1e-9); approx(C.EXIT.stratEq, 515); approx(C.EXIT.stratMoic, 515 / 158); approx(C.EXIT.recapDiv, 165); ok(C.EXIT.ipoEq < C.EXIT.stratEq); });
  test('VC: NRR 122%, GRR 87%, payback 26.2m, burn 3x, pro rata 5.4 → 14.4%', () => { approx(C.COH.nrr, 1.22, 1e-12); approx(C.COH.grr, 0.87, 1e-12); approx(C.CAC, 26.18, 0.01); approx(C.BURN, 3); approx(C.PR.amount, 5.4, 1e-12); approx(C.PR.dilutedOwnership, 0.144, 1e-12); });
  test('CD: target B scores highest (7.1); divestiture nets 110, remaining EBITDA 191', () => { approx(C.SCREEN.B, 7.1, 1e-12); ok(C.SCREEN.B > C.SCREEN.A && C.SCREEN.B > C.SCREEN.C); approx(C.DIV.proceeds, 110); approx(C.DIV.remaining, 191); });
  test('Healthcare: revenue 60, util 80%, reimbursement cut → EBITDA 7.2', () => { approx(I.HC.revenue, 60); approx(I.HC.util, 0.8); approx(I.HC.ebitdaCut, 7.2, 1e-9); });
  test('Education: revenue 240, 160 replacements, occupancy 80%', () => { approx(I.ED.revenue, 240); approx(I.ED.newNeeded, 160, 1e-9); approx(I.ED.occupancy, 0.8); });
  test('Consulting: util 75%, 182,250 per head, weighted pipeline 15', () => { approx(I.CS.util, 0.75); approx(I.CS.revPerHead, 182250, 1e-6); approx(I.CS.weighted, 15); });
  test('Energy: 78,840 MWh, DSCR 1.41, IRR between 7% and 9% and NPV≈0 at IRR', () => { approx(I.EN.mwh, 78840, 1e-6); approx(I.EN.dscr, 4.5188 / 3.2, 1e-9); ok(I.EN.irr > 0.07 && I.EN.irr < 0.09); approx(-45 + Array.from({ length: 20 }, (_, t) => I.EN.ebitda / (1 + I.EN.irr) ** (t + 1)).reduce((a, b) => a + b), 0, 1e-6); });
  test('Real estate: NOI 7.8, value 120, equity −33.3% on +100bp cap rate', () => { approx(I.RE.noi, 7.8, 1e-12); approx(I.RE.value, 120, 1e-9); approx(I.RE.valueShock, 104, 1e-9); approx(I.RE.equityDrop, 1 / 3, 1e-9); });
  test('AI: GM 50% → 70% when inference halves; SaaS Rule of 40 = 35, LTV/CAC 4x', () => { approx(I.AI.gm, 0.5); approx(I.AI.gmCheaper, 0.7); approx(I.SA.r40, 35); approx(I.SA.ltvCac, 4, 1e-12); });
  test('Every model computes finite outputs at defaults; sensitivity grids are well-shaped; integrity checks pass', () => {
    for (const [k, M] of Object.entries(MODELS)) {
      const v = Object.fromEntries(M.inputs.map((i) => [i.k, i.val]));
      const r = M.compute(v);
      r.rows.forEach(([l, x]) => ok(Number.isFinite(x), `${k}: ${l}`));
      if (r.sens) { eq(r.sens.cells.length, r.sens.rows.length, k); r.sens.cells.forEach((row) => eq(row.length, r.sens.cols.length, k)); ok(r.sens.cells[r.sens.base[0]][r.sens.base[1]] !== undefined); }
      (r.checks || []).forEach(([l, okk]) => ok(okk, `${k}: ${l}`));
      M.inputs.forEach((i) => ok(i.val >= i.min && i.val <= i.max, `${k}.${i.k} default in range`));
    }
  });
  test('Sensitivity base cell equals the headline output', () => {
    const e = MODELS.energy.compute({ cf: 18, ppa: 70, debt: 70, rate: 6 }); approx(e.sens.cells[e.sens.base[0]][e.sens.base[1]], e.out.equityIrr, 1e-12);
    const h = MODELS.healthcare.compute({ clinics: 6, visits: 20, price: 500, ins: 60, cut: 10, loss: 0 }); approx(h.sens.cells[h.sens.base[0]][h.sens.base[1]], h.out.ebitda, 1e-12);
  });
  test('Workbench goals: solvable on-screen, not pre-solved at defaults, and threshold-exact', () => {
    const G = I.GOALS;
    for (const g of Object.values(G)) ok(g !== undefined, 'goal exists');
    eq(G.hcVisits, 17, 'EBITDA ≥ 0 at 10% cut needs 17k visits (1.92v − 31.2 ≥ 0)');
    for (const [qid, sid, base, key, val] of [['a_healthcare', 'a_hc_wb', { ...I.HC_BASE, cut: 10 }, 'visits', G.hcVisits], ['a_energy', 'a_en_wb', I.EN_BASE, 'debt', G.enDebt], ['a_realestate', 'a_re_wb', I.RE_BASE, 'exitCap', G.reCap], ['a_ai', 'a_ai_wb', I.AI_BASE, 'cost', G.aiCost], ['a_saas', 'a_sa_wb', I.SA_BASE, 'nrr', G.saNrr]]) {
      const st = QUEST_BY_ID[qid].steps.find((s) => s.id === sid);
      ok(st.goal.check({}, { ...base, [key]: val }), `${sid} solvable`);
      const defaults = Object.fromEntries(MODELS[st.model].inputs.map((i) => [i.k, i.val]));
      ok(!st.goal.check({}, defaults), `${sid} requires exploration`);
    }
    ok(F.solarProject(solarParams({ ...I.EN_BASE, debt: G.enDebt })).minDscr >= 1.3 && F.solarProject(solarParams({ ...I.EN_BASE, debt: G.enDebt + 5 })).minDscr < 1.3, 'debt goal is the maximum');
  });
  test('Consulting: market 25,480 bn, share 2.0%, plan needs ~4.7%; payback 1.33, NPV 44.23; fees 480k, margin 60.1%', () => {
    approx(CS.MKT.size, 25480, 1e-6); approx(CS.MKT.share, 510 / 25480, 1e-12); ok(CS.MKT.planShare > 0.046 && CS.MKT.planShare < 0.048);
    approx(CS.TR.payback, 24 / 18, 1e-12); approx(CS.TR.npv, 44.234, 1e-3);
    approx(CS.ENG.standard, 480000); approx(CS.ENG.margin, 259500 / 432000, 1e-12);
  });
  test('Consulting workbench goal: 80% realization is the minimum for ≥55% margin, and requires exploration', () => {
    eq(CS.ENG_GOAL, 80);
    ok(F.engagementEconomics(engagementParams({ ...CS.ENG_BASE, realization: 79 })).margin < 0.55);
    const st = QUEST_BY_ID.k_cs_economics.steps.find((s) => s.id === 'k_cse_wb');
    ok(st.goal.check({}, { ...CS.ENG_BASE, realization: 80 })); ok(!st.goal.check({}, CS.ENG_BASE));
  });
  test('IM: target 36,000, upside 20%, cash conversion 75%; 60/40 = 7.6% / 11.52%; duration −7%; active 2.7%', () => {
    approx(IM.RS.target, 36000); approx(IM.RS.upside, 0.2, 1e-12); approx(IM.RS.cashConv, 0.75);
    approx(IM.PF.ret, 0.076, 1e-12); approx(IM.PF.vol, Math.sqrt(0.0132768), 1e-12); approx(IM.BOND.dur, -0.07, 1e-12); approx(IM.ATTR.active, 0.027, 1e-12);
  });
  test('IM workbench goal: 45% equities is the max under a 10% vol limit, and requires exploration', () => {
    eq(IM.PF_GOAL, 45);
    ok(F.portfolio2(portParams({ ...IM.PF_BASE, w: 50 })).vol > 0.1);
    const st = QUEST_BY_ID.k_im_portfolio.steps.find((s) => s.id === 'k_imp_wb');
    ok(st.goal.check({}, { ...IM.PF_BASE, w: 45 })); ok(!st.goal.check({}, IM.PF_BASE));
  });
  test('Six career tracks, each with office, mentor and 3-mission chain', () => { eq(Object.keys(CAREERS).length, 6); for (const c of Object.values(CAREERS)) { ok(LOCATIONS[c.office] && NPCS[c.mentor]); eq(c.missions.length, 3); } });
  test('Macro events unlock after the first mission of EVERY career track', () => { for (const [k, c] of Object.entries(CAREERS)) ok(QUEST_BY_ID.k_macro_rates.reqAny.includes(c.mission), `macro gate missing for ${k}`); });
  test('Consulting is a full career track (office, mentor, ladder ending at Partner)', () => { const c = CAREERS.cs; ok(LOCATIONS[c.office] && NPCS[c.mentor]); eq(c.ranks[c.ranks.length - 1], 'Partner'); eq(QUEST_BY_ID.k_cs_transform.req[0], 'k_cs_cdd'); });
  test('Extended Hall: 21 case files across all mandatory categories; every mission links back to its file', () => {
    eq(Object.keys(CASES).length, 21);
    const cats = new Set(Object.values(CASES).map((c) => c.category));
    for (const c of ['Classic & Legendary M&A', 'Private Equity & Complex Buyouts', 'Healthcare & Pharmaceutical M&A', 'Education M&A', 'Renewable Energy & Infrastructure', 'Real Estate & Hospitality', 'AI, Technology & Venture', 'Keyrus Deal Academy']) ok(cats.has(c), c);
    for (const [id, c] of Object.entries(CASES)) if (c.mission) { ok(QUEST_BY_ID[c.mission], c.mission); eq(QUEST_BY_ID[c.mission].case, id); ok(ITEMS[c.artifact], c.artifact); }
  });
  test('Case files never state simulation numbers as facts (no "[Simulation" text inside fact items)', () => {
    for (const c of Object.values(CASES)) for (const s of c.sections) for (const [lb, t] of s.items) if (lb === 'fact') ok(!/Simulation|giả định/i.test(t), t);
  });
  test('Case mission answers: AOL 157.5; Activision ~45%; CVR 4.5 / 106.5; Hilton 3.5x & ~12.1%; TXU 13.3x; Whole Foods ~27%; Arcadium ~90%', () => {
    approx(CA.aolTw, 157.5, 1e-9); approx(CA.actPrem, 45.26, 0.05); approx(CA.cvrEv, 4.5); approx(CA.celgPkg, 106.5);
    approx(CA.hiltonMoic, 3.5, 1e-12); approx(CA.hiltonIrr, (3.5 ** (1 / 11) - 1) * 100, 1e-4); approx(CA.txuLev1, 40 / 3, 1e-12);
    approx(CA.wfmPrem, 26.89, 0.05); approx(CA.arcPrem, 89.94, 0.05);
  });
  test('every priority sector has an academy quest', () => { for (const s of Object.values(SECTORS)) ok(QUEST_BY_ID[s.quest] && QUEST_BY_ID[s.quest].kind === 'industry', s.quest); });
  test('every career has a 3-mission chain that exists', () => { for (const c of Object.values(CAREERS)) { eq(c.missions.length, 3); c.missions.forEach((m) => ok(QUEST_BY_ID[m] && QUEST_BY_ID[m].career === QUEST_BY_ID[c.mission].career, m)); } });
});

describe('Negotiation engine', () => {
  const cfg = QUEST_BY_ID.c_bakery.steps.find((s) => s.type === 'negotiate');
  test('Non-price term bridges the gap (335 + keep staff accepted)', () => ok(negotiateRound(cfg, initNegotiation(cfg), 335, ['keep_staff']).accepted));
  test('Same price without term is rejected and countered above reservation', () => { const r = negotiateRound(cfg, initNegotiation(cfg), 335, []); ok(!r.accepted); ok(r.state.ask >= cfg.reservation && r.state.ask < 500); });
  test('Insulting offer costs 30 trust', () => { const r = negotiateRound(cfg, initNegotiation(cfg), 250, []); ok(r.insult); eq(r.state.trust, 30); });
  test('After max rounds the counterparty makes a final offer', () => { let s = initNegotiation(cfg); for (let i = 0; i < cfg.rounds; i++) s = negotiateRound(cfg, s, 300, []).state; ok(s.final || s.ended); });
  test('Sell-side: buyer accepts at or below its max', () => { const c = QUEST_BY_ID.k_ib_mandate.steps.find((s) => s.type === 'negotiate'); ok(negotiateRound(c, initNegotiation(c), 508, []).accepted); ok(!negotiateRound(c, initNegotiation(c), 520, []).accepted); ok(negotiateRound(c, initNegotiation(c), 514, ['excl']).accepted); });
});

describe('Input parsing (Vietnamese & English number formats)', () => {
  test('vi decimal comma', () => approx(parseNum('57,5'), 57.5));
  test('vi thousands dot resolves toward expected', () => approx(parseNum('1.079', 1079), 1079));
  test('en decimal', () => approx(parseNum('2.51', 2.51), 2.51));
  test('negative percent', () => approx(parseNum('-2,05%'), -2.05));
  test('garbage → NaN', () => ok(Number.isNaN(parseNum('abc'))));
});

// ---------------- full progression simulation ----------------
async function playAll(ids, score = 1) { for (const id of ids) { const q = QUEST_BY_ID[id]; ok(St.questStatus(q) === 'available', `${id} should be available (is ${St.questStatus(q)})`); await St.completeQuest(id, { score, fx: [], graded: 3 }); } }

describe('Quest progression, save/load, rewards, New Game+', () => {
  testAsync('full vertical slice playthrough with persistence and NG+', async () => {
    Save.useMemoryBackend();
    await St.startGame('Test', 'standard', null);
    const S = St.S;
    eq(S.tl.chapter, 'child');
    ok(St.questStatus(QUEST_BY_ID.c_lemonade) === 'locked', 'lemonade locked before dinner');
    await playAll(['c_dinner']);
    const xp1 = S.tl.stats.xp;
    const dup = await St.completeQuest('c_dinner', { score: 1, fx: [{ xp: 999 }] });
    ok(dup.duplicate, 'duplicate completion rejected'); eq(S.tl.stats.xp, xp1, 'no duplicated rewards');
    await playAll(['c_lemonade', 'c_piggy', 'c_bakery']);
    eq(S.tl.chapter, 'uni', 'transition to university');
    ok(S.account.items.decor_lemon && S.account.items.outfit_bakery, 'account-level items granted');
    await playAll(['u_professor', 'u_valuation', 'u_network', 'u_rival']);
    eq(S.tl.chapter, 'intern');
    ok(St.locationUnlocked('hall') && St.locationUnlocked('ibank'));
    await playAll(['i_day1', 'i_model', 'i_comps', 'i_deadline', 'i_credit', 'h_disney', 'h_rjr', 'h_keyrus']);
    ok(S.account.ach.case_scholar, 'case scholar achievement');
    await playAll(['i_review']);
    eq(S.tl.chapter, 'career'); ok(S.tl.checkpoint && S.tl.checkpoint.career === null, 'graduation checkpoint saved');
    ok(St.questStatus(QUEST_BY_ID.k_ib_mandate) === 'locked', 'career mission locked before choosing');
    // Industry academies & specialization
    ok(St.questStatus(QUEST_BY_ID.a_saas) === 'locked', 'SaaS academy requires AI academy');
    ok(St.setSpecialization('healthcare'), 'cannot specialize before completing the academy');
    await St.completeQuest('a_healthcare', { score: 0.5, fx: [] });
    ok(St.setSpecialization('healthcare'), 'needs ≥ 60% competence');
    await playAll(['a_ai', 'a_saas', 'a_education']);
    const trustBefore = S.tl.rel.minhanh.trust;
    eq(St.setSpecialization('ai', 'education'), null); eq(S.tl.spec.primary, 'ai');
    eq(S.tl.rel.minhanh.trust, trustBefore + 10, 'specializing builds trust with the sector mentor');
    ok(St.setSpecialization('ai', 'ai'), 'secondary must differ');
    ok(credibility(S.tl, 'ai') > credibility(S.tl, 'saas'), 'primary focus raises credibility');
    eq(St.setSpecialization('generalist'), null, 'generalist after ≥3 academies');
    eq(St.setSpecialization('ai', 'education'), null);
    eq(S.tl.rel.minhanh.trust, trustBefore + 10, 'mentor trust bonus is not repeatable by re-selecting');
    await St.chooseCareer('ib');
    ok(!(await St.chooseCareer('pe')), 'career choice is final within timeline');
    ok(St.questStatus(QUEST_BY_ID.k_pe_lbo) === 'locked', 'other track missions hidden');
    S.tl.stats.rep = 30;
    await playAll(['k_ib_mandate']);
    eq(S.tl.stats.rep, 30 + 2, 'no sector credibility bonus outside specialization (IB healthcare, spec = AI)');
    await playAll(['k_macro_rates', 'k_macro_recession']);
    eq(S.tl.macro.rate, 'high'); eq(S.tl.macro.regime, 'recession');
    ok(St.questStatus(QUEST_BY_ID.k_review) === 'locked', 'review needs the whole career mission chain');
    await playAll(['k_ib_cim', 'k_ib_pitch']);
    ok(St.questStatus(QUEST_BY_ID.k_review) === 'available', 'review unlocks after chain');
    // k_review uses its outcome to promote
    const rev = QUEST_BY_ID.k_review.steps[0].eval({}, S, 1);
    await St.completeQuest('k_review', { score: rev.score, fx: [rev.fx] });
    eq(S.tl.status, 'complete'); ok(S.tl.career.rankIdx >= 2, 'promotion earned by competence');
    // save / load round-trip
    const before = JSON.stringify(S.tl);
    await St.flush();
    St.__setState(null, null);
    ok(await St.boot(), 'boot from save');
    eq(JSON.stringify(St.S.tl), before, 'timeline restored exactly');
    // New Game+
    const firstId = St.S.tl.id;
    const nid = await St.branchFromCheckpoint(firstId);
    ok(nid && nid !== firstId);
    eq(St.S.tl.chapter, 'career'); eq(St.S.tl.career, null); ok(St.S.tl.questsDone.i_review && !St.S.tl.questsDone.k_ib_mandate, 'branch keeps pre-career history only');
    ok(St.playedTracks().has('ib'));
    await St.chooseCareer('pe');
    ok(St.questStatus(QUEST_BY_ID.k_pe_lbo) === 'available');
    ok(St.S.account.items.outfit_bakery, 'cosmetics shared across timelines');
    eq(St.S.account.timelines.length, 2);
    await St.switchTimeline(firstId); eq(St.S.tl.career.track, 'ib', 'switch back to first timeline');
  });

  testAsync('Career switch: gated, retry on failure, rank mapping, reputation trade-off, post-switch review', async () => {
    Save.useMemoryBackend();
    await St.startGame('Switcher', 'standard', null);
    const S = St.S;
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival', 'i_day1', 'i_model', 'i_comps', 'i_deadline', 'i_credit', 'i_review']) await St.completeQuest(id, { score: 1, fx: [] });
    await St.chooseCareer('ib');
    ok(St.questStatus(QUEST_BY_ID.x_ib_pe) === 'locked', 'headhunter waits for the first-year review');
    S.tl.stats.rep = 40;
    for (const id of ['k_ib_mandate', 'k_ib_cim', 'k_ib_pitch', 'k_macro_rates', 'k_macro_recession']) await St.completeQuest(id, { score: 1, fx: [] });
    const rev = QUEST_BY_ID.k_review.steps[0].eval({}, S, 1); await St.completeQuest('k_review', { score: rev.score, fx: [rev.fx] });
    eq(S.tl.status, 'complete');
    ok(St.questStatus(QUEST_BY_ID.x_ib_pe) === 'available' && St.questStatus(QUEST_BY_ID.x_ib_cd) === 'available');
    ok(St.questStatus(QUEST_BY_ID.x_cs_pe) === 'locked', 'only paths from the current track');
    ok(!St.currentObjective().text.startsWith('Chuyển ngành'), 'switching is an option, not an objective');
    // failed interview → retry, nothing granted
    const out = QUEST_BY_ID.x_ib_pe.steps.find((s) => s.type === 'outcome');
    const fail = out.eval({ vars: { accept: 'yes' } }, S, 0.4); ok(fail.retry);
    const xp = S.tl.stats.xp; const r = await St.completeQuest('x_ib_pe', { score: 0.4, retry: true, fx: [] });
    ok(r.retry && !S.tl.questsDone.x_ib_pe && S.tl.stats.xp === xp, 'retry grants nothing and keeps quest open');
    ok(out.eval({ vars: { accept: 'push' } }, S, 0.8).retry, 'pushing for a higher title needs an excellent interview');
    ok(out.eval({ vars: { accept: 'no' } }, S, 1).retry, 'declining keeps the door open');
    // successful switch
    const oldRank = S.tl.career.rankIdx, rep = S.tl.stats.rep;
    const pass = out.eval({ vars: { accept: 'yes' } }, S, 0.9);
    await St.completeQuest('x_ib_pe', { score: 0.9, fx: [pass.fx] });
    eq(S.tl.career.track, 'pe'); eq(S.tl.career.rankIdx, St.mapRank('ib', oldRank, 'pe', 1)); eq(S.tl.career.history[0].track, 'ib');
    eq(S.tl.stats.rep, Math.round(rep * 0.7) + 0, 'keeps 70% of reputation'); eq(S.tl.status, 'active'); eq(S.tl.loc, 'office_pe');
    ok(S.account.ach.career_switch);
    ok(St.questStatus(QUEST_BY_ID.x_ib_cd) === 'locked', 'one switch per timeline');
    ok(St.questStatus(QUEST_BY_ID.k_pe_lbo) === 'available', 'new track chain unlocked');
    ok(St.questStatus(QUEST_BY_ID.k_review2) === 'locked');
    for (const id of ['k_pe_lbo', 'k_pe_100day', 'k_pe_exit']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(St.questStatus(QUEST_BY_ID.k_review2) === 'available');
    const rank = S.tl.career.rankIdx; const r2 = QUEST_BY_ID.k_review2.steps[0].eval({}, S, 1);
    await St.completeQuest('k_review2', { score: r2.score, fx: [r2.fx] });
    eq(S.tl.career.rankIdx, rank + 1); eq(S.tl.status, 'complete');
  });
  test('Rank mapping is relative seniority minus penalty, clamped', () => { eq(St.mapRank('ib', 3, 'pe', 1), 3); eq(St.mapRank('ib', 0, 'pe', 1), 0); eq(St.mapRank('cd', 6, 'im', 0), 4); eq(St.mapRank('pe', 1, 'vc', 0), 1); });
  test('Every switch path has a quest whose interview answers are correct', () => { for (const p of PATHS) { const q = QUEST_BY_ID[`x_${p.from}_${p.to}`]; ok(q && CAREERS[p.from] && CAREERS[p.to]); } approx(TA.LBO_T.moic, 3); approx(TA.LBO_T.irr, 3 ** 0.2 - 1, 1e-9); approx(TA.VAL_T.equity, 700); approx(TA.PORT_T.sharpe, 0.5, 1e-12); approx(TA.VEN_T.pct, 0.25); });
  testAsync('Endgame: leap, firm, fund, team from relationships, platform, crisis, legacy, Fund II', async () => {
    Save.useMemoryBackend();
    await St.startGame('Founder', 'standard', null);
    const S = St.S;
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival', 'i_day1', 'i_model', 'i_comps', 'i_deadline', 'i_credit', 'i_review']) await St.completeQuest(id, { score: 1, fx: [] });
    await St.chooseCareer('pe'); S.tl.stats.rep = 40; S.tl.stats.ethics = 15;
    ok(St.questStatus(QUEST_BY_ID.e_leap) === 'locked', 'endgame waits for the first-year review');
    for (const id of ['k_pe_lbo', 'k_pe_100day', 'k_pe_exit', 'k_macro_rates', 'k_macro_recession']) await St.completeQuest(id, { score: 1, fx: [] });
    const rev = QUEST_BY_ID.k_review.steps[0].eval({}, S, 1); await St.completeQuest('k_review', { score: rev.score, fx: [rev.fx] });
    ok(St.questStatus(QUEST_BY_ID.e_leap) === 'available'); ok(!St.locationUnlocked('firm'));
    ok(St.currentObjective().quest === 'e_leap', 'endgame becomes the next objective');
    const leap = QUEST_BY_ID.e_leap.steps.find((s) => s.type === 'outcome').eval({}, S, 1);
    await St.completeQuest('e_leap', { score: leap.score, fx: [leap.fx] });
    eq(S.tl.career.rankIdx, CAREERS.pe.ranks.length - 1, 'excellent record + clean ethics → top of the ladder'); eq(S.tl.age, 32);
    ok(St.locationUnlocked('firm')); ok(St.questStatus(QUEST_BY_ID.x_pe_vc) === 'locked', 'no career switch during endgame');
    eq(St.npcLocation('an'), 'firm');
    const fundOut = QUEST_BY_ID.e_fund.steps.find((s) => s.type === 'outcome').eval({ vars: { e_fund_neg: { deal: true, price: 185 } } }, S, 1);
    await St.completeQuest('e_fund', { score: 1, fx: [fundOut.fx] });
    eq(S.tl.flags.fund_size, 250, '150 + rep 50 + ethics 25 + LP deal 25'); eq(S.tl.flags.fund_fee, 185); ok(S.account.ach.founder);
    // relationships decide who joins
    S.tl.rel.mai = { trust: 10, respect: 10 }; S.tl.rel.vy = { trust: 2, respect: 2 }; S.tl.flags.credit_private = true;
    eq(recruits(S.tl).map((r) => r[0]), ['mai', 'duc']);
    const teamOut = QUEST_BY_ID.e_team.steps.find((s) => s.type === 'outcome').eval({}, S, 1);
    await St.completeQuest('e_team', { score: 1, fx: [teamOut.fx] });
    eq(St.npcLocation('mai'), 'firm'); eq(St.npcLocation('vy'), null); eq(S.tl.flags.team_size, 4);
    ok(St.questStatus(QUEST_BY_ID.e_crisis) === 'locked', 'crisis follows the platform');
    S.tl.spec = { primary: 'healthcare', secondary: null };
    const platOut = QUEST_BY_ID.e_platform.steps.find((s) => s.type === 'outcome').eval({ vars: { sector: 'spec' } }, S, 1);
    ok(/Healthcare/.test(platOut.text)); await St.completeQuest('e_platform', { score: 1, fx: [platOut.fx] });
    await St.completeQuest('e_crisis', { score: 1, fx: [] });
    ok(St.questStatus(QUEST_BY_ID.e_legacy) === 'locked', 'legacy needs the 10-year fund run');
    const sim = FS.createSim({ committed: S.tl.flags.fund_size, feeBps: S.tl.flags.fund_fee, spec: 'healthcare' });
    for (let y = 1; y <= 10; y++) { for (const id of ({ 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] })[y] || []) FS.invest(sim, id); FS.advance(sim); }
    const simOut = QUEST_BY_ID.e_sim.steps.find((s) => s.type === 'outcome').eval({ vars: { sim: sim.result } }, S, 1);
    ok(/net TVPI/.test(simOut.text)); await St.completeQuest('e_sim', { score: simOut.score, fx: [simOut.fx] });
    eq(S.tl.flags.fund_quartile, sim.result.quartile); ok(S.tl.flags.fund_tvpi > 1);
    ok(St.questStatus(QUEST_BY_ID.e_legacy) === 'available');
    const legOut = QUEST_BY_ID.e_legacy.steps.find((s) => s.type === 'outcome').eval({ vars: { succ: 'an', legacy: 'education' } }, S, 1);
    ok(/Tiệm Bánh Mây Hồng/.test(legOut.text)); await St.completeQuest('e_legacy', { score: 1, fx: [legOut.fx] });
    ok(S.account.ach.capital_architect && S.account.items.artifact_legacy);
    ok(St.questStatus(QUEST_BY_ID.e_fund2) === 'available', 'ongoing objective after legacy');
    eq(St.questsForObject('firm', 'lp_table').map((q) => q.id), ['e_fund2'], 'the LP table now hosts Fund II');
    await St.completeQuest('e_fund2', { score: 1, fx: [{ flags: { fund2_size: 350 } }] }); ok(S.account.ach.fund_two);
    ok(St.questStatus(QUEST_BY_ID.e_sim2) === 'available', 'Fund II simulation follows');
    const sim2 = FS.createSim({ scenario: 'fund2', committed: S.tl.flags.fund2_size });
    for (let y = 1; y <= 10; y++) { for (const id of ({ 1: ['g1', 'g2'], 2: ['g4', 'g5'], 5: ['g13', 'g14', 'g15'] })[y] || []) FS.invest(sim2, id); FS.advance(sim2); }
    const o2 = QUEST_BY_ID.e_sim2.steps.find((s) => s.type === 'outcome').eval({ vars: { sim: sim2.result } }, S, 1);
    ok(/Fund II kết thúc/.test(o2.text) && /Fund I/.test(o2.text)); await St.completeQuest('e_sim2', { score: o2.score, fx: [o2.fx] });
    eq(S.tl.flags.fund2_quartile, 1); ok(S.account.ach.two_cycles, 'both funds top quartile');
  });
  test('Endgame answers: fund 180 / carry 50 / net 2.0x; budget 0.65; blended 8.67x, arbitrage 40; bid 16.7% below value', () => {
    approx(EG.FUND.invested, 180); approx(EG.FUND.carry, 50); approx(EG.FUND.netTvpi, 2); approx(EG.BUDGET.left, 0.65, 1e-12);
    approx(EG.BB.blended, 26 / 3, 1e-12); approx(EG.BB.arbitrage, 40); approx(EG.HOSTILE.gap, 1 / 6, 1e-12);
  });
  test('Weak record does not reach the top rank at the leap', () => {
    const tl = { career: { track: 'ib', rankIdx: 2 }, questsDone: { k_ib_mandate: { score: 0.5 } }, stats: { ethics: 0 } };
    const r = QUEST_BY_ID.e_leap.steps.find((s) => s.type === 'outcome').eval({}, { tl }, 0.5); eq(r.fx.career.setRank, CAREERS.ib.ranks.length - 3);
  });
  test('Crisis answers: inflation 9 → 12.62; FX debt 1,375 / 4.58x; uninsured 11.75; oil 10.4 / 17.12; breach 30; key-person 80; fraud write-down 80; tuition gap 31.0', () => {
    approx(CR.INF.noPrice, 9, 1e-12); approx(CR.INF.priced, 102.96 - 65.34 - 25, 1e-9);
    approx(CR.FX.debt1, 1375, 1e-9); approx(CR.FX.lev1, 1375 / 300, 1e-12); approx(CR.BANK.uninsured, 11.75, 1e-12);
    approx(CR.OIL.noClause, 10.4, 1e-9); approx(CR.OIL.withClause, 17.12, 1e-9); approx(CR.CYBER.cost, 30, 1e-12);
    approx(CR.KEY.atRisk, 80, 1e-9); approx(CR.FRAUD.writeDown, 80, 1e-9); approx(CR.REG.gap, 100 * (1.08 ** 5 - 1.03 ** 5), 1e-9);
  });
  testAsync('Crises are state-triggered, optional, persistent in consequences, and award Crisis Manager', async () => {
    Save.useMemoryBackend();
    await St.startGame('Crisis', 'standard', null);
    const S = St.S;
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival', 'i_day1', 'i_model', 'i_comps', 'i_deadline', 'i_credit', 'i_review']) await St.completeQuest(id, { score: 1, fx: [] });
    await St.chooseCareer('ib');
    ok(St.questStatus(QUEST_BY_ID.cr_inflation) === 'locked', 'macro crises wait for the recession scenario');
    for (const id of ['k_ib_mandate', 'k_macro_rates', 'k_macro_recession']) await St.completeQuest(id, { score: 1, fx: [] });
    for (const id of ['cr_inflation', 'cr_fx', 'cr_bank', 'cr_oil']) ok(St.questStatus(QUEST_BY_ID[id]) === 'available', id);
    ok(St.questStatus(QUEST_BY_ID.cr_fraud) === 'locked', 'firm crises need your own fund');
    ok(!/khủng hoảng|Lạm phát/i.test(St.currentObjective().text) || St.currentObjective().quest.startsWith('k_'), 'crises are optional, not the main objective');
    for (const id of ['cr_inflation', 'cr_fx', 'cr_bank', 'cr_oil']) await St.completeQuest(id, { score: 1, fx: [] });
    for (const id of ['k_ib_cim', 'k_ib_pitch']) await St.completeQuest(id, { score: 1, fx: [] });
    S.tl.stats.rep = 40;
    const rev = QUEST_BY_ID.k_review.steps[0].eval({}, S, 1); await St.completeQuest('k_review', { score: rev.score, fx: [rev.fx] });
    await St.completeQuest('e_leap', { score: 1, fx: [{ flags: { endgame: true } }] });
    await St.completeQuest('e_fund', { score: 1, fx: [{ flags: { fund_size: 200 } }] });
    for (const id of ['cr_cyber', 'cr_keyperson', 'cr_fraud', 'cr_regulation']) ok(St.questStatus(QUEST_BY_ID[id]) === 'available', id);
    const hide = QUEST_BY_ID.cr_fraud.steps.find((s) => s.id === 'cr_fr_act').opts[1].fx;
    const trust = S.tl.rel.tung.trust;
    await St.completeQuest('cr_fraud', { score: 0.3, fx: [hide] });
    ok(S.tl.flags.fraud_hidden && S.tl.rel.tung.trust === trust - 25, 'covering up fraud damages the LP relationship');
    const fund2Says = QUEST_BY_ID.e_fund2.steps.filter((s) => s.type === 'say' && s.when && s.when({}, S));
    ok(fund2Says.some((s) => /không tái cam kết/.test(s.lines[0][1])), 'the LP remembers at Fund II');
    for (const id of ['cr_cyber', 'cr_keyperson', 'cr_regulation']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(S.account.ach.crisis_manager, 'all 8 crises handled');
  });
  test('Succession answers: successor carry 12.5; vested after 3 of 5 years 7.5', () => { approx(SU.CARRY.successorAmt, 12.5); approx(SU.CARRY.vestedAfter3, 7.5); });
  test('Epilogue reflects relationships and decisions', () => {
    const tl = { rel: { khoa: { trust: 15, respect: 10 }, mai: { trust: 0, respect: 0 }, victor: { trust: 0, respect: 0 } }, flags: { bakery_owned: true, hired_vy: true, credit_private: true, successor: 'an', handover: 'success', legacy: 'education' }, stats: {} };
    const e = epilogue(tl, 'Linh').join(' ');
    ok(/30 cửa hàng/.test(e) && /General Partner/.test(e) && /Managing Partner/.test(e) && /mentor cho analyst/.test(e) && /quầy nước chanh/.test(e));
    const e2 = epilogue({ rel: {}, flags: { successor: 'star', fraud_hidden: true }, stats: {} }).join(' ');
    ok(/văn hoá quỹ thay đổi/.test(e2) && /vết đen/.test(e2) && /gật đầu chào/.test(e2));
  });
  testAsync('Successor arc: branch by choice, converge on governance, readiness decides handover, epilogue ends the story', async () => {
    Save.useMemoryBackend();
    await St.startGame('Heir', 'standard', null);
    const S = St.S;
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival', 'i_day1', 'i_model', 'i_comps', 'i_deadline', 'i_credit', 'i_review']) await St.completeQuest(id, { score: 1, fx: [] });
    await St.chooseCareer('pe');
    for (const id of ['k_pe_lbo', 'k_pe_100day', 'k_pe_exit', 'k_macro_rates', 'k_macro_recession', 'k_review', 'e_leap', 'e_fund', 'e_team', 'e_platform', 'e_crisis', 'e_sim']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(St.questStatus(QUEST_BY_ID.s_coach) === 'locked', 'successor arc follows the legacy chapter');
    await St.completeQuest('e_legacy', { score: 1, fx: [{ flags: { legacy_done: true, legacy: 'education', successor: 'star' } }] });
    ok(St.questStatus(QUEST_BY_ID.s_star) === 'available' && St.questStatus(QUEST_BY_ID.s_coach) === 'locked' && St.questStatus(QUEST_BY_ID.s_none) === 'locked', 'only the matching branch opens');
    ok(['e_fund2', 's_star'].includes(St.currentObjective().quest), 'successor arc is part of the main objectives (alongside Fund II)');
    const fix = QUEST_BY_ID.s_star.steps.find((s) => s.id === 's_star_act').opts[1].fx;
    await St.completeQuest('s_star', { score: 1, fx: [fix] });
    eq(S.tl.flags.successor, 'an'); ok(St.questStatus(QUEST_BY_ID.s_coach) === 'available', 'changing successor opens the coaching story');
    ok(St.questStatus(QUEST_BY_ID.s_governance) === 'available', 'any branch unlocks governance');
    const gov = QUEST_BY_ID.s_governance.steps.find((s) => s.type === 'outcome').eval({}, S, 1);
    await St.completeQuest('s_governance', { score: 1, fx: [gov.fx] }); eq(S.tl.flags.gov_score, 1);
    // readiness without coaching: successor an (1) + gov (1) + ethics (stats.ethics 8 ≥ 10? no) → 2 → partial
    eq(readiness(S.tl), 2);
    const ho = QUEST_BY_ID.s_handover.steps.find((s) => s.type === 'outcome');
    eq(ho.eval({ vars: { intervene: 0 } }, S).fx.flags.handover, 'partial');
    S.tl.flags.an_coached = true; S.tl.flags.coach_style = 'coach'; S.tl.stats.ethics = 15;
    eq(readiness(S.tl), 5);
    eq(ho.eval({ vars: { intervene: 1 } }, S).fx.flags.handover, 'success', 'readiness 5 − intervention 1 = 4 still succeeds');
    const res = ho.eval({ vars: { intervene: 0 } }, S); await St.completeQuest('s_handover', { score: res.score, fx: [res.fx] });
    eq(S.tl.flags.handover, 'success');
    const epi = QUEST_BY_ID.s_epilogue.steps.find((s) => s.type === 'outcome').eval({ vars: { advice: 'value' } }, S);
    ok(/ĐOẠN KẾT/.test(epi.text) && /Managing Partner/.test(epi.text));
    await St.completeQuest('s_epilogue', { score: 1, fx: [epi.fx] });
    ok(S.account.ach.passing_torch && S.account.items.decor_lemonstand && S.tl.flags.epilogue_done);
  });
  testAsync('Bakery outcome: discipline vs overpaying vs walking away', async () => {
    const step = QUEST_BY_ID.c_bakery.steps.find((s) => s.type === 'outcome');
    const S = { tl: { flags: {} } };
    const good = step.eval({ vars: { c_bakery_neg: { deal: true, price: 330, issues: ['keep_staff'] } }, flags: { saw_oven: true } }, S);
    ok(good.fx.ach.includes('disciplined_buyer'));
    const bad = step.eval({ vars: { c_bakery_neg: { deal: true, price: 420, issues: [] } }, flags: {} }, S);
    ok(!bad.fx.ach.includes('disciplined_buyer') && /lò nướng hỏng/.test(bad.text));
    const walk = step.eval({ vars: { c_bakery_neg: { deal: false, lastAsk: 360 } }, flags: {} }, S);
    ok(walk.fx.ach.includes('walk_away'));
  });

  testAsync('Spaced repetition: wrong → due, correct streak → mastered', async () => {
    const now = 1e12;
    St.recordAnswer('x1', 'dcf', 'u_valuation', false, false, now);
    ok(St.dueReviews(now).some((d) => d.id === 'x1'));
    St.recordAnswer('x1', 'dcf', 'u_valuation', true, false, now);
    ok(!St.dueReviews(now).some((d) => d.id === 'x1'), 'scheduled into the future after correct');
    St.recordAnswer('x2', 'lbo', 'k_pe_lbo', true, true, now);
    ok(St.dueReviews(now).some((d) => d.id === 'x2'), '"Not sure" answers come back');
  });
});

describe('Hall of Legendary Deals — extended', () => {
  test('Archive case missions: LinkedIn ~49.5% & 7.3x; EMC 33.04; VMware 151.2; HCA DPI 0.81x; Seagen 58.8%; Aetna 207.0; Duke 59.4 & 26.3; PowerSchool 8x; Neoen 2,800 MW; 10%', () => {
    approx(C2.lnkdPrem, 49.5, 0.05); approx(C2.lnkdEvRev, 7.28, 0.01); approx(C2.emcPkg, 33.041, 1e-9); approx(C2.vmwStock, 151.2, 1e-9);
    approx(C2.hcaDpi, 0.811, 0.001); approx(C2.seagenFill, 58.82, 0.01); approx(C2.aetnaPkg, 206.997, 0.001); approx(C2.dukeVal, 59.375, 1e-9);
    approx(C2.dukeCap, 26.316, 0.001); eq(C2.psEvArr, 8); approx(C2.neoenMw, 2800, 1e-9); approx(C2.anthPct, 10, 1e-9);
  });
  test('All 21 case files now have a mission, a unique artifact and a simulation note; no read-only files remain', () => {
    const cs = Object.values(CASES); eq(cs.filter((c) => c.mission).length, 21); eq(CASE2_IDS.length, 10);
    eq(new Set(cs.map((c) => c.artifact)).size, 21);
    for (const c of cs) ok(!/sẽ được bổ sung/.test(c.note), c.title);
    for (const id of CASE2_IDS) { const q = QUEST_BY_ID[id]; eq(q.kind, 'case'); ok(q.steps.some((s) => s.type === 'num' && /\[Simulation Assumption/.test(s.q)), id + ' labels simulated inputs'); }
  });
  test('Replay answers: Pixar 50.6 USD, 12.1% ownership, 79.7% equity, 150m EBIT, −5.1% EPS; WFM 41.8 < 42, 13.8bn, 12.5x, +6.3%, −0.9%', () => {
    approx(RP.disIbVal, 50.6, 1e-9); approx(RP.disCdOwn, 12.13, 0.01); approx(RP.disPeEq, 79.73, 0.01); eq(RP.disCsEbit, 150); approx(RP.disImEps, -5.10, 0.01);
    approx(RP.wfmIbRisk, 41.82, 1e-9); ok(RP.wfmIbRisk < 42, 'certain cash beats the risky higher bid'); approx(RP.wfmCdBuild, 13.8, 1e-9); approx(RP.wfmPeMult, 12.45, 0.01); approx(RP.wfmCsRev, 6.25, 1e-9); approx(RP.wfmImHit, -0.9, 1e-9);
    approx(parseNum('-5,1'), -5.1); approx(parseNum('−0,9'), -0.9);
  });
  test('Replay answers: Hilton 31.8% / 2.5bn / 0.99bn / 182.5m / 25x; Activision EV ~87.3 / 1.8bn / 19.6x / HHI 2,250 / spread 23.4%', () => {
    approx(RP.hilIbPrem, 31.76, 0.01); approx(RP.hilCdSyn, 2.5, 1e-9); approx(RP.hilPeGain, 0.99, 1e-9); approx(RP.hilCsFee, 182.5, 1e-9); approx(RP.hilImPe, 25, 1e-9);
    approx(RP.atvIbEv, 87.28, 0.01); ok(RP.atvIbEv < 95 && RP.atvIbEv > 65.4 + 3000 / 780, 'expected value sits between failure and success');
    approx(RP.atvCdRev, 1.8, 1e-9); approx(RP.atvPeMult, 19.63, 0.01); eq(RP.atvCsHhi, 2250); approx(RP.atvImSpread, 23.38, 0.01);
    eq(QUEST_BY_ID.r_hil_ib.req[0], 'h_hilton'); eq(QUEST_BY_ID.r_atv_im.req[0], 'h_activision');
  });
  test('Replay answers: TXU 83.3% recovery / 21bn / 3.2bn EBITDA / −200m / +50%; Celgene 22.2% / 30.0% / 3.2x / 3.1bn rNPV / 1.75x', () => {
    approx(RP.txuIbRec, 83.33, 0.01); approx(RP.txuCdVal, 21, 1e-9); approx(RP.txuPeEbitda, 3.2, 1e-9); approx(RP.txuCsHit, -200, 1e-9); approx(RP.txuImRet, 50, 1e-9);
    approx(RP.celIbProb, 22.22, 0.01); approx(RP.celCdOwn, 30.04, 0.01); approx(RP.celPeMoic, 3.2, 1e-9); approx(RP.celCsRnpv, 3.1, 1e-9); approx(RP.celImLev, 1.75, 1e-9);
    eq(QUEST_BY_ID.r_txu_im.req[0], 'h_txu'); eq(QUEST_BY_ID.r_cel_ib.req[0], 'h_celgene'); ok(GLOSSARY['Absolute Priority Rule'] && GLOSSARY['Fulcrum Security']);
    approx(parseNum('-200', -200), -200);
  });
  test('Replay answers: AOL 80.2% contribution / +47.5% EPS / 7.9x carve-out / 10.5bn synergy gap / 99bn impairment; RJR 0.7bn interest / 7.1x / 6% equity / 2.7bn / −20%', () => {
    approx(RP.aolIbContrib, 80.25, 0.01); approx(RP.aolCdEps, 47.52, 0.05); approx(RP.aolPeMult, 7.88, 0.01); approx(RP.aolCsGap, 10.5, 1e-9); eq(RP.aolImImp, 99);
    approx(RP.rjrIbInt, 0.7, 1e-9); approx(RP.rjrCdLev, 7.14, 0.01); ok(RP.rjrCdLev < 22 / 2.8, 'selling above current leverage de-levers'); approx(RP.rjrPeEq, 6, 1e-9); approx(RP.rjrCsVal, 2.7, 1e-9); approx(RP.rjrImLoss, -20, 1e-9);
    for (const t of ['Contribution Analysis', 'Carve-out', 'Goodwill Impairment', 'Bridge Loan', 'Event Risk Covenant']) ok(GLOSSARY[t], t);
    ok(CASES.aol_timewarner.sections.some((s) => s.items.some(([lb, t]) => lb === 'fact' && /Warner Music/.test(t))), 'carve-out fact is in the case file');
    ok(CASES.rjr_kkr.sections.some((s) => s.items.some(([lb, t]) => lb === 'fact' && /MetLife/.test(t))), 'bondholder suit fact is in the case file');
  });
  test('Every Hall case file now has a 5-lens replay; part-2 answers are finite and spot-checked', () => {
    for (const id of Object.keys(CASES)) ok(REPLAYS[id], 'replay for ' + id);
    eq(QUESTS.filter((q) => q.kind === 'replay').length, 105);
    for (const id of REPLAY_IDS) { const n = QUEST_BY_ID[id].steps.find((s) => s.type === 'num'); ok(Number.isFinite(n.a), id); ok(QUEST_BY_ID[id].steps.some((s) => (s.type === 'quiz' && s.a < s.opts.length) || (s.type === 'choice' && s.grade)), id); }
    approx(RP.key_cs, 3.78, 1e-9); approx(RP.key_ib, 5, 1e-9); approx(RP.unh_ib, 5, 1e-9); eq(RP.unh_cs, 300); approx(RP.unh_im, 2.72, 1e-9);
    approx(RP.rio_ib, -16.4, 1e-9); eq(RP.rio_cs, 12); approx(RP.lnk_ib, 8.9, 1e-9); eq(RP.lnk_cs, 400); eq(RP.dell_pe, 27);
    approx(RP.hca_im, 2.25, 1e-9); approx(RP.sea_im, 4.4, 1e-9); approx(RP.aet_ib, 196.9, 1e-9); approx(RP.duke_pe, -1.5, 1e-9);
    eq(RP.ps_cs, 107); approx(RP.neo_pe, 13.3, 1e-9); approx(RP.ant_ib, 16.25, 1e-9); approx(RP.ant_pe, 9, 1e-9);
    ok(REPLAYS.keyrus_vuealta.roles.im && /không phải dữ liệu của Keyrus/.test(QUEST_BY_ID.r_key_im.steps[0].lines[0][1]), 'Keyrus replay uses fictional numbers only');
  });
  test('Replays: 21 deals × 5 lenses; lenses map to career tracks; each replay is gated on its base case mission and labels simulated inputs', () => {
    eq(REPLAY_IDS.length, 105); eq(Object.keys(REPLAYS).length, 21); eq(LENS_ORDER.length, 5); eq(new Set(REPLAY_IDS).size, 105);
    for (const l of LENS_ORDER) ok(CAREERS[l] && NPCS[LENSES[l].npc], l);
    for (const [cid, r] of Object.entries(REPLAYS)) {
      ok(CASES[cid], cid);
      for (const l of LENS_ORDER) { const q = QUEST_BY_ID[r.quests[l]]; ok(q, r.quests[l]); eq(q.lens, l); eq(q.case, cid); eq(q.req[0], CASES[cid].mission); eq(r.map[l].length, 2); ok(q.steps.some((s) => s.type === 'num' && /\[Simulation Assumption/.test(s.q)), q.id); }
    }
  });
  testAsync('Replay: locked until the base case; home-lens bonus for the current career; five lenses award the achievement', async () => {
    Save.useMemoryBackend();
    await St.startGame('Lens', 'standard', null);
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival']) await St.completeQuest(id, { score: 1, fx: [] });
    eq(St.questStatus(QUEST_BY_ID.r_dis_ib), 'locked');
    await St.completeQuest('h_disney', { score: 1, fx: [] });
    eq(St.questStatus(QUEST_BY_ID.r_dis_ib), 'available');
    St.S.tl.career = { track: 'cs', rankIdx: 0, history: [] };
    const rep0 = St.S.tl.stats.rep;
    const g1 = await St.completeQuest('r_dis_ib', { score: 1, fx: [] });
    ok(!g1.gained?.homeLens && !(g1.homeLens), 'no bonus outside your track');
    const rep1 = St.S.tl.stats.rep;
    const g2 = await St.completeQuest('r_dis_cs', { score: 1, fx: [] });
    eq(St.S.tl.stats.rep - rep1, 1, 'home lens adds +1 Reputation'); ok(rep1 >= rep0);
    ok(!St.S.account.ach.five_lenses, 'not before all five');
    for (const id of ['r_dis_cd', 'r_dis_pe', 'r_dis_im']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(St.S.account.ach.five_lenses);
  });
  test('Fund II debrief reads crisis decisions: all-best earns GP vững vàng giữa bão; GP self-dealing costs ethics and LP trust', () => {
    const ev = QUEST_BY_ID.e_sim2.steps.find((s) => s.type === 'outcome').eval;
    const mk = (events) => ({ netTvpi: 2.1, netIrr: 0.12, quartile: 1, committed: 350, deployed: 0.8, largeCaps: 0, writeOffs: 0, events });
    const S0 = { tl: { flags: { fund_tvpi: 2.0, fund_quartile: 1 } } };
    const good = ev({ vars: { sim: mk([{ id: 'lp_squeeze', score: 1, title: 'A', out: 'x' }, { id: 'continuation', score: 1, title: 'B', out: 'y' }]) } }, S0, 1);
    ok(good.fx.ach.includes('storm_gp') && good.fx.ach.includes('two_cycles')); ok(good.fx.rel.tung.trust > 0); ok(!good.fx.stats);
    const bad = ev({ vars: { sim: mk([{ id: 'lp_squeeze', score: 1, title: 'A', out: 'x' }, { id: 'continuation', score: 0, title: 'B', out: 'y' }]) } }, S0, 1);
    ok(!bad.fx.ach.includes('storm_gp')); eq(bad.fx.stats.ethics, -15); ok(bad.score < good.score); ok(/B: y/.test(bad.text));
    const none = ev({ vars: { sim: mk([]) } }, S0, 1); ok(!none.fx.rel && none.fx.flags.fund2_crisis === null);
    ok(ACHIEVEMENTS.storm_gp && GLOSSARY['Denominator Effect'] && GLOSSARY['Continuation Vehicle']);
  });
  test('Fund III: fundraising teaches capital-weighted track record and value creation maths; debrief compares three funds', () => {
    const f3 = QUEST_BY_ID.e_fund3, s3 = QUEST_BY_ID.e_sim3; eq(f3.req[0], 'e_sim2'); eq(s3.req[0], 'e_fund3');
    approx(f3.steps.find((s) => s.id === 'e_f3_pool').a, 1.87, 1e-9); approx(f3.steps.find((s) => s.id === 'e_f3_vcp').a, 12.6, 1e-9);
    const ev = s3.steps.find((s) => s.type === 'outcome').eval;
    const S0 = { tl: { flags: { fund_tvpi: 2.1, fund_quartile: 1, fund2_tvpi: 2.0, fund2_quartile: 1 } } };
    const r = { netTvpi: 2.1, netIrr: 0.11, quartile: 1, committed: 500, deployed: 0.6, grossMoic: 2.8, vcps: 5, navLoan: 0, events: [{ id: 'refi_wall', score: 1, title: 'R', out: 'ok' }] };
    const o = ev({ vars: { sim: r } }, S0, 1); ok(o.fx.ach.includes('three_cycles') && o.fx.ach.includes('value_creator')); ok(/Ba quỹ/.test(o.text)); eq(o.fx.flags.fund3_quartile, 1);
    const n = ev({ vars: { sim: { ...r, navLoan: 30, vcps: 0, quartile: 2 } } }, S0, 1); ok(!n.fx.ach.length && n.fx.rel.tung.trust < 0 && /NAV loan/.test(n.text));
    for (const k of ['fund_three', 'three_cycles', 'value_creator']) ok(ACHIEVEMENTS[k], k);
    for (const t of ['Operating Partner', 'Refinancing Wall', 'NAV Loan', 'Value Creation Plan']) ok(GLOSSARY[t], t);
  });
  testAsync('Completing every Hall mission awards Hall Master (and not before)', async () => {
    Save.useMemoryBackend();
    await St.startGame('HallMaster', 'standard', null);
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival']) await St.completeQuest(id, { score: 1, fx: [] });
    const all = Object.values(CASES).map((c) => c.mission);
    for (const id of all.slice(0, -1)) { ok(St.questStatus(QUEST_BY_ID[id]) === 'available', id); await St.completeQuest(id, { score: 1, fx: [] }); }
    ok(!St.S.account.ach.hall_master, 'not before the last file');
    await St.completeQuest(all[all.length - 1], { score: 1, fx: [] });
    ok(St.S.account.ach.hall_master && St.S.account.items.artifact_neuron && St.S.account.cases.amzn_anthropic);
  });
  testAsync('Completing all 8 extended case missions awards Deal Historian', async () => {
    Save.useMemoryBackend();
    await St.startGame('Historian', 'standard', null);
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(St.questStatus(QUEST_BY_ID.h_aol) === 'available', 'unlocks with the Hall in chapter 3');
    for (const id of ['h_aol', 'h_activision', 'h_celgene', 'h_hilton', 'h_txu', 'h_wholefoods', 'h_change', 'h_arcadium']) await St.completeQuest(id, { score: 1, fx: [] });
    ok(St.S.account.ach.deal_historian && St.S.account.items.artifact_battery && St.S.account.cases.rio_arcadium);
  });
});

describe('Fund league table', () => {
  const mineA = { id: 'a', name: 'Dòng thời gian #1', track: 'pe', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 2.2, fund_irr: 14.1, fund_quartile: 1, fund2_size: 350, fund2_tvpi: 1.7, fund2_irr: 16.5, fund2_quartile: 2 }) };
  const mineB = { id: 'b', name: 'Dòng thời gian #2', track: 'ib', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 1.2, fund_irr: 3.0 }) };
  test('fundsOf reads only completed funds; pooled TVPI is capital-weighted', () => {
    eq(Object.keys(mineA.funds), ['f1', 'f2']); eq(Object.keys(LG.fundsOf({ fund_size: 200 })).length, 0); eq(mineB.funds.f1.q, 4, 'quartile derived when missing');
    approx(LG.pooled(mineA.funds).tvpi, (200 * 2.2 + 350 * 1.7) / 550, 1e-12); eq(LG.pooled(mineA.funds).q1, 1); eq(LG.pooled({}), null);
  });
  test('Each vintage ranks your funds among 10 fictional peers; quartiles follow the simulation thresholds', () => {
    for (const k of LG.FUND_KEYS) eq(LG.PEERS[k].length, 10);
    const r = LG.leagueRows([mineA, mineB], 'f1', 'tvpi'); eq(r.length, 12); eq(r.map((x) => x.rank), [...Array(12)].map((_, i) => i + 1));
    ok(r.every((x, i) => i === 0 || r[i - 1].tvpi >= x.tvpi)); const a = r.find((x) => x.tlId === 'a'); eq(a.q, 1); eq(a.rank, 2, 'only Mây Trắng I (2.45x) is ahead');
    eq(LG.leagueRows([mineA, mineB], 'f2').filter((x) => x.mine).length, 1, 'only timelines that finished that fund');
  });
  test('TVPI and IRR can rank the same fund differently (rank gap is reported)', () => {
    const g = LG.rankGap([mineA], 'f2')[0]; ok(g.irrRank < g.tvpiRank, JSON.stringify(g));
    const byIrr = LG.leagueRows([mineA], 'f2', 'irr'); ok(byIrr.every((x, i) => i === 0 || (byIrr[i - 1].irr ?? -1e9) >= (x.irr ?? -1e9)));
  });
  test('Pooled view compares GP consistency across funds, peers included by family', () => {
    const r = LG.leagueRows([mineA], 'pooled'); ok(r.some((x) => x.mine && x.n === 2)); ok(r.filter((x) => !x.mine).length >= 10);
    const may = r.find((x) => x.name === 'Mây Trắng Capital'); approx(may.tvpi, (250 * 2.45 + 450 * 2.21 + 600 * 1.98) / 1300, 1e-12); eq(may.n, 3);
  });
  test('League: DPI₇ and PME columns, sorting by them, and older saves without them sort last', () => {
    const withPme = { id: 'p', name: 'P', track: 'pe', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 1.9, fund_irr: 11, fund_dpi7: 1.1, fund_pme: 1.6 }) };
    const old = { id: 'o', name: 'O', track: 'ib', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 3.0, fund_irr: 20 }) };
    eq(withPme.funds.f1.pme, 1.6); eq(old.funds.f1.pme, null);
    const byPme = LG.leagueRows([withPme, old], 'f1', 'pme'); eq(byPme[byPme.length - 1].tlId, 'o'); eq(byPme.findIndex((r) => r.tlId === 'p'), 1, 'PME 1.6 is second, behind Mây Trắng I (1.74)');
    const byDpi = LG.leagueRows([withPme], 'f1', 'dpi7'); eq(byDpi[0].tlId, 'p', 'highest DPI₇ (1.1x) leads');
    eq(LG.pooled({ ...withPme.funds, f2: { size: 350, tvpi: 1.5, pme: null } }).pme, null, 'pooled PME only when every fund has one');
    ok(Object.keys(LG.METRICS).length === 4 && GLOSSARY.PME && GLOSSARY.DPI);
    approx(QUEST_BY_ID.e_fund3.steps.find((s) => s.id === 'e_f3_pme').a, 1.25);
    const o3 = QUEST_BY_ID.e_sim3.steps.find((s) => s.type === 'outcome').eval({ vars: { sim: { netTvpi: 2, netIrr: 0.1, quartile: 1, committed: 500, deployed: 0.6, grossMoic: 2.5, vcps: 4, navLoan: 0, events: [], dpi7: 0.3, pme: 1.42 } } }, { tl: { flags: {} } }, 1);
    eq(o3.fx.flags.fund3_pme, 1.42); eq(o3.fx.flags.fund3_dpi7, 0.3);
  });
  testAsync('Timeline meta carries fund results so other timelines appear on the board', async () => {
    Save.useMemoryBackend(); await St.startGame('League', 'standard', null);
    Object.assign(St.S.tl.flags, { fund_size: 200, fund_tvpi: 2.05, fund_irr: 12.3, fund_quartile: 1 });
    await St.flush(); eq(St.S.account.timelines[0].funds.f1.tvpi, 2.05); eq(St.leagueEntries()[0].funds.f1.irr, 12.3);
  });
});

describe('Per-lens mastery', () => {
  test('Each lens has 21 replays; mastery = coverage × average score; accuracy reads spaced-repetition stats', () => {
    for (const l of LENS_ORDER) eq(LZ.lensQuests(l).length, 21);
    const ids = LZ.lensQuests('pe');
    const tl = { career: { track: 'pe' }, questsDone: { [ids[0]]: { score: 1 }, [ids[1]]: { score: 0.5 } } };
    const step = QUEST_BY_ID[ids[0]].steps.find((s) => s.type === 'num');
    const acc = { qstats: { [step.id]: { right: 3, wrong: 1 } } };
    const pe = LZ.lensStats(tl, acc).find((s) => s.lens === 'pe');
    eq(pe.done, 2); approx(pe.avg, 0.75, 1e-12); approx(pe.mastery, (2 / 21) * 0.75, 1e-12); approx(pe.accuracy, 0.75, 1e-12); ok(pe.home); eq(pe.next, ids[2]);
    const ib = LZ.lensStats(tl, acc).find((s) => s.lens === 'ib'); eq(ib.done, 0); eq(ib.avg, null); eq(ib.accuracy, null); eq(ib.mastery, 0);
  });
  test('Weakest lens recommendation skips lenses with nothing playable', () => {
    const st = [{ lens: 'ib', mastery: 0.1, next: null }, { lens: 'cd', mastery: 0.3, next: 'x' }, { lens: 'pe', mastery: 0.2, next: 'y' }];
    eq(LZ.weakestLens(st).lens, 'pe'); eq(LZ.weakestLens([{ next: null }]), null);
  });
  testAsync('Finishing all 21 replays of one lens at ≥ 80% awards Bậc thầy góc nhìn (and not at 20)', async () => {
    Save.useMemoryBackend(); await St.startGame('LensMaster', 'standard', null);
    for (const id of ['c_dinner', 'c_lemonade', 'c_bakery', 'u_professor', 'u_valuation', 'u_network', 'u_rival']) await St.completeQuest(id, { score: 1, fx: [] });
    for (const c of Object.values(CASES)) await St.completeQuest(c.mission, { score: 1, fx: [] });
    const ids = LZ.lensQuests('im');
    for (const id of ids.slice(0, 20)) await St.completeQuest(id, { score: 0.9, fx: [] });
    ok(!St.S.account.ach.lens_master, 'not before the 21st');
    await St.completeQuest(ids[20], { score: 0.9, fx: [] });
    ok(St.S.account.ach.lens_master && ACHIEVEMENTS.lens_master);
  });
});

describe('League table J-curve comparison', () => {
  test('Peer bands: 10 years per vintage, Q1 ends above the median, median above Q3', () => {
    for (const k of LG.FUND_KEYS) { const b = LG.PEER_JCURVE[k]; for (const q of ['q1', 'med', 'q3']) eq(b[q].length, 10); ok(b.q1[9] > b.med[9] && b.med[9] > b.q3[9], k); }
  });
  test('Curves are normalised by commitment; trough, breakeven and end are derived', () => {
    const f = { size: 200, cum: [-20, -60, -100, -140, -160, -120, -40, 20, 120, 230] };
    const c = LG.normCurve(f); approx(c[4], -0.8, 1e-12);
    const st = LG.curveStats(c); approx(st.trough, -0.8, 1e-12); eq(st.troughYear, 5); eq(st.breakeven, 8); approx(st.end, 1.15, 1e-12);
    eq(LG.curveStats([-0.1, -0.2, -0.1]).breakeven, null);
  });
  test('Comparison picks funds with a stored curve and lists older funds without one', () => {
    const a = { id: 'a', name: 'A', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 2, fund_cum: [-20, -60, -100, -140, -160, -120, -40, 20, 120, 230] }) };
    const b = { id: 'b', name: 'B', funds: LG.fundsOf({ fund_size: 200, fund_tvpi: 1.5 }) };
    const d = LG.jCurveCompare([a, b], 'f1'); eq(d.series.length, 1); eq(d.series[0].stats.troughYear, 5); eq(d.missing, ['B']); ok(d.peerStats.breakeven === 8);
    const o = QUEST_BY_ID.e_sim3.steps.find((s) => s.type === 'outcome').eval({ vars: { sim: { netTvpi: 2, netIrr: 0.1, quartile: 1, committed: 500, deployed: 0.6, grossMoic: 2.5, vcps: 4, navLoan: 0, events: [], dpi7: 0.3, pme: 1.4, cum: [1, 2] } } }, { tl: { flags: {} } }, 1);
    eq(o.fx.flags.fund3_cum, [1, 2]);
  });
});

describe('Lens review sessions', () => {
  test('Only reviewable steps of that lens; nothing offered before any answer (no spoilers)', () => {
    const ids = LZ.lensStepIds('ib'); ok(ids.length >= 21 * 2 - 4);
    for (const id of ids) { const q = QUESTS.find((x) => x.steps.some((s) => s.id === id)); eq(q.lens, 'ib'); ok(['num', 'quiz', 'sort'].includes(q.steps.find((s) => s.id === id).type)); }
    eq(LZ.lensReviewQueue('ib', { qstats: {} }).length, 0);
  });
  test('Priority: weak & due first, then lowest box, then least recently seen; capped at 5', () => {
    const ids = LZ.lensStepIds('pe'), now = 1e12;
    const qstats = {};
    ids.slice(0, 8).forEach((id, i) => { qstats[id] = { box: 3, right: 2, wrong: 0, unsure: 0, due: now + 1e9, last: 100 + i }; });
    qstats[ids[5]] = { box: 0, right: 0, wrong: 2, unsure: 0, due: now - 1, last: 900 };   // weak & due
    qstats[ids[6]] = { box: 1, right: 1, wrong: 0, unsure: 0, due: now + 1e9, last: 50 };   // low box
    const q = LZ.lensReviewQueue('pe', { qstats }, now);
    eq(q.length, 5); eq(q[0], ids[5]); eq(q[1], ids[6]); eq(q[2], ids[0], 'then oldest among equal boxes');
    eq(LZ.lensDueCount('pe', { qstats }, now), 1);
  });
  testAsync('Answers given during a lens review update the lens accuracy', async () => {
    Save.useMemoryBackend(); await St.startGame('LensReview', 'standard', null);
    const id = LZ.lensStepIds('cs')[0];
    St.recordAnswer(id, 'x', 'r', false, false); St.recordAnswer(id, 'x', 'r', true, false);
    const cs = LZ.lensStats(St.S.tl, St.S.account).find((s) => s.lens === 'cs'); approx(cs.accuracy, 0.5, 1e-12);
    eq(LZ.lensReviewQueue('cs', St.S.account)[0], id);
  });
});

import * as LPR from '../src/ui/lpReport.js';
describe('LP report export', () => {
  const runFund = (scenario, size, picks, choices = {}, vcp = false) => {
    const s = FS.createSim({ scenario, committed: size, crises: scenario !== 'fund1' });
    for (let y = 1; y <= 10 && !s.done; y++) { for (const id of picks[y] || []) FS.invest(s, id); if (vcp) s.holdings.forEach((h, i) => { if (h.status === 'held' && !h.vcpDone) FS.valueCreation(s, i); }); FS.advance(s); for (let g = 0; s.pending && g < 5; g++) FS.resolveEvent(s, choices[s.pending] ?? 0); }
    return s;
  };
  test('Report data: KPIs, letter, portfolio and peer rank for a finished Fund I; unfinished funds give null', () => {
    const s = runFund('fund1', 200, { 1: ['d1', 'd2'], 2: ['d4'], 3: ['d7', 'd8'], 4: ['d10'] });
    const d = LPR.lpReportData(s, { playerName: 'Linh' });
    eq(d.fund, 'Fund I'); eq(d.kpis.length, 12); eq(d.holdings.length, 6); ok(d.rankT >= 1 && d.rankT <= d.peers); eq(d.peers, 11);
    ok(/net TVPI/.test(d.letter[0]) && /Managing Partner/.test(d.letter[d.letter.length - 1]));
    approx(d.holdings.reduce((a, h) => a + h.proceeds, 0), s.result.invested * s.result.grossMoic, 1e-6);
    eq(LPR.lpReportData(FS.createSim()), null);
  });
  test('Fund II report merges continuation-vehicle slices and lists crisis decisions', () => {
    const s = runFund('fund2', 350, { 1: ['g1', 'g2'], 2: ['g4', 'g5'], 5: ['g13', 'g14', 'g15'] });
    const d = LPR.lpReportData(s, { playerName: 'Linh' });
    eq(d.holdings.length, 7); ok(d.holdings.some((h) => /continuation vehicle/.test(h.status) && h.exit === '7 / 10')); eq(d.events.length, 2); ok(d.rankP != null);
  });
  test('HTML is self-contained, labelled as simulation, escapes names and has no undefined/NaN', () => {
    const s = runFund('fund3', 500, { 1: ['h1', 'h3'], 2: ['h4'], 3: ['h7'], 4: ['h10'], 5: ['h13', 'h14'] }, {}, true);
    const html = LPR.lpReportHTML(s, { playerName: 'An <b>', timelineName: 'TL "1"' });
    ok(html.startsWith('<!doctype html>') && html.includes('<svg') && html.includes('Simulation Assumption') && html.includes('KS-PME'));
    ok(!/undefined|NaN/.test(html)); ok(html.includes('An &lt;b&gt; Capital') && !html.includes('An <b> Capital'));
    ok(!/<script\b|https?:\/\/(?!www\.w3\.org)/.test(html), 'no scripts or external resources');
    ok(/VCP/.test(html)); eq(LPR.reportFileName(s, 'Linh'), 'linh-capital-fund-iii-bao-cao-lp.html');
  });
});

import * as PNL from '../src/ui/panels.js';
describe('LP report entry points', () => {
  testAsync('Legacy wall lists finished funds with view/download buttons', async () => {
    Save.useMemoryBackend(); await St.startGame('LPWall', 'standard', null);
    St.S.tl.career = { track: 'pe', rankIdx: 3, history: [] }; St.S.tl.flags.endgame = true;
    const s = FS.createSim(); for (let y = 1; y <= 10 && !s.done; y++) { if (y === 1) FS.invest(s, 'd1'); FS.advance(s); }
    St.S.tl.sim = s;
    const txt = PNL.legacyPanel({ open() {} }).textContent;
    ok(/Báo cáo cho LP/.test(txt) && /Fund I · net TVPI/.test(txt) && /Tải \.html/.test(txt), txt.slice(0, 200));
  });
});

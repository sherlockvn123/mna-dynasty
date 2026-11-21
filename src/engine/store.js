// State management: account-level + per-timeline state, quest/career/relationship/reward logic.
import * as Save from './save.js';
import { QUESTS, QUEST_BY_ID } from '../content/quests.js';
import { NPCS, CHAPTERS } from '../content/characters.js';
import { CAREERS } from '../content/careers.js';
import { ITEMS, ACHIEVEMENTS } from '../content/items.js';
import { LOCATIONS } from '../content/locations.js';
import { SECTORS, SECTOR_MENTOR, SECTOR_OF_MISSION, academyScore, isSpecialist } from '../content/sectors.js';
import { CRISIS_IDS } from '../content/quests_crisis.js';
import { CASE_IDS } from '../content/quests_cases.js';
import { CASES } from '../content/cases.js';
import { REPLAYS, LENSES } from '../content/quests_replay.js';
import { fundsOf } from './league.js';
import { lensStats, hasLensMaster } from './lenses.js';

export const SAVE_VERSION = 1;
export const S = { account: null, tl: null };
const subs = new Set();
export const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
export function notify() { subs.forEach((f) => f(S)); scheduleSave(); }

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const clone = (x) => JSON.parse(JSON.stringify(x));
export const chapIdx = (c) => CHAPTERS.indexOf(c);

// ---------- creation ----------
export function newAccount(name = 'Linh', pace = 'standard') {
  return { v: SAVE_VERSION, id: uid(), playerName: name, pace, items: {}, ach: {}, glossary: {}, cases: {}, qstats: {}, timelines: [], active: null, settings: { sound: true, big: false }, diagnostic: null, created: Date.now() };
}
export function newTimeline(n) {
  return {
    v: SAVE_VERSION, id: uid(), name: `Dòng thời gian #${n}`, created: Date.now(), chapter: 'child', age: 7, loc: 'bedroom', pos: null, slot: 0,
    flags: {}, questsDone: {}, stats: { xp: 0, rep: 0, ethics: 0, credits: 0, wellbeing: 100, negotiation: 0, dealExp: 0 },
    rel: Object.fromEntries(Object.keys(NPCS).map((k) => [k, { trust: 0, respect: 0 }])),
    outfit: null, decor: {}, career: null, macro: { rate: 'normal', regime: 'expansion' }, log: [], checkpoint: null, status: 'active', branchedFrom: null,
  };
}

// ---------- persistence ----------
let saveTimer = null;
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(flush, 250); }
export async function flush() {
  clearTimeout(saveTimer);
  if (!S.account) return;
  if (S.tl) { syncTimelineMeta(); await Save.set('tl:' + S.tl.id, S.tl); }
  await Save.set('account', S.account);
}
function syncTimelineMeta() {
  const a = S.account, t = S.tl;
  const meta = a.timelines.find((x) => x.id === t.id);
  const m = { id: t.id, name: t.name, created: t.created, chapter: t.chapter, age: t.age, track: t.career?.track || null, rankIdx: t.career?.rankIdx ?? null, rep: t.stats.rep, ethics: t.stats.ethics, done: Object.keys(t.questsDone).length, status: t.status, branchedFrom: t.branchedFrom, avgScore: avgScore(t) };
  m.funds = fundsOf(t.flags);
  if (meta) Object.assign(meta, m); else a.timelines.push(m);
}
/** League entries for every timeline; the open timeline is read live from its flags. */
export const leagueEntries = () => S.account.timelines.map((m) => { const live = S.tl && m.id === S.tl.id; return { id: m.id, name: m.name, track: live ? S.tl.career?.track || m.track : m.track, funds: live ? fundsOf(S.tl.flags) : m.funds || {} }; });
function avgScore(t) { const v = Object.values(t.questsDone).map((x) => x.score ?? 0); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : 0; }

export async function boot() {
  const acc = await Save.get('account');
  if (!acc) return false;
  S.account = migrateAccount(acc);
  if (S.account.active) S.tl = migrateTl(await Save.get('tl:' + S.account.active));
  if (!S.tl && S.account.timelines.length) { S.tl = migrateTl(await Save.get('tl:' + S.account.timelines[0].id)); }
  return !!S.tl;
}
function migrateAccount(a) { a.v = SAVE_VERSION; a.qstats ||= {}; a.cases ||= {}; a.settings ||= { sound: true, big: false }; return a; }
function migrateTl(t) { if (!t) return null; t.v = SAVE_VERSION; t.stats.negotiation ??= 0; t.stats.dealExp ??= 0; t.macro ||= { rate: 'normal', regime: 'expansion' }; for (const k of Object.keys(NPCS)) t.rel[k] ||= { trust: 0, respect: 0 }; return t; }

export async function startGame(name, pace, diagnostic) {
  S.account = newAccount(name, pace);
  S.account.diagnostic = diagnostic || null;
  S.tl = newTimeline(1);
  S.account.active = S.tl.id;
  await flush(); notify();
}

export async function switchTimeline(id) {
  await flush();
  const t = migrateTl(await Save.get('tl:' + id));
  if (!t) return false;
  S.tl = t; S.account.active = id; await flush(); notify(); return true;
}

/** New Game+: branch a new timeline from a completed timeline's graduation checkpoint. */
export async function branchFromCheckpoint(srcId) {
  await flush();
  const src = srcId === S.tl.id ? S.tl : await Save.get('tl:' + srcId);
  if (!src?.checkpoint) return null;
  const t = clone(src.checkpoint);
  t.id = uid(); t.created = Date.now(); t.name = `Dòng thời gian #${S.account.timelines.length + 1}`; t.branchedFrom = src.id; t.status = 'active'; t.checkpoint = clone(src.checkpoint);
  S.tl = migrateTl(t); S.account.active = t.id; await flush(); notify(); return t.id;
}
export async function freshTimeline() {
  await flush();
  S.tl = newTimeline(S.account.timelines.length + 1); S.account.active = S.tl.id; await flush(); notify();
}
export const playedTracks = () => new Set(S.account.timelines.filter((t) => t.status === 'complete' && t.track).map((t) => t.track));

// ---------- world queries ----------
export function slotName(i = S.tl.slot) { return ['Sáng', 'Chiều', 'Tối'][i]; }
export function npcLocation(id, tl = S.tl) {
  if (tl.flags.endgame && NPCS[id].endgame && NPCS[id].endgame(tl)) return 'firm'; // recruited to the player's own firm
  const s = NPCS[id].schedule[tl.chapter];
  if (s === undefined || s === null) return null;
  return Array.isArray(s) ? s[tl.slot] : s;
}
export function npcsAt(loc, tl = S.tl) { return Object.keys(NPCS).filter((id) => npcLocation(id, tl) === loc && NPCS[id].pos[loc]); }
export function locationUnlocked(id, tl = S.tl) {
  const L = LOCATIONS[id];
  if (!L) return false;
  if (chapIdx(tl.chapter) < chapIdx(L.minChapter)) return false;
  if (L.career && tl.career?.track !== L.career) return false;
  if (L.flag && !tl.flags[L.flag]) return false;
  return true;
}
export const resolveGiver = (q, tl = S.tl) => (q.giver === '@mentor' ? (tl.career ? CAREERS[tl.career.track].mentor : null) : q.giver);
export const resolveLoc = (q, tl = S.tl) => (q.loc === '@office' ? (tl.career ? CAREERS[tl.career.track].office : null) : q.loc);

export function questStatus(q, tl = S.tl) {
  if (tl.questsDone[q.id]) return 'done';
  const ci = chapIdx(tl.chapter);
  if (q.minChapter) { if (ci < chapIdx(q.minChapter)) return 'locked'; }
  else if (q.chapter !== tl.chapter) return 'locked';
  if (q.career && tl.career?.track !== q.career) return 'locked';
  if (q.chapter === 'career' && !tl.career) return 'locked';
  if (q.req && !q.req.every((r) => tl.questsDone[r])) return 'locked';
  if (q.reqAny && !q.reqAny.some((r) => tl.questsDone[r])) return 'locked';
  if (q.reqCareerMission && !(tl.career && CAREERS[tl.career.track].missions.every((m) => tl.questsDone[m]))) return 'locked';
  if (q.cond && !q.cond(tl)) return 'locked';
  return 'available';
}
export const availableQuests = (tl = S.tl) => QUESTS.filter((q) => questStatus(q, tl) === 'available');
export const questsForNpc = (npc, tl = S.tl) => availableQuests(tl).filter((q) => resolveGiver(q, tl) === npc);
export const questsForObject = (loc, obj, tl = S.tl) => availableQuests(tl).filter((q) => q.obj === obj && resolveLoc(q, tl) === loc);

export function currentObjective(tl = S.tl) {
  if (tl.chapter === 'career' && !tl.career) return { text: 'Chọn con đường sự nghiệp', action: 'career' };
  const av = availableQuests(tl).filter((q) => q.kind !== 'transition'); // switching careers is an option, not an objective
  const main = av.find((q) => q.kind === 'main' || q.kind === 'career' || q.kind === 'endgame' || q.kind === 'succession' || q.flagship) || av.find((q) => !q.optional) || av[0];
  if (!main) return tl.status === 'complete' ? { text: 'Dòng thời gian hoàn thành — mở Đa Vũ Trụ', action: 'multiverse' } : null;
  const giver = resolveGiver(main, tl);
  const where = giver ? npcLocation(giver, tl) : resolveLoc(main, tl);
  const who = giver ? NPCS[giver].name : (LOCATIONS[resolveLoc(main, tl)]?.objects.find((o) => o.id === main.obj)?.label || 'Khám phá');
  return { text: `${main.title} — ${who}${where ? ' @ ' + (LOCATIONS[where]?.name || where) : ''}`, quest: main.id, loc: where };
}

// ---------- effects & rewards ----------
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
export function applyFx(fx, gained) {
  if (!fx) return;
  const t = S.tl, a = S.account;
  if (fx.xp) { t.stats.xp += fx.xp; gained.xp = (gained.xp || 0) + fx.xp; }
  if (fx.rep) { t.stats.rep += fx.rep; gained.rep = (gained.rep || 0) + fx.rep; }
  if (fx.credits) { t.stats.credits += fx.credits; gained.credits = (gained.credits || 0) + fx.credits; }
  if (fx.stats) for (const [k, v] of Object.entries(fx.stats)) { t.stats[k] = (t.stats[k] || 0) + v; if (k === 'wellbeing') t.stats[k] = clamp(t.stats[k], 0, 100); }
  if (fx.flags) Object.assign(t.flags, fx.flags);
  if (fx.macro) Object.assign(t.macro, fx.macro);
  if (fx.rel) for (const [npc, d] of Object.entries(fx.rel)) {
    const r = t.rel[npc] ||= { trust: 0, respect: 0 };
    for (const [k, v] of Object.entries(d)) r[k] = clamp((r[k] || 0) + v, -100, 100);
    (gained.rel ||= []).push([npc, d]);
  }
  if (fx.items) for (const id of fx.items) if (ITEMS[id] && !a.items[id]) { a.items[id] = Date.now(); (gained.items ||= []).push(id); }
  if (fx.ach) for (const id of fx.ach) if (ACHIEVEMENTS[id] && !a.ach[id]) { a.ach[id] = Date.now(); (gained.ach ||= []).push(id); }
  if (fx.career && t.career && fx.career.setRank != null) {
    const max = CAREERS[t.career.track].ranks.length - 1, before = t.career.rankIdx;
    t.career.rankIdx = Math.max(before, Math.min(max, fx.career.setRank));
    gained.promotion = [CAREERS[t.career.track].ranks[before], CAREERS[t.career.track].ranks[t.career.rankIdx]];
  }
  if (fx.career && t.career && fx.career.promote) {
    const max = CAREERS[t.career.track].ranks.length - 1;
    const before = t.career.rankIdx; t.career.rankIdx = Math.min(max, before + fx.career.promote);
    gained.promotion = [CAREERS[t.career.track].ranks[before], CAREERS[t.career.track].ranks[t.career.rankIdx]];
  }
  if (fx.switchCareer && t.career) {
    const { to, penalty = 0 } = fx.switchCareer;
    const from = t.career;
    const newRank = mapRank(from.track, from.rankIdx, to, penalty);
    const kept = Math.round(t.stats.rep * 0.7); // reputation is partly industry-specific
    t.career = { track: to, rankIdx: newRank, chosenAt: Date.now(), history: [...(from.history || []), { track: from.track, rankIdx: from.rankIdx, until: Date.now() }] };
    gained.switched = [`${CAREERS[from.track].ranks[from.rankIdx]} · ${CAREERS[from.track].name}`, `${CAREERS[to].ranks[newRank]} · ${CAREERS[to].name}`, t.stats.rep - kept];
    t.stats.rep = kept;
    t.flags.switched = true; t.status = 'active';
    t.loc = CAREERS[to].office; t.pos = null;
  }
}

/** Map a rank to the equivalent relative seniority on another ladder, minus a transition penalty. */
export function mapRank(fromTrack, fromIdx, toTrack, penalty = 0) {
  const a = CAREERS[fromTrack].ranks.length - 1, b = CAREERS[toTrack].ranks.length - 1;
  return Math.max(0, Math.min(b, Math.round((fromIdx / a) * b) - penalty));
}

/**
 * Complete a quest exactly once (idempotent — guards against duplicated rewards on reload/double tap).
 * result = { score (0..1), fx: [effects from choices/outcomes], outcome: text }
 */
export async function completeQuest(id, result) {
  const q = QUEST_BY_ID[id];
  const t = S.tl;
  if (!q || t.questsDone[id]) return { duplicate: true };
  if (result.retry) { // failed/declined attempt: nothing is granted, the quest stays available
    t.log.unshift({ at: Date.now(), t: `Chưa thành công: ${q.title}` + (result.outcome ? ' — ' + result.outcome.slice(0, 120) : '') });
    await flush(); notify();
    return { retry: true };
  }
  const gained = {};
  t.questsDone[id] = { score: result.score ?? 1, at: Date.now(), outcome: result.outcome || '' };
  for (const fx of result.fx || []) applyFx(fx, gained);
  applyFx(q.rewards, gained);
  if (result.negotiated) t.stats.negotiation += 1;
  const sec = SECTOR_OF_MISSION[id];
  if (sec && isSpecialist(t, sec)) { applyFx({ rep: 2 }, gained); gained.credibility = SECTORS[sec].name; }
  if (q.sector) t.stats.industry = (t.stats.industry || 0) + 1;
  if (['deal', 'career', 'case', 'macro'].includes(q.kind)) t.stats.dealExp += 1;
  if ((result.score ?? 0) >= 0.999 && result.graded >= 3) applyFx({ ach: ['perfect'] }, gained);
  if (q.age && q.age > t.age) t.age = q.age;
  t.slot = (t.slot + 1) % 3;
  t.log.unshift({ at: Date.now(), t: `Hoàn thành: ${q.title}` + (result.outcome ? ' — ' + result.outcome.slice(0, 120) : '') });
  t.log = t.log.slice(0, 60);
  if (q.case) S.account.cases[q.case] = Date.now();
  if (['h_disney', 'h_rjr', 'h_keyrus'].every((c) => t.questsDone[c])) applyFx({ ach: ['case_scholar'] }, gained);
  if (CRISIS_IDS.every((c) => t.questsDone[c])) applyFx({ ach: ['crisis_manager'] }, gained);
  if (CASE_IDS.every((c) => t.questsDone[c])) applyFx({ ach: ['deal_historian'] }, gained);
  if (Object.values(CASES).every((c) => !c.mission || t.questsDone[c.mission])) applyFx({ ach: ['hall_master'] }, gained);
  if (q.lens && t.career?.track === q.lens) { applyFx({ rep: 1, xp: 10 }, gained); gained.homeLens = LENSES[q.lens].name; }
  if (q.lens && Object.values(REPLAYS).some((r) => Object.values(r.quests).every((x) => t.questsDone[x]))) applyFx({ ach: ['five_lenses'] }, gained);
  if (q.lens && hasLensMaster(lensStats(t, S.account))) applyFx({ ach: ['lens_master'] }, gained);
  const transition = checkTransitions();
  if (id === 'k_review' || id === 'k_review2') {
    t.status = 'complete';
    syncTimelineMeta();
    const tracks = new Set(S.account.timelines.filter((x) => x.status === 'complete' && x.track).map((x) => x.track));
    if (tracks.size >= 2) applyFx({ ach: ['multiverse'] }, gained);
  }
  await flush(); notify();
  return { gained, transition };
}

const CHILD_MAIN = ['c_dinner', 'c_lemonade', 'c_bakery'];
const UNI_MAIN = ['u_professor', 'u_valuation', 'u_network', 'u_rival'];
export function checkTransitions() {
  const t = S.tl;
  if (t.chapter === 'child' && CHILD_MAIN.every((q) => t.questsDone[q])) { t.chapter = 'uni'; t.age = Math.max(t.age, 18); t.loc = 'campus'; t.pos = null; t.slot = 0; return 'uni'; }
  if (t.chapter === 'uni' && UNI_MAIN.every((q) => t.questsDone[q])) { t.chapter = 'intern'; t.age = Math.max(t.age, 21); t.loc = 'district'; t.pos = null; t.slot = 0; return 'intern'; }
  if (t.chapter === 'intern' && t.questsDone.i_review) {
    t.flags.graduated = true; t.chapter = 'career'; t.age = Math.max(t.age, 22); t.slot = 0;
    const snap = clone(t); snap.checkpoint = null; t.checkpoint = snap; // graduation checkpoint for New Game+
    return 'career';
  }
  return null;
}

export async function chooseCareer(track) {
  const t = S.tl;
  if (t.chapter !== 'career' || t.career) return false;
  t.career = { track, rankIdx: track === 'ib' || track === 'pe' ? 1 : 0, chosenAt: Date.now() };
  // IB/PE start as Analyst after internship (rank 1); VC/CD ladders start at Analyst (rank 0)
  if (t.checkpoint) t.checkpoint.flags.graduated = true;
  t.loc = CAREERS[track].office; t.pos = null;
  t.log.unshift({ at: Date.now(), t: `Bắt đầu sự nghiệp: ${CAREERS[track].name}` });
  await flush(); notify(); return true;
}

export function travel(loc) {
  if (!locationUnlocked(loc)) return false;
  S.tl.loc = loc; S.tl.pos = null; notify(); return true;
}
export function setPos(x, y) { S.tl.pos = [Math.round(x), Math.round(y)]; scheduleSave(); }
export function setFlag(k, v = true) { if (S.tl.flags[k] === v) return; S.tl.flags[k] = v; notify(); }

export function talk(npc) {
  // small, capped rapport from casual conversation — once per time slot per NPC
  const key = `talk_${npc}_${S.tl.chapter}_${S.tl.age}_${S.tl.slot}`;
  if (S.tl.flags[key]) return false;
  S.tl.flags[key] = true; const r = S.tl.rel[npc]; r.trust = clamp(r.trust + 1, -100, 100); notify(); return true;
}

// ---------- industry specialization ----------
/**
 * Choose Primary + optional Secondary specialization, or 'generalist'.
 * Rules: a specialization requires that sector's academy completed with ≥ 60% competence;
 * Generalist requires ≥ 3 academies completed. Returns an error string or null.
 */
export function setSpecialization(primary, secondary = null) {
  const t = S.tl;
  const ok = (s) => (academyScore(t, s) ?? 0) >= 0.6;
  if (primary === 'generalist') {
    const n = Object.keys(SECTORS).filter((s) => academyScore(t, s) !== null).length;
    if (n < 3) return 'Cần hoàn thành ít nhất 3 Học viện để theo Generalist Track.';
    t.spec = { primary: 'generalist', secondary: null, at: Date.now() };
  } else {
    if (!SECTORS[primary] || !ok(primary)) return 'Cần hoàn thành Học viện của ngành này với điểm năng lực ≥ 60%.';
    if (secondary && (secondary === primary || !SECTORS[secondary] || !ok(secondary))) return 'Chuyên môn phụ phải là một ngành khác đã đạt ≥ 60%.';
    t.spec = { primary, secondary: secondary || null, at: Date.now() };
    const m = SECTOR_MENTOR[primary];
    if (m && !t.flags['spec_bonus_' + primary]) { t.flags['spec_bonus_' + primary] = true; const r = t.rel[m]; r.trust = clamp(r.trust + 10, -100, 100); } // once per sector
  }
  t.log.unshift({ at: Date.now(), t: `Chọn chuyên môn: ${t.spec.primary === 'generalist' ? 'Generalist Track' : SECTORS[t.spec.primary].name}${t.spec.secondary ? ' + ' + SECTORS[t.spec.secondary].name : ''}` });
  notify();
  return null;
}

// ---------- inventory ----------
export function equipOutfit(id) { S.tl.outfit = id && ITEMS[id]?.kind === 'outfit' && S.account.items[id] ? id : null; notify(); }
export function toggleDecor(id) { if (!S.account.items[id] || ITEMS[id]?.kind !== 'decor') return; S.tl.decor[id] = !S.tl.decor[id]; notify(); }

// ---------- adaptive learning (account-level, independent of XP) ----------
const DAY = 864e5;
const INTERVALS = [0, DAY, 2 * DAY, 4 * DAY, 8 * DAY, 16 * DAY];
export function recordAnswer(qid, concept, src, correct, unsure, now = Date.now()) {
  const st = S.account.qstats[qid] ||= { box: 0, due: now, right: 0, wrong: 0, unsure: 0, concept, src };
  if (!correct) { st.wrong++; st.box = 0; st.due = now; }
  else if (unsure) { st.unsure++; st.right++; st.box = Math.min(st.box, 1); st.due = now; }
  else { st.right++; st.box = Math.min(5, st.box + 1); st.due = now + INTERVALS[st.box]; }
  st.last = now;
  return st;
}
export function dueReviews(now = Date.now()) { return Object.entries(S.account.qstats).filter(([, s]) => s.due <= now && s.box < 5 && (s.wrong > 0 || s.unsure > 0 || s.box < 2)).map(([id, s]) => ({ id, ...s })); }
export function mastery() {
  const by = {};
  for (const s of Object.values(S.account.qstats)) { (by[s.concept] ||= []).push(s); }
  return Object.entries(by).map(([c, arr]) => ({ concept: c, level: arr.reduce((x, s) => x + s.box, 0) / (arr.length * 5), n: arr.length, wrong: arr.reduce((x, s) => x + s.wrong, 0) })).sort((a, b) => a.level - b.level);
}
export function markTerm(term) { if (S.account.glossary[term]) return false; S.account.glossary[term] = Date.now(); scheduleSave(); return true; }

// ---------- test helpers ----------
export function __setState(account, tl) { S.account = account; S.tl = tl; }
export { QUEST_BY_ID };

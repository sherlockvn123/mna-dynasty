// Per-lens mastery for the multi-perspective replays (IB, Corp Dev, PE, Consulting, Public Investor).
// Pure: reads a timeline (missions done + scores) and the account's spaced-repetition stats (per-question
// right/wrong). Mastery = coverage × quality, so playing many replays badly and few replays well both show.
import { QUEST_BY_ID } from '../content/quests.js';
import { LENSES, LENS_ORDER, REPLAYS } from '../content/quests_replay.js';

export const LENS_MASTER_MIN_AVG = 0.8;
const GRADED = new Set(['num', 'quiz', 'sort', 'choice']);

/** Replay quest ids for one lens, in Hall order. */
export const lensQuests = (lens) => Object.values(REPLAYS).map((r) => r.quests[lens]).filter((id) => QUEST_BY_ID[id]);

/**
 * stats per lens: { lens, name, icon, total, done, avg (0–1 | null), right, wrong, accuracy (0–1 | null), mastery (0–1), next (quest id | null), home }
 * status(q) is the store's questStatus (passed in to keep this module free of store state).
 */
export function lensStats(tl, account, status = () => 'available') {
  const home = tl?.career?.track;
  return LENS_ORDER.map((lens) => {
    const ids = lensQuests(lens);
    const done = ids.filter((id) => tl.questsDone[id]);
    const avg = done.length ? done.reduce((s, id) => s + (tl.questsDone[id].score ?? 0), 0) / done.length : null;
    let right = 0, wrong = 0;
    for (const id of ids) for (const s of QUEST_BY_ID[id].steps) {
      if (!s.id || !GRADED.has(s.type)) continue;
      const q = account?.qstats?.[s.id]; if (q) { right += q.right || 0; wrong += q.wrong || 0; }
    }
    const next = ids.find((id) => !tl.questsDone[id] && status(QUEST_BY_ID[id]) === 'available') || null;
    return { lens, name: LENSES[lens].name, icon: LENSES[lens].icon, total: ids.length, done: done.length, avg, right, wrong,
      accuracy: right + wrong ? right / (right + wrong) : null, mastery: ids.length ? (done.length / ids.length) * (avg ?? 0) : 0, next, home: home === lens };
  });
}

/** Weakest lens that still has something playable (for the recommendation); null if nothing to suggest. */
export function weakestLens(stats) {
  const open = stats.filter((s) => s.next);
  return open.length ? open.reduce((a, b) => (b.mastery < a.mastery ? b : a)) : null;
}

/** True when some lens is fully covered with an average score ≥ 80%. */
export const hasLensMaster = (stats) => stats.some((s) => s.total > 0 && s.done === s.total && (s.avg ?? 0) >= LENS_MASTER_MIN_AVG);

// ---------- Lens review sessions ----------
const REVIEWABLE = new Set(['num', 'quiz', 'sort']); // step types the review runner can replay on their own
export const LENS_REVIEW_SIZE = 5;

/** Graded, reviewable step ids for one lens. */
export const lensStepIds = (lens) => lensQuests(lens).flatMap((id) => QUEST_BY_ID[id].steps.filter((s) => s.id && REVIEWABLE.has(s.type)).map((s) => s.id));

/**
 * Up to `n` questions for a lens review, only from questions the player has already answered (no spoilers).
 * Priority: due and weak (wrong/unsure) → lowest Leitner box → least recently seen.
 */
export function lensReviewQueue(lens, account, now = Date.now(), n = LENS_REVIEW_SIZE) {
  const seen = lensStepIds(lens).map((id) => ({ id, st: account?.qstats?.[id] })).filter((x) => x.st);
  const weakDue = (st) => st.due <= now && (st.wrong > 0 || st.unsure > 0) && st.box < 5;
  seen.sort((a, b) => (weakDue(b.st) - weakDue(a.st)) || (a.st.box - b.st.box) || ((b.st.wrong || 0) - (a.st.wrong || 0)) || ((a.st.last || 0) - (b.st.last || 0)));
  return seen.slice(0, n).map((x) => x.id);
}

/** Count of due-and-weak questions per lens (badge on the review buttons). */
export const lensDueCount = (lens, account, now = Date.now()) => lensStepIds(lens).filter((id) => { const st = account?.qstats?.[id]; return st && st.due <= now && (st.wrong > 0 || st.unsure > 0) && st.box < 5; }).length;

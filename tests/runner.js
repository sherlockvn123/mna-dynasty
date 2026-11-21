// Minimal zero-dependency test runner (runs in the browser via tests.html).
const results = [];
let current = '';
export function describe(name, fn) { current = name; fn(); current = ''; }
export function test(name, fn) {
  try { fn(); results.push({ suite: current, name, ok: true }); }
  catch (e) { results.push({ suite: current, name, ok: false, err: String(e && e.message || e) }); }
}
const pending = [];
/** Async tests are queued and run strictly in sequence by runPending() (they share global game state). */
export function testAsync(name, fn) { pending.push({ suite: current, name, fn }); }
export async function runPending() {
  while (pending.length) {
    const { suite, name, fn } = pending.shift();
    try { await fn(); results.push({ suite, name, ok: true }); }
    catch (e) { results.push({ suite, name, ok: false, err: String(e && e.message || e) }); }
  }
}
export function approx(actual, expected, tol = 1e-6, label = '') {
  if (!(Math.abs(actual - expected) <= tol)) throw new Error(`${label} expected ${expected}, got ${actual}`);
}
export function eq(actual, expected, label = '') {
  const a = JSON.stringify(actual), b = JSON.stringify(expected);
  if (a !== b) throw new Error(`${label} expected ${b}, got ${a}`);
}
export function ok(cond, label = 'assertion failed') { if (!cond) throw new Error(label); }
export function getResults() { return results; }

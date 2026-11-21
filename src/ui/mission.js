// Mission runner — renders data-driven steps, grades answers, collects consequences, completes quests.
import { h, nf } from './dom.js';
import { S, completeQuest, recordAnswer, markTerm, notify } from '../engine/store.js';
import * as FS from '../engine/fundsim.js';
import { QUEST_BY_ID, QUESTS } from '../content/quests.js';
import { NPCS } from '../content/characters.js';
import { GLOSSARY } from '../content/glossary.js';
import { MODELS, fmt } from '../content/models.js';
import { initNegotiation, negotiateRound } from '../engine/negotiation.js';
import { portraitSVG } from './chibi.js';
import { playerLook } from './world.js';
import { chime, toast } from './fx.js';
import { jCurveChart } from './charts.js';
import * as LP from './lpReport.js';

// Accepts "1079", "1.079" (vi thousands), "1,079" (en thousands), "57,5" (vi decimal), "57.5", "-2,05%".
// When a string is ambiguous (e.g. "1.079"), both readings are considered and the one closer to the expected value is used.
export function parseNum(s, expected) {
  const t = String(s).trim().replace(/\s/g, '').replace(/[−–]/g, '-').replace(/%$/, '');
  if (!t || !/^[-+]?[\d.,]+$/.test(t)) return NaN;
  const cands = new Set();
  if (/^[-+]?\d{1,3}([.,]\d{3})+$/.test(t)) cands.add(Number(t.replace(/[.,]/g, '')));
  if (/^[-+]?\d+([.,]\d+)?$/.test(t)) cands.add(Number(t.replace(',', '.')));
  if (/^[-+]?\d{1,3}(\.\d{3})+,\d+$/.test(t)) cands.add(Number(t.replace(/\./g, '').replace(',', '.')));
  if (/^[-+]?\d{1,3}(,\d{3})+\.\d+$/.test(t)) cands.add(Number(t.replace(/,/g, '')));
  const arr = [...cands].filter(Number.isFinite);
  if (!arr.length) return NaN;
  if (expected === undefined) return arr[0];
  return arr.reduce((b, x) => (Math.abs(x - expected) < Math.abs(b - expected) ? x : b));
}
const speakerName = (id) => (id === 'me' ? S.account.playerName : id === 'nar' ? '' : NPCS[id]?.name || id);
const portrait = (id) => (id === 'nar' ? '' : portraitSVG(id === 'me' ? playerLook() : NPCS[id].look, 46));

function termCards(step) {
  const fresh = (step.terms || []).filter((t) => GLOSSARY[t] && markTerm(t));
  if (!fresh.length) return null;
  return h('div', { class: 'terms' }, fresh.map((t) => h('div', { class: 'term' }, h('b', {}, '📘 Thuật ngữ mới: ', t), h('div', {}, GLOSSARY[t].vi), h('div', { class: 'en' }, 'EN: ', GLOSSARY[t].en))));
}

export function feedbackBox(step, correct, extra = {}) {
  const f = step.fb || {};
  const rows = [
    !correct && extra.answer !== undefined && ['Đáp án đúng', extra.answer],
    ['Giải thích', f.vi],
    ['Professional interpretation', f.en],
    ['Lập luận / tính toán', f.why],
    !correct && extra.err && ['Vì sao chưa đúng', extra.err],
    ['Ý nghĩa kinh doanh', f.impl],
    ['Khái niệm liên quan', f.related],
    !correct && f.review && ['Gợi ý ôn tập', f.review + ' (đã thêm vào hàng đợi Ôn tập)'],
  ].filter((r) => r && r[1] !== undefined && r[1] !== '');
  return h('div', { class: 'fb ' + (correct ? 'ok' : 'bad') }, h('div', { class: 'fb-h' }, correct ? (extra.unsure ? '✅ Đúng — nhưng bạn chưa chắc, sẽ ôn lại sau' : '✅ Chính xác!') : '❌ Chưa đúng'), rows.map(([k, v]) => h('div', { class: 'fb-r' }, h('span', {}, k), h('p', {}, String(v)))));
}

// -------- step renderers --------
function stepSay(step, rt, next) {
  let i = 0;
  const box = h('div', { class: 'say' });
  const line = ([who, text]) => h('div', { class: 'say-line ' + (who === 'nar' ? 'nar' : '') }, who !== 'nar' && h('div', { class: 'pt', html: portrait(who) }), h('div', { class: 'bubble' }, who !== 'nar' && h('b', {}, speakerName(who)), h('p', {}, text.replace(/Linh/g, S.account.playerName))));
  if (S.account.pace === 'fast') { // accelerated pace: whole conversation at once, one tap
    box.append(...step.lines.map(line), h('button', { class: 'btn primary', onclick: () => { chime('tap'); next(); } }, 'Tiếp tục ▸'));
    return box;
  }
  const draw = () => {
    const [who, text] = step.lines[i];
    box.innerHTML = '';
    box.append(h('div', { class: 'say-line ' + (who === 'nar' ? 'nar' : '') }, who !== 'nar' && h('div', { class: 'pt', html: portrait(who) }), h('div', { class: 'bubble' }, who !== 'nar' && h('b', {}, speakerName(who)), h('p', {}, text.replace(/Linh/g, S.account.playerName)))),
      h('button', { class: 'btn primary', onclick: () => { chime('tap'); if (++i < step.lines.length) draw(); else next(); } }, i < step.lines.length - 1 ? 'Tiếp ▸' : 'Tiếp tục ▸'));
  };
  draw();
  return box;
}

function grade(step, rt, correctFrac, unsure) {
  rt.graded += 1; rt.correct += correctFrac;
  if (step.id) recordAnswer(step.id, step.concept || 'general', rt.q?.id || 'review', correctFrac >= 0.999, !!unsure);
  chime(correctFrac >= 0.999 ? 'ok' : 'bad');
}

function unsureToggle() {
  const cb = h('input', { type: 'checkbox', id: 'uns' });
  return { el: h('label', { class: 'unsure' }, cb, ' 🤔 Không chắc (đánh dấu để ôn lại)'), get: () => cb.checked };
}

function stepQuiz(step, rt, next) {
  const wrap = h('div', { class: 'quiz' }, h('p', { class: 'q' }, step.q));
  const un = unsureToggle();
  const opts = h('div', { class: 'opts' });
  step.opts.forEach((o, idx) => opts.append(h('button', { class: 'opt', onclick: () => {
    const ok = idx === step.a; grade(step, rt, ok ? 1 : 0, un.get());
    [...opts.children].forEach((b, j) => { b.disabled = true; b.classList.add(j === step.a ? 'right' : j === idx ? 'wrong' : 'dim'); });
    un.el.remove();
    wrap.append(feedbackBox(step, ok, { answer: step.opts[step.a], err: step.err?.[idx] || (ok ? '' : `Bạn chọn "${o}". ${step.fb?.why || ''}`), unsure: un.get() }), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  } }, o)));
  wrap.append(opts, un.el);
  return wrap;
}

function dataTable(head, rows) {
  return h('table', { class: 'tbl' }, head && h('thead', {}, h('tr', {}, head.map((x) => h('th', {}, x)))), h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, typeof c === 'number' ? nf(c, 2) : c))))));
}

function stepNum(step, rt, next) {
  const wrap = h('div', { class: 'quiz' });
  if (step.data) wrap.append(dataTable(['Khoản mục', 'Giá trị'], step.data));
  wrap.append(h('p', { class: 'q' }, step.q));
  const inp = h('input', { class: 'numin', type: 'text', inputmode: 'decimal', placeholder: 'Nhập số' + (step.unit ? ` (${step.unit})` : ''), 'aria-label': step.q });
  const un = unsureToggle();
  const btn = h('button', { class: 'btn primary', onclick: () => {
    const v = parseNum(inp.value, step.a);
    if (!Number.isFinite(v)) { inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); return; }
    const ok = Math.abs(v - step.a) <= (step.tol ?? 0) + 1e-9;
    grade(step, rt, ok ? 1 : 0, un.get());
    inp.disabled = true; btn.remove(); un.el.remove();
    const trap = !ok && (step.traps || []).find((t) => Math.abs(t.v - v) <= Math.max(step.tol ?? 0, Math.abs(t.v) * 0.002));
    wrap.append(feedbackBox(step, ok, { answer: `${nf(step.a, 2)} ${step.unit || ''}`, err: trap ? trap.why : `Bạn nhập ${nf(v, 2)}. Hãy xem lại từng bước tính bên dưới.`, unsure: un.get() }), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  } }, 'Kiểm tra');
  inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') btn.click(); });
  wrap.append(h('div', { class: 'numrow' }, inp, step.unit && h('span', { class: 'unit' }, step.unit)), un.el, btn);
  return wrap;
}

function stepSort(step, rt, next) {
  const pick = step.items.map(() => -1);
  const wrap = h('div', { class: 'quiz' }, h('p', { class: 'q' }, step.q));
  const list = h('div', { class: 'sort' });
  const check = h('button', { class: 'btn primary', disabled: true }, 'Kiểm tra');
  step.items.forEach(([label], i) => {
    const row = h('div', { class: 'sort-row' }, h('div', { class: 'sort-item' }, label));
    const cats = h('div', { class: 'sort-cats' }, step.cats.map((c, ci) => h('button', { class: 'chip', onclick: (e) => { pick[i] = ci; [...cats.children].forEach((b, j) => b.classList.toggle('on', j === ci)); check.disabled = pick.includes(-1); } }, c)));
    row.append(cats); list.append(row);
  });
  check.onclick = () => {
    const right = step.items.map(([, c], i) => pick[i] === c);
    const frac = right.filter(Boolean).length / right.length;
    grade(step, rt, frac >= 0.999 ? 1 : frac * 0.5, false);
    [...list.children].forEach((row, i) => { row.classList.add(right[i] ? 'right' : 'wrong'); row.querySelectorAll('button').forEach((b) => (b.disabled = true)); if (!right[i]) row.append(h('div', { class: 'sort-fix' }, '→ ', step.cats[step.items[i][1]])); });
    check.remove();
    wrap.append(feedbackBox(step, frac >= 0.999, { answer: `${Math.round(frac * 100)}% đúng`, err: 'Xem các dòng được đánh dấu đỏ và nhóm đúng của chúng.' }), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  };
  wrap.append(list, check);
  return wrap;
}

export function modelPanel(key, onChange) {
  const M = MODELS[key];
  const vals = Object.fromEntries(M.inputs.map((i) => [i.k, i.val]));
  const out = h('div', { class: 'mout' });
  const draw = () => {
    const r = M.compute(vals);
    out.innerHTML = '';
    out.append(h('div', { class: 'mrows' }, r.rows.map(([l, v, f]) => h('div', { class: 'mrow' }, h('span', {}, l), h('b', {}, f === 'bool' ? (v ? 'Có' : 'Không') : fmt[f](v))))));
    if (r.warn) out.append(h('div', { class: 'warn' }, r.warn));
    if (r.checks) out.append(h('div', { class: 'checks' }, r.checks.map(([l, okk]) => h('span', { class: 'chk ' + (okk ? 'ok' : 'bad') }, okk ? '✔ ' : '✘ ', l))));
    if (r.table) out.append(dataTable(r.table.head, r.table.rows.map((row) => row.map((c, i) => (i === 0 ? c : Math.abs(c) < 100 ? Math.round(c * 100) / 100 : Math.round(c * 10) / 10)))));
    if (r.sens) {
      const s = r.sens;
      out.append(h('div', { class: 'sens' }, h('b', {}, '📐 Sensitivity: ', s.title),
        h('table', { class: 'tbl sens-t' }, h('thead', {}, h('tr', {}, h('th', {}, `${s.rowLabel} ↓ / ${s.colLabel} →`), s.cols.map((c) => h('th', {}, c)))),
          h('tbody', {}, s.cells.map((row, ri) => h('tr', {}, h('th', {}, s.rows[ri]), row.map((c, ci) => h('td', { class: ri === s.base[0] && ci === s.base[1] ? 'base' : (Number.isFinite(c) && c < 0 ? 'neg' : '') }, fmt[s.f](c)))))))));
    }
    onChange && onChange(r.out, vals);
  };
  const inputs = h('div', { class: 'minputs' }, M.inputs.map((i) => {
    const lab = h('b', {}, fmt[i.f](i.val));
    const sl = h('input', { type: 'range', min: i.min, max: i.max, step: i.step, value: i.val, 'aria-label': i.label });
    sl.addEventListener('input', () => { vals[i.k] = Number(sl.value); lab.textContent = fmt[i.f](vals[i.k]); draw(); });
    return h('label', { class: 'min' }, h('span', {}, i.label, ': ', lab), sl);
  }));
  const el = h('div', { class: 'model' }, h('h4', {}, '🧮 ', M.title), h('p', { class: 'note' }, M.note), inputs, out);
  draw();
  return el;
}

function stepModel(step, rt, next) {
  const btn = h('button', { class: 'btn primary', disabled: !!step.goal }, 'Tiếp tục ▸');
  const goal = step.goal ? h('div', { class: 'goal' }, '🎯 ', step.goal.text) : null;
  const panel = modelPanel(step.model, (o, v) => { if (step.goal) { const ok = step.goal.check(o, v); btn.disabled = !ok; goal.classList.toggle('done', ok); } });
  btn.onclick = next;
  return h('div', {}, goal, panel, btn);
}

function stepChoice(step, rt, next) {
  const wrap = h('div', { class: 'quiz' }, h('p', { class: 'q' }, step.q));
  const opts = h('div', { class: 'opts' });
  step.opts.forEach((o, idx) => opts.append(h('button', { class: 'opt', onclick: () => {
    [...opts.children].forEach((b, j) => { b.disabled = true; b.classList.add(j === idx ? 'chosen' : 'dim'); });
    if (o.v) for (const [k, v] of Object.entries(o.v)) rt.vars[k] = typeof v === 'number' ? (rt.vars[k] || 0) + v : v; // numeric vars accumulate (e.g. rapport)
    if (o.fx) { rt.fx.push(o.fx); if (o.fx.flags) Object.assign(rt.flags, o.fx.flags); }
    if (step.grade) { const ok = step.best.includes(idx); rt.graded += 1; rt.correct += ok ? 1 : 0; chime(ok ? 'ok' : 'bad'); }
    else chime('tap');
    wrap.append(h('div', { class: 'outcome-txt' }, '➜ ', o.out), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  } }, o.t)));
  wrap.append(opts);
  return wrap;
}

function stepInvestigate(step, rt, next) {
  const known = step.opts.filter((o) => S.tl.flags[o.flag]);
  let left = step.picks;
  const wrap = h('div', { class: 'quiz' }, h('p', { class: 'q' }, step.q));
  const counter = h('div', { class: 'goal' });
  const upd = () => (counter.textContent = `🔎 Còn ${left} lượt kiểm tra`);
  const opts = h('div', { class: 'opts' });
  const reveal = (o, btn, free) => { rt.flags[o.flag] = true; btn.disabled = true; btn.classList.add('chosen'); btn.append(h('div', { class: 'reveal' }, (free ? '(Bạn đã tự khám phá) ' : '') + o.reveal)); };
  step.opts.forEach((o) => {
    const b = h('button', { class: 'opt' }, o.t);
    if (known.includes(o)) reveal(o, b, true);
    else b.onclick = () => { if (left <= 0) return; left--; reveal(o, b, false); upd(); chime('tap'); if (left === 0) finish(); };
    opts.append(b);
  });
  const finish = () => {
    [...opts.children].forEach((b) => (b.disabled = true));
    const ok = !!rt.flags.saw_oven;
    if (step.id) { rt.graded += 1; rt.correct += ok ? 1 : 0.5; recordAnswer(step.id, step.concept, rt.q.id, ok, false); }
    wrap.append(h('div', { class: 'outcome-txt' }, ok ? '➜ Bạn đã tìm ra khoản capex ẩn — đúng điều Mẹ cảnh báo.' : '➜ Bạn đã thu thập thông tin. Liệu còn rủi ro nào bạn chưa thấy?'), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  };
  upd();
  wrap.append(counter, opts);
  if (known.length >= step.opts.length) finish();
  return wrap;
}

function stepNegotiate(step, rt, next) {
  let st = initNegotiation(step);
  const sell = step.role === 'sell';
  const who = NPCS[step.who];
  const wrap = h('div', { class: 'nego' });
  const chosen = new Set();
  const offerLab = h('b', {});
  const slider = h('input', { type: 'range', min: step.min, max: step.max, step: step.step, value: step.start, 'aria-label': 'Mức đề nghị' });
  const setLab = () => (offerLab.textContent = `${nf(Number(slider.value))} ${step.unit}`);
  slider.addEventListener('input', setLab); setLab();
  const log = h('div', { class: 'nlog' });
  const trust = h('div', { class: 'meter' }, h('i', {}));
  const askEl = h('div', { class: 'ask' });
  const controls = h('div', { class: 'ncontrols' });
  const redraw = () => {
    trust.firstChild.style.width = Math.max(0, st.trust) + '%';
    trust.className = 'meter ' + (st.trust < 30 ? 'low' : '');
    askEl.innerHTML = `${sell ? 'Đối phương đang trả' : 'Mức đối phương đòi'}: <b>${nf(st.ask)} ${step.unit}</b>${st.final ? ' — <i>đề nghị cuối cùng</i>' : ''}`;
  };
  const end = (res) => {
    rt.vars[step.id] = res; if (res.deal) rt.negotiated = true;
    controls.innerHTML = '';
    if (step.id) { rt.graded += 0; }
    log.append(h('div', { class: 'nmsg sys' }, res.deal ? `🤝 Thoả thuận đạt được ở ${nf(res.price)} ${step.unit}.` : res.walked ? '🚪 Bạn rời bàn đàm phán.' : `🚪 ${who.name} rời bàn đàm phán.`));
    chime(res.deal ? 'reward' : 'bad');
    controls.append(h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  };
  const say = (text, me) => log.append(h('div', { class: 'nmsg ' + (me ? 'me' : '') }, h('b', {}, me ? S.account.playerName : who.name), ' ', text));
  const build = () => {
    controls.innerHTML = '';
    if (!st.final) controls.append(h('label', { class: 'min' }, h('span', {}, sell ? 'Mức bạn yêu cầu: ' : 'Đề nghị của bạn: ', offerLab), slider));
    if (step.issues?.length && !st.final) controls.append(h('div', { class: 'issues' }, step.issues.map((i) => h('label', { class: 'issue' }, h('input', { type: 'checkbox', checked: chosen.has(i.id), onchange: (e) => (e.target.checked ? chosen.add(i.id) : chosen.delete(i.id)) }), ' ', i.t))));
    const row = h('div', { class: 'nbtns' });
    if (!st.final) row.append(h('button', { class: 'btn primary', onclick: () => {
      const offer = Number(slider.value);
      say(`${sell ? 'Chúng tôi đề nghị' : 'Tôi đề nghị'} ${nf(offer)} ${step.unit}${chosen.size ? ' + ' + [...chosen].map((id) => step.issues.find((x) => x.id === id).t.toLowerCase()).join('; ') : ''}.`, true);
      const r = negotiateRound(step, st, offer, [...chosen]); st = r.state;
      if (r.accepted) { say('Được, tôi đồng ý.'); return end({ deal: true, price: offer, issues: [...chosen], lastAsk: offer }); }
      say(r.insult ? `Mức đó thật sự không nghiêm túc. ${sell ? 'Chúng tôi chỉ trả' : 'Tôi cần ít nhất'} ${nf(st.ask)}.` : `${sell ? 'Chúng tôi có thể nâng lên' : 'Tôi có thể giảm xuống'} ${nf(st.ask)} ${step.unit}.`);
      if (st.ended) return end({ deal: false, lastAsk: st.ask });
      if (st.final) say('Đây là mức cuối cùng của tôi.');
      redraw(); build();
    } }, 'Gửi đề nghị'));
    row.append(h('button', { class: 'btn', onclick: () => { say(`Đồng ý với mức ${nf(st.ask)}.`, true); end({ deal: true, price: st.ask, issues: [...chosen], lastAsk: st.ask }); } }, `Chấp nhận ${nf(st.ask)}`));
    row.append(h('button', { class: 'btn ghost', onclick: () => end({ deal: false, walked: true, lastAsk: st.ask }) }, 'Rời bàn đàm phán'));
    controls.append(row);
  };
  wrap.append(h('div', { class: 'nhead' }, h('div', { class: 'pt', html: portraitSVG(who.look, 54) }), h('div', {}, h('b', {}, '🤝 Đàm phán với ', who.name), h('p', { class: 'note' }, step.intro), h('p', { class: 'note' }, '🛟 BATNA của bạn: ', step.batna), h('div', { class: 'tl' }, 'Niềm tin: ', trust))), askEl, log, controls);
  redraw(); build();
  return wrap;
}

function stepDebug(step, rt, next) {
  const marked = new Set();
  const wrap = h('div', { class: 'quiz' }, h('p', { class: 'q' }, step.q));
  const tb = h('div', { class: 'dbg' });
  step.rows.forEach((r, i) => tb.append(h('button', { class: 'dbg-row', onclick: (e) => { marked.has(i) ? marked.delete(i) : marked.add(i); e.currentTarget.classList.toggle('on'); } }, h('span', {}, r.l), h('code', {}, r.f), h('b', {}, r.v))));
  const btn = h('button', { class: 'btn primary', onclick: () => {
    const bad = step.rows.map((r, i) => (r.bad ? i : -1)).filter((i) => i >= 0);
    const tp = bad.filter((i) => marked.has(i)).length, fp = [...marked].filter((i) => !step.rows[i].bad).length;
    const frac = Math.max(0, (tp - fp) / bad.length);
    grade(step, rt, frac >= 0.999 ? 1 : frac, false);
    [...tb.children].forEach((el, i) => { el.disabled = true; const r = step.rows[i]; if (r.bad) { el.classList.add(marked.has(i) ? 'right' : 'missed'); el.append(h('em', {}, r.why)); } else if (marked.has(i)) el.classList.add('wrong'); });
    btn.remove();
    wrap.append(feedbackBox(step, frac >= 0.999, { answer: `Tìm đúng ${tp}/${bad.length} lỗi, ${fp} báo nhầm`, err: 'Dòng viền cam là lỗi bạn bỏ sót; dòng đỏ là báo nhầm.' }), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
  } }, 'Kiểm tra mô hình');
  wrap.append(tb, btn);
  return wrap;
}

function stepDoc(step, rt, next) {
  return h('div', { class: 'doc' }, h('h4', {}, '📄 ', step.title), step.table && dataTable(step.table.head, step.table.rows), step.body && h('p', { class: 'note' }, step.body), h('button', { class: 'btn primary', onclick: next }, 'Tiếp tục ▸'));
}

function stepOutcome(step, rt, next) {
  const sc = rt.graded ? rt.correct / rt.graded : 1;
  const r = step.eval(rt, S, sc);
  if (r.fx) rt.fx.push(r.fx);
  if (r.fx?.flags) Object.assign(rt.flags, r.fx.flags);
  if (typeof r.score === 'number') rt.outcomeScore = r.score;
  if (r.retry) rt.retry = true;
  rt.outcomeText = r.text;
  return h('div', { class: 'outcome' }, h('div', { class: 'outcome-badge' }, '📜 Kết quả'), h('p', {}, r.text), h('button', { class: 'btn primary', onclick: next }, 'Hoàn thành ▸'));
}

// ---------- multi-year fund simulation (state persisted in S.tl.sim, resumable) ----------
const SECTOR_ICON = { healthcare: '🩺', saas: '💻', industrial: '🏭', education: '🎓', consulting: '🧭', consumer: '🛍️', energy: '☀️', logistics: '🚚', ai: '🤖', realestate: '🏢' };
const cycLabel = (c) => (c <= 0.4 ? 'Phòng thủ' : c <= 1 ? 'Chu kỳ vừa' : 'Chu kỳ cao');
const jcCaption = (jc) => h('p', { class: 'note' }, jc.trough ? `📉 Đáy J-curve: ${nf(jc.trough.value, 1)} triệu USD ở năm ${jc.trough.y} — phí và vốn gọi đi trước, lợi nhuận đến sau. ` : '', jc.breakeven ? `📈 LP hoà vốn tiền mặt ở năm ${jc.breakeven}.` : '📈 LP chưa hoà vốn tiền mặt trong vòng đời quỹ.', ' Thoái vốn sớm làm J nông hơn và hoà vốn sớm hơn (DPI, IRR cao hơn) nhưng có thể hy sinh TVPI.');
function stepFundSim(step, rt, next) {
  const vf = (x, d) => Number(x).toLocaleString('vi-VN', { minimumFractionDigits: d, maximumFractionDigits: d });
  const tl = S.tl;
  const spec = tl.spec?.primary && tl.spec.primary !== 'generalist' ? tl.spec.primary : null;
  const key = { fund2: 'sim2', fund3: 'sim3' }[step.scenario] || 'sim';
  const fee = tl.flags.fund_fee || 200;
  const cfg = {
    fund2: { scenario: 'fund2', committed: tl.flags.fund2_size || 350, feeBps: fee, spec, crises: true },
    fund3: { scenario: 'fund3', committed: tl.flags.fund3_size || 500, feeBps: fee, spec, crises: true, opTeam: !!tl.flags.op_team },
  }[step.scenario] || { committed: tl.flags.fund_size || 200, feeBps: fee, spec };
  if (!tl[key]) tl[key] = FS.createSim(cfg);
  const wrap = h('div', { class: 'fsim' });
  const money = (x) => nf(x, 1);
  const reset = () => { if (confirm('Chạy lại mô phỏng từ năm 1? Tiến độ hiện tại sẽ bị thay thế.')) { tl[key] = null; notify(); wrap.replaceWith(stepFundSim(step, rt, next)); } };
  const act = (fn) => { const err = fn(); if (err) toast('⚠ ' + err); else chime('tap'); notify(); draw(); };
  const stat = ([k, v]) => h('div', { class: 'stat' }, h('small', {}, k), h('b', {}, v));
  const draw = () => {
    const s = tl[key]; wrap.innerHTML = '';
    if (s.done) {
      const r = s.result;
      wrap.append(h('div', { class: 'outcome-badge' }, '📊 Báo cáo cuối đời quỹ'),
        h('div', { class: 'stats' }, [['Net TVPI',vf( r.netTvpi, 2) + 'x'], ['Net IRR',vf( (r.netIrr * 100), 1) + '%'], ['Gross MOIC',vf( r.grossMoic, 2) + 'x'], ['Carry GP', money(r.carry)], ['Phí', money(r.fees)], ['Xoá sổ', r.writeOffs], ['Quartile', 'Q' + r.quartile], ['DPI năm 7', r.dpi7 != null ? vf(r.dpi7, 2) + 'x' : '—'], ['KS-PME', r.pme != null ? vf(r.pme, 2) : '—'], ['Chỉ số niêm yết', r.publicTr != null ? vf(r.publicTr, 2) + 'x' : '—']].map(stat)),
        jCurveChart(FS.jCurve(s)), jcCaption(FS.jCurve(s)),
        h('p', { class: 'note' }, 'Benchmark mô phỏng (Simulation Assumption): Q1 ≥ 2,0x net TVPI; Q2 ≥ 1,6x; Q3 ≥ 1,3x. Khoảng cách gross–net đến từ phí và carry. KS-PME > 1 nghĩa là quỹ thắng một chỉ số cổ phiếu niêm yết hư cấu đi cùng chu kỳ, với cùng thời điểm dòng tiền.'),
        h('div', { class: 'nlog' }, s.log.slice(-8).map((l) => h('div', { class: 'nmsg' }, l))),
        h('div', { class: 'nbtns' }, h('button', { class: 'btn', onclick: () => LP.openReport(s, { playerName: S.account.playerName, timelineName: tl.name }) }, '📄 Xem / in báo cáo LP'), h('button', { class: 'btn', onclick: () => LP.downloadReport(s, { playerName: S.account.playerName, timelineName: tl.name }) }, '⬇️ Tải báo cáo (.html)')),
        h('button', { class: 'btn primary', onclick: () => { rt.vars.sim = r; next(); } }, 'Trình bày kết quả với LP ▸'),
        h('button', { class: 'btn ghost', onclick: reset }, '↺ Mô phỏng lại'));
      return;
    }
    const R = FS.regimeOf(s.year, s), nextR = s.year < FS.YEARS ? FS.regimeOf(s.year + 1, s) : null, m = FS.metrics(s);
    const free = Math.max(0, m.dry - FS.reserveForFees(s));
    wrap.append(
      h('div', { class: 'goal' }, h('b', {}, `Năm ${s.year}/${FS.YEARS} · ${R.icon} ${R.name}`), h('div', {}, R.why), nextR && h('div', { class: 'muted' }, `🔭 TS. Thu Hà dự báo năm tới: ${nextR.icon} ${nextR.name}.`)),
      h('div', { class: 'stats' }, [['Vốn khả dụng', money(free)], ['Paid-in', money(m.paidIn)], ['Đã phân phối', money(m.dists)], ['NAV', money(m.nav)], ['DPI',vf( m.dpi, 2) + 'x'], ['TVPI',vf( m.tvpi, 2) + 'x']].map(stat)),
      ...(s.year > 1 ? [jCurveChart(FS.jCurve(s), { title: 'J-curve đến nay — dòng tiền ròng của LP (triệu USD)' })] : []));
    if (s.pending) {
      const E = FS.FUND_EVENTS[s.pending], who = NPCS[E.who];
      wrap.append(h('div', { class: 'qcard crisis-card' },
        h('div', { class: 'qk' }, `⛈️ Khủng hoảng ${FS.SCENARIOS[s.scenario]?.name || 'quỹ'} · cần quyết định trước khi sang năm mới`),
        h('b', {}, E.icon, ' ', E.title),
        h('p', {}, who ? h('b', {}, who.name + ': ') : '', s.pendingStory),
        h('p', { class: 'muted' }, '📘 ', E.lesson),
        h('div', { class: 'opts' }, E.options.map((o, k) => h('button', { class: 'btn opt', onclick: () => { act(() => FS.resolveEvent(s, k)); toast(o.out); } }, o.t)))));
      return;
    }
    if (s.year <= FS.investYears(s)) {
      const offers = FS.offers(s);
      wrap.append(h('h4', {}, `💼 Cơ hội năm ${s.year} (giai đoạn đầu tư: năm 1–${FS.investYears(s)})`), ...(offers.length ? offers.map((d) => {
        const cheque = FS.fundCheque(s, d), share = cheque / FS.equityCheck(d), err = FS.canInvest(s, d.id);
        return h('div', { class: 'qcard available' }, h('div', { class: 'qk' }, SECTOR_ICON[d.sector] || '🏷️', ' ', d.sector, spec === d.sector ? ' · ⭐ ngành chuyên môn của bạn (+2%/năm)' : ''), h('b', {}, d.name),
          h('p', {}, `EBITDA ${d.ebitda} · Giá ${d.mult}x${d.fair && d.fair !== d.mult ? ` (trung vị ngành ~${d.fair}x)` : ''} · Nợ ${d.lev}x · Tăng trưởng nền ${Math.round(d.g * 100)}%/năm · ${cycLabel(d.cyc)}${d.large ? ' · Large-cap' : ''}`),
          d.redflag && h('p', { class: 'warn' }, '⚠ ', d.redflag),
          d.ai && h('p', { class: d.ai < 0 ? 'warn' : 'muted' }, d.ai < 0 ? '⚠ Mô hình dễ bị AI thay thế (tác động từ năm 4)' : '🤖 Hưởng lợi từ AI'),
          h('button', { class: 'btn sm primary', disabled: !!err, onclick: () => act(() => FS.invest(s, d.id)) }, `Đầu tư ${money(cheque)}${share < 1 ? ` (${Math.round(share * 100)}% cổ phần)` : ''}`), err && h('small', { class: 'muted' }, ' ', err));
      }) : [h('p', { class: 'muted' }, 'Đã xem hết cơ hội năm nay.')]));
    }
    wrap.append(h('h4', {}, `📁 Danh mục (${s.holdings.filter((x) => x.status === 'held').length} đang nắm giữ)`), ...(s.holdings.length ? s.holdings.map((x, i) => {
      const d = FS.ALL_DEALS[x.id], val = x.status === 'held' ? FS.equityValue(x, s.year, s) : x.proceeds, moic = x.cost ? val / x.cost : 0;
      const exitErr = x.status === 'held' ? FS.canExit(s, i) : null;
      return h('div', { class: 'qcard ' + (x.status === 'held' ? (x.distressed ? 'locked' : 'available') : 'done') }, h('b', {}, SECTOR_ICON[d.sector] || '', ' ', d.name),
        h('p', {}, x.status === 'held' ? `EBITDA ${vf(x.ebitda, 1)} · Nợ/EBITDA ${vf((x.debt / x.ebitda), 1)}x · Bội số ${vf(FS.curMultiple(x, s.year, s), 1)}x · Giá trị ${money(val)} · MOIC ${vf(moic, 2)}x` : x.status === 'exited' ? `Đã thoái năm ${x.exitYear}: nhận ${money(val)} · MOIC ${vf(moic, 2)}x` : `Xoá sổ năm ${x.exitYear}`),
        x.distressed && h('p', { class: 'warn' }, `⚠ Vi phạm covenant. Bơm ${money(FS.cureCost(x))} để đưa nợ về 5x EBITDA, hoặc giao công ty cho chủ nợ.`),
        x.status === 'held' && h('div', { class: 'nbtns' }, x.distressed
          ? [h('button', { class: 'btn sm primary', onclick: () => act(() => FS.cure(s, i)) }, `Equity cure ${money(FS.cureCost(x))}`), h('button', { class: 'btn sm ghost', onclick: () => act(() => FS.writeOff(s, i)) }, 'Giao cho chủ nợ')]
          : [h('button', { class: 'btn sm', disabled: !!exitErr, onclick: () => act(() => FS.exit(s, i)) }, `Thoái vốn (${money(val)})`), exitErr && h('small', { class: 'muted' }, ' ', exitErr),
            s.vcp && (x.vcpDone ? h('small', { class: 'muted' }, ` 🛠️ Kế hoạch tạo giá trị${x.vcpYears ? ` (còn ${x.vcpYears} năm)` : ' đã hoàn tất'}`)
              : h('button', { class: 'btn sm primary', disabled: !!FS.canVcp(s, i), title: FS.canVcp(s, i) || '', onclick: () => act(() => FS.valueCreation(s, i)) }, `🛠️ Tạo giá trị (${money(FS.vcpCost(s, x))})`))]),
        x.status === 'held' && d.ai && s.aiYear && h('small', { class: d.ai < 0 && !x.transformed ? 'warn' : 'muted' }, d.ai < 0 ? (x.transformed ? '🤖 Đã chuyển đổi AI' : '⚠ Mô hình dễ bị AI thay thế') : '🤖 Hưởng lợi từ AI'));
    }) : [h('p', { class: 'muted' }, 'Chưa có khoản đầu tư nào.')]));
    wrap.append(h('div', { class: 'nlog' }, s.log.slice(-4).map((l) => h('div', { class: 'nmsg' }, l))),
      h('button', { class: 'btn primary', onclick: () => { if (s.holdings.some((x) => x.status === 'held' && x.distressed) && !confirm('Còn công ty vi phạm covenant chưa xử lý — chúng sẽ bị xoá sổ. Tiếp tục?')) return; act(() => FS.advance(s)); wrap.scrollIntoView(); } }, s.year === FS.YEARS ? 'Kết thúc năm 10 & thanh lý quỹ ▸' : `Kết thúc năm ${s.year} ▸`),
      h('button', { class: 'btn ghost', onclick: reset }, '↺ Bắt đầu lại'));
  };
  draw();
  return wrap;
}

const RENDER = { say: stepSay, quiz: stepQuiz, num: stepNum, sort: stepSort, model: stepModel, choice: stepChoice, investigate: stepInvestigate, negotiate: stepNegotiate, debug: stepDebug, doc: stepDoc, outcome: stepOutcome, fundsim: stepFundSim };

/** Run a quest. host = { mount(el), close(), done(result) } */
export function runMission(qid, host) {
  const q = QUEST_BY_ID[qid];
  const rt = { q, idx: -1, vars: {}, flags: {}, fx: [], graded: 0, correct: 0, negotiated: false, outcomeScore: null, outcomeText: '' };
  const body = h('div', { class: 'm-body' });
  const prog = h('div', { class: 'm-prog' });
  const sheet = h('div', { class: 'sheet mission' },
    h('div', { class: 'm-head' }, h('div', {}, h('small', {}, kindLabel(q.kind)), h('h3', {}, q.title)), h('button', { class: 'x', 'aria-label': 'Thoát nhiệm vụ', onclick: () => { if (confirm('Thoát nhiệm vụ? Tiến độ của nhiệm vụ này sẽ không được lưu.')) host.close(); } }, '✕')),
    prog, body);
  host.mount(sheet);
  const nextStep = async () => {
    while (++rt.idx < q.steps.length) { const s = q.steps[rt.idx]; if (!s.when || s.when(rt, S)) break; }
    prog.style.setProperty('--p', Math.min(1, rt.idx / q.steps.length));
    if (rt.idx >= q.steps.length) return finish();
    const s = q.steps[rt.idx];
    body.innerHTML = '';
    const tc = termCards(s);
    if (tc) body.append(tc);
    body.append(RENDER[s.type](s, rt, nextStep));
    body.scrollTop = 0; sheet.scrollTop = 0;
  };
  const finish = async () => {
    const n = rt.graded + (rt.outcomeScore !== null ? 1 : 0);
    const score = n ? (rt.correct + (rt.outcomeScore ?? 0)) / n : 1;
    const res = await completeQuest(qid, { score: Math.max(0, Math.min(1, score)), fx: rt.fx, outcome: rt.outcomeText, negotiated: rt.negotiated, graded: rt.graded, retry: rt.retry });
    host.done({ ...res, score, quest: q });
  };
  nextStep();
}

export function kindLabel(k) { return { main: '⭐ Cốt truyện chính', mentor: '🌸 Nhiệm vụ mentor', deal: '💼 Deal simulation', politics: '🎭 Office politics', network: '🤝 Networking', career: '🏛️ Nhiệm vụ sự nghiệp', macro: '🌐 Macro strategy', industry: '🏫 Học viện Ngành', transition: '🔀 Chuyển ngành', endgame: '👑 The Capital Architect', crisis: '⛈️ Phòng khủng hoảng', succession: '🕯️ Kế nhiệm', case: '📜 Hồ sơ lịch sử', replay: '🎭 Replay đa góc nhìn' }[k] || k; }

/** Spaced-repetition review of a single past question (no rewards — mastery only). */
export function runReview(qid, host) {
  let step = null, src = null;
  for (const q of QUESTS) for (const s of q.steps) if (s.id === qid) { step = s; src = q; }
  if (!step) return false;
  const rt = { q: src, vars: {}, flags: {}, fx: [], graded: 0, correct: 0 };
  const body = h('div', { class: 'm-body' });
  const sheet = h('div', { class: 'sheet mission' }, h('div', { class: 'm-head' }, h('div', {}, h('small', {}, '📚 Ôn tập — ', src.title), h('h3', {}, host.label || 'Câu hỏi ôn tập')), h('button', { class: 'x', onclick: () => host.close() }, '✕')), body);
  host.mount(sheet);
  const fn = { quiz: stepQuiz, num: stepNum, sort: stepSort, debug: stepDebug }[step.type];
  body.append(fn(step, rt, () => host.done({ review: true, correct: rt.correct >= rt.graded })));
  return true;
}

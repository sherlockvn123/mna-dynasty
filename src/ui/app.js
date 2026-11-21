// App shell: HUD, navigation, overlays, NPC dialogue, rewards, chapter transitions, onboarding.
import { h, nf } from './dom.js';
import * as St from '../engine/store.js';
import { S } from '../engine/store.js';
import { NPCS, CHAPTER_INFO } from '../content/characters.js';
import { LOCATIONS, INFO_DOCS } from '../content/locations.js';
import { ITEMS, ACHIEVEMENTS } from '../content/items.js';
import { CAREERS } from '../content/careers.js';
import { QUEST_BY_ID, DIAGNOSTIC } from '../content/quests.js';
import { createWorld, playerLook } from './world.js';
import { runMission, runReview, kindLabel } from './mission.js';
import { portraitSVG, chibiSVG } from './chibi.js';
import * as P from './panels.js';
import { confetti, chime, toast } from './fx.js';
import * as LS from '../engine/lenses.js';
import { LENSES } from '../content/quests_replay.js';

const PANELS = { quests: P.questsPanel, inventory: P.inventoryPanel, relations: P.relationsPanel, skills: P.skillsPanel, map: P.mapPanel, glossary: P.glossaryPanel, review: P.reviewPanel, multiverse: P.multiversePanel, hall: P.hallPanel, workbench: P.workbenchPanel, career: P.careerPanel, academy: P.academyPanel, legacy: P.legacyPanel, league: P.leaguePanel, log: P.logPanel, settings: P.settingsPanel };

export function startApp() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const worldEl = h('div', { id: 'world' });
  const hud = h('header', { id: 'hud' });
  const nav = h('nav', { id: 'nav' });
  const overlay = h('div', { id: 'overlay', class: 'hidden' });
  app.append(worldEl, hud, nav, overlay);
  let current = null; // {name}
  const ui = {
    blocked: () => !overlay.classList.contains('hidden'),
    mount(el) { overlay.innerHTML = ''; overlay.append(el); overlay.classList.remove('hidden'); el.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => ui.closeAll())); },
    closeAll() { overlay.classList.add('hidden'); overlay.innerHTML = ''; current = null; renderHud(); world.refresh(); },
    open(name) { current = name; ui.mount(PANELS[name](ui)); },
    reopen(name) { ui.open(name); },
    openCase(id) { current = 'case'; ui.mount(P.caseViewer(id, ui)); },
    toast,
    startQuest,
    review(qid) { runReview(qid, { mount: ui.mount, close: () => ui.open('review'), done: () => { St.notify(); ui.open('review'); } }); },
    lensReview(lens, from = 'skills') {
      const ids = LS.lensReviewQueue(lens, S.account);
      if (!ids.length) { toast('Chưa có câu nào để ôn ở góc nhìn này — hãy chơi một replay trước.'); return; }
      let i = 0, ok = 0;
      const next = () => {
        if (i >= ids.length) { St.notify(); ui.open(from); toast(`${LENSES[lens].icon} Ôn tập ${LENSES[lens].name}: đúng ${ok}/${ids.length}. Câu sai sẽ quay lại theo lịch ôn tập.`); return; }
        current = 'mission';
        runReview(ids[i], { label: `${LENSES[lens].icon} Ôn tập ${LENSES[lens].name} — câu ${i + 1}/${ids.length}`, mount: ui.mount, close: () => ui.open(from), done: (r) => { if (r.correct) ok += 1; i += 1; next(); } });
      };
      next();
    },
  };
  overlay.addEventListener('pointerdown', (e) => { if (e.target === overlay && current && current !== 'mission') ui.closeAll(); });

  const world = createWorld(worldEl, { isBlocked: ui.blocked, onNpc: openNpc, onObject });
  ui.world = world;

  function startQuest(qid) {
    current = 'mission';
    runMission(qid, { mount: ui.mount, close: () => ui.closeAll(), done: (res) => showRewards(res) });
  }

  function openNpc(id) {
    const N = NPCS[id];
    const lines = N.lines[S.tl.chapter] || N.lines.child || ['...'];
    const line = lines[(S.tl.slot + Object.keys(S.tl.questsDone).length) % lines.length];
    const qs = St.questsForNpc(id);
    const r = S.tl.rel[id];
    const box = h('div', { class: 'sheet dialog' },
      h('div', { class: 'dlg-top' }, h('div', { class: 'pt big', html: portraitSVG(N.look, 84) }), h('div', {}, h('b', {}, N.name), h('small', {}, N.role), h('div', { class: 'mini' }, `Trust ${r.trust} · Respect ${r.respect}`)), h('button', { class: 'x', onclick: () => ui.closeAll() }, '✕')),
      h('p', { class: 'dlg-line' }, '“', line, '”'),
      h('div', { class: 'dlg-opts' },
        qs.map((q) => h('button', { class: 'opt quest', onclick: () => startQuest(q.id) }, h('small', {}, kindLabel(q.kind)), h('b', {}, '▶ ', q.title), h('span', {}, q.summary))),
        h('button', { class: 'opt', onclick: () => { const gained = St.talk(id); toast(gained ? `💬 Trò chuyện vui vẻ với ${N.name} (+1 Trust)` : `💬 ${N.name} đang bận — quay lại vào buổi khác nhé.`); ui.closeAll(); } }, '💬 Trò chuyện'),
        h('button', { class: 'opt', onclick: () => { box.querySelector('.dlg-line').textContent = N.bio + (N.expertise ? ' · Chuyên môn: ' + N.expertise.join(', ') : ''); } }, '📇 Hồ sơ nhân vật'),
        h('button', { class: 'opt ghost', onclick: () => ui.closeAll() }, 'Tạm biệt')));
    current = 'npc'; ui.mount(box); chime('tap');
  }

  function onObject(o) {
    const a = o.action;
    if (a.type === 'go') { if (St.travel(a.to)) { chime('tap'); toast('📍 ' + LOCATIONS[a.to].name); } else toast('🔒 Chưa mở khoá'); return; }
    if (a.type === 'panel') return ui.open(a.panel);
    if (a.type === 'case') return ui.openCase(a.case);
    if (a.type === 'career_office') { const t = S.tl.career?.track; if (!t) return ui.open('career'); St.travel(CAREERS[t].office); return; }
    if (a.type === 'info') {
      const d = INFO_DOCS[a.info];
      if (d.flag) St.setFlag(d.flag, true);
      current = 'info';
      ui.mount(h('div', { class: 'sheet panel' }, h('div', { class: 'm-head' }, h('h3', {}, d.title), h('button', { class: 'x', 'data-close': '1' }, '✕')), h('div', { class: 'p-body' }, d.body.split('\n').map((l) => h('p', {}, l)), h('p', { class: 'muted' }, '🔎 Thông tin này đã được ghi nhận — hữu ích cho Due Diligence.'))));
      return;
    }
    if (a.type === 'quest') {
      const q = St.questsForObject(S.tl.loc, o.id)[0] || QUEST_BY_ID[a.quest]; // an object can host several quests over time
      const st = St.questStatus(q);
      if (st === 'available') return startQuest(q.id);
      toast(st === 'done' ? `✔ Đã hoàn thành: ${q.title}` : `🔒 ${q.title} — chưa mở`);
    }
  }

  function showRewards(res) {
    if (res.duplicate) { ui.closeAll(); return; }
    if (res.retry) { current = 'reward'; ui.mount(h('div', { class: 'sheet reward' }, h('div', { class: 'burst' }, '🌱'), h('h3', {}, 'Chưa thành công'), h('p', { class: 'rq' }, res.quest.title), h('p', {}, 'Không có phần thưởng nào được ghi nhận. Bạn có thể ôn lại (Menu → Ôn tập) và thử lại bất cứ lúc nào.'), h('button', { class: 'btn primary', onclick: () => ui.closeAll() }, 'Đã hiểu ▸'))); chime('bad'); return; }
    const g = res.gained || {};
    const pct = Math.round((res.score ?? 1) * 100);
    const rows = [];
    if (g.xp) rows.push(['✨', `+${g.xp} Knowledge XP`]);
    if (g.rep) rows.push([g.rep > 0 ? '⭐' : '⚠️', `${g.rep > 0 ? '+' : ''}${g.rep} Reputation`]);
    if (g.credits) rows.push(['💎', `+${g.credits} Deal Credits`]);
    (g.items || []).forEach((id) => rows.push([ITEMS[id].icon, `Nhận: ${ITEMS[id].name}`]));
    (g.ach || []).forEach((id) => rows.push([ACHIEVEMENTS[id].icon, `Thành tựu: ${ACHIEVEMENTS[id].name}`]));
    (g.rel || []).forEach(([npc, d]) => rows.push(['💞', `${NPCS[npc].name}: ${Object.entries(d).map(([k, v]) => `${k === 'trust' ? 'Trust' : 'Respect'} ${v > 0 ? '+' : ''}${v}`).join(', ')}`]));
    if (g.credibility) rows.push(['🎖️', `Industry credibility: chuyên môn ${g.credibility} (+2 Reputation)`]);
    if (g.homeLens) rows.push(['🎯', `Góc nhìn nghề của bạn (${g.homeLens}): +1 Reputation, +10 XP`]);
    if (g.switched) rows.push(['🔀', `Chuyển ngành: ${g.switched[0]} → ${g.switched[1]} (Reputation −${g.switched[2]} vì uy tín một phần gắn với ngành cũ)`]);
    if (g.promotion) rows.push(['🏆', g.promotion[0] === g.promotion[1] ? `Giữ cấp ${g.promotion[0]}` : `Thăng chức: ${g.promotion[0]} → ${g.promotion[1]}`]);
    const sheet = h('div', { class: 'sheet reward' },
      h('div', { class: 'burst' }, '🌸'), h('h3', {}, 'Hoàn thành!'), h('p', { class: 'rq' }, res.quest.title),
      h('div', { class: 'score' }, h('div', { class: 'ring', style: { '--v': pct } }, h('b', {}, pct + '%')), h('small', {}, 'Điểm năng lực (competence)')),
      h('div', { class: 'rrows' }, rows.map(([i, t]) => h('div', { class: 'rrow' }, h('span', {}, i), t))),
      h('button', { class: 'btn primary', onclick: () => { ui.closeAll(); if (res.transition) cinematic(res.transition); else if (S.tl.status === 'complete' && res.quest.id === 'k_review') { ui.open('multiverse'); } } }, 'Tuyệt vời ▸'));
    current = 'reward'; ui.mount(sheet); confetti(g.items?.length || g.ach?.length ? 90 : 50); chime(g.promotion || g.ach?.length ? 'level' : 'reward');
  }

  function cinematic(to) {
    const info = CHAPTER_INFO[to];
    const text = { uni: 'Nhiều năm trôi qua. Tiệm bánh, quầy nước chanh và những bữa tối cùng bố mẹ đã gieo hạt giống. Giờ đây, cô bước vào giảng đường đại học.', intern: 'Những đêm thức trắng với mô hình DCF đã được đền đáp. Một lá thư mời thực tập từ Lotus Capital nằm trong hộp thư.', career: 'Tốt nghiệp! Cánh cửa của nhiều con đường mở ra. Không ai có thể chọn thay cô.' }[to];
    const sheet = h('div', { class: 'sheet cine' }, h('div', { class: 'cine-pt', html: `<svg viewBox="-60 -130 120 140" width="150">${chibiSVG(playerLook())}</svg>` }), h('small', {}, info.stage), h('h2', {}, info.name), h('p', {}, text), h('p', { class: 'muted' }, `Tuổi: ${S.tl.age}`),
      h('button', { class: 'btn primary', onclick: () => { ui.closeAll(); world.rebuild(); if (to === 'career') ui.open('career'); } }, to === 'career' ? 'Chọn sự nghiệp ▸' : 'Bắt đầu chương mới ▸'));
    current = 'cine'; ui.mount(sheet); chime('level');
  }

  function renderHud() {
    const t = S.tl;
    const obj = St.currentObjective();
    const due = St.dueReviews().length;
    hud.innerHTML = '';
    hud.append(
      h('div', { class: 'hud-row' },
        h('button', { class: 'hud-me', onclick: () => ui.open('skills'), 'aria-label': 'Hồ sơ' }, h('span', { class: 'pt', html: portraitSVG(playerLook(), 40) }), h('span', {}, h('b', {}, S.account.playerName, ` · ${t.age} tuổi`), h('small', {}, t.career ? `${CAREERS[t.career.track].ranks[t.career.rankIdx]} · ${CAREERS[t.career.track].name}` : CHAPTER_INFO[t.chapter].name))),
        h('div', { class: 'hud-stats' }, h('span', { title: 'Reputation' }, '⭐ ', nf(t.stats.rep)), h('span', { title: 'Deal Credits' }, '💎 ', nf(t.stats.credits)), h('span', { title: 'Thời điểm' }, ['🌤️', '☀️', '🌙'][t.slot], ' ', St.slotName()))),
      h('div', { class: 'hud-loc' }, '📍 ', LOCATIONS[t.loc].name),
      obj && h('button', { class: 'objective', onclick: () => { if (obj.action) return ui.open(obj.action); if (obj.loc && obj.loc !== t.loc) { St.travel(obj.loc); toast('📍 ' + LOCATIONS[obj.loc].name); } else toast('Hãy chạm vào nhân vật/vật thể có dấu ❗'); } }, h('small', {}, '🎯 Mục tiêu'), h('span', {}, obj.text)));
    nav.innerHTML = '';
    const items = [['quests', '📜', 'Nhiệm vụ'], ['map', '🗺️', 'Bản đồ'], ['inventory', '🎒', 'Túi đồ'], ['relations', '💞', 'Quan hệ'], ['more', '☰', 'Thêm']];
    items.forEach(([k, i, l]) => nav.append(h('button', { onclick: () => (k === 'more' ? openMore() : ui.open(k)) }, h('span', { class: 'ni' }, i, k === 'more' && due ? h('em', {}, due) : null), h('small', {}, l))));
  }

  function openMore() {
    const due = St.dueReviews().length;
    const list = [['skills', '📈 Kỹ năng & Mastery'], ['review', `📚 Ôn tập${due ? ` (${due})` : ''}`], ['glossary', '📘 Thuật ngữ song ngữ'], ['hall', '🏛️ Đại Sảnh Thương Vụ'], ['academy', '🏫 Học viện Ngành'], ['career', '🎓 Sự nghiệp'], ['multiverse', '🌌 Đa Vũ Trụ (New Game+)'], ['legacy', '🏵️ Di sản'], ['workbench', '💻 Financial Workbench'], ['log', '🗒️ Nhật ký'], ['settings', '⚙️ Cài đặt']];
    current = 'more';
    ui.mount(h('div', { class: 'sheet panel' }, h('div', { class: 'm-head' }, h('h3', {}, 'Menu'), h('button', { class: 'x', 'data-close': '1' }, '✕')), h('div', { class: 'p-body menu' }, list.map(([k, l]) => h('button', { class: 'opt', onclick: () => ui.open(k) }, l)))));
  }

  St.subscribe(() => { if (!ui.blocked()) { renderHud(); world.refresh(); } else renderHud(); });
  document.documentElement.classList.toggle('big', !!S.account.settings.big);
  renderHud(); world.rebuild();
  if (S.tl.chapter === 'career' && !S.tl.career) ui.open('career');
  else if (!Object.keys(S.tl.questsDone).length) intro();

  function intro() {
    current = 'cine';
    ui.mount(h('div', { class: 'sheet cine' }, h('div', { class: 'cine-pt', html: `<svg viewBox="-60 -130 120 140" width="150">${chibiSVG(playerLook())}</svg>` }), h('small', {}, 'The Little Investor'), h('h2', {}, CHAPTER_INFO.child.name),
      h('p', {}, `${S.account.playerName} 7 tuổi. Bố là Managing Director M&A, mẹ là Partner Private Equity. Họ có thể dạy cô — nhưng không thể sống thay cô.`),
      h('p', { class: 'muted' }, '👆 Chạm vào sàn để di chuyển. Chạm vào nhân vật có dấu ❗ hoặc vật thể ✦ để tương tác.'),
      h('button', { class: 'btn primary', onclick: () => ui.closeAll() }, 'Bắt đầu ▸')));
  }
}

// ---------------- onboarding (title, name, pace, diagnostic) ----------------
export function showTitle(onStart, hasSave) {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const L = { skin: '#ffe3d3', hair: '#6b4232', hairStyle: 'bun', outfit: '#b9a3e3', outfit2: '#fffaf0', type: 'blazer', acc: 'pin', accColor: '#e6c36a', scale: 1 };
  const c = { skin: '#ffe3d3', hair: '#6b4232', hairStyle: 'twin', outfit: '#f7b6c8', outfit2: '#fff4f7', type: 'dress', acc: 'bow', accColor: '#f08fb0', scale: 0.8 };
  const scr = h('div', { class: 'title' },
    h('div', { class: 'petals' }), h('div', { class: 't-art', html: `<svg viewBox="-110 -135 220 145" width="260"><g transform="translate(-45,0)">${chibiSVG(c)}</g><g transform="translate(40,0)">${chibiSVG(L)}</g></svg>` }),
    h('small', {}, 'Ultimate Edition'), h('h1', {}, 'M&A Dynasty'), h('h2', {}, 'The Heiress of Capital'), h('p', { class: 'muted' }, 'Nàng thừa kế của Vốn — một hành trình từ tiệm bánh đầu tiên đến phòng họp Investment Committee.'),
    hasSave && h('button', { class: 'btn primary big', onclick: () => onStart('continue') }, '▶ Tiếp tục'),
    h('button', { class: 'btn ' + (hasSave ? '' : 'primary big'), onclick: () => newGame(onStart, hasSave) }, hasSave ? 'Trò chơi mới' : '✨ Bắt đầu'));
  app.append(scr);
}

function newGame(onStart, hasSave) {
  if (hasSave && !confirm('Bắt đầu trò chơi mới sẽ thay thế tài khoản hiện tại trên thiết bị này. Tiếp tục?')) return;
  const app = document.getElementById('app');
  let pace = 'standard';
  const name = h('input', { class: 'numin', value: 'Linh', maxlength: 16, 'aria-label': 'Tên nhân vật' });
  const paces = h('div', { class: 'opts' }, [['relaxed', '🌷 Thong thả', 'Nhiều hội thoại, giải thích kỹ'], ['standard', '🌸 Tiêu chuẩn', 'Cân bằng giữa câu chuyện và thử thách'], ['fast', '⚡ Tăng tốc', 'Gộp hội thoại — cho người đã có nền tảng']].map(([v, t, d]) => h('button', { class: 'opt ' + (v === pace ? 'chosen' : ''), onclick: (e) => { pace = v; [...paces.children].forEach((b) => b.classList.remove('chosen')); e.currentTarget.classList.add('chosen'); } }, h('b', {}, t), h('span', {}, d))));
  app.innerHTML = '';
  app.append(h('div', { class: 'title setup' }, h('h2', {}, 'Tạo nhân vật'), h('label', { class: 'min' }, h('span', {}, 'Tên của cô bé'), name), h('h4', {}, 'Nhịp học'), paces,
    h('button', { class: 'btn primary', onclick: () => diagnostic((d) => onStart('new', { name: name.value.trim() || 'Linh', pace: d && d.score >= 5 && pace === 'standard' ? 'fast' : pace, diagnostic: d })) }, 'Làm bài chẩn đoán (6 câu, tuỳ chọn) ▸'),
    h('button', { class: 'btn', onclick: () => onStart('new', { name: name.value.trim() || 'Linh', pace, diagnostic: null }) }, 'Bỏ qua & bắt đầu')));
}

function diagnostic(done) {
  const app = document.getElementById('app');
  let i = 0, score = 0;
  const box = h('div', { class: 'title setup' });
  const draw = () => {
    box.innerHTML = '';
    if (i >= DIAGNOSTIC.length) {
      box.append(h('h2', {}, `Kết quả: ${score}/${DIAGNOSTIC.length}`), h('p', {}, score >= 5 ? 'Bạn đã có nền tảng vững! Nhịp "Tăng tốc" được đề xuất — câu chuyện quan trọng vẫn được giữ nguyên.' : score >= 3 ? 'Nền tảng khá. Nhịp tiêu chuẩn phù hợp.' : 'Không sao cả — game sẽ dẫn dắt bạn từ những điều cơ bản nhất.'), h('button', { class: 'btn primary', onclick: () => done({ score, at: Date.now() }) }, 'Bắt đầu hành trình ▸'));
      return;
    }
    const d = DIAGNOSTIC[i];
    box.append(h('small', {}, `Câu ${i + 1}/${DIAGNOSTIC.length}`), h('h3', {}, d.q), h('div', { class: 'opts' }, d.opts.map((o, j) => h('button', { class: 'opt', onclick: () => { if (j === d.a) score++; i++; draw(); } }, o))));
  };
  draw(); app.innerHTML = ''; app.append(box);
}

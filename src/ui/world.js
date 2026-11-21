// Living world renderer: tap-to-move protagonist, NPCs with idle/wander animations, interactive hotspots.
import { S, npcsAt, questsForNpc, questsForObject, setPos, chapIdx } from '../engine/store.js';
import { LOCATIONS } from '../content/locations.js';
import { NPCS, PLAYER_LOOK } from '../content/characters.js';
import { ITEMS } from '../content/items.js';
import { CASES } from '../content/cases.js';
import { QUEST_BY_ID } from '../content/quests.js';
import { sceneSVG } from './art.js';
import { chibiSVG } from './chibi.js';

const NS = 'http://www.w3.org/2000/svg';
export function playerLook() {
  const base = PLAYER_LOOK[S.tl.chapter] || PLAYER_LOOK.child;
  const it = S.tl.outfit && ITEMS[S.tl.outfit];
  return it ? { ...base, ...it.look } : base;
}

export function createWorld(root, H) {
  root.innerHTML = `<svg id="scene" viewBox="0 0 390 640" preserveAspectRatio="xMidYMid meet" role="application" aria-label="Thế giới game"><g id="bg"></g><g id="hot"></g><g id="ents"></g><g id="tapfx"></g></svg>`;
  const svg = root.querySelector('svg'), bg = svg.querySelector('#bg'), hot = svg.querySelector('#hot'), ents = svg.querySelector('#ents'), tapfx = svg.querySelector('#tapfx');
  const P = { x: 195, y: 520, tx: null, ty: null, face: 1, arrive: null, el: null };
  let npcs = {}; // id -> {x,y,hx,hy,tx,ty,el,next}
  let lastKey = '';

  function walkBounds() { return LOCATIONS[S.tl.loc].walk; }
  const clampW = (x, y) => { const [x0, y0, x1, y1] = walkBounds(); return [Math.max(x0, Math.min(x1, x)), Math.max(y0, Math.min(y1, y))]; };

  function build() {
    const L = LOCATIONS[S.tl.loc];
    bg.innerHTML = sceneSVG(L.art, S, L.theme);
    // hotspots
    hot.innerHTML = '';
    for (const o of L.objects) {
      if (o.minChapter && chapIdx(S.tl.chapter) < chapIdx(o.minChapter)) continue;
      if (o.flag && !S.tl.flags[o.flag]) continue;
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'hotspot'); g.dataset.obj = o.id;
      const hasQuest = (o.action.type === 'quest' && questsForObject(S.tl.loc, o.id).length) || (o.action.type === 'case' && questStatusForCase(o.action.case) === 'available');
      const isGo = o.action.type === 'go';
      g.innerHTML = `<rect x="${o.x}" y="${o.y}" width="${o.w}" height="${o.h}" rx="10" fill="#fff" fill-opacity="0.001"/>
        <g transform="translate(${Math.max(pillW(o.label) / 2 + 4, Math.min(386 - pillW(o.label) / 2, o.x + o.w / 2))},${o.y - 4})"><g class="hs-pill ${hasQuest ? 'quest' : ''}"><rect x="-${pillW(o.label) / 2}" y="-15" width="${pillW(o.label)}" height="18" rx="9"/><text y="-2" text-anchor="middle">${hasQuest ? '❗ ' : isGo ? '➜ ' : '✦ '}${o.label}</text></g></g>`;
      hot.appendChild(g);
    }
    // entities
    ents.innerHTML = '';
    const pg = document.createElementNS(NS, 'g'); pg.setAttribute('class', 'ent player'); pg.dataset.player = '1';
    pg.innerHTML = `<g class="inner">${chibiSVG(playerLook())}</g><g class="nametag" transform="translate(0,${-118 * (playerLook().scale || 1)})"></g>`;
    ents.appendChild(pg); P.el = pg;
    const present = npcsAt(S.tl.loc);
    const keep = {};
    for (const id of present) {
      const N = NPCS[id], [hx, hy] = N.pos[S.tl.loc];
      const prev = npcs[id];
      const st = prev && prev.loc === S.tl.loc ? prev : { x: hx, y: hy, hx, hy, tx: null, ty: null, next: performance.now() + 1500 + Math.random() * 3000, loc: S.tl.loc, face: 1 };
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'ent npc'); g.dataset.npc = id;
      const q = questsForNpc(id).length;
      const sc = N.look.scale || 1;
      g.innerHTML = `<rect x="-24" y="${-118 * sc}" width="48" height="${120 * sc}" fill="#fff" fill-opacity="0.001"/><g class="inner">${chibiSVG(N.look)}</g>
        <g class="tag" transform="translate(0,${-124 * sc})">${q ? '<g class="qmark"><circle r="11" fill="#f6a9bf" stroke="#fff" stroke-width="2.5"/><text y="5" text-anchor="middle" font-size="15" font-weight="bold" fill="#fff">!</text></g>' : ''}</g>
        <g class="name" transform="translate(0,14)"><rect x="-${pillW(N.name) / 2}" y="-9" width="${pillW(N.name)}" height="16" rx="8"/><text y="3" text-anchor="middle">${N.name}</text></g>`;
      ents.appendChild(g); st.el = g; keep[id] = st;
    }
    npcs = keep;
    if (S.tl.pos) { [P.x, P.y] = clampW(...S.tl.pos); } else { [P.x, P.y] = L.spawn; }
    P.tx = P.ty = null; P.arrive = null;
    place();
  }
  const pillW = (t) => Math.min(170, 18 + t.length * 6.2);
  function questStatusForCase(caseId) {
    const q = QUEST_BY_ID[CASES[caseId]?.mission];
    if (!q) return 'locked';
    return S.tl.questsDone[q.id] ? 'done' : chapIdx(S.tl.chapter) >= chapIdx(q.minChapter) ? 'available' : 'locked';
  }

  function scaleAt(y) { return 0.86 + ((y - 380) / 220) * 0.22; }
  function place() {
    const arr = [];
    const ps = scaleAt(P.y);
    P.el.setAttribute('transform', `translate(${P.x.toFixed(1)},${P.y.toFixed(1)}) scale(${(ps * P.face).toFixed(3)},${ps.toFixed(3)})`);
    arr.push([P.y, P.el]);
    for (const n of Object.values(npcs)) { const s = scaleAt(n.y); n.el.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)}) scale(${s.toFixed(3)})`); n.el.querySelector('.inner').setAttribute('transform', `scale(${n.face},1)`); arr.push([n.y, n.el]); }
    arr.sort((a, b) => a[0] - b[0]);
    let changed = false; arr.forEach(([, el], i) => { if (ents.children[i] !== el) changed = true; });
    if (changed) arr.forEach(([, el]) => ents.appendChild(el));
  }

  let last = performance.now();
  // Fallback driver: if requestAnimationFrame is throttled/paused (background pane, low-power mode),
  // advance the simulation on a timer so movement and arrival callbacks still complete.
  setInterval(() => { const now = performance.now(); if (now - last > 120) step(now); }, 60);
  function tick(now) { step(now); requestAnimationFrame(tick); }
  function step(now) {
    const dt = Math.min(0.08, (now - last) / 1000); last = now;
    if (P.tx !== null) {
      const dx = P.tx - P.x, dy = P.ty - P.y, d = Math.hypot(dx, dy), sp = 150 * dt;
      if (d <= sp) { P.x = P.tx; P.y = P.ty; P.tx = P.ty = null; P.el.classList.remove('walking'); setPos(P.x, P.y); const cb = P.arrive; P.arrive = null; cb && cb(); }
      else { P.x += (dx / d) * sp; P.y += (dy / d) * sp; if (Math.abs(dx) > 2) P.face = dx < 0 ? -1 : 1; P.el.classList.add('walking'); }
    }
    for (const n of Object.values(npcs)) {
      if (n.tx === null && now > n.next && !H.isBlocked()) { const [x, y] = clampW(n.hx + (Math.random() - 0.5) * 60, n.hy + (Math.random() - 0.5) * 30); n.tx = x; n.ty = y; }
      if (n.tx !== null) {
        const dx = n.tx - n.x, dy = n.ty - n.y, d = Math.hypot(dx, dy), sp = 40 * dt;
        if (d <= sp) { n.x = n.tx; n.y = n.ty; n.tx = n.ty = null; n.next = now + 2500 + Math.random() * 4000; n.el.classList.remove('walking'); }
        else { n.x += (dx / d) * sp; n.y += (dy / d) * sp; if (Math.abs(dx) > 1) n.face = dx < 0 ? -1 : 1; n.el.classList.add('walking'); }
      }
    }
    place();
  }
  requestAnimationFrame(tick);

  function toSvg(e) { const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY; return pt.matrixTransform(svg.getScreenCTM().inverse()); }
  function walkTo(x, y, cb) { const [cx, cy] = clampW(x, y); P.tx = cx; P.ty = cy; P.arrive = cb || null; ripple(cx, cy); }
  function ripple(x, y) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 6); c.setAttribute('class', 'ripple'); tapfx.appendChild(c); setTimeout(() => c.remove(), 600); }

  svg.addEventListener('pointerdown', (e) => {
    if (H.isBlocked()) return;
    const p = toSvg(e);
    const npcEl = e.target.closest('[data-npc]');
    if (npcEl) { const id = npcEl.dataset.npc, n = npcs[id]; walkTo(n.x + (P.x < n.x ? -38 : 38), n.y + 4, () => { P.face = n.x > P.x ? 1 : -1; n.face = n.x > P.x ? -1 : 1; H.onNpc(id); }); return; }
    const objEl = e.target.closest('[data-obj]');
    if (objEl) { const o = LOCATIONS[S.tl.loc].objects.find((x) => x.id === objEl.dataset.obj); walkTo(o.x + o.w / 2, o.y + o.h + 20, () => H.onObject(o)); return; }
    walkTo(p.x, p.y);
  });

  return {
    refresh() { const key = [S.tl.id, S.tl.loc, S.tl.chapter, S.tl.slot, S.tl.outfit, JSON.stringify(S.tl.decor), Object.keys(S.tl.questsDone).length, Object.keys(S.account.items).length, S.tl.career?.track, S.tl.macro?.rate, S.tl.macro?.regime, S.tl.flags.saw_oven, S.tl.flags.endgame, S.tl.flags.hired_mai, S.tl.career?.rankIdx].join('|'); if (key !== lastKey) { lastKey = key; build(); } },
    rebuild() { lastKey = ''; this.refresh(); },
  };
}

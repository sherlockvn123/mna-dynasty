// Menu panels: quests, inventory, relationships, skills, map, glossary, review, multiverse, hall, workbench, career, settings.
import { h, nf } from './dom.js';
import * as St from '../engine/store.js';
import { S } from '../engine/store.js';
import { QUESTS, QUEST_BY_ID } from '../content/quests.js';
import { NPCS, CHAPTER_INFO } from '../content/characters.js';
import { ITEMS, ACHIEVEMENTS } from '../content/items.js';
import { LOCATIONS } from '../content/locations.js';
import { GLOSSARY } from '../content/glossary.js';
import { CASES, LABELS, KEYRUS_ACADEMY } from '../content/cases.js';
import { REPLAYS, LENSES, LENS_ORDER } from '../content/quests_replay.js';
import * as L from '../engine/league.js';
import * as LS from '../engine/lenses.js';
import { jCurveCompareChart } from './charts.js';
import * as LP from './lpReport.js';
import { CAREERS, MOBILITY } from '../content/careers.js';
import { PATHS } from '../content/quests_transition.js';
import { epilogue } from '../content/quests_succession.js';
import { MODELS, WORKBENCH_BY_LOCATION, SECTOR_MODELS, CORE_MODELS } from '../content/models.js';
import { portraitSVG } from './chibi.js';
import { SECTORS, FRAMEWORK, PLANNED_SECTORS, academyScore, credibility } from '../content/sectors.js';
import { modelPanel, kindLabel } from './mission.js';

const CONCEPT_VI = { revenue_expense: 'Doanh thu & chi phí', profit: 'Lợi nhuận', cash: 'Tiền mặt vs lợi nhuận', supply_demand: 'Cung – cầu & định giá', compounding: 'Lãi kép', opportunity_cost: 'Chi phí cơ hội', due_diligence: 'Due Diligence', payback: 'Thời gian hoàn vốn', valuation_multiple: 'Bội số định giá', negotiation: 'Đàm phán', income_statement: 'Income Statement', ev_equity: 'EV ↔ Equity Value', dcf: 'DCF', business_model: 'Mô hình kinh doanh', competitive_advantage: 'Lợi thế cạnh tranh', thesis: 'Investment thesis', company_profile: 'Company profile', model_integrity: 'Model integrity', comps: 'Trading Comps', workload: 'Quản lý khối lượng việc', influence: 'Ảnh hưởng chuyên nghiệp', compliance: 'Compliance & MNPI', buyer_list: 'Buyer list', healthcare: 'Healthcare KPIs', deal_certainty: 'Deal certainty', lbo: 'LBO', irr_moic: 'IRR & MOIC', saas_metrics: 'SaaS metrics', runway: 'Runway', ai_economics: 'AI economics', cap_table: 'Cap table', liq_pref: 'Liquidation preference', synergy: 'Synergies', accretion: 'Accretion/Dilution', macro_rates: 'Lãi suất & định giá', wacc: 'WACC', covenants: 'Covenants', stock_deal: 'Thanh toán bằng cổ phiếu', source_labels: 'Kỷ luật nguồn', governance: 'Quản trị thương vụ', consulting_metrics: 'Consulting metrics', quality_of_earnings: 'Quality of Earnings', deal_process: 'Quy trình thương vụ', value_creation: 'Value creation', exit: 'Exit strategy', unit_economics: 'Unit economics', power_law: 'Power law & reserves', strategy: 'Chiến lược & sàng lọc', divestiture: 'Thoái vốn (carve-out)', consulting_case: 'Case & CDD (tư vấn)', career_mobility: 'Chuyển ngành', fund_economics: 'Kinh tế học quỹ', crisis: 'Quản trị khủng hoảng', leadership: 'Lãnh đạo & uỷ quyền', equity_research: 'Equity research', portfolio: 'Xây dựng danh mục', fixed_income: 'Trái phiếu & duration', attribution: 'Performance attribution', transformation: 'Chuyển đổi hiệu suất', sector_healthcare: 'Ngành Y tế', sector_education: 'Ngành Giáo dục', sector_energy: 'Ngành Năng lượng tái tạo', sector_realestate: 'Ngành Bất động sản', sector_ai: 'Ngành AI' };

const panel = (title, ...kids) => h('div', { class: 'sheet panel' }, h('div', { class: 'm-head' }, h('h3', {}, title), h('button', { class: 'x', 'aria-label': 'Đóng', 'data-close': '1' }, '✕')), h('div', { class: 'p-body' }, ...kids));
const bar = (v, max = 100, cls = '') => h('div', { class: 'meter ' + cls }, h('i', { style: { width: Math.max(0, Math.min(100, (v / max) * 100)) + '%' } }));

export function questsPanel(ui) {
  const groups = { available: [], done: [], locked: [] };
  for (const q of QUESTS) {
    const st = St.questStatus(q);
    if (st === 'locked' && q.career && S.tl.career?.track !== q.career) continue;
    groups[st].push(q);
  }
  const where = (q) => { const g = St.resolveGiver(q); const loc = g ? St.npcLocation(g) : St.resolveLoc(q); return `${g ? NPCS[g].name : 'Vật thể trong cảnh'} · ${LOCATIONS[loc]?.name || '—'}`; };
  const card = (q, st) => h('div', { class: 'qcard ' + st }, h('div', { class: 'qk' }, kindLabel(q.kind), q.optional ? ' · tuỳ chọn' : ''), h('b', {}, q.title), h('p', {}, q.summary),
    st === 'available' && h('div', { class: 'qwhere' }, '📍 ', where(q), ' ', h('button', { class: 'btn sm', onclick: () => { const g = St.resolveGiver(q); const loc = g ? St.npcLocation(g) : St.resolveLoc(q); if (loc && St.travel(loc)) ui.closeAll(); } }, 'Đi tới')),
    st === 'done' && h('div', { class: 'qwhere' }, `✔ Điểm năng lực: ${Math.round((S.tl.questsDone[q.id].score ?? 0) * 100)}%`),
    st === 'locked' && h('div', { class: 'qwhere' }, '🔒 ', lockHint(q)));
  return panel('📜 Nhiệm vụ', h('h4', {}, `Có thể làm (${groups.available.length})`), groups.available.map((q) => card(q, 'available')), h('h4', {}, `Đã hoàn thành (${groups.done.length})`), groups.done.map((q) => card(q, 'done')), h('h4', {}, 'Sắp mở khoá'), groups.locked.slice(0, 8).map((q) => card(q, 'locked')));
}
function lockHint(q) {
  const ci = St.chapIdx(S.tl.chapter);
  const need = q.minChapter || q.chapter;
  if (St.chapIdx(need) > ci) return `Mở ở ${CHAPTER_INFO[need].name}`;
  const miss = (q.req || []).filter((r) => !S.tl.questsDone[r]).map((r) => QUEST_BY_ID[r].title);
  if (miss.length) return 'Cần hoàn thành: ' + miss.join(', ');
  if (q.reqAny) return 'Cần hoàn thành nhiệm vụ sự nghiệp đầu tiên';
  if (q.reqCareerMission && S.tl.career) { const left = CAREERS[S.tl.career.track].missions.filter((m) => !S.tl.questsDone[m]).map((m) => QUEST_BY_ID[m].title); if (left.length) return 'Cần hoàn thành: ' + left.join(', '); }
  return 'Chưa đủ điều kiện';
}

export function inventoryPanel(ui) {
  const own = Object.keys(S.account.items).filter((id) => ITEMS[id]);
  const kinds = [['outfit', '👗 Trang phục'], ['decor', '🏡 Trang trí phòng'], ['artifact', '🏺 Hiện vật lịch sử'], ['certificate', '📘 Chứng nhận']];
  const body = kinds.map(([k, label]) => {
    const items = own.filter((id) => ITEMS[id].kind === k);
    return h('div', {}, h('h4', {}, label), items.length ? h('div', { class: 'grid' }, items.map((id) => {
      const it = ITEMS[id];
      const act = k === 'outfit' ? h('button', { class: 'btn sm ' + (S.tl.outfit === id ? 'primary' : ''), onclick: () => { St.equipOutfit(S.tl.outfit === id ? null : id); ui.reopen('inventory'); } }, S.tl.outfit === id ? 'Đang mặc' : 'Mặc')
        : k === 'decor' ? h('button', { class: 'btn sm ' + (S.tl.decor[id] ? 'primary' : ''), onclick: () => { St.toggleDecor(id); ui.reopen('inventory'); } }, S.tl.decor[id] ? 'Đã đặt' : 'Đặt trong phòng') : null;
      return h('div', { class: 'item' }, h('div', { class: 'ico' }, it.icon), h('b', {}, it.name), h('p', {}, it.desc), act);
    })) : h('p', { class: 'muted' }, 'Chưa có — hoàn thành nhiệm vụ để nhận.'));
  });
  const ach = Object.entries(ACHIEVEMENTS).map(([id, a]) => h('div', { class: 'ach ' + (S.account.ach[id] ? 'on' : '') }, h('span', {}, a.icon), h('b', {}, a.name), h('small', {}, a.desc)));
  return panel('🎒 Túi đồ & Bộ sưu tập', h('p', { class: 'muted' }, 'Trang phục, đồ trang trí và hiện vật được lưu ở cấp tài khoản — dùng được ở mọi dòng thời gian.'), ...body, h('h4', {}, '🏅 Thành tựu'), h('div', { class: 'achs' }, ach));
}

export function relationsPanel() {
  const ids = Object.keys(NPCS).filter((id) => { const r = S.tl.rel[id]; return r && (r.trust || r.respect || St.npcLocation(id)); });
  return panel('💞 Quan hệ', h('p', { class: 'muted' }, 'Trust (tin tưởng) và Respect (tôn trọng chuyên môn) thay đổi theo lựa chọn của bạn và ảnh hưởng đến cơ hội tương lai.'),
    ids.map((id) => { const N = NPCS[id], r = S.tl.rel[id]; return h('div', { class: 'rel' }, h('div', { class: 'pt', html: portraitSVG(N.look, 52) }), h('div', { class: 'rel-b' }, h('b', {}, N.name), h('small', {}, N.role), h('div', { class: 'rl' }, 'Trust ', bar(r.trust + 50, 100, r.trust < 0 ? 'low' : ''), h('span', {}, r.trust)), h('div', { class: 'rl' }, 'Respect ', bar(r.respect + 50, 100, r.respect < 0 ? 'low' : ''), h('span', {}, r.respect)), h('p', { class: 'bio' }, N.bio))); }));
}

export function skillsPanel(ui) {
  const st = S.tl.stats;
  const m = St.mastery();
  return panel('📈 Kỹ năng & Năng lực',
    h('div', { class: 'stats' }, [['Knowledge XP', st.xp], ['Reputation', st.rep], ['Ethics', st.ethics], ['Deal Credits', st.credits], ['Deal Experience', st.dealExp], ['Negotiation', st.negotiation], ['Wellbeing', st.wellbeing]].map(([k, v]) => h('div', { class: 'stat' }, h('small', {}, k), h('b', {}, nf(v))))),
    h('p', { class: 'muted' }, 'Mastery dưới đây đo năng lực thực sự (theo spaced repetition) — tách biệt với XP. XP không thể thay thế năng lực để được thăng chức.'),
    h('h4', {}, '🧠 Mastery theo khái niệm'),
    m.length ? m.map((x) => h('div', { class: 'rl' }, h('span', { class: 'cn' }, CONCEPT_VI[x.concept] || x.concept), bar(x.level * 100, 100, x.level < 0.4 ? 'low' : ''), h('span', {}, Math.round(x.level * 100) + '%'))) : h('p', { class: 'muted' }, 'Chưa có dữ liệu — hãy làm nhiệm vụ.'),
    lensSection(ui),
    h('button', { class: 'btn', onclick: () => ui.open('review') }, `📚 Ôn tập (${St.dueReviews().length} câu đến hạn)`));
}

export function mapPanel(ui) {
  const locs = Object.entries(LOCATIONS).filter(([id]) => St.locationUnlocked(id));
  const obj = St.currentObjective();
  return panel('🗺️ Bản đồ', h('div', { class: 'map' }, locs.map(([id, L]) => {
    const n = St.npcsAt(id).length, q = St.npcsAt(id).some((x) => St.questsForNpc(x).length) || L.objects.some((o) => St.questsForObject(id, o.id).length);
    return h('button', { class: 'mloc ' + (S.tl.loc === id ? 'here' : '') + (obj?.loc === id ? ' goal' : ''), onclick: () => { St.travel(id); ui.closeAll(); } }, h('b', {}, L.name), h('small', {}, `${n} người${q ? ' · ❗ nhiệm vụ' : ''}${S.tl.loc === id ? ' · bạn đang ở đây' : ''}`));
  })), h('p', { class: 'muted' }, 'Các địa điểm mới mở ra theo tuổi và sự nghiệp của bạn.'));
}

export function glossaryPanel() {
  const seen = Object.keys(S.account.glossary);
  return panel('📘 Thuật ngữ (song ngữ)', h('p', { class: 'muted' }, `Đã mở ${seen.length}/${Object.keys(GLOSSARY).length} thuật ngữ. Thuật ngữ mở ra khi bạn gặp lần đầu trong nhiệm vụ.`),
    Object.entries(GLOSSARY).map(([t, g]) => S.account.glossary[t] ? h('div', { class: 'term' }, h('b', {}, t), h('div', {}, g.vi), h('div', { class: 'en' }, 'EN: ', g.en)) : h('div', { class: 'term locked' }, h('b', {}, '🔒 ???'))));
}

export function reviewPanel(ui) {
  const due = St.dueReviews();
  return panel('📚 Ôn tập (Spaced Repetition)', h('p', { class: 'muted' }, 'Câu trả lời sai hoặc "Không chắc" sẽ quay lại đây. Trả lời đúng nhiều lần để đạt mastery. Ôn tập không cho XP — chỉ tăng năng lực thực.'),
    due.length ? due.map((d) => { const src = QUEST_BY_ID[d.src]; return h('div', { class: 'qcard available' }, h('b', {}, CONCEPT_VI[d.concept] || d.concept), h('p', {}, `Từ: ${src?.title || '—'} · Sai ${d.wrong} · Không chắc ${d.unsure} · Hộp ${d.box}/5`), h('button', { class: 'btn sm primary', onclick: () => ui.review(d.id) }, 'Ôn ngay')); }) : h('p', {}, '🎉 Không có câu nào đến hạn. Quay lại sau nhé!'),
    lensReviewBlock(ui, 'review'));
}

export function multiversePanel(ui) {
  const a = S.account;
  const completed = a.timelines.filter((t) => t.status === 'complete');
  const played = St.playedTracks();
  return panel('🌌 Đa Vũ Trụ Sự Nghiệp — Career Timeline Multiverse',
    h('p', { class: 'muted' }, 'Mỗi dòng thời gian có bản lưu độc lập. Trang phục, hiện vật, thuật ngữ và mastery được chia sẻ ở cấp tài khoản; thăng chức và kết quả đầu tư phải giành lại trong từng dòng thời gian.'),
    h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Dòng thời gian', 'Sự nghiệp', 'Cấp bậc', 'Uy tín', 'Năng lực TB', 'Trạng thái', ''].map((x) => h('th', {}, x)))),
      h('tbody', {}, a.timelines.map((t) => h('tr', { class: t.id === S.tl.id ? 'cur' : '' }, h('td', {}, t.name, t.branchedFrom ? ' 🔀' : ''), h('td', {}, t.track ? CAREERS[t.track].name : CHAPTER_INFO[t.chapter]?.name.split('—')[1] || '—'), h('td', {}, t.track != null && t.rankIdx != null ? CAREERS[t.track].ranks[t.rankIdx] : '—'), h('td', {}, t.rep), h('td', {}, Math.round((t.avgScore || 0) * 100) + '%'), h('td', {}, t.status === 'complete' ? '✅ Hoàn thành' : '▶ Đang chơi'),
        h('td', {}, t.id === S.tl.id ? 'Đang mở' : h('button', { class: 'btn sm', onclick: async () => { await St.switchTimeline(t.id); ui.closeAll(); ui.world.rebuild(); } }, 'Mở')))))),
    h('h4', {}, '🔀 New Game+ — Khởi tạo từ mốc Tốt nghiệp'),
    completed.length ? completed.map((t) => h('div', { class: 'qcard available' }, h('b', {}, `Từ ${t.name} (${CAREERS[t.track]?.name || '—'})`), h('p', {}, `Đã trải nghiệm: ${[...played].map((k) => CAREERS[k].name).join(', ') || '—'}. Chọn con đường khác để gặp mentor, đối thủ và thương vụ mới.`),
      h('button', { class: 'btn sm primary', onclick: async () => { await St.branchFromCheckpoint(t.id); ui.closeAll(); ui.world.rebuild(); ui.open('career'); } }, 'Bắt đầu dòng thời gian mới từ mốc Tốt nghiệp'))) : h('p', { class: 'muted' }, '🔒 Hoàn thành bản xem trước của một sự nghiệp (đến Đánh giá hiệu suất năm đầu) để mở New Game+.'),
    h('button', { class: 'btn', onclick: async () => { if (confirm('Bắt đầu một dòng thời gian hoàn toàn mới từ tuổi 7? Dòng thời gian hiện tại vẫn được lưu.')) { await St.freshTimeline(); ui.closeAll(); ui.world.rebuild(); } } }, '🌱 Dòng thời gian mới từ tuổi 7'));
}

export function hallPanel(ui) {
  const cats = [...new Set(Object.values(CASES).map((c) => c.category))];
  const card = ([id, c]) => {
    const q = c.mission ? QUEST_BY_ID[c.mission] : null; const st = q ? St.questStatus(q) : 'read';
    return h('div', { class: 'qcard ' + (st === 'done' ? 'done' : st === 'available' ? 'available' : st === 'read' ? '' : 'locked') }, h('div', { class: 'qk' }, c.year, ' · ', c.sector),
      h('b', {}, c.title, S.account.cases[id] ? ' ✔' : ''), h('p', {}, c.status, REPLAYS[id] ? h('span', { class: 'lb lb-interp' }, ` 🎭 ${LENS_ORDER.filter((l) => S.tl.questsDone[REPLAYS[id].quests[l]]).length}/5 góc nhìn`) : ''),
      h('div', { class: 'nbtns' }, h('button', { class: 'btn sm', onclick: () => ui.openCase(id) }, 'Đọc hồ sơ'),
        st === 'available' && h('button', { class: 'btn sm primary', onclick: () => ui.startQuest(q.id) }, 'Chơi nhiệm vụ'),
        st === 'done' && h('span', { class: 'muted' }, ` ✔ ${Math.round(S.tl.questsDone[q.id].score * 100)}%`),
        st === 'locked' && h('span', { class: 'muted' }, ' 🔒 Mở ở Chương 3'),
        st === 'read' && h('span', { class: 'muted' }, ' 📖 Hồ sơ đọc')));
  };
  const playable = Object.values(CASES).filter((c) => c.mission).length;
  const done = Object.values(CASES).filter((c) => c.mission && S.tl.questsDone[c.mission]).length;
  return panel('🏛️ Đại Sảnh Thương Vụ Huyền Thoại',
    h('p', { class: 'muted' }, `${Object.keys(CASES).length} hồ sơ · ${playable} nhiệm vụ (${done} đã hoàn thành). Mọi nhận định đều được gắn nhãn nguồn:`),
    h('div', { class: 'legend' }, Object.values(LABELS).map((l) => h('span', { class: 'lb ' + l.cls }, l.vi))),
    cats.map((cat) => [h('h4', {}, cat), Object.entries(CASES).filter(([, c]) => c.category === cat).sort((a, b) => a[1].year - b[1].year).map(card)]),
    h('h4', {}, '🧭 Keyrus Deal Academy — trình theo dõi nghiên cứu'),
    h('p', { class: 'muted' }, 'Chỉ dùng thông tin công khai. Các mục "Pending Research" chưa được xác minh với nguồn sơ cấp và chưa được mô phỏng như dữ kiện lịch sử.'),
    h('table', { class: 'tbl' }, h('tbody', {}, KEYRUS_ACADEMY.map((k) => h('tr', {}, h('td', {}, k.y), h('td', {}, h('b', {}, k.t), h('br', {}), h('small', {}, k.topic)), h('td', {}, h('span', { class: 'lb ' + LABELS[k.st].cls }, LABELS[k.st].vi), k.playable ? ' ▶' : ''))))));
}

export function caseViewer(id, ui) {
  const c = CASES[id]; const q = c.mission ? QUEST_BY_ID[c.mission] : null;
  const st = q ? St.questStatus(q) : 'read';
  if (!S.account.cases[id]) { S.account.cases[id] = Date.now(); St.notify(); } // reading a file counts toward shared case knowledge
  return panel('📜 ' + c.title,
    h('div', { class: 'qk' }, `${c.category} · ${c.sector} · ${c.year} · ${c.status}`),
    c.sections.map((s) => h('div', { class: 'case-s' }, h('h4', {}, s.h), s.items.map(([lb, t]) => h('p', {}, h('span', { class: 'lb ' + LABELS[lb].cls }, LABELS[lb].vi), ' ', t)))),
    replayBlock(id, ui),
    h('h4', {}, '🔗 Nguồn tham khảo'), c.sources.map((s) => h('p', {}, h('a', { href: s.u, target: '_blank', rel: 'noopener noreferrer' }, s.t))),
    h('p', { class: 'muted' }, c.note),
    st === 'available' ? h('button', { class: 'btn primary', onclick: () => ui.startQuest(q.id) }, '▶ Bắt đầu nhiệm vụ hồ sơ') : st === 'done' ? h('p', {}, `✔ Đã hoàn thành (${Math.round(S.tl.questsDone[q.id].score * 100)}%)`) : st === 'read' ? h('p', { class: 'muted' }, '📖 Hồ sơ đọc — chưa có nhiệm vụ.') : h('p', { class: 'muted' }, '🔒 Nhiệm vụ mở ở Chương 3'));
}

export function workbenchPanel() {
  const here = WORKBENCH_BY_LOCATION[S.tl.loc] || CORE_MODELS;
  const host = h('div', {});
  const chips = [];
  const show = (k) => { host.innerHTML = ''; host.append(modelPanel(k)); chips.forEach((b) => b.classList.toggle('on', b.dataset.k === k)); };
  const sectorUnlocked = St.chapIdx(S.tl.chapter) >= St.chapIdx('intern');
  const row = (keys) => h('div', { class: 'tabs' }, keys.map((k) => { const b = h('button', { class: 'chip', 'data-k': k, onclick: () => show(k) }, (MODELS[k].sector ? SECTORS[MODELS[k].sector].icon + ' ' : '') + MODELS[k].title.split('—')[0]); chips.push(b); return b; }));
  const p = panel('💻 Financial Workbench', h('p', { class: 'muted' }, 'Thử nghiệm giả định tự do. Mọi công thức dùng chung Financial Calculation Engine đã được unit-test. Ô viền hồng trong bảng sensitivity là kịch bản hiện tại.'),
    h('small', { class: 'qk' }, 'Mô hình cốt lõi'), row(CORE_MODELS),
    h('small', { class: 'qk' }, 'Mô hình ngành (Industry Workbench)'), sectorUnlocked ? row(SECTOR_MODELS) : h('p', { class: 'muted' }, '🔒 Mở từ Chương 3 cùng Học viện Ngành.'),
    host);
  show(here.find((k) => sectorUnlocked || !MODELS[k].sector) || 'dcf');
  return p;
}

export function careerPanel(ui) {
  const t = S.tl;
  if (!t.career) {
    if (t.chapter !== 'career') return panel('🏛️ Sự nghiệp', h('p', {}, 'Bạn sẽ chọn sự nghiệp sau khi hoàn thành kỳ thực tập (Chương 3).'), h('h4', {}, 'Các con đường'), Object.values(CAREERS).map((c) => h('div', { class: 'qcard locked' }, h('b', {}, c.icon, ' ', c.name), h('p', {}, c.vi))));
    const played = St.playedTracks();
    return panel('🎓 Chọn con đường sự nghiệp', h('p', {}, t.flags.return_offer ? '🌟 Bạn có return offer từ Lotus Capital — nhưng bạn vẫn có thể chọn con đường khác.' : '⚠️ Bạn không có return offer: mọi con đường đều bắt đầu bằng một câu hỏi phỏng vấn kỹ thuật.'),
      Object.entries(CAREERS).map(([k, c]) => h('div', { class: 'ccard', style: { borderColor: c.color } }, h('div', { class: 'cc-h' }, h('span', { class: 'big' }, c.icon), h('div', {}, h('b', {}, c.name), h('small', {}, c.vi)), played.has(k) && h('span', { class: 'lb lb-fact' }, 'Đã trải nghiệm')),
        h('p', {}, h('b', {}, 'Lộ trình: '), c.ranks.join(' → ')), h('p', {}, h('b', {}, 'Thăng tiến dựa trên: '), c.promo), h('p', {}, h('b', {}, 'Rủi ro nghề nghiệp: '), c.risks), h('p', {}, h('b', {}, 'Endgame: '), c.endgame), h('p', {}, h('b', {}, 'Mentor: '), NPCS[c.mentor].name, ' — ', NPCS[c.mentor].role),
        h('button', { class: 'btn primary', onclick: async () => { if (confirm(`Chọn ${c.name}? Lựa chọn này là vĩnh viễn trong dòng thời gian này (có thể thử con đường khác qua New Game+).`)) { await St.chooseCareer(k); ui.closeAll(); ui.world.rebuild(); ui.toast(`Chào mừng đến ${c.name}!`); } } }, 'Chọn con đường này'))));
  }
  const c = CAREERS[t.career.track];
  return panel(`${c.icon} ${c.name}`, h('p', {}, h('b', {}, 'Chuyên môn ngành: '), !t.spec ? 'Chưa chọn (xem Học viện Ngành)' : t.spec.primary === 'generalist' ? '🌐 Generalist' : SECTORS[t.spec.primary].name + (t.spec.secondary ? ' + ' + SECTORS[t.spec.secondary].name : '')), h('div', { class: 'ladder' }, c.ranks.map((r, i) => h('div', { class: 'rung ' + (i === t.career.rankIdx ? 'cur' : i < t.career.rankIdx ? 'past' : '') }, r))),
    h('p', {}, h('b', {}, 'Tiêu chí thăng tiến: '), c.promo), h('p', {}, h('b', {}, 'Rủi ro: '), c.risks), h('p', {}, h('b', {}, 'Endgame: '), c.endgame),
    h('h4', {}, '🔁 Chuyển ngành (Cross-career mobility)'),
    (t.career.history || []).length ? h('p', {}, h('b', {}, 'Hành trình: '), [...t.career.history.map((x) => `${CAREERS[x.track].ranks[x.rankIdx]} · ${CAREERS[x.track].name}`), `${CAREERS[t.career.track].ranks[t.career.rankIdx]} · ${CAREERS[t.career.track].name}`].join(' → ')) : null,
    h('p', { class: 'muted' }, t.flags.switched ? 'Bạn đã chuyển ngành một lần trong dòng thời gian này. Muốn thử thêm con đường khác? Dùng Đa Vũ Trụ (New Game+).' : t.status !== 'complete' ? '🔒 Hoàn thành Đánh giá hiệu suất năm đầu để headhunter liên hệ với bạn.' : 'Gặp Chị Ngân (headhunter) ở Khu Tài chính để bắt đầu. Mỗi lộ trình có phỏng vấn nhắm vào khoảng trống kỹ năng; trượt thì có thể thử lại.'),
    PATHS.filter((p) => p.from === t.career.track && !t.flags.switched).map((p) => h('div', { class: 'qcard ' + (t.status === 'complete' ? 'available' : 'locked') }, h('b', {}, CAREERS[p.from].icon, ' → ', CAREERS[p.to].icon, ' ', CAREERS[p.to].name), h('p', {}, '✔ Mang theo: ', p.strengths.join('; ')), h('p', {}, '⚠ Cần bù: ', p.gaps.join('; ')), h('p', {}, '⚖ Đánh đổi: ', p.penalty ? 'vào thấp hơn một bậc (có thể giữ bậc nếu phỏng vấn xuất sắc)' : 'vào cấp tương đương', ', giữ 70% uy tín.'),
      t.status === 'complete' && h('button', { class: 'btn sm primary', onclick: () => { St.travel('district'); ui.closeAll(); ui.toast('Nói chuyện với Chị Ngân'); } }, 'Gặp headhunter'))),
    h('h4', {}, 'Lộ trình khác (thông tin, chưa có nhiệm vụ)'),
    h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, ['Từ', 'Sang', 'Thế mạnh mang theo', 'Khoảng trống cần bù'].map((x) => h('th', {}, x)))), h('tbody', {}, MOBILITY.filter((m) => !['IB→PE', 'IB→Corporate Development', 'Consulting→PE', 'Consulting→Corporate Strategy', 'Corporate Development→PE Portfolio Ops', 'Corporate Finance→Investment Management'].includes(m.from + '→' + m.to)).map((m) => h('tr', {}, h('td', {}, m.from), h('td', {}, m.to), h('td', {}, m.strong), h('td', {}, m.gap))))));
}

export function academyPanel(ui) {
  const t = S.tl;
  if (St.chapIdx(t.chapter) < St.chapIdx('intern')) return panel('🏫 Học viện Ngành', h('p', {}, '🔒 Học viện Ngành mở từ Chương 3 (thực tập).'), h('p', { class: 'muted' }, `Các ngành: ${Object.values(SECTORS).map((s) => s.icon + ' ' + s.name).join(' · ')}`));
  const sp = t.spec;
  const cards = Object.entries(SECTORS).map(([k, s]) => {
    const q = QUEST_BY_ID[s.quest]; const st = St.questStatus(q); const sc = academyScore(t, k);
    const role = sp?.primary === k ? ' · ⭐ Chuyên môn chính' : sp?.secondary === k ? ' · ✦ Chuyên môn phụ' : '';
    return h('div', { class: 'qcard ' + (st === 'done' ? 'done' : st === 'available' ? 'available' : 'locked'), style: { borderLeftColor: s.color } },
      h('div', { class: 'qk' }, s.icon, ' ', s.vi, role), h('b', {}, s.name),
      h('p', {}, 'KPIs: ', s.kpis.join(', '), '. ', s.multiples, '.'),
      sc !== null ? h('div', { class: 'rl' }, 'Credibility ', bar(credibility(t, k)), h('span', {}, credibility(t, k))) : null,
      st === 'available' && h('button', { class: 'btn sm primary', onclick: () => { const g = St.resolveGiver(q); const loc = g ? St.npcLocation(g) : q.loc; St.travel(loc); ui.closeAll(); ui.toast(g ? `Nói chuyện với ${NPCS[g].name}` : `Chạm vào gian hàng ${s.icon}`); } }, 'Đi học'),
      st === 'done' && h('span', { class: 'muted' }, ` ✔ Năng lực ${Math.round(sc * 100)}%`),
      st === 'locked' && h('span', { class: 'muted' }, ' 🔒 ', lockHint(q)));
  });
  const eligible = Object.keys(SECTORS).filter((k) => (academyScore(t, k) ?? 0) >= 0.6);
  const doneCount = Object.keys(SECTORS).filter((k) => academyScore(t, k) !== null).length;
  const pSel = h('select', { 'aria-label': 'Chuyên môn chính' }, h('option', { value: '' }, '— Chuyên môn chính —'), eligible.map((k) => h('option', { value: k, selected: sp?.primary === k }, SECTORS[k].icon + ' ' + SECTORS[k].name)));
  const sSel = h('select', { 'aria-label': 'Chuyên môn phụ' }, h('option', { value: '' }, '— Chuyên môn phụ (tuỳ chọn) —'), eligible.map((k) => h('option', { value: k, selected: sp?.secondary === k }, SECTORS[k].icon + ' ' + SECTORS[k].name)));
  const pick = h('div', {},
    h('h4', {}, '🎯 Chuyên môn hoá (Specialization)'),
    h('p', { class: 'muted' }, 'Chuyên môn ảnh hưởng đến cơ hội: thêm hiểu biết trong thương vụ cùng ngành, +Reputation khi hoàn thành chúng, quan hệ với mentor ngành và đánh giá hiệu suất. Cần đạt ≥ 60% ở Học viện của ngành đó; Generalist cần hoàn thành ≥ 3 Học viện.'),
    h('p', {}, 'Hiện tại: ', h('b', {}, !sp ? 'Chưa chọn' : sp.primary === 'generalist' ? '🌐 Generalist Track' : `${SECTORS[sp.primary].icon} ${SECTORS[sp.primary].name}${sp.secondary ? ' + ' + SECTORS[sp.secondary].icon + ' ' + SECTORS[sp.secondary].name : ''}`)),
    eligible.length ? [pSel, h('div', { style: { height: '6px' } }), sSel, h('button', { class: 'btn primary', onclick: () => { if (!pSel.value) return ui.toast('Chọn chuyên môn chính'); const err = St.setSpecialization(pSel.value, sSel.value || null); if (err) ui.toast(err); else { ui.toast('Đã cập nhật chuyên môn'); ui.reopen('academy'); } } }, 'Lưu chuyên môn')] : h('p', { class: 'muted' }, '🔒 Hoàn thành một Học viện với điểm ≥ 60% để chọn chuyên môn.'),
    doneCount >= 3 && h('button', { class: 'btn', onclick: () => { const err = St.setSpecialization('generalist'); if (err) ui.toast(err); else { ui.toast('Generalist Track'); ui.reopen('academy'); } } }, '🌐 Chọn Generalist Investment Track'));
  return panel('🏫 Học viện Ngành — Industry Mastery Academy',
    h('p', { class: 'muted' }, 'Mỗi Học viện đi qua khung 6 bước: ', FRAMEWORK.join(' → '), '. Mọi doanh nghiệp và số liệu trong bài là dữ liệu mô phỏng.'),
    pick, h('h4', {}, `Các ngành ưu tiên (${doneCount}/${Object.keys(SECTORS).length} đã hoàn thành)`), cards,
    h('h4', {}, '🗓️ Học viện sắp mở'), h('p', { class: 'muted' }, PLANNED_SECTORS.join(' · ')));
}

export function legacyPanel(ui) {
  const t = S.tl, a = S.account;
  if (!t.flags.endgame) return panel('🏵️ Bức tường di sản', h('p', {}, '🔒 Mở ở Chương 5 — The Capital Architect (sau Đánh giá hiệu suất năm đầu, gặp Bố ở Vườn).'));
  const journey = [...(t.career.history || []).map((x) => `${CAREERS[x.track].ranks[x.rankIdx]} · ${CAREERS[x.track].name}`), `${CAREERS[t.career.track].ranks[t.career.rankIdx]} · ${CAREERS[t.career.track].name}`];
  const team = ['mai', 'vy', 'khoa', 'duc'].filter((id) => t.flags['hired_' + id]).map((id) => NPCS[id].name);
  const top = Object.entries(t.rel).filter(([id]) => NPCS[id]).sort((x, y) => (y[1].trust + y[1].respect) - (x[1].trust + x[1].respect)).slice(0, 5);
  const next = ['e_leap', 'e_fund', 'e_sim', 'e_team', 'e_platform', 'e_crisis', 'e_legacy', 'e_fund2', 'e_sim2', 'e_fund3', 'e_sim3', 's_coach', 's_star', 's_none', 's_governance', 's_handover', 's_epilogue'].map((id) => QUEST_BY_ID[id]).filter((q) => St.questStatus(q) === 'available' || (St.questStatus(q) === 'locked' && !q.cond));
  const legacyTxt = { education: 'Quỹ học bổng & giáo dục tài chính cho trẻ em tại Tiệm Bánh Mây Hồng', mentor: 'Chương trình mentor cho phụ nữ trong ngành tài chính', institution: 'Một thể chế đầu tư bền vững' }[t.flags.legacy];
  return panel(`🏵️ Bức tường di sản — ${a.playerName} Capital`,
    h('div', { class: 'stats' }, [['Tuổi', t.age], ['Reputation', t.stats.rep], ['Ethics', t.stats.ethics ?? 0], ['Fund I (tr. USD)', t.flags.fund_size ?? '—'], ['Phí (bps)', t.flags.fund_fee ?? '—'], ['Net TVPI', t.flags.fund_tvpi != null ? t.flags.fund_tvpi + 'x' : '—'], ['Net IRR', t.flags.fund_irr != null ? t.flags.fund_irr + '%' : '—'], ['Fund II (tr. USD)', t.flags.fund2_size ?? '—'], ['Fund II TVPI', t.flags.fund2_tvpi != null ? t.flags.fund2_tvpi + 'x' : '—'],
      ['Fund III TVPI', t.flags.fund3_tvpi != null ? t.flags.fund3_tvpi + 'x' : '—'], ['Đội ngũ', t.flags.team_size ?? '—'], ['Thương vụ', t.stats.dealExp], ['Thành tựu', Object.keys(a.ach).length]].map(([k, v]) => h('div', { class: 'stat' }, h('small', {}, k), h('b', {}, v)))),
    h('h4', {}, '🧭 Hành trình'), h('p', {}, 'Tiệm Bánh Mây Hồng (10 tuổi) → ', journey.join(' → '), ' → Founder, ', a.playerName, ' Capital'),
    h('h4', {}, '👥 Những người đi cùng bạn'), h('p', {}, team.length ? team.join(', ') + ' gia nhập quỹ — nhờ các mối quan hệ bạn vun đắp từ nhiều năm trước.' : 'Chưa có đồng sự cũ nào gia nhập quỹ.'),
    top.map(([id, r]) => h('div', { class: 'rl' }, h('span', { class: 'cn' }, NPCS[id].name), h('div', { class: 'meter' }, h('i', { style: { width: Math.min(100, Math.max(0, (r.trust + r.respect) / 2 + 50)) + '%' } })), h('span', {}, r.trust + r.respect))),
    lpReportsBlock(),
    h('h4', {}, '🌸 Di sản'), h('p', {}, legacyTxt || 'Chưa quyết định — hoàn thành nhiệm vụ "Di sản".'), t.flags.platform && h('p', {}, 'Platform đầu tư: ', SECTORS[t.flags.platform]?.name || { generalist: 'Đa ngành (chưa có chuyên môn chính)', hot: 'Ngành đang "nóng"', scatter: 'Nhiều khoản nhỏ không liên quan' }[t.flags.platform]), t.flags.crisis_win && h('p', {}, '⚔️ Bảo vệ thành công giá trị cổ đông trước một đề nghị thâu tóm thù địch.'),
    t.flags.epilogue_done && h('h4', {}, '📖 Đoạn kết'), t.flags.epilogue_done && h('div', {}, epilogue(t, a.playerName).map((l) => h('p', {}, '• ', l))),
    h('h4', {}, '🎯 Mục tiêu tiếp theo'), next.length ? next.map((q) => h('div', { class: 'qcard ' + (St.questStatus(q) === 'available' ? 'available' : 'locked') }, h('b', {}, q.title), h('p', {}, q.summary))) : h('p', {}, 'Bạn đã hoàn thành toàn bộ chương Capital Architect. Hãy thử một dòng thời gian khác ở Đa Vũ Trụ — một con đường khác sẽ dẫn đến một di sản khác.'),
    h('div', { class: 'nbtns' }, h('button', { class: 'btn', onclick: () => ui.open('league') }, '🏆 Bảng xếp hạng quỹ'), h('button', { class: 'btn', onclick: () => ui.open('multiverse') }, '🌌 Mở Đa Vũ Trụ')));
}

export function logPanel() {
  return panel('🗒️ Nhật ký', S.tl.log.length ? S.tl.log.map((l) => h('p', {}, h('small', { class: 'muted' }, new Date(l.at).toLocaleString('vi-VN')), h('br', {}), l.t)) : h('p', { class: 'muted' }, 'Chưa có sự kiện.'));
}

export function settingsPanel(ui) {
  const a = S.account;
  return panel('⚙️ Cài đặt', h('label', { class: 'issue' }, h('input', { type: 'checkbox', checked: a.settings.sound, onchange: (e) => { a.settings.sound = e.target.checked; St.notify(); } }), ' Âm thanh'),
    h('label', { class: 'issue' }, h('input', { type: 'checkbox', checked: a.settings.big, onchange: (e) => { a.settings.big = e.target.checked; document.documentElement.classList.toggle('big', a.settings.big); St.notify(); } }), ' Chữ lớn'),
    h('p', {}, 'Nhịp học: ', h('b', {}, { relaxed: 'Thong thả', standard: 'Tiêu chuẩn', fast: 'Tăng tốc' }[a.pace])),
    h('select', { onchange: (e) => { a.pace = e.target.value; St.notify(); ui.toast('Đã đổi nhịp học'); } }, [['relaxed', 'Thong thả'], ['standard', 'Tiêu chuẩn'], ['fast', 'Tăng tốc (bỏ qua nhiệm vụ tuỳ chọn đã thành thạo)']].map(([v, l]) => h('option', { value: v, selected: a.pace === v }, l))),
    h('p', { class: 'muted' }, 'Tiến trình lưu tự động trên thiết bị này (IndexedDB + localStorage). Không có dữ liệu nào được gửi lên mạng.'),
    h('button', { class: 'btn', onclick: () => { const blob = new Blob([JSON.stringify({ account: a, timeline: S.tl }, null, 2)], { type: 'application/json' }); const u = URL.createObjectURL(blob); const l = h('a', { href: u, download: 'mna-dynasty-save.json' }); document.body.append(l); l.click(); l.remove(); } }, '⬇️ Xuất bản lưu (JSON)'),
    h('button', { class: 'btn ghost', onclick: async () => { if (confirm('Xoá TOÀN BỘ dữ liệu game trên thiết bị này? Không thể hoàn tác.')) { localStorage.clear(); indexedDB.deleteDatabase('mna-dynasty'); location.reload(); } } }, '🗑️ Xoá dữ liệu'));
}

// Multi-perspective replay block: five lenses on the same deal, plus a perspective map that fills in as lenses are completed.
export function replayBlock(caseId, ui) {
  const r = REPLAYS[caseId]; if (!r) return null;
  const home = S.tl.career?.track;
  const done = LENS_ORDER.filter((l) => S.tl.questsDone[r.quests[l]]).length;
  const row = (l) => {
    const q = QUEST_BY_ID[r.quests[l]]; const st = St.questStatus(q); const L = LENSES[l];
    return h('tr', {}, h('td', {}, L.icon, ' ', h('b', {}, L.name), home === l ? h('span', { class: 'lb lb-fact' }, ' nghề của bạn') : '', h('br', {}), h('small', {}, r.roles?.[l] || L.role)),
      h('td', {}, h('small', {}, r.map[l][0]), st === 'done' ? [h('br', {}), h('small', { class: 'ok' }, '💡 ', r.map[l][1])] : ''),
      h('td', {}, st === 'available' ? h('button', { class: 'btn sm primary', onclick: () => ui.startQuest(q.id) }, '▶ Chơi') : st === 'done' ? `✔ ${Math.round(S.tl.questsDone[q.id].score * 100)}%` : '🔒'));
  };
  const base = QUEST_BY_ID[r.quests.ib].req[0];
  return h('div', { class: 'case-s replay' },
    h('h4', {}, `🎭 Replay đa góc nhìn — ${done}/5 lăng kính`),
    h('p', { class: 'muted' }, S.tl.questsDone[base] ? 'Cùng một thương vụ, năm nghề hỏi năm câu khác nhau. Góc nhìn trùng với nghề hiện tại của bạn được thưởng thêm uy tín.' : '🔒 Hoàn thành nhiệm vụ hồ sơ chính để mở các góc nhìn.'),
    h('table', { class: 'tbl' }, h('tbody', {}, LENS_ORDER.map(row))),
    done === 5 ? h('p', {}, '🗺️ Bản đồ góc nhìn hoàn chỉnh: cùng một sự kiện, mỗi vai trò tối ưu một mục tiêu khác nhau — người bán (giá & độ chắc chắn), người mua chiến lược (năng lực & thời gian), quỹ (đòn bẩy & bội số), tư vấn (thực thi), nhà đầu tư (giá đã phản ánh chưa).') : null);
}

// ---------- Fund league table (all timelines vs a fictional peer universe) ----------
let leagueView = 'f1', leagueMetric = 'tvpi';
export function leaguePanel(ui) {
  const body = h('div', {});
  const qcls = { 1: 'lb-fact', 2: 'lb-interp', 3: 'lb-pending', 4: 'lb-alt' };
  const x2 = (v) => (v == null ? '—' : nf(v, 2) + 'x'), pct = (v) => (v == null ? '—' : nf(v, 1) + '%'), d2 = (v) => (v == null ? '—' : nf(v, 2));
  const draw = () => {
    const mine = St.leagueEntries();
    const any = mine.some((m) => Object.keys(m.funds).length);
    const pooledView = leagueView === 'pooled';
    if (pooledView && !['tvpi', 'pme'].includes(leagueMetric)) leagueMetric = 'tvpi';
    const rows = L.leagueRows(mine, leagueView, leagueMetric);
    const metricKeys = pooledView ? ['tvpi', 'pme'] : Object.keys(L.METRICS);
    const cell = (k, v, fmt) => h('td', {}, k === leagueMetric ? h('b', {}, fmt(v)) : fmt(v));
    const gaps = pooledView ? [] : L.rankGap(mine, leagueView).filter((g) => new Set([g.tvpiRank, g.irrRank, g.dpiRank, g.pmeRank].filter((x) => x != null)).size > 1);
    body.innerHTML = '';
    body.append(h('div', {},
      h('div', { class: 'tabs' }, ['f1', 'f2', 'f3', 'pooled'].map((v) => h('button', { class: 'chip' + (v === leagueView ? ' on' : ''), onclick: () => { leagueView = v; draw(); } }, { f1: 'Fund I', f2: 'Fund II', f3: 'Fund III', pooled: 'Gộp' }[v]))),
      h('div', { class: 'tabs' }, metricKeys.map((k) => h('button', { class: 'chip' + (k === leagueMetric ? ' on' : ''), onclick: () => { leagueMetric = k; draw(); } }, 'Xếp theo ' + L.METRICS[k]))),
      h('p', { class: 'muted' }, L.FUND_LABEL[leagueView], pooledView ? ' — trung bình có trọng số theo quy mô từng quỹ.' : ' — chỉ so sánh với quỹ cùng vintage (cùng chu kỳ thị trường).'),
      !any && h('p', { class: 'warn' }, 'Chưa có quỹ nào của bạn hoàn tất. Hoàn thành mô phỏng Fund I trong Chương 5 để xuất hiện trên bảng.'),
      h('table', { class: 'tbl' },
        h('thead', {}, h('tr', {}, (pooledView ? ['#', 'GP', 'TVPI', 'PME', 'Quỹ · Q1', 'Q'] : ['#', 'Quỹ', 'TVPI', 'IRR', 'DPI₇', 'PME', 'Q']).map((x) => h('th', {}, x)))),
        h('tbody', {}, rows.map((r) => h('tr', { class: r.mine ? 'cur' : '' },
          h('td', {}, r.rank),
          h('td', {}, r.mine ? [h('b', {}, '⭐ ', S.account.playerName, ' Capital'), h('br', {}), h('small', {}, r.name, r.track ? ' · ' + CAREERS[r.track].name : '')] : r.name, h('br', {}), h('small', { class: 'muted' }, nf(r.size, 0), ' tr. USD')),
          cell('tvpi', r.tvpi, x2),
          !pooledView && cell('irr', r.irr, pct),
          !pooledView && cell('dpi7', r.dpi7, x2),
          cell('pme', r.pme, d2),
          pooledView && h('td', {}, `${r.n} · ${r.q1}`),
          h('td', {}, h('span', { class: 'lb ' + qcls[r.q] }, 'Q' + r.q)))))),
      !pooledView && jcBlock(mine, leagueView),
      gaps.map((g) => h('p', { class: 'note' }, `📐 ${g.name}: hạng ${g.tvpiRank}/${g.of} theo TVPI · ${g.irrRank ?? '—'} theo IRR · ${g.dpiRank ?? '—'} theo DPI₇ · ${g.pmeRank ?? '—'} theo PME. Cùng một quỹ, thứ hạng phụ thuộc câu hỏi LP đặt ra.`)),
      h('h4', {}, '📘 Đọc bảng xếp hạng như một LP'),
      h('p', {}, '• TVPI: mỗi đồng góp vào nhận lại bao nhiêu (kể cả giá trị chưa thoái). IRR: tốc độ — nhạy với thời điểm dòng tiền.'),
      h('p', {}, '• DPI₇: tiền thật đã về tay LP sau 7 năm, chia cho vốn đã góp. LP cần DPI để trả lương hưu và tái đầu tư — "giá trị trên giấy" không trả được hoá đơn.'),
      h('p', {}, '• KS-PME (Kaplan–Schoar): nếu LP đưa từng đồng vào một chỉ số cổ phiếu niêm yết đúng vào ngày quỹ gọi vốn và rút ra đúng ngày quỹ phân phối, quỹ có thắng không? PME > 1 = thắng thị trường niêm yết. PME loại bỏ "may mắn vintage": một quỹ TVPI cao trong giai đoạn thị trường bùng nổ có thể có PME thấp hơn một quỹ TVPI khiêm tốn trong giai đoạn khó khăn. Lưu ý: KS-PME giả định tiền phân phối được tái đầu tư vào chỉ số, nên tiền bán ra ở đáy chu kỳ được "hưởng" đà phục hồi — vì thế LP luôn đọc PME cùng TVPI và DPI.'),
      h('p', {}, '• Quartile chỉ có ý nghĩa trong cùng vintage; Q1 lặp lại qua nhiều quỹ (quartile persistence) mới là bằng chứng về kỹ năng.'),
      h('p', { class: 'muted' }, 'Các quỹ đối chiếu và chỉ số niêm yết đều là hư cấu (Simulation Assumption). Ngưỡng quartile mô phỏng: Q1 ≥ 2,0x; Q2 ≥ 1,6x; Q3 ≥ 1,3x net TVPI. Quỹ hoàn tất trước khi có chỉ số DPI₇/PME hiển thị "—".')));
  };
  draw();
  return panel('🏆 Bảng xếp hạng quỹ — League Table', body);
}

// ---------- Per-lens mastery (multi-perspective replays) ----------
function lensSection(ui) {
  const stats = LS.lensStats(S.tl, S.account, St.questStatus);
  const any = stats.some((s) => s.done);
  const weak = LS.weakestLens(stats);
  const pct = (x) => (x == null ? '—' : Math.round(x * 100) + '%');
  return h('div', { class: 'lens-stats' },
    h('h4', {}, '🎭 Thành thạo theo góc nhìn'),
    h('p', { class: 'muted' }, 'Thành thạo = độ phủ (số replay đã chơi) × chất lượng (điểm trung bình). "Chính xác" lấy từ mọi lần trả lời các câu hỏi replay, kể cả khi ôn tập.'),
    !any && h('p', { class: 'muted' }, 'Chưa chơi replay nào. Replay mở trong Đại Sảnh Thương Vụ Huyền Thoại sau khi hoàn thành nhiệm vụ hồ sơ chính.'),
    stats.map((s) => h('div', { class: 'rl lens-row' },
      h('span', { class: 'cn' }, s.icon, ' ', s.name, s.home ? h('span', { class: 'lb lb-fact' }, ' nghề của bạn') : ''),
      bar(s.mastery * 100, 100, s.avg != null && s.avg < 0.6 ? 'low' : ''), // red = weak quality, not low coverage
      h('span', {}, pct(s.mastery)),
      h('small', { class: 'muted lens-meta' }, `${s.done}/${s.total} replay · điểm TB ${pct(s.avg)} · chính xác ${pct(s.accuracy)}`),
      reviewBtn(ui, s.lens, 'skills'),
      s.next ? h('button', { class: 'btn sm', onclick: () => ui.startQuest(s.next) }, '▶ Chơi tiếp') : s.done === s.total ? h('small', {}, ' ✔ Hoàn tất') : h('small', { class: 'muted' }, ' 🔒 Mở thêm hồ sơ'))),
    any && weak && h('p', { class: 'note' }, `💡 Góc nhìn cần luyện nhất: ${weak.icon} ${weak.name}. Gợi ý: "${QUEST_BY_ID[weak.next].title}". Nhà đầu tư giỏi hiểu cả cách những người ngồi bên kia bàn đàm phán suy nghĩ.`),
    LS.hasLensMaster(stats) && h('p', {}, '🔭 Bạn đã là Bậc thầy ở ít nhất một góc nhìn.'));
}

// J-curve comparison block for one vintage in the league table
function jcBlock(mine, view) {
  const d = L.jCurveCompare(mine, view);
  const f = (v) => (v < 0 ? '−' : '') + nf(Math.abs(v), 2) + '×';
  const desc = (st) => `đáy ${f(st.trough)} ở năm ${st.troughYear}, ${st.breakeven ? `hoà vốn tiền mặt năm ${st.breakeven}` : 'chưa hoà vốn trong 10 năm'}, kết thúc ${f(st.end)}`;
  const p = d.peerStats;
  return h('div', { class: 'jcx-block' },
    jCurveCompareChart(d),
    d.series.slice(0, 3).map((s) => h('p', { class: 'note' }, `📉 ${s.name}: ${desc(s.stats)} — so với trung vị: ${desc(p)}. ${s.stats.trough < p.trough ? 'J sâu hơn: gọi vốn nhanh hoặc phân phối muộn hơn.' : 'J nông hơn trung vị.'} ${s.stats.breakeven && p.breakeven ? (s.stats.breakeven < p.breakeven ? 'LP lấy lại tiền sớm hơn.' : s.stats.breakeven > p.breakeven ? 'LP lấy lại tiền muộn hơn.' : 'Hoà vốn cùng lúc với trung vị.') : ''}`)),
    d.series.length > 3 && h('p', { class: 'muted' }, `Biểu đồ hiển thị 3 dòng thời gian đầu tiên; xem số liệu đầy đủ ở bảng phía trên.`),
    !d.series.length && h('p', { class: 'muted' }, 'Chưa có J-curve của quỹ bạn cho vintage này — biểu đồ chỉ hiển thị dải của quỹ đối chiếu.'),
    d.missing.length > 0 && h('p', { class: 'muted' }, `${d.missing.join(', ')}: quỹ hoàn tất trước khi game lưu J-curve nên không có đường trên biểu đồ.`),
    h('p', { class: 'muted' }, 'Trục dọc là dòng tiền ròng luỹ kế của LP chia cho vốn cam kết, để so được quỹ khác quy mô. Dải và trung vị của quỹ đối chiếu là hư cấu (Simulation Assumption).'));
}

// Lens review: 5-question sessions built from replay questions already answered (weak & due first)
function reviewBtn(ui, lens, from) {
  const n = LS.lensReviewQueue(lens, S.account).length; if (!n) return null;
  const due = LS.lensDueCount(lens, S.account);
  return h('button', { class: 'btn sm' + (due ? ' primary' : ''), title: due ? `${due} câu sai/không chắc đến hạn` : 'Ôn lại các câu đã trả lời', onclick: () => ui.lensReview?.(lens, from) }, `📚 Ôn${due ? ` (${due})` : ''}`);
}
function lensReviewBlock(ui, from) {
  const rows = LS.lensStats(S.tl, S.account).map((s) => ({ s, btn: reviewBtn(ui, s.lens, from) })).filter((x) => x.btn);
  return h('div', { class: 'lens-stats' },
    h('h4', {}, '🎭 Ôn tập theo góc nhìn'),
    rows.length ? [h('p', { class: 'muted' }, `Mỗi phiên ${LS.LENS_REVIEW_SIZE} câu từ các replay bạn đã chơi — ưu tiên câu sai hoặc "Không chắc" đến hạn. Kết quả cập nhật cột "chính xác" trong bảng Kỹ năng.`),
      rows.map(({ s, btn }) => h('div', { class: 'rl lens-row' }, h('span', { class: 'cn' }, s.icon, ' ', s.name), h('small', { class: 'muted lens-meta' }, `chính xác ${s.accuracy == null ? '—' : Math.round(s.accuracy * 100) + '%'}`), btn))]
      : h('p', { class: 'muted' }, 'Chưa có câu replay nào để ôn. Chơi replay trong Đại Sảnh để mở chế độ này.'));
}

// LP reports for every finished fund simulation in this timeline
function lpReportsBlock() {
  const sims = [S.tl.sim, S.tl.sim2, S.tl.sim3].filter((x) => x?.done && x.result);
  const opts = { playerName: S.account.playerName, timelineName: S.tl.name };
  return h('div', {}, h('h4', {}, '📄 Báo cáo cho LP'),
    sims.length ? sims.map((sm) => h('div', { class: 'rl lens-row' }, h('span', { class: 'cn' }, h('b', {}, LP.FUND_NAME[sm.scenario || 'fund1']), ` · net TVPI ${nf(sm.result.netTvpi, 2)}x · Q${sm.result.quartile}`),
      h('button', { class: 'btn sm', onclick: () => LP.openReport(sm, opts) }, '📄 Xem / in'), h('button', { class: 'btn sm', onclick: () => LP.downloadReport(sm, opts) }, '⬇️ Tải .html')))
      : h('p', { class: 'muted' }, 'Hoàn thành một mô phỏng quỹ để xuất báo cáo năm 10 gửi LP (thư của GP, KPI, J-curve, danh mục, quyết định trong khủng hoảng).'));
}

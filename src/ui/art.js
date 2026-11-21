// Original procedural scene art (SVG, 390×640). Pastel palette: pink, ivory, lavender, sage, soft gold.
import { ITEMS } from '../content/items.js';
const W = 390, H = 640;
const defs = `<defs>
  <linearGradient id="gWallPink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fde8ee"/><stop offset="1" stop-color="#f8d6e1"/></linearGradient>
  <linearGradient id="gWallLav" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eee8fb"/><stop offset="1" stop-color="#ddd3f3"/></linearGradient>
  <linearGradient id="gWallIvory" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fffaf0"/><stop offset="1" stop-color="#f4ead8"/></linearGradient>
  <linearGradient id="gWallSage" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#edf4ea"/><stop offset="1" stop-color="#d6e5d2"/></linearGradient>
  <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe3ff"/><stop offset=".6" stop-color="#fbe4f0"/><stop offset="1" stop-color="#fff3e6"/></linearGradient>
  <linearGradient id="gSkyDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b7a6e6"/><stop offset=".6" stop-color="#f6c1d4"/><stop offset="1" stop-color="#ffe2c7"/></linearGradient>
  <linearGradient id="gFloorWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ecd2bd"/><stop offset="1" stop-color="#dcb79e"/></linearGradient>
  <linearGradient id="gFloorMarble" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf6ef"/><stop offset="1" stop-color="#ece1d3"/></linearGradient>
  <linearGradient id="gGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe6c4"/><stop offset="1" stop-color="#b3d4a8"/></linearGradient>
  <linearGradient id="gGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e2a4"/><stop offset=".5" stop-color="#e6c36a"/><stop offset="1" stop-color="#f3dc9a"/></linearGradient>
  <radialGradient id="gGlow"><stop offset="0" stop-color="#fff7d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff7d6" stop-opacity="0"/></radialGradient>
  <pattern id="pTiles" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0,20 H40 M20,0 V20" stroke="#000" stroke-opacity=".05"/></pattern>
  <pattern id="pPlanks" width="60" height="16" patternUnits="userSpaceOnUse"><path d="M0,16 H60 M30,0 V16" stroke="#8a5a3a" stroke-opacity=".12"/></pattern>
  <pattern id="pDots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1.6" fill="#fff" opacity=".7"/></pattern>
</defs>`;

const rug = (cx, cy, rx, ry, c1, c2) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${c1}"/><ellipse cx="${cx}" cy="${cy}" rx="${rx - 12}" ry="${ry - 7}" fill="none" stroke="${c2}" stroke-width="3" stroke-dasharray="6 5"/>`;
const windowEl = (x, y, w, h, sky = 'gSky') => `<g><rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="10" fill="#fff" opacity=".9"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="6" fill="url(#${sky})"/><circle cx="${x + w * 0.72}" cy="${y + h * 0.3}" r="${Math.min(w, h) * 0.12}" fill="#fff4c9"/><path d="M${x + w / 2},${y} V${y + h} M${x},${y + h / 2} H${x + w}" stroke="#fff" stroke-width="4"/><path d="M${x - 10},${y - 8} q${w / 4 + 6},${h * 0.5} 0,${h + 16}" fill="#f6c2d2" opacity=".85"/><path d="M${x + w + 10},${y - 8} q-${w / 4 + 6},${h * 0.5} 0,${h + 16}" fill="#f6c2d2" opacity=".85"/></g>`;
const plant = (x, y, s = 1, c = '#93b39a') => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14,0 h28 l-4,22 h-20z" fill="#f2d4c4"/><ellipse cx="0" cy="-8" rx="10" ry="18" fill="${c}"/><ellipse cx="-12" cy="-2" rx="8" ry="14" fill="${c}" transform="rotate(-30 -12 -2)"/><ellipse cx="12" cy="-2" rx="8" ry="14" fill="${c}" transform="rotate(30 12 -2)"/></g>`;
const flowerBed = (x, y, n = 6, w = 120) => { let s = `<ellipse cx="${x + w / 2}" cy="${y + 8}" rx="${w / 2 + 8}" ry="16" fill="#a8cf9c"/>`; const cs = ['#f6a9bf', '#c9b8ec', '#fff0a8', '#f8c9a0', '#f4a5a5']; for (let i = 0; i < n; i++) { const fx = x + 8 + (i * (w - 16)) / (n - 1), fy = y + (i % 2 ? 2 : 10), c = cs[i % cs.length]; s += `<g transform="translate(${fx},${fy})"><path d="M0,0 v12" stroke="#7aa86f" stroke-width="2"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse rx="3.4" ry="5.5" cy="-4" fill="${c}" transform="rotate(${a})"/>`).join('')}<circle r="2.6" fill="#ffe58a"/></g>`; } return s; };
const door = (x, y, w, h, c = '#e9c6d4', sign = '') => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" ry="${w / 2}" fill="#fff" opacity=".9"/><rect x="${x + 6}" y="${y + 6}" width="${w - 12}" height="${h - 6}" rx="${(w - 12) / 2}" fill="${c}"/><circle cx="${x + w - 16}" cy="${y + h * 0.6}" r="3.5" fill="#e6c36a"/>${sign ? `<rect x="${x + w / 2 - 34}" y="${y - 24}" width="68" height="18" rx="9" fill="#fff"/><text x="${x + w / 2}" y="${y - 11}" text-anchor="middle" font-size="10" fill="#8a6a8e">${sign}</text>` : ''}</g>`;
const shelf = (x, y, w) => `<g><rect x="${x}" y="${y}" width="${w}" height="8" rx="3" fill="#e2c3a8"/>${[0, 1, 2, 3, 4].map((i) => `<rect x="${x + 6 + i * (w / 5.5)}" y="${y - 24 + (i % 2) * 4}" width="${w / 8}" height="${24 - (i % 2) * 4}" rx="2" fill="${['#c9b8ec', '#f6a9bf', '#a8cf9c', '#fff0a8', '#9fc3e6'][i]}"/>`).join('')}</g>`;
const desk = (x, y, w = 110) => `<g><rect x="${x}" y="${y}" width="${w}" height="14" rx="5" fill="#e8c9ae"/><rect x="${x + 6}" y="${y + 14}" width="8" height="46" fill="#d8b49a"/><rect x="${x + w - 14}" y="${y + 14}" width="8" height="46" fill="#d8b49a"/></g>`;
const monitor = (x, y, chart = true) => `<g><rect x="${x}" y="${y}" width="52" height="34" rx="4" fill="#3f4660"/><rect x="${x + 3}" y="${y + 3}" width="46" height="28" rx="2" fill="#eaf1ff"/>${chart ? `<path d="M${x + 7},${y + 26} L${x + 17},${y + 18} L${x + 27},${y + 21} L${x + 37},${y + 10} L${x + 45},${y + 12}" stroke="#93b39a" stroke-width="2.4" fill="none"/>` : ''}<rect x="${x + 22}" y="${y + 34}" width="8" height="8" fill="#9aa0b5"/></g>`;
const lamp = (x, y) => `<g><circle cx="${x}" cy="${y}" r="38" fill="url(#gGlow)" class="glow"/><path d="M${x - 12},${y} h24 l-6,-16 h-12z" fill="#fff0a8"/><rect x="${x - 1.5}" y="${y}" width="3" height="40" fill="#e6c36a"/></g>`;
const floor = (y, fill, pat) => `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#${fill})"/>${pat ? `<rect x="0" y="${y}" width="${W}" height="${H - y}" fill="url(#${pat})"/>` : ''}<rect x="0" y="${y - 6}" width="${W}" height="8" fill="#fff" opacity=".7"/>`;
const tree = (x, y, s = 1, c = '#b9d8ad') => `<g transform="translate(${x},${y}) scale(${s})"><rect x="-6" y="-10" width="12" height="40" rx="5" fill="#c9a387"/><circle cx="0" cy="-30" r="30" fill="${c}"/><circle cx="-20" cy="-18" r="20" fill="${c}"/><circle cx="20" cy="-18" r="20" fill="${c}"/><circle cx="-8" cy="-40" r="8" fill="#fff" opacity=".25"/>${[[-14, -30], [10, -44], [18, -16]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="3" fill="#f6a9bf"/>`).join('')}</g>`;
const cloud = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})" opacity=".9"><ellipse cx="0" cy="0" rx="30" ry="12" fill="#fff"/><ellipse cx="-14" cy="-8" rx="14" ry="11" fill="#fff"/><ellipse cx="10" cy="-10" rx="16" ry="13" fill="#fff"/></g>`;

const DECOR_SLOTS = [[268, 340], [70, 236], [110, 236], [320, 196], [350, 362], [40, 236], [130, 304], [150, 236], [355, 196], [100, 304], [262, 236], [64, 304], [330, 560]];
const DECOR_ART = {
  decor_piggy: (x, y) => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-8" rx="15" ry="11" fill="url(#gGold)"/><circle cx="12" cy="-10" r="5" fill="#f3dc9a"/><path d="M-6,-19 l4,-5 l3,5z" fill="#e6c36a"/><circle cx="6" cy="-11" r="1.4" fill="#5a4a3a"/></g>`,
  decor_trophy_bakery: (x, y) => `<g transform="translate(${x},${y})"><path d="M-10,-30 h20 q0,16 -10,18 q-10,-2 -10,-18z" fill="url(#gGold)"/><rect x="-2" y="-12" width="4" height="7" fill="#e6c36a"/><rect x="-8" y="-5" width="16" height="5" rx="2" fill="#c9a04e"/><circle cx="0" cy="-24" r="3" fill="#f6a9bf"/></g>`,
  decor_lemon: (x, y) => `<g transform="translate(${x},${y})"><path d="M-8,-26 h16 l-2,26 h-12z" fill="#fff8c4" opacity=".9" stroke="#e6c36a"/><circle cx="0" cy="-12" r="4" fill="#ffe58a"/></g>`,
  decor_books: (x, y) => `<g transform="translate(${x},${y})">${['#c9b8ec', '#f6a9bf', '#93b39a', '#9fc3e6'].map((c, i) => `<rect x="${-16 + i * 8}" y="-28" width="7" height="28" rx="1.5" fill="${c}"/>`).join('')}</g>`,
  decor_plant: (x, y) => plant(x, y - 16, 0.8, '#b7a4e0'),
  decor_dataroom: (x, y) => `<g transform="translate(${x},${y})"><circle cx="-4" cy="-14" r="6" fill="none" stroke="url(#gGold)" stroke-width="3"/><path d="M1,-12 h12 v4 M9,-12 v5" stroke="#e6c36a" stroke-width="3" fill="none"/></g>`,
  decor_valuebridge: (x, y) => `<g transform="translate(${x},${y})"><rect x="-16" y="-26" width="32" height="26" rx="3" fill="#fff"/>${[6, 10, 14, 20].map((hh, i) => `<rect x="${-13 + i * 7}" y="${-3 - hh}" width="5" height="${hh}" fill="${['#c9b8ec', '#f6a9bf', '#93b39a', '#e6c36a'][i]}"/>`).join('')}</g>`,
  decor_unicorn: (x, y) => `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-8" rx="11" ry="7" fill="#f3eefe" stroke="#c9b8ec"/><circle cx="9" cy="-16" r="5" fill="#f3eefe" stroke="#c9b8ec"/><path d="M11,-21 l3,-9 l1,9z" fill="url(#gGold)"/><path d="M4,-19 q-4,4 -2,8" stroke="#f6a9bf" stroke-width="2" fill="none"/></g>`,
  decor_puzzle: (x, y) => `<g transform="translate(${x},${y})"><path d="M-10,-22 h8 a3,3 0 1 1 4,0 h8 v8 a3,3 0 1 1 0,4 v10 h-20z" fill="#a8cf9c" stroke="#fff"/></g>`,
  decor_issuetree: (x, y) => `<g transform="translate(${x},${y})" stroke="#93b39a" stroke-width="2" fill="none"><path d="M0,0 V-10 M0,-10 L-10,-18 M0,-10 L10,-18 M-10,-18 L-14,-26 M-10,-18 L-6,-26 M10,-18 L6,-26 M10,-18 L14,-26"/>${[[-14, -26], [-6, -26], [6, -26], [14, -26]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.5" fill="#f6a9bf" stroke="none"/>`).join('')}</g>`,
  decor_ticker: (x, y) => `<g transform="translate(${x},${y})"><rect x="-16" y="-18" width="32" height="16" rx="3" fill="#3f4660"/><path d="M-12,-7 l6,-4 l5,3 l6,-6 l7,2" stroke="#a8cf9c" stroke-width="2" fill="none"/></g>`,
  decor_lemonstand: (x, y) => `<g transform="translate(${x},${y})"><rect x="-16" y="-14" width="32" height="14" rx="2" fill="#fffaf0"/><path d="M-19,-14 L0,-26 L19,-14Z" fill="#f6a9bf"/><circle cx="-6" cy="-17" r="2.5" fill="#ffe58a"/><circle cx="6" cy="-17" r="2.5" fill="#ffe58a"/></g>`,
  decor_tombstone: (x, y) => `<g transform="translate(${x},${y})"><path d="M-10,0 v-24 q10,-10 20,0 v24z" fill="#e8f2ff" stroke="#9fc3e6"/><path d="M-5,-14 h10 M-5,-9 h10" stroke="#9fc3e6"/></g>`,
};

function bedroom(S) {
  const ch = S.tl.chapter;
  const wall = ch === 'child' ? 'gWallPink' : ch === 'uni' ? 'gWallLav' : 'gWallIvory';
  let s = `<rect width="${W}" height="${H}" fill="url(#${wall})"/><rect width="${W}" height="380" fill="url(#pDots)" opacity=".5"/>`;
  s += windowEl(40, 70, 90, 100, S.tl.slot === 2 ? 'gSkyDusk' : 'gSky');
  s += `<path d="M0,170 Q195,150 390,170" stroke="#f6c2d2" stroke-width="5" fill="none" opacity=".6"/>`;
  s += floor(375, 'gFloorWood', 'pPlanks');
  s += door(165, 255, 64, 125, '#f1c6d6', 'Ra vườn');
  // wardrobe
  s += `<g><rect x="300" y="200" width="80" height="170" rx="12" fill="#fff6f0"/><rect x="306" y="208" width="33" height="150" rx="8" fill="#f8dfe7"/><rect x="341" y="208" width="33" height="150" rx="8" fill="#f8dfe7"/><circle cx="335" cy="284" r="3" fill="#e6c36a"/><circle cx="345" cy="284" r="3" fill="#e6c36a"/><path d="M310,200 q30,-20 60,0" fill="#f6a9bf"/></g>`;
  // desk + shelf
  s += shelf(30, 236, 110) + desk(24, 310, 112) + monitor(70, 276, ch !== 'child') + lamp(42, 292);
  // bed
  s += `<g><rect x="200" y="420" width="170" height="70" rx="18" fill="#fff"/><rect x="200" y="440" width="170" height="54" rx="16" fill="#f6b6c8"/><rect x="212" y="418" width="44" height="28" rx="12" fill="#fffaf0"/><path d="M200,460 Q285,445 370,460" stroke="#fff" stroke-width="4" fill="none" opacity=".7"/></g>`;
  // piggy bank on stool
  s += `<g><rect x="255" y="330" width="34" height="34" rx="6" fill="#e8c9ae"/>${S.account.items.decor_piggy ? '' : `<ellipse cx="272" cy="322" rx="14" ry="10" fill="#f8b4c6"/><circle cx="283" cy="320" r="4.5" fill="#f6a3b8"/><path d="M266,312 l3,-5 l3,5z" fill="#f6a3b8"/><circle cx="278" cy="318" r="1.3" fill="#5a4a5a"/><rect x="268" y="313" width="7" height="2" rx="1" fill="#c47a90"/>`}</g>`;
  s += rug(150, 520, 120, 36, '#efe4fb', '#c9b8ec');
  if (ch === 'child') s += `<g transform="translate(46,548)"><circle r="14" fill="#fff0a8"/><circle cx="-5" cy="-3" r="2" fill="#5a4a5a"/><circle cx="5" cy="-3" r="2" fill="#5a4a5a"/><ellipse cx="0" cy="18" rx="16" ry="12" fill="#fff0a8"/><circle cx="-12" cy="-12" r="5" fill="#fff0a8"/><circle cx="12" cy="-12" r="5" fill="#fff0a8"/></g>`;
  return s + decorAll(S); // placed decor items
}
function decorAll(S) {
  let s = '';
  const ids = Object.keys(DECOR_ART);
  ids.forEach((id) => { if (S.tl.decor?.[id] && S.account.items[id]) { const [x, y] = DECOR_SLOTS[(ITEMS[id]?.slot ?? 0) % DECOR_SLOTS.length]; s += DECOR_ART[id](x, y); } });
  return s;
}

function garden(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#${S.tl.slot === 2 ? 'gSkyDusk' : 'gSky'})"/>` + cloud(70, 60) + cloud(300, 90, 0.8);
  // house facade
  s += `<g><path d="M110,140 L195,80 L280,140Z" fill="#f6a9bf"/><rect x="120" y="140" width="150" height="250" fill="#fffaf0"/><rect x="120" y="140" width="150" height="250" fill="url(#pDots)" opacity=".3"/>${windowEl(132, 165, 40, 44)}${windowEl(218, 165, 40, 44)}</g>`;
  s += door(155, 255, 80, 140, '#c9b8ec', 'Nhà');
  s += tree(55, 300, 1.1) + tree(345, 260, 0.9, '#c7e0bb');
  s += `<rect x="0" y="390" width="${W}" height="${H - 390}" fill="url(#gGrass)"/>`;
  s += `<path d="M195,395 Q180,470 200,640 L250,640 Q220,470 235,395Z" fill="#f4ead8"/>`;
  s += flowerBed(20, 420, 6, 110) + flowerBed(270, 600, 5, 110) + flowerBed(10, 600, 5, 100);
  // fountain
  s += `<g transform="translate(110,560)"><ellipse rx="44" ry="14" fill="#cfe3ff"/><ellipse rx="44" ry="14" fill="none" stroke="#fff" stroke-width="4"/><rect x="-5" y="-34" width="10" height="34" fill="#fff"/><ellipse cy="-36" rx="16" ry="5" fill="#cfe3ff" stroke="#fff" stroke-width="2"/><path class="water" d="M0,-40 q-10,-14 -18,6 M0,-40 q10,-14 18,6" stroke="#9fc3e6" stroke-width="2.5" fill="none"/></g>`;
  // lemonade stand
  s += `<g transform="translate(285,318)"><rect x="0" y="30" width="90" height="52" rx="6" fill="#fffaf0"/><rect x="0" y="30" width="90" height="10" fill="#fff0a8"/><path d="M-6,30 L48,0 L96,30Z" fill="#f6a9bf"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${-6 + i * 17},30 l8.5,-5 l8.5,5z" fill="#fff" opacity=".6"/>`).join('')}<text x="45" y="62" text-anchor="middle" font-size="11" fill="#c9a04e" font-weight="bold">NƯỚC CHANH</text><circle cx="20" cy="26" r="6" fill="#ffe58a"/><circle cx="70" cy="26" r="6" fill="#ffe58a"/></g>`;
  // signpost
  s += `<g transform="translate(18,340)"><rect x="12" y="0" width="5" height="60" fill="#c9a387"/><path d="M0,6 h40 l8,9 l-8,9 h-40z" fill="#fff"/><text x="22" y="19" text-anchor="middle" font-size="9" fill="#8a6a8e">Tiệm bánh</text></g>`;
  if (S.tl.chapter !== 'child') s += `<g transform="translate(340,560)"><rect x="-3" y="-60" width="6" height="64" fill="#9aa0b5"/><rect x="-24" y="-74" width="48" height="22" rx="6" fill="#9fc3e6"/><text x="0" y="-59" text-anchor="middle" font-size="10" fill="#fff" font-weight="bold">BUS</text></g>`;
  return s;
}

function bakery(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#gWallPink)"/>`;
  s += `<rect x="0" y="0" width="${W}" height="60" fill="#f6a9bf"/>${[...Array(14)].map((_, i) => `<path d="M${i * 30},60 q15,22 30,0" fill="#f6a9bf"/><path d="M${i * 30},60 q15,22 30,0" fill="#fff" opacity="${i % 2 ? 0.5 : 0}"/>`).join('')}`;
  s += `<rect x="110" y="96" width="170" height="80" rx="10" fill="#4f5b4f"/><text x="195" y="124" text-anchor="middle" font-size="14" fill="#fffaf0" font-weight="bold">Mây Hồng Bakery</text><text x="195" y="146" text-anchor="middle" font-size="11" fill="#fff0a8">Su kem 10k · Bánh mì 15k</text><text x="195" y="164" text-anchor="middle" font-size="11" fill="#f6c2d2">Bánh kem đặt trước</text>`;
  // oven
  s += `<g><rect x="290" y="240" width="90" height="150" rx="10" fill="#d9d4e3"/><rect x="300" y="290" width="70" height="56" rx="8" fill="#3f4660"/><rect x="306" y="296" width="58" height="44" rx="6" fill="#f8c9a0" class="ovenglow"/><circle cx="312" cy="262" r="5" fill="#f6a9bf"/><circle cx="330" cy="262" r="5" fill="#fff0a8"/>${S.tl.flags.saw_oven ? '<text x="335" y="384" text-anchor="middle" font-size="10" fill="#b03a5b">⚠ cũ 14 năm</text>' : ''}</g>`;
  // shelves with breads
  s += `<g>${[200, 250].map((y) => `<rect x="20" y="${y}" width="120" height="8" rx="3" fill="#e2c3a8"/>${[0, 1, 2, 3].map((i) => `<ellipse cx="${38 + i * 28}" cy="${y - 8}" rx="11" ry="8" fill="${['#f3c58f', '#e9b07a', '#f8d6a8', '#e5a46e'][i]}"/>`).join('')}`).join('')}</g>`;
  s += floor(400, 'gFloorMarble', 'pTiles');
  // counter & display
  s += `<g><rect x="70" y="360" width="250" height="70" rx="12" fill="#fffaf0"/><rect x="70" y="360" width="250" height="16" rx="8" fill="#f6c2d2"/><rect x="88" y="330" width="120" height="34" rx="8" fill="#eaf6ff" opacity=".85" stroke="#fff" stroke-width="2"/>${[0, 1, 2, 3].map((i) => `<g transform="translate(${104 + i * 28},352)"><ellipse rx="10" ry="7" fill="#fff6e8"/><circle cy="-6" r="5" fill="${['#f6a9bf', '#c9b8ec', '#fff0a8', '#a8cf9c'][i]}"/></g>`).join('')}<rect x="240" y="338" width="44" height="26" rx="4" fill="#c9b8ec"/><text x="262" y="356" text-anchor="middle" font-size="9" fill="#fff">CASH</text></g>`;
  // ledger on stool
  s += `<g transform="translate(46,350)"><rect x="-8" y="0" width="56" height="40" rx="6" fill="#e8c9ae"/><rect x="0" y="-12" width="40" height="14" rx="2" fill="#93b39a"/><path d="M20,-12 v14" stroke="#fff" stroke-width="1.5"/></g>`;
  s += rug(195, 530, 140, 34, '#fde2ea', '#f6a9bf') + plant(30, 500, 0.9) + plant(360, 500, 0.9, '#b7a4e0');
  return s;
}

function campus(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#${S.tl.slot === 2 ? 'gSkyDusk' : 'gSky'})"/>` + cloud(300, 50) + cloud(80, 90, 0.7);
  s += `<g><rect x="30" y="140" width="330" height="260" fill="#fffaf0"/><path d="M20,140 L195,70 L370,140Z" fill="#c9b8ec"/><text x="195" y="126" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">ĐẠI HỌC KINH TẾ</text>${[60, 110, 280, 330].map((x) => `<rect x="${x - 7}" y="150" width="14" height="240" fill="#f4ead8"/>`).join('')}${windowEl(48, 170, 34, 50)}${windowEl(298, 170, 34, 50)}</g>`;
  s += door(150, 250, 90, 150, '#93b39a', 'CLB Tài chính');
  // library building at left
  s += `<g><rect x="18" y="280" width="94" height="112" rx="8" fill="#eee8fb"/><path d="M14,282 h102 l-51,-24z" fill="#b7a4e0"/>${[0, 1, 2].map((i) => `<rect x="${28 + i * 26}" y="300" width="18" height="34" rx="9" fill="#cfe3ff"/>`).join('')}<text x="65" y="370" text-anchor="middle" font-size="10" fill="#6c5a8e" font-weight="bold">THƯ VIỆN</text></g>`;
  // notice board
  s += `<g transform="translate(292,300)"><rect x="34" y="70" width="6" height="30" fill="#c9a387"/><rect x="0" y="0" width="76" height="72" rx="6" fill="#e2c3a8"/><rect x="6" y="6" width="30" height="26" fill="#fff"/><rect x="40" y="8" width="30" height="20" fill="#fff0a8"/><rect x="8" y="36" width="60" height="28" fill="#f6c2d2"/><text x="38" y="54" text-anchor="middle" font-size="8" fill="#8a3a5b" font-weight="bold">NETWORKING NIGHT</text></g>`;
  s += `<rect x="0" y="400" width="${W}" height="${H - 400}" fill="url(#gGrass)"/><path d="M0,470 Q195,440 390,470 L390,520 Q195,490 0,520Z" fill="#f4ead8"/>`;
  s += tree(30, 600, 0.8) + tree(360, 610, 0.9, '#c7e0bb') + flowerBed(140, 600, 6, 110);
  return s;
}

function club(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#gWallLav)"/>`;
  s += `<g><rect x="104" y="140" width="182" height="132" rx="8" fill="#fff"/><rect x="110" y="146" width="170" height="120" rx="4" fill="#fbfbff"/><text x="120" y="166" font-size="11" fill="#6c5a8e" font-weight="bold">EV = Σ FCFF/(1+WACC)^t + TV</text><path d="M122,250 L150,228 L178,236 L206,206 L234,212 L262,184" stroke="#f6a9bf" stroke-width="3" fill="none"/><path d="M122,250 H270 M122,180 V250" stroke="#c9b8ec"/></g>`;
  s += windowEl(20, 120, 60, 90) + windowEl(310, 120, 60, 90);
  s += `<rect x="0" y="40" width="${W}" height="26" fill="#c9b8ec" opacity=".6"/><text x="195" y="58" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">FINANCE CLUB · Dare to be challenged</text>`;
  s += floor(390, 'gFloorWood', 'pPlanks');
  s += `<g><ellipse cx="195" cy="470" rx="110" ry="36" fill="#fffaf0"/><ellipse cx="195" cy="464" rx="110" ry="34" fill="#f4ead8"/>${monitor(130, 426)}${monitor(214, 426)}<rect x="180" y="452" width="30" height="20" rx="3" fill="#fff0a8"/></g>`;
  s += plant(30, 380) + plant(360, 380, 1, '#b7a4e0');
  return s;
}

function district(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#${S.tl.slot === 2 ? 'gSkyDusk' : 'gSky'})"/>`;
  const towers = [[10, 120, 60, '#d6dcf2'], [70, 60, 70, '#e8e1f7'], [140, 140, 50, '#f3e3ea'], [190, 30, 60, '#dfe8f4'], [250, 100, 60, '#efe6d8'], [310, 50, 80, '#e5ddf5']];
  for (const [x, y, w, c] of towers) { s += `<rect x="${x}" y="${y}" width="${w}" height="${420 - y}" fill="${c}"/>`; for (let yy = y + 14; yy < 400; yy += 22) for (let xx = x + 8; xx < x + w - 8; xx += 16) s += `<rect x="${xx}" y="${yy}" width="8" height="12" rx="1" fill="#fff" opacity="${(xx + yy) % 3 ? 0.75 : 0.35}"/>`; }
  s += `<rect x="10" y="260" width="140" height="160" fill="#e8eefb"/><path d="M0,262 h160 l-80,-34z" fill="#9fb4e0"/><text x="80" y="256" text-anchor="middle" font-size="10" fill="#3f4a6b" font-weight="bold">LOTUS CAPITAL</text>`;
  s += door(35, 280, 100, 140, '#9fb4e0');
  s += `<g><rect x="245" y="250" width="135" height="170" fill="#fff8e6"/><path d="M240,252 h145 l-72,-44z" fill="url(#gGold)"/>${[258, 288, 338, 368].map((x) => `<rect x="${x - 5}" y="262" width="10" height="150" fill="#f3dc9a"/>`).join('')}<text x="312" y="246" text-anchor="middle" font-size="8.5" fill="#8a6a2e" font-weight="bold">HALL OF LEGENDARY DEALS</text></g>`;
  s += door(265, 285, 95, 135, '#e6c36a', 'Đại Sảnh');
  if (S.tl.chapter === 'career') s += `<g>${door(155, 270, 80, 150, '#d98fa5', 'Văn phòng')}</g>`;
  s += `<rect x="0" y="420" width="${W}" height="${H - 420}" fill="#efe9f3"/><rect x="0" y="420" width="${W}" height="${H - 420}" fill="url(#pTiles)"/>`;
  s += plant(160, 610, 0.9) + plant(230, 610, 0.9, '#b7a4e0');
  if (S.tl.flags.endgame) s += `<g transform="translate(55,600)"><rect x="-3" y="-50" width="6" height="52" fill="#c9a387"/><rect x="-42" y="-62" width="84" height="22" rx="8" fill="url(#gGold)"/><text x="0" y="-47" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">QUỸ CỦA BẠN</text></g>`;
  s += `<g transform="translate(342,600)"><rect x="-3" y="-50" width="6" height="52" fill="#c9a387"/><rect x="-38" y="-62" width="76" height="22" rx="8" fill="#c9b8ec"/><text x="0" y="-47" text-anchor="middle" font-size="9" fill="#fff" font-weight="bold">HỌC VIỆN NGÀNH</text></g>`;
  // news ticker for macro events
  const news = S.tl.macro?.regime === 'recession' ? 'TIN NÓNG · Kinh tế bước vào suy thoái · Doanh nghiệp cắt giảm chi phí' : S.tl.macro?.rate === 'high' ? 'TIN NÓNG · NHTW tăng lãi suất 200 bps · Lợi suất trái phiếu lên 5%' : 'Thị trường ổn định · VN-Index đi ngang · Hoạt động M&A sôi động';
  s += `<g><rect x="0" y="200" width="${W}" height="22" fill="#3f4a6b" opacity=".85"/><text class="ticker" x="${W}" y="215" font-size="11" fill="#fff0a8">${news}</text></g>`;
  return s;
}

function officeBase(theme, S) {
  const t = { ib: ['gWallIvory', '#9fb4e0', 'LOTUS CAPITAL · M&A ADVISORY'], pe: ['gWallSage', '#93b39a', 'SAGE PEAK CAPITAL'], vc: ['gWallIvory', '#f2c57c', 'SEEDLING VENTURES'], cd: ['gWallPink', '#d98fa5', 'PASTEL RETAIL GROUP · CORP DEV'], cs: ['gWallLav', '#8fb0d4', 'BLUEBELL PARTNERS · STRATEGY & TRANSFORMATION'], im: ['gWallIvory', '#a493cf', 'LAVENDER ASSET MANAGEMENT'], firm: ['gWallIvory', '#c9a04e', ((S?.account?.playerName || 'Linh') + ' CAPITAL PARTNERS').toUpperCase()] }[theme];
  let s = `<rect width="${W}" height="${H}" fill="url(#${t[0]})"/>`;
  s += `<rect x="10" y="60" width="370" height="170" rx="10" fill="#cfe3ff" opacity=".8"/>`;
  [[20, 120, 40], [64, 90, 34], [102, 140, 30], [138, 80, 44], [186, 110, 36], [226, 70, 50], [280, 120, 40], [324, 95, 46]].forEach(([x, y, w]) => { s += `<rect x="${x}" y="${y}" width="${w}" height="${230 - y}" fill="#fff" opacity=".55"/>`; });
  s += `<path d="M10,145 H380 M195,60 V230" stroke="#fff" stroke-width="5"/>`;
  s += `<rect x="0" y="22" width="${W}" height="26" fill="${t[1]}"/><text x="195" y="40" text-anchor="middle" font-size="12" fill="#fff" font-weight="bold">${t[2]}</text>`;
  s += floor(395, 'gFloorMarble', 'pTiles');
  s += `<g>${desk(140, 360, 110)}${monitor(168, 322)}</g>`;
  s += `<g>${desk(20, 420, 100)}${monitor(44, 382)}</g><g>${desk(270, 420, 100)}${monitor(294, 382)}</g>`;
  s += plant(30, 380, 1) + plant(362, 380, 1, '#b7a4e0') + rug(195, 540, 150, 34, '#fffaf0', t[1]);
  return s;
}

function hall() {
  let s = `<rect width="${W}" height="${H}" fill="url(#gWallIvory)"/>`;
  s += `<path d="M0,0 H390 V60 Q195,10 0,60Z" fill="url(#gGold)" opacity=".6"/>`;
  [30, 120, 270, 360].forEach((x) => { s += `<rect x="${x - 10}" y="50" width="20" height="360" fill="#f4ead8"/><rect x="${x - 14}" y="44" width="28" height="12" fill="url(#gGold)"/>`; });
  s += `<text x="195" y="90" text-anchor="middle" font-size="15" fill="#8a6a2e" font-weight="bold">ĐẠI SẢNH THƯƠNG VỤ HUYỀN THOẠI</text><text x="195" y="108" text-anchor="middle" font-size="10" fill="#a5885a">Hall of Legendary Deals</text>`;
  s += `<g><path d="M150,150 h90 v40 h-90z" fill="#c9b8ec" opacity=".5"/><path d="M155,190 l40,30 l40,-30" fill="#c9b8ec" opacity=".5"/></g>`;
  s += floor(410, 'gFloorMarble', 'pTiles');
  const ped = (x, y, glyph, label) => `<g><ellipse cx="${x}" cy="${y - 64}" rx="40" ry="40" fill="url(#gGlow)" class="glow"/><rect x="${x - 30}" y="${y - 40}" width="60" height="70" rx="6" fill="#fffaf0" stroke="#e6c36a" stroke-width="2"/><rect x="${x - 36}" y="${y - 46}" width="72" height="10" rx="4" fill="url(#gGold)"/><text x="${x}" y="${y - 60}" text-anchor="middle" font-size="26">${glyph}</text><text x="${x}" y="${y + 6}" text-anchor="middle" font-size="9" fill="#8a6a2e" font-weight="bold">${label}</text></g>`;
  s += ped(67, 380, '💡', 'DISNEY/PIXAR') + ped(195, 360, '📜', 'KKR/RJR') + ped(323, 380, '🧭', 'KEYRUS');
  s += rug(195, 520, 160, 40, '#fff4d6', '#e6c36a');
  return s;
}

function academy(S) {
  let s = `<rect width="${W}" height="${H}" fill="url(#gWallLav)"/><rect width="${W}" height="400" fill="url(#pDots)" opacity=".4"/>`;
  s += `<path d="M0,0 H390 V70 Q195,30 0,70Z" fill="#c9b8ec" opacity=".7"/><text x="195" y="44" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">HỌC VIỆN NGÀNH · INDUSTRY MASTERY</text>`;
  s += windowEl(20, 90, 70, 90) + `<g>${monitor(314, 222)}<rect x="304" y="262" width="72" height="8" rx="3" fill="#e8c9ae"/></g>`;
  // central board
  s += `<g><rect x="140" y="140" width="110" height="96" rx="8" fill="#fffaf0" stroke="#e6c36a" stroke-width="3"/><text x="195" y="162" text-anchor="middle" font-size="10" fill="#6c5a8e" font-weight="bold">A → F FRAMEWORK</text>${['Fundamentals', 'Economics', 'Competition', 'Financials', 'Strategy', 'Thesis'].map((t, i) => `<text x="152" y="${178 + i * 10}" font-size="8" fill="#8a7a90">${'ABCDEF'[i]}. ${t}</text>`).join('')}</g>`;
  s += floor(405, 'gFloorWood', 'pPlanks');
  const done = (q) => !!S.tl.questsDone[q];
  const booth = (x, c, glyph, q) => `<g><rect x="${x}" y="300" width="85" height="100" rx="10" fill="#fff"/><path d="M${x - 4},302 h93 l-8,-22 h-77z" fill="${c}"/>${[0, 1, 2, 3].map((i) => `<path d="M${x - 4 + i * 23},302 l11.5,6 l11.5,-6" fill="#fff" opacity=".6"/>`).join('')}<text x="${x + 42}" y="355" text-anchor="middle" font-size="30">${glyph}</text>${done(q) ? `<text x="${x + 42}" y="388" text-anchor="middle" font-size="10" fill="#5e9d6c" font-weight="bold">✔ Mastered</text>` : ''}</g>`;
  s += booth(10, '#f2c57c', '🎓', 'a_education') + booth(100, '#c9b8ec', '🧭', 'a_consulting') + booth(205, '#a8cf9c', '☀️', 'a_energy') + booth(295, '#f6a9bf', '🏢', 'a_realestate');
  s += rug(195, 520, 160, 36, '#fffaf0', '#c9b8ec') + plant(30, 420, 0.9) + plant(362, 420, 0.9, '#b7a4e0');
  return s;
}

export function sceneSVG(art, S, theme) {
  const body = art === 'academy' ? academy(S) :art === 'bedroom' ? bedroom(S) : art === 'garden' ? garden(S) : art === 'bakery' ? bakery(S) : art === 'campus' ? campus(S) : art === 'club' ? club(S) : art === 'district' ? district(S) : art === 'hall' ? hall(S) : art === 'ibank' ? officeBase('ib') : officeBase(theme, S);
  const night = S.tl.slot === 2 ? `<rect width="${W}" height="${H}" fill="#6a4c9c" opacity=".08" pointer-events="none"/>` : '';
  return defs + body + night;
}

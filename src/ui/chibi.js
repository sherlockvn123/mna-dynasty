// Original procedural chibi character renderer (SVG). Feet at (0,0). ~110px tall at scale 1.
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt)), g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

function hairBack(L) {
  const c = L.hair, d = shade(c, -18);
  switch (L.hairStyle) {
    case 'long': return `<path d="M-29,-70 Q-34,-30 -24,-22 L24,-22 Q34,-30 29,-70 Z" fill="${d}"/>`;
    case 'twin': return `<g><ellipse cx="-30" cy="-56" rx="9" ry="16" fill="${d}" transform="rotate(18 -30 -56)"/><ellipse cx="30" cy="-56" rx="9" ry="16" fill="${d}" transform="rotate(-18 30 -56)"/></g>`;
    case 'ponytail': return `<path d="M20,-84 Q44,-78 38,-46 Q34,-36 28,-44 Q34,-62 18,-74Z" fill="${d}"/>`;
    case 'bun': return `<circle cx="0" cy="-100" r="11" fill="${d}"/><circle cx="-3" cy="-103" r="3" fill="${shade(c, 20)}"/>`;
    case 'bob': return `<path d="M-29,-72 Q-31,-44 -22,-42 L22,-42 Q31,-44 29,-72 Z" fill="${d}"/>`;
    default: return '';
  }
}
function hairFront(L) {
  const c = L.hair, hl = shade(c, 28);
  const cap = `<path d="M-27,-68 Q-28,-96 0,-96 Q28,-96 27,-68 Q20,-80 8,-77 Q0,-86 -9,-77 Q-19,-82 -27,-68Z" fill="${c}"/>`;
  const shine = `<path d="M-14,-88 Q-4,-93 6,-90" stroke="${hl}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`;
  switch (L.hairStyle) {
    case 'short': return `<path d="M-27,-66 Q-29,-97 0,-97 Q29,-97 27,-66 Q24,-78 14,-80 Q4,-74 -6,-80 Q-20,-80 -27,-66Z" fill="${c}"/>${shine}`;
    case 'slick': return `<path d="M-27,-66 Q-28,-98 2,-97 Q30,-95 27,-70 Q18,-86 -4,-84 Q-20,-82 -27,-66Z" fill="${c}"/>${shine}`;
    case 'spiky': return `<path d="M-27,-66 L-30,-84 L-20,-88 L-18,-100 L-6,-94 L2,-104 L10,-94 L22,-99 L22,-86 L30,-82 L27,-66 Q16,-78 4,-76 Q-10,-80 -27,-66Z" fill="${c}"/>`;
    case 'bob': return `${cap}<path d="M-27,-70 Q-30,-50 -24,-44 L-20,-60Z M27,-70 Q30,-50 24,-44 L20,-60Z" fill="${c}"/>${shine}`;
    case 'long': return `${cap}<path d="M-27,-70 Q-31,-46 -25,-30 L-19,-58Z M27,-70 Q31,-46 25,-30 L19,-58Z" fill="${c}"/>${shine}`;
    default: return cap + shine;
  }
}
function accessory(L) {
  const c = L.accColor || '#f08fb0';
  switch (L.acc) {
    case 'bow': return L.hairStyle === 'twin'
      ? `<g fill="${c}"><path d="M-34,-80 l-7,-5 v10z M-34,-80 l7,-5 v10z"/><circle cx="-34" cy="-80" r="2.4"/><path d="M34,-80 l-7,-5 v10z M34,-80 l7,-5 v10z"/><circle cx="34" cy="-80" r="2.4"/></g>`
      : `<g fill="${c}" transform="translate(18,-92)"><path d="M0,0 l-8,-6 v12z M0,0 l8,-6 v12z"/><circle r="2.6"/></g>`;
    case 'glasses': return `<g fill="none" stroke="${c}" stroke-width="1.8"><circle cx="-10" cy="-64" r="7"/><circle cx="10" cy="-64" r="7"/><path d="M-3,-64 h6"/></g>`;
    case 'earring': return `<circle cx="-25" cy="-56" r="2.4" fill="${c}"/><circle cx="25" cy="-56" r="2.4" fill="${c}"/>`;
    default: return '';
  }
}
function body(L) {
  const o = L.outfit, o2 = L.outfit2 || '#fff', d = shade(o, -22);
  switch (L.type) {
    case 'dress': return `<path d="M-13,-42 Q0,-46 13,-42 L20,-16 Q0,-10 -20,-16Z" fill="${o}"/><path d="M-20,-16 Q0,-10 20,-16" stroke="${o2}" stroke-width="3" fill="none"/><path d="M-6,-42 L0,-34 L6,-42" fill="${o2}"/>`;
    case 'apron': return `<path d="M-14,-42 Q0,-46 14,-42 L18,-14 L-18,-14Z" fill="${o}"/><path d="M-9,-38 h18 v22 h-18z" fill="${o2}" rx="3"/><path d="M-9,-38 Q0,-32 9,-38" stroke="${d}" fill="none"/>`;
    case 'robe': return `<path d="M-14,-42 Q0,-46 14,-42 L22,-6 Q0,-2 -22,-6Z" fill="${o}"/><path d="M0,-42 V-6" stroke="${o2}" stroke-width="3"/><path d="M-22,-6 Q0,-2 22,-6" stroke="${shade(o, 30)}" stroke-width="2" fill="none"/>`;
    case 'hoodie': return `<path d="M-15,-42 Q0,-47 15,-42 L16,-18 L-16,-18Z" fill="${o}"/><path d="M-7,-30 h14 v6 h-14z" fill="${d}" opacity=".5"/><path d="M-4,-42 v8 M4,-42 v8" stroke="${o2}" stroke-width="1.5"/>`;
    case 'blouse': return `<path d="M-14,-42 Q0,-46 14,-42 L15,-18 L-15,-18Z" fill="${o}"/><path d="M-6,-42 L0,-35 L6,-42" fill="${o2}"/>`;
    case 'blazer':
    case 'suit':
    default: return `<path d="M-15,-42 Q0,-47 15,-42 L16,-18 L-16,-18Z" fill="${o}"/><path d="M-6,-42 L0,-26 L6,-42Z" fill="${o2}"/><path d="M-6,-42 L-2,-24 M6,-42 L2,-24" stroke="${d}" stroke-width="1.5"/>${L.acc === 'tie' ? `<path d="M0,-38 l-2,4 l2,10 l2,-10z" fill="${L.accColor}"/>` : ''}${L.acc === 'pin' ? `<circle cx="-9" cy="-34" r="2" fill="${L.accColor}"/>` : ''}`;
  }
}

export function chibiSVG(L, opts = {}) {
  const skin = L.skin, legC = ['dress', 'robe', 'apron'].includes(L.type) ? skin : shade(L.outfit, -35);
  const shoe = shade(L.outfit, -60);
  const s = L.scale || 1;
  return `<g class="chibi" transform="scale(${s})">
    <ellipse class="shadow" cx="0" cy="0" rx="17" ry="4.5" fill="rgba(90,60,110,.18)"/>
    <g class="bob">
      <g class="legs">
        <g class="legL"><rect x="-9" y="-20" width="7" height="18" rx="3.5" fill="${legC}"/><ellipse cx="-5.5" cy="-2" rx="5.5" ry="3" fill="${shoe}"/></g>
        <g class="legR"><rect x="2" y="-20" width="7" height="18" rx="3.5" fill="${legC}"/><ellipse cx="5.5" cy="-2" rx="5.5" ry="3" fill="${shoe}"/></g>
      </g>
      <g class="arms"><rect class="armL" x="-21" y="-41" width="7" height="19" rx="3.5" fill="${L.outfit}"/><rect class="armR" x="14" y="-41" width="7" height="19" rx="3.5" fill="${L.outfit}"/>
        <circle cx="-17.5" cy="-21" r="3.6" fill="${skin}"/><circle cx="17.5" cy="-21" r="3.6" fill="${skin}"/></g>
      ${body(L)}
      ${hairBack(L)}
      <rect x="-5" y="-48" width="10" height="8" fill="${shade(skin, -14)}"/>
      <circle cx="0" cy="-68" r="27" fill="${skin}"/>
      <ellipse cx="-27" cy="-64" rx="3.5" ry="5" fill="${skin}"/><ellipse cx="27" cy="-64" rx="3.5" ry="5" fill="${skin}"/>
      <g class="eyes">
        <g class="eye"><ellipse cx="-10" cy="-63" rx="4.6" ry="6" fill="#3c2c4e"/><circle cx="-8.4" cy="-65.5" r="1.9" fill="#fff"/><circle cx="-11.5" cy="-60.8" r="0.9" fill="#fff"/></g>
        <g class="eye"><ellipse cx="10" cy="-63" rx="4.6" ry="6" fill="#3c2c4e"/><circle cx="11.6" cy="-65.5" r="1.9" fill="#fff"/><circle cx="8.5" cy="-60.8" r="0.9" fill="#fff"/></g>
      </g>
      <ellipse cx="-17" cy="-54" rx="4.5" ry="2.6" fill="#f7a1b5" opacity=".55"/><ellipse cx="17" cy="-54" rx="4.5" ry="2.6" fill="#f7a1b5" opacity=".55"/>
      <path class="mouth" d="M-3.5,-52 Q0,-49 3.5,-52" stroke="#a5576a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      ${hairFront(L)}
      ${accessory(L)}
    </g>
  </g>`;
}

export function portraitSVG(L, size = 64) {
  return `<svg viewBox="-34 -104 68 64" width="${size}" height="${size * 64 / 68}" aria-hidden="true">${chibiSVG({ ...L, scale: 1 })}</svg>`;
}

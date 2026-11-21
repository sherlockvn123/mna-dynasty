// LP report export: a self-contained HTML document (inline CSS + inline SVG, Arial, no network) for one finished fund,
// written as a year-10 letter to Limited Partners. Everything is educational simulation output and is labelled as such.
import { nf, esc } from './dom.js';
import * as FS from '../engine/fundsim.js';
import * as L from '../engine/league.js';
import { jCurveChart } from './charts.js';

export const FUND_NAME = { fund1: 'Fund I', fund2: 'Fund II', fund3: 'Fund III' };
const KEY = { fund1: 'f1', fund2: 'f2', fund3: 'f3' };
const SECTOR_VI = { healthcare: 'Y tế', saas: 'Phần mềm SaaS', industrial: 'Công nghiệp', education: 'Giáo dục', consulting: 'Tư vấn & dịch vụ', consumer: 'Tiêu dùng', energy: 'Năng lượng', logistics: 'Logistics', ai: 'AI', realestate: 'Bất động sản', hospitality: 'Khách sạn' };
const x2 = (v) => (v == null ? '—' : nf(v, 2) + 'x');
const pct = (v) => (v == null ? '—' : (v < 0 ? '−' : '') + nf(Math.abs(v), 1) + '%');
const m1 = (v) => (v == null ? '—' : (v < 0 ? '−' : '') + nf(Math.abs(v), 1));

/** Structured content of the report (pure data — easy to test). */
export function lpReportData(sim, { playerName = 'Linh', timelineName = '' } = {}) {
  if (!sim?.done || !sim.result) return null;
  const r = sim.result, scen = sim.scenario || 'fund1', key = KEY[scen];
  const jc = FS.jCurve(sim);
  const pre = { f1: 'fund_', f2: 'fund2_', f3: 'fund3_' }[key];
  const flags = { [pre + 'size']: r.committed, [pre + 'tvpi']: r.netTvpi, [pre + 'irr']: r.netIrr * 100, [pre + 'pme']: r.pme ?? null, [pre + 'dpi7']: r.dpi7 ?? null };
  const me = { id: 'me', name: playerName + ' Capital', funds: L.fundsOf(flags) };
  const byT = L.leagueRows([me], key, 'tvpi'), byP = r.pme != null ? L.leagueRows([me], key, 'pme') : null;
  const holdings = sim.holdings.filter((h) => !h.cv).map((h) => {
    const d = FS.ALL_DEALS[h.id], sold = sim.holdings.filter((x) => x.cv && x.id === h.id).reduce((s, x) => s + x.proceeds, 0), soldCost = sim.holdings.filter((x) => x.cv && x.id === h.id).reduce((s, x) => s + x.cost, 0);
    const cost = h.cost + soldCost, proceeds = h.proceeds + sold;
    const cvYear = sim.holdings.find((x) => x.cv && x.id === h.id)?.exitYear;
    return { name: d.name, sector: SECTOR_VI[d.sector] || d.sector, entry: h.entryYear, exit: cvYear ? `${cvYear} / ${h.exitYear}` : h.exitYear ?? null, cost, proceeds, moic: cost ? proceeds / cost : 0, status: h.status === 'written_off' ? 'Xoá sổ' : sold ? 'Thoái (một phần qua continuation vehicle)' : 'Đã thoái vốn', large: !!d.large, vcp: !!h.vcpDone, ai: d.ai || 0, rescued: !!h.rescued };
  }).sort((a, b) => b.proceeds - a.proceeds);
  return {
    title: `${playerName} Capital — ${FUND_NAME[scen]}`, fund: FUND_NAME[scen], scenario: scen, key, playerName, timelineName,
    kpis: [['Vốn cam kết', m1(r.committed) + ' tr. USD'], ['Vốn đã góp (paid-in)', m1(r.paidIn) + ' tr. USD'], ['Phân phối cho LP (sau carry)', m1(r.lpDist) + ' tr. USD'], ['Net TVPI', x2(r.netTvpi)], ['Net IRR', pct(r.netIrr * 100)], ['DPI năm 7', x2(r.dpi7)], ['KS-PME', r.pme == null ? '—' : nf(r.pme, 2)], ['Quartile (mô phỏng)', 'Q' + r.quartile], ['Gross MOIC', x2(r.grossMoic)], ['Phí quản lý', m1(r.fees) + ' tr. USD'], ['Carry của GP', m1(r.carry) + ' tr. USD'], ['Chỉ số niêm yết cùng kỳ', r.publicTr == null ? '—' : x2(r.publicTr)]],
    rankT: byT.find((x) => x.mine).rank, rankP: byP ? byP.find((x) => x.mine).rank : null, peers: byT.length,
    jc, holdings, events: r.events || [], result: r,
    letter: letter(r, jc, scen, playerName),
  };
}

function letter(r, jc, scen, playerName) {
  const p = [];
  p.push(`${FUND_NAME[scen]} đã hoàn tất vòng đời ${jc.years.length} năm. Sau phí quản lý và carry, mỗi 1 USD Quý vị góp vào đã mang về ${nf(r.netTvpi, 2)} USD (net TVPI ${x2(r.netTvpi)}, net IRR ${pct(r.netIrr * 100)}), xếp nhóm Q${r.quartile} trong bộ quỹ đối chiếu mô phỏng.`);
  if (r.pme != null) p.push(`So với một chỉ số cổ phiếu niêm yết đi cùng chu kỳ (tăng ${x2(r.publicTr)} trong cùng kỳ), KS-PME của quỹ là ${nf(r.pme, 2)} — ${r.pme >= 1 ? `quỹ đã vượt thị trường niêm yết khi tính đúng thời điểm từng dòng tiền` : `quỹ chưa vượt được thị trường niêm yết khi tính đúng thời điểm dòng tiền; chúng tôi ghi nhận điều này một cách thẳng thắn`}.`);
  if (jc.trough) p.push(`Dòng tiền ròng của LP chạm đáy ${m1(jc.trough.value)} triệu USD ở năm ${jc.trough.y}${jc.breakeven ? ` và Quý vị hoà vốn tiền mặt vào năm ${jc.breakeven}` : ''}. DPI năm 7 đạt ${x2(r.dpi7)}${(r.dpi7 ?? 0) < 0.3 ? ' — phần lớn giá trị được hiện thực hoá ở cuối vòng đời quỹ' : ''}.`);
  if (r.writeOffs) p.push(`${r.writeOffs} khoản đầu tư bị xoá sổ. Bài học về đòn bẩy và thời điểm mua đã được đưa vào quy trình thẩm định của quỹ kế tiếp.`);
  if (r.largeCaps) p.push(`Quỹ có ${r.largeCaps} thương vụ large-cap, nằm ngoài chiến lược mid-market đã cam kết; chúng tôi ghi nhận đây là trôi chiến lược (style drift).`);
  if (r.vcps) p.push(`Đội ngũ đã triển khai ${r.vcps} kế hoạch tạo giá trị — nguồn lợi nhuận chính khi bội số định giá không tăng.`);
  if (r.navLoan > 0) p.push(`Quỹ đã dùng NAV loan ${m1(r.navLoan)} triệu USD; khoản vay và lãi được hoàn trả trước khi phân phối cho LP.`);
  p.push(`Trân trọng,\n${playerName} — Managing Partner`);
  return p;
}

const CSS = `body{font-family:Arial,Helvetica,sans-serif;color:#3b2f44;margin:0;background:#fff}main{max-width:780px;margin:0 auto;padding:28px 22px}
h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:26px 0 8px;border-bottom:2px solid #efe6f4;padding-bottom:4px}.sub{color:#7a6d82;font-size:13px}
.disc{background:#fff6e5;border:1px solid #efd9a8;border-radius:10px;padding:8px 12px;font-size:12px;margin:14px 0}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:8px}.kpi{border:1px solid #ece3f2;border-radius:10px;padding:8px 10px}.kpi small{display:block;color:#7a6d82;font-size:11px}.kpi b{font-size:16px}
table{width:100%;border-collapse:collapse;font-size:12.5px}th,td{text-align:left;padding:6px 6px;border-bottom:1px solid #f0e9f4}th{color:#7a6d82;font-weight:normal}td.n{text-align:right;font-variant-numeric:tabular-nums}
.letter p{margin:0 0 10px;line-height:1.5;white-space:pre-line}.tag{font-size:10.5px;border-radius:8px;padding:1px 6px;background:#efe9fb;margin-left:4px}
.ev{border-left:3px solid #c9b8ec;padding:4px 10px;margin:6px 0;font-size:13px}.muted{color:#7a6d82;font-size:12px}
.jc{--jc-call:#c45f7c;--jc-dist:#2a7fc4;--jc-cum:#6a3f8f;--jc-total:#a07a2a;--muted:#7a6d82;--ink:#3b2f44}.jc-legend{display:flex;flex-wrap:wrap;gap:4px 14px;font-size:11px;color:#7a6d82;margin:4px 0}.jc-legend span{display:inline-flex;align-items:center;gap:5px}
.jc-legend .sw{width:10px;height:10px;border-radius:2px;display:inline-block}.jc-legend .ln{width:16px;border-top:2px solid;display:inline-block}.jc-legend .ln.dash{border-top-style:dashed}
.jc-call-sw{background:var(--jc-call)}.jc-dist-sw{background:var(--jc-dist)}.jc-cum-sw{border-color:var(--jc-cum)}.jc-total-sw{border-color:var(--jc-total)}
.jc-svg{width:100%;max-width:560px;height:auto}.jc-grid{stroke:#ece4f0}.jc-zero{stroke:#7a6d82}.jc-tick{font-size:9px;fill:#7a6d82}.jc-call{fill:var(--jc-call)}.jc-dist{fill:var(--jc-dist)}
.jc-cum{fill:none;stroke:var(--jc-cum);stroke-width:2}.jc-total{fill:none;stroke:var(--jc-total);stroke-width:2;stroke-dasharray:5 4}.jc-dot{fill:var(--jc-cum);stroke:#fff;stroke-width:2}.jc-trough{fill:none;stroke:var(--jc-cum);stroke-width:2}
.jc-label{font-size:10px;fill:#3b2f44;font-weight:bold}.jc-hit,.jc-cross{display:none}
@media print{main{padding:0}.noprint{display:none}h2{break-after:avoid}table,.kpis{break-inside:avoid}}`;

/** Full standalone HTML document for a finished fund simulation. */
export function lpReportHTML(sim, opts = {}) {
  const d = lpReportData(sim, opts); if (!d) return null;
  const chart = jCurveChart(d.jc, { title: 'J-curve — dòng tiền ròng của LP (triệu USD)' });
  const svg = chart.querySelector('svg').outerHTML, legend = chart.querySelector('.jc-legend').outerHTML;
  const rows = d.holdings.map((h) => `<tr><td>${esc(h.name)}${h.large ? '<span class="tag">large-cap</span>' : ''}${h.vcp ? '<span class="tag">VCP</span>' : ''}${h.rescued ? '<span class="tag">rescue</span>' : ''}</td><td>${esc(h.sector)}</td><td class="n">${h.entry}</td><td class="n">${h.exit ?? '—'}</td><td class="n">${m1(h.cost)}</td><td class="n">${m1(h.proceeds)}</td><td class="n">${x2(h.moic)}</td><td>${esc(h.status)}</td></tr>`).join('');
  const jrows = d.jc.years.map((p) => `<tr><td class="n">${p.y}</td><td class="n">${m1(-p.call)}</td><td class="n">${m1(p.dist)}</td><td class="n">${m1(p.cum)}</td></tr>`).join('');
  const ev = d.events.length ? d.events.map((e) => `<div class="ev"><b>Năm ${e.year} · ${esc(e.title)}</b><br>${esc(e.out)}</div>`).join('') : '<p class="muted">Không có sự kiện khủng hoảng cần quyết định trong vòng đời quỹ.</p>';
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(d.title)} — Báo cáo LP</title><style>${CSS}</style></head><body><main>
<p class="noprint" style="text-align:right"><button onclick="window.print()">🖨️ In / Lưu PDF</button></p>
<h1>${esc(d.title)}</h1><div class="sub">Báo cáo cuối vòng đời gửi Nhà đầu tư (LP)${d.timelineName ? ' · ' + esc(d.timelineName) : ''}</div>
<div class="disc">⚠️ Tài liệu giáo dục được tạo từ game M&amp;A Dynasty. Mọi công ty, số liệu, quỹ đối chiếu và chỉ số niêm yết đều là <b>Simulation Assumption</b> — không phải dữ liệu thật và không phải tư vấn đầu tư.</div>
<h2>Thư gửi Nhà đầu tư</h2><div class="letter"><p>Kính gửi các Nhà đầu tư (LP),</p>${d.letter.map((x) => `<p>${esc(x)}</p>`).join('')}</div>
<h2>Kết quả chính</h2><div class="kpis">${d.kpis.map(([k, v]) => `<div class="kpi"><small>${esc(k)}</small><b>${esc(v)}</b></div>`).join('')}</div>
<p class="muted">Xếp hạng trong vintage: ${d.rankT}/${d.peers} theo net TVPI${d.rankP ? ` · ${d.rankP}/${d.peers} theo KS-PME` : ''} (so với 10 quỹ đối chiếu hư cấu).</p>
<h2>J-curve</h2><div class="jc">${legend}${svg}</div>
<table><thead><tr><th>Năm</th><th>Gọi vốn</th><th>Phân phối</th><th>Luỹ kế</th></tr></thead><tbody>${jrows}</tbody></table>
<h2>Danh mục đầu tư</h2><table><thead><tr><th>Công ty</th><th>Ngành</th><th>Năm vào</th><th>Năm ra</th><th>Vốn (tr. USD)</th><th>Thu về</th><th>MOIC</th><th>Trạng thái</th></tr></thead><tbody>${rows}</tbody></table>
<h2>Quyết định trong khủng hoảng</h2>${ev}
<h2>Phương pháp</h2><p class="muted">Net TVPI = phân phối cho LP sau phí và carry ÷ vốn đã góp. Net IRR tính trên dòng tiền năm của LP. DPI năm 7 = tiền đã phân phối đến hết năm 7 ÷ vốn đã góp đến năm 7. KS-PME (Kaplan–Schoar) = tổng phân phối × I<sub>T</sub>/I<sub>t</sub> ÷ tổng vốn góp × I<sub>T</sub>/I<sub>t</sub>; PME &gt; 1 nghĩa là vượt chỉ số niêm yết với cùng thời điểm dòng tiền. Carry 20% với hurdle 8%. Ngưỡng quartile mô phỏng: Q1 ≥ 2,0x; Q2 ≥ 1,6x; Q3 ≥ 1,3x.</p>
</main></body></html>`;
}

export const reportFileName = (sim, playerName = 'Linh') => `${(playerName + '-capital').toLowerCase().replace(/[^a-z0-9]+/gi, '-')}-${(FUND_NAME[sim.scenario || 'fund1'] || 'fund').toLowerCase().replace(/\s+/g, '-')}-bao-cao-lp.html`;

/** Save the report as an .html file (user-initiated download). */
export function downloadReport(sim, opts = {}) {
  const html = lpReportHTML(sim, opts); if (!html) return false;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const a = document.createElement('a'); a.href = url; a.download = reportFileName(sim, opts.playerName); document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return true;
}

/** Open the report in a new tab for printing / "Save as PDF". */
export function openReport(sim, opts = {}) {
  const html = lpReportHTML(sim, opts); if (!html) return false;
  const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  const w = window.open(url, '_blank'); setTimeout(() => URL.revokeObjectURL(url), 60000);
  return !!w;
}

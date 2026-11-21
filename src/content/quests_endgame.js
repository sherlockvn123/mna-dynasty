// Chapter 5 — The Capital Architect (endgame). Unlocked after the first-year review of any career.
// Leap forward → found a firm & raise Fund I → build the team → buy-and-build platform → crisis & hostile bid → legacy → Fund II.
// Every outcome reads persistent state (relationships, ethics, specialization, history) from earlier chapters.
import * as F from '../engine/finance.js';
import { CAREERS } from './careers.js';
import { NPCS } from './characters.js';
import { SECTORS } from './sectors.js';

const r1 = (x) => Math.round(x * 10) / 10;
const nf = (x, d = 0) => Number(x).toLocaleString('vi-VN', { maximumFractionDigits: d });
const r2 = (x) => Math.round(x * 100) / 100;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

const FUND = F.fundEconomics({ committed: 200, feeTotal: 20, grossMoic: 2.5 });
const BUDGET = { fees: 200 * 0.02, ops: 0.8, partners: 2 * 0.9, associates: 3 * 0.25 };
BUDGET.left = BUDGET.fees - BUDGET.ops - BUDGET.partners - BUDGET.associates;   // 0.65
const BB = F.buyAndBuild({ platformEbitda: 20, platformMultiple: 10, addOns: [{ ebitda: 6, multiple: 6 }, { ebitda: 4, multiple: 6 }], exitMultiple: 10 });
const HOSTILE = { bid: 30000, intrinsic: 36000 };
HOSTILE.gap = 1 - HOSTILE.bid / HOSTILE.intrinsic;                                // 16.7%
export const ENDGAME_ANSWERS = { FUND, BUDGET, BB, HOSTILE };

const relScore = (tl, id) => (tl.rel[id]?.trust ?? 0) + (tl.rel[id]?.respect ?? 0);

/** Who accepts an invitation to join the player's firm — a direct consequence of the relationships built over the game. */
export function recruits(tl) {
  const out = [];
  if (relScore(tl, 'mai') >= 15) out.push(['mai', 'hired_mai', 'tin tưởng bạn từ đêm networking năm nào']);
  if (relScore(tl, 'vy') >= 15) out.push(['vy', 'hired_vy', 'nhớ cô thành viên CLB luôn dám phản biện']);
  if (relScore(tl, 'khoa') >= 20 && !tl.flags.cheated_uni && !tl.flags.compliance_breach) out.push(['khoa', 'hired_khoa', 'nói: "Cậu là người công bằng nhất tớ từng làm việc cùng"']);
  if (tl.flags.credit_private) out.push(['duc', 'hired_duc', 'chưa quên cách bạn xử lý chuyện cũ một cách tử tế']);
  return out;
}

export const ENDGAME_QUESTS = [
  {
    id: 'e_leap', title: '⏳ Tám năm sau', kind: 'endgame', chapter: 'career', giver: 'bo', loc: 'garden', age: 32,
    cond: (tl) => tl.status === 'complete' && !tl.flags.endgame,
    summary: 'Chương 5 — The Capital Architect. Nhìn lại hành trình, bước lên vị trí lãnh đạo và quyết định thành lập quỹ của riêng mình.',
    steps: [
      { type: 'say', lines: [['nar', 'Tám năm trôi qua. Những đêm làm mô hình, những thương vụ thành và bại, những người đã đi cùng bạn…'], ['bo', 'Ngày con 10 tuổi mặc cả với Cô Hạnh, bố đã biết con sẽ đi xa. Nhưng bố không ngờ con đi bằng chính đôi chân của mình như thế.'], ['me', 'Giờ đến lúc con tự hỏi: con muốn xây dựng điều gì mang tên mình?']] },
      { type: 'outcome', id: 'e_leap_out', eval: (rt, S) => {
        const tl = S.tl; const c = CAREERS[tl.career.track]; const max = c.ranks.length - 1;
        const scores = Object.entries(tl.questsDone).filter(([k]) => k.startsWith('k_') || k.startsWith('x_')).map(([, v]) => v.score ?? 0);
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        const ethicsOk = (tl.stats.ethics ?? 0) >= 0;
        const target = avg >= 0.85 && ethicsOk ? max : avg >= 0.65 ? max - 1 : max - 2;
        const hist = [...(tl.career.history || []).map((h) => CAREERS[h.track].name), c.name].join(' → ');
        return { text: `Hành trình: ${hist}. Với năng lực trung bình ${Math.round(avg * 100)}%${ethicsOk ? '' : ' (nhưng vết đen về đạo đức vẫn theo bạn)'}, bạn trở thành ${c.ranks[Math.max(0, target)]}. Bạn quyết định rời đi để thành lập quỹ đầu tư mang tên mình.`, fx: { career: { setRank: Math.max(0, target) }, flags: { endgame: true } }, score: avg };
      } },
    ],
    rewards: { xp: 60, rep: 3 },
  },
  {
    id: 'e_fund', title: '🏛️ Thành lập quỹ & gọi vốn Fund I', kind: 'endgame', chapter: 'career', giver: null, obj: 'lp_table', loc: 'firm', req: ['e_leap'],
    summary: 'Kinh tế học của quỹ (phí, carry, gross vs net), chọn LP đúng chuẩn KYC và đàm phán điều khoản với nhà đầu tư tổ chức.',
    steps: [
      { type: 'say', lines: [['an', 'Chào chị! Em là Bảo An — associate đầu tiên của quỹ. Mục tiêu Fund I: 200 triệu USD.'], ['me', '(gọi điện) Nhớ nhé con: LP không mua lợi nhuận quá khứ của con. Họ mua sự minh bạch, kỷ luật và sự liên kết lợi ích.']], terms: ['Limited Partner', 'Carried Interest', 'TVPI'] },
      { type: 'num', id: 'e_fund_inv', concept: 'fund_economics', q: 'Fund I cam kết 200 triệu USD; tổng phí quản lý trong vòng đời quỹ 20 triệu. Số vốn thực sự đầu tư được (triệu USD)?', a: FUND.invested, tol: 0, unit: 'triệu USD', fb: fb('200 − 20 = 180.', 'Investable capital = commitments − lifetime fees (simplified).', 'Phí lấy từ vốn cam kết.', 'Vì thế quỹ phải đạt gross MOIC cao hơn đáng kể để LP có net tốt.', 'Fund economics', 'Thành lập quỹ') },
      { type: 'num', id: 'e_fund_carry', concept: 'fund_economics', q: 'Gross MOIC 2,5x trên 180 đầu tư = 450. Carry 20% trên lợi nhuận vượt vốn cam kết (hurdle đã đạt). Carry của GP (triệu USD)?', a: FUND.carry, tol: 0.5, unit: 'triệu USD', traps: [{ v: 54, why: 'Lợi nhuận tính trên vốn CAM KẾT (200), không phải vốn đầu tư (180): 20% × (450 − 200) = 50.' }],
        fb: fb('20% × (450 − 200) = 50.', 'Carry = carry % × profit above committed capital (with hurdle met and catch-up).', 'LP phải nhận lại toàn bộ vốn cam kết trước.', 'Carry là động lực chính của GP — gắn lợi ích với LP.', 'Distribution waterfall', 'Thành lập quỹ') },
      { type: 'num', id: 'e_fund_net', concept: 'fund_economics', q: 'Net TVPI cho LP (x, 2 chữ số thập phân)?', a: r2(FUND.netTvpi), tol: 0.01, unit: 'x', traps: [{ v: 2.5, why: 'Đó là gross MOIC. Net trừ phí và carry: (450 − 50) / 200 = 2,0x.' }],
        fb: fb('(450 − 50) / 200 = 2,0x — thấp hơn gross 0,5x.', 'Net TVPI = LP distributions / LP commitments.', 'Phí và carry tạo khoảng cách gross–net.', 'LP so sánh quỹ bằng net, không phải gross.', 'Gross vs net', 'Thành lập quỹ') },
      { type: 'sort', id: 'e_fund_lps', concept: 'fund_economics', q: 'Chọn LP cho Fund I:', cats: ['Mời tham gia', 'Từ chối'],
        items: [['Quỹ hưu trí giáo viên (đã qua due diligence)', 0], ['Quỹ đầu tư quốc gia', 0], ['Nhà đầu tư không chịu cung cấp nguồn gốc tiền (KYC/AML)', 1], ['Family office của một tập đoàn uy tín', 0], ['LP đòi quyền phủ quyết từng khoản đầu tư qua side letter', 1], ['Fund of funds chuyên mid-market', 0]],
        fb: fb('KYC/AML là bắt buộc; quyền phủ quyết từng khoản phá vỡ sự độc lập của GP và đối xử bất công với LP khác.', 'Reject LPs failing KYC/AML or demanding terms that compromise governance.', 'Chất lượng LP quan trọng như quy mô.', 'Một LP sai có thể huỷ hoại danh tiếng quỹ.', 'LP governance', 'Thành lập quỹ') },
      { type: 'negotiate', id: 'e_fund_neg', who: 'tung', role: 'sell', concept: 'negotiation', unit: 'bps phí quản lý', ask: 150, reservation: 180, min: 100, max: 250, step: 5, start: 200, rounds: 4, concession: 0.45, insult: 1.25,
        intro: 'Chú Tùng — giờ là CIO của một quỹ hưu trí lớn — đại diện LP chủ chốt. Họ muốn phí thấp hơn mức 200 bps (2%) bạn đề xuất.',
        batna: 'Đóng quỹ nhỏ hơn với các LP còn lại.',
        issues: [{ id: 'keyperson', t: 'Điều khoản key person (bạn phải dành toàn thời gian cho quỹ)', v: 10 }, { id: 'gpcommit', t: 'GP tự góp 2% vốn quỹ', v: 15 }, { id: 'hurdle', t: 'Hurdle 8% với catch-up chuẩn', v: 5 }] },
      { type: 'outcome', id: 'e_fund_out', eval: (rt, S, sc) => {
        const tl = S.tl; const n = rt.vars.e_fund_neg;
        let size = 150 + (tl.stats.rep >= 30 ? 50 : 0) + ((tl.stats.ethics ?? 0) >= 10 ? 25 : 0) + (n?.deal ? 25 : 0);
        size = Math.min(300, size);
        const fee = n?.deal ? n.price : 175;
        return { text: `${S.account.playerName} Capital đóng Fund I ở ${size} triệu USD, phí quản lý ${fee} bps.${n?.deal ? ' Chú Tùng: "Quỹ hưu trí của chúng tôi tin vào sự minh bạch của cô."' : ' Không có LP chủ chốt — quỹ nhỏ hơn kế hoạch.'} Uy tín (${tl.stats.rep}) và hồ sơ đạo đức (${tl.stats.ethics ?? 0}) của bạn quyết định phần lớn quy mô quỹ.`, fx: { flags: { fund_size: size, fund_fee: fee }, ach: ['founder'] }, score: sc };
      } },
    ],
    rewards: { xp: 70, rep: 3 },
  },
  {
    id: 'e_team', title: '👥 Xây dựng đội ngũ & dẫn dắt thế hệ sau', kind: 'endgame', chapter: 'career', giver: 'an', loc: 'firm', req: ['e_fund'],
    summary: 'Ngân sách từ phí quản lý, mời đồng sự từ chính các mối quan hệ của bạn, uỷ quyền và huấn luyện người kế cận.',
    steps: [
      { type: 'say', lines: [['an', 'Chị ơi, mình cần tuyển đội. Phí quản lý là "lương" của cả quỹ — mình phải tính kỹ.']] },
      { type: 'num', id: 'e_team_budget', concept: 'fund_economics', q: 'Quỹ 200 triệu USD, phí 2%/năm. Chi phí: văn phòng & vận hành 0,8; 2 partners × 0,9; 3 associates × 0,25 (triệu USD/năm). Phần còn lại (triệu USD)?', a: r2(BUDGET.left), tol: 0.01, unit: 'triệu USD',
        fb: fb('4,0 − 0,8 − 1,8 − 0,75 = 0,65.', 'Management fee funds the firm’s operating budget; carry is the upside.', 'Phí phải đủ nuôi đội ngũ, không phải để làm giàu.', 'LP soi kỹ: phí quá cao so với chi phí là dấu hiệu lệch lợi ích.', 'Management company budget', 'Xây dựng đội ngũ') },
      { type: 'sort', id: 'e_team_deleg', concept: 'leadership', q: 'Là Managing Partner, bạn tự làm hay uỷ quyền?', cats: ['Tự làm', 'Uỷ quyền cho đội'],
        items: [['Quan hệ với LP lớn nhất', 0], ['Bản nháp đầu tiên của mô hình LBO', 1], ['Quyết định cuối cùng ở Investment Committee', 0], ['Thiết lập data room', 1], ['Văn hoá & tiêu chuẩn tuyển dụng', 0], ['Sàng lọc thị trường ban đầu', 1]],
        fb: fb('Lãnh đạo giữ những việc chỉ mình làm được: quan hệ then chốt, quyết định cuối, văn hoá.', 'Leaders own key relationships, final decisions and culture; delegate execution.', 'Đòn bẩy của người lãnh đạo là con người.', 'Không uỷ quyền = trần tăng trưởng của quỹ chính là thời gian của bạn.', 'Delegation', 'Xây dựng đội ngũ') },
      { type: 'choice', id: 'e_team_coach', q: 'Bảo An để lọt lỗi trong mô hình gửi LP; LP phát hiện trước buổi họp. Bạn:', grade: true, best: [1], opts: [
        { t: 'Phê bình An trước cả đội để làm gương', out: 'An mất tự tin; cả đội bắt đầu giấu lỗi thay vì báo sớm.', fx: { rel: { an: { trust: -15 } } } },
        { t: 'Nhận trách nhiệm với LP, sau đó cùng An phân tích nguyên nhân và xây quy trình review hai lớp', out: 'LP đánh giá cao cách xử lý. An trưởng thành nhanh và trở thành người đáng tin cậy nhất trong đội.', fx: { rel: { an: { trust: 15, respect: 10 } }, flags: { an_coached: true } } },
        { t: 'Từ giờ tự sửa mọi mô hình của An', out: 'Không còn lỗi — nhưng An không học được gì và bạn kiệt sức.', fx: { stats: { wellbeing: -15 } } },
      ] },
      { type: 'outcome', id: 'e_team_out', eval: (rt, S, sc) => {
        const r = recruits(S.tl);
        const flags = Object.fromEntries(r.map(([, f]) => [f, true]));
        const names = r.map(([id, , why]) => `${NPCS[id].name} (${why})`);
        return { text: r.length ? `Những người nhận lời gia nhập: ${names.join('; ')}. Những mối quan hệ bạn xây dựng từ thời sinh viên giờ trở thành đội ngũ của bạn.` : 'Không ai trong mạng lưới cũ nhận lời — bạn phải tuyển người lạ. Các mối quan hệ chân thành cần được vun đắp từ rất sớm.', fx: { flags: { ...flags, team_size: 2 + r.length } }, score: sc };
      } },
    ],
    rewards: { xp: 60, rep: 2 },
  },
  {
    id: 'e_sim', title: '📊 Vận hành Fund I qua 10 năm', kind: 'endgame', chapter: 'career', giver: 'an', loc: 'firm', req: ['e_fund'],
    summary: 'Mô phỏng toàn bộ vòng đời quỹ: chọn thương vụ năm 1–4, đi qua chu kỳ lãi suất và suy thoái, xử lý covenant, chọn thời điểm thoái vốn. Kết quả là net TVPI/IRR thật của quỹ bạn.',
    steps: [
      { type: 'say', lines: [['an', 'Fund I đã đóng. Giờ là 10 năm vận hành: 4 năm đầu tư, sau đó tạo giá trị và thoái vốn. Phí quản lý được gọi vốn mỗi năm, nên giai đoạn đầu TVPI sẽ dưới 1x — đó là J-curve, không phải thất bại.'], ['ha', '(tư vấn vĩ mô) Tôi sẽ cho em biết dự báo một năm tới. Chu kỳ không ngẫu nhiên: tăng trưởng, rồi lãi suất tăng, rồi suy thoái, rồi phục hồi.'], ['an', 'Lưu ý: tối đa 20% vốn quỹ cho một công ty; phải giữ tiền cho phí các năm sau; công ty vay nhiều mà nhạy chu kỳ có thể vi phạm covenant khi suy thoái.']], terms: ['J-curve', 'NAV', 'Dry Powder'] },
      { type: 'fundsim', id: 'e_sim_run' },
      { type: 'outcome', id: 'e_sim_out', eval: (rt, S) => {
        const r = rt.vars.sim;
        const repBy = { 1: 6, 2: 3, 3: 0, 4: -3 }[r.quartile];
        const verdict = { 1: 'Top quartile — LP xếp hàng chờ Fund II.', 2: 'Trên trung vị — LP hài lòng và phần lớn sẽ tái cam kết.', 3: 'Dưới trung vị — LP yêu cầu giải thích chiến lược trước khi tái cam kết.', 4: 'Bottom quartile — nhiều LP sẽ không quay lại.' }[r.quartile];
        const lessons = [r.writeOffs ? `${r.writeOffs} khoản bị xoá sổ — đòn bẩy cao cộng tính chu kỳ là tổ hợp nguy hiểm.` : 'Không có khoản nào bị xoá sổ — kỷ luật đòn bẩy đã phát huy tác dụng.', `Khoảng cách gross ${nf(r.grossMoic, 2)}x → net ${nf(r.netTvpi, 2)}x là phí (${nf(r.fees, 1)}) và carry (${nf(r.carry, 1)}).`];
        return { text: `Fund I kết thúc: net TVPI ${nf(r.netTvpi, 2)}x, net IRR ${nf(r.netIrr * 100, 1)}%. ${verdict} ${lessons.join(' ')}`, fx: { flags: { fund_tvpi: Math.round(r.netTvpi * 100) / 100, fund_irr: Math.round(r.netIrr * 1000) / 10, fund_quartile: r.quartile, fund_dpi7: r2(r.dpi7 ?? 0), fund_pme: r2(r.pme ?? 0), fund_cum: r.cum || null }, rep: repBy, ach: r.quartile === 1 ? ['top_quartile'] : [] }, score: Math.max(0, Math.min(1, (r.netTvpi - 0.8) / 1.4)) };
      } },
    ],
    rewards: { xp: 90, rep: 2 },
  },
  {
    id: 'e_platform', title: '🧩 Buy-and-build: xây platform ngành', kind: 'endgame', chapter: 'career', giver: null, obj: 'pipeline', loc: 'firm', req: ['e_fund'],
    summary: 'Quản lý deal pipeline toàn cầu, xây platform bằng add-on acquisitions và hiểu đâu là giá trị thật, đâu là multiple arbitrage.',
    steps: [
      { type: 'say', lines: [['an', 'Pipeline có 40 cơ hội, đội mình chỉ đủ sức làm sâu 3. Chiến lược đề xuất: mua một platform rồi gắn các add-on nhỏ hơn.']], terms: ['Buy-and-build', 'Multiple Arbitrage'] },
      { type: 'sort', id: 'e_plat_pipe', concept: 'strategy', q: 'Sàng lọc pipeline:', cats: ['Ưu tiên', 'Theo dõi', 'Loại'],
        items: [['Chuỗi phòng khám vùng — ngành quỹ có lợi thế, người bán muốn đối tác dài hạn', 0], ['Công ty "hot" trên mạng xã hội, giá 25x EBITDA, không có lợi thế cạnh tranh rõ', 2], ['Doanh nghiệp tốt nhưng chủ chưa sẵn sàng bán trong 2 năm', 1], ['Add-on nhỏ cùng ngành ở 6x, tích hợp dễ', 0], ['Công ty có cáo buộc gian lận kế toán chưa được làm rõ', 2], ['Platform tiềm năng ở thị trường mới, cần thêm nghiên cứu', 1]],
        fb: fb('Ưu tiên nơi bạn có lợi thế và giá hợp lý; theo dõi cơ hội chưa chín; loại cơ hội đắt hoặc có rủi ro đạo đức.', 'Pipeline discipline: focus resources where edge and price align.', 'Thời gian của đội là nguồn lực khan hiếm nhất.', 'Nói "không" là kỹ năng quan trọng nhất của nhà đầu tư.', 'Deal sourcing', 'Buy-and-build') },
      { type: 'num', id: 'e_plat_blend', concept: 'lbo', q: 'Platform EBITDA 20 mua ở 10x; hai add-on EBITDA 6 và 4 mua ở 6x. Bội số mua bình quân (x, 2 chữ số thập phân)?', a: r2(BB.blended), tol: 0.01, unit: 'x', fb: fb('(200 + 36 + 24) / 30 = 260 / 30 ≈ 8,67x.', 'Blended multiple = total cost / combined EBITDA.', 'Add-on rẻ kéo bội số bình quân xuống.', 'Đây là cốt lõi của chiến lược roll-up.', 'Buy-and-build', 'Buy-and-build') },
      { type: 'num', id: 'e_plat_arb', concept: 'lbo', q: 'Nếu bán toàn bộ ở 10x EBITDA hợp nhất, giá trị tạo ra chỉ từ multiple arbitrage (triệu USD)?', a: BB.arbitrage, tol: 0.5, unit: 'triệu USD', fb: fb('30 × 10 − 260 = 40.', 'Arbitrage = exit multiple × combined EBITDA − total cost.', 'Chưa tính tăng trưởng hay synergy.', 'Nếu bội số thị trường giảm, phần giá trị này biến mất — đừng xây luận điểm chỉ dựa vào arbitrage.', 'Multiple arbitrage', 'Buy-and-build') },
      { type: 'quiz', id: 'e_plat_risk', concept: 'lbo', q: 'Rủi ro lớn nhất của chiến lược buy-and-build?', opts: ['Không có rủi ro vì add-on rẻ', 'Tích hợp thất bại, trả giá ngày càng cao cho add-on khi cạnh tranh tăng, và đòn bẩy cộng dồn — giá trị phải đến từ vận hành tốt hơn, không chỉ arbitrage', 'Quá ít giấy tờ'], a: 1, fb: fb('Roll-up thất bại thường vì tích hợp kém và trả giá đắt.', 'Roll-up risks: integration, rising add-on prices, stacked leverage.', 'Giá trị thật đến từ vận hành.', 'IC sẽ hỏi: không có arbitrage thì còn lại gì?', 'Roll-up risks', 'Buy-and-build') },
      { type: 'choice', id: 'e_plat_sector', q: 'Chọn ngành cho platform đầu tiên của quỹ:', grade: true, best: [0], opts: [
        { t: 'Ngành chuyên môn chính của bạn (Học viện Ngành) — nơi bạn có mạng lưới, dữ liệu và uy tín', out: 'Người bán chọn quỹ của bạn dù giá không cao nhất: "Các bạn hiểu ngành của chúng tôi."', v: { sector: 'spec' } },
        { t: 'Ngành đang "nóng" nhất, dù bạn chưa có lợi thế', out: 'Bạn phải trả giá cao hơn 3 quỹ lớn khác — lợi nhuận kỳ vọng giảm.', v: { sector: 'hot' } },
        { t: 'Rải 10 khoản nhỏ không liên quan', out: 'Không có synergy, đội ngũ quá tải.', v: { sector: 'scatter' } },
      ] },
      { type: 'outcome', id: 'e_plat_out', eval: (rt, S, sc) => {
        const sp = S.tl.spec?.primary;
        const name = sp && sp !== 'generalist' ? SECTORS[sp].name : null;
        if (rt.vars.sector === 'spec' && name) return { text: `Platform ${name} được xây với 3 add-on trong 2 năm. Credibility ngành giúp bạn mua ở giá hợp lý — giá trị đến từ vận hành, không chỉ arbitrage.`, fx: { rep: 4, flags: { platform: sp } }, score: sc };
        if (rt.vars.sector === 'spec') return { text: 'Bạn chưa chọn chuyên môn ngành, nên lợi thế không rõ ràng. Platform vẫn được xây, nhưng với giá cao hơn dự kiến. (Gợi ý: Học viện Ngành.)', fx: { rep: 1, flags: { platform: 'generalist' } }, score: sc * 0.9 };
        return { text: 'Platform mang lại kết quả trung bình. Bài học: lợi thế ngành là thứ không thể mua bằng tiền.', fx: { flags: { platform: rt.vars.sector } }, score: sc };
      } },
    ],
    rewards: { xp: 70, rep: 2 },
  },
  {
    id: 'e_crisis', title: '⚔️ Khủng hoảng & đề nghị thâu tóm thù địch', kind: 'endgame', chapter: 'career', giver: null, obj: 'boardroom', loc: 'firm', req: ['e_platform'],
    summary: 'Một tập đoàn ra giá thâu tóm thù địch công ty niêm yết trong danh mục, đúng lúc suy thoái. Bảo vệ giá trị cho cổ đông mà không bảo vệ chính mình.',
    steps: [
      { type: 'say', lines: [['nar', 'Suy thoái quay trở lại. Giá cổ phiếu Lotus Healthcare — công ty niêm yết quỹ bạn sở hữu 30% — giảm mạnh. Một tập đoàn bất ngờ chào mua công khai 30.000 đồng/cp, không thông qua hội đồng quản trị.'], ['bo', '(gọi điện) Bố đã bảo vệ nhiều hội đồng trước thâu tóm thù địch. Câu hỏi đầu tiên luôn là: giá trị thật là bao nhiêu? Câu thứ hai: con đang bảo vệ ai?']], terms: ['Hostile Takeover', 'Fiduciary Duty'] },
      { type: 'num', id: 'e_cri_gap', concept: 'governance', q: 'Giá trị nội tại theo DCF là 36.000 đồng/cp. Giá chào mua thấp hơn giá trị nội tại bao nhiêu % (1 chữ số thập phân)?', a: r1(HOSTILE.gap * 100), tol: 0.1, unit: '%', traps: [{ v: 20, why: 'Đó là mức giá trị nội tại cao hơn giá chào (36/30 − 1). Câu hỏi là giá chào thấp hơn giá trị bao nhiêu: 1 − 30/36.' }],
        fb: fb('1 − 30.000 / 36.000 ≈ 16,7%.', 'Opportunistic bids in downturns often undervalue intrinsic worth.', 'So sánh với giá trị độc lập, không với giá thị trường đang hoảng loạn.', 'Cơ sở để đàm phán giá cao hơn hoặc tìm người mua khác.', 'Intrinsic value', 'Khủng hoảng') },
      { type: 'quiz', id: 'e_cri_duty', concept: 'governance', q: 'Nghĩa vụ chính của hội đồng quản trị khi nhận đề nghị thâu tóm?', opts: ['Bảo vệ ghế của ban lãnh đạo hiện tại bằng mọi giá', 'Hành động vì lợi ích của toàn bộ cổ đông: đánh giá nghiêm túc giá trị, tìm phương án tốt nhất — kể cả bán nếu giá đủ tốt', 'Chấp nhận ngay mọi đề nghị cao hơn giá thị trường'], a: 1,
        fb: fb('Biện pháp phòng thủ chỉ chính đáng khi phục vụ cổ đông, không phải để cố thủ ban lãnh đạo.', 'Fiduciary duty runs to shareholders; defenses must not entrench management.', 'Bảo vệ ai?', 'Quy định khác nhau theo quốc gia — luôn có luật sư M&A.', 'Fiduciary duty', 'Khủng hoảng') },
      { type: 'choice', id: 'e_cri_defense', q: 'Chiến lược của bạn (với tư cách cổ đông lớn & thành viên HĐQT):', grade: true, best: [1], opts: [
        { t: 'Kích hoạt mọi biện pháp chặn vĩnh viễn để giữ quyền kiểm soát', out: 'Cổ đông nhỏ kiện HĐQT vì cố thủ. Giá cổ phiếu tiếp tục giảm.', fx: { stats: { ethics: -10 }, rep: -4 } },
        { t: 'Công bố kế hoạch giá trị độc lập, thuê cố vấn tìm người mua khác (white knight) và đàm phán với bên chào mua để nâng giá', out: 'Một tập đoàn y tế quốc tế chào 35.500 đồng/cp với kế hoạch giữ đội ngũ bác sĩ. Cổ đông chấp thuận; quỹ thoái vốn với lợi nhuận tốt.', fx: { rep: 5, rel: { bo: { respect: 10 } }, flags: { crisis_win: true } } },
        { t: 'Bán ngay ở 30.000 vì thị trường đang xấu', out: 'Thoát được, nhưng để lại 16,7% giá trị trên bàn.', fx: { rep: -1 } },
      ] },
      { type: 'choice', id: 'e_cri_lp', q: 'Cùng lúc, một LP lớn gặp khó khăn thanh khoản và hỏi về các đợt gọi vốn sắp tới. Bạn:', grade: true, best: [0], opts: [
        { t: 'Gặp trực tiếp, minh bạch kế hoạch gọi vốn và tình trạng danh mục, cùng tìm giải pháp theo đúng LPA (ví dụ chuyển nhượng phần vốn trên thị trường thứ cấp)', out: 'LP vượt qua khó khăn và trở thành LP trung thành nhất cho Fund II.', fx: { rel: { tung: { trust: 10 } }, rep: 2 } },
        { t: 'Im lặng và gọi vốn như kế hoạch', out: 'LP vỡ nợ cam kết; quan hệ chấm dứt.', fx: { rep: -3 } },
      ] },
    ],
    rewards: { xp: 70, rep: 3 },
  },
  {
    id: 'e_legacy', title: '🌸 Di sản', kind: 'endgame', chapter: 'career', giver: 'bo', loc: 'garden', req: ['e_team', 'e_crisis', 'e_sim'],
    summary: 'Chọn người kế nhiệm, quyết định di sản — và nhìn lại toàn bộ hành trình từ tiệm bánh đầu tiên.',
    steps: [
      { type: 'say', lines: [['me', 'Mẹ nhìn con lãnh đạo quỹ mà nhớ cô bé đếm bánh ở tiệm Cô Hạnh.'], ['hanh', '(ghé thăm) Tiệm bánh vẫn còn đó con ạ. Hai người thợ năm xưa giờ đã có học trò.'], ['bo', 'Một người lãnh đạo được đo bằng những người mình để lại phía sau.']] },
      { type: 'choice', id: 'e_leg_succ', q: 'Chọn hướng kế nhiệm cho vai trò Managing Partner:', grade: true, best: [0], opts: [
        { t: 'Lộ trình 3 năm phát triển Bảo An (và đội ngũ nội bộ) thành lãnh đạo kế cận, kèm hội đồng đầu tư độc lập', out: 'Một kế hoạch kế nhiệm minh bạch giúp LP yên tâm — quỹ không phụ thuộc vào một người.', v: { succ: 'an' } },
        { t: 'Chọn người mang về doanh thu lớn nhất, bất kể cách họ đối xử với đồng nghiệp', out: 'Văn hoá bị xói mòn; hai associate giỏi nhất nghỉ việc.', v: { succ: 'star' } },
        { t: 'Không lên kế hoạch — "khi nào tính sau"', out: 'LP đưa "key person risk" vào đánh giá; Fund II khó gọi vốn hơn.', v: { succ: 'none' } },
      ] },
      { type: 'choice', id: 'e_leg_choice', q: 'Bạn muốn để lại di sản gì?', opts: [
        { t: 'Quỹ học bổng & chương trình giáo dục tài chính cho trẻ em, bắt đầu ngay tại Tiệm Bánh Mây Hồng', out: 'Mỗi mùa hè, những đứa trẻ học về lợi nhuận và lãi kép — bên quầy nước chanh nhỏ màu hồng.', v: { legacy: 'education' } },
        { t: 'Một chương trình mentor cho phụ nữ trong ngành tài chính', out: 'Mười năm sau, nhiều Partner và CIO nói họ bắt đầu từ chương trình của bạn.', v: { legacy: 'mentor' } },
        { t: 'Xây dựng quỹ thành một thể chế bền vững vượt qua thời đại của bạn', out: 'Quỹ trở thành một tổ chức có quy trình, văn hoá và thế hệ lãnh đạo kế tiếp.', v: { legacy: 'institution' } },
      ] },
      { type: 'outcome', id: 'e_leg_out', eval: (rt, S, sc) => {
        const tl = S.tl; const coached = !!tl.flags.an_coached;
        const succ = rt.vars.succ === 'an' ? (coached ? 'Bảo An — người bạn đã huấn luyện từ lần sai sót đầu tiên — sẵn sàng tiếp quản.' : 'Bảo An cần thêm thời gian — bạn chưa đầu tư đủ vào việc huấn luyện, nhưng lộ trình đã rõ ràng.') : rt.vars.succ === 'star' ? 'Người kế nhiệm giỏi kiếm tiền nhưng văn hoá quỹ phải trả giá.' : 'Câu hỏi kế nhiệm vẫn bỏ ngỏ.';
        const hist = [...(tl.career.history || []).map((h) => CAREERS[h.track].name), CAREERS[tl.career.track].name].join(' → ');
        return { text: `Hành trình của ${S.account.playerName}: Tiệm Bánh Mây Hồng → ${hist} → ${S.account.playerName} Capital (Fund I ${tl.flags.fund_size ?? '—'} triệu USD, net TVPI ${tl.flags.fund_tvpi ?? '—'}x, đội ngũ ${tl.flags.team_size ?? 2} người). ${succ} Đạo đức nghề nghiệp: ${tl.stats.ethics ?? 0}. Uy tín: ${tl.stats.rep}. Di sản của bạn đã được ghi lại trên Bức tường di sản.`, fx: { flags: { legacy_done: true, legacy: rt.vars.legacy, successor: rt.vars.succ }, ach: ['capital_architect'], items: ['artifact_legacy', 'outfit_gold'] }, score: sc };
      } },
    ],
    rewards: { xp: 100, rep: 5 },
  },
  {
    id: 'e_fund2', title: '🔁 Fund II — chu kỳ tiếp theo', kind: 'endgame', chapter: 'career', giver: null, obj: 'lp_table', loc: 'firm', req: ['e_legacy'],
    summary: 'Gọi vốn quỹ kế tiếp dựa trên thành tích Fund I — và giữ kỷ luật khi tiền dễ dàng tìm đến.',
    steps: [
      { type: 'say', when: (rt, S) => S.tl.flags.fraud_hidden, lines: [['tung', 'Quỹ hưu trí của chúng tôi sẽ không tái cam kết. Chuyện che giấu gian lận năm ấy — chúng tôi không quên.']] },
      { type: 'say', when: (rt, S) => S.tl.flags.fraud_disclosed, lines: [['tung', 'Chúng tôi tái cam kết. Cách quỹ xử lý vụ gian lận năm ấy là lý do chính.']] },
      { type: 'say', when: (rt, S) => (S.tl.flags.fund_quartile ?? 4) <= 2, lines: [['an', 'Fund I nằm trong nửa trên của ngành. Các LP muốn tái cam kết — và có cả LP mới xếp hàng. Chị muốn Fund II lớn cỡ nào?']] },
      { type: 'say', when: (rt, S) => (S.tl.flags.fund_quartile ?? 4) > 2, lines: [['an', 'Kết quả Fund I chưa như kỳ vọng. Một số LP muốn nghe bài học của chị trước khi tái cam kết — nhưng những LP tin vào quy trình vẫn ở lại.']] },
      { type: 'num', id: 'e_f2_size', concept: 'fund_economics', q: 'Thông lệ thị trường: quỹ kế tiếp thường lớn hơn 1,5–2 lần quỹ trước nếu thành tích tốt. Với Fund I 200 triệu USD và hệ số 1,75, quy mô Fund II (triệu USD)?', a: 350, tol: 0, unit: 'triệu USD', fb: fb('200 × 1,75 = 350.', 'Successor funds typically scale 1.5–2x on strong performance.', 'Nhân hệ số.', 'Tăng quá nhanh có thể buộc quỹ đổi chiến lược (style drift).', 'Fund sizing', 'Fund II') },
      { type: 'choice', id: 'e_f2_disc', q: 'LP sẵn sàng cam kết tới 700 triệu USD. Bạn quyết định:', grade: true, best: [0], opts: [
        { t: 'Giữ khoảng 350 triệu — phù hợp với chiến lược mid-market và năng lực đội ngũ', out: 'Quỹ giữ được lợi thế ở phân khúc mình giỏi; LP đánh giá cao kỷ luật.', fx: { rep: 4, flags: { fund2_size: 350 } } },
        { t: 'Nhận 700 triệu — phí quản lý gấp đôi', out: 'Phí quản lý gấp đôi — nhưng để triển khai 700 triệu, quỹ sẽ phải làm thương vụ lớn hơn, nơi cạnh tranh với các quỹ toàn cầu.', fx: { rep: -2, flags: { fund2_size: 700 } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, ach: ['fund_two'] },
  },
  {
    id: 'e_sim2', title: '📊 Vận hành Fund II: bùng nổ & khủng hoảng tín dụng', kind: 'endgame', chapter: 'career', giver: 'an', loc: 'firm', req: ['e_fund2'],
    summary: 'Chu kỳ mới, quỹ lớn hơn. Thị trường bùng nổ định giá rồi khủng hoảng tín dụng. Bạn có giữ được kỷ luật khi giá đắt, và có dám mua khi người khác hoảng sợ?',
    steps: [
      { type: 'say', lines: [['an', 'Fund II đã đóng. Lần này giai đoạn đầu tư kéo dài 5 năm, và thị trường có vẻ rất khác Fund I.'], ['ha', 'Sau giai đoạn phục hồi, tôi thấy dấu hiệu bong bóng định giá: tiền rẻ, ai cũng sợ bỏ lỡ. Bong bóng thường kết thúc bằng khủng hoảng tín dụng.'], ['tung', '(LP) Chúng tôi sẽ theo dõi xem Fund II có trôi khỏi chiến lược mid-market không. Quỹ lớn hơn không có nghĩa là thương vụ phải lớn hơn.']], terms: ['Style Drift', 'Vintage Year', 'Denominator Effect', 'Continuation Vehicle'] },
      { type: 'say', when: (rt, S) => S.tl.flags.fund2_size === 700, lines: [['an', 'Quỹ 700 triệu thu phí trên toàn bộ cam kết. Nếu chỉ triển khai được vài trăm triệu vào mid-market, phí sẽ ăn mòn lợi nhuận. Chị sẽ cân nhắc large-cap chứ?']] },
      { type: 'fundsim', id: 'e_sim2_run', scenario: 'fund2' },
      { type: 'outcome', id: 'e_sim2_out', eval: (rt, S) => {
        const r = rt.vars.sim, tl = S.tl;
        const repBy = { 1: 6, 2: 3, 3: 0, 4: -4 }[r.quartile];
        const f1 = tl.flags.fund_tvpi;
        const cmp = f1 != null ? (r.netTvpi >= f1 ? `Fund II (${nf(r.netTvpi, 2)}x) bằng hoặc tốt hơn Fund I (${nf(f1, 2)}x) — một thành tích bền vững qua hai chu kỳ.` : `Fund II (${nf(r.netTvpi, 2)}x) thấp hơn Fund I (${nf(f1, 2)}x).`) : '';
        const notes = [];
        if (r.committed >= 700) notes.push(`Quỹ 700 triệu chỉ triển khai ${Math.round(r.deployed * 100)}% vốn cam kết — phí trên vốn chưa dùng là lực cản lớn.`);
        if (r.largeCaps > 0) notes.push(`${r.largeCaps} thương vụ large-cap — rời khỏi lợi thế mid-market (style drift).`);
        if (r.writeOffs) notes.push(`${r.writeOffs} khoản bị xoá sổ trong khủng hoảng tín dụng — đòn bẩy cao mua ở đỉnh chu kỳ.`);
        if (!notes.length) notes.push('Bạn giữ kỷ luật chiến lược và đòn bẩy qua cả bong bóng lẫn khủng hoảng.');
        const ev = r.events || [], evAvg = ev.length ? ev.reduce((s, e) => s + e.score, 0) / ev.length : null;
        for (const e of ev) notes.push(`${e.title}: ${e.out}`);
        const cvAbuse = ev.some((e) => e.id === 'continuation' && e.score === 0);
        const both = r.quartile === 1 && tl.flags.fund_quartile === 1;
        const ach = [...(both ? ['two_cycles'] : []), ...(ev.length >= 2 && ev.every((e) => e.score === 1) ? ['storm_gp'] : [])];
        const perf = Math.max(0, Math.min(1, (r.netTvpi - 0.8) / 1.4));
        const fx = { flags: { fund2_tvpi: Math.round(r.netTvpi * 100) / 100, fund2_irr: Math.round(r.netIrr * 1000) / 10, fund2_quartile: r.quartile, fund2_dpi7: r2(r.dpi7 ?? 0), fund2_pme: r2(r.pme ?? 0), fund2_cum: r.cum || null, fund2_crisis: evAvg == null ? null : Math.round(evAvg * 100) / 100 }, rep: repBy + (evAvg == null ? 0 : Math.round((evAvg - 0.5) * 6)), ach };
        if (evAvg != null) fx.rel = { tung: { trust: Math.round((evAvg - 0.5) * 20) } };
        if (cvAbuse) fx.stats = { ethics: -15 };
        return { text: [`Fund II kết thúc: net TVPI ${nf(r.netTvpi, 2)}x, net IRR ${nf(r.netIrr * 100, 1)}% (Q${r.quartile}).`, cmp, ...notes].filter(Boolean).join(' '), fx, score: evAvg == null ? perf : 0.7 * perf + 0.3 * evAvg };
      } },
    ],
    rewards: { xp: 90, rep: 2 },
  },
  {
    id: 'e_fund3', title: '🔂 Fund III — lãi suất cao kéo dài', kind: 'endgame', chapter: 'career', giver: null, obj: 'lp_table', loc: 'firm', req: ['e_sim2'],
    summary: 'Gọi vốn quỹ thứ ba khi tiền không còn rẻ: LP hỏi bạn tạo giá trị bằng cách nào khi bội số không còn tăng.',
    steps: [
      { type: 'say', lines: [['an', 'Lãi suất được dự báo ở mức cao nhiều năm. LP nói thẳng: "Lợi nhuận hai thập kỷ qua đến nhiều từ đòn bẩy rẻ và bội số tăng. Lần này quỹ sẽ tạo giá trị bằng gì?"'], ['ha', 'Kịch bản cơ sở của tôi: hai năm lãi suất cao, rồi lạm phát đình trệ, sau đó mới phục hồi. Song song, AI tạo sinh sẽ thay đổi một số ngành dịch vụ.']], terms: ['Operating Partner', 'Refinancing Wall', 'NAV Loan'] },
      { type: 'say', when: (rt, S) => (S.tl.flags.fund2_quartile ?? 4) >= 4 || S.tl.flags.fraud_hidden, lines: [['tung', 'Chúng tôi cần thấy thay đổi thật trong quy trình trước khi tái cam kết. Quy mô quỹ sẽ phải khiêm tốn hơn.']] },
      { type: 'say', when: (rt, S) => (S.tl.flags.fund2_crisis ?? 0) >= 0.9, lines: [['tung', 'Cách quỹ đối xử với LP trong khủng hoảng Fund II là lý do chúng tôi quay lại — và giới thiệu thêm hai quỹ hưu trí.']] },
      { type: 'num', id: 'e_f3_pool', concept: 'fund_economics', q: '[Simulation Assumption] LP xem thành tích gộp: Fund I 200 triệu USD đạt 2,0x; Fund II 350 triệu USD đạt 1,8x. Net TVPI gộp theo vốn (x, 2 chữ số)?', a: r2((200 * 2.0 + 350 * 1.8) / 550), tol: 0.01, unit: 'x', traps: [{ v: 1.9, why: 'Đó là trung bình đơn giản. Thành tích gộp phải theo trọng số vốn: (400 + 630) / 550 ≈ 1,87x.' }], fb: fb('(200 × 2,0 + 350 × 1,8) / 550 ≈ 1,87x.', 'Pooled track record is capital-weighted, not a simple average.', 'Quỹ lớn hơn có trọng số lớn hơn.', 'LP nhìn cả thành tích gộp lẫn xu hướng giữa các quỹ.', 'Track record', 'Fund III') },
      { type: 'num', id: 'e_f3_pme', concept: 'fund_economics', q: '[Simulation Assumption] Một LP góp 100 khi chỉ số niêm yết ở 100 và nhận về 250 khi chỉ số ở 200. KS-PME (2 chữ số)?', a: 1.25, tol: 0.01, unit: '', traps: [{ v: 2.5, why: 'Đó là TVPI. PME đưa mỗi dòng tiền về cùng thời điểm theo chỉ số: 250 ÷ (100 × 200/100) = 1,25.' }], fb: fb('Khoản góp 100 "lẽ ra" tăng thành 200 nếu đầu tư vào chỉ số; quỹ trả 250 → 250 / 200 = 1,25.', 'KS-PME = Σ distributions × I_T/I_t ÷ Σ contributions × I_T/I_t.', 'So với cơ hội thay thế cùng thời điểm.', 'PME > 1: quỹ thắng thị trường niêm yết; loại bỏ may mắn của vintage.', 'Public market equivalent', 'Fund III'), terms: ['PME', 'DPI'] },
      { type: 'num', id: 'e_f3_vcp', concept: 'fund_economics', q: '[Simulation Assumption] Kế hoạch tạo giá trị chi 3,6 triệu USD cho công ty EBITDA 8 triệu, tăng trưởng thêm 5%/năm trong 3 năm, định giá 10x. Giá trị doanh nghiệp tăng thêm (triệu USD, 1 chữ số)?', a: r1(8 * (1.05 ** 3 - 1) * 10), tol: 0.2, unit: 'triệu USD', fb: fb('8 × (1,05³ − 1) × 10 ≈ 12,6 — gấp 3,5 lần chi phí.', 'Operational EBITDA growth is multiplied by the exit multiple.', 'Lãi kép rồi nhân bội số.', 'Khi bội số không tăng, đây là nguồn tạo giá trị chính.', 'Value creation', 'Fund III') },
      { type: 'choice', id: 'e_f3_size', q: 'LP sẵn sàng cam kết tới 1 tỷ USD. Quy mô Fund III:', grade: true, best: [0], opts: [
        { t: 'Khoảng 500 triệu — đủ cho chiến lược mid-market và năng lực triển khai', out: 'LP ghi nhận kỷ luật quy mô lần thứ hai.', fx: { rep: 3, flags: { fund3_size: 500 } } },
        { t: '1 tỷ USD — trở thành "quỹ lớn"', out: 'Phí quản lý gấp đôi, nhưng tìm đủ thương vụ mid-market chất lượng cho 1 tỷ là thách thức.', fx: { rep: -1, flags: { fund3_size: 1000 } } },
      ] },
      { type: 'choice', id: 'e_f3_ops', q: 'Đầu tư vào năng lực tạo giá trị:', grade: true, best: [0], opts: [
        { t: 'Tuyển đội Operating Partners (giá, mua hàng, số hoá, nhân sự) — dùng một phần phí quản lý', out: 'Chi phí triển khai kế hoạch tạo giá trị giảm từ 45% xuống 30% EBITDA mỗi công ty.', fx: { flags: { op_team: true }, rel: { an: { respect: 5 } } } },
        { t: 'Giữ đội nhỏ, thuê tư vấn khi cần', out: 'Tiết kiệm chi phí cố định, nhưng mỗi kế hoạch tạo giá trị đắt hơn.', fx: { flags: { op_team: false } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, ach: ['fund_three'] },
  },
  {
    id: 'e_sim3', title: '📊 Vận hành Fund III: lãi suất cao, lạm phát đình trệ & AI', kind: 'endgame', chapter: 'career', giver: 'an', loc: 'firm', req: ['e_fund3'],
    summary: 'Không còn bội số tăng hay nợ rẻ. Lợi nhuận phải đến từ tăng trưởng EBITDA thật — kế hoạch tạo giá trị, chuyển đổi AI và cấu trúc vốn an toàn.',
    steps: [
      { type: 'say', lines: [['an', 'Fund III đã đóng. Mới: mỗi công ty trong danh mục có thể triển khai một kế hoạch tạo giá trị (chi phí một lần, tăng trưởng +5%/năm trong 3 năm).'], ['minhanh', 'Em sẽ đánh dấu công ty có mô hình dễ bị AI thay thế ⚠ và công ty hưởng lợi từ AI 🤖. Rủi ro AI bắt đầu tác động từ năm 4.'], ['ha', 'Lưu ý năm 3: nhiều khoản vay ký thời lãi suất thấp sẽ đáo hạn.']], terms: ['Value Creation Plan'] },
      { type: 'fundsim', id: 'e_sim3_run', scenario: 'fund3' },
      { type: 'outcome', id: 'e_sim3_out', eval: (rt, S) => {
        const r = rt.vars.sim, tl = S.tl;
        const repBy = { 1: 6, 2: 3, 3: 0, 4: -4 }[r.quartile];
        const notes = [];
        const f1 = tl.flags.fund_tvpi, f2 = tl.flags.fund2_tvpi;
        if (f1 != null && f2 != null) notes.push(`Ba quỹ: ${nf(f1, 2)}x → ${nf(f2, 2)}x → ${nf(r.netTvpi, 2)}x.`);
        notes.push(r.vcps ? `${r.vcps} kế hoạch tạo giá trị — nguồn lợi nhuận chính khi bội số không tăng.` : 'Không triển khai kế hoạch tạo giá trị nào — trong môi trường bội số đi ngang, lợi nhuận phụ thuộc hoàn toàn vào tăng trưởng tự nhiên.');
        if (r.committed >= 1000) notes.push(`Quỹ 1 tỷ USD chỉ triển khai ${Math.round(r.deployed * 100)}% vốn — phí trên vốn chưa dùng lặp lại bài học Fund II.`);
        if (r.navLoan > 0) notes.push(`NAV loan ${nf(r.navLoan, 1)} triệu USD cộng lãi 15%/năm được trả trước LP.`);
        const ev = r.events || [], evAvg = ev.length ? ev.reduce((s, e) => s + e.score, 0) / ev.length : null;
        for (const e of ev) notes.push(`${e.title}: ${e.out}`);
        const three = r.quartile === 1 && tl.flags.fund_quartile === 1 && tl.flags.fund2_quartile === 1;
        const ach = [...(three ? ['three_cycles'] : []), ...(r.vcps >= 4 && r.grossMoic >= 2 ? ['value_creator'] : [])];
        const perf = Math.max(0, Math.min(1, (r.netTvpi - 0.8) / 1.4));
        const fx = { flags: { fund3_tvpi: Math.round(r.netTvpi * 100) / 100, fund3_irr: Math.round(r.netIrr * 1000) / 10, fund3_quartile: r.quartile, fund3_dpi7: r2(r.dpi7 ?? 0), fund3_pme: r2(r.pme ?? 0), fund3_cum: r.cum || null, fund3_vcps: r.vcps }, rep: repBy + (evAvg == null ? 0 : Math.round((evAvg - 0.5) * 4)), ach };
        if (r.navLoan > 0) fx.rel = { tung: { trust: -5 } };
        return { text: [`Fund III kết thúc: net TVPI ${nf(r.netTvpi, 2)}x, net IRR ${nf(r.netIrr * 100, 1)}% (Q${r.quartile}).`, ...notes].join(' '), fx, score: evAvg == null ? perf : 0.75 * perf + 0.25 * evAvg };
      } },
    ],
    rewards: { xp: 100, rep: 2 },
  },
];

// Cross-career mobility: realistic switch paths with transferability analysis, a technical interview aimed at the gap,
// a behavioural interview, a professional resignation, and an offer trade-off. One switch per timeline.
// Failing or declining does NOT complete the quest (retry) — nothing is granted.
import * as F from '../engine/finance.js';
import { CAREERS } from './careers.js';

const r1 = (x) => Math.round(x * 10) / 10;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

// ---------- technical interview bank (answers computed) ----------
const LBO_T = { equity: 1000 - 600, exitEq: 150 * 10 - 300 };
LBO_T.moic = LBO_T.exitEq / LBO_T.equity;                                 // 3.0x
LBO_T.irr = F.irr([-LBO_T.equity, 0, 0, 0, 0, LBO_T.exitEq]);             // 24.6%
const PMI_T = { payback: 45 / 30 };                                       // 1.5 yrs
const VAL_T = { equity: 900 - 250 + 70 - 20 };                            // 700
const PORT_T = { sharpe: (0.09 - 0.03) / 0.12 };                          // 0.5
const VEN_T = { pct: 6 / (18 + 6) };                                      // 25%
export const TRANSITION_ANSWERS = { LBO_T, PMI_T, VAL_T, PORT_T, VEN_T };

const BANK = {
  lbo: (p) => [
    { type: 'num', id: p + '_t1', concept: 'lbo', q: 'Paper LBO: mua công ty EBITDA 100 ở 10x, vay 600. Sau 5 năm EBITDA 150, exit 10x, nợ còn 300. MOIC (x)?', a: LBO_T.moic, tol: 0.01, unit: 'x', traps: [{ v: 1.5, why: 'Đó là tăng trưởng EV (1.500/1.000). Phải tính trên vốn chủ: (1.500 − 300) / (1.000 − 600).' }],
      fb: fb('Vốn chủ vào 400; vốn chủ ra 1.500 − 300 = 1.200; MOIC 3,0x.', 'MOIC = exit equity / entry equity.', 'Bridge EV → equity ở cả hai đầu.', 'Ba nguồn: tăng EBITDA, trả nợ, (không có) mở rộng bội số.', 'LBO paper test', 'Chuyển ngành') },
    { type: 'num', id: p + '_t2', concept: 'irr_moic', q: 'IRR tương ứng sau 5 năm (%, 1 chữ số thập phân, ±0,2)?', a: r1(LBO_T.irr * 100), tol: 0.2, unit: '%', fb: fb('3,0^(1/5) − 1 ≈ 24,6%.', 'IRR = MOIC^(1/n) − 1 with no interim cash flows.', 'Mẹo nhẩm: 2x trong 5 năm ≈ 15%; 3x ≈ 25%.', 'Người phỏng vấn PE mong bạn nhẩm được.', 'IRR', 'Chuyển ngành') },
  ],
  pmi: (p) => [
    { type: 'num', id: p + '_t1', concept: 'synergy', q: 'Synergy chi phí 30 tỷ/năm khi chạy đủ, chi phí tích hợp một lần 45 tỷ. Thời gian hoàn vốn (năm)?', a: PMI_T.payback, tol: 0.01, unit: 'năm', fb: fb('45 / 30 = 1,5 năm.', 'Payback = one-off integration cost / run-rate synergies.', 'Đơn giản hoá: bỏ qua thời gian ramp-up.', 'Thực tế synergy cần 12–24 tháng để đạt run-rate.', 'Integration costs', 'Chuyển ngành') },
    { type: 'quiz', id: p + '_t2', concept: 'synergy', q: 'Ưu tiên số 1 trong 100 ngày đầu sau sáp nhập?', opts: ['Đổi logo ngay', 'Giữ chân nhân sự & khách hàng chủ chốt, ổn định vận hành, giao tiếp rõ ràng — trước khi cắt giảm', 'Cắt 30% nhân sự ngay tuần đầu'], a: 1, fb: fb('Giá trị bị phá huỷ nhanh nhất khi người giỏi và khách hàng ra đi.', 'First 100 days: retain talent and customers, stabilise, communicate.', 'Rủi ro con người.', 'Corp Dev được đánh giá bằng kết quả tích hợp.', 'PMI', 'Chuyển ngành') },
  ],
  valuation: (p) => [
    { type: 'num', id: p + '_t1', concept: 'ev_equity', q: 'EV 900; nợ vay 250; tiền mặt 70; lợi ích cổ đông thiểu số 20. Equity Value?', a: VAL_T.equity, tol: 0.5, unit: 'tỷ đồng', traps: [{ v: 720, why: 'Bạn quên trừ lợi ích cổ đông thiểu số (minority interest) — phần đó không thuộc cổ đông công ty mẹ.' }],
      fb: fb('900 − 250 + 70 − 20 = 700.', 'Equity = EV − debt + cash − minority interest (− preferred, etc.).', 'Bridge đầy đủ.', 'Tư vấn chiến lược thường bỏ qua chi tiết này — Corp Dev thì không thể.', 'EV bridge', 'Chuyển ngành') },
    { type: 'quiz', id: p + '_t2', concept: 'ev_equity', q: 'Vì sao trừ minority interest khi đi từ EV xuống Equity Value?', opts: ['Vì đó là chi phí', 'Vì EV (dựa trên 100% EBITDA hợp nhất) bao gồm cả phần công ty con thuộc cổ đông thiểu số — phần đó không thuộc cổ đông công ty mẹ', 'Không cần trừ'], a: 1, fb: fb('Nhất quán giữa tử số và mẫu số.', 'Consolidated EBITDA includes minority-owned share, so EV must deduct it for parent equity.', 'Nhất quán.', 'Sai sót phổ biến khi định giá tập đoàn.', 'Consolidation', 'Chuyển ngành') },
  ],
  portfolio: (p) => [
    { type: 'num', id: p + '_t1', concept: 'portfolio', q: 'Danh mục lợi nhuận 9%, lãi suất phi rủi ro 3%, biến động 12%. Sharpe ratio?', a: PORT_T.sharpe, tol: 0.01, unit: '', fb: fb('(9% − 3%) / 12% = 0,5.', 'Sharpe = excess return / volatility.', 'Lợi nhuận vượt trên mỗi đơn vị rủi ro.', 'So sánh các danh mục có mức rủi ro khác nhau.', 'Risk-adjusted return', 'Chuyển ngành') },
    { type: 'quiz', id: p + '_t2', concept: 'portfolio', q: 'Bạn giỏi định giá từng công ty. Khoảng trống lớn nhất khi chuyển sang quản lý danh mục?', opts: ['Không có', 'Định cỡ vị thế, tương quan giữa các khoản đầu tư và giới hạn rủi ro của toàn danh mục — một ý tưởng hay vẫn có thể là vị thế quá lớn', 'Đọc báo cáo tài chính'], a: 1, fb: fb('PM chịu trách nhiệm cho rủi ro tổng thể, không chỉ từng ý tưởng.', 'Portfolio management adds sizing, correlation and risk budgeting.', 'Tư duy danh mục.', 'Đây là trade-off khi rời Corp Dev.', 'Position sizing', 'Chuyển ngành') },
  ],
  venture: (p) => [
    { type: 'num', id: p + '_t1', concept: 'cap_table', q: 'Pre-money 18 triệu USD, quỹ đầu tư 6 triệu. Tỷ lệ sở hữu của quỹ (%)?', a: Math.round(VEN_T.pct * 100), tol: 0.5, unit: '%', traps: [{ v: 33, why: 'Bạn chia cho pre-money. Sở hữu = vốn đầu tư / post-money (18 + 6 = 24).' }], fb: fb('6 / 24 = 25%.', 'Ownership = investment / post-money.', 'Post = pre + new money.', 'Cơ bản nhưng là câu hỏi đầu tiên trong phỏng vấn VC.', 'Post-money', 'Chuyển ngành') },
    { type: 'quiz', id: p + '_t2', concept: 'power_law', q: 'Khác biệt tư duy lớn nhất giữa PE và VC?', opts: ['VC dùng nhiều nợ hơn', 'PE tối ưu để tránh thua lỗ trên từng khoản; VC chấp nhận nhiều khoản thất bại để tìm vài khoản thắng lớn (power law)', 'Không khác biệt'], a: 1, fb: fb('Phân phối lợi nhuận VC rất lệch.', 'PE underwrites downside per deal; VC underwrites outlier upside across a portfolio.', 'Power law.', 'Thói quen "bảo vệ downside" của PE có thể khiến bạn bỏ lỡ outlier.', 'Power law', 'Chuyển ngành') },
  ],
};

// ---------- switch paths ----------
export const PATHS = [
  { from: 'ib', to: 'pe', topic: 'lbo', penalty: 1, strengths: ['Mô hình tài chính & định giá', 'Tốc độ thực thi dưới áp lực', 'Hiểu quy trình M&A từ phía bán'], gaps: ['Tư duy principal — tự chịu trách nhiệm cho khoản đầu tư', 'Cấu trúc nợ & LBO', 'Quản lý danh mục sau mua'], why: 'Em muốn chuyển từ tư vấn thương vụ sang trực tiếp sở hữu kết quả đầu tư và tạo giá trị sau khi mua — em đã tự học LBO và theo dõi các thương vụ của quỹ.' },
  { from: 'ib', to: 'cd', topic: 'pmi', penalty: 0, strengths: ['Định giá & quy trình M&A', 'Đàm phán & làm việc với cố vấn', 'Mạng lưới bên mua/bán'], gaps: ['Tích hợp sau sáp nhập (PMI)', 'Chiến lược dài hạn của một doanh nghiệp', 'Làm việc với các bộ phận vận hành'], why: 'Em muốn ở lại với thương vụ sau ngày ký — thấy được synergy có thật hay không, và xây dựng chiến lược dài hạn cho một tập đoàn.' },
  { from: 'cs', to: 'cd', topic: 'valuation', penalty: 0, strengths: ['Commercial due diligence', 'Tư duy chiến lược & cấu trúc vấn đề', 'Quản lý stakeholder cấp cao'], gaps: ['Định giá & transaction financing', 'Cấu trúc thương vụ, SPA', 'Chịu trách nhiệm triển khai (không chỉ khuyến nghị)'], why: 'Sau nhiều dự án chiến lược, em muốn tự triển khai và chịu trách nhiệm cho kết quả, thay vì chỉ đưa ra khuyến nghị.' },
  { from: 'cs', to: 'pe', topic: 'lbo', penalty: 1, strengths: ['Commercial due diligence', 'Phân tích value creation', 'Làm việc với ban lãnh đạo'], gaps: ['LBO & cấu trúc nợ', 'Định giá & đàm phán giá', 'Tư duy principal'], why: 'Em đã làm CDD cho các quỹ PE và muốn ngồi ở phía ra quyết định đầu tư, dùng kinh nghiệm vận hành để tạo giá trị.' },
  { from: 'cd', to: 'pe', topic: 'lbo', penalty: 1, strengths: ['Tích hợp & synergy thực tế', 'Hiểu vận hành doanh nghiệp', 'Quy trình M&A từ phía mua'], gaps: ['LBO & đòn bẩy', 'Quan hệ với LP', 'Tốc độ ra quyết định của quỹ'], why: 'Em muốn đưa kinh nghiệm tích hợp và vận hành vào portfolio operations của quỹ, nơi value creation quyết định lợi nhuận.' },
  { from: 'cd', to: 'im', topic: 'portfolio', penalty: 1, strengths: ['Đọc báo cáo tài chính & định giá', 'Hiểu chiến lược doanh nghiệp từ bên trong', 'Đánh giá ban lãnh đạo'], gaps: ['Xây dựng danh mục & định cỡ vị thế', 'Quản trị rủi ro', 'Đo lường hiệu quả so với benchmark'], why: 'Em hiểu doanh nghiệp từ bên trong và muốn áp dụng điều đó cho việc phân bổ vốn trên nhiều công ty niêm yết.' },
  { from: 'vc', to: 'pe', topic: 'lbo', penalty: 1, strengths: ['Đánh giá founder & thị trường mới', 'Mạng lưới công nghệ', 'Đàm phán term sheet'], gaps: ['LBO & doanh nghiệp trưởng thành', 'Phân tích downside từng khoản', 'Vận hành & cắt giảm chi phí'], why: 'Em muốn áp dụng hiểu biết công nghệ vào các doanh nghiệp đã có dòng tiền, nơi có thể tạo giá trị bằng vận hành và cấu trúc vốn.' },
  { from: 'pe', to: 'vc', topic: 'venture', penalty: 0, strengths: ['Kỷ luật định giá', 'Due diligence', 'Làm việc với hội đồng quản trị'], gaps: ['Đánh giá startup chưa có lợi nhuận', 'Tư duy power law', 'Hỗ trợ founder thay vì kiểm soát'], why: 'Em muốn đầu tư sớm hơn vào các công ty công nghệ, chấp nhận tính bất định cao hơn để tìm những công ty có thể thay đổi ngành.' },
];

const headhunterFor = (p) => `Một vị trí ${CAREERS[p.to].name} đang mở. Người làm ${CAREERS[p.from].name} thường mạnh ở: ${p.strengths[0]}. Nhưng họ sẽ kiểm tra kỹ: ${p.gaps[1]}.`;

function pathQuest(p) {
  const id = `x_${p.from}_${p.to}`;
  const oldMentor = CAREERS[p.from].mentor;
  const items = [];
  p.strengths.forEach((s, i) => { items.push([s, 0]); if (p.gaps[i]) items.push([p.gaps[i], 1]); });
  return {
    id, title: `Chuyển ngành: ${CAREERS[p.from].name} → ${CAREERS[p.to].name}`, kind: 'transition', chapter: 'career', giver: 'ngan', loc: 'district', age: 24, path: p,
    cond: (tl) => tl.career?.track === p.from && tl.status === 'complete' && !tl.flags.switched && !tl.flags.endgame,
    summary: `Phân tích kỹ năng chuyển đổi, phỏng vấn kỹ thuật về ${p.gaps[1]}, nghỉ việc chuyên nghiệp và cân nhắc đánh đổi về cấp bậc.`,
    steps: [
      { type: 'say', lines: [['ngan', `Chào em, chị là Ngân — headhunter. ${headhunterFor(p)}`], ['ngan', 'Chuyển ngành luôn có đánh đổi: thường là cấp bậc, đôi khi là thu nhập trong ngắn hạn. Đổi lại là một con đường dài hạn khác.']], terms: ['Transferable Skills'] },
      { type: 'sort', id: id + '_skills', concept: 'career_mobility', q: 'Phân loại: đâu là kỹ năng mang theo được, đâu là khoảng trống cần bù?', cats: ['Kỹ năng chuyển đổi được', 'Khoảng trống cần bù'], items,
        fb: fb('Biết rõ điểm mạnh và khoảng trống giúp bạn kể câu chuyện chuyển ngành thuyết phục và chuẩn bị đúng chỗ.', 'Map transferable strengths and gaps before interviewing.', 'Nhà tuyển dụng sẽ tấn công đúng vào khoảng trống.', 'Chuẩn bị kỹ thuật cho khoảng trống quan trọng hơn kể lại thành tích cũ.', 'Career mobility', 'Chuyển ngành') },
      ...BANK[p.topic](id),
      { type: 'quiz', id: id + '_why', concept: 'career_mobility', q: `Phỏng vấn hành vi: "Vì sao em muốn rời ${CAREERS[p.from].name}?"`, opts: ['"Vì lương bên này cao hơn."', `"${p.why}"`, '"Vì sếp cũ quá khó tính."'], a: 1,
        fb: fb('Câu trả lời tốt hướng tới (mục tiêu mới), cụ thể và cho thấy đã chuẩn bị — không chê nơi cũ.', 'Frame the move as pull toward the new role, specific and prepared — never badmouth.', 'Động lực "kéo" thuyết phục hơn "đẩy".', 'Nhà tuyển dụng đánh giá rủi ro bạn sẽ rời đi tiếp.', 'Behavioural interview', 'Chuyển ngành') },
      { type: 'choice', id: id + '_resign', q: `Nhận được lời mời sơ bộ. Bạn nghỉ việc ở ${CAREERS[p.from].name} thế nào?`, grade: true, best: [0], opts: [
        { t: 'Báo trước theo hợp đồng, bàn giao đầy đủ, gặp riêng mentor để cảm ơn và giữ liên lạc', out: 'Mentor cũ chúc bạn thành công: "Cửa ở đây luôn mở." Một mối quan hệ có thể trở thành đối tác hay khách hàng trong tương lai.', fx: { rel: { [oldMentor]: { trust: 5, respect: 5 } } } },
        { t: 'Nghỉ ngay sau khi nhận thưởng, không bàn giao', out: 'Đội cũ phải gánh việc dở dang. Tin đồn lan nhanh trong một ngành nhỏ.', fx: { rel: { [oldMentor]: { trust: -20 } }, rep: -3 } },
      ] },
      { type: 'choice', id: id + '_offer', q: `Offer chính thức: vào ${CAREERS[p.to].name} ở cấp tương đương${p.penalty ? ' nhưng THẤP HƠN một bậc' : ''}. Uy tín tích luỹ chỉ chuyển được một phần sang ngành mới. Bạn:`, opts: [
        { t: 'Chấp nhận — đầu tư dài hạn vào con đường mới', out: 'Bạn ký offer.', v: { accept: 'yes' } },
        { t: 'Đòi giữ nguyên cấp bậc', out: 'Nhà tuyển dụng sẽ quyết định dựa trên kết quả phỏng vấn của bạn.', v: { accept: 'push' } },
        { t: 'Từ chối — ở lại nghề hiện tại', out: 'Bạn cảm ơn và từ chối. Cánh cửa vẫn có thể mở lại sau.', v: { accept: 'no' } },
      ] },
      { type: 'outcome', id: id + '_out', eval: (rt, S, sc) => {
        const a = rt.vars.accept;
        if (a === 'no') return { text: 'Bạn ở lại ngành hiện tại. Không có gì thay đổi — bạn có thể quay lại gặp chị Ngân bất cứ lúc nào.', retry: true, score: sc };
        if (sc < 0.6) return { text: `Phỏng vấn chưa đạt (${Math.round(sc * 100)}%). Chị Ngân: "Em cần chuẩn bị kỹ hơn về ${p.gaps[1]}. Ôn lại rồi quay lại nhé."`, retry: true, score: sc };
        if (a === 'push' && sc < 0.95) return { text: 'Nhà tuyển dụng rút lại offer: "Ứng viên giỏi, nhưng chưa đủ để vào ở cấp cao hơn khi chưa có kinh nghiệm ngành." Bạn có thể thử lại.', retry: true, score: sc };
        const penalty = a === 'push' ? 0 : p.penalty;
        return { text: `Chúc mừng! Bạn chính thức chuyển sang ${CAREERS[p.to].name}${a === 'push' ? ' và giữ được cấp bậc nhờ phỏng vấn xuất sắc' : ''}. Kỹ năng và quan hệ đi cùng bạn; giờ hãy chứng minh mình ở chuỗi nhiệm vụ của nghề mới.`, fx: { switchCareer: { to: p.to, penalty }, ach: ['career_switch'] }, score: sc };
      } },
    ],
    rewards: { xp: 50 },
  };
}

export const TRANSITION_QUESTS = [
  ...PATHS.map(pathQuest),
  {
    id: 'k_review2', title: 'Đánh giá sau chuyển ngành', kind: 'career', chapter: 'career', giver: '@mentor', loc: '@office', age: 25, reqCareerMission: true,
    cond: (tl) => !!tl.flags.switched,
    summary: 'Một năm ở nghề mới: thăng tiến dựa trên năng lực thể hiện ở chuỗi nhiệm vụ mới.',
    steps: [
      { type: 'outcome', id: 'k_rev2_out', eval: (rt, S) => {
        const tl = S.tl; const ids = CAREERS[tl.career.track].missions;
        const avg = ids.reduce((s, q) => s + (tl.questsDone[q]?.score ?? 0), 0) / ids.length;
        const ethicsOk = (tl.stats.ethics ?? 0) >= 0;
        const promote = avg >= 0.85 && ethicsOk ? 1 : 0;
        const hist = (tl.career.history || []).map((h) => CAREERS[h.track].name).join(' → ');
        return { text: `${hist ? `Hành trình: ${hist} → ${CAREERS[tl.career.track].name}. ` : ''}Điểm năng lực ở nghề mới ${Math.round(avg * 100)}%. ${promote ? 'Bạn được thăng một bậc — khoảng trống khi chuyển ngành đã được bù đắp.' : 'Chưa thăng chức năm nay — hãy tiếp tục bù khoảng trống kỹ năng.'}`, fx: { career: { promote } }, score: avg };
      } },
    ],
    rewards: { xp: 40 },
  },
];

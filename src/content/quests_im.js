// Career E — Investment Management: three-mission chain (research → portfolio & risk → attribution & client).
// Companies, prices and returns are fictional Simulation Assumptions; answers computed by the finance engine.
import * as F from '../engine/finance.js';
import { portParams } from './models.js';

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

const RS = { eps: 2400, pe: 15, price: 30000, cfo: 180, ni: 240 };
RS.target = RS.eps * RS.pe;                    // 36,000
RS.upside = RS.target / RS.price - 1;          // 20%
RS.cashConv = RS.cfo / RS.ni;                  // 75%
const PF_BASE = { w: 60, rho: 0.2, eqVol: 18 };
const PF = F.portfolio2(portParams(PF_BASE));  // 7.6% / 11.52% / 0.40
const PF_GOAL = [...Array(21).keys()].map((i) => i * 5).reverse().find((w) => F.portfolio2(portParams({ ...PF_BASE, w })).vol <= 0.1); // 45
const BOND = { dur: F.bondPriceChange({ duration: 7, dy: 0.01 }), conv: F.bondPriceChange({ duration: 7, convexity: 60, dy: 0.01 }) };
const ATTR = F.brinson([{ wp: 0.7, wb: 0.5, rp: 0.12, rb: 0.1 }, { wp: 0.3, wb: 0.5, rp: 0.01, rb: 0.02 }]);

export const IM_ANSWERS = { RS, PF, PF_BASE, PF_GOAL, BOND, ATTR };

const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

export const IM_QUESTS = [
  {
    id: 'k_im_research', title: 'Initiation of Coverage: Hoa Sen Foods', kind: 'career', chapter: 'career', career: 'im', giver: 'tung', loc: 'office_im', age: 22,
    summary: 'Viết báo cáo phân tích cổ phiếu đầu tiên: định giá P/E, chất lượng lợi nhuận, khuyến nghị — và giữ ranh giới với thông tin nội bộ.',
    steps: [
      { type: 'quiz', id: 'k_iv_im', when: (rt, S) => S.tl.flags.no_offer, concept: 'equity_research', q: '🎤 Phỏng vấn: "Pitch cho tôi một cổ phiếu." Cấu trúc tốt nhất?', opts: ['Kể rằng cổ phiếu đang tăng mạnh', 'Luận điểm (vì sao thị trường đang định giá sai) → định giá & giá mục tiêu → chất xúc tác → rủi ro chính và điều gì khiến bạn sai', 'Đọc lại báo cáo thường niên'], a: 1,
        fb: fb('Một stock pitch tốt có luận điểm khác biệt, con số, catalyst và rủi ro.', 'Thesis → valuation → catalysts → risks.', 'Variant perception.', 'Không có offer → phải chứng minh lại năng lực.', 'Stock pitch', 'Initiation of Coverage') },
      { type: 'say', lines: [['tung', 'Chào em. Quỹ ta là quỹ cổ phiếu và trái phiếu cho các quỹ hưu trí. Bài đầu tiên: khởi tạo báo cáo về Hoa Sen Foods — công ty niêm yết. Giá hiện tại 30.000 đồng/cp.'], ['tung', 'Ở buy-side, em không cần đúng 100%. Em cần đúng nhiều hơn sai, và biết rõ khi nào mình sai.']], terms: ['Buy-side', 'P/E'] },
      { type: 'num', id: 'k_imr_target', concept: 'equity_research', q: 'EPS dự phóng năm tới 2.400 đồng. P/E mục tiêu 15x (trung vị ngành). Giá mục tiêu (đồng/cp)?', a: RS.target, tol: 1, unit: 'đồng',
        fb: fb('2.400 × 15 = 36.000 đồng.', 'Target price = forward EPS × target P/E.', 'Định giá tương đối.', 'Cần đối chiếu với DCF để tránh "mua vì cả ngành đắt".', 'Relative valuation', 'Initiation of Coverage') },
      { type: 'num', id: 'k_imr_upside', concept: 'equity_research', q: 'Upside so với giá hiện tại (%)?', a: Math.round(RS.upside * 100), tol: 0.5, unit: '%', traps: [{ v: 17, why: 'Bạn chia cho giá mục tiêu. Upside = Giá mục tiêu / Giá hiện tại − 1.' }],
        fb: fb('36.000 / 30.000 − 1 = 20%.', 'Upside = target / current − 1.', 'So với giá hiện tại.', 'Thêm cổ tức để ra tổng lợi nhuận kỳ vọng.', 'Total return', 'Initiation of Coverage') },
      { type: 'num', id: 'k_imr_cash', concept: 'equity_research', q: 'Dòng tiền hoạt động (CFO) 180 tỷ, lợi nhuận ròng 240 tỷ. Cash conversion (%)?', a: Math.round(RS.cashConv * 100), tol: 0.5, unit: '%',
        fb: fb('180 / 240 = 75%.', 'Cash conversion = CFO / net income.', 'Lợi nhuận có thành tiền không?', 'Dưới 80% liên tục là tín hiệu cần soi phải thu và tồn kho.', 'Earnings quality', 'Initiation of Coverage') },
      { type: 'choice', id: 'k_imr_leak', q: 'Trước ngày công bố KQKD, một nhân viên IR của Hoa Sen gợi ý: "Quý này sẽ bất ngờ đấy." Bạn:', grade: true, best: [1], opts: [
        { t: 'Mua thêm cổ phiếu cho quỹ ngay hôm nay', out: 'Đây là giao dịch dựa trên thông tin nội bộ chưa công bố. Compliance phát hiện; quỹ bị điều tra và bạn bị đình chỉ.', fx: { stats: { ethics: -30 }, rep: -8, flags: { im_mnpi: true }, rel: { tung: { trust: -25 } } } },
        { t: 'Không giao dịch, ghi nhận và báo Compliance; chỉ dùng thông tin công khai và phân tích độc lập (mosaic theory)', out: 'Compliance cảm ơn bạn. Chú Tùng: "Danh tiếng của quỹ quan trọng hơn bất kỳ quý nào."', fx: { stats: { ethics: 12 }, rel: { tung: { trust: 10 } } } },
      ] },
      { type: 'choice', id: 'k_imr_rating', q: 'Upside 20%, nhưng cash conversion 75% và cạnh tranh tăng. Khuyến nghị của bạn?', grade: true, best: [1], opts: [
        { t: 'Strong Buy — upside 20% là đủ', out: 'Bỏ qua tín hiệu chất lượng lợi nhuận; hai quý sau công ty phải trích lập hàng tồn kho.' },
        { t: 'Buy với tỷ trọng vừa phải; ghi rõ rủi ro chất lượng lợi nhuận, giá mục tiêu kịch bản xấu và điều kiện hạ khuyến nghị', out: 'Báo cáo cân bằng, có kịch bản và tín hiệu theo dõi — Chú Tùng duyệt đưa vào danh mục với tỷ trọng 2%.' },
        { t: 'Sell vì ngành tiêu dùng nhàm chán', out: 'Kết luận không dựa trên phân tích.' },
      ] },
    ],
    rewards: { xp: 70, rep: 2, items: ['decor_ticker'], rel: { tung: { respect: 6 } } },
  },
  {
    id: 'k_im_portfolio', title: 'Xây dựng danh mục & quản trị rủi ro', kind: 'career', chapter: 'career', career: 'im', giver: 'tung', loc: 'office_im', age: 23, req: ['k_im_research'],
    summary: 'Phân bổ cổ phiếu – trái phiếu cho quỹ hưu trí: lợi nhuận kỳ vọng, biến động, Sharpe, giới hạn rủi ro và độ nhạy lãi suất của trái phiếu.',
    steps: [
      { type: 'say', lines: [['tung', 'Khách hàng là quỹ hưu trí giáo viên. Giới hạn: biến động danh mục không quá 10%/năm. Cổ phiếu kỳ vọng 10% (biến động 18%), trái phiếu 4% (biến động 6%), tương quan 0,2.']], terms: ['Sharpe Ratio', 'Volatility', 'Duration'] },
      { type: 'num', id: 'k_imp_ret', concept: 'portfolio', q: 'Danh mục 60/40: lợi nhuận kỳ vọng (%, 1 chữ số thập phân)?', a: r1(PF.ret * 100), tol: 0.05, unit: '%', fb: fb('60% × 10% + 40% × 4% = 7,6%.', 'Expected return is the weighted average of asset returns.', 'Bình quân gia quyền.', 'Lợi nhuận cộng tuyến tính — rủi ro thì không.', 'Asset allocation', 'Xây dựng danh mục') },
      { type: 'quiz', id: 'k_imp_vol', concept: 'portfolio', q: `Biến động của 60/40 là ${r1(PF.vol * 100)}%, thấp hơn bình quân gia quyền 13,2%. Vì sao?`, opts: ['Do sai số làm tròn', 'Vì tương quan < 1: cổ phiếu và trái phiếu không luôn biến động cùng chiều, nên rủi ro bù trừ một phần (đa dạng hoá)', 'Vì trái phiếu không có rủi ro'], a: 1,
        fb: fb('σp² = w₁²σ₁² + w₂²σ₂² + 2w₁w₂ρσ₁σ₂; với ρ = 0,2 phần hiệp phương sai nhỏ.', 'Diversification: portfolio volatility < weighted average when correlation < 1.', 'Công thức phương sai danh mục.', 'Đa dạng hoá là "bữa trưa miễn phí" duy nhất trong tài chính.', 'Correlation', 'Xây dựng danh mục') },
      { type: 'model', id: 'k_imp_wb', model: 'portfolio', concept: 'portfolio', goal: { text: 'Workbench: tìm tỷ trọng cổ phiếu CAO NHẤT mà biến động vẫn ≤ 10% (ρ = 0,2; biến động cổ phiếu 18%).', check: (o, v) => v.w === PF_GOAL && v.rho === PF_BASE.rho && v.eqVol === PF_BASE.eqVol } },
      { type: 'num', id: 'k_imp_bond', concept: 'fixed_income', q: 'Danh mục trái phiếu có duration 7. Nếu lợi suất tăng 1 điểm %, giá trái phiếu thay đổi khoảng bao nhiêu % (chỉ dùng duration)?', a: Math.round(BOND.dur * 100), tol: 0.1, unit: '%', traps: [{ v: 7, why: 'Lợi suất tăng thì giá trái phiếu GIẢM — đáp án âm.' }],
        fb: fb('−7 × 1% = −7%. Có convexity 60: −7% + ½ × 60 × 0,01² = −6,7%.', 'ΔP/P ≈ −Duration × Δy (+ ½ Convexity × Δy²).', 'Duration đo độ nhạy lãi suất.', 'Khi NHTW tăng lãi suất, trái phiếu dài hạn chịu lỗ lớn — "an toàn" không có nghĩa là không rủi ro.', 'Duration, Convexity', 'Xây dựng danh mục') },
      { type: 'choice', id: 'k_imp_limit', q: 'Một PM khác muốn tăng cổ phiếu lên 70% vì "thị trường đang lên", vượt giới hạn biến động. Bạn:', grade: true, best: [1], opts: [
        { t: 'Đồng ý — lợi nhuận cao hơn thì khách hàng vui', out: 'Thị trường điều chỉnh 20%; quỹ vi phạm mandate và khách hàng rút vốn.', fx: { rep: -4 } },
        { t: 'Giữ trong giới hạn mandate; nếu muốn thay đổi, trình Investment Committee và khách hàng kèm phân tích rủi ro', out: 'Kỷ luật mandate giúp quỹ giữ được niềm tin khi thị trường biến động.', fx: { rep: 4, rel: { tung: { respect: 8 } } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2 },
  },
  {
    id: 'k_im_attribution', title: 'Báo cáo hiệu quả & khách hàng hoảng loạn', kind: 'career', chapter: 'career', career: 'im', giver: 'tung', loc: 'office_im', age: 23, req: ['k_im_research'],
    summary: 'Giải thích vì sao quỹ thắng benchmark bằng performance attribution, rồi giữ bình tĩnh khi khách hàng muốn bán tháo.',
    steps: [
      { type: 'say', lines: [['tung', 'Cuối năm, quỹ đạt 8,7% so với benchmark 6%. Khách hàng hỏi: "Các anh giỏi thật, hay chỉ may mắn?" Ta trả lời bằng performance attribution.']], terms: ['Benchmark', 'Performance Attribution'] },
      { type: 'doc', title: 'Danh mục vs Benchmark [Simulation]', table: { head: ['Ngành', 'Tỷ trọng quỹ', 'Tỷ trọng benchmark', 'Lợi nhuận quỹ', 'Lợi nhuận benchmark'], rows: [['Công nghệ', '70%', '50%', '12%', '10%'], ['Tiêu dùng', '30%', '50%', '1%', '2%']] } },
      { type: 'num', id: 'k_ima_active', concept: 'attribution', q: 'Active return (lợi nhuận vượt benchmark, %, 1 chữ số thập phân)?', a: r1(ATTR.active * 100), tol: 0.05, unit: '%', fb: fb('Quỹ 0,7 × 12% + 0,3 × 1% = 8,7%; benchmark 0,5 × 10% + 0,5 × 2% = 6%; active 2,7%.', 'Active return = portfolio return − benchmark return.', 'Bình quân gia quyền mỗi bên.', 'Phải xét thêm rủi ro đã chấp nhận (tracking error).', 'Alpha', 'Báo cáo hiệu quả') },
      { type: 'num', id: 'k_ima_alloc', concept: 'attribution', q: 'Hiệu ứng phân bổ (allocation effect, %) = Σ (tỷ trọng quỹ − benchmark) × (lợi nhuận ngành benchmark − lợi nhuận benchmark tổng)?', a: r1(ATTR.allocation * 100), tol: 0.05, unit: '%',
        fb: fb('(+20%) × (10% − 6%) + (−20%) × (2% − 6%) = 0,8% + 0,8% = 1,6%.', 'Allocation effect rewards overweighting sectors that beat the benchmark.', 'Brinson attribution.', 'Phần còn lại: selection 0,5% và interaction 0,6%.', 'Brinson', 'Báo cáo hiệu quả') },
      { type: 'quiz', id: 'k_ima_skill', concept: 'attribution', q: 'Phần lớn lợi nhuận vượt trội đến từ đâu, và điều đó nói gì?', opts: ['Từ chọn cổ phiếu tiêu dùng xuất sắc', 'Chủ yếu từ quyết định phân bổ (overweight công nghệ, 1,6%); chọn cổ phiếu tiêu dùng thực ra kém benchmark — cần kiểm tra quy trình nghiên cứu ngành tiêu dùng', 'Hoàn toàn do may mắn'], a: 1,
        fb: fb('Selection tiêu dùng: 0,5 × (1% − 2%) = −0,5%; selection công nghệ: 0,5 × 2% = +1%.', 'Attribution separates allocation skill from selection skill.', 'Xem từng thành phần.', 'Trung thực về điểm yếu xây dựng niềm tin với khách hàng tổ chức.', 'Attribution', 'Báo cáo hiệu quả') },
      { type: 'choice', id: 'k_ima_panic', q: 'Tháng sau, thị trường giảm 15% do suy thoái. Khách hàng gọi: "Bán hết cổ phiếu đi!" Bạn:', grade: true, best: [1], opts: [
        { t: 'Bán toàn bộ cổ phiếu theo yêu cầu, không tư vấn', out: 'Thị trường hồi phục 6 tháng sau; khách hàng bỏ lỡ phần tăng và khóa khoản lỗ.', fx: { rep: -2 } },
        { t: 'Nhắc lại mục tiêu dài hạn và mandate, trình bày kịch bản, đề xuất tái cân bằng về tỷ trọng mục tiêu (mua thêm cổ phiếu đã rẻ đi) — quyết định cuối cùng thuộc về khách hàng', out: 'Khách hàng đồng ý tái cân bằng. Một năm sau, danh mục hồi phục và vượt benchmark. Quan hệ trở nên bền chặt hơn.', fx: { rep: 5, rel: { tung: { respect: 8 } } } },
        { t: 'Tăng tỷ trọng cổ phiếu lên 90% để "bắt đáy"', out: 'Vi phạm mandate rủi ro — một canh bạc, không phải quản lý danh mục.', fx: { rep: -3 } },
      ] },
      { type: 'outcome', id: 'k_ima_out', eval: (rt, S, sc) => ({ text: S.tl.flags.im_mnpi ? 'Kết quả đầu tư tốt, nhưng vụ thông tin nội bộ vẫn ám ảnh hồ sơ của bạn. Trong quản lý tài sản, niềm tin là sản phẩm.' : 'Khách hàng gia hạn mandate thêm 3 năm và tăng vốn ủy thác. Chú Tùng: "Họ không mua lợi nhuận — họ mua quy trình và sự trung thực."', fx: S.tl.flags.im_mnpi ? {} : { rep: 3, items: ['cert_im'] }, score: sc }) },
    ],
    rewards: { xp: 70, rep: 2 },
  },
];

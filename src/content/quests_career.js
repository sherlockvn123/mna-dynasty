// Career missions (second wave): two extra missions per track, unlocked after the track's preview mission.
// All companies and figures are fictional (Simulation Assumptions). Answers are computed by the finance engine.
import * as F from '../engine/finance.js';
import { isSpecialist } from './sectors.js';

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- precomputed answers ----------
const QOE = { reported: 62, legit: [3, 2, 1.5] };
QOE.adjusted = QOE.reported + QOE.legit.reduce((a, b) => a + b, 0);           // 68.5
const FF = { ebitda: 120, comps: [9, 11], prec: [11, 13], dcf: [1150, 1400], fee: 0.012, mid: 1300 };
FF.compsRange = FF.comps.map((m) => m * FF.ebitda);                           // 1080–1320
FF.precRange = FF.prec.map((m) => m * FF.ebitda);                             // 1320–1560
FF.feeAmt = FF.fee * FF.mid;                                                  // 15.6
const VCB = { pricing: 400 * 0.03, procurement: 250 * 0.02, multiple: 8 };
VCB.total = VCB.pricing + VCB.procurement;                                    // 17
VCB.value = VCB.total * VCB.multiple;                                         // 136
const EXIT = { ebitda: 70, netDebt: 150, invested: 158 };
EXIT.stratEq = EXIT.ebitda * 9.5 - EXIT.netDebt;                              // 515
EXIT.stratMoic = EXIT.stratEq / EXIT.invested;                                // 3.26
EXIT.recapDiv = EXIT.ebitda * 4.5 - EXIT.netDebt;                             // 165
EXIT.recapDpi = EXIT.recapDiv / EXIT.invested;                                // 1.04
EXIT.ipoEq = (EXIT.ebitda * 10 - EXIT.netDebt) * (1 - 0.15);                  // 467.5
const COH = { start: 1.0, expansion: 0.35, contraction: 0.05, churn: 0.08 };
COH.nrr = F.nrr(COH); COH.grr = F.grossRetention(COH);
const CAC = F.cacPayback({ cac: 12000, arrPerCustomer: 10000, grossMargin: 0.55 });
const BURN = F.burnMultiple(4.8, 1.6);
const PR = F.proRata({ ownership: 0.18, preMoney: 120, raise: 30 });
const W = [0.4, 0.3, 0.3];
const SCREEN = { A: F.weightedScore([8, 5, 4], W), B: F.weightedScore([8, 6, 7], W), C: F.weightedScore([5, 9, 7], W) };
const DIV = { proceeds: F.afterTaxProceeds({ price: 120, taxBasis: 70, taxRate: 0.2 }), remaining: 200 - 9, stranded: 3 };

export const CAREER_ANSWERS = { QOE, FF, VCB, EXIT, COH, CAC, BURN, PR, SCREEN, DIV };

export const CAREER_QUESTS = [
  // ======================= INVESTMENT BANKING =======================
  {
    id: 'k_ib_cim', title: 'CIM & Quality of Earnings: Lotus Healthcare', kind: 'career', chapter: 'career', career: 'ib', giver: 'victor', loc: 'ibank', age: 23, req: ['k_ib_mandate'],
    summary: 'Viết Confidential Information Memorandum: chuẩn hoá EBITDA, dựng data room — và giữ sự trung thực khi khách hàng muốn che giấu.',
    steps: [
      { type: 'say', lines: [['victor', 'Trước khi gửi CIM cho người mua, ta cần một con số Adjusted EBITDA bảo vệ được trước due diligence. EBITDA báo cáo: 62 tỷ. Ban lãnh đạo đề xuất 5 khoản add-back.'], ['victor', 'Người mua sẽ thuê kế toán kiểm tra từng đồng. Add-back quá tay sẽ phá huỷ uy tín của chúng ta ở vòng cuối.']], terms: ['Quality of Earnings'] },
      { type: 'sort', id: 'k_ibc_addbacks', concept: 'quality_of_earnings', q: 'Phân loại các add-back đề xuất:', cats: ['Hợp lý — bảo vệ được', 'Quá tay — không nên đưa vào'],
        items: [['Phí dàn xếp một vụ kiện đã kết thúc (3 tỷ, một lần)', 0], ['Lương chủ sở hữu cao hơn mức thị trường (2 tỷ, chuẩn hoá)', 0], ['"Synergies người mua sẽ có" (5 tỷ)', 1], ['Run-rate cả năm của 3 phòng khám vừa mở 2 tháng (4 tỷ)', 1], ['Chi phí đóng cửa tạm thời do sự cố một lần (1,5 tỷ)', 0]],
        fb: { vi: 'Add-back hợp lệ là khoản thực sự một lần hoặc chuẩn hoá về mức thị trường. Synergies thuộc về người mua — không phải EBITDA của người bán. Run-rate phòng khám mới là giả định tương lai, chưa được chứng minh.', en: 'Defensible adjustments are non-recurring or normalizing; buyer synergies and unproven run-rate uplifts are not.', why: 'Hỏi: khoản này có lặp lại không, và người mua có kiểm chứng được không?', impl: 'EBITDA bị thổi phồng sẽ bị cắt ở QoE → giá giảm và mất niềm tin ở vòng cuối.', related: 'Quality of Earnings, Pro forma adjustments', review: 'CIM & Quality of Earnings' } },
      { type: 'num', id: 'k_ibc_adj', concept: 'quality_of_earnings', q: 'Adjusted EBITDA bảo vệ được (tỷ đồng)?', a: QOE.adjusted, tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 77.5, why: 'Bạn đã cộng cả 5 khoản, kể cả synergies và run-rate chưa chứng minh.' }, { v: 62, why: 'Đó là EBITDA báo cáo — các khoản một lần hợp lệ vẫn nên được điều chỉnh.' }],
        fb: { vi: `62 + 3 + 2 + 1,5 = ${QOE.adjusted} tỷ.`, en: 'Adjusted EBITDA = reported EBITDA + defensible non-recurring/normalization items.', why: 'Chỉ cộng các khoản hợp lệ.', impl: 'Ở bội số 11x, mỗi 1 tỷ EBITDA = 11 tỷ giá trị — đó là lý do add-back bị soi rất kỹ.', related: 'EV/EBITDA', review: 'CIM & Quality of Earnings' } },
      { type: 'sort', id: 'k_ibc_dataroom', concept: 'deal_process', q: 'Xếp tài liệu vào đúng thư mục data room:', cats: ['1. Tài chính', '2. Pháp lý', '3. Vận hành & nhân sự'],
        items: [['Báo cáo tài chính kiểm toán 3 năm', 0], ['Hợp đồng thuê mặt bằng 18 phòng khám', 1], ['Danh sách bác sĩ và tỷ lệ nghỉ việc', 2], ['Giấy phép hoạt động y tế', 1], ['Phân tích payer mix theo tháng', 0], ['Quy trình kiểm soát nhiễm khuẩn', 2]],
        fb: { vi: 'Data room có cấu trúc giúp người mua thẩm định nhanh và giảm câu hỏi lặp lại.', en: 'A well-indexed virtual data room accelerates diligence and controls information flow.', why: 'Phân theo workstream thẩm định.', impl: 'Data room lộn xộn kéo dài thời gian và làm người mua nghi ngờ.', related: 'Due Diligence', review: 'CIM & Quality of Earnings' } },
      { type: 'choice', id: 'k_ibc_lawsuit', q: 'CEO Lotus đề nghị không nhắc đến một vụ kiện bồi thường y khoa đang chờ xử lý trong CIM: "Để người mua tự tìm." Bạn:', grade: true, best: [1], opts: [
        { t: 'Đồng ý — CIM là tài liệu marketing', out: 'Ở vòng cuối, người mua phát hiện vụ kiện, rút lui và cáo buộc thiếu thiện chí. Uy tín của ngân hàng bị tổn hại.', fx: { stats: { ethics: -15 }, rep: -4, rel: { victor: { trust: -10 } } } },
        { t: 'Giải thích rủi ro pháp lý & niềm tin, đề xuất công bố trung thực kèm đánh giá của luật sư và cơ chế indemnity/escrow', out: 'CEO miễn cưỡng đồng ý. Người mua đánh giá cao sự minh bạch; vụ kiện được xử lý bằng escrow nhỏ thay vì giảm giá lớn.', fx: { stats: { ethics: 10 }, rep: 3, rel: { victor: { respect: 8 } } } },
        { t: 'Báo Victor rồi để anh ấy quyết định, không đưa ý kiến', out: 'Victor: "Tôi cần cô có quan điểm, không chỉ chuyển thư." Cuối cùng ông yêu cầu công bố.', fx: { rel: { victor: { respect: -2 } } } },
      ] },
      { type: 'quiz', id: 'k_ibc_why', concept: 'deal_process', q: 'Vì sao công bố sớm một rủi ro đã biết thường tốt hơn cho chính người bán?', opts: ['Vì luật bắt buộc in mọi thứ lên trang bìa', 'Vì rủi ro được định giá và cấu trúc (escrow, indemnity) có kiểm soát, thay vì phát hiện muộn làm mất niềm tin và kéo giá xuống mạnh hoặc làm đổ vỡ thương vụ', 'Vì người mua không đọc CIM'], a: 1,
        fb: { vi: 'Bất ngờ ở giai đoạn cuối là kẻ thù của deal certainty.', en: 'Early disclosure lets risks be priced and allocated contractually; late surprises destroy trust and value.', why: 'Information asymmetry khiến người mua chiết khấu mạnh khi phát hiện muộn.', impl: 'Reps & warranties sai sự thật còn dẫn đến trách nhiệm pháp lý sau closing.', related: 'Reps & Warranties, Indemnity, Escrow', review: 'CIM & Quality of Earnings' } },
    ],
    rewards: { xp: 60, rep: 2, items: ['decor_dataroom'], rel: { victor: { respect: 5 } } },
  },
  {
    id: 'k_ib_pitch', title: 'Pitch giành mandate: Hoa Sen Foods', kind: 'career', chapter: 'career', career: 'ib', giver: 'victor', loc: 'ibank', age: 23, req: ['k_ib_mandate'],
    summary: 'Dựng football field, đề xuất khoảng định giá trung thực và xử lý xung đột lợi ích để giành mandate.',
    steps: [
      { type: 'say', lines: [['victor', 'Hoa Sen Foods cân nhắc bán mình. Ba ngân hàng cùng pitch. EBITDA 120 tỷ. Tôi cần một football field: Trading Comps 9–11x, Precedent Transactions 11–13x, DCF 1.150–1.400 tỷ.']], terms: ['Precedent Transactions'] },
      { type: 'num', id: 'k_ibp_comps', concept: 'comps', q: 'Cận trên của khoảng Trading Comps (EV, tỷ đồng)?', a: FF.compsRange[1], tol: 0, unit: 'tỷ đồng', fb: { vi: `11 × 120 = ${FF.compsRange[1]}; cận dưới 9 × 120 = ${FF.compsRange[0]}.`, en: 'Range = multiple range × EBITDA.', why: 'Áp từng đầu bội số.', impl: 'Mỗi phương pháp cho một thanh trên football field.', related: 'Football field', review: 'Pitch giành mandate' } },
      { type: 'doc', title: 'Football field (EV, tỷ đồng)', table: { head: ['Phương pháp', 'Thấp', 'Cao'], rows: [['Trading Comps (9–11x)', FF.compsRange[0], FF.compsRange[1]], ['Precedent Transactions (11–13x)', FF.precRange[0], FF.precRange[1]], ['DCF', FF.dcf[0], FF.dcf[1]]] }, body: 'Vùng giao thoa của các phương pháp thường là vùng khuyến nghị đáng tin nhất.' },
      { type: 'quiz', id: 'k_ibp_range', concept: 'comps', q: 'Khoảng định giá khuyến nghị nào dễ bảo vệ nhất?', opts: ['1.080–1.560 (toàn bộ các thanh)', '1.250–1.400 — vùng giao thoa của DCF với cận trên comps và cận dưới precedents', '1.500–1.560 — cao nhất để làm khách hàng vui'], a: 1,
        fb: { vi: 'Vùng giao thoa được nhiều phương pháp ủng hộ.', en: 'Triangulate: recommend where methodologies overlap.', why: 'Mỗi phương pháp có điểm yếu; giao thoa giảm sai số.', impl: 'Khoảng quá rộng vô dụng; khoảng quá cao làm khách hàng thất vọng khi bid về.', related: 'Football field, Triangulation', review: 'Pitch giành mandate' } },
      { type: 'num', id: 'k_ibp_fee', concept: 'deal_process', q: 'Phí thành công 1,2% trên giá trị giao dịch 1.300 tỷ là bao nhiêu (tỷ đồng)?', a: r1(FF.feeAmt), tol: 0.05, unit: 'tỷ đồng', fb: { vi: '1,2% × 1.300 = 15,6 tỷ.', en: 'Success fee = fee rate × transaction value.', why: 'Nhân tỷ lệ phí.', impl: 'Phí gắn với giá trị tạo động lực — nhưng cũng tạo cám dỗ hứa hẹn giá cao.', related: 'Advisory economics', review: 'Pitch giành mandate' } },
      { type: 'choice', id: 'k_ibp_promise', q: 'Một ngân hàng đối thủ hứa với CEO giá 1.600 tỷ. CEO hỏi bạn: "Các bạn có đạt được 1.600 không?"', grade: true, best: [1], opts: [
        { t: '"Chắc chắn được!" — để giành mandate', out: 'Bạn thắng mandate. Sáu tháng sau, bid cao nhất là 1.380; CEO cảm thấy bị lừa và quan hệ đổ vỡ.', fx: { stats: { ethics: -10 }, rep: -3, flags: { overpromised: true } } },
        { t: '"Dữ liệu ủng hộ 1.250–1.400. Chúng tôi sẽ tạo cạnh tranh để đẩy về cận trên — và đây là kế hoạch người mua cụ thể."', out: 'CEO chọn ngân hàng của bạn: "Tôi cần cố vấn nói thật." Victor gật đầu.', fx: { rep: 4, rel: { victor: { respect: 8, trust: 5 } }, flags: { won_hoasen: true } } },
        { t: 'Né câu hỏi, nói về thương hiệu ngân hàng', out: 'CEO không ấn tượng; mandate về tay ngân hàng khác.', fx: { rep: -1 } },
      ] },
      { type: 'choice', id: 'k_ibp_conflict', q: 'Tuần sau, một đồng nghiệp ở nhóm khác nhờ bạn "chia sẻ nhanh" mô hình Hoa Sen vì nhóm đó đang tư vấn cho một bên có thể mua Hoa Sen. Bạn:', grade: true, best: [0], opts: [
        { t: 'Từ chối, nhắc về information barrier (Chinese wall) và báo Compliance để xử lý xung đột lợi ích', out: 'Compliance thiết lập rào chắn thông tin chính thức. Victor ghi nhận sự chuyên nghiệp của bạn.', fx: { stats: { ethics: 10 }, rel: { victor: { trust: 6 } } } },
        { t: 'Gửi bản đã xoá tên khách hàng', out: 'Vẫn là thông tin mật của khách hàng. Compliance phát hiện và lập biên bản.', fx: { stats: { ethics: -15 }, rep: -4 } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, rel: { victor: { respect: 4 } } },
  },

  // ======================= PRIVATE EQUITY =======================
  {
    id: 'k_pe_100day', title: 'Kế hoạch 100 ngày: GreenLeaf', kind: 'career', chapter: 'career', career: 'pe', giver: 'sophia', loc: 'office_pe', age: 23, req: ['k_pe_lbo'],
    summary: 'Sau closing: xây value creation plan, định lượng tác động EBITDA và quản lý ban lãnh đạo.',
    steps: [
      { type: 'say', lines: [['sophia', 'Ký xong mới là lúc làm việc thật. GreenLeaf: doanh thu 400 triệu USD, giá vốn 250. Tôi cần kế hoạch 100 ngày có con số.'], ['me', 'Mẹ nhắc con: mỗi sáng kiến phải có người chịu trách nhiệm, KPI và mốc thời gian.']], terms: ['Value Creation Plan'] },
      { type: 'sort', id: 'k_pe1_levers', concept: 'value_creation', q: 'Phân loại các sáng kiến:', cats: ['Tăng doanh thu', 'Giảm chi phí', 'Hiệu quả vốn (cash)'],
        items: [['Tăng giá 3% cho dòng bao bì cao cấp', 0], ['Đàm phán lại giá giấy nguyên liệu', 1], ['Rút ngắn kỳ thu tiền (DSO) từ 60 xuống 45 ngày', 2], ['Mở kênh bán cho chuỗi cà phê', 0], ['Tối ưu tồn kho thành phẩm', 2], ['Tự động hoá dây chuyền đóng gói', 1]],
        fb: { vi: 'Value creation có ba đòn bẩy: tăng trưởng, biên lợi nhuận và tiền mặt.', en: 'Value creation levers: revenue growth, margin expansion, capital efficiency.', why: 'Mỗi đòn bẩy tác động khác nhau lên EBITDA và FCF.', impl: 'Giải phóng working capital tạo tiền trả nợ nhưng không tăng EBITDA.', related: 'Value creation bridge', review: 'Kế hoạch 100 ngày' } },
      { type: 'num', id: 'k_pe1_ebitda', concept: 'value_creation', q: 'Tăng giá 3% trên doanh thu 400 (giả định không mất khách) + tiết kiệm 2% giá vốn 250. EBITDA tăng thêm bao nhiêu (triệu USD)?', a: VCB.total, tol: 0.05, unit: 'triệu USD', traps: [{ v: 12, why: 'Bạn mới tính phần tăng giá; còn 2% × 250 = 5 từ mua hàng.' }],
        fb: { vi: `3% × 400 = ${VCB.pricing}; 2% × 250 = ${VCB.procurement}; tổng ${VCB.total}.`, en: 'Price increases with no volume loss flow 100% to EBITDA.', why: 'Chi phí không đổi khi tăng giá.', impl: 'Giả định "không mất khách" phải được kiểm chứng bằng phân tích độ co giãn.', related: 'Pricing power', review: 'Kế hoạch 100 ngày' } },
      { type: 'num', id: 'k_pe1_value', concept: 'value_creation', q: 'Ở bội số exit 8x, sáng kiến này tạo thêm bao nhiêu Enterprise Value (triệu USD)?', a: VCB.value, tol: 0.5, unit: 'triệu USD', fb: { vi: `${VCB.total} × 8 = ${VCB.value}.`, en: 'Value created = incremental EBITDA × exit multiple.', why: 'Bội số khuếch đại mỗi đồng EBITDA bền vững.', impl: 'Gần bằng toàn bộ equity check 158 — chỉ từ hai sáng kiến.', related: 'Value creation bridge', review: 'Kế hoạch 100 ngày' } },
      { type: 'choice', id: 'k_pe1_ceo', q: 'Sau 60 ngày, CEO trì hoãn sáng kiến giá vì sợ mất khách lớn. Bạn đề xuất với Sophia:', grade: true, best: [1], opts: [
        { t: 'Thay CEO ngay lập tức', out: 'Quá sớm: mất người hiểu khách hàng nhất, đội bán hàng hoang mang.', v: { ceo: 0 } },
        { t: 'Cùng CEO chạy thử tăng giá với 20% khách hàng, đo churn, gắn thưởng của CEO với KPI biên lợi nhuận', out: 'Thử nghiệm cho thấy churn chỉ 1%. CEO tự tin triển khai toàn bộ.', v: { ceo: 2 } },
        { t: 'Bỏ sáng kiến giá', out: 'Mất một nửa giá trị kế hoạch.', v: { ceo: 1 } },
      ] },
      { type: 'quiz', id: 'k_pe1_wc', concept: 'value_creation', q: 'Rút DSO từ 60 xuống 45 ngày giải phóng khoảng bao nhiêu tiền (doanh thu 400/năm)?', opts: ['Khoảng 16 triệu USD tiền mặt một lần (400 × 15/365)', '16 triệu USD EBITDA mỗi năm', 'Không có tác động'], a: 0,
        fb: { vi: 'Giảm phải thu giải phóng tiền một lần, không tăng EBITDA.', en: 'Working capital release is a one-off cash inflow, not recurring earnings.', why: '400 × 15/365 ≈ 16,4.', impl: 'Tiền này dùng để trả nợ sớm, tăng equity value khi exit.', related: 'Cash conversion', review: 'Kế hoạch 100 ngày' } },
      { type: 'outcome', id: 'k_pe1_out', eval: (rt, S, sc) => ({ text: rt.vars.ceo === 2 ? 'Sau 100 ngày, EBITDA run-rate tăng 15 triệu USD và đội ngũ đồng lòng. Sophia: "Đây là cách PE tạo giá trị mà không cần thêm đòn bẩy."' : 'Kế hoạch chỉ đạt một phần mục tiêu. Bài học: value creation là quản trị con người, không chỉ bảng tính.', fx: { rep: rt.vars.ceo === 2 ? 4 : 1, rel: { sophia: { respect: rt.vars.ceo === 2 ? 8 : 0 } } }, score: sc }) },
    ],
    rewards: { xp: 60, rep: 2, items: ['decor_valuebridge'] },
  },
  {
    id: 'k_pe_exit', title: 'Exit: thu hoạch GreenLeaf', kind: 'career', chapter: 'career', career: 'pe', giver: 'sophia', loc: 'office_pe', age: 23, req: ['k_pe_lbo'],
    summary: 'So sánh bán cho chiến lược, IPO và dividend recap. Hiểu MOIC, DPI và độ chắc chắn của tiền về tay LP.',
    steps: [
      { type: 'say', lines: [['sophia', 'Năm thứ 4. EBITDA GreenLeaf đạt 70 triệu USD, nợ ròng 150. Quỹ đã đầu tư 158. Ba phương án đang trên bàn.']], terms: ['MOIC', 'DPI'] },
      { type: 'doc', title: 'Các phương án exit [Simulation]', table: { head: ['Phương án', 'Mô tả'], rows: [['A. Bán cho tập đoàn bao bì', '9,5x EBITDA, tiền mặt 100%, đã có LOI'], ['B. IPO', 'Định giá 10x, chiết khấu IPO 15%, chỉ bán 30% lúc IPO, phần còn lại bị lock-up 12 tháng'], ['C. Dividend recap', 'Vay lại đến 4,5x EBITDA, trả cổ tức, giữ công ty']] } },
      { type: 'num', id: 'k_pe2_eq', concept: 'irr_moic', q: 'Phương án A: Equity value cho quỹ (triệu USD)?', a: EXIT.stratEq, tol: 0.5, unit: 'triệu USD', traps: [{ v: 665, why: 'Đó là Enterprise Value — phải trừ nợ ròng 150.' }], fb: { vi: '9,5 × 70 − 150 = 515.', en: 'Exit equity = EV − net debt.', why: 'Bridge EV → Equity.', impl: 'Người mua trả EV; quỹ nhận phần sau khi trả nợ.', related: 'EV bridge', review: 'Exit: thu hoạch GreenLeaf' } },
      { type: 'num', id: 'k_pe2_moic', concept: 'irr_moic', q: 'MOIC của phương án A (2 chữ số thập phân)?', a: r2(EXIT.stratMoic), tol: 0.02, unit: 'x', fb: { vi: `515 / 158 ≈ ${r2(EXIT.stratMoic)}x.`, en: 'MOIC = proceeds / invested.', why: 'Chia tiền nhận về cho vốn đã bỏ ra.', impl: 'Trên 3x sau 4 năm là kết quả rất tốt.', related: 'IRR vs MOIC', review: 'Exit: thu hoạch GreenLeaf' } },
      { type: 'num', id: 'k_pe2_recap', concept: 'irr_moic', q: 'Phương án C: cổ tức từ dividend recap (triệu USD)?', a: EXIT.recapDiv, tol: 0.5, unit: 'triệu USD', fb: { vi: '4,5 × 70 − 150 = 165 → DPI ≈ 1,04x, nhưng công ty gánh thêm nợ.', en: 'Recap dividend = new debt capacity − existing net debt.', why: 'Vay thêm để trả cổ tức.', impl: 'Trả lại vốn sớm cho LP nhưng tăng rủi ro tài chính.', related: 'DPI, Leverage', review: 'Exit: thu hoạch GreenLeaf' } },
      { type: 'quiz', id: 'k_pe2_ipo', concept: 'exit', q: 'Vì sao IPO "10x" không chắc tốt hơn bán ở 9,5x?', opts: ['Vì IPO luôn thất bại', 'Vì chiết khấu IPO, chỉ thoái được 30% lúc đầu và lock-up khiến phần lớn giá trị phụ thuộc giá cổ phiếu tương lai — tiền về chậm và không chắc chắn', 'Vì 10 nhỏ hơn 9,5'], a: 1,
        fb: { vi: `Sau chiết khấu 15%, giá trị vốn ≈ ${EXIT.ipoEq} < 515, và chỉ 30% thành tiền ngay.`, en: 'IPOs carry discounts, partial liquidity and lock-up risk.', why: '(700 − 150) × 85% = 467,5.', impl: 'LP đánh giá cao DPI — tiền thật đã về.', related: 'DPI vs TVPI', review: 'Exit: thu hoạch GreenLeaf' } },
      { type: 'choice', id: 'k_pe2_pick', q: 'Khuyến nghị của bạn với Investment Committee?', grade: true, best: [0], opts: [
        { t: 'A — bán cho tập đoàn: giá trị cao nhất đã điều chỉnh rủi ro, 100% tiền mặt', out: 'IC phê duyệt. Quỹ ghi nhận MOIC ~3,26x. Sophia: "Một thương vụ để đưa vào fundraising deck."', fx: { rep: 5, flags: { pe_exit: 'strategic' } } },
        { t: 'B — IPO vì tiêu đề đẹp hơn', out: 'Thị trường điều chỉnh trong thời gian lock-up; giá trị thực nhận thấp hơn phương án A.', fx: { rep: 0 } },
        { t: 'C — dividend recap và giữ công ty', out: 'LP nhận DPI sớm, nhưng công ty bước vào chu kỳ lãi suất cao với đòn bẩy 4,5x.', fx: { rep: 1 } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, rel: { sophia: { respect: 5 } } },
  },

  // ======================= VENTURE CAPITAL =======================
  {
    id: 'k_vc_dd', title: 'Thẩm định Series A: Cohort & Unit Economics', kind: 'career', chapter: 'career', career: 'vc', giver: 'ken', loc: 'office_vc', age: 23, req: ['k_vc_round'],
    summary: 'Đọc dữ liệu cohort, tính NRR/GRR, CAC payback, burn multiple — và gọi reference về founder.',
    steps: [
      { type: 'say', lines: [['ken', 'Một startup khác trong pipeline: "LớpXanh" — phần mềm cho trường mầm non. Founder pitch rất hay. Giờ đến lúc nhìn số.']], terms: ['Net Revenue Retention', 'CAC Payback', 'Burn Multiple'] },
      { type: 'say', when: (rt, S) => isSpecialist(S.tl, 'education'), lines: [['nar', '🎓 Chuyên môn Giáo dục: bạn biết churn của phần mềm trường học dồn vào cuối năm học và ngân sách được duyệt theo năm — bạn hỏi đúng thời điểm gia hạn. (+Industry credibility khi hoàn thành)']] },
      { type: 'doc', title: 'Cohort khách hàng năm 2025 (ARR, triệu USD)', table: { head: ['Hạng mục', 'Giá trị'], rows: [['ARR đầu kỳ của cohort', 1.0], ['Mở rộng (upsell)', 0.35], ['Thu hẹp (downgrade)', -0.05], ['Rời bỏ (churn)', -0.08]] } },
      { type: 'num', id: 'k_vcd_nrr', concept: 'saas_metrics', q: 'Net Revenue Retention (%)?', a: Math.round(COH.nrr * 100), tol: 0.5, unit: '%', traps: [{ v: 87, why: 'Đó là Gross Retention — NRR còn cộng phần mở rộng.' }], fb: { vi: '(1,0 + 0,35 − 0,05 − 0,08) / 1,0 = 122%.', en: 'NRR = (start + expansion − contraction − churn) / start.', why: 'Đo tăng trưởng từ khách hàng hiện có.', impl: 'NRR > 120% là dấu hiệu sản phẩm được yêu thích.', related: 'Cohort analysis', review: 'Thẩm định Series A' } },
      { type: 'num', id: 'k_vcd_grr', concept: 'saas_metrics', q: 'Gross Revenue Retention (%)?', a: Math.round(COH.grr * 100), tol: 0.5, unit: '%', fb: { vi: '(1,0 − 0,05 − 0,08) / 1,0 = 87%.', en: 'GRR excludes expansion — measures leakage only.', why: 'Không cộng upsell.', impl: 'GRR thấp nghĩa là upsell đang che giấu vấn đề churn.', related: 'Retention', review: 'Thẩm định Series A' } },
      { type: 'num', id: 'k_vcd_cac', concept: 'unit_economics', q: 'CAC 12.000 USD; mỗi khách trả 10.000 USD/năm; gross margin 55%. CAC payback (tháng, 1 chữ số thập phân)?', a: r1(CAC), tol: 0.2, unit: 'tháng', traps: [{ v: 14.4, why: 'Bạn dùng doanh thu thay vì lợi nhuận gộp — phải nhân gross margin 55%.' }], fb: { vi: `Lợi nhuận gộp/tháng = 10.000 × 55% / 12 ≈ 458; 12.000 / 458 ≈ ${r1(CAC)} tháng.`, en: 'CAC payback uses gross profit, not revenue.', why: 'Chi phí phục vụ khách hàng phải được trừ.', impl: 'Trên 24 tháng là dài cho SaaS SMB — cần cải thiện hiệu quả bán hàng.', related: 'LTV/CAC', review: 'Thẩm định Series A' } },
      { type: 'num', id: 'k_vcd_burn', concept: 'unit_economics', q: 'Net burn năm qua 4,8 triệu USD, net new ARR 1,6 triệu. Burn multiple (x)?', a: r1(BURN), tol: 0.05, unit: 'x', fb: { vi: '4,8 / 1,6 = 3,0x — tốn 3 USD để tạo 1 USD ARR mới.', en: 'Burn multiple = net burn / net new ARR (lower is better; >2x is concerning).', why: 'Đo hiệu quả tăng trưởng.', impl: 'Retention tốt nhưng go-to-market tốn kém.', related: 'Growth efficiency', review: 'Thẩm định Series A' } },
      { type: 'choice', id: 'k_vcd_ref', q: 'Reference call: hai nhân viên cũ nói founder từng phóng đại số liệu với nhà đầu tư trước. Bạn:', grade: true, best: [1], opts: [
        { t: 'Bỏ qua — số liệu đẹp là đủ', out: 'Rủi ro quản trị bị lờ đi.', v: { ref: 0 } },
        { t: 'Gọi thêm reference độc lập, đối chiếu số liệu với dữ liệu thanh toán gốc, và hỏi thẳng founder', out: 'Dữ liệu gốc khớp với cohort; founder giải thích minh bạch về sự cố cũ. Bạn có bức tranh đầy đủ.', v: { ref: 2 } },
        { t: 'Từ chối ngay không cần kiểm tra', out: 'Có thể bỏ lỡ một công ty tốt chỉ vì tin đồn chưa kiểm chứng.', v: { ref: 1 } },
      ] },
      { type: 'outcome', id: 'k_vcd_out', eval: (rt, S, sc) => ({ text: rt.vars.ref === 2 ? 'Memo đầu tư của bạn nêu rõ: retention xuất sắc, hiệu quả GTM yếu (burn 3x, payback 26 tháng). Đề xuất đầu tư kèm điều kiện cải thiện GTM. Ken: "Đây là cách viết memo — cả mặt sáng lẫn mặt tối."' : 'Memo thiếu phần đánh giá founder. Ken: "Ở giai đoạn này, ta đầu tư vào con người trước tiên."', fx: { rep: rt.vars.ref === 2 ? 4 : 1, rel: { ken: { respect: rt.vars.ref === 2 ? 8 : 0 } } }, score: sc }) },
    ],
    rewards: { xp: 60, rep: 2 },
  },
  {
    id: 'k_vc_followon', title: 'Series B của Mầm AI: follow-on hay không?', kind: 'career', chapter: 'career', career: 'vc', giver: 'ken', loc: 'office_vc', age: 23, req: ['k_vc_round'],
    summary: 'Quyết định reserve: pro rata, pha loãng và portfolio construction theo power law.',
    steps: [
      { type: 'say', lines: [['khoa', 'Mầm AI gọi Series B: 30 triệu USD ở pre-money 120 triệu. Quỹ cậu đang sở hữu 18%. Cậu có giữ tỷ lệ không?'], ['ken', 'Quỹ 100 triệu USD, ta dành 50% cho follow-on. Reserve là nguồn lực khan hiếm — hãy dành cho người thắng.']], terms: ['Pro Rata'] },
      { type: 'num', id: 'k_vcf_amt', concept: 'cap_table', q: 'Số tiền cần để giữ nguyên 18% (pro rata, triệu USD)?', a: r1(PR.amount), tol: 0.05, unit: 'triệu USD', fb: { vi: '18% × 30 = 5,4 triệu USD.', en: 'Pro rata amount = current ownership × round size.', why: 'Mua đúng tỷ lệ phần cổ phiếu mới.', impl: 'Giữ ownership ở những công ty tốt nhất là chìa khoá lợi nhuận quỹ.', related: 'Pro rata rights', review: 'Series B của Mầm AI' } },
      { type: 'num', id: 'k_vcf_dil', concept: 'cap_table', q: 'Nếu không tham gia, tỷ lệ sở hữu còn bao nhiêu (%, 1 chữ số thập phân)?', a: r1(PR.dilutedOwnership * 100), tol: 0.05, unit: '%', traps: [{ v: 18, why: 'Vòng mới phát hành thêm cổ phiếu nên bạn bị pha loãng.' }], fb: { vi: '18% × 120 / 150 = 14,4%.', en: 'Diluted ownership = ownership × pre-money / post-money.', why: 'Phần mới chiếm 30/150 = 20%.', impl: 'Mất 3,6 điểm % trong một công ty có thể trở thành outlier.', related: 'Dilution', review: 'Series B của Mầm AI' } },
      { type: 'quiz', id: 'k_vcf_power', concept: 'power_law', q: 'Theo power law, nguyên tắc phân bổ reserve hợp lý nhất?', opts: ['Chia đều reserve cho mọi công ty', 'Tập trung reserve vào số ít công ty có bằng chứng vượt trội; không "cứu" công ty yếu chỉ vì đã đầu tư', 'Không bao giờ follow-on'], a: 1,
        fb: { vi: 'Một vài khoản thắng lớn quyết định lợi nhuận cả quỹ.', en: 'Venture returns follow a power law; concentrate reserves on breakout winners.', why: 'Lợi nhuận quỹ phân phối rất lệch.', impl: 'Follow-on vì cảm xúc (sunk cost) là lỗi phổ biến.', related: 'Portfolio construction', review: 'Series B của Mầm AI' } },
      { type: 'choice', id: 'k_vcf_pick', q: 'Dữ liệu Mầm AI: ARR tăng 2,5x, gross margin cải thiện từ 55% lên 68%, NRR 130%. Quyết định?', grade: true, best: [0], opts: [
        { t: 'Thực hiện pro rata 5,4 triệu — bằng chứng vượt trội rõ ràng', out: 'Ken: "Đúng — đây là lúc reserve phát huy tác dụng."', fx: { rep: 4, flags: { vc_followon: true }, rel: { khoa: { trust: 5 } } } },
        { t: 'Bỏ qua để giữ tiền cho công ty đang gặp khó', out: 'Bạn bị pha loãng xuống 14,4% ở công ty tốt nhất danh mục.', fx: { rep: -1 } },
        { t: 'Đòi super pro rata 15 triệu (50% vòng)', out: 'Lead investor Series B từ chối; quan hệ với Khoa căng thẳng vì gây trễ vòng gọi vốn.', fx: { rel: { khoa: { trust: -5 } } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, items: ['decor_unicorn'] },
  },

  // ======================= CORPORATE DEVELOPMENT =======================
  {
    id: 'k_cd_screen', title: 'Sàng lọc mục tiêu: Build, Buy hay Partner', kind: 'career', chapter: 'career', career: 'cd', giver: 'hung', loc: 'office_cd', age: 23, req: ['k_cd_synergy'],
    summary: 'Dùng mô hình chấm điểm có trọng số để chọn mục tiêu, rồi quyết định build/buy/partner.',
    steps: [
      { type: 'say', lines: [['hung', 'Hội đồng muốn Pastel Retail vào mảng chăm sóc da trẻ em. Có 3 mục tiêu. Tiêu chí: Strategic fit 40%, Tài chính 30%, Mức dễ tích hợp 30% (thang 10).']] },
      { type: 'doc', title: 'Điểm đánh giá (thang 10)', table: { head: ['Mục tiêu', 'Strategic fit', 'Tài chính', 'Dễ tích hợp'], rows: [['A — BéXinh (thương hiệu hot, văn hoá khác biệt)', 8, 5, 4], ['B — MầmSạch (D2C, hệ thống tương thích)', 8, 6, 7], ['C — KemCo (lợi nhuận cao, sản phẩm người lớn)', 5, 9, 7]] } },
      { type: 'num', id: 'k_cds_b', concept: 'strategy', q: 'Điểm có trọng số của mục tiêu B?', a: r1(SCREEN.B), tol: 0.05, unit: 'điểm', fb: { vi: `0,4×8 + 0,3×6 + 0,3×7 = ${r1(SCREEN.B)}. A = ${r1(SCREEN.A)}; C = ${r1(SCREEN.C)}.`, en: 'Weighted score = Σ score × weight.', why: 'Nhân từng tiêu chí với trọng số.', impl: 'B dẫn đầu dù không có tài chính tốt nhất.', related: 'Screening matrix', review: 'Sàng lọc mục tiêu' } },
      { type: 'quiz', id: 'k_cds_c', concept: 'strategy', q: 'KemCo có điểm tài chính cao nhất. Vì sao vẫn xếp sau?', opts: ['Vì tài chính không quan trọng', 'Vì strategic fit thấp (sản phẩm người lớn) — một công ty tốt chưa chắc là mục tiêu tốt cho chiến lược này', 'Vì nhập sai số'], a: 1,
        fb: { vi: 'M&A chiến lược bắt đầu từ chiến lược, không từ bảng xếp hạng lợi nhuận.', en: 'A good company is not necessarily a good fit; strategy drives target selection.', why: 'Trọng số 40% cho strategic fit.', impl: 'Tránh mua chỉ vì "giá rẻ" hoặc "lợi nhuận đẹp".', related: 'Strategic fit', review: 'Sàng lọc mục tiêu' } },
      { type: 'sort', id: 'k_cds_bbp', concept: 'strategy', q: 'Ghép mỗi tình huống với lựa chọn phù hợp:', cats: ['Build (tự xây)', 'Buy (mua lại)', 'Partner (JV/liên minh)'],
        items: [['Cần thị phần nhanh trước khi đối thủ chiếm chỗ', 1], ['Năng lực cốt lõi đã có, chỉ thiếu một dòng sản phẩm đơn giản', 0], ['Muốn thử thị trường nước ngoài với rủi ro thấp', 2], ['Cần công nghệ độc quyền mà mục tiêu đã có bằng sáng chế', 1], ['Thị trường còn rất mới, chưa rõ mô hình thắng', 2]],
        fb: { vi: 'Build khi có năng lực và thời gian; Buy khi cần tốc độ hoặc tài sản độc quyền; Partner khi bất định cao.', en: 'Build vs buy vs partner depends on speed, capability gaps and uncertainty.', why: 'Mỗi lựa chọn đánh đổi kiểm soát, tốc độ và rủi ro.', impl: 'M&A không phải luôn là câu trả lời.', related: 'Organic vs inorganic growth', review: 'Sàng lọc mục tiêu' } },
      { type: 'choice', id: 'k_cds_ceo', q: 'CEO thích BéXinh vì thương hiệu đang "hot" trên mạng xã hội. Bạn:', grade: true, best: [1], opts: [
        { t: 'Đồng ý với CEO', out: 'Hai năm sau, văn hoá xung đột khiến đội sáng lập BéXinh rời đi; thương hiệu nguội dần.', fx: { rep: -2 } },
        { t: 'Trình bày ma trận chấm điểm, nêu rủi ro tích hợp của BéXinh và đề xuất MầmSạch, giữ BéXinh làm phương án hợp tác thương hiệu', out: 'CEO đồng ý khởi động thẩm định MầmSạch. Anh Hùng: "Dữ liệu thắng cảm hứng."', fx: { rep: 4, rel: { hung: { respect: 8 } } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2, items: ['decor_puzzle'] },
  },
  {
    id: 'k_cd_divest', title: 'Thoái vốn: mảng Nến Thơm', kind: 'career', chapter: 'career', career: 'cd', giver: 'hung', loc: 'office_cd', age: 23, req: ['k_cd_synergy'],
    summary: 'Carve-out một mảng không cốt lõi: tiền thu sau thuế, stranded costs và Transitional Service Agreement.',
    steps: [
      { type: 'say', lines: [['hung', 'Mảng Nến Thơm không còn phù hợp chiến lược. Người mua trả 120 tỷ; giá trị sổ sách (tax basis) 70 tỷ; thuế thu nhập 20%. Mảng này đóng góp 9 tỷ EBITDA trên tổng 200 tỷ của tập đoàn.']], terms: ['Stranded Costs', 'Transitional Service Agreement'] },
      { type: 'num', id: 'k_cdd_proc', concept: 'divestiture', q: 'Tiền thu ròng sau thuế (tỷ đồng)?', a: DIV.proceeds, tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 96, why: 'Thuế chỉ tính trên phần lãi (120 − 70), không phải toàn bộ giá bán.' }], fb: { vi: '120 − 20% × (120 − 70) = 110.', en: 'Net proceeds = price − tax on gain over tax basis.', why: 'Thuế đánh trên lãi vốn.', impl: 'Tax basis thấp làm giảm tiền thu thực tế — cân nhắc cấu trúc.', related: 'Tax leakage', review: 'Thoái vốn: mảng Nến Thơm' } },
      { type: 'num', id: 'k_cdd_ebitda', concept: 'divestiture', q: 'EBITDA còn lại của tập đoàn ngay sau thoái vốn (tỷ đồng)?', a: DIV.remaining, tol: 0.05, unit: 'tỷ đồng', fb: { vi: '200 − 9 = 191 tỷ, và trong đó vẫn còn 3 tỷ chi phí chung trước đây được phân bổ cho mảng Nến Thơm (stranded costs).', en: 'Remaining EBITDA = group − divested segment EBITDA; shared overhead remains.', why: 'Chi phí chung không tự biến mất.', impl: 'Phải có kế hoạch cắt stranded costs, nếu không biên lợi nhuận giảm.', related: 'Stranded costs', review: 'Thoái vốn: mảng Nến Thơm' } },
      { type: 'quiz', id: 'k_cdd_str', concept: 'divestiture', q: 'Stranded costs là gì?', opts: ['Chi phí vận chuyển nến', 'Chi phí chung (IT, kế toán, nhân sự) từng phục vụ mảng bị bán nhưng vẫn ở lại với người bán sau thương vụ', 'Chi phí của người mua'], a: 1,
        fb: { vi: 'Khi bán một mảng, chi phí chung không giảm tương ứng ngay lập tức.', en: 'Stranded costs are shared overheads left behind after a divestiture.', why: 'Chúng được phân bổ, không gắn trực tiếp.', impl: 'Thường được bù một phần qua phí TSA trong giai đoạn chuyển tiếp.', related: 'TSA', review: 'Thoái vốn: mảng Nến Thơm' } },
      { type: 'choice', id: 'k_cdd_tsa', q: 'Người mua cần dùng hệ thống IT và kho của Pastel trong thời gian chuyển tiếp. Đề xuất TSA của bạn:', grade: true, best: [1], opts: [
        { t: 'Không cung cấp TSA', out: 'Người mua giảm giá 10 tỷ vì rủi ro gián đoạn vận hành.', fx: { rep: -1 } },
        { t: 'TSA 9–12 tháng, phí theo chi phí + biên nhỏ, có lộ trình bàn giao rõ ràng; song song cắt giảm 3 tỷ stranded costs', out: 'Thương vụ hoàn tất đúng giá; phí TSA bù stranded costs trong lúc tập đoàn tái cấu trúc.', fx: { rep: 4, rel: { hung: { respect: 6 } } } },
        { t: 'TSA vô thời hạn, miễn phí', out: 'Đội IT của Pastel phục vụ công ty khác mãi mãi; chi phí phình to.', fx: { rep: -2 } },
      ] },
    ],
    rewards: { xp: 60, rep: 2 },
  },
];

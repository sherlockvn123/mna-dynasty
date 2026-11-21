// Career F — Strategic & Financial Consulting: three-mission chain.
// Companies and figures are fictional Simulation Assumptions; answers computed by the finance engine.
import * as F from '../engine/finance.js';
import { engagementParams } from './models.js';

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

const MKT = { population: 20e6, penetration: 0.35, unitsPerYear: 104, price: 35000, targetRev: 510 };
MKT.size = F.marketSize(MKT) / 1e9;                                  // 25,480 tỷ đồng
MKT.share = MKT.targetRev / MKT.size;                                // 2.0%
MKT.planShare = (MKT.targetRev * 3) / (MKT.size * Math.pow(1.05, 5)); // share needed if revenue triples in 5 yrs, market +5%/yr
const TR = { savings: 18, oneOff: 24, rate: 0.1, years: 5 };
TR.payback = TR.oneOff / TR.savings;                                 // 1.33 yrs
TR.npv = F.npv(TR.rate, [-TR.oneOff, ...Array(TR.years).fill(TR.savings)]); // 44.23
const ENG_BASE = { consultants: 3, weeks: 10, realization: 90, partnerPct: 10 };
const ENG = F.engagementEconomics(engagementParams(ENG_BASE));
const ENG_GOAL = Array.from({ length: 41 }, (_, i) => 60 + i).find((r) => F.engagementEconomics(engagementParams({ ...ENG_BASE, realization: r })).margin >= 0.55);

export const CONSULTING_ANSWERS = { MKT, TR, ENG, ENG_BASE, ENG_GOAL };

const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

export const CONSULTING_QUESTS = [
  {
    id: 'k_cs_cdd', title: 'Commercial Due Diligence: Mây Tea', kind: 'career', chapter: 'career', career: 'cs', giver: 'diep', loc: 'office_cs', age: 22,
    summary: 'Một quỹ PE thuê bạn kiểm chứng kế hoạch kinh doanh của chuỗi trà sữa Mây Tea: issue tree, sizing thị trường, phỏng vấn chuyên gia và một kết luận trung thực.',
    steps: [
      { type: 'quiz', id: 'k_iv_cs', when: (rt, S) => S.tl.flags.no_offer, concept: 'consulting_case', q: '🎤 Case interview: "Ước tính thị trường trà sữa ở các thành phố lớn." Cách tiếp cận tốt nhất?', opts: ['Đoán một con số thật nhanh', 'Nêu cấu trúc trước: dân số × tỷ lệ người uống × tần suất × giá; nêu giả định, tính, rồi kiểm tra tính hợp lý (sanity check)', 'Nói rằng cần tra Google'], a: 1,
        fb: fb('Người phỏng vấn chấm cấu trúc và giả định, không chấm con số chính xác.', 'Structure first, state assumptions, compute, sanity-check.', 'Top-down market sizing.', 'Không có offer → phải vượt qua case interview.', 'Market sizing', 'Commercial Due Diligence: Mây Tea') },
      { type: 'say', lines: [['diep', 'Chào em. Khách hàng là quỹ Sage Peak — họ muốn mua Mây Tea. Ban lãnh đạo Mây Tea nói doanh thu sẽ gấp 3 trong 5 năm. Việc của ta: kiểm chứng điều đó trong 4 tuần.'], ['diep', 'Quy tắc của chị: bắt đầu bằng giả thuyết, chia vấn đề theo kiểu MECE — không trùng lặp, không bỏ sót.'], ['khoa', '(nhắn tin) Mây Tea à? Ngày xưa đội tớ thua cuộc thi vì chọn nó đấy! 😅']], terms: ['Commercial Due Diligence', 'MECE'] },
      { type: 'sort', id: 'k_csc_tree', concept: 'consulting_case', q: 'Xếp các câu hỏi vào đúng nhánh của issue tree:', cats: ['Thị trường có hấp dẫn?', 'Mây Tea có thắng được?', 'Kế hoạch có khả thi?'],
        items: [['Thị trường tăng trưởng bao nhiêu %/năm?', 0], ['Khách hàng chọn Mây Tea thay vì đối thủ vì sao?', 1], ['Cần mở bao nhiêu cửa hàng mới mỗi năm để đạt kế hoạch?', 2], ['Có rào cản gia nhập nào không?', 0], ['Doanh thu/cửa hàng của Mây Tea so với đối thủ?', 1], ['Đội ngũ có đủ năng lực vận hành gấp 3 quy mô?', 2]],
        fb: fb('Issue tree MECE chia vấn đề lớn thành các nhánh độc lập và đầy đủ.', 'MECE issue trees structure diligence workstreams.', 'Mỗi câu thuộc đúng một nhánh.', 'Mỗi nhánh thành một workstream với người phụ trách.', 'Hypothesis-driven problem solving', 'Commercial Due Diligence: Mây Tea') },
      { type: 'num', id: 'k_csc_size', concept: 'consulting_case', q: 'Market sizing: 20 triệu dân đô thị × 35% uống trà sữa × 2 ly/tuần (104 ly/năm) × 35.000 đồng/ly. Quy mô thị trường (tỷ đồng/năm)?', a: Math.round(MKT.size), tol: 5, unit: 'tỷ đồng', traps: [{ v: 12740, why: 'Bạn dùng 52 ly/năm — 2 ly/tuần là 104 ly/năm.' }],
        fb: fb(`20tr × 35% = 7tr người; × 104 = 728 triệu ly; × 35.000 = ${Math.round(MKT.size).toLocaleString('vi-VN')} tỷ đồng.`, 'Top-down market size = population × penetration × frequency × price.', 'Nhân lần lượt, cẩn thận đơn vị.', 'Kiểm chứng chéo bằng bottom-up: số cửa hàng × doanh thu/cửa hàng.', 'TAM, Sanity check', 'Commercial Due Diligence: Mây Tea') },
      { type: 'num', id: 'k_csc_share', concept: 'consulting_case', q: 'Doanh thu Mây Tea 510 tỷ. Thị phần hiện tại (%, 1 chữ số thập phân)?', a: r1(MKT.share * 100), tol: 0.1, unit: '%',
        fb: fb('510 / 25.480 ≈ 2,0%.', 'Market share = company revenue / market size.', 'Chia doanh thu cho quy mô thị trường.', `Để doanh thu gấp 3 sau 5 năm trong thị trường tăng 5%/năm, Mây Tea cần thị phần ≈ ${r1(MKT.planShare * 100)}% — gần gấp 2,4 lần hiện nay.`, 'Market share', 'Commercial Due Diligence: Mây Tea') },
      { type: 'choice', id: 'k_csc_expert', q: 'Một cựu quản lý vùng của đối thủ lớn nhất đề nghị gửi bạn file P&L chi tiết từng cửa hàng của công ty cũ "để tham khảo". Bạn:', grade: true, best: [1], opts: [
        { t: 'Nhận file — dữ liệu quá giá trị', out: 'Bộ phận pháp chế phát hiện: đây là thông tin mật của bên thứ ba. Dự án bị đình chỉ để rà soát; khách hàng lo ngại rủi ro pháp lý.', fx: { stats: { ethics: -20 }, rep: -4, rel: { diep: { trust: -15 } } } },
        { t: 'Từ chối nhận tài liệu mật, chỉ phỏng vấn về xu hướng ngành theo quy trình expert network có tuân thủ', out: 'Cuộc phỏng vấn vẫn cho insight quý: chi phí thuê mặt bằng đang tăng 12%/năm ở trung tâm.', fx: { stats: { ethics: 10 }, rel: { diep: { trust: 8 } } } },
      ] },
      { type: 'quiz', id: 'k_csc_survey', concept: 'consulting_case', q: 'Khảo sát: 40% người tham gia nói "chắc chắn sẽ mua" sản phẩm mới của Mây Tea. Cách diễn giải chuyên nghiệp?', opts: ['Doanh số sẽ đạt 40% thị trường', 'Ý định đã nói thường cao hơn hành vi thực tế (stated vs revealed preference) — cần chiết khấu mạnh và đối chiếu với dữ liệu bán hàng thử nghiệm', 'Khảo sát luôn vô dụng'], a: 1,
        fb: fb('Người trả lời khảo sát thường lạc quan hơn hành vi thực.', 'Stated intent overstates purchase; calibrate with revealed behaviour (pilot sales, cohort data).', 'Bias trong khảo sát.', 'CDD tốt kết hợp khảo sát, phỏng vấn và dữ liệu giao dịch.', 'Survey bias', 'Commercial Due Diligence: Mây Tea') },
      { type: 'choice', id: 'k_csc_conclusion', q: 'Quỹ PE rất muốn thương vụ. Kết luận CDD của bạn?', grade: true, best: [1], opts: [
        { t: '"Kế hoạch gấp 3 là khả thi" — khách hàng đang muốn nghe điều đó', out: 'Hai năm sau, Mây Tea chỉ tăng 40%. Quỹ mất niềm tin vào báo cáo của Bluebell.', fx: { rep: -5, rel: { diep: { respect: -10 } } } },
        { t: `"Thị trường hấp dẫn và Mây Tea có lợi thế thương hiệu, nhưng kế hoạch cần thị phần ≈ ${r1(MKT.planShare * 100)}%. Base case CDD: doanh thu ×1,8; downside ×1,3" — kèm các chỉ số cần theo dõi`, out: 'Quỹ dùng base case của bạn để đàm phán giá thấp hơn 15%. Chị Diệp: "Đây là giá trị thật của tư vấn."', fx: { rep: 5, rel: { diep: { respect: 10 } } } },
        { t: 'Khuyên không mua vì thị trường trà sữa "đã bão hoà"', out: 'Kết luận thiếu dữ liệu chứng minh — thị trường vẫn tăng trưởng.', fx: { rep: -1 } },
      ] },
    ],
    rewards: { xp: 70, rep: 2, items: ['decor_issuetree'], rel: { diep: { respect: 5 } } },
  },
  {
    id: 'k_cs_transform', title: 'Chuyển đổi hiệu suất: Siêu thị Hoa Cau', kind: 'career', chapter: 'career', career: 'cs', giver: 'diep', loc: 'office_cs', age: 23, req: ['k_cs_cdd'],
    summary: 'Dự án cải thiện hiệu suất cho một chuỗi siêu thị: tìm đòn bẩy, xây business case (payback, NPV) và dẫn dắt thay đổi một cách trung thực.',
    steps: [
      { type: 'say', lines: [['diep', 'Hoa Cau có 80 siêu thị, biên lợi nhuận đang giảm. CEO muốn một chương trình chuyển đổi. Ta cần tìm đòn bẩy lớn nhất, định lượng, và đảm bảo nó thực sự được triển khai.']], terms: ['Business Case'] },
      { type: 'sort', id: 'k_cst_levers', concept: 'transformation', q: 'Phân loại sáng kiến theo thời gian tạo giá trị:', cats: ['Quick win (< 6 tháng)', 'Cấu trúc (6–24 tháng)'],
        items: [['Loại bỏ 20% SKU bán chậm nhất (chỉ chiếm 3% doanh thu)', 0], ['Đàm phán lại giá với 10 nhà cung cấp lớn nhất', 0], ['Xây trung tâm phân phối mới thay cho giao hàng trực tiếp', 1], ['Tối ưu ca làm việc theo lưu lượng khách', 0], ['Thay hệ thống ERP và dự báo nhu cầu', 1]],
        fb: fb('Quick wins tạo đà và nguồn tiền; sáng kiến cấu trúc tạo giá trị bền vững.', 'Sequence quick wins to fund structural changes.', 'Thời gian triển khai và độ phức tạp.', 'Chương trình chuyển đổi thất bại thường vì thiếu quick wins để giữ niềm tin.', 'Transformation roadmap', 'Chuyển đổi hiệu suất') },
      { type: 'num', id: 'k_cst_payback', concept: 'transformation', q: 'Chương trình tiết kiệm 18 tỷ/năm, chi phí triển khai một lần 24 tỷ. Thời gian hoàn vốn (năm, 2 chữ số thập phân)?', a: r2(TR.payback), tol: 0.01, unit: 'năm', fb: fb('24 / 18 ≈ 1,33 năm.', 'Payback = one-off cost / annual savings.', 'Chia chi phí cho tiết kiệm năm.', 'Dưới 2 năm thường được hội đồng quản trị chấp thuận nhanh.', 'Payback', 'Chuyển đổi hiệu suất') },
      { type: 'num', id: 'k_cst_npv', concept: 'transformation', q: 'NPV của business case trong 5 năm với tỷ lệ chiết khấu 10% (tỷ đồng, 2 chữ số thập phân)?', a: r2(TR.npv), tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 66, why: 'Bạn cộng tiết kiệm không chiết khấu (5 × 18 − 24). Phải quy về hiện tại.' }],
        fb: fb(`−24 + 18 × (1 − 1,1⁻⁵) / 0,1 ≈ ${r2(TR.npv)}.`, 'NPV discounts future savings at the cost of capital.', 'Hệ số niên kim 5 năm 10% ≈ 3,791.', 'NPV dương lớn → ưu tiên cao trong danh mục sáng kiến.', 'NPV', 'Chuyển đổi hiệu suất') },
      { type: 'choice', id: 'k_cst_cfo', q: 'CFO của Hoa Cau đề nghị trình hội đồng con số tiết kiệm 30 tỷ "cho ấn tượng". Bạn:', grade: true, best: [1], opts: [
        { t: 'Đồng ý — khách hàng là thượng đế', out: 'Một năm sau, chương trình "chỉ" tiết kiệm 18 tỷ và bị xem là thất bại. Uy tín của bạn và CFO đều bị ảnh hưởng.', fx: { stats: { ethics: -10 }, rep: -3 } },
        { t: 'Trình bày 18 tỷ là base case đã kiểm chứng, kèm upside 25 tỷ có điều kiện rõ ràng', out: 'Hội đồng đánh giá cao sự minh bạch. Chương trình vượt base case và được xem là thành công.', fx: { stats: { ethics: 5 }, rep: 4, rel: { diep: { trust: 6 } } } },
      ] },
      { type: 'choice', id: 'k_cst_change', q: 'Quản lý cửa hàng phản đối việc cắt SKU vì sợ mất khách. Cách triển khai tốt nhất?', grade: true, best: [1], opts: [
        { t: 'Ra lệnh từ trụ sở, áp dụng đồng loạt 80 siêu thị', out: 'Nhiều cửa hàng "lách" quy định; tiết kiệm chỉ đạt 40%.' },
        { t: 'Thí điểm ở 8 cửa hàng, đo doanh thu và mức hài lòng, để quản lý cửa hàng đồng thiết kế, rồi nhân rộng với KPI rõ ràng', out: 'Dữ liệu thí điểm cho thấy doanh thu không giảm. Các quản lý trở thành người ủng hộ chương trình.' },
      ] },
    ],
    rewards: { xp: 60, rep: 2, rel: { diep: { respect: 5 } } },
  },
  {
    id: 'k_cs_economics', title: 'Kinh tế học dự án: định giá, staffing & scope creep', kind: 'career', chapter: 'career', career: 'cs', giver: 'diep', loc: 'office_cs', age: 23, req: ['k_cs_cdd'],
    summary: 'Viết proposal, định phí, staffing theo kim tự tháp và bảo vệ margin khi khách hàng muốn thêm phạm vi miễn phí.',
    steps: [
      { type: 'say', lines: [['diep', 'Em sắp làm Engagement Manager. Proposal mới: 10 tuần, 50 giờ/tuần. Đội: 1 Partner 10% thời gian (bill 600 USD/h, cost 250), 1 Manager toàn thời gian (300/110), 3 Consultants (200/70).'], ['diep', 'Tư vấn là kinh doanh thời gian. Utilization, realization và leverage quyết định ta có lãi hay không.']], terms: ['Leverage (Consulting)', 'Scope Creep'] },
      { type: 'num', id: 'k_cse_fees', concept: 'consulting_metrics', q: 'Phí tiêu chuẩn (standard fees) của dự án (USD)?', a: ENG.standard, tol: 1, unit: 'USD', traps: [{ v: 507000, why: 'Partner chỉ dành 10% thời gian: 50 giờ, không phải 500 giờ.' }],
        fb: fb('Partner 50h × 600 = 30.000; Manager 500h × 300 = 150.000; Consultants 1.500h × 200 = 300.000 → 480.000.', 'Standard fees = Σ hours × bill rate.', 'Giờ × giá cho từng cấp.', 'Đây là "giá niêm yết" trước chiết khấu.', 'Pricing', 'Kinh tế học dự án') },
      { type: 'num', id: 'k_cse_margin', concept: 'consulting_metrics', q: 'Khách hàng được chiết khấu 10% (realization 90%). Contribution margin (%, 1 chữ số thập phân)?', a: r1(ENG.margin * 100), tol: 0.1, unit: '%',
        fb: fb(`Phí thu = 432.000; chi phí = 12.500 + 55.000 + 105.000 = 172.500; margin ≈ ${r1(ENG.margin * 100)}%.`, 'Contribution margin = (fees − delivery cost) / fees.', 'Chi phí theo cost rate của từng cấp.', 'Margin dự án phải đủ bù chi phí chung, bán hàng và đào tạo.', 'Realization, Margin', 'Kinh tế học dự án') },
      { type: 'model', id: 'k_cse_wb', model: 'engagement', concept: 'consulting_metrics', goal: { text: `Workbench: khách hàng đòi thêm chiết khấu. Tìm realization (%) THẤP NHẤT mà margin vẫn ≥ 55% (3 consultants, 10 tuần, partner 10%).`, check: (o, v) => v.realization === ENG_GOAL && v.consultants === 3 && v.weeks === 10 && v.partnerPct === 10 } },
      { type: 'choice', id: 'k_cse_scope', q: 'Tuần 6, khách hàng yêu cầu thêm một workstream phân tích kênh online (≈ 2 consultants × 2 tuần) "vì cũng liên quan mà". Bạn:', grade: true, best: [1], opts: [
        { t: 'Làm luôn miễn phí để khách hàng vui', out: 'Đội làm thêm giờ, margin giảm còn ~51% và chất lượng workstream chính bị ảnh hưởng.', v: { scope: 'free' }, fx: { stats: { wellbeing: -10 } } },
        { t: 'Ghi nhận giá trị của yêu cầu, đề xuất change order có phí và lịch rõ ràng', out: 'Khách hàng đồng ý ngồi lại thương lượng.', v: { scope: 'co' } },
        { t: 'Từ chối thẳng: "Ngoài phạm vi hợp đồng."', out: 'Đúng về hợp đồng, nhưng khách hàng thấy bạn cứng nhắc.', v: { scope: 'no' }, fx: { rel: { diep: { respect: -2 } } } },
      ] },
      { type: 'negotiate', id: 'k_cse_neg', who: 'diep', role: 'sell', when: (rt) => rt.vars.scope === 'co', concept: 'negotiation', unit: 'USD', ask: 10000, reservation: 36000, min: 0, max: 50000, step: 1000, start: 40000, rounds: 4, concession: 0.45, insult: 1.3,
        intro: 'Bạn đàm phán change order với giám đốc khách hàng (chị Diệp đóng vai khách hàng để huấn luyện bạn). Giá tiêu chuẩn của phần việc thêm: 40.000 USD. Khách hàng mở đầu ở 10.000.',
        batna: 'Giữ nguyên phạm vi ban đầu và đưa workstream mới vào đề xuất Phase 2.',
        issues: [{ id: 'phase2', t: 'Cam kết ưu tiên đội hiện tại cho Phase 2', v: 4000 }, { id: 'slip', t: 'Lùi hạn bàn giao workstream mới thêm 1 tuần', v: 2000 }] },
      { type: 'outcome', id: 'k_cse_out', eval: (rt, S, sc) => {
        const n = rt.vars.k_cse_neg;
        if (rt.vars.scope === 'free') return { text: 'Dự án hoàn thành nhưng margin thấp hơn kế hoạch và đội kiệt sức. Chị Diệp: "Làm miễn phí dạy khách hàng rằng công sức của ta không có giá."', fx: { rep: 0 }, score: sc };
        if (rt.vars.scope === 'no') return { text: 'Phạm vi được bảo vệ, nhưng bạn bỏ lỡ cơ hội mở rộng dự án. Chị Diệp: "Bảo vệ phạm vi đúng, nhưng hãy biến yêu cầu thành cơ hội."', fx: { rep: 1, items: ['cert_cs'] }, score: sc };
        if (n?.deal) return { text: `Change order ký ở ${n.price.toLocaleString('vi-VN')} USD. Margin dự án được giữ, khách hàng hài lòng vì phạm vi và chi phí minh bạch.`, fx: { rep: 5, items: ['cert_cs'], rel: { diep: { respect: 8 } } }, score: sc };
        return { text: 'Hai bên không thống nhất giá; workstream được chuyển sang Phase 2. Quan hệ vẫn tốt.', fx: { rep: 2, items: ['cert_cs'] }, score: sc };
      } },
    ],
    rewards: { xp: 70, rep: 2 },
  },
];

// Industry Mastery Academy missions — one per priority sector, following the A–F framework.
// All companies and figures are fictional Simulation Assumptions; answers are computed by the finance engine.
import * as F from '../engine/finance.js';
import { clinicParams, solarParams, reParams, saasParams, aiParams } from './models.js';

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- precomputed answers ----------
const HC = { visits: 120000, arpv: 0.5, capacity: 150000, margin: 0.18, multiple: 12, insShare: 0.6, cut: 0.1 };
HC.revenue = (HC.visits * HC.arpv) / 1000;                 // tỷ đồng: 60
HC.util = HC.visits / HC.capacity;                         // 80%
HC.ebitda = HC.revenue * HC.margin;                        // 10.8
HC.ev = HC.ebitda * HC.multiple;                           // 129.6
HC.ebitdaCut = HC.ebitda - HC.revenue * HC.insShare * HC.cut; // 7.2 (costs fixed)
const ED = { students: 2000, tuition: 120, retention: 0.92, capacity: 2500 };
ED.revenue = (ED.students * ED.tuition) / 1000;            // 240 tỷ
ED.newNeeded = ED.students * (1 - ED.retention);           // 160
ED.occupancy = ED.students / ED.capacity;                  // 80%
const CS = { billable: 1350, available: 1800, rate: 150, realization: 0.9, pipeline: 50, win: 0.3 };
CS.util = CS.billable / CS.available;                      // 75%
CS.revPerHead = CS.billable * CS.rate * CS.realization;    // 182,250 USD
CS.weighted = CS.pipeline * CS.win;                        // 15
const EN = { mw: 50, cf: 0.18, ppa: 70, opex: 1.0, capex: 45, years: 20, debtService: 3.2 };
EN.mwh = F.energyMWh(EN.mw, EN.cf);                        // 78,840
EN.revenue = (EN.mwh * EN.ppa) / 1e6;                      // 5.5188 M USD
EN.ebitda = EN.revenue - EN.opex;                          // 4.5188
EN.dscr = F.dscr(EN.ebitda, EN.debtService);               // 1.41
EN.irr = F.annuityIrr(EN.capex, EN.ebitda, EN.years);      // ≈ 7.8%
const RE = { grossRent: 12, vacancy: 0.1, opex: 3, cap: 0.065, capShock: 0.075, ltv: 0.6, rate: 0.06 };
RE.noi = F.noi(RE);                                        // 7.8
RE.value = F.capValue(RE.noi, RE.cap);                     // 120
RE.loan = RE.value * RE.ltv;                               // 72
RE.dscr = F.dscr(RE.noi, RE.loan * RE.rate);               // 1.81 (interest-only)
RE.valueShock = F.capValue(RE.noi, RE.capShock);           // 104
RE.equityDrop = 1 - (RE.valueShock - RE.loan) / (RE.value - RE.loan); // 33.3%
const AI = { revenue: 10, inference: 4, otherCogs: 1 };
AI.gm = (AI.revenue - AI.inference - AI.otherCogs) / AI.revenue;            // 50%
AI.gmCheaper = (AI.revenue - AI.inference / 2 - AI.otherCogs) / AI.revenue; // 70%
const SA = { growth: 30, fcf: 5, arpa: 20000, gm: 0.8, churn: 0.1, cac: 40000 };
SA.r40 = F.ruleOf40(SA.growth, SA.fcf);                    // 35
SA.ltv = F.customerLtv({ arpa: SA.arpa, grossMargin: SA.gm, churn: SA.churn }); // 160,000
SA.ltvCac = SA.ltv / SA.cac;                               // 4x

// Workbench goal targets (searched over the slider grids, so a solution always exists on-screen).
const range = (a, b, s) => Array.from({ length: Math.round((b - a) / s) + 1 }, (_, i) => Math.round((a + i * s) * 100) / 100);
const HC_BASE = { clinics: 6, visits: 20, price: 500, ins: 60, cut: 0, loss: 0 };
const EN_BASE = { cf: 18, ppa: 70, debt: 70, rate: 6 };
const RE_BASE = { vac: 10, growth: 3, ltv: 60, rate: 6, exitCap: 6.5 };
const SA_BASE = { nrr: 110, newArr: 10, magic: 0.5 };
const AI_BASE = { users: 10, price: 1000, queries: 2000, cost: 20 };
const GOALS = {
  hcVisits: range(12, 25, 1).find((x) => F.clinicModel(clinicParams({ ...HC_BASE, visits: x, cut: 10 })).ebitda >= 0),
  enDebt: [...range(0, 85, 5)].reverse().find((d) => F.solarProject(solarParams({ ...EN_BASE, debt: d })).minDscr >= 1.3),
  reCap: [...range(5, 9, 0.25)].reverse().find((c) => F.realEstateInvestment(reParams({ ...RE_BASE, exitCap: c })).irr >= 0.1),
  saNrr: range(85, 135, 1).find((n) => F.saasModel(saasParams({ ...SA_BASE, nrr: n })).rows[0].r40 >= 40),
  aiCost: [...range(2, 40, 1)].reverse().find((c) => F.aiEconomics(aiParams({ ...AI_BASE, cost: c })).gm >= 0.7),
};
const same = (v, base, except) => Object.keys(base).every((k) => k === except || v[k] === base[k]);

export const INDUSTRY_ANSWERS = { HC, ED, CS, EN, RE, AI, SA, GOALS, HC_BASE, EN_BASE, RE_BASE, SA_BASE, AI_BASE };

const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

export const INDUSTRY_QUESTS = [
  {
    id: 'a_healthcare', sector: 'healthcare', title: 'Học viện Y tế: Chuỗi phòng khám An Khang', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: 'phuong', loc: 'academy',
    summary: 'Đánh giá mua một chuỗi phòng khám: lượt khám, payer mix, công suất, chi phí nhân sự và rủi ro hoàn trả bảo hiểm.',
    steps: [
      { type: 'say', lines: [['phuong', 'Chào em, chị là Phương — chuyên gia đầu tư y tế. Y tế không giống bán lẻ: người dùng dịch vụ (bệnh nhân) thường không phải người trả tiền (bảo hiểm).'], ['phuong', 'Mục tiêu: chuỗi An Khang, 6 phòng khám đa khoa. Ta đi qua đủ 6 bước của khung phân tích ngành.']], terms: ['Payer Mix'] },
      { type: 'sort', id: 'a_hc_chain', concept: 'sector_healthcare', q: '[A. Industry Fundamentals] Xếp các bên vào chuỗi giá trị y tế:', cats: ['Người cung cấp dịch vụ', 'Người chi trả', 'Nhà cung ứng'],
        items: [['Phòng khám, bệnh viện', 0], ['Bảo hiểm y tế xã hội', 1], ['Công ty dược phẩm', 2], ['Bảo hiểm sức khoẻ tư nhân', 1], ['Nhà cung cấp thiết bị chẩn đoán', 2], ['Bác sĩ hành nghề tại phòng khám', 0]],
        fb: fb('Dòng tiền y tế chảy từ người chi trả (bảo hiểm, bệnh nhân) đến người cung cấp, rồi đến nhà cung ứng.', 'Healthcare value chain: payers → providers → suppliers.', 'Hỏi: ai trả tiền, ai cung cấp dịch vụ, ai bán đầu vào?', 'Quyền lực đàm phán của người chi trả quyết định giá dịch vụ.', 'Payer mix, Reimbursement', 'Học viện Y tế') },
      { type: 'num', id: 'a_hc_rev', concept: 'sector_healthcare', q: '[B. Business Economics] 120.000 lượt khám/năm, doanh thu trung bình 0,5 triệu đồng/lượt. Doanh thu năm (tỷ đồng)?', a: HC.revenue, tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 60000, why: 'Đó là triệu đồng — đổi sang tỷ đồng (÷ 1.000).' }],
        fb: fb('120.000 × 0,5 triệu = 60.000 triệu = 60 tỷ.', 'Revenue = patient volume × revenue per visit.', 'Hai động lực doanh thu chính.', 'Tăng trưởng đến từ lượt khám (công suất, bác sĩ) hoặc giá (payer mix, dịch vụ).', 'Unit economics', 'Học viện Y tế') },
      { type: 'num', id: 'a_hc_util', concept: 'sector_healthcare', q: '[B] Công suất tối đa 150.000 lượt/năm. Tỷ lệ sử dụng công suất (%)?', a: Math.round(HC.util * 100), tol: 0.5, unit: '%',
        fb: fb('120.000 / 150.000 = 80%.', 'Utilization = actual volume / capacity.', 'Phòng khám có chi phí cố định cao (bác sĩ, mặt bằng).', 'Tăng công suất từ 80% lên 90% gần như là lợi nhuận thuần — operating leverage.', 'Operating leverage', 'Học viện Y tế') },
      { type: 'quiz', id: 'a_hc_comp', concept: 'sector_healthcare', q: '[C. Competitive Dynamics] Rủi ro cạnh tranh đặc thù nhất của một chuỗi phòng khám?', opts: ['Đối thủ giảm giá thuốc', 'Phụ thuộc vào một số bác sĩ nổi tiếng — nếu họ rời đi, bệnh nhân đi theo', 'Thiếu quảng cáo trên mạng xã hội'], a: 1,
        fb: fb('Bệnh nhân thường trung thành với bác sĩ hơn với thương hiệu.', 'Physician concentration and retention are key competitive risks.', 'Tài sản cốt lõi là con người.', 'Thương vụ cần retention bonus, cổ phần cho bác sĩ chủ chốt, non-compete hợp lý.', 'Doctor retention', 'Học viện Y tế') },
      { type: 'model', id: 'a_hc_wb', model: 'healthcare', concept: 'sector_healthcare', goal: { text: 'Workbench: giả sử bảo hiểm cắt giá 10%. Tìm số lượt khám/phòng khám (nghìn) THẤP NHẤT để EBITDA vẫn ≥ 0 (giữ nguyên các giả định khác).', check: (o, v) => v.visits === GOALS.hcVisits && same(v, { ...HC_BASE, cut: 10 }, 'visits') } },
      { type: 'num', id: 'a_hc_cut', concept: 'sector_healthcare', q: '[D. Financial Analysis] Biên EBITDA 18% (EBITDA 10,8 tỷ). 60% doanh thu đến từ bảo hiểm. Nếu bảo hiểm cắt giá hoàn trả 10% và chi phí không đổi, EBITDA mới (tỷ đồng)?', a: r1(HC.ebitdaCut), tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 9.72, why: 'Bạn giảm EBITDA 10% — nhưng doanh thu mất 3,6 tỷ trong khi chi phí giữ nguyên, nên EBITDA giảm đúng 3,6 tỷ.' }],
        fb: fb('Doanh thu mất 60 × 60% × 10% = 3,6 tỷ; EBITDA 10,8 − 3,6 = 7,2 (giảm 33%).', 'Reimbursement cuts flow straight through to EBITDA when costs are fixed.', 'Doanh thu giảm, chi phí không đổi.', 'Payer mix tập trung là rủi ro định giá lớn — cần downside case.', 'Payer concentration, EBITDA quality', 'Học viện Y tế') },
      { type: 'choice', id: 'a_hc_strat', q: '[E. Strategic Opportunities] Chiến lược tăng trưởng bạn ưu tiên sau khi mua?', grade: true, best: [1], opts: [
        { t: 'Mở ngay 10 phòng khám mới ở tỉnh khác', out: 'Tốn capex lớn khi 6 phòng khám hiện tại mới chạy 80% công suất.' },
        { t: 'Lấp đầy công suất hiện có (mở rộng giờ khám, thêm chuyên khoa), đa dạng payer mix sang bảo hiểm tư nhân và gói khám doanh nghiệp', out: 'Tăng EBITDA với ít vốn nhất và giảm phụ thuộc vào một người chi trả.' },
        { t: 'Cắt lương bác sĩ để tăng biên lợi nhuận', out: 'Bác sĩ giỏi rời đi, lượt khám giảm mạnh.' },
      ] },
      { type: 'quiz', id: 'a_hc_expert', concept: 'sector_healthcare', q: '[F. Expert-Level Assessment] Câu nào là luận điểm đầu tư mạnh nhất cho An Khang?', opts: ['"Y tế luôn tăng trưởng, không thể thua lỗ."', '"Mua ở 12x EBITDA đã điều chỉnh; giá trị đến từ lấp đầy công suất và đa dạng payer mix; rủi ro chính là cắt giá bảo hiểm (downside: EBITDA −33%) và mất bác sĩ — được giảm thiểu bằng cơ chế giữ chân."', '"Giá rẻ hơn đối thủ niêm yết nên chắc chắn lời."'], a: 1,
        fb: fb('Luận điểm tốt nêu giá, nguồn tạo giá trị, rủi ro định lượng và biện pháp giảm thiểu.', 'An expert thesis links valuation, value drivers, quantified downside and mitigants.', 'Có số, có rủi ro, có hành động.', 'Đây là chuẩn của một IC memo.', 'Investment thesis', 'Học viện Y tế') },
    ],
    rewards: { xp: 50, rep: 2, rel: { phuong: { respect: 8, trust: 5 } } },
  },
  {
    id: 'a_education', sector: 'education', title: 'Học viện Giáo dục: Hệ thống trường Hạt Dẻ', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: null, obj: 'booth_edu', loc: 'academy',
    summary: 'Định giá một chuỗi trường tư: số học sinh, học phí, giữ chân, công suất lấp đầy, quy định và capex mở rộng.',
    steps: [
      { type: 'say', lines: [['nar', 'Gian hàng Giáo dục. Hệ thống trường song ngữ Hạt Dẻ: 2.000 học sinh, học phí 120 triệu đồng/năm, sức chứa 2.500.'], ['nar', 'Giáo dục có dòng tiền rất đặc biệt: phụ huynh thường đóng học phí trước — doanh nghiệp nhận tiền trước khi cung cấp dịch vụ.']] },
      { type: 'sort', id: 'a_ed_model', concept: 'sector_education', q: '[A. Industry Fundamentals] Phân loại mô hình doanh thu:', cats: ['Doanh thu định kỳ (học phí)', 'Doanh thu phụ trợ', 'Không phải doanh thu'],
        items: [['Học phí chính khoá theo năm', 0], ['Xe đưa đón, bán trú', 1], ['Tiền đặt cọc giữ chỗ (sẽ hoàn lại)', 2], ['Phí thuê bao phần mềm học tập cho trường khác', 0], ['Trại hè, ngoại khoá', 1]],
        fb: fb('Học phí là doanh thu định kỳ cốt lõi; tiền cọc hoàn lại là nợ phải trả, không phải doanh thu.', 'Tuition is recurring; refundable deposits are liabilities, not revenue.', 'Hỏi: đã cung cấp dịch vụ chưa, có phải hoàn lại không?', 'Deferred revenue tạo working capital âm có lợi cho trường.', 'Deferred revenue', 'Học viện Giáo dục') },
      { type: 'num', id: 'a_ed_rev', concept: 'sector_education', q: '[B. Business Economics] Doanh thu học phí năm (tỷ đồng)?', a: ED.revenue, tol: 0.05, unit: 'tỷ đồng', fb: fb('2.000 × 120 triệu = 240.000 triệu = 240 tỷ.', 'Revenue = enrolment × tuition.', 'Hai động lực: số học sinh và học phí.', 'Học phí tăng đều mỗi năm là đòn bẩy quan trọng — nếu quy định cho phép.', 'Revenue per student', 'Học viện Giáo dục') },
      { type: 'num', id: 'a_ed_new', concept: 'sector_education', q: '[B] Tỷ lệ giữ chân 92%. Cần tuyển mới bao nhiêu học sinh chỉ để giữ nguyên quy mô 2.000?', a: ED.newNeeded, tol: 0.5, unit: 'học sinh', fb: fb('2.000 × (1 − 92%) = 160 học sinh.', 'Replacement enrolment = base × (1 − retention).', 'Học sinh rời đi phải được bù.', 'Mỗi điểm % retention tiết kiệm chi phí tuyển sinh và ổn định doanh thu.', 'Retention, Student lifetime value', 'Học viện Giáo dục') },
      { type: 'quiz', id: 'a_ed_reg', concept: 'sector_education', q: '[C. Competitive Dynamics] Rào cản gia nhập lớn nhất trong giáo dục K-12 tư thục?', opts: ['Chi phí quảng cáo', 'Giấy phép, quỹ đất và uy tín tích luỹ nhiều năm — phụ huynh không "thử" trường mới cho con dễ dàng', 'Giá máy tính'], a: 1, fb: fb('Niềm tin của phụ huynh và giấy phép là rào cản bền vững.', 'Licensing, land and reputation create durable barriers to entry.', 'Chi phí chuyển đổi cao về cảm xúc và học tập.', 'Nhưng quy định cũng là rủi ro: trần học phí, yêu cầu chương trình.', 'Regulation, Switching costs', 'Học viện Giáo dục') },
      { type: 'num', id: 'a_ed_occ', concept: 'sector_education', q: '[D. Financial Analysis] Tỷ lệ lấp đầy (occupancy, %)?', a: Math.round(ED.occupancy * 100), tol: 0.5, unit: '%', fb: fb('2.000 / 2.500 = 80%.', 'Occupancy = enrolment / capacity.', 'Chi phí cơ sở vật chất cố định.', 'Còn 500 chỗ trống — tăng trưởng không cần capex.', 'Utilization', 'Học viện Giáo dục') },
      { type: 'choice', id: 'a_ed_capex', q: '[E. Strategic Opportunities] Ban lãnh đạo muốn xây campus mới 150 tỷ (800 chỗ, cần 3 năm để lấp đầy). Bạn khuyến nghị:', grade: true, best: [1], opts: [
        { t: 'Xây ngay — giáo dục luôn tăng trưởng', out: 'Campus mới chỉ đạt 40% lấp đầy năm đầu, kéo biên lợi nhuận và dòng tiền xuống.' },
        { t: 'Ưu tiên lấp đầy 500 chỗ trống hiện có; xây campus mới khi lấp đầy > 90% và có danh sách chờ chứng minh nhu cầu', out: 'Tăng trưởng với vốn thấp; quyết định capex dựa trên bằng chứng nhu cầu.' },
      ] },
      { type: 'quiz', id: 'a_ed_expert', concept: 'sector_education', q: '[F. Expert-Level Assessment] Downside case quan trọng nhất cần mô hình hoá?', opts: ['Giá điện tăng', 'Quy định trần học phí hoặc một sự cố an toàn làm giảm uy tín → retention giảm và tuyển sinh mới chậm lại', 'Giáo viên đi du lịch'], a: 1, fb: fb('Doanh thu giáo dục nhạy với niềm tin và chính sách.', 'Key downside: regulatory tuition caps or reputational events hitting retention.', 'Hai biến cốt lõi: giá và số học sinh.', 'Mô hình nên có kịch bản retention 85% và học phí đóng băng.', 'Downside scenario', 'Học viện Giáo dục') },
    ],
    rewards: { xp: 50, rep: 2 },
  },
  {
    id: 'a_consulting', sector: 'consulting', title: 'Học viện Tư vấn: Kinh tế học của con người', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: null, obj: 'booth_consult', loc: 'academy',
    summary: 'Utilization, realization, doanh thu mỗi consultant, pipeline có trọng số và rủi ro attrition.',
    steps: [
      { type: 'say', lines: [['nar', 'Gian hàng Tư vấn. Trong professional services, sản phẩm là thời gian và chuyên môn của con người — "tài sản về nhà mỗi tối".']], terms: ['Utilization', 'Realization Rate'] },
      { type: 'sort', id: 'a_cs_drivers', concept: 'consulting_metrics', q: '[A. Industry Fundamentals] Phân loại yếu tố:', cats: ['Động lực doanh thu', 'Động lực chi phí'],
        items: [['Số giờ tính phí', 0], ['Bill rate', 0], ['Lương & thưởng consultant', 1], ['Realization rate', 0], ['Chi phí tuyển dụng thay người nghỉ', 1], ['Đào tạo chứng chỉ (Anaplan, OneStream…)', 1]],
        fb: fb('Doanh thu = giờ × giá × realization; chi phí chủ yếu là con người.', 'Revenue = hours × rate × realization; costs are people-driven.', 'Mô hình theo năng lực.', 'Biên lợi nhuận tư vấn phụ thuộc vào utilization và pyramid.', 'Consulting operating model', 'Học viện Tư vấn') },
      { type: 'num', id: 'a_cs_util', concept: 'consulting_metrics', q: '[B. Business Economics] Một consultant có 1.800 giờ khả dụng, tính phí 1.350 giờ. Utilization (%)?', a: Math.round(CS.util * 100), tol: 0.5, unit: '%', fb: fb('1.350 / 1.800 = 75%.', 'Utilization = billable / available hours.', 'Giờ không tính phí: đào tạo, bán hàng, nội bộ.', 'Mỗi điểm % utilization ≈ 1,3% doanh thu.', 'Utilization', 'Học viện Tư vấn') },
      { type: 'num', id: 'a_cs_rev', concept: 'consulting_metrics', q: '[B] Bill rate 150 USD/giờ, realization 90%. Doanh thu mỗi consultant (USD)?', a: CS.revPerHead, tol: 1, unit: 'USD', traps: [{ v: 202500, why: 'Bạn quên realization 90% — không phải mọi giờ đều thu đủ giá.' }], fb: fb('1.350 × 150 × 90% = 182.250 USD.', 'Revenue per consultant = billable hours × rate × realization.', 'Chiết khấu, xoá giờ làm giảm doanh thu thực.', 'So sánh với chi phí/người để thấy biên lợi nhuận.', 'Realization', 'Học viện Tư vấn') },
      { type: 'quiz', id: 'a_cs_comp', concept: 'consulting_metrics', q: '[C. Competitive Dynamics] Lợi thế cạnh tranh bền vững nhất của một hãng tư vấn EPM ngách?', opts: ['Văn phòng đẹp', 'Đội ngũ chứng nhận chuyên sâu + quan hệ đối tác với nền tảng (partner tier) + case study khách hàng — khó sao chép nhanh', 'Giá rẻ nhất thị trường'], a: 1, fb: fb('Chuyên môn hiếm và vị thế đối tác tạo ra lợi thế.', 'Scarce certified talent and platform partnerships create defensibility.', 'Tuyển và đào tạo mất nhiều năm.', 'Đây là lý do M&A tư vấn thường là "mua nhân tài".', 'Ecosystem partnerships', 'Học viện Tư vấn') },
      { type: 'num', id: 'a_cs_pipe', concept: 'consulting_metrics', q: '[D. Financial Analysis] Pipeline 50 triệu USD, tỷ lệ thắng lịch sử 30%. Doanh thu kỳ vọng từ pipeline (triệu USD)?', a: CS.weighted, tol: 0.05, unit: 'triệu USD', fb: fb('50 × 30% = 15 triệu USD.', 'Weighted pipeline = pipeline × win rate.', 'Pipeline thô luôn lạc quan.', 'Kết hợp với backlog đã ký để đánh giá độ phủ doanh thu năm sau.', 'Pipeline conversion, Backlog', 'Học viện Tư vấn') },
      { type: 'choice', id: 'a_cs_strat', q: '[E. Strategic Opportunities] Cách tăng trưởng nhanh nhất mà vẫn giữ chất lượng?', grade: true, best: [1], opts: [
        { t: 'Tăng bill rate 30% ngay', out: 'Khách hàng phản đối; realization giảm.' },
        { t: 'Mua lại practice nhỏ có đội ngũ chứng nhận ở thị trường mới, kèm earn-out giữ chân và kế hoạch cross-sell', out: 'Tăng năng lực và địa bàn nhanh — chính là chiến lược nhiều hãng EPM đang dùng.' },
        { t: 'Tuyển 50 người chưa có kinh nghiệm cùng lúc', out: 'Utilization giảm mạnh vì cần đào tạo; chất lượng dự án bị ảnh hưởng.' },
      ] },
      { type: 'quiz', id: 'a_cs_expert', concept: 'consulting_metrics', q: '[F. Expert-Level Assessment] Khi định giá hãng tư vấn, điều chỉnh quan trọng nhất cho EBITDA?', opts: ['Không cần điều chỉnh', 'Chuẩn hoá lương partner/chủ sở hữu về mức thị trường và loại bỏ doanh thu dự án một lần lớn bất thường', 'Cộng thêm doanh thu pipeline chưa ký'], a: 1, fb: fb('Lương chủ sở hữu và dự án một lần làm méo EBITDA.', 'Normalize owner compensation and one-off projects.', 'Quality of earnings.', 'Pipeline chưa ký không bao giờ là EBITDA.', 'Normalization', 'Học viện Tư vấn') },
    ],
    rewards: { xp: 50, rep: 2 },
  },
  {
    id: 'a_energy', sector: 'energy', title: 'Học viện Năng lượng: Trang trại điện mặt trời Nắng Mai', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: null, obj: 'booth_energy', loc: 'academy',
    summary: 'Sản lượng từ capacity factor, doanh thu PPA, DSCR, project IRR và rủi ro giá thị trường (merchant).',
    steps: [
      { type: 'say', lines: [['nar', 'Gian hàng Năng lượng. Trang trại điện mặt trời Nắng Mai: 50 MW, capacity factor 18%, bán điện theo hợp đồng PPA 20 năm giá 70 USD/MWh. Capex 45 triệu USD, opex 1 triệu USD/năm.']], terms: ['Capacity Factor', 'PPA', 'DSCR'] },
      { type: 'sort', id: 'a_en_rev', concept: 'sector_energy', q: '[A. Industry Fundamentals] Phân loại nguồn doanh thu theo mức độ chắc chắn:', cats: ['Contracted (hợp đồng)', 'Merchant (giá thị trường)'],
        items: [['Bán điện theo PPA 20 năm giá cố định', 0], ['Bán phần sản lượng dư trên thị trường giao ngay', 1], ['Hợp đồng thuê mái nhà dài hạn', 0], ['Chứng chỉ năng lượng tái tạo bán theo giá thị trường', 1]],
        fb: fb('Doanh thu hợp đồng ổn định, vay được nhiều nợ; merchant biến động.', 'Contracted revenue supports leverage; merchant exposure adds price risk.', 'Ai cam kết giá và trong bao lâu?', 'Ngân hàng cho vay dựa trên phần doanh thu hợp đồng.', 'Project finance', 'Học viện Năng lượng') },
      { type: 'num', id: 'a_en_mwh', concept: 'sector_energy', q: '[B. Business Economics] Sản lượng điện mỗi năm (MWh)? (50 MW × 8.760 giờ × capacity factor)', a: EN.mwh, tol: 1, unit: 'MWh', traps: [{ v: 438000, why: 'Bạn quên capacity factor 18% — tấm pin không phát hết công suất cả ngày lẫn đêm.' }],
        fb: fb('50 × 8.760 × 18% = 78.840 MWh.', 'Generation = capacity × hours × capacity factor.', 'Mặt trời chỉ phát điện một phần thời gian.', 'Capacity factor là biến nhạy nhất của doanh thu.', 'Capacity factor', 'Học viện Năng lượng') },
      { type: 'num', id: 'a_en_dscr', concept: 'sector_energy', q: '[D. Financial Analysis] Doanh thu = sản lượng × 70 USD; EBITDA = doanh thu − opex 1 triệu. Nợ phải trả mỗi năm 3,2 triệu USD. DSCR (2 chữ số thập phân)?', a: r2(EN.dscr), tol: 0.02, unit: 'x',
        fb: fb(`Doanh thu ≈ ${r2(EN.revenue)} triệu; EBITDA ≈ ${r2(EN.ebitda)}; DSCR = ${r2(EN.ebitda)} / 3,2 ≈ ${r2(EN.dscr)}x.`, 'DSCR = cash flow available for debt service / debt service.', 'Đơn giản hoá: CFADS ≈ EBITDA (bỏ qua thuế, vốn lưu động).', 'Ngân hàng thường yêu cầu DSCR ≥ 1,3x cho dự án có PPA.', 'Debt sizing', 'Học viện Năng lượng') },
      { type: 'num', id: 'a_en_irr', concept: 'sector_energy', q: '[D] Unlevered project IRR: capex 45 triệu, EBITDA đều trong 20 năm, không giá trị thanh lý. IRR (%, 1 chữ số thập phân, ±0,2)?', a: r1(EN.irr * 100), tol: 0.2, unit: '%',
        fb: fb(`IRR ≈ ${r1(EN.irr * 100)}% — lãi suất làm NPV của −45 và 20 dòng tiền ≈ 4,52 bằng 0.`, 'Project IRR of a level annuity.', 'Tìm r để 45 = 4,52 × hệ số niên kim(r, 20).', 'Lợi nhuận thấp nhưng ổn định — phù hợp nhà đầu tư hạ tầng, và đòn bẩy nâng equity IRR.', 'IRR, Infrastructure returns', 'Học viện Năng lượng') },
      { type: 'model', id: 'a_en_wb', model: 'energy', concept: 'sector_energy', goal: { text: 'Workbench: ngân hàng yêu cầu DSCR tối thiểu ≥ 1,30x. Tìm tỷ lệ nợ CAO NHẤT đạt yêu cầu (PPA 70, CF 18%, lãi 6%). Xem bảng sensitivity để thấy equity IRR thay đổi ra sao.', check: (o, v) => v.debt === GOALS.enDebt && same(v, EN_BASE, 'debt') } },
      { type: 'quiz', id: 'a_en_comp', concept: 'sector_energy', q: '[C. Competitive Dynamics] Khi PPA hết hạn sau 20 năm, rủi ro lớn nhất là gì?', opts: ['Tấm pin bị đánh cắp', 'Rủi ro giá merchant: giá điện thị trường có thể thấp hơn nhiều khi nhiều dự án tái tạo cùng phát vào giờ trưa (cannibalization)', 'Không có rủi ro'], a: 1, fb: fb('Khi điện mặt trời phổ biến, giá giờ trưa giảm — doanh thu merchant thấp.', 'Post-PPA merchant price and solar cannibalization risk.', 'Cung tăng vào cùng một khung giờ.', 'Lưu trữ (pin) có thể dịch chuyển sản lượng sang giờ giá cao.', 'Merchant risk, Storage', 'Học viện Năng lượng') },
      { type: 'choice', id: 'a_en_strat', q: '[E/F] Đề xuất tối ưu nhất cho nhà đầu tư hạ tầng?', grade: true, best: [0], opts: [
        { t: 'Vay nợ theo DSCR 1,3x trên phần contracted, thêm hệ thống pin lưu trữ khi chi phí giảm, và xây platform nhiều dự án để giảm chi phí vận hành', out: 'Cấu trúc vốn hợp lý, giảm rủi ro merchant và tạo quy mô — luận điểm hạ tầng chuẩn.' },
        { t: 'Vay tối đa, giả định giá điện sau PPA tăng 5%/năm', out: 'Giả định lạc quan không có cơ sở — DSCR vỡ khi giá giảm.' },
      ] },
    ],
    rewards: { xp: 50, rep: 2 },
  },
  {
    id: 'a_realestate', sector: 'realestate', title: 'Học viện Bất động sản: Toà nhà văn phòng Lavender', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: null, obj: 'booth_re', loc: 'academy',
    summary: 'NOI, cap rate, LTV, DSCR và tác động của lãi suất lên giá trị vốn chủ.',
    steps: [
      { type: 'say', lines: [['nar', 'Gian hàng Bất động sản. Toà văn phòng Lavender: tiền thuê tối đa 12 tỷ/năm, tỷ lệ trống 10%, chi phí vận hành 3 tỷ. Cap rate thị trường 6,5%.']], terms: ['NOI', 'Cap Rate', 'Loan-to-Value'] },
      { type: 'sort', id: 'a_re_q', concept: 'sector_realestate', q: '[A/C] Yếu tố nào làm TĂNG chất lượng dòng tiền cho thuê?', cats: ['Tăng chất lượng', 'Giảm chất lượng'],
        items: [['Khách thuê là ngân hàng lớn, hợp đồng 10 năm', 0], ['70% diện tích thuê bởi một startup', 1], ['Hợp đồng có điều khoản tăng giá theo lạm phát', 0], ['Nhiều hợp đồng hết hạn cùng một năm', 1]],
        fb: fb('Chất lượng khách thuê, thời hạn còn lại (WALE) và tính đa dạng quyết định độ an toàn của NOI.', 'Tenant credit, lease length and diversification drive income quality.', 'Rủi ro tập trung và rủi ro gia hạn.', 'Cap rate thấp hơn cho dòng tiền an toàn hơn.', 'WALE, Tenant concentration', 'Học viện Bất động sản') },
      { type: 'num', id: 'a_re_noi', concept: 'sector_realestate', q: '[B. Business Economics] NOI (tỷ đồng)?', a: RE.noi, tol: 0.05, unit: 'tỷ đồng', traps: [{ v: 9, why: 'Bạn chưa trừ tỷ lệ trống 10% trước khi trừ chi phí.' }], fb: fb('12 × 90% − 3 = 7,8 tỷ.', 'NOI = effective rental income − operating expenses (before debt and capex).', 'Trừ phần trống rồi trừ opex.', 'NOI là nền tảng định giá bất động sản tạo thu nhập.', 'NOI', 'Học viện Bất động sản') },
      { type: 'num', id: 'a_re_val', concept: 'sector_realestate', q: '[D. Financial Analysis] Giá trị tài sản theo cap rate 6,5% (tỷ đồng)?', a: RE.value, tol: 0.5, unit: 'tỷ đồng', fb: fb('7,8 / 6,5% = 120 tỷ.', 'Value = NOI / cap rate.', 'Định giá trực tiếp.', 'Cap rate giống "lợi suất" — nghịch đảo của bội số.', 'Direct capitalization', 'Học viện Bất động sản') },
      { type: 'num', id: 'a_re_shock', concept: 'sector_realestate', q: '[D] Vay 60% LTV (72 tỷ). Nếu lãi suất tăng làm cap rate lên 7,5%, giá trị vốn chủ giảm bao nhiêu % (±1)?', a: r1(RE.equityDrop * 100), tol: 1, unit: '%', traps: [{ v: 13.3, why: 'Đó là mức giảm giá trị tài sản; vốn chủ giảm mạnh hơn nhiều vì đòn bẩy.' }],
        fb: fb(`Giá trị mới 7,8 / 7,5% = 104. Vốn chủ từ 48 (120 − 72) xuống 32 (104 − 72): giảm ${r1(RE.equityDrop * 100)}%.`, 'Leverage amplifies cap-rate expansion into equity losses.', 'Nợ giữ nguyên, toàn bộ phần giảm rơi vào vốn chủ.', 'Đây là cơ chế khủng hoảng bất động sản khi lãi suất tăng.', 'LTV, Leverage', 'Học viện Bất động sản') },
      { type: 'model', id: 'a_re_wb', model: 'realestate', concept: 'sector_realestate', goal: { text: 'Workbench: quỹ cần equity IRR ≥ 10%. Tìm exit cap rate CAO NHẤT vẫn đạt mục tiêu (các giả định khác giữ nguyên).', check: (o, v) => v.exitCap === GOALS.reCap && same(v, RE_BASE, 'exitCap') } },
      { type: 'choice', id: 'a_re_strat', q: '[E/F] Khuyến nghị cho thương vụ mua Lavender?', grade: true, best: [1], opts: [
        { t: 'Vay 75% LTV để tối đa IRR', out: `DSCR mỏng; một cú sốc cap rate sẽ xoá sạch vốn chủ.` },
        { t: `Giữ LTV ≤ 60% (DSCR ≈ ${r2(RE.dscr)}x), ưu tiên gia hạn sớm khách thuê lớn và giảm tỷ lệ trống — tạo giá trị từ NOI thay vì đòn bẩy`, out: 'Cấu trúc bền vững qua chu kỳ lãi suất.' },
      ] },
    ],
    rewards: { xp: 50, rep: 2 },
  },
  {
    id: 'a_ai', sector: 'ai', title: 'Học viện AI: Kinh tế học của inference', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: 'minhanh', loc: 'academy',
    summary: 'Gross margin của startup AI, chi phí compute, khác biệt mô hình, phân phối và mô hình định giá sản phẩm.',
    steps: [
      { type: 'say', lines: [['minhanh', 'Mình là Minh Anh, chuyên gia công nghệ. Phần mềm truyền thống gần như không tốn chi phí cho mỗi lần dùng. AI thì khác: mỗi câu trả lời tốn tiền GPU.'], ['minhanh', 'Startup "Trợ Lý Xanh": doanh thu 10 triệu USD, chi phí inference 4 triệu, chi phí hosting & hỗ trợ khác 1 triệu.']], terms: ['Inference'] },
      { type: 'sort', id: 'a_ai_stack', concept: 'sector_ai', q: '[A. Industry Fundamentals] Xếp vào tầng của chuỗi giá trị AI:', cats: ['Hạ tầng (compute, chip)', 'Mô hình nền tảng', 'Ứng dụng'],
        items: [['Nhà sản xuất GPU', 0], ['Nhà cung cấp cloud', 0], ['Phòng thí nghiệm huấn luyện mô hình ngôn ngữ lớn', 1], ['Startup trợ lý AI cho kế toán', 2], ['Công cụ AI soạn hợp đồng cho luật sư', 2]],
        fb: fb('Giá trị và rủi ro khác nhau ở từng tầng.', 'AI stack: infrastructure → foundation models → applications.', 'Ai phụ thuộc vào ai?', 'Ứng dụng phụ thuộc chi phí và chính sách của tầng mô hình.', 'Value chain', 'Học viện AI') },
      { type: 'num', id: 'a_ai_gm', concept: 'sector_ai', q: '[B. Business Economics] Gross margin (%)?', a: Math.round(AI.gm * 100), tol: 0.5, unit: '%', fb: fb('(10 − 4 − 1) / 10 = 50%.', 'Gross margin after inference and serving costs.', 'Inference là giá vốn.', 'Thấp hơn nhiều so với SaaS truyền thống (75–80%).', 'AI gross margin', 'Học viện AI') },
      { type: 'num', id: 'a_ai_gm2', concept: 'sector_ai', q: '[D. Financial Analysis] Nếu tối ưu mô hình làm chi phí inference giảm một nửa, gross margin mới (%)?', a: Math.round(AI.gmCheaper * 100), tol: 0.5, unit: '%', fb: fb('(10 − 2 − 1) / 10 = 70%.', 'Inference cost curves drive margin expansion.', 'Mô hình nhỏ hơn, caching, routing.', 'Đường cong chi phí giảm là một phần quan trọng của luận điểm đầu tư AI.', 'Unit economics', 'Học viện AI') },
      { type: 'model', id: 'a_ai_wb', model: 'ai', concept: 'sector_ai', goal: { text: 'Workbench: nhà đầu tư muốn gross margin ≥ 70%. Tìm chi phí inference/truy vấn (cent) CAO NHẤT vẫn đạt mục tiêu.', check: (o, v) => v.cost === GOALS.aiCost && same(v, AI_BASE, 'cost') } },
      { type: 'quiz', id: 'a_ai_moat', concept: 'sector_ai', q: '[C. Competitive Dynamics] Rủi ro lớn nhất của một startup "chỉ bọc giao diện" quanh mô hình của bên khác?', opts: ['Màu logo', 'Nhà cung cấp mô hình hoặc đối thủ lớn có thể tung tính năng tương tự; không có dữ liệu độc quyền, workflow gắn sâu hay kênh phân phối thì khó giữ khách', 'GPU quá nhanh'], a: 1, fb: fb('Khác biệt bền vững đến từ dữ liệu độc quyền, tích hợp sâu vào quy trình và phân phối.', 'Thin wrappers lack defensibility; moats come from proprietary data, workflow integration and distribution.', 'Hỏi: điều gì ngăn người khác làm y hệt trong 3 tháng?', 'Định giá phải chiết khấu rủi ro bị "Sherlock".', 'Moat, Platform risk', 'Học viện AI') },
      { type: 'choice', id: 'a_ai_pricing', q: '[E. Strategic Opportunities] Khách hàng lớn dùng gấp 20 lần khách nhỏ nhưng trả cùng giá theo user. Bạn đề xuất:', grade: true, best: [1], opts: [
        { t: 'Giữ nguyên giá per-seat', out: 'Khách dùng nhiều nhất trở thành khách lỗ nhất.' },
        { t: 'Chuyển sang giá kết hợp: phí nền + theo mức sử dụng, đồng thời giới hạn hợp lý', out: 'Doanh thu gắn với chi phí compute — biên lợi nhuận ổn định hơn khi quy mô tăng.' },
      ] },
      { type: 'quiz', id: 'a_ai_expert', concept: 'sector_ai', q: '[F. Expert-Level Assessment] Khi định giá startup AI theo EV/ARR, điều chỉnh nào hợp lý nhất?', opts: ['Dùng bội số của SaaS 80% gross margin', 'Chiết khấu bội số theo gross margin thấp hơn và mức độ phụ thuộc nhà cung cấp mô hình; thưởng cho retention cao và dữ liệu độc quyền', 'Bội số không quan trọng với AI'], a: 1, fb: fb('ARR có biên 50% không đáng giá bằng ARR có biên 80%.', 'Adjust revenue multiples for gross margin quality and dependency risk.', 'Giá trị nằm ở lợi nhuận gộp, không chỉ doanh thu.', 'So sánh trên EV/Gross Profit giúp công bằng hơn.', 'EV/Gross profit', 'Học viện AI') },
    ],
    rewards: { xp: 50, rep: 2, rel: { minhanh: { respect: 6, trust: 4 } } },
  },
  {
    id: 'a_saas', sector: 'saas', title: 'Học viện SaaS: Rule of 40 & LTV/CAC', kind: 'industry', chapter: 'intern', minChapter: 'intern', giver: 'minhanh', loc: 'academy', req: ['a_ai'],
    summary: 'Đánh giá một công ty SaaS: Rule of 40, LTV/CAC, chất lượng ARR và định giá EV/ARR.',
    steps: [
      { type: 'say', lines: [['minhanh', 'Bài nâng cao: "CloudSổ" — phần mềm kế toán SaaS. Tăng trưởng 30%, biên FCF 5%. Mỗi khách trả 20.000 USD/năm, gross margin 80%, churn 10%/năm, CAC 40.000 USD.']], terms: ['Rule of 40', 'Customer LTV'] },
      { type: 'sort', id: 'a_sa_arr', concept: 'saas_metrics', q: '[A. Industry Fundamentals] Khoản nào được tính vào ARR?', cats: ['Tính vào ARR', 'Không tính'],
        items: [['Thuê bao năm đã ký và đang hoạt động', 0], ['Phí triển khai một lần', 1], ['Thuê bao tháng × 12 của khách đang dùng', 0], ['Hợp đồng đã ký nhưng khách đã báo huỷ cuối kỳ', 1], ['Doanh thu tư vấn theo giờ', 1]],
        fb: fb('ARR chỉ gồm doanh thu định kỳ đang hoạt động.', 'ARR excludes one-off services and churned contracts.', 'Định kỳ + đang hoạt động.', 'ARR bị thổi phồng là red flag phổ biến trong due diligence.', 'ARR quality', 'Học viện SaaS') },
      { type: 'num', id: 'a_sa_r40', concept: 'saas_metrics', q: '[B. Business Economics] Rule of 40 (điểm)?', a: SA.r40, tol: 0, unit: 'điểm', fb: fb('30 + 5 = 35 < 40.', 'Rule of 40 = growth % + FCF margin %.', 'Cân bằng giữa tăng trưởng và lợi nhuận.', 'Dưới 40: cần cải thiện hiệu quả hoặc tăng tốc tăng trưởng.', 'Growth efficiency', 'Học viện SaaS') },
      { type: 'num', id: 'a_sa_ltvcac', concept: 'saas_metrics', q: '[D. Financial Analysis] LTV/CAC (x)? (LTV = ARPA × GM / churn)', a: SA.ltvCac, tol: 0.05, unit: 'x', traps: [{ v: 5, why: 'Bạn dùng doanh thu thay vì lợi nhuận gộp: 20.000 / 10% / 40.000 = 5. Phải nhân gross margin 80%.' }],
        fb: fb('LTV = 20.000 × 80% / 10% = 160.000; / 40.000 = 4x.', 'LTV/CAC above ~3x indicates efficient acquisition.', 'Vòng đời khách trung bình = 1 / churn = 10 năm.', 'Đơn giản hoá: chưa chiết khấu dòng tiền.', 'Unit economics', 'Học viện SaaS') },
      { type: 'model', id: 'a_sa_wb', model: 'saas', concept: 'saas_metrics', goal: { text: 'Workbench: tìm NRR (%) THẤP NHẤT để Rule of 40 năm 1 đạt ≥ 40 (ARR mới 10, magic number 0,5).', check: (o, v) => v.nrr === GOALS.saNrr && same(v, SA_BASE, 'nrr') } },
      { type: 'quiz', id: 'a_sa_comp', concept: 'saas_metrics', q: '[C. Competitive Dynamics] Vì sao phần mềm kế toán có switching cost cao?', opts: ['Vì giao diện đẹp', 'Vì dữ liệu lịch sử, quy trình đóng sổ, tích hợp ngân hàng và đào tạo nhân viên đều gắn vào hệ thống', 'Vì giá rẻ'], a: 1, fb: fb('Chuyển hệ thống "lõi" rất rủi ro với doanh nghiệp.', 'System-of-record software creates high switching costs.', 'Chi phí và rủi ro chuyển đổi.', 'Giải thích churn thấp và quyền tăng giá.', 'Switching costs', 'Học viện SaaS') },
      { type: 'choice', id: 'a_sa_val', q: '[E/F] Peers giao dịch 6–10x ARR. CloudSổ (ARR 50 triệu USD) — mức bội số hợp lý nhất?', grade: true, best: [1], opts: [
        { t: '10x — vì là SaaS', out: 'Rule of 40 dưới chuẩn và tăng trưởng trung bình không biện minh cho cận trên.' },
        { t: 'Khoảng 7–8x: LTV/CAC tốt và switching cost cao, nhưng Rule of 40 = 35 kéo bội số xuống dưới nhóm dẫn đầu', out: 'Định giá được biện minh bằng chỉ số, không bằng nhãn "SaaS".' },
        { t: '3x — phần mềm kế toán nhàm chán', out: 'Bỏ qua chất lượng doanh thu định kỳ.' },
      ] },
    ],
    rewards: { xp: 50, rep: 2, rel: { minhanh: { respect: 6 } } },
  },
];

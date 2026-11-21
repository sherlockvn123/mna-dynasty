// Multi-perspective replays: the same historical deal seen through five professional lenses.
// Lens ids match career tracks so a player's current job earns a "home lens" bonus.
// Every number used for calculation is a Simulation Assumption and is labelled as such in the question.
const r1 = (x) => Math.round(x * 10) / 10;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

export const LENSES = {
  ib: { name: 'Investment Banking', icon: '🏦', npc: 'victor', role: 'Cố vấn bên bán (sell-side advisor)' },
  cd: { name: 'Corporate Development', icon: '🏢', npc: 'hung', role: 'Đội M&A của bên mua' },
  pe: { name: 'Private Equity', icon: '🌿', npc: 'sophia', role: 'Quỹ buyout — người mua tài chính' },
  cs: { name: 'Consulting', icon: '🧭', npc: 'diep', role: 'Tư vấn tích hợp sau sáp nhập (PMI)' },
  im: { name: 'Public Investor', icon: '📈', npc: 'tung', role: 'Nhà đầu tư cổ phiếu niêm yết' },
};
export const LENS_ORDER = ['ib', 'cd', 'pe', 'cs', 'im'];

const A = {
  // Disney / Pixar — sim: Disney 25 → 22 USD, 2,000m Disney shares, 120m Pixar shares, NI 2.5bn / 0.2bn, EBITDA 0.3bn
  disIbVal: 2.3 * 22,
  disCdOwn: (120 * 2.3) / (2000 + 120 * 2.3) * 100,
  disPeEq: (7.4 - 5 * 0.3) / 7.4 * 100,
  disCsEbit: 500 * 0.3,
  disImEps: ((2.5 + 0.2) / (2000 + 276) / (2.5 / 2000) - 1) * 100,
  // Amazon / Whole Foods — sim: rival 44 USD at 80% certainty, fallback 33.1; 460 stores × 30m; EBITDA 1.1bn; revenue 16bn, GM 34% → 32%
  wfmIbRisk: 0.8 * 44 + 0.2 * 33.1,
  wfmCdBuild: 460 * 0.03,
  wfmPeMult: 13.7 / 1.1,
  wfmCsRev: (0.34 / 0.32 - 1) * 100,
  wfmImHit: 0.1 * -9,
};
export const REPLAY_ANSWERS = A;

const base = (id, kase, lens, title, summary, req) => ({ id, kind: 'replay', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: kase, lens, optional: true, req: [req], title: `${LENSES[lens].icon} ${title}`, summary });

export const REPLAY_QUESTS = [
  // ───────── Disney / Pixar (2006) ─────────
  { ...base('r_dis_ib', 'disney_pixar', 'ib', 'Disney/Pixar qua lăng kính IB', 'Bạn cố vấn cho Hội đồng quản trị Pixar: tỷ lệ hoán đổi cố định bảo vệ ai?', 'h_disney'),
    steps: [
      { type: 'say', lines: [['victor', 'Giả sử chúng ta cố vấn cho Pixar. Thù lao là cổ phiếu Disney theo tỷ lệ cố định 2,3 — Verified Fact. Việc của ta: giải thích cho Hội đồng quản trị rủi ro giữa ngày ký và ngày hoàn tất.']] },
      { type: 'num', id: 'r_dis_ib_v', concept: 'stock_deal', q: '[Simulation Assumption] Giá Disney giảm từ 25 xuống 22 USD trước ngày hoàn tất. Giá trị mỗi cổ phiếu Pixar (USD, 1 chữ số)?', a: r1(A.disIbVal), tol: 0.1, unit: 'USD', fb: fb('2,3 × 22 = 50,6 USD — giảm 6,9 USD so với 57,5.', 'With a fixed exchange ratio, the seller bears acquirer price risk until closing.', 'Tỷ lệ × giá mới.', 'Bên bán có thể đàm phán collar (biên độ) để giới hạn rủi ro này.', 'Fixed ratio & collar', 'Disney/Pixar — IB') },
      { type: 'quiz', id: 'r_dis_ib_q', concept: 'governance', q: 'Fairness opinion của ngân hàng cố vấn trả lời câu hỏi gì?', opts: ['Thương vụ chắc chắn thành công', 'Mức giá, về mặt tài chính, có công bằng với cổ đông bên bán hay không, dựa trên các phương pháp định giá', 'Bên mua có đủ tiền không'], a: 1, fb: fb('Fairness opinion là ý kiến về giá, không phải bảo đảm kết quả.', 'A fairness opinion addresses financial fairness of consideration to shareholders.', 'Phạm vi trách nhiệm của IB.', 'Hội đồng quản trị dùng nó để thực hiện nghĩa vụ ủy thác.', 'Fairness opinion', 'Disney/Pixar — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_dis_cd', 'disney_pixar', 'cd', 'Disney/Pixar qua lăng kính Corp Dev', 'Bạn ở đội M&A của Disney: mua hay tự xây, và trả bằng bao nhiêu phần công ty?', 'h_disney'),
    steps: [
      { type: 'say', lines: [['hung', 'Ở Corp Dev, câu hỏi đầu tiên luôn là: tự xây được không? Nếu không — ta sẵn sàng nhường bao nhiêu phần công ty cho cổ đông bên bán?']] },
      { type: 'num', id: 'r_dis_cd_o', concept: 'stock_deal', q: '[Simulation Assumption] Disney có 2.000 triệu cổ phiếu; Pixar 120 triệu cổ phiếu × 2,3. Cổ đông Pixar sở hữu bao nhiêu % công ty hợp nhất (1 chữ số)?', a: r1(A.disCdOwn), tol: 0.1, unit: '%', fb: fb('276 / (2.000 + 276) ≈ 12,1%.', 'Pro forma ownership = new shares / total shares after issuance.', 'Cộng cổ phiếu phát hành mới vào mẫu số.', 'Trả bằng cổ phiếu là "bán" một phần công ty mình.', 'Pro forma ownership', 'Disney/Pixar — Corp Dev') },
      { type: 'choice', id: 'r_dis_cd_c', q: 'Lập luận "buy vs build" thuyết phục nhất trình lên Hội đồng quản trị Disney:', grade: true, best: [0], opts: [
        { t: 'Năng lực sáng tạo và đội ngũ đã chứng minh rất khó tự xây trong thời gian hợp lý; mua giúp tiết kiệm nhiều năm và giảm rủi ro thực thi', out: 'Đúng trọng tâm: so sánh thời gian, xác suất thành công và chi phí của hai con đường.' },
        { t: 'Mua vì đối thủ có thể mua trước', out: 'Có thể đúng, nhưng "sợ bỏ lỡ" không phải luận điểm định giá.' },
      ] },
    ], rewards: { xp: 25 } },

  { ...base('r_dis_pe', 'disney_pixar', 'pe', 'Disney/Pixar qua lăng kính PE', 'Một quỹ buyout có thể cạnh tranh mua Pixar không?', 'h_disney'),
    steps: [
      { type: 'say', lines: [['sophia', 'Bài tập tư duy: nếu một quỹ PE muốn trả cùng mức giá, cấu trúc LBO trông như thế nào?']] },
      { type: 'num', id: 'r_dis_pe_e', concept: 'lbo', q: '[Simulation Assumption] EBITDA 0,3 tỷ USD, nợ tối đa 5x EBITDA, giá 7,4 tỷ USD. Vốn chủ phải chiếm bao nhiêu % giá mua (1 chữ số)?', a: r1(A.disPeEq), tol: 0.1, unit: '%', fb: fb('(7,4 − 1,5) / 7,4 ≈ 79,7%.', 'When price is far above debt capacity, equity must fill the gap — killing LBO returns.', 'Nợ = 5 × 0,3 = 1,5.', 'Với ~80% vốn chủ, IRR khó đạt ngưỡng của quỹ.', 'Debt capacity', 'Disney/Pixar — PE') },
      { type: 'quiz', id: 'r_dis_pe_q', concept: 'synergy', q: 'Vì sao người mua chiến lược thường thắng người mua tài chính trong thương vụ kiểu này?', opts: ['PE không được phép mua công ty phim', 'Người mua chiến lược có synergy (phân phối, công viên, hàng hoá) để trả giá cao hơn; dòng tiền phim biến động cũng không hợp với đòn bẩy cao', 'PE luôn trả cao hơn'], a: 1, fb: fb('Synergy là "ngân sách" để trả premium.', 'Strategics can pay for synergies; volatile cash flows limit leverage.', 'So sánh hai loại người mua.', 'IB phải hiểu điều này khi lập danh sách người mua.', 'Strategic vs financial buyer', 'Disney/Pixar — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_dis_cs', 'disney_pixar', 'cs', 'Disney/Pixar qua lăng kính Consulting', 'Bạn thiết kế 100 ngày đầu sau sáp nhập: tích hợp gì, giữ nguyên gì?', 'h_disney'),
    steps: [
      { type: 'say', lines: [['diep', 'Khách hàng hỏi: synergy có thể đo được ở đâu, và đâu là thứ tuyệt đối không được đụng vào?']] },
      { type: 'num', id: 'r_dis_cs_s', concept: 'synergy', q: '[Simulation Assumption] Doanh thu hàng hoá tăng thêm 500 triệu USD/năm với biên EBIT 30%. EBIT tăng thêm (triệu USD)?', a: A.disCsEbit, tol: 0.5, unit: 'triệu USD', fb: fb('500 × 30% = 150 triệu USD.', 'Revenue synergies are valued at contribution margin, not revenue.', 'Nhân với biên lợi nhuận.', 'Synergy doanh thu kém chắc chắn hơn synergy chi phí — cần chiết khấu xác suất.', 'Revenue synergy', 'Disney/Pixar — Consulting') },
      { type: 'quiz', id: 'r_dis_cs_q', concept: 'synergy', q: 'Ưu tiên số 1 trong kế hoạch 100 ngày?', opts: ['Hợp nhất ngay hệ thống kế toán và chính sách nhân sự', 'Giữ chân nhân tài sáng tạo then chốt và bảo vệ quy trình sáng tạo; chỉ tích hợp những chức năng hỗ trợ (phân phối, hàng hoá)', 'Cắt giảm chi phí mạnh để chứng minh synergy'], a: 1, fb: fb('Mức độ tích hợp phải phụ thuộc nguồn giá trị.', 'Integration depth should follow where value comes from.', 'Giá trị nằm ở con người.', 'Đây là mô hình "preservation" trong PMI.', 'PMI archetypes', 'Disney/Pixar — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_dis_im', 'disney_pixar', 'im', 'Disney/Pixar qua lăng kính nhà đầu tư', 'Bạn nắm cổ phiếu Disney: EPS bị pha loãng — bán hay giữ?', 'h_disney'),
    steps: [
      { type: 'say', lines: [['tung', 'Nhà đầu tư không hỏi "thương vụ có hay không" — họ hỏi "giá cổ phiếu đã phản ánh điều đó chưa, và EPS thay đổi ra sao".']] },
      { type: 'num', id: 'r_dis_im_e', concept: 'accretion', q: '[Simulation Assumption] Disney: lợi nhuận 2,5 tỷ USD, 2.000 triệu cổ phiếu. Pixar: lợi nhuận 0,2 tỷ USD; phát hành 276 triệu cổ phiếu mới. Thay đổi EPS (%, 1 chữ số, số âm = pha loãng)?', a: r1(A.disImEps), tol: 0.1, unit: '%', fb: fb('EPS mới 2,7 / 2.276 ≈ 1,186 so với 1,25 → khoảng −5,1%.', 'Accretion/dilution compares pro forma EPS to standalone EPS.', 'Cộng lợi nhuận, cộng số cổ phiếu.', 'Pha loãng ngắn hạn có thể chấp nhận nếu tăng trưởng dài hạn đủ lớn.', 'Accretion / dilution', 'Disney/Pixar — Investor') },
      { type: 'choice', id: 'r_dis_im_c', q: 'Phản ứng kỷ luật của nhà quản lý danh mục:', grade: true, best: [1], opts: [
        { t: 'Bán ngay vì EPS giảm', out: 'Phản ứng theo một con số ngắn hạn, bỏ qua giá trị chiến lược.' },
        { t: 'Cập nhật luận điểm đầu tư: định giá lại dòng phim, nhượng quyền và rủi ro giữ chân nhân tài; quyết định dựa trên giá trị nội tại so với giá', out: 'Đúng: thương vụ thay đổi luận điểm, nên luận điểm phải được kiểm tra lại.' },
      ] },
    ], rewards: { xp: 25 } },

  // ───────── Amazon / Whole Foods (2017) ─────────
  { ...base('r_wfm_ib', 'amzn_wholefoods', 'ib', 'Whole Foods qua lăng kính IB', 'Bạn cố vấn cho Whole Foods: so sánh một đề nghị tiền mặt chắc chắn với đề nghị cao hơn nhưng rủi ro hơn.', 'h_wholefoods'),
    steps: [
      { type: 'say', lines: [['victor', 'Amazon trả 42 USD tiền mặt — Verified Fact. Giờ giả sử có thêm một đề nghị khác. Con số trên tiêu đề không phải là tất cả.']] },
      { type: 'num', id: 'r_wfm_ib_r', concept: 'deal_certainty', q: '[Simulation Assumption] Đề nghị khác: 44 USD nhưng chỉ 80% khả năng hoàn tất; nếu thất bại, giá về 33,1 USD. Giá trị điều chỉnh rủi ro (USD, 1 chữ số)?', a: r1(A.wfmIbRisk), tol: 0.1, unit: 'USD', fb: fb('0,8 × 44 + 0,2 × 33,1 ≈ 41,8 < 42.', 'Compare bids on a risk-adjusted basis, not headline price.', 'Kỳ vọng có trọng số xác suất.', 'Đề nghị tiền mặt, ít điều kiện thường thắng dù thấp hơn trên giấy.', 'Deal certainty', 'Whole Foods — IB') },
      { type: 'quiz', id: 'r_wfm_ib_q', concept: 'deal_certainty', q: 'Yếu tố nào làm một đề nghị "chắc chắn" hơn?', opts: ['Logo đẹp hơn', 'Tiền mặt có sẵn, không phụ thuộc tài trợ, ít điều kiện, rủi ro chống độc quyền thấp và phí chia tay (break fee) hợp lý', 'Giá cao nhất'], a: 1, fb: fb('Certainty là một phần của giá trị.', 'Financing, conditions and regulatory risk drive certainty.', 'Phân tích điều kiện hoàn tất.', 'IB trình bày cả giá và độ chắc chắn cho Hội đồng quản trị.', 'Bid evaluation', 'Whole Foods — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_wfm_cd', 'amzn_wholefoods', 'cd', 'Whole Foods qua lăng kính Corp Dev', 'Bạn ở đội M&A của Amazon: tự mở cửa hàng hay mua một mạng lưới có sẵn?', 'h_wholefoods'),
    steps: [
      { type: 'say', lines: [['hung', 'Hãy làm phép so sánh thô "build vs buy" — rồi hỏi: con số này còn thiếu gì?']] },
      { type: 'num', id: 'r_wfm_cd_b', concept: 'opportunity_cost', q: '[Simulation Assumption] Tự xây 460 cửa hàng, mỗi cửa hàng 30 triệu USD. Tổng chi phí (tỷ USD, 1 chữ số)?', a: r1(A.wfmCdBuild), tol: 0.1, unit: 'tỷ USD', fb: fb('460 × 0,03 = 13,8 tỷ USD — xấp xỉ giá thương vụ.', 'Replacement cost is a useful sanity check on price.', 'So sánh với ~13,7 tỷ USD.', 'Tự xây còn tốn nhiều năm, chưa có thương hiệu, nhà cung cấp và khách hàng.', 'Replacement cost', 'Whole Foods — Corp Dev') },
      { type: 'quiz', id: 'r_wfm_cd_q', concept: 'competitive_advantage', q: 'Điều mà phép tính chi phí xây dựng KHÔNG bao gồm (Analyst Interpretation)?', opts: ['Tiền thuê đất', 'Thời gian, thương hiệu, chuỗi cung ứng thực phẩm tươi và tệp khách hàng trung thành — những tài sản khó tái tạo', 'Thuế'], a: 1, fb: fb('Tài sản vô hình và tốc độ là lý do chính để mua.', 'Speed and intangibles explain why buyers pay over replacement cost.', 'Chi phí tái tạo chỉ đo tài sản hữu hình.', 'Corp Dev phải định lượng giá trị của thời gian.', 'Buy vs build', 'Whole Foods — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_wfm_pe', 'amzn_wholefoods', 'pe', 'Whole Foods qua lăng kính PE', 'Một quỹ buyout có trả nổi 42 USD cho một chuỗi siêu thị tăng trưởng chậm?', 'h_wholefoods'),
    steps: [
      { type: 'say', lines: [['sophia', 'Siêu thị có dòng tiền ổn định — nghe giống mục tiêu LBO. Nhưng ở mức giá này thì sao?']] },
      { type: 'num', id: 'r_wfm_pe_m', concept: 'valuation_multiple', q: '[Simulation Assumption] EBITDA 1,1 tỷ USD; EV 13,7 tỷ USD. EV/EBITDA (x, 1 chữ số)?', a: r1(A.wfmPeMult), tol: 0.1, unit: 'x', fb: fb('13,7 / 1,1 ≈ 12,5x.', 'Entry multiple drives LBO returns.', 'Chia EV cho EBITDA.', 'Với biên siêu thị mỏng và tăng trưởng chậm, mua ở 12,5x rồi bán ở bội số thấp hơn sẽ phá IRR.', 'Entry multiple', 'Whole Foods — PE') },
      { type: 'quiz', id: 'r_wfm_pe_q', concept: 'lbo', q: 'Kết luận của ủy ban đầu tư PE nhiều khả năng là gì?', opts: ['Đầu tư ngay', 'Không theo ở mức giá này: thiếu synergy để biện minh bội số, rủi ro cạnh tranh tăng và rủi ro thu hẹp bội số (multiple contraction) cao', 'Tăng đòn bẩy lên 10x'], a: 1, fb: fb('Biết rút lui là một kỹ năng của PE.', 'Disciplined funds walk away when the price embeds a strategic buyer’s synergies.', 'So sánh bội số vào và ra.', 'Liên hệ thành tựu "Biết dừng đúng lúc".', 'Walk-away discipline', 'Whole Foods — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_wfm_cs', 'amzn_wholefoods', 'cs', 'Whole Foods qua lăng kính Consulting', 'Bạn tư vấn chiến lược giảm giá sau sáp nhập: cần tăng doanh thu bao nhiêu để bù biên lợi nhuận?', 'h_wholefoods'),
    steps: [
      { type: 'say', lines: [['diep', 'Ngày hoàn tất, Amazon giảm giá nhiều mặt hàng — Verified Fact. Câu hỏi của khách hàng: giảm giá phải kéo thêm bao nhiêu doanh thu mới hoà vốn?']] },
      { type: 'num', id: 'r_wfm_cs_r', concept: 'profit', q: '[Simulation Assumption] Biên lợi nhuận gộp giảm từ 34% xuống 32%. Doanh thu phải tăng bao nhiêu % để lợi nhuận gộp không đổi (1 chữ số)?', a: r1(A.wfmCsRev), tol: 0.1, unit: '%', fb: fb('34 / 32 − 1 ≈ 6,3%.', 'Break-even volume uplift = old margin / new margin − 1.', 'Giữ lợi nhuận gộp bằng nhau.', 'Đặt KPI lưu lượng khách và giỏ hàng để kiểm chứng.', 'Price-volume trade-off', 'Whole Foods — Consulting') },
      { type: 'quiz', id: 'r_wfm_cs_q', concept: 'synergy', q: 'KPI nào nên theo dõi hàng tuần trong 100 ngày đầu?', opts: ['Số lượng logo mới', 'Lưu lượng khách, giá trị giỏ hàng, biên gộp theo ngành hàng và tỷ lệ khách dùng chương trình thành viên', 'Chỉ giá cổ phiếu'], a: 1, fb: fb('KPI phải nối thẳng với giả định trong business case.', 'Track the drivers of the synergy case, not vanity metrics.', 'Từ giả định → chỉ số.', 'Phát hiện sớm nếu giảm giá không kéo thêm khách.', 'Value-capture tracking', 'Whole Foods — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_wfm_im', 'amzn_wholefoods', 'im', 'Whole Foods qua lăng kính nhà đầu tư', 'Bạn nắm cổ phiếu các chuỗi siêu thị khác: tin thương vụ vừa ra — phản ứng thế nào?', 'h_wholefoods'),
    steps: [
      { type: 'say', lines: [['tung', 'Thương vụ không chỉ ảnh hưởng hai công ty. Danh mục của bạn đang nắm các đối thủ.']] },
      { type: 'num', id: 'r_wfm_im_h', concept: 'compounding', q: '[Simulation Assumption] Danh mục có 10% vào cổ phiếu siêu thị; nhóm này giảm 9% trong ngày. Tác động lên toàn danh mục (%, số âm)?', a: r1(A.wfmImHit), tol: 0.05, unit: '%', fb: fb('10% × −9% = −0,9%.', 'Portfolio impact = weight × return.', 'Trọng số × biến động.', 'Tỷ trọng quyết định mức độ tổn thương — lý do của giới hạn tập trung.', 'Position sizing', 'Whole Foods — Investor') },
      { type: 'choice', id: 'r_wfm_im_c', q: 'Phản ứng kỷ luật:', grade: true, best: [0], opts: [
        { t: 'Đánh giá lại luận điểm từng cổ phiếu: lợi thế cạnh tranh có bị đe doạ thật không, biên lợi nhuận chịu áp lực bao nhiêu, giá đã phản ánh chưa', out: 'Đúng: tác động bậc hai cần được phân tích, không phải phản ứng theo đám đông.' },
        { t: 'Bán toàn bộ nhóm siêu thị ngay lập tức', out: 'Có thể bán ở đáy cảm xúc — liên hệ bài học "bán tháo" trong mô phỏng quỹ.' },
      ] },
    ], rewards: { xp: 25 } },
];

// Perspective map: what each lens asks and what it learns, per deal.
export const REPLAYS = {
  disney_pixar: { title: 'Disney / Pixar', quests: { ib: 'r_dis_ib', cd: 'r_dis_cd', pe: 'r_dis_pe', cs: 'r_dis_cs', im: 'r_dis_im' },
    map: {
      ib: ['Giá có công bằng và rủi ro tỷ lệ cố định là gì?', 'Bên bán gánh rủi ro giá bên mua đến ngày hoàn tất.'],
      cd: ['Tự xây được không, và ta nhường bao nhiêu phần công ty?', 'Mua năng lực bằng ~12% công ty hợp nhất (mô phỏng).'],
      pe: ['Người mua tài chính có cạnh tranh nổi không?', 'Không: thiếu synergy và dòng tiền phim không hợp đòn bẩy.'],
      cs: ['Tích hợp gì, giữ nguyên gì?', 'Giữ con người và quy trình sáng tạo; chỉ tích hợp chức năng hỗ trợ.'],
      im: ['EPS bị pha loãng — giá đã phản ánh chưa?', 'Cập nhật luận điểm thay vì phản ứng theo một con số.'],
    } },
  amzn_wholefoods: { title: 'Amazon / Whole Foods', quests: { ib: 'r_wfm_ib', cd: 'r_wfm_cd', pe: 'r_wfm_pe', cs: 'r_wfm_cs', im: 'r_wfm_im' },
    map: {
      ib: ['Đề nghị nào thực sự tốt nhất?', 'Tiền mặt chắc chắn có thể thắng giá cao hơn nhưng rủi ro.'],
      cd: ['Tự mở cửa hàng hay mua mạng lưới có sẵn?', 'Chi phí xây ≈ giá mua, nhưng thời gian và thương hiệu không tự xây được.'],
      pe: ['Quỹ buyout có trả nổi 12,5x?', 'Biết rút lui khi giá đã chứa synergy của người mua chiến lược.'],
      cs: ['Giảm giá cần kéo thêm bao nhiêu doanh thu?', '≈ +6,3% doanh thu để giữ lợi nhuận gộp; theo dõi KPI hàng tuần.'],
      im: ['Đối thủ trong danh mục bị ảnh hưởng ra sao?', 'Phân tích tác động bậc hai; tỷ trọng quyết định mức tổn thương.'],
    } },
};
// ───────── Blackstone / Hilton (2007) & Microsoft / Activision Blizzard (2023) ─────────
// sim: Hilton undisturbed 36.05, offer 47.5; synergies 250m × 10x; 1.8bn debt bought back at 45%; 100k rooms × RevPAR 100 × 365 × 5% fee; IPO 20 USD / EPS 0.8
// sim: ATVI 780m shares, 30% block probability, standalone 65.4; 10m subs × 15 USD × 12; EBITDA 3.5bn; market shares 30/25/20/15/10; post-suit price 77
Object.assign(A, {
  hilIbPrem: (47.5 / 36.05 - 1) * 100,
  hilCdSyn: 0.25 * 10,
  hilPeGain: 1.8 - 1.8 * 0.45,
  hilCsFee: 100000 * 100 * 365 * 0.05 / 1e6,
  hilImPe: 20 / 0.8,
  atvIbEv: 0.7 * 95 + 0.3 * (65.4 + 3000 / 780),
  atvCdRev: 10 * 15 * 12 / 1000,
  atvPeMult: 68.7 / 3.5,
  atvCsHhi: [30, 25, 20, 15, 10].reduce((s, x) => s + x * x, 0),
  atvImSpread: (95 / 77 - 1) * 100,
});

REPLAY_QUESTS.push(
  { ...base('r_hil_ib', 'bx_hilton', 'ib', 'Hilton qua lăng kính IB', 'Bạn cố vấn cho Hội đồng quản trị Hilton năm 2007: premium có đủ, và đã thử thị trường chưa?', 'h_hilton'),
    steps: [
      { type: 'say', lines: [['victor', 'Một quỹ PE muốn mua toàn bộ Hilton. Hội đồng quản trị cần biết hai điều: giá có hấp dẫn không, và có ai trả cao hơn không.']] },
      { type: 'num', id: 'r_hil_ib_p', concept: 'comps', q: '[Simulation Assumption] Giá trước công bố 36,05 USD; giá chào 47,5 USD. Premium (%, 1 chữ số)?', a: r1(A.hilIbPrem), tol: 0.2, unit: '%', fb: fb('47,5 / 36,05 − 1 ≈ 31,8%.', 'Premium over undisturbed price is the first fairness check.', 'So với giá trước tin.', 'Premium phải được so với các thương vụ tương đương và với giá trị nội tại.', 'Control premium', 'Hilton — IB') },
      { type: 'quiz', id: 'r_hil_ib_q', concept: 'governance', q: 'Điều khoản "go-shop" giúp gì cho cổ đông bên bán?', opts: ['Cho phép bên mua rút lui miễn phí', 'Cho bên bán một khoảng thời gian chủ động tìm đề nghị cao hơn sau khi ký, với phí chia tay thấp hơn — kiểm tra thị trường', 'Bắt buộc trả bằng cổ phiếu'], a: 1, fb: fb('Go-shop là công cụ "market check" sau khi ký.', 'A go-shop lets the target solicit superior proposals post-signing.', 'Nghĩa vụ tối đa hoá giá trị khi bán toàn bộ công ty.', 'Phổ biến trong thương vụ do PE dẫn dắt.', 'Market check', 'Hilton — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_hil_cd', 'bx_hilton', 'cd', 'Hilton qua lăng kính Corp Dev', 'Bạn ở đội M&A của một tập đoàn khách sạn đối thủ: có nên trả giá cao hơn quỹ PE?', 'h_hilton'),
    steps: [
      { type: 'say', lines: [['hung', 'Ta là người mua chiến lược, có synergy mà quỹ PE không có. Nhưng synergy đáng bao nhiêu — và ta có nên dùng hết không?']] },
      { type: 'num', id: 'r_hil_cd_s', concept: 'synergy', q: '[Simulation Assumption] Synergy chi phí 250 triệu USD/năm, vốn hoá ở 10x. Giá trị synergy (tỷ USD, 1 chữ số)?', a: r1(A.hilCdSyn), tol: 0.05, unit: 'tỷ USD', fb: fb('0,25 × 10 = 2,5 tỷ USD.', 'Capitalized synergies set the ceiling on what a strategic can over-pay.', 'Synergy hằng năm × bội số.', 'Trả hết synergy cho bên bán = cổ đông của ta không được gì.', 'Synergy value', 'Hilton — Corp Dev') },
      { type: 'choice', id: 'r_hil_cd_c', q: 'Khuyến nghị lên Hội đồng quản trị (giữa năm 2007, giá tài sản ở đỉnh chu kỳ):', grade: true, best: [1], opts: [
        { t: 'Trả thêm toàn bộ 2,5 tỷ USD để chắc chắn thắng', out: 'Chuyển toàn bộ synergy cho cổ đông Hilton và tăng nợ ở đỉnh chu kỳ.' },
        { t: 'Chỉ trả nếu còn giữ lại phần lớn synergy, có xét rủi ro chống độc quyền và sức chịu đựng bảng cân đối; nếu không thì rút lui', out: 'Kỷ luật: chỉ thắng khi thương vụ vẫn tạo giá trị cho cổ đông của mình.' },
      ] },
    ], rewards: { xp: 25 } },

  { ...base('r_hil_pe', 'bx_hilton', 'pe', 'Hilton qua lăng kính PE', 'Bạn ở Blackstone năm 2009–2010: cứu thương vụ bằng tái cấu trúc nợ.', 'h_hilton'),
    steps: [
      { type: 'say', lines: [['sophia', 'Khủng hoảng làm giá nợ của Hilton giảm sâu trên thị trường. Với PE, đó vừa là mối đe doạ vừa là cơ hội.']] },
      { type: 'num', id: 'r_hil_pe_g', concept: 'lbo', q: '[Simulation Assumption] Mua lại 1,8 tỷ USD mệnh giá nợ ở mức 45% mệnh giá. Nợ giảm ròng (mệnh giá trừ tiền bỏ ra, tỷ USD, 2 chữ số)?', a: Math.round(A.hilPeGain * 100) / 100, tol: 0.01, unit: 'tỷ USD', fb: fb('1,8 − 0,81 = 0,99 tỷ USD.', 'Buying debt at a discount de-levers the company faster than repaying at par.', 'Mệnh giá − giá mua.', 'Giảm đòn bẩy giúp công ty sống sót qua đáy chu kỳ.', 'Discounted debt buyback', 'Hilton — PE') },
      { type: 'quiz', id: 'r_hil_pe_q', concept: 'business_model', q: 'Vì sao chuyển sang mô hình nhượng quyền/quản lý (asset-light) làm tăng giá trị (Analyst Interpretation)?', opts: ['Vì không cần khách', 'Phí nhượng quyền/quản lý cần rất ít vốn → ROIC cao, dòng tiền ổn định hơn và thị trường trả bội số cao hơn', 'Vì khách sạn được miễn thuế'], a: 1, fb: fb('Mô hình ít vốn được định giá cao hơn mô hình sở hữu tài sản.', 'Fee-based models earn higher ROIC and command higher multiples.', 'So sánh vốn cần cho mỗi đồng lợi nhuận.', 'Đòn bẩy bội số khi thoái vốn (multiple expansion).', 'Asset-light', 'Hilton — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_hil_cs', 'bx_hilton', 'cs', 'Hilton qua lăng kính Consulting', 'Bạn hỗ trợ kế hoạch tăng trưởng: mở rộng chuỗi bằng nhượng quyền.', 'h_hilton'),
    steps: [
      { type: 'say', lines: [['diep', 'Ban lãnh đạo mới muốn tăng số phòng mà không bỏ nhiều vốn. Hãy định lượng phí nhượng quyền từ pipeline.']] },
      { type: 'num', id: 'r_hil_cs_f', concept: 'revenue_expense', q: '[Simulation Assumption] 100.000 phòng mới, RevPAR 100 USD/đêm, 365 đêm, phí nhượng quyền 5% doanh thu phòng. Phí hằng năm (triệu USD, 1 chữ số)?', a: r1(A.hilCsFee), tol: 0.5, unit: 'triệu USD', fb: fb('100.000 × 100 × 365 × 5% = 182,5 triệu USD.', 'Franchise fees scale with room revenue, not owned capital.', 'Doanh thu phòng × tỷ lệ phí.', 'Gần như toàn bộ phí chảy xuống lợi nhuận.', 'Franchise economics', 'Hilton — Consulting') },
      { type: 'quiz', id: 'r_hil_cs_q', concept: 'consulting_metrics', q: 'RevPAR được tính như thế nào?', opts: ['Tổng chi phí / số phòng', 'Giá phòng bình quân (ADR) × công suất phòng (occupancy)', 'Số khách / số nhân viên'], a: 1, fb: fb('RevPAR kết hợp giá và công suất.', 'RevPAR = ADR × occupancy.', 'Chỉ số cốt lõi ngành khách sạn.', 'Theo dõi cả hai thành phần để biết tăng trưởng đến từ đâu.', 'RevPAR', 'Hilton — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_hil_im', 'bx_hilton', 'im', 'Hilton qua lăng kính nhà đầu tư', 'Bạn được mời mua cổ phiếu Hilton khi IPO năm 2013 — công ty vẫn do quỹ PE nắm giữ.', 'h_hilton'),
    steps: [
      { type: 'say', lines: [['tung', 'Mua cổ phiếu từ một quỹ PE đang thoái vốn: họ biết công ty rõ hơn ta. Ta cần hỏi đúng câu.']] },
      { type: 'num', id: 'r_hil_im_pe', concept: 'valuation_multiple', q: '[Simulation Assumption] Giá IPO 20 USD, EPS dự phóng 0,8 USD. P/E (x)?', a: A.hilImPe, tol: 0.1, unit: 'x', fb: fb('20 / 0,8 = 25x.', 'Forward P/E frames what growth the IPO price already assumes.', 'Giá / EPS.', 'So sánh với các công ty khách sạn niêm yết.', 'P/E', 'Hilton — Investor') },
      { type: 'quiz', id: 'r_hil_im_q', concept: 'due_diligence', q: 'Rủi ro đặc thù khi mua IPO của công ty do PE sở hữu?', opts: ['Không có rủi ro', 'Nợ còn cao sau LBO, quỹ sẽ tiếp tục bán ra sau khi hết hạn lock-up (áp lực nguồn cung), và quyền kiểm soát quản trị của quỹ', 'Công ty chắc chắn phá sản'], a: 1, fb: fb('"Sponsor overhang" là rủi ro kỹ thuật thường gặp.', 'Watch leverage, lock-up expiries and sponsor control in PE-backed IPOs.', 'Ai bán và vì sao bán.', 'Định giá cần chiết khấu cho các rủi ro này.', 'Sponsor overhang', 'Hilton — Investor') },
    ], rewards: { xp: 25 } },

  { ...base('r_atv_ib', 'ms_activision', 'ib', 'Activision qua lăng kính IB', 'Bạn cố vấn cho Activision: rủi ro pháp lý cao — phí chấm dứt bảo vệ cổ đông đến đâu?', 'h_activision'),
    steps: [
      { type: 'say', lines: [['victor', 'Giá 95 USD tiền mặt và phí chấm dứt ngược lên tới 3 tỷ USD là Verified Fact. Ta đánh giá đề nghị theo giá trị kỳ vọng, không theo con số trên tiêu đề.']] },
      { type: 'num', id: 'r_atv_ib_e', concept: 'deal_certainty', q: '[Simulation Assumption] 780 triệu cổ phiếu; xác suất bị chặn 30%; nếu thất bại giá về 65,4 USD cộng phí 3 tỷ USD chia đều mỗi cổ phiếu. Giá trị kỳ vọng (USD, 1 chữ số)?', a: r1(A.atvIbEv), tol: 0.1, unit: 'USD', fb: fb('0,7 × 95 + 0,3 × (65,4 + 3,85) ≈ 87,3 USD.', 'Reverse termination fees cushion the downside of regulatory failure.', 'Kỳ vọng hai kịch bản.', 'Phí chấm dứt càng lớn, bên mua càng cam kết vượt qua cơ quan quản lý.', 'Reverse termination fee', 'Activision — IB') },
      { type: 'quiz', id: 'r_atv_ib_q', concept: 'deal_certainty', q: 'Ngoài phí chấm dứt, điều khoản nào giúp bên bán khi có rủi ro chống độc quyền?', opts: ['Không có', 'Cam kết của bên mua về các biện pháp khắc phục (bán tài sản, cấp phép) và ngày hết hạn đủ dài để đi hết quy trình phê duyệt', 'Yêu cầu bên mua trả trước toàn bộ tiền'], a: 1, fb: fb('Cam kết remedy và outside date dài là công cụ phân bổ rủi ro pháp lý.', 'Remedy commitments and long outside dates allocate regulatory risk.', 'Ai gánh rủi ro nào.', 'Thương vụ này mất gần hai năm để hoàn tất.', 'Regulatory covenants', 'Activision — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_atv_cd', 'ms_activision', 'cd', 'Activision qua lăng kính Corp Dev', 'Bạn ở đội M&A của Microsoft: nội dung game tạo giá trị gì cho mảng thuê bao?', 'h_activision'),
    steps: [
      { type: 'say', lines: [['hung', 'Ta không chỉ mua lợi nhuận hiện tại của các tựa game — ta mua nội dung cho chiến lược thuê bao và nền tảng.']] },
      { type: 'num', id: 'r_atv_cd_r', concept: 'synergy', q: '[Simulation Assumption] Nội dung mới thu hút thêm 10 triệu thuê bao × 15 USD/tháng. Doanh thu tăng thêm mỗi năm (tỷ USD, 1 chữ số)?', a: r1(A.atvCdRev), tol: 0.05, unit: 'tỷ USD', fb: fb('10 × 15 × 12 = 1.800 triệu = 1,8 tỷ USD.', 'Platform synergies come from subscriber growth and retention.', 'Thuê bao × giá × 12 tháng.', 'Phải trừ phần doanh thu game bán lẻ có thể bị "ăn mòn" (cannibalization).', 'Platform synergy', 'Activision — Corp Dev') },
      { type: 'quiz', id: 'r_atv_cd_q', concept: 'negotiation', q: 'Vì sao bán quyền cloud streaming cho Ubisoft là nhượng bộ hợp lý (Analyst Interpretation)?', opts: ['Vì mảng cloud không có giá trị', 'Nó giải quyết đúng mối lo của CMA về cloud gaming, đổi một phần giá trị nhỏ lấy việc hoàn tất thương vụ và giữ phần cốt lõi', 'Vì Ubisoft trả giá cao hơn Microsoft'], a: 1, fb: fb('Biện pháp khắc phục tốt nhắm đúng vào lý thuyết gây hại.', 'Targeted remedies trade a sliver of value for deal completion.', 'Liên hệ CVS/Aetna.', 'Corp Dev nên lập kịch bản remedy ngay từ khi định giá.', 'Remedy design', 'Activision — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_atv_pe', 'ms_activision', 'pe', 'Activision qua lăng kính PE', 'Một quỹ buyout có thể là bên mua thay thế ở quy mô gần 70 tỷ USD?', 'h_activision'),
    steps: [
      { type: 'say', lines: [['sophia', 'Thử nghĩ như một quỹ: nếu Microsoft rút lui, liệu PE có thể là "kế hoạch B" của Activision?']] },
      { type: 'num', id: 'r_atv_pe_m', concept: 'valuation_multiple', q: '[Simulation Assumption] EBITDA 3,5 tỷ USD; EV 68,7 tỷ USD. EV/EBITDA (x, 1 chữ số)?', a: r1(A.atvPeMult), tol: 0.1, unit: 'x', fb: fb('68,7 / 3,5 ≈ 19,6x.', 'Very high entry multiples leave little room for leverage-driven returns.', 'EV / EBITDA.', 'Ở ~20x, nợ chỉ chiếm phần nhỏ và IRR phụ thuộc gần hết vào tăng trưởng.', 'Entry multiple', 'Activision — PE') },
      { type: 'quiz', id: 'r_atv_pe_q', concept: 'lbo', q: 'Vì sao doanh nghiệp game "hit-driven" khó là mục tiêu LBO kinh điển?', opts: ['Vì game không có doanh thu', 'Dòng tiền phụ thuộc vào thành công của từng tựa game và đội ngũ sáng tạo — biến động cao, không hợp với nghĩa vụ trả nợ cố định', 'Vì luật cấm'], a: 1, fb: fb('LBO cần dòng tiền dự đoán được.', 'Hit-driven cash flows are a poor match for fixed debt service.', 'Liên hệ Disney/Pixar — PE.', 'PE thường chọn thương vụ thiểu số hoặc tách mảng trong ngành này.', 'LBO suitability', 'Activision — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_atv_cs', 'ms_activision', 'cs', 'Activision qua lăng kính Consulting', 'Bạn là chuyên gia kinh tế cạnh tranh: đo mức tập trung thị trường và lý thuyết gây hại.', 'h_activision'),
    steps: [
      { type: 'say', lines: [['diep', 'Cơ quan cạnh tranh hỏi hai câu: thị trường tập trung đến mức nào, và bên mua có động cơ "khoá" đối thủ khỏi nội dung quan trọng không?']] },
      { type: 'num', id: 'r_atv_cs_h', concept: 'competitive_advantage', q: '[Simulation Assumption] Thị phần năm công ty: 30%, 25%, 20%, 15%, 10%. Chỉ số HHI?', a: A.atvCsHhi, tol: 1, unit: 'điểm', fb: fb('30² + 25² + 20² + 15² + 10² = 2.250.', 'HHI = sum of squared market shares; higher means more concentrated.', 'Bình phương rồi cộng.', 'HHI cao và mức tăng lớn sau sáp nhập là tín hiệu cơ quan quản lý sẽ xem xét kỹ.', 'HHI', 'Activision — Consulting') },
      { type: 'quiz', id: 'r_atv_cs_q', concept: 'governance', q: '"Vertical foreclosure" trong thương vụ này nghĩa là lo ngại gì?', opts: ['Hai công ty có cùng sản phẩm', 'Bên mua có thể hạn chế đối thủ (console hoặc cloud gaming) tiếp cận nội dung quan trọng — giải pháp thường là cam kết cấp phép dài hạn', 'Giá cổ phiếu giảm'], a: 1, fb: fb('Thương vụ dọc gây lo ngại về quyền tiếp cận đầu vào.', 'Vertical theories of harm focus on input foreclosure of rivals.', 'Phân biệt ngang và dọc.', 'Cam kết hành vi (behavioral) và bán tài sản (structural) là hai loại remedy.', 'Vertical foreclosure', 'Activision — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_atv_im', 'ms_activision', 'im', 'Activision qua lăng kính nhà đầu tư', 'Bạn là quỹ merger arbitrage: chênh lệch giá sau khi FTC khởi kiện có đáng để đặt cược?', 'h_activision'),
    steps: [
      { type: 'say', lines: [['tung', 'Merger arbitrage: mua cổ phiếu bên bị mua, hưởng chênh lệch đến giá chào nếu thương vụ hoàn tất. Lợi nhuận nhỏ, rủi ro dạng "được ăn cả, ngã về không".']] },
      { type: 'num', id: 'r_atv_im_s', concept: 'deal_certainty', q: '[Simulation Assumption] Sau khi bị kiện, cổ phiếu giao dịch ở 77 USD; giá chào 95 USD. Chênh lệch thô (%, 1 chữ số)?', a: r1(A.atvImSpread), tol: 0.1, unit: '%', fb: fb('95 / 77 − 1 ≈ 23,4%.', 'Gross spread = offer / current price − 1; it prices the market’s doubt.', 'So với giá hiện tại.', 'Rủi ro giảm: nếu thất bại, giá có thể về mức trước công bố.', 'Merger arbitrage', 'Activision — Investor') },
      { type: 'choice', id: 'r_atv_im_c', q: 'Quyết định quản lý rủi ro:', grade: true, best: [0], opts: [
        { t: 'Ước tính xác suất hoàn tất và mức giảm nếu thất bại, so với chênh lệch; giới hạn tỷ trọng vị thế vì kết quả nhị phân', out: 'Đúng: chênh lệch chỉ hấp dẫn khi kỳ vọng dương và vị thế không làm tổn thương cả danh mục.' },
        { t: 'Dồn 40% danh mục vì chênh lệch 23% là "tiền dễ kiếm"', out: 'Rủi ro tập trung — một quyết định pháp lý có thể xoá nhiều năm lợi nhuận.' },
      ] },
    ], rewards: { xp: 25 } },
);

Object.assign(REPLAYS, {
  bx_hilton: { title: 'Blackstone / Hilton', quests: { ib: 'r_hil_ib', cd: 'r_hil_cd', pe: 'r_hil_pe', cs: 'r_hil_cs', im: 'r_hil_im' },
    roles: { cd: 'Đội M&A của tập đoàn khách sạn đối thủ', pe: 'Blackstone — chủ sở hữu trong khủng hoảng', cs: 'Tư vấn tăng trưởng nhượng quyền', im: 'Nhà đầu tư mua IPO năm 2013' },
    map: {
      ib: ['Premium có đủ và đã kiểm tra thị trường chưa?', 'Premium ~32% (mô phỏng) cộng go-shop để thử giá.'],
      cd: ['Người mua chiến lược có nên trả hết synergy?', 'Chỉ thắng khi vẫn giữ phần lớn synergy cho cổ đông mình.'],
      pe: ['Làm sao sống sót khi mua ở đỉnh chu kỳ?', 'Mua lại nợ giá chiết khấu, bơm vốn, chuyển sang mô hình ít vốn.'],
      cs: ['Tăng trưởng mà không cần nhiều vốn?', 'Nhượng quyền: phí theo doanh thu phòng, theo dõi RevPAR.'],
      im: ['Mua lại từ một quỹ PE đang thoái vốn?', 'Kiểm tra nợ còn lại, lịch hết lock-up và quyền kiểm soát của quỹ.'],
    } },
  ms_activision: { title: 'Microsoft / Activision Blizzard', quests: { ib: 'r_atv_ib', cd: 'r_atv_cd', pe: 'r_atv_pe', cs: 'r_atv_cs', im: 'r_atv_im' },
    roles: { cs: 'Chuyên gia kinh tế cạnh tranh (antitrust)', im: 'Quỹ merger arbitrage' },
    map: {
      ib: ['95 USD đáng bao nhiêu khi có thể bị chặn?', 'Giá trị kỳ vọng ~87 USD (mô phỏng); phí chấm dứt đệm rủi ro.'],
      cd: ['Nội dung tạo giá trị gì cho nền tảng?', 'Synergy thuê bao; remedy nhắm đúng mối lo để giữ phần cốt lõi.'],
      pe: ['PE có thể là kế hoạch B?', 'Khó: ~20x EBITDA (mô phỏng) và dòng tiền phụ thuộc từng tựa game.'],
      cs: ['Thị trường tập trung đến đâu, rủi ro "khoá" đối thủ?', 'HHI và lý thuyết vertical foreclosure → cam kết cấp phép.'],
      im: ['Chênh lệch 23% có đáng đặt cược?', 'Ước tính xác suất, giới hạn tỷ trọng vì kết quả nhị phân.'],
    } },
});

// ───────── TXU / Energy Future Holdings (2007 → 2014) & Bristol Myers Squibb / Celgene (2019) ─────────
// sim TXU: EV 20bn vs secured 24bn; rate base 15bn × 1.4; EBITDA 5bn, −0.6bn per 1 USD/MMBtu, gas 7 → 4; 40 TWh × −5 USD/MWh; bonds 30 → 45 cents
// sim Celgene: CVR 2.0 USD of 9; BMS 1,630m + 700m new shares; royalty 1bn for 5% of 8bn × 8 yrs; rNPV 60% × 6 − 0.5; net debt 35 / EBITDA 20
Object.assign(A, {
  txuIbRec: 20 / 24 * 100,
  txuCdVal: 15 * 1.4,
  txuPeEbitda: 5 - 0.6 * (7 - 4),
  txuCsHit: 40e6 * -5 / 1e6,
  txuImRet: (45 / 30 - 1) * 100,
  celIbProb: 2 / 9 * 100,
  celCdOwn: 700 / (1630 + 700) * 100,
  celPeMoic: (0.05 * 8 * 8) / 1,
  celCsRnpv: 0.6 * 6 - 0.5,
  celImLev: 35 / 20,
});

REPLAY_QUESTS.push(
  { ...base('r_txu_ib', 'txu_efh', 'ib', 'TXU qua lăng kính IB (tái cấu trúc)', 'Năm 2014, bạn là cố vấn tái cấu trúc: ai được nhận gì khi giá trị doanh nghiệp thấp hơn nợ?', 'h_txu'),
    steps: [
      { type: 'say', lines: [['victor', 'Energy Future Holdings nộp đơn Chapter 11 năm 2014 — Verified Fact. Ngân hàng đầu tư lúc này không bán công ty, mà giúp chia "chiếc bánh" giữa các chủ nợ.']], terms: ['Absolute Priority Rule'] },
      { type: 'num', id: 'r_txu_ib_r', concept: 'covenants', q: '[Simulation Assumption] Giá trị doanh nghiệp 20 tỷ USD; nợ có bảo đảm hạng nhất 24 tỷ USD. Tỷ lệ thu hồi của nợ có bảo đảm (%, 1 chữ số)?', a: r1(A.txuIbRec), tol: 0.2, unit: '%', fb: fb('20 / 24 ≈ 83,3% — các hạng nợ thấp hơn và vốn chủ nhận 0.', 'Recovery = value available / claim, paid in order of priority.', 'Giá trị chảy theo thứ tự ưu tiên.', 'Chủ nợ có bảo đảm thường trở thành chủ sở hữu mới.', 'Recovery waterfall', 'TXU — IB') },
      { type: 'quiz', id: 'r_txu_ib_q', concept: 'covenants', q: '"Absolute priority rule" nghĩa là gì?', opts: ['Cổ đông luôn được trả trước', 'Hạng nợ cao hơn phải được trả đủ trước khi hạng thấp hơn (và cổ đông) nhận bất cứ thứ gì — trừ khi các bên đồng ý khác', 'Mọi chủ nợ được trả bằng nhau'], a: 1, fb: fb('Thứ tự ưu tiên quyết định ai giữ giá trị.', 'Senior claims are paid in full before junior claims receive value.', 'Thác nước thu hồi.', 'Vốn chủ của quỹ PE thường bị xoá trắng.', 'Absolute priority', 'TXU — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_txu_cd', 'txu_efh', 'cd', 'TXU qua lăng kính Corp Dev', 'Bạn ở đội M&A của một công ty điện: tài sản nào đáng mua từ một vụ phá sản?', 'h_txu'),
    steps: [
      { type: 'say', lines: [['hung', 'Trong phá sản, không phải tài sản nào cũng xấu. Mảng truyền tải – phân phối được quản lý theo giá (regulated) có dòng tiền rất ổn định.']] },
      { type: 'num', id: 'r_txu_cd_v', concept: 'valuation_multiple', q: '[Simulation Assumption] Mảng lưới điện có rate base 15 tỷ USD, giao dịch ở 1,4x rate base. Giá trị doanh nghiệp (tỷ USD, 1 chữ số)?', a: r1(A.txuCdVal), tol: 0.1, unit: 'tỷ USD', fb: fb('15 × 1,4 = 21 tỷ USD.', 'Regulated utilities are often valued on a multiple of rate base.', 'Rate base × bội số.', 'Lợi nhuận được cơ quan quản lý cho phép trên rate base — ít phụ thuộc giá hàng hoá.', 'Rate base', 'TXU — Corp Dev') },
      { type: 'quiz', id: 'r_txu_cd_q', concept: 'governance', q: 'Vì sao một mảng lưới điện được "rào chắn" (ring-fenced) giữ được giá trị khi công ty mẹ phá sản (Analyst Interpretation)?', opts: ['Vì không có khách hàng', 'Các cam kết pháp lý và quản trị tách biệt tài sản, nợ và quyết định cổ tức của mảng này khỏi công ty mẹ, nên chủ nợ của công ty mẹ khó với tới dòng tiền của nó', 'Vì được miễn thuế'], a: 1, fb: fb('Ring-fencing bảo vệ mảng có dòng tiền ổn định.', 'Ring-fencing isolates a regulated subsidiary from parent-level distress.', 'Cấu trúc pháp lý quan trọng như dòng tiền.', 'Người mua chiến lược có thể mua tài sản tốt với cấu trúc sạch.', 'Ring-fencing', 'TXU — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_txu_pe', 'txu_efh', 'pe', 'TXU qua lăng kính PE (IC năm 2007)', 'Bạn ngồi trong IC năm 2007: luận điểm phụ thuộc vào một biến số mà quỹ không kiểm soát.', 'h_txu'),
    steps: [
      { type: 'say', lines: [['sophia', 'Giá điện bán buôn ở Texas đi theo giá khí đốt. Nhà máy than và hạt nhân của công ty có chi phí cố định — nên giá khí cao thì biên lợi nhuận rất lớn. Còn nếu giá khí giảm?']] },
      { type: 'num', id: 'r_txu_pe_e', concept: 'lbo', q: '[Simulation Assumption] EBITDA 5 tỷ USD; mỗi 1 USD/MMBtu giá khí giảm làm EBITDA giảm 0,6 tỷ. Giá khí giảm từ 7 xuống 4 USD. EBITDA mới (tỷ USD, 1 chữ số)?', a: r1(A.txuPeEbitda), tol: 0.05, unit: 'tỷ USD', fb: fb('5 − 0,6 × 3 = 3,2 tỷ USD.', 'Commodity sensitivity: ΔEBITDA = sensitivity × price change.', 'Phân tích độ nhạy.', 'Với nợ ~40 tỷ, Nợ/EBITDA vọt lên trên 12x.', 'Commodity sensitivity', 'TXU — PE') },
      { type: 'quiz', id: 'r_txu_pe_q', concept: 'lbo', q: 'Vì sao chương trình phòng ngừa rủi ro giá (hedging) không cứu được thương vụ về dài hạn?', opts: ['Vì hedging bị cấm', 'Hợp đồng hedge có thời hạn; khi hết hạn, công ty phải hedge lại ở giá thị trường mới thấp hơn — hedging mua thời gian, không thay đổi luận điểm', 'Vì hedging luôn lỗ'], a: 1, fb: fb('Hedging làm mượt, không xoá rủi ro cấu trúc.', 'Hedges roll off; they buy time but cannot reverse a structural price shift.', 'Phân biệt rủi ro chu kỳ và rủi ro cấu trúc.', 'IC phải kiểm tra kịch bản giá giảm kéo dài.', 'Hedging limits', 'TXU — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_txu_cs', 'txu_efh', 'cs', 'TXU qua lăng kính Consulting', 'Bạn tư vấn danh mục nhà máy: khi giá điện thấp hơn chi phí biến đổi, làm gì với nhà máy?', 'h_txu'),
    steps: [
      { type: 'say', lines: [['diep', 'Khách hàng hỏi: với giá điện mới, nhà máy nào còn tạo ra tiền và nhà máy nào đang đốt tiền mỗi giờ chạy?']] },
      { type: 'num', id: 'r_txu_cs_h', concept: 'profit', q: '[Simulation Assumption] Nhà máy than có chi phí biến đổi 35 USD/MWh; giá điện giảm còn 30 USD/MWh; sản lượng 40 TWh/năm. Lãi (lỗ) biên mỗi năm (triệu USD, số âm nếu lỗ)?', a: A.txuCsHit, tol: 1, unit: 'triệu USD', fb: fb('40.000.000 MWh × (30 − 35) = −200 triệu USD.', 'Contribution margin per MWh × volume.', 'Chỉ chạy khi giá > chi phí biến đổi.', 'Chuyển sang chạy theo giờ cao điểm, tạm dừng (mothball) hoặc đóng cửa.', 'Merit order', 'TXU — Consulting') },
      { type: 'choice', id: 'r_txu_cs_c', q: 'Khuyến nghị cho danh mục nhà máy:', grade: true, best: [0], opts: [
        { t: 'Xếp hạng nhà máy theo chi phí biến đổi; chỉ vận hành khi giá vượt chi phí; tạm dừng hoặc đóng nhà máy lỗ cấu trúc; giảm chi phí cố định', out: 'Đúng: quyết định vận hành dựa trên biên đóng góp, không dựa trên chi phí đã bỏ ra.' },
        { t: 'Chạy hết công suất để "giữ thị phần"', out: 'Mỗi MWh bán ra làm lỗ thêm — sunk cost fallacy.' },
      ] },
    ], rewards: { xp: 25 } },

  { ...base('r_txu_im', 'txu_efh', 'im', 'TXU qua lăng kính nhà đầu tư nợ xấu', 'Bạn là quỹ distressed debt năm 2013: mua trái phiếu ở giá rẻ trước khi tái cấu trúc.', 'h_txu'),
    steps: [
      { type: 'say', lines: [['tung', 'Khi cổ phần gần như mất trắng, cuộc chơi chuyển sang trái phiếu. Câu hỏi là: hạng nợ nào sẽ trở thành chủ sở hữu mới?']], terms: ['Fulcrum Security'] },
      { type: 'num', id: 'r_txu_im_r', concept: 'irr_moic', q: '[Simulation Assumption] Mua trái phiếu ở 30 cent/USD mệnh giá; kỳ vọng thu hồi 45 cent sau tái cấu trúc. Lợi nhuận (%)?', a: A.txuImRet, tol: 0.5, unit: '%', fb: fb('45 / 30 − 1 = 50%.', 'Distressed return = expected recovery / purchase price − 1.', 'So với giá mua, không phải mệnh giá.', 'Nếu thu hồi thực tế chỉ 20 cent, bạn lỗ 33% — rủi ro định giá thu hồi.', 'Distressed debt', 'TXU — Investor') },
      { type: 'quiz', id: 'r_txu_im_q', concept: 'covenants', q: '"Fulcrum security" là gì?', opts: ['Cổ phiếu phổ thông', 'Hạng nợ mà giá trị doanh nghiệp "dừng lại" ở đó — được thu hồi một phần và thường nhận cổ phần của công ty sau tái cấu trúc', 'Trái phiếu chính phủ'], a: 1, fb: fb('Xác định đúng fulcrum là kỹ năng cốt lõi của nhà đầu tư distressed.', 'The fulcrum is the most senior class not paid in full — it usually gets the new equity.', 'Đặt giá trị doanh nghiệp lên thác nợ.', 'Mua đúng hạng nợ = có tiếng nói trong tái cấu trúc.', 'Fulcrum security', 'TXU — Investor') },
    ], rewards: { xp: 25 } },

  { ...base('r_cel_ib', 'bms_celgene', 'ib', 'Celgene qua lăng kính IB', 'Bạn cố vấn cho Celgene: thị trường định giá CVR thế nào, và điều khoản nào cần đàm phán kỹ?', 'h_celgene'),
    steps: [
      { type: 'say', lines: [['victor', 'CVR trả 9 USD nếu ba thuốc được duyệt trước hạn chót — Verified Fact. Sau khi CVR được niêm yết, giá giao dịch cho ta biết thị trường nghĩ gì.']] },
      { type: 'num', id: 'r_cel_ib_p', concept: 'deal_certainty', q: '[Simulation Assumption] CVR giao dịch ở 2,0 USD. Xác suất ngầm định thị trường gán cho việc trả 9 USD (%, 1 chữ số, bỏ qua chiết khấu thời gian)?', a: r1(A.celIbProb), tol: 0.2, unit: '%', fb: fb('2 / 9 ≈ 22,2%.', 'Implied probability = price / payout (ignoring discounting).', 'Đảo ngược công thức giá trị kỳ vọng.', 'Thấp hơn nhiều so với xác suất mà bên bán kỳ vọng — tín hiệu thị trường nghi ngờ thời hạn.', 'Implied probability', 'Celgene — IB') },
      { type: 'quiz', id: 'r_cel_ib_q', concept: 'deal_certainty', q: 'Điều khoản nào của CVR bên bán cần đàm phán kỹ nhất?', opts: ['Màu sắc chứng chỉ', 'Định nghĩa mốc phê duyệt, hạn chót, và nghĩa vụ "nỗ lực hợp lý" của bên mua trong việc theo đuổi phê duyệt', 'Tên của CVR'], a: 1, fb: fb('Bên mua kiểm soát tiến độ sau khi hoàn tất — nên nghĩa vụ nỗ lực rất quan trọng.', 'Milestone definitions, deadlines and efforts covenants determine CVR value.', 'Ai kiểm soát kết quả?', 'Tranh chấp CVR thường xoay quanh các điều khoản này.', 'CVR terms', 'Celgene — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_cel_cd', 'bms_celgene', 'cd', 'Celgene qua lăng kính Corp Dev', 'Bạn ở đội M&A của BMS: nhường bao nhiêu phần công ty, và remedy ảnh hưởng gì đến giá?', 'h_celgene'),
    steps: [
      { type: 'say', lines: [['hung', 'Để được chấp thuận, Celgene bán Otezla cho Amgen với khoảng 13,4 tỷ USD — Verified Fact. Đó vừa là remedy vừa là nguồn tiền giảm nợ.']] },
      { type: 'num', id: 'r_cel_cd_o', concept: 'stock_deal', q: '[Simulation Assumption] BMS có 1.630 triệu cổ phiếu; phát hành 700 triệu cổ phiếu mới cho cổ đông Celgene. Cổ đông Celgene sở hữu bao nhiêu % công ty hợp nhất (1 chữ số)?', a: r1(A.celCdOwn), tol: 0.1, unit: '%', fb: fb('700 / 2.330 ≈ 30,0%.', 'Pro forma ownership from new shares issued.', 'Cộng cổ phiếu mới vào mẫu số.', 'Cổ đông Celgene trở thành nhóm lớn — chia sẻ rủi ro pipeline của công ty hợp nhất.', 'Pro forma ownership', 'Celgene — Corp Dev') },
      { type: 'quiz', id: 'r_cel_cd_q', concept: 'synergy', q: 'Vì sao bán một thuốc lớn như Otezla vẫn có thể chấp nhận được với BMS (Analyst Interpretation)?', opts: ['Vì thuốc không có doanh thu', 'Nó giải quyết chồng lấn ngành (vẩy nến) mà cơ quan cạnh tranh lo ngại, thu về tiền mặt lớn để giảm nợ, và giá trị cốt lõi của thương vụ nằm ở các mảng khác', 'Vì Amgen bắt buộc phải mua'], a: 1, fb: fb('Remedy tốt nhắm đúng chồng lấn và vẫn giữ luận điểm.', 'A well-priced divestiture can satisfy regulators and fund deleveraging.', 'Liên hệ CVS/Aetna và Activision.', 'Corp Dev nên lập kịch bản remedy ngay từ khi định giá.', 'Divestiture remedy', 'Celgene — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_cel_pe', 'bms_celgene', 'pe', 'Celgene qua lăng kính PE (royalty)', 'Quỹ PE không mua cả công ty dược khổng lồ — nhưng có thể mua một dòng royalty.', 'h_celgene'),
    steps: [
      { type: 'say', lines: [['sophia', 'Ở quy mô gần 74 tỷ USD và rủi ro pipeline, LBO là không khả thi. Nhưng các quỹ chuyên ngành y tế thường mua dòng royalty hoặc tài trợ phát triển thuốc.']] },
      { type: 'num', id: 'r_cel_pe_m', concept: 'irr_moic', q: '[Simulation Assumption] Trả 1 tỷ USD để nhận 5% doanh thu một thuốc; doanh thu 8 tỷ USD/năm trong 8 năm. MOIC (x, 1 chữ số)?', a: r1(A.celPeMoic), tol: 0.05, unit: 'x', fb: fb('5% × 8 × 8 = 3,2 tỷ → 3,2x.', 'Royalty MOIC = cumulative royalty / purchase price.', 'Cộng dồn dòng tiền.', 'Rủi ro: doanh thu thấp hơn dự báo, cạnh tranh, mất bảo hộ sáng chế sớm.', 'Royalty financing', 'Celgene — PE') },
      { type: 'quiz', id: 'r_cel_pe_q', concept: 'healthcare', q: 'Ưu điểm của mua royalty so với mua cổ phần công ty dược?', opts: ['Không có rủi ro', 'Tiếp xúc trực tiếp với doanh thu một thuốc cụ thể, ưu tiên trước cổ đông, không gánh chi phí R&D và rủi ro của toàn bộ pipeline', 'Được bầu vào HĐQT'], a: 1, fb: fb('Royalty là cách "khoanh vùng" rủi ro.', 'Royalties isolate exposure to a product’s sales without corporate risk.', 'So sánh cấu trúc vốn.', 'Đổi lại không hưởng upside của pipeline mới.', 'Structured healthcare finance', 'Celgene — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_cel_cs', 'bms_celgene', 'cs', 'Celgene qua lăng kính Consulting', 'Bạn hỗ trợ ưu tiên hoá danh mục R&D hợp nhất bằng rNPV.', 'h_celgene'),
    steps: [
      { type: 'say', lines: [['diep', 'Sau sáp nhập, công ty có hàng trăm chương trình R&D. Ngân sách có hạn — ta cần một thước đo chung.']] },
      { type: 'num', id: 'r_cel_cs_r', concept: 'healthcare', q: '[Simulation Assumption] Thuốc có NPV 6 tỷ USD nếu được duyệt, xác suất thành công 60%, chi phí phát triển còn lại 0,5 tỷ. rNPV (tỷ USD, 1 chữ số)?', a: r1(A.celCsRnpv), tol: 0.05, unit: 'tỷ USD', fb: fb('0,6 × 6 − 0,5 = 3,1 tỷ USD.', 'rNPV = probability-weighted value − remaining cost.', 'Trọng số xác suất.', 'Xếp hạng chương trình theo rNPV trên mỗi đồng chi phí.', 'rNPV', 'Celgene — Consulting') },
      { type: 'quiz', id: 'r_cel_cs_q', concept: 'synergy', q: 'Rủi ro tích hợp lớn nhất của hai tổ chức R&D?', opts: ['Đổi logo', 'Mất nhà khoa học chủ chốt và chậm tiến độ thử nghiệm do tái tổ chức — điều cũng ảnh hưởng trực tiếp đến hạn chót của CVR', 'Thiếu phòng họp'], a: 1, fb: fb('Con người và tiến độ là giá trị thật của R&D.', 'Talent retention and trial continuity are the core R&D integration risks.', 'Liên hệ Disney/Pixar.', 'Tích hợp chậm có thể khiến mốc CVR bị lỡ.', 'R&D integration', 'Celgene — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_cel_im', 'bms_celgene', 'im', 'Celgene qua lăng kính nhà đầu tư', 'Bạn nắm cổ phiếu BMS: thương vụ thay đổi đòn bẩy và hồ sơ rủi ro của công ty bạn sở hữu.', 'h_celgene'),
    steps: [
      { type: 'say', lines: [['tung', 'Một số cổ đông của bên mua lo ngại về giá và rủi ro pipeline. Hãy xem bảng cân đối sau thương vụ trông thế nào.']] },
      { type: 'num', id: 'r_cel_im_l', concept: 'covenants', q: '[Simulation Assumption] Nợ ròng tăng thêm 35 tỷ USD; EBITDA hợp nhất 20 tỷ USD. Nợ ròng / EBITDA (x, 2 chữ số)?', a: Math.round(A.celImLev * 100) / 100, tol: 0.01, unit: 'x', fb: fb('35 / 20 = 1,75x.', 'Pro forma leverage frames the deleveraging plan.', 'Nợ / EBITDA.', 'Theo dõi kế hoạch giảm nợ và cổ tức.', 'Pro forma leverage', 'Celgene — Investor') },
      { type: 'choice', id: 'r_cel_im_c', q: 'Câu hỏi bạn đặt ra cho ban lãnh đạo BMS:', grade: true, best: [0], opts: [
        { t: 'Lộ trình giảm nợ, kế hoạch bù đắp doanh thu khi các thuốc chủ lực hết bảo hộ, và cột mốc pipeline theo năm — cùng cách thưởng của ban lãnh đạo gắn với các mốc đó', out: 'Đúng: câu hỏi gắn với rủi ro thật của thương vụ và động lực của ban lãnh đạo.' },
        { t: 'Bao giờ giá cổ phiếu tăng lại?', out: 'Ban lãnh đạo không trả lời được — và câu hỏi không giúp bạn định giá.' },
      ] },
    ], rewards: { xp: 25 } },
);

Object.assign(REPLAYS, {
  txu_efh: { title: 'TXU / Energy Future Holdings', quests: { ib: 'r_txu_ib', cd: 'r_txu_cd', pe: 'r_txu_pe', cs: 'r_txu_cs', im: 'r_txu_im' },
    roles: { ib: 'Cố vấn tái cấu trúc (2014)', cd: 'Công ty điện mua tài sản từ phá sản', pe: 'Thành viên IC năm 2007', cs: 'Tư vấn danh mục nhà máy', im: 'Quỹ distressed debt' },
    map: {
      ib: ['Ai nhận gì khi giá trị thấp hơn nợ?', 'Thác thu hồi và absolute priority — vốn chủ bị xoá trắng.'],
      cd: ['Tài sản nào đáng mua từ phá sản?', 'Mảng lưới điện được rào chắn, định giá theo rate base.'],
      pe: ['Luận điểm phụ thuộc biến số nào?', 'Giá khí đốt — hedging chỉ mua thời gian.'],
      cs: ['Nhà máy nào còn tạo ra tiền?', 'Vận hành theo biên đóng góp, không theo chi phí đã bỏ ra.'],
      im: ['Hạng nợ nào sẽ thành chủ sở hữu mới?', 'Tìm fulcrum security; lợi nhuận phụ thuộc ước tính thu hồi.'],
    } },
  bms_celgene: { title: 'Bristol Myers Squibb / Celgene', quests: { ib: 'r_cel_ib', cd: 'r_cel_cd', pe: 'r_cel_pe', cs: 'r_cel_cs', im: 'r_cel_im' },
    roles: { pe: 'Quỹ royalty y tế', cs: 'Tư vấn ưu tiên hoá R&D' },
    map: {
      ib: ['Thị trường định giá CVR thế nào?', 'Xác suất ngầm định ~22% (mô phỏng); điều khoản nỗ lực là then chốt.'],
      cd: ['Nhường bao nhiêu công ty, remedy tác động gì?', '~30% cho cổ đông Celgene (mô phỏng); bán Otezla vừa là remedy vừa giảm nợ.'],
      pe: ['PE tham gia thế nào khi LBO bất khả?', 'Mua royalty — khoanh vùng rủi ro một thuốc.'],
      cs: ['Ưu tiên hàng trăm chương trình R&D?', 'Xếp hạng theo rNPV; giữ nhà khoa học và tiến độ.'],
      im: ['Bảng cân đối sau thương vụ ra sao?', 'Theo dõi lộ trình giảm nợ, patent cliff và mốc pipeline.'],
    } },
});

// ───────── AOL / Time Warner (2000) & KKR / RJR Nabisco (1988) ─────────
// sim AOL: EBITDA TW 6.5 / AOL 1.6; AOL NI 1.2bn on 2.6bn shares, 2.1bn new shares for TW NI 2.0; carve-out 2.6 / 0.33; synergy 1.0 × 30% × 15x; goodwill 130 vs 31
// sim RJR: bridge 5bn at 14%; debt 22 / EBITDA 2.8, sell divisions 5bn at 12x; equity 1.5 of 25; overhead 0.3 × 9x; bonds 100 → 80
Object.assign(A, {
  aolIbContrib: 6.5 / (6.5 + 1.6) * 100,
  aolCdEps: ((1.2 + 2.0) / (2.6 + 2.1) / (1.2 / 2.6) - 1) * 100,
  aolPeMult: 2.6 / 0.33,
  aolCsGap: 1.0 * (1 - 0.3) * 15,
  aolImImp: 130 - 31,
  rjrIbInt: 5 * 0.14,
  rjrCdLev: (22 - 5) / (2.8 - 5 / 12),
  rjrPeEq: 1.5 / 25 * 100,
  rjrCsVal: 0.3 * 9,
  rjrImLoss: (80 / 100 - 1) * 100,
});

REPLAY_QUESTS.push(
  { ...base('r_aol_ib', 'aol_timewarner', 'ib', 'AOL/Time Warner qua lăng kính IB', 'Bạn cố vấn cho Time Warner: bên đóng góp phần lớn lợi nhuận lại nhận phần nhỏ hơn của công ty mới.', 'h_aol'),
    steps: [
      { type: 'say', lines: [['victor', 'Cổ đông AOL sở hữu khoảng 55% công ty hợp nhất — Verified Fact. Phân tích đóng góp (contribution analysis) cho Hội đồng quản trị thấy mỗi bên mang vào bao nhiêu.']], terms: ['Contribution Analysis'] },
      { type: 'num', id: 'r_aol_ib_c', concept: 'stock_deal', q: '[Simulation Assumption] EBITDA Time Warner 6,5 tỷ USD, AOL 1,6 tỷ USD. Time Warner đóng góp bao nhiêu % EBITDA hợp nhất (1 chữ số)?', a: r1(A.aolIbContrib), tol: 0.2, unit: '%', fb: fb('6,5 / 8,1 ≈ 80,2% EBITDA — nhưng chỉ nhận ~45% sở hữu.', 'Contribution analysis compares what each side brings with what it owns.', 'So đóng góp với tỷ lệ sở hữu.', 'Khoảng cách lớn chỉ hợp lý nếu tăng trưởng của bên kia thật sự bền vững.', 'Contribution analysis', 'AOL — IB') },
      { type: 'quiz', id: 'r_aol_ib_q', concept: 'stock_deal', q: 'Câu hỏi then chốt cố vấn bên bán phải đặt ra khi nhận cổ phiếu của một công ty định giá rất cao?', opts: ['Logo có đẹp không', 'Bội số của cổ phiếu bên mua có bền vững không — nếu giảm về mức ngành, giá trị nhận được còn bao nhiêu, và có cơ chế bảo vệ (collar, một phần tiền mặt) không?', 'Bên mua có bao nhiêu nhân viên'], a: 1, fb: fb('Nhận cổ phiếu = đầu tư vào bên mua.', 'Stock consideration makes sellers investors in the buyer’s valuation.', 'Stress-test giá bên mua.', 'Đòi một phần tiền mặt hoặc collar khi định giá bên mua là bong bóng.', 'Currency risk', 'AOL — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_aol_cd', 'aol_timewarner', 'cd', 'AOL/Time Warner qua lăng kính Corp Dev', 'Bạn ở đội M&A của AOL: cổ phiếu P/E cao làm thương vụ "tăng EPS" — nhưng có tạo giá trị?', 'h_aol'),
    steps: [
      { type: 'say', lines: [['hung', 'Khi cổ phiếu của ta có P/E rất cao, mua công ty P/E thấp hơn bằng cổ phiếu gần như luôn làm EPS tăng. Đó là cái bẫy.']] },
      { type: 'num', id: 'r_aol_cd_e', concept: 'accretion', q: '[Simulation Assumption] AOL: lợi nhuận 1,2 tỷ USD, 2,6 tỷ cổ phiếu. Phát hành 2,1 tỷ cổ phiếu để mua Time Warner (lợi nhuận 2,0 tỷ). Thay đổi EPS (%, 1 chữ số)?', a: r1(A.aolCdEps), tol: 0.2, unit: '%', fb: fb('EPS mới 3,2 / 4,7 ≈ 0,681 so với 0,462 → khoảng +47,5%.', 'High-P/E acquirers paying in stock mechanically show EPS accretion.', 'Accretion/dilution.', 'EPS tăng không có nghĩa giá trị tăng — phải hỏi giá trả có thấp hơn giá trị nhận không.', 'Accretion ≠ value', 'AOL — Corp Dev') },
      { type: 'quiz', id: 'r_aol_cd_q', concept: 'synergy', q: 'Vì sao "tăng EPS" là thước đo sai cho thương vụ này (Analyst Interpretation)?', opts: ['Vì EPS không quan trọng', 'Accretion đến từ chênh lệch P/E, không từ tạo giá trị; nếu P/E của bên mua về mức hợp lý, cổ đông bên mua đã đổi tài sản thật lấy phần trăm của một công ty định giá quá cao', 'Vì EPS luôn giảm'], a: 1, fb: fb('Giá trị = dòng tiền và synergy thật, không phải phép tính kế toán.', 'Accretion from multiple arbitrage is not value creation.', 'Quay lại DCF và synergy.', 'Corp Dev nên trình bày giá trị nội tại, không chỉ EPS.', 'Value vs accounting', 'AOL — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_aol_pe', 'aol_timewarner', 'pe', 'AOL/Time Warner qua lăng kính PE (carve-out)', 'Vài năm sau, tập đoàn cần giảm nợ và bán bớt mảng — cơ hội cho quỹ PE.', 'h_aol'),
    steps: [
      { type: 'say', lines: [['sophia', 'Năm 2004, Time Warner bán mảng âm nhạc Warner Music cho một nhóm nhà đầu tư có các quỹ PE — Verified Fact. Tập đoàn đang chịu áp lực thì thường bán những mảng "không cốt lõi".']], terms: ['Carve-out'] },
      { type: 'num', id: 'r_aol_pe_m', concept: 'valuation_multiple', q: '[Simulation Assumption] Giá mua 2,6 tỷ USD; EBITDA 0,33 tỷ USD. EV/EBITDA (x, 1 chữ số)?', a: r1(A.aolPeMult), tol: 0.1, unit: 'x', fb: fb('2,6 / 0,33 ≈ 7,9x.', 'Motivated corporate sellers can mean reasonable entry multiples.', 'EV / EBITDA.', 'Rẻ hơn nhiều so với bội số tập đoàn trả khi sáp nhập.', 'Carve-out pricing', 'AOL — PE') },
      { type: 'quiz', id: 'r_aol_pe_q', concept: 'lbo', q: 'Vì sao carve-out từ tập đoàn thường hấp dẫn với quỹ PE?', opts: ['Vì luôn miễn phí', 'Người bán có động lực (cần giảm nợ, tập trung), mảng bị "bỏ quên" có dư địa cắt chi phí và tập trung quản lý — đổi lại phải xây lại các chức năng dùng chung (TSA, IT, tài chính)', 'Vì không cần thẩm định'], a: 1, fb: fb('Carve-out = cơ hội + độ phức tạp tách tách.', 'Carve-outs offer motivated sellers and neglected assets, at the cost of separation complexity.', 'Ai cần bán, vì sao.', 'Thoả thuận dịch vụ chuyển tiếp (TSA) là workstream bắt buộc.', 'Carve-out', 'AOL — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_aol_cs', 'aol_timewarner', 'cs', 'AOL/Time Warner qua lăng kính Consulting', 'Bạn được thuê sau thương vụ: synergy hứa hẹn không đến — vì sao, và mất bao nhiêu giá trị?', 'h_aol'),
    steps: [
      { type: 'say', lines: [['diep', 'Hai văn hoá rất khác nhau: một công ty internet tăng trưởng nhanh và một tập đoàn truyền thông lâu đời. Synergy giữa nội dung và phân phối nghe hợp lý trên giấy.']] },
      { type: 'num', id: 'r_aol_cs_g', concept: 'synergy', q: '[Simulation Assumption] Synergy EBITDA hứa hẹn 1,0 tỷ USD/năm; chỉ đạt 30%; định giá 15x. Giá trị bị mất so với kế hoạch (tỷ USD, 1 chữ số)?', a: r1(A.aolCsGap), tol: 0.1, unit: 'tỷ USD', fb: fb('1,0 × 70% × 15 = 10,5 tỷ USD.', 'Unrealised synergies × multiple = value gap vs plan.', 'Phần không đạt × bội số.', 'Synergy doanh thu và văn hoá là phần hay thất bại nhất.', 'Synergy realisation', 'AOL — Consulting') },
      { type: 'quiz', id: 'r_aol_cs_q', concept: 'due_diligence', q: 'Thẩm định nào lẽ ra cần làm trước khi ký?', opts: ['Chỉ xem báo cáo tài chính', 'Thẩm định văn hoá và mô hình vận hành (ra quyết định, khuyến khích, ai báo cáo ai) cùng kế hoạch synergy có chủ sở hữu, mốc thời gian và KPI cụ thể', 'Kiểm tra màu logo'], a: 1, fb: fb('Synergy cần người chịu trách nhiệm và cơ chế khuyến khích phù hợp.', 'Cultural and operating-model diligence underpin synergy plans.', 'Liên hệ Disney/Pixar.', 'Kế hoạch PMI bắt đầu từ trước khi ký.', 'Cultural diligence', 'AOL — Consulting') },
    ], rewards: { xp: 25 } },

  { ...base('r_aol_im', 'aol_timewarner', 'im', 'AOL/Time Warner qua lăng kính nhà đầu tư', 'Năm 2002, công ty ghi nhận khoản lỗ khổng lồ do ghi giảm goodwill — bạn đọc con số này thế nào?', 'h_aol'),
    steps: [
      { type: 'say', lines: [['tung', 'Khoản lỗ khoảng 99 tỷ USD năm 2002 chủ yếu là ghi giảm goodwill — Verified Fact. Câu hỏi của nhà đầu tư: tiền mặt có mất thêm không, và bài học là gì?']], terms: ['Goodwill Impairment'] },
      { type: 'num', id: 'r_aol_im_i', concept: 'income_statement', q: '[Simulation Assumption] Goodwill trên sổ 130 tỷ USD; giá trị hợp lý chỉ còn hỗ trợ 31 tỷ. Khoản ghi giảm (tỷ USD)?', a: A.aolImImp, tol: 0.5, unit: 'tỷ USD', fb: fb('130 − 31 = 99 tỷ USD.', 'Impairment = carrying goodwill − amount supported by fair value.', 'So giá trị sổ sách với giá trị hợp lý.', 'Khoản lỗ không dùng tiền mặt — giá trị đã mất từ lúc trả giá quá cao.', 'Goodwill impairment', 'AOL — Investor') },
      { type: 'quiz', id: 'r_aol_im_q', concept: 'income_statement', q: 'Ý nghĩa đúng của khoản ghi giảm goodwill với nhà đầu tư?', opts: ['Công ty vừa mất 99 tỷ USD tiền mặt trong năm', 'Không tốn tiền mặt trong kỳ, nhưng là sự thừa nhận rằng giá trả cho thương vụ cao hơn giá trị nhận được — giá trị đã bị phá huỷ từ lúc thương vụ được ký', 'Không có ý nghĩa gì'], a: 1, fb: fb('Ghi giảm là kế toán ghi nhận muộn một quyết định sai.', 'Impairments are non-cash but confirm value destroyed at acquisition.', 'Phân biệt dòng tiền và kế toán.', 'Theo dõi lịch sử ghi giảm khi đánh giá kỷ luật M&A của ban lãnh đạo.', 'Capital allocation', 'AOL — Investor') },
    ], rewards: { xp: 25 } },

  { ...base('r_rjr_ib', 'rjr_kkr', 'ib', 'RJR Nabisco qua lăng kính IB', 'Bạn thu xếp tài chính cho bên thắng: khoản vay bắc cầu khổng lồ phải được thay bằng trái phiếu.', 'h_rjr'),
    steps: [
      { type: 'say', lines: [['victor', 'Thương vụ được tài trợ chủ yếu bằng nợ: vay ngân hàng và trái phiếu lợi suất cao — Verified Fact. Ngân hàng đầu tư cho vay bắc cầu trước, rồi phát hành trái phiếu để trả.']], terms: ['Bridge Loan'] },
      { type: 'num', id: 'r_rjr_ib_i', concept: 'covenants', q: '[Simulation Assumption] Khoản vay bắc cầu 5 tỷ USD được thay bằng trái phiếu lãi suất 14%. Chi phí lãi mỗi năm (tỷ USD, 1 chữ số)?', a: r1(A.rjrIbInt), tol: 0.05, unit: 'tỷ USD', fb: fb('5 × 14% = 0,7 tỷ USD/năm.', 'Interest burden = principal × coupon.', 'Nhân lãi suất.', 'Nếu thị trường trái phiếu đóng cửa, ngân hàng bị "kẹt" với khoản bắc cầu.', 'Bridge financing', 'RJR — IB') },
      { type: 'quiz', id: 'r_rjr_ib_q', concept: 'deal_certainty', q: 'Rủi ro lớn nhất của ngân hàng khi cam kết vay bắc cầu cho LBO?', opts: ['Không có rủi ro', 'Nếu thị trường trái phiếu xấu đi trước khi kịp phát hành, ngân hàng phải giữ khoản vay rủi ro cao trên bảng cân đối của mình (hung bridge)', 'Lãi suất quá thấp'], a: 1, fb: fb('Cam kết tài trợ là cam kết vốn của chính ngân hàng.', 'Bridge commitments expose banks to syndication/market risk.', 'Ai gánh rủi ro thị trường.', 'Ngân hàng đòi phí cao và điều khoản "flex" để bù.', 'Underwriting risk', 'RJR — IB') },
    ], rewards: { xp: 25 } },

  { ...base('r_rjr_cd', 'rjr_kkr', 'cd', 'RJR Nabisco qua lăng kính Corp Dev', 'Bạn ở đội M&A của một tập đoàn thực phẩm: mua lại thương hiệu mà chủ mới phải bán để giảm nợ.', 'h_rjr'),
    steps: [
      { type: 'say', lines: [['hung', 'Sau LBO, chủ sở hữu mới phải bán bớt mảng để trả nợ. Với người mua chiến lược, đây là cơ hội mua thương hiệu mạnh từ một người bán có áp lực.']] },
      { type: 'num', id: 'r_rjr_cd_l', concept: 'covenants', q: '[Simulation Assumption] Nợ 22 tỷ USD, EBITDA 2,8 tỷ. Bán các mảng 5 tỷ USD ở 12x EBITDA và dùng toàn bộ để trả nợ. Nợ/EBITDA mới (x, 1 chữ số)?', a: r1(A.rjrCdLev), tol: 0.1, unit: 'x', fb: fb('(22 − 5) / (2,8 − 5/12) ≈ 17 / 2,38 ≈ 7,1x (trước đó 7,9x).', 'Selling at a multiple above leverage reduces Debt/EBITDA.', 'Mẫu số cũng giảm vì mất EBITDA.', 'Bán ở bội số cao hơn đòn bẩy hiện tại mới giúp giảm tỷ lệ nợ.', 'Deleveraging asset sales', 'RJR — Corp Dev') },
      { type: 'quiz', id: 'r_rjr_cd_q', concept: 'synergy', q: 'Vì sao người mua chiến lược có thể trả 12x trong khi cả công ty được LBO thấp hơn?', opts: ['Vì họ không biết tính', 'Họ có synergy phân phối, sản xuất và mua hàng cho thương vụ cụ thể; và mua một mảng tập trung dễ tích hợp hơn mua cả tập đoàn', 'Vì luật bắt buộc'], a: 1, fb: fb('Tổng giá trị các phần có thể lớn hơn tổng thể.', 'Strategic buyers can pay for synergies in focused assets (sum-of-the-parts).', 'Sum-of-the-parts.', 'Chủ PE thường lập kế hoạch bán mảng từ trước khi mua.', 'Sum-of-the-parts', 'RJR — Corp Dev') },
    ], rewards: { xp: 25 } },

  { ...base('r_rjr_pe', 'rjr_kkr', 'pe', 'RJR Nabisco qua lăng kính PE', 'Bạn ở IC của quỹ: phần vốn chủ rất mỏng trong một thương vụ khổng lồ.', 'h_rjr'),
    steps: [
      { type: 'say', lines: [['sophia', 'Giá trị vốn chủ khoảng 25 tỷ USD — Verified Fact. Nhưng phần vốn chủ quỹ bỏ ra chỉ là một phần nhỏ; phần còn lại là nợ.']] },
      { type: 'num', id: 'r_rjr_pe_e', concept: 'lbo', q: '[Simulation Assumption] Quỹ góp 1,5 tỷ USD vốn chủ trong cấu trúc 25 tỷ USD. Tỷ lệ vốn chủ (%)?', a: A.rjrPeEq, tol: 0.1, unit: '%', fb: fb('1,5 / 25 = 6%.', 'Thin equity magnifies both returns and the risk of losing everything.', 'Vốn chủ / tổng giá trị.', 'Chỉ cần giá trị doanh nghiệp giảm vài phần trăm là vốn chủ bị xoá sạch.', 'Equity cushion', 'RJR — PE') },
      { type: 'quiz', id: 'r_rjr_pe_q', concept: 'lbo', q: 'Với 6% vốn chủ, câu hỏi IC quan trọng nhất là gì?', opts: ['Logo mới trông thế nào', 'Dòng tiền có đủ trả lãi trong kịch bản xấu không, và kế hoạch bán mảng/giảm nợ có thực hiện được đúng hạn không — nếu không, quỹ phải bơm thêm vốn hoặc mất quyền kiểm soát', 'Có nên tăng nợ thêm'], a: 1, fb: fb('Mức đệm vốn chủ quyết định khả năng sống sót.', 'With a thin cushion, debt service and deleveraging plans are the thesis.', 'Kiểm tra kịch bản xấu.', 'Liên hệ TXU: đòn bẩy cực cao không chừa biên an toàn.', 'Downside case', 'RJR — PE') },
    ], rewards: { xp: 25 } },

  { ...base('r_rjr_cs', 'rjr_kkr', 'cs', 'RJR Nabisco qua lăng kính Consulting', 'Bạn tư vấn cắt giảm chi phí: phần nào là lãng phí thật, phần nào là đầu tư vào thương hiệu?', 'h_rjr'),
    steps: [
      { type: 'say', lines: [['diep', 'Chủ mới muốn cắt chi phí để trả nợ. Chi phí văn phòng tập đoàn xa hoa là mục tiêu rõ ràng — nhưng ngân sách marketing của thương hiệu thực phẩm thì sao?']] },
      { type: 'num', id: 'r_rjr_cs_v', concept: 'valuation_multiple', q: '[Simulation Assumption] Cắt 0,3 tỷ USD chi phí tập đoàn mỗi năm, định giá 9x EBITDA. Giá trị tạo ra (tỷ USD, 1 chữ số)?', a: r1(A.rjrCsVal), tol: 0.05, unit: 'tỷ USD', fb: fb('0,3 × 9 = 2,7 tỷ USD.', 'Sustainable cost savings × multiple = value created.', 'Tiết kiệm bền vững × bội số.', 'Chỉ tính phần cắt giảm bền vững, không làm suy yếu doanh nghiệp.', 'Cost value creation', 'RJR — Consulting') },
      { type: 'choice', id: 'r_rjr_cs_c', q: 'Khuyến nghị cắt giảm:', grade: true, best: [0], opts: [
        { t: 'Cắt chi phí tập đoàn không tạo giá trị; giữ hoặc tối ưu (không cắt mù) ngân sách marketing và R&D sản phẩm của các thương hiệu chủ lực', out: 'Đúng: phân biệt lãng phí với đầu tư duy trì sức mạnh thương hiệu.' },
        { t: 'Cắt đồng loạt 20% mọi khoản chi, kể cả marketing', out: 'EBITDA tăng ngắn hạn, nhưng thị phần và sức định giá của thương hiệu suy yếu dần.' },
      ] },
    ], rewards: { xp: 25 } },

  { ...base('r_rjr_im', 'rjr_kkr', 'im', 'RJR Nabisco qua lăng kính trái chủ', 'Bạn nắm trái phiếu RJR hạng đầu tư trước LBO: thương vụ biến nó thành trái phiếu rủi ro cao chỉ sau một đêm.', 'h_rjr'),
    steps: [
      { type: 'say', lines: [['tung', 'Khi công ty vay thêm hàng chục tỷ USD, trái phiếu cũ bị đẩy xuống hạng rủi ro cao hơn. Sau thương vụ, có trái chủ lớn đã khởi kiện — và thị trường bắt đầu đòi điều khoản bảo vệ.']], terms: ['Event Risk Covenant'] },
      { type: 'num', id: 'r_rjr_im_l', concept: 'covenants', q: '[Simulation Assumption] Giá trái phiếu cũ giảm từ 100 xuống 80 sau khi LBO được công bố. Thay đổi giá trị (%)?', a: A.rjrImLoss, tol: 0.1, unit: '%', fb: fb('80 / 100 − 1 = −20%.', 'Leverage added by an LBO transfers value from existing bondholders to shareholders.', 'So giá trước và sau.', 'Đây là "event risk" mà trái chủ không được bảo vệ.', 'Event risk', 'RJR — Investor') },
      { type: 'quiz', id: 'r_rjr_im_q', concept: 'covenants', q: 'Điều khoản nào giúp trái chủ tự bảo vệ trong các đợt phát hành sau?', opts: ['Không có cách nào', 'Điều khoản thay đổi quyền kiểm soát (change-of-control put) và giới hạn nợ — cho phép trái chủ bán lại trái phiếu ở giá định trước nếu công ty bị mua bằng đòn bẩy', 'Tăng mệnh giá'], a: 1, fb: fb('Thị trường học từ sự kiện và định giá lại rủi ro.', 'Change-of-control puts and debt limits protect bondholders from event risk.', 'Đọc điều khoản trái phiếu.', 'Ngày nay các điều khoản này là tiêu chuẩn.', 'Bond covenants', 'RJR — Investor') },
    ], rewards: { xp: 25 } },
);

Object.assign(REPLAYS, {
  aol_timewarner: { title: 'AOL / Time Warner', quests: { ib: 'r_aol_ib', cd: 'r_aol_cd', pe: 'r_aol_pe', cs: 'r_aol_cs', im: 'r_aol_im' },
    roles: { ib: 'Cố vấn Hội đồng quản trị Time Warner', cd: 'Đội M&A của AOL', pe: 'Quỹ mua carve-out (2004)', cs: 'Tư vấn hậu sáp nhập', im: 'Nhà đầu tư đọc báo cáo 2002' },
    map: {
      ib: ['Bên đóng góp nhiều nhận bao nhiêu?', '~80% EBITDA đổi lấy ~45% sở hữu (mô phỏng) — rủi ro tiền tệ cổ phiếu.'],
      cd: ['EPS tăng có nghĩa là tạo giá trị?', 'Không: accretion đến từ chênh lệch P/E.'],
      pe: ['Cơ hội nào cho quỹ khi tập đoàn gặp khó?', 'Carve-out từ người bán có động lực, ở bội số hợp lý.'],
      cs: ['Vì sao synergy không đến?', 'Văn hoá và mô hình vận hành — thẩm định trước khi ký.'],
      im: ['Khoản lỗ 99 tỷ nghĩa là gì?', 'Không tốn tiền mặt — giá trị đã mất từ lúc trả giá quá cao.'],
    } },
  rjr_kkr: { title: 'KKR / RJR Nabisco', quests: { ib: 'r_rjr_ib', cd: 'r_rjr_cd', pe: 'r_rjr_pe', cs: 'r_rjr_cs', im: 'r_rjr_im' },
    roles: { ib: 'Ngân hàng thu xếp tài trợ', cd: 'Tập đoàn thực phẩm mua lại thương hiệu', pe: 'Thành viên IC của quỹ', cs: 'Tư vấn cắt giảm chi phí', im: 'Trái chủ trước LBO' },
    map: {
      ib: ['Ai gánh rủi ro tài trợ?', 'Ngân hàng cho vay bắc cầu — kẹt nếu thị trường trái phiếu đóng.'],
      cd: ['Mua gì từ người bán bị áp lực nợ?', 'Thương hiệu tập trung, bán ở bội số cao hơn đòn bẩy → giảm nợ.'],
      pe: ['6% vốn chủ có đủ an toàn?', 'Kịch bản xấu và kế hoạch giảm nợ chính là luận điểm.'],
      cs: ['Cắt gì, giữ gì?', 'Cắt lãng phí tập đoàn, không cắt mù đầu tư thương hiệu.'],
      im: ['Trái chủ cũ mất gì?', 'Event risk — từ đó có điều khoản change-of-control.'],
    } },
});

export const REPLAY_IDS = REPLAY_QUESTS.map((q) => q.id);
export { base as replayBase, fb as replayFb };

// Missions for the 10 archive case files. Every number used for calculation that is not a Verified Fact in the
// case file is announced as a Simulation Assumption in the question itself.
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

const A = {
  lnkdPrem: (196 / 131.1 - 1) * 100,          // sim undisturbed 131.1
  lnkdEvRev: 26.2 / 3.6,                       // sim revenue 3.6bn
  emcPkg: 24.05 + 0.111 * 81,                  // sim: cash 24.05 + 0.111 tracking shares × 81
  vmwStock: 0.252 * 600,                       // sim: 0.252 shares × 600
  hcaDpi: 4.3 / 5.3,                           // sim dividends / equity
  seagenFill: (10 / 17) * 100,                 // sim: 10bn of a 17bn gap
  aetnaPkg: 145 + 0.8378 * 74,                 // sim CVS price 74
  dukeVal: 0.475 * 125,                        // sim PLD price 125
  dukeCap: 1.0 / 0.038,                        // sim NOI 1.0bn / cap 3.8%
  psEvArr: 5600 / 700,                         // sim ARR 700m
  neoenMw: 8000 * 0.35,                        // sim pipeline × success rate
  anthPct: (4 / 40) * 100,                     // sim post-money 40
};
export const CASE2_ANSWERS = A;

const base = (id, title, kase, summary) => ({ id, title, kind: 'case', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: kase, summary });

export const CASE2_QUESTS = [
  { ...base('h_linkedin', 'Hồ sơ: Microsoft / LinkedIn (2016)', 'ms_linkedin', 'Trả giá cao cho dữ liệu mạng lưới — và giữ LinkedIn "độc lập nhưng tích hợp".'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Microsoft trả 196 USD/cổ phiếu tiền mặt, khoảng 26,2 tỷ USD. LinkedIn tiếp tục vận hành như một thương hiệu độc lập.']] },
      { type: 'num', id: 'h_lnk_prem', concept: 'comps', q: '[Simulation Assumption] Giá trước công bố 131,1 USD. Premium (%, ±0,5)?', a: r1(A.lnkdPrem), tol: 0.5, unit: '%', fb: fb('196 / 131,1 − 1 ≈ 49,5%.', 'Premium over undisturbed price.', 'So với giá trước tin.', 'Premium cao phản ánh giá trị chiến lược của dữ liệu với Microsoft.', 'Control premium', 'Hồ sơ LinkedIn') },
      { type: 'num', id: 'h_lnk_evrev', concept: 'comps', q: '[Simulation Assumption] Doanh thu năm khoảng 3,6 tỷ USD. EV/Revenue (x, 1 chữ số thập phân)?', a: r1(A.lnkdEvRev), tol: 0.1, unit: 'x', fb: fb('26,2 / 3,6 ≈ 7,3x.', 'EV/Revenue is used when profits are depressed by growth investment.', 'Chia giá trị cho doanh thu.', 'Bội số doanh thu cao cần được biện minh bằng synergy và tăng trưởng.', 'EV/Revenue', 'Hồ sơ LinkedIn') },
      { type: 'quiz', id: 'h_lnk_model', concept: 'synergy', q: 'Lợi ích chính của mô hình "độc lập nhưng tích hợp" (Analyst Interpretation)?', opts: ['Tránh phải trả thuế', 'Giữ văn hoá, thương hiệu và người dùng của LinkedIn, trong khi vẫn kết nối dữ liệu với Office/Dynamics để tạo synergy doanh thu', 'Để có thể bán lại nhanh'], a: 1, fb: fb('Tích hợp quá mạnh có thể phá huỷ giá trị đã mua.', 'Light-touch integration preserves culture while enabling targeted synergies.', 'So sánh với Disney/Pixar.', 'Mức độ tích hợp là quyết định chiến lược, không mặc định.', 'PMI', 'Hồ sơ LinkedIn') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_badge'] } },

  { ...base('h_dell_emc', 'Hồ sơ: Dell / EMC (2016)', 'dell_emc', 'Khi bên mua không có cổ phiếu niêm yết: tracking stock và khoản nợ khổng lồ.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Dell — đã tư nhân hoá — mua EMC với khoảng 67 tỷ USD. Cổ đông EMC nhận tiền mặt cộng tracking stock gắn với cổ phần VMware.']], terms: ['Tracking Stock'] },
      { type: 'num', id: 'h_dell_pkg', concept: 'stock_deal', q: '[Simulation Assumption] Mỗi cổ phiếu EMC nhận 24,05 USD tiền mặt và 0,111 tracking stock; tracking stock giao dịch ở 81 USD. Tổng giá trị (USD, 2 chữ số)?', a: r2(A.emcPkg), tol: 0.02, unit: 'USD', fb: fb('24,05 + 0,111 × 81 ≈ 33,04.', 'Mixed consideration valued at market price of each component.', 'Cộng tiền mặt và giá trị phần cổ phiếu.', 'Giá trị phần tracking stock biến động — rủi ro chuyển sang cổ đông bên bán.', 'Mixed consideration', 'Hồ sơ Dell/EMC') },
      { type: 'quiz', id: 'h_dell_why', concept: 'stock_deal', q: 'Vì sao Dell dùng tracking stock?', opts: ['Vì luật bắt buộc', 'Dell không có cổ phiếu niêm yết để trả; tracking stock cho cổ đông EMC tiếp tục hưởng lợi từ VMware mà không cần Dell trả toàn bộ bằng tiền mặt', 'Để tránh trả cổ tức'], a: 1, fb: fb('Tracking stock là "cổ phiếu" phản ánh hiệu quả của một phần doanh nghiệp.', 'Tracking stock lets a private acquirer offer equity-like value tied to a business segment.', 'Thiếu tiền tệ cổ phiếu niêm yết.', 'Cấu trúc phức tạp thường đi kèm xung đột lợi ích giữa các nhóm cổ đông.', 'Tracking stock', 'Hồ sơ Dell/EMC') },
      { type: 'quiz', id: 'h_dell_debt', concept: 'lbo', q: 'Rủi ro lớn nhất của việc tài trợ bằng khoản nợ rất lớn trong ngành phần cứng?', opts: ['Không có rủi ro', 'Ngành có chu kỳ và thay đổi công nghệ nhanh (chuyển sang cloud) — dòng tiền có thể giảm trong khi nghĩa vụ trả nợ cố định', 'Lãi suất luôn giảm'], a: 1, fb: fb('Đòn bẩy cao cần dòng tiền ổn định.', 'High leverage plus technological disruption risk is a dangerous combination.', 'Liên hệ bài TXU.', 'Kế hoạch giảm nợ phải nằm trong luận điểm ngay từ đầu.', 'Leverage', 'Hồ sơ Dell/EMC') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_server'] } },

  { ...base('h_vmware', 'Hồ sơ: Broadcom / VMware (2023)', 'avgo_vmware', 'Lựa chọn tiền mặt hay cổ phiếu có phân bổ (proration), và chiến lược sau thâu tóm của Broadcom.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Broadcom mua VMware khoảng 61 tỷ USD bằng tiền mặt và cổ phiếu. Cổ đông được chọn nhận tiền hay cổ phiếu, nhưng tổng thể bị phân bổ theo tỷ lệ cố định.']], terms: ['Proration'] },
      { type: 'num', id: 'h_vmw_stock', concept: 'stock_deal', q: '[Simulation Assumption] Lựa chọn cổ phiếu: 0,252 cổ phiếu Broadcom, giá 600 USD. Giá trị (USD, 1 chữ số)?', a: r1(A.vmwStock), tol: 0.1, unit: 'USD', fb: fb('0,252 × 600 = 151,2 USD — cao hơn lựa chọn tiền mặt giả định 142,5 USD.', 'Stock election value = exchange ratio × acquirer price.', 'Nhân tỷ lệ với giá.', 'Khi cổ phiếu có giá trị cao hơn, nhiều người chọn cổ phiếu → bị phân bổ lại một phần thành tiền.', 'Election & proration', 'Hồ sơ VMware') },
      { type: 'quiz', id: 'h_vmw_pro', concept: 'stock_deal', q: '"Proration" nghĩa là gì trong thương vụ này?', opts: ['Thương vụ bị huỷ', 'Nếu quá nhiều cổ đông chọn cùng một hình thức, phần nhận được sẽ được chia lại để tổng tiền mặt và tổng cổ phiếu đúng tỷ lệ đã cam kết', 'Cổ đông được nhận thêm cổ tức'], a: 1, fb: fb('Bên mua cố định tổng tiền mặt cần huy động.', 'Proration keeps aggregate cash/stock mix fixed regardless of elections.', 'Ràng buộc tài trợ.', 'Cổ đông không chắc chắn nhận đúng hình thức đã chọn.', 'Proration', 'Hồ sơ VMware') },
      { type: 'quiz', id: 'h_vmw_strat', concept: 'competitive_advantage', q: 'Rủi ro của chiến lược tập trung vào khách hàng lớn và tăng giá sau thâu tóm (Analyst Interpretation)?', opts: ['Không có rủi ro', 'Khách hàng nhỏ và vừa có thể rời bỏ; quan hệ đối tác bị ảnh hưởng — đổi lấy biên lợi nhuận cao hơn ngắn hạn', 'Giá cổ phiếu chắc chắn giảm'], a: 1, fb: fb('Chiến lược tối ưu biên lợi nhuận có cái giá về quan hệ khách hàng.', 'Margin-maximizing post-deal strategies trade customer goodwill for profitability.', 'Phân tích bên liên quan.', 'Nhà đầu tư cần theo dõi churn sau thương vụ.', 'Post-merger strategy', 'Hồ sơ VMware') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_cloud'] } },

  { ...base('h_hca', 'Hồ sơ: HCA — LBO 2006', 'hca_lbo', 'Dòng tiền bệnh viện ổn định, đòn bẩy cao và dividend recap trước IPO.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Năm 2006, liên danh do Bain Capital và KKR dẫn đầu mua HCA với khoảng 33 tỷ USD bao gồm nợ. HCA niêm yết trở lại năm 2011.']], terms: ['Dividend Recap'] },
      { type: 'num', id: 'h_hca_dpi', concept: 'irr_moic', q: '[Simulation Assumption] Vốn chủ 5,3 tỷ USD; cổ tức đặc biệt nhận trước IPO 4,3 tỷ USD. DPI trước IPO (x, 2 chữ số)?', a: r2(A.hcaDpi), tol: 0.01, unit: 'x', fb: fb('4,3 / 5,3 ≈ 0,81x — gần như thu hồi vốn trước khi bán cổ phiếu nào.', 'Dividend recaps return capital early, boosting DPI and IRR.', 'Tiền đã thực nhận / vốn bỏ ra.', 'Giảm rủi ro cho quỹ nhưng tăng rủi ro cho công ty.', 'DPI', 'Hồ sơ HCA') },
      { type: 'quiz', id: 'h_hca_risk', concept: 'lbo', q: 'Câu hỏi đạo đức – quản trị cần đặt ra khi một bệnh viện vay thêm để trả cổ tức cho quỹ?', opts: ['Không cần đặt câu hỏi', 'Khoản nợ mới có ảnh hưởng đến khả năng đầu tư thiết bị, nhân sự và chất lượng chăm sóc bệnh nhân không — và công ty có chịu được kịch bản xấu?', 'Cổ tức có được miễn thuế không'], a: 1, fb: fb('Trong y tế, đòn bẩy tài chính có hệ quả với bệnh nhân.', 'Recaps in healthcare must be weighed against reinvestment and quality-of-care obligations.', 'Bên liên quan ngoài cổ đông.', 'Đây là câu hỏi LP và cơ quan quản lý ngày càng quan tâm.', 'Stakeholder governance', 'Hồ sơ HCA') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_stethoscope'] } },

  { ...base('h_seagen', 'Hồ sơ: Pfizer / Seagen (2023)', 'pfe_seagen', 'Lấp khoảng trống "patent cliff" bằng một nền tảng công nghệ ung thư.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Pfizer trả 229 USD/cổ phiếu, khoảng 43 tỷ USD, để mua Seagen — chuyên về antibody-drug conjugates (ADC).']], terms: ['Patent Cliff'] },
      { type: 'num', id: 'h_sea_fill', concept: 'healthcare', q: '[Simulation Assumption] Nếu doanh thu sắp mất do hết bảo hộ sáng chế là 17 tỷ USD/năm và Seagen có thể đóng góp 10 tỷ USD/năm, thương vụ lấp được bao nhiêu % khoảng trống?', a: r1(A.seagenFill), tol: 0.2, unit: '%', fb: fb('10 / 17 ≈ 58,8%.', 'Deal sizing against the revenue gap left by patent expiries.', 'So sánh đóng góp với khoảng trống.', 'Phần còn lại phải đến từ R&D nội bộ hoặc thương vụ khác.', 'Patent cliff', 'Hồ sơ Seagen') },
      { type: 'quiz', id: 'h_sea_risk', concept: 'healthcare', q: 'Rủi ro định giá đặc thù khi mua công ty dược dựa trên pipeline?', opts: ['Không có', 'Rủi ro thử nghiệm lâm sàng, phê duyệt, cạnh tranh từ thuốc mới — và rủi ro mất đội ngũ khoa học sau sáp nhập', 'Giá dầu'], a: 1, fb: fb('Giá trị pipeline là giá trị xác suất.', 'Pipeline valuation is probability-weighted; talent retention is critical.', 'Liên hệ CVR của Celgene.', 'Định giá dùng rNPV (risk-adjusted NPV).', 'rNPV', 'Hồ sơ Seagen') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_flask'] } },

  { ...base('h_aetna', 'Hồ sơ: CVS / Aetna (2018)', 'cvs_aetna', 'Tích hợp dọc nhà thuốc – bảo hiểm và biện pháp khắc phục của DOJ.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'CVS mua Aetna khoảng 69 tỷ USD bằng tiền mặt và cổ phiếu. DOJ chấp thuận với điều kiện Aetna bán mảng bảo hiểm thuốc Medicare Part D.']] },
      { type: 'num', id: 'h_aet_pkg', concept: 'stock_deal', q: '[Simulation Assumption] Mỗi cổ phiếu Aetna nhận 145 USD tiền mặt và 0,8378 cổ phiếu CVS; giá CVS 74 USD. Tổng giá trị (USD, 1 chữ số)?', a: r1(A.aetnaPkg), tol: 0.1, unit: 'USD', fb: fb('145 + 0,8378 × 74 ≈ 207,0.', 'Mixed consideration valuation.', 'Cộng hai phần.', 'Biến động giá CVS thay đổi giá trị thực nhận.', 'Mixed consideration', 'Hồ sơ Aetna') },
      { type: 'quiz', id: 'h_aet_doj', concept: 'governance', q: 'Vì sao DOJ yêu cầu bán mảng Part D?', opts: ['Vì mảng này lỗ', 'Vì CVS và Aetna cạnh tranh trực tiếp trong bảo hiểm thuốc Medicare Part D — sáp nhập làm giảm cạnh tranh ngang ở thị trường đó', 'Vì Aetna quá nhỏ'], a: 1, fb: fb('Remedy nhắm vào phần chồng lấn ngang (horizontal overlap).', 'Divestitures address specific horizontal overlaps.', 'Tìm thị trường hai bên cùng cạnh tranh.', 'Thương vụ dọc vẫn có thể có chồng lấn ngang.', 'Antitrust remedies', 'Hồ sơ Aetna') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_pillbox'] } },

  { ...base('h_duke', 'Hồ sơ: Prologis / Duke Realty (2022)', 'pld_duke', 'Sáp nhập REIT bằng cổ phiếu khi lãi suất bắt đầu tăng — và định giá bằng cap rate.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Prologis mua Duke Realty hoàn toàn bằng cổ phiếu, khoảng 26 tỷ USD bao gồm nợ — hợp nhất hai REIT kho bãi logistics hàng đầu.']] },
      { type: 'num', id: 'h_duke_val', concept: 'stock_deal', q: '[Simulation Assumption] Tỷ lệ 0,475 cổ phiếu Prologis cho mỗi cổ phiếu Duke; giá Prologis 125 USD. Giá trị mỗi cổ phiếu Duke (USD, 1 chữ số)?', a: r1(A.dukeVal), tol: 0.1, unit: 'USD', fb: fb('0,475 × 125 ≈ 59,4.', 'Fixed exchange ratio value moves with acquirer price.', 'Tỷ lệ × giá.', 'Cổ đông Duke chia sẻ rủi ro và lợi ích với Prologis.', 'Exchange ratio', 'Hồ sơ Duke') },
      { type: 'num', id: 'h_duke_cap', concept: 'sector_realestate', q: '[Simulation Assumption] NOI danh mục 1,0 tỷ USD, cap rate 3,8%. Giá trị tài sản (tỷ USD, 1 chữ số)?', a: r1(A.dukeCap), tol: 0.1, unit: 'tỷ USD', fb: fb('1,0 / 3,8% ≈ 26,3.', 'Value = NOI / cap rate.', 'Định giá trực tiếp.', 'Cap rate rất thấp → nhạy cảm cao với lãi suất tăng.', 'Cap rate', 'Hồ sơ Duke') },
      { type: 'quiz', id: 'h_duke_why', concept: 'macro_rates', q: 'Vì sao trả bằng cổ phiếu hợp lý khi lãi suất đang tăng?', opts: ['Vì cổ phiếu miễn phí', 'Không phải vay thêm ở lãi suất cao, giữ bảng cân đối an toàn, và cổ đông hai bên cùng chia sẻ rủi ro định giá bất động sản', 'Vì luật REIT cấm vay'], a: 1, fb: fb('Lựa chọn hình thức thanh toán phụ thuộc chu kỳ lãi suất.', 'Stock consideration avoids new debt when rates rise.', 'Liên hệ bài tăng lãi suất.', 'Cổ phiếu bên mua cũng phải được định giá hợp lý.', 'Consideration mix', 'Hồ sơ Duke') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_pallet'] } },

  { ...base('h_powerschool', 'Hồ sơ: Bain Capital / PowerSchool (2024)', 'bain_powerschool', 'Take-private phần mềm giáo dục: doanh thu định kỳ, chi phí chuyển đổi và dữ liệu học sinh.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Bain Capital mua PowerSchool — phần mềm quản lý trường học K-12 — khoảng 5,6 tỷ USD. Ngày hoàn tất vẫn đang được đối chiếu (Pending Research).']] },
      { type: 'num', id: 'h_ps_arr', concept: 'saas_metrics', q: '[Simulation Assumption] ARR 700 triệu USD. EV/ARR (x)?', a: A.psEvArr, tol: 0.05, unit: 'x', fb: fb('5.600 / 700 = 8x.', 'EV/ARR for recurring-revenue software.', 'Chia EV cho ARR.', 'Hợp lý với SaaS giáo dục có retention cao và tăng trưởng vừa phải.', 'EV/ARR', 'Hồ sơ PowerSchool') },
      { type: 'quiz', id: 'h_ps_risk', concept: 'sector_education', q: 'Rủi ro đặc thù cần thẩm định kỹ nhất với phần mềm quản lý trường học?', opts: ['Giá nguyên liệu', 'Bảo mật và quyền riêng tư dữ liệu học sinh, quy định của từng địa phương, và chu kỳ ngân sách giáo dục công', 'Tỷ giá'], a: 1, fb: fb('Dữ liệu trẻ em là dữ liệu nhạy cảm bậc nhất.', 'Student data privacy and public budget cycles are key risks in K-12 software.', 'Liên hệ khủng hoảng ransomware.', 'An ninh mạng là workstream bắt buộc.', 'Data privacy', 'Hồ sơ PowerSchool') },
      { type: 'choice', id: 'h_ps_vc', q: 'Đòn bẩy tạo giá trị phù hợp nhất cho chủ sở hữu PE:', grade: true, best: [0], opts: [
        { t: 'Bán thêm module (upsell) cho trường hiện có, cải thiện hiệu quả bán hàng, đầu tư an ninh dữ liệu', out: 'Tăng NRR và giảm rủi ro — giá trị bền vững.' },
        { t: 'Tăng giá mạnh vì trường "khó chuyển đổi"', out: 'Ngân sách công có hạn; quan hệ khách hàng và uy tín bị ảnh hưởng.' },
      ] },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_pencil'] } },

  { ...base('h_neoen', 'Hồ sơ: Brookfield / Neoen (2024)', 'bep_neoen', 'Mua nền tảng phát triển năng lượng tái tạo: giá trị nằm trong pipeline dự án.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Brookfield công bố mua cổ phần kiểm soát Neoen ở 39,85 EUR/cổ phiếu. Các chi tiết hoàn tất vẫn đang được đối chiếu.']], terms: ['Development Pipeline'] },
      { type: 'num', id: 'h_neo_mw', concept: 'sector_energy', q: '[Simulation Assumption] Pipeline 8.000 MW, tỷ lệ dự án đi đến vận hành 35%. Công suất kỳ vọng (MW)?', a: A.neoenMw, tol: 1, unit: 'MW', fb: fb('8.000 × 35% = 2.800 MW.', 'Probability-weight development pipelines.', 'Không phải mọi dự án đều được xây.', 'Định giá pipeline theo MW kỳ vọng, không theo con số tiêu đề.', 'Pipeline valuation', 'Hồ sơ Neoen') },
      { type: 'quiz', id: 'h_neo_why', concept: 'sector_energy', q: 'Vì sao một nhà đầu tư hạ tầng mua nền tảng phát triển thay vì chỉ mua dự án đang vận hành?', opts: ['Vì rẻ hơn', 'Để có "nhà máy" tạo dự án mới liên tục với lợi nhuận phát triển cao hơn, thay vì cạnh tranh mua tài sản vận hành ở giá cao', 'Vì dự án vận hành không có doanh thu'], a: 1, fb: fb('Lợi nhuận phát triển (development premium) thường cao hơn lợi suất tài sản vận hành.', 'Platforms capture development returns; operating assets trade at tighter yields.', 'Chuỗi giá trị hạ tầng.', 'Đổi lại là rủi ro cấp phép và xây dựng.', 'Platform strategy', 'Hồ sơ Neoen') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_turbine'] } },

  { ...base('h_anthropic', 'Hồ sơ: Amazon / Anthropic — đầu tư chiến lược', 'amzn_anthropic', 'Đầu tư thiểu số kết hợp hợp tác compute: phân tích cấu trúc và chất lượng doanh thu.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Amazon cam kết tổng cộng 8 tỷ USD vào Anthropic dưới dạng cổ phần thiểu số; AWS là đối tác đám mây và huấn luyện chính. Ta phân tích cấu trúc — không phỏng đoán định giá thật.']] },
      { type: 'num', id: 'h_ant_pct', concept: 'cap_table', q: '[Simulation Assumption — không phải định giá thật] Nếu khoản đầu tư 4 tỷ USD ở mức post-money 40 tỷ USD, tỷ lệ sở hữu (%)?', a: A.anthPct, tol: 0.05, unit: '%', fb: fb('4 / 40 = 10%.', 'Ownership = investment / post-money.', 'Post-money bao gồm vốn mới.', 'Đầu tư thiểu số: ảnh hưởng chiến lược mà không kiểm soát.', 'Minority stake', 'Hồ sơ Anthropic') },
      { type: 'quiz', id: 'h_ant_struct', concept: 'ai_economics', q: 'Ưu điểm của cấu trúc "đầu tư thiểu số + hợp tác thương mại" so với thâu tóm toàn bộ (Analyst Interpretation)?', opts: ['Không có ưu điểm', 'Tiếp cận năng lực AI và nhu cầu compute dài hạn, giữ tính độc lập của startup (và khả năng làm việc với nhiều đối tác), giảm rủi ro chống độc quyền và chi phí vốn', 'Tránh mọi rủi ro'], a: 1, fb: fb('Cấu trúc linh hoạt phổ biến trong AI.', 'Minority stakes plus commercial agreements balance access, independence and regulatory risk.', 'So sánh với Microsoft/LinkedIn (thâu tóm toàn bộ).', 'Cơ quan cạnh tranh vẫn xem xét các quan hệ đối tác này.', 'Strategic partnerships', 'Hồ sơ Anthropic') },
      { type: 'quiz', id: 'h_ant_rev', concept: 'ai_economics', q: 'Khi phân tích doanh thu cloud của nhà đầu tư chiến lược, câu hỏi chất lượng doanh thu quan trọng là gì?', opts: ['Doanh thu có màu gì', 'Một phần vốn đầu tư có quay lại dưới dạng chi tiêu compute cho chính nhà đầu tư không — cần tách biệt khi đánh giá tăng trưởng hữu cơ', 'Không cần phân tích'], a: 1, fb: fb('Dòng tiền vòng (round-trip) làm phức tạp việc đánh giá tăng trưởng.', 'Assess whether investment dollars return as revenue when judging organic growth.', 'Quality of earnings áp dụng cho cả bên đầu tư.', 'Nhà đầu tư cổ phiếu niêm yết thường hỏi câu này.', 'Revenue quality', 'Hồ sơ Anthropic') },
    ], rewards: { xp: 35, rep: 1, items: ['artifact_neuron'] } },
];
export const CASE2_IDS = CASE2_QUESTS.map((q) => q.id);

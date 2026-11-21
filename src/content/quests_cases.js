// Playable missions for the extended Hall of Legendary Deals. Every number not labelled Verified Fact in the
// case file is a Simulation Assumption and is announced as such in the question text.
import { irr } from '../engine/finance.js';

const r1 = (x) => Math.round(x * 10) / 10;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

const A = {
  aolTw: 350 * 0.45,                                   // sim: TW holders' share of a 350bn combined equity
  actPrem: (95 / 65.4 - 1) * 100,                      // sim undisturbed price 65.4 → ~45%
  cvrEv: 9 * 0.5,                                      // sim 50% probability
  celgPkg: 50 + 52 + 9 * 0.5,                          // sim BMS price 52
  hiltonMoic: (5.6 + 14) / 5.6,                        // interp from widely reported figures (sim equity 5.6)
  txuLev0: 40 / 5, txuLev1: 40 / 3,
  wfmPrem: (42 / 33.1 - 1) * 100,                      // sim undisturbed price 33.1 → ~27%
  arcPrem: (5.85 / 3.08 - 1) * 100,                    // sim undisturbed price 3.08 → ~90%
};
A.hiltonIrr = irr([-5.6, ...Array(10).fill(0), 5.6 + 14]) * 100; // 11 years
export const CASE_ANSWERS = A;

const base = (id, title, kase, summary) => ({ id, title, kind: 'case', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: kase, summary });

export const CASE_QUESTS = [
  { ...base('h_aol', 'Hồ sơ: AOL / Time Warner (2000)', 'aol_timewarner', 'Khi cổ phiếu bong bóng trở thành "tiền" thâu tóm tài sản thật — và synergy không đến.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Tháng 1/2000, ở đỉnh bong bóng dot-com, AOL công bố mua Time Warner bằng cổ phiếu. Cổ đông AOL sở hữu khoảng 55% công ty mới — dù Time Warner lớn hơn về doanh thu và lợi nhuận. Đó là Verified Fact.']], terms: ['Goodwill'] },
      { type: 'num', id: 'h_aol_share', concept: 'stock_deal', q: '[Simulation Assumption] Nếu vốn hoá công ty hợp nhất là 350 tỷ USD, phần thuộc về cổ đông Time Warner (45%) là bao nhiêu tỷ USD?', a: A.aolTw, tol: 0.5, unit: 'tỷ USD', fb: fb('350 × 45% = 157,5.', 'In stock deals, value split follows the ownership split, not standalone fundamentals.', 'Nhân tỷ lệ sở hữu.', 'Khi cổ phiếu bên mua bị định giá quá cao, cổ đông bên bán đổi tài sản thật lấy một phần của "bong bóng".', 'Exchange ratio', 'Hồ sơ AOL') },
      { type: 'quiz', id: 'h_aol_label', concept: 'source_labels', q: 'Câu "AOL Time Warner ghi nhận lỗ khoảng 99 tỷ USD năm 2002, chủ yếu do ghi giảm goodwill" thuộc nhãn nào?', opts: ['Verified Fact', 'Analyst Interpretation', 'Simulation Assumption'], a: 0, fb: fb('Đây là số liệu đã được báo cáo trong báo cáo tài chính và báo chí tài chính.', 'Reported financial results are facts; explanations of why are interpretations.', 'Số liệu báo cáo ≠ diễn giải nguyên nhân.', 'Phân biệt rõ để IC memo đáng tin.', 'Research protocol', 'Đại Sảnh') },
      { type: 'quiz', id: 'h_aol_lesson', concept: 'synergy', q: 'Bài học quan trọng nhất cho bên BÁN (Time Warner) trong thương vụ trả bằng cổ phiếu?', opts: ['Luôn nhận cổ phiếu vì có upside', 'Thẩm định giá trị thật của cổ phiếu bên mua (reverse due diligence) và cân nhắc cơ chế bảo vệ — tỷ lệ cố định, collar hoặc một phần tiền mặt', 'Không cần quan tâm vì giá trị trên giấy rất cao'], a: 1, fb: fb('Nhận cổ phiếu nghĩa là trở thành nhà đầu tư vào bên mua.', 'Sellers receiving stock must diligence the acquirer’s valuation and consider collars or cash.', 'Rủi ro chuyển sang cổ đông bên bán.', 'Reverse due diligence là chuẩn mực khi nhận cổ phiếu.', 'Collar, Reverse DD', 'Hồ sơ AOL') },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_modem'] } },

  { ...base('h_activision', 'Hồ sơ: Microsoft / Activision Blizzard (2023)', 'ms_activision', 'Gần hai năm đối đầu với các cơ quan cạnh tranh: deal certainty, phí chấm dứt và biện pháp khắc phục.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Microsoft trả 95 USD/cổ phiếu tiền mặt, khoảng 68,7 tỷ USD. FTC kiện, CMA của Anh từng chặn — rồi thương vụ được tái cấu trúc và hoàn tất 10/2023.']], terms: ['Reverse Termination Fee'] },
      { type: 'num', id: 'h_act_prem', concept: 'deal_certainty', q: '[Simulation Assumption] Giá cổ phiếu trước công bố khoảng 65,4 USD. Phần bù (premium) của giá 95 USD (%, ±0,5)?', a: r1(A.actPrem), tol: 0.5, unit: '%', fb: fb('95 / 65,4 − 1 ≈ 45%.', 'Premium = offer / undisturbed price − 1.', 'So với giá trước khi tin thương vụ ảnh hưởng.', 'Premium cao bù cho cổ đông bên bán thời gian chờ và rủi ro pháp lý.', 'Control premium', 'Hồ sơ Activision') },
      { type: 'quiz', id: 'h_act_cma', concept: 'governance', q: 'CMA chấp thuận thương vụ sau khi cấu trúc thay đổi thế nào? (Verified Fact trong hồ sơ)', opts: ['Microsoft bán Xbox', 'Quyền cloud streaming (ngoài EEA) với game của Activision được bán cho Ubisoft', 'Microsoft trả gấp đôi giá'], a: 1, fb: fb('Biện pháp khắc phục nhắm đúng thị trường cơ quan quản lý lo ngại: cloud gaming.', 'Remedies target the specific competition concern.', 'Đọc kỹ quyết định của cơ quan quản lý.', 'Thiết kế remedy sớm có thể rút ngắn thời gian phê duyệt.', 'Antitrust remedies', 'Hồ sơ Activision') },
      { type: 'quiz', id: 'h_act_fee', concept: 'deal_certainty', q: 'Phí chấm dứt ngược (reverse termination fee) lên tới khoảng 3 tỷ USD có tác dụng gì với bên bán?', opts: ['Không có tác dụng', 'Bồi thường cho bên bán nếu thương vụ đổ vỡ vì lý do pháp lý — và cho thấy bên mua tự tin, gánh rủi ro phê duyệt', 'Là phí tư vấn cho ngân hàng'], a: 1, fb: fb('Phí chấm dứt phân bổ rủi ro không hoàn tất giữa hai bên.', 'Reverse break fees compensate sellers for regulatory failure risk and signal buyer commitment.', 'Ai chịu rủi ro thì được trả giá.', 'Thương vụ hoàn tất nên phí không phải trả.', 'Deal protection', 'Hồ sơ Activision') },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_controller'] } },

  { ...base('h_celgene', 'Hồ sơ: BMS / Celgene (2019)', 'bms_celgene', 'Contingent Value Right: thu hẹp khoảng cách định giá về rủi ro pipeline — và câu chuyện CVR hết hạn vô giá trị.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Mỗi cổ phiếu Celgene nhận 50 USD tiền mặt, 1 cổ phiếu BMS và 1 CVR trị giá 9 USD nếu ba thuốc được phê duyệt đúng hạn. Một thuốc được duyệt trễ hai tháng — CVR hết hạn.']], terms: ['Contingent Value Right'] },
      { type: 'num', id: 'h_cel_cvr', concept: 'deal_certainty', q: '[Simulation Assumption] Nếu xác suất cả ba thuốc được duyệt đúng hạn là 50%, giá trị kỳ vọng của CVR (USD)?', a: A.cvrEv, tol: 0.01, unit: 'USD', fb: fb('9 × 50% = 4,5 USD.', 'CVR expected value = payout × probability (before discounting).', 'Xác suất nhân khoản trả.', 'Bên mua và bên bán thường bất đồng chính ở xác suất này.', 'Contingent consideration', 'Hồ sơ Celgene') },
      { type: 'num', id: 'h_cel_pkg', concept: 'stock_deal', q: '[Simulation Assumption] Giá cổ phiếu BMS 52 USD. Tổng giá trị kỳ vọng mỗi cổ phiếu Celgene nhận (USD)?', a: A.celgPkg, tol: 0.05, unit: 'USD', fb: fb('50 + 52 + 4,5 = 106,5.', 'Value each component: cash + stock + contingent rights.', 'Cộng ba thành phần.', 'Cổ đông bên bán chịu rủi ro giá BMS và rủi ro CVR.', 'Mixed consideration', 'Hồ sơ Celgene') },
      { type: 'quiz', id: 'h_cel_why', concept: 'deal_certainty', q: 'Vì sao các bên dùng CVR thay vì đơn giản trả giá cao hơn?', opts: ['Để tiết kiệm thuế', 'Bên bán tin pipeline giá trị cao, bên mua hoài nghi — CVR trả thêm CHỈ khi kết quả xảy ra, giúp hai bên gặp nhau', 'Vì luật bắt buộc'], a: 1, fb: fb('CVR là công cụ bắc cầu khoảng cách định giá (bridge the valuation gap).', 'CVRs bridge valuation gaps by making part of the price contingent.', 'Giống earn-out trong M&A tư nhân.', 'Thiết kế điều kiện (hạn chót, định nghĩa phê duyệt) quyết định giá trị thực.', 'Earn-out', 'Hồ sơ Celgene') },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_capsule'] } },

  { ...base('h_hilton', 'Hồ sơ: Blackstone / Hilton (2007)', 'bx_hilton', 'Mua ở đỉnh, đi qua khủng hoảng, và trở thành một trong những LBO sinh lời nhất: kiên nhẫn, tái cấu trúc nợ và mô hình kinh doanh ít vốn.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Blackstone mua Hilton tháng 7/2007 — vài tháng trước khủng hoảng tài chính. Giá trị tài sản giảm mạnh. Nhưng năm 2018, khi thoái hết vốn, lợi nhuận được báo cáo khoảng 14 tỷ USD.']] },
      { type: 'num', id: 'h_hil_moic', concept: 'irr_moic', q: '[Analyst Interpretation / Simulation] Nếu vốn chủ ban đầu khoảng 5,6 tỷ USD và lợi nhuận 14 tỷ USD, MOIC (x, 1 chữ số thập phân)?', a: r1(A.hiltonMoic), tol: 0.05, unit: 'x', fb: fb('(5,6 + 14) / 5,6 = 3,5x.', 'MOIC = (capital + profit) / capital.', 'Cộng vốn gốc vào lợi nhuận.', 'MOIC cao — nhưng phải xem thời gian.', 'MOIC', 'Hồ sơ Hilton') },
      { type: 'num', id: 'h_hil_irr', concept: 'irr_moic', q: 'Nếu toàn bộ tiền về sau 11 năm, IRR tương ứng (%, ±0,3)?', a: r1(A.hiltonIrr), tol: 0.3, unit: '%', fb: fb('3,5^(1/11) − 1 ≈ 12,1%.', 'Long holding periods compress IRR even with high MOIC.', 'IRR phụ thuộc thời gian.', 'Thực tế dòng tiền về rải rác (IPO 2013, bán dần) nên IRR khác — đây là phép tính minh hoạ.', 'IRR vs MOIC', 'Hồ sơ Hilton') },
      { type: 'choice', id: 'h_hil_choice', q: '[Alternative History] Năm 2009, giá trị Hilton giảm mạnh và nợ cần tái cấu trúc. Nếu bạn là Blackstone, phương án nào bảo toàn giá trị tốt nhất?', grade: true, best: [1], opts: [
        { t: 'Bán gấp ở đáy để cắt lỗ', out: '[Alternative History] Khoản lỗ trở thành vĩnh viễn — đúng bài học "bán tháo trong suy thoái" từ mô phỏng quỹ.' },
        { t: 'Đàm phán lại nợ (mua lại nợ giá chiết khấu, gia hạn), bơm thêm vốn chủ, tập trung tăng trưởng nhượng quyền ít vốn và chờ chu kỳ hồi phục', out: 'Phù hợp với những gì được báo cáo rộng rãi về cách Blackstone xử lý Hilton (Analyst Interpretation).' },
        { t: 'Giao công ty cho chủ nợ', out: '[Alternative History] Mất toàn bộ vốn chủ.' },
      ] },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_keycard'] } },

  { ...base('h_txu', 'Hồ sơ: TXU / Energy Future Holdings (2007)', 'txu_efh', 'LBO lớn nhất lịch sử thời điểm đó, đặt cược vào giá khí đốt — và phá sản khi cách mạng khí đá phiến xảy ra.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'KKR, TPG và Goldman Sachs mua TXU với khoảng 45 tỷ USD năm 2007. Năm 2014, Energy Future Holdings nộp đơn phá sản Chapter 11.']] },
      { type: 'num', id: 'h_txu_lev', concept: 'covenants', q: '[Simulation Assumption] Nợ 40, EBITDA 5 → Nợ/EBITDA 8x. Nếu giá điện giảm làm EBITDA còn 3, Nợ/EBITDA mới (x, 1 chữ số thập phân)?', a: r1(A.txuLev1), tol: 0.05, unit: 'x', fb: fb('40 / 3 ≈ 13,3x.', 'Leverage explodes when EBITDA falls under a fixed debt load.', 'Mẫu số giảm, tử số giữ nguyên.', 'Không có cách nào phục vụ khoản nợ như vậy — tái cấu trúc là tất yếu.', 'Leverage', 'Hồ sơ TXU') },
      { type: 'quiz', id: 'h_txu_thesis', concept: 'macro_rates', q: 'Điểm yếu cốt lõi của luận điểm đầu tư (Analyst Interpretation)?', opts: ['Ban lãnh đạo yếu', 'Lợi nhuận phụ thuộc vào một biến số hàng hoá ngoài tầm kiểm soát (giá khí đốt quyết định giá điện) trong khi đòn bẩy không chừa biên an toàn cho kịch bản giá giảm', 'Phí giao dịch quá cao'], a: 1, fb: fb('Đòn bẩy cao chỉ phù hợp với dòng tiền ổn định, không phải dòng tiền phụ thuộc giá hàng hoá.', 'High leverage on commodity-driven cash flows leaves no margin for a structural price shift.', 'Kết nối với bài cú sốc giá dầu.', 'Luôn chạy downside case cho biến số lớn nhất.', 'Commodity risk', 'Hồ sơ TXU') },
      { type: 'choice', id: 'h_txu_dd', q: 'Nếu bạn ở IC năm 2007, phân tích nào lẽ ra phải là điều kiện bắt buộc?', grade: true, best: [0], opts: [
        { t: 'Stress test giá khí đốt giảm 40–50% kéo dài nhiều năm, và chỉ duyệt mức nợ mà công ty vẫn phục vụ được trong kịch bản đó', out: 'Một kịch bản như vậy sẽ cho thấy cấu trúc vốn không bền vững.' },
        { t: 'Dự báo giá khí đốt chính xác hơn', out: 'Không ai dự báo được cách mạng đá phiến — cấu trúc vốn phải chịu được những điều không dự báo được.' },
      ] },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_plug'] } },

  { ...base('h_wholefoods', 'Hồ sơ: Amazon / Whole Foods (2017)', 'amzn_wholefoods', 'Gã khổng lồ thương mại điện tử mua chuỗi siêu thị vật lý — một thương vụ làm cả ngành bán lẻ định giá lại.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Amazon trả 42 USD/cổ phiếu tiền mặt, khoảng 13,7 tỷ USD. Ngày hoàn tất, Amazon giảm giá nhiều mặt hàng ngay lập tức.']] },
      { type: 'num', id: 'h_wfm_prem', concept: 'comps', q: '[Simulation Assumption] Giá trước công bố khoảng 33,1 USD. Premium (%, ±0,5)?', a: r1(A.wfmPrem), tol: 0.5, unit: '%', fb: fb('42 / 33,1 − 1 ≈ 27%.', 'Premium over undisturbed share price.', 'So với giá trước tin đồn.', 'Premium vừa phải so với nhiều thương vụ công nghệ — vì Whole Foods tăng trưởng chậm.', 'Control premium', 'Hồ sơ Whole Foods') },
      { type: 'quiz', id: 'h_wfm_label', concept: 'source_labels', q: '"Amazon mua Whole Foods để có mạng lưới cửa hàng phục vụ chiến lược omnichannel" thuộc nhãn nào?', opts: ['Verified Fact', 'Analyst Interpretation', 'Alternative History'], a: 1, fb: fb('Động cơ chiến lược là diễn giải; giá và ngày hoàn tất mới là dữ kiện.', 'Strategic motives are interpretations unless explicitly documented.', 'Phân biệt "cái gì" và "vì sao".', 'Kỷ luật nguồn.', 'Research protocol', 'Đại Sảnh') },
      { type: 'quiz', id: 'h_wfm_react', concept: 'competitive_advantage', q: 'Vì sao cổ phiếu nhiều chuỗi bán lẻ thực phẩm khác giảm ngay khi thương vụ được công bố?', opts: ['Do lãi suất tăng', 'Thị trường định giá lại rủi ro cạnh tranh: một đối thủ có quy mô, dữ liệu và sẵn sàng chấp nhận biên lợi nhuận thấp vừa bước vào ngành', 'Do Whole Foods phá sản'], a: 1, fb: fb('M&A có thể thay đổi cấu trúc cạnh tranh của cả ngành.', 'Deals can reprice an entire sector’s competitive outlook.', 'Five forces: đối thủ mới mạnh.', 'Nhà đầu tư phải nghĩ tác động bậc hai.', 'Competitive dynamics', 'Hồ sơ Whole Foods') },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_basket'] } },

  { ...base('h_change', 'Hồ sơ: UnitedHealth / Change Healthcare (2022)', 'unh_change', 'Tích hợp dọc trong y tế: DOJ kiện và thua, biện pháp khắc phục — rồi một cuộc tấn công mạng làm rung chuyển cả hệ thống.'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Optum (UnitedHealth) mua Change Healthcare. DOJ kiện vì lo ngại dữ liệu claims của các đối thủ bảo hiểm. Toà bác đơn; thương vụ hoàn tất 10/2022. Tháng 2/2024, Change bị ransomware.']] },
      { type: 'quiz', id: 'h_chg_doj', concept: 'governance', q: 'Lo ngại chính của DOJ trong tích hợp dọc này?', opts: ['Giá mua quá cao', 'Công ty bảo hiểm lớn nhất có thể tiếp cận dữ liệu claims nhạy cảm của các đối thủ đi qua hạ tầng Change, và có thể hạn chế đối thủ', 'Change có quá ít khách hàng'], a: 1, fb: fb('Tích hợp dọc gây lo ngại khi bên mua kiểm soát hạ tầng mà đối thủ phụ thuộc.', 'Vertical theories of harm: access to rivals’ sensitive data and foreclosure.', 'Ai phụ thuộc vào ai?', 'Firewall dữ liệu và bán bớt mảng là biện pháp thường gặp.', 'Vertical integration', 'Hồ sơ Change') },
      { type: 'quiz', id: 'h_chg_remedy', concept: 'governance', q: 'Biện pháp khắc phục nào đi kèm thương vụ (Verified Fact)?', opts: ['Không có', 'Change bán mảng ClaimsXten cho TPG', 'UnitedHealth bán Optum'], a: 1, fb: fb('ClaimsXten là sản phẩm cạnh tranh trực tiếp với một sản phẩm của Optum.', 'Divestiture of overlapping businesses is a classic remedy.', 'Loại bỏ phần chồng lấn.', 'Remedy làm giảm giá trị synergy nhưng tăng deal certainty.', 'Divestiture remedy', 'Hồ sơ Change') },
      { type: 'choice', id: 'h_chg_cyber', q: 'Bài học thẩm định từ cuộc tấn công năm 2024 cho các thương vụ hạ tầng dữ liệu y tế:', grade: true, best: [0], opts: [
        { t: 'Thẩm định an ninh mạng là workstream bắt buộc, có kế hoạch nâng cấp hậu sáp nhập và định lượng chi phí sự cố trong mô hình', out: 'Kết nối với khủng hoảng ransomware bạn đã xử lý: an ninh mạng là rủi ro định giá.' },
        { t: 'An ninh mạng là việc của phòng IT sau khi mua', out: 'Rủi ro hệ thống bị bỏ ngoài định giá.' },
      ] },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_chip'] } },

  { ...base('h_arcadium', 'Hồ sơ: Rio Tinto / Arcadium Lithium (2025)', 'rio_arcadium', 'Mua ngược chu kỳ khi giá lithium ở đáy: premium cao trên giá thấp có phải là trả đắt?'),
    steps: [
      { type: 'say', lines: [['ngoc', 'Rio Tinto trả 5,85 USD/cổ phiếu tiền mặt, khoảng 6,7 tỷ USD — phần bù khoảng 90% so với giá trước khi có thông tin. Hoàn tất tháng 3/2025.']] },
      { type: 'num', id: 'h_arc_prem', concept: 'comps', q: '[Simulation Assumption] Giá trước thông tin khoảng 3,08 USD. Premium (%, ±1)?', a: r1(A.arcPrem), tol: 1, unit: '%', fb: fb('5,85 / 3,08 − 1 ≈ 90%.', 'Premium over undisturbed price.', 'So với giá trước tin đồn.', 'Premium rất cao trên một giá đã giảm sâu theo chu kỳ.', 'Control premium', 'Hồ sơ Arcadium') },
      { type: 'quiz', id: 'h_arc_cycle', concept: 'macro_rates', q: 'Lập luận mạnh nhất rằng premium 90% vẫn có thể hợp lý (Analyst Interpretation)?', opts: ['Premium càng cao càng tốt', 'Giá cổ phiếu trước đó phản ánh đáy chu kỳ giá lithium; bên mua định giá theo chi phí thay thế dài hạn và nhu cầu chuyển dịch năng lượng, không theo giá giao ngay', 'Vì Rio Tinto có nhiều tiền'], a: 1, fb: fb('Premium phải so với giá trị nội tại, không chỉ với giá thị trường tại đáy.', 'Premium vs intrinsic/replacement value matters more than premium vs depressed market price.', 'Liên hệ với bài "mua trong khủng hoảng" của Fund II.', 'Rủi ro: giá lithium có thể ở mức thấp lâu hơn kỳ vọng.', 'Counter-cyclical M&A', 'Hồ sơ Arcadium') },
      { type: 'choice', id: 'h_arc_risk', q: 'Rủi ro bạn sẽ đưa lên đầu IC memo:', grade: true, best: [0], opts: [
        { t: 'Giá lithium thấp kéo dài, chi phí phát triển dự án vượt dự toán, và rủi ro công nghệ pin thay đổi hoá chất — kèm kịch bản giá thấp 5 năm', out: 'Downside case nhắm đúng biến số lớn nhất.' },
        { t: 'Rủi ro tỷ giá AUD nhỏ', out: 'Có thật nhưng không phải biến số quyết định.' },
      ] },
    ], rewards: { xp: 40, rep: 1, items: ['artifact_battery'] } },
];
export const CASE_IDS = CASE_QUESTS.map((q) => q.id);

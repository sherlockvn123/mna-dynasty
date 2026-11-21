// Crisis events (Phòng khủng hoảng). Each crisis is triggered by game state — never random — and teaches the
// transmission mechanism, the numbers, and the professional response. All companies and figures are fictional
// Simulation Assumptions. Macro crises (TS. Thu Hà, Khu Tài chính) unlock after the recession scenario;
// firm-level crises (Bảo An, quỹ của bạn) unlock after Fund I closes.
const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

// ---------- computed answers ----------
const INF = { rev: 100, cogs: 60, opex: 25, shock: 0.10, price: 0.04, volume: -0.01 };
INF.base = INF.rev - INF.cogs - INF.opex;                                         // 15
INF.noPrice = INF.rev - INF.cogs * (1 + INF.shock) - INF.opex;                    // 9
INF.priced = INF.rev * (1 + INF.price) * (1 + INF.volume) - INF.cogs * (1 + INF.shock) * (1 + INF.volume) - INF.opex; // 12.62
const FX = { debtUsd: 50, rate0: 25000, dep: 0.10, ebitdaVnd: 300 };
FX.rate1 = FX.rate0 * (1 + FX.dep);                                               // 27,500
FX.debt0 = (FX.debtUsd * 1e6 * FX.rate0) / 1e9;                                   // 1,250 tỷ
FX.debt1 = (FX.debtUsd * 1e6 * FX.rate1) / 1e9;                                   // 1,375 tỷ
FX.lev0 = FX.debt0 / FX.ebitdaVnd; FX.lev1 = FX.debt1 / FX.ebitdaVnd;            // 4.17x → 4.58x
const BANK = { cash: 12, insured: 0.25 };
BANK.uninsured = BANK.cash - BANK.insured;                                        // 11.75
const OIL = { rev: 100, costs: 80, fuelShare: 0.3, shock: 0.4, surcharge: 0.7 };
OIL.fuel = OIL.costs * OIL.fuelShare;                                             // 24
OIL.hit = OIL.fuel * OIL.shock;                                                   // 9.6
OIL.base = OIL.rev - OIL.costs;                                                   // 20
OIL.noClause = OIL.base - OIL.hit;                                                // 10.4
OIL.withClause = OIL.base - OIL.hit * (1 - OIL.surcharge);                        // 17.12
const CYBER = { records: 200000, perRecord: 150 };
CYBER.cost = (CYBER.records * CYBER.perRecord) / 1e6;                             // 30 triệu USD
const KEY = { ebitda: 20, teamShare: 0.4, mult: 10, bonus: 6 };
KEY.atRisk = KEY.ebitda * KEY.teamShare * KEY.mult;                               // 80
const FRAUD = { reported: 30, actual: 22, mult: 10 };
FRAUD.writeDown = (FRAUD.reported - FRAUD.actual) * FRAUD.mult;                   // 80
const REG = { rev: 100, plan: 0.08, cap: 0.03, years: 5 };
REG.planRev = REG.rev * (1 + REG.plan) ** REG.years;                              // 146.93
REG.capRev = REG.rev * (1 + REG.cap) ** REG.years;                                // 115.93
REG.gap = REG.planRev - REG.capRev;                                               // 31.0
export const CRISIS_ANSWERS = { INF, FX, BANK, OIL, CYBER, KEY, FRAUD, REG };

const macroCond = { chapter: 'career', giver: 'ha', loc: 'district', req: ['k_macro_recession'], kind: 'crisis', optional: true, age: 24 };
const firmCond = { chapter: 'career', giver: 'an', loc: 'firm', req: ['e_fund'], kind: 'crisis', optional: true, age: 33 };

export const CRISIS_QUESTS = [
  // ===================== MACRO CRISES =====================
  { id: 'cr_inflation', title: '🔥 Lạm phát bùng nổ & sức mạnh định giá', ...macroCond,
    summary: 'Chi phí đầu vào tăng 10%. Công ty nào chuyển được chi phí sang khách hàng, công ty nào bị bóp nghẹt biên lợi nhuận?',
    steps: [
      { type: 'say', lines: [['ha', 'Giá nguyên liệu và năng lượng tăng vọt — lạm phát đầu vào 10%. Một công ty tiêu dùng trong danh mục: doanh thu 100, giá vốn 60, chi phí hoạt động 25.'], ['ha', 'Câu hỏi không phải "lạm phát bao nhiêu" mà là "ai chịu chi phí đó" — công ty hay khách hàng.']], terms: ['Pricing Power'] },
      { type: 'num', id: 'cr_inf_no', concept: 'crisis', q: 'Nếu KHÔNG tăng giá, giá vốn tăng 10%: EBITDA mới?', a: INF.noPrice, tol: 0.05, unit: '', fb: fb('100 − 66 − 25 = 9 (từ 15): giảm 40% chỉ vì giá vốn tăng 10%.', 'Input inflation without pass-through hits margins with operating leverage.', 'Giá vốn tăng 6, toàn bộ trừ vào EBITDA.', 'Doanh nghiệp biên mỏng bị tổn thương nhất.', 'Operating leverage', 'Lạm phát') },
      { type: 'num', id: 'cr_inf_price', concept: 'crisis', q: 'Nếu tăng giá 4% và mất 1% sản lượng (giá vốn biến đổi theo sản lượng), EBITDA mới (1 chữ số thập phân)?', a: r1(INF.priced), tol: 0.1, unit: '', traps: [{ v: 13, why: 'Bạn quên giảm giá vốn theo sản lượng (−1%) hoặc quên giảm doanh thu theo sản lượng.' }],
        fb: fb(`Doanh thu 100 × 1,04 × 0,99 = 102,96; giá vốn 66 × 0,99 = 65,34; EBITDA ≈ ${r2(INF.priced)}.`, 'Pass-through restores part of the margin when demand is inelastic.', 'Giá tăng nhiều hơn mức mất khách.', 'Sức mạnh định giá là lá chắn tốt nhất trước lạm phát.', 'Price elasticity', 'Lạm phát') },
      { type: 'quiz', id: 'cr_inf_q', concept: 'crisis', q: 'Dấu hiệu tốt nhất của sức mạnh định giá khi thẩm định một công ty?', opts: ['Doanh thu tăng nhanh nhờ khuyến mãi', 'Lịch sử tăng giá trong quá khứ mà tỷ lệ giữ chân khách hàng không giảm; sản phẩm thiết yếu, chi phí chuyển đổi cao, ít đối thủ thay thế', 'Công ty có nhiều tiền mặt'], a: 1, fb: fb('Bằng chứng tốt nhất là hành vi khách hàng khi giá tăng.', 'Evidence of pricing power: historic price increases with stable retention.', 'Quan sát dữ liệu, không nghe lời hứa.', 'Trong môi trường lạm phát, đây là tiêu chí sàng lọc hàng đầu.', 'Moat', 'Lạm phát') },
      { type: 'choice', id: 'cr_inf_act', q: 'Khuyến nghị cho ban lãnh đạo:', grade: true, best: [1], opts: [
        { t: 'Tăng giá 15% ngay để "an toàn"', out: 'Khách hàng phản ứng mạnh, đối thủ giữ giá — mất thị phần.' },
        { t: 'Tăng giá có chọn lọc theo phân khúc ít nhạy cảm, khoá giá nguyên liệu bằng hợp đồng dài hạn, tối ưu chi phí bao bì', out: 'Biên lợi nhuận phục hồi gần mức cũ trong 2 quý mà không mất khách quen.' },
        { t: 'Giữ nguyên giá và chờ lạm phát giảm', out: 'Biên lợi nhuận bị bào mòn suốt 6 quý.' },
      ] },
    ], rewards: { xp: 40, rep: 2, rel: { ha: { respect: 4 } } } },

  { id: 'cr_fx', title: '💱 Tỷ giá mất giá & nợ ngoại tệ', ...macroCond,
    summary: 'Đồng nội tệ mất giá 10%. Một công ty có doanh thu VND nhưng vay USD — đòn bẩy tăng vọt dù kinh doanh không đổi.',
    steps: [
      { type: 'say', lines: [['ha', 'Dòng vốn rút ra khỏi thị trường mới nổi, VND mất giá 10% so với USD (25.000 → 27.500). Công ty logistics trong danh mục vay 50 triệu USD, nhưng toàn bộ doanh thu bằng VND. EBITDA 300 tỷ đồng.']], terms: ['Currency Mismatch', 'Hedging'] },
      { type: 'num', id: 'cr_fx_debt', concept: 'crisis', q: 'Dư nợ quy đổi ra VND sau khi mất giá (tỷ đồng)?', a: FX.debt1, tol: 1, unit: 'tỷ đồng', traps: [{ v: 1250, why: 'Đó là dư nợ trước khi mất giá: 50 triệu × 25.000.' }], fb: fb('50 triệu × 27.500 = 1.375 tỷ đồng (từ 1.250).', 'Foreign-currency debt grows in local terms when the local currency depreciates.', 'Nhân với tỷ giá mới.', 'Không vay thêm đồng nào mà nợ tăng 125 tỷ.', 'Currency mismatch', 'Tỷ giá') },
      { type: 'num', id: 'cr_fx_lev', concept: 'crisis', q: 'Nợ/EBITDA mới (x, 2 chữ số thập phân)?', a: r2(FX.lev1), tol: 0.01, unit: 'x', fb: fb(`1.375 / 300 ≈ ${r2(FX.lev1)}x (từ ${r2(FX.lev0)}x).`, 'Leverage rises mechanically with depreciation under currency mismatch.', 'Mẫu số (EBITDA VND) không đổi.', 'Có thể chạm covenant mà không có lỗi vận hành nào.', 'Covenant', 'Tỷ giá') },
      { type: 'choice', id: 'cr_fx_act', q: 'Bài học cho cấu trúc vốn tương lai:', grade: true, best: [0], opts: [
        { t: 'Khớp đồng tiền vay với đồng tiền doanh thu (natural hedge), hoặc phòng ngừa bằng hợp đồng hoán đổi tiền tệ với chi phí đã tính vào mô hình', out: 'Rủi ro tỷ giá được kiểm soát; LP đánh giá cao kỷ luật quản trị rủi ro.' },
        { t: 'Tiếp tục vay USD vì lãi suất thấp hơn', out: 'Lãi suất thấp hơn chỉ là "bữa trưa miễn phí" cho đến khi tỷ giá biến động.' },
        { t: 'Đầu cơ tỷ giá để bù lỗ', out: 'Biến rủi ro thành canh bạc — không phải nghiệp vụ của quỹ.' },
      ] },
    ], rewards: { xp: 40, rep: 2 } },

  { id: 'cr_bank', title: '🏦 Ngân hàng mất thanh khoản', ...macroCond,
    summary: 'Một ngân hàng nơi nhiều startup gửi tiền bị rút tiền ồ ạt. Quản trị ngân quỹ trở thành vấn đề sống còn.',
    steps: [
      { type: 'say', lines: [['ha', 'Ngân hàng Sông Xanh (hư cấu) — nơi nhiều startup công nghệ gửi tiền — lỗ nặng danh mục trái phiếu khi lãi suất tăng, rồi bị rút tiền ồ ạt chỉ trong 48 giờ.'], ['khoa', '(gọi gấp) Mầm AI có 12 triệu USD ở Sông Xanh! Tớ phải trả lương tuần sau!']], terms: ['Bank Run', 'Deposit Insurance'] },
      { type: 'num', id: 'cr_bank_unins', concept: 'crisis', q: '[Simulation Assumption] Bảo hiểm tiền gửi chi trả tối đa 0,25 triệu USD mỗi tài khoản. Số tiền KHÔNG được bảo hiểm của Mầm AI (triệu USD)?', a: BANK.uninsured, tol: 0.01, unit: 'triệu USD', fb: fb('12 − 0,25 = 11,75 triệu USD — 98% tiền mặt có rủi ro.', 'Deposits above the insured limit are exposed in a bank failure.', 'Trừ hạn mức bảo hiểm.', 'Startup thường giữ toàn bộ vốn gọi được ở một ngân hàng.', 'Treasury management', 'Ngân hàng') },
      { type: 'quiz', id: 'cr_bank_q', concept: 'crisis', q: 'Vì sao lãi suất tăng có thể làm một ngân hàng mất khả năng thanh toán?', opts: ['Ngân hàng không bao giờ bị ảnh hưởng bởi lãi suất', 'Ngân hàng giữ nhiều trái phiếu dài hạn mua lúc lãi suất thấp; khi lãi suất tăng, giá trị trái phiếu giảm. Nếu người gửi rút tiền đồng loạt, ngân hàng phải bán lỗ — mất thanh khoản thành mất khả năng thanh toán', 'Vì khách hàng gửi ít tiền hơn'], a: 1, fb: fb('Lệch kỳ hạn (duration mismatch) + tiền gửi tập trung = rút tiền ồ ạt.', 'Duration mismatch plus concentrated, uninsured deposits creates run risk.', 'Nối với bài Duration của Investment Management.', 'Thẩm định ngân hàng đối tác là một phần của quản trị rủi ro.', 'Duration, Liquidity', 'Ngân hàng') },
      { type: 'choice', id: 'cr_bank_act', q: 'Bạn khuyên Khoa và các công ty danh mục:', grade: true, best: [1], opts: [
        { t: 'Rút hết tiền ngay và đăng lên mạng xã hội kêu gọi mọi người rút', out: 'Bạn góp phần làm cuộc rút tiền tệ hơn — và gây hại cho cả hệ sinh thái.', fx: { stats: { ethics: -5 } } },
        { t: 'Bình tĩnh theo dõi thông tin chính thức; xây chính sách ngân quỹ: chia tiền qua nhiều ngân hàng, giữ phần dư trong tín phiếu ngắn hạn, theo dõi rủi ro đối tác', out: 'Khi cơ quan quản lý can thiệp, Mầm AI lấy lại tiền; chính sách mới giúp danh mục không lặp lại rủi ro này.', fx: { rel: { khoa: { trust: 8 } } } },
        { t: 'Không làm gì — ngân hàng lớn không thể sụp', out: 'Hy vọng không phải là chính sách quản trị rủi ro.' },
      ] },
    ], rewards: { xp: 40, rep: 2 } },

  { id: 'cr_oil', title: '🛢️ Cú sốc giá dầu', ...macroCond,
    summary: 'Giá nhiên liệu tăng 40%. Điều khoản hợp đồng — không phải dự báo — quyết định ai sống sót.',
    steps: [
      { type: 'say', lines: [['ha', 'Xung đột địa chính trị làm giá dầu tăng 40%. Một công ty logistics: doanh thu 100, tổng chi phí 80, trong đó nhiên liệu chiếm 30%.']], terms: ['Fuel Surcharge'] },
      { type: 'num', id: 'cr_oil_no', concept: 'crisis', q: 'EBITDA mới nếu không chuyển được chi phí nhiên liệu cho khách?', a: r1(OIL.noClause), tol: 0.05, unit: '', fb: fb('Nhiên liệu 24 × 40% = 9,6; EBITDA 20 − 9,6 = 10,4 (giảm 48%).', 'Commodity shocks flow straight to EBITDA without pass-through.', 'Chi phí nhiên liệu tăng, doanh thu không đổi.', 'Ngành logistics, hàng không rất nhạy với giá dầu.', 'Commodity exposure', 'Giá dầu') },
      { type: 'num', id: 'cr_oil_clause', concept: 'crisis', q: '70% hợp đồng có điều khoản phụ phí nhiên liệu (chuyển toàn bộ phần tăng cho khách). EBITDA mới (2 chữ số thập phân)?', a: r2(OIL.withClause), tol: 0.02, unit: '', fb: fb(`20 − 9,6 × 30% = ${r2(OIL.withClause)}.`, 'Contractual pass-through clauses hedge commodity risk.', 'Chỉ phần hợp đồng không có điều khoản bị ảnh hưởng.', 'Thẩm định hợp đồng khách hàng quan trọng ngang dự báo giá dầu.', 'Contract review', 'Giá dầu') },
      { type: 'choice', id: 'cr_oil_act', q: 'Bài học thẩm định cho các thương vụ logistics tương lai:', grade: true, best: [0], opts: [
        { t: 'Rà soát điều khoản pass-through trong hợp đồng khách hàng, mô hình hoá kịch bản giá dầu ±40%, cân nhắc hedge một phần chi phí nhiên liệu', out: 'Rủi ro hàng hoá được định lượng trước khi trả giá.' },
        { t: 'Dự báo giá dầu chính xác hơn', out: 'Không ai dự báo chính xác giá dầu — cần cấu trúc chịu được nhiều kịch bản.' },
      ] },
    ], rewards: { xp: 40, rep: 2 } },

  // ===================== FIRM-LEVEL CRISES =====================
  { id: 'cr_cyber', title: '🛡️ Tấn công mạng & rò rỉ dữ liệu bệnh nhân', ...firmCond,
    summary: 'Một công ty y tế trong danh mục bị tấn công ransomware; dữ liệu 200.000 bệnh nhân có thể đã bị lộ.',
    steps: [
      { type: 'say', lines: [['an', 'Chị ơi, chuỗi phòng khám trong danh mục bị ransomware! Hệ thống đặt lịch tê liệt, tin tặc đòi tiền chuộc và nói đã lấy dữ liệu 200.000 bệnh nhân.']], terms: ['Ransomware', 'Incident Response'] },
      { type: 'sort', id: 'cr_cyb_sort', concept: 'crisis', q: 'Phân loại các hành động trong 24 giờ đầu:', cats: ['Làm ngay', 'Không được làm'],
        items: [['Cô lập hệ thống bị nhiễm, kích hoạt kế hoạch ứng phó sự cố', 0], ['Thông báo cơ quan quản lý theo thời hạn luật định', 0], ['Xoá log để "giảm bằng chứng"', 1], ['Thuê chuyên gia điều tra số (forensics) và luật sư', 0], ['Trả tiền chuộc ngay mà không có tư vấn pháp lý', 1], ['Thông báo trung thực cho bệnh nhân bị ảnh hưởng', 0]],
        fb: fb('Ưu tiên: ngăn chặn, tuân thủ nghĩa vụ thông báo, bảo toàn bằng chứng, minh bạch với người bị ảnh hưởng.', 'Incident response: contain, preserve evidence, notify regulators and affected parties, get expert counsel.', 'Xoá bằng chứng là vi phạm pháp luật; trả tiền chuộc có rủi ro pháp lý và không đảm bảo.', 'Cách xử lý quyết định thiệt hại uy tín nhiều hơn chính vụ tấn công.', 'Incident response', 'Tấn công mạng') },
      { type: 'num', id: 'cr_cyb_cost', concept: 'crisis', q: '[Simulation Assumption] Chi phí ước tính 150 USD cho mỗi hồ sơ bị lộ (thông báo, giám sát tín dụng, pháp lý, phạt). Tổng chi phí (triệu USD)?', a: CYBER.cost, tol: 0.1, unit: 'triệu USD', fb: fb('200.000 × 150 = 30 triệu USD.', 'Breach cost ≈ records × cost per record.', 'Nhân số hồ sơ với chi phí đơn vị.', 'Với công ty EBITDA vài chục triệu, đây là cú sốc cả năm lợi nhuận — an ninh mạng là rủi ro định giá.', 'Cyber risk', 'Tấn công mạng') },
      { type: 'choice', id: 'cr_cyb_disclose', q: 'CEO công ty muốn trì hoãn thông báo cho bệnh nhân "đến khi chắc chắn". Bạn (thành viên HĐQT):', grade: true, best: [0], opts: [
        { t: 'Yêu cầu tuân thủ đúng thời hạn thông báo, minh bạch với bệnh nhân và LP, đầu tư nâng cấp an ninh mạng toàn danh mục', out: 'Thiệt hại uy tín được kiểm soát; cơ quan quản lý ghi nhận sự hợp tác. Các công ty khác trong danh mục được kiểm tra an ninh.', fx: { stats: { ethics: 10 }, rep: 3, flags: { cyber_program: true } } },
        { t: 'Đồng ý trì hoãn để tránh truyền thông xấu', out: 'Báo chí phát hiện việc che giấu; tiền phạt và mất niềm tin lớn hơn nhiều so với vụ tấn công.', fx: { stats: { ethics: -15 }, rep: -5 } },
      ] },
    ], rewards: { xp: 50, rep: 2 } },

  { id: 'cr_keyperson', title: '🏃 Đội ngũ chủ chốt bị lôi kéo', ...firmCond,
    summary: 'Một đối thủ lớn đề nghị lương gấp đôi cho đội ngũ tạo ra 40% EBITDA của một công ty danh mục.',
    steps: [
      { type: 'say', lines: [['an', 'Đội kỹ thuật cốt lõi của công ty phần mềm trong danh mục vừa nhận lời mời từ một tập đoàn công nghệ. Họ tạo ra khoảng 40% EBITDA (EBITDA công ty: 20 triệu USD).']], terms: ['Retention Package', 'Key Person Risk'] },
      { type: 'say', when: (rt, S) => S.tl.flags.hired_khoa, lines: [['khoa', 'Tớ từng là founder — tớ hiểu họ. Tiền không phải tất cả: họ muốn được làm sản phẩm có ý nghĩa và có cổ phần.']] },
      { type: 'num', id: 'cr_key_risk', concept: 'crisis', q: 'Giá trị doanh nghiệp có rủi ro nếu đội ngũ ra đi (định giá 10x EBITDA, triệu USD)?', a: KEY.atRisk, tol: 0.5, unit: 'triệu USD', fb: fb('20 × 40% × 10 = 80 triệu USD.', 'Value at risk = EBITDA contribution × multiple.', 'Định lượng trước khi quyết định ngân sách giữ chân.', 'So với gói giữ chân 6 triệu, đây là quyết định dễ dàng về mặt số học.', 'Key person risk', 'Đội ngũ chủ chốt') },
      { type: 'choice', id: 'cr_key_act', q: 'Phương án giữ chân:', grade: true, best: [1], opts: [
        { t: 'Kiện để chặn họ nghỉ việc', out: 'Quan hệ xấu đi, họ vẫn rời đi khi hết hạn hợp đồng — kèm theo vài người khác.', fx: { rep: -2 } },
        { t: 'Gói giữ chân 6 triệu USD trả dần trong 3 năm + cổ phần gắn với giá trị exit + quyền tự chủ sản phẩm; đồng thời xây đội kế cận để giảm phụ thuộc', out: 'Đội ở lại; hai năm sau họ là lý do chính khiến người mua trả giá cao khi exit.', fx: { rep: 3 } },
        { t: 'Không làm gì — "không ai là không thể thay thế"', out: 'Đội rời đi; EBITDA giảm mạnh và định giá giảm theo.', fx: { rep: -3 } },
      ] },
    ], rewards: { xp: 40, rep: 2 } },

  { id: 'cr_fraud', title: '🕵️ Gian lận kế toán trong danh mục', ...firmCond,
    summary: 'Kiểm toán phát hiện CFO một công ty danh mục ghi nhận doanh thu khống. Báo cáo cho LP thế nào?',
    steps: [
      { type: 'say', lines: [['an', 'Kiểm toán độc lập phát hiện CFO của chuỗi bán lẻ trong danh mục ghi nhận doanh thu trước khi giao hàng. EBITDA báo cáo 30 triệu USD — thực tế chỉ 22.'], ['tung', '(LP) Tôi nghe tin đồn. Tôi cần nghe từ chính quỹ của cô.']], terms: ['Write-down', 'Forensic Accounting'] },
      { type: 'num', id: 'cr_fr_wd', concept: 'crisis', q: 'Mức giảm giá trị doanh nghiệp cần ghi nhận (định giá 10x EBITDA, triệu USD)?', a: FRAUD.writeDown, tol: 0.5, unit: 'triệu USD', fb: fb('(30 − 22) × 10 = 80 triệu USD.', 'Write-down = EBITDA overstatement × valuation multiple.', 'Mỗi đồng EBITDA giả bị nhân lên bởi bội số.', 'Đây là lý do Quality of Earnings quan trọng ngay từ đầu.', 'Quality of Earnings', 'Gian lận') },
      { type: 'choice', id: 'cr_fr_act', q: 'Cách xử lý:', grade: true, best: [0], opts: [
        { t: 'Báo cáo ngay cho LP và HĐQT, thuê điều tra pháp y độc lập, thay CFO, ghi giảm giá trị trong báo cáo NAV quý này', out: 'Chú Tùng: "Tin xấu được báo sớm là dấu hiệu của một GP đáng tin." Các LP vẫn ở lại.', fx: { stats: { ethics: 12 }, rel: { tung: { trust: 12 } }, rep: 2, flags: { fraud_disclosed: true } } },
        { t: 'Lặng lẽ sửa sổ sách, chờ đến báo cáo năm để không làm LP lo lắng', out: 'LP phát hiện qua bên thứ ba. Niềm tin sụp đổ; Fund II gặp khó khăn lớn.', fx: { stats: { ethics: -25 }, rel: { tung: { trust: -25 } }, rep: -8, flags: { fraud_hidden: true } } },
      ] },
      { type: 'quiz', id: 'cr_fr_q', concept: 'crisis', q: 'Kiểm soát nào có khả năng phát hiện gian lận này sớm nhất?', opts: ['Tăng lương CFO', 'Đối chiếu doanh thu với chứng từ giao hàng và dòng tiền thu thực tế (cash conversion), cùng kiểm toán nội bộ báo cáo trực tiếp cho uỷ ban kiểm toán', 'Họp ban lãnh đạo nhiều hơn'], a: 1, fb: fb('Doanh thu khống thường để lại dấu vết: phải thu tăng nhanh, cash conversion giảm.', 'Revenue-to-cash reconciliation and independent internal audit detect revenue manipulation.', 'Tiền mặt khó làm giả hơn lợi nhuận.', 'Nhắc lại bài học từ tuổi thơ: lợi nhuận là ý kiến, tiền mặt là sự thật.', 'Cash conversion', 'Gian lận') },
    ], rewards: { xp: 50, rep: 2 } },

  { id: 'cr_regulation', title: '⚖️ Can thiệp chính sách: trần học phí', ...firmCond,
    summary: 'Cơ quan quản lý áp trần tăng học phí 3%/năm cho trường tư. Kế hoạch tăng 8%/năm của một khoản đầu tư giáo dục cần được định giá lại.',
    steps: [
      { type: 'say', lines: [['an', 'Chính sách mới: học phí trường tư chỉ được tăng tối đa 3%/năm. Kế hoạch đầu tư của chuỗi trường trong danh mục giả định tăng 8%/năm. Doanh thu hiện tại: 100 triệu USD.']], terms: ['Regulatory Risk'] },
      { type: 'num', id: 'cr_reg_gap', concept: 'crisis', q: 'Chênh lệch doanh thu năm thứ 5 giữa kế hoạch (8%/năm) và trần mới (3%/năm), triệu USD (1 chữ số thập phân)?', a: r1(REG.gap), tol: 0.2, unit: 'triệu USD', traps: [{ v: 25, why: 'Bạn tính lãi đơn (5 × 5%). Phải dùng lãi kép: 100 × (1,08⁵ − 1,03⁵).' }],
        fb: fb(`100 × 1,08⁵ ≈ ${r1(REG.planRev)}; 100 × 1,03⁵ ≈ ${r1(REG.capRev)}; chênh lệch ≈ ${r1(REG.gap)}.`, 'Compounding magnifies small differences in growth assumptions.', 'Lãi kép — bài học từ ống heo năm 9 tuổi.', 'Định giá phải được làm lại với kế hoạch mới.', 'Compounding', 'Chính sách') },
      { type: 'choice', id: 'cr_reg_act', q: 'Phản ứng của quỹ:', grade: true, best: [1], opts: [
        { t: 'Đổi tên các khoản phí để "lách" trần học phí', out: 'Cơ quan quản lý xử phạt và yêu cầu hoàn tiền; thương hiệu trường bị tổn hại.', fx: { stats: { ethics: -15 }, rep: -4 } },
        { t: 'Định giá lại theo kế hoạch tuân thủ; tăng trưởng bằng lấp đầy công suất, chương trình chất lượng cao được phép và hiệu quả vận hành; đối thoại chính sách minh bạch qua hiệp hội ngành', out: 'Giá trị thấp hơn kế hoạch ban đầu nhưng bền vững; LP đánh giá cao sự trung thực trong báo cáo NAV.', fx: { rep: 3 } },
        { t: 'Bán gấp khoản đầu tư', out: 'Người mua cũng thấy rủi ro chính sách — bạn bán ở đáy.', fx: { rep: -1 } },
      ] },
    ], rewards: { xp: 40, rep: 2 } },
];

export const CRISIS_IDS = CRISIS_QUESTS.map((q) => q.id);

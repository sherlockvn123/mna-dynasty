// Successor storylines — the final arc after "Di sản". The branch depends on the successor chosen in e_legacy
// (flags.successor: 'an' | 'star' | 'none'); every branch converges on governance → handover test → epilogue.
// The epilogue reads relationships and flags accumulated across the whole game to tell where everyone ended up.
const fb = (vi, en, why, impl, related, review) => ({ vi, en, why, impl, related, review });

const CARRY = { pool: 50, you: 0.4, successor: 0.25, team: 0.35 };
CARRY.successorAmt = CARRY.pool * CARRY.successor;   // 12.5
CARRY.vestedAfter3 = CARRY.successorAmt * 3 / 5;     // 7.5 (5-year straight-line vesting)
export const SUCCESSION_ANSWERS = { CARRY };

const rel = (tl, id) => (tl.rel[id]?.trust ?? 0) + (tl.rel[id]?.respect ?? 0);
const base = { kind: 'succession', chapter: 'career', giver: 'an', loc: 'firm', age: 40 };

/** Readiness of the successor at the handover test — built from choices made across the endgame. */
export function readiness(tl) {
  let r = 0;
  if (tl.flags.successor === 'an') r += 1;
  if (tl.flags.an_coached) r += 1;
  if (tl.flags.coach_style === 'coach') r += 1;
  if ((tl.flags.gov_score ?? 0) >= 0.8) r += 1;
  if ((tl.stats.ethics ?? 0) >= 10) r += 1;
  return r;
}

/** Where everyone ended up — a direct function of relationships and decisions over the whole game. */
export function epilogue(tl, playerName = 'Linh') {
  const lines = [];
  lines.push(tl.flags.bakery_owned ? 'Tiệm Bánh Mây Hồng thành chuỗi 30 cửa hàng — và vẫn giữ hai người thợ năm xưa.' : 'Tiệm Bánh Mây Hồng vẫn là một tiệm nhỏ ấm cúng. Cô Hạnh vẫn để dành cho bạn một chiếc su kem mỗi lần ghé.');
  lines.push(rel(tl, 'khoa') >= 20 ? 'Khoa trở thành General Partner của một quỹ AI; hai người đồng đầu tư nhiều thương vụ — đối thủ năm nào thành người bạn tin cậy nhất.' : 'Khoa khởi nghiệp lần hai. Hai người chỉ gật đầu chào nhau ở các hội nghị.');
  lines.push(tl.flags.hired_mai ? 'Mai là Partner phụ trách vận hành danh mục ở quỹ của bạn.' : rel(tl, 'mai') >= 10 ? 'Mai trở thành CFO một tập đoàn bán lẻ và vẫn gọi bạn mỗi khi cần một lời khuyên thẳng thắn.' : 'Mai và bạn mất liên lạc sau vài năm.');
  lines.push(tl.flags.hired_vy ? 'Vy dẫn dắt mảng sourcing của quỹ — nhiều thương vụ tốt nhất đến từ mạng lưới của cô.' : 'Vy trở thành Managing Director M&A tại Lotus Capital.');
  lines.push(tl.flags.credit_private ? 'Đức lập chương trình mentor cho analyst trẻ, kể lại "bài học bảng comps" năm xưa như một câu chuyện về sự tử tế.' : 'Đức rời ngành tài chính sau vài năm.');
  lines.push(rel(tl, 'victor') >= 15 ? 'Victor Lâm nghỉ hưu và nhận lời ngồi hội đồng tư vấn của quỹ bạn: "Cô là thực tập sinh duy nhất tôi từng nhớ tên."' : 'Victor Lâm nghỉ hưu ở Lotus Capital.');
  const h = tl.flags.handover;
  lines.push(tl.flags.successor === 'an' ? (h === 'success' ? 'Bảo An trở thành Managing Partner — và tuyển associate đầu tiên của mình theo đúng cách bạn từng dạy.' : 'Bảo An trở thành Partner; cô cần thêm vài năm để sẵn sàng dẫn dắt cả quỹ.') : tl.flags.successor === 'star' ? 'Người kế nhiệm "ngôi sao" mang về nhiều thương vụ, nhưng văn hoá quỹ thay đổi — vài người giỏi nhất đã rời đi.' : 'Quỹ chuyển sang mô hình lãnh đạo tập thể sau một giai đoạn chuyển giao khó khăn.');
  if (tl.flags.legacy === 'education') lines.push('Quỹ học bổng đã giúp hàng nghìn em nhỏ lần đầu học về lợi nhuận và lãi kép — bên một quầy nước chanh màu hồng.');
  if (tl.flags.legacy === 'mentor') lines.push('Chương trình mentor của bạn đã đưa nhiều phụ nữ trẻ trở thành Partner và CIO.');
  if (tl.flags.legacy === 'institution') lines.push(`${playerName} Capital trở thành một thể chế, tồn tại lâu hơn sự nghiệp của người sáng lập.`);
  if (tl.flags.fraud_hidden) lines.push('Vụ gian lận bị che giấu năm ấy vẫn là một vết đen trong tiểu sử của quỹ.');
  return lines;
}

export const SUCCESSION_QUESTS = [
  // ---------- Branch A: Bảo An ----------
  {
    id: 's_coach', title: '🌱 Kế nhiệm I: Thương vụ đầu tiên của Bảo An', ...base, req: ['e_legacy'],
    cond: (tl) => tl.flags.successor === 'an',
    summary: 'Bảo An lần đầu dẫn dắt một thương vụ. Đọc IC memo của cô ấy, tìm điểm yếu — và chọn cách dẫn dắt để cô ấy trưởng thành.',
    steps: [
      { type: 'say', lines: [['an', 'Chị ơi, đây là IC memo đầu tiên em tự dẫn dắt: chuỗi phòng khám mắt Sáng Mắt. Em hồi hộp lắm — chị xem giúp em trước khi trình IC nhé.'], ['me', '(gọi điện) Ngày xưa mẹ cũng run tay khi đọc memo đầu tiên của bố con. Đừng sửa thay — hãy hỏi những câu khiến cô ấy tự tìm ra lỗi.']], terms: ['Succession Planning'] },
      { type: 'debug', id: 's_coach_memo', concept: 'leadership', q: 'Chạm vào những điểm có vấn đề trong IC memo của Bảo An:', rows: [
        { l: 'Giá mua', f: 'EV 180 = 9x EBITDA 20', v: '180' },
        { l: 'EBITDA', f: 'Bao gồm 3 triệu lãi bán toà nhà (một lần)', v: '20', bad: true, why: 'Lãi bán tài sản là khoản một lần — EBITDA bền vững là 17, giá thực tế là 10,6x.' },
        { l: 'Đòn bẩy', f: 'Nợ 4x EBITDA', v: '80' },
        { l: 'Lợi nhuận', f: 'IRR 28% (ghi là "net cho LP")', v: '28%', bad: true, why: 'Đây là gross IRR của thương vụ; net cho LP thấp hơn sau phí và carry.' },
        { l: 'Exit', f: 'Bán ở 12x vì "ngành đang hot"', v: '12x', bad: true, why: 'Giả định mở rộng bội số không có cơ sở — base case nên giữ bội số bằng giá mua.' },
        { l: 'Rủi ro', f: 'Giữ chân 4 bác sĩ chủ chốt bằng cổ phần', v: '✓' },
        { l: 'Kịch bản xấu', f: 'Chưa có', v: '—', bad: true, why: 'IC memo bắt buộc có downside case: nếu mất bác sĩ hoặc bảo hiểm cắt giá thì sao?' },
      ],
        fb: fb('Bốn lỗi kinh điển: EBITDA không bền vững, nhầm gross/net, mở rộng bội số không cơ sở, thiếu downside.', 'Classic IC memo flaws: non-recurring EBITDA, gross vs net confusion, unjustified multiple expansion, no downside case.', 'Đọc memo bằng con mắt của một LP hoài nghi.', 'Người lãnh đạo giỏi biến lỗi của người kế nhiệm thành bài học, không thành sự xấu hổ.', 'IC memo, Quality of Earnings', 'Kế nhiệm I') },
      { type: 'choice', id: 's_coach_style', q: 'Bạn phản hồi Bảo An thế nào?', grade: true, best: [1], opts: [
        { t: 'Tự viết lại toàn bộ memo cho nhanh', out: 'Memo hoàn hảo — nhưng An không học được gì và bắt đầu chờ bạn sửa mọi thứ.', v: { style: 'micro' }, fx: { flags: { coach_style: 'micro' }, rel: { an: { respect: -5 } } } },
        { t: 'Ngồi cùng An, hỏi từng câu ("EBITDA này có lặp lại không?", "LP nhận được bao nhiêu?"), để cô ấy tự sửa và tự trình IC', out: 'An tự tìm ra cả bốn lỗi và trình IC rất tự tin. Thương vụ được duyệt ở giá thấp hơn 1x.', v: { style: 'coach' }, fx: { flags: { coach_style: 'coach' }, rel: { an: { trust: 10, respect: 10 } } } },
        { t: 'Để An tự trình IC và vấp ngã — "học từ thất bại"', out: 'IC bác memo trước mặt cả đội. An mất tự tin vài tháng.', v: { style: 'drop' }, fx: { flags: { coach_style: 'drop' }, rel: { an: { trust: -10 } } } },
      ] },
    ],
    rewards: { xp: 60, rep: 2 },
  },
  // ---------- Branch B: the "star" ----------
  {
    id: 's_star', title: '⭐ Kế nhiệm I: Cái giá của ngôi sao', ...base, req: ['e_legacy'],
    cond: (tl) => tl.flags.successor === 'star',
    summary: 'Người kế nhiệm mang về doanh thu lớn nhất đang làm xói mòn văn hoá quỹ. Bạn có dám sửa lựa chọn của chính mình?',
    steps: [
      { type: 'say', lines: [['an', 'Chị ơi… em không biết có nên nói không. Anh Partner được chọn kế nhiệm la mắng associate trước mặt khách hàng, và gây sức ép để đội em "làm đẹp" EBITDA trong memo.'], ['an', 'Hai bạn associate giỏi nhất vừa nộp đơn nghỉ việc.']], terms: ['Succession Planning'] },
      { type: 'quiz', id: 's_star_q', concept: 'leadership', q: 'Rủi ro lớn nhất khi chọn người kế nhiệm chỉ dựa trên doanh thu mang về?', opts: ['Không có rủi ro — doanh thu là tất cả', 'Văn hoá và tiêu chuẩn đạo đức bị xói mòn; người giỏi rời đi; rủi ro tuân thủ tăng — những thứ LP đánh giá khi tái cam kết', 'Quỹ sẽ có quá nhiều thương vụ'], a: 1, fb: fb('Người kế nhiệm định hình văn hoá cho cả thế hệ tiếp theo.', 'Successors set culture; revenue-only selection risks talent loss and compliance failures.', 'LP thẩm định cả con người và văn hoá.', 'Key-person và culture risk là hai câu hỏi đầu tiên của LP.', 'Culture', 'Kế nhiệm I') },
      { type: 'choice', id: 's_star_act', q: 'Bạn quyết định:', grade: true, best: [1], opts: [
        { t: 'Làm ngơ — anh ấy mang về nhiều tiền nhất', out: 'Thêm ba người nghỉ việc; một LP mở cuộc điều tra về văn hoá quỹ.', fx: { stats: { ethics: -10 }, rep: -4 } },
        { t: 'Điều tra độc lập, áp dụng quy tắc ứng xử, rút lại quyết định kế nhiệm và xây lộ trình cho Bảo An với hội đồng đầu tư độc lập', out: 'Một quyết định khó, nhưng đội ngũ thở phào. Bảo An bắt đầu lộ trình kế nhiệm — muộn hơn kế hoạch.', fx: { flags: { successor: 'an' }, stats: { ethics: 8 }, rep: 2, rel: { an: { trust: 15 } } } },
      ] },
    ],
    rewards: { xp: 60, rep: 1 },
  },
  // ---------- Branch C: no plan ----------
  {
    id: 's_none', title: '🔑 Kế nhiệm I: Điều khoản key person bị kích hoạt', ...base, req: ['e_legacy'],
    cond: (tl) => !tl.flags.successor || tl.flags.successor === 'none',
    summary: 'Bạn nhập viện hai tháng. Điều khoản key person trong LPA tạm dừng việc đầu tư mới. Quỹ cần một kế hoạch — ngay bây giờ.',
    steps: [
      { type: 'say', lines: [['an', 'Chị nằm viện hai tháng, và LP kích hoạt điều khoản key person: quỹ không được đầu tư mới cho đến khi có kế hoạch lãnh đạo được LP chấp thuận.'], ['tung', '(LP) Chúng tôi tin cô. Nhưng một quỹ không thể chỉ dựa vào một người.']], terms: ['Key Person Risk'] },
      { type: 'quiz', id: 's_none_q', concept: 'leadership', q: 'Điều khoản key person bảo vệ LP khỏi điều gì?', opts: ['Phí quản lý quá cao', 'Rủi ro những người mà LP đã "đặt cược" khi cam kết vốn không còn dẫn dắt quỹ — LP được quyền tạm dừng đầu tư hoặc thay đổi', 'Thị trường giảm'], a: 1, fb: fb('LP cam kết vốn vào con người; khi con người thay đổi, LP cần quyền phản ứng.', 'Key-person clauses protect LPs if named investment professionals leave or become unavailable.', 'Đầu tư vào GP là đầu tư vào đội ngũ.', 'Kế hoạch kế nhiệm rõ ràng làm giảm rủi ro này.', 'LPA terms', 'Kế nhiệm I') },
      { type: 'choice', id: 's_none_act', q: 'Kế hoạch bạn trình LP:', grade: true, best: [0], opts: [
        { t: 'Bổ nhiệm Bảo An làm đồng lãnh đạo với lộ trình 3 năm, thêm thành viên IC độc lập, chia sẻ carry cho đội ngũ', out: 'LP chấp thuận; quỹ hoạt động lại. Bảo An bắt đầu lộ trình kế nhiệm.', fx: { flags: { successor: 'an' }, rel: { tung: { trust: 6 }, an: { trust: 10 } } } },
        { t: 'Hứa sẽ "sớm quay lại" và không thay đổi gì', out: 'LP không chấp thuận; quỹ đóng băng thêm sáu tháng, bỏ lỡ hai thương vụ tốt.', fx: { rep: -4 } },
      ] },
    ],
    rewards: { xp: 50, rep: 1 },
  },
  // ---------- Convergence ----------
  {
    id: 's_governance', title: '🏛️ Kế nhiệm II: Hiến chương Investment Committee & chia sẻ carry', kind: 'succession', chapter: 'career', giver: 'me', loc: 'garden', age: 41,
    reqAny: ['s_coach', 's_star', 's_none'],
    summary: 'Mẹ Lan giúp bạn thiết kế quản trị để quỹ không phụ thuộc vào một người: thành phần IC, quyền biểu quyết, chia sẻ carry và vesting.',
    steps: [
      { type: 'say', lines: [['me', 'Mẹ đã thấy nhiều quỹ tan rã khi người sáng lập rời đi. Quỹ tồn tại được nhờ quy trình và sự công bằng — không nhờ một ngôi sao.'], ['bo', 'Và nhờ việc người cũ biết lùi lại đúng lúc.']], terms: ['IC Charter', 'Carry Vesting'] },
      { type: 'sort', id: 's_gov_sort', concept: 'leadership', q: 'Đâu là thiết kế quản trị tốt cho giai đoạn chuyển giao?', cats: ['Nên có', 'Không nên'],
        items: [['IC có ít nhất một thành viên độc lập', 0], ['Người sáng lập giữ quyền phủ quyết mọi quyết định vĩnh viễn', 1], ['Quy trình xung đột lợi ích bằng văn bản', 0], ['Carry phân bổ cho cả đội ngũ, có vesting', 0], ['Người kế nhiệm chỉ được "hỏi ý kiến", không được quyết', 1], ['Lộ trình chuyển giao có mốc thời gian công bố với LP', 0]],
        fb: fb('Chuyển giao thật sự nghĩa là trao quyền thật — với cơ chế kiểm soát công bằng.', 'Good succession governance: independent IC members, written conflict policies, shared and vested carry, a public transition timeline.', 'Quyền phủ quyết vĩnh viễn làm chuyển giao chỉ trên giấy.', 'LP đánh giá rủi ro thể chế, không chỉ rủi ro con người.', 'Governance', 'Kế nhiệm II') },
      { type: 'num', id: 's_gov_carry', concept: 'fund_economics', q: 'Quỹ carry 50 triệu USD: bạn 40%, người kế nhiệm 25%, đội ngũ 35%. Phần của người kế nhiệm (triệu USD)?', a: CARRY.successorAmt, tol: 0.05, unit: 'triệu USD', fb: fb('50 × 25% = 12,5.', 'Carry allocation aligns the next generation with fund performance.', 'Nhân tỷ lệ phân bổ.', 'Tăng dần tỷ lệ cho người kế nhiệm qua các quỹ sau là tín hiệu chuyển giao thực chất.', 'Carry allocation', 'Kế nhiệm II') },
      { type: 'num', id: 's_gov_vest', concept: 'fund_economics', q: 'Carry vesting đều trong 5 năm. Nếu người kế nhiệm rời đi sau 3 năm, họ giữ được bao nhiêu (triệu USD)?', a: CARRY.vestedAfter3, tol: 0.05, unit: 'triệu USD', fb: fb('12,5 × 3/5 = 7,5.', 'Vesting ties economics to staying power; unvested carry is forfeited on departure.', 'Vesting tuyến tính.', 'Vesting giữ chân người giỏi và bảo vệ phần của người ở lại.', 'Vesting', 'Kế nhiệm II') },
      { type: 'outcome', id: 's_gov_out', eval: (rt, S, sc) => ({ text: sc >= 0.8 ? 'Hiến chương IC và kế hoạch carry được LP đánh giá là "chuẩn mực thể chế". Quỹ sẵn sàng cho phép thử chuyển giao.' : 'Thiết kế quản trị còn lỗ hổng — LP yêu cầu sửa đổi trước khi chấp thuận chuyển giao.', fx: { flags: { gov_score: Math.round(sc * 100) / 100 } }, score: sc }) },
    ],
    rewards: { xp: 60, rep: 2, rel: { me: { respect: 6 } } },
  },
  {
    id: 's_handover', title: '🧭 Kế nhiệm III: Phép thử khi bạn vắng mặt', ...base, age: 42, req: ['s_governance'],
    summary: 'Bạn nghỉ phép dài hạn. Một công ty danh mục vi phạm covenant. Người kế nhiệm có xử lý được — và bạn có kiềm chế được việc can thiệp?',
    steps: [
      { type: 'say', lines: [['nar', 'Bạn đang trong kỳ nghỉ dài đầu tiên sau 20 năm. Điện thoại rung: chuỗi phòng khám Sáng Mắt vi phạm covenant sau khi bảo hiểm cắt giá hoàn trả.'], ['an', '(tin nhắn) Chị đừng lo, em và IC đang xử lý. Em sẽ báo cáo chị vào thứ Sáu.']] },
      { type: 'choice', id: 's_ho_intervene', q: 'Bạn làm gì?', grade: true, best: [1], opts: [
        { t: 'Gọi ngay cho ngân hàng và tự đàm phán thay An', out: 'Ngân hàng bối rối không biết ai có thẩm quyền. Đội ngũ hiểu rằng việc chuyển giao chỉ là hình thức.', v: { intervene: 1 } },
        { t: 'Tin tưởng quy trình: hỏi An một câu ("Downside case của em nói gì?") và chờ báo cáo thứ Sáu', out: 'Bạn nhận một báo cáo rõ ràng: equity cure một phần, gia hạn covenant, kế hoạch đa dạng payer mix.', v: { intervene: 0 } },
      ] },
      { type: 'outcome', id: 's_ho_out', eval: (rt, S) => {
        const ready = readiness(S.tl) - (rt.vars.intervene ? 1 : 0);
        if (ready >= 4) return { text: `Mức sẵn sàng ${ready}/5. Người kế nhiệm xử lý khủng hoảng bình tĩnh, minh bạch với LP. Chú Tùng: "Quỹ này đã trưởng thành hơn người sáng lập của nó — đó là lời khen lớn nhất."`, fx: { flags: { handover: 'success' }, rep: 5 }, score: 1 };
        if (ready >= 2) return { text: `Mức sẵn sàng ${ready}/5. Khủng hoảng được xử lý, nhưng bạn phải hỗ trợ thêm. Lộ trình chuyển giao kéo dài thêm hai năm.`, fx: { flags: { handover: 'partial' }, rep: 2 }, score: 0.6 };
        return { text: `Mức sẵn sàng ${ready}/5. Bạn phải quay lại điều hành. Bài học: người kế nhiệm được tạo ra từ hàng trăm quyết định huấn luyện nhỏ, không phải một tuyên bố.`, fx: { flags: { handover: 'delayed' } }, score: 0.3 };
      } },
    ],
    rewards: { xp: 60, rep: 2 },
  },
  {
    id: 's_epilogue', title: '🍋 Đoạn kết: Quầy nước chanh màu hồng', kind: 'succession', chapter: 'career', giver: 'hanh', loc: 'bakery', age: 45, req: ['s_handover'],
    summary: 'Trở lại nơi mọi chuyện bắt đầu. Nhìn lại những người đã đi cùng bạn — và trả lời câu hỏi của một cô bé bảy tuổi.',
    steps: [
      { type: 'say', lines: [['hanh', 'Con về rồi! Cô vẫn nhớ ngày con mặc cả với cô đến từng triệu đồng, rồi đề nghị giữ lại hai người thợ. Cô đã biết con là người tử tế.'], ['nar', 'Một cô bé bảy tuổi — cháu gái của người thợ năm xưa — đang loay hoay ở quầy nước chanh màu hồng ngoài cửa.'], ['nar', 'Cô bé hỏi: "Cô ơi, cháu nên bán ly nước chanh giá bao nhiêu ạ?"']] },
      { type: 'choice', id: 's_epi_advice', q: 'Bạn trả lời:', opts: [
        { t: '"Thử nhiều mức giá, đếm xem bán được bao nhiêu ly, rồi chọn mức cho nhiều lãi nhất — nhưng nhớ đối xử tử tế với khách quen nhé."', out: 'Cô bé gật gù, lấy bút ghi lại. Bạn nhớ đến chính mình năm tám tuổi.', v: { advice: 'craft' } },
        { t: '"Giá là thứ cháu trả, giá trị là thứ cháu nhận. Hãy luôn hỏi: điều này có đáng không?"', out: 'Cô bé không hiểu hết — nhưng sẽ nhớ câu ấy, như bạn đã nhớ câu của bố.', v: { advice: 'value' } },
        { t: '"Hỏi mẹ cháu đi!" — và mua luôn ba ly', out: 'Cô bé cười rạng rỡ. Đôi khi, khách hàng đầu tiên là món quà lớn nhất.', v: { advice: 'customer' } },
      ] },
      { type: 'outcome', id: 's_epi_out', eval: (rt, S) => ({ text: `ĐOẠN KẾT — ${epilogue(S.tl, S.account.playerName).join(' ')}`, fx: { flags: { epilogue_done: true, advice: rt.vars.advice }, ach: ['passing_torch'] }, score: 1 }) },
    ],
    rewards: { xp: 120, rep: 5, items: ['decor_lemonstand'] },
  },
];
export const SUCCESSION_IDS = SUCCESSION_QUESTS.map((q) => q.id);

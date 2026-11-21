// Hall of Legendary Deals — curated case pack.
// Every statement carries a label:
//   fact   = Verified Fact (widely documented in public filings / company releases / historical reporting)
//   interp = Analyst Interpretation (defensible view, not established fact)
//   sim    = Simulation Assumption (created for this game; NOT historical)
//   pending= Pending Research (not yet verified against a primary source)
// Never present sim/pending items as facts.

export const LABELS = {
  fact: { vi: 'Verified Fact', cls: 'lb-fact' },
  interp: { vi: 'Analyst Interpretation', cls: 'lb-interp' },
  sim: { vi: 'Simulation Assumption', cls: 'lb-sim' },
  alt: { vi: 'Alternative History', cls: 'lb-alt' },
  pending: { vi: 'Pending Research', cls: 'lb-pending' },
};

export const CASES = {
  disney_pixar: {
    title: 'The Walt Disney Company / Pixar', year: 2006, sector: 'Media & Entertainment — Animation', category: 'Classic & Legendary M&A',
    status: 'Hoàn tất (completed)', mission: 'h_disney', artifact: 'artifact_lamp',
    sections: [
      { h: 'Bối cảnh', items: [
        ['fact', 'Pixar và Disney có quan hệ hợp tác sản xuất/phân phối phim từ đầu thập niên 1990; đàm phán gia hạn đổ vỡ năm 2004.'],
        ['fact', 'Bob Iger trở thành CEO Disney năm 2005 và khởi động lại thảo luận với Pixar.'],
      ] },
      { h: 'Thương vụ', items: [
        ['fact', 'Công bố ngày 24/01/2006; hoàn tất ngày 05/05/2006.'],
        ['fact', 'Thanh toán hoàn toàn bằng cổ phiếu (all-stock): 2,3 cổ phiếu Disney cho mỗi cổ phiếu Pixar.'],
        ['fact', 'Giá trị thương vụ được báo cáo rộng rãi khoảng 7,4 tỷ USD.'],
        ['fact', 'Steve Jobs (cổ đông lớn nhất của Pixar) trở thành cổ đông cá nhân lớn nhất của Disney và tham gia Hội đồng quản trị Disney.'],
        ['fact', 'Ed Catmull giữ vai trò President và John Lasseter giữ vai trò Chief Creative Officer cho mảng hoạt hình hợp nhất.'],
      ] },
      { h: 'Lý do chiến lược & định giá', items: [
        ['interp', 'Disney mua năng lực sáng tạo, đội ngũ và văn hoá — thứ khó xây dựng nội bộ — để hồi sinh mảng hoạt hình.'],
        ['interp', 'Thanh toán bằng cổ phiếu giúp cổ đông Pixar chia sẻ upside và giảm áp lực tiền mặt cho Disney; đồng thời gắn lợi ích của lãnh đạo Pixar với Disney.'],
        ['interp', 'Định giá cao so với lợi nhuận hiện tại; giá trị nằm ở dòng phim tương lai, thương hiệu và nhân tài (khó đo bằng bội số truyền thống).'],
      ] },
      { h: 'Rủi ro chính', items: [
        ['interp', 'Rủi ro mất nhân tài sáng tạo nếu văn hoá Pixar bị "nuốt chửng" bởi tập đoàn lớn.'],
        ['interp', 'Rủi ro trả giá quá cao nếu các phim tương lai không thành công.'],
      ] },
      { h: 'Bài học', items: [
        ['interp', 'Trong thương vụ mua năng lực (capability acquisition), cấu trúc quản trị và giữ chân con người quan trọng ngang với giá.'],
      ] },
    ],
    sources: [
      { t: 'SEC EDGAR — tìm hồ sơ của Pixar và The Walt Disney Company (2006: 8-K, S-4, proxy)', u: 'https://www.sec.gov/edgar/search/' },
      { t: 'The Walt Disney Company — Investor Relations', u: 'https://thewaltdisneycompany.com/investor-relations/' },
    ],
    note: 'Các con số trong nhiệm vụ (giá cổ phiếu mô phỏng) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  rjr_kkr: {
    title: 'KKR / RJR Nabisco', year: 1988, sector: 'Consumer — Tobacco & Food', category: 'Private Equity & Complex Buyouts',
    status: 'Hoàn tất đầu năm 1989', mission: 'h_rjr', artifact: 'artifact_tobacco',
    sections: [
      { h: 'Bối cảnh', items: [
        ['fact', 'Tháng 10/1988, nhóm ban lãnh đạo do CEO F. Ross Johnson dẫn dắt (cùng Shearson Lehman Hutton) đề xuất mua lại công ty bằng LBO với giá khoảng 75 USD/cổ phiếu.'],
        ['fact', 'KKR đưa ra đề nghị cạnh tranh, mở ra một cuộc chiến trả giá; Hội đồng quản trị thành lập một ủy ban đặc biệt (special committee) để đánh giá các đề nghị.'],
      ] },
      { h: 'Thương vụ', items: [
        ['fact', 'KKR thắng với đề nghị khoảng 109 USD/cổ phiếu, dù đề nghị cuối của nhóm ban lãnh đạo có giá danh nghĩa cao hơn (khoảng 112 USD).'],
        ['fact', 'Giá trị vốn chủ khoảng 25 tỷ USD — LBO lớn nhất thời điểm đó.'],
        ['fact', 'Tài trợ chủ yếu bằng nợ: vay ngân hàng và trái phiếu lợi suất cao (junk bonds), có cả chứng khoán trả lãi bằng chứng khoán (PIK).'],
        ['fact', 'Trái chủ MetLife khởi kiện RJR Nabisco (1988), cho rằng LBO làm giảm giá trị trái phiếu hiện hữu; toà án liên bang bác đơn năm 1989.'],
      ] },
      { h: 'Quản trị & diễn giải', items: [
        ['interp', 'Giá danh nghĩa không bằng giá trị thực: giá trị của phần chứng khoán (không phải tiền mặt) trong mỗi đề nghị phụ thuộc vào chất lượng và điều khoản.'],
        ['interp', 'Đề nghị MBO tạo xung đột lợi ích: ban lãnh đạo vừa là người bán (đại diện cổ đông) vừa là người mua.'],
        ['interp', 'Gánh nặng nợ lớn hạn chế linh hoạt chiến lược; lợi nhuận của nhà đầu tư thường được đánh giá là kém so với kỳ vọng.'],
        ['interp', 'Vụ việc được xem là một động lực khiến thị trường đưa điều khoản bảo vệ trái chủ trước "event risk" (như change-of-control put) vào các đợt phát hành sau.'],
      ] },
      { h: 'Bài học', items: [
        ['interp', 'Vai trò của special committee độc lập; đánh giá đề nghị theo giá trị đã điều chỉnh rủi ro, không theo con số trên tiêu đề.'],
      ] },
    ],
    sources: [
      { t: 'Báo chí tài chính lịch sử 1988–1989 (The New York Times, The Wall Street Journal) — lưu trữ', u: 'https://www.nytimes.com/search?query=RJR+Nabisco+KKR+1988' },
      { t: 'KKR — lịch sử công ty', u: 'https://www.kkr.com/' },
    ],
    note: 'Hồ sơ SEC trước 1993 phần lớn không có trên EDGAR. Cấu trúc tiền mặt/chứng khoán trong nhiệm vụ là Simulation Assumption.',
  },
  keyrus_vuealta: {
    title: 'Keyrus / Vuealta — APAC Anaplan Practice', year: 2026, sector: 'Consulting & Professional Services — EPM', category: 'Keyrus Deal Academy',
    status: 'Đã công bố 22/01/2026 — trạng thái hoàn tất: chưa xác minh', mission: 'h_keyrus', artifact: 'artifact_epm',
    sections: [
      { h: 'Thương vụ', items: [
        ['fact', 'Keyrus Group công bố mua lại mảng Anaplan practice khu vực APAC của Vuealta Group (ngày 22/01/2026, Levallois-Perret & Singapore).'],
        ['fact', 'Đây là mua lại một practice (mảng kinh doanh), KHÔNG phải toàn bộ công ty Vuealta.'],
        ['fact', 'Practice có khoảng 20 chuyên gia Anaplan được chứng nhận, đặt nền tảng tại Singapore.'],
        ['fact', 'Giá trị thương vụ và số liệu tài chính: không công bố.'],
        ['pending', 'Thông cáo vừa nói "đã mua lại" vừa nói practice sẽ mang tên Keyrus "khi hoàn tất" — chưa có xác nhận ngày closing.'],
      ] },
      { h: 'Lý do chiến lược', items: [
        ['fact', 'Mục tiêu được công bố: mở rộng hiện diện APAC, tăng quy mô và nhân tài Anaplan, định vị Keyrus là đối tác Anaplan hàng đầu khu vực.'],
        ['interp', 'Mua practice giúp "mua" nhân tài đã chứng nhận và quan hệ khách hàng nhanh hơn tuyển dụng tự nhiên; rủi ro lớn nhất là giữ chân con người.'],
      ] },
      { h: 'Dữ liệu cho nhiệm vụ', items: [
        ['sim', 'Toàn bộ số liệu tài chính trong nhiệm vụ (utilization, bill rate, chi phí, bội số) là dữ liệu tổng hợp hư cấu, lấy cảm hứng từ mô hình kinh doanh tư vấn EPM.'],
      ] },
    ],
    sources: [
      { t: 'Keyrus — Keyrus acquires Vuealta’s Anaplan Practice', u: 'https://keyrus.com/worldwide/insights/keyrus-acquires-vuealtas-anaplan-practice-uniting-two-anaplan-powerhouses' },
      { t: 'Keyrus — Publications & financial news', u: 'https://keyrus.com/us/en/about-us/publications-and-financial-news' },
    ],
    note: 'Chỉ dùng thông tin công khai. Game không ngụ ý tiếp cận dữ liệu nội bộ của Keyrus.',
  },
};

// Keyrus Deal Academy research tracker. Only items verified against a public source are marked fact.
export const KEYRUS_ACADEMY = [
  { id: 'impetus', t: 'Keyrus / Impetus Consulting Group', y: 2020, topic: 'Strategic investment, tiếp cận thị trường Mỹ, chuyên môn Anaplan', st: 'pending' },
  { id: 'bigo', t: 'Keyrus / Bigo & IT Performa', y: 2021, topic: 'Mở rộng Mỹ Latinh, mua năng lực', st: 'pending' },
  { id: 'cmg', t: 'Keyrus / CMG Consulting Group', y: 2022, topic: 'Majority investment, mở rộng management consulting', st: 'pending' },
  { id: 'sonum', t: 'Keyrus / Sonum International', y: 2023, topic: 'Nguồn Keyrus EPM mô tả là "strategic investment" vào Sonum International — cần xác minh phạm vi (toàn công ty hay practice)', st: 'pending' },
  { id: 'keagle', t: 'K Eagle Investment / Keyrus — đề xuất chào mua công khai', y: 2023, topic: 'Public-to-private; cần xác minh kết quả, không coi đề xuất là đã hoàn tất', st: 'pending' },
  { id: 'upquest', t: 'Keyrus / Upquest', y: 2025, topic: 'Business & technology transformation consulting', st: 'pending' },
  { id: 'astek', t: 'Keyrus / Astek — thoái vốn Life Sciences CRO', y: 2025, topic: 'Divestiture — phân biệt bán mảng với bán công ty', st: 'pending' },
  { id: 'vuealta', t: 'Keyrus / Vuealta APAC Anaplan Practice', y: 2026, topic: 'Đã công bố 22/01/2026; practice ~20 chuyên gia; giá không công bố', st: 'fact', playable: true },
  { id: 'netpartners', t: 'Keyrus / NetPartners', y: 2026, topic: 'Mở rộng nền tảng EPM tại Brazil', st: 'pending' },
  { id: 'inlumi', t: 'Keyrus / inlumi', y: 2026, topic: 'Đã công bố 08/07/2026; inlumi (Utrecht) 170+ chuyên gia EPM, OneStream Diamond Partner; giá không công bố', st: 'fact' },
  { id: 'xiomega', t: 'Keyrus / Xiomega Consulting & oXya', y: 2026, topic: 'Thoái vốn chiến lược, tái cấu trúc danh mục', st: 'pending' },
  { id: 'profit', t: 'Keyrus / Profit&', y: 2026, topic: 'Mở rộng Intelligent Performance Management', st: 'pending' },
];

// Extended case pack (merged so every consumer sees one CASES registry).
import { CASES_EXTRA } from './cases_extra.js';
Object.assign(CASES, CASES_EXTRA);

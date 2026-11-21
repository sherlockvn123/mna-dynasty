// Career definitions. Each track: own office, mentor, hierarchy, promotion criteria, preview mission.
export const CAREERS = {
  ib: {
    name: 'Investment Banking', vi: 'Ngân hàng Đầu tư — M&A Advisory', icon: '🏦', office: 'ibank', mentor: 'victor', mission: 'k_ib_mandate', missions: ['k_ib_mandate', 'k_ib_cim', 'k_ib_pitch'],
    ranks: ['Intern', 'Analyst', 'Senior Analyst', 'Associate', 'Vice President', 'Director', 'Managing Director'],
    promo: 'Độ chính xác kỹ thuật, chất lượng tư vấn cho khách hàng, uy tín với MD.',
    risks: 'Burnout, sai sót mô hình trước khách hàng, xung đột lợi ích.',
    endgame: 'Trở thành M&A Managing Director với franchise khách hàng vững mạnh.',
    color: '#8ea6d8',
  },
  pe: {
    name: 'Private Equity', vi: 'Quỹ Đầu tư Tư nhân — Buyout', icon: '🌿', office: 'office_pe', mentor: 'sophia', mission: 'k_pe_lbo', missions: ['k_pe_lbo', 'k_pe_100day', 'k_pe_exit'],
    ranks: ['Intern', 'Investment Analyst', 'Associate', 'Senior Associate', 'Vice President', 'Principal', 'Partner', 'Managing Partner'],
    promo: 'Chất lượng phán đoán đầu tư, kỷ luật về giá, IC paper thuyết phục, tạo giá trị danh mục.',
    risks: 'Trả giá quá cao, đòn bẩy quá mức, vi phạm covenant.',
    endgame: 'Dẫn dắt một quỹ PE với lợi nhuận thực hiện (realized returns) mạnh và uy tín với LP.',
    color: '#93b39a',
  },
  vc: {
    name: 'Venture Capital', vi: 'Quỹ Đầu tư Mạo hiểm', icon: '🌱', office: 'office_vc', mentor: 'ken', mission: 'k_vc_round', missions: ['k_vc_round', 'k_vc_dd', 'k_vc_followon'],
    ranks: ['Analyst', 'Associate', 'Senior Associate', 'Principal', 'Partner', 'General Partner'],
    promo: 'Chất lượng deal flow, đánh giá founder, cấu trúc term sheet, kết quả danh mục theo power law.',
    risks: 'Chạy theo hype, pha loãng xấu, đầu tư follow-on theo cảm tính.',
    endgame: 'Quản lý một quỹ VC được công nhận toàn cầu.',
    color: '#f2c57c',
  },
  cd: {
    name: 'Corporate Development', vi: 'Phát triển Doanh nghiệp — Strategy & M&A', icon: '🏢', office: 'office_cd', mentor: 'hung', mission: 'k_cd_synergy', missions: ['k_cd_synergy', 'k_cd_screen', 'k_cd_divest'],
    ranks: ['Analyst', 'Senior Analyst', 'Manager', 'Senior Manager', 'Director', 'Head of Corporate Development', 'Group Strategy & M&A Director'],
    promo: 'Chất lượng đề xuất chiến lược, kỷ luật synergy, thành công tích hợp sau sáp nhập.',
    risks: 'Ước tính synergy quá lạc quan, thất bại tích hợp, mua vì "đế chế".',
    endgame: 'Head of Corporate Development / Group Strategy & M&A Director tại tập đoàn đa quốc gia.',
    color: '#d98fa5',
  },
  cs: {
    name: 'Strategic & Financial Consulting', vi: 'Tư vấn Chiến lược & Tài chính', icon: '🧭', office: 'office_cs', mentor: 'diep', mission: 'k_cs_cdd', missions: ['k_cs_cdd', 'k_cs_transform', 'k_cs_economics'],
    ranks: ['Analyst', 'Consultant', 'Senior Consultant', 'Manager', 'Director', 'Partner'],
    promo: 'Chất lượng phân tích có giả thuyết, quan hệ khách hàng, quản lý dự án đúng phạm vi và kinh tế học dự án (utilization, realization, margin).',
    risks: 'Scope creep, kết luận chiều lòng khách hàng thay vì dựa trên dữ liệu, burnout do travel và deadline.',
    endgame: 'Trở thành Partner dẫn dắt các dự án chiến lược và chuyển đổi lớn, với danh mục khách hàng riêng.',
    color: '#9fc3e6',
  },
  im: {
    name: 'Investment Management', vi: 'Quản lý Đầu tư — Asset Management', icon: '📈', office: 'office_im', mentor: 'tung', mission: 'k_im_research', missions: ['k_im_research', 'k_im_portfolio', 'k_im_attribution'],
    ranks: ['Research Analyst', 'Investment Analyst', 'Portfolio Manager', 'Senior Portfolio Manager', 'Chief Investment Officer'],
    promo: 'Chất lượng nghiên cứu, kỷ luật rủi ro, lợi nhuận đã điều chỉnh rủi ro so với benchmark và sự tin cậy của khách hàng tổ chức.',
    risks: 'Chạy theo đám đông, vi phạm giới hạn rủi ro, thông tin nội bộ, hoảng loạn khi thị trường giảm.',
    endgame: 'Trở thành Chief Investment Officer quản lý vốn của các tổ chức.',
    color: '#c9b8ec',
  },
};

// Realistic cross-career transferability (informational in this release; see BACKLOG for transition missions).
export const MOBILITY = [
  { from: 'IB', to: 'PE', strong: 'Định giá, mô hình, tốc độ thực thi', gap: 'Tư duy principal, quản trị danh mục, cấu trúc nợ' },
  { from: 'IB', to: 'Corporate Development', strong: 'Quy trình M&A, đàm phán', gap: 'Tích hợp sau sáp nhập, chiến lược dài hạn' },
  { from: 'Consulting', to: 'Corporate Strategy', strong: 'Commercial due diligence, operating model', gap: 'Transaction financing' },
  { from: 'Consulting', to: 'PE', strong: 'Commercial due diligence, value creation', gap: 'LBO, cấu trúc nợ, tư duy principal' },
  { from: 'Corporate Development', to: 'PE Portfolio Ops', strong: 'Tích hợp, synergy', gap: 'LBO, quan hệ LP' },
  { from: 'Corporate Finance', to: 'Investment Management', strong: 'Đọc báo cáo tài chính, định giá', gap: 'Xây dựng danh mục, quản trị rủi ro, đo lường hiệu quả' },
  { from: 'VC', to: 'Startup Operator', strong: 'Hiểu thị trường, mạng lưới founder', gap: 'Vận hành, quản lý con người' },
];

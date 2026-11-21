// Hall of Legendary Deals — extended case pack. Same labelling discipline as cases.js:
// fact = widely documented in company releases / filings / regulator decisions / major financial press;
// interp = analyst interpretation; sim = simulation assumption (used only in missions); pending = not yet verified.
// Exact amounts are those widely reported at announcement; always check the primary sources listed.
const EDGAR = { t: 'SEC EDGAR — tìm hồ sơ 8-K / S-4 / proxy của các bên', u: 'https://www.sec.gov/edgar/search/' };

export const CASES_EXTRA = {
  aol_timewarner: {
    title: 'AOL / Time Warner', year: 2000, sector: 'Media & Internet', category: 'Classic & Legendary M&A', status: 'Hoàn tất 2001; tách AOL năm 2009', mission: 'h_aol', artifact: 'artifact_modem',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố tháng 1/2000, trả hoàn toàn bằng cổ phiếu, giá trị được báo cáo khoảng 165 tỷ USD — một trong những thương vụ lớn nhất lịch sử.'], ['fact', 'Cổ đông AOL sở hữu khoảng 55% công ty hợp nhất, dù Time Warner có doanh thu và lợi nhuận lớn hơn.'], ['fact', 'Hoàn tất tháng 1/2001 sau khi được FTC và FCC chấp thuận có điều kiện.']] },
      { h: 'Hậu quả', items: [['fact', 'Năm 2002, AOL Time Warner ghi nhận khoản lỗ khoảng 99 tỷ USD, chủ yếu do ghi giảm lợi thế thương mại (goodwill).'], ['fact', 'AOL được tách ra thành công ty độc lập năm 2009.'], ['fact', 'Năm 2004, Time Warner bán Warner Music Group cho một nhóm nhà đầu tư do Edgar Bronfman Jr. dẫn đầu, cùng các quỹ Thomas H. Lee Partners, Bain Capital và Providence Equity.']] },
      { h: 'Diễn giải', items: [['interp', 'AOL dùng cổ phiếu được định giá rất cao ở đỉnh bong bóng dot-com làm "tiền tệ" thâu tóm tài sản thực.'], ['interp', 'Synergy kỳ vọng giữa nội dung và phân phối internet không thành hiện thực; văn hoá hai bên xung đột.']] },
    ],
    sources: [EDGAR, { t: 'Federal Trade Commission', u: 'https://www.ftc.gov/' }],
    note: 'Tỷ lệ sở hữu và số liệu trong nhiệm vụ ngoài phần Verified Fact là Simulation Assumption.',
  },
  ms_activision: {
    title: 'Microsoft / Activision Blizzard', year: 2023, sector: 'Technology & Gaming', category: 'Classic & Legendary M&A', status: 'Hoàn tất 13/10/2023', mission: 'h_activision', artifact: 'artifact_controller',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 18/01/2022: 95 USD/cổ phiếu tiền mặt, tổng giá trị khoảng 68,7 tỷ USD.'], ['fact', 'Phí chấm dứt (reverse termination fee) Microsoft phải trả nếu thương vụ thất bại được báo cáo lên tới 3 tỷ USD.']] },
      { h: 'Quá trình phê duyệt', items: [['fact', 'FTC kiện để ngăn thương vụ (12/2022) nhưng không giành được lệnh tạm thời tại toà.'], ['fact', 'Cơ quan Cạnh tranh và Thị trường Anh (CMA) ban đầu chặn thương vụ (4/2023) vì lo ngại thị trường cloud gaming.'], ['fact', 'Thương vụ được tái cấu trúc: quyền cloud streaming (ngoài khu vực EEA) với các game hiện tại và mới của Activision được bán cho Ubisoft; CMA chấp thuận và thương vụ hoàn tất 13/10/2023.']] },
      { h: 'Diễn giải', items: [['interp', 'Thương vụ cho thấy rủi ro pháp lý có thể kéo dài gần hai năm — deal certainty và cấu trúc phí chấm dứt trở thành trung tâm của đàm phán.']] },
    ],
    sources: [EDGAR, { t: 'UK Competition and Markets Authority — case decisions', u: 'https://www.gov.uk/cma-cases' }, { t: 'Federal Trade Commission', u: 'https://www.ftc.gov/' }],
    note: 'Giá cổ phiếu trước công bố dùng trong nhiệm vụ là Simulation Assumption làm tròn.',
  },
  bms_celgene: {
    title: 'Bristol Myers Squibb / Celgene', year: 2019, sector: 'Healthcare — Biopharma', category: 'Healthcare & Pharmaceutical M&A', status: 'Hoàn tất 20/11/2019', mission: 'h_celgene', artifact: 'artifact_capsule',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 3/1/2019, giá trị khoảng 74 tỷ USD. Mỗi cổ phiếu Celgene nhận 50 USD tiền mặt, 1 cổ phiếu BMS và 1 Contingent Value Right (CVR).'], ['fact', 'CVR trả 9 USD nếu ba loại thuốc trong pipeline được FDA phê duyệt trước các hạn chót đã định.'], ['fact', 'Để được chấp thuận chống độc quyền, Celgene bán thuốc Otezla cho Amgen với giá khoảng 13,4 tỷ USD.']] },
      { h: 'Kết quả CVR', items: [['fact', 'Liso-cel (Breyanzi) được phê duyệt tháng 2/2021, sau hạn chót 31/12/2020 — CVR hết hạn và không trả tiền.']] },
      { h: 'Diễn giải', items: [['interp', 'CVR giúp thu hẹp khoảng cách định giá giữa bên mua và bên bán về rủi ro pipeline, nhưng chuyển rủi ro thời gian phê duyệt sang cổ đông bên bán.'], ['interp', 'Động lực chính là bù đắp "patent cliff" khi thuốc chủ lực đối mặt cạnh tranh từ thuốc generic.']] },
    ],
    sources: [EDGAR, { t: 'Federal Trade Commission', u: 'https://www.ftc.gov/' }],
    note: 'Xác suất phê duyệt trong nhiệm vụ là Simulation Assumption.',
  },
  bx_hilton: {
    title: 'Blackstone / Hilton Hotels', year: 2007, sector: 'Real Estate & Hospitality', category: 'Private Equity & Complex Buyouts', status: 'Hoàn tất 2007; IPO 2013; thoái hoàn toàn 2018', mission: 'h_hilton', artifact: 'artifact_keycard',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 7/2007 — ngay trước khủng hoảng tài chính — giá trị khoảng 26 tỷ USD bao gồm nợ.'], ['fact', 'Hilton IPO lại vào 12/2013; Blackstone bán hết cổ phần năm 2018.'], ['fact', 'Lợi nhuận của Blackstone được báo cáo rộng rãi khoảng 14 tỷ USD — một trong những thương vụ LBO sinh lời nhất.']] },
      { h: 'Diễn giải', items: [['interp', 'Mua ở đỉnh chu kỳ nhưng vẫn thành công nhờ: cơ cấu lại nợ trong khủng hoảng, bơm thêm vốn, tập trung tăng trưởng mô hình nhượng quyền/quản lý ít vốn, và kiên nhẫn không bán ở đáy.']] },
    ],
    sources: [{ t: 'Blackstone — Investor Relations', u: 'https://www.blackstone.com/' }, EDGAR],
    note: 'Vốn chủ và dòng tiền trong nhiệm vụ là Simulation Assumption, không phải số liệu công bố.',
  },
  txu_efh: {
    title: 'TXU / Energy Future Holdings', year: 2007, sector: 'Utilities & Energy', category: 'Private Equity & Complex Buyouts', status: 'Hoàn tất 2007; phá sản Chapter 11 năm 2014', mission: 'h_txu', artifact: 'artifact_plug',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Năm 2007, liên danh KKR, TPG và Goldman Sachs mua lại TXU với giá trị khoảng 45 tỷ USD bao gồm nợ — LBO lớn nhất thời điểm đó.'], ['fact', 'Công ty được đổi tên thành Energy Future Holdings và nộp đơn phá sản Chapter 11 vào 4/2014.']] },
      { h: 'Diễn giải', items: [['interp', 'Luận điểm đầu tư phụ thuộc vào giá khí đốt cao (quyết định giá điện bán buôn). Cách mạng khí đá phiến làm giá khí đốt giảm sâu, trong khi đòn bẩy cực cao không chừa biên an toàn.']] },
    ],
    sources: [EDGAR, { t: 'KKR', u: 'https://www.kkr.com/' }],
    note: 'Số liệu EBITDA và nợ trong nhiệm vụ là Simulation Assumption.',
  },
  amzn_wholefoods: {
    title: 'Amazon / Whole Foods Market', year: 2017, sector: 'Consumer & Retail', category: 'Classic & Legendary M&A', status: 'Hoàn tất 28/8/2017', mission: 'h_wholefoods', artifact: 'artifact_basket',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 16/6/2017: 42 USD/cổ phiếu tiền mặt, khoảng 13,7 tỷ USD bao gồm nợ.'], ['fact', 'Ngay khi hoàn tất, Amazon giảm giá nhiều mặt hàng tại Whole Foods.']] },
      { h: 'Diễn giải', items: [['interp', 'Amazon mua mạng lưới cửa hàng vật lý, chuỗi cung ứng thực phẩm tươi và tệp khách hàng thu nhập cao để thúc đẩy chiến lược omnichannel.'], ['interp', 'Thông báo thương vụ làm cổ phiếu nhiều chuỗi bán lẻ thực phẩm khác giảm — thị trường định giá lại mối đe doạ cạnh tranh.']] },
    ],
    sources: [EDGAR],
    note: 'Giá cổ phiếu trước công bố trong nhiệm vụ là Simulation Assumption làm tròn.',
  },
  unh_change: {
    title: 'UnitedHealth (Optum) / Change Healthcare', year: 2022, sector: 'Healthcare — Data & Payments', category: 'Healthcare & Pharmaceutical M&A', status: 'Hoàn tất 3/10/2022', mission: 'h_change', artifact: 'artifact_chip',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 1/2021, giá trị khoảng 13 tỷ USD bao gồm nợ.'], ['fact', 'Bộ Tư pháp Mỹ (DOJ) kiện ngăn thương vụ (2/2022) với lo ngại về dữ liệu claims của đối thủ và tích hợp dọc.'], ['fact', 'Toà án bác đơn kiện của DOJ (9/2022). Change Healthcare bán mảng ClaimsXten cho TPG như một biện pháp khắc phục; thương vụ hoàn tất 10/2022.']] },
      { h: 'Sau thương vụ', items: [['fact', 'Tháng 2/2024, Change Healthcare bị tấn công ransomware, làm gián đoạn xử lý claims và thanh toán của nhiều nhà cung cấp dịch vụ y tế tại Mỹ.']] },
      { h: 'Diễn giải', items: [['interp', 'Tích hợp dọc giữa bên chi trả và hạ tầng dữ liệu tạo synergy, nhưng cũng tập trung rủi ro hệ thống — an ninh mạng trở thành rủi ro định giá cấp quốc gia.']] },
    ],
    sources: [{ t: 'U.S. Department of Justice — Antitrust Division', u: 'https://www.justice.gov/atr' }, EDGAR],
    note: 'Không có số liệu tài chính nào trong nhiệm vụ được trình bày như dữ kiện lịch sử ngoài phần Verified Fact.',
  },
  rio_arcadium: {
    title: 'Rio Tinto / Arcadium Lithium', year: 2025, sector: 'Mining & Energy Transition', category: 'Renewable Energy & Infrastructure', status: 'Hoàn tất 6/3/2025', mission: 'h_arcadium', artifact: 'artifact_battery',
    sections: [
      { h: 'Thương vụ', items: [['fact', 'Công bố 9/10/2024: 5,85 USD/cổ phiếu tiền mặt, giá trị khoảng 6,7 tỷ USD.'], ['fact', 'Mức giá tương đương phần bù khoảng 90% so với giá đóng cửa trước khi có thông tin thương vụ.'], ['fact', 'Thương vụ hoàn tất ngày 6/3/2025, đưa Rio Tinto thành một trong những nhà sản xuất lithium lớn.']] },
      { h: 'Diễn giải', items: [['interp', 'Mua ngược chu kỳ: giá lithium đã giảm mạnh từ đỉnh, giúp bên mua có tài sản chiến lược cho chuyển dịch năng lượng ở mức giá thấp hơn chi phí phát triển mới.']] },
    ],
    sources: [{ t: 'Rio Tinto — Media releases', u: 'https://www.riotinto.com/' }, EDGAR],
    note: 'Giá lithium và giá cổ phiếu trong nhiệm vụ là Simulation Assumption.',
  },
  // ---------- archive files (read-only, no mission yet) ----------
  ms_linkedin: {
    title: 'Microsoft / LinkedIn', year: 2016, sector: 'Technology', category: 'Classic & Legendary M&A', status: 'Hoàn tất 8/12/2016', mission: 'h_linkedin', artifact: 'artifact_badge',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 13/6/2016: 196 USD/cổ phiếu tiền mặt, khoảng 26,2 tỷ USD.'], ['fact', 'LinkedIn tiếp tục vận hành như một thương hiệu độc lập trong Microsoft.']] }, { h: 'Diễn giải', items: [['interp', 'Giá trị nằm ở dữ liệu mạng lưới nghề nghiệp kết hợp với Office/Dynamics; mô hình "độc lập nhưng tích hợp" giúp giữ chân người dùng và đội ngũ.']] }],
    sources: [EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  dell_emc: {
    title: 'Dell / EMC', year: 2016, sector: 'Technology Hardware', category: 'Classic & Legendary M&A', status: 'Hoàn tất 7/9/2016', mission: 'h_dell_emc', artifact: 'artifact_server',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 10/2015, giá trị khoảng 67 tỷ USD — thương vụ công nghệ lớn nhất thời điểm đó.'], ['fact', 'Cổ đông EMC nhận tiền mặt cùng tracking stock gắn với cổ phần VMware mà EMC nắm giữ.'], ['fact', 'Thương vụ được tài trợ bằng lượng nợ rất lớn.']] }, { h: 'Diễn giải', items: [['interp', 'Tracking stock là cách "trả bằng cổ phiếu" khi bên mua (Dell, đã tư nhân hoá) không có cổ phiếu niêm yết.']] }],
    sources: [EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  avgo_vmware: {
    title: 'Broadcom / VMware', year: 2023, sector: 'Technology — Software', category: 'AI, Technology & Venture', status: 'Hoàn tất 22/11/2023', mission: 'h_vmware', artifact: 'artifact_cloud',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 26/5/2022, khoảng 61 tỷ USD bằng tiền mặt và cổ phiếu, cùng việc tiếp nhận khoảng 8 tỷ USD nợ của VMware.'], ['fact', 'Hoàn tất 22/11/2023 sau khi nhận đủ phê duyệt, trong đó phê duyệt của cơ quan quản lý Trung Quốc đến sau cùng.']] }, { h: 'Diễn giải', items: [['interp', 'Broadcom nổi tiếng với chiến lược mua phần mềm hạ tầng, tập trung vào khách hàng lớn và cắt giảm chi phí mạnh sau thương vụ.']] }],
    sources: [EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  hca_lbo: {
    title: 'HCA — LBO 2006', year: 2006, sector: 'Healthcare — Hospitals', category: 'Private Equity & Complex Buyouts', status: 'Hoàn tất 2006; IPO lại 2011', mission: 'h_hca', artifact: 'artifact_stethoscope',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Liên danh Bain Capital, KKR, Merrill Lynch và gia đình Frist mua lại HCA năm 2006, giá trị khoảng 33 tỷ USD bao gồm nợ.'], ['fact', 'HCA niêm yết trở lại năm 2011.']] }, { h: 'Diễn giải', items: [['interp', 'Dòng tiền bệnh viện ổn định cho phép đòn bẩy cao; nhóm đầu tư nhận cổ tức đặc biệt (dividend recap) trước IPO.']] }],
    sources: [EDGAR, { t: 'Bain Capital', u: 'https://www.baincapital.com/' }], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  pfe_seagen: {
    title: 'Pfizer / Seagen', year: 2023, sector: 'Healthcare — Oncology', category: 'Healthcare & Pharmaceutical M&A', status: 'Hoàn tất 14/12/2023', mission: 'h_seagen', artifact: 'artifact_flask',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 13/3/2023: 229 USD/cổ phiếu tiền mặt, khoảng 43 tỷ USD.'], ['fact', 'Seagen chuyên về antibody-drug conjugates (ADC) trong điều trị ung thư.']] }, { h: 'Diễn giải', items: [['interp', 'Pfizer dùng tiền mặt dồi dào sau đại dịch để bổ sung pipeline trước các "patent cliff" cuối thập kỷ.']] }],
    sources: [EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  cvs_aetna: {
    title: 'CVS Health / Aetna', year: 2018, sector: 'Healthcare — Payer & Pharmacy', category: 'Healthcare & Pharmaceutical M&A', status: 'Hoàn tất 11/2018', mission: 'h_aetna', artifact: 'artifact_pillbox',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 12/2017, giá trị khoảng 69 tỷ USD, thanh toán bằng tiền mặt và cổ phiếu CVS.'], ['fact', 'DOJ chấp thuận với điều kiện Aetna bán mảng bảo hiểm thuốc kê đơn Medicare Part D.']] }, { h: 'Diễn giải', items: [['interp', 'Tích hợp dọc giữa nhà bán lẻ dược phẩm/PBM và công ty bảo hiểm nhằm đưa chăm sóc sức khoẻ cơ bản vào cửa hàng.']] }],
    sources: [{ t: 'U.S. Department of Justice — Antitrust Division', u: 'https://www.justice.gov/atr' }, EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  pld_duke: {
    title: 'Prologis / Duke Realty', year: 2022, sector: 'Real Estate — Logistics', category: 'Real Estate & Hospitality', status: 'Hoàn tất 10/2022', mission: 'h_duke', artifact: 'artifact_pallet',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Công bố 6/2022, thương vụ hoàn toàn bằng cổ phiếu, giá trị khoảng 26 tỷ USD bao gồm nợ.'], ['fact', 'Hợp nhất hai REIT bất động sản logistics hàng đầu Mỹ.']] }, { h: 'Diễn giải', items: [['interp', 'Giá trị đến từ quy mô danh mục kho bãi gần đô thị trong bối cảnh thương mại điện tử tăng trưởng; trả bằng cổ phiếu giúp không phải vay thêm khi lãi suất bắt đầu tăng.']] }],
    sources: [EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  bain_powerschool: {
    title: 'Bain Capital / PowerSchool', year: 2024, sector: 'Education — Software', category: 'Education M&A', status: 'Đã công bố 6/2024 — ngày hoàn tất: cần đối chiếu', mission: 'h_powerschool', artifact: 'artifact_pencil',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Bain Capital công bố mua lại PowerSchool, nhà cung cấp phần mềm quản lý trường học K-12, với giá trị khoảng 5,6 tỷ USD (22,80 USD/cổ phiếu).'], ['pending', 'Ngày hoàn tất cụ thể cần được đối chiếu với thông cáo chính thức.']] }, { h: 'Diễn giải', items: [['interp', 'Phần mềm giáo dục có doanh thu định kỳ và chi phí chuyển đổi cao — hồ sơ hấp dẫn cho take-private của PE.']] }],
    sources: [{ t: 'Bain Capital — News', u: 'https://www.baincapital.com/' }, EDGAR], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  bep_neoen: {
    title: 'Brookfield Renewable / Neoen', year: 2024, sector: 'Renewable Energy', category: 'Renewable Energy & Infrastructure', status: 'Đã công bố 5/2024 — trạng thái hoàn tất: cần đối chiếu', mission: 'h_neoen', artifact: 'artifact_turbine',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Brookfield công bố đàm phán độc quyền để mua cổ phần kiểm soát Neoen (Pháp) ở giá 39,85 EUR/cổ phiếu, tiếp theo là chào mua công khai.'], ['pending', 'Giá trị doanh nghiệp, ngày hoàn tất và tỷ lệ sở hữu cuối cùng cần đối chiếu với thông cáo của Brookfield và AMF.']] }, { h: 'Diễn giải', items: [['interp', 'Nhà đầu tư hạ tầng mua nền tảng phát triển dự án tái tạo để có pipeline dự án — không chỉ tài sản đang vận hành.']] }],
    sources: [{ t: 'Brookfield Renewable — News', u: 'https://bep.brookfield.com/' }], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
  amzn_anthropic: {
    title: 'Amazon / Anthropic — đầu tư chiến lược', year: 2024, sector: 'Artificial Intelligence', category: 'AI, Technology & Venture', status: 'Khoản đầu tư thiểu số (2023–2024)', mission: 'h_anthropic', artifact: 'artifact_neuron',
    sections: [{ h: 'Thương vụ', items: [['fact', 'Amazon công bố đầu tư tới 4 tỷ USD vào Anthropic (9/2023) và thêm 4 tỷ USD (11/2024), nâng tổng cam kết lên 8 tỷ USD, dưới dạng cổ phần thiểu số.'], ['fact', 'AWS trở thành đối tác đám mây và huấn luyện mô hình chính của Anthropic.']] }, { h: 'Diễn giải', items: [['interp', 'Đầu tư thiểu số kết hợp hợp tác thương mại (compute) — cấu trúc phổ biến khi bên lớn muốn tiếp cận năng lực AI mà không thâu tóm toàn bộ, đồng thời giảm rủi ro chống độc quyền.']] }],
    sources: [{ t: 'Amazon — About Amazon news', u: 'https://www.aboutamazon.com/' }, { t: 'Anthropic — News', u: 'https://www.anthropic.com/news' }], note: 'Các con số dùng để tính trong nhiệm vụ (giá trước công bố, doanh thu, tỷ lệ, cap rate…) là Simulation Assumption, không phải dữ liệu lịch sử.',
  },
};

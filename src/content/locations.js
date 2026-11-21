// Locations / scenes. Logical scene size 390×640. walk = walkable floor rectangle.
// objects: interactive hotspots. action types: go | quest | panel | info | decor
export const LOCATIONS = {
  bedroom: {
    name: 'Phòng ngủ', art: 'bedroom', minChapter: 'child', walk: [30, 380, 360, 575], spawn: [200, 500],
    objects: [
      { id: 'desk', label: 'Bàn học & sách', x: 22, y: 250, w: 110, h: 120, action: { type: 'panel', panel: 'glossary' } },
      { id: 'piggy', label: 'Ống heo', x: 250, y: 300, w: 46, h: 50, action: { type: 'quest', quest: 'c_piggy' } },
      { id: 'wardrobe', label: 'Tủ quần áo', x: 300, y: 200, w: 80, h: 170, action: { type: 'panel', panel: 'inventory' } },
      { id: 'door_garden', label: 'Ra vườn', x: 160, y: 250, w: 70, h: 130, action: { type: 'go', to: 'garden' } },
    ],
  },
  garden: {
    name: 'Vườn gia đình', art: 'garden', minChapter: 'child', walk: [20, 400, 370, 575], spawn: [195, 520], petals: true,
    objects: [
      { id: 'door_home', label: 'Vào nhà', x: 150, y: 250, w: 90, h: 140, action: { type: 'go', to: 'bedroom' } },
      { id: 'stand', label: 'Quầy nước chanh', x: 285, y: 310, w: 95, h: 90, action: { type: 'quest', quest: 'c_lemonade' } },
      { id: 'path_bakery', label: 'Đường tới Tiệm Bánh', x: 0, y: 330, w: 60, h: 80, action: { type: 'go', to: 'bakery' } },
      { id: 'path_city', label: 'Bến xe buýt', x: 330, y: 540, w: 60, h: 70, action: { type: 'panel', panel: 'map' }, minChapter: 'uni' },
    ],
  },
  bakery: {
    name: 'Tiệm Bánh Mây Hồng', art: 'bakery', minChapter: 'child', walk: [30, 440, 360, 575], spawn: [195, 540],
    objects: [
      { id: 'ledger', label: 'Sổ sách', x: 40, y: 330, w: 70, h: 60, action: { type: 'info', info: 'ledger' } },
      { id: 'oven', label: 'Lò nướng', x: 290, y: 240, w: 90, h: 150, action: { type: 'info', info: 'oven' } },
      { id: 'exit', label: 'Về vườn', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'garden' } },
    ],
  },
  campus: {
    name: 'Đại học Kinh tế', art: 'campus', minChapter: 'uni', walk: [20, 410, 370, 575], spawn: [195, 520], petals: true,
    objects: [
      { id: 'board', label: 'Bảng tin sự kiện', x: 290, y: 300, w: 80, h: 90, action: { type: 'quest', quest: 'u_network' } },
      { id: 'club_door', label: 'Phòng CLB Tài chính', x: 150, y: 250, w: 90, h: 150, action: { type: 'go', to: 'club' } },
      { id: 'library', label: 'Thư viện (Ôn tập)', x: 20, y: 280, w: 90, h: 110, action: { type: 'panel', panel: 'review' } },
    ],
  },
  club: {
    name: 'CLB Tài chính', art: 'club', minChapter: 'uni', walk: [30, 400, 360, 575], spawn: [195, 540],
    objects: [
      { id: 'whiteboard', label: 'Bảng trắng', x: 110, y: 150, w: 170, h: 120, action: { type: 'panel', panel: 'glossary' } },
      { id: 'exit', label: 'Ra sân trường', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'campus' } },
    ],
  },
  district: {
    name: 'Khu Tài chính', art: 'district', minChapter: 'intern', walk: [20, 420, 370, 575], spawn: [195, 530],
    objects: [
      { id: 'bank_door', label: 'Ngân hàng Lotus Capital', x: 30, y: 270, w: 110, h: 140, action: { type: 'go', to: 'ibank' } },
      { id: 'hall_door', label: 'Đại Sảnh Thương Vụ Huyền Thoại', x: 250, y: 260, w: 120, h: 150, action: { type: 'go', to: 'hall' } },
      { id: 'tower', label: 'Văn phòng nghề nghiệp', x: 150, y: 250, w: 90, h: 140, action: { type: 'career_office' }, minChapter: 'career' },
      { id: 'academy_door', label: 'Học viện Ngành', x: 300, y: 540, w: 85, h: 60, action: { type: 'go', to: 'academy' } },
      { id: 'firm_door', label: 'Quỹ của bạn', x: 10, y: 545, w: 90, h: 55, action: { type: 'go', to: 'firm' }, flag: 'endgame' },
    ],
  },
  ibank: {
    name: 'Lotus Capital — Tầng 23', art: 'ibank', minChapter: 'intern', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'Máy tính (Workbench)', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  hall: {
    name: 'Đại Sảnh Thương Vụ Huyền Thoại', art: 'hall', minChapter: 'intern', walk: [20, 420, 370, 575], spawn: [195, 545],
    objects: [
      { id: 'ped_disney', label: 'Disney / Pixar (2006)', x: 22, y: 300, w: 90, h: 110, action: { type: 'case', case: 'disney_pixar' } },
      { id: 'ped_rjr', label: 'KKR / RJR Nabisco (1988)', x: 150, y: 270, w: 90, h: 120, action: { type: 'case', case: 'rjr_kkr' } },
      { id: 'ped_keyrus', label: 'Keyrus Deal Academy', x: 278, y: 300, w: 90, h: 110, action: { type: 'case', case: 'keyrus_vuealta' } },
      { id: 'library', label: 'Thư viện hồ sơ (21)', x: 140, y: 140, w: 110, h: 80, action: { type: 'panel', panel: 'hall' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  academy: {
    name: 'Học viện Ngành — Industry Mastery Academy', art: 'academy', minChapter: 'intern', walk: [20, 420, 370, 575], spawn: [195, 545],
    objects: [
      { id: 'booth_edu', label: 'Giáo dục', x: 10, y: 300, w: 85, h: 100, action: { type: 'quest', quest: 'a_education' } },
      { id: 'booth_consult', label: 'Tư vấn', x: 100, y: 300, w: 85, h: 100, action: { type: 'quest', quest: 'a_consulting' } },
      { id: 'booth_energy', label: 'Năng lượng', x: 205, y: 300, w: 85, h: 100, action: { type: 'quest', quest: 'a_energy' } },
      { id: 'booth_re', label: 'Bất động sản', x: 295, y: 300, w: 85, h: 100, action: { type: 'quest', quest: 'a_realestate' } },
      { id: 'board', label: 'Bảng chuyên môn ngành', x: 140, y: 140, w: 110, h: 100, action: { type: 'panel', panel: 'academy' } },
      { id: 'wb', label: 'Industry Workbench', x: 300, y: 205, w: 80, h: 70, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  office_pe: {
    name: 'Sage Peak Capital (PE)', art: 'office', theme: 'pe', minChapter: 'career', career: 'pe', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'LBO Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  office_vc: {
    name: 'Seedling Ventures (VC)', art: 'office', theme: 'vc', minChapter: 'career', career: 'vc', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'Cap Table Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  office_cs: {
    name: 'Bluebell Partners (Consulting)', art: 'office', theme: 'cs', minChapter: 'career', career: 'cs', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'Engagement Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  office_im: {
    name: 'Lavender Asset Management', art: 'office', theme: 'im', minChapter: 'career', career: 'im', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'Portfolio Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  firm: {
    name: 'Quỹ của bạn — Capital Partners', art: 'office', theme: 'firm', minChapter: 'career', flag: 'endgame', walk: [20, 410, 370, 575], spawn: [195, 545],
    objects: [
      { id: 'lp_table', label: 'Bàn gặp LP', x: 20, y: 380, w: 100, h: 60, action: { type: 'quest', quest: 'e_fund' } },
      { id: 'pipeline', label: 'Bảng deal pipeline', x: 270, y: 380, w: 100, h: 60, action: { type: 'quest', quest: 'e_platform' } },
      { id: 'boardroom', label: 'Phòng họp HĐQT', x: 30, y: 150, w: 120, h: 70, action: { type: 'quest', quest: 'e_crisis' } },
      { id: 'legacy', label: 'Bức tường di sản', x: 240, y: 150, w: 120, h: 70, action: { type: 'panel', panel: 'legacy' } },
      { id: 'league', label: 'Bảng xếp hạng quỹ', x: 270, y: 470, w: 100, h: 60, action: { type: 'panel', panel: 'league' } },
      { id: 'pc', label: 'Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
  office_cd: {
    name: 'Pastel Retail Group — Corporate Development', art: 'office', theme: 'cd', minChapter: 'career', career: 'cd', walk: [20, 410, 370, 575], spawn: [195, 540],
    objects: [
      { id: 'pc', label: 'Synergy Workbench', x: 150, y: 300, w: 90, h: 80, action: { type: 'panel', panel: 'workbench' } },
      { id: 'exit', label: 'Ra phố', x: 160, y: 590, w: 70, h: 50, action: { type: 'go', to: 'district' } },
    ],
  },
};

export const INFO_DOCS = {
  ledger: {
    title: 'Sổ sách Tiệm Bánh Mây Hồng (tháng gần nhất)',
    body: 'Doanh thu: 60 triệu đồng\nNguyên liệu: 24 triệu\nLương 2 thợ: 15 triệu\nTiền thuê mặt bằng: 9 triệu\nĐiện, nước, khác: 3 triệu\n\nGhi chú của Cô Hạnh: "Tháng nào cũng gần như vậy, Tết thì đông hơn."',
    flag: 'saw_ledger',
  },
  oven: {
    title: 'Lò nướng',
    body: 'Lò nướng chính đã dùng 14 năm. Cửa lò đóng không kín, nhiệt độ dao động.\nThợ sửa ước tính: cần thay lò mới trong năm tới, chi phí khoảng 40 triệu đồng.\n\n💡 Đây là một phát hiện Due Diligence: một khoản capex (chi đầu tư) mà người bán không nhắc tới.',
    flag: 'saw_oven',
  },
};

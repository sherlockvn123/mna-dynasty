// Industry Mastery Academies — sector metadata. Each priority sector has one academy mission that walks the
// A–F learning framework: Fundamentals → Business Economics → Competitive Dynamics → Financial Analysis →
// Strategic Opportunities → Expert-Level Assessment.
export const FRAMEWORK = ['A. Industry Fundamentals', 'B. Business Economics', 'C. Competitive Dynamics', 'D. Financial Analysis', 'E. Strategic Opportunities', 'F. Expert-Level Assessment'];

export const SECTORS = {
  healthcare: { name: 'Healthcare & Life Sciences', vi: 'Y tế & Khoa học sự sống', icon: '🩺', quest: 'a_healthcare', color: '#9fc3e6',
    kpis: ['Lượt khám', 'Doanh thu/lượt khám', 'Payer mix', 'Công suất', 'Giữ chân bác sĩ'], multiples: 'EV/EBITDA 10–14x (dịch vụ y tế)' },
  education: { name: 'Education & EdTech', vi: 'Giáo dục & EdTech', icon: '🎓', quest: 'a_education', color: '#f2c57c',
    kpis: ['Số học sinh', 'Học phí', 'Tỷ lệ giữ chân', 'Công suất lấp đầy', 'Tỷ lệ HS/giáo viên'], multiples: 'EV/EBITDA 9–13x' },
  consulting: { name: 'Consulting & Professional Services', vi: 'Tư vấn & Dịch vụ chuyên nghiệp', icon: '🧭', quest: 'a_consulting', color: '#c9b8ec',
    kpis: ['Utilization', 'Realization', 'Doanh thu/consultant', 'Backlog', 'Attrition'], multiples: 'EV/EBITDA 8–12x; EV/Revenue 1–2x' },
  energy: { name: 'Renewable Energy', vi: 'Năng lượng tái tạo', icon: '☀️', quest: 'a_energy', color: '#a8cf9c',
    kpis: ['Công suất (MW)', 'Capacity factor', 'Giá PPA', 'DSCR', 'Project IRR'], multiples: 'Định giá theo DCF dự án / EV per MW' },
  realestate: { name: 'Real Estate & Infrastructure', vi: 'Bất động sản & Hạ tầng', icon: '🏢', quest: 'a_realestate', color: '#f6a9bf',
    kpis: ['Tỷ lệ lấp đầy', 'NOI', 'Cap rate', 'LTV', 'DSCR'], multiples: 'Giá trị = NOI / Cap rate' },
  ai: { name: 'Artificial Intelligence', vi: 'Trí tuệ nhân tạo', icon: '🤖', quest: 'a_ai', color: '#b7a4e0',
    kpis: ['Gross margin', 'Chi phí inference', 'Retention', 'Khác biệt mô hình', 'Kênh phân phối'], multiples: 'EV/ARR — điều chỉnh theo chất lượng biên lợi nhuận' },
  saas: { name: 'Technology & SaaS', vi: 'Công nghệ & SaaS', icon: '💻', quest: 'a_saas', color: '#93b39a',
    kpis: ['ARR', 'NRR', 'Rule of 40', 'LTV/CAC', 'FCF margin'], multiples: 'EV/ARR, EV/Revenue' },
};

// Additional sectors listed in the design — academies planned (see docs/BACKLOG.md).
export const PLANNED_SECTORS = ['Consumer & Retail', 'Financial Services', 'Insurance', 'Banking', 'Mining & Metals', 'Semiconductors', 'Telecommunications', 'Logistics', 'Industrial Manufacturing', 'Hospitality', 'Consumer Internet', 'Media & Entertainment', 'Agriculture', 'Biotechnology', 'Utilities'];

// Specialization helpers (pure; tl = timeline state).
export const SECTOR_MENTOR = { healthcare: 'phuong', ai: 'minhanh', saas: 'minhanh' };
export const academyScore = (tl, sector) => tl.questsDone[SECTORS[sector].quest]?.score ?? null;
export function isSpecialist(tl, sector) {
  const sp = tl.spec;
  if (!sp) return false;
  if (sp.primary === 'generalist') return academyScore(tl, sector) !== null;
  return sp.primary === sector || sp.secondary === sector;
}
/** Industry credibility 0–100: academy competence + specialization focus. */
export function credibility(tl, sector) {
  const sc = academyScore(tl, sector);
  if (sc === null) return 0;
  const sp = tl.spec || {};
  const bonus = sp.primary === sector ? 40 : sp.secondary === sector ? 25 : sp.primary === 'generalist' ? 15 : 0;
  return Math.round(sc * 60 + bonus);
}

// Which career missions benefit from which sector expertise (used for specialization credibility).
export const SECTOR_OF_MISSION = { k_ib_mandate: 'healthcare', k_ib_cim: 'healthcare', k_vc_round: 'ai', k_vc_dd: 'education', k_vc_followon: 'ai', h_keyrus: 'consulting', k_cs_economics: 'consulting' };

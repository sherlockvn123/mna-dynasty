// Quest / mission content — data-driven. See docs/ARCHITECTURE.md for the step schema.
// Every numeric answer is computed by the Financial Calculation Engine (correct by construction)
// and independently cross-checked in tests/game.test.js.
import * as F from '../engine/finance.js';
import { lboParams } from './models.js';
import { CAREER_QUESTS } from './quests_career.js';
import { INDUSTRY_QUESTS } from './quests_industry.js';
import { CONSULTING_QUESTS } from './quests_consulting.js';
import { IM_QUESTS } from './quests_im.js';
import { TRANSITION_QUESTS } from './quests_transition.js';
import { ENDGAME_QUESTS } from './quests_endgame.js';
import { CRISIS_QUESTS } from './quests_crisis.js';
import { SUCCESSION_QUESTS } from './quests_succession.js';
import { CASE_QUESTS } from './quests_cases.js';
import { CASE2_QUESTS } from './quests_cases2.js';
import { REPLAY_QUESTS } from './quests_replay.js';
import './quests_replay2.js'; // extends REPLAY_QUESTS / REPLAYS / REPLAY_IDS before QUESTS is assembled
import { CAREERS } from './careers.js';
import { isSpecialist, SECTORS, credibility } from './sectors.js';

// ---------- precomputed answers ----------
const LEMON_BEST = F.lemonade({ price: 9, unitCost: 3, fixedCost: 40, a: 120, b: 8 });
const PIGGY_FV = F.fv(500, 0.08, 10);
const BAKERY = { monthly: 60 - 24 - 15 - 9 - 3, oven: 40, ask: 500 };
BAKERY.annual = BAKERY.monthly * 12;                         // 108
BAKERY.fair = F.valueAtMultiple(BAKERY.annual, 3.5);         // 378
BAKERY.adj = BAKERY.fair - BAKERY.oven;                      // 338
const IS = F.incomeStatement({ revenue: 1200, cogs: 720, opex: 240, da: 60, interest: 30, taxRate: 0.2 });
const DCF = F.dcf({ fcff: [50, 55, 60, 64, 68], wacc: 0.1, g: 0.025, netDebt: 200, shares: 50 });
const COMPS = F.comps([{ ev: 1200, ebitda: 100 }, { ev: 900, ebitda: 100 }, { ev: 1650, ebitda: 150 }, { ev: 700, ebitda: 70 }, { ev: 2600, ebitda: 200 }], 80, 130);
const BIDS = { A: F.expectedValue(520, 0.55, 450), B: F.expectedValue(495, 0.95, 450), C: F.expectedValue(505, 0.7, 450) };
const LBO8 = F.lbo(lboParams({ entry: 8, debt: 5, exit: 8, rate: 8 }));
const LBO9 = F.lbo(lboParams({ entry: 9, debt: 5, exit: 8, rate: 8 }));
const LBO8x7 = F.lbo(lboParams({ entry: 8, debt: 5, exit: 7, rate: 8 }));
const ROUND = F.pricedRound({ preMoney: 32, investment: 8, sharesPre: 8_000_000, poolPostPct: 0.1 });
const WF30 = F.waterfall(30, [{ name: 'A', invested: 8, shares: ROUND.newInvShares }], 8_000_000 + ROUND.newPool);
const AD = F.accretionDilution({ acqNI: 120, acqShares: 100, acqPrice: 24, tgtNI: 15, purchasePrice: 360, pctStock: 0.5, kd: 0.06, tax: 0.2 });
const KE_OLD = F.capm({ rf: 0.03, beta: 1.2, erp: 0.06 }), KE_NEW = F.capm({ rf: 0.05, beta: 1.2, erp: 0.06 });
const W_OLD = F.wacc({ equity: 70, debt: 30, ke: KE_OLD, kd: 0.06, tax: 0.2 });
const W_NEW = F.wacc({ equity: 70, debt: 30, ke: KE_NEW, kd: 0.08, tax: 0.2 });
const EV_OLD = F.dcf({ fcff: [50, 55, 60, 64, 68], wacc: W_OLD, g: 0.025 }).ev;
const EV_NEW = F.dcf({ fcff: [50, 55, 60, 64, 68], wacc: W_NEW, g: 0.025 }).ev;
const REC = { ebitda: 440 * 0.16, debt: 450, cov: 5.5 };
REC.lev = F.leverage(REC.debt, REC.ebitda);
REC.cure = REC.debt - REC.cov * REC.ebitda;
const CONS = F.consultingFirm({ consultants: 20, utilization: 0.72, hours: 1800, billRate: 160, realization: 0.92, costPerConsultant: 120000, sgaPct: 0.15, attrition: 0.18, replaceCost: 30000 });
const RJR = { M: 84 + 28 * 0.75, K: 90 + 19 * 0.95 };

export const ANSWERS = { LEMON_BEST, PIGGY_FV, BAKERY, IS, DCF, COMPS, BIDS, LBO8, LBO9, LBO8x7, ROUND, WF30, AD, W_OLD, W_NEW, EV_OLD, EV_NEW, REC, CONS, RJR, KE_NEW };

const r1 = (x) => Math.round(x * 10) / 10;
const r2 = (x) => Math.round(x * 100) / 100;

// ---------- quests ----------
export const QUESTS = [
  // ======================= CHAPTER 1 — CHILDHOOD =======================
  {
    id: 'c_dinner', title: 'Bữa tối & bí mật của lợi nhuận', kind: 'main', chapter: 'child', giver: 'bo', loc: 'garden', age: 7,
    summary: 'Bố mẹ kể về tiệm bánh của Cô Hạnh. Học phân biệt Revenue và Expense.',
    steps: [
      { type: 'say', lines: [['bo', 'Linh này, hôm nay bố mua bánh ở tiệm Cô Hạnh. Con có biết cô ấy kiếm tiền thế nào không?'], ['me', 'Mỗi chiếc bánh bán ra mang lại tiền — đó là Revenue (doanh thu). Nhưng cô phải mua bột, trả lương thợ, trả tiền thuê nhà — đó là Expense (chi phí).'], ['bo', 'Còn lại sau khi trừ hết chi phí mới là Profit — lợi nhuận. Thử phân loại xem nào!']], terms: ['Revenue', 'Expense', 'Profit'] },
      { type: 'sort', id: 'c_dinner_sort', concept: 'revenue_expense', q: 'Xếp mỗi khoản vào đúng nhóm:', cats: ['Revenue — Doanh thu', 'Expense — Chi phí'],
        items: [['Tiền khách trả cho bánh su kem', 0], ['Mua bột mì và bơ', 1], ['Lương hai người thợ', 1], ['Tiền bán bánh sinh nhật đặt trước', 0], ['Tiền thuê mặt bằng', 1], ['Tiền điện chạy lò nướng', 1]],
        fb: { vi: 'Doanh thu là tiền đi VÀO từ khách hàng; chi phí là tiền đi RA để vận hành.', en: 'Revenue = inflows from customers; expenses = outflows to operate the business.', why: 'Hỏi: tiền này đến từ khách hàng hay trả cho người khác?', impl: 'Phân loại sai sẽ làm sai lợi nhuận và mọi quyết định sau đó.', related: 'Profit, Income Statement', review: 'Ôn lại trong Thư viện → Revenue/Expense' } },
      { type: 'num', id: 'c_dinner_profit', concept: 'profit', q: 'Hôm qua tiệm bán 50 chiếc bánh, mỗi chiếc 10 nghìn đồng. Tổng chi phí trong ngày là 300 nghìn đồng. Lợi nhuận là bao nhiêu (nghìn đồng)?', a: 200, tol: 0, unit: 'nghìn đồng',
        traps: [{ v: 500, why: 'Đó là doanh thu (50 × 10), chưa trừ chi phí.' }, { v: 800, why: 'Bạn đã CỘNG chi phí thay vì trừ.' }],
        fb: { vi: 'Lợi nhuận = Doanh thu − Chi phí = 50 × 10 − 300 = 200 nghìn đồng.', en: 'Profit = Revenue − Expenses.', why: '500 − 300 = 200.', impl: 'Một tiệm bán nhiều nhưng chi phí cao vẫn có thể lỗ.', related: 'Margin', review: 'Bữa tối & bí mật của lợi nhuận' } },
      { type: 'quiz', id: 'c_dinner_cash', concept: 'cash', q: 'Mẹ hỏi: "Một tiệm có lãi nhưng vẫn có thể hết tiền mặt không?"', opts: ['Không thể — có lãi thì luôn có tiền', 'Có thể — nếu khách nợ tiền chưa trả hoặc tiệm vừa chi nhiều tiền mua lò mới', 'Chỉ khi tiệm bán quá ít bánh'], a: 1,
        fb: { vi: 'Lợi nhuận ghi nhận khi bán hàng; tiền mặt chỉ vào khi khách thực sự trả. Mua lò mới tốn tiền ngay nhưng chi phí được phân bổ nhiều năm.', en: 'Profit ≠ cash: timing of collections and capital spending creates gaps.', why: 'Lợi nhuận là "ý kiến" kế toán, tiền mặt là thực tế.', impl: 'Đây là lý do doanh nghiệp cần quản lý dòng tiền, không chỉ lợi nhuận.', related: 'Cash Flow, Working Capital, Capex', review: 'Chương 2 — Báo cáo tài chính' } },
      { type: 'say', lines: [['me', 'Giỏi lắm! Nhớ nhé: lợi nhuận là ý kiến, tiền mặt là sự thật.'], ['bo', 'Mai con thử tự kinh doanh xem — quầy nước chanh ngoài vườn đang trống đấy.']] },
    ],
    rewards: { xp: 20, rep: 1, rel: { bo: { trust: 5 }, me: { trust: 5 } } },
  },
  {
    id: 'c_lemonade', title: 'Quầy nước chanh mùa hè', kind: 'main', chapter: 'child', giver: null, loc: 'garden', obj: 'stand', age: 8, req: ['c_dinner'],
    summary: 'Tự định giá ly nước chanh. Khám phá cung–cầu và tối đa hoá lợi nhuận.',
    steps: [
      { type: 'say', lines: [['nar', 'Một buổi chiều nắng. Quầy nước chanh nhỏ màu hồng đã sẵn sàng.'], ['me', 'Giá càng cao thì mỗi ly lãi nhiều hơn, nhưng sẽ ít người mua hơn. Con hãy tìm mức giá tốt nhất.']], terms: ['Supply and Demand'] },
      { type: 'model', id: 'c_lemon_model', model: 'lemonade', concept: 'supply_demand', goal: { text: 'Mục tiêu: tìm mức giá cho lợi nhuận/ngày cao nhất.', check: (o) => Math.abs(o.profit - LEMON_BEST.profit) < 1e-9 } },
      { type: 'num', id: 'c_lemon_profit', concept: 'supply_demand', q: 'Ở mức giá tối ưu, lợi nhuận mỗi ngày là bao nhiêu nghìn đồng?', a: LEMON_BEST.profit, tol: 0, unit: 'nghìn đồng',
        fb: { vi: `Giá 9 → bán ${LEMON_BEST.q} ly. Lợi nhuận = (9 − 3) × ${LEMON_BEST.q} − 40 = ${LEMON_BEST.profit}.`, en: 'Profit-maximizing price balances margin per unit against volume lost.', why: 'Với cầu tuyến tính q = a − bp, giá tối ưu p* = (a/b + c)/2 = (15 + 3)/2 = 9.', impl: 'Định giá là một trong những đòn bẩy lợi nhuận mạnh nhất.', related: 'Pricing Strategy, Elasticity', review: 'Quầy nước chanh mùa hè' } },
      { type: 'quiz', id: 'c_lemon_why', concept: 'supply_demand', q: 'Vì sao tăng giá từ 9 lên 12 nghìn lại làm lợi nhuận GIẢM?', opts: ['Vì chi phí mỗi ly tăng lên', 'Vì số ly bán được giảm mạnh, phần lãi thêm mỗi ly không bù được', 'Vì tiền thuê quầy tăng'], a: 1,
        fb: { vi: 'Chi phí không đổi. Ở giá 12, chỉ bán 24 ly: (12 − 3) × 24 − 40 = 176 < 248.', en: 'Volume loss outweighs higher unit margin beyond the optimal price.', why: 'Mỗi nghìn đồng tăng giá làm mất 8 khách.', impl: 'Doanh nghiệp phải hiểu độ nhạy cảm giá của khách hàng.', related: 'Price Elasticity', review: 'Quầy nước chanh mùa hè' } },
    ],
    rewards: { xp: 25, rep: 1, credits: 10, items: ['decor_lemon'], rel: { me: { respect: 5 } } },
  },
  {
    id: 'c_piggy', title: 'Ống heo và chiếc xe đồ chơi', kind: 'mentor', chapter: 'child', giver: null, loc: 'bedroom', obj: 'piggy', age: 9, req: ['c_dinner'], optional: true,
    summary: 'Mua đồ chơi ngay hay để tiền sinh lãi? Học Opportunity Cost và Compounding.',
    steps: [
      { type: 'say', lines: [['nar', 'Ống heo có 500 nghìn đồng. Ở cửa hàng có chiếc xe điều khiển giá đúng 500 nghìn.'], ['bo', 'Nếu gửi tiết kiệm 8%/năm thì sao? Lãi năm sau lại sinh lãi — đó là Compounding.']], terms: ['Opportunity Cost', 'Compounding'] },
      { type: 'model', id: 'c_piggy_model', model: 'compound', concept: 'compounding' },
      { type: 'num', id: 'c_piggy_fv', concept: 'compounding', q: 'Gửi 500 nghìn với lãi 8%/năm trong 10 năm, nhận được bao nhiêu (làm tròn nghìn đồng)?', a: Math.round(PIGGY_FV), tol: 1, unit: 'nghìn đồng',
        traps: [{ v: 900, why: 'Đó là lãi đơn (500 + 10 × 40). Lãi kép tính lãi trên cả lãi.' }],
        fb: { vi: `500 × 1,08^10 ≈ ${Math.round(PIGGY_FV)} nghìn đồng — gần gấp đôi.`, en: 'FV = PV × (1 + r)^n.', why: '1,08^10 ≈ 2,159.', impl: 'Thời gian là đồng minh lớn nhất của nhà đầu tư.', related: 'Rule of 72: 72/8 ≈ 9 năm để gấp đôi', review: 'Ống heo' } },
      { type: 'quiz', id: 'c_piggy_oc', concept: 'opportunity_cost', q: 'Nếu Linh mua xe ngay, "chi phí cơ hội" là gì?', opts: ['500 nghìn đồng', 'Khoảng 1.079 nghìn đồng có thể có sau 10 năm', 'Không có chi phí gì vì xe rất vui'], a: 1,
        fb: { vi: 'Chi phí cơ hội là giá trị của lựa chọn tốt nhất bị bỏ qua — ở đây là số tiền tương lai.', en: 'Opportunity cost is the value of the next-best alternative forgone.', why: 'So sánh giữa các lựa chọn, không chỉ giá tiền.', impl: 'Mọi quyết định đầu tư đều là so sánh với phương án thay thế.', related: 'Hurdle rate', review: 'Ống heo' } },
      { type: 'choice', id: 'c_piggy_choice', q: 'Linh quyết định thế nào?', opts: [
        { t: 'Gửi tiết kiệm phần lớn, giữ 100 nghìn mua quà nhỏ', out: 'Một lựa chọn cân bằng — vừa tận hưởng, vừa đầu tư.', fx: { flags: { saver: 2 } } },
        { t: 'Gửi tiết kiệm toàn bộ', out: 'Kỷ luật! Ống heo vàng sẽ nhắc bạn về lãi kép.', fx: { flags: { saver: 3 } } },
        { t: 'Mua xe ngay', out: 'Vui hôm nay — nhưng giờ bạn đã biết cái giá thật sự.', fx: { flags: { saver: 1 } } },
      ] },
    ],
    rewards: { xp: 20, items: ['decor_piggy'], rel: { bo: { trust: 3 } } },
  },
  {
    id: 'c_bakery', title: '⭐ The Bakery Acquisition', kind: 'main', chapter: 'child', giver: 'hanh', loc: 'bakery', age: 10, req: ['c_lemonade'], flagship: true,
    summary: 'Cô Hạnh muốn nghỉ hưu và bán tiệm. Thẩm định, định giá, đàm phán — và quyết định mua hay không.',
    steps: [
      { type: 'say', lines: [['hanh', 'Cô làm bánh 30 năm rồi, mỏi lưng lắm. Cô muốn bán tiệm với giá 500 triệu đồng. Nhà con có muốn mua không?'], ['bo', 'Gia đình có thể góp vốn, nhưng con là người ra quyết định. Bố gợi ý: các tiệm nhỏ thường được mua với giá khoảng 3–4 lần lợi nhuận một năm.'], ['me', 'Mẹ thì khác: đừng chỉ nhìn bội số. Hãy kiểm tra xem tiền mặt thật sự đến từ đâu và có khoản chi nào sắp tới không.'], ['nar', 'Bố mẹ không đồng ý hoàn toàn với nhau. Bạn sẽ phải tự cân nhắc.']], terms: ['Valuation Multiple', 'Due Diligence'] },
      { type: 'investigate', id: 'c_bakery_dd', concept: 'due_diligence', picks: 2, q: 'Bạn chỉ có thời gian kiểm tra 2 việc trước buổi đàm phán (những gì bạn đã tự khám phá trong tiệm được tính miễn phí):', opts: [
        { t: 'Xem sổ sách doanh thu – chi phí', flag: 'saw_ledger', reveal: 'Mỗi tháng: doanh thu 60 triệu, nguyên liệu 24, lương 15, thuê 9, khác 3 (triệu đồng).' },
        { t: 'Kiểm tra lò nướng và thiết bị', flag: 'saw_oven', reveal: 'Lò nướng 14 năm tuổi, cần thay trong năm tới — khoảng 40 triệu đồng (capex).' },
        { t: 'Hỏi khách quen', flag: 'saw_customers', reveal: 'Khoảng 70% khách là khách quen; họ quý bánh và quý hai người thợ.' },
        { t: 'Hỏi giá thuê mặt bằng sắp tới', flag: 'saw_lease', reveal: 'Hợp đồng thuê còn 4 năm, giá cố định — rủi ro thấp.' },
      ] },
      { type: 'num', id: 'c_bakery_month', concept: 'profit', q: 'Từ sổ sách, lợi nhuận MỖI THÁNG là bao nhiêu triệu đồng?', a: BAKERY.monthly, tol: 0, unit: 'triệu đồng', data: [['Doanh thu', 60], ['Nguyên liệu', -24], ['Lương thợ', -15], ['Thuê mặt bằng', -9], ['Điện nước, khác', -3]],
        fb: { vi: '60 − 24 − 15 − 9 − 3 = 9 triệu/tháng.', en: 'Monthly operating profit = revenue − operating costs.', why: 'Trừ lần lượt từng khoản.', impl: 'Đây là cơ sở cho định giá.', related: 'Operating profit', review: 'The Bakery Acquisition' } },
      { type: 'num', id: 'c_bakery_year', concept: 'profit', q: 'Lợi nhuận một năm là bao nhiêu triệu đồng?', a: BAKERY.annual, tol: 0, unit: 'triệu đồng',
        fb: { vi: '9 × 12 = 108 triệu/năm.', en: 'Annualize: monthly × 12 (assumes stable months).', why: 'Cô Hạnh nói các tháng gần như nhau.', impl: 'Nếu có mùa vụ, cần dùng số liệu cả năm thực tế.', related: 'Seasonality, LTM', review: 'The Bakery Acquisition' } },
      { type: 'num', id: 'c_bakery_payback', concept: 'payback', q: 'Nếu trả đúng giá chào 500 triệu, bao nhiêu năm để lợi nhuận bù lại số tiền đó? (1 chữ số thập phân)', a: r1(F.payback(500, BAKERY.annual)), tol: 0.1, unit: 'năm', terms: ['Payback'],
        fb: { vi: `500 / 108 ≈ ${r1(F.payback(500, BAKERY.annual))} năm.`, en: 'Payback = price / annual profit. Ignores time value of money.', why: 'Chia giá cho lợi nhuận năm.', impl: 'Giá chào tương ứng ~4,6 lần lợi nhuận — cao hơn khoảng 3–4x mà Bố gợi ý.', related: 'Multiple = 1 / earnings yield', review: 'The Bakery Acquisition' } },
      { type: 'quiz', id: 'c_bakery_value', concept: 'valuation_multiple', q: 'Dùng bội số 3,5 lần lợi nhuận năm, giá trị hợp lý của tiệm (chưa tính lò nướng) là?', opts: ['108 triệu', `${BAKERY.fair} triệu`, '500 triệu', '540 triệu'], a: 1,
        fb: { vi: `3,5 × 108 = ${BAKERY.fair} triệu.`, en: 'Value = earnings × multiple.', why: 'Bội số giữa 3x và 4x.', impl: 'Giá chào 500 triệu cao hơn giá trị ước tính ~32%.', related: 'Valuation Multiple', review: 'The Bakery Acquisition' } },
      { type: 'quiz', id: 'c_bakery_adj', when: (rt, S) => rt.flags.saw_oven || S.tl.flags.saw_oven, concept: 'due_diligence', q: 'Bạn đã phát hiện lò nướng cần thay (40 triệu). Giá trị hợp lý sau điều chỉnh là?', opts: [`${BAKERY.fair} triệu`, `${BAKERY.adj} triệu`, `${BAKERY.fair + 40} triệu`], a: 1, terms: ['Capex'],
        fb: { vi: `${BAKERY.fair} − 40 = ${BAKERY.adj} triệu. Người mua sẽ phải bỏ tiền thay lò ngay sau khi mua.`, en: 'Deduct known near-term capex not reflected in historical profit.', why: 'Lợi nhuận quá khứ không phản ánh khoản đầu tư sắp tới.', impl: 'Đây chính là giá trị của Due Diligence.', related: 'Capex, Quality of Earnings', review: 'The Bakery Acquisition' } },
      { type: 'negotiate', id: 'c_bakery_neg', who: 'hanh', concept: 'negotiation', unit: 'triệu đồng', ask: 500, reservation: 355, min: 250, max: 550, step: 5, start: 330, rounds: 4, concession: 0.4, insult: 0.72, terms: ['BATNA', 'Reservation Value'],
        intro: 'Cô Hạnh rất thương hai người thợ. Bạn có thể đưa các điều khoản phi giá vào đề nghị.',
        batna: 'Nếu không mua, gia đình vẫn giữ tiền và có thể tìm cơ hội khác.',
        issues: [{ id: 'keep_staff', t: 'Cam kết giữ lại cả hai người thợ', v: 25 }, { id: 'installments', t: 'Trả góp trong 2 năm', v: -20 }, { id: 'recipes', t: 'Nhờ cô ở lại 3 tháng truyền công thức (có trả lương)', v: 5 }] },
      { type: 'outcome', id: 'c_bakery_out', eval: (rt, S) => {
        const n = rt.vars.c_bakery_neg || {};
        const knewOven = rt.flags.saw_oven || S.tl.flags.saw_oven;
        const V = BAKERY.adj;
        if (n.deal) {
          const p = n.price; const gap = V - p;
          const fx = { flags: { bakery_owned: true, bakery_price: p, bakery_staff: !!(n.issues || []).includes('keep_staff') }, items: ['decor_trophy_bakery'], ach: ['first_deal'] };
          let text = `Thương vụ hoàn tất ở ${p} triệu đồng. `;
          if (!knewOven) text += 'Hai tháng sau, lò nướng hỏng — bạn phải chi 40 triệu mà không lường trước. ';
          if (gap >= 0) { text += `Giá trị thực (sau khi trừ chi phí thay lò) khoảng ${V} triệu — bạn mua không đắt hơn giá trị. Kỷ luật về giá!`; fx.ach.push('disciplined_buyer'); fx.rep = 3; }
          else text += `Giá trị thực khoảng ${V} triệu — bạn đã trả cao hơn ${-gap} triệu. Thời gian hoàn vốn dài hơn. Bài học: giá là thứ bạn trả, giá trị là thứ bạn nhận.`;
          if ((n.issues || []).includes('keep_staff')) { text += ' Hai người thợ ở lại; khách quen tiếp tục quay lại.'; fx.rel = { hanh: { trust: 15 } }; }
          return { text, fx, score: gap >= 0 ? 1 : 0.4 };
        }
        const best = n.lastAsk ?? 500;
        if (best > V) return { text: `Bạn rời bàn đàm phán. Mức thấp nhất Cô Hạnh chịu là ${best} triệu — cao hơn giá trị thực ~${V} triệu. Từ chối là quyết định đúng. Cô Hạnh bán cho người khác, nhưng vẫn quý bạn.`, fx: { ach: ['walk_away'], flags: { bakery_owned: false }, rep: 2 }, score: 1 };
        return { text: `Bạn rời đi dù có thể mua dưới giá trị (${best} ≤ ${V}). Đôi khi quá cứng rắn cũng làm mất cơ hội tốt.`, fx: { flags: { bakery_owned: false } }, score: 0.5 };
      } },
    ],
    rewards: { xp: 60, rep: 2, credits: 30, items: ['outfit_bakery'], rel: { bo: { respect: 8 }, me: { respect: 8 } } },
  },

  // ======================= CHAPTER 2 — UNIVERSITY =======================
  {
    id: 'u_professor', title: 'Ba báo cáo tài chính', kind: 'main', chapter: 'uni', giver: 'bao', loc: 'campus', age: 19,
    summary: 'GS. Bảo kiểm tra khả năng đọc Income Statement và phân biệt Enterprise Value / Equity Value.',
    steps: [
      { type: 'say', lines: [['bao', 'Chào em. Thầy nghe nói hồi nhỏ em từng mua một tiệm bánh. Vậy hãy cho thầy thấy em đọc báo cáo tài chính thế nào.'], ['bao', 'Công ty Hoa Sen Foods, đơn vị tỷ đồng: Doanh thu 1.200; Giá vốn (COGS) 720; Chi phí hoạt động 240; Khấu hao D&A 60; Lãi vay 30; Thuế suất 20%.']], terms: ['Gross Profit', 'EBITDA', 'EBIT', 'Net Income'] },
      { type: 'num', id: 'u_is_gp', concept: 'income_statement', q: 'Gross Profit (Lợi nhuận gộp)?', a: IS.grossProfit, tol: 0, unit: 'tỷ đồng',
        fb: { vi: '1.200 − 720 = 480.', en: 'Gross Profit = Revenue − COGS.', why: 'Chỉ trừ giá vốn.', impl: 'Gross margin 40% cho thấy sức mạnh định giá và chi phí sản xuất.', related: 'Gross margin', review: 'Ba báo cáo tài chính' } },
      { type: 'num', id: 'u_is_ebitda', concept: 'income_statement', q: 'EBITDA?', a: IS.ebitda, tol: 0, unit: 'tỷ đồng', traps: [{ v: 180, why: 'Đó là EBIT — bạn đã trừ D&A. EBITDA đứng TRƯỚC khấu hao.' }],
        fb: { vi: '480 − 240 = 240.', en: 'EBITDA = Gross Profit − Operating expenses (excl. D&A).', why: 'Không trừ D&A, lãi vay, thuế.', impl: 'EBITDA là proxy dòng tiền hoạt động, dùng cho bội số EV/EBITDA.', related: 'EV/EBITDA', review: 'Ba báo cáo tài chính' } },
      { type: 'num', id: 'u_is_ni', concept: 'income_statement', q: 'Net Income (Lợi nhuận ròng)?', a: IS.netIncome, tol: 0, unit: 'tỷ đồng', traps: [{ v: 192, why: 'Bạn đã tính thuế trên EBITDA. Thuế tính trên EBT = EBIT − Lãi vay = 150.' }, { v: 144, why: 'Bạn quên trừ lãi vay trước khi tính thuế.' }],
        fb: { vi: 'EBIT = 240 − 60 = 180; EBT = 180 − 30 = 150; Thuế = 30; NI = 120.', en: 'Net Income = (EBIT − Interest) × (1 − tax).', why: 'Theo đúng thứ tự waterfall.', impl: 'NI là cơ sở cho EPS và P/E.', related: 'EPS, P/E', review: 'Ba báo cáo tài chính' } },
      { type: 'quiz', id: 'u_is_cash', concept: 'cash', q: 'Hoa Sen có Net Income 120 nhưng tiền mặt giảm 50. Giải thích hợp lý nhất?', opts: ['Kế toán sai', 'Công ty đầu tư capex lớn và hàng tồn kho/phải thu tăng (working capital)', 'Lợi nhuận ròng luôn bằng thay đổi tiền mặt', 'Do khấu hao làm giảm tiền'], a: 1,
        fb: { vi: 'Cash flow statement nối Net Income với tiền: cộng lại D&A (không chi tiền), trừ capex và tăng working capital.', en: 'Cash flow differs from net income due to non-cash items, capex and working capital.', why: 'D&A là chi phí không bằng tiền, nên không làm giảm tiền.', impl: 'Nhà đầu tư PE luôn hỏi "cash conversion" là bao nhiêu.', related: 'Cash Flow Statement, Working Capital', review: 'Ba báo cáo tài chính' }, err: { 3: 'Khấu hao là chi phí KHÔNG bằng tiền — nó được cộng lại trong báo cáo lưu chuyển tiền tệ.' } },
      { type: 'num', id: 'u_ev_eq', concept: 'ev_equity', q: 'Enterprise Value của một công ty là 1.000 tỷ, nợ vay 300 tỷ, tiền mặt 50 tỷ. Equity Value là?', a: 750, tol: 0, unit: 'tỷ đồng', terms: ['Enterprise Value', 'Equity Value', 'Net Debt'], traps: [{ v: 700, why: 'Bạn trừ nợ nhưng quên cộng lại tiền mặt (Net Debt = 300 − 50 = 250).' }, { v: 1250, why: 'Ngược chiều: Equity = EV − Net Debt, không phải cộng.' }],
        fb: { vi: 'Equity = EV − Net Debt = 1.000 − (300 − 50) = 750.', en: 'Equity Value = Enterprise Value − Net Debt.', why: 'EV thuộc về mọi nhà cung cấp vốn; cổ đông nhận phần sau khi trả nợ ròng.', impl: 'Nhầm EV với Equity là lỗi phỏng vấn kinh điển và lỗi định giá nghiêm trọng.', related: 'Bridge EV → Equity', review: 'Ba báo cáo tài chính' } },
    ],
    rewards: { xp: 40, rep: 2, items: ['decor_books'], rel: { bao: { respect: 10, trust: 5 } } },
  },
  {
    id: 'u_valuation', title: 'Bài định giá đầu tiên — DCF', kind: 'main', chapter: 'uni', giver: 'vy', loc: 'club', age: 20, req: ['u_professor'],
    summary: 'CLB Tài chính định giá một chuỗi bánh bằng Discounted Cash Flow.',
    steps: [
      { type: 'say', lines: [['vy', 'Chào thành viên mới! Bài tập tuần này: định giá chuỗi Bánh Mây Hồng bằng DCF.'], ['vy', 'Ta chiết khấu FCFF bằng WACC để ra Enterprise Value, rồi trừ Net Debt để ra Equity Value. Nhớ: FCFF đi với WACC, FCFE đi với cost of equity — không được trộn.']], terms: ['Discounted Cash Flow', 'FCFF', 'FCFE', 'WACC', 'Terminal Value'] },
      { type: 'say', when: (rt, S) => S.tl.flags.bakery_owned, lines: [['vy', 'Ơ, nghe nói tiệm Mây Hồng gốc là của nhà bạn à? Giờ nó thành chuỗi 12 cửa hàng rồi đấy!']] },
      { type: 'model', id: 'u_dcf_model', model: 'dcf', concept: 'dcf', goal: { text: 'Khám phá: tăng WACC 1% làm EV thay đổi bao nhiêu? Đưa về WACC 10% và g 2,5% để tiếp tục.', check: (o, v) => v.wacc === 10 && v.g === 2.5 } },
      { type: 'num', id: 'u_dcf_ev', concept: 'dcf', q: 'Với WACC 10% và g 2,5%, Enterprise Value là bao nhiêu tỷ đồng? (sai số ±1,5)', a: r1(DCF.ev), tol: 1.5, unit: 'tỷ đồng',
        fb: { vi: `PV 5 năm ≈ ${r1(DCF.sumPv)}; TV = 68 × 1,025 / (10% − 2,5%) ≈ ${r1(DCF.tv)}; PV(TV) ≈ ${r1(DCF.pvTv)}. EV ≈ ${r1(DCF.ev)}.`, en: 'EV = Σ FCFF/(1+WACC)^t + TV/(1+WACC)^N.', why: 'TV được chiết khấu về hiện tại với N = 5.', impl: 'Lỗi hay gặp: quên chiết khấu Terminal Value.', related: 'Gordon Growth', review: 'Bài định giá đầu tiên — DCF' } },
      { type: 'num', id: 'u_dcf_ps', concept: 'ev_equity', q: 'Giá trị mỗi cổ phiếu (nghìn đồng)? Net Debt 200 tỷ, 50 triệu cổ phiếu. (±0,1)', a: r2(DCF.perShare), tol: 0.1, unit: 'nghìn đồng/cp',
        traps: [{ v: r2(DCF.ev / 50), why: 'Bạn chia EV cho số cổ phiếu — phải trừ Net Debt trước.' }],
        fb: { vi: `(${r1(DCF.ev)} − 200) / 50 ≈ ${r2(DCF.perShare)}.`, en: 'Per-share value = (EV − Net Debt) / diluted shares.', why: 'Tỷ đồng / triệu cổ phiếu = nghìn đồng/cổ phiếu.', impl: 'Luôn kiểm tra đơn vị.', related: 'Diluted shares', review: 'Bài định giá đầu tiên — DCF' } },
      { type: 'quiz', id: 'u_dcf_tv', concept: 'dcf', q: `Terminal Value chiếm khoảng ${Math.round(DCF.tvShare * 100)}% EV. Điều này có nghĩa gì?`, opts: ['Mô hình chắc chắn sai', 'Định giá rất nhạy với giả định dài hạn (WACC, g) — cần sensitivity analysis', 'Dòng tiền 5 năm không quan trọng gì'], a: 1,
        fb: { vi: 'Với doanh nghiệp ổn định, TV thường chiếm 60–80% EV. Đó là lý do phải kiểm tra độ nhạy.', en: 'High TV share means valuation hinges on long-term assumptions.', why: 'Mỗi 0,5% WACC hoặc g thay đổi hàng chục tỷ.', impl: 'Luôn trình bày bảng sensitivity WACC × g.', related: 'Sensitivity Analysis', review: 'Bài định giá đầu tiên — DCF' } },
      { type: 'quiz', id: 'u_dcf_mix', concept: 'dcf', q: 'Một bạn chiết khấu FCFF bằng cost of equity (12%). Sai ở đâu?', opts: ['Không sai, càng thận trọng càng tốt', 'Không nhất quán: FCFF là dòng tiền cho cả chủ nợ và cổ đông nên phải chiết khấu bằng WACC', 'Phải dùng lãi suất ngân hàng'], a: 1,
        fb: { vi: 'Tỷ lệ chiết khấu phải khớp với dòng tiền: FCFF ↔ WACC → EV; FCFE ↔ Cost of Equity → Equity Value.', en: 'Discount rate must match the cash flow’s claimholders.', why: 'Sự nhất quán nội tại của mô hình.', impl: 'Trộn lẫn làm định giá sai có hệ thống.', related: 'FCFF, FCFE, WACC', review: 'Bài định giá đầu tiên — DCF' } },
    ],
    rewards: { xp: 50, rep: 3, items: ['outfit_club'], rel: { vy: { trust: 10, respect: 8 } } },
  },
  {
    id: 'u_network', title: 'Đêm Networking Tài chính', kind: 'network', chapter: 'uni', giver: null, loc: 'campus', obj: 'board', age: 20, req: ['u_professor'],
    summary: 'Sự kiện cựu sinh viên. Xây dựng quan hệ chân thành — không phải sưu tầm danh thiếp.',
    steps: [
      { type: 'say', lines: [['nar', 'Hội trường lung linh đèn vàng. Mai — Analyst năm 2 tại Lotus Capital — đang trò chuyện với một nhóm sinh viên.'], ['nar', '🎯 Mục tiêu: tạo ấn tượng chuyên nghiệp và một mối quan hệ có thể theo dõi tiếp.']] },
      { type: 'choice', id: 'u_net_1', q: 'Bạn tiếp cận nhóm thế nào?', opts: [
        { t: 'Chen vào và giới thiệu thành tích của mình ngay', out: 'Mọi người hơi khựng lại. Ấn tượng đầu không tốt.', v: { rapport: -1 } },
        { t: 'Đứng nghe, chờ ngắt quãng và nối vào chủ đề họ đang nói', out: 'Mai mỉm cười và mở lời với bạn.', v: { rapport: 2 } },
        { t: 'Đưa CV cho tất cả mọi người', out: 'Vài người nhận lấy, nhưng không ai nhớ tên bạn.', v: { rapport: 0 } },
      ] },
      { type: 'choice', id: 'u_net_2', q: 'Bạn hỏi Mai câu gì?', opts: [
        { t: '"Lương Analyst năm nhất là bao nhiêu ạ?"', out: 'Mai trả lời lịch sự nhưng ngắn gọn.', v: { rapport: -1 } },
        { t: '"Điều gì khác biệt nhất giữa mô hình ở trường và mô hình trong một deal thật?"', out: 'Mai hào hứng kể về chuyện kiểm tra số liệu lúc 2 giờ sáng. Hai người cười rất nhiều.', v: { rapport: 3 } },
        { t: '"Chị giới thiệu em vào ngân hàng được không?"', out: 'Mai: "Mình mới gặp nhau 2 phút thôi mà..."', v: { rapport: -2 } },
      ] },
      { type: 'choice', id: 'u_net_3', q: 'Mai nhắc đến một thương vụ healthcare gần đây. Bạn:', opts: [
        { t: 'Chia sẻ một quan sát cụ thể về payer mix trong ngành y tế bạn đọc tuần trước', out: 'Mai: "Ồ, em đọc kỹ đấy!"', v: { rapport: 2 } },
        { t: 'Gật đầu dù không biết gì', out: 'Câu chuyện trôi qua.', v: { rapport: 0 } },
        { t: 'Hỏi tên khách hàng trong thương vụ đó', out: 'Mai nghiêm mặt: "Cái đó chị không thể nói được."', v: { rapport: -2 } },
      ] },
      { type: 'choice', id: 'u_net_4', q: 'Ngày hôm sau, bạn follow-up thế nào?', opts: [
        { t: 'Email cảm ơn ngắn, nhắc lại một điều cụ thể Mai chia sẻ, và một câu hỏi nhỏ', out: 'Mai trả lời trong 1 giờ và hẹn cà phê.', v: { rapport: 3 } },
        { t: 'Kết nối LinkedIn không kèm lời nhắn', out: 'Mai chấp nhận kết nối. Thế thôi.', v: { rapport: 0 } },
        { t: 'Không follow-up', out: 'Cơ hội trôi qua.', v: { rapport: -1 } },
      ] },
      { type: 'outcome', id: 'u_net_out', eval: (rt) => {
        const r = rt.vars.rapport || 0;
        if (r >= 8) return { text: `Rapport: ${r}/10. Mai đề nghị giới thiệu bạn cho vòng phỏng vấn thực tập tại Lotus Capital — vì bạn đã tạo ra giá trị trong cuộc trò chuyện, không phải vì bạn xin.`, fx: { flags: { mai_referral: true }, ach: ['networker'], rel: { mai: { trust: 15, respect: 10 } }, rep: 2 }, score: 1 };
        if (r >= 4) return { text: `Rapport: ${r}/10. Mai nhớ bạn và sẵn sàng trả lời câu hỏi. Một mối quan hệ tốt đã bắt đầu.`, fx: { rel: { mai: { trust: 8 } } }, score: 0.7 };
        return { text: `Rapport: ${r}/10. Bạn có danh thiếp, nhưng chưa có mối quan hệ. Networking hiệu quả là hỏi câu hay và tạo giá trị.`, fx: { rel: { mai: { trust: 1 } } }, score: 0.3 };
      } },
    ],
    rewards: { xp: 30, rep: 1 },
  },
  {
    id: 'u_rival', title: 'Cuộc thi Investment Thesis', kind: 'main', chapter: 'uni', giver: 'khoa', loc: 'campus', age: 21, req: ['u_valuation'],
    summary: 'Thi đấu cùng (và chống lại) Khoa. Xây dựng và bảo vệ luận điểm đầu tư đầu tiên.',
    steps: [
      { type: 'say', lines: [['khoa', 'Cuộc thi năm nay: đề xuất đầu tư vào "Mây Tea" — chuỗi trà sữa — hoặc "LearnUp" — phần mềm quản lý trường học theo thuê bao. Ta cùng đội nhé, nhưng tớ sẽ thuyết trình.']] },
      { type: 'quiz', id: 'u_th_model', concept: 'business_model', q: 'LearnUp bán phần mềm thuê bao theo năm cho trường học, tỷ lệ gia hạn 95%. Lợi thế lớn nhất của mô hình này?', opts: ['Doanh thu một lần lớn', 'Doanh thu định kỳ (recurring) dễ dự báo và chi phí chuyển đổi (switching cost) cao', 'Không cần nhân viên bán hàng'], a: 1,
        fb: { vi: 'Recurring revenue + switching cost cao (trường phải chuyển dữ liệu, đào tạo lại) tạo ra dòng tiền ổn định.', en: 'Recurring revenue and high switching costs drive predictability and pricing power.', why: 'Tỷ lệ gia hạn 95% là bằng chứng.', impl: 'Nhà đầu tư trả bội số cao hơn cho doanh thu định kỳ chất lượng.', related: 'Retention, Moat', review: 'Cuộc thi Investment Thesis' } },
      { type: 'quiz', id: 'u_th_moat', concept: 'competitive_advantage', q: 'Mây Tea tăng trưởng nhanh nhờ khuyến mãi. Rủi ro lớn nhất cho luận điểm đầu tư?', opts: ['Rào cản gia nhập thấp — đối thủ dễ sao chép, khách hàng ít trung thành', 'Trà sữa không bao giờ hết mốt', 'Không có rủi ro'], a: 0,
        fb: { vi: 'Tăng trưởng nhờ khuyến mãi không phải lợi thế cạnh tranh bền vững.', en: 'Low barriers to entry erode returns; promotion-driven growth may not persist.', why: 'Hỏi: điều gì ngăn đối thủ làm y hệt?', impl: 'Luận điểm phải dựa trên lợi thế bền vững.', related: 'Barriers to Entry, Five Forces', review: 'Cuộc thi Investment Thesis' } },
      { type: 'choice', id: 'u_th_ethic', q: 'Đêm trước vòng chung kết, Khoa tìm thấy slide của đội khác trong thư mục chia sẻ và muốn dùng. Bạn:', opts: [
        { t: 'Từ chối, đề nghị báo ban tổ chức về lỗi thư mục, và cùng Khoa tự cải thiện slide', out: 'Khoa cáu một lúc, rồi thừa nhận bạn đúng. Ban tổ chức cảm ơn đội bạn.', fx: { stats: { ethics: 10 }, rel: { khoa: { respect: 10 } }, flags: { integrity_uni: true }, ach: ['integrity'] } },
        { t: 'Dùng một phần, vì "ai cũng làm thế"', out: 'Đội khác nhận ra slide của họ. Đội bạn bị loại và GS. Bảo rất thất vọng.', fx: { stats: { ethics: -15 }, rep: -3, rel: { bao: { trust: -15 }, khoa: { trust: 5 } }, flags: { cheated_uni: true } } },
        { t: 'Không nói gì, để Khoa tự quyết', out: 'Khoa dùng slide. Đội bị cảnh cáo. Bạn nhận ra im lặng cũng là một lựa chọn.', fx: { stats: { ethics: -5 }, rel: { khoa: { trust: -5 } } } },
      ] },
      { type: 'quiz', id: 'u_th_defend', concept: 'thesis', q: 'Giám khảo (GS. Bảo) hỏi: "Điều gì sẽ khiến luận điểm đầu tư LearnUp của em sai?" Câu trả lời tốt nhất?', opts: ['"Không có gì, luận điểm rất chắc chắn."', '"Nếu tỷ lệ gia hạn giảm dưới 85% hoặc chi tiêu ngân sách giáo dục bị cắt — em sẽ theo dõi hai chỉ số đó."', '"Nếu thị trường chứng khoán giảm."'], a: 1,
        fb: { vi: 'Một luận điểm tốt nêu rõ điều kiện bị bác bỏ và chỉ số cần theo dõi.', en: 'Strong theses state falsifiable risks and the KPIs that monitor them.', why: 'Thể hiện tư duy downside.', impl: 'Investment Committee luôn hỏi câu này.', related: 'Downside case, Key risks', review: 'Cuộc thi Investment Thesis' } },
      { type: 'outcome', id: 'u_th_out', eval: (rt, S, sc) => {
        if (rt.flags.cheated_uni) return { text: 'Đội bị loại. Một bài học đắt giá về uy tín.', fx: {}, score: sc };
        return sc >= 0.67 ? { text: 'Đội bạn giành giải Nhất! Khoa thừa nhận: "Phần Q&A của cậu quyết định chiến thắng."', fx: { rep: 3, rel: { khoa: { respect: 8 } }, items: ['decor_plant'] }, score: sc } : { text: 'Đội bạn vào chung kết nhưng chưa giành giải. GS. Bảo khuyên ôn lại lợi thế cạnh tranh.', fx: { rep: 1 }, score: sc };
      } },
    ],
    rewards: { xp: 45, rep: 1, rel: { khoa: { trust: 5 } } },
  },

  // ======================= CHAPTER 3 — INTERNSHIP =======================
  {
    id: 'i_day1', title: 'Ngày đầu ở Tầng 23', kind: 'main', chapter: 'intern', giver: 'victor', loc: 'ibank', age: 21,
    summary: 'Gặp MD Victor Lâm — người quản lý khó tính nhất. Nhận yêu cầu đầu tiên.',
    steps: [
      { type: 'say', lines: [['victor', 'Cô là thực tập sinh mới? Tốt. Tôi cần profile công ty Sakura Tea cho cuộc gọi với khách hàng. Gấp.'], ['nar', 'Ông quay đi trước khi bạn kịp hỏi gì.']] },
      { type: 'say', when: (rt, S) => S.tl.flags.mai_referral, lines: [['mai', 'Này, chị là người giới thiệu em đấy. Mẹo: hỏi anh Victor 2 câu thật ngắn — deadline và mục đích sử dụng.']] },
      { type: 'choice', id: 'i_d1_clarify', q: 'Bạn làm gì?', grade: true, best: [1], opts: [
        { t: 'Bắt tay làm ngay, tự đoán phạm vi', out: 'Bạn làm 4 tiếng một profile 10 trang. Victor chỉ cần 1 trang. Ông thở dài.', fx: { rel: { victor: { respect: -3 } } } },
        { t: 'Đuổi theo, hỏi ngắn gọn: "Anh cần lúc mấy giờ, và dùng cho mục đích gì — 1 trang tóm tắt hay chi tiết?"', out: 'Victor dừng lại: "3 giờ chiều, 1 trang, tập trung vào tài chính và cổ đông." Ông gật đầu nhẹ.', fx: { rel: { victor: { respect: 6 } } } },
        { t: 'Gửi email 8 câu hỏi chi tiết', out: 'Victor trả lời: "Tự suy nghĩ đi." Bạn mất 1 tiếng chờ đợi.', fx: { rel: { victor: { respect: -2 } } } },
      ] },
      { type: 'sort', id: 'i_d1_profile', concept: 'company_profile', q: 'Chọn nội dung cho one-page company profile:', cats: ['Nên có', 'Không cần'],
        items: [['Mô tả hoạt động kinh doanh & sản phẩm', 0], ['Tóm tắt tài chính 3 năm (Revenue, EBITDA, margin)', 0], ['Cơ cấu cổ đông', 0], ['Thực đơn đầy đủ 120 món', 1], ['Ban lãnh đạo chủ chốt', 0], ['Ảnh chụp văn phòng', 1]],
        fb: { vi: 'Profile 1 trang phải trả lời: công ty làm gì, quy mô và hiệu quả tài chính, ai sở hữu, ai điều hành.', en: 'A company profile summarizes business, financials, ownership and management.', why: 'MD cần chuẩn bị cho cuộc gọi, không cần chi tiết vận hành.', impl: 'Biết lược bỏ là một kỹ năng của Analyst giỏi.', related: 'Pitchbook', review: 'Ngày đầu ở Tầng 23' } },
    ],
    rewards: { xp: 30, items: ['outfit_analyst'], rel: { mai: { trust: 3 } } },
  },
  {
    id: 'i_model', title: 'Gỡ lỗi mô hình lúc nửa đêm', kind: 'deal', chapter: 'intern', giver: 'mai', loc: 'ibank', age: 21, req: ['i_day1'],
    summary: 'Một mô hình tài chính có lỗi. Tìm chúng trước khi gửi khách hàng.',
    steps: [
      { type: 'say', lines: [['mai', 'Mô hình này Đức làm vội. Có đúng 3 lỗi công thức. Em tìm giúp chị trước khi file đi khách hàng nhé.']] },
      { type: 'debug', id: 'i_debug', concept: 'model_integrity', q: 'Chạm vào các dòng có công thức SAI (đơn vị: tỷ đồng, thuế 25%):', rows: [
        { l: 'Revenue', f: 'Input', v: '500' },
        { l: 'COGS', f: 'Input', v: '(300)' },
        { l: 'Gross Profit', f: '= Revenue − COGS', v: '200' },
        { l: 'Opex', f: 'Input', v: '(80)' },
        { l: 'EBITDA', f: '= Gross Profit − Opex', v: '120' },
        { l: 'D&A', f: 'Input', v: '(20)' },
        { l: 'EBIT', f: '= EBITDA + D&A', v: '140', bad: true, why: 'D&A phải được TRỪ: EBIT = 120 − 20 = 100.' },
        { l: 'Interest', f: 'Input', v: '(10)' },
        { l: 'Tax', f: '= 25% × EBITDA', v: '(30)', bad: true, why: 'Thuế tính trên EBT (EBIT − Interest), không phải EBITDA.' },
        { l: 'Net Income', f: '= EBT − Tax', v: '…' },
        { l: 'Cash Flow', f: '= NI + D&A − Capex + ΔNWC', v: '…', bad: true, why: 'Tăng working capital là dùng tiền → phải TRỪ ΔNWC.' },
        { l: 'Balance check', f: '= Assets − Liabilities − Equity', v: '0' },
      ],
        fb: { vi: 'Ba lỗi kinh điển: dấu của D&A, cơ sở tính thuế, dấu của ΔNWC.', en: 'Common errors: sign conventions and incorrect tax base.', why: 'Đi theo từng dòng, kiểm tra cả công thức lẫn dấu.', impl: 'Một lỗi dấu có thể làm sai định giá hàng trăm tỷ — và mất khách hàng.', related: 'Model integrity checks', review: 'Gỡ lỗi mô hình' } },
      { type: 'quiz', id: 'i_m_conv', concept: 'model_integrity', q: 'Quy ước định dạng chuẩn trong mô hình ngân hàng đầu tư?', opts: ['Màu chữ xanh dương = input cứng; đen = công thức; không gõ số cứng vào công thức', 'Tô màu ngẫu nhiên cho đẹp', 'Mọi ô đều là số cứng để dễ sửa'], a: 0,
        fb: { vi: 'Quy ước màu giúp người khác kiểm tra mô hình nhanh và tránh "hardcode".', en: 'Blue = hard-coded inputs, black = formulas. Never hardcode inside formulas.', why: 'Tính minh bạch và khả năng audit.', impl: 'Mô hình là sản phẩm làm việc nhóm.', related: 'Model integrity', review: 'Gỡ lỗi mô hình' } },
    ],
    rewards: { xp: 40, rep: 2, rel: { mai: { respect: 8, trust: 5 } } },
  },
  {
    id: 'i_comps', title: 'Deal đầu tiên: Trading Comps cho Sakura Tea', kind: 'deal', chapter: 'intern', giver: 'victor', loc: 'ibank', age: 21, req: ['i_model'],
    summary: 'Sakura Tea cân nhắc bán mình. Định giá bằng Trading Comps.',
    steps: [
      { type: 'say', lines: [['victor', 'Sakura Tea có thể thuê chúng ta bán công ty. Tôi cần một khoảng định giá dựa trên Trading Comps. EBITDA của Sakura: 80 tỷ. Net Debt: 130 tỷ.']], terms: ['Trading Comps', 'Precedent Transactions'] },
      { type: 'doc', title: 'Bảng peers (tỷ đồng)', table: { head: ['Công ty', 'EV', 'EBITDA', 'EV/EBITDA'], rows: [['Peer A', 1200, 100, '?'], ['Peer B', 900, 100, '?'], ['Peer C', 1650, 150, '?'], ['Peer D', 700, 70, '?'], ['Peer E', 2600, 200, '?']] } },
      { type: 'num', id: 'i_c_med', concept: 'comps', q: 'Median EV/EBITDA của 5 peers là bao nhiêu (x)?', a: COMPS.median, tol: 0.01, unit: 'x', traps: [{ v: r1(COMPS.mean), why: 'Đó là trung bình (mean). Đề yêu cầu median — ít bị ảnh hưởng bởi giá trị ngoại lai.' }],
        fb: { vi: 'Bội số: 12x, 9x, 11x, 10x, 13x → sắp xếp 9, 10, 11, 12, 13 → median 11x.', en: 'Median multiple is robust to outliers.', why: 'EV ÷ EBITDA từng peer, rồi lấy giá trị giữa.', impl: 'Thực tế còn phải điều chỉnh khác biệt tăng trưởng và biên lợi nhuận.', related: 'Mean vs Median', review: 'Trading Comps' } },
      { type: 'num', id: 'i_c_ev', concept: 'comps', q: 'Implied Enterprise Value của Sakura Tea (tỷ đồng)?', a: COMPS.impliedEv, tol: 0.5, unit: 'tỷ đồng',
        fb: { vi: '11 × 80 = 880 tỷ.', en: 'Implied EV = peer multiple × target metric.', why: 'Áp bội số EV/EBITDA lên EBITDA mục tiêu.', impl: 'EV/EBITDA cho EV — không phải Equity.', related: 'EV/EBITDA', review: 'Trading Comps' } },
      { type: 'num', id: 'i_c_eq', concept: 'ev_equity', q: 'Implied Equity Value (tỷ đồng)?', a: COMPS.impliedEquity, tol: 0.5, unit: 'tỷ đồng', traps: [{ v: 1010, why: 'Bạn đã CỘNG Net Debt. Equity = EV − Net Debt.' }],
        fb: { vi: '880 − 130 = 750 tỷ.', en: 'Equity Value = EV − Net Debt.', why: 'Bridge từ EV sang Equity.', impl: 'Khách hàng (cổ đông) quan tâm đến Equity Value họ nhận được.', related: 'EV bridge', review: 'Trading Comps' } },
      { type: 'quiz', id: 'i_c_prec', concept: 'comps', q: 'Vì sao Precedent Transactions thường cho bội số CAO hơn Trading Comps?', opts: ['Vì thị trường luôn tăng', 'Vì giá mua lại bao gồm control premium — bên mua trả thêm để nắm quyền kiểm soát và synergies', 'Vì kế toán khác nhau'], a: 1,
        fb: { vi: 'Trading Comps phản ánh giá cổ phiếu thiểu số; thương vụ M&A trả thêm phần bù kiểm soát.', en: 'Precedents embed a control premium over minority trading prices.', why: 'Quyền kiểm soát có giá trị.', impl: 'Football field thường cho thấy precedents ở dải cao hơn.', related: 'Control premium, Football field', review: 'Trading Comps' } },
    ],
    rewards: { xp: 50, rep: 3, credits: 20, items: ['decor_tombstone'], rel: { victor: { respect: 6 } } },
  },
  {
    id: 'i_deadline', title: 'Hạn chót bất khả thi', kind: 'politics', chapter: 'intern', giver: 'victor', loc: 'ibank', age: 21, req: ['i_comps'],
    summary: '22:00. Victor muốn một mô hình định giá đầy đủ trước 8 giờ sáng.',
    steps: [
      { type: 'say', lines: [['victor', 'Khách hàng muốn họp sớm. Tôi cần DCF đầy đủ, comps, precedents và sensitivity — trước 8 giờ sáng mai.'], ['nar', 'Bây giờ là 22:00. Một mô hình đầy đủ cần ít nhất 14 giờ.']] },
      { type: 'choice', id: 'i_dl_choice', q: 'Bạn phản hồi thế nào?', grade: true, best: [1], opts: [
        { t: 'Nhận hết, thức trắng đêm, không nói gì', out: '6:00 sáng, bạn gửi file. Có một lỗi trong bảng sensitivity — Victor phát hiện ngay trước khách hàng.', fx: { rel: { victor: { respect: -5 } }, stats: { wellbeing: -15 }, flags: { dl_allnighter: true } } },
        { t: 'Đề xuất ưu tiên: 8h gửi comps + DCF cốt lõi đã kiểm tra kỹ, kèm danh sách giả định; precedents & sensitivity trước 12h trưa', out: 'Victor im lặng 3 giây. "Được. Nhưng phần DCF phải hoàn hảo." Buổi họp diễn ra suôn sẻ.', fx: { rel: { victor: { respect: 10, trust: 6 } }, flags: { dl_prioritized: true } } },
        { t: '"Không thể làm được ạ."', out: 'Victor: "Vậy tôi sẽ tìm người làm được." Ông giao việc cho Đức.', fx: { rel: { victor: { respect: -8 } } } },
        { t: 'Nhờ Đức làm một nửa', out: 'Đức đồng ý ngay... quá nhanh. Bạn sẽ hiểu vì sao.', fx: { flags: { duc_helped: true }, rel: { duc: { trust: 3 } } } },
      ] },
      { type: 'quiz', id: 'i_dl_principle', concept: 'workload', q: 'Nguyên tắc quan trọng nhất khi nhận một deadline không khả thi?', opts: ['Luôn nói "có" để thể hiện cam kết', 'Làm rõ ưu tiên, đề xuất phạm vi khả thi với chất lượng đảm bảo, và giao tiếp sớm', 'Từ chối mọi yêu cầu ngoài giờ'], a: 1,
        fb: { vi: 'Quản lý kỳ vọng sớm tốt hơn thất bại muộn. Chất lượng không được hy sinh.', en: 'Manage scope and expectations early; never compromise accuracy silently.', why: 'Một con số sai trước khách hàng tệ hơn một phần việc giao trễ có báo trước.', impl: 'Đây là kỹ năng được đánh giá trong mọi performance review.', related: 'Prioritization, Stakeholder management', review: 'Hạn chót bất khả thi' } },
    ],
    rewards: { xp: 30, rep: 1 },
  },
  {
    id: 'i_credit', title: 'Ai làm mô hình này?', kind: 'politics', chapter: 'intern', giver: 'duc', loc: 'ibank', age: 21, req: ['i_comps'],
    summary: 'Trong buổi họp, Đức trình bày mô hình comps của bạn như thể của anh ta.',
    steps: [
      { type: 'say', lines: [['nar', 'Phòng họp. Đức trình bày bảng Trading Comps — chính bảng bạn làm đến 2 giờ sáng.'], ['duc', '"...và tôi đã chọn median thay vì mean để loại bỏ ảnh hưởng của outlier."'], ['victor', 'Tốt lắm, Đức.']] },
      { type: 'choice', id: 'i_cr_choice', q: 'Bạn phản ứng thế nào?', grade: true, best: [0, 2], opts: [
        { t: 'Sau buổi họp, nói riêng với Đức một cách bình tĩnh, đề nghị lần sau ghi rõ phân công trong email gửi Victor', out: 'Đức hơi ngượng: "Anh xin lỗi, áp lực quá." Từ đó anh ghi rõ tên bạn trong email.', fx: { rel: { duc: { respect: 10, trust: 5 }, victor: { respect: 2 } }, flags: { credit_private: true } } },
        { t: 'Ngắt lời ngay trong họp: "Thật ra em làm bảng đó."', out: 'Không khí căng thẳng. Victor không thích kịch tính trước khách hàng.', fx: { rel: { duc: { trust: -15 }, victor: { respect: -4 } } } },
        { t: 'Tham khảo Mai, sau đó gửi Victor email tóm tắt công việc kèm file có lịch sử chỉnh sửa', out: 'Victor trả lời ngắn: "Đã ghi nhận. Làm tốt." Đức biết chuyện và giữ khoảng cách.', fx: { rel: { victor: { respect: 8 }, mai: { trust: 5 }, duc: { trust: -5 } }, flags: { credit_escalated: true } } },
        { t: 'Bỏ qua, tập trung vào việc tiếp theo', out: 'Không ai biết bạn làm. Lần sau Đức lại làm vậy.', fx: { rel: { duc: { respect: -5 } }, stats: { wellbeing: -5 } } },
      ] },
      { type: 'quiz', id: 'i_cr_principle', concept: 'influence', q: 'Cách bảo vệ đóng góp của mình hiệu quả và chuyên nghiệp nhất về lâu dài?', opts: ['Công khai chỉ trích đồng nghiệp', 'Tạo dấu vết minh bạch (email tóm tắt, phân công rõ) và giải quyết trực tiếp, riêng tư trước khi leo thang', 'Không bao giờ chia sẻ file với ai'], a: 1,
        fb: { vi: 'Minh bạch quy trình bảo vệ bạn mà không phá vỡ quan hệ.', en: 'Create transparent work records and address issues privately before escalating.', why: 'Leo thang có bằng chứng chỉ khi cần thiết.', impl: 'Uy tín dài hạn đến từ việc vừa giỏi vừa dễ hợp tác.', related: 'Constructive influence', review: 'Ai làm mô hình này?' } },
    ],
    rewards: { xp: 30, rep: 1 },
  },
  {
    id: 'i_mnpi', title: 'Một tin nhắn từ Khoa', kind: 'politics', chapter: 'intern', giver: 'khoa', loc: 'district', age: 21, req: ['i_comps'], optional: true,
    summary: 'Khoa hỏi: "Sakura Tea sắp bị bán à? Tớ định mua cổ phiếu."',
    steps: [
      { type: 'say', lines: [['khoa', 'Nghe đồn ngân hàng cậu đang làm cho Sakura Tea. Có thật không? Tớ định mua ít cổ phiếu — gợi ý chút thôi!']], terms: ['Material Nonpublic Information'] },
      { type: 'choice', id: 'i_mnpi_choice', q: 'Bạn trả lời:', grade: true, best: [0], opts: [
        { t: '"Tớ không thể bàn về bất kỳ khách hàng nào. Và cậu đừng giao dịch dựa trên tin đồn." — sau đó báo Compliance về câu hỏi này', out: 'Khoa hơi phật ý nhưng hiểu. Compliance cảm ơn bạn. Uy tín đạo đức của bạn tăng.', fx: { stats: { ethics: 15 }, rel: { khoa: { respect: 5 } }, flags: { mnpi_clean: true }, ach: ['integrity'] } },
        { t: 'Gợi ý mơ hồ: "Tớ không nói được, nhưng... cậu tự hiểu nhé."', out: 'Hai tuần sau, Compliance phát hiện giao dịch bất thường của Khoa. Bạn bị điều tra nội bộ.', fx: { stats: { ethics: -30 }, rep: -8, flags: { compliance_breach: true }, rel: { victor: { trust: -20 } } } },
        { t: 'Lờ tin nhắn', out: 'Khoa không hỏi lại. Nhưng bạn đã bỏ lỡ cơ hội báo Compliance theo quy định.', fx: { stats: { ethics: 0 } } },
      ] },
      { type: 'quiz', id: 'i_mnpi_q', concept: 'compliance', q: 'Thông tin rằng một công ty niêm yết đang thuê ngân hàng để bán mình là gì?', opts: ['Tin đồn vô hại', 'Material Nonpublic Information — tiết lộ hay giao dịch dựa trên nó là vi phạm pháp luật', 'Thông tin marketing'], a: 1,
        fb: { vi: 'MNPI có thể ảnh hưởng giá cổ phiếu. Ngân hàng có "information barriers" để ngăn rò rỉ.', en: 'Deal information is MNPI; tipping or trading on it is illegal insider dealing.', why: 'Thông tin trọng yếu + chưa công bố.', impl: 'Vi phạm có thể chấm dứt sự nghiệp và dẫn đến trách nhiệm hình sự.', related: 'Information barriers, Compliance', review: 'Một tin nhắn từ Khoa' } },
    ],
    rewards: { xp: 25 },
  },
  {
    id: 'i_review', title: 'Đánh giá cuối kỳ thực tập', kind: 'main', chapter: 'intern', giver: 'victor', loc: 'ibank', age: 22, req: ['i_comps', 'i_deadline', 'i_credit'],
    summary: 'Kết quả thực tập quyết định bạn bước vào sự nghiệp với lợi thế nào.',
    steps: [
      { type: 'say', lines: [['victor', 'Ngồi đi. Hãy nói về mười tuần vừa qua.']] },
      { type: 'outcome', id: 'i_rev_out', eval: (rt, S) => {
        const tl = S.tl; const qd = tl.questsDone;
        const tech = ['i_model', 'i_comps'].map((q) => qd[q]?.score ?? 0);
        const avg = (tech[0] + tech[1]) / 2;
        const vr = tl.rel.victor?.respect ?? 0;
        if (tl.flags.compliance_breach) return { text: 'Victor: "Năng lực của cô không phải vấn đề. Vấn đề là sự tin cậy. Chúng tôi không thể đưa ra offer." — Bạn sẽ phải tự chứng minh qua phỏng vấn ở nơi khác.', fx: { flags: { no_offer: true } }, score: 0.2 };
        if (avg >= 0.75 && vr >= 8) return { text: `Victor: "Mô hình của cô chính xác (${Math.round(avg * 100)}%), và cô biết quản lý kỳ vọng. Chúng tôi đưa ra return offer." — Đây là điều bạn tự giành được, không phải nhờ bố mẹ.`, fx: { flags: { return_offer: true }, rep: 4, rel: { victor: { trust: 10 } } }, score: 1 };
        if (avg >= 0.5) return { text: `Victor: "Kỹ thuật ổn (${Math.round(avg * 100)}%), nhưng tôi chưa đủ tin tưởng để đưa offer ngay." — Bạn vẫn có thể ứng tuyển, nhưng phải qua vòng phỏng vấn kỹ thuật.`, fx: { flags: { no_offer: true } }, score: 0.6 };
        return { text: 'Victor: "Cô cần củng cố kỹ thuật." — Không có offer. Bạn sẽ phải vượt qua phỏng vấn kỹ thuật ở con đường mình chọn.', fx: { flags: { no_offer: true } }, score: 0.3 };
      } },
      { type: 'say', lines: [['bo', 'Dù kết quả thế nào, bố tự hào vì con tự đi con đường của mình.'], ['me', 'Giờ là lúc chọn: con muốn làm nghề gì?']] },
    ],
    rewards: { xp: 40, ach: ['graduate'] },
  },

  // ======================= CHAPTER 4 — CAREER PREVIEWS =======================
  {
    id: 'k_ib_mandate', title: 'Sell-side: Lotus Healthcare', kind: 'career', chapter: 'career', career: 'ib', giver: 'victor', loc: 'ibank', age: 22,
    summary: 'Tư vấn bán chuỗi phòng khám Lotus Healthcare: buyer list, đánh giá bid theo độ chắc chắn, đàm phán.',
    steps: [
      { type: 'quiz', id: 'k_iv_ib', when: (rt, S) => S.tl.flags.no_offer, concept: 'dcf', q: '🎤 Phỏng vấn kỹ thuật: "Walk me through a DCF." Câu trả lời đúng cấu trúc nhất?', opts: ['Dự phóng FCFF → tính WACC → chiết khấu FCFF và Terminal Value → ra EV → trừ Net Debt → Equity Value / cổ phiếu', 'Lấy P/E nhân lợi nhuận', 'Chiết khấu doanh thu bằng lãi suất ngân hàng'], a: 0,
        fb: { vi: 'Cấu trúc chuẩn: dòng tiền → tỷ lệ chiết khấu → TV → EV → Equity.', en: 'Project FCFF, discount at WACC with a terminal value, bridge EV to equity.', why: 'Câu hỏi phỏng vấn phổ biến nhất.', impl: 'Không có offer thực tập nghĩa là bạn phải chứng minh lại năng lực.', related: 'DCF', review: 'Bài định giá đầu tiên — DCF' } },
      { type: 'say', lines: [['victor', 'Lotus Healthcare — 18 phòng khám — muốn bán 100% cổ phần. Chúng ta là sell-side advisor. Việc đầu tiên: buyer list.']] },
      { type: 'say', when: (rt, S) => isSpecialist(S.tl, 'healthcare'), lines: [['nar', '🩺 Chuyên môn Healthcare: bạn hỏi ngay CEO về payer mix và hợp đồng của 5 bác sĩ chủ chốt. Victor nhướng mày: "Cô hiểu ngành này." (+Industry credibility khi hoàn thành)']] },
      { type: 'sort', id: 'k_ib_buyers', concept: 'buyer_list', q: 'Phân loại người mua tiềm năng:', cats: ['Strategic buyer', 'Financial sponsor', 'Không phù hợp'],
        items: [['Chuỗi bệnh viện quốc tế muốn mở rộng vào Việt Nam', 0], ['Quỹ PE chuyên đầu tư healthcare', 1], ['Tập đoàn bảo hiểm muốn tích hợp dọc (vertical integration)', 0], ['Quỹ PE có danh mục chuỗi phòng khám nha khoa (platform)', 1], ['Công ty bất động sản không có kinh nghiệm y tế', 2], ['Quỹ crypto muốn "đa dạng hoá"', 2]],
        fb: { vi: 'Strategic buyer có synergy vận hành; financial sponsor mua để tạo giá trị và exit; người mua không phù hợp làm lộ thông tin và lãng phí thời gian.', en: 'Strategics seek operating synergies; sponsors seek returns; poor-fit buyers add leakage risk.', why: 'Mỗi nhóm có động lực và khả năng trả giá khác nhau.', impl: 'Buyer list tốt tạo cạnh tranh thực sự trong auction.', related: 'Auction process', review: 'Sell-side: Lotus Healthcare' } },
      { type: 'quiz', id: 'k_ib_kpi', concept: 'healthcare', q: 'Người mua hỏi về chất lượng EBITDA của Lotus. KPI ngành y tế nào quan trọng nhất cần chuẩn bị?', opts: ['Số lượng logo trên website', 'Payer mix (tỷ trọng bảo hiểm vs tự chi trả), tỷ lệ giữ chân bác sĩ, lượt khám/phòng khám', 'Màu sơn phòng khám'], a: 1,
        fb: { vi: 'Doanh thu y tế phụ thuộc vào ai trả tiền và bác sĩ có ở lại không. (Học sâu hơn ở Học viện Y tế.)', en: 'Payer mix, physician retention and patient volumes drive healthcare EBITDA quality.', why: 'Rủi ro tập trung bác sĩ và thay đổi chính sách hoàn trả.', impl: 'Data room phải có dữ liệu này.', related: 'Healthcare Academy', review: 'Sell-side: Lotus Healthcare' } },
      { type: 'doc', title: 'Vòng bid cuối (tỷ đồng, Equity Value)', table: { head: ['Bên mua', 'Giá', 'Điều kiện', 'Xác suất hoàn tất'], rows: [['A — Bệnh viện quốc tế', 520, 'Cần phê duyệt cạnh tranh, kéo dài 9 tháng', '55%'], ['B — Quỹ PE healthcare', 495, 'Tài chính đã cam kết (committed financing)', '95%'], ['C — Tập đoàn bảo hiểm', 505, 'Phụ thuộc vào việc huy động vốn', '70%']] }, body: 'Nếu thương vụ đổ vỡ, giá trị khách hàng có thể đạt được khi bán lại ước tính 450 tỷ (Simulation Assumption).' },
      { type: 'num', id: 'k_ib_ev', concept: 'deal_certainty', q: 'Giá trị kỳ vọng đã điều chỉnh rủi ro của bid A (tỷ đồng)?', a: BIDS.A, tol: 0.5, unit: 'tỷ đồng', terms: ['Deal Certainty'], traps: [{ v: 286, why: 'Bạn chỉ tính 520 × 55% mà quên kịch bản thất bại (45% × 450).' }],
        fb: { vi: `520 × 55% + 450 × 45% = ${BIDS.A}. Tương tự: B = ${BIDS.B}; C = ${BIDS.C}.`, en: 'Risk-adjusted value = P(close) × bid + P(fail) × fallback value.', why: 'Giá trên tiêu đề không bằng giá trị kỳ vọng.', impl: 'Bid cao nhất chưa chắc là bid tốt nhất.', related: 'Deal certainty', review: 'Sell-side: Lotus Healthcare' } },
      { type: 'choice', id: 'k_ib_pick', q: 'Bạn khuyến nghị khách hàng tiến vào exclusivity với ai?', grade: true, best: [1], opts: [
        { t: 'A — giá cao nhất 520', out: `Giá trị kỳ vọng chỉ ${BIDS.A}. Chín tháng sau, cơ quan cạnh tranh yêu cầu thoái bớt phòng khám — giá bị giảm.`, v: { pick: 'A' } },
        { t: 'B — 495 nhưng gần như chắc chắn hoàn tất', out: `Giá trị kỳ vọng cao nhất (${BIDS.B}). Khách hàng đánh giá cao sự phân tích của bạn.`, v: { pick: 'B' } },
        { t: 'C — 505', out: `Giá trị kỳ vọng ${BIDS.C}. Bên C gặp khó khi huy động vốn.`, v: { pick: 'C' } },
      ] },
      { type: 'negotiate', id: 'k_ib_neg', who: 'victor', role: 'sell', concept: 'negotiation', unit: 'tỷ đồng', ask: 495, reservation: 508, min: 480, max: 540, step: 1, start: 520, rounds: 4, concession: 0.45, insult: 1.08, when: (rt) => rt.vars.pick === 'B',
        intro: 'Bạn đại diện bên BÁN, đàm phán với Quỹ PE (B). Họ đang trả 495. Đề nghị mức giá bạn muốn — họ có giới hạn tối đa riêng.',
        batna: 'BATNA của khách hàng: quay lại với bid C (giá trị kỳ vọng ' + BIDS.C + ').',
        issues: [{ id: 'excl', t: 'Đồng ý exclusivity 30 ngày', v: 6 }, { id: 'reps', t: 'Giảm phạm vi representations & warranties', v: -4 }] },
      { type: 'outcome', id: 'k_ib_out', eval: (rt, S, sc) => {
        const n = rt.vars.k_ib_neg;
        if (rt.vars.pick !== 'B') return { text: 'Thương vụ kéo dài và giá trị thực nhận thấp hơn kỳ vọng. Victor: "Giá trên tiêu đề không trả lương cho khách hàng của chúng ta."', fx: { rep: 0 }, score: sc };
        if (n?.deal) return { text: `Ký SPA với Quỹ PE ở ${n.price} tỷ đồng. Phí tư vấn thành công. Victor: "Làm tốt."`, fx: { rep: 5, credits: 40, items: ['cert_ib'] }, score: sc };
        return { text: 'Bạn đẩy giá quá cao, Quỹ PE rút lui; khách hàng quay lại bid C. Bài học: biết reservation value của đối phương.', fx: { rep: 1, items: ['cert_ib'] }, score: sc * 0.8 };
      } },
    ],
    rewards: { xp: 70, rep: 2, rel: { victor: { respect: 8 } } },
  },
  {
    id: 'k_pe_lbo', title: 'LBO: GreenLeaf Packaging', kind: 'career', chapter: 'career', career: 'pe', giver: 'sophia', loc: 'office_pe', age: 22,
    summary: 'Xây dựng LBO, đánh giá ban lãnh đạo và trình Investment Committee.',
    steps: [
      { type: 'quiz', id: 'k_iv_pe', when: (rt, S) => S.tl.flags.no_offer, concept: 'lbo', q: '🎤 Phỏng vấn PE: "Ba nguồn tạo lợi nhuận chính trong một LBO?"', opts: ['Tăng trưởng EBITDA, mở rộng bội số (multiple expansion), và trả nợ (deleveraging)', 'Phí quản lý, phí giao dịch, lãi tiền gửi', 'Giảm thuế, in tiền, vay thêm'], a: 0,
        fb: { vi: 'Value creation bridge: EBITDA growth + multiple expansion + debt paydown.', en: 'LBO returns come from EBITDA growth, multiple expansion and deleveraging.', why: 'Câu hỏi nền tảng.', impl: 'Không có offer → phải chứng minh lại.', related: 'LBO', review: 'LBO: GreenLeaf Packaging' } },
      { type: 'say', lines: [['sophia', 'GreenLeaf — bao bì giấy thân thiện môi trường. EBITDA 50 triệu USD. Người bán muốn 8x. Hãy xây LBO và nói tôi biết: ta có nên mua không?']], terms: ['Leveraged Buyout', 'MOIC', 'IRR', 'Investment Committee'] },
      { type: 'model', id: 'k_pe_model', model: 'lbo', concept: 'lbo', goal: { text: 'Khám phá: thử entry 9x và nợ 6,5x. Đặt lại entry 8x, nợ 5x, exit 8x, lãi 8% để tiếp tục.', check: (o, v) => v.entry === 8 && v.debt === 5 && v.exit === 8 && v.rate === 8 } },
      { type: 'num', id: 'k_pe_eq', concept: 'lbo', q: 'Sponsor Equity cần bỏ vào (triệu USD)? (EV 400 + phí 2% − nợ 250)', a: r1(LBO8.equity0), tol: 0.1, unit: 'triệu USD', traps: [{ v: 150, why: 'Bạn quên phí giao dịch 2% × 400 = 8 — Uses phải bằng Sources.' }],
        fb: { vi: 'Uses = 400 + 8 = 408; Sources = Nợ 250 + Equity → Equity = 158.', en: 'Sources = Uses; equity is the plug.', why: 'Sponsor equity bù phần còn lại.', impl: 'Phí giao dịch làm giảm lợi nhuận của quỹ.', related: 'Sources & Uses', review: 'LBO: GreenLeaf Packaging' } },
      { type: 'num', id: 'k_pe_moic', concept: 'irr_moic', q: 'MOIC sau 5 năm ở kịch bản cơ sở (2 chữ số thập phân)?', a: r2(LBO8.moic), tol: 0.03, unit: 'x',
        fb: { vi: `Exit equity ≈ ${r1(LBO8.exitEquity)} / 158 ≈ ${r2(LBO8.moic)}x; IRR ≈ ${(LBO8.irr * 100).toFixed(1)}%.`, en: 'MOIC = exit equity / initial equity.', why: 'Exit EV − nợ còn lại + tiền mặt.', impl: 'IRR vừa vượt hurdle 20%.', related: 'IRR vs MOIC', review: 'LBO: GreenLeaf Packaging' } },
      { type: 'choice', id: 'k_pe_mgmt', q: 'Due diligence ban lãnh đạo: CEO GreenLeaf rất giỏi bán hàng nhưng CFO vừa nghỉ việc. Bạn:', grade: true, best: [1], opts: [
        { t: 'Bỏ qua — con số mới là quan trọng', out: 'Rủi ro báo cáo tài chính không được kiểm soát.', v: { mgmt: 0 } },
        { t: 'Đưa việc tuyển CFO mạnh vào kế hoạch 100 ngày và làm Quality of Earnings review độc lập', out: 'QoE phát hiện 2 triệu USD EBITDA một lần (one-off) — bạn điều chỉnh mô hình.', v: { mgmt: 2 } },
        { t: 'Yêu cầu thay CEO ngay', out: 'Người bán phật ý; mất lợi thế đàm phán.', v: { mgmt: -1 } },
      ] },
      { type: 'choice', id: 'k_pe_ic', q: `IC memo: IRR ở 8x ≈ ${(LBO8.irr * 100).toFixed(1)}%; ở 9x ≈ ${(LBO9.irr * 100).toFixed(1)}%; nếu exit chỉ 7x ≈ ${(LBO8x7.irr * 100).toFixed(1)}%. Hurdle 20%. Khuyến nghị?`, grade: true, best: [0], opts: [
        { t: 'Đầu tư tối đa 8x, có kế hoạch giảm rủi ro downside (không trả thêm)', out: 'Sophia: "Kỷ luật về giá. Tôi ủng hộ."', v: { ic: 'disciplined' } },
        { t: 'Trả 9x để chắc thắng', out: `Ở 9x, IRR chỉ ${(LBO9.irr * 100).toFixed(1)}% — dưới hurdle. IC từ chối.`, v: { ic: 'overpay' } },
        { t: 'Từ chối — IRR quá sát hurdle', out: 'Một quyết định có thể bảo vệ được, nhưng bạn đã bỏ qua một tài sản tốt có biên an toàn.', v: { ic: 'pass' } },
      ] },
      { type: 'outcome', id: 'k_pe_out', eval: (rt, S, sc) => {
        const ic = rt.vars.ic, m = rt.vars.mgmt || 0;
        if (ic === 'disciplined') return { text: `IC phê duyệt. ${m >= 2 ? 'Nhờ QoE, bạn đàm phán giảm giá 1 triệu USD.' : 'Sau closing, phát hiện EBITDA có khoản một lần — lợi nhuận thấp hơn kế hoạch.'} Tuy nhiên, phân tích tốt không đảm bảo lợi nhuận — thị trường sẽ quyết định phần còn lại.`, fx: { rep: m >= 2 ? 5 : 3, items: ['cert_pe'], flags: { pe_deal: true } }, score: sc };
        if (ic === 'pass') return { text: 'Quỹ khác mua GreenLeaf ở 8x. Không mất tiền — nhưng cũng không tạo được giá trị.', fx: { rep: 1, items: ['cert_pe'] }, score: sc };
        return { text: 'IC từ chối đề xuất 9x. Sophia: "Lần sau hãy mang đến cho tôi một lý do để nói CÓ ở mức giá đúng."', fx: { rep: -1, items: ['cert_pe'] }, score: sc };
      } },
    ],
    rewards: { xp: 70, rep: 2, rel: { sophia: { respect: 8 } } },
  },
  {
    id: 'k_vc_round', title: 'Series A: Mầm AI', kind: 'career', chapter: 'career', career: 'vc', giver: 'ken', loc: 'office_vc', age: 22,
    summary: 'Founder là Khoa — người bạn/đối thủ cũ. Đánh giá startup AI, cap table và term sheet.',
    steps: [
      { type: 'quiz', id: 'k_iv_vc', when: (rt, S) => S.tl.flags.no_offer, concept: 'saas_metrics', q: '🎤 Phỏng vấn VC: "NRR 120% có nghĩa gì?"', opts: ['Khách hàng hiện tại năm nay chi nhiều hơn năm ngoái 20% (sau churn và mở rộng)', 'Doanh thu tăng 120 lần', 'Lợi nhuận 120%'], a: 0,
        fb: { vi: 'Net Revenue Retention đo doanh thu từ nhóm khách hàng cũ sau mở rộng, giảm và rời bỏ.', en: 'NRR = revenue from an existing cohort this year / last year.', why: 'Chỉ số SaaS cốt lõi.', impl: 'Không có offer → phải chứng minh lại.', related: 'Retention', review: 'Series A: Mầm AI' } },
      { type: 'say', lines: [['ken', 'Mầm AI — trợ lý AI dự báo nhu cầu cho tiệm bánh và chuỗi F&B. Founder: Bùi Đăng Khoa. Hình như cô quen cậu ta?'], ['khoa', 'Không ngờ người ngồi bên kia bàn lại là cậu. ARR 2,4 triệu USD, tăng 3 lần trong 12 tháng. NRR 125%. Tiền mặt 3,2 triệu, burn 400 nghìn USD/tháng.']], terms: ['Runway', 'Pre-money', 'Post-money', 'Option Pool', 'Liquidation Preference'] },
      { type: 'say', when: (rt, S) => (S.tl.rel.khoa?.trust ?? 0) + (S.tl.rel.khoa?.respect ?? 0) >= 15, lines: [['khoa', 'Vì cậu từng ngăn tớ làm điều dại dột ở cuộc thi năm ấy... tớ nói thật: gross margin chỉ 55% vì chi phí inference GPU. Tớ cần vốn để tối ưu mô hình.'], ['nar', '🔓 Mối quan hệ tốt giảm information asymmetry — bạn có thêm dữ liệu thật.']] },
      { type: 'say', when: (rt, S) => isSpecialist(S.tl, 'ai'), lines: [['nar', '🤖 Chuyên môn AI: bạn yêu cầu xem chi phí inference trên mỗi khách hàng và lộ trình chuyển sang mô hình nhỏ hơn. Ken: "Câu hỏi của người trong nghề." (+Industry credibility khi hoàn thành)']] },
      { type: 'num', id: 'k_vc_runway', concept: 'runway', q: 'Runway hiện tại (tháng)?', a: 8, tol: 0, unit: 'tháng', fb: { vi: '3,2 triệu / 0,4 triệu mỗi tháng = 8 tháng.', en: 'Runway = cash / monthly net burn.', why: 'Chia tiền mặt cho burn.', impl: 'Dưới 12 tháng → founder chịu áp lực gọi vốn, nhà đầu tư có lợi thế đàm phán.', related: 'Burn multiple', review: 'Series A: Mầm AI' } },
      { type: 'quiz', id: 'k_vc_gm', concept: 'ai_economics', q: 'Gross margin 55% của một startup AI (so với SaaS truyền thống ~75–80%) cho thấy điều gì?', opts: ['Không vấn đề gì', 'Chi phí compute/inference cao — cần chứng minh lộ trình cải thiện biên (tối ưu mô hình, định giá theo giá trị)', 'Công ty đang gian lận'], a: 1,
        fb: { vi: 'AI có chi phí biên trên mỗi lượt dùng (inference) — khác với phần mềm truyền thống gần như bằng 0.', en: 'AI gross margins are pressured by inference compute costs.', why: 'COGS bao gồm GPU/cloud.', impl: 'Định giá theo bội số ARR phải điều chỉnh theo chất lượng biên lợi nhuận.', related: 'AI Academy, Unit economics', review: 'Series A: Mầm AI' } },
      { type: 'model', id: 'k_vc_model', model: 'round', concept: 'cap_table', goal: { text: 'Khám phá: thay đổi exit để thấy khi nào Series A chuyển đổi. Đặt lại pre 32, vốn 8, pool 10%, exit 30 để tiếp tục.', check: (o, v) => v.pre === 32 && v.inv === 8 && v.pool === 10 && v.exit === 30 } },
      { type: 'num', id: 'k_vc_pre', concept: 'cap_table', q: 'Với pool 10% post-money tính vào pre-money, pre-money hiệu dụng cho founders là bao nhiêu (triệu USD)?', a: r1(ROUND.effectivePreMoney), tol: 0.1, unit: 'triệu USD', traps: [{ v: 32, why: 'Đó là pre-money danh nghĩa. Pool shuffle làm founders chịu toàn bộ pha loãng của pool: 32 − 10% × 40 = 28.' }],
        fb: { vi: 'Pre-money hiệu dụng = 32 − 10% × 40 = 28 triệu USD.', en: 'Option pool shuffle: pool created pre-money reduces effective pre-money.', why: 'Pool được tính vào phía founders.', impl: 'Founders nên đàm phán quy mô pool dựa trên kế hoạch tuyển dụng thực tế.', related: 'Option Pool', review: 'Series A: Mầm AI' } },
      { type: 'num', id: 'k_vc_wf', concept: 'liq_pref', q: 'Nếu công ty được bán với giá 30 triệu USD, Series A (1x non-participating, 8 triệu, sở hữu 20%) nhận bao nhiêu?', a: r1(WF30.perSeries[0]), tol: 0.05, unit: 'triệu USD', traps: [{ v: 6, why: '20% × 30 = 6 nhỏ hơn 8 — Series A sẽ KHÔNG chuyển đổi, mà dùng liquidation preference.' }],
        fb: { vi: 'Series A chọn max(8; 20% × 30 = 6) = 8. Founders và pool chia 22 còn lại.', en: 'Non-participating preferred takes the greater of its preference or as-converted value.', why: 'So sánh hai lựa chọn.', impl: 'Exit thấp làm lợi ích founders và nhà đầu tư lệch nhau.', related: 'Waterfall', review: 'Series A: Mầm AI' } },
      { type: 'negotiate', id: 'k_vc_neg', who: 'khoa', concept: 'negotiation', unit: 'triệu USD pre-money', ask: 40, reservation: 31, min: 20, max: 48, step: 1, start: 28, rounds: 4, concession: 0.4, insult: 0.8,
        intro: 'Khoa muốn pre-money 40 triệu. Bạn có thể kết hợp điều khoản.', batna: 'Còn nhiều startup khác trong pipeline; nhưng Mầm AI là ứng viên tốt nhất quý này.',
        issues: [{ id: 'observer', t: 'Chỉ cần ghế board observer (không phải ghế board)', v: 2 }, { id: 'prorata', t: 'Quyền pro rata ở vòng sau', v: -1 }, { id: 'pool_small', t: 'Giảm pool xuống 7% theo kế hoạch tuyển dụng', v: 3 }] },
      { type: 'outcome', id: 'k_vc_out', eval: (rt, S, sc) => {
        const n = rt.vars.k_vc_neg;
        if (n?.deal) return { text: `Term sheet ký ở pre-money ${n.price} triệu USD. ${n.price <= 34 ? 'Giá hợp lý với rủi ro gross margin.' : 'Giá khá cao — bạn cần công ty tăng trưởng mạnh để bù.'} Khoa: "Cảm ơn vì đã công bằng." Trong VC, kết quả sẽ phụ thuộc vào power law — một khoản tốt có thể vẫn thất bại.`, fx: { rep: 4, items: ['cert_vc'], flags: { vc_deal: true }, rel: { khoa: { trust: 10 } } }, score: sc };
        return { text: 'Không đạt thoả thuận. Khoa gọi vốn từ quỹ khác. Quan hệ vẫn tốt — có thể gặp lại ở vòng sau.', fx: { rep: 1, items: ['cert_vc'] }, score: sc * 0.85 };
      } },
    ],
    rewards: { xp: 70, rep: 2, rel: { ken: { respect: 8 } } },
  },
  {
    id: 'k_cd_synergy', title: 'Mua lại Hoa Mai Cosmetics', kind: 'career', chapter: 'career', career: 'cd', giver: 'hung', loc: 'office_cd', age: 22,
    summary: 'Đánh giá synergy, accretion/dilution và kế hoạch tích hợp cho CEO.',
    steps: [
      { type: 'quiz', id: 'k_iv_cd', when: (rt, S) => S.tl.flags.no_offer, concept: 'synergy', q: '🎤 Phỏng vấn: "Vì sao cost synergies đáng tin hơn revenue synergies?"', opts: ['Vì chúng nằm trong tầm kiểm soát của bên mua (đóng kho trùng, hợp nhất mua hàng)', 'Vì chúng luôn lớn hơn', 'Vì kế toán thích chúng'], a: 0,
        fb: { vi: 'Revenue synergies phụ thuộc vào khách hàng và thị trường.', en: 'Cost synergies are more controllable than revenue synergies.', why: 'Ai quyết định kết quả?', impl: 'Không có offer → phải chứng minh lại.', related: 'Synergies', review: 'Mua lại Hoa Mai Cosmetics' } },
      { type: 'say', lines: [['hung', 'CEO muốn mua Hoa Mai Cosmetics với giá 360 tỷ, trả 50% cổ phiếu và 50% vay nợ. Ông ấy hỏi: thương vụ có accretive không, và ta cần bao nhiêu synergies?']], terms: ['Accretion/Dilution', 'Synergies'] },
      { type: 'sort', id: 'k_cd_syn', concept: 'synergy', q: 'Phân loại các tác động:', cats: ['Cost synergy', 'Revenue synergy', 'Dis-synergy / chi phí tích hợp'],
        items: [['Hợp nhất trung tâm phân phối', 0], ['Bán mỹ phẩm Hoa Mai trong 300 cửa hàng Pastel', 1], ['Chi phí IT để hợp nhất hệ thống', 2], ['Đàm phán giá bao bì tốt hơn nhờ quy mô', 0], ['Mất khách hàng đại lý không muốn phụ thuộc Pastel', 2], ['Cross-sell gói quà tặng', 1]],
        fb: { vi: 'Luôn tính cả dis-synergies và chi phí tích hợp — chúng thường bị bỏ quên.', en: 'Model cost synergies, revenue synergies, integration costs and dis-synergies.', why: 'Nguồn gốc của từng tác động.', impl: 'Synergy ròng mới quyết định thương vụ.', related: 'PMI', review: 'Mua lại Hoa Mai Cosmetics' } },
      { type: 'model', id: 'k_cd_model', model: 'ad', concept: 'accretion', goal: { text: 'Khám phá: tăng tỷ lệ cổ phiếu và synergies. Đặt lại giá 360, 50% cổ phiếu, synergies 0 để tiếp tục.', check: (o, v) => v.price === 360 && v.stock === 50 && v.syn === 0 } },
      { type: 'num', id: 'k_cd_acc', concept: 'accretion', q: 'Accretion/(Dilution) EPS khi chưa có synergies (%, 2 chữ số thập phân, âm nếu dilutive)?', a: r2(AD.accretion * 100), tol: 0.05, unit: '%',
        fb: { vi: `Cổ phiếu mới = 180/24 = 7,5 triệu; lãi vay sau thuế = 180 × 6% × 0,8 = 8,64. NI pro forma = 120 + 15 − 8,64 = 126,36; EPS = 126,36/107,5 ≈ ${r2(AD.proEps)} so với 1,20 → ${r2(AD.accretion * 100)}%.`, en: 'Pro forma EPS = combined NI after financing costs / combined shares.', why: 'P/E mua (24x) cao hơn P/E của bên mua (20x) với phần trả bằng cổ phiếu → dilutive.', impl: 'CEO cần biết synergies tối thiểu.', related: 'P/E rule', review: 'Mua lại Hoa Mai Cosmetics' } },
      { type: 'num', id: 'k_cd_be', concept: 'accretion', q: 'Synergies trước thuế tối thiểu để EPS hoà vốn (tỷ đồng, 1 chữ số thập phân)?', a: r1(AD.breakevenSyn), tol: 0.1, unit: 'tỷ đồng',
        fb: { vi: `(1,20 × 107,5 − 126,36) / (1 − 20%) = ${r1(AD.breakevenSyn)} tỷ.`, en: 'Breakeven synergies = EPS shortfall × shares / (1 − tax).', why: 'Synergies được đánh thuế.', impl: 'Mức thấp — nhưng accretion EPS không đồng nghĩa tạo giá trị.', related: 'Value vs EPS', review: 'Mua lại Hoa Mai Cosmetics' } },
      { type: 'quiz', id: 'k_cd_value', concept: 'accretion', q: 'CEO nói: "Có synergies là accretive, vậy là tạo giá trị!" Phản biện đúng nhất?', opts: ['Đồng ý hoàn toàn', 'EPS accretion không đồng nghĩa tạo giá trị — phải so sánh giá trả với giá trị độc lập + synergies ròng (đã trừ chi phí tích hợp và rủi ro)', 'Chỉ cần nhìn giá cổ phiếu ngày công bố'], a: 1,
        fb: { vi: 'Thương vụ trả bằng nợ rẻ gần như luôn accretive, kể cả khi trả quá đắt.', en: 'Accretion is an accounting outcome; value creation requires price < standalone value + net synergies.', why: 'Chi phí vốn thật sự (WACC) cao hơn lãi vay sau thuế.', impl: 'Đề xuất M&A phải có phân tích giá trị, không chỉ EPS.', related: 'ROIC vs WACC', review: 'Mua lại Hoa Mai Cosmetics' } },
      { type: 'choice', id: 'k_cd_pmi', q: 'Sau khi ký, nhân viên hai bên nghi ngờ nhau; đội R&D của Hoa Mai có nguy cơ nghỉ việc. Bạn đề xuất:', grade: true, best: [1], opts: [
        { t: 'Hợp nhất mọi thứ ngay trong tháng đầu để nhanh chóng ghi nhận synergies', out: '40% đội R&D nghỉ việc. Revenue synergies biến mất.', v: { pmi: 0 } },
        { t: 'Kế hoạch 100 ngày: giữ chân nhân sự chủ chốt (retention bonus), giao tiếp minh bạch, hợp nhất back-office trước, giữ thương hiệu Hoa Mai', out: 'Đội R&D ở lại. Synergy chi phí đạt 80% kế hoạch năm đầu.', v: { pmi: 2 } },
        { t: 'Để Hoa Mai hoạt động độc lập hoàn toàn', out: 'Văn hoá được giữ, nhưng không có synergies — thương vụ chỉ còn dilutive.', v: { pmi: 1 } },
      ] },
      { type: 'outcome', id: 'k_cd_out', eval: (rt, S, sc) => ({ text: rt.vars.pmi === 2 ? 'Hội đồng quản trị ghi nhận đề xuất của bạn là "mẫu mực". Anh Hùng giao bạn dẫn workstream tích hợp tiếp theo.' : 'Thương vụ hoàn tất nhưng tích hợp gặp khó. Anh Hùng: "Giá trị M&A được tạo ra hoặc phá huỷ sau ngày ký."', fx: { rep: rt.vars.pmi === 2 ? 5 : 1, items: ['cert_cd'], flags: { cd_deal: true } }, score: sc }) },
    ],
    rewards: { xp: 70, rep: 2, rel: { hung: { respect: 8 } } },
  },
  {
    id: 'k_macro_rates', title: '📈 Ngân hàng Trung ương tăng lãi suất', kind: 'macro', chapter: 'career', giver: 'ha', loc: 'district', age: 23, reqAny: Object.values(CAREERS).map((c) => c.mission), // first mission of every career track
    summary: 'Lãi suất tăng 200 bps. Truyền dẫn cú sốc vào cost of capital, định giá và thương vụ.',
    steps: [
      { type: 'say', lines: [['ha', 'Lạm phát vượt mục tiêu, Ngân hàng Trung ương tăng lãi suất chính sách thêm 200 bps. Lợi suất trái phiếu chính phủ (risk-free) từ 3% lên 5%. Lãi vay doanh nghiệp từ 6% lên 8%.'], ['ha', 'Hãy truyền dẫn cú sốc: Cost of Equity → WACC → định giá → thương vụ của em. Giữ beta 1,2; ERP 6%; cơ cấu vốn 70% equity / 30% debt; thuế 20%.']] },
      { type: 'num', id: 'k_mr_ke', concept: 'macro_rates', q: 'Cost of Equity mới (CAPM, %)?', a: r1(KE_NEW * 100), tol: 0.05, unit: '%', fb: { vi: '5% + 1,2 × 6% = 12,2% (trước đó 10,2%).', en: 'ke = rf + β × ERP.', why: 'Risk-free tăng 2% → ke tăng 2%.', impl: 'Nhà đầu tư đòi hỏi lợi nhuận cao hơn.', related: 'CAPM', review: 'Macro Strategy' } },
      { type: 'num', id: 'k_mr_wacc', concept: 'wacc', q: 'WACC mới (%, 2 chữ số thập phân)?', a: r2(W_NEW * 100), tol: 0.02, unit: '%', traps: [{ v: 11.06, why: 'Bạn quên lá chắn thuế: kd sau thuế = 8% × (1 − 20%) = 6,4%.' }],
        fb: { vi: `70% × 12,2% + 30% × 8% × 0,8 = ${r2(W_NEW * 100)}% (trước đó ${r2(W_OLD * 100)}%).`, en: 'WACC = E/V·ke + D/V·kd·(1−t).', why: 'Cả hai thành phần đều tăng.', impl: 'Tỷ lệ chiết khấu cao hơn → định giá thấp hơn.', related: 'WACC', review: 'Macro Strategy' } },
      { type: 'num', id: 'k_mr_ev', concept: 'macro_rates', q: `Với dòng tiền chuỗi Mây Hồng (g = 2,5%), EV giảm bao nhiêu % khi WACC từ ${r2(W_OLD * 100)}% lên ${r2(W_NEW * 100)}%? (số dương, ±1)`, a: r1((1 - EV_NEW / EV_OLD) * 100), tol: 1, unit: '%',
        fb: { vi: `EV từ ≈ ${r1(EV_OLD)} xuống ≈ ${r1(EV_NEW)} tỷ: giảm ${r1((1 - EV_NEW / EV_OLD) * 100)}%.`, en: 'Long-duration cash flows are highly sensitive to discount rates.', why: 'Terminal Value chịu tác động mạnh nhất.', impl: 'Người bán và người mua bất đồng về giá → số thương vụ M&A giảm.', related: 'Duration, Valuation gap', review: 'Macro Strategy' } },
      { type: 'quiz', id: 'k_mr_lbo', concept: 'macro_rates', q: 'Tác động lên thị trường LBO?', opts: ['Không ảnh hưởng', 'Lãi vay cao hơn → coverage thấp hơn → ngân hàng cho vay ít hơn → equity check lớn hơn → IRR thấp hơn → giá mua phải giảm', 'IRR tăng vì lãi suất tăng'], a: 1,
        fb: { vi: 'Chuỗi truyền dẫn: chi phí nợ → khả năng vay → cấu trúc vốn → lợi nhuận → giá.', en: 'Higher rates reduce debt capacity and sponsor returns, compressing purchase multiples.', why: 'Interest coverage là ràng buộc của ngân hàng.', impl: 'PE phải tạo giá trị bằng vận hành thay vì đòn bẩy.', related: 'LBO, Credit cycle', review: 'Macro Strategy' } },
      { type: 'choice', id: 'k_mr_action', q: 'Khuyến nghị cho thương vụ hiện tại của bạn:', grade: true, best: [0], opts: [
        { t: 'Cập nhật mô hình với WACC/lãi vay mới, chạy downside, giảm đòn bẩy và điều chỉnh giá/cấu trúc phù hợp', out: 'TS. Thu Hà: "Đúng tinh thần: macro không phải để dự đoán, mà để kiểm tra độ bền của thương vụ."', fx: { rel: { ha: { respect: 10 } } } },
        { t: 'Giữ nguyên giả định — lãi suất sẽ sớm giảm', out: 'Đó là đặt cược, không phải phân tích.', fx: { rel: { ha: { respect: -3 } } } },
        { t: 'Dừng mọi thương vụ vô thời hạn', out: 'Thận trọng quá mức — cơ hội tốt thường xuất hiện khi định giá giảm.', fx: {} },
      ] },
    ],
    rewards: { xp: 50, rep: 2, flags: { macro_rate: 'high' }, macro: { rate: 'high' } },
  },
  {
    id: 'k_macro_recession', title: '📉 Kịch bản suy thoái', kind: 'macro', chapter: 'career', giver: 'ha', loc: 'district', age: 23, req: ['k_macro_rates'],
    summary: 'Suy thoái làm doanh thu và biên lợi nhuận giảm. Kiểm tra covenant và hành động.',
    steps: [
      { type: 'say', lines: [['ha', 'Kinh tế suy thoái. Một công ty danh mục: doanh thu từ 500 xuống 440 tỷ; biên EBITDA từ 20% xuống 16% do chi phí cố định (operating leverage). Nợ 450 tỷ. Covenant: Nợ/EBITDA tối đa 5,5x.']], terms: ['Covenant'] },
      { type: 'num', id: 'k_rc_ebitda', concept: 'covenants', q: 'EBITDA mới (tỷ đồng)?', a: r1(REC.ebitda), tol: 0.05, unit: 'tỷ đồng', fb: { vi: '440 × 16% = 70,4 (trước đó 100). Doanh thu giảm 12% nhưng EBITDA giảm 29,6% — operating leverage.', en: 'Operating leverage amplifies revenue declines into larger EBITDA declines.', why: 'Chi phí cố định không giảm theo doanh thu.', impl: 'Ngành có chi phí cố định cao rủi ro hơn trong suy thoái.', related: 'Operating leverage', review: 'Kịch bản suy thoái' } },
      { type: 'num', id: 'k_rc_lev', concept: 'covenants', q: 'Nợ/EBITDA mới (x, 2 chữ số thập phân)?', a: r2(REC.lev), tol: 0.02, unit: 'x', fb: { vi: `450 / 70,4 ≈ ${r2(REC.lev)}x > 5,5x → vi phạm covenant.`, en: 'Leverage = Debt / EBITDA.', why: 'Mẫu số giảm mạnh.', impl: 'Vi phạm covenant cho phép ngân hàng đòi nợ trước hạn.', related: 'Covenant breach', review: 'Kịch bản suy thoái' } },
      { type: 'num', id: 'k_rc_cure', concept: 'covenants', q: 'Cần trả bớt bao nhiêu nợ (equity cure) để về đúng 5,5x (tỷ đồng)?', a: r1(REC.cure), tol: 0.1, unit: 'tỷ đồng', fb: { vi: `450 − 5,5 × 70,4 = ${r1(REC.cure)} tỷ.`, en: 'Required paydown = Debt − covenant × EBITDA.', why: 'Đưa tỷ lệ về ngưỡng.', impl: 'Sponsor phải quyết định bỏ thêm vốn hay đàm phán với ngân hàng.', related: 'Equity cure', review: 'Kịch bản suy thoái' } },
      { type: 'choice', id: 'k_rc_action', q: 'Phương án tốt nhất?', grade: true, best: [0], opts: [
        { t: 'Chủ động đàm phán với ngân hàng (amend & extend), kết hợp chương trình cắt giảm chi phí và equity cure một phần', out: 'Ngân hàng nới covenant 2 quý đổi lấy phí và cam kết vốn. Công ty vượt qua suy thoái.', fx: { rep: 3 } },
        { t: 'Im lặng, hy vọng quý sau tốt hơn', out: 'Ngân hàng phát hiện vi phạm qua báo cáo — mất niềm tin, điều khoản khắt khe hơn.', fx: { rep: -3 } },
        { t: 'Bán gấp tài sản tốt nhất với giá rẻ', out: 'Trả được nợ, nhưng phá huỷ giá trị dài hạn.', fx: { rep: -1 } },
      ] },
    ],
    rewards: { xp: 50, rep: 2, ach: ['macro_mind'], macro: { regime: 'recession' } },
  },
  {
    id: 'k_review', title: 'Đánh giá hiệu suất năm đầu', kind: 'career', chapter: 'career', giver: '@mentor', loc: '@office', age: 23, req: ['k_macro_recession'], reqCareerMission: true,
    summary: 'Thăng tiến dựa trên năng lực đã chứng minh — không phải XP.',
    steps: [
      { type: 'outcome', id: 'k_rev_out', eval: (rt, S) => {
        const tl = S.tl; const qd = tl.questsDone;
        const ids = QUESTS.filter((q) => (q.kind === 'career' || q.kind === 'macro') && q.id !== 'k_review' && qd[q.id]).map((q) => q.id);
        const avg = ids.reduce((s, q) => s + (qd[q].score ?? 0), 0) / Math.max(1, ids.length);
        const rep = tl.stats.rep;
        const ethicsOk = (tl.stats.ethics ?? 0) >= 0;
        let promote = 0;
        if (avg >= 0.85 && rep >= 25 && ethicsOk) promote = 2; else if (avg >= 0.7 && rep >= 15 && ethicsOk) promote = 1;
        const pct = Math.round(avg * 100);
        const text = promote === 2 ? `Điểm năng lực ${pct}%, uy tín ${rep}. Thăng tiến vượt cấp — điều hiếm thấy trong năm đầu.` : promote === 1 ? `Điểm năng lực ${pct}%, uy tín ${rep}. Bạn được thăng một cấp.` : `Điểm năng lực ${pct}%, uy tín ${rep}${ethicsOk ? '' : ', và có vấn đề về đạo đức nghề nghiệp'}. Chưa được thăng chức năm nay — hãy ôn lại các khái niệm yếu trong Thư viện.`;
        const sp = tl.spec;
        const specTxt = !sp ? ' Bạn chưa chọn chuyên môn ngành — Học viện Ngành có thể giúp bạn nổi bật hơn.' : sp.primary === 'generalist' ? ' Generalist Track: bạn được đánh giá cao về độ rộng hiểu biết ngành.' : ` Chuyên môn ${SECTORS[sp.primary].name} (credibility ${credibility(tl, sp.primary)}/100) giúp bạn được giao các thương vụ trong ngành này.`;
        return { text: text + specTxt + ' Dòng thời gian này đã hoàn thành bản xem trước. Bạn có thể mở Đa Vũ Trụ Sự Nghiệp để thử con đường khác.', fx: { career: { promote }, flags: { timeline_complete: true }, ach: ['timeline_done'], items: ['outfit_sage'] }, score: avg };
      } },
    ],
    rewards: { xp: 40 },
  },

  // ======================= HALL OF LEGENDARY DEALS =======================
  {
    id: 'h_disney', title: 'Hồ sơ: Disney / Pixar (2006)', kind: 'case', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: 'disney_pixar',
    summary: 'Thương vụ mua năng lực sáng tạo bằng cổ phiếu. Phân biệt fact và interpretation.',
    steps: [
      { type: 'say', lines: [['ngoc', 'Năm 2006, Disney mua Pixar bằng cổ phiếu: 2,3 cổ phiếu Disney cho mỗi cổ phiếu Pixar, giá trị báo cáo khoảng 7,4 tỷ USD. Đây là Verified Fact.'], ['ngoc', 'Hãy chọn góc nhìn để phân tích.']] },
      { type: 'choice', id: 'h_d_persp', q: 'Bạn phân tích từ góc nhìn nào?', opts: [
        { t: 'Ban lãnh đạo Disney (bên mua)', out: 'Câu hỏi của bạn: mua năng lực hay tự xây dựng?', v: { persp: 'buyer' } },
        { t: 'Cổ đông Pixar (bên bán)', out: 'Câu hỏi của bạn: nhận cổ phiếu Disney có tốt hơn tiền mặt?', v: { persp: 'seller' } },
      ] },
      { type: 'num', id: 'h_d_px', concept: 'stock_deal', q: '[Simulation Assumption] Nếu cổ phiếu Disney giá 25 USD, mỗi cổ phiếu Pixar nhận giá trị bao nhiêu USD?', a: 57.5, tol: 0.01, unit: 'USD', fb: { vi: '2,3 × 25 = 57,5 USD. Giá 25 USD là giả định mô phỏng.', en: 'Implied price = exchange ratio × acquirer share price.', why: 'Trong deal cổ phiếu với tỷ lệ cố định, giá trị biến động theo giá bên mua.', impl: 'Cổ đông bên bán chịu rủi ro giá cổ phiếu bên mua đến ngày hoàn tất.', related: 'Fixed exchange ratio', review: 'Hồ sơ Disney / Pixar' } },
      { type: 'quiz', id: 'h_d_label', concept: 'source_labels', q: 'Câu "Disney mua Pixar chủ yếu để có được văn hoá sáng tạo và đội ngũ" thuộc nhãn nào?', opts: ['Verified Fact', 'Analyst Interpretation', 'Simulation Assumption'], a: 1, fb: { vi: 'Đây là diễn giải hợp lý được nhiều nhà phân tích chia sẻ, nhưng là đánh giá về động cơ — không phải dữ kiện được ghi trong hồ sơ.', en: 'Motive statements are interpretations unless directly documented.', why: 'Phân biệt "điều đã xảy ra" và "vì sao nó xảy ra".', impl: 'Investment memo phải tách bạch dữ kiện và nhận định.', related: 'Research protocol', review: 'Đại Sảnh' } },
      { type: 'quiz', id: 'h_d_stock', concept: 'stock_deal', q: 'Lợi ích chính của việc trả bằng cổ phiếu trong thương vụ này?', opts: ['Không phải trả gì', 'Bảo toàn tiền mặt bên mua và để cổ đông/lãnh đạo bên bán chia sẻ rủi ro – lợi ích tương lai của tập đoàn hợp nhất', 'Luôn rẻ hơn tiền mặt'], a: 1, fb: { vi: 'Cổ phiếu biến người bán thành cổ đông — gắn lợi ích lâu dài.', en: 'Stock consideration shares risk and aligns incentives.', why: 'Cổ đông lớn của Pixar trở thành cổ đông lớn của Disney.', impl: 'Nhưng làm pha loãng cổ đông hiện hữu của bên mua.', related: 'Consideration mix', review: 'Hồ sơ Disney / Pixar' } },
      { type: 'choice', id: 'h_d_alt', q: '🔮 Alternative History: Nếu bạn là cố vấn, cơ chế nào quan trọng nhất để bảo vệ giá trị sau thương vụ?', grade: true, best: [0], opts: [
        { t: 'Trao quyền lãnh đạo sáng tạo cho đội ngũ Pixar và bảo vệ văn hoá của họ', out: 'Phù hợp với những gì đã thực sự diễn ra (lãnh đạo Pixar nắm vai trò chủ chốt) — Verified Fact.', fx: {} },
        { t: 'Sáp nhập Pixar hoàn toàn vào quy trình của Disney ngay lập tức', out: '[Alternative History] Trong kịch bản giả định này, nhân tài chủ chốt có nguy cơ rời đi.', fx: {} },
      ] },
    ],
    rewards: { xp: 40, rep: 1, items: ['artifact_lamp'] },
  },
  {
    id: 'h_rjr', title: 'Hồ sơ: KKR / RJR Nabisco (1988)', kind: 'case', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: 'rjr_kkr',
    summary: 'LBO lịch sử, bidding war và quản trị. Giá danh nghĩa khác giá trị thực.',
    steps: [
      { type: 'say', lines: [['ngoc', 'Năm 1988: ban lãnh đạo RJR Nabisco đề xuất MBO, KKR đưa ra đề nghị cạnh tranh, mở ra một cuộc chiến trả giá. KKR thắng với khoảng 109 USD/cổ phiếu — dù đề nghị cuối của ban lãnh đạo khoảng 112 USD. Vì sao?']] },
      { type: 'choice', id: 'h_r_persp', q: 'Góc nhìn của bạn:', opts: [
        { t: 'Cố vấn cho Special Committee của HĐQT', out: 'Nhiệm vụ: tối đa hoá giá trị cho cổ đông, công bằng giữa các bên.', v: { persp: 'board' } },
        { t: 'Thành viên đội KKR', out: 'Nhiệm vụ: thắng thương vụ mà vẫn đạt lợi nhuận mục tiêu.', v: { persp: 'kkr' } },
      ] },
      { type: 'doc', title: '[Simulation Assumption] Cấu trúc hai đề nghị (USD/cổ phiếu)', table: { head: ['Đề nghị', 'Tiền mặt', 'Chứng khoán (mệnh giá)', 'Thị giá chứng khoán ước tính'], rows: [['Ban lãnh đạo — 112', 84, 28, '75% mệnh giá'], ['KKR — 109', 90, 19, '95% mệnh giá']] }, body: 'Các con số chia tách tiền mặt/chứng khoán ở đây là GIẢ ĐỊNH MÔ PHỎNG để minh hoạ bài học, không phải cấu trúc lịch sử chính xác.' },
      { type: 'num', id: 'h_r_m', concept: 'governance', q: 'Giá trị thực ước tính của đề nghị Ban lãnh đạo (USD/cp)?', a: RJR.M, tol: 0.01, unit: 'USD', fb: { vi: '84 + 28 × 75% = 105.', en: 'Value non-cash consideration at fair value, not face value.', why: 'Chứng khoán chất lượng thấp giao dịch dưới mệnh giá.', impl: 'Headline price ≠ value.', related: 'PIK, Junk bonds', review: 'Hồ sơ RJR Nabisco' } },
      { type: 'num', id: 'h_r_k', concept: 'governance', q: 'Giá trị thực ước tính của đề nghị KKR (USD/cp)?', a: r2(RJR.K), tol: 0.01, unit: 'USD', fb: { vi: '90 + 19 × 95% = 108,05.', en: 'Higher cash and better-quality securities.', why: 'Tính tương tự.', impl: 'Trong mô phỏng, đề nghị KKR "thấp hơn" lại có giá trị cao hơn.', related: 'Bid evaluation', review: 'Hồ sơ RJR Nabisco' } },
      { type: 'quiz', id: 'h_r_conf', concept: 'governance', q: 'Vấn đề quản trị cốt lõi của một Management Buyout?', opts: ['Ban lãnh đạo không biết định giá', 'Xung đột lợi ích: ban lãnh đạo có thông tin nội bộ và vừa đại diện cổ đông bán, vừa là người mua — cần special committee độc lập', 'MBO luôn bất hợp pháp'], a: 1, fb: { vi: 'Special committee độc lập và quy trình công bằng bảo vệ cổ đông.', en: 'MBOs create agency conflicts and information asymmetry; independent committees mitigate them.', why: 'Bên mua biết nhiều hơn bên bán.', impl: 'Mọi take-private có sự tham gia của ban lãnh đạo đều cần cơ chế này.', related: 'Fiduciary duty', review: 'Hồ sơ RJR Nabisco' } },
      { type: 'quiz', id: 'h_r_label', concept: 'source_labels', q: '"Lợi nhuận của nhà đầu tư trong LBO RJR Nabisco kém so với kỳ vọng" thuộc nhãn nào trong hồ sơ này?', opts: ['Verified Fact', 'Analyst Interpretation', 'Alternative History'], a: 1, fb: { vi: 'Đây là đánh giá phổ biến nhưng phụ thuộc phương pháp đo lường — được gắn nhãn Analyst Interpretation.', en: 'Performance judgements depend on methodology — label as interpretation.', why: 'Kết luận về hiệu quả cần dữ liệu và chuẩn so sánh.', impl: 'Giữ kỷ luật nguồn trong mọi phân tích.', related: 'Research protocol', review: 'Đại Sảnh' } },
    ],
    rewards: { xp: 40, rep: 1, items: ['artifact_tobacco'] },
  },
  {
    id: 'h_keyrus', title: 'Keyrus Deal Academy: Vuealta APAC Anaplan Practice', kind: 'case', chapter: 'intern', minChapter: 'intern', giver: 'ngoc', loc: 'hall', case: 'keyrus_vuealta',
    summary: 'Định giá một practice tư vấn EPM bằng mô hình năng lực consultant (dữ liệu hư cấu).',
    steps: [
      { type: 'say', lines: [['ngoc', 'Tháng 1/2026, Keyrus Group công bố mua mảng Anaplan practice APAC của Vuealta Group — khoảng 20 chuyên gia Anaplan tại Singapore. Giá không công bố.'], ['ngoc', 'Lưu ý: đây là mua một practice, không phải toàn bộ công ty. Mọi con số dưới đây là dữ liệu tổng hợp hư cấu.']], terms: ['Utilization', 'Realization Rate', 'Earn-out'] },
      { type: 'model', id: 'h_k_model', model: 'consult', concept: 'consulting_metrics', goal: { text: 'Khám phá: utilization tăng 5 điểm % thay đổi EBITDA thế nào? Đặt lại 20 người, 72%, 160 USD, 92%, 18% để tiếp tục.', check: (o, v) => v.n === 20 && v.u === 72 && v.rate === 160 && v.real === 92 && v.attr === 18 } },
      { type: 'num', id: 'h_k_rev', concept: 'consulting_metrics', q: 'Doanh thu năm (triệu USD, 2 chữ số thập phân)?', a: r2(CONS.revenue / 1e6), tol: 0.01, unit: 'triệu USD', traps: [{ v: 4.15, why: 'Bạn quên realization rate 92% (25.920 giờ × 160 = 4,15 triệu trước chiết khấu).' }],
        fb: { vi: '20 × 1.800 × 72% = 25.920 giờ; × 160 × 92% ≈ 3,82 triệu USD.', en: 'Revenue = consultants × hours × utilization × bill rate × realization.', why: 'Mô hình theo năng lực (capacity-driven).', impl: 'Doanh thu tư vấn bị giới hạn bởi số người và thời gian.', related: 'Consulting Academy', review: 'Keyrus Deal Academy' } },
      { type: 'num', id: 'h_k_ebitda', concept: 'consulting_metrics', q: 'EBITDA (triệu USD, 2 chữ số thập phân)?', a: r2(CONS.ebitda / 1e6), tol: 0.01, unit: 'triệu USD', fb: { vi: `Gross profit ≈ ${r2(CONS.grossProfit / 1e6)}; trừ SG&A ${r2(CONS.sga / 1e6)} và attrition ${r2(CONS.attritionCost / 1e6)} → ≈ ${r2(CONS.ebitda / 1e6)} triệu USD.`, en: 'EBITDA after delivery cost, SG&A and attrition-driven replacement cost.', why: 'Attrition là chi phí thật của mô hình con người.', impl: 'Mỗi điểm % attrition giảm biên lợi nhuận.', related: 'Attrition, Retention', review: 'Keyrus Deal Academy' } },
      { type: 'quiz', id: 'h_k_risk', concept: 'consulting_metrics', q: 'Rủi ro lớn nhất khi mua một practice tư vấn 20 người?', opts: ['Hàng tồn kho', 'Mất nhân sự chủ chốt và quan hệ khách hàng đi theo họ — "tài sản về nhà mỗi tối"', 'Giá máy móc'], a: 1, fb: { vi: 'Trong professional services, tài sản chính là con người và quan hệ khách hàng.', en: 'People and client relationships are the core assets in consulting M&A.', why: 'Không có nhà máy hay bằng sáng chế.', impl: 'Cấu trúc thương vụ phải có cơ chế giữ chân.', related: 'Earn-out, Retention', review: 'Keyrus Deal Academy' } },
      { type: 'choice', id: 'h_k_struct', q: '[Simulation] Cấu trúc giá phù hợp nhất cho practice này?', grade: true, best: [1], opts: [
        { t: '100% tiền mặt trả ngay', out: 'Rủi ro: người bán không còn động lực ở lại sau closing.', fx: {} },
        { t: 'Trả trước phần lớn + earn-out gắn với giữ chân nhân sự và doanh thu 2 năm', out: 'Chia sẻ rủi ro và gắn lợi ích — phổ biến trong M&A dịch vụ chuyên nghiệp.', fx: {} },
        { t: '100% earn-out', out: 'Người bán khó chấp nhận; cũng có thể tạo động lực ngắn hạn sai lệch.', fx: {} },
      ] },
      { type: 'quiz', id: 'h_k_label', concept: 'source_labels', q: 'Một bài blog viết "Keyrus trả 6 triệu USD cho practice". Theo nguồn công khai, bạn gắn nhãn gì?', opts: ['Verified Fact', 'Không được coi là fact — giá không được công bố; chỉ có thể là ước tính chưa xác minh', 'Analyst Interpretation đã xác minh'], a: 1, fb: { vi: 'Thông cáo của Keyrus không công bố giá. Không được bịa hay trích lại con số chưa xác minh như sự thật.', en: 'Undisclosed terms must never be presented as fact.', why: 'Nguyên tắc nghiên cứu: ưu tiên nguồn sơ cấp.', impl: 'Uy tín của analyst nằm ở kỷ luật nguồn.', related: 'Research protocol', review: 'Keyrus Deal Academy' } },
    ],
    rewards: { xp: 45, rep: 1, items: ['artifact_epm'] },
  },
];

QUESTS.push(...CAREER_QUESTS, ...CONSULTING_QUESTS, ...IM_QUESTS, ...INDUSTRY_QUESTS, ...TRANSITION_QUESTS, ...ENDGAME_QUESTS, ...CRISIS_QUESTS, ...SUCCESSION_QUESTS, ...CASE_QUESTS, ...CASE2_QUESTS, ...REPLAY_QUESTS);
export const QUEST_BY_ID = Object.fromEntries(QUESTS.map((q) => [q.id, q]));

// Diagnostic assessment (optional, at new game)
export const DIAGNOSTIC = [
  { id: 'd1', concept: 'profit', q: 'Doanh thu 100, chi phí 70. Lợi nhuận?', opts: ['30', '170', '70'], a: 0 },
  { id: 'd2', concept: 'compounding', q: '100 với lãi 10%/năm sau 2 năm (lãi kép)?', opts: ['120', '121', '110'], a: 1 },
  { id: 'd3', concept: 'income_statement', q: 'EBITDA trừ D&A bằng?', opts: ['Net Income', 'EBIT', 'Gross Profit'], a: 1 },
  { id: 'd4', concept: 'ev_equity', q: 'EV 500, Net Debt 100. Equity Value?', opts: ['600', '400', '500'], a: 1 },
  { id: 'd5', concept: 'dcf', q: 'FCFF nên được chiết khấu bằng?', opts: ['Cost of equity', 'WACC', 'Lãi suất tiền gửi'], a: 1 },
  { id: 'd6', concept: 'lbo', q: 'Trong LBO, tăng đòn bẩy (giữ nguyên các yếu tố khác) thường làm IRR...', opts: ['Tăng nhưng rủi ro cao hơn', 'Giảm', 'Không đổi'], a: 0 },
];

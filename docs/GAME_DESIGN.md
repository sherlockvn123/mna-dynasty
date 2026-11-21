# Game Design Document: M&A Dynasty, The Heiress of Capital

## Pillars
1. **Finance as a tool, not an exam.** Players run a DCF because they need to decide whether to buy something.
2. **Decisions persist.** Flags, relationships, reputation, ethics and macro state carry forward across chapters.
3. **Competence ≠ XP.** Promotions use mission competence scores and reputation. Mastery is tracked separately with spaced repetition.
4. **Cozy world, serious stakes.** Pastel chibi life-sim presentation around real professional judgment.

## Core loop
Explore → meet characters (❗ markers) → discover an opportunity → learn (bilingual term cards) → analyze (models, numbers, sorting, debugging) → decide (choices, negotiation, investigation) → face the consequences (outcome step) → rewards (competence ring, items, achievements, relationships) → advance (chapters, career ladder, New Game+).

## Narrative architecture (vertical slice)
| Chapter | Ages | Places | Main beats |
|---|---|---|---|
| 1 Nhà Đầu Tư Nhí | 7–10 | Phòng ngủ, Vườn, Tiệm bánh | Dinner lesson → lemonade pricing → (optional) piggy-bank compounding → **The Bakery Acquisition** (due diligence, payback, multiples, hidden capex, negotiation with non-price terms, walking away) |
| 2 Nhà Tài Chính Tương Lai | 18–21 | Đại học, CLB Tài chính | Three statements with Prof. Bảo → first DCF with Vy → networking night (rapport system → referral) → case competition with rival Khoa (integrity dilemma) |
| 3 Thực Tập Sinh | 21–22 | Khu Tài chính, Lotus Capital, Đại Sảnh | Demanding MD → model debugging → first deal (trading comps) → impossible deadline → credit stealing → MNPI dilemma → Hall of Legendary Deals cases → internship review (return offer or not) |
| 4 Nghề Nghiệp | 22–23 | Career offices | Career choice → track-specific mission → rate shock → recession → performance review → timeline complete → New Game+ |

Consequences that carry across chapters include these:
- Exploring the oven in the bakery makes the capex finding free during due diligence.
- Overpaying, or skipping the oven check, shows up in the outcome.
- A networking referral changes the internship dialogue.
- Cheating at the competition costs trust with Prof. Bảo.
- Tipping Khoa off about MNPI means no return offer and a compliance breach.
- Without a return offer, each career mission opens with a technical interview.
- Khoa's trust and respect decide whether he shares true gross-margin data later, when he is a founder in the VC track.

## Characters
Protagonist Linh (renameable), shown as a recognizable chibi at 4 ages. NPCs:
- Family: Bố Minh (M&A MD), Mẹ Lan (PE Partner); they deliberately disagree on valuation.
- Childhood: Cô Hạnh (bakery owner).
- University: GS. Bảo (Accounting/Finance), Vy (club president), Khoa (rival, later founder).
- Internship: Victor Lâm (demanding MD), Đức (associate under pressure), Mai (alumni analyst).
- Economics and history: TS. Thu Hà (chief economist), Bà Ngọc (Hall archivist).
- Career mentors: Sophia Ngô (PE), Ken Trịnh (VC), Anh Hùng (Corp Dev).

Each NPC has a look, a bio, expertise, a schedule by chapter and time slot, contextual lines, and trust and respect scores.

## Career tracks (preview missions)
- **IB:** buyer list, healthcare KPIs, certainty-adjusted bid evaluation (the highest headline bid is *not* the best), sell-side negotiation.
- **PE:** interactive LBO (sources & uses, cash sweep, coverage warnings), management DD, IC decision under a 20% hurdle (8x clears, 9x fails).
- **VC:** runway, AI gross margins, option-pool shuffle, 1x non-participating waterfall, term-sheet negotiation with a former rival.
- **Corp Dev:** synergy taxonomy (including dis-synergies), accretion/dilution and breakeven synergies, "accretive ≠ value-creating", 100-day integration plan.

## Visual design system
Palette tokens: pink `#f6a9bf`, ivory `#fffaf0`, lavender `#c9b8ec`, sage `#93b39a` and gold `#e6c36a`. Arial is used throughout. Rounded sheets, soft shadows, confetti, chimes generated with WebAudio, a ticker, glowing pedestals, a bobbing idle, swinging walk cycles and blinking eyes. Scenes change with age: the bedroom wall goes pink → lavender → ivory, and the desk gets a monitor.

## Educational curriculum (slice)
Revenue/expense, profit vs cash, pricing and elasticity, compounding, opportunity cost, payback, multiples, due diligence and capex, BATNA and reservation value, the income statement, EV ↔ equity, DCF (FCFF/WACC consistency, TV share), business-model moats and thesis falsifiability, company profiles, model integrity, comps vs precedents, workload and influence, MNPI and compliance, buyer universes, deal certainty, LBO and IRR/MOIC, SaaS and AI metrics, cap tables and liquidation preferences, accretion/dilution and synergies, CAPM/WACC under rate shocks, operating leverage and covenants, stock consideration, MBO governance, consulting capacity economics and earn-outs, and source labeling discipline.

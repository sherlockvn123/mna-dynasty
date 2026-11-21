# Architecture & key decisions

## Decision 1: zero-dependency ES modules instead of React + Vite + Phaser

The development machine has no Node.js or Python. Rather than block on installing a toolchain, the vertical slice is written in modern JavaScript ES modules with `// @ts-check`-friendly code and no third-party runtime. The benefits:

- Runs on any static host and works offline on iPhone (PWA).
- No dependency supply chain, no API keys and no paid services.
- Every module is framework-agnostic. `engine/*` and `content/*` contain no DOM code, so a later port to React/TypeScript/Vite (and Phaser for scenes) can reuse them unchanged. Only `ui/*` would be rewritten.

The 2D world uses SVG with a custom loop instead of Phaser. A `requestAnimationFrame` loop drives movement, with a timer fallback for when rAF is throttled. This is enough for tap-to-move, NPC idle and wander, depth sorting and hotspots. Phaser is worth adopting once there is tile-based navigation, pathfinding or sprite atlases.

## Decision 2: content is data, answers are computed

Missions are plain objects in `content/quests.js`. Each numeric answer is computed by `engine/finance.js` when the module loads, so content and math cannot drift apart. `tests/game.test.js` then re-derives every key answer by hand as an independent check.

### Quest schema

```js
{
  id, title, kind: 'main'|'mentor'|'deal'|'politics'|'network'|'career'|'macro'|'case',
  chapter: 'child'|'uni'|'intern'|'career', minChapter?, career?: 'ib'|'pe'|'vc'|'cd',
  giver: npcId | '@mentor' | null, loc: locationId | '@office', obj?: hotspotId,
  req?: [questId], reqAny?: [questId], reqCareerMission?: true, optional?, age?, case?,
  steps: [Step], rewards: Effects
}
```

### Step types (`ui/mission.js`)

| type | purpose | graded |
|---|---|---|
| `say` | Dialogue lines `[speaker, text]` | – |
| `quiz` | Multiple choice with "Not sure" flag and 8-part feedback | ✔ |
| `num` | Numeric answer with tolerance, VI/EN number parsing, trap explanations | ✔ |
| `sort` | Categorize items (tap chips) | ✔ (partial credit) |
| `model` | Interactive model with sliders and an optional goal check | – |
| `choice` | Decision with consequences (`fx`) and vars, optionally graded (`best`) | optional |
| `investigate` | Limited due-diligence picks; items found by exploring the scene are free | ✔ |
| `negotiate` | Negotiation Engine UI (offer, non-price issues, trust, final offer, walk away) | via outcome |
| `debug` | Find the broken formulas in a model | ✔ (penalizes false positives) |
| `doc` | In-mission document or table | – |
| `outcome` | `eval(rt, S, score)` turns accumulated decisions into narrative, effects and a score | ✔ |

Any step can take `when(rt, S)` for branching (perspective choices, relationship-gated information, interview steps for players without an offer). It can also take `terms: [...]`, which shows bilingual glossary cards the first time a term appears.

### Effects (`fx`)

`{ xp, rep, credits, stats:{ethics, wellbeing…}, flags:{}, rel:{npc:{trust, respect}}, items:[], ach:[], macro:{}, career:{promote:n} }`

## State and saves

- **Account (shared across timelines):** collectibles (`items`), achievements, glossary, cases read, mastery (`qstats`), settings, pace, and the timeline index.
- **Timeline (independent save `tl:<id>`):** chapter, age, location, time slot, flags, `questsDone` with competence scores, stats, relationships, outfit and decor, career and rank, macro state, log, and the graduation `checkpoint` used for New Game+.
- Saves are debounced and flushed immediately on quest completion, on `visibilitychange` and on `pagehide`. Data is written to IndexedDB and mirrored to localStorage.
- `completeQuest` is idempotent, so a reload or double tap can't duplicate rewards.
- Promotions come from **competence scores and reputation**, not XP. Collectibles never unlock promotions.

## Learning engine

Every graded step records an attempt in a Leitner box (0–5) at the account level. A wrong or "Not sure" answer puts the question back in the review queue right away. Correct answers move up a box and are spaced out to 1, 2, 4, 8 and 16 days. Mastery per concept is the average box level, shown in the Skills panel separately from XP. Review gives no XP.

## Macro → deal transmission

The rate-shock mission walks the full chain: risk-free rate → CAPM cost of equity → WACC (with the debt tax shield) → DCF EV change → LBO debt capacity and IRR → recommendation. The recession mission covers revenue and margin → EBITDA (operating leverage) → leverage covenant → equity cure → action. Both write `tl.macro`, which changes the world (news ticker in the Financial District).

## Historical accuracy

`content/cases.js` tags every statement with one of these labels: `fact`, `interp`, `sim`, `alt` or `pending`. Tests check that every statement has a valid label, that every case has a source link, and that the Keyrus case does not present an undisclosed price as fact. Keyrus items that have not been checked against a primary source are tracked as **Pending Research** and are not playable as history.

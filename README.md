# M&A Dynasty: The Heiress of Capital — Ultimate Edition

Game mô phỏng cuộc đời & sự nghiệp tài chính (mobile-first PWA). Tiếng Việt là ngôn ngữ chính, giữ nguyên thuật ngữ chuyên môn tiếng Anh. Font Arial cho toàn bộ ứng dụng.

This repository contains the **first playable vertical slice**: childhood → university → investment-bank internship → career selection (IB / PE / VC / Corp Dev) → macro shocks → performance review → New Game+.

## Chơi ngay trên web

▶ **https://sherlockvn123.github.io/mna-dynasty/** — chạy trên điện thoại và máy tính, có thể "Thêm vào màn hình chính" như một app (PWA). Bộ test: https://sherlockvn123.github.io/mna-dynasty/tests.html

Bản lưu game nằm trong trình duyệt của từng thiết bị (không đồng bộ giữa các máy). Mọi công ty, số liệu và quỹ đối chiếu trong game là mô phỏng giáo dục (Simulation Assumption), không phải tư vấn đầu tư.

## Chạy game trên máy

Không cần cài đặt gì. Không có dependency, không có build step. Game chạy trên mọi web server tĩnh.

**Windows (đi kèm sẵn):**

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 -Port 5173
```

Mở `http://localhost:5173/` để chơi, và `http://localhost:5173/tests.html` để chạy bộ test tự động.

**Bất kỳ máy nào có Python hoặc Node:** `python -m http.server 5173` hoặc `npx serve .`

> ES modules không chạy được từ `file://`, nên bắt buộc phải dùng server.

## Chơi trên iPhone

Deploy thư mục này lên bất kỳ host tĩnh HTTPS nào (GitHub Pages, Netlify, Cloudflare Pages, Vercel static). Mở bằng Safari → Share → **Add to Home Screen**. Game chạy toàn màn hình, offline sau lần tải đầu (service worker), và lưu tiến trình trên máy (IndexedDB + localStorage).

## Cấu trúc

```
index.html            App shell (PWA meta, Arial, safe-area)
manifest.webmanifest  PWA manifest
sw.js                 Offline service worker
serve.ps1             Zero-dependency local server (PowerShell)
tests.html            Browser test runner (409 tests)
icons/icon.svg
src/
  main.js             Boot: load save → title → app
  styles.css          Design system (pastel tokens, Arial everywhere)
  engine/
    finance.js        Financial Calculation Engine (pure, unit-tested)
    negotiation.js    Negotiation Engine (reservation, issues, trust, BATNA)
    fundsim.js        10-year fund simulation, 3 scenarios (Fund I classic cycle; Fund II boom → credit crisis with LP squeeze / rescue financing / continuation vehicle events; Fund III higher-for-longer → stagflation with value creation plans, AI disruption and a refinancing wall / NAV loan)
    league.js         Fund league table: your funds across all timelines vs a fictional peer universe (per vintage; TVPI, IRR, DPI₇, KS-PME; pooled; J-curve vs peer band)
    lenses.js         Per-lens mastery for replays (coverage × quality, accuracy, next replay, Bậc thầy góc nhìn) + 5-question lens review sessions
    store.js          State: account + timelines, quests, careers, rewards, learning, NG+
    save.js           IndexedDB persistence with localStorage mirror
  content/            Data-driven content (no UI code)
    quests.js         25 core missions + diagnostic; answers computed by finance.js
    quests_career.js  8 additional career missions (2 per track)
    quests_consulting.js Consulting career (3 missions)
    quests_im.js      Investment Management career (3 missions)
    quests_transition.js 8 career-switch paths + post-switch review
    quests_crisis.js  8 state-triggered crises (macro + firm-level)
    quests_succession.js Successor arc (3 branches → governance → handover → epilogue)
    quests_endgame.js Chapter 5 — The Capital Architect (9 endgame quests incl. Fund I & II simulations)
    quests_industry.js 7 Industry Mastery Academy missions (A–F framework)
    sectors.js        Sector metadata, specialization & credibility rules
    characters.js     Protagonist looks by age, 14 NPCs with schedules & dialogue
    locations.js      11 scenes, hotspots, in-world documents
    careers.js        6 career tracks: ladders, promotion criteria, mobility matrix
    cases.js          Hall of Legendary Deals case pack + Keyrus research tracker
    cases_extra.js    18 more case files (all playable)
    quests_cases.js   8 extended case missions
    quests_cases2.js  10 archive case missions (LinkedIn … Amazon/Anthropic) + Hall Master
    quests_replay.js  Multi-perspective replays, part 1: 8 deals × 5 lenses (IB, Corp Dev, PE, Consulting, Public Investor)
    quests_replay2.js Replays part 2: the other 13 Hall files × 5 lenses (compact deal() builder) — all 21 files covered
    models.js         Interactive models: core (DCF, LBO, cap table, A/D, consulting) +`n                      sector Workbench (healthcare, solar project finance, real estate,`n                      SaaS, AI) with sensitivity grids and integrity checks
    items.js          Outfits, decor, artifacts, certificates, achievements
    glossary.js       Bilingual glossary (VI + EN)
  ui/
    app.js            HUD, nav, overlays, NPC dialogue, rewards, chapter cinematics, onboarding
    world.js          Living world: tap-to-move, NPC wander, depth sort, hotspots
    art.js            Original procedural scene art (SVG)
    chibi.js          Original procedural chibi character renderer (SVG)
    mission.js        Mission runner (11 step types) + spaced-repetition review
    charts.js         Dependency-free SVG charts (J-curve; J-curve comparison vs peer Q1–Q3 band), tooltip, legend, table view
    lpReport.js       LP report export: self-contained HTML letter (KPIs, J-curve SVG, portfolio, crisis decisions, method) — view/print or download
    panels.js         Quests, inventory, relationships, skills, map, glossary, review,
                      multiverse, hall, workbench, career, log, settings
tests/
  runner.js           Minimal test runner
  finance.test.js     Formula tests (hand-computed expectations)
  fundsim.test.js     Fund simulation rules, identities and calibration locks
  game.test.js        Content integrity, answer cross-checks, negotiation,
                      full playthrough + save/load + New Game+
docs/
  GAME_DESIGN.md      Game design document (narrative, systems, curriculum)
  ARCHITECTURE.md     Technical architecture & decisions, content schema
  BACKLOG.md          Remaining backlog & milestones
```

## Trạng thái kiểm thử

`tests.html`: **409/409 passed** — finance formulas, content schema integrity, independent answer checks, negotiation engine, number parsing, a full scripted playthrough (child → career → review) with save/load round-trip, duplicate-reward protection and New Game+ branching.

The game was also played by hand at an iPhone-sized viewport (375×812): onboarding, movement, NPC dialogue, sort / number / model / investigate / negotiation steps, rewards, chapter transitions, Hall case viewer, Keyrus mission, career selection, LBO workbench, performance review, New Game+ branch into VC, and reloading the page with two timelines saved.

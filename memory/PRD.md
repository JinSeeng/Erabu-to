# PRD — 選ぶと、 (Erabu to...) / formerly 因果 (Inga)

## Original problem statement
An interactive first-person horror experience inspired by traditional Japanese
folklore and yokai legends. The player travels a peaceful Japanese landscape
that gradually reveals a supernatural reality beneath it. Choices branch the
journey. A traditional emaki scroll visually records narrative progression from
peaceful → horrifying. A journal collects folklore. Yokai are placed
authentically to their legends.

## Architecture
- **Backend** (FastAPI, `/app/backend/server.py`):
  - `POST /api/scene/image` — Gemini Nano Banana sumi-e art, cached in Mongo `scene_images`
  - `GET /api/scene/image/{scene_id}` — cache lookup (404 = not yet generated)
  - `POST /api/telemetry`
- **Frontend** (React, `/app/frontend/src`):
  - `game/storyData.js` — SCENES graph (26 scenes, 14 endings) + HIDDEN_TRUTH, ALL_ENDINGS, ALL_YOKAI_JOURNAL_IDS
  - `game/useGameStore.js` — localStorage (`inga.save.v1`) store; cross-run reroutes (kuchisake, village_return), gifts, hidden-truth gating
  - `game/useAudio.js` — procedural drone per stage + per-scene ambience (cicadas/water/footsteps/wind/hearth/bell/silence) via SCENE_AMBIENCE
  - `components/game/TitleScreen.jsx` — title 選ぶと、/ "Erabu to… — if you choose…", EndingTree
  - `components/game/EndingTree.jsx` — branching tree map of all routes/endings + Hidden Truth button
  - `components/game/GameView.jsx`, `SceneCanvas`, `EmakiScroll`, `Journal`, `ChoiceButton` (gift-gated choices), `EndingScreen`

## Core requirements (static)
1. Beauty first, wrongness gradual — sumi-e aesthetic
2. Choices matter — branches lead to distinct endings
3. Scroll = narrative progression, NOT health
4. Yokai placed authentically to folklore
5. Journal fills only with what the player has seen
6. Procedural audio, no external assets
7. localStorage persistence, no accounts

## What's been implemented
- 2026-02: Vertical slice — main road / mountain branches, 5 endings, Gemini art, emaki scroll, drone audio, journal, persistence
- 2026-03: Act 2 village_return (reroute on run ≥ 2), Kuchisake-onna, journal portraits
- 2026-06 round 1 (tested 7/7): build fixes, Ending Tree, Zashiki gift, third path, per-scene ambience, Hidden Truth, title change
- 2026-06 round 2 (tested 11/11, `/app/test_reports/iteration_2.json`):
  - Title: only 選ぶと、 + "if you choose…" (romaji + seal removed)
  - Ending Gallery (red hanko seals) restored on title; Hidden Truth button lives there
  - Journal opens from title; two tabs: Lore / Threads (Ending Tree, English labels) — `Journal.jsx`, `EndingTree.jsx`
  - Game layout: compact story panel, choice grid adapts to 1/2/3 options, hide-UI eye toggle
  - Emaki rebuilt (`EmakiScroll.jsx`, `EmakiPanel.jsx`): one AI-generated emakimono panel per visited scene (`scroll_<sceneId>` cached, backend `style: "scroll"` prompt), palette darkens per stage and brightens for "spared" endings; vertical on ≥lg, horizontal below; click to unroll full overlay; shown on ending screen. SVG ink fallback when art unavailable.
  - Kuchisake-onna now rare: runCount ≥ 1, shrine endings found, not last run, 25% roll (`kuchisakeLastRun` in store)

## Known blockers
- Emergent LLM key budget exceeded → scene art + emaki panels fail to generate (17/27 scenes cached; 0 scroll panels cached). User must top up Universal Key balance. Pre-generation of missing art deferred by user.

## Backlog
- **P2** Environmental micro-changes on revisit
- **P2** Vertical writing (tategaki) ending texts
- **P3** Custom scroll art per player path
- **P3** Split storyData.js by branch if it grows further

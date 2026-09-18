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
- 2026-03: Act 2 village_return (reroute on run ≥ 2), Kuchisake-onna (main road taken twice), journal portraits
- 2026-06 (this session, tested 7/7 via testing agent):
  - Fixed compile errors left by previous session (storyData object structure, duplicate imports)
  - Ending Tree map on title (`EndingTree.jsx`) replacing flat gallery
  - Zashiki-warashi encounter → persistent `paper_crane` gift (survives resets) → alt ending in silk hut; gift badge in toolbar
  - Third path: rice paddies → Nurikabe → farmhouse (Tenjō-name) → 3 endings
  - Scene-specific ambience layer in audio engine
  - Hidden Truth ending (貴方は誰) unlocked at 14/14 endings + 9/9 yokai, triggered from title tree
  - Title changed to 選ぶと、 with English subtitle

## Known blockers
- Emergent LLM key budget exceeded → new scene art fails to generate (17/27 scenes cached in Mongo). User must top up Universal Key balance.

## Backlog
- **P2** Environmental micro-changes on revisit
- **P2** Vertical writing (tategaki) ending texts
- **P3** Custom scroll art per player path
- **P3** Split storyData.js by branch if it grows further

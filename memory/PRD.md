# PRD — 因果 (Inga) / 選ぶと、 (Erabu to...)

## Original problem statement
An interactive first-person horror experience inspired by traditional Japanese
folklore and yokai legends. The player travels a peaceful Japanese landscape
that gradually reveals a supernatural reality beneath it. Choices branch the
journey. A traditional emaki scroll visually records narrative progression from
peaceful → horrifying. A journal collects folklore. Yokai are placed
authentically to their legends (Kappa near water, ghost bride at abandoned
shrine, Jorogumo in a lonely silk-webbed hut).

## Architecture
- **Backend** (FastAPI, `/app/backend/server.py`):
  - `POST /api/scene/image` — Gemini Nano Banana (gemini-3.1-flash-image-preview)
    generation of sumi-e horror art, cached in MongoDB `scene_images` by scene_id
  - `GET /api/scene/image/{scene_id}` — cached lookup
  - `POST /api/telemetry` — anonymous ending/path metrics
- **Frontend** (React, `/app/frontend/src`):
  - `App.js` — screen switch (title/game/ending), audio init on first pointerdown
  - `game/storyData.js` — story graph (11 nodes, 5 endings)
  - `game/useGameStore.js` — localStorage-backed state, useSyncExternalStore
  - `game/useAudio.js` — Web Audio procedural drone/wind/tremolo engine keyed to stage
  - `game/imageService.js` — fetch + memory-cache generated art
  - `components/game/TitleScreen.jsx` — kanji cover, hanko seal, mute, hard reset
  - `components/game/GameView.jsx` — layered scene view, narration reveal, choices
  - `components/game/SceneCanvas.jsx` — image + fog layers + stage color grading
  - `components/game/EmakiScroll.jsx` — unrolling horizontal scroll SVG artwork,
     figure disappears at "unsettling", ink spatter at "horrifying"
  - `components/game/Journal.jsx` — washi notebook modal, hanko-stamped entries
  - `components/game/ChoiceButton.jsx` — kanji stamp + text
  - `components/game/EndingScreen.jsx` — kanji seal ending, restart

## User persona
Player of atmospheric narrative horror (Silent Hill / Ju-on / walking-sim
audience) drawn to Japanese folklore and slow-burn dread over jump scares.

## Core requirements (static)
1. Beauty first, wrongness gradual — restrained sumi-e aesthetic
2. Choices matter — branches lead to distinct endings
3. Scroll = narrative progression, NOT health
4. Yokai placed authentically to their folklore
5. Journal fills only with what player has actually seen
6. Procedural audio, no external audio assets
7. localStorage persistence, no accounts

## What's been implemented (2026-02)
- Full vertical slice: 6 scenes + 5 endings across 2 branches
  - Main road → Torii shrine → Ghost Bride ending (Hanako) or Twilight Home
  - Mountain → Kappa bridge → River Gratitude or Underwater Sleep
  - Mountain → Silk Hut → Jorogumo Binding
- Gemini Nano Banana AI-generated sumi-e art per scene, cached in MongoDB
- Emaki scroll with 5 stages: 静か → 違和 → 不穏 → 歪み → 怪 with progressive
  visual degradation (figure vanishes, ink spatter appears)
- Procedural Web Audio drone that shifts frequency/dissonance per stage
- Journal (手帖) that records folkloric entries (Hitogata, Kappa, Hanako, Jorogumo)
- Multi-run persistence: journal + seen scenes survive resets
- Fully working end-to-end (verified via screenshots on preview URL)

## Backlog
- **P1** Extend story: additional yokai (Kuchisake-onna, Zashiki-warashi, Tenjo-name)
- **P1** Second act — village returning to reveal what changed
- **P2** Achievement/ending gallery on title screen
- **P2** Journal sketches (generated sumi-e portraits of each yokai)
- **P2** Environmental micro-changes on revisit (moved objects, new distant figures)
- **P2** Vertical writing mode (tategaki) narrative option for full-screen ending texts
- **P3** Custom scroll art generation per player's exact choice path

## Next tasks
See "Next Action Items" in the finish summary.

import { useSyncExternalStore } from "react";
import { SCENES, START_SCENE, STAGE_INDEX, STAGES, HIDDEN_TRUTH, ALL_ENDINGS, ALL_YOKAI_JOURNAL_IDS } from "./storyData";

const KEY = "inga.save.v1";

function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    screen: "title", // title | game | ending
    sceneId: START_SCENE,
    history: [],
    choicesTaken: [],
    journal: [], // list of journal entry ids
    ending: null,
    stage: "peaceful",
    stageProgress: 0, // 0..1 within scroll (0-1 across STAGES)
    seenScenes: [],
    audioMuted: false,
    // Cross-run persistent metadata:
    unlockedEndings: [], // ids of ending scenes reached across ALL runs
    runCount: 0, // number of completed runs
    mainRoadTaken: 0, // how many times main-road branch was chosen (across runs)
    sawKuchisakeThisRun: false,
    gifts: [], // items carried across runs, e.g. "paper_crane"
    metZashiki: false, // one-time flag: has the child been met at least once
  };
}

let state = loadState();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(l) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function getSnapshot() {
  return state;
}

const actions = {
  goToScreen(screen) {
    state = { ...state, screen };
    emit();
  },
  chooseOption(choice) {
    const currentScene = SCENES[state.sceneId];
    let nextId = choice.to;

    // Choices with `requires` need the player to have that gift; skip if not owned.
    if (choice.requires && choice.requires !== "no_gift" && !state.gifts.includes(choice.requires)) {
      return;
    }
    if (choice.requires === "no_gift" && state.gifts.length > 0) {
      return;
    }

    // --- Dynamic re-routing based on cross-run history ---
    if (
      (nextId === "ending_hakumei" || nextId === "ending_river_gratitude") &&
      state.runCount >= 1 &&
      !state.seenScenes.includes("village_return")
    ) {
      nextId = "village_return";
    }
    if (
      choice.id === "main-road" &&
      state.mainRoadTaken >= 1 &&
      !state.sawKuchisakeThisRun
    ) {
      nextId = "kuchisake_encounter";
    }

    const nextScene = SCENES[nextId];
    if (!nextScene) return;

    const newHistory = [...state.history, state.sceneId];
    const newChoices = [...state.choicesTaken, { from: state.sceneId, choice: choice.id }];
    const newJournal = [...state.journal];
    if (nextScene.journal && !newJournal.find((j) => j.id === nextScene.journal.id)) {
      newJournal.push({ ...nextScene.journal, sceneId: nextScene.id });
    }
    if (currentScene.journal && !newJournal.find((j) => j.id === currentScene.journal.id)) {
      newJournal.push({ ...currentScene.journal, sceneId: currentScene.id });
    }
    const seen = new Set([...state.seenScenes, nextId]);
    const stage = nextScene.stage || state.stage;
    const stageIdx = STAGE_INDEX[stage] ?? 0;
    const stageProgress = stageIdx / (STAGES.length - 1);

    const mainRoadTaken =
      choice.id === "main-road" ? state.mainRoadTaken + 1 : state.mainRoadTaken;
    const sawKuchisakeThisRun =
      nextId === "kuchisake_encounter" ? true : state.sawKuchisakeThisRun;

    // Gifts: any scene with a `gift` field bestows it when entered.
    const gifts = new Set(state.gifts);
    if (nextScene.gift) gifts.add(nextScene.gift);
    const metZashiki = state.metZashiki || nextId === "zashiki_warashi";

    state = {
      ...state,
      sceneId: nextId,
      history: newHistory,
      choicesTaken: newChoices,
      journal: newJournal,
      seenScenes: [...seen],
      stage,
      stageProgress,
      mainRoadTaken,
      sawKuchisakeThisRun,
      gifts: [...gifts],
      metZashiki,
    };

    if (nextScene.isEnding) {
      const unlockedEndings = state.unlockedEndings.includes(nextId)
        ? state.unlockedEndings
        : [...state.unlockedEndings, nextId];
      state = {
        ...state,
        screen: "ending",
        ending: nextId,
        unlockedEndings,
        runCount: state.runCount + 1,
      };
    }
    emit();
  },

  // Trigger the hidden truth ending — only callable when unlocked.
  playHiddenTruth() {
    if (!isHiddenTruthUnlocked(state)) return;
    const unlockedEndings = state.unlockedEndings.includes(HIDDEN_TRUTH.id)
      ? state.unlockedEndings
      : [...state.unlockedEndings, HIDDEN_TRUTH.id];
    state = {
      ...state,
      screen: "ending",
      ending: HIDDEN_TRUTH.id,
      sceneId: HIDDEN_TRUTH.id,
      stage: HIDDEN_TRUTH.stage,
      stageProgress: 1,
      unlockedEndings,
    };
    emit();
  },
  reset() {
    // keep discovered lore, seen scenes, unlocked endings, run count and gifts across runs
    const preserved = {
      journal: state.journal,
      seenScenes: state.seenScenes,
      unlockedEndings: state.unlockedEndings,
      runCount: state.runCount,
      mainRoadTaken: state.mainRoadTaken,
      audioMuted: state.audioMuted,
      gifts: state.gifts,
      metZashiki: state.metZashiki,
    };
    state = {
      ...defaultState(),
      ...preserved,
      screen: "title",
    };
    emit();
  },
  hardReset() {
    state = defaultState();
    emit();
  },
  toggleAudio() {
    state = { ...state, audioMuted: !state.audioMuted };
    emit();
  },
};

export function useGameStore() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  return { ...snap, ...actions, hiddenTruthUnlocked: isHiddenTruthUnlocked(snap) };
}

export function isHiddenTruthUnlocked(s) {
  const nonHiddenIds = ALL_ENDINGS.map((e) => e.id);
  const allEndingsDone = nonHiddenIds.every((id) => s.unlockedEndings.includes(id));
  const journalIds = new Set(s.journal.map((j) => j.id));
  const allYokaiFound = ALL_YOKAI_JOURNAL_IDS.every((id) => journalIds.has(id));
  return allEndingsDone && allYokaiFound;
}

export const gameStore = { getSnapshot, ...actions };

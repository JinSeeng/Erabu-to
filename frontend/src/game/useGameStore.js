import { useSyncExternalStore } from "react";
import { SCENES, START_SCENE, STAGE_INDEX, STAGES } from "./storyData";

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

    // --- Dynamic re-routing based on cross-run history ---
    // 1) Second Act: safe endings on run >= 2 divert through village_return
    if (
      (nextId === "ending_hakumei" || nextId === "ending_river_gratitude") &&
      state.runCount >= 1 &&
      !state.seenScenes.includes("village_return")
    ) {
      nextId = "village_return";
    }
    // 2) Kuchisake-Onna: main-road choice, having already taken it before,
    // and not yet seen her this run
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
  reset() {
    // keep discovered lore, seen scenes, unlocked endings, run count across runs
    const preserved = {
      journal: state.journal,
      seenScenes: state.seenScenes,
      unlockedEndings: state.unlockedEndings,
      runCount: state.runCount,
      mainRoadTaken: state.mainRoadTaken,
      audioMuted: state.audioMuted,
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
  return { ...snap, ...actions };
}

export const gameStore = { getSnapshot, ...actions };

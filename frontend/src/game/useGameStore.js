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
    const nextId = choice.to;
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

    state = {
      ...state,
      sceneId: nextId,
      history: newHistory,
      choicesTaken: newChoices,
      journal: newJournal,
      seenScenes: [...seen],
      stage,
      stageProgress,
    };

    if (nextScene.isEnding) {
      state = { ...state, screen: "ending", ending: nextId };
    }
    emit();
  },
  reset() {
    const preservedJournal = state.journal; // keep discovered lore across runs
    const preservedSeen = state.seenScenes;
    state = {
      ...defaultState(),
      journal: preservedJournal,
      seenScenes: preservedSeen,
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

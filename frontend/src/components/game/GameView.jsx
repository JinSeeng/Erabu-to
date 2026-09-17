import { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Home, Volume2, VolumeX } from "lucide-react";
import { useGameStore } from "@/game/useGameStore";
import { audioEngine } from "@/game/useAudio";
import { SCENES } from "@/game/storyData";
import { fetchSceneImage } from "@/game/imageService";
import SceneCanvas from "./SceneCanvas";
import EmakiScroll from "./EmakiScroll";
import Journal from "./Journal";
import ChoiceButton from "./ChoiceButton";

export default function GameView() {
  const {
    sceneId,
    stage,
    stageProgress,
    journal,
    chooseOption,
    goToScreen,
    audioMuted,
    toggleAudio,
  } = useGameStore();
  const scene = SCENES[sceneId];
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [journalOpen, setJournalOpen] = useState(false);
  const [narrationIndex, setNarrationIndex] = useState(0);

  // Whenever the scene changes: fade audio to stage, fetch art, reset narration
  useEffect(() => {
    setNarrationIndex(0);
    setImageUrl(null);
    setImageLoading(true);
    audioEngine.setStage(stage, 3.5);
    audioEngine.fadeIn(0.55, 2);
    if (stage === "unsettling" || stage === "distorted" || stage === "horrifying") {
      audioEngine.chime();
    }
    let cancelled = false;
    (async () => {
      if (!scene?.imagePrompt) {
        setImageLoading(false);
        return;
      }
      const url = await fetchSceneImage(scene.id, scene.imagePrompt);
      if (!cancelled) {
        setImageUrl(url);
        setImageLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sceneId, stage, scene]);

  // Auto-reveal narration lines one by one
  useEffect(() => {
    if (!scene?.narration) return;
    if (narrationIndex >= scene.narration.length) return;
    const t = setTimeout(() => setNarrationIndex((i) => i + 1), 2400);
    return () => clearTimeout(t);
  }, [narrationIndex, scene]);

  const shownLines = useMemo(
    () => scene?.narration?.slice(0, narrationIndex + 1) || [],
    [scene, narrationIndex]
  );
  const allShown = narrationIndex >= (scene?.narration?.length ?? 0) - 1;

  const handleMute = () => {
    toggleAudio();
    audioEngine.setMuted(!audioMuted);
  };

  if (!scene) return null;

  return (
    <div
      data-testid="game-view"
      className="washi-dark relative min-h-screen overflow-hidden text-amber-50"
    >
      <SceneCanvas imageUrl={imageUrl} loading={imageLoading} stage={stage} />

      {/* Top toolbar */}
      <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-4 sm:px-10">
        <button
          data-testid="return-title-btn"
          onClick={() => goToScreen("title")}
          className="flex items-center gap-2 rounded-sm border border-amber-100/20 bg-black/40 px-3 py-2 font-serif-jp text-xs tracking-[0.25em] text-amber-100/70 backdrop-blur transition hover:border-red-400/60 hover:text-red-200"
        >
          <Home size={14} /> 表紙
        </button>
        <div className="flex items-center gap-3">
          <button
            data-testid="journal-toggle-btn"
            onClick={() => setJournalOpen(true)}
            className="flex items-center gap-2 rounded-sm border border-amber-100/20 bg-black/40 px-4 py-2 font-serif-jp text-xs tracking-[0.25em] text-amber-100/80 backdrop-blur transition hover:border-red-400/60 hover:text-red-200"
          >
            <BookOpen size={14} /> 手帖
            <span className="ml-1 rounded-full bg-red-700/70 px-1.5 text-[10px] text-amber-50">
              {journal.length}
            </span>
          </button>
          <button
            data-testid="audio-toggle-game"
            onClick={handleMute}
            className="rounded-sm border border-amber-100/20 bg-black/40 p-2 text-amber-100/70 backdrop-blur transition hover:border-red-400/60 hover:text-red-200"
          >
            {audioMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>

      {/* Scene title */}
      <div className="pointer-events-none absolute left-8 top-20 z-20 sm:left-14">
        <motion.h2
          key={scene.id + "-t"}
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.4 }}
          className="font-display text-3xl tracking-widest text-red-300/90 drop-shadow sm:text-4xl"
          data-testid="scene-kanji"
        >
          {scene.kanji}
        </motion.h2>
        <motion.p
          key={scene.id + "-r"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 1.6, delay: 0.6 }}
          className="mt-1 font-serif-jp text-xs italic tracking-[0.3em] text-amber-100/70 sm:text-sm"
        >
          {scene.romaji}
        </motion.p>
      </div>

      {/* Narration + choices panel */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col">
        <div className="mx-auto w-full max-w-4xl px-6 pb-2 pt-8 sm:px-10">
          <div className="rounded-sm border border-amber-100/15 bg-black/55 p-5 backdrop-blur-md sm:p-7">
            <div className="space-y-3" data-testid="narration">
              <AnimatePresence initial={false}>
                {shownLines.map((line, i) => (
                  <motion.p
                    key={scene.id + "-" + i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2 }}
                    className="font-serif-jp text-base leading-loose text-amber-100/90 sm:text-lg"
                  >
                    {line}
                  </motion.p>
                ))}
              </AnimatePresence>
            </div>

            {scene.isEnding ? null : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {allShown &&
                  scene.choices?.map((c) => (
                    <ChoiceButton
                      key={c.id}
                      choice={c}
                      onChoose={() => chooseOption(c)}
                    />
                  ))}
                {!allShown && scene.choices?.length ? (
                  <button
                    data-testid="skip-narration"
                    onClick={() =>
                      setNarrationIndex(scene.narration.length - 1)
                    }
                    className="col-span-full text-left font-serif-jp text-xs italic tracking-widest text-amber-100/40 hover:text-amber-100/70"
                  >
                    ▽ ink still drying — tap to hasten
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </div>
        <EmakiScroll stage={stage} progress={stageProgress} />
      </div>

      <Journal open={journalOpen} onClose={() => setJournalOpen(false)} />
    </div>
  );
}

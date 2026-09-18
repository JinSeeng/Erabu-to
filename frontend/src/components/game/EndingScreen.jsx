import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RotateCcw, Home } from "lucide-react";
import { SCENES } from "@/game/storyData";
import { fetchSceneImage } from "@/game/imageService";
import { audioEngine } from "@/game/useAudio";
import { useGameStore } from "@/game/useGameStore";

const TONE_LABEL = {
  cursed: "呪 · Cursed",
  haunted: "憑 · Haunted",
  spared: "赦 · Spared",
  drowned: "沈 · Drowned",
  trapped: "縛 · Bound",
  revelation: "真 · Revelation",
};

export default function EndingScreen({ ending, onRestart }) {
  const scene = SCENES[ending];
  const { goToScreen, journal, seenScenes } = useGameStore();
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!scene) return;
    audioEngine.setStage(scene.stage || "horrifying", 4);
    audioEngine.setAmbience(scene.isHidden ? "silence" : scene.tone === "spared" ? "wind" : "footsteps");
    (async () => {
      const url = await fetchSceneImage(scene.id, scene.imagePrompt);
      setImageUrl(url);
    })();
  }, [scene]);

  if (!scene) return null;

  return (
    <div
      data-testid="ending-screen"
      className="washi-dark relative min-h-screen overflow-hidden text-amber-50"
    >
      {imageUrl && (
        <motion.img
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.55, scale: 1 }}
          transition={{ duration: 4 }}
          src={imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "saturate(0.35) brightness(0.55) contrast(1.15)" }}
        />
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/90" />
      <div className="fog-layer pointer-events-none absolute -inset-40 opacity-70">
        <div className="h-full w-full bg-gradient-to-br from-red-950/30 via-transparent to-black/50" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-8 py-16 sm:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="font-serif-jp text-xs tracking-[0.5em] text-red-300/80"
        >
          結 · An ending
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.4, delay: 0.4 }}
          data-testid="ending-kanji"
          className="mt-4 font-display text-5xl tracking-widest text-red-400/90 drop-shadow sm:text-6xl lg:text-7xl"
        >
          {scene.kanji}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 2, delay: 1 }}
          className="mt-2 font-serif-jp text-sm italic tracking-[0.3em] text-amber-100/70"
        >
          {scene.romaji}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, delay: 1.4 }}
          className="mt-10 space-y-4"
        >
          {scene.narration.map((line, i) => (
            <p
              key={i}
              className="font-serif-jp text-lg leading-loose text-amber-100/90 sm:text-xl"
            >
              {line}
            </p>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3 }}
          className="mt-12 flex flex-wrap items-center gap-4"
        >
          <span className="hanko-seal font-display text-base tracking-widest">
            {TONE_LABEL[scene.tone] || "終"}
          </span>
          <span className="font-serif-jp text-xs tracking-[0.25em] text-amber-100/50">
            {journal.length} lore · {seenScenes.length} places
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 3.4 }}
          className="mt-10 flex flex-wrap gap-3"
        >
          <button
            data-testid="ending-restart-btn"
            onClick={onRestart}
            className="flex items-center gap-2 border border-red-500/60 bg-red-900/20 px-6 py-3 font-serif-jp text-sm tracking-[0.3em] text-red-200 transition hover:bg-red-800/40 hover:text-amber-50"
          >
            <RotateCcw size={16} /> もう一度 · Walk again
          </button>
          <button
            data-testid="ending-home-btn"
            onClick={() => goToScreen("title")}
            className="flex items-center gap-2 border border-amber-100/25 px-6 py-3 font-serif-jp text-sm tracking-[0.3em] text-amber-100/70 transition hover:border-amber-100/70 hover:text-amber-50"
          >
            <Home size={16} /> 表紙へ · To the cover
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 3, delay: 4.5 }}
          className="mt-10 font-serif-jp text-xs italic leading-loose text-amber-100/50"
        >
          Somewhere on the road you did not take, the story is still walking.
        </motion.p>
      </div>
    </div>
  );
}

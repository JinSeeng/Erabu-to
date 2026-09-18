import { useState } from "react";
import { motion } from "framer-motion";
import { ALL_ENDINGS, HIDDEN_TRUTH } from "@/game/storyData";
import { useGameStore } from "@/game/useGameStore";
import { englishName } from "@/game/storyData";

// Red hanko seals for every ending found; unfound ones stay sealed (封).
export default function EndingGallery() {
  const { unlockedEndings, hiddenTruthUnlocked, playHiddenTruth } = useGameStore();
  const [hovered, setHovered] = useState(null);
  const found = ALL_ENDINGS.filter((e) => unlockedEndings.includes(e.id)).length;
  if (found === 0) return null;

  const total = ALL_ENDINGS.length;
  const active = hovered ? ALL_ENDINGS.find((e) => e.id === hovered) : null;
  const hiddenDone = unlockedEndings.includes(HIDDEN_TRUTH.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, delay: 1.2 }}
      className="mt-10 max-w-xl"
      data-testid="ending-gallery"
    >
      <div className="mb-3 flex items-baseline justify-between font-serif-jp text-xs tracking-[0.3em] text-amber-100/60">
        <span>結の印 · Seals of endings</span>
        <span className="text-red-300/70" data-testid="ending-gallery-progress">
          {found} / {total}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_ENDINGS.map((e) => {
          const unlocked = unlockedEndings.includes(e.id);
          return (
            <div
              key={e.id}
              data-testid={`seal-${e.id}`}
              onMouseEnter={() => unlocked && setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={unlocked ? englishName(e) : "Undiscovered ending"}
              className={
                "relative flex h-12 w-12 items-center justify-center rounded-sm border transition " +
                (unlocked
                  ? "hanko-seal cursor-help border-red-500/70 text-amber-50"
                  : "border-amber-100/10 bg-black/30 text-amber-100/15")
              }
            >
              <span className="font-display text-base tracking-widest">
                {unlocked ? e.kanji.slice(0, 1) : "封"}
              </span>
            </div>
          );
        })}
        {hiddenTruthUnlocked && (
          <button
            data-testid="hidden-truth-btn"
            onClick={playHiddenTruth}
            title={hiddenDone ? "Read the hidden truth again" : "The hidden truth is ready"}
            className="flex h-12 items-center gap-2 border border-red-500/80 bg-red-950/60 px-3 font-serif-jp text-xs tracking-[0.25em] text-red-200 transition hover:bg-red-800/60 hover:text-amber-50"
          >
            <span className="font-display text-base">{HIDDEN_TRUTH.kanji}</span>
            <span className="italic">{hiddenDone ? "again" : "hidden truth"}</span>
          </button>
        )}
      </div>
      <div className="mt-3 h-5 font-serif-jp text-xs italic tracking-widest text-amber-100/60" data-testid="ending-gallery-hint">
        {active
          ? `${active.kanji} · ${englishName(active)}`
          : found < total
          ? "Other threads remain. Try different roads."
          : "Every thread has been walked. Some more than once."}
      </div>
    </motion.div>
  );
}

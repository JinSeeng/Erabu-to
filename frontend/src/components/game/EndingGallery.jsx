import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ALL_ENDINGS } from "@/game/storyData";
import { useGameStore } from "@/game/useGameStore";

// Compact grid of ending seals. Locked endings show only a shadowed placeholder.
export default function EndingGallery() {
  const { unlockedEndings, goToScreen } = useGameStore();
  const total = ALL_ENDINGS.length;
  const found = unlockedEndings.length;

  const [hovered, setHovered] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (found === 0) return null;

  const active = hovered
    ? ALL_ENDINGS.find((e) => e.id === hovered)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 2, delay: 0.6 }}
      className="mt-10 max-w-xl"
      data-testid="ending-gallery"
    >
      <div className="mb-3 flex items-baseline justify-between font-serif-jp text-xs tracking-[0.3em] text-amber-100/60">
        <span>結の印 · Seals of endings</span>
        <span className="text-red-300/70">
          {found} / {total}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ALL_ENDINGS.map((e) => {
          const unlocked = unlockedEndings.includes(e.id);
          return (
            <button
              key={e.id}
              data-testid={`seal-${e.id}`}
              disabled={!unlocked}
              onMouseEnter={() => unlocked && setHovered(e.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => goToScreen("game")}
              aria-label={unlocked ? e.kanji : "Undiscovered ending"}
              className={
                "group relative flex h-14 w-14 items-center justify-center rounded-sm border transition " +
                (unlocked
                  ? "border-red-500/60 bg-red-800/40 text-amber-50 hover:bg-red-700/60"
                  : "cursor-not-allowed border-amber-100/10 bg-black/30 text-amber-100/10")
              }
            >
              <span className="font-display text-lg tracking-widest">
                {unlocked ? e.kanji.slice(0, 1) : "封"}
              </span>
              {unlocked && (
                <span className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-red-500 shadow-md" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-3 h-6 font-serif-jp text-xs italic tracking-widest text-amber-100/60">
        {active
          ? `${active.kanji} · ${active.romaji}`
          : found < total
          ? "Other threads remain. Try different roads."
          : "Every thread has been walked. Some more than once."}
      </div>
    </motion.div>
  );
}

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { SCENES, STAGES } from "@/game/storyData";
import { useGameStore } from "@/game/useGameStore";
import EmakiPanel from "./EmakiPanel";

// Emaki — a continuous painted scroll of the player's path. Narrative progression, not health.
// Vertical hanging scroll on wide screens, thin horizontal scroll on small ones.

const STAGE_LABEL = { peaceful: "静か", strange: "違和", unsettling: "不穏", distorted: "歪み", horrifying: "怪" };
const FULL_LENGTH = 6; // panels needed to fully unroll

export default function EmakiScroll({ orientation = "horizontal", stage }) {
  const { history, sceneId } = useGameStore();
  const [open, setOpen] = useState(false);
  const ids = useMemo(() => [...history, sceneId].filter((id) => SCENES[id]), [history, sceneId]);
  const vertical = orientation === "vertical";
  const revealed = Math.min(1, ids.length / FULL_LENGTH);
  const stageIdx = STAGES.indexOf(stage);

  const cap = (
    <div
      className={`shrink-0 rounded-sm bg-gradient-to-b from-amber-800 via-amber-950 to-amber-900 shadow-inner ${
        vertical ? "h-3 w-full" : "h-14 w-3"
      }`}
    />
  );

  return (
    <>
      <div
        data-testid={`emaki-scroll-${orientation}`}
        className={
          vertical
            ? "pointer-events-auto fixed bottom-6 right-4 top-20 z-20 flex w-16 flex-col items-center gap-1 xl:w-20"
            : "relative z-10 mx-auto w-full max-w-4xl px-4 pb-3 pt-1 sm:px-8"
        }
      >
        <div
          className={`flex items-center justify-between font-serif-jp text-[10px] tracking-[0.3em] text-amber-100/60 ${
            vertical ? "tategaki mb-1 h-24 flex-col gap-2" : "mb-1 w-full"
          }`}
        >
          <span>絵巻 {vertical ? "" : "· Emaki"}</span>
          <span className="text-red-300/80">{STAGE_LABEL[stage]}</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Unroll the emaki"
          data-testid="emaki-open-btn"
          className={`group flex ${vertical ? "w-full flex-1 flex-col" : "h-14 w-full"} items-stretch gap-1 transition hover:scale-[1.01]`}
        >
          {cap}
          <div className="relative flex-1 overflow-hidden rounded-sm border border-amber-100/25 bg-amber-50/90 shadow-[inset_0_0_18px_rgba(90,60,30,0.35)]">
            <motion.div
              className={`absolute ${vertical ? "inset-x-0 top-0 flex flex-col" : "inset-y-0 left-0 flex"}`}
              initial={false}
              animate={vertical ? { height: `${revealed * 100}%` } : { width: `${revealed * 100}%` }}
              transition={{ duration: 2.4, ease: "easeOut" }}
            >
              {ids.map((id) => (
                <EmakiPanel key={id} sceneId={id} vertical={vertical} />
              ))}
            </motion.div>
            <div
              className={`absolute ${vertical ? "inset-x-0 bottom-0" : "inset-y-0 right-0"} bg-amber-50/85`}
              style={vertical ? { height: `${(1 - revealed) * 100}%` } : { width: `${(1 - revealed) * 100}%` }}
            >
              <div
                className="h-full w-full opacity-40"
                style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(120,80,40,0.08) 0 2px, transparent 2px 6px)" }}
              />
            </div>
            {stageIdx >= 3 && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-950/30" />
            )}
          </div>
          {cap}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            data-testid="emaki-overlay"
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-6 backdrop-blur-sm"
          >
            <div className="mb-4 flex w-full max-w-5xl items-baseline justify-between font-serif-jp text-xs tracking-[0.3em] text-amber-100/70">
              <span>絵巻 · Emaki — the scroll of your becoming</span>
              <button data-testid="emaki-close-btn" aria-label="Close" className="rounded-sm border border-amber-100/20 p-2 hover:text-red-300">
                <X size={16} />
              </button>
            </div>
            <div
              onClick={(e) => e.stopPropagation()}
              className="flex w-full max-w-5xl items-stretch gap-2 overflow-x-auto rounded-sm border border-amber-100/20 bg-amber-50/95 p-3 shadow-2xl"
            >
              <div className="w-4 shrink-0 rounded-sm bg-gradient-to-b from-amber-800 via-amber-950 to-amber-900" />
              {ids.map((id) => (
                <EmakiPanel key={id} sceneId={id} large />
              ))}
              <div className="flex w-40 shrink-0 items-center justify-center font-serif-jp text-xs italic tracking-widest text-stone-500">
                the paper waits…
              </div>
              <div className="w-4 shrink-0 rounded-sm bg-gradient-to-b from-amber-900 via-amber-950 to-amber-800" />
            </div>
            <div className="mt-3 flex w-full max-w-5xl justify-between px-6 font-serif-jp text-[10px] tracking-[0.3em] text-amber-100/50">
              {STAGES.map((s, i) => (
                <span key={s} className={i <= stageIdx ? "text-red-300/80" : ""}>{STAGE_LABEL[s]}</span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Volume2, VolumeX, RotateCcw } from "lucide-react";
import { audioEngine } from "@/game/useAudio";
import { useGameStore } from "@/game/useGameStore";

export default function TitleScreen({ onStart }) {
  const { seenScenes, journal, hardReset, audioMuted, toggleAudio } = useGameStore();
  const [visible, setVisible] = useState(false);
  const hasProgress = seenScenes.length > 0 || journal.length > 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, []);

  const handleStart = () => {
    audioEngine.init();
    audioEngine.setStage("peaceful", 1);
    audioEngine.fadeIn(0.55, 3);
    onStart();
  };

  const handleMute = () => {
    audioEngine.init();
    toggleAudio();
    audioEngine.setMuted(!audioMuted);
  };

  return (
    <div
      data-testid="title-screen"
      className="washi-dark ink-vignette relative min-h-screen overflow-hidden text-amber-50/90"
    >
      {/* Fog layers */}
      <div className="fog-layer pointer-events-none absolute -inset-40 bg-gradient-to-br from-slate-900/40 via-transparent to-red-950/20" />
      <div
        className="fog-layer pointer-events-none absolute -inset-20 opacity-60"
        style={{ animationDelay: "-8s" }}
      >
        <div className="h-full w-full bg-gradient-to-tr from-amber-950/10 via-transparent to-stone-900/40" />
      </div>

      {/* Distant torii silhouette */}
      <svg
        className="pointer-events-none absolute bottom-0 left-0 h-64 w-full opacity-20"
        viewBox="0 0 800 200"
        preserveAspectRatio="none"
      >
        <path
          d="M0,200 L0,180 Q200,150 400,170 T800,175 L800,200 Z"
          fill="#1a1512"
        />
        <g stroke="#1a1512" strokeWidth="6" fill="none">
          <line x1="580" y1="200" x2="580" y2="120" />
          <line x1="640" y1="200" x2="640" y2="120" />
          <path d="M560,120 Q610,105 660,120" strokeWidth="8" />
          <line x1="565" y1="128" x2="655" y2="128" strokeWidth="4" />
        </g>
      </svg>

      {/* Hanko seal + audio controls */}
      <div className="absolute right-6 top-6 z-20 flex items-center gap-3">
        <button
          data-testid="audio-toggle"
          onClick={handleMute}
          aria-label="Toggle audio"
          className="rounded-sm border border-amber-100/20 bg-black/40 p-2 text-amber-100/70 transition hover:border-red-500/60 hover:text-red-300"
        >
          {audioMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        {hasProgress && (
          <button
            data-testid="hard-reset"
            onClick={hardReset}
            aria-label="Erase all progress"
            className="rounded-sm border border-amber-100/20 bg-black/40 p-2 text-amber-100/70 transition hover:border-red-500/60 hover:text-red-300"
          >
            <RotateCcw size={18} />
          </button>
        )}
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-start justify-between px-8 py-16 sm:px-16 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: visible ? 1 : 0, y: 0 }}
          transition={{ duration: 1.4 }}
          className="tategaki select-none text-sm tracking-[0.4em] text-red-300/70 font-serif-jp"
        >
          怪談 · 選ぶと、
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 2.2, delay: 0.4 }}
          className="my-auto max-w-3xl"
        >
          <div className="flex items-baseline gap-6">
            <h1
              data-testid="title-kanji"
              className="font-display text-[5.5rem] leading-none tracking-widest text-red-500/90 drop-shadow-[0_2px_0_rgba(0,0,0,0.6)] sm:text-[7.5rem] lg:text-[9rem]"
            >
              因果
            </h1>
            <span className="hanko-seal font-display text-xl">印</span>
          </div>
          <p className="mt-2 font-serif-jp text-lg tracking-[0.35em] text-amber-100/70 sm:text-xl">
            Inga · &nbsp;選ぶと、 &nbsp;— &nbsp;<span className="italic text-amber-100/50">if you choose…</span>
          </p>
          <p className="mt-10 max-w-xl font-serif-jp text-base leading-loose text-amber-100/80 sm:text-lg">
            A quiet road at dusk. A choice, then another. The world you know
            begins, so gently, to become something else.
          </p>
          <p className="mt-3 max-w-xl font-serif-jp text-sm italic leading-loose text-amber-100/50">
            Turn the sound on. Play in a dark room. Trust nothing that repeats.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <button
              data-testid="start-game-btn"
              onClick={handleStart}
              className="group relative overflow-hidden border border-red-500/70 bg-red-900/20 px-8 py-3 font-serif-jp text-lg tracking-[0.3em] text-red-200 transition hover:bg-red-800/40 hover:text-amber-50"
            >
              <span className="relative z-10">
                {hasProgress ? "続ける · Continue" : "始める · Begin"}
              </span>
              <span className="absolute inset-0 -translate-x-full bg-red-600/20 transition-transform duration-500 group-hover:translate-x-0" />
            </button>
            {hasProgress && (
              <button
                data-testid="new-run-btn"
                onClick={() => {
                  hardReset();
                  handleStart();
                }}
                className="border border-amber-100/30 px-6 py-3 font-serif-jp text-sm tracking-[0.25em] text-amber-100/70 transition hover:border-amber-100/70 hover:text-amber-50"
              >
                新しい話 · New Tale
              </button>
            )}
          </div>

          {hasProgress && (
            <div className="mt-8 font-serif-jp text-xs uppercase tracking-[0.3em] text-amber-100/40">
              {journal.length} lore fragments · {seenScenes.length} places remembered
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 0.5 : 0 }}
          transition={{ duration: 2.4, delay: 1.2 }}
          className="max-w-md font-serif-jp text-xs leading-loose text-amber-100/40"
        >
          <span className="text-red-300/60">◈</span> Every choice is a
          cause. Every scene, an effect. Some tales, once read, cannot be
          unread.
        </motion.div>
      </div>
    </div>
  );
}

import { motion } from "framer-motion";
import { STAGES } from "@/game/storyData";

// Emaki (horizontal illustrated scroll) — represents narrative progression, not health.
// The scroll fills as the player progresses; the ink darkens with each stage.

const STAGE_LABEL = {
  peaceful: "静か",
  strange: "違和",
  unsettling: "不穏",
  distorted: "歪み",
  horrifying: "怪",
};

const STAGE_GRADIENT = {
  peaceful: "from-amber-100 via-amber-50 to-stone-100",
  strange: "from-amber-100 via-stone-200 to-slate-300",
  unsettling: "from-stone-300 via-slate-400 to-stone-500",
  distorted: "from-stone-500 via-slate-600 to-red-900",
  horrifying: "from-slate-700 via-red-900 to-black",
};

export default function EmakiScroll({ stage, progress }) {
  const stageIdx = STAGES.indexOf(stage);
  const revealed = Math.max(0.15, progress || 0);

  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-6 pt-3 sm:px-8" data-testid="emaki-scroll">
      <div className="mb-2 flex items-center justify-between font-serif-jp text-[10px] tracking-[0.35em] text-amber-100/60">
        <span>絵巻 · Emaki — the scroll of your becoming</span>
        <span className="text-red-300/70">{STAGE_LABEL[stage]}</span>
      </div>
      <div className="relative flex items-center gap-2">
        {/* Left wood cap */}
        <div className="h-16 w-3 rounded-sm bg-gradient-to-b from-amber-800 via-amber-950 to-amber-900 shadow-inner sm:h-20 sm:w-4" />
        {/* Scroll body */}
        <div className="relative h-16 flex-1 overflow-hidden rounded-sm border border-amber-100/20 bg-amber-50/90 shadow-[inset_0_0_18px_rgba(90,60,30,0.35)] sm:h-20">
          {/* Painted, unrolling illustration */}
          <motion.div
            className="absolute inset-y-0 left-0 origin-left"
            initial={false}
            animate={{ width: `${revealed * 100}%` }}
            transition={{ duration: 2.4, ease: "easeOut" }}
          >
            <div
              className={`h-full w-full bg-gradient-to-r ${STAGE_GRADIENT[stage] || STAGE_GRADIENT.peaceful}`}
            >
              <ScrollArt stage={stage} />
            </div>
          </motion.div>
          {/* Unpainted washi to the right */}
          <div
            className="absolute inset-y-0 right-0 bg-amber-50/80"
            style={{ width: `${(1 - revealed) * 100}%` }}
          >
            <div
              className="h-full w-full opacity-40"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg, rgba(120,80,40,0.08) 0 2px, transparent 2px 6px)",
              }}
            />
          </div>
          {/* Ink seep on the leading edge as the world darkens */}
          {stageIdx >= 2 && (
            <div
              className="pointer-events-none absolute inset-y-0"
              style={{
                left: `${Math.max(0, revealed * 100 - 8)}%`,
                width: "14%",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(30,20,10,0.35) 50%, transparent 100%)",
              }}
            />
          )}
          {/* Stage tick marks */}
          <div className="pointer-events-none absolute inset-0 flex justify-between px-2">
            {STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-center justify-end pb-1">
                <span
                  className={`text-[9px] tracking-[0.2em] font-serif-jp ${
                    i <= stageIdx ? "text-red-900/80" : "text-stone-600/40"
                  }`}
                >
                  {STAGE_LABEL[s]}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Right wood cap */}
        <div className="h-16 w-3 rounded-sm bg-gradient-to-b from-amber-900 via-amber-950 to-amber-800 shadow-inner sm:h-20 sm:w-4" />
      </div>
    </div>
  );
}

// Tiny SVG scrollwork — grows more distorted with each stage.
function ScrollArt({ stage }) {
  const isDark = stage === "distorted" || stage === "horrifying";
  const isMid = stage === "unsettling" || isDark;
  return (
    <svg
      viewBox="0 0 400 60"
      preserveAspectRatio="none"
      className="h-full w-full opacity-80"
    >
      {/* Mountains */}
      <path
        d="M0,50 L30,32 L55,42 L90,22 L120,38 L155,28 L200,44 L240,26 L275,40 L320,20 L360,36 L400,30 L400,60 L0,60 Z"
        fill={isDark ? "#1a1512" : isMid ? "#5c4a38" : "#8a6a44"}
        opacity="0.75"
      />
      {/* Tree */}
      <g stroke={isDark ? "#0a0806" : "#3a2a1a"} strokeWidth="1.2" fill="none">
        <path d={isDark ? "M110,50 C112,35 108,25 118,15 M110,30 L100,22 M112,28 L124,20" : "M110,50 L110,25 M110,32 L102,28 M110,30 L120,26"} />
      </g>
      {/* Sun / moon */}
      <circle
        cx="330"
        cy="18"
        r={isDark ? "5" : "6"}
        fill={isDark ? "#7f1d1d" : "#d97706"}
        opacity={isDark ? "0.85" : "0.7"}
      />
      {/* Figure — disappears past 'unsettling' */}
      {!isDark && (
        <g fill={isMid ? "#0a0806" : "#3a2a1a"} opacity="0.7">
          <circle cx="200" cy="42" r="1.6" />
          <rect x="199" y="43" width="2" height="6" />
        </g>
      )}
      {/* Distant shrouded figure — appears from 'unsettling' */}
      {isMid && (
        <g fill="#0a0806" opacity="0.85">
          <ellipse cx="260" cy="45" rx="3" ry="6" />
          <circle cx="260" cy="38" r="2" />
        </g>
      )}
      {/* Ink spatter — horrifying only */}
      {isDark && (
        <>
          <circle cx="70" cy="20" r="2" fill="#0a0806" opacity="0.9" />
          <circle cx="150" cy="12" r="1.5" fill="#0a0806" opacity="0.7" />
          <circle cx="290" cy="10" r="2.5" fill="#0a0806" opacity="0.85" />
          <path
            d="M180,10 Q185,20 178,28 Q172,22 180,10"
            fill="#7f1d1d"
            opacity="0.7"
          />
        </>
      )}
    </svg>
  );
}

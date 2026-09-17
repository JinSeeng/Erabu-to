import { motion } from "framer-motion";

const STAGE_TINT = {
  peaceful: "from-amber-900/10 via-transparent to-stone-900/40",
  strange: "from-amber-950/25 via-transparent to-slate-900/55",
  unsettling: "from-stone-950/40 via-slate-900/20 to-red-950/50",
  distorted: "from-red-950/45 via-slate-950/50 to-black/70",
  horrifying: "from-red-950/60 via-black/70 to-black/90",
};

export default function SceneCanvas({ imageUrl, loading, stage }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base washi placeholder / loading ink */}
      <div className="washi-dark absolute inset-0" />

      {imageUrl && (
        <motion.img
          key={imageUrl}
          src={imageUrl}
          alt=""
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1.0 }}
          transition={{ duration: 3, ease: "easeOut" }}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: filterFor(stage) }}
          data-testid="scene-image"
        />
      )}

      {/* Stage tint */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${STAGE_TINT[stage] || STAGE_TINT.peaceful}`}
      />

      {/* Drifting fog */}
      <div
        className="fog-layer pointer-events-none absolute -inset-40 opacity-70"
        style={{ mixBlendMode: "screen" }}
      >
        <div className="h-full w-full bg-gradient-to-tr from-white/5 via-stone-200/10 to-transparent" />
      </div>
      <div
        className="fog-layer pointer-events-none absolute -inset-40 opacity-40"
        style={{ animationDelay: "-11s", mixBlendMode: "screen" }}
      >
        <div className="h-full w-full bg-gradient-to-bl from-stone-100/10 via-transparent to-transparent" />
      </div>

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(ellipse_at_center,transparent_35%,rgba(8,7,6,0.85)_100%)]" />

      {loading && !imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-amber-100/60">
            <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
              <circle
                cx="26"
                cy="26"
                r="22"
                stroke="rgba(220,180,120,0.25)"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M26 4 A22 22 0 0 1 48 26"
                stroke="rgb(220,180,120)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                className="origin-center"
                style={{ animation: "spin 2.4s linear infinite", transformOrigin: "26px 26px" }}
              />
            </svg>
            <p className="font-serif-jp text-xs tracking-[0.3em] text-amber-100/50">
              筆を運ぶ · painting…
            </p>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function filterFor(stage) {
  switch (stage) {
    case "strange":
      return "saturate(0.85) contrast(1.05) brightness(0.9)";
    case "unsettling":
      return "saturate(0.6) contrast(1.1) brightness(0.75) hue-rotate(-8deg)";
    case "distorted":
      return "saturate(0.45) contrast(1.15) brightness(0.6) hue-rotate(-15deg)";
    case "horrifying":
      return "saturate(0.25) contrast(1.25) brightness(0.45) hue-rotate(-20deg)";
    default:
      return "saturate(0.95) contrast(1.02) brightness(0.95)";
  }
}

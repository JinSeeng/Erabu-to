import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SCENES } from "@/game/storyData";
import { fetchSceneImage } from "@/game/imageService";

const STAGE_PALETTE = {
  peaceful: "bright serene spring colours, soft golden light, gentle clouds",
  strange: "muted autumn tones, thin mist creeping in, shadows a little too long",
  unsettling: "dim twilight, heavy grey mist, indigo shadows, a faint red glow",
  distorted: "dark wet ink, twisted trees, deep indigo and crimson, figures half-erased",
  horrifying: "black ink bleeding across the paper, blood-red accents, ominous emptiness",
};

const STAGE_FILTER = {
  peaceful: "saturate(1.05) brightness(1.05)",
  strange: "saturate(0.9)",
  unsettling: "saturate(0.7) brightness(0.85)",
  distorted: "saturate(0.5) brightness(0.7) contrast(1.15)",
  horrifying: "saturate(0.3) brightness(0.55) contrast(1.3)",
};

export function scrollPrompt(scene) {
  const palette =
    scene.isEnding && scene.tone === "spared"
      ? "warm dawn light returning, gold leaf clouds and soft vermilion, peaceful and joyful"
      : STAGE_PALETTE[scene.stage] || STAGE_PALETTE.peaceful;
  return `${scene.imagePrompt}, ${palette}`;
}

// One painted panel of the emaki for a visited scene. Falls back to ink SVG if art is unavailable.
export default function EmakiPanel({ sceneId, vertical, large = false }) {
  const scene = SCENES[sceneId];
  const [url, setUrl] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!scene?.imagePrompt) return;
    fetchSceneImage(`scroll_${scene.id}`, scrollPrompt(scene), "scroll").then((u) => {
      if (!cancelled) setUrl(u);
    });
    return () => {
      cancelled = true;
    };
  }, [scene]);

  if (!scene) return null;
  const stage = scene.isEnding && scene.tone === "spared" ? "peaceful" : scene.stage;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.2 }}
      data-testid={`emaki-panel-${scene.id}`}
      title={scene.kanji}
      className={`relative min-h-0 min-w-0 flex-1 overflow-hidden ${large ? "h-56 w-72 shrink-0 flex-none sm:h-64 sm:w-80" : ""}`}
    >
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" style={{ filter: STAGE_FILTER[stage] }} />
      ) : (
        <InkFallback stage={stage} vertical={vertical} />
      )}
      {/* ink seam between panels */}
      <div
        className={`pointer-events-none absolute ${vertical ? "inset-x-0 bottom-0 h-2" : "inset-y-0 right-0 w-2"}`}
        style={{
          background: vertical
            ? "linear-gradient(180deg, transparent, rgba(20,14,10,0.55))"
            : "linear-gradient(90deg, transparent, rgba(20,14,10,0.55))",
        }}
      />
      {large && (
        <div className="absolute bottom-2 left-2 rounded-sm bg-black/50 px-2 py-1 font-display text-xs tracking-widest text-amber-50">
          {scene.kanji}
        </div>
      )}
    </motion.div>
  );
}

const INK = { peaceful: "#8a6a44", strange: "#5c4a38", unsettling: "#3a2a1a", distorted: "#1a1512", horrifying: "#0a0806" };
const SKY = { peaceful: "#f3e7cf", strange: "#e6d9c4", unsettling: "#b8ada3", distorted: "#6b5f5c", horrifying: "#2a1c1c" };

function InkFallback({ stage, vertical }) {
  const ink = INK[stage] || INK.peaceful;
  const dark = stage === "distorted" || stage === "horrifying";
  return (
    <svg viewBox="0 0 120 120" preserveAspectRatio="none" className="h-full w-full" style={{ transform: vertical ? "none" : "none" }}>
      <rect width="120" height="120" fill={SKY[stage] || SKY.peaceful} />
      <path d="M0,90 L20,60 L38,74 L60,48 L82,70 L100,52 L120,66 L120,120 L0,120 Z" fill={ink} opacity="0.7" />
      <circle cx="92" cy="26" r="7" fill={dark ? "#7f1d1d" : "#d97706"} opacity="0.75" />
      <path d="M30,92 L30,70 M30,78 L22,72 M30,76 L40,70" stroke={ink} strokeWidth="1.5" fill="none" />
      {!dark && <g fill={ink}><circle cx="70" cy="86" r="2" /><rect x="68.5" y="88" width="3" height="8" /></g>}
      {dark && (
        <>
          <circle cx="24" cy="30" r="3" fill="#0a0806" />
          <path d="M60,20 Q66,34 58,44 Q52,34 60,20" fill="#7f1d1d" opacity="0.8" />
        </>
      )}
    </svg>
  );
}

import { motion } from "framer-motion";

// Visibility of gift-gated choices is decided by GameView; this only renders.
export default function ChoiceButton({ choice, onChoose, compact = false }) {
  return (
    <motion.button
      data-testid={`choice-${choice.id}`}
      onClick={onChoose}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
      whileHover={{ x: 2 }}
      className={`group relative flex items-center gap-3 overflow-hidden rounded-sm border border-amber-100/25 bg-black/40 text-left transition hover:border-red-400/60 hover:bg-red-950/40 ${
        compact ? "px-3 py-3" : "px-4 py-3"
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-sm bg-red-900/70 font-display tracking-wider text-amber-50 shadow-inner ${
          compact ? "h-8 w-8 text-sm" : "h-9 w-9 text-sm"
        }`}
      >
        {choice.stamp || "◇"}
      </span>
      <span className={`font-serif-jp leading-snug text-amber-100/90 group-hover:text-amber-50 ${compact ? "text-sm" : "text-sm sm:text-base"}`}>
        {choice.text}
      </span>
      {!compact && (
        <span className="ml-auto font-serif-jp text-xs tracking-widest text-amber-100/40 group-hover:text-red-300">→</span>
      )}
    </motion.button>
  );
}

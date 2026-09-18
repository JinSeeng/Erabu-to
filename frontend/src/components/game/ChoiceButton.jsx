import { motion } from "framer-motion";
import { useGameStore } from "@/game/useGameStore";

export default function ChoiceButton({ choice, onChoose }) {
  const { gifts } = useGameStore();
  // `no_gift` = visible only while the player owns no gifts (Zashiki appears once).
  if (choice.requires && choice.requires !== "no_gift" && !gifts.includes(choice.requires)) return null;
  if (choice.requires === "no_gift" && gifts.length > 0) return null;
  return (
    <motion.button
      data-testid={`choice-${choice.id}`}
      onClick={onChoose}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9 }}
      whileHover={{ x: 2 }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-sm border border-amber-100/25 bg-black/40 px-5 py-4 text-left transition hover:border-red-400/60 hover:bg-red-950/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-red-900/70 font-display text-base tracking-wider text-amber-50 shadow-inner">
        {choice.stamp || "◇"}
      </span>
      <span className="font-serif-jp text-base leading-snug text-amber-100/90 group-hover:text-amber-50 sm:text-lg">
        {choice.text}
      </span>
      <span className="ml-auto font-serif-jp text-xs tracking-widest text-amber-100/40 group-hover:text-red-300">
        →
      </span>
    </motion.button>
  );
}

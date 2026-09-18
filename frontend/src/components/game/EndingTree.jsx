import { createElement, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { SCENES, HIDDEN_TRUTH, ALL_ENDINGS, ALL_YOKAI_JOURNAL_IDS, START_SCENE } from "@/game/storyData";
import { useGameStore } from "@/game/useGameStore";

// Dynamic re-routes handled in the store, drawn here as dotted threads.
const EXTRA_EDGES = {
  start: ["kuchisake_encounter"],
  twilight_home: ["village_return"],
  kappa_pact: ["village_return"],
};

function buildTree(id, rendered) {
  const scene = SCENES[id];
  if (rendered.has(id)) return { id, ref: true, children: [] };
  rendered.add(id);
  const kids = [...new Set([...(scene.choices?.map((c) => c.to) || []), ...(EXTRA_EDGES[id] || [])])];
  return { id, ref: false, children: kids.map((k) => buildTree(k, rendered)) };
}

function Node({ node, seenScenes, unlockedEndings, onHover }) {
  const scene = SCENES[node.id];
  const isEnding = scene.isEnding;
  const known = node.id === START_SCENE || seenScenes.includes(node.id);
  const unlocked = unlockedEndings.includes(node.id);
  const label = isEnding ? (unlocked ? scene.kanji : "封") : known ? scene.kanji : "？";
  const cls = isEnding
    ? unlocked
      ? "border-red-500/70 bg-red-900/50 text-amber-50"
      : "border-amber-100/10 bg-black/30 text-amber-100/20"
    : known
    ? "border-amber-100/30 bg-black/40 text-amber-100/80"
    : "border-amber-100/10 bg-black/20 text-amber-100/25 border-dashed";
  return (
    <li className="relative pl-5">
      <span className="absolute left-0 top-4 h-px w-4 bg-amber-100/20" />
      <button
        type="button"
        data-testid={`tree-node-${node.id}`}
        onMouseEnter={() => onHover((isEnding && unlocked) || known ? scene : null)}
        onMouseLeave={() => onHover(null)}
        className={`my-1 inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 font-serif-jp text-xs tracking-widest transition ${cls} ${node.ref ? "italic opacity-60" : ""}`}
      >
        {isEnding && <span className="text-[10px] text-red-400/80">結</span>}
        {label}
        {node.ref && <span className="text-[10px]">↺</span>}
      </button>
      {node.children.length > 0 && (
        <ul className="ml-3 border-l border-amber-100/15">
          {node.children.map((c) =>
            createElement(Node, { key: node.id + ">" + c.id, node: c, seenScenes, unlockedEndings, onHover })
          )}
        </ul>
      )}
    </li>
  );
}

export default function EndingTree() {
  const { seenScenes, unlockedEndings, journal, hiddenTruthUnlocked, playHiddenTruth } = useGameStore();
  const [hover, setHover] = useState(null);
  const [visible, setVisible] = useState(false);
  const tree = useMemo(() => buildTree(START_SCENE, new Set()), []);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 900);
    return () => clearTimeout(t);
  }, []);

  if (seenScenes.length === 0 && unlockedEndings.length === 0) return null;

  const total = ALL_ENDINGS.length;
  const found = ALL_ENDINGS.filter((e) => unlockedEndings.includes(e.id)).length;
  const yokaiFound = ALL_YOKAI_JOURNAL_IDS.filter((id) => journal.some((j) => j.id === id)).length;
  const hiddenDone = unlockedEndings.includes(HIDDEN_TRUTH.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 2, delay: 0.6 }}
      className="mt-10 max-w-xl"
      data-testid="ending-tree"
    >
      <div className="mb-3 flex items-baseline justify-between font-serif-jp text-xs tracking-[0.3em] text-amber-100/60">
        <span>因果の樹 · Tree of endings</span>
        <span className="text-red-300/70" data-testid="ending-tree-progress">
          {found} / {total} 結 · {yokaiFound} / {ALL_YOKAI_JOURNAL_IDS.length} 怪
        </span>
      </div>
      <ul className="max-h-72 overflow-y-auto pr-2">
        <Node node={tree} seenScenes={seenScenes} unlockedEndings={unlockedEndings} onHover={setHover} />
      </ul>
      <div className="mt-3 min-h-6 font-serif-jp text-xs italic tracking-widest text-amber-100/60" data-testid="ending-tree-hint">
        {hover
          ? `${hover.kanji} · ${hover.romaji}`
          : found < total
          ? "Other threads remain. Try different roads."
          : "Every thread has been walked. Some more than once."}
      </div>

      <div className="mt-5 border-t border-amber-100/10 pt-4">
        {hiddenTruthUnlocked ? (
          <button
            data-testid="hidden-truth-btn"
            onClick={playHiddenTruth}
            className="group flex w-full items-center justify-between border border-red-500/70 bg-red-950/40 px-5 py-3 font-serif-jp tracking-[0.3em] text-red-200 transition hover:bg-red-800/50 hover:text-amber-50"
          >
            <span className="font-display text-lg">{HIDDEN_TRUTH.kanji}</span>
            <span className="text-xs italic">{hiddenDone ? "read again" : "the hidden truth is ready"}</span>
          </button>
        ) : (
          <div data-testid="hidden-truth-locked" className="flex items-center justify-between font-serif-jp text-xs tracking-[0.3em] text-amber-100/30">
            <span className="font-display text-lg">？？？</span>
            <span className="italic">walk every road · meet every mask</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

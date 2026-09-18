import { createElement, useMemo, useState } from "react";
import { SCENES, HIDDEN_TRUTH, ALL_ENDINGS, ALL_YOKAI_JOURNAL_IDS, START_SCENE, englishName } from "@/game/storyData";
import { useGameStore } from "@/game/useGameStore";

// Dynamic re-routes handled in the store, drawn here as extra threads.
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
  const revealed = isEnding ? unlocked : known;
  const label = revealed ? englishName(scene) : isEnding ? "Sealed ending" : "Unknown place";
  const cls = isEnding
    ? unlocked
      ? "border-red-800/70 bg-red-800/90 text-amber-50"
      : "border-stone-400/50 bg-stone-200/60 text-stone-500"
    : known
    ? "border-stone-600/40 bg-stone-100/80 text-stone-900"
    : "border-dashed border-stone-400/60 bg-transparent text-stone-500";
  return (
    <li className="relative pl-5">
      <span className="absolute left-0 top-[18px] h-px w-4 bg-stone-500/40" />
      <button
        type="button"
        data-testid={`tree-node-${node.id}`}
        onMouseEnter={() => onHover(revealed ? scene : null)}
        onMouseLeave={() => onHover(null)}
        className={`my-1 inline-flex items-center gap-2 rounded-sm border px-2.5 py-1.5 font-serif-jp text-xs tracking-wide transition ${cls} ${node.ref ? "italic opacity-60" : ""}`}
      >
        {revealed && <span className="font-display text-[10px] opacity-70">{scene.kanji.slice(0, 2)}</span>}
        {label}
        {isEnding && <span className="text-[9px] uppercase tracking-widest opacity-70">end</span>}
        {node.ref && <span className="text-[10px]">↺ see above</span>}
      </button>
      {node.children.length > 0 && (
        <ul className="ml-3 border-l border-stone-500/30">
          {node.children.map((c) =>
            createElement(Node, { key: node.id + ">" + c.id, node: c, seenScenes, unlockedEndings, onHover })
          )}
        </ul>
      )}
    </li>
  );
}

export default function EndingTree() {
  const { seenScenes, unlockedEndings, journal, hiddenTruthUnlocked } = useGameStore();
  const [hover, setHover] = useState(null);
  const tree = useMemo(() => buildTree(START_SCENE, new Set()), []);

  const total = ALL_ENDINGS.length;
  const found = ALL_ENDINGS.filter((e) => unlockedEndings.includes(e.id)).length;
  const yokaiFound = ALL_YOKAI_JOURNAL_IDS.filter((id) => journal.some((j) => j.id === id)).length;

  return (
    <div data-testid="ending-tree">
      <div className="mb-3 flex items-baseline justify-between font-serif-jp text-xs tracking-[0.2em] text-stone-600">
        <span>Threads of cause and effect</span>
        <span className="text-red-800" data-testid="ending-tree-progress">
          {found} / {total} endings · {yokaiFound} / {ALL_YOKAI_JOURNAL_IDS.length} yokai
        </span>
      </div>
      <p className="mb-4 font-hand text-sm italic leading-relaxed text-stone-600">
        Every road you have walked is inked here. Dashed places are still unvisited; grey seals are endings not yet reached.
      </p>
      <ul>
        <Node node={tree} seenScenes={seenScenes} unlockedEndings={unlockedEndings} onHover={setHover} />
      </ul>
      <div className="mt-3 min-h-5 font-serif-jp text-xs italic tracking-wide text-stone-600" data-testid="ending-tree-hint">
        {hover
          ? `${hover.kanji} · ${hover.romaji}`
          : found < total
          ? "Other threads remain. Try different roads."
          : "Every thread has been walked. Some more than once."}
      </div>
      <div className="mt-5 border-t border-dashed border-stone-500/30 pt-4">
        {hiddenTruthUnlocked ? (
          <div data-testid="hidden-truth-ready" className="flex items-center justify-between font-serif-jp text-xs tracking-[0.2em] text-red-800">
            <span className="font-display text-lg">{HIDDEN_TRUTH.kanji} · {englishName(HIDDEN_TRUTH)}</span>
            <span className="italic">the hidden truth waits on the cover</span>
          </div>
        ) : (
          <div data-testid="hidden-truth-locked" className="flex items-center justify-between font-serif-jp text-xs tracking-[0.2em] text-stone-500">
            <span className="font-display text-lg">？？？</span>
            <span className="italic">walk every road · meet every mask</span>
          </div>
        )}
      </div>
    </div>
  );
}

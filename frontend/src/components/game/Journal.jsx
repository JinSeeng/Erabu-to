import { useState } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/game/useGameStore";
import EntryPortrait from "./EntryPortrait";
import EndingTree from "./EndingTree";

const TABS = [
  { id: "lore", kanji: "怪", label: "Lore" },
  { id: "threads", kanji: "因果", label: "Threads" },
];

export default function Journal({ open, onClose }) {
  const { journal } = useGameStore();
  const [tab, setTab] = useState("lore");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/75 backdrop-blur-sm"
          onClick={onClose}
          data-testid="journal-panel"
        >
          <motion.div
            initial={{ opacity: 0, y: 24, rotateX: -3 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="washi relative m-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-sm shadow-2xl sm:m-8"
            style={{
              backgroundColor: "#f2eae1",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), inset 0 0 60px rgba(120,80,40,0.15)",
            }}
          >
            <div className="flex items-center justify-between border-b border-stone-700/20 px-6 py-4">
              <div>
                <h2 className="font-display text-3xl tracking-widest text-stone-900">手帖</h2>
                <p className="font-serif-jp text-xs italic tracking-[0.25em] text-stone-700">
                  Techō · the traveller's notebook
                </p>
              </div>
              <div className="flex items-center gap-2">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    data-testid={`journal-tab-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={
                      "flex items-center gap-2 rounded-sm border px-3 py-1.5 font-serif-jp text-xs tracking-[0.2em] transition " +
                      (tab === t.id
                        ? "border-red-800/70 bg-red-800/90 text-amber-50"
                        : "border-stone-500/30 text-stone-700 hover:border-red-700 hover:text-red-800")
                    }
                  >
                    <span className="font-display">{t.kanji}</span> {t.label}
                  </button>
                ))}
                <button
                  onClick={onClose}
                  data-testid="journal-close-btn"
                  aria-label="Close journal"
                  className="ml-2 rounded-sm border border-stone-500/30 p-2 text-stone-700 transition hover:border-red-700 hover:text-red-800"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="max-h-[70vh] overflow-y-auto px-6 py-6 sm:px-10">
              {tab === "threads" ? <EndingTree /> : <LorePage journal={journal} />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LorePage({ journal }) {
  if (journal.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-hand text-lg italic text-stone-600">The pages are blank.</p>
        <p className="mt-3 font-serif-jp text-sm text-stone-500">
          Explore, listen, and pay attention. This journal fills only with what you have truly seen.
        </p>
      </div>
    );
  }
  return (
    <ul className="space-y-8">
      {journal.map((entry, i) => (
        <li key={entry.id} className="relative" data-testid={`journal-entry-${entry.id}`}>
          <div className="flex gap-5">
            <EntryPortrait entryId={entry.id} />
            <div className="flex-1">
              <div className="flex items-baseline gap-3">
                <span className="font-display text-xl text-red-800">◆</span>
                <h3 className="font-display text-xl tracking-wider text-stone-900">{entry.title}</h3>
              </div>
              <p className="mt-3 font-hand text-base leading-loose text-stone-800">{entry.body}</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="hanko-seal font-display text-xs">記</span>
                <span className="font-serif-jp text-xs italic text-stone-500">entry {i + 1}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 border-b border-dashed border-stone-500/30" />
        </li>
      ))}
    </ul>
  );
}

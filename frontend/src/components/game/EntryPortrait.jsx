import { useEffect, useState } from "react";
import { fetchSceneImage } from "@/game/imageService";

// Small circular sumi-e portrait for a journal entry, generated once via Gemini
// Nano Banana and cached in Mongo under a distinct `entry_id`.
const PORTRAIT_PROMPTS = {
  paper_doll:
    "a single blank-faced Japanese paper hitogata doll on aged washi parchment, delicate sumi-e ink brushwork, small circular composition, muted vermilion accent seal",
  hanako_bride:
    "a silhouette of a Japanese ghost bride in a long white kimono under a plum branch, back turned, long black hair, sumi-e ink wash on aged washi, small circular composition, muted vermilion accent",
  kappa:
    "a small hunched kappa water yokai with a shallow dish on its head, half emerging from dark water among reeds, traditional Japanese sumi-e ink brushwork, small circular composition, muted vermilion seal",
  jorogumo:
    "an elegant woman in a black kimono seated with her back turned, thin silk threads catching moonlight around her, hint of extra spider limbs in shadow, sumi-e ink wash, small circular composition, muted vermilion accent",
  village_shift:
    "an old Japanese well at dusk with a paper lantern beside it and a very thin distant figure, sumi-e ink brushwork, small circular composition, muted vermilion seal",
  kuchisake:
    "a woman in a beige surgical mask on a dusk country road holding a pair of scissors half-hidden in her sleeve, sumi-e ink brushwork, small circular composition, muted vermilion accent seal",
};

export default function EntryPortrait({ entryId }) {
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const prompt = PORTRAIT_PROMPTS[entryId];
    if (!prompt) {
      setLoading(false);
      return;
    }
    (async () => {
      const img = await fetchSceneImage(`portrait_${entryId}`, prompt);
      if (!cancelled) {
        setUrl(img);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [entryId]);

  return (
    <div
      className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border border-stone-500/40 shadow-inner sm:h-28 sm:w-28"
      data-testid={`entry-portrait-${entryId}`}
      style={{ boxShadow: "inset 0 0 20px rgba(90,60,30,0.35)" }}
    >
      <div className="washi absolute inset-0" />
      {url ? (
        <img
          src={url}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "sepia(0.15) contrast(1.05)" }}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display text-xs tracking-widest text-stone-500">
            {loading ? "筆…" : "◇"}
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-full [background:radial-gradient(circle,transparent_55%,rgba(30,20,10,0.35)_100%)]" />
    </div>
  );
}

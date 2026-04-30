import { useState } from "react";
import { ChevronUp } from "lucide-react";
import { CONSTELLATION_MENU_ITEMS } from "../../lib/constellations";
import { getConstellationStory } from "../../lib/learning/constellationStories";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { BottomSheet } from "./BottomSheet";
import { ConstellationStoryCard } from "./ConstellationStoryCard";

export const ConstellationMiniCard = () => {
  const { locale } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [expanded, setExpanded] = useState(false);

  if (!selectedConstellation) return null;

  const item = CONSTELLATION_MENU_ITEMS.find((i) => i.id === selectedConstellation);
  const label = item?.[locale === "sv" ? "labelSv" : "labelEn"] ?? selectedConstellation;
  const story = getConstellationStory(selectedConstellation);
  const preview = story?.story[locale as "sv" | "en"]?.slice(0, 72) ?? "";

  return (
    <>
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="pointer-events-auto fixed inset-x-3 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-[15] flex items-center justify-between rounded-xl border border-indigo-400/30 bg-black/80 px-3 py-2.5 text-left backdrop-blur-md transition hover:border-indigo-400/50 hover:bg-black/90"
      >
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-indigo-200">✦ {label}</p>
          {preview && (
            <p className="mt-0.5 truncate text-[11px] text-white/45">{preview}…</p>
          )}
        </div>
        <div className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-400/45 bg-indigo-500/15 text-indigo-400">
          <ChevronUp className="h-3.5 w-3.5" aria-hidden />
        </div>
      </button>

      <BottomSheet
        open={expanded}
        onClose={() => setExpanded(false)}
        title={label}
        panelClassName="max-h-[min(92dvh,32rem)]"
      >
        <div className="p-3 pt-0">
          <ConstellationStoryCard />
        </div>
      </BottomSheet>
    </>
  );
};

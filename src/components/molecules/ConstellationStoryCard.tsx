import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getConstellationStory } from "../../lib/learning/constellationStories";
import { useStore } from "../../store/useStore";

type StoryTab = "story" | "findIt" | "funFact";

export const ConstellationStoryCard = () => {
  const { locale, t } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [activeTab, setActiveTab] = useState<StoryTab>("story");

  if (!selectedConstellation) return null;

  const storyData = getConstellationStory(selectedConstellation);
  if (!storyData) return null;

  const tabs: Array<{ id: StoryTab; label: string }> = [
    { id: "story", label: t.learn.ui.constellationStory },
    { id: "findIt", label: t.learn.ui.constellationFindIt },
    { id: "funFact", label: t.learn.ui.constellationFunFact },
  ];

  const content = storyData[activeTab][locale];

  return (
    <div className="pointer-events-auto rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 space-y-3">
      <div className="flex gap-0.5 rounded-lg bg-white/5 p-0.5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex-1 rounded-md py-1.5 text-xs font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white/15 text-white"
                : "text-white/50 hover:text-white/80",
            ].join(" ")}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-white/75 leading-relaxed">{content}</p>
    </div>
  );
};

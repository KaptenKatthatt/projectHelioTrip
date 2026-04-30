import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getConstellationStory } from "../../lib/learning/constellationStories";
import { useStore } from "../../store/useStore";
import { HudSegmentedTabs } from "./HudSegmentedTabs";

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
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md p-4 space-y-3">
      <HudSegmentedTabs
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
      />
      <p className="max-w-prose text-xs leading-relaxed text-white/75">{content}</p>
    </div>
  );
};

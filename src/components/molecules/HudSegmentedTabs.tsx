type HudSegmentedTab<T extends string> = { id: T; label: string };

type HudSegmentedTabsProps<T extends string> = {
  tabs: HudSegmentedTab<T>[];
  activeTab: T;
  onSelect: (id: T) => void;
  className?: string;
};

export function HudSegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onSelect,
  className,
}: HudSegmentedTabsProps<T>) {
  return (
    <div
      className={["flex gap-0.5 rounded-lg bg-white/5 p-0.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
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
  );
}

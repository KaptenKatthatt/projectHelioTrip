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
      className={["flex gap-1 rounded-lg bg-white/5 p-1", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onSelect(tab.id)}
          className={[
            "min-w-0 flex-1 rounded-md px-2 py-1.5 text-xs font-medium leading-4 transition-colors",
            activeTab === tab.id
              ? "bg-white/15 text-white"
              : "text-white/50 hover:text-white/80",
          ].join(" ")}
        >
          <span className="block truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

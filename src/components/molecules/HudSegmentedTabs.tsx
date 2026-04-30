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
      role="tablist"
      className={["flex gap-0.5 rounded-lg bg-white/5 p-0.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.id)}
            className={[
              "min-w-0 flex-1 rounded-md px-1 py-1.5 text-[11px] font-medium leading-tight transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:px-1.5 sm:text-xs",
              isActive
                ? "bg-white/20 text-white shadow-sm"
                : "text-white/50 hover:text-white/80",
            ].join(" ")}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

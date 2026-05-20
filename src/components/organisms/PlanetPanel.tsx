import { useCallback, useEffect, useState } from "react";
import { useActiveBodyViewGameMode } from "../../hooks/useActiveBodyViewGameMode";
import { useIsMobileLayout } from "../../hooks/useIsMobileLayout";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { getBody } from "../../lib/bodies";
import { getWikipediaUrl } from "../../lib/wikipedia";
import { FactCardDeck } from "../molecules/FactCardDeck";
import { HudSegmentedTabs } from "../molecules/HudSegmentedTabs";
import { ScaleComparison } from "../molecules/ScaleComparison";
import { buildPlanetInfoRows } from "./PlanetPanel/utils";
import { InfoTab } from "./PlanetPanel/InfoTab";
import { useBodyDistances } from "./PlanetPanel/useBodyDistances";
import { useFormatters } from "./PlanetPanel/useFormatters";

export type PanelTab = "info" | "facts" | "compare";

type PlanetPanelProps = {
  readonly omitHeading?: boolean;
  readonly defaultTab?: PanelTab;
};

export const PlanetPanel = ({ omitHeading = false, defaultTab }: PlanetPanelProps) => {
  const { t, planetName, bodyName, locale } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const layoutTier = useResponsiveLayout();
  const { activeBody, viewMode, gameMode } = useActiveBodyViewGameMode();

  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab ?? "info");

  useEffect(() => {
    if (gameMode !== "learn") return;
    const id = requestAnimationFrame(() => {
      setActiveTab("facts");
    });
    return () => cancelAnimationFrame(id);
  }, [gameMode]);

  const { distanceFromSunAu, distanceToEarthAu } = useBodyDistances(activeBody);
  const formatters = useFormatters(locale);

  const openWikipedia = useCallback(() => {
    if (!activeBody) return;
    const url = getWikipediaUrl(activeBody, locale);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [activeBody, locale]);

  if (!activeBody || viewMode === "overview") return null;
  const body = getBody(activeBody);
  if (!body) return null;

  const infoRowsResult = buildPlanetInfoRows(
    activeBody,
    t,
    planetName,
    locale,
    distanceFromSunAu,
    distanceToEarthAu,
    formatters,
  );

  if (!infoRowsResult) return null;

  const { rows, hasLongOrbitPeriod } = infoRowsResult;
  const name = bodyName(activeBody);

  const tabs: Array<{ id: PanelTab; label: string }> = [
    { id: "info", label: t.ui.bodyInfo },
    { id: "facts", label: t.learn.ui.factsTab },
    { id: "compare", label: t.learn.ui.compareSize },
  ];

  return (
    <aside
      className={
        `pointer-events-auto w-full ${layoutTier === "medium" ? "max-w-xl animate-slide-up" : hasLongOrbitPeriod ? "max-w-lg" : "max-w-md"} rounded-2xl border border-white/10 bg-space-dark-900/95 backdrop-blur-md ` +
        (mobileLayout ? "p-4" : "p-4 sm:p-5") +
        (omitHeading ? " border-0 p-0 backdrop-blur-none sm:p-0" : "")
      }
    >
      {!omitHeading ? (
        <div className="flex items-center gap-3">
          <span
            className="h-3 w-3 rounded-full ring-1 ring-white/20"
            style={{ backgroundColor: body.def.color }}
          />
          <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
        </div>
      ) : null}

      <HudSegmentedTabs
        className="mt-3"
        tabs={tabs}
        activeTab={activeTab}
        onSelect={setActiveTab}
      />

      {activeTab === "info" && (
        <InfoTab
          rows={rows}
          activeBody={activeBody}
          name={name}
          openWikipedia={openWikipedia}
          mobileLayout={mobileLayout}
          omitHeading={omitHeading}
          t={t}
          layoutTier={layoutTier}
        />
      )}

      {activeTab === "facts" && (
        <div className="mt-4">
          <FactCardDeck bodyId={activeBody} />
        </div>
      )}

      {activeTab === "compare" && (
        <div className="mt-4">
          <ScaleComparison key={activeBody} bodyId={activeBody} />
        </div>
      )}
    </aside>
  );
};

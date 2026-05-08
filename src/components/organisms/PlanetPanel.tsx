import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useActiveBodyViewGameMode } from "../../hooks/useActiveBodyViewGameMode";
import { useIsMobileLayout } from "../../hooks/useIsMobileLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { getBody } from "../../lib/bodies";
import { AU_SCALE } from "../../lib/constants";
import type { SatelliteId } from "../../lib/satellites";
import {
  getLiveMoonOffset,
  getLivePosition,
  getLiveSatelliteOffset,
} from "../../lib/positionsBus";
import { PLANET_ORBITAL_ELEMENTS } from "../../lib/orbitalElements";
import { getWikipediaUrl } from "../../lib/wikipedia";
import { FactCardDeck } from "../molecules/FactCardDeck";
import { HudSegmentedTabs } from "../molecules/HudSegmentedTabs";
import { ScaleComparison } from "../molecules/ScaleComparison";
import {
  AU_TO_KM,
  KM_TO_MILES,
  DISTANCE_SAMPLE_MS,
  DISTANCE_EPSILON_AU,
  worldDistanceToEarthAu,
  resolveOrbitingDistancePair,
  formatOrbitPeriod,
} from "./PlanetPanel/utils";
import type { Row, DistancePair } from "./PlanetPanel/utils";
import { InfoTab } from "./PlanetPanel/InfoTab";

const SATELLITE_PERIOD_HOURS: Partial<Record<SatelliteId, number>> = {
  iss: 92 / 60,
  sputnik: 96.2 / 60,
};

export type PanelTab = "info" | "facts" | "compare";

type PlanetPanelProps = {
  readonly omitHeading?: boolean;
  readonly defaultTab?: PanelTab;
};

const updateDistanceIfChanged = (
  setDistanceFromSunAu: Dispatch<SetStateAction<number>>,
  setDistanceToEarthAu: Dispatch<SetStateAction<number>>,
  nextDistances: DistancePair,
): void => {
  setDistanceFromSunAu((prev) =>
    Math.abs(prev - nextDistances.fromSunAu) > DISTANCE_EPSILON_AU
      ? nextDistances.fromSunAu
      : prev,
  );
  setDistanceToEarthAu((prev) =>
    Math.abs(prev - nextDistances.toEarthAu) > DISTANCE_EPSILON_AU
      ? nextDistances.toEarthAu
      : prev,
  );
};

export const PlanetPanel = ({ omitHeading = false, defaultTab }: PlanetPanelProps) => {
  const { t, planetName, bodyName, locale } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const { activeBody, viewMode, gameMode } = useActiveBodyViewGameMode();

  const [activeTab, setActiveTab] = useState<PanelTab>(defaultTab ?? "info");

  useEffect(() => {
    if (gameMode !== "learn") return;
    const id = requestAnimationFrame(() => {
      setActiveTab("facts");
    });
    return () => cancelAnimationFrame(id);
  }, [gameMode]);

  const [distanceFromSunAu, setDistanceFromSunAu] = useState(0);
  const [distanceToEarthAu, setDistanceToEarthAu] = useState(0);

  useEffect(() => {
    if (!activeBody) return;
    const body = getBody(activeBody);
    if (!body) return;

    const tick = () => {
      const distances =
        body.kind === "planet"
          ? (() => {
              const position = getLivePosition(body.def.id);
              const fromSunAu = position.length() / AU_SCALE;
              if (body.def.id === "earth") {
                return { fromSunAu, toEarthAu: 0 };
              }
              return {
                fromSunAu,
                toEarthAu: worldDistanceToEarthAu(position.x, position.y, position.z),
              };
            })()
          : resolveOrbitingDistancePair(
              body.def.parent,
              body.kind === "moon"
                ? getLiveMoonOffset(body.def.id)
                : getLiveSatelliteOffset(body.def.id),
            );
      updateDistanceIfChanged(
        setDistanceFromSunAu,
        setDistanceToEarthAu,
        distances,
      );
    };

    tick();
    const interval = window.setInterval(tick, DISTANCE_SAMPLE_MS);
    return () => window.clearInterval(interval);
  }, [activeBody]);

  const openWikipedia = useCallback(() => {
    if (!activeBody) return;
    const url = getWikipediaUrl(activeBody, locale);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [activeBody, locale]);

  const {
    distanceFormatter,
    ratioFormatter,
    orbitPeriodFormatter,
    orbitHoursFormatter,
  } = useMemo(
    () => ({
      distanceFormatter: new Intl.NumberFormat(locale, {
        maximumFractionDigits: 0,
      }),
      ratioFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
      orbitPeriodFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      orbitHoursFormatter: new Intl.NumberFormat(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
      }),
    }),
    [locale],
  );

  if (!activeBody || viewMode === "overview") return null;
  const body = getBody(activeBody);
  if (!body) return null;

  const usesMiles = locale === "en";
  const distanceUnit = usesMiles ? "miles" : "km";
  const orbitPeriodUnit = t.ui.unitDays;
  const getHoursUnit = (hours: number): string => {
    return hours === 1 ? t.ui.unitHour : t.ui.unitHours;
  };
  const distanceFromSunKm = distanceFromSunAu * AU_TO_KM;
  const distanceToEarthKm = distanceToEarthAu * AU_TO_KM;
  const displayDistanceFromSun = usesMiles
    ? distanceFromSunKm * KM_TO_MILES
    : distanceFromSunKm;
  const displayDistanceToEarth = usesMiles
    ? distanceToEarthKm * KM_TO_MILES
    : distanceToEarthKm;

  const orbitalPeriodDays =
    body.kind === "planet"
      ? PLANET_ORBITAL_ELEMENTS[body.def.id]?.periodDays
      : PLANET_ORBITAL_ELEMENTS[body.def.parent]?.periodDays;
  const satelliteOrbitalPeriodHours =
    body.kind === "satellite"
      ? SATELLITE_PERIOD_HOURS[body.def.id as SatelliteId]
      : undefined;
  const hasLongOrbitPeriod =
    satelliteOrbitalPeriodHours === undefined &&
    orbitalPeriodDays !== undefined &&
    orbitalPeriodDays > 365;

  const radiusScale = body.def.radius;

  const rows: Row[] = [];
  rows.push({
    label: t.ui.distanceFromSun,
    value: `${distanceFormatter.format(displayDistanceFromSun)} ${distanceUnit}`,
  });
  rows.push({
    label: t.ui.distanceFromEarth,
    value: `${distanceFormatter.format(displayDistanceToEarth)} ${distanceUnit}`,
  });
  rows.push({
    label:
      satelliteOrbitalPeriodHours !== undefined
        ? t.ui.orbitPeriodAroundEarth
        : t.ui.orbitPeriodAroundSun,
    value:
      satelliteOrbitalPeriodHours !== undefined
        ? `${orbitHoursFormatter.format(satelliteOrbitalPeriodHours)} ${getHoursUnit(satelliteOrbitalPeriodHours)}`
        : orbitalPeriodDays !== undefined
          ? formatOrbitPeriod(
              orbitalPeriodDays,
              locale,
              orbitPeriodFormatter,
              orbitPeriodUnit,
            )
          : "—",
  });
  rows.push({
    label: t.ui.circumferenceRelativeToEarth,
    value: `${planetName("earth")} x ${ratioFormatter.format(radiusScale)}`,
  });
  const name = bodyName(activeBody);

  const tabs: Array<{ id: PanelTab; label: string }> = [
    { id: "info", label: t.ui.bodyInfo },
    { id: "facts", label: t.learn.ui.factsTab },
    { id: "compare", label: t.learn.ui.compareSize },
  ];

  return (
    <aside
      className={
        `pointer-events-auto w-full ${hasLongOrbitPeriod ? "max-w-lg" : "max-w-md"} rounded-2xl border border-white/10 bg-[#05060a] backdrop-blur-none ` +
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

import { ExternalLink } from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useIsMobileLayout } from "../../hooks/useIsMobileLayout";
import { useTranslation } from "../../hooks/useTranslation";
import { getBody } from "../../lib/bodies";
import { AU_SCALE } from "../../lib/constants";
import {
  getLiveMoonOffset,
  getLivePosition,
  getLiveSatelliteOffset,
} from "../../lib/positionsBus";
import type { PlanetId } from "../../lib/planets";
import { PLANET_ORBITAL_ELEMENTS } from "../../lib/orbitalElements";
import { getWikipediaUrl } from "../../lib/wikipedia";
import { useStore } from "../../store/useStore";

type Row = {
  label: string;
  value: string;
};

type PlanetPanelProps = {
  readonly omitHeading?: boolean;
};

const DISTANCE_SAMPLE_MS = 160;
const DISTANCE_EPSILON_AU = 0.00001;
const AU_TO_KM = 149_597_870.7;
const KM_TO_MILES = 0.621371192;

type DistancePair = {
  fromSunAu: number;
  toEarthAu: number;
};

const worldDistanceToEarthAu = (worldX: number, worldY: number, worldZ: number) => {
  const earth = getLivePosition("earth");
  return Math.hypot(worldX - earth.x, worldY - earth.y, worldZ - earth.z) / AU_SCALE;
};

const resolveOrbitingDistancePair = (
  parentId: PlanetId,
  offset: { x: number; y: number; z: number },
): DistancePair => {
  const parent = getLivePosition(parentId);
  const worldX = parent.x + offset.x;
  const worldY = parent.y + offset.y;
  const worldZ = parent.z + offset.z;
  return {
    fromSunAu: Math.hypot(worldX, worldY, worldZ) / AU_SCALE,
    toEarthAu: worldDistanceToEarthAu(worldX, worldY, worldZ),
  };
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

const formatOrbitPeriod = (
  days: number,
  locale: string,
  orbitPeriodFormatter: Intl.NumberFormat,
  orbitPeriodUnit: string,
): string => {
  if (days <= 365) return `${orbitPeriodFormatter.format(days)} ${orbitPeriodUnit}`;

  const totalDays = Math.round(days);
  const years = Math.floor(totalDays / 365);
  const afterYears = totalDays % 365;
  const months = Math.floor(afterYears / 30);
  const remainingDays = afterYears % 30;
  const yearLabel = locale === "en" ? (years === 1 ? "year" : "years") : "år";
  const monthLabel =
    locale === "en"
      ? months === 1
        ? "month"
        : "months"
      : months === 1
        ? "månad"
        : "månader";
  const dayLabel =
    locale === "en"
      ? remainingDays === 1
        ? "day"
        : "days"
      : "dygn";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${yearLabel}`);
  if (months > 0) parts.push(`${months} ${monthLabel}`);
  if (remainingDays > 0 || parts.length === 0) {
    parts.push(`${remainingDays} ${dayLabel}`);
  }
  return parts.join(" ");
};

export const PlanetPanel = ({ omitHeading = false }: PlanetPanelProps) => {
  const { t, planetName, bodyName, locale } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);

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
  const issRealOrbitalPeriodHours = 92 / 60;
  const issOrbitalPeriodHours =
    body.kind === "satellite" && body.def.id === "iss"
      ? issRealOrbitalPeriodHours
      : undefined;
  const hasLongOrbitPeriod =
    issOrbitalPeriodHours === undefined &&
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
      issOrbitalPeriodHours !== undefined
        ? t.ui.orbitPeriodAroundEarth
        : t.ui.orbitPeriodAroundSun,
    value:
      issOrbitalPeriodHours !== undefined
        ? `${orbitHoursFormatter.format(issOrbitalPeriodHours)} ${getHoursUnit(issOrbitalPeriodHours)}`
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
      <dl className={omitHeading ? "mt-0 space-y-2 text-sm" : "mt-4 space-y-2 text-sm"}>
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex min-w-0 items-center justify-between gap-4 overflow-x-auto"
          >
            <dt className="shrink-0 whitespace-nowrap text-white/55">
              {r.label}
            </dt>
            <dd className="shrink-0 whitespace-nowrap font-mono text-white">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={openWikipedia}
        aria-label={`${t.ui.readOnWikipedia}: ${name}`}
        className={
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 " +
          (mobileLayout && omitHeading
            ? "bg-white/12 hover:border-white/25 hover:bg-white/16"
            : "bg-white/5 hover:border-white/25 hover:bg-white/10")
        }
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t.ui.readOnWikipedia}
      </button>
    </aside>
  );
};

/**
 * Planet Panel Utilities and Calculations
 * 
 * Provides mathematical functions for calculating real-time distances between 
 * celestial bodies (relative to the Sun and Earth) and formatting orbital 
 * periods into human-readable strings.
 */
import type { PlanetId } from "../../../lib/planets";
import { AU_SCALE } from "../../../lib/constants";
import { getLivePosition } from "../../../lib/positionsBus";
import type { BodyId } from "../../../lib/bodies";
import type { SatelliteId } from "../../../lib/satellites";
import { getBody } from "../../../lib/bodies";
import { PLANET_ORBITAL_ELEMENTS } from "../../../lib/orbitalElements";
import type { Translation } from "../../../i18n/translations";

export type Row = {
  label: string;
  value: string;
};

export type DistancePair = {
  fromSunAu: number;
  toEarthAu: number;
};

const AU_TO_KM = 149_597_870.7;
const KM_TO_MILES = 0.621371192;
export const DISTANCE_SAMPLE_MS = 250;
export const DISTANCE_EPSILON_AU = 0.00001;

export const worldDistanceToEarthAu = (worldX: number, worldY: number, worldZ: number) => {
  const earth = getLivePosition("earth");
  return Math.hypot(worldX - earth.x, worldY - earth.y, worldZ - earth.z) / AU_SCALE;
};

export const resolveOrbitingDistancePair = (
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

const SATELLITE_PERIOD_HOURS: Record<SatelliteId, number> = {
  iss: 92 / 60,
  sputnik: 96.2 / 60,
};

type Formatters = {
  distanceFormatter: Intl.NumberFormat;
  ratioFormatter: Intl.NumberFormat;
  orbitPeriodFormatter: Intl.NumberFormat;
  orbitHoursFormatter: Intl.NumberFormat;
};

export const buildPlanetInfoRows = (
  activeBody: BodyId,
  t: Translation,
  planetName: (id: PlanetId) => string,
  locale: string,
  distanceFromSunAu: number,
  distanceToEarthAu: number,
  formatters: Formatters,
): { rows: Row[]; hasLongOrbitPeriod: boolean } | null => {
  const body = getBody(activeBody);
  if (!body) return null;

  const {
    distanceFormatter,
    ratioFormatter,
    orbitPeriodFormatter,
    orbitHoursFormatter,
  } = formatters;

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

  const formatOrbitDays = (days: number): string =>
    formatOrbitPeriod(days, locale, orbitPeriodFormatter, orbitPeriodUnit);

  const planetOrbitalPeriodDays =
    body.kind === "planet"
      ? PLANET_ORBITAL_ELEMENTS[body.def.id]?.periodDays
      : undefined;
  const hasLongOrbitPeriod =
    planetOrbitalPeriodDays !== undefined && planetOrbitalPeriodDays > 365;

  const periodRow = ((): Row => {
    switch (body.kind) {
      case "planet":
        return {
          label: t.ui.orbitPeriodAroundSun,
          value:
            planetOrbitalPeriodDays !== undefined
              ? formatOrbitDays(planetOrbitalPeriodDays)
              : "—",
        };
      case "moon":
        // Tidally locked (see MoonDefinition.rotationPeriodHours), so the
        // rotation period equals the orbital period around the parent;
        // abs() handles retrograde moons like Triton.
        return {
          label: t.ui.orbitPeriodAroundPlanet(planetName(body.def.parent)),
          value: formatOrbitDays(Math.abs(body.def.rotationPeriodHours) / 24),
        };
      case "satellite": {
        const hours = SATELLITE_PERIOD_HOURS[body.def.id];
        return {
          label: t.ui.orbitPeriodAroundPlanet(planetName(body.def.parent)),
          value: `${orbitHoursFormatter.format(hours)} ${getHoursUnit(hours)}`,
        };
      }
    }
  })();

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
  rows.push(periodRow);
  rows.push({
    label: t.ui.circumferenceRelativeToEarth,
    value: `${planetName("earth")} x ${ratioFormatter.format(radiusScale)}`,
  });

  return { rows, hasLongOrbitPeriod };
};

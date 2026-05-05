/**
 * Planet Panel Utilities and Calculations
 * 
 * Provides mathematical functions for calculating real-time distances between 
 * celestial bodies (relative to the Sun and Earth) and formatting orbital 
 * periods into human-readable strings.
 */
import { PlanetId } from "../../../lib/planets";
import { AU_SCALE } from "../../../lib/constants";
import { getLivePosition, getLiveMoonOffset, getLiveSatelliteOffset } from "../../../lib/positionsBus";

export type Row = {
  label: string;
  value: string;
};

export type DistancePair = {
  fromSunAu: number;
  toEarthAu: number;
};

export const AU_TO_KM = 149_597_870.7;
export const KM_TO_MILES = 0.621371192;
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

export const formatOrbitPeriod = (
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

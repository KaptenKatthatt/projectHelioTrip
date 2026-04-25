import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  getLiveMoonOffset,
  getLivePosition,
  getLiveSatelliteOffset,
} from '../lib/positionsBus';
import { getBody } from '../lib/bodies';
import { AU_SCALE } from '../lib/constants';
import { getWikipediaUrl } from '../lib/wikipedia';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { useTranslation } from '../hooks/useTranslation';
import { PLANET_ORBITAL_ELEMENTS } from '../lib/orbitalElements';
import type { PlanetId } from '../lib/planets';

type Row = {
  label: string;
  value: string;
};

export const PlanetPanel = () => {
  const { t, planetName, bodyName, locale } = useTranslation();
  const mobileLayout = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const isTraveling = useStore((s) => s.isTraveling);

  const [distanceFromSunAu, setDistanceFromSunAu] = useState(0);
  const [distanceToEarthAu, setDistanceToEarthAu] = useState(0);

  useEffect(() => {
    if (!activeBody) return;
    const body = getBody(activeBody);
    if (!body) return;

    const computeAndSetDistances = (
      parentId: PlanetId,
      offset: { x: number; y: number; z: number },
    ) => {
      const parent = getLivePosition(parentId);
      const worldX = parent.x + offset.x;
      const worldY = parent.y + offset.y;
      const worldZ = parent.z + offset.z;
      const earth = getLivePosition('earth');
      setDistanceFromSunAu(Math.hypot(worldX, worldY, worldZ) / AU_SCALE);
      setDistanceToEarthAu(
        Math.hypot(worldX - earth.x, worldY - earth.y, worldZ - earth.z) /
          AU_SCALE,
      );
    };

    let raf = 0;
    const tick = () => {
      if (body.kind === 'moon') {
        computeAndSetDistances(body.def.parent, getLiveMoonOffset(body.def.id));
      } else if (body.kind === 'satellite') {
        computeAndSetDistances(
          body.def.parent,
          getLiveSatelliteOffset(body.def.id),
        );
      } else {
        const pos = getLivePosition(body.def.id);
        setDistanceFromSunAu(pos.length() / AU_SCALE);
        if (body.def.id === 'earth') {
          setDistanceToEarthAu(0);
        } else {
          const earth = getLivePosition('earth');
          setDistanceToEarthAu(
            Math.hypot(pos.x - earth.x, pos.y - earth.y, pos.z - earth.z) /
              AU_SCALE,
          );
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [activeBody]);

  const openWikipedia = useCallback(() => {
    if (!activeBody) return;
    const url = getWikipediaUrl(activeBody, locale);
    window.open(url, '_blank', 'noopener,noreferrer');
  }, [activeBody, locale]);

  if (!activeBody || viewMode === 'overview') return null;
  const body = getBody(activeBody);
  if (!body) return null;

  const auToKm = (valueAu: number): number => valueAu * 149_597_870.7;
  const kmToMiles = (valueKm: number): number => valueKm * 0.621371192;
  const usesMiles = locale === 'en';
  const distanceUnit = usesMiles ? 'miles' : 'km';
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
  const orbitPeriodUnit = locale === 'en' ? 'days' : 'dygn';
  const getHoursUnit = (hours: number): string => {
    if (locale === 'en') return hours === 1 ? 'hour' : 'hours';
    return hours === 1 ? 'timme' : 'timmar';
  };
  const formatOrbitPeriod = (days: number): string => {
    if (days <= 365) return `${orbitPeriodFormatter.format(days)} ${orbitPeriodUnit}`;

    const totalDays = Math.round(days);
    const years = Math.floor(totalDays / 365);
    const afterYears = totalDays % 365;
    const months = Math.floor(afterYears / 30);
    const remainingDays = afterYears % 30;

    const yearLabel = locale === 'en' ? (years === 1 ? 'year' : 'years') : 'år';
    const monthLabel =
      locale === 'en'
        ? months === 1
          ? 'month'
          : 'months'
        : months === 1
          ? 'månad'
          : 'månader';
    const dayLabel =
      locale === 'en'
        ? remainingDays === 1
          ? 'day'
          : 'days'
        : remainingDays === 1
          ? 'dygn'
          : 'dygn';

    const parts: string[] = [];
    if (years > 0) parts.push(`${years} ${yearLabel}`);
    if (months > 0) parts.push(`${months} ${monthLabel}`);
    if (remainingDays > 0 || parts.length === 0) {
      parts.push(`${remainingDays} ${dayLabel}`);
    }
    return parts.join(' ');
  };

  const distanceFromSunKm = auToKm(distanceFromSunAu);
  const distanceToEarthKm = auToKm(distanceToEarthAu);
  const displayDistanceFromSun = usesMiles
    ? kmToMiles(distanceFromSunKm)
    : distanceFromSunKm;
  const displayDistanceToEarth = usesMiles
    ? kmToMiles(distanceToEarthKm)
    : distanceToEarthKm;

  const orbitalPeriodDays =
    body.kind === 'planet'
      ? PLANET_ORBITAL_ELEMENTS[body.def.id]?.periodDays
      : PLANET_ORBITAL_ELEMENTS[body.def.parent]?.periodDays;
  const issRealOrbitalPeriodHours = 92 / 60;
  const issOrbitalPeriodHours =
    body.kind === 'satellite' && body.def.id === 'iss'
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
        ? formatOrbitPeriod(orbitalPeriodDays)
        : '—',
  });
  rows.push({
    label: t.ui.circumferenceRelativeToEarth,
    value: `${planetName('earth')} x ${ratioFormatter.format(radiusScale)}`,
  });
  const name = bodyName(activeBody);

  return (
    <aside
      className={
        `pointer-events-auto w-full ${hasLongOrbitPeriod ? 'max-w-lg' : 'max-w-md'} rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md ` +
        (mobileLayout ? 'p-4' : 'p-4 sm:p-5')
      }
    >
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ backgroundColor: body.def.color }}
        />
        <h2 className="text-lg font-semibold tracking-tight">{name}</h2>
      </div>
      {isTraveling && (
        <p className="mt-1 text-xs text-white/50">{t.ui.arriving}</p>
      )}
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between gap-4"
          >
            <dt className="text-white/55">{r.label}</dt>
            <dd className="font-mono text-white sm:whitespace-nowrap">{r.value}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={openWikipedia}
        aria-label={`${t.ui.readOnWikipedia}: ${name}`}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t.ui.readOnWikipedia}
      </button>
    </aside>
  );
};

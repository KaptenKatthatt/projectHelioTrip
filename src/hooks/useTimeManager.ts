import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import { useStore } from '../store/useStore';
import { PLANETS, type PlanetId } from '../lib/planets';
import { fetchPlanetPositionAu } from '../lib/api';
import { setLivePosition } from '../lib/positionsBus';
import { AU_SCALE, MS_PER_DAY } from '../lib/constants';

type DayMap = Map<PlanetId, Vector3>;

const isoDay = (dayNumber: number): string =>
  new Date(dayNumber * MS_PER_DAY).toISOString().slice(0, 10);

/**
 * Syncs livePositions with NASA Horizons data based on simulationTime.
 * Fetches one day's ephemeris per planet (cached), plus the following
 * day, then linearly interpolates between them every frame. Scaling
 * from AU to scene units happens here so the bus stays in 3D units.
 *
 * Must be called inside a <Canvas> because it registers useFrame.
 */
export const useTimeManager = (): void => {
  const dayCache = useMemo<Map<number, DayMap>>(() => new Map(), []);
  const pending = useRef(new Set<string>());

  useFrame((_state, delta) => {
    const { simulationTime, isPlaying, timeScale, setSimulationTime } =
      useStore.getState();

    if (isPlaying && timeScale !== 0) {
      const deltaMs = delta * timeScale * MS_PER_DAY;
      setSimulationTime(new Date(simulationTime.getTime() + deltaMs));
    }

    const currentSimTime = isPlaying && timeScale !== 0
      ? useStore.getState().simulationTime
      : simulationTime;
    const timeInDays = currentSimTime.getTime() / MS_PER_DAY;
    const dayFloor = Math.floor(timeInDays);
    const dayCeil = dayFloor + 1;
    const frac = timeInDays - dayFloor;

    ensureDayLoaded(dayCache, pending.current, dayFloor);
    ensureDayLoaded(dayCache, pending.current, dayCeil);

    const mapFloor = dayCache.get(dayFloor);
    const mapCeil = dayCache.get(dayCeil);

    for (const planet of PLANETS) {
      const a = mapFloor?.get(planet.id);
      const b = mapCeil?.get(planet.id);
      if (a && b) {
        setLivePosition(
          planet.id,
          (a.x + (b.x - a.x) * frac) * AU_SCALE,
          (a.y + (b.y - a.y) * frac) * AU_SCALE,
          (a.z + (b.z - a.z) * frac) * AU_SCALE,
        );
      } else if (a) {
        setLivePosition(
          planet.id,
          a.x * AU_SCALE,
          a.y * AU_SCALE,
          a.z * AU_SCALE,
        );
      }
    }
  });
};

const ensureDayLoaded = (
  cache: Map<number, DayMap>,
  pending: Set<string>,
  dayNumber: number,
): void => {
  if (cache.has(dayNumber) && cache.get(dayNumber)?.size === PLANETS.length) {
    return;
  }
  const date = isoDay(dayNumber);
  for (const planet of PLANETS) {
    if (cache.get(dayNumber)?.has(planet.id)) continue;
    const key = `${planet.id}:${date}`;
    if (pending.has(key)) continue;
    pending.add(key);
    fetchPlanetPositionAu(planet.id, date)
      .then((pos) => {
        let dayMap = cache.get(dayNumber);
        if (!dayMap) {
          dayMap = new Map();
          cache.set(dayNumber, dayMap);
        }
        dayMap.set(planet.id, pos);
      })
      .catch((err: unknown) => {
        console.warn(`[TimeManager] fetch failed for ${key}`, err);
      })
      .finally(() => {
        pending.delete(key);
      });
  }
};

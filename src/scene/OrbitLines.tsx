import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "@react-three/drei/core/Line";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useQualityPreset } from "../hooks/useQualityPreset";
import { PLANETS } from "../lib/planets";
import { useStore } from "../store/useStore";

const ORBIT_PLANETS = PLANETS.filter((p) => p.id !== "sun");

const OVERVIEW_MAX_SEGMENT_MULTIPLIER = 1.5;
const OVERVIEW_ULTRA_MAX_SEGMENT_MULTIPLIER = 1.65;
const NON_OVERVIEW_MAX_SEGMENT_MULTIPLIER = 1.5;
const CAMERA_QUALITY_DISTANCE_ENTER = 150;
const CAMERA_QUALITY_DISTANCE_EXIT = 120;
const CAMERA_QUALITY_SCALE = 1.12;
const CAMERA_ULTRA_QUALITY_DISTANCE_ENTER = 260;
const CAMERA_ULTRA_QUALITY_DISTANCE_EXIT = 220;

const ORBIT_MIN_RADIUS = Math.min(
  ...ORBIT_PLANETS.map((planet) => planet.position.length()),
);
const ORBIT_MAX_RADIUS = Math.max(
  ...ORBIT_PLANETS.map((planet) => planet.position.length()),
);

type OrbitLineData = {
  id: string;
  points: readonly Vector3[];
};

const buildOrbitPoints = (
  radius: number,
  baseSegments: number,
  maxSegmentMultiplier: number,
  cameraQualityScale: number,
): readonly Vector3[] => {
  const segmentRange = ORBIT_MAX_RADIUS - ORBIT_MIN_RADIUS;
  const ratio =
    segmentRange > 0 ? (radius - ORBIT_MIN_RADIUS) / segmentRange : 0;
  const segments = Math.max(
    64,
    Math.round(
      baseSegments *
        cameraQualityScale *
        (1 + ratio * (maxSegmentMultiplier - 1)),
    ),
  );

  const points: Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    points.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  return points;
};

/**
 * There are only a handful of (multiplier, scale) pairs the camera can reach,
 * and the same nine rings get rebuilt every time one of the distance
 * thresholds is crossed — around eight thousand fresh Vector3 instances, right
 * in the middle of a fly-through. Each combination is built once and kept.
 */
const orbitVariantCache = new Map<string, readonly OrbitLineData[]>();

const getOrbitVariant = (
  baseSegments: number,
  maxSegmentMultiplier: number,
  cameraQualityScale: number,
): readonly OrbitLineData[] => {
  const key = `${baseSegments}:${maxSegmentMultiplier}:${cameraQualityScale}`;
  const cached = orbitVariantCache.get(key);
  if (cached) return cached;

  const built = ORBIT_PLANETS.map((p) => ({
    id: p.id,
    points: buildOrbitPoints(
      p.position.length(),
      baseSegments,
      maxSegmentMultiplier,
      cameraQualityScale,
    ),
  }));
  orbitVariantCache.set(key, built);
  return built;
};

export const OrbitLines = () => {
  const camera = useThree((s) => s.camera);
  const viewMode = useStore((s) => s.viewMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [isCameraQualityBoosted, setIsCameraQualityBoosted] = useState(false);
  const [isCameraUltraQualityBoosted, setIsCameraUltraQualityBoosted] =
    useState(false);
  const qualityBoostRef = useRef(false);
  const ultraBoostRef = useRef(false);
  const baseSegments = useQualityPreset((preset) => preset.orbitLineSegments);

  useEffect(() => {
    if (viewMode !== "overview") {
      if (qualityBoostRef.current) {
        setIsCameraQualityBoosted(false);
        qualityBoostRef.current = false;
      }
      if (ultraBoostRef.current) {
        setIsCameraUltraQualityBoosted(false);
        ultraBoostRef.current = false;
      }
    }
  }, [viewMode]);

  useFrame(() => {
    if (viewMode !== "overview") {
      return;
    }

    const distance = camera.position.length();
    let nextQualityBoost = qualityBoostRef.current;
    if (!nextQualityBoost && distance >= CAMERA_QUALITY_DISTANCE_ENTER) {
      nextQualityBoost = true;
    } else if (nextQualityBoost && distance <= CAMERA_QUALITY_DISTANCE_EXIT) {
      nextQualityBoost = false;
    }

    if (nextQualityBoost !== qualityBoostRef.current) {
      setIsCameraQualityBoosted(nextQualityBoost);
      qualityBoostRef.current = nextQualityBoost;
    }

    let nextUltraBoost = ultraBoostRef.current;
    if (!nextUltraBoost && distance >= CAMERA_ULTRA_QUALITY_DISTANCE_ENTER) {
      nextUltraBoost = true;
    } else if (
      nextUltraBoost &&
      distance <= CAMERA_ULTRA_QUALITY_DISTANCE_EXIT
    ) {
      nextUltraBoost = false;
    }

    if (nextUltraBoost !== ultraBoostRef.current) {
      setIsCameraUltraQualityBoosted(nextUltraBoost);
      ultraBoostRef.current = nextUltraBoost;
    }
  });

  const maxSegmentMultiplier =
    viewMode === "overview"
      ? isCameraUltraQualityBoosted
        ? OVERVIEW_ULTRA_MAX_SEGMENT_MULTIPLIER
        : OVERVIEW_MAX_SEGMENT_MULTIPLIER
      : NON_OVERVIEW_MAX_SEGMENT_MULTIPLIER;
  const cameraQualityScale = isCameraQualityBoosted ? CAMERA_QUALITY_SCALE : 1;

  const orbits = useMemo<readonly OrbitLineData[]>(
    () => getOrbitVariant(baseSegments, maxSegmentMultiplier, cameraQualityScale),
    [baseSegments, cameraQualityScale, maxSegmentMultiplier],
  );

  const opacity = viewMode === "overview" ? 0.03 : 0.08;

  if (selectedConstellation) {
    return null;
  }

  return (
    <group>
      {orbits.map((o) => (
        <Line
          key={o.id}
          points={o.points}
          color="#89adff"
          transparent
          opacity={opacity}
          lineWidth={1.0}
          depthWrite={false}
          toneMapped={false}
        />
      ))}
    </group>
  );
};

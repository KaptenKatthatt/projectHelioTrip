import { useEffect, useMemo, useRef, useState } from "react";
import { Line } from "@react-three/drei/core/Line";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { getGraphicsPreset } from "../lib/graphicsTier";
import { PLANETS } from "../lib/planets";
import { useStore } from "../store/useStore";

const ORBIT_PLANETS = PLANETS.filter((p) => p.id !== "sun");
const BASE_SEGMENTS = getGraphicsPreset().orbitLineSegments;
const OVERVIEW_MAX_SEGMENT_MULTIPLIER = 1.5;
const OVERVIEW_ULTRA_MAX_SEGMENT_MULTIPLIER = 1.65;
const NON_OVERVIEW_MAX_SEGMENT_MULTIPLIER = 1.5;
const CAMERA_QUALITY_DISTANCE_ENTER = 150;
const CAMERA_QUALITY_DISTANCE_EXIT = 120;
const CAMERA_QUALITY_SCALE = 1.12;
const CAMERA_ULTRA_QUALITY_DISTANCE_ENTER = 260;
const CAMERA_ULTRA_QUALITY_DISTANCE_EXIT = 220;
const CAMERA_QUALITY_DISTANCE_ENTER_SQ = CAMERA_QUALITY_DISTANCE_ENTER * CAMERA_QUALITY_DISTANCE_ENTER;
const CAMERA_QUALITY_DISTANCE_EXIT_SQ = CAMERA_QUALITY_DISTANCE_EXIT * CAMERA_QUALITY_DISTANCE_EXIT;
const CAMERA_ULTRA_QUALITY_DISTANCE_ENTER_SQ = CAMERA_ULTRA_QUALITY_DISTANCE_ENTER * CAMERA_ULTRA_QUALITY_DISTANCE_ENTER;
const CAMERA_ULTRA_QUALITY_DISTANCE_EXIT_SQ = CAMERA_ULTRA_QUALITY_DISTANCE_EXIT * CAMERA_ULTRA_QUALITY_DISTANCE_EXIT;

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
  maxSegmentMultiplier: number,
  cameraQualityScale: number,
): readonly Vector3[] => {
  const segmentRange = ORBIT_MAX_RADIUS - ORBIT_MIN_RADIUS;
  const ratio =
    segmentRange > 0 ? (radius - ORBIT_MIN_RADIUS) / segmentRange : 0;
  const segments = Math.max(
    64,
    Math.round(
      BASE_SEGMENTS *
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

export const OrbitLines = () => {
  const camera = useThree((s) => s.camera);
  const viewMode = useStore((s) => s.viewMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [isCameraQualityBoosted, setIsCameraQualityBoosted] = useState(false);
  const [isCameraUltraQualityBoosted, setIsCameraUltraQualityBoosted] =
    useState(false);
  const qualityBoostRef = useRef(false);
  const ultraBoostRef = useRef(false);

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

    // Bolt optimization: using lengthSq instead of length to avoid expensive Math.sqrt() in useFrame
    const distanceSq = camera.position.lengthSq();
    let nextQualityBoost = qualityBoostRef.current;
    if (!nextQualityBoost && distanceSq >= CAMERA_QUALITY_DISTANCE_ENTER_SQ) {
      nextQualityBoost = true;
    } else if (nextQualityBoost && distanceSq <= CAMERA_QUALITY_DISTANCE_EXIT_SQ) {
      nextQualityBoost = false;
    }

    if (nextQualityBoost !== qualityBoostRef.current) {
      setIsCameraQualityBoosted(nextQualityBoost);
      qualityBoostRef.current = nextQualityBoost;
    }

    let nextUltraBoost = ultraBoostRef.current;
    if (!nextUltraBoost && distanceSq >= CAMERA_ULTRA_QUALITY_DISTANCE_ENTER_SQ) {
      nextUltraBoost = true;
    } else if (
      nextUltraBoost &&
      distanceSq <= CAMERA_ULTRA_QUALITY_DISTANCE_EXIT_SQ
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
    () =>
      ORBIT_PLANETS.map((p) => ({
        id: p.id,
        points: buildOrbitPoints(
          p.position.length(),
          maxSegmentMultiplier,
          cameraQualityScale,
        ),
      })),
    [cameraQualityScale, maxSegmentMultiplier],
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

import { useMemo } from "react";
import { Line } from '@react-three/drei/core/Line';
import { Vector3 } from "three";
import { getGraphicsPreset } from "../lib/graphicsTier";
import { PLANETS } from "../lib/planets";
import { useStore } from "../store/useStore";

const SEGMENTS = getGraphicsPreset().orbitLineSegments;

type OrbitLineData = {
  id: string;
  points: readonly Vector3[];
};

const buildOrbitPoints = (radius: number): readonly Vector3[] => {
  const points: Vector3[] = [];
  for (let i = 0; i <= SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    points.push(new Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
  }
  return points;
};

export const OrbitLines = () => {
  const viewMode = useStore((s) => s.viewMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);

  const orbits = useMemo<readonly OrbitLineData[]>(
    () =>
      PLANETS.filter((p) => p.id !== "sun").map((p) => ({
        id: p.id,
        points: buildOrbitPoints(p.position.length()),
      })),
    [],
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

import { useMemo } from 'react';
import { BufferGeometry, Float32BufferAttribute } from 'three';
import { PLANETS } from '../lib/planets';
import { useStore } from '../store/useStore';

const SEGMENTS = 256;

type OrbitGeo = {
  id: string;
  radius: number;
  geometry: BufferGeometry;
};

const buildOrbit = (radius: number): BufferGeometry => {
  const positions = new Float32Array((SEGMENTS + 1) * 3);
  for (let i = 0; i <= SEGMENTS; i++) {
    const a = (i / SEGMENTS) * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * radius;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = Math.sin(a) * radius;
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(positions, 3));
  return g;
};

export const OrbitLines = () => {
  const viewMode = useStore((s) => s.viewMode);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const selectedUniversePreset = useStore((s) => s.selectedUniversePreset);

  const orbits = useMemo<readonly OrbitGeo[]>(
    () =>
      PLANETS.filter((p) => p.id !== 'sun').map((p) => ({
        id: p.id,
        radius: p.position.length(),
        geometry: buildOrbit(p.position.length()),
      })),
    [],
  );

  const opacity = viewMode === 'overview' ? 0.45 : 0.1;

  if (
    selectedConstellation ||
    selectedUniversePreset === 'milkyWayOverview'
  ) {
    return null;
  }

  return (
    <group>
      {orbits.map((o) => (
        <lineLoop key={o.id} geometry={o.geometry}>
          <lineBasicMaterial
            color="#7aa2ff"
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </lineLoop>
      ))}
    </group>
  );
};

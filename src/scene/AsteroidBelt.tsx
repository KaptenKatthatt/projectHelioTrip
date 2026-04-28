import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { MathUtils, Object3D, type InstancedMesh } from 'three';
import { AU_SCALE } from '../lib/constants';
import { getGraphicsPreset } from '../lib/graphicsTier';

const COUNT = getGraphicsPreset().asteroidCount;
const INNER_RADIUS_AU = 2.2;
const OUTER_RADIUS_AU = 3.2;
const BELT_HEIGHT_AU = 0.08;
const UPDATE_INTERVAL_SEC = 1 / 30;

type AsteroidOrbit = {
  radius: number;
  offset: number;
  height: number;
  orbitalSpeed: number;
  spinSpeed: number;
  scale: number;
};

const generateOrbits = (count: number): readonly AsteroidOrbit[] => {
  const out: AsteroidOrbit[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      radius:
        MathUtils.lerp(INNER_RADIUS_AU, OUTER_RADIUS_AU, Math.random()) *
        AU_SCALE,
      offset: Math.random() * Math.PI * 2,
      height: (Math.random() - 0.5) * BELT_HEIGHT_AU * AU_SCALE,
      orbitalSpeed: 0.02 + Math.random() * 0.03,
      spinSpeed: (Math.random() - 0.5) * 1.2,
      scale: 0.04 + Math.random() * 0.14,
    });
  }
  return out;
};

export const AsteroidBelt = () => {
  const meshRef = useRef<InstancedMesh>(null);
  const elapsedRef = useRef(0);
  const updateAccumulatorRef = useRef(0);
  const dummy = useMemo(() => new Object3D(), []);
  const asteroids = useMemo(() => generateOrbits(COUNT), []);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    let i = 0;
    for (const a of asteroids) {
      dummy.position.set(
        Math.cos(a.offset) * a.radius,
        a.height,
        Math.sin(a.offset) * a.radius,
      );
      dummy.rotation.set(0, 0, 0);
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [asteroids, dummy]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    updateAccumulatorRef.current += delta;
    if (updateAccumulatorRef.current < UPDATE_INTERVAL_SEC) return;

    const step = updateAccumulatorRef.current;
    updateAccumulatorRef.current = 0;
    elapsedRef.current += step;
    const t = elapsedRef.current;
    let i = 0;
    for (const a of asteroids) {
      const angle = a.offset + t * a.orbitalSpeed;
      dummy.position.set(
        Math.cos(angle) * a.radius,
        a.height,
        Math.sin(angle) * a.radius,
      );
      dummy.rotation.set(t * a.spinSpeed * 0.5, t * a.spinSpeed, 0);
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i++, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <icosahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#8a7b68" roughness={0.95} metalness={0.1} />
    </instancedMesh>
  );
};

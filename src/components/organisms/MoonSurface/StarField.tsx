import { useMemo } from 'react';
import * as THREE from 'three';

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

export const StarField = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    const random = createSeededRandom(123456789);
    for (let i = 0; i < count; i++) {
      const theta = random() * Math.PI * 2;
      const phi = random() * Math.PI * 0.5; // upper hemisphere only
      const r = 380 + random() * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#c8d8ff" size={0.3} sizeAttenuation />
    </points>
  );
};

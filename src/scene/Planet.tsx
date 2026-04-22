import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';
import type { PlanetId } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';

type Props = {
  id: PlanetId;
  radius: number;
  color: string;
};

export const Planet = ({ id, radius, color }: Props) => {
  const meshRef = useRef<Mesh>(null);
  const isSun = id === 'sun';

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    mesh.position.copy(getLivePosition(id));
  });

  return (
    <mesh ref={meshRef} castShadow={!isSun} receiveShadow={!isSun}>
      <sphereGeometry args={[radius, 48, 32]} />
      {isSun ? (
        <meshBasicMaterial color={color} toneMapped={false} />
      ) : (
        <meshStandardMaterial color={color} roughness={0.85} metalness={0.05} />
      )}
    </mesh>
  );
};

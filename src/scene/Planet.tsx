import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, type Group } from 'three';
import type { PlanetId } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';

type Props = {
  id: PlanetId;
  radius: number;
  color: string;
};

const SUN_HDR = new Color(6.0, 4.2, 1.1);

/**
 * Renders a single planet (or the sun) as a sphere that follows its
 * live ephemeris position. Uses a parent <group> for positioning – this
 * way the sphere has a stable initial position from the registry even
 * before the first useFrame tick (prevents "teleport to origin" frames).
 */
export const Planet = ({ id, radius, color }: Props) => {
  const groupRef = useRef<Group>(null);
  const isSun = id === 'sun';

  const initial = useMemo(() => {
    const p = getLivePosition(id);
    return [p.x, p.y, p.z] as const;
  }, [id]);

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.position.copy(getLivePosition(id));
  });

  return (
    <group ref={groupRef} position={initial}>
      <mesh castShadow={!isSun} receiveShadow={!isSun}>
        <sphereGeometry args={[radius, 48, 32]} />
        {isSun ? (
          <meshBasicMaterial color={SUN_HDR} toneMapped={false} />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.85}
            metalness={0.05}
            emissive={color}
            emissiveIntensity={0.15}
          />
        )}
      </mesh>
    </group>
  );
};

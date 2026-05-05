import { Suspense, useMemo, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';
import { SATELLITES } from '../lib/satellites';
import type { SatelliteDefinition } from '../lib/satellites';
import { useStore } from '../store/useStore';
import {
  getLivePosition,
  getLiveSatelliteOffset,
} from '../lib/positionsBus';

SATELLITES.forEach((s) => {
  if (s.glbPath) useGLTF.preload(s.glbPath);
});

const GLBSatelliteModel = ({
  path,
  scale,
}: {
  path: string;
  scale: number;
}) => {
  const { scene } = useGLTF(path);
  return <primitive object={scene} scale={scale} />;
};

type Props = {
  satellite: SatelliteDefinition;
};

export const Satellite = ({ satellite }: Props) => {
  const groupRef = useRef<Group>(null);
  const lastSimMsRef = useRef<number | null>(null);

  const initial = useMemo(() => {
    const parent = getLivePosition(satellite.parent);
    const offset = getLiveSatelliteOffset(satellite.id);
    return [
      parent.x + offset.x,
      parent.y + offset.y,
      parent.z + offset.z,
    ] as const;
  }, [satellite]);

  useFrame(() => {
    const simMs = useStore.getState().simulationTime.getTime();
    if (lastSimMsRef.current === simMs) return;
    lastSimMsRef.current = simMs;

    const group = groupRef.current;
    if (!group) return;
    const parent = getLivePosition(satellite.parent);
    const offset = getLiveSatelliteOffset(satellite.id);
    group.position.set(
      parent.x + offset.x,
      parent.y + offset.y,
      parent.z + offset.z,
    );
    const len = Math.hypot(offset.x, offset.y, offset.z);
    if (len > 1e-6) {
      group.rotation.y = Math.atan2(offset.x, offset.z);
    }
  });

  if (satellite.glbPath) {
    return (
      <group ref={groupRef} position={initial}>
        <Suspense
          fallback={
            <FallbackBody radius={satellite.radius} color={satellite.color} />
          }
        >
          <GLBSatelliteModel
            path={satellite.glbPath}
            scale={satellite.glbScale ?? satellite.radius}
          />
        </Suspense>
      </group>
    );
  }

  return (
    <group ref={groupRef} position={initial}>
      <FallbackBody
        radius={satellite.radius}
        color={satellite.color}
      />
    </group>
  );
};

const FallbackBody = ({
  radius,
  color,
}: {
  radius: number;
  color: string;
}) => (
  <mesh scale={radius} castShadow receiveShadow>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial
      color={color}
      metalness={0.4}
      roughness={0.5}
      emissive={color}
      emissiveIntensity={0.25}
    />
  </mesh>
);

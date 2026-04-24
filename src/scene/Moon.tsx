import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei/core/Texture';
import { type Group } from 'three';
import type { MoonDefinition } from '../lib/moons';
import { getLiveMoonOffset, getLivePosition } from '../lib/positionsBus';
import { useStore } from '../store/useStore';
import { getBodyManualSpinY } from '../lib/planetSurfaceDrag';
import { configureColorMap, getMoonTextures } from '../lib/textures';

type Props = {
  moon: MoonDefinition;
};

const GEOMETRY_ARGS: [number, number, number] = [1, 48, 32];
const TAU = Math.PI * 2;
const MS_PER_HOUR = 3_600_000;

export const Moon = ({ moon }: Props) => {
  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  const initial = useMemo(() => {
    const parent = getLivePosition(moon.parent);
    const offset = getLiveMoonOffset(moon.id);
    return [
      parent.x + offset.x,
      parent.y + offset.y,
      parent.z + offset.z,
    ] as const;
  }, [moon]);

  const periodMs = moon.rotationPeriodHours * MS_PER_HOUR;

  useFrame(() => {
    const group = groupRef.current;
    if (group) {
      const parent = getLivePosition(moon.parent);
      const offset = getLiveMoonOffset(moon.id);
      group.position.set(
        parent.x + offset.x,
        parent.y + offset.y,
        parent.z + offset.z,
      );
    }

    const spin = spinRef.current;
    if (spin) {
      const simMs = useStore.getState().simulationTime.getTime();
      const phase = (simMs / periodMs) % 1;
      spin.rotation.y = phase * TAU + getBodyManualSpinY(moon.id);
    }
  });

  return (
    <group ref={groupRef} position={initial}>
      <group ref={spinRef}>
        <Suspense fallback={<FlatMoon moon={moon} />}>
          <MoonBody moon={moon} />
        </Suspense>
      </group>
    </group>
  );
};

const MoonBody = ({ moon }: Props) => {
  const textures = getMoonTextures(moon.id);
  if (!textures) return <FlatMoon moon={moon} />;
  return <TexturedMoon moon={moon} diffuseUrl={textures.diffuse} />;
};

const FlatMoon = ({ moon }: Props) => (
  <mesh castShadow receiveShadow scale={moon.radius}>
    <sphereGeometry args={GEOMETRY_ARGS} />
    <meshStandardMaterial
      color={moon.color}
      roughness={0.92}
      metalness={0.03}
      emissive={moon.color}
      emissiveIntensity={0.08}
    />
  </mesh>
);

const TexturedMoon = ({
  moon,
  diffuseUrl,
}: {
  moon: MoonDefinition;
  diffuseUrl: string;
}) => {
  const map = useTexture(diffuseUrl, configureColorMap);

  return (
    <mesh castShadow receiveShadow scale={moon.radius}>
      <sphereGeometry args={GEOMETRY_ARGS} />
      <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
    </mesh>
  );
};

import { Suspense, useMemo, useRef } from 'react';
import { useTexture } from '@react-three/drei/core/Texture';
import { type Group } from 'three';
import type { MoonDefinition } from '../lib/moons';
import { getLiveMoonOffset, getLivePosition } from '../lib/positionsBus';
import { useQualityPreset } from '../hooks/useQualityPreset';
import { configureColorMap, getMoonTextures } from '../lib/textures';
import { useSimulationTickFrame } from '../hooks/useSimulationTickFrame';
import { applyBodySpinFromTime } from './bodySpin';

type Props = {
  moon: MoonDefinition;
};

/** Moons deliberately share the cloud sphere budget, as they did before. */
const useMoonSphereArgs = (): [number, number, number] => {
  const segments = useQualityPreset((preset) => preset.cloudSphere);
  return useMemo(() => [1, segments[0], segments[1]], [segments]);
};
const MS_PER_HOUR = 3_600_000;

export const Moon = ({ moon }: Props) => {
  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);
  const initial = useMemo(() => {
    const parent = getLivePosition(moon.parent);
    const offset = getLiveMoonOffset(moon.id);
    return [parent.x + offset.x, parent.y + offset.y, parent.z + offset.z] as const;
  }, [moon]);

  const periodMs = moon.rotationPeriodHours * MS_PER_HOUR;

  useSimulationTickFrame((simMs) => {
    const group = groupRef.current;
    if (group) {
      const parent = getLivePosition(moon.parent);
      const offset = getLiveMoonOffset(moon.id);
      group.position.set(parent.x + offset.x, parent.y + offset.y, parent.z + offset.z);
    }

    applyBodySpinFromTime(spinRef, simMs, periodMs);
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

const FlatMoon = ({ moon }: Props) => {
  const sphereArgs = useMoonSphereArgs();
  return (
    <mesh castShadow receiveShadow scale={moon.radius}>
      <sphereGeometry args={sphereArgs} />
      <meshStandardMaterial
        color={moon.color}
        roughness={0.92}
        metalness={0.03}
        emissive={moon.color}
        emissiveIntensity={0.08}
      />
    </mesh>
  );
};

const TexturedMoon = ({ moon, diffuseUrl }: { moon: MoonDefinition; diffuseUrl: string }) => {
  const map = useTexture(diffuseUrl, configureColorMap);
  const sphereArgs = useMoonSphereArgs();

  return (
    <mesh castShadow receiveShadow scale={moon.radius}>
      <sphereGeometry args={sphereArgs} />
      <meshStandardMaterial map={map} roughness={0.95} metalness={0} />
    </mesh>
  );
};

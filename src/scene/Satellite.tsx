import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { type Group } from 'three';
import type { SatelliteDefinition } from '../lib/satellites';
import {
  getLivePosition,
  getLiveSatelliteOffset,
} from '../lib/positionsBus';

type Props = {
  satellite: SatelliteDefinition;
};

export const Satellite = ({ satellite }: Props) => {
  const groupRef = useRef<Group>(null);

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

  if (satellite.id === 'iss') {
    return (
      <group ref={groupRef} position={initial}>
        <ISSModel radius={satellite.radius} color={satellite.color} />
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

/**
 * Minimal, stylized ISS: a central truss/module with four flat solar
 * array wings. Built from primitives so it stays cheap and looks
 * recognizable even at the tiny scale we render it at.
 */
const ISSModel = ({ radius, color }: { radius: number; color: string }) => {
  const panelLength = radius * 4.5;
  const panelWidth = radius * 1.4;
  const panelOffset = radius * 1.6;

  return (
    <group scale={radius}>
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.25, 0.25, 1.1, 16]} />
        <meshStandardMaterial
          color={color}
          metalness={0.55}
          roughness={0.4}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 3.4, 12]} />
        <meshStandardMaterial
          color="#b8bec9"
          metalness={0.6}
          roughness={0.35}
        />
      </mesh>

      <SolarPanel
        position={[-panelOffset, 0, 0]}
        length={panelLength / radius}
        width={panelWidth / radius}
      />
      <SolarPanel
        position={[panelOffset, 0, 0]}
        length={panelLength / radius}
        width={panelWidth / radius}
      />
    </group>
  );
};

const SolarPanel = ({
  position,
  length,
  width,
}: {
  position: readonly [number, number, number];
  length: number;
  width: number;
}) => (
  <group position={position as unknown as [number, number, number]}>
    <mesh castShadow receiveShadow>
      <boxGeometry args={[length, 0.02, width]} />
      <meshStandardMaterial
        color="#1e2a63"
        emissive="#2747a8"
        emissiveIntensity={0.35}
        metalness={0.5}
        roughness={0.35}
      />
    </mesh>
  </group>
);

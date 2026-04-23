import { Suspense, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { Color, type Group } from 'three';
import type { PlanetId } from '../lib/planets';
import { getLivePosition } from '../lib/positionsBus';
import { useStore } from '../store/useStore';
import {
  configureColorMap,
  configureDataMap,
  getSurfaceTextures,
} from '../lib/textures';
import { Clouds } from './Clouds';
import { Rings } from './Rings';

type Props = {
  id: PlanetId;
  radius: number;
  color: string;
  rotationPeriodHours: number;
};

const SUN_HDR = new Color(6.0, 4.2, 1.1);
const GEOMETRY_ARGS: [number, number, number] = [1, 64, 48];
const TAU = Math.PI * 2;
const MS_PER_HOUR = 3_600_000;

export const Planet = ({ id, radius, color, rotationPeriodHours }: Props) => {
  const groupRef = useRef<Group>(null);
  const spinRef = useRef<Group>(null);

  const initial = useMemo(() => {
    const p = getLivePosition(id);
    return [p.x, p.y, p.z] as const;
  }, [id]);

  const periodMs = rotationPeriodHours * MS_PER_HOUR;

  useFrame(() => {
    const group = groupRef.current;
    if (group) group.position.copy(getLivePosition(id));

    const spin = spinRef.current;
    if (spin) {
      const simMs = useStore.getState().simulationTime.getTime();
      const phase = (simMs / periodMs) % 1;
      spin.rotation.y = phase * TAU;
    }
  });

  return (
    <group ref={groupRef} position={initial}>
      <group ref={spinRef}>
        <Suspense fallback={<FlatBody id={id} radius={radius} color={color} />}>
          <Body id={id} radius={radius} color={color} />
        </Suspense>
      </group>
      <Suspense fallback={null}>
        <Rings planetId={id} radius={radius} />
      </Suspense>
    </group>
  );
};

type BodyProps = Required<Props>;

const Body = ({ id, radius, color }: BodyProps) => {
  const surface = getSurfaceTextures(id);

  if (!surface) return <FlatBody id={id} radius={radius} color={color} />;

  if (id === 'sun') return <SunBody diffuseUrl={surface.diffuse} radius={radius} />;

  if (id === 'earth' && surface.normal && surface.roughness) {
    return (
      <EarthBody
        radius={radius}
        diffuseUrl={surface.diffuse}
        normalUrl={surface.normal}
        roughnessUrl={surface.roughness}
      />
    );
  }

  return <TexturedBody radius={radius} diffuseUrl={surface.diffuse} />;
};

const FlatBody = ({ id, radius, color }: BodyProps) => {
  const isSun = id === 'sun';
  return (
    <mesh castShadow={!isSun} receiveShadow={!isSun} scale={radius}>
      <sphereGeometry args={GEOMETRY_ARGS} />
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
  );
};

const SunBody = ({
  diffuseUrl,
  radius,
}: {
  diffuseUrl: string;
  radius: number;
}) => {
  const map = useTexture(diffuseUrl, configureColorMap);

  return (
    <mesh scale={radius}>
      <sphereGeometry args={GEOMETRY_ARGS} />
      <meshBasicMaterial map={map} color={SUN_HDR} toneMapped={false} />
    </mesh>
  );
};

const TexturedBody = ({
  diffuseUrl,
  radius,
}: {
  diffuseUrl: string;
  radius: number;
}) => {
  const map = useTexture(diffuseUrl, configureColorMap);

  return (
    <mesh castShadow receiveShadow scale={radius}>
      <sphereGeometry args={GEOMETRY_ARGS} />
      <meshStandardMaterial map={map} roughness={0.95} metalness={0.0} />
    </mesh>
  );
};

const EARTH_NORMAL_SCALE: [number, number] = [0.85, 0.85];

const EarthBody = ({
  radius,
  diffuseUrl,
  normalUrl,
  roughnessUrl,
}: {
  radius: number;
  diffuseUrl: string;
  normalUrl: string;
  roughnessUrl: string;
}) => {
  const map = useTexture(diffuseUrl, configureColorMap);
  const normalMap = useTexture(normalUrl, configureDataMap);
  const roughnessMap = useTexture(roughnessUrl, configureDataMap);

  return (
    <>
      <mesh castShadow receiveShadow scale={radius}>
        <sphereGeometry args={GEOMETRY_ARGS} />
        <meshStandardMaterial
          map={map}
          normalMap={normalMap}
          normalScale={EARTH_NORMAL_SCALE}
          roughnessMap={roughnessMap}
          roughness={1}
          metalness={0}
        />
      </mesh>
      <Clouds planetId="earth" radius={radius} />
    </>
  );
};

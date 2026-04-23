import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei/core/Texture';
import {
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DoubleSide,
  Float32BufferAttribute,
  RingGeometry,
  type Group,
  type Texture,
} from 'three';
import type { PlanetId } from '../lib/planets';
import { getRingDefinition, type RingDefinition } from '../lib/rings';
import { createProceduralRingTexture } from '../lib/ringTexture';
import { configureColorMap } from '../lib/textures';

type Props = {
  planetId: PlanetId;
  radius: number;
};

const RADIAL_SEGMENTS = 128;
const THETA_SEGMENTS = 96;

/**
 * Builds a flat ring whose UVs run 0..1 along the radial axis so a 1D
 * horizontal texture is sampled by distance from the planet.
 */
const createRingGeometry = (inner: number, outer: number): RingGeometry => {
  const geo = new RingGeometry(inner, outer, THETA_SEGMENTS, RADIAL_SEGMENTS);
  const pos = geo.attributes.position;
  if (!pos) return geo;

  const uvs = new Array<number>(pos.count * 2);
  const invRange = 1 / (outer - inner);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const r = Math.hypot(x, y);
    const u = (r - inner) * invRange;
    uvs[i * 2] = u;
    uvs[i * 2 + 1] = 0.5;
  }
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  return geo;
};

const createSeededRng = (seed: number): (() => number) => {
  let s = (seed * 9301 + 49297) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
};

/**
 * Scatters debris points across the annulus to give the ring a sense of
 * individual rocks. Points sit in the XY plane to match the ring geometry's
 * native orientation; the parent group tilts and spins both at once.
 */
const createParticleGeometry = (
  inner: number,
  outer: number,
  count: number,
  seed: number,
): BufferGeometry => {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const thickness = (outer - inner) * 0.02;
  const rand = createSeededRng(seed);

  for (let i = 0; i < count; i++) {
    const theta = rand() * Math.PI * 2;
    const t = Math.sqrt(rand());
    const r = inner + t * (outer - inner);
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = Math.sin(theta) * r;
    positions[i * 3 + 2] = (rand() - 0.5) * thickness;

    const shade = 0.55 + rand() * 0.45;
    colors[i * 3] = shade;
    colors[i * 3 + 1] = shade;
    colors[i * 3 + 2] = shade;
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new BufferAttribute(positions, 3));
  geo.setAttribute('color', new BufferAttribute(colors, 3));
  return geo;
};

const createSoftParticleTexture = (): CanvasTexture => {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new CanvasTexture(canvas);
  }

  const center = size * 0.5;
  const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.6, 'rgba(255,255,255,0.9)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

export const Rings = ({ planetId, radius }: Props) => {
  const def = getRingDefinition(planetId);
  if (!def) return null;
  return <RingSystem def={def} radius={radius} />;
};

const RingSystem = ({
  def,
  radius,
}: {
  def: RingDefinition;
  radius: number;
}) => {
  const groupRef = useRef<Group>(null);

  const inner = radius * def.innerScale;
  const outer = radius * def.outerScale;

  const ringGeometry = useMemo(
    () => createRingGeometry(inner, outer),
    [inner, outer],
  );
  const particleGeometry = useMemo(
    () => createParticleGeometry(inner, outer, def.particleCount, def.seed),
    [inner, outer, def.particleCount, def.seed],
  );
  const particleTexture = useMemo(() => createSoftParticleTexture(), []);

  useEffect(() => () => ringGeometry.dispose(), [ringGeometry]);
  useEffect(() => () => particleGeometry.dispose(), [particleGeometry]);
  useEffect(() => () => particleTexture.dispose(), [particleTexture]);

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.x = -Math.PI / 2 + def.tilt;
  }, [def.tilt]);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (!group) return;
    group.rotation.z += def.spin * delta;
  });

  return (
    <group ref={groupRef}>
      {def.texture ? (
        <TexturedRingMesh
          geometry={ringGeometry}
          def={def}
          url={def.texture}
        />
      ) : (
        <ProceduralRingMesh geometry={ringGeometry} def={def} />
      )}
      <points geometry={particleGeometry}>
        <pointsMaterial
          vertexColors
          color={def.color}
          map={particleTexture}
          alphaMap={particleTexture}
          size={def.particleSize}
          sizeAttenuation
          transparent
          opacity={Math.min(1, def.opacity + 0.3)}
          alphaTest={0.02}
          depthWrite={false}
        />
      </points>
    </group>
  );
};

type RingMeshProps = {
  geometry: RingGeometry;
  def: RingDefinition;
};

const TexturedRingMesh = ({
  geometry,
  def,
  url,
}: RingMeshProps & { url: string }) => {
  const map = useTexture(url, configureColorMap) as Texture;

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={map}
        transparent
        opacity={def.opacity}
        side={DoubleSide}
        depthWrite={false}
        alphaTest={0.02}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
};

const ProceduralRingMesh = ({ geometry, def }: RingMeshProps) => {
  const map = useMemo(
    () =>
      createProceduralRingTexture({
        baseColor: def.color,
        seed: def.seed,
        gaps: def.gaps,
      }),
    [def.color, def.seed, def.gaps],
  );
  useEffect(() => () => map.dispose(), [map]);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial
        map={map}
        transparent
        opacity={def.opacity}
        side={DoubleSide}
        depthWrite={false}
        alphaTest={0.02}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
};

import { useMemo, type ReactElement } from "react";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import { useQualityLevel, useQualityPreset } from "../hooks/useQualityPreset";
import type { MilkyWayQualityPreset } from "../lib/quality/qualityLevels";

const MILKY_WAY_ROTATION: [number, number, number] = [0.02, Math.PI * 0.64, 0];
const STAR_OVERLAY_RADIUS_BASE = 3192;
const STAR_OVERLAY_RADIUS_JITTER = 14;
const MICRO_STAR_OVERLAY_RADIUS_BASE = 3198;
const MICRO_STAR_OVERLAY_RADIUS_JITTER = 10;
const NEBULA_RADIUS_BASE = 3180;
const NEBULA_RADIUS_JITTER = 18;
const STAR_BAND_BIAS_CHANCE = 0.3;
const STAR_BAND_HALF_HEIGHT = 0.22;
const NEBULA_BAND_HALF_HEIGHT = 0.12;
const DEEP_SKY_OBJECT_RADIUS = 3174;

import {
  SKY_VERTEX_SHADER,
  buildSkyFragmentShader,
  STAR_VERTEX_SHADER,
  STAR_FRAGMENT_SHADER,
  NEBULA_VERTEX_SHADER,
  NEBULA_FRAGMENT_SHADER,
  DEEP_SKY_OBJECT_VERTEX_SHADER,
  DEEP_SKY_OBJECT_FRAGMENT_SHADER,
} from "./shaders/milkyWayShaders";

type RgbTriplet = readonly [number, number, number];

type PointCloudData = {
  readonly positions: Float32Array;
  readonly colors: Float32Array;
  readonly sizes: Float32Array;
};

type OverlayShaderProps = {
  readonly data: PointCloudData;
  readonly opacity: number;
  readonly pixelRatio: number;
  readonly renderOrder: number;
  readonly vertexShader: string;
  readonly fragmentShader: string;
};

type NebulaCluster = {
  readonly theta: number;
  readonly u: number;
  readonly radius: number;
  readonly thetaSpread: number;
  readonly uSpread: number;
  readonly color: RgbTriplet;
};

type DeepSkyObject = {
  readonly theta: number;
  readonly u: number;
  readonly size: number;
  readonly color: RgbTriplet;
};

const NEBULA_COLORS: readonly RgbTriplet[] = [
  [0.46, 0.75, 1.0],
  [0.98, 0.48, 0.72],
  [0.57, 0.41, 1.0],
  [1.0, 0.58, 0.26],
  [0.68, 0.88, 1.0],
];
const DEFAULT_NEBULA_COLOR: RgbTriplet = [0.46, 0.75, 1.0];
const DEEP_SKY_OBJECTS: readonly DeepSkyObject[] = [
  { theta: -0.34, u: 0.02, size: 34, color: [1.0, 0.72, 0.34] },
  { theta: -0.5, u: 0.03, size: 22, color: [0.98, 0.48, 0.72] },
  { theta: -0.56, u: 0.05, size: 18, color: [0.64, 0.76, 1.0] },
  { theta: -0.78, u: -0.22, size: 26, color: [0.64, 0.82, 1.0] },
  { theta: 2.38, u: -0.12, size: 24, color: [0.52, 0.82, 1.0] },
  { theta: 2.7, u: 0.34, size: 28, color: [0.84, 0.86, 1.0] },
  { theta: 1.28, u: -0.72, size: 22, color: [0.7, 0.9, 1.0] },
  { theta: 1.4, u: -0.64, size: 16, color: [0.72, 0.84, 1.0] },
];

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const fract = (value: number): number => value - Math.floor(value);

const seededRandom = (seed: number): number =>
  fract(Math.sin(seed * 12.9898 + 78.233) * 43758.5453123);

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const toSpherePosition = (
  radius: number,
  u: number,
  theta: number,
): readonly [number, number, number] => {
  const xy = Math.sqrt(Math.max(0, 1 - u * u));
  return [
    radius * xy * Math.cos(theta),
    radius * u,
    radius * xy * Math.sin(theta),
  ];
};

const kelvinToRgb = (kelvin: number): RgbTriplet => {
  const temperature = kelvin / 100;
  const red =
    temperature <= 66
      ? 255
      : 329.698727446 * Math.pow(temperature - 60, -0.1332047592);
  const green =
    temperature <= 66
      ? 99.4708025861 * Math.log(temperature) - 161.1195681661
      : 288.1221695283 * Math.pow(temperature - 60, -0.0755148492);
  const blue =
    temperature >= 66
      ? 255
      : temperature <= 19
        ? 0
        : 138.5177312231 * Math.log(temperature - 10) - 305.0447927307;

  return [
    clamp(red / 255, 0, 1),
    clamp(green / 255, 0, 1),
    clamp(blue / 255, 0, 1),
  ];
};

const sampleStarTemperatureKelvin = (seed: number): number => {
  const roll = seededRandom(seed);
  if (roll < 0.62) return lerp(2800, 5600, seededRandom(seed + 1));
  if (roll < 0.9) return lerp(5600, 7800, seededRandom(seed + 1));
  return lerp(7800, 13000, seededRandom(seed + 1));
};

const sampleSkyLatitude = (seed: number, poleBiasExponent = 1): number => {
  const uniform = lerp(-1, 1, seededRandom(seed));
  if (poleBiasExponent === 1) return uniform;

  const sign = uniform < 0 ? -1 : 1;
  return sign * Math.pow(Math.abs(uniform), poleBiasExponent);
};

const pickNebulaColor = (seed: number): RgbTriplet => {
  const colorIndex = Math.floor(seededRandom(seed) * NEBULA_COLORS.length);
  return NEBULA_COLORS[colorIndex] ?? DEFAULT_NEBULA_COLOR;
};

const assignPointCloudEntry = (
  positions: Float32Array,
  colors: Float32Array,
  index: number,
  point: readonly [number, number, number],
  color: RgbTriplet,
  brightness: number,
): void => {
  const [x, y, z] = point;
  const [red, green, blue] = color;
  const offset = index * 3;
  positions[offset] = x;
  positions[offset + 1] = y;
  positions[offset + 2] = z;
  colors[offset] = red * brightness;
  colors[offset + 1] = green * brightness;
  colors[offset + 2] = blue * brightness;
};

const buildStarCloud = (quality: MilkyWayQualityPreset): PointCloudData => {
  const positions = new Float32Array(quality.overlayStarCount * 3);
  const colors = new Float32Array(quality.overlayStarCount * 3);
  const sizes = new Float32Array(quality.overlayStarCount);

  for (let i = 0; i < quality.overlayStarCount; i++) {
    const seed = i * 17 + 1;
    const isBandStar = seededRandom(seed) < STAR_BAND_BIAS_CHANCE;
    const u = isBandStar
      ? lerp(
          -STAR_BAND_HALF_HEIGHT,
          STAR_BAND_HALF_HEIGHT,
          seededRandom(seed + 1),
        )
      : sampleSkyLatitude(seed + 1, 0.96);
    const theta = seededRandom(seed + 2) * Math.PI * 2;
    const ringBias = lerp(0.35, 1, seededRandom(seed + 3));
    const radius =
      STAR_OVERLAY_RADIUS_BASE +
      lerp(-1, 1, seededRandom(seed + 4)) *
        STAR_OVERLAY_RADIUS_JITTER *
        ringBias;
    const [x, y, z] = toSpherePosition(radius, u, theta);
    const temperature = sampleStarTemperatureKelvin(seed + 5);
    const [red, green, blue] = kelvinToRgb(temperature);
    const sizeRoll = Math.pow(seededRandom(seed + 7), 4.4);
    const brightness =
      lerp(0.62, 1.24, Math.pow(seededRandom(seed + 6), 4.4)) *
      lerp(1, 0.88, sizeRoll);

    assignPointCloudEntry(positions, colors, i, [x, y, z], [red, green, blue], brightness);
    sizes[i] = quality.overlayStarSize * lerp(0.72, 1.64, sizeRoll);
  }

  return { positions, colors, sizes };
};

const buildMicroStarCloud = (
  quality: MilkyWayQualityPreset,
): PointCloudData => {
  const positions = new Float32Array(quality.overlayMicroStarCount * 3);
  const colors = new Float32Array(quality.overlayMicroStarCount * 3);
  const sizes = new Float32Array(quality.overlayMicroStarCount);

  for (let i = 0; i < quality.overlayMicroStarCount; i++) {
    const seed = 50000 + i * 23;
    const u = sampleSkyLatitude(seed + 1, 0.92);
    const theta = seededRandom(seed + 2) * Math.PI * 2;
    const radius =
      MICRO_STAR_OVERLAY_RADIUS_BASE +
      lerp(-1, 1, seededRandom(seed + 3)) * MICRO_STAR_OVERLAY_RADIUS_JITTER;
    const [x, y, z] = toSpherePosition(radius, u, theta);
    const temperature = sampleStarTemperatureKelvin(seed + 4);
    const [red, green, blue] = kelvinToRgb(temperature);
    const brightness = lerp(0.2, 0.48, Math.pow(seededRandom(seed + 5), 2.3));

    assignPointCloudEntry(positions, colors, i, [x, y, z], [red, green, blue], brightness);
    sizes[i] =
      quality.overlayMicroStarSize *
      lerp(0.58, 0.96, Math.pow(seededRandom(seed + 6), 2.6));
  }

  return { positions, colors, sizes };
};

const buildNebulaCloud = (quality: MilkyWayQualityPreset): PointCloudData => {
  const positions = new Float32Array(quality.nebulaParticleCount * 3);
  const colors = new Float32Array(quality.nebulaParticleCount * 3);
  const sizes = new Float32Array(quality.nebulaParticleCount);
  const clusterCount = Math.max(1, quality.nebulaClusterCount);

  const clusters: NebulaCluster[] = Array.from(
    { length: clusterCount },
    (_, index) => {
      const seed = 1000 + index * 31;
      return {
        theta: seededRandom(seed) * Math.PI * 2,
        u: lerp(
          -NEBULA_BAND_HALF_HEIGHT,
          NEBULA_BAND_HALF_HEIGHT,
          seededRandom(seed + 1),
        ),
        radius:
          NEBULA_RADIUS_BASE +
          lerp(-1, 1, seededRandom(seed + 2)) * NEBULA_RADIUS_JITTER,
        thetaSpread: lerp(0.1, 0.28, seededRandom(seed + 3)),
        uSpread: lerp(0.035, 0.095, seededRandom(seed + 4)),
        color: pickNebulaColor(seed + 5),
      };
    },
  );

  for (let i = 0; i < quality.nebulaParticleCount; i++) {
    const seed = 2000 + i * 19;
    const clusterIndex = Math.floor(seededRandom(seed) * clusterCount);
    const cluster = clusters[clusterIndex];
    if (!cluster) continue;

    const theta =
      cluster.theta +
      lerp(-1, 1, seededRandom(seed + 1)) *
        cluster.thetaSpread *
        lerp(0.35, 1, seededRandom(seed + 2));
    const u = clamp(
      cluster.u +
        lerp(-1, 1, seededRandom(seed + 3)) *
          cluster.uSpread *
          lerp(0.35, 1, seededRandom(seed + 4)),
      -0.94,
      0.94,
    );
    const radius =
      cluster.radius +
      lerp(-1, 1, seededRandom(seed + 5)) * NEBULA_RADIUS_JITTER * 0.55;
    const [x, y, z] = toSpherePosition(radius, u, theta);
    const colorBoost = lerp(0.7, 1.08, seededRandom(seed + 6));

    const offset = i * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    colors[offset] = cluster.color[0] * colorBoost;
    colors[offset + 1] = cluster.color[1] * colorBoost;
    colors[offset + 2] = cluster.color[2] * colorBoost;
    sizes[i] =
      quality.nebulaParticleSize * lerp(0.65, 1.65, seededRandom(seed + 7));
  }

  return { positions, colors, sizes };
};

const buildDeepSkyObjectCloud = (
  quality: MilkyWayQualityPreset,
): PointCloudData => {
  const positions = new Float32Array(DEEP_SKY_OBJECTS.length * 3);
  const colors = new Float32Array(DEEP_SKY_OBJECTS.length * 3);
  const sizes = new Float32Array(DEEP_SKY_OBJECTS.length);

  DEEP_SKY_OBJECTS.forEach((object, index) => {
    const [x, y, z] = toSpherePosition(
      DEEP_SKY_OBJECT_RADIUS,
      object.u,
      object.theta,
    );
    const offset = index * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    colors[offset] = object.color[0];
    colors[offset + 1] = object.color[1];
    colors[offset + 2] = object.color[2];
    sizes[index] = object.size * quality.deepSkyObjectSizeScale;
  });

  return { positions, colors, sizes };
};

const MilkyWaySphere = (): ReactElement => {
  const level = useQualityLevel();
  const [mwW, mwH] = useQualityPreset((p) => p.milkyWaySphere);
  const quality = useQualityPreset((p) => p.milkyWayQuality);
  const nebulaOpacity = quality.nebulaOpacity;
  const fragmentShader = useMemo(
    () =>
      buildSkyFragmentShader({
        withNebula: nebulaOpacity > 0,
        fbmOctaves: quality.skyFbmOctaves,
        dustLanes: quality.skyDustLanes,
        starMist: quality.skyStarMist,
      }),
    [nebulaOpacity, quality.skyFbmOctaves, quality.skyDustLanes, quality.skyStarMist],
  );

  /**
   * `key` forces a fresh material on every level change. `ShaderMaterial`
   * compiles its program once and caches the uniform list against that
   * program, so neither a new `fragmentShader` string nor a replaced
   * `uniforms` object reaches the GPU on its own — without this a downgrade
   * would keep paying for the expensive sky it was supposed to shed.
   */
  return (
    <mesh rotation={MILKY_WAY_ROTATION} renderOrder={-20}>
      <sphereGeometry args={[3200, mwW, mwH]} />
      <shaderMaterial
        key={level}
        side={BackSide}
        toneMapped={false}
        depthWrite={false}
        uniforms={{
          uBandIntensity: { value: quality.bandIntensity },
          uDustLaneOpacity: { value: quality.dustLaneOpacity },
          uNebulaOpacity: { value: nebulaOpacity },
        }}
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
};

const PointCloudOverlay = ({
  data,
  opacity,
  pixelRatio,
  renderOrder,
  vertexShader,
  fragmentShader,
}: OverlayShaderProps): ReactElement => {
  // See `useQualityLevel`: a replaced `uniforms` object never reaches an
  // already-compiled program, so the opacity of a new rung would be ignored.
  const level = useQualityLevel();

  return (
    <points renderOrder={renderOrder} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[data.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        key={level}
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={AdditiveBlending}
        uniforms={{
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: opacity },
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </points>
  );
};

const MilkyWayStarOverlay = (): ReactElement => {
  const quality = useQualityPreset((p) => p.milkyWayQuality);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const starCloud = useMemo(
    () => buildStarCloud(quality),
    [quality],
  );

  return (
    <PointCloudOverlay
      data={starCloud}
      opacity={quality.overlayStarOpacity}
      pixelRatio={pixelRatio}
      renderOrder={-14}
      vertexShader={STAR_VERTEX_SHADER}
      fragmentShader={STAR_FRAGMENT_SHADER}
    />
  );
};

const MilkyWayMicroStarOverlay = (): ReactElement => {
  const quality = useQualityPreset((p) => p.milkyWayQuality);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const starCloud = useMemo(
    () => buildMicroStarCloud(quality),
    [quality],
  );

  return (
    <PointCloudOverlay
      data={starCloud}
      opacity={quality.overlayMicroStarOpacity}
      pixelRatio={pixelRatio}
      renderOrder={-17}
      vertexShader={STAR_VERTEX_SHADER}
      fragmentShader={STAR_FRAGMENT_SHADER}
    />
  );
};

const MilkyWayNebulaOverlay = (): ReactElement => {
  const quality = useQualityPreset((p) => p.milkyWayQuality);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const nebulaCloud = useMemo(
    () => buildNebulaCloud(quality),
    [quality],
  );

  return (
    <PointCloudOverlay
      data={nebulaCloud}
      opacity={quality.nebulaOpacity}
      pixelRatio={pixelRatio}
      renderOrder={-16}
      vertexShader={NEBULA_VERTEX_SHADER}
      fragmentShader={NEBULA_FRAGMENT_SHADER}
    />
  );
};

const MilkyWayDeepSkyObjectOverlay = (): ReactElement => {
  const quality = useQualityPreset((p) => p.milkyWayQuality);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const cloud = useMemo(
    () => buildDeepSkyObjectCloud(quality),
    [quality],
  );

  return (
    <PointCloudOverlay
      data={cloud}
      opacity={quality.deepSkyObjectOpacity}
      pixelRatio={pixelRatio}
      renderOrder={-15}
      vertexShader={DEEP_SKY_OBJECT_VERTEX_SHADER}
      fragmentShader={DEEP_SKY_OBJECT_FRAGMENT_SHADER}
    />
  );
};

export const MilkyWayBackground = (): ReactElement => {
  const { nebulaOpacity, deepSkyObjectOpacity, overlayMicroStarCount } =
    useQualityPreset((p) => p.milkyWayQuality);

  /**
   * Both overlays are authored features that every preset currently ships at
   * zero opacity. They are gated rather than deleted, so the capability
   * survives a future preset that turns them back on — but an invisible point
   * cloud drawn with `depthTest={false}` and additive blending is pure
   * overdraw with no early-Z rejection, and its buffers still cost the CPU a
   * build and the GPU an upload. Gating here keeps both off the critical path.
   */
  return (
    <group>
      <MilkyWaySphere />
      {nebulaOpacity > 0 ? <MilkyWayNebulaOverlay /> : null}
      {deepSkyObjectOpacity > 0 ? <MilkyWayDeepSkyObjectOverlay /> : null}
      {overlayMicroStarCount > 0 ? <MilkyWayMicroStarOverlay /> : null}
      <MilkyWayStarOverlay />
    </group>
  );
};

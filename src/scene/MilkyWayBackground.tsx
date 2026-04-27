import { useMemo, type ReactElement } from "react";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, BackSide } from "three";
import {
  getGraphicsPreset,
  type MilkyWayQualityPreset,
} from "../lib/graphicsTier";

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

const SKY_VERTEX_SHADER = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = normalize(worldPosition.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const SKY_FRAGMENT_SHADER = `
uniform float uBandIntensity;
uniform float uDustLaneOpacity;
uniform float uNebulaOpacity;
varying vec3 vWorldPosition;

float hash(vec2 point) {
  return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 point) {
  vec2 i = floor(point);
  vec2 f = fract(point);
  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 point) {
  float value = 0.0;
  float amplitude = 0.5;
  mat2 rotation = mat2(1.6, 1.2, -1.2, 1.6);
  for (int octave = 0; octave < 5; octave++) {
    value += amplitude * noise(point);
    point = rotation * point * 1.82;
    amplitude *= 0.52;
  }
  return value;
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float latitude = dir.y;
  vec2 flowUv = vec2(
    dir.x * 4.8 + dir.z * 2.4,
    latitude * 8.0 + dir.z * 1.7
  );

  float bandCenter =
    0.024 * sin(dir.x * 5.2 + dir.z * 2.1) +
    0.014 * sin(dir.x * 11.0 - dir.z * 7.4) +
    0.012 * (fbm(vec2(dir.x * 3.1 + dir.z * 1.4, dir.z * 3.6 - dir.x * 1.7) + vec2(0.7, 2.1)) - 0.5);
  float bandDistance = abs(latitude - bandCenter);
  float bandCore = exp(-pow(bandDistance / 0.026, 2.0));
  float bandGlow = exp(-pow(bandDistance / 0.075, 2.0));
  float starMist = fbm(flowUv + vec2(3.0, -2.0));

  vec3 bulgeDirection = normalize(vec3(0.92, 0.03, -0.38));
  float bulgeDistance = 1.0 - max(dot(dir, bulgeDirection), 0.0);
  float bulge = exp(-pow(bulgeDistance / 0.32, 2.0)) * bandGlow;

  float dustNoiseA = fbm(vec2(dir.x * 10.0 + dir.z * 4.0, latitude * 30.0) + vec2(14.0, 3.0));
  float dustNoiseB = fbm(vec2(dir.x * 15.0 - dir.z * 9.0, latitude * 46.0) + vec2(-8.0, 9.0));
  float dustMask = smoothstep(0.62, 0.92, dustNoiseA * 0.7 + dustNoiseB * 0.5);
  float dustLanes = dustMask * bandGlow * uDustLaneOpacity;

  float nebulaFieldA = fbm(vec2(dir.x * 3.2 + dir.z * 1.5, latitude * 12.0) + vec2(2.0, 11.0));
  float nebulaFieldB = fbm(vec2(dir.x * 6.0 - dir.z * 2.8, latitude * 20.0) + vec2(-6.0, 7.0));
  float nebulaMask = smoothstep(0.84, 0.96, nebulaFieldA * 0.7 + nebulaFieldB * 0.5);
  nebulaMask *= smoothstep(0.08, 0.018, bandDistance);

  vec3 baseSpace = vec3(0.00001, 0.000015, 0.00004) +
    vec3(0.00002, 0.00003, 0.00008) * pow(max(0.0, 1.0 - abs(latitude)), 5.2);
  vec3 bandColor = mix(
    vec3(0.015, 0.02, 0.045),
    vec3(0.06, 0.065, 0.09),
    starMist * 0.62 + bulge * 0.38
  );
  vec3 nebulaColorA = vec3(0.035, 0.07, 0.14);
  vec3 nebulaColorB = vec3(0.08, 0.045, 0.09);
  vec3 nebulaColor = mix(
    nebulaColorA,
    nebulaColorB,
    fbm(vec2(dir.x * 4.2 + dir.z * 2.1, latitude * 15.0) + vec2(20.0, -4.0))
  );

  vec3 color = baseSpace;
  color += bandColor * ((bandGlow * 0.02 + bandCore * 0.085 + bulge * 0.008) * uBandIntensity);
  color += nebulaColor * (nebulaMask * uNebulaOpacity * 0.09);
  color *= 1.0 - dustLanes * (0.74 + bandCore * 0.18);

  float faintScatter = fbm(vec2(dir.x * 18.0 + dir.z * 4.0, latitude * 18.0) + vec2(1.7, 5.2));
  color += vec3(0.00008, 0.0001, 0.00018) * pow(faintScatter, 8.0) * 0.025;

  gl_FragColor = vec4(color, 1.0);
}
`;

const STAR_VERTEX_SHADER = `
uniform float uPixelRatio;
attribute vec3 color;
attribute float size;
varying vec3 vColor;
varying float vPointSize;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  float pointSize = max(size * uPixelRatio, 1.15);
  gl_PointSize = pointSize;
  vPointSize = pointSize;
}
`;

const STAR_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec3 vColor;
varying float vPointSize;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  float edgeWidth = max(fwidth(dist), 0.7 / max(vPointSize, 1.0));
  float disc = smoothstep(0.5 + edgeWidth, 0.5 - edgeWidth, dist);
  if (disc <= 0.001) discard;

  float coreRadius = mix(0.19, 0.145, smoothstep(1.15, 2.0, vPointSize));
  float glowRadius = mix(0.44, 0.36, smoothstep(1.15, 2.0, vPointSize));
  float core = smoothstep(coreRadius + edgeWidth, coreRadius - edgeWidth, dist);
  float glow = pow(
    smoothstep(glowRadius + edgeWidth, 0.025, dist),
    1.72
  );
  float alpha = disc * (core * 1.24 + glow * 0.18) * uOpacity;
  vec3 color = vColor * (0.985 + core * 0.96);
  gl_FragColor = vec4(color, alpha);
}
`;

const NEBULA_VERTEX_SHADER = `
uniform float uPixelRatio;
attribute vec3 color;
attribute float size;
varying vec3 vColor;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * uPixelRatio;
}
`;

const NEBULA_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  float falloff = pow(smoothstep(0.5, 0.0, dist), 2.4);
  float core = pow(smoothstep(0.32, 0.0, dist), 1.4);
  float alpha = (falloff * 0.75 + core * 0.25) * uOpacity;
  vec3 color = vColor * (0.45 + core * 0.4);
  gl_FragColor = vec4(color, alpha);
}
`;

const DEEP_SKY_OBJECT_VERTEX_SHADER = `
uniform float uPixelRatio;
attribute vec3 color;
attribute float size;
varying vec3 vColor;
void main() {
  vColor = color;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = size * uPixelRatio;
}
`;

const DEEP_SKY_OBJECT_FRAGMENT_SHADER = `
uniform float uOpacity;
varying vec3 vColor;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  float halo = pow(smoothstep(0.5, 0.0, dist), 2.2);
  float core = smoothstep(0.2, 0.0, dist);
  float alpha = (halo * 0.75 + core * 0.45) * uOpacity;
  vec3 color = vColor * (0.62 + core * 0.5);
  gl_FragColor = vec4(color, alpha);
}
`;

type RgbTriplet = readonly [number, number, number];

type PointCloudData = {
  readonly positions: Float32Array;
  readonly colors: Float32Array;
  readonly sizes: Float32Array;
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

    const offset = i * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    colors[offset] = red * brightness;
    colors[offset + 1] = green * brightness;
    colors[offset + 2] = blue * brightness;
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

    const offset = i * 3;
    positions[offset] = x;
    positions[offset + 1] = y;
    positions[offset + 2] = z;
    colors[offset] = red * brightness;
    colors[offset + 1] = green * brightness;
    colors[offset + 2] = blue * brightness;
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
  const preset = getGraphicsPreset();
  const [mwW, mwH] = preset.milkyWaySphere;

  return (
    <mesh rotation={MILKY_WAY_ROTATION} renderOrder={-20}>
      <sphereGeometry args={[3200, mwW, mwH]} />
      <shaderMaterial
        side={BackSide}
        toneMapped={false}
        depthWrite={false}
        uniforms={{
          uBandIntensity: { value: preset.milkyWayQuality.bandIntensity },
          uDustLaneOpacity: { value: preset.milkyWayQuality.dustLaneOpacity },
          uNebulaOpacity: { value: preset.milkyWayQuality.nebulaOpacity },
        }}
        vertexShader={SKY_VERTEX_SHADER}
        fragmentShader={SKY_FRAGMENT_SHADER}
      />
    </mesh>
  );
};

const MilkyWayStarOverlay = (): ReactElement => {
  const preset = getGraphicsPreset();
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const starCloud = useMemo(
    () => buildStarCloud(preset.milkyWayQuality),
    [preset.milkyWayQuality],
  );

  return (
    <points renderOrder={-14} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[starCloud.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[starCloud.colors, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[starCloud.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={AdditiveBlending}
        uniforms={{
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: preset.milkyWayQuality.overlayStarOpacity },
        }}
        vertexShader={STAR_VERTEX_SHADER}
        fragmentShader={STAR_FRAGMENT_SHADER}
      />
    </points>
  );
};

const MilkyWayMicroStarOverlay = (): ReactElement => {
  const preset = getGraphicsPreset();
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const starCloud = useMemo(
    () => buildMicroStarCloud(preset.milkyWayQuality),
    [preset.milkyWayQuality],
  );

  return (
    <points renderOrder={-17} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[starCloud.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[starCloud.colors, 3]}
        />
        <bufferAttribute attach="attributes-size" args={[starCloud.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={AdditiveBlending}
        uniforms={{
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: preset.milkyWayQuality.overlayMicroStarOpacity },
        }}
        vertexShader={STAR_VERTEX_SHADER}
        fragmentShader={STAR_FRAGMENT_SHADER}
      />
    </points>
  );
};

const MilkyWayNebulaOverlay = (): ReactElement => {
  const preset = getGraphicsPreset();
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const nebulaCloud = useMemo(
    () => buildNebulaCloud(preset.milkyWayQuality),
    [preset.milkyWayQuality],
  );

  return (
    <points renderOrder={-16} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[nebulaCloud.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[nebulaCloud.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[nebulaCloud.sizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={AdditiveBlending}
        uniforms={{
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: preset.milkyWayQuality.nebulaOpacity },
        }}
        vertexShader={NEBULA_VERTEX_SHADER}
        fragmentShader={NEBULA_FRAGMENT_SHADER}
      />
    </points>
  );
};

const MilkyWayDeepSkyObjectOverlay = (): ReactElement => {
  const preset = getGraphicsPreset();
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const cloud = useMemo(
    () => buildDeepSkyObjectCloud(preset.milkyWayQuality),
    [preset.milkyWayQuality],
  );

  return (
    <points renderOrder={-15} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[cloud.positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[cloud.colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[cloud.sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        depthTest={false}
        toneMapped={false}
        blending={AdditiveBlending}
        uniforms={{
          uPixelRatio: { value: pixelRatio },
          uOpacity: { value: preset.milkyWayQuality.deepSkyObjectOpacity },
        }}
        vertexShader={DEEP_SKY_OBJECT_VERTEX_SHADER}
        fragmentShader={DEEP_SKY_OBJECT_FRAGMENT_SHADER}
      />
    </points>
  );
};

export const MilkyWayBackground = (): ReactElement => {
  return (
    <group>
      <MilkyWaySphere />
      <MilkyWayNebulaOverlay />
      <MilkyWayDeepSkyObjectOverlay />
      <MilkyWayMicroStarOverlay />
      <MilkyWayStarOverlay />
    </group>
  );
};

export const SKY_VERTEX_SHADER = `
varying vec3 vWorldPosition;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = normalize(worldPosition.xyz);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * The nebula term costs three of this shader's eight `fbm` calls — each five
 * octaves of four `sin()` — across a sphere that fills the screen. Every preset
 * currently sets `uNebulaOpacity` to zero, which multiplied all of that work
 * away at the last line. It is compiled in only when a preset actually asks
 * for it, via `buildSkyFragmentShader`, so the feature survives without
 * costing anything while it is switched off.
 */
const NEBULA_CHUNK = `
  float nebulaFieldA = fbm(vec2(dir.x * 3.2 + dir.z * 1.5, latitude * 12.0) + vec2(2.0, 11.0));
  float nebulaFieldB = fbm(vec2(dir.x * 6.0 - dir.z * 2.8, latitude * 20.0) + vec2(-6.0, 7.0));
  float nebulaMask = smoothstep(0.84, 0.96, nebulaFieldA * 0.7 + nebulaFieldB * 0.5);
  nebulaMask *= smoothstep(0.08, 0.018, bandDistance);

  vec3 nebulaColorA = vec3(0.035, 0.07, 0.14);
  vec3 nebulaColorB = vec3(0.08, 0.045, 0.09);
  vec3 nebulaColor = mix(
    nebulaColorA,
    nebulaColorB,
    fbm(vec2(dir.x * 4.2 + dir.z * 2.1, latitude * 15.0) + vec2(20.0, -4.0))
  );
  color += nebulaColor * (nebulaMask * uNebulaOpacity * 0.09);
`;

/**
 * The dust lanes cost two of the five `fbm` calls the base sky makes, and
 * produce a darkening that is at most a couple of levels out of 255 in the
 * final image. Off, the term collapses to a constant the compiler folds away.
 */
const DUST_CHUNK = `
  float dustNoiseA = fbm(vec2(dir.x * 10.0 + dir.z * 4.0, latitude * 30.0) + vec2(14.0, 3.0));
  float dustNoiseB = fbm(vec2(dir.x * 15.0 - dir.z * 9.0, latitude * 46.0) + vec2(-8.0, 9.0));
  float dustMask = smoothstep(0.62, 0.92, dustNoiseA * 0.7 + dustNoiseB * 0.5);
  float dustLanes = dustMask * bandGlow * uDustLaneOpacity;
`;

const DUST_CHUNK_OFF = `
  float dustLanes = 0.0;
`;

/**
 * The mottling inside the band. `0.5` is the mean of an fbm chain, so turning
 * it off leaves the band at its average brightness rather than shifting it.
 * `flowUv` then feeds nothing and is dropped by the shader compiler.
 */
const STAR_MIST_CHUNK = `  float starMist = fbm(flowUv + vec2(3.0, -2.0));`;
const STAR_MIST_CHUNK_OFF = `  float starMist = 0.5;`;

/**
 * Gated with the star mist because it is the same faint-noise family. Its
 * contribution peaks around 2e-6 in linear space, far below one 8-bit level.
 */
const FAINT_SCATTER_CHUNK = `
  float faintScatter = fbm(vec2(dir.x * 18.0 + dir.z * 4.0, latitude * 18.0) + vec2(1.7, 5.2));
  color += vec3(0.00008, 0.0001, 0.00018) * pow(faintScatter, 8.0) * 0.025;
`;

const SKY_FRAGMENT_SHADER_TEMPLATE = `
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
  for (int octave = 0; octave < __FBM_OCTAVES__; octave++) {
    value += amplitude * noise(point);
    point = rotation * point * 1.82;
    amplitude *= 0.52;
  }
  return value * __FBM_NORMALIZATION__;
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
/* STAR_MIST_CHUNK */

  vec3 bulgeDirection = normalize(vec3(0.92, 0.03, -0.38));
  float bulgeDistance = 1.0 - max(dot(dir, bulgeDirection), 0.0);
  float bulge = exp(-pow(bulgeDistance / 0.32, 2.0)) * bandGlow;

/* DUST_CHUNK */
  vec3 baseSpace = vec3(0.00001, 0.000015, 0.00004) +
    vec3(0.00002, 0.00003, 0.00008) * pow(max(0.0, 1.0 - abs(latitude)), 5.2);
  vec3 bandColor = mix(
    vec3(0.015, 0.02, 0.045),
    vec3(0.06, 0.065, 0.09),
    starMist * 0.62 + bulge * 0.38
  );

  vec3 color = baseSpace;
  color += bandColor * ((bandGlow * 0.02 + bandCore * 0.085 + bulge * 0.008) * uBandIntensity);
/* NEBULA_CHUNK */
  color *= 1.0 - dustLanes * (0.74 + bandCore * 0.18);
/* FAINT_SCATTER_CHUNK */
  gl_FragColor = vec4(color, 1.0);
}
`;

/** The octave count the shader was authored against. */
const REFERENCE_FBM_OCTAVES = 5;
const FBM_BASE_AMPLITUDE = 0.5;
const FBM_AMPLITUDE_FALLOFF = 0.52;

const fbmAmplitudeSum = (octaves: number): number => {
  let amplitude = FBM_BASE_AMPLITUDE;
  let sum = 0;
  for (let i = 0; i < octaves; i += 1) {
    sum += amplitude;
    amplitude *= FBM_AMPLITUDE_FALLOFF;
  }
  return sum;
};

/**
 * Keeps a shortened fbm chain in the same range as the full one.
 *
 * Without it, dropping octaves quietly halves the noise: every threshold the
 * shader applies to an fbm result (`smoothstep(0.62, 0.92, ...)`, the
 * `- 0.5` that centres the band's wander) is tuned for a chain that sums to
 * ~1.0, so a two-octave sky would not merely be cheaper, it would be a
 * different picture with the band drifting off centre. At the reference count
 * this returns exactly 1, and multiplying by 1 is an exact no-op in IEEE 754 —
 * which is what lets level 0 stay bit-identical to the shader as authored.
 */
const fbmNormalization = (octaves: number): number =>
  fbmAmplitudeSum(REFERENCE_FBM_OCTAVES) / fbmAmplitudeSum(octaves);

export type SkyShaderOptions = {
  readonly withNebula: boolean;
  readonly fbmOctaves: number;
  readonly dustLanes: boolean;
  readonly starMist: boolean;
};

/**
 * Builds the sky shader for a preset.
 *
 * The sky is a sphere that fills the screen, so every term here is paid once
 * per pixel and nothing else in the scene comes close to its fill cost. At
 * level 0 it runs five `fbm` chains of five octaves each; at the bottom rung
 * one chain of one octave, a twenty-fifth of the noise work, which is the
 * single largest saving available on a fill-bound machine.
 */
export const buildSkyFragmentShader = ({
  withNebula,
  fbmOctaves,
  dustLanes,
  starMist,
}: SkyShaderOptions): string => {
  const octaves = Math.max(1, Math.round(fbmOctaves));
  return SKY_FRAGMENT_SHADER_TEMPLATE.replace(
    '/* NEBULA_CHUNK */',
    withNebula ? NEBULA_CHUNK : '',
  )
    .replace('/* DUST_CHUNK */', dustLanes ? DUST_CHUNK : DUST_CHUNK_OFF)
    .replace(
      '/* STAR_MIST_CHUNK */',
      starMist ? STAR_MIST_CHUNK : STAR_MIST_CHUNK_OFF,
    )
    .replace('/* FAINT_SCATTER_CHUNK */', starMist ? FAINT_SCATTER_CHUNK : '')
    .replace('__FBM_OCTAVES__', String(octaves))
    .replace('__FBM_NORMALIZATION__', fbmNormalization(octaves).toFixed(8));
};

export const STAR_VERTEX_SHADER = `
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

export const STAR_FRAGMENT_SHADER = `
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

export const NEBULA_VERTEX_SHADER = `
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

export const NEBULA_FRAGMENT_SHADER = `
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

export const DEEP_SKY_OBJECT_VERTEX_SHADER = `
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

export const DEEP_SKY_OBJECT_FRAGMENT_SHADER = `
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

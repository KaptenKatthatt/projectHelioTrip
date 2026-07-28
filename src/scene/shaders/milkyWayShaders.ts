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

  float faintScatter = fbm(vec2(dir.x * 18.0 + dir.z * 4.0, latitude * 18.0) + vec2(1.7, 5.2));
  color += vec3(0.00008, 0.0001, 0.00018) * pow(faintScatter, 8.0) * 0.025;

  gl_FragColor = vec4(color, 1.0);
}
`;

const NEBULA_PLACEHOLDER = '/* NEBULA_CHUNK */';

/**
 * Builds the sky shader for a preset. Passing `false` drops three full
 * five-octave `fbm` evaluations per fragment that would otherwise be computed
 * and then multiplied by a zero uniform.
 */
export const buildSkyFragmentShader = (withNebula: boolean): string =>
  SKY_FRAGMENT_SHADER_TEMPLATE.replace(
    NEBULA_PLACEHOLDER,
    withNebula ? NEBULA_CHUNK : '',
  );

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

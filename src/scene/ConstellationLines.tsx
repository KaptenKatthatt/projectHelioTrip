import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { CONSTELLATION_SHAPES } from '../lib/constellationShapes';
import type { ConstellationId } from '../lib/constellations';
import { useStore } from '../store/useStore';

const SKY_RADIUS = 2450;
const LINE_COLOR = '#8ec5ff';
const STAR_SIZE = 8;
const LINE_WIDTH = 1.2;
const STAR_COLOR = new Vector3(0.85, 0.93, 1.0);
const FADE_OUT_MS = 350;
const FADE_IN_MS = 450;
const FADE_OUT_SECONDS = FADE_OUT_MS / 1000;
const FADE_IN_SECONDS = FADE_IN_MS / 1000;
const CANONICAL_FORWARD = new Vector3(0, 0, -1);

const STAR_VERTEX_SHADER = `
uniform float uSize;
uniform float uPixelRatio;
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uSize * uPixelRatio;
}
`;

const STAR_FRAGMENT_SHADER = `
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  vec2 centered = gl_PointCoord - vec2(0.5);
  float dist = length(centered);
  if (dist > 0.5) discard;

  float core = smoothstep(0.2, 0.0, dist);
  float glow = smoothstep(0.5, 0.0, dist) * 0.9;
  float alpha = max(core, glow) * uOpacity;
  vec3 color = uColor * (0.95 + core * 0.9);
  gl_FragColor = vec4(color, alpha);
}
`;

type RenderData = {
  readonly lineSegments: readonly [Vector3, Vector3][];
  readonly starGeometry: BufferGeometry;
  readonly starSize: number;
};

type StarUniformMaterial = ShaderMaterial & {
  uniforms: {
    uColor: { value: Vector3 };
    uSize: { value: number };
    uPixelRatio: { value: number };
    uOpacity: { value: number };
  };
};

const toDirection = (raHours: number, decDeg: number): Vector3 => {
  const ra = (raHours / 24) * Math.PI * 2;
  const dec = (decDeg * Math.PI) / 180;
  const cosDec = Math.cos(dec);
  return new Vector3(
    cosDec * Math.cos(ra),
    Math.sin(dec),
    cosDec * Math.sin(ra),
  ).normalize();
};

const buildRenderData = (selectedId: ConstellationId): RenderData => {
  const shape = CONSTELLATION_SHAPES[selectedId];

  const starMap = new Map<string, Vector3>();
  const centroid = new Vector3();
  for (const star of shape.stars) {
    const dir = toDirection(star.rightAscensionHours, star.declinationDeg);
    centroid.add(dir);
    starMap.set(star.id, dir);
  }

  if (centroid.lengthSq() <= 1e-8) centroid.copy(CANONICAL_FORWARD);
  else centroid.normalize();
  const align = new Quaternion().setFromUnitVectors(centroid, CANONICAL_FORWARD);
  for (const dir of starMap.values()) {
    dir.applyQuaternion(align).multiplyScalar(SKY_RADIUS);
  }

  const starPositions = new Float32Array(shape.stars.length * 3);
  shape.stars.forEach((star, index) => {
    const pos = starMap.get(star.id);
    if (!pos) return;
    const offset = index * 3;
    starPositions[offset] = pos.x;
    starPositions[offset + 1] = pos.y;
    starPositions[offset + 2] = pos.z;
  });

  const starGeometry = new BufferGeometry();
  starGeometry.setAttribute('position', new Float32BufferAttribute(starPositions, 3));

  const lineSegments: [Vector3, Vector3][] = [];
  for (const [from, to] of shape.segments) {
    const a = starMap.get(from);
    const b = starMap.get(to);
    if (!a || !b) continue;
    lineSegments.push([a.clone(), b.clone()]);
  }

  return { lineSegments, starGeometry, starSize: STAR_SIZE };
};

export const ConstellationLines = () => {
  const camera = useThree((s) => s.camera);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const isTraveling = useStore((s) => s.isTraveling);
  const constellationLinesVisible = useStore((s) => s.constellationLinesVisible);
  const groupRef = useRef<Group>(null);
  const starMaterialRef = useRef<StarUniformMaterial | null>(null);
  const displayedIdRef = useRef<ConstellationId | null>(null);
  const nextIdRef = useRef<ConstellationId | null>(null);
  const phaseRef = useRef<'idle' | 'fadeOut' | 'fadeIn'>('idle');
  const opacityRef = useRef(0);
  const [displayedId, setDisplayedId] = useState<ConstellationId | null>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    displayedIdRef.current = displayedId;
  }, [displayedId]);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    const current = displayedIdRef.current;

    if (!selectedConstellation) {
      nextIdRef.current = null;
      if (!current) {
        phaseRef.current = 'idle';
        opacityRef.current = 0;
        setOpacity(0);
        return;
      }
      phaseRef.current = 'fadeOut';
      return;
    }

    if (isTraveling) return;

    if (!current) {
      displayedIdRef.current = selectedConstellation;
      setDisplayedId(selectedConstellation);
      opacityRef.current = 0;
      setOpacity(0);
      phaseRef.current = 'fadeIn';
      return;
    }

    if (current === selectedConstellation) return;
    nextIdRef.current = selectedConstellation;
    phaseRef.current = 'fadeOut';
  }, [selectedConstellation, isTraveling]);

  const renderData = useMemo(() => {
    if (!displayedId) return null;
    return buildRenderData(displayedId);
  }, [displayedId]);

  useEffect(
    () => () => {
      if (!renderData) return;
      renderData.starGeometry.dispose();
    },
    [renderData],
  );

  useFrame((_, delta) => {
    const phase = phaseRef.current;
    if (phase === 'fadeOut') {
      const nextOpacity =
        FADE_OUT_SECONDS <= 1e-6
          ? 0
          : Math.max(0, opacityRef.current - delta / FADE_OUT_SECONDS);
      opacityRef.current = nextOpacity;
      setOpacity(nextOpacity);
    } else if (phase === 'fadeIn') {
      const nextOpacity =
        FADE_IN_SECONDS <= 1e-6
          ? 1
          : Math.min(1, opacityRef.current + delta / FADE_IN_SECONDS);
      opacityRef.current = nextOpacity;
      setOpacity(nextOpacity);
    }

    if (phase === 'fadeOut' && opacityRef.current <= 0.001) {
      const nextId = nextIdRef.current;
      if (nextId) {
        nextIdRef.current = null;
        displayedIdRef.current = nextId;
        setDisplayedId(nextId);
        opacityRef.current = 0;
        setOpacity(0);
        phaseRef.current = 'fadeIn';
      } else {
        displayedIdRef.current = null;
        setDisplayedId(null);
        phaseRef.current = 'idle';
      }
    } else if (phase === 'fadeIn' && opacityRef.current >= 0.999) {
      opacityRef.current = 1;
      setOpacity(1);
      phaseRef.current = 'idle';
    }

    const group = groupRef.current;
    if (!group) return;
    group.position.copy(camera.position);
    group.quaternion.copy(camera.quaternion);

    const starMaterial = starMaterialRef.current;
    if (!starMaterial || !renderData) return;
    const visibleOpacity = isTraveling ? 0 : opacity;
    starMaterial.uniforms.uSize.value = renderData.starSize;
    starMaterial.uniforms.uPixelRatio.value = pixelRatio;
    starMaterial.uniforms.uOpacity.value = visibleOpacity;
  });

  if (!renderData) return null;
  const visibleOpacity = isTraveling ? 0 : opacity;
  const lineOpacity = constellationLinesVisible ? visibleOpacity * 0.95 : 0;

  return (
    <group ref={groupRef} renderOrder={5}>
      {renderData.lineSegments.map(([from, to], index) => (
        <Line
          key={`${from.x}:${from.y}:${from.z}:${index}`}
          points={[from, to]}
          color={LINE_COLOR}
          lineWidth={LINE_WIDTH}
          transparent
          opacity={lineOpacity}
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
        />
      ))}
      <points geometry={renderData.starGeometry}>
        <shaderMaterial
          ref={starMaterialRef}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
          uniforms={{
            uColor: { value: STAR_COLOR },
            uSize: { value: renderData.starSize },
            uPixelRatio: { value: pixelRatio },
            uOpacity: { value: visibleOpacity },
          }}
          vertexShader={STAR_VERTEX_SHADER}
          fragmentShader={STAR_FRAGMENT_SHADER}
        />
      </points>
    </group>
  );
};


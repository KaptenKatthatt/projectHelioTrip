import { Line } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
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
const FADE_OUT_MS = 170;
const FADE_IN_MS = 220;

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
  for (const star of shape.stars) {
    starMap.set(
      star.id,
      toDirection(star.rightAscensionHours, star.declinationDeg).multiplyScalar(
        SKY_RADIUS,
      ),
    );
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
  const constellationLinesVisible = useStore((s) => s.constellationLinesVisible);
  const groupRef = useRef<Group>(null);
  const rafRef = useRef<number | null>(null);
  const displayedIdRef = useRef<ConstellationId | null>(null);
  const mountedRef = useRef(true);
  const [displayedId, setDisplayedId] = useState<ConstellationId | null>(null);
  const [opacity, setOpacity] = useState(0);

  const stopAnimation = (): void => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const animateOpacity = (
    from: number,
    to: number,
    durationMs: number,
    onDone?: () => void,
  ): void => {
    stopAnimation();
    const start = performance.now();
    const delta = to - from;
    setOpacity(from);
    const tick = (now: number): void => {
      if (!mountedRef.current) return;
      const progress = durationMs > 0 ? Math.min(1, (now - start) / durationMs) : 1;
      const eased = progress * progress * (3 - 2 * progress);
      setOpacity(from + delta * eased);
      if (progress >= 1) {
        rafRef.current = null;
        onDone?.();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopAnimation();
    };
  }, []);

  useEffect(() => {
    const current = displayedIdRef.current;

    if (!selectedConstellation) {
      if (!current) return;
      animateOpacity(opacity, 0, FADE_OUT_MS, () => {
        if (!mountedRef.current) return;
        displayedIdRef.current = null;
        setDisplayedId(null);
      });
      return;
    }

    if (!current) {
      displayedIdRef.current = selectedConstellation;
      setDisplayedId(selectedConstellation);
      animateOpacity(0, 1, FADE_IN_MS);
      return;
    }

    if (current === selectedConstellation) return;

    animateOpacity(opacity, 0, FADE_OUT_MS, () => {
      if (!mountedRef.current) return;
      displayedIdRef.current = selectedConstellation;
      setDisplayedId(selectedConstellation);
      animateOpacity(0, 1, FADE_IN_MS);
    });
  }, [selectedConstellation]);

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

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;
    group.position.copy(camera.position);
  });

  if (!renderData) return null;
  const lineOpacity = constellationLinesVisible ? opacity * 0.95 : 0;

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
          key={`stars-${renderData.starSize}-${pixelRatio}`}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
          uniforms={{
            uColor: { value: STAR_COLOR },
            uSize: { value: renderData.starSize },
            uPixelRatio: { value: pixelRatio },
            uOpacity: { value: opacity },
          }}
          vertexShader={STAR_VERTEX_SHADER}
          fragmentShader={STAR_FRAGMENT_SHADER}
        />
      </points>
    </group>
  );
};


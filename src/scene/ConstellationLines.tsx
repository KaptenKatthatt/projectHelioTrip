/**
 * RENDERING PIPELINE — two-step orientation
 * ==========================================
 *
 * STEP 1 — buildRenderData() (runs once per displayedId / aspect change):
 *   Calls computeConstellationOrientation() which rotates the figure so:
 *     a) its barycenter points along local -Z ("into the scene")
 *     b) the figure is rolled around -Z to fit within the smallest possible FOV
 *   Star positions and line endpoints are baked into geometry in this
 *   "-Z aligned" local frame. No sky-sphere position is involved yet.
 *
 * STEP 2 — useFrame() (runs every frame):
 *   Rotates the <group> so its local -Z aligns with the constellation's actual
 *   sky direction from SKY_TARGET_DIRECTIONS, then applies any user spin offset.
 *
 * QUICK REFERENCE
 * ---------------
 * To move where a constellation appears in the sky  → edit SKY_TARGET_DIRECTIONS in skyTargets.ts
 * To change how a figure is fitted / rolled          → edit computeConstellationOrientation in constellationOrientation.ts
 * To add a rotation offset per constellation         → edit CONSTELLATION_SPIN_DEG in constellationViewSettings.ts
 * To change fade timing                              → edit FADE_OUT_MS / FADE_IN_MS in useConstellationFade.ts
 */

import { Line } from '@react-three/drei/core/Line';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  PerspectiveCamera,
  Quaternion,
  ShaderMaterial,
  Vector3,
} from 'three';
import { computeConstellationOrientation } from '../lib/constellationOrientation';
import { CONSTELLATION_SHAPES } from '../lib/constellationShapes';
import type { ConstellationId } from '../lib/constellations';
import { equatorialToDirection } from '../lib/equatorial';
import { getConstellationSpinOffsetRad } from '../lib/constellationViewSettings';
import { SKY_TARGET_DIRECTIONS } from '../lib/skyTargets';
import { useStore } from '../store/useStore';
import { useConstellationFade } from './useConstellationFade';

const SKY_RADIUS = 2450;
/** Mesh-local "into scene" after buildRenderData; aligned to true sky direction in useFrame. */
const MESH_FORWARD = new Vector3(0, 0, -1);
const qAlignScratch = new Quaternion();
const qSpinScratch = new Quaternion();
const axisScratch = new Vector3();
const qTotalScratch = new Quaternion();
const LINE_COLOR = '#8ec5ff';
const STAR_SIZE = 8;
const LINE_WIDTH = 1.2;
const STAR_COLOR = new Vector3(0.85, 0.93, 1.0);
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

/**
 * Builds geometry for the constellation in LOCAL SPACE aligned to -Z.
 * The group's world orientation is set each frame in useFrame (Step 2 above).
 * Aspect ratio affects the roll/fit calculation only, not star positions.
 */
const buildRenderData = (selectedId: ConstellationId, aspect: number): RenderData => {
  const shape = CONSTELLATION_SHAPES[selectedId];
  const { quaternion: orient } = computeConstellationOrientation(shape, aspect);

  const starMap = new Map<string, Vector3>();
  for (const star of shape.stars) {
    const dir = equatorialToDirection({
      rightAscensionHours: star.rightAscensionHours,
      declinationDeg: star.declinationDeg,
    });
    dir.applyQuaternion(orient).multiplyScalar(SKY_RADIUS);
    starMap.set(star.id, dir);
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
  const size = useThree((s) => s.size);
  const pixelRatio = useThree((s) => s.gl.getPixelRatio());
  const aspect =
    camera instanceof PerspectiveCamera
      ? camera.aspect
      : size.width / Math.max(1, size.height);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const constellationLinesVisible = useStore((s) => s.constellationLinesVisible);

  const groupRef = useRef<Group>(null);
  const starMaterialRef = useRef<StarUniformMaterial | null>(null);

  // displayedId lags behind selectedConstellation intentionally (fade-out before fade-in).
  // Never read selectedConstellation directly for rendering decisions.
  const { displayedId, displayedIdRef, opacity, opacityRef } =
    useConstellationFade(selectedConstellation);

  const renderData = useMemo(() => {
    if (!displayedId) return null;
    return buildRenderData(displayedId, aspect);
  }, [displayedId, aspect]);

  // Dispose GPU geometry when renderData is replaced or component unmounts.
  useEffect(
    () => () => {
      renderData?.starGeometry.dispose();
    },
    [renderData],
  );

  useFrame(() => {
    // STEP 2: align the group to the sky and apply spin offset.
    const group = groupRef.current;
    const id = displayedIdRef.current;
    if (group && id) {
      const targetDir = SKY_TARGET_DIRECTIONS[id];
      if (!targetDir) {
        console.warn(`ConstellationLines: no sky target for "${id}" — figure will not be oriented`);
        return;
      }
      qAlignScratch.setFromUnitVectors(MESH_FORWARD, targetDir);
      const spin =
        getConstellationSpinOffsetRad(id) +
        useStore.getState().constellationUserSpinRad;
      axisScratch.copy(targetDir);
      qSpinScratch.setFromAxisAngle(axisScratch, spin);
      qTotalScratch.multiplyQuaternions(qSpinScratch, qAlignScratch);
      group.quaternion.copy(qTotalScratch);
      group.position.set(0, 0, 0);
    }

    // Update star shader uniforms from opacityRef (written by useConstellationFade's useFrame).
    const starMaterial = starMaterialRef.current;
    if (!starMaterial || !renderData) return;
    const visibleOpacity = opacityRef.current;
    starMaterial.uniforms.uSize.value = renderData.starSize;
    starMaterial.uniforms.uPixelRatio.value = pixelRatio;
    starMaterial.uniforms.uOpacity.value = visibleOpacity;
  });

  if (!renderData) return null;
  const visibleOpacity = opacity;
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

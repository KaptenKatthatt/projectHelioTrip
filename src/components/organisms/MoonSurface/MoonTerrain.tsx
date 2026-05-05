import { useMemo } from 'react';
import { useTexture, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { buildMoonTerrainGeometryAndRocks } from './terrainUtils';

// 20x20 tiles across the 300-unit terrain
const TILE_REPEAT = 20;

// Atlas layout: 4 cols × 3 rows = 12 tiles
//   Cols 0-2, rows 0-2: the 9 tiles from moon-texture_3x3.png
//   Col 3, row 0: moon_texture.png (center crop)
//   Col 3, row 1: moon-texture2.png (center crop)
//   Col 3, row 2: moon-texture2.png (left crop, distinct framing)
const ATLAS_COLS = 4;
const ATLAS_ROWS = 3;
const TILE_PX = 512; // output tile size in the combined atlas

function buildGroundAtlas(
  src3x3: HTMLImageElement,
  srcA: HTMLImageElement,
  srcB: HTMLImageElement,
): HTMLCanvasElement {
  const W = TILE_PX * ATLAS_COLS;
  const H = TILE_PX * ATLAS_ROWS;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Draw the 9 tiles from the 3x3 source into columns 0-2
  const tW = src3x3.width / 3;
  const tH = src3x3.height / 3;
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.drawImage(
        src3x3,
        col * tW, row * tH, tW, tH,
        col * TILE_PX, row * TILE_PX, TILE_PX, TILE_PX,
      );
    }
  }

  // Column 3: three distinct crops from the two single-tile images
  const dstX = 3 * TILE_PX;
  // Row 0: center of srcA
  const cxA = Math.floor((srcA.width - srcA.height) / 2);
  ctx.drawImage(srcA, cxA, 0, srcA.height, srcA.height, dstX, 0, TILE_PX, TILE_PX);
  // Row 1: center of srcB
  const cxB = Math.floor((srcB.width - srcB.height) / 2);
  ctx.drawImage(srcB, cxB, 0, srcB.height, srcB.height, dstX, TILE_PX, TILE_PX, TILE_PX);
  // Row 2: right portion of srcB for a different framing
  ctx.drawImage(srcB, srcB.width - srcB.height, 0, srcB.height, srcB.height, dstX, 2 * TILE_PX, TILE_PX, TILE_PX);

  return canvas;
}

// Stochastic atlas tiling shader:
// Per tile cell the hash picks one of 12 atlas tiles and applies a random
// rotation, then bilinearly blends at cell boundaries.
const GROUND_SHADER_GLSL = /* glsl */ `
vec2 stochasticHash(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

vec4 textureAtlasNoTile(sampler2D atlas, vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  vec4 col = vec4(0.0);
  float wsum = 0.0;

  for (int x = 0; x <= 1; x++) {
    for (int y = 0; y <= 1; y++) {
      vec2 cell = i + vec2(float(x), float(y));
      vec2 h = stochasticHash(cell);

      // Pick one of 12 tiles (4 cols x 3 rows)
      float tileIdx  = floor(h.x * 12.0);
      float tileCol  = mod(tileIdx, 4.0);
      float tileRow  = floor(tileIdx / 4.0);
      // Flip Y: canvas row 0 (top) = GL UV y near 1
      float tileRowGL = 2.0 - tileRow;

      // Random rotation within the tile
      float ang = h.y * 6.28318;
      float cs = cos(ang), sn = sin(ang);
      vec2 d = f - vec2(float(x), float(y));
      vec2 rotD = vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y);

      // Local UV [0,1]; inset 3% to avoid atlas bleed at tile edges
      vec2 localUV = fract(rotD + 0.5);
      localUV = 0.03 + localUV * 0.94;

      vec2 tileOrigin = vec2(tileCol, tileRowGL) / vec2(4.0, 3.0);
      vec2 atlasUV   = tileOrigin + localUV / vec2(4.0, 3.0);

      float w = (1.0 - abs(d.x)) * (1.0 - abs(d.y));
      col   += texture2D(atlas, atlasUV) * w;
      wsum  += w;
    }
  }
  return col / wsum;
}
`;

function applyAtlasStochasticTiling(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = GROUND_SHADER_GLSL + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    'texture2D( map, vMapUv )',
    'textureAtlasNoTile( map, vMapUv )',
  );
}

export const MoonTerrain = () => {
  const [raw3x3, rawA, rawB] = useTexture([
    '/moon-texture_3x3.png',
    '/moon_texture.png',
    '/moon-texture2.png',
  ]);

  const groundTexture = useMemo(() => {
    const canvas = buildGroundAtlas(
      raw3x3.image as HTMLImageElement,
      rawA.image as HTMLImageElement,
      rawB.image as HTMLImageElement,
    );
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    // repeat scales vMapUv to (0..TILE_REPEAT); wrapping handled by the shader
    t.repeat.set(TILE_REPEAT, TILE_REPEAT);
    return t;
  }, [raw3x3, rawA, rawB]);

  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 1,
      metalness: 0.0,
      color: '#c8cdd0',
    });
    mat.onBeforeCompile = applyAtlasStochasticTiling;
    mat.customProgramCacheKey = () => 'moon-atlas-stochastic-v2';
    return mat;
  }, [groundTexture]);

  const rockTexture = useMemo(() => {
    const t = rawA.clone();
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1, 1);
    t.needsUpdate = true;
    return t;
  }, [rawA]);

  const { geometry, rocks } = useMemo(() => buildMoonTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow material={groundMaterial} />

      <Instances range={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial map={rockTexture} roughness={1} metalness={0.0} color="#909090" />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} />
        ))}
      </Instances>
    </group>
  );
};

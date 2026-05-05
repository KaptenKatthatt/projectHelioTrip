import { useMemo } from 'react';
import { useTexture, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { buildMoonTerrainGeometryAndRocks } from './terrainUtils';

// 30x30 tiles across the 300-unit terrain for higher detail
const TILE_REPEAT = 30;

const ATLAS_COLS = 4;
const ATLAS_ROWS = 2;
const TILE_PX = 512;

function buildGroundAtlas(
  srcA: HTMLImageElement,
  srcB: HTMLImageElement,
): HTMLCanvasElement {
  const W = TILE_PX * ATLAS_COLS;
  const H = TILE_PX * ATLAS_ROWS;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Fill with a neutral moon gray first
  ctx.fillStyle = '#888';
  ctx.fillRect(0, 0, W, H);

  const drawCrops = (img: HTMLImageElement, rowIdx: number) => {
    const sH = img.height;
    const stepX = (img.width - sH) / (ATLAS_COLS - 1);
    for (let col = 0; col < ATLAS_COLS; col++) {
      ctx.globalAlpha = 1.0;
      ctx.drawImage(
        img,
        col * stepX, 0, sH, sH,
        col * TILE_PX, rowIdx * TILE_PX, TILE_PX, TILE_PX,
      );
      
      // Subtly overlay a centered version to hide distinct features at edges
      ctx.globalAlpha = 0.2;
      ctx.drawImage(
        img,
        (img.width - sH) / 2, 0, sH, sH,
        col * TILE_PX, rowIdx * TILE_PX, TILE_PX, TILE_PX,
      );
    }
  };

  drawCrops(srcA, 0);
  drawCrops(srcB, 1);

  return canvas;
}

// Advanced Stochastic Tiling Shader
// Based on "Procedural Stochastic Textures by Tiling and Blending" (Heitz & Neyret)
// Uses a triangular grid for 3-tap blending (smoother than 4-tap rectangular)
const GROUND_SHADER_GLSL = /* glsl */ `
vec2 hash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

vec4 sampleStochasticLayer(sampler2D tex, vec2 uv, vec2 dx, vec2 dy) {
  // Triangular grid skewing
  mat2 s = mat2(1.0, 0.0, -0.57735027, 1.15470054);
  vec2 skewedUV = s * uv;
  
  vec2 iuv = floor(skewedUV);
  vec2 fuv = fract(skewedUV);
  
  // Barycentric weights
  vec3 w;
  w.x = 1.0 - max(fuv.x, fuv.y);
  w.z = min(fuv.x, fuv.y);
  w.y = 1.0 - w.x - w.z;
  
  // Triangle vertices
  vec2 v0 = iuv;
  vec2 v1 = v0 + (fuv.x > fuv.y ? vec2(1.0, 0.0) : vec2(0.0, 1.0));
  vec2 v2 = v0 + vec2(1.0, 1.0);
  
  vec4 col = vec4(0.0);
  vec2 vertices[3]; vertices[0] = v0; vertices[1] = v1; vertices[2] = v2;
  float weights[3]; weights[0] = w.x; weights[1] = w.y; weights[2] = w.z;
  
  for(int i=0; i<3; i++) {
    vec2 h = hash2(vertices[i]);
    
    // Pick tile (4 cols x 2 rows)
    float tileIdx = floor(h.x * 8.0);
    vec2 tilePos = vec2(mod(tileIdx, 4.0), 1.0 - floor(tileIdx / 4.0));
    
    // Random rotation/flip
    float ang = h.y * 6.28318;
    float cs = cos(ang), sn = sin(ang);
    mat2 rot = mat2(cs, -sn, sn, cs);
    
    // Offset and rotate within the tile
    vec2 offset = h * 10.0; // random offset to shift patterns
    vec2 localUV = fract((uv + offset) * rot);
    
    // Inset to avoid bleed
    localUV = 0.01 + localUV * 0.98;
    vec2 atlasUV = (tilePos + localUV) / vec2(4.0, 2.0);
    
    // Use textureGrad to maintain sharp mipmapping across stochastic jumps
    col += textureGrad(tex, atlasUV, dx / vec2(4.0, 2.0), dy / vec2(4.0, 2.0)) * weights[i];
  }
  
  return col;
}

vec4 textureMoonSeamless(sampler2D tex, vec2 uv) {
  // Precompute derivatives for textureGrad
  vec2 dx = dFdx(uv);
  vec2 dy = dFdy(uv);
  
  // Layer 1: Base high-detail layer
  vec4 base = sampleStochasticLayer(tex, uv, dx, dy);
  
  // Layer 2: Macro-layer at different scale and rotation to break up patterns
  vec2 uvMacro = uv * 0.371 + vec2(15.7, 12.3);
  vec4 macro = sampleStochasticLayer(tex, uvMacro, dx * 0.371, dy * 0.371);
  
  // Mix layers based on a large noise
  float noise = fract(sin(dot(uv * 0.03, vec2(12.9898, 78.233))) * 43758.5453);
  vec4 mixed = mix(base, macro, 0.3 + 0.4 * noise);
  
  // Final subtle color grading for moon look
  mixed.rgb *= 1.05; // Slightly boost brightness
  
  return mixed;
}
`;

function applyMoonSeamlessShader(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = GROUND_SHADER_GLSL + '\n' + shader.fragmentShader;
  
  // Replace the entire map_fragment include which is where Three.js 
  // normally samples the map. This is much more reliable than regex 
  // on raw texture calls.
  shader.fragmentShader = shader.fragmentShader.replace(
    '#include <map_fragment>',
    `
    #ifdef USE_MAP
      diffuseColor *= textureMoonSeamless( map, vMapUv );
    #endif
    `
  );
}

export const MoonTerrain = () => {
  const [rawA, rawB] = useTexture([
    '/moon_texture.png',
    '/moon-texture2.png',
  ]);

  const groundTexture = useMemo(() => {
    const canvas = buildGroundAtlas(
      rawA.image as HTMLImageElement,
      rawB.image as HTMLImageElement,
    );
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = true;
    t.repeat.set(TILE_REPEAT, TILE_REPEAT);
    return t;
  }, [rawA, rawB]);

  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 0.9,
      metalness: 0.0,
      color: '#c8cdd0',
    });
    mat.onBeforeCompile = applyMoonSeamlessShader;
    mat.customProgramCacheKey = () => 'moon-seamless-force-v12';
    return mat;
  }, [groundTexture]);

  const { geometry, rocks } = useMemo(() => buildMoonTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow material={groundMaterial} />

      <Instances range={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial map={rawB} roughness={1} metalness={0.0} color="#909090" />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} />
        ))}
      </Instances>
    </group>
  );
};

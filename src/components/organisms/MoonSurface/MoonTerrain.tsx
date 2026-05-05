import { useMemo } from 'react';
import { useTexture, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { buildMoonTerrainGeometryAndRocks } from './terrainUtils';

const STOCHASTIC_GLSL = /* glsl */ `
vec2 stochasticHash(vec2 p) {
  return fract(sin(vec2(
    dot(p, vec2(127.1, 311.7)),
    dot(p, vec2(269.5, 183.3))
  )) * 43758.5453);
}

vec4 textureNoTile(sampler2D tex, vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  vec4 col = vec4(0.0);
  float wsum = 0.0;
  for (int x = 0; x <= 1; x++) {
    for (int y = 0; y <= 1; y++) {
      vec2 cell = i + vec2(float(x), float(y));
      vec2 h = stochasticHash(cell);
      float ang = h.x * 6.28318;
      float cs = cos(ang), sn = sin(ang);
      vec2 d = f - vec2(float(x), float(y));
      vec2 rotD = vec2(cs * d.x - sn * d.y, sn * d.x + cs * d.y);
      float w = (1.0 - abs(d.x)) * (1.0 - abs(d.y));
      col += texture2D(tex, cell + h * 0.7 + rotD) * w;
      wsum += w;
    }
  }
  return col / wsum;
}
`;

function applyStochasticTiling(shader: THREE.WebGLProgramParametersWithUniforms) {
  shader.fragmentShader = STOCHASTIC_GLSL + shader.fragmentShader;
  shader.fragmentShader = shader.fragmentShader.replace(
    'texture2D( map, vMapUv )',
    'textureNoTile( map, vMapUv )',
  );
}

export const MoonTerrain = () => {
  const rawGroundTexture = useTexture('/textures/moon/diffuse.webp');

  const groundTexture = useMemo(() => {
    const texture = rawGroundTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(30, 30);
    texture.needsUpdate = true;
    return texture;
  }, [rawGroundTexture]);

  const rockTexture = useMemo(() => {
    const texture = rawGroundTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);
    texture.needsUpdate = true;
    return texture;
  }, [rawGroundTexture]);

  const groundMaterial = useMemo(() => {
    const mat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      roughness: 1,
      metalness: 0.0,
      color: '#888ea0',
    });
    mat.onBeforeCompile = applyStochasticTiling;
    mat.customProgramCacheKey = () => 'moon-stochastic-ground';
    return mat;
  }, [groundTexture]);

  const { geometry, rocks } = useMemo(() => buildMoonTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow material={groundMaterial} />

      <Instances range={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial map={rockTexture} roughness={1} metalness={0.0} color="#606470" />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} />
        ))}
      </Instances>
    </group>
  );
};

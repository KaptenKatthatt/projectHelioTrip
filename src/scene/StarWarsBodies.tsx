import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { RepeatWrapping, Vector3 } from 'three';
import { STAR_WARS_SYSTEMS, type StarWarsBodyId } from '../lib/starWarsSystems';
import {
  configureColorMap,
  configureDataMap,
} from '../lib/textures';
import { getStarWarsSurfaceTextures } from '../lib/starWarsTextures';
import { useStore } from '../store/useStore';

const GEOMETRY_ARGS: [number, number, number] = [1, 48, 36];

type StarWarsRenderBody = {
  id: StarWarsBodyId;
  color: string;
  radius: number;
  position: Vector3;
  rotation: readonly [number, number, number];
};

type MaterialPreset = {
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
  baseColor: string;
};

const getMaterialPreset = (id: StarWarsBodyId): MaterialPreset => {
  if (id === 'death-star') {
    return {
      emissiveIntensity: 0.1,
      roughness: 0.31,
      metalness: 0.78,
      baseColor: '#e3e8ef',
    };
  }
  if (id === 'alderaan') {
    return {
      emissiveIntensity: 0.04,
      roughness: 0.88,
      metalness: 0.04,
      baseColor: '#ffffff',
    };
  }
  if (id === 'mustafar') {
    return {
      emissiveIntensity: 0.34,
      roughness: 0.82,
      metalness: 0.08,
      baseColor: '#ff8b62',
    };
  }
  return {
    emissiveIntensity: 0.12,
    roughness: 0.8,
    metalness: 0.05,
    baseColor: '#ffffff',
  };
};

export const StarWarsBodies = () => {
  const selectedStarWarsBody = useStore((s) => s.selectedStarWarsBody);

  const bodies = useMemo<readonly StarWarsRenderBody[]>(
    () =>
      STAR_WARS_SYSTEMS.flatMap((system) =>
        system.bodies.map((body) => ({
          id: body.id,
          color: body.color,
          radius: body.radius,
          position: new Vector3(...body.position),
          rotation:
            body.id === 'death-star'
              ? ([0, 0.32, 0] as const)
              : ([0, 0, 0] as const),
        })),
      ),
    [],
  );

  const textureDefs = useMemo(
    () =>
      bodies.map((body) => {
        const textures = getStarWarsSurfaceTextures(body.id);
        return textures?.enabled ? textures : undefined;
      }),
    [bodies],
  );
  const diffuseUrls = useMemo(
    () => textureDefs.map((entry) => entry?.diffuse).filter((u): u is string => !!u),
    [textureDefs],
  );
  const normalUrls = useMemo(
    () => textureDefs.map((entry) => entry?.normal).filter((u): u is string => !!u),
    [textureDefs],
  );
  const roughnessUrls = useMemo(
    () => textureDefs.map((entry) => entry?.roughness).filter((u): u is string => !!u),
    [textureDefs],
  );

  const diffuseMaps = useTexture(diffuseUrls, configureColorMap);
  const normalMaps = useTexture(normalUrls, configureDataMap);
  const roughnessMaps = useTexture(roughnessUrls, configureDataMap);

  const diffuseMapByUrl = useMemo(
    () => new Map(diffuseUrls.map((url, i) => [url, diffuseMaps[i]] as const)),
    [diffuseMaps, diffuseUrls],
  );
  const normalMapByUrl = useMemo(
    () => new Map(normalUrls.map((url, i) => [url, normalMaps[i]] as const)),
    [normalMaps, normalUrls],
  );
  const roughnessMapByUrl = useMemo(
    () => new Map(roughnessUrls.map((url, i) => [url, roughnessMaps[i]] as const)),
    [roughnessMaps, roughnessUrls],
  );
  const diffuseMapByBody = useMemo(() => {
    const map = new Map<StarWarsBodyId, ReturnType<typeof diffuseMapByUrl.get>>();
    for (let i = 0; i < bodies.length; i += 1) {
      const body = bodies[i];
      if (!body) continue;
      const tex = textureDefs[i];
      if (!tex?.diffuse) continue;
      const diffuse = diffuseMapByUrl.get(tex.diffuse);
      if (!diffuse) continue;
      if (body.id === 'death-star') {
        diffuse.wrapS = RepeatWrapping;
        diffuse.wrapT = RepeatWrapping;
        diffuse.repeat.x = 1;
        diffuse.repeat.y = 1;
        diffuse.offset.x = 0.34;
        diffuse.offset.y = 0.08;
      }
      map.set(body.id, diffuse);
    }
    return map;
  }, [bodies, textureDefs, diffuseMapByUrl]);

  return (
    <group>
      {bodies.map((body, i) => {
        const isActive = selectedStarWarsBody === body.id;
        const material = getMaterialPreset(body.id);
        const tex = textureDefs[i];
        const diffuseMap = diffuseMapByBody.get(body.id);
        const normalMap = tex?.normal ? normalMapByUrl.get(tex.normal) : undefined;
        const roughnessMap = tex?.roughness
          ? roughnessMapByUrl.get(tex.roughness)
          : undefined;
        return (
          <group key={body.id} position={body.position}>
            <mesh scale={body.radius} rotation={body.rotation}>
              <sphereGeometry args={GEOMETRY_ARGS} />
              <meshStandardMaterial
                map={diffuseMap}
                normalMap={normalMap}
                roughnessMap={roughnessMap}
                color={material.baseColor}
                emissive={body.id === 'death-star' ? '#404754' : body.color}
                emissiveIntensity={
                  isActive
                    ? material.emissiveIntensity + 0.12
                    : material.emissiveIntensity
                }
                roughness={material.roughness}
                metalness={material.metalness}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

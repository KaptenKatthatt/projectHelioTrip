import { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import { Vector3 } from 'three';
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
};

type MaterialPreset = {
  emissiveIntensity: number;
  roughness: number;
  metalness: number;
};

const getMaterialPreset = (id: StarWarsBodyId): MaterialPreset => {
  if (id === 'death-star') {
    return {
      emissiveIntensity: 0.1,
      roughness: 0.45,
      metalness: 0.65,
    };
  }
  if (id === 'mustafar') {
    return {
      emissiveIntensity: 0.34,
      roughness: 0.82,
      metalness: 0.08,
    };
  }
  return {
    emissiveIntensity: 0.18,
    roughness: 0.8,
    metalness: 0.05,
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
        })),
      ),
    [],
  );

  const textureDefs = useMemo(
    () => bodies.map((body) => getStarWarsSurfaceTextures(body.id)),
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

  return (
    <group>
      {bodies.map((body, i) => {
        const isActive = selectedStarWarsBody === body.id;
        const material = getMaterialPreset(body.id);
        const tex = textureDefs[i];
        const diffuseMap = tex?.diffuse ? diffuseMapByUrl.get(tex.diffuse) : undefined;
        const normalMap = tex?.normal ? normalMapByUrl.get(tex.normal) : undefined;
        const roughnessMap = tex?.roughness
          ? roughnessMapByUrl.get(tex.roughness)
          : undefined;
        return (
          <group key={body.id} position={body.position}>
            <mesh scale={body.radius}>
              <sphereGeometry args={GEOMETRY_ARGS} />
              <meshStandardMaterial
                map={diffuseMap}
                normalMap={normalMap}
                roughnessMap={roughnessMap}
                color={body.color}
                emissive={body.color}
                emissiveIntensity={
                  isActive
                    ? material.emissiveIntensity + 0.22
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

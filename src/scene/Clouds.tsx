import { useTexture } from '@react-three/drei/core/Texture';
import type { PlanetId } from '../lib/planets';
import { getGraphicsPreset } from '../lib/graphicsTier';
import { configureColorMap, getCloudTextures } from '../lib/textures';

type Props = {
  planetId: PlanetId;
  radius: number;
};

const CLOUD_SCALE_FACTOR = 1.012;
const CLOUD_OPACITY = 0.45;
const CLOUD_SPHERE = getGraphicsPreset().cloudSphere;
const GEOMETRY_ARGS: [number, number, number] = [
  1,
  CLOUD_SPHERE[0],
  CLOUD_SPHERE[1],
];

export const Clouds = ({ planetId, radius }: Props) => {
  const textures = getCloudTextures(planetId);
  if (!textures) return null;

  return <CloudLayer url={textures.diffuse} radius={radius} />;
};

const CloudLayer = ({ url, radius }: { url: string; radius: number }) => {
  const map = useTexture(url, configureColorMap);

  return (
    <mesh scale={radius * CLOUD_SCALE_FACTOR}>
      <sphereGeometry args={GEOMETRY_ARGS} />
      <meshStandardMaterial
        map={map}
        transparent
        opacity={CLOUD_OPACITY}
        depthWrite={false}
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
};

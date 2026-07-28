import { useMemo } from 'react';
import { useTexture } from '@react-three/drei/core/Texture';
import type { PlanetId } from '../lib/planets';
import { useQualityPreset } from '../hooks/useQualityPreset';
import { configureColorMap, getCloudTextures } from '../lib/textures';

type Props = {
  planetId: PlanetId;
  radius: number;
};

const CLOUD_SCALE_FACTOR = 1.012;
const CLOUD_OPACITY = 0.45;

/** Read per render so a quality change reaches the geometry. */
const useCloudSphereArgs = (): [number, number, number] => {
  const segments = useQualityPreset((preset) => preset.cloudSphere);
  return useMemo(() => [1, segments[0], segments[1]], [segments]);
};

export const Clouds = ({ planetId, radius }: Props) => {
  const cloudsEnabled = useQualityPreset((preset) => preset.cloudsEnabled);
  const textures = getCloudTextures(planetId);
  if (!textures || !cloudsEnabled) return null;

  return <CloudLayer url={textures.diffuse} radius={radius} />;
};

const CloudLayer = ({ url, radius }: { url: string; radius: number }) => {
  const map = useTexture(url, configureColorMap);
  const sphereArgs = useCloudSphereArgs();

  return (
    <mesh scale={radius * CLOUD_SCALE_FACTOR}>
      <sphereGeometry args={sphereArgs} />
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

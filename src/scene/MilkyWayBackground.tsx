import { useMemo, type ReactElement } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BackSide, Color, SRGBColorSpace } from "three";

/** 8192×4096 — fine on desktop; exceeds `maxTextureSize` on many mobile GPUs. */
const TEXTURE_PATH_8K = "/textures/milky-way-8k.jpg";
/** 2048×1024 — safe fallback when the device cannot sample 8K textures. */
const TEXTURE_PATH_FALLBACK = "/textures/galaxy/2k_stars_milky_way.jpg";

useTexture.preload(TEXTURE_PATH_8K);
useTexture.preload(TEXTURE_PATH_FALLBACK);

type MilkyWayMeshProps = {
  readonly texturePath: string;
};

const MilkyWayMesh = ({ texturePath }: MilkyWayMeshProps): ReactElement => {
  const texture = useTexture(texturePath, (loadedTexture) => {
    loadedTexture.colorSpace = SRGBColorSpace;
  });

  const tint = useMemo(() => new Color("#d7deff"), []);

  return (
    <mesh rotation={[0.02, Math.PI * 0.64, 0]} renderOrder={-20}>
      <sphereGeometry args={[3200, 64, 64]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        transparent
        opacity={0.72}
        color={tint}
        toneMapped={false}
        depthWrite={false}
        fog={false}
      />
    </mesh>
  );
};

export const MilkyWayBackground = (): ReactElement => {
  const maxTextureSize = useThree((s) => s.gl.capabilities.maxTextureSize);
  const texturePath =
    maxTextureSize >= 8192 ? TEXTURE_PATH_8K : TEXTURE_PATH_FALLBACK;

  return <MilkyWayMesh key={texturePath} texturePath={texturePath} />;
};

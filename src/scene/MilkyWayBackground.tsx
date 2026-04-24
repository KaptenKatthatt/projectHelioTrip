import { useMemo, type ReactElement } from "react";
import { useTexture } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { BackSide, Color, SRGBColorSpace } from "three";

/** 7680×4320; kräver `maxTextureSize` ≥ 7680. Fil i `public/`, inte gitignored `public/textures/`. */
const TEXTURE_PATH_HIGH = "/8k-milky-way-stars-in-night-sky-video.jpg";
/** 3920×1960; passar `maxTextureSize` 4096 (typisk mobil). */
const TEXTURE_PATH_STANDARD = "/milkyWay-texture.jpg";

useTexture.preload(TEXTURE_PATH_HIGH);
useTexture.preload(TEXTURE_PATH_STANDARD);

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
    maxTextureSize >= 7680 ? TEXTURE_PATH_HIGH : TEXTURE_PATH_STANDARD;

  return <MilkyWayMesh key={texturePath} texturePath={texturePath} />;
};

import { useMemo, type ReactElement } from "react";
import { useTexture } from "@react-three/drei";
import { BackSide, Color, SRGBColorSpace } from "three";

const TEXTURE_PATH = "/textures/milky-way-8k.jpg";

useTexture.preload(TEXTURE_PATH);

export const MilkyWayBackground = (): ReactElement => {
  const texture = useTexture(TEXTURE_PATH, (loadedTexture) => {
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

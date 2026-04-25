import { useMemo, type ReactElement } from "react";
import { useTexture } from "@react-three/drei/core/Texture";
import { useThree } from "@react-three/fiber";
import { AdditiveBlending, BackSide, Color, SRGBColorSpace } from "three";
import { getGraphicsPreset, getGraphicsTier } from "../lib/graphicsTier";

/** 7680×4320; kräver `maxTextureSize` ≥ 7680. Fil i `public/`, inte gitignored `public/textures/`. */
const TEXTURE_PATH_HIGH = "/8k-milky-way-stars-in-night-sky-video.jpg";
/** 3920×1960; passar `maxTextureSize` 4096 (typisk mobil). */
const TEXTURE_PATH_STANDARD = "/milkyWay-texture.jpg";
const MILKY_WAY_ROTATION: [number, number, number] = [0.02, Math.PI * 0.64, 0];

type MilkyWayMeshProps = {
  readonly texturePath: string;
};

const MilkyWayMesh = ({ texturePath }: MilkyWayMeshProps): ReactElement => {
  const texture = useTexture(texturePath, (loadedTexture) => {
    loadedTexture.colorSpace = SRGBColorSpace;
  });

  const tint = useMemo(() => new Color("#d7deff"), []);

  const [mwW, mwH] = getGraphicsPreset().milkyWaySphere;
  return (
    <mesh rotation={MILKY_WAY_ROTATION} renderOrder={-20}>
      <sphereGeometry args={[3200, mwW, mwH]} />
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

const STAR_OVERLAY_RADIUS_BASE = 3192;
const STAR_OVERLAY_RADIUS_JITTER = 14;
const STAR_BAND_BIAS_CHANCE = 0.74;
const STAR_BAND_HALF_HEIGHT = 0.18;

const MilkyWayStarOverlay = (): ReactElement => {
  const preset = getGraphicsPreset();
  const graphicsTier = getGraphicsTier();
  const starCount = Math.max(450, Math.round(preset.starsCount * 0.22));
  const starOpacity = graphicsTier === "low" ? 0.28 : 0.34;

  const positions = useMemo(() => {
    const values = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const index = i * 3;
      const isBandStar = Math.random() < STAR_BAND_BIAS_CHANCE;
      const u = isBandStar
        ? (Math.random() * 2 - 1) * STAR_BAND_HALF_HEIGHT
        : Math.random() * 2 - 1;
      const theta = Math.random() * Math.PI * 2;
      const ringBias = 0.35 + Math.random() * 0.65;
      const radius =
        STAR_OVERLAY_RADIUS_BASE +
        (Math.random() * 2 - 1) * STAR_OVERLAY_RADIUS_JITTER * ringBias;

      const xy = Math.sqrt(1 - u * u);
      values[index] = radius * xy * Math.cos(theta);
      values[index + 1] = radius * u;
      values[index + 2] = radius * xy * Math.sin(theta);
    }

    return values;
  }, [starCount]);

  return (
    <points renderOrder={-14} rotation={MILKY_WAY_ROTATION}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#f3f6ff"
        size={1.12}
        sizeAttenuation={false}
        transparent
        opacity={starOpacity}
        depthWrite={false}
        toneMapped={false}
        blending={AdditiveBlending}
      />
    </points>
  );
};

export const MilkyWayBackground = (): ReactElement => {
  const maxTextureSize = useThree((s) => s.gl.capabilities.maxTextureSize);
  const texturePath =
    maxTextureSize >= 7680 ? TEXTURE_PATH_HIGH : TEXTURE_PATH_STANDARD;

  return (
    <group>
      <MilkyWayMesh key={texturePath} texturePath={texturePath} />
      <MilkyWayStarOverlay />
    </group>
  );
};

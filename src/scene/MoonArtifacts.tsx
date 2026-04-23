import { useMemo } from 'react';
import {
  CanvasTexture,
  CylinderGeometry,
  DoubleSide,
  Euler,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type Texture,
} from 'three';

type Props = {
  moonRadius: number;
};

const DEG2RAD = Math.PI / 180;

/**
 * Tidally locked moon → artifacts sit on the Earth-facing hemisphere.
 * Coordinates are the real selenographic lat/lon; the texture on the
 * moon sphere isn't necessarily aligned to these, but the sites end up
 * close enough to the equator and near-side to look plausible.
 */
const APOLLO_11: Site = {
  latitudeDeg: 0.67,
  longitudeDeg: 23.47,
  hasRover: false,
};

const APOLLO_17: Site = {
  latitudeDeg: 20.19,
  longitudeDeg: 30.77,
  hasRover: true,
};

type Site = {
  latitudeDeg: number;
  longitudeDeg: number;
  hasRover: boolean;
};

/**
 * Objects are drawn ~30 000× larger than reality so they're actually
 * visible next to a moon that is 1 737 km in the real world but only
 * 0.27 scene units across. Everything below is expressed relative to
 * moon radius so the site keeps a consistent visual footprint
 * regardless of future scale changes.
 */
const SITE_SCALE_RELATIVE_TO_RADIUS = 0.18;

export const MoonArtifacts = ({ moonRadius }: Props) => {
  const flagTexture = useFlagTexture();
  const siteScale = moonRadius * SITE_SCALE_RELATIVE_TO_RADIUS;

  return (
    <>
      <SurfaceAnchor site={APOLLO_11} moonRadius={moonRadius} scale={siteScale}>
        <LunarLander />
        <group position={[1.1, 0, 0.3]}>
          <AmericanFlag texture={flagTexture} />
        </group>
        <FootprintTrail />
      </SurfaceAnchor>

      <SurfaceAnchor site={APOLLO_17} moonRadius={moonRadius} scale={siteScale}>
        <LunarLander />
        <group position={[1.1, 0, 0.35]}>
          <AmericanFlag texture={flagTexture} />
        </group>
        <group position={[-1.3, 0, 0.6]} rotation={[0, 0.6, 0]}>
          <LunarRover />
        </group>
        <FootprintTrail />
      </SurfaceAnchor>
    </>
  );
};

const SurfaceAnchor = ({
  site,
  moonRadius,
  scale,
  children,
}: {
  site: Site;
  moonRadius: number;
  scale: number;
  children: React.ReactNode;
}) => {
  const { position, quaternion } = useMemo(() => {
    const lat = site.latitudeDeg * DEG2RAD;
    const lon = site.longitudeDeg * DEG2RAD;
    const outward = new Vector3(
      Math.cos(lat) * Math.sin(lon),
      Math.sin(lat),
      Math.cos(lat) * Math.cos(lon),
    );
    const pos = outward.clone().multiplyScalar(moonRadius);
    const quat = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      outward,
    );
    return { position: pos, quaternion: quat };
  }, [site, moonRadius]);

  return (
    <group position={position} quaternion={quaternion} scale={scale}>
      {children}
    </group>
  );
};

/**
 * Apollo LM descent stage — what's actually still on the moon. The
 * ascent stage took off in 1969 and the crew jettisoned it in lunar
 * orbit, so the remaining hardware is the octagonal base with legs,
 * engine bell, and gold-foil-wrapped thermal blanketing.
 */
const LunarLander = () => {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.12, 8]} />
        <meshStandardMaterial
          color="#d4a857"
          roughness={0.45}
          metalness={0.75}
          emissive="#3a2a10"
          emissiveIntensity={0.2}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, 0.135, 0]}>
        <cylinderGeometry args={[0.17, 0.19, 0.04, 8]} />
        <meshStandardMaterial
          color="#1a1a1c"
          roughness={0.85}
          metalness={0.2}
        />
      </mesh>

      <mesh castShadow receiveShadow position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.05, 0.1, 0.08, 12]} />
        <meshStandardMaterial color="#2a2420" roughness={0.8} metalness={0.5} />
      </mesh>

      <LanderLegs />
    </group>
  );
};

const LanderLegs = () => {
  const legs = useMemo(() => {
    const out: Array<{ x: number; z: number; angle: number }> = [];
    for (let i = 0; i < 4; i += 1) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      out.push({ x: Math.cos(angle), z: Math.sin(angle), angle });
    }
    return out;
  }, []);

  return (
    <>
      {legs.map(({ x, z, angle }, i) => (
        <group key={i} rotation={[0, -angle, 0]}>
          <mesh
            castShadow
            position={[0.18, 0.02, 0]}
            rotation={[0, 0, -Math.PI / 2.6]}
          >
            <cylinderGeometry args={[0.015, 0.015, 0.32, 6]} />
            <meshStandardMaterial
              color="#b0b0b0"
              roughness={0.4}
              metalness={0.8}
            />
          </mesh>
          <mesh receiveShadow position={[0.3 * x, -0.04, 0.3 * z]}>
            <cylinderGeometry args={[0.05, 0.05, 0.01, 10]} />
            <meshStandardMaterial
              color="#c8c0a8"
              roughness={0.85}
              metalness={0.1}
            />
          </mesh>
        </group>
      ))}
    </>
  );
};

const AmericanFlag = ({ texture }: { texture: Texture }) => {
  return (
    <group>
      <mesh castShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.36, 8]} />
        <meshStandardMaterial
          color="#d8d8d8"
          roughness={0.35}
          metalness={0.9}
        />
      </mesh>

      <mesh
        castShadow
        position={[0.13, 0.32, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.008, 0.008, 0.26, 8]} />
        <meshStandardMaterial
          color="#d8d8d8"
          roughness={0.35}
          metalness={0.9}
        />
      </mesh>

      <mesh position={[0.14, 0.265, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.18, 0.11]} />
        <meshStandardMaterial
          map={texture}
          side={DoubleSide}
          roughness={0.85}
          metalness={0}
        />
      </mesh>
    </group>
  );
};

/**
 * Lunar Roving Vehicle — Apollo 15/16/17. Stylized but recognizable:
 * open chassis, four wire-mesh wheels, two seats, and the dish
 * high-gain antenna that was used to beam TV back to Earth.
 */
const LunarRover = () => {
  return (
    <group position={[0, 0.06, 0]}>
      <mesh castShadow receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.22]} />
        <meshStandardMaterial color="#5a5a5e" roughness={0.6} metalness={0.5} />
      </mesh>

      <RoverWheels />

      <mesh castShadow position={[-0.05, 0.08, -0.06]}>
        <boxGeometry args={[0.09, 0.08, 0.08]} />
        <meshStandardMaterial color="#2a2a2d" roughness={0.8} metalness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.05, 0.08, 0.06]}>
        <boxGeometry args={[0.09, 0.08, 0.08]} />
        <meshStandardMaterial color="#2a2a2d" roughness={0.8} metalness={0.2} />
      </mesh>

      <mesh
        castShadow
        position={[0.15, 0.15, 0]}
        rotation={[Math.PI / 2.4, 0, 0]}
      >
        <cylinderGeometry args={[0.09, 0.09, 0.005, 16]} />
        <meshStandardMaterial
          color="#f0efe8"
          roughness={0.5}
          metalness={0.2}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0.15, 0.08, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.14, 6]} />
        <meshStandardMaterial
          color="#c0c0c0"
          roughness={0.4}
          metalness={0.9}
        />
      </mesh>

      <mesh castShadow position={[0.19, 0.05, 0]}>
        <boxGeometry args={[0.06, 0.04, 0.18]} />
        <meshStandardMaterial color="#8a8a8c" roughness={0.7} metalness={0.3} />
      </mesh>
    </group>
  );
};

const WHEEL_GEOMETRY_ARGS: ConstructorParameters<typeof CylinderGeometry> = [
  0.06,
  0.06,
  0.04,
  12,
];

const RoverWheels = () => {
  const positions = useMemo(
    () =>
      [
        [0.16, -0.03, 0.11],
        [0.16, -0.03, -0.11],
        [-0.16, -0.03, 0.11],
        [-0.16, -0.03, -0.11],
      ] as const,
    [],
  );

  const wheelRotation = useMemo(() => new Euler(Math.PI / 2, 0, 0), []);

  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} castShadow position={p} rotation={wheelRotation}>
          <cylinderGeometry args={WHEEL_GEOMETRY_ARGS} />
          <meshStandardMaterial
            color="#1c1c1e"
            roughness={0.9}
            metalness={0.1}
          />
        </mesh>
      ))}
    </>
  );
};

/**
 * Subtle disk of disturbed regolith around the site. Without an
 * atmosphere, astronaut footprints and descent-engine scouring are
 * still visible today.
 */
const FootprintTrail = () => {
  return (
    <mesh receiveShadow position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.6, 32]} />
      <meshStandardMaterial
        color="#1b1b1c"
        roughness={1}
        metalness={0}
        transparent
        opacity={0.45}
        depthWrite={false}
      />
    </mesh>
  );
};

const useFlagTexture = (): Texture => {
  return useMemo(() => createFlagTexture(), []);
};

const createFlagTexture = (): CanvasTexture => {
  const width = 380;
  const height = 200;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable for flag texture');
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  const stripeHeight = height / 13;
  ctx.fillStyle = '#b22234';
  for (let i = 0; i < 13; i += 2) {
    ctx.fillRect(0, i * stripeHeight, width, stripeHeight);
  }

  const unionWidth = width * 0.4;
  const unionHeight = stripeHeight * 7;
  ctx.fillStyle = '#3c3b6e';
  ctx.fillRect(0, 0, unionWidth, unionHeight);

  ctx.fillStyle = '#ffffff';
  const rows = 9;
  const starsOnLongRow = 6;
  const starsOnShortRow = 5;
  const starRadius = Math.min(unionWidth / 30, unionHeight / 20);

  for (let row = 0; row < rows; row += 1) {
    const isLongRow = row % 2 === 0;
    const count = isLongRow ? starsOnLongRow : starsOnShortRow;
    const stepX = unionWidth / (starsOnLongRow + 1);
    const stepY = unionHeight / (rows + 1);
    const y = (row + 1) * stepY;
    const offsetX = isLongRow ? stepX : stepX * 1.5;
    for (let col = 0; col < count; col += 1) {
      const x = offsetX + col * stepX;
      ctx.beginPath();
      ctx.arc(x, y, starRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 8;
  texture.needsUpdate = true;
  return texture;
};

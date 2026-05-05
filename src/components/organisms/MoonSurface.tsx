import {
  useGLTF,
  OrbitControls,
  ContactShadows,
  useTexture,
  Instances,
  Instance,
} from '@react-three/drei';

import { Canvas, useThree, useFrame } from '@react-three/fiber';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import { X, Info } from 'lucide-react';

import { useStore } from '../../store/useStore';

import { useTranslation } from '../../hooks/useTranslation';

import * as THREE from 'three';

type MoonRockInstance = {
  position: [number, number, number];

  rotation: [number, number, number];

  scale: [number, number, number];
};

const terrainRng = (seed: number): (() => number) => {
  let state = seed >>> 0;

  return (): number => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;

    return state / 0xffff_ffff;
  };
};

export const buildMoonTerrainGeometryAndRocks = (): {
  geometry: THREE.PlaneGeometry;

  rocks: MoonRockInstance[];
} => {
  const rnd = terrainRng(0x4d6f6f6e); // "Moon" in ASCII hex

  const geo = new THREE.PlaneGeometry(300, 300, 64, 64);

  geo.rotateX(-Math.PI / 2);

  const positions = geo.attributes.position!.array as Float32Array;

  // Shallower noise than Mars — Tranquility Base is relatively flat

  const noise = (x: number, z: number): number =>
    Math.sin(x * 0.04) * Math.cos(z * 0.04) * 2.5 +
    Math.sin(x * 0.08) * Math.cos(z * 0.09) * 0.8 +
    Math.sin(x * 0.15 + z * 0.12) * 0.3;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] ?? 0;

    const z = positions[i + 2] ?? 0;

    const distFromCenter = Math.sqrt(x * x + z * z);

    const flattenFactor = Math.min(1, Math.max(0, (distFromCenter - 6) / 12));

    positions[i + 1] = noise(x, z) * flattenFactor - 0.05;
  }

  geo.computeVertexNormals();

  const rockData: MoonRockInstance[] = [];

  const count = 150;

  for (let i = 0; i < count; i++) {
    const rx = (rnd() - 0.5) * 200;

    const rz = (rnd() - 0.5) * 200;

    const dist = Math.sqrt(rx * rx + rz * rz);

    if (dist < 6) continue;

    const flattenFactor = Math.min(1, Math.max(0, (dist - 6) / 12));

    const ry = noise(rx, rz) * flattenFactor;

    // Moon rocks are smaller and flatter than Mars rocks

    const baseScale = rnd() * 1.2 + 0.3 + (dist > 50 ? rnd() * 2 : 0);

    rockData.push({
      position: [rx, ry - baseScale * 0.2, rz],

      rotation: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],

      scale: [
        baseScale * (0.5 + rnd() * 1.2),

        baseScale * (0.2 + rnd() * 0.5),

        baseScale * (0.5 + rnd() * 1.2),
      ],
    });
  }

  return { geometry: geo, rocks: rockData };
};

// --- CAMERA CONFIGURATION ---
// Adjust these values to control the landing animation
const CAMERA_SETTINGS = {
  // Initial position when the landing sequence starts
  FLY_IN_START: new THREE.Vector3(15, 60, 40),
  // Final position after landing (distance from the lunar module at [0,0,0])
  // Zoomed out slightly and adjusted to see Earth in the background
  FLY_IN_END: new THREE.Vector3(18, 8, 36),
  // Duration of the landing animation in milliseconds (controls "panning speed")
  FLY_IN_DURATION: 6500,
  // Delay before the landing animation starts
  FLY_IN_DELAY: 500,

  // Animation when leaving the Moon surface
  TAKE_OFF_DURATION: 3500,
  TAKE_OFF_HEIGHT_MIN: 40,
  TAKE_OFF_DISTANCE_MULT: 6,
};

const CameraZoomController = ({
  isFlyingIn,
  setIsFlyingIn,
}: {
  isFlyingIn: boolean;
  setIsFlyingIn: (v: boolean) => void;
}) => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const { camera } = useThree();
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const animStateRef = useRef<{ startPos: THREE.Vector3; startTime: number } | null>(null);

  useEffect(() => {
    targetPosRef.current = null;
    animStateRef.current = null;
  }, [moonTransitionState]);

  useFrame(() => {
    if (moonTransitionState === 'taking_off') {
      if (!targetPosRef.current) {
        targetPosRef.current = camera.position.clone().multiplyScalar(CAMERA_SETTINGS.TAKE_OFF_DISTANCE_MULT);
        targetPosRef.current.y = Math.max(targetPosRef.current.y, CAMERA_SETTINGS.TAKE_OFF_HEIGHT_MIN);
        animStateRef.current = { startPos: camera.position.clone(), startTime: performance.now() };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const elapsed = performance.now() - animStateRef.current.startTime;
      const progress = Math.min(elapsed / CAMERA_SETTINGS.TAKE_OFF_DURATION, 1.0);
      const easeIn = progress * progress * progress;

      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      camera.lookAt(0, 0, 0);
    } else if (isFlyingIn) {
      if (!targetPosRef.current) {
        targetPosRef.current = CAMERA_SETTINGS.FLY_IN_END;
        camera.position.copy(CAMERA_SETTINGS.FLY_IN_START);
        animStateRef.current = {
          startPos: CAMERA_SETTINGS.FLY_IN_START.clone(),
          startTime: performance.now() + CAMERA_SETTINGS.FLY_IN_DELAY,
        };
      }

      if (!animStateRef.current || !targetPosRef.current) return;

      const now = performance.now();
      if (now < animStateRef.current.startTime) {
        camera.position.copy(animStateRef.current.startPos);
      } else {
        const elapsed = now - animStateRef.current.startTime;
        const progress = Math.min(elapsed / CAMERA_SETTINGS.FLY_IN_DURATION, 1.0);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        camera.position.lerpVectors(
          animStateRef.current.startPos,
          targetPosRef.current,
          easeOutQuart,
        );

        if (progress >= 1.0) setIsFlyingIn(false);
      }

      camera.lookAt(0, 2, 0); // Look slightly above the ground to frame better
    } else {
      targetPosRef.current = null;
      animStateRef.current = null;
    }
  });

  return null;
};

const MoonTerrain = () => {
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

  const { geometry, rocks } = useMemo(() => buildMoonTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={groundTexture} roughness={1} metalness={0.0} color="#888ea0" />
      </mesh>

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

const StarField = () => {
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 200;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // upper hemisphere only
      const r = 380 + Math.random() * 20;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#c8d8ff" size={0.3} sizeAttenuation />
    </points>
  );
};

const EarthSphere = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [diffuse, normal, roughness] = useTexture([
    '/textures/earth/diffuse.webp',
    '/textures/earth/normal.webp',
    '/textures/earth/roughness.webp',
  ]);

  useFrame(() => {
    if (meshRef.current) meshRef.current.rotation.y += 0.001;
  });

  return (
    <group position={[-100, 45, -200]}>
      <mesh ref={meshRef} castShadow={false}>
        <sphereGeometry args={[12, 32, 32]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          roughnessMap={roughness}
          roughness={1}
          metalness={0}
          emissive="#112244"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Subtle blue fill light from Earth direction */}
      <pointLight color="#3060cc" intensity={1.5} distance={300} />
    </group>
  );
};

const LunarModule = () => {
  const { scene } = useGLTF('/Apollo%20Lunar%20Module.glb');

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={2.0} />
      <ContactShadows opacity={0.4} scale={14} blur={2} far={4} />
    </group>
  );
};

const MoonLandingScene = () => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const [isFlyingIn, setIsFlyingIn] = useState(true);

  const initialCameraPosition = isFlyingIn 
    ? CAMERA_SETTINGS.FLY_IN_START.toArray() 
    : CAMERA_SETTINGS.FLY_IN_END.toArray();

  return (
    <Canvas shadows camera={{ position: initialCameraPosition as [number, number, number], fov: 45 }}>
      <Suspense fallback={null}>
        <CameraZoomController isFlyingIn={isFlyingIn} setIsFlyingIn={setIsFlyingIn} />

        {/* No <Sky> — Moon has no atmosphere */}
        <color attach="background" args={['#000310']} />
        <ambientLight intensity={0.15} color="#0a0f2a" />
        <directionalLight
          position={[80, 60, 20]}
          intensity={3.0}
          color="#fff8f0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <StarField />
        <EarthSphere />
        <LunarModule />
        <MoonTerrain />

        {moonTransitionState !== 'taking_off' && !isFlyingIn && (
          <OrbitControls
            makeDefault
            minDistance={4}
            maxDistance={20}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        )}
      </Suspense>
    </Canvas>
  );
};

export const FactSlideshow = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % t.moonSurface.facts.length);
    }, 4000);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [t.moonSurface.facts.length]);

  const jumpTo = (idx: number) => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % t.moonSurface.facts.length);
    }, 4000);
    setCurrent(idx);
  };

  const fact = t.moonSurface.facts[current]!;
  const title = fact.title;
  const body = fact.body;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-blue-400/15 bg-black/60 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-blue-400">
        <Info className="h-4 w-4" aria-hidden />
        <span className="ds-eyebrow">{t.moonSurface.factLabel}</span>
      </div>

      <p className="mb-1 text-sm leading-snug font-semibold text-blue-100/90">{title}</p>
      <p className="text-xs leading-relaxed text-blue-100/70">{body}</p>

      <div className="mt-3 flex justify-center gap-1.5">
        {t.moonSurface.facts.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t.moonSurface.factAriaLabel(i + 1)}
            onClick={() => jumpTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              background: i === current ? 'rgba(160,180,255,0.85)' : 'rgba(160,180,255,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export const MoonSurface = () => {
  const { t } = useTranslation();

  const isLandedOnMoon = useStore((s) => s.isLandedOnMoon);

  const setIsLandedOnMoon = useStore((s) => s.setIsLandedOnMoon);

  const setMoonTransitionState = useStore((s) => s.setMoonTransitionState);

  if (!isLandedOnMoon) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-200 flex flex-col bg-[#000310]">
      {/* 3D Scene */}

      <div className="absolute inset-0">
        <MoonLandingScene />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="flex items-center justify-between p-6">
          <div className="pointer-events-auto flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-white uppercase">
              {t.moonSurface.title}
            </h2>

            <p className="text-sm font-medium text-blue-200/60">{t.moonSurface.subtitle}</p>
          </div>

          <button
            type="button"
            aria-label={t.moonSurface.closeAriaLabel}
            onClick={() => {
              setMoonTransitionState('taking_off');
              setIsLandedOnMoon(false);
              setTimeout(() => {
                setMoonTransitionState('idle');
              }, 500);
            }}
            className="pointer-events-auto rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </header>

        <div className="mt-auto flex items-end justify-between p-6">
          <FactSlideshow />

          <div className="pointer-events-auto flex flex-col gap-2">
            <p className="ds-eyebrow mb-1 text-right text-white/40">{t.moonSurface.mouseHint}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

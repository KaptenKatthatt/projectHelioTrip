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
        targetPosRef.current = camera.position.clone().multiplyScalar(6);
        targetPosRef.current.y = Math.max(targetPosRef.current.y, 40);
        animStateRef.current = { startPos: camera.position.clone(), startTime: performance.now() };
      }
      if (!animStateRef.current || !targetPosRef.current) return;
      const elapsed = performance.now() - animStateRef.current.startTime;
      const progress = Math.min(elapsed / 3500, 1.0);
      const easeIn = progress * progress * progress;
      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      camera.lookAt(0, 0, 0);
    } else if (isFlyingIn) {
      if (!targetPosRef.current) {
        targetPosRef.current = new THREE.Vector3(8, 3, 8);
        camera.position.set(15, 60, 40);
        animStateRef.current = {
          startPos: new THREE.Vector3(15, 60, 40),
          startTime: performance.now() + 500,
        };
      }
      if (!animStateRef.current || !targetPosRef.current) return;
      const now = performance.now();
      if (now < animStateRef.current.startTime) {
        camera.position.copy(animStateRef.current.startPos);
      } else {
        const elapsed = now - animStateRef.current.startTime;
        const progress = Math.min(elapsed / 6500, 1.0);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        camera.position.lerpVectors(
          animStateRef.current.startPos,
          targetPosRef.current,
          easeOutQuart,
        );
        if (progress >= 1.0) setIsFlyingIn(false);
      }
      camera.lookAt(0, 0, 0);
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
    <group position={[-60, 80, -120]}>
      <mesh ref={meshRef} castShadow={false}>
        <sphereGeometry args={[8, 32, 32]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          roughnessMap={roughness}
          roughness={1}
          metalness={0}
        />
      </mesh>
      {/* Subtle blue fill light from Earth direction */}
      <pointLight color="#3060cc" intensity={0.4} distance={300} />
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
  const initialCameraPosition: [number, number, number] = isFlyingIn ? [15, 60, 40] : [8, 3, 8];

  return (
    <Canvas shadows camera={{ position: initialCameraPosition, fov: 45 }}>
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

type MoonFact = {
  title: { sv: string; en: string };
  body: { sv: string; en: string };
};

export const MOON_FACTS: MoonFact[] = [
  {
    title: {
      sv: 'Neil Armstrongs första steg',
      en: "Neil Armstrong's first step",
    },
    body: {
      sv: 'Den 21 juli 1969 klev Neil Armstrong ut ur landaren kl. 02:56 UTC och satte mänsklighetens första fot på månen.',
      en: "On 21 July 1969 at 02:56 UTC Neil Armstrong stepped out of the lander and placed humanity's first footprint on the Moon.",
    },
  },
  {
    title: { sv: '"Ett litet steg…"', en: '"One small step…"' },
    body: {
      sv: "\"That's one small step for man, one giant leap for mankind\" — citatet sändes live till uppskattningsvis 600 miljoner TV-tittare.",
      en: "\"That's one small step for man, one giant leap for mankind\" — broadcast live to an estimated 600 million television viewers.",
    },
  },
  {
    title: { sv: 'Tranquility Base', en: 'Tranquility Base' },
    body: {
      sv: 'Apollo 11 landade i Mare Tranquillitatis — ett relativt flackt och stenfattigt område valt för säkerhetens skull.',
      en: 'Apollo 11 landed in Mare Tranquillitatis (Sea of Tranquility) — a relatively flat, rock-free area chosen for safety.',
    },
  },
  {
    title: { sv: '21 timmar på ytan', en: '21 hours on the surface' },
    body: {
      sv: 'Astronauterna tillbringade 21 timmar och 36 minuter på månens yta, varav 2,5 timmar utanför landaren i rymddräkt (EVA).',
      en: 'The crew spent 21 hours and 36 minutes on the lunar surface, including 2.5 hours outside the lander in spacesuits (EVA).',
    },
  },
  {
    title: { sv: '21,5 kg månsten', en: '21.5 kg of Moon rock' },
    body: {
      sv: 'Armstrong och Aldrin samlade in 21,5 kg bergarter och månstoft — prover som forskare fortfarande analyserar idag.',
      en: 'Armstrong and Aldrin collected 21.5 kg of rocks and lunar soil — samples that scientists are still analysing today.',
    },
  },
];

const ProgressBar = ({ resetKey }: { resetKey: number }) => {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(false);
    const t = setTimeout(() => setActive(true), 20);
    return () => clearTimeout(t);
  }, [resetKey]);

  return (
    <div className="mt-2.5 h-0.5 rounded-full bg-white/5 overflow-hidden">
      <div
        className="h-full rounded-full bg-blue-400/50"
        style={{
          width: active ? '100%' : '0%',
          transition: active ? 'width 4s linear' : 'none',
        }}
      />
    </div>
  );
};

export const FactSlideshow = () => {
  const [current, setCurrent] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const locale = useStore((s) => s.locale);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = () => {
    if (intervalRef.current !== null) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % MOON_FACTS.length);
      setResetKey((k) => k + 1);
    }, 4000);
  };

  useEffect(() => {
    startInterval();
    return () => {
      if (intervalRef.current !== null) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jumpTo = (idx: number) => {
    setCurrent(idx);
    setResetKey((k) => k + 1);
    startInterval();
  };

  const fact = MOON_FACTS[current]!;
  const title = locale === 'sv' ? fact.title.sv : fact.title.en;
  const body = locale === 'sv' ? fact.body.sv : fact.body.en;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-blue-400/15 bg-black/60 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-blue-400">
        <Info className="h-4 w-4" aria-hidden />
        <span className="ds-eyebrow">Apollo 11 · 1969</span>
      </div>
      <p className="text-sm font-semibold text-blue-100/90 mb-1 leading-snug">{title}</p>
      <p className="text-xs leading-relaxed text-blue-100/70">{body}</p>
      <div className="flex justify-center gap-1.5 mt-3">
        {MOON_FACTS.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Fakta ${i + 1}`}
            onClick={() => jumpTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              background:
                i === current
                  ? 'rgba(160,180,255,0.85)'
                  : 'rgba(160,180,255,0.25)',
            }}
          />
        ))}
      </div>
      <ProgressBar resetKey={resetKey} />
    </div>
  );
};

import {
  useGLTF,
  OrbitControls,
  ContactShadows,
  useTexture,
  Sky,
  Instances,
  Instance,
} from '@react-three/drei';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { X, Info } from 'lucide-react';
import { useStore } from '../../store/useStore';
import * as THREE from 'three';

type MarsRockInstance = {
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

const buildMarsTerrainGeometryAndRocks = (): {
  geometry: THREE.PlaneGeometry;
  rocks: MarsRockInstance[];
} => {
  const rnd = terrainRng(0x4d61_7273);
  const geo = new THREE.PlaneGeometry(300, 300, 64, 64);
  geo.rotateX(-Math.PI / 2);

  const positions = geo.attributes.position!.array as Float32Array;

  const noise = (x: number, z: number): number =>
    Math.sin(x * 0.05) * Math.cos(z * 0.05) * 5 +
    Math.sin(x * 0.1) * Math.cos(z * 0.1) * 2 +
    Math.sin(x * 0.2 + z * 0.1) * 0.5;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i] ?? 0;
    const z = positions[i + 2] ?? 0;
    const distFromCenter = Math.sqrt(x * x + z * z);
    const flattenFactor = Math.min(1, Math.max(0, (distFromCenter - 5) / 15));
    let y = noise(x, z);
    if (distFromCenter > 80 && distFromCenter < 120) {
      y += Math.sin(((distFromCenter - 80) / 40) * Math.PI) * 12;
    }
    positions[i + 1] = y * flattenFactor - 0.1;
  }

  geo.computeVertexNormals();

  const rockData: MarsRockInstance[] = [];
  const count = 250;
  for (let i = 0; i < count; i++) {
    const rx = (rnd() - 0.5) * 200;
    const rz = (rnd() - 0.5) * 200;
    const dist = Math.sqrt(rx * rx + rz * rz);
    if (dist < 6) continue;

    const flattenFactor = Math.min(1, Math.max(0, (dist - 5) / 15));
    const ry = noise(rx, rz) * flattenFactor;
    const baseScale = rnd() * 2 + 0.5 + (dist > 50 ? rnd() * 4 : 0);

    rockData.push({
      position: [rx, ry - baseScale * 0.3, rz],
      rotation: [rnd() * Math.PI, rnd() * Math.PI, rnd() * Math.PI],
      scale: [
        baseScale * (0.5 + rnd() * 1.5),
        baseScale * (0.3 + rnd() * 0.7),
        baseScale * (0.5 + rnd() * 1.5),
      ],
    });
  }

  return { geometry: geo, rocks: rockData };
};

const Rover = () => {
  const { scene } = useGLTF('/Mars%202020%20Perseverance%20Rover.glb');
  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={1.5} />
      <ContactShadows opacity={0.5} scale={12} blur={2.5} far={4.5} />
    </group>
  );
};

const CameraZoomController = ({
  isFlyingIn,
  setIsFlyingIn,
}: {
  isFlyingIn: boolean;
  setIsFlyingIn: (v: boolean) => void;
}) => {
  const marsTransitionState = useStore((s) => s.marsTransitionState);
  const { camera } = useThree();
  const targetPosRef = useRef<THREE.Vector3 | null>(null);
  const animStateRef = useRef<{ startPos: THREE.Vector3; startTime: number } | null>(null);

  useEffect(() => {
    // Reset animation state when the transition mode changes
    targetPosRef.current = null;
    animStateRef.current = null;
  }, [marsTransitionState]);

  useFrame(() => {
    if (marsTransitionState === 'taking_off') {
      if (!targetPosRef.current) {
        targetPosRef.current = camera.position.clone().multiplyScalar(6);
        targetPosRef.current.y = Math.max(targetPosRef.current.y, 40); // Ensure it lifts up higher for a drone-like shot
        animStateRef.current = { startPos: camera.position.clone(), startTime: performance.now() };
      }
      if (!animStateRef.current || !targetPosRef.current) return;

      const elapsed = performance.now() - animStateRef.current.startTime;
      const progress = Math.min(elapsed / 3500, 1.0);
      const easeIn = progress * progress * progress; // easeInCubic

      camera.position.lerpVectors(animStateRef.current.startPos, targetPosRef.current, easeIn);
      camera.lookAt(0, 0, 0);
    } else if (isFlyingIn) {
      if (!targetPosRef.current) {
        targetPosRef.current = new THREE.Vector3(8, 3, 8);
        camera.position.set(15, 60, 40);
        // Wait 500ms for the black screen fade-in before starting the camera movement
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
        const easeOutQuart = 1 - Math.pow(1 - progress, 4); // easeOutQuart for cinematic entry

        camera.position.lerpVectors(
          animStateRef.current.startPos,
          targetPosRef.current,
          easeOutQuart,
        );

        if (progress >= 1.0) {
          setIsFlyingIn(false);
        }
      }
      camera.lookAt(0, 0, 0);
    } else {
      targetPosRef.current = null;
      animStateRef.current = null;
    }
  });

  return null;
};

const Terrain = () => {
  const rawGroundTexture = useTexture('/textures/mars_surface.png');
  const groundTexture = useMemo(() => {
    const texture = rawGroundTexture.clone();
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(40, 40);
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

  const { geometry, rocks } = useMemo(() => buildMarsTerrainGeometryAndRocks(), []);

  return (
    <group>
      <mesh geometry={geometry} receiveShadow>
        <meshStandardMaterial map={groundTexture} roughness={1} metalness={0.05} color="#d47c59" />
      </mesh>

      <Instances range={rocks.length} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial map={rockTexture} roughness={1} metalness={0.05} color="#a05038" />
        {rocks.map((rock, i) => (
          <Instance key={i} position={rock.position} rotation={rock.rotation} scale={rock.scale} />
        ))}
      </Instances>
    </group>
  );
};

export const MarsSurface = () => {
  const isLanded = useStore((s) => s.isLanded);
  const setIsLanded = useStore((s) => s.setIsLanded);
  const setMarsTransitionState = useStore((s) => s.setMarsTransitionState);

  if (!isLanded) return null;

  return (
    <div className="pointer-events-auto fixed inset-0 z-200 flex flex-col bg-[#1a0a05]">
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <MarsRoverScene />
      </div>

      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col">
        <header className="flex items-center justify-between p-6">
          <div className="pointer-events-auto flex flex-col">
            <h2 className="text-3xl font-black tracking-tighter text-orange-500 uppercase">
              Mars Explorer
            </h2>
            <p className="text-sm font-medium text-orange-200/60">
              Fokuserad på: Perseverance Rover
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              // Start the camera zoom out first
              setMarsTransitionState('taking_off');
              setIsLanded(false);
              setTimeout(() => {
                setMarsTransitionState('idle');
              }, 500);
            }}
            className="pointer-events-auto rounded-full bg-black/40 p-3 text-white backdrop-blur-md transition hover:bg-white/10"
          >
            <X className="h-6 w-6" aria-hidden />
          </button>
        </header>

        <div className="mt-auto flex items-end justify-between p-6">
          <div className="pointer-events-auto max-w-sm rounded-2xl border border-orange-500/20 bg-black/60 p-4 backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 text-orange-400">
              <Info className="h-4 w-4" />
              <span className="ds-eyebrow">Visste du?</span>
            </div>
            <p className="text-xs leading-relaxed text-white/80">
              Perseverance landade i Jezero-kratern den 18 februari 2021. Dess uppdrag är att söka
              efter tecken på forntida liv och samla in stenprover.
            </p>
          </div>

          <div className="pointer-events-auto flex flex-col gap-2">
            <p className="ds-eyebrow mb-1 text-right text-white/40">
              Dra med musen för att se dig omkring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MarsRoverScene = () => {
  const marsTransitionState = useStore((s) => s.marsTransitionState);
  const [isFlyingIn, setIsFlyingIn] = useState(true);
  const initialCameraPosition: [number, number, number] = isFlyingIn
    ? [15, 60, 40]
    : [8, 3, 8];

  return (
    <Canvas shadows camera={{ position: initialCameraPosition, fov: 45 }}>
      <Suspense fallback={null}>
        <CameraZoomController isFlyingIn={isFlyingIn} setIsFlyingIn={setIsFlyingIn} />
        <Sky
          distance={450000}
          sunPosition={[20, 5, 20]}
          inclination={0}
          azimuth={0.25}
          mieCoefficient={0.02}
          mieDirectionalG={0.8}
          rayleigh={3}
          turbidity={15}
        />
        <fog attach="fog" args={['#c26f4f', 10, 150]} />

        <ambientLight intensity={1.0} color="#ffd4bd" />
        <directionalLight
          position={[50, 100, 20]}
          intensity={2.5}
          color="#fff5f0"
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />

        <Rover />
        <Terrain />

        {marsTransitionState !== 'taking_off' && !isFlyingIn && (
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

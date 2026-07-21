/**
 * Moon Landing 3D Stage
 * 
 * This component assembles all 3D elements of the Moon surface, including
 * lighting, environment (stars, Earth, terrain), and the Lunar Module.
 * It also manages the transition between automated fly-in and user-controlled OrbitControls.
 */
import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useStore } from '../../../store/useStore';
import { CAMERA_SETTINGS } from './constants';
import { CameraZoomController } from './CameraZoomController';
import { StarField } from './StarField';
import { EarthSphere } from './EarthSphere';
import { LunarModule } from './LunarModule';
import { MoonTerrain } from './MoonTerrain';
import { MOON_SCENE_BG_COLOR } from '../surfaceBackgrounds';

export const MoonLandingScene = ({ onTakeoffComplete }: { onTakeoffComplete: () => void }) => {
  const moonTransitionState = useStore((s) => s.moonTransitionState);
  const [isFlyingIn, setIsFlyingIn] = useState(true);

  const initialCameraPosition = isFlyingIn
    ? CAMERA_SETTINGS.FLY_IN_START.toArray()
    : CAMERA_SETTINGS.FLY_IN_END.toArray();

  return (
    <Canvas
      shadows
      camera={{ position: initialCameraPosition as [number, number, number], fov: 45 }}
    >
      <Suspense fallback={null}>
        <CameraZoomController
          isFlyingIn={isFlyingIn}
          setIsFlyingIn={setIsFlyingIn}
          onTakeoffComplete={onTakeoffComplete}
        />

        {/* No <Sky> — Moon has no atmosphere */}
        <color attach="background" args={[MOON_SCENE_BG_COLOR]} />
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
            minDistance={10}
            maxDistance={60}
            target={CAMERA_SETTINGS.LOOK_AT_TARGET}
            maxPolarAngle={Math.PI / 2 - 0.1}
          />
        )}
      </Suspense>
    </Canvas>
  );
};

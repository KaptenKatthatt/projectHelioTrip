import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { CameraManager } from './CameraManager';
import { TimeManager } from './TimeManager';
import { Planets } from './Planets';
import { AsteroidBelt } from './AsteroidBelt';

export const Scene = () => {
  return (
    <Canvas
      camera={{ position: [0, 20, 80], fov: 55, near: 0.1, far: 5000 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 2]}
      shadows
    >
      <color attach="background" args={['#05060a']} />

      <ambientLight intensity={0.08} color="#b3c2ff" />
      <pointLight
        position={[0, 0, 0]}
        intensity={2.5}
        decay={0}
        color="#fff1c4"
        castShadow
      />

      <Suspense fallback={null}>
        <Stars
          radius={400}
          depth={120}
          count={8000}
          factor={5}
          saturation={0}
          fade
          speed={0.3}
        />
      </Suspense>

      <TimeManager />
      <Planets />
      <AsteroidBelt />

      <CameraManager />
    </Canvas>
  );
};

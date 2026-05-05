/**
 * Earth Visualization for the Moon Surface Background
 * 
 * Renders a rotating Earth sphere with custom emissive properties to ensure
 * visibility against the black space. Includes a dedicated fill light.
 */
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

export const EarthSphere = () => {
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
    <group position={[80, 40, -150]}>
      <mesh ref={meshRef} castShadow={false}>
        <sphereGeometry args={[15, 32, 32]} />
        <meshStandardMaterial
          map={diffuse}
          normalMap={normal}
          roughnessMap={roughness}
          roughness={1}
          metalness={0}
          emissive="#224488"
          emissiveIntensity={1.0}
        />
      </mesh>

      {/* Subtle blue fill light from Earth direction */}
      <pointLight color="#4488ff" intensity={2.0} distance={400} />
    </group>
  );
};

import { useGLTF, ContactShadows } from '@react-three/drei';

export const LunarModule = () => {
  const { scene } = useGLTF('/Apollo%20Lunar%20Module.meshopt.glb');

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={2.0} />
      <ContactShadows opacity={0.4} scale={14} blur={2} far={4} />
    </group>
  );
};

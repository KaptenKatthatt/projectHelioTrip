import { useGLTF, ContactShadows } from '@react-three/drei';

export const LunarModule = ({
  shadowsEnabled = true,
}: {
  readonly shadowsEnabled?: boolean;
}) => {
  const { scene } = useGLTF('/Apollo%20Lunar%20Module.meshopt.glb');

  return (
    <group position={[0, 0, 0]}>
      <primitive object={scene} scale={2.0} />
      {/*
        Neither the module nor the light moves, so the contact shadow is
        identical every frame. Left unbounded, drei re-renders a depth pass and
        blurs it twice on every single frame for a picture that never changes.

        Ten frames rather than one: the module arrives via a suspended GLTF
        load and the surrounding terrain builds its texture on a canvas, so a
        single bake on the very first frame risks capturing the scene before
        everything it should shade is in place. Ten frames is a sixth of a
        second and still removes effectively all of the cost.
      */}
      {shadowsEnabled ? (
        <ContactShadows opacity={0.4} scale={14} blur={2} far={4} frames={10} />
      ) : null}
    </group>
  );
};

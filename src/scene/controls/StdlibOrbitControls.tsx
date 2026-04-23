import { useFrame, useThree, type ThreeElement } from '@react-three/fiber';
import { forwardRef, useEffect, useMemo } from 'react';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type ExtractCallback<T, E extends string> = T extends {
  addEventListener(event: E, callback: infer C): void;
}
  ? C extends (event: infer Ev) => void
    ? Ev
    : never
  : never;

export type OrbitControlsChangeEvent = ExtractCallback<
  OrbitControlsImpl,
  'change'
>;
export type OrbitControlsStartEvent = ExtractCallback<
  OrbitControlsImpl,
  'start'
>;
export type OrbitControlsEndEvent = ExtractCallback<OrbitControlsImpl, 'end'>;

export type StdlibOrbitControlsProps = Omit<
  ThreeElement<typeof OrbitControlsImpl>,
  'ref' | 'args'
> & {
  camera?: ThreeElement<typeof OrbitControlsImpl>['object'];
  domElement?: HTMLElement;
  enableDamping?: boolean;
  makeDefault?: boolean;
  onChange?: (e: OrbitControlsChangeEvent) => void;
  onEnd?: (e: OrbitControlsEndEvent) => void;
  onStart?: (e: OrbitControlsStartEvent) => void;
  regress?: boolean;
  keyEvents?: boolean | HTMLElement;
};

/**
 * Same behavior as `@react-three/drei`'s OrbitControls (it is a thin wrapper
 * around `three-stdlib`), without importing `drei` at runtime.
 */
export const StdlibOrbitControls = forwardRef<
  OrbitControlsImpl,
  StdlibOrbitControlsProps
>(
  (
    {
      makeDefault,
      camera,
      regress,
      domElement,
      enableDamping = true,
      keyEvents = false,
      onChange,
      onStart,
      onEnd,
      ...restProps
    },
    ref,
  ) => {
    const invalidate = useThree((state) => state.invalidate);
    const defaultCamera = useThree((state) => state.camera);
    const gl = useThree((state) => state.gl);
    const events = useThree((state) => state.events);
    const set = useThree((state) => state.set);
    const get = useThree((state) => state.get);
    const performance = useThree((state) => state.performance);

    const explCamera = camera ?? defaultCamera;
    const explDomElement = domElement ?? events.connected ?? gl.domElement;

    const controls = useMemo(
      () => new OrbitControlsImpl(explCamera, explDomElement),
      [explCamera, explDomElement],
    );

    useFrame(() => {
      if (controls.enabled) controls.update();
    }, -1);

    useEffect(() => {
      if (keyEvents) {
        controls.connect(keyEvents === true ? explDomElement : keyEvents);
      }
      controls.connect(explDomElement);
      return () => {
        controls.dispose();
      };
    }, [keyEvents, explDomElement, controls]);

    useEffect(() => {
      const callback = (e: OrbitControlsChangeEvent): void => {
        invalidate();
        if (regress) performance.regress();
        onChange?.(e);
      };
      const onStartCb = (e: OrbitControlsStartEvent): void => {
        onStart?.(e);
      };
      const onEndCb = (e: OrbitControlsEndEvent): void => {
        onEnd?.(e);
      };

      controls.addEventListener('change', callback);
      controls.addEventListener('start', onStartCb);
      controls.addEventListener('end', onEndCb);
      return () => {
        controls.removeEventListener('start', onStartCb);
        controls.removeEventListener('end', onEndCb);
        controls.removeEventListener('change', callback);
      };
    }, [onChange, onStart, onEnd, controls, invalidate, performance, regress]);

    useEffect(() => {
      if (!makeDefault) return;
      const old = get().controls;
      set({ controls });
      return () => {
        set({ controls: old });
      };
    }, [makeDefault, controls, get, set]);

    return (
      <primitive
        ref={ref}
        object={controls}
        enableDamping={enableDamping}
        {...restProps}
      />
    );
  },
);

StdlibOrbitControls.displayName = 'StdlibOrbitControls';

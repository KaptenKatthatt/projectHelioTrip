import {
  useThree,
  type ComputeFunction,
  type DomEvent,
  type RootState,
  type ThreeElement,
} from '@react-three/fiber';
import { forwardRef, useEffect, useMemo } from 'react';
import { PointerLockControls as PointerLockControlsImpl } from 'three-stdlib';

type ExtractCallback<T, E extends string> = T extends {
  addEventListener(event: E, callback: infer C): void;
}
  ? C extends (event: infer Ev) => void
    ? Ev
    : never
  : never;

type PointerLockControlsChangeEvent = ExtractCallback<
  PointerLockControlsImpl,
  'change'
>;
type PointerLockControlsLockEvent = ExtractCallback<
  PointerLockControlsImpl,
  'lock'
>;
type PointerLockControlsUnlockEvent = ExtractCallback<
  PointerLockControlsImpl,
  'unlock'
>;

export type StdlibPointerLockControlsProps = Omit<
  ThreeElement<typeof PointerLockControlsImpl>,
  'ref' | 'args'
> & {
  domElement?: HTMLElement;
  selector?: string;
  enabled?: boolean;
  camera?: RootState['camera'];
  onChange?: (e: PointerLockControlsChangeEvent) => void;
  onLock?: (e: PointerLockControlsLockEvent) => void;
  onUnlock?: (e: PointerLockControlsUnlockEvent) => void;
  makeDefault?: boolean;
};

/**
 * Same behavior as `@react-three/drei`'s PointerLockControls (wrapper around
 * `three-stdlib`), without importing `drei` at runtime.
 */
export const StdlibPointerLockControls = forwardRef<
  PointerLockControlsImpl,
  StdlibPointerLockControlsProps
>(
  (
    {
      domElement,
      selector,
      onChange,
      onLock,
      onUnlock,
      enabled = true,
      makeDefault,
      camera,
      ...props
    },
    ref,
  ) => {
    const setEvents = useThree((state) => state.setEvents);
    const gl = useThree((state) => state.gl);
    const defaultCamera = useThree((state) => state.camera);
    const invalidate = useThree((state) => state.invalidate);
    const events = useThree((state) => state.events);
    const get = useThree((state) => state.get);
    const set = useThree((state) => state.set);

    const explCamera = camera ?? defaultCamera;
    const explDomElement = domElement ?? events.connected ?? gl.domElement;

    const controls = useMemo(
      () => new PointerLockControlsImpl(explCamera, explDomElement),
      [explCamera, explDomElement],
    );

    useEffect(() => {
      if (!enabled) return;

      controls.connect(explDomElement);

      const oldComputeOffsets = get().events.compute;
      const centeredPointerCompute: ComputeFunction = (
        _event: DomEvent,
        state: RootState,
      ) => {
        const offsetX = state.size.width / 2;
        const offsetY = state.size.height / 2;
        state.pointer.set(
          (offsetX / state.size.width) * 2 - 1,
          -(offsetY / state.size.height) * 2 + 1,
        );
        state.raycaster.setFromCamera(state.pointer, state.camera);
      };
      setEvents({
        compute: centeredPointerCompute,
      });

      return () => {
        controls.disconnect();
        setEvents({ compute: oldComputeOffsets });
      };
    }, [enabled, controls, explDomElement, get, setEvents]);

    useEffect(() => {
      if (!enabled) return;

      const callback = (e: PointerLockControlsChangeEvent): void => {
        invalidate();
        onChange?.(e);
      };

      controls.addEventListener('change', callback);

      const lockListener = onLock
        ? (e: PointerLockControlsLockEvent): void => {
            onLock(e);
          }
        : null;
      const unlockListener = onUnlock
        ? (e: PointerLockControlsUnlockEvent): void => {
            onUnlock(e);
          }
        : null;

      if (lockListener) controls.addEventListener('lock', lockListener);
      if (unlockListener) controls.addEventListener('unlock', unlockListener);

      const handler = (): void => {
        void controls.lock();
      };
      const elements = selector
        ? Array.from(document.querySelectorAll<HTMLElement>(selector))
        : [document as unknown as HTMLElement];

      for (const element of elements) {
        element?.addEventListener('click', handler);
      }

      return () => {
        controls.removeEventListener('change', callback);
        if (lockListener) controls.removeEventListener('lock', lockListener);
        if (unlockListener)
          controls.removeEventListener('unlock', unlockListener);
        for (const element of elements) {
          element?.removeEventListener('click', handler);
        }
      };
    }, [enabled, onChange, onLock, onUnlock, selector, controls, invalidate]);

    useEffect(() => {
      if (!makeDefault) return;
      const old = get().controls;
      set({ controls });
      return () => {
        set({ controls: old });
      };
    }, [makeDefault, controls, get, set]);

    return <primitive ref={ref} object={controls} {...props} />;
  },
);

StdlibPointerLockControls.displayName = 'StdlibPointerLockControls';

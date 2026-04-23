import { useEffect, useRef } from 'react';

export type MovementInput = {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  boost: boolean;
};

const createEmpty = (): MovementInput => ({
  forward: false,
  back: false,
  left: false,
  right: false,
  up: false,
  down: false,
  boost: false,
});

/**
 * Tracks WASD + Space/Ctrl + Shift as a mutable ref, avoiding re-renders
 * on every keystroke. Consumers read `ref.current` inside `useFrame`.
 *
 * `enabled` gates the listeners: when false, all keys reset to false and
 * no events are attached. This prevents stuck keys when toggling modes
 * while a key is held.
 */
export const useKeyboardMovement = (enabled: boolean) => {
  const inputRef = useRef<MovementInput>(createEmpty());

  useEffect(() => {
    if (!enabled) {
      inputRef.current = createEmpty();
      return;
    }

    const input = inputRef.current;

    const setKey = (code: string, pressed: boolean): boolean => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          input.forward = pressed;
          return true;
        case 'KeyS':
        case 'ArrowDown':
          input.back = pressed;
          return true;
        case 'KeyA':
        case 'ArrowLeft':
          input.left = pressed;
          return true;
        case 'KeyD':
        case 'ArrowRight':
          input.right = pressed;
          return true;
        case 'Space':
        case 'KeyF':
          input.up = pressed;
          return true;
        case 'KeyC':
          input.down = pressed;
          return true;
        case 'ShiftLeft':
        case 'ShiftRight':
          input.boost = pressed;
          return true;
        default:
          return false;
      }
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.repeat) return;
      if (setKey(event.code, true) && event.code === 'Space') {
        event.preventDefault();
      }
    };

    const onKeyUp = (event: KeyboardEvent): void => {
      setKey(event.code, false);
    };

    const onBlur = (): void => {
      inputRef.current = createEmpty();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      inputRef.current = createEmpty();
    };
  }, [enabled]);

  return inputRef;
};

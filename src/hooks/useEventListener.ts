import { useEffect, useRef } from "react";

/**
 * Minimal event-listener hook with stable callback references.
 */
export const useEventListener = (
  target: EventTarget | null | undefined,
  type: string,
  listener: (event: Event) => void,
  options?: AddEventListenerOptions | boolean,
  enabled = true,
): void => {
  const latestListenerRef = useRef(listener);

  useEffect(() => {
    latestListenerRef.current = listener;
  }, [listener]);

  useEffect(() => {
    if (!enabled) return;
    if (!target) return;

    const wrapped: EventListener = (event) => {
      latestListenerRef.current(event);
    };

    target.addEventListener(type, wrapped, options);
    return () => {
      target.removeEventListener(type, wrapped, options);
    };
  }, [enabled, options, target, type]);
};

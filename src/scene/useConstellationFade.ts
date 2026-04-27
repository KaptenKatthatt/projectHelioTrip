import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ConstellationId } from '../lib/constellations';

export const FADE_OUT_MS = 350;
export const FADE_IN_MS = 300;
const FADE_OUT_SECONDS = FADE_OUT_MS / 1000;
const FADE_IN_SECONDS = FADE_IN_MS / 1000;

/**
 * Manages the fade-in / fade-out animation state machine for constellation switching.
 *
 * WHY this is separate from ConstellationLines
 * --------------------------------------------
 * displayedId !== selectedConstellation by design: there is an intentional lag
 * so the old figure can fade out before the new one fades in. ConstellationLines
 * should never read selectedConstellation directly for rendering — always use
 * displayedId returned here.
 *
 * WHAT it returns
 * ---------------
 * displayedId  — React state; drives JSX and renderData useMemo.
 * displayedIdRef — ref mirror; safe to read inside useFrame without stale closure.
 * opacity      — React state (0–1); drives Line opacity props (JSX path).
 * opacityRef   — ref mirror; read in useFrame for the star-shader uniform.
 *
 * The hook registers its own useFrame (priority default 0) which runs BEFORE
 * the useFrame in ConstellationLines so opacityRef is always fresh when read there.
 */
export function useConstellationFade(selectedConstellation: ConstellationId | null): {
  displayedId: ConstellationId | null;
  displayedIdRef: React.MutableRefObject<ConstellationId | null>;
  opacity: number;
  opacityRef: React.MutableRefObject<number>;
} {
  const displayedIdRef = useRef<ConstellationId | null>(null);
  const nextIdRef = useRef<ConstellationId | null>(null);
  const phaseRef = useRef<'idle' | 'fadeOut' | 'fadeIn'>('idle');
  const opacityRef = useRef(0);

  const [displayedId, setDisplayedId] = useState<ConstellationId | null>(null);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    displayedIdRef.current = displayedId;
  }, [displayedId]);

  useEffect(() => {
    opacityRef.current = opacity;
  }, [opacity]);

  useEffect(() => {
    const current = displayedIdRef.current;

    if (!selectedConstellation) {
      nextIdRef.current = null;
      if (!current) {
        phaseRef.current = 'idle';
        opacityRef.current = 0;
        setOpacity(0);
        return;
      }
      phaseRef.current = 'fadeOut';
      return;
    }

    if (!current) {
      displayedIdRef.current = selectedConstellation;
      setDisplayedId(selectedConstellation);
      opacityRef.current = 0;
      setOpacity(0);
      phaseRef.current = 'fadeIn';
      return;
    }

    if (current === selectedConstellation) return;
    nextIdRef.current = selectedConstellation;
    phaseRef.current = 'fadeOut';
  }, [selectedConstellation]);

  useFrame((_, delta) => {
    const phase = phaseRef.current;

    if (phase === 'fadeOut') {
      const next =
        FADE_OUT_SECONDS <= 1e-6
          ? 0
          : Math.max(0, opacityRef.current - delta / FADE_OUT_SECONDS);
      opacityRef.current = next;
      setOpacity(next);
    } else if (phase === 'fadeIn') {
      const next =
        FADE_IN_SECONDS <= 1e-6
          ? 1
          : Math.min(1, opacityRef.current + delta / FADE_IN_SECONDS);
      opacityRef.current = next;
      setOpacity(next);
    }

    if (phase === 'fadeOut' && opacityRef.current <= 0.001) {
      const nextId = nextIdRef.current;
      if (nextId) {
        nextIdRef.current = null;
        displayedIdRef.current = nextId;
        setDisplayedId(nextId);
        opacityRef.current = 0;
        setOpacity(0);
        phaseRef.current = 'fadeIn';
      } else {
        displayedIdRef.current = null;
        setDisplayedId(null);
        phaseRef.current = 'idle';
      }
    } else if (phase === 'fadeIn' && opacityRef.current >= 0.999) {
      opacityRef.current = 1;
      setOpacity(1);
      phaseRef.current = 'idle';
    }
  });

  return { displayedId, displayedIdRef, opacity, opacityRef };
}

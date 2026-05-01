import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
import { useStore } from "../store/useStore";

/**
 * Fraction of the viewport height that the canvas is shifted upward on the
 * mobile layout. Kept at 0 so the WebGL view fills to the bottom nav — a
 * positive value leaves an empty band (page background) above the menu.
 */
const MOBILE_VERTICAL_SHIFT_FRACTION = 0;

/**
 * Moves the entire canvas element upward with a CSS transform when the mobile
 * layout is active and we are in overview mode. Uses DOM/CSS to completely
 * avoid clashing with the three.js projection (`setViewOffset`) that other
 * systems mutate.
 *
 * Disabled in close-up view of a planet (where `PlanetViewportOffset`
 * already frames the planet) and in free flight.
 */
export const MobileViewOffset = (): null => {
  const get = useThree((s) => s.get);
  const isMobile = useIsMobileLayout();
  const activeBody = useStore((s) => s.activeBody);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);

  const closeFramingActive =
    isMobile && activeBody !== null && viewMode === "close";
  const inFreeFlight = navigationMode === "free";
  const shouldShift = isMobile && !closeFramingActive && !inFreeFlight;

  useEffect(() => {
    const canvas = get().gl.domElement;
    if (!shouldShift) {
      canvas.style.transform = "";
      return;
    }
    const offsetPercent = MOBILE_VERTICAL_SHIFT_FRACTION * 100;
    canvas.style.transform = `translateY(-${offsetPercent}%)`;
    return () => {
      canvas.style.transform = "";
    };
  }, [get, shouldShift]);

  return null;
};

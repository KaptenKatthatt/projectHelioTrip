import { useEffect, useState } from "react";
import { useIsMobileLayout } from "./useIsMobileLayout";

export type ResponsiveLayoutTier = "compact" | "medium" | "expanded";

const EXPANDED_LAYOUT_MEDIA_QUERY = "(min-width: 1280px)";

export const useResponsiveLayout = (): ResponsiveLayoutTier => {
  const isMobileLayout = useIsMobileLayout();
  const [isExpanded, setIsExpanded] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(EXPANDED_LAYOUT_MEDIA_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(EXPANDED_LAYOUT_MEDIA_QUERY);
    const onChange = (): void => {
      setIsExpanded(mql.matches);
    };
    onChange();
    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  if (isMobileLayout) return "compact";
  return isExpanded ? "expanded" : "medium";
};

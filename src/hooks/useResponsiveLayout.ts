import { useIsMobileLayout } from "./useIsMobileLayout";
import { useMediaQuery } from "./useMediaQuery";

type ResponsiveLayoutTier = "compact" | "medium" | "expanded";

const EXPANDED_LAYOUT_MEDIA_QUERY = "(min-width: 1280px)";

export const useResponsiveLayout = (): ResponsiveLayoutTier => {
  const isMobileLayout = useIsMobileLayout();
  const isExpanded = useMediaQuery(EXPANDED_LAYOUT_MEDIA_QUERY);

  if (isMobileLayout) return "compact";
  return isExpanded ? "expanded" : "medium";
};

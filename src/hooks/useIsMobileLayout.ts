import { MOBILE_LAYOUT_MEDIA_QUERY } from '../lib/mobileLayoutMedia';
import { useMediaQuery } from './useMediaQuery';

/**
 * True for narrow viewports and for coarse-pointer landscape phones (wide but short),
 * so layout does not switch to desktop only because width crossed 640px.
 */
export const useIsMobileLayout = (): boolean => {
  return useMediaQuery(MOBILE_LAYOUT_MEDIA_QUERY);
};

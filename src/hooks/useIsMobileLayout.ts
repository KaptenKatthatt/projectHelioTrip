import { MOBILE_LAYOUT_MATCH_MEDIA_QUERY } from '../lib/mobileLayoutMedia';
import { useMediaQuery } from './useMediaQuery';

/**
 * True when {@link MOBILE_LAYOUT_MATCH_MEDIA_QUERY} matches: narrow / short layouts,
 * touch-primary (including large tablets), or fine-pointer bounded landscape phones.
 */
export const useIsMobileLayout = (): boolean => {
  return useMediaQuery(MOBILE_LAYOUT_MATCH_MEDIA_QUERY);
};

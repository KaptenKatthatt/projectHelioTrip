import { useEffect, useState } from 'react';
import { MOBILE_LAYOUT_MEDIA_QUERY } from '../lib/mobileLayoutMedia';

/**
 * True for narrow viewports and for coarse-pointer landscape phones (wide but short),
 * so layout does not switch to desktop only because width crossed 640px.
 */
export const useIsMobileLayout = (): boolean => {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY).matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY);
    const onChange = (): void => {
      setMatch(mql.matches);
    };
    onChange();
    mql.addEventListener('change', onChange);
    return () => {
      mql.removeEventListener('change', onChange);
    };
  }, []);

  return match;
};

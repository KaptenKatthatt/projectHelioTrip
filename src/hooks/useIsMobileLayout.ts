import { useEffect, useState } from 'react';

const QUERY = '(max-width: 639px)';

/**
 * Matches Tailwind `sm` breakpoint (640px): true for narrow viewports.
 */
export const useIsMobileLayout = (): boolean => {
  const [match, setMatch] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(QUERY).matches : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
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

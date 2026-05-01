import { useEffect, useState } from 'react';
import { MOBILE_LAYOUT_MEDIA_QUERY } from '../lib/mobileLayoutMedia';
import { readPhoneLandscapePortraitLock } from '../lib/portraitStage';

export type PhoneLandscapePortraitLock = {
  active: boolean;
  stageWidth: number;
  stageHeight: number;
};

export const usePhoneLandscapePortraitLock = (): PhoneLandscapePortraitLock => {
  const [state, setState] = useState(() => readPhoneLandscapePortraitLock());

  useEffect(() => {
    const sync = (): void => {
      setState(readPhoneLandscapePortraitLock());
    };

    const mqlMobile = window.matchMedia(MOBILE_LAYOUT_MEDIA_QUERY);
    const mqlLandscape = window.matchMedia('(orientation: landscape)');
    mqlMobile.addEventListener('change', sync);
    mqlLandscape.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    sync();

    return () => {
      mqlMobile.removeEventListener('change', sync);
      mqlLandscape.removeEventListener('change', sync);
      window.removeEventListener('resize', sync);
      window.removeEventListener('orientationchange', sync);
    };
  }, []);

  return {
    active: state.active,
    stageWidth: state.stage.width,
    stageHeight: state.stage.height,
  };
};

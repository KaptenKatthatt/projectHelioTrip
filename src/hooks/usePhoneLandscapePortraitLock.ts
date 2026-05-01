import { useEffect, useState } from 'react';
import {
  COARSE_TOUCH_PRIMARY_MQ,
  FINE_POINTER_PHONE_LANDSCAPE_MQ,
} from '../lib/mobileLayoutMedia';
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

    const mqlCoarseTouch = window.matchMedia(COARSE_TOUCH_PRIMARY_MQ);
    const mqlFinePhoneLandscape = window.matchMedia(FINE_POINTER_PHONE_LANDSCAPE_MQ);
    const mqlLandscape = window.matchMedia('(orientation: landscape)');
    mqlCoarseTouch.addEventListener('change', sync);
    mqlFinePhoneLandscape.addEventListener('change', sync);
    mqlLandscape.addEventListener('change', sync);
    window.addEventListener('resize', sync);
    window.addEventListener('orientationchange', sync);
    sync();

    return () => {
      mqlCoarseTouch.removeEventListener('change', sync);
      mqlFinePhoneLandscape.removeEventListener('change', sync);
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

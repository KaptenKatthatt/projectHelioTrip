import { useEffect } from 'react';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { resetFreeFlightTouch } from '../lib/freeFlightTouchBus';
import { useStore } from '../store/useStore';
import { VirtualJoystick } from './VirtualJoystick';

export const FreeFlightMobileControls = () => {
  const navigationMode = useStore((s) => s.navigationMode);
  const isMobile = useIsMobileLayout();

  useEffect(() => {
    return () => {
      resetFreeFlightTouch();
    };
  }, []);

  if (navigationMode !== 'free' || !isMobile) return null;

  return (
    <div className="pointer-events-auto flex w-full shrink-0 items-end justify-between gap-4">
      <VirtualJoystick mode="move" />
      <VirtualJoystick mode="look" />
    </div>
  );
};

// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MobilePlanetInfoCanvasDismiss } from './MobilePlanetInfoCanvasDismiss';
import { useStore } from '../store/useStore';
import { useThree } from '@react-three/fiber';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { consumePlanetInfoCanvasDismissSuppress } from '../lib/bodyPickPointer';

vi.mock('../store/useStore');
vi.mock('@react-three/fiber');
vi.mock('../hooks/useIsMobileLayout');
vi.mock('../lib/bodyPickPointer');

type MockStoreState = {
  mobilePlanetInfoSheetOpen: boolean;
  viewMode: 'close' | 'overview';
  activeBody: string | null;
  isTraveling: boolean;
  setMobilePlanetInfoSheetOpen: (open: boolean) => void;
};

type StoreSelector = (state: MockStoreState) => unknown;
type MockedUseStore = {
  mockImplementation: (fn: (selector: StoreSelector) => unknown) => void;
};

type ThreeSelector = (state: { gl: { domElement: HTMLCanvasElement } }) => unknown;
type MockedUseThree = {
  mockImplementation: (fn: (selector: ThreeSelector) => unknown) => void;
};

type MockedHookWithReturn<T> = {
  mockReturnValue: (value: T) => void;
};

describe('MobilePlanetInfoCanvasDismiss', () => {
  const mockSetSheetOpen = vi.fn();
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    mockCanvas = document.createElement('canvas');
    vi.clearAllMocks();
    (useStore as unknown as MockedUseStore).mockImplementation((selector) => {
      const state: MockStoreState = {
        mobilePlanetInfoSheetOpen: true,
        viewMode: 'close',
        activeBody: 'mars',
        isTraveling: false,
        setMobilePlanetInfoSheetOpen: mockSetSheetOpen,
      };
      return selector(state);
    });
    (useThree as unknown as MockedUseThree).mockImplementation((selector) =>
      selector({ gl: { domElement: mockCanvas } }),
    );
    (useIsMobileLayout as unknown as MockedHookWithReturn<boolean>).mockReturnValue(true);
    (consumePlanetInfoCanvasDismissSuppress as unknown as MockedHookWithReturn<boolean>).mockReturnValue(false);
  });

  it('adds event listeners when enabled', () => {
    const addEventListenerSpy = vi.spyOn(mockCanvas, 'addEventListener');
    render(<MobilePlanetInfoCanvasDismiss />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('pointerdown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('pointermove', expect.any(Function));
  });

  it('closes sheet on a short tap', () => {
    render(<MobilePlanetInfoCanvasDismiss />);
    
    // Simulate pointerdown
    const downEvent = new PointerEvent('pointerdown', { clientX: 10, clientY: 10, button: 0 });
    Object.defineProperty(downEvent, 'target', { value: mockCanvas, writable: true });
    mockCanvas.dispatchEvent(downEvent);

    // Simulate pointerup
    const upEvent = new PointerEvent('pointerup', { clientX: 12, clientY: 12, button: 0 });
    window.dispatchEvent(upEvent);

    expect(mockSetSheetOpen).toHaveBeenCalledWith(false);
  });

  it('does NOT close sheet if moved too much (drag)', () => {
    render(<MobilePlanetInfoCanvasDismiss />);
    
    mockCanvas.dispatchEvent(new PointerEvent('pointerdown', { clientX: 10, clientY: 10, button: 0 }));
    mockCanvas.dispatchEvent(new PointerEvent('pointermove', { clientX: 100, clientY: 100, button: 0 }));
    window.dispatchEvent(new PointerEvent('pointerup', { clientX: 100, clientY: 100, button: 0 }));

    expect(mockSetSheetOpen).not.toHaveBeenCalled();
  });
});

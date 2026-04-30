export type MatchMediaController = {
  restore: () => void;
};

export const mockMatchMedia = (matches: boolean): MatchMediaController => {
  const originalMatchMedia = window.matchMedia;

  const matchMediaMock = ((query: string): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {
      return;
    },
    removeListener: () => {
      return;
    },
    addEventListener: () => {
      return;
    },
    removeEventListener: () => {
      return;
    },
    dispatchEvent: () => true,
  })) as typeof window.matchMedia;

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: matchMediaMock,
  });

  return {
    restore: () => {
      Object.defineProperty(window, "matchMedia", {
        configurable: true,
        writable: true,
        value: originalMatchMedia,
      });
    },
  };
};

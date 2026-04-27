// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Store } from "../store/useStore";
import { useStore } from "../store/useStore";
import { TimePlaybackControls } from "./TimePlaybackControls";

type MatchMediaController = {
  restore: () => void;
};

const mockMatchMedia = (matches: boolean): MatchMediaController => {
  const originalMatchMedia = window.matchMedia;

  const matchMediaMock = vi
    .fn()
    .mockImplementation((query: string): MediaQueryList => {
      const result: MediaQueryList = {
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
      };
      return result;
    });

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

const baseStoreState = (): Store => {
  const state = useStore.getState();
  return {
    ...state,
    isPlaying: false,
    timeScale: 30,
    selectedConstellation: null,
    locale: "en",
  };
};

describe("TimePlaybackControls", () => {
  let media: MatchMediaController;

  beforeEach(() => {
    media = mockMatchMedia(false);
    useStore.setState(baseStoreState());
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 200 })),
    );
  });

  afterEach(() => {
    cleanup();
    useStore.setState(baseStoreState());
    media.restore();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("toggles play without changing the selected time scale", () => {
    render(<TimePlaybackControls />);

    const timeScaleBefore = useStore.getState().timeScale;
    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(useStore.getState().isPlaying).toBe(true);
    expect(useStore.getState().timeScale).toBe(timeScaleBefore);
    expect(
      screen
        .getByRole("button", { name: `${timeScaleBefore} d/s` })
        .getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

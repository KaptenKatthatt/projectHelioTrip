// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Store } from "../store/useStore";
import { useStore } from "../store/useStore";
import { TIME_SPEED_PRESETS } from "../lib/timePlayback";
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

  it("selects the existing 3-speed preset when play is pressed", () => {
    render(<TimePlaybackControls />);

    fireEvent.click(screen.getByRole("button", { name: "Play" }));

    expect(useStore.getState().isPlaying).toBe(true);
    expect(useStore.getState().timeScale).toBe(TIME_SPEED_PRESETS[2]);
    expect(
      screen.getByRole("button", { name: "3" }).getAttribute("aria-pressed"),
    ).toBe("true");
  });
});

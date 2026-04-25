// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Store } from "../store/useStore";
import { useStore } from "../store/useStore";
import { NavigationAccordion } from "./NavigationAccordion";
import { PlanetSelector } from "./PlanetSelector";

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
    activeBody: null,
    viewMode: "overview",
    selectedConstellation: null,
    locale: "en",
  };
};

describe("navigation and planet selection behavior", () => {
  afterEach(() => {
    useStore.setState(baseStoreState());
    vi.restoreAllMocks();
  });

  it("opens planets section by default on desktop layout", () => {
    const media = mockMatchMedia(false);

    render(<NavigationAccordion />);

    expect(screen.getByRole("button", { name: "Earth" })).toBeTruthy();

    media.restore();
  });

  it("keeps planets section closed by default on mobile layout", () => {
    const media = mockMatchMedia(true);

    render(<NavigationAccordion />);

    expect(screen.queryByRole("button", { name: "Earth" })).toBeNull();

    media.restore();
  });

  it("travels to selected planet when list item is clicked", () => {
    const travelToSpy = vi.fn<Store["travelTo"]>();

    useStore.setState({
      ...baseStoreState(),
      travelTo: travelToSpy,
    });

    render(<PlanetSelector showHeading={false} />);

    fireEvent.click(screen.getByRole("button", { name: "Earth" }));

    expect(travelToSpy).toHaveBeenCalledWith("earth");
    expect(travelToSpy).toHaveBeenCalledTimes(1);
  });
});

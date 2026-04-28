// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Store } from "../store/useStore";
import { useStore } from "../store/useStore";
import { mockMatchMedia } from "../test/mockMatchMedia";
import { NavigationAccordion } from "./organisms/NavigationAccordion";
import { PlanetSelector } from "./organisms/PlanetSelector";

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
    cleanup();
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

  it("adds a scroll container for the planets section on mobile", () => {
    const media = mockMatchMedia(true);

    render(<NavigationAccordion />);

    fireEvent.click(
      screen.getByRole("button", { name: "Expand panel: Our Solar System" }),
    );

    const earthButton = screen.getByRole("button", { name: "Earth" });
    const scrollContainer = earthButton.parentElement?.parentElement;

    expect(scrollContainer?.className).toContain("overflow-y-auto");
    expect(scrollContainer?.className).toContain("max-h-[min(26rem,55dvh)]");

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

  it("closes the planets section on mobile after clicking the active planet", () => {
    const media = mockMatchMedia(true);

    useStore.setState({
      ...baseStoreState(),
      activeBody: "earth",
      viewMode: "close",
    });

    render(<NavigationAccordion />);

    fireEvent.click(
      screen.getByRole("button", { name: "Expand panel: Our Solar System" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Earth" }));

    expect(screen.queryByRole("button", { name: "Earth" })).toBeNull();

    media.restore();
  });
});

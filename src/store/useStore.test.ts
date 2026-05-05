// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

type AnalyticsSpies = {
  planetSelected: ReturnType<typeof vi.fn>;
  languageChanged: ReturnType<typeof vi.fn>;
  freeFlightActivated: ReturnType<typeof vi.fn>;
  constellationOpened: ReturnType<typeof vi.fn>;
  playbackToggled: ReturnType<typeof vi.fn>;
  resetToSolarSystemStart: ReturnType<typeof vi.fn>;
  modeChanged: ReturnType<typeof vi.fn>;
  missionStarted: ReturnType<typeof vi.fn>;
  missionStepCompleted: ReturnType<typeof vi.fn>;
  missionCompleted: ReturnType<typeof vi.fn>;
  missionAbandoned: ReturnType<typeof vi.fn>;
  checklistProgress: ReturnType<typeof vi.fn>;
  achievementUnlocked: ReturnType<typeof vi.fn>;
  shareLinkCreated: ReturnType<typeof vi.fn>;
  shareLinkRestored: ReturnType<typeof vi.fn>;
};

const loadStore = async () => {
  vi.resetModules();
  localStorage.clear();

  const spies: AnalyticsSpies = {
    planetSelected: vi.fn(),
    languageChanged: vi.fn(),
    freeFlightActivated: vi.fn(),
    constellationOpened: vi.fn(),
    playbackToggled: vi.fn(),
    resetToSolarSystemStart: vi.fn(),
    modeChanged: vi.fn(),
    missionStarted: vi.fn(),
    missionStepCompleted: vi.fn(),
    missionCompleted: vi.fn(),
    missionAbandoned: vi.fn(),
    checklistProgress: vi.fn(),
    achievementUnlocked: vi.fn(),
    shareLinkCreated: vi.fn(),
    shareLinkRestored: vi.fn(),
  };

  vi.doMock("../lib/analytics", () => ({
    analytics: {
      planetSelected: spies.planetSelected,
      languageChanged: spies.languageChanged,
      freeFlightActivated: spies.freeFlightActivated,
      constellationOpened: spies.constellationOpened,
      playbackToggled: spies.playbackToggled,
      resetToSolarSystemStart: spies.resetToSolarSystemStart,
      modeChanged: spies.modeChanged,
      missionStarted: spies.missionStarted,
      missionStepCompleted: spies.missionStepCompleted,
      missionCompleted: spies.missionCompleted,
      missionAbandoned: spies.missionAbandoned,
      checklistProgress: spies.checklistProgress,
      achievementUnlocked: spies.achievementUnlocked,
      shareLinkCreated: spies.shareLinkCreated,
      shareLinkRestored: spies.shareLinkRestored,
    },
  }));

  const mod = await import("./useStore");
  return { useStore: mod.useStore, spies };
};

describe("useStore", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("travelTo updates state and emits planet analytics", async () => {
    const { useStore, spies } = await loadStore();

    useStore.getState().travelTo("earth");

    const state = useStore.getState();
    expect(state.activeBody).toBe("earth");
    expect(state.viewMode).toBe("close");
    expect(state.isTraveling).toBe(true);
    expect(state.navigationMode).toBe("cinematic");
    expect(spies.planetSelected).toHaveBeenCalledWith("earth");
  });

  it("togglePlay flips playback and emits analytics with previous state", async () => {
    const { useStore, spies } = await loadStore();

    expect(useStore.getState().isPlaying).toBe(false);
    useStore.getState().togglePlay();
    expect(useStore.getState().isPlaying).toBe(true);
    expect(spies.playbackToggled).toHaveBeenCalledWith(false);

    useStore.getState().togglePlay();
    expect(useStore.getState().isPlaying).toBe(false);
    expect(spies.playbackToggled).toHaveBeenLastCalledWith(true);
  });

  it("setLocale only emits analytics on actual locale changes", async () => {
    const { useStore, spies } = await loadStore();

    const initialLocale = useStore.getState().locale;
    useStore.getState().setLocale(initialLocale);
    expect(spies.languageChanged).not.toHaveBeenCalled();

    const nextLocale = initialLocale === "sv" ? "en" : "sv";
    useStore.getState().setLocale(nextLocale);
    expect(useStore.getState().locale).toBe(nextLocale);
    expect(spies.languageChanged).toHaveBeenCalledWith(nextLocale);
  });

  it("setGameMode emits analytics only when mode changes", async () => {
    const { useStore, spies } = await loadStore();

    expect(useStore.getState().gameMode).toBe("explore");
    useStore.getState().setGameMode("explore");
    expect(spies.modeChanged).not.toHaveBeenCalled();

    useStore.getState().setGameMode("challenge");
    expect(useStore.getState().gameMode).toBe("challenge");
    expect(spies.modeChanged).toHaveBeenCalledWith("challenge");
  });

  it("setTimeScale emits mission domain event for time-scale triggers", async () => {
    const { useStore } = await loadStore();
    useStore.getState().setGameMode("challenge");
    useStore.getState().startMission("time_travel_short");

    useStore.getState().setTimeScale(30);

    const progress = useStore.getState().missionProgress.time_travel_short;
    expect(progress?.completedStepIds).toContain("speed_up");
    expect(progress?.completed).toBe(true);
  });

  it("setNavigationMode emits mission domain event for navigation triggers", async () => {
    const { useStore } = await loadStore();
    useStore.getState().setGameMode("challenge");
    useStore.getState().startMission("free_flight_loop");

    useStore.getState().setNavigationMode("free");

    const progress = useStore.getState().missionProgress.free_flight_loop;
    expect(progress?.completedStepIds).toContain("enter_free");
  });

  it("focusSkyTarget switches to overview and tracks first constellation open", async () => {
    const { useStore, spies } = await loadStore();

    const beforeTravelId = useStore.getState().travelId;
    const beforeSkyFocusId = useStore.getState().skyFocusId;

    useStore.getState().focusSkyTarget("orion");

    const state = useStore.getState();
    expect(state.selectedConstellation).toBe("orion");
    expect(state.viewMode).toBe("overview");
    expect(state.navigationMode).toBe("cinematic");
    expect(state.travelId).toBe(beforeTravelId);
    expect(state.skyFocusId).toBe(beforeSkyFocusId + 1);
    expect(spies.constellationOpened).toHaveBeenCalledWith("orion");
  });

  it("focusSkyTarget from close mode does not trigger CameraManager travel arc", async () => {
    const { useStore } = await loadStore();

    useStore.getState().travelTo("earth");
    const beforeTravelId = useStore.getState().travelId;

    useStore.getState().focusSkyTarget("orion");

    const state = useStore.getState();
    expect(state.viewMode).toBe("overview");
    expect(state.activeBody).toBe("earth");
    expect(state.selectedConstellation).toBe("orion");
    expect(state.travelId).toBe(beforeTravelId);
  });

  describe('moon landing state', () => {
    it('isLandedOnMoon defaults to false', async () => {
      const { useStore } = await loadStore();
      expect(useStore.getState().isLandedOnMoon).toBe(false);
    });

    it('setIsLandedOnMoon sets the value', async () => {
      const { useStore } = await loadStore();
      useStore.getState().setIsLandedOnMoon(true);
      expect(useStore.getState().isLandedOnMoon).toBe(true);
    });

    it('moonTransitionState defaults to idle', async () => {
      const { useStore } = await loadStore();
      expect(useStore.getState().moonTransitionState).toBe('idle');
    });

    it('setMoonTransitionState sets the value', async () => {
      const { useStore } = await loadStore();
      useStore.getState().setMoonTransitionState('landing');
      expect(useStore.getState().moonTransitionState).toBe('landing');
    });
  });
});

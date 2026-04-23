import { Vector3 } from 'three';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { BodyId } from '../lib/bodies';
import type { ConstellationId } from '../lib/constellations';
import { detectLocale, isLocale } from '../i18n/translations';
import type { Locale } from '../i18n/translations';

export type ViewMode = 'close' | 'overview';

export type NavigationMode = 'cinematic' | 'free';

export type SimulationState = {
  activeBody: BodyId | null;
  cameraPosition: Vector3;
  isTraveling: boolean;
  simulationTime: Date;
  timeScale: number;
  isPlaying: boolean;
  viewMode: ViewMode;
  travelId: number;
  locale: Locale;
  navigationMode: NavigationMode;
  selectedConstellation: ConstellationId | null;
  constellationLinesVisible: boolean;
  skyFocusId: number;
};

export type SimulationActions = {
  setActiveBody: (id: BodyId | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setIsTraveling: (traveling: boolean) => void;
  setSimulationTime: (time: Date) => void;
  travelTo: (id: BodyId) => void;
  travelToOverview: () => void;
  arrive: () => void;
  resetSimulationTime: () => void;
  setTimeScale: (scale: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLocale: (locale: Locale) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setSelectedConstellation: (id: ConstellationId | null) => void;
  focusSkyTarget: (id: ConstellationId) => void;
  toggleConstellationLinesVisible: () => void;
};

export type Store = SimulationState & SimulationActions;

const DEFAULT_CAMERA_POSITION = new Vector3(0, 20, 80);

type PersistedState = {
  locale: Locale;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      activeBody: null,
      cameraPosition: DEFAULT_CAMERA_POSITION.clone(),
      isTraveling: false,
      simulationTime: new Date(),
      timeScale: 1,
      isPlaying: false,
      viewMode: 'overview',
      travelId: 0,
      locale: detectLocale(),
      navigationMode: 'cinematic',
      selectedConstellation: null,
      constellationLinesVisible: true,
      skyFocusId: 0,

      setActiveBody: (id) => set({ activeBody: id }),

      setCameraPosition: (position) =>
        set({ cameraPosition: position.clone() }),

      setIsTraveling: (traveling) => set({ isTraveling: traveling }),

      setSimulationTime: (time) => set({ simulationTime: time }),

      travelTo: (id) =>
        set((state) => ({
          activeBody: id,
          isTraveling: true,
          viewMode: 'close',
          travelId: state.travelId + 1,
          navigationMode: 'cinematic',
          selectedConstellation: null,
        })),

      travelToOverview: () =>
        set((state) => ({
          isTraveling: true,
          viewMode: 'overview',
          travelId: state.travelId + 1,
          navigationMode: 'cinematic',
        })),

      arrive: () => set({ isTraveling: false }),

      resetSimulationTime: () => set({ simulationTime: new Date() }),

      setTimeScale: (scale) => set({ timeScale: scale }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setViewMode: (mode) => set({ viewMode: mode }),

      setLocale: (locale) => set({ locale }),

      setNavigationMode: (mode) => set({ navigationMode: mode }),

      setSelectedConstellation: (id) => set({ selectedConstellation: id }),

      focusSkyTarget: (id) =>
        set((state) => ({
          selectedConstellation: id,
          isTraveling: state.selectedConstellation === null,
          viewMode: 'overview',
          travelId:
            state.selectedConstellation === null
              ? state.travelId + 1
              : state.travelId,
          navigationMode: 'cinematic',
          skyFocusId:
            state.selectedConstellation === null
              ? state.skyFocusId + 1
              : state.skyFocusId,
        })),

      toggleConstellationLinesVisible: () =>
        set((state) => ({
          constellationLinesVisible: !state.constellationLinesVisible,
        })),
    }),
    {
      name: 'heliotrip-preferences',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedState => ({ locale: state.locale }),
      merge: (persisted, current): Store => {
        const p = persisted as Partial<PersistedState> | undefined;
        return {
          ...current,
          locale: isLocale(p?.locale) ? p.locale : current.locale,
        };
      },
    },
  ),
);

import { Vector3 } from 'three';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { PlanetId } from '../lib/planets';
import { detectLocale, isLocale } from '../i18n/translations';
import type { Locale } from '../i18n/translations';

export type ViewMode = 'close' | 'overview';

export type SimulationState = {
  activePlanet: PlanetId | null;
  cameraPosition: Vector3;
  isTraveling: boolean;
  simulationTime: Date;
  timeScale: number;
  isPlaying: boolean;
  viewMode: ViewMode;
  travelId: number;
  locale: Locale;
};

export type SimulationActions = {
  setActivePlanet: (planet: PlanetId | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setIsTraveling: (traveling: boolean) => void;
  setSimulationTime: (time: Date) => void;
  travelTo: (planet: PlanetId) => void;
  travelToOverview: () => void;
  arrive: () => void;
  resetSimulationTime: () => void;
  setTimeScale: (scale: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLocale: (locale: Locale) => void;
};

export type Store = SimulationState & SimulationActions;

const DEFAULT_CAMERA_POSITION = new Vector3(0, 20, 80);

type PersistedState = {
  locale: Locale;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      activePlanet: null,
      cameraPosition: DEFAULT_CAMERA_POSITION.clone(),
      isTraveling: false,
      simulationTime: new Date(),
      timeScale: 1,
      isPlaying: false,
      viewMode: 'overview',
      travelId: 0,
      locale: detectLocale(),

      setActivePlanet: (planet) => set({ activePlanet: planet }),

      setCameraPosition: (position) =>
        set({ cameraPosition: position.clone() }),

      setIsTraveling: (traveling) => set({ isTraveling: traveling }),

      setSimulationTime: (time) => set({ simulationTime: time }),

      travelTo: (planet) =>
        set((state) => ({
          activePlanet: planet,
          isTraveling: true,
          viewMode: 'close',
          travelId: state.travelId + 1,
        })),

      travelToOverview: () =>
        set((state) => ({
          isTraveling: true,
          viewMode: 'overview',
          travelId: state.travelId + 1,
        })),

      arrive: () => set({ isTraveling: false }),

      resetSimulationTime: () => set({ simulationTime: new Date() }),

      setTimeScale: (scale) => set({ timeScale: scale }),

      setIsPlaying: (playing) => set({ isPlaying: playing }),

      togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

      setViewMode: (mode) => set({ viewMode: mode }),

      setLocale: (locale) => set({ locale }),
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

/**
 * Simulation State Slice
 * 
 * Manages the core engine state including camera positions, travel status, 
 * simulation time, and global view modes. 
 * 
 * Key Variables:
 * - activeBody: The currently focused planet/moon.
 * - viewMode: 'overview' (solar system) or 'close' (planet view).
 * - simulationTime: Current date/time used for orbital calculations.
 * - timeScale: Speed of the simulation (days per real second).
 */
import type { StateCreator } from 'zustand';
import { Vector3 } from 'three';
import type { BodyId } from '../../lib/bodies';
import { INITIAL_OVERVIEW_CAMERA_POSITION } from '../../lib/initialCamera';
import { DEFAULT_TIME_SCALE } from '../../lib/timePlayback';
import { detectLocale } from '../../i18n/translations';
import type { Locale } from '../../i18n/translations';
import type { ConstellationId } from '../../lib/constellations';

export type ViewMode = 'close' | 'overview';
export type NavigationMode = 'cinematic' | 'free';

export interface SimulationState {
  activeBody: BodyId | null;
  cameraPosition: Vector3;
  isTraveling: boolean;
  isTravelAnimating: boolean;
  simulationTime: Date;
  timeScale: number;
  isPlaying: boolean;
  viewMode: ViewMode;
  travelId: number;
  overviewCameraResetId: number;
  locale: Locale;
  navigationMode: NavigationMode;
  selectedConstellation: ConstellationId | null;
  constellationLinesVisible: boolean;
  constellationUserSpinRad: number;
  skyFocusId: number;
  mobilePlanetInfoSheetOpen: boolean;
  leftRailOpen: boolean;
  isLanded: boolean;
  isLandedOnMoon: boolean;
  marsTransitionState: 'idle' | 'landing' | 'taking_off';
  moonTransitionState: 'idle' | 'landing' | 'taking_off';
}

export interface SimulationActions {
  setActiveBody: (id: BodyId | null) => void;
  setCameraPosition: (position: Vector3) => void;
  setIsTraveling: (traveling: boolean) => void;
  setSimulationTime: (time: Date) => void;
  arrive: () => void;
  resetSimulationTime: () => void;
  setTimeScale: (scale: number) => void;
  setIsPlaying: (playing: boolean) => void;
  togglePlay: () => void;
  setViewMode: (mode: ViewMode) => void;
  setLocale: (locale: Locale) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setSelectedConstellation: (id: ConstellationId | null) => void;
  toggleConstellationLinesVisible: () => void;
  adjustConstellationSpin: (deltaRad: number) => void;
  setMobilePlanetInfoSheetOpen: (open: boolean) => void;
  toggleLeftRail: () => void;
  setIsLanded: (landed: boolean) => void;
  setMarsTransitionState: (state: 'idle' | 'landing' | 'taking_off') => void;
  setIsLandedOnMoon: (landed: boolean) => void;
  setMoonTransitionState: (state: 'idle' | 'landing' | 'taking_off') => void;
}

export type SimulationSlice = SimulationState & SimulationActions;

export const createSimulationSlice: StateCreator<SimulationSlice, [], [], SimulationSlice> = (set) => ({
  activeBody: null,
  cameraPosition: INITIAL_OVERVIEW_CAMERA_POSITION.clone(),
  isTraveling: false,
  isTravelAnimating: false,
  simulationTime: new Date(),
  timeScale: DEFAULT_TIME_SCALE,
  isPlaying: false,
  viewMode: 'overview',
  travelId: 0,
  overviewCameraResetId: 0,
  locale: detectLocale(),
  navigationMode: 'cinematic',
  selectedConstellation: null,
  constellationLinesVisible: true,
  constellationUserSpinRad: 0,
  skyFocusId: 0,
  mobilePlanetInfoSheetOpen: false,
  leftRailOpen: true,
  isLanded: false,
  isLandedOnMoon: false,
  marsTransitionState: 'idle',
  moonTransitionState: 'idle',

  setActiveBody: (id) => set({ activeBody: id }),
  setCameraPosition: (position) => set({ cameraPosition: position.clone() }),
  setIsTraveling: (traveling) => set({ isTraveling: traveling }),
  setSimulationTime: (time) => set({ simulationTime: time }),
  arrive: () => set({ isTraveling: false }),
  resetSimulationTime: () => set({ simulationTime: new Date() }),
  setTimeScale: (scale) => set({ timeScale: scale }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setViewMode: (mode) => set({ viewMode: mode }),
  setLocale: (locale) => set({ locale }),
  setNavigationMode: (mode) => set({ navigationMode: mode }),
  setSelectedConstellation: (id) =>
    set((state) => {
      const keepPose = id !== null && id === state.selectedConstellation;
      return {
        selectedConstellation: id,
        constellationUserSpinRad: keepPose ? state.constellationUserSpinRad : 0,
      };
    }),
  toggleConstellationLinesVisible: () =>
    set((state) => ({ constellationLinesVisible: !state.constellationLinesVisible })),
  adjustConstellationSpin: (deltaRad) =>
    set((state) => ({ constellationUserSpinRad: state.constellationUserSpinRad + deltaRad })),
  setMobilePlanetInfoSheetOpen: (open) => set({ mobilePlanetInfoSheetOpen: open }),
  toggleLeftRail: () => set((state) => ({ leftRailOpen: !state.leftRailOpen })),
  setIsLanded: (landed) => set({ isLanded: landed }),
  setMarsTransitionState: (state) => set({ marsTransitionState: state }),
  setIsLandedOnMoon: (landed) => set({ isLandedOnMoon: landed }),
  setMoonTransitionState: (state) => set({ moonTransitionState: state }),
});

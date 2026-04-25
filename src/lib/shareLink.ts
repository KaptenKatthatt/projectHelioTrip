import { getBody, type BodyId } from "./bodies";
import { TIME_SPEED_PRESETS } from "./timePlayback";
import {
  GAME_MODES,
  type GameMode,
  isGameMode,
  type NavigationModeLite,
} from "./missions/types";
import { isMissionId } from "./missions/missionDefinitions";

export type ShareLinkState = {
  readonly bodyId: BodyId | null;
  readonly simulationTimeMs: number | null;
  readonly timeScale: number | null;
  readonly gameMode: GameMode | null;
  readonly missionId: string | null;
  readonly navigationMode: NavigationModeLite | null;
};

export const SHARE_LINK_VERSION = "1";

const SHARE_PARAM_KEYS = {
  version: "v",
  body: "body",
  time: "t",
  scale: "ts",
  mode: "mode",
  mission: "mission",
  nav: "nav",
} as const;

const isFiniteNumber = (value: number): boolean =>
  Number.isFinite(value) && !Number.isNaN(value);

const parseBodyId = (raw: string | null): BodyId | null => {
  if (!raw) return null;
  return getBody(raw as BodyId) ? (raw as BodyId) : null;
};

const parseTimeMs = (raw: string | null): number | null => {
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!isFiniteNumber(parsed)) return null;
  // Sanity bounds: between year 1900 and year 2200.
  const min = Date.parse("1900-01-01T00:00:00Z");
  const max = Date.parse("2200-01-01T00:00:00Z");
  if (parsed < min || parsed > max) return null;
  return parsed;
};

const parseTimeScale = (raw: string | null): number | null => {
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  if (!isFiniteNumber(parsed)) return null;
  return TIME_SPEED_PRESETS.includes(parsed) ? parsed : null;
};

const parseNavigationMode = (raw: string | null): NavigationModeLite | null => {
  if (raw === "cinematic" || raw === "free") return raw;
  return null;
};

const parseGameMode = (raw: string | null): GameMode | null =>
  raw && isGameMode(raw) ? raw : null;

const parseMissionId = (raw: string | null): string | null =>
  raw && isMissionId(raw) ? raw : null;

/**
 * Parses a query string (with or without leading `?`) into a validated
 * share-link state. Unknown or unsafe parameters are dropped silently
 * so that restoring never throws or applies partial trash.
 */
export const parseShareLink = (search: string): ShareLinkState | null => {
  const trimmed = search.startsWith("?") ? search.slice(1) : search;
  if (trimmed.length === 0) return null;
  const params = new URLSearchParams(trimmed);
  const version = params.get(SHARE_PARAM_KEYS.version);
  if (version !== null && version !== SHARE_LINK_VERSION) return null;

  const state: ShareLinkState = {
    bodyId: parseBodyId(params.get(SHARE_PARAM_KEYS.body)),
    simulationTimeMs: parseTimeMs(params.get(SHARE_PARAM_KEYS.time)),
    timeScale: parseTimeScale(params.get(SHARE_PARAM_KEYS.scale)),
    gameMode: parseGameMode(params.get(SHARE_PARAM_KEYS.mode)),
    missionId: parseMissionId(params.get(SHARE_PARAM_KEYS.mission)),
    navigationMode: parseNavigationMode(params.get(SHARE_PARAM_KEYS.nav)),
  };

  const hasAnything =
    state.bodyId !== null ||
    state.simulationTimeMs !== null ||
    state.timeScale !== null ||
    state.gameMode !== null ||
    state.missionId !== null ||
    state.navigationMode !== null;

  return hasAnything ? state : null;
};

export type ShareLinkInput = {
  readonly bodyId: BodyId | null;
  readonly simulationTimeMs: number;
  readonly timeScale: number;
  readonly gameMode: GameMode;
  readonly missionId: string | null;
  readonly navigationMode: NavigationModeLite;
};

export const buildShareLinkSearch = (input: ShareLinkInput): string => {
  const params = new URLSearchParams();
  params.set(SHARE_PARAM_KEYS.version, SHARE_LINK_VERSION);
  if (input.bodyId !== null && getBody(input.bodyId)) {
    params.set(SHARE_PARAM_KEYS.body, input.bodyId);
  }
  if (Number.isFinite(input.simulationTimeMs)) {
    params.set(
      SHARE_PARAM_KEYS.time,
      String(Math.round(input.simulationTimeMs)),
    );
  }
  if (TIME_SPEED_PRESETS.includes(input.timeScale)) {
    params.set(SHARE_PARAM_KEYS.scale, String(input.timeScale));
  }
  if (GAME_MODES.includes(input.gameMode)) {
    params.set(SHARE_PARAM_KEYS.mode, input.gameMode);
  }
  if (input.missionId !== null && isMissionId(input.missionId)) {
    params.set(SHARE_PARAM_KEYS.mission, input.missionId);
  }
  if (input.navigationMode === "cinematic" || input.navigationMode === "free") {
    params.set(SHARE_PARAM_KEYS.nav, input.navigationMode);
  }
  return `?${params.toString()}`;
};

export type ShareLinkContextType = "body" | "mission" | "mode" | "overview";

export const inferShareLinkContextType = (
  state: ShareLinkInput,
): ShareLinkContextType => {
  if (state.missionId !== null) return "mission";
  if (state.bodyId !== null) return "body";
  if (state.gameMode !== "explore") return "mode";
  return "overview";
};

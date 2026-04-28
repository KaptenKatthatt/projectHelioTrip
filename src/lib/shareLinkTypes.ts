import type { BodyId } from "./bodies";
import type { NavigationModeLite, GameMode } from "./missions/types";

export type ShareLinkState = {
  readonly bodyId: BodyId | null;
  readonly simulationTimeMs: number | null;
  readonly timeScale: number | null;
  readonly gameMode: GameMode | null;
  readonly missionId: string | null;
  readonly navigationMode: NavigationModeLite | null;
};

export type ShareLinkInput = {
  readonly bodyId: BodyId | null;
  readonly simulationTimeMs: number;
  readonly timeScale: number;
  readonly gameMode: GameMode;
  readonly missionId: string | null;
  readonly navigationMode: NavigationModeLite;
};

export type ShareLinkContextType = "body" | "mission" | "mode" | "overview";

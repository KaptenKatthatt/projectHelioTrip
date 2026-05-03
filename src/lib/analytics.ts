import type { BodyId } from "./bodies";
import type { ConstellationId } from "./constellations";
import type { Locale } from "../i18n/translations";
import type { GameMode } from "./missions/types";
import type { AchievementId } from "./missions/achievements";
import type { ShareLinkContextType } from "./shareLink";

type AnonymousEventName =
  | "planet_selected"
  | "language_changed"
  | "free_flight_activated"
  | "constellation_opened"
  | "play_clicked"
  | "pause_clicked"
  | "solar_system_start_clicked"
  | "mode_changed"
  | "mission_started"
  | "mission_step_completed"
  | "mission_completed"
  | "mission_abandoned"
  | "checklist_progress"
  | "achievement_unlocked"
  | "share_link_created"
  | "share_link_restored"
  | "time_spent_on_planet"
  | "photo_taken"
  | "scrapbook_opened"
  | "device_type"
  | "time_of_day"
  | "learn_now_clicked";

type AnonymousEventPayload = Readonly<Record<string, string>>;
let analyticsDisabledForSession = false;
const analyticsDisabledByEnv =
  import.meta.env.VITE_DISABLE_ANALYTICS === "true";

const sendEvent = (
  name: AnonymousEventName,
  payload: AnonymousEventPayload = {},
): void => {
  if (typeof window === "undefined") return;
  if (analyticsDisabledByEnv) return;
  if (analyticsDisabledForSession) return;
  void fetch("/api/analytics/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({ name, payload }),
  }).catch(() => {
    // Ad blockers can reject analytics calls ("blocked by client").
    // Stop trying for this tab session to avoid repeated console/network noise.
    analyticsDisabledForSession = true;
    // no-op: analytics should never break UI flows
  });
};

export const analytics = {
  planetSelected(bodyId: BodyId): void {
    sendEvent("planet_selected", { body_id: bodyId });
  },
  languageChanged(locale: Locale): void {
    sendEvent("language_changed", { locale });
  },
  modeChanged(mode: GameMode): void {
    sendEvent("mode_changed", { mode });
  },
  missionStarted(missionId: string): void {
    sendEvent("mission_started", { mission_id: missionId });
  },
  missionStepCompleted(missionId: string, stepId: string): void {
    sendEvent("mission_step_completed", {
      mission_id: missionId,
      step_id: stepId,
    });
  },
  missionCompleted(missionId: string): void {
    sendEvent("mission_completed", { mission_id: missionId });
  },
  missionAbandoned(missionId: string): void {
    sendEvent("mission_abandoned", { mission_id: missionId });
  },
  checklistProgress(visitedCount: number): void {
    sendEvent("checklist_progress", {
      visited_count: String(Math.max(0, Math.round(visitedCount))),
    });
  },
  achievementUnlocked(achievementId: AchievementId): void {
    sendEvent("achievement_unlocked", { achievement_id: achievementId });
  },
  shareLinkCreated(contextType: ShareLinkContextType): void {
    sendEvent("share_link_created", { context_type: contextType });
  },
  shareLinkRestored(contextType: ShareLinkContextType): void {
    sendEvent("share_link_restored", { context_type: contextType });
  },
  freeFlightActivated(): void {
    sendEvent("free_flight_activated");
  },
  constellationOpened(constellationId: ConstellationId): void {
    sendEvent("constellation_opened", { constellation_id: constellationId });
  },
  playbackToggled(wasPlaying: boolean): void {
    sendEvent(wasPlaying ? "pause_clicked" : "play_clicked");
  },
  resetToSolarSystemStart(): void {
    sendEvent("solar_system_start_clicked");
  },
  timeSpentOnPlanet(bucket: string): void {
    sendEvent("time_spent_on_planet", { bucket });
  },
  photoTaken(): void {
    sendEvent("photo_taken");
  },
  scrapbookOpened(): void {
    sendEvent("scrapbook_opened");
  },
  deviceType(type: "mobile" | "desktop"): void {
    sendEvent("device_type", { type });
  },
  timeOfDay(time: "morning" | "afternoon" | "evening" | "night"): void {
    sendEvent("time_of_day", { time });
  },
  learnNowClicked(): void {
    sendEvent("learn_now_clicked");
  },
};

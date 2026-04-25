import type { BodyId } from './bodies';
import type { ConstellationId } from './constellations';
import type { Locale } from '../i18n/translations';

type AnonymousEventName =
  | 'planet_selected'
  | 'language_changed'
  | 'free_flight_activated'
  | 'constellation_opened'
  | 'play_clicked'
  | 'pause_clicked'
  | 'solar_system_start_clicked';

type AnonymousEventPayload = Readonly<Record<string, string>>;
let analyticsDisabledForSession = false;

const sendEvent = (
  name: AnonymousEventName,
  payload: AnonymousEventPayload = {},
): void => {
  if (typeof window === 'undefined') return;
  if (analyticsDisabledForSession) return;
  void fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
    sendEvent('planet_selected', { body_id: bodyId });
  },
  languageChanged(locale: Locale): void {
    sendEvent('language_changed', { locale });
  },
  freeFlightActivated(): void {
    sendEvent('free_flight_activated');
  },
  constellationOpened(constellationId: ConstellationId): void {
    sendEvent('constellation_opened', { constellation_id: constellationId });
  },
  playbackToggled(wasPlaying: boolean): void {
    sendEvent(wasPlaying ? 'pause_clicked' : 'play_clicked');
  },
  resetToSolarSystemStart(): void {
    sendEvent('solar_system_start_clicked');
  },
};

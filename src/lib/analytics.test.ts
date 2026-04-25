// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { analytics } from './analytics';

describe('analytics client helpers', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('sends language_changed event with locale payload', () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    analytics.languageChanged('en');

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/analytics/event',
      expect.objectContaining({
        method: 'POST',
        keepalive: true,
        body: JSON.stringify({
          name: 'language_changed',
          payload: { locale: 'en' },
        }),
      }),
    );
  });

  it('maps playback toggle state to play/pause analytics events', () => {
    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    analytics.playbackToggled(false);
    analytics.playbackToggled(true);

    const sentNames = fetchSpy.mock.calls.map(([, init]) => {
      const body = JSON.parse(String(init?.body)) as { name: string };
      return body.name;
    });
    expect(sentNames).toEqual(['play_clicked', 'pause_clicked']);
  });
});

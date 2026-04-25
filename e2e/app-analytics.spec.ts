import { expect, test, type Page } from '@playwright/test';

const fastForwardTimeouts = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    const nativeSetTimeout = window.setTimeout.bind(window);
    window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) =>
      nativeSetTimeout(handler, Math.min(timeout ?? 0, 20), ...args)) as typeof window.setTimeout;
  });
};

test.describe('app analytics flows', () => {
  test('tracks play/pause and solar system start buttons', async ({ page }) => {
    await fastForwardTimeouts(page);
    const capturedEventNames: string[] = [];

    await page.route('**/api/**', async (route) => {
      if (route.request().method() === 'POST') {
        const payload = route.request().postDataJSON() as { name: string };
        capturedEventNames.push(payload.name);
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ ok: true }),
      });
    });

    await page.goto('/');
    await page.getByRole('button', { name: 'Start' }).click();
    await page.getByRole('button', { name: 'Play' }).click();
    await page.getByRole('button', { name: 'Pause' }).click();

    expect(capturedEventNames).toContain('solar_system_start_clicked');
    expect(capturedEventNames).toContain('play_clicked');
    expect(capturedEventNames).toContain('pause_clicked');
  });
});

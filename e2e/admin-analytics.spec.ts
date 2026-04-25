import { expect, test } from '@playwright/test';

test('renders analytics summary rows on admin page', async ({ page }) => {
  await page.route('**/api/analytics/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        updatedAt: '2026-04-25T09:00:00.000Z',
        storage: 'local-file',
        byEvent: [
          {
            name: 'language_changed',
            total: 2,
            breakdown: [{ value: 'sv', count: 2 }],
          },
        ],
        byDay: [{ date: '2026-04-25', total: 2 }],
      }),
    });
  });

  await page.goto('/admin/analytics');
  await page.getByLabel('Analytics admin token').fill('test-token');
  await page.getByRole('button', { name: 'Load analytics' }).click();

  await expect(page.getByRole('heading', { name: 'HelioTrip analytics' })).toBeVisible();
  await expect(page.getByText('Storage: Local file fallback')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'By event' })).toBeVisible();
  await expect(page.getByText('No events yet.')).not.toBeVisible();
  await expect(page.getByText('2026-04-25')).toBeVisible();
});

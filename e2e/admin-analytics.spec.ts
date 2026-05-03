import { expect, test } from '@playwright/test';

test('renders analytics summary on admin page after API returns data', async ({
  page,
}) => {
  const today = new Date().toISOString().slice(0, 10);

  await page.route('**/api/analytics/summary', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        updatedAt: `${today}T09:00:00.000Z`,
        storage: 'local-file',
        byEvent: [
          {
            name: 'language_changed',
            total: 2,
            breakdown: [{ value: 'sv', count: 2 }],
          },
        ],
        byDay: [{ date: today, total: 2 }],
      }),
    });
  });

  await page.goto('/admin/analytics?mock_auth=true');

  await expect(
    page.getByRole('heading', { name: 'HelioTrip analytics' }),
  ).toBeVisible();
  await expect(page.getByText('Storage')).toBeVisible();
  await expect(page.getByText('Local file')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'By event' })).toBeVisible();
  await expect(page.getByText('No events yet.')).not.toBeVisible();
  await expect(page.getByText('language_changed')).toBeVisible();
  await expect(page.getByText('2', { exact: true }).first()).toBeVisible();
});

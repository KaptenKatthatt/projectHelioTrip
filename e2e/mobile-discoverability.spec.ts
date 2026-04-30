import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 } });

const bootstrapMobileSv = async (page: Page): Promise<void> => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "heliotrip-preferences",
      JSON.stringify({
        state: { locale: "sv" },
        version: 0,
      }),
    );
  });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Utforska" })).toBeVisible();
};

test("mobile context strip and XP pill behavior", async ({ page }) => {
  await bootstrapMobileSv(page);

  await expect(page.getByText("HelioTrip").first()).toBeVisible();
  await page.getByRole("button", { name: "XP" }).click();
  await expect(page.getByRole("heading", { name: "Uppdrag" })).toBeVisible();
  await page.getByRole("button", { name: "Close panel" }).click();

  await page.getByRole("button", { name: "Utforska" }).click();
  await page.getByRole("button", { name: "Jorden" }).click();
  await expect(page.getByRole("button", { name: "Solsystemet" })).toBeVisible();
  await expect(page.getByText("Jorden").first()).toBeVisible();
});

test("free-flight FAB and more sheet content", async ({ page }) => {
  await bootstrapMobileSv(page);

  const freeFlightFab = page.getByRole("button", { name: "Flyg fritt" });
  await expect(freeFlightFab).toBeVisible();
  await freeFlightFab.dispatchEvent("click");
  await expect(page.getByText("Använd spakarna för att flyga och titta")).toBeVisible();

  await page.getByRole("button", { name: "Mer" }).click();
  const moreSheet = page.getByRole("dialog", { name: "Mer" });
  await expect(moreSheet).toBeVisible();
  await expect(moreSheet.getByRole("button", { name: "Flyg fritt" })).toHaveCount(0);
});

test("stars sheet closes on pick and opens mini-card story", async ({ page }) => {
  await bootstrapMobileSv(page);

  await page.getByRole("button", { name: "Stjärnor" }).click();
  const starsSheet = page.getByRole("dialog", { name: "Stjärnbilder" });
  await expect(starsSheet).toBeVisible();

  await starsSheet.getByRole("button", { name: /Okänd stjärnbild/i }).first().click();
  await expect(starsSheet).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Stjärnbilder" })).toBeVisible();
  const miniCard = page.locator("button", { hasText: "✦" }).first();
  await expect(miniCard).toBeVisible();
  await miniCard.click();
  await expect(page.getByRole("tab", { name: "Berättelse" }).first()).toBeVisible();
});

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
  await freeFlightFab.click();
  await expect(page.getByText("Använd spakarna för att flyga och titta")).toBeVisible();
  const autopilotFab = page.getByRole("button", { name: "Autopilot" });
  await expect(autopilotFab).toBeVisible();
  await autopilotFab.click();
  await expect(page.getByRole("button", { name: "Flyg fritt" })).toBeVisible();

  await page.getByRole("button", { name: "Om appen" }).click();
  const moreSheet = page.getByRole("dialog", { name: "Om HelioTrip" });
  await expect(moreSheet).toBeVisible();
  await expect(moreSheet.getByRole("button", { name: "Flyg fritt" })).toHaveCount(0);
});

test("free-flight FAB is hidden while stars sheet is open", async ({ page }) => {
  await bootstrapMobileSv(page);

  const freeFlightFab = page.getByRole("button", { name: "Flyg fritt" });
  await expect(freeFlightFab).toBeVisible();

  await page.getByRole("button", { name: "Stjärnor" }).click();
  await expect(page.getByRole("dialog", { name: "Stjärnbilder" })).toBeVisible();
  await expect(freeFlightFab).toHaveCount(0);
});

test("constellation sheet: mini-card story and switching selection", async ({ page }) => {
  await bootstrapMobileSv(page);

  const starsTrigger = page.getByRole("button", { name: "Stjärnor" });
  await starsTrigger.click();
  const starsSheet = page.getByRole("dialog", { name: "Stjärnbilder" });
  await expect(starsSheet).toBeVisible();

  await starsSheet.getByRole("button", { name: /Okänd stjärnbild/i }).first().click();
  await expect(starsSheet).toHaveCount(0);

  await expect(page.getByRole("button", { name: "Stjärnbilder" })).toBeVisible();
  const miniCard = page.getByTestId("constellation-mini-card");
  await expect(miniCard).toBeVisible();
  const firstMiniCardText = (await miniCard.textContent()) ?? "";

  await miniCard.click();
  await expect(page.getByRole("tab", { name: "Berättelse" }).first()).toBeVisible();
  await page.keyboard.press("Escape");

  await starsTrigger.click();
  await expect(starsSheet).toBeVisible();
  await starsSheet
    .getByRole("button", { name: /Okänd stjärnbild/i })
    .nth(1)
    .click();
  await expect(starsSheet).toHaveCount(0);

  await expect(miniCard).toBeVisible();
  await expect(page.getByRole("button", { name: "Stjärnbilder" })).toBeVisible();
  const secondMiniCardText = (await miniCard.textContent()) ?? "";
  expect(secondMiniCardText).not.toBe("");
  expect(secondMiniCardText).not.toBe(firstMiniCardText);
});

test("tapping HelioTrip logo resets back to autopilot start view", async ({ page }) => {
  await bootstrapMobileSv(page);

  await page.getByRole("button", { name: "Flyg fritt" }).click();
  await expect(page.getByRole("button", { name: "Autopilot" })).toBeVisible();

  await page.getByRole("button", { name: "HelioTrip" }).click();
  await expect(page.getByRole("button", { name: "Autopilot" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Flyg fritt" })).toBeVisible();
});

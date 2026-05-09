import { expect, test } from "@playwright/test";
import { bootstrapSv, openLabMode } from "./gravity-lab.helpers";

// Viewport-critical Gravity-Lab tests: the small set that *must* run on every
// `playwright.config.ts` viewport project (chromium, lab-mobile, lab-tablet)
// because it asserts the layout-specific entry path, the headline drop
// regression and the layout-specific accordion mount. The bulk of the
// functional surface lives in `gravity-lab.spec.ts` (chromium-only).

test.describe.configure({ timeout: 90_000, mode: "parallel" });

test.describe("Gravitationslabbet (viewport) – smoke", () => {
  test("renders title and default selections", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await expect(lab.getByText("Gravitationslabbet")).toBeVisible();
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Jorden/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(scope.getByTestId("drop-button")).toBeVisible();
  });
});

test.describe("Gravitationslabbet (viewport) – fall mot marken (kritisk)", () => {
  test("drop on Jupiter completes and result card appears", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await expect(scope.getByTestId("drop-button")).toBeVisible();

    await scope.getByTestId("drop-button").click();
    // `reset-button` is the stable "drop in progress or finished" signal;
    // `velocity-readout` is too transient on Jupiter (~1.27 s fall) to assert
    // reliably under parallel-worker load.
    await expect(scope.getByTestId("reset-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });
  });
});

test.describe("Gravitationslabbet (viewport) – ackordeon", () => {
  test("Drop section is open by default", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible();
    const dropToggle = scope.getByRole("button", {
      name: /Gravitationslabbet/,
    });
    await expect(dropToggle).toHaveAttribute("aria-expanded", "true");
  });
});

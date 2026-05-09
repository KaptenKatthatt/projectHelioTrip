import { expect, test } from "@playwright/test";
import {
  bootstrapSv,
  openLabMode,
  setRangeValue,
} from "./gravity-lab.helpers";

// Full Gravity-Lab functional test surface. Runs only on the `chromium`
// project (no `testMatch` override). The three viewport-critical tests
// (smoke, headline drop, accordion default) live in
// `gravity-lab.viewport.spec.ts` and run on every viewport project.
//
// App boot has a ~5 s minimum LoadingScreen gate; drops can take up to
// ~10 s, so the per-test budget is bumped well above the default 30 s.
test.describe.configure({ timeout: 90_000, mode: "parallel" });

// ── Object selection ──────────────────────────────────────────────────────────

test.describe("Gravitationslabbet – objektval", () => {
  test("can cycle through all three objects", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Bil/ }).click();
    await expect(lab.getByRole("button", { name: /Bil/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await lab.getByRole("button", { name: /Elefant/ }).click();
    await expect(lab.getByRole("button", { name: /Elefant/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Bil/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );

    await lab.getByRole("button", { name: /Äpple/ }).click();
    await expect(lab.getByRole("button", { name: /Äpple/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("changing object mid-fall resets to ready", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await scope.getByTestId("drop-button").click();
    // `reset-button` is stable across both `falling` and `impact` phases — a
    // more reliable "drop has started" signal than the brief `velocity-readout`
    // window, which on Jupiter (~1.27 s) can be missed by Playwright polling
    // under parallel-worker load.
    await expect(scope.getByTestId("reset-button")).toBeVisible({
      timeout: 3000,
    });

    await lab.getByRole("button", { name: /Bil/ }).click();

    await expect(scope.getByTestId("drop-button")).toBeVisible({
      timeout: 5000,
    });
    await expect(scope.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(scope.getByTestId("result-card")).toHaveCount(0);
  });
});

// ── Planet selection ──────────────────────────────────────────────────────────

test.describe("Gravitationslabbet – planetval", () => {
  test("can select Jupiter and gravity overlay updates", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await expect(lab.getByRole("button", { name: /Jupiter/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(lab.getByRole("button", { name: /Jorden/ })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    await expect(lab.getByText(/24[.,]\d/)).toBeVisible();
  });

  test("changing planet mid-fall resets to ready", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await scope.getByTestId("drop-button").click();
    // `reset-button` is the stable "drop in progress or finished" signal — see
    // `objektval › changing object mid-fall` for the rationale.
    await expect(scope.getByTestId("reset-button")).toBeVisible({
      timeout: 3000,
    });

    await lab.getByRole("button", { name: /Jupiter/ }).click();

    await expect(scope.getByTestId("drop-button")).toBeVisible({
      timeout: 5000,
    });
    await expect(scope.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(scope.getByTestId("result-card")).toHaveCount(0);
  });
});

// ── The critical drop-to-ground regression suite ─────────────────────────────

test.describe("Gravitationslabbet – fall mot marken (kritisk)", () => {
  test("drop on Earth (default planet) completes and result card appears", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await scope.getByTestId("drop-button").click();
    // `reset-button` is the stable "drop in progress or finished" signal — see
    // `objektval › changing object mid-fall` for the rationale.
    await expect(scope.getByTestId("reset-button")).toBeVisible({
      timeout: 3000,
    });
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });
  });

  test("all three objects complete the drop on Jupiter", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();

    // Inside the loop we use `dispatchEvent("click")` for *every* click: the
    // lab panel's `max-h … overflow-y-auto` wrapper flickers a scrollbar
    // whenever the result card grows the column height, and the impact
    // animations (groundShake, dustCloud, splatBurst, …) keep nearby boxes
    // moving across iterations. Playwright's normal click waits for both
    // "stable" and "scrolling into view if needed" to settle, both of which
    // can hang indefinitely under those conditions. Dispatching a synthetic
    // click directly on the matched element fires React's `onClick` reliably.
    for (const name of [/Äpple/, /Bil/, /Elefant/]) {
      await lab.getByRole("button", { name }).dispatchEvent("click");
      await scope.getByTestId("drop-button").dispatchEvent("click");
      // Generous timeout for parallel-worker dev-server contention; Jupiter
      // fall is ~1.3 s but dev-server stalls can stretch React renders.
      await expect(scope.getByTestId("result-card")).toBeVisible({
        timeout: 12000,
      });
      await scope.getByTestId("reset-button").dispatchEvent("click");
      await expect(scope.getByTestId("drop-button")).toBeVisible({
        timeout: 5000,
      });
    }
  });

  test("result card shows all four stat labels and Galileo fact", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await scope.getByTestId("drop-button").click();
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });

    const card = scope.getByTestId("result-card");
    await expect(card.getByText("Falltid", { exact: true })).toBeVisible();
    await expect(card.getByText("Hastighet vid nedslag")).toBeVisible();
    await expect(card.getByText("Gravitationsstyrka")).toBeVisible();
    // The Galileo fact text below contains the substring "massa", so anchor
    // the label assertion with exact match to avoid a strict-mode collision.
    await expect(card.getByText("Massa", { exact: true })).toBeVisible();
    await expect(card.getByText(/Galileo/)).toBeVisible();
  });

  test("result card shows numerically correct fall time for Jupiter", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await scope.getByTestId("drop-button").click();
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });

    const card = scope.getByTestId("result-card");
    await expect(card.getByText(/1[.,][23]/)).toBeVisible();
  });
});

// ── Reset / multi-drop ───────────────────────────────────────────────────────

test.describe("Gravitationslabbet – återställning", () => {
  test("reset mid-fall returns to ready state", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();
    await scope.getByTestId("drop-button").click();
    // `reset-button` is the stable "drop in progress or finished" signal —
    // see `objektval › changing object mid-fall` for the rationale.
    await expect(scope.getByTestId("reset-button")).toBeVisible({
      timeout: 3000,
    });

    await scope.getByTestId("reset-button").click();

    await expect(scope.getByTestId("drop-button")).toBeVisible({
      timeout: 5000,
    });
    await expect(scope.getByTestId("velocity-readout")).toHaveCount(0);
    await expect(scope.getByTestId("result-card")).toHaveCount(0);
  });

  test("reset after impact allows a second drop", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);
    const lab = scope.getByTestId("gravity-drop-lab");

    await lab.getByRole("button", { name: /Jupiter/ }).click();

    await scope.getByTestId("drop-button").click();
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });

    // `dispatchEvent("click")` — see `all three objects` for the same
    // animation/scrollbar stability issue with the reset button after the
    // result card appears.
    await scope.getByTestId("reset-button").dispatchEvent("click");
    await expect(scope.getByTestId("drop-button")).toBeVisible({
      timeout: 5000,
    });
    await expect(scope.getByTestId("result-card")).toHaveCount(0);

    await scope.getByTestId("drop-button").click();
    await expect(scope.getByTestId("result-card")).toBeVisible({
      timeout: 12000,
    });
  });
});

// ── Accordion toggle ─────────────────────────────────────────────────────────

test.describe("Gravitationslabbet – ackordeon", () => {
  test("toggling to Orbit section collapses Drop and shows slider", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    const orbitToggle = scope.getByRole("button", { name: /Banmekanik/ });
    await orbitToggle.click();
    await expect(orbitToggle).toHaveAttribute("aria-expanded", "true");

    await expect(scope.getByRole("slider")).toBeVisible({ timeout: 5000 });
    await expect(scope.getByText(/Solens Massa/)).toBeVisible();
  });

  test("toggling back to Drop re-expands GravityDropLab", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await scope.getByRole("button", { name: /Banmekanik/ }).click();
    await expect(scope.getByRole("slider")).toBeVisible({ timeout: 5000 });

    await scope.getByRole("button", { name: /Gravitationslabbet/ }).click();
    await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible({
      timeout: 5000,
    });
  });
});

// ── Orbit controls ───────────────────────────────────────────────────────────

test.describe("Gravitationslabbet – omloppskontroller", () => {
  test("sun mass slider starts at 1x and label reflects value", async ({
    page,
  }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await scope.getByRole("button", { name: /Banmekanik/ }).click();
    await expect(scope.getByRole("slider")).toBeVisible({ timeout: 5000 });

    await expect(scope.getByText("Solens Massa: 1.0x")).toBeVisible();
    await expect(scope.getByRole("slider")).toHaveValue("1");
  });

  test("moving slider updates the label", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await scope.getByRole("button", { name: /Banmekanik/ }).click();
    const slider = scope.getByRole("slider");
    await expect(slider).toBeVisible({ timeout: 5000 });

    await setRangeValue(slider, "3");
    await expect(scope.getByText("Solens Massa: 3.0x")).toBeVisible();
  });

  test("reset button restores slider to 1x", async ({ page }) => {
    await bootstrapSv(page);
    const scope = await openLabMode(page);

    await scope.getByRole("button", { name: /Banmekanik/ }).click();
    const slider = scope.getByRole("slider");
    await expect(slider).toBeVisible({ timeout: 5000 });

    await setRangeValue(slider, "5");
    await expect(scope.getByText("Solens Massa: 5.0x")).toBeVisible();

    await scope.getByRole("button", { name: "Återställ" }).click();
    await expect(scope.getByText("Solens Massa: 1.0x")).toBeVisible({
      timeout: 5000,
    });
  });
});

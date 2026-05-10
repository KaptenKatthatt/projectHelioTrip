import { expect, type Locator, type Page } from "@playwright/test";

/**
 * Injects Swedish locale + the E2E bypass flag (`window.__HELIOTRIP_E2E__`)
 * read by `App.tsx` to collapse `MIN_LOADING_MS` / `SCENE_READY_FALLBACK_MS`
 * to zero, navigates to the app root and waits for the `LoadingScreen`
 * overlay to dismiss. The overlay (`role="status"`, `data-dismiss="false"`)
 * has `pointer-events: none` only after it gets `data-dismiss="true"`, so any
 * earlier click is dropped by the busy overlay sitting on top of the HUD.
 * With the E2E flag the gates collapse instantly, but the opacity transition
 * (~0.72 s) still runs. We wait up to 15 s as a safety net.
 */
export async function bootstrapSv(page: Page): Promise<void> {
  await page.addInitScript(() => {
    (window as unknown as { __HELIOTRIP_E2E__: boolean }).__HELIOTRIP_E2E__ =
      true;
    localStorage.setItem(
      "heliotrip-preferences",
      JSON.stringify({ state: { locale: "sv" }, version: 0 }),
    );
  });
  await page.goto("/");
  await page.waitForFunction(
    () =>
      document.querySelector('[role="status"][data-dismiss="false"]') === null,
    null,
    { timeout: 15000 },
  );
}

/**
 * Sets a range input's value through the native setter and dispatches an
 * `input` event so React picks it up. Playwright's `fill()` is unreliable on
 * range inputs that use controlled React state.
 */
export async function setRangeValue(
  slider: Locator,
  value: string,
): Promise<void> {
  await slider.evaluate((el, v) => {
    const input = el as HTMLInputElement;
    const setter = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;
    setter?.call(input, v);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}

/**
 * Scope all subsequent queries to the *active* Lab UI container.
 *
 * On mobile (<640 px) lab UI lives only in the BottomSheet opened from the
 * bottom nav, so we scope queries to that dialog when it is open.
 *
 * On tablet/desktop (≥640 px) there is no lab dialog — `LabOverlay` is a
 * fixed panel, so we scope to the page body.
 */
export async function getLabScope(page: Page): Promise<Locator> {
  const dialog = page.getByRole("dialog", { name: "Labb" });
  if ((await dialog.count()) > 0) return dialog;
  return page.locator("body");
}

/**
 * Enters Lab mode and returns a Locator scoping all queries to the active
 * Lab UI container (mobile dialog or desktop/tablet side panel).
 *
 * Desktop/tablet (≥640px): `GameModeSwitcher` renders a role="radio" button
 * labelled "Labb". Mobile (<640px): `MobileBottomNav` renders a role="button"
 * labelled "Labb" that opens a `BottomSheet`.
 */
export async function openLabMode(page: Page): Promise<Locator> {
  const radio = page.getByRole("radio", { name: "Labb" });
  const trigger =
    (await radio.count()) > 0
      ? radio
      : page.getByRole("button", { name: "Labb" });
  await trigger.click();
  const scope = await getLabScope(page);
  await expect(scope.getByTestId("gravity-drop-lab")).toBeVisible({
    timeout: 5000,
  });
  return scope;
}

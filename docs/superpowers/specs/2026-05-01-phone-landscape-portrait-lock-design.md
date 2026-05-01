# Design: Phone landscape — virtual portrait stage + rotate prompt

**Date:** 2026-05-01  
**Status:** Draft for review  
**Goal:** On **phones only**, when the device is in **physical landscape**, keep the **game and HUD laid out as in portrait** (same logical width/height relationship as upright use), and show a **full-viewport overlay** that blocks interaction and asks the user to rotate back to portrait.

**Non-goals:**

- Locking OS orientation (manifest / Screen Orientation API) — unreliable in mobile Safari and unnecessary if UX is correct.
- Changing behavior on **desktop** or **tablet** — they may use landscape freely; large shortest-edge viewports are considered tablet-class for this feature.

---

## 1. Activation rule

Show the portrait-lock experience when **all** of the following hold:

1. **Handheld touch context** — `matchesPortraitLockTouchDevice()` in `src/lib/portraitStage.ts`: **`(hover: none) and (pointer: coarse)`** (typical phones) **or** **`(hover: none) and (pointer: fine)`** plus the same **landscape + max-height + max-width** bounds used for Pixel-class Android in `mobileLayoutMedia.ts`. This **must not** use `matchesMobileLayout()` alone: its `(max-width: 639px)` branch would lock **mouse desktops** in a narrow landscape window (e.g. 600×500).
2. **Physical landscape** — `(orientation: landscape)` via `matchMedia`, with `resize` / `orientationchange` listeners so the flag updates immediately after rotation.
3. **Phone guard (exclude tablets)** — `Math.min(window.innerWidth, window.innerHeight) <= PHONE_MAX_SHORT_EDGE_PX`.

**Constant:** `PHONE_MAX_SHORT_EDGE_PX` lives in `src/lib/portraitStage.ts`. **Recommended initial value: `600`.** Rationale: typical phones keep the shorter viewport edge well below 600px even in landscape; tablets usually have a shorter edge ≥ ~600–744px, so they stay unlocked in landscape while still using desktop/tablet HUD per existing breakpoints.

**Edge cases:**

- If a future device blurs the threshold, tune only the constant; do not fork layout logic.
- Fine-pointer phones in landscape stay covered by the second `matchMedia` clause; `hover: none` keeps mouse desktops out of that path.

---

## 2. UX and visuals

### 2.1 Virtual portrait “stage”

While the lock is active:

- Compute **logical portrait size** from the current viewport:  
  `logicalW = min(innerWidth, innerHeight)`, `logicalH = max(innerWidth, innerHeight)`  
  (same aspect ratio as if the phone were held upright).

- Fit a **centered rectangle** with that aspect ratio **inside** the physical landscape viewport (letterboxing on the left/right). The **3D canvas and HUD** both live inside this rectangle so composition matches portrait mode (`width <= height` from the renderer’s point of view).

- **Background** outside the letterbox: use existing space-dark / app background tokens from the design system (no new ad-hoc colors outside `DESIGN_SYSTEM.md`).

### 2.2 Rotate-back overlay

- **Coverage:** `fixed inset-0`, **above** the stage and HUD (`z-index` higher than HUD’s layer, e.g. HUD stays `z-10` → overlay `z-20` or as needed).

- **Backdrop:** Semi-opaque dark scrim (token-consistent, e.g. space-dark with alpha).

- **Content:** Lucide icon suggesting rotate device (e.g. `Smartphone` with visual affordance or a dedicated rotate metaphor per design system icon usage — standard size `h-4 w-4` where applicable; this hero icon may use a slightly larger size if the design system allows for empty states; if not, stay at `h-4 w-4`).

- **Copy (i18n):** Swedish and English strings, e.g. meaning: *The game only works in portrait — please rotate your phone back.*

- **Accessibility:** Meaningful text in DOM; icon decorative or paired with `aria-hidden` if redundant; consider `aria-live="polite"` on the message container.

- **Pointer events:** Overlay is **`pointer-events-auto`** so no taps reach the HUD or canvas underneath. (HUD root remains `pointer-events-none` with interactive children `pointer-events-auto`; the overlay must sit above all of that.)

### 2.3 Loading screen

`LoadingScreen` stays a **full-viewport** overlay (`fixed`, high `z-index`) so boot UX is unchanged. The **scene + HUD** mount inside the **portrait stage** as soon as the lock conditions are met, including **while the loading overlay is visible**, so WebGL initializes at the **letterboxed stage size** from the first frame — not at full landscape and then resizing (see §2.4).

### 2.4 First-frame stage sizing (polish)

**Goal:** Avoid initializing the WebGL canvas at **full landscape** viewport and then **jumping** to the letterboxed portrait stage when the user opened the app already in landscape (or rotated during the loading gate).

**Approach:** When the portrait lock is active, **`App`** wraps `Scene` + `HUD` in the computed stage from the **first render** where those conditions hold — not only after `LoadingScreen` unmounts. `LoadingScreen` remains an independent full-screen sibling; it does not need to embed the stage. This is **polish** for a stable aspect and resize story; it is **not** required for correct asset loading.

---

## 3. Architecture

### 3.1 Hook

- **`usePhoneLandscapePortraitLock()`** (name indicative): returns whether the lock is active **and** the stage pixel width/height (the fitted rectangle), updated on resize/orientation.

- Pure functions for testability: e.g. `computePortraitStageSize(viewportW, viewportH)` → `{ width, height }`.

### 3.2 Layout integration (`App.tsx`)

- When lock is **inactive:** keep current structure (Scene + HUD as siblings under `body` behavior — unchanged).

- When lock is **active:**

  - **Outer shell:** `fixed inset-0 flex items-center justify-center` (centers the stage).

  - **Stage:** `position: relative`, explicit `width` / `height` from the hook (px). Contains:

    1. **Scene** — Canvas must fill the stage (wrapper `div` with `width: 100%; height: 100%` around R3F `Canvas` if not already present).

    2. **HUD** — must use **`absolute inset-0`** (or equivalent) **relative to the stage**, not `fixed` to the viewport, so controls align with the letterboxed portrait frame.

- **Overlay** — sibling rendered after stage (or portal) with higher `z-index`, still under the same `App` tree.

**HUD change:** Introduce a prop or small variant, e.g. `frame: 'viewport' | 'stage'`, default `'viewport'` (`fixed inset-0`). When `'stage'`, use `absolute inset-0` on the root HUD container. No change to HUD internals beyond the root positioning class.

### 3.3 R3F / resize

- `ViewportResizeSync` and canvas sizing must read the **stage** dimensions, not the full landscape viewport, so `portraitCanvas` (`width <= height`) and planet framing stay correct.

- Verify `orientationchange` debouncing still works; stage hook should align timing if needed.

---

## 4. Internationalization

Add keys under `ui` in `translations.ts`, `sv.ts`, and `en.ts`, e.g.:

- `ui.portraitOnly.title` (short)
- `ui.portraitOnly.body` (full sentence matching product tone)

Implementation copy can follow the user’s Swedish wording; English equivalent should be concise and polite.

---

## 5. Testing

- **Manual:** iOS Safari + Android Chrome — rotate to landscape on a phone; confirm letterboxed portrait stage, overlay visible, no interaction with scene/HUD; rotate back — lock disappears and layout matches normal portrait.

- **Manual:** Tablet / desktop — landscape does **not** trigger lock.

- **Automated (optional follow-up):** Playwright viewport with landscape dimensions and `matchesPortraitLockTouchDevice` / coarse-pointer `matchMedia` stubbed if tests need stability without real devices.

---

## 6. Spec self-review

| Check        | Result |
| ------------ | ------ |
| Placeholders | None. |
| Consistency  | Stage sizing uses min/max viewport; aligns with existing `portraitCanvas` checks. |
| Scope        | Single feature: phone landscape only; no manifest/API orientation lock. |
| Ambiguity    | Threshold `PHONE_MAX_SHORT_EDGE_PX = 600` is explicit; tune in one place. |

---

## 7. Approval

After product review of this document, next step is an implementation plan (`writing-plans` skill), then implementation.

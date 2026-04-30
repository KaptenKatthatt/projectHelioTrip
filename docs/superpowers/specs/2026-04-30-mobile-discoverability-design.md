# Mobile Discoverability — Design Spec
**Date:** 2026-04-30  
**Status:** Approved

## Problem

Four specific UX gaps on mobile where features are hard or impossible to find:

1. **Free flight hidden** — rocket mode buried inside the "More" bottom sheet.
2. **Constellation view obscured** — selecting a constellation from the Stars sheet hides the 3D view behind the open sheet.
3. **No "back to start" button** — once you've traveled to a planet there's no obvious way to return to the solar system overview.
4. **XP/Progress hidden** — only accessible by opening the Challenge tab sheet.

## Chosen Approach: Context Strip + FAB

A persistent context strip at the top of the mobile HUD that adapts to the current state, combined with a floating action button for free flight.

### Why this approach

- One fixed region handles three problems (back navigation, location awareness, XP) without adding new floating layers.
- The strip never competes with the 3D scene — it sits above it, outside the viewport area the user interacts with.
- FAB is a well-understood mobile pattern for the primary mode-switch action.

---

## Design

### 1. Context Strip

A thin bar pinned to the top of the mobile HUD (above the 3D scene, below the status bar). Always visible. Content adapts to three states:

| State | Left | Center | Right |
|---|---|---|---|
| **Default** (solar system, no body focused) | `HelioTrip` (tappable — resets camera to solar system overview) | — | `240 XP · Stjärntittare` |
| **Planet focused** (traveling or orbiting) | `← Solsystemet` button | Planet name | `240 XP` |
| **Constellation focused** (after picking from Stars sheet) | `← Stjärnbilder` button | Constellation name | `240 XP` |

**Left slot behavior:**
- Default state: "HelioTrip" label acts as a home button — tapping it resets the camera to the full solar system overview. Same as navigating to the Sun and zooming out.
- Planet/constellation state: a back button that reverses the last navigation action (deselects the planet / reopens the Stars sheet).

**Right slot:** Always shows current XP and title. Tapping it opens the Challenge (Progress) sheet.

**Visual:** Dark semi-transparent background (`bg-black/60 backdrop-blur`), 1px bottom border (`border-white/8`). Matches existing HUD panel style. Height ~28–32 px.

---

### 2. Free Flight FAB

A circular floating action button (36×36 px, `rounded-full`) anchored to `bottom-right` of the scene, above the bottom nav. Shows a rocket icon.

- **Visible:** only when Explore game mode is active and the user is not in free flight.
- **Hidden:** in Learn and Challenge modes (free flight is irrelevant there), and during active free flight (replaced by the existing exit controls).
- **Removed from:** the "More" bottom sheet.
- Matches the existing `pointer-events-auto` pattern for HUD interactive elements.

---

### 3. Constellation Story Card

When the user selects a constellation from the Stars bottom sheet:

1. The bottom sheet **auto-closes**.
2. The context strip updates to show `← Stjärnbilder` + constellation name.
3. A **mini story card** glides up from the bottom of the scene (above the bottom nav).

**Mini card anatomy:**
- Left: constellation name (`✦ Orion`) + one-line preview of the story text.
- Right: a circular button with an upward triangle `▲` (indigo tint, `border border-indigo-500/45 bg-indigo-500/15`).
- The entire card is tappable.

**Tap → expand:**  
Tapping the card (or the ▲ button) expands it upward into a half-height sheet with three tabs:
- **Berättelse** — the narrative story text
- **Hitta den** — how to find the constellation in the sky
- **Kul fakta** — a fun fact

Tapping `← Stjärnbilder` in the context strip dismisses the card and reopens the Stars sheet.

---

### 4. What stays the same

- Bottom nav tabs: Explore / Stars / Learn / Challenge / More — no structural changes.
- "More" sheet keeps: Language toggle, About dialog. Free flight is removed from it.
- Existing planet info bottom sheet (opens via Learn tab or planet selection) is unchanged.
- Desktop layout is not touched by this spec.

---

## Component map

| Change | Component |
|---|---|
| New context strip | New molecule: `MobileContextStrip` |
| Strip state logic | `HudTemplate` or `HudDetailRegion` — reads `activeBody`, `selectedConstellation`, `xp`, `title` |
| FAB | New atom or inline in `HudPrimaryNavRegion` (mobile branch) |
| Constellation auto-close + mini card | `HudDetailRegion` — Stars sheet `onPick` triggers close + card state |
| Mini story card + expand | New molecule: `ConstellationMiniCard` |
| Expanded constellation sheet | Reuses existing `ConstellationStoryCard` content inside a `BottomSheet` or expandable panel |
| Remove rocket from More sheet | `HudDetailRegion` — remove `FlightModeToggle` from "more" sheet |

---

## Out of scope

- iPad / tablet layout (separate spec).
- Desktop layout changes.
- Any changes to the Learn or Challenge tab content.
- Onboarding or tooltips for new UI elements.

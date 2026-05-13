## 2024-05-07 - Add focus indicators to HUD icon buttons
**Learning:** Found that base HUD icon buttons (`HudIconButton` and `HudPanelToggleButton`) lacked keyboard focus styles, making them invisible to keyboard navigators despite having ARIA labels.
**Action:** Always include `focus-visible` styles (`focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`) on custom buttons to ensure keyboard accessibility matches mouse hover states.
## 2023-10-27 - Custom Modal and Carousel Keyboard Navigation
**Learning:** Custom modals/carousels (like the Scrapbook component viewer) often lack basic keyboard accessibility (Escape to close, ArrowLeft/ArrowRight to navigate) as they heavily rely on pointer events and icon buttons.
**Action:** Always ensure that custom modals handle 'Escape' to dismiss, full-screen carousels handle arrow keys for next/prev operations, and icon-only buttons include 'aria-label's to be screen-reader accessible.
## 2024-05-13 - Scrapbook Component Keyboard Focus Visibility
**Learning:** Verified that complex interactive components like `ScrapbookFullscreenViewer` and image grids like `ScrapbookGrid` often miss custom `focus-visible` styling since they utilize custom UI buttons built on raw HTML elements with utility classes rather than standard button components. This hides keyboard navigation focus states.
**Action:** Always ensure any interactable element mapped as a `button` in full-screen viewers, modals, and image grids explicitely specifies `focus:outline-none focus-visible:ring-2 focus-visible:ring-<color>` classes so that keyboard users can visually track their current position on the screen.

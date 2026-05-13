## 2024-05-07 - Add focus indicators to HUD icon buttons
**Learning:** Found that base HUD icon buttons (`HudIconButton` and `HudPanelToggleButton`) lacked keyboard focus styles, making them invisible to keyboard navigators despite having ARIA labels.
**Action:** Always include `focus-visible` styles (`focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`) on custom buttons to ensure keyboard accessibility matches mouse hover states.
## 2023-10-27 - Custom Modal and Carousel Keyboard Navigation
**Learning:** Custom modals/carousels (like the Scrapbook component viewer) often lack basic keyboard accessibility (Escape to close, ArrowLeft/ArrowRight to navigate) as they heavily rely on pointer events and icon buttons.
**Action:** Always ensure that custom modals handle 'Escape' to dismiss, full-screen carousels handle arrow keys for next/prev operations, and icon-only buttons include 'aria-label's to be screen-reader accessible.
## 2026-05-12 - Focus indicators for photo and scrapbook tools
**Learning:** Found that custom-styled icon buttons inside the Scrapbook viewer and Camera tool lacked keyboard focus indicators, making them completely inaccessible for keyboard navigators, similar to previous findings with base HUD buttons.
**Action:** Ensure all interactive elements, especially icon-only buttons or those with complex custom styles, always include `focus-visible` utility classes (e.g., `focus-visible:ring-2 focus-visible:ring-white/40`) to match pointer hover states and guarantee accessibility for all users.

## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.

## 2024-06-25 - Focus-Visible Utility Usage in Action Components
**Learning:** We identified a pattern where many interactive custom molecules in the app (like `GameModeSwitcher`, `MobileContextStrip`, `FlightModeToggle`) omitted `focus-visible` styles, leading to poor keyboard accessibility without mouse usage. Relying on default browser outlines across different browsers can produce inconsistent results on dark mode layouts.
**Action:** When adding or refactoring buttons (specifically custom buttons not utilizing standard UI library components), always verify the inclusion of Tailwind's `focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40` to maintain a consistent keyboard focus state globally. Additionally, always explicitly add a `title` explaining disabled states if `disabled` is used conditionally on actionable toggles.

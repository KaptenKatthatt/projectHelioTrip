## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.
## 2026-06-13 - Icon Accessibility in Icon-Only Buttons
**Learning:** When using icon-only buttons with `aria-label`, any inner SVGs or icon components (like those from `lucide-react`) must have `aria-hidden="true"` to prevent redundant or confusing screen reader announcements.
**Action:** Always verify that inner icons are hidden from screen readers when the parent interactive element already provides an accessible name via `aria-label`.

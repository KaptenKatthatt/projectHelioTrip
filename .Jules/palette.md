## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.

## 2024-06-22 - Hide decorative SVGs from Screen Readers
**Learning:** Decorative graphical elements like `svg` elements that serve as icons (especially within labeled buttons or pure visual empty states) can cause unnecessary noise for screen reader users if left exposed.
**Action:** Always add `aria-hidden="true"` to purely decorative SVG elements or icons to ensure a clean, understandable experience for assistive technologies.

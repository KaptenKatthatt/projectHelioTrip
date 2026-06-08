## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.

## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.
## 2026-06-23 - Added missing focus-visible styling to interface elements
**Learning:** Keyboard accessibility and visual focus indicators can be easily missed on custom interface buttons even when standard accessibility tags (like ARIA attributes) are present. Many buttons lacked the `focus-visible:ring` utility classes to show an explicit highlight ring when focused via keyboard navigation.
**Action:** Always include `focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40` to custom interactive elements to ensure they provide proper visual feedback during keyboard navigation.

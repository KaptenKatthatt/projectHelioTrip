## 2024-06-08 - Accessible Dialogs in Scrapbook
**Learning:** Full-screen overlays and modal components (like the Scrapbook and ScrapbookFullscreenViewer) must be explicitly marked as dialogs for screen readers using `role="dialog"` and `aria-modal="true"`. They also need an accessible name via `aria-label` or `aria-labelledby`.
**Action:** When implementing custom modals, carousels, or full-screen overlay components, always ensure the root container has `role="dialog"`, `aria-modal="true"`, and a properly configured accessible name.
## 2025-02-12 - Focus Visible Styles for Keyboard Navigation
**Learning:** Many interactive components (like buttons in TimePlaybackControls, MissionCard, and QuizOverlay) lack proper keyboard focus indicators. The project's design system uses a specific pattern for focus states that should be applied consistently.
**Action:** When adding interactive elements, always include the standard focus visible styles to ensure keyboard accessibility: `focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40`.

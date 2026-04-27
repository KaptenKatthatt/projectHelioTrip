# HelioTrip — Claude Code Instructions

## Mandatory reading before any UI work

When creating, editing, or reviewing any UI component:

1. Read `DESIGN_SYSTEM.md` — it defines every button style, color token, typography scale, spacing rule, and component inventory. Match existing patterns exactly. Do not invent new visual styles.
2. Read `AGENT_REFERENCE.md` — it defines product goals, interaction requirements, and technical guidelines.

## Key rules

- **UI first, then code**: before writing a new component, check the component inventory in `DESIGN_SYSTEM.md` section 9 — an existing component may already solve the problem.
- **No new design tokens**: do not introduce new background colors, border radii, or font weights not listed in `DESIGN_SYSTEM.md`.
- **Match the button variant**: read section 4 of `DESIGN_SYSTEM.md` to find the correct button class combination. Do not write ad-hoc button styles.
- **Pointer events**: the HUD is `pointer-events-none` — every interactive element needs `pointer-events-auto` on itself.
- **Mobile layout**: use `useIsMobileLayout()` hook, not raw Tailwind breakpoints, for layout switching.
- **Code comments**: always in English (see `AGENT_REFERENCE.md` section 5).
- **State**: use Zustand (`useStore`), not React Context, for global state.
- **Icons**: Lucide only. Standard size `h-4 w-4`, always with `aria-label` on icon-only buttons.

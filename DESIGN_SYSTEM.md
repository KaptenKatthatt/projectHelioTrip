# HelioTrip Design System

This document is the authoritative reference for all UI decisions in HelioTrip.
**Before creating any new UI element, read the relevant section here and match the existing patterns exactly.**

---

## 1. Foundation

### Color scheme
The app is always dark. All color values are Tailwind opacity modifiers on `white` or named palette colors — never raw hex except in `index.css`.

- **Base background**: `#05060a` (set in `index.css`)
- **Base text**: `#e6e6f0` (set in `index.css`)
- **Surface**: `bg-black/40` + `backdrop-blur-md` — the standard HUD surface
- **Border**: `border border-white/10` on every panel and card

### Accent colors
| Role | Classes |
|------|---------|
| Success / achievement / completed | `emerald-300` family: `bg-emerald-300/10`, `border-emerald-300/30`, `text-emerald-100`, `text-emerald-200` |
| Active constellation / highlight | `cyan-300` family: `bg-cyan-300/20`, `border-cyan-200/60`, `text-cyan-100` |
| Range slider thumb | `bg-[#c7d2fe]` border `border-[#6366f1]` (indigo) — only in `index.css` |

---

## 2. Typography

Every text token below is used verbatim in the codebase. Match them exactly.

| Role | Classes |
|------|---------|
| App title | `text-base font-semibold tracking-tight sm:text-lg` |
| Panel heading (large) | `text-base font-semibold tracking-tight text-white` |
| Panel heading (medium) | `truncate text-lg font-semibold tracking-tight text-white` |
| Eyebrow / section label | `text-[10px] font-medium uppercase tracking-[0.2em] text-white/45` |
| Body text | `text-sm text-white/70` or `text-white/80` |
| Secondary text | `text-xs text-white/55` |
| Muted text | `text-xs text-white/45` |
| Monospaced counter | `font-mono text-[11px] text-white/55` or `font-mono text-sm tabular-nums text-white/85` |
| List item (planet row) | `text-sm text-white/70` → active: `text-white` |
| List item (child/moon) | `text-xs text-white/55` → active: `text-white` |
| Small action text | `text-[11px] font-medium text-white/70` |
| Ghost/dismiss text | `text-[11px] font-medium uppercase tracking-wide text-white/55` |

**Fonts**: `font-sans` = Inter (set in `@theme`). `font-mono` = JetBrains Mono / Consolas.

---

## 3. Surfaces and Panels

All panels share the same glass-morphism base. Padding varies by context.

| Variant | Classes |
|---------|---------|
| Standard panel | `rounded-2xl border border-white/10 bg-black/40 p-4 sm:p-5 backdrop-blur-md` |
| Compact panel | `rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md` |
| Tight panel (collapsed header) | `rounded-2xl border border-white/10 bg-black/40 p-2.5 backdrop-blur-md` |
| Navigation panel | `rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-md` |

**Never** use a different border radius, background opacity, or blur value on a new panel without a very strong reason.

---

## 4. Buttons

### 4a. Icon-only button (`HudIconButton` component)
Use `HudIconButton` for all standalone icon buttons. Do not write a custom button element when this component fits.

```tsx
<HudIconButton label="Descriptive label" icon={<SomeIcon className="h-4 w-4" />} />
```

Underlying classes: `inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white`

### 4b. Text + icon button (ghost/outline)
Used for mode toggles and actions that need a label next to an icon.

```
flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-white/10
disabled: disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-black/40
```

### 4c. Pill action button (primary action, rounded-full)
Used for the "Start" button and similar prominent single actions.

```
flex h-10 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-white transition hover:bg-white/15
```

### 4d. Circle icon button (play/pause style)
```
flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15
disabled: disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5
```

### 4e. Segment control (tab group)
Wrapper:
```
flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1
```
Inactive tab:
```
rounded-lg px-2 py-1 text-[11px] font-medium tracking-wide text-white/60 hover:text-white hover:bg-white/10
```
Active tab:
```
rounded-lg px-2 py-1 text-[11px] font-medium tracking-wide bg-white text-black
```
Compact variant: `px-2 py-1 text-[11px]`. Standard variant: `px-3 py-1.5 text-xs`.

### 4f. List row button (navigation item)
Planet row (top-level):
```
inactive: flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition
active:   flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm bg-white/15 text-white transition
```
Child/moon row (indented):
```
inactive: group relative flex items-center gap-2 rounded-lg py-1 pr-2.5 pl-6 text-left text-xs text-white/55 hover:bg-white/10 hover:text-white/90 transition
active:   group relative flex items-center gap-2 rounded-lg py-1 pr-2.5 pl-6 text-left text-xs bg-white/15 text-white transition
```

### 4g. Accordion section header
```
inactive: flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] text-white/45 hover:bg-white/8 hover:text-white/70 transition
active:   flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left text-[10px] font-medium uppercase tracking-[0.2em] bg-white/12 text-white/85 transition
```

### 4h. Small secondary action button
```
rounded-md border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/70 transition hover:bg-white/15 hover:text-white
```

### 4i. Ghost/dismiss button
```
rounded-md border border-white/10 bg-transparent px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white/55 transition hover:bg-white/10 hover:text-white/85
```

### Disabled state (all buttons)
```
disabled:cursor-not-allowed disabled:opacity-40
```
On hover-state buttons, also add: `disabled:hover:bg-[original-bg]` to suppress hover.

---

## 5. Badges and Status Indicators

### Success / completed badge
```
rounded-md border border-emerald-300/40 bg-emerald-300/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-200
```

### Achievement chip (in lists)
```
rounded-md border border-emerald-300/30 bg-emerald-300/10 px-1.5 py-0.5 text-[11px] text-emerald-100
```

### Constellation active badge
```
rounded-md border border-cyan-200/60 bg-cyan-300/20 text-cyan-100 px-1.5 py-0.5 text-[10px] leading-none
```

### Toast / floating notification
```
rounded-full border border-emerald-300/40 bg-emerald-300/15 px-4 py-2 text-sm font-medium text-emerald-100 shadow-lg backdrop-blur-md
```

---

## 6. Progress and Data Visualization

### Progress bar
```tsx
<div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
  <div
    className="h-full rounded-full bg-emerald-300/80 transition-[width]"
    style={{ width: `${percent}%` }}
  />
</div>
```

### Step dot indicator
```
done:    mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-emerald-300
current: mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-white
future:  mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full bg-white/30
```

### Planet color dot
Large (planet rows): `h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-white/20` with `style={{ backgroundColor: body.color }}`
Small (moon rows): `h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-white/20` with `style={{ backgroundColor: body.color }}`

Always use the `color` field from the body definition and `ring-1 ring-white/20` — never hardcode a color.

---

## 7. Spacing System

| Context | Classes |
|---------|---------|
| Panel outer gap | `gap-3` (between HUD panels) or `gap-6 sm:gap-6` |
| Inner section gap | `gap-2` |
| Tight list gap | `gap-1` or `gap-0.5` |
| Content within card | `mt-2` after eyebrow, `mt-3` after heading block |

**Scrollable panels** always add `overflow-y-auto pr-1` to compensate for scrollbar.

---

## 8. Layout and Pointer Events

The HUD is a `pointer-events-none fixed inset-0` container. Every interactive element must have `pointer-events-auto` on itself or a parent.

```tsx
// Panel container — non-interactive wrapper
<div className="pointer-events-none fixed inset-0 z-10 flex flex-col justify-between p-3 sm:p-5">
  // Interactive element must opt in
  <div className="pointer-events-auto">...</div>
</div>
```

Mobile layout breakpoint is handled by `useIsMobileLayout()` hook. Always use this hook — never use `sm:` breakpoints alone for layout decisions.

---

## 9. Component Inventory

Before building a new component, check if an existing one already solves the problem:

| Component | Use for |
|-----------|---------|
| `HudIconButton` | Any icon-only action button in the HUD |
| `HudPanelToggleButton` | Expand/collapse toggle (`+` / `-`) for panels |
| `CollapsibleHudPanel` | Any panel that can be collapsed/expanded |
| `GameModeSwitcher` | The Explore/Learn/Challenge mode selector |
| `FlightModeToggle` | The cinematic/free-flight toggle |
| `NavigationAccordion` | The planets + constellations accordion menu |
| `PlanetSelector` | Scrollable list of planets and moons |
| `TimePlaybackControls` | Play/pause + speed presets + reset |
| `MissionCard` | Active mission display or mission picker |
| `ProgressPanel` | Visited bodies count + achievement list |
| `AchievementToast` | Floating achievement unlock notification |

---

## 10. Do's and Don'ts

**Do:**
- Use `rounded-2xl` for panels and cards, `rounded-xl` or `rounded-lg` for buttons, `rounded-full` for pills and circles, `rounded-md` for badges
- Use `text-white/45` for eyebrow labels, not `text-white/40` or `text-white/50`
- Use `bg-white/10` for hover backgrounds on list rows
- Use `bg-white/15` for selected/active state on list rows
- Add `transition` to every interactive element
- Use Lucide icons with `className="h-4 w-4"` for standard size, `h-5 w-5` for slightly larger
- Write `aria-label` on every icon button

**Don't:**
- Introduce new background colors (no `bg-gray-*`, `bg-slate-*`, `bg-zinc-*`, etc.)
- Use `shadow-*` except on toasts/floating elements (`shadow-lg`)
- Use `font-bold` — use `font-semibold` or `font-medium`
- Create a new panel style instead of using one of the four surface variants in section 3
- Hardcode pixel values in `style={{}}` for colors — use body.color from the data layer
- Skip `backdrop-blur-md` on any new panel that uses `bg-black/40`

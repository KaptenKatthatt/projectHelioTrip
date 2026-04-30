# Plan: Desktop & iPad UI Redesign (Pedagogical Edition)

## Objective
Refine the desktop and iPad interface to match the "Mission Control" aesthetic, while making the new learning and game features prominent and inviting. The UI should feel like a high-tech "Research Station" that encourages exploration and rewards curiosity.

## Key Changes

### 1. New Component: `DesktopControlPill`
A floating, centered hub at the bottom for global state management.
- **Content**: `TimePlaybackControls` + `GameModeSwitcher` + `FlightModeToggle` + `AboutDialog`.
- **Style**: `rounded-full`, `bg-black/60`, `backdrop-blur-xl`, `border border-white/10`.
- **Position**: `fixed bottom-6 left-1/2 -translate-x-1/2`.
- **Visual Feedback**: Subtly changes its glow or border color based on the active `gameMode` (e.g., Emerald for Learn/Challenge).

### 2. Left Side: The Navigator
- **`NavigationAccordion`** transforms into a semantic side-rail.
- **Explore Mode**: Standard list of planets and constellations.
- **Learn Mode**: Switches to a "Mission Path" view, showing current progress through a learning module (e.g., "Water Hunt") with unlockable nodes.

### 3. Right Side: Learning & Info Hub
Consolidates all active information into a vertical stack.
- **`PlanetPanel` (Tabbed)**: 
  - **[Facts]**: Scientific data (distances, orbital period).
  - **[Learn More]**: Pedagogical cards with emojis and engaging copy (middle/upper school levels).
- **`MissionCard`**: Features the narrative voice of "Dr. Astra" with generous typography for readability.
- **`ProgressPanel`**: Displays the user's current **Title** (e.g., "Stargazer") and **XP-bar** prominently at the top of the stack.

### 4. Centered Interactive Overlays
For high-impact pedagogical moments:
- **`ScaleVisualizer`**: A cinematic, screen-wide comparison mode (e.g., Earth next to Jupiter) triggered from the `PlanetPanel`.
- **`QuizCard`**: Elegant floating cards for mini-quizzes that don't block the view of the celestial bodies, allowing the user to "look for the answer" in the scene while answering.

### 5. iPad Optimization (Adaptive Layout)
- **Portrait**: A spacious, touch-optimized version of the bottom navigation. Quizzes and fact cards appear as slide-up sheets (consistent with mobile).
- **Landscape**: Mirrors the Desktop layout (Side panels + Control Pill) but with larger hit areas for touch.

### 6. Visual Polish & Gamification
- **XP Integration**: The XP-bar and Title are integrated into the main header on desktop, making progression a constant, rewarding presence.
- **Glassmorphism**: Upgraded to `bg-black/60` and `backdrop-blur-xl` for a premium feel.
- **Animations**: Subtle "data-loading" effects when fact cards or quizzes appear.

---

## Detailed Implementation Steps

### Step 1: Create `src/components/DesktopControlPill.tsx`
The central interaction hub, replacing the old footer.

### Step 2: Refactor `src/components/HUD.tsx`
- Implement the `<Navigator />` (Left) and `<LearningInfoHub />` (Right) layout.
- Integrate the global **XP & Title** display in the top header.
- Define logic for switching Navigator content based on `gameMode`.

### Step 3: Expand `PlanetPanel.tsx`
- Add the tabbed interface (`Fakta` / `Lär dig mer`).
- Implement the "Compare Size" (`ScaleVisualizer`) button.

### Step 4: Create Learning Components
- **`FactCard.tsx`**: Individual cards for pedagogical content.
- **`QuizCard.tsx`**: The desktop/iPad optimized quiz interface.
- **`XPProgressBar.tsx`**: Reusable component for the header and progress panel.

### Step 5: iPad Adaptive Styles
- Update `useIsMobileLayout` or add a new `useIsTabletLayout` if more granular control is needed.
- Ensure orientation changes trigger the correct layout shift.

---

## Verification Plan
1. **Pedagogical Flow**: Verify that starting a "Learn" mission changes the Navigator and highlights the Learning Hub correctly.
2. **Visual Consistency**: Check that Emerald accents are used consistently for all "Learning" related UI.
3. **Scale Check**: Ensure the `ScaleVisualizer` looks impressive on both 4K monitors and iPad screens.
4. **Touch Ergonomics**: Test iPad layout to ensure side panels and pills are easily reachable.

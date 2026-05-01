# Revisionsplan: kamerakontroll och konstellationsrendering

**Datum:** 2026-04-27  
**Berörda filer:**  
`src/scene/CameraManager.tsx`, `src/scene/MobileCloseViewFraming.tsx`,  
`src/scene/cameraTravel.ts`, `src/scene/GlobalZoom.tsx`,  
`src/scene/ConstellationLines.tsx`, `src/lib/constellationOrientation.ts`,  
`src/lib/skyTargets.ts`, `src/lib/constellationShapes.ts`

---

## Bakgrund och problemformulering

Det finns två återkommande problem när AI används för att ändra kamera- och konstellationskoden:

1. **Planetens position i viewporten**: En begäran om att "flytta planeten högre upp" resulterar i att AI:n gör en ändring men inget händer visuellt. Planeten sitter kvar på samma ställe.

2. **Konstellationer slutar renderas**: En ändring i konstellationsrelaterad kod leder till att konstellationslinjerna/stjärnorna helt försvinner från skärmen.

3. Stjärnbilder hamnar utanför bild helt eller delvis. De ska alltid få plats i viewporten med luft runt.

Nedan analyseras rotorsakerna och föreslagna åtgärder.

---

## Del 1 — Planetens viewport-position

### Rotorsak: Två separata system styr samma visuella resultat

Det finns _två helt olika mekanismer_ som avgör var planeten hamnar i bilden, och de är utspridda i olika filer utan tydlig koppling till varandra:

#### Mekanism A — 3D-kameraposition (`src/scene/cameraTravel.ts`)

`computePlanetEndPos()` (rad 86–100) bestämmer var i 3D-rymden kameran placeras när den flyger fram till en planet. Det magiska talet `0.45` på rad 97 styr hur högt _ovanför_ planetens ekvatorialplan kameran hamnar:

```ts
out.set(dirX * -0.5 + tangentX * 0.75, 0.45, dirZ * -0.5 + tangentZ * 0.75);
//                                       ^^^^
//                  Kamerans vertikala förskjutning i 3D-världskoordinater
```

Om man ändrar detta värde ändras kamerans faktiska 3D-position, vilket påverkar vinkeln mot planeten men **inte** direkt proportionellt mot planetens pixelposition i viewporten.

#### Mekanism B — 2D-viewport-förskjutning (`src/scene/MobileCloseViewFraming.tsx`)

`CLOSE_VIEW_VERTICAL_SHIFT = 0.1` (rad 9) styr hur mycket planeten skjuts uppåt i viewportens 2D-projektion via `camera.setViewOffset()`. Det är en projectionmatris-trick som **inte rör sig i 3D-rymden** — det ändrar bara hur scenen projiceras mot skärmen. Är enbart aktiv på mobil i porträttläge.

`setViewOffset(w, h, 0, offsetY, w, h)` på rad 138 innebär: "rendera som om kameran tittade på en imaginär canvas som är `offsetY` pixlar nedanför den faktiska canvasen." Nettoresultatet är att planeten glider uppåt i viewporten utan att kameran rör sig.

### Varför AI:n misslyckas

- Filnamnet `MobileCloseViewFraming.tsx` antyder inte "viewport-position" — det låter som en generell "inramning"
- `setViewOffset()` är en ovanlig Three.js-funktion; AI:n letar instinktivt efter position/target-vektorer
- Konstanten `CLOSE_VIEW_VERTICAL_SHIFT = 0.1` saknar enhet i namnet (är det pixlar? procent? fraction?)
- Det finns ingen kommentar som förklarar att de _två mekanismerna existerar_ och när vardera används
- AI:n ändrar ofta `0.45` i `computePlanetEndPos` (fel mekanism för mobilt porträttläge) eller söker i `CameraManager.tsx` utan att hitta rätt ställe

### Föreslagna åtgärder — Mekanism B (viewport-förskjutning)

**Åtgärd 1.1 — Byt namn på filen**  
`MobileCloseViewFraming.tsx` → `PlanetViewportOffset.tsx`  
Komponent: `MobileCloseViewFraming` → `PlanetViewportOffset`  
Motivering: namnet ska avslöja _vad_ komponenten gör, inte _varför_ den skapades.

**Åtgärd 1.2 — Byt namn på konstanten med tydlig enhet**

```ts
// Nuvarande:
const CLOSE_VIEW_VERTICAL_SHIFT = 0.1;

// Förslag:
/** Fraction of canvas height to shift the planet upward in the 2D viewport. */
const PLANET_VIEWPORT_UPSHIFT_FRACTION = 0.1;
```

**Åtgärd 1.3 — Lägg till ett arkitekturblock längst upp i filen**

```ts
/**
 * WHAT THIS FILE DOES
 * ===================
 * Shifts the planet upward in the 2D viewport on narrow mobile screens.
 *
 * HOW
 * ---
 * Uses camera.setViewOffset() — a projection-matrix trick that does NOT
 * move the camera in 3D space. It makes Three.js render as if the canvas
 * were PLANET_VIEWPORT_UPSHIFT_FRACTION * canvasHeight pixels below the
 * real canvas, which pushes the planet up without disturbing OrbitControls.
 *
 * WHEN TO CHANGE THIS
 * -------------------
 * - Planet feels too low on mobile portrait: increase PLANET_VIEWPORT_UPSHIFT_FRACTION.
 * - Planet feels too high: decrease it (min 0 = no shift).
 * - Does nothing on desktop or landscape: see the `enabled` check below.
 *
 * RELATED
 * -------
 * - 3D camera height above planet: computePlanetEndPos() in cameraTravel.ts
 *   (the 0.45 Y-component). Affects all platforms, not just mobile.
 */
```

**Åtgärd 1.4 — Lägg till kryssreferens i `cameraTravel.ts`**  
Ovanför `computePlanetEndPos` och det magiska `0.45`:

```ts
/** Y-offset in world units above the planet's equatorial plane.
 *  For mobile portrait viewport shift, see PlanetViewportOffset.tsx instead. */
const PLANET_CAMERA_HEIGHT = 0.45;
```

och byt ut `0.45` mot `PLANET_CAMERA_HEIGHT` i `out.set(...)`.

---

### Föreslagna åtgärder — Mekanism A (3D-kameraposition)

**Åtgärd 1.5 — Namnge alla magiska vektortalet**

```ts
// Nuvarande rad 97:
out.set(dirX * -0.5 + tangentX * 0.75, 0.45, dirZ * -0.5 + tangentZ * 0.75);

// Förslag — separera ut och namnge:
const PLANET_CAMERA_HEIGHT = 0.45; // world-space Y above equatorial plane
const PLANET_BEHIND_FACTOR = 0.5; // how far behind the planet (along radial)
const PLANET_SIDE_FACTOR = 0.75; // how far to the side (along tangent)

out.set(
  dirX * -PLANET_BEHIND_FACTOR + tangentX * PLANET_SIDE_FACTOR,
  PLANET_CAMERA_HEIGHT,
  dirZ * -PLANET_BEHIND_FACTOR + tangentZ * PLANET_SIDE_FACTOR,
);
```

Nu kan en AI direkt svara på "flytta kameran lite höge upp i förhållande till planeten" med `PLANET_CAMERA_HEIGHT = 0.55` utan att gissa sig till vad `0.45` är.

---

## Del 2 — Konstellationsrendering

### Rotorsak: Orientering appliceras i två steg som är dolda för varandra

`ConstellationLines.tsx` har ett unikt och svårläst mönster: konstellationens orientering appliceras _två gånger_ i två helt separata steg, utan att det framgår hur de hänger ihop.

#### Steg 1 — Build-time orientation (i `buildRenderData`, `constellationOrientation.ts`)

`computeConstellationOrientation()` beräknar en quaternion som roterar konstellationens barycenter till att peka längs `−Z` ("rakt in i scenen") och rullar figuren så att den minimerar det behövda vertikala FOV för aktuellt aspect ratio. Denna quaternion appliceras direkt på stjärnpositionerna:

```ts
// ConstellationLines.tsx rad 95:
dir.applyQuaternion(orient).multiplyScalar(SKY_RADIUS);
```

Resultatet är en "centrerad, kompakt" konstellationsfigur byggd runt `−Z`.

#### Steg 2 — Runtime orientation (i `useFrame`, `ConstellationLines.tsx`)

Varje bildruta roterar `useFrame` hela gruppen via `group.quaternion` för att:

1. Peka `−Z` mot konstellationens faktiska himmelsdirektion (`SKY_TARGET_DIRECTIONS[id]`)
2. Applicera en spin-offset (`getConstellationViewSpinOffsetRad`)

```ts
// Rad 235–244:
qAlignScratch.setFromUnitVectors(MESH_FORWARD, targetDir); // Steg 2a
qSpinScratch.setFromAxisAngle(axisScratch, spin); // Steg 2b
qTotalScratch.multiplyQuaternions(qSpinScratch, qAlignScratch);
group.quaternion.copy(qTotalScratch);
```

### Varför AI:n misslyckas

- Steg 1 och Steg 2 är i separata filer och det framgår inte att de utgör ett pipeline
- `computeConstellationOrientation` i `constellationOrientation.ts` returnerar en quaternion som _ser ut_ att sätta konstellationens slutliga orientering — men det är den bara för det relativa kompakta utrymmet, inte för himmelspositionen
- Om AI:n ändrar `computeConstellationOrientation` utan att förstå Steg 2, eller tvärtom ändrar `SKY_TARGET_DIRECTIONS` utan att förstå Steg 1, blir resultatet att konstellationen antingen pekar åt fel håll eller renderas utanför frustumen → syns inte alls
- `displayedId` (React state) och `displayedIdRef` (ref) håller samma värde men uppdateras på olika ställen — om AI:n råkar bryta synkroniseringen visas aldrig något

### Föreslagna åtgärder — Konstellationsrendering

**Åtgärd 2.1 — Lägg till ett pipeline-block längst upp i `ConstellationLines.tsx`**

```ts
/**
 * RENDERING PIPELINE — two-step orientation
 * ==========================================
 *
 * STEP 1 — buildRenderData() (runs once per displayedId/aspect change):
 *   Calls computeConstellationOrientation() to rotate the figure so:
 *   a) its center points along local -Z
 *   b) the figure is rolled to fit minimally within the camera frustum
 *   Star positions and line endpoints are baked into geometry in this
 *   "local -Z" frame. No sky position is involved yet.
 *
 * STEP 2 — useFrame() (runs every frame):
 *   Rotates the <group> so local -Z aligns with the constellation's
 *   actual sky direction from SKY_TARGET_DIRECTIONS, then applies any
 *   user spin offset.
 *
 * To change where a constellation appears on screen → edit SKY_TARGET_DIRECTIONS.
 * To change how a constellation is oriented/fitted → edit computeConstellationOrientation.
 * To change spin → edit constellationViewSpinOffset.ts.
 */
```

**Åtgärd 2.2 — Extrahera fade-tillståndsmaskinen till en egen hook**

Nuvarande `displayedId`/`displayedIdRef`/`phaseRef`/`opacityRef`/`nextIdRef` utgör en inbyggd tillståndsmaskin i `ConstellationLines`. Den bör extraheras:

```ts
// src/scene/useConstellationFade.ts
export function useConstellationFade(selectedConstellation: ConstellationId | null) {
  // Returnerar: { displayedId, opacity, groupRef (for direct mutation) }
}
```

Fördelar:

- `ConstellationLines.tsx` blir enklare — AI ser tydligare vad som är rendering vs animering
- Fade-logiken kan testas isolerat
- Det tydligare att `displayedId !== selectedConstellation` (intentional lag för fade)

**Åtgärd 2.3 — Gör orientations-kontraktet explicit med ett typ-alias**

I `constellationOrientation.ts`:

```ts
/**
 * Returned quaternion rotates star directions so the constellation centroid
 * points along canonical -Z. Apply to star positions in mesh-local space.
 * Do NOT use this to set the mesh's world orientation — that is done in
 * ConstellationLines.tsx useFrame via SKY_TARGET_DIRECTIONS.
 */
export type LocalFrameQuaternion = Quaternion & { readonly _brand: 'LocalFrame' };
```

(Branded type — tvingar AI:n att notera att denna quaternion är lokal, inte global.)

**Åtgärd 2.4 — Separera `buildRenderData` tydligare**

Lägg till en kommentar i `buildRenderData` som klargör att utgångskoordinaterna är i det "lokala −Z-ramverket":

```ts
/**
 * Builds geometry for the constellation in LOCAL SPACE aligned to -Z.
 * The group's world orientation is set separately in useFrame.
 * Aspect ratio affects the roll/fit calculation only, not star positions.
 */
const buildRenderData = (selectedId: ConstellationId, aspect: number): RenderData => {
```

**Åtgärd 2.5 — Defensiv null-kontroll i `useFrame` för grupp-quaternion**

Nuvarande kod antar att alla `SKY_TARGET_DIRECTIONS[id]` finns. Lägg till en guard:

```ts
const targetDir = SKY_TARGET_DIRECTIONS[id];
if (!targetDir) {
  console.warn(`ConstellationLines: no sky target for "${id}"`);
  return;
}
```

---

## Del 3 — Övriga robusthetsbrister (lägre prioritet)

### `GlobalZoom.tsx` — Stum FOV-klämning

`getConstellationMinFovDegrees()` beräknar minimum-FOV men om konstellationens figur är trasig returnerar funktionen ett fallback-värde (`24 grader`). Detta bör loggas:

```ts
if (maxTan < 1e-6) {
  console.warn(`constellationOrientation: degenerate figure for "${id}", using fallback FOV`);
  maxTan = Math.tan((18 * Math.PI) / 180);
}
```

### `PlanetViewportOffset.tsx` (tidigare `MobileCloseViewFraming`) — `size` i cleanup-effect

**Valt beteende: (b) vid unmount används aktuell viewport** från R3F (`get().size`), inte den storlek som fanns när effekten senast körde. Då matchar kamerans `aspect` det canvas R3F rapporterar i samma moment som unmount, vilket undviker en fel `aspect` om canvas storlek hunnit ändras innan rensningen körs.

Cleanup ska därför **inte** ha `size` i `useEffect`-dependencies; läs `camera` och `size` via `get()` i cleanup. Implementation i `PlanetViewportOffset.tsx` följer detta mönster:

```ts
useEffect(() => {
  return () => {
    const { camera, size } = get();
    if (!(camera instanceof PerspectiveCamera)) return;
    if (camera.view?.enabled) {
      camera.clearViewOffset();
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
  };
}, [get]); // inga size-beroenden
```

*(Option (a) — återställa till den aspekt som gällde när effekten *mountade* — skulle kräva att `width`/`height` fångas i en ref när effekten körs och att cleanup använder de värdena; används inte här.)*

---

## Genomförandeordning

Prioritera i denna ordning för att minimera risk:

| #   | Åtgärd                                                        | Risk   | Effekt                                         |
| --- | ------------------------------------------------------------- | ------ | ---------------------------------------------- |
| 1   | 1.2 Byt namn på `CLOSE_VIEW_VERTICAL_SHIFT`                   | Låg    | AI hittar konstanten direkt                    |
| 2   | 1.3 Arkitekturblock i viewport-offset-filen                   | Låg    | AI förstår mekanismen                          |
| 3   | 1.4 Kryssreferens + namnge `0.45` i `cameraTravel.ts`         | Låg    | AI vet var 3D-höjden ändras                    |
| 4   | 1.5 Namnge `PLANET_BEHIND_FACTOR` / `PLANET_SIDE_FACTOR`      | Låg    | Alla magic numbers bortbrutna                  |
| 5   | 2.1 Pipeline-block i `ConstellationLines.tsx`                 | Ingen  | AI förstår tvåstegsmodellen                    |
| 6   | 2.4 Kommentar i `buildRenderData`                             | Ingen  | Förtydligar koordinatramen                     |
| 7   | 2.5 Defensiv null-kontroll                                    | Låg    | Tyst fel blir synligt                          |
| 8   | 1.1 Filbyte `MobileCloseViewFraming` → `PlanetViewportOffset` | Medium | Kräver uppdatering av alla imports             |
| 9   | 2.2 Extrahera `useConstellationFade`                          | Medium | Störst refaktor; gör ConstellationLines läsbar |
| 10  | 3.x Övriga robusthetsfixar                                    | Låg    | Defensivt, inte kritiskt                       |

Åtgärd 1–7 är rena kommentars- och namnändringar och kan genomföras utan risk för regressioner. Åtgärd 8–9 rör sig i faktisk kod och bör göras i separata commits med tester emellan.

---

## Sammanfattning

Båda problemen har samma rotorsak: **logiken är uppdelad i separata filer utan att sambandet dokumenteras**, och **magiska tal saknar namn som avslöjar deras syfte**. En AI (eller mänsklig utvecklare) som ser en del av systemet förstår inte hur den hänger ihop med resten, och gör ändringar som inte har avsedd effekt eller som bryter den dolda kopplingen.

Ingen av åtgärderna kräver arkitektoniska omskrivningar. Det är i huvudsak dokumentation, namngivning och defensiva felkontroller — låg risk, hög förståelsevinst.

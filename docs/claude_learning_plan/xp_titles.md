# XP-system och titlar — HelioTrip Learning Content

## XP-källor

| Händelse | XP |
|---|---|
| Besöka en ny himmelskropp | +10 |
| Slutföra ett uppdragssteg | +15 |
| Quiz — rätt på första försöket (3 stjärnor) | +30 |
| Quiz — rätt på andra försöket (2 stjärnor) | +20 |
| Quiz — rätt på tredje försöket (1 stjärna) | +10 |
| Slutföra ett helt uppdrag | +50 |
| Slutföra ett äventyrsuppdrag | +60 |
| Utforska en stjärnbild | +20 |

---

## XP-baserade titlar

| TitleId | XP-gräns | SV | EN |
|---|---|---|---|
| `rookie` | 0 | Nybörjare | Rookie |
| `stargazer` | 100 | Stjärntittare | Stargazer |
| `space_explorer` | 300 | Rymdutforskare | Space Explorer |
| `astronomy_cadet` | 600 | Astronomiassistent | Astronomy Cadet |
| `space_scientist` | 1000 | Rymdforskare | Space Scientist |
| `solar_system_expert` | 2000 | Solsystemsexpert | Solar System Expert |
| `galactic_guide` | 3500 | Galaktisk Guide | Galactic Guide |

---

## Uppdragstitlar (låses av specifika äventyrsuppdrag)

| TitleId | Uppdrag | SV | EN |
|---|---|---|---|
| `water_hunter` | `water_hunt` | Vattenjägaren | Water Hunter |
| `orbital_mechanic` | `gravity_sling` | Banmekaniker | Orbital Mechanic |

---

## TypeScript-typ

```typescript
// src/lib/learning/xp.ts
export type TitleId =
  | 'rookie'
  | 'stargazer'
  | 'space_explorer'
  | 'astronomy_cadet'
  | 'space_scientist'
  | 'solar_system_expert'
  | 'galactic_guide'
  | 'water_hunter'
  | 'orbital_mechanic';

export type XpTitle = {
  readonly id: TitleId;
  readonly xpRequired: number;
  readonly missionRequired?: string; // mission ID om det är ett uppdragspris
};

export const XP_TITLES: ReadonlyArray<XpTitle> = [
  { id: 'rookie',              xpRequired: 0 },
  { id: 'stargazer',           xpRequired: 100 },
  { id: 'space_explorer',      xpRequired: 300 },
  { id: 'astronomy_cadet',     xpRequired: 600 },
  { id: 'space_scientist',     xpRequired: 1000 },
  { id: 'solar_system_expert', xpRequired: 2000 },
  { id: 'galactic_guide',      xpRequired: 3500 },
  // Uppdragstitlar (xpRequired ignoreras — låses av missionRequired)
  { id: 'water_hunter',    xpRequired: 0, missionRequired: 'water_hunt' },
  { id: 'orbital_mechanic', xpRequired: 0, missionRequired: 'gravity_sling' },
];

export const resolveTitle = (xp: number, completedMissions: string[]): TitleId => {
  // Uppdragstitlar har prioritet
  for (const t of [...XP_TITLES].reverse()) {
    if (t.missionRequired && completedMissions.includes(t.missionRequired)) {
      return t.id;
    }
  }
  // Annars XP-baserad
  let current: TitleId = 'rookie';
  for (const t of XP_TITLES) {
    if (t.missionRequired) continue;
    if (xp >= t.xpRequired) current = t.id;
  }
  return current;
};
```

---

## i18n-nyckelstruktur

```
t.learn.xp.titles.rookie               = "Nybörjare" / "Rookie"
t.learn.xp.titles.stargazer            = "Stjärntittare" / "Stargazer"
t.learn.xp.titles.space_explorer       = "Rymdutforskare" / "Space Explorer"
t.learn.xp.titles.astronomy_cadet      = "Astronomiassistent" / "Astronomy Cadet"
t.learn.xp.titles.space_scientist      = "Rymdforskare" / "Space Scientist"
t.learn.xp.titles.solar_system_expert  = "Solsystemsexpert" / "Solar System Expert"
t.learn.xp.titles.galactic_guide       = "Galaktisk Guide" / "Galactic Guide"
t.learn.xp.titles.water_hunter         = "Vattenjägaren" / "Water Hunter"
t.learn.xp.titles.orbital_mechanic     = "Banmekaniker" / "Orbital Mechanic"
t.learn.xp.xpPoints                    = "XP" / "XP"
t.learn.xp.levelUp                     = "Ny titel upplåst!" / "New title unlocked!"
```

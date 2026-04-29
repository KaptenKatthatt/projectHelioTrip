# claude_learning_plan — Innehållsbibliotek

Färdigt textinnehåll för HelioTrips pedagogiska uppgradering.
Matchar arkitekturplanen i `../LEARNING_PLAN_uppdatering.md`.

## Filer

| Fil | Innehåll | Status |
|---|---|---|
| `factcards.md` | 4 faktakort × 18 himmelskroppar, SV + EN | ✅ Klart |
| `quiz.md` | 3 frågor × 18 himmelskroppar, SV + EN | ✅ Klart |
| `missions_adventure.md` | 2 äventyrsuppdrag med narrativ, SV + EN | ✅ Klart |
| `constellations.md` | 16 stjärnbilder × 3 flikar, SV + EN | ✅ Klart |
| `xp_titles.md` | XP-tabell, titlar, TypeScript-typ | ✅ Klart |

## Täckning

**Faktakort**: 18 himmelskroppar × 4 kort = 72 kort
- Planeter: sun, mercury, venus, earth, mars, jupiter, saturn, uranus, neptune, pluto
- Månar: moon, io, europa, ganymede, callisto, titan, triton
- Satelliter: iss

**Quiz**: 18 himmelskroppar × 3 frågor = 54 frågor + 1 missionsexklusiv fråga
- Typer: multiple-choice, true-false, fill-in

**Äventyrsuppdrag**: 2 uppdrag × 5 steg
- `water_hunt` — Mellanstadiet, Europa/Jupiter
- `gravity_sling` — Högstadiet, Jupiter/tidsspolning

**Stjärnbilder**: 16 × 3 flikar (story, find_it, fun_fact)

## i18n-nyckelprefix

```
t.learn.cards.*          ← faktakort
t.learn.quiz.*           ← quizfrågor
t.learn.missions.*       ← äventyrsuppdrag
t.learn.constellations.* ← stjärnbildsberättelser
t.learn.xp.*             ← titlar och XP-texter
```

## Nivåer

Varje faktakort och quizfråga är märkt med:
- `middle` — Mellanstadiet (åk 4–6), analogier och wow-fakta
- `upper` — Högstadiet (åk 7–9), fysik och exaktare förklaringar
- `both` — Passar båda nivåer

Nivåfiltret styrs av en global toggle i HUD (beslut 2026-04-28).

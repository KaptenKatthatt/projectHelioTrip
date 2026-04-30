# Äventyrsuppdrag — HelioTrip Learning Content

Två narrativa uppdrag med berättartext, steg och quiz.

Format per steg:
- **narrative_key**: i18n-nyckel under `t.learn.missions.<missionId>.steps.<stepId>.narrative`
- **fact_card_id**: vilket faktakort som visas automatiskt när steget nås (matchar id i factcards.md)
- **quiz_id**: vilket quiz som triggas i slutet av steget (matchar id i quiz.md)

---

## UPPDRAG 1: "Vattenjakten" (Mellanstadiet / middle)

**Mission ID**: `water_hunt`
**Trigger bodies**: europa (mål), jupiter (mellansteg)
**Estimated XP**: 50 + quizbonus
**Unlock title SV**: Vattenjägaren
**Unlock title EN**: Water Hunter

### Introduktion

**narrative_key**: `water_hunt.intro`

**SV**: Dr. Astra skickar ett nödmeddelande: hennes rymdstation håller på att få slut på vatten. Ryktet säger att is gömmer sig under en av Jupiters månar. Du är den enda som kan hjälpa henne. Dags att ge sig iväg!

**EN**: Dr. Astra sends an urgent message: her space station is running out of water. Rumour has it that ice hides beneath one of Jupiter's moons. You're the only one who can help her. Time to set off!

---

### Steg 1 — Starta vid Solen och ta sikte på Jupiter

**Step ID**: `water_hunt_start_at_sun`
**Trigger**: `visit_body: sun`
**fact_card_id**: `sun_scale`

**narrative_key**: `water_hunt.step1`

**SV**: Börja vid Solen och titta dig omkring. Kan du se Jupiter därifrån? Notera hur liten Jupiter ser ut härifrån — trots att den är den största planeten i solsystemet.

**EN**: Start at the Sun and look around. Can you see Jupiter from here? Notice how small Jupiter looks from this distance — despite being the largest planet in the solar system.

---

### Steg 2 — Flyg till Jupiter

**Step ID**: `water_hunt_visit_jupiter`
**Trigger**: `visit_body: jupiter`
**fact_card_id**: `jupiter_moons`

**narrative_key**: `water_hunt.step2`

**SV**: Dr. Astra hör av sig igen: "Bra jobbat! Jupiter har 95 månar — på en av dem kan det finnas det vatten vi söker. De fyra största hittades av en man med ett hemmagjort teleskop för 400 år sedan. Leta vidare!"

**EN**: Dr. Astra calls again: "Well done! Jupiter has 95 moons — one of them may have the water we're looking for. The four largest were found by a man with a homemade telescope 400 years ago. Keep searching!"

---

### Steg 3 — Hitta Europa

**Step ID**: `water_hunt_visit_europa`
**Trigger**: `visit_body: europa`
**fact_card_id**: `europa_ocean`

**narrative_key**: `water_hunt.step3`

**SV**: Europa — en liten ismåne med ett stort hemligt. Titta på ytan: sprickor och åsar i isen. Under det du ser kan det gömma sig mer vatten än i alla Jordens hav tillsammans. Dr. Astra håller andan.

**EN**: Europa — a small icy moon with a big secret. Look at the surface: cracks and ridges in the ice. Beneath what you can see may hide more water than in all Earth's oceans combined. Dr. Astra is holding her breath.

---

### Steg 4 — Quiz: Vad finns under isen?

**Step ID**: `water_hunt_quiz`
**Trigger**: quiz completion `quiz_europa_ocean`
**quiz_id**: `quiz_europa_ocean`

**narrative_key**: `water_hunt.step4_intro`

**SV**: Dr. Astra frågar: "Innan vi borrar — vad tror du döljer sig under Europas isskorpa?"

**EN**: Dr. Astra asks: "Before we drill — what do you think is hiding beneath Europa's ice shell?"

**narrative_key**: `water_hunt.step4_correct`

**SV**: "Precis!" ropar Dr. Astra. "Ett hav av flytande vatten, värmt av Jupiters dragkraft. Det är här vi ska hämta vattnet — och kanske finns det till och med liv här!"

**EN**: "Exactly!" shouts Dr. Astra. "A liquid ocean, kept warm by Jupiter's gravity. This is where we get our water — and maybe there's even life here!"

---

### Steg 5 — Slutsats och belöning

**Step ID**: `water_hunt_complete`
**Trigger**: auto (after quiz)
**Unlocks title**: `water_hunter`
**XP award**: 50

**narrative_key**: `water_hunt.complete`

**SV**: Dr. Astras rymdstation är räddad! Du har hittat ett av solsystemets mest spännande ställen — en ismåne med ett världshav under ytan. Titeln "Vattenjägaren" är din. Kanske är du också en av de första att hitta utomjordiskt liv?

**EN**: Dr. Astra's space station is saved! You've found one of the solar system's most exciting places — an icy moon with a world-ocean beneath the surface. The title "Water Hunter" is yours. Maybe you'll also be one of the first to find extraterrestrial life?

---

### Full i18n-nyckelstruktur (sv.ts / en.ts)

```
t.learn.missions.water_hunt.title          = "Vattenjakten" / "The Water Hunt"
t.learn.missions.water_hunt.description    = "Hjälp Dr. Astra..." / "Help Dr. Astra..."
t.learn.missions.water_hunt.intro          = [text ovan]
t.learn.missions.water_hunt.steps.water_hunt_start_at_sun.narrative   = [steg 1]
t.learn.missions.water_hunt.steps.water_hunt_visit_jupiter.narrative  = [steg 2]
t.learn.missions.water_hunt.steps.water_hunt_visit_europa.narrative   = [steg 3]
t.learn.missions.water_hunt.steps.water_hunt_quiz.intro               = [steg 4 intro]
t.learn.missions.water_hunt.steps.water_hunt_quiz.correct             = [steg 4 rätt]
t.learn.missions.water_hunt.complete                                   = [steg 5]
```

---
---

## UPPDRAG 2: "Gravitationsslingans hemlighet" (Högstadiet / upper)

**Mission ID**: `gravity_sling`
**Trigger bodies**: sun (start), jupiter (mål)
**Estimated XP**: 60 + quizbonus
**Unlock title SV**: Banmekaniker
**Unlock title EN**: Orbital Mechanic

### Introduktion

**narrative_key**: `gravity_sling.intro`

**SV**: År 1977 lämnade rymdsonden Voyager 1 Jorden utan tillräckligt bränsle för att nå de yttre planeterna — men den klarade det ändå. Hemligheten: gravitationsslinga. Den använde Jupiters gravitation som en gratis katapult. Hur fungerar det? Det ska du ta reda på.

**EN**: In 1977, the Voyager 1 spacecraft left Earth without enough fuel to reach the outer planets — yet it made it anyway. The secret: a gravity slingshot. It used Jupiter's gravity as a free catapult. How does that work? That's what you're going to find out.

---

### Steg 1 — Starta vid Solen: se hela solsystemet

**Step ID**: `gravity_sling_start`
**Trigger**: `visit_body: sun`
**fact_card_id**: `sun_scale`

**narrative_key**: `gravity_sling.step1`

**SV**: Stå vid Solen och tänk på skalan: Jupiter befinner sig 5,2 gånger längre från Solen än Jorden. Rymdsonden Voyager 1 behövde ta sig dit utan att bränna allt bränsle. Hur löser man det problemet?

**EN**: Stand at the Sun and consider the scale: Jupiter is 5.2 times farther from the Sun than Earth. The Voyager 1 spacecraft needed to get there without burning all its fuel. How do you solve that problem?

---

### Steg 2 — Flyg till Jupiter och observera banan

**Step ID**: `gravity_sling_visit_jupiter`
**Trigger**: `visit_body: jupiter`
**fact_card_id**: `jupiter_shield`

**narrative_key**: `gravity_sling.step2`

**SV**: Du befinner dig nu vid Jupiter — den tyngsta planeten. Dess gravitation är 2,5 gånger starkare än Jordens. En rymdsond som flyger nära Jupiter och sedan bort igen kan "låna" fart från planeten utan att bränna ett enda gram bränsle. Det kallas gravitationsslinga.

**EN**: You're now at Jupiter — the most massive planet. Its gravity is 2.5 times stronger than Earth's. A spacecraft flying close to Jupiter and then away again can "borrow" speed from the planet without burning a single gram of fuel. This is called a gravity slingshot.

---

### Steg 3 — Snabba upp tiden och se banorna

**Step ID**: `gravity_sling_time_speed`
**Trigger**: `time_scale_at_least: 30`
**fact_card_id**: `jupiter_gravity_weight`

**narrative_key**: `gravity_sling.step3`

**SV**: Skruva upp tidshastigheten och observera hur planeterna rör sig i sina banor. Voyager 1 använde Jupiters rörelsebana — planeten "delar med sig" av sin rörelseenergi till sonden när den flyger förbi i rätt vinkel.

**EN**: Speed up time and observe how the planets move in their orbits. Voyager 1 used Jupiter's orbital motion — the planet "shares" its kinetic energy with the probe when it flies past at the right angle.

---

### Steg 4 — Quiz: Gravitationsslinga

**Step ID**: `gravity_sling_quiz`
**quiz_id**: `quiz_jupiter_shield`
**Trigger**: quiz completion

**narrative_key**: `gravity_sling.step4_intro`

**SV**: Din kollega frågar dig: "Vad gör en gravitationsslinga med en rymdsond?"

**EN**: Your colleague asks: "What does a gravity slingshot do to a spacecraft?"

**Quiz question (new — only for this mission)**:
**quiz_id**: `quiz_gravity_sling_mechanic`
**Type**: multiple-choice
**Level**: upper
**Question SV**: Vad händer med en rymdsond som utför en gravitationsslinga runt Jupiter?
**Question EN**: What happens to a spacecraft performing a gravity slingshot around Jupiter?
**A SV**: Den saktar ner och bränslebesparar **A EN**: It slows down and saves fuel
**B SV**: Den ökar sin hastighet utan att bränna extra bränsle **B EN**: It increases its speed without burning extra fuel
**C SV**: Den fastnar i Jupiters omloppsbana **C EN**: It gets trapped in Jupiter's orbit
**Correct**: B
**Hint SV**: Tänk på att Jupiter rör sig snabbt i sin bana — det är rörelseenergin som "delas".
**Hint EN**: Think of Jupiter moving fast in its orbit — it's this kinetic energy that gets "shared."
**Explanation SV**: Rymdsonden flyger in mot Jupiter i en vinkel, svänger runt den och åker ut snabbare. Den "stjäl" en pytteliten del av Jupiters rörelsenergi — för liten för att märkas på Jupiter, men enorm för sonden.
**Explanation EN**: The spacecraft flies toward Jupiter at an angle, swings around it and exits faster. It "steals" a tiny fraction of Jupiter's kinetic energy — too small to notice on Jupiter, but enormous for the spacecraft.

**narrative_key**: `gravity_sling.step4_correct`

**SV**: "Exakt rätt!" säger kollegan. "Det är därför Voyager 1 fortfarande flyger — nu utanför hela solsystemet — utan att ha tömt bränsletanken. En elegant lösning på ett svårt problem."

**EN**: "Exactly right!" says your colleague. "That's why Voyager 1 is still flying — now beyond the entire solar system — without having emptied its fuel tank. An elegant solution to a difficult problem."

---

### Steg 5 — Slutsats och belöning

**Step ID**: `gravity_sling_complete`
**Trigger**: auto (after quiz)
**Unlocks title**: `orbital_mechanic`
**XP award**: 60

**narrative_key**: `gravity_sling.complete`

**SV**: Du förstår nu en av de smartaste knepen i rymdfartsteknikens historia. Voyager 1 befinner sig idag mer än 23 miljarder kilometer från Solen — längre bort än något mänskligt föremål någonsin har kommit. Titeln "Banmekaniker" är din.

**EN**: You now understand one of the cleverest tricks in the history of spaceflight. Voyager 1 is today more than 23 billion kilometres from the Sun — further than any human-made object has ever travelled. The title "Orbital Mechanic" is yours.

---

### Full i18n-nyckelstruktur (sv.ts / en.ts)

```
t.learn.missions.gravity_sling.title         = "Gravitationsslingans hemlighet" / "The Gravity Slingshot Secret"
t.learn.missions.gravity_sling.description   = "Lär dig hur Voyager..." / "Learn how Voyager..."
t.learn.missions.gravity_sling.intro         = [text ovan]
t.learn.missions.gravity_sling.steps.gravity_sling_start.narrative        = [steg 1]
t.learn.missions.gravity_sling.steps.gravity_sling_visit_jupiter.narrative = [steg 2]
t.learn.missions.gravity_sling.steps.gravity_sling_time_speed.narrative   = [steg 3]
t.learn.missions.gravity_sling.steps.gravity_sling_quiz.intro             = [steg 4 intro]
t.learn.missions.gravity_sling.steps.gravity_sling_quiz.correct           = [steg 4 rätt]
t.learn.missions.gravity_sling.complete                                    = [steg 5]
```

---

## Titlar som låses upp av dessa uppdrag

| Title ID | SV | EN | XP requirement |
|---|---|---|---|
| `water_hunter` | Vattenjägaren | Water Hunter | Slutföra water_hunt |
| `orbital_mechanic` | Banmekaniker | Orbital Mechanic | Slutföra gravity_sling |

Övriga titlar (XP-baserade) definieras i `xp_titles.md`.

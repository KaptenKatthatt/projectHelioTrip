export const CALLISTO_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_callisto_craters',
    bodyId: 'callisto',
    level: 'both',
    statement: {
      sv: 'Callisto är den mest kraterrika kroppen i hela solsystemet.',
      en: 'Callisto is the most heavily cratered body in the entire solar system.',
    },
    correct: true,
    hint: {
      sv: 'Callisto har inga vulkaner eller aktiv geologi som kan fylla igen kratrarna.',
      en: 'Callisto has no volcanoes or active geology to fill in craters.',
    },
    explanation: {
      sv: 'Callisto är geologiskt död — ingen värme från tidvattenkrafter skapar vulkaner eller rörelser som täcker kratrarna. Varje asteroid som träffat den under 4 miljarder år har lämnat ett spår.',
      en: 'Callisto is geologically dead — no tidal heating creates volcanoes or movements to cover craters. Every asteroid that has struck it over 4 billion years has left a mark.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_callisto_position',
    bodyId: 'callisto',
    level: 'middle',
    question: {
      sv: 'Callisto är den yttersta av de fyra galileiska månarna. Vad är en fördel med det?',
      en: 'Callisto is the outermost of the four Galilean moons. What is one advantage of this?',
    },
    options: [
      { key: 'A', sv: 'Den är varmare och mer beboelig', en: 'It is warmer and more habitable' },
      {
        key: 'B',
        sv: 'Den utsätts för mycket mindre strålning från Jupiter',
        en: 'It is exposed to much less radiation from Jupiter',
      },
      { key: 'C', sv: 'Den snurrar snabbast runt Jupiter', en: 'It orbits Jupiter the fastest' },
    ],
    correct: 'B',
    hint: {
      sv: 'Jupiters strålningsbälten är farliga — ju längre bort, desto säkrare.',
      en: "Jupiter's radiation belts are dangerous — the farther away, the safer.",
    },
    explanation: {
      sv: 'Callisto befinner sig utanför Jupiters farligaste strålningsbälten. Det gör den till en kandidat för en framtida rymdstation — fartyg därifrån kan utforska det Jupiterianska systemet utan att utsätta besättningen för dödlig strålning.',
      en: "Callisto sits outside Jupiter's most dangerous radiation belts. This makes it a candidate for a future space base — ships from there could explore the Jovian system without exposing crews to lethal radiation.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_callisto_ocean',
    bodyId: 'callisto',
    level: 'upper',
    question: {
      sv: 'Vad tror forskare döljer sig under Callistos yta?',
      en: "What do scientists believe hides beneath Callisto's surface?",
    },
    options: [
      { key: 'A', sv: 'Smält järn och sten', en: 'Molten iron and rock' },
      {
        key: 'B',
        sv: 'Troligtvis ett flytande saltvattensbäv',
        en: 'Likely a liquid saltwater ocean',
      },
      { key: 'C', sv: 'Ingenting — den är helt solid', en: 'Nothing — it is completely solid' },
    ],
    correct: 'B',
    hint: {
      sv: 'Även om Callisto är geologiskt inaktiv på ytan kan det dolda havet finnas av en annan anledning.',
      en: 'Even though Callisto is geologically inactive on its surface, a hidden ocean could exist for another reason.',
    },
    explanation: {
      sv: 'Magnetmätningar från Galileosonden tyder på ett saltvatten­hav kanske 100–200 km under ytan. Det är inte drivet av tidvattenvärme utan av radioaktivt sönderfall långt inne i månens inre.',
      en: "Magnetic measurements from the Galileo spacecraft suggest a saltwater ocean perhaps 100–200 km below the surface. It is not driven by tidal heating but by radioactive decay deep in the moon's interior.",
    },
  },
] as const;

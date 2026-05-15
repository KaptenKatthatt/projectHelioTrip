export const IO_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_io_volcanoes',
    bodyId: 'io',
    level: 'both',
    statement: {
      sv: 'Io är den mest vulkaniskt aktiva kroppen i solsystemet.',
      en: 'Io is the most volcanically active body in the solar system.',
    },
    correct: true,
    hint: {
      sv: 'Tänk på vad Jupiters enorma gravitation gör med en liten måne.',
      en: "Think about what Jupiter's enormous gravity does to a small moon.",
    },
    explanation: {
      sv: 'Io har ständigt pågående vulkanutbrott. Jupiters tidvattenkrafter knådar ständigt månens inre och genererar enorm värme som driver all vulkanisk aktivitet.',
      en: "Io has constantly ongoing volcanic eruptions. Jupiter's tidal forces constantly knead the moon's interior, generating enormous heat that drives all the volcanic activity.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_io_heat',
    bodyId: 'io',
    level: 'upper',
    question: {
      sv: 'Vad orsakar Ios extrema vulkanism?',
      en: "What causes Io's extreme volcanism?",
    },
    options: [
      { key: 'A', sv: 'Radioaktivt sönderfall i kärnan', en: 'Radioactive decay in the core' },
      {
        key: 'B',
        sv: 'Jupiters tidvattenkrafter värmer upp månens inre',
        en: "Jupiter's tidal forces heat the moon's interior",
      },
      { key: 'C', sv: 'Solens direkta uppvärmning', en: 'Direct heating from the Sun' },
    ],
    correct: 'B',
    hint: {
      sv: 'Io befinner sig i ett dragkampsspel mellan Jupiter och de andra galileiska månarna.',
      en: 'Io is caught in a gravitational tug-of-war between Jupiter and the other Galilean moons.',
    },
    explanation: {
      sv: 'Jupiters och de andra galileiska månkraften tänjer ständigt på Io, precis som att böja ett gem fram och tillbaka. Friktionen genererar enorma mängder värme i det inre.',
      en: "Jupiter's and the other Galilean moons' gravity constantly flex Io, like bending a paperclip back and forth. The friction generates enormous heat in the interior.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_io_colour',
    bodyId: 'io',
    level: 'middle',
    question: {
      sv: 'Varför har Io så många färger på ytan?',
      en: 'Why does Io have so many colours on its surface?',
    },
    options: [
      { key: 'A', sv: 'Oliktfärgade bergarter', en: 'Differently coloured rock types' },
      {
        key: 'B',
        sv: 'Svavel i olika temperaturer bildar olika färger',
        en: 'Sulphur at different temperatures forms different colours',
      },
      {
        key: 'C',
        sv: 'Målad av den första rymdmissionen',
        en: 'Painted by the first space mission',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Isen på Io är inte is utan ett annat ämne.',
      en: 'The "ice" on Io is not water ice but another substance.',
    },
    explanation: {
      sv: 'Svavel antar olika färger beroende på temperaturen — gult nära 120 °C, orange och rött vid högre temperaturer, svart vid de varmaste vulkanerna.',
      en: 'Sulphur takes on different colours depending on temperature — yellow near 120 °C, orange and red at higher temperatures, black at the hottest vents.',
    },
  },
] as const;

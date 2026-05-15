export const MERCURY_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_mercury_temp',
    bodyId: 'mercury',
    level: 'both',
    statement: {
      sv: 'Merkurius är den hetaste planeten i solsystemet eftersom den är närmast Solen.',
      en: 'Mercury is the hottest planet in the solar system because it is closest to the Sun.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad en atmosfär gör för temperaturen.',
      en: 'Think about what an atmosphere does for temperature.',
    },
    explanation: {
      sv: 'Venus är hetare trots att den är längre bort. Merkurius saknar atmosfär och kan inte hålla kvar värmen — Venus tjocka atmosfär fungerar som ett växthus.',
      en: "Venus is hotter despite being farther away. Mercury has no atmosphere to retain heat — Venus's thick atmosphere works like a greenhouse.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_mercury_day',
    bodyId: 'mercury',
    level: 'upper',
    question: {
      sv: 'Vad är märkligt med ett dygn på Merkurius?',
      en: 'What is strange about a day on Mercury?',
    },
    options: [
      { key: 'A', sv: 'Det är kortare än en timme', en: 'It is shorter than one hour' },
      {
        key: 'B',
        sv: 'Det är längre än ett år på Merkurius',
        en: 'It is longer than a year on Mercury',
      },
      {
        key: 'C',
        sv: 'Det är exakt lika långt som på Jorden',
        en: 'It is exactly as long as on Earth',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Merkurius roterar väldigt långsamt men kretsar snabbt runt Solen.',
      en: 'Mercury rotates very slowly but orbits the Sun quickly.',
    },
    explanation: {
      sv: 'Ett dygn på Merkurius tar 176 jorddagar, men ett år (ett varv runt Solen) tar bara 88 jorddagar. Alltså är dygnet dubbelt så långt som året.',
      en: 'A day on Mercury takes 176 Earth days, but a year (one orbit of the Sun) takes only 88 Earth days. So the day is twice as long as the year.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_mercury_craters',
    bodyId: 'mercury',
    level: 'middle',
    statement: {
      sv: 'Kratrarna på Merkurius är äldre än kratrarna på Månen.',
      en: 'The craters on Mercury are older than the craters on the Moon.',
    },
    correct: false,
    hint: {
      sv: 'Varför försvinner inte kratrarna på Merkurius?',
      en: "Why don't the craters on Mercury disappear?",
    },
    explanation: {
      sv: 'Kratrarna på Merkurius är inte nödvändigtvis äldre, men de bevaras lika bra eftersom ingen av kropparna har atmosfär eller väder som eroderar ytan.',
      en: "The craters on Mercury aren't necessarily older, but they're preserved just as well since neither body has an atmosphere or weather to erode the surface.",
    },
  },
] as const;

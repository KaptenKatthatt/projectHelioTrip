export const MOON_QUESTIONS = [
  {
    type: 'true-false',
    id: 'quiz_moon_locked',
    bodyId: 'moon',
    level: 'middle',
    statement: {
      sv: 'Vi på Jorden har aldrig sett Månens baksida.',
      en: 'People on Earth have never seen the far side of the Moon.',
    },
    correct: true,
    hint: {
      sv: 'Tänk på varför vi alltid ser samma sida av Månen.',
      en: 'Think about why we always see the same side of the Moon.',
    },
    explanation: {
      sv: 'Eftersom Månen är tidslåst till Jorden — den roterar lika snabbt som den kretsar — ser vi alltid samma sida. Baksidan fotograferades först 1959 av den sovjetiska sonden Luna 3.',
      en: 'Because the Moon is tidally locked to Earth — it rotates as fast as it orbits — we always see the same side. The far side was first photographed in 1959 by the Soviet Luna 3 probe.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_moon_tides',
    bodyId: 'moon',
    level: 'middle',
    question: { sv: 'Vad orsakar tidvatten på Jorden?', en: 'What causes tides on Earth?' },
    options: [
      { key: 'A', sv: 'Jordens rotation', en: "Earth's rotation" },
      { key: 'B', sv: 'Månens gravitationsdrag', en: "The Moon's gravitational pull" },
      { key: 'C', sv: 'Vindarna i haven', en: 'The winds in the oceans' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det är Månens dragkraft som "lyfter" havets vatten.',
      en: 'It\'s the Moon\'s gravitational pull that "lifts" the ocean water.',
    },
    explanation: {
      sv: 'Månens gravitation drar i Jordens hav och skapar tidvatten. Solens gravitation bidrar också, men Månens effekt är starkare trots att Solen är mycket tyngre.',
      en: "The Moon's gravity pulls on Earth's oceans to create tides. The Sun's gravity also contributes, but the Moon's effect is stronger despite the Sun being much more massive.",
    },
  },
  {
    type: 'fill-in',
    id: 'quiz_moon_astronauts',
    bodyId: 'moon',
    level: 'middle',
    question: {
      sv: 'Totalt ___ astronauter har gått på Månens yta.',
      en: "A total of ___ astronauts have walked on the Moon's surface.",
    },
    correctAnswer: '12',
    hint: {
      sv: 'Apolloprogrammet genomförde 6 landningar med 2 astronauter per landning.',
      en: 'The Apollo programme completed 6 landings with 2 astronauts per landing.',
    },
    explanation: {
      sv: 'Tolv astronauter gick på Månen under NASA:s Apolloprogram, mellan 1969 och 1972. Den siste var Harrison Schmitt och Eugene Cernan i Apollo 17.',
      en: "Twelve astronauts walked on the Moon during NASA's Apollo programme, between 1969 and 1972. The last were Harrison Schmitt and Eugene Cernan on Apollo 17.",
    },
  },
] as const;

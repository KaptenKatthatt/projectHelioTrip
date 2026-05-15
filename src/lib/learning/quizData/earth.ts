export const EARTH_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_earth_water',
    bodyId: 'earth',
    level: 'middle',
    question: {
      sv: 'Hur stor del av Jordens yta täcks av vatten?',
      en: "What fraction of Earth's surface is covered by water?",
    },
    options: [
      { key: 'A', sv: 'Ungefär 30 %', en: 'About 30%' },
      { key: 'B', sv: 'Ungefär 50 %', en: 'About 50%' },
      { key: 'C', sv: 'Ungefär 71 %', en: 'About 71%' },
    ],
    correct: 'C',
    hint: {
      sv: 'Sett från rymden är Jorden väldigt blå.',
      en: 'Seen from space, Earth looks very blue.',
    },
    explanation: {
      sv: '71 % av Jordens yta täcks av vatten — det är därför Jorden syns som en blå boll från rymden och kallas "den blå planeten".',
      en: '71% of Earth\'s surface is covered by water — that\'s why Earth appears as a blue ball from space and is called "the blue planet."',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_earth_magnetic',
    bodyId: 'earth',
    level: 'both',
    statement: {
      sv: 'Jordens magnetfält skyddar oss mot skadlig strålning från Solen.',
      en: "Earth's magnetic field protects us from harmful radiation from the Sun.",
    },
    correct: true,
    hint: {
      sv: 'Tänk på vad som händer i atmosfären när solstormar träffar Jordens magnetfält.',
      en: "Think about what happens in the atmosphere when solar storms hit Earth's magnetic field.",
    },
    explanation: {
      sv: 'Jordens magnetfält fångar upp och avleder farliga partiklar från solen. Utan det skulle UV- och partikelstrålning göra Jordens yta svår att bo på.',
      en: "Earth's magnetic field captures and deflects dangerous particles from the Sun. Without it, UV and particle radiation would make Earth's surface very difficult to inhabit.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_earth_moon_stability',
    bodyId: 'earth',
    level: 'upper',
    question: {
      sv: 'Vilken roll spelar Månen för livet på Jorden?',
      en: 'What role does the Moon play for life on Earth?',
    },
    options: [
      {
        key: 'A',
        sv: 'Den skapar Jordens syrerika atmosfär',
        en: "It creates Earth's oxygen-rich atmosphere",
      },
      {
        key: 'B',
        sv: 'Den håller Jordens lutning stabil och skapar förutsägbara årstider',
        en: "It keeps Earth's axial tilt stable, creating predictable seasons",
      },
      {
        key: 'C',
        sv: 'Den håller temperaturen uppe på natten',
        en: 'It keeps temperatures up at night',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på vad som händer med en snurra som inte har stöd.',
      en: 'Think about what happens to a spinning top without support.',
    },
    explanation: {
      sv: 'Månens gravitation stabiliserar Jordens lutning kring 23,5°. Utan Månen skulle lutningen svänga slumpmässigt och göra årstiderna oförutsägbara under miljoner år.',
      en: "The Moon's gravity stabilises Earth's tilt around 23.5°. Without the Moon, the tilt would swing randomly, making seasons unpredictable over millions of years.",
    },
  },
] as const;

export const ISS_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_iss_orbits',
    bodyId: 'iss',
    level: 'middle',
    question: {
      sv: 'Hur många gånger kretsar ISS runt Jorden varje dag?',
      en: 'How many times does the ISS orbit Earth each day?',
    },
    options: [
      { key: 'A', sv: '4 gånger', en: '4 times' },
      { key: 'B', sv: '16 gånger', en: '16 times' },
      { key: 'C', sv: '100 gånger', en: '100 times' },
    ],
    correct: 'B',
    hint: { sv: 'ISS rör sig i ungefär 28 000 km/h.', en: 'The ISS travels at about 28,000 km/h.' },
    explanation: {
      sv: 'ISS kretsar runt Jorden 16 gånger per dygn. Det innebär att astronauterna ombord upplever 16 soluppgångar och 16 solnedgångar varje dag.',
      en: 'The ISS orbits Earth 16 times per day. This means astronauts on board experience 16 sunrises and 16 sunsets every single day.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_iss_build',
    bodyId: 'iss',
    level: 'middle',
    statement: {
      sv: 'ISS byggdes i ett stycke på Jorden och sköts upp med en enda raket.',
      en: 'The ISS was built in one piece on Earth and launched with a single rocket.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på hur stor ISS är — ungefär som en fotbollsplan.',
      en: 'Think about how large the ISS is — roughly the size of a football pitch.',
    },
    explanation: {
      sv: 'ISS monterades bit för bit i rymden under 13 år, av astronauter från 15 länder. Mer än 40 rymdfärder krävdes för att frakta upp alla delar.',
      en: 'The ISS was assembled piece by piece in space over 13 years by astronauts from 15 countries. More than 40 spaceflight missions were needed to transport all the components.',
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_iss_research',
    bodyId: 'iss',
    level: 'both',
    question: {
      sv: 'Vilken typ av forskning är ISS extra värdefull för?',
      en: 'What type of research is the ISS especially valuable for?',
    },
    options: [
      {
        key: 'A',
        sv: 'Forskning om hur kroppen och material beter sig i tyngdlöshet',
        en: 'Research on how the body and materials behave in weightlessness',
      },
      { key: 'B', sv: 'Forskning om havets djupliv', en: 'Research on deep-sea life' },
      { key: 'C', sv: 'Forskning om jordbävningar', en: 'Research on earthquakes' },
    ],
    correct: 'A',
    hint: {
      sv: 'Tyngdlöshet är omöjligt att skapa på Jordens yta i längre perioder.',
      en: "Weightlessness is impossible to create on Earth's surface for extended periods.",
    },
    explanation: {
      sv: 'ISS är världens enda permanenta laboratorium i tyngdlöshet. Forskningen hjälper oss förstå hur kroppen förändras på lång rymdfärd — kunskap som behövs för framtida resor till Mars.',
      en: "The ISS is the world's only permanent laboratory in weightlessness. The research helps us understand how the body changes on long space voyages — knowledge needed for future journeys to Mars.",
    },
  },
] as const;

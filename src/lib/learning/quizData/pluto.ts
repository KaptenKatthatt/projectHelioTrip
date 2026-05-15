export const PLUTO_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_pluto_planet',
    bodyId: 'pluto',
    level: 'both',
    question: {
      sv: 'Varför är Pluto inte längre en planet?',
      en: 'Why is Pluto no longer a planet?',
    },
    options: [
      { key: 'A', sv: 'Den är för liten', en: 'It is too small' },
      {
        key: 'B',
        sv: 'Den har inte rensat sin omloppsbana på andra objekt',
        en: 'It has not cleared its orbit of other objects',
      },
      {
        key: 'C',
        sv: 'Den befinner sig utanför solsystemet',
        en: 'It is outside the solar system',
      },
    ],
    correct: 'B',
    hint: {
      sv: 'En av tre krav för att kallas planet är att dominera sin omloppsbana.',
      en: 'One of three requirements to be called a planet is to dominate your orbit.',
    },
    explanation: {
      sv: 'Enligt IAUs definition från 2006 måste en planet ha rensat sin omloppsbana. Pluto delar sin bana med många andra Kuiperbältsobjekt och uppfyller därför inte kravet.',
      en: "According to the IAU's 2006 definition, a planet must have cleared its orbit. Pluto shares its orbit with many other Kuiper Belt objects and therefore doesn't meet the requirement.",
    },
  },
  {
    type: 'multiple-choice',
    id: 'quiz_pluto_temperature',
    bodyId: 'pluto',
    level: 'middle',
    question: {
      sv: 'Ungefär hur kallt är det på Pluto?',
      en: 'Approximately how cold is it on Pluto?',
    },
    options: [
      { key: 'A', sv: '–50 °C', en: '–50 °C' },
      { key: 'B', sv: '–130 °C', en: '–130 °C' },
      { key: 'C', sv: '–230 °C', en: '–230 °C' },
    ],
    correct: 'C',
    hint: {
      sv: 'Pluto är extremt långt från Solen och nästan vid den absoluta nollpunkten.',
      en: 'Pluto is extremely far from the Sun and near absolute zero.',
    },
    explanation: {
      sv: 'Pluto håller ungefär –230 °C. Den absoluta nollpunkten (kallaste möjliga) är –273 °C, så Pluto är bara 43 grader från det fysikaliska bottnet.',
      en: 'Pluto is about –230 °C. Absolute zero (the coldest possible) is –273 °C, so Pluto is just 43 degrees from the physical minimum.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_pluto_heart',
    bodyId: 'pluto',
    level: 'middle',
    statement: {
      sv: 'Pluto har ett hjärtformat område av is som hittades av rymdsonden New Horizons 2015.',
      en: 'Pluto has a heart-shaped region of ice discovered by the New Horizons spacecraft in 2015.',
    },
    correct: true,
    hint: {
      sv: 'New Horizons flög förbi Pluto 2015 efter en resa på nästan tio år.',
      en: 'New Horizons flew past Pluto in 2015 after an almost ten-year journey.',
    },
    explanation: {
      sv: 'Tombaugh Regio är ett gigantiskt hjärtformat område av kvävesis på Plutos yta. Det var en av de mest ikoniska bilderna från New Horizons uppdrag.',
      en: "Tombaugh Regio is a giant heart-shaped region of nitrogen ice on Pluto's surface. It was one of the most iconic images from the New Horizons mission.",
    },
  },
] as const;

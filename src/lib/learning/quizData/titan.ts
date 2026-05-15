export const TITAN_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_titan_lakes',
    bodyId: 'titan',
    level: 'both',
    question: {
      sv: 'Vad finns det sjöar av på Titans yta?',
      en: "What are the lakes on Titan's surface made of?",
    },
    options: [
      { key: 'A', sv: 'Flytande vatten', en: 'Liquid water' },
      { key: 'B', sv: 'Flytande metan och etan', en: 'Liquid methane and ethane' },
      { key: 'C', sv: 'Smält is', en: 'Melted ice' },
    ],
    correct: 'B',
    hint: {
      sv: 'Titan är för kallt för flytande vatten, men ett annat ämne förblir flytande vid –179 °C.',
      en: 'Titan is too cold for liquid water, but another substance remains liquid at –179 °C.',
    },
    explanation: {
      sv: 'Titans sjöar och hav är fyllda med flytande metan och etan — väteföreningar som är gas på Jorden men flytande vid Titans extrema kyla på –179 °C.',
      en: "Titan's lakes and seas are filled with liquid methane and ethane — hydrocarbon compounds that are gases on Earth but liquid at Titan's extreme cold of –179 °C.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_titan_atmosphere',
    bodyId: 'titan',
    level: 'middle',
    statement: {
      sv: 'Titan har en tjockare atmosfär än Jorden.',
      en: 'Titan has a thicker atmosphere than Earth.',
    },
    correct: true,
    hint: {
      sv: 'Titan är ovanlig — de flesta månar saknar atmosfär helt.',
      en: 'Titan is unusual — most moons have no atmosphere at all.',
    },
    explanation: {
      sv: 'Titans atmosfärstryck vid ytan är ungefär 1,5 gånger högre än Jordens. Atmosfären domineras av kväve, precis som Jordens, med en tjock orange dimma av kolväten.',
      en: "Titan's atmospheric pressure at the surface is about 1.5 times higher than Earth's. The atmosphere is dominated by nitrogen, just like Earth's, with a thick orange hydrocarbon haze.",
    },
  },
  {
    type: 'true-false',
    id: 'quiz_titan_rain',
    bodyId: 'titan',
    level: 'upper',
    statement: {
      sv: 'Det regnar och snöar på Titan, men med metan istället för vatten.',
      en: 'It rains and snows on Titan, but with methane instead of water.',
    },
    correct: true,
    hint: {
      sv: 'Titan har en komplett vädercykel, men med ett annat ämne än vatten.',
      en: 'Titan has a complete weather cycle, but with a different substance than water.',
    },
    explanation: {
      sv: 'Titan har en fullständig metancykel: metan avdunstar, bildar moln, regnar ner och rinner till sjöar — precis som vattnets kretslopp på Jorden, men vid –179 °C och med metan.',
      en: 'Titan has a complete methane cycle: methane evaporates, forms clouds, rains down and flows into lakes — exactly like the water cycle on Earth, but at –179 °C and with methane.',
    },
  },
] as const;

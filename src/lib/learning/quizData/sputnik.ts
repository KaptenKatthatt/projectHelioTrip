export const SPUTNIK_QUESTIONS = [
  {
    type: 'multiple-choice',
    id: 'quiz_sputnik_year',
    bodyId: 'sputnik',
    level: 'both',
    question: { sv: 'Vilket år sköts Sputnik 1 upp?', en: 'In what year was Sputnik 1 launched?' },
    options: [
      { key: 'A', sv: '1945', en: '1945' },
      { key: 'B', sv: '1957', en: '1957' },
      { key: 'C', sv: '1969', en: '1969' },
    ],
    correct: 'B',
    hint: {
      sv: 'Det skedde 12 år innan människan landade på Månen.',
      en: 'It happened 12 years before humans landed on the Moon.',
    },
    explanation: {
      sv: 'Sputnik 1 sköts upp 1957 och startade rymdkapplöpningen mellan USA och Sovjetunionen.',
      en: 'Sputnik 1 was launched in 1957, starting the Space Race between the USA and the Soviet Union.',
    },
  },
  {
    type: 'true-false',
    id: 'quiz_sputnik_camera',
    bodyId: 'sputnik',
    level: 'middle',
    statement: {
      sv: 'Sputnik 1 tog de första fotografierna av Jorden från rymden.',
      en: 'Sputnik 1 took the very first photographs of Earth from space.',
    },
    correct: false,
    hint: {
      sv: 'Tänk på vad satelliten var känd för att sända ut för slags signal.',
      en: 'Think about what kind of signal the satellite was famous for transmitting.',
    },
    explanation: {
      sv: 'Den hade ingen kamera alls. Den sände bara ut en pipsignal via radio för att bevisa att den var i omloppsbana.',
      en: 'It had no camera at all. It only transmitted a radio beep to prove it was in orbit.',
    },
  },
  {
    type: 'fill-in',
    id: 'quiz_sputnik_size',
    bodyId: 'sputnik',
    level: 'upper',
    question: {
      sv: 'Sputnik 1 var ganska liten, den hade en diameter på bara ___ cm.',
      en: 'Sputnik 1 was quite small, with a diameter of only ___ cm.',
    },
    correctAnswer: '58',
    hint: { sv: 'Strax över en halvmeter.', en: 'Just over half a meter.' },
    explanation: {
      sv: 'Den var ungefär lika stor som en badboll (58 cm). Mänsklighetens första steg ut i rymden var ganska litet!',
      en: "It was about the size of a beach ball (58 cm). Humanity's first step into space was quite small!",
    },
  },
] as const;

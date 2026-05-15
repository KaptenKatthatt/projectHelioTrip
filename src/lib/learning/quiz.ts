import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';
import { ISS } from './quizData/iss';
import { TRITON } from './quizData/triton';
import { TITAN } from './quizData/titan';
import { CALLISTO } from './quizData/callisto';
import { GANYMEDE } from './quizData/ganymede';
import { EUROPA } from './quizData/europa';
import { IO } from './quizData/io';
import { MOON } from './quizData/moon';
import { PLUTO } from './quizData/pluto';
import { NEPTUNE } from './quizData/neptune';
import { URANUS } from './quizData/uranus';
import { SATURN } from './quizData/saturn';
import { JUPITER } from './quizData/jupiter';
import { MARS } from './quizData/mars';
import { EARTH } from './quizData/earth';
import { VENUS } from './quizData/venus';
import { MERCURY } from './quizData/mercury';

type MultipleChoiceQuestion = {
  readonly type: 'multiple-choice';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly question: { readonly sv: string; readonly en: string };
  readonly options: readonly [
    { readonly key: 'A'; readonly sv: string; readonly en: string },
    { readonly key: 'B'; readonly sv: string; readonly en: string },
    { readonly key: 'C'; readonly sv: string; readonly en: string },
  ];
  readonly correct: 'A' | 'B' | 'C';
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

type TrueFalseQuestion = {
  readonly type: 'true-false';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly statement: { readonly sv: string; readonly en: string };
  readonly correct: boolean;
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

type FillInQuestion = {
  readonly type: 'fill-in';
  readonly id: string;
  readonly bodyId: BodyId;
  readonly level: FactCardLevel;
  readonly question: { readonly sv: string; readonly en: string };
  readonly correctAnswer: string;
  readonly hint: { readonly sv: string; readonly en: string };
  readonly explanation: { readonly sv: string; readonly en: string };
};

export type QuizQuestion = MultipleChoiceQuestion | TrueFalseQuestion | FillInQuestion;

export const QUIZ_QUESTIONS: ReadonlyArray<QuizQuestion> = [
  ...SUN_QUESTIONS,

  ...MERCURY,
  ...VENUS,
  ...EARTH,
  ...MARS,
  ...JUPITER,
  ...SATURN,
  ...URANUS,
  ...NEPTUNE,
  ...PLUTO,
  ...MOON,
  ...IO,
  ...EUROPA,
  ...GANYMEDE,
  ...CALLISTO,
  ...TITAN,
  ...TRITON,
  ...ISS,
  // SPUTNIK
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
  // GRAVITY SLING (adventure mission specific — no bodyId)
  {
    type: 'multiple-choice',
    id: 'quiz_gravity_sling_mechanic',
    bodyId: 'jupiter',
    level: 'upper',
    question: {
      sv: 'Vad händer med en rymdsond som utför en gravitationsslinga runt Jupiter?',
      en: 'What happens to a spacecraft performing a gravity slingshot around Jupiter?',
    },
    options: [
      { key: 'A', sv: 'Den saktar ner och bränslebesparar', en: 'It slows down and saves fuel' },
      {
        key: 'B',
        sv: 'Den ökar sin hastighet utan att bränna extra bränsle',
        en: 'It increases its speed without burning extra fuel',
      },
      {
        key: 'C',
        sv: 'Den fastnar i Jupiters omloppsbana',
        en: "It gets trapped in Jupiter's orbit",
      },
    ],
    correct: 'B',
    hint: {
      sv: 'Tänk på att Jupiter rör sig snabbt i sin bana — det är rörelseenergin som "delas".',
      en: 'Think of Jupiter moving fast in its orbit — it\'s this kinetic energy that gets "shared."',
    },
    explanation: {
      sv: 'Rymdsonden flyger in mot Jupiter i en vinkel, svänger runt den och åker ut snabbare. Den "stjäl" en pytteliten del av Jupiters rörelseenergi — för liten för att märkas på Jupiter, men enorm för sonden.',
      en: 'The spacecraft flies toward Jupiter at an angle, swings around it and exits faster. It "steals" a tiny fraction of Jupiter\'s kinetic energy — too small to notice on Jupiter, but enormous for the spacecraft.',
    },
  },
];

export const getQuizQuestionsForBody = (
  bodyId: BodyId,
  level: FactCardLevel,
): ReadonlyArray<QuizQuestion> => {
  if (level === 'both') {
    return QUIZ_QUESTIONS.filter((q) => q.bodyId === bodyId);
  }
  return QUIZ_QUESTIONS.filter(
    (q) => q.bodyId === bodyId && (q.level === level || q.level === 'both'),
  );
};

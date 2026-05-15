import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';
import { GRAVITY_SLING } from './quizData/gravitySling';
import { SPUTNIK } from './quizData/sputnik';
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
  ...SPUTNIK,
  ...GRAVITY_SLING,
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

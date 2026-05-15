import type { BodyId } from '../bodies';
import type { FactCardLevel } from './bodyContent';
import { SUN_QUESTIONS } from './quizData/sun';
import { GRAVITY_SLING_QUESTIONS } from './quizData/gravitySling';
import { SPUTNIK_QUESTIONS } from './quizData/sputnik';
import { ISS_QUESTIONS } from './quizData/iss';
import { TRITON_QUESTIONS } from './quizData/triton';
import { TITAN_QUESTIONS } from './quizData/titan';
import { CALLISTO_QUESTIONS } from './quizData/callisto';
import { GANYMEDE_QUESTIONS } from './quizData/ganymede';
import { EUROPA_QUESTIONS } from './quizData/europa';
import { IO_QUESTIONS } from './quizData/io';
import { MOON_QUESTIONS } from './quizData/moon';
import { PLUTO_QUESTIONS } from './quizData/pluto';
import { NEPTUNE_QUESTIONS } from './quizData/neptune';
import { URANUS_QUESTIONS } from './quizData/uranus';
import { SATURN_QUESTIONS } from './quizData/saturn';
import { JUPITER_QUESTIONS } from './quizData/jupiter';
import { MARS_QUESTIONS } from './quizData/mars';
import { EARTH_QUESTIONS } from './quizData/earth';
import { VENUS_QUESTIONS } from './quizData/venus';
import { MERCURY_QUESTIONS } from './quizData/mercury';

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

  ...MERCURY_QUESTIONS,
  ...VENUS_QUESTIONS,
  ...EARTH_QUESTIONS,
  ...MARS_QUESTIONS,
  ...JUPITER_QUESTIONS,
  ...SATURN_QUESTIONS,
  ...URANUS_QUESTIONS,
  ...NEPTUNE_QUESTIONS,
  ...PLUTO_QUESTIONS,
  ...MOON_QUESTIONS,
  ...IO_QUESTIONS,
  ...EUROPA_QUESTIONS,
  ...GANYMEDE_QUESTIONS,
  ...CALLISTO_QUESTIONS,
  ...TITAN_QUESTIONS,
  ...TRITON_QUESTIONS,
  ...ISS_QUESTIONS,
  ...SPUTNIK_QUESTIONS,
  ...GRAVITY_SLING_QUESTIONS,
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

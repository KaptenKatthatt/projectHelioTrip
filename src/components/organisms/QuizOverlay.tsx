import { X, Star } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useStore } from "../../store/useStore";
import { QUIZ_QUESTIONS } from "../../lib/learning/quiz";

type Phase = "question" | "result";

const starCount = (attempts: number): number =>
  attempts === 1 ? 3 : attempts === 2 ? 2 : 1;

export const QuizOverlay = () => {
  const pendingQuizId = useStore((s) => s.pendingQuizId);
  if (!pendingQuizId) return null;
  // key forces a full remount — and therefore a clean state — whenever the
  // quiz id changes, making it safe to open a new quiz while one is in progress.
  return <QuizOverlayInner key={pendingQuizId} quizId={pendingQuizId} />;
};

const QuizOverlayInner = ({ quizId }: { quizId: string }) => {
  const { t } = useTranslation();
  const locale = useStore((s) => s.locale);
  const dismissQuiz = useStore((s) => s.dismissQuiz);
  const recordQuizResult = useStore((s) => s.recordQuizResult);

  const [phase, setPhase] = useState<Phase>("question");
  const [attempts, setAttempts] = useState(0);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [fillValue, setFillValue] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [earnedStars, setEarnedStars] = useState(0);
  const [wrongFeedback, setWrongFeedback] = useState(false);

  const question = QUIZ_QUESTIONS.find((q) => q.id === quizId);
  if (!question) return null;

  const handleClose = () => {
    dismissQuiz();
  };

  const checkAnswer = (answer: string): boolean => {
    if (question.type === "multiple-choice") return answer === question.correct;
    if (question.type === "true-false") return answer === String(question.correct);
    if (question.type === "fill-in")
      return answer.trim().toLowerCase() === question.correctAnswer.toLowerCase();
    return false;
  };

  const handleSubmit = (answer: string) => {
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (checkAnswer(answer)) {
      const stars = starCount(nextAttempts);
      setEarnedStars(stars);
      recordQuizResult(question.id, stars);
      setPhase("result");
      setWrongFeedback(false);
    } else {
      setShowHint(true);
      setWrongFeedback(true);
      setSelectedKey(null);
    }
  };

  const explanation =
    question.type === "true-false"
      ? question.explanation[locale]
      : "explanation" in question
        ? (question as { explanation: { sv: string; en: string } }).explanation[locale]
        : "";

  const hint = question.hint[locale];

  return (
    <div
      className="pointer-events-auto fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#08090f] p-5 shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        {phase === "question" && (
          <QuizQuestion
            question={question}
            locale={locale}
            selectedKey={selectedKey}
            setSelectedKey={setSelectedKey}
            fillValue={fillValue}
            setFillValue={setFillValue}
            showHint={showHint}
            hint={hint}
            wrongFeedback={wrongFeedback}
            onSubmit={handleSubmit}
            t={t}
          />
        )}

        {phase === "result" && (
          <QuizResult
            earnedStars={earnedStars}
            explanation={explanation}
            onClose={handleClose}
            t={t}
          />
        )}
      </div>
    </div>
  );
};

type QuizQuestion = import("../../lib/learning/quiz").QuizQuestion;
type Translation = import("../../i18n/translations").Translation;

const QuizQuestion = ({
  question,
  locale,
  selectedKey,
  setSelectedKey,
  fillValue,
  setFillValue,
  showHint,
  hint,
  wrongFeedback,
  onSubmit,
  t,
}: {
  question: QuizQuestion;
  locale: "sv" | "en";
  selectedKey: string | null;
  setSelectedKey: (k: string | null) => void;
  fillValue: string;
  setFillValue: (v: string) => void;
  showHint: boolean;
  hint: string;
  wrongFeedback: boolean;
  onSubmit: (answer: string) => void;
  t: Translation;
}) => {
  const questionText =
    question.type === "multiple-choice"
      ? question.question[locale]
      : question.type === "fill-in"
        ? question.question[locale]
        : question.statement[locale];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-medium text-white leading-snug pr-6">{questionText}</p>

      {wrongFeedback && (
        <p className="text-xs font-medium text-rose-400">{t.learn.ui.quizTryAgain}</p>
      )}

      {showHint && (
        <div className="rounded-lg bg-amber-400/10 border border-amber-400/20 px-3 py-2">
          <p className="text-xs text-amber-200">
            <span className="font-semibold">{t.learn.ui.quizHint} </span>
            {hint}
          </p>
        </div>
      )}

      {question.type === "multiple-choice" && (
        <div className="flex flex-col gap-2">
          {question.options.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => {
                setSelectedKey(opt.key);
                onSubmit(opt.key);
              }}
              className={[
                "w-full rounded-xl border px-3 py-2.5 text-left text-sm transition",
                selectedKey === opt.key
                  ? "border-cyan-400/60 bg-cyan-400/15 text-cyan-100"
                  : "border-white/10 bg-white/5 text-white/80 hover:border-white/20 hover:bg-white/10",
              ].join(" ")}
            >
              <span className="font-semibold mr-2 text-white/40">{opt.key}</span>
              {opt[locale]}
            </button>
          ))}
        </div>
      )}

      {question.type === "true-false" && (
        <div className="flex gap-2">
          {[
            { value: "true", label: locale === "sv" ? "Sant" : "True" },
            { value: "false", label: locale === "sv" ? "Falskt" : "False" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                setSelectedKey(opt.value);
                onSubmit(opt.value);
              }}
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/80 transition hover:border-white/20 hover:bg-white/10"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {question.type === "fill-in" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(fillValue);
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            value={fillValue}
            onChange={(e) => setFillValue(e.target.value)}
            placeholder={t.learn.ui.quizFillPlaceholder}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white placeholder-white/30 focus:border-cyan-400/50 focus:outline-none focus:ring-1 focus:ring-cyan-400/30"
          />
          <button
            type="submit"
            disabled={fillValue.trim().length === 0}
            className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20 disabled:opacity-40"
          >
            {t.learn.ui.quizSubmit}
          </button>
        </form>
      )}
    </div>
  );
};

const QuizResult = ({
  earnedStars,
  explanation,
  onClose,
  t,
}: {
  earnedStars: number;
  explanation: string;
  onClose: () => void;
  t: Translation;
}) => {
  const xpAmount =
    earnedStars === 3 ? 30 : earnedStars === 2 ? 20 : 10;

  return (
    <div className="flex flex-col gap-4 items-center text-center">
      <div className="flex gap-1">
        {[1, 2, 3].map((n) => (
          <Star
            key={n}
            className={[
              "h-7 w-7 transition-all",
              n <= earnedStars
                ? "fill-amber-400 text-amber-400"
                : "fill-white/10 text-white/20",
            ].join(" ")}
            aria-hidden
          />
        ))}
      </div>
      <p className="text-sm font-semibold text-white">
        {t.learn.ui.quizStars
          .replace("{n}", String(earnedStars))
          .replace("{xp}", String(xpAmount))}
      </p>
      {explanation && (
        <p className="text-xs text-white/60 leading-relaxed">
          <span className="font-semibold text-white/80">{t.learn.ui.quizCorrect}</span>
          {explanation}
        </p>
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10"
      >
        {t.ui.aboutClose}
      </button>
    </div>
  );
};

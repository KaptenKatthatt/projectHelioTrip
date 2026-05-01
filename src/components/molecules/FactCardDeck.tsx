import { ChevronRight } from "lucide-react";
import type { BodyId } from "../../lib/bodies";
import { getFactCardsForBody } from "../../lib/learning/bodyContent";
import { getQuizQuestionsForBody } from "../../lib/learning/quiz";
import { useStore } from "../../store/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import { LevelToggle } from "../atoms/LevelToggle";
import { FactCard } from "./FactCard";

type Props = {
  readonly bodyId: BodyId;
  readonly showLevelToggle?: boolean;
};

export const FactCardDeck = ({ bodyId, showLevelToggle = false }: Props) => {
  const triggerQuiz = useStore((s) => s.triggerQuiz);
  const { t, locale } = useTranslation();

  // Show all facts regardless of level
  const cards = getFactCardsForBody(bodyId, 'both');
  const quizQuestions = getQuizQuestionsForBody(bodyId, 'both');
  const hasQuiz = quizQuestions.length > 0;

  const handleTestYourself = () => {
    if (!hasQuiz) return;
    const first = quizQuestions[0];
    if (!first) return;
    triggerQuiz(first.id);
  };

  return (
    <div className="flex flex-col h-full relative">
      {cards.length === 0 ? (
        <p className="text-xs text-white/40 text-center py-4">
          {t.learn.ui.noFactCards}
        </p>
      ) : (
        <div className="flex-1 space-y-2">
          {cards.map((card) => (
            <FactCard key={card.id} card={card} locale={locale} />
          ))}
        </div>
      )}

      {hasQuiz && (
        <div className="sticky bottom-0 pt-3 mt-2 border-t border-white/10 bg-[#05060a] pb-2 z-10">
          <button
            type="button"
            onClick={handleTestYourself}
            className="pointer-events-auto w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-400/10 px-3 py-3 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/20"
          >
            {t.learn.ui.testYourself}
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
};

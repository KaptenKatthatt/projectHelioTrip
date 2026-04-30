import { useTranslation } from "../../hooks/useTranslation";
import { getDailyChallenge } from "../../lib/learning/dailyChallenges";

type Props = {
  readonly className?: string;
};

export const DailyChallengeCard = ({ className }: Props) => {
  const { locale, t } = useTranslation();
  const challenge = getDailyChallenge(new Date());

  if (!challenge) return null;

  return (
    <div
      className={
        "pointer-events-auto w-full rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-md " +
        (className ?? "")
      }
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-white/45">
        {t.phase3.dailyChallenge}
      </p>
      <p className="mt-1 text-sm font-semibold text-white leading-snug">
        {challenge.title[locale]}
      </p>
      <p className="mt-1 text-xs text-white/60 leading-relaxed">
        {challenge.description[locale]}
      </p>
    </div>
  );
};

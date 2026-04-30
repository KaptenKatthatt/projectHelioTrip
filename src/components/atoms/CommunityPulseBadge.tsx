import { Users } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getCommunityPulse } from "../../lib/learning/communityPulse";

export const CommunityPulseBadge = () => {
  const { locale } = useTranslation();
  const pulse = useMemo(() => getCommunityPulse(new Date()), []);

  if (!pulse) return null;

  return (
    <div className="pointer-events-auto inline-flex max-w-88 items-center gap-1.5 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-2.5 py-1 text-xs text-emerald-100">
      <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">
        {locale === "sv"
          ? `${pulse.completedChallenges} utmaningar klara i veckan - ${pulse.topBodySv} populärast`
          : `${pulse.completedChallenges} challenges completed this week - ${pulse.topBodyEn} most popular`}
      </span>
    </div>
  );
};

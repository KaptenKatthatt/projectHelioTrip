import { CloudSun } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getSpaceWeatherEventForDate } from "../../lib/learning/spaceWeatherEvents";

export const SpaceWeatherBadge = () => {
  const { locale } = useTranslation();
  const event = useMemo(() => getSpaceWeatherEventForDate(new Date()), []);

  if (!event) return null;

  return (
    <div className="pointer-events-auto inline-flex max-w-88 items-center gap-1.5 rounded-xl border border-violet-300/35 bg-violet-300/15 px-2.5 py-1 text-xs text-violet-100">
      <CloudSun className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="truncate">{locale === "sv" ? event.sv : event.en}</span>
    </div>
  );
};

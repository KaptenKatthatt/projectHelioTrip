import { X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { useActiveBodyViewGameMode } from "../../hooks/useActiveBodyViewGameMode";
import { useStore } from "../../store/useStore";
import { PLANETS } from "../../lib/planets";
import { MOONS } from "../../lib/moons";
import { SATELLITES } from "../../lib/satellites";
import { resolveNarrativeHint } from "../../lib/learning/narrativeHooks";

export const NarrativeMessage = () => {
  const { t, locale } = useTranslation();
  const { activeBody, gameMode } = useActiveBodyViewGameMode();
  const visitedBodies = useStore((s) => s.visitedBodies);
  const [dismissedIds, setDismissedIds] = useState<ReadonlySet<string>>(new Set());

  const totalBodies = PLANETS.length + MOONS.length + SATELLITES.length;

  const hint = resolveNarrativeHint(
    { gameMode, activeBody, visitedCount: visitedBodies.length, totalBodies },
    dismissedIds,
    locale,
  );

  if (!hint) return null;

  const dismiss = () => {
    setDismissedIds((prev) => new Set([...prev, hint.id]));
  };

  return (
    <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-cyan-400/70">
          {t.learn.ui.narratorAstra}
        </span>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss hint"
          className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-white/40 transition hover:text-white/70"
        >
          <X className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
      <p className="mt-1.5 text-xs text-white/70 leading-relaxed">{hint.text}</p>
    </div>
  );
};

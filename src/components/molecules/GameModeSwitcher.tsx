import { useTranslation } from "../../hooks/useTranslation";
import { GAME_MODES, type GameMode } from "../../lib/missions/types";
import { useStore } from "../../store/useStore";

type GameModeSwitcherProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

export const GameModeSwitcher = ({
  className,
  compact = false,
}: GameModeSwitcherProps) => {
  const { t } = useTranslation();
  const gameMode = useStore((s) => s.gameMode);
  const setGameMode = useStore((s) => s.setGameMode);

  const labels: Record<GameMode, string> = {
    explore: t.phase3.gameMode.explore,
    learn: t.phase3.gameMode.learn,
    challenge: t.phase3.gameMode.challenge,
  };
  const activeClass: Record<GameMode, string> = {
    explore: "bg-white text-black ring-1 ring-white/80",
    learn: "bg-cyan-300 text-slate-950 ring-1 ring-cyan-200/90",
    challenge: "bg-emerald-300 text-slate-950 ring-1 ring-emerald-200/90",
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.phase3.gameMode.label}
      className={
        "pointer-events-auto flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1 " +
        (className ?? "")
      }
    >
      {GAME_MODES.map((mode) => {
        const active = gameMode === mode;
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setGameMode(mode)}
            className={
              "rounded-lg transition " +
              (compact
                ? "px-2 py-1 text-[11px] font-medium tracking-wide "
                : "px-3 py-1.5 text-xs font-medium tracking-wide ") +
              (active
                ? activeClass[mode]
                : "text-white/60 hover:text-white hover:bg-white/10")
            }
          >
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
};

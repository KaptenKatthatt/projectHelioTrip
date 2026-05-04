import { useTranslation } from "../../hooks/useTranslation";
import { GAME_MODES, type GameMode } from "../../lib/missions/types";
import { useStore } from "../../store/useStore";

const MODE_ACTIVE_CLASS: Record<GameMode, string> = {
  explore: "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]",
  learn: "bg-cyan-400 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)]",
  challenge: "bg-emerald-400 text-black shadow-[0_0_15px_rgba(52,211,153,0.3)]",
  lab: "bg-indigo-400 text-black shadow-[0_0_15px_rgba(129,140,248,0.3)]",
};

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
  const isStarsActive = useStore((s) => s.selectedConstellation !== null);

  const travelToOverview = useStore((s) => s.travelToOverview);

  const handleModeClick = (mode: GameMode): void => {
    if (gameMode === mode) {
      if (mode !== "explore") {
        setGameMode("explore");
      } else {
        travelToOverview();
      }
      return;
    }
    setGameMode(mode);
  };

  const labels: Record<GameMode, string> = {
    explore: t.phase3.gameMode.explore,
    learn: t.phase3.gameMode.learn,
    challenge: t.phase3.gameMode.challenge,
    lab: t.phase3.gameMode.lab,
  };

  const descriptions: Record<GameMode, string> = {
    explore: t.phase3.gameMode.exploreDescription,
    learn: t.phase3.gameMode.learnDescription,
    challenge: t.phase3.gameMode.challengeDescription,
    lab: t.phase3.gameMode.labDescription,
  };

  return (
    <div
      role="radiogroup"
      aria-label={t.phase3.gameMode.label}
      className={
        "pointer-events-auto flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl " +
        (className ?? "")
      }
    >
      {!compact && (
        <span className="ds-eyebrow px-2 pt-1">{t.phase3.gameMode.label}</span>
      )}
      <div className="flex items-center gap-1">
        {GAME_MODES.map((mode) => {
          const active = gameMode === mode;
          const disabled = mode === "lab" && isStarsActive;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={disabled}
              title={disabled ? undefined : descriptions[mode]}
              onClick={() => handleModeClick(mode)}
              className={
                "group relative flex flex-1 flex-col items-center justify-center rounded-xl transition-all duration-300 " +
                (compact
                  ? "px-2 py-1.5 text-[10px] font-bold "
                  : "px-3 py-2 text-xs font-bold ") +
                (disabled
                  ? "text-white/20 cursor-not-allowed "
                  : active
                    ? MODE_ACTIVE_CLASS[mode]
                    : "text-white/50 hover:bg-white/5 hover:text-white")
              }
            >
              <span className="relative z-10 uppercase tracking-wider">
                {labels[mode]}
              </span>
              {active && !compact && !disabled && (
                <div className="absolute -bottom-8 left-1/2 w-max -translate-x-1/2 rounded-lg bg-black/80 px-2 py-1 text-[10px] font-medium text-white/70 opacity-0 transition-opacity group-hover:opacity-100">
                  {descriptions[mode]}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

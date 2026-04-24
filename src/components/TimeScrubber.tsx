import { Pause, Play } from 'lucide-react';
import { SolarSystemStartIcon } from './SolarSystemStartIcon';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

const SPEEDS: readonly number[] = [0.25, 1, 7, 30, 365];

type TimeScrubberProps = {
  readonly className?: string;
};

export const TimeScrubber = ({ className }: TimeScrubberProps) => {
  const { t } = useTranslation();

  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const timeScale = useStore((s) => s.timeScale);
  const setTimeScale = useStore((s) => s.setTimeScale);
  const resetSolarSystemStart = useStore((s) => s.resetSolarSystemStart);

  return (
    <div
      className={
        className ??
        'pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md sm:px-4'
      }
    >
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <button
          type="button"
          onClick={resetSolarSystemStart}
          aria-label={t.ui.start}
          className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 text-sm font-medium text-white transition hover:bg-white/15"
        >
          <SolarSystemStartIcon className="h-4 w-4 shrink-0" />
          {t.ui.start}
        </button>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? t.ui.pause : t.ui.play}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-[1px]" />
          )}
        </button>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTimeScale(s)}
              aria-pressed={timeScale === s}
              className={
                'rounded-lg px-2 py-1 font-mono text-xs transition ' +
                (timeScale === s
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white')
              }
            >
              {s < 1 ? s.toFixed(2) : s.toString()}
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

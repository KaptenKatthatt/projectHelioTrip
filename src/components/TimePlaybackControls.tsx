import { Pause, Play } from 'lucide-react';
import { useIsMobileLayout } from '../hooks/useIsMobileLayout';
import { SolarSystemStartIcon } from './SolarSystemStartIcon';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { TIME_SPEED_PRESETS } from '../lib/timePlayback';

type TimePlaybackControlsProps = {
  readonly className?: string;
};

export const TimePlaybackControls = ({ className }: TimePlaybackControlsProps) => {
  const { t } = useTranslation();
  const mobileLayout = useIsMobileLayout();

  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const timeScale = useStore((s) => s.timeScale);
  const setTimeScale = useStore((s) => s.setTimeScale);
  const resetSolarSystemStart = useStore((s) => s.resetSolarSystemStart);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const timePlaybackDisabled = selectedConstellation !== null;

  return (
    <div
      className={
        className ??
        'pointer-events-auto mx-auto w-full max-w-3xl rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md ' +
        (mobileLayout ? '' : 'sm:px-4')
      }
    >
      <div
        className={
          mobileLayout
            ? 'flex flex-wrap items-center gap-2'
            : 'flex flex-wrap items-center gap-2 sm:flex-nowrap'
        }
      >
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
          disabled={timePlaybackDisabled}
          aria-label={isPlaying ? t.ui.pause : t.ui.play}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white/5"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 translate-x-[1px]" />
          )}
        </button>

        <div className="flex flex-wrap items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
          {TIME_SPEED_PRESETS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTimeScale(s)}
              disabled={timePlaybackDisabled}
              aria-pressed={timeScale === s}
              className={
                'rounded-lg px-2 py-1 font-mono text-xs transition disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent ' +
                (timeScale === s
                  ? 'bg-white text-black disabled:hover:text-black'
                  : 'text-white/60 hover:text-white disabled:hover:text-white/60')
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

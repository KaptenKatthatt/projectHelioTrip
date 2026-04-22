import { useMemo, type ChangeEvent } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';
import { MS_PER_DAY } from '../lib/constants';

const SCRUB_RANGE_DAYS = 365 * 5;
const SPEEDS: readonly number[] = [0.25, 1, 7, 30, 365];

export const TimeScrubber = () => {
  const { t, locale } = useTranslation();

  const simTime = useStore((s) => s.simulationTime);
  const setSimulationTime = useStore((s) => s.setSimulationTime);
  const isPlaying = useStore((s) => s.isPlaying);
  const togglePlay = useStore((s) => s.togglePlay);
  const timeScale = useStore((s) => s.timeScale);
  const setTimeScale = useStore((s) => s.setTimeScale);
  const resetTime = useStore((s) => s.resetSimulationTime);

  const origin = useMemo(() => {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const offsetDays = (simTime.getTime() - origin) / MS_PER_DAY;
  const clampedOffset = Math.max(
    -SCRUB_RANGE_DAYS,
    Math.min(SCRUB_RANGE_DAYS, offsetDays),
  );

  const onScrub = (e: ChangeEvent<HTMLInputElement>): void => {
    const days = Number(e.target.value);
    setSimulationTime(new Date(origin + days * MS_PER_DAY));
  };

  const dateFmt = new Intl.DateTimeFormat(locale === 'sv' ? 'sv-SE' : 'en-US', {
    dateStyle: 'long',
  });
  const speedFmt = new Intl.NumberFormat(locale === 'sv' ? 'sv-SE' : 'en-US');

  return (
    <div className="pointer-events-auto mx-auto flex w-full max-w-3xl items-center gap-4 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur-md">
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

      <button
        type="button"
        onClick={resetTime}
        aria-label={t.ui.resetTime}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <input
          type="range"
          min={-SCRUB_RANGE_DAYS}
          max={SCRUB_RANGE_DAYS}
          step={0.5}
          value={clampedOffset}
          onChange={onScrub}
          className="w-full"
          aria-label={t.ui.simDate}
        />
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-white/80">
            {dateFmt.format(simTime)}
          </span>
          <span className="text-white/40">
            {t.ui.speed}: {speedFmt.format(timeScale)} d/s
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1 rounded-xl border border-white/10 bg-white/5 p-1">
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
  );
};

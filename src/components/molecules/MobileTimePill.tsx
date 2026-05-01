import { Pause, Play } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTimePlaybackState } from '../../hooks/useTimePlaybackState';
import { useTranslation } from '../../hooks/useTranslation';
import { formatDaysPerSecond } from '../../lib/timePlayback';
import { BottomSheet } from './BottomSheet';
import { TimePlaybackControls } from '../organisms/TimePlaybackControls';

export const MobileTimePill = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const { isPlaying, togglePlay, timeScale, timePlaybackDisabled } = useTimePlaybackState();
  const inConstellationView = timePlaybackDisabled;

  useEffect(() => {
    if (!inConstellationView) return;
    queueMicrotask(() => {
      setExpanded(false);
    });
  }, [inConstellationView]);

  return (
    <>
      {inConstellationView ? null : (
        <div
          role="group"
          aria-label={t.ui.timeControls}
          className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-2 py-1 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={togglePlay}
            aria-label={isPlaying ? t.ui.pause : t.ui.play}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition hover:bg-white/10"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" aria-hidden />
            ) : (
              <Play className="h-4 w-4 translate-x-px" aria-hidden />
            )}
          </button>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={expanded}
            aria-label={`${t.ui.speed}: ${formatDaysPerSecond(timeScale)}`}
            className="min-w-0 px-2 py-1 text-xs text-white/70 transition hover:text-white/90"
          >
            <span className="font-mono text-white/85 tabular-nums">
              {formatDaysPerSecond(timeScale)}
            </span>
          </button>
        </div>
      )}

      <BottomSheet
        open={expanded}
        onClose={() => setExpanded(false)}
        title={t.ui.timeControls}
        panelClassName="max-h-[min(50dvh,24rem)]"
      >
        <div className="p-3">
          <TimePlaybackControls
            className="w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 backdrop-blur-md"
            hideSpeedUnitOnPresets
            hidePlayPauseButton
            onSpeedSelect={() => {
              setExpanded(false);
            }}
          />
        </div>
      </BottomSheet>
    </>
  );
};

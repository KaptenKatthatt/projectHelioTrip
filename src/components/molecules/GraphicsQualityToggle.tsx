import { useStore as useZustandStore } from 'zustand';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { qualityStore } from '../../lib/quality/qualityStore';
import type { GraphicsQualityPreference } from '../../lib/quality/qualityLevels';

/**
 * Three choices, not five. The ladder has five rungs because the controller
 * needs somewhere to step; a person choosing by eye needs "let it decide",
 * "make it look good" and "make it run".
 *
 * `Low` pins the bottom rung rather than a middle one: someone reaching for it
 * is doing so because the app is still stuttering, and should get the whole
 * margin rather than half of it.
 */
const HIGH_LEVEL = 0;
const LOW_LEVEL = 4;

type Props = {
  readonly className?: string;
};

export const GraphicsQualityToggle = ({ className }: Props) => {
  const preference = useStore((s) => s.graphicsQuality);
  const setGraphicsQuality = useStore((s) => s.setGraphicsQuality);
  const activeLevel = useZustandStore(qualityStore, (s) => s.level);
  const { t } = useTranslation();

  const options: Array<{ value: GraphicsQualityPreference; label: string }> = [
    { value: 'auto', label: t.ui.graphicsQualityAuto },
    { value: HIGH_LEVEL, label: t.ui.graphicsQualityHigh },
    { value: LOW_LEVEL, label: t.ui.graphicsQualityLow },
  ];

  /**
   * On Auto the chosen label says nothing about what is actually running, and
   * someone wondering why the picture changed deserves an answer.
   */
  const currentLabel =
    activeLevel <= 1 ? t.ui.graphicsQualityHigh : t.ui.graphicsQualityLow;

  return (
    <div className={['flex flex-col gap-1.5', className].filter(Boolean).join(' ')}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-medium text-white/80">
          {t.ui.graphicsQuality}
        </span>
        <div
          role="radiogroup"
          aria-label={t.ui.graphicsQuality}
          className="pointer-events-auto inline-flex gap-0.5 rounded-lg border border-white/10 bg-black/40 p-0.5 backdrop-blur-md"
        >
          {options.map((option) => (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={preference === option.value}
              onClick={() => setGraphicsQuality(option.value)}
              className={[
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40',
                preference === option.value
                  ? 'bg-white/20 text-white'
                  : 'text-white/50 hover:text-white/80',
              ].join(' ')}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[11px] leading-snug text-white/50">
        {preference === 'auto'
          ? `${t.ui.graphicsQualityAutoHint} ${t.ui.graphicsQualityCurrent.replace('{level}', currentLabel)}`
          : t.ui.graphicsQualityCurrent.replace('{level}', currentLabel)}
      </p>
    </div>
  );
};

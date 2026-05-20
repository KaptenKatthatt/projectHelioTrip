import { X } from 'lucide-react';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useTranslation } from '../../hooks/useTranslation';
import { useStore } from '../../store/useStore';
import { GravityLabControls } from '../molecules/GravityLabControls';
import { GravityDropLab } from './GravityDropLab';
import { TimePlaybackControls } from './TimePlaybackControls';

const labTabButtonClass = (selected: boolean): string =>
  [
    'pointer-events-auto flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
    selected
      ? 'bg-white/15 text-white shadow-sm'
      : 'text-white/50 hover:text-white/80 hover:bg-white/8',
  ].join(' ');

const LabOverlayContent = () => {
  const activeLabGame = useStore((s) => s.activeLabGame);
  const setActiveLabGame = useStore((s) => s.setActiveLabGame);
  const { t } = useTranslation();
  const lab = t.learn.labAccordion;

  return (
    <div className="flex flex-1 flex-col gap-3">
      <div
        role="tablist"
        data-testid="lab-game-switcher"
        aria-label={`${lab.dropTabLabel} / ${lab.orbitTabLabel}`}
        className="flex shrink-0 gap-1 rounded-xl bg-white/5 p-1"
      >
        <button
          type="button"
          role="tab"
          data-testid="lab-tab-drop"
          aria-selected={activeLabGame === 'drop'}
          onClick={() => setActiveLabGame('drop')}
          className={labTabButtonClass(activeLabGame === 'drop')}
        >
          <span className="shrink-0 text-base leading-none" aria-hidden>
            🍎
          </span>
          <span className="truncate">{lab.dropTabLabel}</span>
        </button>
        <button
          type="button"
          role="tab"
          data-testid="lab-tab-orbit"
          aria-selected={activeLabGame === 'orbit'}
          onClick={() => setActiveLabGame('orbit')}
          className={labTabButtonClass(activeLabGame === 'orbit')}
        >
          <span className="shrink-0 text-base leading-none" aria-hidden>
            ☀️
          </span>
          <span className="truncate">{lab.orbitTabLabel}</span>
        </button>
      </div>

      {activeLabGame === 'drop' ? <GravityDropLab /> : null}
      {activeLabGame === 'orbit' ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <TimePlaybackControls />
          </div>
          <GravityLabControls embedded />
        </div>
      ) : null}
    </div>
  );
};

const CloseButton = () => {
  const closeLab = useStore((s) => s.closeLab);
  return (
    <button
      type="button"
      onClick={closeLab}
      className="absolute top-2 right-2 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      aria-label="Close lab"
      data-testid="lab-overlay-close"
    >
      <X className="h-4 w-4" />
    </button>
  );
};

export const LabOverlay = () => {
  const layoutTier = useResponsiveLayout();
  const isCompact = layoutTier === 'compact';
  const isMedium = layoutTier === 'medium';

  return (
    <div
      data-testid="lab-overlay"
      className={[
        'pointer-events-none fixed z-20',
        isCompact
          ? 'inset-x-4 bottom-4'
          : isMedium
            ? 'inset-x-0 bottom-0'
            : 'right-4 bottom-20 w-72',
      ].join(' ')}
    >
      <div
        className={[
          'pointer-events-auto rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl',
          isCompact ? 'relative' : isMedium ? 'relative rounded-t-none border-b-0' : 'relative',
        ].join(' ')}
      >
        <CloseButton />
        <LabOverlayContent />
      </div>
    </div>
  );
};

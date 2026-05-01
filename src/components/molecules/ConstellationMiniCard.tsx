import { useState } from 'react';
import { ChevronLeft, ChevronUp } from 'lucide-react';
import { CONSTELLATION_MENU_ITEMS } from '../../lib/constellations';
import { getConstellationStory } from '../../lib/learning/constellationStories';
import { useTranslation } from '../../hooks/useTranslation';
import { useStore } from '../../store/useStore';
import { ConstellationViewControls } from '../ConstellationViewControls';
import { BottomSheet } from './BottomSheet';
import { ConstellationStoryCard } from './ConstellationStoryCard';

type ConstellationMiniCardProps = {
  readonly onBackToConstellationsMenu: () => void;
};

export const ConstellationMiniCard = ({
  onBackToConstellationsMenu,
}: ConstellationMiniCardProps) => {
  const { locale, t } = useTranslation();
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const [expanded, setExpanded] = useState(false);

  if (!selectedConstellation) return null;

  const item = CONSTELLATION_MENU_ITEMS.find((i) => i.id === selectedConstellation);
  const label = item?.[locale === 'sv' ? 'labelSv' : 'labelEn'] ?? selectedConstellation;
  const story = getConstellationStory(selectedConstellation);
  const preview = story?.story[locale as 'sv' | 'en']?.slice(0, 72) ?? '';
  return (
    <>
      <div
        className={
          'pointer-events-auto fixed inset-x-3 z-15 flex flex-col items-stretch gap-2 ' +
          /* Gap above nav: token-bounded fluid spacing; chrome matches MobileBottomNav */
          'bottom-[calc(clamp(var(--space-2),2.5vmin,var(--space-3))+1px+0.25rem+3.75rem+max(0.5rem,env(safe-area-inset-bottom)))]'
        }
      >
        <div className="flex justify-center">
          <ConstellationViewControls />
        </div>
        <div
          data-testid="constellation-mini-card"
          role="button"
          tabIndex={0}
          onClick={() => setExpanded(true)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setExpanded(true);
          }}
          className="flex items-center justify-between rounded-xl border border-indigo-400/30 bg-black/80 px-3 py-2.5 text-left backdrop-blur-md transition hover:border-indigo-400/50 hover:bg-black/90"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-indigo-200">{label}</p>
            {preview && <p className="mt-0.5 truncate text-[11px] text-white/45">{preview}…</p>}
          </div>
          <div className="ml-3 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-indigo-400/45 bg-indigo-500/15 text-indigo-400">
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
          </div>
        </div>
      </div>

      <BottomSheet
        open={expanded}
        onClose={() => setExpanded(false)}
        title={label}
        titleTopContent={
          <div className="flex justify-center">
            <ConstellationViewControls />
          </div>
        }
        titleLeftAction={
          <button
            type="button"
            aria-label={t.ui.backToConstellationsList}
            title={t.ui.backToConstellationsList}
            onClick={() => {
              setExpanded(false);
              onBackToConstellationsMenu();
            }}
            className="pointer-events-auto flex size-10 items-center justify-center text-white/75 transition hover:text-white"
          >
            <ChevronLeft className="size-7 shrink-0" aria-hidden />
          </button>
        }
        panelClassName="max-h-[min(92dvh,32rem)]"
        headerPaddingXClassName="px-0"
        blurScrim={false}
        scrimBlocksPointerEvents={false}
      >
        <div className="p-3 pt-0">
          <ConstellationStoryCard />
        </div>
      </BottomSheet>
    </>
  );
};

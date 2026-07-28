import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useStore } from '../../store/useStore';
import { qualityStore, subscribeQuality } from '../../lib/quality/qualityStore';
import { resolveQualitySeed } from '../../lib/quality/initializeQuality';

const SEEN_KEY = 'heliotrip-quality-notice-seen';
/** Long enough that a cascade of steps settles before anything is claimed. */
const STABLE_BEFORE_SHOWING_MS = 10_000;
const VISIBLE_MS = 6000;
/** Below this the change is not something a person would notice unprompted. */
const NOTICEABLE_LEVEL = 2;

const hasBeenSeen = (): boolean => {
  try {
    return localStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return true;
  }
};

const markSeen = (): void => {
  try {
    localStorage.setItem(SEEN_KEY, '1');
  } catch {
    // Private mode; showing it again next time is a small price.
  }
};

/**
 * Tells the user once, ever, that the app lowered its own graphics.
 *
 * Silently degrading is what makes people conclude an app is broken or ugly,
 * and this is the only place they learn the manual override exists. It is
 * correspondingly restrained: once per browser, only for a drop large enough
 * to see, only after it has held, and never when the level was their choice.
 */
export const QualityNoticeToast = () => {
  const { t } = useTranslation();
  const preference = useStore((s) => s.graphicsQuality);
  const [visible, setVisible] = useState(false);

  /**
   * The countdown to closing is deliberately its own effect, keyed on
   * `visible` rather than on the preference. Owned by the detection effect
   * below it would be torn down the moment the user pinned a level — which is
   * precisely what this notice tells them to go and do — and a notice whose
   * hide timer has been cancelled never comes down again.
   */
  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  useEffect(() => {
    if (preference !== 'auto' || hasBeenSeen()) return;

    let settleTimer: ReturnType<typeof setTimeout> | undefined;

    /**
     * The level the app *opened* at. `bindQualityPreference` rewrites the
     * source from `boot` to `auto` before the first frame, so the source alone
     * cannot tell a runtime downgrade from the boot guess — without this,
     * every phone and every weak desktop would be told its graphics had been
     * lowered when nothing had moved at all.
     */
    const seedLevel = resolveQualitySeed().level;
    const wasLowered = (level: number): boolean =>
      level > seedLevel && level >= NOTICEABLE_LEVEL;

    const evaluate = () => {
      clearTimeout(settleTimer);
      const { level, source } = qualityStore.getState();
      if (source !== 'auto' || !wasLowered(level)) return;

      settleTimer = setTimeout(() => {
        // Re-check: the level may have moved again while we waited.
        const settled = qualityStore.getState();
        if (settled.source !== 'auto' || !wasLowered(settled.level)) return;
        if (hasBeenSeen()) return;
        markSeen();
        setVisible(true);
      }, STABLE_BEFORE_SHOWING_MS);
    };

    evaluate();
    const unsubscribe = subscribeQuality(evaluate);
    return () => {
      unsubscribe();
      clearTimeout(settleTimer);
    };
  }, [preference]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="pointer-events-auto fixed bottom-6 left-4 z-50 flex max-w-xs items-start gap-3 rounded-xl border border-white/15 bg-black/80 px-4 py-3 text-sm text-white/90 shadow-xl backdrop-blur-md"
    >
      <p className="leading-snug">{t.ui.graphicsQualityLowered}</p>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label={t.ui.graphicsQualityNoticeDismiss}
        className="-mr-1 -mt-1 shrink-0 rounded-lg p-1 text-white/60 transition hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
};

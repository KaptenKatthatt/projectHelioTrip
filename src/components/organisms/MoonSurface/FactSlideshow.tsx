/**
 * Moon Fact Slideshow UI
 * 
 * An overlay component that displays a rotating series of moon facts.
 * Includes automatic cycling and manual navigation dots.
 */
import { useEffect, useRef, useState } from 'react';
import { Info } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';

export const FACT_ROTATION_INTERVAL_MS = 8000;

export const FactSlideshow = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (t.moonSurface.facts.length === 0) return;

    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % t.moonSurface.facts.length);
    }, FACT_ROTATION_INTERVAL_MS);

    return () => {
      if (timerRef.current !== null) clearInterval(timerRef.current);
    };
  }, [t.moonSurface.facts.length]);

  const jumpTo = (idx: number) => {
    if (timerRef.current !== null) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % t.moonSurface.facts.length);
    }, FACT_ROTATION_INTERVAL_MS);
    setCurrent(idx);
  };

  if (t.moonSurface.facts.length === 0) return null;

  const fact = t.moonSurface.facts[current]!;
  const title = fact.title;
  const body = fact.body;

  return (
    <div className="pointer-events-auto max-w-sm rounded-2xl border border-blue-400/15 bg-black/60 p-4 backdrop-blur-md">
      <div className="mb-2 flex items-center gap-2 text-blue-400">
        <Info className="h-4 w-4" aria-hidden />
        <span className="ds-eyebrow">{t.moonSurface.factLabel}</span>
      </div>

      <p className="mb-1 text-sm leading-snug font-semibold text-blue-100/90">{title}</p>
      <p className="text-xs leading-relaxed text-blue-100/70">{body}</p>

      <div className="mt-3 flex justify-center gap-1.5">
        {t.moonSurface.facts.map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={t.moonSurface.factAriaLabel(i + 1)}
            onClick={() => jumpTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '16px' : '5px',
              height: '5px',
              background: i === current ? 'rgba(160,180,255,0.85)' : 'rgba(160,180,255,0.25)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Planet Information Content Tab
 * 
 * Renders the primary technical data for a planet or moon, including distances 
 * and orbital info. Also provides access to Wikipedia and surface landing triggers.
 */
import { ExternalLink } from "lucide-react";
import { useStore } from "../../../store/useStore";
import type { Translation } from "../../../i18n/translations";
import type { Row } from "./utils";

interface InfoTabProps {
  rows: Row[];
  activeBody: string;
  name: string;
  openWikipedia: () => void;
  mobileLayout: boolean;
  omitHeading: boolean;
  t: Translation;
  layoutTier?: "compact" | "medium" | "expanded";
}

export const InfoTab = ({
  rows,
  activeBody,
  name,
  openWikipedia,
  mobileLayout,
  omitHeading,
  t,
  layoutTier,
}: InfoTabProps) => {
  const isTablet = layoutTier === "medium";

  if (isTablet) {
    return (
      <div className="grid grid-cols-2 gap-6 mt-4 items-start animate-slide-up">
        <div>
          <dl className="space-y-2 text-sm">
            {rows.map((r) => (
              <div
                key={r.label}
                className="flex min-w-0 items-center justify-between gap-4 overflow-x-auto border-b border-white/5 py-1"
              >
                <dt className="shrink-0 whitespace-nowrap text-white/55">
                  {r.label}
                </dt>
                <dd className="shrink-0 whitespace-nowrap font-mono text-white">
                  {r.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-2.5 justify-center">
          <button
            type="button"
            onClick={openWikipedia}
            aria-label={`${t.ui.readOnWikipedia}: ${name}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-sm font-medium text-white/90 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            {t.ui.readOnWikipedia}
          </button>

          {activeBody === "mars" && (
            <button
              type="button"
              onClick={() => {
                const store = useStore.getState();
                store.setMarsTransitionState('landing');
                setTimeout(() => {
                  store.setIsLanded(true);
                  setTimeout(() => {
                    store.setMarsTransitionState('idle');
                  }, 100);
                }, 3000);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-3 text-sm font-bold text-orange-400 transition hover:bg-orange-500/20 hover:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 15 2 2 4-4"/><rect width="20" height="20" x="2" y="2" rx="2"/><path d="M2 12h20"/></svg>
              LANDA PÅ MARS
            </button>
          )}
          {activeBody === "moon" && (
            <button
              type="button"
              onClick={() => {
                const store = useStore.getState();
                store.setMoonTransitionState('landing');
                setTimeout(() => {
                  store.setIsLandedOnMoon(true);
                  setTimeout(() => {
                    store.setMoonTransitionState('idle');
                  }, 100);
                }, 1500);
              }}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-400/20 hover:border-blue-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
              LANDA PÅ MÅNEN
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <dl className="mt-4 space-y-2 text-sm">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex min-w-0 items-center justify-between gap-4 overflow-x-auto"
          >
            <dt className="shrink-0 whitespace-nowrap text-white/55">
              {r.label}
            </dt>
            <dd className="shrink-0 whitespace-nowrap font-mono text-white">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        onClick={openWikipedia}
        aria-label={`${t.ui.readOnWikipedia}: ${name}`}
        className={
          "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-medium text-white/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 " +
          (mobileLayout && omitHeading
            ? "bg-white/12 hover:border-white/25 hover:bg-white/16"
            : "bg-white/5 hover:border-white/25 hover:bg-white/10")
        }
      >
        <ExternalLink className="h-4 w-4" aria-hidden />
        {t.ui.readOnWikipedia}
      </button>

      {activeBody === "mars" && (
        <button
          type="button"
          onClick={() => {
            const store = useStore.getState();
            store.setMarsTransitionState('landing');
            setTimeout(() => {
              store.setIsLanded(true);
              setTimeout(() => {
                store.setMarsTransitionState('idle');
              }, 100);
            }, 3000);
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-3 text-sm font-bold text-orange-400 transition hover:bg-orange-500/20 hover:border-orange-500/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 15 2 2 4-4"/><rect width="20" height="20" x="2" y="2" rx="2"/><path d="M2 12h20"/></svg>
          LANDA PÅ MARS
        </button>
      )}
      {activeBody === "moon" && (
        <button
          type="button"
          onClick={() => {
            const store = useStore.getState();
            store.setMoonTransitionState('landing');
            setTimeout(() => {
              store.setIsLandedOnMoon(true);
              setTimeout(() => {
                store.setMoonTransitionState('idle');
              }, 100);
            }, 1500);
          }}
          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-blue-400/30 bg-blue-400/10 px-3 py-3 text-sm font-bold text-blue-300 transition hover:bg-blue-400/20 hover:border-blue-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          LANDA PÅ MÅNEN
        </button>
      )}
    </>
  );
};

import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

type ControlRow = {
  keys: readonly string[];
  label: string;
};

export const FreeFlightHelp = () => {
  const { t } = useTranslation();
  const navigationMode = useStore((s) => s.navigationMode);

  if (navigationMode !== 'free') return null;

  const rows: readonly ControlRow[] = [
    { keys: ['W', 'A', 'S', 'D'], label: t.ui.controlMove },
    { keys: ['F', 'C'], label: t.ui.controlUpDown },
    { keys: ['Shift'], label: t.ui.controlBoost },
    { keys: ['Esc'], label: t.ui.controlExit },
  ];

  return (
    <aside className="pointer-events-auto w-64 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="px-1 pb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
        {t.ui.controls}
      </h2>
      <dl className="space-y-1.5 text-xs">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3"
          >
            <dt className="text-white/60">{row.label}</dt>
            <dd className="flex items-center gap-1">
              {row.keys.map((k, i) => (
                <span key={k} className="flex items-center gap-1">
                  <kbd className="inline-flex min-w-[1.5rem] items-center justify-center rounded-md border border-white/15 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white/90">
                    {k}
                  </kbd>
                  {i < row.keys.length - 1 && row.keys.length > 2 && (
                    <span className="text-white/30">·</span>
                  )}
                </span>
              ))}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
};

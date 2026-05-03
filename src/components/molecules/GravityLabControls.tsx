import { useStore } from "../../store/useStore";

export const GravityLabControls = () => {
  const gameMode = useStore((s) => s.gameMode);
  const sunMassMultiplier = useStore((s) => s.sunMassMultiplier);
  const setSunMassMultiplier = useStore((s) => s.setSunMassMultiplier);

  if (gameMode !== "lab") return null;

  return (
    <div className="pointer-events-auto flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl min-w-[240px]">
      <div className="flex flex-col gap-1">
        <label htmlFor="sun-mass" className="ds-eyebrow text-white/70">
          Solens Massa: {sunMassMultiplier.toFixed(1)}x
        </label>
        <input
          id="sun-mass"
          type="range"
          min="0.1"
          max="10.0"
          step="0.1"
          value={sunMassMultiplier}
          onChange={(e) => setSunMassMultiplier(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-400"
        />
        <div className="flex justify-between text-[10px] text-white/30 uppercase tracking-tighter">
          <span>Lättare</span>
          <span>Normal</span>
          <span>Tyngre</span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <p className="text-[11px] text-white/50 leading-relaxed italic flex-1">
          "Ändra solens massa för att se hur planeternas banor påverkas av tyngdkraften!"
        </p>
        <button
          type="button"
          onClick={() => useStore.getState().triggerGravityLabReset()}
          className="shrink-0 flex items-center justify-center gap-1.5 rounded-lg border border-indigo-400/30 bg-indigo-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-400/20 active:scale-95"
          title="Återställ planeter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Återställ
        </button>
      </div>
    </div>
  );
};

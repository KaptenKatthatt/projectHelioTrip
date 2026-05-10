import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useResponsiveLayout } from "../../hooks/useResponsiveLayout";
import { useTranslation } from "../../hooks/useTranslation";
import type { Translation } from "../../i18n/translations";
import {
  DROPPABLE_OBJECTS,
  DROP_HEIGHT_METERS,
  GRAVITY_PLANETS,
  getDroppableObject,
  getGravityPlanet,
  type DroppableObjectId,
  type GravityPlanetId,
  type ImpactType,
} from "../../lib/learning/gravityData";
import {
  computeDropFrame,
  computeImpactResult,
  type DropFrame,
} from "../../lib/learning/gravityDropEngine";
import styles from "./GravityDropLab.module.css";

// -- State machine types --

type Phase = "ready" | "falling" | "impact";

const INITIAL_DROP_FRAME: DropFrame = {
  y: 0,
  velocity: 0,
  elapsed: 0,
  progress: 0,
  hasLanded: false,
};

// -- Component --

export const GravityDropLab = () => {
  const { t, locale } = useTranslation();
  const grav = t.learn.gravityLab;
  const layoutTier = useResponsiveLayout();
  const isCompact = layoutTier === "compact";
  const isExpanded = layoutTier === "expanded";
  const isNotCompact = layoutTier !== "compact";

  // Selections
  const [selectedObject, setSelectedObject] =
    useState<DroppableObjectId>("apple");
  const [selectedPlanet, setSelectedPlanet] =
    useState<GravityPlanetId>("earth");

  const planet = getGravityPlanet(selectedPlanet)!;
  const obj = getDroppableObject(selectedObject)!;

  // State machine
  const [phase, setPhase] = useState<Phase>("ready");

  // Animation state
  const [frame, setFrame] = useState<DropFrame>(() => ({ ...INITIAL_DROP_FRAME }));

  const rafRef = useRef<number>(0);
  // `null` means "not yet anchored" — the next rAF tick supplies the start
  // timestamp. Anchoring on `performance.now()` from `handleDrop` produces a
  // negative `elapsed` on the first frame because the rAF callback receives
  // the *frame's* start time, which can predate `performance.now()`.
  const startTimeRef = useRef<number | null>(null);
  const gravityRef = useRef(planet.surfaceGravity);
  const tickRef = useRef<(timestamp: number) => void>(() => {});

  useLayoutEffect(() => {
    gravityRef.current = planet.surfaceGravity;
  }, [planet.surfaceGravity]);

  useLayoutEffect(() => {
    tickRef.current = (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }
      const elapsed = Math.max(0, (timestamp - startTimeRef.current) / 1000);
      const nextFrame = computeDropFrame(
        gravityRef.current,
        DROP_HEIGHT_METERS,
        elapsed,
      );
      setFrame(nextFrame);

      if (nextFrame.hasLanded) {
        setPhase("impact");
      } else {
        rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
      }
    };
  }, []);

  // Formatters
  const numFmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    [locale],
  );
  const intFmt = useMemo(
    () => new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }),
    [locale],
  );

  const handleReset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase("ready");
    setFrame({ ...INITIAL_DROP_FRAME });
  }, []);

  const selectObject = useCallback(
    (id: DroppableObjectId) => {
      handleReset();
      setSelectedObject(id);
    },
    [handleReset],
  );

  const selectPlanet = useCallback(
    (id: GravityPlanetId) => {
      handleReset();
      setSelectedPlanet(id);
    },
    [handleReset],
  );

  const handleDrop = useCallback(() => {
    setPhase("falling");
    setFrame({ ...INITIAL_DROP_FRAME });
    startTimeRef.current = null;
    rafRef.current = requestAnimationFrame((t) => tickRef.current(t));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const impact = computeImpactResult(planet.surfaceGravity, DROP_HEIGHT_METERS);
  const canDrop = phase === "ready";
  const showResult = phase === "impact";

  // Visual position of falling object: map [0, DROP_HEIGHT_METERS] to [5%, 83%] of canvas height
  const topPercent = 5 + frame.progress * 78;

  // Impact animation class
  const impactClass = showResult ? getImpactClass(obj.impactType) : "";

  // Fun fact about the planet
  const funFact = getFunFact(selectedPlanet, grav);

  return (
    <div data-testid="gravity-drop-lab" className="flex flex-col gap-2">
      {/* Title */}
      <h3 className="text-sm font-semibold tracking-tight text-white/90">
        🍎 {grav.title}
      </h3>

      {/* Object picker */}
      <div className="flex flex-col gap-1">
        <span className="ds-eyebrow text-[10px] uppercase tracking-widest text-white/50">
          {grav.pickObject}
        </span>
        <div className="flex gap-1.5">
          {DROPPABLE_OBJECTS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => selectObject(o.id)}
              className={[
                "pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                selectedObject === o.id
                  ? "bg-white/20 text-white ring-1 ring-white/30 scale-105"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80",
              ].join(" ")}
              aria-pressed={selectedObject === o.id}
            >
              <span className="text-base">{o.emoji}</span>
              {grav[
                `object_${o.id}` as Extract<
                  keyof GravityLabCopy,
                  `object_${string}`
                >
              ]}
            </button>
          ))}
        </div>
      </div>

      {/* Planet picker */}
      <div className="flex flex-col gap-1">
        <span className="ds-eyebrow text-[10px] uppercase tracking-widest text-white/50">
          {grav.pickPlanet}
        </span>
        <div className={`flex gap-1.5 ${isCompact ? "overflow-x-auto pb-1" : "flex-wrap"}`}>
          {GRAVITY_PLANETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPlanet(p.id)}
              className={[
                "pointer-events-auto flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                selectedPlanet === p.id
                  ? "ring-1 ring-white/40 scale-105 text-white"
                  : "text-white/50 hover:text-white/80",
              ].join(" ")}
              style={{
                backgroundColor:
                  selectedPlanet === p.id
                    ? `${p.color}40`
                    : `${p.color}15`,
              }}
              aria-pressed={selectedPlanet === p.id}
            >
              <span
                className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: p.color }}
              />
              {getPlanetDisplayName(p.id, grav)}
            </button>
          ))}
        </div>
      </div>

      {/* Drop canvas */}
      <div
        data-testid="drop-canvas"
        className={isCompact ? styles.dropCanvasCompact : isExpanded ? styles.dropCanvasDesktop : styles.dropCanvas}
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, ${planet.color}30 85%, ${planet.color}50 100%)`,
        }}
      >
        {/* Height markers */}
        <span className={styles.heightMarker} style={{ top: "5%" }}>
          {grav.heightLabel.replace("{height}", intFmt.format(DROP_HEIGHT_METERS))}
        </span>
        <span className={styles.heightMarker} style={{ top: "44%" }}>
          {DROP_HEIGHT_METERS / 2}m
        </span>
        <span className={styles.heightMarker} style={{ bottom: "16%" }}>
          0m
        </span>

        {/* Speed trail */}
        {phase === "falling" && frame.progress > 0.05 && (
          <div
            className={styles.speedTrail}
            style={{
              top: `${Math.max(5, topPercent - frame.progress * 30)}%`,
              height: `${frame.progress * 30}%`,
              opacity: Math.min(0.6, frame.velocity / 50),
            }}
          />
        )}

        {/* Falling object */}
        <div
          data-testid="falling-object"
          className={`${styles.fallingObject} ${impactClass}`}
          style={{
            top: `${topPercent}%`,
            transform: `translateX(-50%) rotate(${phase === "falling" ? frame.progress * 360 : 0}deg)`,
          }}
        >
          {obj.emoji}
        </div>

        {/* Dust particles on impact */}
        {showResult && (
          <>
            <div className={styles.dustParticle} style={{ marginLeft: "-30px" }} />
            <div className={styles.dustParticle} style={{ marginLeft: "10px", animationDelay: "0.05s" }} />
          </>
        )}

        {/* Ground */}
        <div className={`${styles.ground} ${showResult ? styles.groundShake : ""}`}>
          <div
            className={styles.groundGradient}
            style={{
              background: `linear-gradient(180deg, ${planet.color}60 0%, ${planet.color}90 100%)`,
            }}
          />
        </div>

        {/* Gravity label overlay */}
        <div className="absolute left-2 bottom-[16%] mb-1 rounded bg-black/40 px-1.5 py-0.5 text-[9px] text-white/40 font-mono backdrop-blur-sm">
          g = {numFmt.format(planet.surfaceGravity)} m/s²
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {canDrop && (
          <button
            data-testid="drop-button"
            type="button"
            onClick={handleDrop}
            className={`pointer-events-auto flex-1 rounded-xl border border-indigo-400/30 bg-indigo-400/10 ${isCompact ? "px-3 py-2" : "px-4 py-2.5"} text-sm font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-400/20 active:scale-95 ${styles.dropButtonReady}`}
          >
            {grav.dropButton}
          </button>
        )}
        {(phase === "falling" || phase === "impact") && (
          <button
            data-testid="reset-button"
            type="button"
            onClick={handleReset}
            className={`pointer-events-auto flex-1 rounded-xl border border-white/10 bg-white/5 ${isCompact ? "px-3 py-2" : "px-4 py-2.5"} text-sm font-medium text-white/70 transition hover:bg-white/10 active:scale-95`}
          >
            {grav.resetButton}
          </button>
        )}
      </div>

      {/* Live velocity readout during fall */}
      {phase === "falling" && (
        <div data-testid="velocity-readout" className="flex justify-between text-[11px] font-mono text-white/40">
          <span>t = {numFmt.format(frame.elapsed)}s</span>
          <span>v = {numFmt.format(frame.velocity)} m/s</span>
        </div>
      )}

      {/* Result card */}
      {showResult && (
        <div data-testid="result-card" className={`rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${isNotCompact ? "p-2" : "p-3"}`}>
          {isCompact ? (
            <div className="flex justify-between items-center text-[11px] text-white/70">
              <span>t = <strong className="text-white font-mono">{numFmt.format(impact.fallDuration)}s</strong></span>
              <span className="mx-1 text-white/20">|</span>
              <span>v = <strong className="text-white font-mono">{numFmt.format(impact.impactVelocity)} m/s</strong></span>
              <span className="mx-1 text-white/20">|</span>
              <span>g = <strong className="text-white font-mono">{numFmt.format(planet.surfaceGravity)} m/s²</strong></span>
            </div>
          ) : (
            <div className={`${isNotCompact ? "space-y-1" : "space-y-1.5"}`}>
              {/* Existing result rows — kept unchanged */}
              <div className={`flex justify-between text-xs ${styles.resultRow}`}
                style={{ "--result-row-index": 0 } as CSSProperties}>
                <span className="text-white/55">{grav.resultFallTime}</span>
                <span className="font-mono text-white">
                  {numFmt.format(impact.fallDuration)}s
                </span>
              </div>
              <div className={`flex justify-between text-xs ${styles.resultRow}`}
                style={{ "--result-row-index": 1 } as CSSProperties}>
                <span className="text-white/55">{grav.resultImpactSpeed}</span>
                <span className="font-mono text-white">
                  {numFmt.format(impact.impactVelocity)} m/s
                  <span className="text-white/30 ml-1">
                    ({numFmt.format(impact.impactVelocity * 3.6)} km/h)
                  </span>
                </span>
              </div>
              <div className={`flex justify-between text-xs ${styles.resultRow}`}
                style={{ "--result-row-index": 2 } as CSSProperties}>
                <span className="text-white/55">{grav.resultGravity}</span>
                <span className="font-mono text-white">
                  {numFmt.format(planet.surfaceGravity)} m/s²
                  <span className="text-white/30 ml-1">
                    ({numFmt.format(planet.surfaceGravity / 9.81)}× {getPlanetDisplayName("earth", grav)})
                  </span>
                </span>
              </div>
              <div className={`flex justify-between text-xs ${styles.resultRow}`}
                style={{ "--result-row-index": 3 } as CSSProperties}>
                <span className="text-white/55">{grav.resultMass}</span>
                <span className="font-mono text-white">
                  {obj.mass >= 1 ? intFmt.format(obj.mass) : obj.mass} kg
                </span>
              </div>
            </div>
          )}

          {/* Pedagogical message — always visible */}
          <div className={`rounded-lg border border-amber-400/20 bg-amber-400/5 ${isNotCompact ? "mt-2 px-2 py-1" : "mt-3 px-3 py-2"}`}>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              💡 {grav.factAllFallSame}
            </p>
          </div>

          {/* Planet fun fact */}
          {funFact && isCompact && (
            <p className="mt-2 text-[10px] italic leading-relaxed text-white/35">
              {funFact}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// -- Helpers --

type GravityLabCopy = Translation["learn"]["gravityLab"];

function getImpactClass(impactType: ImpactType): string {
  switch (impactType) {
    case "splat":
      return styles.impactSplat ?? "";
    case "crash":
      return styles.impactCrash ?? "";
    case "thud":
      return styles.impactThud ?? "";
  }
}

function getPlanetDisplayName(id: GravityPlanetId, grav: GravityLabCopy): string {
  return grav.planets[id]?.name ?? id;
}

function getFunFact(id: GravityPlanetId, grav: GravityLabCopy): string | null {
  const fact = grav.planets[id]?.fact;
  return fact ? fact : null;
}

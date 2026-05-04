import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import {
  DROPPABLE_OBJECTS,
  DROP_HEIGHT_METERS,
  GRAVITY_PLANETS,
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

type Phase = "idle" | "ready" | "falling" | "impact";

// -- Component --

export const GravityDropLab = () => {
  const { t, locale } = useTranslation();
  const grav = t.learn.gravityLab;

  // Selections
  const [selectedObject, setSelectedObject] =
    useState<DroppableObjectId>("apple");
  const [selectedPlanet, setSelectedPlanet] =
    useState<GravityPlanetId>("earth");

  // State machine
  const [phase, setPhase] = useState<Phase>("ready");

  // Animation state
  const [frame, setFrame] = useState<DropFrame>({
    y: 0,
    velocity: 0,
    elapsed: 0,
    progress: 0,
    hasLanded: false,
  });

  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const planet = GRAVITY_PLANETS.find((p) => p.id === selectedPlanet)!;
  const obj = DROPPABLE_OBJECTS.find((o) => o.id === selectedObject)!;

  // Formatters
  const numFmt = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  const intFmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  // --- Animation loop ---
  const tick = useCallback(
    (timestamp: number) => {
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const nextFrame = computeDropFrame(
        planet.surfaceGravity,
        DROP_HEIGHT_METERS,
        elapsed,
      );
      setFrame(nextFrame);

      if (nextFrame.hasLanded) {
        setPhase("impact");
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [planet.surfaceGravity],
  );

  const handleDrop = useCallback(() => {
    setPhase("falling");
    setFrame({ y: 0, velocity: 0, elapsed: 0, progress: 0, hasLanded: false });
    startTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const handleReset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setPhase("ready");
    setFrame({ y: 0, velocity: 0, elapsed: 0, progress: 0, hasLanded: false });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Reset when planet or object changes
  useEffect(() => {
    handleReset();
  }, [selectedPlanet, selectedObject, handleReset]);

  const impact = computeImpactResult(planet.surfaceGravity, DROP_HEIGHT_METERS);
  const canDrop = phase === "ready";
  const showResult = phase === "impact";

  // Visual position of falling object: map [0, DROP_HEIGHT_METERS] to [5%, 83%] of canvas height
  const topPercent = 5 + frame.progress * 78;

  // Impact animation class
  const impactClass = showResult ? getImpactClass(obj.impactType) : "";

  // Fun fact about the planet
  const funFact = getFunFact(selectedPlanet, locale);

  return (
    <div className="flex flex-col gap-4">
      {/* Title */}
      <h3 className="text-sm font-semibold tracking-tight text-white/90">
        🍎 {grav.title}
      </h3>

      {/* Object picker */}
      <div className="flex flex-col gap-1.5">
        <span className="ds-eyebrow text-[10px] uppercase tracking-widest text-white/50">
          {grav.pickObject}
        </span>
        <div className="flex gap-1.5">
          {DROPPABLE_OBJECTS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelectedObject(o.id)}
              className={[
                "pointer-events-auto flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                selectedObject === o.id
                  ? "bg-white/20 text-white ring-1 ring-white/30 scale-105"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80",
              ].join(" ")}
              aria-pressed={selectedObject === o.id}
            >
              <span className="text-base">{o.emoji}</span>
              {locale === "sv" ? grav[`object_${o.id}` as keyof typeof grav] : grav[`object_${o.id}` as keyof typeof grav]}
            </button>
          ))}
        </div>
      </div>

      {/* Planet picker */}
      <div className="flex flex-col gap-1.5">
        <span className="ds-eyebrow text-[10px] uppercase tracking-widest text-white/50">
          {grav.pickPlanet}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {GRAVITY_PLANETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPlanet(p.id)}
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
              {getPlanetDisplayName(p.id, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Drop canvas */}
      <div
        className={styles.dropCanvas}
        style={{
          background: `linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 70%, ${planet.color}30 85%, ${planet.color}50 100%)`,
        }}
      >
        {/* Height markers */}
        <span className={styles.heightMarker} style={{ top: "5%" }}>
          {DROP_HEIGHT_METERS}m
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
            type="button"
            onClick={handleDrop}
            className={`pointer-events-auto flex-1 rounded-xl border border-indigo-400/30 bg-indigo-400/10 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-indigo-300 transition hover:bg-indigo-400/20 active:scale-95 ${styles.dropButtonReady}`}
          >
            {grav.dropButton}
          </button>
        )}
        {(phase === "falling" || phase === "impact") && (
          <button
            type="button"
            onClick={handleReset}
            className="pointer-events-auto flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/10 active:scale-95"
          >
            {grav.resetButton}
          </button>
        )}
      </div>

      {/* Live velocity readout during fall */}
      {phase === "falling" && (
        <div className="flex justify-between text-[11px] font-mono text-white/40">
          <span>t = {numFmt.format(frame.elapsed)}s</span>
          <span>v = {numFmt.format(frame.velocity)} m/s</span>
        </div>
      )}

      {/* Result card */}
      {showResult && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
          <div className="space-y-1.5">
            <div className={`flex justify-between text-xs ${styles.resultRow}`}>
              <span className="text-white/55">{grav.resultFallTime}</span>
              <span className="font-mono text-white">
                {numFmt.format(impact.fallDuration)}s
              </span>
            </div>
            <div className={`flex justify-between text-xs ${styles.resultRow}`}>
              <span className="text-white/55">{grav.resultImpactSpeed}</span>
              <span className="font-mono text-white">
                {numFmt.format(impact.impactVelocity)} m/s
                <span className="text-white/30 ml-1">
                  ({numFmt.format(impact.impactVelocity * 3.6)} km/h)
                </span>
              </span>
            </div>
            <div className={`flex justify-between text-xs ${styles.resultRow}`}>
              <span className="text-white/55">{grav.resultGravity}</span>
              <span className="font-mono text-white">
                {numFmt.format(planet.surfaceGravity)} m/s²
                <span className="text-white/30 ml-1">
                  ({numFmt.format(planet.surfaceGravity / 9.81)}× {getPlanetDisplayName("earth", locale)})
                </span>
              </span>
            </div>
            <div className={`flex justify-between text-xs ${styles.resultRow}`}>
              <span className="text-white/55">{grav.resultMass}</span>
              <span className="font-mono text-white">
                {obj.mass >= 1 ? intFmt.format(obj.mass) : obj.mass} kg
              </span>
            </div>
          </div>

          {/* Pedagogical message */}
          <div className="mt-3 rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2">
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              💡 {grav.factAllFallSame}
            </p>
          </div>

          {/* Planet fun fact */}
          {funFact && (
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

function getImpactClass(impactType: ImpactType): string {
  switch (impactType) {
    case "splat":
      return styles.impactSplat;
    case "crash":
      return styles.impactCrash;
    case "thud":
      return styles.impactThud;
  }
}

function getPlanetDisplayName(
  id: GravityPlanetId,
  locale: string,
): string {
  const names: Record<GravityPlanetId, { sv: string; en: string }> = {
    mercury: { sv: "Merkurius", en: "Mercury" },
    venus: { sv: "Venus", en: "Venus" },
    earth: { sv: "Jorden", en: "Earth" },
    moon: { sv: "Månen", en: "Moon" },
    mars: { sv: "Mars", en: "Mars" },
    jupiter: { sv: "Jupiter", en: "Jupiter" },
    saturn: { sv: "Saturnus", en: "Saturn" },
    uranus: { sv: "Uranus", en: "Uranus" },
    neptune: { sv: "Neptunus", en: "Neptune" },
    pluto: { sv: "Pluto", en: "Pluto" },
  };
  return names[id]?.[locale === "sv" ? "sv" : "en"] ?? id;
}

function getFunFact(
  id: GravityPlanetId,
  locale: string,
): string | null {
  const facts: Partial<
    Record<GravityPlanetId, { sv: string; en: string }>
  > = {
    moon: {
      sv: "En astronaut som väger 80 kg på Jorden väger bara 13 kg på Månen!",
      en: "An astronaut weighing 80 kg on Earth would weigh only 13 kg on the Moon!",
    },
    jupiter: {
      sv: "Jupiters gravitation är så stark att den fångar upp asteroider som annars skulle träffa Jorden.",
      en: "Jupiter's gravity is so strong it captures asteroids that would otherwise hit Earth.",
    },
    mars: {
      sv: "Du kan hoppa nästan 3× högre på Mars. Basket skulle vara annorlunda!",
      en: "You could jump almost 3× higher on Mars. Basketball would be very different!",
    },
    pluto: {
      sv: "Gravitationen på Pluto är så svag att du skulle kunna hoppa över ett tvåvåningshus.",
      en: "Gravity on Pluto is so weak you could jump over a two-storey building.",
    },
    saturn: {
      sv: "Trots att Saturnus är enormt stor har den nästan samma ytgravitation som Jorden — den är nämligen gjord av gas!",
      en: "Despite being enormous, Saturn has nearly the same surface gravity as Earth — it's made of gas!",
    },
    neptune: {
      sv: "Om du tappade ett äpple på Neptunus skulle det falla lite snabbare än på Jorden.",
      en: "If you dropped an apple on Neptune, it would fall slightly faster than on Earth.",
    },
    venus: {
      sv: "Venus har nästan samma gravitation som Jorden, men temperaturen på ytan är 460°C!",
      en: "Venus has nearly the same gravity as Earth, but the surface temperature is 460°C!",
    },
  };
  const fact = facts[id];
  return fact ? fact[locale === "sv" ? "sv" : "en"] : null;
}

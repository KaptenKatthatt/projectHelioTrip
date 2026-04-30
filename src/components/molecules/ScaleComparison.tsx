import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getBody } from "../../lib/bodies";
import type { BodyId } from "../../lib/bodies";
import type { PlanetId } from "../../lib/planets";

// Real equatorial radii relative to Earth (Earth = 1.0), sourced from NASA planetary fact sheets
const REAL_RADIUS: Partial<Record<BodyId, number>> = {
  sun: 109.2,
  mercury: 0.383,
  venus: 0.950,
  earth: 1.0,
  mars: 0.532,
  jupiter: 11.21,
  saturn: 9.45,
  uranus: 4.01,
  neptune: 3.88,
  pluto: 0.186,
  moon: 0.272,
  io: 0.286,
  europa: 0.245,
  ganymede: 0.413,
  callisto: 0.378,
  titan: 0.404,
  triton: 0.212,
  iss: 0.00006,
};

const COMPARE_OPTIONS: PlanetId[] = ["sun", "earth", "jupiter", "mars"];

const MAX_VISUAL_R = 75;
const MIN_VISUAL_R = 3;
// SVG layout constants
const CX_A = 120;
const CX_B = 300;
const CY = 90;
const SVG_H = 200;

const getDefaultCompare = (bodyId: BodyId): PlanetId =>
  bodyId === "earth" ? "sun" : "earth";

type Props = {
  readonly bodyId: BodyId;
};

export const ScaleComparison = ({ bodyId }: Props) => {
  const { bodyName, locale } = useTranslation();
  const [compareWith, setCompareWith] = useState<PlanetId>(() =>
    getDefaultCompare(bodyId),
  );

  const body = getBody(bodyId);
  const compareBody = getBody(compareWith);
  if (!body || !compareBody) return null;

  const rA = REAL_RADIUS[bodyId] ?? 1;
  const rB = REAL_RADIUS[compareWith] ?? 1;
  const larger = Math.max(rA, rB);

  const visualA = Math.max(MIN_VISUAL_R, MAX_VISUAL_R * (rA / larger));
  const visualB = Math.max(MIN_VISUAL_R, MAX_VISUAL_R * (rB / larger));

  const colorA = body.def.color;
  const colorB = compareBody.def.color;

  const nameA = bodyName(bodyId);
  const nameB = bodyName(compareWith);

  const ratio = larger / Math.min(rA, rB);
  const fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: ratio >= 10 ? 0 : 1 });
  const roundedRatio = fmt.format(ratio);

  const comparisonLabel = (): string => {
    const nearlyEqual = Math.abs(rA - rB) / larger < 0.05;
    if (nearlyEqual) {
      return locale === "sv"
        ? `${nameA} och ${nameB} är ungefär lika stora`
        : `${nameA} and ${nameB} are about the same size`;
    }
    const biggerName = rA >= rB ? nameA : nameB;
    const smallerName = rA >= rB ? nameB : nameA;
    return locale === "sv"
      ? `Det ryms ungefär ${roundedRatio} ${smallerName} i ${biggerName}`
      : `${biggerName} is about ${roundedRatio}× larger than ${smallerName}`;
  };

  const labelYA = Math.min(CY + visualA + 16, SVG_H - 6);
  const labelYB = Math.min(CY + visualB + 16, SVG_H - 6);

  const options = COMPARE_OPTIONS.filter((id) => id !== bodyId);

  return (
    <div className="space-y-3">
      <svg
        viewBox={`0 0 400 ${SVG_H}`}
        className="w-full max-h-48"
        aria-hidden
      >
        <circle
          cx={CX_A}
          cy={CY}
          r={visualA}
          fill={colorA}
          fillOpacity={0.2}
          stroke={colorA}
          strokeOpacity={0.65}
          strokeWidth={1.5}
        />
        <circle
          cx={CX_B}
          cy={CY}
          r={visualB}
          fill={colorB}
          fillOpacity={0.2}
          stroke={colorB}
          strokeOpacity={0.65}
          strokeWidth={1.5}
        />
        <text
          x={CX_A}
          y={labelYA}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.65}
          fontSize={11}
        >
          {nameA}
        </text>
        <text
          x={CX_B}
          y={labelYB}
          textAnchor="middle"
          fill="white"
          fillOpacity={0.65}
          fontSize={11}
        >
          {nameB}
        </text>
      </svg>

      <p className="text-center text-xs text-white/60 leading-relaxed">
        {comparisonLabel()}
      </p>

      <div className="flex flex-wrap gap-1.5 justify-center">
        {options.map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setCompareWith(id)}
            className={[
              "pointer-events-auto rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors",
              compareWith === id
                ? "bg-white/20 text-white"
                : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80",
            ].join(" ")}
          >
            {bodyName(id)}
          </button>
        ))}
      </div>
    </div>
  );
};

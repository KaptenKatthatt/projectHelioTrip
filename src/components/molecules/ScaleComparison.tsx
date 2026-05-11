import { useState } from "react";
import { useTranslation } from "../../hooks/useTranslation";
import { getBody } from "../../lib/bodies";
import type { BodyId } from "../../lib/bodies";
import type { PlanetId } from "../../lib/planets";
import { ComparisonGraphic } from "./ComparisonGraphic";
import { ComparisonSelector } from "./ComparisonSelector";

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
  sputnik: 0.000000046,
};

const COMPARE_OPTIONS: PlanetId[] = ["sun", "earth", "jupiter", "mars"];

const MAX_VISUAL_R = 75;
const MIN_VISUAL_R = 3;

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

  const options = COMPARE_OPTIONS.filter((id) => id !== bodyId);

  return (
    <div className="space-y-3">
      <ComparisonGraphic
        visualA={visualA}
        visualB={visualB}
        colorA={colorA}
        colorB={colorB}
        nameA={nameA}
        nameB={nameB}
      />

      <p className="text-center text-xs text-white/60 leading-relaxed">
        {comparisonLabel()}
      </p>

      <ComparisonSelector
        options={options}
        compareWith={compareWith}
        setCompareWith={setCompareWith}
        bodyName={bodyName}
      />
    </div>
  );
};

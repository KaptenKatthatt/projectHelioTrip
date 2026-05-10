// SVG layout constants
const CX_A = 120;
const CX_B = 300;
const CY = 90;
const SVG_H = 200;

export type ComparisonGraphicProps = {
  readonly visualA: number;
  readonly visualB: number;
  readonly colorA: string;
  readonly colorB: string;
  readonly nameA: string;
  readonly nameB: string;
};

export const ComparisonGraphic = ({
  visualA,
  visualB,
  colorA,
  colorB,
  nameA,
  nameB,
}: ComparisonGraphicProps) => {
  const labelYA = Math.min(CY + visualA + 16, SVG_H - 6);
  const labelYB = Math.min(CY + visualB + 16, SVG_H - 6);

  return (
    <svg viewBox={`0 0 400 ${SVG_H}`} className="w-full max-h-48" aria-hidden>
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
  );
};

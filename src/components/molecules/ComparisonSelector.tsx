import type { PlanetId } from "../../lib/planets";
import type { BodyId } from "../../lib/bodies";

export type ComparisonSelectorProps = {
  readonly options: PlanetId[];
  readonly compareWith: PlanetId;
  readonly setCompareWith: (id: PlanetId) => void;
  readonly bodyName: (id: BodyId) => string;
};

export const ComparisonSelector = ({
  options,
  compareWith,
  setCompareWith,
  bodyName,
}: ComparisonSelectorProps) => (
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
        {bodyName(id as BodyId)}
      </button>
    ))}
  </div>
);

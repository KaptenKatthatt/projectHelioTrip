import { useStore } from "../../store/useStore";
import { useTranslation } from "../../hooks/useTranslation";
import type { FactCardLevel } from "../../lib/learning/bodyContent";

type Props = {
  readonly className?: string;
};

export const LevelToggle = ({ className }: Props) => {
  const level = useStore((s) => s.learningLevel);
  const setLevel = useStore((s) => s.setLearningLevel);
  const { t } = useTranslation();

  const options: Array<{ value: FactCardLevel; label: string }> = [
    { value: "middle", label: t.learn.ui.levelMiddle },
    { value: "upper", label: t.learn.ui.levelUpper },
  ];

  return (
    <div
      className={[
        "pointer-events-auto inline-flex rounded-lg bg-black/40 backdrop-blur-md border border-white/10 p-0.5 gap-0.5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLevel(opt.value)}
          className={[
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            level === opt.value
              ? "bg-white/20 text-white"
              : "text-white/50 hover:text-white/80",
          ].join(" ")}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

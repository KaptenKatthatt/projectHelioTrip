import type { ButtonHTMLAttributes } from "react";

type HudPanelToggleButtonProps = {
  readonly expanded: boolean;
  readonly className?: string;
  readonly asSpan?: boolean;
  readonly label?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label">;

const baseClassName =
  "inline-flex h-8 w-8 items-center justify-center text-lg font-semibold leading-none text-white/85 transition select-none hover:text-white";

export const HudPanelToggleButton = ({
  expanded,
  className,
  asSpan = false,
  label,
  type = "button",
  ...buttonProps
}: HudPanelToggleButtonProps) => {
  const symbol = expanded ? "-" : "+";
  const combinedClassName = [baseClassName, className].filter(Boolean).join(" ");

  if (asSpan) {
    return (
      <span aria-hidden className={combinedClassName}>
        {symbol}
      </span>
    );
  }

  return (
    <button
      type={type}
      aria-label={label}
      aria-expanded={expanded}
      className={combinedClassName}
      {...buttonProps}
    >
      {symbol}
    </button>
  );
};

import type { ButtonHTMLAttributes, ReactNode } from "react";

type HudIconButtonProps = {
  readonly label: string;
  readonly icon: ReactNode;
  readonly className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children">;

export const HudIconButton = ({
  label,
  icon,
  className,
  type = "button",
  ...buttonProps
}: HudIconButtonProps) => {
  return (
    <button
      type={type}
      aria-label={label}
      className={
        "inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/15 hover:text-white " +
        (className ?? "")
      }
      {...buttonProps}
    >
      {icon}
    </button>
  );
};
/* 
"inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/55 text-white/80 backdrop-blur-md transition hover:bg-white/15 hover:text-white " +
 */
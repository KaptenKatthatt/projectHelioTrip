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
  const buttonClassName = [
    "inline-flex h-8 w-8 items-center justify-center rounded-lg text-white/80 transition",
    "hover:bg-white/15 hover:text-white",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      aria-label={label}
      className={buttonClassName}
      {...buttonProps}
    >
      {icon}
    </button>
  );
};

import { useEffect, type ReactNode } from "react";

type BottomSheetProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
  readonly titleAccentColor?: string | null;
  readonly panelClassName?: string;
};

export const BottomSheet = ({
  open,
  onClose,
  children,
  title,
  titleAccentColor,
  panelClassName,
}: BottomSheetProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const headerStyle =
    titleAccentColor !== undefined && titleAccentColor !== null
      ? {
          background: `linear-gradient(to bottom, ${titleAccentColor}55, rgba(5, 6, 10, 0.35))`,
        }
      : undefined;

  return (
    <div className="pointer-events-auto fixed inset-0 z-[28] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Close panel"
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Panel"}
        className={
          "relative z-10 max-h-[min(85dvh,32rem)] w-full overflow-hidden rounded-t-3xl border-t border-white/10 bg-black/60 shadow-xl backdrop-blur-xl transition-transform duration-300 ease-out " +
          (panelClassName ?? "")
        }
      >
        {title ? (
          <div
            className="border-b border-white/10 px-4 pb-3 pt-4"
            style={headerStyle}
          >
            <h2 className="text-base font-semibold tracking-tight text-white">
              {title}
            </h2>
          </div>
        ) : null}
        <div className="max-h-[min(72dvh,28rem)] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};

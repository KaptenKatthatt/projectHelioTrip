import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type BottomSheetProps = {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly children: ReactNode;
  readonly title?: string;
  readonly titleAccentColor?: string | null;
  readonly panelClassName?: string;
  /** When false, scrim does not blur the scene (e.g. planet info over the canvas). */
  readonly blurScrim?: boolean;
  /** When false, sheet panel is not frosted (only the scrim area shows the scene clearly). */
  readonly blurPanel?: boolean;
  /** Animate panel from below when opening (e.g. planet info after travel). */
  readonly slideFromBottom?: boolean;
  /**
   * When false, the dimmed area does not capture pointers so the scene (e.g.
   * orbit drag) stays interactive; only the sheet panel receives clicks.
   * Escape still calls {@link onClose}.
   */
  readonly scrimBlocksPointerEvents?: boolean;
};

const SLIDE_UP_ENTER_DELAY_MS = 32;
const SLIDE_UP_DURATION_MS = 300;

export const BottomSheet = ({
  open,
  onClose,
  children,
  title,
  titleAccentColor,
  panelClassName,
  blurScrim = true,
  blurPanel = true,
  slideFromBottom = false,
  scrimBlocksPointerEvents = true,
}: BottomSheetProps) => {
  const [panelEntered, setPanelEntered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [showTopScrollCue, setShowTopScrollCue] = useState(false);
  const [showBottomScrollCue, setShowBottomScrollCue] = useState(false);

  const updateScrollCues = (): void => {
    const node = scrollContainerRef.current;
    if (!node) return;
    const maxScrollTop = node.scrollHeight - node.clientHeight;
    setShowTopScrollCue(node.scrollTop > 4);
    setShowBottomScrollCue(maxScrollTop - node.scrollTop > 4);
  };

  useLayoutEffect(() => {
    if (!open || !slideFromBottom) {
      queueMicrotask(() => {
        setPanelEntered(!slideFromBottom);
      });
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      queueMicrotask(() => {
        setPanelEntered(true);
      });
      return;
    }
    queueMicrotask(() => {
      setPanelEntered(false);
    });
    const startId = window.setTimeout(() => {
      setPanelEntered(true);
    }, SLIDE_UP_ENTER_DELAY_MS);
    return () => window.clearTimeout(startId);
  }, [open, slideFromBottom]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const node = scrollContainerRef.current;
    if (!node) return;
    updateScrollCues();
    node.addEventListener("scroll", updateScrollCues, { passive: true });
    window.addEventListener("resize", updateScrollCues);
    return () => {
      node.removeEventListener("scroll", updateScrollCues);
      window.removeEventListener("resize", updateScrollCues);
    };
  }, [open]);

  if (!open) return null;

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const panelSlideStyle: CSSProperties | undefined =
    slideFromBottom && !reduceMotion
      ? {
          transform: panelEntered
            ? "translate3d(0,0,0)"
            : "translate3d(0,100%,0)",
          transition: `transform ${SLIDE_UP_DURATION_MS}ms ease-out`,
          backfaceVisibility: "hidden",
          willChange: "transform",
        }
      : undefined;

  const headerStyle =
    titleAccentColor !== undefined && titleAccentColor !== null
      ? {
          background: `linear-gradient(to bottom, ${titleAccentColor}55, rgba(5, 6, 10, ${blurPanel ? 0.35 : 0.94}))`,
        }
      : undefined;

  const scrimClass =
    "absolute inset-0 transition " +
    (blurScrim ? "bg-black/30 backdrop-blur-sm" : "bg-black/15");

  return (
    <div
      className={
        (scrimBlocksPointerEvents ? "pointer-events-auto " : "pointer-events-none ") +
        "fixed inset-0 z-28 flex flex-col justify-end isolate"
      }
    >
      {scrimBlocksPointerEvents ? (
        <button
          type="button"
          aria-label="Close panel"
          className={scrimClass}
          onClick={onClose}
        />
      ) : (
        <div className={scrimClass + " pointer-events-none"} aria-hidden />
      )}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Panel"}
        style={panelSlideStyle}
        className={
          "pointer-events-auto relative z-10 max-h-[min(85dvh,32rem)] w-full overflow-hidden rounded-t-3xl border-t border-white/10 shadow-xl motion-reduce:transform-none! motion-reduce:transition-none! " +
          (blurPanel
            ? "bg-black/60 backdrop-blur-xl "
            : "bg-[#05060a] backdrop-blur-none ") +
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
        <div className="relative">
          {showTopScrollCue ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-4 bg-linear-to-b from-black/45 to-transparent"
            />
          ) : null}
          {showBottomScrollCue ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-linear-to-t from-black/55 to-transparent"
            />
          ) : null}
          <div
            ref={scrollContainerRef}
            className="max-h-[min(72dvh,28rem)] overflow-y-auto pr-1"
          >
          {children}
          </div>
        </div>
      </div>
    </div>
  );
};

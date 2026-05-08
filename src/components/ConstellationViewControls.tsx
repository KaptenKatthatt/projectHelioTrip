import {
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { RotateCcw, RotateCw } from "lucide-react";
import { HudIconButton } from "./atoms/HudIconButton";
import { useStore } from "../store/useStore";
import { useTranslation } from "../hooks/useTranslation";
import constellationLinesIcon from "../assets/constellation.png";

const ROLL_STEP_RAD = Math.PI / 12;
/** Radians per second while the button is held — slow, smooth drift. */
const HOLD_ROTATION_SPEED_RAD_PER_SEC = 0.42;
/** Treat release before this as a tap: total rotation snaps to one discrete step. */
const SHORT_PRESS_MS = 230;

type ConstellationViewControlsProps = {
  readonly className?: string;
};

type RotateHoldButtonProps = {
  readonly sign: 1 | -1;
  readonly label: string;
  readonly icon: ReactNode;
  readonly className?: string;
};

const ConstellationRotateHoldButton = ({
  sign,
  label,
  icon,
  className,
}: RotateHoldButtonProps) => {
  const adjustConstellationSpin = useStore((s) => s.adjustConstellationSpin);
  const rafRef = useRef(0);
  const holdSignRef = useRef<0 | 1 | -1>(0);
  const lastTsRef = useRef(0);
  const appliedRef = useRef(0);
  const downAtRef = useRef(0);

  const stopRaf = useCallback(() => {
    holdSignRef.current = 0;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  const tick = useCallback((now: number) => {
    function step(ts: number) {
      if (holdSignRef.current === 0) {
        rafRef.current = 0;
        return;
      }
      const last = lastTsRef.current;
      lastTsRef.current = ts;
      const dt = Math.min(0.05, (ts - last) / 1000);
      const d = holdSignRef.current * HOLD_ROTATION_SPEED_RAD_PER_SEC * dt;
      adjustConstellationSpin(d);
      appliedRef.current += d;
      rafRef.current = requestAnimationFrame(step);
    }
    step(now);
  }, [adjustConstellationSpin]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.currentTarget.setPointerCapture(e.pointerId);
      appliedRef.current = 0;
      downAtRef.current = performance.now();
      lastTsRef.current = performance.now();
      holdSignRef.current = sign;
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tick);
      }
    },
    [sign, tick],
  );

  const onPointerEnd = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
      const elapsed = performance.now() - downAtRef.current;
      stopRaf();
      lastTsRef.current = 0;
      if (elapsed < SHORT_PRESS_MS) {
        const target = sign * ROLL_STEP_RAD;
        const rem = target - appliedRef.current;
        if (Math.abs(rem) > 1e-6) {
          adjustConstellationSpin(rem);
        }
      }
    },
    [sign, adjustConstellationSpin, stopRaf],
  );

  return (
    <HudIconButton
      label={label}
      title={label}
      icon={icon}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      className={
        "touch-manipulation select-none " + (className ?? "")
      }
    />
  );
};

export const ConstellationViewControls = ({
  className,
}: ConstellationViewControlsProps) => {
  const { t } = useTranslation();
  const constellationLinesVisible = useStore(
    (s) => s.constellationLinesVisible,
  );
  const toggleConstellationLinesVisible = useStore(
    (s) => s.toggleConstellationLinesVisible,
  );

  return (
    <div
      className={
        "pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-black/40 px-1 py-0.5 backdrop-blur-md " +
        (className ?? "")
      }
    >
      <ConstellationRotateHoldButton
        sign={-1}
        label={t.ui.rotateConstellationLeft}
        icon={<RotateCcw className="h-4 w-4" aria-hidden />}
        className="h-8 w-8 shrink-0 rounded-full hover:bg-white/10"
      />
      <button
        type="button"
        onClick={toggleConstellationLinesVisible}
        aria-pressed={constellationLinesVisible}
        aria-label={
          constellationLinesVisible
            ? t.ui.hideConstellationLines
            : t.ui.showConstellationLines
        }
        title={
          constellationLinesVisible
            ? t.ui.hideConstellationLines
            : t.ui.showConstellationLines
        }
        className={
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-white transition " +
          (constellationLinesVisible
            ? "bg-cyan-300/20 text-cyan-100 ring-1 ring-cyan-200/50 hover:bg-cyan-300/30"
            : "hover:bg-white/10 text-white/80 hover:text-white")
        }
      >
        <img
          src={constellationLinesIcon}
          alt=""
          className="h-4 w-4 object-contain brightness-0 invert"
          aria-hidden
        />
      </button>
      <ConstellationRotateHoldButton
        sign={1}
        label={t.ui.rotateConstellationRight}
        icon={<RotateCw className="h-4 w-4" aria-hidden />}
        className="h-8 w-8 shrink-0 rounded-full hover:bg-white/10"
      />
    </div>
  );
};

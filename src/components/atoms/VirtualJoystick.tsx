import { useCallback, useRef } from "react";
import {
  freeFlightTouchBus,
  type FreeFlightTouchAxes,
} from "../../lib/freeFlightTouchBus";

const BASE_PX = 118;
const THUMB_PX = 46;

type VirtualJoystickProps = {
  /** `move`: Y+ = forward (screen up). `look`: Y+ = look down (like mouse down). */
  mode: "move" | "look";
  className?: string;
};

const writeAxes = (
  target: FreeFlightTouchAxes,
  sx: number,
  sy: number,
  maxR: number,
  mode: "move" | "look",
): void => {
  const inv = maxR > 1e-6 ? 1 / maxR : 0;
  target.x = sx * inv;
  if (mode === "move") {
    target.y = -sy * inv;
  } else {
    target.y = sy * inv;
  }
};

export const VirtualJoystick = ({
  mode,
  className = "",
}: VirtualJoystickProps) => {
  const baseRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  const applyOffset = useCallback(
    (clientX: number, clientY: number): void => {
      const base = baseRef.current;
      const thumb = thumbRef.current;
      if (!base || !thumb) return;

      const rect = base.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const maxR = Math.max(8, rect.width / 2 - THUMB_PX / 2);

      const dx = clientX - cx;
      const dy = clientY - cy;
      const len = Math.hypot(dx, dy);
      const scale = len > maxR ? maxR / len : 1;
      const sx = dx * scale;
      const sy = dy * scale;

      const bus =
        mode === "move" ? freeFlightTouchBus.move : freeFlightTouchBus.look;
      writeAxes(bus, sx, sy, maxR, mode);

      thumb.style.left = `calc(50% + ${sx}px)`;
      thumb.style.top = `calc(50% + ${sy}px)`;
    },
    [mode],
  );

  const reset = useCallback((): void => {
    draggingRef.current = false;
    const bus =
      mode === "move" ? freeFlightTouchBus.move : freeFlightTouchBus.look;
    bus.x = 0;
    bus.y = 0;
    const thumb = thumbRef.current;
    if (thumb) {
      thumb.style.left = "50%";
      thumb.style.top = "50%";
    }
  }, [mode]);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>): void => {
    const base = baseRef.current;
    if (!base) return;
    base.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    applyOffset(event.clientX, event.clientY);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (!draggingRef.current) return;
    applyOffset(event.clientX, event.clientY);
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>): void => {
    const base = baseRef.current;
    if (base?.hasPointerCapture(event.pointerId)) {
      base.releasePointerCapture(event.pointerId);
    }
    reset();
  };

  return (
    <div
      ref={baseRef}
      role="presentation"
      className={`touch-none select-none rounded-full border border-white/10 bg-black/40 backdrop-blur-md ${className}`}
      style={{ width: BASE_PX, height: BASE_PX, touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div
        ref={thumbRef}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[46px] w-[46px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/15 ring-1 ring-white/20"
      />
    </div>
  );
};

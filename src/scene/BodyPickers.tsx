import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import { useCursor } from '@react-three/drei/web/useCursor';
import { PerspectiveCamera, Vector3, type Group, type Mesh } from 'three';
import { PLANETS } from '../lib/planets';
import { MOONS } from '../lib/moons';
import {
  getBodyRadius,
  getBodyWorldPosition,
  type BodyId,
} from '../lib/bodies';
import { useStore } from '../store/useStore';
import { useTranslation } from '../hooks/useTranslation';

/**
 * Picking radius is `max(bodyRadius * 1.2, screenPxToWorld(20))` — so
 * the pickable volume never shrinks below ~20 screen pixels regardless
 * of how far away the body is. This makes Pluto clickable from the
 * inner solar system without needing to zoom in first.
 */
const PICK_SCREEN_PX = 20;
const CLICK_PIXEL_THRESHOLD = 5;
/**
 * Vertical offset between the body's center and the label, expressed
 * in screen pixels. Clamped to be at least `bodyRadius * 1.3` so the
 * label never clips into huge bodies like the Sun or Jupiter.
 */
const LABEL_OFFSET_PX = 36;
const LABEL_MIN_WORLD_OFFSET_FACTOR = 1.3;
const LABEL_FADE_MS = 200;
/**
 * Grace window before unmounting the label after hover ends. Must be
 * ≥ LABEL_FADE_MS so the fade-out animation can finish.
 */
const LABEL_UNMOUNT_MS = 260;

type PickableEntry = {
  id: BodyId;
  radius: number;
};

export const BodyPickers = () => {
  const navigationMode = useStore((s) => s.navigationMode);
  const viewMode = useStore((s) => s.viewMode);
  const isTraveling = useStore((s) => s.isTraveling);
  const travelTo = useStore((s) => s.travelTo);

  const [hoveredId, setHoveredId] = useState<BodyId | null>(null);
  useCursor(hoveredId !== null);

  const enabled = !isTraveling && navigationMode !== 'free';

  const pickables = useMemo<readonly PickableEntry[]>(() => {
    const list: PickableEntry[] = PLANETS.map((p) => ({
      id: p.id,
      radius: p.radius,
    }));
    if (viewMode === 'close') {
      for (const m of MOONS) list.push({ id: m.id, radius: m.radius });
    }
    return list;
  }, [viewMode]);

  const onHoverEnter = useCallback((id: BodyId) => {
    setHoveredId(id);
  }, []);

  const onHoverLeave = useCallback((id: BodyId) => {
    setHoveredId((current) => (current === id ? null : current));
  }, []);

  const onSelect = useCallback(
    (id: BodyId) => {
      travelTo(id);
    },
    [travelTo],
  );

  /**
   * Keep the label mounted for a short grace window after hover ends
   * so the fade-out transition can play, then unmount to free the
   * Html portal.
   */
  const [displayedId, setDisplayedId] = useState<BodyId | null>(null);
  useEffect(() => {
    if (hoveredId !== null) {
      const timeout = setTimeout(() => setDisplayedId(hoveredId), 0);
      return () => clearTimeout(timeout);
    }

    if (displayedId === null) {
      return;
    }

    const timeout = setTimeout(() => setDisplayedId(null), LABEL_UNMOUNT_MS);
    return () => clearTimeout(timeout);
  }, [hoveredId, displayedId]);

  if (!enabled) return null;

  return (
    <>
      {pickables.map((entry) => (
        <PickableBody
          key={entry.id}
          id={entry.id}
          radius={entry.radius}
          onHoverEnter={onHoverEnter}
          onHoverLeave={onHoverLeave}
          onSelect={onSelect}
        />
      ))}
      {displayedId !== null && (
        <HoverLabel
          key={displayedId}
          bodyId={displayedId}
          visible={hoveredId === displayedId}
        />
      )}
    </>
  );
};

type PickableBodyProps = {
  id: BodyId;
  radius: number;
  onHoverEnter: (id: BodyId) => void;
  onHoverLeave: (id: BodyId) => void;
  onSelect: (id: BodyId) => void;
};

const PickableBody = ({
  id,
  radius,
  onHoverEnter,
  onHoverLeave,
  onSelect,
}: PickableBodyProps) => {
  const meshRef = useRef<Mesh>(null);
  const downPosRef = useRef<{ x: number; y: number } | null>(null);
  const camera = useThree((s) => s.camera);
  const screenHeight = useThree((s) => s.size.height);
  const scratch = useMemo(() => new Vector3(), []);

  useFrame(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    getBodyWorldPosition(id, scratch);
    mesh.position.copy(scratch);

    if (camera instanceof PerspectiveCamera) {
      const distance = camera.position.distanceTo(scratch);
      const fovRad = (camera.fov * Math.PI) / 180;
      const pxWorld =
        (distance * Math.tan(fovRad / 2) * PICK_SCREEN_PX) / screenHeight;
      const effectiveRadius = Math.max(radius * 1.2, pxWorld);
      mesh.scale.setScalar(effectiveRadius);
    } else {
      mesh.scale.setScalar(radius * 1.2);
    }
  });

  const handlePointerOver = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      event.stopPropagation();
      onHoverEnter(id);
    },
    [id, onHoverEnter],
  );

  const handlePointerOut = useCallback(() => {
    onHoverLeave(id);
  }, [id, onHoverLeave]);

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    downPosRef.current = { x: event.clientX, y: event.clientY };
  }, []);

  const handlePointerUp = useCallback(
    (event: ThreeEvent<PointerEvent>) => {
      const down = downPosRef.current;
      downPosRef.current = null;
      if (!down) return;
      const dx = event.clientX - down.x;
      const dy = event.clientY - down.y;
      if (dx * dx + dy * dy > CLICK_PIXEL_THRESHOLD * CLICK_PIXEL_THRESHOLD) {
        return;
      }
      event.stopPropagation();
      onSelect(id);
    },
    [id, onSelect],
  );

  return (
    <mesh
      ref={meshRef}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <sphereGeometry args={[1, 16, 12]} />
      <meshBasicMaterial
        transparent
        opacity={0}
        depthWrite={false}
        colorWrite={false}
      />
    </mesh>
  );
};

type HoverLabelProps = {
  bodyId: BodyId;
  visible: boolean;
};

const HoverLabel = ({ bodyId, visible }: HoverLabelProps) => {
  const groupRef = useRef<Group>(null);
  const camera = useThree((s) => s.camera);
  const screenHeight = useThree((s) => s.size.height);
  const scratch = useMemo(() => new Vector3(), []);
  const { bodyName } = useTranslation();

  /**
   * One-frame delay before fading in. Without it the span mounts
   * directly at `opacity: 1` (no transition source) and the ease-in
   * is skipped.
   */
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const show = mounted && visible;

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    getBodyWorldPosition(bodyId, scratch);

    let offset = getBodyRadius(bodyId) ?? 1;
    offset *= LABEL_MIN_WORLD_OFFSET_FACTOR;
    if (camera instanceof PerspectiveCamera) {
      const distance = camera.position.distanceTo(scratch);
      const fovRad = (camera.fov * Math.PI) / 180;
      const pxWorld =
        (distance * Math.tan(fovRad / 2) * LABEL_OFFSET_PX) / screenHeight;
      offset = Math.max(offset, pxWorld);
    }

    group.position.set(scratch.x, scratch.y + offset, scratch.z);
  });

  return (
    <group ref={groupRef}>
      <Html center style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
        <span
          style={{
            opacity: show ? 1 : 0,
            transition: `opacity ${LABEL_FADE_MS}ms ease-in-out`,
          }}
          className="rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-mono text-xs text-white/95 backdrop-blur-sm"
        >
          {bodyName(bodyId)}
        </span>
      </Html>
    </group>
  );
};

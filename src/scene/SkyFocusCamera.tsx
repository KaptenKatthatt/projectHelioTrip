import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { MOONS } from "../lib/moons";
import { PLANETS } from "../lib/planets";
import { getLiveMoonOffset, getLivePosition } from "../lib/positionsBus";
import { SKY_TARGET_DIRECTIONS } from "../lib/skyTargets";
import { useStore } from "../store/useStore";

const WORLD_UP = new Vector3(0, 1, 0);
/** Upper bound for sky-focus pan duration (scaled by path length). */
const INTRO_DURATION_MAX_MS = 780;
/** Min duration so small moves still ease smoothly. */
const MIN_INTRO_DURATION_MS = 260;
/**
 * Max forward move along the view ray. `findSafeEndPosition` shortens this when
 * the segment would clip a body.
 */
const INTRO_FORWARD_CAP = 36;
/** Path length used only to scale duration — smaller ⇒ longer eased time for the same move. */
const INTRO_DURATION_PATH_REFERENCE = 70;
const LOOK_AT_DISTANCE = 100;
const BODY_PADDING = 1.2;
const MIN_SAFE_MOVE_DISTANCE = 8;

type IntroTransition = {
  active: boolean;
  startedAtMs: number;
  durationMs: number;
  startPos: Vector3;
  endPos: Vector3;
  startDir: Vector3;
  endDir: Vector3;
};

type BodySphere = {
  center: Vector3;
  radius: number;
};

const BODY_SPHERES: BodySphere[] = [
  ...PLANETS.map(() => ({
    center: new Vector3(),
    radius: 0,
  })),
  ...MOONS.map(() => ({
    center: new Vector3(),
    radius: 0,
  })),
];

/** Gentler than cubic — reads as a slower pan for the same duration. */
const easeInOutSine = (x: number): number =>
  -(Math.cos(Math.PI * x) - 1) / 2;

// ⚡ Bolt: Pre-allocated scratch vector to avoid 'new Vector3()' allocations
// inside the while-loop of findSafeEndPosition, reducing garbage collection overhead.
const tmpPointSubStart = new Vector3();

const closestPointOnSegment = (
  start: Vector3,
  end: Vector3,
  point: Vector3,
  out: Vector3,
): Vector3 => {
  out.subVectors(end, start);
  const lenSq = out.lengthSq();
  if (lenSq <= 1e-8) return out.copy(start);

  tmpPointSubStart.subVectors(point, start);
  const t = Math.max(0, Math.min(1, tmpPointSubStart.dot(out) / lenSq));

  return out.copy(start).addScaledVector(out, t);
};

const segmentIntersectsSphere = (
  start: Vector3,
  end: Vector3,
  center: Vector3,
  radius: number,
  tmp: Vector3,
): boolean =>
  closestPointOnSegment(start, end, center, tmp).distanceTo(center) <= radius;

const updateBodySpheres = (): void => {
  let i = 0;
  for (const planet of PLANETS) {
    const sphere = BODY_SPHERES[i++]!;
    sphere.center.copy(getLivePosition(planet.id));
    sphere.radius = planet.radius + BODY_PADDING;
  }
  for (const moon of MOONS) {
    const sphere = BODY_SPHERES[i++]!;
    sphere.center
      .copy(getLivePosition(moon.parent))
      .add(getLiveMoonOffset(moon.id));
    sphere.radius = moon.radius + BODY_PADDING;
  }
};

const tmpClosest = new Vector3();

// ⚡ Bolt: Pass an 'out' vector parameter instead of allocating new Vector3 instances
// or calling .clone(). This eliminates garbage collection pauses when finding safe paths.
const findSafeEndPosition = (startPos: Vector3, direction: Vector3, out: Vector3): Vector3 => {
  updateBodySpheres();
  let distance = INTRO_FORWARD_CAP;

  while (distance >= MIN_SAFE_MOVE_DISTANCE) {
    out.copy(startPos).addScaledVector(direction, distance);
    let hit = false;
    for (const body of BODY_SPHERES) {
      if (
        segmentIntersectsSphere(
          startPos,
          out,
          body.center,
          body.radius,
          tmpClosest,
        )
      ) {
        hit = true;
        break;
      }
    }
    if (!hit) return out;
    distance *= 0.5;
  }
  return out.copy(startPos);
};

export const SkyFocusCamera = () => {
  const camera = useThree((s) => s.camera);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const skyFocusId = useStore((s) => s.skyFocusId);
  const viewMode = useStore((s) => s.viewMode);
  const navigationMode = useStore((s) => s.navigationMode);
  const setIsTraveling = useStore((s) => s.setIsTraveling);

  const currentDirRef = useRef(new Vector3());
  const tmpDirRef = useRef(new Vector3());
  const introRef = useRef<IntroTransition>({
    active: false,
    startedAtMs: 0,
    durationMs: INTRO_DURATION_MAX_MS,
    startPos: new Vector3(),
    endPos: new Vector3(),
    startDir: new Vector3(),
    endDir: new Vector3(),
  });
  const lookAtRef = useMemo(() => new Vector3(), []);
  const lastSkyFocusIdRef = useRef(-1);

  useEffect(() => {
    if (!selectedConstellation) {
      introRef.current.active = false;
      setIsTraveling(false);
    }
  }, [selectedConstellation, setIsTraveling]);

  useEffect(() => {
    if (!selectedConstellation) return;
    if (skyFocusId === lastSkyFocusIdRef.current) return;
    lastSkyFocusIdRef.current = skyFocusId;

    camera.getWorldDirection(currentDirRef.current);
    const transition = introRef.current;
    transition.active = true;
    transition.startedAtMs = performance.now();
    transition.startPos.copy(camera.position);
    transition.startDir.copy(currentDirRef.current);

    transition.endDir
      .copy(SKY_TARGET_DIRECTIONS[selectedConstellation])
      .normalize();
    findSafeEndPosition(transition.startPos, transition.endDir, transition.endPos);

    const pathLength = transition.startPos.distanceTo(transition.endPos);
    const scaled =
      pathLength < 1e-4
        ? MIN_INTRO_DURATION_MS
        : (INTRO_DURATION_MAX_MS * pathLength) / INTRO_DURATION_PATH_REFERENCE;
    transition.durationMs = Math.max(
      MIN_INTRO_DURATION_MS,
      Math.min(INTRO_DURATION_MAX_MS, scaled),
    );

    setIsTraveling(true);
  }, [
    camera,
    selectedConstellation,
    skyFocusId,
    setIsTraveling,
  ]);

  useFrame(() => {
    const transition = introRef.current;
    if (!transition.active) return;

    if (navigationMode === "free" || viewMode !== "overview") {
      transition.active = false;
      setIsTraveling(false);
      return;
    }

    const progress = Math.min(
      1,
      (performance.now() - transition.startedAtMs) / transition.durationMs,
    );
    const eased = easeInOutSine(progress);

    // Lerp view toward the constellation’s sky direction; small forward drift
    // along that ray keeps the path from clipping planets (see findSafeEndPosition).
    tmpDirRef.current
      .copy(transition.startDir)
      .lerp(transition.endDir, eased)
      .normalize();
    camera.position.lerpVectors(transition.startPos, transition.endPos, eased);
    lookAtRef
      .copy(camera.position)
      .addScaledVector(tmpDirRef.current, LOOK_AT_DISTANCE);
    camera.up.copy(WORLD_UP);
    camera.lookAt(lookAtRef);

    if (progress >= 1) {
      transition.active = false;
      setIsTraveling(false);
    }
  }, 1);

  return null;
};

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import { Vector3 } from "three";
import { useStore } from "../store/useStore";
import {
  AIM_FRACTION,
  ARC_HEIGHT_FACTOR,
  LOOK_AT_DISTANCE,
  OVERVIEW_POSITION,
  OVERVIEW_TARGET,
  TOTAL_TRAVEL_DURATION_MS,
  WORLD_UP,
  createTravelFromState,
  easeInOutQuart,
  easeInOutSine,
  resolveEndPos,
  resolveTarget,
  slerpDirections,
  toArrived,
  type Arrived,
  type Travel,
} from "./cameraTravel";
import { cameraTravelSpringProgressRef } from "./cameraTravelSpringProgress";

export { CAMERA_TRAVEL_TOTAL_DURATION_MS } from "./cameraTravel";

export const CameraManager = () => {
  const camera = useThree((s) => s.camera);

  const travelId = useStore((s) => s.travelId);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const navigationMode = useStore((s) => s.navigationMode);
  const setCameraPosition = useStore((s) => s.setCameraPosition);
  const arrive = useStore((s) => s.arrive);

  const travelRef = useRef<Travel | null>(null);
  const arrivedRef = useRef<Arrived | null>(null);
  const previousNavigationModeRef = useRef(navigationMode);

  const tmpEndPos = useMemo(() => new Vector3(), []);
  const tmpTargetPos = useMemo(() => new Vector3(), []);
  const tmpScratch = useMemo(() => new Vector3(), []);
  const tmpDir = useMemo(() => new Vector3(), []);
  const tmpInterpDir = useMemo(() => new Vector3(), []);
  const tmpLookAt = useMemo(() => new Vector3(), []);
  const arcPosRef = useRef(new Vector3());

  const [{ t }, api] = useSpring(() => ({
    t: 0,
    config: { duration: TOTAL_TRAVEL_DURATION_MS, easing: (x: number) => x },
  }));

  useEffect(() => {
    if (travelId === 0) return;

    const state = useStore.getState();
    const startPos = camera.position.clone();
    const startForward = new Vector3();
    camera.getWorldDirection(startForward);

    const travel = createTravelFromState(state, startPos, startForward);
    if (!travel) {
      cameraTravelSpringProgressRef.current = null;
      return;
    }

    travelRef.current = travel;
    arrivedRef.current = null;
    cameraTravelSpringProgressRef.current = 0;

    api.start({
      from: { t: 0 },
      to: { t: 1 },
      onRest: (result) => {
        if (!result.finished) return;
        const current = travelRef.current;
        if (!current) return;

        resolveEndPos(current, tmpEndPos, tmpScratch);
        setCameraPosition(tmpEndPos);
        arrive();
        arrivedRef.current = toArrived(current);
        travelRef.current = null;
        cameraTravelSpringProgressRef.current = null;
      },
    });
  }, [travelId, camera, api, setCameraPosition, arrive, tmpEndPos, tmpScratch]);

  useEffect(() => {
    const previous = previousNavigationModeRef.current;
    previousNavigationModeRef.current = navigationMode;
    if (previous !== "free" || navigationMode !== "cinematic") return;

    /**
     * Leaving free-flight with ESC should keep the exact camera pose.
     * If an old "overview arrived" marker remains, CameraManager would
     * otherwise snap back to OVERVIEW_POSITION on the next frame.
     */
    arrivedRef.current = null;
  }, [navigationMode]);

  useFrame(() => {
    if (useStore.getState().navigationMode === "free") return;

    const travel = travelRef.current;

    if (travel) {
      const progress = t.get();
      cameraTravelSpringProgressRef.current = progress;
      resolveTarget(travel, tmpTargetPos);

      if (progress <= AIM_FRACTION) {
        const aim = easeInOutSine(progress / AIM_FRACTION);

        tmpDir.copy(tmpTargetPos).sub(travel.startPos).normalize();

        slerpDirections(travel.startForward, tmpDir, aim, tmpInterpDir);

        tmpLookAt
          .copy(travel.startPos)
          .addScaledVector(tmpInterpDir, LOOK_AT_DISTANCE);

        camera.position.copy(travel.startPos);
        camera.up.copy(WORLD_UP);
        camera.lookAt(tmpLookAt);
        return;
      }

      const fly = easeInOutQuart(
        (progress - AIM_FRACTION) / (1 - AIM_FRACTION),
      );

      resolveEndPos(travel, tmpEndPos, tmpScratch);
      arcPosRef.current.lerpVectors(travel.startPos, tmpEndPos, fly);
      const arcHeight =
        travel.startPos.distanceTo(tmpEndPos) * ARC_HEIGHT_FACTOR;
      arcPosRef.current.y += Math.sin(fly * Math.PI) * arcHeight;

      camera.position.copy(arcPosRef.current);
      camera.up.copy(WORLD_UP);
      camera.lookAt(tmpTargetPos);
      return;
    }

    const arrived = arrivedRef.current;
    if (!arrived) return;

    /**
     * After arriving at a body, `PlanetOrbitControls` owns the camera:
     * it tracks the body's live position and lets the user orbit/zoom.
     * Writing `camera.position` here would fight OrbitControls and
     * snap the camera back to the cinematic offset every frame.
     */
    if (arrived.kind === "body") return;
    if (selectedConstellation) return;

    tmpTargetPos.copy(OVERVIEW_TARGET);
    camera.position.copy(OVERVIEW_POSITION);
    camera.up.copy(WORLD_UP);
    camera.lookAt(tmpTargetPos);
  });

  return null;
};

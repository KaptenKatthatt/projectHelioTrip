import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import { Vector3 } from "three";
import { useStore } from "../store/useStore";
import { useIsMobileLayout } from "../hooks/useIsMobileLayout";
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
import { applyMobilePlanetScreenLift } from "./mobilePlanetFraming";


export const CameraManager = () => {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const isMobileLayout = useIsMobileLayout();

  const travelId = useStore((s) => s.travelId);
  const selectedConstellation = useStore((s) => s.selectedConstellation);
  const navigationMode = useStore((s) => s.navigationMode);
  const setCameraPosition = useStore((s) => s.setCameraPosition);
  const arrive = useStore((s) => s.arrive);

  const travelRef = useRef<Travel | null>(null);
  const arrivedRef = useRef<Arrived | null>(null);
  const previousNavigationModeRef = useRef(navigationMode);

  const tmpEndPosRef = useRef(new Vector3());
  const tmpTargetPosRef = useRef(new Vector3());
  const tmpScratchRef = useRef(new Vector3());
  const tmpDirRef = useRef(new Vector3());
  const tmpInterpDirRef = useRef(new Vector3());
  const tmpLookAtRef = useRef(new Vector3());
  const arcPosRef = useRef(new Vector3());

  const [{ t }, api] = useSpring(() => ({
    t: 0,
    config: { duration: TOTAL_TRAVEL_DURATION_MS, easing: (x: number) => x },
  }));

  useEffect(() => {
    if (travelId === 0) return;
    const tmpEndPos = tmpEndPosRef.current;
    const tmpScratch = tmpScratchRef.current;

    const state = useStore.getState();
    const startPos = camera.position.clone();
    const startForward = new Vector3();
    camera.getWorldDirection(startForward);

    const travel = createTravelFromState(state, startPos, startForward);
    if (!travel) {
      useStore.setState({ isTravelAnimating: false, isTraveling: false });
      cameraTravelSpringProgressRef.current = null;
      return;
    }

    travelRef.current = travel;
    arrivedRef.current = null;
    useStore.setState({ isTravelAnimating: true });
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
        arrivedRef.current =
          current.kind === "body" ? toArrived(current) : null;
        travelRef.current = null;
        useStore.setState({ isTravelAnimating: false });
        cameraTravelSpringProgressRef.current = null;
      },
    });
  }, [travelId, camera, api, setCameraPosition, arrive]);

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
    const tmpTargetPos = tmpTargetPosRef.current;
    const tmpDir = tmpDirRef.current;
    const tmpInterpDir = tmpInterpDirRef.current;
    const tmpLookAt = tmpLookAtRef.current;
    const tmpEndPos = tmpEndPosRef.current;
    const tmpScratch = tmpScratchRef.current;

    if (useStore.getState().navigationMode === "free") return;

    const travel = travelRef.current;

    if (travel) {
      const progress = t.get();
      cameraTravelSpringProgressRef.current = progress;
      resolveTarget(travel, tmpTargetPos);
      if (travel.kind === "body") {
        tmpTargetPos.y = applyMobilePlanetScreenLift(
          camera,
          camera.position.distanceTo(tmpTargetPos),
          tmpTargetPos.y,
          size,
          isMobileLayout,
        );
      }

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

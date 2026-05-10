import { type Dispatch, type SetStateAction, useState, useEffect } from "react";
import { getBody, type BodyId } from "../../../lib/bodies";
import { AU_SCALE } from "../../../lib/constants";
import {
  getLivePosition,
  getLiveMoonOffset,
  getLiveSatelliteOffset,
} from "../../../lib/positionsBus";
import {
  worldDistanceToEarthAu,
  resolveOrbitingDistancePair,
  DISTANCE_SAMPLE_MS,
  DISTANCE_EPSILON_AU,
  type DistancePair,
} from "./utils";

const updateDistanceIfChanged = (
  setDistanceFromSunAu: Dispatch<SetStateAction<number>>,
  setDistanceToEarthAu: Dispatch<SetStateAction<number>>,
  nextDistances: DistancePair,
): void => {
  setDistanceFromSunAu((prev) =>
    Math.abs(prev - nextDistances.fromSunAu) > DISTANCE_EPSILON_AU
      ? nextDistances.fromSunAu
      : prev,
  );
  setDistanceToEarthAu((prev) =>
    Math.abs(prev - nextDistances.toEarthAu) > DISTANCE_EPSILON_AU
      ? nextDistances.toEarthAu
      : prev,
  );
};

export const useBodyDistances = (activeBody: BodyId | null) => {
  const [distanceFromSunAu, setDistanceFromSunAu] = useState(0);
  const [distanceToEarthAu, setDistanceToEarthAu] = useState(0);

  useEffect(() => {
    if (!activeBody) return;
    const body = getBody(activeBody);
    if (!body) return;

    const tick = () => {
      const distances =
        body.kind === "planet"
          ? (() => {
              const position = getLivePosition(body.def.id);
              const fromSunAu = position.length() / AU_SCALE;
              if (body.def.id === "earth") {
                return { fromSunAu, toEarthAu: 0 };
              }
              return {
                fromSunAu,
                toEarthAu: worldDistanceToEarthAu(position.x, position.y, position.z),
              };
            })()
          : resolveOrbitingDistancePair(
              body.def.parent,
              body.kind === "moon"
                ? getLiveMoonOffset(body.def.id)
                : getLiveSatelliteOffset(body.def.id),
            );
      updateDistanceIfChanged(
        setDistanceFromSunAu,
        setDistanceToEarthAu,
        distances,
      );
    };

    tick();
    const interval = window.setInterval(tick, DISTANCE_SAMPLE_MS);
    return () => window.clearInterval(interval);
  }, [activeBody]);

  return { distanceFromSunAu, distanceToEarthAu };
};

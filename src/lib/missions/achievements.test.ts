import { describe, expect, it } from "vitest";
import { evaluateAchievements } from "./achievements";

describe("evaluateAchievements", () => {
  it("unlocks first_planet only on the first planet visit", () => {
    const first = evaluateAchievements(
      { kind: "body_visited", bodyId: "mars" },
      [],
    );
    expect(first).toEqual(["first_planet"]);

    const second = evaluateAchievements(
      { kind: "body_visited", bodyId: "venus" },
      ["first_planet"],
    );
    expect(second).toEqual([]);
  });

  it("distinguishes moons from planets and satellites", () => {
    expect(
      evaluateAchievements({ kind: "body_visited", bodyId: "europa" }, []),
    ).toEqual(["first_moon"]);
    expect(
      evaluateAchievements({ kind: "body_visited", bodyId: "iss" }, []),
    ).toEqual(["first_satellite"]);
  });

  it("unlocks free flight and constellation achievements", () => {
    expect(evaluateAchievements({ kind: "free_flight_activated" }, [])).toEqual(
      ["first_free_flight"],
    );
    expect(evaluateAchievements({ kind: "constellation_focused" }, [])).toEqual(
      ["first_constellation"],
    );
  });

  it("unlocks first_mission_completed only once", () => {
    expect(evaluateAchievements({ kind: "mission_completed" }, [])).toEqual([
      "first_mission_completed",
    ]);
    expect(
      evaluateAchievements({ kind: "mission_completed" }, [
        "first_mission_completed",
      ]),
    ).toEqual([]);
  });
});

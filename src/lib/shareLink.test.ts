import { describe, expect, it } from "vitest";
import {
  buildShareLinkSearch,
  inferShareLinkContextType,
  parseShareLink,
} from "./shareLink";

describe("shareLink", () => {
  it("returns null when query is empty", () => {
    expect(parseShareLink("")).toBeNull();
    expect(parseShareLink("?")).toBeNull();
  });

  it("parses a full share link", () => {
    const search = buildShareLinkSearch({
      bodyId: "mars",
      simulationTimeMs: Date.parse("2026-04-25T12:00:00.000Z"),
      timeScale: 30,
      gameMode: "challenge",
      missionId: "jupiter_moons",
      navigationMode: "cinematic",
    });
    const state = parseShareLink(search);
    expect(state).not.toBeNull();
    expect(state?.bodyId).toBe("mars");
    expect(state?.timeScale).toBe(30);
    expect(state?.gameMode).toBe("challenge");
    expect(state?.missionId).toBe("jupiter_moons");
    expect(state?.navigationMode).toBe("cinematic");
  });

  it("drops unknown bodies, modes and missions silently", () => {
    const state = parseShareLink(
      "?v=1&body=krypton&mode=hacker&mission=noop&ts=99999&nav=warp",
    );
    // None of the params validate so the parser refuses to restore at all.
    expect(state).toBeNull();
  });

  it("keeps valid fields and drops invalid ones in mixed input", () => {
    const state = parseShareLink("?v=1&body=earth&mode=hacker&ts=99999");
    expect(state).not.toBeNull();
    expect(state?.bodyId).toBe("earth");
    expect(state?.gameMode).toBeNull();
    expect(state?.timeScale).toBeNull();
  });

  it("rejects mismatched share-link version", () => {
    expect(parseShareLink("?v=99&body=earth")).toBeNull();
  });

  it("classifies share-link context types", () => {
    const base = {
      simulationTimeMs: 0,
      timeScale: 1,
      navigationMode: "cinematic" as const,
    };
    expect(
      inferShareLinkContextType({
        ...base,
        bodyId: null,
        gameMode: "explore",
        missionId: null,
      }),
    ).toBe("overview");
    expect(
      inferShareLinkContextType({
        ...base,
        bodyId: "mars",
        gameMode: "explore",
        missionId: null,
      }),
    ).toBe("body");
    expect(
      inferShareLinkContextType({
        ...base,
        bodyId: null,
        gameMode: "learn",
        missionId: null,
      }),
    ).toBe("mode");
    expect(
      inferShareLinkContextType({
        ...base,
        bodyId: "earth",
        gameMode: "challenge",
        missionId: "solar_system_start",
      }),
    ).toBe("mission");
  });
});

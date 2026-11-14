import { describe, expect, it } from "vitest";
import { createMissionResult } from "../src/scoring/createMissionResult";

describe("createMissionResult", () => {
  it("creates a complete result", () => {
    expect(createMissionResult("pressure-drop", {
      timeRemaining: 100, hintsUsed: 2, hullHazardDeductions: 50
    }, "2026-11-05T10:00:00.000Z")).toEqual({
      missionId: "pressure-drop", timeRemaining: 100, hintsUsed: 2,
      hullHazardDeductions: 50, totalScore: 850,
      rank: "Gold Mission Patch", completedAt: "2026-11-05T10:00:00.000Z"
    });
  });
  it("rejects an empty mission ID", () => {
    expect(() => createMissionResult("", {
      timeRemaining: 0, hintsUsed: 0, hullHazardDeductions: 0
    })).toThrow();
  });
});

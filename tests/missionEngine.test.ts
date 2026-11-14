import { describe, expect, it } from "vitest";
import { MissionEngine } from "../src/missions/missionEngine";
import { toMissionScoreInput } from "../src/missions/missionIntegration";

describe("MissionEngine", () => {
  it("starts a known mission with its initial resources", () => {
    const engine = new MissionEngine("solar-repair");
    expect(engine.getState().status).toBe("active");
    expect(engine.getState().resources.energy).toBe(100);
  });

  it("rejects actions whose prerequisites are not complete", () => {
    const engine = new MissionEngine("solar-repair");
    const result = engine.performAction("repair-array");
    expect(result.accepted).toBe(false);
    expect(result.message).toContain("required objectives");
  });

  it("completes the solar repair mission in the intended order", () => {
    const engine = new MissionEngine("solar-repair");
    for (const action of ["inspect-array", "run-diagnostics", "repair-array", "verify-output"]) {
      expect(engine.performAction(action).accepted).toBe(true);
    }
    expect(engine.getState().status).toBe("completed");
    expect(engine.toScoreHandoff().missionId).toBe("solar-repair");
  });

  it("does not spend resources on a rejected action", () => {
    const engine = new MissionEngine("solar-repair");
    const before = engine.getState().resources.energy;
    engine.performAction("repair-array");
    expect(engine.getState().resources.energy).toBe(before);
  });

  it("creates the integration score-input shape after completion", () => {
    const engine = new MissionEngine("orientation");
    for (const action of ["inspect-console", "check-life-support", "confirm-checklist"]) {
      expect(engine.performAction(action).accepted).toBe(true);
    }
    expect(toMissionScoreInput(engine.toScoreHandoff())).toEqual({
      timeRemaining: 195,
      hintsUsed: 0,
      hullHazardDeductions: 0,
    });
  });
});

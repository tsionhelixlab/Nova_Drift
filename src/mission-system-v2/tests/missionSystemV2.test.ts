import { describe, expect, it } from "vitest";
import { MISSION_DEFINITIONS, MissionEngine, loadNasaEventContext, toNovaDriftScoreInput } from "..";

describe("mission-system-v2 compatibility", () => {
  it("retains the host mission IDs and valid definitions", () => {
    expect(MISSION_DEFINITIONS.length).toBe(5);
    expect(MISSION_DEFINITIONS.map((m) => m.id)).toContain("orientation");
    for (const mission of MISSION_DEFINITIONS) {
      expect(mission.objectives.length).toBeGreaterThan(0);
      expect(mission.actions.length).toBeGreaterThan(0);
    }
  });

  it("keeps the established score handoff shape and seconds unit", () => {
    const engine = new MissionEngine("orientation");
    for (const action of ["inspect-console", "check-life-support", "confirm-checklist"]) {
      expect(engine.performAction(action).accepted).toBe(true);
    }
    expect(toNovaDriftScoreInput(engine.toScoreHandoff())).toEqual({
      timeRemaining: 195, hintsUsed: 0, hullHazardDeductions: 0,
    });
  });

  it("labels absent NASA data as simulated, never live", async () => {
    const context = await loadNasaEventContext();
    expect(context.real).toBe(false);
    expect(context.source).toMatch(/SIMULATED/);
  });
});

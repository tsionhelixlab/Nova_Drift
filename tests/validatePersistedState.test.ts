
import { describe, expect, it } from "vitest";
import { validatePersistedState } from "../src/persistence/validatePersistedState";

describe("validatePersistedState", () => {
  it("rejects invalid mission progress", () => {
    const result = validatePersistedState({
      missionProgress: {
        "pressure-drop": {
          missionId: "pressure-drop",
          status: "flying",
          startedAt: null,
          completedAt: null,
          attempts: -5
        }
      }
    });

    expect(result.missionProgress).toEqual({});
  });

  it("keeps valid mission progress", () => {
    const progress = {
      missionId: "pressure-drop",
      status: "available",
      startedAt: null,
      completedAt: null,
      attempts: 0
    };

    const result = validatePersistedState({
      missionProgress: { "pressure-drop": progress }
    });

    expect(result.missionProgress?.["pressure-drop"]).toEqual(progress);
  });

  it("rejects invalid achievement records", () => {
    const result = validatePersistedState({
      unlockedAchievements: [
        { achievementId: "", unlockedAt: "not-a-date" }
      ]
    });

    expect(result.unlockedAchievements).toEqual([]);
  });

  it("handles completely invalid saved data", () => {
    expect(validatePersistedState(null)).toEqual({});
  });
});

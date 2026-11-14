import { beforeEach, describe, expect, it } from "vitest";
import type { StateStorage } from "zustand/middleware";
import { createGameStore } from "../src/store/gameStore";
import { createMissionResult } from "../src/scoring/createMissionResult";

function makeStorage(): StateStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); },
    removeItem: (key) => { map.delete(key); }
  };
}

describe("game store", () => {
  let store: ReturnType<typeof createGameStore>;
  beforeEach(() => { store = createGameStore(makeStorage()); });

  it("sets a cadet profile", () => {
    const profile = {
      id: "cadet-1", callsign: "ORBIT", avatar: "astronaut-1",
      specialization: "Engineering", createdAt: "2026-11-05T10:00:00.000Z"
    };
    store.getState().setCadetProfile(profile);
    expect(store.getState().cadetProfile).toEqual(profile);
  });

  it("makes a mission available and starts it", () => {
    store.getState().setMissionAvailable("pressure-drop");
    store.getState().startMission("pressure-drop", "2026-11-05T10:00:00.000Z");
    expect(store.getState().missionProgress["pressure-drop"].status).toBe("in_progress");
    expect(store.getState().missionProgress["pressure-drop"].attempts).toBe(1);
  });

it("does not start a locked mission", () => {
  store.getState().setMissionLocked("lunar-landing");

  expect(() =>
    store.getState().startMission("lunar-landing")
  ).toThrow("This mission is locked.");

  expect(
    store.getState().missionProgress["lunar-landing"].status
  ).toBe("locked");
});

  it("records a result and completes the mission", () => {
    store.getState().setMissionAvailable("pressure-drop");
store.getState().startMission("pressure-drop");
    const result = createMissionResult("pressure-drop", {
      timeRemaining: 100, hintsUsed: 1, hullHazardDeductions: 0
    }, "2026-11-05T10:10:00.000Z");
    store.getState().completeMission(result);
    expect(store.getState().missionResults).toHaveLength(1);
    expect(store.getState().missionProgress["pressure-drop"].status).toBe("completed");
  });

  it("does not record an identical result twice", () => {
    store.getState().setMissionAvailable("pressure-drop");
store.getState().startMission("pressure-drop");
    const result = createMissionResult("pressure-drop", {
      timeRemaining: 100, hintsUsed: 1, hullHazardDeductions: 0
    }, "2026-11-05T10:10:00.000Z");
    store.getState().completeMission(result);
    store.getState().completeMission(result);
    expect(store.getState().missionResults).toHaveLength(1);
  });

  it("resets game state", () => {
    store.getState().setMissionAvailable("pressure-drop");
    store.getState().resetGame();
    expect(store.getState().missionProgress).toEqual({});
    expect(store.getState().missionResults).toEqual([]);
    expect(store.getState().cadetProfile).toBeNull();
  });
});

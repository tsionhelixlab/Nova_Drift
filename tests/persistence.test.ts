import { describe, expect, it } from "vitest";
import type { StateStorage } from "zustand/middleware";
import { createGameStore } from "../src/store/gameStore";

function makeSharedStorage(): StateStorage {
  const map = new Map<string, string>();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => { map.set(key, value); },
    removeItem: (key) => { map.delete(key); }
  };
}

describe("persistence", () => {
  it("rehydrates saved state into a new store", async () => {
    const storage = makeSharedStorage();
    const first = createGameStore(storage);
    first.getState().setCadetProfile({
      id: "cadet-1", callsign: "ORBIT", avatar: "astronaut-1",
      specialization: "Engineering", createdAt: "2026-11-05T10:00:00.000Z"
    });
    first.getState().setMissionAvailable("pressure-drop");

    const second = createGameStore(storage);
    await second.persist.rehydrate();

    expect(second.getState().cadetProfile?.callsign).toBe("ORBIT");
    expect(second.getState().missionProgress["pressure-drop"].status).toBe("available");
  });
});

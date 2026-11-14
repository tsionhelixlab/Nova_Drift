
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "../src/store/gameStore";
import {
  startMissionSession,
  completeMissionSession
} from "../src/integration/missionSession";

describe("Mission session integration", () => {
  beforeEach(() => {
    useGameStore.getState().resetGame();
  });

  it("starts, completes, scores and saves a mission", () => {
    const missionId = "orientation";

    useGameStore.getState().setMissionAvailable(missionId);

    const engine = startMissionSession(
      missionId,
      "2026-11-14T08:00:00.000Z"
    );

    expect(
      useGameStore.getState().missionProgress[missionId].status
    ).toBe("in_progress");

    engine.performAction("inspect-console");
    engine.performAction("check-life-support");
    engine.performAction("confirm-checklist");

    expect(engine.getState().status).toBe("completed");

    const result = completeMissionSession(
      engine,
      "2026-11-14T08:05:00.000Z"
    );

    const saved = useGameStore.getState();

    expect(result.missionId).toBe(missionId);
    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(saved.missionProgress[missionId].status).toBe("completed");
    expect(saved.missionResults).toHaveLength(1);
  });
});

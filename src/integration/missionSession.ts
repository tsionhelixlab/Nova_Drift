
import { MissionEngine } from "../missions/missionEngine";
import { toMissionScoreInput } from "../missions/missionIntegration";
import { createMissionResult } from "../scoring/createMissionResult";
import { useGameStore } from "../store/gameStore";

// Starts a mission in both the engine and persistent game store.
 
export function startMissionSession(
  missionId: string,
  startedAt = new Date().toISOString()
): MissionEngine {
  // Constructing the engine also validates the mission ID.
  const engine = new MissionEngine(missionId, startedAt);

  useGameStore.getState().startMission(missionId, startedAt);

  return engine;
}

// Restarts a persisted in-progress mission as a fresh attempt.
// Detailed mission-engine runtime state is currently kept in memory only.
export function restartMissionSession(
  missionId: string,
  startedAt = new Date().toISOString()
): MissionEngine {
  const engine = new MissionEngine(missionId, startedAt);
  const store = useGameStore.getState();
  const current = store.missionProgress[missionId];

  if (!current || current.status !== "in_progress") {
    throw new Error("Only an in-progress mission can be restarted.");
  }

  store.updateMissionProgress({
    missionId,
    status: "in_progress",
    startedAt,
    completedAt: null,
    attempts: current.attempts + 1
  });

  return engine;
}

// Saves a completed mission and its calculated score.
 
export function completeMissionSession(
  engine: MissionEngine,
  completedAt = new Date().toISOString()
) {
  const handoff = engine.toScoreHandoff();

  const scoreInput = toMissionScoreInput(handoff);

  const result = createMissionResult(
    handoff.missionId,
    scoreInput,
    completedAt
  );

  useGameStore.getState().completeMission(result);

  return result;
}

// Saves a failed mission without creating a score result.
 
export function failMissionSession(
  engine: MissionEngine,
  completedAt = new Date().toISOString()
): void {
  const state = engine.getState();

  if (state.status !== "failed") {
    throw new Error("Only a failed mission can be recorded as failed.");
  }

  const store = useGameStore.getState();
  const current = store.missionProgress[state.missionId];

  if (!current || current.status !== "in_progress") {
    throw new Error("Mission must be in progress in the game store.");
  }

  store.updateMissionProgress({
    missionId: state.missionId,
    status: "failed",
    startedAt: current.startedAt,
    completedAt,
    attempts: current.attempts
  });
}

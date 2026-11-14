import type { MissionScoreHandoff } from "./missionTypes";

/**
 * Converts this mission engine's completed-session data into the score-input
 * shape described by INTEGRATION.md. The missionId is passed separately to
 * createMissionResult(missionId, input).
 *
 * Time is passed in seconds, but INTEGRATION.md says the unit must be
 * confirmed with the team before final integration.
 */
export function toMissionScoreInput(handoff: MissionScoreHandoff): {
  timeRemaining: number;
  hintsUsed: number;
  hullHazardDeductions: number;
} {
  if (!handoff.missionId.trim()) throw new Error("Mission ID is required.");
  if (!Number.isFinite(handoff.timeRemaining) || handoff.timeRemaining < 0) {
    throw new Error("timeRemaining must be a non-negative number.");
  }
  if (!Number.isInteger(handoff.hintsUsed) || handoff.hintsUsed < 0) {
    throw new Error("hintsUsed must be a non-negative integer.");
  }
  if (!Number.isFinite(handoff.hullHazardDeductions) || handoff.hullHazardDeductions < 0) {
    throw new Error("hullHazardDeductions must be a non-negative number.");
  }
  return {
    timeRemaining: handoff.timeRemaining,
    hintsUsed: handoff.hintsUsed,
    hullHazardDeductions: handoff.hullHazardDeductions,
  };
}

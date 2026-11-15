import type { MissionScoreHandoff } from "../types";

/** Exact handoff expected by Nova Drift's existing scoring contract. */
export function toNovaDriftScoreInput(handoff: MissionScoreHandoff) {
  if (!handoff.missionId.trim()) throw new Error("Mission ID is required.");
  if (!Number.isFinite(handoff.timeRemaining) || handoff.timeRemaining < 0) throw new Error("timeRemaining must be non-negative seconds.");
  if (!Number.isInteger(handoff.hintsUsed) || handoff.hintsUsed < 0) throw new Error("hintsUsed must be a non-negative integer.");
  if (!Number.isFinite(handoff.hullHazardDeductions) || handoff.hullHazardDeductions < 0) throw new Error("hullHazardDeductions must be non-negative.");
  return {
    timeRemaining: handoff.timeRemaining,
    hintsUsed: handoff.hintsUsed,
    hullHazardDeductions: handoff.hullHazardDeductions,
  };
}

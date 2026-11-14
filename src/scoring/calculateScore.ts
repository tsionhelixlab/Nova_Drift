import type { MissionScoreInput } from "../types/result";

/** Project formula: 1000 + (time remaining × 2) - (hints × 150) - hazard deductions. */
export function calculateScore(input: MissionScoreInput): number {
  const values = [input.timeRemaining, input.hintsUsed, input.hullHazardDeductions];
  if (values.some((value) => !Number.isFinite(value) || value < 0)) {
    throw new Error("Score inputs must be finite, non-negative numbers.");
  }

  return 1000 + input.timeRemaining * 2
    - input.hintsUsed * 150
    - input.hullHazardDeductions;
}

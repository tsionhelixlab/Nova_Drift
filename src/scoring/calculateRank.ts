import type { MissionRank } from "../types/result";

export function calculateRank(score: number): MissionRank {
  if (!Number.isFinite(score)) throw new Error("Score must be a finite number.");
  if (score >= 850) return "Gold Mission Patch";
  if (score >= 650) return "Silver Flight Badge";
  return "Recalibration Required";
}

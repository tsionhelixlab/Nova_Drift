import type { MissionResult, MissionScoreInput } from "../types/result";
import { calculateRank } from "./calculateRank";
import { calculateScore } from "./calculateScore";

export function createMissionResult(
  missionId: string,
  input: MissionScoreInput,
  completedAt: string = new Date().toISOString()
): MissionResult {
  if (!missionId.trim()) throw new Error("Mission ID is required.");
  if (Number.isNaN(Date.parse(completedAt))) {
    throw new Error("completedAt must be a valid date string.");
  }

  const totalScore = calculateScore(input);
  return { missionId, ...input, totalScore, rank: calculateRank(totalScore), completedAt };
}

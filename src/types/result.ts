export type MissionRank =
  | "Gold Mission Patch"
  | "Silver Flight Badge"
  | "Recalibration Required";

export interface MissionScoreInput {
  timeRemaining: number;
  hintsUsed: number;
  hullHazardDeductions: number;
}

export interface MissionResult extends MissionScoreInput {
  missionId: string;
  totalScore: number;
  rank: MissionRank;
  completedAt: string;
}

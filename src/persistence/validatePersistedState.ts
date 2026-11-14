
import type { CadetProfile } from "../types/cadet";
import type { MissionProgress, MissionStatus } from "../types/mission";
import type { MissionResult, MissionRank } from "../types/result";
import type { UnlockedAchievement } from "../types/achievement";

export interface PersistedGameData {
  cadetProfile: CadetProfile | null;
  missionProgress: Record<string, MissionProgress>;
  missionResults: MissionResult[];
  unlockedAchievements: UnlockedAchievement[];
}

const missionStatuses: MissionStatus[] = [
  "locked", "available", "in_progress", "completed", "failed"
];

const missionRanks: MissionRank[] = [
  "Gold Mission Patch",
  "Silver Flight Badge",
  "Recalibration Required"
];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isCadetProfile(value: unknown): value is CadetProfile {
  if (!isObject(value)) return false;

  return (
    typeof value.id === "string" && value.id.trim().length > 0 &&
    typeof value.callsign === "string" && value.callsign.trim().length > 0 &&
    typeof value.avatar === "string" &&
    typeof value.specialization === "string" &&
    isValidDate(value.createdAt)
  );
}

function isMissionProgress(value: unknown): value is MissionProgress {
  if (!isObject(value)) return false;

  return (
    typeof value.missionId === "string" &&
    value.missionId.trim().length > 0 &&
    typeof value.status === "string" &&
    missionStatuses.includes(value.status as MissionStatus) &&
    (value.startedAt === null || isValidDate(value.startedAt)) &&
    (value.completedAt === null || isValidDate(value.completedAt)) &&
    Number.isInteger(value.attempts) &&
    (value.attempts as number) >= 0
  );
}

function isMissionResult(value: unknown): value is MissionResult {
  if (!isObject(value)) return false;

  return (
    typeof value.missionId === "string" &&
    value.missionId.trim().length > 0 &&
    typeof value.timeRemaining === "number" &&
    Number.isFinite(value.timeRemaining) &&
    value.timeRemaining >= 0 &&
    typeof value.hintsUsed === "number" &&
    Number.isInteger(value.hintsUsed) &&
    value.hintsUsed >= 0 &&
    typeof value.hullHazardDeductions === "number" &&
    Number.isFinite(value.hullHazardDeductions) &&
    value.hullHazardDeductions >= 0 &&
    typeof value.totalScore === "number" &&
    Number.isFinite(value.totalScore) &&
    typeof value.rank === "string" &&
    missionRanks.includes(value.rank as MissionRank) &&
    isValidDate(value.completedAt)
  );
}

function isUnlockedAchievement(
  value: unknown
): value is UnlockedAchievement {
  if (!isObject(value)) return false;

  return (
    typeof value.achievementId === "string" &&
    value.achievementId.trim().length > 0 &&
    isValidDate(value.unlockedAt)
  );
}

export function validatePersistedState(
  value: unknown
): Partial<PersistedGameData> {
  if (!isObject(value)) return {};

  const progress: Record<string, MissionProgress> = {};

  if (isObject(value.missionProgress)) {
    for (const [key, item] of Object.entries(value.missionProgress)) {
      if (
        isMissionProgress(item) &&
        item.missionId === key
      ) {
        progress[key] = item;
      }
    }
  }

  return {
    cadetProfile:
      value.cadetProfile === null || isCadetProfile(value.cadetProfile)
        ? value.cadetProfile
        : null,

    missionProgress: progress,

    missionResults: Array.isArray(value.missionResults)
      ? value.missionResults.filter(isMissionResult)
      : [],

    unlockedAchievements: Array.isArray(value.unlockedAchievements)
      ? value.unlockedAchievements.filter(isUnlockedAchievement)
      : []
  };
}

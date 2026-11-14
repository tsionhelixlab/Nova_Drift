export type MissionStatus =
  | "locked" | "available" | "in_progress" | "completed" | "failed";

export interface MissionProgress {
  missionId: string;
  status: MissionStatus;
  startedAt: string | null;
  completedAt: string | null;
  attempts: number;
}

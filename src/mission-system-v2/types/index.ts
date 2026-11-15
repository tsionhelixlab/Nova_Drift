/**
 * Shared types for Nova Drift's mission gameplay engine.
 * This module deliberately does not own global player state, persistence,
 * achievements, or final score/rank calculation.
 */

export type MissionDifficulty = "beginner" | "intermediate" | "advanced";
export type MissionResource = "energy" | "oxygen" | "time" | "repairKits" | "scienceKits";
export type MissionStatus = "not_started" | "active" | "completed" | "failed";

export interface MissionResources {
  /** Abstract gameplay units, not real spacecraft telemetry. */
  energy: number;
  oxygen: number;
  /** Remaining gameplay time, measured in seconds. */
  time: number;
  repairKits: number;
  scienceKits: number;
}

export interface ResourceChange {
  energy?: number;
  oxygen?: number;
  time?: number;
  repairKits?: number;
  scienceKits?: number;
}

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  required: boolean;
}

export interface MissionAction {
  id: string;
  label: string;
  description: string;
  /** All listed resource costs must be available before the action can run. */
  costs?: ResourceChange;
  /** Applied after costs. Positive values restore resources. */
  effects?: ResourceChange;
  /** An objective completed by this action, if any. */
  completesObjectiveId?: string;
  /** Optional prerequisite objectives. */
  requiresObjectives?: string[];
  /** Educational explanation shown after the action. */
  feedback: string;
  /** Optional extra hazard deduction passed to the scoring integration. */
  hullHazardDeduction?: number;
}

export interface MissionDefinition {
  id: string;
  title: string;
  briefing: string;
  difficulty: MissionDifficulty;
  learningOutcomes: string[];
  initialResources: MissionResources;
  objectives: MissionObjective[];
  actions: MissionAction[];
  successMessage: string;
  failureMessage: string;
}

export interface MissionActionResult {
  accepted: boolean;
  actionId: string;
  message: string;
  feedback?: string;
  state: MissionRuntimeState;
}

export interface MissionRuntimeState {
  missionId: string;
  status: MissionStatus;
  resources: MissionResources;
  completedObjectiveIds: string[];
  hintsUsed: number;
  hullHazardDeductions: number;
  actionCount: number;
  history: Array<{
    actionId: string;
    at: string;
    message: string;
  }>;
}

export interface MissionScoreHandoff {
  missionId: string;
  /** Remaining gameplay time in seconds. */
  timeRemaining: number;
  hintsUsed: number;
  hullHazardDeductions: number;
}
export type CampaignStage =
  | "investigate"
  | "decide"
  | "simulate"
  | "debrief";

export interface CampaignResources {
  power: number;
  oxygen: number;
  water: number;
  food: number;
  radiationProtection: number;
}

export interface CampaignChoice {
  id: string;
  label: string;
  detail: string;
  delta: Partial<CampaignResources>;
  score: {
    safety: number;
    science: number;
    efficiency: number;
  };
  outcome: string;
  debrief: string;
}

export interface CampaignMissionDefinition {
  id: string;
  number: number;
  title: string;
  environment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  description: string;
  objective: string;
  learningObjectives: string[];
  briefing: string;
  evidence: { label: string; value: string }[];
  decisionPrompt: string;
  choices: CampaignChoice[];
  sourceNotes: string[];
  dataSource?: string | null;
  reward: {
    badge: string;
    points: number;
  };
}

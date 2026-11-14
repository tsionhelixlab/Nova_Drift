import { getMissionDefinition } from "./missionDefinitions";
import type {
  MissionAction,
  MissionActionResult,
  MissionDefinition,
  MissionResources,
  MissionRuntimeState,
  MissionScoreHandoff,
  ResourceChange,
} from "./missionTypes";

function cloneResources(resources: MissionResources): MissionResources {
  return { ...resources };
}

function addChanges(
  current: MissionResources,
  changes: ResourceChange | undefined,
): MissionResources {
  const next = { ...current };
  if (!changes) return next;

  for (const key of Object.keys(changes) as Array<keyof MissionResources>) {
    const delta = changes[key];
    if (delta !== undefined) next[key] += delta;
  }
  return next;
}

function hasEnoughResources(
  current: MissionResources,
  costs: ResourceChange | undefined,
): boolean {
  if (!costs) return true;
  return (Object.keys(costs) as Array<keyof MissionResources>).every((key) => {
    const cost = costs[key] ?? 0;
    return cost >= 0 && current[key] >= cost;
  });
}

function requiredObjectivesComplete(
  action: MissionAction,
  completed: string[],
): boolean {
  return (action.requiresObjectives ?? []).every((id) => completed.includes(id));
}

function requiredObjectivesCompleteForMission(
  definition: MissionDefinition,
  completed: string[],
): boolean {
  return definition.objectives
    .filter((objective) => objective.required)
    .every((objective) => completed.includes(objective.id));
}

function clampResources(resources: MissionResources): MissionResources {
  return {
    energy: Math.max(0, Math.min(100, resources.energy)),
    oxygen: Math.max(0, Math.min(100, resources.oxygen)),
    time: Math.max(0, resources.time),
    repairKits: Math.max(0, resources.repairKits),
    scienceKits: Math.max(0, resources.scienceKits),
  };
}

export class MissionEngine {
  private readonly definition: MissionDefinition;
  private state: MissionRuntimeState;

  constructor(missionId: string, startedAt = new Date().toISOString()) {
    const definition = getMissionDefinition(missionId);
    if (!definition) throw new Error(`Unknown mission: ${missionId}`);
    if (Number.isNaN(Date.parse(startedAt))) throw new Error("startedAt must be a valid date.");

    this.definition = definition;
    this.state = {
      missionId,
      status: "active",
      resources: cloneResources(definition.initialResources),
      completedObjectiveIds: [],
      hintsUsed: 0,
      hullHazardDeductions: 0,
      actionCount: 0,
      history: [],
    };
  }

  getDefinition(): MissionDefinition {
    return this.definition;
  }

  getState(): MissionRuntimeState {
    return {
      ...this.state,
      resources: cloneResources(this.state.resources),
      completedObjectiveIds: [...this.state.completedObjectiveIds],
      history: this.state.history.map((entry) => ({ ...entry })),
    };
  }

  getAvailableActions(): MissionAction[] {
    if (this.state.status !== "active") return [];
    return this.definition.actions.filter((action) =>
      !action.completesObjectiveId ||
      !this.state.completedObjectiveIds.includes(action.completesObjectiveId)
    );
  }

  performAction(actionId: string, at = new Date().toISOString()): MissionActionResult {
    if (this.state.status !== "active") {
      return this.reject(actionId, "This mission is not active.");
    }
    if (Number.isNaN(Date.parse(at))) {
      return this.reject(actionId, "Action timestamp must be a valid date.");
    }

    const action = this.definition.actions.find((item) => item.id === actionId);
    if (!action) return this.reject(actionId, "Unknown action.");
    if (
      action.completesObjectiveId &&
      this.state.completedObjectiveIds.includes(action.completesObjectiveId)
    ) {
      return this.reject(actionId, "This objective has already been completed.");
    }
    if (!requiredObjectivesComplete(action, this.state.completedObjectiveIds)) {
      return this.reject(actionId, "Complete the required objectives before taking this action.");
    }
    if (!hasEnoughResources(this.state.resources, action.costs)) {
      return this.reject(actionId, "Insufficient resources for this action.");
    }

    const afterCost = addChanges(this.state.resources, {
      energy: -(action.costs?.energy ?? 0),
      oxygen: -(action.costs?.oxygen ?? 0),
      time: -(action.costs?.time ?? 0),
      repairKits: -(action.costs?.repairKits ?? 0),
      scienceKits: -(action.costs?.scienceKits ?? 0),
    });
    const afterEffects = addChanges(afterCost, action.effects);
    this.state.resources = clampResources(afterEffects);

    if (action.completesObjectiveId) {
      this.state.completedObjectiveIds.push(action.completesObjectiveId);
    }
    this.state.actionCount += 1;
    this.state.hullHazardDeductions += action.hullHazardDeduction ?? 0;

    if (this.state.resources.time <= 0 &&
        !requiredObjectivesCompleteForMission(this.definition, this.state.completedObjectiveIds)) {
      this.state.status = "failed";
    } else if (requiredObjectivesCompleteForMission(this.definition, this.state.completedObjectiveIds)) {
      this.state.status = "completed";
    }

    const message = this.state.status === "completed"
      ? this.definition.successMessage
      : this.state.status === "failed"
        ? this.definition.failureMessage
        : `${action.label} completed.`;

    this.state.history.push({ actionId, at, message });
    return {
      accepted: true,
      actionId,
      message,
      feedback: action.feedback,
      state: this.getState(),
    };
  }

  useHint(): MissionActionResult {
    if (this.state.status !== "active") return this.reject("hint", "This mission is not active.");
    this.state.hintsUsed += 1;
    return {
      accepted: true,
      actionId: "hint",
      message: "Hint used.",
      feedback: "Review the mission objectives and choose an action that satisfies their prerequisites.",
      state: this.getState(),
    };
  }

  toScoreHandoff(): MissionScoreHandoff {
    if (this.state.status !== "completed") {
      throw new Error("Only a completed mission can produce a score handoff.");
    }
    return {
      missionId: this.state.missionId,
      timeRemaining: this.state.resources.time,
      hintsUsed: this.state.hintsUsed,
      hullHazardDeductions: this.state.hullHazardDeductions,
    };
  }

  private reject(actionId: string, message: string): MissionActionResult {
    return {
      accepted: false,
      actionId,
      message,
      state: this.getState(),
    };
  }
}

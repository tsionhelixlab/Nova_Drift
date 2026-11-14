import { MISSION_DEFINITIONS } from "../missions/missionDefinitions";
import type { MissionAction, MissionDefinition, MissionResources } from "../missions/missionTypes";
import {
  startMissionSession,
  restartMissionSession,
  completeMissionSession,
  failMissionSession,
} from "../integration/missionSession";
import { useGameStore } from "../store/gameStore";

declare global {
  interface Window {
    startMission: () => void;
    showPage: (pageName: string) => void;
  }
}

type MissionEngine = ReturnType<typeof startMissionSession>;

let activeEngine: MissionEngine | null = null;

const missionArt: Record<string, { icon: string; coverClass: string }> = {
  orientation: { icon: "🧭", coverClass: "moon" },
  "solar-repair": { icon: "☀️", coverClass: "mars" },
  "leak-response": { icon: "🛠️", coverClass: "orbit" },
  "microgravity-lab": { icon: "🧪", coverClass: "moon" },
  "space-agriculture": { icon: "🌱", coverClass: "orbit" },
};

function element(id: string): HTMLElement {
  const found = document.getElementById(id);
  if (!found) throw new Error(`Frontend element not found: ${id}`);
  return found;
}

/**
 * V1 progression rule:
 * the first mission is available initially; each next mission unlocks
 * only after the previous mission is completed.
 */
function synchronizeMissionUnlocks(): void {
  const store = useGameStore.getState();

  MISSION_DEFINITIONS.forEach((mission, index) => {
    const current = store.missionProgress[mission.id];
    const previousMission = index > 0
      ? MISSION_DEFINITIONS[index - 1]
      : undefined;
    const previousCompleted = !previousMission ||
      store.missionProgress[previousMission.id]?.status === "completed";

    if (!current) {
      if (previousCompleted) {
        store.setMissionAvailable(mission.id);
      } else {
        store.setMissionLocked(mission.id);
      }
      return;
    }

    if (current.status === "locked" && previousCompleted) {
      store.setMissionAvailable(mission.id);
    }
  });
}

function missionStatusLabel(status: string): string {
  switch (status) {
    case "available": return "AVAILABLE";
    case "in_progress": return "IN PROGRESS";
    case "completed": return "COMPLETED";
    case "failed": return "ATTEMPT FAILED";
    default: return "LOCKED";
  }
}

function missionButtonLabel(status: string): string {
  switch (status) {
    case "available": return "Start Mission →";
    case "in_progress": return "Restart Mission →";
    case "failed": return "Retry Mission →";
    case "completed": return "Completed ✓";
    default: return "Locked 🔒";
  }
}

function renderMissionCards(): void {
  const grid = element("missionGrid");
  grid.replaceChildren();

  const progress = useGameStore.getState().missionProgress;

  MISSION_DEFINITIONS.forEach((mission, index) => {
    const status = progress[mission.id]?.status ?? "locked";
    const art = missionArt[mission.id] ?? { icon: "🚀", coverClass: "orbit" };

    const card = document.createElement("article");
    card.className = `mission-option${index === 0 ? " featured" : ""}`;

    const cover = document.createElement("div");
    cover.className = `mission-cover ${art.coverClass}`;
    cover.textContent = art.icon;

    const content = document.createElement("div");
    content.className = "mission-option-content";

    const difficulty = document.createElement("span");
    difficulty.textContent = mission.difficulty.toUpperCase();

    const title = document.createElement("h3");
    title.textContent = mission.title;

    const description = document.createElement("p");
    description.textContent = mission.briefing;

    const statusText = document.createElement("span");
    statusText.className = `mission-status status-${status}`;
    statusText.textContent = missionStatusLabel(status);

    const meta = document.createElement("div");
    meta.className = "mission-meta";

    const objectiveCount = document.createElement("span");
    objectiveCount.textContent = `🎯 ${mission.objectives.length} objectives`;

    const outcomeCount = document.createElement("span");
    outcomeCount.textContent = `📚 ${mission.learningOutcomes.length} learning outcomes`;

    meta.append(objectiveCount, outcomeCount);

    const button = document.createElement("button");
    button.type = "button";
    button.className =
      status === "available" || status === "failed" || status === "in_progress"
        ? "primary-button"
        : "secondary-button";
    button.textContent = missionButtonLabel(status);
    button.disabled = status === "locked" || status === "completed";
    button.addEventListener("click", () => launchMission(mission.id));

    content.append(difficulty, title, description, statusText, meta, button);
    card.append(cover, content);
    grid.appendChild(card);
  });
}

function showFeedback(message: string): void {
  element("missionFeedback").textContent = message;
}

function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function renderMissionObjectives(
  definition: MissionDefinition,
  resources: MissionResources,
  completedIds: string[],
): void {
  const container = element("missionObjectives");
  container.replaceChildren();

  const heading = document.createElement("h4");
  heading.textContent = "Mission objectives";
  container.appendChild(heading);

  const list = document.createElement("ul");
  list.className = "mission-objective-list";

  definition.objectives.forEach((objective) => {
    const item = document.createElement("li");
    const completed = completedIds.includes(objective.id);
    item.className = completed ? "objective-completed" : "objective-pending";
    item.textContent = `${completed ? "✓" : "○"} ${objective.title}`;
    item.title = objective.description;
    list.appendChild(item);
  });

  container.appendChild(list);

  element("missionResources").textContent =
    `Energy ${resources.energy}%  ·  Oxygen ${resources.oxygen}%  ·  ` +
    `Time ${formatTime(resources.time)}  ·  Repair kits ${resources.repairKits}  ·  ` +
    `Science kits ${resources.scienceKits}`;
}

function actionDisabledReason(
  action: MissionAction,
  resources: MissionResources,
  completedIds: string[],
): string | null {
  const missingObjective = (action.requiresObjectives ?? []).find(
    (id) => !completedIds.includes(id),
  );

  if (missingObjective) return "Complete the prerequisite objective first.";

  const insufficient = Object.entries(action.costs ?? {}).find(([key, cost]) => {
    const resourceKey = key as keyof MissionResources;
    return resources[resourceKey] < (cost ?? 0);
  });

  if (insufficient) return `Not enough ${insufficient[0]}.`;
  return null;
}

function renderMissionActions(): void {
  const container = element("missionActions");
  container.replaceChildren();

  if (!activeEngine) return;

  const state = activeEngine.getState();

  if (state.status === "completed") {
    container.textContent = "All required objectives completed.";
    return;
  }

  if (state.status === "failed") {
    container.textContent = "This attempt has ended. Return to the Mission Center to retry.";
    return;
  }

  const availableActions = activeEngine.getAvailableActions();

  availableActions.forEach((action, index) => {
    const button = document.createElement("button");
    button.type = "button";

    const reason = actionDisabledReason(
      action,
      state.resources,
      state.completedObjectiveIds,
    );

    button.disabled = Boolean(reason);
    button.title = reason ?? action.description;

    const number = document.createElement("strong");
    number.textContent = String(index + 1);

    const details = document.createElement("div");
    const label = document.createElement("b");
    label.textContent = action.label;

    const description = document.createElement("span");
    description.textContent = reason ?? action.description;

    details.append(label, description);
    button.append(number, details);
    button.addEventListener("click", () => performMissionAction(action.id));

    container.appendChild(button);
  });

  if (availableActions.length === 0) {
    container.textContent = "No further actions are available.";
  }
}

function renderActiveMission(): void {
  if (!activeEngine) return;

  const definition = activeEngine.getDefinition();
  const state = activeEngine.getState();

  element("activeMissionTitle").textContent = definition.title;
  element("missionPrompt").textContent = "Mission objectives";
  element("missionDescription").textContent = definition.briefing;

  renderMissionObjectives(
    definition,
    state.resources,
    state.completedObjectiveIds,
  );
  renderMissionActions();
}

function launchMission(missionId: string): void {
  try {
    synchronizeMissionUnlocks();

    const progress = useGameStore.getState().missionProgress[missionId];

    if (!progress || progress.status === "locked") {
      showFeedback("Complete the previous mission to unlock this one.");
      return;
    }

    if (progress.status === "completed") {
      showFeedback("You have already completed this mission.");
      return;
    }

    if (activeEngine?.getState().status === "active") {
      if (activeEngine.getState().missionId === missionId) {
        window.showPage("mission-control");
        return;
      }

      showFeedback("Finish your current mission before starting another one.");
      window.showPage("mission-control");
      return;
    }

    if (progress.status === "in_progress") {
      // Detailed engine runtime state is not persisted yet. A refreshed
      // in-progress mission therefore starts a fresh attempt.
      activeEngine = restartMissionSession(missionId);
    } else {
      activeEngine = startMissionSession(missionId);
    }

    renderActiveMission();
    showFeedback("Mission started. Follow the objectives to proceed.");
    window.showPage("mission-control");
    renderMissionCards();
  } catch (error) {
    console.error("Could not start mission:", error);
    showFeedback(
      error instanceof Error ? error.message : "Could not start the mission.",
    );
  }
}

function performMissionAction(actionId: string): void {
  if (!activeEngine) return;

  try {
    const result = activeEngine.performAction(actionId);

    if (!result.accepted) {
      showFeedback(result.message);
      renderActiveMission();
      return;
    }

    if (result.state.status === "completed") {
      const score = completeMissionSession(activeEngine);
      synchronizeMissionUnlocks();
      showFeedback(
        `${result.message} ${result.feedback ?? ""} Final score: ${score.totalScore}.`,
      );
      renderMissionCards();
    } else if (result.state.status === "failed") {
      failMissionSession(activeEngine);
      showFeedback(`${result.message} ${result.feedback ?? ""}`);
      renderMissionCards();
    } else {
      showFeedback(`${result.message} ${result.feedback ?? ""}`);
    }

    renderActiveMission();
  } catch (error) {
    console.error("Mission action failed:", error);
    showFeedback(
      error instanceof Error ? error.message : "Something went wrong.",
    );
  }
}

function startNextAvailableMission(): void {
  synchronizeMissionUnlocks();
  renderMissionCards();

  const progress = useGameStore.getState().missionProgress;
  const nextMission = MISSION_DEFINITIONS.find((mission) => {
    const status = progress[mission.id]?.status;
    return status === "available" || status === "in_progress" || status === "failed";
  });

  if (!nextMission) {
    showFeedback("You have completed all five missions. Excellent work!");
    window.showPage("missions");
    return;
  }

  launchMission(nextMission.id);
}

window.startMission = startNextAvailableMission;

synchronizeMissionUnlocks();
renderMissionCards();

console.log("Nova Drift: all five mission definitions loaded.");

import { MISSION_DEFINITIONS } from "../missions/missionDefinitions";
import type { MissionAction, MissionDefinition, MissionResources } from "../missions/missionTypes";
import {
  startMissionSession,
  restartMissionSession,
  completeMissionSession,
  failMissionSession,
} from "../integration/missionSession";
import { useGameStore } from "../store/gameStore";
import { LAB_EXPERIMENTS, getLabResearchPoints, runLabExperiment } from "../lab";
import type { LabExperimentId } from "../lab/labTypes";
import { addScienceLogEntry, getScienceLogEntries, recordMissionScience, deleteScienceLogEntry, updateScienceLogEntry } from "../scienceLog";

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
  "solar-storm": { icon: "☀️", coverClass: "mars" },
  "outpost-emergency": { icon: "🚨", coverClass: "orbit" },
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
      recordMissionScience(activeEngine.getDefinition().title, activeEngine.getDefinition().learningOutcomes);
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
    showFeedback("You have completed all six core missions. Excellent work!");
    window.showPage("missions");
    return;
  }

  launchMission(nextMission.id);
}

window.startMission = startNextAvailableMission;

synchronizeMissionUnlocks();
renderMissionCards();

console.log("Nova Drift: all six core mission definitions loaded.");

let activeLabStation: LabExperimentId | null = null;

function labElement<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function labAction(label: string, onClick: () => void, primary = false): HTMLButtonElement {
  const button = labElement("button", primary ? "primary-button lab-action" : "secondary-button lab-action", label);
  button.type = "button";
  button.addEventListener("click", onClick);
  return button;
}

function recordLabOutcome(
  experimentId: LabExperimentId,
  optionId: string,
  detail: string,
): void {
  const result = runLabExperiment(experimentId, optionId);
  addScienceLogEntry({
    category: "experiment",
    title: result.experimentTitle,
    content: `${detail}\n\n${result.explanation}`,
    concept: result.concept,
    evidenceType: "DERIVED MODEL",
  });
  element("labResearchPoints").textContent = `Research points earned: ${getLabResearchPoints()}`;
  element("labFeedback").textContent = `${result.correct ? "VALID RESULT" : "RUN RECORDED"} · +${result.researchPoints} research points · ${result.explanation}`;
  renderScienceLog();
}

function selectLabStation(id: LabExperimentId): void {
  activeLabStation = id;
  renderLab();
  const workbench = document.getElementById("labActiveWorkbench");
  workbench?.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderLab(): void {
  const container = element("labExperiments");
  container.replaceChildren();
  element("labResearchPoints").textContent = `Research points earned: ${getLabResearchPoints()}`;

  // Make the illustrated physical equipment in the room act as station controls.
  const equipmentMap: Array<{ selector: string; id: LabExperimentId; label: string }> = [
    { selector: ".bench-center", id: "microgravity-drop", label: "Open microgravity drop rig" },
    { selector: ".bench-right", id: "greenhouse-tuning", label: "Open plant growth chamber" },
    { selector: ".bench-left", id: "spectral-sample", label: "Open optical spectroscopy bench" },
    { selector: ".lab-wall-cabinet", id: "greenhouse-tuning", label: "Open environmental control station" },
    { selector: ".lab-wall-rack", id: "spectral-sample", label: "Open instrument data rack" },
  ];
  equipmentMap.forEach(({ selector, id, label }) => {
    document.querySelectorAll<HTMLElement>(`.research-lab ${selector}`).forEach((equipment) => {
      equipment.classList.add("lab-equipment-interactive");
      equipment.setAttribute("role", "button");
      equipment.setAttribute("tabindex", "0");
      equipment.setAttribute("aria-label", label);
      if (equipment.dataset.labBound === "true") return;
      equipment.dataset.labBound = "true";
      equipment.addEventListener("click", () => selectLabStation(id));
      equipment.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectLabStation(id);
        }
      });
    });
  });

  LAB_EXPERIMENTS.forEach((experiment) => {
    const card = labElement("article", `training-card lab-station-card lab-station-${experiment.id}${activeLabStation === experiment.id ? " is-selected" : ""}`);
    const scene = labElement("div", `lab-station-scene scene-${experiment.id}`);
    scene.setAttribute("aria-hidden", "true");
    const sceneFrame = labElement("div", "station-apparatus");
    const sceneScreen = labElement("div", "station-screen", experiment.id === "microgravity-drop" ? "MOTION TRACKING / LIVE" : experiment.id === "greenhouse-tuning" ? "GROWTH ENVIRONMENT / LIVE" : "SPECTRAL ANALYSIS / LIVE");
    const sceneEquipment = labElement("div", "station-equipment");
    sceneEquipment.innerHTML = experiment.id === "microgravity-drop"
      ? '<span class="drop-column"></span><span class="drop-camera"></span><span class="drop-capsule"></span>'
      : experiment.id === "greenhouse-tuning"
        ? '<span class="plant-vessel"><i></i><i></i><i></i></span><span class="grow-light"></span>'
        : '<span class="spectrometer-body"></span><span class="spectrometer-sample"></span><span class="spectrometer-beam"></span>';
    sceneFrame.append(sceneScreen, sceneEquipment);
    scene.appendChild(sceneFrame);
    const station = labElement("span", "lab-station-kicker", experiment.station);
    const title = labElement("h3", undefined, experiment.title);
    const objective = labElement("p", undefined, experiment.objective);
    const launch = labAction(activeLabStation === experiment.id ? "WORKSTATION OPEN ✓" : "OPEN WORKSTATION →", () => selectLabStation(experiment.id), activeLabStation !== experiment.id);
    card.append(scene, station, title, objective, launch);
    container.appendChild(card);
  });

  if (!activeLabStation) {
    const prompt = labElement("div", "lab-workbench-prompt");
    prompt.append(
      labElement("span", "lab-eyebrow", "WORKSTATION CONTROL"),
      labElement("h3", undefined, "Select an instrument to begin"),
      labElement("p", undefined, "Click one of the physical benches in the room above, or open a workstation card. Each station has hands-on controls, a procedure, and a results panel.")
    );
    container.appendChild(prompt);
    return;
  }

  const experiment = LAB_EXPERIMENTS.find((item) => item.id === activeLabStation);
  if (!experiment) return;
  const workbench = labElement("section", "lab-active-workbench");
  workbench.id = "labActiveWorkbench";
  const top = labElement("div", "lab-workbench-topline");
  const heading = labElement("div");
  heading.append(labElement("span", "lab-eyebrow", "ACTIVE PROCEDURE · NRL-04"), labElement("h3", undefined, experiment.title), labElement("p", undefined, experiment.objective));
  top.append(heading, labAction("CLOSE ×", () => { activeLabStation = null; renderLab(); }));
  workbench.appendChild(top);

  const procedure = labElement("div", "lab-procedure-strip");
  ["CONFIGURE", "RUN TEST", "REVIEW DATA"].forEach((step, index) => {
    const item = labElement("div", "lab-procedure-step");
    item.append(labElement("b", undefined, `0${index + 1}`), labElement("span", undefined, step));
    procedure.appendChild(item);
  });
  workbench.appendChild(procedure);

  const controls = labElement("div", "lab-instrument-controls");
  const output = labElement("div", "lab-instrument-output");
  output.setAttribute("aria-live", "polite");

  if (activeLabStation === "microgravity-drop") {
    controls.append(labElement("h4", undefined, "DROP RIG CONFIGURATION"), labElement("p", "lab-control-help", "Set the test masses, secure both release capsules, then run the synchronized release."));
    const massA = labElement("input") as HTMLInputElement;
    massA.type = "range"; massA.min = "50"; massA.max = "500"; massA.step = "50"; massA.value = "100";
    const massB = labElement("input") as HTMLInputElement;
    massB.type = "range"; massB.min = "50"; massB.max = "500"; massB.step = "50"; massB.value = "400";
    const massALabel = labElement("label", "lab-range-control", "TEST MASS A · 100 g");
    const massBLabel = labElement("label", "lab-range-control", "TEST MASS B · 400 g");
    massALabel.appendChild(massA); massBLabel.appendChild(massB);
    massA.addEventListener("input", () => { massALabel.firstChild!.textContent = `TEST MASS A · ${massA.value} g`; });
    massB.addEventListener("input", () => { massBLabel.firstChild!.textContent = `TEST MASS B · ${massB.value} g`; });
    controls.append(massALabel, massBLabel, labAction("ARM & RELEASE BOTH CAPSULES", () => {
      const a = Number(massA.value); const b = Number(massB.value);
      output.replaceChildren();
      output.append(labElement("span", "lab-output-kicker", "LIVE TEST · SYNCHRONIZED RELEASE"), labElement("h4", undefined, "Watch both masses fall together"));
      const animation = labElement("div", "drop-simulation is-running");
      animation.setAttribute("role", "img");
      animation.setAttribute("aria-label", `Two objects of ${a} and ${b} grams are released together and fall side by side at the same rate in the simulated drop rig.`);
      const scale = labElement("div", "drop-scale");
      for (let i = 0; i < 5; i++) scale.appendChild(labElement("i"));
      const laneA = labElement("div", "drop-lane drop-lane-a");
      const laneB = labElement("div", "drop-lane drop-lane-b");
      laneA.append(labElement("span", "drop-object drop-object-a", "A"), labElement("small", "drop-object-label", `${a} g`));
      laneB.append(labElement("span", "drop-object drop-object-b", "B"), labElement("small", "drop-object-label", `${b} g`));
      const cabin = labElement("div", "drop-cabin-line", "CABIN REFERENCE");
      animation.append(scale, laneA, laneB, cabin);
      const replay = labAction("↻ REPLAY DROP", () => {
        animation.classList.remove("is-running");
        void animation.offsetWidth;
        animation.classList.add("is-running");
      });
      const readings = labElement("div", "lab-reading-grid");
      [["MASS A", `${a} g`], ["MASS B", `${b} g`], ["GRAVITY AT ORBIT", "≈ 8.7 m/s²*"], ["RELATIVE ACCELERATION", "≈ 0 m/s²"]].forEach(([label, value]) => readings.appendChild(labElement("div", "lab-reading", `${label} · ${value}`)));
      output.append(animation, replay, readings, labElement("p", undefined, "The two objects move together in this shared free-fall frame. Their masses differ, but their gravitational acceleration is the same. The cabin and objects are all falling around Earth; gravity has not switched off."), labElement("small", "lab-footnote", "*Illustrative low-Earth-orbit value; actual local gravity depends on altitude."));
      recordLabOutcome("microgravity-drop", "shared-fall", `Recorded release test: mass A ${a} g; mass B ${b} g. The model predicts approximately zero relative acceleration between the freely falling objects and cabin.`);
    }, true));
  } else if (activeLabStation === "greenhouse-tuning") {
    controls.append(labElement("h4", undefined, "PLANT GROWTH CHAMBER"), labElement("p", "lab-control-help", "Choose one variable to investigate. The other conditions remain fixed so the result can be attributed to a single change."));
    const variable = labElement("select", "lab-select") as HTMLSelectElement;
    [["light", "Light intensity"], ["water", "Water availability"], ["temperature", "Temperature"]].forEach(([value, label]) => { const option = labElement("option", undefined, label) as HTMLOptionElement; option.value = value; variable.appendChild(option); });
    const variableLabel = labElement("label", "lab-range-control", "TEST VARIABLE · LIGHT INTENSITY");
    const range = labElement("input") as HTMLInputElement;
    range.type = "range"; range.min = "0"; range.max = "100"; range.value = "70";
    variableLabel.appendChild(range);
    const valueReadout = labElement("output", "lab-range-value", "70%");
    const units: Record<string, string> = { light: "%", water: "%", temperature: "°C" };
    const preview = labElement("div", "greenhouse-live-preview");
    const previewHeader = labElement("div", "greenhouse-preview-header");
    previewHeader.append(labElement("b", undefined, "LIVE PLANT RESPONSE"), labElement("span", "plant-health-label", "GROWING"));
    const growLamp = labElement("div", "plant-preview-lamp");
    const plant = labElement("div", "plant-preview");
    const stem = labElement("i", "plant-preview-stem");
    const leaves = labElement("div", "plant-preview-leaves");
    for (let i = 0; i < 6; i++) leaves.appendChild(labElement("i", `plant-leaf plant-leaf-${i + 1}`));
    plant.append(stem, leaves);
    const pot = labElement("div", "plant-preview-pot");
    const soil = labElement("div", "plant-preview-soil");
    const meter = labElement("div", "plant-response-meter");
    const meterFill = labElement("i");
    meter.appendChild(meterFill);
    const previewCaption = labElement("p", "plant-preview-caption", "Adjust a factor to see the plant respond before running the growth cycle.");
    preview.append(previewHeader, growLamp, plant, pot, soil, meter, previewCaption);
    const updatePreview = () => {
      const chosen = Number(range.value); const key = variable.value;
      const light = key === "light" ? chosen : 70;
      const water = key === "water" ? chosen : 65;
      const temp = key === "temperature" ? chosen : 22;
      const tempPenalty = Math.max(0, Math.abs(temp - 22) - 4) * 2.5;
      const growthIndex = Math.max(0, Math.round(Math.min(light, water) * 0.65 + Math.max(0, 100 - tempPenalty) * 0.35));
      const stress = water < 25 || temp < 15 || temp > 30 || light < 15;
      plant.style.setProperty("--plant-height", `${Math.max(18, 28 + growthIndex * 0.62)}px`);
      plant.style.setProperty("--leaf-scale", `${0.45 + growthIndex / 180}`);
      plant.style.setProperty("--leaf-hue", `${Math.round(78 + growthIndex * 0.22)}`);
      plant.style.setProperty("--leaf-light", `${Math.round(22 + growthIndex * 0.19)}%`);
      growLamp.style.setProperty("--lamp-brightness", `${0.12 + light / 115}`);
      preview.style.setProperty("--plant-health", `${growthIndex}%`);
      meterFill.style.width = `${growthIndex}%`;
      previewHeader.querySelector(".plant-health-label")!.textContent = stress ? "UNDER STRESS" : growthIndex > 72 ? "THRIVING" : growthIndex > 42 ? "GROWING" : "SLOW GROWTH";
      previewCaption.textContent = stress ? "Visible stress response: growth slows and the leaves lose their healthy colour." : `Modelled growth response: ${growthIndex}/100 · light ${light}% · water ${water}% · ${temp}°C.`;
      plant.classList.toggle("is-stressed", stress);
      valueReadout.textContent = `${range.value}${units[key]}`;
    };
    const updateControl = () => {
      const isTemp = variable.value === "temperature";
      range.min = isTemp ? "10" : "0"; range.max = isTemp ? "35" : "100";
      range.value = isTemp ? "22" : "70";
      variableLabel.firstChild!.textContent = `TEST VARIABLE · ${variable.value.toUpperCase()}`;
      updatePreview();
    };
    variable.addEventListener("change", updateControl);
    range.addEventListener("input", updatePreview);
    updatePreview();
    controls.append(variable, variableLabel, valueReadout, preview, labAction("RUN 6-HOUR GROWTH CYCLE", () => {
      const chosen = Number(range.value); const key = variable.value;
      const light = key === "light" ? chosen : 70;
      const water = key === "water" ? chosen : 65;
      const temp = key === "temperature" ? chosen : 22;
      const tempPenalty = Math.max(0, Math.abs(temp - 22) - 4) * 2.5;
      const growthIndex = Math.max(0, Math.round(Math.min(light, water) * 0.65 + Math.max(0, 100 - tempPenalty) * 0.35));
      output.replaceChildren(labElement("span", "lab-output-kicker", "GROWTH CYCLE COMPLETE · 6 HOUR MODEL"), labElement("h4", undefined, `Plant response index: ${growthIndex}/100`));
      const resultPlant = labElement("div", "greenhouse-result-plant");
      resultPlant.style.setProperty("--result-growth", `${Math.max(18, 25 + growthIndex * 0.72)}px`);
      resultPlant.style.setProperty("--result-hue", `${Math.round(78 + growthIndex * 0.22)}`);
      resultPlant.classList.add("growth-cycle-running");
      output.appendChild(resultPlant);
      const readings = labElement("div", "lab-reading-grid");
      [["LIGHT", `${light}%`], ["WATER", `${water}%`], ["CHAMBER TEMP", `${temp}°C`], ["CONTROLLED FACTORS", "2 held steady"]].forEach(([label, value]) => readings.appendChild(labElement("div", "lab-reading", `${label} · ${value}`)));
      output.append(readings, labElement("p", undefined, `You changed ${key} while holding the other conditions steady. This is a controlled comparison: repeat the run with a different ${key} setting and compare the plant response. The index is an educational model, not a biological growth prediction.`));
      recordLabOutcome("greenhouse-tuning", "control-others", `Growth chamber run: ${key} set to ${chosen}${units[key]}; light ${light}%, water ${water}%, temperature ${temp}°C; model response index ${growthIndex}/100.`);
    }, true));
  } else {
    controls.append(labElement("h4", undefined, "OPTICAL SPECTROMETER"), labElement("p", "lab-control-help", "The instrument has scanned an unknown gas sample. Compare its absorption features with the reference library and identify the best match."));
    const spectrum = labElement("div", "lab-spectrum");
    const peakData = [{ x: "2.7", h: 35 }, { x: "4.3", h: 78 }, { x: "6.3", h: 24 }, { x: "15.0", h: 95 }, { x: "16.5", h: 18 }];
    peakData.forEach((peak) => { const bar = labElement("div", "lab-spectrum-peak"); bar.style.height = `${peak.h}%`; bar.appendChild(labElement("span", undefined, peak.x)); spectrum.appendChild(bar); });
    const guessLabel = labElement("label", "lab-range-control", "UNKNOWN SAMPLE IDENTIFICATION");
    const guess = labElement("select", "lab-select") as HTMLSelectElement;
    [["water", "Water vapour (H₂O)"], ["carbon-dioxide", "Carbon dioxide (CO₂)"], ["methane", "Methane (CH₄)"]].forEach(([value, label]) => { const option = labElement("option", undefined, label) as HTMLOptionElement; option.value = value; guess.appendChild(option); });
    guessLabel.appendChild(guess);
    controls.append(spectrum, guessLabel, labAction("COMPARE WITH REFERENCE LIBRARY", () => {
      spectrum.classList.remove("is-scanning");
      void spectrum.offsetWidth;
      spectrum.classList.add("is-scanning");
      const correct = guess.value === "carbon-dioxide";
      output.replaceChildren(labElement("span", "lab-output-kicker", "SPECTRAL MATCH REPORT"), labElement("h4", undefined, correct ? "Reference match: carbon dioxide" : "No reliable match — review the spectrum"));
      output.append(labElement("p", undefined, correct ? "The strongest diagnostic features in this simplified infrared trace align with the CO₂ reference pattern, including the prominent band near 15 μm." : "The selected reference does not explain the strongest absorption features. Compare the peak positions, not just the apparent signal strength, and try another reference."));
      recordLabOutcome("spectral-sample", correct ? "compare-spectrum" : guess.value === "water" ? "guess-color" : "ignore-calibration", `Spectral identification attempt: ${guess.options[guess.selectedIndex].text}. Reference comparison ${correct ? "matched" : "did not match"} the simulated CO₂ spectrum.`);
    }, true));
  }

  workbench.append(controls, output);
  container.appendChild(workbench);
}

function renderScienceLog(): void {
  const container = element("scienceLogEntries");
  container.replaceChildren();
  const entries = getScienceLogEntries();
  if (!entries.length) {
    const empty = document.createElement("p");
    empty.textContent = "Your research record is empty. Complete a mission or run a lab experiment to add your first discovery.";
    container.appendChild(empty);
    return;
  }
  entries.forEach((entry) => {
    const card = document.createElement("article");
    card.className = "training-card";
    const category = document.createElement("span");
    category.textContent = `${entry.category.toUpperCase()}${entry.evidenceType ? ` · ${entry.evidenceType}` : ""}`;
    const title = document.createElement("h3");
    title.textContent = entry.title;
    const content = document.createElement("p");
    content.textContent = entry.content;
    const source = document.createElement("small");
    source.textContent = entry.source ? `Source: ${entry.source}` : "";
    const date = document.createElement("small");
    date.textContent = new Date(entry.createdAt).toLocaleString();
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "secondary-button";
    edit.textContent = "Edit note";
    edit.addEventListener("click", () => {
      const nextTitle = window.prompt("Edit note title", entry.title);
      if (nextTitle === null) return;
      const nextContent = window.prompt("Edit observation or conclusion", entry.content);
      if (nextContent === null) return;
      try { updateScienceLogEntry(entry.id, { title: nextTitle, content: nextContent, evidenceType: entry.evidenceType }); renderScienceLog(); }
      catch (error) { window.alert(error instanceof Error ? error.message : "Could not update note."); }
    });
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "secondary-button";
    remove.textContent = "Delete note";
    remove.addEventListener("click", () => { deleteScienceLogEntry(entry.id); renderScienceLog(); });
    card.append(category, title, content, source, date, edit, remove);
    container.appendChild(card);
  });
}

const scienceNoteForm = document.getElementById("scienceNoteForm");
scienceNoteForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleInput = element("scienceNoteTitle") as HTMLInputElement;
  const contentInput = element("scienceNoteContent") as HTMLTextAreaElement;
  const evidenceInput = element("scienceNoteEvidence") as HTMLSelectElement;
  const sourceInput = element("scienceNoteSource") as HTMLInputElement;
  if (!titleInput.value.trim() || !contentInput.value.trim()) return;
  addScienceLogEntry({ category: "observation", title: titleInput.value.trim(), content: contentInput.value.trim(), source: sourceInput.value.trim() || undefined, evidenceType: evidenceInput.value as "DIRECT DATA" | "SOURCED FACT" | "DERIVED MODEL" | "GAMEPLAY ASSUMPTION" });
  titleInput.value = "";
  contentInput.value = "";
  sourceInput.value = "";
  renderScienceLog();
});

renderLab();
renderScienceLog();

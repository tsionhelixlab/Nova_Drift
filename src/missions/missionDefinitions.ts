import type { MissionDefinition } from "./missionTypes";

/**
 * Mission scenarios and their action rules.
 * Resource quantities are simplified gameplay units, not real NASA telemetry.
 */
export const MISSION_DEFINITIONS: readonly MissionDefinition[] = [
  {
    id: "orientation",
    title: "Spacecraft Orientation",
    briefing:
      "Welcome aboard. Identify essential spacecraft systems and complete the pre-flight safety check.",
    difficulty: "beginner",
    learningOutcomes: [
      "Identify major spacecraft systems",
      "Understand why checklists reduce operational mistakes",
    ],
    initialResources: { energy: 100, oxygen: 100, time: 240, repairKits: 1, scienceKits: 1 },
    objectives: [
      { id: "identify-controls", title: "Identify controls", description: "Inspect the flight-control console.", required: true },
      { id: "check-life-support", title: "Check life support", description: "Verify the life-support status.", required: true },
      { id: "complete-checklist", title: "Complete checklist", description: "Confirm the pre-flight checklist.", required: true },
    ],
    actions: [
      {
        id: "inspect-console", label: "Inspect flight console", description: "Review the main controls.",
        costs: { time: 20 }, completesObjectiveId: "identify-controls",
        feedback: "Flight consoles organize information so crew members can monitor and control spacecraft systems.",
      },
      {
        id: "check-life-support", label: "Check life support", description: "Review oxygen and cabin-support indicators.",
        costs: { time: 15 }, completesObjectiveId: "check-life-support",
        feedback: "Life-support systems help maintain a habitable environment. The displayed values here are simulated.",
      },
      {
        id: "confirm-checklist", label: "Confirm checklist", description: "Finish the pre-flight safety checklist.",
        requiresObjectives: ["identify-controls", "check-life-support"],
        costs: { time: 10 }, completesObjectiveId: "complete-checklist",
        feedback: "Checklists help crews perform important steps consistently.",
      },
    ],
    successMessage: "Orientation complete. You are familiar with the basic spacecraft systems.",
    failureMessage: "Orientation timed out. Review the checklist and try again.",
  },
  {
    id: "solar-repair",
    title: "Solar Panel Diagnosis and Repair",
    briefing:
      "A solar-array output warning has appeared. Diagnose the simulated fault and restore the panel.",
    difficulty: "beginner",
    learningOutcomes: [
      "Explain how solar arrays convert sunlight into electrical energy",
      "Use diagnosis before attempting a repair",
    ],
    initialResources: { energy: 100, oxygen: 100, time: 300, repairKits: 1, scienceKits: 0 },
    objectives: [
      { id: "inspect-array", title: "Inspect solar array", description: "Visually inspect the array status.", required: true },
      { id: "run-diagnostics", title: "Run diagnostics", description: "Identify the simulated fault.", required: true },
      { id: "repair-array", title: "Repair array", description: "Use a repair kit to restore the array.", required: true },
      { id: "verify-output", title: "Verify output", description: "Confirm that output has returned to normal.", required: true },
    ],
    actions: [
      {
        id: "inspect-array", label: "Inspect array", description: "Inspect the solar-array indicator.",
        costs: { time: 20 }, completesObjectiveId: "inspect-array",
        feedback: "Solar arrays convert sunlight into electrical energy using photovoltaic cells.",
      },
      {
        id: "run-diagnostics", label: "Run diagnostics", description: "Use the diagnostic scanner.",
        requiresObjectives: ["inspect-array"], costs: { energy: 5, time: 25 },
        completesObjectiveId: "run-diagnostics",
        feedback: "Diagnostics help identify a fault before a repair is attempted.",
      },
      {
        id: "repair-array", label: "Repair array", description: "Apply the repair kit to the diagnosed fault.",
        requiresObjectives: ["run-diagnostics"], costs: { energy: 15, time: 45, repairKits: 1 },
        completesObjectiveId: "repair-array",
        feedback: "The repair is successful in this training scenario. Real spacecraft repairs require mission-specific procedures.",
      },
      {
        id: "verify-output", label: "Verify output", description: "Check the array's simulated power output.",
        requiresObjectives: ["repair-array"], costs: { time: 15 },
        completesObjectiveId: "verify-output",
        feedback: "Verification confirms whether the repair achieved its intended result.",
      },
    ],
    successMessage: "Solar-array repair verified. Electrical generation is restored in the simulation.",
    failureMessage: "The repair mission could not be completed within the available resources or time.",
  },
  {
    id: "leak-response",
    title: "Emergency Leak Response",
    briefing:
      "A cabin-pressure warning has triggered. Follow the training procedure, assess the compartment, and isolate the simulated leak.",
    difficulty: "intermediate",
    learningOutcomes: [
      "Recognize why cabin pressure is monitored",
      "Prioritize crew safety and clear communication during an emergency",
    ],
    initialResources: { energy: 100, oxygen: 100, time: 240, repairKits: 1, scienceKits: 0 },
    objectives: [
      { id: "acknowledge-alarm", title: "Acknowledge alarm", description: "Confirm the warning.", required: true },
      { id: "notify-control", title: "Notify Mission Control", description: "Send the simulated status report.", required: true },
      { id: "locate-leak", title: "Locate affected compartment", description: "Use the pressure monitor to identify the compartment.", required: true },
      { id: "isolate-compartment", title: "Isolate compartment", description: "Close the compartment hatch in the simulation.", required: true },
      { id: "seal-leak", title: "Seal simulated leak", description: "Use the repair kit after isolation.", required: true },
    ],
    actions: [
      {
        id: "acknowledge-alarm", label: "Acknowledge alarm", description: "Confirm that the warning has been received.",
        costs: { time: 5 }, completesObjectiveId: "acknowledge-alarm",
        feedback: "Acknowledging an alarm helps the crew coordinate their response.",
      },
      {
        id: "notify-control", label: "Contact Mission Control", description: "Report the warning and current status.",
        requiresObjectives: ["acknowledge-alarm"], costs: { time: 15 },
        completesObjectiveId: "notify-control",
        feedback: "Clear communication helps the crew and ground teams maintain shared situational awareness.",
      },
      {
        id: "locate-leak", label: "Check pressure monitors", description: "Review compartment pressure readings.",
        requiresObjectives: ["acknowledge-alarm"], costs: { energy: 5, time: 20 },
        completesObjectiveId: "locate-leak",
        feedback: "Pressure monitoring can help identify which compartment needs attention. Values are simulated.",
      },
      {
        id: "isolate-compartment", label: "Isolate compartment", description: "Close the affected compartment hatch in this training scenario.",
        requiresObjectives: ["locate-leak", "notify-control"], costs: { time: 20 },
        completesObjectiveId: "isolate-compartment",
        feedback: "The simulation isolates the affected compartment. Real emergency procedures depend on the spacecraft and mission.",
      },
      {
        id: "seal-leak", label: "Apply repair kit", description: "Seal the simulated leak after the compartment is isolated.",
        requiresObjectives: ["isolate-compartment"], costs: { energy: 10, time: 35, repairKits: 1 },
        completesObjectiveId: "seal-leak",
        feedback: "The simulated leak is sealed. Always follow approved spacecraft procedures in real operations.",
      },
    ],
    successMessage: "Emergency response complete. The simulated compartment is secure.",
    failureMessage: "The emergency response was not completed before the training limits were reached.",
  },
  {
    id: "microgravity-lab",
    title: "Microgravity Laboratory",
    briefing:
      "Conduct a simple observation activity and compare how objects behave in the simulated microgravity environment.",
    difficulty: "intermediate",
    learningOutcomes: [
      "Describe microgravity as apparent weightlessness during free fall",
      "Distinguish observation from explanation",
    ],
    initialResources: { energy: 100, oxygen: 100, time: 300, repairKits: 0, scienceKits: 1 },
    objectives: [
      { id: "prepare-lab", title: "Prepare experiment", description: "Check the experiment equipment.", required: true },
      { id: "predict-result", title: "Make a prediction", description: "Record a prediction before the experiment.", required: true },
      { id: "run-experiment", title: "Run experiment", description: "Perform the simulated observation.", required: true },
      { id: "interpret-result", title: "Interpret observations", description: "Choose an explanation supported by the observation.", required: true },
    ],
    actions: [
      {
        id: "prepare-lab", label: "Prepare laboratory", description: "Check the experiment kit.",
        costs: { time: 20 }, completesObjectiveId: "prepare-lab",
        feedback: "Preparing equipment helps make an experiment more consistent.",
      },
      {
        id: "predict-result", label: "Record prediction", description: "State what you expect to observe.",
        requiresObjectives: ["prepare-lab"], costs: { time: 15 },
        completesObjectiveId: "predict-result",
        feedback: "A prediction makes it possible to compare expectations with observations.",
      },
      {
        id: "run-experiment", label: "Run experiment", description: "Use the science kit to conduct the activity.",
        requiresObjectives: ["predict-result"], costs: { energy: 5, time: 40, scienceKits: 1 },
        completesObjectiveId: "run-experiment",
        feedback: "Microgravity is not the absence of gravity; it describes conditions of apparent weightlessness during free fall.",
      },
      {
        id: "interpret-result", label: "Interpret observations", description: "Explain the observed behavior.",
        requiresObjectives: ["run-experiment"], costs: { time: 20 },
        completesObjectiveId: "interpret-result",
        feedback: "Good scientific explanations connect observations to evidence and acknowledge the limits of an experiment.",
      },
    ],
    successMessage: "Experiment complete. Your observations have been recorded.",
    failureMessage: "The experiment could not be completed within the available training resources.",
  },
  {
    id: "space-agriculture",
    title: "Space Agriculture",
    briefing:
      "Help the crew plan a small plant-growth experiment by selecting appropriate environmental conditions and monitoring observations.",
    difficulty: "intermediate",
    learningOutcomes: [
      "Identify basic factors that influence plant growth",
      "Understand why controlled experiments change one factor at a time",
    ],
    initialResources: { energy: 100, oxygen: 100, time: 360, repairKits: 0, scienceKits: 1 },
    objectives: [
      { id: "prepare-growth-kit", title: "Prepare growth kit", description: "Check the growth chamber and supplies.", required: true },
      { id: "select-light", title: "Set lighting", description: "Choose a suitable light schedule.", required: true },
      { id: "set-water", title: "Set water supply", description: "Provide an appropriate water amount.", required: true },
      { id: "monitor-growth", title: "Monitor growth", description: "Review the simulated growth observations.", required: true },
      { id: "record-findings", title: "Record findings", description: "Summarize what the observations suggest.", required: true },
    ],
    actions: [
      {
        id: "prepare-growth-kit", label: "Prepare growth chamber", description: "Inspect the chamber and experiment kit.",
        costs: { time: 20 }, completesObjectiveId: "prepare-growth-kit",
        feedback: "A controlled growth chamber helps researchers monitor environmental conditions.",
      },
      {
        id: "select-light", label: "Set lighting schedule", description: "Configure the simulated lighting plan.",
        requiresObjectives: ["prepare-growth-kit"], costs: { energy: 5, time: 15 },
        completesObjectiveId: "select-light",
        feedback: "Light provides energy for photosynthesis, although plant responses depend on many interacting factors.",
      },
      {
        id: "set-water", label: "Set water supply", description: "Configure the simulated water delivery.",
        requiresObjectives: ["prepare-growth-kit"], costs: { time: 15 },
        completesObjectiveId: "set-water",
        feedback: "Water is essential for plant processes. In microgravity, water movement and delivery need careful management.",
      },
      {
        id: "monitor-growth", label: "Monitor plant observations", description: "Review the simulated growth data.",
        requiresObjectives: ["select-light", "set-water"], costs: { energy: 5, time: 60 },
        completesObjectiveId: "monitor-growth",
        feedback: "Monitoring helps researchers compare plant responses with the conditions they controlled.",
      },
      {
        id: "record-findings", label: "Record findings", description: "Summarize the observations.",
        requiresObjectives: ["monitor-growth"], costs: { time: 20 },
        completesObjectiveId: "record-findings",
        feedback: "A useful report separates measured observations from interpretations and conclusions.",
      },
    ],
    successMessage: "Space-agriculture study complete. Your findings have been recorded.",
    failureMessage: "The plant-growth study could not be completed within the available training limits.",
  },
] as const;

const missionMap = new Map(MISSION_DEFINITIONS.map((mission) => [mission.id, mission]));

export function getMissionDefinition(missionId: string): MissionDefinition | undefined {
  return missionMap.get(missionId);
}

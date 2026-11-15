import type { MissionDefinition } from "./missionTypes";

/** Six core campaign missions. Resource values are simplified training units, not live spacecraft telemetry. */
export const MISSION_DEFINITIONS: readonly MissionDefinition[] = [
  {
    id: "orientation", title: "First Day at the Outpost",
    briefing: "Welcome to the lunar outpost. You have a short handover window before the next operations cycle. Inspect the habitat, compare changing readings, and complete a verified crew handover before time runs out.",
    difficulty: "beginner",
    learningOutcomes: ["Identify the main systems of a crewed outpost", "Explain why checklists and system monitoring matter"],
    initialResources: { energy: 82, oxygen: 92, time: 105, repairKits: 1, scienceKits: 1 },
    objectives: [
      { id: "inspect-habitat", title: "Inspect the habitat", description: "Review the habitat status board.", required: true },
      { id: "check-life-support", title: "Check life support", description: "Review oxygen and environmental indicators.", required: true },
      { id: "crew-handover", title: "Complete crew handover", description: "Confirm the checklist with Mission Control.", required: true },
    ],
    actions: [
      { id: "inspect-habitat", label: "Inspect habitat systems", description: "Open the habitat status board.", costs: { time: 25 }, completesObjectiveId: "inspect-habitat", feedback: "A system overview helps the crew notice abnormal readings before they become problems." },
      { id: "check-life-support", label: "Review life-support panel", description: "Check oxygen and cabin-support indicators.", costs: { time: 25, oxygen: 2 }, completesObjectiveId: "check-life-support", feedback: "Life-support systems help maintain a habitable environment. All values in this trainer are simulated." },
      { id: "crew-handover", label: "Confirm crew checklist", description: "Complete the handover after both inspections.", requiresObjectives: ["inspect-habitat", "check-life-support"], costs: { time: 30 }, completesObjectiveId: "crew-handover", feedback: "Structured handovers reduce missed information between shifts." },
    ],
    successMessage: "Outpost orientation complete. Welcome to the crew!", failureMessage: "The handover was not completed within the training time. Review the checklist and retry.",
  },
  {
    id: "solar-repair", title: "Keep the Lights On",
    briefing: "The outpost power level is falling and the reserve is limited. Use the measurements to distinguish a generation fault from a storage fault, preserve enough energy for the repair, and verify the recovered output.",
    difficulty: "intermediate",
    learningOutcomes: ["Explain how photovoltaic cells convert light into electricity", "Understand why diagnosis should precede repair"],
    initialResources: { energy: 48, oxygen: 90, time: 190, repairKits: 1, scienceKits: 0 },
    objectives: [
      { id: "inspect-array", title: "Inspect solar array", description: "Check the array status.", required: true },
      { id: "diagnose-array", title: "Diagnose the fault", description: "Use the diagnostic scanner.", required: true },
      { id: "restore-array", title: "Restore power generation", description: "Complete the simulated repair.", required: true },
      { id: "verify-power", title: "Verify power output", description: "Confirm the system is stable.", required: true },
    ],
    actions: [
      { id: "inspect-array", label: "Inspect array", description: "Review the solar-array indicator.", costs: { time: 20 }, completesObjectiveId: "inspect-array", feedback: "Solar arrays use photovoltaic cells to convert incoming light into electrical energy." },
      { id: "diagnose-array", label: "Run diagnostics", description: "Identify the simulated fault before repairing.", requiresObjectives: ["inspect-array"], costs: { energy: 8, time: 35 }, completesObjectiveId: "diagnose-array", feedback: "Diagnostics narrow down possible causes and help avoid unnecessary repairs." },
      { id: "restore-array", label: "Use repair kit", description: "Restore the array in the training simulation.", requiresObjectives: ["diagnose-array"], costs: { energy: 22, time: 75, repairKits: 1 }, effects: { energy: 12 }, completesObjectiveId: "restore-array", feedback: "The simulated repair restores output. Real spacecraft work uses vehicle-specific approved procedures." },
      { id: "verify-power", label: "Verify power output", description: "Check the simulated output after repair.", requiresObjectives: ["restore-array"], costs: { time: 25 }, completesObjectiveId: "verify-power", feedback: "Verification checks whether the system behaves as expected after maintenance." },
    ],
    successMessage: "Power generation restored. The outpost is back on a stable energy supply.", failureMessage: "The power system could not be restored within the available training resources.",
  },
  {
    id: "leak-response", title: "Air, Water, Life",
    briefing: "Life-support readings are drifting and oxygen reserves are already reduced. Compare trends rather than isolated values, protect essential crew systems, and restore the simulated air system before the reserve becomes critical.",
    difficulty: "intermediate",
    learningOutcomes: ["Describe why oxygen and water are essential life-support resources", "Interpret sensor readings and prioritize limited resources"],
    initialResources: { energy: 48, oxygen: 68, time: 220, repairKits: 1, scienceKits: 1 },
    objectives: [
      { id: "review-sensors", title: "Review habitat sensors", description: "Compare oxygen and water status indicators.", required: true },
      { id: "prioritize-crew", title: "Set crew priorities", description: "Choose a resource-conservation plan.", required: true },
      { id: "stabilize-air", title: "Stabilize air system", description: "Restore the simulated air-system balance.", required: true },
      { id: "verify-habitat", title: "Verify habitat stability", description: "Confirm the readings are stable.", required: true },
    ],
    actions: [
      { id: "review-sensors", label: "Compare sensor readings", description: "Review the habitat resource dashboard.", costs: { time: 25, oxygen: 3 }, completesObjectiveId: "review-sensors", feedback: "Monitoring several indicators together gives a better picture than relying on one reading." },
      { id: "prioritize-crew", label: "Activate conservation plan", description: "Prioritize essential crew systems in the simulation.", requiresObjectives: ["review-sensors"], costs: { time: 30, energy: 8, oxygen: 4 }, completesObjectiveId: "prioritize-crew", feedback: "Resource planning balances immediate crew needs with the time available to restore normal operation." },
      { id: "stabilize-air", label: "Stabilize air circulation", description: "Use the training controls to restore the air-system balance.", requiresObjectives: ["prioritize-crew"], costs: { energy: 18, time: 65, oxygen: 8, scienceKits: 1 }, effects: { oxygen: 18 }, completesObjectiveId: "stabilize-air", feedback: "Air revitalization systems manage cabin atmosphere. This scenario uses simplified simulated values." },
      { id: "verify-habitat", label: "Verify life-support status", description: "Check that the simulated readings have stabilized.", requiresObjectives: ["stabilize-air"], costs: { time: 25, oxygen: 3 }, completesObjectiveId: "verify-habitat", feedback: "A final check confirms whether the chosen response achieved its goal." },
    ],
    successMessage: "Life-support readings stabilized. The crew has a safe training environment.", failureMessage: "The habitat could not be stabilized within the available training limits.",
  },
  {
    id: "space-agriculture", title: "Greenhouse Decision",
    briefing: "The greenhouse has one remaining science kit and a restricted power budget. Design a controlled experiment, keep the non-tested variables consistent, interpret the small sample carefully, and submit a defensible report before the observation window closes.",
    difficulty: "intermediate",
    learningOutcomes: ["Identify factors that influence plant growth", "Explain why controlled experiments change and monitor variables"],
    initialResources: { energy: 52, oxygen: 100, time: 230, repairKits: 0, scienceKits: 1 },
    objectives: [
      { id: "prepare-greenhouse", title: "Prepare growth chamber", description: "Inspect the chamber and supplies.", required: true },
      { id: "set-light", title: "Set lighting plan", description: "Choose an appropriate light schedule.", required: true },
      { id: "set-water", title: "Set water plan", description: "Choose a measured water supply.", required: true },
      { id: "review-growth", title: "Review plant observations", description: "Compare the simulated growth data.", required: true },
      { id: "report-findings", title: "Report findings", description: "Summarize the evidence.", required: true },
    ],
    actions: [
      { id: "prepare-greenhouse", label: "Prepare growth chamber", description: "Inspect the chamber and experiment kit.", costs: { time: 25 }, completesObjectiveId: "prepare-greenhouse", feedback: "Controlled chambers let researchers monitor environmental conditions." },
      { id: "set-light", label: "Configure light schedule", description: "Set the simulated lighting plan.", requiresObjectives: ["prepare-greenhouse"], costs: { energy: 12, time: 25 }, completesObjectiveId: "set-light", feedback: "Light supplies energy for photosynthesis; plant responses depend on intensity, duration, and other conditions." },
      { id: "set-water", label: "Configure water delivery", description: "Set a measured water supply.", requiresObjectives: ["prepare-greenhouse"], costs: { time: 20 }, completesObjectiveId: "set-water", feedback: "Water is essential for plant processes. In microgravity, fluid movement requires careful system design." },
      { id: "review-growth", label: "Analyze growth readings", description: "Review the simulated plant observations.", requiresObjectives: ["set-light", "set-water"], costs: { energy: 15, time: 75, scienceKits: 1 }, completesObjectiveId: "review-growth", feedback: "Comparing observations with controlled conditions helps researchers interpret results." },
      { id: "report-findings", label: "Submit research report", description: "Summarize what the evidence suggests.", requiresObjectives: ["review-growth"], costs: { time: 35 }, completesObjectiveId: "report-findings", feedback: "A good report separates observations from interpretations and conclusions." },
    ],
    successMessage: "Greenhouse plan complete. Your research report has been filed.", failureMessage: "The greenhouse study could not be completed within the available training limits.",
  },
  {
    id: "solar-storm", title: "Solar Storm",
    briefing: "Mission Control reports a changing solar-weather event. Forecast timing and severity are uncertain, while power reserves are limited. Interpret the alert, protect critical systems, shed discretionary loads, and reassess before returning to normal operations. The event data provider can later be connected to the NASA API adapter.",
    difficulty: "advanced",
    learningOutcomes: ["Explain how solar activity can affect space operations", "Use alerts and uncertainty to make resource-aware decisions", "Distinguish live data from simulated training values"],
    initialResources: { energy: 62, oxygen: 95, time: 250, repairKits: 1, scienceKits: 1 },
    objectives: [
      { id: "read-space-weather", title: "Read space-weather alert", description: "Review the simulated event report.", required: true },
      { id: "protect-equipment", title: "Protect critical equipment", description: "Select the outpost protection configuration.", required: true },
      { id: "manage-power", title: "Manage power demand", description: "Balance essential systems during the event.", required: true },
      { id: "check-event-status", title: "Check event status", description: "Review the updated event conditions.", required: true },
    ],
    actions: [
      { id: "read-space-weather", label: "Analyze solar alert", description: "Review the simulated space-weather bulletin.", costs: { time: 30 }, completesObjectiveId: "read-space-weather", feedback: "Space-weather monitoring tracks solar activity that may affect spacecraft, communications, and crew operations. This alert is simulated until the NASA data provider is connected." },
      { id: "protect-equipment", label: "Switch to protected configuration", description: "Prioritize critical equipment in the simulation.", requiresObjectives: ["read-space-weather"], costs: { energy: 18, time: 35 }, completesObjectiveId: "protect-equipment", feedback: "Operational plans can reduce exposure of vulnerable systems during elevated space-weather conditions." },
      { id: "manage-power", label: "Balance power demand", description: "Reduce nonessential loads while preserving critical systems.", requiresObjectives: ["protect-equipment"], costs: { energy: 12, time: 40 }, completesObjectiveId: "manage-power", feedback: "Load management preserves energy for essential systems when operating conditions are constrained." },
      { id: "check-event-status", label: "Recheck event status", description: "Confirm the outpost is ready to resume planned operations.", requiresObjectives: ["manage-power"], costs: { time: 35 }, completesObjectiveId: "check-event-status", feedback: "Operators compare new measurements with the alert before returning to normal operations." },
    ],
    successMessage: "Solar-storm response complete. Critical outpost systems remained protected in the simulation.", failureMessage: "The outpost response was not completed within the available training resources.",
  },
  {
    id: "outpost-emergency", title: "Outpost Emergency",
    briefing: "Two system warnings arrive close together during a reduced-resource operating period. Establish a reliable timeline, separate observations from hypotheses, coordinate with Mission Control, and choose a proportionate recovery plan. Your remaining energy, oxygen and time are not enough for careless actions.",
    difficulty: "advanced",
    learningOutcomes: ["Prioritize crew safety during a systems emergency", "Use communication, evidence, and checklists under pressure", "Explain why actions should follow verified information"],
    initialResources: { energy: 48, oxygen: 72, time: 235, repairKits: 1, scienceKits: 1 },
    objectives: [
      { id: "acknowledge-warning", title: "Acknowledge warning", description: "Confirm the alert and start the response log.", required: true },
      { id: "contact-control", title: "Contact Mission Control", description: "Send a status report.", required: true },
      { id: "assess-systems", title: "Assess affected systems", description: "Compare the relevant status readings.", required: true },
      { id: "select-response", title: "Select response plan", description: "Choose the safe training response.", required: true },
      { id: "confirm-recovery", title: "Confirm recovery", description: "Verify the system status after the response.", required: true },
    ],
    actions: [
      { id: "acknowledge-warning", label: "Acknowledge alert", description: "Confirm receipt of the warning.", costs: { time: 10 }, completesObjectiveId: "acknowledge-warning", feedback: "Acknowledging an alert helps the team coordinate and establish a shared timeline." },
      { id: "contact-control", label: "Send Mission Control report", description: "Share the alert and current status.", requiresObjectives: ["acknowledge-warning"], costs: { time: 25 }, completesObjectiveId: "contact-control", feedback: "Clear communication helps the crew and ground team maintain shared situational awareness." },
      { id: "assess-systems", label: "Run system assessment", description: "Compare the affected system indicators.", requiresObjectives: ["contact-control"], costs: { energy: 10, time: 40, oxygen: 4 }, completesObjectiveId: "assess-systems", feedback: "Assessment gathers evidence before the team chooses a response." },
      { id: "select-response", label: "Apply recovery plan", description: "Use the verified training response.", requiresObjectives: ["assess-systems"], costs: { energy: 20, time: 65, oxygen: 6, repairKits: 1 }, effects: { energy: 12 }, completesObjectiveId: "select-response", feedback: "A response plan should be based on verified information and approved procedures. This is a simplified game scenario." },
      { id: "confirm-recovery", label: "Verify system recovery", description: "Check that the simulated warning has cleared.", requiresObjectives: ["select-response"], costs: { time: 35 }, completesObjectiveId: "confirm-recovery", feedback: "A final verification step checks whether the response achieved its intended result." },
    ],
    successMessage: "Emergency response complete. The outpost is stable in the training simulation.", failureMessage: "The emergency response was not completed within the available training limits.",
  },
] as const;

/** Optional stretch mission, intentionally excluded from the six-mission core progression. */
export const OPTIONAL_MISSION_DEFINITIONS: readonly MissionDefinition[] = [
  {
    id: "science-expedition", title: "Science Expedition",
    briefing: "Choose a research target with limited observation time, inspect the provenance and uncertainty of its dataset, and justify a scientific question that can actually be answered with the available evidence.",
    difficulty: "advanced",
    learningOutcomes: ["Interpret space-science observations", "Support a research choice with evidence and acknowledge data limitations"],
    initialResources: { energy: 100, oxygen: 100, time: 300, repairKits: 0, scienceKits: 2 },
    objectives: [
      { id: "choose-target", title: "Choose research target", description: "Select an observation target.", required: true },
      { id: "review-evidence", title: "Review evidence", description: "Inspect the available data summary.", required: true },
      { id: "justify-target", title: "Justify investigation", description: "Record an evidence-based reason for the choice.", required: true },
    ],
    actions: [
      { id: "choose-target", label: "Select observation target", description: "Choose a target for the study.", costs: { time: 20 }, completesObjectiveId: "choose-target", feedback: "A focused research question helps determine which observations are useful." },
      { id: "review-evidence", label: "Inspect data summary", description: "Review the available observations and their limitations.", requiresObjectives: ["choose-target"], costs: { time: 30, scienceKits: 1 }, completesObjectiveId: "review-evidence", feedback: "Researchers check source, instrument, units, and uncertainty before interpreting data." },
      { id: "justify-target", label: "Submit research justification", description: "Explain why this target is worth investigating.", requiresObjectives: ["review-evidence"], costs: { time: 20 }, completesObjectiveId: "justify-target", feedback: "A strong justification connects the question to evidence and explains what remains unknown." },
    ],
    successMessage: "Science expedition complete. Your research recommendation has been recorded.", failureMessage: "The research task was not completed within the available training time.",
  },
];

const allDefinitions = [...MISSION_DEFINITIONS, ...OPTIONAL_MISSION_DEFINITIONS];
const missionMap = new Map(allDefinitions.map((mission) => [mission.id, mission]));

export function getMissionDefinition(missionId: string): MissionDefinition | undefined {
  return missionMap.get(missionId);
}

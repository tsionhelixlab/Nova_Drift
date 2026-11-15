/**
 * Campaign metadata for Nova Drift's existing six-mission training sequence.
 * The executable mission rules live in missionDefinitions.ts so the v2 module
 * preserves the tested rules and IDs rather than maintaining a second campaign.
 */
export const CAMPAIGN_ID = "nova-drift-core-campaign";
export const CAMPAIGN_VERSION = 2;
export const CAMPAIGN_STAGES = Object.freeze(["investigate", "decide", "simulate", "debrief"]);

export const CAMPAIGN_RULES = Object.freeze({
  sequentialUnlocks: true,
  requireAllRequiredObjectives: true,
  preserveResourcesWithinMission: true,
  allowStageSkipping: false,
  gameplayValuesAreTelemetry: false,
});

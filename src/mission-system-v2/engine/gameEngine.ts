/**
 * Compatibility bridge to the repository's already-tested mission runtime.
 * Keeping this single implementation prevents two subtly different engines
 * from running in the same game during the migration.
 */
export { MissionEngine } from "../../missions/missionEngine";

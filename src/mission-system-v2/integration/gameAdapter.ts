import { startMissionSession, restartMissionSession, completeMissionSession, failMissionSession } from "../../integration/missionSession";
import { MissionEngine } from "../engine/gameEngine";
import { loadNasaEventContext, type NasaEventProvider } from "../nasa/nasaData";
import { toNovaDriftScoreInput } from "./scoreAdapter";

export interface MissionSystemOptions {
  nasaEventProvider?: NasaEventProvider;
}

/**
 * Single integration surface for the existing Nova Drift React application.
 * Uses its existing session/store/scoring/persistence path; does not create a
 * second Zustand store or alter UI, CSS, achievements, or localStorage.
 */
export function createMissionSystem(options: MissionSystemOptions = {}) {
  return {
    start(missionId: string, startedAt?: string): MissionEngine {
      return startMissionSession(missionId, startedAt);
    },
    restart(missionId: string, startedAt?: string): MissionEngine {
      return restartMissionSession(missionId, startedAt);
    },
    complete(engine: MissionEngine, completedAt?: string) {
      const handoff = engine.toScoreHandoff();
      // Validate the exact score contract before handing off to existing code.
      toNovaDriftScoreInput(handoff);
      return completeMissionSession(engine, completedAt);
    },
    fail(engine: MissionEngine, completedAt?: string): void {
      failMissionSession(engine, completedAt);
    },
    loadNasaEventContext() {
      return loadNasaEventContext(options.nasaEventProvider);
    },
  };
}

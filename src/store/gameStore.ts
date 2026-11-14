import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import type { CadetProfile } from "../types/cadet";
import type { MissionProgress } from "../types/mission";
import { validatePersistedState } from "../persistence/validatePersistedState";
import type { MissionResult } from "../types/result";
import type { UnlockedAchievement } from "../types/achievement";
import { browserStorage } from "../persistence/storage";

export interface GameStoreState {
  cadetProfile: CadetProfile | null;
  missionProgress: Record<string, MissionProgress>;
  missionResults: MissionResult[];
  unlockedAchievements: UnlockedAchievement[];
  setCadetProfile: (profile: CadetProfile) => void;
  setMissionLocked: (missionId: string) => void;
  setMissionAvailable: (missionId: string) => void;
  startMission: (missionId: string, startedAt?: string) => void;
  updateMissionProgress: (progress: MissionProgress) => void;
  completeMission: (result: MissionResult) => void;
  addUnlockedAchievement: (achievement: UnlockedAchievement) => void;
  resetGame: () => void;
}

const initialData = {
  cadetProfile: null,
  missionProgress: {} as Record<string, MissionProgress>,
  missionResults: [] as MissionResult[],
  unlockedAchievements: [] as UnlockedAchievement[]
};

function requireId(id: string): void {
  if (!id.trim()) throw new Error("An ID is required.");
}
function requireDate(value: string, name: string): void {
  if (Number.isNaN(Date.parse(value))) throw new Error(`${name} must be a valid date.`);
}

export function createGameStore(storage: StateStorage = browserStorage) {
  return create<GameStoreState>()(persist((set, get) => ({
    ...initialData,

    setCadetProfile: (profile) => {
      if (!profile.id.trim() || !profile.callsign.trim()) {
        throw new Error("Cadet ID and callsign are required.");
      }
      set({ cadetProfile: profile });
    },
setMissionLocked: (missionId) => {
  requireId(missionId);

  const current = get().missionProgress[missionId];

  if (current?.status === "completed") {
    throw new Error("Cannot lock a completed mission.");
  }

  if (current?.status === "in_progress") {
    throw new Error("Cannot lock a mission that is in progress.");
  }

  set((state) => ({
    missionProgress: {
      ...state.missionProgress,
      [missionId]: {
        missionId,
        status: "locked",
        startedAt: null,
        completedAt: null,
        attempts: current?.attempts ?? 0
      }
    }
  }));
},
    setMissionAvailable: (missionId) => {
      requireId(missionId);
      const current = get().missionProgress[missionId];
      if (current?.status === "completed") return;
      if (current?.status === "in_progress") {
  throw new Error("Cannot make an in-progress mission available.");
}
      set((state) => ({
        missionProgress: {
          ...state.missionProgress,
          [missionId]: {
            missionId, status: "available",
            startedAt: current?.startedAt ?? null,
            completedAt: current?.completedAt ?? null,
            attempts: current?.attempts ?? 0
          }
        }
      }));
    },

    startMission: (missionId, startedAt = new Date().toISOString()) => {
      requireId(missionId);
      requireDate(startedAt, "startedAt");
      const current = get().missionProgress[missionId];
      if (current?.status === "locked") throw new Error("This mission is locked.");
      if (current?.status === "completed") throw new Error("This mission is already completed.");
      if (current?.status === "in_progress") {
  throw new Error("This mission is already in progress.");
}
      set((state) => ({
        missionProgress: {
          ...state.missionProgress,
          [missionId]: {
            missionId, status: "in_progress", startedAt, completedAt: null,
            attempts: (current?.attempts ?? 0) + 1
          }
        }
      }));
    },


      updateMissionProgress: (progress) => {
  requireId(progress.missionId);

  if (
    !Number.isInteger(progress.attempts) ||
    progress.attempts < 0
  ) {
    throw new Error("Attempts must be a non-negative integer.");
  }

  if (progress.startedAt) requireDate(progress.startedAt, "startedAt");
  if (progress.completedAt) requireDate(progress.completedAt, "completedAt");

  const current = get().missionProgress[progress.missionId];

  if (!current || current.status !== "in_progress") {
    throw new Error("Only an in-progress mission can be updated.");
  }

  if (!["in_progress", "failed"].includes(progress.status)) {
    throw new Error("Invalid mission progress transition.");
  }

  set((state) => ({
    missionProgress: {
      ...state.missionProgress,
      [progress.missionId]: progress
    }
  }));
},
    

    completeMission: (result) => {
      requireId(result.missionId);
      requireDate(result.completedAt, "completedAt");
      
        const duplicate = get().missionResults.some(
        (item) => item.missionId === result.missionId && item.completedAt === result.completedAt
      );
      if (duplicate) return;
      const current = get().missionProgress[result.missionId];

if (!current || current.status !== "in_progress") {
  throw new Error("Only an in-progress mission can be completed.");
}
    

      set((state) => ({
        missionProgress: {
          ...state.missionProgress,
          [result.missionId]: {
            missionId: result.missionId, status: "completed",
            startedAt: state.missionProgress[result.missionId]?.startedAt ?? null,
            completedAt: result.completedAt,
            attempts: state.missionProgress[result.missionId]?.attempts ?? 1
            
          } 
        },
        missionResults: [...state.missionResults, result]
      }));
    },

    addUnlockedAchievement: (achievement) => {
      requireId(achievement.achievementId);
      requireDate(achievement.unlockedAt, "unlockedAt");
      set((state) => state.unlockedAchievements.some(
        (item) => item.achievementId === achievement.achievementId
      ) ? state : {
        unlockedAchievements: [...state.unlockedAchievements, achievement]
      });
    },

    resetGame: () => set({ ...initialData })
  }), {
    name: "astroquest-hub-game-state",
    version: 1,
    storage: createJSONStorage(() => storage),
    partialize: (state) => ({
      cadetProfile: state.cadetProfile,
      missionProgress: state.missionProgress,
      missionResults: state.missionResults,
      unlockedAchievements: state.unlockedAchievements
    }),
merge: (persistedState, currentState) => ({
  ...currentState,
  ...validatePersistedState(persistedState)
})
  }))
}
export const useGameStore = createGameStore();

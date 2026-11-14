# Nova Drift — State Management & Scoring

## Overview

Nova Drift is an interactive space exploration experience designed to help young learners explore space through missions, challenges, and discoveries.

This repository contains the **State Management & Scoring module** of Nova Drift.

Its responsibility is to manage the player's game state, track mission progress, calculate and store mission results, manage achievements, and preserve important data between sessions.

## My Responsibilities

This module provides:

- TypeScript interfaces for shared game data.
- Zustand-based global game state management.
- Mission status and progress tracking.
- Mission result storage.
- Achievement unlock tracking.
- Persistent storage with fallback to in-memory storage.
- Validation of restored persisted data.
- Mission scoring and ranking functionality.

## Technology Stack

- TypeScript
- Zustand
- Vitest
- Browser localStorage

## Project Structure

```text
src/
├── persistence/
│   ├── storage.ts
│   └── validatePersistedState.ts
├── scoring/
│   └── ...
├── store/
│   └── gameStore.ts
└── types/
    ├── achievement.ts
    ├── cadet.ts
    ├── mission.ts
    └── result.ts

tests/
├── gameStore.test.ts
├── persistence.test.ts
├── validatePersistedState.test.ts
├── scoring.test.ts
├── rank.test.ts
└── createMissionResult.test.ts
```

## Main Store Data

The game store manages four main categories of data:

| Data                   | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `cadetProfile`         | Player information                      |
| `missionProgress`      | Current status and progress of missions |
| `missionResults`       | Completed mission results and scores    |
| `unlockedAchievements` | Achievements earned by the player       |

## Mission Statuses

Missions can have five statuses:

- `locked`
- `available`
- `in_progress`
- `completed`
- `failed`

The store provides actions to manage mission state and enforce basic lifecycle rules.

## Persistence

The store uses Zustand's persistence middleware.

- Browser localStorage is the primary storage.
- In-memory storage is used as a fallback when browser storage is unavailable.
- Persisted data is validated before being merged into the current state.
- The game state can be reset using `resetGame()`.

**Note:** In-memory fallback data is temporary and does not survive application closure.

## Running the Project

Install dependencies:

```bash
npm install
```

Run tests:

```bash
npm test
```

Run TypeScript checks:

```bash
npm run typecheck
```

## Integration Status

This module is being prepared for integration with the other Nova Drift modules.

Its shared interfaces and integration expectations are documented in `INTEGRATION.md`.

Some integration details, including mission event contracts and achievement unlock responsibilities, still require team agreement.

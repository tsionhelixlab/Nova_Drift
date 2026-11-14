# State & Scoring Integration Contract

## Included responsibilities
- Shared cadet, mission, result, and minimal unlocked-achievement types.
- Mission score and rank calculation.
- Zustand game store.
- Browser localStorage persistence.
- Automated tests.

NASA data fetching, API caching, and achievement unlock rules remain with the teammate assigned to NASA Data & Achievements.

## Scoring formula
`1000 + (timeRemaining * 2) - (hintsUsed * 150) - hullHazardDeductions`

- Gold Mission Patch: score >= 850
- Silver Flight Badge: score >= 650 and < 850
- Recalibration Required: score < 650

Scores are not clamped at zero because the current project formula does not specify a minimum.

## Proposed mission-engine handoff
The mission engine supplies:
```ts
{
  missionId: string;
  timeRemaining: number;
  hintsUsed: number;
  hullHazardDeductions: number;
}
```

Then the app can call:
```ts
import { createMissionResult, useGameStore } from "./src";

const result = createMissionResult(missionId, {
  timeRemaining,
  hintsUsed,
  hullHazardDeductions
});
useGameStore.getState().completeMission(result);
```

This is a proposed contract. Confirm event names, time units, hazard deduction meaning, and replay behavior with the team before final integration.

## React example
```tsx
import { useGameStore } from "./src";

export function CadetHeader() {
  const callsign = useGameStore((state) => state.cadetProfile?.callsign);
  return <div>Cadet: {callsign ?? "Unregistered"}</div>;
}
```

## Persistence
Storage key: `astroquest-hub-game-state`; version: `1`.
Browser localStorage is used in browsers. Non-browser environments use an in-memory fallback, which does not persist across reloads.

## Decisions still to confirm
1. React + Vite or Next.js?
2. Does the team already have a global store?
3. Exact mission-engine outcome/event contract?
4. Is time remaining measured in seconds or minutes?
5. How are hull hazard deductions determined?
6. Can missions be replayed, and should each attempt produce a result?
7. What achievement IDs and payloads will the achievements teammate provide?

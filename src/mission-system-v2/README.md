# Nova Drift mission-system-v2

A drop-in mission module built against the supplied `Nova_Drift-main` repository.

## Integration

```ts
import { createMissionSystem } from "./mission-system-v2";

const missionSystem = createMissionSystem({
  // Connect Nardi's NASA API adapter here when its function is ready.
  // nasaEventProvider: () => nasaApi.getLatestSolarEvent(),
});

const engine = missionSystem.start("orientation");
// engine.getDefinition(), engine.getState(), engine.getAvailableActions()
// engine.performAction(actionId), engine.useHint()
// On completion: missionSystem.complete(engine)
// On failure: missionSystem.fail(engine)
```

## Preserved host responsibilities

- Existing Zustand store and mission progress lifecycle
- Existing score calculation/ranks and result creation
- Existing localStorage persistence and validation
- Existing React UI, CSS, routes, and teammate-owned components
- Existing achievement system

The adapter delegates to `src/integration/missionSession.ts`; it does not create a competing store or persistence layer.

## NASA data boundary

The module accepts `nasaEventProvider` from the team's NASA/API integration. It never embeds an API key or pretends fallback data is live. Until the provider is connected, the returned context is explicitly marked simulated. The mission rules currently in the repository remain the source of truth; the module does not silently replace them with the separate demo campaign.

## Important integration note

Place this directory at `src/mission-system-v2/`. The existing `src/missions/` directory is intentionally left intact until the new module is verified in the application. Once verified, the app can switch imports to this module and remove the old directory in a separate reviewed change.

## Source-repository inventory note

The supplied `Nova_Drift-main.zip` currently contains **five** executable mission definitions (`orientation`, `solar-repair`, `leak-response`, `microgravity-lab`, `space-agriculture`). A separate earlier demo ZIP contains a different six-mission campaign. This v2 folder deliberately preserves the five definitions actually present in the host repository rather than silently substituting the demo campaign or inventing a sixth mission. Reconcile the campaign count with the team before release.

`engine/gameEngine.ts` intentionally re-exports the host's tested `MissionEngine` during migration. This preserves class compatibility with `src/integration/missionSession.ts`; the folder is an integration boundary first, not a second competing runtime.

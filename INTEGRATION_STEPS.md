# Nova Drift — Six Missions, Research Lab & Scientific Log

## What this package changes

- Replaces `index.html` and `src/frontend/main.ts` with the version that exposes the six-mission campaign, Research Lab, and Scientific Log.
- Replaces `src/missions/missionDefinitions.ts` with the six core campaign missions plus the optional Science Expedition.
- Adds `src/lab/`, `src/scienceLog/`, and `lab-interior.css`.
- Updates `src/index.ts` to export the new modules.
- Includes `src/missions/missionTypes.ts`, `src/missions/missionEngine.ts`, and `src/missions/index.ts` as explicit compatibility copies from the original project.

## Why missionTypes.ts and missionEngine.ts are included but not redesigned

The six mission definitions use the existing engine contract: resource costs/effects, objective completion, objective prerequisites, feedback, time limits, and success/failure outcomes. The existing `MissionEngine` already enforces those mechanics, and the existing types already describe every field used by the six definitions. Replacing the engine with a second engine would add integration risk without adding a required mechanic. These files are included so the complete mission module is visible in one package; they are compatibility copies, not a second engine.

## Integration steps

1. Make a backup of the existing project folder.
2. Extract this ZIP.
3. Copy the extracted `src` folder and `index.html` into the existing project root, allowing the listed files to merge/overwrite.
4. Copy `lab-interior.css` into the project root.
5. Do **not** replace `style.css`, `script.js`, `src/store/`, `src/persistence/`, `src/scoring/`, or `src/types/`.
6. In VS Code terminal, run `npm install` if dependencies are not installed, then `npm run typecheck`, `npm test`, and `npm run build`.

The new `index.html` links both the existing `style.css` and the additional `lab-interior.css`. The lab styling is isolated in the additional stylesheet; the team's existing stylesheet is not included in this package.

## Campaign

Six core missions, in order:
1. First Day at the Outpost
2. Keep the Lights On
3. Air, Water, Life
4. Greenhouse Decision
5. Solar Storm
6. Outpost Emergency

Optional stretch mission: Science Expedition (not counted among the six core missions).

## Validation note

The archive contents were checked and merged against the supplied `Nova_Drift-main.zip`. A full TypeScript/build/test run could not be completed in this environment because the project's npm type dependencies are not installed here. Run the commands above in the project environment and address any reported integration errors before pushing to GitHub.

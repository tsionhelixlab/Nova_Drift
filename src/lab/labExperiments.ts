import type { LabExperimentDefinition } from "./labTypes";

/** Lightweight, deterministic learning simulations. They are game models, not engineering simulators. */
export const LAB_EXPERIMENTS: readonly LabExperimentDefinition[] = [
  {
    id: "microgravity-drop",
    title: "Zero-G Drop Test",
    station: "Motion & Microgravity Bench",
    objective: "Predict what happens when two objects are released together inside an orbiting spacecraft.",
    concept: "Microgravity and free fall",
    explanation: "Objects inside an orbiting spacecraft and the spacecraft itself are in continuous free fall around Earth. They accelerate together, so objects can appear weightless relative to the cabin. Gravity is still present.",
    options: [
      { id: "gravity-off", label: "Gravity switches off, so nothing moves", correct: false, feedback: "Not quite. Gravity is still acting on the spacecraft and everything inside it." },
      { id: "shared-fall", label: "Both objects share the spacecraft's free-fall motion", correct: true, feedback: "Correct. Their shared free-fall motion makes them appear weightless relative to the cabin." },
      { id: "heavy-first", label: "The heavier object must fall to the floor first", correct: false, feedback: "In an ideal free-fall environment, objects share the same gravitational acceleration regardless of mass." },
    ],
  },
  {
    id: "greenhouse-tuning",
    title: "Greenhouse Control Challenge",
    station: "Astro-Biology Growth Chamber",
    objective: "Choose the best research approach for comparing how light affects plant growth.",
    concept: "Controlled variables and photosynthesis",
    explanation: "To test the effect of light, keep other important conditions such as water, temperature, and plant type as consistent as possible. Photosynthesis uses light energy, but plant growth depends on several interacting factors.",
    options: [
      { id: "change-everything", label: "Change light, water, and temperature together", correct: false, feedback: "Changing many variables at once makes it difficult to identify what caused a difference." },
      { id: "control-others", label: "Change light while keeping other conditions steady", correct: true, feedback: "Good experimental design. This makes the effect of light easier to investigate." },
      { id: "no-records", label: "Choose settings but do not record observations", correct: false, feedback: "Without recorded observations, the team cannot compare outcomes or support a conclusion." },
    ],
  },
  {
    id: "spectral-sample",
    title: "Unknown Sample Scanner",
    station: "Spectroscopy & Materials Bench",
    objective: "Identify why scientists compare a sample's spectrum with reference patterns.",
    concept: "Spectroscopy and evidence",
    explanation: "Atoms and molecules interact with light at characteristic wavelengths. Comparing measured spectral features with calibrated references can help identify materials, while instrument limits and mixtures must be considered.",
    options: [
      { id: "guess-color", label: "Identify the sample only by its visible color", correct: false, feedback: "Color alone is usually not enough to identify an unknown material reliably." },
      { id: "compare-spectrum", label: "Compare measured spectral features with references", correct: true, feedback: "Correct. Spectral patterns provide evidence that can be compared with known reference data." },
      { id: "ignore-calibration", label: "Ignore instrument calibration and choose the brightest signal", correct: false, feedback: "Calibration and instrument context matter. Signal brightness alone is not a reliable identity test." },
    ],
  },
];

export function getLabExperiment(id: string): LabExperimentDefinition | undefined {
  return LAB_EXPERIMENTS.find((experiment) => experiment.id === id);
}

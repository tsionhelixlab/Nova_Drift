import { getLabExperiment } from "./labExperiments";
import type { LabExperimentId, LabRunResult } from "./labTypes";

const STORAGE_KEY = "nova-drift-lab-v1";

function readRuns(): LabRunResult[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as LabRunResult[] : [];
  } catch { return []; }
}

function saveRuns(runs: LabRunResult[]): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(runs));
}

export function getLabRuns(): LabRunResult[] {
  return readRuns().map((run) => ({ ...run }));
}

export function runLabExperiment(experimentId: LabExperimentId, optionId: string): LabRunResult {
  const experiment = getLabExperiment(experimentId);
  if (!experiment) throw new Error(`Unknown lab experiment: ${experimentId}`);
  const option = experiment.options.find((item) => item.id === optionId);
  if (!option) throw new Error(`Unknown option for experiment: ${optionId}`);
  const result: LabRunResult = {
    id: `lab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    experimentId,
    experimentTitle: experiment.title,
    selectedOptionId: optionId,
    correct: option.correct,
    researchPoints: option.correct ? 25 : 5,
    concept: experiment.concept,
    explanation: `${option.feedback} ${experiment.explanation}`,
    completedAt: new Date().toISOString(),
  };
  const runs = readRuns();
  runs.push(result);
  saveRuns(runs);
  return result;
}

export function getLabResearchPoints(): number {
  return readRuns().reduce((total, run) => total + (Number.isFinite(run.researchPoints) ? run.researchPoints : 0), 0);
}

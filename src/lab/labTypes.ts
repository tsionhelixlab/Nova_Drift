export type LabExperimentId = "microgravity-drop" | "greenhouse-tuning" | "spectral-sample";

export interface LabOption {
  id: string;
  label: string;
  feedback: string;
  correct: boolean;
}

export interface LabExperimentDefinition {
  id: LabExperimentId;
  title: string;
  station: string;
  objective: string;
  concept: string;
  explanation: string;
  options: LabOption[];
}

export interface LabRunResult {
  id: string;
  experimentId: LabExperimentId;
  experimentTitle: string;
  selectedOptionId: string;
  correct: boolean;
  researchPoints: number;
  concept: string;
  explanation: string;
  completedAt: string;
}

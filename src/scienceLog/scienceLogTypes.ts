export type ScienceLogCategory = "mission" | "experiment" | "observation" | "hypothesis" | "source";
export type EvidenceType = "DIRECT DATA" | "SOURCED FACT" | "DERIVED MODEL" | "GAMEPLAY ASSUMPTION";

export interface ScienceLogEntry {
  id: string;
  category: ScienceLogCategory;
  title: string;
  content: string;
  concept?: string;
  evidenceType?: EvidenceType;
  source?: string;
  createdAt: string;
}

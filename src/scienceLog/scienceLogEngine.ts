import type { EvidenceType, ScienceLogCategory, ScienceLogEntry } from "./scienceLogTypes";

const STORAGE_KEY = "nova-drift-science-log-v1";

function readEntries(): ScienceLogEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed as ScienceLogEntry[] : [];
  } catch { return []; }
}

function saveEntries(entries: ScienceLogEntry[]): void {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function getScienceLogEntries(): ScienceLogEntry[] {
  return readEntries().map((entry) => ({ ...entry })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function addScienceLogEntry(input: {
  category: ScienceLogCategory;
  title: string;
  content: string;
  concept?: string;
  evidenceType?: EvidenceType;
  source?: string;
}): ScienceLogEntry {
  if (!input.title.trim() || !input.content.trim()) throw new Error("A science-log title and note are required.");
  const entry: ScienceLogEntry = { ...input, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: new Date().toISOString() };
  const entries = readEntries();
  entries.push(entry);
  saveEntries(entries);
  return entry;
}

export function updateScienceLogEntry(id: string, changes: { title: string; content: string; evidenceType?: EvidenceType }): ScienceLogEntry {
  if (!changes.title.trim() || !changes.content.trim()) throw new Error("A science-log title and note are required.");
  const entries = readEntries();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) throw new Error("Science-log entry not found.");
  const updated = { ...entries[index], ...changes };
  entries[index] = updated;
  saveEntries(entries);
  return updated;
}

export function deleteScienceLogEntry(id: string): void {
  saveEntries(readEntries().filter((entry) => entry.id !== id));
}

export function recordMissionScience(title: string, learningOutcomes: string[]): void {
  addScienceLogEntry({
    category: "mission",
    title: `${title} — mission debrief`,
    content: `Mission completed. Concepts encountered: ${learningOutcomes.join("; ")}. Review the mission decisions and distinguish the simulated resource values from real spacecraft telemetry.`,
    concept: learningOutcomes.join("; "),
    evidenceType: "GAMEPLAY ASSUMPTION",
  });
}

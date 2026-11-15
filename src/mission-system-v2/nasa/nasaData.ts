/**
 * NASA data boundary. The mission module does not own API keys, network policy,
 * caching, or the team's API implementation. Nardi's API layer is injected.
 */
export interface NasaEventContext {
  available: boolean;
  real: boolean;
  source: string;
  eventId?: string | null;
  classType?: string | null;
  beginTime?: string | null;
  peakTime?: string | null;
  link?: string | null;
  interpretationNote: string;
  gameplayNote: string;
  reason?: string;
}

export type NasaEventProvider = () => Promise<NasaEventContext>;

export const SIMULATED_NASA_CONTEXT: NasaEventContext = Object.freeze({
  available: false,
  real: false,
  source: "SIMULATED TRAINING CONTEXT",
  eventId: null,
  classType: "Training scenario",
  beginTime: null,
  peakTime: null,
  link: null,
  interpretationNote: "No live NASA observation is being presented.",
  gameplayNote: "Any resource changes are gameplay assumptions, not measured spacecraft telemetry.",
});

/** Returns clearly labeled fallback context if the team's provider is unavailable. */
export async function loadNasaEventContext(provider?: NasaEventProvider): Promise<NasaEventContext> {
  if (!provider) return { ...SIMULATED_NASA_CONTEXT };
  try {
    const value = await provider();
    if (!value || typeof value.available !== "boolean" || typeof value.real !== "boolean") {
      throw new Error("NASA provider returned an invalid context payload.");
    }
    return { ...value };
  } catch (error) {
    return {
      ...SIMULATED_NASA_CONTEXT,
      reason: error instanceof Error ? error.message : "NASA data provider unavailable.",
    };
  }
}

import { describe, expect, it } from "vitest";
import { calculateRank } from "../src/scoring/calculateRank";

describe("calculateRank", () => {
  it.each([
    [850, "Gold Mission Patch"],
    [1000, "Gold Mission Patch"],
    [849, "Silver Flight Badge"],
    [650, "Silver Flight Badge"],
    [649, "Recalibration Required"],
    [0, "Recalibration Required"],
    [-10, "Recalibration Required"]
  ] as const)("assigns the correct rank for score %s", (score, rank) => {
    expect(calculateRank(score)).toBe(rank);
  });
  it("rejects non-finite scores", () => {
    expect(() => calculateRank(Number.NaN)).toThrow();
    expect(() => calculateRank(Number.POSITIVE_INFINITY)).toThrow();
  });
});

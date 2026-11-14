import { describe, expect, it } from "vitest";
import { calculateScore } from "../src/scoring/calculateScore";

describe("calculateScore", () => {
  it("calculates the project formula", () => {
    expect(calculateScore({ timeRemaining: 100, hintsUsed: 2, hullHazardDeductions: 50 })).toBe(850);
  });
  it("calculates with no hints or deductions", () => {
    expect(calculateScore({ timeRemaining: 100, hintsUsed: 0, hullHazardDeductions: 0 })).toBe(1200);
  });
  it("rejects negative inputs", () => {
    expect(() => calculateScore({ timeRemaining: 100, hintsUsed: -1, hullHazardDeductions: 0 })).toThrow();
  });
  it("rejects non-finite inputs", () => {
    expect(() => calculateScore({ timeRemaining: Infinity, hintsUsed: 0, hullHazardDeductions: 0 })).toThrow();
  });
});

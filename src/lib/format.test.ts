import { describe, expect, it } from "vitest";
import { formatEuros, formatFecha } from "./format";

describe("formatEuros", () => {
  it("formatea céntimos en euros (en)", () => {
    expect(formatEuros(549000, "en")).toBe("€5,490.00");
  });

  it("formatea céntimos en euros (es)", () => {
    expect(formatEuros(137250, "es")).toMatch(/^1\.?372,50\s€$/);
  });

  it("no pierde los céntimos", () => {
    expect(formatEuros(5, "en")).toBe("€0.05");
  });
});

describe("formatFecha", () => {
  it("usa UTC: sin desfase de día", () => {
    expect(formatFecha("2027-08-01", "en")).toContain("1");
    expect(formatFecha("2027-08-01", "en")).toContain("2027");
  });

  it("localiza el mes", () => {
    expect(formatFecha("2027-08-01", "es")).toMatch(/agosto/i);
    expect(formatFecha("2027-08-01", "en")).toMatch(/august/i);
  });
});

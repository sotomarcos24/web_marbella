import { describe, expect, it } from "vitest";
import { clamp } from "@/lib/example";

describe("clamp", () => {
  it("devuelve el valor si está dentro del rango", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("limita al mínimo y al máximo", () => {
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

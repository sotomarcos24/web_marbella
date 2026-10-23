import { describe, expect, it } from "vitest";
import { haLlegado, opacidadFinal, opacidadLlegada, escalaInicio, escalaLlegada } from "./progreso";

describe("progreso de la escena", () => {
  it("el zoom crece con el progreso y vuelve a escala 1 en la llegada", () => {
    expect(escalaInicio(0, false)).toBe(1);
    expect(escalaInicio(1, false)).toBeGreaterThan(escalaInicio(0.5, false));
    expect(escalaLlegada(0, false)).toBeGreaterThan(1);
    expect(escalaLlegada(1, false)).toBe(1);
  });

  it("con reduced-motion no hay zoom", () => {
    for (const p of [0, 0.5, 1]) {
      expect(escalaInicio(p, true)).toBe(1);
      expect(escalaLlegada(p, true)).toBe(1);
    }
  });

  it("la imagen de llegada se funde de 0 a 1 antes del último 5 %", () => {
    expect(opacidadLlegada(0, false)).toBe(0);
    expect(opacidadLlegada(0.5, false)).toBeGreaterThan(0);
    expect(opacidadLlegada(0.5, false)).toBeLessThan(1);
    expect(opacidadLlegada(0.95, false)).toBe(1);
  });

  it("la imagen final real solo aparece en el último 5 %", () => {
    expect(opacidadFinal(0.94, false)).toBe(0);
    expect(opacidadFinal(0.975, false)).toBeCloseTo(0.5);
    expect(opacidadFinal(1, false)).toBe(1);
  });

  it("con reduced-motion el fundido es lineal y simple", () => {
    expect(opacidadLlegada(0.5, true)).toBe(0.5);
    expect(opacidadFinal(1, true)).toBe(0);
  });

  it("valores fuera de rango se acotan", () => {
    expect(opacidadLlegada(-1, false)).toBe(0);
    expect(opacidadFinal(2, false)).toBe(1);
  });

  it("haLlegado solo al completar el progreso", () => {
    expect(haLlegado(0.99)).toBe(false);
    expect(haLlegado(0.9999)).toBe(true);
    expect(haLlegado(1)).toBe(true);
  });
});

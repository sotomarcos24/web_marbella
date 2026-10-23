import { describe, expect, it } from "vitest";
import { escalaAerea, opacidadAerea, opacidadArco, desplazamientoNube, opacidadNubes } from "./fases";

describe("fases de la intro", () => {
  it("el arco se ve al principio y desaparece al cruzarlo", () => {
    expect(opacidadArco(0, false)).toBe(1);
    expect(opacidadArco(0.4, false)).toBe(0);
  });

  it("las nubes aparecen tras el arco y se disipan antes de llegar", () => {
    expect(opacidadNubes(0, false)).toBe(0);
    expect(opacidadNubes(0.45, false)).toBeGreaterThan(0.5);
    expect(opacidadNubes(1, false)).toBe(0);
  });

  it("las capas de nubes más cercanas se desplazan más (parallax)", () => {
    expect(Math.abs(desplazamientoNube(0.5, 2))).toBeGreaterThan(Math.abs(desplazamientoNube(0.5, 1)));
  });

  it("la aérea hace zoom hasta escala 1 y queda fija y opaca al llegar", () => {
    expect(escalaAerea(0.5, false)).toBeGreaterThan(1);
    expect(escalaAerea(1, false)).toBe(1);
    expect(opacidadAerea(0, false)).toBe(0);
    expect(opacidadAerea(1, false)).toBe(1);
  });

  it("con reduced-motion: sin nubes ni zoom, fundido directo del arco a la aérea", () => {
    expect(opacidadNubes(0.5, true)).toBe(0);
    expect(escalaAerea(0.3, true)).toBe(1);
    expect(opacidadAerea(0.5, true)).toBeCloseTo(0.5);
    expect(opacidadArco(0.5, true)).toBeCloseTo(0.5);
  });
});

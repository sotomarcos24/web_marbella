import { describe, expect, it } from "vitest";
import { centroide, puntosSvg } from "./poligono";

const cuadrado = [[0.2, 0.2], [0.6, 0.2], [0.6, 0.6], [0.2, 0.6]] as const;

describe("poligono", () => {
  it("puntosSvg une los vértices en formato del atributo points", () => {
    expect(puntosSvg(cuadrado)).toBe("0.2,0.2 0.6,0.2 0.6,0.6 0.2,0.6");
  });

  it("centroide de un cuadrado es su centro", () => {
    const [x, y] = centroide(cuadrado);
    expect(x).toBeCloseTo(0.4);
    expect(y).toBeCloseTo(0.4);
  });

  it("centroide de un triángulo es la media de sus vértices", () => {
    const [x, y] = centroide([[0, 0], [0.6, 0], [0, 0.3]]);
    expect(x).toBeCloseTo(0.2);
    expect(y).toBeCloseTo(0.1);
  });

  it("centroide de un polígono degenerado (área 0) es la media de vértices", () => {
    const [x, y] = centroide([[0.1, 0.1], [0.3, 0.3], [0.5, 0.5]]);
    expect(x).toBeCloseTo(0.3);
    expect(y).toBeCloseTo(0.3);
  });
});

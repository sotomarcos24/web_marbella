import { describe, expect, it } from "vitest";
import { palette, textPairs } from "@/config/theme";
import { blend, contrastRatio } from "@/lib/contrast";

const AA = { normal: 4.5, large: 3 };

describe("contrastRatio", () => {
  it("negro sobre blanco es 21 y un color sobre sí mismo es 1", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#C2603E", "#C2603E")).toBeCloseTo(1, 5);
  });

  it("es simétrica y admite minúsculas", () => {
    expect(contrastRatio("#2b2420", "#F7F2EA")).toBeCloseTo(contrastRatio("#F7F2EA", "#2B2420"), 10);
  });

  it("coincide con el valor de referencia de WCAG (#767676 sobre blanco ≈ 4.54)", () => {
    expect(contrastRatio("#767676", "#FFFFFF")).toBeCloseTo(4.54, 2);
  });
});

describe("blend", () => {
  it("mezcla un color con su opacidad sobre el fondo", () => {
    expect(blend("#000000", "#FFFFFF", 0.5)).toBe("#808080");
    expect(blend("#2B2420", "#F7F2EA", 1)).toBe("#2B2420");
    expect(blend("#2B2420", "#F7F2EA", 0)).toBe("#F7F2EA");
  });

  it("tinta al 60 % sobre cal no llega a AA (por eso no se usa)", () => {
    expect(contrastRatio(blend(palette.tinta, palette.cal, 0.6), palette.cal)).toBeLessThan(4.5);
  });
});

describe("contraste de la paleta", () => {
  it("el texto principal (tinta) sobre cal cumple AA", () => {
    expect(contrastRatio(palette.tinta, palette.cal)).toBeGreaterThanOrEqual(AA.normal);
  });

  it("el borde de los campos (tinta/60) llega a 3:1 sobre cal (WCAG 1.4.11)", () => {
    expect(contrastRatio(blend(palette.tinta, palette.cal, 0.6), palette.cal)).toBeGreaterThanOrEqual(3);
  });

  it("hay pares de texto sobre cal y sobre noche", () => {
    const backgrounds = new Set(textPairs.map((pair) => pair.background));
    expect(backgrounds).toContain("cal");
    expect(backgrounds).toContain("noche");
  });

  it.each(
    textPairs.map(
      (pair) => [`${pair.text}${pair.opacity ? `/${pair.opacity * 100}` : ""} sobre ${pair.background} (${pair.size})`, pair] as const,
    ),
  )("%s cumple AA", (_, { text, background, size, opacity = 1 }) => {
    const color = blend(palette[text], palette[background], opacity);
    expect(contrastRatio(color, palette[background])).toBeGreaterThanOrEqual(AA[size]);
  });
});

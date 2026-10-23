import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";

interface Fuente {
  path: string;
  weight: string;
  style: string;
}
interface Opciones {
  src: Fuente[];
  variable: string;
  display: string;
}

const local = vi.hoisted(() => ({
  default: vi.fn(({ variable }: { variable: string }) => ({ className: "c", variable: `v${variable}` })),
}));
vi.mock("next/font/local", () => local);

const { fontVariables } = await import("./fonts");
// Las fuentes se cargan al importar el módulo; se guardan las llamadas antes de que Vitest limpie los mocks.
const calls = local.default.mock.calls.map(([opciones]) => opciones as Opciones);
const porVariable = (variable: string) => {
  const opciones = calls.find((c) => c.variable === variable);
  if (!opciones) throw new Error(`Sin fuente para ${variable}`);
  return opciones;
};

const fuenteDir = resolve(process.cwd(), "src/config");

describe("fuentes locales (sin conexión)", () => {
  it("no depende de Google Fonts", () => {
    expect(readFileSync(resolve(fuenteDir, "fonts.ts"), "utf8")).not.toContain("next/font/google");
  });

  it("carga Cormorant Garamond de @fontsource, normal y cursiva, en --font-cormorant", () => {
    const { src, display } = porVariable("--font-cormorant");
    expect(display).toBe("swap");
    expect(src.every((f) => f.path.includes("@fontsource-variable/cormorant-garamond/"))).toBe(true);
    expect(new Set(src.map((f) => f.style))).toEqual(new Set(["normal", "italic"]));
  });

  it("carga DM Sans de @fontsource en --font-dm-sans", () => {
    const { src, display } = porVariable("--font-dm-sans");
    expect(display).toBe("swap");
    expect(src.length).toBeGreaterThan(0);
    expect(src.every((f) => f.path.includes("@fontsource-variable/dm-sans/"))).toBe(true);
  });

  it("fuentes variables que cubren los pesos que usa la web (300–600) y los archivos existen", () => {
    for (const { src } of calls) {
      for (const { path, weight } of src) {
        const [min = 0, max = 0] = weight.split(" ").map(Number);
        expect(min, path).toBeLessThanOrEqual(300);
        expect(max, path).toBeGreaterThanOrEqual(600);
        expect(existsSync(resolve(fuenteDir, path)), path).toBe(true);
      }
    }
  });

  it("expone las clases de ambas variables para el <html>", () => {
    expect(fontVariables.split(" ").sort()).toEqual(["v--font-cormorant", "v--font-dm-sans"]);
  });
});

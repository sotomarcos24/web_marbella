import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Cierre de la Fase 1 (#19): README y tabla de pendientes al día con el código.
const root = join(__dirname, "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

// Mismo descubrimiento que src/app/api/dev/routes.test.ts: cualquier herramienta nueva debe documentarse.
const aRuta = (archivo: string) => archivo.replace(/^\/src\/app(\/\[locale\])?/, "").replace(/\/(page|route)\.tsx?$/, "");
const herramientas = [
  ...Object.keys(import.meta.glob("/src/app/*/dev/**/page.tsx")),
  ...Object.keys(import.meta.glob("/src/app/api/dev/**/route.ts")),
]
  .map(aRuta)
  .sort();

/** Primera celda de cada fila de tabla que empieza por una ruta entre comillas invertidas. */
const rutasEnTabla = (md: string) =>
  [...md.matchAll(/^\| `(\/[^`]+)` \|/gm)].map(([, ruta]) => ruta).sort();

describe("README", () => {
  const readme = read("README.md");

  it("la tabla de /dev documenta exactamente las herramientas que existen", () => {
    expect(herramientas.length).toBeGreaterThan(0);
    expect(rutasEnTabla(readme)).toEqual(herramientas);
  });

  it("avisa de que /dev solo funciona en desarrollo (404 en producción)", () => {
    expect(readme).toContain("npm run dev");
    expect(readme).toMatch(/404 en producción/);
  });

  it("enlaza la tabla de pendientes", () => {
    expect(readme).toContain("docs/pendientes.md");
  });
});

describe("docs/pendientes.md", () => {
  const filas = read("docs/pendientes.md")
    .split("\n")
    .filter((l) => l.startsWith("|"));

  // Pendientes que exige el issue #19 (incluye docs/vision.md §7).
  it.each([
    "Inscripción turística",
    "Coordenadas",
    "Dormitorios de villa-1",
    "Aérea limpia del conjunto",
    "Vídeos de transición",
    "Tarifas estimadas",
    "Limpieza diaria",
    "Pack desayuno",
    "Foto nocturna",
    "Fotos de servicios",
    "Textos editoriales",
    "Reseñas reales",
    "Acceso a Pletor",
    "Fotos del fotógrafo profesional",
  ])("tiene una fila para «%s»", (pendiente) => {
    expect(filas.some((f) => f.includes(pendiente))).toBe(true);
  });
});

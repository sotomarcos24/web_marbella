import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { palette } from "@/config/theme";

const css = readFileSync(join(__dirname, "..", "src/app/globals.css"), "utf8");

// Bloque @theme de Tailwind v4 (con o sin "inline").
const theme = /@theme(?:\s+inline)?\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
const variable = (name: string) => new RegExp(`--${name}:\\s*([^;]+);`).exec(theme)?.[1]?.trim();

describe("tokens de diseño", () => {
  it.each([
    ["cal", "#F7F2EA"],
    ["arena", "#E6D3B3"],
    ["terracota", "#C2603E"],
    ["oliva", "#6B7350"],
    ["mar", "#1F3A4D"],
    ["tinta", "#2B2420"],
    ["noche", "#14110F"],
  ])("--color-%s vale %s en globals.css y en theme.ts", (name, hex) => {
    expect(variable(`color-${name}`)?.toUpperCase()).toBe(hex);
    expect(palette[name as keyof typeof palette]).toBe(hex);
  });

  it("el CSS y theme.ts tienen los mismos colores", () => {
    const css = [...theme.matchAll(/--color-([a-z]+):/g)].map(([, name]) => name);
    expect(css.sort()).toEqual(Object.keys(palette).sort());
  });

  it("las familias usan las variables de next/font", () => {
    expect(variable("font-display")).toMatch(/^var\(--font-cormorant\)/);
    expect(variable("font-sans")).toMatch(/^var\(--font-dm-sans\)/);
  });
});

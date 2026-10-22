import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { siteConfig } from "@/config/site";

const root = join(__dirname, "..");
const SITE_CONFIG = "src/config/site.ts";

function files(dir: string): string[] {
  if (!existsSync(dir)) return []; // p. ej. scripts/, que aún no existe.
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)));
}

describe("marca", () => {
  it("site.ts define nombre, email y teléfono", () => {
    expect(siteConfig.name).toBe(["Soto", "Village", "Marbella"].join(" "));
    expect(siteConfig.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    expect(siteConfig.phone).toMatch(/^\+\d[\d ]+$/);
  });

  it("el nombre de la marca solo está escrito en src/config/site.ts", () => {
    const name = siteConfig.name.toLowerCase();
    const offenders = ["src", "scripts", "tests"]
      .flatMap((dir) => files(join(root, dir)))
      .filter((file) => file !== SITE_CONFIG)
      .filter((file) => readFileSync(join(root, file), "utf8").toLowerCase().includes(name));
    expect(offenders).toEqual([]);
  });
});

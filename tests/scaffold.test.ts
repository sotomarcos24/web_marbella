import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import ts from "typescript";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..");
const read = (file: string) => readFileSync(join(root, file), "utf8");

describe("scaffold", () => {
  it("tsconfig es estricto y define el alias @/*", () => {
    const { config, error } = ts.readConfigFile(join(root, "tsconfig.json"), ts.sys.readFile);
    expect(error).toBeUndefined();
    const { compilerOptions } = config;
    expect(compilerOptions.strict).toBe(true);
    expect(compilerOptions.noUncheckedIndexedAccess).toBe(true);
    expect(compilerOptions.paths["@/*"]).toEqual(["./src/*"]);
  });

  it.each(["app", "components", "config", "content", "i18n", "lib", "messages", "types"])(
    "existe src/%s",
    (dir) => {
      const path = join(root, "src", dir);
      expect(existsSync(path) && statSync(path).isDirectory()).toBe(true);
    },
  );

  it("package.json define los scripts del proyecto", () => {
    const { scripts } = JSON.parse(read("package.json"));
    for (const name of ["dev", "build", "lint", "typecheck", "test"]) {
      expect(scripts, name).toHaveProperty(name);
    }
  });

  it(".gitignore mantiene imgs/ y excluye dependencias y build", () => {
    for (const path of ["imgs/villa-1/statics/x.jpg", "node_modules/x", ".next/x"]) {
      // git check-ignore sale con código 1 (y execFileSync lanza) si la ruta no está ignorada.
      expect(() => execFileSync("git", ["check-ignore", "-q", path], { cwd: root }), path).not.toThrow();
    }
  });

  it("README documenta los comandos", () => {
    const readme = read("README.md");
    for (const cmd of ["dev", "build", "lint", "typecheck", "test"]) {
      expect(readme).toContain(`npm run ${cmd}`);
    }
  });
});

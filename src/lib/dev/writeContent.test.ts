import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolveContentPath, writeContent } from "@/lib/dev/writeContent";

let contentDir: string;

beforeEach(async () => {
  vi.stubEnv("NODE_ENV", "development");
  contentDir = await mkdtemp(path.join(tmpdir(), "content-"));
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(contentDir, { recursive: true, force: true });
});

const RUTAS_PROHIBIDAS = ["", "../x.json", "a/../../x.json", "zonas/../villas.json", "..\\x.json", "/etc/x.json"];

describe("resolveContentPath", () => {
  it("resuelve rutas relativas dentro de la carpeta de contenido", () => {
    expect(resolveContentPath("zonas/villa-1.json", contentDir)).toBe(path.join(contentDir, "zonas", "villa-1.json"));
  });

  it("por defecto apunta a src/content", () => {
    expect(resolveContentPath("villas.json")).toBe(path.join(process.cwd(), "src", "content", "villas.json"));
  });

  it.each(RUTAS_PROHIBIDAS)("rechaza %j", (ruta) => {
    expect(() => resolveContentPath(ruta, contentDir)).toThrow();
  });
});

describe("writeContent", () => {
  it("escribe texto tal cual", async () => {
    await writeContent("notas.txt", "hola", contentDir);
    expect(await readFile(path.join(contentDir, "notas.txt"), "utf8")).toBe("hola");
  });

  it("serializa objetos como JSON con 2 espacios y salto final, creando carpetas", async () => {
    await writeContent("zonas/villa-1.json", { id: "salon" }, contentDir);
    expect(await readFile(path.join(contentDir, "zonas", "villa-1.json"), "utf8")).toBe('{\n  "id": "salon"\n}\n');
  });

  it.each(RUTAS_PROHIBIDAS)("rechaza %j sin escribir nada", async (ruta) => {
    await expect(writeContent(ruta, "x", contentDir)).rejects.toThrow();
    expect(await readdir(contentDir)).toEqual([]);
  });

  it("se niega a escribir fuera de desarrollo", async () => {
    vi.stubEnv("NODE_ENV", "production");
    await expect(writeContent("villas.json", "x", contentDir)).rejects.toThrow();
    expect(await readdir(contentDir)).toEqual([]);
  });
});

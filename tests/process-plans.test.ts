// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { processPlans } from "../scripts/process-plans";
import { PLANTAS, photosConfig, type PhotosConfig, type Plano, type Recorte } from "../scripts/photos.config";
import { recorteValido } from "../scripts/process-photos";
import { validarPoligono } from "@/lib/validation/villa";

let raiz: string;
let origen: string;
let destino: string;

const mitadIzq: Recorte = { left: 0, top: 0, width: 0.5, height: 1 };
const mitadDer: Recorte = { left: 0.5, top: 0, width: 0.5, height: 1 };

const baseConfig: PhotosConfig = {
  villas: ["villa1", "villa3"],
  webp: { quality: 80, maxWidth: 1920 },
  exclusiones: [],
  pendientesEdicion: [],
  recortes: {},
  planos: {
    villa1: {
      archivo: "villa1_027_1.jpg",
      plantas: { "planta-baja": { recorte: mitadDer }, "planta-alta": { recorte: mitadIzq } },
    },
  },
};

const conPlantas = (plantas: Plano["plantas"]): PhotosConfig => ({
  ...baseConfig,
  planos: { villa1: { ...baseConfig.planos.villa1!, plantas } },
});

async function jpg(ruta: string, width = 400, height = 200) {
  mkdirSync(path.dirname(ruta), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: "#c33" } }).jpeg().toFile(ruta);
}

const plano = (villa = "villa1", archivo = "villa1_027_1.jpg") => path.join(origen, villa, "statics", archivo);
const sha = (ruta: string) => createHash("sha256").update(readFileSync(ruta)).digest("hex");
const salida = (villa: string) => {
  try {
    return readdirSync(path.join(destino, villa)).sort();
  } catch {
    return [];
  }
};

async function pixel(ruta: string, x: number, y: number) {
  const { data, info } = await sharp(ruta).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]] as const;
}

beforeEach(() => {
  raiz = mkdtempSync(path.join(tmpdir(), "plans-"));
  origen = path.join(raiz, "imgs");
  destino = path.join(raiz, "out");
});
afterEach(() => rmSync(raiz, { recursive: true, force: true }));

describe("process-plans", () => {
  it("genera planta-baja.webp y planta-alta.webp en destino/<villa>/", async () => {
    await jpg(plano());
    const informe = await processPlans({ origen, destino, config: baseConfig });
    expect(salida("villa1")).toEqual(["planta-alta.webp", "planta-baja.webp"]);
    expect(informe.generadas).toHaveLength(2);
    const meta = await sharp(path.join(destino, "villa1/planta-baja.webp")).metadata();
    expect(meta.format).toBe("webp");
  });

  it("aplica el recorte normalizado de cada planta", async () => {
    await jpg(plano(), 400, 200);
    const config = conPlantas({
      "planta-baja": { recorte: { left: 0.25, top: 0, width: 0.75, height: 0.5 } },
      "planta-alta": { recorte: { left: 0, top: 0.5, width: 0.25, height: 0.5 } },
    });
    await processPlans({ origen, destino, config });
    const baja = await sharp(path.join(destino, "villa1/planta-baja.webp")).metadata();
    const alta = await sharp(path.join(destino, "villa1/planta-alta.webp")).metadata();
    expect([baja.width, baja.height]).toEqual([300, 100]);
    expect([alta.width, alta.height]).toEqual([100, 100]);
  });

  it("rellena los polígonos `tapar` con el color de fondo y deja el resto intacto", async () => {
    await jpg(plano(), 400, 200);
    const config = conPlantas({
      "planta-baja": {
        recorte: { left: 0, top: 0, width: 1, height: 1 },
        // Tapa el cuarto superior izquierdo (logo).
        tapar: [[[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]]],
      },
      "planta-alta": { recorte: mitadDer },
    });
    await processPlans({ origen, destino, config });
    const ruta = path.join(destino, "villa1/planta-baja.webp");
    const [r, g, b] = await pixel(ruta, 50, 50);
    expect(Math.min(r!, g!, b!)).toBeGreaterThan(240);
    const [r2, , b2] = await pixel(ruta, 350, 150);
    expect(r2!).toBeGreaterThan(150);
    expect(b2!).toBeLessThan(100);
  });

  it("un recorte inviable marca la planta como descartada sin salida", async () => {
    await jpg(plano());
    const config = conPlantas({
      "planta-baja": { recorte: { left: 0.8, top: 0, width: 0.5, height: 1 } },
      "planta-alta": { recorte: mitadIzq },
    });
    const informe = await processPlans({ origen, destino, config });
    expect(salida("villa1")).toEqual(["planta-alta.webp"]);
    expect(informe.descartadas).toEqual([
      expect.objectContaining({ villa: "villa1", planta: "planta-baja", motivo: expect.stringMatching(/recorte/i) }),
    ]);
  });

  it("una villa sin plano en origen se omite sin error", async () => {
    const informe = await processPlans({ origen, destino, config: baseConfig });
    expect(salida("villa1")).toEqual([]);
    expect(informe.omitidas).toEqual([expect.objectContaining({ villa: "villa1", archivo: "villa1_027_1.jpg" })]);
    expect(informe.generadas).toHaveLength(0);
  });

  it("no modifica el original (checksum)", async () => {
    await jpg(plano());
    const antes = sha(plano());
    await processPlans({ origen, destino, config: baseConfig });
    expect(sha(plano())).toBe(antes);
    expect(readdirSync(path.join(origen, "villa1/statics"))).toEqual(["villa1_027_1.jpg"]);
  });

  it("no supera maxWidth", async () => {
    await jpg(plano(), 6000, 1000);
    await processPlans({ origen, destino, config: baseConfig });
    const meta = await sharp(path.join(destino, "villa1/planta-baja.webp")).metadata();
    expect(meta.width).toBe(1920);
  });
});

describe("photosConfig.planos", () => {
  const esperados = {
    villa1: "villa1_027_1.jpg",
    villa3: "villa3_029_1.jpg",
    villa4: "villa4_025_1.jpg",
    villa5: "villa5_024_1.jpg",
  };

  it("configura el plano de las 4 villas", () => {
    expect(Object.fromEntries(Object.entries(photosConfig.planos).map(([v, p]) => [v, p.archivo]))).toEqual(esperados);
  });

  it.each(Object.keys(esperados))("%s: ambas plantas con recorte y polígonos válidos", (villa) => {
    for (const id of PLANTAS) {
      const { recorte, tapar = [] } = photosConfig.planos[villa]!.plantas[id];
      expect(recorteValido(recorte)).toBe(true);
      expect(tapar.flatMap((p, i) => validarPoligono(p, `${villa}.${id}.tapar[${i}]`))).toEqual([]);
    }
  });
});

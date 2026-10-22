// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { processPhotos } from "../scripts/process-photos";
import type { PhotosConfig } from "../scripts/photos.config";

let raiz: string;
let origen: string;
let destino: string;

const baseConfig: PhotosConfig = {
  villas: ["villa1", "villa3"],
  webp: { quality: 80, maxWidth: 1920 },
  exclusiones: [],
  pendientesEdicion: ["mapa_villas_1_3_4_5_1.jpg"],
  recortes: {},
  planos: {},
};

async function jpg(ruta: string, width = 400, height = 200) {
  mkdirSync(path.dirname(ruta), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: "#c33" } }).jpeg().toFile(ruta);
}

const sha = (ruta: string) => createHash("sha256").update(readFileSync(ruta)).digest("hex");
const salida = (villa: string) => {
  try {
    return readdirSync(path.join(destino, villa)).sort();
  } catch {
    return [];
  }
};

beforeEach(() => {
  raiz = mkdtempSync(path.join(tmpdir(), "photos-"));
  origen = path.join(raiz, "imgs");
  destino = path.join(raiz, "out");
});
afterEach(() => rmSync(raiz, { recursive: true, force: true }));

describe("process-photos", () => {
  it("convierte solo statics/*.jpg a WebP en destino/<villa>/", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "villa3/statics/villa3_002.jpg"));
    await processPhotos({ origen, destino, config: baseConfig });
    expect(salida("villa1")).toEqual(["villa1_001.webp"]);
    expect(salida("villa3")).toEqual(["villa3_002.webp"]);
  });

  it("ignora movement/ y ficheros que no son jpg en statics/", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "villa1/movement/villa1_mov.jpg"));
    writeFileSync(path.join(origen, "villa1/statics/notas.txt"), "x");
    writeFileSync(path.join(origen, "villa1/statics/clip.mp4"), "x");
    const informe = await processPhotos({ origen, destino, config: baseConfig });
    expect(salida("villa1")).toEqual(["villa1_001.webp"]);
    expect(informe.procesadas).toHaveLength(1);
  });

  it("no toca imgs/idea_para_web.mp4 ni nada fuera de <villa>/statics", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "conjunto/suelta.jpg"));
    writeFileSync(path.join(origen, "idea_para_web.mp4"), "x");
    await processPhotos({ origen, destino, config: baseConfig });
    expect(readdirSync(destino)).toEqual(["villa1"]);
  });

  it("no modifica los originales (checksum)", async () => {
    const a = path.join(origen, "villa1/statics/villa1_001.jpg");
    const b = path.join(origen, "villa1/statics/mapa_villas_1_3_4_5_1.jpg");
    await jpg(a);
    await jpg(b);
    const antes = [sha(a), sha(b)];
    await processPhotos({ origen, destino, config: baseConfig });
    expect([sha(a), sha(b)]).toEqual(antes);
    expect(readdirSync(path.join(origen, "villa1/statics")).sort()).toEqual([
      "mapa_villas_1_3_4_5_1.jpg",
      "villa1_001.jpg",
    ]);
  });

  it("la lista de exclusión configurable aparta fotos con su motivo", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "villa1/statics/villa1_010.jpg"));
    const config = { ...baseConfig, exclusiones: [{ archivo: "villa1_010.jpg", motivo: "rótulo 5G" }] };
    const informe = await processPhotos({ origen, destino, config });
    expect(salida("villa1")).toEqual(["villa1_001.webp"]);
    expect(informe.descartadas).toEqual([{ villa: "villa1", archivo: "villa1_010.jpg", motivo: "rótulo 5G" }]);
  });

  it("aparta el mapa del conjunto como pendiente de edición y no lo publica", async () => {
    await jpg(path.join(origen, "villa1/statics/mapa_villas_1_3_4_5_1.jpg"));
    await jpg(path.join(origen, "villa3/statics/mapa_villas_1_3_4_5_1.jpg"));
    const informe = await processPhotos({ origen, destino, config: baseConfig });
    expect(salida("villa1")).toEqual([]);
    expect(salida("villa3")).toEqual([]);
    expect(informe.apartadas).toHaveLength(2);
    expect(informe.apartadas[0]?.motivo).toBe("pendiente de edición");
    expect(informe.procesadas).toHaveLength(0);
  });

  it("aparta los planos configurados y no los publica enteros", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "villa1/statics/villa1_027_1.jpg"));
    const recorte = { recorte: { left: 0, top: 0, width: 1, height: 1 } };
    const config: PhotosConfig = {
      ...baseConfig,
      planos: {
        villa1: { archivo: "villa1_027_1.jpg", plantas: { "planta-baja": recorte, "planta-alta": recorte } },
      },
    };
    const informe = await processPhotos({ origen, destino, config });
    expect(salida("villa1")).toEqual(["villa1_001.webp"]);
    expect(informe.apartadas).toEqual([
      expect.objectContaining({ villa: "villa1", archivo: "villa1_027_1.jpg", motivo: expect.stringMatching(/plano/i) }),
    ]);
  });

  it("recorta por coordenadas normalizadas", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"), 400, 200);
    const config = {
      ...baseConfig,
      recortes: { "villa1/villa1_001.jpg": { left: 0, top: 0, width: 0.5, height: 0.5 } },
    };
    await processPhotos({ origen, destino, config });
    const meta = await sharp(path.join(destino, "villa1/villa1_001.webp")).metadata();
    expect([meta.width, meta.height]).toEqual([200, 100]);
  });

  it("un recorte inviable marca la foto como descartada sin salida", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    const config = {
      ...baseConfig,
      recortes: { "villa1/villa1_001.jpg": { left: 0.8, top: 0, width: 0.5, height: 1 } },
    };
    const informe = await processPhotos({ origen, destino, config });
    expect(salida("villa1")).toEqual([]);
    expect(informe.descartadas).toHaveLength(1);
    expect(informe.descartadas[0]?.motivo).toMatch(/recorte/i);
  });

  it("el informe cuenta procesadas, apartadas y descartadas", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"));
    await jpg(path.join(origen, "villa1/statics/villa1_002.jpg"));
    await jpg(path.join(origen, "villa1/statics/mapa_villas_1_3_4_5_1.jpg"));
    await jpg(path.join(origen, "villa3/statics/villa3_001.jpg"));
    const config = { ...baseConfig, exclusiones: [{ archivo: "villa1_002.jpg", motivo: "placa con logo" }] };
    const informe = await processPhotos({ origen, destino, config });
    expect(informe.procesadas.map((e) => e.archivo).sort()).toEqual(["villa1_001.jpg", "villa3_001.jpg"]);
    expect(informe.apartadas).toHaveLength(1);
    expect(informe.descartadas).toHaveLength(1);
  });

  it("genera WebP válido y no supera maxWidth", async () => {
    await jpg(path.join(origen, "villa1/statics/villa1_001.jpg"), 3000, 1000);
    await processPhotos({ origen, destino, config: baseConfig });
    const meta = await sharp(path.join(destino, "villa1/villa1_001.webp")).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(1920);
  });
});

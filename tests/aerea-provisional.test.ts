// @vitest-environment node
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generarAerea, RECORTE_AEREA } from "../scripts/aerea-provisional";
import { recorteValido } from "../scripts/process-photos";

let raiz: string;
let origen: string;
let destino: string;

const ANCHO = 400;
const ALTO = 300;

/** Tablero de ajedrez de blanco y negro: máximo contraste, desaparece si se desenfoca. */
async function mapa(ruta: string) {
  mkdirSync(path.dirname(ruta), { recursive: true });
  const raw = Buffer.alloc(ANCHO * ALTO * 3);
  for (let y = 0; y < ALTO; y++) {
    for (let x = 0; x < ANCHO; x++) raw.fill(((x >> 2) + (y >> 2)) % 2 ? 255 : 0, (y * ANCHO + x) * 3, (y * ANCHO + x) * 3 + 3);
  }
  await sharp(raw, { raw: { width: ANCHO, height: ALTO, channels: 3 } }).jpeg({ quality: 95 }).toFile(ruta);
}

const original = () => path.join(origen, "villa4", "statics", "mapa_villas_1_3_4_5_1.jpg");
const sha = (ruta: string) => createHash("sha256").update(readFileSync(ruta)).digest("hex");

beforeEach(async () => {
  raiz = mkdtempSync(path.join(tmpdir(), "aerea-"));
  origen = path.join(raiz, "imgs");
  destino = path.join(raiz, "public", "images", "conjunto");
  await mapa(original());
});
afterEach(() => rmSync(raiz, { recursive: true, force: true }));

describe("aerea-provisional", () => {
  it("el recorte es válido y deja fuera la esquina del logo", () => {
    expect(recorteValido(RECORTE_AEREA)).toBe(true);
    expect(RECORTE_AEREA.left + RECORTE_AEREA.width).toBeLessThan(1);
  });

  it("escribe aerea-provisional.webp con el tamaño del recorte", async () => {
    const ruta = await generarAerea({ origen, destino });
    expect(ruta).toBe(path.join(destino, "aerea-provisional.webp"));
    const { format, width, height } = await sharp(ruta).metadata();
    expect(format).toBe("webp");
    expect(width).toBe(Math.round(RECORTE_AEREA.width * ANCHO));
    expect(height).toBe(Math.round(RECORTE_AEREA.height * ALTO));
  });

  it("desenfoca: el detalle de alto contraste (rótulos, marcadores) deja de ser legible", async () => {
    const ruta = await generarAerea({ origen, destino });
    const { channels } = await sharp(ruta).stats();
    expect(channels[0]!.stdev).toBeLessThan(10);
  });

  it("no modifica el original", async () => {
    const antes = sha(original());
    await generarAerea({ origen, destino });
    expect(sha(original())).toBe(antes);
  });

  it("falla con un mensaje claro si falta el mapa", async () => {
    await expect(generarAerea({ origen: path.join(raiz, "vacio"), destino })).rejects.toThrow(/mapa_villas_1_3_4_5_1\.jpg/);
  });
});

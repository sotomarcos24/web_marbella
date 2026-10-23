import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { aPixeles, recorteValido } from "./process-photos.ts";
import type { Recorte } from "./photos.config.ts";

// Aérea provisional del conjunto (Fase 2): el mapa original tiene marcadores, rótulos de villa y logo, así que se
// recorta (sin la esquina del logo) y se desenfoca hasta que nada sea legible. La aérea limpia, editada con IA,
// sustituirá a esta en la Fase 3. El original no se modifica.

const MAPA = path.join("villa4", "statics", "mapa_villas_1_3_4_5_1.jpg");
const SALIDA = "aerea-provisional.webp";

/** Sobre el mapa de 1920×1520: x 150–1450, y 200–1520. Deja fuera el logo y la mayor parte del triángulo naranja. */
export const RECORTE_AEREA: Recorte = { left: 150 / 1920, top: 200 / 1520, width: 1300 / 1920, height: 1320 / 1520 };

/** Sigma del desenfoque gaussiano, sobre el recorte a su tamaño original. */
export const DESENFOQUE = 45;

export async function generarAerea(opts: { origen: string; destino: string }): Promise<string> {
  const entrada = path.join(opts.origen, MAPA);
  if (!existsSync(entrada)) throw new Error(`Falta el mapa original: ${entrada} (mapa_villas_1_3_4_5_1.jpg)`);
  if (!recorteValido(RECORTE_AEREA)) throw new Error("Recorte de la aérea inviable");

  const { width = 0, height = 0 } = await sharp(entrada).metadata();
  mkdirSync(opts.destino, { recursive: true });
  const ruta = path.join(opts.destino, SALIDA);
  await sharp(entrada)
    .extract(aPixeles(RECORTE_AEREA, width, height))
    .blur(DESENFOQUE)
    .webp({ quality: 80 })
    .toFile(ruta);
  return ruta;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Origen opcional (`node scripts/aerea-provisional.ts <carpeta imgs>`): en un worktree `imgs/` está en la carpeta principal.
  const origen = process.argv[2] ?? "imgs";
  console.log(`Generada ${await generarAerea({ origen, destino: "public/images/conjunto" })}`);
}

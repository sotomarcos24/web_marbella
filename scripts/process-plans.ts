import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { PLANTAS, photosConfig, type PhotosConfig, type PlantaId } from "./photos.config.ts";
import { aPixeles, recorteValido } from "./process-photos.ts";
import type { Poligono } from "../src/types/villa.ts";

export type EntradaPlano = { villa: string; archivo: string; planta?: PlantaId; motivo?: string };
export type InformePlanos = { generadas: EntradaPlano[]; omitidas: EntradaPlano[]; descartadas: EntradaPlano[] };

/** SVG del tamaño de la imagen con los polígonos rellenos de `fondo`. */
function mascara(poligonos: Poligono[], fondo: string, width: number, height: number) {
  const formas = poligonos
    .map((p) => `<polygon points="${p.map(([x, y]) => `${x * width},${y * height}`).join(" ")}" fill="${fondo}"/>`)
    .join("");
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${formas}</svg>`);
}

export async function processPlans(opts: {
  origen: string;
  destino: string;
  config: PhotosConfig;
}): Promise<InformePlanos> {
  const { origen, destino, config } = opts;
  const informe: InformePlanos = { generadas: [], omitidas: [], descartadas: [] };

  for (const [villa, { archivo, fondo = "#ffffff", plantas }] of Object.entries(config.planos)) {
    const ruta = path.join(origen, villa, "statics", archivo);
    if (!existsSync(ruta)) {
      informe.omitidas.push({ villa, archivo, motivo: "plano ausente" });
      continue;
    }
    // Se decodifica una sola vez por villa; cada planta parte de los píxeles en bruto.
    const original = await sharp(ruta).raw().toBuffer({ resolveWithObject: true });
    const { width, height } = original.info;
    mkdirSync(path.join(destino, villa), { recursive: true });

    for (const planta of PLANTAS) {
      const entrada = { villa, archivo, planta };
      const { recorte, tapar = [] } = plantas[planta];
      if (!recorteValido(recorte)) {
        informe.descartadas.push({ ...entrada, motivo: "recorte inviable" });
        continue;
      }
      // Tapar antes de recortar (sharp aplica `extract` antes que `composite`): los polígonos van sobre la imagen original.
      const { data, info } = tapar.length
        ? await sharp(original.data, { raw: original.info })
            .composite([{ input: mascara(tapar, fondo, width, height) }])
            .raw()
            .toBuffer({ resolveWithObject: true })
        : original;

      await sharp(data, { raw: info })
        .extract(aPixeles(recorte, width, height))
        .resize({ width: config.webp.maxWidth, withoutEnlargement: true })
        .webp({ quality: config.webp.quality })
        .toFile(path.join(destino, villa, `${planta}.webp`));
      informe.generadas.push(entrada);
    }
  }
  return informe;
}

export function formatInformePlanos(informe: InformePlanos): string {
  const linea = (e: EntradaPlano) => `  - ${e.villa}/${e.planta ?? e.archivo}${e.motivo ? `: ${e.motivo}` : ""}`;
  return [
    `generadas ${informe.generadas.length} · omitidas ${informe.omitidas.length} · descartadas ${informe.descartadas.length}`,
    ...[...informe.omitidas, ...informe.descartadas].map(linea),
  ].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const informe = await processPlans({ origen: "imgs", destino: "public/images/villas", config: photosConfig });
  console.log(formatInformePlanos(informe));
}

import { mkdirSync, readdirSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";
import { aWebp, carpetaPublica, photosConfig, type PhotosConfig, type Recorte } from "./photos.config.ts";

export type Entrada = { villa: string; archivo: string; motivo?: string };
export type Informe = { procesadas: Entrada[]; apartadas: Entrada[]; descartadas: Entrada[] };

const PENDIENTE = "pendiente de edición";
const PLANO = "plano: ver process-plans";

export function recorteValido({ left, top, width, height }: Recorte) {
  return left >= 0 && top >= 0 && width > 0 && height > 0 && left + width <= 1 && top + height <= 1;
}

/** Píxeles de un recorte normalizado sobre una imagen de `width`×`height`. */
export function aPixeles({ left, top, width: w, height: h }: Recorte, width: number, height: number) {
  return {
    left: Math.round(left * width),
    top: Math.round(top * height),
    width: Math.round(w * width),
    height: Math.round(h * height),
  };
}

export async function processPhotos(opts: {
  origen: string;
  destino: string;
  config: PhotosConfig;
}): Promise<Informe> {
  const { origen, destino, config } = opts;
  const informe: Informe = { procesadas: [], apartadas: [], descartadas: [] };

  for (const villa of config.villas) {
    let archivos: string[];
    try {
      archivos = readdirSync(path.join(origen, villa, "statics")).filter((f) => /\.jpe?g$/i.test(f)).sort();
    } catch {
      continue;
    }
    const salida = path.join(destino, carpetaPublica(villa));

    for (const archivo of archivos) {
      const entrada = { villa, archivo };
      if (config.pendientesEdicion.includes(archivo)) {
        informe.apartadas.push({ ...entrada, motivo: PENDIENTE });
        continue;
      }
      if (config.planos[villa]?.archivo === archivo) {
        informe.apartadas.push({ ...entrada, motivo: PLANO });
        continue;
      }
      const exclusion = config.exclusiones.find((e) => e.archivo === archivo);
      if (exclusion) {
        informe.descartadas.push({ ...entrada, motivo: exclusion.motivo });
        continue;
      }

      let imagen = sharp(path.join(origen, villa, "statics", archivo));
      const recorte = config.recortes[`${villa}/${archivo}`];
      if (recorte) {
        if (!recorteValido(recorte)) {
          informe.descartadas.push({ ...entrada, motivo: "recorte inviable" });
          continue;
        }
        const { width = 0, height = 0 } = await imagen.metadata();
        imagen = imagen.extract(aPixeles(recorte, width, height));
      }

      mkdirSync(salida, { recursive: true });
      await imagen
        .resize({ width: config.webp.maxWidth, withoutEnlargement: true })
        .webp({ quality: config.webp.quality })
        .toFile(path.join(salida, aWebp(archivo)));
      informe.procesadas.push(entrada);
    }
  }
  return informe;
}

export function formatInforme(informe: Informe, villas: string[]): string {
  const filas = villas.map((v) => {
    const n = (l: Entrada[]) => l.filter((e) => e.villa === v).length;
    return `${v.padEnd(8)} procesadas ${n(informe.procesadas)} · apartadas ${n(informe.apartadas)} · descartadas ${n(informe.descartadas)}`;
  });
  const detalle = [...informe.apartadas, ...informe.descartadas].map((e) => `  - ${e.villa}/${e.archivo}: ${e.motivo}`);
  return [...filas, ...detalle].join("\n");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const informe = await processPhotos({
    origen: "imgs",
    destino: "public/images/villas",
    config: photosConfig,
  });
  console.log(formatInforme(informe, photosConfig.villas));
}

import { readFile } from "node:fs/promises";
import { fotos } from "@/content/fotos";
import { type Asignacion, type Destino, destinosVilla, leerAsignacion, type VillaFotos } from "@/lib/dev/fotosAsignacion";
import { resolveContentPath } from "@/lib/dev/writeContent";
import { catalogoZonas } from "@/lib/dev/zonasImagenes";
import type { ImagenZonas } from "@/lib/dev/zonasSalida";
import type { VillaId } from "@/types/villa";

// Datos de /dev/fotos (solo servidor): estancias de los planos guardados en /dev/zonas y asignaciones ya guardadas.

/** Estancias de los planos de la villa (JSON de /dev/zonas si existe, si no `villas.ts`) y los exteriores. */
function destinosDe(villa: VillaId, zonas: readonly ImagenZonas[]): Destino[] {
  const planos = zonas.filter((e) => e.tipo === "plano" && e.villaId === villa);
  return destinosVilla(planos.flatMap((p) => p.poligonos.map(({ id, nombre }) => ({ id, nombre }))));
}

export const destinosDeVilla = async (villa: VillaId) => destinosDe(villa, await catalogoZonas());

export const fotosDeVilla = (villa: VillaId) => fotos.filter((f) => f.villa === villa);

async function asignacionGuardada(villa: VillaId): Promise<Asignacion> {
  try {
    return leerAsignacion(JSON.parse(await readFile(resolveContentPath(`fotos/${villa}.json`), "utf8"))) ?? {};
  } catch {
    return {};
  }
}

export async function catalogoFotos(villas: readonly VillaId[]): Promise<VillaFotos[]> {
  const zonas = await catalogoZonas();
  return Promise.all(
    villas.map(async (villa) => ({
      villa,
      destinos: destinosDe(villa, zonas),
      fotos: fotosDeVilla(villa),
      asignacion: await asignacionGuardada(villa),
    })),
  );
}

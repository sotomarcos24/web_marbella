import { tarifaDeVilla } from "@/content/tarifas";
import { precioDesde } from "@/lib/precioDesde";
import type { Centimos } from "@/types/dinero";
import type { Conjunto, Poligono, Villa, VillaId } from "@/types/villa";

/** Datos de una parcela del mapa del conjunto y de su mini ficha (serializables, del servidor al cliente). */
export interface FichaVilla {
  id: VillaId;
  poligono: Poligono;
  /** Imagen donde termina T2: la misma que la cabecera de la villa. */
  portada: string;
  plazas: number;
  dormitorios: number;
  dormitoriosPendiente: boolean;
  precio: Centimos;
  precioEstimado: boolean;
}

export function fichasConjunto(conjunto: Conjunto, villas: readonly Villa[]): FichaVilla[] {
  return conjunto.parcelas.flatMap(({ villaId, poligono }) => {
    const villa = villas.find((v) => v.id === villaId);
    if (!villa) return [];
    const { importe, estimado } = precioDesde(tarifaDeVilla(villaId));
    return [
      {
        id: villaId,
        poligono,
        portada: villa.hero.imagenDia,
        plazas: villa.plazasMax,
        dormitorios: villa.dormitorios,
        dormitoriosPendiente: villa.pendientes.some((p) => p.campo === "dormitorios"),
        precio: importe,
        precioEstimado: estimado,
      },
    ];
  });
}

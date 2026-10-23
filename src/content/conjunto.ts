import { cargarConjunto } from "@/lib/content/cargar";
import type { Conjunto } from "@/types/villa";

/** Aérea del conjunto con la parcela de cada villa (JSON de /dev/zonas); null hasta dibujarla. */
export const conjunto: Conjunto | null = cargarConjunto();

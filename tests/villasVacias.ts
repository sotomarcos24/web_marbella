import { villas } from "@/content/villas";
import type { Villa } from "@/types/villa";

/** Las villas reales sin zonas, estancias, fotos ni destacadas: base neutra para tests que dibujan o validan desde cero. */
export const villasVacias: readonly Villa[] = villas.map((villa) => ({
  ...villa,
  hero: { ...villa.hero, zonas: [] },
  plantas: villa.plantas.map((planta) => ({ ...planta, estancias: [] })),
  exteriores: [],
  destacadas: [],
}));

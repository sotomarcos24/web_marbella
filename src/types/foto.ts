import type { routing } from "@/i18n/routing";
import type { VillaId } from "@/types/villa";

export type TipoFoto =
  | "salon"
  | "cocina"
  | "comedor"
  | "dormitorio"
  | "bano"
  | "piscina"
  | "jardin"
  | "porche"
  | "barbacoa"
  | "terraza"
  | "fachada"
  | "vistas"
  | "detalle";

/** Entrada del catálogo `src/content/fotos.ts` (SPEC §12). */
export interface Foto {
  villa: VillaId;
  /** Nombre del WebP en `public/images/villas/<villa>/`. */
  archivo: string;
  zona: "interior" | "exterior";
  tipo: TipoFoto;
  /** Id de estancia o exterior propuesto, p. ej. "dormitorio-2". */
  estanciaSugerida?: string;
  confianza: "alta" | "baja";
  /** Un texto por idioma de `routing.locales`. */
  alt: Record<(typeof routing.locales)[number], string>;
}

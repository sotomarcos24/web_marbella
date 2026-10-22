import type { Centimos } from "@/types/dinero";

/** Solo los servicios de SPEC §9 (sin traslados, despedidas, fotos ni spa). */
export type ServicioId =
  | "chef-privado"
  | "limpieza-diaria"
  | "compra-previa"
  | "pack-desayuno"
  | "decoracion-bienvenida"
  | "catamaran"
  | "calefaccion-piscina";

export type PrecioServicio =
  | { tipo: "fijo"; importe: Centimos }
  | { tipo: "porDia"; importe: Centimos }
  | { tipo: "porPersona"; adulto: Centimos; nino: Centimos; minimoComensales?: number }
  /** `base` cubre hasta `hasta` de importe; cada `tramo` más (o fracción) suma `incremento` (p. ej. compra previa). */
  | { tipo: "escalonado"; base: Centimos; hasta: Centimos; tramo: Centimos; incremento: Centimos }
  | { tipo: "bajoPresupuesto" };

/** Cada variante con precio propio de un servicio (p. ej. menú paella y menú barbacoa del chef). */
export interface OpcionServicio {
  id: string;
  /** Clave de traducción. */
  nombre: string;
  precio: PrecioServicio;
}

export interface Servicio {
  id: ServicioId;
  /** Claves de traducción. */
  nombre: string;
  descripcion: string;
  /** Al menos una; los servicios de precio único tienen una sola. */
  opciones: readonly OpcionServicio[];
  /** Precio o condiciones sin confirmar (p. ej. limpieza diaria). */
  provisional?: true;
  /** Fase 5: foto de previsualización; pendiente de fotos reales. */
  imagenPrevia?: string;
}

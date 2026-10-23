import type { Centimos } from "@/types/dinero";
import type { ServicioId } from "@/types/servicio";
import type { VillaId } from "@/types/villa";

/** Fecha de calendario en UTC, formato `YYYY-MM-DD`. */
export type FechaISO = string;

/**
 * Extra contratado. Los campos que se usan dependen del tipo de precio de la opción:
 * `fijo` → `cantidad` (1 por defecto) · `porDia` → `cantidad` de días (las noches por defecto) ·
 * `porPersona` → `adultos` y `ninos` · `escalonado` → `compra` (importe del ticket) · `bajoPresupuesto` → nada.
 */
export interface ExtraSolicitado {
  servicio: ServicioId;
  opcion: string;
  cantidad?: number;
  adultos?: number;
  ninos?: number;
  compra?: Centimos;
}

export interface SolicitudPrecio {
  villa: VillaId;
  entrada: FechaISO;
  salida: FechaISO;
  huespedes: number;
  mascotas?: number;
  extras?: readonly ExtraSolicitado[];
  /** Fecha de hoy: la calculadora no lee el reloj. */
  hoy: FechaISO;
}

/** Códigos de error; su texto está en `pricing.errores.*` de los mensajes. */
export const CODIGOS_ERROR = [
  "fechas-invalidas",
  "fecha-pasada",
  "estancia-minima",
  "estancia-maxima",
  "capacidad",
  "huespedes-invalidos",
  "mascotas-invalidas",
  "extra-invalido",
] as const;
export type CodigoError = (typeof CODIGOS_ERROR)[number];

/** Códigos de aviso; su texto está en `pricing.avisos.*` de los mensajes. */
export const CODIGOS_AVISO = [
  "oferta-invierno",
  "limpieza-cada-2-dias-incluida",
  "tarifa-estimada",
  "servicio-provisional",
  "servicio-bajo-presupuesto",
  "cancelacion-gratuita-vencida",
] as const;
export type CodigoAviso = (typeof CODIGOS_AVISO)[number];

export interface NochePrecio {
  /** Noche que empieza en esta fecha. */
  fecha: FechaISO;
  precio: Centimos;
  estimado?: true;
}

export interface SuplementoCalculado {
  /** Huéspedes del 13.º al 15.º que pagan suplemento. */
  personas: number;
  unitario: Centimos;
  total: Centimos;
  estimado?: true;
}

export interface ExtraCalculado {
  servicio: ServicioId;
  opcion: string;
  /** `null`: bajo presupuesto, no suma al total. */
  importe: Centimos | null;
}

export interface Pago {
  porcentaje: number;
  importe: Centimos;
  fecha: FechaISO;
}

export interface DesglosePrecio {
  tipo: "precio";
  noches: readonly NochePrecio[];
  alojamiento: Centimos;
  limpiezaFinal: Centimos;
  suplemento: SuplementoCalculado;
  mascotas: Centimos;
  extras: readonly ExtraCalculado[];
  /** IVA incluido; sin la fianza. */
  total: Centimos;
  /** Preautorizada aparte; no forma parte del total. */
  fianza: Centimos;
  pagos: readonly Pago[];
  /** `null` si el plazo ya ha vencido (lo explica el aviso `cancelacion-gratuita-vencida`). */
  cancelacionGratuitaHasta: FechaISO | null;
  avisos: readonly CodigoAviso[];
}

/** Estancia larga de invierno: no se da precio, se solicita oferta. */
export interface OfertaInvierno {
  tipo: "oferta-invierno";
  noches: number;
  avisos: readonly CodigoAviso[];
}

export interface ErrorPrecio {
  tipo: "error";
  errores: readonly CodigoError[];
}

export type ResultadoPrecio = DesglosePrecio | OfertaInvierno | ErrorPrecio;

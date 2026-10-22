import type { Centimos } from "@/types/dinero";
import type { VillaId } from "@/types/villa";

export type Mes = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface TarifaMes {
  precioNoche: Centimos;
  /** Precio aún sin confirmar (p. ej. julio de villa-3). */
  estimado?: true;
}

/** Suplemento por huésped (del 13.º al 15.º), por persona y estancia. */
export interface SuplementoHuesped {
  importe: Centimos;
  /** Meses en los que aplica; sin él, todo el año. */
  meses?: readonly Mes[];
  /** Importe aún sin confirmar. */
  estimado?: true;
}

/** Precio por noche según el mes de la noche, para un grupo de villas con la misma tabla. */
export interface Tarifa {
  villas: readonly VillaId[];
  meses: Readonly<Record<Mes, TarifaMes>>;
}

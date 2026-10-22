// Contrato de reservas (SPEC §11). El frontend solo usa `BookingProvider`;
// hoy lo implementa `MockBookingProvider`, en el futuro Hostaway + Stripe.
import type { CodigoError, DesglosePrecio, FechaISO, ResultadoPrecio, SolicitudPrecio } from "@/types/precio";
import type { VillaId } from "@/types/villa";

/** Rango semiabierto `[entrada, salida)`: la noche de `salida` queda libre. */
export interface RangoFechas {
  entrada: FechaISO;
  salida: FechaISO;
}

export interface Disponibilidad {
  libre: boolean;
  /** Rangos ocupados que se solapan con el pedido. */
  ocupados: readonly RangoFechas[];
}

/** De momento, lo mismo que una cotización; los datos del titular llegarán con el formulario. */
export type SolicitudReserva = SolicitudPrecio;

/** Códigos de error propios de la reserva; su texto está en `booking.errores.*` de los mensajes. */
export const CODIGOS_ERROR_RESERVA = ["fechas-ocupadas", "requiere-oferta"] as const;
export type CodigoErrorReserva = (typeof CODIGOS_ERROR_RESERVA)[number];

export interface Reserva extends RangoFechas {
  id: string;
  villa: VillaId;
  huespedes: number;
  desglose: DesglosePrecio;
}

export type ResultadoReserva =
  | { tipo: "reserva"; reserva: Reserva }
  | { tipo: "error"; errores: readonly (CodigoError | CodigoErrorReserva)[] };

export interface BookingProvider {
  disponibilidad(villa: VillaId, rango: RangoFechas): Promise<Disponibilidad>;
  cotizar(solicitud: SolicitudPrecio): Promise<ResultadoPrecio>;
  crearReserva(solicitud: SolicitudReserva): Promise<ResultadoReserva>;
}

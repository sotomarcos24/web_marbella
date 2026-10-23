import { calcularPrecio } from "@/lib/pricing";
import type { CodigoError, ResultadoPrecio, SolicitudPrecio } from "@/types/precio";
import type { VillaId } from "@/types/villa";
import ocupadosInventados from "./occupied.json";
import type {
  BookingProvider,
  CodigoErrorReserva,
  Disponibilidad,
  RangoFechas,
  ResultadoReserva,
  SolicitudReserva,
} from "./types";

export type Ocupados = Record<VillaId, readonly RangoFechas[]>;

interface Opciones {
  /** Por defecto, las fechas inventadas de `occupied.json`. */
  ocupados?: Ocupados;
  calcular?: (solicitud: SolicitudPrecio) => ResultadoPrecio;
}

// Rangos semiabiertos: comparar `YYYY-MM-DD` como texto equivale a comparar fechas.
export const seSolapan = (a: RangoFechas, b: RangoFechas) => a.entrada < b.salida && b.entrada < a.salida;

/** Reservas en memoria, sin red ni pagos: lo que se crea se pierde al recargar. */
export class MockBookingProvider implements BookingProvider {
  private ocupados: Ocupados;
  private readonly calcular: (solicitud: SolicitudPrecio) => ResultadoPrecio;
  private creadas = 0;

  constructor({ ocupados = ocupadosInventados, calcular = calcularPrecio }: Opciones = {}) {
    this.ocupados = ocupados;
    this.calcular = calcular;
  }

  async disponibilidad(villa: VillaId, rango: RangoFechas): Promise<Disponibilidad> {
    // Rango vacío o invertido: no se puede reservar, aunque no choque con nada.
    if (rango.entrada >= rango.salida) return { libre: false, ocupados: [] };
    const ocupados = this.ocupados[villa].filter((o) => seSolapan(o, rango));
    return { libre: ocupados.length === 0, ocupados };
  }

  async cotizar(solicitud: SolicitudPrecio): Promise<ResultadoPrecio> {
    return this.calcular(solicitud);
  }

  async crearReserva(solicitud: SolicitudReserva): Promise<ResultadoReserva> {
    const { villa, entrada, salida, huespedes } = solicitud;
    const precio = await this.cotizar(solicitud);

    const errores: (CodigoError | CodigoErrorReserva)[] = [];
    if (precio.tipo === "error") errores.push(...precio.errores);
    if (precio.tipo === "oferta-invierno") errores.push("requiere-oferta");
    const fechasInvalidas = precio.tipo === "error" && precio.errores.includes("fechas-invalidas");
    if (!fechasInvalidas && !(await this.disponibilidad(villa, { entrada, salida })).libre) {
      errores.push("fechas-ocupadas");
    }
    if (precio.tipo !== "precio" || errores.length > 0) return { tipo: "error", errores };

    // Actualización inmutable: no toca los datos recibidos en el constructor.
    this.ocupados = { ...this.ocupados, [villa]: [...this.ocupados[villa], { entrada, salida }] };
    this.creadas += 1;
    return {
      tipo: "reserva",
      reserva: { id: `mock-${this.creadas}`, villa, entrada, salida, huespedes, desglose: precio },
    };
  }
}

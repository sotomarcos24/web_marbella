import { importeEscalonado, servicios } from "@/content/servicios";
import { reglas, suplementosHuesped, tarifaDeVilla } from "@/content/tarifas";
import type { Centimos } from "@/types/dinero";
import type {
  CodigoAviso,
  CodigoError,
  ExtraCalculado,
  ExtraSolicitado,
  FechaISO,
  NochePrecio,
  Pago,
  ResultadoPrecio,
  SolicitudPrecio,
  SuplementoCalculado,
} from "@/types/precio";
import type { Mes } from "@/types/tarifa";

// Fechas como días desde la época Unix (UTC): sin horas ni zonas horarias.
const MS_DIA = 86_400_000;

/** Días UTC de una fecha `YYYY-MM-DD` válida; `null` si no lo es (p. ej. 30 de febrero). */
export function aDia(fecha: FechaISO): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha);
  if (!m) return null;
  const [a, me, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const ms = Date.UTC(a, me - 1, d);
  const f = new Date(ms);
  if (f.getUTCFullYear() !== a || f.getUTCMonth() !== me - 1 || f.getUTCDate() !== d) return null;
  return ms / MS_DIA;
}

const aFecha = (dia: number): FechaISO => new Date(dia * MS_DIA).toISOString().slice(0, 10);
const mesDe = (dia: number) => (new Date(dia * MS_DIA).getUTCMonth() + 1) as Mes;

const esEnteroNoNegativo = (n: number) => Number.isInteger(n) && n >= 0;
const esEnteroPositivo = (n: number) => Number.isInteger(n) && n > 0;

/** Valores de los marcadores `{…}` de los textos `pricing.*`: salen de `reglas`, no se repiten en los mensajes. */
export const valoresMensajes = {
  min: reglas.estancia.minNoches,
  max: reglas.estancia.maxNoches,
  plazas: reglas.plazasMax,
  dias: reglas.cancelacion.diasAntes,
} as const;

/** Importe de un extra; `null` si es bajo presupuesto; `undefined` si la solicitud no es válida. */
function importeExtra(extra: ExtraSolicitado, noches: number): Centimos | null | undefined {
  const opcion = servicios.find((s) => s.id === extra.servicio)?.opciones.find((o) => o.id === extra.opcion);
  if (!opcion) return undefined;
  const { precio } = opcion;
  switch (precio.tipo) {
    case "fijo":
    case "porDia": {
      const cantidad = extra.cantidad ?? (precio.tipo === "fijo" ? 1 : noches);
      return esEnteroPositivo(cantidad) ? precio.importe * cantidad : undefined;
    }
    case "porPersona": {
      const { adultos = 0, ninos = 0 } = extra;
      if (!esEnteroNoNegativo(adultos) || !esEnteroNoNegativo(ninos)) return undefined;
      if (adultos + ninos < (precio.minimoComensales ?? 1)) return undefined;
      return adultos * precio.adulto + ninos * precio.nino;
    }
    case "escalonado": {
      const { compra } = extra;
      return compra !== undefined && esEnteroPositivo(compra) ? importeEscalonado(precio, compra) : undefined;
    }
    case "bajoPresupuesto":
      return null;
  }
}

/** Desglose completo de una estancia (SPEC §8 y §10). Función pura: `hoy` llega como parámetro. */
export function calcularPrecio(solicitud: SolicitudPrecio): ResultadoPrecio {
  const { villa, huespedes, mascotas = 0, extras = [] } = solicitud;
  const errores: CodigoError[] = [];

  const entrada = aDia(solicitud.entrada);
  const salida = aDia(solicitud.salida);
  const hoy = aDia(solicitud.hoy);
  const totalNoches = entrada !== null && salida !== null ? Math.max(0, salida - entrada) : 0;
  if (hoy === null || totalNoches === 0) errores.push("fechas-invalidas");
  if (entrada !== null && hoy !== null && entrada < hoy) errores.push("fecha-pasada");
  if (totalNoches > 0 && totalNoches < reglas.estancia.minNoches) errores.push("estancia-minima");
  if (totalNoches > reglas.estancia.maxNoches) errores.push("estancia-maxima");

  if (!Number.isInteger(huespedes) || huespedes < 1) errores.push("huespedes-invalidos");
  else if (huespedes > reglas.plazasMax) errores.push("capacidad");
  if (!esEnteroNoNegativo(mascotas)) errores.push("mascotas-invalidas");

  const extrasCalculados: ExtraCalculado[] = [];
  for (const extra of extras) {
    const importe = importeExtra(extra, totalNoches);
    if (importe === undefined) errores.push("extra-invalido");
    else extrasCalculados.push({ servicio: extra.servicio, opcion: extra.opcion, importe });
  }

  if (errores.length > 0 || entrada === null || hoy === null) {
    return { tipo: "error", errores: [...new Set(errores)] };
  }

  const dias = Array.from({ length: totalNoches }, (_, i) => ({ dia: entrada + i, mes: mesDe(entrada + i) }));

  const mesesInvierno: readonly Mes[] = reglas.invierno.meses;
  if (dias.filter(({ mes }) => mesesInvierno.includes(mes)).length > reglas.invierno.nochesSobre) {
    return { tipo: "oferta-invierno", noches: totalNoches, avisos: ["oferta-invierno"] };
  }

  const tarifa = tarifaDeVilla(villa);
  const noches: NochePrecio[] = dias.map(({ dia, mes }) => {
    const { precioNoche, estimado } = tarifa.meses[mes];
    return { fecha: aFecha(dia), precio: precioNoche, ...(estimado && { estimado }) };
  });
  const alojamiento = noches.reduce((s, n) => s + n.precio, 0);

  const tramo = suplementosHuesped[villa].find((t) => !t.meses || dias.some(({ mes }) => t.meses?.includes(mes)));
  const personas = tramo ? Math.max(0, huespedes - (reglas.suplementoDesdeHuesped - 1)) : 0;
  const unitario = tramo?.importe ?? 0;
  const suplemento: SuplementoCalculado = {
    personas,
    unitario,
    total: personas * unitario,
    ...(personas > 0 && tramo?.estimado && { estimado: tramo.estimado }),
  };

  const importeMascotas = mascotas * reglas.mascota;
  const importeExtras = extrasCalculados.reduce((s, e) => s + (e.importe ?? 0), 0);
  const total = alojamiento + reglas.limpiezaFinal + suplemento.total + importeMascotas + importeExtras;

  const { porcentajeReserva, porcentajeResto, diasAntesResto } = reglas.pagos;
  const reserva = Math.round((total * porcentajeReserva) / 100);
  const pagos: Pago[] =
    entrada - hoy <= diasAntesResto
      ? [{ porcentaje: 100, importe: total, fecha: solicitud.hoy }]
      : [
          { porcentaje: porcentajeReserva, importe: reserva, fecha: solicitud.hoy },
          { porcentaje: porcentajeResto, importe: total - reserva, fecha: aFecha(entrada - diasAntesResto) },
        ];

  const limiteCancelacion = entrada - reglas.cancelacion.diasAntes;

  const avisos: CodigoAviso[] = ["limpieza-cada-2-dias-incluida"];
  if (noches.some((n) => n.estimado) || suplemento.estimado) avisos.push("tarifa-estimada");
  if (servicios.some((s) => s.provisional && extrasCalculados.some((e) => e.servicio === s.id))) {
    avisos.push("servicio-provisional");
  }
  if (extrasCalculados.some((e) => e.importe === null)) avisos.push("servicio-bajo-presupuesto");
  const cancelacionVencida = hoy > limiteCancelacion;
  if (cancelacionVencida) avisos.push("cancelacion-gratuita-vencida");

  return {
    tipo: "precio",
    noches,
    alojamiento,
    limpiezaFinal: reglas.limpiezaFinal,
    suplemento,
    mascotas: importeMascotas,
    extras: extrasCalculados,
    total,
    fianza: reglas.fianza,
    pagos,
    cancelacionGratuitaHasta: cancelacionVencida ? null : aFecha(limiteCancelacion),
    avisos,
  };
}

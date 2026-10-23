import type { Centimos } from "@/types/dinero";
import type { FechaISO } from "@/types/precio";

const euros = new Map<string, Intl.NumberFormat>();
const fechas = new Map<string, Intl.DateTimeFormat>();

function cached<T>(cache: Map<string, T>, locale: string, create: () => T): T {
  let f = cache.get(locale);
  if (!f) cache.set(locale, (f = create()));
  return f;
}

/** Importe en euros formateado para la UI (los importes viajan siempre en céntimos). */
export function formatEuros(importe: Centimos, locale: string): string {
  return cached(
    euros,
    locale,
    () => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR" }),
  ).format(importe / 100);
}

/** Fecha `YYYY-MM-DD` formateada en UTC, sin desfase de día por la zona horaria. */
export function formatFecha(fecha: FechaISO, locale: string): string {
  return cached(
    fechas,
    locale,
    () =>
      new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }),
  ).format(new Date(`${fecha}T00:00:00Z`));
}

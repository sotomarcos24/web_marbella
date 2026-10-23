import { eur } from "@/lib/dinero";
import type { Mes, SuplementoHuesped, Tarifa } from "@/types/tarifa";
import type { VillaId } from "@/types/villa";

/** Tabla de 12 meses a partir de 12 importes en euros, de enero a diciembre. */
const meses = (
  e: number, f: number, m: number, a: number, my: number, jn: number,
  jl: number, ag: number, s: number, o: number, n: number, d: number,
): Tarifa["meses"] => ({
  1: { precioNoche: eur(e) },
  2: { precioNoche: eur(f) },
  3: { precioNoche: eur(m) },
  4: { precioNoche: eur(a) },
  5: { precioNoche: eur(my) },
  6: { precioNoche: eur(jn) },
  7: { precioNoche: eur(jl) },
  8: { precioNoche: eur(ag) },
  9: { precioNoche: eur(s) },
  10: { precioNoche: eur(o) },
  11: { precioNoche: eur(n) },
  12: { precioNoche: eur(d) },
});

/** € por noche con IVA según el mes de cada noche (SPEC §8). */
export const tarifas: readonly Tarifa[] = [
  {
    villas: ["villa-1"],
    meses: meses(616, 616, 989, 1456, 1568, 1344, 2016, 2016, 1568, 1232, 1064, 538),
  },
  {
    villas: ["villa-3"],
    meses: {
      ...meses(616, 616, 989, 1456, 1568, 1120, 1792, 1792, 1568, 1232, 650, 653),
      7: { precioNoche: eur(1792), estimado: true },
    },
  },
  {
    villas: ["villa-4", "villa-5"],
    meses: meses(560, 560, 924, 1344, 1512, 1624, 1680, 1680, 1512, 1064, 591, 523),
  },
];

export function tarifaDeVilla(id: VillaId): Tarifa {
  const tarifa = tarifas.find((t) => t.villas.includes(id));
  if (!tarifa) throw new Error(`Sin tarifa para ${id}`);
  return tarifa;
}

/** Reglas comerciales (SPEC §8). Importes en céntimos; porcentajes en %. */
export const reglas = {
  plazasMax: 15,
  estancia: { minNoches: 3, maxNoches: 59 },
  /** Más de `nochesSobre` noches entre estos meses: se solicita oferta en lugar de precio. */
  invierno: { nochesSobre: 28, meses: [12, 1, 2, 3] satisfies Mes[] },
  horaEntrada: "16:00",
  horaSalida: "10:00",
  limpiezaFinal: eur(450),
  fianza: eur(1000),
  mascota: eur(200),
  pagos: { porcentajeReserva: 25, porcentajeResto: 75, diasAntesResto: 30 },
  cancelacion: { diasAntes: 60, cargoPorcentaje: 2 },
  /** Primer huésped que paga suplemento (del 13.º al 15.º). */
  suplementoDesdeHuesped: 13,
} as const;

export const suplementosHuesped: Readonly<Record<VillaId, SuplementoHuesped>> = {
  "villa-1": [{ importe: eur(250), meses: [8] }, { importe: eur(150), estimado: true }],
  "villa-3": [{ importe: eur(150), estimado: true }],
  "villa-4": [{ importe: eur(150) }],
  "villa-5": [{ importe: eur(150) }],
};

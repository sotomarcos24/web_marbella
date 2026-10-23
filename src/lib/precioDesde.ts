import type { Centimos } from "@/types/dinero";
import type { Tarifa } from "@/types/tarifa";

/** Precio "desde": el mínimo por noche del año; estimado solo si ningún mes con ese mínimo está confirmado. */
export function precioDesde(tarifa: Tarifa): { importe: Centimos; estimado: boolean } {
  const meses = Object.values(tarifa.meses);
  const importe = Math.min(...meses.map((m) => m.precioNoche));
  const estimado = meses.filter((m) => m.precioNoche === importe).every((m) => m.estimado);
  return { importe, estimado };
}

/** Último tramo del progreso en el que se funde con la imagen final real (docs/vision.md §3.3). */
export const TRAMO_FINAL = 0.05;
const ESCALA_MAXIMA = 1.15;
const ESCALA_LLEGADA = 1.08;
const MARGEN_LLEGADA = 1e-3;

const acotar = (valor: number) => Math.min(1, Math.max(0, valor));

/** La imagen de inicio se acerca con el progreso; sin zoom si el usuario reduce el movimiento. */
export function escalaInicio(progreso: number, reducido: boolean) {
  return reducido ? 1 : 1 + (ESCALA_MAXIMA - 1) * acotar(progreso);
}

/** La de llegada parte algo ampliada y asienta en escala 1, la de la imagen final. */
export function escalaLlegada(progreso: number, reducido: boolean) {
  return reducido ? 1 : 1 + (ESCALA_LLEGADA - 1) * (1 - acotar(progreso));
}

/** Fundido de inicio a llegada: suavizado y completo antes del último tramo; lineal con reduced-motion. */
export function opacidadLlegada(progreso: number, reducido: boolean) {
  if (reducido) return acotar(progreso);
  const t = acotar(progreso / (1 - TRAMO_FINAL));
  return t * t * (3 - 2 * t);
}

/** Opacidad de la foto final real: solo en el último 5 %. Con reduced-motion no hace falta. */
export function opacidadFinal(progreso: number, reducido: boolean) {
  return reducido ? 0 : acotar((progreso - (1 - TRAMO_FINAL)) / TRAMO_FINAL);
}

export function haLlegado(progreso: number) {
  return progreso >= 1 - MARGEN_LLEGADA;
}

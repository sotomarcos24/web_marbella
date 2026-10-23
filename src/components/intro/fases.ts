import { acotar, suave } from "@/lib/scenes/progreso";

// Guion de la intro (docs/vision.md §2.1) en función de un único progreso 0–1:
// se cruza el arco (0–0,3), se atraviesan las nubes (0,15–0,9) y se desciende hasta la aérea (0,3–1).
const tramo = (progreso: number, desde: number, hasta: number) => acotar((progreso - desde) / (hasta - desde));

const ESCALA_ARCO = 5;
const ESCALA_AEREA = 1.6;
/** Recorrido vertical de la capa de nubes más lejana, en % de su alto; las cercanas se mueven más. */
const DESPLAZAMIENTO_NUBE = 30;

/** Con reduced-motion todo se resuelve en un fundido directo del arco a la aérea. */
export function opacidadArco(progreso: number, reducido: boolean) {
  return reducido ? 1 - acotar(progreso) : 1 - suave(tramo(progreso, 0.1, 0.3));
}

/** Al cruzar el arco la cámara lo atraviesa: crece hasta salirse de la pantalla. */
export function escalaArco(progreso: number, reducido: boolean) {
  return reducido ? 1 : 1 + (ESCALA_ARCO - 1) * suave(tramo(progreso, 0, 0.3));
}

export function opacidadNubes(progreso: number, reducido: boolean) {
  if (reducido) return 0;
  return suave(tramo(progreso, 0.15, 0.3)) * (1 - suave(tramo(progreso, 0.7, 0.9)));
}

/** Parallax: desplazamiento vertical (en %) de una capa de nubes; `profundidad` 1 es la más lejana. */
export function desplazamientoNube(progreso: number, profundidad: number) {
  return -DESPLAZAMIENTO_NUBE * profundidad * acotar(progreso);
}

/** Zoom de descenso hacia el conjunto: asienta en escala 1 justo al llegar, donde queda fija. */
export function escalaAerea(progreso: number, reducido: boolean) {
  return reducido ? 1 : 1 + (ESCALA_AEREA - 1) * (1 - suave(tramo(progreso, 0.3, 1)));
}

export function opacidadAerea(progreso: number, reducido: boolean) {
  return reducido ? acotar(progreso) : suave(tramo(progreso, 0.5, 0.85));
}

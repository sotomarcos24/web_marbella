import type { Poligono, Punto } from "@/types/villa";

/** Vértices en el formato del atributo `points` de un `<polygon>` SVG. */
export function puntosSvg(poligono: Poligono): string {
  return poligono.map(([x, y]) => `${x},${y}`).join(" ");
}

/** Centroide del área; si el polígono es degenerado (área 0) cae a la media de vértices. */
export function centroide(poligono: Poligono): Punto {
  let area = 0;
  let cx = 0;
  let cy = 0;
  poligono.forEach(([x0, y0], i) => {
    const [x1, y1] = poligono[(i + 1) % poligono.length];
    const cruz = x0 * y1 - x1 * y0;
    area += cruz;
    cx += (x0 + x1) * cruz;
    cy += (y0 + y1) * cruz;
  });
  if (Math.abs(area) < 1e-9) {
    const n = poligono.length;
    return [poligono.reduce((s, [x]) => s + x, 0) / n, poligono.reduce((s, [, y]) => s + y, 0) / n];
  }
  return [cx / (3 * area), cy / (3 * area)];
}

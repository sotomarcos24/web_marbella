import type { Punto, TipoEstancia, Zona } from "@/types/villa";

// Lógica pura del editor de /dev/zonas: sin DOM ni React, para poder probarla aislada.

/** Polígono en edición. `accion`/`destino` solo en zonas; `tipo` solo en estancias. */
export interface PoligonoEditable {
  id: string;
  nombre: string;
  puntos: readonly Punto[];
  cerrado: boolean;
  accion?: Zona["accion"];
  destino?: string;
  tipo?: TipoEstancia;
}

export interface EstadoEditor {
  poligonos: readonly PoligonoEditable[];
  seleccionado: number | null;
}

export type AccionEditor =
  | { tipo: "agregarVertice"; punto: Punto }
  | { tipo: "cerrar" }
  | { tipo: "moverVertice"; poligono: number; vertice: number; punto: Punto }
  | { tipo: "borrarVertice"; poligono: number; vertice: number }
  | { tipo: "borrarPoligono"; poligono: number }
  | { tipo: "editar"; poligono: number; campos: Partial<Omit<PoligonoEditable, "puntos" | "cerrado">> }
  | { tipo: "seleccionar"; poligono: number | null }
  | { tipo: "cargar"; poligonos: readonly PoligonoEditable[] };

const MIN_VERTICES = 3;

const redondear = (valor: number) => Math.round(Math.min(1, Math.max(0, valor)) * 10_000) / 10_000;

/** Posición de pantalla → [x, y] normalizado 0–1 sobre `rect` (la imagen), limitado y con 4 decimales. */
export function normalizar(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }): Punto {
  if (rect.width <= 0 || rect.height <= 0) return [0, 0];
  return [redondear((clientX - rect.left) / rect.width), redondear((clientY - rect.top) / rect.height)];
}

export function estadoInicial(poligonos: readonly PoligonoEditable[] = []): EstadoEditor {
  return { poligonos, seleccionado: null };
}

/** Primer `zona-N` que no está en uso. */
function idLibre(poligonos: readonly PoligonoEditable[]): string {
  const usados = new Set(poligonos.map((p) => p.id));
  let n = poligonos.length + 1;
  while (usados.has(`zona-${n}`)) n++;
  return `zona-${n}`;
}

const indiceAbierto = (estado: EstadoEditor) => estado.poligonos.findIndex((p) => !p.cerrado);

const actualizar = (estado: EstadoEditor, indice: number, cambio: (p: PoligonoEditable) => PoligonoEditable): EstadoEditor => ({
  ...estado,
  poligonos: estado.poligonos.map((p, i) => (i === indice ? cambio(p) : p)),
});

export function editorZonas(estado: EstadoEditor, accion: AccionEditor): EstadoEditor {
  switch (accion.tipo) {
    case "agregarVertice": {
      const abierto = indiceAbierto(estado);
      if (abierto >= 0) {
        return { ...actualizar(estado, abierto, (p) => ({ ...p, puntos: [...p.puntos, accion.punto] })), seleccionado: abierto };
      }
      const nuevo: PoligonoEditable = { id: idLibre(estado.poligonos), nombre: "", puntos: [accion.punto], cerrado: false };
      return { poligonos: [...estado.poligonos, nuevo], seleccionado: estado.poligonos.length };
    }
    case "cerrar": {
      const abierto = indiceAbierto(estado);
      if (abierto < 0 || (estado.poligonos[abierto]?.puntos.length ?? 0) < MIN_VERTICES) return estado;
      return actualizar(estado, abierto, (p) => ({ ...p, cerrado: true }));
    }
    case "moverVertice":
      return actualizar(estado, accion.poligono, (p) => ({
        ...p,
        puntos: p.puntos.map((punto, i) => (i === accion.vertice ? ([redondear(accion.punto[0]), redondear(accion.punto[1])] as const) : punto)),
      }));
    case "borrarVertice":
      return actualizar(estado, accion.poligono, (p) => ({ ...p, puntos: p.puntos.filter((_, i) => i !== accion.vertice) }));
    case "borrarPoligono": {
      const { seleccionado } = estado;
      return {
        poligonos: estado.poligonos.filter((_, i) => i !== accion.poligono),
        seleccionado: seleccionado === null || seleccionado === accion.poligono ? null : seleccionado > accion.poligono ? seleccionado - 1 : seleccionado,
      };
    }
    case "editar":
      return actualizar(estado, accion.poligono, (p) => ({ ...p, ...accion.campos }));
    case "seleccionar":
      return { ...estado, seleccionado: accion.poligono };
    case "cargar":
      return estadoInicial(accion.poligonos);
  }
}

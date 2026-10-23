import { describe, expect, it } from "vitest";
import { editorZonas, estadoInicial, normalizar, type EstadoEditor, type PoligonoEditable } from "@/lib/dev/polygon";

const rect = { left: 100, top: 50, width: 400, height: 200 };

const cerrado = (id: string, puntos: PoligonoEditable["puntos"]): PoligonoEditable => ({ id, nombre: "", puntos, cerrado: true });

const aplicar = (estado: EstadoEditor, ...acciones: Parameters<typeof editorZonas>[1][]) => acciones.reduce(editorZonas, estado);

describe("normalizar", () => {
  it("convierte coordenadas de pantalla a 0–1 sobre la imagen", () => {
    expect(normalizar(300, 100, rect)).toEqual([0.5, 0.25]);
  });

  it("limita a [0,1] los clics fuera de la imagen", () => {
    expect(normalizar(0, 400, rect)).toEqual([0, 1]);
  });

  it("redondea a 4 decimales", () => {
    expect(normalizar(100 + 400 / 3, 50, rect)).toEqual([0.3333, 0]);
  });

  it("con una imagen sin tamaño devuelve el origen en lugar de NaN", () => {
    expect(normalizar(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual([0, 0]);
  });
});

describe("editorZonas", () => {
  it("el primer clic crea un polígono abierto, seleccionado y con id único", () => {
    const estado = aplicar(estadoInicial([cerrado("zona-1", [[0, 0], [1, 0], [1, 1]])]), { tipo: "agregarVertice", punto: [0.1, 0.2] });
    expect(estado.poligonos).toHaveLength(2);
    expect(estado.poligonos[1]).toMatchObject({ puntos: [[0.1, 0.2]], cerrado: false });
    expect(estado.poligonos[1]?.id).not.toBe("zona-1");
    expect(estado.seleccionado).toBe(1);
  });

  it("los clics siguientes añaden vértices al polígono abierto", () => {
    const estado = aplicar(estadoInicial(), { tipo: "agregarVertice", punto: [0, 0] }, { tipo: "agregarVertice", punto: [0.5, 0] });
    expect(estado.poligonos).toHaveLength(1);
    expect(estado.poligonos[0]?.puntos).toEqual([[0, 0], [0.5, 0]]);
  });

  it("no cierra un polígono con menos de 3 vértices", () => {
    const estado = aplicar(estadoInicial(), { tipo: "agregarVertice", punto: [0, 0] }, { tipo: "agregarVertice", punto: [0.5, 0] }, { tipo: "cerrar" });
    expect(estado.poligonos[0]?.cerrado).toBe(false);
  });

  it("cierra con 3 o más vértices y el siguiente clic empieza otro polígono", () => {
    const estado = aplicar(
      estadoInicial(),
      { tipo: "agregarVertice", punto: [0, 0] },
      { tipo: "agregarVertice", punto: [0.5, 0] },
      { tipo: "agregarVertice", punto: [0.5, 0.5] },
      { tipo: "cerrar" },
      { tipo: "agregarVertice", punto: [0.9, 0.9] },
    );
    expect(estado.poligonos[0]?.cerrado).toBe(true);
    expect(estado.poligonos[1]?.puntos).toEqual([[0.9, 0.9]]);
  });

  it("mueve un vértice (normalizado y dentro de [0,1])", () => {
    const estado = aplicar(estadoInicial([cerrado("a", [[0, 0], [1, 0], [1, 1]])]), { tipo: "moverVertice", poligono: 0, vertice: 1, punto: [0.7, 0.2] });
    expect(estado.poligonos[0]?.puntos).toEqual([[0, 0], [0.7, 0.2], [1, 1]]);
  });

  it("borra un vértice", () => {
    const estado = aplicar(estadoInicial([cerrado("a", [[0, 0], [1, 0], [1, 1], [0, 1]])]), { tipo: "borrarVertice", poligono: 0, vertice: 0 });
    expect(estado.poligonos[0]?.puntos).toEqual([[1, 0], [1, 1], [0, 1]]);
  });

  it("borra un polígono y ajusta la selección", () => {
    const inicial = { ...estadoInicial([cerrado("a", [[0, 0], [1, 0], [1, 1]]), cerrado("b", [[0, 0], [1, 0], [1, 1]])]), seleccionado: 1 };
    const estado = aplicar(inicial, { tipo: "borrarPoligono", poligono: 0 });
    expect(estado.poligonos.map((p) => p.id)).toEqual(["b"]);
    expect(estado.seleccionado).toBe(0);
  });

  it("edita id, nombre y campos extra", () => {
    const estado = aplicar(estadoInicial([cerrado("a", [[0, 0], [1, 0], [1, 1]])]), {
      tipo: "editar",
      poligono: 0,
      campos: { id: "piscina", nombre: "zonas.piscina", accion: "galeria", destino: "piscina" },
    });
    expect(estado.poligonos[0]).toMatchObject({ id: "piscina", nombre: "zonas.piscina", accion: "galeria", destino: "piscina" });
  });

  it("cargar sustituye los polígonos y quita la selección", () => {
    const estado = aplicar(estadoInicial(), { tipo: "agregarVertice", punto: [0, 0] }, { tipo: "cargar", poligonos: [cerrado("x", [[0, 0], [1, 0], [1, 1]])] });
    expect(estado).toEqual({ poligonos: [cerrado("x", [[0, 0], [1, 0], [1, 1]])], seleccionado: null });
  });

  it("no muta el estado anterior", () => {
    const inicial = estadoInicial([cerrado("a", [[0, 0], [1, 0], [1, 1]])]);
    const copia = structuredClone(inicial);
    aplicar(inicial, { tipo: "moverVertice", poligono: 0, vertice: 0, punto: [0.5, 0.5] }, { tipo: "agregarVertice", punto: [0.2, 0.2] });
    expect(inicial).toEqual(copia);
  });
});

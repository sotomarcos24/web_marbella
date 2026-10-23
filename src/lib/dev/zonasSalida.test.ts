import { describe, expect, it } from "vitest";
import { villas } from "@/content/villas";
import type { PoligonoEditable } from "@/lib/dev/polygon";
import { aEditables, construirSalida, leerSalida, validarSalida, type ImagenZonas } from "@/lib/dev/zonasSalida";

const cuadrado: PoligonoEditable["puntos"] = [[0.1, 0.1], [0.4, 0.1], [0.4, 0.4], [0.1, 0.4]];
const pol = (campos: Partial<PoligonoEditable>): PoligonoEditable => ({ id: "x", nombre: "", puntos: cuadrado, cerrado: true, ...campos });

const portada: ImagenZonas = { clave: "/images/villas/villa-4/villa4_059.webp", tipo: "portada", imagen: "/images/villas/villa-4/villa4_059.webp", archivo: "zonas/villa-4/portada.json", villaId: "villa-4", poligonos: [] };
const plano: ImagenZonas = { clave: "/images/villas/villa-4/plano-planta-baja.webp", tipo: "plano", imagen: "/images/villas/villa-4/plano-planta-baja.webp", archivo: "zonas/villa-4/planta-baja.json", villaId: "villa-4", plantaId: "planta-baja", poligonos: [] };
const transicion: ImagenZonas = { clave: "/media/transiciones/villa-4/t3/final.webp", tipo: "transicion", imagen: "/media/transiciones/villa-4/t3/final.webp", archivo: "zonas/transiciones/villa-4/t3.json", villaId: "villa-4", transicionId: "t3", poligonos: [] };
const conjunto: ImagenZonas = { clave: "/images/conjunto/aerea.webp", tipo: "conjunto", imagen: "/images/conjunto/aerea.webp", archivo: "conjunto.json", poligonos: [] };

const zonaJardin = pol({ id: "jardin", nombre: "zonas.jardin", accion: "galeria", destino: "jardin" });
const parcelas = ["villa-1", "villa-3", "villa-4", "villa-5"].map((id) => pol({ id }));

describe("construirSalida", () => {
  it("portada: zonas con id, nombre, polígono, acción y destino; ignora polígonos abiertos", () => {
    expect(construirSalida(portada, [zonaJardin, pol({ id: "abierto", cerrado: false })])).toEqual({
      imagen: portada.imagen,
      zonas: [{ id: "jardin", nombre: "zonas.jardin", poligono: cuadrado, accion: "galeria", destino: "jardin" }],
    });
  });

  it("plano: estancias con id, nombre, tipo y polígono", () => {
    expect(construirSalida(plano, [pol({ id: "salon", nombre: "estancias.salon", tipo: "salon" })])).toEqual({
      imagen: plano.imagen,
      estancias: [{ id: "salon", nombre: "estancias.salon", tipo: "salon", poligono: cuadrado }],
    });
  });

  it("conjunto: parcelas con villaId (el id del polígono) y polígono", () => {
    expect(construirSalida(conjunto, [pol({ id: "villa-4" })])).toEqual({ imagen: conjunto.imagen, parcelas: [{ villaId: "villa-4", poligono: cuadrado }] });
  });
});

describe("validarSalida (vía validarVilla)", () => {
  it.each([
    ["portada", portada, [zonaJardin, pol({ id: "baja", nombre: "zonas.planta-baja", accion: "planta", destino: "planta-baja" })]],
    ["plano", plano, [pol({ id: "salon", nombre: "estancias.salon", tipo: "salon" })]],
    ["transición", transicion, [zonaJardin]],
    ["conjunto con las 4 parcelas", conjunto, parcelas],
  ] as const)("%s válida → sin errores", (_, entrada, poligonos) => {
    expect(validarSalida(entrada, construirSalida(entrada, [...poligonos]), villas)).toEqual([]);
  });

  it("polígono con 2 vértices → error", () => {
    const salida = construirSalida(portada, [pol({ ...zonaJardin, puntos: [[0, 0], [1, 1]] })]);
    expect(validarSalida(portada, salida, villas).join()).toMatch(/al menos 3 vértices/);
  });

  it("id repetido → error", () => {
    const salida = construirSalida(plano, [pol({ id: "salon", nombre: "a" }), pol({ id: "salon", nombre: "b" })]);
    expect(validarSalida(plano, salida, villas).join()).toMatch(/"salon" repetido/);
  });

  it("destino inexistente → error", () => {
    const salida = construirSalida(portada, [pol({ ...zonaJardin, destino: "sotano" })]);
    expect(validarSalida(portada, salida, villas).join()).toMatch(/"sotano"/);
  });

  it("id o nombre vacíos → error", () => {
    const salida = construirSalida(portada, [pol({ ...zonaJardin, id: " ", nombre: "" })]);
    const errores = validarSalida(portada, salida, villas).join();
    expect(errores).toMatch(/id vacío/);
    expect(errores).toMatch(/nombre vacío/);
  });

  it("conjunto con parcela repetida, villa desconocida o sin todas las villas → errores", () => {
    const salida = construirSalida(conjunto, [pol({ id: "villa-4" }), pol({ id: "villa-4" }), pol({ id: "villa-9" })]);
    const errores = validarSalida(conjunto, salida, villas).join();
    expect(errores).toMatch(/"villa-4" repetido/);
    expect(errores).toMatch(/villa-9/);
    expect(errores).toMatch(/villa-1 debe tener exactamente una parcela/);
  });
});

describe("leerSalida", () => {
  it("acepta una salida bien formada del tipo indicado", () => {
    const salida = construirSalida(portada, [zonaJardin]);
    expect(leerSalida("portada", JSON.parse(JSON.stringify(salida)))).toEqual(salida);
  });

  it.each([
    ["no es objeto", "portada", "x"],
    ["sin imagen", "portada", { zonas: [] }],
    ["lista del tipo equivocado", "plano", { imagen: "/a.webp", zonas: [] }],
    ["punto no numérico", "conjunto", { imagen: "/a.webp", parcelas: [{ villaId: "villa-1", poligono: [["0", 0]] }] }],
    ["acción desconocida", "portada", { imagen: "/a.webp", zonas: [{ id: "a", nombre: "a", poligono: cuadrado, accion: "borrar", destino: "a" }] }],
  ] as const)("rechaza %s", (_, tipo, valor) => {
    expect(leerSalida(tipo, valor)).toBeNull();
  });
});

describe("aEditables", () => {
  it("convierte una salida guardada de nuevo a polígonos editables cerrados", () => {
    const poligonos = [zonaJardin];
    expect(aEditables(construirSalida(portada, poligonos))).toEqual(poligonos);
  });

  it("parcelas: el id es el villaId", () => {
    expect(aEditables(construirSalida(conjunto, parcelas))).toEqual(parcelas.map((p) => ({ ...p, nombre: "" })));
  });
});

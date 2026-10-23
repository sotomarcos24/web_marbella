import { describe, expect, it } from "vitest";
import { validarConjunto, validarPoligono, validarVilla } from "@/lib/validation/villa";
import type { Conjunto, Estancia, Poligono, Villa, Zona } from "@/types/villa";

const cuadrado: Poligono = [
  [0.1, 0.1],
  [0.4, 0.1],
  [0.4, 0.4],
  [0.1, 0.4],
];

const estancia = (id: string, extra: Partial<Estancia> = {}): Estancia => ({
  id,
  nombre: `estancias.${id}`,
  tipo: "dormitorio",
  poligono: cuadrado,
  fotos: [],
  ...extra,
});

const zona = (id: string, accion: Zona["accion"], destino: string, extra: Partial<Zona> = {}): Zona => ({
  id,
  nombre: `zonas.${id}`,
  poligono: cuadrado,
  accion,
  destino,
  ...extra,
});

function villaValida(): Villa {
  return {
    id: "villa-4",
    plazasMax: 15,
    dormitorios: 6,
    banos: 4,
    superficieVivienda: 306,
    superficieParcela: 1213,
    parking: 3,
    pendientes: [],
    hero: {
      imagenDia: "/images/villas/villa-4/portada.webp",
      zonas: [zona("jardin", "galeria", "jardin"), zona("planta-baja", "planta", "planta-baja"), zona("planta-alta", "planta", "planta-alta")],
    },
    plantas: [
      { id: "planta-baja", nombre: "plantas.baja", imagenPlano: "/baja.webp", estancias: [estancia("salon", { tipo: "salon" })] },
      { id: "planta-alta", nombre: "plantas.alta", imagenPlano: "/alta.webp", estancias: [estancia("dormitorio-1")] },
    ],
    exteriores: [{ id: "jardin", fotos: [] }],
    recorrido: [{ id: "t3", transicion: "villa-4-t3", imagenFinal: "/recibidor.webp", titularKey: "recorrido.bienvenida" }],
    destacadas: ["salon", "dormitorio-1"],
  };
}

const conjuntoValido = (): Conjunto => ({
  imagen: "/images/conjunto/aerea.webp",
  parcelas: [
    { villaId: "villa-1", poligono: cuadrado },
    { villaId: "villa-4", poligono: cuadrado },
  ],
});

// Comprueba que hay algún error que contenga todos los fragmentos.
function expectError(errores: string[], ...fragmentos: string[]) {
  expect(errores.some((error) => fragmentos.every((f) => error.includes(f))), JSON.stringify(errores)).toBe(true);
}

describe("validarPoligono", () => {
  it("acepta un polígono de 3 vértices dentro de [0,1], bordes incluidos", () => {
    expect(validarPoligono([[0, 0], [1, 0], [1, 1]], "p")).toEqual([]);
  });

  it("rechaza menos de 3 vértices e incluye la ruta en el error", () => {
    expectError(validarPoligono([[0, 0], [1, 1]], "hero.zonas[0].poligono"), "hero.zonas[0].poligono", "3 vértices");
    expectError(validarPoligono([], "p"), "3 vértices");
  });

  it.each([
    ["x negativa", [-0.1, 0.5]],
    ["y mayor que 1", [0.5, 1.2]],
    ["NaN", [Number.NaN, 0.5]],
    ["Infinity", [0.5, Number.POSITIVE_INFINITY]],
  ] as const)("rechaza coordenadas fuera de [0,1]: %s", (_, punto) => {
    expectError(validarPoligono([[0, 0], [1, 0], punto], "p"), "p", "[0,1]");
  });
});

describe("validarVilla", () => {
  it("una villa válida no tiene errores", () => {
    expect(validarVilla(villaValida())).toEqual([]);
  });

  describe("polígonos", () => {
    it("valida los polígonos de las zonas", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("jardin", "galeria", "jardin", { poligono: [[0, 0], [1, 1]] })] };
      expectError(validarVilla(villa), "hero.zonas[0].poligono", "3 vértices");
    });

    it("valida los polígonos de las estancias", () => {
      const villa = villaValida();
      villa.plantas = [villa.plantas[0]!, { ...villa.plantas[1]!, estancias: [estancia("dormitorio-1", { poligono: [[0, 0], [1, 0], [1.5, 1]] })] }];
      expectError(validarVilla(villa), "plantas[1].estancias[0].poligono", "[0,1]");
    });
  });

  describe("ids únicos", () => {
    it("zonas repetidas", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("jardin", "galeria", "jardin"), zona("jardin", "planta", "planta-baja")] };
      expectError(validarVilla(villa), "jardin", "repetido");
    });

    it("plantas repetidas", () => {
      const villa = villaValida();
      villa.plantas = [villa.plantas[0]!, { ...villa.plantas[1]!, id: "planta-baja" }];
      expectError(validarVilla(villa), "planta-baja", "repetido");
    });

    it("estancias repetidas, aunque estén en plantas distintas", () => {
      const villa = villaValida();
      villa.plantas = [villa.plantas[0]!, { ...villa.plantas[1]!, estancias: [estancia("salon")] }];
      expectError(validarVilla(villa), "salon", "repetido");
    });

    it("exteriores repetidos", () => {
      const villa = villaValida();
      villa.exteriores = [{ id: "jardin", fotos: [] }, { id: "jardin", fotos: [] }];
      expectError(validarVilla(villa), "jardin", "repetido");
    });
  });

  describe("destinos de zonas", () => {
    it("una zona de planta debe apuntar a una planta existente", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("sotano", "planta", "sotano")] };
      expectError(validarVilla(villa), "hero.zonas[0]", "sotano");
    });

    it("una zona de galería debe apuntar a un exterior o estancia existente", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("piscina", "galeria", "piscina")] };
      expectError(validarVilla(villa), "hero.zonas[0]", "piscina");
    });

    it("una zona de galería puede apuntar a una estancia", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("salon", "galeria", "salon")] };
      expect(validarVilla(villa)).toEqual([]);
    });

    it("una zona de planta no puede apuntar a un exterior", () => {
      const villa = villaValida();
      villa.hero = { ...villa.hero, zonas: [zona("jardin", "planta", "jardin")] };
      expectError(validarVilla(villa), "hero.zonas[0]", "jardin");
    });
  });

  describe("Fase 2: destacadas y recorrido", () => {
    it("destacadas admite ids de estancias y de exteriores", () => {
      expect(validarVilla({ ...villaValida(), destacadas: ["salon", "jardin"] })).toEqual([]);
    });

    it("destacadas solo admite estancias o exteriores existentes", () => {
      const villa = { ...villaValida(), destacadas: ["salon", "bodega"] };
      expectError(validarVilla(villa), "destacadas", "bodega");
    });

    it("destacadas no admite plantas", () => {
      expectError(validarVilla({ ...villaValida(), destacadas: ["planta-baja"] }), "destacadas", "planta-baja");
    });

    it("destacadas sin repetir", () => {
      expectError(validarVilla({ ...villaValida(), destacadas: ["salon", "salon"] }), "destacadas", "repetido");
    });

    it("recorrido con ids únicos", () => {
      const tramo = { id: "t3", transicion: "villa-4-t3", imagenFinal: "/recibidor.webp" };
      expectError(validarVilla({ ...villaValida(), recorrido: [tramo, { ...tramo, transicion: "villa-4-t4" }] }), "t3", "repetido");
    });

    it("recorrido con transición e imagen final no vacías", () => {
      const errores = validarVilla({ ...villaValida(), recorrido: [{ id: "t3", transicion: "", imagenFinal: " " }] });
      expectError(errores, "recorrido[0]", "transicion");
      expectError(errores, "recorrido[0]", "imagenFinal");
    });

    it("sin recorrido ni destacadas también es válida", () => {
      const villa = villaValida();
      delete villa.recorrido;
      delete villa.destacadas;
      expect(validarVilla(villa)).toEqual([]);
    });
  });

  describe("Fase 2: conjunto", () => {
    it("acepta una villa con su parcela en el conjunto", () => {
      expect(validarVilla(villaValida(), { conjunto: conjuntoValido() })).toEqual([]);
    });

    it("la villa debe tener parcela en el conjunto", () => {
      const conjunto = { ...conjuntoValido(), parcelas: [{ villaId: "villa-1" as const, poligono: cuadrado }] };
      expectError(validarVilla(villaValida(), { conjunto }), "conjunto", "villa-4");
    });

    it("la parcela de la villa debe tener un polígono válido", () => {
      const conjunto = { ...conjuntoValido(), parcelas: [{ villaId: "villa-4" as const, poligono: [[0, 0], [1, 1]] as Poligono }] };
      expectError(validarVilla(villaValida(), { conjunto }), "conjunto", "3 vértices");
    });
  });
});

describe("validarConjunto", () => {
  it("un conjunto válido no tiene errores", () => {
    expect(validarConjunto(conjuntoValido())).toEqual([]);
  });

  it("rechaza parcelas repetidas para la misma villa", () => {
    const base = conjuntoValido();
    const conjunto = { ...base, parcelas: [...base.parcelas, { villaId: "villa-1" as const, poligono: cuadrado }] };
    expectError(validarConjunto(conjunto), "villa-1", "repetido");
  });

  it("rechaza polígonos inválidos con su ruta", () => {
    const conjunto = { ...conjuntoValido(), parcelas: [{ villaId: "villa-3" as const, poligono: [[0, 0], [2, 0], [1, 1]] as Poligono }] };
    expectError(validarConjunto(conjunto), "parcelas[0].poligono", "[0,1]");
  });
});

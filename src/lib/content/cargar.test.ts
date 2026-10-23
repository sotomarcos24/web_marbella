import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cargarConjunto, cargarVilla } from "@/lib/content/cargar";
import { validarVilla } from "@/lib/validation/villa";
import type { Villa } from "@/types/villa";

const cuadrado = [[0.1, 0.1], [0.4, 0.1], [0.4, 0.4], [0.1, 0.4]];
const base: Villa = {
  id: "villa-4",
  plazasMax: 15,
  dormitorios: 6,
  banos: 4,
  superficieVivienda: 306,
  superficieParcela: 1213,
  parking: 3,
  pendientes: [],
  hero: { imagenDia: "/images/villas/villa-4/portada.webp", zonas: [] },
  plantas: [
    { id: "planta-baja", nombre: "zonas.planta-baja", imagenPlano: "/images/villas/villa-4/plano-baja.webp", estancias: [] },
    { id: "planta-alta", nombre: "zonas.planta-alta", imagenPlano: "/images/villas/villa-4/plano-alta.webp", estancias: [] },
  ],
  exteriores: [],
};

let dir: string;
const escribir = (archivo: string, contenido: unknown) => {
  const destino = path.join(dir, archivo);
  mkdirSync(path.dirname(destino), { recursive: true });
  writeFileSync(destino, typeof contenido === "string" ? contenido : JSON.stringify(contenido));
};
const campos = (villa: Villa) => villa.pendientes.map((p) => p.campo);

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "contenido-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("cargarVilla", () => {
  it("carga zonas del hero, estancias y fotos de estancias y exteriores", () => {
    escribir("zonas/villa-4/portada.json", {
      imagen: base.hero.imagenDia,
      zonas: [{ id: "piscina", nombre: "zonas.piscina", poligono: cuadrado, accion: "galeria", destino: "piscina" }],
    });
    escribir("zonas/villa-4/planta-baja.json", {
      imagen: base.plantas[0]?.imagenPlano,
      estancias: [{ id: "salon", nombre: "estancias.salon", tipo: "salon", poligono: cuadrado }],
    });
    escribir("fotos/villa-4.json", { salon: ["a.webp", "b.webp"], piscina: ["c.webp"] });

    const villa = cargarVilla(base, dir);
    expect(villa.hero.zonas.map((z) => z.id)).toEqual(["piscina"]);
    expect(villa.plantas[0]?.estancias[0]).toMatchObject({ id: "salon", fotos: ["/images/villas/villa-4/a.webp", "/images/villas/villa-4/b.webp"] });
    expect(villa.plantas[1]?.estancias).toEqual([]);
    expect(villa.exteriores).toEqual([{ id: "piscina", fotos: ["/images/villas/villa-4/c.webp"] }]);
    expect(validarVilla(villa)).toEqual([]);
    expect(campos(villa)).not.toContain("hero.zonas");
    expect(campos(villa)).not.toContain("fotos");
  });

  it("sin JSON: sin zonas ni estancias, válida y marcada en pendientes", () => {
    const villa = cargarVilla(base, dir);
    expect(villa.hero.zonas).toEqual([]);
    expect(villa.plantas.every((p) => p.estancias.length === 0)).toBe(true);
    expect(villa.exteriores).toEqual([]);
    expect(validarVilla(villa)).toEqual([]);
    expect(campos(villa)).toEqual(expect.arrayContaining(["hero.zonas", "plantas.planta-baja.estancias", "plantas.planta-alta.estancias", "fotos"]));
  });

  it("JSON con contenido inválido: falla validarVilla()", () => {
    escribir("zonas/villa-4/portada.json", {
      imagen: base.hero.imagenDia,
      zonas: [{ id: "x", nombre: "zonas.x", poligono: [[0, 0], [2, 0], [1, 1]], accion: "planta", destino: "no-existe" }],
    });
    const errores = validarVilla(cargarVilla(base, dir));
    expect(errores.join("\n")).toMatch(/fuera de \[0,1\]/);
    expect(errores.join("\n")).toMatch(/no-existe/);
  });

  it("JSON roto o con forma incorrecta: lanza indicando el archivo", () => {
    escribir("zonas/villa-4/portada.json", "{ no es json");
    expect(() => cargarVilla(base, dir)).toThrow(/zonas\/villa-4\/portada\.json/);
    escribir("zonas/villa-4/portada.json", { imagen: base.hero.imagenDia, zonas: "nada" });
    expect(() => cargarVilla(base, dir)).toThrow(/zonas\/villa-4\/portada\.json/);
  });

  it("JSON de otra imagen: lanza", () => {
    escribir("zonas/villa-4/portada.json", { imagen: "/otra.webp", zonas: [] });
    expect(() => cargarVilla(base, dir)).toThrow(/imagen/);
  });
});

describe("cargarConjunto", () => {
  it("devuelve el conjunto de conjunto.json", () => {
    const conjunto = { imagen: "/images/conjunto/aerea.webp", parcelas: [{ villaId: "villa-4", poligono: cuadrado }] };
    escribir("conjunto.json", conjunto);
    expect(cargarConjunto(dir)).toEqual(conjunto);
  });

  it("null si no existe", () => {
    expect(cargarConjunto(dir)).toBeNull();
  });

  it("JSON inválido: lanza", () => {
    escribir("conjunto.json", { imagen: 3 });
    expect(() => cargarConjunto(dir)).toThrow(/conjunto\.json/);
  });
});

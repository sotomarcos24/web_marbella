import { describe, expect, it } from "vitest";
import type { Foto } from "@/types/foto";
import { asignar, destinoDe, destinosVilla, EXTERIORES, leerAsignacion, marcarPrincipal, quitar, sugerencia, validarAsignacion } from "./fotosAsignacion";

const foto = (archivo: string, extra: Partial<Foto> = {}): Foto => ({
  villa: "villa-4",
  archivo,
  zona: "interior",
  tipo: "salon",
  confianza: "alta",
  alt: { es: "a", en: "a" },
  ...extra,
});
const destinos = destinosVilla([{ id: "salon", nombre: "Salón" }, { id: "cocina", nombre: "Cocina" }]);

describe("destinosVilla", () => {
  it("lista las estancias y todos los exteriores", () => {
    expect(destinos.filter((d) => d.grupo === "estancia").map((d) => d.id)).toEqual(["salon", "cocina"]);
    expect(destinos.filter((d) => d.grupo === "exterior").map((d) => d.id)).toEqual([...EXTERIORES]);
  });
});

describe("asignar / quitar", () => {
  it("añade la foto al final del destino", () => {
    expect(asignar(asignar({}, "salon", "a.webp"), "salon", "b.webp")).toEqual({ salon: ["a.webp", "b.webp"] });
  });

  it("no duplica una foto ya asignada al mismo destino", () => {
    expect(asignar({ salon: ["a.webp"] }, "salon", "a.webp")).toEqual({ salon: ["a.webp"] });
  });

  it("mover una foto a otro destino la quita del anterior", () => {
    const r = asignar({ salon: ["a.webp", "b.webp"] }, "cocina", "a.webp");
    expect(r).toEqual({ salon: ["b.webp"], cocina: ["a.webp"] });
    expect(destinoDe(r, "a.webp")).toBe("cocina");
  });

  it("no muta la entrada y quita destinos que quedan vacíos", () => {
    const a = Object.freeze({ salon: Object.freeze(["a.webp"]) });
    expect(quitar(a, "a.webp")).toEqual({});
    expect(a).toEqual({ salon: ["a.webp"] });
  });

  it("destinoDe devuelve undefined si no está asignada", () => {
    expect(destinoDe({}, "a.webp")).toBeUndefined();
  });
});

describe("marcarPrincipal", () => {
  it("pone la foto en primera posición del destino", () => {
    expect(marcarPrincipal({ salon: ["a.webp", "b.webp", "c.webp"] }, "salon", "c.webp")).toEqual({ salon: ["c.webp", "a.webp", "b.webp"] });
  });

  it("ignora una foto que no está en ese destino", () => {
    const a = { salon: ["a.webp"] };
    expect(marcarPrincipal(a, "salon", "z.webp")).toEqual(a);
  });
});

describe("sugerencia", () => {
  it("devuelve la estancia sugerida del catálogo y marca la confianza baja", () => {
    expect(sugerencia(foto("a.webp", { estanciaSugerida: "cocina", confianza: "baja" }), destinos)).toEqual({ destinoId: "cocina", baja: true });
  });

  it("omite la sugerencia si no corresponde a ningún destino de la villa", () => {
    expect(sugerencia(foto("a.webp", { estanciaSugerida: "pa-triple" }), destinos)).toEqual({ destinoId: undefined, baja: false });
  });
});

describe("validarAsignacion", () => {
  const fotos = [foto("a.webp"), foto("b.webp")];

  it("válida → sin errores", () => {
    expect(validarAsignacion({ salon: ["a.webp"], jardin: ["b.webp"] }, destinos, fotos)).toEqual([]);
  });

  it("destino desconocido, foto inexistente y foto repetida generan errores", () => {
    const e = validarAsignacion({ sotano: ["a.webp"], salon: ["zzz.webp", "b.webp"], cocina: ["b.webp"] }, destinos, fotos).join("\n");
    expect(e).toMatch(/sotano/);
    expect(e).toMatch(/zzz\.webp/);
    expect(e).toMatch(/b\.webp.*más de un destino|más de un destino.*b\.webp/);
  });
});

describe("leerAsignacion", () => {
  it("acepta un objeto de listas de cadenas y rechaza el resto", () => {
    expect(leerAsignacion({ salon: ["a.webp"] })).toEqual({ salon: ["a.webp"] });
    expect(leerAsignacion({ salon: "a.webp" })).toBeNull();
    expect(leerAsignacion([])).toBeNull();
    expect(leerAsignacion(null)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { villas } from "@/content/villas";
import { validarVilla } from "@/lib/validation/villa";
import type { VillaId } from "@/types/villa";

const porId = (id: VillaId) => {
  const villa = villas.find((v) => v.id === id);
  if (!villa) throw new Error(`falta ${id}`);
  return villa;
};

describe("villas (SPEC §6)", () => {
  it("son las 4 villas con las cifras de la ficha", () => {
    expect(villas.map((v) => v.id)).toEqual(["villa-1", "villa-3", "villa-4", "villa-5"]);
    const cifras = villas.map((v) => [v.dormitorios, v.banos, v.superficieVivienda, v.superficieParcela, v.parking]);
    expect(cifras).toEqual([
      [7, 5, 299, 941, 1],
      [7, 4, 350, 844, 4],
      [6, 4, 306, 1213, 3],
      [6, 4, 321, 1212, 3],
    ]);
  });

  it("plazas máximas 15 en todas", () => {
    expect(villas.every((v) => v.plazasMax === 15)).toBe(true);
  });

  it("combinableCon: villa-4 y villa-5 entre sí; reciprocidad general", () => {
    expect(porId("villa-4").combinableCon).toEqual(["villa-5"]);
    expect(porId("villa-5").combinableCon).toEqual(["villa-4"]);
    expect(porId("villa-1").combinableCon ?? []).toEqual([]);
    expect(porId("villa-3").combinableCon ?? []).toEqual([]);
    for (const villa of villas) {
      for (const otra of villa.combinableCon ?? []) {
        expect(porId(otra).combinableCon).toContain(villa.id);
      }
    }
  });

  it("inscripción turística y coordenadas vacías y marcadas como pendientes", () => {
    for (const villa of villas) {
      expect(villa.inscripcionTuristica).toBeUndefined();
      expect(villa.coordenadas).toBeUndefined();
      const campos = villa.pendientes.map((p) => p.campo);
      expect(campos).toContain("inscripcionTuristica");
      expect(campos).toContain("coordenadas");
    }
  });

  it("villa-1: 7 dormitorios pendiente de confirmar", () => {
    const villa = porId("villa-1");
    expect(villa.dormitorios).toBe(7);
    expect(villa.pendientes).toContainEqual({
      campo: "dormitorios",
      nota: "pendiente de confirmar (el plano muestra 6)",
    });
    for (const otra of villas.filter((v) => v.id !== "villa-1")) {
      expect(otra.pendientes.map((p) => p.campo)).not.toContain("dormitorios");
    }
  });

  it("hero: portada provisional y zonas de ejemplo", () => {
    const portadas = {
      "villa-1": "villa1_012",
      "villa-3": "villa3_019",
      "villa-4": "villa4_059",
      "villa-5": "villa5_002",
    } satisfies Record<VillaId, string>;
    for (const villa of villas) {
      expect(villa.hero.imagenDia).toBe(`/images/villas/${villa.id}/${portadas[villa.id]}.webp`);
      expect(villa.hero.zonas.map((z) => z.id)).toEqual(["jardin", "planta-baja", "planta-alta"]);
    }
  });

  it("todas pasan validarVilla()", () => {
    for (const villa of villas) {
      expect(validarVilla(villa), villa.id).toEqual([]);
    }
  });
});

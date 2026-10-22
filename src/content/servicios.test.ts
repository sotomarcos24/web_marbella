import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { calcularCompraPrevia, menusChef, packDesayuno, servicios } from "@/content/servicios";
import type { ServicioId } from "@/types/servicio";

const PERMITIDOS: ServicioId[] = [
  "chef-privado",
  "limpieza-diaria",
  "compra-previa",
  "pack-desayuno",
  "decoracion-bienvenida",
  "catamaran",
  "calefaccion-piscina",
];

const porId = (id: ServicioId) => {
  const s = servicios.find((x) => x.id === id);
  if (!s) throw new Error(`falta ${id}`);
  return s;
};

const resolver = (mensajes: unknown, clave: string): unknown =>
  clave.split(".").reduce<unknown>((acc, parte) => (acc as Record<string, unknown> | undefined)?.[parte], mensajes);

const eur = (e: number) => e * 100;

describe("servicios (SPEC §9)", () => {
  it("solo los 7 servicios permitidos, sin traslados, despedidas, fotos ni spa", () => {
    expect(servicios.map((s) => s.id).sort()).toEqual([...PERMITIDOS].sort());
    expect(servicios.every((s) => s.opciones.length >= 1)).toBe(true);
  });

  it("limpieza diaria provisional; catamarán bajo presupuesto; nada más provisional", () => {
    expect(porId("limpieza-diaria").provisional).toBe(true);
    expect(servicios.filter((s) => s.provisional).map((s) => s.id)).toEqual(["limpieza-diaria"]);
    expect(porId("catamaran").opciones.map((o) => o.precio)).toEqual([{ tipo: "bajoPresupuesto" }]);
  });

  it("precios de los servicios sencillos, en céntimos", () => {
    expect(porId("limpieza-diaria").opciones[0]?.precio).toEqual({ tipo: "porDia", importe: eur(125) });
    expect(porId("limpieza-diaria").opciones[1]?.precio).toEqual({ tipo: "fijo", importe: eur(130) });
    expect(porId("pack-desayuno").opciones[0]?.precio).toEqual({ tipo: "fijo", importe: eur(90) });
    expect(porId("decoracion-bienvenida").opciones[0]?.precio).toEqual({ tipo: "fijo", importe: eur(95) });
    expect(porId("calefaccion-piscina").opciones[0]?.precio).toEqual({ tipo: "porDia", importe: eur(90) });
  });

  it("chef privado: menús paella y barbacoa con precio por adulto/niño y mínimo 10", () => {
    const precios = porId("chef-privado").opciones.map((o) => [o.id, o.precio]);
    expect(precios).toEqual([
      ["paella", { tipo: "porPersona", adulto: eur(55), nino: eur(30), minimoComensales: 10 }],
      ["barbacoa", { tipo: "porPersona", adulto: eur(55), nino: eur(25), minimoComensales: 10 }],
    ]);
  });
});

describe("compra previa: 80 € hasta 200 € + 40 € por cada 100 € adicionales", () => {
  it.each([
    [1, 80],
    [100, 80],
    [200, 80],
    [200.01, 120],
    [300, 120],
    [300.01, 160],
    [400, 160],
    [500, 200],
  ])("compra de %s € → %s € de gestión", (compra, gestion) => {
    expect(calcularCompraPrevia(Math.round(compra * 100))).toBe(eur(gestion));
  });

  it("la opción del servicio usa los mismos parámetros", () => {
    expect(porId("compra-previa").opciones[0]?.precio).toEqual({
      tipo: "escalonado",
      base: eur(80),
      hasta: eur(200),
      tramo: eur(100),
      incremento: eur(40),
    });
  });

  it.each([0, -100, 10.5, Number.NaN])("rechaza importe inválido %s", (v) => {
    expect(() => calcularCompraPrevia(v)).toThrow();
  });
});

describe("menús del chef y pack desayuno como datos", () => {
  it("paella y barbacoa con entrantes, principal, postre e incluye", () => {
    expect(menusChef.map((m) => m.id)).toEqual(["paella", "barbacoa"]);
    for (const m of menusChef) {
      expect(m.entrantes.length).toBeGreaterThan(0);
      expect(m.principal.length).toBeGreaterThan(0);
      expect(m.postre.length).toBeGreaterThan(0);
      expect(m.incluye.length).toBeGreaterThan(0);
    }
  });

  it("pack desayuno: lista pendiente de confirmar, nunca inventada", () => {
    expect(packDesayuno.pendiente).toBe(true);
    expect(packDesayuno.articulos).toEqual([]);
  });

  it("todas las claves de traducción existen en es y en", () => {
    const claves = [
      ...servicios.flatMap((s) => [s.nombre, s.descripcion, ...s.opciones.map((o) => o.nombre)]),
      ...menusChef.flatMap((m) => [m.nombre, ...m.entrantes, ...m.principal, ...m.postre, ...m.incluye]),
      ...packDesayuno.articulos,
    ];
    for (const clave of claves) {
      expect(typeof resolver(es, clave), `es: ${clave}`).toBe("string");
      expect(typeof resolver(en, clave), `en: ${clave}`).toBe("string");
    }
  });
});

import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

type Messages = { [key: string]: string | Messages };

const IDIOMAS = [
  ["es", es],
  ["en", en],
] as const;

const SECCIONES = ["reserva", "pago", "fianza", "cancelacion", "horarios", "capacidad"];
const NORMAS = ["tabaco", "mascotas", "piscina", "fiestas", "llaves", "danos", "basura", "seguridad", "climatizacion", "limpieza", "jardinero", "capacidad"];
const SERVICIOS = ["chef-privado", "limpieza-diaria", "compra-previa", "pack-desayuno", "decoracion-bienvenida", "catamaran", "calefaccion-piscina"];

const resolver = (mensajes: unknown, clave: string): unknown =>
  clave.split(".").reduce<unknown>((acc, parte) => (acc as Record<string, unknown> | undefined)?.[parte], mensajes);

const hojas = (messages: Messages, prefix = ""): [string, string][] =>
  Object.entries(messages).flatMap(([k, v]) => (typeof v === "string" ? [[prefix + k, v] as [string, string]] : hojas(v, `${prefix}${k}.`)));

const textos = (messages: Messages): string[] => hojas(messages).map(([, v]) => v);

const PROHIBIDOS = /lirios|\beva\b|\blaura\b|iv[aá]n|\bjulio\b|mucama|maid|\b(18|19|20)\s*(personas|hu[eé]spedes|guests|people)/i;
const APARTAMENTOS = /comunitari|community|vecinos|neighbou?rs|portero|porter|ascensor|elevator|celos[ií]a|trellis|tender ropa|hang(ing)? (laundry|clothes)/i;
const NO_SPEC = /traslado|transfer|aeropuerto|airport|despedida|hen party|bachelorette|\bspa\b|masaje|massage|manicur|fot[oó]graf|photograph/i;

describe("textos generales y de servicios (#12)", () => {
  it.each(IDIOMAS)("%s: condiciones de reserva con todas las secciones", (_, m) => {
    for (const s of SECCIONES) {
      expect((resolver(m, `condiciones.secciones.${s}.titulo`) as string)?.length, s).toBeGreaterThan(2);
      expect((resolver(m, `condiciones.secciones.${s}.texto`) as string)?.length, s).toBeGreaterThan(20);
    }
    expect(typeof resolver(m, "condiciones.titulo")).toBe("string");
    expect(typeof resolver(m, "condiciones.intro")).toBe("string");
  });

  it.each(IDIOMAS)("%s: la fianza figura como dato pendiente de confirmar", (_, m) => {
    expect(typeof resolver(m, "condiciones.secciones.fianza.pendiente")).toBe("string");
  });

  it.each(IDIOMAS)("%s: normas de la casa con todos los ítems", (_, m) => {
    expect(typeof resolver(m, "normas.titulo")).toBe("string");
    expect(typeof resolver(m, "normas.intro")).toBe("string");
    for (const n of NORMAS) expect((resolver(m, `normas.items.${n}`) as string)?.length, n).toBeGreaterThan(20);
  });

  it.each(IDIOMAS)("%s: la norma de capacidad indica 15", (_, m) => {
    expect(resolver(m, "normas.items.capacidad") as string).toMatch(/\b15\b/);
    expect(resolver(m, "condiciones.secciones.capacidad.texto") as string).toMatch(/\b15\b/);
  });

  it.each(IDIOMAS)("%s: condiciones y normas sin normas de apartamentos", (_, m) => {
    const t = [...textos(m.condiciones as Messages), ...textos(m.normas as Messages)];
    expect(t.filter((x) => APARTAMENTOS.test(x))).toEqual([]);
  });

  it.each(IDIOMAS)("%s: servicios con nombre y descripción, y presentación genérica del chef", (_, m) => {
    for (const s of SERVICIOS) {
      expect(typeof resolver(m, `servicios.${s}.nombre`), s).toBe("string");
      expect((resolver(m, `servicios.${s}.descripcion`) as string).length, s).toBeGreaterThan(20);
    }
    expect((resolver(m, "servicios.chef-privado.presentacion") as string).length).toBeGreaterThan(60);
    expect(typeof resolver(m, "servicios.titulo")).toBe("string");
    expect(typeof resolver(m, "servicios.intro")).toBe("string");
  });

  it.each(IDIOMAS)("%s: los menús del chef incluyen agua, pan y sangría", (_, m) => {
    for (const k of ["agua", "pan", "sangria"]) expect(typeof resolver(m, `servicios.menus.incluye.${k}`), k).toBe("string");
    expect(typeof resolver(m, "servicios.menus.paella.nombre")).toBe("string");
    expect(typeof resolver(m, "servicios.menus.barbacoa.nombre")).toBe("string");
  });

  it.each(IDIOMAS)("%s: servicios sin traslados, despedidas, fotos ni spa", (_, m) => {
    const t = textos(m.servicios as Messages);
    expect(t.filter((x) => NO_SPEC.test(x))).toEqual([]);
  });

  it.each(IDIOMAS)("%s: términos prohibidos ausentes en todos los textos", (_, m) => {
    expect(textos(m as Messages).filter((t) => PROHIBIDOS.test(t))).toEqual([]);
  });

  it("es y en tienen las mismas claves en condiciones, normas y servicios", () => {
    for (const raíz of ["condiciones", "normas", "servicios"] as const) {
      const claves = (m: Messages) => hojas(m[raíz] as Messages).map(([k]) => k).sort();
      expect(claves(en as Messages), raíz).toEqual(claves(es as Messages));
    }
  });
});

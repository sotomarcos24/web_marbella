import { describe, expect, it } from "vitest";
import { comodidades } from "@/content/comodidades";
import { distribucionCamas } from "@/content/dormitorios";
import { villas } from "@/content/villas";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import type { VillaId } from "@/types/villa";

type Messages = { [key: string]: string | Messages };

const IDS: VillaId[] = villas.map((v) => v.id);
const IDIOMAS = [
  ["es", es],
  ["en", en],
] as const;

const resolver = (mensajes: unknown, clave: string): unknown =>
  clave.split(".").reduce<unknown>((acc, parte) => (acc as Record<string, unknown> | undefined)?.[parte], mensajes);

const textos = (messages: Messages): string[] =>
  Object.values(messages).flatMap((v) => (typeof v === "string" ? [v] : textos(v)));

const PROHIBIDOS = /lirios|\beva\b|\blaura\b|iv[aá]n|mucama|maid|\b(18|19|20)\s*(personas|hu[eé]spedes|guests|people)/i;

describe("textos de las villas (#11)", () => {
  it.each(IDIOMAS)("%s: cada villa tiene una descripción no vacía", (_, m) => {
    for (const id of IDS) {
      const d = resolver(m, `villas.${id}.descripcion`);
      expect(typeof d, id).toBe("string");
      expect((d as string).length, id).toBeGreaterThan(80);
    }
  });

  it.each(IDIOMAS)("%s: la capacidad de las descripciones es 15", (_, m) => {
    for (const id of IDS) {
      expect(resolver(m, `villas.${id}.descripcion`) as string, id).toMatch(/\b15\b/);
    }
  });

  it.each(IDIOMAS)("%s: comodidades de cada villa agrupadas, con texto en categorías e ítems", (_, m) => {
    for (const id of IDS) {
      const cats = comodidades[id];
      expect(cats.length, id).toBeGreaterThanOrEqual(5);
      for (const c of cats) {
        expect(typeof resolver(m, `comodidades.categorias.${c.id}`), c.id).toBe("string");
        expect(c.items.length, c.id).toBeGreaterThan(0);
        for (const item of c.items) expect(typeof resolver(m, `comodidades.items.${item}`), item).toBe("string");
      }
    }
  });

  it("todas las villas comparten piscina climatizada, wifi y aire acondicionado", () => {
    for (const id of IDS) {
      const items = comodidades[id].flatMap((c) => c.items);
      expect(items, id).toEqual(expect.arrayContaining(["piscina-climatizada", "wifi", "aire-acondicionado"]));
    }
  });

  it("no hay comodidades repetidas dentro de una villa", () => {
    for (const id of IDS) {
      const items = comodidades[id].flatMap((c) => c.items);
      expect(new Set(items).size, id).toBe(items.length);
    }
  });

  it.each(IDIOMAS)("%s: sin Lirios Village, nombres de personas, mucama ni capacidades de 18–20", (_, m) => {
    expect(textos(m as Messages).filter((t) => PROHIBIDOS.test(t))).toEqual([]);
  });

  it("distribución de camas: dormitorios y baños coinciden con la ficha y está marcada como pendiente", () => {
    for (const villa of villas) {
      const d = distribucionCamas[villa.id];
      expect(d.dormitorios, villa.id).toHaveLength(villa.dormitorios);
      expect(d.fuente).toBe("ficha");
      expect(d.estado).toBe("pendiente de confirmar");
      expect(d.dormitorios.filter((x) => x.banoEnSuite).length, villa.id).toBeLessThanOrEqual(villa.banos);
    }
  });

  it("distribución de camas: total de camas igual al de la ficha (villa-3: sala sin camas confirmadas)", () => {
    const total = (id: VillaId) =>
      distribucionCamas[id].dormitorios.reduce((n, d) => n + (d.camas ?? []).reduce((s, c) => s + c.cantidad, 0), 0);
    expect(total("villa-1")).toBe(13);
    expect(total("villa-4")).toBe(13);
    expect(total("villa-5")).toBe(13);
    const sala = distribucionCamas["villa-3"].dormitorios.filter((d) => d.camas === undefined);
    expect(sala).toHaveLength(1);
    expect(sala[0]?.plazas).toBe(3);
  });

  it("villa-1 mantiene marcada la discrepancia de dormitorios con el plano", () => {
    const v1 = villas.find((v) => v.id === "villa-1");
    expect(v1?.pendientes.some((p) => p.campo === "dormitorios" && /plano/.test(p.nota))).toBe(true);
  });

  it("villa-4 y villa-5 tienen la misma distribución de camas (espejo)", () => {
    expect(distribucionCamas["villa-5"].dormitorios).toEqual(distribucionCamas["villa-4"].dormitorios);
  });
});

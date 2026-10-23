import { describe, expect, it } from "vitest";
import { villas } from "@/content/villas";
import { eur } from "@/lib/dinero";
import type { Conjunto } from "@/types/villa";
import { fichasConjunto } from "./fichas";

const poligono = [[0, 0], [1, 0], [1, 1]] as const;
const conjunto: Conjunto = {
  imagen: "/aerea.webp",
  parcelas: [
    { villaId: "villa-1", poligono },
    { villaId: "villa-4", poligono },
  ],
};

describe("fichasConjunto", () => {
  it("una ficha por parcela con portada, 15 plazas, dormitorios y precio desde", () => {
    const [v1, v4] = fichasConjunto(conjunto, villas);
    expect(v4).toEqual({
      id: "villa-4",
      poligono,
      portada: villas.find((v) => v.id === "villa-4")!.hero.imagenDia,
      plazas: 15,
      dormitorios: 6,
      dormitoriosPendiente: false,
      precio: eur(523),
      precioEstimado: false,
    });
    expect(v1!.dormitoriosPendiente).toBe(true);
  });
});

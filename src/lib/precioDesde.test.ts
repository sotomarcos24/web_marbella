import { describe, expect, it } from "vitest";
import { tarifaDeVilla } from "@/content/tarifas";
import { eur } from "@/lib/dinero";
import type { Tarifa } from "@/types/tarifa";
import { precioDesde } from "./precioDesde";

const plana = (euros: number): Tarifa["meses"] =>
  Object.fromEntries(Array.from({ length: 12 }, (_, i) => [i + 1, { precioNoche: eur(euros) }])) as Tarifa["meses"];

describe("precioDesde", () => {
  it("devuelve el precio por noche mínimo de los 12 meses", () => {
    expect(precioDesde(tarifaDeVilla("villa-4"))).toEqual({ importe: eur(523), estimado: false });
    expect(precioDesde(tarifaDeVilla("villa-1"))).toEqual({ importe: eur(538), estimado: false });
  });

  it("villa-3: el estimado de julio no afecta porque no es el mínimo", () => {
    expect(precioDesde(tarifaDeVilla("villa-3"))).toEqual({ importe: eur(616), estimado: false });
  });

  it("marca estimado si el mes mínimo es estimado", () => {
    const tarifa: Tarifa = { villas: ["villa-1"], meses: { ...plana(900), 4: { precioNoche: eur(500), estimado: true } } };
    expect(precioDesde(tarifa)).toEqual({ importe: eur(500), estimado: true });
  });

  it("con empate, basta un mes confirmado al mínimo para no marcarlo", () => {
    const tarifa: Tarifa = { villas: ["villa-1"], meses: { ...plana(500), 4: { precioNoche: eur(500), estimado: true } } };
    expect(precioDesde(tarifa).estimado).toBe(false);
  });
});

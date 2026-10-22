import { describe, expectTypeOf, it } from "vitest";
import type { Foto } from "@/types/foto";
import type { Servicio, ServicioId } from "@/types/servicio";
import type { Mes, Tarifa } from "@/types/tarifa";
import type { Conjunto, Poligono, Recorrido, Villa, VillaId } from "@/types/villa";

// Comprobaciones de tipos: las verifica `npm run typecheck` (los @ts-expect-error fallan si dejan de ser errores).
describe("tipos del modelo", () => {
  it("Villa: capacidad 15 y campos de la Fase 2 opcionales", () => {
    expectTypeOf<Villa["plazasMax"]>().toEqualTypeOf<15>();
    expectTypeOf<Villa["destacadas"]>().toEqualTypeOf<readonly string[] | undefined>();
    expectTypeOf<Villa["recorrido"]>().toEqualTypeOf<readonly Recorrido[] | undefined>();
    expectTypeOf<VillaId>().toEqualTypeOf<"villa-1" | "villa-3" | "villa-4" | "villa-5">();
  });

  it("Poligono es una lista de pares [x, y]", () => {
    expectTypeOf<[[0, 0], [1, 0], [1, 1]]>().toExtend<Poligono>();
    // @ts-expect-error un vértice tiene exactamente dos coordenadas
    const malo: Poligono = [[0, 0, 0]];
    void malo;
  });

  it("Conjunto: imagen y parcelas por villa", () => {
    expectTypeOf<Conjunto["parcelas"][number]>().toEqualTypeOf<{ villaId: VillaId; poligono: Poligono }>();
    expectTypeOf<Recorrido>().toHaveProperty("transicion").toEqualTypeOf<string>();
    expectTypeOf<Recorrido>().toHaveProperty("imagenFinal").toEqualTypeOf<string>();
  });

  it("Tarifa: 12 meses en céntimos, con estimado opcional", () => {
    expectTypeOf<keyof Tarifa["meses"]>().toEqualTypeOf<Mes>();
    expectTypeOf<Tarifa["meses"][7]["precioNoche"]>().toEqualTypeOf<number>();
    expectTypeOf<Tarifa["meses"][7]["estimado"]>().toEqualTypeOf<true | undefined>();
  });

  it("Servicio: solo los 7 de SPEC §9", () => {
    expectTypeOf<ServicioId>().toEqualTypeOf<
      "chef-privado" | "limpieza-diaria" | "compra-previa" | "pack-desayuno" | "decoracion-bienvenida" | "catamaran" | "calefaccion-piscina"
    >();
    // @ts-expect-error sin traslados
    const traslado: ServicioId = "traslado";
    void traslado;
    expectTypeOf<Servicio["provisional"]>().toEqualTypeOf<true | undefined>();
    // Varias opciones con precio propio: los dos menús del chef.
    const chef: Servicio["opciones"] = [
      { id: "menu-paella", nombre: "servicios.chef.paella", precio: { tipo: "porPersona", adulto: 5500, nino: 3000, minimoComensales: 10 } },
      { id: "menu-barbacoa", nombre: "servicios.chef.barbacoa", precio: { tipo: "porPersona", adulto: 5500, nino: 2500, minimoComensales: 10 } },
    ];
    void chef;
  });

  it("Foto: campos del catálogo de SPEC §12", () => {
    expectTypeOf<Foto["zona"]>().toEqualTypeOf<"interior" | "exterior">();
    expectTypeOf<Foto["confianza"]>().toEqualTypeOf<"alta" | "baja">();
    expectTypeOf<Foto["alt"]>().toEqualTypeOf<{ es: string; en: string }>();
    expectTypeOf<Foto>().toHaveProperty("estanciaSugerida");
  });
});

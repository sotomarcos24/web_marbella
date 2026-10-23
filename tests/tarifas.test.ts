import { describe, expect, it } from "vitest";
import { reglas, suplementosHuesped, tarifaDeVilla, tarifas } from "@/content/tarifas";
import type { Mes } from "@/types/tarifa";
import type { VillaId } from "@/types/villa";

const MESES: readonly Mes[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// SPEC §8, € por noche con IVA, de enero a diciembre.
const SPEC: Record<"villa-1" | "villa-3" | "villa-4-5", readonly number[]> = {
  "villa-1": [616, 616, 989, 1456, 1568, 1344, 2016, 2016, 1568, 1232, 1064, 538],
  "villa-3": [616, 616, 989, 1456, 1568, 1120, 1792, 1792, 1568, 1232, 650, 653],
  "villa-4-5": [560, 560, 924, 1344, 1512, 1624, 1680, 1680, 1512, 1064, 591, 523],
};

const preciosDe = (id: VillaId) => MESES.map((m) => tarifaDeVilla(id).meses[m].precioNoche);
const enCentimos = (euros: readonly number[]) => euros.map((e) => e * 100);

describe("tarifas: tabla de SPEC §8", () => {
  it("villa-1 coincide mes a mes", () => {
    expect(preciosDe("villa-1")).toEqual(enCentimos(SPEC["villa-1"]));
  });

  it("villa-3 coincide mes a mes", () => {
    expect(preciosDe("villa-3")).toEqual(enCentimos(SPEC["villa-3"]));
  });

  it("villa-4 y villa-5 comparten tabla y coincide mes a mes", () => {
    expect(preciosDe("villa-4")).toEqual(enCentimos(SPEC["villa-4-5"]));
    expect(preciosDe("villa-5")).toEqual(enCentimos(SPEC["villa-4-5"]));
  });

  it("cada villa aparece en exactamente un grupo y hay tres grupos", () => {
    expect(tarifas).toHaveLength(3);
    const ids = tarifas.flatMap((t) => t.villas).sort();
    expect(ids).toEqual(["villa-1", "villa-3", "villa-4", "villa-5"]);
  });

  it("todos los importes son céntimos enteros positivos", () => {
    for (const t of tarifas) {
      for (const m of MESES) {
        const { precioNoche } = t.meses[m];
        expect(Number.isInteger(precioNoche)).toBe(true);
        expect(precioNoche).toBeGreaterThan(0);
      }
    }
  });

  it("solo villa-3 en julio es estimado", () => {
    expect(tarifaDeVilla("villa-3").meses[7].estimado).toBe(true);
    const estimados = tarifas.flatMap((t) =>
      MESES.filter((m) => t.meses[m].estimado).map((m) => `${t.villas.join("+")}:${m}`),
    );
    expect(estimados).toEqual(["villa-3:7"]);
  });
});

describe("tarifas: reglas comerciales", () => {
  it("estancia de 3 a 59 noches", () => {
    expect(reglas.estancia).toEqual({ minNoches: 3, maxNoches: 59 });
  });

  it("invierno: más de 28 noches entre diciembre y marzo", () => {
    expect(reglas.invierno).toEqual({ nochesSobre: 28, meses: [12, 1, 2, 3] });
  });

  it("entrada 16:00 y salida 10:00", () => {
    expect(reglas.horaEntrada).toBe("16:00");
    expect(reglas.horaSalida).toBe("10:00");
  });

  it("limpieza final 450 €, fianza 1.000 €, mascotas 200 €", () => {
    expect(reglas.limpiezaFinal).toBe(45000);
    expect(reglas.fianza).toBe(100000);
    expect(reglas.mascota).toBe(20000);
  });

  it("pagos 25 % al reservar y 75 % a 30 días de la llegada", () => {
    expect(reglas.pagos).toEqual({ porcentajeReserva: 25, porcentajeResto: 75, diasAntesResto: 30 });
  });

  it("cancelación gratuita hasta 60 días antes con cargo del 2 %", () => {
    expect(reglas.cancelacion).toEqual({ diasAntes: 60, cargoPorcentaje: 2 });
  });

  it("capacidad máxima 15 y suplemento desde el 13.º huésped", () => {
    expect(reglas.plazasMax).toBe(15);
    expect(reglas.suplementoDesdeHuesped).toBe(13);
  });
});

describe("tarifas: suplementos por huésped", () => {
  it("villa-4 y villa-5: 150 € todo el año", () => {
    expect(suplementosHuesped["villa-4"]).toEqual([{ importe: 15000 }]);
    expect(suplementosHuesped["villa-5"]).toEqual([{ importe: 15000 }]);
  });

  it("villa-1: 250 € en agosto; el resto del año 150 € estimado", () => {
    expect(suplementosHuesped["villa-1"]).toEqual([{ importe: 25000, meses: [8] }, { importe: 15000, estimado: true }]);
  });

  it("villa-3: 150 € estimado", () => {
    expect(suplementosHuesped["villa-3"]).toEqual([{ importe: 15000, estimado: true }]);
  });
});

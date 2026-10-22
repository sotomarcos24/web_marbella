import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { eur } from "@/lib/dinero";
import { calcularPrecio, valoresMensajes } from "@/lib/pricing";
import {
  CODIGOS_AVISO,
  CODIGOS_ERROR,
  type DesglosePrecio,
  type ResultadoPrecio,
  type SolicitudPrecio,
} from "@/types/precio";

const HOY = "2027-01-15";

const base: SolicitudPrecio = {
  villa: "villa-4",
  entrada: "2027-08-01",
  salida: "2027-08-04",
  huespedes: 10,
  hoy: HOY,
};

const calcular = (cambios: Partial<SolicitudPrecio> = {}) => calcularPrecio({ ...base, ...cambios });

function precio(cambios: Partial<SolicitudPrecio> = {}): DesglosePrecio {
  const r = calcular(cambios);
  if (r.tipo !== "precio") throw new Error(`esperaba precio, llegó ${JSON.stringify(r)}`);
  return r;
}

function errores(cambios: Partial<SolicitudPrecio>) {
  const r = calcular(cambios);
  if (r.tipo !== "error") throw new Error(`esperaba error, llegó ${r.tipo}`);
  return r.errores;
}

describe("calcularPrecio — casos mínimos (SPEC §10)", () => {
  it("villa-4, 3 noches de agosto, 10 huéspedes → 5.490 €; 25 % = 1.372,50 €", () => {
    const r = precio();
    expect(r.noches.map((n) => n.precio)).toEqual([eur(1680), eur(1680), eur(1680)]);
    expect(r.alojamiento).toBe(eur(5040));
    expect(r.limpiezaFinal).toBe(eur(450));
    expect(r.total).toBe(eur(5490));
    expect(r.pagos[0]).toEqual({ porcentaje: 25, importe: eur(1372.5), fecha: HOY });
  });

  it("villa-1, 30 jun → 3 jul → 5.826 €", () => {
    const r = precio({ villa: "villa-1", entrada: "2027-06-30", salida: "2027-07-03" });
    expect(r.noches).toEqual([
      { fecha: "2027-06-30", precio: eur(1344) },
      { fecha: "2027-07-01", precio: eur(2016) },
      { fecha: "2027-07-02", precio: eur(2016) },
    ]);
    expect(r.total).toBe(eur(5826));
  });

  it("villa-4, 14 huéspedes, 3 noches de agosto → +300 €", () => {
    const r = precio({ huespedes: 14 });
    expect(r.suplemento).toEqual({ personas: 2, unitario: eur(150), total: eur(300) });
    expect(r.total).toBe(eur(5490 + 300));
  });
});

describe("estancia y capacidad", () => {
  it("2 noches → error de estancia mínima", () => {
    expect(errores({ salida: "2027-08-03" })).toContain("estancia-minima");
  });

  it("60 noches → error de estancia máxima; 59 noches es válido", () => {
    expect(errores({ entrada: "2027-05-01", salida: "2027-06-30" })).toContain("estancia-maxima");
    expect(precio({ entrada: "2027-05-01", salida: "2027-06-29" }).noches).toHaveLength(59);
  });

  it("16 huéspedes → error de capacidad; 15 es válido", () => {
    expect(errores({ huespedes: 16 })).toContain("capacidad");
    expect(precio({ huespedes: 15 }).suplemento.personas).toBe(3);
  });

  it("fechas inválidas, salida no posterior, llegada pasada y cantidades no válidas", () => {
    expect(errores({ entrada: "2027-02-30" })).toContain("fechas-invalidas");
    expect(errores({ entrada: "agosto" })).toContain("fechas-invalidas");
    expect(errores({ salida: "2027-08-01" })).toContain("fechas-invalidas");
    expect(errores({ hoy: "2027-08-02" })).toContain("fecha-pasada");
    expect(errores({ huespedes: 0 })).toContain("huespedes-invalidos");
    expect(errores({ huespedes: 2.5 })).toContain("huespedes-invalidos");
    expect(errores({ mascotas: -1 })).toContain("mascotas-invalidas");
  });

  it("acumula varios errores a la vez", () => {
    expect(errores({ salida: "2027-08-03", huespedes: 16 })).toEqual(
      expect.arrayContaining(["estancia-minima", "capacidad"]),
    );
  });
});

describe("pagos", () => {
  it("llegada en 20 días → 100 % al reservar", () => {
    const r = precio({ entrada: "2027-02-04", salida: "2027-02-07" });
    expect(r.pagos).toEqual([{ porcentaje: 100, importe: r.total, fecha: HOY }]);
  });

  it("llegada en ≥30 días → 25 % hoy y 75 % 30 días antes, cuadrando al céntimo", () => {
    for (const [entrada, salida, fechaResto] of [
      ["2027-02-14", "2027-02-17", "2027-01-15"],
      ["2027-03-01", "2027-03-04", "2027-01-30"],
    ] as const) {
      const r = precio({ entrada, salida });
      expect(r.pagos.map((p) => [p.porcentaje, p.fecha])).toEqual([
        [25, HOY],
        [75, fechaResto],
      ]);
      const [reserva = 0, resto = 0] = r.pagos.map((p) => p.importe);
      expect(reserva).toBe(Math.round(r.total * 0.25));
      expect(reserva + resto).toBe(r.total);
    }
  });
});

describe("precio por noche según el mes", () => {
  it("cruce de año: 30 dic → 2 ene", () => {
    const r = precio({ entrada: "2027-12-30", salida: "2028-01-02" });
    expect(r.noches).toEqual([
      { fecha: "2027-12-30", precio: eur(523) },
      { fecha: "2027-12-31", precio: eur(523) },
      { fecha: "2028-01-01", precio: eur(560) },
    ]);
    expect(r.alojamiento).toBe(eur(523 * 2 + 560));
  });

  it("cruce de año bisiesto: 28 feb → 2 mar 2028 incluye el 29 de febrero", () => {
    const r = precio({ entrada: "2028-02-28", salida: "2028-03-02" });
    expect(r.noches.map((n) => [n.fecha, n.precio])).toEqual([
      ["2028-02-28", eur(560)],
      ["2028-02-29", eur(560)],
      ["2028-03-01", eur(924)],
    ]);
  });
});

describe("estancia de invierno", () => {
  it("más de 28 noches en dic–mar → aviso de oferta, sin precio", () => {
    const r: ResultadoPrecio = calcular({ entrada: "2027-12-01", salida: "2027-12-30" });
    expect(r).toEqual({ tipo: "oferta-invierno", noches: 29, avisos: ["oferta-invierno"] });
    expect(r).not.toHaveProperty("total");
  });

  it("28 noches en dic–mar sí tienen precio", () => {
    expect(precio({ entrada: "2027-12-01", salida: "2027-12-29" }).noches).toHaveLength(28);
  });

  it("solo cuentan las noches de dic–mar: 40 noches con 28 en marzo tienen precio", () => {
    expect(precio({ entrada: "2028-03-04", salida: "2028-04-13" }).noches).toHaveLength(40);
  });

  it("60 noches de invierno → error de máximo, no oferta", () => {
    expect(errores({ entrada: "2027-12-01", salida: "2028-01-30" })).toContain("estancia-maxima");
  });
});

describe("suplementos, mascotas y extras", () => {
  it("villa-1: 250 € por persona solo si alguna noche cae en agosto", () => {
    const julio = precio({ villa: "villa-1", entrada: "2027-07-10", salida: "2027-07-13", huespedes: 14 });
    expect(julio.suplemento.total).toBe(0);
    const agosto = precio({ villa: "villa-1", huespedes: 14 });
    expect(agosto.suplemento).toEqual({ personas: 2, unitario: eur(250), total: eur(500) });
    const cruce = precio({ villa: "villa-1", entrada: "2027-07-30", salida: "2027-08-02", huespedes: 13 });
    expect(cruce.suplemento.total).toBe(eur(250));
  });

  it("villa-3: 150 € estimado, con aviso de tarifa estimada", () => {
    const r = precio({ villa: "villa-3", entrada: "2027-09-01", salida: "2027-09-04", huespedes: 13 });
    expect(r.suplemento).toEqual({ personas: 1, unitario: eur(150), total: eur(150), estimado: true });
    expect(r.avisos).toContain("tarifa-estimada");
  });

  it("hasta 12 huéspedes no hay suplemento", () => {
    expect(precio({ huespedes: 12 }).suplemento).toEqual({ personas: 0, unitario: eur(150), total: 0 });
  });

  it("mascotas: 200 € cada una, suman al total", () => {
    const r = precio({ mascotas: 2 });
    expect(r.mascotas).toBe(eur(400));
    expect(r.total).toBe(eur(5490 + 400));
  });

  it("extras de cada tipo de precio suman al total", () => {
    const r = precio({
      extras: [
        { servicio: "pack-desayuno", opcion: "pack" },
        { servicio: "compra-previa", opcion: "gestion", compra: eur(350) },
        { servicio: "calefaccion-piscina", opcion: "dia" },
        { servicio: "limpieza-diaria", opcion: "diaria", cantidad: 2 },
        { servicio: "chef-privado", opcion: "paella", adultos: 10, ninos: 2 },
      ],
    });
    expect(r.extras.map((e) => e.importe)).toEqual([eur(90), eur(160), eur(270), eur(250), eur(610)]);
    expect(r.total).toBe(eur(5490 + 90 + 160 + 270 + 250 + 610));
    expect(r.avisos).toContain("servicio-provisional");
  });

  it("catamarán: bajo presupuesto, sin importe ni efecto en el total", () => {
    const r = precio({ extras: [{ servicio: "catamaran", opcion: "4h" }] });
    expect(r.extras).toEqual([{ servicio: "catamaran", opcion: "4h", importe: null }]);
    expect(r.total).toBe(eur(5490));
    expect(r.avisos).toContain("servicio-bajo-presupuesto");
  });

  it("extras no válidos → error", () => {
    for (const extra of [
      { servicio: "chef-privado", opcion: "paella", adultos: 6, ninos: 2 },
      { servicio: "chef-privado", opcion: "sushi", adultos: 10 },
      { servicio: "compra-previa", opcion: "gestion" },
      { servicio: "pack-desayuno", opcion: "pack", cantidad: 0 },
    ] as const) {
      expect(errores({ extras: [extra] })).toContain("extra-invalido");
    }
  });
});

describe("fianza, cancelación y avisos", () => {
  it("fianza de 1.000 € aparte del total", () => {
    const r = precio();
    expect(r.fianza).toBe(eur(1000));
    expect(r.total).toBe(eur(5490));
  });

  it("fecha límite de cancelación gratuita = llegada − 60 días", () => {
    expect(precio().cancelacionGratuitaHasta).toBe("2027-06-02");
    expect(precio().avisos).not.toContain("cancelacion-gratuita-vencida");
    expect(precio({ hoy: "2027-07-12" }).avisos).toContain("cancelacion-gratuita-vencida");
  });

  it("aviso de limpieza cada 2 días incluida, siempre", () => {
    expect(precio().avisos).toContain("limpieza-cada-2-dias-incluida");
  });

  it("tarifa estimada: villa-3 en julio marca las noches y avisa", () => {
    const r = precio({ villa: "villa-3", entrada: "2027-07-10", salida: "2027-07-13" });
    expect(r.noches.every((n) => n.estimado)).toBe(true);
    expect(r.avisos).toContain("tarifa-estimada");
    expect(precio().avisos).not.toContain("tarifa-estimada");
  });

  it("cada código de error y de aviso tiene texto en es y en, con marcadores que vienen de las reglas", () => {
    for (const { pricing } of [es, en]) {
      for (const c of CODIGOS_ERROR) expect(pricing.errores[c], c).toBeTruthy();
      for (const c of CODIGOS_AVISO) expect(pricing.avisos[c], c).toBeTruthy();
      const marcadores = [...Object.values(pricing.errores), ...Object.values(pricing.avisos)].flatMap((texto) =>
        [...texto.matchAll(/\{(\w+)\}/g)].map((m) => m[1]),
      );
      expect(marcadores.filter((m) => !(m && m in valoresMensajes))).toEqual([]);
      expect(Object.values(pricing.errores).join(" ")).not.toMatch(/\d/);
    }
  });
});

describe("pureza", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });

  it("no depende del reloj del sistema", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
    const a = calcular({ huespedes: 14, mascotas: 1 });
    vi.setSystemTime(new Date("2035-06-15T23:59:59Z"));
    const b = calcular({ huespedes: 14, mascotas: 1 });
    expect(a).toEqual(b);
  });

  it("no depende de la zona horaria (fechas en UTC)", () => {
    const resultados = ["Pacific/Kiritimati", "America/Los_Angeles", "UTC"].map((tz) => {
      vi.stubEnv("TZ", tz);
      return calcular({ entrada: "2027-12-30", salida: "2028-01-02" });
    });
    expect(resultados[0]).toEqual(resultados[2]);
    expect(resultados[1]).toEqual(resultados[2]);
  });

  it("el código no lee el reloj", () => {
    const fuente = readFileSync("src/lib/pricing.ts", "utf8");
    expect(fuente).not.toMatch(/Date\.now|new Date\(\s*\)/);
  });
});

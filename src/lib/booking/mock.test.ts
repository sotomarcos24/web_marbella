import { describe, expect, it, vi } from "vitest";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { villas } from "@/content/villas";
import { aDia, calcularPrecio } from "@/lib/pricing";
import type { ResultadoPrecio, SolicitudPrecio } from "@/types/precio";
import type { VillaId } from "@/types/villa";
import { MockBookingProvider, seSolapan, type Ocupados } from "./mock";
import ocupadosInventados from "./occupied.json";
import { CODIGOS_ERROR_RESERVA } from "./types";

const VILLAS = villas.map((v) => v.id);
const HOY = "2027-01-15";

// Villa-4 ocupada del 10 al 17 de agosto (salida el 17).
const ocupados: Ocupados = {
  "villa-1": [],
  "villa-3": [],
  "villa-4": [{ entrada: "2027-08-10", salida: "2027-08-17" }],
  "villa-5": [],
};

const proveedor = () => new MockBookingProvider({ ocupados });
const libre = (villa: VillaId, entrada: string, salida: string) =>
  proveedor().disponibilidad(villa, { entrada, salida }).then((d) => d.libre);

const solicitud = (cambios: Partial<SolicitudPrecio> = {}): SolicitudPrecio => ({
  villa: "villa-4",
  entrada: "2027-08-01",
  salida: "2027-08-04",
  huespedes: 10,
  hoy: HOY,
  ...cambios,
});

describe("occupied.json", () => {
  const datos: Ocupados = ocupadosInventados;

  it("tiene las 4 villas y ≥3 rangos en cada una", () => {
    expect(Object.keys(datos).sort()).toEqual([...VILLAS].sort());
    for (const v of VILLAS) expect(datos[v].length, v).toBeGreaterThanOrEqual(3);
  });

  it("rangos con fechas válidas, entrada < salida y sin solapes en la misma villa", () => {
    for (const v of VILLAS) {
      const rangos = datos[v];
      for (const r of rangos) {
        expect(aDia(r.entrada) !== null && aDia(r.salida) !== null, `${v} ${JSON.stringify(r)}`).toBe(true);
        expect(r.entrada < r.salida, `${v} ${JSON.stringify(r)}`).toBe(true);
      }
      rangos.forEach((a, i) => rangos.slice(i + 1).forEach((b) => expect(seSolapan(a, b), v).toBe(false)));
    }
  });

  it("el proveedor sin opciones usa estos datos", async () => {
    const r = datos["villa-1"][0];
    if (!r) throw new Error("villa-1 sin rangos");
    const d = await new MockBookingProvider().disponibilidad("villa-1", r);
    expect(d).toEqual({ libre: false, ocupados: [r] });
  });
});

describe("disponibilidad", () => {
  it("rango libre", async () => {
    expect(await libre("villa-4", "2027-08-01", "2027-08-05")).toBe(true);
  });

  it.each([
    ["invertido", "2027-08-05", "2027-08-01"],
    ["vacío", "2027-08-05", "2027-08-05"],
  ])("rango %s → no libre (fechas no válidas)", async (_, entrada, salida) => {
    expect(await libre("villa-4", entrada, salida)).toBe(false);
  });

  it("rango idéntico a uno ocupado → ocupado, y devuelve el conflicto", async () => {
    const d = await proveedor().disponibilidad("villa-4", { entrada: "2027-08-10", salida: "2027-08-17" });
    expect(d).toEqual({ libre: false, ocupados: [{ entrada: "2027-08-10", salida: "2027-08-17" }] });
  });

  it("solape parcial por delante y por detrás → ocupado", async () => {
    expect(await libre("villa-4", "2027-08-07", "2027-08-11")).toBe(false);
    expect(await libre("villa-4", "2027-08-16", "2027-08-20")).toBe(false);
  });

  it("rango que engloba o queda dentro de uno ocupado → ocupado", async () => {
    expect(await libre("villa-4", "2027-08-05", "2027-08-25")).toBe(false);
    expect(await libre("villa-4", "2027-08-12", "2027-08-15")).toBe(false);
  });

  it("contiguo: salir el día que otro entra, o entrar el día que otro sale → libre", async () => {
    expect(await libre("villa-4", "2027-08-07", "2027-08-10")).toBe(true);
    expect(await libre("villa-4", "2027-08-17", "2027-08-20")).toBe(true);
  });

  it("las ocupaciones de una villa no afectan a otra", async () => {
    expect(await libre("villa-5", "2027-08-10", "2027-08-17")).toBe(true);
  });
});

describe("cotizar", () => {
  it("delega en la calculadora: le pasa la solicitud tal cual y devuelve su resultado", async () => {
    const resultado: ResultadoPrecio = { tipo: "error", errores: ["capacidad"] };
    const calcular = vi.fn(() => resultado);
    const s = solicitud();
    expect(await new MockBookingProvider({ ocupados, calcular }).cotizar(s)).toBe(resultado);
    expect(calcular).toHaveBeenCalledExactlyOnceWith(s);
  });

  it("por defecto usa calcularPrecio de pricing", async () => {
    const s = solicitud({ huespedes: 14 });
    expect(await proveedor().cotizar(s)).toEqual(calcularPrecio(s));
  });
});

describe("crearReserva", () => {
  it("rechaza fechas ocupadas", async () => {
    const r = await proveedor().crearReserva(solicitud({ entrada: "2027-08-15", salida: "2027-08-19" }));
    expect(r).toEqual({ tipo: "error", errores: ["fechas-ocupadas"] });
  });

  it("propaga los errores de la calculadora (y suma el de ocupación si aplica)", async () => {
    const r = await proveedor().crearReserva(solicitud({ entrada: "2027-08-15", salida: "2027-08-19", huespedes: 16 }));
    expect(r).toEqual({ tipo: "error", errores: ["capacidad", "fechas-ocupadas"] });
  });

  it("estancia larga de invierno → requiere oferta, no se reserva", async () => {
    const r = await proveedor().crearReserva(solicitud({ entrada: "2027-12-01", salida: "2027-12-30" }));
    expect(r).toEqual({ tipo: "error", errores: ["requiere-oferta"] });
  });

  it("fechas libres → reserva con el desglose de la calculadora", async () => {
    const s = solicitud();
    const r = await proveedor().crearReserva(s);
    expect(r).toEqual({
      tipo: "reserva",
      reserva: {
        id: expect.any(String),
        villa: "villa-4",
        entrada: "2027-08-01",
        salida: "2027-08-04",
        huespedes: 10,
        desglose: calcularPrecio(s),
      },
    });
  });

  it("una reserva creada ocupa sus fechas: la segunda igual se rechaza", async () => {
    const p = proveedor();
    expect((await p.crearReserva(solicitud())).tipo).toBe("reserva");
    expect(await p.disponibilidad("villa-4", { entrada: "2027-08-03", salida: "2027-08-06" })).toEqual({
      libre: false,
      ocupados: [{ entrada: "2027-08-01", salida: "2027-08-04" }],
    });
    expect(await p.crearReserva(solicitud())).toEqual({ tipo: "error", errores: ["fechas-ocupadas"] });
  });

  it("ids distintos para reservas distintas", async () => {
    const p = proveedor();
    const a = await p.crearReserva(solicitud());
    const b = await p.crearReserva(solicitud({ entrada: "2027-08-20", salida: "2027-08-23" }));
    if (a.tipo !== "reserva" || b.tipo !== "reserva") throw new Error("esperaba dos reservas");
    expect(a.reserva.id).not.toBe(b.reserva.id);
  });

  it("no modifica los datos de ocupación que recibe", async () => {
    const propios: Ocupados = { ...ocupados, "villa-4": [...ocupados["villa-4"]] };
    await new MockBookingProvider({ ocupados: propios }).crearReserva(solicitud());
    expect(propios["villa-4"]).toHaveLength(1);
  });
});

describe("mensajes", () => {
  it("cada código de error de reserva tiene texto en es y en", () => {
    for (const { booking } of [es, en]) {
      for (const c of CODIGOS_ERROR_RESERVA) expect(booking.errores[c], c).toBeTruthy();
    }
  });
});

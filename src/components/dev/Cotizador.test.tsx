// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatEuros, formatFecha } from "@/lib/format";
import { bookingProvider } from "@/lib/booking";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { Cotizador } from "./Cotizador";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const locales = [
  ["es", es],
  ["en", en],
] as const;

describe.each(locales)("Cotizador (%s)", (locale, messages) => {
  const m = messages.DevCotizador;
  // Testing Library normaliza los espacios del DOM (el NBSP de Intl) pero no el texto buscado.
  const eur = (c: number) => formatEuros(c, locale).replace(/\s/g, " ");

  beforeEach(() => {
    render(
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Cotizador />
      </NextIntlClientProvider>,
    );
  });

  const set = (label: string, value: string) =>
    fireEvent.change(screen.getByLabelText(label), { target: { value } });

  const cotizar = async (c: {
    villa: string;
    entrada: string;
    salida: string;
    huespedes: string;
    mascotas?: string;
  }) => {
    set(m.form.hoy, "2027-01-15");
    set(m.form.villa, c.villa);
    set(m.form.entrada, c.entrada);
    set(m.form.salida, c.salida);
    set(m.form.huespedes, c.huespedes);
    set(m.form.mascotas, c.mascotas ?? "0");
    fireEvent.click(screen.getByRole("button", { name: m.form.calcular }));
    await screen.findByRole("region", { name: m.result.title });
  };
  const resultado = () => within(screen.getByRole("region", { name: m.result.title }));

  it("tiene título y los campos del formulario: villa, fechas, huéspedes, mascotas y extras", () => {
    expect(screen.getByRole("heading", { level: 1, name: m.title })).toBeTruthy();
    for (const label of [m.form.villa, m.form.entrada, m.form.salida, m.form.huespedes, m.form.mascotas]) {
      expect(screen.getByLabelText(label)).toBeTruthy();
    }
    expect(screen.getByRole("group", { name: m.form.extras })).toBeTruthy();
    expect(screen.getByRole("button", { name: m.form.calcular })).toBeTruthy();
  });

  it("ofrece las 4 villas", () => {
    const options = within(screen.getByLabelText(m.form.villa)).getAllByRole("option");
    expect(options.map((o) => o.getAttribute("value"))).toEqual(["villa-1", "villa-3", "villa-4", "villa-5"]);
  });

  it("ejemplo de #9: villa-4, 3 noches de agosto = 5.490 € y primer pago 25 %", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-08-01", salida: "2027-08-04", huespedes: "10" });
    expect(resultado().getByText(eur(549000))).toBeTruthy();
    expect(resultado().getByText(eur(137250))).toBeTruthy();
  });

  it("ejemplo de #9: villa-1, 30 jun–3 jul = 5.826 €", async () => {
    await cotizar({ villa: "villa-1", entrada: "2027-06-30", salida: "2027-07-03", huespedes: "10" });
    expect(resultado().getByText(eur(582600))).toBeTruthy();
  });

  it("muestra el desglose completo: noches, fianza aparte, pagos con fecha y límite de cancelación", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-08-01", salida: "2027-08-04", huespedes: "10" });
    const r = resultado();
    for (const label of [
      m.result.noches,
      m.result.alojamiento,
      m.result.limpiezaFinal,
      m.result.suplemento,
      m.result.mascotas,
      m.result.total,
      m.result.fianza,
      m.result.pagos,
      m.result.cancelacion,
    ]) {
      expect(r.getByText(label)).toBeTruthy();
    }
    expect(r.getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
    expect(r.getByText(eur(100000))).toBeTruthy();
    expect(r.getByText(formatFecha("2027-07-02", locale))).toBeTruthy();
  });

  it("muestra el error traducido con sus valores (capacidad)", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-08-01", salida: "2027-08-04", huespedes: "16" });
    expect(resultado().getByText(m.result.errores)).toBeTruthy();
    expect(resultado().getByText(new RegExp("15"))).toBeTruthy();
    expect(resultado().queryByText(m.result.total)).toBeNull();
  });

  it("muestra la oferta de invierno en estancias largas de invierno", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-12-01", salida: "2028-01-15", huespedes: "10" });
    expect(resultado().getByText(m.result.oferta)).toBeTruthy();
    // 1 dic–15 ene: 45 noches, con su etiqueta.
    expect(resultado().getByText(m.result.noches)).toBeTruthy();
    expect(resultado().getByText("45")).toBeTruthy();
  });

  it("muestra los avisos del desglose traducidos (tarifa estimada de villa-3 en julio)", async () => {
    await cotizar({ villa: "villa-3", entrada: "2027-07-10", salida: "2027-07-13", huespedes: "10" });
    const r = resultado();
    expect(r.getByText(m.result.avisos)).toBeTruthy();
    expect(r.getByText(messages.pricing.avisos["limpieza-cada-2-dias-incluida"])).toBeTruthy();
    expect(r.getByText(messages.pricing.avisos["tarifa-estimada"])).toBeTruthy();
    expect(r.queryByText(messages.pricing.avisos["cancelacion-gratuita-vencida"].split("{")[0] ?? "", { exact: false })).toBeNull();
  });

  it("cancelación gratuita vencida: sin fila de fecha límite, solo el aviso", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-02-20", salida: "2027-02-23", huespedes: "10" });
    const r = resultado();
    expect(r.queryByText(m.result.cancelacion)).toBeNull();
    expect(r.getByText(messages.pricing.avisos["cancelacion-gratuita-vencida"].split("{")[0] ?? "", { exact: false })).toBeTruthy();
  });

  it("muestra disponibilidad libre", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-08-01", salida: "2027-08-04", huespedes: "10" });
    expect(screen.getByText(m.disponibilidad.libre)).toBeTruthy();
  });

  it("muestra disponibilidad ocupada con los rangos", async () => {
    await cotizar({ villa: "villa-4", entrada: "2027-07-20", salida: "2027-07-24", huespedes: "10" });
    expect(screen.getByText(m.disponibilidad.ocupada)).toBeTruthy();
    expect(screen.getByText(m.disponibilidad.ocupados)).toBeTruthy();
  });

  it("un extra de pago directo suma al total y uno bajo presupuesto sale 'a consultar'", async () => {
    fireEvent.click(screen.getByLabelText(messages.servicios["pack-desayuno"].nombre));
    fireEvent.click(screen.getByLabelText(messages.servicios.catamaran.nombre));
    await cotizar({ villa: "villa-4", entrada: "2027-08-01", salida: "2027-08-04", huespedes: "10" });
    expect(resultado().getByText(eur(549000 + 9000))).toBeTruthy();
    expect(resultado().getByText(m.result.aConsultar)).toBeTruthy();
  });

  it("usa el BookingProvider (cotizar y disponibilidad)", async () => {
    const cot = vi.spyOn(bookingProvider, "cotizar");
    const disp = vi.spyOn(bookingProvider, "disponibilidad");
    await cotizar({ villa: "villa-5", entrada: "2027-08-20", salida: "2027-08-23", huespedes: "8" });
    await waitFor(() => expect(cot).toHaveBeenCalledTimes(1));
    expect(cot.mock.calls[0]?.[0]).toMatchObject({ villa: "villa-5", huespedes: 8, hoy: "2027-01-15" });
    expect(disp).toHaveBeenCalledWith("villa-5", { entrada: "2027-08-20", salida: "2027-08-23" });
  });
});

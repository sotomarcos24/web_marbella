// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import CotizadorPage from "./page";

vi.mock("next-intl/server", () => ({
  getMessages: async () => es,
}));

afterEach(cleanup);

type Provider = ReactElement<{ messages: Record<string, unknown>; children: ReactElement }>;

describe("página /dev/cotizador", () => {
  it("envía al cliente todos los textos que usa el cotizador (sin MISSING_MESSAGE)", async () => {
    const pagina = (await CotizadorPage()) as Provider;
    const onError = vi.fn();
    // Igual que en la app: el cotizador solo ve los mensajes que le pasa su página.
    render(
      <NextIntlClientProvider locale="es" messages={pagina.props.messages} onError={onError}>
        {pagina.props.children}
      </NextIntlClientProvider>,
    );

    const m = es.DevCotizador;
    fireEvent.click(screen.getByLabelText(es.servicios["pack-desayuno"].nombre));
    fireEvent.change(screen.getByLabelText(m.form.villa), { target: { value: "villa-3" } });
    fireEvent.change(screen.getByLabelText(m.form.entrada), { target: { value: "2027-07-10" } });
    fireEvent.change(screen.getByLabelText(m.form.salida), { target: { value: "2027-07-13" } });
    fireEvent.click(screen.getByRole("button", { name: m.form.calcular }));
    await screen.findByRole("region", { name: m.result.title });

    expect(onError).not.toHaveBeenCalled();
  });
});

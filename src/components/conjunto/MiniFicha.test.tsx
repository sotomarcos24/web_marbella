// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it } from "vitest";
import { eur } from "@/lib/dinero";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { MiniFicha } from "./MiniFicha";
import type { FichaVilla } from "./fichas";

afterEach(cleanup);

const ficha: FichaVilla = {
  id: "villa-4",
  poligono: [[0, 0], [1, 0], [1, 1]],
  portada: "/p.webp",
  plazas: 15,
  dormitorios: 6,
  dormitoriosPendiente: false,
  precio: eur(523),
  precioEstimado: false,
};

function renderFicha(props: Partial<FichaVilla> = {}) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <MiniFicha ficha={{ ...ficha, ...props }} />
    </NextIntlClientProvider>,
  );
}

describe("MiniFicha", () => {
  it("muestra nombre, 15 plazas, dormitorios y precio desde formateado", () => {
    const { container } = renderFicha();
    expect(screen.getByText("Villa 4")).toBeTruthy();
    const texto = container.textContent!.replace(/\s/g, " ");
    expect(texto).toContain("15 plazas");
    expect(texto).toContain("6 dormitorios");
    expect(texto).toMatch(/Desde 523,00 € \/ noche/);
    expect(texto).not.toContain(es.Conjunto.pendiente);
    expect(texto).not.toContain(es.Conjunto.estimado);
  });

  it("marca los dormitorios pendientes de confirmar", () => {
    const { container } = renderFicha({ id: "villa-1", dormitorios: 7, dormitoriosPendiente: true });
    expect(container.textContent).toContain(es.Conjunto.pendiente);
  });

  it("marca el precio estimado", () => {
    const { container } = renderFicha({ precioEstimado: true });
    expect(container.textContent).toContain(es.Conjunto.estimado);
  });

  it("los textos del conjunto existen en es y en con las mismas claves", () => {
    expect(Object.keys(en.Conjunto).sort()).toEqual(Object.keys(es.Conjunto).sort());
  });
});

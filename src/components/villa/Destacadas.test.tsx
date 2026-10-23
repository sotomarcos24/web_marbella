// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import { Destacadas } from "./Destacadas";

// jsdom no mide cajas: la animación de layout de vuelta a la tarjeta nunca termina y AnimatePresence
// no desmonta la vista abierta. Aquí se prueba la lógica; la animación, en el navegador.
vi.mock("motion/react", async (original) => ({
  ...(await original<typeof import("motion/react")>()),
  AnimatePresence: ({ children }: { children: ReactNode }) => children,
}));
afterEach(cleanup);

const tarjetas = [
  { id: "salon", nombre: "Salón", foto: "/images/villas/villa-4/salon.webp" },
  { id: "cocina", nombre: "Cocina", foto: "/images/villas/villa-4/cocina.webp" },
  { id: "bodega", nombre: "Bodega", foto: "/images/villas/villa-4/bodega.webp" },
];
const textos = es.VillaPage.destacadas;

function renderDestacadas(lista = tarjetas) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Destacadas tarjetas={lista} />
    </NextIntlClientProvider>,
  );
}

describe("Destacadas", () => {
  it("sección con titular serif y una tarjeta en arco por destacada, en orden", () => {
    const { container } = renderDestacadas();
    const titular = screen.getByRole("heading", { level: 2, name: textos.titulo });
    expect(titular.className).toContain("font-display");
    const botones = within(container.querySelector("section")!).getAllByRole("button");
    expect(botones.map((b) => b.textContent)).toEqual([
      textos.estancias.salon.nombre,
      textos.estancias.cocina.nombre,
      "Bodega",
    ]);
    const imagenes = container.querySelectorAll("section img");
    expect([...imagenes].map((img) => img.getAttribute("src"))).toEqual(tarjetas.map((t) => t.foto));
    expect(container.querySelectorAll("[data-arco]")).toHaveLength(3);
  });

  it("clic abre la tarjeta a pantalla completa con su nombre y su frase", () => {
    renderDestacadas();
    fireEvent.click(screen.getByRole("button", { name: textos.estancias.salon.nombre }));
    const dialogo = screen.getByRole("dialog", { name: textos.estancias.salon.nombre });
    expect(dialogo.className).toContain("fixed");
    expect(dialogo.className).toContain("inset-0");
    expect(within(dialogo).getByRole("heading", { name: textos.estancias.salon.nombre })).toBeTruthy();
    expect(within(dialogo).getByText(textos.estancias.salon.frase)).toBeTruthy();
    expect(dialogo.querySelector("img")!.getAttribute("src")).toBe(tarjetas[0]!.foto);
  });

  it("'Cerrar' vuelve a las tarjetas", () => {
    renderDestacadas();
    fireEvent.click(screen.getByRole("button", { name: textos.estancias.cocina.nombre }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: textos.cerrar }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape vuelve a las tarjetas", () => {
    renderDestacadas();
    fireEvent.click(screen.getByRole("button", { name: textos.estancias.cocina.nombre }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("sin texto propio usa el nombre de la estancia y no muestra frase", () => {
    renderDestacadas();
    fireEvent.click(screen.getByRole("button", { name: "Bodega" }));
    const dialogo = screen.getByRole("dialog", { name: "Bodega" });
    expect(dialogo.querySelector("p")).toBeNull();
  });

  it("sin tarjetas no pinta la sección", () => {
    const { container } = renderDestacadas([]);
    expect(container.querySelector("section")).toBeNull();
  });
});

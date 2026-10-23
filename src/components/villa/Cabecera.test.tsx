// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import type { Zona } from "@/types/villa";
import { Cabecera } from "./Cabecera";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/es/villas/villa-4",
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));
afterEach(() => {
  cleanup();
  push.mockClear();
});

const poligono = [[0, 0], [1, 0], [1, 1]] as const;
const zonas: Zona[] = [
  { id: "jardin", nombre: "Jardín", poligono, accion: "galeria", destino: "jardin" },
  { id: "planta-baja", nombre: "Planta baja", poligono, accion: "planta", destino: "planta-baja" },
  { id: "planta-alta", nombre: "Planta alta", poligono, accion: "planta", destino: "planta-alta" },
];
const villa = {
  id: "villa-4" as const,
  imagenDia: "/images/villas/villa-4/dia.webp",
  zonas,
  fotos: [
    { id: "salon", nombre: "Salón", fotos: [{ src: "/images/villas/villa-4/salon-1.webp", alt: "Salón 1" }] },
    {
      id: "jardin",
      nombre: "Jardín",
      fotos: [
        { src: "/images/villas/villa-4/jardin-1.webp", alt: "Jardín 1" },
        { src: "/images/villas/villa-4/jardin-2.webp", alt: "Jardín 2" },
      ],
    },
  ],
};

function renderCabecera(props: Partial<Parameters<typeof Cabecera>[0]> = {}) {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Cabecera {...villa} {...props} />
    </NextIntlClientProvider>,
  );
}

describe("Cabecera", () => {
  it("muestra la imagen de día a pantalla completa con las zonas ya visibles (empieza en la imagen fija)", () => {
    const { container } = renderCabecera();
    const img = container.querySelector("img")!;
    expect(img.getAttribute("src")).toContain("dia.webp");
    expect(img.className).toContain("object-cover");
    expect(container.querySelector("svg")!.getAttribute("class")).toContain("opacity-100");
    expect(screen.getByRole("button", { name: "Jardín" })).toBeTruthy();
  });

  it("jardín abre la galería del jardín", () => {
    renderCabecera();
    fireEvent.click(screen.getByRole("button", { name: "Jardín" }));
    const dialogo = screen.getByRole("dialog");
    expect(within(dialogo).getByRole("img").getAttribute("src")).toContain("jardin-1.webp");
    expect(within(dialogo).getByText("2 / 3")).toBeTruthy();
    fireEvent.click(within(dialogo).getByRole("button", { name: es.VillaPage.galeria.siguiente }));
    expect(within(dialogo).getByRole("img").getAttribute("src")).toContain("jardin-2.webp");
  });

  it("Escape cierra la galería", () => {
    renderCabecera();
    fireEvent.click(screen.getByRole("button", { name: "Jardín" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("planta baja y planta alta llevan al plano de esa planta", () => {
    renderCabecera();
    fireEvent.click(screen.getByRole("button", { name: "Planta baja" }));
    expect(push).toHaveBeenLastCalledWith("/es/villas/villa-4?planta=planta-baja#plano");
    fireEvent.click(screen.getByRole("button", { name: "Planta alta" }));
    expect(push).toHaveBeenLastCalledWith("/es/villas/villa-4?planta=planta-alta#plano");
  });

  it("sin imagenNoche no hay botón día/noche", () => {
    renderCabecera();
    expect(screen.queryByRole("button", { name: es.VillaPage.noche })).toBeNull();
    expect(screen.queryByRole("button", { name: es.VillaPage.dia })).toBeNull();
  });

  it("con imagenNoche el botón alterna entre día y noche", () => {
    const { container } = renderCabecera({ imagenNoche: "/images/villas/villa-4/noche.webp" });
    fireEvent.click(screen.getByRole("button", { name: es.VillaPage.noche }));
    expect(container.querySelector("img")!.getAttribute("src")).toContain("noche.webp");
    fireEvent.click(screen.getByRole("button", { name: es.VillaPage.dia }));
    expect(container.querySelector("img")!.getAttribute("src")).toContain("dia.webp");
  });

  it("'Ver todas las fotos' abre la galería con todas las fotos de la villa", () => {
    renderCabecera();
    fireEvent.click(screen.getByRole("button", { name: es.VillaPage.verTodas }));
    expect(within(screen.getByRole("dialog")).getByText("1 / 3")).toBeTruthy();
  });
});

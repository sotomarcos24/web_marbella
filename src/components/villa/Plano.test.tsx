// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import type { Dormitorio, Planta } from "@/types/villa";
import { Plano } from "./Plano";

const nav = vi.hoisted(() => ({ planta: null as string | null, replace: vi.fn() }));
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/es/villas/villa-4",
  useRouter: () => ({ push: vi.fn(), replace: nav.replace, prefetch: vi.fn() }),
  useSearchParams: () => new URLSearchParams(nav.planta ? `planta=${nav.planta}` : ""),
}));

let reducido = false;
beforeEach(() => {
  nav.planta = null;
  reducido = false;
  window.matchMedia = ((query: string) => ({
    matches: reducido && query.includes("reduce"),
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});
afterEach(() => {
  cleanup();
  nav.replace.mockClear();
});

const poligono = [[0.1, 0.1], [0.5, 0.1], [0.5, 0.5]] as const;
const plantas: Planta[] = [
  {
    id: "planta-baja",
    nombre: "zonas.planta-baja",
    imagenPlano: "/baja.webp",
    estancias: [
      { id: "salon", nombre: "Salón", tipo: "salon", poligono, fotos: ["/s1.webp", "/s2.webp"], medidas: "5 × 4 m" },
      { id: "pb-twin", nombre: "Dormitorio twin", tipo: "dormitorio", poligono, fotos: [] },
    ],
  },
  {
    id: "planta-alta",
    nombre: "zonas.planta-alta",
    imagenPlano: "/alta.webp",
    estancias: [{ id: "pa-suite-1", nombre: "Suite 1", tipo: "dormitorio", poligono, fotos: ["/a1.webp"] }],
  },
];
const dormitorios: Dormitorio[] = [
  { id: "pb-twin", planta: "baja", camas: [{ tipo: "individual", cantidad: 2 }], banoEnSuite: true },
  { id: "pa-suite-1", planta: "alta", camas: [{ tipo: "doble", cantidad: 1 }, { tipo: "individual", cantidad: 1 }], banoEnSuite: true },
];

function renderPlano() {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Plano plantas={plantas} dormitorios={dormitorios} estadoCamas="pendiente de confirmar" />
    </NextIntlClientProvider>,
  );
}

describe("Plano", () => {
  it("muestra la planta baja por defecto y su imagen", () => {
    renderPlano();
    expect(screen.getByRole("tab", { name: "Planta baja" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("img", { name: /planta baja/i }).getAttribute("src")).toBe("/baja.webp");
  });

  it("la query ?planta= elige la planta inicial", () => {
    nav.planta = "planta-alta";
    renderPlano();
    expect(screen.getByRole("tab", { name: "Planta alta" }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("button", { name: "Suite 1" })).toBeTruthy();
  });

  it("cambiar de planta actualiza la query y las estancias", () => {
    renderPlano();
    fireEvent.click(screen.getByRole("tab", { name: "Planta alta" }));
    expect(nav.replace).toHaveBeenCalledWith(expect.stringContaining("planta=planta-alta"), expect.anything());
    expect(screen.queryByRole("button", { name: "Salón" })).toBeNull();
    expect(screen.getByRole("button", { name: "Suite 1" })).toBeTruthy();
  });

  it("clic en un dormitorio abre el panel con camas, baño en suite y estado", () => {
    renderPlano();
    fireEvent.click(screen.getByRole("button", { name: "Dormitorio twin" }));
    const panel = screen.getByRole("complementary", { name: "Dormitorio twin" });
    expect(panel.textContent).toContain("2 camas individuales");
    expect(panel.textContent).toContain(es.Plano.banoEnSuite);
    expect(panel.textContent).toContain("pendiente de confirmar");
  });

  it("el panel muestra tipo, medidas y un carrusel de fotos", () => {
    renderPlano();
    fireEvent.click(screen.getByRole("button", { name: "Salón" }));
    const panel = screen.getByRole("complementary", { name: "Salón" });
    expect(panel.textContent).toContain("5 × 4 m");
    expect(panel.querySelector("img")?.getAttribute("src")).toBe("/s1.webp");
    fireEvent.click(screen.getByRole("button", { name: es.Plano.siguiente }));
    expect(panel.querySelector("img")?.getAttribute("src")).toBe("/s2.webp");
  });

  it("Escape cierra el panel", () => {
    renderPlano();
    fireEvent.click(screen.getByRole("button", { name: "Salón" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("«Volver a plantas» cierra el panel", () => {
    renderPlano();
    fireEvent.click(screen.getByRole("button", { name: "Salón" }));
    fireEvent.click(screen.getByRole("button", { name: es.Plano.volver }));
    expect(screen.queryByRole("complementary")).toBeNull();
  });

  it("inclina el plano en perspectiva al abrir el panel", () => {
    renderPlano();
    const plano = screen.getByTestId("plano-inclinable");
    expect(plano.style.transform).toBe("");
    fireEvent.click(screen.getByRole("button", { name: "Salón" }));
    expect(plano.style.transform).toContain("rotateX");
  });

  it("con reduced-motion no se inclina", () => {
    reducido = true;
    renderPlano();
    fireEvent.click(screen.getByRole("button", { name: "Salón" }));
    expect(screen.getByTestId("plano-inclinable").style.transform).toBe("");
  });
});

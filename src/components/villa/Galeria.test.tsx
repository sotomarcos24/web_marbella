// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, describe, expect, it, vi } from "vitest";
import es from "@/messages/es.json";
import { Galeria, type GrupoGaleria } from "./Galeria";

afterEach(cleanup);

const grupos: GrupoGaleria[] = [
  { id: "salon", nombre: "Salón", fotos: [{ src: "/s1.webp", alt: "Salón con sofás" }, { src: "/s2.webp", alt: "Salón con chimenea" }] },
  { id: "jardin", nombre: "Jardín", fotos: [{ src: "/j1.webp", alt: "Jardín con césped" }, { src: "/j2.webp", alt: "Jardín de noche" }] },
  { id: "vacio", nombre: "Vacío", fotos: [] },
];

function renderGaleria(props: Partial<Parameters<typeof Galeria>[0]> = {}) {
  const onCerrar = vi.fn();
  render(
    <NextIntlClientProvider locale="es" messages={es}>
      <Galeria grupos={grupos} onCerrar={onCerrar} {...props} />
    </NextIntlClientProvider>,
  );
  return { onCerrar, dialogo: screen.getByRole("dialog") };
}
const src = (d: HTMLElement) => within(d).getByRole("img").getAttribute("src");

describe("Galeria", () => {
  it("agrupa por estancias, empieza por el primer grupo y omite los grupos vacíos", () => {
    const { dialogo } = renderGaleria();
    expect(src(dialogo)).toBe("/s1.webp");
    expect(within(dialogo).getByText("1 / 4")).toBeTruthy();
    expect(within(dialogo).getAllByRole("tab").map((t) => t.textContent)).toEqual(["Salón", "Jardín"]);
    expect(within(dialogo).getByRole("tab", { name: "Salón" }).getAttribute("aria-selected")).toBe("true");
  });

  it("se abre en el grupo indicado (jardin)", () => {
    const { dialogo } = renderGaleria({ grupoInicial: "jardin" });
    expect(src(dialogo)).toBe("/j1.webp");
    expect(within(dialogo).getByText("3 / 4")).toBeTruthy();
    expect(within(dialogo).getByRole("tab", { name: "Jardín" }).getAttribute("aria-selected")).toBe("true");
  });

  it("elegir otro grupo salta a su foto principal", () => {
    const { dialogo } = renderGaleria();
    fireEvent.click(within(dialogo).getByRole("tab", { name: "Jardín" }));
    expect(src(dialogo)).toBe("/j1.webp");
  });

  it("muestra el alt de la foto", () => {
    const { dialogo } = renderGaleria();
    expect(within(dialogo).getByRole("img").getAttribute("alt")).toBe("Salón con sofás");
  });

  it("las flechas del teclado recorren los grupos en orden y dan la vuelta", () => {
    const { dialogo } = renderGaleria({ grupoInicial: "jardin" });
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(src(dialogo)).toBe("/j2.webp");
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(src(dialogo)).toBe("/s1.webp");
    expect(within(dialogo).getByRole("tab", { name: "Salón" }).getAttribute("aria-selected")).toBe("true");
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(src(dialogo)).toBe("/j2.webp");
  });

  it("los botones anterior/siguiente navegan", () => {
    const { dialogo } = renderGaleria();
    fireEvent.click(within(dialogo).getByRole("button", { name: es.VillaPage.galeria.siguiente }));
    expect(src(dialogo)).toBe("/s2.webp");
  });

  it("Escape cierra", () => {
    const { onCerrar } = renderGaleria();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onCerrar).toHaveBeenCalledTimes(1);
  });

  it("el foco entra en el diálogo y Tab no sale de él", () => {
    const { dialogo } = renderGaleria();
    expect(dialogo.contains(document.activeElement)).toBe(true);
    const foco = Array.from(dialogo.querySelectorAll<HTMLElement>("button, [tabindex]:not([tabindex='-1'])"));
    foco.at(-1)!.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(foco[0]);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(foco.at(-1));
  });

  it("al cerrar devuelve el foco al elemento que lo tenía", () => {
    render(<button>origen</button>);
    screen.getByText("origen").focus();
    const { unmount } = render(
      <NextIntlClientProvider locale="es" messages={es}>
        <Galeria grupos={grupos} onCerrar={() => {}} />
      </NextIntlClientProvider>,
    );
    unmount();
    expect(document.activeElement).toBe(screen.getByText("origen"));
  });
});

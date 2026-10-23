// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { siteConfig } from "@/config/site";
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import { Intro } from "./Intro";

// useScroll necesita layout real: se sustituye por un progreso que controla el test.
const scroll = vi.hoisted(() => ({ progreso: undefined as unknown as ReturnType<typeof motionValue<number>> }));
vi.mock("motion/react", async (original) => ({
  ...(await original<typeof import("motion/react")>()),
  useScroll: () => ({ scrollYProgress: scroll.progreso }),
}));

const lenis = vi.hoisted(() => ({ scrollTo: vi.fn() as ReturnType<typeof vi.fn>, instance: true }));
vi.mock("lenis/react", () => ({ useLenis: () => (lenis.instance ? { scrollTo: lenis.scrollTo } : undefined) }));

let reduced = false;
beforeEach(() => {
  scroll.progreso = motionValue(0);
  reduced = false;
  lenis.instance = true;
  vi.clearAllMocks();
  window.matchMedia = ((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" && reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

const textos = { entrar: "Entrar", aerea: "Vista aérea", pista: "Desliza", lema: "Cuatro villas" };

function aerea(container: HTMLElement) {
  return container.querySelector('img[src="/images/conjunto/aerea-provisional.webp"]') as HTMLElement;
}

describe("Intro", () => {
  it("pinta el arco SVG, la marca de site.ts y un botón accesible sobre fondo noche", () => {
    const { container } = render(<Intro textos={textos} />);
    expect(container.querySelector("svg[data-arco] path")).toBeTruthy();
    expect(screen.getByText(siteConfig.name)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy();
    expect(container.querySelector(".bg-noche")).toBeTruthy();
  });

  it("nubes en capas hechas con CSS/SVG, sin fotos", () => {
    const { container } = render(<Intro textos={textos} />);
    const capas = container.querySelectorAll("[data-nube]");
    expect(capas.length).toBeGreaterThanOrEqual(2);
    capas.forEach((capa) => expect(capa.querySelector("img")).toBeNull());
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("termina en la aérea provisional con su texto alternativo", () => {
    const { container } = render(<Intro textos={textos} />);
    expect(aerea(container).getAttribute("alt")).toBe("Vista aérea");
  });

  it("clic en el arco: avanza solo hasta el final con lenis.scrollTo", () => {
    render(<Intro textos={textos} duracion={4} />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(lenis.scrollTo).toHaveBeenCalledExactlyOnceWith(expect.any(Number), expect.objectContaining({ duration: 4 }));
  });

  it("clic sin Lenis: salta al final con window.scrollTo", () => {
    lenis.instance = false;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<Intro textos={textos} />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("rueda: la aérea avanza al ritmo del scroll y queda fija al llegar", async () => {
    const { container } = render(<Intro textos={textos} />);
    act(() => scroll.progreso.set(0.6));
    await waitFor(() => expect(aerea(container).style.transform).toMatch(/scale\(1\.\d+\)/));
    act(() => scroll.progreso.set(1));
    await waitFor(() => expect(aerea(container).style.opacity).toBe("1"));
    expect(aerea(container).style.transform).toMatch(/none|scale\(1\)/);
  });

  it("reduced-motion: arco estático y sin nubes", () => {
    reduced = true;
    const { container } = render(<Intro textos={textos} />);
    const trazo = container.querySelector("svg[data-arco]") as SVGElement;
    expect(trazo.dataset.estatico).toBe("true");
    expect(container.querySelectorAll("[data-nube]")).toHaveLength(0);
  });

  it("los textos de la intro existen en es y en", () => {
    expect(Object.keys(es.Intro).sort()).toEqual(Object.keys(textos).sort());
    expect(Object.keys(en.Intro).sort()).toEqual(Object.keys(textos).sort());
  });
});

// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { motionValue } from "motion/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollSequence } from "./ScrollSequence";

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

const base = { inicio: "/a.webp", llegada: "/b.webp", alt: "Villa", etiqueta: "Entrar" };

function mover(valor: number) {
  act(() => scroll.progreso.set(valor));
}

describe("ScrollSequence", () => {
  it("modo scroll por defecto: contenedor alto con hijo sticky y sin botón", () => {
    const { container } = render(<ScrollSequence {...base} />);
    const escena = container.firstElementChild as HTMLElement;
    expect(escena.dataset.modo).toBe("scroll");
    expect(escena.querySelector(".sticky")).toBeTruthy();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("modo clic: muestra un botón accesible", () => {
    const { container } = render(<ScrollSequence {...base} modo="clic" />);
    expect((container.firstElementChild as HTMLElement).dataset.modo).toBe("clic");
    expect(screen.getByRole("button", { name: "Entrar" })).toBeTruthy();
  });

  it("muestra la imagen de inicio y la de llegada", () => {
    const { container } = render(<ScrollSequence {...base} />);
    const srcs = [...container.querySelectorAll("img")].map((i) => i.getAttribute("src"));
    expect(srcs).toContain("/a.webp");
    expect(srcs).toContain("/b.webp");
  });

  it("emite onLlegada una sola vez al llegar a 1 con scroll", () => {
    const onLlegada = vi.fn();
    render(<ScrollSequence {...base} onLlegada={onLlegada} />);
    mover(0.5);
    expect(onLlegada).not.toHaveBeenCalled();
    mover(1);
    mover(1);
    expect(onLlegada).toHaveBeenCalledTimes(1);
  });

  it("vuelve a emitir onLlegada si se retrocede y se llega otra vez", () => {
    const onLlegada = vi.fn();
    render(<ScrollSequence {...base} onLlegada={onLlegada} />);
    mover(1);
    mover(0.3);
    mover(1);
    expect(onLlegada).toHaveBeenCalledTimes(2);
  });

  it("modo clic: avanza solo con animate() y emite onLlegada", async () => {
    const onLlegada = vi.fn();
    render(<ScrollSequence {...base} modo="clic" duracion={0.05} onLlegada={onLlegada} />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(onLlegada).toHaveBeenCalledTimes(1));
    expect(lenis.scrollTo).not.toHaveBeenCalled();
  });

  it("modo clic en el flujo de scroll: usa lenis.scrollTo", () => {
    render(<ScrollSequence {...base} modo="clic" enFlujo />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(lenis.scrollTo).toHaveBeenCalledTimes(1);
  });

  it("modo clic en el flujo sin Lenis (reduced-motion): salta con window.scrollTo", () => {
    lenis.instance = false;
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    render(<ScrollSequence {...base} modo="clic" enFlujo />);
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(scrollTo).toHaveBeenCalledTimes(1);
  });

  it("con reduced-motion no aplica zoom a la imagen de inicio", async () => {
    reduced = true;
    const { container } = render(<ScrollSequence {...base} />);
    mover(0.5);
    const inicio = container.querySelector('img[src="/a.webp"]') as HTMLElement;
    await waitFor(() => expect(inicio.style.transform ?? "").not.toMatch(/scale\((?!1\))/));
  });

  it("sin reduced-motion aplica zoom a la imagen de inicio", async () => {
    const { container } = render(<ScrollSequence {...base} />);
    mover(1);
    const inicio = container.querySelector('img[src="/a.webp"]') as HTMLElement;
    await waitFor(() => expect(inicio.style.transform).toMatch(/scale\(1\.\d+\)/));
  });

  it("encuadre: aplica object-position a todas las imágenes", () => {
    const { container } = render(<ScrollSequence {...base} encuadre="50% 55%" />);
    const imgs = [...container.querySelectorAll("img")];
    expect(imgs.length).toBeGreaterThan(0);
    for (const img of imgs) expect(img.style.objectPosition).toBe("50% 55%");
  });

  it("muestra los hijos sobre la escena (capa sticky)", () => {
    const { container } = render(
      <ScrollSequence {...base}>
        <p>Titular</p>
      </ScrollSequence>,
    );
    expect(container.querySelector(".sticky")!.textContent).toContain("Titular");
  });

  it("autoplay: avanza solo al montar, sin botón, y emite onLlegada", async () => {
    const onLlegada = vi.fn();
    render(<ScrollSequence {...base} modo="clic" autoplay duracion={0.05} onLlegada={onLlegada} />);
    expect(screen.queryByRole("button")).toBeNull();
    await waitFor(() => expect(onLlegada).toHaveBeenCalledTimes(1));
  });
});

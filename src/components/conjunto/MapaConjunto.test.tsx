// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { eur } from "@/lib/dinero";
import es from "@/messages/es.json";
import type { FichaVilla } from "./fichas";
import { MapaConjunto } from "./MapaConjunto";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/navigation")>()),
  usePathname: () => "/es",
  useRouter: () => ({ push, replace: vi.fn(), prefetch: vi.fn() }),
}));

// T2: se sustituye la transición por un doble que expone sus props y su onLlegada.
const t2 = vi.hoisted(() => ({ props: null as null | Record<string, unknown> }));
vi.mock("@/components/scenes/ScrollSequence", () => ({
  ScrollSequence: (props: Record<string, unknown>) => {
    t2.props = props;
    return <div data-testid="t2" />;
  },
}));

let reduced = false;
beforeEach(() => {
  reduced = false;
  t2.props = null;
  push.mockClear();
  window.matchMedia = ((query: string) => ({
    matches: query === "(prefers-reduced-motion: reduce)" && reduced,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  })) as unknown as typeof window.matchMedia;
});
afterEach(cleanup);

const ficha = (id: FichaVilla["id"], x: number): FichaVilla => ({
  id,
  poligono: [[x, 0], [x + 0.2, 0], [x + 0.2, 1]],
  portada: `/images/villas/${id}/portada.webp`,
  plazas: 15,
  dormitorios: 6,
  dormitoriosPendiente: false,
  precio: eur(523),
  precioEstimado: false,
});
const villas = [ficha("villa-1", 0), ficha("villa-3", 0.25), ficha("villa-4", 0.5), ficha("villa-5", 0.75)];

function renderMapa() {
  return render(
    <NextIntlClientProvider locale="es" messages={es}>
      <MapaConjunto imagen="/aerea.webp" villas={villas} />
    </NextIntlClientProvider>,
  );
}

const parcela = (c: HTMLElement, id: string) => c.querySelector(`polygon[data-villa="${id}"]`) as SVGPolygonElement;
const lista = () => screen.getByRole("list", { name: es.Conjunto.lista });
const boton = (n: number) => within(lista()).getByRole("button", { name: new RegExp(`Villa ${n}`) });

describe("MapaConjunto", () => {
  it("dibuja una parcela por villa sobre la aérea", () => {
    const { container } = renderMapa();
    expect(container.querySelector('img[src="/aerea.webp"]')).toBeTruthy();
    expect(container.querySelectorAll("polygon[data-villa]")).toHaveLength(4);
  });

  it("hover: la parcela se ilumina, el resto se oscurece y aparece la mini ficha", () => {
    const { container } = renderMapa();
    fireEvent.pointerEnter(parcela(container, "villa-4"), { pointerType: "mouse" });
    expect(parcela(container, "villa-4").dataset.estado).toBe("activa");
    expect(parcela(container, "villa-1").dataset.estado).toBe("atenuada");
    expect(screen.getByRole("status").textContent).toContain("Villa 4");
    fireEvent.pointerLeave(parcela(container, "villa-4"), { pointerType: "mouse" });
    expect(parcela(container, "villa-1").dataset.estado).toBe("normal");
    expect(screen.queryByText(/15 plazas/)).toBeNull();
  });

  it("lista alternativa: un botón por villa; al enfocarlo muestra su ficha", () => {
    const { container } = renderMapa();
    expect(within(lista()).getAllByRole("button")).toHaveLength(4);
    fireEvent.focus(boton(3));
    expect(parcela(container, "villa-3").dataset.estado).toBe("activa");
    expect(screen.getByRole("status").textContent).toContain("Villa 3");
  });

  it("táctil: el primer toque muestra la ficha y el segundo inicia T2", () => {
    const { container } = renderMapa();
    const p = parcela(container, "villa-5");
    fireEvent.pointerDown(p, { pointerType: "touch" });
    fireEvent.click(p);
    expect(screen.getByRole("status").textContent).toContain("Villa 5");
    expect(t2.props).toBeNull();
    fireEvent.pointerDown(p, { pointerType: "touch" });
    fireEvent.click(p);
    expect(t2.props).not.toBeNull();
  });

  it("táctil en la lista: el foco del primer toque no cuenta como segundo", () => {
    renderMapa();
    fireEvent.pointerDown(boton(4), { pointerType: "touch" });
    fireEvent.focus(boton(4));
    fireEvent.click(boton(4));
    expect(t2.props).toBeNull();
    fireEvent.pointerDown(boton(4), { pointerType: "touch" });
    fireEvent.click(boton(4));
    expect(t2.props).not.toBeNull();
  });

  it("clic: T2 de la aérea a la portada y navega a la villa solo tras onLlegada", () => {
    const { container } = renderMapa();
    fireEvent.click(parcela(container, "villa-4"));
    expect(t2.props).toMatchObject({ inicio: "/aerea.webp", llegada: "/images/villas/villa-4/portada.webp", autoplay: true });
    expect(push).not.toHaveBeenCalled();
    act(() => (t2.props!.onLlegada as () => void)());
    expect(push).toHaveBeenCalledExactlyOnceWith("/es/villas/villa-4");
  });

  it("teclado: Enter en la lista también inicia T2", () => {
    renderMapa();
    fireEvent.click(boton(1));
    expect(t2.props).toMatchObject({ llegada: "/images/villas/villa-1/portada.webp" });
  });

  it("reduced-motion: navega directamente sin T2", () => {
    reduced = true;
    const { container } = renderMapa();
    fireEvent.click(parcela(container, "villa-4"));
    expect(screen.queryByTestId("t2")).toBeNull();
    expect(push).toHaveBeenCalledExactlyOnceWith("/es/villas/villa-4");
  });
});
